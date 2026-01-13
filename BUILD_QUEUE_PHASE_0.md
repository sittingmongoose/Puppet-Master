# RWM Puppet Master — BUILD_QUEUE_PHASE_0.md

> Phase 0: Foundation Setup  
> Tasks: 8  
> Focus: Project scaffolding, configuration system, core types

---

## Phase Overview

This phase establishes the project foundation:
- TypeScript project with build tooling
- ESLint + Prettier configuration
- Vitest test framework
- Directory structure per ARCHITECTURE.md
- Core type definitions

### Parallel Groups

| Group | Tasks | Can Start After |
|-------|-------|-----------------|
| Sequential Start | PH0-T01 | — |
| Parallel Group A | PH0-T02, PH0-T03 | PH0-T01 |
| Sequential | PH0-T04 | PH0-T01 |
| Parallel Group B | PH0-T05, PH0-T06, PH0-T07, PH0-T08 | PH0-T04 |

---

## PH0-T01: Initialize TypeScript Project

### Title
Initialize TypeScript project with package.json and tsconfig.json

### Goal
Create the foundational TypeScript project with ESM configuration and basic scripts.

### Depends on
- none

### Parallelizable with
- none (must complete first)

### Recommended model quality
Fast OK — standard project setup

### Read first
- PROMPT_NEXT.md: Phase 1 - Piece 1.1.1
- REQUIREMENTS.md: Section 1 (understand project scope)

### Files to create/modify
- `package.json`
- `tsconfig.json`
- `.gitignore`
- `.prettierrc`
- `src/index.ts`

### Implementation notes
- Use `"type": "module"` for ESM
- Target ES2022 with NodeNext module resolution
- All local imports must use `.js` extension (even for `.ts` files)
- This is scaffolding only; detailed config comes in subsequent tasks

### Acceptance criteria
- [ ] `package.json` exists with `"type": "module"`
- [ ] `tsconfig.json` exists with correct compiler options
- [ ] `.gitignore` excludes node_modules, dist, coverage
- [ ] `src/index.ts` exists (placeholder export)
- [ ] `npm install` completes without errors
- [ ] `npm run build` completes without errors

### Tests to run
```bash
npm install
npm run build
```

### Evidence to record
- none (scaffolding only)

### Cursor Agent Prompt
```
Initialize a TypeScript ESM project for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH0-T01)
- Do NOT modify any existing files outside scope
- Keep changes minimal and focused

CREATE these files:

1. package.json:
   - name: "puppet-master"
   - version: "0.1.0"
   - type: "module"
   - main: "dist/index.js"
   - scripts:
     - "build": "tsc"
     - "dev": "tsc --watch"
     - "typecheck": "tsc --noEmit"
   - devDependencies:
     - typescript: ^5.3.0
     - @types/node: ^20.0.0

2. tsconfig.json:
   - target: ES2022
   - module: NodeNext
   - moduleResolution: NodeNext
   - outDir: ./dist
   - rootDir: ./src
   - strict: true
   - esModuleInterop: true
   - skipLibCheck: true
   - declaration: true
   - sourceMap: true

3. .gitignore:
   - node_modules/
   - dist/
   - coverage/
   - npm-debug.log*
   - yarn-error.log*
   - .DS_Store
   # Note: Do NOT ignore .puppet-master/ - evidence logs are tracked!

4. .prettierrc:
   - semi: true
   - singleQuote: true
   - tabWidth: 2
   - trailingComma: "es5"
   - printWidth: 100

5. src/index.ts:
   - Export placeholder: export const VERSION = '0.1.0';

After creating files, run:
- npm install
- npm run build

Iterate until build passes with no errors.

Do NOT add ESLint, Vitest, or other tooling yet - those come in subsequent tasks.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: PASS
Date: 2026-01-12
Summary of changes: 
Created foundational TypeScript project with ESM configuration. All required files created and verified.

Files changed: 
- package.json (created)
- tsconfig.json (created)
- .gitignore (created)
- .prettierrc (created)
- src/index.ts (created)

Commands run + results: 
- npm install: SUCCESS - added 3 packages (typescript, @types/node, and dependencies), 0 vulnerabilities
- npm run build: SUCCESS - TypeScript compilation completed without errors
- Verified dist/ directory contains: index.js, index.d.ts, index.js.map

Follow-up verification:
- 2026-01-13: Expanded `.gitignore` to exclude local CLI agent state directories (`.codex/`, `.claude/`, `.cursor/`, `.npm/`, `.cache/`) to prevent committing credentials.

If FAIL - where stuck + exact error snippets + what remains:
N/A - Task completed successfully
```

