# RWM Puppet Master — addgravity.md

> Plan: Add Google Gemini CLI, Google Antigravity, and GitHub Copilot CLI as supported platforms
> Status: Planning
> Scope: Config + runners + model catalogs + plan-mode + discovery + doctor/install + GUI + docs + tests
> BUILD_QUEUE-style execution plan: `BUILD_QUEUE_ADDGRAVITY.md`

**Platforms being added:**
- `gemini` — Google's Gemini CLI (terminal-first, fully headless)
- `antigravity` — Google Antigravity IDE (launcher-only, ❌ no headless support)
- `copilot` — GitHub Copilot CLI (programmatic mode)

---

## Important Distinctions

| Component | Description | Binary | Headless Mode |
|-----------|-------------|--------|---------------|
| **Gemini Models** | Google's LLM models (gemini-2.5-pro, gemini-3-pro, etc.) | N/A | N/A |
| **Gemini CLI** | Open-source terminal agent for Gemini models | `gemini` | ✅ Full (`-p`, `--output-format json`) |
| **Antigravity** | Google's agent-first IDE with Agent Manager | `agy` (launcher) / `antigravity` (binary) | ❌ Not supported (GUI launcher only) |

**Key insight:** Gemini CLI and Antigravity are **separate products** that both use Gemini models:
- **Gemini CLI** is terminal-first and explicitly designed for headless/scripted automation
- **Antigravity** is IDE-first with an Agent Manager UI; the `agy` command is primarily a launcher

Primary sources:
- Gemini CLI repo + headless docs: https://github.com/google-gemini/gemini-cli and https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/headless.md
- Antigravity codelab (documents `agy` as an app launcher): https://codelabs.developers.google.com/getting-started-google-antigravity
- Antigravity Agent docs (models, rules/workflows, skills): https://antigravity.google/assets/docs/agent/models.md, https://antigravity.google/assets/docs/agent/rules-workflows.md, https://antigravity.google/assets/docs/agent/skills.md

---

## Research Summary (2026-01-21)

### What Google ships (relevant to Puppet Master)

#### Google Antigravity (desktop "agentic development platform")
- Product site: https://antigravity.google/
- Official codelab ("Getting Started with Google Antigravity"): https://codelabs.developers.google.com/getting-started-google-antigravity
  - During setup, Antigravity can install a command-line launcher named `agy` ("open Antigravity with `agy`").
- Antigravity docs (examples):
  - Models: Antigravity's reasoning model selector includes Gemini + Claude + GPT-OSS options (availability depends on account/plan):
    - Source: https://antigravity.google/assets/docs/agent/models.md
  - Rules: global rules live at `~/.gemini/GEMINI.md` and workspace rules in `.agent/rules/`
    - Source: https://antigravity.google/assets/docs/agent/rules-workflows.md
  - Workflows: saved as markdown and invoked in Agent via `/workflow-name`
    - Source: https://antigravity.google/assets/docs/agent/rules-workflows.md
  - Skills: supports workspace skills in `<workspace-root>/.agent/skills/` and global skills in `~/.gemini/antigravity/global_skills/`
    - Source: https://antigravity.google/assets/docs/agent/skills.md
- **Headless/Automation capabilities** (based on what is documented today):
  - Antigravity supports Rules, Workflows, and Skills (file-based; workspace/global)
  - The codelab documents `agy` as a command-line tool to open Antigravity (launcher behavior)
  - **Investigation complete (AG-P1-T11):** `agy` is a launcher-only tool with no headless/automation support.
  - **Possible binary naming mismatch:** some installs may provide an `antigravity` executable and use `agy` as a shim/alias

**Key implication:** Treat `antigravity` as a distinct platform from `gemini`. Only implement an automated runner if `agy` (or another documented Antigravity CLI) supports non-interactive execution; otherwise implement a clear “unsupported in headless mode” path and use `gemini` for headless Google automation.

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

### Recommendations

#### 1. Gemini CLI (`platform: gemini`) — RECOMMENDED, READY
- **Platform id:** `gemini`
- **CLI binary:** `gemini`
- **Headless flags:** `-p "..." --output-format json --approval-mode yolo`
- **Status:** ✅ Fully documented headless mode, ready to implement

#### 2. Antigravity (`platform: antigravity`) — LAUNCHER-ONLY (INVESTIGATION COMPLETE)
- **Platform id:** `antigravity`
- **CLI binary:** `agy`
- **Headless flags:** ❌ **Not supported** (launcher-only)
- **Status:** ✅ **Investigated (AG-P1-T11)** - Launcher-only; no headless mode available

Investigation results (AG-P1-T11):
- `agy` functions like `code .` for VS Code - opens Antigravity IDE
- No `-p`, `--prompt`, `--output-format`, `--json`, or similar flags
- For headless Google model automation, use `gemini` platform instead
- See src/platforms/antigravity-runner.ts for implementation details

#### 3. Both platforms share Gemini models
- Both can use: `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-3-pro`, etc.
- Model selection is separate from platform selection

### Open Decisions / Questions — Gemini CLI

1. **Platform id:** `gemini` (confirmed)
2. **Model catalog:** Ship curated set from Gemini CLI docs + allow user override
3. **Plan mode:** Expose `--approval-mode plan` as config knob (requires `experimental.plan: true`)
4. **Output format:** Default to `--output-format json` (simplest + stable)

### Open Decisions / Questions — Antigravity

1. **Platform id:** `antigravity` (confirmed)
2. **Critical question:** Does `agy` support headless execution?
   - Need to test: `agy --help`, `agy -p "..."`, etc.
   - If NO headless mode exists, options:
     a. Skip Antigravity platform for now
     b. Implement as "launch Antigravity GUI with pre-loaded prompt" (not true headless)
     c. Wait for Google to add headless support
3. **Plan/TODO/Workflow support:** Antigravity has **Workflows** (invoked via `/workflow-name`) and file-based **Rules/Skills**. Decide what parts Puppet Master should surface in the GUI/CLI (model list suggestions, workflow templates, etc.) even if headless mode is unavailable.

### Implementation Strategy

| Phase | Platform | Priority | Headless Support |
|-------|----------|----------|------------------|
| 1 | `gemini` | P0 | ✅ Confirmed |
| 1 | `copilot` | P0 | ✅ Confirmed |
| 2 | `antigravity` | P1 | ❌ Not supported (launcher-only) |

**Recommendation:** Implement `gemini` and `copilot` for headless automation. Antigravity is launcher-only (opens IDE) and not suitable for automated workflows.

---

### What GitHub ships (relevant to Puppet Master)

#### GitHub Copilot CLI (terminal-first agent; headless-friendly)
- Product site: https://github.com/features/copilot/cli
- Open-source repo: https://github.com/github/copilot-cli
- Official docs:
  - About: https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli
  - Using: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli
  - Installing: https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli
