import '@testing-library/jest-dom'
import { beforeAll, afterAll, vi } from 'vitest'

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterAll(() => {
  vi.restoreAllMocks()
})
