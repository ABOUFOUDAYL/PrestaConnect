"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { ImpersonationProvider } from "../../contexts/ImpersonationContext";

interface ProvidersProps extends ThemeProviderProps {
  currentUser: any;
}

export function ThemeProvider({ children, currentUser, ...props }: ProvidersProps) {
  return (
    <ImpersonationProvider currentUser={currentUser}>
      <NextThemesProvider {...props}>
        {children}
      </NextThemesProvider>
    </ImpersonationProvider>
  );
}