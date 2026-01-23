/**
 * Architecture Generator for RWM Puppet Master
 * 
 * Generates architecture.md markdown documents from parsed requirements and PRD.
 * This generates the TARGET project architecture, not Puppet Master's architecture.
 * Supports both AI-powered generation (via platform runners) and template-based fallback.
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
import { buildArchPrompt } from './prompts/arch-prompt.js';

/**
 * Options for architecture generation.
 */
export interface ArchGeneratorOptions {
  /** Project name for the architecture document */
  projectName: string;
  /** Whether to include test strategy section (default: true) */
  includeTestStrategy?: boolean;
}

/**
 * Generator that creates architecture markdown from requirements and PRD.
 * Supports AI-powered generation with template-based fallback.
 */
export class ArchGenerator {
  private readonly projectName: string;
  private readonly includeTestStrategy: boolean;
  private readonly platformRegistry?: PlatformRegistry;
  private readonly quotaManager?: QuotaManager;
  private readonly config?: PuppetMasterConfig;
  private readonly usageTracker?: UsageTracker;

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
  }

  /**
   * Main entry point: generates architecture markdown from parsed requirements and PRD using AI.
   * Falls back to template-based generation if AI is unavailable or quota exhausted.
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

    // Determine platform (use step-specific config or fallback to phase tier)
    // Config resolution order (P1-T04):
    // 1. config.startChain.architecture.platform/model (step-specific)
    // 2. config.tiers.phase.platform/model (default phase tier)
    const stepConfig = this.config.startChain?.architecture;
    const platform = stepConfig?.platform || this.config.tiers.phase.platform;
    const model = stepConfig?.model || this.config.tiers.phase.model;

    try {
      // Check quota before proceeding
      const canProceed = await this.quotaManager.canProceed(platform);
      if (!canProceed.allowed) {
        console.warn(`[Architecture Generation] Quota exhausted for ${platform}: ${canProceed.reason}. Using template-based fallback.`);
        return this.generate(parsed, prd);
      }

      // Build prompt
      const prompt = buildArchPrompt(parsed, prd, this.projectName);

      // Get platform runner
      const runner = this.platformRegistry.get(platform);
      if (!runner) {
        console.warn(`[Architecture Generation] Platform runner not available for ${platform}. Using template-based fallback.`);
        return this.generate(parsed, prd);
      }

      // Execute AI request
      const request: ExecutionRequest = {
        prompt,
        model,
        workingDirectory: this.config.project.workingDirectory,
        nonInteractive: true,
        timeout: 300_000, // 5 minutes for architecture generation
      };

      const startTime = Date.now();
      const result = await runner.execute(request);
      const duration = Date.now() - startTime;

      // Record usage
      await this.usageTracker.track({
        platform,
        action: 'architecture_generation',
        tokens: result.tokensUsed || 0,
        durationMs: duration,
        success: result.success,
      });

      if (!result.success) {
        console.warn(`[Architecture Generation] AI execution failed (exit code ${result.exitCode}). Using template-based fallback.`);
        return this.generate(parsed, prd);
      }

      // Parse markdown response (extract from code blocks if needed)
      const architecture = this.parseArchMarkdown(result.output);
      
      // Basic validation (should have some content)
      if (!architecture || architecture.trim().length < 100) {
        console.warn(`[Architecture Generation] AI response too short or empty. Using template-based fallback.`);
        return this.generate(parsed, prd);
      }

      console.log(`[Architecture Generation] Successfully generated architecture using ${platform} (${architecture.length} characters)`);
      return architecture;
    } catch (error) {
      console.warn(`[Architecture Generation] AI generation error: ${error instanceof Error ? error.message : String(error)}. Using template-based fallback.`);
      return this.generate(parsed, prd);
    }
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
      '# Architecture Document',
      '',
      this.generateOverview(parsed, prd),
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
   */
  generateTestStrategy(prd: PRD): string {
    const lines: string[] = ['## Test Strategy', ''];

    if (prd.phases.length === 0) {
      lines.push('Test strategy to be defined during implementation.');
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
      lines.push('Test strategy will be developed as test plans are added to phases and tasks.');
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
        lines.push(`- \`${commandStr}\``);
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
