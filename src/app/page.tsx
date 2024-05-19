'use client'
import TabBar from './components/tab-bar'
import Typography from '@mui/material/Typography'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

export default function Home() {
  return (
    <div className="center">
      <Typography variant="h2">Welcome to GrubRoulette</Typography>
      <div className="spacer"></div>
      <Typography variant="h5">
        This app helps you find a random, delicious restaurant near you!
      </Typography>
      <div className="spacer"></div>
      <TabBar />
    </div>
  )
}
