# PROMPT_NEXT.md — Implementation Kickoff

> **Purpose:** Bootstrap RWM Puppet Master implementation starting with foundational infrastructure  
> **Scope:** Doctor + Capability Discovery + Runner Contracts + Evidence/Log Plumbing  
> **Constraint:** CLI-only, NO APIs, fresh agent per iteration enforced

---

## Prerequisites

Before starting, ensure:
- Node.js 20+ installed
- TypeScript 5.x available
- Git configured with credentials
- At least ONE of: `cursor-agent`, `codex`, or `claude` CLI installed (for testing)

---

## Phase 1: Project Scaffolding

### Piece 1.1.1: Initialize TypeScript Project

**Files to create:**
```
puppet-master/
├── package.json
├── tsconfig.json
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── vitest.config.ts
└── src/
    └── index.ts
```

**Commands:**
```
mkdir puppet-master && cd puppet-master
npm init -y
npm install typescript @types/node --save-dev
npx tsc --init
```

> **ADDENDUM (Fix 1): Complete Dependency Installation**
> 
> The above commands are the minimal bootstrap. After running them, you MUST also install
> the test runner, linter, and formatter dependencies to match the package.json scripts:
> 
> ```
> # Install Vitest (ESM-native test runner - see Fix 2)
> npm install vitest @vitest/coverage-v8 --save-dev
> 
> # Install ESLint + TypeScript support
> npm install eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin --save-dev
> 
> # Install Prettier
> npm install prettier --save-dev
> ```
> 
> Full single-line install:
> ```bash
> npm install typescript @types/node vitest @vitest/coverage-v8 eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier --save-dev
> ```

**package.json (minimal):**
```json
{
  "name": "puppet-master",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write src/"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "@types/node": "^20.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "eslint": "^8.50.0",
    "prettier": "^3.0.0",
    "typescript": "^5.3.0",
    "vitest": "^2.0.0"
  }
}
```

> **ADDENDUM (Fix 2): ESM + Vitest Decision**
> 
> **Decision:** We use Vitest instead of Jest because:
> - Vitest has native ESM support (no extra configuration needed)
> - Vitest natively understands TypeScript (no ts-jest required)
> - Vitest is faster and has Jest-compatible API
> 
> The project uses `"type": "module"` for native ESM. This requires:
> - All local imports MUST use `.js` extension (even for `.ts` files)
> - Example: `import { Platform } from './config.js'` (NOT `./config`)
> 
> **Alternative (if Jest is required):**
> If you must use Jest, remove `"type": "module"` from package.json and use CommonJS:
> ```json
> {
>   "type": "commonjs",
>   "scripts": { "test": "jest" },
>   "devDependencies": {
>     "jest": "^29.7.0",
>     "ts-jest": "^29.1.0",
>     "@types/jest": "^29.5.0"
>   }
> }
> ```
> With jest.config.js:
> ```javascript
> module.exports = {
>   preset: 'ts-jest',
>   testEnvironment: 'node',
>   roots: ['<rootDir>/src'],
>   testMatch: ['**/*.test.ts'],
> };
> ```

**vitest.config.ts:**
```typescript
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
```

**tsconfig.json (key settings):**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**.eslintrc.json:**
```json
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
```

**.prettierrc:**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**.gitignore:**
```
node_modules/
dist/
coverage/
.DS_Store

# Specific log patterns (NOT blanket *.log)
npm-debug.log*
yarn-error.log*
```

> **IMPORTANT (per STATE_FILES.md):**
> - Do NOT ignore `.puppet-master/` — it contains tracked state and evidence files
> - Do NOT blanket-ignore `*.log` — logs under `.puppet-master/` are evidence

**Acceptance Criteria:**
- [ ] `npm run build` completes without errors
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes (with placeholder test)

**Tests:** `npm run build && echo "BUILD OK"`

**🛑 STOP POINT:** Do not proceed until build passes. Commit: `ralph: 1.1.1 project scaffolding`

---

### Piece 1.1.4: Create Directory Structure

**Files to create:**
```
src/
├── cli/                    # CLI command handlers
├── core/                   # Orchestrator, state machine
│   ├── orchestrator.ts
│   └── state-machine.ts
├── platforms/              # Platform runners
│   ├── base-runner.ts
│   ├── cursor-runner.ts
│   ├── codex-runner.ts
│   └── claude-runner.ts
├── doctor/                 # Doctor + capability discovery
│   ├── doctor.ts
│   ├── capability-discovery.ts
│   └── smoke-tests.ts
├── memory/                 # State file managers
│   ├── progress-manager.ts
│   ├── agents-manager.ts
│   └── prd-manager.ts
├── verification/           # Verifiers + evidence
│   ├── test-runner.ts
│   ├── verifier-registry.ts
│   └── evidence-collector.tsts
├── git/                    # Git integration
│   └── git-manager.ts
├── logging/                # Logging infrastructure
│   ├── activity-logger.ts
│   ├── iteration-logger.ts
│   └── event-stream.ts
├── types/                  # Shared types
│   ├── index.ts
│   ├── config.ts
│   ├── platforms.ts
│   ├── state.ts
│   ├── events.ts
│   └── evidence.ts
└── utils/                  # Utilities
    ├── file-lock.ts
    └── process-spawn.ts
```

**Commands:**
```bash
mkdir -p src/{cli,core,platforms,doctor,memory,verification,git,logging,types,utils}
touch src/cli/.gitkeep
touch src/core/{orchestrator.ts,state-machine.ts}
touch src/platforms/{base-runner.ts,cursor-runner.ts,codex-runner.ts,claude-runner.ts}
touch src/doctor/{doctor.ts,capability-discovery.ts,smoke-tests.ts}
touch src/memory/{progress-manager.ts,agents-manager.ts,prd-manager.ts}
touch src/verification/{test-runner.ts,verifier-registry.ts,evidence-collector.tsts}
touch src/git/git-manager.ts
touch src/logging/{activity-logger.ts,iteration-logger.ts,event-stream.ts}
touch src/types/{index.ts,config.ts,platforms.ts,state.ts,events.ts,evidence.ts}
touch src/utils/{file-lock.ts,process-spawn.ts}
```

**Acceptance Criteria:**
- [ ] All directories exist
- [ ] All placeholder files created
- [ ] `npm run build` still passes (empty files OK)

**Tests:** `find src -type f -name "*.ts" | wc -l` should return 20+

**🛑 STOP POINT:** Commit: `ralph: 1.1.4 directory structure`

---

## Phase 2: Core Types

### Piece 1.2.1: Define Config Schema

**File:** `src/types/config.ts`

```typescript
// src/types/config.ts

/**
 * Platform type - the canonical definition.
 * ALL other files should import Platform from here or from the index barrel.
 */
export type Platform = 'cursor' | 'codex' | 'claude';

export interface TierConfig {
  platform: Platform;
  model: string;
  selfFix: boolean;
  maxIterations: number;
  escalation: 'phase' | 'task' | 'subtask' | null;
}

export interface BudgetConfig {
  maxCallsPerRun: number | 'unlimited';
  maxCallsPerHour: number | 'unlimited';
  maxCallsPerDay: number | 'unlimited';
  cooldownHours?: number;
  fallbackPlatform: Platform | null;
}

export interface BranchConfig {
  baseBranch: string;
  namingPattern: string;
  granularity: 'single' | 'per-phase' | 'per-task';
  pushPolicy: 'per-iteration' | 'per-subtask' | 'per-task' | 'per-phase';
  mergePolicy: 'merge' | 'squash' | 'rebase';
  autoPr: boolean;
}

export interface PuppetMasterConfig {
  project: {
    name: string;
    workingDirectory: string;
  };
  
  tiers: {
    phase: TierConfig;
    task: TierConfig;
    subtask: TierConfig;
    iteration: TierConfig;
  };
  
  budgets: {
    claude: BudgetConfig;
    codex: BudgetConfig;
    cursor: BudgetConfig;
  };
  
  budgetEnforcement: {
    onLimitReached: 'fallback' | 'pause' | 'queue';
    warnAtPercentage: number;
    notifyOnFallback: boolean;
  };
  
  branching: BranchConfig;
  
  memory: {
    progressFile: string;
    agentsFile: string;
    prdFile: string;
    multiLevelAgents: boolean;
  };
  
  execution: {
    stallDetection: {
      noOutputTimeout: number;
      identicalOutputThreshold: number;
      hardTimeout: number;
    };
    onStall: 'kill_and_retry' | 'escalate' | 'pause';
    maxStallRetries: number;
  };
  
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    retentionDays: number;
  };
  
  cliPaths: {
    cursor: string;
    codex: string;
    claude: string;
  };
}

export const DEFAULT_CONFIG: PuppetMasterConfig = {
  project: {
    name: 'Untitled',
    workingDirectory: '.',
  },
  tiers: {
    phase: { platform: 'claude', model: 'opus-4.5', selfFix: false, maxIterations: 3, escalation: null },
    task: { platform: 'codex', model: 'gpt-5.2-high', selfFix: true, maxIterations: 5, escalation: 'phase' },
    subtask: { platform: 'cursor', model: 'sonnet-4.5-thinking', selfFix: true, maxIterations: 10, escalation: 'task' },
    iteration: { platform: 'cursor', model: 'auto', selfFix: false, maxIterations: 3, escalation: 'subtask' },
  },
  budgets: {
    claude: { maxCallsPerRun: 5, maxCallsPerHour: 3, maxCallsPerDay: 10, cooldownHours: 5, fallbackPlatform: 'codex' },
    codex: { maxCallsPerRun: 50, maxCallsPerHour: 20, maxCallsPerDay: 100, fallbackPlatform: 'cursor' },
    cursor: { maxCallsPerRun: 'unlimited', maxCallsPerHour: 'unlimited', maxCallsPerDay: 'unlimited', fallbackPlatform: null },
  },
  budgetEnforcement: {
    onLimitReached: 'fallback',
    warnAtPercentage: 80,
    notifyOnFallback: true,
  },
  branching: {
    baseBranch: 'main',
    namingPattern: 'ralph/{phase}/{task}',
    granularity: 'per-task',
    pushPolicy: 'per-subtask',
    mergePolicy: 'squash',
    autoPr: true,
  },
  memory: {
    progressFile: 'progress.txt',
    agentsFile: 'AGENTS.md',
    prdFile: '.puppet-master/prd.json',
    multiLevelAgents: true,
  },
  execution: {
    stallDetection: {
      noOutputTimeout: 300,
      identicalOutputThreshold: 3,
      hardTimeout: 1800,
    },
    onStall: 'kill_and_retry',
    maxStallRetries: 2,
  },
  logging: {
    level: 'info',
    retentionDays: 30,
  },
  cliPaths: {
    cursor: 'cursor-agent',
    codex: 'codex',
    claude: 'claude',
  },
};

/**
 * ADDENDUM (Fix 5): Compute required platforms from tier config.
 * 
 * The orchestrator must NOT assume all three platforms are needed.
 * This function extracts the unique platforms actually configured.
 */
export function getRequiredPlatforms(config: PuppetMasterConfig): Platform[] {
  const platforms = new Set<Platform>();
  platforms.add(config.tiers.phase.platform);
  platforms.add(config.tiers.task.platform);
  platforms.add(config.tiers.subtask.platform);
  platforms.add(config.tiers.iteration.platform);
  return Array.from(platforms);
}

/**
 * Check if a specific platform is required by the current config.
 */
export function isPlatformRequired(config: PuppetMasterConfig, platform: Platform): boolean {
  return getRequiredPlatforms(config).includes(platform);
}
```

> **ADDENDUM (Fix 3): Import Path Standardization**
> 
> **RULE:** `Platform` type is defined in `src/types/config.ts` as the CANONICAL source.
> 
> All files MUST import Platform in one of two ways:
> 1. Direct: `import { Platform } from './config.js'` (from within types/)
> 2. Via barrel: `import { Platform } from '../types/index.js'` (from other directories)
> 
> The `src/types/platforms.ts` file re-exports Platform for convenience but does NOT define it.

**Acceptance Criteria:**
- [ ] Types compile without errors
- [ ] DEFAULT_CONFIG satisfies PuppetMasterConfig type
- [ ] All platform types are 'cursor' | 'codex' | 'claude'
- [ ] `getRequiredPlatforms()` returns correct unique platforms

**Tests:**
```typescript
// src/types/config.test.ts
import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG, PuppetMasterConfig, getRequiredPlatforms } from './config.js';

describe('config', () => {
  test('DEFAULT_CONFIG satisfies PuppetMasterConfig', () => {
    const config: PuppetMasterConfig = DEFAULT_CONFIG;
    expect(config.project.name).toBe('Untitled');
    expect(config.tiers.phase.platform).toBe('claude');
  });

  test('getRequiredPlatforms returns unique platforms from config', () => {
    const required = getRequiredPlatforms(DEFAULT_CONFIG);
    // Default config uses: claude (phase), codex (task), cursor (subtask, iteration)
    expect(required).toContain('claude');
    expect(required).toContain('codex');
    expect(required).toContain('cursor');
    expect(required.length).toBe(3);
  });

  test('getRequiredPlatforms deduplicates when same platform used multiple tiers', () => {
    const config: PuppetMasterConfig = {
      ...DEFAULT_CONFIG,
      tiers: {
        phase: { platform: 'cursor', model: 'auto', selfFix: false, maxIterations: 3, escalation: null },
        task: { platform: 'cursor', model: 'auto', selfFix: true, maxIterations: 5, escalation: 'phase' },
        subtask: { platform: 'cursor', model: 'auto', selfFix: true, maxIterations: 10, escalation: 'task' },
        iteration: { platform: 'cursor', model: 'auto', selfFix: false, maxIterations: 3, escalation: 'subtask' },
      },
    };
    const required = getRequiredPlatforms(config);
    expect(required).toEqual(['cursor']);
  });
});
```

