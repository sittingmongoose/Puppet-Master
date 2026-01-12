# RWM Puppet Master — REQUIREMENTS.md

> Version: 2.2  
> Status: Design Document  
> Last Updated: 2026-01-10 (Micro-patch: Session rename, Discovery-populated capability matrix)

---

## 1. Executive Summary

**RWM Puppet Master** is a CLI orchestrator that scales the Ralph Wiggum Method (RWM) into a four-tier workflow: Phase → Task → Subtask → Iteration. It coordinates multiple AI CLI platforms (Cursor, Codex, Claude Code) without using any APIs, relying exclusively on CLI invocations. The system spawns fresh agents per iteration, uses file-based memory layers (`prd.json`, `progress.txt`, `AGENTS.md`) plus git as durable state, and provides both a browser GUI and CLI interface for control.

### Core Principles (from RWM)

1. **Small, testable work units** with tight acceptance criteria
2. **Iteration loops** that retry until acceptance + tests pass
3. **Fresh agent per iteration** (new context, no drift)
4. **File-based memory** (progress.txt, AGENTS.md, structured queue, git)
5. **Verification gates** at every tier

---

## 2. Terminology

### Building Puppet Master (this codebase)

| Term | Definition |
|------|------------|
| **Block** | Major deliverable group (e.g., "State Machine", "GUI") |
| **Chunk** | Medium-sized unit within a Block |
| **Piece** | Smallest implementation unit with acceptance criteria |

### Running Puppet Master (target projects)

| Term | Definition |
|------|------------|
| **Phase** | Highest-level grouping of work (e.g., "Authentication System") |
| **Task** | Integration-level work within a Phase (e.g., "JWT Middleware") |
| **Subtask** | RWM-sized ticket (~1 context window) |
| **Iteration** | Single fresh-agent attempt at a Subtask |

---

## 3. Platform & Model Architecture

### 3.1 Supported Platforms

| Platform | CLI Command | Notes |
|----------|-------------|-------|
| Cursor | `cursor-agent` | Cheap/unlimited via Auto plan; supports Grok Code |
| Codex | `codex` | Higher limits than Claude; AGENTS.md native |
| Claude Code | `claude` | Tight limits (1-4 prompts then 5h cooldown); use sparingly |

### 3.2 Platform vs Model Distinction

**Platform** = the CLI tool (Cursor, Codex, Claude Code)  
**Model** = the underlying LLM (e.g., opus-4.5, sonnet-4.5-thinking, gpt-5.2-high, grok-code)

Configuration MUST allow specifying BOTH independently per tier.

### 3.3 Tier Pipeline Configuration

The tier pipeline is **fully user-configurable**. There is NO hardcoded ladder.

**Supported configurations include:**
- Claude Code → Codex → Cursor → Codex
- Codex → Claude Code → Codex → Cursor
- Codex → Codex → Cursor → Cursor
- Cursor → Cursor → Codex → Cursor

**Per-tier configuration:**
- Platform selection
- Model selection (platform-dependent options)
- Self-fix permission (can tier fix small issues itself?)
- Iteration/retry limits
- Escalation behavior (which tier to escalate to)
- Planning pass style (optional)

---

## 4. Constraint: No APIs

**CRITICAL**: RWM Puppet Master MUST NOT use:
- OpenAI API
- Anthropic API
- Any direct LLM API calls

All agent interactions happen via CLI invocations only:
- `cursor-agent "prompt" [flags]`
- `codex "prompt" [flags]`
- `claude -p "prompt" [flags]`

---

## 5. Tier 0: Start Chain Pipeline

Before execution begins, Puppet Master MUST support a complete "Start Chain" workflow.

### 5.1 Start Chain Steps

1. **Ingest Requirements Document**
   - Accept: md, pdf, txt, docx
   - Store canonical copy in `.puppet-master/requirements/`
   - Optionally generate normalized markdown

2. **Generate Structured PRD / Work Queue**
   - Convert requirements into machine-readable format
   - Output: `.puppet-master/prd.json`
   - Schema: phases, tasks, subtasks with acceptance criteria, tests, pass status

3. **Generate Target Project Architecture Document**
   - Synthesize architecture from requirements
   - Output: `.puppet-master/architecture.md`
   - NOT the Puppet Master architecture—the TARGET project architecture

4. **Generate 4-Tier Plan**
   - Phases with acceptance criteria + test plans
   - Tasks within phases with acceptance criteria + tests
   - Subtasks per task (RWM-sized)
   - Iteration rules defined

5. **Validation Gate**
   - Human review option before execution starts
   - Plan can be edited/adjusted

### 5.2 Start Chain Interface Requirements

**CLI:**
```bash
puppet-master init <requirements-file> [--output-dir <path>]
puppet-master plan [--from-prd <path>]
puppet-master validate
puppet-master start [--phase <id>] [--task <id>]
```

**GUI:**
- File upload for requirements
- Step-through wizard for Start Chain
- Preview/edit generated artifacts
- "Start Execution" button

---

## 6. Four-Tier Orchestration Requirements

### 6.1 Phase Tier

**When a Phase is created, generate:**
- Phase Plan (scope, assumptions, dependencies, definition of done)
- Phase Acceptance Criteria (explicit, testable)
- Phase Test Plan / Verification Plan
- Task list for this phase (Task stubs)
- Evidence schema + evidence storage paths

**Gating:**
- Phase CANNOT be marked complete until:
  - Phase acceptance criteria verified (evidence recorded)
  - Phase test plan passes (evidence recorded)
  - All Tasks within Phase complete

### 6.2 Task Tier

**When a Task is created, generate:**
- Task Plan (approach, dependencies, integration notes)
- Task Acceptance Criteria
- Task Test Plan (integration-level where applicable)
- Subtask breakdown list (RWM-sized)
- Evidence schema + evidence storage paths

**Gating:**
- Task complete only when:
  - Task acceptance criteria verified (evidence recorded)
  - Task tests pass (evidence recorded)
  - All Subtasks complete with evidence

**Task-tier failure handling:**
1. **Self-fix** (small patch): If failure is local/minor, Task-tier platform fixes directly
2. **Kick down**: Spawn new/reopened Subtasks for Subtask-tier to handle
3. **Escalate**: Flag "re-plan required" and escalate to Phase tier

### 6.3 Subtask Tier

**When a Subtask is created, generate:**
- Subtask Plan (fits context window)
- Subtask Acceptance Criteria (tight)
- Subtask Test Plan (unit/integration/e2e as appropriate)
- Evidence schema + evidence storage paths

**Gating:**
- Subtask complete only when:
  - Acceptance criteria verified (evidence recorded)
  - Tests pass (evidence recorded)

### 6.4 Iteration Tier

