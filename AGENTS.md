# AGENTS.md - RWM Puppet Master
Always use the Context7 MCP.  You need to take your time and be careful as this is something you can mess up easily and cause a lot of issues if you arent careful.
> Long-term memory for AI agents working on this project.
> Updated as patterns emerge and gotchas are discovered.

---

## Project Overview

RWM Puppet Master is a CLI orchestrator implementing the Ralph Wiggum Method - a four-tier hierarchical approach to AI-assisted development. The system coordinates multiple AI CLI platforms (Cursor, Codex, Claude Code) without using APIs, relying exclusively on CLI invocations.

### Key Concepts
- **Four Tiers**: Phase → Task → Subtask → Iteration
- **CLI-Only**: No API calls, only CLI invocations
- **Fresh Agents**: Every iteration spawns a new process
- **Verification Gates**: Automated checks between tiers
- **Memory Layers**: progress.txt (short-term), AGENTS.md (long-term), prd.json (work queue)

---

## Architecture Notes

### Module Responsibilities

| Module | Purpose |
|--------|---------|
| `src/cli/` | CLI entry points and commands |
| `src/core/` | State machines, orchestrator, execution engine |
| `src/platforms/` | Platform runners, capability discovery |
| `src/verification/` | Verifiers, gate runner |
| `src/memory/` | State file managers |
| `src/git/` | Git operations, branch strategies |
| `src/types/` | Type definitions |
| `src/utils/` | Shared utilities |

### State Machine Flow
```
Orchestrator: IDLE → PLANNING → EXECUTING → COMPLETE
                              ↓
Tier:         PENDING → PLANNING → RUNNING → GATING → PASSED
                                     ↓
                                  RETRYING (on failure)
```

### Data Flow
1. Load PRD (prd.json) → Build tier tree
2. Select next pending subtask
3. Build iteration prompt (include progress.txt, AGENTS.md)
4. Spawn fresh agent process
5. Parse output for completion signal
6. Run verification gate
7. Update state files
8. Advance to next item or escalate

---

## Codebase Patterns

### ESM Import Pattern
```typescript
// Always use .js extension for local imports
import { ConfigManager } from './config-manager.js';
import type { Platform } from '../types/index.js';
```

### Type-only Exports in ESM (NodeNext)
When re-exporting types (like `Platform`), use `export type`:
```typescript
// CORRECT - types must use type-only exports
export type { Platform } from './config.js';
import type { Platform } from '../types/index.js';

// WRONG - Platform is NOT a runtime value
export { Platform } from './config.js';
import { Platform } from '../types/index.js';
```

### Barrel Export Pattern
```typescript
// src/types/index.ts
// Use type-only re-exports for type aliases
export type { Platform, TierConfig } from './config.js';
// Use regular re-exports for interfaces, classes, and runtime values
export { ConfigManager } from './config-manager.js';
export * from './state.js';  // OK if state.js has no type-only exports to leak
```

### State Machine Pattern
```typescript
class TierStateMachine {
  send(event: TierEvent): boolean {
    const nextState = getNextTierState(this.state, event.type);
    if (nextState) {
      this.state = nextState;
      this.onTransition?.(event);
      return true;
    }
    return false;
  }
}
```

### Manager Class Pattern
```typescript
class PrdManager {
  constructor(private filePath: string) {}
  
  async load(): Promise<PRD> { /* ... */ }
  async save(prd: PRD): Promise<void> { /* ... */ }
  async updateItemStatus(id: string, status: ItemStatus): Promise<void> { /* ... */ }
}
```

### Verifier Pattern
```typescript
class RegexVerifier implements Verifier {
  readonly type = 'regex';
  
  async verify(criterion: Criterion): Promise<VerifierResult> {
    // Implementation
    return { passed, summary, durationMs };
  }
}
```

---

## Tooling Rules

### Vitest (NOT Jest)
```typescript
// Correct
import { describe, it, expect, vi } from 'vitest';

// Wrong
import { describe, it, expect, jest } from '@jest/globals';
```

### TypeScript Strict Mode
- All `strict` options enabled
- No implicit `any`
- No unused variables (prefix with `_` if intentional)

### ESLint Configuration
- Uses `@typescript-eslint/parser`
- Extends `eslint:recommended` and `plugin:@typescript-eslint/recommended`
- Args ignore pattern: `^_`

### Git Commit Format
```
ralph: [tier/scope] [item-id] [summary]

Examples:
ralph: PH0-T01 initialize TypeScript project
ralph: complete ST-001-001-001 - implement ConfigManager  
ralph: task-gate TK-001-001 - PASS
```

