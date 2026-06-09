"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { cn } from "@/lib/utils"

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

interface RadioItemProps extends RadioPrimitive.Props {
  label?: string
  description?: string
}

function RadioItem({ className, label, description, value, ...props }: RadioItemProps) {
  const radioId = `radio-${value}`
  return (
    <div className="flex items-start gap-2.5">
      <RadioPrimitive.Root
        id={radioId}
        value={value}
        data-slot="radio"
        className={cn(
          "mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border-2",
          "transition-all duration-150 outline-none",
          "border-gray-300 bg-white",
          "hover:border-indigo-400",
          "data-[checked]:border-indigo-600",
          "focus-visible:ring-2 focus-visible:ring-indigo-500/30",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      >
        <RadioPrimitive.Indicator
          className="h-2 w-2 rounded-full bg-indigo-600 data-[checked]:scale-100 scale-0 transition-transform duration-150"
        />
      </RadioPrimitive.Root>
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <label htmlFor={radioId} className="text-sm font-medium text-gray-700 cursor-pointer leading-none">
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
          )}
        </div>
      )}
    </div>
  )
}

export { RadioGroup, RadioItem }