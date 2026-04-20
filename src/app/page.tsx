import RestaurantFinder from './components/restaurantFinder'
import Footer from './components/footer'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 pb-8">
      <div className="header-container">
        <Image
          src="/android-chrome-512x512.png"
          width={60}
          height={60}
          alt="logo"
          className="logo"
        />
        <h1 className="text-3xl font-bold">GrubRoulette</h1>
      </div>
      <div className="spacer" />
      <RestaurantFinder isMobile={false} />
      <div className="spacer" />
      <Footer />
    </div>
  )
}
