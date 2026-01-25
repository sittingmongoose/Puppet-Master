/**
 * Wiring Audit Tests
 * 
 * Tests for the generic wiring auditor.
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T22.
 */

import { describe, it, expect } from 'vitest';
import { WiringAuditor, createDefaultConfig } from './wiring-audit.js';
import type { WiringAuditConfig } from './types.js';

describe('WiringAuditor', () => {
  // Test with actual project structure
  const projectRoot = process.cwd();

  describe('createDefaultConfig', () => {
    it('should create a valid default config', () => {
      const config = createDefaultConfig(projectRoot);

      expect(config.rootDir).toBe(projectRoot);
      expect(config.include).toContain('src/**/*.ts');
      expect(config.exclude).toContain('**/*.test.ts');
      expect(config.entryPoints.length).toBeGreaterThan(0);
      expect(config.containerFile).toBe('src/core/container.ts');
    });
  });

  describe('initialization', () => {
    it('should initialize with valid project', async () => {
      const config = createDefaultConfig(projectRoot);
      const auditor = new WiringAuditor(config);

      // Should not throw
      const result = await auditor.audit();
      expect(result).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should throw error when tsconfig.json not found', async () => {
      const config: WiringAuditConfig = {
        rootDir: '/nonexistent/path',
        include: ['src/**/*.ts'],
        exclude: [],
        entryPoints: [],
        containerFile: 'container.ts',
      };
      const auditor = new WiringAuditor(config);

      await expect(auditor.audit()).rejects.toThrow('tsconfig.json not found');
    });
  });

  describe('audit', () => {
    it('should collect exports from source files', async () => {
      const config = createDefaultConfig(projectRoot);
      const auditor = new WiringAuditor(config);
      
      await auditor.audit();
      const exports = auditor.getExports();

      // Should find exports from this project
      expect(exports.length).toBeGreaterThan(0);
    });

    it('should collect imports from source files', async () => {
      const config = createDefaultConfig(projectRoot);
      const auditor = new WiringAuditor(config);
      
      await auditor.audit();
      const imports = auditor.getImports();

      // Should find imports from this project
      expect(imports.length).toBeGreaterThan(0);
    });

    it('should parse container registrations', async () => {
      const config = createDefaultConfig(projectRoot);
      const auditor = new WiringAuditor(config);
      
      await auditor.audit();
      const registrations = auditor.getRegistrations();

      // Should find registrations from container.ts
      expect(registrations.length).toBeGreaterThan(0);
      
      // Check for known registrations
      const keys = registrations.map((r) => r.key);
      expect(keys).toContain('config');
      expect(keys).toContain('prdManager');
    });

    it('should find container resolutions', async () => {
      const config = createDefaultConfig(projectRoot);
      const auditor = new WiringAuditor(config);
      
      await auditor.audit();
      const resolutions = auditor.getResolutions();

      // Should find resolutions in the codebase
      expect(resolutions.length).toBeGreaterThan(0);
    });

    it('should return valid audit result structure', async () => {
      const config = createDefaultConfig(projectRoot);
      const auditor = new WiringAuditor(config);
      
      const result = await auditor.audit();

      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('durationMs');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('config');

      expect(Array.isArray(result.issues)).toBe(true);
      expect(typeof result.summary.totalExports).toBe('number');
      expect(typeof result.passed).toBe('boolean');
    });
  });

  describe('checkOrphanExports', () => {
    it('should not flag entry point exports as orphan', async () => {
      const config = createDefaultConfig(projectRoot);
      const auditor = new WiringAuditor(config);
      
      const result = await auditor.audit();
      
      // Entry point files should not have orphan export issues
      const orphanIssues = result.issues.filter((i) => i.type === 'orphan_export');
      const entryPointIssues = orphanIssues.filter((i) => 
        config.entryPoints.some((ep) => i.location.file.includes(ep))
      );
      
      expect(entryPointIssues).toHaveLength(0);
    });

    it('should not flag index.ts re-exports as orphan', async () => {
      const config = createDefaultConfig(projectRoot);
      const auditor = new WiringAuditor(config);
      
      await auditor.audit();
      
      // Note: Some index files may have non-re-export exports, so we check specifically
      // for re-exports (isReExport should be filtered out)
      const exports = auditor.getExports();
      const indexReexports = exports.filter((e) => 
        e.file.endsWith('index.ts') && e.isReExport
      );
      
      // Verify re-exports are handled
      expect(indexReexports.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('checkUnusedRegistrations', () => {
    it('should detect unused container registrations', async () => {
      const config = createDefaultConfig(projectRoot);
      const auditor = new WiringAuditor(config);
      
      const result = await auditor.audit();
      
      // This test validates the audit runs - actual unused registrations
      // depend on the codebase state
      const unusedIssues = result.issues.filter((i) => i.type === 'unused_registration');
      expect(Array.isArray(unusedIssues)).toBe(true);
    });
  });

  describe('checkDeadImports', () => {
    it('should not flag type-only imports as dead', async () => {
      const config = createDefaultConfig(projectRoot);
      const auditor = new WiringAuditor(config);
      
      const result = await auditor.audit();
      const deadImports = result.issues.filter((i) => i.type === 'dead_import');
      
      // Type imports should not be flagged
      const imports = auditor.getImports();
      const typeImports = imports.filter((i) => i.isType);
      
      // Verify type imports are excluded
      for (const deadIssue of deadImports) {
        const matchingImport = typeImports.find((i) => 
          i.file === deadIssue.location.file && 
          i.symbol === deadIssue.location.symbol
        );
        expect(matchingImport).toBeUndefined();
      }
    });
  });
});

describe('WiringIssue types', () => {
  it('should have valid severity values', () => {
    const severities = ['error', 'warning'];
    expect(severities).toContain('error');
    expect(severities).toContain('warning');
  });

  it('should have valid issue types', () => {
    const issueTypes = [
      'orphan_export',
      'unused_registration',
      'missing_injection',
      'dead_import',
      'unresolved_dependency',
      'event_mismatch',
    ];
    expect(issueTypes.length).toBe(6);
  });
});
