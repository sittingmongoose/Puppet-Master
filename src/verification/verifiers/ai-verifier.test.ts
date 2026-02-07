/**
 * AI Verifier Tests
 * 
 * Tests for the AIVerifier implementation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { PassThrough } from 'stream';
import { AIVerifier, type AICriterion } from './ai-verifier.js';
import type { PlatformRegistry } from '../../platforms/registry.js';
import type { EvidenceStore } from '../../memory/evidence-store.js';
import type { BasePlatformRunner } from '../../platforms/base-runner.js';
import type { RunningProcess } from '../../types/platforms.js';
import type { Platform } from '../../types/config.js';

describe('AIVerifier', () => {
  let verifier: AIVerifier;
  let mockPlatformRegistry: PlatformRegistry;
  let mockEvidenceStore: EvidenceStore;
  let mockRunner: BasePlatformRunner;
  let testDir: string;

  beforeEach(async () => {
    testDir = join(process.cwd(), '.test-ai-verifier');
    await mkdir(testDir, { recursive: true });

    // Mock EvidenceStore
    mockEvidenceStore = {
      saveTestLog: vi.fn().mockResolvedValue('/path/to/evidence.log'),
      initialize: vi.fn().mockResolvedValue(undefined),
    } as unknown as EvidenceStore;

    // Mock Platform Runner
    mockRunner = {
      platform: 'claude' as const,
      defaultTimeout: 1000, // Short timeout for tests
      spawnFreshProcess: vi.fn(),
      getTranscript: vi.fn(),
      cleanupAfterExecution: vi.fn().mockResolvedValue(undefined),
      terminateProcess: vi.fn().mockResolvedValue(undefined),
    } as unknown as BasePlatformRunner;

    // Mock PlatformRegistry
    mockPlatformRegistry = {
      get: vi.fn().mockReturnValue(mockRunner),
    } as unknown as PlatformRegistry;

    verifier = new AIVerifier(mockPlatformRegistry, mockEvidenceStore);
  });

  afterEach(async () => {
    // Under heavy IO load, recursive deletion can briefly fail with ENOTEMPTY on some FS.
    await rm(testDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    vi.clearAllMocks();
  });

  describe('verify', () => {
    it('should pass for valid PASS response', async () => {
      const testFile = join(testDir, 'test.ts');
      await writeFile(testFile, 'export function add(a: number, b: number) { return a + b; }');

      const aiResponse = `VERDICT: PASS
CONFIDENCE: HIGH
EXPLANATION: The function correctly implements addition with proper TypeScript types.`;

      const mockProcess = createMockProcess();
      (mockRunner.spawnFreshProcess as ReturnType<typeof vi.fn>).mockResolvedValue(mockProcess);
      (mockRunner.getTranscript as ReturnType<typeof vi.fn>).mockResolvedValue(aiResponse);

      const criterion: AICriterion = {
        id: 'test-1',
        description: 'Verify function correctness',
        type: 'ai',
        target: testFile,
        options: {
          question: 'Does this function correctly implement addition?',
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
      expect(result.type).toBe('ai');
      expect(result.target).toBe(testFile);
      expect(result.summary).toContain('PASSED');
      expect(result.summary.toLowerCase()).toContain('high');
      expect(mockEvidenceStore.saveTestLog).toHaveBeenCalled();
    });

    it('should fail for valid FAIL response', async () => {
      const testFile = join(testDir, 'test.ts');
      await writeFile(testFile, 'export function add(a, b) { return a - b; }');

      const aiResponse = `VERDICT: FAIL
CONFIDENCE: HIGH
EXPLANATION: The function implements subtraction instead of addition, which is incorrect.`;

      const mockProcess = createMockProcess();
      (mockRunner.spawnFreshProcess as ReturnType<typeof vi.fn>).mockResolvedValue(mockProcess);
      (mockRunner.getTranscript as ReturnType<typeof vi.fn>).mockResolvedValue(aiResponse);

      const criterion: AICriterion = {
        id: 'test-2',
        description: 'Verify function correctness',
        type: 'ai',
        target: testFile,
        options: {
          question: 'Does this function correctly implement addition?',
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
      expect(result.summary).toContain('FAILED');
      expect(result.error).toBeDefined();
    });

    it('should extract confidence levels correctly', async () => {
      const testFile = join(testDir, 'test.ts');
      await writeFile(testFile, 'export const x = 1;');

      const testCases = [
        { response: 'VERDICT: PASS\nCONFIDENCE: HIGH\nEXPLANATION: Good', expected: 'HIGH' },
        { response: 'VERDICT: PASS\nCONFIDENCE: MEDIUM\nEXPLANATION: OK', expected: 'MEDIUM' },
        { response: 'VERDICT: PASS\nCONFIDENCE: LOW\nEXPLANATION: Uncertain', expected: 'LOW' },
      ];

      for (const testCase of testCases) {
        const mockProcess = createMockProcess();
        (mockRunner.spawnFreshProcess as ReturnType<typeof vi.fn>).mockResolvedValue(mockProcess);
        (mockRunner.getTranscript as ReturnType<typeof vi.fn>).mockResolvedValue(testCase.response);

        const criterion: AICriterion = {
          id: 'test-confidence',
          description: 'Test confidence',
          type: 'ai',
          target: testFile,
          options: {
            question: 'Is this correct?',
          },
        };

        const result = await verifier.verify(criterion);
        expect(result.summary.toLowerCase()).toContain(testCase.expected.toLowerCase());
      }
    });

    it('should handle malformed response by defaulting to FAIL', async () => {
      const testFile = join(testDir, 'test.ts');
      await writeFile(testFile, 'export const x = 1;');

      const malformedResponse = 'This is not in the expected format.';

      const mockProcess = createMockProcess();
      (mockRunner.spawnFreshProcess as ReturnType<typeof vi.fn>).mockResolvedValue(mockProcess);
      (mockRunner.getTranscript as ReturnType<typeof vi.fn>).mockResolvedValue(malformedResponse);

      const criterion: AICriterion = {
        id: 'test-3',
        description: 'Test malformed response',
        type: 'ai',
        target: testFile,
        options: {
          question: 'Is this correct?',
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
      expect(result.summary).toContain('FAILED');
      expect(result.summary).toContain('low');
    });

    it('should include context in prompt when provided', async () => {
      const testFile = join(testDir, 'test.ts');
      await writeFile(testFile, 'export const x = 1;');

      const aiResponse = 'VERDICT: PASS\nCONFIDENCE: HIGH\nEXPLANATION: Good';

      const mockProcess = createMockProcess();
      (mockRunner.spawnFreshProcess as ReturnType<typeof vi.fn>).mockResolvedValue(mockProcess);
      (mockRunner.getTranscript as ReturnType<typeof vi.fn>).mockResolvedValue(aiResponse);

      const criterion: AICriterion = {
        id: 'test-4',
        description: 'Test with context',
        type: 'ai',
        target: testFile,
        options: {
          question: 'Is this correct?',
          context: 'This is additional context for the verification.',
        },
      };

      await verifier.verify(criterion);

      const spawnCall = (mockRunner.spawnFreshProcess as ReturnType<typeof vi.fn>).mock.calls[0];
      const request = spawnCall[0] as { prompt: string };
      expect(request.prompt).toContain('Additional Context');
      expect(request.prompt).toContain('This is additional context');
    });

    it('should use specified platform', async () => {
      const testFile = join(testDir, 'test.ts');
      await writeFile(testFile, 'export const x = 1;');

      const aiResponse = 'VERDICT: PASS\nCONFIDENCE: HIGH\nEXPLANATION: Good';

      const mockProcess = createMockProcess();
      (mockRunner.spawnFreshProcess as ReturnType<typeof vi.fn>).mockResolvedValue(mockProcess);
      (mockRunner.getTranscript as ReturnType<typeof vi.fn>).mockResolvedValue(aiResponse);

      const criterion: AICriterion = {
        id: 'test-5',
        description: 'Test platform selection',
        type: 'ai',
        target: testFile,
        options: {
          question: 'Is this correct?',
          platform: 'cursor',
        },
      };

      await verifier.verify(criterion);

      expect(mockPlatformRegistry.get).toHaveBeenCalledWith('cursor');
    });

    it('should default to claude platform when not specified', async () => {
      const testFile = join(testDir, 'test.ts');
      await writeFile(testFile, 'export const x = 1;');

      const aiResponse = 'VERDICT: PASS\nCONFIDENCE: HIGH\nEXPLANATION: Good';

      const mockProcess = createMockProcess();
      (mockRunner.spawnFreshProcess as ReturnType<typeof vi.fn>).mockResolvedValue(mockProcess);
      (mockRunner.getTranscript as ReturnType<typeof vi.fn>).mockResolvedValue(aiResponse);

      const criterion: AICriterion = {
        id: 'test-6',
        description: 'Test default platform',
        type: 'ai',
        target: testFile,
        options: {
          question: 'Is this correct?',
        },
      };

      await verifier.verify(criterion);

      expect(mockPlatformRegistry.get).toHaveBeenCalledWith('claude');
    });

    it('should handle missing platform gracefully', async () => {
      const testFile = join(testDir, 'test.ts');
      await writeFile(testFile, 'export const x = 1;');

      (mockPlatformRegistry.get as ReturnType<typeof vi.fn>).mockReturnValue(undefined);

      const criterion: AICriterion = {
        id: 'test-7',
        description: 'Test missing platform',
        type: 'ai',
        target: testFile,
        options: {
          question: 'Is this correct?',
          platform: 'nonexistent' as Platform,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
      expect(result.error).toContain('not available');
    });

    it('should reject invalid criterion type', async () => {
      const criterion = {
        id: 'test-8',
        description: 'Wrong type',
        type: 'regex',
        target: 'some-file.ts',
        options: {},
      };

      const result = await verifier.verify(criterion as AICriterion);

      expect(result.passed).toBe(false);
      expect(result.error).toContain('Invalid criterion type');
    });

    it('should reject missing question option', async () => {
      const testFile = join(testDir, 'test.ts');
      await writeFile(testFile, 'export const x = 1;');

      const criterion = {
        id: 'test-9',
        description: 'Missing question',
        type: 'ai' as const,
        target: testFile,
        options: {},
      };

      const result = await verifier.verify(criterion as AICriterion);

      expect(result.passed).toBe(false);
      expect(result.error).toContain('Missing required option: question');
    });

    it('should read file content when target is a file path', async () => {
      const testFile = join(testDir, 'test.ts');
      const fileContent = 'export function test() { return true; }';
      await writeFile(testFile, fileContent);

      const aiResponse = 'VERDICT: PASS\nCONFIDENCE: HIGH\nEXPLANATION: Good';

      const mockProcess = createMockProcess();
      (mockRunner.spawnFreshProcess as ReturnType<typeof vi.fn>).mockResolvedValue(mockProcess);
      (mockRunner.getTranscript as ReturnType<typeof vi.fn>).mockResolvedValue(aiResponse);

      const criterion: AICriterion = {
        id: 'test-10',
        description: 'Test file reading',
        type: 'ai',
        target: testFile,
        options: {
          question: 'Is this correct?',
        },
      };

      await verifier.verify(criterion);

      const spawnCall = (mockRunner.spawnFreshProcess as ReturnType<typeof vi.fn>).mock.calls[0];
      const request = spawnCall[0] as { prompt: string };
      expect(request.prompt).toContain(fileContent);
    });

    it('should handle file read errors gracefully', async () => {
      const nonExistentFile = join(testDir, 'nonexistent.ts');

      const aiResponse = 'VERDICT: PASS\nCONFIDENCE: HIGH\nEXPLANATION: Good';

      const mockProcess = createMockProcess();
      (mockRunner.spawnFreshProcess as ReturnType<typeof vi.fn>).mockResolvedValue(mockProcess);
      (mockRunner.getTranscript as ReturnType<typeof vi.fn>).mockResolvedValue(aiResponse);

      const criterion: AICriterion = {
        id: 'test-11',
        description: 'Test file read error',
        type: 'ai',
        target: nonExistentFile,
        options: {
          question: 'Is this correct?',
        },
      };

      // Should not throw, but may use target as content
      const result = await verifier.verify(criterion);
      expect(result).toBeDefined();
    });

    it('should save evidence with raw response', async () => {
      const testFile = join(testDir, 'test.ts');
      await writeFile(testFile, 'export const x = 1;');

      const aiResponse = 'VERDICT: PASS\nCONFIDENCE: HIGH\nEXPLANATION: This is good code.';

      const mockProcess = createMockProcess();
      (mockRunner.spawnFreshProcess as ReturnType<typeof vi.fn>).mockResolvedValue(mockProcess);
      (mockRunner.getTranscript as ReturnType<typeof vi.fn>).mockResolvedValue(aiResponse);

      const criterion: AICriterion = {
        id: 'test-12',
        description: 'Test evidence saving',
        type: 'ai',
        target: testFile,
        options: {
          question: 'Is this correct?',
        },
      };

      await verifier.verify(criterion);

      expect(mockEvidenceStore.saveTestLog).toHaveBeenCalled();
      const saveCall = (mockEvidenceStore.saveTestLog as ReturnType<typeof vi.fn>).mock.calls[0];
      const evidenceContent = saveCall[1] as string;
      expect(evidenceContent).toContain(aiResponse);
      expect(evidenceContent).toContain('Verdict: PASS');
      expect(evidenceContent).toContain('Confidence: HIGH');
    });

    it('should include duration in result', async () => {
      const testFile = join(testDir, 'test.ts');
      await writeFile(testFile, 'export const x = 1;');

      const aiResponse = 'VERDICT: PASS\nCONFIDENCE: HIGH\nEXPLANATION: Good';

      const mockProcess = createMockProcess();
      (mockRunner.spawnFreshProcess as ReturnType<typeof vi.fn>).mockResolvedValue(mockProcess);
      (mockRunner.getTranscript as ReturnType<typeof vi.fn>).mockResolvedValue(aiResponse);

      const criterion: AICriterion = {
        id: 'test-13',
        description: 'Test duration',
        type: 'ai',
        target: testFile,
        options: {
          question: 'Is this correct?',
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.durationMs).toBeGreaterThanOrEqual(0);
      expect(typeof result.durationMs).toBe('number');
    });

    it('should handle process errors gracefully', async () => {
      const testFile = join(testDir, 'test.ts');
      await writeFile(testFile, 'export const x = 1;');

      (mockRunner.spawnFreshProcess as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Process spawn failed')
      );

      const criterion: AICriterion = {
        id: 'test-14',
        description: 'Test process error',
        type: 'ai',
        target: testFile,
        options: {
          question: 'Is this correct?',
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
      expect(result.error).toContain('Process spawn failed');
    });

    it('should extract explanation from response', async () => {
      const testFile = join(testDir, 'test.ts');
      await writeFile(testFile, 'export const x = 1;');

      const explanation = 'This function correctly implements the required logic with proper error handling.';
      const aiResponse = `VERDICT: PASS
CONFIDENCE: HIGH
EXPLANATION: ${explanation}`;

      const mockProcess = createMockProcess();
      (mockRunner.spawnFreshProcess as ReturnType<typeof vi.fn>).mockResolvedValue(mockProcess);
      (mockRunner.getTranscript as ReturnType<typeof vi.fn>).mockResolvedValue(aiResponse);

      const criterion: AICriterion = {
        id: 'test-15',
        description: 'Test explanation extraction',
        type: 'ai',
        target: testFile,
        options: {
          question: 'Is this correct?',
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.summary).toContain(explanation);
      if (!result.passed) {
        expect(result.error).toContain(explanation);
      }
    });

    it('should handle multiline explanations', async () => {
      const testFile = join(testDir, 'test.ts');
      await writeFile(testFile, 'export const x = 1;');

      const aiResponse = `VERDICT: PASS
CONFIDENCE: MEDIUM
EXPLANATION: This is a multiline explanation.
It spans multiple lines.
And provides detailed reasoning.`;

      const mockProcess = createMockProcess();
      (mockRunner.spawnFreshProcess as ReturnType<typeof vi.fn>).mockResolvedValue(mockProcess);
      (mockRunner.getTranscript as ReturnType<typeof vi.fn>).mockResolvedValue(aiResponse);

      const criterion: AICriterion = {
        id: 'test-16',
        description: 'Test multiline explanation',
        type: 'ai',
        target: testFile,
        options: {
          question: 'Is this correct?',
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
      expect(result.summary).toContain('multiline');
    });
  });
});

/**
 * Creates a mock RunningProcess for testing.
 */
function createMockProcess(): RunningProcess {
  const stdout = new PassThrough();
  const stderr = new PassThrough();
  const stdin = new PassThrough();

  // End streams immediately using setImmediate to ensure it happens
  // after the process is returned but before any async operations
  setImmediate(() => {
    try {
      if (!stdout.destroyed && !stdout.writableEnded) {
        stdout.end();
      }
    } catch {
      // Ignore errors
    }
    try {
      if (!stderr.destroyed && !stderr.writableEnded) {
        stderr.end();
      }
    } catch {
      // Ignore errors
    }
  });

  return {
    pid: 12345,
    platform: 'claude',
    startedAt: new Date().toISOString(),
    stdin,
    stdout,
    stderr,
  };
}
