## Plan Mode Strategy & Defaults

### Current State

Plan mode is implemented per tier (phase, task, subtask, iteration) and flows from GUI/config → tier config → `IterationContext.plan_mode` → `ExecutionRequest.plan_mode` → each platform runner. Start-chain flows (interview, PRD generator, etc.) already use `plan_mode: true` explicitly.

**Per-platform implementation (today):**

| Platform   | Plan mode implementation | Notes |
|-----------|---------------------------|--------|
| Cursor    | `--mode plan` (else `--force`) | Native; read-only planning then execute. |
| Claude    | `--permission-mode plan`       | Native; read-only analysis. |
| Codex     | `--sandbox read-only` (no `--full-auto`) | Read-only sandbox; no native "plan" flag. |
| Gemini    | `--approval-mode plan` (else `yolo`)     | May require `experimental.plan: true` in `~/.gemini/settings.json`. |
| Copilot   | Omit `--allow-all-paths` / `--allow-all-urls` when plan_mode | Restrictive mode; no dedicated plan flag in CLI. |

### Plan Mode & Platform CLI Updates (Last ~2 Months)

The following summarizes recent CLI releases (Dec 2025 - Feb 2026) that affect plan mode, subagents, hooks, plugins, and related behavior. Use this to keep `platform_specs`, runners, and AGENTS.md aligned with current behavior.

**Cursor (agent / cursor-agent)**  
- **Jan 16, 2026:** Plan mode and Ask mode in CLI: `/plan` or `--mode=plan`, `/ask` or `--mode=ask`; cloud handoff with `&`; one-click MCP auth; word-level diffs.  
- **v2.4 (Jan 22):** Subagents (parallel, custom configs).  
- **v2.5 (Feb 17):** Plugins (marketplace: skills, subagents, MCP, hooks, rules); async subagents (can spawn child subagents); sandbox network access controls.  
- **Impact:** Plan mode implementation (`--mode plan`) is correct. Subagent and plugin support has expanded; consider documenting plugins and async subagents in platform capabilities.

**Codex**  
- **0.100 (Feb 12):** ReadOnlyAccess policy, memory slash commands (`/m_update`, `/m_drop`), experimental JS REPL, app-server websocket refresh.  
- **0.101 (Feb 12):** Memory/model stability, model slug preservation.  
- **0.104 (Feb 18):** Distinct approval IDs for multi-approval shell commands; app-server v2 (thread archive notifications); `WS_PROXY`/`WSS_PROXY`; safety-check and cwd-prompt fixes.  
- **Sandbox:** `--sandbox read-only | workspace-write | danger-full-access`; no native "plan" flag; our use of `--sandbox read-only` for plan mode remains correct.  
- **Subagents/MCP:** Codex as MCP server (`codex mcp-server`) exposes `codex`/`codex-reply` tools; community `codex-subagents-mcp` uses profiles (e.g. `sandbox_mode = "read-only"` for review).  
- **Impact:** No change to plan-mode mapping. Subagent/MCP integration for Codex is relevant for orchestrator subagent invocation.

**Claude Code**  
- **v2.1.41-v2.1.45 (Feb 2026):** CLI auth commands, Windows ARM64, prompt cache and startup improvements; v2.1.45: Sonnet 4.6, `spinnerTipsOverride`, rate-limit telemetry type updates, `enabledPlugins`/`extraKnownMarketplaces` from `--add-dir`, permission destination persistence, plugin command availability fix.  
- **Plan mode:** `--permission-mode plan` (unchanged).  
- **Subagents:** `.claude/agents/` markdown definitions; built-in Explore/Plan/General-purpose; CLI/runtime subagent support.  
- **Hooks:** SessionStart, UserPromptSubmit, PreToolUse, PermissionRequest, PostToolUse, SubagentStart/SubagentStop, etc.; config via `/hooks` or `~/.claude/settings.json` / project settings.  
- **Plugins:** `.claude-plugin/plugin.json`; skills namespaced as `/plugin-name:skill-name`.  
- **Impact:** Plan mode and subagent/hook/plugin docs are still accurate; v2.1.45 plugin and `--add-dir` behavior may matter for project-specific plugins.

