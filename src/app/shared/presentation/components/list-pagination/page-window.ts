/**
 * Page buttons a paginator draws: the first and last pages, the current page with its neighbours,
 * and null where a run of pages is skipped (drawn as an ellipsis). Short lists get every page.
 *
 * @param pageCount - Number of pages, at least one.
 * @param current - Current page, zero-based.
 * @returns Zero-based page indexes, with null for each gap.
 * @author Oscar Lizandro Vasquez Llave
 */
export function pageWindow(pageCount: number, current: number): Array<number | null> {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index);
  const start = Math.max(1, Math.min(current - 1, pageCount - 4));
  const end = Math.min(pageCount - 2, Math.max(current + 1, 3));
  const items: Array<number | null> = [0];
  if (start > 1) items.push(null);
  for (let index = start; index <= end; index++) items.push(index);
  if (end < pageCount - 2) items.push(null);
  items.push(pageCount - 1);
  return items;
}
