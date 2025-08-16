// Jest setup file for agents package

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Set up test environment variables
process.env.NODE_ENV = 'test'

// Global test timeout
jest.setTimeout(30000)