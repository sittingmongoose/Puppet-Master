/**
 * Start Chain Pipeline for RWM Puppet Master
 * 
 * Orchestrates the complete start chain workflow from requirements to execution-ready project.
 * Generates PRD, architecture document, and tier plans using AI-powered generation.
 * 
 * See REQUIREMENTS.md Section 5 (Start Chain Pipeline) and GUI_FUNCTIONAL_IMPLEMENTATION_PLAN.md HP-4.
 */

import type { ParsedRequirements } from '../../types/requirements.js';
import type { PRD } from '../../types/prd.js';
import type { PuppetMasterConfig } from '../../types/config.js';
import type { TierPlan } from '../../start-chain/tier-plan-generator.js';
import type { EventBus } from '../../logging/event-bus.js';
import type { RequirementsInventory, IdMap, InventoryResult } from '../../types/requirements-inventory.js';
import { PlatformRegistry } from '../../platforms/registry.js';
import { QuotaManager } from '../../platforms/quota-manager.js';
import { UsageTracker } from '../../memory/usage-tracker.js';
import { PrdGenerator } from '../../start-chain/prd-generator.js';
import { ArchGenerator } from '../../start-chain/arch-generator.js';
import { TierPlanGenerator } from '../../start-chain/tier-plan-generator.js';
import { ValidationGate } from '../../start-chain/validation-gate.js';
import { PrdManager } from '../../memory/prd-manager.js';
import { RequirementsInterviewer } from '../../start-chain/requirements-interviewer.js';
import type { InterviewResult } from '../../start-chain/requirements-interviewer.js';
import { TraceabilityManager } from '../../start-chain/traceability.js';
import { CoverageValidator } from '../../start-chain/validators/coverage-validator.js';
import type { CoverageReport } from '../../start-chain/validators/coverage-validator.js';
import { detectDocumentStructure } from '../../start-chain/structure-detector.js';
import type { ValidationResult } from '../../start-chain/validation-gate.js';
import { RequirementsInventoryBuilder } from '../../start-chain/requirements-inventory.js';
import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Result of executing the start chain pipeline.
 */
export interface StartChainResult {
  /** Generated PRD */
  prd: PRD;
  /** Path to saved PRD file */
  prdPath: string;
  /** Generated architecture markdown */
  architecture: string;
  /** Path to saved architecture.md file */
  architecturePath: string;
  /** Generated tier plan */
  tierPlan: TierPlan;
  /** Paths to saved tier plan files (if saved separately) */
  planPaths: string[];
  /** Project path where artifacts were saved */
  projectPath: string;
  /** Requirements interview result (optional) */
  interview?: InterviewResult;
  /** Paths to saved interview files (optional) */
  interviewPaths?: {
    questionsPath: string;
    assumptionsPath: string;
    jsonPath: string; // FIX 6: Add JSON path
  };
  /** Coverage validation report */
  coverageReport?: CoverageReport;
  /** Path to saved coverage report */
  coverageReportPath?: string;
  /** Requirements inventory result (optional, P1-T20) */
  inventoryResult?: InventoryResult;
  /** Paths to saved inventory files (optional, P1-T20) */
  inventoryPaths?: {
    inventoryPath: string;
    idMapPath: string;
    parsedPath: string;
  };
}

/**
 * Start Chain Pipeline class.
 * Orchestrates the complete workflow from requirements to execution-ready project.
 */
export class StartChainPipeline {
  private readonly config: PuppetMasterConfig;
  private readonly platformRegistry: PlatformRegistry;
  private readonly quotaManager: QuotaManager;
  private readonly usageTracker: UsageTracker;
  private readonly eventBus?: EventBus;

  constructor(
    config: PuppetMasterConfig,
    platformRegistry: PlatformRegistry,
    quotaManager: QuotaManager,
    usageTracker: UsageTracker,
    eventBus?: EventBus
  ) {
    this.config = config;
    this.platformRegistry = platformRegistry;
    this.quotaManager = quotaManager;
    this.usageTracker = usageTracker;
    this.eventBus = eventBus;
  }

