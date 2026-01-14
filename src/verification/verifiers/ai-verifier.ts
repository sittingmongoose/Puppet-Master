/**
 * AI Verifier
 * 
 * Uses AI platforms (Cursor, Codex, Claude) to verify semantic correctness of code.
 * Spawns fresh AI processes, sends structured verification prompts, parses responses,
 * and saves evidence.
 * 
 * See REQUIREMENTS.md Section 25.2 (Verifier Taxonomy) and Section 25.6 (AI Verification).
 */

import { readFile } from 'node:fs/promises';
import type { Criterion, VerifierResult } from '../../types/tiers.js';
import type { Platform } from '../../types/config.js';
import type { ExecutionRequest, RunningProcess } from '../../types/platforms.js';
import type { PlatformRegistry } from '../../platforms/registry.js';
import type { EvidenceStore } from '../../memory/evidence-store.js';

/**
 * AI-specific criterion options.
 */
export interface AICriterionOptions extends Record<string, unknown> {
  /** Question to ask the AI */
  question: string;
  /** Additional context for the verification */
  context?: string;
  /** Expected response keyword (optional) */
  expectedAnswer?: string;
  /** Platform to use (default: 'claude') */
  platform?: Platform;
  /** Model to use (optional, uses platform default if not specified) */
  model?: string;
}

/**
 * AI criterion interface.
 * Extends Criterion with AI-specific options.
 */
export interface AICriterion extends Criterion {
  type: 'ai';
  target: string;  // File path or content identifier
  options: AICriterionOptions;
}

/**
 * Internal AI verification result structure.
 */
export interface AIVerificationResult {
  passed: boolean;
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
  rawResponse: string;
}

/**
 * AI Verifier implementation.
 * 
 * Uses platform runners to invoke AI for semantic verification.
 */
export class AIVerifier {
  readonly type = 'ai';

  constructor(
    private readonly platformRegistry: PlatformRegistry,
    private readonly evidenceStore: EvidenceStore
  ) {}

  /**
   * Verifies a criterion using AI.
   * @param criterion - AI criterion to verify
   * @returns Verifier result
   */
  async verify(criterion: Criterion): Promise<VerifierResult> {
    const startTime = Date.now();
    const itemId = criterion.id || 'ai-verification';

    // Validate criterion type
    if (criterion.type !== 'ai') {
      return {
        type: this.type,
        target: criterion.target,
        passed: false,
        summary: `Invalid criterion type: expected 'ai', got '${criterion.type}'`,
        error: `Invalid criterion type: ${criterion.type}`,
        durationMs: Date.now() - startTime,
      };
    }

    const aiCriterion = criterion as unknown as AICriterion;

    // Validate options
    if (!aiCriterion.options || !aiCriterion.options.question) {
      return {
        type: this.type,
        target: aiCriterion.target,
        passed: false,
        summary: 'Missing required option: question',
        error: 'Missing required option: question',
        durationMs: Date.now() - startTime,
      };
    }

    try {
      // Get content to verify
      const content = await this.getContent(aiCriterion.target);

      // Build verification prompt
      const prompt = this.buildVerificationPrompt(aiCriterion, content);

      // Get platform (default: claude)
      const platform = aiCriterion.options.platform || 'claude';

      // Get platform runner
      const runner = this.platformRegistry.get(platform);
      if (!runner) {
        return {
          type: this.type,
          target: aiCriterion.target,
          passed: false,
          summary: `Platform '${platform}' not available`,
          error: `Platform '${platform}' not available in registry`,
          durationMs: Date.now() - startTime,
        };
      }

      // Build execution request
      const request: ExecutionRequest = {
        prompt,
        model: aiCriterion.options.model,
        workingDirectory: process.cwd(),
        nonInteractive: true,
        timeout: runner.defaultTimeout,
      };

      // Spawn AI process
      const runningProcess = await runner.spawnFreshProcess(request);

      // Wait for process to complete
      const processResult = await this.waitForProcess(runningProcess, runner);

      // Get transcript
      const transcript = await runner.getTranscript(runningProcess.pid);

      // Clean up
      await runner.cleanupAfterExecution(runningProcess.pid);

      // Parse AI response
      const aiResult = this.parseAIResponse(transcript);

      // Save evidence
      const evidencePath = await this.saveEvidence(
        itemId,
        transcript,
        aiCriterion,
        aiResult
      );

      const durationMs = Date.now() - startTime;

      // Build summary
      const summary = this.buildSummary(aiResult, processResult);

      return {
        type: this.type,
        target: aiCriterion.target,
        passed: aiResult.passed,
        evidencePath,
        summary,
        durationMs,
        error: aiResult.passed ? undefined : aiResult.explanation,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      return {
        type: this.type,
        target: aiCriterion.target,
        passed: false,
        summary: `AI verification failed: ${errorMessage}`,
        error: errorMessage,
        durationMs,
      };
    }
  }

  /**
   * Builds the verification prompt from criterion and content.
   * @param criterion - AI criterion
   * @param content - Content to verify
   * @returns Formatted prompt
   */
  private buildVerificationPrompt(
    criterion: AICriterion,
    content: string
  ): string {
    const question = criterion.options.question;
    const context = criterion.options.context || '';

    return `You are a code reviewer verifying implementation correctness.

## Content to Review
${content}

## Verification Question
${question}

${context ? `## Additional Context
${context}

` : ''}## Instructions
Analyze the content and answer the question.
Respond in this EXACT format:

VERDICT: PASS or FAIL
CONFIDENCE: HIGH, MEDIUM, or LOW
EXPLANATION: Your reasoning (1-3 sentences)`;
  }

  /**
   * Parses AI response to extract verdict, confidence, and explanation.
   * @param response - Raw AI response
   * @returns Parsed verification result
   */
  private parseAIResponse(response: string): AIVerificationResult {
    // Default to FAIL if parsing fails
    const defaultResult: AIVerificationResult = {
      passed: false,
      confidence: 'low',
      explanation: 'Failed to parse AI response',
      rawResponse: response,
    };

    // Extract VERDICT
    const verdictMatch = response.match(/VERDICT:\s*(PASS|FAIL)/i);
    if (!verdictMatch) {
      return defaultResult;
    }
    const passed = verdictMatch[1]!.toUpperCase() === 'PASS';

    // Extract CONFIDENCE
    const confidenceMatch = response.match(/CONFIDENCE:\s*(HIGH|MEDIUM|LOW)/i);
    if (!confidenceMatch) {
      return defaultResult;
    }
    const confidence = confidenceMatch[1]!.toLowerCase() as 'high' | 'medium' | 'low';

    // Extract EXPLANATION
    const explanationMatch = response.match(/EXPLANATION:\s*(.+?)(?:\n\n|\nVERDICT|$)/is);
    const explanation = explanationMatch
      ? explanationMatch[1]!.trim()
      : 'No explanation provided';

    return {
      passed,
      confidence,
      explanation,
      rawResponse: response,
    };
  }

  /**
   * Gets content from target (file path or inline content).
   * @param target - File path or content identifier
   * @returns Content string
   */
  private async getContent(target: string): Promise<string> {
    // Try to read as file first
    try {
      const content = await readFile(target, 'utf-8');
      return content;
    } catch (error) {
      // If file read fails, check if it's a file path
      // If target doesn't look like a file path, treat as inline content
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        // File doesn't exist - could be inline content or invalid path
        // For now, return the target as-is (caller can handle)
        return target;
      }
      throw error;
    }
  }

