/**
 * Browser Verifier - Playwright-based browser verification
 * 
 * Implements browser verification using Playwright for navigation, element checks,
 * actions, and evidence capture (screenshots, traces).
 * 
 * See REQUIREMENTS.md Section 25.4 (Browser Verification) and
 * BUILD_QUEUE_PHASE_4.md PH4-T04.
 */

import {
  chromium,
  firefox,
  webkit,
  type Browser,
  type Page,
  type BrowserContext,
} from 'playwright';
import type { Criterion } from '../../types/tiers.js';
import type { VerifierResult } from '../../types/tiers.js';
import type { EvidenceStore } from '../../memory/evidence-store.js';

/**
 * Browser action types.
 */
export type BrowserActionType = 'click' | 'fill' | 'select' | 'hover';

/**
 * Browser action interface.
 * Represents an action to perform on a page element.
 */
export interface BrowserAction {
  /** Action type */
  type: BrowserActionType;
  /** CSS selector for the element */
  selector: string;
  /** Value for fill/select actions */
  value?: string;
}

/**
 * Browser criterion options.
 * Extends the base Criterion with browser-specific options.
 */
export interface BrowserCriterionOptions extends Record<string, unknown> {
  /** Element selector to find */
  selector?: string;
  /** Text content to verify */
  text?: string;
  /** Check element visibility */
  visible?: boolean;
  /** Always capture screenshot */
  screenshot?: boolean;
  /** Navigation timeout in milliseconds */
  timeout?: number;
  /** Selector to wait for before proceeding */
  waitFor?: string;
  /** Action to perform */
  action?: BrowserAction;
}

/**
 * Browser criterion interface.
 * Extends base Criterion with browser-specific fields.
 */
export interface BrowserCriterion extends Criterion {
  type: 'browser_verify';
  /** URL to navigate to */
  target: string;
  /** Browser-specific options */
  options?: BrowserCriterionOptions;
}

/**
 * Browser verifier configuration.
 */
export interface BrowserVerifierConfig {
  /** Run browser in headless mode (default: true) */
  headless?: boolean;
  /** Browser to use (default: 'chromium') */
  browser?: 'chromium' | 'firefox' | 'webkit';
  /** Capture screenshot on failure (default: true) */
  screenshotOnFailure?: boolean;
  /** Capture browser trace on failure (default: false) */
  traceOnFailure?: boolean;
}

/**
 * Browser check result.
 * Internal result from browser verification checks.
 */
interface BrowserCheckResult {
  /** Whether verification passed */
  passed: boolean;
  /** Whether element was found */
  elementFound?: boolean;
  /** Whether text matched */
  textMatched?: boolean;
  /** Whether element is visible */
  visible?: boolean;
  /** Path to screenshot if captured */
  screenshotPath?: string;
  /** Path to trace if captured */
  tracePath?: string;
  /** Error message if verification failed */
  error?: string;
}

/**
 * Browser Verifier class.
 * Implements browser verification using Playwright.
 */
export class BrowserVerifier {
  readonly type = 'browser_verify';

  private readonly evidenceStore: EvidenceStore;
  private readonly config: Required<BrowserVerifierConfig>;

  /**
   * Creates a new BrowserVerifier instance.
   * @param evidenceStore - Evidence store for saving screenshots and traces
   * @param config - Optional browser verifier configuration
   */
  constructor(
    evidenceStore: EvidenceStore,
    config: BrowserVerifierConfig = {}
  ) {
    this.evidenceStore = evidenceStore;
    this.config = {
      headless: config.headless ?? true,
      browser: config.browser ?? 'chromium',
      screenshotOnFailure: config.screenshotOnFailure ?? true,
      traceOnFailure: config.traceOnFailure ?? false,
    };
  }

