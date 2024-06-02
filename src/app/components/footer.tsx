import React from 'react'
import { Button } from '@mui/material'
import Typography from '@mui/material/Typography'
import GitHubIcon from '@mui/icons-material/GitHub'
import LocalCafeIcon from '@mui/icons-material/LocalCafe'
import BugReportIcon from '@mui/icons-material/BugReport'

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
        className="footer-button yellowButton"
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
        className="footer-button"
      >
        View source code
      </Button>
      <Button
        component="a"
        href="https://forms.gle/s4hxSSyAcMCyftmn9"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="BugReport"
        startIcon={<BugReportIcon />}
        color="inherit"
        className="footer-button"
      >
        Report Issue / Feature Request
      </Button>
      <Typography variant="caption" className="footer-text">
        Your location data is never stored by GrubRoulette anywhere.
        GrubRoulette respects your privacy.
      </Typography>
    </div>
  )
}

export default Footer
