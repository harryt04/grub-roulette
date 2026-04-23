import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 text-6xl">🌮</div>
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-lg font-medium mb-2">Page not found</p>
        <p className="text-muted-foreground mb-6">
          This page doesn't exist. Let's get you back to finding your next meal.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          ← Back to search
        </Link>
      </div>
    </div>
  )
}
