import { test, expect, Page } from '@playwright/test'
import {
  MOCK_RESTAURANTS_RESPONSE,
  MOCK_PLACE_DETAILS_RESPONSE,
  MOCK_PHOTOS_RESPONSE,
  MOCK_EMPTY_RESTAURANTS_RESPONSE,
} from './fixtures/mockData'

// Helper: intercept all three API endpoints with success mocks
async function mockAllApis(page: Page) {
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
}

test.describe('Home page', () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 })
  })

  test('page loads with correct title and find button', async ({ page }) => {
    await mockAllApis(page)
    await page.goto('/')
    await expect(page).toHaveTitle(/grub roulette/i)
    await expect(
      page.getByRole('button', { name: /find a place to eat/i }),
    ).toBeVisible()
  })

  test('clicking Find a place to eat shows a restaurant card', async ({
    page,
  }) => {
    await mockAllApis(page)
    await page.goto('/')
    await page.getByRole('button', { name: /find a place to eat/i }).click()
    await expect(page.getByText('Playwright Pizza')).toBeVisible({
      timeout: 10_000,
    })
  })

  test('manual location overrides browser coordinates', async ({ page }) => {
    await mockAllApis(page)
    await page.goto('/')

    let requestBody: Record<string, unknown> | undefined
    page.on('request', (request) => {
      if (request.url().endsWith('/api/getRestaurants')) {
        requestBody = request.postDataJSON()
      }
    })

    await page.getByPlaceholder(/location or zip code/i).fill('Ure, Colorado')
    await page.getByRole('button', { name: /find a place to eat/i }).click()
    await expect(page.getByText('Playwright Pizza')).toBeVisible({
      timeout: 10_000,
    })

    expect(requestBody).toMatchObject({ locationQuery: 'Ure, Colorado' })
    expect(requestBody).not.toHaveProperty('latitude')
    expect(requestBody).not.toHaveProperty('longitude')
  })

  test('restaurant card shows address and rating', async ({ page }) => {
    await mockAllApis(page)
    await page.goto('/')
    await page.getByRole('button', { name: /find a place to eat/i }).click()
    await expect(
      page.getByText('42 Test Street, Springfield, IL 62701'),
    ).toBeVisible({
      timeout: 10_000,
    })
    await expect(page.getByText(/4\.3 stars/i)).toBeVisible()
  })

  test('blocking a restaurant fetches a new one', async ({ page }) => {
    await mockAllApis(page)
    await page.goto('/')
    await page.getByRole('button', { name: /find a place to eat/i }).click()
    await expect(page.getByText('Playwright Pizza')).toBeVisible({
      timeout: 10_000,
    })

    await page
      .getByRole('button', { name: /don't show me this place again/i })
      .click()

    await expect(
      page.getByRole('button', { name: /get a different restaurant/i }),
    ).toBeVisible({
      timeout: 10_000,
    })
  })

  test('resetting blacklist shows the Reset button and triggers refetch', async ({
    page,
  }) => {
    await mockAllApis(page)
    await page.goto('/')
    await page.getByRole('button', { name: /find a place to eat/i }).click()
    await expect(page.getByText('Playwright Pizza')).toBeVisible({
      timeout: 10_000,
    })

    await page.getByRole('button', { name: /reset blocked places/i }).click()
    await expect(
      page.getByRole('button', { name: /get a different restaurant/i }),
    ).toBeVisible({
      timeout: 10_000,
    })
  })

  test('shows No (open) places message when API returns empty results', async ({
    page,
  }) => {
    await page.route('**/api/getRestaurants', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_EMPTY_RESTAURANTS_RESPONSE),
      }),
    )
    await page.goto('/')
    await page.getByRole('button', { name: /find a place to eat/i }).click()
    await expect(page.getByText(/no \(open\) places were found/i)).toBeVisible({
      timeout: 10_000,
    })
  })

  test('dark mode toggle switches theme', async ({ page }) => {
    await mockAllApis(page)
    await page.goto('/')
    const html = page.locator('html')
    const initialClass = await html.getAttribute('class')
    // Open the theme switcher dropdown
    await page.getByRole('button', { name: /change color theme/i }).click()
    // Click the dark/light mode toggle item inside the dropdown
    await page
      .getByRole('menuitem', {
        name: /switch to dark mode|switch to light mode|toggle dark mode/i,
      })
      .click()
    const newClass = await html.getAttribute('class')
    expect(newClass).not.toBe(initialClass)
  })
})

test.describe('Manual location flow', () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions([])
  })

  test('shows location input when geolocation is denied', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByPlaceholder(/location or zip code/i)).toBeVisible({
      timeout: 5_000,
    })
  })

  test('entering a ZIP code and clicking find shows restaurant', async ({
    page,
  }) => {
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
    await expect(page.getByPlaceholder(/location or zip code/i)).toBeVisible({
      timeout: 5_000,
    })
    await page.getByPlaceholder(/location or zip code/i).fill('10001')
    await page.getByRole('button', { name: /find a place to eat/i }).click()
    await expect(page.getByText('Playwright Pizza')).toBeVisible({
      timeout: 10_000,
    })
  })
})
