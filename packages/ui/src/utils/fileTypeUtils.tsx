import React from 'react';
import {
  FileText,
  FileCode,
  FileCode2,
  FileJson,
  Braces,
  Code2,
  Database,
  FileSpreadsheet,
  Terminal,
  File
} from 'lucide-react';
import { detectContentLanguage } from '@markdown-reader/core';

export interface FileTypeInfo {
  extension: string;
  language: string;
  isMarkdown: boolean;
  category: 'markdown' | 'code' | 'data' | 'text';
  icon: React.ElementType;
  iconColor: string;
  badge: string;
}

export const SUPPORTED_EXTENSIONS = [
  // Markdown
  '.md', '.markdown', '.mdx',
  // Data formats
  '.json', '.xml', '.yaml', '.yml', '.toml', '.csv',
  // Web & Scripting
  '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss',
  // Backend & Compiled
  '.cs', '.java', '.py', '.go', '.rs', '.cpp', '.c', '.h', '.sql',
  // Scripts & Config
  '.sh', '.bat', '.ps1', '.txt', '.log', '.env', '.gitignore'
];

export function isSupportedFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  const baseName = lower.split(/[\\/]/).pop() || '';
  if (['readme', 'license', 'changelog', 'contributing', 'todo', 'authors', 'notes'].includes(baseName)) {
    return true;
  }
  return SUPPORTED_EXTENSIONS.some(ext => lower.endsWith(ext));
}

