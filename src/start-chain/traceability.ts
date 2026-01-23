/**
 * Traceability utilities for RWM Puppet Master
 * 
 * Provides query utilities to map between requirements and PRD items.
 * Enables queries like "Which PRD items cover Requirement 4.2?" and
 * "Which requirements are currently uncovered?"
 */

import type { ParsedRequirements, ParsedSection } from '../types/requirements.js';
import type { PRD, Phase, Task, Subtask } from '../types/prd.js';

/**
 * Traceability matrix interface.
 * Provides bidirectional mapping between requirements and PRD items.
 */
export interface TraceabilityMatrix {
  /** Maps requirement section path to array of PRD item IDs that cover it */
  requirementToPrdItems: Record<string, string[]>;
  /** Maps PRD item ID to array of requirement section paths it covers */
  prdItemToRequirements: Record<string, string[]>;
  /** Maps requirement section path to excerpt hash */
  excerptHashes: Record<string, string>;
  /** Timestamp when matrix was generated */
  timestamp: string;
}

/**
 * Traceability manager for querying and building traceability matrices.
 */
export class TraceabilityManager {
  /**
   * Gets all PRD items (phases, tasks, subtasks) that cover a specific requirement section.
   * 
   * @param sectionPath - The requirement section path to search for (e.g., "Requirements > Section 4.2")
   * @param prd - The PRD to search in
   * @returns Array of PRD items that reference this requirement section
   * @throws Error if sectionPath is empty or prd is invalid
   */
  getPrdItemsForRequirement(sectionPath: string, prd: PRD): Array<Phase | Task | Subtask> {
    if (!sectionPath || sectionPath.trim().length === 0) {
      throw new Error('sectionPath cannot be empty');
    }
    if (!prd || !Array.isArray(prd.phases)) {
      throw new Error('Invalid PRD: missing phases array');
    }

    const results: Array<Phase | Task | Subtask> = [];

    for (const phase of prd.phases) {
      // Check phase
      if (this.hasSourceRef(phase.sourceRefs, sectionPath)) {
        results.push(phase);
      }

      // Check tasks
      if (Array.isArray(phase.tasks)) {
        for (const task of phase.tasks) {
          if (this.hasSourceRef(task.sourceRefs, sectionPath)) {
            results.push(task);
          }

          // Check subtasks
          if (Array.isArray(task.subtasks)) {
            for (const subtask of task.subtasks) {
              if (this.hasSourceRef(subtask.sourceRefs, sectionPath)) {
                results.push(subtask);
              }
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Gets all requirement sections that are not covered by any PRD item.
   * 
   * @param parsed - The parsed requirements document
   * @param prd - The PRD to check coverage against
   * @returns Array of uncovered section paths
   * @throws Error if parsed or prd is invalid
   */
  getUncoveredRequirements(parsed: ParsedRequirements, prd: PRD): string[] {
    if (!parsed || !Array.isArray(parsed.sections)) {
      throw new Error('Invalid parsed requirements: missing sections array');
    }
    if (!prd || !Array.isArray(prd.phases)) {
      throw new Error('Invalid PRD: missing phases array');
    }

    const coveredPaths = new Set<string>();

    // Collect all covered section paths from PRD
    for (const phase of prd.phases) {
      this.collectSourceRefs(phase.sourceRefs, coveredPaths);
      if (Array.isArray(phase.tasks)) {
        for (const task of phase.tasks) {
          this.collectSourceRefs(task.sourceRefs, coveredPaths);
          if (Array.isArray(task.subtasks)) {
            for (const subtask of task.subtasks) {
              this.collectSourceRefs(subtask.sourceRefs, coveredPaths);
            }
          }
        }
      }
    }

    // Walk all sections in requirements and find uncovered ones
    const uncovered: string[] = [];
    this.walkSections(parsed.sections, parsed.title || '', coveredPaths, uncovered);

    return uncovered;
  }

  /**
   * Builds a complete traceability matrix from requirements and PRD.
   * 
   * @param parsed - The parsed requirements document
   * @param prd - The PRD to build matrix from
   * @returns Complete traceability matrix
   * @throws Error if parsed or prd is invalid
   */
  buildTraceabilityMatrix(parsed: ParsedRequirements, prd: PRD): TraceabilityMatrix {
    if (!parsed) {
      throw new Error('Invalid parsed requirements: cannot be null or undefined');
    }
    if (!prd || !Array.isArray(prd.phases)) {
      throw new Error('Invalid PRD: missing phases array');
    }

    const requirementToPrdItems: Record<string, string[]> = {};
    const prdItemToRequirements: Record<string, string[]> = {};
    const excerptHashes: Record<string, string> = {};

    // Walk all PRD items and build mappings
    for (const phase of prd.phases) {
      if (!phase.id) {
        console.warn(`[Traceability] Skipping phase without ID`);
        continue;
      }
      this.processPrdItem(phase.id, phase.sourceRefs, requirementToPrdItems, prdItemToRequirements, excerptHashes);

      if (Array.isArray(phase.tasks)) {
        for (const task of phase.tasks) {
          if (!task.id) {
            console.warn(`[Traceability] Skipping task without ID in phase ${phase.id}`);
            continue;
          }
          this.processPrdItem(task.id, task.sourceRefs, requirementToPrdItems, prdItemToRequirements, excerptHashes);

          if (Array.isArray(task.subtasks)) {
            for (const subtask of task.subtasks) {
              if (!subtask.id) {
                console.warn(`[Traceability] Skipping subtask without ID in task ${task.id}`);
                continue;
              }
              this.processPrdItem(subtask.id, subtask.sourceRefs, requirementToPrdItems, prdItemToRequirements, excerptHashes);
            }
          }
        }
      }
    }

    return {
      requirementToPrdItems,
      prdItemToRequirements,
      excerptHashes,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Checks if a sourceRefs array contains a reference to the given section path.
   * 
   * @param sourceRefs - Optional array of source references
   * @param sectionPath - Section path to search for
   * @returns True if section path is found
   */
  private hasSourceRef(sourceRefs: Phase['sourceRefs'], sectionPath: string): boolean {
    if (!sourceRefs || sourceRefs.length === 0) {
      return false;
    }
    return sourceRefs.some(ref => ref.sectionPath === sectionPath);
  }

  /**
   * Collects all section paths from sourceRefs into a set.
   * 
   * @param sourceRefs - Optional array of source references
   * @param paths - Set to collect paths into
   */
  private collectSourceRefs(sourceRefs: Phase['sourceRefs'], paths: Set<string>): void {
    if (!sourceRefs || !Array.isArray(sourceRefs)) {
      return;
    }
    for (const ref of sourceRefs) {
      if (ref && ref.sectionPath && typeof ref.sectionPath === 'string') {
        paths.add(ref.sectionPath);
      }
    }
  }

  /**
   * Processes a PRD item's sourceRefs and updates the traceability matrix.
   * 
   * @param prdItemId - The PRD item ID
   * @param sourceRefs - Optional array of source references
   * @param requirementToPrdItems - Map to update: requirement → PRD items
   * @param prdItemToRequirements - Map to update: PRD item → requirements
   * @param excerptHashes - Map to update: requirement → hash
   */
  private processPrdItem(
    prdItemId: string,
    sourceRefs: Phase['sourceRefs'],
    requirementToPrdItems: Record<string, string[]>,
    prdItemToRequirements: Record<string, string[]>,
    excerptHashes: Record<string, string>
  ): void {
    if (!sourceRefs || !Array.isArray(sourceRefs) || sourceRefs.length === 0) {
      return;
    }

    if (!prdItemId || typeof prdItemId !== 'string') {
      console.warn(`[Traceability] Skipping PRD item with invalid ID: ${prdItemId}`);
      return;
    }

    const requirements: string[] = [];

    for (const ref of sourceRefs) {
      if (!ref || typeof ref !== 'object') {
        console.warn(`[Traceability] Skipping invalid sourceRef in PRD item ${prdItemId}`);
        continue;
      }

      const sectionPath = ref.sectionPath;
      if (!sectionPath || typeof sectionPath !== 'string' || sectionPath.trim().length === 0) {
        console.warn(`[Traceability] Skipping sourceRef with invalid sectionPath in PRD item ${prdItemId}`);
        continue;
      }

      // Add to requirement → PRD items mapping
      if (!requirementToPrdItems[sectionPath]) {
        requirementToPrdItems[sectionPath] = [];
      }
      if (!requirementToPrdItems[sectionPath].includes(prdItemId)) {
        requirementToPrdItems[sectionPath].push(prdItemId);
      }

      // Add to PRD item → requirements mapping
      requirements.push(sectionPath);

      // Store excerpt hash
      if (ref.excerptHash && typeof ref.excerptHash === 'string') {
        excerptHashes[sectionPath] = ref.excerptHash;
      }
    }

    // Store PRD item → requirements mapping
    if (requirements.length > 0) {
      prdItemToRequirements[prdItemId] = requirements;
    }
  }

  /**
   * Recursively walks sections and collects uncovered paths.
   * 
   * @param sections - Sections to walk
   * @param pathPrefix - Current path prefix (e.g., "Requirements")
   * @param coveredPaths - Set of covered section paths
   * @param uncovered - Array to collect uncovered paths into
   */
  private walkSections(
    sections: ParsedSection[],
    pathPrefix: string,
    coveredPaths: Set<string>,
    uncovered: string[]
  ): void {
    for (const section of sections) {
      const sectionPath = pathPrefix ? `${pathPrefix} > ${section.title}` : section.title;

      // Check if this section is covered
      if (!coveredPaths.has(sectionPath)) {
        uncovered.push(sectionPath);
      }

      // Recursively walk children
      if (section.children.length > 0) {
        this.walkSections(section.children, sectionPath, coveredPaths, uncovered);
      }
    }
  }
}