**Gemini CLI**  
- **v0.22-v0.28 (Dec 2025 - Feb 2026):** Extensions (Conductor, Endor Labs), Colab headless use, Agent Skills (built-in skills, `/agents refresh`, `/skills`), policy engine (modes like `plan`, granular shell allowlisting), hooks visibility, default folder trust.  
- **v0.24-v0.26:** Agent skills by default, generalist agent, skill-creator/pr-creator skills, rewind/introspect.  
- **v0.28 (Feb 3):** Auth/consent, custom themes, Positron IDE, `/prompt-suggest`.  
- **Plan mode:** Experimental; enable with `experimental.plan: true` in settings; `--approval-mode=plan` or `general.defaultApprovalMode: "plan"`; tool restrictions (read-only + write only in plans dir); policies can allow e.g. `run_shell_command` for `git status`/`git diff` or research subagents in plan mode.  
- **Subagents:** `experimental.enableAgents: true`; built-in codebase_investigator, cli_help, generalist; custom agents in `~/.gemini/agents/*.md` or `.gemini/agents/*.md`.  
- **Impact:** Our use of `--approval-mode plan` is correct. Document that `experimental.plan: true` (and optionally `enableAgents`) may be required; policy engine and research subagents in plan mode are relevant for advanced use.

**GitHub Copilot CLI**  
- **Jan 14-21, 2026:** Plan mode in interactive UI (Shift+Tab); advanced reasoning models; GPT-5.2-Codex; inline steering; background delegation `&`; `/review`; context auto-compaction; automation flags (`--silent`, `--share`, `--available-tools`, `--excluded-tools`).  
- **Plan mode:** Interactive only (Shift+Tab); no dedicated `--plan` flag for headless `-p` usage. Programmatic use remains `-p` with existing flags; our "omit `--allow-all-paths`/`--allow-all-urls` when plan_mode" remains the way to get more restrictive behavior in headless.  
- **Provider bridge:** Plan mode remains interactive in Copilot UI; headless runs continue through CLI-bridged restrictive flags.
- **Impact:** No change to our headless plan-mode mapping; document that native plan mode is interactive; if Copilot adds a headless plan flag, switch to it in runner and platform_specs.

**Summary for this plan**  
- Plan mode: Cursor, Claude, Gemini implementations are up to date; Codex (read-only sandbox) and Copilot (restrictive flags) unchanged.  
- Subagents/hooks/plugins: All five platforms have had relevant changes (Cursor plugins/async subagents; Codex MCP; Claude plugins/hooks; Gemini skills/policies/subagents; Copilot provider/CLI behavior). Keep platform-capabilities and subagent-integration sections in sync with release notes and official docs.

**Gaps vs "use plan mode for every request":**

1. **Default is off** -- All tiers default to `plan_mode: false` in `default_config` and in YAML, so users must enable it per tier.
2. **No global override** -- There is no single "use plan mode for all tiers" or "prefer plan mode by default" setting; only per-tier toggles in Config and Wizard.
3. **No one-click "all tiers"** -- Enabling plan mode for every tier requires toggling four tier cards.
4. **Subagent invocations** -- When subagent integration is added, `ExecutionRequest` built for subagent runs must receive the same `plan_mode` as the tier (so plan mode is applied to every request, including subagent calls).
5. **Gemini** -- `--approval-mode plan` can require `experimental.plan: true` in settings; we do not currently validate or document this at runtime.
6. **Copilot** -- If the CLI gains a native headless plan flag (e.g. `--plan`), we should prefer it over "omit allow-all" and document it in `platform_specs` and AGENTS.md.

### Recommendations

**1. Keep migration-safe default off for all tiers**

- In `default_config.rs`, set `plan_mode: false` for `phase`, `task`, `subtask`, and `iteration`.
- In `config_override.rs` and YAML defaults, use `plan_mode: false`.
- Rationale: Existing projects should not be forced into plan mode on first load. Users can still enable plan mode quickly via global toggle or one-click action.

**2. Global "Use plan mode for all tiers" (in scope -- see "GUI and Backend Scope" below)**

