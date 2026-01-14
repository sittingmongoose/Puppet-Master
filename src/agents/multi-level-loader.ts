/**
 * MultiLevelLoader class for loading and merging AGENTS.md files from multiple hierarchy levels
 * 
 * Handles loading AGENTS.md files from root, module, phase, and task levels,
 * and merges them with proper priority (later levels override earlier ones).
 */

import { resolve } from 'path';
import { access } from 'fs/promises';
import type { AgentsManager, AgentsLevel, ParsedSections } from '../memory/agents-manager.js';

/**
 * Path information for a specific level
 */
export interface LevelPath {
  level: AgentsLevel;
  path: string;
  exists: boolean;
}

/**
 * Merged AGENTS.md document structure
 * This represents the combined result of multiple AGENTS.md files
 */
export interface AgentsDocument {
  overview: string;
  architectureNotes: string[];
  codebasePatterns: string[];
  toolingRules: string[];
  commonFailureModes: { description: string; fix: string }[];
  doItems: string[];
  dontItems: string[];
  testing: string[];
  directoryStructure: { dir: string; purpose: string }[];
}

/**
 * Tier ID parsing result
 */
interface ParsedTierId {
  type: 'phase' | 'task' | 'subtask' | 'iteration';
  phaseId?: string;
  taskId?: string;
  subtaskId?: string;
  iterationId?: string;
}

/**
 * MultiLevelLoader class for loading and merging multi-level AGENTS.md files
 */
export class MultiLevelLoader {
  private readonly agentsManager: AgentsManager;

  /**
   * Create a new MultiLevelLoader instance
   * @param agentsManager - AgentsManager instance for loading files
   */
  constructor(agentsManager: AgentsManager) {
    this.agentsManager = agentsManager;
  }

  /**
   * Load and merge AGENTS.md files from multiple paths
   * @param paths - Array of LevelPath objects to load
   * @returns Merged AgentsDocument
   */
  async loadAll(paths: LevelPath[]): Promise<AgentsDocument> {
    const docs: AgentsDocument[] = [];

    // Check file existence for all paths
    const pathsWithExistence: LevelPath[] = [];
    for (const path of paths) {
      const exists = await this.checkExists(path.path);
      pathsWithExistence.push({ ...path, exists });
    }

    // Load files in priority order (root, module, phase, task)
    const priorityOrder: AgentsLevel[] = ['root', 'module', 'phase', 'task'];
    const sortedPaths = pathsWithExistence
      .filter(p => p.exists)
      .sort((a, b) => {
        const aIndex = priorityOrder.indexOf(a.level);
        const bIndex = priorityOrder.indexOf(b.level);
        return aIndex - bIndex;
      });

    for (const levelPath of sortedPaths) {
      try {
        const content = await this.agentsManager.loadFile(levelPath.path, levelPath.level);
        const doc = this.contentToDocument(content.sections);
        docs.push(doc);
      } catch (error) {
        // Skip files that fail to load
        continue;
      }
    }

    return this.mergeDocs(docs);
  }

  /**
   * Load AGENTS.md files for a specific tier
   * @param tierId - Tier ID (e.g., "PH-001", "TK-001-001", "ST-001-001-001")
   * @param rootDir - Root directory for path resolution
   * @returns Merged AgentsDocument
   */
  async loadForTier(tierId: string, rootDir: string): Promise<AgentsDocument> {
    const paths = this.resolvePaths(tierId, rootDir);
    return this.loadAll(paths);
  }

  /**
   * Merge multiple AgentsDocument objects with priority (later wins)
   * @param docs - Array of documents to merge (in priority order)
   * @returns Merged document
   */
  mergeDocs(docs: AgentsDocument[]): AgentsDocument {
    if (docs.length === 0) {
      return this.createEmptyDocument();
    }

    if (docs.length === 1) {
      return docs[0]!;
    }

    // Start with first document (root)
    let merged = { ...docs[0]! };

    // Merge remaining documents (later overrides earlier)
    for (let i = 1; i < docs.length; i++) {
      merged = this.deepMerge(merged, docs[i]!);
    }

    return merged;
  }

