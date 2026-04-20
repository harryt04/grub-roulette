import RestaurantFinder from './components/restaurantFinder'
import Footer from './components/footer'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="center">
      <div className="header-container">
        <Image
          src="/android-chrome-512x512.png"
          width={75}
          height={75}
          alt="logo"
          className="logo"
        />
        <h1 className="text-4xl font-bold page-header">GrubRoulette</h1>
      </div>
      <div className="spacer"></div>
      <div className="spacer"></div>
      <RestaurantFinder isMobile={false} />
      <div className="spacer"></div>
      <Footer />
    </div>
  )
}
