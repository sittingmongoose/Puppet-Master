/**
 * Architecture Generator for RWM Puppet Master
 * 
 * Generates architecture.md markdown documents from parsed requirements and PRD.
 * This generates the TARGET project architecture, not Puppet Master's architecture.
 * Supports both AI-powered generation (via platform runners) and template-based fallback.
 * 
 * P1-T19: Enhanced with multi-pass generation for large documents and output validation.
 * 
 * See REQUIREMENTS.md Section 5.3 for architecture generation requirements.
 * See ROADMAP.md 6.3.2 for AI platform integration requirements.
 */

import type { ParsedRequirements } from '../types/requirements.js';
import type { PRD, Phase, Task } from '../types/prd.js';
import type { PuppetMasterConfig } from '../types/config.js';
import type { Platform } from '../types/config.js';
import type { ExecutionRequest } from '../types/platforms.js';
import { PlatformRegistry } from '../platforms/registry.js';
import { QuotaManager } from '../platforms/quota-manager.js';
import { UsageTracker } from '../memory/usage-tracker.js';
import {
  buildArchPrompt,
  buildArchOutlinePrompt,
  buildSectionExpansionPrompt,
  REQUIRED_ARCH_SECTIONS,
  type RequiredArchSection,
} from './prompts/arch-prompt.js';

/**
 * Configuration for multi-pass architecture generation.
 */
export interface MultiPassArchConfig {
  /** Enable multi-pass generation (default: true for large docs) */
  enabled: boolean;
  /** Character threshold for triggering multi-pass (default: 8000) */
  largeDocThreshold: number;
  /** Minimum architecture document length (chars) to pass validation */
  minDocLength: number;
  /** Whether to fail on missing required sections */
  requireAllSections: boolean;
  /** Whether to fail on manual-only verification */
  rejectManualOnly: boolean;
}

/**
 * Default multi-pass architecture configuration.
 */
export const DEFAULT_MULTI_PASS_ARCH_CONFIG: MultiPassArchConfig = {
  enabled: true,
  largeDocThreshold: 8000,
  minDocLength: 1500,
  requireAllSections: true,
  rejectManualOnly: true,
};

/**
 * Architecture validation result.
 */
export interface ArchValidationResult {
  /** Whether the architecture document is valid */
  valid: boolean;
  /** List of validation errors */
  errors: string[];
  /** List of validation warnings */
  warnings: string[];
  /** Detected sections in the document */
  detectedSections: string[];
  /** Missing required sections */
  missingSections: string[];
  /** Document length in characters */
  documentLength: number;
  /** Whether manual-only verification was found */
  hasManualOnlyVerification: boolean;
}

/**
 * Architecture outline from Pass A of multi-pass generation.
 */
export interface ArchOutline {
  /** Project name */
  projectName: string;
  /** Raw outline markdown */
  rawOutline: string;
  /** Parsed section outlines */
  sections: Array<{
    name: string;
    brief: string;
    considerations: string[];
    relatedPrdPhases: string[];
  }>;
}

/**
 * Result of multi-pass architecture generation.
 */
export interface MultiPassArchResult {
  /** Generated architecture markdown */
  architecture: string;
  /** Whether multi-pass was used */
  usedMultiPass: boolean;
  /** Number of passes executed */
  passesExecuted: number;
  /** Validation result */
  validation: ArchValidationResult;
}

/**
 * Options for architecture generation.
 */
export interface ArchGeneratorOptions {
  /** Project name for the architecture document */
  projectName: string;
  /** Whether to include test strategy section (default: true) */
  includeTestStrategy?: boolean;
  /** Multi-pass configuration */
  multiPassConfig?: Partial<MultiPassArchConfig>;
}

/**
 * Generator that creates architecture markdown from requirements and PRD.
 * Supports AI-powered generation with template-based fallback.
 * P1-T19: Enhanced with multi-pass support and validation.
 */
export class ArchGenerator {
  private readonly projectName: string;
  private readonly includeTestStrategy: boolean;
  private readonly platformRegistry?: PlatformRegistry;
  private readonly quotaManager?: QuotaManager;
  private readonly config?: PuppetMasterConfig;
  private readonly usageTracker?: UsageTracker;
  private readonly multiPassConfig: MultiPassArchConfig;

  constructor(
    options: ArchGeneratorOptions,
    platformRegistry?: PlatformRegistry,
    quotaManager?: QuotaManager,
    config?: PuppetMasterConfig,
    usageTracker?: UsageTracker
  ) {
    this.projectName = options.projectName;
    this.includeTestStrategy = options.includeTestStrategy ?? true;
    this.platformRegistry = platformRegistry;
    this.quotaManager = quotaManager;
    this.config = config;
    this.usageTracker = usageTracker;
    this.multiPassConfig = { ...DEFAULT_MULTI_PASS_ARCH_CONFIG, ...options.multiPassConfig };
  }