- Add a single GUI control (e.g. in Config, above or beside tier cards): "Use plan mode for all tiers" that:
  - When turned on: sets `plan_mode: true` for phase, task, subtask, and iteration.
  - When turned off: sets `plan_mode: false` for all (or restores last per-tier values if we store them).
- Optionally persist a "prefer plan mode" user preference only after explicit opt-in, so new tiers/configs remain migration-safe by default.

**3. One-click "Enable plan mode for all tiers" (in scope)**

- In Config (and optionally Wizard), add a button or link: "Enable plan mode for all tiers" that sets all four tier `plan_mode` to `true` in one action (single message or batch update).
- Complements the global toggle and makes it easy to align with "plan mode for every request" without editing each card.

**4. Ensure plan mode flows into subagent invocations**

- When building `ExecutionRequest` (or equivalent) for subagent runs (e.g. in `execute_tier_with_subagents` or the platform adapter), pass through the tier's `plan_mode` (from `TierConfig` or `IterationContext`) so that:
  - Every orchestrator-driven request (including subagent calls) respects the tier's plan mode setting.
- In the subagent integration plan and code, explicitly document that `plan_mode` is taken from the tier and applied to the request used for the subagent.

**5. Platform-specific robustness (in scope)**

- **Gemini:** When `plan_mode` is true and platform is Gemini, document in GUI tooltip and add a Doctor check that reads `~/.gemini/settings.json` and warns if `experimental.plan` is not set.
- **Copilot:** When a native plan flag exists, add it to `platform_specs` and the Copilot runner (e.g. `--plan` or equivalent) and use it when `plan_mode` is true, instead of or in addition to omitting `--allow-all-paths` / `--allow-all-urls`.
- **Codex:** Current "read-only sandbox" behavior is a reasonable stand-in for plan mode; if Codex adds an explicit plan/read-only flag, prefer that and document in AGENTS.md.

**6. Tooltip and discoverability (in scope)**

- Update the `tier.plan_mode` tooltip to state that plan mode is recommended for all tiers for best results (e.g. "Recommended: enable for all tiers for more reliable, step-by-step behavior").
- In Wizard, keep default plan mode toggles at false and provide a visible one-click "Enable plan mode for all tiers" action for opt-in behavior.

**7. GUI gaps summary (cross-plan)**

- **Config:** Plan mode and subagent UI live in Config (Tiers tab, optional global toggle, Subagents section). **MiscPlan** adds cleanup/evidence under Config → Advanced (§7.5); **Worktree** adds Branching tab controls. Ensure a single Save persists the whole GuiConfig (including plan mode, subagents, cleanup, branching) and that the Option B run-config build (see §config-wiring above) includes all of these so the run sees current UI state.
- **Unwired / implementation status:** For a consolidated list of unwired features, missing GUI controls, and implementation status (interview config, run config Option B, cleanup, Doctor), see **MiscPlan §9.1.18**.
- **Platform CLI capabilities (hooks, skills, plugins, extensions):** This plan documents them in **"Platform-Specific Capabilities & Extensions"** below. We pass subagent names and plan mode via **prompt/CLI args**; we do not require Cursor plugins or Claude hooks for core orchestration. **MiscPlan §7.6** summarizes how cleanup/prepare are implemented in Puppet Master and how we might optionally leverage or document platform hooks/skills. When changing subagent invocation, keep platform_specs and AGENTS.md aligned with CLI release notes.
- **Plans/newfeatures.md:** For **orchestration prompt** injection (§1: session-level "assess → decompose → act → verify" via `--append-system-prompt`), **background/async agents** (§2: queue, git branch per run, output dir, GUI panel), and **hook system** (§9: event hooks as extension point at tier/iteration boundaries), see newfeatures; those features extend this plan without replacing tier or subagent structure.

### Implementation checklist

**Plan mode -- backend**
- [ ] Keep default `plan_mode` as `false` for all tiers in `default_config.rs`, `config_override.rs`, and GUI defaults.
- [ ] Add `use_plan_mode_all_tiers` (and optional `last_per_tier_plan_mode`) to persisted config; apply in tier config load/sync so all tiers become true/false when global is toggled.
- [ ] Ensure subagent/invocation path receives tier `plan_mode` and passes it into `ExecutionRequest` (document in subagent plan and in code).

