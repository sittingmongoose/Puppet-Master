import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type MockStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

function createMockStorage(seed: Record<string, string> = {}): MockStorage & { _store: Map<string, string> } {
  const store = new Map<string, string>(Object.entries(seed));
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    _store: store,
  };
}

describe('api base URL resolution', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('uses stored loopback base when running from bundled tauri origin', async () => {
    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = String(input);
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
    vi.stubGlobal(
      'localStorage',
      createMockStorage({
        'rwm-api-base-url': 'http://127.0.0.1:3848',
      })
    );
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
    expect(calledUrls).toEqual(['http://127.0.0.1:3848/api/platforms/first-boot']);
  });

  it('waits for Tauri injection and uses injected base when localStorage is initially missing', async () => {
    const storage = createMockStorage();
    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = String(input);
      if (url === 'http://127.0.0.1:3848/api/platforms/first-boot') {
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
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal(
      'window',
      {
        location: {
          origin: 'http://tauri.localhost',
        },
      } as unknown as Window & typeof globalThis
    );

    const mod = await import('./api.js');
    const promise = mod.getFirstBootStatus();

    // Simulate Tauri setting the base URL after startup.
    setTimeout(() => {
      storage.setItem('rwm-api-base-url', 'http://127.0.0.1:3848');
    }, 100);

    await vi.advanceTimersByTimeAsync(150);
    const result = await promise;

    expect(result.isFirstBoot).toBe(false);
    expect(mod.getApiBaseUrl()).toBe('http://127.0.0.1:3848');
    const calledUrls = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(calledUrls).toEqual(['http://127.0.0.1:3848/api/platforms/first-boot']);
  });

  it('repairs the API base URL on network failure by scanning loopback ports and retrying once', async () => {
    const storage = createMockStorage();
    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = String(input);

      if (url === 'http://127.0.0.1:3847/api/platforms/first-boot') {
        // Simulate stale default port: network error.
        throw new TypeError('Failed to fetch');
      }

      if (url === 'http://127.0.0.1:3848/health') {
        return new Response(
          JSON.stringify({
            appId: 'rwm-puppet-master',
            status: 'ok',
            startedAt: '2026-02-10T00:00:00.000Z',
            port: 3848,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (url === 'http://127.0.0.1:3848/api/platforms/first-boot') {
        return new Response(
          JSON.stringify({
            isFirstBoot: true,
            missingConfig: true,
            missingCapabilities: true,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Other /health probes can fail silently.
      if (url.endsWith('/health')) {
        throw new TypeError('Failed to fetch');
      }

      throw new Error(`unexpected fetch: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal(
      'window',
      {
        location: {
          origin: 'http://tauri.localhost',
        },
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as Window & typeof globalThis
    );

    const mod = await import('./api.js');
    const promise = mod.getFirstBootStatus();

    // Let the injection wait time out (2s) so it falls back to default and triggers repair on fetch failure.
    await vi.advanceTimersByTimeAsync(2100);
    const result = await promise;

    expect(result.isFirstBoot).toBe(true);
    expect(storage.getItem('rwm-api-base-url')).toBe('http://127.0.0.1:3848');
    expect(mod.getApiBaseUrl()).toBe('http://127.0.0.1:3848');

    const calledUrls = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(calledUrls).toContain('http://127.0.0.1:3847/api/platforms/first-boot');
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

describe('server-injected API base', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('prefers __RWM_PUPPET_MASTER_API_BASE__ when set', async () => {
    vi.stubGlobal('window', {
      location: { origin: 'http://localhost:3847' },
      __RWM_PUPPET_MASTER_API_BASE__: 'http://localhost:3849',
    } as unknown as Window & typeof globalThis);
    vi.stubGlobal('localStorage', createMockStorage());

    const mod = await import('./api.js');
    const base = mod.getApiBaseUrl();
    expect(base).toBe('http://localhost:3849');
  });
});

describe('getErrorMessage', () => {
  it('returns actionable message for Failed to fetch', async () => {
    const mod = await import('./api.js');
    const result = mod.getErrorMessage(new Error('Failed to fetch'), 'fallback');
    expect(result).toBe('Backend not reachable. Ensure puppet-master gui is running on port 3847.');
  });

  it('returns actionable message for NetworkError', async () => {
    const mod = await import('./api.js');
    const result = mod.getErrorMessage(new Error('NetworkError when attempting to fetch resource'), 'fallback');
    expect(result).toBe('Backend not reachable. Ensure puppet-master gui is running on port 3847.');
  });

  it('returns original message for other errors', async () => {
    const mod = await import('./api.js');
    const result = mod.getErrorMessage(new Error('Something else'), 'fallback');
    expect(result).toBe('Something else');
  });
});
