/**
 * Chuẩn hóa và làm đẹp văn bản Markdown (căn chỉnh khoảng cách, bảng, danh sách, tiêu đề)
 */
export async function formatMarkdown(content: string): Promise<string> {
  try {
    // Dynamic import prettier để hỗ trợ cả môi trường web và node/vscode
    const prettier = await import('prettier/standalone');
    const markdownPlugin = await import('prettier/plugins/markdown');

    const formatted = await prettier.format(content, {
      parser: 'markdown',
      plugins: [markdownPlugin.default || markdownPlugin],
      proseWrap: 'preserve',
      singleQuote: true
    });

    return formatted;
  } catch (error) {
    console.warn('Prettier format fallback to internal rule-based formatter:', error);
    return fallbackFormatMarkdown(content);
  }
}

/**
 * Bộ format dự phòng: chuẩn hóa khoảng cách tiêu đề, ngắt dòng thừa và bảng cơ bản
 */
export function fallbackFormatMarkdown(content: string): string {
  let result = content;

  // 1. Chuẩn hóa line endings thành \n
  result = result.replace(/\r\n/g, '\n');

  // 2. Đảm bảo khoảng cách 1 dòng trống trước tiêu đề (nếu chưa có)
  result = result.replace(/([^\n])\n(#{1,6}\s+)/g, '$1\n\n$2');

  // 3. Xóa khoảng trắng thừa ở cuối mỗi dòng
  result = result
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n');

  // 4. Giới hạn tối đa 2 dòng trống liên tiếp
  result = result.replace(/\n{3,}/g, '\n\n');

  return result.trim() + '\n';
}
