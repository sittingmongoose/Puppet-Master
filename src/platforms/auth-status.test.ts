import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getPlatformAuthStatus, verifyApiKey, clearVerificationCache } from './auth-status.js';

describe('auth-status', () => {
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_API_KEY;
    delete process.env.GH_TOKEN;
    delete process.env.GITHUB_TOKEN;
    clearVerificationCache();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    if (originalFetch) {
      (globalThis as unknown as { fetch?: typeof fetch }).fetch = originalFetch;
    } else {
      delete (globalThis as unknown as { fetch?: typeof fetch }).fetch;
    }
    clearVerificationCache();
    vi.restoreAllMocks();
  });

  it('returns skipped for cursor auth status', () => {
    const result = getPlatformAuthStatus('cursor');
    expect(result.status).toBe('skipped');
  });

  it('returns authenticated for codex when key is set', () => {
    process.env.OPENAI_API_KEY = 'test-key';
    const result = getPlatformAuthStatus('codex');
    expect(result.status).toBe('authenticated');
  });

  it('detects gemini and copilot auth via env vars', () => {
    process.env.GOOGLE_API_KEY = 'test-google-key';
    process.env.GH_TOKEN = 'test-gh-token';

    const geminiStatus = getPlatformAuthStatus('gemini');
    const copilotStatus = getPlatformAuthStatus('copilot');

    expect(geminiStatus.status).toBe('authenticated');
    expect(copilotStatus.status).toBe('authenticated');
  });

  it('caches verifyApiKey results across calls', async () => {
    process.env.OPENAI_API_KEY = 'sk-test-12345678';
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    (globalThis as unknown as { fetch?: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;

    const first = await verifyApiKey('codex');
    const second = await verifyApiKey('codex');

    expect(first.fromCache).toBe(false);
    expect(second.fromCache).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