**Each Iteration MUST:**
1. Spawn a FRESH agent process (new context)
2. Read state files:
   - Structured queue (prd.json / work items)
   - `progress.txt` (short-term memory)
   - `AGENTS.md` (long-term memory)
   - Relevant tier plans
3. Attempt ONLY the current subtask scope
4. Run verification + tests for that subtask
5. Update memory layers:
   - Append to `progress.txt`
   - Update `AGENTS.md` for reusable lessons
6. Commit changes to git (configurable policy)

**Exit rules:**
- If acceptance NOT met OR tests fail: DO NOT advance; spawn new attempt
- Only when BOTH pass: mark story `pass=true` and advance

---

## 7. Auto-Progression Requirements

Puppet Master operates as a **tiered autonomous workflow manager**.

### 7.1 Automatic Advancement Rules

1. **Subtask → Task**: When all Subtasks complete, Task-tier runs gate review
2. **Task → Phase**: When all Tasks complete, Phase-tier runs gate review
3. **Phase → Next Phase**: When Phase gate passes, advance to next Phase

### 7.2 Gate Review Process

At each gate (Task, Phase), the assigned platform MUST:
1. Read all lower-tier artifacts (plans, evidence, changed files, logs)
2. Re-run tier-level test plan
3. Verify tier-level acceptance criteria
4. Record consolidated evidence in Gate Report
5. Update memory (progress.txt, AGENTS.md if applicable)
6. Commit to git per configured policy

### 7.3 Failure Handling at Gates

**If gate fails, three options:**
1. **Self-fix** (if permitted and failure is minor)
2. **Kick down** (spawn/reopen lower-tier items with precise instructions)
3. **Escalate** (flag for higher-tier re-planning)

---

## 8. Acceptance Criteria vs Tests

**Acceptance Criteria:**
- Product truth, UX/behavior constraints
- May include manual or browser verification
- Example: "Filter dropdown shows All, Active, Completed options"

**Tests:**
- Executable evidence
- Unit/integration/e2e, typecheck, lint, build, scripted checks
- Example: `npm test passes`, `npm run typecheck passes`

**Requirements:**
- Generate BOTH where appropriate
- Run BOTH (where configured)
- Record evidence for BOTH
- Gate progression on BOTH

---

## 9. Memory Layer Requirements

### 9.1 Short-Term Memory: `progress.txt`

- Append-only log of what happened
- What was accomplished, what failed, what to try next
- Updated after every iteration
- Location: `.puppet-master/progress.txt` (Puppet Master state) + target project root

### 9.2 Long-Term Memory: `AGENTS.md`

- Reusable patterns, conventions, lessons learned
- Architecture notes, gotchas, recurring pitfalls
- Updated when genuinely reusable knowledge is discovered
- Location: `<project-root>/AGENTS.md` + optional subdirectory files

### 9.3 Structured Queue: `prd.json`

- Machine-readable work queue
- Contains all phases, tasks, subtasks with status
- Updated after each iteration/gate
- Location: `.puppet-master/prd.json`

### 9.4 Git as Memory

- All commits with structured messages
- Enables rollback, audit, and history review
- Branch per configured strategy

---

## 10. Browser Verification Requirements

### 10.1 Browser Adapter Layer

Puppet Master must support browser-based verification through an adapter layer.

**Primary adapter:** amp-skills dev-browser
- Playwright-based
- Persistent sessions
- ARIA snapshots for AI verification

**Fallback adapters:**
- playwright-mcp
- browser-use-cli

### 10.2 Browser Verification Syntax

Acceptance criteria may include tokens:
- `BROWSER_VERIFY:<scenario-name>`
- Example: `BROWSER_VERIFY:login-success`

Puppet Master maps these to the configured browser adapter.

---

## 11. Operation Modes

### 11.1 New Build Mode

Full Start Chain: Requirements → PRD → Architecture → Plan → Execute

### 11.2 Change Request Mode

- Start from existing repo
- Create/update task/subtask queue
- Run iterations until acceptance + tests pass

### 11.3 Bugfix Mode

- Capture repro steps
- Define expected behavior
- Add tests where possible
- Fix, verify, commit

### 11.4 Re-plan Mode

- Adjust upcoming phases/tasks/subtasks
- Record plan changes in AGENTS/progress/git
- Archive old plan

### 11.5 Reopen Mode

- Set pass=false on completed items
- Reset iteration count
- Re-run verification

---

## 12. GUI Requirements

### 12.1 Core Screens

1. **Dashboard** - Central status and controls
2. **Project Select** - Choose/create project
3. **Start Chain Wizard** - Step-through requirements to execution
4. **Configuration** - Tier/branch/verification settings
5. **Phase/Task/Subtask Views** - Hierarchical navigation
6. **Evidence Viewer** - Gate reports, screenshots, logs
7. **Doctor** - Dependency checker and installer

### 12.2 Required Controls

- Start / Pause / Resume / Stop
- Retry (fresh iteration)
- Replan (with audit log)
- Reopen (select item + reason)
- Spawn new attempt (kill current, start fresh)

### 12.3 Status Views

- Current Phase/Task/Subtask/Iteration
- Acceptance criteria status + evidence
- Tests status + evidence
- Last N commits
- Errors/logs

---

## 13. CLI Requirements

### 13.1 Core Commands

```bash
puppet-master init <requirements-file>  # Initialize project
puppet-master start                      # Begin execution
puppet-master pause                      # Pause execution
puppet-master resume                     # Resume execution
puppet-master stop                       # Stop execution
puppet-master status                     # Show current state
puppet-master doctor                     # Check dependencies
puppet-master install                    # Install dependencies
puppet-master replan [--phase <id>]      # Regenerate plans
puppet-master reopen <item-id> --reason "..." # Reopen completed item
puppet-master gui                        # Launch web GUI
```

### 13.2 CLI Flags

All commands support:
- `--config <path>` - Override config file
- `--verbose` / `-v` - Increase output verbosity
- `--json` - Output in JSON format
- `--dry-run` - Show what would happen

---

## 14. Branch Strategy Requirements

### 14.1 Configurable Strategies

| Strategy | Description |
|----------|-------------|
| `single` | All work on one branch |
| `per-phase` | New branch per Phase |
| `per-task` | New branch per Task |

### 14.2 Configuration Options

- `base_branch`: Branch to start from (default: `main`)
- `naming_pattern`: Branch name template (e.g., `ralph/{phase}/{task}`)
- `push_policy`: When to push (`per-iteration`, `per-subtask`, `per-task`, `per-phase`)
- `merge_policy`: How to merge (`merge`, `squash`, `rebase`)
- `auto_pr`: Automatically create pull requests (boolean)

---

## 15. Doctor & Installation Requirements

### 15.1 Doctor Checks

