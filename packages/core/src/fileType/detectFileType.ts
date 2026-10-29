export type DetectedLanguage =
  | 'markdown'
  | 'json'
  | 'html'
  | 'xml'
  | 'yaml'
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'csharp'
  | 'css'
  | 'sql'
  | 'shell'
  | 'plaintext';

export interface FileContentAnalysis {
  language: DetectedLanguage;
  isMarkdown: boolean;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

/**
 * Kiểm tra xem nội dung văn bản có phải là tài liệu HTML (webpage) hay không.
 */
export function isHtmlContent(text: string): boolean {
  if (!text) return false;
  const trimmed = text.trim();

  // 1. Khai báo DOCTYPE HTML chuẩn
  if (/^<!DOCTYPE\s+html/i.test(trimmed)) {
    return true;
  }

  // 2. Thẻ mở <html>, <head> hoặc <body> ở đầu tài liệu
  if (/^<html[\s>]/i.test(trimmed) || /^<head[\s>]/i.test(trimmed) || /^<body[\s>]/i.test(trimmed)) {
    return true;
  }

  // 3. Chứa cặp thẻ <html ...>...</html> hoặc <body ...>...</body>
  if (/<html[\s\S]*<\/html>/i.test(trimmed) && /<body[\s\S]*<\/body>/i.test(trimmed)) {
    return true;
  }

  // 4. Bắt đầu bằng thẻ tag và chứa các thẻ đặc trưng của webpage (script, style, meta, div)
  if (/^<(!|[a-z0-9-]+)[\s>]/i.test(trimmed)) {
    const hasClosingWebTags = /<\/(div|p|script|style|table|body|html|section|main|nav|header)>/i.test(trimmed);
    const hasMetaOrLink = /<(meta|link|script|style)[\s>]/i.test(trimmed);
    if (hasClosingWebTags && hasMetaOrLink) {
      return true;
    }
  }

  return false;
}

/**
 * Kiểm tra xem nội dung có phải là JSON hợp lệ hay không.
 */
export function isJsonContent(text: string): boolean {
  if (!text) return false;
  const trimmed = text.trim();

  const isObject = trimmed.startsWith('{') && trimmed.endsWith('}');
  const isArray = trimmed.startsWith('[') && trimmed.endsWith(']');

  if (!isObject && !isArray) {
    return false;
  }

  // Thử parse nếu dung lượng < 1MB
  if (trimmed.length < 1000000) {
    try {
      JSON.parse(trimmed);
      return true;
    } catch {
      return false;
    }
  }

  return true;
}

/**
 * Kiểm tra xem nội dung có phải là XML hoặc SVG hay không.
 */
export function isXmlContent(text: string): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  if (/^<\?xml[\s>]/i.test(trimmed)) return true;
  if (/^<svg[\s>]/i.test(trimmed) && /<\/svg>$/i.test(trimmed)) return true;
  return false;
}

/**
 * Kiểm tra xem nội dung có phải là YAML thuần hay không.
 */
export function isYamlContent(text: string): boolean {
  if (!text) return false;
  const trimmed = text.trim();

  // Bắt đầu bằng '---' và tiếp nối bởi cấu trúc key: value
  if (/^---\r?\n\s*[\w.-]+:\s+[^\n]+/m.test(trimmed)) {
    // Nếu có '---' thứ hai và phần sau là văn bản thường thì là Markdown Frontmatter!
    const match = trimmed.match(/^---\r?\n[\s\S]*?\r?\n---(\r?\n[\s\S]*)$/);
    if (match && match[1].trim().length > 0) {
      return false; // Là Markdown có Frontmatter!
    }
    return true; // Thuần cấu hình YAML
  }

  return false;
}

/**
 * Kiểm tra xem nội dung có phải là Markdown thực thụ hay không.
 * Luôn loại trừ nếu nội dung thực chất là HTML hoặc JSON.
 */
