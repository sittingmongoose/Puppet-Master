# RWM Puppet Master — addgravity.md

> Plan: Add Google Antigravity (Gemini CLI) + GitHub Copilot CLI as supported platforms
> Status: Planning
> Scope: Config + runners + model catalogs + plan-mode + discovery + doctor/install + GUI + docs + tests

**Platforms being added:**
- `antigravity` — Google's Gemini CLI (headless mode)
- `copilot` — GitHub Copilot CLI (programmatic mode)

---

## Research Summary (2026-01-21)

### What Google ships (relevant to Puppet Master)

#### Google Antigravity (desktop “agentic development platform”)
- Product site: https://antigravity.google/
- Official codelab (“Getting Started with Google Antigravity”): https://codelabs.developers.google.com/getting-started-google-antigravity
  - During setup, Antigravity can install a command-line launcher named `agy` (“open Antigravity with `agy`”).
- Antigravity docs (examples):
  - Models: Antigravity’s reasoning model selector includes Gemini + Claude + GPT-OSS options (availability depends on account/plan):
    - Source: https://antigravity.google/assets/docs/agent/models.md
  - Rules: global rules live at `~/.gemini/GEMINI.md` and workspace rules in `.agent/rules/`
    - Source: https://antigravity.google/assets/docs/agent/rules-workflows.md
  - Skills: supports workspace skills in `<workspace-root>/.agent/skills/` and global skills in `~/.gemini/antigravity/global_skills/`
    - Source: https://antigravity.google/assets/docs/agent/skills.md

**Key implication:** Antigravity’s `agy` launcher appears analogous to VS Code’s `code` launcher — useful for opening the GUI, but (based on official docs) not clearly documented as a headless, prompt-in/prompt-out CLI suitable for automated orchestration.

#### Gemini CLI (terminal-first agent; headless-friendly)
- Open-source repo: https://github.com/google-gemini/gemini-cli
- Headless mode docs (flags + JSON schema): https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/headless.md
- Key behavior for Puppet Master:
  - Non-interactive prompt execution: `gemini -p "..."` / `gemini --prompt "..."`
  - Machine-readable output:
    - `--output-format json` → single JSON object with `{ response, stats, error? }`
    - `--output-format stream-json` → JSONL events with `type` in `{ init, message, tool_use, tool_result, error, result }`
  - Tool approval controls:
    - `--approval-mode default|auto_edit|yolo|plan` (and `--yolo`)
    - Source: https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/get-started/configuration.md
  - Plan Mode (if enabled):
    - `--approval-mode plan` is documented as a read-only tool mode and requires `experimental.plan: true` in Gemini CLI settings.
    - Sources:
      - https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/get-started/configuration.md
  - “TODO / task list” feature:
    - No dedicated built-in TODO/task-list command is documented for Gemini CLI; if needed, treat this as an output convention (prompted) or as a higher-level Puppet Master artifact format.
  - Model selection + baseline model set:
    - `--model` flag and `/model` command support “Auto” routing and manual model strings.
    - Baseline documented models include `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`, plus preview models `gemini-3-pro-preview` and `gemini-3-flash-preview` (when preview features are enabled).
    - Sources:
      - https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/model.md
      - https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/get-started/gemini-3.md
      - https://raw.githubusercontent.com/google-gemini/gemini-cli/main/schemas/settings.schema.json
  - Installation:
    - `npm install -g @google/gemini-cli` or `brew install gemini-cli`
    - Source: https://github.com/google-gemini/gemini-cli (README)

**Key implication:** Gemini CLI already matches Puppet Master’s integration shape (fresh process per iteration, non-interactive mode, structured output, configurable approval).

### Recommendation (what "Anti Gravity CLI support" should mean)

1. **Primary integration target (requested):** Add `platform: antigravity` to Puppet Master.
   - **Default runner binary:** use Gemini CLI headless mode (command: `gemini`) because it has a documented non-interactive `-p/--prompt` interface and machine-readable output.
2. **Secondary support:** Detect Antigravity's `agy` launcher in Doctor and provide guidance, but only implement an `agy`-based runner if we can validate a headless prompt-in/prompt-out mode with a stable output contract.

### Open Decisions / Questions — Antigravity (must be resolved early)

1. **Platform id(s)**
   - Decision: add **`antigravity`** as the canonical Puppet Master platform id (per request).
   - Open: optionally support `gemini` as an alias (nice for clarity, but adds branching/UX surface area).
2. **Underlying CLI binary**
   - Default: `gemini` (Gemini CLI).
   - Optional: `agy` (Antigravity app launcher) only if it supports headless prompts and stable output.
3. **Model catalog / "supported models"**
   - Baseline: ship a curated set derived from Gemini CLI docs/schema + Antigravity docs.
   - Open: can we reliably enumerate models via CLI (e.g., a list command), or must it be static + user-overridable?
4. **Plan mode / TODO support**
   - Gemini CLI supports `--approval-mode plan` but requires `experimental.plan: true` in settings and is documented as not fully mature.
   - Decide: expose this as a Puppet Master config knob (recommended), and document prerequisites + caveats.
5. **Output format**
   - Recommended default: `--output-format json` (simplest + stable schema).
   - Optional: `--output-format stream-json` for richer progress/events (more work, better GUI streaming).

---

### What GitHub ships (relevant to Puppet Master)

#### GitHub Copilot CLI (terminal-first agent; headless-friendly)
- Product site: https://github.com/features/copilot/cli
- Open-source repo: https://github.com/github/copilot-cli
- Official docs: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli
- About page: https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli
- Key behavior for Puppet Master:
  - Non-interactive prompt execution: `copilot -p "..."` / `copilot --prompt "..."`
    - Source: https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli
  - Tool approval controls:
    - `--allow-all-tools` / `--yolo` — enable all permissions at once (headless mode)
    - `--allow-tool 'shell(COMMAND)'` — allow specific shell commands
    - `--allow-tool 'write'` — allow file modifications
    - `--deny-tool` — block specific tools (takes precedence)
    - Source: https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli
  - Output controls:
    - `--silent` — suppress stats output for scripting
    - `--stream off` — disable token-by-token streaming
    - Note: No documented `--output-format json` equivalent; output is primarily text-based
  - Model selection:
    - `--model <model>` flag or `/model` slash command
    - Default: Claude Sonnet 4.5
    - Available: Claude Sonnet 4, GPT-5, GPT-5 mini, GPT-4.1
    - Source: https://github.blog/changelog/2026-01-14-github-copilot-cli-enhanced-agents-context-management-and-new-ways-to-install/
  - Custom agents:
    - `--agent <agent>` — invoke a custom agent non-interactively
  - Session management:
    - `--resume` — continue remote sessions locally
    - `--config-dir` — override configuration directory
  - MCP support:
    - `--enable-all-github-mcp-tools` — enable all GitHub MCP tools
    - `--disable-mcp-server` — disable specific MCP servers
  - Installation:
    - npm: `npm install -g @github/copilot`
    - Homebrew: `brew install copilot-cli`
    - WinGet: `winget install GitHub.Copilot`
    - curl: `curl -fsSL https://gh.io/copilot-install | bash`
    - Source: https://github.com/github/copilot-cli
  - Authentication:
    - `GH_TOKEN` or `GITHUB_TOKEN` environment variables
    - `GITHUB_ASKPASS` for CI/CD credential managers
    - `/login` slash command for interactive auth
    - Fine-grained PAT with "Copilot Requests" permission
  - Special features:
    - `/delegate TASK` — hand off to async Copilot coding agent (creates branch + PR)
    - Auto-compaction at 95% token limit
    - Infinite sessions with compaction checkpoints

