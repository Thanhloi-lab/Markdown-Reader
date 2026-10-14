export const sampleMarkdownContent = `# h1 Heading 😎

## h2 Heading

### h3 Heading

#### h4 Heading

##### h5 Heading

###### h6 Heading

## Typographic replacements

\`+- (c) (C) (r) (R) (tm) (TM)\`

± © ® ™

\`!!!!!! ???? ,, -- ---\`

!!! ??? , – —

\`example.. example... example..... example?..... example!....\`

example... example... example... example?.. example!..

\`"Smartypants, double quotes" and 'single quotes'\`

“Smartypants, double quotes” and ‘single quotes’

## Emphasis

*This is italic text*

**This is bold text**

***This is bold and italic text***

~~This is strikethrough text~~

## Blockquotes

> Blockquotes can also be nested...
>> ...by using additional greater-than signs right next to each other...
> > > ...or with spaces between arrows.

## Lists

Unordered:
- Create a list by starting a line with \`+\`, \`-\`, or \`*\`
- Sub-lists are made by indenting 2 spaces:
  - Marker character change forces new list start:
    - Ac tristique libero volutpat at
    - Facilisis in pretium nisl aliquet
- Very easy!

Ordered:
1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa

## Code

Inline \`code\`

### Indented code

    // Some comments with Indented code
    line 1 of code
    line 2 of code
    line 3 of code

### Syntax highlighting

\`\`\`typescript
function factorial(n: number): number {
  if (n === 0) {
    return 1
  }
  return n * factorial(n - 1)
}

const num: number = 5
console.log(\`The factorial of \${num} is \${factorial(num)}\`)
\`\`\`

## Tables

| Option | Description |
| :--- | :--- |
| data | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext | extension to be used for dest files. |

### Right aligned columns

| Option | Description |
| ---: | ---: |
| data | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext | extension to be used for dest files. |

## Horizontal Rules

---

## Links

[Link to GitHub](https://github.com)
[Autolink](https://google.com)

## Images

![Antigravity Preview](https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80)

## Plugins

### Emoji

Classic markup: :wink: :crush: :cry: :tear: :laughing: :stuck_out_tongue:
Shortcuts: :smile: :heart: :rocket: :fire: :sparkles:

### Subscript / Superscript

- 19^th^
- H~2~O

### Task lists

- [x] Thiết kế kiến trúc Monorepo đa nền tảng
- [x] Tạo Sidebar 2 tab (Cây thư mục + Chỉ mục TOC)
- [x] Đồng bộ Scrollspy theo thời gian thực
- [ ] Mở rộng Chrome Web Extension và Desktop Tauri

### KaTeX

Công thức toán học inline: $E = mc^2$ hoặc $a^2 + b^2 = c^2$.

Công thức toán học dạng khối (Block Equation):

$$
\\frac{1}{\\sigma \\sqrt{2\\pi}} \\int_{-\\infty}^{\\infty} e^{-\\frac{(x - \\mu)^2}{2\\sigma^2}} dx = 1
$$

$$
f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x - a)^n
$$

### Mermaid

Biểu đồ tuần tự (Sequence Diagram) và quy trình hoạt động:

\`\`\`mermaid
flowchart TD
    A[Markdown File] --> B[AST Parser]
    B --> C[TOC Extractor]
    B --> D[Renderer]
    C --> E[Sidebar Outline Tab]
    D --> F[Active Viewer]
    E -. Jump / Scroll .-> F
    F -. Scrollspy Sync .-> E
\`\`\`

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor User
    participant Webview as Shared UI
    participant Core as Markdown Engine
    User->>Webview: Mở file .md
    Webview->>Core: Phân tích TOC & Render AST
    Core-->>Webview: Danh sách Heading H1-H6
    User->>Webview: Cuộn trang đọc
    Webview->>Webview: Highlight mục TOC tương ứng
\`\`\`

### <ins>

<ins>Gạch chân nội dung (Inserted text)</ins>

### <mark>

<mark>Nổi bật nội dung (Highlighted text)</mark>

### Alert

> [!NOTE]
> Đây là một ghi chú quan trọng theo chuẩn GitHub Callout.

> [!TIP]
> Bạn có thể bấm vào bất kỳ tiêu đề nào ở thanh mục lục bên trái để nhảy ngay đến phần tương ứng!

> [!IMPORTANT]
> Toàn bộ màu sắc và chủ đề biểu đồ có thể tùy chỉnh trực tiếp qua nút Bảng màu (Palette) trên thanh công cụ.

> [!WARNING]
> Luôn lưu trữ tài liệu cẩn thận trước khi thực hiện các thay đổi lớn.

> [!CAUTION]
> Thao tác xóa thư mục sẽ không thể khôi phục nếu không có bản sao lưu.
`;

export const sampleFiles = [
  {
    id: 'f1',
    name: 'sample.md',
    path: 'sample.md',
    isDirectory: false,
    content: sampleMarkdownContent
  },
  {
    id: 'f2',
    name: 'docs',
    path: 'docs',
    isDirectory: true,
    children: [
      {
        id: 'f2-1',
        name: 'architecture.md',
        path: 'docs/architecture.md',
        isDirectory: false,
        content: `# Kiến trúc Hệ thống Monorepo

## Tổng quan
Mô hình Monorepo chia tách rõ ràng:
- packages/core
- packages/ui
- apps/web
- apps/vscode
`
      },
      {
        id: 'f2-2',
        name: 'theming.md',
        path: 'docs/theming.md',
        isDirectory: false,
        content: `# Hướng dẫn Tùy chỉnh Theme Động

## CSS Variables
Hệ thống sử dụng các biến CSS trên \`:root\`:
- \`--md-bg-primary\`
- \`--md-text-primary\`
- \`--md-accent\`
`
      }
    ]
  },
  {
    id: 'f3',
    name: 'README.md',
    path: 'README.md',
    isDirectory: false,
    content: `# Markdown Reader & Formatter

Ứng dụng đọc và định dạng Markdown đa nền tảng.
`
  },
  {
    id: 'f4',
    name: 'config.json',
    path: 'config.json',
    isDirectory: false,
    content: `{
  "appName": "Markdown Reader & Multi-Format Outline",
  "version": "1.0.0",
  "theme": {
    "default": "obsidian-dark",
    "dynamicColors": true
  },
  "supportedFormats": [
    "md",
    "json",
    "xml",
    "cs",
    "ts",
    "js",
    "html"
  ],
  "workspace": {
    "persistence": "IndexedDB",
    "multiRoot": true
  }
}`
  },
  {
    id: 'f5',
    name: 'data.xml',
    path: 'data.xml',
    isDirectory: false,
    content: `<?xml version="1.0" encoding="UTF-8"?>
<application id="markdown-reader">
  <metadata>
    <title>Markdown Reader Multi-Format</title>
    <author>Deepmind Team</author>
  </metadata>
  <features>
    <feature enabled="true">TOC Scrollspy</feature>
    <feature enabled="true">Dynamic Theming</feature>
    <feature enabled="true">Multi-Folder Workspace</feature>
    <feature enabled="true">Code & Data Viewer</feature>
  </features>
</application>`
  },
  {
    id: 'f6',
    name: 'Program.cs',
    path: 'Program.cs',
    isDirectory: false,
    content: `using System;

namespace MarkdownReader
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Console.WriteLine("Markdown Reader & Multi-Format Viewer initialized!");
        }
    }
}`
  }
];
