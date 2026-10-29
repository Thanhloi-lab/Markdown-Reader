import React, { useState, useMemo, useEffect } from 'react';
import { Copy, Check, Wand2, FileCode } from 'lucide-react';
import hljs from 'highlight.js';
import { getFileTypeInfo } from '../../utils/fileTypeUtils';

const escapeHtml = (str: string) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

interface CodeFileViewerProps {
  fileName: string;
  content: string;
  onContentChange?: (newContent: string) => void;
}

export const CodeFileViewer: React.FC<CodeFileViewerProps> = ({
  fileName,
  content,
  onContentChange
}) => {
  const [copied, setCopied] = useState(false);
  const [localContent, setLocalContent] = useState(content);
  const typeInfo = useMemo(() => getFileTypeInfo(fileName, content), [fileName, content]);

  // Tự động đồng bộ và định dạng đẹp (pretty-print) ngay khi mở file JSON
  useEffect(() => {
    if (typeInfo.language === 'json' && content) {
      try {
        const parsed = JSON.parse(content);
        const formatted = JSON.stringify(parsed, null, 2);
        setLocalContent(formatted);
        return;
      } catch (e) {
        // Nếu JSON bị lỗi cú pháp, hiển thị nguyên gốc
      }
    }
    setLocalContent(content);
  }, [content, fileName, typeInfo.language]);

  const rawCode = onContentChange ? localContent : content;
  const lines = rawCode.split('\n');

  const highlightedCode = useMemo(() => {
    try {
      if (typeInfo.language && hljs.getLanguage(typeInfo.language)) {
        return hljs.highlight(rawCode, { language: typeInfo.language, ignoreIllegals: true }).value;
      }
      return hljs.highlightAuto(rawCode).value;
    } catch (e) {
      return escapeHtml(rawCode);
    }
  }, [rawCode, typeInfo.language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleFormat = () => {
    if (typeInfo.language === 'json') {
      try {
        const parsed = JSON.parse(rawCode);
        const formatted = JSON.stringify(parsed, null, 2);
        setLocalContent(formatted);
        onContentChange?.(formatted);
      } catch (e) {
        alert('File JSON hiện tại bị lỗi cú pháp, không thể format.');
      }
    } else if (typeInfo.language === 'xml' || typeInfo.language === 'html') {
      // Basic XML formatter: indent tags
      try {
        let formatted = '';
        let indent = 0;
        const reg = /(>)(<)(\/*)/g;
        const xml = rawCode.replace(reg, '$1\r\n$2$3');
        xml.split('\r\n').forEach(node => {
          let padding = '';
          if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
          } else if (node.match(/^<\/\w/)) {
            if (indent !== 0) indent -= 1;
          } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
            indent += 1;
          }
          for (let i = 0; i < indent; i++) padding += '  ';
          formatted += padding + node + '\n';
        });
        setLocalContent(formatted.trim());
        onContentChange?.(formatted.trim());
      } catch (e) {}
    }
  };

  const IconComponent = typeInfo.icon;

  return (
    <div
      className="h-full flex flex-col overflow-hidden font-sans select-text"
      style={{
        backgroundColor: 'var(--md-bg-primary)',
        color: 'var(--md-text-primary)'
      }}
    >
      {/* Header thanh thông tin file code */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b text-xs shrink-0"
        style={{
          backgroundColor: 'var(--md-bg-secondary)',
          borderColor: 'var(--md-border)'
        }}
      >
        <div className="flex items-center gap-2.5">
          <IconComponent size={16} style={{ color: typeInfo.iconColor }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--md-text-heading)' }}>
            {fileName}
          </span>
          <span
            className="px-2 py-0.5 rounded text-[11px] font-mono font-bold"
            style={{
              backgroundColor: 'var(--md-bg-code)',
              color: typeInfo.iconColor,
              border: '1px solid var(--md-border)'
            }}
          >
            {typeInfo.badge}
          </span>
          <span className="opacity-60 text-[11px] font-mono">
            {lines.length} dòng • {rawCode.length} ký tự
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút format nếu là JSON / XML */}
          {(typeInfo.language === 'json' || typeInfo.language === 'xml') && (
            <button
              onClick={handleFormat}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors border"
              style={{
                backgroundColor: 'var(--md-bg-primary)',
                borderColor: 'var(--md-border)',
                color: 'var(--md-text-primary)'
              }}
              title={`Làm đẹp / Định dạng ${typeInfo.badge}`}
            >
              <Wand2 size={13} style={{ color: 'var(--md-accent)' }} />
              <span>Format {typeInfo.badge}</span>
            </button>
          )}

          {/* Nút Copy toàn bộ */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors border"
            style={{
              backgroundColor: copied ? 'rgba(74, 222, 128, 0.15)' : 'var(--md-bg-primary)',
              borderColor: copied ? '#4ade80' : 'var(--md-border)',
              color: copied ? '#4ade80' : 'var(--md-text-primary)'
            }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Đã sao chép' : 'Sao chép tất cả'}</span>
          </button>
        </div>
      </div>

      {/* Vùng hiển thị code với số dòng */}
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        <div
          className="rounded-lg border overflow-hidden"
          style={{
            backgroundColor: 'var(--md-bg-code)',
            borderColor: 'var(--md-border)'
          }}
        >
          <div className="flex font-mono text-xs leading-relaxed">
            {/* Cột số dòng */}
            <div
              className="py-4 px-3 select-none text-right border-r shrink-0 opacity-40"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
                borderColor: 'var(--md-border-muted)',
                minWidth: '48px'
              }}
            >
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Nội dung code */}
            <div className="py-4 px-4 flex-1 overflow-x-auto whitespace-pre">
              <code
                className={`hljs ${typeInfo.language ? `language-${typeInfo.language}` : ''}`}
                style={{
                  fontFamily: 'var(--md-code-font-family)',
                  color: 'var(--md-code-text)'
                }}
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