  /**
   * Execute the complete start chain pipeline.
   *
   * @param params - Pipeline execution parameters
   * @returns Result with all generated artifacts and their paths
   * @throws Error if pipeline execution fails
   */
  async execute(params: {
    parsed: ParsedRequirements;
    projectPath: string;
    projectName?: string;
    skipInterview?: boolean;
    skipInventory?: boolean;
  }): Promise<StartChainResult> {
    const { parsed, projectPath, projectName, skipInterview, skipInventory } = params;
    const projectNameFinal = projectName || parsed.title || 'Untitled Project';

    let interview: InterviewResult | undefined;
    let interviewPaths: { questionsPath: string; assumptionsPath: string; jsonPath: string } | undefined;
    let inventoryResult: InventoryResult | undefined;
    let inventoryPaths: { inventoryPath: string; idMapPath: string; parsedPath: string } | undefined;

    // Step 0: Requirements Inventory (P1-T20, optional but recommended)
    if (!skipInventory) {
      await this.publishStep('requirements_inventory', 'started');
      const { result, paths } = await this.buildRequirementsInventory(parsed, projectPath);
      inventoryResult = result;
      inventoryPaths = paths;

      // Validate inventory size
      this.validateInventorySize(inventoryResult, parsed);

      // Emit EventBus event for inventory completion
      if (this.eventBus) {
        this.eventBus.emit({
          type: 'requirements_inventory_complete',
          totalRequirements: inventoryResult.inventory.stats.totalRequirements,
          aiRefined: inventoryResult.aiRefined,
          warnings: inventoryResult.warnings,
          timestamp: new Date().toISOString(),
        });
      }

      await this.publishStep('requirements_inventory', 'completed');
    }

    // Step 1: Requirements Interview (optional)
    if (!skipInterview) {
      await this.publishStep('requirements_interview', 'started');
      interview = await this.conductInterview(parsed, projectNameFinal);
      this.validateCriticalQuestions(interview); // FIX 1: Gate on critical questions
      interviewPaths = await this.saveInterview(projectPath, interview);

      // FIX 5: Emit EventBus event for interview completion
      if (this.eventBus) {
        this.eventBus.emit({
          type: 'requirements_interview_complete',
          questionsCount: interview.questions.length,
          criticalCount: interview.questions.filter(q => q.priority === 'critical').length,
          timestamp: interview.timestamp,
        });
      }

      await this.publishStep('requirements_interview', 'completed');
    }

    // Step 2: Generate PRD via AI (formerly Step 1)
    // FIX 2: Pass interview to include assumptions in PRD generation
    await this.publishStep('generate_prd', 'started');
    const prd = await this.generatePRD(parsed, projectNameFinal, interview);
    await this.publishStep('generate_prd', 'completed');

    // Step 3: Generate architecture.md via AI (formerly Step 2)
    await this.publishStep('generate_architecture', 'started');
    const architecture = await this.generateArchitecture(parsed, prd, projectNameFinal);
    await this.publishStep('generate_architecture', 'completed');

    // Step 4: Generate tier plans (formerly Step 3)
    await this.publishStep('generate_tier_plans', 'started');
    const tierPlan = this.generateTierPlan(prd);
    await this.publishStep('generate_tier_plans', 'completed');

    // Step 5: Validate all artifacts (formerly Step 4)
    await this.publishStep('validate', 'started');
    const validation = this.validateArtifacts(prd, architecture, tierPlan);
    if (!validation.valid) {
      const errorMessages = validation.errors.map(e => e.message).join('; ');
      throw new Error(`Start Chain validation failed: ${errorMessages}`);
    }
    await this.publishStep('validate', 'completed');

    // Step 5.5: Coverage validation (NEW)
    await this.publishStep('coverage_validation', 'started');
    const { coverageReport, coverageValidation, coverageReportPath } =
      await this.validateCoverage(parsed, prd, projectPath);

    if (!coverageValidation.valid) {
      const errorMessages = coverageValidation.errors.map(e => e.message).join('; ');
      throw new Error(`Coverage validation failed: ${errorMessages}`);
    }

    // Log warnings (non-blocking)
    for (const warning of coverageValidation.warnings) {
      console.warn(`[Coverage] WARNING: ${warning.message}`);
    }

    await this.publishStep('coverage_validation', 'completed');

    // Step 6: Save all artifacts (formerly Step 5)
    await this.publishStep('save_artifacts', 'started');
    const savedPaths = await this.saveArtifacts(projectPath, prd, architecture, tierPlan, parsed);
    await this.publishStep('save_artifacts', 'completed');

    // Emit completion event
    if (this.eventBus) {
      this.eventBus.emit({
        type: 'start_chain_complete',
        projectPath,
        artifacts: {
          prdPath: savedPaths.prdPath,
          architecturePath: savedPaths.architecturePath,
          planPaths: savedPaths.planPaths,
        },
        timestamp: new Date().toISOString(),
      });
    }

    return {
      prd,
      prdPath: savedPaths.prdPath,
      architecture,
      architecturePath: savedPaths.architecturePath,
      tierPlan,
      planPaths: savedPaths.planPaths,
      projectPath,
      interview,
      interviewPaths,
      coverageReport,
      coverageReportPath,
      inventoryResult,
      inventoryPaths,
    };
  }