  /**
   * Verifies a browser criterion.
   * @param criterion - Browser criterion to verify
   * @returns Verifier result with evidence paths
   */
  async verify(criterion: BrowserCriterion): Promise<VerifierResult> {
    const startTime = Date.now();
    let browser: Browser | null = null;
    let context: BrowserContext | null = null;
    let page: Page | null = null;

    try {
      // Launch browser
      browser = await this.launchBrowser();
      context = await browser.newContext();

      // Start tracing if configured
      if (this.config.traceOnFailure) {
        await context.tracing.start({ screenshots: true, snapshots: true });
      }

      page = await context.newPage();

      // Navigate and perform checks
      const checkResult = await this.navigateAndCheck(page, criterion);

      // Capture screenshot if configured or on failure
      if (
        criterion.options?.screenshot ||
        (!checkResult.passed && this.config.screenshotOnFailure)
      ) {
        const itemId = criterion.id || 'unknown';
        const screenshotPath = await this.captureScreenshot(page, itemId);
        checkResult.screenshotPath = screenshotPath;
      }

      // Capture trace on failure if configured
      if (!checkResult.passed && this.config.traceOnFailure && context) {
        const itemId = criterion.id || 'unknown';
        const tracePath = await this.captureTrace(context, itemId);
        checkResult.tracePath = tracePath;
      }

      const durationMs = Date.now() - startTime;

      // Build summary
      const summaryParts: string[] = [];
      if (checkResult.elementFound !== undefined) {
        summaryParts.push(
          `Element ${checkResult.elementFound ? 'found' : 'not found'}`
        );
      }
      if (checkResult.textMatched !== undefined) {
        summaryParts.push(
          `Text ${checkResult.textMatched ? 'matched' : 'did not match'}`
        );
      }
      if (checkResult.visible !== undefined) {
        summaryParts.push(
          `Element ${checkResult.visible ? 'visible' : 'not visible'}`
        );
      }
      if (checkResult.screenshotPath) {
        summaryParts.push(`Screenshot: ${checkResult.screenshotPath}`);
      }
      if (checkResult.tracePath) {
        summaryParts.push(`Trace: ${checkResult.tracePath}`);
      }

      const summary =
        summaryParts.length > 0
          ? summaryParts.join(', ')
          : checkResult.passed
            ? 'Browser verification passed'
            : 'Browser verification failed';

      return {
        type: this.type,
        target: criterion.target,
        passed: checkResult.passed,
        evidencePath: checkResult.screenshotPath || checkResult.tracePath,
        summary,
        error: checkResult.error,
        durationMs,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Try to capture screenshot on error
      let screenshotPath: string | undefined;
      if (page && this.config.screenshotOnFailure) {
        try {
          const itemId = criterion.id || 'unknown';
          screenshotPath = await this.captureScreenshot(page, itemId);
        } catch {
          // Ignore screenshot errors
        }
      }

      // Try to capture trace on error
      let tracePath: string | undefined;
      if (context && this.config.traceOnFailure) {
        try {
          const itemId = criterion.id || 'unknown';
          tracePath = await this.captureTrace(context, itemId);
        } catch {
          // Ignore trace errors
        }
      }

      return {
        type: this.type,
        target: criterion.target,
        passed: false,
        evidencePath: screenshotPath || tracePath,
        summary: `Browser verification failed: ${errorMessage}`,
        error: errorMessage,
        durationMs,
      };
    } finally {
      // Cleanup: close browser
      try {
        if (context && this.config.traceOnFailure) {
          await context.tracing.stop();
        }
      } catch {
        // Ignore trace stop errors
      }

      try {
        if (browser) {
          await browser.close();
        }
      } catch {
        // Ignore close errors
      }
    }
  }

  /**
   * Launches a browser based on configuration.
   * @returns Browser instance
   */
  private async launchBrowser(): Promise<Browser> {
    const browserType =
      this.config.browser === 'firefox'
        ? firefox
        : this.config.browser === 'webkit'
          ? webkit
          : chromium;

    return browserType.launch({
      headless: this.config.headless,
    });
  }

  /**
   * Navigates to URL and performs verification checks.
   * @param page - Playwright page instance
   * @param criterion - Browser criterion
   * @returns Browser check result
   */
  private async navigateAndCheck(
    page: Page,
    criterion: BrowserCriterion
  ): Promise<BrowserCheckResult> {
    const options = criterion.options || {};
    const timeout = options.timeout || 30000;

    try {
      // Navigate to URL
      await page.goto(criterion.target, {
        waitUntil: 'load',
        timeout,
      });

      // Wait for selector if specified
      if (options.waitFor) {
        await page.waitForSelector(options.waitFor, { timeout });
      }

      // Perform action if specified
      if (options.action) {
        await this.performAction(page, options.action);
      }

      const result: BrowserCheckResult = {
        passed: true,
      };

      // Check element existence if selector specified
      if (options.selector) {
        const element = page.locator(options.selector);
        const count = await element.count();
        result.elementFound = count > 0;

        if (!result.elementFound) {
          result.passed = false;
          result.error = `Element not found: ${options.selector}`;
          return result;
        }

        // Check visibility if specified
        if (options.visible !== undefined) {
          const isVisible = await element.isVisible();
          result.visible = isVisible;

          if (options.visible && !isVisible) {
            result.passed = false;
            result.error = `Element is not visible: ${options.selector}`;
            return result;
          }

          if (!options.visible && isVisible) {
            result.passed = false;
            result.error = `Element is visible but should be hidden: ${options.selector}`;
            return result;
          }
        }

        // Check text content if specified
        if (options.text !== undefined) {
          const textContent = await element.textContent();
          const textMatched = textContent?.includes(options.text) ?? false;
          result.textMatched = textMatched;

          if (!textMatched) {
            result.passed = false;
            result.error = `Text not found. Expected: "${options.text}", Got: "${textContent}"`;
            return result;
          }
        }
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        passed: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Performs a browser action on a page element.
   * @param page - Playwright page instance
   * @param action - Action to perform
   */
  private async performAction(page: Page, action: BrowserAction): Promise<void> {
    const element = page.locator(action.selector);

    switch (action.type) {
      case 'click':
        await element.click();
        break;

      case 'fill':
        if (!action.value) {
          throw new Error('Fill action requires a value');
        }
        await element.fill(action.value);
        break;

      case 'select':
        if (!action.value) {
          throw new Error('Select action requires a value');
        }
        await element.selectOption(action.value);
        break;

      case 'hover':
        await element.hover();
        break;

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Captures a screenshot and saves it via EvidenceStore.
   * @param page - Playwright page instance
   * @param itemId - Item ID for naming
   * @returns Path to saved screenshot
   */
  private async captureScreenshot(
    page: Page,
    itemId: string
  ): Promise<string> {
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    const scenarioName = `browser-verify-${Date.now()}`;
    return this.evidenceStore.saveScreenshot(
      itemId,
      screenshotBuffer,
      scenarioName
    );
  }

  /**
   * Captures a browser trace and saves it via EvidenceStore.
   * @param context - Playwright browser context
   * @param itemId - Item ID for naming
   * @returns Path to saved trace
   */
  private async captureTrace(
    context: BrowserContext,
    itemId: string
  ): Promise<string> {
    // Stop tracing and get trace buffer
    const tracePath = `.puppet-master/evidence/browser-traces/${itemId}-trace-${Date.now()}.zip`;
    await context.tracing.stop({ path: tracePath });

    // Read the trace file and save via EvidenceStore
    const { readFileSync } = await import('fs');
    const traceBuffer = readFileSync(tracePath);
    const savedPath = await this.evidenceStore.saveBrowserTrace(
      itemId,
      traceBuffer
    );

    // Clean up temporary file
    const { unlinkSync } = await import('fs');
    try {
      unlinkSync(tracePath);
    } catch {
      // Ignore cleanup errors
    }

    return savedPath;
  }
}
