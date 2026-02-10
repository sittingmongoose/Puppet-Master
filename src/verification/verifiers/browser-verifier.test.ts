/**
 * Browser Verifier Tests
 * 
 * Tests for BrowserVerifier using mocked Playwright APIs.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserVerifier } from './browser-verifier.js';
import type { BrowserCriterion } from './browser-verifier.js';
import { EvidenceStore } from '../../memory/evidence-store.js';

// Mock Playwright - create mocks inside factory function
vi.mock('playwright', () => {
  const mockPage = {
    goto: vi.fn().mockResolvedValue(undefined),
    waitForSelector: vi.fn().mockResolvedValue(undefined),
    locator: vi.fn(),
    screenshot: vi.fn().mockResolvedValue(Buffer.from('screenshot data')),
  };

  const mockContext = {
    newPage: vi.fn().mockResolvedValue(mockPage),
    tracing: {
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
    },
  };

  const mockBrowser = {
    newContext: vi.fn().mockResolvedValue(mockContext),
    close: vi.fn().mockResolvedValue(undefined),
  };

  const mockChromium = {
    launch: vi.fn().mockResolvedValue(mockBrowser),
  };

  const mockFirefox = {
    launch: vi.fn().mockResolvedValue(mockBrowser),
  };

  const mockWebkit = {
    launch: vi.fn().mockResolvedValue(mockBrowser),
  };

  return {
    chromium: mockChromium,
    firefox: mockFirefox,
    webkit: mockWebkit,
    // Export mocks for use in tests
    __mocks: {
      page: mockPage,
      context: mockContext,
      browser: mockBrowser,
      chromium: mockChromium,
      firefox: mockFirefox,
      webkit: mockWebkit,
    },
  };
});

// Mock fs for trace capture
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    readFileSync: vi.fn().mockReturnValue(Buffer.from('mock trace data')),
    unlinkSync: vi.fn(),
  };
});

describe('BrowserVerifier', () => {
  let evidenceStore: EvidenceStore;
  let verifier: BrowserVerifier;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockPage: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockContext: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockBrowser: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockChromium: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockFirefox: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockWebkit: any;

  beforeEach(async () => {
    evidenceStore = new EvidenceStore();
    verifier = new BrowserVerifier(evidenceStore);

    // Get mocked instances
    const playwright = await import('playwright');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mocks = (playwright as any).__mocks;
    if (mocks) {
      mockPage = mocks.page;
      mockContext = mocks.context;
      mockBrowser = mocks.browser;
      mockChromium = mocks.chromium;
      mockFirefox = mocks.firefox;
      mockWebkit = mocks.webkit;
    }

    // Reset all mocks
    vi.clearAllMocks();

    // Setup default mocks
    mockPage.goto.mockResolvedValue(undefined);
    mockPage.waitForSelector.mockResolvedValue(undefined);
    mockPage.screenshot.mockResolvedValue(Buffer.from('screenshot data'));
    mockContext.tracing.start.mockResolvedValue(undefined);
    mockContext.tracing.stop.mockResolvedValue(undefined);
    mockBrowser.close.mockResolvedValue(undefined);
  });

  describe('constructor', () => {
    it('should create verifier with default config', () => {
      const v = new BrowserVerifier(evidenceStore);
      expect(v.type).toBe('browser_verify');
    });

    it('should create verifier with custom config', () => {
      const v = new BrowserVerifier(evidenceStore, {
        headless: false,
        browser: 'firefox',
        screenshotOnFailure: false,
        traceOnFailure: true,
      });
      expect(v.type).toBe('browser_verify');
    });
  });

  describe('verify', () => {
    it('should navigate to URL and pass verification', async () => {
      const criterion: BrowserCriterion = {
        id: 'TEST-001',
        description: 'Test navigation',
        type: 'browser_verify',
        target: 'https://example.com',
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
      expect(result.type).toBe('browser_verify');
      expect(result.target).toBe('https://example.com');
      expect(mockPage.goto).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({ waitUntil: 'load' })
      );
    });

    it('should check element visibility', async () => {
      const mockElement = {
        count: vi.fn().mockResolvedValue(1),
        isVisible: vi.fn().mockResolvedValue(true),
        textContent: vi.fn().mockResolvedValue('Test text'),
      describe: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnValue(''),
    };
      mockPage.locator.mockReturnValue(mockElement);

      const criterion: BrowserCriterion = {
        id: 'TEST-002',
        description: 'Test element visibility',
        type: 'browser_verify',
        target: 'https://example.com',
        options: {
          selector: '#test-element',
          visible: true,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
      expect(mockPage.locator).toHaveBeenCalledWith('#test-element');
      expect(mockElement.isVisible).toHaveBeenCalled();
    });

    it('should fail when element is not visible', async () => {
      const mockElement = {
        count: vi.fn().mockResolvedValue(1),
        isVisible: vi.fn().mockResolvedValue(false),
      describe: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnValue(''),
    };
      mockPage.locator.mockReturnValue(mockElement);

      const criterion: BrowserCriterion = {
        id: 'TEST-003',
        description: 'Test element not visible',
        type: 'browser_verify',
        target: 'https://example.com',
        options: {
          selector: '#test-element',
          visible: true,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
      expect(result.error).toContain('not visible');
    });

    it('should check text content', async () => {
      const mockElement = {
        count: vi.fn().mockResolvedValue(1),
        textContent: vi.fn().mockResolvedValue('Expected text'),
      describe: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnValue(''),
    };
      mockPage.locator.mockReturnValue(mockElement);

      const criterion: BrowserCriterion = {
        id: 'TEST-004',
        description: 'Test text content',
        type: 'browser_verify',
        target: 'https://example.com',
        options: {
          selector: '#test-element',
          text: 'Expected text',
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
      expect(mockElement.textContent).toHaveBeenCalled();
    });

    it('should fail when text does not match', async () => {
      const mockElement = {
        count: vi.fn().mockResolvedValue(1),
        textContent: vi.fn().mockResolvedValue('Different text'),
      describe: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnValue(''),
    };
      mockPage.locator.mockReturnValue(mockElement);

      const criterion: BrowserCriterion = {
        id: 'TEST-005',
        description: 'Test text mismatch',
        type: 'browser_verify',
        target: 'https://example.com',
        options: {
          selector: '#test-element',
          text: 'Expected text',
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
      expect(result.error).toContain('Text not found');
    });

    it('should fail when element is not found', async () => {
      const mockElement = {
        count: vi.fn().mockResolvedValue(0),
      describe: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnValue(''),
    };
      mockPage.locator.mockReturnValue(mockElement);

      const criterion: BrowserCriterion = {
        id: 'TEST-006',
        description: 'Test element not found',
        type: 'browser_verify',
        target: 'https://example.com',
        options: {
          selector: '#nonexistent',
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
      expect(result.error).toContain('Element not found');
    });

    it('should wait for selector before checking', async () => {
      const mockElement = {
        count: vi.fn().mockResolvedValue(1),
        isVisible: vi.fn().mockResolvedValue(true),
      describe: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnValue(''),
    };
      mockPage.locator.mockReturnValue(mockElement);

      const criterion: BrowserCriterion = {
        id: 'TEST-007',
        description: 'Test wait for selector',
        type: 'browser_verify',
        target: 'https://example.com',
        options: {
          waitFor: '#loading',
          selector: '#test-element',
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
      expect(mockPage.waitForSelector).toHaveBeenCalledWith(
        '#loading',
        expect.any(Object)
      );
    });

    it('should perform click action', async () => {
      const mockElement = {
        count: vi.fn().mockResolvedValue(1),
        click: vi.fn().mockResolvedValue(undefined),
      describe: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnValue(''),
    };
      mockPage.locator.mockReturnValue(mockElement);

      const criterion: BrowserCriterion = {
        id: 'TEST-008',
        description: 'Test click action',
        type: 'browser_verify',
        target: 'https://example.com',
        options: {
          action: {
            type: 'click',
            selector: '#button',
          },
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
      expect(mockElement.click).toHaveBeenCalled();
    });

    it('should perform fill action', async () => {
      const mockElement = {
        count: vi.fn().mockResolvedValue(1),
        fill: vi.fn().mockResolvedValue(undefined),
      describe: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnValue(''),
    };
      mockPage.locator.mockReturnValue(mockElement);

      const criterion: BrowserCriterion = {
        id: 'TEST-009',
        description: 'Test fill action',
        type: 'browser_verify',
        target: 'https://example.com',
        options: {
          action: {
            type: 'fill',
            selector: '#input',
            value: 'test value',
          },
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
      expect(mockElement.fill).toHaveBeenCalledWith('test value');
    });

    it('should perform select action', async () => {
      const mockElement = {
        count: vi.fn().mockResolvedValue(1),
        selectOption: vi.fn().mockResolvedValue(undefined),
      describe: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnValue(''),
    };
      mockPage.locator.mockReturnValue(mockElement);

      const criterion: BrowserCriterion = {
        id: 'TEST-010',
        description: 'Test select action',
        type: 'browser_verify',
        target: 'https://example.com',
        options: {
          action: {
            type: 'select',
            selector: '#select',
            value: 'option1',
          },
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
      expect(mockElement.selectOption).toHaveBeenCalledWith('option1');
    });

    it('should perform hover action', async () => {
      const mockElement = {
        count: vi.fn().mockResolvedValue(1),
        hover: vi.fn().mockResolvedValue(undefined),
      describe: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnValue(''),
    };
      mockPage.locator.mockReturnValue(mockElement);

      const criterion: BrowserCriterion = {
        id: 'TEST-011',
        description: 'Test hover action',
        type: 'browser_verify',
        target: 'https://example.com',
        options: {
          action: {
            type: 'hover',
            selector: '#element',
          },
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
      expect(mockElement.hover).toHaveBeenCalled();
    });

    it('should capture screenshot on failure', async () => {
      const mockElement = {
        count: vi.fn().mockResolvedValue(0),
      describe: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnValue(''),
    };
      mockPage.locator.mockReturnValue(mockElement);

      const saveScreenshotSpy = vi
        .spyOn(evidenceStore, 'saveScreenshot')
        .mockResolvedValue('.puppet-master/evidence/screenshots/TEST-012-screenshot.jpg');

      const criterion: BrowserCriterion = {
        id: 'TEST-012',
        description: 'Test screenshot on failure',
        type: 'browser_verify',
        target: 'https://example.com',
        options: {
          selector: '#nonexistent',
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
      expect(saveScreenshotSpy).toHaveBeenCalled();
      expect(result.evidencePath).toBeDefined();
    });

    it('should capture screenshot when explicitly requested', async () => {
      const saveScreenshotSpy = vi
        .spyOn(evidenceStore, 'saveScreenshot')
        .mockResolvedValue('.puppet-master/evidence/screenshots/TEST-013-screenshot.jpg');

      const criterion: BrowserCriterion = {
        id: 'TEST-013',
        description: 'Test explicit screenshot',
        type: 'browser_verify',
        target: 'https://example.com',
        options: {
          screenshot: true,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
      expect(saveScreenshotSpy).toHaveBeenCalled();
    });

    it('should handle navigation timeout', async () => {
      mockPage.goto.mockRejectedValue(new Error('Navigation timeout'));

      const criterion: BrowserCriterion = {
        id: 'TEST-014',
        description: 'Test navigation timeout',
        type: 'browser_verify',
        target: 'https://example.com',
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
      expect(result.error).toContain('Navigation timeout');
    });

    it('should handle browser launch errors', async () => {
      mockChromium.launch.mockRejectedValueOnce(new Error('Browser launch failed'));

      const criterion: BrowserCriterion = {
        id: 'TEST-015',
        description: 'Test browser launch error',
        type: 'browser_verify',
        target: 'https://example.com',
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
      expect(result.error).toContain('Browser launch failed');
    });

    it('should use custom timeout', async () => {
      const criterion: BrowserCriterion = {
        id: 'TEST-016',
        description: 'Test custom timeout',
        type: 'browser_verify',
        target: 'https://example.com',
        options: {
          timeout: 60000,
        },
      };

      await verifier.verify(criterion);

      expect(mockPage.goto).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({ timeout: 60000 })
      );
    });

    it('should use firefox browser when configured', async () => {
      const firefoxVerifier = new BrowserVerifier(evidenceStore, {
        browser: 'firefox',
      });

      const criterion: BrowserCriterion = {
        id: 'TEST-017',
        description: 'Test firefox browser',
        type: 'browser_verify',
        target: 'https://example.com',
      };

      await firefoxVerifier.verify(criterion);

      expect(mockFirefox.launch).toHaveBeenCalled();
    });

    it('should use webkit browser when configured', async () => {
      const webkitVerifier = new BrowserVerifier(evidenceStore, {
        browser: 'webkit',
      });

      const criterion: BrowserCriterion = {
        id: 'TEST-018',
        description: 'Test webkit browser',
        type: 'browser_verify',
        target: 'https://example.com',
      };

      await webkitVerifier.verify(criterion);

      expect(mockWebkit.launch).toHaveBeenCalled();
    });

    it('should always close browser in finally block', async () => {
      mockPage.goto.mockRejectedValue(new Error('Test error'));

      const criterion: BrowserCriterion = {
        id: 'TEST-019',
        description: 'Test browser cleanup',
        type: 'browser_verify',
        target: 'https://example.com',
      };

      await verifier.verify(criterion);

      // Browser should be closed even on error
      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });
});