**Key implication:** Copilot CLI matches Puppet Master's integration shape (fresh process per iteration, non-interactive mode via `-p`, configurable approval via `--allow-all-tools`). Output parsing will be text-based rather than JSON.

### Recommendation (what "Copilot CLI support" should mean)

1. **Primary integration target:** Add `platform: copilot` to Puppet Master.
   - **Default runner binary:** `copilot`
   - **Headless flags:** `-p "..." --allow-all-tools --silent`
2. **Authentication:** Document GitHub OAuth or PAT setup; detect via `GH_TOKEN`/`GITHUB_TOKEN` in Doctor.

### Open Decisions / Questions — Copilot (must be resolved early)

1. **Platform id**
   - Decision: add **`copilot`** as the canonical Puppet Master platform id.
2. **Output parsing**
   - Copilot CLI does not have a documented JSON output format.
   - Strategy: parse text output for `<ralph>COMPLETE</ralph>` / `<ralph>GUTTER</ralph>` signals (same as Claude/Cursor).
   - Consider: use `--silent` to reduce noise in output.
3. **Approval mode mapping**
   - Puppet Master's "yolo" tier config → `--allow-all-tools` (or `--yolo`)
   - Puppet Master's default → no approval flags (interactive prompts, but `-p` mode may still work)
4. **Model catalog**
   - Baseline: `claude-sonnet-4.5` (default), `claude-sonnet-4`, `gpt-5`, `gpt-5-mini`, `gpt-4.1`
   - Note: Models are included with Copilot subscription; no separate billing.
5. **Subscription requirement**
   - Copilot CLI requires active GitHub Copilot subscription (Individual, Business, or Enterprise).
   - Doctor should detect and warn if not authenticated.

---

## Plan Overview

This plan adds **two new platforms** to Puppet Master while preserving core invariants:
- CLI-only interaction (no direct API calls)
- Fresh process per iteration (no session reuse)
- Strict TypeScript + Vitest test coverage
- ESM `.js` import extensions + type-only imports/exports

### Platforms Summary

| Platform ID | CLI Binary | Headless Flag | Approval Flag | Output Format |
|-------------|------------|---------------|---------------|---------------|
| `antigravity` | `gemini` | `-p "..."` | `--approval-mode yolo` | `--output-format json` |
| `copilot` | `copilot` | `-p "..."` | `--allow-all-tools` | text (parse signals) |

### Proposed task breakdown

**Antigravity (AGY-Txx) tasks:**
| Group | Tasks | Can Start After |
|-------|-------|-----------------|
| Sequential | AGY-T01 | None |
| Parallel Group A | AGY-T02, AGY-T03 | AGY-T01 |
| Parallel Group B | AGY-T04, AGY-T05, AGY-T12 | AGY-T02 |
| Sequential | AGY-T06 | AGY-T05 |
| Parallel Group C | AGY-T07, AGY-T08 | AGY-T03 |
| Parallel Group D | AGY-T09, AGY-T10 | AGY-T04 |
| Sequential | AGY-T11 | AGY-T06–AGY-T10, AGY-T12 |

**Copilot (CPL-Txx) tasks:**
| Group | Tasks | Can Start After |
|-------|-------|-----------------|
| Sequential | CPL-T01 | None |
| Parallel Group A | CPL-T02, CPL-T03 | CPL-T01 |
| Parallel Group B | CPL-T04, CPL-T05 | CPL-T02 |
| Sequential | CPL-T06 | CPL-T05 |
| Parallel Group C | CPL-T07, CPL-T08 | CPL-T03 |
| Sequential | CPL-T09 | CPL-T06–CPL-T08 |

**Cross-platform tasks (can run after both platform types are added):**
| Task | Description | Can Start After |
|------|-------------|-----------------|
| BOTH-T01 | GUI updates for both platforms | AGY-T02, CPL-T02 |
| BOTH-T02 | Documentation updates | AGY-T02, CPL-T02 |
| BOTH-T03 | Hardcoded platform reference fixes | AGY-T02, CPL-T02 |
| BOTH-T04 | Integration validation | AGY-T11, CPL-T09 |

---

## AGY-T01: Confirm CLI Contract + Platform Naming

### Title
Decide what “Antigravity CLI” means in Puppet Master

### Goal
Lock in the supported Google CLI(s), platform id(s), and required flags/output contract.

### Depends on
- none

### Read first
- `REQUIREMENTS.md` Section 3–4 (platform table + no-APIs constraint)
- Gemini CLI headless docs (output schema + event types):
  - https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/headless.md
- Antigravity codelab note about `agy` launcher:
  - https://codelabs.developers.google.com/getting-started-google-antigravity

### Deliverables (write down decisions in this file)
- Canonical platform id: `antigravity` (and whether to also support alias `gemini`)
- Underlying runner binary mapping:
  - default `cliPaths.antigravity = "gemini"`
  - optional `agy` runner only if validated as headless-capable
- Output format default: `json` vs `stream-json`
- Approval mode mapping (including Plan Mode):
  - `auto_edit` vs `yolo` vs `plan`
  - document `experimental.plan: true` prerequisite for `plan`
- Supported models strategy:
  - baseline curated list + “Auto” recommendation
  - whether to attempt runtime enumeration (if possible) or keep user-overridable

### Acceptance criteria
- [ ] Platform id decision recorded (and rationale)
- [ ] Primary CLI binary and flags recorded
- [ ] Output format + parsing contract recorded
- [ ] Approval behavior mapped to Puppet Master tier config

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## AGY-T02: Types + Config Schema Updates

### Title
Add Google platform to config + type system

### Goal
Extend the canonical `Platform` type and all config surfaces so the new platform can be selected per tier.

### Depends on
- AGY-T01

### Read first
- `src/types/config.ts` (Platform, CliPathsConfig, budgets)
- `src/config/config-schema.ts` (validateConfig, isPlatform, cliPaths validation)
- `src/config/default-config.ts`
- `REQUIREMENTS.md` Section 3.1 (supported platforms table)

