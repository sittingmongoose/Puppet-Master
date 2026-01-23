import { describe, it, expect, beforeEach } from 'vitest';
import { applyConfigOverrides, applyStepOverride, type StartChainOverride } from './config-override.js';
import { getDefaultConfig } from './default-config.js';
import type { PuppetMasterConfig } from '../types/config.js';

describe('Config Override Utility', () => {
  let baseConfig: PuppetMasterConfig;

  beforeEach(() => {
    baseConfig = getDefaultConfig();
  });

  describe('applyConfigOverrides', () => {
    it('should apply overrides to existing startChain config', () => {
      baseConfig.startChain = {
        prd: {
          platform: 'claude',
          model: 'claude-3-opus',
        },
      };

      const overrides: StartChainOverride = {
        prd: {
          platform: 'gemini',
          model: 'gemini-1.5-pro',
        },
      };

      const result = applyConfigOverrides(baseConfig, overrides);

      expect(result.startChain?.prd?.platform).toBe('gemini');
      expect(result.startChain?.prd?.model).toBe('gemini-1.5-pro');
    });

    it('should create startChain config if it does not exist', () => {
      baseConfig.startChain = undefined;

      const overrides: StartChainOverride = {
        prd: {
          platform: 'codex',
          model: 'gpt-4o',
        },
      };

      const result = applyConfigOverrides(baseConfig, overrides);

      expect(result.startChain).toBeDefined();
      expect(result.startChain?.prd?.platform).toBe('codex');
      expect(result.startChain?.prd?.model).toBe('gpt-4o');
    });

    it('should apply partial overrides (platform only)', () => {
      baseConfig.startChain = {
        prd: {
          platform: 'claude',
          model: 'claude-3-opus',
        },
      };

      const overrides: StartChainOverride = {
        prd: {
          platform: 'gemini',
          // model not provided
        },
      };

      const result = applyConfigOverrides(baseConfig, overrides);

      expect(result.startChain?.prd?.platform).toBe('gemini');
      expect(result.startChain?.prd?.model).toBe('claude-3-opus'); // Original preserved
    });

    it('should apply partial overrides (model only)', () => {
      baseConfig.startChain = {
        prd: {
          platform: 'claude',
          model: 'claude-3-opus',
        },
      };

      const overrides: StartChainOverride = {
        prd: {
          // platform not provided
          model: 'claude-3-sonnet',
        },
      };

      const result = applyConfigOverrides(baseConfig, overrides);

      expect(result.startChain?.prd?.platform).toBe('claude'); // Original preserved
      expect(result.startChain?.prd?.model).toBe('claude-3-sonnet');
    });

    it('should apply multiple step overrides', () => {
      const overrides: StartChainOverride = {
        prd: {
          platform: 'gemini',
          model: 'gemini-1.5-pro',
        },
        architecture: {
          platform: 'codex',
          model: 'gpt-4o',
        },
        requirementsInterview: {
          platform: 'claude',
          model: 'claude-3-opus',
        },
      };

      const result = applyConfigOverrides(baseConfig, overrides);

      expect(result.startChain?.prd?.platform).toBe('gemini');
      expect(result.startChain?.architecture?.platform).toBe('codex');
      expect(result.startChain?.requirementsInterview?.platform).toBe('claude');
    });

    it('should not mutate the original config', () => {
      baseConfig.startChain = {
        prd: {
          platform: 'claude',
          model: 'claude-3-opus',
        },
      };

      const originalPlatform = baseConfig.startChain.prd?.platform;
      const originalModel = baseConfig.startChain.prd?.model;

      const overrides: StartChainOverride = {
        prd: {
          platform: 'gemini',
          model: 'gemini-1.5-pro',
        },
      };

      applyConfigOverrides(baseConfig, overrides);

      // Original should be unchanged
      expect(baseConfig.startChain?.prd?.platform).toBe(originalPlatform);
      expect(baseConfig.startChain?.prd?.model).toBe(originalModel);
    });
  });

  describe('applyStepOverride', () => {
    it('should apply override for a single step', () => {
      const result = applyStepOverride(baseConfig, 'prd', {
        platform: 'gemini',
        model: 'gemini-1.5-pro',
      });

      expect(result.startChain?.prd?.platform).toBe('gemini');
      expect(result.startChain?.prd?.model).toBe('gemini-1.5-pro');
    });

    it('should create startChain if it does not exist', () => {
      baseConfig.startChain = undefined;

      const result = applyStepOverride(baseConfig, 'architecture', {
        platform: 'codex',
      });

      expect(result.startChain).toBeDefined();
      expect(result.startChain?.architecture?.platform).toBe('codex');
    });
  });
});
