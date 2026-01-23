/**
 * PRD Generator for RWM Puppet Master
 * 
 * Transforms ParsedRequirements into PRD structure following STATE_FILES.md Section 3.3.
 * Supports both AI-powered generation (via platform runners) and rule-based fallback.
 * 
 * See REQUIREMENTS.md Section 5.2 for PRD generation requirements.
 * See ROADMAP.md 6.2.2 for AI platform integration requirements.
 */

import type { ParsedRequirements, ParsedSection } from '../types/requirements.js';
import type { PRD, Phase, Task, Subtask, PRDMetadata, ItemStatus, SourceRef } from '../types/prd.js';
import type { Criterion, TestPlan } from '../types/tiers.js';
import type { PuppetMasterConfig } from '../types/config.js';
import type { Platform } from '../types/config.js';
import type { ExecutionRequest } from '../types/platforms.js';
import { PlatformRegistry } from '../platforms/registry.js';
import { QuotaManager } from '../platforms/quota-manager.js';
import { UsageTracker } from '../memory/usage-tracker.js';
import { buildPrdPrompt } from './prompts/prd-prompt.js';
import {
  detectDocumentStructure,
  StructureDetectionError,
  type DocumentStructure,
  type StructureDetectorOptions,
} from './structure-detector.js';
import { CriterionClassifier } from './criterion-classifier.js';
import { createHash } from 'crypto';

/**
 * Options for PRD generation.
 */
export interface PrdGeneratorOptions {
  /** Project name for the PRD */
  projectName: string;
  /** Maximum number of subtasks per task (default: 5) */
  maxSubtasksPerTask?: number;
  /** Maximum number of tasks per phase (default: 10) */
  maxTasksPerPhase?: number;
  /** Options for structure detection (default: use defaults from structure-detector) */
  structureDetectorOptions?: StructureDetectorOptions;
  /** FIX 2: Interview assumptions to include in PRD generation prompt */
  interviewAssumptions?: string[];
}

/**
 * Generator that transforms parsed requirements into PRD structure.
 * Supports AI-powered generation with rule-based fallback.
 */
export class PrdGenerator {
  private readonly projectName: string;
  private readonly maxSubtasksPerTask: number;
  private readonly maxTasksPerPhase: number;
  private readonly platformRegistry?: PlatformRegistry;
  private readonly quotaManager?: QuotaManager;
  private readonly config?: PuppetMasterConfig;
  private readonly usageTracker?: UsageTracker;
  private readonly structureDetectorOptions: StructureDetectorOptions;
  private readonly criterionClassifier: CriterionClassifier;
  /** FIX 2: Interview assumptions to include in PRD generation */
  private readonly interviewAssumptions: string[];

  constructor(
    options: PrdGeneratorOptions,
    platformRegistry?: PlatformRegistry,
    quotaManager?: QuotaManager,
    config?: PuppetMasterConfig,
    usageTracker?: UsageTracker
  ) {
    this.projectName = options.projectName;
    this.maxSubtasksPerTask = options.maxSubtasksPerTask ?? 5;
    this.maxTasksPerPhase = options.maxTasksPerPhase ?? 10;
    this.platformRegistry = platformRegistry;
    this.quotaManager = quotaManager;
    this.config = config;
    this.usageTracker = usageTracker;
    this.structureDetectorOptions = options.structureDetectorOptions ?? {};
    this.criterionClassifier = new CriterionClassifier();
    this.interviewAssumptions = options.interviewAssumptions ?? [];
  }

