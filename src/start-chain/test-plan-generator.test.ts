/**
 * Test Plan Generator Tests
 * 
 * Tests for the TestPlanGenerator implementation.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestPlanGenerator } from './test-plan-generator.js';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('TestPlanGenerator', () => {
  let tempDir: string;
  let generator: TestPlanGenerator;

  beforeEach(async () => {
    // Create a temporary directory for each test
    tempDir = join(tmpdir(), `test-plan-generator-${Date.now()}-${Math.random().toString(36).substring(7)}`);
    await mkdir(tempDir, { recursive: true });
    generator = new TestPlanGenerator(tempDir);
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('TypeScript project detection', () => {
    it('should detect TypeScript project with package.json and tsconfig.json', async () => {
      await writeFile(join(tempDir, 'package.json'), JSON.stringify({ name: 'test' }));
      await writeFile(join(tempDir, 'tsconfig.json'), JSON.stringify({}));

      const detected = await generator.detectProject(tempDir);
      expect(detected.language).toBe('typescript');
      expect(detected.testCommands).toContain('npm run typecheck');
      expect(detected.lintCommands).toContain('npm run lint');
    });

    it('should detect TypeScript project with tests', async () => {
      await writeFile(join(tempDir, 'package.json'), JSON.stringify({ name: 'test' }));
      await writeFile(join(tempDir, 'tsconfig.json'), JSON.stringify({}));
      await mkdir(join(tempDir, 'src'), { recursive: true });
      await writeFile(join(tempDir, 'src', 'test.test.ts'), '// test');

      const detected = await generator.detectProject(tempDir);
      expect(detected.language).toBe('typescript');
      expect(detected.hasTests).toBe(true);
      expect(detected.testCommands).toContain('npm test');
    });

    it('should detect TypeScript project without tests', async () => {
      await writeFile(join(tempDir, 'package.json'), JSON.stringify({ name: 'test' }));
      await writeFile(join(tempDir, 'tsconfig.json'), JSON.stringify({}));

      const detected = await generator.detectProject(tempDir);
      expect(detected.language).toBe('typescript');
      expect(detected.hasTests).toBe(false);
      expect(detected.testCommands).not.toContain('npm test');
    });

    it('should detect tests in __tests__ directory', async () => {
      await writeFile(join(tempDir, 'package.json'), JSON.stringify({ name: 'test' }));
      await mkdir(join(tempDir, '__tests__'), { recursive: true });
      await writeFile(join(tempDir, '__tests__', 'test.ts'), '// test');

      const detected = await generator.detectProject(tempDir);
      expect(detected.hasTests).toBe(true);
    });
  });

  describe('Python project detection', () => {
    it('should detect Python project with pyproject.toml', async () => {
      await writeFile(join(tempDir, 'pyproject.toml'), '[project]\nname = "test"');

      const detected = await generator.detectProject(tempDir);
      expect(detected.language).toBe('python');
      expect(detected.lintCommands).toContain('ruff check .');
      expect(detected.lintCommands).toContain('mypy .');
    });

    it('should detect Python project with setup.py', async () => {
      await writeFile(join(tempDir, 'setup.py'), 'from setuptools import setup');

      const detected = await generator.detectProject(tempDir);
      expect(detected.language).toBe('python');
    });

    it('should detect Python project with tests', async () => {
      await writeFile(join(tempDir, 'pyproject.toml'), '[project]\nname = "test"');
      await mkdir(join(tempDir, 'tests'), { recursive: true });
      await writeFile(join(tempDir, 'tests', 'test_example.py'), '# test');

      const detected = await generator.detectProject(tempDir);
      expect(detected.language).toBe('python');
      expect(detected.hasTests).toBe(true);
      expect(detected.testCommands).toContain('pytest');
    });

    it('should detect Python project without tests', async () => {
      await writeFile(join(tempDir, 'pyproject.toml'), '[project]\nname = "test"');

      const detected = await generator.detectProject(tempDir);
      expect(detected.language).toBe('python');
      expect(detected.hasTests).toBe(false);
      expect(detected.testCommands).not.toContain('pytest');
    });
  });

  describe('Rust project detection', () => {
    it('should detect Rust project with Cargo.toml', async () => {
      await writeFile(join(tempDir, 'Cargo.toml'), '[package]\nname = "test"');

      const detected = await generator.detectProject(tempDir);
      expect(detected.language).toBe('rust');
      expect(detected.lintCommands).toContain('cargo clippy');
    });

    it('should detect Rust project with tests', async () => {
      await writeFile(join(tempDir, 'Cargo.toml'), '[package]\nname = "test"');
      await mkdir(join(tempDir, 'src'), { recursive: true });
      await writeFile(join(tempDir, 'src', 'lib.rs'), '#[cfg(test)]\nmod tests {}');

      const detected = await generator.detectProject(tempDir);
      expect(detected.language).toBe('rust');
      expect(detected.hasTests).toBe(true);
      expect(detected.testCommands).toContain('cargo test');
    });

    it('should detect Rust project without tests', async () => {
      await writeFile(join(tempDir, 'Cargo.toml'), '[package]\nname = "test"');

      const detected = await generator.detectProject(tempDir);
      expect(detected.language).toBe('rust');
      expect(detected.hasTests).toBe(false);
    });
  });

  describe('Go project detection', () => {
    it('should detect Go project with go.mod', async () => {
      await writeFile(join(tempDir, 'go.mod'), 'module test');

      const detected = await generator.detectProject(tempDir);
      expect(detected.language).toBe('go');
      expect(detected.lintCommands).toContain('go vet ./...');
    });

    it('should detect Go project with tests', async () => {
      await writeFile(join(tempDir, 'go.mod'), 'module test');
      await mkdir(join(tempDir, 'src'), { recursive: true });
      await writeFile(join(tempDir, 'src', 'test_test.go'), 'package src');

      const detected = await generator.detectProject(tempDir);
      expect(detected.language).toBe('go');
      expect(detected.hasTests).toBe(true);
      expect(detected.testCommands).toContain('go test ./...');
    });

    it('should detect Go project without tests', async () => {
      await writeFile(join(tempDir, 'go.mod'), 'module test');

      const detected = await generator.detectProject(tempDir);
      expect(detected.language).toBe('go');
      expect(detected.hasTests).toBe(false);
    });
  });

  describe('Java project detection', () => {
    it('should detect Java Maven project with pom.xml', async () => {
      await writeFile(join(tempDir, 'pom.xml'), '<project></project>');

      const detected = await generator.detectProject(tempDir);
      expect(detected.language).toBe('java');
      expect(detected.framework).toBe('maven');
    });

    it('should detect Java Gradle project with build.gradle', async () => {
      await writeFile(join(tempDir, 'build.gradle'), 'plugins {}');

      const detected = await generator.detectProject(tempDir);
      expect(detected.language).toBe('java');
      expect(detected.framework).toBe('gradle');
    });

    it('should detect Java Gradle project with build.gradle.kts', async () => {
      await writeFile(join(tempDir, 'build.gradle.kts'), 'plugins {}');

      const detected = await generator.detectProject(tempDir);
      expect(detected.language).toBe('java');
      expect(detected.framework).toBe('gradle');
    });

    it('should detect Java Maven project with tests', async () => {
      await writeFile(join(tempDir, 'pom.xml'), '<project></project>');
      await mkdir(join(tempDir, 'src', 'test'), { recursive: true });
      await writeFile(join(tempDir, 'src', 'test', 'Test.java'), 'class Test {}');

      const detected = await generator.detectProject(tempDir);
      expect(detected.language).toBe('java');
      expect(detected.hasTests).toBe(true);
      expect(detected.testCommands).toContain('mvn test');
    });
  });

  describe('Unknown project detection', () => {
    it('should return unknown for project with no recognized files', async () => {
      const detected = await generator.detectProject(tempDir);
      expect(detected.language).toBe('unknown');
      expect(detected.hasTests).toBe(false);
      expect(detected.testCommands).toHaveLength(0);
    });
  });

  describe('generateTestPlan', () => {
    it('should generate test plan with commands for TypeScript project', async () => {
      await writeFile(join(tempDir, 'package.json'), JSON.stringify({ name: 'test' }));
      await writeFile(join(tempDir, 'tsconfig.json'), JSON.stringify({}));
      await mkdir(join(tempDir, 'src'), { recursive: true });
      await writeFile(join(tempDir, 'src', 'test.test.ts'), '// test');

      const detected = await generator.detectProject(tempDir);
      const testPlan = generator.generateTestPlan(detected);

      expect(testPlan.failFast).toBe(true);
      expect(testPlan.commands.length).toBeGreaterThan(0);
      expect(testPlan.commands.some((cmd) => cmd.command === 'npm')).toBe(true);
    });

    it('should generate empty test plan for unknown project', async () => {
      const detected = await generator.detectProject(tempDir);
      const testPlan = generator.generateTestPlan(detected);

      expect(testPlan.failFast).toBe(true);
      expect(testPlan.commands).toHaveLength(0);
    });

    it('should convert command strings to TestCommand format', async () => {
      await writeFile(join(tempDir, 'package.json'), JSON.stringify({ name: 'test' }));
      await writeFile(join(tempDir, 'tsconfig.json'), JSON.stringify({}));

      const detected = await generator.detectProject(tempDir);
      const testPlan = generator.generateTestPlan(detected);

      for (const cmd of testPlan.commands) {
        expect(cmd).toHaveProperty('command');
        expect(typeof cmd.command).toBe('string');
      }
    });
  });

  describe('generateTestSetupSubtask', () => {
    it('should return null when tests exist', async () => {
      await writeFile(join(tempDir, 'package.json'), JSON.stringify({ name: 'test' }));
      await writeFile(join(tempDir, 'tsconfig.json'), JSON.stringify({}));
      await mkdir(join(tempDir, 'src'), { recursive: true });
      await writeFile(join(tempDir, 'src', 'test.test.ts'), '// test');

      const detected = await generator.detectProject(tempDir);
      const subtask = generator.generateTestSetupSubtask(detected, 'TK-001', 1);

      expect(subtask).toBeNull();
    });

    it('should generate subtask spec when no tests exist', async () => {
      await writeFile(join(tempDir, 'package.json'), JSON.stringify({ name: 'test' }));
      await writeFile(join(tempDir, 'tsconfig.json'), JSON.stringify({}));

      const detected = await generator.detectProject(tempDir);
      const subtask = generator.generateTestSetupSubtask(detected, 'TK-001', 1);

      expect(subtask).not.toBeNull();
      expect(subtask?.title).toBe('Set up test harness');
      expect(subtask?.description).toContain('typescript');
      expect(subtask?.acceptanceCriteria).toContain('Test framework configured');
      expect(subtask?.acceptanceCriteria).toContain('At least one passing test exists');
    });

    it('should return null for unknown project type', async () => {
      const detected = await generator.detectProject(tempDir);
      const subtask = generator.generateTestSetupSubtask(detected, 'TK-001', 1);

      expect(subtask).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle missing project path gracefully', async () => {
      const gen = new TestPlanGenerator('/nonexistent/path');
      const detected = await gen.detectProject('/nonexistent/path');
      expect(detected.language).toBe('unknown');
    });

    it('should handle nested test directories', async () => {
      await writeFile(join(tempDir, 'package.json'), JSON.stringify({ name: 'test' }));
      await mkdir(join(tempDir, 'src', 'components', '__tests__'), { recursive: true });
      await writeFile(join(tempDir, 'src', 'components', '__tests__', 'test.ts'), '// test');

      const detected = await generator.detectProject(tempDir);
      expect(detected.hasTests).toBe(true);
    });

    it('should ignore node_modules directory', async () => {
      await writeFile(join(tempDir, 'package.json'), JSON.stringify({ name: 'test' }));
      await mkdir(join(tempDir, 'node_modules', 'test'), { recursive: true });
      await writeFile(join(tempDir, 'node_modules', 'test', 'test.test.ts'), '// test');

      const detected = await generator.detectProject(tempDir);
      expect(detected.hasTests).toBe(false);
    });
  });
});