  /**
   * Generate PRD from parsed requirements using AI.
   * FIX 2: Accepts optional interview to pass assumptions to the prompt.
   * P1-T05: Uses multi-pass generation for large documents when enabled.
   * 
   * Platform/Model Selection (P1-T04):
   * The PrdGenerator resolves platform/model using this fallback chain:
   * 1. config.startChain.prd.platform/model (if step-specific config exists)
   * 2. config.tiers.phase.platform/model (default phase tier)
   * 
   * CLI overrides are applied before this pipeline is instantiated.
   */
  private async generatePRD(
    parsed: ParsedRequirements,
    projectName: string,
    interview?: InterviewResult
  ): Promise<PRD> {
    // P1-T05: Extract multi-pass config from startChain config
    const multiPassConfig = this.config.startChain?.multiPass;

    const prdGenerator = new PrdGenerator(
      {
        projectName,
        interviewAssumptions: interview?.assumptions, // FIX 2: Pass assumptions
        multiPassConfig: multiPassConfig ? {
          enabled: multiPassConfig.enabled,
          largeDocThreshold: multiPassConfig.largeDocThreshold,
          maxRepairPasses: multiPassConfig.maxRepairPasses,
          coverageThreshold: multiPassConfig.coverageThreshold,
        } : undefined,
      },
      this.platformRegistry,
      this.quotaManager,
      this.config,
      this.usageTracker
    );

    // Use AI generation (useAI=true)
    // P1-T05: generateWithAI now automatically uses multi-pass for large docs
    return prdGenerator.generateWithAI(parsed, true);
  }

  /**
   * Generate architecture markdown from parsed requirements and PRD using AI.
   * 
   * Platform/Model Selection (P1-T04):
   * The ArchGenerator resolves platform/model using this fallback chain:
   * 1. config.startChain.architecture.platform/model (if step-specific config exists)
   * 2. config.tiers.phase.platform/model (default phase tier)
   * 
   * CLI overrides are applied before this pipeline is instantiated.
   */
  private async generateArchitecture(
    parsed: ParsedRequirements,
    prd: PRD,
    projectName: string
  ): Promise<string> {
    const archGenerator = new ArchGenerator(
      { projectName },
      this.platformRegistry,
      this.quotaManager,
      this.config,
      this.usageTracker
    );

    // Use AI generation (useAI=true)
    return archGenerator.generateWithAI(parsed, prd, true);
  }

  /**
   * Generate tier plan from PRD structure.
   */
  private generateTierPlan(prd: PRD): TierPlan {
    const tierPlanGenerator = new TierPlanGenerator(this.config);
    return tierPlanGenerator.generate(prd);
  }

  /**
   * Validate all generated artifacts.
   */
  private validateArtifacts(
    prd: PRD,
    architecture: string,
    tierPlan: TierPlan
  ) {
    const validationGate = new ValidationGate();
    return validationGate.validateAll(prd, architecture, tierPlan, this.config);
  }

