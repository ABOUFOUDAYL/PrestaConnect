"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"

const ToastProvider = ToastPrimitives.Provider
const ToastViewport = ToastPrimitives.Viewport
const Toast = ToastPrimitives.Root
const ToastClose = ToastPrimitives.Close
const ToastTitle = ToastPrimitives.Title
const ToastDescription = ToastPrimitives.Description
const ToastAction = ToastPrimitives.Action

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastClose,
  ToastTitle,
  ToastDescription,
  ToastAction,
}

export type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
export type ToastActionElement = React.ReactElement<typeof ToastAction>