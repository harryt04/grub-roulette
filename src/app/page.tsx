import Image from 'next/image'
import { RestaurantFinder } from './components/restaurant-finder'
import { Footer } from './components/footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex flex-col items-center mb-8">
          <Image
            src="/android-chrome-512x512.png"
            alt="GrubRoulette logo"
            width={80}
            height={80}
            priority
          />
          <h1 className="text-4xl md:text-5xl font-bold mt-4 text-center">
            GrubRoulette
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">
            Let fate decide where you eat.
          </p>
        </header>
        <RestaurantFinder />
        <Footer />
      </div>
    </main>
  )
}
