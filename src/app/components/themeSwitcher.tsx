'use client'

import { usePalette, PALETTES, PaletteId } from '../context/paletteContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function ThemeSwitcher() {
  const { palette, setPalette } = usePalette()

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-xs">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        Color Theme
      </p>
      <div className="flex flex-col gap-2 w-full">
        {PALETTES.map((p) => {
          const isActive = palette === p.id
          return (
            <Button
              key={p.id}
              variant={isActive ? 'default' : 'outline'}
              onClick={() => setPalette(p.id as PaletteId)}
              className={cn(
                'w-full justify-start gap-3 text-left',
                isActive && 'ring-2 ring-ring ring-offset-2',
              )}
              aria-pressed={isActive}
              aria-label={`Select ${p.label} color theme`}
            >
              <span className="text-lg leading-none" aria-hidden="true">
                {p.icon}
              </span>
              <span className="flex flex-col items-start">
                <span className="font-semibold text-sm leading-tight">
                  {p.label}
                </span>
                <span className="text-xs opacity-70 font-normal leading-tight">
                  {p.description}
                </span>
              </span>
              {isActive && (
                <span className="ml-auto text-xs font-bold opacity-80">
                  ✓
                </span>
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
