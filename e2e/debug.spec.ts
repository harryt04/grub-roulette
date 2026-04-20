import { test } from '@playwright/test'
import { MOCK_RESTAURANTS_RESPONSE, MOCK_PLACE_DETAILS_RESPONSE, MOCK_PHOTOS_RESPONSE } from './fixtures/mockData'

test('debug flaky', async ({ page, context }) => {
  await context.grantPermissions(['geolocation'])
  await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 })
  
  page.on('response', async resp => {
    if (resp.status() >= 400) {
      console.log('ERROR RESPONSE:', resp.status(), resp.url())
    }
  })
  
  await page.route('**/api/getRestaurants', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_RESTAURANTS_RESPONSE) }))
  await page.route('**/api/getPlaceDetails', route => {
    console.log('INTERCEPTED getPlaceDetails')
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PLACE_DETAILS_RESPONSE) })
  })
  await page.route('**/api/getPhotos', route => {
    console.log('INTERCEPTED getPhotos')
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PHOTOS_RESPONSE) })
  })
  
  await page.goto('/')
  await page.getByRole('button', { name: /find a place to eat/i }).click()
  
  await page.waitForTimeout(5000)
  const content = await page.content()
  console.log('Has Playwright Pizza:', content.includes('Playwright Pizza'))
})