### Files to create/modify
- `src/types/config.ts`
- `src/config/config-schema.ts`
- `src/config/default-config.ts`
- `src/config/config-manager.ts` (if mapping/serialization changes needed)
- `src/types/index.ts` (barrel exports, if needed)
- tests adjacent to the above (keep Vitest)

### Implementation notes
- Add `antigravity` to the canonical `Platform` union.
- Add `cliPaths.antigravity: string` (default should typically be `gemini`).
- Add `budgets.antigravity` alongside existing `budgets.cursor|codex|claude` so quota/cooldown and GUI budget UI can track it.
- Ensure any “fallbackPlatform” enums/selectors include `antigravity`.
- Ensure schema validation error messages enumerate the new platform name(s).
- Ensure type-only imports/exports are preserved (NodeNext ESM rules).

### Acceptance criteria
- [ ] New platform appears in `Platform` union
- [ ] `cliPaths` supports new platform key
- [ ] `budgets` supports new platform key
- [ ] Config schema validation accepts new platform
- [ ] `npm run typecheck` passes
- [ ] Targeted config tests pass

### Tests to run
```bash
npm run typecheck
npm test -- src/config
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## AGY-T03: Implement Antigravity Platform Runner (Gemini CLI headless)

### Title
Add new platform runner using Gemini CLI headless mode (platform id: `antigravity`)

### Goal
Implement a new `BasePlatformRunner` subclass that executes prompts via Gemini CLI headless mode and returns output reliably for Puppet Master.

### Depends on
- AGY-T01

### Read first
- `src/platforms/base-runner.ts`
- `src/platforms/claude-runner.ts` (pattern: -p prompt, parse signals)
- Gemini CLI headless output schema:
  - https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/headless.md
- Gemini CLI approval flags:
  - https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/get-started/configuration.md

### Files to create/modify
- `src/platforms/antigravity-runner.ts`
- `src/platforms/index.ts` (export)
- `src/platforms/<runner>.test.ts`

### Implementation notes
- Prefer `--output-format json` initially:
  - Parse JSON response, pull `response` into `ExecutionResult.output`.
  - If `.error` exists: mark `success=false` and populate `error`.
- Support model selection:
  - `-m <model>` / `--model <model>`
- Support Gemini CLI approval modes (including Plan Mode):
  - default: `--approval-mode auto_edit`
  - allow config override to `yolo` and `plan` (with docs noting `experimental.plan: true` prerequisite)
- Command path:
  - resolve from `cliPaths.antigravity` so users can point to `gemini` (default) or another wrapper binary.
- Fresh process invariant:
  - Do NOT use `--resume`
  - Do NOT rely on persistent sessions

### Acceptance criteria
- [ ] Runner spawns the configured Antigravity binary with `-p` and `--output-format json`
- [ ] Completion signals `<ralph>COMPLETE</ralph>` / `<ralph>GUTTER</ralph>` are detected from response text
- [ ] JSON error responses become `ExecutionResult.error`
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/platforms -t "antigravity"` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/platforms -t "antigravity"
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## AGY-T04: Supported Models + Plan Mode Surfacing

### Title
Load Antigravity/Gemini supported models and expose Plan Mode (if available)

### Goal
Provide a reliable, user-visible source of truth for:
- which models are “supported” for the `antigravity` platform (baseline list + user override)
- whether Plan Mode can be used (Gemini CLI `--approval-mode plan` + settings prerequisite)

### Depends on
- AGY-T02 (types + config)
- AGY-T03 (runner contract)

### Read first
- `STATE_FILES.md` Section 4 (Capability Discovery Files), especially `available_models`
- Antigravity reasoning model list:
  - https://antigravity.google/assets/docs/agent/models.md
- Gemini CLI model selection + preview features:
  - https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/model.md
  - https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/get-started/gemini-3.md
  - https://raw.githubusercontent.com/google-gemini/gemini-cli/main/schemas/settings.schema.json
- Gemini CLI planning toggle + approval mode:
  - https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/get-started/configuration.md

### Files to create/modify
- `src/platforms/antigravity-models.ts` (new: curated baseline models + helpers)
- `src/platforms/index.ts` (export)
- `src/gui/routes/config.ts` (add endpoint to surface model list to GUI)
- Tests adjacent to the above (Vitest)

### Implementation notes
- Baseline model list (seeded from Gemini CLI docs/schema; keep user-overridable):
  - `auto`
  - `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`
  - `gemini-3-pro-preview`, `gemini-3-flash-preview` (requires preview features)
- Don’t hard-fail if the runtime environment doesn’t have those models; treat the list as “suggested” unless discovery proves otherwise.
- Plan Mode:
  - Support passing `--approval-mode plan` in the runner when configured.
  - Document the prerequisite: `experimental.plan: true` in Gemini CLI settings (user-managed).
- Prefer exposing the model list to GUI via a simple endpoint (e.g., `GET /api/config/models`) returning `{ platforms: { antigravity: string[] } }`.

### Acceptance criteria
- [ ] Antigravity model list is available from backend code (single source of truth)
- [ ] GUI can fetch model suggestions via API endpoint
- [ ] Plan Mode prerequisites and limitations are explicitly documented in the plan and later in README
- [ ] `npm run typecheck` passes
- [ ] Targeted tests pass

### Tests to run
```bash
npm run typecheck
npm test -- src/platforms -t "antigravity"
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## AGY-T05: Platform Registry + Factory Wiring

### Title
Register new runner in platform registry

### Goal
Make the new platform selectable from config and instantiable at runtime.

### Depends on
- AGY-T02
- AGY-T03

### Read first
- `src/platforms/registry.ts`
- `src/platforms/index.ts`

### Files to create/modify
- `src/platforms/registry.ts`
- `src/platforms/index.ts`
- `src/platforms/registry.test.ts`

### Implementation notes
- Use `config.cliPaths.antigravity` when creating the runner (mirrors Cursor/Claude wiring).
- Keep Codex runner behavior unchanged unless explicitly refactoring all CLI paths (out of scope).

### Acceptance criteria
- [ ] Registry `createDefault()` registers the new platform
- [ ] `PlatformRegistry.getAvailable()` includes the new platform when configured
- [ ] `npm test -- src/platforms/registry.test.ts` passes

### Tests to run
```bash
npm test -- src/platforms/registry.test.ts
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## AGY-T06: Core Spawn/Execution Wiring (No Hardcoded Platform Switches)

### Title
Ensure core execution paths support the new platform end-to-end

### Goal
Update any platform `switch` statements / mappings so the new platform works everywhere (spawn, transcripts, status).

### Depends on
- AGY-T02
- AGY-T05

### Read first
- `src/core/fresh-spawn.ts` (platform → command mapping)
- `src/core/execution-engine.ts`
- `src/core/orchestrator.ts`
- `REQUIREMENTS.md` Section 26 (fresh spawn + runner contract)

