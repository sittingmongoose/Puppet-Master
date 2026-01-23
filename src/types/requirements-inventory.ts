/**
 * Requirements Inventory types for RWM Puppet Master
 *
 * Defines types for atomic requirement units extracted from source documents.
 * Used for deterministic coverage tracking, traceability, and gap-fill.
 *
 * See P1-T20: Start Chain - Requirements Inventory (Atomic REQ Units)
 */

/**
 * Classification of requirement type.
 */
export type RequirementKind = 'functional' | 'nfr' | 'constraint' | 'open_question';

/**
 * Severity/priority of a requirement (RFC 2119 style).
 */
export type RequirementSeverity = 'must' | 'should' | 'could';

/**
 * A single atomic requirement unit extracted from the source document.
 */
export interface RequirementUnit {
  /** Stable ID format: "REQ-0001", "REQ-0002", etc. */
  id: string;
  /** Hierarchical section path: "H1 Title > H2 Section > H3 Subsection" */
  sectionPath: string;
  /** The minimal atomic requirement text */
  excerpt: string;
  /** Deterministic hash of normalized excerpt for stable ID assignment */
  excerptHash: string;
  /** Classification of requirement type */
  kind: RequirementKind;
  /** Severity level (must/should/could) */
  severity: RequirementSeverity;
  /** Optional line number range [start, end] in source file */
  lineNumbers?: [number, number];
}

/**
 * Metadata about the inventory generation.
 */
export interface InventoryMetadata {
  /** Path to the source requirements document */
  sourcePath: string;
  /** Hash of the source document for change detection */
  sourceHash: string;
  /** ISO 8601 timestamp when inventory was generated */
  generatedAt: string;
  /** Whether inventory was generated with heuristics only (no AI refinement) */
  heuristicOnly: boolean;
  /** Version of the inventory schema */
  schemaVersion: string;
}

/**
 * Complete requirements inventory extracted from a source document.
 * Persisted to `.puppet-master/requirements/inventory.json`.
 */
export interface RequirementsInventory {
  /** Metadata about the inventory generation */
  metadata: InventoryMetadata;
  /** Array of atomic requirement units in document order */
  units: RequirementUnit[];
  /** Summary statistics */
  stats: InventoryStats;
}

/**
 * Summary statistics for the inventory.
 */
export interface InventoryStats {
  /** Total number of requirements extracted */
  totalRequirements: number;
  /** Count by kind */
  byKind: Record<RequirementKind, number>;
  /** Count by severity */
  bySeverity: Record<RequirementSeverity, number>;
  /** Number of unique sections containing requirements */
  uniqueSections: number;
}

/**
 * Mapping from excerpt hash to stable requirement ID.
 * Persisted to `.puppet-master/requirements/id-map.json` for rerun stability.
 */
export interface IdMap {
  /** Schema version for forward compatibility */
  version: string;
  /** Map of excerptHash → REQ-NNNN */
  entries: Record<string, string>;
  /** Next available ID number for new requirements */
  nextId: number;
  /** ISO 8601 timestamp of last update */
  updatedAt: string;
}

/**
 * Configuration for inventory generation.
 */
export interface InventoryConfig {
  /** Enable AI refinement of heuristic candidates (default: true) */
  enableAIRefinement: boolean;
  /** Minimum requirements expected per 1000 chars of source (default: 0.5) */
  minRequirementsPerKChars: number;
  /** Maximum requirements to extract (0 = unlimited, default: 0) */
  maxRequirements: number;
  /** Keywords that indicate a requirement (for heuristic extraction) */
  requirementKeywords: string[];
}

/**
 * Default inventory configuration.
 */
export const DEFAULT_INVENTORY_CONFIG: InventoryConfig = {
  enableAIRefinement: true,
  minRequirementsPerKChars: 0.5,
  maxRequirements: 0,
  requirementKeywords: [
    'must',
    'shall',
    'should',
    'required',
    'will',
    'need',
    'needs to',
    'has to',
    'have to',
  ],
};

/**
 * Result of heuristic requirement extraction.
 */
export interface HeuristicCandidate {
  /** Raw text of the candidate requirement */
  text: string;
  /** Section path where found */
  sectionPath: string;
  /** Source type: bullet, numbered, prose, table */
  sourceType: 'bullet' | 'numbered' | 'prose' | 'table';
  /** Detected severity keyword if any */
  detectedSeverity?: RequirementSeverity;
  /** Optional line numbers */
  lineNumbers?: [number, number];
}

/**
 * Result of inventory generation.
 */
export interface InventoryResult {
  /** The generated inventory */
  inventory: RequirementsInventory;
  /** The updated ID map */
  idMap: IdMap;
  /** Whether AI refinement was used */
  aiRefined: boolean;
  /** Any warnings during generation */
  warnings: string[];
}