  /**
   * Resolve all possible AGENTS.md paths for a tier ID
   * @param tierId - Tier ID to resolve paths for
   * @param rootDir - Root directory for path resolution
   * @returns Array of LevelPath objects
   */
  resolvePaths(tierId: string, rootDir: string): LevelPath[] {
    const paths: LevelPath[] = [];
    const parsed = this.parseTierId(tierId);

    // Root: Check both ./AGENTS.md and ./.puppet-master/AGENTS.md
    const rootPath1 = resolve(rootDir, 'AGENTS.md');
    const rootPath2 = resolve(rootDir, '.puppet-master', 'AGENTS.md');
    paths.push({
      level: 'root',
      path: rootPath1,
      exists: false, // Will be checked asynchronously
    });
    // Only add second root path if different
    if (rootPath1 !== rootPath2) {
      paths.push({
        level: 'root',
        path: rootPath2,
        exists: false,
      });
    }

    // Module: Cannot resolve without file context, skip for now
    // (Would need IterationContext with filesTargeted)

    // Phase: ./.puppet-master/agents/phase-{phase-id}.md
    if (parsed.phaseId) {
      paths.push({
        level: 'phase',
        path: resolve(rootDir, '.puppet-master', 'agents', `phase-${parsed.phaseId}.md`),
        exists: false,
      });
    }

    // Task: ./.puppet-master/agents/task-{task-id}.md
    if (parsed.taskId) {
      paths.push({
        level: 'task',
        path: resolve(rootDir, '.puppet-master', 'agents', `task-${parsed.taskId}.md`),
        exists: false,
      });
    }

    // Subtask: ./.puppet-master/agents/subtask-{subtask-id}.md
    if (parsed.subtaskId) {
      paths.push({
        level: 'task', // Subtask uses 'task' level in AgentsLevel type
        path: resolve(rootDir, '.puppet-master', 'agents', `subtask-${parsed.subtaskId}.md`),
        exists: false,
      });
    }

    // Iteration: ./.puppet-master/agents/iteration-{iteration-id}.md
    if (parsed.iterationId) {
      paths.push({
        level: 'task', // Iteration uses 'task' level in AgentsLevel type
        path: resolve(rootDir, '.puppet-master', 'agents', `iteration-${parsed.iterationId}.md`),
        exists: false,
      });
    }

    // Check file existence (synchronously for now, but will be async in loadAll)
    // We'll check existence in loadAll when actually loading
    return paths;
  }

  /**
   * Parse tier ID to extract component IDs
   * @param tierId - Tier ID string (e.g., "PH-001", "TK-001-001", "ST-001-001-001", "IT-001-001-001-001")
   * @returns Parsed tier ID information
   */
  private parseTierId(tierId: string): ParsedTierId {
    // Phase: PH-001
    if (tierId.startsWith('PH-')) {
      const phaseId = tierId; // Keep full ID
      return { type: 'phase', phaseId };
    }

    // Task: TK-001-001
    if (tierId.startsWith('TK-')) {
      const parts = tierId.substring(3).split('-');
      const phaseId = `PH-${parts[0]}`;
      const taskId = tierId; // Keep full ID
      return { type: 'task', phaseId, taskId };
    }

    // Subtask: ST-001-001-001
    if (tierId.startsWith('ST-')) {
      const parts = tierId.substring(3).split('-');
      const phaseId = `PH-${parts[0]}`;
      const taskId = `TK-${parts.slice(0, 2).join('-')}`;
      const subtaskId = tierId; // Keep full ID
      return { type: 'subtask', phaseId, taskId, subtaskId };
    }

    // Iteration: IT-001-001-001-001
    if (tierId.startsWith('IT-')) {
      const parts = tierId.substring(3).split('-');
      const phaseId = `PH-${parts[0]}`;
      const taskId = `TK-${parts.slice(0, 2).join('-')}`;
      const subtaskId = `ST-${parts.slice(0, 3).join('-')}`;
      const iterationId = tierId; // Keep full ID
      return { type: 'iteration', phaseId, taskId, subtaskId, iterationId };
    }

    // Unknown format, return empty
    return { type: 'phase' };
  }

  /**
   * Convert ParsedSections to AgentsDocument
   * @param sections - Parsed sections from AgentsManager
   * @returns AgentsDocument
   */
  private contentToDocument(sections: ParsedSections): AgentsDocument {
    return {
      overview: sections.overview,
      architectureNotes: [...sections.architectureNotes],
      codebasePatterns: [...sections.codebasePatterns],
      toolingRules: [...sections.toolingRules],
      commonFailureModes: [...sections.commonFailureModes],
      doItems: [...sections.doItems],
      dontItems: [...sections.dontItems],
      testing: [...sections.testing],
      directoryStructure: [...sections.directoryStructure],
    };
  }

