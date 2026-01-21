import { describe, it, expect } from 'vitest';
import { join } from 'node:path';

import {
  deriveProjectRootFromConfigPath,
  resolveUnderProjectRoot,
  resolveWorkingDirectory,
} from './project-paths.js';

describe('project-paths', () => {
  describe('deriveProjectRootFromConfigPath', () => {
    it('derives project root from .puppet-master/config.yaml', () => {
      const projectRoot = join('/tmp', 'example-project');
      const configPath = join(projectRoot, '.puppet-master', 'config.yaml');

      expect(deriveProjectRootFromConfigPath(configPath)).toBe(projectRoot);
    });

    it('derives project root from .puppet-master/config.yml', () => {
      const projectRoot = join('/tmp', 'example-project');
      const configPath = join(projectRoot, '.puppet-master', 'config.yml');

      expect(deriveProjectRootFromConfigPath(configPath)).toBe(projectRoot);
    });

    it('defaults to the config file directory for non-.puppet-master config paths', () => {
      const projectRoot = join('/tmp', 'example-project');
      const configPath = join(projectRoot, 'puppet-master.yaml');

      expect(deriveProjectRootFromConfigPath(configPath)).toBe(projectRoot);
    });
  });

  describe('resolveUnderProjectRoot', () => {
    it('resolves relative paths under project root', () => {
      const projectRoot = join('/tmp', 'example-project');
      const resolved = resolveUnderProjectRoot(projectRoot, '.puppet-master/prd.json');

      expect(resolved).toBe(join(projectRoot, '.puppet-master', 'prd.json'));
    });

    it('passes through absolute paths', () => {
      const projectRoot = join('/tmp', 'example-project');
      const absolute = join('/var', 'data', 'file.txt');

      expect(resolveUnderProjectRoot(projectRoot, absolute)).toBe(absolute);
    });
  });

  describe('resolveWorkingDirectory', () => {
    it('resolves relative workingDirectory under project root', () => {
      const projectRoot = join('/tmp', 'example-project');
      expect(resolveWorkingDirectory(projectRoot, '.')).toBe(projectRoot);
      expect(resolveWorkingDirectory(projectRoot, 'src')).toBe(join(projectRoot, 'src'));
    });

    it('returns project root for empty workingDirectory', () => {
      const projectRoot = join('/tmp', 'example-project');
      expect(resolveWorkingDirectory(projectRoot, '   ')).toBe(projectRoot);
    });

    it('passes through absolute workingDirectory', () => {
      const projectRoot = join('/tmp', 'example-project');
      const absolute = join('/var', 'data');
      expect(resolveWorkingDirectory(projectRoot, absolute)).toBe(absolute);
    });
  });
});

