/**
 * Requirements Interviewer for RWM Puppet Master
 *
 * Generates qualifying questions to clarify requirements before PRD generation.
 * Ensures coverage of major component categories and identifies gaps in requirements.
 *
 * Supports both AI-powered generation (via platform runners) and rule-based fallback.
 */

import type { ParsedRequirements, ParsedSection } from '../types/requirements.js';
import type { PuppetMasterConfig } from '../types/config.js';
import type { Platform } from '../types/config.js';
import type { ExecutionRequest } from '../types/platforms.js';
import { PlatformRegistry } from '../platforms/registry.js';
import { QuotaManager } from '../platforms/quota-manager.js';
import { UsageTracker } from '../memory/usage-tracker.js';
import { buildInterviewPrompt } from './prompts/interview-prompt.js';

/**
 * Major component categories that should be considered in requirements.
 * Based on Master Implementation Plan checklist from BUILD_QUEUE_IMPROVEMENTS.md.
 */
export type MajorComponentCategory =
  | 'product_ux'
  | 'data_persistence'
  | 'security_secrets'
  | 'deployment_environments'
  | 'observability'
  | 'performance_budgets'
  | 'reliability'
  | 'compatibility'
  | 'testing_verification';

/**
 * Priority levels for interview questions.
 */
export type QuestionPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Coverage status for a major component category.
 */
export type CoverageStatus = 'covered' | 'missing' | 'out_of_scope';

/**
 * A qualifying question to clarify requirements.
 */
export interface InterviewQuestion {
  /** Unique identifier (format: "Q-001", "Q-002") */
  id: string;
  /** Major component category this question relates to */
  category: MajorComponentCategory;
  /** The question to ask */
  question: string;
  /** Why this question matters for verification/testability */
  rationale: string;
  /** What to assume if the question isn't answered */
  defaultAssumption: string;
  /** Priority level */
  priority: QuestionPriority;
}

/**
 * Coverage status for a major component category.
 */
export interface CategoryCoverage {
  /** The category being assessed */
  category: MajorComponentCategory;
  /** Coverage status */
  status: CoverageStatus;
  /** Section paths where this category is covered (if covered) */
  citations?: string[];
  /** The most important question if missing */
  topQuestion?: string;
  /** What to assume if missing */
  defaultAssumption?: string;
  /** Explanation if out of scope */
  rationale?: string;
}

/**
 * Complete interview result with questions and coverage analysis.
 */
export interface InterviewResult {
  /** Generated qualifying questions */
  questions: InterviewQuestion[];
  /** List of all default assumptions */
  assumptions: string[];
  /** Coverage checklist for all major categories */
  coverageChecklist: CategoryCoverage[];
  /** Timestamp of generation */
  timestamp: string;
  /** Source document information */
  sourceDocument: {
    path: string;
    title: string;
    sectionCount: number;
  };
}

/**
 * Options for requirements interview generation.
 */
export interface RequirementsInterviewerOptions {
  /** Project name */
  projectName: string;
  /** Maximum number of questions to generate (default: 10) */
  maxQuestions?: number;
  /** Whether to include coverage checklist (default: true) */
  includeCoverageChecklist?: boolean;
}

/**
 * Generator that creates interview questions from parsed requirements.
 * Supports AI-powered generation with rule-based fallback.
 */
export class RequirementsInterviewer {
  private readonly projectName: string;
  private readonly maxQuestions: number;
  private readonly includeCoverageChecklist: boolean;
  private readonly platformRegistry?: PlatformRegistry;
  private readonly quotaManager?: QuotaManager;
  private readonly config?: PuppetMasterConfig;
  private readonly usageTracker?: UsageTracker;