### Gitignore Rules
Do NOT use blanket `*.log` pattern. Evidence logs are tracked!
```gitignore
# CORRECT - specific log patterns
npm-debug.log*
yarn-error.log*
# Evidence logs are tracked - do NOT ignore .puppet-master/

# WRONG - too broad, would ignore evidence logs
*.log
```

## Pre-Completion Verification Checklist

**BEFORE updating the Task Status Log, you MUST verify compliance with ALL rules by checking this checklist:**

1. **ESM Import Patterns** (AGENTS.md: Codebase Patterns, .cursorrules: ESM Import Rules)
   - [ ] All local imports use `.js` extension
   - [ ] Type-only exports use `export type` and `import type`
   - [ ] No runtime imports for type aliases (like Platform)

2. **Module Organization** (AGENTS.md: Architecture Notes, .cursorrules: File Organization)
   - [ ] Files created in correct directories per module responsibilities
   - [ ] Barrel exports follow pattern (type-only for types, regular for runtime values)
   - [ ] Module responsibilities respected

3. **Tooling Rules** (AGENTS.md: Tooling Rules, .cursorrules: Technology Stack)
   - [ ] Using Vitest (NOT Jest patterns)
   - [ ] TypeScript strict mode enabled
   - [ ] ESLint configuration correct
   - [ ] Git commit format followed (if committing)

4. **Testing Requirements** (AGENTS.md: Testing, .cursorrules: Testing Requirements)
   - [ ] Tests written for new code (if applicable)
   - [ ] Test files in correct locations (next to source files)
   - [ ] All required tests pass
   - [ ] `npm run typecheck` passes

5. **Code Patterns** (AGENTS.md: Codebase Patterns, Common Failure Modes)
   - [ ] State machine pattern followed (if applicable)
   - [ ] Manager pattern followed (if applicable)
   - [ ] Verifier pattern followed (if applicable)
   - [ ] No session reuse (fresh processes only, if applicable)
   - [ ] No API calls (CLI only, if applicable)
   - [ ] File locking used for shared files (if applicable)

6. **DO/DON'T Checklist** (AGENTS.md: DO, DON'T)
   - [ ] All DO items followed (check DO section)
   - [ ] All DON'T items avoided (check DON'T section)
   - [ ] No modifications outside task scope
   - [ ] Canonical documents not deleted/simplified
   - [ ] Specific `.log` patterns in gitignore (not blanket `*.log`)

7. **Task-Specific Requirements** (.cursorrules: When Working on Tasks)
   - [ ] Referenced documentation sections read FIRST
   - [ ] Only specified task implemented
   - [ ] Tests run after implementation
   - [ ] Task scope strictly followed

8. **File-Specific Rules** (.cursorrules: Critical Patterns)
   - [ ] Gitignore patterns correct (no blanket `*.log`, evidence logs tracked)
   - [ ] Session ID format correct (if applicable): `PM-YYYY-MM-DD-HH-MM-SS-NNN`
   - [ ] No Thread terminology (use Session if applicable)

9. **Final Verification**
   - [ ] All acceptance criteria met (checkboxes updated in phase file)
   - [ ] All required tests pass
   - [ ] `npm run typecheck` passes (if applicable)
   - [ ] `npm run build` passes (if applicable)
   - [ ] No linter errors (if applicable)

**After completing this checklist, proceed to update the Task Status Log.**

---

### Task Status Log Update Rule
After completing ANY build queue task, you MUST update the Task Status Log in the phase file with:
- Status: PASS or FAIL
- Date: YYYY-MM-DD
- Summary of changes
- Files changed
- Commands run + results
- If FAIL: exact error snippets and what remains

---

## Common Failure Modes

### Import Extension Missing
**Symptom**: `ERR_MODULE_NOT_FOUND` at runtime
**Cause**: Missing `.js` extension in import
**Fix**: Add `.js` to all local imports
```typescript
// Before (fails)
import { foo } from './bar';

// After (works)
import { foo } from './bar.js';
```

### Jest Instead of Vitest
**Symptom**: `jest is not defined` or `require is not defined`
**Cause**: Using Jest patterns in ESM project
**Fix**: Use Vitest imports and patterns
```typescript
// Use vi.fn() not jest.fn()
const mock = vi.fn();
```

### Session Reuse
**Symptom**: Agent behavior inconsistent, context pollution
**Cause**: Reusing sessions instead of fresh spawns
**Fix**: Always spawn new process per iteration
```typescript
// Always use spawn(), never reuse
const process = spawn(command, args);
```

