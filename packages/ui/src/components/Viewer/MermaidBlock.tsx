import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from '../../context/ThemeContext';

interface MermaidBlockProps {
  chart: string;
}

export const MermaidBlock: React.FC<MermaidBlockProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    let isMounted = true;
    const renderId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: theme.diagram.theme,
        themeVariables: {
          darkMode: theme.isDark,
          primaryColor: theme.diagram.primaryColor || theme.colors.backgroundSecondary,
          primaryTextColor: theme.diagram.primaryTextColor || theme.colors.textPrimary,
          primaryBorderColor: theme.diagram.primaryBorderColor || theme.colors.accent,
          lineColor: theme.diagram.lineColor || theme.colors.border,
          secondaryColor: theme.diagram.secondaryColor || theme.colors.backgroundCode,
          tertiaryColor: theme.diagram.tertiaryColor || theme.colors.backgroundSidebar,
          background: theme.diagram.background || theme.colors.backgroundPrimary,
          fontFamily: theme.typography.fontFamily
        },
        securityLevel: 'loose'
      });

      mermaid
        .render(renderId, chart)
        .then(({ svg }) => {
          if (isMounted) {
            setSvgContent(svg);
            setError(null);
          }
        })
        .catch(err => {
          if (isMounted) {
            console.error('Mermaid render error:', err);
            setError('Không thể render biểu đồ Mermaid (Cú pháp không hợp lệ)');
          }
        });
    } catch (err: any) {
      if (isMounted) {
        setError(err.message || 'Lỗi khởi tạo Mermaid');
      }
    }

    return () => {
      isMounted = false;
    };
  }, [chart, theme.diagram, theme.isDark, theme.colors]);

  if (error) {
    return (
      <div className="p-3 my-4 rounded border border-red-500/30 bg-red-950/20 text-red-400 text-xs font-mono">
        <div>{error}</div>
        <pre className="mt-2 text-neutral-400 overflow-x-auto">{chart}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-6 p-4 rounded-lg flex justify-center items-center overflow-x-auto transition-colors"
      style={{
        backgroundColor: 'var(--md-bg-secondary)',
        border: '1px solid var(--md-border)'
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};
