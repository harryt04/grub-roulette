import { expect, test } from '@playwright/test'

type Tool = { name: string; execute: (input: unknown) => Promise<unknown> }

declare global {
  interface Window {
    registeredTools: Map<string, Tool>
  }
}

test('WebMCP exposes the hydrated search fields and redacts the entered location', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const tools = new Map<string, Tool>()
    Object.defineProperty(document, 'modelContext', {
      value: {
        async registerTool(tool: Tool, { signal }: { signal: AbortSignal }) {
          tools.set(tool.name, tool)
          signal.addEventListener('abort', () => tools.delete(tool.name))
        },
      },
    })
    Object.assign(window, { registeredTools: tools })
  })
  await page.goto('/')
  await page
    .getByRole('textbox', { name: 'Location or ZIP code' })
    .fill('Example location')
  const read = () =>
    page.evaluate(async () => {
      const tools = window.registeredTools
      return JSON.stringify(await tools.get('snapshot')?.execute({}))
    })
  await expect.poll(read).toContain('Search keywords')
  const opened = await page.evaluate(() =>
    window.registeredTools
      .get('act')
      ?.execute({ steps: [{ ref: 'menu', action: 'setOpen', args: [true] }] }),
  )
  expect(opened).toMatchObject({ ok: true })
  await expect(page.getByRole('menu')).toBeVisible()
  const snapshot = await read()
  expect(snapshot).toContain('[redacted]')
  expect(snapshot).not.toContain('Example location')
})
