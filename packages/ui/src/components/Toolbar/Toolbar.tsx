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
  Folder,
  Globe
} from 'lucide-react';
import { useTranslation } from '../../context/I18nContext';

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
  const { locale, toggleLocale, t } = useTranslation();

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
                    title={onBreadcrumbFolderClick ? `${t.toolbar.openFolderTooltip} ${folder}` : folder}
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
          title={fileName.toLowerCase().endsWith('.json') ? t.toolbar.formatJsonTooltip : t.toolbar.formatTooltip}
        >
          <Wand2 size={14} className={isFormatting ? 'animate-spin' : ''} style={{ color: 'var(--md-accent)' }} />
          <span>{isFormatting ? t.toolbar.formatting : t.toolbar.format}</span>
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
            title={t.toolbar.previewMode}
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
            title={t.toolbar.splitMode}
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
            title={t.toolbar.editorMode}
          >
            <Edit3 size={14} />
          </button>
        </div>

        {/* Nút Chuyển nhanh Ngôn ngữ VI / EN */}
        <button
          onClick={toggleLocale}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold border transition-colors cursor-pointer"
          style={{
            borderColor: 'var(--md-border)',
            backgroundColor: 'var(--md-bg-primary)',
            color: 'var(--md-text-primary)'
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--md-bg-hover)';
            (e.currentTarget as HTMLElement).style.color = 'var(--md-accent)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--md-bg-primary)';
            (e.currentTarget as HTMLElement).style.color = 'var(--md-text-primary)';
          }}
          title={`${t.common.language}: ${locale === 'vi' ? 'Tiếng Việt' : 'English'}`}
        >
          <Globe size={13} style={{ color: 'var(--md-accent)' }} />
          <span>{locale.toUpperCase()}</span>
        </button>

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
          title={t.toolbar.settingsTooltip}
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
          title={t.toolbar.otherOptions}
        >
          <Menu size={16} />
        </button>
      </div>
    </header>
  );
};