---

## PH0-T02: ESLint Setup

### Title
Configure ESLint with TypeScript support

### Goal
Add ESLint with TypeScript parser and recommended rules.

### Depends on
- PH0-T01

### Parallelizable with
- PH0-T03

### Recommended model quality
Fast OK — standard config

### Read first
- PROMPT_NEXT.md: .eslintrc.json example

### Files to create/modify
- `.eslintrc.json`
- `package.json` (add devDependencies and lint script)

### Implementation notes
- Use @typescript-eslint/parser
- Extend eslint:recommended and plugin:@typescript-eslint/recommended
- Add `lint` script to package.json

### Acceptance criteria
- [ ] `.eslintrc.json` exists with TypeScript configuration
- [ ] ESLint dependencies installed
- [ ] `npm run lint` passes (no errors on src/index.ts)

### Tests to run
```bash
npm run lint
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Add ESLint with TypeScript support to the project.

CONSTRAINTS:
- Implement ONLY this task (PH0-T02)
- Do NOT modify files outside scope
- Keep changes minimal

1. Install dependencies:
   - eslint: ^8.50.0
   - @typescript-eslint/parser: ^7.0.0
   - @typescript-eslint/eslint-plugin: ^7.0.0

2. Create .eslintrc.json:
   {
     "root": true,
     "parser": "@typescript-eslint/parser",
     "plugins": ["@typescript-eslint"],
     "extends": [
       "eslint:recommended",
       "plugin:@typescript-eslint/recommended"
     ],
     "env": {
       "node": true,
       "es2022": true
     },
     "parserOptions": {
       "ecmaVersion": 2022,
       "sourceType": "module"
     },
     "rules": {
       "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
       "@typescript-eslint/explicit-function-return-type": "off"
     }
   }

3. Add to package.json scripts:
   "lint": "eslint src/"

After setup, run:
- npm run lint

Iterate until lint passes with no errors.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: PASS
Date: 2026-01-12
Summary of changes: 
- Installed ESLint dependencies (eslint, @typescript-eslint/parser, @typescript-eslint/eslint-plugin)
- Created .eslintrc.json with TypeScript parser and recommended rules configuration
- Added lint script to package.json
- Verified lint passes with no errors on src/index.ts

Files changed: 
- package.json (added devDependencies and lint script)
- .eslintrc.json (created new file)

Commands run + results: 
- npm install: Successfully installed 131 packages including ESLint dependencies
- npm run lint: PASS - No linting errors found

If FAIL - where stuck + exact error snippets + what remains:
N/A - Task completed successfully
```

---

## PH0-T03: Vitest Setup

### Title
Configure Vitest test framework

### Goal
Add Vitest with coverage support and TypeScript integration.

### Depends on
- PH0-T01

### Parallelizable with
- PH0-T02

### Recommended model quality
Fast OK — standard config

### Read first
- PROMPT_NEXT.md: vitest.config.ts example

### Files to create/modify
- `vitest.config.ts`
- `package.json` (add devDependencies and test scripts)
- `src/index.test.ts` (placeholder test)

### Implementation notes
- Vitest has native ESM and TypeScript support
- Use v8 coverage provider
- Create a placeholder test to verify setup

### Acceptance criteria
- [ ] `vitest.config.ts` exists
- [ ] Vitest dependencies installed
- [ ] `npm test` runs and passes
- [ ] `src/index.test.ts` has at least one passing test

### Tests to run
```bash
npm test
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Add Vitest test framework to the project.

CONSTRAINTS:
- Implement ONLY this task (PH0-T03)
- Do NOT modify files outside scope
- Keep changes minimal

1. Install dependencies:
   - vitest: ^2.0.0
   - @vitest/coverage-v8: ^2.0.0

2. Create vitest.config.ts:
   import { defineConfig } from 'vitest/config';
   
   export default defineConfig({
     test: {
       globals: true,
       environment: 'node',
       include: ['src/**/*.test.ts'],
       coverage: {
         provider: 'v8',
         reporter: ['text', 'json', 'html'],
       },
     },
   });

3. Add to package.json scripts:
   "test": "vitest run",
   "test:watch": "vitest",
   "test:coverage": "vitest run --coverage"

4. Create src/index.test.ts:
   import { describe, it, expect } from 'vitest';
   import { VERSION } from './index.js';
   
   describe('index', () => {
     it('should export VERSION', () => {
       expect(VERSION).toBe('0.1.0');
     });
   });

After setup, run:
- npm test

Iterate until test passes.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: PASS
Date: 2026-01-12
Summary of changes: 
- Installed Vitest dependencies (vitest ^2.0.0, @vitest/coverage-v8 ^2.0.0)
- Created vitest.config.ts with Node.js environment, globals enabled, and v8 coverage provider
- Added test scripts to package.json (test, test:watch, test:coverage)
- Created src/index.test.ts with placeholder test that verifies VERSION export
- Verified setup with npm test - all tests pass

Files changed: 
- package.json (added devDependencies and test scripts)
- vitest.config.ts (created new file)
- src/index.test.ts (created new file)

Commands run + results: 
- npm install: Successfully installed 88 packages including vitest and @vitest/coverage-v8
- npm test: PASS - 1 test file passed, 1 test passed (5ms duration)

If FAIL - where stuck + exact error snippets + what remains:
N/A - Task completed successfully
```

