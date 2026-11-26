import { test, expect, Page } from '@playwright/test'
import {
  MOCK_RESTAURANTS_RESPONSE,
  MOCK_PLACE_DETAILS_RESPONSE,
} from './fixtures/mockData'

// Local images keep the viewer test off Google's photo endpoint.
const PHOTOS = ['/android-chrome-512x512.png', '/apple-touch-icon.png']

async function showPlaceWithPhotos(page: Page) {
  await page.addInitScript(() => {
    Math.random = () => 0
  })
  await page.route('**/api/getRestaurants', (route) =>
    route.fulfill({ json: MOCK_RESTAURANTS_RESPONSE }),
  )
  await page.route('**/api/getPlaceDetails', (route) =>
    route.fulfill({
      json: {
        ...MOCK_PLACE_DETAILS_RESPONSE,
        photos: [{ photo_reference: 'A' }, { photo_reference: 'B' }],
      },
    }),
  )
  await page.route('**/api/getPhotos', (route) =>
    route.fulfill({ json: PHOTOS }),
  )
  await page.goto('/')
  await page.getByPlaceholder(/location or zip code/i).fill('Springfield')
  await page.getByRole('button', { name: /find a place to eat/i }).click()
  const photo = page.getByRole('button', { name: 'View photo 1 of 2' })
  await expect(photo).toBeVisible({ timeout: 10_000 })
  return photo
}

test.describe('Photo viewer', () => {
  test('opens from the keyboard, traps focus, and returns focus on Escape', async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })

    const photo = await showPlaceWithPhotos(page)
    await photo.focus()
    await page.keyboard.press('Enter')

    const viewer = page.getByRole('dialog', { name: 'Photo viewer' })
    await expect(viewer).toBeVisible()
    await expect(viewer).toHaveAttribute('aria-modal', 'true')
    await expect(viewer.getByRole('img', { name: 'photo' })).toBeVisible()
    const close = viewer.getByRole('button', { name: 'Close' })
    await expect(close).toBeFocused()

    // Close is the only control, so Tab stays on it rather than reaching the page.
    await page.keyboard.press('Tab')
    await expect(close).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(close).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(viewer).toBeHidden()
    await expect(photo).toBeFocused()
    expect(errors).toEqual([])
  })

  test('the close button closes it and focus returns to the photo', async ({
    page,
  }) => {
    await showPlaceWithPhotos(page)
    const second = page.getByRole('button', { name: 'View photo 2 of 2' })
    await second.click()

    const viewer = page.getByRole('dialog', { name: 'Photo viewer' })
    await expect(viewer.getByRole('img', { name: 'photo' })).toHaveAttribute(
      'src',
      /apple-touch-icon/,
    )
    await viewer.getByRole('button', { name: 'Close' }).click()
    await expect(viewer).toBeHidden()
    await expect(second).toBeFocused()
  })

  test('tapping the photo zooms in and tapping again zooms out', async ({
    page,
  }) => {
    const photo = await showPlaceWithPhotos(page)
    await photo.click()
    const viewer = page.getByRole('dialog', { name: 'Photo viewer' })
    const hint = viewer.getByText('Tap to zoom · Pinch to zoom')
    await expect(hint).toBeVisible()

    await viewer.getByRole('img', { name: 'photo' }).click({ force: true })
    await expect(hint).toBeHidden()
    await viewer.getByRole('img', { name: 'photo' }).click({ force: true })
    await expect(hint).toBeVisible()
  })
})