| Check | Description |
|-------|-------------|
| CLI Tools | cursor-agent, codex, claude installed and accessible |
| Git | git installed, repo initialized, credentials configured |
| Node/Python | Required runtimes available |
| Browser Tools | dev-browser/Playwright available |
| Project Setup | Config exists, state files valid |

### 15.2 Installation Capabilities

- Auto-install missing dependencies where possible
- Provide copy/paste commands when auto-install not possible
- Run smoke tests after installation
- Generate report of what was installed/configured

---

## 16. Logging & Audit Requirements

### 16.1 Log Types

| Log | Purpose | Location |
|-----|---------|----------|
| Activity Log | All orchestrator actions | `.puppet-master/logs/activity.log` |
| Iteration Log | Per-iteration details | `.puppet-master/logs/iterations/` |
| Error Log | Failures and exceptions | `.puppet-master/logs/errors.log` |
| Gate Reports | Gate review outcomes | `.puppet-master/gates/` |
| Audit Trail | Configuration/plan changes | `.puppet-master/audit.log` |

### 16.2 Log Retention

- Configurable retention period
- Auto-archive old logs
- Export capability

### 16.3 Real-time Streaming

- WebSocket support for GUI
- `--follow` flag for CLI
- Event-based architecture

---

## 17. Configuration File Schema

```yaml
# .puppet-master/config.yaml

project:
  name: "MyProject"
  working_directory: "."
  
tiers:
  phase:
    platform: "claude"
    model: "opus-4.5"
    self_fix: false
    max_iterations: 3
    escalation: null  # Top tier, cannot escalate
    
  task:
    platform: "codex"
    model: "gpt-5.2-high"
    self_fix: true
    max_iterations: 5
    escalation: "phase"
    
  subtask:
    platform: "cursor"
    model: "sonnet-4.5-thinking"
    self_fix: true
    max_iterations: 10
    escalation: "task"
    
  iteration:
    platform: "cursor"
    model: "auto"
    max_attempts: 3
    escalation: "subtask"

branching:
  base_branch: "main"
  naming_pattern: "ralph/{phase}/{task}"
  granularity: "per-task"  # single, per-phase, per-task
  push_policy: "per-subtask"
  merge_policy: "squash"
  auto_pr: true

verification:
  browser_adapter: "dev-browser"
  screenshot_on_failure: true
  evidence_directory: ".puppet-master/evidence"

memory:
  progress_file: "progress.txt"
  agents_file: "AGENTS.md"
  prd_file: ".puppet-master/prd.json"

logging:
  level: "info"
  retention_days: 30
  
cli_paths:
  cursor: "cursor-agent"
  codex: "codex"
  claude: "claude"
```

---

## 18. Error Handling Requirements

### 18.1 Gutter Detection

Detect when agent is stuck:
- Same command failed 3x
- Same file written 5x in 10 minutes
- Agent signals `<ralph>GUTTER</ralph>`
- Token limit reached without progress

### 18.2 Recovery Actions

1. **Auto-retry** with fresh context
2. **Escalate** to higher tier
3. **Pause** for human intervention
4. **Skip** and continue (with flag)

### 18.3 Graceful Degradation

- If preferred platform unavailable, fall back to configured alternative
- If tests timeout, retry with increased timeout
- If git push fails, queue for retry

---

## 19. Security Considerations

### 19.1 Sandboxing

- CLI executions in isolated environments where possible
- File access restricted to project directory
- Network access configurable

### 19.2 Secrets Management

- No secrets in state files
- Environment variable injection for sensitive config
- Git ignore patterns for sensitive files

### 19.3 Audit Trail

- All plan changes logged with user/reason
- All CLI invocations logged
- Tamper-evident logging (optional)

---

## 20. Non-Requirements (What NOT to Build)

- **No API integrations**: CLI only
- **No cloud sync**: Local operation only (user can add their own)
- **No AI model hosting**: Use existing CLIs
- **No IDE integration**: Standalone tool (CLIs may integrate with IDEs separately)
- **No auto-deployment**: Execution ends at verification gate

---

## 21. Success Criteria for Puppet Master Itself

1. Can execute Start Chain from raw requirements to running execution
2. Can coordinate all three platforms (Cursor, Codex, Claude Code) via CLI
3. Spawns fresh agent per iteration (verified by process ID tracking)
4. Maintains memory layers correctly (progress.txt, AGENTS.md, prd.json, git)
5. Gates progression on BOTH acceptance criteria AND tests
6. GUI and CLI achieve feature parity
7. Doctor can verify and Install can remediate dependencies
8. All operation modes functional (new build, change request, bugfix, re-plan, reopen)
9. Configurable tier pipeline with any platform order
10. Evidence recorded and accessible for all gates

---

## 22. CLI Capability Discovery + Capability Matrix + Smoke Tests (ADDENDUM v2.0)

### 22.1 Purpose

Puppet Master assumes certain CLI flags/behaviors (non-interactive mode, model selection, session control, etc.). Because CLI tools evolve, we need a **first-class capability discovery system** that validates assumptions at runtime.

### 22.2 CLI Capability Matrix

Puppet Master maintains a **Capability Matrix** for each supported platform:

| Capability | Cursor CLI | Codex CLI | Claude Code CLI |
|------------|-----------|-----------|-----------------|
| **Invocation** | `cursor-agent "prompt"` | `codex exec "prompt"` | `claude -p "prompt"` |
| **Model Selection** | `--model <model>` | `--model <model>` | `--model <model>` |
| **Non-Interactive Mode** | `-p` (print mode) | `exec` subcommand | `-p` (print mode) |
| **Streaming Output** | stdout | JSONL via `--output-format stream-json` | stdout / `--output-format json` |
| **Exit Codes** | 0=success, non-zero=failure | 0=success, non-zero=failure | 0=success, non-zero=failure |
| **Timeout Support** | External (process timeout) | `--max-turns` | `--max-turns` |
| **Kill Semantics** | SIGTERM then SIGKILL | SIGTERM then SIGKILL | SIGTERM then SIGKILL |
| **Working Directory** | Inherits CWD | `--path <dir>` | Inherits CWD |
| **Environment Vars** | Standard inheritance | Standard inheritance | Standard inheritance |
| **MCP Support** | `mcp.json` in project | MCP via config | MCP via config |
| **Session Resume** | `--resume <id>` | `--resume [id]` | `--resume <id>` |
| **AGENTS.md Support** | Reads from root | Native support | Via CLAUDE.md |

### 22.3 Capability Discovery Process

At startup or on `puppet-master doctor`, the system runs capability discovery:

1. **Help Output Parsing**: Run `<cli> --help` and parse available flags
2. **Version Detection**: Run `<cli> --version` to get version string
3. **Smoke Commands**: Run safe commands to verify behavior:
   - `cursor-agent -p "echo test"` (non-interactive works?)
   - `codex exec "echo test" --output-format json` (JSONL works?)
   - `claude -p "echo test"` (print mode works?)