---

## PH0-T04: Directory Structure

### Title
Create directory structure per ARCHITECTURE.md

### Goal
Establish the source directory organization for all modules.

### Depends on
- PH0-T01

### Parallelizable with
- none (subsequent tasks depend on directories existing)

### Recommended model quality
Fast OK — creating directories

### Read first
- ARCHITECTURE.md: Section 2 (Module Breakdown)
- PROMPT_NEXT.md: Piece 1.1.4 directory structure

### Files to create/modify
- Create all directories under `src/`
- Create `.gitkeep` files in empty directories

### Implementation notes
- Follow exact structure from ARCHITECTURE.md
- Include cli, core, platforms, doctor, memory, verification, git, logging, types, utils
- Do NOT create implementation files yet (just directory structure)

### Acceptance criteria
- [ ] All directories exist: cli, core, platforms, doctor, memory, verification, git, logging, types, utils
- [ ] Each directory has a `.gitkeep` file
- [ ] `npm run build` still passes

### Tests to run
```bash
npm run build
ls -la src/
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Create the directory structure for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH0-T04)
- Do NOT create implementation files yet
- Keep changes minimal

Create these directories under src/:
- src/cli/
- src/core/
- src/platforms/
- src/doctor/
- src/memory/
- src/verification/
- src/git/
- src/logging/
- src/types/
- src/utils/

Add a .gitkeep file to each directory to ensure they're tracked.

After creating directories, run:
- npm run build
- ls -la src/

Verify build still passes and all directories exist.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: PASS
Date: 2026-01-12
Summary of changes: 
Created all 10 required directories under src/ with .gitkeep files to ensure git tracking. All directories verified to exist and TypeScript build still passes.

Files changed: 
- src/cli/.gitkeep (created)
- src/core/.gitkeep (created)
- src/platforms/.gitkeep (created)
- src/doctor/.gitkeep (created)
- src/memory/.gitkeep (created)
- src/verification/.gitkeep (created)
- src/git/.gitkeep (created)
- src/logging/.gitkeep (created)
- src/types/.gitkeep (created)
- src/utils/.gitkeep (created)

Commands run + results: 
- mkdir -p src/{cli,core,platforms,doctor,memory,verification,git,logging,types,utils}
  → Success: All 10 directories created
- touch src/*/.gitkeep (10 files)
  → Success: All .gitkeep files created
- ls -la src/
  → Success: Verified all 10 directories exist (cli, core, doctor, git, logging, memory, platforms, types, utils, verification)
- ls -la src/*/.gitkeep
  → Success: Verified all 10 .gitkeep files exist
- npm run build
  → Success: TypeScript compilation completed without errors

If FAIL - where stuck + exact error snippets + what remains:
N/A - Task completed successfully
```

---

## PH0-T05: Config Types

### Title
Define configuration type schema

### Goal
Create TypeScript types for all configuration options per STATE_FILES.md.

### Depends on
- PH0-T04

### Parallelizable with
- PH0-T06, PH0-T07, PH0-T08

### Recommended model quality
Medium OK — requires careful type definition

### Read first
- STATE_FILES.md: Section 3.4 (config.yaml schema)
- REQUIREMENTS.md: Section 17 (Configuration File Schema)
- REQUIREMENTS.md: Section 23 (Quota/Cooldown - budget config)

### Files to create/modify
- `src/types/config.ts`
- `src/types/index.ts` (re-export)

### Implementation notes
- Include all config sections: project, tiers, branching, verification, memory, logging, cli_paths, budgets
- Use strict typing with discriminated unions where appropriate
- Include budget configuration per REQUIREMENTS.md Section 23

