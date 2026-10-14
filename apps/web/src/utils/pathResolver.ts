import { FileNode } from '@markdown-reader/ui';

/**
 * Thu thập tất cả các file (không phải directory) trong cây thư mục
 */
export function getAllFiles(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = [];
  for (const node of nodes) {
    if (!node.isDirectory) {
      result.push(node);
    }
    if (node.children) {
      result.push(...getAllFiles(node.children));
    }
  }
  return result;
}

/**
 * Chuẩn hóa và làm sạch chuỗi đường dẫn (xóa duplicate root, decode URI, xóa host/origin)
 */
export function normalizePath(rawHref: string): string {
  let clean = rawHref.trim();

  // 1. Xóa origin nếu là URL đầy đủ (ví dụ: http://localhost:3001/...)
  try {
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      const url = new URL(clean);
      clean = url.pathname;
    }
  } catch (e) {
    // không phải url hợp lệ, giữ nguyên
  }

  // 2. Decode URI component (ví dụ %20 -> khoảng trắng, %3D -> =)
  try {
    clean = decodeURIComponent(clean);
  } catch (e) {}

  // 3. Xóa dấu / ở đầu và cuối
  clean = clean.replace(/^\/+/, '').replace(/\/+$/, '');

  // 4. Khử lỗi lặp lại root folder (ví dụ: "year=2026/year=2026/..." hoặc "folder/folder/...")
  // Sử dụng regex tìm kiếm cụm folder lặp lại ngay đầu đường dẫn
  clean = clean.replace(/^([^/]+)\/\1(\/|$)/, '$1$2');

  return clean;
}

/**
 * Giải quyết liên kết markdown để tìm đúng FileNode trong workspace
 */
export function resolveMarkdownLink(
  rawHref: string,
  currentFilePath: string,
  allTreeNodes: FileNode[]
): FileNode | null {
  const allFiles = getAllFiles(allTreeNodes);
  if (allFiles.length === 0) return null;

  const normalizedTarget = normalizePath(rawHref);

  // 1. Khớp chính xác theo path đầy đủ
  const exactMatch = allFiles.find(
    f => normalizePath(f.path) === normalizedTarget || f.path === normalizedTarget
  );
  if (exactMatch) return exactMatch;

  // 2. Thử ghép relative path dựa trên thư mục của file hiện tại
  if (currentFilePath) {
    const currentParts = currentFilePath.split(/[\\/]/);
    currentParts.pop(); // Bỏ tên file, lấy thư mục chứa file
    const currentDir = currentParts.join('/');

    if (currentDir) {
      // Ghép đường dẫn tương đối
      const combined = normalizePath(`${currentDir}/${normalizedTarget}`);
      const relativeMatch = allFiles.find(f => normalizePath(f.path) === combined);
      if (relativeMatch) return relativeMatch;
    }
  }

  // 3. Thử khử thêm trường hợp lặp root đặc biệt: e.g. target chứa chuỗi lặp bất kỳ
  const deduplicated = normalizedTarget.replace(/(year=\d{4}\/)\1+/g, '$1');
  const dedupMatch = allFiles.find(f => normalizePath(f.path) === deduplicated);
  if (dedupMatch) return dedupMatch;

  // 4. Khớp theo phần đuôi (suffix match) hoặc tên file
  const targetFileName = normalizedTarget.split(/[\\/]/).pop();
  if (targetFileName) {
    // Ưu tiên file có phần đuôi trùng khớp dài nhất
    const suffixMatches = allFiles.filter(
      f => f.path.endsWith(normalizedTarget) || f.name === targetFileName
    );
    if (suffixMatches.length > 0) {
      return suffixMatches[0];
    }
  }

  return null;
}