**🛑 STOP POINT:** Commit: `ralph: 1.2.1 config schema types`

---

### Piece: Types Barrel Export

**File:** `src/types/index.ts`

```typescript
// src/types/index.ts
// Barrel export for all types - use this for imports from other directories

// Config types (canonical source of Platform)
export {
  Platform,
  TierConfig,
  BudgetConfig,
  BranchConfig,
  PuppetMasterConfig,
  DEFAULT_CONFIG,
  getRequiredPlatforms,
  isPlatformRequired,
} from './config.js';

// Platform types
export {
  PlatformCapabilities,
  SmokeTestResult,
  SmokeTest,
  ExecutionRequest,
  ExecutionResult,
  PlatformRunnerContract,
  RunningProcess,
  CombinedCapabilities,
  CapabilityStatus,
} from './platforms.js';

// Event types
export {
  EventType,
  BaseEvent,
  RunnerStartEvent,
  RunnerStopEvent,
  PromptSentEvent,
  CommandExecutedEvent,
  VerifierResultEvent,
  GitActionEvent,
  ErrorEvent,
  StallDetectedEvent,
  PuppetMasterEvent,
} from './events.js';
```

> **ADDENDUM (Fix 3): Import Convention**
> 
> From within `src/types/`, import directly:
> ```typescript
> import { Platform } from './config.js';
> ```
> 
> From other directories (e.g., `src/doctor/`), import from barrel:
> ```typescript
> import { Platform, PuppetMasterConfig } from '../types/index.js';
> ```

**🛑 STOP POINT:** Commit: `ralph: types barrel export`

---

### Piece: Platform Types

**File:** `src/types/platforms.ts`

```typescript
// src/types/platforms.ts

// Re-export Platform from canonical source for convenience
// IMPORTANT: Platform is DEFINED in config.ts, only RE-EXPORTED here
import { Platform } from './config.js';
export { Platform };

/**
 * Capability matrix populated by Doctor/Discovery at runtime.
 * DEFAULT VALUES ARE PLACEHOLDERS until discovery runs.
 * 
 * ADDENDUM (Fix 4): Capabilities are ONLY confirmed by smoke tests.
 * The `helpHints` field contains weak signals from --help parsing.
 * The `verified` field indicates smoke test confirmation.
 */
export interface PlatformCapabilities {
  platform: Platform;
  version: string;
  discoveredAt: string;
  
  capabilities: {
    nonInteractive: CapabilityStatus;
    modelSelection: CapabilityStatus;
    streaming: 'full' | 'partial' | 'none';
    sessionResume: CapabilityStatus;
    mcpSupport: CapabilityStatus;
    maxTurns: CapabilityStatus;
    outputFormats: string[];
  };
  
  invocation: {
    command: string;
    nonInteractiveFlag: string;
    modelFlag: string;
    workingDirFlag?: string;
  };
  
  exitCodes: {
    success: number;
    failure: number[];
  };
  
  availableModels: string[];
  
  smokeTest: SmokeTestResult | null;
  
  /**
   * ADDENDUM (Fix 4): Help parsing hints (weak signal only)
   */
  helpHints?: {
    rawHelpOutput: string;
    detectedFlags: string[];
    parseTimestamp: string;
  };
}

/**
 * ADDENDUM (Fix 4): Capability verification status
 * - 'verified': Smoke test confirmed this capability works
 * - 'unverified': Help output suggests capability but no smoke test
 * - 'absent': Capability not detected or smoke test failed
 */
export interface CapabilityStatus {
  available: boolean;
  verified: boolean;
  verifiedAt?: string;
  verificationMethod?: 'smoke_test' | 'help_hint';
  evidence?: string;
}

export interface SmokeTestResult {
  passed: boolean;
  tests: SmokeTest[];
  totalDurationMs: number;
}

export interface SmokeTest {
  name: string;
  passed: boolean;
  durationMs: number;
  output?: string;
  error?: string;
  /**
   * ADDENDUM (Fix 4): What capability this test verifies
   */
  verifiesCapability?: string;
}

export interface ExecutionRequest {
  platform: Platform;
  prompt: string;
  model?: string;
  workingDirectory: string;
  timeout: number;
  contextFiles: string[];
}

export interface ExecutionResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  sessionId: string;
  processId: number;
}

/**
 * Runner contract: every platform runner MUST implement this.
 * Critical: spawnFreshProcess MUST create a NEW process (fresh agent).
 */
export interface PlatformRunnerContract {
  readonly platform: Platform;
  readonly sessionReuseAllowed: boolean; // MUST be false by default
  readonly defaultTimeout: number;
  readonly hardTimeout: number;
  
  // Core execution - MUST spawn fresh process
  spawnFreshProcess(request: ExecutionRequest): Promise<RunningProcess>;
  
  // Process lifecycle
  terminateProcess(pid: number): Promise<void>;
  forceKillProcess(pid: number): Promise<void>;
  
  // Capability discovery
  discoverCapabilities(): Promise<PlatformCapabilities>;
  runSmokeTests(): Promise<SmokeTestResult>;
  
  // Validation
  isAvailable(): Promise<boolean>;
  getVersion(): Promise<string>;
}

export interface RunningProcess {
  pid: number;
  platform: Platform;
  startedAt: Date;
  sessionId: string;
  stdout: AsyncIterable<string>;
  stderr: AsyncIterable<string>;
  waitForExit(): Promise<ExecutionResult>;
}

/**
 * Combined capability matrix for all platforms.
 * This is the AUTHORITATIVE source of truth.
 * Orchestrator MUST refuse to start if this is missing/stale.
 * 
 * ADDENDUM (Fix 5): Only required platforms must pass validation.
 */
export interface CombinedCapabilities {
  generatedAt: string;
  generatedBy: string;
  stalenessThresholdHours: number;
  
  /**
   * ADDENDUM (Fix 5): Platforms that were required for this run
   */
  requiredPlatforms: Platform[];
  
  platforms: {
    cursor?: PlatformCapabilities;
    codex?: PlatformCapabilities;
    claude?: PlatformCapabilities;
  };
  
  validation: {
    allRequiredPlatformsAvailable: boolean;
    allSmokeTestsPassed: boolean;
    readyForExecution: boolean;
    issues: string[];
  };
}
```

**Acceptance Criteria:**
- [ ] Types compile without errors
- [ ] `sessionReuseAllowed` default documented as false
- [ ] `spawnFreshProcess` clearly documented as requiring NEW process
- [ ] `CapabilityStatus` includes verification tracking

**Tests:** Type compilation via `npm run typecheck`

**🛑 STOP POINT:** Commit: `ralph: platform types with runner contract`

---

### Piece: Event Stream Types

> **ADDENDUM (Fix 6): Weave-Inspired Event Stream Format**
> 
> This defines the JSONL event stream format for logging all orchestrator activity.
> Every runner, verifier, and git action emits events to this stream.
> This format is inspired by Codex Weave patterns and ensures we don't paint
> ourselves into a dead-end logging format.

**File:** `src/types/events.ts`

```typescript
// src/types/events.ts
// ADDENDUM (Fix 6): Weave-inspired event stream types

import { Platform } from './config.js';

/**
 * Event types for the JSONL event stream.
 * All orchestrator activity is logged as typed events.
 */
export type EventType =
  | 'runner:start'
  | 'runner:stop'
  | 'runner:output'
  | 'prompt:sent'
  | 'command:executed'
  | 'verifier:start'
  | 'verifier:result'
  | 'git:action'
  | 'error'
  | 'stall:detected'
  | 'escalation'
  | 'budget:warning'
  | 'budget:exceeded';

/**
 * Base event structure - all events extend this.
 */
export interface BaseEvent {
  timestamp: string;           // ISO 8601
  eventType: EventType;
  sessionId: string;           // PM-YYYY-MM-DD-HH-MM-SS-NNN
  itemId?: string;             // Current work item (phase/task/subtask ID)
  correlationId?: string;      // Links related events
}

/**
 * Runner lifecycle events
 */
export interface RunnerStartEvent extends BaseEvent {
  eventType: 'runner:start';
  platform: Platform;
  processId: number;
  command: string;
  args: string[];
  workingDirectory: string;
  freshSpawn: true;            // ALWAYS true per design
}

export interface RunnerStopEvent extends BaseEvent {
  eventType: 'runner:stop';
  platform: Platform;
  processId: number;
  exitCode: number;
  durationMs: number;
  signal?: string;             // If killed by signal
}

export interface RunnerOutputEvent extends BaseEvent {
  eventType: 'runner:output';
  platform: Platform;
  processId: number;
  stream: 'stdout' | 'stderr';
  chunk: string;
  byteOffset: number;
}

/**
 * Prompt events
 */
export interface PromptSentEvent extends BaseEvent {
  eventType: 'prompt:sent';
  platform: Platform;
  promptTemplate: string;
  promptLength: number;
  contextFilesIncluded: string[];
  model?: string;
}

/**
 * Command execution events (tools/shell commands run by agent)
 */
export interface CommandExecutedEvent extends BaseEvent {
  eventType: 'command:executed';
  command: string;
  args: string[];
  exitCode: number;
  durationMs: number;
  truncatedOutput?: string;
}

/**
 * Verifier events
 */
export interface VerifierStartEvent extends BaseEvent {
  eventType: 'verifier:start';
  verifierType: string;
  verifierId: string;
}

export interface VerifierResultEvent extends BaseEvent {
  eventType: 'verifier:result';
  verifierType: string;
  verifierId: string;
  passed: boolean;
  durationMs: number;
  details?: Record<string, unknown>;
}

/**
 * Git action events
 */
export interface GitActionEvent extends BaseEvent {
  eventType: 'git:action';
  action: 'commit' | 'push' | 'branch' | 'merge' | 'pr';
  ref?: string;
  commitSha?: string;
  branch?: string;
  prNumber?: number;
  success: boolean;
  error?: string;
}

/**
 * Error events
 */
export interface ErrorEvent extends BaseEvent {
  eventType: 'error';
  errorCode: string;
  message: string;
  stack?: string;
  recoverable: boolean;
  platform?: Platform;
}

/**
 * Stall detection events
 */
export interface StallDetectedEvent extends BaseEvent {
  eventType: 'stall:detected';
  platform: Platform;
  processId: number;
  stallType: 'no_output' | 'identical_output' | 'hard_timeout';
  stallDurationMs: number;
  action: 'kill_and_retry' | 'escalate' | 'pause';
}

/**
 * Escalation events
 */
export interface EscalationEvent extends BaseEvent {
  eventType: 'escalation';
  fromTier: 'iteration' | 'subtask' | 'task' | 'phase';
  toTier: 'subtask' | 'task' | 'phase';
  reason: string;
  itemId: string;
  attemptNumber: number;
}

/**
 * Budget events
 */
export interface BudgetWarningEvent extends BaseEvent {
  eventType: 'budget:warning';
  platform: Platform;
  budgetType: 'per_run' | 'per_hour' | 'per_day';
  currentUsage: number;
  limit: number;
  percentUsed: number;
}

export interface BudgetExceededEvent extends BaseEvent {
  eventType: 'budget:exceeded';
  platform: Platform;
  budgetType: 'per_run' | 'per_hour' | 'per_day';
  action: 'fallback' | 'pause' | 'queue';
  fallbackPlatform?: Platform;
}

/**
 * Union type of all events
 */
export type PuppetMasterEvent =
  | RunnerStartEvent
  | RunnerStopEvent
  | RunnerOutputEvent
  | PromptSentEvent
  | CommandExecutedEvent
  | VerifierStartEvent
  | VerifierResultEvent
  | GitActionEvent
  | ErrorEvent
  | StallDetectedEvent
  | EscalationEvent
  | BudgetWarningEvent
  | BudgetExceededEvent;
```

**🛑 STOP POINT:** Commit: `ralph: event stream types`

---

## Phase 3: Doctor + Capability Discovery