### Acceptance criteria
- [x] `src/types/config.ts` defines PuppetMasterConfig interface
- [x] All config sections from STATE_FILES.md are represented
- [x] Budget configuration fields included
- [x] Types re-exported from `src/types/index.ts`
- [x] `npm run typecheck` passes
- [x] `npm run build` passes

### Tests to run
```bash
npm run typecheck
npm run build
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Create configuration types for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH0-T05)
- Do NOT create ConfigManager implementation yet
- Reference canonical docs for schema

Read first:
- STATE_FILES.md Section 3.4 for config.yaml schema
- REQUIREMENTS.md Section 17 for full schema
- REQUIREMENTS.md Section 23 for budget configuration

Create src/types/config.ts with:

1. Platform type: 'cursor' | 'codex' | 'claude'

2. TierConfig interface:
   - platform: Platform
   - model: string
   - selfFix: boolean
   - maxIterations: number
   - escalation: 'phase' | 'task' | 'subtask' | null

3. BranchingConfig interface:
   - baseBranch: string
   - namingPattern: string
   - granularity: 'single' | 'per-phase' | 'per-task'
   - pushPolicy: 'per-iteration' | 'per-subtask' | 'per-task' | 'per-phase'
   - mergePolicy: 'merge' | 'squash' | 'rebase'
   - autoPr: boolean

4. VerificationConfig interface:
   - browserAdapter: string
   - screenshotOnFailure: boolean
   - evidenceDirectory: string

5. MemoryConfig interface:
   - progressFile: string
   - agentsFile: string
   - prdFile: string
   - multiLevelAgents: boolean
   - agentsEnforcement: AgentsEnforcementConfig

6. BudgetConfig interface (per REQUIREMENTS.md 23.3):
   - maxCallsPerRun: number | 'unlimited'
   - maxCallsPerHour: number | 'unlimited'
   - maxCallsPerDay: number | 'unlimited'
   - cooldownHours?: number
   - fallbackPlatform: Platform | null

7. PlatformBudgets interface:
   - claude: BudgetConfig
   - codex: BudgetConfig
   - cursor: BudgetConfig

8. BudgetEnforcementConfig interface:
   - onLimitReached: 'fallback' | 'pause' | 'queue'
   - warnAtPercentage: number
   - notifyOnFallback: boolean

9. LoggingConfig interface:
   - level: 'debug' | 'info' | 'warn' | 'error'
   - retentionDays: number

10. CliPathsConfig interface:
    - cursor: string
    - codex: string
    - claude: string

11. PuppetMasterConfig interface combining all above:
    - project: { name: string; workingDirectory: string }
    - tiers: { phase: TierConfig; task: TierConfig; subtask: TierConfig; iteration: TierConfig }
    - branching: BranchingConfig
    - verification: VerificationConfig
    - memory: MemoryConfig
    - budgets: PlatformBudgets
    - budgetEnforcement: BudgetEnforcementConfig
    - logging: LoggingConfig
    - cliPaths: CliPathsConfig

Update src/types/index.ts to re-export all types.

After creating types, run:
- npm run typecheck
- npm run build

Iterate until both pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: PASS
Date: 2026-01-11
Summary of changes: 
Created comprehensive TypeScript type definitions for all configuration options in the RWM Puppet Master system. All types are properly defined with strict typing, JSDoc comments explaining YAML field mappings, and correct ESM export patterns.

Files changed: 
- src/types/config.ts (NEW) - Contains all 14 type definitions:
  - Platform (type alias - canonical definition)
  - ProjectConfig, CliPathsConfig, LoggingConfig (simple configs)
  - TierConfig (depends on Platform)
  - BranchingConfig, VerificationConfig
  - AgentsEnforcementConfig
  - MemoryConfig (depends on AgentsEnforcementConfig)
  - BudgetConfig (depends on Platform)
  - PlatformBudgets (depends on BudgetConfig)
  - BudgetEnforcementConfig
  - TiersConfig
  - PuppetMasterConfig (main interface combining all sections)
- src/types/index.ts (MODIFIED) - Added barrel exports for all config types using type-only exports

Commands run + results: 
- npm run typecheck: PASSED (no type errors)
- npm run build: PASSED (compiled successfully to dist/types/)
- Linter check: PASSED (no linting errors)

All acceptance criteria met:
- ✅ src/types/config.ts defines PuppetMasterConfig interface
- ✅ All config sections from STATE_FILES.md are represented
- ✅ Budget configuration fields included (per REQUIREMENTS.md Section 23)
- ✅ Types re-exported from src/types/index.ts
- ✅ npm run typecheck passes
- ✅ npm run build passes
```

