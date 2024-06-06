'use client'
import React, { useEffect, useState } from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { lightTheme, darkTheme } from '../theme'

const CustomThemeProvider = ({ children }: any) => {
  const [theme, setTheme] = useState(lightTheme)

  useEffect(() => {
    const userPrefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches
    if (userPrefersDark) {
      setTheme(darkTheme)
    } else {
      setTheme(lightTheme)
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      setTheme(e.matches ? darkTheme : lightTheme)
    }
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === lightTheme ? darkTheme : lightTheme))
  }

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}

export default CustomThemeProvider
