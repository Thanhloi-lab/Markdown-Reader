import React, { useEffect, useRef, useMemo } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';
import GithubSlugger from 'github-slugger';
import { CodeBlock } from './CodeBlock';
import { AlertBlock, AlertType } from './AlertBlock';

interface MarkdownViewerProps {
  content: string;
  onActiveHeadingChange?: (slug: string) => void;
  onSelectHeading?: (slug: string) => void;
  onNavigateLink?: (href: string) => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

const InPreContext = React.createContext<boolean>(false);

const remarkPlugins = [remarkGfm, remarkMath];
const rehypePlugins = [rehypeRaw, rehypeSlug, rehypeKatex];

const getChildrenText = (c: any): string => {
  if (typeof c === 'string') return c;
  if (typeof c === 'number') return String(c);
  if (Array.isArray(c)) return c.map(getChildrenText).join('');
  if (c && typeof c === 'object' && c.props && c.props.children) {
    return getChildrenText(c.props.children);
  }
  return '';
};

export const MarkdownViewer: React.FC<MarkdownViewerProps> = React.memo(({
  content,
  onActiveHeadingChange,
  onSelectHeading,
  onNavigateLink,
  scrollContainerRef
}) => {
  const localContainerRef = useRef<HTMLDivElement>(null);
  const container = scrollContainerRef || localContainerRef;

  // Scrollspy: Lắng nghe scroll để tự động phát hiện heading đang ở viewport
  useEffect(() => {
    const scrollEl = container.current;
    if (!scrollEl || !onActiveHeadingChange) return;

    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        const headings = scrollEl.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length === 0) return;

        const containerTop = scrollEl.getBoundingClientRect().top;
        let currentActiveSlug = '';

        for (let i = 0; i < headings.length; i++) {
          const heading = headings[i] as HTMLElement;
          const rect = heading.getBoundingClientRect();

          // Nếu heading đã cuộn qua hoặc gần mép trên của khung nhìn
          if (rect.top - containerTop <= 100) {
            currentActiveSlug = heading.id;
          } else {
            break;
          }
        }

        if (!currentActiveSlug && headings.length > 0) {
          currentActiveSlug = (headings[0] as HTMLElement).id;
        }

        if (currentActiveSlug) {
          onActiveHeadingChange(currentActiveSlug);
        }
      });
    };

    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger lần đầu
    handleScroll();

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      scrollEl.removeEventListener('scroll', handleScroll);
    };
  }, [content, onActiveHeadingChange, container]);

  // Memoize `components` để ReactMarkdown không tạo lại toàn bộ cây AST React trên mỗi lần re-render,
  // triệt tiêu hiện tượng CodeBlock và MermaidBlock bị unmount/remount gây giật màn hình
  const components = useMemo<Components>(() => {
    const slugger = new GithubSlugger();

    return {
      // Heading 1
      h1: ({ node, children, ...props }: any) => {
        const text = getChildrenText(children);
        const id = props.id || slugger.slug(text);
        return (
          <h1
            id={id}
            className="text-3xl sm:text-4xl font-bold mt-10 mb-5 pb-3 border-b tracking-tight scroll-mt-6"
            style={{
              color: 'var(--md-text-heading)',
              fontFamily: 'var(--md-heading-font-family)',
              borderColor: 'var(--md-border)'
            }}
            {...props}
          >
            {children}
          </h1>
        );
      },
      // Heading 2
      h2: ({ node, children, ...props }: any) => {
        const text = getChildrenText(children);
        const id = props.id || slugger.slug(text);
        return (
          <h2
            id={id}
            className="text-2xl sm:text-3xl font-semibold mt-9 mb-4 pb-2 border-b tracking-tight scroll-mt-6"
            style={{
              color: 'var(--md-text-heading)',
              fontFamily: 'var(--md-heading-font-family)',
              borderColor: 'var(--md-border)'
            }}
            {...props}
          >
            {children}
          </h2>
        );
      },
      // Heading 3
      h3: ({ node, children, ...props }: any) => {
        const text = getChildrenText(children);
        const id = props.id || slugger.slug(text);
        return (
          <h3
            id={id}
            className="text-xl sm:text-2xl font-medium mt-7 mb-3 scroll-mt-6"
            style={{
              color: 'var(--md-text-heading)',
              fontFamily: 'var(--md-heading-font-family)'
            }}
            {...props}
          >
            {children}
          </h3>
        );
      },
      // Heading 4, 5, 6
      h4: ({ node, children, ...props }: any) => (
        <h4
          id={props.id || slugger.slug(getChildrenText(children))}
          className="text-lg font-medium mt-6 mb-2 scroll-mt-6"
          style={{ color: 'var(--md-text-heading)', fontFamily: 'var(--md-heading-font-family)' }}
          {...props}
        >
          {children}
        </h4>
      ),
      h5: ({ node, children, ...props }: any) => (
        <h5
          id={props.id || slugger.slug(getChildrenText(children))}
          className="text-base font-medium mt-5 mb-2 scroll-mt-6"
          style={{ color: 'var(--md-text-heading)' }}
          {...props}
        >
          {children}
        </h5>
      ),
      h6: ({ node, children, ...props }: any) => (
        <h6
          id={props.id || slugger.slug(getChildrenText(children))}
          className="text-sm font-medium mt-4 mb-2 text-neutral-400 scroll-mt-6"
          {...props}
        >
          {children}
        </h6>
      ),

      // Paragraph
      p: ({ node, children, ...props }: any) => (
        <p className="my-4 leading-relaxed" {...props}>
          {children}
        </p>
      ),

      // Pre & Code blocks
      pre: ({ children }: any) => (
        <InPreContext.Provider value={true}>
          {children}
        </InPreContext.Provider>
      ),
      code: ({ node, inline, className, children, ...props }: any) => {
        const inPre = React.useContext(InPreContext);
        const match = /language-(\w+)/.exec(className || '');
        const codeContent = String(children).replace(/\n$/, '');

        if (inPre || (!inline && (match || codeContent.includes('\n')))) {
          return (
            <CodeBlock
              language={match ? match[1] : undefined}
              value={codeContent}
            />
          );
        }

        // Inline code badge: Sử dụng biến theme linh hoạt và dễ đọc ở cả Light & Dark mode
        return (
          <code
            className="px-1.5 py-0.5 mx-0.5 rounded text-[0.875em] font-mono font-medium inline-block border"
            style={{
              backgroundColor: 'var(--md-bg-code)',
              borderColor: 'var(--md-border)',
              color: 'var(--md-code-text)'
            }}
            {...props}
          >
            {children}
          </code>
        );
      },

      // Blockquote & GitHub Alerts
      blockquote: ({ node, children, ...props }: any) => {
        const rawText = React.Children.toArray(children)
          .map((child: any) => (typeof child === 'string' ? child : child?.props?.children || ''))
          .join('');

        const alertMatch = rawText.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);

        if (alertMatch) {
          const alertType = alertMatch[1].toLowerCase() as AlertType;
          return (
            <AlertBlock type={alertType}>
              {children}
            </AlertBlock>
          );
        }

        return (
          <blockquote
            className="my-5 pl-4 border-l-2 italic opacity-90"
            style={{
              borderColor: 'var(--md-accent)',
              color: 'var(--md-text-secondary)'
            }}
            {...props}
          >
            {children}
          </blockquote>
        );
      },

      // Tables
      table: ({ node, children, ...props }: any) => (
        <div
          className="my-6 overflow-x-auto rounded-lg border shadow-xs"
          style={{
            borderColor: 'var(--md-border)',
            backgroundColor: 'var(--md-bg-secondary)'
          }}
        >
          <table className="w-full text-left text-sm border-collapse" {...props}>
            {children}
          </table>
        </div>
      ),
      th: ({ node, children, ...props }: any) => (
        <th
          className="px-4 py-3 font-semibold border-b text-sm"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            borderColor: 'var(--md-border)',
            color: 'var(--md-text-heading)'
          }}
          {...props}
        >
          {children}
        </th>
      ),
      td: ({ node, children, ...props }: any) => (
        <td
          className="px-4 py-2.5 border-b last:border-b-0 text-sm leading-relaxed"
          style={{
            borderColor: 'var(--md-border-muted)',
            color: 'var(--md-text-primary)'
          }}
          {...props}
        >
          {children}
        </td>
      ),

      // Lists
      ul: ({ node, children, ...props }: any) => (
        <ul className="my-4 pl-6 list-disc space-y-1.5" {...props}>
          {children}
        </ul>
      ),
      ol: ({ node, children, ...props }: any) => (
        <ol className="my-4 pl-6 list-decimal space-y-1.5" {...props}>
          {children}
        </ol>
      ),
      li: ({ node, children, ...props }: any) => (
        <li className="leading-relaxed" {...props}>
          {children}
        </li>
      ),

      // Horizontal Rule
      hr: ({ ...props }: any) => (
        <hr
          className="my-8 border-t"
          style={{ borderColor: 'var(--md-border)' }}
          {...props}
        />
      ),

      // Links
      a: ({ node, href, children, ...props }: any) => {
        const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
          if (!href) return;

          // 1. Anchor link trong cùng tài liệu (#slug)
          if (href.startsWith('#')) {
            e.preventDefault();
            const slug = href.substring(1);
            onSelectHeading?.(slug);
            return;
          }

          // 2. Link ra website bên ngoài (khác origin hiện tại)
          const isHttp = href.startsWith('http://') || href.startsWith('https://');
          if (isHttp) {
            try {
              const url = new URL(href);
              if (typeof window !== 'undefined' && url.origin !== window.location.origin) {
                // Cho phép trình duyệt mở tab mới bình thường
                return;
              }
            } catch (e) {}
          }

          // 3. Link nội bộ hoặc liên kết tài liệu trong workspace
          if (onNavigateLink) {
            e.preventDefault();
            onNavigateLink(href);
          }
        };

        const isExternal =
          href?.startsWith('http') &&
          typeof window !== 'undefined' &&
          !href.startsWith(window.location.origin);

        return (
          <a
            href={href}
            onClick={handleClick}
            className="underline underline-offset-4 font-medium transition-colors hover:opacity-80 cursor-pointer"
            style={{ color: 'var(--md-accent)' }}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            {...props}
          >
            {children}
          </a>
        );
      }
    };
  }, [onSelectHeading, onNavigateLink]);

  return (
    <div
      ref={container}
      className="h-full overflow-y-auto px-8 py-10 transition-colors selection:bg-indigo-500/30 custom-scrollbar"
      style={{
        backgroundColor: 'var(--md-bg-primary)',
        color: 'var(--md-text-primary)',
        fontFamily: 'var(--md-font-family)',
        fontSize: 'var(--md-font-size)',
        lineHeight: 'var(--md-line-height)',
        fontWeight: 400,
        fontStyle: 'normal'
      }}
    >
      <div className="max-w-4xl mx-auto">
        <ReactMarkdown
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
});

MarkdownViewer.displayName = 'MarkdownViewer';