  /**
   * FIX 3: Patterns that indicate a category is explicitly out of scope.
   */
  private readonly outOfScopePatterns = [
    /\b(not applicable|n\/a|out of scope|not in scope|excluded|will not|won't)\b/i,
    /\b(future (phase|version|release)|v2|phase 2|later|not (for|in) (this|initial|v1))\b/i,
    /\b(deferred|postponed|not required|not needed|skip(ped)?)\b/i,
  ];

  /**
   * FIX 4: Patterns that indicate ambiguous or uncertain language.
   */
  private readonly ambiguityPatterns: { pattern: RegExp; type: string }[] = [
    { pattern: /\b(maybe|possibly|might|could|should consider|potentially)\b/i, type: 'uncertain' },
    { pattern: /\b(tbd|to be determined|to be decided|pending|undecided)\b/i, type: 'undefined' },
    { pattern: /\b(or|and\/or|either|alternatively|one of)\b/i, type: 'alternative' },
  ];

  /**
   * FIX 4: Patterns that indicate potentially conflicting requirements.
   */
  private readonly conflictPatterns: { terms: [string, string]; category: MajorComponentCategory }[] = [
    { terms: ['synchronous', 'asynchronous'], category: 'data_persistence' },
    { terms: ['real-time', 'batch'], category: 'performance_budgets' },
    { terms: ['monolithic', 'microservices'], category: 'deployment_environments' },
    { terms: ['sql', 'nosql'], category: 'data_persistence' },
    { terms: ['rest', 'graphql'], category: 'data_persistence' },
    { terms: ['serverless', 'server-based'], category: 'deployment_environments' },
    { terms: ['stateful', 'stateless'], category: 'reliability' },
  ];

  constructor(
    options: RequirementsInterviewerOptions,
    platformRegistry?: PlatformRegistry,
    quotaManager?: QuotaManager,
    config?: PuppetMasterConfig,
    usageTracker?: UsageTracker
  ) {
    this.projectName = options.projectName;
    this.maxQuestions = options.maxQuestions ?? 10;
    this.includeCoverageChecklist = options.includeCoverageChecklist ?? true;
    this.platformRegistry = platformRegistry;
    this.quotaManager = quotaManager;
    this.config = config;
    this.usageTracker = usageTracker;
  }

  /**
   * Main entry point: generates interview questions using AI.
   * Falls back to rule-based generation if AI is unavailable or quota exhausted.
   *
   * @param parsed - Parsed requirements document
   * @param useAI - Whether to attempt AI generation (default: true)
   * @returns Interview result with questions and coverage analysis
   */
  async interviewWithAI(
    parsed: ParsedRequirements,
    useAI: boolean = true
  ): Promise<InterviewResult> {
    // If AI dependencies not provided, use fallback
    if (!useAI || !this.platformRegistry || !this.quotaManager || !this.config || !this.usageTracker) {
      return this.generateQuestions(parsed);
    }

    // Determine platform (use step-specific config or fallback to phase tier)
    // Config resolution order (P1-T04):
    // 1. config.startChain.requirementsInterview.platform/model (step-specific)
    // 2. config.tiers.phase.platform/model (default phase tier)
    // Note: config.tiers is required in schema, but config itself is optional, so we use optional chaining
    const stepConfig = this.config.startChain?.requirementsInterview;
    const platform = stepConfig?.platform || this.config.tiers?.phase?.platform;
    const model = stepConfig?.model || this.config.tiers?.phase?.model;

    if (!platform || !model) {
      console.warn(`[Requirements Interview] Platform or model not configured. Using rule-based fallback.`);
      return this.generateQuestions(parsed);
    }

    try {
      // Check quota before proceeding
      const canProceed = await this.quotaManager.canProceed(platform);
      if (!canProceed.allowed) {
        console.warn(`[Requirements Interview] Quota exhausted for ${platform}: ${canProceed.reason}. Using rule-based fallback.`);
        return this.generateQuestions(parsed);
      }

      // Build prompt
      const prompt = buildInterviewPrompt(parsed, this.projectName, this.maxQuestions);

      // Get runner and execute
      const runner = this.platformRegistry.get(platform);
      if (!runner) {
        console.warn(`[Requirements Interview] Platform runner not available for ${platform}. Using rule-based fallback.`);
        return this.generateQuestions(parsed);
      }

      const request: ExecutionRequest = {
        prompt,
        model,
        workingDirectory: this.config.project?.workingDirectory || process.cwd(),
        nonInteractive: true,
        timeout: 180_000, // 3 minutes
      };

      const startTime = Date.now();
      const result = await runner.execute(request);
      const duration = Date.now() - startTime;

      // Track usage
      await this.usageTracker.track({
        platform,
        action: 'requirements_interview',
        tokens: result.tokensUsed || 0,
        durationMs: duration,
        success: result.success,
      });

      if (!result.success) {
        console.warn(`[Requirements Interview] AI execution failed. Using rule-based fallback.`);
        return this.generateQuestions(parsed);
      }

      // Parse JSON response
      try {
        const interview = this.parseInterviewJson(result.output, parsed);
        console.log(`[Requirements Interview] Generated ${interview.questions.length} questions using ${platform}`);
        return interview;
      } catch (parseError) {
        console.warn(`[Requirements Interview] Failed to parse AI response: ${parseError instanceof Error ? parseError.message : String(parseError)}. Using rule-based fallback.`);
        return this.generateQuestions(parsed);
      }
    } catch (error) {
      console.warn(`[Requirements Interview] AI generation error: ${error instanceof Error ? error.message : String(error)}. Using rule-based fallback.`);
      return this.generateQuestions(parsed);
    }
  }

  /**
   * FIX 4: Detect ambiguities and conflicts in requirements.
   *
   * @param parsed - Parsed requirements document
   * @returns Array of questions for detected ambiguities and conflicts
   */
  private detectAmbiguities(parsed: ParsedRequirements): InterviewQuestion[] {
    const questions: InterviewQuestion[] = [];
    const content = parsed.rawText;
    let ambiguityId = 1;

    // Check for ambiguous language (multiple occurrences indicate uncertainty)
    for (const { pattern, type } of this.ambiguityPatterns) {
      const matches = content.match(new RegExp(pattern, 'gi'));
      if (matches && matches.length > 2) {
        // Multiple occurrences suggest systemic uncertainty
        questions.push({
          id: `Q-AMB-${String(ambiguityId).padStart(3, '0')}`,
          category: 'product_ux', // Default to product_ux for general ambiguity
          question: `The requirements contain uncertain language ("${matches[0]}") in ${matches.length} places. What is the definitive approach?`,
          rationale: `Ambiguous requirements (${type}) lead to incorrect implementations and failed verification`,
          defaultAssumption: 'Interpret ambiguous requirements conservatively, preferring simpler implementations',
          priority: 'high',
        });
        ambiguityId++;
      }
    }

    // Check for conflicting terms
    let conflictId = 1;
    for (const { terms, category } of this.conflictPatterns) {
      const [term1, term2] = terms;
      const hasFirst = content.toLowerCase().includes(term1.toLowerCase());
      const hasSecond = content.toLowerCase().includes(term2.toLowerCase());

      if (hasFirst && hasSecond) {
        questions.push({
          id: `Q-CONFLICT-${String(conflictId).padStart(3, '0')}`,
          category,
          question: `Requirements mention both "${term1}" and "${term2}" which may conflict. Which approach should be used?`,
          rationale: 'Conflicting requirements will cause implementation issues and verification failures',
          defaultAssumption: `Default to ${term1} unless explicitly specified otherwise`,
          priority: 'critical', // Conflicts are critical
        });
        conflictId++;
      }
    }

    return questions;
  }

  /**
   * Rule-based interview generation (fallback).
   * Analyzes parsed requirements and generates questions based on keyword heuristics.
   * FIX 4: Now includes ambiguity and conflict detection.
   *
   * @param parsed - Parsed requirements document
   * @returns Interview result with questions and coverage analysis
   */
  generateQuestions(parsed: ParsedRequirements): InterviewResult {
    const coverageChecklist = this.buildCoverageChecklist(parsed);
    const questions: InterviewQuestion[] = [];

    // FIX 4: Detect ambiguities and conflicts first (these are often critical)
    const ambiguityQuestions = this.detectAmbiguities(parsed);
    questions.push(...ambiguityQuestions);

    // Generate questions for missing categories
    let questionId = 1;

    for (const coverage of coverageChecklist) {
      if (coverage.status === 'missing' && questions.length < this.maxQuestions) {
        const priority = this.getCategoryPriority(coverage.category);
        questions.push({
          id: `Q-${String(questionId).padStart(3, '0')}`,
          category: coverage.category,
          question: coverage.topQuestion || this.getDefaultQuestion(coverage.category),
          rationale: this.getDefaultRationale(coverage.category),
          defaultAssumption: coverage.defaultAssumption || this.getDefaultAssumption(coverage.category),
          priority,
        });
        questionId++;
      }
    }

    // Sort by priority (critical first)
    questions.sort((a, b) => {
      const priorityOrder: Record<QuestionPriority, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
      };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Limit to maxQuestions (after sorting to keep most important)
    const limitedQuestions = questions.slice(0, this.maxQuestions);

    const assumptions = limitedQuestions.map(q => q.defaultAssumption);

    return {
      questions: limitedQuestions,
      assumptions,
      coverageChecklist,
      timestamp: new Date().toISOString(),
      sourceDocument: {
        path: parsed.source.path,
        title: parsed.title,
        sectionCount: parsed.sections.length,
      },
    };
  }

  /**
   * Parse AI-generated JSON response into InterviewResult.
   *
   * @param output - JSON string from AI
   * @param parsed - Original parsed requirements (for fallback data)
   * @returns Parsed interview result
   */
  private parseInterviewJson(output: string, parsed: ParsedRequirements): InterviewResult {
    // Strip markdown code blocks if present
    let jsonStr = output.trim();
    if (jsonStr.startsWith('```')) {
      const lines = jsonStr.split('\n');
      lines.shift(); // Remove opening ```
      if (lines[lines.length - 1].trim() === '```') {
        lines.pop(); // Remove closing ```
      }
      jsonStr = lines.join('\n').trim();
    }

    const data = JSON.parse(jsonStr);

    // Validate structure
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error('Invalid interview result: missing questions array');
    }

    if (!data.coverageChecklist || !Array.isArray(data.coverageChecklist)) {
      throw new Error('Invalid interview result: missing coverageChecklist array');
    }

    return {
      questions: data.questions,
      assumptions: data.assumptions || data.questions.map((q: InterviewQuestion) => q.defaultAssumption),
      coverageChecklist: data.coverageChecklist,
      timestamp: data.timestamp || new Date().toISOString(),
      sourceDocument: data.sourceDocument || {
        path: parsed.source.path,
        title: parsed.title,
        sectionCount: parsed.sections.length,
      },
    };
  }

  /**
   * Build coverage checklist by analyzing parsed requirements.
   *
   * @param parsed - Parsed requirements document
   * @returns Coverage checklist for all major categories
   */
  private buildCoverageChecklist(parsed: ParsedRequirements): CategoryCoverage[] {
    const categories: MajorComponentCategory[] = [
      'product_ux',
      'data_persistence',
      'security_secrets',
      'deployment_environments',
      'observability',
      'performance_budgets',
      'reliability',
      'compatibility',
      'testing_verification',
    ];

    return categories.map(category => this.detectCategoryInRequirements(category, parsed));
  }

  /**
   * FIX 3: Detect if a category is explicitly marked as out of scope.
   *
   * @param category - Category to check
   * @param parsed - Parsed requirements document
   * @returns Object with found status and rationale if out of scope
   */
  private detectOutOfScope(
    category: MajorComponentCategory,
    parsed: ParsedRequirements
  ): { isOutOfScope: boolean; rationale?: string } {
    const categoryKeywords = this.getCategoryKeywords(category);
    const content = parsed.rawText;

    for (const keyword of categoryKeywords) {
      // Check if keyword appears near out-of-scope patterns
      for (const pattern of this.outOfScopePatterns) {
        // Create a regex that looks for keyword followed by out-of-scope pattern within same sentence
        const combinedRegex = new RegExp(
          `${this.escapeRegex(keyword)}[^.!?]*${pattern.source}|${pattern.source}[^.!?]*${this.escapeRegex(keyword)}`,
          'i'
        );
        const match = content.match(combinedRegex);
        if (match) {
          return {
            isOutOfScope: true,
            rationale: `Category explicitly marked as out of scope: "${match[0].substring(0, 100)}${match[0].length > 100 ? '...' : ''}"`,
          };
        }
      }
    }
    return { isOutOfScope: false };
  }

  /**
   * Escape special regex characters in a string.
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Detect if a category is covered in requirements using keyword matching.
   * FIX 3: Now checks for out-of-scope status first.
   *
   * @param category - Category to check
   * @param parsed - Parsed requirements document
   * @returns Coverage status for the category
   */
  private detectCategoryInRequirements(
    category: MajorComponentCategory,
    parsed: ParsedRequirements
  ): CategoryCoverage {
    // FIX 3: Check for explicit out-of-scope first
    const outOfScopeCheck = this.detectOutOfScope(category, parsed);
    if (outOfScopeCheck.isOutOfScope) {
      return {
        category,
        status: 'out_of_scope',
        rationale: outOfScopeCheck.rationale,
      };
    }

    const keywords = this.getCategoryKeywords(category);
    const citations: string[] = [];

    // Search in rawText and sections
    const content = parsed.rawText.toLowerCase();
    let found = false;

    for (const keyword of keywords) {
      if (content.includes(keyword.toLowerCase())) {
        found = true;
        // Find which sections contain this keyword
        this.findSectionsWithKeyword(parsed.sections, keyword, citations, parsed.title);
      }
    }

    if (found) {
      return {
        category,
        status: 'covered',
        citations: [...new Set(citations)], // Remove duplicates
      };
    } else {
      return {
        category,
        status: 'missing',
        topQuestion: this.getDefaultQuestion(category),
        defaultAssumption: this.getDefaultAssumption(category),
      };
    }
  }

  /**
   * Recursively find sections containing a keyword.
   *
   * @param sections - Sections to search
   * @param keyword - Keyword to find
   * @param citations - Array to collect citations
   * @param pathPrefix - Path prefix for building citation paths
   */
  private findSectionsWithKeyword(
    sections: ParsedSection[],
    keyword: string,
    citations: string[],
    pathPrefix: string
  ): void {
    for (const section of sections) {
      const sectionPath = `${pathPrefix} > ${section.title}`;

      if (
        section.title.toLowerCase().includes(keyword.toLowerCase()) ||
        section.content.toLowerCase().includes(keyword.toLowerCase())
      ) {
        citations.push(sectionPath);
      }

      // Recursively search children
      if (section.children.length > 0) {
        this.findSectionsWithKeyword(section.children, keyword, citations, sectionPath);
      }
    }
  }

  /**
   * Get keywords associated with a category for detection.
   *
   * @param category - Category to get keywords for
   * @returns Array of keywords
   */
  private getCategoryKeywords(category: MajorComponentCategory): string[] {
    const keywordMap: Record<MajorComponentCategory, string[]> = {
      product_ux: ['user', 'interface', 'ui', 'ux', 'workflow', 'screen', 'accessibility', 'usability'],
      data_persistence: ['database', 'storage', 'persist', 'data', 'migration', 'backup', 'sql', 'nosql'],
      security_secrets: ['auth', 'security', 'secret', 'credential', 'token', 'encrypt', 'password', 'oauth'],
      deployment_environments: ['deploy', 'environment', 'prod', 'dev', 'config', 'docker', 'kubernetes', 'ci/cd'],
      observability: ['log', 'metric', 'trace', 'monitor', 'telemetry', 'error', 'debug', 'analytics'],
      performance_budgets: ['performance', 'latency', 'throughput', 'timeout', 'cost', 'optimization', 'speed'],
      reliability: ['retry', 'circuit breaker', 'failover', 'idempotent', 'resilience', 'redundancy', 'recovery'],
      compatibility: ['windows', 'linux', 'macos', 'platform', 'cross-platform', 'browser', 'mobile'],
      testing_verification: ['test', 'verify', 'check', 'validate', 'qa', 'assertion', 'coverage'],
    };
    return keywordMap[category];
  }

  /**
   * Get priority for a category based on its impact on verification.
   *
   * @param category - Category to get priority for
   * @returns Priority level
   */
  private getCategoryPriority(category: MajorComponentCategory): QuestionPriority {
    const priorityMap: Record<MajorComponentCategory, QuestionPriority> = {
      security_secrets: 'critical',
      testing_verification: 'critical',
      compatibility: 'critical',
      data_persistence: 'high',
      deployment_environments: 'high',
      performance_budgets: 'high',
      observability: 'medium',
      reliability: 'medium',
      product_ux: 'low',
    };
    return priorityMap[category];
  }

  /**
   * Get default question for a category.
   *
   * @param category - Category to get question for
   * @returns Default question
   */
  private getDefaultQuestion(category: MajorComponentCategory): string {
    const questionMap: Record<MajorComponentCategory, string> = {
      product_ux: 'What are the key user workflows and accessibility requirements?',
      data_persistence: 'What database technology will be used and how should data migrations be handled?',
      security_secrets: 'How should API credentials, secrets, and sensitive data be stored and managed?',
      deployment_environments: 'What are the target deployment environments and how should configuration differ between dev/staging/prod?',
      observability: 'What logging, monitoring, and telemetry should be implemented?',
      performance_budgets: 'What are the performance requirements (latency, throughput, resource usage)?',
      reliability: 'What retry/failover/recovery mechanisms are needed?',
      compatibility: 'What platforms/operating systems/browsers need to be supported?',
      testing_verification: 'What automated testing and verification strategy should be used?',
    };
    return questionMap[category];
  }

  /**
   * Get default assumption for a category.
   *
   * @param category - Category to get assumption for
   * @returns Default assumption
   */
  private getDefaultAssumption(category: MajorComponentCategory): string {
    const assumptionMap: Record<MajorComponentCategory, string> = {
      product_ux: 'Standard web interface patterns, WCAG 2.1 AA compliance',
      data_persistence: 'SQLite for local development, PostgreSQL for production, migration files in src/migrations/',
      security_secrets: 'Environment variables for secrets, no secret scanning, manual rotation',
      deployment_environments: 'Docker containers, separate .env files per environment, no secrets in version control',
      observability: 'Console logging for development, structured JSON logs for production, no metrics/tracing',
      performance_budgets: 'Best-effort performance, no specific latency/throughput targets',
      reliability: 'Simple error handling, no automatic retries, manual recovery',
      compatibility: 'Linux/macOS primary, Windows best-effort, modern browsers (Chrome/Firefox/Safari)',
      testing_verification: 'Unit tests with Jest, integration tests for critical paths, no E2E tests',
    };
    return assumptionMap[category];
  }

  /**
   * Get default rationale for a category.
   *
   * @param category - Category to get rationale for
   * @returns Default rationale
   */
  private getDefaultRationale(category: MajorComponentCategory): string {
    const rationaleMap: Record<MajorComponentCategory, string> = {
      product_ux: 'Defines user-facing acceptance criteria and accessibility verification',
      data_persistence: 'Affects schema validation, migration testing, and backup verification',
      security_secrets: 'Determines secret scanning requirements and security verification approach',
      deployment_environments: 'Affects configuration testing and environment-specific verification',
      observability: 'Determines log validation and monitoring verification requirements',
      performance_budgets: 'Defines performance testing criteria and optimization priorities',
      reliability: 'Affects error recovery testing and resilience verification',
      compatibility: 'Determines cross-platform testing requirements and verification scope',
      testing_verification: 'Critical for defining automated acceptance criteria and verification strategy',
    };
    return rationaleMap[category];
  }
}