> **ADDENDUM (Fix 4): Smoke Tests as Authoritative Source of Truth**
> 
> **CRITICAL DESIGN DECISION:**
> - Help parsing (`--help` output) provides WEAK SIGNALS only (hints)
> - Smoke tests are the SOURCE OF TRUTH for capabilities
> - A capability is only "verified: true" when a smoke test proves it
> - Orchestrator MUST refuse to proceed if required capabilities are unverified
> 
> **Required Smoke Tests per Platform:**
> 
> | Platform | Test Name | Command | Pass Criteria |
> |----------|-----------|---------|---------------|
> | cursor | version | `cursor-agent --version` | Exit 0, outputs version |
> | cursor | non_interactive | `cursor-agent -p "echo hello"` | Exit 0, outputs "hello" |
> | cursor | model_selection | `cursor-agent --model auto -p "echo test"` | Exit 0 |
> | codex | version | `codex --version` | Exit 0, outputs version |
> | codex | non_interactive | `codex exec "echo hello"` | Exit 0, outputs "hello" |
> | codex | model_selection | `codex exec --model gpt-5 "echo test"` | Exit 0 |
> | claude | version | `claude --version` | Exit 0, outputs version |
> | claude | non_interactive | `claude -p "echo hello"` | Exit 0, outputs "hello" |
> | claude | model_selection | `claude --model sonnet-4.5 -p "echo test"` | Exit 0 |
> 
> **Evidence Artifacts Produced:**
> - `capabilities.json` - Combined capability matrix (authoritative)
> - `smoke-test-<platform>.log` - Full smoke test output per platform
> - `discovery-report.md` - Human-readable summary

### Piece 3.5.1: CapabilityDiscoveryService

**File:** `src/doctor/capability-discovery.ts`

```typescript
// src/doctor/capability-discovery.ts

import { spawn } from 'child_process';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import {
  Platform,
  PlatformCapabilities,
  SmokeTestResult,
  SmokeTest,
  CombinedCapabilities,
  CapabilityStatus,
  PuppetMasterConfig,
  getRequiredPlatforms,
} from '../types/index.js';

const CAPABILITIES_DIR = '.puppet-master/capabilities';

/**
 * ADDENDUM (Fix 4): Smoke test definitions per platform.
 * These are the AUTHORITATIVE tests that verify capabilities.
 */
interface SmokeTestDefinition {
  name: string;
  verifiesCapability: string;
  buildCommand: (cliPath: string) => { cmd: string; args: string[] };
  validateOutput?: (stdout: string, stderr: string, exitCode: number) => boolean;
  timeout: number;
}

const SMOKE_TEST_DEFINITIONS: Record<Platform, SmokeTestDefinition[]> = {
  cursor: [
    {
      name: 'version',
      verifiesCapability: 'basic_invocation',
      buildCommand: (cli) => ({ cmd: cli, args: ['--version'] }),
      validateOutput: (stdout, _stderr, code) => code === 0 && stdout.length > 0,
      timeout: 10000,
    },
    {
      name: 'non_interactive',
      verifiesCapability: 'nonInteractive',
      buildCommand: (cli) => ({ cmd: cli, args: ['-p', 'respond with exactly: SMOKE_TEST_OK'] }),
      validateOutput: (stdout, _stderr, code) => code === 0 && stdout.includes('SMOKE_TEST_OK'),
      timeout: 60000,
    },
    {
      name: 'model_selection',
      verifiesCapability: 'modelSelection',
      buildCommand: (cli) => ({ cmd: cli, args: ['--model', 'auto', '-p', 'respond with exactly: MODEL_TEST_OK'] }),
      validateOutput: (stdout, _stderr, code) => code === 0 && stdout.includes('MODEL_TEST_OK'),
      timeout: 60000,
    },
  ],
  codex: [
    {
      name: 'version',
      verifiesCapability: 'basic_invocation',
      buildCommand: (cli) => ({ cmd: cli, args: ['--version'] }),
      validateOutput: (stdout, _stderr, code) => code === 0 && stdout.length > 0,
      timeout: 10000,
    },
    {
      name: 'non_interactive',
      verifiesCapability: 'nonInteractive',
      buildCommand: (cli) => ({ cmd: cli, args: ['exec', 'echo SMOKE_TEST_OK'] }),
      validateOutput: (stdout, _stderr, code) => code === 0 && stdout.includes('SMOKE_TEST_OK'),
      timeout: 60000,
    },
    {
      name: 'model_selection',
      verifiesCapability: 'modelSelection',
      buildCommand: (cli) => ({ cmd: cli, args: ['exec', '--model', 'gpt-5', 'echo MODEL_TEST_OK'] }),
      validateOutput: (stdout, _stderr, code) => code === 0 && stdout.includes('MODEL_TEST_OK'),
      timeout: 60000,
    },
  ],
  claude: [
    {
      name: 'version',
      verifiesCapability: 'basic_invocation',
      buildCommand: (cli) => ({ cmd: cli, args: ['--version'] }),
      validateOutput: (stdout, _stderr, code) => code === 0 && stdout.length > 0,
      timeout: 10000,
    },
    {
      name: 'non_interactive',
      verifiesCapability: 'nonInteractive',
      buildCommand: (cli) => ({ cmd: cli, args: ['-p', 'respond with exactly: SMOKE_TEST_OK'] }),
      validateOutput: (stdout, _stderr, code) => code === 0 && stdout.includes('SMOKE_TEST_OK'),
      timeout: 60000,
    },
    {
      name: 'model_selection',
      verifiesCapability: 'modelSelection',
      buildCommand: (cli) => ({ cmd: cli, args: ['--model', 'sonnet-4.5', '-p', 'respond with exactly: MODEL_TEST_OK'] }),
      validateOutput: (stdout, _stderr, code) => code === 0 && stdout.includes('MODEL_TEST_OK'),
      timeout: 60000,
    },
  ],
};

export class CapabilityDiscoveryService {
  private config: PuppetMasterConfig;
  private capabilities: Map<Platform, PlatformCapabilities> = new Map();
  
  constructor(config: PuppetMasterConfig) {
    this.config = config;
  }
  
  /**
   * Discover capabilities for REQUIRED platforms only.
   * ADDENDUM (Fix 5): Only checks platforms needed by current tier config.
   * Produces evidence artifacts required for execution.
   */
  async discoverAll(): Promise<CombinedCapabilities> {
    await this.ensureCapabilitiesDir();
    
    // ADDENDUM (Fix 5): Get required platforms from config, not hardcoded list
    const requiredPlatforms = getRequiredPlatforms(this.config);
    
    const results: CombinedCapabilities = {
      generatedAt: new Date().toISOString(),
      generatedBy: 'puppet-master doctor',
      stalenessThresholdHours: 24,
      requiredPlatforms, // ADDENDUM (Fix 5): Track which platforms were required
      platforms: {},
      validation: {
        allRequiredPlatformsAvailable: true,
        allSmokeTestsPassed: true,
        readyForExecution: true,
        issues: [],
      },
    };
    
    for (const platform of requiredPlatforms) {
      try {
        const caps = await this.discoverPlatform(platform);
        results.platforms[platform] = caps;
        this.capabilities.set(platform, caps);
        
        if (!caps.smokeTest?.passed) {
          results.validation.allSmokeTestsPassed = false;
          results.validation.issues.push(`Smoke test failed for ${platform}`);
        }
      } catch (error) {
        results.validation.allRequiredPlatformsAvailable = false;
        results.validation.issues.push(`${platform}: ${(error as Error).message}`);
      }
    }
    
    results.validation.readyForExecution =
      results.validation.allRequiredPlatformsAvailable &&
      results.validation.allSmokeTestsPassed &&
      results.validation.issues.length === 0;
    
    // Write combined capabilities.json
    await this.writeCombinedCapabilities(results);
    
    // Write human-readable report
    await this.writeDiscoveryReport(results);
    
    return results;
  }
  
  /**
   * Discover capabilities for a single platform.
   * ADDENDUM (Fix 4): Smoke tests are authoritative, help parsing is hints only.
   */
  async discoverPlatform(platform: Platform): Promise<PlatformCapabilities> {
    const cliPath = this.config.cliPaths[platform];
    
    // 1. Check if CLI exists
    const version = await this.getVersion(platform, cliPath);
    
    // 2. Parse help output for HINTS only (weak signal)
    let helpHints: PlatformCapabilities['helpHints'];
    try {
      const helpOutput = await this.runCommand(cliPath, ['--help']);
      helpHints = {
        rawHelpOutput: helpOutput.substring(0, 5000),
        detectedFlags: this.extractFlags(helpOutput),
        parseTimestamp: new Date().toISOString(),
      };
    } catch {
      // Help parsing failure is not fatal
      helpHints = undefined;
    }
    
    // 3. Run smoke tests - THIS IS THE SOURCE OF TRUTH
    const smokeTest = await this.runSmokeTests(platform, cliPath);
    
    // 4. Build capabilities from smoke test results (NOT help parsing)
    const capabilities = this.buildCapabilitiesFromSmokeTests(platform, smokeTest, helpHints);
    
    // 5. Discover available models (from docs/defaults, not dynamic)
    const availableModels = this.getKnownModels(platform);
    
    const platformCaps: PlatformCapabilities = {
      platform,
      version,
      discoveredAt: new Date().toISOString(),
      capabilities,
      invocation: this.getInvocationConfig(platform, cliPath),
      exitCodes: { success: 0, failure: [1, 2] },
      availableModels,
      smokeTest,
      helpHints, // ADDENDUM (Fix 4): Include hints but mark as non-authoritative
    };
    
    // Save per-platform YAML
    await this.savePlatformCapabilities(platform, platformCaps);
    
    return platformCaps;
  }
  
  /**
   * ADDENDUM (Fix 4): Build capabilities from smoke test results.
   * Capabilities are only "verified" if smoke test passed.
   */
  private buildCapabilitiesFromSmokeTests(
    platform: Platform,
    smokeTest: SmokeTestResult,
    helpHints?: PlatformCapabilities['helpHints']
  ): PlatformCapabilities['capabilities'] {
    const findTest = (name: string) => smokeTest.tests.find((t) => t.name === name);
    
    const makeStatus = (testName: string, hintFlag?: string): CapabilityStatus => {
      const test = findTest(testName);
      if (test?.passed) {
        return {
          available: true,
          verified: true,
          verifiedAt: new Date().toISOString(),
          verificationMethod: 'smoke_test',
          evidence: `smoke test "${testName}" passed`,
        };
      }
      // Check help hints as fallback (but NOT verified)
      const hintDetected = hintFlag && helpHints?.detectedFlags.includes(hintFlag);
      return {
        available: hintDetected ?? false,
        verified: false,
        verificationMethod: hintDetected ? 'help_hint' : undefined,
        evidence: hintDetected ? `detected in --help output` : undefined,
      };
    };
    
    return {
      nonInteractive: makeStatus('non_interactive', '-p'),
      modelSelection: makeStatus('model_selection', '--model'),
      streaming: 'partial', // Would need specific test
      sessionResume: { available: false, verified: false }, // Not tested yet
      mcpSupport: { available: false, verified: false }, // Not tested yet
      maxTurns: { available: false, verified: false }, // Not tested yet
      outputFormats: ['text'],
    };
  }
  
  /**
   * Validate that execution can proceed.
   * Orchestrator MUST call this before starting.
   * 
   * ADDENDUM (Fix 4): Refuses if required capabilities are not VERIFIED (not just hinted).
   * ADDENDUM (Fix 5): Only checks platforms required by current config.
   */
  async validateReadyForExecution(): Promise<{
    ready: boolean;
    issues: string[];
    mustRunDoctor: boolean;
  }> {
    const issues: string[] = [];
    
    // Check if capabilities.json exists
    const capsPath = join(CAPABILITIES_DIR, 'capabilities.json');
    if (!existsSync(capsPath)) {
      issues.push('capabilities.json not found - run `puppet-master doctor`');
      return { ready: false, issues, mustRunDoctor: true };
    }
    
    // Load and check staleness
    const caps = JSON.parse(await readFile(capsPath, 'utf-8')) as CombinedCapabilities;
    const generatedAt = new Date(caps.generatedAt);
    const hoursOld = (Date.now() - generatedAt.getTime()) / (1000 * 60 * 60);
    
    if (hoursOld > caps.stalenessThresholdHours) {
      issues.push(`Capabilities are stale (${hoursOld.toFixed(1)}h old, threshold: ${caps.stalenessThresholdHours}h)`);
    }
    
    // ADDENDUM (Fix 5): Check if config has changed (different required platforms)
    const currentRequired = getRequiredPlatforms(this.config);
    const discoveredRequired = caps.requiredPlatforms || [];
    const missingPlatforms = currentRequired.filter((p) => !discoveredRequired.includes(p));
    if (missingPlatforms.length > 0) {
      issues.push(`Config requires platforms not in capabilities.json: ${missingPlatforms.join(', ')}`);
    }
    
    // Check validation status
    if (!caps.validation.readyForExecution) {
      issues.push(...caps.validation.issues);
    }
    
    // ADDENDUM (Fix 4): Check that required capabilities are VERIFIED
    for (const platform of currentRequired) {
      const platformCaps = caps.platforms[platform];
      if (!platformCaps) {
        issues.push(`Platform ${platform} not found in capabilities`);
        continue;
      }
      if (!platformCaps.capabilities.nonInteractive.verified) {
        issues.push(`${platform}: nonInteractive capability not verified by smoke test`);
      }
    }
    
    return {
      ready: issues.length === 0,
      issues,
      mustRunDoctor: issues.length > 0,
    };
  }
  
  // --- Private helpers ---
  
  private async ensureCapabilitiesDir(): Promise<void> {
    if (!existsSync(CAPABILITIES_DIR)) {
      await mkdir(CAPABILITIES_DIR, { recursive: true });
    }
  }
  
  private async getVersion(platform: Platform, cliPath: string): Promise<string> {
    try {
      const output = await this.runCommand(cliPath, ['--version']);
      return output.trim().split('\n')[0];
    } catch {
      throw new Error(`${platform} CLI not found at: ${cliPath}`);
    }
  }
  
  private async runCommand(cmd: string, args: string[], timeout = 30000): Promise<string> {
    return new Promise((resolve, reject) => {
      const proc = spawn(cmd, args, { shell: true });
      let stdout = '';
      let stderr = '';
      
      const timer = setTimeout(() => {
        proc.kill('SIGKILL');
        reject(new Error(`Command timed out after ${timeout}ms`));
      }, timeout);
      
      proc.stdout.on('data', (data) => { stdout += data; });
      proc.stderr.on('data', (data) => { stderr += data; });
      
      proc.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Command failed: ${cmd} ${args.join(' ')}\n${stderr}`));
        }
      });
      
      proc.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }
  
  private extractFlags(helpOutput: string): string[] {
    const flags: string[] = [];
    const flagPattern = /(-{1,2}[\w-]+)/g;
    let match;
    while ((match = flagPattern.exec(helpOutput)) !== null) {
      flags.push(match[1]);
    }
    return [...new Set(flags)];
  }
  
  private getInvocationConfig(platform: Platform, cliPath: string): PlatformCapabilities['invocation'] {
    const configs: Record<Platform, PlatformCapabilities['invocation']> = {
      cursor: { command: cliPath, nonInteractiveFlag: '-p', modelFlag: '--model' },
      codex: { command: cliPath, nonInteractiveFlag: 'exec', modelFlag: '--model' },
      claude: { command: cliPath, nonInteractiveFlag: '-p', modelFlag: '--model' },
    };
    return configs[platform];
  }
  
  /**
   * ADDENDUM (Fix 4): Run authoritative smoke tests.
   */
  private async runSmokeTests(platform: Platform, cliPath: string): Promise<SmokeTestResult> {
    const definitions = SMOKE_TEST_DEFINITIONS[platform];
    const tests: SmokeTest[] = [];
    let logContent = `=== Smoke Test: ${platform} ===\nStarted: ${new Date().toISOString()}\nCLI Path: ${cliPath}\n\n`;
    
    for (const def of definitions) {
      const { cmd, args } = def.buildCommand(cliPath);
      const test = await this.runSingleSmokeTest(def, cmd, args);
      tests.push(test);
      logContent += this.formatSmokeTestLog(test, `${cmd} ${args.join(' ')}`);
    }
    
    // Write smoke test log
    await writeFile(
      join(CAPABILITIES_DIR, `smoke-test-${platform}.log`),
      logContent
    );
    
    return {
      passed: tests.every((t) => t.passed),
      tests,
      totalDurationMs: tests.reduce((sum, t) => sum + t.durationMs, 0),
    };
  }
  
  private async runSingleSmokeTest(
    def: SmokeTestDefinition,
    cmd: string,
    args: string[]
  ): Promise<SmokeTest> {
    const start = Date.now();
    try {
      const result = await this.runCommandWithResult(cmd, args, def.timeout);
      const passed = def.validateOutput
        ? def.validateOutput(result.stdout, result.stderr, result.exitCode)
        : result.exitCode === 0;
      
      return {
        name: def.name,
        passed,
        durationMs: Date.now() - start,
        output: result.stdout.substring(0, 500),
        verifiesCapability: def.verifiesCapability,
        error: passed ? undefined : `Exit code: ${result.exitCode}`,
      };
    } catch (error) {
      return {
        name: def.name,
        passed: false,
        durationMs: Date.now() - start,
        error: (error as Error).message,
        verifiesCapability: def.verifiesCapability,
      };
    }
  }
  
  private async runCommandWithResult(
    cmd: string,
    args: string[],
    timeout: number
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve, reject) => {
      const proc = spawn(cmd, args, { shell: true });
      let stdout = '';
      let stderr = '';
      
      const timer = setTimeout(() => {
        proc.kill('SIGKILL');
        reject(new Error(`Command timed out after ${timeout}ms`));
      }, timeout);
      
      proc.stdout.on('data', (data) => { stdout += data; });
      proc.stderr.on('data', (data) => { stderr += data; });
      
      proc.on('close', (code) => {
        clearTimeout(timer);
        resolve({ stdout, stderr, exitCode: code ?? 1 });
      });
      
      proc.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }
  
  private formatSmokeTestLog(test: SmokeTest, command: string): string {
    return `--- Test: ${test.name} ---
Command: ${command}
Verifies: ${test.verifiesCapability || 'N/A'}
Passed: ${test.passed}
Duration: ${test.durationMs}ms
${test.output ? `Output:\n${test.output}` : ''}
${test.error ? `Error:\n${test.error}` : ''}

`;
  }
  
  private getKnownModels(platform: Platform): string[] {
    // Known models per platform - actual discovery would query the CLI
    const defaults: Record<Platform, string[]> = {
      cursor: ['auto', 'sonnet-4.5-thinking', 'grok-code'],
      codex: ['gpt-5.2-high', 'gpt-5'],
      claude: ['opus-4.5', 'sonnet-4.5'],
    };
    return defaults[platform];
  }
  
  private async savePlatformCapabilities(platform: Platform, caps: PlatformCapabilities): Promise<void> {
    await writeFile(
      join(CAPABILITIES_DIR, `${platform}.json`),
      JSON.stringify(caps, null, 2)
    );
  }
  
  private async writeCombinedCapabilities(caps: CombinedCapabilities): Promise<void> {
    await writeFile(
      join(CAPABILITIES_DIR, 'capabilities.json'),
      JSON.stringify(caps, null, 2)
    );
  }
  
  private async writeDiscoveryReport(caps: CombinedCapabilities): Promise<void> {
    const report = this.generateDiscoveryReport(caps);
    await writeFile(join(CAPABILITIES_DIR, 'discovery-report.md'), report);
  }
  
  private generateDiscoveryReport(caps: CombinedCapabilities): string {
    const status = caps.validation.readyForExecution ? '✅ Ready for Execution' : '❌ Not Ready';
    
    let report = `# Capability Discovery Report

**Generated:** ${caps.generatedAt}
**Status:** ${status}
**Required Platforms:** ${caps.requiredPlatforms.join(', ')}

## Platform Summary

| Platform | Version | Smoke Test | Non-Interactive | Model Selection |
|----------|---------|------------|-----------------|-----------------|
`;
    
    for (const platform of caps.requiredPlatforms) {
      const p = caps.platforms[platform];
      if (p) {
        const smoke = p.smokeTest?.passed ? '✅ PASS' : '❌ FAIL';
        const ni = p.capabilities.nonInteractive.verified ? '✅ Verified' : 
                   p.capabilities.nonInteractive.available ? '⚠️ Hint only' : '❌';
        const ms = p.capabilities.modelSelection.verified ? '✅ Verified' : 
                   p.capabilities.modelSelection.available ? '⚠️ Hint only' : '❌';
        report += `| ${platform} | ${p.version} | ${smoke} | ${ni} | ${ms} |\n`;
      } else {
        report += `| ${platform} | - | ❌ NOT FOUND | - | - |\n`;
      }
    }
    
    report += `
## Verification Note

> **IMPORTANT:** Capabilities marked "Verified" were confirmed by smoke tests.
> Capabilities marked "Hint only" were detected in --help output but NOT verified.
> The orchestrator will refuse to use unverified capabilities.
`;
    
    if (caps.validation.issues.length > 0) {
      report += `\n## Issues\n\n`;
      for (const issue of caps.validation.issues) {
        report += `- ${issue}\n`;
      }
    } else {
      report += `\n## Issues\n\nNone detected.\n`;
    }
    
    return report;
  }
}
```

**Acceptance Criteria:**
- [ ] `discoverAll()` produces `capabilities.json`
- [ ] `discoverAll()` produces `discovery-report.md`
- [ ] `discoverAll()` produces `smoke-test-<platform>.log` for each REQUIRED platform
- [ ] `validateReadyForExecution()` returns `ready: false` if no capabilities.json
- [ ] `validateReadyForExecution()` returns `ready: false` if capabilities stale
- [ ] `validateReadyForExecution()` returns `ready: false` if required capabilities not VERIFIED
- [ ] Only platforms in config are checked (not all three hardcoded)

**Tests:**
```typescript
// src/doctor/capability-discovery.test.ts
import { describe, test, expect, beforeEach } from 'vitest';
import { CapabilityDiscoveryService } from './capability-discovery.js';
import { DEFAULT_CONFIG, PuppetMasterConfig } from '../types/index.js';

