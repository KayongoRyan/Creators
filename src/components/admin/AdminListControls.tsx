"use client";

import type { ListQuery } from "@/lib/admin/listQuery";

type AdminListControlsProps = {
  query: ListQuery;
  onChange: (next: ListQuery) => void;
  statusOptions: { value: string; label: string }[];
  total: number;
  pageCount: number;
  searchPlaceholder?: string;
};

export function AdminListControls({
  query,
  onChange,
  statusOptions,
  total,
  pageCount,
  searchPlaceholder = "Search…",
}: AdminListControlsProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs text-neutral-500">
          Search
          <input
            type="search"
            value={query.search}
            placeholder={searchPlaceholder}
            onChange={(e) => onChange({ ...query, search: e.target.value, page: 1 })}
            className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-black"
          />
        </label>
        <label className="flex w-full flex-col gap-1 text-xs text-neutral-500 sm:w-40">
          Status
          <select
            value={query.status}
            onChange={(e) => onChange({ ...query, status: e.target.value, page: 1 })}
            className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-black"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex items-center gap-2 text-sm text-neutral-600">
        <span>
          {total.toLocaleString("en-US")} result{total === 1 ? "" : "s"}
        </span>
        <button
          type="button"
          className="rounded border border-neutral-200 px-2 py-1 disabled:opacity-40"
          disabled={query.page <= 1}
          onClick={() => onChange({ ...query, page: query.page - 1 })}
        >
          Prev
        </button>
        <span>
          {query.page}/{pageCount}
        </span>
        <button
          type="button"
          className="rounded border border-neutral-200 px-2 py-1 disabled:opacity-40"
          disabled={query.page >= pageCount}
          onClick={() => onChange({ ...query, page: query.page + 1 })}
        >
          Next
        </button>
      </div>
    </div>
  );
}
