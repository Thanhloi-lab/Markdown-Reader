import React from 'react';
import { TocItem } from '@markdown-reader/core';
import { useTranslation } from '../../context/I18nContext';

interface TocTabProps {
  items: TocItem[];
  activeSlug: string;
  onSelectHeading: (slug: string) => void;
  searchFilter?: string;
}

export const TocTab: React.FC<TocTabProps> = ({
  items,
  activeSlug,
  onSelectHeading,
  searchFilter = ''
}) => {
  const { locale, t } = useTranslation();

  const filteredItems = searchFilter
    ? items.filter(item => item.title.toLowerCase().includes(searchFilter.toLowerCase()))
    : items;

  if (filteredItems.length === 0) {
    return (
      <div className="p-4 text-center text-xs" style={{ color: 'var(--md-text-muted)' }}>
        {searchFilter
          ? (locale === 'vi' ? 'Không tìm thấy mục nào' : 'No matching headings found')
          : t.sidebar.noHeadings}
      </div>
    );
  }

  const getIndentClass = (level: number) => {
    switch (level) {
      case 1:
        return 'pl-3 font-semibold text-sm';
      case 2:
        return 'pl-5 font-medium text-xs';
      case 3:
        return 'pl-7 text-xs';
      case 4:
        return 'pl-9 text-xs opacity-90';
      case 5:
        return 'pl-11 text-xs opacity-80';
      case 6:
        return 'pl-12 text-xs opacity-70';
      default:
        return 'pl-3 text-xs';
    }
  };

  return (
    <div className="py-2 overflow-y-auto custom-scrollbar space-y-0.5 select-none font-sans">
      {filteredItems.map((item, index) => {
        const isActive = activeSlug === item.slug;

        return (
          <button
            key={`${item.slug}-${index}`}
            onClick={() => onSelectHeading(item.slug)}
            className={`w-full text-left py-1.5 pr-3 rounded flex items-center transition-all group ${getIndentClass(
              item.level
            )}`}
            style={{
              color: isActive ? 'var(--md-accent)' : 'var(--md-text-secondary)',
              backgroundColor: isActive ? 'var(--md-bg-active)' : 'transparent'
            }}
            onMouseEnter={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--md-bg-hover)';
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }
            }}
            title={item.title}
          >
            <span
              className={`truncate transition-colors ${
                isActive ? 'font-bold' : ''
              }`}
              style={{
                color: isActive ? 'var(--md-accent)' : undefined
              }}
            >
              {item.title}
            </span>
          </button>
        );
      })}
    </div>
  );
};