describe('CapabilityDiscoveryService', () => {
  test('validateReadyForExecution returns false when no capabilities.json', async () => {
    const service = new CapabilityDiscoveryService(DEFAULT_CONFIG);
    const result = await service.validateReadyForExecution();
    expect(result.ready).toBe(false);
    expect(result.mustRunDoctor).toBe(true);
  });

  test('uses required platforms from config, not hardcoded list', async () => {
    const singlePlatformConfig: PuppetMasterConfig = {
      ...DEFAULT_CONFIG,
      tiers: {
        phase: { ...DEFAULT_CONFIG.tiers.phase, platform: 'cursor' },
        task: { ...DEFAULT_CONFIG.tiers.task, platform: 'cursor' },
        subtask: { ...DEFAULT_CONFIG.tiers.subtask, platform: 'cursor' },
        iteration: { ...DEFAULT_CONFIG.tiers.iteration, platform: 'cursor' },
      },
    };
    const service = new CapabilityDiscoveryService(singlePlatformConfig);
    // Service should only try to discover 'cursor', not all three
    // Full test would mock the CLI calls
  });
});
```

**🛑 STOP POINT:** Commit: `ralph: 3.5.1 capability discovery service`

---

### Piece 7.1.1: Doctor Class

**File:** `src/doctor/doctor.ts`

```typescript
// src/doctor/doctor.ts

import { existsSync } from 'fs';
import { spawn } from 'child_process';
import { PuppetMasterConfig, getRequiredPlatforms, Platform } from '../types/index.js';
import { CapabilityDiscoveryService } from './capability-discovery.js';
import { CombinedCapabilities } from '../types/index.js';

export interface DoctorCheck {
  name: string;
  category: 'cli' | 'git' | 'runtime' | 'project' | 'capability';
  status: 'pass' | 'fail' | 'warn';
  message: string;
  fix?: string;
}

export interface DoctorReport {
  timestamp: string;
  checks: DoctorCheck[];
  capabilities?: CombinedCapabilities;
  passed: boolean;
  warnings: number;
  failures: number;
  requiredPlatforms: Platform[]; // ADDENDUM (Fix 5)
}

export class Doctor {
  private config: PuppetMasterConfig;
  private capabilityService: CapabilityDiscoveryService;
  
  constructor(config: PuppetMasterConfig) {
    this.config = config;
    this.capabilityService = new CapabilityDiscoveryService(config);
  }
  
  /**
   * Run all doctor checks + capability discovery.
   * ADDENDUM (Fix 5): Only checks platforms required by config.
   */
  async runFullDiagnostic(): Promise<DoctorReport> {
    const checks: DoctorCheck[] = [];
    const requiredPlatforms = getRequiredPlatforms(this.config);
    
    // CLI checks - ONLY for required platforms
    checks.push(...(await this.checkCLIs(requiredPlatforms)));
    
    // Git checks
    checks.push(...(await this.checkGit()));
    
    // Runtime checks
    checks.push(...(await this.checkRuntimes()));
    
    // Project checks
    checks.push(...(await this.checkProject()));
    
    // Capability discovery (produces evidence artifacts)
    let capabilities: CombinedCapabilities | undefined;
    try {
      capabilities = await this.capabilityService.discoverAll();
      checks.push({
        name: 'Capability Discovery',
        category: 'capability',
        status: capabilities.validation.readyForExecution ? 'pass' : 'fail',
        message: capabilities.validation.readyForExecution
          ? `All required platforms (${requiredPlatforms.join(', ')}) discovered and smoke tests passed`
          : `Issues: ${capabilities.validation.issues.join(', ')}`,
      });
    } catch (error) {
      checks.push({
        name: 'Capability Discovery',
        category: 'capability',
        status: 'fail',
        message: `Discovery failed: ${(error as Error).message}`,
        fix: 'Check CLI paths in config',
      });
    }
    
    const failures = checks.filter((c) => c.status === 'fail').length;
    const warnings = checks.filter((c) => c.status === 'warn').length;
    
    return {
      timestamp: new Date().toISOString(),
      checks,
      capabilities,
      passed: failures === 0,
      warnings,
      failures,
      requiredPlatforms,
    };
  }
  
