/**
 * Multi-Pass PRD Generator for RWM Puppet Master
 *
 * Implements a multi-pass pipeline for generating PRDs from large requirements documents:
 * 1. Parse + normalize structure (H1-title flattening)
 * 2. Build outline PRD with stable IDs and placeholders
 * 3. Expand each phase/task in isolation (chunked prompts)
 * 4. Run "AI coverage diff" pass - list missing requirements
 * 5. Run PRD quality validator + coverage validator
 * 6. Gap-fill loop until coverage threshold or max passes reached
 *
 * See P1-T05 in BUILD_QUEUE_IMPROVEMENTS.md and CodexsMajorImprovements.md P1.2
 */

import type { ParsedRequirements, ParsedSection } from '../types/requirements.js';
import type { PRD, Phase, Task, Subtask, ItemStatus, SourceRef } from '../types/prd.js';
import type { Criterion, TestPlan } from '../types/tiers.js';
import type { PuppetMasterConfig } from '../types/config.js';
import type { ExecutionRequest } from '../types/platforms.js';
import { PlatformRegistry } from '../platforms/registry.js';
import { QuotaManager } from '../platforms/quota-manager.js';
import { UsageTracker } from '../memory/usage-tracker.js';
import { CriterionClassifier } from './criterion-classifier.js';
import { CoverageValidator } from './validators/coverage-validator.js';
import type { CoverageReport, MissingRequirement } from './validators/coverage-validator.js';
import { detectDocumentStructure } from './structure-detector.js';
import { createHash } from 'crypto';
import { TestPlanGenerator } from './test-plan-generator.js';
import { CriterionToScript } from './criterion-to-script.js';

/**
 * Configuration for multi-pass PRD generation.
 */
export interface MultiPassConfig {
  /** Enable multi-pass generation (default: true for large docs) */
  enabled: boolean;
  /** Character threshold for triggering multi-pass (default: 5000) */
  largeDocThreshold: number;
  /** Maximum gap-fill repair passes (default: 3) */
  maxRepairPasses: number;
  /** Coverage threshold to stop gap-fill loop (default: 0.7) */
  coverageThreshold: number;
}

/**
 * Default multi-pass configuration.
 */
export const DEFAULT_MULTI_PASS_CONFIG: MultiPassConfig = {
  enabled: true,
  largeDocThreshold: 5000,
  maxRepairPasses: 3,
  coverageThreshold: 0.7,
};

/**
 * Options for multi-pass PRD generation.
 */
export interface MultiPassPrdGeneratorOptions {
  /** Project name for the PRD */
  projectName: string;
  /** Multi-pass configuration */
  multiPassConfig?: Partial<MultiPassConfig>;
  /** Interview assumptions to include in generation */
  interviewAssumptions?: string[];
}

/**
 * Outline for a phase placeholder (used in Pass 1).
 */
export interface PhaseOutline {
  id: string;
  title: string;
  description: string;
  sourceSection: ParsedSection;
  taskOutlines: TaskOutline[];
}

/**
 * Outline for a task placeholder (used in Pass 1).
 */
export interface TaskOutline {
  id: string;
  title: string;
  description: string;
  sourceSection: ParsedSection;
}

/**
 * PRD outline with stable IDs and placeholders (output of Pass 1).
 */
export interface PrdOutline {
  project: string;
  version: string;
  description: string;
  phaseOutlines: PhaseOutline[];
  /** Total characters in source document */
  sourceChars: number;
  /** Document structure type detected */
  structureType: string;
}

/**
 * Result of a single gap-fill pass.
 */
export interface GapFillResult {
  /** Updated PRD after gap-fill */
  prd: PRD;
  /** Number of gaps filled */
  gapsFilled: number;
  /** Remaining missing requirements */
  remainingGaps: MissingRequirement[];
  /** Pass number */
  passNumber: number;
}

/**
 * Result of the complete multi-pass generation.
 */
export interface MultiPassResult {
  /** Final generated PRD */
  prd: PRD;
  /** Number of passes executed */
  passesExecuted: number;
  /** Final coverage report */
  coverageReport?: CoverageReport;
  /** Whether multi-pass was used (vs single-pass fallback) */
  usedMultiPass: boolean;
  /** Gap-fill history */
  gapFillHistory: GapFillResult[];
}

/**
 * Multi-Pass PRD Generator class.
 * Orchestrates the multi-pass pipeline for generating high-quality PRDs from large documents.
 */
