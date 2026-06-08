"use client";
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
