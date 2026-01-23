/**
 * Test Plan Generator for RWM Puppet Master
 * 
 * Auto-generates test commands based on project language/framework detection.
 * Replaces empty test plans with actual executable commands.
 * 
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T06 for requirements.
 */

import { access, constants, readdir, stat } from 'fs/promises';
import { join } from 'path';
import type { TestPlan, TestCommand } from '../types/tiers.js';
import type { Subtask } from '../types/prd.js';

/**
 * Detected project information.
 */
export interface DetectedProject {
  language: 'typescript' | 'python' | 'rust' | 'go' | 'java' | 'unknown';
  framework?: string;
  hasTests: boolean;
  testCommands: string[];
  lintCommands: string[];
  buildCommands: string[];
}

/**
 * Subtask specification for test setup.
 */
export interface SubtaskSpec {
  title: string;
  description: string;
  acceptanceCriteria: string[];
}

/**
 * Test Plan Generator class.
 * Detects project type and generates appropriate test commands.
 */
export class TestPlanGenerator {
  private readonly projectPath: string;

  constructor(projectPath: string = '.') {
    this.projectPath = projectPath;
  }

  /**
   * Checks if a file exists at the given path.
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await access(filePath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks if a directory exists and is accessible.
   */
  private async directoryExists(dirPath: string): Promise<boolean> {
    try {
      const stats = await stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Recursively searches for files matching a pattern in a directory.
   * Returns true if any matching file is found.
   */
  private async findFilesMatching(
    dirPath: string,
    patterns: string[],
    maxDepth: number = 3,
    currentDepth: number = 0
  ): Promise<boolean> {
    if (currentDepth >= maxDepth) {
      return false;
    }

    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        // Check if file matches any pattern
        if (entry.isFile()) {
          for (const pattern of patterns) {
            // Check if filename contains or ends with the pattern
            if (entry.name.includes(pattern) || entry.name.endsWith(pattern)) {
              return true;
            }
            // Also check if pattern is a suffix (e.g., "_test.rs" should match "my_test.rs")
            if (pattern.startsWith('_') && entry.name.endsWith(pattern)) {
              return true;
            }
            // Check if pattern is a prefix (e.g., "test_" should match "test_example.py")
            if (pattern.endsWith('_') && entry.name.startsWith(pattern)) {
              return true;
            }
          }
        }

        // Recursively search subdirectories (skip node_modules, .git, etc.)
        // But allow __tests__ directories even if they start with underscore
        if (
          entry.isDirectory() &&
          entry.name !== 'node_modules' &&
          (!entry.name.startsWith('.') || entry.name === '__tests__')
        ) {
          // Check if this directory itself matches a pattern (for test directory names)
          for (const pattern of patterns) {
            if (pattern.endsWith('/') && entry.name === pattern.slice(0, -1)) {
              // Found a test directory
              try {
                const dirEntries = await readdir(fullPath);
                if (dirEntries.length > 0) {
                  return true;
                }
              } catch {
                // Ignore errors
              }
            }
          }
          const found = await this.findFilesMatching(fullPath, patterns, maxDepth, currentDepth + 1);
          if (found) {
            return true;
          }
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
      return false;
    }

    return false;
  }

  /**
   * Detects the project type and checks for test files.
   */
  async detectProject(projectPath: string = this.projectPath): Promise<DetectedProject> {
    const detected: DetectedProject = {
      language: 'unknown',
      hasTests: false,
      testCommands: [],
      lintCommands: [],
      buildCommands: [],
    };

    // Check for TypeScript/JavaScript (package.json)
    const packageJsonPath = join(projectPath, 'package.json');
    if (await this.fileExists(packageJsonPath)) {
      const tsconfigPath = join(projectPath, 'tsconfig.json');
      if (await this.fileExists(tsconfigPath)) {
        detected.language = 'typescript';
      } else {
        detected.language = 'typescript'; // Default to TypeScript for Node.js projects
      }

      // Check for test files
      const testPatterns = ['.test.ts', '.spec.ts', '.test.js', '.spec.js'];
      const testDirs = ['tests', '__tests__', 'test'];
      const hasTestFiles = await this.findFilesMatching(projectPath, testPatterns);
      // Check if test directories exist and contain files
      const testDirChecks = await Promise.all(
        testDirs.map(async (dir) => {
          const dirPath = join(projectPath, dir);
          if (await this.directoryExists(dirPath)) {
            // Check if directory has any files (not just empty)
            try {
              const entries = await readdir(dirPath);
              return entries.length > 0;
            } catch {
              return false;
            }
          }
          return false;
        })
      );
      // Also check for nested test directories
      const hasNestedTestDirs = await this.findFilesMatching(projectPath, testDirs.map((d) => d + '/'), 5);
      detected.hasTests = hasTestFiles || testDirChecks.some((exists) => exists) || hasNestedTestDirs;

      // Generate commands
      if (detected.hasTests) {
        detected.testCommands.push('npm test');
      }
      detected.testCommands.push('npm run typecheck');
      detected.lintCommands.push('npm run lint');

      return detected;
    }

    // Check for Python (pyproject.toml or setup.py)
    const pyprojectPath = join(projectPath, 'pyproject.toml');
    const setupPyPath = join(projectPath, 'setup.py');
    if (await this.fileExists(pyprojectPath) || (await this.fileExists(setupPyPath))) {
      detected.language = 'python';

      // Check for test files
      const testPatterns = ['test_', '_test.py'];
      const testDirs = ['tests', 'test'];
      detected.hasTests =
        (await this.findFilesMatching(projectPath, testPatterns)) ||
        (await Promise.all(testDirs.map((dir) => this.directoryExists(join(projectPath, dir))))).some(
          (exists) => exists
        );

      // Generate commands
      if (detected.hasTests) {
        detected.testCommands.push('pytest');
      }
      detected.lintCommands.push('ruff check .');
      detected.lintCommands.push('mypy .');

      return detected;
    }

    // Check for Rust (Cargo.toml)
    const cargoTomlPath = join(projectPath, 'Cargo.toml');
    if (await this.fileExists(cargoTomlPath)) {
      detected.language = 'rust';

      // Check for test files
      // Rust tests can be in files ending with _test.rs or in a tests/ directory
      // Also check for #[cfg(test)] modules in lib.rs or main.rs
      const testPatterns = ['_test.rs', '.test.rs'];
      const testDirs = ['tests'];
      const hasTestFiles = await this.findFilesMatching(projectPath, testPatterns);
      const hasTestDir = (await Promise.all(testDirs.map((dir) => this.directoryExists(join(projectPath, dir))))).some(
        (exists) => exists
      );
      // Also check for test modules in source files
      let hasTestModule = false;
      try {
        const srcLibPath = join(projectPath, 'src', 'lib.rs');
        const srcMainPath = join(projectPath, 'src', 'main.rs');
        if (await this.fileExists(srcLibPath) || await this.fileExists(srcMainPath)) {
          // If lib.rs or main.rs exists, assume tests might be in #[cfg(test)] modules
          // This is a heuristic - actual test detection would require parsing
          hasTestModule = true;
        }
      } catch {
        // Ignore errors
      }
      detected.hasTests = hasTestFiles || hasTestDir || hasTestModule;

      // Generate commands
      if (detected.hasTests) {
        detected.testCommands.push('cargo test');
      }
      detected.lintCommands.push('cargo clippy');

      return detected;
    }

    // Check for Go (go.mod)
    const goModPath = join(projectPath, 'go.mod');
    if (await this.fileExists(goModPath)) {
      detected.language = 'go';

      // Check for test files
      const testPatterns = ['_test.go', '.test.go'];
      detected.hasTests = await this.findFilesMatching(projectPath, testPatterns);

      // Generate commands
      if (detected.hasTests) {
        detected.testCommands.push('go test ./...');
      }
      detected.lintCommands.push('go vet ./...');

      return detected;
    }

    // Check for Java Maven (pom.xml)
    const pomXmlPath = join(projectPath, 'pom.xml');
    if (await this.fileExists(pomXmlPath)) {
      detected.language = 'java';
      detected.framework = 'maven';

      // Check for test files
      const testDirPath = join(projectPath, 'src', 'test');
      detected.hasTests = await this.directoryExists(testDirPath);

      // Generate commands
      if (detected.hasTests) {
        detected.testCommands.push('mvn test');
      }

      return detected;
    }

    // Check for Java Gradle (build.gradle or build.gradle.kts)
    const buildGradlePath = join(projectPath, 'build.gradle');
    const buildGradleKtsPath = join(projectPath, 'build.gradle.kts');
    if ((await this.fileExists(buildGradlePath)) || (await this.fileExists(buildGradleKtsPath))) {
      detected.language = 'java';
      detected.framework = 'gradle';

      // Check for test files
      const testDirPath = join(projectPath, 'src', 'test');
      detected.hasTests = await this.directoryExists(testDirPath);

      // Generate commands
      if (detected.hasTests) {
        detected.testCommands.push('./gradlew test');
      }

      return detected;
    }

    // Unknown project type
    return detected;
  }

  /**
   * Generates a test plan from detected project information.
   */
  generateTestPlan(detected: DetectedProject, _subtask?: Subtask): TestPlan {
    const commands: TestCommand[] = [];

    // Convert test commands to TestCommand format
    for (const cmd of detected.testCommands) {
      const [command, ...args] = cmd.split(' ');
      commands.push({
        command,
        args: args.length > 0 ? args : undefined,
        workingDirectory: this.projectPath !== '.' ? this.projectPath : undefined,
      });
    }

    // Add lint commands
    for (const cmd of detected.lintCommands) {
      const [command, ...args] = cmd.split(' ');
      commands.push({
        command,
        args: args.length > 0 ? args : undefined,
        workingDirectory: this.projectPath !== '.' ? this.projectPath : undefined,
      });
    }

    // Warn if no tests detected
    if (!detected.hasTests && detected.language !== 'unknown') {
      console.warn(
        `[TestPlanGenerator] No test files detected for ${detected.language} project. Consider adding a test setup subtask.`
      );
    }

    return {
      commands,
      failFast: true,
    };
  }

  /**
   * Generates a subtask specification for test setup if no tests exist.
   */
  generateTestSetupSubtask(
    detected: DetectedProject,
    taskId: string,
    subtaskIndex: number
  ): SubtaskSpec | null {
    if (detected.hasTests || detected.language === 'unknown') {
      return null;
    }

    return {
      title: 'Set up test harness',
      description: `Create test infrastructure for ${detected.language} project`,
      acceptanceCriteria: ['Test framework configured', 'At least one passing test exists'],
    };
  }
}
