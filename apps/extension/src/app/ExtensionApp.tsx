import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ThemeProvider,
  MarkdownApp,
  FileNode,
  SyncNotification
} from '@markdown-reader/ui';
import { UploadCloud } from 'lucide-react';
import { memoryManager } from '../memory/memoryManager';
import { checkFileSchemeAccess } from '../utils/permissionManager';
import {
  saveDirectoryHandle,
  getAllDirectoryHandles,
  findMatchingHandleForPath,
  verifyDirectoryPermission
} from '../storage/directoryStore';
import { scanDirectoryHandle, scanWebkitEntry } from '../utils/fileSystemScanner';

interface ExtensionAppProps {
  initialRawContent?: string;
}

export const ExtensionApp: React.FC<ExtensionAppProps> = ({ initialRawContent = '' }) => {
  const isLocalFile = window.location.protocol === 'file:';
  const isWebUrl = window.location.protocol.startsWith('http');

  // Lấy tên file và đường dẫn từ window.location
  const currentPath = decodeURIComponent(window.location.pathname.replace(/^\/+/, ''));
  const pathParts = useMemo(() => currentPath.split(/[\\/]/), [currentPath]);
  const currentName = pathParts[pathParts.length - 1] || 'document.md';

  // Xác định thư mục cha trực tiếp của file hiện tại
  const currentFolder = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'Workspace';

  // Danh sách các thư mục cha tiềm năng (loại bỏ C:, Users, Windows...)
  const candidateFolders = useMemo(() => {
    if (!isLocalFile) return [];
    return pathParts
      .slice(0, -1)
      .filter(f => f && !f.includes(':') && !['Users', 'Windows', 'Program Files'].includes(f));
  }, [isLocalFile, pathParts]);

  // Ưu tiên thư mục cấp dự án (ví dụ country=hk)
  const bestCandidateFolder = useMemo(() => {
    if (candidateFolders.length === 0) return currentFolder;
    const special = candidateFolders.find(f => f.includes('='));
    if (special) return special;
    if (candidateFolders.length >= 2) {
      return candidateFolders[candidateFolders.length - 2];
    }
    return candidateFolders[candidateFolders.length - 1] || currentFolder;
  }, [candidateFolders, currentFolder]);

  const [content, setContent] = useState<string>(initialRawContent);
  const [fileName, setFileName] = useState<string>(currentName);
  const [activeFilePath, setActiveFilePath] = useState<string>(currentPath || currentName);
  const activeFilePathRef = useRef<string>(currentPath || currentName);
  const hasAutoScannedRef = useRef<boolean>(false);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncNotifications, setSyncNotifications] = useState<SyncNotification[]>([]);
  const [isLocalAllowed, setIsLocalAllowed] = useState<boolean | null>(null);

  // Giữ ref luôn đồng bộ với state
  useEffect(() => {
    activeFilePathRef.current = activeFilePath;
  }, [activeFilePath]);

  // Trạng thái kéo thả tệp/thư mục (Drag and Drop)
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const dragCounterRef = useRef<number>(0);

  // Danh sách file ghim
  const [pinnedFilePaths, setPinnedFilePaths] = useState<Set<string>>(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('markdown_reader_pinned_files');
        if (saved) return new Set(JSON.parse(saved));
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

  // Kiểm tra quyền File URLs nếu là local file
  useEffect(() => {
    if (isLocalFile) {
      checkFileSchemeAccess().then(setIsLocalAllowed);
    }
  }, [isLocalFile]);

  // Tìm trong cây thư mục file khớp với tên hoặc đường dẫn
  const findMatchingNode = (nodes: FileNode[], targetNameOrPath: string): FileNode | null => {
    for (const node of nodes) {
      if (!node.isDirectory) {
        if (
          node.path === targetNameOrPath ||
          node.name === targetNameOrPath ||
          node.path.endsWith(targetNameOrPath) ||
          targetNameOrPath.endsWith(node.name)
        ) {
          return node;
        }
      }
      if (node.children) {
        const found = findMatchingNode(node.children, targetNameOrPath);
        if (found) return found;
      }
    }
    return null;
  };

  // 1. Quét trực tiếp thư mục máy tính qua Native Messaging Host (0 POPUP, SIÊU TỐC)
  const scanDirectoryViaNative = useCallback(
    async (dirPath: string, preserveActiveFile: boolean = false): Promise<boolean> => {
      return new Promise((resolve) => {
        if (!chrome?.runtime?.sendMessage) {
          console.warn('[MarkdownReader] chrome.runtime.sendMessage is not available');
          resolve(false);
          return;
        }

        try {
          chrome.runtime.sendMessage(
            {
              type: 'NATIVE_SCAN_DIRECTORY',
              path: dirPath,
              activeFileName: currentName
            },
            (response) => {
              if (chrome.runtime?.lastError) {
                console.error('[MarkdownReader] Native Host connection error:', chrome.runtime.lastError.message);
                setSyncNotifications([
                  {
                    id: String(Date.now()),
                    type: 'deleted',
                    message: `Lỗi kết nối Native Host: ${chrome.runtime.lastError.message}`
                  }
                ]);
                resolve(false);
                return;
              }

              if (response && response.success && response.rootNode) {
                setFiles(prevFiles => {
                  memoryManager.handleRootChange(response.rootNode.name, prevFiles, () => {});
                  return [response.rootNode];
                });

                // Nếu đang navigate hoặc xem 1 file khác, ưu tiên giữ file đó
                const currentActive = activeFilePathRef.current;
                const matched = (preserveActiveFile && currentActive)
                  ? (findMatchingNode([response.rootNode], currentActive) || findMatchingNode([response.rootNode], currentName))
                  : findMatchingNode([response.rootNode], currentName);

                if (matched) {
                  setActiveFilePath(matched.path);
                  activeFilePathRef.current = matched.path;
                  setFileName(matched.name);
                  if (matched.content && !preserveActiveFile) {
                    setContent(matched.content);
                  }
                }

                setSyncNotifications([
                  {
                    id: String(Date.now()),
                    type: 'updated',
                    message: `Đã nạp trực tiếp toàn bộ thư mục "${response.rootNode.name}" (${response.fileCount} tệp)`
                  }
                ]);
                resolve(true);
              } else {
                console.warn('[MarkdownReader] Native scan returned error:', response?.error);
                setSyncNotifications([
                  {
                    id: String(Date.now()),
                    type: 'deleted',
                    message: `Không thể đọc thư mục: ${response?.error || 'Native Host không phản hồi'}`
                  }
                ]);
                resolve(false);
              }
            }
          );
        } catch (e: any) {
          console.error('[MarkdownReader] Exception invoking native scan:', e);
          setSyncNotifications([
            {
              id: String(Date.now()),
              type: 'deleted',
              message: `Lỗi: ${e?.message || e}`
            }
          ]);
          resolve(false);
        }
      });
    },
    [currentName]
  );

  // 2. Nạp cây thư mục từ FileSystemDirectoryHandle (Fallback)
  const loadDirectoryFromHandle = useCallback(
    async (dirHandle: FileSystemDirectoryHandle) => {
      setIsSyncing(true);
      try {
        await saveDirectoryHandle(dirHandle, currentPath);

        memoryManager.handleRootChange(dirHandle.name, files, trimmed => {
          setFiles(trimmed);
        });

        const { rootNode, fileCount, dirCount } = await scanDirectoryHandle(
          dirHandle,
          currentName
        );

        setFiles([rootNode]);

        const matched = findMatchingNode([rootNode], currentName);
        if (matched) {
          setActiveFilePath(matched.path);
          setFileName(matched.name);
          if (matched.content) {
            setContent(matched.content);
          }
        }

        setSyncNotifications([
          {
            id: String(Date.now()),
            type: 'updated',
            message: `Đã nạp toàn bộ thư mục "${dirHandle.name}" (${fileCount} tệp, ${dirCount} thư mục)`
          }
        ]);
      } catch (err) {
        console.error('Lỗi khi nạp thư mục từ handle:', err);
      } finally {
        setIsSyncing(false);
      }
    },
    [currentName, currentPath, files]
  );

  // 3. Tự động nạp cây thư mục ngay khi mở file local (Chỉ chạy 1 lần duy nhất khi khởi tạo)
  useEffect(() => {
    if (!isLocalFile || hasAutoScannedRef.current) return;
    hasAutoScannedRef.current = true;

    // Xác định thư mục cha ưu tiên (ví dụ country=hk)
    const targetParent = bestCandidateFolder;
    const targetIdx = pathParts.findIndex(p => p.toLowerCase() === targetParent.toLowerCase());
    const candidatePath =
      targetIdx !== -1
        ? pathParts.slice(0, targetIdx + 1).join('/')
        : pathParts.slice(0, -1).join('/');

    // Thử nạp ngay qua Native Messaging Host (0 popup)
    scanDirectoryViaNative(candidatePath).then((success) => {
      if (!success) {
        // Fallback kiểm tra IndexedDB nếu Native Host chưa chạy
        findMatchingHandleForPath(pathParts).then(async matched => {
          if (matched) {
            const isGranted = await verifyDirectoryPermission(matched.handle, false);
            if (isGranted) {
              await loadDirectoryFromHandle(matched.handle);
            }
          }
        });
      }
    });
  }, [isLocalFile]);

  // 4. Khởi tạo ban đầu (Web URL hoặc tạo node tạm cho local file nếu chưa nạp được)
  useEffect(() => {
    if (isWebUrl) {
      const webDomain = window.location.hostname || 'Web Document';
      const singleNode: FileNode = {
        id: currentPath || 'web-doc',
        name: currentName,
        path: `${webDomain}/${currentPath || currentName}`,
        isDirectory: false,
        content: initialRawContent
      };
      setFiles([singleNode]);
    } else if (isLocalFile && files.length === 0) {
      const localNode: FileNode = {
        id: currentPath,
        name: currentName,
        path: currentPath,
        isDirectory: false,
        content: initialRawContent
      };

      setFiles([
        {
          id: currentFolder,
          name: currentFolder,
          path: currentFolder,
          isDirectory: true,
          children: [localNode]
        }
      ]);
    }
  }, [isWebUrl, isLocalFile, currentPath, currentName, currentFolder, initialRawContent, files.length]);

  // 5. Khi người dùng click vào một thư mục trên Header Breadcrumb: Nạp luôn thư mục đó!
  const handleBreadcrumbFolderClick = async (folderName: string, folderIndex: number, fullFolderPath?: string) => {
    // Bỏ qua ổ đĩa hệ thống
    if (folderName.includes(':') || ['Users', 'Windows', 'Program Files'].includes(folderName)) {
      return;
    }

    // Ghép đường dẫn từ đầu tới đúng folder vừa click
    const targetPath = fullFolderPath || pathParts.slice(0, folderIndex + 1).join('/');

    setIsSyncing(true);
    try {
      // a. Ưu tiên nạp trực tiếp qua Native Host (KHÔNG POPUP, GIỮ FILE ĐANG XEM)
      const ok = await scanDirectoryViaNative(targetPath, true);
      if (ok) return;

      // b. Kiểm tra IndexedDB
      const allRecords = await getAllDirectoryHandles();
      const directMatch = allRecords.find(
        r => r.name.toLowerCase() === folderName.toLowerCase()
      );
      if (directMatch) {
        const hasPerm = await verifyDirectoryPermission(directMatch.handle, false);
        if (hasPerm) {
          await loadDirectoryFromHandle(directMatch.handle);
          return;
        }
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.warn('Lỗi nạp thư mục từ breadcrumb:', err);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // 6. Mở thư mục thủ công
  const handleOpenLocalFolder = async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        alert('Trình duyệt không hỗ trợ File System Access API.');
        return;
      }

      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker({
        id: 'markdown_workspace',
        startIn: 'downloads'
      });
      if (dirHandle) {
        await loadDirectoryFromHandle(dirHandle);
      }
    } catch (e) {
      console.log('User cancelled directory picker');
    }
  };

  // 7. Xử lý Kéo - Thả thư mục (Drag and Drop Folder)
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDraggingOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDraggingOver(false);

    if (!e.dataTransfer.items || e.dataTransfer.items.length === 0) return;

    for (let i = 0; i < e.dataTransfer.items.length; i++) {
      const item = e.dataTransfer.items[i];

      if (typeof (item as any).getAsFileSystemHandle === 'function') {
        try {
          const handle = await (item as any).getAsFileSystemHandle();
          if (handle && handle.kind === 'directory') {
            await loadDirectoryFromHandle(handle as FileSystemDirectoryHandle);
            return;
          }
        } catch (err) {}
      }

      if (typeof (item as any).webkitGetAsEntry === 'function') {
        const entry = (item as any).webkitGetAsEntry();
        if (entry && entry.isDirectory) {
          setIsSyncing(true);
          try {
            const rootNode = await scanWebkitEntry(entry, currentName);
            setFiles([rootNode]);
            setSyncNotifications([
              {
                id: String(Date.now()),
                type: 'updated',
                message: `Đã nạp toàn bộ thư mục "${entry.name}" từ thao tác Kéo-Thả!`
              }
            ]);
          } finally {
            setIsSyncing(false);
          }
          return;
        }
      }
    }
  };

  // Hàm tiện ích: tự động format JSON có thụt dòng chuẩn
  const formatIfJson = (text: string, name: string): string => {
    if (name.toLowerCase().endsWith('.json')) {
      try {
        const parsed = JSON.parse(text);
        return JSON.stringify(parsed, null, 2);
      } catch (e) {
        return text;
      }
    }
    return text;
  };

  // 8. Chọn tệp từ cây thư mục (Hỗ trợ navigate mượt mà, đổi URL, format JSON)
  const handleSelectFile = useCallback(
    async (file: FileNode) => {
      // a. Cập nhật ngay lập tức path và name để sidebar active đúng node
      activeFilePathRef.current = file.path;
      setFileName(file.name);
      setActiveFilePath(file.path);

      // b. Cập nhật thanh địa chỉ URL trình duyệt (không reload)
      try {
        const cleanPath = file.path.replace(/^[/\\]+/, '').replace(/\\/g, '/');
        const newUrl = isLocalFile ? `file:///${cleanPath}` : `/${cleanPath}`;
        try {
          window.history.replaceState({ path: file.path }, '', newUrl);
        } catch {
          window.history.replaceState({ path: file.path }, '', `/${cleanPath}`);
        }
        document.title = `${file.name} - Markdown Reader`;
      } catch (e) {
        console.warn('Không thể cập nhật URL history:', e);
      }

      // c. Nạp nội dung (đã có sẵn trong RAM hoặc đọc từ đĩa)
      if (file.content !== undefined) {
        const formatted = formatIfJson(file.content, file.name);
        setContent(formatted);
      } else {
        setIsSyncing(true);
        if (chrome?.runtime?.sendMessage) {
          chrome.runtime.sendMessage(
            { type: 'NATIVE_READ_FILE', path: file.path },
            (res) => {
              setIsSyncing(false);
              if (res && res.success && res.content !== undefined) {
                const formatted = formatIfJson(res.content, file.name);
                setContent(formatted);
                file.content = formatted;
              } else {
                // Fallback fetch file://
                fetch(`file:///${file.path.replace(/^[/\\]+/, '').replace(/\\/g, '/')}`)
                  .then(r => r.text())
                  .then(text => {
                    const formatted = formatIfJson(text, file.name);
                    setContent(formatted);
                    file.content = formatted;
                  })
                  .catch((err) => {
                    console.error('Lỗi đọc file:', err);
                    setSyncNotifications([
                      {
                        id: String(Date.now()),
                        type: 'deleted',
                        message: `Không thể đọc file "${file.name}": ${res?.error || err.message}`
                      }
                    ]);
                  });
              }
            }
          );
        } else {
          setIsSyncing(false);
        }
      }
    },
    [isLocalFile]
  );

  // Lắng nghe sự kiện Back / Forward của trình duyệt để điều hướng tệp
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const statePath = e.state?.path;
      if (statePath && files.length > 0) {
        const found = findMatchingNode(files, statePath);
        if (found) {
          handleSelectFile(found);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [files, handleSelectFile]);

  // 9. Đồng bộ / làm mới file từ đĩa
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const targetParent = bestCandidateFolder;
      const targetIdx = pathParts.findIndex(p => p.toLowerCase() === targetParent.toLowerCase());
      const candidatePath =
        targetIdx !== -1
          ? pathParts.slice(0, targetIdx + 1).join('/')
          : pathParts.slice(0, -1).join('/');

      const ok = await scanDirectoryViaNative(candidatePath);
      if (!ok) {
        const res = await fetch(window.location.href);
        if (res.ok) {
          const text = await res.text();
          setContent(text);
          setSyncNotifications([
            {
              id: String(Date.now()),
              type: 'updated',
              message: `Đã cập nhật nội dung tệp ${currentName}`
            }
          ]);
        }
      }
    } catch (e) {
      console.error('Sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <ThemeProvider>
      <div
        className="relative h-screen w-screen overflow-hidden font-sans"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <MarkdownApp
          initialContent={content}
          initialFileName={fileName}
          activeFilePath={activeFilePath}
          files={files}
          pinnedFilePaths={pinnedFilePaths}
          onTogglePin={handleTogglePin}
          onOpenFolder={isLocalFile ? handleOpenLocalFolder : undefined}
          onAddFolder={isLocalFile ? handleOpenLocalFolder : undefined}
          onSync={handleSync}
          isSyncing={isSyncing}
          syncNotifications={syncNotifications}
          onDismissSyncNotification={id =>
            setSyncNotifications(prev => prev.filter(n => n.id !== id))
          }
          onFileSelect={handleSelectFile}
          onContentChange={setContent}
          hideFilesTab={isWebUrl}
          sidebarBanner={undefined}
          onBreadcrumbFolderClick={handleBreadcrumbFolderClick}
        />

        {/* Lớp phủ trực quan khi Kéo - Thả thư mục (Drag & Drop Overlay) */}
        {isDraggingOver && (
          <div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 backdrop-blur-md transition-all pointer-events-none"
            style={{
              backgroundColor: 'rgba(13, 15, 20, 0.85)',
              border: '3px dashed var(--md-accent)'
            }}
          >
            <div
              className="p-6 rounded-2xl flex flex-col items-center gap-3 shadow-2xl text-center max-w-md animate-bounce"
              style={{
                backgroundColor: 'var(--md-bg-secondary)',
                border: '1px solid var(--md-border)'
              }}
            >
              <UploadCloud size={48} style={{ color: 'var(--md-accent)' }} />
              <h3 className="text-base font-bold" style={{ color: 'var(--md-text-heading)' }}>
                Thả thư mục vào đây
              </h3>
              <p className="text-xs opacity-80" style={{ color: 'var(--md-text-muted)' }}>
                Markdown Reader sẽ tự động quét đệ quy toàn bộ thư mục và hiển thị đầy đủ cây tài liệu!
              </p>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
};
