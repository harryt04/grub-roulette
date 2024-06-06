'use client'
import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import Switch from '@mui/material/Switch'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Brightness2Icon from '@mui/icons-material/Brightness2'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import Box from '@mui/material/Box'
import { useThemeContext } from '../CustomThemeProvider'

const DarkModeToggle = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase': {
    '&.Mui-checked': {
      color: theme.palette.warning.main,
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.warning.main,
      },
    },
  },
  '& .MuiSwitch-track': {
    backgroundColor: theme.palette.primary.main,
  },
}))

const DarkModeSwitch = () => {
  const { theme, toggleDarkMode } = useThemeContext()
  console.log('theme: ', theme)
  return (
    <Box display="flex" justifyContent="center" alignItems="center" padding={2}>
      <Tooltip
        title={
          theme.palette.mode === 'dark'
            ? 'Switch to Light Mode'
            : 'Switch to Dark Mode'
        }
      >
        <IconButton onClick={toggleDarkMode} color="inherit">
          {theme.palette.mode === 'dark' ? <DarkModeIcon /> : <WbSunnyIcon />}
        </IconButton>
      </Tooltip>
      <DarkModeToggle
        checked={theme.palette.mode === 'dark'}
        onChange={toggleDarkMode}
      />
    </Box>
  )
}

export default DarkModeSwitch