  /**
   * Main entry point: generates a PRD from parsed requirements using AI.
   * Falls back to rule-based generation if AI is unavailable or quota exhausted.
   * 
   * @param parsed - Parsed requirements document
   * @param useAI - Whether to attempt AI generation (default: true)
   * @returns Generated PRD structure
   */
  async generateWithAI(parsed: ParsedRequirements, useAI: boolean = true): Promise<PRD> {
    // If AI dependencies not provided, use fallback
    if (!useAI || !this.platformRegistry || !this.quotaManager || !this.config || !this.usageTracker) {
      return this.generate(parsed);
    }

    // Determine platform (use step-specific config or fallback to phase tier)
    // Config resolution order (P1-T04):
    // 1. config.startChain.prd.platform/model (step-specific)
    // 2. config.tiers.phase.platform/model (default phase tier)
    const stepConfig = this.config.startChain?.prd;
    const platform = stepConfig?.platform || this.config.tiers.phase.platform;
    const model = stepConfig?.model || this.config.tiers.phase.model;

    try {
      // Check quota before proceeding
      const canProceed = await this.quotaManager.canProceed(platform);
      if (!canProceed.allowed) {
        console.warn(`[PRD Generation] Quota exhausted for ${platform}: ${canProceed.reason}. Using rule-based fallback.`);
        return this.generate(parsed);
      }

      // Build prompt (FIX 2: include interview assumptions)
      const prompt = buildPrdPrompt(parsed, this.projectName, this.interviewAssumptions);

      // Get platform runner
      const runner = this.platformRegistry.get(platform);
      if (!runner) {
        console.warn(`[PRD Generation] Platform runner not available for ${platform}. Using rule-based fallback.`);
        return this.generate(parsed);
      }

      // Execute AI request
      const request: ExecutionRequest = {
        prompt,
        model,
        workingDirectory: this.config.project.workingDirectory,
        nonInteractive: true,
        timeout: 300_000, // 5 minutes for PRD generation
      };

      const startTime = Date.now();
      const result = await runner.execute(request);
      const duration = Date.now() - startTime;

      // Record usage
      await this.usageTracker.track({
        platform,
        action: 'prd_generation',
        tokens: result.tokensUsed || 0,
        durationMs: duration,
        success: result.success,
      });

      if (!result.success) {
        console.warn(`[PRD Generation] AI execution failed (exit code ${result.exitCode}). Using rule-based fallback.`);
        return this.generate(parsed);
      }

      // Parse JSON response
      try {
        const prd = this.parsePrdJson(result.output);
        
        // Validate basic structure
        if (!prd.project || !prd.phases || !Array.isArray(prd.phases)) {
          throw new Error('Invalid PRD structure: missing required fields');
        }

        console.log(`[PRD Generation] Successfully generated PRD using ${platform} (${prd.phases.length} phases)`);
        return prd;
      } catch (parseError) {
        console.warn(`[PRD Generation] Failed to parse AI response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        console.warn(`[PRD Generation] AI output preview: ${result.output.substring(0, 200)}...`);
        console.warn(`[PRD Generation] Using rule-based fallback.`);
        return this.generate(parsed);
      }
    } catch (error) {
      console.warn(`[PRD Generation] AI generation error: ${error instanceof Error ? error.message : String(error)}. Using rule-based fallback.`);
      return this.generate(parsed);
    }
  }

  /**
   * Rule-based PRD generation (fallback method).
   * This is the original implementation that uses heuristics to transform
   * parsed requirements into PRD structure.
   *
   * Uses structure detection to correctly handle documents with H1 title + H2 sections.
   *
   * @param parsed - Parsed requirements document
   * @returns Generated PRD structure
   * @throws StructureDetectionError if large document produces insufficient phases
   */
  generate(parsed: ParsedRequirements): PRD {
    const now = new Date().toISOString();

    // Detect document structure to determine correct phase sections
    const structure = detectDocumentStructure(
      parsed.sections,
      parsed.rawText,
      this.structureDetectorOptions
    );

    // Log structure detection for debugging
    console.log(
      `[PRD Generation] Structure detected: ${structure.type}, ` +
      `${structure.metrics.phasesCount} phases, ` +
      `${structure.metrics.headingsCount} headings, ` +
      `${structure.metrics.bulletsCount} bullets`
    );

    // Use detected phase sections instead of raw top-level sections
    const phases = this.generatePhases(structure.phaseSections, parsed);
    const metadata = this.calculateMetadata(phases);

    // Use detected title if available, otherwise fall back to parsed title
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
   * Generates phases from top-level sections.
   */
  generatePhases(sections: ParsedSection[], parsed: ParsedRequirements): Phase[] {
    const now = new Date().toISOString();
    return sections.map((section, index) => {
      const phaseId = this.generatePhaseId(index + 1);
      const tasks = this.generateTasks(phaseId, section, index + 1, parsed);
      const acceptanceCriteria = this.extractAcceptanceCriteria(section.content, phaseId);
      const testPlan = this.createTestPlan(section.content);
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
    });
  }

  /**
   * Generates tasks from a section's children.
   */
  generateTasks(phaseId: string, section: ParsedSection, phaseIndex: number, parsed: ParsedRequirements): Task[] {
    const now = new Date().toISOString();
    const taskSections = section.children.slice(0, this.maxTasksPerPhase);

    return taskSections.map((taskSection, taskIndex) => {
      const taskId = this.generateTaskId(phaseIndex, taskIndex + 1);
      const subtasks = this.generateSubtasks(taskId, taskSection.content, taskIndex + 1, phaseIndex, parsed, section);
      const acceptanceCriteria = this.extractAcceptanceCriteria(taskSection.content, taskId);
      const testPlan = this.createTestPlan(taskSection.content);
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
    });
  }

  /**
   * Generates subtasks by breaking task content into smaller chunks.
   */
  generateSubtasks(
    taskId: string,
    content: string,
    taskIndex: number,
    phaseIndex: number,
    parsed: ParsedRequirements,
    parentSection: ParsedSection
  ): Subtask[] {
    const now = new Date().toISOString();
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    // Split content into chunks (simple heuristic: maxSubtasksPerTask chunks)
    const chunkSize = Math.max(1, Math.ceil(lines.length / this.maxSubtasksPerTask));
    const chunks: string[] = [];
    
    for (let i = 0; i < lines.length; i += chunkSize) {
      const chunk = lines.slice(i, i + chunkSize).join('\n');
      chunks.push(chunk);
    }

    // Limit to maxSubtasksPerTask
    const limitedChunks = chunks.slice(0, this.maxSubtasksPerTask);

    return limitedChunks.map((chunk, subtaskIndex) => {
      const subtaskId = this.generateSubtaskId(phaseIndex, taskIndex, subtaskIndex + 1);
      const acceptanceCriteria = this.extractAcceptanceCriteria(chunk, subtaskId);
      const testPlan = this.createTestPlan(chunk);
      // For subtasks, use the parent section (task section) as the source reference
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
    });
  }

  /**
   * Generates a phase ID in format PH-XXX.
   */
  generatePhaseId(index: number): string {
    return `PH-${String(index).padStart(3, '0')}`;
  }

  /**
   * Generates a task ID in format TK-XXX-XXX.
   */
  generateTaskId(phaseIndex: number, taskIndex: number): string {
    return `TK-${String(phaseIndex).padStart(3, '0')}-${String(taskIndex).padStart(3, '0')}`;
  }

  /**
   * Generates a subtask ID in format ST-XXX-XXX-XXX.
   */
  generateSubtaskId(phaseIndex: number, taskIndex: number, subtaskIndex: number): string {
    return `ST-${String(phaseIndex).padStart(3, '0')}-${String(taskIndex).padStart(3, '0')}-${String(subtaskIndex).padStart(3, '0')}`;
  }

  /**
   * Extracts acceptance criteria from content.
   * Looks for bullet points and numbered lists.
   */
  extractAcceptanceCriteria(content: string, itemId: string): Criterion[] {
    const criteria: Criterion[] = [];
    const lines = content.split('\n');

    let criterionIndex = 1;
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check for bullet points (-, *, •) or numbered lists
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

    // If no criteria found, create a generic one
    if (criteria.length === 0) {
      const description = 'Implementation complete';
      const provisional: Criterion = {
        id: `${itemId}-AC-001`,
        description,
        type: 'ai',
        target: '',
      };
      const target = this.criterionClassifier.generateVerificationTarget(provisional);
      criteria.push({
        ...provisional,
        target,
      });
    }

    return criteria;
  }

  /**
   * Creates a default test plan from content.
   * Initially returns empty test plan (can be enhanced later).
   */
  createTestPlan(_content: string): TestPlan {
    return {
      commands: [],
      failFast: true,
    };
  }

  /**
   * Calculates metadata counts from phases.
   */
  calculateMetadata(phases: Phase[]): PRDMetadata {
    let totalTasks = 0;
    let totalSubtasks = 0;
    let completedPhases = 0;
    let completedTasks = 0;
    let completedSubtasks = 0;

    for (const phase of phases) {
      if (phase.status === 'passed') {
        completedPhases++;
      }

      for (const task of phase.tasks) {
        totalTasks++;
        if (task.status === 'passed') {
          completedTasks++;
        }

        for (const subtask of task.subtasks) {
          totalSubtasks++;
          if (subtask.status === 'passed') {
            completedSubtasks++;
          }
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

  /**
   * Generates source references for a PRD item from a section.
   * Maps the section back to the requirements document and creates a SourceRef.
   * 
   * @param section - The section this PRD item is derived from
   * @param parsed - The parsed requirements document
   * @param parentSection - Optional parent section for building hierarchical paths
   * @returns Array of source references
   */
  private generateSourceRefs(
    section: ParsedSection,
    parsed: ParsedRequirements,
    parentSection?: ParsedSection
  ): SourceRef[] {
    // Build section path: "Title > Section > Subsection"
    const pathParts: string[] = [];
    if (parsed.title) {
      pathParts.push(parsed.title);
    }
    if (parentSection) {
      pathParts.push(parentSection.title);
    }
    pathParts.push(section.title);
    const sectionPath = pathParts.join(' > ');

    // Calculate hash of section content
    const excerptHash = this.calculateExcerptHash(section.content);

    return [
      {
        sourcePath: parsed.source.path,
        sectionPath,
        excerptHash,
      },
    ];
  }

  /**
   * Calculates SHA-256 hash of excerpt text.
   * 
   * @param excerpt - Text excerpt to hash
   * @returns Hex digest of the hash (64 characters)
   */
  private calculateExcerptHash(excerpt: string): string {
    const hash = createHash('sha256');
    hash.update(excerpt);
    return hash.digest('hex');
  }

  /**
   * Parses JSON response from AI platform into PRD structure.
   * Handles JSON wrapped in markdown code blocks or plain JSON.
   * 
   * @param output - Raw output from AI platform
   * @returns Parsed PRD structure
   */
  private parsePrdJson(output: string): PRD {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = output.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1] : output.trim();

    // Try to find JSON object in the text
    const jsonObjectMatch = jsonText.match(/\{[\s\S]*\}/);
    const finalJson = jsonObjectMatch ? jsonObjectMatch[0] : jsonText;

    try {
      const parsed = JSON.parse(finalJson) as PRD;
      
      // Ensure required fields have defaults
      const now = new Date().toISOString();
      if (!parsed.createdAt) parsed.createdAt = now;
      if (!parsed.updatedAt) parsed.updatedAt = now;
      if (!parsed.version) parsed.version = '1.0.0';
      if (!parsed.branchName) parsed.branchName = 'ralph/main';
      if (!parsed.project) parsed.project = this.projectName;
      if (!parsed.description) parsed.description = 'Generated from requirements';
      if (!parsed.metadata) {
        parsed.metadata = this.calculateMetadata(parsed.phases || []);
      }

      // sourceRefs are optional and will be parsed from AI output if present
      // No need to validate or transform them - they should already be in correct format

      return parsed;
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
