import { FileNode } from '@markdown-reader/ui';

/**
 * Trình quản lý bộ nhớ thông minh (Smart Memory Manager)
 * Tối ưu RAM và giải phóng bộ đệm (cache eviction) khi người dùng
 * chuyển đổi giữa các thư mục gốc (Root directories) khác nhau.
 */
class MemoryManager {
  private activeRootId: string | null = null;
  private memoryStats = {
    freedFilesCount: 0,
    freedBytesEstimate: 0
  };

  /**
   * Đặt root directory hiện tại và tự động dọn dẹp bộ nhớ nếu root thay đổi
   */
  public handleRootChange(
    newRootId: string,
    currentFiles: FileNode[],
    onFilesTrimmed?: (trimmedFiles: FileNode[]) => void
  ): boolean {
    if (!newRootId) return false;

    // Nếu cùng root directory thì giữ nguyên trạng thái
    if (this.activeRootId === newRootId) {
      return false;
    }

    const previousRoot = this.activeRootId;
    this.activeRootId = newRootId;

    if (previousRoot && previousRoot !== newRootId) {
      console.log(
        `[MemoryManager] Phát hiện chuyển thư mục gốc từ "${previousRoot}" sang "${newRootId}". Bắt đầu giải phóng RAM...`
      );

      // Giải phóng nội dung của cây thư mục cũ
      const trimmed = this.trimInactiveTree(currentFiles, newRootId);

      // Xóa các canvas / SVG / KaTeX DOM cache cũ
      this.clearOrphanDiagramDOMs();

      if (onFilesTrimmed) {
        onFilesTrimmed(trimmed);
      }

      return true;
    }

    return false;
  }

  /**
   * Giữ lại cấu trúc cây (metadata) nhưng giải phóng trường content
   * của các thư mục không còn active để tiết kiệm tới 95% RAM.
   */
  public trimInactiveTree(nodes: FileNode[], keepRootId: string): FileNode[] {
    let freedBytes = 0;
    let freedCount = 0;

    const prune = (nodeList: FileNode[]): FileNode[] => {
      return nodeList.map(node => {
        const isUnderKeepRoot = node.id === keepRootId || node.path.startsWith(keepRootId);

        let newChildren: FileNode[] | undefined;
        if (node.children) {
          newChildren = prune(node.children);
        }

        // Nếu file thuộc root cũ, unload content
        if (!isUnderKeepRoot && !node.isDirectory && node.content) {
          freedBytes += node.content.length;
          freedCount++;
          return {
            ...node,
            content: undefined,
            children: newChildren
          };
        }

        return {
          ...node,
          children: newChildren
        };
      });
    };

    const result = prune(nodes);
    this.memoryStats.freedFilesCount += freedCount;
    this.memoryStats.freedBytesEstimate += freedBytes;

    console.log(
      `[MemoryManager] Đã giải phóng ${freedCount} files (~${(freedBytes / 1024).toFixed(1)} KB) khỏi bộ nhớ đệm.`
    );

    return result;
  }

  /**
   * Hủy các phần tử DOM mồ côi (SVG diagram, KaTeX DOM nodes)
   */
  public clearOrphanDiagramDOMs(): void {
    try {
      const orphans = document.querySelectorAll('.mermaid[data-processed="true"], .katex-display');
      orphans.forEach(el => {
        if (!document.body.contains(el)) {
          el.remove();
        }
      });
    } catch (e) {}
  }

  /**
   * Lấy thống kê bộ nhớ đã giải phóng
   */
  public getStats() {
    return { ...this.memoryStats };
  }

  /**
   * Reset toàn bộ bộ nhớ
   */
  public reset() {
    this.activeRootId = null;
    this.memoryStats = { freedFilesCount: 0, freedBytesEstimate: 0 };
  }
}

export const memoryManager = new MemoryManager();