  /**
   * ADDENDUM (Fix 5): Only check CLIs for required platforms.
   */
  private async checkCLIs(requiredPlatforms: Platform[]): Promise<DoctorCheck[]> {
    const checks: DoctorCheck[] = [];
    
    for (const platform of requiredPlatforms) {
      const path = this.config.cliPaths[platform];
      const available = await this.isCommandAvailable(path);
      checks.push({
        name: `CLI: ${platform}`,
        category: 'cli',
        status: available ? 'pass' : 'fail', // FAIL not warn - it's required!
        message: available ? `${path} is available` : `${path} not found (REQUIRED by config)`,
        fix: available ? undefined : `Install ${platform} CLI or update cliPaths.${platform} in config`,
      });
    }
    
    // Also note unused platforms as info (not checked)
    const allPlatforms: Platform[] = ['cursor', 'codex', 'claude'];
    const unusedPlatforms = allPlatforms.filter((p) => !requiredPlatforms.includes(p));
    if (unusedPlatforms.length > 0) {
      checks.push({
        name: 'CLI: Unused platforms',
        category: 'cli',
        status: 'pass',
        message: `Not required by config: ${unusedPlatforms.join(', ')} (skipped)`,
      });
    }
    
    return checks;
  }
  
  private async checkGit(): Promise<DoctorCheck[]> {
    const checks: DoctorCheck[] = [];
    
    // Check git is installed
    const gitAvailable = await this.isCommandAvailable('git');
    checks.push({
      name: 'Git CLI',
      category: 'git',
      status: gitAvailable ? 'pass' : 'fail',
      message: gitAvailable ? 'git is available' : 'git not found',
      fix: gitAvailable ? undefined : 'Install git',
    });
    
    // Check git repo
    const isRepo = existsSync('.git');
    checks.push({
      name: 'Git Repository',
      category: 'git',
      status: isRepo ? 'pass' : 'warn',
      message: isRepo ? 'In a git repository' : 'Not a git repository',
      fix: isRepo ? undefined : 'Run `git init`',
    });
    
    // Check gh CLI (for PR automation)
    const ghAvailable = await this.isCommandAvailable('gh');
    checks.push({
      name: 'GitHub CLI',
      category: 'git',
      status: ghAvailable ? 'pass' : 'warn',
      message: ghAvailable ? 'gh is available' : 'gh not found (PR automation disabled)',
      fix: ghAvailable ? undefined : 'Install gh CLI for PR automation',
    });
    
    return checks;
  }
  
  private async checkRuntimes(): Promise<DoctorCheck[]> {
    const checks: DoctorCheck[] = [];
    
    // Check Node.js
    const nodeAvailable = await this.isCommandAvailable('node');
    checks.push({
      name: 'Node.js',
      category: 'runtime',
      status: nodeAvailable ? 'pass' : 'fail',
      message: nodeAvailable ? 'node is available' : 'node not found',
    });
    
    // Check npm
    const npmAvailable = await this.isCommandAvailable('npm');
    checks.push({
      name: 'npm',
      category: 'runtime',
      status: npmAvailable ? 'pass' : 'fail',
      message: npmAvailable ? 'npm is available' : 'npm not found',
    });
    
    return checks;
  }
  
  private async checkProject(): Promise<DoctorCheck[]> {
    const checks: DoctorCheck[] = [];
    
    // Check .puppet-master directory
    const pmDirExists = existsSync('.puppet-master');
    checks.push({
      name: 'Puppet Master Directory',
      category: 'project',
      status: pmDirExists ? 'pass' : 'warn',
      message: pmDirExists ? '.puppet-master exists' : '.puppet-master not found',
      fix: pmDirExists ? undefined : 'Run `puppet-master init`',
    });
    
    // Check config file
    const configExists = existsSync('.puppet-master/config.yaml');
    checks.push({
      name: 'Config File',
      category: 'project',
      status: configExists ? 'pass' : 'warn',
      message: configExists ? 'config.yaml exists' : 'config.yaml not found',
      fix: configExists ? undefined : 'Run `puppet-master init`',
    });
    
    return checks;
  }
  
  private async isCommandAvailable(cmd: string): Promise<boolean> {
    return new Promise((resolve) => {
      const proc = spawn(cmd, ['--version'], { shell: true });
      proc.on('close', (code) => resolve(code === 0));
      proc.on('error', () => resolve(false));
    });
  }
}
```

**Acceptance Criteria:**
- [ ] `runFullDiagnostic()` checks ONLY required platform CLIs
- [ ] `runFullDiagnostic()` checks git availability
- [ ] `runFullDiagnostic()` checks Node/npm
- [ ] `runFullDiagnostic()` runs capability discovery
- [ ] Returns `passed: false` if any check fails
- [ ] Reports which platforms were required

**Tests:**
```typescript
// src/doctor/doctor.test.ts
import { describe, test, expect } from 'vitest';
import { Doctor } from './doctor.js';
import { DEFAULT_CONFIG } from '../types/index.js';

describe('Doctor', () => {
  test('runFullDiagnostic returns report', async () => {
    const doctor = new Doctor(DEFAULT_CONFIG);
    const report = await doctor.runFullDiagnostic();
    
    expect(report.timestamp).toBeDefined();
    expect(report.checks.length).toBeGreaterThan(0);
    expect(typeof report.passed).toBe('boolean');
    expect(report.requiredPlatforms).toBeDefined();
  });
});
```

**🛑 STOP POINT:** Commit: `ralph: 7.1.1 doctor class`

---

## Phase 4: Base Platform Runner

### Piece 3.1.1: BasePlatformRunner

**File:** `src/platforms/base-runner.ts`

```typescript
// src/platforms/base-runner.ts

import { spawn, ChildProcess } from 'child_process';
import {
  Platform,
  PlatformRunnerContract,
  PlatformCapabilities,
  SmokeTestResult,
  ExecutionRequest,
  ExecutionResult,
  RunningProcess,
} from '../types/index.js';
import { EventStreamLogger } from '../logging/event-stream.js';

/**
 * Base implementation of PlatformRunnerContract.
 * 
 * CRITICAL: This class enforces FRESH AGENT PER ITERATION.
 * Every call to spawnFreshProcess() creates a NEW OS process.
 * Session reuse is DISABLED by default.
 */
export abstract class BasePlatformRunner implements PlatformRunnerContract {
  abstract readonly platform: Platform;
  
  // CRITICAL: Session reuse MUST be false by default
  readonly sessionReuseAllowed: boolean = false;
  
  readonly defaultTimeout: number = 300_000; // 5 minutes
  readonly hardTimeout: number = 1_800_000;  // 30 minutes
  
  protected processes: Map<number, ChildProcess> = new Map();
  protected eventLogger?: EventStreamLogger;
  
  constructor(eventLogger?: EventStreamLogger) {
    this.eventLogger = eventLogger;
  }
  
  /**
   * Spawn a FRESH agent process.
   * 
   * CRITICAL: This MUST create a new OS process every time.
   * No session resume, no context carryover except via state files.
   */
  async spawnFreshProcess(request: ExecutionRequest): Promise<RunningProcess> {
    const sessionId = this.generateSessionId();
    const args = this.buildArgs(request);
    const cmd = this.getCommand();
    
    // Log process spawn for audit
    console.log(`[${this.platform}] Spawning fresh process: ${cmd} ${args.join(' ')}`);
    console.log(`[${this.platform}] Session ID: ${sessionId}`);
    console.log(`[${this.platform}] Working directory: ${request.workingDirectory}`);
    
    // ADDENDUM (Fix 6): Emit runner:start event
    await this.eventLogger?.logRunnerStart({
      sessionId,
      platform: this.platform,
      processId: 0, // Will update after spawn
      command: cmd,
      args,
      workingDirectory: request.workingDirectory,
    });
    
    const proc = spawn(cmd, args, {
      cwd: request.workingDirectory,
      shell: true,
      env: {
        ...process.env,
        PUPPET_MASTER_SESSION: sessionId,
        PUPPET_MASTER_PLATFORM: this.platform,
      },
    });
    
    if (!proc.pid) {
      throw new Error(`Failed to spawn ${this.platform} process`);
    }
    
    this.processes.set(proc.pid, proc);
    
    const startedAt = new Date();
    
    return {
      pid: proc.pid,
      platform: this.platform,
      startedAt,
      sessionId,
      stdout: this.streamToAsyncIterable(proc.stdout),
      stderr: this.streamToAsyncIterable(proc.stderr),
      waitForExit: () => this.waitForExit(proc, sessionId, startedAt, request),
    };
  }
  
  /**
   * Gracefully terminate process (SIGTERM).
   */
  async terminateProcess(pid: number): Promise<void> {
    const proc = this.processes.get(pid);
    if (proc) {
      console.log(`[${this.platform}] Terminating process ${pid} (SIGTERM)`);
      proc.kill('SIGTERM');
    }
  }
  
  /**
   * Force kill process (SIGKILL).
   */
  async forceKillProcess(pid: number): Promise<void> {
    const proc = this.processes.get(pid);
    if (proc) {
      console.log(`[${this.platform}] Force killing process ${pid} (SIGKILL)`);
      proc.kill('SIGKILL');
    }
  }
  
  /**
   * Check if the CLI is available.
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.getVersion();
      return true;
    } catch {
      return false;
    }
  }
  
  // Abstract methods for platform-specific implementation
  abstract getCommand(): string;
  abstract buildArgs(request: ExecutionRequest): string[];
  abstract getVersion(): Promise<string>;
  abstract discoverCapabilities(): Promise<PlatformCapabilities>;
  abstract runSmokeTests(): Promise<SmokeTestResult>;
  
  // --- Protected helpers ---
  
  protected generateSessionId(): string {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = now.toISOString().slice(11, 19).replace(/:/g, '-');
    const seq = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `PM-${date}-${time}-${seq}`;
  }
  
  protected async waitForExit(
    proc: ChildProcess,
    sessionId: string,
    startedAt: Date,
    request: ExecutionRequest
  ): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      
      proc.stdout?.on('data', (data) => { stdout += data; });
      proc.stderr?.on('data', (data) => { stderr += data; });
      
      // Timeout handling
      const timeout = setTimeout(() => {
        console.log(`[${this.platform}] Process ${proc.pid} timed out, killing...`);
        proc.kill('SIGKILL');
      }, request.timeout || this.defaultTimeout);
      
      proc.on('close', async (code, signal) => {
        clearTimeout(timeout);
        this.processes.delete(proc.pid!);
        
        const durationMs = Date.now() - startedAt.getTime();
        
        // ADDENDUM (Fix 6): Emit runner:stop event
        await this.eventLogger?.logRunnerStop({
          sessionId,
          platform: this.platform,
          processId: proc.pid!,
          exitCode: code ?? 1,
          durationMs,
          signal: signal ?? undefined,
        });
        
        resolve({
          success: code === 0,
          exitCode: code ?? 1,
          stdout,
          stderr,
          durationMs,
          sessionId,
          processId: proc.pid!,
        });
      });
    });
  }
  
  protected async *streamToAsyncIterable(
    stream: NodeJS.ReadableStream | null
  ): AsyncIterable<string> {
    if (!stream) return;
    
    for await (const chunk of stream) {
      yield chunk.toString();
    }
  }
}
```

**Acceptance Criteria:**
- [ ] `sessionReuseAllowed` is false by default
- [ ] `spawnFreshProcess()` creates new OS process
- [ ] `spawnFreshProcess()` generates unique session ID
- [ ] Process is tracked in `processes` Map
- [ ] `terminateProcess()` sends SIGTERM
- [ ] `forceKillProcess()` sends SIGKILL
- [ ] Emits runner:start and runner:stop events

**Tests:**
```typescript
// src/platforms/base-runner.test.ts
import { describe, test, expect } from 'vitest';
import { BasePlatformRunner } from './base-runner.js';
import { Platform, PlatformCapabilities, SmokeTestResult, ExecutionRequest } from '../types/index.js';

class TestRunner extends BasePlatformRunner {
  readonly platform: Platform = 'cursor';
  getCommand() { return 'echo'; }
  buildArgs() { return ['test']; }
  async getVersion() { return '1.0.0'; }
  async discoverCapabilities(): Promise<PlatformCapabilities> { throw new Error('Not implemented'); }
  async runSmokeTests(): Promise<SmokeTestResult> { throw new Error('Not implemented'); }
}

describe('BasePlatformRunner', () => {
  test('sessionReuseAllowed is false by default', () => {
    const runner = new TestRunner();
    expect(runner.sessionReuseAllowed).toBe(false);
  });
  
  test('spawnFreshProcess creates process with unique session ID', async () => {
    const runner = new TestRunner();
    const proc = await runner.spawnFreshProcess({
      platform: 'cursor',
      prompt: 'test',
      workingDirectory: '.',
      timeout: 5000,
      contextFiles: [],
    });
    
    expect(proc.pid).toBeGreaterThan(0);
    expect(proc.sessionId).toMatch(/^PM-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}-\d{3}$/);
  });
});
```

**🛑 STOP POINT:** Commit: `ralph: 3.1.1 base platform runner`

---

## Phase 5: Logging Infrastructure

### Piece: Event Stream Logger

> **ADDENDUM (Fix 6): Weave-Inspired Event Stream**
> 
> This is the central logging abstraction. All orchestrator components
> emit typed events to this stream. Output is JSONL format.

**File:** `src/logging/event-stream.ts`

```typescript
// src/logging/event-stream.ts
// ADDENDUM (Fix 6): Weave-inspired event stream logger

import { appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import {
  Platform,
  PuppetMasterEvent,
  RunnerStartEvent,
  RunnerStopEvent,
  PromptSentEvent,
  CommandExecutedEvent,
  VerifierResultEvent,
  GitActionEvent,
  ErrorEvent,
  StallDetectedEvent,
} from '../types/index.js';

const LOGS_DIR = '.puppet-master/logs';

/**
 * Event stream logger - writes typed events to JSONL file.
 * Inspired by Codex Weave event patterns.
 * 
 * Usage:
 * - All runner start/stop events
 * - All prompt sends
 * - All command executions
 * - All verifier results
 * - All git actions
 * - All errors and stalls
 */
export class EventStreamLogger {
  private logFile: string;
  private correlationId: string;
  