  /**
   * Save all generated artifacts to the project directory.
   */
  private async saveArtifacts(
    projectPath: string,
    prd: PRD,
    architecture: string,
    tierPlan: TierPlan,
    parsed: ParsedRequirements
  ): Promise<{
    prdPath: string;
    architecturePath: string;
    planPaths: string[];
  }> {
    const puppetMasterDir = join(projectPath, '.puppet-master');

    // Ensure .puppet-master directory exists
    await fs.mkdir(puppetMasterDir, { recursive: true });

    // Ensure plans directory exists
    const plansDir = join(puppetMasterDir, 'plans');
    await fs.mkdir(plansDir, { recursive: true });

    // Save PRD
    const prdPath = join(puppetMasterDir, 'prd.json');
    const prdManager = new PrdManager(prdPath);
    await prdManager.save(prd);

    // Save architecture
    const architecturePath = join(puppetMasterDir, 'architecture.md');
    await fs.writeFile(architecturePath, architecture, 'utf-8');

    // Save tier plans (phase and task plans)
    // Note: Tier plans could be saved as individual files or as a single file
    // For now, we'll save a single tier-plan.json file
    // Individual phase/task plans could be saved separately if needed
    const tierPlanPath = join(plansDir, 'tier-plan.json');
    await fs.writeFile(
      tierPlanPath,
      JSON.stringify(tierPlan, null, 2),
      'utf-8'
    );

    // Optionally save individual phase/task plans
    const planPaths: string[] = [tierPlanPath];
    for (const phasePlan of tierPlan.phases) {
      const phasePlanPath = join(plansDir, `phase-${phasePlan.phaseId}-plan.json`);
      await fs.writeFile(
        phasePlanPath,
        JSON.stringify(phasePlan, null, 2),
        'utf-8'
      );
      planPaths.push(phasePlanPath);

      // Save task plans
      for (const taskPlan of phasePlan.tasks) {
        const taskPlanPath = join(plansDir, `task-${taskPlan.taskId}-plan.json`);
        await fs.writeFile(
          taskPlanPath,
          JSON.stringify(taskPlan, null, 2),
          'utf-8'
        );
        planPaths.push(taskPlanPath);
      }
    }

    // Save traceability matrix
    await this.saveTraceabilityMatrix(projectPath, parsed, prd);

    return {
      prdPath,
      architecturePath,
      planPaths,
    };
  }

  /**
   * Generates and saves the traceability matrix to `.puppet-master/requirements/traceability.json`.
   * 
   * @param projectPath - Project root path
   * @param parsed - Parsed requirements document
   * @param prd - Generated PRD
   */
  private async saveTraceabilityMatrix(
    projectPath: string,
    parsed: ParsedRequirements,
    prd: PRD
  ): Promise<void> {
    const puppetMasterDir = join(projectPath, '.puppet-master');
    const requirementsDir = join(puppetMasterDir, 'requirements');

    // Ensure requirements directory exists (may already exist from saveInterview)
    await fs.mkdir(requirementsDir, { recursive: true });

    // Build traceability matrix
    const traceabilityManager = new TraceabilityManager();
    const matrix = traceabilityManager.buildTraceabilityMatrix(parsed, prd);

    // Save to traceability.json
    const traceabilityPath = join(requirementsDir, 'traceability.json');
    await fs.writeFile(
      traceabilityPath,
      JSON.stringify(matrix, null, 2),
      'utf-8'
    );
  }

  /**
   * Validates coverage of requirements in the PRD.
   * Returns coverage report and validation result.
   */
  private async validateCoverage(
    parsed: ParsedRequirements,
    prd: PRD,
    projectPath: string
  ): Promise<{
    coverageReport: CoverageReport;
    coverageValidation: ValidationResult;
    coverageReportPath: string;
  }> {
    // Get coverage config from main config
    const coverageConfig = this.config?.startChain?.coverage;

    const coverageValidator = new CoverageValidator(
      coverageConfig,
      this.platformRegistry,
      this.quotaManager,
      this.config
    );

    // Get metrics from structure detection
    const structure = detectDocumentStructure(
      parsed.sections,
      parsed.rawText,
      { failOnValidationError: false }
    );

    // Compute full coverage report (includes AI diff if enabled)
    const coverageReport = await coverageValidator.computeCoverageReport(
      parsed,
      prd,
      structure.metrics,
      projectPath
    );

    // Get validation result
    const coverageValidation = coverageValidator.validateCoverage(
      parsed,
      prd,
      structure.metrics
    );

    // Persist coverage report
    const coverageReportPath = await this.saveCoverageReport(projectPath, coverageReport);

    return { coverageReport, coverageValidation, coverageReportPath };
  }

  /**
   * Saves coverage report to .puppet-master/requirements/coverage.json
   */
  private async saveCoverageReport(
    projectPath: string,
    report: CoverageReport
  ): Promise<string> {
    const requirementsDir = join(projectPath, '.puppet-master', 'requirements');
    await fs.mkdir(requirementsDir, { recursive: true });

    const coveragePath = join(requirementsDir, 'coverage.json');
    await fs.writeFile(coveragePath, JSON.stringify(report, null, 2), 'utf-8');

    return coveragePath;
  }

  /**
   * Conduct requirements interview to identify gaps and generate questions.
   * 
   * Platform/Model Selection (P1-T04):
   * The RequirementsInterviewer resolves platform/model using this fallback chain:
   * 1. config.startChain.requirementsInterview.platform/model (if step-specific config exists)
   * 2. config.tiers.phase.platform/model (default phase tier)
   * 
   * CLI overrides are applied before this pipeline is instantiated.
   */
  private async conductInterview(
    parsed: ParsedRequirements,
    projectName: string
  ): Promise<InterviewResult> {
    const interviewer = new RequirementsInterviewer(
      { projectName },
      this.platformRegistry,
      this.quotaManager,
      this.config,
      this.usageTracker
    );

    return interviewer.interviewWithAI(parsed, true);
  }

