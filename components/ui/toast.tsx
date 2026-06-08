"use client";
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