**Plan mode -- frontend (Config)**
- [ ] Add global "Use plan mode for all tiers" toggle in Config (above tier cards); message and handler; persist; when global on, tier plan_mode toggles disabled and show true.
- [ ] Add "Enable plan mode for all tiers" one-click button in Config; message and handler; persist.
- [ ] Update `tier.plan_mode` tooltip in `widgets/tooltips.rs` to recommend enabling for all tiers; add Gemini plan-mode hint on tier card when platform is Gemini and plan mode on.

**Plan mode -- frontend (Wizard)**
- [ ] Default plan mode to false for new runs in Wizard; add "Enable plan mode for all tiers" in Wizard when tier plan-mode toggles exist.

**Subagent -- backend**
- [ ] Add subagent config struct and load/save from `config.yaml` (or app config); orchestrator uses `enable_tier_subagents`, `tier_overrides`, `disabled_subagents`, `required_subagents`.

**Subagent -- frontend (Config)**
- [ ] Add "Subagents" section on Config: enable toggle, tier overrides (per-tier list or multi-select), disabled/required lists; messages and handlers; persist to same config as backend.
- [ ] Add **Subagent personas / info setup:** preload list from project `.claude/agents`; user can add their own and delete any (including preloaded); optional AI/batch trim for smaller footprint; list with name + description; "Edit" per subagent to set custom description/instruction (persist to `SubagentGuiConfig.persona_overrides` -- overrides come only from this UI); prompt builder / runner injects persona (override if present, else preloaded content) when invoking that subagent (see Gap §11).

**Doctor**
- [ ] Add Gemini + plan mode check in Doctor: read `~/.gemini/settings.json`, warn if `experimental.plan` missing when any tier has Gemini and plan_mode true.
- [ ] **Plans/newtools.md:** Add Doctor checks for (1) headless tool exists/runs when project planned custom headless tool, (2) platform CLI versions (e.g. `agent --version`, `codex --version`), (3) MCP/Context7 reachable per platform. Use newtools §8.2 for per-platform MCP config reference; §11 and §12.6 for headless-tool and MCP check details.