export class MultiPassPrdGenerator {
  private readonly projectName: string;
  private readonly config: MultiPassConfig;
  private readonly platformRegistry?: PlatformRegistry;
  private readonly quotaManager?: QuotaManager;
  private readonly puppetMasterConfig?: PuppetMasterConfig;
  private readonly usageTracker?: UsageTracker;
  private readonly criterionClassifier: CriterionClassifier;
  private readonly coverageValidator: CoverageValidator;
  private readonly interviewAssumptions: string[];

  constructor(
    options: MultiPassPrdGeneratorOptions,
    platformRegistry?: PlatformRegistry,
    quotaManager?: QuotaManager,
    puppetMasterConfig?: PuppetMasterConfig,
    usageTracker?: UsageTracker
  ) {
    this.projectName = options.projectName;
    this.config = { ...DEFAULT_MULTI_PASS_CONFIG, ...options.multiPassConfig };
    this.platformRegistry = platformRegistry;
    this.quotaManager = quotaManager;
    this.puppetMasterConfig = puppetMasterConfig;
    this.usageTracker = usageTracker;
    this.criterionClassifier = new CriterionClassifier();
    this.interviewAssumptions = options.interviewAssumptions ?? [];

    // Initialize coverage validator with platform support for AI diff
    this.coverageValidator = new CoverageValidator(
      puppetMasterConfig?.startChain?.coverage,
      platformRegistry,
      quotaManager,
      puppetMasterConfig
    );
  }

  /**
   * Main entry point: generates a PRD using multi-pass pipeline.
   *
   * @param parsed - Parsed requirements document
   * @returns MultiPassResult with final PRD and generation metadata
   */
  async generate(parsed: ParsedRequirements): Promise<MultiPassResult> {
    const sourceChars = parsed.rawText.length;

    // Check if document is large enough to warrant multi-pass
    if (!this.config.enabled || sourceChars < this.config.largeDocThreshold) {
      console.log(
        `[Multi-Pass PRD] Document size (${sourceChars} chars) below threshold (${this.config.largeDocThreshold}). Using single-pass.`
      );
      const prd = await this.generateSinglePass(parsed);
      const projectPath = this.puppetMasterConfig?.project.workingDirectory ?? '.';
      const normalizer = new CriterionToScript({ generateScripts: Boolean(this.puppetMasterConfig) });
      await normalizer.normalizePrd(prd, projectPath);
      return {
        prd,
        passesExecuted: 1,
        usedMultiPass: false,
        gapFillHistory: [],
      };
    }

    console.log(
      `[Multi-Pass PRD] Starting multi-pass generation for large document (${sourceChars} chars)`
    );

    // Pass 1: Generate outline with stable IDs
    const outline = await this.generateOutline(parsed);
    console.log(
      `[Multi-Pass PRD] Pass 1 complete: ${outline.phaseOutlines.length} phases outlined`
    );

    // Pass 2: Expand phases in isolation
    let prd = await this.expandOutline(outline, parsed);
    console.log(
      `[Multi-Pass PRD] Pass 2 complete: ${prd.phases.length} phases expanded`
    );

    // Get initial coverage metrics
    const structure = detectDocumentStructure(
      parsed.sections,
      parsed.rawText,
      { failOnValidationError: false }
    );

    // Gap-fill loop (Pass 3 + 4 repeated)
    const gapFillHistory: GapFillResult[] = [];
    let passNumber = 0;

    while (passNumber < this.config.maxRepairPasses) {
      passNumber++;

      // Pass 3: Coverage diff - identify missing requirements
      const missingRequirements = await this.coverageDiff(parsed, prd);

      if (missingRequirements.length === 0) {
        console.log(
          `[Multi-Pass PRD] Pass ${passNumber + 2}: No gaps detected. Coverage complete.`
        );
        break;
      }

      console.log(
        `[Multi-Pass PRD] Pass ${passNumber + 2}: Found ${missingRequirements.length} gaps`
      );

      // Pass 4: Fill gaps
      const gapFillResult = await this.fillGaps(prd, missingRequirements, passNumber);
      prd = gapFillResult.prd;
      gapFillHistory.push(gapFillResult);

      console.log(
        `[Multi-Pass PRD] Gap-fill pass ${passNumber}: Filled ${gapFillResult.gapsFilled} gaps, ${gapFillResult.remainingGaps.length} remaining`
      );

      // Check coverage threshold
      const coverageReport = await this.coverageValidator.computeCoverageReport(
        parsed,
        prd,
        structure.metrics,
        this.puppetMasterConfig?.project.workingDirectory ?? '.'
      );

      if (coverageReport.coverageRatio >= this.config.coverageThreshold) {
        console.log(
          `[Multi-Pass PRD] Coverage threshold reached (${(coverageReport.coverageRatio * 100).toFixed(1)}% >= ${(this.config.coverageThreshold * 100).toFixed(1)}%)`
        );
        break;
      }
    }

    // Final coverage report
    const finalCoverageReport = await this.coverageValidator.computeCoverageReport(
      parsed,
      prd,
      structure.metrics,
      this.puppetMasterConfig?.project.workingDirectory ?? '.'
    );

    console.log(
      `[Multi-Pass PRD] Complete: ${prd.phases.length} phases, ${passNumber} gap-fill passes, ` +
      `${(finalCoverageReport.coverageRatio * 100).toFixed(1)}% coverage`
    );

    const projectPath = this.puppetMasterConfig?.project.workingDirectory ?? '.';
    const normalizer = new CriterionToScript({ generateScripts: Boolean(this.puppetMasterConfig) });
    await normalizer.normalizePrd(prd, projectPath);

    return {
      prd,
      passesExecuted: 2 + passNumber, // outline + expand + gap-fill passes
      coverageReport: finalCoverageReport,
      usedMultiPass: true,
      gapFillHistory,
    };
  }

