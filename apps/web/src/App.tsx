import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ThemeProvider,
  MarkdownApp,
  FileNode,
  isSupportedFile,
  SyncNotification
} from '@markdown-reader/ui';
import { sampleFiles, sampleMarkdownContent } from './sampleMarkdown';
import {
  saveWorkspaceFolders,
  loadWorkspaceFolders,
  saveActivePath,
  loadActivePath
} from './utils/workspaceStorage';
import { resolveMarkdownLink, getAllFiles, normalizePath } from './utils/pathResolver';

export function App() {
  const [files, setFiles] = useState<FileNode[]>(sampleFiles);
  const [currentFileContent, setCurrentFileContent] = useState<string>(sampleMarkdownContent);
  const [currentFileName, setCurrentFileName] = useState<string>('sample.md');
  const [currentFilePath, setCurrentFilePath] = useState<string>('sample.md');
  const [missingPath, setMissingPath] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncNotifications, setSyncNotifications] = useState<SyncNotification[]>([]);

  // Lưu trữ danh sách file đã Pin trong localStorage
  const [pinnedFilePaths, setPinnedFilePaths] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('markdown_reader_pinned_files');
        if (saved) {
          const list: string[] = JSON.parse(saved);
          // Loại bỏ 'sample.md' demo mặc định trước đó
          const filtered = list.filter(p => p !== 'sample.md');
          return new Set(filtered);
        }
      } catch (e) {}
    }
    return new Set<string>();
  });

  const handleTogglePin = useCallback((filePath: string) => {
    setPinnedFilePaths(prev => {
      const next = new Set(prev);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      try {
        localStorage.setItem(
          'markdown_reader_pinned_files',
          JSON.stringify(Array.from(next))
        );
      } catch (e) {}
      return next;
    });
  }, []);

  // Lưu trữ các DirectoryHandle thực tế trong bộ nhớ phiên làm việc
  const dirHandlesMapRef = useRef<Map<string, any>>(new Map());

  // Thêm thông báo đồng bộ tự biến mất sau 4 giây
  const addSyncNotification = useCallback((type: 'success' | 'updated' | 'deleted', message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setSyncNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setSyncNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  }, []);

  const handleDismissNotification = useCallback((id: string) => {
    setSyncNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Tìm file đầu tiên trong danh sách cây thư mục
  const findFirstFile = useCallback((nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (!node.isDirectory && node.content !== undefined) return node;
      if (node.children) {
        const found = findFirstFile(node.children);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // 1. Khôi phục Workspace và File đang mở khi F5 / mở trang
  useEffect(() => {
    async function restoreWorkspace() {
      try {
        const savedFolders = await loadWorkspaceFolders();
        const savedActivePath = await loadActivePath();

        // Lấy pathname từ URL hiện tại
        const rawUrlPath = window.location.pathname.replace(/^\/+/, '');
        const targetPathFromUrl = rawUrlPath ? decodeURIComponent(rawUrlPath) : '';

        const activeFolders = savedFolders.length > 0 ? savedFolders : sampleFiles;
        setFiles(activeFolders);

        // Xác định file cần mở: ưu tiên từ URL (khi F5 trên URL cụ thể), sau đó đến savedActivePath
        const pathToFind = targetPathFromUrl || savedActivePath || '';
        let targetFile: FileNode | null = null;

        if (pathToFind) {
          targetFile = resolveMarkdownLink(pathToFind, '', activeFolders);
        }

        if (!targetFile) {
          targetFile = findFirstFile(activeFolders);
        }

        if (targetFile) {
          setCurrentFileName(targetFile.name);
          setCurrentFilePath(targetFile.path);
          setCurrentFileContent(targetFile.content || '');

          // Đồng bộ URL với file đang mở (dùng replaceState để không tạo history rác)
          const cleanUrl = '/' + targetFile.path;
          if (window.location.pathname !== cleanUrl) {
            window.history.replaceState(null, '', cleanUrl);
          }
        }
      } catch (err) {
        console.error('Lỗi khi khôi phục workspace:', err);
      } finally {
        setIsInitialized(true);
      }
    }

    restoreWorkspace();
  }, [findFirstFile]);

  // 2. Lắng nghe sự kiện Back/Forward của trình duyệt
  useEffect(() => {
    const handlePopState = () => {
      const pathFromUrl = decodeURIComponent(window.location.pathname.replace(/^\/+/, ''));
      if (pathFromUrl) {
        const target = resolveMarkdownLink(pathFromUrl, '', files);
        if (target) {
          setCurrentFileName(target.name);
          setCurrentFilePath(target.path);
          setCurrentFileContent(target.content || '');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [files]);

  // 3. Xử lý khi chọn file trong Sidebar
  const handleFileSelect = useCallback((file: FileNode) => {
    if (file.content !== undefined) {
      setCurrentFileContent(file.content);
      setCurrentFileName(file.name);
      setCurrentFilePath(file.path);
      setMissingPath(null);

      // Lưu trạng thái và cập nhật URL
      saveActivePath(file.path);
      const newUrl = '/' + file.path;
      if (window.location.pathname !== newUrl) {
        window.history.pushState(null, '', newUrl);
      }
    }
  }, []);

  // 4. Xử lý khi click vào hyperlink trong nội dung Markdown
  const handleNavigateLink = (href: string) => {
    const targetFile = resolveMarkdownLink(href, currentFilePath, files);
    if (targetFile) {
      setMissingPath(null);
      handleFileSelect(targetFile);
    } else {
      console.warn('Không tìm thấy tệp liên kết trong workspace:', href);
      setMissingPath(href);
    }
  };

  // Hàm đệ quy đọc toàn bộ thư mục từ FileSystemDirectoryHandle (hỗ trợ .md, .json, .xml, .cs, .ts, .js, .html...)
  const readDirectoryRecursive = async (
    handle: any,
    currentPath = ''
  ): Promise<FileNode[]> => {
    const result: FileNode[] = [];
    for await (const entry of handle.values()) {
      const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
      if (entry.kind === 'directory') {
        const children = await readDirectoryRecursive(entry, entryPath);
        result.push({
          id: entryPath,
          name: entry.name,
          path: entryPath,
          isDirectory: true,
          children
        });
      } else if (entry.kind === 'file' && isSupportedFile(entry.name)) {
        const file = await entry.getFile();
        const text = await file.text();
        result.push({
          id: entryPath,
          name: entry.name,
          path: entryPath,
          isDirectory: false,
          content: text
        });
      }
    }
    return result;
  };

  // 5. Thêm thư mục mới vào Workspace (hỗ trợ nhiều thư mục cùng lúc: year=2026, year=2025,...)
  const handleAddFolder = async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        alert('Trình duyệt không hỗ trợ File System Access API. Vui lòng dùng Chrome hoặc Edge.');
        return;
      }

      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker();
      const folderName = dirHandle.name;

      // Lưu handle để phục vụ tính năng Sync / Refresh tự động
      dirHandlesMapRef.current.set(folderName, dirHandle);

      // Đọc toàn bộ thư mục con và các file được hỗ trợ
      const children = await readDirectoryRecursive(dirHandle, folderName);

      const newRootFolder: FileNode = {
        id: folderName,
        name: folderName,
        path: folderName,
        isDirectory: true,
        children
      };

      // Nếu đang dùng sampleFiles thì thay thế, nếu đã có thư mục thật thì thêm vào danh sách
      const isCurrentlySample = files === sampleFiles || files.some(f => f.id === 'f1');
      const baseFiles = isCurrentlySample ? [] : files.filter(f => f.id !== folderName);
      const updatedFiles = [...baseFiles, newRootFolder];

      setFiles(updatedFiles);
      await saveWorkspaceFolders(updatedFiles);

      // Tự động mở file đầu tiên trong thư mục mới thêm
      const firstNewFile = findFirstFile([newRootFolder]);
      if (firstNewFile) {
        handleFileSelect(firstNewFile);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Lỗi khi thêm thư mục:', err);
      }
    }
  };

  // 6. Gỡ bỏ một thư mục khỏi Workspace
  const handleRemoveFolder = async (folderId: string) => {
    dirHandlesMapRef.current.delete(folderId);
    const updatedFiles = files.filter(f => f.id !== folderId);
    if (updatedFiles.length === 0) {
      setFiles(sampleFiles);
      await saveWorkspaceFolders([]);
      const sample = findFirstFile(sampleFiles);
      if (sample) handleFileSelect(sample);
    } else {
      setFiles(updatedFiles);
      await saveWorkspaceFolders(updatedFiles);

      // Nếu file đang xem thuộc thư mục vừa gỡ thì chuyển sang file đầu tiên còn lại
      if (currentFilePath.startsWith(folderId)) {
        const nextFile = findFirstFile(updatedFiles);
        if (nextFile) handleFileSelect(nextFile);
      }
    }
  };

  // 7. Đồng bộ & Làm mới trạng thái thực tế từ đĩa (Sync Feature)
  const handleSyncWorkspace = useCallback(async (isManual = true) => {
    if (dirHandlesMapRef.current.size === 0) {
      if (isManual) {
        addSyncNotification(
          'updated',
          'Chưa mở thư mục đĩa thực tế nào (đang xem thư mục mẫu).'
        );
      }
      return;
    }

    setIsSyncing(true);
    try {
      let hasChanges = false;
      const updatedFolderList: FileNode[] = [];

      for (const [folderName, handle] of dirHandlesMapRef.current.entries()) {
        try {
          const freshChildren = await readDirectoryRecursive(handle, folderName);
          updatedFolderList.push({
            id: folderName,
            name: folderName,
            path: folderName,
            isDirectory: true,
            children: freshChildren
          });
        } catch (readErr) {
          console.warn(`Không thể đọc lại thư mục ${folderName}:`, readErr);
        }
      }

      if (updatedFolderList.length > 0) {
        setFiles(updatedFolderList);
        await saveWorkspaceFolders(updatedFolderList);

        // Kiểm tra xem file đang mở có bị sửa đổi hoặc bị xóa trên đĩa không
        const allFreshFiles = getAllFiles(updatedFolderList);
        const currentFileInFresh = allFreshFiles.find(
          f => f.path === currentFilePath || normalizePath(f.path) === normalizePath(currentFilePath)
        );

        if (currentFileInFresh) {
          // File vẫn tồn tại, kiểm tra nội dung có đổi không
          if (currentFileInFresh.content !== currentFileContent) {
            hasChanges = true;
            setCurrentFileContent(currentFileInFresh.content || '');
            addSyncNotification(
              'updated',
              `Tệp "${currentFileName}" đã được tự động cập nhật nội dung mới từ đĩa.`
            );
          }
        } else {
          // File đã BỊ XÓA khỏi đĩa!
          hasChanges = true;
          addSyncNotification(
            'deleted',
            `⚠️ Tệp "${currentFileName}" đã bị xóa khỏi đĩa và được gỡ khỏi chế độ xem.`
          );
          // Chuyển sang file đầu tiên còn lại
          const fallbackFile = findFirstFile(updatedFolderList);
          if (fallbackFile) {
            handleFileSelect(fallbackFile);
          }
        }

        if (isManual && !hasChanges) {
          addSyncNotification(
            'success',
            `Đã đồng bộ thành công ${updatedFolderList.length} thư mục từ đĩa!`
          );
        }
      }
    } catch (syncErr) {
      console.error('Lỗi khi đồng bộ workspace:', syncErr);
    } finally {
      setIsSyncing(false);
    }
  }, [
    currentFilePath,
    currentFileName,
    currentFileContent,
    addSyncNotification,
    findFirstFile,
    handleFileSelect
  ]);

  // Tự động kiểm tra đồng bộ khi người dùng click quay lại cửa sổ trình duyệt (Window focus)
  useEffect(() => {
    const handleWindowFocus = () => {
      if (dirHandlesMapRef.current.size > 0) {
        handleSyncWorkspace(false);
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [handleSyncWorkspace]);

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0d0f14] text-[#cdd3df] text-sm font-sans">
        Đang tải không gian làm việc...
      </div>
    );
  }

  return (
    <ThemeProvider>
      <MarkdownApp
        initialContent={currentFileContent}
        initialFileName={currentFileName}
        activeFilePath={currentFilePath}
        files={files}
        pinnedFilePaths={pinnedFilePaths}
        onTogglePin={handleTogglePin}
        missingPath={missingPath}
        onClearMissingPath={() => setMissingPath(null)}
        onOpenFolder={handleAddFolder}
        onAddFolder={handleAddFolder}
        onRemoveFolder={handleRemoveFolder}
        onSync={() => handleSyncWorkspace(true)}
        isSyncing={isSyncing}
        syncNotifications={syncNotifications}
        onDismissSyncNotification={handleDismissNotification}
        onFileSelect={handleFileSelect}
        onNavigateLink={handleNavigateLink}
        onContentChange={setCurrentFileContent}
      />
    </ThemeProvider>
  );
}