  /**
   * Save interview results to files.
   * FIX 6: Now also saves interview.json for programmatic access.
   */
  private async saveInterview(
    projectPath: string,
    interview: InterviewResult
  ): Promise<{ questionsPath: string; assumptionsPath: string; jsonPath: string }> {
    const puppetMasterDir = join(projectPath, '.puppet-master');
    const requirementsDir = join(puppetMasterDir, 'requirements');

    // Ensure requirements directory exists
    await fs.mkdir(requirementsDir, { recursive: true });

    // Generate questions.md
    const questionsPath = join(requirementsDir, 'questions.md');
    const questionsContent = this.formatQuestionsMarkdown(interview);
    await fs.writeFile(questionsPath, questionsContent, 'utf-8');

    // Generate assumptions.md
    const assumptionsPath = join(requirementsDir, 'assumptions.md');
    const assumptionsContent = this.formatAssumptionsMarkdown(interview);
    await fs.writeFile(assumptionsPath, assumptionsContent, 'utf-8');

    // FIX 6: Save interview.json for programmatic access
    const jsonPath = join(requirementsDir, 'interview.json');
    await fs.writeFile(jsonPath, JSON.stringify(interview, null, 2), 'utf-8');

    return { questionsPath, assumptionsPath, jsonPath };
  }

