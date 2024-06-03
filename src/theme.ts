'use client'
import { Roboto } from 'next/font/google'
import { createTheme } from '@mui/material/styles'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

const theme = createTheme({
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  palette: {
    primary: {
      light: '#c7dc77',
      main: '#BAD455',
      dark: '#82943b',
      contrastText: '#000',
    },
    secondary: {
      light: '#33eaff',
      main: '#00e5ff',
      dark: '#00a0b2',
      contrastText: '#000',
    },
  },
})

export default theme