4. **Model List Discovery**: Query available models where possible
5. **MCP Probe**: Check for MCP configuration files

### 22.4 Capability Results Storage

Results stored in: `.puppet-master/capabilities/`

```yaml
# .puppet-master/capabilities/cursor.yaml
platform: cursor
version: "1.2.3"
discovered_at: "2026-01-10T14:00:00Z"
capabilities:
  non_interactive: true
  model_selection: true
  streaming: partial  # stdout only
  session_resume: true
  mcp_support: true
available_models:
  - auto
  - sonnet-4.5-thinking
  - grok-code
smoke_test:
  passed: true
  output: "test completed"
  duration_ms: 1234
```

### 22.5 Doctor Enforcement

Doctor MUST:
- Refuse to run if required capabilities are missing
- Warn if optional capabilities are missing
- Suggest fixes for missing capabilities
- Re-run capability discovery on demand

### 22.6 Smoke Test Requirements

Each platform must pass smoke tests before being used:

| Test | Purpose | Pass Criteria |
|------|---------|---------------|
| Basic Invocation | CLI runs at all | Exit code 0 |
| Non-Interactive | Output captured | Non-empty stdout |
| Model Selection | Model flag works | No error on valid model |
| Working Dir | CWD respected | File created in correct dir |
| Timeout | Process can be killed | Terminates within grace period |

### 22.7 Capability Matrix Is Discovery-Populated (ADDENDUM v2.1)

**CRITICAL OPERATIONAL RULE**: The capability matrix documented above represents **placeholder/reference values only**. The actual, authoritative capability data for any given installation MUST be:

1. **Populated by Doctor/Discovery at runtime** - The Doctor subsystem runs capability discovery and stores results as evidence artifacts.

2. **Stored in evidence artifacts:**
   - `capabilities.json` - Machine-readable capability matrix for all platforms
   - `smoke-test-<platform>.log` - Full smoke test output per platform
   - `capability-discovery-report.md` - Human-readable summary of all discoveries

3. **Required before execution** - Puppet Master MUST refuse to proceed with orchestration if:
   - Required capabilities have not been discovered
   - Smoke tests have not passed
   - Capability artifacts are missing or stale (configurable staleness threshold)

4. **Doctor MUST provide:**
   - `capabilities.json` artifact with all platform capabilities
   - Smoke test logs for each platform
   - Human-readable summary report
   - Timestamp of last successful discovery

**Any default values in documentation or config files are reference examples only until Doctor validates them via discovery.**

---

## 23. Quota / Cooldown-Aware Scheduling (ADDENDUM v2.0)

### 23.1 Purpose

Claude Code has tight cooldowns (1-4 prompts then 5h wait). Codex has moderate limits. Puppet Master must operationalize these constraints to prevent workflow stalls.

### 23.2 Default Usage Policies

| Platform | Default Usage Scope | Rationale |
|----------|---------------------|-----------|
| Claude Code | Start Chain + Phase Gates ONLY | Preserve for high-value planning/review |
| Codex | Task gates + escalation | Higher capacity, good for integration |
| Cursor | Subtask + Iteration work | Cheap/unlimited, primary workhorse |

### 23.3 Budget Configuration

```yaml
# .puppet-master/config.yaml (additions)

budgets:
  claude:
    max_calls_per_run: 5
    max_calls_per_hour: 3
    max_calls_per_day: 10
    cooldown_hours: 5
    fallback_platform: "codex"
    
  codex:
    max_calls_per_run: 50
    max_calls_per_hour: 20
    max_calls_per_day: 100
    fallback_platform: "cursor"
    
  cursor:
    max_calls_per_run: unlimited
    max_calls_per_hour: unlimited
    max_calls_per_day: unlimited
    fallback_platform: null  # No fallback needed

budget_enforcement:
  on_limit_reached: "fallback"  # fallback | pause | queue
  warn_at_percentage: 80
  notify_on_fallback: true
```

### 23.4 Usage Tracking

Track per-platform usage events in: `.puppet-master/usage/`

```jsonl
{"timestamp":"2026-01-10T14:00:00Z","platform":"claude","action":"start_chain","tokens":5000,"duration_ms":30000}
{"timestamp":"2026-01-10T14:05:00Z","platform":"claude","action":"phase_gate","tokens":3000,"duration_ms":20000}
{"timestamp":"2026-01-10T14:30:00Z","platform":"codex","action":"task_gate","tokens":4000,"duration_ms":25000}
```

### 23.5 Cooldown Handling

When a platform hits its limit:

1. **Fallback Mode** (default): Auto-switch to fallback_platform for that tier
2. **Pause Mode**: Pause execution, notify user, wait for resume
3. **Queue Mode**: Queue work for later, continue with other tiers

### 23.6 GUI Budget Display

GUI must show:
- Current usage vs limits per platform
- Projected exhaustion time
- Active cooldowns with countdown
- Fallback status indicators
- "Reserve Claude" option for critical gates

---

## 24. AGENTS.md Mandatory Enforcement + Multi-Level Propagation (ADDENDUM v2.0)

### 24.1 AGENTS.md Is Mandatory

AGENTS.md update is **NOT optional**. When reusable knowledge is discovered, it MUST be recorded.

Gates MAY fail if:
- Subtask discovered a gotcha but didn't update AGENTS.md
- Task integration revealed a pattern not recorded
- Phase review found architecture notes missing

### 24.2 Structured Format Requirement

AGENTS.md MUST follow this structured format:

```markdown
# [Project Name] - Agent Instructions

## Overview
[Brief project description - 2-3 sentences]

## Architecture Notes
- [Key architectural decisions]
- [Module organization]
- [Data flow patterns]

## Codebase Patterns
- [Pattern 1: "When doing X, always Y"]
- [Pattern 2: "Use Z pattern for Q situations"]

## Tooling Rules
- [MCP configuration notes]
- [Required environment setup]
- [Build/test commands]

## Common Failure Modes
- [Failure 1: description + fix]
- [Failure 2: description + fix]

## Do's and Don'ts
### Do
- [Do item 1]
- [Do item 2]

### Don't
- [Don't item 1]
- [Don't item 2]

## Testing
- Run tests: `[command]`
- Test database: `[setup notes]`
- Browser tests: `[requirements]`

## Directory Structure
- `[dir1]/` - [purpose]
- `[dir2]/` - [purpose]
```

### 24.3 Multi-Level AGENTS.md (Configurable)

**Configuration:**
```yaml
memory:
  agents_file: "AGENTS.md"
  multi_level_agents: true  # Default: true
  agents_locations:
    - root: "AGENTS.md"
    - modules: "src/*/AGENTS.md"
    - phases: ".puppet-master/agents/phase-*.md"
```

