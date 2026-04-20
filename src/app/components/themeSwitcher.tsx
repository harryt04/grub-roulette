'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { usePalette, PALETTES, PaletteId } from '../context/paletteContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Palette, Sun, Moon } from 'lucide-react'

export default function ThemeSwitcher() {
  const { palette, setPalette } = usePalette()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const active = PALETTES.find((p) => p.id === palette) ?? PALETTES[0]
  const isDark = resolvedTheme === 'dark'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            aria-label="Change color theme"
            className="min-w-[9rem] justify-start"
          >
            <Palette className="h-4 w-4 shrink-0" />
            <span className="ml-2 truncate">
              {active.icon} {active.label}
            </span>
          </Button>
        }
      />
      <DropdownMenuContent
        align="center"
        className="w-[calc(100vw-2rem)] max-w-xs"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Color Theme</DropdownMenuLabel>
          {PALETTES.map((p) => (
            <DropdownMenuItem
              key={p.id}
              onClick={() => setPalette(p.id as PaletteId)}
              className="gap-3 cursor-pointer py-2.5"
            >
              <span className="text-lg leading-none shrink-0">{p.icon}</span>
              <span className="flex flex-col min-w-0">
                <span className="font-medium text-sm">{p.label}</span>
                <span className="text-xs text-muted-foreground">
                  {p.description}
                </span>
              </span>
              {palette === p.id && (
                <span className="ml-auto text-xs font-bold shrink-0">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Display</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="gap-3 cursor-pointer py-2.5"
            disabled={!mounted}
          >
            {mounted && isDark ? (
              <Sun className="h-4 w-4 shrink-0" />
            ) : (
              <Moon className="h-4 w-4 shrink-0" />
            )}
            <span className="font-medium text-sm">
              {mounted
                ? isDark
                  ? 'Switch to Light Mode'
                  : 'Switch to Dark Mode'
                : 'Toggle Dark Mode'}
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
