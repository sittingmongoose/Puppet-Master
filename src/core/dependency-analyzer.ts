/**
 * DependencyAnalyzer for RWM Puppet Master
 *
 * Analyzes subtask dependencies and builds execution levels for parallel execution.
 * Uses topological sorting to determine which subtasks can run in parallel.
 *
 * See BUILD_QUEUE_IMPROVEMENTS.md P2-T01 for requirements.
 */

import type { TierNode } from './tier-node.js';

/**
 * Represents a node in the dependency graph
 */
export interface DependencyNode {
  /** Subtask ID */
  id: string;
  /** TierNode reference */
  node: TierNode;
  /** IDs of subtasks this depends on */
  dependsOn: string[];
  /** IDs of subtasks that depend on this */
  dependedBy: string[];
  /** Execution level (0 = can run first, 1 = after level 0, etc.) */
  level: number;
}

/**
 * Represents the full dependency graph
 */
export interface DependencyGraph {
  /** All nodes indexed by ID */
  nodes: Map<string, DependencyNode>;
  /** Nodes grouped by execution level */
  levels: TierNode[][];
  /** Whether the graph has any dependencies */
  hasDependencies: boolean;
  /** Whether cycles were detected (invalid state) */
  hasCycles: boolean;
  /** Cycle path if cycles detected */
  cyclePath?: string[];
}

/**
 * Error thrown when a cycle is detected in dependencies
 */
export class DependencyCycleError extends Error {
  constructor(
    public readonly cyclePath: string[],
    message?: string
  ) {
    super(message || `Dependency cycle detected: ${cyclePath.join(' -> ')}`);
    this.name = 'DependencyCycleError';
  }
}

/**
 * Error thrown when a dependency references a non-existent subtask
 */
export class InvalidDependencyError extends Error {
  constructor(
    public readonly subtaskId: string,
    public readonly invalidDependency: string,
    message?: string
  ) {
    super(message || `Subtask ${subtaskId} depends on non-existent subtask: ${invalidDependency}`);
    this.name = 'InvalidDependencyError';
  }
}

/**
 * Builds a dependency graph from a list of subtask TierNodes
 * @param subtasks - Array of subtask TierNodes
 * @returns DependencyGraph with execution levels
 * @throws DependencyCycleError if circular dependencies are detected
 * @throws InvalidDependencyError if a dependency references a non-existent subtask
 */
export function buildDependencyGraph(subtasks: TierNode[]): DependencyGraph {
  const nodes = new Map<string, DependencyNode>();
  
  // Phase 1: Create nodes for all subtasks
  for (const subtask of subtasks) {
    const dependsOn = subtask.data.plan?.dependsOn || [];
    nodes.set(subtask.id, {
      id: subtask.id,
      node: subtask,
      dependsOn: [...dependsOn],
      dependedBy: [],
      level: -1, // Will be computed
    });
  }

  // Phase 2: Build reverse dependency links and validate
  for (const [id, depNode] of nodes) {
    for (const depId of depNode.dependsOn) {
      const dependency = nodes.get(depId);
      if (!dependency) {
        throw new InvalidDependencyError(id, depId);
      }
      dependency.dependedBy.push(id);
    }
  }

  // Phase 3: Detect cycles and compute levels using Kahn's algorithm
  const { levels, hasCycles, cyclePath } = computeLevels(nodes);

  if (hasCycles) {
    throw new DependencyCycleError(cyclePath || []);
  }

  // Convert levels from IDs to TierNodes
  const levelNodes: TierNode[][] = levels.map(level =>
    level.map(id => nodes.get(id)!.node)
  );

  const hasDependencies = subtasks.some(s => {
    const deps = s.data.plan?.dependsOn;
    return deps && deps.length > 0;
  });

  return {
    nodes,
    levels: levelNodes,
    hasDependencies,
    hasCycles: false,
  };
}

/**
 * Computes execution levels using Kahn's topological sort algorithm
 */
function computeLevels(nodes: Map<string, DependencyNode>): {
  levels: string[][];
  hasCycles: boolean;
  cyclePath?: string[];
} {
  // Clone in-degree counts (number of unprocessed dependencies)
  const inDegree = new Map<string, number>();
  for (const [id, node] of nodes) {
    inDegree.set(id, node.dependsOn.length);
  }

  const levels: string[][] = [];
  const processed = new Set<string>();

  // Keep processing until all nodes are assigned a level
  while (processed.size < nodes.size) {
    // Find all nodes with no remaining dependencies
    const currentLevel: string[] = [];
    
    for (const [id, degree] of inDegree) {
      if (degree === 0 && !processed.has(id)) {
        currentLevel.push(id);
      }
    }

    // If no nodes can be processed, we have a cycle
    if (currentLevel.length === 0) {
      // Find cycle by walking unprocessed nodes
      const cyclePath = findCycle(nodes, processed);
      return { levels, hasCycles: true, cyclePath };
    }

    // Mark current level nodes as processed
    for (const id of currentLevel) {
      processed.add(id);
      const node = nodes.get(id)!;
      node.level = levels.length;

      // Reduce in-degree of dependent nodes
      for (const dependentId of node.dependedBy) {
        const current = inDegree.get(dependentId) || 0;
        inDegree.set(dependentId, current - 1);
      }
    }

    levels.push(currentLevel);
  }

  return { levels, hasCycles: false };
}