**Hierarchy:**
1. **Root AGENTS.md** - Always exists, project-wide knowledge
2. **Module AGENTS.md** - Optional, per-directory knowledge (e.g., `src/auth/AGENTS.md`)
3. **Phase/Task AGENTS.md** - Optional, tier-specific learned knowledge

### 24.4 Loading Order (Prompt Construction)

When building iteration prompts, load AGENTS.md files in order:
1. Root AGENTS.md (always)
2. Relevant module AGENTS.md (if file being edited is in a module with AGENTS.md)
3. Current phase AGENTS.md (if exists)
4. Current task AGENTS.md (if exists)

### 24.5 Promotion Rules (Roll-Up)

To prevent bloat, knowledge must be promoted/archived:

| Level | Promotion Trigger | Destination |
|-------|-------------------|-------------|
| Task AGENTS | Task gate passes | Phase AGENTS (if broadly applicable) |
| Phase AGENTS | Phase gate passes | Root AGENTS (if project-wide) |
| Module AGENTS | Manual review | Root AGENTS (if cross-module) |

**Gate reviewers MUST:**
1. Review child-level AGENTS.md updates
2. Identify project-wide patterns
3. Promote to appropriate level
4. Archive or delete redundant entries

### 24.6 Enforcement Mechanism

```yaml
# Config addition
memory:
  agents_enforcement:
    require_update_on_failure: true
    require_update_on_gotcha: true
    gate_fails_on_missing_update: true
    reviewer_must_acknowledge: true
```

When enabled:
- Iteration that discovers a gotcha MUST update AGENTS.md
- Task gate verifies AGENTS.md was updated if failures occurred
- Human reviewer can override via GUI

---

## 25. Verifier Taxonomy + Evidence System (ADDENDUM v2.0)

### 25.1 Purpose

Acceptance verification needs a standardized, extensible taxonomy of verifier types with consistent evidence handling.

### 25.2 Verifier Token Syntax

Acceptance criteria and test plans use verifier tokens:

```
<VERIFIER_TYPE>:<target>[:options]
```

### 25.3 Standard Verifier Types

| Token | Description | Example |
|-------|-------------|---------|
| `TEST:<command>` | Run test command | `TEST:npm test` |
| `CLI_VERIFY:<command>` | Run CLI command, check exit code | `CLI_VERIFY:npm run typecheck` |
| `BROWSER_VERIFY:<scenario>` | Execute browser scenario | `BROWSER_VERIFY:login-success` |
| `FILE_VERIFY:<path>:<rule>` | Check file exists/matches | `FILE_VERIFY:src/auth.ts:exists` |
| `REGEX_VERIFY:<path>:<pattern>` | Check file contains pattern | `REGEX_VERIFY:package.json:"version": "1.` |
| `PERF_VERIFY:<metric>:<threshold>` | Check performance metric | `PERF_VERIFY:build-time:<30s` |
| `MANUAL_VERIFY:<description>` | Flag for human review | `MANUAL_VERIFY:UI looks correct` |
| `AI_VERIFY:<prompt>` | AI-based verification (fallback) | `AI_VERIFY:Does the code handle errors?` |

### 25.4 Verifier Execution

Each verifier type has a handler:

```typescript
interface Verifier {
  type: string;
  execute(target: string, options?: string): Promise<VerifierResult>;
}

interface VerifierResult {
  passed: boolean;
  evidence: Evidence;
  output: string;
  duration_ms: number;
  error?: string;
}

interface Evidence {
  type: 'log' | 'screenshot' | 'file' | 'metric';
  path: string;
  summary: string;
  timestamp: string;
}
```

### 25.5 Evidence Artifacts

All verifier runs produce evidence stored in: `.puppet-master/evidence/`

```
.puppet-master/evidence/
├── test-logs/
│   ├── ST-001-001-001-iter-001-test.log
│   └── ST-001-001-001-iter-001-typecheck.log
├── screenshots/
│   ├── ST-001-001-001-login-success.png
│   └── TK-001-001-gate-final.png
├── browser-traces/
│   └── ST-001-001-001-trace.zip
├── file-snapshots/
│   └── ST-001-001-001-auth.ts.snapshot
└── metrics/
    └── ST-001-001-001-perf.json
```

### 25.6 Evidence Summary in Gate Reports

Gate reports MUST include:

```json
{
  "gate_id": "TK-001-001",
  "timestamp": "2026-01-10T15:00:00Z",
  "verifiers_run": [
    {
      "type": "TEST",
      "target": "npm test",
      "passed": true,
      "evidence_path": ".puppet-master/evidence/test-logs/TK-001-001-test.log",
      "summary": "15 tests passed, 0 failed"
    },
    {
      "type": "CLI_VERIFY",
      "target": "npm run typecheck",
      "passed": true,
      "evidence_path": ".puppet-master/evidence/test-logs/TK-001-001-typecheck.log",
      "summary": "No TypeScript errors"
    },
    {
      "type": "BROWSER_VERIFY",
      "target": "login-flow",
      "passed": true,
      "evidence_path": ".puppet-master/evidence/screenshots/TK-001-001-login.png",
      "summary": "Login flow completed successfully"
    }
  ],
  "overall_passed": true
}
```

### 25.7 Failure Feed-Forward

When a verifier fails, the failure info feeds into:
1. **progress.txt**: Appended as learning
2. **Next iteration prompt**: Include failure details
3. **AGENTS.md**: If failure reveals a gotcha

---

## 26. Fresh Agent Enforcement + Runner Contract (ADDENDUM v2.0)

### 26.1 Fresh Agent Requirement

**CRITICAL**: Every iteration MUST spawn a completely fresh agent process.

**What "fresh" means:**
- New OS process (new PID)
- No session resume (unless explicitly configured for debugging)
- Clean working directory state (git checkout to last commit)
- Only state files read for context

### 26.2 Runner Contract

Each platform runner MUST implement this contract:

```typescript
interface PlatformRunnerContract {
  // Identity
  readonly platform: 'cursor' | 'codex' | 'claude';
  
  // Spawning
  spawnFreshProcess(request: ExecutionRequest): Promise<RunningProcess>;
  
  // MUST NOT reuse sessions by default
  readonly sessionReuseAllowed: boolean; // Default: false
  
  // State isolation
  prepareWorkingDirectory(path: string): Promise<void>;
  cleanupAfterExecution(pid: number): Promise<void>;
  
  // Context files (ONLY these may be passed)
  readonly allowedContextFiles: string[];
  // Default: ['progress.txt', 'AGENTS.md', 'prd.json', '.puppet-master/plans/*']
  
  // Timeouts
  readonly defaultTimeout: number; // milliseconds
  readonly hardTimeout: number;    // kill after this
  
  // Kill semantics
  terminateProcess(pid: number): Promise<void>;      // SIGTERM
  forceKillProcess(pid: number): Promise<void>;      // SIGKILL
  
  // Logs
  captureStdout(pid: number): AsyncIterable<string>;
  captureStderr(pid: number): AsyncIterable<string>;
  getTranscript(pid: number): Promise<string>;
}
```