### State File Corruption
**Symptom**: Invalid JSON, missing fields
**Cause**: Concurrent writes without locking
**Fix**: Use file locking for prd.json
```typescript
await withFileLock(prdPath, async () => {
  await prdManager.save(prd);
});
```

---

## DO

- ✅ Use `.js` extension in all local imports
- ✅ Use `import type` and `export type` for type aliases (like Platform)
- ✅ Use Vitest for testing
- ✅ Spawn fresh process for each iteration
- ✅ Use Session ID format `PM-YYYY-MM-DD-HH-MM-SS-NNN`
- ✅ Follow barrel export pattern (type-only for types)
- ✅ Run tests after each change
- ✅ Use discriminated unions for events
- ✅ Save evidence for verification results
- ✅ Use async/await for file operations
- ✅ Follow the task scope exactly
- ✅ Update Task Status Log after completing any task
- ✅ Use specific `.log` patterns in gitignore (not `*.log`)

---

## DON'T

- ❌ Use Jest patterns (`jest.fn()`, `jest.mock()`)
- ❌ Omit `.js` extension in imports
- ❌ Use `import { Platform }` for type aliases (use `import type`)
- ❌ Reuse sessions or processes
- ❌ Use "Thread" terminology (use "Session")
- ❌ Call APIs directly (CLI only)
- ❌ Modify files outside task scope
- ❌ Delete or simplify canonical documents
- ❌ Use `exec()` for process spawning (use `spawn()`)
- ❌ Skip file locking for shared files
- ❌ Ignore test failures
- ❌ Use blanket `*.log` in gitignore (evidence logs are tracked!)
- ❌ Ignore `.puppet-master/` directory in gitignore

---

## Testing

### Unit Test Location
Place tests next to source files:
```
src/
├── config/
│   ├── config-manager.ts
│   └── config-manager.test.ts
```

### Integration Test Location
```
src/
└── __tests__/
    ├── integration.test.ts
    └── fixtures/
        ├── sample-prd.json
        └── sample-config.yaml
```

### Test Commands
```bash
npm test                    # Run all tests
npm test -- -t "pattern"    # Run specific tests
npm run test:coverage       # With coverage
npm run test:watch          # Watch mode
```

### Mocking Pattern
```typescript
import { vi } from 'vitest';

const mockRunner = {
  spawnFreshProcess: vi.fn().mockResolvedValue({
    pid: 12345,
    stdout: createMockStream(),
  }),
};
```

---

## Directory Structure

```
puppet-master/
├── .puppet-master/           # Runtime data
│   ├── capabilities/         # Platform capability cache
│   ├── evidence/             # Verification evidence
│   │   ├── test-logs/
│   │   ├── screenshots/
│   │   ├── browser-traces/
│   │   ├── file-snapshots/
│   │   ├── metrics/
│   │   └── gate-reports/
│   ├── usage/                # Usage tracking
│   │   └── usage.jsonl
│   ├── checkpoints/          # State checkpoints
│   └── logs/                 # Operation logs
├── src/                      # Source code
├── dist/                     # Compiled output
├── progress.txt              # Short-term memory
├── AGENTS.md                 # Long-term memory (this file)
├── prd.json                  # Work queue
├── config.yaml               # Configuration
└── package.json
```

---

## Configuration

### Required Config Sections
```yaml
project:
  name: string
  workingDirectory: string

tiers:
  phase:
    platform: cursor | codex | claude
    model: string
    selfFix: boolean
    maxIterations: number
  task: ...
  subtask: ...
  iteration: ...

branching:
  baseBranch: string
  namingPattern: string
  granularity: single | per-phase | per-task

verification:
  browserAdapter: string
  screenshotOnFailure: boolean
  evidenceDirectory: string

memory:
  progressFile: string
  agentsFile: string
  prdFile: string
  multiLevelAgents: boolean

budgets:
  claude: { maxCallsPerRun, maxCallsPerHour, maxCallsPerDay }
  codex: ...
  cursor: ...
```

---

## Platform CLI Commands

### Cursor
```bash
cursor --non-interactive --model <model> --prompt <prompt>
```

### Codex
```bash
codex --non-interactive --model <model> --approval-mode full-auto
```

### Claude Code
```bash
claude --print --model <model> --output-format stream-json --prompt <prompt>
```

---

## Completion Signals

Agents should emit these signals to indicate status:

```
<ralph>COMPLETE</ralph>  # Task completed successfully
<ralph>GUTTER</ralph>    # Stuck, cannot proceed
```

---

## Version History

| Date | Change |
|------|--------|
| 2026-01-11 | Initial creation for BUILD_QUEUE generation |

---

*This file is automatically updated as patterns emerge. Human review recommended for major changes.*
