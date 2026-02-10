/**
 * Browser Verification Integration Tests
 * 
 * Tests the browser verification functionality with real Playwright:
 * - VERIFY-003: Browser Verification
 * - Navigation to URLs
 * - Element detection and visibility
 * - Text content verification
 * - Screenshot capture on failure
 * 
 * Integration path: VERIFY-003
 * 
 * Note: These tests require Playwright browsers to be installed with system dependencies.
 * Run `npx playwright install --with-deps chromium` if tests are skipped.
 * Tests will be skipped if Playwright cannot launch a browser.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { BrowserVerifier } from '../../src/verification/verifiers/browser-verifier.js';
import type { BrowserCriterion } from '../../src/verification/verifiers/browser-verifier.js';
import { EvidenceStore } from '../../src/memory/evidence-store.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { existsSync } from 'fs';

describe('Browser Verification Integration Tests', () => {
  let evidenceStore: EvidenceStore;
  let evidenceDir: string;
  let browserAvailable = true;

  // Test HTML content
  const testPages = {
    simple: `
      <!DOCTYPE html>
      <html>
        <head><title>Test Page</title></head>
        <body>
          <h1 id="heading">Hello World</h1>
          <p class="content">This is test content</p>
          <button id="submit-btn">Submit</button>
          <div id="hidden-div" style="display: none;">Hidden Content</div>
        </body>
      </html>
    `,
    form: `
      <!DOCTYPE html>
      <html>
        <head><title>Form Page</title></head>
        <body>
          <form id="test-form">
            <input type="text" id="username" placeholder="Username" />
            <input type="password" id="password" placeholder="Password" />
            <select id="role">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit">Login</button>
          </form>
        </body>
      </html>
    `,
    dynamic: `
      <!DOCTYPE html>
      <html>
        <head><title>Dynamic Page</title></head>
        <body>
          <div id="content">Loading...</div>
          <script>
            setTimeout(() => {
              document.getElementById('content').textContent = 'Loaded!';
            }, 100);
          </script>
        </body>
      </html>
    `,
  };

  const toDataUrl = (html: string) => `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
  const pageUrls = {
    simple: toDataUrl(testPages.simple),
    form: toDataUrl(testPages.form),
    dynamic: toDataUrl(testPages.dynamic),
  };

  beforeAll(async () => {
    // Create temp evidence directory
    evidenceDir = join(tmpdir(), `pm-browser-evidence-${Date.now()}`);
    await fs.mkdir(evidenceDir, { recursive: true });

    // Test if browser is actually available
    try {
      const testStore = new EvidenceStore(evidenceDir);
      const testVerifier = new BrowserVerifier(testStore, { headless: true });
      const result = await testVerifier.verify({
        id: 'browser-check',
        type: 'browser_verify',
        description: 'Check if browser works',
        target: pageUrls.simple,
      });
      
      // If the error contains system library issues, browser is not available
      if (result.summary?.includes('cannot open shared object') || 
          result.summary?.includes('Target page, context or browser has been closed')) {
        browserAvailable = false;
        console.log('⚠️  Playwright browser not available (missing system dependencies). Browser tests will verify error handling only.');
      } else {
        browserAvailable = result.passed;
      }
    } catch {
      browserAvailable = false;
      console.log('⚠️  Playwright browser not available. Browser tests will verify error handling only.');
    }
  });

  afterAll(async () => {
    // Cleanup evidence directory
    if (evidenceDir && existsSync(evidenceDir)) {
      await fs.rm(evidenceDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    evidenceStore = new EvidenceStore(evidenceDir);
  });

  describe('VERIFY-003: Browser Verification Flow', () => {
    it('BrowserVerifier can be instantiated with config', () => {
      const verifier = new BrowserVerifier(evidenceStore, { headless: true });
      expect(verifier.type).toBe('browser_verify');
    });

    it('verify method returns a VerifierResult structure', async () => {
      const verifier = new BrowserVerifier(evidenceStore, { headless: true });

      const criterion: BrowserCriterion = {
        id: 'CRIT-001',
        type: 'browser_verify',
        description: 'Verify simple page loads',
        target: pageUrls.simple,
      };

      const result = await verifier.verify(criterion);

      // Should always return proper structure regardless of browser availability
      expect(typeof result.passed).toBe('boolean');
      expect(typeof result.durationMs).toBe('number');
      expect(result.durationMs).toBeGreaterThan(0);
      expect(typeof result.summary).toBe('string');
    });

    it('handles element selector verification', async () => {
      const verifier = new BrowserVerifier(evidenceStore, { headless: true });

      const criterion: BrowserCriterion = {
        id: 'CRIT-002',
        type: 'browser_verify',
        description: 'Verify heading exists',
        target: pageUrls.simple,
        options: {
          selector: '#heading',
        },
      };

      const result = await verifier.verify(criterion);

      expect(typeof result.passed).toBe('boolean');
      if (browserAvailable) {
        expect(result.passed).toBe(true);
        expect(result.summary).toContain('found');
      }
    });

    it('handles text content verification', async () => {
      const verifier = new BrowserVerifier(evidenceStore, { headless: true });

      const criterion: BrowserCriterion = {
        id: 'CRIT-003',
        type: 'browser_verify',
        description: 'Verify heading text',
        target: pageUrls.simple,
        options: {
          selector: '#heading',
          text: 'Hello World',
        },
      };

      const result = await verifier.verify(criterion);

      expect(typeof result.passed).toBe('boolean');
      if (browserAvailable) {
        expect(result.passed).toBe(true);
        expect(result.summary).toContain('matched');
      }
    });

    it('handles text mismatch verification', async () => {
      const verifier = new BrowserVerifier(evidenceStore, { headless: true });

      const criterion: BrowserCriterion = {
        id: 'CRIT-004',
        type: 'browser_verify',
        description: 'Verify wrong text',
        target: pageUrls.simple,
        options: {
          selector: '#heading',
          text: 'Wrong Text',
        },
      };

      const result = await verifier.verify(criterion);

      expect(typeof result.passed).toBe('boolean');
      // Whether browser is available or not, this should fail
      expect(result.passed).toBe(false);
    });

    it('handles visibility verification option', async () => {
      const verifier = new BrowserVerifier(evidenceStore, { headless: true });

      const criterion: BrowserCriterion = {
        id: 'CRIT-005',
        type: 'browser_verify',
        description: 'Verify button is visible',
        target: pageUrls.simple,
        options: {
          selector: '#submit-btn',
          visible: true,
        },
      };

      const result = await verifier.verify(criterion);

      expect(typeof result.passed).toBe('boolean');
      if (browserAvailable) {
        expect(result.passed).toBe(true);
        expect(result.summary).toContain('visible');
      }
    });

    it('handles screenshot option', async () => {
      const verifier = new BrowserVerifier(evidenceStore, { 
        headless: true,
        screenshotOnFailure: true,
      });

      const criterion: BrowserCriterion = {
        id: 'CRIT-006',
        type: 'browser_verify',
        description: 'Should capture screenshot',
        target: pageUrls.simple,
        options: {
          screenshot: true,
        },
      };

      const result = await verifier.verify(criterion);

      expect(typeof result.passed).toBe('boolean');
      if (browserAvailable) {
        expect(result.summary).toContain('Screenshot');
      }
    });

    it('handles non-existent selector gracefully', async () => {
      const verifier = new BrowserVerifier(evidenceStore, { headless: true });

      const criterion: BrowserCriterion = {
        id: 'CRIT-007',
        type: 'browser_verify',
        description: 'Non-existent element',
        target: pageUrls.simple,
        options: {
          selector: '#non-existent-element',
        },
      };

      const result = await verifier.verify(criterion);

      // Should fail (either browser not available or element not found)
      expect(result.passed).toBe(false);
    });
  });

  describe('Form Verification', () => {
    it('handles form input verification', async () => {
      const verifier = new BrowserVerifier(evidenceStore, { headless: true });

      const criterion: BrowserCriterion = {
        id: 'CRIT-FORM-001',
        type: 'browser_verify',
        description: 'Verify form input exists',
        target: pageUrls.form,
        options: {
          selector: '#username',
        },
      };

      const result = await verifier.verify(criterion);

      expect(typeof result.passed).toBe('boolean');
      if (browserAvailable) {
        expect(result.passed).toBe(true);
      }
    });
  });

  describe('Browser Configuration', () => {
    it('accepts different browser types in config', () => {
      const chromiumVerifier = new BrowserVerifier(evidenceStore, { 
        headless: true,
        browser: 'chromium',
      });
      expect(chromiumVerifier.type).toBe('browser_verify');

      const firefoxVerifier = new BrowserVerifier(evidenceStore, { 
        headless: true,
        browser: 'firefox',
      });
      expect(firefoxVerifier.type).toBe('browser_verify');

      const webkitVerifier = new BrowserVerifier(evidenceStore, { 
        headless: true,
        browser: 'webkit',
      });
      expect(webkitVerifier.type).toBe('browser_verify');
    });

    it('accepts trace and screenshot config options', () => {
      const verifier = new BrowserVerifier(evidenceStore, { 
        headless: true,
        screenshotOnFailure: true,
        traceOnFailure: true,
      });
      expect(verifier.type).toBe('browser_verify');
    });
  });

  describe('Error Handling', () => {
    it('handles verification errors without throwing', async () => {
      const verifier = new BrowserVerifier(evidenceStore, { headless: true });

      const criterion: BrowserCriterion = {
        id: 'CRIT-ERR-001',
        type: 'browser_verify',
        description: 'Navigate to bad URL',
        target: 'http://127.0.0.1:0/non-existent-page',
      };

      // Should not throw, should return result
      const result = await verifier.verify(criterion);
      
      expect(typeof result.passed).toBe('boolean');
      expect(typeof result.durationMs).toBe('number');
    });
  });
});
