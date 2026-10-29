import React, { useState, useRef, useEffect } from 'react';
import { Filter, Check, X, CheckSquare, Square } from 'lucide-react';
import { getFileTypeInfo } from '../../utils/fileTypeUtils';
import { useTranslation } from '../../context/I18nContext';

interface ExtensionFilterMenuProps {
  allExtensions: { ext: string; count: number }[];
  enabledExtensions: Set<string>;
  onToggleExtension: (ext: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const ExtensionFilterMenu: React.FC<ExtensionFilterMenuProps> = ({
  allExtensions,
  enabledExtensions,
  onToggleExtension,
  onSelectAll,
  onDeselectAll
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { locale, t } = useTranslation();

  // Đóng popover khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const hasFilterActive = enabledExtensions.size < allExtensions.length;

  return (
    <div className="relative inline-block select-none" ref={popoverRef}>
      {/* Nút bấm mở Menu lọc định dạng */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded text-xs font-medium transition-all border ${
          hasFilterActive
            ? 'border-indigo-500/60 shadow-xs'
            : 'border-[var(--md-border)]'
        }`}
        style={{
          backgroundColor: hasFilterActive ? 'var(--md-bg-active)' : 'var(--md-bg-secondary)',
          color: hasFilterActive ? 'var(--md-accent)' : 'var(--md-text-primary)'
        }}
        title={t.sidebar.filterLabel}
      >
        <Filter size={13} style={{ color: hasFilterActive ? 'var(--md-accent)' : undefined }} />
        <span>{locale === 'vi' ? 'Lọc' : 'Filter'} ({enabledExtensions.size}/{allExtensions.length})</span>
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className="absolute left-0 mt-1.5 w-64 rounded-xl shadow-2xl border p-3 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
          style={{
            backgroundColor: 'var(--md-bg-secondary)',
            borderColor: 'var(--md-border)',
            color: 'var(--md-text-primary)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b mb-2" style={{ borderColor: 'var(--md-border-muted)' }}>
            <span className="font-semibold text-xs tracking-wide" style={{ color: 'var(--md-text-heading)' }}>
              {locale === 'vi' ? 'Định dạng tệp hiển thị' : 'File formats to display'}
            </span>
            <div className="flex items-center gap-2 text-[11px]">
              <button
                onClick={onSelectAll}
                className="hover:underline font-medium"
                style={{ color: 'var(--md-accent)' }}
              >
                {t.common.all}
              </button>
              <span className="opacity-30">•</span>
              <button
                onClick={onDeselectAll}
                className="hover:underline opacity-70 hover:opacity-100"
              >
                {locale === 'vi' ? 'Bỏ chọn' : 'Clear'}
              </button>
            </div>
          </div>

          {/* Danh sách các định dạng hiện có */}
          <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar pr-1">
            {allExtensions.length === 0 ? (
              <div className="text-center py-3 text-xs opacity-60">{t.sidebar.noFiles}</div>
            ) : (
              allExtensions.map(({ ext, count }) => {
                const isChecked = enabledExtensions.has(ext);
                const typeInfo = getFileTypeInfo(`file${ext}`);
                const IconComponent = typeInfo.icon;

                return (
                  <label
                    key={ext}
                    className="flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors text-xs hover:bg-[var(--md-bg-hover)]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleExtension(ext)}
                        className="rounded cursor-pointer accent-indigo-600"
                      />
                      <IconComponent size={14} style={{ color: typeInfo.iconColor }} className="shrink-0" />
                      <span className="font-mono font-medium truncate">
                        {ext || (locale === 'vi' ? '(không đuôi)' : '(no extension)')}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono opacity-60 ml-2 shrink-0">
                      {count} {locale === 'vi' ? 'tệp' : 'files'}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
