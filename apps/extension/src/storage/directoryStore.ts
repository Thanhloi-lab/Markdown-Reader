/**
 * Quản lý lưu trữ và khôi phục FileSystemDirectoryHandle qua IndexedDB.
 * Giúp người dùng chỉ cần cấp quyền 1 lần duy nhất cho thư mục dự án,
 * sau đó khi mở bất kỳ file .md nào thuộc thư mục đó sẽ tự động khôi phục lại cây thư mục.
 */

const DB_NAME = 'markdown_reader_extension_db';
const DB_VERSION = 1;
const STORE_NAME = 'directory_handles';

interface StoredDirectoryRecord {
  name: string;
  handle: FileSystemDirectoryHandle;
  pathHint?: string;
  updatedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB không được hỗ trợ trong môi trường này'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'name' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Lưu một DirectoryHandle vào IndexedDB
 */
export async function saveDirectoryHandle(
  handle: FileSystemDirectoryHandle,
  pathHint?: string
): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record: StoredDirectoryRecord = {
        name: handle.name,
        handle,
        pathHint,
        updatedAt: Date.now()
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[DirectoryStore] Không thể lưu DirectoryHandle vào IndexedDB:', err);
  }
}

/**
 * Lấy tất cả DirectoryHandle đã lưu
 */
export async function getAllDirectoryHandles(): Promise<StoredDirectoryRecord[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[DirectoryStore] Lỗi đọc DirectoryHandles:', err);
    return [];
  }
}

/**
 * Xóa một DirectoryHandle đã lưu theo tên
 */
export async function removeDirectoryHandle(name: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(name);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[DirectoryStore] Lỗi xóa DirectoryHandle:', err);
  }
}

/**
 * Tìm DirectoryHandle đã lưu khớp với bất kỳ cấp thư mục nào trong chuỗi đường dẫn
 * Ví dụ: URL chứa .../ubo-details_results/.../country=hk/.../file.md
 * sẽ ưu tiên tìm handle có tên 'country=hk', sau đó 'ubo-details_results'
 */
export async function findMatchingHandleForPath(
  pathParts: string[]
): Promise<StoredDirectoryRecord | null> {
  const records = await getAllDirectoryHandles();
  if (records.length === 0) return null;

  // Duyệt ngược từ thư mục con gần nhất lên thư mục cha
  for (let i = pathParts.length - 2; i >= 0; i--) {
    const folderName = pathParts[i];
    if (!folderName || folderName.includes(':')) continue; // Bỏ qua ổ đĩa C:

    const matched = records.find(r => r.name.toLowerCase() === folderName.toLowerCase());
    if (matched) {
      return matched;
    }
  }

  return null;
}

/**
 * Kiểm tra hoặc yêu cầu quyền truy cập vào DirectoryHandle
 */
export async function verifyDirectoryPermission(
  handle: FileSystemDirectoryHandle,
  requestIfNeeded = false
): Promise<boolean> {
  try {
    // @ts-ignore
    const current = await handle.queryPermission({ mode: 'read' });
    if (current === 'granted') return true;

    if (requestIfNeeded) {
      // @ts-ignore
      const requested = await handle.requestPermission({ mode: 'read' });
      return requested === 'granted';
    }
  } catch (err) {
    console.warn('[DirectoryStore] Lỗi kiểm tra quyền:', err);
  }
  return false;
}
