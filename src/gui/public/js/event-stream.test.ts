import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

type MockListener = (evt: { data?: unknown }) => void;

class MockEventSource {
  static instances: MockEventSource[] = [];

  url: string;
  onopen: null | (() => void) = null;
  onerror: null | (() => void) = null;
  onmessage: null | ((evt: { data?: unknown }) => void) = null;
  closed = false;

  private listeners: Map<string, Set<MockListener>> = new Map();

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: MockListener): void {
    const set = this.listeners.get(type) ?? new Set<MockListener>();
    set.add(listener);
    this.listeners.set(type, set);
  }

  close(): void {
    this.closed = true;
  }

  _open(): void {
    this.onopen?.();
  }

  _error(): void {
    this.onerror?.();
  }

  _emit(type: string, data: unknown): void {
    const evt = { data };
    const set = this.listeners.get(type);
    if (set) {
      for (const listener of set) {
        listener(evt);
      }
    }

    if (type === 'message') {
      this.onmessage?.(evt);
    }
  }
}

describe('EventStream (browser SSE client)', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();

    // Reset globals between tests
    delete (globalThis as unknown as { EventStream?: unknown }).EventStream;

    MockEventSource.instances = [];
    (globalThis as unknown as { EventSource?: unknown }).EventSource = MockEventSource as unknown as typeof EventSource;

    // Import executes the script and attaches globalThis.EventStream (auto-starts)
    await import('./event-stream.js');
  });

  afterEach(() => {
    const api = (globalThis as unknown as { EventStream?: { stop?: () => void } }).EventStream;
    api?.stop?.();
    vi.useRealTimers();
  });

  it('dispatches typed events to subscribers (and wildcard subscribers)', () => {
    const api = (
      globalThis as unknown as {
        EventStream?: { on: (eventType: string, handler: (event: unknown) => void) => void; stop: () => void };
      }
    ).EventStream;
    expect(api).toBeDefined();
    if (!api) throw new Error('EventStream API not initialized');

    const onTyped = vi.fn();
    const onAny = vi.fn();

    api.on('state_change', onTyped);
    api.on('*', onAny);

    const es = MockEventSource.instances[0];
    expect(es).toBeDefined();

    es._emit('state_change', JSON.stringify({ type: 'state_change', payload: { state: 'idle' } }));

    expect(onTyped).toHaveBeenCalledWith({ type: 'state_change', payload: { state: 'idle' } });
    expect(onAny).toHaveBeenCalledWith({ type: 'state_change', payload: { state: 'idle' } });
  });

  it('reconnects with exponential backoff and resets after successful open', () => {
    const api = (
      globalThis as unknown as {
        EventStream?: { on: (eventType: string, handler: (event: unknown) => void) => void; stop: () => void };
      }
    ).EventStream;
    expect(api).toBeDefined();
    if (!api) throw new Error('EventStream API not initialized');

    // First connection created on import
    expect(MockEventSource.instances.length).toBe(1);
    const es1 = MockEventSource.instances[0];

    // Error triggers reconnect attempt 1 (1s)
    es1._error();
    expect(es1.closed).toBe(true);

    vi.advanceTimersByTime(999);
    expect(MockEventSource.instances.length).toBe(1);
    vi.advanceTimersByTime(1);
    expect(MockEventSource.instances.length).toBe(2);

    const es2 = MockEventSource.instances[1];

    // Second error triggers reconnect attempt 2 (2s)
    es2._error();
    vi.advanceTimersByTime(1999);
    expect(MockEventSource.instances.length).toBe(2);
    vi.advanceTimersByTime(1);
    expect(MockEventSource.instances.length).toBe(3);

    // Successful open should reset attempts (next error back to 1s)
    const es3 = MockEventSource.instances[2];
    es3._open();
    es3._error();

    vi.advanceTimersByTime(999);
    expect(MockEventSource.instances.length).toBe(3);
    vi.advanceTimersByTime(1);
    expect(MockEventSource.instances.length).toBe(4);

    api.stop();
  });
});

