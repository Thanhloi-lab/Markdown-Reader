import React from 'react';
import { createRoot } from 'react-dom/client';
import { ExtensionApp } from '../app/ExtensionApp';
import './contentScript.css';

/**
 * Content Script tự động nhận diện file Markdown (.md, .markdown)
 * và render giao diện formatted hiện đại thay thế nội dung thô.
 */
function initMarkdownReader() {
  const url = window.location.href;
  const isMdFile = /\.m(?:ark)?d(?:own)?(?:[?#]|$)/i.test(url);

  if (!isMdFile) {
    return;
  }

  // Lấy nội dung raw text của Markdown từ thẻ <pre> (mặc định của Chrome/Edge khi mở file text)
  const preEl = document.querySelector('pre');
  let rawContent = '';

  if (preEl) {
    rawContent = preEl.innerText;
  } else if (document.body) {
    rawContent = document.body.innerText;
  }

  // Nếu không có nội dung thì không làm gì
  if (!rawContent && rawContent !== '') {
    return;
  }

  console.log('[MarkdownReader Extension] Đã phát hiện tài liệu Markdown, tiến hành chuyển đổi giao diện...');

  // Reset body và chèn container React
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