  /**
   * Main entry point: generates architecture markdown from parsed requirements and PRD using AI.
   * Falls back to template-based generation if AI is unavailable or quota exhausted.
   * P1-T19: For large documents, uses multi-pass generation when enabled.
   * 
   * @param parsed - Parsed requirements document
   * @param prd - Generated PRD structure
   * @param useAI - Whether to attempt AI generation (default: true)
   * @returns Generated architecture markdown
   */
  async generateWithAI(parsed: ParsedRequirements, prd: PRD, useAI: boolean = true): Promise<string> {
    // If AI dependencies not provided, use fallback
    if (!useAI || !this.platformRegistry || !this.quotaManager || !this.config || !this.usageTracker) {
      return this.generate(parsed, prd);
    }

    // P1-T19: Check if multi-pass should be used for large documents
    const sourceChars = parsed.rawText.length;
    if (
      this.multiPassConfig.enabled &&
      sourceChars >= this.multiPassConfig.largeDocThreshold
    ) {
      console.log(
        `[Architecture Generation] Large document (${sourceChars} chars) - using multi-pass pipeline`
      );
      const result = await this.generateMultiPass(parsed, prd);
      return result.architecture;
    }

    // Single-pass generation for smaller documents
    return this.generateSinglePass(parsed, prd);
  }

  /**
   * P1-T19: Multi-pass architecture generation for large documents.
   * Pass A: Generate outline with required sections
   * Pass B: Expand each section in isolation
   * Pass C: Validate coverage and completeness
   *
   * @param parsed - Parsed requirements document
   * @param prd - Generated PRD structure
   * @returns MultiPassArchResult with architecture and validation
   */
  async generateMultiPass(parsed: ParsedRequirements, prd: PRD): Promise<MultiPassArchResult> {
    let passesExecuted = 0;

    // Check AI dependencies
    if (!this.platformRegistry || !this.quotaManager || !this.config || !this.usageTracker) {
      console.warn('[Architecture Generation] AI dependencies not available. Using template-based fallback.');
      const architecture = this.generate(parsed, prd);
      const validation = this.validateArchitecture(architecture);
      return {
        architecture,
        usedMultiPass: false,
        passesExecuted: 1,
        validation,
      };
    }

    // Determine platform
    const stepConfig = this.config.startChain?.architecture;
    const platform = stepConfig?.platform || this.config.tiers.phase.platform;
    const model = stepConfig?.model || this.config.tiers.phase.model;

    try {
      // Check quota
      const canProceed = await this.quotaManager.canProceed(platform);
      if (!canProceed.allowed) {
        console.warn(`[Architecture Generation] Quota exhausted for ${platform}. Using template-based fallback.`);
        const architecture = this.generate(parsed, prd);
        const validation = this.validateArchitecture(architecture);
        return {
          architecture,
          usedMultiPass: false,
          passesExecuted: 1,
          validation,
        };
      }

      // Get runner
      const runner = this.platformRegistry.get(platform);
      if (!runner) {
        console.warn(`[Architecture Generation] Platform runner not available for ${platform}. Using template-based fallback.`);
        const architecture = this.generate(parsed, prd);
        const validation = this.validateArchitecture(architecture);
        return {
          architecture,
          usedMultiPass: false,
          passesExecuted: 1,
          validation,
        };
      }

      // Pass A: Generate outline
      console.log('[Architecture Generation] Pass A: Generating architecture outline...');
      const outlinePrompt = buildArchOutlinePrompt(parsed, prd, this.projectName);
      const outlineResult = await this.executeAIRequest(runner, outlinePrompt, platform, model, 'outline');
      passesExecuted++;

      if (!outlineResult.success) {
        console.warn('[Architecture Generation] Pass A failed. Using single-pass fallback.');
        return this.generateSinglePassResult(parsed, prd);
      }

      const outline = this.parseArchOutline(outlineResult.output);
      console.log(`[Architecture Generation] Pass A complete: ${outline.sections.length} sections outlined`);

      // Pass B: Expand sections
      console.log('[Architecture Generation] Pass B: Expanding sections...');
      const expandedSections: string[] = [];
      let previousSections = '';

      for (const section of outline.sections) {
        // Check quota for each expansion
        const sectionQuota = await this.quotaManager.canProceed(platform);
        if (!sectionQuota.allowed) {
          console.warn(`[Architecture Generation] Quota exhausted during expansion. Using partial result.`);
          break;
        }

        const expansionPrompt = buildSectionExpansionPrompt(
          section.name,
          section.brief,
          parsed,
          prd,
          this.projectName,
          previousSections
        );

        const expansionResult = await this.executeAIRequest(
          runner,
          expansionPrompt,
          platform,
          model,
          `section_${section.name}`
        );
        passesExecuted++;

        if (expansionResult.success) {
          const expandedContent = this.parseExpandedSection(expansionResult.output);
          expandedSections.push(`## ${section.name}\n\n${expandedContent}`);
          previousSections += `## ${section.name}\n${expandedContent.substring(0, 500)}...\n\n`;
        } else {
          // Use outline brief as fallback
          expandedSections.push(`## ${section.name}\n\n${section.brief}\n\n*[Expansion failed - using outline]*`);
        }
      }

      // Assemble final document
      const architecture = this.assembleArchitecture(expandedSections, prd);

      // Pass C: Validate
      console.log('[Architecture Generation] Pass C: Validating architecture...');
      const validation = this.validateArchitecture(architecture);

      if (!validation.valid) {
        console.warn(`[Architecture Generation] Validation issues: ${validation.errors.join('; ')}`);
        
        // If validation fails and we have issues, try single-pass as fallback
        if (validation.errors.length > 2) {
          console.warn('[Architecture Generation] Too many validation errors. Trying single-pass fallback.');
          return this.generateSinglePassResult(parsed, prd);
        }
      }

      console.log(`[Architecture Generation] Multi-pass complete: ${architecture.length} chars, ${passesExecuted} passes`);

      return {
        architecture,
        usedMultiPass: true,
        passesExecuted,
        validation,
      };
    } catch (error) {
      console.warn(`[Architecture Generation] Multi-pass error: ${error instanceof Error ? error.message : String(error)}. Using single-pass fallback.`);
      return this.generateSinglePassResult(parsed, prd);
    }
  }