  /**
   * Create an empty AgentsDocument
   * @returns Empty document
   */
  private createEmptyDocument(): AgentsDocument {
    return {
      overview: '',
      architectureNotes: [],
      codebasePatterns: [],
      toolingRules: [],
      commonFailureModes: [],
      doItems: [],
      dontItems: [],
      testing: [],
      directoryStructure: [],
    };
  }

  /**
   * Deep merge two AgentsDocument objects (later overrides earlier)
   * @param base - Base document (earlier)
   * @param override - Override document (later)
   * @returns Merged document
   */
  private deepMerge(base: AgentsDocument, override: AgentsDocument): AgentsDocument {
    return {
      // Strings: later replaces earlier
      overview: override.overview || base.overview,

      // Arrays: concatenate with deduplication
      architectureNotes: this.mergeArrays(base.architectureNotes, override.architectureNotes),
      codebasePatterns: this.mergeArrays(base.codebasePatterns, override.codebasePatterns),
      toolingRules: this.mergeArrays(base.toolingRules, override.toolingRules),
      doItems: this.mergeArrays(base.doItems, override.doItems),
      dontItems: this.mergeArrays(base.dontItems, override.dontItems),
      testing: this.mergeArrays(base.testing, override.testing),

      // Objects: deep merge (for commonFailureModes and directoryStructure)
      commonFailureModes: this.mergeFailureModes(
        base.commonFailureModes,
        override.commonFailureModes
      ),
      directoryStructure: this.mergeDirectoryStructure(
        base.directoryStructure,
        override.directoryStructure
      ),
    };
  }

  /**
   * Merge two arrays with deduplication
   * @param base - Base array
   * @param override - Override array
   * @returns Merged array with duplicates removed
   */
  private mergeArrays(base: string[], override: string[]): string[] {
    const merged = [...base];
    const seen = new Set(base.map(item => item.trim().toLowerCase()));

    for (const item of override) {
      const normalized = item.trim().toLowerCase();
      if (!seen.has(normalized)) {
        merged.push(item);
        seen.add(normalized);
      }
    }

    return merged;
  }

  /**
   * Merge failure modes arrays (deep merge for objects)
   * @param base - Base array
   * @param override - Override array
   * @returns Merged array
   */
  private mergeFailureModes(
    base: { description: string; fix: string }[],
    override: { description: string; fix: string }[]
  ): { description: string; fix: string }[] {
    const merged = [...base];
    const seen = new Set(base.map(fm => fm.description.trim().toLowerCase()));

    for (const fm of override) {
      const normalized = fm.description.trim().toLowerCase();
      if (seen.has(normalized)) {
        // Replace existing with override
        const index = merged.findIndex(
          m => m.description.trim().toLowerCase() === normalized
        );
        if (index >= 0) {
          merged[index] = { ...fm };
        }
      } else {
        merged.push({ ...fm });
        seen.add(normalized);
      }
    }

    return merged;
  }

  /**
   * Merge directory structure arrays (deep merge for objects)
   * @param base - Base array
   * @param override - Override array
   * @returns Merged array
   */
  private mergeDirectoryStructure(
    base: { dir: string; purpose: string }[],
    override: { dir: string; purpose: string }[]
  ): { dir: string; purpose: string }[] {
    const merged = [...base];
    const seen = new Set(base.map(ds => ds.dir.trim().toLowerCase()));

    for (const ds of override) {
      const normalized = ds.dir.trim().toLowerCase();
      if (seen.has(normalized)) {
        // Replace existing with override
        const index = merged.findIndex(m => m.dir.trim().toLowerCase() === normalized);
        if (index >= 0) {
          merged[index] = { ...ds };
        }
      } else {
        merged.push({ ...ds });
        seen.add(normalized);
      }
    }

    return merged;
  }

  /**
   * Check if a file exists (async)
   * @param path - File path to check
   * @returns True if file exists
   */
  private async checkExists(path: string): Promise<boolean> {
    try {
      await access(path);
      return true;
    } catch {
      return false;
    }
  }
}