  constructor(logFile: string = 'events.jsonl', correlationId?: string) {
    this.logFile = join(LOGS_DIR, logFile);
    this.correlationId = correlationId ?? this.generateCorrelationId();
  }
  
  /**
   * Write any event to the stream.
   */
  async emit(event: PuppetMasterEvent): Promise<void> {
    await this.ensureLogDir();
    const line = JSON.stringify(event) + '\n';
    await appendFile(this.logFile, line);
  }
  
  // --- Convenience methods for common events ---
  
  async logRunnerStart(data: Omit<RunnerStartEvent, 'timestamp' | 'eventType' | 'correlationId' | 'freshSpawn'>): Promise<void> {
    await this.emit({
      ...data,
      timestamp: new Date().toISOString(),
      eventType: 'runner:start',
      correlationId: this.correlationId,
      freshSpawn: true, // ALWAYS true per design
    });
  }
  
  async logRunnerStop(data: Omit<RunnerStopEvent, 'timestamp' | 'eventType' | 'correlationId'>): Promise<void> {
    await this.emit({
      ...data,
      timestamp: new Date().toISOString(),
      eventType: 'runner:stop',
      correlationId: this.correlationId,
    });
  }
  
  async logPromptSent(data: Omit<PromptSentEvent, 'timestamp' | 'eventType' | 'correlationId'>): Promise<void> {
    await this.emit({
      ...data,
      timestamp: new Date().toISOString(),
      eventType: 'prompt:sent',
      correlationId: this.correlationId,
    });
  }
  
  async logCommandExecuted(data: Omit<CommandExecutedEvent, 'timestamp' | 'eventType' | 'correlationId'>): Promise<void> {
    await this.emit({
      ...data,
      timestamp: new Date().toISOString(),
      eventType: 'command:executed',
      correlationId: this.correlationId,
    });
  }
  
  async logVerifierResult(data: Omit<VerifierResultEvent, 'timestamp' | 'eventType' | 'correlationId'>): Promise<void> {
    await this.emit({
      ...data,
      timestamp: new Date().toISOString(),
      eventType: 'verifier:result',
      correlationId: this.correlationId,
    });
  }
  
  async logGitAction(data: Omit<GitActionEvent, 'timestamp' | 'eventType' | 'correlationId'>): Promise<void> {
    await this.emit({
      ...data,
      timestamp: new Date().toISOString(),
      eventType: 'git:action',
      correlationId: this.correlationId,
    });
  }
  
  async logError(data: Omit<ErrorEvent, 'timestamp' | 'eventType' | 'correlationId'>): Promise<void> {
    await this.emit({
      ...data,
      timestamp: new Date().toISOString(),
      eventType: 'error',
      correlationId: this.correlationId,
    });
  }
  
  async logStallDetected(data: Omit<StallDetectedEvent, 'timestamp' | 'eventType' | 'correlationId'>): Promise<void> {
    await this.emit({
      ...data,
      timestamp: new Date().toISOString(),
      eventType: 'stall:detected',
      correlationId: this.correlationId,
    });
  }
  
  // --- Helpers ---
  
