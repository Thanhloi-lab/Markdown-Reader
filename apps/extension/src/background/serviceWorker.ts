/**
 * Background Service Worker (Manifest V3)
 * Quản lý vòng đời tiện ích, kiểm tra quyền file local và xử lý thông điệp.
 */

// Lắng nghe sự kiện cài đặt tiện ích
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    chrome.extension.isAllowedFileSchemeAccess((isAllowed) => {
      // Nếu mới cài đặt và chưa bật quyền file máy tính, mở trang hướng dẫn
      if (!isAllowed) {
        chrome.tabs.create({ url: 'onboarding.html' });
      }
    });
  }
});

// Xử lý thông điệp gửi từ Content Script hoặc Popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_FILE_ACCESS') {
    chrome.extension.isAllowedFileSchemeAccess((isAllowed) => {
      sendResponse({ isAllowed: Boolean(isAllowed) });
    });
    return true; // Cho phép async response
  }

  if (message.type === 'OPEN_SETTINGS') {
    const url = `chrome://extensions/?id=${chrome.runtime.id}`;
    chrome.tabs.create({ url });
    sendResponse({ success: true });
    return true;
  }

  // Giao tiếp với Native Messaging Host để đọc thư mục trực tiếp không cần popup
  if (message.type === 'NATIVE_SCAN_DIRECTORY') {
    const hostName = 'com.markdown_reader.host';
    try {
      chrome.runtime.sendNativeMessage(
        hostName,
        {
          action: 'scanDirectory',
          path: message.path,
          activeFileName: message.activeFileName,
          activeFilePath: message.activeFilePath,
          shallow: message.shallow !== false
        },
        (response) => {
          const err = chrome.runtime.lastError;
          if (err) {
            console.error('[ServiceWorker] Native messaging error:', err.message);
            sendResponse({
              success: false,
              error: `${err.message} (Host: ${hostName}, ExtID: ${chrome.runtime.id})`
            });
          } else {
            sendResponse(response || { success: false, error: 'Không nhận được phản hồi từ Native Host' });
          }
        }
      );
    } catch (err: any) {
      console.error('[ServiceWorker] Exception in sendNativeMessage:', err);
      sendResponse({ success: false, error: err?.message || String(err) });
    }
    return true; // Cho phép async response
  }

  if (message.type === 'NATIVE_READ_FILE') {
    const hostName = 'com.markdown_reader.host';
    try {
      chrome.runtime.sendNativeMessage(
        hostName,
        {
          action: 'readFile',
          path: message.path
        },
        (response) => {
          const err = chrome.runtime.lastError;
          if (err) {
            console.error('[ServiceWorker] Native readFile error:', err.message);
            sendResponse({
              success: false,
              error: `${err.message} (Host: ${hostName}, ExtID: ${chrome.runtime.id})`
            });
          } else {
            sendResponse(response || { success: false, error: 'Không nhận được phản hồi từ Native Host' });
          }
        }
      );
    } catch (err: any) {
      console.error('[ServiceWorker] Exception in readFile sendNativeMessage:', err);
      sendResponse({ success: false, error: err?.message || String(err) });
    }
    return true;
  }
});

// Giám sát các tab khi mở file
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const isLocalFile = tab.url.startsWith('file:///');
    const isMd = /\.m(?:ark)?d(?:own)?(?:[?#]|$)/i.test(tab.url);

    if (isLocalFile && isMd) {
      chrome.extension.isAllowedFileSchemeAccess((isAllowed) => {
        if (!isAllowed) {
          // Báo biểu tượng chấm than nếu chưa cấp quyền
          chrome.action.setBadgeText({ tabId, text: '!' });
          chrome.action.setBadgeBackgroundColor({ tabId, color: '#f59e0b' });
        } else {
          chrome.action.setBadgeText({ tabId, text: '' });
        }
      });
    }
  }
});
