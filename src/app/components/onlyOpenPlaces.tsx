import React from 'react'
import { Typography } from '@mui/material'

export const OnlyOpenPlaces = () => {
  return (
    <>
      <div className="spacer"></div>

      <Typography variant="body1">
        GrubRoulette only considers places within your search radius that are
        currently open for business.
      </Typography>
    </>
  )
}
