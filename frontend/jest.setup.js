// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
import '@testing-library/jest-dom';

// Mock the local storage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock;

// This will suppress the React 18 act() warning when testing async effects
global.IS_REACT_ACT_ENVIRONMENT = true;

// Mock console.error to not show certain React-related warnings
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    args[0]?.includes?.('Warning: ReactDOM.render is no longer supported in React 18') ||
    args[0]?.includes?.('Warning: The current testing environment is not configured to support act')
  ) {
    return;
  }
  originalConsoleError(...args);
}; 