  /**
   * Format interview results as questions markdown.
   */
  private formatQuestionsMarkdown(interview: InterviewResult): string {
    const lines: string[] = [
      '# Requirements Interview Questions',
      '',
      `Generated: ${interview.timestamp}`,
      `Source: ${interview.sourceDocument.path}`,
      '',
      '## Qualifying Questions',
      '',
    ];

    // Group questions by priority
    const byPriority = {
      critical: interview.questions.filter(q => q.priority === 'critical'),
      high: interview.questions.filter(q => q.priority === 'high'),
      medium: interview.questions.filter(q => q.priority === 'medium'),
      low: interview.questions.filter(q => q.priority === 'low'),
    };

    for (const [priority, questions] of Object.entries(byPriority)) {
      if (questions.length > 0) {
        lines.push(`### ${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`);
        lines.push('');

        for (const q of questions) {
          lines.push(`**${q.id}** [${q.category}]: ${q.question}`);
          lines.push('');
          lines.push(`*Rationale:* ${q.rationale}`);
          lines.push('');
          lines.push(`*Default Assumption:* ${q.defaultAssumption}`);
          lines.push('');
          lines.push('---');
          lines.push('');
        }
      }
    }

    // Add Coverage Checklist
    lines.push('## Coverage Checklist');
    lines.push('');
    lines.push('Major component categories and their coverage status:');
    lines.push('');

    for (const coverage of interview.coverageChecklist) {
      const categoryName = coverage.category.replace(/_/g, ' ').toUpperCase();

      if (coverage.status === 'covered') {
        lines.push(`- [x] **${categoryName}**: Covered`);
        if (coverage.citations && coverage.citations.length > 0) {
          lines.push(`  - Citations: ${coverage.citations.join(', ')}`);
        }
      } else if (coverage.status === 'missing') {
        lines.push(`- [ ] **${categoryName}**: Missing`);
        if (coverage.topQuestion) {
          lines.push(`  - Question: ${coverage.topQuestion}`);
        }
        if (coverage.defaultAssumption) {
          lines.push(`  - Default: ${coverage.defaultAssumption}`);
        }
      } else if (coverage.status === 'out_of_scope') {
        lines.push(`- [-] **${categoryName}**: Out of Scope`);
        if (coverage.rationale) {
          lines.push(`  - Rationale: ${coverage.rationale}`);
        }
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format interview results as assumptions markdown.
   */
  private formatAssumptionsMarkdown(interview: InterviewResult): string {
    const lines: string[] = [
      '# Default Assumptions',
      '',
      `Generated: ${interview.timestamp}`,
      `Source: ${interview.sourceDocument.path}`,
      '',
      'These assumptions will be used for PRD generation unless overridden:',
      '',
    ];

    for (const q of interview.questions) {
      const categoryName = q.category.replace(/_/g, ' ').toUpperCase();
      lines.push(`## ${categoryName}`);
      lines.push('');
      lines.push(`**Question:** ${q.question}`);
      lines.push('');
      lines.push(`**Assumption:** ${q.defaultAssumption}`);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Emit step event to EventBus if available.
   */
  private async publishStep(step: string, status: 'started' | 'completed' | 'failed'): Promise<void> {
    if (this.eventBus) {
      this.eventBus.emit({
        type: 'start_chain_step',
        step,
        status,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * FIX 1: Validate critical questions and gate PRD generation if required.
   *
   * If there are unanswered critical questions and the config disallows proceeding,
   * throws an error to stop the pipeline.
   *
   * @param interview - Interview result containing questions
   * @throws Error if critical questions exist and allowUnansweredCritical is false
   */
  private validateCriticalQuestions(interview: InterviewResult): void {
    const criticalQuestions = interview.questions.filter(q => q.priority === 'critical');
    const allowProceed = this.config?.startChain?.requirementsInterview?.allowUnansweredCritical ?? true;

    if (criticalQuestions.length > 0 && !allowProceed) {
      const questionList = criticalQuestions.map(q => `- ${q.id}: ${q.question}`).join('\n');
      throw new Error(
        `GATED: ${criticalQuestions.length} critical question(s) require answers before PRD generation:\n\n${questionList}\n\n` +
        `To proceed with default assumptions, set startChain.requirementsInterview.allowUnansweredCritical: true in your config.`
      );
    } else if (criticalQuestions.length > 0) {
      console.warn(
        `[Requirements Interview] WARNING: ${criticalQuestions.length} critical question(s) have default assumptions. ` +
        `Review .puppet-master/requirements/assumptions.md before proceeding.`
      );
    }
  }

  /**
   * Build requirements inventory from parsed requirements (P1-T20).
   *
   * @param parsed - Parsed requirements document
   * @param projectPath - Project path for saving artifacts
   * @returns Inventory result and paths to saved files
   */
  private async buildRequirementsInventory(
    parsed: ParsedRequirements,
    projectPath: string
  ): Promise<{
    result: InventoryResult;
    paths: { inventoryPath: string; idMapPath: string; parsedPath: string };
  }> {
    const inventoryConfig = this.config?.startChain?.inventory;

    const builder = new RequirementsInventoryBuilder(
      {
        enableAIRefinement: inventoryConfig?.enabled !== false,
      },
      this.platformRegistry,
      this.quotaManager,
      this.config,
      this.usageTracker
    );

    // Build inventory (includes loading/updating ID map)
    const result = await builder.build(parsed, projectPath, inventoryConfig?.enabled !== false);

    // Log warnings
    for (const warning of result.warnings) {
      console.warn(`[Requirements Inventory] WARNING: ${warning}`);
    }

    // Save all artifacts
    const inventoryPath = await builder.saveInventory(projectPath, result.inventory);
    const idMapPath = await builder.saveIdMap(projectPath, result.idMap);
    const parsedPath = await builder.saveParsedRequirements(projectPath, parsed);

    return {
      result,
      paths: { inventoryPath, idMapPath, parsedPath },
    };
  }

  /**
   * Validate inventory size against source document (P1-T20).
   *
   * @param result - Inventory result to validate
   * @param parsed - Parsed requirements document for comparison
   * @throws Error if inventory is suspiciously small
   */
  private validateInventorySize(result: InventoryResult, parsed: ParsedRequirements): void {
    const totalRequirements = result.inventory.stats.totalRequirements;
    const sourceKChars = parsed.rawText.length / 1000;

    // Default: expect at least 0.5 requirements per 1000 chars
    const minExpected = Math.floor(sourceKChars * 0.5);

    // Only fail for very suspicious cases (large doc with almost no requirements)
    if (totalRequirements === 0 && sourceKChars > 1) {
      throw new Error(
        `Requirements inventory extraction failed: 0 requirements found in ${sourceKChars.toFixed(1)}K chars of source. ` +
        `Check that the source document contains recognizable requirement patterns (bullets, numbered lists, must/should/shall keywords).`
      );
    }

    if (totalRequirements < minExpected && minExpected > 5) {
      console.warn(
        `[Requirements Inventory] WARNING: Low extraction ratio - ${totalRequirements} requirements from ${sourceKChars.toFixed(1)}K chars. ` +
        `Expected at least ${minExpected}. Consider AI refinement or manual review.`
      );
    }
  }
}