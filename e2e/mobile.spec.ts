import { test, expect } from '@playwright/test'
import {
  MOCK_RESTAURANTS_RESPONSE,
  MOCK_PLACE_DETAILS_RESPONSE,
  MOCK_PHOTOS_RESPONSE,
} from './fixtures/mockData'

test.use({ viewport: { width: 375, height: 812 } })

test.describe('Mobile layout', () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 })
  })

  test('find button is visible on mobile viewport', async ({ page }) => {
    await page.route('**/api/getRestaurants', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_RESTAURANTS_RESPONSE),
      }),
    )
    await page.route('**/api/getPlaceDetails', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PLACE_DETAILS_RESPONSE),
      }),
    )
    await page.route('**/api/getPhotos', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PHOTOS_RESPONSE),
      }),
    )
    await page.goto('/')
    await expect(
      page.getByRole('button', { name: /find a place to eat/i }),
    ).toBeVisible()
  })

  test('restaurant card renders on mobile viewport', async ({ page }) => {
    await page.route('**/api/getRestaurants', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_RESTAURANTS_RESPONSE),
      }),
    )
    await page.route('**/api/getPlaceDetails', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PLACE_DETAILS_RESPONSE),
      }),
    )
    await page.route('**/api/getPhotos', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PHOTOS_RESPONSE),
      }),
    )
    await page.goto('/')
    await page.getByRole('button', { name: /find a place to eat/i }).click()
    await expect(page.getByText('Playwright Pizza')).toBeVisible({
      timeout: 10_000,
    })
  })
})