export function isMarkdownContent(text: string, fileNameOrUrl: string = ''): boolean {
  if (!text) return false;

  // Nếu là trang web HTML thì tuyệt đối không phải Markdown
  if (isHtmlContent(text)) {
    return false;
  }

  // Nếu là JSON hợp lệ thì không phải Markdown
  if (isJsonContent(text)) {
    return false;
  }

  const trimmed = text.trim();

  // Điểm số nhận diện Markdown dựa trên các ký tự cú pháp đặc thù
  let score = 0;

  // Tiêu đề Markdown (# Heading)
  if (/^#{1,6}\s+\S/m.test(trimmed)) score += 3;

  // Frontmatter (--- \n ... \n ---)
  if (/^---\r?\n[\s\S]*?\r?\n---/m.test(trimmed)) score += 3;

  // Code block fences (```code```)
  if (/```[\s\S]*?```/.test(trimmed)) score += 2;

  // Liên kết Markdown ([text](url) hoặc ![alt](url))
  if (/!?\[[^\]\n]+\]\([^)\n\s]+\)/.test(trimmed)) score += 2;

  // Danh sách Markdown (- item hoặc * item hoặc 1. item)
  if (/^\s*[-*+]\s+\S/m.test(trimmed) || /^\s*\d+\.\s+\S/m.test(trimmed)) score += 1;

  // Trích dẫn blockquote (> quote)
  if (/^\s*>\s+\S/m.test(trimmed)) score += 1;

  // Bảng biểu Markdown (| col1 | col2 |)
  if (/\|[\s-:]+\|[\s-:]+\|/.test(trimmed)) score += 2;

  // Checklist (- [x] todo)
  if (/^\s*[-*+]\s+\[[ xX]\]\s+/m.test(trimmed)) score += 2;

  // Nếu đạt từ 2 điểm cú pháp trở lên -> Khẳng định là Markdown
  if (score >= 2) {
    return true;
  }

  // Nếu đuôi file/URL là .md, .markdown, .mdx và không phải code hay html
  const lowerName = fileNameOrUrl.toLowerCase();
  const hasMdExt = /\.m(?:ark)?d(?:own)?(?:[?#]|$)/i.test(lowerName);
  if (hasMdExt) {
    // Không chứa các ký tự đặc trưng của HTML hoặc Code biên dịch
    return true;
  }

  // Các file tài liệu quy ước chung không có đuôi (README, LICENSE, CHANGELOG)
  const baseName = lowerName.split(/[\\/]/).pop() || '';
  if (['readme', 'license', 'changelog', 'contributing', 'todo', 'notes'].includes(baseName)) {
    return true;
  }

  return false;
}

/**
 * Tự động phân tích và nhận diện loại file / ngôn ngữ dựa trên các ký tự nội dung.
 */
export function detectContentLanguage(content: string = '', fileName: string = ''): DetectedLanguage {
  const trimmed = content?.trim() || '';

  // 1. Kiểm tra HTML: Nếu phát hiện thẻ doctype, html -> HTML (Kể cả khi tên file là .md)
  if (isHtmlContent(trimmed)) {
    return 'html';
  }

  // 2. Kiểm tra JSON: Bắt đầu { hoặc [ và parse JSON hợp lệ
  if (isJsonContent(trimmed)) {
    return 'json';
  }

  // 3. Kiểm tra XML/SVG
  if (isXmlContent(trimmed)) {
    return 'xml';
  }

  // 4. Kiểm tra Shebang ở đầu script (ví dụ: #!/bin/bash, #!/usr/bin/env python)
  if (trimmed.startsWith('#!')) {
    const firstLine = trimmed.split('\n')[0].toLowerCase();
    if (firstLine.includes('python')) return 'python';
    if (firstLine.includes('node') || firstLine.includes('deno')) return 'javascript';
    if (firstLine.includes('bash') || firstLine.includes('sh')) return 'shell';
  }

  // 5. Kiểm tra YAML thuần
  if (isYamlContent(trimmed)) {
    return 'yaml';
  }

  // 6. Kiểm tra Markdown
  if (isMarkdownContent(trimmed, fileName)) {
    return 'markdown';
  }

  // 7. Nhận diện các cú pháp code thông dụng từ nội dung
  if (/^import\s+.*\s+from\s+['"].*['"]/m.test(trimmed) || /^export\s+(default\s+)?(function|const|class|interface|type)\s+/m.test(trimmed)) {
    return fileName.endsWith('.tsx') || fileName.endsWith('.ts') ? 'typescript' : 'javascript';
  }

  if (/^(def\s+\w+\(.*\):|class\s+\w+(\(.*\))?:|if\s+__name__\s*==\s*['"]__main__['"]:)/m.test(trimmed)) {
    return 'python';
  }

  if (/^(using\s+System(\.\w+)*;|namespace\s+[\w.]+\s*\{|public\s+class\s+\w+)/m.test(trimmed)) {
    return 'csharp';
  }

  if (/^(SELECT\s+.*\s+FROM|INSERT\s+INTO|CREATE\s+TABLE|ALTER\s+TABLE)\s+/i.test(trimmed)) {
    return 'sql';
  }

  // 8. Fallback dựa trên đuôi mở rộng của fileName
  if (fileName) {
    const ext = fileName.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
    if (ext) {
      switch (ext) {
        case 'md':
        case 'markdown':
        case 'mdx':
          return 'markdown';
        case 'json':
          return 'json';
        case 'html':
        case 'htm':
          return 'html';
        case 'xml':
        case 'svg':
          return 'xml';
        case 'yaml':
        case 'yml':
          return 'yaml';
        case 'ts':
        case 'tsx':
          return 'typescript';
        case 'js':
        case 'jsx':
          return 'javascript';
        case 'py':
          return 'python';
        case 'cs':
          return 'csharp';
        case 'css':
        case 'scss':
          return 'css';
        case 'sql':
          return 'sql';
        case 'sh':
        case 'bash':
        case 'bat':
        case 'ps1':
          return 'shell';
      }
    }
  }

  return 'plaintext';
}