export function getFileTypeInfo(fileName: string, content?: string): FileTypeInfo {
  const lower = fileName.toLowerCase();
  const extMatch = lower.match(/\.([a-z0-9]+)$/);
  const ext = extMatch ? `.${extMatch[1]}` : '';

  // Ưu tiên kiểm tra định dạng thông qua các ký tự trong nội dung file nếu có content
  if (content !== undefined && content.trim().length > 0) {
    const detectedLang = detectContentLanguage(content, fileName);

    switch (detectedLang) {
      case 'markdown':
        return {
          extension: ext || '.md',
          language: 'markdown',
          isMarkdown: true,
          category: 'markdown',
          icon: FileText,
          iconColor: '#6366f1',
          badge: 'MD'
        };

      case 'json':
        return {
          extension: ext || '.json',
          language: 'json',
          isMarkdown: false,
          category: 'data',
          icon: FileJson,
          iconColor: '#f59e0b',
          badge: 'JSON'
        };

      case 'html':
        return {
          extension: ext || '.html',
          language: 'html',
          isMarkdown: false,
          category: 'code',
          icon: Code2,
          iconColor: '#ea580c',
          badge: 'HTML'
        };

      case 'xml':
        return {
          extension: ext || '.xml',
          language: 'xml',
          isMarkdown: false,
          category: 'data',
          icon: Code2,
          iconColor: '#f97316',
          badge: 'XML'
        };

      case 'yaml':
        return {
          extension: ext || '.yaml',
          language: 'yaml',
          isMarkdown: false,
          category: 'data',
          icon: Braces,
          iconColor: '#e11d48',
          badge: 'YAML'
        };

      case 'python':
        return {
          extension: ext || '.py',
          language: 'python',
          isMarkdown: false,
          category: 'code',
          icon: FileCode,
          iconColor: '#10b981',
          badge: 'PY'
        };

      case 'typescript':
        return {
          extension: ext || '.ts',
          language: 'typescript',
          isMarkdown: false,
          category: 'code',
          icon: FileCode2,
          iconColor: '#3b82f6',
          badge: ext === '.tsx' ? 'TSX' : 'TS'
        };

      case 'javascript':
        return {
          extension: ext || '.js',
          language: 'javascript',
          isMarkdown: false,
          category: 'code',
          icon: FileCode2,
          iconColor: '#eab308',
          badge: ext === '.jsx' ? 'JSX' : 'JS'
        };

      case 'csharp':
        return {
          extension: ext || '.cs',
          language: 'csharp',
          isMarkdown: false,
          category: 'code',
          icon: FileCode,
          iconColor: '#a855f7',
          badge: 'C#'
        };

      case 'shell':
        return {
          extension: ext || '.sh',
          language: 'shell',
          isMarkdown: false,
          category: 'code',
          icon: Terminal,
          iconColor: '#64748b',
          badge: 'CLI'
        };

      case 'sql':
        return {
          extension: ext || '.sql',
          language: 'sql',
          isMarkdown: false,
          category: 'data',
          icon: Database,
          iconColor: '#0284c7',
          badge: 'SQL'
        };
    }
  }

  // Fallback: Kiểm tra định dạng theo đuôi mở rộng file (Extension-based)
  switch (ext) {
    case '.md':
    case '.markdown':
    case '.mdx':
      return {
        extension: ext,
        language: 'markdown',
        isMarkdown: true,
        category: 'markdown',
        icon: FileText,
        iconColor: '#6366f1', // Indigo
        badge: 'MD'
      };

    case '.json':
      return {
        extension: ext,
        language: 'json',
        isMarkdown: false,
        category: 'data',
        icon: FileJson,
        iconColor: '#f59e0b', // Amber
        badge: 'JSON'
      };

    case '.xml':
      return {
        extension: ext,
        language: 'xml',
        isMarkdown: false,
        category: 'data',
        icon: Code2,
        iconColor: '#f97316', // Orange
        badge: 'XML'
      };

    case '.yaml':
    case '.yml':
      return {
        extension: ext,
        language: 'yaml',
        isMarkdown: false,
        category: 'data',
        icon: Braces,
        iconColor: '#e11d48', // Rose
        badge: 'YAML'
      };

    case '.csv':
      return {
        extension: ext,
        language: 'csv',
        isMarkdown: false,
        category: 'data',
        icon: FileSpreadsheet,
        iconColor: '#10b981', // Emerald
        badge: 'CSV'
      };

    case '.ts':
    case '.tsx':
      return {
        extension: ext,
        language: 'typescript',
        isMarkdown: false,
        category: 'code',
        icon: FileCode2,
        iconColor: '#3b82f6', // Blue
        badge: ext === '.tsx' ? 'TSX' : 'TS'
      };

    case '.js':
    case '.jsx':
      return {
        extension: ext,
        language: 'javascript',
        isMarkdown: false,
        category: 'code',
        icon: FileCode2,
        iconColor: '#eab308', // Yellow
        badge: ext === '.jsx' ? 'JSX' : 'JS'
      };

    case '.cs':
      return {
        extension: ext,
        language: 'csharp',
        isMarkdown: false,
        category: 'code',
        icon: FileCode,
        iconColor: '#a855f7', // Purple C#
        badge: 'C#'
      };

    case '.html':
      return {
        extension: ext,
        language: 'html',
        isMarkdown: false,
        category: 'code',
        icon: Code2,
        iconColor: '#ea580c', // Orange-red
        badge: 'HTML'
      };

    case '.css':
    case '.scss':
      return {
        extension: ext,
        language: 'css',
        isMarkdown: false,
        category: 'code',
        icon: FileCode,
        iconColor: '#06b6d4', // Cyan
        badge: 'CSS'
      };

    case '.py':
      return {
        extension: ext,
        language: 'python',
        isMarkdown: false,
        category: 'code',
        icon: FileCode,
        iconColor: '#10b981', // Green
        badge: 'PY'
      };

    case '.java':
      return {
        extension: ext,
        language: 'java',
        isMarkdown: false,
        category: 'code',
        icon: FileCode,
        iconColor: '#ef4444', // Red
        badge: 'JAVA'
      };

    case '.sql':
      return {
        extension: ext,
        language: 'sql',
        isMarkdown: false,
        category: 'data',
        icon: Database,
        iconColor: '#0284c7', // Sky
        badge: 'SQL'
      };

    case '.sh':
    case '.bat':
    case '.ps1':
      return {
        extension: ext,
        language: 'shell',
        isMarkdown: false,
        category: 'code',
        icon: Terminal,
        iconColor: '#64748b',
        badge: 'CLI'
      };

    default:
      return {
        extension: ext,
        language: 'plaintext',
        isMarkdown: false,
        category: 'text',
        icon: FileText,
        iconColor: '#94a3b8', // Gray
        badge: ext.replace('.', '').toUpperCase() || 'TXT'
      };
  }
}
