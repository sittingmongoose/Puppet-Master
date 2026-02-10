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
  /** Capture console messages on failure (default: false) */
  captureConsoleOnFailure?: boolean;
  /** Capture page errors on failure (default: true - page errors are critical) */
  capturePageErrorsOnFailure?: boolean;
  /** Capture network requests on failure (default: false) */
  captureNetworkOnFailure?: boolean;
  /** Console message types to capture (default: ['error', 'warning']) */
  consoleFilter?: ('error' | 'warning' | 'log' | 'info')[];
  /** Maximum number of network requests to capture (default: 50) */
  maxNetworkRequests?: number;
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
  /** Path to console messages JSON if captured */
  consolePath?: string;
  /** Path to page errors JSON if captured */
  pageErrorsPath?: string;
  /** Path to network requests JSON if captured */
  networkPath?: string;
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
      captureConsoleOnFailure: config.captureConsoleOnFailure ?? false,
      capturePageErrorsOnFailure: config.capturePageErrorsOnFailure ?? true,
      captureNetworkOnFailure: config.captureNetworkOnFailure ?? false,
      consoleFilter: config.consoleFilter ?? ['error', 'warning'],
      maxNetworkRequests: config.maxNetworkRequests ?? 50,
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

      // Capture diagnostics on failure if configured
      if (!checkResult.passed && page) {
        const itemId = criterion.id || 'unknown';

        if (this.config.captureConsoleOnFailure) {
          const consolePath = await this.captureConsoleMessages(page, itemId);
          if (consolePath) {
            checkResult.consolePath = consolePath;
          }
        }

        if (this.config.capturePageErrorsOnFailure) {
          const pageErrorsPath = await this.capturePageErrors(page, itemId);
          if (pageErrorsPath) {
            checkResult.pageErrorsPath = pageErrorsPath;
          }
        }

        if (this.config.captureNetworkOnFailure) {
          const networkPath = await this.captureNetworkRequests(page, itemId);
          if (networkPath) {
            checkResult.networkPath = networkPath;
          }
        }
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
      if (checkResult.consolePath) {
        summaryParts.push(`Console: ${checkResult.consolePath}`);
      }
      if (checkResult.pageErrorsPath) {
        summaryParts.push(`Page Errors: ${checkResult.pageErrorsPath}`);
      }
      if (checkResult.networkPath) {
        summaryParts.push(`Network: ${checkResult.networkPath}`);
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
        evidencePath:
          checkResult.screenshotPath ||
          checkResult.tracePath ||
          checkResult.consolePath ||
          checkResult.pageErrorsPath ||
          checkResult.networkPath,
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

      // Try to capture diagnostics on error
      let consolePath: string | undefined;
      let pageErrorsPath: string | undefined;
      let networkPath: string | undefined;

      if (page) {
        const itemId = criterion.id || 'unknown';

        if (this.config.captureConsoleOnFailure) {
          try {
            consolePath = await this.captureConsoleMessages(page, itemId);
          } catch {
            // Ignore console capture errors
          }
        }

        if (this.config.capturePageErrorsOnFailure) {
          try {
            pageErrorsPath = await this.capturePageErrors(page, itemId);
          } catch {
            // Ignore page errors capture errors
          }
        }

        if (this.config.captureNetworkOnFailure) {
          try {
            networkPath = await this.captureNetworkRequests(page, itemId);
          } catch {
            // Ignore network capture errors
          }
        }
      }

      const evidencePaths = [
        screenshotPath,
        tracePath,
        consolePath,
        pageErrorsPath,
        networkPath,
      ].filter((p): p is string => p !== undefined);

      return {
        type: this.type,
        target: criterion.target,
        passed: false,
        evidencePath: evidencePaths[0],
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

    try {
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`${errorMessage} (selector: ${action.selector})`);
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
    const screenshotBuffer = await page.screenshot({ fullPage: true, type: 'jpeg', quality: 80 });
    const scenarioName = `browser-verify-${Date.now()}`;
    return this.evidenceStore.saveScreenshot(
      itemId,
      screenshotBuffer,
      scenarioName,
      { extension: 'jpg' }
    );
  }

  /**
   * Saves JSON content to gate-reports directory.
   * @param itemId - Item ID for naming
   * @param jsonContent - JSON content as string
   * @param filename - Filename for the JSON file
   * @returns Path to saved JSON file
   */
  private async saveJsonEvidence(
    itemId: string,
    jsonContent: string,
    filename: string
  ): Promise<string> {
    const { promises: fs } = await import('fs');
    const { join } = await import('path');
    const evidenceDir = join('.puppet-master', 'evidence', 'gate-reports');
    await fs.mkdir(evidenceDir, { recursive: true });
    const timestamp = Date.now();
    const safeItemId = itemId.replace(/[^a-zA-Z0-9-_]/g, '_');
    const path = join(evidenceDir, `${safeItemId}-${filename}-${timestamp}.json`);
    await fs.writeFile(path, jsonContent, 'utf-8');
    return path;
  }

  /**
   * Captures console messages and saves them as JSON via EvidenceStore.
   * @param page - Playwright page instance
   * @param itemId - Item ID for naming
   * @returns Path to saved console messages JSON, or undefined if none captured
   */
  private async captureConsoleMessages(
    page: Page,
    itemId: string
  ): Promise<string | undefined> {
    try {
      const messages = await page.consoleMessages();
      const filtered = messages.filter((msg) =>
        this.config.consoleFilter.includes(msg.type() as 'error' | 'warning' | 'log' | 'info')
      );

      if (filtered.length === 0) {
        return undefined;
      }

      const consoleData = filtered.map((msg) => ({
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
      }));

      const jsonContent = JSON.stringify(consoleData, null, 2);
      return this.saveJsonEvidence(itemId, jsonContent, 'console-messages');
    } catch (error) {
      // Ignore errors capturing console messages
      return undefined;
    }
  }

  /**
   * Captures page errors and saves them as JSON via EvidenceStore.
   * @param page - Playwright page instance
   * @param itemId - Item ID for naming
   * @returns Path to saved page errors JSON, or undefined if none captured
   */
  private async capturePageErrors(
    page: Page,
    itemId: string
  ): Promise<string | undefined> {
    try {
      const errors = await page.pageErrors();

      if (errors.length === 0) {
        return undefined;
      }

      const errorsData = errors.map((error) => ({
        name: error.name,
        message: error.message,
        stack: error.stack,
      }));

      const jsonContent = JSON.stringify(errorsData, null, 2);
      return this.saveJsonEvidence(itemId, jsonContent, 'page-errors');
    } catch (error) {
      // Ignore errors capturing page errors
      return undefined;
    }
  }

  /**
   * Captures network requests and saves them as JSON via EvidenceStore.
   * @param page - Playwright page instance
   * @param itemId - Item ID for naming
   * @returns Path to saved network requests JSON, or undefined if none captured
   */
  private async captureNetworkRequests(
    page: Page,
    itemId: string
  ): Promise<string | undefined> {
    try {
      const requests = await page.requests();
      const maxRequests = this.config.maxNetworkRequests;
      const recentRequests = requests.slice(-maxRequests);

      // Filter for failed requests and HTTP error responses
      const failedRequests = await Promise.all(
        recentRequests.map(async (request) => {
          const failure = request.failure();
          if (failure) {
            return { request, failed: true };
          }
          const response = await request.response();
          if (response) {
            const status = response.status();
            if (status >= 400 && status < 600) {
              return { request, failed: true, response };
            }
          }
          return { request, failed: false };
        })
      );

      const filtered = failedRequests
        .filter((item) => item.failed)
        .map((item) => item.request);

      if (filtered.length === 0) {
        return undefined;
      }

      const networkData = await Promise.all(
        filtered.map(async (request) => {
          const response = await request.response();
          const failure = request.failure();
          return {
            url: request.url(),
            method: request.method(),
            status: response?.status(),
            statusText: response?.statusText(),
            failure: failure?.errorText,
            timing: {
              startTime: request.timing().startTime,
              domainLookupStart: request.timing().domainLookupStart,
              domainLookupEnd: request.timing().domainLookupEnd,
              connectStart: request.timing().connectStart,
              connectEnd: request.timing().connectEnd,
              requestStart: request.timing().requestStart,
              responseStart: request.timing().responseStart,
              responseEnd: request.timing().responseEnd,
            },
          };
        })
      );

      const jsonContent = JSON.stringify(networkData, null, 2);
      return this.saveJsonEvidence(itemId, jsonContent, 'network-requests');
    } catch (error) {
      // Ignore errors capturing network requests
      return undefined;
    }
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
