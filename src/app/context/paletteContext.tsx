'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from 'react'

export type PaletteId = 'default' | 'mango' | 'blue' | 'hotsauce' | 'lemon'

export interface Palette {
  id: PaletteId
  label: string
  icon: string
  description: string
}

export const PALETTES: Palette[] = [
  {
    id: 'default',
    label: 'Classic',
    icon: '🍽️',
    description: 'Clean black & white',
  },
  {
    id: 'mango',
    label: 'Neon Mango',
    icon: '🥭',
    description: 'Vivid amber + navy',
  },
  {
    id: 'blue',
    label: 'Electric Blue',
    icon: '🫐',
    description: 'Punchy cerulean + gold',
  },
  {
    id: 'hotsauce',
    label: 'Hot Sauce',
    icon: '🌶️',
    description: 'Neon coral + teal',
  },
  {
    id: 'lemon',
    label: 'Lemon Drop',
    icon: '🍋',
    description: 'Neon lime + indigo',
  },
]

const STORAGE_KEY = 'grubroulette_palette'

interface PaletteContextValue {
  palette: PaletteId
  setPalette: (id: PaletteId) => void
}

const PaletteContext = createContext<PaletteContextValue>({
  palette: 'default',
  setPalette: () => {},
})

export function PaletteProvider({ children }: { children: ReactNode }) {
  const [palette, setPaletteState] = useState<PaletteId>('default')

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as PaletteId | null
    if (stored && PALETTES.some((p) => p.id === stored)) {
      setPaletteState(stored)
    }
  }, [])

  // Apply palette via data-palette attribute on <html>
  // Using an attribute instead of a class avoids conflicts with
  // next-themes which owns the class attribute on <html>
  useEffect(() => {
    const html = document.documentElement
    if (palette === 'default') {
      html.removeAttribute('data-palette')
    } else {
      html.setAttribute('data-palette', palette)
    }
  }, [palette])

  const setPalette = useCallback((id: PaletteId) => {
    setPaletteState(id)
    localStorage.setItem(STORAGE_KEY, id)
  }, [])

  const contextValue = useMemo(
    () => ({ palette, setPalette }),
    [palette, setPalette],
  )

  return (
    <PaletteContext.Provider value={contextValue}>
      {children}
    </PaletteContext.Provider>
  )
}

export function usePalette() {
  return useContext(PaletteContext)
}
