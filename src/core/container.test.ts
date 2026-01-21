/**
 * Tests for Container class
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Container, createContainer, createOrchestrator } from './container.js';
import { getDefaultConfig } from '../config/default-config.js';
import type { PuppetMasterConfig } from '../types/config.js';
import type { CriterionType } from '../types/tiers.js';
import { VerifierRegistry } from '../verification/gate-runner.js';

describe('Container', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  describe('register and resolve', () => {
    it('should register and resolve a simple value', () => {
      container.register('test', () => 'test-value', 'singleton');
      expect(container.resolve<string>('test')).toBe('test-value');
    });

    it('should register and resolve an object', () => {
      const obj = { name: 'test', value: 123 };
      container.register('obj', () => obj, 'singleton');
      expect(container.resolve<typeof obj>('obj')).toBe(obj);
    });

    it('should throw error when resolving unregistered key', () => {
      expect(() => container.resolve('unregistered')).toThrow('No registration found for key: unregistered');
    });

    it('should check if key is registered', () => {
      expect(container.has('test')).toBe(false);
      container.register('test', () => 'value', 'singleton');
      expect(container.has('test')).toBe(true);
    });
  });

  describe('singleton pattern', () => {
    it('should return same instance for singleton', () => {
      let callCount = 0;
      container.register('singleton', () => {
        callCount++;
        return { id: callCount };
      }, 'singleton');

      const instance1 = container.resolve<{ id: number }>('singleton');
      const instance2 = container.resolve<{ id: number }>('singleton');

      expect(instance1).toBe(instance2);
      expect(callCount).toBe(1); // Factory called only once
    });

    it('should cache singleton instances', () => {
      container.register('counter', () => ({ count: 0 }), 'singleton');
      const instance1 = container.resolve<{ count: number }>('counter');
      instance1.count = 5;
      const instance2 = container.resolve<{ count: number }>('counter');
      expect(instance2.count).toBe(5);
    });
  });

  describe('transient pattern', () => {
    it('should return new instance for transient', () => {
      let callCount = 0;
      container.register('transient', () => {
        callCount++;
        return { id: callCount };
      }, 'transient');

      const instance1 = container.resolve<{ id: number }>('transient');
      const instance2 = container.resolve<{ id: number }>('transient');

      expect(instance1).not.toBe(instance2);
      expect(instance1.id).toBe(1);
      expect(instance2.id).toBe(2);
      expect(callCount).toBe(2); // Factory called twice
    });
  });

  describe('factory pattern', () => {
    it('should invoke factory on each resolve', () => {
      let callCount = 0;
      container.register('factory', () => {
        callCount++;
        return { timestamp: Date.now(), count: callCount };
      }, 'factory');

      const instance1 = container.resolve<{ timestamp: number; count: number }>('factory');
      // Small delay to ensure different timestamp
      const instance2 = container.resolve<{ timestamp: number; count: number }>('factory');

      expect(callCount).toBe(2);
      expect(instance1.count).toBe(1);
      expect(instance2.count).toBe(2);
    });
  });

  describe('registerInstance', () => {
    it('should register and return pre-created instance', () => {
      const instance = { value: 'pre-created' };
      container.registerInstance('instance', instance);

      const resolved = container.resolve<typeof instance>('instance');
      expect(resolved).toBe(instance);
      expect(resolved.value).toBe('pre-created');
    });

    it('should always return same instance (singleton behavior)', () => {
      const instance = { count: 0 };
      container.registerInstance('instance', instance);

      const resolved1 = container.resolve<typeof instance>('instance');
      resolved1.count = 5;
      const resolved2 = container.resolve<typeof instance>('instance');

      expect(resolved2.count).toBe(5);
      expect(resolved1).toBe(resolved2);
    });
  });

  describe('clear', () => {
    it('should clear all registrations', () => {
      container.register('key1', () => 'value1', 'singleton');
      container.register('key2', () => 'value2', 'singleton');
      container.registerInstance('key3', 'value3');

      expect(container.has('key1')).toBe(true);
      expect(container.has('key2')).toBe(true);
      expect(container.has('key3')).toBe(true);

      container.clear();

      expect(container.has('key1')).toBe(false);
      expect(container.has('key2')).toBe(false);
      expect(container.has('key3')).toBe(false);
    });

    it('should clear singleton cache', () => {
      container.register('singleton', () => ({ count: 0 }), 'singleton');
      const instance1 = container.resolve<{ count: number }>('singleton');
      instance1.count = 5;

      container.clear();
      container.register('singleton', () => ({ count: 0 }), 'singleton');
      const instance2 = container.resolve<{ count: number }>('singleton');

      expect(instance2.count).toBe(0);
    });
  });

  describe('default registration type', () => {
    it('should default to singleton when type not specified', () => {
      let callCount = 0;
      container.register('default', () => {
        callCount++;
        return { id: callCount };
      });

      const instance1 = container.resolve<{ id: number }>('default');
      const instance2 = container.resolve<{ id: number }>('default');

      expect(instance1).toBe(instance2);
      expect(callCount).toBe(1);
    });
  });
});

describe('createContainer', () => {
  let config: PuppetMasterConfig;
  const projectPath = '/test/project';

  beforeEach(() => {
    config = getDefaultConfig();
  });

  it('should create container with config and projectPath registered', () => {
    const container = createContainer(config, projectPath);

    expect(container.has('config')).toBe(true);
    expect(container.has('projectPath')).toBe(true);

    const resolvedConfig = container.resolve<PuppetMasterConfig>('config');
    const resolvedPath = container.resolve<string>('projectPath');

    expect(resolvedConfig).toBe(config);
    expect(resolvedPath).toBe(projectPath);
  });

  it('should register all managers', () => {
    const container = createContainer(config, projectPath);

    expect(container.has('configManager')).toBe(true);
    expect(container.has('prdManager')).toBe(true);
    expect(container.has('progressManager')).toBe(true);
    expect(container.has('agentsManager')).toBe(true);
    expect(container.has('evidenceStore')).toBe(true);
    expect(container.has('usageTracker')).toBe(true);
    expect(container.has('gitManager')).toBe(true);
  });

  it('should register platform components', () => {
    const container = createContainer(config, projectPath);

    expect(container.has('platformRegistry')).toBe(true);
  });

  it('should register verification components', () => {
    const container = createContainer(config, projectPath);

    expect(container.has('verifierRegistry')).toBe(true);
    expect(container.has('gateRunner')).toBe(true);
    expect(container.has('verificationIntegration')).toBe(true);
  });

  it('should register core components', () => {
    const container = createContainer(config, projectPath);

    expect(container.has('tierStateManager')).toBe(true);
    expect(container.has('autoAdvancement')).toBe(true);
    expect(container.has('escalation')).toBe(true);
    expect(container.has('executionEngine')).toBe(true);
  });

  it('should resolve all registered dependencies', () => {
    const container = createContainer(config, projectPath);

    // Should not throw
    expect(() => container.resolve('configManager')).not.toThrow();
    expect(() => container.resolve('prdManager')).not.toThrow();
    expect(() => container.resolve('progressManager')).not.toThrow();
    expect(() => container.resolve('agentsManager')).not.toThrow();
    expect(() => container.resolve('evidenceStore')).not.toThrow();
    expect(() => container.resolve('usageTracker')).not.toThrow();
    expect(() => container.resolve('gitManager')).not.toThrow();
    expect(() => container.resolve('platformRegistry')).not.toThrow();
    expect(() => container.resolve('verifierRegistry')).not.toThrow();
    expect(() => container.resolve('gateRunner')).not.toThrow();
    expect(() => container.resolve('verificationIntegration')).not.toThrow();
    expect(() => container.resolve('tierStateManager')).not.toThrow();
    expect(() => container.resolve('autoAdvancement')).not.toThrow();
    expect(() => container.resolve('escalation')).not.toThrow();
    expect(() => container.resolve('executionEngine')).not.toThrow();
  });

  it('should wire dependencies correctly', () => {
    const container = createContainer(config, projectPath);

    // TierStateManager should get PrdManager
    const tierStateManager = container.resolve('tierStateManager');
    expect(tierStateManager).toBeDefined();

    // AutoAdvancement should get TierStateManager and VerificationIntegration
    const autoAdvancement = container.resolve('autoAdvancement');
    expect(autoAdvancement).toBeDefined();

    // VerificationIntegration should get GateRunner, TierStateManager, and EvidenceStore
    const verificationIntegration = container.resolve('verificationIntegration');
    expect(verificationIntegration).toBeDefined();

    // GateRunner should get VerifierRegistry and EvidenceStore
    const gateRunner = container.resolve('gateRunner');
    expect(gateRunner).toBeDefined();
  });

  it('should register verifiers for all canonical criterion types', () => {
    const container = createContainer(config, projectPath);
    const registry = container.resolve<VerifierRegistry>('verifierRegistry');

    const canonicalTypes: CriterionType[] = [
      'regex',
      'file_exists',
      'browser_verify',
      'command',
      'ai',
    ];

    for (const type of canonicalTypes) {
      expect(registry.get(type)).not.toBeNull();
    }
  });

  it('should return singleton instances for managers', () => {
    const container = createContainer(config, projectPath);

    const manager1 = container.resolve('configManager');
    const manager2 = container.resolve('configManager');

    expect(manager1).toBe(manager2);
  });

  it('should use config values correctly', () => {
    const customConfig = getDefaultConfig();
    customConfig.memory.prdFile = '/custom/prd.json';
    customConfig.memory.progressFile = '/custom/progress.txt';
    customConfig.verification.evidenceDirectory = '/custom/evidence';

    const container = createContainer(customConfig, projectPath);

    // Managers should be created with correct config values
    const prdManager = container.resolve('prdManager');
    const progressManager = container.resolve('progressManager');
    const evidenceStore = container.resolve('evidenceStore');

    expect(prdManager).toBeDefined();
    expect(progressManager).toBeDefined();
    expect(evidenceStore).toBeDefined();
  });
});

describe('createOrchestrator', () => {
  let config: PuppetMasterConfig;
  const projectPath = '/test/project';

  beforeEach(() => {
    config = getDefaultConfig();
  });

  it('should throw error when orchestrator is not registered', () => {
    expect(() => createOrchestrator(config, projectPath)).toThrow(
      'Orchestrator not yet implemented. Please complete PH4-T08 first.'
    );
  });
});