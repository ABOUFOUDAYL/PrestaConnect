"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { Check, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends CheckboxPrimitive.Root.Props {
  label?: string
  description?: string
  error?: string
}

function Checkbox({ className, label, description, error, id, ...props }: CheckboxProps) {
  const checkId = id ?? label?.toLowerCase().replace(/\s+/g, "-")
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-2.5">
        <CheckboxPrimitive.Root
          id={checkId}
          data-slot="checkbox"
          aria-invalid={!!error}
          className={cn(
            "mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border-2",
            "transition-all duration-150 outline-none",
            "border-gray-300 bg-white",
            "hover:border-indigo-400",
            "data-[checked]:bg-indigo-600 data-[checked]:border-indigo-600",
            "data-[indeterminate]:bg-indigo-600 data-[indeterminate]:border-indigo-600",
            "focus-visible:ring-2 focus-visible:ring-indigo-500/30",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "aria-[invalid=true]:border-red-400",
            className
          )}
          {...props}
        >
          <CheckboxPrimitive.Indicator>
            {props.indeterminate
              ? <Minus className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              : <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            }
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <label htmlFor={checkId} className="text-sm font-medium text-gray-700 cursor-pointer leading-none">
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
        <p className="text-xs text-red-500 flex items-center gap-1 ml-7"><span>⚠</span> {error}</p>
      )}
    </div>
  )
}

export { Checkbox }