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
      </div>
      <div className="py-4">
        <ThemeSwitcher />
      </div>
      <div className="spacer" />
      <RestaurantFinder />
      <div className="spacer" />
      <Footer />
    </div>
  )
}