- Key behavior for Puppet Master:
  - Non-interactive prompt execution: `copilot -p "..."` / `copilot --prompt "..."`
    - Source: https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli
  - Tool approval controls:
    - `--allow-all-tools` — enable all tools without per-tool approval
    - `--allow-tool ...` / `--deny-tool ...` — allow/deny specific tools (deny takes precedence)
    - `--allow-all-paths` — disable path verification
    - `--allow-all-urls`, `--allow-url <domain>` — disable/relax URL verification
    - Sources:
      - https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli
      - https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli
    - Version note: some releases also include `--allow-all` and `--yolo` aliases (see changelog: https://raw.githubusercontent.com/github/copilot-cli/main/changelog.md)
  - Output controls:
    - `--silent` — suppress stats output for scripting
    - `--stream off` — disable token-by-token streaming
    - Source: https://raw.githubusercontent.com/github/copilot-cli/main/changelog.md
    - Note: No documented `--output-format json` equivalent; output is primarily text-based
  - Model selection:
    - `/model` slash command (interactive) — docs: https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli
    - No `--model` flag is documented in GitHub Docs; treat programmatic model selection as **TBD** (verify via `copilot --help` and/or configuration files)
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
    - `/login` slash command for interactive auth
    - Fine-grained PAT with "Copilot Requests" permission via `GH_TOKEN` or `GITHUB_TOKEN` env vars
    - Source: https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli
  - Special features:
    - `/delegate TASK` — hand off to async Copilot coding agent (creates branch + PR)
    - Auto-compaction at 95% token limit
    - Infinite sessions with compaction checkpoints
    - Source: https://raw.githubusercontent.com/github/copilot-cli/main/changelog.md

**Key implication:** Copilot CLI matches Puppet Master's integration shape (fresh process per iteration, non-interactive mode via `-p`, configurable approval via `--allow-all-tools`). Output parsing will be text-based rather than JSON.

### Recommendation (what "Copilot CLI support" should mean)

1. **Primary integration target:** Add `platform: copilot` to Puppet Master.
   - **Default runner binary:** `copilot`
   - **Headless flags:** `-p "..." --allow-all-tools --allow-all-paths --silent --stream off`
2. **Authentication:** Document GitHub OAuth or PAT setup; detect via `GH_TOKEN`/`GITHUB_TOKEN` in Doctor.

### Open Decisions / Questions — Copilot (must be resolved early)

1. **Platform id**
   - Decision: add **`copilot`** as the canonical Puppet Master platform id.
2. **Output parsing**
   - Copilot CLI does not have a documented JSON output format.
   - Strategy: parse text output for `<ralph>COMPLETE</ralph>` / `<ralph>GUTTER</ralph>` signals (same as Claude/Cursor).
   - Consider: use `--silent` to reduce noise in output.
3. **Approval mode mapping**
   - Puppet Master's "yolo" tier config → `--allow-all-tools` (fallback: `--allow-all` / `--yolo` if the installed Copilot CLI version uses those names)
   - Puppet Master's default → no approval flags (interactive prompts, but `-p` mode may still work)
4. **Model catalog + selection strategy**
   - The set of available models is shown inside Copilot CLI via `/model` and can vary by account/plan/region.
   - Decide how Puppet Master should interpret `tiers.*.model` for `copilot`:
     - Option A: Treat `model` as a **hint only** (document that selection happens inside Copilot)
     - Option B: Attempt best-effort programmatic selection via configuration directory (`--config-dir`) if a stable config key exists (must be confirmed)
5. **Subscription requirement**
   - Copilot CLI requires active GitHub Copilot subscription (Individual, Business, or Enterprise).
   - Doctor should detect and warn if not authenticated.

---

## Plan Overview

This plan adds **three new platforms** to Puppet Master while preserving core invariants:
- CLI-only interaction (no direct API calls)
- Fresh process per iteration (no session reuse)
- Strict TypeScript + Vitest test coverage
- ESM `.js` import extensions + type-only imports/exports

### Platforms Summary

| Platform ID | CLI Binary | Headless Flag | Approval Flag | Output Format | Status |
|-------------|------------|---------------|---------------|---------------|--------|
| `gemini` | `gemini` | `-p "..."` | `--approval-mode yolo` | `--output-format json` | ✅ Ready |
| `antigravity` | `agy` | ❌ N/A | ❌ N/A | ❌ N/A | 🚫 Launcher-only |
| `copilot` | `copilot` | `-p "..."` | `--allow-all-tools` (+ `--allow-all-paths`) | text (parse signals) | ✅ Ready |

### Proposed task breakdown

**Phase 1: Gemini CLI (GEM-Txx) — P0 Priority**
| Group | Tasks | Can Start After |
|-------|-------|-----------------|
| Sequential | GEM-T01 | None |
| Parallel Group A | GEM-T02, GEM-T03 | GEM-T01 |
| Parallel Group B | GEM-T04, GEM-T05 | GEM-T02 |
| Sequential | GEM-T06 | GEM-T05 |
| Parallel Group C | GEM-T07, GEM-T08 | GEM-T03 |
| Sequential | GEM-T09 | GEM-T06–GEM-T08 |

**Phase 1: Copilot (CPL-Txx) — P0 Priority**
| Group | Tasks | Can Start After |
|-------|-------|-----------------|
| Sequential | CPL-T01 | None |
| Parallel Group A | CPL-T02, CPL-T03 | CPL-T01 |
| Parallel Group B | CPL-T04, CPL-T05 | CPL-T02 |
| Sequential | CPL-T06 | CPL-T05 |
| Parallel Group C | CPL-T07, CPL-T08 | CPL-T03 |
| Sequential | CPL-T09 | CPL-T06–CPL-T08 |

**Phase 2: Antigravity (AGY-Txx) — ✅ COMPLETE (investigation confirmed launcher-only design)**
| Group | Tasks | Can Start After |
|-------|-------|-----------------|
| Sequential | AGY-T01 | None |
| Parallel Group A | AGY-T02, AGY-T03 | AGY-T01 |
| Parallel Group B | AGY-T04, AGY-T05 | AGY-T02 |
| Sequential | AGY-T06 | AGY-T05 |
| Parallel Group C | AGY-T07, AGY-T08 | AGY-T03 |
| Sequential | AGY-T11 | AGY-T06–AGY-T08 |

> **Note:** AGY tasks are contingent on confirming `agy` headless support. If no headless mode exists, AGY tasks may be deferred or redesigned.
> **Note:** AGY-T09 (GUI), AGY-T10 (Docs), and AGY-T12 (Hardcoded refs) are superseded by cross-platform tasks `ALL-T01`, `ALL-T02`, and `ALL-T03` (which cover all added platforms).

**Cross-platform tasks (run after all platform types are added):**
| Task | Description | Can Start After |
|------|-------------|-----------------|
| ALL-T01 | GUI updates for all 3 platforms | GEM-T02, CPL-T02, AGY-T02 (if AGY proceeds) |
| ALL-T02 | Documentation updates | GEM-T02, CPL-T02, AGY-T02 (if AGY proceeds) |
| ALL-T03 | Hardcoded platform reference fixes | GEM-T02, CPL-T02, AGY-T02 (if AGY proceeds) |
| ALL-T04 | Doctor + Install command updates | GEM-T08, CPL-T08, AGY-T08 (if AGY proceeds) |
| ALL-T05 | CLI command updates (start, status, etc.) | GEM-T06, CPL-T06, AGY-T06 (if AGY proceeds) |
| ALL-T06 | Integration validation | GEM-T09, CPL-T09, AGY-T11 (if AGY proceeds) |

---

# GEMINI CLI PLATFORM TASKS (GEM-Txx) — P0 Priority

These tasks implement Gemini CLI support. Gemini CLI has confirmed headless support and is ready to implement.

---

## GEM-T01: Confirm CLI Contract + Platform Naming

### Title
Lock in Gemini CLI platform contract

### Goal
Confirm the Gemini CLI headless behavior, platform id, and required flags/output contract.

### Depends on
- none

### Read first
- `REQUIREMENTS.md` Section 3–4 (platform table + no-APIs constraint)
- Gemini CLI headless docs:
  - https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/headless.md
  - https://github.com/google-gemini/gemini-cli

### Deliverables (record decisions here)
- Canonical platform id: `gemini`
- CLI binary: `gemini`
- Headless flags: `-p "..." --output-format json --approval-mode yolo`
- Output parsing: JSON with `{ response, stats, error? }` schema
- Approval mode mapping:
  - `--approval-mode yolo` for full automation
  - `--approval-mode auto_edit` for edit-only automation
  - `--approval-mode plan` for read-only (experimental)
- Supported models:
  - `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`
  - `gemini-3-pro-preview`, `gemini-3-flash-preview` (with preview features enabled)
  - "Auto" for automatic model selection

### Acceptance criteria
- [ ] Platform id decision recorded
- [ ] CLI binary and flags recorded
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

## GEM-T02: Types + Config Schema Updates

### Title
Add Gemini platform to config + type system

### Goal
Extend the canonical `Platform` type and all config surfaces so Gemini can be selected per tier.

### Depends on
- GEM-T01

### Read first
- `src/types/config.ts` (Platform, CliPathsConfig, budgets)
- `src/config/config-schema.ts` (validateConfig, isPlatform, cliPaths validation)
- `src/config/default-config.ts`

### Files to create/modify
- `src/types/config.ts`
- `src/config/config-schema.ts`
- `src/config/default-config.ts`
- tests adjacent to the above

### Implementation notes
- Add `gemini` to the canonical `Platform` union
- Add `cliPaths.gemini: string` (default: `gemini`)
- Add `budgets.gemini` alongside existing budgets
- Ensure fallbackPlatform enums include `gemini`

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

## GEM-T03: Implement Gemini Platform Runner

### Title
Add new platform runner using Gemini CLI headless mode (platform id: `gemini`)

### Goal
Implement a new `BasePlatformRunner` subclass that executes prompts via Gemini CLI headless mode.

### Depends on
- GEM-T01

### Read first
- `src/platforms/base-runner.ts`
- `src/platforms/codex-runner.ts` (pattern: JSON output parsing)
- Gemini CLI headless docs

### Files to create/modify
- `src/platforms/gemini-runner.ts` (NEW FILE)
- `src/platforms/index.ts` (export)
- `src/platforms/gemini-runner.test.ts` (NEW FILE)

### Implementation notes
- Use `-p "..."` for non-interactive prompt execution
- Use `--output-format json` for machine-readable output
- Use `--approval-mode yolo` for headless mode
- Use `--model <model>` for model selection
- Parse JSON output for response/stats/error
- Also detect `<ralph>COMPLETE</ralph>` / `<ralph>GUTTER</ralph>` signals in response text
- Command path: resolve from `cliPaths.gemini`
- Fresh process invariant: new process per iteration

### Acceptance criteria
- [ ] Runner spawns the configured Gemini binary with `-p`
- [ ] JSON output is parsed correctly
- [ ] Completion signals are detected from response text
- [ ] Model selection works via `--model` flag
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/platforms -t "gemini"` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/platforms -t "gemini"
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

## GEM-T04: Supported Models

### Title
Load Gemini supported models

### Goal
Provide a reliable source of truth for which models are supported for the `gemini` platform.

### Depends on
- GEM-T02 (types + config)
- GEM-T03 (runner contract)

### Read first
- `STATE_FILES.md` Section 4 (Capability Discovery Files)
- Gemini CLI model docs:
  - https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/model.md
  - https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/get-started/gemini-3.md

### Files to create/modify
- `src/platforms/gemini-models.ts` (NEW: curated baseline models)
- `src/platforms/index.ts` (export)
- Tests adjacent to the above

### Implementation notes
- Baseline model list:
  - `gemini-2.5-pro` (recommended)
  - `gemini-2.5-flash`
  - `gemini-2.5-flash-lite`
  - `gemini-3-pro-preview` (requires preview features)
  - `gemini-3-flash-preview` (requires preview features)
  - `Auto` (automatic model selection)
- Keep list user-overridable in config

### Acceptance criteria
- [ ] Gemini model list is available from backend code
- [ ] GUI can fetch model suggestions via API endpoint
- [ ] `npm run typecheck` passes
- [ ] Targeted tests pass

### Tests to run
```bash
npm run typecheck
npm test -- src/platforms -t "gemini"
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

## GEM-T05: Platform Registry + Factory Wiring

### Title
Register Gemini runner in platform registry

### Goal
Make the Gemini platform selectable from config and instantiable at runtime.

### Depends on
- GEM-T02
- GEM-T03

### Read first
- `src/platforms/registry.ts`
- `src/platforms/index.ts`

### Files to create/modify
- `src/platforms/registry.ts`
- `src/platforms/index.ts`
- `src/platforms/registry.test.ts`

### Implementation notes
- Use `config.cliPaths.gemini` when creating the runner

### Acceptance criteria
- [ ] Registry `createDefault()` registers GeminiRunner
- [ ] `PlatformRegistry.getAvailable()` includes gemini when configured
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

## GEM-T06: Core Spawn/Execution Wiring

### Title
Ensure core execution paths support Gemini platform end-to-end

### Goal
Update any platform `switch` statements / mappings so Gemini works everywhere.

### Depends on
- GEM-T02
- GEM-T05

### Read first
- `src/core/fresh-spawn.ts` (platform → command mapping)
- `src/core/execution-engine.ts`
- `src/core/orchestrator.ts`

### Files to create/modify
- `src/core/fresh-spawn.ts`
- Any additional file found via search for platform switches
- Corresponding tests

### Implementation notes
- Add switch case:
  ```typescript
  case 'gemini':
    return {
      command: 'gemini',
      args: ['-p', request.prompt, '--output-format', 'json', '--approval-mode', 'yolo']
    };
  ```
- Ensure exhaustive-switch TypeScript checking passes

### Acceptance criteria
- [ ] No exhaustive-switch TypeScript errors after adding the platform
- [ ] Gemini can be selected in tier config without runtime crashes
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

## GEM-T07: Capability Discovery + Health Checks

### Title
Probe Gemini CLI capabilities

### Goal
Extend capability discovery to correctly identify Gemini CLI features and record them in `.puppet-master/capabilities/`.

### Depends on
- GEM-T02
- GEM-T03
- GEM-T04

### Read first
- `STATE_FILES.md` Section 4 (capability cache schema)
- `src/platforms/capability-discovery.ts`
- `src/platforms/health-check.ts`

### Files to create/modify
- `src/platforms/capability-discovery.ts`
- `src/platforms/health-check.ts`
- Related tests under `src/platforms/`

### Implementation notes
- Version probe: run `${cliPaths.gemini} --version`
- Basic smoke probe: `${cliPaths.gemini} -p "ping" --output-format json`
- Capabilities to set:
  - nonInteractive: true
  - modelSelection: true
  - streaming: 'full' (supports stream-json)
  - sessionResume: false (Puppet Master disallows)
  - mcpSupport: true
- Detect auth via Google OAuth / API key environment variables

### Acceptance criteria
- [ ] Discovery produces a stable capabilities record for gemini
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

## GEM-T08: Doctor + Install Checks

### Title
Add Doctor + Install checks for Gemini CLI

### Goal
Surface actionable setup guidance from `puppet-master doctor` and `puppet-master install`.

### Depends on
- GEM-T02
- GEM-T03
- GEM-T04

### Read first
- `src/cli/commands/doctor.ts`
- `src/cli/commands/install.ts`
- `src/doctor/checks/cli-tools.ts`
- `src/doctor/installation-manager.ts`

### Files to create/modify
- `src/doctor/checks/cli-tools.ts` (add `GeminiCliCheck`)
- `src/cli/commands/doctor.ts` (register new check)
- `src/cli/commands/install.ts` (register new check + tool name mapping)
- `src/doctor/installation-manager.ts` (install commands)
- Tests in `src/cli/commands/doctor.test.ts` and/or `src/doctor/*`

### Implementation notes
- Install commands:
  - npm: `npm install -g @google/gemini-cli`
  - Homebrew: `brew install gemini-cli`
- Auth guidance (Doctor output):
  - "Run `gemini` to authenticate with Google"
  - Or set `GOOGLE_API_KEY` / configure Vertex AI credentials

### Acceptance criteria
- [ ] `puppet-master doctor` reports Gemini CLI as installed/missing with clear fix instructions
- [ ] Doctor distinguishes missing binary vs missing auth
- [ ] `puppet-master install --all` includes Gemini CLI installation
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

## GEM-T09: Validation Gate (Integration-Level)

### Title
Run end-to-end validation for Gemini CLI platform integration

### Goal
Prove that selecting Gemini in config can run at least one iteration end-to-end in a real workspace.

### Depends on
- GEM-T05–GEM-T08

### Evidence to record
- `.puppet-master/capabilities/gemini.json`
- `.puppet-master/evidence/test-logs/` output from the run

### Manual smoke test recipe (local machine)
1. Install Gemini CLI and authenticate:
   - `npm install -g @google/gemini-cli`
   - `gemini` → authenticate with Google
2. Configure Puppet Master tier(s) to use `platform: gemini`.
3. Run a small, non-destructive subtask and confirm:
   - fresh process
   - JSON output parsing
   - completion signal detection
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

# ANTIGRAVITY PLATFORM TASKS (AGY-Txx) — P1 Priority

> **⚠️ IMPORTANT:** Antigravity is a **required** platform, but the implementation approach depends on AGY-T01 investigation.
> - If `agy` supports headless mode → implement directly using `agy` binary
> - If `agy` does NOT support headless mode → implement a launcher-only + fail-fast runner (no hanging prompts) and document that `gemini` is the headless Google runner

---

## AGY-T01: Investigate Antigravity CLI Headless Capabilities

### Title
Investigate whether Antigravity CLI (`agy`) supports headless/non-interactive mode

### Goal
Determine if `agy` can be used for automated orchestration like other platforms, or if it's purely a GUI launcher.

### Depends on
- none

### ⚠️ CRITICAL INVESTIGATION TASK
This task is a **blocker** for all other AGY tasks. The outcome determines whether Antigravity can be a Puppet Master platform.

### Investigation steps
1. Install Antigravity and locate the `agy` binary
2. Confirm actual executable name(s) on the machine:
   - `command -v agy` / `which agy`
   - `command -v antigravity` / `which antigravity`
   - Record whether `agy` is a wrapper/shim for `antigravity`
3. Run `agy --help` (and `antigravity --help` if present) and document all available flags/subcommands
3. Test potential headless invocations:
   - `agy -p "test prompt"` or `agy --prompt "test prompt"`
   - `agy --headless` or `agy --non-interactive`
   - `agy exec "test prompt"` or similar subcommand
4. Check Antigravity's config files for headless/scripting options
5. Search for undocumented CLI flags in Antigravity source code (if accessible)
6. Check Antigravity community forums/issues for headless mode requests

### Read first
- Antigravity product site: https://antigravity.google/
- Antigravity codelab: https://codelabs.developers.google.com/getting-started-google-antigravity
- Antigravity docs on Skills: https://antigravity.google/assets/docs/agent/skills.md

### Possible outcomes

**Outcome A: Headless mode exists (`agy -p "..."` or similar)**
- Document the flags and output format
- Proceed with AGY-T02 through AGY-T11 using `agy` binary
- Platform id: `antigravity`, CLI binary: `agy`

**Outcome B: Headless mode does NOT exist**
- Implement a safe, explicit behavior that does **not** pretend to be headless automation:
  1. **Option B1 - Launcher-only runner:** Runner invokes `agy` to open Antigravity in the correct workspace (best-effort), then returns a clear “manual step required / headless unsupported” result without hanging.
  2. **Option B2 - Fail-fast runner:** Runner immediately returns an actionable error explaining that Antigravity has no documented headless CLI mode yet and the user should use `platform: gemini` for headless automation.
  3. **Option B3 - Future wrapper:** If Google ships an official headless Antigravity CLI contract later, implement it as a proper runner (no UI automation hacks).

### Deliverables
- Investigation report documenting findings
- Decision: Direct `agy` headless implementation OR launcher-only / fail-fast behavior (if no headless mode exists)
- Document CLI contract for `agy`:
  - Any documented prompt-in/prompt-out flags/subcommands (or confirmation they don’t exist)
  - Output format (text vs structured) if headless mode exists
  - Whether model selection is possible from CLI (or UI-only)
- Supported models strategy for UX:
  - baseline *suggested* list sourced from Antigravity docs (Reasoning Model list)
  - keep user-overridable (treat as suggestions, not an enforcement guarantee)

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
Add Antigravity platform to config + type system

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
- Add `cliPaths.antigravity: string` (default: `agy`), but ensure Doctor docs mention `antigravity` as an alternate executable name (if AGY-T01 confirms).
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

## AGY-T03: Implement Antigravity Platform Runner (`agy`)

### Title
Add new platform runner using Antigravity launcher/CLI (`agy`) (platform id: `antigravity`)

### Goal
Implement a new `BasePlatformRunner` subclass for Antigravity that:
- runs a documented headless prompt mode **if it exists**, OR
- fails fast (optionally launching the GUI) **if no headless mode exists**

### Depends on
- AGY-T01

### Read first
- `src/platforms/base-runner.ts`
- `src/platforms/claude-runner.ts` (pattern: prompt → parse signals)
- Antigravity codelab (documents `agy` as a launcher): https://codelabs.developers.google.com/getting-started-google-antigravity

### Files to create/modify
- `src/platforms/antigravity-runner.ts`
- `src/platforms/index.ts` (export)
- `src/platforms/antigravity-runner.test.ts`

### Implementation notes
- Command path:
  - resolve from `cliPaths.antigravity` (default: `agy`)
- If AGY-T01 confirms a headless prompt mode exists:
  - implement the discovered invocation (flags/subcommand) and capture stdout/stderr
  - parse output (assume text unless a structured mode is documented)
  - detect `<ralph>COMPLETE</ralph>` / `<ralph>GUTTER</ralph>` in output
  - map tier config:
    - model selection only if the CLI supports it
    - plan/todo/workflow-only modes only if the CLI supports them
- If AGY-T01 confirms no headless mode exists:
  - implement a **fail-fast** runner that returns `success=false` with an actionable message (and never blocks waiting for UI)
  - optional: best-effort `agy` launch of the workspace as a convenience (still return “manual required”)
- Fresh process invariant:
  - do NOT use any session reuse flags

### Acceptance criteria
- [ ] Runner uses `cliPaths.antigravity` to spawn the Antigravity CLI/launcher
- [ ] Runner never hangs waiting for interactive input
- [ ] If headless mode exists: output is captured and `<ralph>` signals are detected
- [ ] If headless mode does not exist: runner returns a clear, actionable error (suggesting `platform: gemini` for headless automation)
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

## AGY-T04: Supported Models + Workflow/Plan/TODO Surfacing

### Title
Load Antigravity supported models and surface Workflows (and any plan/todo modes if present)

### Goal
Provide a user-visible source of truth for:
- Antigravity **Reasoning Model** options (for GUI suggestions)
- Antigravity **Workflows** (`/workflow-name`) and where Rules/Workflows/Skills live
- Any plan/todo/headless features discovered in AGY-T01 (if any)

### Depends on
- AGY-T02 (types + config)
- AGY-T03 (runner contract) — only for tying “model selection works” to the real CLI contract

### Read first
- `STATE_FILES.md` Section 4 (Capability Discovery Files), especially `available_models` (if we choose to surface model lists there)
- Antigravity model list: https://antigravity.google/assets/docs/agent/models.md
- Antigravity rules/workflows: https://antigravity.google/assets/docs/agent/rules-workflows.md
- Antigravity skills: https://antigravity.google/assets/docs/agent/skills.md

### Files to create/modify
- `src/platforms/antigravity-models.ts` (new: curated *suggested* model names + helpers)
- `src/platforms/index.ts` (export)
- `src/gui/routes/config.ts` (add endpoint to surface model list + notes to GUI)
- Tests adjacent to the above (Vitest)

### Implementation notes
- Baseline model list should be sourced from Antigravity docs “Reasoning Model” section; treat as **display names/suggestions**, not strict ids:
  - `Gemini 3 Pro (high)`
  - `Gemini 3 Pro (low)`
  - `Gemini 3 Flash`
  - `Claude Sonnet 4.5`
  - `Claude Sonnet 4.5 (thinking)`
  - `Claude Opus 4.5 (thinking)`
  - `GPT-OSS`
- Document in UI that model selection may be UI-only unless AGY-T01 confirms a CLI flag/subcommand.
- Workflows:
  - Antigravity supports workflows invoked via `/workflow-name` and stored as markdown (see rules/workflows docs).
  - If desired, add a follow-on CLI helper later to generate a `.agent` workflow template from a Puppet Master task (out of scope for initial platform wiring unless explicitly requested).
- Prefer exposing model suggestions to GUI via a simple endpoint (e.g., `GET /api/config/models`) returning `{ platforms: { antigravity: string[] } }`.

### Acceptance criteria
- [ ] Antigravity model list is available from backend code (single source of truth)
- [ ] GUI can fetch model suggestions via API endpoint
- [ ] Docs explain that Antigravity model selection may be UI-only unless headless CLI support exists
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
Probe Antigravity (`agy`) capabilities (version/help/headless flag discovery)

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
- Antigravity codelab (documents `agy` as a launcher): https://codelabs.developers.google.com/getting-started-google-antigravity

### Files to create/modify
- `src/platforms/capability-discovery.ts`
- `src/platforms/health-check.ts`
- Related tests under `src/platforms/`

### Implementation notes
- Version probe: run `${cliPaths.antigravity} --version` (if supported) and/or parse from `--help` output
- Determine whether a headless/non-interactive flag exists:
  - Prefer deriving this from `agy --help` output and AGY-T01 findings (do not guess)
- Smoke probe:
  - Minimum: `${cliPaths.antigravity} --help` returns 0
  - If (and only if) headless mode exists: run the smallest safe “ping” invocation discovered in AGY-T01 and record output format
- Populate `available_models` for `antigravity` from AGY-T04’s curated list (treat as “suggested”)

### Acceptance criteria
- [ ] Discovery produces a stable capabilities record for the platform
- [ ] Health check distinguishes missing binary vs “installed but unusable” (if detectable)
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
Add Doctor + Install checks for Antigravity (`agy`)

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
- Antigravity download + setup:
  - https://antigravity.google/download
  - https://codelabs.developers.google.com/getting-started-google-antigravity

### Files to create/modify
- `src/doctor/checks/cli-tools.ts` (add `AntigravityCliCheck` / `AgyCliCheck` as the same thing)
- `src/cli/commands/doctor.ts` (register new checks)
- `src/cli/commands/install.ts` (register new checks + tool name mapping)
- `src/doctor/installation-manager.ts` (install commands)
- Tests in `src/cli/commands/doctor.test.ts` and/or `src/doctor/*`

### Implementation notes
- Antigravity is a desktop app; installation is typically manual (download + install).
- Doctor should:
  - detect whether `cliPaths.antigravity` resolves to a runnable binary (default `agy`)
  - if `cliPaths.antigravity` fails, try the common alternate name `antigravity` and suggest updating `cliPaths.antigravity` accordingly (only as a *suggestion*, don’t auto-mutate config)
  - include WSL note (if applicable): symlink `agy` → Windows-installed `antigravity` binary (document exact path as user-specific)
  - if missing, print OS-specific “download + install” instructions (and the expected path/launcher name)
  - if present, run `agy --help` (or `--version`) to validate execution
- `install` command:
  - Either implement “manual install instructions” (preferred) or a best-effort installer if the project decides that’s acceptable per OS/security policy.

### Acceptance criteria
- [ ] `puppet-master doctor` reports Antigravity (`agy`) as installed/missing with clear fix instructions
- [ ] `puppet-master install --all` includes Antigravity (manual) install guidance
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

## AGY-T09: GUI Updates (SUPERSEDED by ALL-T01)

> **⚠️ SUPERSEDED:** This task has been consolidated into `ALL-T01` which handles GUI updates for all added platforms. Keeping this section for reference only.

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

## AGY-T10: Documentation + Examples (SUPERSEDED by ALL-T02)

> **⚠️ SUPERSEDED:** This task has been consolidated into `ALL-T02` which handles documentation for all added platforms. Keeping this section for reference only.

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
  - Default CLI binary: `agy` (via `cliPaths.antigravity`)
  - Document current headless status: “headless supported” vs “launcher-only / manual required” (per AGY-T01 findings)
- Add “Supported models” documentation:
  - baseline model display names sourced from Antigravity docs (Reasoning Model list)
  - note that actual availability may vary by account/plan and selection may be UI-only unless a CLI flag exists

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
1. Install Antigravity and verify the launcher:
   - Download/install: https://antigravity.google/download
   - Verify: `agy --help` (and `agy --version` if supported)
2. Configure Puppet Master tier(s) to use `platform: antigravity`.
3. If (and only if) AGY-T01 confirms headless mode exists:
   - Run a small, non-destructive subtask and confirm:
     - fresh process
     - output parsing
     - completion signal parsing
     - filesChanged detection + gating behavior (as applicable)
4. If AGY-T01 confirms headless mode does NOT exist:
   - Confirm the runner fails fast with an actionable message (and optionally opens the GUI without hanging)

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

## AGY-T12: Additional Hardcoded Platform References (SUPERSEDED by ALL-T03)

> **⚠️ SUPERSEDED:** This task has been consolidated into `ALL-T03` which handles hardcoded platform reference fixes for all added platforms. Keeping this section for reference only.

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
  - Prefer `--allow-all-tools` for headless/yolo mode (fallback: `--allow-all` / `--yolo` depending on installed Copilot CLI version)
  - Add `--allow-all-paths` to avoid interactive path verification prompts in programmatic mode
  - Optional: `--allow-all-urls` / `--allow-url <domain>` (only if URL verification blocks your workflow)
  - `--silent` + `--stream off` for scripting-friendly, deterministic output
- Supported models strategy:
  - Models are selected inside Copilot CLI via `/model` (interactive) and may vary by account/plan/region
  - Puppet Master should treat `tiers.*.model` as **TBD** for Copilot until a stable programmatic selection mechanism is confirmed (see CPL-T04)

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
- Use `--allow-all-tools` for headless/yolo mode (fallback: `--allow-all` / `--yolo` based on `copilot --help`)
- Use `--allow-all-paths` to avoid interactive path verification prompts
- Optional: `--allow-all-urls` / `--allow-url <domain>` if URL verification blocks the run
- Use `--silent` and `--stream off` to reduce noise and stabilize output parsing
- Parse text output for `<ralph>COMPLETE</ralph>` / `<ralph>GUTTER</ralph>` signals
- Command path: resolve from `cliPaths.copilot`
- Fresh process invariant: do NOT use `--resume`

### Acceptance criteria
- [ ] Runner spawns the configured Copilot binary with `-p`
- [ ] Completion signals are detected from response text
- [ ] Runner uses non-interactive approval flags without prompting
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
- GitHub Docs: model usage (`/model`) and premium request behavior:
  - https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli
- Copilot CLI changelog (tracks model additions and selection behavior):
  - https://raw.githubusercontent.com/github/copilot-cli/main/changelog.md

### Files to create/modify
- `src/platforms/copilot-models.ts` (NEW: curated baseline models)
- `src/platforms/index.ts` (export)
- Tests adjacent to the above (Vitest)

### Implementation notes
- **Reality check:** Copilot CLI’s available model set varies by account/plan/region and is shown inside Copilot CLI via `/model`. We should not hardcode an authoritative list.
- Provide a best-effort *suggested* list for UX (and document that the source of truth is `/model`):
  - `Claude Sonnet 4.5` (default per docs; may change)
  - `Claude Sonnet 4`
  - `GPT-5.2-Codex` (from changelog)
  - `Haiku 4.5` (from changelog)
- Decide and document how Puppet Master interprets `tiers.*.model` for Copilot:
  - Option A (initial): treat as a hint only and do not attempt programmatic selection
  - Option B (later): if a stable config key exists, use `--config-dir` to set the model per run (must be proven before implementing)

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

# CROSS-PLATFORM TASKS (ALL-Txx)

These tasks handle changes that apply to ALL new platforms simultaneously.
- **Phase 1 platforms (P0):** `gemini`, `copilot`
- **Phase 2 platform (P1, conditional):** `antigravity` (pending AGY-T01 investigation)

---

## ALL-T01: GUI Updates for All Platforms

### Title
Update GUI to support `gemini`, `copilot`, and `antigravity` platform selection

### Goal
Ensure the local GUI can:
- Select all new platforms in tier platform dropdowns
- Configure budgets + fallback platforms for all
- Show budget usage for all on the dashboard
- Surface model suggestions for each platform

### Depends on
- GEM-T02, CPL-T02 (required)
- AGY-T02 (if Antigravity proceeds)

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
- Add `gemini`, `copilot`, and `antigravity` to every platform `<select>` in config.html
- Add budget panels for all new platforms mirroring existing budgets
- Update dashboard budget UI to include all new platforms
- Model suggestions via datalist approach (user can still type custom models)
- Consider adding platform icons/logos for visual distinction

### Acceptance criteria
- [ ] GUI tier platform dropdowns include `gemini`, `copilot`, and `antigravity`
- [ ] GUI budgets tab supports all new platforms + fallback selection
- [ ] Dashboard displays budget usage for all new platforms
- [ ] Model suggestions appear for each platform
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

## ALL-T02: Documentation Updates

### Title
Document all new platforms end-to-end

### Goal
Update canonical docs and examples so users can install, authenticate, and configure all new platforms.

### Depends on
- GEM-T02, CPL-T02 (required)
- AGY-T02 (if Antigravity proceeds)

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
  - Platform id: `gemini` | Default CLI: `gemini` | Auth: Google OAuth/API key
  - Platform id: `copilot` | Default CLI: `copilot` | Auth: GitHub OAuth/PAT
  - Platform id: `antigravity` | Default CLI: `agy` | Auth: Google OAuth (if proceeds)
- Add "Auth quickstart" section for each platform
- Add "Supported models" documentation for each platform
- Add troubleshooting section for common auth issues

### Acceptance criteria
- [ ] Docs list all new platforms and their CLI commands
- [ ] Docs show install + auth steps for each
- [ ] Docs show example tier config snippets using each platform
- [ ] Docs include model lists for each platform

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

## ALL-T03: Hardcoded Platform Reference Fixes

### Title
Update all remaining hardcoded platform references for all new platforms

### Goal
Ensure NO hardcoded `'cursor' | 'codex' | 'claude'` patterns remain without all new platforms.

### Depends on
- GEM-T02, CPL-T02 (required)
- AGY-T02 (if Antigravity proceeds)

### Discovered gaps

| File | Line(s) | Issue | Fix |
|------|---------|-------|-----|
| `src/logging/event-bus.ts` | 27 | `budget_update` event hardcoded | Add `gemini`, `copilot`, `antigravity` |
| `src/start-chain/validation-gate.ts` | 347 | `validPlatforms` array hardcoded | Add all new platforms |
| `src/memory/progress-manager.ts` | 203 | Platform string parsing hardcoded | Add all new platforms |
| `src/platforms/quota-manager.test.ts` | 285, 346, 366 | Test assertions | Add all new platforms |
| `.cursorrules` | 31 | Documents Platform type | Update example |

### Files to modify
- `src/logging/event-bus.ts`
- `src/start-chain/validation-gate.ts`
- `src/memory/progress-manager.ts`
- `src/platforms/quota-manager.test.ts`
- `.cursorrules` (optional, for documentation consistency)

### Acceptance criteria
- [ ] No grep matches for platform lists without all new platforms in source files
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

## ALL-T04: Doctor + Install Command Updates

### Title
Update Doctor and Install commands to support all new platforms

### Goal
Ensure `puppet-master doctor` and `puppet-master install` correctly handle all new platform CLIs.

### Depends on
- GEM-T08, CPL-T08 (required)
- AGY-T08 (if Antigravity proceeds)

### Read first
- `src/cli/commands/doctor.ts`
- `src/cli/commands/install.ts`
- `src/doctor/checks/cli-tools.ts`
- `src/doctor/installation-manager.ts`

### Files to create/modify
- `src/cli/commands/doctor.ts` (ensure all checks registered)
- `src/cli/commands/install.ts` (ensure all tools installable)
- `src/doctor/installation-manager.ts` (ensure all install commands registered)
- Tests for doctor and install commands

### Implementation notes
- Doctor should check for:
  - `gemini` CLI binary + Google auth
  - `copilot` CLI binary + GitHub auth
  - `agy` CLI binary + Google auth (if Antigravity proceeds)
- Install should support:
  - `puppet-master install gemini` → `npm install -g @google/gemini-cli`
  - `puppet-master install copilot` → `npm install -g @github/copilot`
  - `puppet-master install antigravity` → platform-specific instructions (if proceeds)
  - `puppet-master install --all` → install all missing CLIs

### Acceptance criteria
- [ ] `puppet-master doctor` reports status of all new platform CLIs
- [ ] `puppet-master install <platform>` works for each new platform
- [ ] `puppet-master install --all` includes all new platforms
- [ ] Clear error messages for missing auth vs missing binary
- [ ] `npm test -- src/cli/commands/doctor.test.ts` passes
- [ ] `npm test -- src/cli/commands/install.test.ts` passes

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

## ALL-T05: CLI Command Updates (start, status, etc.)

### Title
Update CLI commands to support all new platforms

### Goal
Ensure all CLI commands that reference platforms work correctly with new platforms.

### Depends on
- GEM-T06, CPL-T06 (required)
- AGY-T06 (if Antigravity proceeds)

### Read first
- `src/cli/commands/start.ts`
- `src/cli/commands/status.ts`
- `src/cli/commands/stop.ts`
- `src/cli/commands/resume.ts`
- `src/cli/commands/pause.ts`

### Files to create/modify
- Any CLI command that filters/displays platforms
- CLI command tests

### Implementation notes
- Commands that may need updates:
  - `start` - platform selection and validation
  - `status` - platform display in output
  - `stop` - platform-specific process termination
  - `resume` - platform validation
  - `check` - platform health checks
- Ensure platform flags accept new values
- Ensure help text includes new platforms

### Acceptance criteria
- [ ] `puppet-master start --platform gemini` works
- [ ] `puppet-master start --platform copilot` works
- [ ] `puppet-master start --platform antigravity` works (if proceeds)
- [ ] `puppet-master status` displays new platforms correctly
- [ ] CLI help text includes new platforms
- [ ] `npm test -- src/cli/commands` passes

### Tests to run
```bash
npm test -- src/cli/commands
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

## ALL-T06: Integration Validation

### Title
Run full integration validation for all new platforms

### Goal
Prove that all new platforms work end-to-end in Puppet Master.

### Depends on
- GEM-T09, CPL-T09 (required)
- AGY-T11 (if Antigravity proceeds)
- ALL-T01 through ALL-T05

### Evidence to record
- `.puppet-master/capabilities/gemini.json`
- `.puppet-master/capabilities/copilot.json`
- `.puppet-master/capabilities/antigravity.json` (if proceeds)
- `.puppet-master/evidence/test-logs/` output from runs

### Manual smoke test checklist
1. **Gemini CLI:**
   - [ ] Install and authenticate: `npm install -g @google/gemini-cli && gemini`
   - [ ] Configure tier: `platform: gemini`
   - [ ] Run iteration, verify JSON output parsing
   - [ ] Verify completion signals detected

2. **Copilot CLI:**
   - [ ] Install and authenticate: `npm install -g @github/copilot && copilot`
   - [ ] Configure tier: `platform: copilot`
   - [ ] Run iteration, verify text output parsing
   - [ ] Verify completion signals detected

3. **Antigravity (if proceeds):**
   - [ ] Install and verify: `agy --version`
   - [ ] Configure tier: `platform: antigravity`
   - [ ] Run iteration, verify output parsing
   - [ ] Verify completion signals detected

4. **GUI:**
   - [ ] All platforms appear in dropdowns
   - [ ] Budget dashboard shows all platforms
   - [ ] Config saves/loads correctly for all platforms

5. **Doctor/Install:**
   - [ ] `puppet-master doctor` shows status for all platforms
   - [ ] `puppet-master install --all` installs missing CLIs

### Acceptance criteria
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes (full suite)
- [ ] All platforms can be selected and run at least one iteration
- [ ] GUI correctly displays all platforms
- [ ] Doctor correctly reports all platform statuses

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
│                      GEMINI CLI TRACK (P0 - Ready)                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│ GEM-T01 (CLI Contract)                                                          │
│     │                                                                           │
│     ├── GEM-T02 (Types) ────┬── GEM-T04 (Models) ─┬── GEM-T05 (Registry) ──┐   │
│     │                       │                     │                         │   │
│     │                       │                     └── GEM-T06 (Spawn) ──────┤   │
│     │                       │                                               │   │
│     └── GEM-T03 (Runner) ───┼── GEM-T07 (Capability) ───────────────────────┤   │
│                             │                                               │   │
│                             └── GEM-T08 (Doctor) ───────────────────────────┤   │
│                                                                             │   │
│                                                                             v   │
│                                                                   GEM-T09 (Val) │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                       COPILOT TRACK (P0 - Ready)                                │
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
│                    ANTIGRAVITY TRACK (P1 - Required)                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│ AGY-T01 (Investigate Headless) ◄── Determines implementation approach           │
│     │                                                                           │
│     ├── [If `agy` headless exists] ─────────────────────────────────────────┐   │
│     │       Use `agy` binary directly                                       │   │
│     │                                                                       │   │
│     └── [If NO headless] ───────────────────────────────────────────────────┤   │
│             Launcher-only / fail-fast runner (manual step required)         │   │
│                                                                             │   │
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
│                         CROSS-PLATFORM (ALL-Txx)                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ GEM-T02 ──┬                                                                     │
│           ├── ALL-T01 (GUI) ─────────────────────────────────────────┐         │
│ CPL-T02 ──┤                                                           │         │
│           ├── ALL-T02 (Docs) ────────────────────────────────────────┤         │
│ AGY-T02? ─┤                                                           │         │
│           └── ALL-T03 (Hardcoded Refs) ──────────────────────────────┤         │
│                                                                       │         │
│ GEM-T08 ──┬                                                           │         │
│           ├── ALL-T04 (Doctor/Install) ──────────────────────────────┤         │
│ CPL-T08 ──┤                                                           │         │
│           │                                                           │         │
│ AGY-T08? ─┘                                                           │         │
│                                                                       │         │
│ GEM-T06 ──┬                                                           │         │
│           ├── ALL-T05 (CLI Commands) ────────────────────────────────┤         │
│ CPL-T06 ──┤                                                           │         │
│           │                                                           │         │
│ AGY-T06? ─┘                                                           │         │
│                                                                       │         │
│ GEM-T09 ──┬                                                           │         │
│           ├── ALL-T06 (Integration Validation) ◄─────────────────────┘         │
│ CPL-T09 ──┤                                                                     │
│           │                                                                     │
│ AGY-T11? ─┘                                                                     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Summary of All Files to Modify

### Critical Path (Types + Core) — ALL 3 PLATFORMS

| Task | File | Change |
|------|------|--------|
| GEM-T02 + CPL-T02 + AGY-T02 | `src/types/config.ts` | Add `'gemini' \| 'antigravity' \| 'copilot'` to Platform, CliPathsConfig, PlatformBudgets |
| GEM-T02 + CPL-T02 + AGY-T02 | `src/config/config-schema.ts` | Add validation for all 3 platforms |
| GEM-T02 + CPL-T02 + AGY-T02 | `src/config/default-config.ts` | Add default cliPaths + budgets for all 3 |
| GEM-T03 | `src/platforms/gemini-runner.ts` | NEW FILE |
| CPL-T03 | `src/platforms/copilot-runner.ts` | NEW FILE |
| AGY-T03 | `src/platforms/antigravity-runner.ts` | NEW FILE |
| GEM-T05 + CPL-T05 + AGY-T05 | `src/platforms/registry.ts` | Register all 3 runners |
| GEM-T06 + CPL-T06 + AGY-T06 | `src/core/fresh-spawn.ts` | Add switch cases for all 3 platforms |

### Models

| Task | File | Change |
|------|------|--------|
| GEM-T04 | `src/platforms/gemini-models.ts` | NEW FILE |
| CPL-T04 | `src/platforms/copilot-models.ts` | NEW FILE |
| AGY-T04 | `src/platforms/antigravity-models.ts` | NEW FILE |

### Discovery + Health

| Task | File | Change |
|------|------|--------|
| GEM-T07 + CPL-T07 + AGY-T07 | `src/platforms/capability-discovery.ts` | Add getPlatformCommand cases for all 3 |
| GEM-T07 + CPL-T07 + AGY-T07 | `src/platforms/health-check.ts` | Add getPlatformCommand cases for all 3 |
| GEM-T08 | `src/doctor/checks/cli-tools.ts` | Add GeminiCliCheck class |
| CPL-T08 | `src/doctor/checks/cli-tools.ts` | Add CopilotCliCheck class |
| AGY-T08 | `src/doctor/checks/cli-tools.ts` | Add AntigravityCliCheck class |
| GEM-T08 + CPL-T08 + AGY-T08 | `src/doctor/installation-manager.ts` | Register install commands for all 3 |

### GUI (ALL-T01)

| Task | File | Change |
|------|------|--------|
| ALL-T01 | `src/gui/public/config.html` | Add platform options + budget fieldsets + CLI path inputs for all 3 |
| ALL-T01 | `src/gui/public/index.html` | Add budget spans for all 3 platforms |
| ALL-T01 | `src/gui/public/js/config.js` | Add all 3 platforms to loops |
| ALL-T01 | `src/gui/public/js/dashboard.js` | Add budget rendering for all 3 |

### CLI Commands (ALL-T05)

| Task | File | Change |
|------|------|--------|
| ALL-T05 | `src/cli/commands/start.ts` | Ensure platform validation includes all 3 |
| ALL-T05 | `src/cli/commands/status.ts` | Update platform display |
| ALL-T05 | `src/cli/commands/doctor.ts` | Register checks for all 3 |
| ALL-T05 | `src/cli/commands/install.ts` | Register install commands for all 3 |

### Hardcoded Refs (ALL-T03)

| Task | File | Change |
|------|------|--------|
| ALL-T03 | `src/logging/event-bus.ts` | Add all 3 platforms to budget_update event type |
| ALL-T03 | `src/start-chain/validation-gate.ts` | Add all 3 platforms to validPlatforms array |
| ALL-T03 | `src/memory/progress-manager.ts` | Add all 3 platforms to platform parsing |
| ALL-T03 | `src/platforms/quota-manager.test.ts` | Update test assertions for 6 platforms |
| ALL-T03 | `.cursorrules` | Update Platform type example |

### Documentation (ALL-T02)

| Task | File | Change |
|------|------|--------|
| ALL-T02 | `README.md` | Add all 3 platforms to supported platforms |
| ALL-T02 | `REQUIREMENTS.md` | Update platform table |
| ALL-T02 | `PROJECT_SETUP_GUIDE.md` | Add setup instructions for all 3 |

---

## Platform Comparison Table (After Implementation)

| Feature | Cursor | Codex | Claude | Gemini | Antigravity | Copilot |
|---------|--------|-------|--------|--------|-------------|---------|
| CLI Binary | `cursor-agent` | `codex` | `claude` | `gemini` | `agy` | `copilot` |
| Headless Flag | `-p` | `exec` | `-p` | `-p` | ❌ N/A (launcher-only) | `-p` |
| JSON Output | No | Yes | No | Yes | ❌ N/A (launcher-only) | No |
| Approval Flag | env var | `--path` | N/A | `--approval-mode` | ❌ N/A (launcher-only) | `--allow-all-tools` (+ `--allow-all-paths`) |
| Model Flag | N/A | `--model` | N/A | `--model` | UI-only | `/model` (interactive; programmatic TBD) |
| MCP Support | Yes | Yes | Yes | Yes | Yes (IDE context) | Yes |
| Auth Method | Cursor acct | OpenAI key | Anthropic | Google OAuth | Google account/app login | GitHub OAuth/PAT |

---

## Task Count Summary

| Track | Task Count | Status |
|-------|------------|--------|
| Gemini CLI (GEM-Txx) | 9 tasks | P0 - Ready to implement |
| Copilot (CPL-Txx) | 9 tasks | P0 - Ready to implement |
| Antigravity (AGY-Txx) | 11 tasks | P1 - Pending AGY-T01 investigation |
| Cross-platform (ALL-Txx) | 6 tasks | Depends on platform tasks |
| **Total** | **35 tasks** | |

---

*End of addgravity.md*
