// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfill for Next.js server components
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock environment variables for tests
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-jest-testing'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.SCRAPBOOK_PASSWORD = 'test-password'

// Suppress console errors in tests (optional, comment out if you need to debug)
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Error reading entry') ||
       args[0].includes('Error creating entry') ||
       args[0].includes('Failed to delete photo'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
