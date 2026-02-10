/**
 * Project Switching Integration Tests
 * 
 * Tests the project discovery, creation, and switching functionality:
 * - GUI-004: Project Switching
 * - Lists discovered projects from base directory
 * - Creates new projects with proper structure
 * - Opens/switches to existing projects
 * - Validates project paths
 * 
 * Integration path: GUI-004
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { existsSync } from 'fs';
import express from 'express';
import request from 'supertest';
import { createProjectsRoutes, type Project } from '../../src/gui/routes/projects.js';
import { canListenOnLoopback } from '../../src/test-helpers/net-availability.js';

const NET_OK = await canListenOnLoopback();
const describeNet = NET_OK ? describe : describe.skip;

describeNet('Project Switching Integration Tests', () => {
  let tempDir: string;
  let app: express.Express;

  beforeEach(async () => {
    // Create temp directory for test projects
    tempDir = join(tmpdir(), `pm-projects-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    // Create Express app with projects routes
    app = express();
    app.use(express.json());
    app.use('/api', createProjectsRoutes(null, tempDir));
  });

  afterEach(async () => {
    // Cleanup temp directory
    if (tempDir && existsSync(tempDir)) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  describe('GUI-004: Project Switching Flow', () => {
    it('discovers projects in base directory', async () => {
      // Create a project with .puppet-master directory
      const projectPath = join(tempDir, 'test-project');
      await fs.mkdir(join(projectPath, '.puppet-master'), { recursive: true });
      await fs.writeFile(
        join(projectPath, '.puppet-master', 'config.yaml'),
        'project:\n  name: Test Project\n  workingDirectory: .\n'
      );

      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body.projects).toBeDefined();
      expect(response.body.projects.length).toBeGreaterThanOrEqual(1);
      
      const project = response.body.projects.find((p: Project) => p.path === projectPath);
      expect(project).toBeDefined();
      expect(project.hasConfig).toBe(true);
    });

    it('discovers multiple projects sorted by lastModified', async () => {
      // Create first project
      const project1 = join(tempDir, 'project-1');
      await fs.mkdir(join(project1, '.puppet-master'), { recursive: true });
      
      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Create second project (more recent)
      const project2 = join(tempDir, 'project-2');
      await fs.mkdir(join(project2, '.puppet-master'), { recursive: true });

      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body.projects.length).toBeGreaterThanOrEqual(2);
      
      // Should be sorted by lastModified descending (newest first)
      const p1Index = response.body.projects.findIndex((p: Project) => p.path === project1);
      const p2Index = response.body.projects.findIndex((p: Project) => p.path === project2);
      expect(p2Index).toBeLessThan(p1Index);
    });

    it('creates new project with proper directory structure', async () => {
      const projectName = 'new-test-project';
      const projectPath = join(tempDir, projectName);

      const response = await request(app)
        .post('/api/projects')
        .send({ name: projectName, path: projectPath })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.project).toBeDefined();
      expect(response.body.project.name).toBe(projectName);

      // Verify directory structure was created
      expect(existsSync(projectPath)).toBe(true);
      expect(existsSync(join(projectPath, '.puppet-master'))).toBe(true);
      expect(existsSync(join(projectPath, '.puppet-master', 'config.yaml'))).toBe(true);
    });

    it('prevents creating project in existing project directory', async () => {
      // Create existing project
      const projectPath = join(tempDir, 'existing-project');
      await fs.mkdir(join(projectPath, '.puppet-master'), { recursive: true });

      const response = await request(app)
        .post('/api/projects')
        .send({ name: 'existing', path: projectPath })
        .expect(400);

      expect(response.body.error).toContain('already a project');
      expect(response.body.code).toBe('ALREADY_EXISTS');
    });

    it('switches to existing project via open endpoint', async () => {
      // Create project with PRD
      const projectPath = join(tempDir, 'switch-target');
      await fs.mkdir(join(projectPath, '.puppet-master'), { recursive: true });
      
      // Create a valid PRD file
      const prd = {
        project: 'Switch Target Project',
        phases: [],
        metadata: { totalTasks: 0, totalSubtasks: 0 }
      };
      await fs.writeFile(
        join(projectPath, '.puppet-master', 'prd.json'),
        JSON.stringify(prd, null, 2)
      );

      // Without orchestrator, it should return success with warning
      const response = await request(app)
        .post('/api/projects/open')
        .send({ path: projectPath })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.path).toBe(projectPath);
      expect(response.body.warning).toContain('Orchestrator not available');
    });

    it('rejects opening non-existent project', async () => {
      const response = await request(app)
        .post('/api/projects/open')
        .send({ path: '/non/existent/path' })
        .expect(404);

      expect(response.body.error).toContain('not found');
      expect(response.body.code).toBe('NOT_FOUND');
    });

    it('rejects opening invalid project (no indicators)', async () => {
      // Create directory without any project indicators
      const notProjectPath = join(tempDir, 'not-a-project');
      await fs.mkdir(notProjectPath, { recursive: true });
      await fs.writeFile(join(notProjectPath, 'random.txt'), 'just a file');

      const response = await request(app)
        .post('/api/projects/open')
        .send({ path: notProjectPath })
        .expect(400);

      expect(response.body.error).toContain('not a valid project');
      expect(response.body.code).toBe('INVALID_PROJECT');
    });
  });

  describe('Project Discovery Edge Cases', () => {
    it('returns empty array for empty base directory', async () => {
      // tempDir is empty initially
      const emptyDir = join(tempDir, 'empty');
      await fs.mkdir(emptyDir, { recursive: true });

      const emptyApp = express();
      emptyApp.use(express.json());
      emptyApp.use('/api', createProjectsRoutes(null, emptyDir));

      const response = await request(emptyApp)
        .get('/api/projects')
        .expect(200);

      expect(response.body.projects).toEqual([]);
    });

    it('discovers project with only AGENTS.md', async () => {
      const projectPath = join(tempDir, 'agents-only');
      await fs.mkdir(projectPath, { recursive: true });
      await fs.writeFile(join(projectPath, 'AGENTS.md'), '# AGENTS.md');

      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      const project = response.body.projects.find((p: Project) => p.path === projectPath);
      expect(project).toBeDefined();
    });

    it('discovers project with only root prd.json', async () => {
      const projectPath = join(tempDir, 'prd-only');
      await fs.mkdir(projectPath, { recursive: true });
      await fs.writeFile(
        join(projectPath, 'prd.json'),
        JSON.stringify({ project: 'PRD Only', phases: [] })
      );

      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      const project = response.body.projects.find((p: Project) => p.path === projectPath);
      expect(project).toBeDefined();
      expect(project.hasPrd).toBe(true);
    });

    it('extracts project name from prd.json', async () => {
      const projectPath = join(tempDir, 'named-project');
      await fs.mkdir(join(projectPath, '.puppet-master'), { recursive: true });
      await fs.writeFile(
        join(projectPath, '.puppet-master', 'prd.json'),
        JSON.stringify({ project: 'My Custom Project Name', phases: [] })
      );

      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      const project = response.body.projects.find((p: Project) => p.path === projectPath);
      expect(project).toBeDefined();
      expect(project.name).toBe('My Custom Project Name');
    });
  });

  describe('API Validation', () => {
    it('rejects create with missing name', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ path: '/some/path' })
        .expect(400);

      expect(response.body.error).toContain('name is required');
    });

    it('rejects create with missing path', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ name: 'test' })
        .expect(400);

      expect(response.body.error).toContain('path is required');
    });

    it('rejects open with missing path', async () => {
      const response = await request(app)
        .post('/api/projects/open')
        .send({})
        .expect(400);

      expect(response.body.error).toContain('path is required');
    });

    it('rejects open with empty path string', async () => {
      const response = await request(app)
        .post('/api/projects/open')
        .send({ path: '   ' })
        .expect(400);

      expect(response.body.error).toContain('path is required');
    });
  });
});
