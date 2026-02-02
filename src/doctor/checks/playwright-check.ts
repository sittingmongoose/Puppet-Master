/**
 * Playwright readiness check for RWM Puppet Master Doctor System
 *
 * Ensures Playwright browser binaries are installed and discoverable. This is
 * a local-only check (no browser launch; no network calls).
 */

import { access } from 'node:fs/promises';
import { chromium, firefox, webkit } from 'playwright';
import type { CheckResult, DoctorCheck } from '../check-registry.js';

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export class PlaywrightBrowsersCheck implements DoctorCheck {
  readonly name = 'playwright-browsers';
  readonly category = 'runtime' as const;
  readonly description = 'Checks Playwright is installed and browsers are available';

  async run(): Promise<CheckResult> {
    const chromiumPath = chromium.executablePath();
    const firefoxPath = firefox.executablePath();
    const webkitPath = webkit.executablePath();

    const [hasChromium, hasFirefox, hasWebkit] = await Promise.all([
      pathExists(chromiumPath),
      pathExists(firefoxPath),
      pathExists(webkitPath),
    ]);

    const found: string[] = [];
    if (hasChromium) found.push(`chromium: ${chromiumPath}`);
    if (hasFirefox) found.push(`firefox: ${firefoxPath}`);
    if (hasWebkit) found.push(`webkit: ${webkitPath}`);

    const browsersPathNote = process.env.PLAYWRIGHT_BROWSERS_PATH
      ? `PLAYWRIGHT_BROWSERS_PATH=${process.env.PLAYWRIGHT_BROWSERS_PATH}`
      : 'PLAYWRIGHT_BROWSERS_PATH is not set';

    if (found.length === 0) {
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: 'Playwright is installed but browser binaries are missing',
        details: `${browsersPathNote}. Expected executables at: chromium=${chromiumPath}, firefox=${firefoxPath}, webkit=${webkitPath}`,
        fixSuggestion: 'Run: npx playwright install (or: PLAYWRIGHT_BROWSERS_PATH=0 npx playwright install)',
        durationMs: 0,
      };
    }

    return {
      name: this.name,
      category: this.category,
      passed: true,
      message: 'Playwright browsers are available',
      details: `${browsersPathNote}. Found: ${found.join(', ')}`,
      durationMs: 0,
    };
  }
}

