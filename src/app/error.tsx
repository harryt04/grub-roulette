'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">{error.message}</p>
        <Button onClick={reset} className="w-full">
          Try again
        </Button>
      </div>
    </div>
  )
}