### 26.3 Process Isolation Mechanics

**Before iteration starts:**
1. `git stash` any uncommitted changes (optional, configurable)
2. Verify clean working directory
3. Copy context files to temp location if needed
4. Set environment variables (no sensitive data)

**Spawning:**
1. Create new process via `spawn()` (NOT `exec()` to avoid shell)
2. Record PID in iteration log
3. Attach stdout/stderr listeners
4. Start timeout timer

**During execution:**
1. Stream output to logs
2. Monitor for completion signals
3. Watch for stall indicators

**After execution:**
1. Capture final output
2. Kill process if still running
3. Parse results
4. Clean up temp files

### 26.4 Stall Detection

Stall indicators:
- No stdout for configurable period (default: 5 minutes)
- Repeated identical output (agent in loop)
- Token count exceeds threshold without progress signal
- Process exceeds hard timeout

### 26.5 Stall Handling

```yaml
# Config addition
execution:
  stall_detection:
    no_output_timeout: 300  # seconds
    identical_output_threshold: 3
    hard_timeout: 1800  # 30 minutes
    
  on_stall:
    action: "kill_and_retry"  # kill_and_retry | escalate | pause
    max_stall_retries: 2
    escalate_after_retries: true
```

### 26.6 Process Audit

Every iteration records:

```json
{
  "iteration_id": "ST-001-001-001-iter-002",
  "process": {
    "pid": 12345,
    "started_at": "2026-01-10T14:00:00Z",
    "ended_at": "2026-01-10T14:05:30Z",
    "exit_code": 0,
    "fresh_spawn": true,
    "session_resumed": false
  },
  "context_files_provided": [
    "progress.txt",
    "AGENTS.md",
    ".puppet-master/plans/subtask-001-001-001.md"
  ],
  "working_directory": "/path/to/project",
  "environment_vars_set": ["NODE_ENV", "PUPPET_MASTER_ITERATION"]
}
```

---

## 27. Git Protocol (ADDENDUM v2.0)

### 27.1 Git Tooling Requirements

**Required:**
- `git` CLI (minimum version 2.30)

**Optional:**
- `gh` CLI (GitHub CLI) for PR automation
- Git credentials configured for push

### 27.2 Commit Message Templates

| Tier | Template |
|------|----------|
| Iteration | `ralph: [subtask-id] [summary]` |
| Subtask Complete | `ralph: complete [subtask-id] - [title]` |
| Task Gate | `ralph: task-gate [task-id] - [status]` |
| Phase Gate | `ralph: phase-gate [phase-id] - [status]` |
| Replan | `ralph: replan [scope] - [reason]` |
| Reopen | `ralph: reopen [item-id] - [reason]` |

### 27.3 Branch Operations

```yaml
# Config addition
git:
  require_clean_start: true
  stash_uncommitted: true
  
  branch:
    create_on: "task_start"  # phase_start | task_start | never
    delete_after_merge: true
    protect_base_branch: true
    
  commit:
    sign_commits: false
    include_stats: true
    max_files_per_commit: 50
    
  push:
    auto_push: true
    push_on: "subtask_complete"  # iteration | subtask_complete | task_complete | phase_complete
    force_push: false
    
  pr:
    enabled: true
    create_on: "task_complete"  # task_complete | phase_complete
    auto_merge: false
    require_review: true
    template: ".github/pull_request_template.md"
    labels: ["ralph-automated"]
    
  conflict:
    strategy: "pause"  # pause | rebase | abort
    notify_on_conflict: true
```

### 27.4 Merge Policy

| Granularity | Merge Timing | Method |
|-------------|--------------|--------|
| per-task | After task gate passes | Squash merge |
| per-phase | After phase gate passes | Merge commit |
| manual | User triggers | Configurable |

### 27.5 Conflict Handling

When conflicts are detected:

1. **Pause** (default): Stop execution, alert user, wait for resolution
2. **Rebase**: Attempt automatic rebase, pause if fails
3. **Abort**: Abort merge, continue on current branch

### 27.6 Git Actions Logged

All git operations recorded in: `.puppet-master/logs/git-actions.log`

```jsonl
{"timestamp":"2026-01-10T14:00:00Z","action":"commit","sha":"abc1234","message":"ralph: ST-001-001-001 add auth middleware","files":3}
{"timestamp":"2026-01-10T14:05:00Z","action":"push","branch":"ralph/ph-001/tk-001","result":"success"}
{"timestamp":"2026-01-10T15:00:00Z","action":"pr_create","number":42,"branch":"ralph/ph-001/tk-001","base":"main"}
```

### 27.7 Doctor Checks for Git

Doctor must verify:
- `git --version` returns valid version
- Repository is initialized
- Remote is configured (if push enabled)
- Credentials work (test with `git ls-remote`)
- `gh` available (if PR enabled)
- Branch protection rules don't block pushes

---

## 28. Session Identifier Standardization (ADDENDUM v2.0)

### 28.1 Thread → Session Rename

**IMPORTANT**: The progress.txt template previously used "Thread" (from amp-skills heritage). This is renamed to **"Session"** for platform neutrality.

**ADDENDUM (v2.1):** The term "Thread" originated from Amp-specific terminology (example.invalid/threads/<id>). Because RWM Puppet Master is a CLI-only orchestrator that works with multiple platforms (Cursor, Codex, Claude Code) without any Amp dependency, we use the platform-neutral term **"Session"** to refer to a single orchestration run. This avoids implying any Amp involvement and maintains clarity across all supported CLI platforms.

**Old:**
```markdown
**Thread:** https://example.invalid/threads/abc123
```

**New:**
```markdown
**Session:** PM-2026-01-10-14-00-00-001
```

### 28.2 Session ID Format

```
PM-{date}-{time}-{sequence}
```

Example: `PM-2026-01-10-14-00-00-001`

- `PM` = Puppet Master prefix
- Date: YYYY-MM-DD
- Time: HH-MM-SS
- Sequence: 3-digit counter for same-second runs

### 28.3 Updated progress.txt Template

```markdown
## [ISO_TIMESTAMP] - [ITEM_ID]

**Session:** [session_id]
**Platform:** [cursor|codex|claude]
**Duration:** [Xm Ys]
**Status:** [SUCCESS | FAILED | PARTIAL]

### What Was Done
- [accomplishment]

### Files Changed
- `path/to/file.ts` - [description]

### Tests Run
- `npm test` - PASSED

### Learnings for Future Iterations
- [learning]

### Next Steps
- [next step if incomplete]

---
```

