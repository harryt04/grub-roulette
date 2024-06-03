'use client'
import RestaurantFinder from './components/restaurantFinder'
import Typography from '@mui/material/Typography'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import Footer from './components/footer'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="center">
      <div className="header-container">
        <Image
          src="/favicon-badass.png"
          width={40}
          height={40}
          unoptimized
          alt="logo"
        />
        <Typography variant="h5" className="page-header">
          Welcome to GrubRoulette
        </Typography>
      </div>
      <div className="spacer"></div>

      {/* <Typography variant="body1" className="body">
        Ever play russian roulette? Well, this is the same thing, but with
        restaurants. Sometimes you&apos;ll get something amazing, sometimes
        it&apos;ll be a miss. But hey, that&apos;s the fun of trying new things!
      </Typography> */}
      <div className="spacer"></div>
      <RestaurantFinder />

      <div className="spacer"></div>

      {/* Silly gif. keeping it in here in case I want to use it later. */}
      {/* <Image
        src="/roulette.gif"
        width={400}
        height={250}
        alt="GIF description"
        unoptimized
      /> */}
      <Footer />
    </div>
  )
}
