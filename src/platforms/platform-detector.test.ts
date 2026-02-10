import { describe, it, expect } from 'vitest';
import { PlatformDetector } from './platform-detector.js';

describe('PlatformDetector', () => {
  describe('copilot Node requirement parsing', () => {
    const detector = new PlatformDetector({
      cursor: '',
      codex: '',
      claude: '',
      gemini: '',
      copilot: '',
    });

    it('parses required Node major from common Copilot error output', () => {
      const output = 'Error: GitHub Copilot CLI requires Node.js v24 or higher';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsed = (detector as any).parseNodeMajorRequirement(output) as unknown;
      expect(parsed).toMatchObject({ kind: 'node', requiredMajor: 24 });
    });

    it('parses required Node major with v24+ shorthand', () => {
      const output = 'copilot: requires Node.js v24+ (detected Node v22.12.0)';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsed = (detector as any).parseNodeMajorRequirement(output) as unknown;
      expect(parsed).toMatchObject({ kind: 'node', requiredMajor: 24, currentMajor: 22 });
    });

    it('returns null when no Node requirement pattern is present', () => {
      const output = 'copilot: command not found';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsed = (detector as any).parseNodeMajorRequirement(output) as unknown;
      expect(parsed).toBeNull();
    });
  });
});