/**
 * Finds a cycle in the dependency graph using DFS
 */
function findCycle(nodes: Map<string, DependencyNode>, processed: Set<string>): string[] {
  const visiting = new Set<string>();
  const path: string[] = [];

  function dfs(id: string): boolean {
    if (processed.has(id)) {
      return false; // Already fully processed, no cycle here
    }
    if (visiting.has(id)) {
      // Found cycle - return path from this node
      const cycleStart = path.indexOf(id);
      return true;
    }

    visiting.add(id);
    path.push(id);

    const node = nodes.get(id);
    if (node) {
      for (const depId of node.dependsOn) {
        if (dfs(depId)) {
          return true;
        }
      }
    }

    path.pop();
    visiting.delete(id);
    return false;
  }

  // Start DFS from unprocessed nodes
  for (const [id] of nodes) {
    if (!processed.has(id)) {
      if (dfs(id)) {
        // Extract cycle from path
        const cycleStart = path.findIndex(p => visiting.has(p));
        if (cycleStart >= 0) {
          return [...path.slice(cycleStart), path[cycleStart]];
        }
        return path;
      }
    }
  }

  return [];
}

/**
 * Groups subtasks into parallelizable groups based on dependencies
 * @param subtasks - Array of subtask TierNodes
 * @returns Array of arrays, where each inner array can be executed in parallel
 */
export function getParallelizableGroups(subtasks: TierNode[]): TierNode[][] {
  const graph = buildDependencyGraph(subtasks);
  return graph.levels;
}

/**
 * Performs topological sort on subtasks
 * @param subtasks - Array of subtask TierNodes
 * @returns Flattened array in execution order
 */
export function topologicalSort(subtasks: TierNode[]): TierNode[] {
  const graph = buildDependencyGraph(subtasks);
  return graph.levels.flat();
}

/**
 * Checks if subtasks have any dependencies defined
 * @param subtasks - Array of subtask TierNodes
 * @returns true if any subtask has dependencies
 */
export function hasDependencies(subtasks: TierNode[]): boolean {
  return subtasks.some(s => {
    const deps = s.data.plan?.dependsOn;
    return deps && deps.length > 0;
  });
}

/**
 * Validates dependencies without building full graph
 * @param subtasks - Array of subtask TierNodes
 * @returns Object with isValid and errors array
 */
export function validateDependencies(subtasks: TierNode[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const ids = new Set(subtasks.map(s => s.id));

  for (const subtask of subtasks) {
    const deps = subtask.data.plan?.dependsOn || [];
    for (const depId of deps) {
      if (!ids.has(depId)) {
        errors.push(`Subtask ${subtask.id} depends on non-existent subtask: ${depId}`);
      }
      if (depId === subtask.id) {
        errors.push(`Subtask ${subtask.id} depends on itself`);
      }
    }
  }

  // Check for cycles if basic validation passes
  if (errors.length === 0) {
    try {
      buildDependencyGraph(subtasks);
    } catch (e) {
      if (e instanceof DependencyCycleError) {
        errors.push(`Circular dependency detected: ${e.cyclePath.join(' -> ')}`);
      } else {
        throw e;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Gets the execution level for a specific subtask
 * @param subtaskId - ID of the subtask
 * @param graph - Pre-computed dependency graph
 * @returns Level number (0 = first, higher = later)
 */
export function getExecutionLevel(subtaskId: string, graph: DependencyGraph): number {
  const node = graph.nodes.get(subtaskId);
  return node?.level ?? -1;
}

/**
 * Checks if a subtask is ready to execute (all dependencies completed)
 * @param subtask - The subtask TierNode to check
 * @param completedIds - Set of completed subtask IDs
 * @returns true if all dependencies are satisfied
 */
export function isReadyToExecute(subtask: TierNode, completedIds: Set<string>): boolean {
  const deps = subtask.data.plan?.dependsOn || [];
  return deps.every(depId => completedIds.has(depId));
}

/**
 * Gets subtasks that are ready to execute given completed set
 * @param subtasks - All subtasks
 * @param completedIds - Set of completed subtask IDs
 * @param inProgressIds - Set of currently executing subtask IDs
 * @returns Array of subtasks ready to start
 */
export function getReadySubtasks(
  subtasks: TierNode[],
  completedIds: Set<string>,
  inProgressIds: Set<string>
): TierNode[] {
  return subtasks.filter(s => 
    !completedIds.has(s.id) &&
    !inProgressIds.has(s.id) &&
    isReadyToExecute(s, completedIds)
  );
}
