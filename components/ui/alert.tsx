import * as React from "react"
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

type AlertVariant = "success" | "error" | "warning" | "info"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
}

const VARIANTS = {
  success: {
    container: "bg-green-50 border-green-200 text-green-800",
    icon: <CheckCircle2 className="w-4.5 h-4.5 text-green-600 mt-0.5 shrink-0" />,
  },
  error: {
    container: "bg-red-50 border-red-200 text-red-800",
    icon: <AlertCircle className="w-4.5 h-4.5 text-red-600 mt-0.5 shrink-0" />,
  },
  warning: {
    container: "bg-amber-50 border-amber-200 text-amber-800",
    icon: <AlertTriangle className="w-4.5 h-4.5 text-amber-600 mt-0.5 shrink-0" />,
  },
  info: {
    container: "bg-blue-50 border-blue-200 text-blue-800",
    icon: <Info className="w-4.5 h-4.5 text-blue-600 mt-0.5 shrink-0" />,
  },
}

function Alert({
  className,
  variant = "info",
  title,
  children,
  dismissible,
  onDismiss,
  ...props
}: AlertProps) {
  const v = VARIANTS[variant]
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-xl border p-4 text-sm",
        v.container,
        className
      )}
      {...props}
    >
      {v.icon}
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        {children && <div className="text-sm opacity-90">{children}</div>}
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Fermer"
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export { Alert }
export type { AlertVariant }