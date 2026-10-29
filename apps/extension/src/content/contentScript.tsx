import React from 'react';
import { createRoot } from 'react-dom/client';
import { isHtmlContent, isMarkdownContent } from '@markdown-reader/core';
import { ExtensionApp } from '../app/ExtensionApp';
import './contentScript.css';

/**
 * Kiểm tra xem trang web hiện tại có phải là trình xem tệp thô (raw text viewer) của trình duyệt hay không.
 * Nếu là một trang web HTML bình thường (như GitHub compare, PR, GitLab, blog...) thì trả về false để KHÔNG can thiệp.
 */
function isBrowserRawViewer(): boolean {
  // 1. Nếu là giao thức web (http:// hoặc https://) và Content-Type là text/html -> 100% là website HTML, không can thiệp
  if (window.location.protocol.startsWith('http') && document.contentType) {
    if (document.contentType.toLowerCase().includes('text/html')) {
      return false;
    }
  }

  // 2. Kiểm tra các thẻ đặc trưng của website HTML thông thường
  // Trình xem file text thô của Chromium KHÔNG BAO GIỜ có các thẻ ngữ nghĩa của website
  const hasWebpageElements = document.querySelector(
    'header, nav, footer, main, form, input, button, table, article, aside, [role="navigation"], [role="banner"], [role="main"]'
  );
  if (hasWebpageElements) {
    return false;
  }

  // 3. Kiểm tra cấu trúc DOM đặc trưng của Chromium raw text viewer:
  // Khi mở file text thô, Chrome luôn tạo cấu trúc: <body><pre style="...">NỘI DUNG</pre></body>
  // Thẻ <pre> bắt buộc phải là con trực tiếp của <body> (body > pre)
  const body = document.body;
  if (!body) {
    return false;
  }

  const directPre = body.querySelector(':scope > pre');
  if (!directPre) {
    return false;
  }

  // Lọc các thẻ do Extension hoặc các script inject chèn vào
  const meaningfulChildren = Array.from(body.children).filter(
    el =>
      el.id !== 'markdown-reader-extension-root' &&
      el.tagName !== 'SCRIPT' &&
      el.tagName !== 'STYLE' &&
      el.tagName !== 'LINK'
  );

  // Trình xem file thô chỉ có đúng 1 phần tử duy nhất trong body là thẻ <pre>
  if (meaningfulChildren.length !== 1 || meaningfulChildren[0] !== directPre) {
    return false;
  }

  return true;
}

/**
 * Khởi tạo Markdown Reader sau khi kiểm tra định dạng thông qua các ký tự trong nội dung file.
 */
function initMarkdownReader() {
  // BƯỚC 1: Kiểm tra xem trang có phải là trình xem tệp thô hay là trang web HTML (như Git compare, PR...)
  if (!isBrowserRawViewer()) {
    return;
  }

  // BƯỚC 2: Lấy thẻ <pre> con trực tiếp của <body>
  const preEl = document.querySelector<HTMLPreElement>('body > pre');
  if (!preEl) {
    return;
  }

  const rawContent = preEl.textContent || preEl.innerText || '';
  if (!rawContent.trim()) {
    return;
  }

  // BƯỚC 3: Kiểm tra định dạng dựa trên các KÝ TỰ trong nội dung file (Content-Based Sniffing)
  // 3a. Nếu nội dung thực chất là HTML (chứa <!DOCTYPE html>, <html, v.v.) thì bỏ qua ngay!
  if (isHtmlContent(rawContent)) {
    console.log('[MarkdownReader Extension] Nội dung file thực chất là HTML, bỏ qua.');
    return;
  }

  // 3b. Kiểm tra xem nội dung có các cú pháp đặc trưng của Markdown hay không
  if (!isMarkdownContent(rawContent, window.location.href)) {
    console.log('[MarkdownReader Extension] Nội dung không phải định dạng Markdown, bỏ qua.');
    return;
  }

  console.log('[MarkdownReader Extension] Đã xác nhận định dạng Markdown qua ký tự nội dung. Tiến hành nạp giao diện...');

  // BƯỚC 4: Chuyển đổi giao diện sang Markdown Reader
  document.body.innerHTML = '';
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.overflow = 'hidden';
  document.body.style.backgroundColor = '#0d0f14';

  const rootContainer = document.createElement('div');
  rootContainer.id = 'markdown-reader-extension-root';
  rootContainer.style.width = '100vw';
  rootContainer.style.height = '100vh';
  document.body.appendChild(rootContainer);

  const root = createRoot(rootContainer);
  root.render(<ExtensionApp initialRawContent={rawContent} />);
}

// Khởi chạy khi DOM đã sẵn sàng
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMarkdownReader);
} else {
  initMarkdownReader();
}
