import React from 'react'
import { Button } from '@mui/material'
import Typography from '@mui/material/Typography'
import GitHubIcon from '@mui/icons-material/GitHub'
import BugReportIcon from '@mui/icons-material/BugReport'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'

const Footer = () => {
  return (
    <div className="footer">
      <Button
        component="a"
        href="https://buymeacoffee.com/harryt04"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="BuyMeACofee"
        startIcon={<AttachMoneyIcon />}
        variant="contained"
        color="primary"
        className="footer-button primary-button"
      >
        Tip Jar
      </Button>
      <Button
        component="a"
        href="https://github.com/harryt04/grub-roulette"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        startIcon={<GitHubIcon />}
        className="footer-button"
        variant="outlined"
        color="info"
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
        className="footer-button"
        variant="outlined"
        color="info"
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
