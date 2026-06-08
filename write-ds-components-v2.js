const fs = require("fs");
const path = require("path");

function write(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  console.log("✅", filePath);
}

// ============================================================
// TOAST / NOTIFICATIONS
// ============================================================
write("components/ui/toast.tsx", `"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
}

interface ToastContextType {
  toast: (opts: Omit<Toast, "id">) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const icons: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error:   <AlertCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  info:    <Info className="w-5 h-5 text-blue-500" />,
};

const styles: Record<ToastVariant, string> = {
  success: "border-green-200 bg-green-50",
  error:   "border-red-200 bg-red-50",
  warning: "border-yellow-200 bg-yellow-50",
  info:    "border-blue-200 bg-blue-50",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { ...opts, id }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  const success = useCallback((message: string, title?: string) => toast({ variant: "success", message, title }), [toast]);
  const error   = useCallback((message: string, title?: string) => toast({ variant: "error",   message, title }), [toast]);
  const warning = useCallback((message: string, title?: string) => toast({ variant: "warning", message, title }), [toast]);
  const info    = useCallback((message: string, title?: string) => toast({ variant: "info",    message, title }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
        {toasts.map(t => (
          <div key={t.id} className={cn("flex items-start gap-3 border rounded-xl px-4 py-3 shadow-lg text-sm animate-in slide-in-from-right-5", styles[t.variant])}>
            <span className="shrink-0 mt-0.5">{icons[t.variant]}</span>
            <div className="flex-1">
              {t.title && <p className="font-semibold text-gray-900 mb-0.5">{t.title}</p>}
              <p className="text-gray-700">{t.message}</p>
            </div>
            <button onClick={() => remove(t.id)} className="shrink-0 text-gray-400 hover:text-gray-600 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
`);

// ============================================================
// FORM FIELD (validation, erreur, loading, succès)
// ============================================================
write("components/ui/form-field.tsx", `import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

interface FormFieldProps {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, error, success, hint, required, children, className }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
      {success && !error && (
        <p className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle className="w-3 h-3" />{success}
        </p>
      )}
      {hint && !error && !success && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}
`);

// ============================================================
// FORM (wrapper avec état global)
// ============================================================
write("components/ui/form.tsx", `"use client";
import { cn } from "@/lib/utils";
import { ReactNode, useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";

interface FormProps {
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  children: ReactNode;
  className?: string;
  successMessage?: string;
}

export function Form({ onSubmit, children, className, successMessage }: FormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await onSubmit(e);
      if (successMessage) setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      {children}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          Chargement...
        </div>
      )}
      {success && successMessage && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          {successMessage}
        </div>
      )}
    </form>
  );
}
`);

// ============================================================
// STAT CARD (complet)
// ============================================================
write("components/ui/stat-card.tsx", `import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ReactNode } from "react";

type Color = "blue" | "green" | "orange" | "purple" | "red" | "indigo" | "pink";

const colors: Record<Color, { card: string; icon: string }> = {
  blue:   { card: "border-blue-100",   icon: "bg-blue-100 text-blue-600" },
  green:  { card: "border-green-100",  icon: "bg-green-100 text-green-600" },
  orange: { card: "border-orange-100", icon: "bg-orange-100 text-orange-600" },
  purple: { card: "border-purple-100", icon: "bg-purple-100 text-purple-600" },
  red:    { card: "border-red-100",    icon: "bg-red-100 text-red-600" },
  indigo: { card: "border-indigo-100", icon: "bg-indigo-100 text-indigo-600" },
  pink:   { card: "border-pink-100",   icon: "bg-pink-100 text-pink-600" },
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: Color;
  loading?: boolean;
  className?: string;
}

export function StatCard({ title, value, icon, trend, trendLabel, color = "blue", loading = false, className }: StatCardProps) {
  const c = colors[color];
  const isPositive = trend !== undefined && trend > 0;
  const isNeutral  = trend === 0;

  if (loading) return (
    <div className={cn("bg-white rounded-2xl border shadow-sm p-5 animate-pulse", c.card, className)}>
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-7 w-16 bg-gray-200 rounded" />
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );

  return (
    <div className={cn("bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-shadow", c.card, className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && (
            <div className={cn("flex items-center gap-1 mt-1.5 text-xs font-medium",
              isNeutral ? "text-gray-500" : isPositive ? "text-green-600" : "text-red-600"
            )}>
              {isNeutral ? <Minus className="w-3 h-3" /> : isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isNeutral ? "Stable" : \`\${Math.abs(trend)}% \${trendLabel || "ce mois"}\`}
            </div>
          )}
        </div>
        {icon && <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", c.icon)}>{icon}</div>}
      </div>
    </div>
  );
}

// Grille prête à l'emploi
export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {children}
    </div>
  );
}
`);

