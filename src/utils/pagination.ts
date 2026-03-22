export const PAGE_SIZE = 12;

export function getPageSlice<T>(items: readonly T[], page: number, pageSize: number): T[] {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function getPageCount(total: number, pageSize: number): number {
  if (total <= 0) return 1;
  return Math.ceil(total / pageSize);
}

export function clampPage(page: number, pageCount: number): number {
  return Math.min(Math.max(1, page), Math.max(1, pageCount));
}

export function getDisplayRange(page: number, pageSize: number, total: number): { from: number; to: number } {
  const safePage = Math.max(1, page);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);
  return { from, to };
}
