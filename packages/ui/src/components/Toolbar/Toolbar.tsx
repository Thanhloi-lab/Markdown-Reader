import React from 'react';
import {
  Wand2,
  Palette,
  Settings,
  Eye,
  Edit3,
  Columns,
  Menu,
  FileText,
  Folder
} from 'lucide-react';

export type ViewMode = 'preview' | 'split' | 'editor';

interface ToolbarProps {
  fileName?: string;
  filePath?: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onFormatDocument: () => void;
  onOpenThemeCustomizer: () => void;
  isFormatting?: boolean;
  onBreadcrumbFolderClick?: (folderName: string, folderIndex: number, fullFolderPath?: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  fileName = 'Untitled.md',
  filePath,
  viewMode,
  onViewModeChange,
  onFormatDocument,
  onOpenThemeCustomizer,
  isFormatting = false,
  onBreadcrumbFolderClick
}) => {
  // Phân tích đường dẫn breadcrumb: folder/subfolder/file.md
  const pathParts = filePath ? filePath.split(/[\\/]/) : [fileName];
  const folders = pathParts.slice(0, -1);
  const currentName = pathParts[pathParts.length - 1] || fileName;

  return (
    <header
      className="h-12 border-b flex items-center justify-between px-4 transition-colors select-none shrink-0"
      style={{
        backgroundColor: 'var(--md-bg-secondary)',
        borderColor: 'var(--md-border)'
      }}
    >
      {/* Thông tin Breadcrumb và tên file hiện tại rõ ràng, nổi bật */}
      <div className="flex items-center gap-1.5 text-xs font-medium overflow-hidden mr-4 max-w-[65%]">
        {folders.length > 0 && (
          <div className="flex items-center gap-1 truncate shrink-0" style={{ color: 'var(--md-text-muted)' }}>
            {folders.map((folder, idx) => {
              const fullFolderPath = folders.slice(0, idx + 1).join('/');
              return (
                <React.Fragment key={idx}>
                  <span
                    onClick={() => onBreadcrumbFolderClick?.(folder, idx, fullFolderPath)}
                    className={`flex items-center gap-1 transition-colors ${
                      onBreadcrumbFolderClick
                        ? 'hover:underline cursor-pointer hover:text-[var(--md-accent)]'
                        : 'cursor-default'
                    }`}
                    title={onBreadcrumbFolderClick ? `Nhấp để mở thư mục ${folder}` : folder}
                  >
                    <Folder size={12} className="text-amber-400 shrink-0" />
                    <span className="truncate">{folder}</span>
                  </span>
                  <span className="opacity-40">/</span>
                </React.Fragment>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-1.5 truncate">
          <FileText size={15} className="shrink-0" style={{ color: 'var(--md-accent)' }} />
          <span
            style={{ color: 'var(--md-text-heading)' }}
            className="font-semibold tracking-wide truncate"
            title={filePath || currentName}
          >
            {currentName}
          </span>
        </div>
      </div>

      {/* Các nút hành động chính trên Topbar */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Nút Format tài liệu */}
        <button
          onClick={onFormatDocument}
          disabled={isFormatting}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors"
          style={{
            color: 'var(--md-text-primary)',
            border: '1px solid var(--md-border)'
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--md-bg-hover)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
          }}
          title={fileName.toLowerCase().endsWith('.json') ? 'Định dạng JSON (Làm đẹp & Căn lề)' : 'Định dạng / Làm đẹp tài liệu'}
        >
          <Wand2 size={14} className={isFormatting ? 'animate-spin' : ''} style={{ color: 'var(--md-accent)' }} />
          <span>{isFormatting ? 'Đang format...' : 'Format'}</span>
        </button>

        {/* Nút Chuyển chế độ xem: Preview / Split / Editor */}
        <div
          className="flex items-center p-0.5 rounded border"
          style={{
            borderColor: 'var(--md-border)',
            backgroundColor: 'var(--md-bg-primary)'
          }}
        >
          <button
            onClick={() => onViewModeChange('preview')}
            className="p-1.5 rounded transition-all"
            style={{
              backgroundColor: viewMode === 'preview' ? 'var(--md-bg-active)' : 'transparent',
              color: viewMode === 'preview' ? 'var(--md-accent)' : 'var(--md-text-muted)'
            }}
            title="Chỉ đọc (Reader Preview)"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => onViewModeChange('split')}
            className="p-1.5 rounded transition-all"
            style={{
              backgroundColor: viewMode === 'split' ? 'var(--md-bg-active)' : 'transparent',
              color: viewMode === 'split' ? 'var(--md-accent)' : 'var(--md-text-muted)'
            }}
            title="Xem song song (Split Preview & Edit)"
          >
            <Columns size={14} />
          </button>
          <button
            onClick={() => onViewModeChange('editor')}
            className="p-1.5 rounded transition-all"
            style={{
              backgroundColor: viewMode === 'editor' ? 'var(--md-bg-active)' : 'transparent',
              color: viewMode === 'editor' ? 'var(--md-accent)' : 'var(--md-text-muted)'
            }}
            title="Soạn thảo nhanh (Raw Editor)"
          >
            <Edit3 size={14} />
          </button>
        </div>

        {/* Nút Cài đặt Giao diện & Phông chữ */}
        <button
          onClick={onOpenThemeCustomizer}
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
          title="Cài đặt giao diện & phông chữ"
        >
          <Settings size={16} />
        </button>

        {/* Nút Menu / Options */}
        <button
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
          title="Tùy chọn khác"
        >
          <Menu size={16} />
        </button>
      </div>
    </header>
  );
};