  /**
   * Single-pass AI architecture generation.
   */
  private async generateSinglePass(parsed: ParsedRequirements, prd: PRD): Promise<string> {
    const result = await this.generateSinglePassResult(parsed, prd);
    return result.architecture;
  }

  /**
   * Single-pass generation with validation result.
   */
  private async generateSinglePassResult(parsed: ParsedRequirements, prd: PRD): Promise<MultiPassArchResult> {
    // Check AI dependencies
    if (!this.platformRegistry || !this.quotaManager || !this.config || !this.usageTracker) {
      const architecture = this.generate(parsed, prd);
      const validation = this.validateArchitecture(architecture);
      return {
        architecture,
        usedMultiPass: false,
        passesExecuted: 1,
        validation,
      };
    }

    // Determine platform
    const stepConfig = this.config.startChain?.architecture;
    const platform = stepConfig?.platform || this.config.tiers.phase.platform;
    const model = stepConfig?.model || this.config.tiers.phase.model;

    try {
      // Check quota
      const canProceed = await this.quotaManager.canProceed(platform);
      if (!canProceed.allowed) {
        console.warn(`[Architecture Generation] Quota exhausted for ${platform}. Using template-based fallback.`);
        const architecture = this.generate(parsed, prd);
        const validation = this.validateArchitecture(architecture);
        return { architecture, usedMultiPass: false, passesExecuted: 1, validation };
      }

      // Get runner
      const runner = this.platformRegistry.get(platform);
      if (!runner) {
        console.warn(`[Architecture Generation] Platform runner not available for ${platform}. Using template-based fallback.`);
        const architecture = this.generate(parsed, prd);
        const validation = this.validateArchitecture(architecture);
        return { architecture, usedMultiPass: false, passesExecuted: 1, validation };
      }

      // Build enhanced prompt (P1-T19)
      const prompt = buildArchPrompt(parsed, prd, this.projectName);

      // Execute
      const result = await this.executeAIRequest(runner, prompt, platform, model, 'single_pass');

      if (!result.success) {
        console.warn(`[Architecture Generation] AI execution failed. Using template-based fallback.`);
        const architecture = this.generate(parsed, prd);
        const validation = this.validateArchitecture(architecture);
        return { architecture, usedMultiPass: false, passesExecuted: 1, validation };
      }

      // Parse response
      const architecture = this.parseArchMarkdown(result.output);

      // Validate
      const validation = this.validateArchitecture(architecture);

      // If too short or invalid, use template fallback
      if (!architecture || architecture.trim().length < this.multiPassConfig.minDocLength) {
        console.warn(`[Architecture Generation] AI response too short. Using template-based fallback.`);
        const fallbackArch = this.generate(parsed, prd);
        const fallbackValidation = this.validateArchitecture(fallbackArch);
        return { architecture: fallbackArch, usedMultiPass: false, passesExecuted: 1, validation: fallbackValidation };
      }

      console.log(`[Architecture Generation] Single-pass complete: ${architecture.length} chars`);
      return { architecture, usedMultiPass: false, passesExecuted: 1, validation };
    } catch (error) {
      console.warn(`[Architecture Generation] AI generation error: ${error instanceof Error ? error.message : String(error)}. Using template-based fallback.`);
      const architecture = this.generate(parsed, prd);
      const validation = this.validateArchitecture(architecture);
      return { architecture, usedMultiPass: false, passesExecuted: 1, validation };
    }
  }