// ============================================================
// SKELETON LOADER
// ============================================================
write("components/ui/skeleton.tsx", `import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-gray-200 rounded-lg", className)} />;
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3 animate-pulse", className)}>
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="px-4 py-3 border-b border-gray-100">
        <Skeleton className="h-8 w-48" />
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-5 py-3"><Skeleton className="h-3 w-20" /></th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="px-5 py-3"><Skeleton className="h-3 w-full" /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`);

// ============================================================
// CHARTS (recharts wrappers)
// ============================================================
write("components/ui/charts.tsx", `"use client";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { cn } from "@/lib/utils";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

interface ChartWrapperProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
}

function ChartWrapper({ title, className, children }: ChartWrapperProps) {
  return (
    <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm p-5", className)}>
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>}
      {children}
    </div>
  );
}

// ---- LINE CHART ----
interface LineChartProps {
  data: Record<string, any>[];
  lines: { key: string; label: string; color?: string }[];
  xKey: string;
  title?: string;
  height?: number;
  className?: string;
}

export function LineChartCard({ data, lines, xKey, title, height = 260, className }: LineChartProps) {
  return (
    <ChartWrapper title={title} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {lines.map((l, i) => (
            <Line key={l.key} type="monotone" dataKey={l.key} name={l.label}
              stroke={l.color || COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// ---- BAR CHART ----
interface BarChartProps {
  data: Record<string, any>[];
  bars: { key: string; label: string; color?: string }[];
  xKey: string;
  title?: string;
  height?: number;
  className?: string;
}

export function BarChartCard({ data, bars, xKey, title, height = 260, className }: BarChartProps) {
  return (
    <ChartWrapper title={title} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {bars.map((b, i) => (
            <Bar key={b.key} dataKey={b.key} name={b.label} radius={[6, 6, 0, 0]}
              fill={b.color || COLORS[i % COLORS.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// ---- PIE CHART ----
interface PieChartProps {
  data: { name: string; value: number; color?: string }[];
  title?: string;
  height?: number;
  className?: string;
}

export function PieChartCard({ data, title, height = 260, className }: PieChartProps) {
  return (
    <ChartWrapper title={title} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
            paddingAngle={3} dataKey="value">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
`);

// ============================================================
// DATA TABLE (complet avec filtres)
// ============================================================
write("components/ui/data-table.tsx", `"use client";
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
`);

// ============================================================
// INDEX BARREL
// ============================================================
write("components/ui/index.ts", `export * from "./card";
export * from "./input";
export * from "./textarea";
export * from "./select-field";
export * from "./alert";
export * from "./tabs";
export * from "./modal";
export * from "./badge";
export * from "./empty-state";
export * from "./stat-card";
export * from "./skeleton";
export * from "./pagination";
export * from "./data-table";
export * from "./toast";
export * from "./form-field";
export * from "./form";
export * from "./charts";
`);

console.log("\n🎉 Design System complet généré !");
console.log("📦 Installe recharts si pas encore fait : npm install recharts");