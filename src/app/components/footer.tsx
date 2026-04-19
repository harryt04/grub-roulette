// RSC — no 'use client' directive
// Uses plain <a> tags (NOT shadcn Button) to avoid any client-side JS dependency

import { DollarSign, Code, Bug } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-8 py-6 border-t border-gray-200 dark:border-gray-700 text-center">
      <div className="flex justify-center gap-6 mb-4">
        <a
          href="https://buymeacoffee.com/harryt04"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <DollarSign className="h-4 w-4" />
          Tip Jar
        </a>
        <a
          href="https://github.com/harryt04/grub-roulette"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <Code className="h-4 w-4" />
          View Source
        </a>
        <a
          href="https://forms.gle/s4hxSSyAcMCyftmn9"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <Bug className="h-4 w-4" />
          Report Issue
        </a>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Your location data is never stored on our servers. All searches happen in your browser session only.
      </p>
    </footer>
  )
}
