import RestaurantFinder from './components/restaurantFinder'
import Footer from './components/footer'
import ThemeSwitcher from './components/themeSwitcher'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 pb-8 lg:px-8">
      <div className="flex flex-col items-center pt-10 pb-3 text-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-cta)]">
          <Image
            src="/android-chrome-512x512.png"
            width={44}
            height={44}
            alt="logo"
            className="rounded-full"
          />
        </div>
        <h1 className="font-heading pt-4 text-3xl font-bold sm:text-4xl">
          GrubRoulette
        </h1>
        <p className="max-w-xs pt-1 text-sm text-muted-foreground">
          Can&apos;t decide where to eat? Let fate pick for you.
        </p>
      </div>
      <div className="py-3">
        <ThemeSwitcher />
      </div>
      <div className="w-full max-w-md lg:max-w-5xl lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
        <RestaurantFinder isMobile={false} />
      </div>
      <Footer />
    </div>
  )
}
