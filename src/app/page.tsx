'use client'
import TabBar from './components/tab-bar'
import Typography from '@mui/material/Typography'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="center">
      <Typography variant="h2">Welcome to GrubRoulette</Typography>
      <div className="spacer"></div>

      <TabBar />
      <div className="spacer"></div>
      <Typography variant="body1" className="body">
        Ever play russian roulette? Well, this is the same thing, but with food.
        Sometimes you&apos;ll get something good, sometimes it&apos;ll be a
        miss. But hey, that&apos;s the fun of trying new things!
      </Typography>
      <div className="spacer"></div>
      <Image
        src="/roulette.gif"
        width={400}
        height={250}
        alt="GIF description"
      />
    </div>
  )
}
