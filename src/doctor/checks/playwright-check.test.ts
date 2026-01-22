import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PlaywrightBrowsersCheck } from './playwright-check.js';

vi.mock('playwright', () => ({
  chromium: { executablePath: vi.fn(() => '/tmp/pw/chromium') },
  firefox: { executablePath: vi.fn(() => '/tmp/pw/firefox') },
  webkit: { executablePath: vi.fn(() => '/tmp/pw/webkit') },
}));

const accessMock = vi.hoisted(() => vi.fn());
vi.mock('node:fs/promises', async () => {
  const actual = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
  return { ...actual, access: accessMock };
});

describe('PlaywrightBrowsersCheck', () => {
  beforeEach(() => {
    accessMock.mockReset();
    delete process.env.PLAYWRIGHT_BROWSERS_PATH;
  });

  it('passes when at least one browser executable exists', async () => {
    accessMock.mockImplementation(async (path: string) => {
      if (path === '/tmp/pw/chromium') return;
      throw new Error('missing');
    });

    const check = new PlaywrightBrowsersCheck();
    const result = await check.run();

    expect(result.passed).toBe(true);
    expect(result.message).toMatch(/browsers are available/i);
    expect(result.details).toContain('chromium: /tmp/pw/chromium');
  });

  it('fails with fix suggestion when no browser executables exist', async () => {
    accessMock.mockRejectedValue(new Error('missing'));

    const check = new PlaywrightBrowsersCheck();
    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/binaries are missing/i);
    expect(result.fixSuggestion).toMatch(/npx playwright install/i);
  });
});