---

## Appendix A: CLI Platform Research Summary

### Cursor CLI (`cursor-agent`)

**Key capabilities:**
- `cursor-agent chat "prompt"` - Start interactive session
- `cursor-agent -p "prompt"` - Non-interactive print mode
- `--resume <session-id>` - Continue existing session
- Reads AGENTS.md and CLAUDE.md from project root
- Supports MCP via mcp.json
- `/model` command to switch models
- `/compress` to free context space

**Planning approach:**
- No dedicated `--plan` flag
- Plan behavior via explicit prompt: "Plan the implementation for X. Then build it."
- Non-interactive planning: `cursor-agent -p "Outline a plan..." > plan.md`

### Codex CLI (`codex`)

**Key capabilities:**
- `codex "prompt"` - Start TUI session
- `codex exec "prompt"` - Non-interactive with JSONL output
- `--model <model>` - Select model
- `--approval-policy` - Control command approval
- `--sandbox-mode` - Filesystem/network access control
- `/model`, `/review`, `/plan` slash commands
- AGENTS.md native support

**Relevant flags:**
- `--path <dir>` - Set working directory
- `--resume [session-id]` - Continue session
- `--max-turns` - Cap agentic turns
- `--output-format json` - Structured output

### Claude Code CLI (`claude`)

**Key capabilities:**
- `claude "prompt"` - Start interactive REPL
- `claude -p "prompt"` - Non-interactive print mode
- `--model <model>` - Select model
- `--resume <session-id>` - Continue session
- `--output-format json` - Structured output
- `--append-system-prompt` - Add custom instructions
- CLAUDE.md support
- MCP integration

**Relevant flags:**
- `--max-turns` - Limit turns
- `--allowedTools` - Restrict tool access
- `/init` - Generate CLAUDE.md

---

## Appendix B: Browser Verification Adapter Research

### amp-skills dev-browser

- Playwright-based
- Persistent browser sessions
- Named pages (e.g., "checkout", "login")
- ARIA snapshots for AI-friendly element discovery
- Cross-connection ref persistence
- Server mode with headless option

### browser-use-cli

- CLI wrapper for browser automation
- Session management
- Screenshot capabilities

### playwright-mcp

- MCP server exposing Playwright
- Tool-based interaction
- Cross-platform

**Recommendation:** Primary adapter should be amp-skills dev-browser for richest feature set; others as fallbacks.

---

## Appendix C: Reference Implementation Patterns

### From snarktank/ralph (Original)

- `ralph.sh` - Bash loop spawning fresh Amp instances
- `prompt.md` - Instructions per iteration
- `prd.json` - User stories with pass status
- `progress.txt` - Append-only learnings
- `<promise>COMPLETE</promise>` - Completion signal

### From agrimsingh/ralph-wiggum-cursor

- Stream parsing for token tracking
- Context rotation at thresholds (70k warn, 80k rotate)
- Guardrails/signs system for learned lessons
- RALPH_TASK.md with checkbox tracking
- `.ralph/` state directory

### From frankbria/ralph-claude-code

- Claude Code specific adaptations
- Session management
- Print mode integration

### From codex-weave

- JSONL event streaming protocol
- Bidirectional RPC over stdio
- Session resume mechanisms
- Tool-based interaction patterns

---

## Appendix D: Codex Weave Analysis (ADDENDUM v2.0)

### Overview

