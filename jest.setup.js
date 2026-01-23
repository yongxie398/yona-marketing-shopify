// Jest setup file for React testing library

require('@testing-library/jest-dom');

// Mock environment variables
process.env = {
  ...process.env,
  SHOPIFY_API_KEY: 'test_api_key',
  SHOPIFY_API_SECRET: 'test_api_secret',
  CORE_AI_SERVICE_URL: 'http://localhost:8000',
  CORE_AI_SERVICE_API_KEY: 'test_core_ai_key',
  NODE_ENV: 'test',
};

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
    push: jest.fn(),
  }),
}));

// Mock fetch for API testing
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);