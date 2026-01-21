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
 * Create wizard routes.
 * 
 * @param baseDirectory - Base directory for project operations (optional)
 * @param config - Puppet Master config (optional, for AI generation)
 * @param platformRegistry - Platform registry for AI generation (optional)
 * @param quotaManager - Quota manager for AI generation (optional)
 * @param usageTracker - Usage tracker for AI generation (optional)
 * @param eventBus - Event bus for progress events (optional)
 * @returns Express Router with wizard endpoints
 */
export function createWizardRoutes(
  baseDirectory?: string,
  config?: PuppetMasterConfig,
  platformRegistry?: PlatformRegistry,
  quotaManager?: QuotaManager,
  usageTracker?: UsageTracker,
  eventBus?: EventBus
): Router {
  const router = createRouter();
  const projectBaseDir = baseDirectory || process.cwd();

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
   * 
   * Body: { parsed: ParsedRequirements, projectPath?: string, projectName?: string }
   * Response: { prd: PRD, architecture: string, tierPlan: TierPlan }
   */
  router.post('/wizard/generate', async (req: Request, res: Response) => {
    try {
      const { parsed, projectPath, projectName } = req.body;
      
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
      const effectiveConfig = config || loadedConfig;

      // Generate PRD
      const prdGenerator = new PrdGenerator(
        { projectName: name },
        undefined, // platformRegistry - not available in GUI context
        undefined, // quotaManager - not available in GUI context
        effectiveConfig,
        undefined // usageTracker - not available in GUI context
      );
      
      // Use rule-based generation (no AI in GUI context for now)
      const prd = await prdGenerator.generateWithAI(parsed, false);

      // Generate architecture (stub for now - full implementation later)
      const archGenerator = new ArchGenerator(
        { projectName: name },
        undefined,
        undefined,
        effectiveConfig,
        undefined
      );
      const architecture = await archGenerator.generateWithAI(parsed, prd, false);

      // Generate tier plan
      if (effectiveConfig) {
        const tierPlanGenerator = new TierPlanGenerator(effectiveConfig);
        const tierPlan = tierPlanGenerator.generate(prd);
        
        res.json({ prd, architecture, tierPlan });
      } else {
        // Return empty tier plan if no config
        const tierPlan: TierPlan = { phases: [] };
        res.json({ prd, architecture, tierPlan });
      }
    } catch (error) {
      const err = error as Error;
      console.error('[Wizard] Generate error:', err);
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
      const effectiveConfig = config || loadedConfig;

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
   * Uses Start Chain Pipeline if all dependencies are available, otherwise falls back to direct save.
   * 
   * Body: { parsed: ParsedRequirements, prd?: PRD, architecture?: string, tierPlan?: TierPlan, projectPath?: string, projectName?: string }
   * Response: { success: boolean, path?: string, artifacts?: { prdPath, architecturePath, planPaths } }
   */
  router.post('/wizard/save', async (req: Request, res: Response) => {
    try {
      const { parsed, prd, architecture, tierPlan, projectPath, projectName } = req.body;
      
      const projectDir = projectPath ? resolve(projectPath) : process.cwd();

      // Check if we have all dependencies for Start Chain Pipeline
      const hasAllDependencies = 
        config && 
        platformRegistry && 
        quotaManager && 
        usageTracker && 
        parsed; // Parsed requirements required for pipeline

      if (hasAllDependencies) {
        // Use Start Chain Pipeline for AI-powered generation
        try {
          const pipeline = new StartChainPipeline(
            config,
            platformRegistry,
            quotaManager,
            usageTracker,
            eventBus
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
            message: 'Project initialized via Start Chain Pipeline',
          });

          return;
        } catch (pipelineError) {
          console.error('[Wizard] Start Chain Pipeline error:', pipelineError);
          // Fall through to fallback behavior
          // Don't return error immediately - allow fallback to save what was provided
        }
      }

      // Fallback: Save provided artifacts directly (or use rule-based generation)
      if (!prd) {
        res.status(400).json({
          error: 'PRD is required when Start Chain Pipeline is not available',
          code: 'BAD_REQUEST',
        } as ErrorResponse);
        return;
      }

      const puppetMasterDir = join(projectDir, '.puppet-master');
      
      // Ensure .puppet-master directory exists
      if (!existsSync(puppetMasterDir)) {
        await fs.mkdir(puppetMasterDir, { recursive: true });
      }

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

      // Tier plan is derived from config and PRD, so we don't need to save it separately
      // (it can be regenerated from PRD + config)

      res.json({
        success: true,
        path: projectDir,
        artifacts: {
          prdPath,
          architecturePath,
          planPaths: [],
        },
        warning: hasAllDependencies ? 'Start Chain Pipeline failed, saved provided artifacts' : 'Start Chain Pipeline not available, saved provided artifacts',
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
