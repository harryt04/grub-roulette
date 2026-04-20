export const MOCK_RESTAURANTS_RESPONSE = {
  results: [
    {
      name: 'Playwright Pizza',
      place_id: 'pw_pizza_id',
      vicinity: '42 Test Street, Springfield',
      rating: 4.3,
      user_ratings_total: 320,
      opening_hours: { open_now: true },
      business_status: 'OPERATIONAL',
    },
    {
      name: 'E2E Eats',
      place_id: 'e2e_eats_id',
      vicinity: '99 Spec Ave, Springfield',
      rating: 3.9,
      user_ratings_total: 80,
      opening_hours: { open_now: true },
      business_status: 'OPERATIONAL',
    },
  ],
}

export const MOCK_PLACE_DETAILS_RESPONSE = {
  name: 'Playwright Pizza',
  formatted_address: '42 Test Street, Springfield, IL 62701',
  formatted_phone_number: '+12175550042',
  website: 'https://www.playwrightpizza.com',
  editorial_summary: { overview: 'Award-winning test pizza.' },
  price_level: 2,
  url: 'https://maps.google.com/?cid=pw_pizza',
  current_opening_hours: {
    weekday_text: [
      'Monday: 11:00 AM \u2013 10:00 PM',
      'Tuesday: 11:00 AM \u2013 10:00 PM',
      'Wednesday: 11:00 AM \u2013 10:00 PM',
      'Thursday: 11:00 AM \u2013 10:00 PM',
      'Friday: 11:00 AM \u2013 11:00 PM',
      'Saturday: 11:00 AM \u2013 11:00 PM',
      'Sunday: 12:00 PM \u2013 9:00 PM',
    ],
  },
  photos: [{ photo_reference: 'MOCK_PHOTO_REF_1' }],
}

export const MOCK_PHOTOS_RESPONSE = [
  'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=MOCK_PHOTO_REF_1&key=TEST',
]

export const MOCK_EMPTY_RESTAURANTS_RESPONSE = { results: [] }
