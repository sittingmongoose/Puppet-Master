/**
 * Document Structure Detector for RWM Puppet Master
 *
 * Detects the structural pattern of a parsed requirements document
 * to determine how to map sections to phases correctly.
 *
 * Fixes the "H1 title bug" where documents with a single H1 and multiple H2s
 * were incorrectly treated as having only 1 phase.
 *
 * See BUILD_QUEUE_IMPROVEMENTS.md P0-T02 for requirements.
 */

import type { ParsedSection } from '../types/requirements.js';

/**
 * Detected document structure types.
 */
export type DocumentStructureType =
  | 'single_h1_with_h2s'  // # Title + ## Section1 + ## Section2 -> H2s are phases
  | 'multiple_h1s'        // # Phase1 + # Phase2 -> H1s are phases
  | 'no_headings'         // Plain text -> fall back to content chunking
  | 'flat';               // Only one section total -> single phase

/**
 * Result of structure detection including metrics.
 */
export interface DocumentStructure {
  /** The detected structure type */
  type: DocumentStructureType;
  /** Document title (if detected from single H1) */
  title?: string;
  /** Sections that should be treated as phases */
  phaseSections: ParsedSection[];
  /** Coverage metrics for validation */
  metrics: CoverageMetrics;
}

/**
 * Coverage metrics for heuristic validation.
 */
export interface CoverageMetrics {
  /** Total number of headings detected */
  headingsCount: number;
  /** Total number of bullet points/requirements extracted */
  bulletsCount: number;
  /** Total characters in the input */
  totalChars: number;
  /** Number of characters successfully parsed into sections */
  parsedChars: number;
  /** Coverage ratio (parsedChars / totalChars) */
  coverageRatio: number;
  /** Number of phases detected */
  phasesCount: number;
}

/**
 * Error thrown when document structure validation fails.
 */
export class StructureDetectionError extends Error {
  constructor(
    message: string,
    public readonly metrics: CoverageMetrics
  ) {
    super(message);
    this.name = 'StructureDetectionError';
  }
}

/**
 * Options for structure detection.
 */
export interface StructureDetectorOptions {
  /** Minimum characters for a document to be considered "large" (default: 5000) */
  largeDocThreshold?: number;
  /** Minimum phases required for a large document (default: 2) */
  minPhasesForLargeDoc?: number;
  /** Whether to throw on validation failure (default: true) */
  failOnValidationError?: boolean;
}

const DEFAULT_OPTIONS: Required<StructureDetectorOptions> = {
  largeDocThreshold: 5000,
  minPhasesForLargeDoc: 2,
  failOnValidationError: true,
};

/**
 * Detects document structure and returns sections to use as phases.
 *
 * @param sections - Parsed sections from markdown parser (top-level sections)
 * @param rawText - Original raw text for coverage metrics
 * @param options - Detection options
 * @returns Document structure with phase sections and metrics
 * @throws StructureDetectionError if validation fails and failOnValidationError is true
 */
export function detectDocumentStructure(
  sections: ParsedSection[],
  rawText: string = '',
  options: StructureDetectorOptions = {}
): DocumentStructure {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Calculate metrics
  const metrics = calculateCoverageMetrics(sections, rawText);

  // Detect structure type and phase sections
  let type: DocumentStructureType;
  let phaseSections: ParsedSection[];
  let title: string | undefined;

  if (sections.length === 0) {
    // No headings at all
    type = 'no_headings';
    phaseSections = [];
  } else if (sections.length === 1 && sections[0].children.length > 0) {
    // Single top-level section (H1) with children (H2s)
    // Treat H1 as title, H2s as phases
    type = 'single_h1_with_h2s';
    title = sections[0].title;
    phaseSections = sections[0].children;
  } else if (sections.length === 1 && sections[0].children.length === 0) {
    // Single section with no children
    type = 'flat';
    phaseSections = sections;
  } else {
    // Multiple top-level sections (multiple H1s or mixed)
    type = 'multiple_h1s';
    phaseSections = sections;
  }

  // Update metrics with final phase count
  metrics.phasesCount = phaseSections.length;

  // Validate: large docs should not result in just 1 phase
  const isLargeDoc = metrics.totalChars >= opts.largeDocThreshold;
  const hasInsufficientPhases = metrics.phasesCount < opts.minPhasesForLargeDoc;

  if (isLargeDoc && hasInsufficientPhases && opts.failOnValidationError) {
    throw new StructureDetectionError(
      `Large document (${metrics.totalChars} chars) resulted in only ${metrics.phasesCount} phase(s). ` +
      `This suggests the document structure was not correctly interpreted. ` +
      `Expected at least ${opts.minPhasesForLargeDoc} phases for documents over ${opts.largeDocThreshold} chars.`,
      metrics
    );
  }

  return {
    type,
    title,
    phaseSections,
    metrics,
  };
}

/**
 * Calculates coverage metrics for a parsed document.
 */
function calculateCoverageMetrics(
  sections: ParsedSection[],
  rawText: string
): CoverageMetrics {
  let headingsCount = 0;
  let bulletsCount = 0;
  let parsedChars = 0;

  // Recursively count headings, bullets, and chars
  function processSection(section: ParsedSection): void {
    headingsCount++;
    parsedChars += section.title.length;
    parsedChars += section.content.length;

    // Count bullet points in content
    const bulletMatches = section.content.match(/^[-*•]\s+.+$/gm);
    const numberedMatches = section.content.match(/^\d+[.)]\s+.+$/gm);
    bulletsCount += (bulletMatches?.length ?? 0) + (numberedMatches?.length ?? 0);

    // Process children recursively
    for (const child of section.children) {
      processSection(child);
    }
  }

  for (const section of sections) {
    processSection(section);
  }

  const totalChars = rawText.length;
  const coverageRatio = totalChars > 0 ? parsedChars / totalChars : 0;

  return {
    headingsCount,
    bulletsCount,
    totalChars,
    parsedChars,
    coverageRatio,
    phasesCount: 0, // Will be set by caller after determining phases
  };
}

/**
 * Utility to check if structure detection would fail for given sections.
 * Useful for pre-validation without throwing.
 */
export function wouldFailValidation(
  sections: ParsedSection[],
  rawText: string = '',
  options: StructureDetectorOptions = {}
): { wouldFail: boolean; reason?: string; metrics: CoverageMetrics } {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const result = detectDocumentStructure(sections, rawText, {
      ...opts,
      failOnValidationError: false,
    });

    const isLargeDoc = result.metrics.totalChars >= opts.largeDocThreshold;
    const hasInsufficientPhases = result.metrics.phasesCount < opts.minPhasesForLargeDoc;

    if (isLargeDoc && hasInsufficientPhases) {
      return {
        wouldFail: true,
        reason: `Large document (${result.metrics.totalChars} chars) would result in only ${result.metrics.phasesCount} phase(s)`,
        metrics: result.metrics,
      };
    }

    return { wouldFail: false, metrics: result.metrics };
  } catch (error) {
    if (error instanceof StructureDetectionError) {
      return { wouldFail: true, reason: error.message, metrics: error.metrics };
    }
    throw error;
  }
}
