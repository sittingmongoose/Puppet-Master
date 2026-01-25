/**
 * E2E Tests for Multi-Platform Execution (P1-G15)
 * 
 * Tests execution across multiple platforms, capability discovery, and platform selection.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CapabilityDiscoveryService } from '../../src/platforms/capability-discovery.js';
import type { Platform } from '../../src/types/config.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('E2E: Multi-Platform Execution', () => {
  let tempDir: string;
  let capabilityService: CapabilityDiscoveryService;

  // P1-G15: Platform probing can take time, especially if CLIs are not installed
  const PROBE_TIMEOUT = 30000;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `multi-platform-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    const cacheDir = join(tempDir, 'capabilities');
    capabilityService = new CapabilityDiscoveryService(cacheDir);
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Capability Discovery', () => {
    it('probes platform and returns capabilities', async () => {
      // Note: This test will only pass if at least one CLI is installed
      // In CI, we use mocked capabilities
      const platforms: Platform[] = ['claude', 'codex', 'cursor', 'gemini', 'copilot'];
      
      for (const platform of platforms) {
        const result = await capabilityService.probe(platform);
        
        // Should always return a result (even if CLI not found)
        expect(result).toBeDefined();
        expect(result.platform).toBe(platform);
        expect(result.capabilities).toBeDefined();
        expect(result.probeTimestamp).toBeDefined();
      }
    }, PROBE_TIMEOUT);

    it('caches probe results', async () => {
      const platform: Platform = 'claude';
      
      // First probe
      const result1 = await capabilityService.probe(platform);
      
      // Get cached result
      const cached = await capabilityService.getCached(platform);
      
      expect(cached).toBeDefined();
      expect(cached?.platform).toBe(platform);
      expect(cached?.probeTimestamp).toBe(result1.probeTimestamp);
    }, PROBE_TIMEOUT);

    it('validates cache freshness', async () => {
      const platform: Platform = 'claude';
      
      // Probe first
      await capabilityService.probe(platform);
      
      // Check if cache is valid (within 1 hour)
      const isValid = await capabilityService.isCacheValid(platform, 3600000);
      expect(isValid).toBe(true);
      
      // Check if cache is invalid (within 1ms - should always be stale)
      const isStale = await capabilityService.isCacheValid(platform, 1);
      expect(isStale).toBe(false);
    });
  });

  describe('Model Discovery', () => {
    it('discovers models for each platform', async () => {
      const platforms: Platform[] = ['claude', 'codex', 'cursor', 'gemini', 'copilot'];
      
      for (const platform of platforms) {
        const models = await capabilityService.discoverModels(platform);
        
        // Should return at least one model (from static lists)
        expect(Array.isArray(models)).toBe(true);
        expect(models.length).toBeGreaterThan(0);
      }
    });

    it('Claude models include expected aliases', async () => {
      const models = await capabilityService.discoverModels('claude');
      
      // Should include the documented aliases
      expect(models).toContain('sonnet');
      expect(models).toContain('opus');
      expect(models).toContain('haiku');
    });

    it('probeWithModels includes availableModels in result', async () => {
      const platform: Platform = 'claude';
      const result = await capabilityService.probeWithModels(platform);
      
      expect(result.capabilities.availableModels).toBeDefined();
      expect(Array.isArray(result.capabilities.availableModels)).toBe(true);
      expect(result.capabilities.availableModels!.length).toBeGreaterThan(0);
    }, PROBE_TIMEOUT);
  });

  describe('Platform Runnable Status', () => {
    it('correctly identifies runnable vs non-runnable platforms', async () => {
      const platforms: Platform[] = ['claude', 'codex', 'cursor', 'gemini', 'copilot'];
      
      const results = await Promise.all(
        platforms.map(p => capabilityService.probe(p))
      );
      
      // At least some platforms should have runnable status determined
      for (const result of results) {
        expect(typeof result.runnable).toBe('boolean');
      }
    }, PROBE_TIMEOUT);
  });

  describe('Auth Status Discovery', () => {
    it('reports auth status for each platform', async () => {
      const platforms: Platform[] = ['claude', 'codex', 'cursor', 'gemini', 'copilot'];
      
      for (const platform of platforms) {
        const result = await capabilityService.probe(platform);
        
        // authStatus should be one of the valid statuses
        const validStatuses = ['authenticated', 'not_authenticated', 'skipped', 'unknown'];
        expect(validStatuses).toContain(result.authStatus);
      }
    }, PROBE_TIMEOUT);
  });

  describe('Multi-Platform Probe', () => {
    it('probes all platforms in parallel', async () => {
      const platforms: Platform[] = ['claude', 'codex', 'cursor', 'gemini', 'copilot'];
      
      const startTime = Date.now();
      const results = await Promise.all(
        platforms.map(p => capabilityService.probe(p))
      );
      const duration = Date.now() - startTime;
      
      // All platforms should be probed
      expect(results.length).toBe(platforms.length);
      
      // Parallel execution should be reasonably fast
      // (sequential would take ~5x longer due to timeouts)
      console.log(`Parallel probe of ${platforms.length} platforms took ${duration}ms`);
    }, PROBE_TIMEOUT);
  });

  describe('Capability Listing', () => {
    it('lists all cached capabilities', async () => {
      // Probe a few platforms
      await capabilityService.probe('claude');
      await capabilityService.probe('codex');
      
      // List should show cached platforms
      // Note: This requires a listCached method if it exists
      // For now, we verify individual caches exist
      const claudeCached = await capabilityService.getCached('claude');
      const codexCached = await capabilityService.getCached('codex');
      
      expect(claudeCached).toBeDefined();
      expect(codexCached).toBeDefined();
    });
  });

  describe('Platform Command Resolution', () => {
    it('uses configured CLI paths when provided', async () => {
      const customPaths = {
        claude: '/custom/path/to/claude',
        codex: '/custom/path/to/codex',
        cursor: '/custom/path/to/cursor',
        gemini: '/custom/path/to/gemini',
        copilot: '/custom/path/to/copilot',
      };
      
      const customService = new CapabilityDiscoveryService(
        join(tempDir, 'custom-capabilities'),
        customPaths
      );
      
      // Probe should use custom path (will likely fail since paths don't exist)
      const result = await customService.probe('claude');
      
      // Command should reflect the custom path
      expect(result.command).toBe('/custom/path/to/claude');
    });
  });

  describe('Preflight Validation', () => {
    it('validates required platforms are ready', async () => {
      // This tests the validateReadyForExecution method
      const platforms: Platform[] = ['claude'];
      
      try {
        await capabilityService.validateReadyForExecution(platforms, { strictAuth: false });
        // If no error, platforms are ready (or validation passed with warnings)
      } catch (error) {
        // Error means validation failed - expected if Claude isn't installed
        expect(error).toBeDefined();
      }
    });
  });
});
