import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        textAlign: 'center',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
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
    </Box>
  )
}

export default Footer