  /**
   * Pass 1: Generate PRD outline with stable IDs.
   * Creates skeleton structure without detailed content.
   *
   * @param parsed - Parsed requirements document
   * @returns PrdOutline with phase/task placeholders
   */
  async generateOutline(parsed: ParsedRequirements): Promise<PrdOutline> {
    // Detect document structure
    const structure = detectDocumentStructure(
      parsed.sections,
      parsed.rawText,
      { failOnValidationError: false }
    );

    const phaseOutlines: PhaseOutline[] = [];

    // Build phase outlines from detected structure
    for (let phaseIndex = 0; phaseIndex < structure.phaseSections.length; phaseIndex++) {
      const section = structure.phaseSections[phaseIndex];
      const phaseId = this.generatePhaseId(phaseIndex + 1);

      const taskOutlines: TaskOutline[] = [];

      // Build task outlines from children
      for (let taskIndex = 0; taskIndex < section.children.length; taskIndex++) {
        const taskSection = section.children[taskIndex];
        const taskId = this.generateTaskId(phaseIndex + 1, taskIndex + 1);

        taskOutlines.push({
          id: taskId,
          title: taskSection.title,
          description: taskSection.content.substring(0, 200) + '...', // Truncated for outline
          sourceSection: taskSection,
        });
      }

      phaseOutlines.push({
        id: phaseId,
        title: section.title,
        description: section.content.substring(0, 200) + '...', // Truncated for outline
        sourceSection: section,
        taskOutlines,
      });
    }

    return {
      project: this.projectName,
      version: '1.0.0',
      description: structure.title || parsed.title || 'Generated from requirements',
      phaseOutlines,
      sourceChars: parsed.rawText.length,
      structureType: structure.type,
    };
  }

  /**
   * Pass 2: Expand each phase in isolation.
   * Generates full PRD by expanding each phase outline with detailed content.
   *
   * @param outline - PRD outline from Pass 1
   * @param parsed - Original parsed requirements
   * @returns Full PRD with expanded phases
   */
  async expandOutline(outline: PrdOutline, parsed: ParsedRequirements): Promise<PRD> {
    const now = new Date().toISOString();
    const phases: Phase[] = [];

    // Expand each phase in isolation
    for (const phaseOutline of outline.phaseOutlines) {
      const phase = await this.expandPhase(phaseOutline, parsed);
      phases.push(phase);
    }

    // Calculate metadata
    const metadata = this.calculateMetadata(phases);

    return {
      project: outline.project,
      version: outline.version,
      createdAt: now,
      updatedAt: now,
      branchName: 'ralph/main',
      description: outline.description,
      phases,
      metadata,
    };
  }