### Files to create/modify
- `src/core/fresh-spawn.ts`
- Any additional file found via search for platform switches (`cursor|codex|claude|antigravity`)
- Corresponding tests (keep changes minimal and targeted)

### Implementation notes
- Prefer routing execution through `PlatformRegistry` runners (already config-aware) instead of hardcoding commands.
- If `FreshSpawner.buildCommand()` must remain, add a new case for the platform that respects config CLI paths (or refactor to use registry).

### Acceptance criteria
- [ ] No exhaustive-switch TypeScript errors after adding the platform
- [ ] New platform can be selected in tier config without runtime crashes
- [ ] `npm run typecheck` passes
- [ ] Targeted core tests pass

### Tests to run
```bash
npm run typecheck
npm test -- src/core
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## AGY-T07: Capability Discovery + Health Checks

### Title
Probe Antigravity (Gemini CLI) capabilities (version/output/approval/mcp/models)

### Goal
Extend capability discovery to correctly identify the new platform’s features and record them in `.puppet-master/capabilities/`.

### Depends on
- AGY-T02
- AGY-T03
- AGY-T04

### Read first
- `STATE_FILES.md` Section 4 (capability cache schema, including `available_models`)
- `src/platforms/capability-discovery.ts`
- `src/platforms/health-check.ts`
- Gemini CLI `--version` and headless docs:
  - https://github.com/google-gemini/gemini-cli
  - https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/headless.md

### Files to create/modify
- `src/platforms/capability-discovery.ts`
- `src/platforms/health-check.ts`
- Related tests under `src/platforms/`

### Implementation notes
- Version probe: run `${cliPaths.antigravity} --version`
- Basic smoke probe (headless): `${cliPaths.antigravity} -p "ping" --output-format json`
  - If auth error, surface as “installed but not authenticated”
- Capabilities to set:
  - nonInteractive: true
  - modelSelection: true
  - streaming: full (if stream-json supported)
  - sessionResume: false (Puppet Master disallows; CLI may support)
  - mcpSupport: true (Gemini CLI supports MCP servers)
- Populate `available_models` for `antigravity` from AGY-T04’s curated list (and/or any reliable discovery).

### Acceptance criteria
- [ ] Discovery produces a stable capabilities record for the platform
- [ ] Health check distinguishes missing binary vs missing auth
- [ ] `npm test -- src/platforms -t "capability"` passes

### Tests to run
```bash
npm test -- src/platforms -t "capability"
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## AGY-T08: Doctor + Install Checks + “Fix” Support

### Title
Add Doctor + Install checks for Antigravity (Gemini CLI) and optional `agy` launcher

### Goal
Surface actionable setup guidance from:
- `puppet-master doctor` (detect/install/auth guidance)
- `puppet-master install` (install missing tools)

### Depends on
- AGY-T02
- AGY-T03
- AGY-T04

### Read first
- `src/cli/commands/doctor.ts`
- `src/cli/commands/install.ts`
- `src/doctor/checks/cli-tools.ts`
- `src/doctor/installation-manager.ts`
- Gemini CLI install/auth docs:
  - https://github.com/google-gemini/gemini-cli

### Files to create/modify
- `src/doctor/checks/cli-tools.ts` (add `AntigravityCliCheck`, optional `AgyCliCheck`)
- `src/cli/commands/doctor.ts` (register new checks)
- `src/cli/commands/install.ts` (register new checks + tool name mapping)
- `src/doctor/installation-manager.ts` (install commands)
- Tests in `src/cli/commands/doctor.test.ts` and/or `src/doctor/*`

### Implementation notes
- Install commands:
  - npm: `npm install -g @google/gemini-cli`
  - brew (macOS/Linux): `brew install gemini-cli`
- Auth guidance (Doctor output):
  - “Run `gemini` once and choose ‘Login with Google’”
  - Or set `GEMINI_API_KEY` (AI Studio key) / Vertex env vars for enterprise
- Plan Mode guidance:
  - To use `--approval-mode plan`, user must enable `experimental.plan: true` in Gemini CLI settings (`~/.gemini/settings.json` or project `.gemini/settings.json`).

### Acceptance criteria
- [ ] `puppet-master doctor` reports Antigravity (Gemini CLI) as installed/missing with clear fix instructions
- [ ] Doctor distinguishes missing binary vs missing auth (if detectable)
- [ ] `puppet-master install --all` includes Antigravity tool installation
- [ ] `npm test -- src/cli/commands/doctor.test.ts` passes

