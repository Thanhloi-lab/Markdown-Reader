import React, { useState, useMemo, useRef, useEffect } from 'react';
import { extractToc, formatMarkdown } from '@markdown-reader/core';
import { Sidebar, SidebarTab } from './Sidebar/Sidebar';
import { FileNode } from './Sidebar/FileTreeTab';
import { Toolbar, ViewMode } from './Toolbar/Toolbar';
import { MarkdownViewer } from './Viewer/MarkdownViewer';
import { CodeFileViewer } from './Viewer/CodeFileViewer';
import { QuickEditor } from './Editor/QuickEditor';
import { ThemeCustomizerModal } from './Theme/ThemeCustomizerModal';
import { MissingFileToast } from './Notification/MissingFileToast';
import { SyncStatusToast, SyncNotification } from './Notification/SyncStatusToast';
import { getFileTypeInfo } from '../utils/fileTypeUtils';

export interface MarkdownAppProps {
  initialContent?: string;
  initialFileName?: string;
  activeFilePath?: string;
  files?: FileNode[];
  pinnedFilePaths?: Set<string>;
  onTogglePin?: (filePath: string) => void;
  missingPath?: string | null;
  onClearMissingPath?: () => void;
  onOpenFolder?: () => void;
  onAddFolder?: () => void;
  onRemoveFolder?: (folderId: string) => void;
  onSync?: () => void;
  isSyncing?: boolean;
  syncNotifications?: SyncNotification[];
  onDismissSyncNotification?: (id: string) => void;
  onFileSelect?: (file: FileNode) => void;
  onNavigateLink?: (href: string) => void;
  onContentChange?: (content: string) => void;
  hideFilesTab?: boolean;
  sidebarBanner?: React.ReactNode;
  onBreadcrumbFolderClick?: (folderName: string, folderIndex: number, fullFolderPath?: string) => void;
}

