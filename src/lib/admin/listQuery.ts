/** Client-side search + status filter + page slicing for admin tables. */

export type ListQuery = {
  search: string;
  status: string;
  page: number;
  pageSize: number;
};

export const DEFAULT_LIST_QUERY: ListQuery = {
  search: "",
  status: "all",
  page: 1,
  pageSize: 10,
};

export function paginateList<T>(
  items: T[],
  query: ListQuery,
  match: (item: T, search: string, status: string) => boolean,
): { rows: T[]; total: number; pageCount: number } {
  const filtered = items.filter((item) =>
    match(item, query.search.trim().toLowerCase(), query.status),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / query.pageSize));
  const page = Math.min(Math.max(1, query.page), pageCount);
  const start = (page - 1) * query.pageSize;
  return {
    rows: filtered.slice(start, start + query.pageSize),
    total: filtered.length,
    pageCount,
  };
}