---

## PH0-T06: ConfigManager Class

### Title
Implement ConfigManager for loading and validating configuration

### Goal
Create ConfigManager class that loads YAML config files and validates them.

### Depends on
- PH0-T04
- PH0-T05

### Parallelizable with
- PH0-T07, PH0-T08 (after PH0-T05 complete)

### Recommended model quality
Medium OK — standard implementation pattern

### Read first
- STATE_FILES.md: Section 3.4 (config location)
- REQUIREMENTS.md: Section 17 (full schema)

### Files to create/modify
- `src/config/config-manager.ts`
- `src/config/default-config.ts`
- `src/config/config-schema.ts` (validation)
- `src/config/index.ts` (barrel export)
- `package.json` (add js-yaml dependency)
- `src/config/config-manager.test.ts`

### Implementation notes
- Use js-yaml for YAML parsing
- Provide getDefaultConfig() function
- Validate config against schema
- Support CLI flag overrides (store as merge function, not CLI parsing yet)

### Acceptance criteria
- [x] ConfigManager can load YAML config files
- [x] ConfigManager validates config and throws on invalid
- [x] Default config provided matches schema
- [x] `npm run typecheck` passes
- [x] `npm test` passes with ConfigManager tests

### Tests to run
```bash
npm run typecheck
npm test
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement ConfigManager for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH0-T06)
- Use types from src/types/config.ts (PH0-T05)
- Do NOT implement CLI parsing yet

Install dependency:
- js-yaml: ^4.1.0
- @types/js-yaml: ^4.0.0 (devDependency)

Create src/config/config-manager.ts:

1. ConfigManager class:
   - constructor(configPath?: string)
   - async load(): Promise<PuppetMasterConfig>
   - validate(config: unknown): PuppetMasterConfig
   - merge(base: PuppetMasterConfig, overrides: Partial<PuppetMasterConfig>): PuppetMasterConfig
   - getConfigPath(): string

2. Helper functions:
   - resolveConfigPath(providedPath?: string): string
     - Check provided path
     - Check .puppet-master/config.yaml
     - Check puppet-master.yaml in cwd
   - loadYamlFile(path: string): unknown

Create src/config/default-config.ts:
- Export getDefaultConfig(): PuppetMasterConfig
- Provide sensible defaults per REQUIREMENTS.md Section 17

Create src/config/config-schema.ts:
- Export validateConfig(config: unknown): asserts config is PuppetMasterConfig
- Throw descriptive errors for invalid configs

Create src/config/index.ts:
- Re-export ConfigManager, getDefaultConfig, validateConfig

Create src/config/config-manager.test.ts:
- Test loading valid YAML
- Test validation catches invalid config
- Test default config is valid
- Test merge function

After implementation, run:
- npm run typecheck
- npm test

Iterate until all tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: PASS
Date: 2026-01-12
Summary of changes: 
Implemented ConfigManager class with YAML file loading, snake_case to camelCase conversion, validation, merging, and path resolution. All acceptance criteria met with comprehensive test coverage.

Files changed: 
- package.json (MODIFIED) - Added js-yaml: ^4.1.0 and @types/js-yaml: ^4.0.0 dependencies
- src/config/default-config.ts (NEW) - Default configuration matching REQUIREMENTS.md Section 17 and Section 23.3
- src/config/config-schema.ts (NEW) - Comprehensive validation logic with ConfigValidationError class and detailed error messages
- src/config/config-manager.ts (NEW) - ConfigManager class with load(), validate(), merge() methods, path resolution helpers, and YAML field mapping (snake_case to camelCase)
- src/config/index.ts (NEW) - Barrel exports for config module (ConfigManager, getDefaultConfig, validateConfig, and all config types)
- src/config/config-manager.test.ts (NEW) - Comprehensive test suite with 26 tests covering all functionality

Commands run + results: 
- npm install: PASSED (js-yaml dependencies installed successfully)
- npm run typecheck: PASSED (no type errors)
- npm test: PASSED (27 tests passed, including 26 ConfigManager tests and 1 index test)

All acceptance criteria met:
- ✅ ConfigManager can load YAML config files
- ✅ ConfigManager validates config and throws on invalid
- ✅ Default config provided matches schema
- ✅ npm run typecheck passes
- ✅ npm test passes with ConfigManager tests

Key implementation details:
- YAML snake_case to camelCase conversion implemented (e.g., working_directory -> workingDirectory)
- Path resolution order: provided path -> .puppet-master/config.yaml -> puppet-master.yaml in cwd
- Deep merge support for nested objects (budgets, memory.agentsEnforcement, etc.)
- Descriptive validation errors with path information
- Default config returned when config file doesn't exist
- All ESM import patterns followed (.js extensions, type-only exports)

Follow-up verification (2026-01-13):
- Implemented file-existence based resolution for `.puppet-master/config.yaml` vs `puppet-master.yaml`
- Added YAML `max_attempts` → TypeScript `maxIterations` mapping + tests
- Verified `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` all pass
```

