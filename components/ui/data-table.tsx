"use client";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Fragment } from "react";
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  perPage?: number;
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  actions?: (row: T) => React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  data, columns, searchable = true, searchKeys,
  perPage = 10, className, emptyTitle = "Aucune donnée",
  emptyDescription, actions,
}: DataTableProps<T>) {
  const [search, setSearch]     = useState("");
  const [sortKey, setSortKey]   = useState<string | null>(null);
  const [sortDir, setSortDir]   = useState<"asc" | "desc">("asc");
  const [page, setPage]         = useState(1);
  const [filters, setFilters]   = useState<Record<string, string>>({});

  const filtered = useMemo(() => data.filter((row) => {
    const matchSearch = !search || (searchKeys || Object.keys(row) as (keyof T)[])
      .some((k) => String(row[k]).toLowerCase().includes(search.toLowerCase()));
    const matchFilters = Object.entries(filters).every(([k, v]) =>
      !v || String(row[k]).toLowerCase().includes(v.toLowerCase())
    );
    return matchSearch && matchFilters;
  }), [data, search, filters, searchKeys]);

  const sorted = useMemo(() => sortKey
    ? [...filtered].sort((a, b) => {
        const av = a[sortKey]; const bv = b[sortKey];
        return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
      })
    : filtered, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated  = sorted.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  const setFilter = (key: string, value: string) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => { setFilters({}); setSearch(""); setPage(1); };
  const hasActiveFilters = search || Object.values(filters).some(Boolean);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  return (
    <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3">
        {searchable && (
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        {hasActiveFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition">
            <X className="w-3 h-3" />Réinitialiser
          </button>
        )}
        <p className="ml-auto text-xs text-gray-400">{sorted.length} résultat{sorted.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)}
                  onClick={() => col.sortable && toggleSort(String(col.key))}
                  className={cn("px-5 py-3 text-left font-medium", col.sortable && "cursor-pointer select-none hover:text-gray-700", col.className)}>
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === String(col.key) &&
                      (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    {col.sortable && sortKey !== String(col.key) && <ChevronUp className="w-3 h-3 opacity-20" />}
                  </div>
                </th>
              ))}
              {actions && <th className="px-5 py-3 text-left font-medium">Actions</th>}
            </tr>
            {/* Filter row */}
            {columns.some(c => c.filterable) && (
              <tr className="border-t border-gray-100">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-3 py-1.5">
                    {col.filterable ? (
                      <div className="relative">
                        <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300" />
                        <input
                          value={filters[String(col.key)] || ""}
                          onChange={(e) => setFilter(String(col.key), e.target.value)}
                          placeholder="Filtrer..."
                          className="w-full pl-6 pr-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      </div>
                    ) : null}
                  </td>
                ))}
                {actions && <td />}
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.length === 0 ? (
              <tr><td colSpan={columns.length + (actions ? 1 : 0)}>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3 text-gray-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-gray-900">{emptyTitle}</p>
                  {emptyDescription && <p className="text-sm text-gray-500 mt-1">{emptyDescription}</p>}
                </div>
              </td></tr>
            ) : paginated.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50/60 transition">
                {columns.map((col) => (
                  <td key={String(col.key)} className={cn("px-5 py-3 text-gray-700", col.className)}>
                    {col.render ? col.render(row) : row[col.key as string]}
                  </td>
                ))}
                {actions && <td className="px-5 py-3">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
          <p className="text-gray-500">Page {page} sur {totalPages}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {pageNumbers.map((p, i) => (
              <Fragment key={p}>
                {i > 0 && pageNumbers[i - 1] !== p - 1 && <span className="px-1 text-gray-400">…</span>}
                <button onClick={() => setPage(p)}
                  className={cn("w-8 h-8 flex items-center justify-center rounded-lg border transition",
                    p === page ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 hover:bg-gray-50")}>
                  {p}
                </button>
              </Fragment>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
