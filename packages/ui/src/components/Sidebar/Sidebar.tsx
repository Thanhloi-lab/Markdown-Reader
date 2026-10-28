import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Folder,
  AlignLeft,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  X
} from 'lucide-react';
import { TocItem } from '@markdown-reader/core';
import { TocTab } from './TocTab';
import { FileTreeTab, FileNode } from './FileTreeTab';

export type SidebarTab = 'files' | 'toc';

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  tocItems: TocItem[];
  activeHeadingSlug: string;
  onSelectHeading: (slug: string) => void;
  files: FileNode[];
  activeFilePath?: string;
  pinnedFilePaths?: Set<string>;
  onTogglePin?: (filePath: string) => void;
  onSelectFile: (file: FileNode) => void;
  onOpenFolder?: () => void;
  onAddFolder?: () => void;
  onRemoveFolder?: (folderId: string) => void;
  onSync?: () => void;
  isSyncing?: boolean;
  hideFilesTab?: boolean;
  sidebarBanner?: React.ReactNode;
  onLoadChildren?: (folder: FileNode) => Promise<void> | void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen,
  onToggleOpen,
  tocItems,
  activeHeadingSlug,
  onSelectHeading,
  files,
  activeFilePath,
  pinnedFilePaths,
  onTogglePin,
  onSelectFile,
  onOpenFolder,
  onAddFolder,
  onRemoveFolder,
  onSync,
  isSyncing = false,
  hideFilesTab = false,
  sidebarBanner,
  onLoadChildren
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Lưu trạng thái các thư mục đã mở rộng để không bị reset khi chuyển đổi giữa tab Files và TOC
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    root: true
  });

  // Tự động chuyển về tab toc nếu tab files bị ẩn
  useEffect(() => {
    if (hideFilesTab && activeTab === 'files') {
      onTabChange('toc');
    }
  }, [hideFilesTab, activeTab, onTabChange]);

  // Độ rộng có thể kéo co giãn (Resizable Sidebar)
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('markdown_reader_sidebar_width');
        if (saved) return Math.max(220, Math.min(800, parseInt(saved, 10)));
      } catch (e) {}
    }
    return 300;
  });

  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = Math.max(220, Math.min(window.innerWidth * 0.7, e.clientX));
        setSidebarWidth(newWidth);
        try {
          localStorage.setItem('markdown_reader_sidebar_width', String(Math.round(newWidth)));
        } catch (e) {}
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, resize, stopResizing]);

  if (!isOpen) {
    return (
      <div
        className="w-12 h-full flex flex-col items-center py-3 border-r transition-all select-none shrink-0"
        style={{
          backgroundColor: 'var(--md-bg-sidebar)',
          borderColor: 'var(--md-border)'
        }}
      >
        <button
          onClick={onToggleOpen}
          className="p-2 rounded transition-colors"
          style={{ color: 'var(--md-text-secondary)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--md-bg-hover)';
            (e.currentTarget as HTMLElement).style.color = 'var(--md-text-heading)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--md-text-secondary)';
          }}
          title="Mở thanh bên"
        >
          <PanelLeftOpen size={18} />
        </button>
      </div>
    );
  }

  return (
    <aside
      ref={sidebarRef}
      className="relative h-full flex flex-col border-r select-none shrink-0"
      style={{
        width: `${sidebarWidth}px`,
        backgroundColor: 'var(--md-bg-sidebar)',
        borderColor: 'var(--md-border)'
      }}
    >
      {/* Header thanh bên: Các tab và nút điều khiển */}
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b"
        style={{ borderColor: 'var(--md-border)' }}
      >
        {/* Nhóm tab chuyển đổi: Cây thư mục vs Chỉ mục (TOC) */}
        <div className="flex items-center gap-1.5">
          {/* Tab 1: Cây thư mục (Ẩn khi xem link Web) */}
          {!hideFilesTab && (
            <button
              onClick={() => onTabChange('files')}
              className={`p-1.5 rounded-md transition-all ${
                activeTab === 'files' ? 'shadow-xs text-white' : ''
              }`}
              style={{
                backgroundColor: activeTab === 'files' ? 'var(--md-accent)' : 'transparent',
                color: activeTab === 'files' ? '#ffffff' : 'var(--md-text-secondary)'
              }}
              onMouseEnter={e => {
                if (activeTab !== 'files') {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--md-bg-hover)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--md-text-heading)';
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== 'files') {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--md-text-secondary)';
                }
              }}
              title="Cây thư mục tập tin"
            >
              <Folder size={17} />
            </button>
          )}

          {/* Tab 2: Chỉ mục (TOC) */}
          <button
            onClick={() => onTabChange('toc')}
            className={`p-1.5 px-2.5 rounded-md flex items-center gap-1 transition-all ${
              activeTab === 'toc' ? 'shadow-xs text-white' : ''
            }`}
            style={{
              backgroundColor: activeTab === 'toc' ? 'var(--md-accent)' : 'transparent',
              color: activeTab === 'toc' ? '#ffffff' : 'var(--md-text-secondary)'
            }}
            onMouseEnter={e => {
              if (activeTab !== 'toc') {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--md-bg-hover)';
                (e.currentTarget as HTMLElement).style.color = 'var(--md-text-heading)';
              }
            }}
            onMouseLeave={e => {
              if (activeTab !== 'toc') {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'var(--md-text-secondary)';
              }
            }}
            title="Chỉ mục & Mục lục (Outline)"
          >
            <AlignLeft size={17} />
          </button>
        </div>

        {/* Các nút action phụ: Search, Thu gọn sidebar */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              if (isSearchOpen) setSearchFilter('');
            }}
            className="p-1.5 rounded transition-colors"
            style={{
              backgroundColor: isSearchOpen ? 'var(--md-bg-hover)' : 'transparent',
              color: isSearchOpen ? 'var(--md-accent)' : 'var(--md-text-secondary)'
            }}
            title="Tìm kiếm trong mục lục / file"
          >
            <Search size={16} />
          </button>

          <button
            onClick={onToggleOpen}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--md-text-secondary)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--md-bg-hover)';
              (e.currentTarget as HTMLElement).style.color = 'var(--md-text-heading)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--md-text-secondary)';
            }}
            title="Thu gọn thanh bên"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>
      </div>

      {/* Khung tìm kiếm nếu mở */}
      {isSearchOpen && (
        <div className="p-2 border-b" style={{ borderColor: 'var(--md-border-muted)' }}>
          <div
            className="flex items-center gap-2 px-2.5 py-1 rounded text-xs border"
            style={{
              backgroundColor: 'var(--md-bg-secondary)',
              borderColor: 'var(--md-border)'
            }}
          >
            <Search size={13} style={{ color: 'var(--md-text-muted)' }} />
            <input
              type="text"
              placeholder={activeTab === 'toc' ? 'Lọc tiêu đề...' : 'Lọc tập tin...'}
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full bg-transparent outline-none"
              style={{ color: 'var(--md-text-primary)' }}
              autoFocus
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="hover:opacity-100 opacity-60"
                style={{ color: 'var(--md-text-secondary)' }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Nội dung tương ứng theo tab: Đặt thanh cuộn ở bên trái (direction: rtl) để không vướng resizer kéo mở rộng */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden"
        style={{ direction: 'rtl' }}
      >
        <div style={{ direction: 'ltr' }} className="px-1.5 py-1">
          {/* Giữ cả 2 tab được mount trong DOM để bảo toàn 100% trạng thái mở thư mục, tệp đã chọn và vị trí cuộn */}
          <div style={{ display: activeTab === 'files' ? 'block' : 'none' }}>
            <FileTreeTab
              files={files}
              activeFilePath={activeFilePath}
              pinnedFilePaths={pinnedFilePaths}
              onTogglePin={onTogglePin}
              onSelectFile={onSelectFile}
              onOpenFolder={onOpenFolder}
              onAddFolder={onAddFolder}
              onRemoveFolder={onRemoveFolder}
              onSync={onSync}
              isSyncing={isSyncing}
              searchFilter={searchFilter}
              banner={sidebarBanner}
              onLoadChildren={onLoadChildren}
              expandedFolders={expandedFolders}
              onExpandedFoldersChange={setExpandedFolders}
            />
          </div>
          <div style={{ display: activeTab === 'toc' ? 'block' : 'none' }}>
            <TocTab
              items={tocItems}
              activeSlug={activeHeadingSlug}
              onSelectHeading={onSelectHeading}
              searchFilter={searchFilter}
            />
          </div>
        </div>
      </div>

      {/* Thanh viền kéo co giãn Sidebar (Draggable Resizer) */}
      <div
        onMouseDown={startResizing}
        onDoubleClick={() => {
          setSidebarWidth(300);
          try {
            localStorage.setItem('markdown_reader_sidebar_width', '300');
          } catch (e) {}
        }}
        className={`absolute top-0 right-0 w-1.5 h-full cursor-col-resize transition-colors z-20 hover:bg-[var(--md-accent)] ${
          isResizing ? 'bg-[var(--md-accent)]' : 'bg-transparent'
        }`}
        title="Kéo sang phải để mở rộng thanh workspace (Nhấp đúp để đặt lại kích thước 300px)"
      />
    </aside>
  );
};
