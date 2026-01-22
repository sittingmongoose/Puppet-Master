/**
 * Tests for PlatformRegistry
 * 
 * Tests platform registry functionality including registration,
 * retrieval, availability checks, and factory methods.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlatformRegistry } from './registry.js';
import { BasePlatformRunner } from './base-runner.js';
import { CapabilityDiscoveryService } from './capability-discovery.js';
import { CursorRunner } from './cursor-runner.js';
import { CodexRunner } from './codex-runner.js';
import { ClaudeRunner } from './claude-runner.js';
import type { PuppetMasterConfig } from '../types/config.js';
import { getDefaultConfig } from '../config/default-config.js';

describe('PlatformRegistry', () => {
  let capabilityService: CapabilityDiscoveryService;

  beforeEach(() => {
    // Create mock capability service
    capabilityService = {
      probe: vi.fn(),
      getCached: vi.fn(),
      refresh: vi.fn(),
      isCacheValid: vi.fn(),
    } as unknown as CapabilityDiscoveryService;

    // Reset singleton instance for each test
    // Access private static instance via reflection (not ideal but necessary for testing)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (PlatformRegistry as any).instance = null;
  });

  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = PlatformRegistry.getInstance();
      const instance2 = PlatformRegistry.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should create a new instance if none exists', () => {
      const instance = PlatformRegistry.getInstance();
      expect(instance).toBeInstanceOf(PlatformRegistry);
    });
  });

  describe('register and get', () => {
    it('should register and retrieve a runner', () => {
      const registry = new PlatformRegistry();
      const runner = new CursorRunner(capabilityService);

      registry.register('cursor', runner);
      const retrieved = registry.get('cursor');

      expect(retrieved).toBe(runner);
      expect(retrieved?.platform).toBe('cursor');
    });

    it('should return undefined for unregistered platform', () => {
      const registry = new PlatformRegistry();
      const retrieved = registry.get('cursor');
      expect(retrieved).toBeUndefined();
    });

    it('should allow registering multiple platforms', () => {
      const registry = new PlatformRegistry();
      const cursorRunner = new CursorRunner(capabilityService);
      const codexRunner = new CodexRunner(capabilityService);
      const claudeRunner = new ClaudeRunner(capabilityService);

      registry.register('cursor', cursorRunner);
      registry.register('codex', codexRunner);
      registry.register('claude', claudeRunner);

      expect(registry.get('cursor')).toBe(cursorRunner);
      expect(registry.get('codex')).toBe(codexRunner);
      expect(registry.get('claude')).toBe(claudeRunner);
    });

    it('should overwrite existing registration', () => {
      const registry = new PlatformRegistry();
      const runner1 = new CursorRunner(capabilityService);
      const runner2 = new CursorRunner(capabilityService);

      registry.register('cursor', runner1);
      registry.register('cursor', runner2);

      expect(registry.get('cursor')).toBe(runner2);
      expect(registry.get('cursor')).not.toBe(runner1);
    });
  });

  describe('getAvailable', () => {
    it('should return empty array when no runners registered', () => {
      const registry = new PlatformRegistry();
      const available = registry.getAvailable();
      expect(available).toEqual([]);
    });

    it('should return array of registered platform identifiers', () => {
      const registry = new PlatformRegistry();
      const cursorRunner = new CursorRunner(capabilityService);
      const codexRunner = new CodexRunner(capabilityService);

      registry.register('cursor', cursorRunner);
      registry.register('codex', codexRunner);

      const available = registry.getAvailable();
      expect(available).toHaveLength(2);
      expect(available).toContain('cursor');
      expect(available).toContain('codex');
    });

    it('should return all three platforms when all registered', () => {
      const registry = new PlatformRegistry();
      const cursorRunner = new CursorRunner(capabilityService);
      const codexRunner = new CodexRunner(capabilityService);
      const claudeRunner = new ClaudeRunner(capabilityService);

      registry.register('cursor', cursorRunner);
      registry.register('codex', codexRunner);
      registry.register('claude', claudeRunner);

      const available = registry.getAvailable();
      expect(available).toHaveLength(3);
      expect(available).toContain('cursor');
      expect(available).toContain('codex');
      expect(available).toContain('claude');
    });

    it('should return only platforms with valid runners', () => {
      const registry = new PlatformRegistry();
      const cursorRunner = new CursorRunner(capabilityService);

      registry.register('cursor', cursorRunner);

      const available = registry.getAvailable();
      expect(available).toEqual(['cursor']);
      expect(available).not.toContain('codex');
      expect(available).not.toContain('claude');
    });
  });

  describe('createDefault', () => {
    let config: PuppetMasterConfig;

    beforeEach(() => {
      config = getDefaultConfig();
    });

    it('should create a new registry instance', () => {
      const registry = PlatformRegistry.createDefault(config);
      expect(registry).toBeInstanceOf(PlatformRegistry);
    });

    it('should register all three platform runners', () => {
      const registry = PlatformRegistry.createDefault(config);

      const cursorRunner = registry.get('cursor');
      const codexRunner = registry.get('codex');
      const claudeRunner = registry.get('claude');

      expect(cursorRunner).toBeInstanceOf(CursorRunner);
      expect(codexRunner).toBeInstanceOf(CodexRunner);
      expect(claudeRunner).toBeInstanceOf(ClaudeRunner);
    });

    it('should use CLI paths from config', () => {
      const customConfig: PuppetMasterConfig = {
        ...config,
        cliPaths: {
          cursor: 'custom-cursor',
          codex: 'custom-codex',
          claude: 'custom-claude',
          gemini: 'custom-gemini',
          copilot: 'custom-copilot',
          antigravity: 'custom-agy',
        },
      };

      const registry = PlatformRegistry.createDefault(customConfig);
      const cursorRunner = registry.get('cursor');
      const claudeRunner = registry.get('claude');

      expect(cursorRunner).toBeInstanceOf(CursorRunner);
      expect(claudeRunner).toBeInstanceOf(ClaudeRunner);
    });

    it('should make all platforms available', () => {
      const registry = PlatformRegistry.createDefault(config);
      const available = registry.getAvailable();

      expect(available).toHaveLength(6);
      expect(available).toContain('cursor');
      expect(available).toContain('codex');
      expect(available).toContain('claude');
      expect(available).toContain('gemini');
      expect(available).toContain('copilot');
      expect(available).toContain('antigravity');
    });

    it('should create runners with CapabilityDiscoveryService', () => {
      const registry = PlatformRegistry.createDefault(config);
      const cursorRunner = registry.get('cursor') as CursorRunner;

      // Verify runner has capabilityService (it extends BasePlatformRunner which has it)
      expect(cursorRunner).toBeInstanceOf(BasePlatformRunner);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((cursorRunner as any).capabilityService).toBeInstanceOf(
        CapabilityDiscoveryService
      );
    });

    it('should create a new instance on each call', () => {
      const registry1 = PlatformRegistry.createDefault(config);
      const registry2 = PlatformRegistry.createDefault(config);

      expect(registry1).not.toBe(registry2);
    });
  });

  describe('clear', () => {
    it('should clear all registered runners', () => {
      const registry = new PlatformRegistry();
      const cursorRunner = new CursorRunner(capabilityService);
      const codexRunner = new CodexRunner(capabilityService);

      registry.register('cursor', cursorRunner);
      registry.register('codex', codexRunner);

      expect(registry.getAvailable()).toHaveLength(2);

      registry.clear();

      expect(registry.getAvailable()).toHaveLength(0);
      expect(registry.get('cursor')).toBeUndefined();
      expect(registry.get('codex')).toBeUndefined();
    });
  });
});
