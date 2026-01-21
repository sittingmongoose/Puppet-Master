/**
 * Wizard API routes for RWM Puppet Master GUI
 * 
 * Provides REST endpoints for the start chain wizard workflow:
 * - Upload and parse requirements documents
 * - Generate PRD from parsed requirements
 * - Validate generated artifacts
 * - Save PRD and related files
 * 
 * See BUILD_QUEUE_PHASE_9.md PH9-T06 for specification.
 */

import type { Router, Request, Response } from 'express';
import { Router as createRouter } from 'express';
import { promises as fs } from 'fs';
import { join, resolve, extname } from 'path';
import { existsSync } from 'fs';
import type { ParsedRequirements, SupportedFormat } from '../../types/requirements.js';
import type { PRD } from '../../types/prd.js';
import type { TierPlan } from '../../start-chain/tier-plan-generator.js';
import { MarkdownParser } from '../../start-chain/parsers/markdown-parser.js';
import { TextParser } from '../../start-chain/parsers/text-parser.js';
import { PdfParser } from '../../start-chain/parsers/pdf-parser.js';
import { DocxParser } from '../../start-chain/parsers/docx-parser.js';
import { PrdGenerator } from '../../start-chain/prd-generator.js';
import { ArchGenerator } from '../../start-chain/arch-generator.js';
import { TierPlanGenerator } from '../../start-chain/tier-plan-generator.js';
import { ValidationGate } from '../../start-chain/validation-gate.js';
import { StartChainPipeline } from '../../start-chain/index.js';
import { PrdManager } from '../../memory/prd-manager.js';
import { ConfigManager } from '../../config/config-manager.js';
import type { PuppetMasterConfig } from '../../types/config.js';
import type { PlatformRegistry } from '../../platforms/registry.js';
import type { QuotaManager } from '../../platforms/quota-manager.js';
import type { UsageTracker } from '../../memory/usage-tracker.js';
import type { EventBus } from '../../logging/event-bus.js';

/**
 * Error response interface.
 */
interface ErrorResponse {
  error: string;
  code: string;
}

/**
 * Get project directory from request or use current working directory.
 */
function getProjectDirectory(req: Request): string {
  const { projectPath } = req.body || {};
  if (projectPath && typeof projectPath === 'string') {
    return resolve(projectPath);
  }
  return process.cwd();
}

/**
 * Determine file format from extension or MIME type.
 */
function detectFormat(filename: string, mimeType?: string): SupportedFormat {
  const ext = extname(filename).toLowerCase();
  
  if (ext === '.md' || ext === '.markdown') return 'markdown';
  if (ext === '.txt') return 'text';
  if (ext === '.pdf') return 'pdf';
  if (ext === '.docx' || ext === '.doc') return 'docx';
  
  // Fallback to MIME type
  if (mimeType) {
    if (mimeType.includes('markdown') || mimeType.includes('text/markdown')) return 'markdown';
    if (mimeType.includes('text/plain')) return 'text';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'docx';
  }
  
  // Default to text
  return 'text';
}

/**
 * Parse uploaded file using appropriate parser.
 */
