/**
 * Projects API routes for RWM Puppet Master GUI
 * 
 * Provides REST endpoints for listing, creating, and opening projects.
 * See BUILD_QUEUE_PHASE_9.md PH9-T05 for specification.
 */

import type { Router, Request, Response } from 'express';
import { Router as createRouter } from 'express';
import { promises as fs } from 'fs';
import { join, basename, resolve } from 'path';
import { existsSync, statSync } from 'fs';
import type { PRD } from '../../types/prd.js';
import { PrdManager } from '../../memory/prd-manager.js';
import { ConfigManager } from '../../config/config-manager.js';

/**
 * Error response interface.
 */
interface ErrorResponse {
  error: string;
  code: string;
}

/**
 * Project interface for API responses.
 */
export interface Project {
  name: string;
  path: string;
  lastModified: string;
  hasConfig: boolean;
  hasPrd: boolean;
  status: 'idle' | 'running' | 'paused' | 'complete';
  phaseProgress?: string;
}

/**
 * Create projects routes.
 * 
 * Returns Express Router with project management endpoints.
 */
export function createProjectsRoutes(baseDirectory?: string): Router {
  const router = createRouter();
  const projectBaseDir = baseDirectory || process.cwd();

  /**
   * GET /api/projects
   * Returns list of discovered projects in the base directory.
   * Scans subdirectories for project indicators (.puppet-master/, prd.json, etc.).
   */
  router.get('/projects', async (_req: Request, res: Response) => {
    try {
      const projects = await discoverProjects(projectBaseDir);
      
      // Sort by lastModified (descending)
      projects.sort((a, b) => 
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      );

      res.json({ projects });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * POST /api/projects
   * Creates a new project directory structure.
   * Body: { name: string, path: string }
   */
  router.post('/projects', async (req: Request, res: Response) => {
    try {
      const { name, path: projectPath } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({
          error: 'Project name is required',
          code: 'BAD_REQUEST',
        } as ErrorResponse);
        return;
      }

      if (!projectPath || typeof projectPath !== 'string' || projectPath.trim().length === 0) {
        res.status(400).json({
          error: 'Project path is required',
          code: 'BAD_REQUEST',
        } as ErrorResponse);
        return;
      }

      const fullPath = resolve(projectPath.trim());
      
      // Check if directory already exists
      if (existsSync(fullPath)) {
        const stats = statSync(fullPath);
        if (!stats.isDirectory()) {
          res.status(400).json({
            error: 'Path exists but is not a directory',
            code: 'BAD_REQUEST',
          } as ErrorResponse);
          return;
        }

        // Check if already a project
        const puppetMasterDir = join(fullPath, '.puppet-master');
        if (existsSync(puppetMasterDir)) {
          res.status(400).json({
            error: 'Directory is already a project',
            code: 'ALREADY_EXISTS',
          } as ErrorResponse);
          return;
        }
      }

      // Create directory if it doesn't exist
      await fs.mkdir(fullPath, { recursive: true });

      // Create .puppet-master directory
      const puppetMasterDir = join(fullPath, '.puppet-master');
      await fs.mkdir(puppetMasterDir, { recursive: true });

      // Create default config.yaml if it doesn't exist
      const configPath = join(puppetMasterDir, 'config.yaml');
      if (!existsSync(configPath)) {
        const { getDefaultConfig } = await import('../../config/default-config.js');
        const defaultConfig = getDefaultConfig();
        defaultConfig.project.name = name.trim();
        defaultConfig.project.workingDirectory = '.';

        const yaml = await import('js-yaml');
        const yamlContent = yaml.dump(defaultConfig, { indent: 2 });
        await fs.writeFile(configPath, yamlContent, 'utf-8');
      }

      // Create project object for response
      const stats = await fs.stat(fullPath);
      const project: Project = {
        name: name.trim(),
        path: fullPath,
        lastModified: stats.mtime.toISOString(),
        hasConfig: true,
        hasPrd: false,
        status: 'idle',
      };

      res.json({
        success: true,
        project,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * POST /api/projects/open
   * Sets the active project path.
   * Body: { path: string }
   */
  router.post('/projects/open', async (req: Request, res: Response) => {
    try {
      const { path: projectPath } = req.body;

      if (!projectPath || typeof projectPath !== 'string' || projectPath.trim().length === 0) {
        res.status(400).json({
          error: 'Project path is required',
          code: 'BAD_REQUEST',
        } as ErrorResponse);
        return;
      }

      const fullPath = resolve(projectPath.trim());

      // Verify project exists and is valid
      if (!existsSync(fullPath)) {
        res.status(404).json({
          error: 'Project directory not found',
          code: 'NOT_FOUND',
        } as ErrorResponse);
        return;
      }

      const stats = statSync(fullPath);
      if (!stats.isDirectory()) {
        res.status(400).json({
          error: 'Path is not a directory',
          code: 'BAD_REQUEST',
        } as ErrorResponse);
        return;
      }

      // Check if it's a valid project (has .puppet-master/ or prd.json)
      const puppetMasterDir = join(fullPath, '.puppet-master');
      const prdPath = join(fullPath, 'prd.json');
      const puppetMasterPrdPath = join(puppetMasterDir, 'prd.json');

      if (!existsSync(puppetMasterDir) && !existsSync(prdPath) && !existsSync(puppetMasterPrdPath)) {
        res.status(400).json({
          error: 'Directory is not a valid project',
          code: 'INVALID_PROJECT',
        } as ErrorResponse);
        return;
      }

      // For now, store in memory (in production, would store in config or session)
      // The frontend will navigate to dashboard after success
      
      res.json({
        success: true,
        path: fullPath,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
      } as ErrorResponse);
    }
  });

  return router;
}

/**
 * Discover projects in a directory.
 * Scans subdirectories for project indicators.
 */
async function discoverProjects(baseDir: string): Promise<Project[]> {
  const projects: Project[] = [];

  try {
    // Check if base directory exists
    if (!existsSync(baseDir)) {
      return projects;
    }

    const stats = statSync(baseDir);
    if (!stats.isDirectory()) {
      return projects;
    }

    // Check if base directory itself is a project
    const baseProject = await checkProject(baseDir);
    if (baseProject) {
      projects.push(baseProject);
    }

    // Scan subdirectories
    const entries = await fs.readdir(baseDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subDirPath = join(baseDir, entry.name);
        const project = await checkProject(subDirPath);
        
        if (project) {
          projects.push(project);
        }
      }
    }
  } catch (error) {
    // If we can't read the directory, return empty array
    console.error('Error discovering projects:', error);
  }

  return projects;
}

/**
 * Check if a directory is a project and return project info if so.
 */
async function checkProject(dirPath: string): Promise<Project | null> {
  try {
    const puppetMasterDir = join(dirPath, '.puppet-master');
    const rootPrdPath = join(dirPath, 'prd.json');
    const puppetMasterPrdPath = join(puppetMasterDir, 'prd.json');
    const configPath = join(puppetMasterDir, 'config.yaml');
    const agentsPath = join(dirPath, 'AGENTS.md');
    const progressPath = join(dirPath, 'progress.txt');

    // Check for project indicators
    const hasPuppetMasterDir = existsSync(puppetMasterDir);
    const hasRootPrd = existsSync(rootPrdPath);
    const hasPuppetMasterPrd = existsSync(puppetMasterPrdPath);
    const hasConfig = existsSync(configPath);
    const hasAgents = existsSync(agentsPath);
    const hasProgress = existsSync(progressPath);

    // Must have at least one indicator to be a project
    if (!hasPuppetMasterDir && !hasRootPrd && !hasPuppetMasterPrd && !hasAgents && !hasProgress) {
      return null;
    }

    // Get directory stats for lastModified
    const stats = await fs.stat(dirPath);
    const lastModified = stats.mtime.toISOString();

    // Determine project name
    let projectName = basename(dirPath);
    
    // Try to get name from config.yaml
    if (hasConfig) {
      try {
        const configManager = new ConfigManager(configPath);
        const config = await configManager.load();
        if (config.project?.name) {
          projectName = config.project.name;
        }
      } catch {
        // Ignore config read errors, use directory name
      }
    }

    // Try to get name and status from prd.json
    let status: 'idle' | 'running' | 'paused' | 'complete' = 'idle';
    let phaseProgress: string | undefined;

    const prdPathToUse = hasPuppetMasterPrd ? puppetMasterPrdPath : (hasRootPrd ? rootPrdPath : null);
    
    if (prdPathToUse) {
      try {
        const prdManager = new PrdManager(prdPathToUse);
        const prd = await prdManager.load();
        
        if (prd.project) {
          projectName = prd.project;
        }

        // Determine status from phases
        if (prd.phases && prd.phases.length > 0) {
          const runningPhase = prd.phases.find(p => p.status === 'running');
          const completedPhases = prd.phases.filter(p => p.status === 'passed').length;
          const totalPhases = prd.phases.length;

          if (runningPhase) {
            status = 'running';
            phaseProgress = `Phase ${completedPhases + 1}/${totalPhases}`;
          } else if (completedPhases === totalPhases) {
            status = 'complete';
            phaseProgress = `Complete`;
          } else {
            status = 'idle';
            phaseProgress = `Phase ${completedPhases}/${totalPhases}`;
          }
        }
      } catch {
        // Ignore PRD read errors, use defaults
      }
    }

    const project: Project = {
      name: projectName,
      path: dirPath,
      lastModified,
      hasConfig,
      hasPrd: hasRootPrd || hasPuppetMasterPrd,
      status,
      phaseProgress,
    };

    return project;
  } catch (error) {
    // If we can't check the directory, it's not a project
    return null;
  }
}
