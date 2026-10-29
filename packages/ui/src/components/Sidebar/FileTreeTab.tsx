import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FolderPlus,
  FolderInput,
  RefreshCw,
  Pin,
  X
} from 'lucide-react';
import { getFileTypeInfo } from '../../utils/fileTypeUtils';
import { ExtensionFilterMenu } from './ExtensionFilterMenu';
import { useTranslation } from '../../context/I18nContext';

export interface FileNode {
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
  content?: string;
  isLoaded?: boolean;
  isLoading?: boolean;
}

interface FileTreeTabProps {
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
  searchFilter?: string;
  banner?: React.ReactNode;
  onLoadChildren?: (folder: FileNode) => Promise<void> | void;
  expandedFolders?: Record<string, boolean>;
  onExpandedFoldersChange?: (expanded: Record<string, boolean>) => void;
}

export const FileTreeTab: React.FC<FileTreeTabProps> = ({
  files,
  activeFilePath,
  pinnedFilePaths = new Set(),
  onTogglePin,
  onSelectFile,
  onOpenFolder,
  onAddFolder,
  onRemoveFolder,
  onSync,
  isSyncing = false,
  searchFilter = '',
  banner,
  onLoadChildren,
  expandedFolders: propExpandedFolders,
  onExpandedFoldersChange
}) => {
  const [internalExpandedFolders, setInternalExpandedFolders] = useState<Record<string, boolean>>({
    root: true
  });
  const expandedFolders = propExpandedFolders ?? internalExpandedFolders;
  const setExpandedFolders = (updater: React.SetStateAction<Record<string, boolean>>) => {
    if (onExpandedFoldersChange) {
      if (typeof updater === 'function') {
        onExpandedFoldersChange(updater(expandedFolders));
      } else {
        onExpandedFoldersChange(updater);
      }
    } else {
      setInternalExpandedFolders(updater);
    }
  };
  const [showOnlyPinned, setShowOnlyPinned] = useState(false);
  const [isPinnedSectionExpanded, setIsPinnedSectionExpanded] = useState(true);
  const { locale, t } = useTranslation();

  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Thu thập tất cả các file đã được Pin
  const pinnedFileNodes = useMemo(() => {
    if (!pinnedFilePaths || pinnedFilePaths.size === 0) return [];
    const result: FileNode[] = [];
    const collect = (nodes: FileNode[]) => {
      for (const n of nodes) {
        if (!n.isDirectory && pinnedFilePaths.has(n.path)) {
          result.push(n);
        }
        if (n.children) collect(n.children);
      }
    };
    collect(files);
    return result;
  }, [files, pinnedFilePaths]);

  // Tự động tắt chế độ lọc ghim nếu không còn file nào được ghim trong workspace
  useEffect(() => {
    if (pinnedFileNodes.length === 0 && showOnlyPinned) {
      setShowOnlyPinned(false);
    }
  }, [pinnedFileNodes.length, showOnlyPinned]);

  // 2. Thống kê toàn bộ các định dạng file có trong workspace
  const allExtensions = useMemo(() => {
    const counts: Record<string, number> = {};
    const collect = (nodes: FileNode[]) => {
      for (const n of nodes) {
        if (!n.isDirectory) {
          const m = n.name.toLowerCase().match(/\.([a-z0-9]+)$/);
          const ext = m ? `.${m[1]}` : '';
          counts[ext] = (counts[ext] || 0) + 1;
        }
        if (n.children) collect(n.children);
      }
    };
    collect(files);
    return Object.entries(counts).map(([ext, count]) => ({ ext, count }));
  }, [files]);

  // Danh sách các định dạng đang được check hiển thị (mặc định hiển thị tất cả)
  const [enabledExtensions, setEnabledExtensions] = useState<Set<string>>(
    () => new Set(allExtensions.map(e => e.ext))
  );

  useEffect(() => {
    setEnabledExtensions(prev => {
      const next = new Set(prev);
      allExtensions.forEach(e => {
        if (!prev.has(e.ext) && prev.size === 0) {
          next.add(e.ext);
        }
      });
      if (prev.size === 0) {
        return new Set(allExtensions.map(e => e.ext));
      }
      return next;
    });
  }, [allExtensions]);

  const handleToggleExtension = (ext: string) => {
    setEnabledExtensions(prev => {
      const next = new Set(prev);
      if (next.has(ext)) {
        next.delete(ext);
      } else {
        next.add(ext);
      }
      return next;
    });
  };

  const handleSelectAllExtensions = () => {
    setEnabledExtensions(new Set(allExtensions.map(e => e.ext)));
  };

  const handleDeselectAllExtensions = () => {
    setEnabledExtensions(new Set());
  };

  // 3. Tự động mở rộng tất cả các thư mục cha của file đang active
  useEffect(() => {
    if (!activeFilePath) return;

    const parts = activeFilePath.split(/[\\/]/);
    if (parts.length <= 1) return;

    const toExpand: Record<string, boolean> = {};
    let currentPath = '';

    for (let i = 0; i < parts.length - 1; i++) {
      currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
      toExpand[currentPath] = true;
    }

    setExpandedFolders(prev => ({
      ...prev,
      ...toExpand
    }));
  }, [activeFilePath]);

  // 4. Tự động cuộn đến file đang active trong danh sách CHỈ KHI activeFilePath thay đổi (Không cuộn lại khi toggle folder khác)
  useEffect(() => {
    if (!activeFilePath || !containerRef.current) return;

    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      const activeEl = containerRef.current.querySelector(
        `[data-file-path="${CSS.escape(activeFilePath)}"]`
      );
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [activeFilePath]);

  const toggleFolder = async (node: FileNode, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlyExpanded = expandedFolders[node.id] ?? false;
    const willExpand = !isCurrentlyExpanded;

    setExpandedFolders(prev => ({
      ...prev,
      [node.id]: willExpand
    }));

    // Nếu người dùng mở thư mục và thư mục này chưa được nạp con (lazy loading)
    if (willExpand && (!node.children || node.children.length === 0) && node.isLoaded === false) {
      if (onLoadChildren) {
        await onLoadChildren(node);
      }
    }
  };

  // Kiểm tra xem một thư mục có chứa ít nhất 1 file thỏa mãn các bộ lọc không
  const hasVisibleChildren = (node: FileNode): boolean => {
    if (!node.children || node.children.length === 0) return true;
    return node.children.some(child => {
      if (child.isDirectory) return hasVisibleChildren(child);
      const m = child.name.toLowerCase().match(/\.([a-z0-9]+)$/);
      const ext = m ? `.${m[1]}` : '';
      const matchesExt = enabledExtensions.has(ext);
      const matchesSearch =
        !searchFilter || child.name.toLowerCase().includes(searchFilter.toLowerCase());
      const matchesPin = !showOnlyPinned || pinnedFilePaths.has(child.path);
      return matchesExt && matchesSearch && matchesPin;
    });
  };

  const renderNode = (node: FileNode, depth = 0, isRootLevel = false) => {
    // Mặc định: Chỉ mở thư mục gốc (depth === 0), các thư mục con mặc định ĐÓNG (collapse)
    const isExpanded = expandedFolders[node.id] ?? (isRootLevel || depth === 0);
    const isActive = activeFilePath === node.path;

    if (node.isDirectory) {
      if (!hasVisibleChildren(node)) {
        return null;
      }

      return (
        <div key={node.id} className="select-none">
          <div
            onClick={e => toggleFolder(node, e)}
            className={`flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer text-xs transition-all duration-150 group hover:translate-x-0.5 ${
              isRootLevel ? 'font-semibold tracking-wide border-t first:border-t-0 mt-1.5 pt-1.5' : ''
            }`}
            style={{
              paddingLeft: `${depth * 14 + 8}px`,
              borderColor: 'var(--md-border-muted)',
              color: isRootLevel ? 'var(--md-text-heading)' : 'var(--md-text-secondary)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--md-bg-hover)';
              (e.currentTarget as HTMLElement).style.color = 'var(--md-text-heading)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLElement).style.color = isRootLevel
                ? 'var(--md-text-heading)'
                : 'var(--md-text-secondary)';
            }}
            title={node.path}
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {node.isLoading ? (
                <RefreshCw size={14} className="text-indigo-400 shrink-0 animate-spin" />
              ) : isExpanded ? (
                <FolderOpen size={14} className="text-amber-400 shrink-0" />
              ) : (
                <Folder size={14} className="text-amber-400 shrink-0" />
              )}
              <span className="truncate">{node.name}</span>
            </div>

            {/* Nút gỡ bỏ thư mục gốc khỏi workspace */}
            {isRootLevel && onRemoveFolder && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onRemoveFolder(node.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-all shrink-0"
                title={`${t.sidebar.removeFolder}: ${node.name}`}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {isExpanded && (
            <div>
              {node.children && node.children.length > 0 ? (
                node.children.map(child => renderNode(child, depth + 1, false))
              ) : node.isLoaded ? (
                <div
                  className="py-1.5 text-[11px] italic opacity-50 select-none"
                  style={{ paddingLeft: `${(depth + 1) * 14 + 18}px`, color: 'var(--md-text-muted)' }}
                >
                  {locale === 'vi' ? '(Thư mục trống)' : '(Empty folder)'}
                </div>
              ) : null}
            </div>
          )}
        </div>
      );
    }

    // 1. Kiểm tra lọc theo ghim (Show only pinned)
    const isPinned = pinnedFilePaths.has(node.path);
    if (showOnlyPinned && !isPinned) {
      return null;
    }

    // 2. Kiểm tra bộ lọc định dạng (hide/show theo extension)
    const m = node.name.toLowerCase().match(/\.([a-z0-9]+)$/);
    const fileExt = m ? `.${m[1]}` : '';
    if (allExtensions.length > 0 && !enabledExtensions.has(fileExt)) {
      return null;
    }

    // 3. Kiểm tra lọc theo từ khóa tìm kiếm
    if (searchFilter && !node.name.toLowerCase().includes(searchFilter.toLowerCase())) {
      return null;
    }

    const typeInfo = getFileTypeInfo(node.name);
    const IconComponent = typeInfo.icon;

    return (
      <div
        key={node.id}
        data-file-path={node.path}
        onClick={() => onSelectFile(node)}
        className={`flex items-center justify-between gap-1 py-1.5 px-2.5 rounded-lg cursor-pointer text-xs transition-all duration-150 group my-0.5 ${
          isActive
            ? 'border-l-3 font-semibold shadow-xs'
            : 'border-l-3 border-transparent hover:translate-x-1 hover:border-indigo-400/50'
        }`}
        style={{
          paddingLeft: `${depth * 14 + 16}px`,
          backgroundColor: isActive ? 'var(--md-bg-active)' : 'transparent',
          borderLeftColor: isActive ? 'var(--md-accent)' : undefined,
          color: isActive ? 'var(--md-accent)' : 'var(--md-text-primary)'
        }}
        onMouseEnter={e => {
          if (!isActive) {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
            (e.currentTarget as HTMLElement).style.color = 'var(--md-text-heading)';
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--md-text-primary)';
          }
        }}
        title={`${node.path} (Nhấp để mở)`}
      >
        <span className="flex items-center gap-2 min-w-0 flex-1 truncate">
          <IconComponent
            size={14}
            className="shrink-0 transition-transform group-hover:scale-110"
            style={{
              color: isActive ? 'var(--md-accent)' : typeInfo.iconColor
            }}
          />
          <span
            className="truncate transition-colors"
            style={{
              color: isActive ? 'var(--md-accent)' : undefined
            }}
          >
            {node.name}
          </span>
          {!typeInfo.isMarkdown && (
            <span
              className="ml-auto text-[9px] font-mono px-1.5 py-0.2 rounded opacity-75 shrink-0 font-bold border"
              style={{
                backgroundColor: 'var(--md-bg-secondary)',
                borderColor: 'var(--md-border-muted)',
                color: typeInfo.iconColor
              }}
            >
              {typeInfo.badge}
            </span>
          )}
        </span>

        {/* Nút Ghim (Pin / Flag) file */}
        {onTogglePin && (
          <button
            onClick={e => {
              e.stopPropagation();
              onTogglePin(node.path);
            }}
            className={`p-1.5 rounded transition-all shrink-0 ml-1.5 ${
              isPinned
                ? 'opacity-100 text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:scale-120 drop-shadow-xs'
                : 'opacity-0 group-hover:opacity-75 hover:opacity-100 text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 hover:scale-115'
            }`}
            title={isPinned ? t.sidebar.unpinFile : t.sidebar.pinFile}
          >
            <Pin
              size={16}
              className={isPinned ? 'fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400' : ''}
              strokeWidth={isPinned ? 2.5 : 2}
            />
          </button>
        )}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="py-2 overflow-y-auto font-sans">
      {banner && <div className="px-1 mb-2.5">{banner}</div>}

      {/* Thanh công cụ: Thêm thư mục + Đồng bộ + Lọc định dạng + Lọc đã ghim */}
      <div
        className="px-2 pb-2.5 border-b mb-2 flex items-center gap-1.5 flex-wrap"
        style={{ borderColor: 'var(--md-border-muted)' }}
      >
        {/* Nút Thêm thư mục */}
        {onAddFolder && (
          <button
            onClick={onAddFolder}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded text-xs font-medium transition-all shadow-xs border"
            style={{
              backgroundColor: 'var(--md-bg-secondary)',
              borderColor: 'var(--md-border)',
              color: 'var(--md-text-primary)'
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--md-bg-hover)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--md-bg-secondary)';
            }}
            title={t.sidebar.addFolder}
          >
            <FolderPlus size={13} style={{ color: 'var(--md-accent)' }} />
            <span>{t.sidebar.addFolder}</span>
          </button>
        )}

        {/* Nút Đồng bộ / Làm mới (Sync) theo thực tế file đĩa */}
        {onSync && (
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="p-1.5 rounded text-xs font-medium transition-all border flex items-center justify-center"
            style={{
              backgroundColor: 'var(--md-bg-secondary)',
              borderColor: 'var(--md-border)',
              color: 'var(--md-text-primary)'
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--md-bg-hover)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--md-bg-secondary)';
            }}
            title={t.sidebar.syncFolders}
          >
            <RefreshCw
              size={13}
              className={isSyncing ? 'animate-spin text-indigo-400' : ''}
              style={{ color: isSyncing ? undefined : 'var(--md-accent)' }}
            />
          </button>
        )}

        {/* Nút Lọc riêng các tệp Đã Ghim (Filter Pinned) */}
        {pinnedFileNodes.length > 0 && (
          <button
            onClick={() => setShowOnlyPinned(!showOnlyPinned)}
            className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded text-xs font-semibold transition-all border ${
              showOnlyPinned ? 'shadow-xs' : ''
            }`}
            style={{
              backgroundColor: showOnlyPinned
                ? 'rgba(245, 158, 11, 0.2)'
                : 'var(--md-bg-secondary)',
              borderColor: showOnlyPinned ? '#f59e0b' : 'var(--md-border)',
              color: showOnlyPinned ? '#d97706' : 'var(--md-text-primary)'
            }}
            title={
              showOnlyPinned
                ? (locale === 'vi' ? 'Hiển thị lại toàn bộ cây thư mục' : 'Show full folder tree')
                : (locale === 'vi' ? 'Chỉ hiển thị các tệp đã ghim' : 'Show pinned files only')
            }
          >
            <Pin
              size={15}
              className={showOnlyPinned ? 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400' : 'text-amber-500 dark:text-amber-400'}
              strokeWidth={2.2}
            />
            <span>{locale === 'vi' ? `Ghim (${pinnedFileNodes.length})` : `Pinned (${pinnedFileNodes.length})`}</span>
          </button>
        )}

        {/* Nút Mở Menu lọc các định dạng file */}
        {allExtensions.length > 0 && (
          <ExtensionFilterMenu
            allExtensions={allExtensions}
            enabledExtensions={enabledExtensions}
            onToggleExtension={handleToggleExtension}
            onSelectAll={handleSelectAllExtensions}
            onDeselectAll={handleDeselectAllExtensions}
          />
        )}

        {/* Nút Mở thư mục đầu tiên nếu chưa có thư mục nào */}
        {!onAddFolder && onOpenFolder && (
          <button
            onClick={onOpenFolder}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded text-xs font-medium transition-all shadow-xs"
            style={{
              backgroundColor: 'var(--md-bg-secondary)',
              border: '1px solid var(--md-border)',
              color: 'var(--md-text-primary)'
            }}
          >
            <FolderInput size={14} style={{ color: 'var(--md-accent)' }} />
            <span>{t.sidebar.openFolder}</span>
          </button>
        )}
      </div>

      {/* Mục "ĐÃ GHIM" cố định trên đầu giúp truy cập siêu nhanh */}
      {pinnedFileNodes.length > 0 && !showOnlyPinned && (
        <div
          className="mb-3 pb-2 border-b select-none"
          style={{ borderColor: 'var(--md-border-muted)' }}
        >
          <div
            onClick={() => setIsPinnedSectionExpanded(!isPinnedSectionExpanded)}
            className="flex items-center justify-between px-2 py-1 text-xs font-semibold cursor-pointer rounded hover:bg-[var(--md-bg-hover)]"
            style={{ color: 'var(--md-text-heading)' }}
          >
            <div className="flex items-center gap-1.5">
              {isPinnedSectionExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Pin size={16} className="text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400 shrink-0" strokeWidth={2.5} />
              <span>{locale === 'vi' ? `Tệp đã ghim (${pinnedFileNodes.length})` : `Pinned files (${pinnedFileNodes.length})`}</span>
            </div>
          </div>

          {isPinnedSectionExpanded && (
            <div className="space-y-0.5 mt-1">
              {pinnedFileNodes.map(file => {
                const isActive = activeFilePath === file.path;
                const typeInfo = getFileTypeInfo(file.name);
                const IconComponent = typeInfo.icon;

                return (
                  <div
                    key={`pinned-${file.id}`}
                    onClick={() => onSelectFile(file)}
                    className={`flex items-center justify-between gap-1 py-1 px-2.5 rounded-lg cursor-pointer text-xs transition-all ${
                      isActive
                        ? 'border-l-3 font-semibold shadow-xs'
                        : 'border-l-3 border-transparent hover:translate-x-1'
                    }`}
                    style={{
                      backgroundColor: isActive ? 'var(--md-bg-active)' : 'transparent',
                      borderLeftColor: isActive ? 'var(--md-accent)' : undefined,
                      color: isActive ? 'var(--md-accent)' : 'var(--md-text-primary)'
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                          'rgba(99, 102, 241, 0.1)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                      }
                    }}
                    title={`${file.path} (Nhấp để mở)`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                      <IconComponent
                        size={14}
                        className="shrink-0"
                        style={{ color: typeInfo.iconColor }}
                      />
                      <span className="truncate">{file.name}</span>
                    </div>

                    {onTogglePin && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onTogglePin(file.path);
                        }}
                        className="p-1.5 rounded text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:scale-120 transition-transform shrink-0 drop-shadow-xs"
                        title={t.sidebar.unpinFile}
                      >
                        <Pin size={16} className="fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400" strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {files.length === 0 ? (
        <div className="p-4 text-center text-xs" style={{ color: 'var(--md-text-muted)' }}>
          {t.sidebar.noFiles}
        </div>
      ) : (
        <div className="space-y-0.5">
          {files.map(file => renderNode(file, 0, file.isDirectory))}
        </div>
      )}
    </div>
  );
};
