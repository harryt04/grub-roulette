import React from 'react'
import { Box, Button } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'
import LocalCafeIcon from '@mui/icons-material/LocalCafe'

const Footer = () => {
  return (
    <div className="footer">
      <Button
        component="a"
        href="https://buymeacoffee.com/harryt04"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="BuyMeACofee"
        startIcon={<LocalCafeIcon />}
        className="yellowButton"
        // color="info"
      >
        Buy Me A Coffee
      </Button>
      <Button
        component="a"
        href="https://github.com/harryt04/grub-roulette"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        startIcon={<GitHubIcon />}
        color="inherit"
      >
        View source code
      </Button>
    </div>
  )
}

export default Footer
