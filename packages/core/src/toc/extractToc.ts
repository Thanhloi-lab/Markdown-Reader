import GithubSlugger from 'github-slugger';

export interface TocItem {
  id: string;
  title: string;
  rawText: string;
  level: number;
  slug: string;
  children?: TocItem[];
}

/**
 * Phân tích và trích xuất cấu trúc mục lục (Table of Contents) từ Markdown
 */
export function extractToc(markdownContent: string): TocItem[] {
  const slugger = new GithubSlugger();
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const items: TocItem[] = [];

  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(markdownContent)) !== null) {
    const hashes = match[1];
    const rawHeading = match[2].trim();
    const level = hashes.length;

    // Loại bỏ markdown inline formatting trong title như **bold**, *italic*, `code`, [link](url)
    const cleanTitle = rawHeading
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) -> text
      .replace(/[*_~`]/g, '') // remove *, _, ~, `
      .trim();

    const slug = slugger.slug(cleanTitle);

    items.push({
      id: slug,
      title: cleanTitle,
      rawText: rawHeading,
      level,
      slug
    });
  }

  return items;
}

/**
 * Xây dựng cây phân cấp lồng nhau từ danh sách phẳng của TocItem
 */
export function buildTocTree(flatItems: TocItem[]): TocItem[] {
  const root: TocItem[] = [];
  const stack: { item: TocItem; level: number }[] = [];

  for (const rawItem of flatItems) {
    const item: TocItem = { ...rawItem, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(item);
    } else {
      const parent = stack[stack.length - 1].item;
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(item);
    }

    stack.push({ item, level: item.level });
  }

  return root;
}
