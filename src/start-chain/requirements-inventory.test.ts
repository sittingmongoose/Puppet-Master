/**
 * Tests for RequirementsInventoryBuilder
 *
 * See P1-T20: Start Chain - Requirements Inventory (Atomic REQ Units)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RequirementsInventoryBuilder } from './requirements-inventory.js';
import type { ParsedRequirements, ParsedSection } from '../types/requirements.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Mock fs for ID map persistence tests
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    promises: {
      ...((actual as { promises: object }).promises),
      readFile: vi.fn(),
      writeFile: vi.fn(),
      mkdir: vi.fn(),
    },
  };
});

describe('RequirementsInventoryBuilder', () => {
  let builder: RequirementsInventoryBuilder;
  let testProjectPath: string;

  beforeEach(() => {
    builder = new RequirementsInventoryBuilder();
    testProjectPath = join(tmpdir(), 'test-project');
    vi.clearAllMocks();
    
    // Default mock for fs operations
    vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('extractHeuristicCandidates', () => {
    it('should extract bullet points', () => {
      const parsed = createParsedRequirements({
        sections: [
          createSection('Requirements', '- Must support authentication\n- Should allow logout\n- Could have MFA', 1),
        ],
      });

      const candidates = builder.extractHeuristicCandidates(parsed);

      expect(candidates.length).toBeGreaterThanOrEqual(3);
      expect(candidates.some(c => c.text.includes('authentication'))).toBe(true);
      expect(candidates.some(c => c.sourceType === 'bullet')).toBe(true);
    });

    it('should extract numbered lists', () => {
      const parsed = createParsedRequirements({
        sections: [
          createSection('Steps', '1. User must enter username\n2. System should validate input\n3. Display confirmation', 1),
        ],
      });

      const candidates = builder.extractHeuristicCandidates(parsed);

      expect(candidates.length).toBeGreaterThanOrEqual(2);
      expect(candidates.some(c => c.sourceType === 'numbered')).toBe(true);
    });

    it('should extract prose with requirement keywords', () => {
      const parsed = createParsedRequirements({
        sections: [
          createSection('Overview', 'The system must handle concurrent requests. Performance should be optimized for large datasets.', 1),
        ],
      });

      const candidates = builder.extractHeuristicCandidates(parsed);

      expect(candidates.some(c => c.sourceType === 'prose')).toBe(true);
      expect(candidates.some(c => c.text.includes('concurrent'))).toBe(true);
    });

    it('should extract table rows with requirement keywords', () => {
      const parsed = createParsedRequirements({
        sections: [
          createSection('Feature Matrix', '| Feature | Requirement |\n|---|---|\n| Auth | Must support OAuth |', 1),
        ],
      });

      const candidates = builder.extractHeuristicCandidates(parsed);

      expect(candidates.some(c => c.sourceType === 'table')).toBe(true);
    });

    it('should detect severity from keywords', () => {
      const parsed = createParsedRequirements({
        sections: [
          createSection('Requirements', '- Must be secure\n- Should be fast\n- Could be pretty', 1),
        ],
      });

      const candidates = builder.extractHeuristicCandidates(parsed);

      const mustCandidate = candidates.find(c => c.text.includes('secure'));
      const shouldCandidate = candidates.find(c => c.text.includes('fast'));
      const couldCandidate = candidates.find(c => c.text.includes('pretty'));

      expect(mustCandidate?.detectedSeverity).toBe('must');
      expect(shouldCandidate?.detectedSeverity).toBe('should');
      expect(couldCandidate?.detectedSeverity).toBe('could');
    });

    it('should extract from nested sections', () => {
      const childSection = createSection('Details', '- Must validate email format', 2);
      const parentSection = createSection('User Input', '- Should sanitize input', 1, [childSection]);

      const parsed = createParsedRequirements({
        sections: [parentSection],
      });

      const candidates = builder.extractHeuristicCandidates(parsed);

      expect(candidates.some(c => c.sectionPath.includes('User Input'))).toBe(true);
      expect(candidates.some(c => c.sectionPath.includes('Details'))).toBe(true);
    });

    it('should include extractedGoals and extractedConstraints', () => {
      const parsed = createParsedRequirements({
        sections: [],
        extractedGoals: ['Build a scalable API'],
        extractedConstraints: ['Must use TypeScript'],
      });

      const candidates = builder.extractHeuristicCandidates(parsed);

      expect(candidates.some(c => c.sectionPath === 'Goals')).toBe(true);
      expect(candidates.some(c => c.sectionPath === 'Constraints')).toBe(true);
    });
  });

  describe('computeExcerptHash', () => {
    it('should produce deterministic hashes', () => {
      const hash1 = builder.computeExcerptHash('Must support authentication');
      const hash2 = builder.computeExcerptHash('Must support authentication');

      expect(hash1).toBe(hash2);
    });

    it('should normalize whitespace', () => {
      const hash1 = builder.computeExcerptHash('Must   support  authentication');
      const hash2 = builder.computeExcerptHash('Must support authentication');

      expect(hash1).toBe(hash2);
    });

    it('should normalize case', () => {
      const hash1 = builder.computeExcerptHash('MUST SUPPORT AUTHENTICATION');
      const hash2 = builder.computeExcerptHash('must support authentication');

      expect(hash1).toBe(hash2);
    });

    it('should produce 16-character hex strings', () => {
      const hash = builder.computeExcerptHash('Any requirement text');

      expect(hash).toMatch(/^[0-9a-f]{16}$/);
    });
  });

  describe('getOrAssignId', () => {
    it('should assign new IDs sequentially', () => {
      const idMap = { version: '1.0.0', entries: {}, nextId: 1, updatedAt: '' };

      const id1 = builder.getOrAssignId('hash1', idMap);
      const id2 = builder.getOrAssignId('hash2', idMap);

      expect(id1).toBe('REQ-0001');
      expect(id2).toBe('REQ-0002');
      expect(idMap.nextId).toBe(3);
    });

    it('should reuse existing IDs for same hash', () => {
      const idMap = {
        version: '1.0.0',
        entries: { 'existinghash': 'REQ-0042' },
        nextId: 100,
        updatedAt: '',
      };

      const id = builder.getOrAssignId('existinghash', idMap);

      expect(id).toBe('REQ-0042');
      expect(idMap.nextId).toBe(100); // Should not increment
    });
  });

  describe('convertCandidatesToUnits', () => {
    it('should convert candidates to RequirementUnits', () => {
      const candidates = [
        {
          text: 'Must support OAuth 2.0',
          sectionPath: 'Auth > Requirements',
          sourceType: 'bullet' as const,
          detectedSeverity: 'must' as const,
        },
      ];
      const idMap = { version: '1.0.0', entries: {}, nextId: 1, updatedAt: '' };

      const units = builder.convertCandidatesToUnits(candidates, idMap);

      expect(units.length).toBe(1);
      expect(units[0].id).toBe('REQ-0001');
      expect(units[0].excerpt).toBe('Must support OAuth 2.0');
      expect(units[0].sectionPath).toBe('Auth > Requirements');
      expect(units[0].severity).toBe('must');
      expect(units[0].excerptHash).toBeTruthy();
    });

    it('should classify requirement kinds', () => {
      const candidates = [
        { text: 'Must implement login feature', sectionPath: 'Features', sourceType: 'bullet' as const },
        { text: 'Response time must be under 200ms', sectionPath: 'Performance', sourceType: 'bullet' as const },
        { text: 'Cannot use external APIs', sectionPath: 'Constraints', sourceType: 'bullet' as const },
        { text: 'Storage limits TBD', sectionPath: 'Open', sourceType: 'bullet' as const },
      ];
      const idMap = { version: '1.0.0', entries: {}, nextId: 1, updatedAt: '' };

      const units = builder.convertCandidatesToUnits(candidates, idMap);

      expect(units.find(u => u.excerpt.includes('login'))?.kind).toBe('functional');
      expect(units.find(u => u.excerpt.includes('Response time'))?.kind).toBe('nfr');
      expect(units.find(u => u.excerpt.includes('Cannot'))?.kind).toBe('constraint');
      expect(units.find(u => u.excerpt.includes('TBD'))?.kind).toBe('open_question');
    });
  });

  describe('build', () => {
    it('should build inventory from parsed requirements', async () => {
      const parsed = createParsedRequirements({
        sections: [
          createSection('Requirements', '- Must support authentication\n- Should allow logout', 1),
        ],
      });

      const result = await builder.build(parsed, testProjectPath, false);

      expect(result.inventory.units.length).toBeGreaterThanOrEqual(2);
      expect(result.inventory.stats.totalRequirements).toBeGreaterThanOrEqual(2);
      expect(result.inventory.metadata.schemaVersion).toBe('1.0.0');
      expect(result.aiRefined).toBe(false);
    });

    it('should warn on suspiciously low extraction', async () => {
      const parsed = createParsedRequirements({
        sections: [],
        rawText: 'A'.repeat(5000), // Large doc
      });

      const result = await builder.build(parsed, testProjectPath, false);

      expect(result.warnings.some(w => w.includes('No requirement candidates'))).toBe(true);
    });

    it('should maintain stable IDs across builds', async () => {
      const parsed = createParsedRequirements({
        sections: [
          createSection('Requirements', '- Must support authentication', 1),
        ],
      });

      // First build
      const result1 = await builder.build(parsed, testProjectPath, false);
      const hash = result1.inventory.units[0].excerptHash;
      const id1 = result1.inventory.units[0].id;

      // Mock ID map to simulate reload
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(result1.idMap));

      // Second build with same content
      const result2 = await builder.build(parsed, testProjectPath, false);
      const id2 = result2.inventory.units.find(u => u.excerptHash === hash)?.id;

      expect(id1).toBe(id2);
    });

    it('should compute correct stats', async () => {
      const parsed = createParsedRequirements({
        sections: [
          createSection('Security', '- Must encrypt data\n- Must validate input', 1),
          createSection('Performance', '- Should optimize queries', 1),
        ],
        extractedConstraints: ['Cannot use legacy APIs'],
      });

      const result = await builder.build(parsed, testProjectPath, false);
      const stats = result.inventory.stats;

      expect(stats.totalRequirements).toBeGreaterThanOrEqual(3);
      expect(stats.uniqueSections).toBeGreaterThanOrEqual(2);
      expect(stats.bySeverity.must).toBeGreaterThanOrEqual(2);
    });
  });

  describe('loadIdMap', () => {
    it('should load existing ID map', async () => {
      const existingMap = {
        version: '1.0.0',
        entries: { 'somehash': 'REQ-0001' },
        nextId: 2,
        updatedAt: '2024-01-01T00:00:00Z',
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(existingMap));

      const idMap = await builder.loadIdMap(testProjectPath);

      expect(idMap.entries['somehash']).toBe('REQ-0001');
      expect(idMap.nextId).toBe(2);
    });

    it('should create new ID map if file not found', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'));

      const idMap = await builder.loadIdMap(testProjectPath);

      expect(idMap.version).toBe('1.0.0');
      expect(idMap.entries).toEqual({});
      expect(idMap.nextId).toBe(1);
    });
  });
});

// Helper functions

function createParsedRequirements(overrides: Partial<ParsedRequirements>): ParsedRequirements {
  return {
    source: {
      path: '/test/requirements.md',
      format: 'markdown',
      size: 1000,
      lastModified: new Date().toISOString(),
    },
    title: 'Test Requirements',
    sections: [],
    extractedGoals: [],
    extractedConstraints: [],
    rawText: overrides.rawText || 'Default raw text content',
    parseErrors: [],
    ...overrides,
  };
}

function createSection(
  title: string,
  content: string,
  level: number,
  children: ParsedSection[] = []
): ParsedSection {
  return {
    title,
    content,
    level,
    children,
  };
}
