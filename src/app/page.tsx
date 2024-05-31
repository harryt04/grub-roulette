'use client'
import RestaurantFinder from './components/restaurantFinder'
import Typography from '@mui/material/Typography'
import GitHubIcon from '@mui/icons-material/GitHub'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import Image from 'next/image'
import Footer from './components/footer'

export default function Home() {
  return (
    <div className="center">
      <Typography variant="h5">Welcome to GrubRoulette</Typography>
      <div className="spacer"></div>

      <Typography variant="body1" className="body">
        Ever play russian roulette? Well, this is the same thing, but with food.
        Sometimes you&apos;ll get something good, sometimes it&apos;ll be a
        miss. But hey, that&apos;s the fun of trying new things!
      </Typography>
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
