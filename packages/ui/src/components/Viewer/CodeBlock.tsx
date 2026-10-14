import React, { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import hljs from 'highlight.js';
import { MermaidBlock } from './MermaidBlock';

const escapeHtml = (str: string) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  if (language === 'mermaid') {
    return <MermaidBlock chart={value} />;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const highlightedHtml = useMemo(() => {
    if (!value) return '';
    try {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(value, { language, ignoreIllegals: true }).value;
      }
      // Khi không có language (ví dụ indented code), dùng highlightAuto để highlight comment, number,...
      return hljs.highlightAuto(value).value;
    } catch (e) {
      return escapeHtml(value);
    }
  }, [language, value]);

  const displayLanguage = language?.toLowerCase();

  return (
    <div
      className="relative my-5 rounded-lg overflow-hidden border group transition-all"
      style={{
        backgroundColor: 'var(--md-bg-code)',
        borderColor: 'var(--md-border)'
      }}
    >
      {/* Góc trên bên phải: Nhãn ngôn ngữ (như 'typescript') và nút Sao chép */}
      <div className="absolute top-3 right-4 z-10 flex items-center gap-2 select-none">
        {displayLanguage && (
          <span
            className="text-xs font-mono lowercase tracking-normal opacity-50 group-hover:opacity-80 transition-opacity"
            style={{ color: 'var(--md-text-muted)' }}
          >
            {displayLanguage}
          </span>
        )}
        <button
          onClick={handleCopy}
          className="p-1 rounded opacity-0 group-hover:opacity-75 hover:!opacity-100 transition-all text-xs"
          style={{
            backgroundColor: copied ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 255, 255, 0.08)',
            color: copied ? '#4ade80' : 'var(--md-text-primary)'
          }}
          title={copied ? 'Đã sao chép' : 'Sao chép mã'}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </div>

      {/* Nội dung code có syntax highlight */}
      <pre
        className="p-4 sm:p-5 overflow-x-auto text-sm leading-relaxed font-mono custom-scrollbar"
        style={{
          fontFamily: 'var(--md-code-font-family)',
          color: 'var(--md-code-text)'
        }}
      >
        <code
          className={`hljs ${displayLanguage ? `language-${displayLanguage}` : ''}`}
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      </pre>
    </div>
  );
};