  /**
   * Expand a single phase with full details.
   * Can use AI or rule-based expansion depending on platform availability.
   *
   * @param phaseOutline - Phase outline to expand
   * @param parsed - Original parsed requirements
   * @returns Fully expanded Phase
   */
  async expandPhase(phaseOutline: PhaseOutline, parsed: ParsedRequirements): Promise<Phase> {
    const now = new Date().toISOString();
    const section = phaseOutline.sourceSection;

    // Try AI expansion if available
    if (this.platformRegistry && this.quotaManager && this.puppetMasterConfig) {
      const aiPhase = await this.expandPhaseWithAI(phaseOutline, parsed);
      if (aiPhase) {
        return aiPhase;
      }
    }

    // Rule-based expansion fallback
    const tasks = await this.expandTasks(phaseOutline, parsed);
    const acceptanceCriteria = this.extractAcceptanceCriteria(section.content, phaseOutline.id);
    const testPlan = await this.createTestPlan(section.content);
    const sourceRefs = this.generateSourceRefs(section, parsed);

    return {
      id: phaseOutline.id,
      title: section.title,
      description: section.content,
      status: 'pending' as ItemStatus,
      priority: 1,
      acceptanceCriteria,
      testPlan,
      tasks,
      sourceRefs,
      createdAt: now,
      notes: '',
    };
  }

