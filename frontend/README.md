# Notes Management Frontend Testing

This document provides guidance on running and extending the test suite for the Notes Management frontend application.

## Testing Framework

The frontend uses the following testing tools:

- **Jest**: Test runner and assertion library
- **React Testing Library**: For rendering and interacting with React components
- **MSW (Mock Service Worker)**: For API mocking
- **user-event**: For simulating user interactions

## Running Tests

To run the test suite, use the following npm commands:

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI environments
npm run test:ci
```

## Test Structure

The tests are organized as follows:

### 1. Component Tests

Located in `src/components/__tests__/` directory, these tests verify that individual components render and behave correctly in isolation.

Key component tests:
- `Login.test.jsx`: Tests for the login form
- `AuthContext.test.jsx`: Tests for authentication context
- `Notes.test.jsx`: Tests for the notes management component

### 2. Service Tests

Located in `src/services/__tests__/` directory, these tests verify that API service modules correctly interact with the backend.

Key service tests:
- `api.test.js`: Tests for API services (auth and notes)

### 3. Integration Tests

Located in `src/__tests__/integration/` directory, these tests verify end-to-end user flows across multiple components.

Key integration tests:
- `UserFlow.test.jsx`: Tests for common user journeys like login → create note → view note

## Test Coverage

The code coverage threshold is set to 70% for:
- Branches
- Functions
- Lines
- Statements

To view the coverage report, run:

```bash
npm run test:coverage
```

This will generate a coverage report in the `coverage/` directory. You can open `coverage/lcov-report/index.html` in a browser to view the detailed report.

## Writing New Tests

When adding new features, please follow these guidelines for testing:

1. **Component Tests**: Create a test file for each new component in the `src/components/__tests__/` directory.
2. **Service Tests**: Add tests for any new API services in the `src/services/__tests__/` directory.
3. **Integration Tests**: Add or update integration tests for any new user flows.

## Mocking

### API Mocking

API calls are mocked using Jest's mocking capabilities. See examples in `api.test.js` for how to mock API responses.

### External Dependencies

External libraries and browser APIs are mocked as needed. For example:
- `localStorage` is mocked in `jest.setup.js`
- React Router's `useNavigate` hook is mocked in individual test files

## Troubleshooting

Common testing issues:

1. **Act warnings**: If you see warnings about state updates inside act, make sure to properly wait for asynchronous operations using `await waitFor(() => {})`.

2. **Missing elements**: If tests can't find elements, check that you're using the right query methods and that the elements exist in the rendered component.

3. **Mock data**: Make sure mock data correctly matches the expected shape of the real data.

## CI Integration

Tests are automatically run in the CI pipeline. A failing test will cause the build to fail, preventing the deployment of broken code. 