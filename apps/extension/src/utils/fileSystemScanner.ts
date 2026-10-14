import { FileNode, isSupportedFile } from '@markdown-reader/ui';

export interface ScanResult {
  rootNode: FileNode;
  fileCount: number;
  dirCount: number;
}

/**
 * Quét đệ quy FileSystemDirectoryHandle để tạo cây FileNode
 * Tối ưu hóa bộ nhớ: chỉ đọc nội dung file khi cần hoặc lazy load
 */
export async function scanDirectoryHandle(
  dirHandle: FileSystemDirectoryHandle,
  activeFileName?: string
): Promise<ScanResult> {
  let fileCount = 0;
  let dirCount = 0;

  async function traverse(
    handle: FileSystemDirectoryHandle,
    curPath: string
  ): Promise<FileNode[]> {
    const children: FileNode[] = [];

    // @ts-ignore
    for await (const entry of handle.values()) {
      const entryPath = curPath ? `${curPath}/${entry.name}` : entry.name;

      if (entry.kind === 'directory') {
        dirCount++;
        const subChildren = await traverse(entry as FileSystemDirectoryHandle, entryPath);
        // Chỉ thêm folder nếu có nội dung hoặc để user tiện xem cấu trúc
        children.push({
          id: entryPath,
          name: entry.name,
          path: entryPath,
          isDirectory: true,
          children: subChildren
        });
      } else if (entry.kind === 'file' && isSupportedFile(entry.name)) {
        fileCount++;
        let content: string | undefined = undefined;

        // Ưu tiên đọc trước nội dung nếu là file đang được mở trong tab
        if (activeFileName && entry.name.toLowerCase() === activeFileName.toLowerCase()) {
          try {
            const file = await (entry as FileSystemFileHandle).getFile();
            content = await file.text();
          } catch (e) {}
        }

        children.push({
          id: entryPath,
          name: entry.name,
          path: entryPath,
          isDirectory: false,
          content
        });
      }
    }

    // Sắp xếp: Thư mục lên trước, tệp xuống sau, theo thứ tự alphabet
    return children.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) {
        return a.isDirectory ? -1 : 1;
      }
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });
  }

  const rootChildren = await traverse(dirHandle, dirHandle.name);
  const rootNode: FileNode = {
    id: dirHandle.name,
    name: dirHandle.name,
    path: dirHandle.name,
    isDirectory: true,
    children: rootChildren
  };

  return { rootNode, fileCount, dirCount };
}

/**
 * Đọc FileSystemEntry khi người dùng kéo thả (Drag & Drop fallback)
 */
export async function scanWebkitEntry(
  entry: any,
  activeFileName?: string
): Promise<FileNode> {
  const readEntry = async (item: any, curPath: string): Promise<FileNode> => {
    const itemPath = curPath ? `${curPath}/${item.name}` : item.name;

    if (item.isDirectory) {
      const dirReader = item.createReader();
      const entries: any[] = await new Promise((resolve) => {
        const all: any[] = [];
        const readBatch = () => {
          dirReader.readEntries((batch: any[]) => {
            if (batch.length === 0) {
              resolve(all);
            } else {
              all.push(...batch);
              readBatch();
            }
          });
        };
        readBatch();
      });

      const children: FileNode[] = [];
      for (const child of entries) {
        if (child.isDirectory || (child.isFile && isSupportedFile(child.name))) {
          children.push(await readEntry(child, itemPath));
        }
      }

      children.sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      });

      return {
        id: itemPath,
        name: item.name,
        path: itemPath,
        isDirectory: true,
        children
      };
    } else {
      let content: string | undefined = undefined;
      if (activeFileName && item.name.toLowerCase() === activeFileName.toLowerCase()) {
        try {
          const file: File = await new Promise((resolve, reject) => item.file(resolve, reject));
          content = await file.text();
        } catch (e) {}
      }

      return {
        id: itemPath,
        name: item.name,
        path: itemPath,
        isDirectory: false,
        content
      };
    }
  };

  return readEntry(entry, entry.name);
}