---

## PH0-T07: Platform Types

### Title
Define platform-related types

### Goal
Create TypeScript types for platform runners, execution requests/results, and capabilities.

### Depends on
- PH0-T04
- PH0-T05

### Parallelizable with
- PH0-T06, PH0-T08

### Recommended model quality
Medium OK — interface definitions

### Read first
- ARCHITECTURE.md: Section 4 (Platform Abstraction Layer)
- REQUIREMENTS.md: Section 22 (CLI Capability Discovery)
- REQUIREMENTS.md: Section 26 (Fresh Agent Enforcement + Runner Contract)

### Files to create/modify
- `src/types/platforms.ts`
- `src/types/index.ts` (update re-exports)

### Implementation notes
- Define Platform union type
- Define ExecutionRequest, ExecutionResult, ExecutionEvent
- Define PlatformCapabilities for capability discovery
- Define ProcessInfo for fresh spawn tracking
- Include all fields from ARCHITECTURE.md Section 4

### Acceptance criteria
- [x] `src/types/platforms.ts` defines Platform type
- [x] ExecutionRequest/Result/Event interfaces defined
- [x] PlatformCapabilities interface matches REQUIREMENTS.md 22.4
- [x] PlatformRunnerContract interface defined per REQUIREMENTS.md 26.2
- [x] Types re-exported from index.ts
- [x] `npm run typecheck` passes

### Tests to run
```bash
npm run typecheck
npm run build
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Create platform-related types for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH0-T07)
- Reference canonical docs for type definitions
- Do NOT implement runner classes yet

Read first:
- ARCHITECTURE.md Section 4 (Platform Abstraction Layer)
- REQUIREMENTS.md Section 22 (Capability Discovery)
- REQUIREMENTS.md Section 26 (Runner Contract)

Create src/types/platforms.ts with:

1. Platform type: 'cursor' | 'codex' | 'claude'

2. ExecutionRequest interface:
   - prompt: string
   - model?: string
   - workingDirectory: string
   - timeout?: number
   - maxTurns?: number
   - contextFiles?: string[]
   - systemPrompt?: string
   - nonInteractive: boolean

3. ExecutionResult interface:
   - success: boolean
   - output: string
   - exitCode: number
   - duration: number
   - tokensUsed?: number
   - sessionId?: string
   - processId: number
   - error?: string

4. ExecutionEvent interface:
   - type: 'started' | 'output' | 'tool_use' | 'error' | 'complete'
   - timestamp: number
   - data: unknown

5. ProcessInfo interface:
   - pid: number
   - platform: Platform
   - startedAt: string
   - status: 'running' | 'completed' | 'killed'

6. SessionConfig interface:
   - platform: Platform
   - workingDirectory: string
   - model?: string
   - timeout?: number

7. Session interface:
   - id: string
   - platform: Platform
   - createdAt: string
   - status: 'active' | 'completed' | 'expired'

8. PlatformCapabilities interface (per REQUIREMENTS.md 22.4):
   - platform: Platform
   - version: string
   - discoveredAt: string
   - capabilities: {
       nonInteractive: boolean
       modelSelection: boolean
       streaming: 'full' | 'partial' | 'none'
       sessionResume: boolean
       mcpSupport: boolean
     }
   - availableModels: string[]
   - smokeTest: SmokeTestResult | null

9. SmokeTestResult interface:
   - passed: boolean
   - output: string
   - durationMs: number
   - tests: { name: string; passed: boolean; error?: string }[]

10. PlatformRunnerContract interface (per REQUIREMENTS.md 26.2):
    - readonly platform: Platform
    - readonly sessionReuseAllowed: boolean
    - readonly allowedContextFiles: string[]
    - readonly defaultTimeout: number
    - readonly hardTimeout: number
    - spawnFreshProcess(request: ExecutionRequest): Promise<RunningProcess>
    - prepareWorkingDirectory(path: string): Promise<void>
    - cleanupAfterExecution(pid: number): Promise<void>
    - terminateProcess(pid: number): Promise<void>
    - forceKillProcess(pid: number): Promise<void>
    - captureStdout(pid: number): AsyncIterable<string>
    - captureStderr(pid: number): AsyncIterable<string>
    - getTranscript(pid: number): Promise<string>

11. RunningProcess interface:
    - pid: number
    - platform: Platform
    - startedAt: string
    - stdin: NodeJS.WritableStream
    - stdout: NodeJS.ReadableStream
    - stderr: NodeJS.ReadableStream

Update src/types/index.ts to re-export all types.

After creating types, run:
- npm run typecheck
- npm run build

Iterate until both pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: PASS
Date: 2026-01-12
Summary of changes: Created src/types/platforms.ts with all platform-related type definitions (Platform re-export, ExecutionRequest, ExecutionResult, ExecutionEvent, ProcessInfo, SessionConfig, Session, PlatformCapabilities, SmokeTestResult, PlatformRunnerContract, RunningProcess). Updated src/types/index.ts to re-export all new types using type-only exports.

Files changed: 
- src/types/platforms.ts (created)
- src/types/index.ts (updated)

Commands run + results: 
- npm run typecheck: PASS (no errors)
- npm run build: PASS (compilation successful)

If FAIL - where stuck + exact error snippets + what remains:
N/A - task completed successfully
```