  /**
   * Waits for a process to complete by waiting for stdout to end.
   * @param runningProcess - Running process
   * @param runner - Platform runner
   * @returns Process exit code
   */
  private async waitForProcess(
    runningProcess: RunningProcess,
    runner: { defaultTimeout: number; terminateProcess: (pid: number) => Promise<void> }
  ): Promise<{ exitCode: number; timedOut: boolean }> {
    return new Promise<{ exitCode: number; timedOut: boolean }>((resolve) => {
      let resolved = false;

      // Use a shorter timeout for tests (but respect the runner's timeout)
      const timeoutMs = Math.min(runner.defaultTimeout, 5000);

      // Set timeout
      const timeout = setTimeout(async () => {
        if (!resolved) {
          resolved = true;
          await runner.terminateProcess(runningProcess.pid);
          resolve({ exitCode: -1, timedOut: true });
        }
      }, timeoutMs);

      // Wait for stdout to end (indicates process completion)
      const onEnd = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve({ exitCode: 0, timedOut: false });
        }
      };

      const onError = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve({ exitCode: -1, timedOut: false });
        }
      };

      // Check if already ended (using type assertion for Node.js stream)
      const stdout = runningProcess.stdout as NodeJS.ReadableStream;
      if ('readableEnded' in stdout && (stdout as NodeJS.ReadableStream & { readableEnded?: boolean }).readableEnded) {
        onEnd();
        return;
      }

      // Set up listeners
      runningProcess.stdout.once('end', onEnd);
      runningProcess.stdout.once('error', onError);
    });
  }

  /**
   * Saves AI verification evidence.
   * @param itemId - Item ID for evidence naming
   * @param rawResponse - Raw AI response
   * @param criterion - Original criterion
   * @param aiResult - Parsed AI result
   * @returns Path to saved evidence file
   */
  private async saveEvidence(
    itemId: string,
    rawResponse: string,
    criterion: AICriterion,
    aiResult: AIVerificationResult
  ): Promise<string> {
    const evidenceContent = [
      `AI Verification Evidence`,
      `Platform: ${criterion.options.platform || 'claude'}`,
      `Question: ${criterion.options.question}`,
      `Target: ${criterion.target}`,
      `Context: ${criterion.options.context || '(none)'}`,
      '',
      '=== AI Response ===',
      rawResponse,
      '',
      '=== Parsed Result ===',
      `Verdict: ${aiResult.passed ? 'PASS' : 'FAIL'}`,
      `Confidence: ${aiResult.confidence.toUpperCase()}`,
      `Explanation: ${aiResult.explanation}`,
    ].join('\n');

    const testName = `ai-verification-${Date.now()}`;
    return await this.evidenceStore.saveTestLog(itemId, evidenceContent, testName);
  }

  /**
   * Builds a human-readable summary from AI result and process result.
   * @param aiResult - Parsed AI result
   * @param processResult - Process execution result
   * @returns Summary string
   */
  private buildSummary(
    aiResult: AIVerificationResult,
    processResult: { exitCode: number; timedOut: boolean }
  ): string {
    const parts: string[] = [];

    if (processResult.timedOut) {
      parts.push('AI verification timed out');
    } else if (processResult.exitCode !== 0) {
      parts.push(`AI process exited with code ${processResult.exitCode}`);
    }

    if (aiResult.passed) {
      parts.push(`Verification PASSED (confidence: ${aiResult.confidence})`);
    } else {
      parts.push(`Verification FAILED (confidence: ${aiResult.confidence})`);
    }

    if (aiResult.explanation) {
      parts.push(`Reason: ${aiResult.explanation}`);
    }

    return parts.join('; ') || 'AI verification completed';
  }
}
