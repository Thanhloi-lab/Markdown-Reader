import React from 'react';
import { useTranslation } from '../../context/I18nContext';

interface QuickEditorProps {
  content: string;
  onChange: (value: string) => void;
}

export const QuickEditor: React.FC<QuickEditorProps> = ({ content, onChange }) => {
  const { locale, t } = useTranslation();

  return (
    <div
      className="h-full flex flex-col p-4 border-r overflow-hidden transition-colors"
      style={{
        backgroundColor: 'var(--md-bg-secondary)',
        borderColor: 'var(--md-border)'
      }}
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b text-xs font-mono opacity-70" style={{ borderColor: 'var(--md-border-muted)' }}>
        <span>Markdown Source</span>
        <span>{content.length} {locale === 'vi' ? 'ký tự' : 'characters'}</span>
      </div>
      <textarea
        value={content}
        onChange={e => onChange(e.target.value)}
        className="w-full flex-1 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed custom-scrollbar"
        style={{
          color: 'var(--md-text-primary)',
          fontFamily: 'var(--md-code-font-family)'
        }}
        placeholder={t.editor.placeholder}
        spellCheck={false}
      />
    </div>
  );
};
