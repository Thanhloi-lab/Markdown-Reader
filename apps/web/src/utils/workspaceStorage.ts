import { FileNode } from '@markdown-reader/ui';

const DB_NAME = 'markdown_reader_workspace_db';
const DB_VERSION = 1;
const STORE_FOLDERS = 'workspace_folders';
const STORE_META = 'workspace_meta';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_FOLDERS)) {
        db.createObjectStore(STORE_FOLDERS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Lưu danh sách các thư mục gốc trong Workspace vào IndexedDB
 */
export async function saveWorkspaceFolders(folders: FileNode[]): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction([STORE_FOLDERS], 'readwrite');
    const store = tx.objectStore(STORE_FOLDERS);

    // Xóa dữ liệu cũ và lưu danh sách mới
    await new Promise<void>((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
    });

    for (const folder of folders) {
      store.put(folder);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Lỗi khi lưu workspace folders vào IndexedDB:', err);
  }
}

/**
 * Lấy toàn bộ thư mục workspace từ IndexedDB
 */
export async function loadWorkspaceFolders(): Promise<FileNode[]> {
  try {
    const db = await openDatabase();
    const tx = db.transaction([STORE_FOLDERS], 'readonly');
    const store = tx.objectStore(STORE_FOLDERS);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Lỗi khi tải workspace folders từ IndexedDB:', err);
    return [];
  }
}

/**
 * Lưu thông tin metadata (ví dụ đường dẫn file active)
 */
export async function saveActivePath(activePath: string): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction([STORE_META], 'readwrite');
    tx.objectStore(STORE_META).put({ key: 'activeFilePath', value: activePath });
  } catch (err) {
    console.warn('Lỗi khi lưu activeFilePath vào IndexedDB:', err);
  }
}

/**
 * Lấy đường dẫn file active đã lưu
 */
export async function loadActivePath(): Promise<string | null> {
  try {
    const db = await openDatabase();
    const tx = db.transaction([STORE_META], 'readonly');
    const store = tx.objectStore(STORE_META);
    const request = store.get('activeFilePath');

    return new Promise(resolve => {
      request.onsuccess = () => resolve(request.result ? request.result.value : null);
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
}
