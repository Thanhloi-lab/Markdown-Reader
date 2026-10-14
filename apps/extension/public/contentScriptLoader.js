(async () => {
  try {
    const src = chrome.runtime.getURL('contentScript.js');
    await import(src);
  } catch (err) {
    console.error('[MarkdownReader Extension] Lỗi nạp content script:', err);
  }
})();