The [codex-weave](https://github.com/rosem/codex-weave) repository implements a multi-agent orchestration system for Codex CLI with several transferable concepts.

### Key Concepts from Weave

1. **JSONL Event Protocol**: Weave uses structured JSONL events for inter-agent communication
   - Event types: `task`, `result`, `error`, `heartbeat`
   - Envelope format with routing info
   - Applicable to: Puppet Master's EventBus and platform output parsing

2. **Agent Routing**: Messages routed between agents via central coordinator
   - Route table maps agent IDs to capabilities
   - Load balancing across agent instances
   - Applicable to: Tier-to-tier communication pattern

3. **Trace Format**: Rich tracing for debugging multi-agent flows
   - Span-based tracing (similar to OpenTelemetry)
   - Parent-child relationships
   - Applicable to: Iteration logging and debugging

4. **Plugin Architecture**: Extensible via plugins
   - Tool providers
   - Output formatters
   - Applicable to: Verifier plugins, browser adapters

### What We're Adopting

From Weave, Puppet Master adopts:
- **JSONL event format** for activity logging
- **Trace concept** for iteration tracking
- **Envelope pattern** for structured CLI output parsing

### What We're NOT Adopting

- **Direct agent-to-agent communication**: Our agents don't talk to each other directly; Puppet Master mediates
- **WebSocket RPC**: We use CLI invocation, not persistent connections
- **Codex-specific session pooling**: Each platform has different session semantics

### Lessons Learned

1. Structured event logging is essential for debugging orchestration
2. Envelope/message format helps parse heterogeneous CLI outputs
3. Plugin architecture valuable for extensibility
4. Explicit state machines make multi-agent coordination debuggable

---

## Appendix E: GUI Update Frequency Requirements (RESTORED)

### Update Frequency Table

The GUI must update at specific frequencies based on event type:

| Event Type | Update Frequency | Rationale |
|------------|------------------|-----------|
| **CLI Output Stream** | Real-time (immediate) | User needs live feedback |
| **Iteration Progress** | Real-time (immediate) | Track agent progress |
| **Status Change** | Real-time (immediate) | Critical state changes |
| **Acceptance Criteria Check** | Real-time (immediate) | Show pass/fail as they occur |
| **Progress Bars (overall)** | Every 1 second | Smooth visual updates |
| **Budget Counters** | Every 5 seconds | Balance freshness vs overhead |
| **Recent Commits List** | On commit event | Event-driven |
| **Recent Errors List** | On error event | Event-driven |
| **Capability Matrix** | On demand / Doctor run | Expensive to refresh |
| **Usage History Charts** | Every 30 seconds | Low-priority dashboard data |
| **Phase/Task/Subtask Lists** | On state change | Event-driven |

### Polling vs Push Strategy

| Data Type | Strategy | Notes |
|-----------|----------|-------|
| Status, Output | WebSocket Push | Low latency required |
| Budget Counters | Polling (5s) | Reduce server load |
| Usage Charts | Polling (30s) | Historical data, not urgent |
| Capability Matrix | On-demand | User-triggered |
| Evidence Files | On-demand | Large data, user-triggered |

### Connection Recovery

- If WebSocket disconnects, fall back to polling every 2 seconds
- Auto-reconnect WebSocket with exponential backoff (1s, 2s, 4s, max 30s)
- Queue updates during disconnect, replay on reconnect
- Show "Reconnecting..." indicator in UI

---

## Appendix F: GUI Responsive Breakpoints (RESTORED)

### Breakpoint Definitions

| Breakpoint Name | Width Range | Target Devices |
|-----------------|-------------|----------------|
| **xs** (Extra Small) | < 640px | Mobile phones (portrait) |
| **sm** (Small) | 640px - 767px | Mobile phones (landscape), small tablets |
| **md** (Medium) | 768px - 1023px | Tablets (portrait), small laptops |
| **lg** (Large) | 1024px - 1279px | Tablets (landscape), laptops |
| **xl** (Extra Large) | 1280px - 1535px | Desktop monitors |
| **2xl** (2X Large) | ≥ 1536px | Large desktop monitors |

### Layout Adaptations per Breakpoint

| Component | xs-sm | md | lg-xl | 2xl |
|-----------|-------|-----|-------|-----|
| **Dashboard Layout** | Single column | 2 columns | 3 columns | 4 columns |
| **Status Bar** | Collapsed (icon only) | Abbreviated | Full width | Full with extra info |
| **Current Item Panel** | Full width | 50% width | 40% width | 33% width |
| **Live Output** | Full width (collapsed) | Full width | 60% width | 50% width |
| **Run Controls** | Bottom fixed bar | Sidebar | Sidebar | Inline |
| **Recent Commits/Errors** | Hidden (tab access) | Collapsed | Side panel | Visible |
| **Navigation** | Hamburger menu | Hamburger menu | Side rail | Full sidebar |
| **Phase/Task Tree** | Accordion | Accordion | Tree view | Tree view + details |

### Typography Scaling

| Element | xs | sm | md | lg+ |
|---------|-----|-----|-----|------|
| Body text | 14px | 14px | 16px | 16px |
| H1 | 24px | 28px | 32px | 36px |
| H2 | 20px | 22px | 24px | 28px |
| H3 | 16px | 18px | 20px | 22px |
| Monospace (code) | 12px | 12px | 14px | 14px |
| Status badges | 12px | 12px | 14px | 14px |

### Touch Target Requirements

For mobile breakpoints (xs-sm):
- Minimum touch target: 44px × 44px
- Button spacing: minimum 8px gap
- Swipe gestures for navigation where applicable
- Pull-to-refresh for status updates

---

## Appendix G: Prompt Templates (RESTORED DETAIL)

### Iteration Prompt Template

```markdown
# Iteration Prompt for [SUBTASK_ID]

## Context

You are working on project: [PROJECT_NAME]

**Current Item:**
- ID: [SUBTASK_ID]
- Title: [SUBTASK_TITLE]
- Parent Task: [TASK_ID] - [TASK_TITLE]
- Parent Phase: [PHASE_ID] - [PHASE_TITLE]

**Session ID:** [SESSION_ID]
**Platform:** [PLATFORM]
**Iteration:** [CURRENT_ATTEMPT] of [MAX_ATTEMPTS]

## Memory (Loaded Context)

### Recent Progress (from progress.txt)
[LAST_N_PROGRESS_ENTRIES]

### Long-Term Knowledge (from AGENTS.md)
[AGENTS_MD_CONTENT]

### Module-Specific Knowledge (if applicable)
[MODULE_AGENTS_MD_CONTENT]

## Your Assignment

[SUBTASK_PLAN_CONTENT]

## Acceptance Criteria

You MUST satisfy ALL of these:

[ACCEPTANCE_CRITERIA_AS_CHECKLIST]

## Test Requirements

After implementation, these must pass:

[TEST_PLAN_COMMANDS]

## Important Rules

1. ONLY work on the current subtask scope
2. Do NOT modify files outside the specified scope
3. Run tests after making changes
4. If you encounter a gotcha or pattern worth remembering, note it clearly
5. Signal completion with: `<ralph>COMPLETE</ralph>`
6. If stuck, signal: `<ralph>GUTTER</ralph>`

## Previous Iteration Failures (if any)

[PREVIOUS_FAILURE_INFO]

## Begin
```

### Gate Review Prompt Template

```markdown
# Gate Review for [TIER_TYPE]: [ITEM_ID]

## Overview

You are performing a [TIER_TYPE] gate review for:
- ID: [ITEM_ID]
- Title: [ITEM_TITLE]

**Session ID:** [SESSION_ID]
**Platform:** [PLATFORM]

## Child Items Completed

[LIST_OF_CHILD_ITEMS_WITH_STATUS]

## Evidence Summary

### Test Results
[AGGREGATED_TEST_RESULTS]

### Acceptance Verification Results
[AGGREGATED_ACCEPTANCE_RESULTS]

### Evidence Files
[LIST_OF_EVIDENCE_PATHS]

## Acceptance Criteria for This Gate

[TIER_ACCEPTANCE_CRITERIA]

## Test Plan for This Gate

[TIER_TEST_PLAN]

## Your Task

1. Review all child evidence
2. Re-run tier-level tests
3. Verify tier-level acceptance criteria
4. Decide: PASS, SELF_FIX (if permitted), KICK_DOWN, or ESCALATE

## Memory Updates Required

If you learned anything that should be recorded:
- Update AGENTS.md with reusable patterns
- Note any gotchas or architecture decisions

## Response Format

Provide your decision in this format:

```json
{
  "decision": "PASS | SELF_FIX | KICK_DOWN | ESCALATE",
  "reason": "explanation",
  "tests_rerun": ["list of commands run"],
  "acceptance_verified": true | false,
  "agents_update_required": true | false,
  "agents_update_content": "content if required",
  "kick_down_items": [/* if KICK_DOWN */],
  "escalation_reason": "/* if ESCALATE */"
}
```
```

### Start Chain PRD Generation Prompt Template

```markdown
# PRD Generation Request

## Input Requirements Document

[REQUIREMENTS_DOCUMENT_CONTENT]

## Your Task

Generate a structured PRD (prd.json) from the requirements above.

## Output Format

Generate valid JSON matching this schema:

```typescript
interface PRD {
  project: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  branchName: string;
  description: string;
  
  phases: Phase[];
  
  metadata: {
    totalPhases: number;
    completedPhases: number;
    totalTasks: number;
    completedTasks: number;
    totalSubtasks: number;
    completedSubtasks: number;
  };
}
```

## Rules

1. Break work into Phases → Tasks → Subtasks
2. Each Subtask must be ~1 context window of work
3. Include explicit verifier tokens in acceptance criteria
4. Order items by dependency (earlier items don't depend on later)
5. Include test commands where applicable
6. Use standard verifier tokens: TEST:, CLI_VERIFY:, BROWSER_VERIFY:, FILE_VERIFY:, REGEX_VERIFY:

## Generate the PRD now
```

---

*End of REQUIREMENTS.md*
