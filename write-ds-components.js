const fs = require("fs");
const path = require("path");

function write(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  console.log("✅", filePath);
}

// ============================================================
// CARD
// ============================================================
write("components/ui/card.tsx", `import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm", className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-4 border-b border-gray-100", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold text-gray-900", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-4", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl", className)} {...props} />;
}
`);

// ============================================================
// INPUT
// ============================================================
write("components/ui/input.tsx", `import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
        <div className="relative">
          {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{leftIcon}</span>}
          <input
            ref={ref}
            className={cn(
              "w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition",
              "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              error ? "border-red-400 bg-red-50" : "border-gray-200 bg-white hover:border-gray-300",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            {...props}
          />
          {rightIcon && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{rightIcon}</span>}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
`);

// ============================================================
// TEXTAREA
// ============================================================
write("components/ui/textarea.tsx", `import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            "w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition resize-none",
            "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            error ? "border-red-400 bg-red-50" : "border-gray-200 bg-white hover:border-gray-300",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
`);

// ============================================================
// SELECT
// ============================================================
write("components/ui/select-field.tsx", `import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ className, label, error, hint, options, placeholder, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition appearance-none bg-white pr-10",
              "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              error ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300",
              className
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }
);
SelectField.displayName = "SelectField";
`);

// ============================================================
// ALERT
// ============================================================
write("components/ui/alert.tsx", `import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { useState } from "react";

type AlertVariant = "success" | "error" | "warning" | "info";

const styles: Record<AlertVariant, { container: string; icon: React.ReactNode }> = {
  success: { container: "bg-green-50 border-green-200 text-green-800", icon: <CheckCircle className="w-4 h-4 text-green-600" /> },
  error:   { container: "bg-red-50 border-red-200 text-red-800",       icon: <AlertCircle className="w-4 h-4 text-red-600" /> },
  warning: { container: "bg-yellow-50 border-yellow-200 text-yellow-800", icon: <AlertTriangle className="w-4 h-4 text-yellow-600" /> },
  info:    { container: "bg-blue-50 border-blue-200 text-blue-800",    icon: <Info className="w-4 h-4 text-blue-600" /> },
};

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  dismissible?: boolean;
  className?: string;
}

export function Alert({ variant = "info", title, message, dismissible = false, className }: AlertProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  const s = styles[variant];
  return (
    <div className={cn("flex items-start gap-3 border rounded-xl px-4 py-3 text-sm", s.container, className)}>
      <span className="mt-0.5 shrink-0">{s.icon}</span>
      <div className="flex-1">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <p className="opacity-90">{message}</p>
      </div>
      {dismissible && (
        <button onClick={() => setVisible(false)} className="shrink-0 opacity-60 hover:opacity-100 transition">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
`);

// ============================================================
// TABS
// ============================================================
write("components/ui/tabs.tsx", `"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Tab { id: string; label: string; icon?: React.ReactNode }

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  value?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, defaultTab, value, onChange, className }: TabsProps) {
  const [internal, setInternal] = useState(defaultTab || tabs[0]?.id);
  const active = value ?? internal;
  const handleClick = (id: string) => {
    setInternal(id);
    onChange?.(id);
  };
  return (
    <div className={cn("flex gap-1 border-b border-gray-200", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleClick(tab.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px",
            active === tab.id
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          {tab.icon}{tab.label}
        </button>
      ))}
    </div>
  );
}
`);

// ============================================================
// MODAL
// ============================================================
write("components/ui/modal.tsx", `"use client";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl" };

export function Modal({ open, onClose, title, children, size = "md", className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative bg-white rounded-2xl shadow-xl w-full", sizes[size], className)}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
`);

// ============================================================
// BADGE
// ============================================================
write("components/ui/badge.tsx", `import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "error" | "warning" | "info" | "outline";

const variants: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  error:   "bg-red-100 text-red-700",
  warning: "bg-yellow-100 text-yellow-700",
  info:    "bg-blue-100 text-blue-700",
  outline: "border border-gray-300 text-gray-700",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export function Badge({ variant = "default", dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant], className)} {...props}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
`);

