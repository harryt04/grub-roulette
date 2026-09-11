import RestaurantFinder from './components/restaurantFinder'
import Footer from './components/footer'
import ThemeSwitcher from './components/themeSwitcher'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 pb-8">
      <div className="flex flex-col items-center pt-8 pb-2">
        <div className="flex items-center gap-3">
          <Image
            src="/android-chrome-512x512.png"
            width={48}
            height={48}
            alt="logo"
            className="logo shrink-0"
          />
          <h1 className="text-3xl font-bold">GrubRoulette</h1>
        </div>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Find a local mom-and-pop gem or discover somewhere new. Sometimes
          it&apos;s a jackpot, sometimes it&apos;s not. That&apos;s the beauty
          of trying new things. Grub Roulette helps you take the chance.
        </p>
      </div>
      <div className="py-4">
        <ThemeSwitcher />
      </div>
      <div className="spacer" />
      <RestaurantFinder isMobile={false} />
      <div className="spacer" />
      <Footer />
    </div>
  )
}
