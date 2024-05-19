'use client'
import React from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

export type TabBarProps = {
  children?: React.ReactNode
}

export default function TabBar(props: TabBarProps) {
  const [value, setValue] = React.useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }
  return (
    <Card className="center">
      <CardContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="GrubRoulette Spinner Options"
          >
            <Tab label="Current location" />
            <Tab label="Zipcode" />
            {/* <Tab label="Address" /> */}
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          Current Location
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          Zipcode
        </CustomTabPanel>
        {/* <CustomTabPanel value={value} index={2}>
          Address
        </CustomTabPanel> */}
      </CardContent>
    </Card>
  )
}
