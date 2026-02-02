/**
 * RWM-Specific Audit Tests
 * 
 * Tests for RWM-specific wiring auditor.
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T22.
 */

import { describe, it, expect, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { auditRWMWiring, runFullAudit } from './rwm-specific-audit.js';

vi.mock('./wiring-audit.js', () => ({
  WiringAuditor: class {
    constructor(private config: Record<string, unknown>) {}
    async audit() {
      return {
        issues: [],
        summary: {
          totalExports: 0,
          orphanExports: 0,
          totalRegistrations: 0,
          unusedRegistrations: 0,
          totalInjections: 0,
          missingInjections: 0,
          totalImports: 0,
          deadImports: 0,
          eventMismatches: 0,
          verifierGaps: 0,
        },
        passed: true,
        durationMs: 1,
        timestamp: new Date().toISOString(),
        config: this.config,
      };
    }
  },
  createDefaultConfig: (projectRoot: string) => ({
    rootDir: projectRoot,
    include: ['src/**/*.ts'],
    exclude: ['**/*.test.ts'],
    entryPoints: [],
    containerFile: 'src/core/container.ts',
  }),
}));

describe('auditRWMWiring', () => {
  const projectRoot = process.cwd();

  describe('basic functionality', () => {
    it('should return valid audit result structure', async () => {
      const result = await auditRWMWiring(projectRoot);

      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('durationMs');
      expect(result).toHaveProperty('timestamp');

      expect(Array.isArray(result.issues)).toBe(true);
      expect(typeof result.passed).toBe('boolean');
    });

    it('should complete within reasonable time', async () => {
      const result = await auditRWMWiring(projectRoot);
      
      // Should complete in under 30 seconds
      expect(result.durationMs).toBeLessThan(30000);
    });
  });

  describe('git infrastructure check', () => {
    it('should check for git infrastructure wiring', async () => {
      const result = await auditRWMWiring(projectRoot);
      
      // The check should run without errors
      expect(result).toBeDefined();
      
      // Git infrastructure issues should be warnings (optional feature)
      const gitIssues = result.issues.filter((i) => 
        i.location.symbol.includes('branchStrategy') ||
        i.location.symbol.includes('commitFormatter') ||
        i.location.symbol.includes('prManager') ||
        i.location.symbol.includes('gitManager')
      );

      // All git infrastructure issues should be warnings, not errors
      for (const issue of gitIssues) {
        expect(issue.severity).toBe('warning');
      }
    });
  });

  describe('verifier registration check', () => {
    it('should check all criterion types have verifiers', async () => {
      const result = await auditRWMWiring(projectRoot);
      
      // Check for verifier gap issues
      const verifierGaps = result.issues.filter((i) => 
        i.type === 'unresolved_dependency' &&
        i.description.includes('verifier')
      );

      // In a properly configured system, there should be no verifier gaps
      // If there are, they should be errors
      for (const gap of verifierGaps) {
        expect(gap.severity).toBe('error');
      }
    });

    it('should recognize all canonical criterion types', async () => {
      // Read the tiers file to get canonical types
      const tiersPath = path.join(projectRoot, 'src/types/tiers.ts');
      
      if (fs.existsSync(tiersPath)) {
        const tiersSource = fs.readFileSync(tiersPath, 'utf8');
        
        // Extract criterion types
        const match = tiersSource.match(/export\s+type\s+CriterionType\s*=\s*([^;]+)/);
        expect(match).not.toBeNull();
        
        if (match) {
          const typeString = match[1];
          const types = typeString.match(/'([^']+)'/g)?.map((t) => t.replace(/'/g, '')) ?? [];
          
          // Should have expected criterion types
          expect(types).toContain('regex');
          expect(types).toContain('file_exists');
          expect(types).toContain('command');
          expect(types).toContain('browser_verify');
          expect(types).toContain('ai');
        }
      }
    });
  });

  describe('event consistency check', () => {
    it('should check event names between backend and frontend', async () => {
      const result = await auditRWMWiring(projectRoot);
      
      // Event mismatch issues should be warnings
      const eventIssues = result.issues.filter((i) => i.type === 'event_mismatch');
      
      for (const issue of eventIssues) {
        expect(issue.severity).toBe('warning');
      }
    });

    it('should extract events from event bus', async () => {
      const eventBusPath = path.join(projectRoot, 'src/logging/event-bus.ts');
      
      if (fs.existsSync(eventBusPath)) {
        const source = fs.readFileSync(eventBusPath, 'utf8');
        
        // Should find event type definitions
        const eventTypes = source.match(/type:\s*['"]([^'"]+)['"]/g);
        expect(eventTypes).not.toBeNull();
        expect(eventTypes!.length).toBeGreaterThan(0);
      }
    });
  });

  describe('config overrides', () => {
    it('should accept custom config paths', async () => {
      const result = await auditRWMWiring(projectRoot, {
        orchestratorFile: 'src/core/orchestrator.ts',
        containerFile: 'src/core/container.ts',
      });

      expect(result).toBeDefined();
      expect(result.issues).toBeDefined();
    });

    it('should handle missing files gracefully', async () => {
      const result = await auditRWMWiring(projectRoot, {
        orchestratorFile: 'nonexistent/file.ts',
      });

      // Should not crash, should report issue
      expect(result).toBeDefined();
      
      const fileNotFoundIssues = result.issues.filter((i) => 
        i.description.includes('not found')
      );
      expect(fileNotFoundIssues.length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('runFullAudit', () => {
  const projectRoot = process.cwd();

  it('should return combined results', async () => {
    const results = await runFullAudit(projectRoot);

    expect(results).toHaveProperty('generic');
    expect(results).toHaveProperty('rwmSpecific');
    expect(results).toHaveProperty('combined');
    
    expect(results.rwmSpecific).toBeDefined();
    expect(results.combined).toBeDefined();
    expect(results.combined.issues).toBeDefined();
  });

  it('should combine issues from both audits', async () => {
    const results = await runFullAudit(projectRoot);
    
    const genericCount = results.generic?.issues.length ?? 0;
    const rwmCount = results.rwmSpecific.issues.length;
    const combinedCount = results.combined.issues.length;
    
    // Combined should have all issues
    expect(combinedCount).toBe(genericCount + rwmCount);
  });

  it('should compute combined summary', async () => {
    const results = await runFullAudit(projectRoot);
    const summary = results.combined.summary;
    
    expect(summary).toHaveProperty('totalExports');
    expect(summary).toHaveProperty('orphanExports');
    expect(summary).toHaveProperty('totalRegistrations');
    expect(summary).toHaveProperty('unusedRegistrations');
    expect(summary).toHaveProperty('eventMismatches');
    expect(summary).toHaveProperty('verifierGaps');
  });
});