async function parseFile(
  buffer: Buffer,
  filename: string,
  format: SupportedFormat,
  projectDir: string
): Promise<ParsedRequirements> {
  const source: ParsedRequirements['source'] = {
    path: filename,
    format,
    size: buffer.length,
    lastModified: new Date().toISOString(),
  };

  let parser: MarkdownParser | TextParser | PdfParser | DocxParser;
  
  switch (format) {
    case 'markdown': {
      parser = new MarkdownParser();
      return parser.parse(buffer.toString('utf-8'), source);
    }
    case 'text': {
      parser = new TextParser();
      return parser.parse(buffer.toString('utf-8'), source);
    }
    case 'pdf': {
      parser = new PdfParser();
      return await parser.parse(buffer, source);
    }
    case 'docx': {
      parser = new DocxParser();
      return await parser.parse(buffer, source);
    }
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Mutable dependency holder for wizard routes.
 * Allows dependencies to be registered after router creation.
 */
export interface WizardDependencies {
  config?: PuppetMasterConfig;
  platformRegistry?: PlatformRegistry;
  quotaManager?: QuotaManager;
  usageTracker?: UsageTracker;
  eventBus?: EventBus;
}

/**
 * Create wizard routes with a mutable dependency holder.
 *
 * @param baseDirectory - Base directory for project operations (optional)
 * @param config - Puppet Master config (optional, for AI generation)
 * @param platformRegistry - Platform registry for AI generation (optional)
 * @param quotaManager - Quota manager for AI generation (optional)
 * @param usageTracker - Usage tracker for AI generation (optional)
 * @param eventBus - Event bus for progress events (optional)
 * @returns Express Router with wizard endpoints and a dependency setter
 */
export function createWizardRoutes(
  baseDirectory?: string,
  config?: PuppetMasterConfig,
  platformRegistry?: PlatformRegistry,
  quotaManager?: QuotaManager,
  usageTracker?: UsageTracker,
  eventBus?: EventBus
): Router & { setDependencies: (deps: WizardDependencies) => void } {
  const router = createRouter() as Router & { setDependencies: (deps: WizardDependencies) => void };
  const projectBaseDir = baseDirectory || process.cwd();

  // Mutable dependency holder - allows dependencies to be set after router creation
  const deps: WizardDependencies = {
    config,
    platformRegistry,
    quotaManager,
    usageTracker,
    eventBus,
  };

  // Setter to update dependencies after router creation
  router.setDependencies = (newDeps: WizardDependencies) => {
    Object.assign(deps, newDeps);
  };

  /**
   * POST /api/wizard/upload
   * Uploads and parses a requirements document.
   * Accepts JSON with either:
   * - Text content: { text: string, format: SupportedFormat, projectPath?: string }
   * - File content (base64): { file: string (base64), filename: string, format?: SupportedFormat, projectPath?: string }
   */
  router.post('/wizard/upload', async (req: Request, res: Response) => {
    try {
      const projectDir = getProjectDirectory(req);
      const { text, file, filename, format: providedFormat, projectPath } = req.body;
      
      let buffer: Buffer;
      let detectedFormat: SupportedFormat;
      let finalFilename: string;

      if (file && filename) {
        // File upload (base64 encoded)
        try {
          buffer = Buffer.from(file, 'base64');
        } catch {
          res.status(400).json({
            error: 'Invalid base64 file content',
            code: 'BAD_REQUEST',
          } as ErrorResponse);
          return;
        }
        finalFilename = filename;
        detectedFormat = providedFormat || detectFormat(filename);
      } else if (text) {
        // Text paste
        if (typeof text !== 'string' || text.trim().length === 0) {
          res.status(400).json({
            error: 'Text content is required and must be non-empty',
            code: 'BAD_REQUEST',
          } as ErrorResponse);
          return;
        }

        const format = providedFormat || 'text';
        if (!['markdown', 'text', 'pdf', 'docx'].includes(format)) {
          res.status(400).json({
            error: 'Invalid format. Must be one of: markdown, text, pdf, docx',
            code: 'BAD_REQUEST',
          } as ErrorResponse);
          return;
        }

        buffer = Buffer.from(text, 'utf-8');
        finalFilename = `pasted-requirements.${format === 'markdown' ? 'md' : 'txt'}`;
        detectedFormat = format as SupportedFormat;
      } else {
        res.status(400).json({
          error: 'Either "text" or "file" with "filename" must be provided',
          code: 'BAD_REQUEST',
        } as ErrorResponse);
        return;
      }

      const parsed = await parseFile(buffer, finalFilename, detectedFormat, projectDir);
      
      res.json({ parsed });
    } catch (error) {
      const err = error as Error;
      console.error('[Wizard] Upload error:', err);
      res.status(500).json({
        error: err.message || 'Failed to parse requirements document',
        code: 'PARSE_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * POST /api/wizard/generate
   * Generates PRD, architecture, and tier plan from parsed requirements.
   * Uses AI generation when platform dependencies are available, otherwise falls back to rule-based.
   *
   * Body: { parsed: ParsedRequirements, projectPath?: string, projectName?: string, useAI?: boolean }
   * Response: { prd: PRD, architecture: string, tierPlan: TierPlan, usedAI: boolean }
   */
  router.post('/wizard/generate', async (req: Request, res: Response) => {
    try {
      const { parsed, projectPath, projectName, useAI: requestUseAI } = req.body;

      if (!parsed) {
        res.status(400).json({
          error: 'Parsed requirements are required',
          code: 'BAD_REQUEST',
        } as ErrorResponse);
        return;
      }

      const projectDir = projectPath ? resolve(projectPath) : process.cwd();
      const name = projectName || parsed.title || 'Untitled Project';

      // Load config if available
      const configPath = join(projectDir, '.puppet-master', 'config.yaml');
      let loadedConfig: PuppetMasterConfig | undefined;
      if (existsSync(configPath)) {
        try {
          const configManager = new ConfigManager(configPath);
          loadedConfig = await configManager.load();
        } catch {
          // Ignore config load errors, use provided config or undefined
        }
      }
      const effectiveConfig = deps.config || loadedConfig;

      // Check if we have all dependencies for AI generation
      const hasAIDependencies = !!(
        effectiveConfig &&
        deps.platformRegistry &&
        deps.quotaManager &&
        deps.usageTracker
      );

      // Use AI generation only if:
      // 1. We have all required dependencies
      // 2. User didn't explicitly request rule-based generation (useAI !== false)
      const useAI = hasAIDependencies && requestUseAI !== false;

      // Emit start event
      if (useAI && deps.eventBus) {
        deps.eventBus.emit({
          type: 'start_chain_step',
          step: 'generate_prd',
          status: 'started',
          timestamp: new Date().toISOString(),
        });
      }

      // Generate PRD
      const prdGenerator = new PrdGenerator(
        { projectName: name },
        useAI ? deps.platformRegistry : undefined,
        useAI ? deps.quotaManager : undefined,
        effectiveConfig,
        useAI ? deps.usageTracker : undefined
      );

      const prd = await prdGenerator.generateWithAI(parsed, useAI);

      // Emit PRD complete, architecture start
      if (useAI && deps.eventBus) {
        deps.eventBus.emit({
          type: 'start_chain_step',
          step: 'generate_prd',
          status: 'completed',
          timestamp: new Date().toISOString(),
        });
        deps.eventBus.emit({
          type: 'start_chain_step',
          step: 'generate_architecture',
          status: 'started',
          timestamp: new Date().toISOString(),
        });
      }

      // Generate architecture
      const archGenerator = new ArchGenerator(
        { projectName: name },
        useAI ? deps.platformRegistry : undefined,
        useAI ? deps.quotaManager : undefined,
        effectiveConfig,
        useAI ? deps.usageTracker : undefined
      );
      const architecture = await archGenerator.generateWithAI(parsed, prd, useAI);

      // Emit architecture complete
      if (useAI && deps.eventBus) {
        deps.eventBus.emit({
          type: 'start_chain_step',
          step: 'generate_architecture',
          status: 'completed',
          timestamp: new Date().toISOString(),
        });
      }

      // Generate tier plan
      let tierPlan: TierPlan;
      if (effectiveConfig) {
        const tierPlanGenerator = new TierPlanGenerator(effectiveConfig);
        tierPlan = tierPlanGenerator.generate(prd);
      } else {
        // Return empty tier plan if no config
        tierPlan = { phases: [] };
      }

      res.json({ prd, architecture, tierPlan, usedAI: useAI });
    } catch (error) {
      const err = error as Error;
      console.error('[Wizard] Generate error:', err);

      // Emit failure event
      if (deps.eventBus) {
        deps.eventBus.emit({
          type: 'start_chain_step',
          step: 'generate_prd',
          status: 'failed',
          timestamp: new Date().toISOString(),
        });
      }

      res.status(500).json({
        error: err.message || 'Failed to generate PRD',
        code: 'GENERATION_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * POST /api/wizard/validate
   * Validates generated PRD, architecture, and tier plan.
   * 
   * Body: { prd: PRD, architecture: string, tierPlan: TierPlan, projectPath?: string }
   * Response: { valid: boolean, errors: string[], warnings: string[] }
   */
  router.post('/wizard/validate', async (req: Request, res: Response) => {
    try {
      const { prd, architecture, tierPlan, projectPath } = req.body;
      
      if (!prd) {
        res.status(400).json({
          error: 'PRD is required',
          code: 'BAD_REQUEST',
        } as ErrorResponse);
        return;
      }

      const projectDir = projectPath ? resolve(projectPath) : process.cwd();
      
      // Load config if available
      const configPath = join(projectDir, '.puppet-master', 'config.yaml');
      let loadedConfig: PuppetMasterConfig | undefined;
      if (existsSync(configPath)) {
        try {
          const configManager = new ConfigManager(configPath);
          loadedConfig = await configManager.load();
        } catch {
          // Ignore config load errors
        }
      }
      const effectiveConfig = deps.config || loadedConfig;

      const validationGate = new ValidationGate();
      
      let result;
      if (effectiveConfig && architecture && tierPlan) {
        // Use validateAll if we have all components and config
        result = validationGate.validateAll(prd, architecture, tierPlan, effectiveConfig);
      } else {
        // Use individual validations
        const prdResult = validationGate.validatePrd(prd);
        const archResult = architecture ? validationGate.validateArchitecture(architecture) : { valid: true, errors: [], warnings: [] };
        const planResult = tierPlan && effectiveConfig ? validationGate.validateTierPlan(tierPlan, effectiveConfig) : { valid: true, errors: [], warnings: [] };
        
        // Aggregate results
        result = {
          valid: prdResult.valid && archResult.valid && planResult.valid,
          errors: [...prdResult.errors, ...archResult.errors, ...planResult.errors],
          warnings: [...prdResult.warnings, ...archResult.warnings, ...planResult.warnings],
        };
      }
      
      // Convert ValidationError/ValidationWarning to string arrays
      const errors = result.errors.map(e => e.message);
      const warnings = result.warnings.map(w => w.message);
      
      res.json({
        valid: result.valid,
        errors,
        warnings,
      });
    } catch (error) {
      const err = error as Error;
      console.error('[Wizard] Validate error:', err);
      res.status(500).json({
        error: err.message || 'Failed to validate artifacts',
        code: 'VALIDATION_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * POST /api/wizard/save
   * Saves PRD, architecture, and tier plan to disk.
   *
   * If 'parsed' is provided and pipeline dependencies are available, runs the full Start Chain Pipeline.
   * Otherwise, saves the provided artifacts directly (useful when artifacts were already generated via /generate).
   *
   * Body: { parsed?: ParsedRequirements, prd?: PRD, architecture?: string, tierPlan?: TierPlan, projectPath?: string, projectName?: string, runPipeline?: boolean }
   * Response: { success: boolean, path?: string, artifacts?: { prdPath, architecturePath, planPaths }, usedPipeline?: boolean }
   */
  router.post('/wizard/save', async (req: Request, res: Response) => {
    try {
      const { parsed, prd, architecture, tierPlan, projectPath, projectName, runPipeline } = req.body;

      const projectDir = projectPath ? resolve(projectPath) : process.cwd();

      // Check if we have all dependencies for Start Chain Pipeline
      const hasPipelineDependencies = !!(
        deps.config &&
        deps.platformRegistry &&
        deps.quotaManager &&
        deps.usageTracker
      );

      // Run full pipeline if:
      // 1. We have parsed requirements
      // 2. We have all pipeline dependencies
      // 3. User explicitly requested pipeline OR no pre-generated artifacts are provided
      const shouldRunPipeline = parsed && hasPipelineDependencies && (runPipeline === true || (!prd && !architecture));

      if (shouldRunPipeline) {
        // Use Start Chain Pipeline for AI-powered generation
        try {
          const pipeline = new StartChainPipeline(
            deps.config!,
            deps.platformRegistry!,
            deps.quotaManager!,
            deps.usageTracker!,
            deps.eventBus
          );

          const result = await pipeline.execute({
            parsed,
            projectPath: projectDir,
            projectName,
          });

          res.json({
            success: true,
            path: projectDir,
            artifacts: {
              prdPath: result.prdPath,
              architecturePath: result.architecturePath,
              planPaths: result.planPaths,
            },
            usedPipeline: true,
            message: 'Project initialized via Start Chain Pipeline',
          });

          return;
        } catch (pipelineError) {
          const err = pipelineError as Error;
          console.error('[Wizard] Start Chain Pipeline error:', err);
          // Fall through to fallback behavior if we have pre-generated artifacts
          if (!prd) {
            // No fallback available - return the error
            res.status(500).json({
              error: `Start Chain Pipeline failed: ${err.message}`,
              code: 'PIPELINE_ERROR',
            } as ErrorResponse);
            return;
          }
          // Continue to fallback save with provided artifacts
        }
      }

      // Direct save: Save provided artifacts without running the pipeline
      // This is used when artifacts were already generated via /generate endpoint
      if (!prd) {
        res.status(400).json({
          error: 'PRD is required. Either provide a PRD or include parsed requirements to run the pipeline.',
          code: 'BAD_REQUEST',
        } as ErrorResponse);
        return;
      }

      const puppetMasterDir = join(projectDir, '.puppet-master');

      // Ensure .puppet-master directory exists
      await fs.mkdir(puppetMasterDir, { recursive: true });

      // Ensure plans directory exists for tier plans
      const plansDir = join(puppetMasterDir, 'plans');
      await fs.mkdir(plansDir, { recursive: true });

      // Save PRD
      const prdPath = join(puppetMasterDir, 'prd.json');
      const prdManager = new PrdManager(prdPath);
      await prdManager.save(prd);

      // Save architecture if provided
      let architecturePath: string | undefined;
      if (architecture && typeof architecture === 'string') {
        architecturePath = join(puppetMasterDir, 'architecture.md');
        await fs.writeFile(architecturePath, architecture, 'utf-8');
      }

      // Save tier plan if provided
      const planPaths: string[] = [];
      if (tierPlan && tierPlan.phases) {
        const tierPlanPath = join(plansDir, 'tier-plan.json');
        await fs.writeFile(tierPlanPath, JSON.stringify(tierPlan, null, 2), 'utf-8');
        planPaths.push(tierPlanPath);

        // Save individual phase and task plans
        for (const phasePlan of tierPlan.phases) {
          const phasePlanPath = join(plansDir, `phase-${phasePlan.phaseId}-plan.json`);
          await fs.writeFile(phasePlanPath, JSON.stringify(phasePlan, null, 2), 'utf-8');
          planPaths.push(phasePlanPath);

          if (phasePlan.tasks) {
            for (const taskPlan of phasePlan.tasks) {
              const taskPlanPath = join(plansDir, `task-${taskPlan.taskId}-plan.json`);
              await fs.writeFile(taskPlanPath, JSON.stringify(taskPlan, null, 2), 'utf-8');
              planPaths.push(taskPlanPath);
            }
          }
        }
      }

      // Save parsed requirements if provided (for future reference)
      if (parsed) {
        const requirementsDir = join(puppetMasterDir, 'requirements');
        await fs.mkdir(requirementsDir, { recursive: true });
        const parsedPath = join(requirementsDir, 'parsed.json');
        await fs.writeFile(parsedPath, JSON.stringify(parsed, null, 2), 'utf-8');
      }

      // Emit completion event
      if (deps.eventBus) {
        deps.eventBus.emit({
          type: 'start_chain_complete',
          projectPath: projectDir,
          artifacts: {
            prdPath,
            architecturePath: architecturePath || '',
            planPaths,
          },
          timestamp: new Date().toISOString(),
        });
      }

      res.json({
        success: true,
        path: projectDir,
        artifacts: {
          prdPath,
          architecturePath,
          planPaths,
        },
        usedPipeline: false,
        message: 'Artifacts saved successfully',
      });
    } catch (error) {
      const err = error as Error;
      console.error('[Wizard] Save error:', err);
      res.status(500).json({
        error: err.message || 'Failed to save artifacts',
        code: 'SAVE_ERROR',
      } as ErrorResponse);
    }
  });

  return router;
}
