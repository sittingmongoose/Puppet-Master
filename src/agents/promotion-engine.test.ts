/**
 * Tests for PromotionEngine
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PromotionEngine } from './promotion-engine.js';
import type {
  AgentsEntry,
  EntryStats,
  PromotionRule,
  PromotionCandidate,
  PromotionConfig,
} from './promotion-engine.js';
import type { AgentsLevel, AgentsManager } from '../memory/agents-manager.js';
import type { MultiLevelLoader } from './multi-level-loader.js';

describe('PromotionEngine', () => {
  let engine: PromotionEngine;
  let mockAgentsManager: AgentsManager;
  let mockLoader: MultiLevelLoader;

  beforeEach(() => {
    engine = new PromotionEngine();
    
    // Mock AgentsManager
    mockAgentsManager = {
      loadFile: vi.fn(),
      addPattern: vi.fn(),
      addGotcha: vi.fn(),
    } as unknown as AgentsManager;

    // Mock MultiLevelLoader
    mockLoader = {} as MultiLevelLoader;
  });

  describe('constructor', () => {
    it('should create instance with default config', () => {
      const eng = new PromotionEngine();
      expect(eng).toBeInstanceOf(PromotionEngine);
    });

    it('should create instance with custom config', () => {
      const config: PromotionConfig = {
        minOccurrenceForPromotion: 5,
        minImpactScore: 9,
        minTiersForUniversal: 7,
        enableAutoPromotion: true,
      };
      const eng = new PromotionEngine(config);
      expect(eng).toBeInstanceOf(PromotionEngine);
    });

    it('should register default rules', () => {
      const eng = new PromotionEngine();
      // Default rules should be registered (we can't directly access private rules,
      // but we can test by evaluating entries)
      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Test pattern',
        section: 'Codebase Patterns',
        level: 'task',
      };
      // Track usage multiple times to trigger REPEATED_PATTERN
      eng.trackUsage(entry, 'TK-001-001');
      eng.trackUsage(entry, 'TK-001-002');
      eng.trackUsage(entry, 'TK-001-003');
      
      const candidate = eng.evaluate(entry);
      expect(candidate).toBeTruthy();
      expect(candidate?.rule).toBe('REPEATED_PATTERN');
    });
  });

  describe('registerRule', () => {
    it('should register custom rule', () => {
      const rule: PromotionRule = {
        name: 'CUSTOM_RULE',
        condition: (entry, stats) => stats.occurrenceCount >= 2,
        targetLevel: 'root',
        priority: 5,
      };
      engine.registerRule(rule);

      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Test',
        section: 'Codebase Patterns',
        level: 'phase',
      };
      engine.trackUsage(entry, 'PH-001');
      engine.trackUsage(entry, 'PH-002');

      const candidate = engine.evaluate(entry);
      expect(candidate).toBeTruthy();
      expect(candidate?.rule).toBe('CUSTOM_RULE');
    });

    it('should sort rules by priority', () => {
      const rule1: PromotionRule = {
        name: 'LOW_PRIORITY',
        condition: () => true,
        targetLevel: 'root',
        priority: 1,
      };
      const rule2: PromotionRule = {
        name: 'HIGH_PRIORITY',
        condition: () => true,
        targetLevel: 'root',
        priority: 10,
      };

      engine.registerRule(rule1);
      engine.registerRule(rule2);

      // High priority rule should be evaluated first
      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Test',
        section: 'Codebase Patterns',
        level: 'phase',
      };
      engine.trackUsage(entry, 'PH-001');
      const candidate = engine.evaluate(entry);
      expect(candidate?.rule).toBe('HIGH_PRIORITY');
    });
  });

  describe('trackUsage', () => {
    it('should track entry usage and create stats', () => {
      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Use .js extensions',
        section: 'Codebase Patterns',
        level: 'task',
      };

      engine.trackUsage(entry, 'TK-001-001');

      const stats = engine.getStats(entry);
      expect(stats).toBeTruthy();
      expect(stats?.occurrenceCount).toBe(1);
      expect(stats?.usedInTiers).toContain('TK-001-001');
      expect(stats?.firstSeen).toBeTruthy();
      expect(stats?.lastSeen).toBeTruthy();
    });

    it('should update existing stats on multiple usage', () => {
      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Test pattern',
        section: 'Codebase Patterns',
        level: 'task',
      };

      engine.trackUsage(entry, 'TK-001-001');
      engine.trackUsage(entry, 'TK-001-002');
      engine.trackUsage(entry, 'TK-001-003');

      const stats = engine.getStats(entry);
      expect(stats?.occurrenceCount).toBe(3);
      expect(stats?.usedInTiers).toHaveLength(3);
      expect(stats?.usedInTiers).toContain('TK-001-001');
      expect(stats?.usedInTiers).toContain('TK-001-002');
      expect(stats?.usedInTiers).toContain('TK-001-003');
    });

    it('should not duplicate tier IDs', () => {
      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Test',
        section: 'Codebase Patterns',
        level: 'task',
      };

      engine.trackUsage(entry, 'TK-001-001');
      engine.trackUsage(entry, 'TK-001-001'); // Same tier
      engine.trackUsage(entry, 'TK-001-001'); // Same tier

      const stats = engine.getStats(entry);
      expect(stats?.occurrenceCount).toBe(3);
      expect(stats?.usedInTiers).toHaveLength(1);
      expect(stats?.usedInTiers).toContain('TK-001-001');
    });

    it('should update lastSeen timestamp', async () => {
      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Test',
        section: 'Codebase Patterns',
        level: 'task',
      };

      engine.trackUsage(entry, 'TK-001-001');
      const stats1 = engine.getStats(entry);
      const firstSeen = stats1?.firstSeen;

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      engine.trackUsage(entry, 'TK-001-002');
      const stats2 = engine.getStats(entry);
      
      expect(stats2?.firstSeen).toBe(firstSeen);
      expect(stats2?.lastSeen).not.toBe(firstSeen);
    });
  });

  describe('evaluate', () => {
    it('should return null for untracked entry', () => {
      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Untracked',
        section: 'Codebase Patterns',
        level: 'task',
      };

      const candidate = engine.evaluate(entry);
      expect(candidate).toBeNull();
    });

    it('should return null if no rules match', () => {
      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Test',
        section: 'Codebase Patterns',
        level: 'task',
      };

      engine.trackUsage(entry, 'TK-001-001');
      // Only 1 occurrence, won't trigger REPEATED_PATTERN (needs 3)

      const candidate = engine.evaluate(entry);
      expect(candidate).toBeNull();
    });

    it('should evaluate REPEATED_PATTERN rule', () => {
      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Repeated pattern',
        section: 'Codebase Patterns',
        level: 'task',
      };

      engine.trackUsage(entry, 'TK-001-001');
      engine.trackUsage(entry, 'TK-001-002');
      engine.trackUsage(entry, 'TK-001-003');

      const candidate = engine.evaluate(entry);
      expect(candidate).toBeTruthy();
      expect(candidate?.rule).toBe('REPEATED_PATTERN');
      expect(candidate?.currentLevel).toBe('task');
      expect(candidate?.confidence).toBeGreaterThan(0);
      expect(candidate?.confidence).toBeLessThanOrEqual(1);
    });

    it('should evaluate HIGH_IMPACT_GOTCHA rule', () => {
      const entry: AgentsEntry = {
        type: 'gotcha',
        content: 'High impact gotcha',
        section: 'Common Failure Modes',
        level: 'phase',
        metadata: { fix: 'Apply fix' },
      };

      // Track usage to build up impact score
      for (let i = 0; i < 10; i++) {
        engine.trackUsage(entry, `PH-00${i}`);
      }

      const candidate = engine.evaluate(entry);
      expect(candidate).toBeTruthy();
      expect(candidate?.rule).toBe('HIGH_IMPACT_GOTCHA');
      expect(candidate?.targetLevel).toBe('root');
    });

    it('should evaluate UNIVERSAL_RULE', () => {
      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Universal pattern',
        section: 'Codebase Patterns',
        level: 'phase',
      };

      // Track in 5+ different tiers
      for (let i = 1; i <= 5; i++) {
        engine.trackUsage(entry, `PH-00${i}`);
      }

      const candidate = engine.evaluate(entry);
      expect(candidate).toBeTruthy();
      expect(candidate?.rule).toBe('UNIVERSAL_RULE');
      expect(candidate?.targetLevel).toBe('root');
    });

    it('should return first matching rule by priority', () => {
      // Register a high-priority custom rule
      const highPriorityRule: PromotionRule = {
        name: 'CUSTOM_HIGH',
        condition: (entry, stats) => stats.occurrenceCount >= 1,
        targetLevel: 'root',
        priority: 100,
      };
      engine.registerRule(highPriorityRule);

      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Test',
        section: 'Codebase Patterns',
        level: 'task',
      };

      engine.trackUsage(entry, 'TK-001-001');
      // This would also match REPEATED_PATTERN after 3 uses, but high priority should win
      const candidate = engine.evaluate(entry);
      expect(candidate?.rule).toBe('CUSTOM_HIGH');
    });
  });

  describe('getPromotionCandidates', () => {
    it('should return empty array when no entries tracked', () => {
      const candidates = engine.getPromotionCandidates();
      expect(candidates).toEqual([]);
    });

    it('should return candidates for eligible entries', () => {
      const entry1: AgentsEntry = {
        type: 'pattern',
        content: 'Pattern 1',
        section: 'Codebase Patterns',
        level: 'task',
      };
      const entry2: AgentsEntry = {
        type: 'pattern',
        content: 'Pattern 2',
        section: 'Codebase Patterns',
        level: 'task',
      };

      // Entry 1: 3 uses (eligible)
      engine.trackUsage(entry1, 'TK-001-001');
      engine.trackUsage(entry1, 'TK-001-002');
      engine.trackUsage(entry1, 'TK-001-003');

      // Entry 2: 1 use (not eligible)
      engine.trackUsage(entry2, 'TK-001-001');

      const candidates = engine.getPromotionCandidates();
      expect(candidates).toHaveLength(1);
      expect(candidates[0]?.entry.content).toBe('Pattern 1');
    });

    it('should return multiple candidates', () => {
      const entries: AgentsEntry[] = [
        {
          type: 'pattern',
          content: 'Pattern 1',
          section: 'Codebase Patterns',
          level: 'task',
        },
        {
          type: 'pattern',
          content: 'Pattern 2',
          section: 'Codebase Patterns',
          level: 'task',
        },
        {
          type: 'gotcha',
          content: 'Gotcha 1',
          section: 'Common Failure Modes',
          level: 'phase',
          metadata: { fix: 'Fix 1' },
        },
      ];

      // Make all eligible
      entries.forEach((entry, idx) => {
        for (let i = 0; i < (idx === 2 ? 10 : 3); i++) {
          engine.trackUsage(entry, `${idx === 2 ? 'PH' : 'TK'}-00${i}`);
        }
      });

      const candidates = engine.getPromotionCandidates();
      expect(candidates.length).toBeGreaterThan(0);
    });
  });

  describe('promote', () => {
    it('should throw error when promoting from root level', async () => {
      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Test',
        section: 'Codebase Patterns',
        level: 'root',
      };

      const candidate: PromotionCandidate = {
        entry,
        currentLevel: 'root',
        targetLevel: 'root',
        rule: 'TEST',
        confidence: 1.0,
      };

      await expect(
        engine.promote(candidate, mockLoader, mockAgentsManager)
      ).rejects.toThrow('already at root level');
    });

    it('should throw error when promoting to same level', async () => {
      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Test',
        section: 'Codebase Patterns',
        level: 'task',
      };

      const candidate: PromotionCandidate = {
        entry,
        currentLevel: 'task',
        targetLevel: 'task',
        rule: 'TEST',
        confidence: 1.0,
      };

      await expect(
        engine.promote(candidate, mockLoader, mockAgentsManager)
      ).rejects.toThrow('same level');
    });

    it('should throw error when promoting to lower level', async () => {
      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Test',
        section: 'Codebase Patterns',
        level: 'phase',
      };

      const candidate: PromotionCandidate = {
        entry,
        currentLevel: 'phase',
        targetLevel: 'task', // Lower level
        rule: 'TEST',
        confidence: 1.0,
      };

      await expect(
        engine.promote(candidate, mockLoader, mockAgentsManager)
      ).rejects.toThrow('destination must be higher');
    });

    it('should promote pattern to parent level', async () => {
      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Test pattern',
        section: 'Codebase Patterns',
        level: 'task',
      };

      vi.mocked(mockAgentsManager.loadFile).mockResolvedValue({
        level: 'phase',
        path: '/test/phase.md',
        content: '# AGENTS.md\n',
        sections: {
          overview: '',
          architectureNotes: [],
          codebasePatterns: [],
          toolingRules: [],
          commonFailureModes: [],
          doItems: [],
          dontItems: [],
          testing: [],
          directoryStructure: [],
        },
      });

      vi.mocked(mockAgentsManager.addPattern).mockResolvedValue();

      const candidate: PromotionCandidate = {
        entry,
        currentLevel: 'task',
        targetLevel: 'phase',
        rule: 'REPEATED_PATTERN',
        confidence: 0.8,
      };

      const context = {
        phaseId: 'PH-001',
        taskId: 'TK-001-001',
        filesTargeted: [],
      };

      await engine.promote(candidate, mockLoader, mockAgentsManager, context);

      expect(mockAgentsManager.addPattern).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Test pattern',
        }),
        'phase',
        context
      );
    });

    it('should promote gotcha to root level', async () => {
      const entry: AgentsEntry = {
        type: 'gotcha',
        content: 'Test gotcha',
        section: 'Common Failure Modes',
        level: 'phase',
        metadata: { fix: 'Apply fix' },
      };

      vi.mocked(mockAgentsManager.loadFile).mockResolvedValue({
        level: 'root',
        path: '/test/AGENTS.md',
        content: '# AGENTS.md\n',
        sections: {
          overview: '',
          architectureNotes: [],
          codebasePatterns: [],
          toolingRules: [],
          commonFailureModes: [],
          doItems: [],
          dontItems: [],
          testing: [],
          directoryStructure: [],
        },
      });

      vi.mocked(mockAgentsManager.addGotcha).mockResolvedValue();

      const candidate: PromotionCandidate = {
        entry,
        currentLevel: 'phase',
        targetLevel: 'root',
        rule: 'HIGH_IMPACT_GOTCHA',
        confidence: 0.9,
      };

      await engine.promote(candidate, mockLoader, mockAgentsManager);

      expect(mockAgentsManager.addGotcha).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Test gotcha',
          fix: 'Apply fix',
        }),
        'root',
        undefined
      );
    });

    it('should skip promotion if entry already exists', async () => {
      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Existing pattern',
        section: 'Codebase Patterns',
        level: 'task',
      };

      vi.mocked(mockAgentsManager.loadFile).mockResolvedValue({
        level: 'phase',
        path: '/test/phase.md',
        content: '# AGENTS.md\n',
        sections: {
          overview: '',
          architectureNotes: [],
          codebasePatterns: ['Existing pattern'], // Already exists
          toolingRules: [],
          commonFailureModes: [],
          doItems: [],
          dontItems: [],
          testing: [],
          directoryStructure: [],
        },
      });

      const candidate: PromotionCandidate = {
        entry,
        currentLevel: 'task',
        targetLevel: 'phase',
        rule: 'REPEATED_PATTERN',
        confidence: 0.8,
      };

      const context = {
        phaseId: 'PH-001',
        taskId: 'TK-001-001',
        filesTargeted: [],
      };

      await engine.promote(candidate, mockLoader, mockAgentsManager, context);

      // Should not call addPattern since entry already exists
      expect(mockAgentsManager.addPattern).not.toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return stats for tracked entry', () => {
      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Test',
        section: 'Codebase Patterns',
        level: 'task',
      };

      engine.trackUsage(entry, 'TK-001-001');
      const stats = engine.getStats(entry);

      expect(stats).toBeTruthy();
      expect(stats?.occurrenceCount).toBe(1);
    });

    it('should return undefined for untracked entry', () => {
      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Untracked',
        section: 'Codebase Patterns',
        level: 'task',
      };

      const stats = engine.getStats(entry);
      expect(stats).toBeUndefined();
    });
  });

  describe('clearStats', () => {
    it('should clear all tracked statistics and entries', () => {
      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Test',
        section: 'Codebase Patterns',
        level: 'task',
      };

      engine.trackUsage(entry, 'TK-001-001');
      expect(engine.getStats(entry)).toBeTruthy();

      engine.clearStats();
      expect(engine.getStats(entry)).toBeUndefined();
      expect(engine.getPromotionCandidates()).toEqual([]);
    });
  });

  describe('entry ID generation', () => {
    it('should generate same ID for same entry', () => {
      const entry1: AgentsEntry = {
        type: 'pattern',
        content: 'Test',
        section: 'Codebase Patterns',
        level: 'task',
      };
      const entry2: AgentsEntry = {
        type: 'pattern',
        content: 'Test',
        section: 'Codebase Patterns',
        level: 'phase', // Different level, but same content/type/section
      };

      engine.trackUsage(entry1, 'TK-001-001');
      engine.trackUsage(entry2, 'PH-001');

      // Should be tracked as same entry (same ID)
      const stats1 = engine.getStats(entry1);
      const stats2 = engine.getStats(entry2);
      expect(stats1).toBeTruthy();
      expect(stats2).toBeTruthy();
      expect(stats1?.occurrenceCount).toBe(2); // Both tracked to same entry
    });

    it('should generate different IDs for different entries', () => {
      const entry1: AgentsEntry = {
        type: 'pattern',
        content: 'Pattern 1',
        section: 'Codebase Patterns',
        level: 'task',
      };
      const entry2: AgentsEntry = {
        type: 'pattern',
        content: 'Pattern 2',
        section: 'Codebase Patterns',
        level: 'task',
      };

      engine.trackUsage(entry1, 'TK-001-001');
      engine.trackUsage(entry2, 'TK-001-001');

      const stats1 = engine.getStats(entry1);
      const stats2 = engine.getStats(entry2);
      expect(stats1?.occurrenceCount).toBe(1);
      expect(stats2?.occurrenceCount).toBe(1);
    });
  });

  describe('impact score calculation', () => {
    it('should calculate impact score for gotcha', () => {
      const entry: AgentsEntry = {
        type: 'gotcha',
        content: 'Test gotcha',
        section: 'Common Failure Modes',
        level: 'phase',
        metadata: { fix: 'Fix' },
      };

      engine.trackUsage(entry, 'PH-001');
      const stats = engine.getStats(entry);

      expect(stats?.impactScore).toBeGreaterThan(0);
      expect(stats?.impactScore).toBeLessThanOrEqual(10);
    });

    it('should increase impact score with more occurrences', () => {
      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Test',
        section: 'Codebase Patterns',
        level: 'task',
      };

      engine.trackUsage(entry, 'TK-001-001');
      const stats1 = engine.getStats(entry);
      const score1 = stats1?.impactScore ?? 0;

      engine.trackUsage(entry, 'TK-001-002');
      engine.trackUsage(entry, 'TK-001-003');
      const stats2 = engine.getStats(entry);
      const score2 = stats2?.impactScore ?? 0;

      expect(score2).toBeGreaterThan(score1);
    });
  });

  describe('edge cases', () => {
    it('should handle entries at root level', () => {
      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Root pattern',
        section: 'Codebase Patterns',
        level: 'root',
      };

      engine.trackUsage(entry, 'ROOT');
      const candidate = engine.evaluate(entry);
      
      // Root level entries shouldn't be promoted (no parent)
      expect(candidate).toBeNull();
    });

    it('should handle empty tier ID array', () => {
      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Test',
        section: 'Codebase Patterns',
        level: 'task',
      };

      engine.trackUsage(entry, 'TK-001-001');
      const stats = engine.getStats(entry);
      expect(stats?.usedInTiers).toHaveLength(1);
    });

    it('should handle promotion with custom config thresholds', () => {
      const customEngine = new PromotionEngine({
        minOccurrenceForPromotion: 5,
        minImpactScore: 9,
        minTiersForUniversal: 7,
      });

      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Test',
        section: 'Codebase Patterns',
        level: 'task',
      };

      // 4 uses - below threshold of 5
      for (let i = 1; i <= 4; i++) {
        customEngine.trackUsage(entry, `TK-001-00${i}`);
      }
      expect(customEngine.evaluate(entry)).toBeNull();

      // 5 uses - meets threshold
      customEngine.trackUsage(entry, 'TK-001-005');
      const candidate = customEngine.evaluate(entry);
      expect(candidate).toBeTruthy();
      expect(candidate?.rule).toBe('REPEATED_PATTERN');
    });
  });
});
