import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type MockStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

function createMockStorage(seed: Record<string, string> = {}): MockStorage {
  const store = new Map<string, string>(Object.entries(seed));
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
}

describe('api base URL resolution', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('probes loopback ports when running from bundled tauri origin', async () => {
    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = String(input);
      if (url === 'http://127.0.0.1:3847/health') {
        throw new Error('connection refused');
      }
      if (url === 'http://127.0.0.1:3848/health') {
        return new Response(JSON.stringify({ status: 'ok' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (url === 'http://127.0.0.1:3848/api/platforms/first-boot') {
        return new Response(
          JSON.stringify({
            isFirstBoot: true,
            missingConfig: true,
            missingCapabilities: true,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      throw new Error(`unexpected fetch: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('localStorage', createMockStorage());
    vi.stubGlobal(
      'window',
      {
        location: {
          origin: 'http://tauri.localhost',
        },
      } as unknown as Window & typeof globalThis
    );

    const mod = await import('./api.js');
    const result = await mod.getFirstBootStatus();

    expect(result.isFirstBoot).toBe(true);
    expect(mod.getApiBaseUrl()).toBe('http://127.0.0.1:3848');

    const calledUrls = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(calledUrls).toContain('http://127.0.0.1:3847/health');
    expect(calledUrls).toContain('http://127.0.0.1:3848/health');
    expect(calledUrls).toContain('http://127.0.0.1:3848/api/platforms/first-boot');
  });

  it('uses direct backend origin without loopback probing', async () => {
    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = String(input);
      if (url === 'http://127.0.0.1:3849/api/platforms/first-boot') {
        return new Response(
          JSON.stringify({
            isFirstBoot: false,
            missingConfig: false,
            missingCapabilities: false,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      throw new Error(`unexpected fetch: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('localStorage', createMockStorage());
    vi.stubGlobal(
      'window',
      {
        location: {
          origin: 'http://127.0.0.1:3849',
        },
      } as unknown as Window & typeof globalThis
    );

    const mod = await import('./api.js');
    const result = await mod.getFirstBootStatus();

    expect(result.isFirstBoot).toBe(false);
    expect(mod.getApiBaseUrl()).toBe('http://127.0.0.1:3849');

    const calledUrls = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(calledUrls).toEqual(['http://127.0.0.1:3849/api/platforms/first-boot']);
  });
});