### Tests to run
```bash
npm test -- src/cli/commands/doctor.test.ts
npm test -- src/cli/commands/install.test.ts
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## AGY-T09: GUI Updates (Config + Budgets + Model Suggestions)

### Title
Update the GUI to support `antigravity` platform selection and model/budget UX

### Goal
Ensure the local GUI can:
- select `antigravity` in tier platform dropdowns
- configure budgets + fallback platforms including `antigravity`
- show Antigravity budget usage on the dashboard
- surface model suggestions for Antigravity (from AGY-T04)

### Depends on
- AGY-T02
- AGY-T04

### Read first
- `src/gui/server.ts` (route wiring)
- `src/gui/routes/config.ts` (config API)
- `src/gui/public/config.html` + `src/gui/public/js/config.js`
- `src/gui/public/index.html` + `src/gui/public/js/dashboard.js`

### Files to create/modify
- `src/gui/public/config.html`
- `src/gui/public/js/config.js`
- `src/gui/public/index.html`
- `src/gui/public/js/dashboard.js`
- (optional) `src/gui/routes/config.ts` (if adding a models endpoint wasn’t done in AGY-T04)
- GUI tests (`src/gui/*.test.ts`) as needed

### Implementation notes
- Add `antigravity` to every platform `<select>` in `config.html` (tiers + budgets fallback selectors).
- Add an Antigravity budget panel mirroring existing budgets (maxCallsPerRun/Hour/Day, cooldownHours, fallbackPlatform).
- Update dashboard budget UI:
  - Add a `budget-antigravity` element in `index.html`
  - Extend `dashboard.js` budget rendering to include `antigravity`
- Model suggestions:
  - Prefer an `<input list="...">` datalist approach so users can still type custom models.
  - Populate the datalist via the new models endpoint added in AGY-T04.

### Acceptance criteria
- [ ] GUI tier platform dropdowns include `antigravity`
- [ ] GUI budgets tab supports `budgets.antigravity` + fallback selection
- [ ] Dashboard displays Antigravity budget usage if present
- [ ] Model suggestions appear for Antigravity without restricting manual entry
- [ ] `npm test -- src/gui` passes

### Tests to run
```bash
npm test -- src/gui
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## AGY-T10: Documentation + Examples

### Title
Document the new Google platform end-to-end

### Goal
Update canonical docs and examples so users can install, authenticate, and configure the new platform correctly.

### Depends on
- AGY-T02

### Read first
- `README.md`
- `REQUIREMENTS.md` Section 3.1 and Section 4
- `PROJECT_SETUP_GUIDE.md`

### Files to create/modify
- `README.md`
- `REQUIREMENTS.md`
- `PROJECT_SETUP_GUIDE.md` (or another canonical setup doc)
- Any config example(s) that enumerate platforms (if present)

### Implementation notes
- Update supported platform table(s) to include:
  - Platform id: `antigravity`
  - Default CLI binary: `gemini` (via `cliPaths.antigravity`)
  - Optional: mention `agy` as the GUI launcher (not the headless runner unless proven)
- Add an “Auth quickstart” section for Google OAuth and/or API key / Vertex auth.
- Add “Plan Mode” documentation:
  - how Puppet Master maps config → `--approval-mode plan`
  - prerequisite `experimental.plan: true` in Gemini CLI settings
- Add “Supported models” documentation:
  - baseline model names + “Auto” recommendation
  - how to enable preview features for Gemini 3 models

### Acceptance criteria
- [ ] Docs list the new platform and its CLI command
- [ ] Docs show install + auth steps
- [ ] Docs show example tier config snippet using the platform

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## AGY-T11: Validation Gate (Integration-Level)

### Title
Run end-to-end validation for the new platform integration

### Goal
Prove that selecting the new platform in config can run at least one iteration end-to-end in a real workspace (smoke test).

### Depends on
- AGY-T05–AGY-T10

### Evidence to record
- `.puppet-master/capabilities/<platform>.json`
- `.puppet-master/evidence/test-logs/` output from the run

### Manual smoke test recipe (local machine)
1. Install Gemini CLI and authenticate:
   - `npm install -g @google/gemini-cli`
   - `gemini` → “Login with Google”
2. Configure Puppet Master tier(s) to use `platform: antigravity` (and pick an appropriate model).
3. Run a small, non-destructive subtask against a toy repo and confirm:
   - fresh process
   - completion signal parsing
   - filesChanged detection + gating behavior (as applicable)

### Acceptance criteria
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes (or at least `npm test -- src/platforms` and core subset)
- [ ] Smoke test run completes and produces evidence artifacts

### Commands to run
```bash
npm run typecheck
npm test
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## AGY-T12: Additional Hardcoded Platform References (Gap Analysis)

### Title
Update all remaining hardcoded platform references discovered during code review

### Goal
Ensure NO hardcoded `'cursor' | 'codex' | 'claude'` patterns remain without `antigravity`.

### Depends on
- AGY-T02 (after types are updated, these become type errors or obvious mismatches)

### Discovered gaps (not covered in AGY-T01–T11)

| File | Line(s) | Issue | Fix |
|------|---------|-------|-----|
| `src/logging/event-bus.ts` | 27 | `budget_update` event has hardcoded platform union | Add `'antigravity'` to union |
| `src/start-chain/validation-gate.ts` | 347 | `validPlatforms` array hardcoded | Add `'antigravity'` to array |
| `src/memory/progress-manager.ts` | 203 | Platform string parsing check hardcoded | Add `'antigravity'` to condition |
| `src/gui/public/config.html` | 365-436 | Budget section only has claude/codex/cursor blocks | Add full `antigravity` budget fieldset |
| `src/gui/public/config.html` | 486-495 | CLI paths section only has 3 platforms | Add `antigravity` CLI path input |
| `src/gui/public/index.html` | 84 | Budget display only shows 3 platforms | Add `budget-antigravity` span |
| `src/platforms/quota-manager.test.ts` | 285, 346, 366 | Test assertions expect only 3 platforms | Add `'antigravity'` to expected arrays |
| `.cursorrules` | 31 | Documents Platform type (non-blocking but should update) | Update example |

### Files to modify
- `src/logging/event-bus.ts`
- `src/start-chain/validation-gate.ts`
- `src/memory/progress-manager.ts`
- `src/gui/public/config.html`
- `src/gui/public/index.html`
- `src/platforms/quota-manager.test.ts`
- `.cursorrules` (optional, for documentation consistency)

### Implementation notes
- These are mostly mechanical additions (add `'antigravity'` to existing lists/unions)
- The event-bus.ts change is a type definition, not runtime logic
- The GUI HTML changes require copying existing platform blocks and updating IDs/labels
- The validation-gate.ts and progress-manager.ts are runtime arrays that must include the new platform

### Acceptance criteria
- [ ] No grep matches for `'cursor' | 'codex' | 'claude'` without `antigravity` in source files
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes

### Tests to run
```bash
npm run typecheck
npm test
# Verify no hardcoded platform lists remain:
grep -rn "'cursor'.*'codex'.*'claude'" src/ --include="*.ts" --include="*.js"
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

# COPILOT PLATFORM TASKS (CPL-Txx)

---

## CPL-T01: Confirm CLI Contract + Platform Naming

### Title
Decide what "Copilot CLI" means in Puppet Master

### Goal
Lock in the supported GitHub Copilot CLI behavior, platform id, and required flags/output contract.

### Depends on
- none

### Read first
- `REQUIREMENTS.md` Section 3–4 (platform table + no-APIs constraint)
- GitHub Copilot CLI docs:
  - https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli
  - https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli
  - https://github.com/github/copilot-cli

### Deliverables (write down decisions in this file)
- Canonical platform id: `copilot`
- Underlying runner binary: `copilot`
- Output format: text-based (no JSON mode documented); parse for `<ralph>COMPLETE</ralph>` / `<ralph>GUTTER</ralph>`
- Approval mode mapping:
  - `--allow-all-tools` for headless/yolo mode
  - `--silent` to suppress stats noise
- Supported models:
  - `claude-sonnet-4.5` (default), `claude-sonnet-4`, `gpt-5`, `gpt-5-mini`, `gpt-4.1`

### Acceptance criteria
- [ ] Platform id decision recorded (and rationale)
- [ ] Primary CLI binary and flags recorded
- [ ] Output parsing strategy recorded
- [ ] Approval behavior mapped to Puppet Master tier config

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## CPL-T02: Types + Config Schema Updates

### Title
Add Copilot platform to config + type system

### Goal
Extend the canonical `Platform` type and all config surfaces so Copilot can be selected per tier.

### Depends on
- CPL-T01

### Read first
- `src/types/config.ts` (Platform, CliPathsConfig, budgets)
- `src/config/config-schema.ts` (validateConfig, isPlatform, cliPaths validation)
- `src/config/default-config.ts`
- `REQUIREMENTS.md` Section 3.1 (supported platforms table)

### Files to create/modify
- `src/types/config.ts`
- `src/config/config-schema.ts`
- `src/config/default-config.ts`
- `src/config/config-manager.ts` (if mapping/serialization changes needed)
- `src/types/index.ts` (barrel exports, if needed)
- tests adjacent to the above (keep Vitest)

### Implementation notes
- Add `copilot` to the canonical `Platform` union.
- Add `cliPaths.copilot: string` (default: `copilot`).
- Add `budgets.copilot` alongside existing budgets.
- Ensure any "fallbackPlatform" enums/selectors include `copilot`.
- Ensure schema validation error messages enumerate the new platform name.
- Ensure type-only imports/exports are preserved (NodeNext ESM rules).

### Acceptance criteria
- [ ] New platform appears in `Platform` union
- [ ] `cliPaths` supports new platform key
- [ ] `budgets` supports new platform key
- [ ] Config schema validation accepts new platform
- [ ] `npm run typecheck` passes
- [ ] Targeted config tests pass

### Tests to run
```bash
npm run typecheck
npm test -- src/config
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## CPL-T03: Implement Copilot Platform Runner

### Title
Add new platform runner using GitHub Copilot CLI programmatic mode (platform id: `copilot`)

### Goal
Implement a new `BasePlatformRunner` subclass that executes prompts via Copilot CLI programmatic mode.

### Depends on
- CPL-T01

### Read first
- `src/platforms/base-runner.ts`
- `src/platforms/claude-runner.ts` (pattern: -p prompt, parse signals)
- `src/platforms/cursor-runner.ts` (similar pattern)
- GitHub Copilot CLI docs:
  - https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli

### Files to create/modify
- `src/platforms/copilot-runner.ts` (NEW FILE)
- `src/platforms/index.ts` (export)
- `src/platforms/copilot-runner.test.ts` (NEW FILE)

### Implementation notes
- Use `-p "..."` for non-interactive prompt execution
- Use `--allow-all-tools` for headless mode (when tier config requires it)
- Use `--silent` to suppress stats output
- Use `--model <model>` for model selection
- Parse text output for `<ralph>COMPLETE</ralph>` / `<ralph>GUTTER</ralph>` signals
- Command path: resolve from `cliPaths.copilot`
- Fresh process invariant: do NOT use `--resume`

### Acceptance criteria
- [ ] Runner spawns the configured Copilot binary with `-p`
- [ ] Completion signals are detected from response text
- [ ] Model selection works via `--model` flag
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/platforms -t "copilot"` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/platforms -t "copilot"
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## CPL-T04: Supported Models

### Title
Load Copilot supported models

### Goal
Provide a reliable, user-visible source of truth for which models are "supported" for the `copilot` platform.

### Depends on
- CPL-T02 (types + config)
- CPL-T03 (runner contract)

### Read first
- `STATE_FILES.md` Section 4 (Capability Discovery Files)
- GitHub Copilot CLI model docs:
  - https://github.blog/changelog/2026-01-14-github-copilot-cli-enhanced-agents-context-management-and-new-ways-to-install/

### Files to create/modify
- `src/platforms/copilot-models.ts` (NEW: curated baseline models)
- `src/platforms/index.ts` (export)
- Tests adjacent to the above (Vitest)

### Implementation notes
- Baseline model list:
  - `claude-sonnet-4.5` (default)
  - `claude-sonnet-4`
  - `gpt-5`
  - `gpt-5-mini`
  - `gpt-4.1`
- Note: Models are included with Copilot subscription; no separate billing.
- Keep list user-overridable in config.

### Acceptance criteria
- [ ] Copilot model list is available from backend code
- [ ] GUI can fetch model suggestions via API endpoint
- [ ] `npm run typecheck` passes
- [ ] Targeted tests pass

### Tests to run
```bash
npm run typecheck
npm test -- src/platforms -t "copilot"
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## CPL-T05: Platform Registry + Factory Wiring

### Title
Register Copilot runner in platform registry

### Goal
Make the Copilot platform selectable from config and instantiable at runtime.

### Depends on
- CPL-T02
- CPL-T03

### Read first
- `src/platforms/registry.ts`
- `src/platforms/index.ts`

### Files to create/modify
- `src/platforms/registry.ts`
- `src/platforms/index.ts`
- `src/platforms/registry.test.ts`

### Implementation notes
- Use `config.cliPaths.copilot` when creating the runner (mirrors existing platform wiring).

### Acceptance criteria
- [ ] Registry `createDefault()` registers CopilotRunner
- [ ] `PlatformRegistry.getAvailable()` includes copilot when configured
- [ ] `npm test -- src/platforms/registry.test.ts` passes

### Tests to run
```bash
npm test -- src/platforms/registry.test.ts
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## CPL-T06: Core Spawn/Execution Wiring

### Title
Ensure core execution paths support Copilot platform end-to-end

### Goal
Update any platform `switch` statements / mappings so Copilot works everywhere.

### Depends on
- CPL-T02
- CPL-T05

### Read first
- `src/core/fresh-spawn.ts` (platform → command mapping)
- `src/core/execution-engine.ts`
- `src/core/orchestrator.ts`

### Files to create/modify
- `src/core/fresh-spawn.ts`
- Any additional file found via search for platform switches
- Corresponding tests

### Implementation notes
- Add switch case: `case 'copilot': return { command: 'copilot', args: ['-p', request.prompt, '--allow-all-tools', '--silent'] };`
- Ensure exhaustive-switch TypeScript checking passes.

### Acceptance criteria
- [ ] No exhaustive-switch TypeScript errors after adding the platform
- [ ] Copilot can be selected in tier config without runtime crashes
- [ ] `npm run typecheck` passes
- [ ] Targeted core tests pass

### Tests to run
```bash
npm run typecheck
npm test -- src/core
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## CPL-T07: Capability Discovery + Health Checks

### Title
Probe Copilot CLI capabilities

### Goal
Extend capability discovery to correctly identify Copilot's features and record them in `.puppet-master/capabilities/`.

### Depends on
- CPL-T02
- CPL-T03
- CPL-T04

### Read first
- `STATE_FILES.md` Section 4 (capability cache schema)
- `src/platforms/capability-discovery.ts`
- `src/platforms/health-check.ts`

### Files to create/modify
- `src/platforms/capability-discovery.ts`
- `src/platforms/health-check.ts`
- Related tests under `src/platforms/`

### Implementation notes
- Version probe: run `${cliPaths.copilot} --version` (if supported) or check for binary existence
- Basic smoke probe: `${cliPaths.copilot} -p "ping" --silent`
  - If auth error, surface as "installed but not authenticated"
- Capabilities to set:
  - nonInteractive: true
  - modelSelection: true
  - streaming: partial (text-based)
  - sessionResume: false (Puppet Master disallows)
  - mcpSupport: true (Copilot CLI supports MCP servers)
- Detect auth via `GH_TOKEN` / `GITHUB_TOKEN` environment variables

### Acceptance criteria
- [ ] Discovery produces a stable capabilities record for copilot
- [ ] Health check distinguishes missing binary vs missing auth
- [ ] `npm test -- src/platforms -t "capability"` passes

### Tests to run
```bash
npm test -- src/platforms -t "capability"
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## CPL-T08: Doctor + Install Checks

### Title
Add Doctor + Install checks for Copilot CLI

### Goal
Surface actionable setup guidance from `puppet-master doctor` and `puppet-master install`.

### Depends on
- CPL-T02
- CPL-T03
- CPL-T04

### Read first
- `src/cli/commands/doctor.ts`
- `src/cli/commands/install.ts`
- `src/doctor/checks/cli-tools.ts`
- `src/doctor/installation-manager.ts`

### Files to create/modify
- `src/doctor/checks/cli-tools.ts` (add `CopilotCliCheck`)
- `src/cli/commands/doctor.ts` (register new check)
- `src/cli/commands/install.ts` (register new check + tool name mapping)
- `src/doctor/installation-manager.ts` (install commands)
- Tests in `src/cli/commands/doctor.test.ts` and/or `src/doctor/*`

### Implementation notes
- Install commands:
  - npm: `npm install -g @github/copilot`
  - Homebrew: `brew install copilot-cli`
  - curl: `curl -fsSL https://gh.io/copilot-install | bash`
- Auth guidance (Doctor output):
  - "Run `copilot` and use `/login` to authenticate with GitHub"
  - Or set `GH_TOKEN` / `GITHUB_TOKEN` environment variable
  - Requires active GitHub Copilot subscription (Individual, Business, or Enterprise)

### Acceptance criteria
- [ ] `puppet-master doctor` reports Copilot CLI as installed/missing with clear fix instructions
- [ ] Doctor distinguishes missing binary vs missing auth (if detectable)
- [ ] `puppet-master install --all` includes Copilot tool installation
- [ ] `npm test -- src/cli/commands/doctor.test.ts` passes

### Tests to run
```bash
npm test -- src/cli/commands/doctor.test.ts
npm test -- src/cli/commands/install.test.ts
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## CPL-T09: Validation Gate (Integration-Level)

### Title
Run end-to-end validation for Copilot platform integration

### Goal
Prove that selecting Copilot in config can run at least one iteration end-to-end in a real workspace.

### Depends on
- CPL-T05–CPL-T08

### Evidence to record
- `.puppet-master/capabilities/copilot.json`
- `.puppet-master/evidence/test-logs/` output from the run

### Manual smoke test recipe (local machine)
1. Install Copilot CLI and authenticate:
   - `npm install -g @github/copilot`
   - `copilot` → `/login`
2. Configure Puppet Master tier(s) to use `platform: copilot`.
3. Run a small, non-destructive subtask and confirm:
   - fresh process
   - completion signal parsing
   - filesChanged detection + gating behavior

### Acceptance criteria
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes (or at least `npm test -- src/platforms` and core subset)
- [ ] Smoke test run completes and produces evidence artifacts

### Commands to run
```bash
npm run typecheck
npm test
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

# CROSS-PLATFORM TASKS (BOTH-Txx)

These tasks handle changes that apply to BOTH new platforms simultaneously.

---

## BOTH-T01: GUI Updates for Both Platforms

### Title
Update GUI to support `antigravity` and `copilot` platform selection

### Goal
Ensure the local GUI can:
- Select both new platforms in tier platform dropdowns
- Configure budgets + fallback platforms for both
- Show budget usage for both on the dashboard
- Surface model suggestions for both platforms

### Depends on
- AGY-T02, CPL-T02 (types must be in place)

### Read first
- `src/gui/server.ts` (route wiring)
- `src/gui/routes/config.ts` (config API)
- `src/gui/public/config.html` + `src/gui/public/js/config.js`
- `src/gui/public/index.html` + `src/gui/public/js/dashboard.js`

### Files to create/modify
- `src/gui/public/config.html`
- `src/gui/public/js/config.js`
- `src/gui/public/index.html`
- `src/gui/public/js/dashboard.js`
- GUI tests (`src/gui/*.test.ts`) as needed

### Implementation notes
- Add `antigravity` and `copilot` to every platform `<select>` in config.html
- Add budget panels for both platforms mirroring existing budgets
- Update dashboard budget UI to include both new platforms
- Model suggestions via datalist approach (user can still type custom models)

### Acceptance criteria
- [ ] GUI tier platform dropdowns include both `antigravity` and `copilot`
- [ ] GUI budgets tab supports both new platforms + fallback selection
- [ ] Dashboard displays budget usage for both new platforms
- [ ] Model suggestions appear for both platforms
- [ ] `npm test -- src/gui` passes

### Tests to run
```bash
npm test -- src/gui
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## BOTH-T02: Documentation Updates

### Title
Document both new platforms end-to-end

### Goal
Update canonical docs and examples so users can install, authenticate, and configure both new platforms.

### Depends on
- AGY-T02, CPL-T02 (types must be in place)

### Read first
- `README.md`
- `REQUIREMENTS.md` Section 3.1 and Section 4
- `PROJECT_SETUP_GUIDE.md`

### Files to create/modify
- `README.md`
- `REQUIREMENTS.md`
- `PROJECT_SETUP_GUIDE.md` (or another canonical setup doc)
- Any config example(s) that enumerate platforms

### Implementation notes
- Update supported platform table(s) to include:
  - Platform id: `antigravity` | Default CLI: `gemini`
  - Platform id: `copilot` | Default CLI: `copilot`
- Add "Auth quickstart" section for each platform
- Add "Supported models" documentation for each platform

### Acceptance criteria
- [ ] Docs list both new platforms and their CLI commands
- [ ] Docs show install + auth steps for each
- [ ] Docs show example tier config snippets using each platform

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## BOTH-T03: Hardcoded Platform Reference Fixes

### Title
Update all remaining hardcoded platform references for both new platforms

### Goal
Ensure NO hardcoded `'cursor' | 'codex' | 'claude'` patterns remain without both `antigravity` and `copilot`.

### Depends on
- AGY-T02, CPL-T02 (after types are updated)

### Discovered gaps

| File | Line(s) | Issue | Fix |
|------|---------|-------|-----|
| `src/logging/event-bus.ts` | 27 | `budget_update` event hardcoded | Add both platforms |
| `src/start-chain/validation-gate.ts` | 347 | `validPlatforms` array hardcoded | Add both platforms |
| `src/memory/progress-manager.ts` | 203 | Platform string parsing hardcoded | Add both platforms |
| `src/platforms/quota-manager.test.ts` | 285, 346, 366 | Test assertions | Add both platforms |
| `.cursorrules` | 31 | Documents Platform type | Update example |

### Files to modify
- `src/logging/event-bus.ts`
- `src/start-chain/validation-gate.ts`
- `src/memory/progress-manager.ts`
- `src/platforms/quota-manager.test.ts`
- `.cursorrules` (optional, for documentation consistency)

### Acceptance criteria
- [ ] No grep matches for platform lists without both new platforms in source files
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes

### Tests to run
```bash
npm run typecheck
npm test
grep -rn "'cursor'.*'codex'.*'claude'" src/ --include="*.ts" --include="*.js"
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## BOTH-T04: Integration Validation

### Title
Run full integration validation for both new platforms

### Goal
Prove that both new platforms work end-to-end in Puppet Master.

### Depends on
- AGY-T11 (Antigravity validation)
- CPL-T09 (Copilot validation)
- BOTH-T01, BOTH-T02, BOTH-T03

### Evidence to record
- `.puppet-master/capabilities/antigravity.json`
- `.puppet-master/capabilities/copilot.json`
- `.puppet-master/evidence/test-logs/` output from runs

### Acceptance criteria
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes (full suite)
- [ ] Both platforms can be selected and run at least one iteration
- [ ] GUI correctly displays both platforms in all relevant places

### Commands to run
```bash
npm run typecheck
npm test
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## Updated Task Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           ANTIGRAVITY TRACK                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│ AGY-T01 (CLI Contract)                                                          │
│     │                                                                           │
│     ├── AGY-T02 (Types) ────┬── AGY-T04 (Models) ─┬── AGY-T05 (Registry) ──┐   │
│     │                       │                     │                         │   │
│     │                       │                     └── AGY-T06 (Spawn) ──────┤   │
│     │                       │                                               │   │
│     └── AGY-T03 (Runner) ───┼── AGY-T07 (Capability) ───────────────────────┤   │
│                             │                                               │   │
│                             └── AGY-T08 (Doctor) ───────────────────────────┤   │
│                                                                             │   │
│                                                                             v   │
│                                                                   AGY-T11 (Val) │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                             COPILOT TRACK                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│ CPL-T01 (CLI Contract)                                                          │
│     │                                                                           │
│     ├── CPL-T02 (Types) ────┬── CPL-T04 (Models) ─┬── CPL-T05 (Registry) ──┐   │
│     │                       │                     │                         │   │
│     │                       │                     └── CPL-T06 (Spawn) ──────┤   │
│     │                       │                                               │   │
│     └── CPL-T03 (Runner) ───┼── CPL-T07 (Capability) ───────────────────────┤   │
│                             │                                               │   │
│                             └── CPL-T08 (Doctor) ───────────────────────────┤   │
│                                                                             │   │
│                                                                             v   │
│                                                                   CPL-T09 (Val) │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CROSS-PLATFORM                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ AGY-T02 ──┬── BOTH-T01 (GUI) ────────────────────────────────────────┐         │
│           │                                                           │         │
│ CPL-T02 ──┼── BOTH-T02 (Docs) ───────────────────────────────────────┤         │
│           │                                                           │         │
│           └── BOTH-T03 (Hardcoded Refs) ─────────────────────────────┤         │
│                                                                       │         │
│ AGY-T11 ──┬                                                           │         │
│           ├── BOTH-T04 (Integration Validation) ◄────────────────────┘         │
│ CPL-T09 ──┘                                                                     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Summary of All Files to Modify

### Critical Path (Types + Core) — BOTH PLATFORMS

| Task | File | Change |
|------|------|--------|
| AGY-T02 + CPL-T02 | `src/types/config.ts` | Add `'antigravity' \| 'copilot'` to Platform, CliPathsConfig, PlatformBudgets |
| AGY-T02 + CPL-T02 | `src/config/config-schema.ts` | Add validation for both platforms |
| AGY-T02 + CPL-T02 | `src/config/default-config.ts` | Add default cliPaths + budgets for both |
| AGY-T03 | `src/platforms/antigravity-runner.ts` | NEW FILE |
| CPL-T03 | `src/platforms/copilot-runner.ts` | NEW FILE |
| AGY-T05 + CPL-T05 | `src/platforms/registry.ts` | Register both runners |
| AGY-T06 + CPL-T06 | `src/core/fresh-spawn.ts` | Add switch cases for both platforms |

### Models

| Task | File | Change |
|------|------|--------|
| AGY-T04 | `src/platforms/antigravity-models.ts` | NEW FILE |
| CPL-T04 | `src/platforms/copilot-models.ts` | NEW FILE |

### Discovery + Health

| Task | File | Change |
|------|------|--------|
| AGY-T07 + CPL-T07 | `src/platforms/capability-discovery.ts` | Add getPlatformCommand cases |
| AGY-T07 + CPL-T07 | `src/platforms/health-check.ts` | Add getPlatformCommand cases |
| AGY-T08 | `src/doctor/checks/cli-tools.ts` | Add AntigravityCliCheck class |
| CPL-T08 | `src/doctor/checks/cli-tools.ts` | Add CopilotCliCheck class |
| AGY-T08 + CPL-T08 | `src/doctor/installation-manager.ts` | Register install commands for both |

### GUI (BOTH-T01)

| Task | File | Change |
|------|------|--------|
| BOTH-T01 | `src/gui/public/config.html` | Add platform options + budget fieldsets + CLI path inputs |
| BOTH-T01 | `src/gui/public/index.html` | Add budget spans for both platforms |
| BOTH-T01 | `src/gui/public/js/config.js` | Add both platforms to loops |
| BOTH-T01 | `src/gui/public/js/dashboard.js` | Add budget rendering for both |

### Hardcoded Refs (BOTH-T03)

| Task | File | Change |
|------|------|--------|
| BOTH-T03 | `src/logging/event-bus.ts` | Add both platforms to budget_update event type |
| BOTH-T03 | `src/start-chain/validation-gate.ts` | Add both platforms to validPlatforms array |
| BOTH-T03 | `src/memory/progress-manager.ts` | Add both platforms to platform parsing |
| BOTH-T03 | `src/platforms/quota-manager.test.ts` | Update test assertions for 5 platforms |
| BOTH-T03 | `.cursorrules` | Update Platform type example |

### Documentation (BOTH-T02)

| Task | File | Change |
|------|------|--------|
| BOTH-T02 | `README.md` | Add both platforms to supported platforms |
| BOTH-T02 | `REQUIREMENTS.md` | Update platform table |
| BOTH-T02 | `PROJECT_SETUP_GUIDE.md` | Add setup instructions for both |

---

## Platform Comparison Table

| Feature | Cursor | Codex | Claude | Antigravity | Copilot |
|---------|--------|-------|--------|-------------|---------|
| CLI Binary | `cursor-agent` | `codex` | `claude` | `gemini` | `copilot` |
| Headless Flag | `-p` | `exec` | `-p` | `-p` | `-p` |
| JSON Output | No | Yes | No | Yes | No |
| Approval Flag | env var | `--path` | N/A | `--approval-mode` | `--allow-all-tools` |
| Model Flag | N/A | `--model` | N/A | `--model` | `--model` |
| MCP Support | Yes | Yes | Yes | Yes | Yes |
| Auth Method | Cursor account | OpenAI key | Anthropic | Google OAuth/API key | GitHub OAuth/PAT |

---

*End of addgravity.md*
