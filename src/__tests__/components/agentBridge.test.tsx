import { useState } from 'react'
import { act, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { createAgent } from '@ui-sdk/react/agent'
import { allow } from '@/app/components/agentBridge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

it('allows search edits, redacts location and refuses marked and unknown buttons', async () => {
  const agent = createAgent({ allow })
  const search = vi.fn()
  const blocked = vi.fn()
  function Form() {
    const [location, setLocation] = useState('')
    return (
      <>
        <Input
          aria-label="Location or ZIP code"
          data-agent-secret
          value={location}
          onValueChange={setLocation}
        />
        <Button onClick={search}>Find a place to eat</Button>
        <Button onClick={blocked} data-agent-confirm="Reset list">
          Reset blocked places
        </Button>
        <Button onClick={blocked}>Pay now</Button>
      </>
    )
  }
  render(<Form />)
  await act(async () => {
    const result = await agent.act({
      steps: [
        { ref: 'Location or ZIP code', action: 'setValue', args: ['Denver'] },
        { ref: 'Find a place to eat', action: 'press' },
      ],
    })
    expect(result.ok, result.error?.message).toBe(true)
  })
  expect(search).toHaveBeenCalledOnce()
  expect(screen.getByRole('textbox')).toHaveValue('Denver')
  expect(
    agent.snapshot().find((item) => item.label === 'Location or ZIP code')
      ?.value,
  ).toBe('[redacted]')
  for (const ref of ['Reset blocked places', 'Pay now']) {
    expect((await agent.act({ steps: [{ ref, action: 'press' }] })).ok).toBe(
      false,
    )
  }
  expect(blocked).not.toHaveBeenCalled()
})