---

## PH0-T08: State Types

### Title
Define state machine types and events

### Goal
Create TypeScript types for orchestrator state, tier state, and state transitions.

### Depends on
- PH0-T04

### Parallelizable with
- PH0-T05, PH0-T06, PH0-T07

### Recommended model quality
HQ required — complex state modeling

### Read first
- ARCHITECTURE.md: Section 3 (State Machine Design)
- ARCHITECTURE.md: Section 5 (Tier State Manager)
- REQUIREMENTS.md: Section 6 (Four-Tier Orchestration)

### Files to create/modify
- `src/types/state.ts`
- `src/types/events.ts`
- `src/types/tiers.ts`
- `src/types/index.ts` (update re-exports)

### Implementation notes
- Define OrchestratorState enum/union
- Define TierState enum/union
- Define all state transition events
- Define TierNode structure for hierarchy

### Acceptance criteria
- [ ] OrchestratorState type defined (IDLE, PLANNING, EXECUTING, PAUSED, ERROR, COMPLETE)
- [ ] TierState type defined (PENDING, PLANNING, RUNNING, GATING, PASSED, FAILED, ESCALATED, RETRYING)
- [ ] State transition events defined
- [ ] TierNode interface defined for Phase/Task/Subtask/Iteration hierarchy
- [ ] `npm run typecheck` passes