  /**
   * Executes an AI request and tracks usage.
   */
  private async executeAIRequest(
    runner: ReturnType<PlatformRegistry['get']>,
    prompt: string,
    platform: Platform,
    model: string,
    action: string
  ): Promise<{ success: boolean; output: string }> {
    if (!runner || !this.config || !this.usageTracker) {
      return { success: false, output: '' };
    }

    const request: ExecutionRequest = {
      prompt,
      model,
      workingDirectory: this.config.project.workingDirectory,
      nonInteractive: true,
      timeout: 300_000,
    };

    const startTime = Date.now();
    try {
      const result = await runner.execute(request);
      const duration = Date.now() - startTime;

      await this.usageTracker.track({
        platform,
        action: `architecture_${action}`,
        tokens: result.tokensUsed || 0,
        durationMs: duration,
        success: result.success,
      });

      return { success: result.success, output: result.output };
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.usageTracker.track({
        platform,
        action: `architecture_${action}`,
        tokens: 0,
        durationMs: duration,
        success: false,
      });
      return { success: false, output: '' };
    }
  }

  /**
   * Parses architecture outline from AI response.
   */
  private parseArchOutline(output: string): ArchOutline {
    const sections: ArchOutline['sections'] = [];
    
    // Extract from code block if present
    const markdownMatch = output.match(/```(?:markdown)?\s*([\s\S]*?)\s*```/);
    const content = markdownMatch ? markdownMatch[1] : output;

    // Parse sections (## headers)
    const sectionMatches = content.matchAll(/^##\s+(.+?)$([\s\S]*?)(?=^##\s|\z)/gm);
    
    for (const match of sectionMatches) {
      const name = match[1].trim();
      const body = match[2].trim();
      
      // Extract brief (first paragraph or [Brief: ...])
      const briefMatch = body.match(/\[Brief:?\s*([^\]]+)\]/i) || body.match(/^([^\n]+)/);
      const brief = briefMatch ? briefMatch[1].trim() : body.substring(0, 200);

      // Extract considerations
      const considerations: string[] = [];
      const considMatch = body.match(/\[Key considerations:?\s*([^\]]+)\]/i);
      if (considMatch) {
        considerations.push(...considMatch[1].split(',').map(s => s.trim()));
      }

      // Extract related PRD phases
      const relatedPrdPhases: string[] = [];
      const prdMatch = body.match(/\[Relevant PRD phases:?\s*([^\]]+)\]/i);
      if (prdMatch) {
        relatedPrdPhases.push(...prdMatch[1].split(',').map(s => s.trim()));
      }

