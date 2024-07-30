'use client'
import React, { useEffect, useState } from 'react'
import RestaurantFinder from './components/restaurantFinder'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import Footer from './components/footer'
import Image from 'next/image'

export default function Home() {
  const theme = useTheme()
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  // Determine the initial isMobile state using media query
  const mediaQueryIsMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Effect to read from localStorage on initial load
  useEffect(() => {
    const cachedIsMobile = localStorage.getItem('isMobile')
    if (cachedIsMobile !== null) {
      setIsMobile(JSON.parse(cachedIsMobile))
    } else {
      setIsMobile(mediaQueryIsMobile)
      localStorage.setItem('isMobile', JSON.stringify(mediaQueryIsMobile))
    }
  }, [mediaQueryIsMobile])

  // Effect to update isMobile state and localStorage when media query changes
  useEffect(() => {
    if (isMobile !== mediaQueryIsMobile) {
      setIsMobile(mediaQueryIsMobile)
      localStorage.setItem('isMobile', JSON.stringify(mediaQueryIsMobile))
    }
  }, [mediaQueryIsMobile, isMobile])

  if (isMobile === null) {
    // You can add a loading spinner or placeholder here if necessary
    return null
  }

  const logoSize = isMobile ? 60 : 75

  return (
    <div className="center">
      <div className="header-container">
        <Image
          src="/android-chrome-512x512.png"
          width={logoSize}
          height={logoSize}
          // unoptimized
          alt="logo"
          className="logo"
        />
        <Typography variant={isMobile ? 'h3' : 'h2'} className="page-header">
          GrubRoulette
        </Typography>
      </div>
      <div className="spacer"></div>
      <RestaurantFinder isMobile={isMobile} />
      <div className="spacer"></div>
      <Footer />
    </div>
  )
}