**Other**
- [ ] When Copilot (or Codex) gains a native plan flag, add it to `platform_specs` and the runner and update AGENTS.md.
- [ ] **Fully test plan mode in the CLIs:** Add plan mode CLI verification tests (run each platform CLI with plan mode enabled; assert exit success and correct flags); env-gated like `platform_cli_smoke` (e.g. `RUN_PLAN_MODE_CLI_TESTS=1`). See "3. Plan Mode CLI Verification" in this plan.
- [ ] Unit tests for global plan-mode toggle and one-click; subagent config load/apply tests.
- [ ] **Resolve gaps:** Before or during implementation, resolve each item in **"Gaps and Clarifications"** (persistence location for plan-mode global, subagent in GuiConfig, Doctor config source, canonical subagent list, tier-overrides shape, orchestrator/subagent code path, Message/handlers, TierId type, **interview config wiring -- Gap §9**, **platform-specific parsers -- Gap §10**, **subagent persona registry and injection -- Gap §11**).
- [ ] **Mitigate potential issues:** Review **"Potential Issues"** and address defaults, validation, platform adapters, caching, and persistence so the feature is robust in production.
- [ ] **DRY method and widget catalog:** Check `docs/gui-widget-catalog.md` before adding UI; use existing widgets; tag new reusable items with `DRY:WIDGET:`, `DRY:FN:`, or `DRY:DATA:`; run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` after widget changes.
- [ ] **Interview config wiring:** Wire interview settings per **"Interviewer Enhancements and Config Wiring"**: add `min_questions_per_phase` and `max_questions_per_phase` (Option for unlimited) to `InterviewOrchestratorConfig`, set from `gui_config.interview` in `app.rs`, use in PhaseManager and phase-complete logic and prompts; add GUI controls (Min / Max with Unlimited). Wire `require_architecture_confirmation` and `vision_provider` into `InterviewOrchestratorConfig` and use in interview flow (architecture gate; vision platform when image flows exist).
- [ ] **Config-wiring validation at each tier:** Implement `validate_config_wiring_for_tier` (or equivalent) and call it at **Phase start, Task start, Subtask start, Iteration start** in the main orchestrator (and at phase/sub-tier start in the interview orchestrator). See **"Avoiding Built but Not Wired"** and **Implementation Notes -- Config-wiring validation**.

**Config-Wiring Validation: Required vs Optional Fields (Resolved):**

| Field | Category | On Missing |
|-------|----------|------------|
| `platform` | Required | **Fail** — cannot execute without a Provider |
| `model` | Required | **Fail** — cannot execute without a model |
| `working_directory` | Required | **Fail** — cannot execute without a target directory |
| `effort` | Optional | **Warn** — use Provider default |
| `plan_mode` | Optional | **Warn** — use global default (`false`) |
| `subagents` | Optional | **Warn** — use tier-level default assignment |
| `custom_hooks` | Optional | **Warn** — no hooks applied |
| `max_turns` | Optional | **Warn** — use Provider default (unlimited) |
| `timeout` | Optional | **Warn** — no timeout |

Validation runs at tier start via `validate_config_wiring_for_tier()`. Required field failures emit `config.validation.failed` seglog event and halt. Optional field warnings emit `config.validation.warning` and proceed with defaults.
- [ ] **AGENTS.md wiring checklist:** Add to AGENTS.md (e.g. under Pre-Completion Verification Checklist or DO): for any new execution-affecting config, follow the three-step wiring checklist (add to execution config, set at construction from GUI/file, use in runtime); link to this plan or REQUIREMENTS.md.
- [ ] **Start and end verification:** Implement start-of-phase/task/subtask verification (config-wiring + wiring/readiness: GUI? backend? steps make sense? gaps?) and end-of-phase/task/subtask verification (wiring re-check + acceptance gate + quality verification / code review). See **"Start and End Verification at Phase, Task, and Subtask"**; resolve gaps there (quality definition per tier, readiness checklist source of truth, interview-phase mirror).
- [ ] **Lifecycle hooks:** Implement BeforeTier/AfterTier hooks (track active subagent, inject context, prune stale state, validate handoff format). Leverage platform-native hooks where available (Cursor, Claude, Gemini); use orchestrator-level middleware for all platforms. Use file-based coordination for Codex/Copilot. See **"Lifecycle and Quality Features"**.
- [ ] **Structured handoff validation:** Implement `validate_subagent_output()` with platform-specific parsers (JSON for Cursor/Claude/Gemini, JSONL for Codex, text parsing for Copilot). Enforce `SubagentOutput` format (task_report, downstream_context, findings). Retry on malformed output; fail-safe after retry.
- [ ] **Remediation loop:** Implement remediation loop for Critical/Major findings. Parse findings from reviewer subagent; block completion on Critical/Major; re-run overseer + reviewer until resolved or max retries; escalate to parent-tier on max retries. Minor/Info findings log and proceed.
- [ ] **Cross-session memory:** Implement `save_memory()` and `load_memory()` for architectural decisions, patterns, tech choices, pitfalls. Persist at Phase completion; load at run start; inject into Phase 1 context. Use for subagent selection (e.g., "project uses Rust" → prefer rust-engineer).
- [ ] **Active agent tracking:** Track `active_subagent: Option<String>` in `TierContext`; update in BeforeTier/AfterTier hooks; persist to `.puppet-master/state/active-subagents.json`; expose for logging, debugging, GUI display.
- [ ] **Safe error handling:** Wrap hooks and verification functions in `safe_hook_main()` that guarantees structured output (JSON or Result) even on failure. Hooks must never crash the session.
- [ ] **Lazy lifecycle:** Create verification state directories on first write (no setup command); prune stale state (>2 hours) in BeforeTier hook (no teardown command).

This keeps plan mode easy to enable for every request while preserving migration-safe defaults and per-tier control.

---

