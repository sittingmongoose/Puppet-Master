/**
 * Coverage Validator for RWM Puppet Master
 *
 * Validates that generated PRDs adequately cover the source requirements document.
 * Enforces coverage gates to catch inadequate translations early in the start chain pipeline.
 *
 * See P1-T02: Start Chain - Add Coverage Gate.
 */

import type { ValidationResult, ValidationError, ValidationWarning } from '../validation-gate.js';
import type { ParsedRequirements, ParsedSection } from '../../types/requirements.js';
import type { PRD } from '../../types/prd.js';
import type { Criterion } from '../../types/tiers.js';
import type { CoverageMetrics } from '../structure-detector.js';
import type { PuppetMasterConfig } from '../../types/config.js';
import type { PlatformRegistry } from '../../platforms/registry.js';
import type { QuotaManager } from '../../platforms/quota-manager.js';
import { TraceabilityManager } from '../traceability.js';
import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Configuration for coverage validation thresholds.
 */
export interface CoverageConfig {
  /** Minimum coverage ratio required (default: 0.5) */
  minCoverageRatio: number;
  /** Character threshold for "large" documents (default: 5000) */
  largeDocThreshold: number;
  /** Character threshold for "very large" documents (default: 10000) */
  veryLargeDocThreshold: number;
  /** Minimum phases required for very large documents (default: 2) */
  minPhasesForVeryLargeDoc: number;
  /** Maximum generic criteria before warning (default: 5) */
  maxGenericCriteria: number;
  /** Enable AI coverage diff analysis (default: true) */
  enableAICoverageDiff: boolean;
}

/**
 * Default coverage configuration values.
 */
export const DEFAULT_COVERAGE_CONFIG: CoverageConfig = {
  minCoverageRatio: 0.5,
  largeDocThreshold: 5000,
  veryLargeDocThreshold: 10000,
  minPhasesForVeryLargeDoc: 2,
  maxGenericCriteria: 5,
  enableAICoverageDiff: true,
};

/**
 * Represents a missing requirement from the source document.
 */
export interface MissingRequirement {
  /** Section path in the requirements document */
  sectionPath: string;
  /** Excerpt of the missing requirement text */
  excerpt: string;
  /** Optional requirement ID if one exists */
  requirementId?: string;
}

/**
 * Represents a single gap detected by AI analysis.
 */
export interface AIGap {
  sectionPath: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

/**
 * Result of AI coverage diff analysis.
 */
export interface AICoverageDiff {
  /** Whether the AI diff was performed successfully */
  performed: boolean;
  /** Detected gaps from AI analysis */
  gaps: AIGap[];
  /** Confidence score (0-1) */
  confidence: number;
  /** Error message if diff failed */
  error?: string;
}

/**
 * Threshold in characters for chunked processing of large documents.
 * If the combined requirements + PRD summary exceeds this, use chunked processing.
 */
const CHUNK_THRESHOLD = 80000;

/**
 * Maximum size for a single chunk when processing large documents.
 */
const MAX_CHUNK_SIZE = 40000;

/**
 * P1-T20 Placeholder: Requirements inventory information.
 */
export interface RequirementsInventory {
  /** Total requirements in inventory */
  requirementsTotal: number;
  /** Number of requirements covered by PRD */
  requirementsCovered: number;
  /** IDs of missing requirements */
  missingRequirementIds: string[];
  /** Path to inventory file */
  inventoryPath: string;
}

/**
 * Full coverage report with all metrics.
 */
export interface CoverageReport {
  /** Total characters in source document */
  sourceChars: number;
  /** Characters extracted into PRD */
  extractedChars: number;
  /** Coverage ratio (extractedChars / sourceChars) */
  coverageRatio: number;
  /** Number of headings detected */
  headingsCount: number;
  /** Number of bullet points detected */
  bulletsCount: number;
  /** Number of phases in PRD */
  phasesCount: number;
  /** Count of generic criteria detected */
  genericCriteriaCount: number;
  /** Examples of generic criteria found */
  genericCriteriaExamples: string[];
  /** Total requirement sections in source */
  totalRequirementSections: number;
  /** Number of sections covered by PRD */
  coveredRequirementSections: number;
  /** Section coverage ratio */
  sectionCoverageRatio: number;
  /** List of missing requirements */
  missingRequirements: MissingRequirement[];
  /** AI coverage diff results (optional) */
  aiDiff?: AICoverageDiff;
  /** P1-T20 Placeholder: Requirements inventory (optional) */
  inventory?: RequirementsInventory;
  /** Whether validation passed */
  passed: boolean;
  /** Validation errors */
  errors: ValidationError[];
  /** Validation warnings */
  warnings: ValidationWarning[];
  /** Timestamp of report generation */
  timestamp: string;
  /** Source document path */
  sourceDocument: string;
}

/**
 * Generic criteria filler patterns.
 * These phrases indicate non-specific acceptance criteria that should be flagged.
 */
const GENERIC_CRITERIA_PATTERNS: RegExp[] = [
  /^implementation\s+complete$/i,
  /^code\s+complete$/i,
  /^feature\s+implemented$/i,
  /^works\s+as\s+expected$/i,
  /^functionality\s+verified$/i,
  /^tests\s+pass$/i,
  /^no\s+errors$/i,
  /^all\s+requirements\s+met$/i,
  /^done$/i,
  /^complete$/i,
  /^delivered$/i,
  /^implemented$/i,
  /^verified$/i,
  /^working$/i,
  /^functional$/i,
  /implementation\s+is\s+complete/i,
  /code\s+is\s+complete/i,
  /feature\s+is\s+implemented/i,
  /all\s+tests\s+pass/i,
  /no\s+errors\s+occur/i,
  /requirements\s+are\s+met/i,
  /everything\s+works/i,
  /system\s+is\s+functional/i,
];

/**
 * CoverageValidator class.
 * Validates that PRDs adequately cover source requirements.
 */
export class CoverageValidator {
  private config: CoverageConfig;
  private platformRegistry?: PlatformRegistry;
  private quotaManager?: QuotaManager;
  private puppetMasterConfig?: PuppetMasterConfig;
  private traceabilityManager: TraceabilityManager;

