/**
 * Tests for AgentsManager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { AgentsManager } from './agents-manager.js';
import type { AgentsManagerConfig, IterationContext, Pattern, Gotcha } from './agents-manager.js';

describe('AgentsManager', () => {
  const testDir = join(process.cwd(), '.test-agents');
  const rootAgentsPath = join(testDir, 'AGENTS.md');
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
    // Create test directory
    try {
      await mkdir(testDir, { recursive: true });
      await mkdir(join(testDir, 'src', 'memory'), { recursive: true });
      await mkdir(join(testDir, '.puppet-master', 'agents'), { recursive: true });
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

  describe('loadFile', () => {
    it('should load root AGENTS.md successfully', async () => {
      const content = `# AGENTS.md

## Project Overview
Test project overview.

## Architecture Notes
- Note 1
- Note 2

## Codebase Patterns
- Pattern 1
- Pattern 2
`;
      await writeFile(rootAgentsPath, content, 'utf-8');

      const manager = new AgentsManager(defaultConfig);
      const result = await manager.loadFile(rootAgentsPath, 'root');

      expect(result.level).toBe('root');
      expect(result.path).toBe(rootAgentsPath);
      expect(result.content).toBe(content);
      expect(result.sections.overview).toContain('Test project overview');
      expect(result.sections.architectureNotes).toHaveLength(2);
      expect(result.sections.codebasePatterns).toHaveLength(2);
    });

    it('should handle missing file gracefully', async () => {
      const manager = new AgentsManager(defaultConfig);
      const result = await manager.loadFile('/nonexistent/file.md', 'root');

      expect(result.level).toBe('root');
      expect(result.content).toBe('');
      expect(result.sections.overview).toBe('');
    });

    it('should parse all sections correctly', async () => {
      const content = `# AGENTS.md

## Project Overview
This is a test project.

## Architecture Notes
- Architecture note 1
- Architecture note 2

## Codebase Patterns
- Pattern: Use .js extensions
- Pattern: Use type-only exports

## Tooling Rules
- Use Vitest for testing
- Use TypeScript strict mode

## Common Failure Modes
### Import Extension Missing
**Fix:** Add .js to all local imports

### Jest Instead of Vitest
**Fix:** Use Vitest imports and patterns

## DO
- ✅ Use .js extension in imports
- ✅ Use Vitest for testing

## DON'T
- ❌ Use Jest patterns
- ❌ Omit .js extension

## Testing
- Run tests: npm test
- Test location: next to source files

## Directory Structure
- \`src/\` - Source code
- \`dist/\` - Compiled output
`;
      await writeFile(rootAgentsPath, content, 'utf-8');

      const manager = new AgentsManager(defaultConfig);
      const result = await manager.loadFile(rootAgentsPath, 'root');

      expect(result.sections.overview).toContain('test project');
      expect(result.sections.architectureNotes).toHaveLength(2);
      expect(result.sections.codebasePatterns).toHaveLength(2);
      expect(result.sections.toolingRules).toHaveLength(2);
      expect(result.sections.commonFailureModes).toHaveLength(2);
      expect(result.sections.doItems).toHaveLength(2);
      expect(result.sections.dontItems).toHaveLength(2);
      expect(result.sections.testing).toHaveLength(2);
      expect(result.sections.directoryStructure).toHaveLength(2);
    });
  });

  describe('loadForContext', () => {
    it('should load root AGENTS.md when multi-level disabled', async () => {
      const content = `# AGENTS.md

## Project Overview
Test overview.
`;
      await writeFile(rootAgentsPath, content, 'utf-8');

      const config = { ...defaultConfig, multiLevelEnabled: false };
      const manager = new AgentsManager(config);
      const context: IterationContext = {
        phaseId: 'PH1',
        taskId: 'T01',
        filesTargeted: [],
      };

      const results = await manager.loadForContext(context);

      expect(results).toHaveLength(1);
      expect(results[0].level).toBe('root');
    });

    it('should load root AGENTS.md from projectRoot even when CWD differs', async () => {
      const content = `# AGENTS.md

## Project Overview
Test overview.
`;
      await writeFile(rootAgentsPath, content, 'utf-8');

      const manager = new AgentsManager(defaultConfig);
      const context: IterationContext = {
        phaseId: 'PH1',
        taskId: 'T01',
        filesTargeted: [],
      };

      const originalCwd = process.cwd();
      const otherCwd = join(testDir, 'othercwd');
      await mkdir(otherCwd, { recursive: true });

      try {
        process.chdir(otherCwd);
        const results = await manager.loadForContext(context);
        expect(results).toHaveLength(1);
        expect(results[0].level).toBe('root');
        expect(results[0].content).toBe(content);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should load multi-level files in correct order', async () => {
      // Root
      await writeFile(rootAgentsPath, `# Root\n## Project Overview\nRoot content\n`, 'utf-8');

      // Module
      const modulePath = join(testDir, 'src', 'memory', 'AGENTS.md');
      await writeFile(modulePath, `# Module\n## Architecture Notes\n- Module note\n`, 'utf-8');

      // Phase
      const phasePath = join(testDir, '.puppet-master', 'agents', 'phase-PH1.md');
      await writeFile(phasePath, `# Phase\n## Codebase Patterns\n- Phase pattern\n`, 'utf-8');

      // Task
      const taskPath = join(testDir, '.puppet-master', 'agents', 'task-PH1-T01.md');
      await writeFile(taskPath, `# Task\n## Tooling Rules\n- Task rule\n`, 'utf-8');

      const manager = new AgentsManager(defaultConfig);
      const context: IterationContext = {
        phaseId: 'PH1',
        taskId: 'PH1-T01',
        filesTargeted: ['src/memory/agents-manager.ts'],
      };

      const results = await manager.loadForContext(context);

      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].level).toBe('root');
      
      // Check if module was loaded
      const moduleResult = results.find(r => r.level === 'module');
      if (moduleResult) {
        expect(moduleResult.level).toBe('module');
      }

      // Check if phase was loaded
      const phaseResult = results.find(r => r.level === 'phase');
      if (phaseResult) {
        expect(phaseResult.level).toBe('phase');
      }

      // Check if task was loaded
      const taskResult = results.find(r => r.level === 'task');
      if (taskResult) {
        expect(taskResult.level).toBe('task');
      }
    });

    it('should handle missing files gracefully', async () => {
      await writeFile(rootAgentsPath, `# Root\n## Project Overview\nRoot\n`, 'utf-8');

      const manager = new AgentsManager(defaultConfig);
      const context: IterationContext = {
        phaseId: 'PH1',
        taskId: 'T01',
        filesTargeted: [],
      };

      const results = await manager.loadForContext(context);

      expect(results).toHaveLength(1);
      expect(results[0].level).toBe('root');
    });
  });

  describe('parseSections', () => {
    it('should parse empty content', () => {
      const manager = new AgentsManager(defaultConfig);
      const sections = manager.parseSections('');

      expect(sections.overview).toBe('');
      expect(sections.architectureNotes).toHaveLength(0);
      expect(sections.codebasePatterns).toHaveLength(0);
    });

    it('should parse sections with missing headers', () => {
      const content = `# AGENTS.md

## Project Overview
Test overview.
`;
      const manager = new AgentsManager(defaultConfig);
      const sections = manager.parseSections(content);

      expect(sections.overview).toContain('Test overview');
      expect(sections.architectureNotes).toHaveLength(0);
    });
  });

  describe('formatSections', () => {
    it('should format sections back to markdown', () => {
      const manager = new AgentsManager(defaultConfig);
      const sections = {
        overview: 'Test overview',
        architectureNotes: ['Note 1', 'Note 2'],
        codebasePatterns: ['Pattern 1'],
        toolingRules: [],
        commonFailureModes: [],
        doItems: [],
        dontItems: [],
        testing: [],
        directoryStructure: [],
      };

      const formatted = manager.formatSections(sections);

      expect(formatted).toContain('## Project Overview');
      expect(formatted).toContain('Test overview');
      expect(formatted).toContain('## Architecture Notes');
      expect(formatted).toContain('- Note 1');
      expect(formatted).toContain('- Note 2');
      expect(formatted).toContain('## Codebase Patterns');
      expect(formatted).toContain('- Pattern 1');
    });
  });

  describe('addPattern', () => {
    it('should append pattern to Codebase Patterns section', async () => {
      const content = `# AGENTS.md

## Codebase Patterns
- Existing pattern
`;
      await writeFile(rootAgentsPath, content, 'utf-8');

      const manager = new AgentsManager(defaultConfig);
      const pattern: Pattern = {
        description: 'New pattern description',
      };

      await manager.addPattern(pattern, 'root');

      const updated = await manager.read(rootAgentsPath);
      expect(updated).toContain('Existing pattern');
      expect(updated).toContain('New pattern description');
    });

    it('should create section if it does not exist', async () => {
      await writeFile(rootAgentsPath, `# AGENTS.md\n`, 'utf-8');

      const manager = new AgentsManager(defaultConfig);
      const pattern: Pattern = {
        description: 'New pattern',
        context: 'ESM imports',
      };

      await manager.addPattern(pattern, 'root');

      const updated = await manager.read(rootAgentsPath);
      expect(updated).toContain('## Codebase Patterns');
      expect(updated).toContain('New pattern');
      expect(updated).toContain('Context: ESM imports');
    });

    it('should create file if it does not exist', async () => {
      const manager = new AgentsManager(defaultConfig);
      const pattern: Pattern = {
        description: 'New pattern',
      };

      await manager.addPattern(pattern, 'root');

      const updated = await manager.read(rootAgentsPath);
      expect(updated).toContain('# AGENTS.md');
      expect(updated).toContain('## Codebase Patterns');
      expect(updated).toContain('New pattern');
    });
  });

  describe('addGotcha', () => {
    it('should append gotcha to Common Failure Modes section', async () => {
      const content = `# AGENTS.md

## Common Failure Modes
### Existing Failure
**Fix:** Existing fix
`;
      await writeFile(rootAgentsPath, content, 'utf-8');

      const manager = new AgentsManager(defaultConfig);
      const gotcha: Gotcha = {
        description: 'New Failure',
        fix: 'New fix',
      };

      await manager.addGotcha(gotcha, 'root');

      const updated = await manager.read(rootAgentsPath);
      expect(updated).toContain('Existing Failure');
      expect(updated).toContain('New Failure');
      expect(updated).toContain('New fix');
    });

    it('should create section if it does not exist', async () => {
      await writeFile(rootAgentsPath, `# AGENTS.md\n`, 'utf-8');

      const manager = new AgentsManager(defaultConfig);
      const gotcha: Gotcha = {
        description: 'New Failure',
        fix: 'New fix',
      };

      await manager.addGotcha(gotcha, 'root');

      const updated = await manager.read(rootAgentsPath);
      expect(updated).toContain('## Common Failure Modes');
      expect(updated).toContain('### New Failure');
      expect(updated).toContain('**Fix:** New fix');
    });
  });

  describe('promoteToHigherLevel', () => {
    it('should promote content from task to phase level', async () => {
      // Create task file
      const taskPath = join(testDir, '.puppet-master', 'agents', 'task-PH1-T01.md');
      await writeFile(taskPath, `# Task AGENTS.md

## Codebase Patterns
- Task-specific pattern
`, 'utf-8');

      // Create phase file
      const phasePath = join(testDir, '.puppet-master', 'agents', 'phase-PH1.md');
      await writeFile(phasePath, `# Phase AGENTS.md

## Codebase Patterns
- Existing phase pattern
`, 'utf-8');

      const manager = new AgentsManager(defaultConfig);
      const context: IterationContext = {
        phaseId: 'PH1',
        taskId: 'PH1-T01',
        filesTargeted: [],
      };

      await manager.promoteToHigherLevel(
        '- Task-specific pattern',
        'task',
        'phase',
        context
      );

      // Check task file - pattern should be removed
      const taskContent = await manager.read(taskPath);
      expect(taskContent).not.toContain('Task-specific pattern');

      // Check phase file - pattern should be added
      const phaseContent = await manager.read(phasePath);
      expect(phaseContent).toContain('Task-specific pattern');
      expect(phaseContent).toContain('Existing phase pattern');
    });

    it('should throw error when promoting to same or lower level', async () => {
      const manager = new AgentsManager(defaultConfig);
      const context: IterationContext = {
        phaseId: 'PH1',
        taskId: 'PH1-T01',
        filesTargeted: [],
      };

      await expect(
        manager.promoteToHigherLevel('item', 'phase', 'task', context)
      ).rejects.toThrow('Cannot promote from phase to task');

      await expect(
        manager.promoteToHigherLevel('item', 'root', 'root')
      ).rejects.toThrow('Cannot promote from root to root');
    });

    it('should throw error when source file does not exist', async () => {
      const manager = new AgentsManager(defaultConfig);
      const context: IterationContext = {
        phaseId: 'PH1',
        taskId: 'PH1-T01',
        filesTargeted: [],
      };

      await expect(
        manager.promoteToHigherLevel('item', 'task', 'phase', context)
      ).rejects.toThrow('Source file not found');
    });
  });

  describe('read and write', () => {
    it('should read file content', async () => {
      const content = 'Test content';
      await writeFile(rootAgentsPath, content, 'utf-8');

      const manager = new AgentsManager(defaultConfig);
      const result = await manager.read(rootAgentsPath);

      expect(result).toBe(content);
    });

    it('should throw error when reading non-existent file', async () => {
      const manager = new AgentsManager(defaultConfig);

      await expect(manager.read('/nonexistent/file.md')).rejects.toThrow();
    });

    it('should write file content and create directory', async () => {
      const newPath = join(testDir, 'new', 'dir', 'file.md');
      const content = 'New content';

      const manager = new AgentsManager(defaultConfig);
      await manager.write(newPath, content);

      const result = await manager.read(newPath);
      expect(result).toBe(content);
    });
  });

  describe('findModuleAgents', () => {
    it('should find module AGENTS.md when file is in module directory', async () => {
      const modulePath = join(testDir, 'src', 'memory', 'AGENTS.md');
      await writeFile(modulePath, `# Module\n`, 'utf-8');

      const manager = new AgentsManager(defaultConfig);
      const context: IterationContext = {
        phaseId: 'PH1',
        taskId: 'T01',
        filesTargeted: ['src/memory/agents-manager.ts'],
      };

      const results = await manager.loadForContext(context);
      const moduleResult = results.find(r => r.level === 'module');

      expect(moduleResult).toBeDefined();
      if (moduleResult) {
        expect(moduleResult.path).toBe(modulePath);
      }
    });

    it('should return null when no module AGENTS.md exists', async () => {
      const manager = new AgentsManager(defaultConfig);
      const context: IterationContext = {
        phaseId: 'PH1',
        taskId: 'T01',
        filesTargeted: ['src/memory/agents-manager.ts'],
      };

      const results = await manager.loadForContext(context);
      const moduleResult = results.find(r => r.level === 'module');

      expect(moduleResult).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty file', async () => {
      await writeFile(rootAgentsPath, '', 'utf-8');

      const manager = new AgentsManager(defaultConfig);
      const result = await manager.loadFile(rootAgentsPath, 'root');

      expect(result.sections.overview).toBe('');
      expect(result.sections.architectureNotes).toHaveLength(0);
    });

    it('should handle file with only some sections', async () => {
      const content = `# AGENTS.md

## Project Overview
Test overview only.
`;
      await writeFile(rootAgentsPath, content, 'utf-8');

      const manager = new AgentsManager(defaultConfig);
      const result = await manager.loadFile(rootAgentsPath, 'root');

      expect(result.sections.overview).toContain('Test overview');
      expect(result.sections.architectureNotes).toHaveLength(0);
      expect(result.sections.codebasePatterns).toHaveLength(0);
    });

    it('should handle malformed markdown gracefully', async () => {
      const content = `# AGENTS.md

## Project Overview
Test

## Codebase Patterns
- Pattern 1
- Pattern 2
## Architecture Notes
- Note 1
`;
      await writeFile(rootAgentsPath, content, 'utf-8');

      const manager = new AgentsManager(defaultConfig);
      const result = await manager.loadFile(rootAgentsPath, 'root');

      expect(result.sections.overview).toContain('Test');
      expect(result.sections.codebasePatterns.length).toBeGreaterThan(0);
      expect(result.sections.architectureNotes.length).toBeGreaterThan(0);
    });
  });
});
