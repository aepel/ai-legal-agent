import 'reflect-metadata';

// Global test setup
beforeAll(() => {
  // Set up any global test configuration
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  // Clean up any global test resources
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fs module for file operations
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

// Mock path module
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => args.join('/')),
}));

// Global test utilities
export const createMockDocument = (overrides = {}) => ({
  id: 'test-id',
  title: 'Test Document',
  content: 'Test content about civil law',
  source: 'test.pdf',
  documentType: 'CIVIL_CODE',
  metadata: {
    fileName: 'test.pdf',
    fileSize: 1024,
    language: 'es',
    jurisdiction: 'Argentina',
    tags: ['civil', 'law'],
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockQuery = (overrides = {}) => ({
  id: 'query-123',
  question: 'Test question',
  context: 'Test context',
  queryType: 'LEGAL_QUESTION',
  createdAt: new Date(),
  userId: 'user-123',
  ...overrides,
});

export const createMockWriting = (overrides = {}) => ({
  id: 'writing-123',
  title: 'Test Document',
  prompt: 'Test prompt',
  documentType: 'COMPLAINT',
  context: 'Test context',
  createdAt: new Date(),
  userId: 'user-123',
  ...overrides,
});

// Mock response utilities
export const createMockResponse = (overrides = {}) => ({
  success: true,
  message: 'Operation completed successfully',
  ...overrides,
});

export const createMockErrorResponse = (message = 'Operation failed', overrides = {}) => ({
  success: false,
  message,
  ...overrides,
}); 