### Tests to run
```bash
npm run typecheck
npm run build
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Create state machine types for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH0-T08)
- Reference ARCHITECTURE.md for state diagrams
- Do NOT implement state machine logic yet

Read first:
- ARCHITECTURE.md Section 3 (State Machine Design)
- ARCHITECTURE.md Section 5 (Tier State Manager)
- REQUIREMENTS.md Section 6 (Four-Tier Orchestration)

Create src/types/state.ts:

1. OrchestratorState type:
   'idle' | 'planning' | 'executing' | 'paused' | 'error' | 'complete'

2. TierState type:
   'pending' | 'planning' | 'running' | 'gating' | 'passed' | 'failed' | 'escalated' | 'retrying'

3. TierType type:
   'phase' | 'task' | 'subtask' | 'iteration'

4. OrchestratorContext interface:
   - state: OrchestratorState
   - currentPhaseId: string | null
   - currentTaskId: string | null
   - currentSubtaskId: string | null
   - currentIterationId: string | null
   - errorMessage?: string
   - pauseReason?: string

Create src/types/events.ts:

1. OrchestratorEvent type (discriminated union):
   - { type: 'INIT' }
   - { type: 'START' }
   - { type: 'PAUSE'; reason?: string }
   - { type: 'RESUME' }
   - { type: 'STOP' }
   - { type: 'ERROR'; error: string }
   - { type: 'COMPLETE' }
   - { type: 'REPLAN'; scope?: string }

2. TierEvent type (discriminated union):
   - { type: 'TIER_SELECTED' }
   - { type: 'PLAN_APPROVED' }
   - { type: 'ITERATION_COMPLETE'; success: boolean }
   - { type: 'ITERATION_FAILED'; error: string }
   - { type: 'MAX_ATTEMPTS' }
   - { type: 'GATE_PASSED' }
   - { type: 'GATE_FAILED_MINOR' }
   - { type: 'GATE_FAILED_MAJOR' }
   - { type: 'RETRY' }
   - { type: 'NEW_ATTEMPT' }

3. StateTransition interface:
   - from: OrchestratorState | TierState
   - event: OrchestratorEvent | TierEvent
   - to: OrchestratorState | TierState
   - action?: string

Create src/types/tiers.ts:

1. Criterion interface:
   - id: string
   - description: string
   - type: 'regex' | 'file_exists' | 'browser_verify' | 'command' | 'manual' | 'ai'
   - target: string
   - options?: Record<string, unknown>
   - passed?: boolean

2. TestPlan interface:
   - commands: TestCommand[]
   - failFast: boolean

3. TestCommand interface:
   - command: string
   - args?: string[]
   - workingDirectory?: string
   - timeout?: number

4. TierPlan interface:
   - id: string
   - title: string
   - description: string
   - approach?: string[]
   - dependencies?: string[]

5. Evidence interface:
   - type: 'log' | 'screenshot' | 'file' | 'metric'
   - path: string
   - summary: string
   - timestamp: string

6. TierNode interface:
   - id: string
   - type: TierType
   - state: TierState
   - parentId: string | null
   - childIds: string[]
   - plan: TierPlan
   - acceptanceCriteria: Criterion[]
   - testPlan: TestPlan
   - evidence: Evidence[]
   - iterations: number
   - maxIterations: number
   - createdAt: string
   - updatedAt: string

7. AdvancementResult type:
   - { action: 'continue'; next: TierNode }
   - { action: 'advance_task'; next: TierNode }
   - { action: 'advance_phase'; next: TierNode }
   - { action: 'complete' }
   - { action: 'task_gate_failed'; gate: GateResult }
   - { action: 'phase_gate_failed'; gate: GateResult }

8. GateResult interface:
   - passed: boolean
   - report: GateReport
   - failureReason?: string

9. GateReport interface:
   - gateId: string
   - timestamp: string
   - verifiersRun: VerifierResult[]
   - overallPassed: boolean

10. VerifierResult interface:
    - type: string
    - target: string
    - passed: boolean
    - evidencePath?: string
    - summary: string
    - error?: string
    - durationMs: number

Update src/types/index.ts to re-export all types.

After creating types, run:
- npm run typecheck
- npm run build

Iterate until both pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: PASS
Date: 2026-01-12
Summary of changes: 
Created three new type definition files for state machines, events, and tier hierarchy:
- src/types/state.ts: OrchestratorState, TierState, TierType types and OrchestratorContext interface
- src/types/events.ts: OrchestratorEvent and TierEvent discriminated unions, StateTransition interface
- src/types/tiers.ts: Complete tier hierarchy types including Criterion, TestPlan, TierPlan, Evidence, TierNode, AdvancementResult, GateResult, GateReport, VerifierResult
Updated src/types/index.ts to re-export all new types using export type pattern

Files changed: 
- src/types/state.ts (created)
- src/types/events.ts (created)
- src/types/tiers.ts (created)
- src/types/index.ts (updated)

Commands run + results: 
- npm run typecheck: PASS (tsc --noEmit completed successfully)
- npm run build: PASS (tsc completed successfully)
- No linter errors

All acceptance criteria met:
- OrchestratorState type defined (idle, planning, executing, paused, error, complete)
- TierState type defined (pending, planning, running, gating, passed, failed, escalated, retrying)
- State transition events defined (OrchestratorEvent and TierEvent discriminated unions)
- TierNode interface defined for Phase/Task/Subtask/Iteration hierarchy
- npm run typecheck passes
```

---

## Phase 0 Completion Checklist

After completing all Phase 0 tasks:

- [x] `npm run build` passes
- [x] `npm run typecheck` passes
- [x] `npm run lint` passes
- [x] `npm test` passes
- [x] All directories exist under src/
- [x] All type files export correctly
- [x] ConfigManager can load and validate config

### Phase 0 Verification Log
```
Status: PASS
Date: 2026-01-13
Summary of changes:
- Fixed config path resolution + YAML `max_attempts` mapping; updated tests
- Hardened `.gitignore` to prevent committing local CLI agent state/credentials

Files changed:
- .gitignore
- src/config/config-manager.ts
- src/config/config-manager.test.ts
- BUILD_QUEUE_PHASE_0.md

Commands run + results:
- npm run lint: PASS
- npm run typecheck: PASS
- npm test: PASS (27 tests)
- npm run build: PASS
```

### Phase 0 Stop Point Commit

```bash
git add .
git commit -m "ralph: phase-0 foundation complete"
```

---

*End of BUILD_QUEUE_PHASE_0.md*
