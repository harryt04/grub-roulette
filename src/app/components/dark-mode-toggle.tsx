'use client'

import { Sun, Moon } from 'lucide-react'
import { useAppStore } from '@/store/app-store'

export function DarkModeToggle() {
  const isDarkMode = useAppStore((state) => state.isDarkMode)
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode)

  return (
    <button
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-gray-700" />
      )}
    </button>
  )
}