export const MarkdownApp: React.FC<MarkdownAppProps> = ({
  initialContent = '',
  initialFileName = 'sample.md',
  activeFilePath: propActiveFilePath,
  files = [],
  pinnedFilePaths,
  onTogglePin,
  missingPath = null,
  onClearMissingPath,
  onOpenFolder,
  onAddFolder,
  onRemoveFolder,
  onSync,
  isSyncing = false,
  syncNotifications = [],
  onDismissSyncNotification,
  onFileSelect,
  onNavigateLink,
  onContentChange,
  hideFilesTab = false,
  sidebarBanner,
  onBreadcrumbFolderClick
}) => {
  const [content, setContent] = useState<string>(initialContent);
  const [fileName, setFileName] = useState<string>(initialFileName);
  const [activeFilePath, setActiveFilePath] = useState<string>(
    propActiveFilePath || initialFileName
  );
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('toc');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [activeHeadingSlug, setActiveHeadingSlug] = useState<string>('');
  const [isFormatting, setIsFormatting] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);

  const viewerContainerRef = useRef<HTMLDivElement>(null);

  // Nhận diện loại file hiện tại (Markdown hay Code/Data như JSON, XML, CS, TS...)
  const fileType = useMemo(() => getFileTypeInfo(fileName), [fileName]);

  // Cập nhật khi prop content hoặc activeFilePath thay đổi
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    setFileName(initialFileName);
  }, [initialFileName]);

  useEffect(() => {
    if (propActiveFilePath) {
      setActiveFilePath(propActiveFilePath);
    }
  }, [propActiveFilePath]);

  // Tự động phân tích và trích xuất Table of Contents nếu là file Markdown
  const tocItems = useMemo(() => {
    if (!fileType.isMarkdown) return [];
    return extractToc(content);
  }, [content, fileType.isMarkdown]);

  // Xử lý khi người dùng chọn tiêu đề trên TOC
  const handleSelectHeading = (slug: string) => {
    setActiveHeadingSlug(slug);
    if (viewerContainerRef.current) {
      const headingEl = viewerContainerRef.current.querySelector(`#${slug}`);
      if (headingEl) {
        headingEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Xử lý định dạng tài liệu (Markdown hoặc JSON)
  const handleFormat = async () => {
    setIsFormatting(true);
    try {
      if (fileType.language === 'json') {
        const parsed = JSON.parse(content);
        const formatted = JSON.stringify(parsed, null, 2);
        setContent(formatted);
        onContentChange?.(formatted);
      } else if (fileType.isMarkdown) {
        const formatted = await formatMarkdown(content);
        setContent(formatted);
        onContentChange?.(formatted);
      }
    } catch (err) {
      console.error('Format failed:', err);
    } finally {
      setIsFormatting(false);
    }
  };

  const handleContentUpdate = (newContent: string) => {
    setContent(newContent);
    onContentChange?.(newContent);
  };

  const handleSelectFile = (file: FileNode) => {
    if (!file.isDirectory) {
      setActiveFilePath(file.path);
      setFileName(file.name);
      if (file.content !== undefined) {
        setContent(file.content);
        onContentChange?.(file.content);
      }
      onFileSelect?.(file);
    }
  };

  // Điều hướng bằng liên kết: tự động chuyển sang tab 'files' để nhìn rõ file đang nhảy tới
  const handleInternalNavigateLink = (href: string) => {
    setSidebarTab('files');
    onNavigateLink?.(href);
  };

  return (
    <div
      className="flex h-screen w-screen overflow-hidden select-text"
      style={{
        backgroundColor: 'var(--md-bg-primary)',
        color: 'var(--md-text-primary)'
      }}
    >
      {/* Sidebar 2 tab (Cây thư mục & Mục lục TOC) */}
      <Sidebar
        activeTab={sidebarTab}
        onTabChange={setSidebarTab}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        tocItems={tocItems}
        activeHeadingSlug={activeHeadingSlug}
        onSelectHeading={handleSelectHeading}
        files={files}
        activeFilePath={activeFilePath}
        pinnedFilePaths={pinnedFilePaths}
        onTogglePin={onTogglePin}
        onSelectFile={handleSelectFile}
        onOpenFolder={onOpenFolder}
        onAddFolder={onAddFolder}
        onRemoveFolder={onRemoveFolder}
        onSync={onSync}
        isSyncing={isSyncing}
        hideFilesTab={hideFilesTab}
        sidebarBanner={sidebarBanner}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Toolbar */}
        <Toolbar
          fileName={fileName}
          filePath={activeFilePath}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onFormatDocument={handleFormat}
          onOpenThemeCustomizer={() => setIsThemeModalOpen(true)}
          isFormatting={isFormatting}
          onBreadcrumbFolderClick={onBreadcrumbFolderClick}
        />

        {/* View Container (Preview / Split / Editor) */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {(viewMode === 'editor' || viewMode === 'split') && (
            <div className={viewMode === 'split' ? 'w-1/2 h-full' : 'w-full h-full'}>
              <QuickEditor
                key={`editor-${activeFilePath || fileName}`}
                content={content}
                onChange={handleContentUpdate}
              />
            </div>
          )}

          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className={viewMode === 'split' ? 'w-1/2 h-full' : 'w-full h-full'}>
              {fileType.isMarkdown ? (
                <MarkdownViewer
                  key={`md-${activeFilePath || fileName}`}
                  content={content}
                  onActiveHeadingChange={setActiveHeadingSlug}
                  onSelectHeading={handleSelectHeading}
                  onNavigateLink={handleInternalNavigateLink}
                  scrollContainerRef={viewerContainerRef}
                />
              ) : (
                <CodeFileViewer
                  key={`code-${activeFilePath || fileName}`}
                  fileName={fileName}
                  content={content}
                  onContentChange={handleContentUpdate}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Tùy chỉnh màu sắc & Theme động */}
      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      {/* Thông báo Toast khi click hyperlink tới file không có trong workspace */}
      <MissingFileToast
        missingPath={missingPath}
        onClose={() => onClearMissingPath?.()}
        onAddFolder={onAddFolder}
      />

      {/* Thông báo Toast đồng bộ và cập nhật tệp/thư mục */}
      <SyncStatusToast
        notifications={syncNotifications}
        onDismiss={id => onDismissSyncNotification?.(id)}
      />
    </div>
  );
};