  /**
   * Creates a new CoverageValidator instance.
   *
   * @param config - Optional coverage configuration (defaults to DEFAULT_COVERAGE_CONFIG)
   * @param platformRegistry - Optional platform registry for AI diff
   * @param quotaManager - Optional quota manager for AI diff
   * @param puppetMasterConfig - Optional config for AI platform selection
   */
  constructor(
    config?: Partial<CoverageConfig>,
    platformRegistry?: PlatformRegistry,
    quotaManager?: QuotaManager,
    puppetMasterConfig?: PuppetMasterConfig
  ) {
    this.config = { ...DEFAULT_COVERAGE_CONFIG, ...config };
    this.platformRegistry = platformRegistry;
    this.quotaManager = quotaManager;
    this.puppetMasterConfig = puppetMasterConfig;
    this.traceabilityManager = new TraceabilityManager();
  }

  /**
   * Validates coverage and returns a ValidationResult.
   *
   * @param parsed - Parsed requirements document
   * @param prd - Generated PRD
   * @param metrics - Coverage metrics from structure detector
   * @returns ValidationResult with errors and warnings
   */
  validateCoverage(
    parsed: ParsedRequirements,
    prd: PRD,
    metrics: CoverageMetrics
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const totalChars = metrics.totalChars;
    const coverageRatio = metrics.coverageRatio;
    const phasesCount = metrics.phasesCount;

    // Calculate section coverage
    const { totalSections, coveredSections, sectionCoverageRatio } =
      this.calculateSectionCoverage(parsed, prd);

    // Detect generic criteria
    const { count: genericCriteriaCount, examples: genericCriteriaExamples } =
      this.detectGenericCriteria(prd);

    // HARD FAIL: coverageRatio < 0.5 AND totalChars > 5000
    if (coverageRatio < this.config.minCoverageRatio && totalChars > this.config.largeDocThreshold) {
      errors.push({
        code: 'COVERAGE_TOO_LOW',
        message: `Coverage ratio ${(coverageRatio * 100).toFixed(1)}% is below minimum ${(this.config.minCoverageRatio * 100).toFixed(1)}% for large document (${totalChars} chars)`,
        path: 'coverage',
        suggestion: `Review the PRD generation to ensure more content from the source document is captured. Expected at least ${(this.config.minCoverageRatio * 100).toFixed(0)}% coverage.`,
      });
    }

    // HARD FAIL: phasesCount < 2 AND totalChars > 10000
    if (phasesCount < this.config.minPhasesForVeryLargeDoc && totalChars > this.config.veryLargeDocThreshold) {
      errors.push({
        code: 'COVERAGE_SINGLE_PHASE',
        message: `Only ${phasesCount} phase(s) generated for very large document (${totalChars} chars). Expected at least ${this.config.minPhasesForVeryLargeDoc} phases.`,
        path: 'phases',
        suggestion: `Large requirements documents should result in multiple phases. Review document structure detection and PRD generation.`,
      });
    }

    // HARD FAIL: sectionCoverageRatio < 0.3
    if (sectionCoverageRatio < 0.3) {
      errors.push({
        code: 'COVERAGE_MISSING_SECTIONS',
        message: `Section coverage ${(sectionCoverageRatio * 100).toFixed(1)}% is critically low. Only ${coveredSections} of ${totalSections} requirement sections are covered.`,
        path: 'sections',
        suggestion: `Many requirement sections are not referenced in the PRD. Review traceability and ensure all sections are addressed.`,
      });
    }

    // WARNING: sectionCoverageRatio < 0.5 AND >= 0.3
    if (sectionCoverageRatio < 0.5 && sectionCoverageRatio >= 0.3) {
      warnings.push({
        code: 'COVERAGE_LOW_SECTION_COVERAGE',
        message: `Section coverage ${(sectionCoverageRatio * 100).toFixed(1)}% is below recommended 50%. ${coveredSections} of ${totalSections} sections covered.`,
        suggestion: `Consider adding more sections to the PRD to improve coverage. Use traceability to identify uncovered requirements.`,
      });
    }

    // WARNING: genericCriteriaCount > maxGenericCriteria
    if (genericCriteriaCount > this.config.maxGenericCriteria) {
      warnings.push({
        code: 'COVERAGE_GENERIC_CRITERIA',
        message: `Found ${genericCriteriaCount} generic/filler acceptance criteria (max ${this.config.maxGenericCriteria}). Examples: ${genericCriteriaExamples.join(', ')}`,
        suggestion: `Replace generic criteria like "implementation complete" with specific, testable conditions.`,
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Computes a full coverage report including all metrics.
   *
   * @param parsed - Parsed requirements document
   * @param prd - Generated PRD
   * @param metrics - Coverage metrics from structure detector
   * @param projectPath - Optional project path for inventory check
   * @returns Full CoverageReport
   */
  async computeCoverageReport(
    parsed: ParsedRequirements,
    prd: PRD,
    metrics: CoverageMetrics,
    projectPath?: string
  ): Promise<CoverageReport> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const totalChars = metrics.totalChars;
    const coverageRatio = metrics.coverageRatio;
    const phasesCount = metrics.phasesCount;

    // Calculate section coverage
    const { totalSections, coveredSections, sectionCoverageRatio, missingRequirements } =
      this.calculateSectionCoverage(parsed, prd);

    // Detect generic criteria
    const { count: genericCriteriaCount, examples: genericCriteriaExamples } =
      this.detectGenericCriteria(prd);

    // Calculate extracted chars from PRD
    const extractedChars = this.calculateExtractedChars(prd);

    // Run validation rules
    const validationResult = this.validateCoverage(parsed, prd, metrics);
    errors.push(...validationResult.errors);
    warnings.push(...validationResult.warnings);

    // AI coverage diff (optional)
    let aiDiff: AICoverageDiff | undefined;
    if (this.config.enableAICoverageDiff && this.platformRegistry && this.puppetMasterConfig) {
      aiDiff = await this.performAICoverageDiff(parsed, prd);

      // Add warning if AI detected gaps
      if (aiDiff.performed && aiDiff.gaps.length > 0) {
        const highSeverityGaps = aiDiff.gaps.filter(g => g.severity === 'high');
        if (highSeverityGaps.length > 0) {
          warnings.push({
            code: 'COVERAGE_AI_DETECTED_GAPS',
            message: `AI analysis detected ${aiDiff.gaps.length} coverage gaps (${highSeverityGaps.length} high severity)`,
            suggestion: `Review AI-detected gaps: ${highSeverityGaps.map(g => g.description).join('; ')}`,
          });
        }
      }
    }

    // P1-T20 Placeholder: Check inventory
    let inventory: RequirementsInventory | undefined;
    if (projectPath) {
      inventory = await this.checkInventory(projectPath);
    }

    return {
      sourceChars: totalChars,
      extractedChars,
      coverageRatio,
      headingsCount: metrics.headingsCount,
      bulletsCount: metrics.bulletsCount,
      phasesCount,
      genericCriteriaCount,
      genericCriteriaExamples,
      totalRequirementSections: totalSections,
      coveredRequirementSections: coveredSections,
      sectionCoverageRatio,
      missingRequirements,
      aiDiff,
      inventory,
      passed: errors.length === 0,
      errors,
      warnings,
      timestamp: new Date().toISOString(),
      sourceDocument: parsed.source?.path || 'unknown',
    };
  }

  /**
   * Calculates section coverage using TraceabilityManager.
   */
  private calculateSectionCoverage(
    parsed: ParsedRequirements,
    prd: PRD
  ): {
    totalSections: number;
    coveredSections: number;
    sectionCoverageRatio: number;
    missingRequirements: MissingRequirement[];
  } {
    // Count all sections recursively
    const totalSections = this.countSections(parsed.sections);

    // Get uncovered requirements using TraceabilityManager
    let uncoveredPaths: string[] = [];
    try {
      uncoveredPaths = this.traceabilityManager.getUncoveredRequirements(parsed, prd);
    } catch {
      // If traceability fails, assume no coverage
      uncoveredPaths = this.getAllSectionPaths(parsed.sections, parsed.title || '');
    }

    const coveredSections = totalSections - uncoveredPaths.length;
    const sectionCoverageRatio = totalSections > 0 ? coveredSections / totalSections : 0;

    // Build missing requirements list - include FULL content, never truncate
    const missingRequirements: MissingRequirement[] = uncoveredPaths.map(sectionPath => {
      const section = this.findSectionByPath(parsed.sections, sectionPath, parsed.title || '');
      return {
        sectionPath,
        excerpt: section ? section.content : '',
        requirementId: this.extractRequirementId(sectionPath),
      };
    });

    return {
      totalSections,
      coveredSections,
      sectionCoverageRatio,
      missingRequirements,
    };
  }

  /**
   * Counts all sections recursively.
   */
  private countSections(sections: ParsedSection[]): number {
    let count = 0;
    for (const section of sections) {
      count++;
      if (section.children && section.children.length > 0) {
        count += this.countSections(section.children);
      }
    }
    return count;
  }

  /**
   * Gets all section paths recursively.
   */
  private getAllSectionPaths(sections: ParsedSection[], prefix: string): string[] {
    const paths: string[] = [];
    for (const section of sections) {
      const path = prefix ? `${prefix} > ${section.title}` : section.title;
      paths.push(path);
      if (section.children && section.children.length > 0) {
        paths.push(...this.getAllSectionPaths(section.children, path));
      }
    }
    return paths;
  }

  /**
   * Finds a section by its path.
   */
  private findSectionByPath(
    sections: ParsedSection[],
    targetPath: string,
    currentPrefix: string
  ): ParsedSection | null {
    for (const section of sections) {
      const path = currentPrefix ? `${currentPrefix} > ${section.title}` : section.title;
      if (path === targetPath) {
        return section;
      }
      if (section.children && section.children.length > 0) {
        const found = this.findSectionByPath(section.children, targetPath, path);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  /**
   * Extracts a requirement ID from a section path if present.
   */
  private extractRequirementId(sectionPath: string): string | undefined {
    // Look for patterns like "REQ-001", "Section 4.2", "Requirement 1.2.3"
    const patterns = [
      /REQ-\d+/i,
      /REQUIREMENT[S]?\s+\d+(?:\.\d+)*/i,
      /SECTION\s+\d+(?:\.\d+)*/i,
      /\b\d+\.\d+(?:\.\d+)*\b/,
    ];

    for (const pattern of patterns) {
      const match = sectionPath.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return undefined;
  }

  /**
   * Detects generic/filler acceptance criteria in the PRD.
   */
  private detectGenericCriteria(prd: PRD): { count: number; examples: string[] } {
    const examples: string[] = [];
    let count = 0;

    const checkCriteria = (criteria: Criterion[] | undefined): void => {
      if (!criteria) return;

      for (const criterion of criteria) {
        const description = criterion.description?.trim() || '';
        const target = criterion.target?.trim() || '';

        // Check description and target against generic patterns
        for (const pattern of GENERIC_CRITERIA_PATTERNS) {
          if (pattern.test(description) || pattern.test(target)) {
            count++;
            if (examples.length < 10) {
              examples.push(description || target);
            }
            break;
          }
        }
      }
    };

    // Walk through all phases, tasks, and subtasks
    for (const phase of prd.phases || []) {
      checkCriteria(phase.acceptanceCriteria);

      for (const task of phase.tasks || []) {
        checkCriteria(task.acceptanceCriteria);

        for (const subtask of task.subtasks || []) {
          checkCriteria(subtask.acceptanceCriteria);
        }
      }
    }

    return { count, examples };
  }

  /**
   * Calculates extracted characters from PRD content.
   */
  private calculateExtractedChars(prd: PRD): number {
    let chars = 0;

    chars += prd.project?.length || 0;
    chars += prd.description?.length || 0;

    for (const phase of prd.phases || []) {
      chars += phase.title?.length || 0;
      chars += phase.description?.length || 0;
      chars += phase.notes?.length || 0;

      for (const criterion of phase.acceptanceCriteria || []) {
        chars += criterion.description?.length || 0;
        chars += criterion.target?.length || 0;
      }

      for (const task of phase.tasks || []) {
        chars += task.title?.length || 0;
        chars += task.description?.length || 0;
        chars += task.notes?.length || 0;

        for (const criterion of task.acceptanceCriteria || []) {
          chars += criterion.description?.length || 0;
          chars += criterion.target?.length || 0;
        }

        for (const subtask of task.subtasks || []) {
          chars += subtask.title?.length || 0;
          chars += subtask.description?.length || 0;
          chars += subtask.notes?.length || 0;

          for (const criterion of subtask.acceptanceCriteria || []) {
            chars += criterion.description?.length || 0;
            chars += criterion.target?.length || 0;
          }
        }
      }
    }

    return chars;
  }

  /**
   * Performs AI coverage diff analysis.
   * Uses the phase tier platform from puppetMasterConfig.
   * For very large documents, uses chunked processing to avoid truncation.
   */
  private async performAICoverageDiff(
    parsed: ParsedRequirements,
    prd: PRD
  ): Promise<AICoverageDiff> {
    // Check prerequisites
    if (!this.platformRegistry || !this.puppetMasterConfig) {
      return {
        performed: false,
        gaps: [],
        confidence: 0,
        error: 'Platform registry or config not available',
      };
    }

    // Config resolution order (P1-T04):
    // 1. config.startChain.coverage.platform/model (step-specific)
    // 2. config.tiers.phase.platform/model (default phase tier)
    const stepConfig = this.puppetMasterConfig.startChain?.coverage;
    const phaseTier = this.puppetMasterConfig.tiers?.phase;

    // Use step-specific config if available, fallback to phase tier
    const platform = stepConfig?.platform || phaseTier?.platform;
    const model = stepConfig?.model || phaseTier?.model;

    if (!platform) {
      return {
        performed: false,
        gaps: [],
        confidence: 0,
        error: 'Platform configuration not available (no coverage step config or phase tier)',
      };
    }

    const runner = this.platformRegistry.get(platform);

    if (!runner) {
      return {
        performed: false,
        gaps: [],
        confidence: 0,
        error: `Platform runner not available for ${platform}`,
      };
    }

    // Check quota if quota manager is available
    if (this.quotaManager) {
      const canProceed = await this.quotaManager.canProceed(platform);
      if (!canProceed.allowed) {
        return {
          performed: false,
          gaps: [],
          confidence: 0,
          error: `Quota exceeded for ${platform}: ${canProceed.reason}`,
        };
      }
    }

    try {
      // Calculate total content size to determine if chunking is needed
      const requirementsSummary = this.buildFullRequirementsSummary(parsed);
      const prdSummary = this.buildFullPRDSummary(prd);
      const totalSize = requirementsSummary.length + prdSummary.length;

      // If content fits in one call, proceed normally
      if (totalSize < CHUNK_THRESHOLD) {
        return this.performSingleAICoverageDiff(parsed, prd, runner, requirementsSummary, prdSummary, model);
      }

      // For very large documents, process in chunks
      return this.performChunkedAICoverageDiff(parsed, prd, runner, prdSummary, model);
    } catch (error) {
      return {
        performed: false,
        gaps: [],
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error during AI diff',
      };
    }
  }

  /**
   * Performs a single AI coverage diff call (for documents that fit within token limits).
   */
  private async performSingleAICoverageDiff(
    parsed: ParsedRequirements,
    prd: PRD,
    runner: ReturnType<PlatformRegistry['get']>,
    requirementsSummary: string,
    prdSummary: string,
    model?: string
  ): Promise<AICoverageDiff> {
    // Build the AI diff prompt with full content
    const prompt = this.buildAIDiffPromptWithContent(requirementsSummary, prdSummary);

    // Execute via platform runner
    const result = await runner!.execute({
      prompt,
      model, // Pass model
      workingDirectory: process.cwd(),
      timeout: 120000, // 2 minute timeout for larger documents
      nonInteractive: true,
    });

    // Parse AI response
    return this.parseAIDiffResponse(result.output || '');
  }

  /**
   * Performs chunked AI coverage diff for very large documents.
   * Breaks requirements into chunks and processes each chunk separately,
   * then aggregates results. NEVER truncates content.
   */
  private async performChunkedAICoverageDiff(
    parsed: ParsedRequirements,
    prd: PRD,
    runner: ReturnType<PlatformRegistry['get']>,
    prdSummary: string,
    model?: string
  ): Promise<AICoverageDiff> {
    // Break sections into chunks
    const sectionChunks = this.chunkSections(parsed.sections);
    const allGaps: AIGap[] = [];
    let totalConfidence = 0;
    let callCount = 0;
    const errors: string[] = [];

    for (const chunk of sectionChunks) {
      // Build summary for this chunk of sections only
      const chunkSummary = this.buildChunkSummary(chunk, parsed);

      // Determine how much of the PRD summary we can include
      // If PRD is also very large, we may need to summarize by phase
      let effectivePrdSummary = prdSummary;
      if (chunkSummary.length + prdSummary.length > CHUNK_THRESHOLD) {
        // PRD is very large, include relevant phases only based on section keywords
        effectivePrdSummary = this.buildRelevantPRDSummary(prd, chunk);
      }

      const prompt = this.buildAIDiffPromptWithContent(chunkSummary, effectivePrdSummary);

      try {
        const result = await runner!.execute({
          prompt,
          model, // Pass model
          workingDirectory: process.cwd(),
          timeout: 120000,
          nonInteractive: true,
        });

        const chunkResult = this.parseAIDiffResponse(result.output || '');
        if (chunkResult.performed) {
          allGaps.push(...chunkResult.gaps);
          totalConfidence += chunkResult.confidence;
          callCount++;
        } else if (chunkResult.error) {
          errors.push(chunkResult.error);
        }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : 'Unknown chunk error');
      }
    }

    // Deduplicate gaps by sectionPath and description
    const uniqueGaps = this.deduplicateGaps(allGaps);

    return {
      performed: callCount > 0,
      gaps: uniqueGaps,
      confidence: callCount > 0 ? totalConfidence / callCount : 0,
      error: errors.length > 0 ? `Chunk errors: ${errors.join('; ')}` : undefined,
    };
  }

  /**
   * Chunks sections into groups that fit within the max chunk size.
   * NEVER truncates individual section content.
   */
  private chunkSections(sections: ParsedSection[]): ParsedSection[][] {
    const chunks: ParsedSection[][] = [];
    let currentChunk: ParsedSection[] = [];
    let currentSize = 0;

    const addSection = (section: ParsedSection): void => {
      const sectionSize = this.calculateSectionSize(section);

      if (currentSize + sectionSize > MAX_CHUNK_SIZE && currentChunk.length > 0) {
        // Start new chunk
        chunks.push(currentChunk);
        currentChunk = [];
        currentSize = 0;
      }

      currentChunk.push(section);
      currentSize += sectionSize;
    };

    for (const section of sections) {
      addSection(section);
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  /**
   * Calculates the total size of a section including all its content and children.
   */
  private calculateSectionSize(section: ParsedSection): number {
    let size = section.title.length + section.content.length;
    for (const child of section.children || []) {
      size += this.calculateSectionSize(child);
    }
    return size;
  }

  /**
   * Builds a summary for a chunk of sections.
   */
  private buildChunkSummary(sections: ParsedSection[], parsed: ParsedRequirements): string {
    const lines: string[] = [];
    lines.push(`Title: ${parsed.title || 'Untitled'} (Partial - Chunked Analysis)`);
    lines.push(`Source: ${parsed.source?.path || 'Unknown'}`);
    lines.push('');
    lines.push('Sections in this chunk:');

    const addSection = (section: ParsedSection, depth: number): void => {
      const indent = '  '.repeat(depth);
      lines.push(`${indent}- ${section.title}`);
      if (section.content) {
        lines.push(`${indent}  Content:`);
        const contentLines = section.content.split('\n');
        for (const contentLine of contentLines) {
          lines.push(`${indent}    ${contentLine}`);
        }
      }
      for (const child of section.children || []) {
        addSection(child, depth + 1);
      }
    };

    for (const section of sections) {
      addSection(section, 0);
    }

    return lines.join('\n');
  }

  /**
   * Builds a PRD summary filtered to phases that may be relevant to given sections.
   * Uses keyword matching to find potentially related phases.
   */
  private buildRelevantPRDSummary(prd: PRD, sections: ParsedSection[]): string {
    // Extract keywords from sections
    const keywords = new Set<string>();
    const extractKeywords = (section: ParsedSection): void => {
      const words = (section.title + ' ' + section.content)
        .toLowerCase()
        .split(/\W+/)
        .filter(w => w.length > 3);
      words.forEach(w => keywords.add(w));
      for (const child of section.children || []) {
        extractKeywords(child);
      }
    };
    sections.forEach(extractKeywords);

    // Find phases with matching keywords
    const relevantPhases = (prd.phases || []).filter(phase => {
      const phaseText = `${phase.title} ${phase.description} ${phase.notes}`.toLowerCase();
      return Array.from(keywords).some(kw => phaseText.includes(kw));
    });

    // If no matches, include all phases (fallback)
    const phasesToInclude = relevantPhases.length > 0 ? relevantPhases : (prd.phases || []);

    // Build summary for these phases with full detail
    const lines: string[] = [];
    lines.push(`Project: ${prd.project || 'Untitled'}`);
    lines.push(`Description: ${prd.description || 'None'}`);
    lines.push(`Relevant Phases: ${phasesToInclude.length} of ${prd.phases?.length || 0}`);
    lines.push('');

    for (const phase of phasesToInclude) {
      lines.push(`Phase: ${phase.id} - ${phase.title}`);
      lines.push(`  Description: ${phase.description || 'None'}`);
      lines.push(`  Notes: ${phase.notes || 'None'}`);
      lines.push(`  Tasks: ${phase.tasks?.length || 0}`);

      if (phase.acceptanceCriteria?.length) {
        lines.push(`  Acceptance Criteria:`);
        for (const criterion of phase.acceptanceCriteria) {
          lines.push(`    - ${criterion.description || ''} (target: ${criterion.target || 'N/A'})`);
        }
      }

      for (const task of phase.tasks || []) {
        lines.push(`    Task: ${task.id} - ${task.title}`);
        lines.push(`      Description: ${task.description || 'None'}`);

        if (task.acceptanceCriteria?.length) {
          lines.push(`      Acceptance Criteria:`);
          for (const criterion of task.acceptanceCriteria) {
            lines.push(`        - ${criterion.description || ''}`);
          }
        }

        for (const subtask of task.subtasks || []) {
          lines.push(`        Subtask: ${subtask.id} - ${subtask.title}`);
          lines.push(`          Description: ${subtask.description || 'None'}`);
        }
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Deduplicates gaps by sectionPath and description similarity.
   */
  private deduplicateGaps(gaps: AIGap[]): AIGap[] {
    const seen = new Map<string, AIGap>();

    for (const gap of gaps) {
      const key = `${gap.sectionPath}::${gap.description.toLowerCase().slice(0, 50)}`;
      const existing = seen.get(key);

      if (!existing) {
        seen.set(key, gap);
      } else {
        // Keep the higher severity gap
        const severityOrder = { high: 3, medium: 2, low: 1 };
        if (severityOrder[gap.severity] > severityOrder[existing.severity]) {
          seen.set(key, gap);
        }
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Builds the prompt for AI coverage diff analysis.
   * Delegates to buildAIDiffPromptWithContent with full summaries.
   */
  private buildAIDiffPrompt(parsed: ParsedRequirements, prd: PRD): string {
    const requirementsSummary = this.buildFullRequirementsSummary(parsed);
    const prdSummary = this.buildFullPRDSummary(prd);
    return this.buildAIDiffPromptWithContent(requirementsSummary, prdSummary);
  }

  /**
   * Builds the AI diff prompt with pre-built content summaries.
   * Used by both single and chunked processing paths.
   */
  private buildAIDiffPromptWithContent(requirementsSummary: string, prdSummary: string): string {
    return `You are analyzing coverage between a requirements document and a generated PRD (Product Requirements Document).

## Requirements Document Summary
${requirementsSummary}

## Generated PRD Summary
${prdSummary}

## Task
Identify any requirements from the source document that are NOT adequately covered in the PRD.

For each gap found, provide:
1. The section path from the requirements document
2. A brief description of what is missing
3. Severity: high (critical functionality missing), medium (important but not critical), low (minor gap)

## Response Format
Respond with a JSON object:
{
  "gaps": [
    {
      "sectionPath": "string",
      "description": "string",
      "severity": "high" | "medium" | "low"
    }
  ],
  "confidence": 0.0-1.0
}

If there are no gaps, return: { "gaps": [], "confidence": 1.0 }`;
  }

  /**
   * Builds a FULL summary of the requirements document - NO truncation.
   * For large documents, use buildFullRequirementsSummary and chunked processing.
   */
  private buildRequirementsSummary(parsed: ParsedRequirements): string {
    return this.buildFullRequirementsSummary(parsed);
  }

  /**
   * Builds a FULL summary of the requirements document with ALL content.
   * NEVER truncates or summarizes - for large documents, use chunked processing instead.
   */
  private buildFullRequirementsSummary(parsed: ParsedRequirements): string {
    const lines: string[] = [];
    lines.push(`Title: ${parsed.title || 'Untitled'}`);
    lines.push(`Source: ${parsed.source?.path || 'Unknown'}`);
    lines.push('');
    lines.push('Sections:');

    const addSection = (section: ParsedSection, depth: number): void => {
      const indent = '  '.repeat(depth);
      lines.push(`${indent}- ${section.title}`);
      if (section.content) {
        // Include FULL content, preserving newlines for proper formatting
        lines.push(`${indent}  Content:`);
        const contentLines = section.content.split('\n');
        for (const contentLine of contentLines) {
          lines.push(`${indent}    ${contentLine}`);
        }
      }
      for (const child of section.children || []) {
        addSection(child, depth + 1);
      }
    };

    for (const section of parsed.sections || []) {
      addSection(section, 0);
    }

    // Include ALL extracted goals - never truncate
    if (parsed.extractedGoals?.length) {
      lines.push('');
      lines.push('Extracted Goals:');
      for (const goal of parsed.extractedGoals) {
        lines.push(`  - ${goal}`);
      }
    }

    // Include ALL extracted constraints - never truncate
    if (parsed.extractedConstraints?.length) {
      lines.push('');
      lines.push('Extracted Constraints:');
      for (const constraint of parsed.extractedConstraints) {
        lines.push(`  - ${constraint}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Builds a FULL summary of the PRD - NO truncation.
   * For large documents, use buildFullPRDSummary and chunked processing.
   */
  private buildPRDSummary(prd: PRD): string {
    return this.buildFullPRDSummary(prd);
  }

  /**
   * Builds a FULL summary of the PRD with ALL content.
   * NEVER truncates or summarizes - for large documents, use chunked processing instead.
   */
  private buildFullPRDSummary(prd: PRD): string {
    const lines: string[] = [];
    lines.push(`Project: ${prd.project || 'Untitled'}`);
    lines.push(`Description: ${prd.description || 'None'}`);
    lines.push(`Phases: ${prd.phases?.length || 0}`);
    lines.push('');

    // Include ALL phases with FULL details - never truncate
    for (const phase of prd.phases || []) {
      lines.push(`Phase: ${phase.id} - ${phase.title}`);
      lines.push(`  Description: ${phase.description || 'None'}`);
      lines.push(`  Notes: ${phase.notes || 'None'}`);
      lines.push(`  Tasks: ${phase.tasks?.length || 0}`);

      // Include ALL acceptance criteria for phase
      if (phase.acceptanceCriteria?.length) {
        lines.push(`  Acceptance Criteria:`);
        for (const criterion of phase.acceptanceCriteria) {
          lines.push(`    - ${criterion.description || ''} (target: ${criterion.target || 'N/A'})`);
        }
      }

      // Include ALL tasks - never truncate
      for (const task of phase.tasks || []) {
        lines.push(`    Task: ${task.id} - ${task.title}`);
        lines.push(`      Description: ${task.description || 'None'}`);
        lines.push(`      Notes: ${task.notes || 'None'}`);

        // Include ALL acceptance criteria for task
        if (task.acceptanceCriteria?.length) {
          lines.push(`      Acceptance Criteria:`);
          for (const criterion of task.acceptanceCriteria) {
            lines.push(`        - ${criterion.description || ''} (target: ${criterion.target || 'N/A'})`);
          }
        }

        // Include ALL subtasks with FULL details
        lines.push(`      Subtasks: ${task.subtasks?.length || 0}`);
        for (const subtask of task.subtasks || []) {
          lines.push(`        Subtask: ${subtask.id} - ${subtask.title}`);
          lines.push(`          Description: ${subtask.description || 'None'}`);
          lines.push(`          Notes: ${subtask.notes || 'None'}`);

          // Include ALL acceptance criteria for subtask
          if (subtask.acceptanceCriteria?.length) {
            lines.push(`          Acceptance Criteria:`);
            for (const criterion of subtask.acceptanceCriteria) {
              lines.push(`            - ${criterion.description || ''} (target: ${criterion.target || 'N/A'})`);
            }
          }
        }
      }
      lines.push(''); // Empty line between phases for readability
    }

    return lines.join('\n');
  }

  /**
   * Parses the AI response for coverage diff.
   */
  private parseAIDiffResponse(output: string): AICoverageDiff {
    try {
      // Extract JSON from response (may be wrapped in markdown code blocks)
      let jsonStr = output;

      // Try to extract JSON from code blocks
      const jsonMatch = output.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      // Try to find JSON object in response
      const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        jsonStr = objectMatch[0];
      }

      const parsed = JSON.parse(jsonStr);

      // Validate and extract gaps
      const gaps: AICoverageDiff['gaps'] = [];
      if (Array.isArray(parsed.gaps)) {
        for (const gap of parsed.gaps) {
          if (typeof gap === 'object' && gap !== null) {
            gaps.push({
              sectionPath: String(gap.sectionPath || ''),
              description: String(gap.description || ''),
              severity: ['high', 'medium', 'low'].includes(gap.severity) ? gap.severity : 'medium',
            });
          }
        }
      }

      const confidence = typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.5;

      return {
        performed: true,
        gaps,
        confidence,
      };
    } catch {
      return {
        performed: true,
        gaps: [],
        confidence: 0,
        error: 'Failed to parse AI response',
      };
    }
  }

  /**
   * P1-T20: Checks for requirements inventory file and extracts coverage metrics.
   *
   * @param projectPath - Project root path
   * @returns Inventory information if available
   */
  async checkInventory(projectPath: string): Promise<RequirementsInventory | undefined> {
    const inventoryPath = join(projectPath, '.puppet-master', 'requirements', 'inventory.json');

    try {
      const content = await fs.readFile(inventoryPath, 'utf-8');
      const inventory = JSON.parse(content);

      // P1-T20: Handle new inventory format with metadata, units, stats
      if (
        typeof inventory === 'object' &&
        inventory.stats &&
        typeof inventory.stats.totalRequirements === 'number' &&
        Array.isArray(inventory.units)
      ) {
        // New format from RequirementsInventoryBuilder
        // Note: requirementsCovered and missingRequirementIds require PRD comparison
        // which happens later in the pipeline. For now, return totals.
        return {
          requirementsTotal: inventory.stats.totalRequirements,
          requirementsCovered: 0, // Will be computed during coverage validation with PRD
          missingRequirementIds: [], // Will be computed during coverage validation with PRD
          inventoryPath,
        };
      }

      // Legacy format fallback
      if (
        typeof inventory === 'object' &&
        typeof inventory.requirementsTotal === 'number' &&
        typeof inventory.requirementsCovered === 'number' &&
        Array.isArray(inventory.missingRequirementIds)
      ) {
        return {
          requirementsTotal: inventory.requirementsTotal,
          requirementsCovered: inventory.requirementsCovered,
          missingRequirementIds: inventory.missingRequirementIds,
          inventoryPath,
        };
      }

      return undefined;
    } catch {
      // Inventory file doesn't exist or is invalid
      return undefined;
    }
  }
}