  private generateCorrelationId(): string {
    return `corr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
  
  private async ensureLogDir(): Promise<void> {
    if (!existsSync(LOGS_DIR)) {
      await mkdir(LOGS_DIR, { recursive: true });
    }
  }
}

// Singleton for convenience
export const eventStream = new EventStreamLogger();
```

**Acceptance Criteria:**
- [ ] Writes events to `.puppet-master/logs/events.jsonl`
- [ ] Each event is a single JSON line
- [ ] All event types are supported
- [ ] `freshSpawn` is always true in runner:start events
- [ ] Correlation ID links related events

**Tests:**
```typescript
// src/logging/event-stream.test.ts
import { describe, test, expect } from 'vitest';
import { EventStreamLogger } from './event-stream.js';

describe('EventStreamLogger', () => {
  test('logRunnerStart sets freshSpawn to true', async () => {
    const logger = new EventStreamLogger('test-events.jsonl');
    // Would test that freshSpawn is always true in output
  });
});
```

**🛑 STOP POINT:** Commit: `ralph: event stream logger`

---

### Piece: Activity Logger

**File:** `src/logging/activity-logger.ts`

```typescript
// src/logging/activity-logger.ts

import { appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const LOGS_DIR = '.puppet-master/logs';

export interface ActivityLogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: string;
  message: string;
  sessionId?: string;
  itemId?: string;
  platform?: string;
  data?: Record<string, unknown>;
}

export class ActivityLogger {
  private logFile: string;
  
  constructor(logFile: string = 'activity.log') {
    this.logFile = join(LOGS_DIR, logFile);
  }
  
  async log(entry: Omit<ActivityLogEntry, 'timestamp'>): Promise<void> {
    await this.ensureLogDir();
    
    const fullEntry: ActivityLogEntry = {
      timestamp: new Date().toISOString(),
      ...entry,
    };
    
    const line = JSON.stringify(fullEntry) + '\n';
    await appendFile(this.logFile, line);
  }
  
  async info(category: string, message: string, data?: Record<string, unknown>): Promise<void> {
    await this.log({ level: 'info', category, message, data });
  }
  
  async warn(category: string, message: string, data?: Record<string, unknown>): Promise<void> {
    await this.log({ level: 'warn', category, message, data });
  }
  
  async error(category: string, message: string, data?: Record<string, unknown>): Promise<void> {
    await this.log({ level: 'error', category, message, data });
  }
  
  async logIterationStart(sessionId: string, itemId: string, platform: string): Promise<void> {
    await this.log({
      level: 'info',
      category: 'iteration',
      message: 'Iteration started',
      sessionId,
      itemId,
      platform,
    });
  }
  
  async logIterationEnd(
    sessionId: string,
    itemId: string,
    platform: string,
    success: boolean,
    durationMs: number
  ): Promise<void> {
    await this.log({
      level: success ? 'info' : 'warn',
      category: 'iteration',
      message: success ? 'Iteration succeeded' : 'Iteration failed',
      sessionId,
      itemId,
      platform,
      data: { success, durationMs },
    });
  }
  
  private async ensureLogDir(): Promise<void> {
    if (!existsSync(LOGS_DIR)) {
      await mkdir(LOGS_DIR, { recursive: true });
    }
  }
}

// Singleton for convenience
export const activityLogger = new ActivityLogger();
```

**Acceptance Criteria:**
- [ ] Logs written to `.puppet-master/logs/activity.log`
- [ ] Each log entry is a single JSON line
- [ ] Includes timestamp, level, category, message
- [ ] `logIterationStart` and `logIterationEnd` convenience methods work

**Tests:**
```typescript
// src/logging/activity-logger.test.ts
import { describe, test, expect } from 'vitest';
import { ActivityLogger } from './activity-logger.js';

describe('ActivityLogger', () => {
  test('log creates valid JSON entry', async () => {
    const logger = new ActivityLogger('test-activity.log');
    await logger.info('test', 'Test message');
    // Verify file contains valid JSON line
  });
});
```

**🛑 STOP POINT:** Commit: `ralph: activity logger`

---

### Piece: Iteration Logger

**File:** `src/logging/iteration-logger.ts`

```typescript
// src/logging/iteration-logger.ts

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const ITERATIONS_DIR = '.puppet-master/logs/iterations';

export interface IterationLog {
  iteration_id: string;
  subtask_id: string;
  attempt_number: number;
  
  started_at: string;
  completed_at: string;
  duration_ms: number;
  
  execution: {
    platform: string;
    model: string;
    process_id: number;
    fresh_spawn: boolean;
    session_resumed: boolean;
    exit_code: number;
    session_id: string;
  };
  
  context_provided: {
    progress_entries: number;
    agents_files: string[];
    plan_file: string;
  };
  
  prompt: {
    template: string;
    variables: Record<string, string>;
    rendered_length: number;
  };
  
  output: {
    stdout_length: number;
    stderr_length: number;
    completion_signal_found: boolean;
    gutter_signal_found: boolean;
  };
  
  verification: {
    tests_run: Array<{ command: string; passed: boolean; duration_ms: number }>;
    acceptance_checks: Array<{ criterion: string; passed: boolean }>;
  };
  
  result: {
    success: boolean;
    escalated: boolean;
    escalation_reason?: string;
  };
}

export class IterationLogger {
  async logIteration(log: IterationLog): Promise<string> {
    await this.ensureIterationsDir();
    
    const filename = `${log.iteration_id}.json`;
    const filepath = join(ITERATIONS_DIR, filename);
    
    await writeFile(filepath, JSON.stringify(log, null, 2));
    
    return filepath;
  }
  
  /**
   * Create a fresh iteration log template.
   * CRITICAL: fresh_spawn MUST be true, session_resumed MUST be false.
   */
  createTemplate(
    subtaskId: string,
    attemptNumber: number,
    platform: string,
    sessionId: string
  ): Partial<IterationLog> {
    return {
      iteration_id: `${subtaskId}-iter-${String(attemptNumber).padStart(3, '0')}`,
      subtask_id: subtaskId,
      attempt_number: attemptNumber,
      started_at: new Date().toISOString(),
      execution: {
        platform,
        model: '',
        process_id: 0,
        fresh_spawn: true,      // CRITICAL: Always true
        session_resumed: false, // CRITICAL: Always false
        exit_code: 0,
        session_id: sessionId,
      },
      context_provided: {
        progress_entries: 0,
        agents_files: [],
        plan_file: '',
      },
      prompt: {
        template: '',
        variables: {},
        rendered_length: 0,
      },
      output: {
        stdout_length: 0,
        stderr_length: 0,
        completion_signal_found: false,
        gutter_signal_found: false,
      },
      verification: {
        tests_run: [],
        acceptance_checks: [],
      },
      result: {
        success: false,
        escalated: false,
      },
    };
  }
  
  private async ensureIterationsDir(): Promise<void> {
    if (!existsSync(ITERATIONS_DIR)) {
      await mkdir(ITERATIONS_DIR, { recursive: true });
    }
  }
}

export const iterationLogger = new IterationLogger();
```

**Acceptance Criteria:**
- [ ] Logs written to `.puppet-master/logs/iterations/<id>.json`
- [ ] `fresh_spawn` is always true in template
- [ ] `session_resumed` is always false in template
- [ ] Full iteration details captured

**Tests:**
```typescript
// src/logging/iteration-logger.test.ts
import { describe, test, expect } from 'vitest';
import { IterationLogger } from './iteration-logger.js';

describe('IterationLogger', () => {
  test('createTemplate enforces fresh spawn', () => {
    const logger = new IterationLogger();
    const template = logger.createTemplate('ST-001', 1, 'cursor', 'PM-xxx');
    
    expect(template.execution?.fresh_spawn).toBe(true);
    expect(template.execution?.session_resumed).toBe(false);
  });
});
```

**🛑 STOP POINT:** Commit: `ralph: iteration logger`

---

## Summary: First Implementation Pass

| Piece | File | Status |
|-------|------|--------|
| 1.1.1 | Project scaffolding | 🔲 |
| 1.1.4 | Directory structure | 🔲 |
| 1.2.1 | Config types | 🔲 |
| - | Types barrel export | 🔲 |
| - | Platform types | 🔲 |
| - | Event stream types | 🔲 |
| 3.5.1 | CapabilityDiscoveryService | 🔲 |
| 7.1.1 | Doctor class | 🔲 |
| 3.1.1 | BasePlatformRunner | 🔲 |
| - | EventStreamLogger | 🔲 |
| - | ActivityLogger | 🔲 |
| - | IterationLogger | 🔲 |

**Total: 12 pieces**

---

## Scope Boundaries (DO NOT EXCEED)

### ✅ In Scope for This Phase
- Project setup and build system
- Core type definitions (including event stream types)
- Doctor command + capability discovery (smoke-test authoritative)
- Base platform runner contract
- Activity, iteration, and event stream logging

### ❌ NOT in Scope (Future Phases)
- Orchestrator state machine
- Tier state management
- GUI server/frontend
- Start Chain pipeline
- PRD manager
- Git integration
- Browser verification
- Full platform runners (Cursor/Codex/Claude)

---

## Verification Commands

After completing all pieces:

```bash
# Build
npm run build

# Type check
npm run typecheck

# Run tests
npm run test

# Lint
npm run lint

# Run doctor (manual test)
npx tsx src/cli/doctor-cmd.ts
```

**Expected outputs:**
- `dist/` directory with compiled JS
- `.puppet-master/capabilities/capabilities.json`
- `.puppet-master/capabilities/discovery-report.md`
- `.puppet-master/capabilities/smoke-test-<platform>.log` (per required platform)
- `.puppet-master/logs/activity.log`
- `.puppet-master/logs/events.jsonl`

---

## Next Phase Preview

After this phase completes, the next PROMPT_NEXT.md will cover:
- CursorRunner, CodexRunner, ClaudeCodeRunner implementations
- ProgressManager (progress.txt handling)
- AgentsManager (AGENTS.md handling with multi-level support)
- Basic orchestrator skeleton

---

*End of PROMPT_NEXT.md*

---

## ADDENDUM: Fix ESM Type/Value Import/Export (Fix A)

TypeScript types are compile-time only and cannot be exported/imported as runtime values in ESM.
Use `export type { ... }` for type-only exports, and regular `export { ... }` for runtime values.

### UPDATED FILE: src/types/index.ts

Use this version instead of the earlier `src/types/index.ts` block. **(Latest ADDENDUM wins.)**
```typescript
// src/types/index.ts
// Barrel export for types + runtime values. ESM-safe.

// Config types (type-only exports)
export type {
  Platform,
  TierConfig,
  BudgetConfig,
  BranchConfig,
  PuppetMasterConfig,
} from './config.js';

// Config runtime values (actual exports)
export { DEFAULT_CONFIG, getRequiredPlatforms, isPlatformRequired } from './config.js';

// Platform types (type-only exports)
export type {
  PlatformCapabilities,
  SmokeTestResult,
  SmokeTest,
  ExecutionRequest,
  ExecutionResult,
  PlatformRunnerContract,
  RunningProcess,
  CombinedCapabilities,
  CapabilityStatus,
} from './platforms.js';

// Event types (type-only exports)
export type {
  EventType,
  BaseEvent,
  RunnerStartEvent,
  RunnerStopEvent,
  RunnerOutputEvent,
  PromptSentEvent,
  CommandExecutedEvent,
  VerifierStartEvent,
  VerifierResultEvent,
  GitActionEvent,
  ErrorEvent,
  StallDetectedEvent,
  EscalationEvent,
  BudgetWarningEvent,
  BudgetExceededEvent,
  PuppetMasterEvent,
} from './events.js';

// Verifier types (type-only exports) - see ADDENDUM Fix E
export type {
  VerifierType,
  VerifierConfig,
  VerifierResult,
} from './verifiers.js';
```

### UPDATED FILE: src/types/platforms.ts

Use this version instead of the earlier `src/types/platforms.ts` block. **(Latest ADDENDUM wins.)**

The key change: use `import type` for Platform since it's type-only.

```typescript
// src/types/platforms.ts

// Use `import type` for type-only imports (ESM-safe)
import type { Platform } from './config.js';

// Re-export Platform as a TYPE (not a runtime value)
export type { Platform };

/**
 * Capability matrix populated by Doctor/Discovery at runtime.
 * DEFAULT VALUES ARE PLACEHOLDERS until discovery runs.
 * 
 * ADDENDUM (Fix 4): Capabilities are ONLY confirmed by smoke tests.
 * The `helpHints` field contains weak signals from --help parsing.
 * The `verified` field indicates smoke test confirmation.
 */
export interface PlatformCapabilities {
  platform: Platform;
  version: string;
  discoveredAt: string;
  
  capabilities: {
    nonInteractive: CapabilityStatus;
    modelSelection: CapabilityStatus;
    streaming: 'full' | 'partial' | 'none';
    sessionResume: CapabilityStatus;
    mcpSupport: CapabilityStatus;
    maxTurns: CapabilityStatus;
    outputFormats: string[];
  };
  
  invocation: {
    command: string;
    nonInteractiveFlag: string;
    modelFlag: string;
    workingDirFlag?: string;
  };
  
  exitCodes: {
    success: number;
    failure: number[];
  };
  
  availableModels: string[];
  
  smokeTest: SmokeTestResult | null;
  
  /**
   * ADDENDUM (Fix 4): Help parsing hints (weak signal only)
   */
  helpHints?: {
    rawHelpOutput: string;
    detectedFlags: string[];
    parseTimestamp: string;
  };
}

/**
 * ADDENDUM (Fix 4): Capability verification status
 * - 'verified': Smoke test confirmed this capability works
 * - 'unverified': Help output suggests capability but no smoke test
 * - 'absent': Capability not detected or smoke test failed
 */
export interface CapabilityStatus {
  available: boolean;
  verified: boolean;
  verifiedAt?: string;
  verificationMethod?: 'smoke_test' | 'help_hint';
  evidence?: string;
}

export interface SmokeTestResult {
  passed: boolean;
  tests: SmokeTest[];
  totalDurationMs: number;
}

export interface SmokeTest {
  name: string;
  passed: boolean;
  durationMs: number;
  output?: string;
  error?: string;
  /**
   * ADDENDUM (Fix 4): What capability this test verifies
   */
  verifiesCapability?: string;
}

export interface ExecutionRequest {
  platform: Platform;
  prompt: string;
  model?: string;
  workingDirectory: string;
  timeout: number;
  contextFiles: string[];
}

export interface ExecutionResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  sessionId: string;
  processId: number;
}

/**
 * Runner contract: every platform runner MUST implement this.
 * Critical: spawnFreshProcess MUST create a NEW process (fresh agent).
 */
export interface PlatformRunnerContract {
  readonly platform: Platform;
  readonly sessionReuseAllowed: boolean; // MUST be false by default
  readonly defaultTimeout: number;
  readonly hardTimeout: number;
  
  // Core execution - MUST spawn fresh process
  spawnFreshProcess(request: ExecutionRequest): Promise<RunningProcess>;
  
  // Process lifecycle
  terminateProcess(pid: number): Promise<void>;
  forceKillProcess(pid: number): Promise<void>;
  
  // Capability discovery
  discoverCapabilities(): Promise<PlatformCapabilities>;
  runSmokeTests(): Promise<SmokeTestResult>;
  
  // Validation
  isAvailable(): Promise<boolean>;
  getVersion(): Promise<string>;
}

export interface RunningProcess {
  pid: number;
  platform: Platform;
  startedAt: Date;
  sessionId: string;
  stdout: AsyncIterable<string>;
  stderr: AsyncIterable<string>;
  waitForExit(): Promise<ExecutionResult>;
}

/**
 * Combined capability matrix for all platforms.
 * This is the AUTHORITATIVE source of truth.
 * Orchestrator MUST refuse to start if this is missing/stale.
 * 
 * ADDENDUM (Fix 5): Only required platforms must pass validation.
 */
export interface CombinedCapabilities {
  generatedAt: string;
  generatedBy: string;
  stalenessThresholdHours: number;
  
  /**
   * ADDENDUM (Fix 5): Platforms that were required for this run
   */
  requiredPlatforms: Platform[];
  
  platforms: {
    cursor?: PlatformCapabilities;
    codex?: PlatformCapabilities;
    claude?: PlatformCapabilities;
  };
  
  validation: {
    allRequiredPlatformsAvailable: boolean;
    allSmokeTestsPassed: boolean;
    readyForExecution: boolean;
    issues: string[];
  };
}
```

### UPDATED FILE: src/types/events.ts

Use this version instead of the earlier `src/types/events.ts` block. **(Latest ADDENDUM wins.)**

```typescript
// src/types/events.ts
// ADDENDUM (Fix 6): Weave-inspired event stream types
// ADDENDUM (Fix A): Use `import type` for ESM safety

import type { Platform } from './config.js';

/**
 * Event types for the JSONL event stream.
 * All orchestrator activity is logged as typed events.
 */
export type EventType =
  | 'runner:start'
  | 'runner:stop'
  | 'runner:output'
  | 'prompt:sent'
  | 'command:executed'
  | 'verifier:start'
  | 'verifier:result'
  | 'git:action'
  | 'error'
  | 'stall:detected'
  | 'escalation'
  | 'budget:warning'
  | 'budget:exceeded';

/**
 * Base event structure - all events extend this.
 */
export interface BaseEvent {
  timestamp: string;           // ISO 8601
  eventType: EventType;
  sessionId: string;           // PM-YYYY-MM-DD-HH-MM-SS-NNN
  itemId?: string;             // Current work item (phase/task/subtask ID)
  correlationId?: string;      // Links related events
}

/**
 * Runner lifecycle events
 */
export interface RunnerStartEvent extends BaseEvent {
  eventType: 'runner:start';
  platform: Platform;
  processId: number;
  command: string;
  args: string[];
  workingDirectory: string;
  freshSpawn: true;            // ALWAYS true per design
}

export interface RunnerStopEvent extends BaseEvent {
  eventType: 'runner:stop';
  platform: Platform;
  processId: number;
  exitCode: number;
  durationMs: number;
  signal?: string;             // If killed by signal
}

export interface RunnerOutputEvent extends BaseEvent {
  eventType: 'runner:output';
  platform: Platform;
  processId: number;
  stream: 'stdout' | 'stderr';
  chunk: string;
  byteOffset: number;
}

/**
 * Prompt events
 */
export interface PromptSentEvent extends BaseEvent {
  eventType: 'prompt:sent';
  platform: Platform;
  promptTemplate: string;
  promptLength: number;
  contextFilesIncluded: string[];
  model?: string;
}

/**
 * Command execution events (tools/shell commands run by agent)
 */
export interface CommandExecutedEvent extends BaseEvent {
  eventType: 'command:executed';
  command: string;
  args: string[];
  exitCode: number;
  durationMs: number;
  truncatedOutput?: string;
}

/**
 * Verifier events
 */
export interface VerifierStartEvent extends BaseEvent {
  eventType: 'verifier:start';
  verifierType: string;
  verifierId: string;
}

export interface VerifierResultEvent extends BaseEvent {
  eventType: 'verifier:result';
  verifierType: string;
  verifierId: string;
  passed: boolean;
  durationMs: number;
  details?: Record<string, unknown>;
}

/**
 * Git action events
 */
export interface GitActionEvent extends BaseEvent {
  eventType: 'git:action';
  action: 'commit' | 'push' | 'branch' | 'merge' | 'pr';
  ref?: string;
  commitSha?: string;
  branch?: string;
  prNumber?: number;
  success: boolean;
  error?: string;
}

/**
 * Error events
 */
export interface ErrorEvent extends BaseEvent {
  eventType: 'error';
  errorCode: string;
  message: string;
  stack?: string;
  recoverable: boolean;
  platform?: Platform;
}

/**
 * Stall detection events
 */
export interface StallDetectedEvent extends BaseEvent {
  eventType: 'stall:detected';
  platform: Platform;
  processId: number;
  stallType: 'no_output' | 'identical_output' | 'hard_timeout';
  stallDurationMs: number;
  action: 'kill_and_retry' | 'escalate' | 'pause';
}

/**
 * Escalation events
 */
export interface EscalationEvent extends BaseEvent {
  eventType: 'escalation';
  fromTier: 'iteration' | 'subtask' | 'task' | 'phase';
  toTier: 'subtask' | 'task' | 'phase';
  reason: string;
  itemId: string;
  attemptNumber: number;
}

/**
 * Budget events
 */
export interface BudgetWarningEvent extends BaseEvent {
  eventType: 'budget:warning';
  platform: Platform;
  budgetType: 'per_run' | 'per_hour' | 'per_day';
  currentUsage: number;
  limit: number;
  percentUsed: number;
}

export interface BudgetExceededEvent extends BaseEvent {
  eventType: 'budget:exceeded';
  platform: Platform;
  budgetType: 'per_run' | 'per_hour' | 'per_day';
  action: 'fallback' | 'pause' | 'queue';
  fallbackPlatform?: Platform;
}

/**
 * Union type of all events
 */
export type PuppetMasterEvent =
  | RunnerStartEvent
  | RunnerStopEvent
  | RunnerOutputEvent
  | PromptSentEvent
  | CommandExecutedEvent
  | VerifierStartEvent
  | VerifierResultEvent
  | GitActionEvent
  | ErrorEvent
  | StallDetectedEvent
  | EscalationEvent
  | BudgetWarningEvent
  | BudgetExceededEvent;
```

---

## ADDENDUM: Fix Codex Smoke Tests to be Prompt-Based (Fix B)

The earlier smoke test definitions for Codex used shell `echo` commands, which don't actually
test the LLM prompt capability. This fixes them to be prompt-based and authoritative.

Per ARCHITECTURE.md, Codex invocation is `codex exec "prompt"` with optional `--model <model>`.

### UPDATED SMOKE_TEST_DEFINITIONS (Codex section only)

Replace the `codex:` section in `SMOKE_TEST_DEFINITIONS` with: **(Latest ADDENDUM wins.)**

```typescript
  codex: [
    {
      name: 'version',
      verifiesCapability: 'basic_invocation',
      buildCommand: (cli) => ({ cmd: cli, args: ['--version'] }),
      validateOutput: (stdout, _stderr, code) => code === 0 && stdout.length > 0,
      timeout: 10000,
    },
    {
      name: 'non_interactive',
      verifiesCapability: 'nonInteractive',
      // FIXED: Use actual prompt, not shell echo
      buildCommand: (cli) => ({ cmd: cli, args: ['exec', 'respond with exactly: SMOKE_TEST_OK'] }),
      validateOutput: (stdout, _stderr, code) => code === 0 && stdout.includes('SMOKE_TEST_OK'),
      timeout: 120000, // Increased timeout for LLM response
    },
    {
      name: 'model_selection',
      verifiesCapability: 'modelSelection',
      // FIXED: Use actual prompt with model flag
      buildCommand: (cli) => ({ cmd: cli, args: ['exec', '--model', 'o3', 'respond with exactly: MODEL_TEST_OK'] }),
      validateOutput: (stdout, _stderr, code) => code === 0 && stdout.includes('MODEL_TEST_OK'),
      timeout: 120000,
    },
  ],
```

### Updated Smoke Test Table

Replace the earlier smoke test table with: **(Latest ADDENDUM wins.)**

| Platform | Test Name | Command | Pass Criteria |
|----------|-----------|---------|---------------|
| cursor | version | `cursor-agent --version` | Exit 0, outputs version |
| cursor | non_interactive | `cursor-agent -p "respond with exactly: SMOKE_TEST_OK"` | Exit 0, output contains SMOKE_TEST_OK |
| cursor | model_selection | `cursor-agent --model auto -p "respond with exactly: MODEL_TEST_OK"` | Exit 0, output contains MODEL_TEST_OK |
| codex | version | `codex --version` | Exit 0, outputs version |
| codex | non_interactive | `codex exec "respond with exactly: SMOKE_TEST_OK"` | Exit 0, output contains SMOKE_TEST_OK |
| codex | model_selection | `codex exec --model o3 "respond with exactly: MODEL_TEST_OK"` | Exit 0, output contains MODEL_TEST_OK |
| claude | version | `claude --version` | Exit 0, outputs version |
| claude | non_interactive | `claude -p "respond with exactly: SMOKE_TEST_OK"` | Exit 0, output contains SMOKE_TEST_OK |
| claude | model_selection | `claude --model sonnet-4.5 -p "respond with exactly: MODEL_TEST_OK"` | Exit 0, output contains MODEL_TEST_OK |

---

## ADDENDUM: Fix .gitignore to Track .puppet-master/ (Fix C)

Per STATE_FILES.md, `.puppet-master/` is a tracked directory containing:
- `prd.json` - PRD state
- `capabilities/*.yaml` - Per-platform capability files
- `capabilities/capabilities.json` - Combined capability matrix
- `logs/*.log` - Evidence logs

The earlier `.gitignore` incorrectly ignored `.puppet-master/`. This must be fixed.

### UPDATED FILE: .gitignore

Use this version instead of the earlier `.gitignore` block. **(Latest ADDENDUM wins.)**

```
# Dependencies
node_modules/

# Build output
dist/

# Test coverage
coverage/

# OS files
.DS_Store
Thumbs.db

# Editor files
.vscode/
.idea/
*.swp
*.swo

# Environment
.env
.env.local

# DO NOT ignore .puppet-master/ - it is tracked per STATE_FILES.md
# Do NOT ignore .puppet-master logs (evidence/state); see STATE_FILES.md

# Temporary files
*.tmp
*.temp
```

**Note:** `.puppet-master/` contents—including iteration logs and event streams—are tracked as evidence/state (see STATE_FILES.md). Manage size via log rotation/pruning or archiving runs, not by gitignoring these files.

---

## ADDENDUM: Capability Outputs as YAML + JSON (Fix D)

Per STATE_FILES.md, capability discovery should produce:
- Per-platform YAML files: `.puppet-master/capabilities/<platform>.yaml`
- Combined JSON: `.puppet-master/capabilities/capabilities.json`

The earlier `savePlatformCapabilities` wrote JSON. This fixes it to write YAML.

### UPDATED METHOD: savePlatformCapabilities

Replace the `savePlatformCapabilities` method in `CapabilityDiscoveryService` with: **(Latest ADDENDUM wins.)**

```typescript
  /**
   * Save per-platform capabilities as YAML (per STATE_FILES.md).
   */
  private async savePlatformCapabilities(platform: Platform, caps: PlatformCapabilities): Promise<void> {
    const yaml = this.toYaml(caps);
    await writeFile(
      join(CAPABILITIES_DIR, `${platform}.yaml`),
      yaml
    );
    // Also write JSON for programmatic access
    await writeFile(
      join(CAPABILITIES_DIR, `${platform}.json`),
      JSON.stringify(caps, null, 2)
    );
  }
  
  /**
   * Convert object to YAML format.
   * Note: For production, use a proper YAML library like 'js-yaml'.
   */
  private toYaml(obj: Record<string, unknown>, indent = 0): string {
    const spaces = '  '.repeat(indent);
    let result = '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        result += `${spaces}${key}: null\n`;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        result += `${spaces}${key}:\n${this.toYaml(value as Record<string, unknown>, indent + 1)}`;
      } else if (Array.isArray(value)) {
        result += `${spaces}${key}:\n`;
        for (const item of value) {
          if (typeof item === 'object') {
            result += `${spaces}  -\n${this.toYaml(item as Record<string, unknown>, indent + 2)}`;
          } else {
            result += `${spaces}  - ${JSON.stringify(item)}\n`;
          }
        }
      } else if (typeof value === 'string') {
        // Quote strings that might be problematic
        const needsQuotes = /[:#\[\]{}|>&*!?,]/.test(value) || value.includes('\n');
        result += `${spaces}${key}: ${needsQuotes ? JSON.stringify(value) : value}\n`;
      } else {
        result += `${spaces}${key}: ${value}\n`;
      }
    }
    
    return result;
  }
```

### Updated Expected Outputs

The expected outputs now include both YAML and JSON:
- `.puppet-master/capabilities/cursor.yaml`
- `.puppet-master/capabilities/cursor.json`
- `.puppet-master/capabilities/codex.yaml`
- `.puppet-master/capabilities/codex.json`
- `.puppet-master/capabilities/claude.yaml`
- `.puppet-master/capabilities/claude.json`
- `.puppet-master/capabilities/capabilities.json` (combined)
- `.puppet-master/capabilities/discovery-report.md`

---

## ADDENDUM: Verifier Taxonomy Placeholder (Fix E)

Per REQUIREMENTS.md and ARCHITECTURE.md, the verifier taxonomy includes:
- TEST - Run test commands (npm test, pytest, etc.)
- CLI_VERIFY - Run CLI commands and check exit codes
- BROWSER_VERIFY - Playwright/Puppeteer browser automation
- FILE_VERIFY - Check file existence/contents
- REGEX_VERIFY - Pattern matching on output
- PERF_VERIFY - Performance/timing checks
- MANUAL_VERIFY - Human approval gate
- AI_VERIFY - LLM-based verification

### NEW FILE: src/types/verifiers.ts

Add this file to the directory structure:

```typescript
// src/types/verifiers.ts
// ADDENDUM (Fix E): Verifier taxonomy per REQUIREMENTS.md + ARCHITECTURE.md

/**
 * Verifier types supported by the orchestrator.
 * Each verifier has different execution semantics.
 */
export type VerifierType =
  | 'TEST'           // Run test commands (npm test, pytest, etc.)
  | 'CLI_VERIFY'     // Run CLI commands and check exit codes
  | 'BROWSER_VERIFY' // Playwright/Puppeteer browser automation
  | 'FILE_VERIFY'    // Check file existence/contents
  | 'REGEX_VERIFY'   // Pattern matching on output
  | 'PERF_VERIFY'    // Performance/timing checks
  | 'MANUAL_VERIFY'  // Human approval gate
  | 'AI_VERIFY';     // LLM-based verification

/**
 * Configuration for a single verifier.
 */
export interface VerifierConfig {
  id: string;
  type: VerifierType;
  name: string;
  description?: string;
  
  // Type-specific configuration
  config: TestVerifierConfig | CliVerifierConfig | BrowserVerifierConfig | 
          FileVerifierConfig | RegexVerifierConfig | PerfVerifierConfig |
          ManualVerifierConfig | AiVerifierConfig;
  
  // Execution settings
  timeout?: number;           // ms, default varies by type
  retries?: number;           // default 0
  continueOnFail?: boolean;   // default false
  
  // Dependencies
  dependsOn?: string[];       // Other verifier IDs that must pass first
}

export interface TestVerifierConfig {
  type: 'TEST';
  command: string;            // e.g., "npm test", "pytest tests/"
  workingDirectory?: string;
  env?: Record<string, string>;
  expectedExitCode?: number;  // default 0
}

export interface CliVerifierConfig {
  type: 'CLI_VERIFY';
  command: string;
  args?: string[];
  workingDirectory?: string;
  expectedExitCode?: number;  // default 0
  expectedStdout?: string;    // Substring match
  expectedStderr?: string;    // Substring match
}

export interface BrowserVerifierConfig {
  type: 'BROWSER_VERIFY';
  url: string;
  actions: BrowserAction[];
  assertions: BrowserAssertion[];
  headless?: boolean;         // default true
  browser?: 'chromium' | 'firefox' | 'webkit';
}

export interface BrowserAction {
  action: 'click' | 'fill' | 'select' | 'wait' | 'screenshot';
  selector?: string;
  value?: string;
  timeout?: number;
}

export interface BrowserAssertion {
  type: 'visible' | 'hidden' | 'text' | 'value' | 'url' | 'title';
  selector?: string;
  expected?: string;
  timeout?: number;
}

export interface FileVerifierConfig {
  type: 'FILE_VERIFY';
  path: string;
  exists?: boolean;           // default true
  contains?: string;          // Substring match
  matches?: string;           // Regex pattern
  minSize?: number;           // bytes
  maxSize?: number;           // bytes
}

export interface RegexVerifierConfig {
  type: 'REGEX_VERIFY';
  source: 'stdout' | 'stderr' | 'file';
  filePath?: string;          // Required if source is 'file'
  pattern: string;            // Regex pattern
  flags?: string;             // Regex flags (e.g., 'gi')
  mustMatch?: boolean;        // default true
  captureGroups?: string[];   // Names for capture groups
}

export interface PerfVerifierConfig {
  type: 'PERF_VERIFY';
  metric: 'duration' | 'memory' | 'cpu' | 'custom';
  command?: string;           // Command to measure
  maxDuration?: number;       // ms
  maxMemory?: number;         // bytes
  customMetric?: string;      // For custom metrics
  threshold?: number;         // For custom metrics
}

export interface ManualVerifierConfig {
  type: 'MANUAL_VERIFY';
  prompt: string;             // What to ask the human
  instructions?: string;      // Detailed instructions
  timeout?: number;           // How long to wait for response (ms)
  defaultResponse?: boolean;  // If timeout, assume pass/fail
}

export interface AiVerifierConfig {
  type: 'AI_VERIFY';
  prompt: string;             // Prompt for the AI verifier
  context?: string[];         // Files to include as context
  platform?: 'cursor' | 'codex' | 'claude';  // Which AI to use
  model?: string;
  expectedResponse?: string;  // What the AI should respond with
}

/**
 * Result from running a verifier.
 */
export interface VerifierResult {
  verifierId: string;
  type: VerifierType;
  passed: boolean;
  durationMs: number;
  
  // Type-specific results
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  
  // Error info
  error?: string;
  stack?: string;
  
  // Evidence
  screenshots?: string[];     // Paths to screenshot files
  capturedValues?: Record<string, string>;  // Captured regex groups, etc.
  
  // Metadata
  timestamp: string;
  retryCount: number;
}
```

### Update Directory Structure

Add `src/types/verifiers.ts` to the directory structure commands:

```bash
touch src/types/verifiers.ts
```

### Update Summary Table

Add to the summary table:

| Piece | File | Status |
|-------|------|--------|
| - | Verifier types | 🔲 |

---

## ADDENDUM: Updated Expected Outputs Summary

After completing all pieces with these addendums applied:

**Expected outputs:**
- `dist/` directory with compiled JS
- `.puppet-master/capabilities/capabilities.json` (combined)
- `.puppet-master/capabilities/<platform>.yaml` (per required platform)
- `.puppet-master/capabilities/<platform>.json` (per required platform)
- `.puppet-master/capabilities/discovery-report.md`
- `.puppet-master/capabilities/smoke-test-<platform>.log` (per required platform)
- `.puppet-master/logs/activity.log`
- `.puppet-master/logs/events.jsonl`

**Files tracked in git (per STATE_FILES.md):**
- `.puppet-master/prd.json`
- `.puppet-master/capabilities/*.yaml`
- `.puppet-master/capabilities/*.json`
- `.puppet-master/capabilities/discovery-report.md`
- `.puppet-master/logs/*.log` (smoke test logs)
- `.puppet-master/logs/events.jsonl`
- `.puppet-master/logs/iterations/*.json`

> **Note:** Do NOT gitignore any `.puppet-master/` contents — all state and evidence files are tracked.

---

*End of ADDENDUMs*
