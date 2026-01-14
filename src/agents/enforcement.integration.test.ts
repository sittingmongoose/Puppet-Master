/**
 * Integration tests for AGENTS.md enforcement pipeline
 * 
 * Tests the complete enforcement workflow end-to-end:
 * - Multi-level loading and merging
 * - Update detection and reload
 * - Gate enforcement (DO and DON'T rules)
 * - Promotion pipeline
 * - Archive on update
 * - Full enforcement workflow
 * 
 * Per BUILD_QUEUE_PHASE_8.md PH8-T06.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFile, mkdir, rm, readFile, appendFile } from 'fs/promises';
import { join, resolve } from 'path';
import { mkdtemp } from 'fs/promises';
import { tmpdir } from 'os';
import { AgentsManager } from '../memory/agents-manager.js';
import type { AgentsManagerConfig } from '../memory/agents-manager.js';
import { MultiLevelLoader } from './multi-level-loader.js';
import { UpdateDetector } from './update-detector.js';
import { GateEnforcer } from './gate-enforcer.js';
import { PromotionEngine } from './promotion-engine.js';
import type { AgentsEntry } from './promotion-engine.js';
import { ArchiveManager } from './archive-manager.js';
import type { AgentsDocument } from './multi-level-loader.js';

describe('Enforcement Integration Tests', () => {
  let testDir: string;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    // Create temporary directory
    testDir = await mkdtemp(join(tmpdir(), 'puppet-master-enforcement-'));
    cleanup = async () => {
      try {
        await rm(testDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    };
  });

  afterEach(async () => {
    await cleanup();
  });

  /**
   * Creates a temporary project structure with multi-level AGENTS.md files
   */
  async function createTempProject(): Promise<{
    rootAgents: string;
    moduleAgents: string;
    phaseAgents: string;
    taskAgents: string;
    archiveDir: string;
  }> {
    // Create directory structure
    await mkdir(join(testDir, 'src', 'memory'), { recursive: true });
    await mkdir(join(testDir, '.puppet-master', 'agents'), { recursive: true });
    await mkdir(join(testDir, '.puppet-master', 'archives', 'agents'), { recursive: true });

    // Root AGENTS.md
    const rootAgents = join(testDir, 'AGENTS.md');
    await writeFile(
      rootAgents,
      `# AGENTS.md - Root Level

## Project Overview
Root level agents documentation.

## Codebase Patterns
- Root pattern: Use .js extension in imports

## DO
- ✅ Use .js extension in all local imports
- ✅ Use Vitest for testing

## DON'T
- ❌ Use Jest patterns (jest.fn(), jest.mock())
- ❌ Omit .js extension in imports
`,
      'utf-8'
    );

    // Module AGENTS.md
    const moduleAgents = join(testDir, 'src', 'memory', 'AGENTS.md');
    await writeFile(
      moduleAgents,
      `# AGENTS.md - Module Level

## Codebase Patterns
- Module pattern: Use file locking for shared files

## DO
- ✅ Use file locking for shared files

## DON'T
- ❌ Skip file locking for shared files
`,
      'utf-8'
    );

    // Phase AGENTS.md
    const phaseAgents = join(testDir, '.puppet-master', 'agents', 'phase-PH-001.md');
    await writeFile(
      phaseAgents,
      `# AGENTS.md - Phase Level

## Codebase Patterns
- Phase pattern: Always check Context7 MCP

## DO
- ✅ Always check if using Context7 will help

## DON'T
- ❌ Ignore Context7 MCP availability
`,
      'utf-8'
    );

    // Task AGENTS.md
    const taskAgents = join(testDir, '.puppet-master', 'agents', 'task-TK-001-001.md');
    await writeFile(
      taskAgents,
      `# AGENTS.md - Task Level

## Codebase Patterns
- Task pattern: Update Task Status Log after completion

## DO
- ✅ Update Task Status Log when complete

## DON'T
- ❌ Skip updating Task Status Log
`,
      'utf-8'
    );

    return {
      rootAgents,
      moduleAgents,
      phaseAgents,
      taskAgents,
      archiveDir: join(testDir, '.puppet-master', 'archives', 'agents'),
    };
  }

  /**
   * Creates mock agent output (can include violations or be compliant)
   */
  function mockAgentOutput(includeViolations = false): string {
    if (includeViolations) {
      return `
import { jest } from '@jest/globals';
import { foo } from './bar'; // Missing .js extension

describe('test', () => {
  it('works', () => {
    const mock = jest.fn();
  });
});
`;
    }
    return `
import { vi } from 'vitest';
import { foo } from './bar.js';

describe('test', () => {
  it('works', () => {
    const mock = vi.fn();
  });
});
`;
  }

  describe('Multi-Level Loading End-to-End', () => {
    it('should load and merge multi-level AGENTS.md files', async () => {
      const { rootAgents, phaseAgents, taskAgents } = await createTempProject();

      const config: AgentsManagerConfig = {
        rootPath: rootAgents,
        multiLevelEnabled: true,
        modulePattern: 'src/*/AGENTS.md',
        phasePattern: '.puppet-master/agents/phase-*.md',
        taskPattern: '.puppet-master/agents/task-*.md',
        projectRoot: testDir,
      };

      const manager = new AgentsManager(config);
      const loader = new MultiLevelLoader(manager);

      // Load for tier TK-001-001
      const doc = await loader.loadForTier('TK-001-001', testDir);

      // Verify merge priority (task > phase > root)
      // Task-level DO items should be present
      expect(doc.doItems).toContain('Update Task Status Log when complete');
      // Phase-level DO items should be present
      expect(doc.doItems).toContain('Always check if using Context7 will help');
      // Root-level DO items should be present
      expect(doc.doItems).toContain('Use .js extension in all local imports');
      expect(doc.doItems).toContain('Use Vitest for testing');

      // Task-level DON'T items should be present
      expect(doc.dontItems).toContain('Skip updating Task Status Log');
      // Phase-level DON'T items should be present
      expect(doc.dontItems).toContain('Ignore Context7 MCP availability');
      // Root-level DON'T items should be present
      expect(doc.dontItems).toContain('Use Jest patterns (jest.fn(), jest.mock())');
      expect(doc.dontItems).toContain('Omit .js extension in imports');

      // Verify patterns merged
      expect(doc.codebasePatterns.length).toBeGreaterThan(0);
      expect(doc.codebasePatterns.some(p => p.includes('Task pattern'))).toBe(true);
      expect(doc.codebasePatterns.some(p => p.includes('Phase pattern'))).toBe(true);
      expect(doc.codebasePatterns.some(p => p.includes('Root pattern'))).toBe(true);

      // Verify overview (should come from root)
      expect(doc.overview).toContain('Root level');
    });
  });

  describe('Update Detection and Reload', () => {
    it('should detect AGENTS.md updates during execution', async () => {
      const { rootAgents } = await createTempProject();

      const detector = new UpdateDetector();

      // Take initial snapshot
      await detector.takeSnapshot([rootAgents]);

      // Modify file
      await appendFile(rootAgents, '\n## New Section\n- New rule added\n', 'utf-8');

      // Check for updates
      const result = await detector.checkForUpdates([rootAgents]);

      // Verify update detected
      expect(result.hasUpdates).toBe(true);
      expect(result.updatedFiles).toContain(rootAgents);
      expect(result.previousHashes.has(rootAgents)).toBe(true);
      expect(result.currentHashes.has(rootAgents)).toBe(true);
      expect(result.previousHashes.get(rootAgents)).not.toBe(
        result.currentHashes.get(rootAgents)
      );
    });

    it('should not detect updates when file unchanged', async () => {
      const { rootAgents } = await createTempProject();

      const detector = new UpdateDetector();

      // Take initial snapshot
      await detector.takeSnapshot([rootAgents]);

      // Check for updates without modifying
      const result = await detector.checkForUpdates([rootAgents]);

      // Verify no updates detected
      expect(result.hasUpdates).toBe(false);
      expect(result.updatedFiles).toHaveLength(0);
    });
  });

  describe('Gate Enforcement', () => {
    it('should enforce DON\'T rules at gate', async () => {
      const enforcer = new GateEnforcer();

      const agentsDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: [],
        dontItems: ['Use Jest patterns (jest.fn(), jest.mock())', 'Omit .js extension in imports'],
        testing: [],
        directoryStructure: [],
      };

      const output = mockAgentOutput(true); // Includes violations

      const result = await enforcer.check(output, agentsDoc);

      // Verify violations detected
      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations.some(v => v.type === 'dont' && v.rule.includes('Jest'))).toBe(true);
      expect(result.violations.some(v => v.type === 'dont' && v.rule.includes('.js'))).toBe(true);
      expect(result.summary).toContain('DON\'T rule violation');
    });

    it('should enforce DO rules at gate', async () => {
      const enforcer = new GateEnforcer();

      const agentsDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: ['Use .js extension in all local imports', 'Use Vitest for testing'],
        dontItems: [],
        testing: [],
        directoryStructure: [],
      };

      // Output missing required patterns
      const output = `
import { foo } from './bar'; // Missing .js
import { jest } from '@jest/globals'; // Wrong testing library
`;

      const result = await enforcer.check(output, agentsDoc);

      // Verify violations detected
      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations.some(v => v.type === 'do')).toBe(true);
    });

    it('should pass when output complies with all rules', async () => {
      const enforcer = new GateEnforcer();

      const agentsDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: ['Use .js extension in all local imports', 'Use Vitest for testing'],
        dontItems: ['Use Jest patterns (jest.fn(), jest.mock())'],
        testing: [],
        directoryStructure: [],
      };

      const output = mockAgentOutput(false); // Compliant output

      const result = await enforcer.check(output, agentsDoc);

      // Verify no violations
      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.summary).toContain('All AGENTS.md rules passed');
    });
  });

  describe('Promotion Pipeline', () => {
    it('should promote frequently used patterns', async () => {
      const engine = new PromotionEngine();

      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Use .js extension in all local imports',
        section: 'Codebase Patterns',
        level: 'task',
      };

      // Track usage multiple times across different tiers
      engine.trackUsage(entry, 'TK-001-001');
      engine.trackUsage(entry, 'TK-001-002');
      engine.trackUsage(entry, 'TK-001-003');

      // Evaluate for promotion
      const candidate = engine.evaluate(entry);

      // Verify promotion candidate generated
      expect(candidate).toBeTruthy();
      expect(candidate?.rule).toBe('REPEATED_PATTERN');
      expect(candidate?.currentLevel).toBe('task');
      // Note: evaluate() returns 'root' as targetLevel, but promote() will use parent level
      expect(candidate?.targetLevel).toBe('root');
      expect(candidate?.confidence).toBeGreaterThan(0);
    });

    it('should track usage statistics correctly', async () => {
      const engine = new PromotionEngine();

      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Test pattern',
        section: 'Codebase Patterns',
        level: 'phase',
      };

      // Track across multiple tiers
      engine.trackUsage(entry, 'TK-001-001');
      engine.trackUsage(entry, 'TK-001-002');
      engine.trackUsage(entry, 'TK-002-001');
      engine.trackUsage(entry, 'TK-002-002');
      engine.trackUsage(entry, 'TK-003-001');

      // Get candidates to access stats
      const candidates = engine.getPromotionCandidates();
      const stats = engine.getStats(entry);

      // Verify stats accumulated correctly
      expect(stats).toBeTruthy();
      expect(stats?.occurrenceCount).toBe(5);
      expect(stats?.usedInTiers.length).toBe(5);
      expect(stats?.usedInTiers).toContain('TK-001-001');
      expect(stats?.usedInTiers).toContain('TK-003-001');
      expect(stats?.firstSeen).toBeTruthy();
      expect(stats?.lastSeen).toBeTruthy();
    });

    it('should promote high-impact gotchas to root', async () => {
      const engine = new PromotionEngine();

      const entry: AgentsEntry = {
        type: 'gotcha',
        content: 'Missing .js extension causes ERR_MODULE_NOT_FOUND',
        section: 'Common Failure Modes',
        level: 'phase',
        metadata: {
          fix: 'Add .js extension to all local imports',
        },
      };

      // Track usage multiple times to build up impact score
      // Impact score calculation: base (0.5 per occurrence, max 4) + universality (0.6 per tier, max 3) + gotcha bonus (3)
      // Need at least 8 total: tracking in multiple tiers helps
      for (let i = 1; i <= 5; i++) {
        engine.trackUsage(entry, `PH-00${i}`);
      }

      const candidate = engine.evaluate(entry);

      // Verify promotion to root for high impact
      expect(candidate).toBeTruthy();
      expect(candidate?.rule).toBe('HIGH_IMPACT_GOTCHA');
      expect(candidate?.targetLevel).toBe('root');
    });
  });

  describe('Archive on Update', () => {
    it('should archive before update', async () => {
      const { rootAgents, archiveDir } = await createTempProject();

      const manager = new ArchiveManager(archiveDir);

      // Read original content
      const originalContent = await readFile(rootAgents, 'utf-8');

      // Archive the file
      const entry = await manager.archive(rootAgents, 'Before update test');

      // Verify archive created
      expect(entry.originalPath).toBe(rootAgents);
      expect(entry.archivePath).toContain('.puppet-master/archives/agents');
      expect(entry.reason).toBe('Before update test');
      expect(entry.hash).toHaveLength(64); // SHA-256

      // Verify archive file exists and matches original
      const archiveContent = await readFile(entry.archivePath, 'utf-8');
      expect(archiveContent).toBe(originalContent);

      // Modify original file
      await appendFile(rootAgents, '\n## New Section\n', 'utf-8');

      // Verify archive still accessible
      const retrieved = await manager.get(entry.id);
      expect(retrieved).toBe(originalContent);

      // Test diff
      const diff = await manager.diff(entry.id, rootAgents);
      expect(diff).toContain('+'); // Should show added lines
    });

    it('should restore archived version', async () => {
      const { rootAgents, archiveDir } = await createTempProject();

      const manager = new ArchiveManager(archiveDir);

      // Read original content
      const originalContent = await readFile(rootAgents, 'utf-8');

      // Archive
      const entry = await manager.archive(rootAgents);

      // Modify file
      await writeFile(rootAgents, 'Modified content', 'utf-8');

      // Restore
      await manager.restore(entry.id);

      // Verify restored
      const restoredContent = await readFile(rootAgents, 'utf-8');
      expect(restoredContent).toBe(originalContent);
    });
  });

  describe('Full Enforcement Workflow', () => {
    it('should complete full enforcement workflow end-to-end', async () => {
      const { rootAgents, phaseAgents, taskAgents, archiveDir } = await createTempProject();

      // 1. Initialize components
      const config: AgentsManagerConfig = {
        rootPath: rootAgents,
        multiLevelEnabled: true,
        modulePattern: 'src/*/AGENTS.md',
        phasePattern: '.puppet-master/agents/phase-*.md',
        taskPattern: '.puppet-master/agents/task-*.md',
        projectRoot: testDir,
      };

      const manager = new AgentsManager(config);
      const loader = new MultiLevelLoader(manager);
      const detector = new UpdateDetector();
      const enforcer = new GateEnforcer();
      const promotionEngine = new PromotionEngine();
      const archiveManager = new ArchiveManager(archiveDir);

      // 2. Load multi-level AGENTS.md files
      const doc = await loader.loadForTier('TK-001-001', testDir);
      expect(doc).toBeTruthy();
      expect(doc.doItems.length).toBeGreaterThan(0);
      expect(doc.dontItems.length).toBeGreaterThan(0);

      // 3. Take snapshot
      await detector.takeSnapshot([rootAgents, phaseAgents, taskAgents]);

      // 4. Simulate agent execution (mock output)
      const agentOutput = mockAgentOutput(false); // Compliant output

      // 5. Run gate enforcement
      const enforcementResult = await enforcer.check(agentOutput, doc);
      expect(enforcementResult.passed).toBe(true);

      // 6. Track usage for promotion
      const entry: AgentsEntry = {
        type: 'pattern',
        content: 'Use .js extension in all local imports',
        section: 'Codebase Patterns',
        level: 'task',
      };
      promotionEngine.trackUsage(entry, 'TK-001-001');
      promotionEngine.trackUsage(entry, 'TK-001-002');
      promotionEngine.trackUsage(entry, 'TK-001-003');

      // 7. Check for promotion candidates
      const candidates = promotionEngine.getPromotionCandidates();
      expect(candidates.length).toBeGreaterThan(0);

      // 8. Simulate update to AGENTS.md
      await appendFile(rootAgents, '\n## Updated Section\n', 'utf-8');

      // 9. Archive before update (if needed)
      const archiveEntry = await archiveManager.archive(rootAgents, 'Integration test update');
      expect(archiveEntry).toBeTruthy();

      // 10. Check for updates
      const updateResult = await detector.checkForUpdates([rootAgents, phaseAgents, taskAgents]);
      expect(updateResult.hasUpdates).toBe(true);
      expect(updateResult.updatedFiles).toContain(rootAgents);

      // 11. Verify complete workflow
      // All components worked together successfully
      expect(doc).toBeTruthy();
      expect(enforcementResult.passed).toBe(true);
      expect(archiveEntry).toBeTruthy();
      expect(updateResult.hasUpdates).toBe(true);
    });

    it('should handle violations in full workflow', async () => {
      const { rootAgents, archiveDir } = await createTempProject();

      const config: AgentsManagerConfig = {
        rootPath: rootAgents,
        multiLevelEnabled: true,
        modulePattern: 'src/*/AGENTS.md',
        phasePattern: '.puppet-master/agents/phase-*.md',
        taskPattern: '.puppet-master/agents/task-*.md',
        projectRoot: testDir,
      };

      const manager = new AgentsManager(config);
      const loader = new MultiLevelLoader(manager);
      const enforcer = new GateEnforcer();
      const archiveManager = new ArchiveManager(archiveDir);

      // Load agents doc
      const doc = await loader.loadForTier('TK-001-001', testDir);

      // Create output with violations
      const agentOutput = mockAgentOutput(true);

      // Run enforcement
      const result = await enforcer.check(agentOutput, doc);

      // Verify violations detected
      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);

      // Archive would happen before fixing
      const archiveEntry = await archiveManager.archive(rootAgents, 'Violation detected');
      expect(archiveEntry).toBeTruthy();
    });
  });
});