// ============================================================
// EMPTY STATE
// ============================================================
write("components/ui/empty-state.tsx", `import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      {icon && <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
`);

// ============================================================
// STAT CARD
// ============================================================
write("components/ui/stat-card.tsx", `import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: "blue" | "green" | "orange" | "purple" | "red";
  className?: string;
}

const colors = {
  blue:   { bg: "bg-blue-50",   icon: "bg-blue-100 text-blue-600" },
  green:  { bg: "bg-green-50",  icon: "bg-green-100 text-green-600" },
  orange: { bg: "bg-orange-50", icon: "bg-orange-100 text-orange-600" },
  purple: { bg: "bg-purple-50", icon: "bg-purple-100 text-purple-600" },
  red:    { bg: "bg-red-50",    icon: "bg-red-100 text-red-600" },
};

export function StatCard({ title, value, icon, trend, trendLabel, color = "blue", className }: StatCardProps) {
  const c = colors[color];
  const isPositive = trend !== undefined && trend > 0;
  return (
    <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm p-5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && (
            <div className={cn("flex items-center gap-1 mt-1 text-xs font-medium", isPositive ? "text-green-600" : "text-red-600")}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}% {trendLabel || "ce mois"}
            </div>
          )}
        </div>
        {icon && <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", c.icon)}>{icon}</div>}
      </div>
    </div>
  );
}
`);

// ============================================================
// PAGINATION — CORRIGÉ (Fragment avec key)
// ============================================================
write("components/ui/pagination.tsx", `"use client";
import { cn } from "@/lib/utils";
import { Fragment } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  total: number;
  perPage?: number;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, total, perPage = 10, onChange, className }: PaginationProps) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  return (
    <div className={cn("flex items-center justify-between text-sm", className)}>
      <p className="text-gray-500">Page {page} sur {totalPages}</p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, i) => (
          <Fragment key={p}>
            {i > 0 && pages[i - 1] !== p - 1 && (
              <span className="px-1 text-gray-400">…</span>
            )}
            <button
              onClick={() => onChange(p)}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-lg border transition",
                p === page ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 hover:bg-gray-50"
              )}
            >
              {p}
            </button>
          </Fragment>
        ))}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
`);

// ============================================================
// DATA TABLE — import nettoyé
// ============================================================
write("components/ui/data-table.tsx", `"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Search, ChevronUp, ChevronDown, Table as TableIcon } from "lucide-react";
import { Pagination } from "./pagination";
import { EmptyState } from "./empty-state";

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
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
}

export function DataTable<T extends Record<string, any>>({
  data, columns, searchable = true, searchKeys, perPage = 10,
  className, emptyTitle = "Aucune donnée", emptyDescription,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = data.filter((row) => {
    if (!search) return true;
    const keys = searchKeys || (Object.keys(row) as (keyof T)[]);
    return keys.some((k) => String(row[k]).toLowerCase().includes(search.toLowerCase()));
  });

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = a[sortKey]; const bv = b[sortKey];
        return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
      })
    : filtered;

  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  return (
    <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden", className)}>
      {searchable && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={() => col.sortable && toggleSort(String(col.key))}
                  className={cn("px-5 py-3 text-left font-medium", col.sortable && "cursor-pointer select-none hover:text-gray-700", col.className)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === String(col.key) && (
                      sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.length === 0 ? (
              <tr><td colSpan={columns.length}>
                <EmptyState icon={<TableIcon className="w-7 h-7" />} title={emptyTitle} description={emptyDescription} />
              </td></tr>
            ) : paginated.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition">
                {columns.map((col) => (
                  <td key={String(col.key)} className={cn("px-5 py-3 text-gray-700", col.className)}>
                    {col.render ? col.render(row) : row[col.key as string]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sorted.length > perPage && (
        <div className="px-5 py-3 border-t border-gray-100">
          <Pagination page={page} total={sorted.length} perPage={perPage} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
`);

console.log("\n🎉 Tous les composants UI générés et corrigés !");