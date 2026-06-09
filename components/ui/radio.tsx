"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string
  description?: string
  error?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const checkId = id ?? label?.toLowerCase().replace(/\s+/g, "-") ?? `checkbox-${Math.random()}`
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-start gap-2.5">
          <input
            type="checkbox"
            id={checkId}
            ref={ref}
            aria-invalid={!!error}
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded",
              "accent-indigo-600",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              className
            )}
            {...props}
          />
          {(label || description) && (
            <div className="flex flex-col gap-0.5">
              {label && (
                <label
                  htmlFor={checkId}
                  className="text-sm font-medium text-gray-700 cursor-pointer leading-none"
                >
                  {label}
                </label>
              )}
              {description && (
                <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
              )}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1 ml-6">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }