# Testing Documentation

## Overview

This document provides comprehensive information about the testing strategy, test coverage, and how to run tests for the Lawer.AI intelligent legal system.

## Test Structure

The testing follows Clean Architecture principles and is organized by layers:

```
src/
├── domain/
│   └── entities/
│       └── __tests__/
│           ├── legal-document.entity.spec.ts
│           ├── legal-query.entity.spec.ts
│           └── legal-writing.entity.spec.ts
├── application/
│   └── use-cases/
│       └── __tests__/
│           ├── document-indexing.use-case.spec.ts
│           ├── legal-querying.use-case.spec.ts
│           └── legal-writing.use-case.spec.ts
├── infrastructure/
│   └── repositories/
│       └── __tests__/
│           └── legal-document.repository.spec.ts
└── interface/
    └── controllers/
        └── __tests__/
            └── documents.controller.spec.ts
```

## Test Categories

### 1. Unit Tests

#### Domain Layer Tests
- **Entity Tests**: Test domain models, enums, and interfaces
- **Validation Tests**: Test business rules and constraints
- **Type Safety Tests**: Ensure proper TypeScript typing

#### Application Layer Tests
- **Use Case Tests**: Test business logic and orchestration
- **Input Validation Tests**: Test request/response handling
- **Error Handling Tests**: Test error scenarios and edge cases

#### Infrastructure Layer Tests
- **Repository Tests**: Test data persistence and retrieval
- **Service Tests**: Test external service integrations
- **Configuration Tests**: Test environment and config handling

#### Interface Layer Tests
- **Controller Tests**: Test HTTP endpoint handling
- **Request/Response Tests**: Test API contract validation
- **Error Response Tests**: Test proper error handling

### 2. Integration Tests
- **Service Integration**: Test service-to-service communication
- **Database Integration**: Test repository with actual database
- **External API Integration**: Test third-party service integration

### 3. End-to-End Tests
- **API End-to-End**: Test complete API workflows
- **Console End-to-End**: Test console interface workflows
- **System End-to-End**: Test complete system scenarios

## Running Tests

### Prerequisites

Ensure you have all dependencies installed:

```bash
npm install
```

### Test Commands

#### Run All Tests
```bash
npm test
```

#### Run Tests in Watch Mode
```bash
npm run test:watch
```

#### Run Tests with Coverage
```bash
npm run test:cov
```

#### Run Tests in Debug Mode
```bash
npm run test:debug
```

#### Run End-to-End Tests
```bash
npm run test:e2e
```

#### Run Specific Test File
```bash
npm test -- legal-document.entity.spec.ts
```

#### Run Tests by Pattern
```bash
npm test -- --testNamePattern="should successfully"
```

### Test Configuration

The project uses Jest as the testing framework with the following configuration:

- **Framework**: Jest with ts-jest for TypeScript support
- **Coverage**: Istanbul for code coverage reporting
- **Environment**: Node.js test environment
- **Timeout**: 30 seconds per test
- **Coverage Threshold**: 70% for branches, functions, lines, and statements

## Test Coverage

### Current Coverage Targets

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Coverage Reports

After running tests with coverage, you can find reports in:

- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV Report**: `coverage/lcov.info`
- **Console Output**: Summary in terminal

## Test Utilities

### Mock Utilities

The project includes utility functions for creating mock objects:

```typescript
import { createMockDocument, createMockQuery, createMockWriting } from '../test/setup';

// Create mock document
const mockDocument = createMockDocument({
  title: 'Custom Title',
  documentType: DocumentType.PENAL_CODE,
});

// Create mock query
const mockQuery = createMockQuery({
  question: 'Custom question',
  queryType: QueryType.LEGAL_QUESTION,
});

// Create mock writing
const mockWriting = createMockWriting({
  title: 'Custom Document',
  documentType: WritingDocumentType.COMPLAINT,
});
```

### Response Utilities

```typescript
import { createMockResponse, createMockErrorResponse } from '../test/setup';

// Create success response
const successResponse = createMockResponse({
  data: mockDocument,
  message: 'Operation successful',
});

// Create error response
const errorResponse = createMockErrorResponse('Operation failed');
```

## Testing Best Practices

### 1. Test Organization

- **Arrange-Act-Assert**: Follow the AAA pattern
- **Descriptive Names**: Use clear, descriptive test names
- **Single Responsibility**: Each test should test one thing
- **Isolation**: Tests should be independent of each other

### 2. Mocking Strategy

- **Mock External Dependencies**: Mock database, external APIs, file system
- **Use Real Business Logic**: Don't mock the code you're testing
- **Verify Interactions**: Ensure mocks are called correctly
- **Reset Mocks**: Clean up mocks between tests

### 3. Test Data Management

- **Factory Functions**: Use factory functions for creating test data
- **Minimal Test Data**: Only include data necessary for the test
- **Realistic Data**: Use realistic but minimal test data
- **Consistent IDs**: Use consistent test IDs across tests

### 4. Error Testing

- **Happy Path**: Test successful scenarios
- **Error Paths**: Test error scenarios and edge cases
- **Validation Errors**: Test input validation
- **System Errors**: Test system-level errors

### 5. Async Testing

- **Proper Async/Await**: Use async/await for asynchronous tests
- **Timeout Handling**: Set appropriate timeouts
- **Error Handling**: Test async error scenarios
- **Promise Testing**: Test promise rejections

## Example Test Patterns

### Entity Test Example

```typescript
describe('LegalDocument Entity', () => {
  it('should create a valid legal document', () => {
    // Arrange
    const mockDocument = createMockDocument();

    // Act & Assert
    expect(mockDocument).toBeDefined();
    expect(mockDocument.id).toBe('test-id');
    expect(mockDocument.title).toBe('Test Document');
  });

  it('should validate required properties', () => {
    // Arrange
    const document = createMockDocument();

    // Act & Assert
    expect(document).toHaveProperty('id');
    expect(document).toHaveProperty('title');
    expect(document).toHaveProperty('content');
  });
});
```

### Use Case Test Example

```typescript
describe('IndexDocumentUseCase', () => {
  it('should successfully index a document', async () => {
    // Arrange
    const mockRepository = createMockRepository();
    const mockService = createMockIndexingService();
    const useCase = new IndexDocumentUseCase(mockRepository, mockService);
    const request = createMockIndexRequest();

    mockService.indexDocument.mockResolvedValue(mockDocument);
    mockRepository.save.mockResolvedValue(mockDocument);

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.success).toBe(true);
    expect(result.document).toBe(mockDocument);
    expect(mockService.indexDocument).toHaveBeenCalledWith(request.filePath);
  });
});
```

### Controller Test Example

```typescript
describe('DocumentsController', () => {
  it('should return 200 for valid index request', async () => {
    // Arrange
    const mockUseCase = createMockIndexUseCase();
    const controller = new DocumentsController(mockUseCase);
    const request = createMockIndexRequest();

    mockUseCase.execute.mockResolvedValue(createMockResponse());

    // Act
    const result = await controller.indexDocument(request);

    // Assert
    expect(result.success).toBe(true);
    expect(mockUseCase.execute).toHaveBeenCalledWith(request);
  });
});
```

## Continuous Integration

### GitHub Actions

The project includes GitHub Actions for automated testing:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:cov
      - run: npm run lint
```

### Pre-commit Hooks

Consider adding pre-commit hooks to ensure code quality:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm test",
      "pre-push": "npm run test:cov"
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Test Timeout**: Increase timeout in Jest config or use `jest.setTimeout()`
2. **Module Resolution**: Check `tsconfig.json` paths and Jest module mapping
3. **Mock Issues**: Ensure mocks are properly reset between tests
4. **Async Issues**: Use proper async/await patterns and error handling

### Debugging Tests

1. **Debug Mode**: Use `npm run test:debug` for debugging
2. **Console Logs**: Use `console.log()` or `console.error()` for debugging
3. **Jest Debugger**: Use `debugger` statement in tests
4. **Coverage Reports**: Check coverage reports for untested code

## Performance Testing

### Load Testing

For API performance testing, consider using tools like:

- **Artillery**: Load testing for REST APIs
- **k6**: Modern load testing tool
- **Apache Bench**: Simple HTTP benchmarking

### Example Load Test

```javascript
// artillery.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Legal Query API"
    requests:
      - post:
          url: "/api/legal-query"
          json:
            question: "What does the Civil Code say about parental responsibility?"
```

## Security Testing

### Security Test Categories

1. **Input Validation**: Test for injection attacks
2. **Authentication**: Test authentication mechanisms
3. **Authorization**: Test access control
4. **Data Validation**: Test data sanitization
5. **Error Handling**: Test information disclosure

### Example Security Test

```typescript
describe('Security Tests', () => {
  it('should sanitize SQL injection attempts', async () => {
    // Arrange
    const maliciousInput = "'; DROP TABLE documents; --";
    
    // Act & Assert
    await expect(service.processInput(maliciousInput))
      .rejects.toThrow('Invalid input');
  });
});
```

## Conclusion

This testing strategy ensures:

- **Code Quality**: High test coverage and quality standards
- **Reliability**: Comprehensive error handling and edge case testing
- **Maintainability**: Well-organized, readable tests
- **Confidence**: Automated testing for continuous integration
- **Documentation**: Tests serve as living documentation

For questions or issues with testing, refer to the Jest documentation or contact the development team. 