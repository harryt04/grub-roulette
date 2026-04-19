'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/app-store'

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const isDarkMode = useAppStore((state) => state.isDarkMode)
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode)

  // On mount: initialize isDarkMode from OS preference
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark !== isDarkMode) {
      toggleDarkMode()
    }
  }, []) // Empty dep array: run once on mount only

  // On every isDarkMode change: sync class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  return <>{children}</>
}
