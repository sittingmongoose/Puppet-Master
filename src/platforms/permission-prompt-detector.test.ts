/**
 * Permission Prompt Detector Tests
 */

import { describe, it, expect } from 'vitest';
import {
  scanForPermissionPrompt,
  scanTailForPermissionPrompt,
  PermissionPromptDetector,
} from './permission-prompt-detector.js';

describe('PermissionPromptDetector', () => {
  describe('scanForPermissionPrompt', () => {
    it('returns null for clean output', () => {
      const output = 'Build succeeded. All tests passed.\n<ralph>COMPLETE</ralph>';
      expect(scanForPermissionPrompt(output, 'claude')).toBeNull();
    });

    it('detects [Y/n] prompt', () => {
      const output = 'Do you want to proceed? [Y/n]';
      const result = scanForPermissionPrompt(output, 'cursor');
      expect(result).not.toBeNull();
      expect(result!.detected).toBe(true);
      expect(result!.pattern).toBe('[Y/n]');
      expect(result!.platform).toBe('cursor');
    });

    it('detects [y/N] prompt', () => {
      const output = 'Continue? [y/N]';
      const result = scanForPermissionPrompt(output, 'gemini');
      expect(result).not.toBeNull();
      expect(result!.pattern).toBe('[y/N]');
    });

    it('detects "Do you want to allow" prompt', () => {
      const output = 'Do you want to allow this tool to access the filesystem?';
      const result = scanForPermissionPrompt(output, 'copilot');
      expect(result).not.toBeNull();
      expect(result!.pattern).toBe('Do you want to allow');
    });

    it('detects "Approve?" prompt', () => {
      const output = 'The agent wants to run: rm -rf /tmp/test\nApprove?';
      const result = scanForPermissionPrompt(output, 'claude');
      expect(result).not.toBeNull();
      expect(result!.pattern).toBe('Approve?');
    });

    it('detects "trust this directory" prompt', () => {
      const output = 'Do you trust this directory? This is your first time running here.';
      const result = scanForPermissionPrompt(output, 'copilot');
      expect(result).not.toBeNull();
      expect(result!.pattern).toBe('trust this directory');
    });

    it('detects "Waiting for approval" pattern', () => {
      const output = 'Waiting for user approval to proceed...';
      const result = scanForPermissionPrompt(output, 'gemini');
      expect(result).not.toBeNull();
      expect(result!.pattern).toBe('Waiting for approval');
    });

    it('detects "confirm (y/n)" pattern', () => {
      const output = 'Please confirm (y/n):';
      const result = scanForPermissionPrompt(output, 'codex');
      expect(result).not.toBeNull();
      expect(result!.pattern).toBe('confirm (y/n)');
    });

    it('detects "Permission required" pattern', () => {
      const output = 'Permission required to execute this command.';
      const result = scanForPermissionPrompt(output, 'cursor');
      expect(result).not.toBeNull();
      expect(result!.pattern).toBe('Permission required');
    });

    it('includes context around match', () => {
      const output = 'Some prefix text. Do you want to allow this? Some suffix text.';
      const result = scanForPermissionPrompt(output, 'claude');
      expect(result).not.toBeNull();
      expect(result!.context).toContain('Do you want to allow');
      expect(result!.context.length).toBeGreaterThan(0);
    });

    it('includes timestamp', () => {
      const output = 'Approve?';
      const result = scanForPermissionPrompt(output, 'claude');
      expect(result).not.toBeNull();
      expect(result!.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('returns null for empty output', () => {
      expect(scanForPermissionPrompt('', 'claude')).toBeNull();
    });
  });

  describe('scanTailForPermissionPrompt', () => {
    it('only scans the tail of output', () => {
      // Pattern is in the beginning (outside tail), should not be detected
      const prefix = 'Do you want to allow this? [Y/n]\n';
      const padding = 'x'.repeat(1000);
      const output = prefix + padding;

      // With small tail, should not detect the prompt at the start
      const result = scanTailForPermissionPrompt(output, 'claude', 100);
      expect(result).toBeNull();
    });

    it('detects pattern within tail range', () => {
      const padding = 'x'.repeat(1000);
      const output = padding + '\nDo you want to allow this? [Y/n]';

      const result = scanTailForPermissionPrompt(output, 'claude', 100);
      expect(result).not.toBeNull();
      expect(result!.pattern).toBe('Do you want to allow');
    });

    it('uses default tail size when not specified', () => {
      const padding = 'x'.repeat(1000);
      const output = padding + '\nApprove?';

      const result = scanTailForPermissionPrompt(output, 'claude');
      expect(result).not.toBeNull();
    });

    it('scans full output when tail is larger than output', () => {
      const output = 'Approve?';
      const result = scanTailForPermissionPrompt(output, 'claude', 10000);
      expect(result).not.toBeNull();
    });
  });

  describe('PermissionPromptDetector class', () => {
    const detector = new PermissionPromptDetector();

    it('scan delegates to scanForPermissionPrompt', () => {
      const output = 'Do you want to allow this?';
      const result = detector.scan(output, 'claude');
      expect(result).not.toBeNull();
      expect(result!.detected).toBe(true);
    });

    it('scanTail delegates to scanTailForPermissionPrompt', () => {
      const output = 'Approve?';
      const result = detector.scanTail(output, 'claude', 500);
      expect(result).not.toBeNull();
      expect(result!.detected).toBe(true);
    });

    it('returns null for clean output', () => {
      const output = 'All tests passed successfully.';
      expect(detector.scan(output, 'claude')).toBeNull();
      expect(detector.scanTail(output, 'claude')).toBeNull();
    });
  });

  describe('false positive avoidance', () => {
    it('does not trigger on "Permission denied" error messages in body', () => {
      // "Permission denied" should not match -- we look for "Permission required"
      const output = 'Error: Permission denied accessing /etc/shadow\nFalling back to default config.';
      const result = scanForPermissionPrompt(output, 'claude');
      // "Permission denied" is not in our patterns (it's a result, not a prompt)
      expect(result).toBeNull();
    });

    it('does not trigger on "approved" in past tense', () => {
      const output = 'The tool was approved and executed successfully.';
      const result = scanForPermissionPrompt(output, 'claude');
      expect(result).toBeNull();
    });

    it('does not trigger on code containing similar strings', () => {
      // Code blocks should ideally not trigger, but since this is best-effort,
      // the tail scanning helps avoid buried patterns.
      const code = 'const msg = "Do you want to allow cookies?";\nconsole.log(msg);';
      const safeOutput = code + '\n' + 'x'.repeat(600) + '\nBuild complete.';
      const result = scanTailForPermissionPrompt(safeOutput, 'claude', 200);
      expect(result).toBeNull();
    });
  });
});
