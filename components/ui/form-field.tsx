import { cn } from "@/lib/utils";
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
