/**
 * Tests for MultiLevelLoader
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { AgentsManager } from '../memory/agents-manager.js';
import type { AgentsManagerConfig } from '../memory/agents-manager.js';
import { MultiLevelLoader } from './multi-level-loader.js';
import type { LevelPath, AgentsDocument } from './multi-level-loader.js';

describe('MultiLevelLoader', () => {
  const testDir = join(process.cwd(), '.test-multi-level');
  const projectRoot = testDir;

  const defaultConfig: AgentsManagerConfig = {
    rootPath: 'AGENTS.md',
    multiLevelEnabled: true,
    modulePattern: 'src/*/AGENTS.md',
    phasePattern: '.puppet-master/agents/phase-*.md',
    taskPattern: '.puppet-master/agents/task-*.md',
    projectRoot,
  };

  beforeEach(async () => {
    // Create test directory structure
    try {
      await mkdir(testDir, { recursive: true });
      await mkdir(join(testDir, '.puppet-master', 'agents'), { recursive: true });
      await mkdir(join(testDir, 'src', 'memory'), { recursive: true });
    } catch {
      // Directory might already exist
    }
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('resolvePaths', () => {
    it('should resolve paths for phase tier ID', () => {
      const manager = new AgentsManager(defaultConfig);
      const loader = new MultiLevelLoader(manager);
      const paths = loader.resolvePaths('PH-001', testDir);

      expect(paths.length).toBeGreaterThan(0);
      expect(paths.some(p => p.level === 'root')).toBe(true);
      expect(paths.some(p => p.level === 'phase')).toBe(true);
      expect(paths.find(p => p.level === 'phase')?.path).toContain('phase-PH-001.md');
    });

    it('should resolve paths for task tier ID', () => {
      const manager = new AgentsManager(defaultConfig);
      const loader = new MultiLevelLoader(manager);
      const paths = loader.resolvePaths('TK-001-001', testDir);

      expect(paths.some(p => p.level === 'root')).toBe(true);
      expect(paths.some(p => p.level === 'phase')).toBe(true);
      expect(paths.some(p => p.level === 'task')).toBe(true);
      expect(paths.find(p => p.level === 'task')?.path).toContain('task-TK-001-001.md');
    });

    it('should resolve paths for subtask tier ID', () => {
      const manager = new AgentsManager(defaultConfig);
      const loader = new MultiLevelLoader(manager);
      const paths = loader.resolvePaths('ST-001-001-001', testDir);

      expect(paths.some(p => p.level === 'root')).toBe(true);
      expect(paths.some(p => p.level === 'phase')).toBe(true);
      expect(paths.some(p => p.level === 'task')).toBe(true);
      expect(paths.find(p => p.path.includes('subtask-ST-001-001-001.md'))).toBeDefined();
    });

    it('should resolve paths for iteration tier ID', () => {
      const manager = new AgentsManager(defaultConfig);
      const loader = new MultiLevelLoader(manager);
      const paths = loader.resolvePaths('IT-001-001-001-001', testDir);

      expect(paths.some(p => p.level === 'root')).toBe(true);
      expect(paths.some(p => p.level === 'phase')).toBe(true);
      expect(paths.some(p => p.level === 'task')).toBe(true);
      expect(paths.find(p => p.path.includes('iteration-IT-001-001-001-001.md'))).toBeDefined();
    });

    it('should include root path in resolved paths', () => {
      const manager = new AgentsManager(defaultConfig);
      const loader = new MultiLevelLoader(manager);
      const paths = loader.resolvePaths('PH-001', testDir);

      const rootPaths = paths.filter(p => p.level === 'root');
      expect(rootPaths.length).toBeGreaterThan(0);
      expect(rootPaths.some(p => p.path.includes('AGENTS.md'))).toBe(true);
    });
  });

  describe('loadAll', () => {
    it('should load and merge from multiple level paths', async () => {
      // Create root AGENTS.md
      const rootContent = `# AGENTS.md

## Project Overview
Root overview.

## Codebase Patterns
- Root pattern 1
- Root pattern 2

## DO
- ✅ Root do item
`;
      await writeFile(join(testDir, 'AGENTS.md'), rootContent, 'utf-8');

      // Create phase AGENTS.md
      const phaseContent = `# AGENTS.md

## Project Overview
Phase overview override.

## Codebase Patterns
- Phase pattern 1
- Root pattern 1

## DO
- ✅ Phase do item
`;
      await writeFile(
        join(testDir, '.puppet-master', 'agents', 'phase-PH-001.md'),
        phaseContent,
        'utf-8'
      );

      const manager = new AgentsManager(defaultConfig);
      const loader = new MultiLevelLoader(manager);

      const paths: LevelPath[] = [
        {
          level: 'root',
          path: join(testDir, 'AGENTS.md'),
          exists: true,
        },
        {
          level: 'phase',
          path: join(testDir, '.puppet-master', 'agents', 'phase-PH-001.md'),
          exists: true,
        },
      ];

      const result = await loader.loadAll(paths);

      // Overview should be overridden by phase
      expect(result.overview).toContain('Phase overview override');
      // Patterns should be merged with deduplication
      expect(result.codebasePatterns).toContain('Root pattern 1');
      expect(result.codebasePatterns).toContain('Root pattern 2');
      expect(result.codebasePatterns).toContain('Phase pattern 1');
      // DO items should be merged
      expect(result.doItems.length).toBeGreaterThan(1);
    });

    it('should handle missing files gracefully', async () => {
      // Only create root file
      const rootContent = `# AGENTS.md

## Project Overview
Root overview.
`;
      await writeFile(join(testDir, 'AGENTS.md'), rootContent, 'utf-8');

      const manager = new AgentsManager(defaultConfig);
      const loader = new MultiLevelLoader(manager);

      const paths: LevelPath[] = [
        {
          level: 'root',
          path: join(testDir, 'AGENTS.md'),
          exists: true,
        },
        {
          level: 'phase',
          path: join(testDir, '.puppet-master', 'agents', 'phase-PH-001.md'),
          exists: false,
        },
      ];

      const result = await loader.loadAll(paths);

      expect(result.overview).toContain('Root overview');
      expect(result.codebasePatterns).toHaveLength(0);
    });

    it('should skip non-existent files', async () => {
      const manager = new AgentsManager(defaultConfig);
      const loader = new MultiLevelLoader(manager);

      const paths: LevelPath[] = [
        {
          level: 'root',
          path: join(testDir, 'AGENTS.md'),
          exists: false,
        },
        {
          level: 'phase',
          path: join(testDir, '.puppet-master', 'agents', 'phase-PH-001.md'),
          exists: false,
        },
      ];

      const result = await loader.loadAll(paths);

      // Should return empty document
      expect(result.overview).toBe('');
      expect(result.codebasePatterns).toHaveLength(0);
    });
  });

  describe('mergeDocs', () => {
    it('should merge with correct priority (later wins)', () => {
      const manager = new AgentsManager(defaultConfig);
      const loader = new MultiLevelLoader(manager);

      const rootDoc: AgentsDocument = {
        overview: 'Root overview',
        architectureNotes: ['Root note'],
        codebasePatterns: ['Root pattern'],
        toolingRules: [],
        commonFailureModes: [],
        doItems: ['Root do'],
        dontItems: [],
        testing: [],
        directoryStructure: [],
      };

      const phaseDoc: AgentsDocument = {
        overview: 'Phase overview',
        architectureNotes: ['Phase note', 'Root note'],
        codebasePatterns: ['Phase pattern'],
        toolingRules: [],
        commonFailureModes: [],
        doItems: ['Phase do'],
        dontItems: [],
        testing: [],
        directoryStructure: [],
      };

      const merged = loader.mergeDocs([rootDoc, phaseDoc]);

      // Overview should be overridden by phase
      expect(merged.overview).toBe('Phase overview');
      // Arrays should be merged with deduplication
      expect(merged.architectureNotes).toContain('Root note');
      expect(merged.architectureNotes).toContain('Phase note');
      expect(merged.codebasePatterns).toContain('Root pattern');
      expect(merged.codebasePatterns).toContain('Phase pattern');
      expect(merged.doItems).toContain('Root do');
      expect(merged.doItems).toContain('Phase do');
    });

    it('should deduplicate array items', () => {
      const manager = new AgentsManager(defaultConfig);
      const loader = new MultiLevelLoader(manager);

      const rootDoc: AgentsDocument = {
        overview: '',
        architectureNotes: ['Note 1', 'Note 2'],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: [],
        dontItems: [],
        testing: [],
        directoryStructure: [],
      };

      const phaseDoc: AgentsDocument = {
        overview: '',
        architectureNotes: ['Note 2', 'Note 3'],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: [],
        dontItems: [],
        testing: [],
        directoryStructure: [],
      };

      const merged = loader.mergeDocs([rootDoc, phaseDoc]);

      // Note 2 should appear only once
      expect(merged.architectureNotes.filter(n => n === 'Note 2').length).toBe(1);
      expect(merged.architectureNotes).toHaveLength(3);
      expect(merged.architectureNotes).toContain('Note 1');
      expect(merged.architectureNotes).toContain('Note 2');
      expect(merged.architectureNotes).toContain('Note 3');
    });

    it('should deep merge failure modes', () => {
      const manager = new AgentsManager(defaultConfig);
      const loader = new MultiLevelLoader(manager);

      const rootDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [
          { description: 'Failure 1', fix: 'Fix 1' },
          { description: 'Failure 2', fix: 'Fix 2' },
        ],
        doItems: [],
        dontItems: [],
        testing: [],
        directoryStructure: [],
      };

      const phaseDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [
          { description: 'Failure 2', fix: 'Fix 2 Override' },
          { description: 'Failure 3', fix: 'Fix 3' },
        ],
        doItems: [],
        dontItems: [],
        testing: [],
        directoryStructure: [],
      };

      const merged = loader.mergeDocs([rootDoc, phaseDoc]);

      expect(merged.commonFailureModes).toHaveLength(3);
      const failure2 = merged.commonFailureModes.find(fm => fm.description === 'Failure 2');
      expect(failure2?.fix).toBe('Fix 2 Override'); // Should be overridden
      expect(merged.commonFailureModes.find(fm => fm.description === 'Failure 1')).toBeDefined();
      expect(merged.commonFailureModes.find(fm => fm.description === 'Failure 3')).toBeDefined();
    });

    it('should deep merge directory structure', () => {
      const manager = new AgentsManager(defaultConfig);
      const loader = new MultiLevelLoader(manager);

      const rootDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: [],
        dontItems: [],
        testing: [],
        directoryStructure: [
          { dir: 'src/', purpose: 'Source code' },
          { dir: 'dist/', purpose: 'Compiled output' },
        ],
      };

      const phaseDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: [],
        dontItems: [],
        testing: [],
        directoryStructure: [
          { dir: 'src/', purpose: 'Source code override' },
          { dir: 'tests/', purpose: 'Test files' },
        ],
      };

      const merged = loader.mergeDocs([rootDoc, phaseDoc]);

      expect(merged.directoryStructure).toHaveLength(3);
      const srcEntry = merged.directoryStructure.find(ds => ds.dir === 'src/');
      expect(srcEntry?.purpose).toBe('Source code override'); // Should be overridden
      expect(merged.directoryStructure.find(ds => ds.dir === 'dist/')).toBeDefined();
      expect(merged.directoryStructure.find(ds => ds.dir === 'tests/')).toBeDefined();
    });

    it('should handle empty document array', () => {
      const manager = new AgentsManager(defaultConfig);
      const loader = new MultiLevelLoader(manager);

      const merged = loader.mergeDocs([]);

      expect(merged.overview).toBe('');
      expect(merged.architectureNotes).toHaveLength(0);
      expect(merged.codebasePatterns).toHaveLength(0);
    });

    it('should handle single document', () => {
      const manager = new AgentsManager(defaultConfig);
      const loader = new MultiLevelLoader(manager);

      const doc: AgentsDocument = {
        overview: 'Test overview',
        architectureNotes: ['Note 1'],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: [],
        dontItems: [],
        testing: [],
        directoryStructure: [],
      };

      const merged = loader.mergeDocs([doc]);

      expect(merged).toEqual(doc);
    });
  });

  describe('loadForTier', () => {
    it('should load and merge files for phase tier', async () => {
      // Create root AGENTS.md
      const rootContent = `# AGENTS.md

## Project Overview
Root overview.

## Codebase Patterns
- Root pattern
`;
      await writeFile(join(testDir, 'AGENTS.md'), rootContent, 'utf-8');

      // Create phase AGENTS.md
      const phaseContent = `# AGENTS.md

## Project Overview
Phase overview.

## Codebase Patterns
- Phase pattern
`;
      await writeFile(
        join(testDir, '.puppet-master', 'agents', 'phase-PH-001.md'),
        phaseContent,
        'utf-8'
      );

      const manager = new AgentsManager(defaultConfig);
      const loader = new MultiLevelLoader(manager);

      const result = await loader.loadForTier('PH-001', testDir);

      expect(result.overview).toContain('Phase overview');
      expect(result.codebasePatterns).toContain('Root pattern');
      expect(result.codebasePatterns).toContain('Phase pattern');
    });

    it('should load and merge files for task tier', async () => {
      // Create root AGENTS.md
      const rootContent = `# AGENTS.md

## Project Overview
Root overview.
`;
      await writeFile(join(testDir, 'AGENTS.md'), rootContent, 'utf-8');

      // Create phase AGENTS.md
      const phaseContent = `# AGENTS.md

## Codebase Patterns
- Phase pattern
`;
      await writeFile(
        join(testDir, '.puppet-master', 'agents', 'phase-PH-001.md'),
        phaseContent,
        'utf-8'
      );

      // Create task AGENTS.md
      const taskContent = `# AGENTS.md

## Codebase Patterns
- Task pattern
`;
      await writeFile(
        join(testDir, '.puppet-master', 'agents', 'task-TK-001-001.md'),
        taskContent,
        'utf-8'
      );

      const manager = new AgentsManager(defaultConfig);
      const loader = new MultiLevelLoader(manager);

      const result = await loader.loadForTier('TK-001-001', testDir);

      expect(result.codebasePatterns).toContain('Phase pattern');
      expect(result.codebasePatterns).toContain('Task pattern');
    });

    it('should handle missing files at various levels', async () => {
      // Only create root file
      const rootContent = `# AGENTS.md

## Project Overview
Root overview.
`;
      await writeFile(join(testDir, 'AGENTS.md'), rootContent, 'utf-8');

      const manager = new AgentsManager(defaultConfig);
      const loader = new MultiLevelLoader(manager);

      const result = await loader.loadForTier('PH-001', testDir);

      // Should still load root
      expect(result.overview).toContain('Root overview');
    });
  });

  describe('integration', () => {
    it('should load and merge complete hierarchy', async () => {
      // Root
      await writeFile(
        join(testDir, 'AGENTS.md'),
        `# AGENTS.md

## Project Overview
Root overview.

## Codebase Patterns
- Root pattern

## DO
- ✅ Root do
`,
        'utf-8'
      );

      // Phase
      await writeFile(
        join(testDir, '.puppet-master', 'agents', 'phase-PH-001.md'),
        `# AGENTS.md

## Project Overview
Phase overview.

## Codebase Patterns
- Phase pattern

## DO
- ✅ Phase do
`,
        'utf-8'
      );

      // Task
      await writeFile(
        join(testDir, '.puppet-master', 'agents', 'task-TK-001-001.md'),
        `# AGENTS.md

## Codebase Patterns
- Task pattern

## DO
- ✅ Task do
`,
        'utf-8'
      );

      const manager = new AgentsManager(defaultConfig);
      const loader = new MultiLevelLoader(manager);

      const result = await loader.loadForTier('TK-001-001', testDir);

      // Overview should be from phase (last one that has it)
      expect(result.overview).toContain('Phase overview');
      // All patterns should be present
      expect(result.codebasePatterns).toContain('Root pattern');
      expect(result.codebasePatterns).toContain('Phase pattern');
      expect(result.codebasePatterns).toContain('Task pattern');
      // All DO items should be present
      expect(result.doItems).toContain('Root do');
      expect(result.doItems).toContain('Phase do');
      expect(result.doItems).toContain('Task do');
    });
  });
});