      sections.push({ name, brief, considerations, relatedPrdPhases });
    }

    // If no sections parsed, create defaults
    if (sections.length === 0) {
      const defaultSections = [
        'Overview',
        'Data Model & Persistence',
        'API/Service Boundaries',
        'Deployment & Environments',
        'Observability',
        'Security',
        'Test Strategy',
        'Directory Structure',
      ];
      for (const name of defaultSections) {
        sections.push({ name, brief: `${name} section content`, considerations: [], relatedPrdPhases: [] });
      }
    }

    return {
      projectName: this.projectName,
      rawOutline: output,
      sections,
    };
  }

  /**
   * Parses expanded section content from AI response.
   */
  private parseExpandedSection(output: string): string {
    // Extract from code block if present
    const markdownMatch = output.match(/```(?:markdown)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch) {
      return markdownMatch[1].trim();
    }

    // Otherwise return cleaned output
    return output.trim();
  }

  /**
   * Assembles final architecture document from expanded sections.
   */
  private assembleArchitecture(sections: string[], prd: PRD): string {
    const lines: string[] = [
      `# Architecture Document: ${this.projectName}`,
      '',
    ];

    // Add all expanded sections
    for (const section of sections) {
      lines.push(section);
      lines.push('');
    }

    // Add module breakdown if not already present
    if (!sections.some(s => s.toLowerCase().includes('module breakdown'))) {
      lines.push(this.generateModuleBreakdown(prd));
      lines.push('');
    }

    // Add dependencies if not present
    if (!sections.some(s => s.toLowerCase().includes('dependencies'))) {
      lines.push(this.generateDependencyGraph(prd));
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * P1-T19: Validates architecture document for completeness and quality.
   * 
   * @param architecture - Architecture markdown content
   * @returns Validation result with errors and warnings
   */
  validateArchitecture(architecture: string): ArchValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const detectedSections: string[] = [];
    const missingSections: string[] = [];
    
    const lowerArch = architecture.toLowerCase();
    const documentLength = architecture.length;

    // Check document length
    if (documentLength < this.multiPassConfig.minDocLength) {
      errors.push(`Document too short (${documentLength} chars, minimum ${this.multiPassConfig.minDocLength})`);
    }

    // Check for required sections
    const sectionPatterns: Record<RequiredArchSection, RegExp[]> = {
      overview: [/##\s*overview/i, /##\s*introduction/i],
      data_model: [/##\s*data\s*model/i, /##\s*persistence/i, /##\s*database/i, /##\s*storage/i],
      api_boundaries: [/##\s*api/i, /##\s*service/i, /##\s*boundaries/i, /##\s*interface/i],
      deployment: [/##\s*deploy/i, /##\s*environment/i, /##\s*infrastructure/i],
      observability: [/##\s*observ/i, /##\s*logging/i, /##\s*monitor/i, /##\s*metric/i],
      security: [/##\s*security/i, /##\s*auth/i, /##\s*access\s*control/i],
      test_strategy: [/##\s*test/i, /##\s*quality/i, /##\s*verification/i],
      directory_structure: [/##\s*directory/i, /##\s*structure/i, /##\s*organization/i, /##\s*layout/i],
    };

    for (const [section, patterns] of Object.entries(sectionPatterns)) {
      const found = patterns.some(p => p.test(architecture));
      if (found) {
        detectedSections.push(section);
      } else {
        missingSections.push(section);
        if (this.multiPassConfig.requireAllSections) {
          errors.push(`Missing required section: ${section.replace(/_/g, ' ')}`);
        } else {
          warnings.push(`Missing section: ${section.replace(/_/g, ' ')}`);
        }
      }
    }

    // Check for manual-only verification
    const manualOnlyPatterns = [
      /manual(?:ly)?\s+verify/i,
      /visual(?:ly)?\s+inspect/i,
      /manual\s+testing\s+only/i,
      /requires?\s+human\s+review/i,
      /no\s+automated\s+(?:test|verification)/i,
    ];

    const hasManualOnlyVerification = manualOnlyPatterns.some(p => p.test(architecture));
    
    if (hasManualOnlyVerification) {
      if (this.multiPassConfig.rejectManualOnly) {
        errors.push('Architecture contains manual-only verification instructions without automated alternatives');
      } else {
        warnings.push('Architecture contains manual-only verification - consider adding automated alternatives');
      }
    }

    // Check for test commands in test strategy section
    const testSectionMatch = architecture.match(/##\s*test[^\n]*\n([\s\S]*?)(?=\n##|$)/i);
    if (testSectionMatch) {
      const testSection = testSectionMatch[1];
      const hasCommands = /`[^`]+`/.test(testSection) || /```[\s\S]+```/.test(testSection);
      if (!hasCommands) {
        warnings.push('Test strategy section lacks executable commands');
      }
    }

    // Check for generic content
    const genericPhrases = [
      /to be determined/i,
      /tbd/i,
      /placeholder/i,
      /insert.*here/i,
      /your.*here/i,
    ];
    
    const genericCount = genericPhrases.filter(p => p.test(architecture)).length;
    if (genericCount > 2) {
      warnings.push(`Architecture contains ${genericCount} generic/placeholder phrases`);
    }

    const valid = errors.length === 0;

    return {
      valid,
      errors,
      warnings,
      detectedSections,
      missingSections,
      documentLength,
      hasManualOnlyVerification,
    };
  }

  /**
   * Template-based architecture generation (fallback method).
   * This is the original implementation that uses templates and heuristics
   * to generate architecture documents.
   * 
   * @param parsed - Parsed requirements document
   * @param prd - Generated PRD structure
   * @returns Generated architecture markdown
   */
  generate(parsed: ParsedRequirements, prd: PRD): string {
    const sections: string[] = [
      `# Architecture Document: ${this.projectName}`,
      '',
      this.generateOverview(parsed, prd),
      '',
      this.generateDataModelSection(parsed),
      '',
      this.generateApiSection(prd),
      '',
      this.generateDeploymentSection(parsed),
      '',
      this.generateObservabilitySection(),
      '',
      this.generateSecuritySection(parsed),
      '',
      this.generateModuleBreakdown(prd),
      '',
      this.generateDependencyGraph(prd),
      '',
      this.generateTechStack(parsed),
      '',
    ];

    if (this.includeTestStrategy) {
      sections.push(this.generateTestStrategy(prd), '');
    }

    sections.push(this.generateDirectoryStructure(prd));

    return sections.join('\n');
  }

  /**
   * Generates the overview section from requirements and PRD.
   */
  generateOverview(parsed: ParsedRequirements, prd: PRD): string {
    const lines: string[] = ['## Overview', ''];
    
    if (parsed.title) {
      lines.push(parsed.title);
      lines.push('');
    }

    if (prd.description) {
      lines.push(prd.description);
    } else if (parsed.sections.length > 0 && parsed.sections[0].content) {
      // Use first section content as description
      const firstContent = parsed.sections[0].content.trim();
      if (firstContent) {
        lines.push(firstContent.split('\n')[0]);
      }
    } else {
      lines.push(`Architecture for ${this.projectName}.`);
    }

    if (parsed.extractedGoals.length > 0) {
      lines.push('');
      lines.push('### Goals');
      for (const goal of parsed.extractedGoals) {
        lines.push(`- ${goal}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * P1-T19: Generates data model and persistence section.
   */
  private generateDataModelSection(parsed: ParsedRequirements): string {
    const lines: string[] = ['## Data Model & Persistence', ''];

    // Extract data-related content from requirements
    const dataKeywords = ['data', 'database', 'storage', 'entity', 'model', 'persist', 'cache', 'store'];
    const relevantContent = this.extractRelevantContent(parsed, dataKeywords);

    if (relevantContent.length > 0) {
      lines.push('### Data Requirements');
      for (const content of relevantContent.slice(0, 5)) {
        lines.push(`- ${content}`);
      }
      lines.push('');
    }

    lines.push('### Storage Strategy');
    lines.push('Storage approach to be determined based on:');
    lines.push('- Data volume and access patterns');
    lines.push('- Consistency requirements');
    lines.push('- Query complexity');
    lines.push('');

    lines.push('### Data Flow');
    lines.push('Data flow patterns will be defined during implementation.');

    return lines.join('\n');
  }

  /**
   * P1-T19: Generates API/service boundaries section.
   */
  private generateApiSection(prd: PRD): string {
    const lines: string[] = ['## API/Service Boundaries', ''];

    lines.push('### Service Architecture');
    if (prd.phases.length > 0) {
      lines.push('Based on PRD structure, the following service boundaries are suggested:');
      lines.push('');
      for (const phase of prd.phases) {
        lines.push(`- **${phase.title}**: Encapsulates ${phase.tasks.length} tasks`);
      }
    } else {
      lines.push('Service boundaries to be defined based on implementation requirements.');
    }
    lines.push('');

    lines.push('### API Contracts');
    lines.push('API contracts will be defined during implementation with:');
    lines.push('- RESTful endpoints or GraphQL schema');
    lines.push('- Request/response formats (JSON)');
    lines.push('- Error handling conventions');

    return lines.join('\n');
  }

  /**
   * P1-T19: Generates deployment section.
   */
  private generateDeploymentSection(parsed: ParsedRequirements): string {
    const lines: string[] = ['## Deployment & Environments', ''];

    // Extract deployment-related content
    const deployKeywords = ['deploy', 'environment', 'production', 'staging', 'docker', 'kubernetes', 'cloud'];
    const relevantContent = this.extractRelevantContent(parsed, deployKeywords);

    if (relevantContent.length > 0) {
      lines.push('### Deployment Requirements');
      for (const content of relevantContent.slice(0, 5)) {
        lines.push(`- ${content}`);
      }
      lines.push('');
    }

    lines.push('### Environments');
    lines.push('- **Development**: Local development environment');
    lines.push('- **Staging**: Pre-production testing');
    lines.push('- **Production**: Live environment');
    lines.push('');

    lines.push('### Infrastructure');
    lines.push('Infrastructure requirements to be defined based on scale and availability needs.');

    return lines.join('\n');
  }

  /**
   * P1-T19: Generates observability section.
   */
  private generateObservabilitySection(): string {
    const lines: string[] = ['## Observability', ''];

    lines.push('### Logging Strategy');
    lines.push('- Structured logging (JSON format)');
    lines.push('- Log levels: DEBUG, INFO, WARN, ERROR');
    lines.push('- Centralized log aggregation');
    lines.push('');

    lines.push('### Metrics');
    lines.push('Key metrics to track:');
    lines.push('- Request latency (p50, p95, p99)');
    lines.push('- Error rates');
    lines.push('- Throughput');
    lines.push('');

    lines.push('### Alerting');
    lines.push('Alerts to configure:');
    lines.push('- High error rate');
    lines.push('- Latency degradation');
    lines.push('- Service unavailability');

    return lines.join('\n');
  }

  /**
   * P1-T19: Generates security section.
   */
  private generateSecuritySection(parsed: ParsedRequirements): string {
    const lines: string[] = ['## Security', ''];

    // Extract security-related content
    const securityKeywords = ['security', 'auth', 'permission', 'role', 'encrypt', 'token', 'secret'];
    const relevantContent = this.extractRelevantContent(parsed, securityKeywords);

    if (relevantContent.length > 0) {
      lines.push('### Security Requirements');
      for (const content of relevantContent.slice(0, 5)) {
        lines.push(`- ${content}`);
      }
      lines.push('');
    }

    lines.push('### Authentication');
    lines.push('Authentication approach to be determined based on requirements.');
    lines.push('');

    lines.push('### Authorization');
    lines.push('Authorization model to be defined during implementation.');
    lines.push('');

    lines.push('### Secrets Management');
    lines.push('- Secrets should never be committed to source control');
    lines.push('- Use environment variables or secrets manager');
    lines.push('- Rotate secrets regularly');

    return lines.join('\n');
  }

  /**
   * Extracts relevant content from parsed requirements based on keywords.
   */
  private extractRelevantContent(parsed: ParsedRequirements, keywords: string[]): string[] {
    const results: string[] = [];
    const content = parsed.sections.map(s => s.content).join('\n');
    const sentences = content.split(/[.!?]+/);

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      if (keywords.some(kw => lowerSentence.includes(kw))) {
        const trimmed = sentence.trim();
        if (trimmed.length > 10 && trimmed.length < 200) {
          results.push(trimmed);
        }
      }
    }

    return results;
  }

  /**
   * Generates module breakdown section from PRD structure.
   */
  generateModuleBreakdown(prd: PRD): string {
    const lines: string[] = ['## Module Breakdown', ''];

    if (prd.phases.length === 0) {
      lines.push('No modules defined yet.');
      return lines.join('\n');
    }

    for (const phase of prd.phases) {
      lines.push(`### ${phase.title}`);
      if (phase.description) {
        const description = phase.description.trim();
        if (description) {
          lines.push('');
          lines.push(description);
        }
      }

      if (phase.tasks.length > 0) {
        lines.push('');
        lines.push('**Components:**');
        for (const task of phase.tasks) {
          lines.push(`- ${task.title}`);
          if (task.description && task.description.trim()) {
            const taskDesc = task.description.trim().split('\n')[0];
            if (taskDesc && taskDesc.length < 100) {
              lines.push(`  - ${taskDesc}`);
            }
          }
        }
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Generates dependency graph section from PRD structure.
   */
  generateDependencyGraph(prd: PRD): string {
    const lines: string[] = ['## Dependencies', ''];

    if (prd.phases.length === 0) {
      lines.push('No dependencies defined yet.');
      return lines.join('\n');
    }

    // Build phase dependencies (earlier phases depend on later ones)
    const dependencies: Array<{ from: string; to: string }> = [];
    
    for (let i = 0; i < prd.phases.length; i++) {
      const phase = prd.phases[i];
      
      // Tasks within a phase may depend on each other
      for (let j = 0; j < phase.tasks.length - 1; j++) {
        const task = phase.tasks[j];
        const nextTask = phase.tasks[j + 1];
        dependencies.push({
          from: task.title,
          to: nextTask.title,
        });
      }
    }

    if (dependencies.length === 0) {
      lines.push('Dependencies will be identified during implementation.');
      return lines.join('\n');
    }

    lines.push('### Phase Dependencies');
    lines.push('');
    lines.push('The following dependency structure is inferred from the phase and task organization:');
    lines.push('');
    
    // Group dependencies by phase
    const phaseDeps = new Map<string, Array<{ from: string; to: string }>>();
    
    for (const phase of prd.phases) {
      const phaseDepsList: Array<{ from: string; to: string }> = [];
      for (let j = 0; j < phase.tasks.length - 1; j++) {
        phaseDepsList.push({
          from: phase.tasks[j].title,
          to: phase.tasks[j + 1].title,
        });
      }
      if (phaseDepsList.length > 0) {
        phaseDeps.set(phase.title, phaseDepsList);
      }
    }

    for (const [phaseTitle, deps] of phaseDeps.entries()) {
      lines.push(`**${phaseTitle}:**`);
      for (const dep of deps) {
        lines.push(`- ${dep.from} → ${dep.to}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Extracts and generates tech stack section from requirements.
   */
  generateTechStack(parsed: ParsedRequirements): string {
    const lines: string[] = ['## Tech Stack', ''];

    const techKeywords = new Set<string>();
    const content = parsed.rawText || parsed.sections.map(s => s.content).join('\n');

    // Common technology keywords to look for
    const knownTechs = [
      'TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#', 'Ruby',
      'Node.js', 'React', 'Vue', 'Angular', 'Next.js', 'Express', 'FastAPI', 'Django',
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite',
      'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
      'Vitest', 'Jest', 'Pytest', 'Mocha', 'JUnit',
      'ESLint', 'Prettier', 'TypeScript', 'Webpack', 'Vite',
    ];

    for (const tech of knownTechs) {
      const regex = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(content)) {
        techKeywords.add(tech);
      }
    }

    if (techKeywords.size === 0) {
      lines.push('Tech stack to be determined from requirements analysis.');
      return lines.join('\n');
    }

    // Categorize technologies
    const categories: Record<string, string[]> = {
      'Language': [],
      'Framework': [],
      'Database': [],
      'Testing': [],
      'Infrastructure': [],
      'Tooling': [],
    };

    const languageTechs = ['TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#', 'Ruby'];
    const frameworkTechs = ['React', 'Vue', 'Angular', 'Next.js', 'Express', 'FastAPI', 'Django', 'Node.js'];
    const dbTechs = ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite'];
    const testTechs = ['Vitest', 'Jest', 'Pytest', 'Mocha', 'JUnit'];
    const infraTechs = ['Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure'];
    const toolingTechs = ['ESLint', 'Prettier', 'Webpack', 'Vite'];

    for (const tech of Array.from(techKeywords)) {
      if (languageTechs.includes(tech)) {
        categories['Language'].push(tech);
      } else if (frameworkTechs.includes(tech)) {
        categories['Framework'].push(tech);
      } else if (dbTechs.includes(tech)) {
        categories['Database'].push(tech);
      } else if (testTechs.includes(tech)) {
        categories['Testing'].push(tech);
      } else if (infraTechs.includes(tech)) {
        categories['Infrastructure'].push(tech);
      } else if (toolingTechs.includes(tech)) {
        categories['Tooling'].push(tech);
      }
    }

    for (const [category, techs] of Object.entries(categories)) {
      if (techs.length > 0) {
        lines.push(`### ${category}`);
        for (const tech of techs) {
          lines.push(`- ${tech}`);
        }
        lines.push('');
      }
    }

    return lines.join('\n').trimEnd();
  }

  /**
   * Generates test strategy section from PRD test plans.
   * P1-T19: Enhanced to include executable commands.
   */
  generateTestStrategy(prd: PRD): string {
    const lines: string[] = ['## Test Strategy', ''];

    if (prd.phases.length === 0) {
      lines.push('Test strategy to be defined during implementation.');
      lines.push('');
      lines.push('### Recommended Approach');
      lines.push('- **Unit Tests**: Test individual functions and modules');
      lines.push('  - Command: `npm test` or `npm run test:unit`');
      lines.push('- **Integration Tests**: Test component interactions');
      lines.push('  - Command: `npm run test:integration`');
      lines.push('- **E2E Tests**: Test complete user flows');
      lines.push('  - Command: `npm run test:e2e`');
      return lines.join('\n');
    }

    // Collect test plans from phases and tasks
    const testPlans: Array<{ level: string; title: string; commands: Array<{ command: string; args?: string[] }> }> = [];

    for (const phase of prd.phases) {
      if (phase.testPlan.commands.length > 0) {
        testPlans.push({
          level: 'Phase',
          title: phase.title,
          commands: phase.testPlan.commands,
        });
      }

      for (const task of phase.tasks) {
        if (task.testPlan.commands.length > 0) {
          testPlans.push({
            level: 'Task',
            title: task.title,
            commands: task.testPlan.commands,
          });
        }
      }
    }

    if (testPlans.length === 0) {
      lines.push('### Default Test Commands');
      lines.push('');
      lines.push('**Unit Testing**');
      lines.push('- Command: `npm test`');
      lines.push('- Command: `npm run test:unit`');
      lines.push('');
      lines.push('**Integration Testing**');
      lines.push('- Command: `npm run test:integration`');
      lines.push('');
      lines.push('**Type Checking**');
      lines.push('- Command: `npm run typecheck`');
      lines.push('');
      lines.push('Test plans will be developed as test commands are added to phases and tasks.');
      return lines.join('\n');
    }

    lines.push('### Test Coverage');
    lines.push('');
    lines.push('The following test plans are defined across phases and tasks:');
    lines.push('');

    for (const testPlan of testPlans) {
      lines.push(`**${testPlan.level}: ${testPlan.title}**`);
      for (const cmd of testPlan.commands) {
        const commandStr = cmd.args && cmd.args.length > 0
          ? `${cmd.command} ${cmd.args.join(' ')}`
          : cmd.command;
        lines.push(`- Command: \`${commandStr}\``);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Generates directory structure section from PRD modules.
   */
  generateDirectoryStructure(prd: PRD): string {
    const lines: string[] = ['## Directory Structure', ''];

    if (prd.phases.length === 0) {
      lines.push('Directory structure to be determined during implementation.');
      return lines.join('\n');
    }

    lines.push('Suggested directory structure based on module breakdown:');
    lines.push('');
    lines.push('```');

    // Build a tree structure from phases and tasks
    const directories = new Set<string>();

    // Common directories
    directories.add('src/');
    directories.add('tests/');
    directories.add('docs/');

    // Add directories based on phases (as top-level modules)
    for (const phase of prd.phases) {
      // Convert phase title to directory name (lowercase, hyphenated)
      const phaseDir = phase.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      if (phaseDir) {
        directories.add(`src/${phaseDir}/`);
        
        // Add task-level directories
        for (const task of phase.tasks) {
          const taskDir = task.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
          
          if (taskDir) {
            directories.add(`src/${phaseDir}/${taskDir}/`);
          }
        }
      }
    }

    // Sort and display
    const sortedDirs = Array.from(directories).sort();
    
    // Build tree structure
    const tree: string[] = [];
    const added = new Set<string>();

    for (const dir of sortedDirs) {
      if (dir.endsWith('/')) {
        const parts = dir.slice(0, -1).split('/');
        let path = '';
        
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          path += (i > 0 ? '/' : '') + part;
          const dirPath = path + '/';
          
          if (!added.has(dirPath)) {
            const indent = '  '.repeat(i);
            const name = part + (i < parts.length - 1 ? '' : '/');
            tree.push(`${indent}${name}`);
            added.add(dirPath);
          }
        }
      }
    }

    lines.push(...tree);
    lines.push('```');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Parses markdown response from AI platform.
   * Handles markdown wrapped in code blocks or plain markdown.
   * 
   * @param output - Raw output from AI platform
   * @returns Parsed architecture markdown
   */
  private parseArchMarkdown(output: string): string {
    // Try to extract markdown from code blocks
    const markdownMatch = output.match(/```(?:markdown)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch) {
      return markdownMatch[1].trim();
    }

    // If no code blocks, look for markdown structure (starts with #)
    const markdownStart = output.indexOf('#');
    if (markdownStart >= 0) {
      return output.substring(markdownStart).trim();
    }

    // Fallback: return entire output
    return output.trim();
  }
}
