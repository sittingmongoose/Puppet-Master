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
  }): Promise<StartChainResult> {
    const { parsed, projectPath, projectName, skipInterview } = params;
    const projectNameFinal = projectName || parsed.title || 'Untitled Project';

    let interview: InterviewResult | undefined;
    let interviewPaths: { questionsPath: string; assumptionsPath: string } | undefined;

    // Step 1: Requirements Interview (optional)
    if (!skipInterview) {
      await this.publishStep('requirements_interview', 'started');
      interview = await this.conductInterview(parsed, projectNameFinal);
      interviewPaths = await this.saveInterview(projectPath, interview);
      await this.publishStep('requirements_interview', 'completed');
    }

    // Step 2: Generate PRD via AI (formerly Step 1)
    await this.publishStep('generate_prd', 'started');
    const prd = await this.generatePRD(parsed, projectNameFinal);
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

    // Step 6: Save all artifacts (formerly Step 5)
    await this.publishStep('save_artifacts', 'started');
    const savedPaths = await this.saveArtifacts(projectPath, prd, architecture, tierPlan);
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
    };
  }

  /**
   * Generate PRD from parsed requirements using AI.
   */
  private async generatePRD(parsed: ParsedRequirements, projectName: string): Promise<PRD> {
    const prdGenerator = new PrdGenerator(
      { projectName },
      this.platformRegistry,
      this.quotaManager,
      this.config,
      this.usageTracker
    );

    // Use AI generation (useAI=true)
    return prdGenerator.generateWithAI(parsed, true);
  }

  /**
   * Generate architecture markdown from parsed requirements and PRD using AI.
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
    tierPlan: TierPlan
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

    return {
      prdPath,
      architecturePath,
      planPaths,
    };
  }

  /**
   * Conduct requirements interview to identify gaps and generate questions.
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
   */
  private async saveInterview(
    projectPath: string,
    interview: InterviewResult
  ): Promise<{ questionsPath: string; assumptionsPath: string }> {
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

    return { questionsPath, assumptionsPath };
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
}