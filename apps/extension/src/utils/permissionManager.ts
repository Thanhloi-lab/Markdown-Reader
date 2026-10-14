/**
 * Tiện ích kiểm tra và xử lý quyền truy cập file local (file:///)
 * cho Web Extension theo chuẩn Manifest V3.
 */

export interface PermissionStatus {
  isAllowedFileAccess: boolean;
  extensionId: string;
}

/**
 * Kiểm tra xem người dùng đã bật toggle 'Allow access to file URLs' chưa
 */
export async function checkFileSchemeAccess(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.extension && chrome.extension.isAllowedFileSchemeAccess) {
      chrome.extension.isAllowedFileSchemeAccess((isAllowed) => {
        resolve(Boolean(isAllowed));
      });
    } else {
      resolve(false);
    }
  });
}

/**
 * Lấy URL dẫn thẳng tới trang cài đặt chi tiết của Extension để bật quyền
 */
export function getExtensionSettingsUrl(): string {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    return `chrome://extensions/?id=${chrome.runtime.id}`;
  }
  return 'chrome://extensions';
}

/**
 * Mở tab cài đặt tiện ích cho người dùng thao tác
 */
export function openExtensionSettings(): void {
  const url = getExtensionSettingsUrl();
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
    chrome.tabs.create({ url });
  } else {
    window.open(url, '_blank');
  }
}
