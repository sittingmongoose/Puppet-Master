import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

function createStorage() {
  let store: Record<string, string> = {};
  return {
    get length() {
      return Object.keys(store).length;
    },
    key(index: number) {
      return Object.keys(store)[index] ?? null;
    },
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
}

if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage?.clear !== 'function') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: createStorage(),
    configurable: true,
  });
}

if (typeof globalThis.sessionStorage === 'undefined' || typeof globalThis.sessionStorage?.clear !== 'function') {
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: createStorage(),
    configurable: true,
  });
}

// Cleanup after each test
afterEach(() => {
  cleanup();
});
