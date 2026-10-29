import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from '../../context/ThemeContext';

interface MermaidBlockProps {
  chart: string;
}

// Module-level cache: Lưu trữ SVG đã render theo khóa cấu hình biểu đồ và theme.
// Giúp hiển thị tức thì, không bị nhấp nháy chuyển từ text sang svg và triệt tiêu layout shift.
const mermaidSvgCache = new Map<string, string>();
const MAX_CACHE_SIZE = 150;

function setCache(key: string, svg: string) {
  if (mermaidSvgCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = mermaidSvgCache.keys().next().value;
    if (oldestKey) {
      mermaidSvgCache.delete(oldestKey);
    }
  }
  mermaidSvgCache.set(key, svg);
}

export const MermaidBlock: React.FC<MermaidBlockProps> = React.memo(({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const cacheKey = `${chart}:::${theme.id || ''}:::${theme.isDark}:::${theme.diagram?.theme || ''}`;

  // Khởi tạo ngay lập tức từ cache nếu đã render trước đó để loại bỏ layout shift và giật màn hình
  const [svgContent, setSvgContent] = useState<string>(() => mermaidSvgCache.get(cacheKey) || '');
  const [prevCacheKey, setPrevCacheKey] = useState<string>(cacheKey);
  const [error, setError] = useState<string | null>(null);

  // Đồng bộ tức thời khi theme/chart thay đổi nếu đã có trong cache
  if (prevCacheKey !== cacheKey) {
    setPrevCacheKey(cacheKey);
    const cached = mermaidSvgCache.get(cacheKey) || '';
    setSvgContent(cached);
  }

  useEffect(() => {
    let isMounted = true;

    // Nếu đã có SVG trong cache cho cacheKey này, dùng ngay lập tức không cần gọi mermaid.render
    const cached = mermaidSvgCache.get(cacheKey);
    if (cached) {
      if (svgContent !== cached) {
        setSvgContent(cached);
      }
      setError(null);
      return;
    }

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
            setCache(cacheKey, svg);
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
  }, [cacheKey, chart, theme.diagram, theme.isDark, theme.colors, theme.typography.fontFamily]);

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
        border: '1px solid var(--md-border)',
        minHeight: svgContent ? undefined : '120px'
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
});

MermaidBlock.displayName = 'MermaidBlock';
