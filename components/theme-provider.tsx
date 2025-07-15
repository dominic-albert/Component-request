"use client"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light" // Changed from "system" to "light"
      enableSystem={false} // Set to false to disable system theme detection
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
