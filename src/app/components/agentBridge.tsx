'use client'
import { useEffect } from 'react'
import {
  createAgent,
  registerTools,
  type AgentAction,
} from '@ui-sdk/react/agent'

const searchFields = [
  'Search keywords',
  'Location or ZIP code',
  'Search radius (miles)',
]
const searchButtons = ['Find a place to eat', 'Get a different restaurant']

export function allow({
  component,
  label = '',
  action,
  confirm,
  args,
}: AgentAction) {
  if (confirm !== undefined) return false
  if (component === 'input' && searchFields.includes(label))
    return action === 'setValue' || action === 'clear'
  if (component === 'button' && searchButtons.includes(label))
    return action === 'press' && args.length === 0
  return (
    component === 'menu' &&
    label.startsWith('Change color theme, ') &&
    ['open', 'close', 'setOpen'].includes(action)
  )
}

export default function AgentBridge() {
  useEffect(() => registerTools(createAgent({ allow }), { allow }), [])
  return null
}