  /**
   * AI-powered phase expansion.
   * Uses configured platform to generate detailed phase content.
   *
   * @param phaseOutline - Phase outline to expand
   * @param parsed - Original parsed requirements
   * @returns Expanded Phase or null if AI unavailable/failed
   */
  private async expandPhaseWithAI(
    phaseOutline: PhaseOutline,
    parsed: ParsedRequirements
  ): Promise<Phase | null> {
    const stepConfig = this.puppetMasterConfig?.startChain?.prd;
    const platform = stepConfig?.platform || this.puppetMasterConfig?.tiers.phase.platform;
    const model = stepConfig?.model || this.puppetMasterConfig?.tiers.phase.model;

    if (!platform || !model) {
      return null;
    }

    try {
      const canProceed = await this.quotaManager!.canProceed(platform);
      if (!canProceed.allowed) {
        console.warn(
          `[Multi-Pass PRD] Quota exhausted for ${platform}. Using rule-based expansion.`
        );
        return null;
      }

      const runner = this.platformRegistry!.get(platform);
      if (!runner) {
        return null;
      }

      // P1-G02: Get planMode from step config (default true for start-chain)
      const planMode = stepConfig?.planMode ?? true;

      const prompt = this.buildPhaseExpansionPrompt(phaseOutline, parsed);
      const request: ExecutionRequest = {
        prompt,
        model,
        workingDirectory: this.puppetMasterConfig!.project.workingDirectory,
        nonInteractive: true,
        timeout: 120_000, // 2 minutes per phase
        planMode, // P1-G02: Pass planMode to runner
      };

      const startTime = Date.now();
      const result = await runner.execute(request);
      const duration = Date.now() - startTime;

      if (this.usageTracker) {
        await this.usageTracker.track({
          platform,
          action: 'multi_pass_phase_expansion',
          tokens: result.tokensUsed || 0,
          durationMs: duration,
          success: result.success,
        });
      }

      if (!result.success) {
        return null;
      }

      // Parse AI response
      const phase = this.parsePhaseJson(result.output, phaseOutline);
      return phase;
    } catch (error) {
      console.warn(
        `[Multi-Pass PRD] AI expansion failed for phase ${phaseOutline.id}: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  /**
   * Build prompt for AI phase expansion.
   */
  private buildPhaseExpansionPrompt(phaseOutline: PhaseOutline, _parsed: ParsedRequirements): string {
    const assumptionsSection =
      this.interviewAssumptions.length > 0
        ? `\n\nINTERVIEW ASSUMPTIONS:\n${this.interviewAssumptions.map((a) => `- ${a}`).join('\n')}`
        : '';

    return `Expand the following phase outline into a detailed PRD phase structure.

PROJECT: ${this.projectName}

PHASE TO EXPAND:
ID: ${phaseOutline.id}
Title: ${phaseOutline.title}
Source Content:
${phaseOutline.sourceSection.content}

TASKS IN THIS PHASE:
${phaseOutline.taskOutlines.map((t) => `- ${t.id}: ${t.title}`).join('\n')}
${assumptionsSection}

OUTPUT FORMAT (JSON):
{
  "id": "${phaseOutline.id}",
  "title": "Phase title",
  "description": "Detailed description",
  "status": "pending",
  "priority": 1,
  "acceptanceCriteria": [
    { "id": "${phaseOutline.id}-AC-001", "description": "...", "type": "command|regex|file_exists|ai", "target": "..." }
  ],
  "testPlan": { "commands": ["npm test", "npm run lint"], "failFast": true },
  "tasks": [...],
  "notes": ""
}

RULES:
1. Preserve the phase ID exactly as given
2. Generate specific, testable acceptance criteria (no generic "implementation complete")
3. Include real test commands if detectable from content
4. Each task must have subtasks with specific acceptance criteria
5. Use type "command" for shell commands, "regex" for pattern matching, "file_exists" for files, "ai" for AI verification`;
  }

  /**
   * Parse AI response into Phase structure.
   */
  private parsePhaseJson(output: string, phaseOutline: PhaseOutline): Phase | null {
    try {
      const jsonMatch = output.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : output.trim();
      const jsonObjectMatch = jsonText.match(/\{[\s\S]*\}/);
      const finalJson = jsonObjectMatch ? jsonObjectMatch[0] : jsonText;

      const phase = JSON.parse(finalJson) as Phase;

      // Ensure ID matches outline
      phase.id = phaseOutline.id;

      // Add timestamps if missing
      const now = new Date().toISOString();
      if (!phase.createdAt) phase.createdAt = now;
      if (!phase.notes) phase.notes = '';

      return phase;
    } catch {
      return null;
    }
  }

  /**
   * Pass 3: AI coverage diff - identify missing requirements.
   *
   * @param parsed - Parsed requirements document
   * @param prd - Current PRD
   * @returns List of missing requirements
   */
  async coverageDiff(parsed: ParsedRequirements, prd: PRD): Promise<MissingRequirement[]> {
    // Use the coverage validator's AI diff if available
    const structure = detectDocumentStructure(
      parsed.sections,
      parsed.rawText,
      { failOnValidationError: false }
    );

    const report = await this.coverageValidator.computeCoverageReport(
      parsed,
      prd,
      structure.metrics,
      this.puppetMasterConfig?.project.workingDirectory ?? '.'
    );

    // Convert AI gaps to missing requirements format
    const missingRequirements: MissingRequirement[] = [...report.missingRequirements];

    if (report.aiDiff?.performed && report.aiDiff.gaps.length > 0) {
      for (const gap of report.aiDiff.gaps) {
        // Avoid duplicates
        const exists = missingRequirements.some(
          (m) => m.sectionPath === gap.sectionPath
        );
        if (!exists) {
          missingRequirements.push({
            sectionPath: gap.sectionPath,
            excerpt: gap.description,
          });
        }
      }
    }

    return missingRequirements;
  }

  /**
   * Pass 4: Fill gaps by adding missing requirements as new phases/tasks.
   *
   * @param prd - Current PRD
   * @param missingRequirements - List of missing requirements
   * @param passNumber - Current gap-fill pass number
   * @returns Updated PRD with gaps filled
   */
  async fillGaps(
    prd: PRD,
    missingRequirements: MissingRequirement[],
    passNumber: number
  ): Promise<GapFillResult> {
    const now = new Date().toISOString();
    let gapsFilled = 0;

    // Clone PRD to avoid mutation
    const updatedPrd: PRD = JSON.parse(JSON.stringify(prd));

    // Group missing requirements by potential phase
    const gapsByPhase = this.groupGapsByPhase(missingRequirements);

    for (const [phaseTitle, gaps] of Object.entries(gapsByPhase)) {
      // Check if we should add to existing phase or create new one
      const existingPhase = updatedPrd.phases.find(
        (p) => p.title.toLowerCase().includes(phaseTitle.toLowerCase())
      );

      if (existingPhase) {
        // Add as tasks to existing phase
        for (const gap of gaps) {
          const taskIndex = existingPhase.tasks.length + 1;
          const taskId = this.generateTaskIdFromPhase(existingPhase.id, taskIndex);

          const newTask: Task = {
            id: taskId,
            phaseId: existingPhase.id,
            title: this.generateTaskTitleFromGap(gap),
            description: gap.excerpt,
            status: 'pending' as ItemStatus,
            priority: 2, // Lower priority for gap-fill items
            acceptanceCriteria: this.generateGapCriteria(taskId, gap),
            testPlan: { commands: [], failFast: true },
            subtasks: [],
            createdAt: now,
            notes: `Added in gap-fill pass ${passNumber}`,
            sourceRefs: [
              {
                sourcePath: 'gap-fill',
                sectionPath: gap.sectionPath,
                excerptHash: this.calculateExcerptHash(gap.excerpt),
              },
            ],
          };

          existingPhase.tasks.push(newTask);
          gapsFilled++;
        }
      } else {
        // Create new phase for these gaps
        const phaseIndex = updatedPrd.phases.length + 1;
        const phaseId = this.generatePhaseId(phaseIndex);

        const tasks: Task[] = gaps.map((gap, idx) => {
          const taskId = this.generateTaskId(phaseIndex, idx + 1);
          return {
            id: taskId,
            phaseId,
            title: this.generateTaskTitleFromGap(gap),
            description: gap.excerpt,
            status: 'pending' as ItemStatus,
            priority: 2,
            acceptanceCriteria: this.generateGapCriteria(taskId, gap),
            testPlan: { commands: [], failFast: true },
            subtasks: [],
            createdAt: now,
            notes: `Added in gap-fill pass ${passNumber}`,
            sourceRefs: [
              {
                sourcePath: 'gap-fill',
                sectionPath: gap.sectionPath,
                excerptHash: this.calculateExcerptHash(gap.excerpt),
              },
            ],
          };
        });

        const newPhase: Phase = {
          id: phaseId,
          title: `Gap Fill: ${phaseTitle}`,
          description: `Additional requirements identified in coverage analysis (pass ${passNumber})`,
          status: 'pending' as ItemStatus,
          priority: 2,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks,
          createdAt: now,
          notes: `Created in gap-fill pass ${passNumber}`,
        };

        updatedPrd.phases.push(newPhase);
        gapsFilled += gaps.length;
      }
    }

    // Update metadata
    updatedPrd.metadata = this.calculateMetadata(updatedPrd.phases);
    updatedPrd.updatedAt = now;

    // Calculate remaining gaps (simplified - items that couldn't be categorized)
    const remainingGaps = missingRequirements.filter(
      (m) => !Object.values(gapsByPhase).flat().includes(m)
    );

    return {
      prd: updatedPrd,
      gapsFilled,
      remainingGaps,
      passNumber,
    };
  }

  /**
   * Group gaps by potential phase based on section path.
   */
  private groupGapsByPhase(
    gaps: MissingRequirement[]
  ): Record<string, MissingRequirement[]> {
    const grouped: Record<string, MissingRequirement[]> = {};

    for (const gap of gaps) {
      // Extract phase hint from section path (e.g., "Section 4 > Subsection" → "Section 4")
      const parts = gap.sectionPath.split('>').map((p) => p.trim());
      const phaseKey = parts[0] || 'Uncategorized';

      if (!grouped[phaseKey]) {
        grouped[phaseKey] = [];
      }
      grouped[phaseKey].push(gap);
    }

    return grouped;
  }

  /**
   * Generate a task title from a gap.
   */
  private generateTaskTitleFromGap(gap: MissingRequirement): string {
    // Use first 50 chars of excerpt or section path
    if (gap.excerpt && gap.excerpt.length > 0) {
      const cleanExcerpt = gap.excerpt.replace(/\n/g, ' ').trim();
      return cleanExcerpt.length > 50
        ? cleanExcerpt.substring(0, 47) + '...'
        : cleanExcerpt;
    }
    return gap.sectionPath;
  }

  /**
   * Generate acceptance criteria for a gap-fill task.
   */
  private generateGapCriteria(taskId: string, gap: MissingRequirement): Criterion[] {
    const description = gap.excerpt || gap.sectionPath;
    const baseType = this.criterionClassifier.classifyAcceptanceCriterion(description);

    const provisional: Criterion = {
      id: `${taskId}-AC-001`,
      description: `Implement: ${description.substring(0, 100)}`,
      type: baseType,
      target: '',
    };

    const target = this.criterionClassifier.generateVerificationTarget(provisional);
    const finalType = target.startsWith('AI_VERIFY:') ? 'ai' : baseType;

    return [
      {
        ...provisional,
        type: finalType,
        target,
      },
    ];
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper methods (adapted from PrdGenerator for consistency)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Single-pass fallback for small documents.
   */
  private async generateSinglePass(parsed: ParsedRequirements): Promise<PRD> {
    const now = new Date().toISOString();
    const structure = detectDocumentStructure(
      parsed.sections,
      parsed.rawText,
      { failOnValidationError: false }
    );

    const phases = await this.generatePhases(structure.phaseSections, parsed);
    const metadata = this.calculateMetadata(phases);
    const description = structure.title || parsed.title || 'Generated from requirements';

    return {
      project: this.projectName,
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
      branchName: 'ralph/main',
      description,
      phases,
      metadata,
    };
  }

  /**
   * Expand task outlines to full tasks.
   */
  private async expandTasks(phaseOutline: PhaseOutline, parsed: ParsedRequirements): Promise<Task[]> {
    const now = new Date().toISOString();
    const phaseIndex = parseInt(phaseOutline.id.replace('PH-', ''), 10);

    const tasks = await Promise.all(
      phaseOutline.taskOutlines.map(async (taskOutline, taskIndex) => {
        const section = taskOutline.sourceSection;
        const subtasks = await this.generateSubtasks(
          taskOutline.id,
          section.content,
          taskIndex + 1,
          phaseIndex,
          parsed,
          section
        );

        const acceptanceCriteria = this.extractAcceptanceCriteria(
          section.content,
          taskOutline.id
        );
        const testPlan = await this.createTestPlan(section.content);
        const sourceRefs = this.generateSourceRefs(section, parsed);

        return {
          id: taskOutline.id,
          phaseId: phaseOutline.id,
          title: section.title,
          description: section.content,
          status: 'pending' as ItemStatus,
          priority: 1,
          acceptanceCriteria,
          testPlan,
          subtasks,
          sourceRefs,
          createdAt: now,
          notes: '',
        };
      })
    );
    return tasks;
  }

  /**
   * Generate phases from sections (single-pass helper).
   */
  private async generatePhases(sections: ParsedSection[], parsed: ParsedRequirements): Promise<Phase[]> {
    const now = new Date().toISOString();

    const phases = await Promise.all(
      sections.map(async (section, index) => {
        const phaseId = this.generatePhaseId(index + 1);
        const tasks = await this.generateTasks(phaseId, section, index + 1, parsed);
        const acceptanceCriteria = this.extractAcceptanceCriteria(section.content, phaseId);
        const testPlan = await this.createTestPlan(section.content);
        const sourceRefs = this.generateSourceRefs(section, parsed);

        return {
          id: phaseId,
          title: section.title,
          description: section.content,
          status: 'pending' as ItemStatus,
          priority: 1,
          acceptanceCriteria,
          testPlan,
          tasks,
          sourceRefs,
          createdAt: now,
          notes: '',
        };
      })
    );
    return phases;
  }

  /**
   * Generate tasks from section children (single-pass helper).
   */
  private async generateTasks(
    phaseId: string,
    section: ParsedSection,
    phaseIndex: number,
    parsed: ParsedRequirements
  ): Promise<Task[]> {
    const now = new Date().toISOString();

    const tasks = await Promise.all(
      section.children.map(async (taskSection, taskIndex) => {
        const taskId = this.generateTaskId(phaseIndex, taskIndex + 1);
        const subtasks = await this.generateSubtasks(
          taskId,
          taskSection.content,
          taskIndex + 1,
          phaseIndex,
          parsed,
          taskSection
        );

        const acceptanceCriteria = this.extractAcceptanceCriteria(
          taskSection.content,
          taskId
        );
        const testPlan = await this.createTestPlan(taskSection.content);
        const sourceRefs = this.generateSourceRefs(taskSection, parsed, section);

        return {
          id: taskId,
          phaseId,
          title: taskSection.title,
          description: taskSection.content,
          status: 'pending' as ItemStatus,
          priority: 1,
          acceptanceCriteria,
          testPlan,
          subtasks,
          sourceRefs,
          createdAt: now,
          notes: '',
        };
      })
    );
    return tasks;
  }

  /**
   * Generate subtasks from content.
   */
  private async generateSubtasks(
    taskId: string,
    content: string,
    taskIndex: number,
    phaseIndex: number,
    parsed: ParsedRequirements,
    parentSection: ParsedSection
  ): Promise<Subtask[]> {
    const now = new Date().toISOString();
    const lines = content.split('\n').filter((line) => line.trim().length > 0);
    const maxSubtasks = 5;

    const chunkSize = Math.max(1, Math.ceil(lines.length / maxSubtasks));
    const chunks: string[] = [];

    for (let i = 0; i < lines.length; i += chunkSize) {
      chunks.push(lines.slice(i, i + chunkSize).join('\n'));
    }

    const limitedChunks = chunks.slice(0, maxSubtasks);

    const subtasks = await Promise.all(
      limitedChunks.map(async (chunk, subtaskIndex) => {
        const subtaskId = this.generateSubtaskId(phaseIndex, taskIndex, subtaskIndex + 1);
        const acceptanceCriteria = this.extractAcceptanceCriteria(chunk, subtaskId);
        const testPlan = await this.createTestPlan(chunk);
        const sourceRefs = this.generateSourceRefs(parentSection, parsed);

        return {
          id: subtaskId,
          taskId,
          title: `Subtask ${subtaskIndex + 1}`,
          description: chunk,
          status: 'pending' as ItemStatus,
          priority: 1,
          acceptanceCriteria,
          testPlan,
          iterations: [],
          maxIterations: 3,
          sourceRefs,
          createdAt: now,
          notes: '',
        };
      })
    );
    return subtasks;
  }

  /**
   * ID generation helpers.
   */
  private generatePhaseId(index: number): string {
    return `PH-${String(index).padStart(3, '0')}`;
  }

  private generateTaskId(phaseIndex: number, taskIndex: number): string {
    return `TK-${String(phaseIndex).padStart(3, '0')}-${String(taskIndex).padStart(3, '0')}`;
  }

  private generateTaskIdFromPhase(phaseId: string, taskIndex: number): string {
    const phaseNum = phaseId.replace('PH-', '');
    return `TK-${phaseNum}-${String(taskIndex).padStart(3, '0')}`;
  }

  private generateSubtaskId(
    phaseIndex: number,
    taskIndex: number,
    subtaskIndex: number
  ): string {
    return `ST-${String(phaseIndex).padStart(3, '0')}-${String(taskIndex).padStart(3, '0')}-${String(subtaskIndex).padStart(3, '0')}`;
  }

  /**
   * Extract acceptance criteria from content.
   */
  private extractAcceptanceCriteria(content: string, itemId: string): Criterion[] {
    const criteria: Criterion[] = [];
    const lines = content.split('\n');
    let criterionIndex = 1;

    for (const line of lines) {
      const trimmed = line.trim();
      const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
      const numberedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);

      if (bulletMatch || numberedMatch) {
        const description = bulletMatch ? bulletMatch[1] : numberedMatch![1];
        const baseType = this.criterionClassifier.classifyAcceptanceCriterion(description);

        const provisional: Criterion = {
          id: `${itemId}-AC-${String(criterionIndex).padStart(3, '0')}`,
          description,
          type: baseType,
          target: '',
        };

        const target = this.criterionClassifier.generateVerificationTarget(provisional);
        const finalType = target.startsWith('AI_VERIFY:') ? 'ai' : baseType;

        criteria.push({
          ...provisional,
          type: finalType,
          target,
        });
        criterionIndex++;
      }
    }

    // Fallback generic criterion
    if (criteria.length === 0) {
      const provisional: Criterion = {
        id: `${itemId}-AC-001`,
        description: 'Implementation complete',
        type: 'ai',
        target: '',
      };
      const target = this.criterionClassifier.generateVerificationTarget(provisional);
      criteria.push({ ...provisional, target });
    }

    return criteria;
  }

  /**
   * Create test plan from content using TestPlanGenerator.
   * Detects project type and generates appropriate test commands.
   */
  private async createTestPlan(_content: string, subtask?: Subtask): Promise<TestPlan> {
    const projectPath = this.puppetMasterConfig?.project.workingDirectory ?? '.';
    const generator = new TestPlanGenerator(projectPath);
    const detected = await generator.detectProject(projectPath);
    return generator.generateTestPlan(detected, subtask);
  }

  /**
   * Generate source references.
   */
  private generateSourceRefs(
    section: ParsedSection,
    parsed: ParsedRequirements,
    parentSection?: ParsedSection
  ): SourceRef[] {
    const pathParts: string[] = [];
    if (parsed.title) pathParts.push(parsed.title);
    if (parentSection) pathParts.push(parentSection.title);
    pathParts.push(section.title);

    return [
      {
        sourcePath: parsed.source.path,
        sectionPath: pathParts.join(' > '),
        excerptHash: this.calculateExcerptHash(section.content),
      },
    ];
  }

  /**
   * Calculate excerpt hash.
   */
  private calculateExcerptHash(excerpt: string): string {
    const hash = createHash('sha256');
    hash.update(excerpt);
    return hash.digest('hex');
  }

  /**
   * Calculate metadata counts.
   */
  private calculateMetadata(phases: Phase[]) {
    let totalTasks = 0;
    let totalSubtasks = 0;
    let completedPhases = 0;
    let completedTasks = 0;
    let completedSubtasks = 0;

    for (const phase of phases) {
      if (phase.status === 'passed') completedPhases++;

      for (const task of phase.tasks) {
        totalTasks++;
        if (task.status === 'passed') completedTasks++;

        for (const subtask of task.subtasks) {
          totalSubtasks++;
          if (subtask.status === 'passed') completedSubtasks++;
        }
      }
    }

    return {
      totalPhases: phases.length,
      completedPhases,
      totalTasks,
      completedTasks,
      totalSubtasks,
      completedSubtasks,
    };
  }
}
