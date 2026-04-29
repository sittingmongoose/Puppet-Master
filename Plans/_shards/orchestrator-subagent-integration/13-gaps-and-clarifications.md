## Gaps and Clarifications

These items are underspecified or inconsistent in the plan. Resolve them during implementation so frontend and backend work end-to-end.

### 1. Where to persist `use_plan_mode_all_tiers`

- **Gap:** The plan says add to "GuiConfig or app settings that save to `.puppet-master/settings.json`".
- **Clarify:**

**Plan Mode Global State (Resolved — Option A: GuiConfig):**
- Add `use_plan_mode_all_tiers: bool` to `GuiConfig`.
- Default: `false` (migration-safe; users opt in).
- Persisted in redb (`config:gui.use_plan_mode_all_tiers`).
- SSOT: this field in GuiConfig. `settings.json` is NOT used for this setting.
- GUI: toggle in Settings → Orchestration → "Use plan mode for all tiers" checkbox.
- Per-tier overrides still available (stored separately in tier config).

### 2. Subagent config in GuiConfig

- **Gap:** Plan says load subagent config from `.puppet-master/config.yaml` under `subagentConfig`, and "single save path that includes subagent config," but **GuiConfig** (in `config/gui_config.rs`) has no `subagentConfig` field.
- **Clarify:** Add a top-level field to **GuiConfig**, e.g. `subagent: SubagentGuiConfig`, with `enable_tier_subagents`, `tier_overrides`, `disabled_subagents`, `required_subagents`. Serialize as `subagentConfig` in YAML (or `subagent` with serde rename) so load/save use the same file as the rest of Config. Ensure default in GuiConfig matches plan defaults (enable_tier_subagents: true, empty overrides/lists). **Persona content storage:** For the "Subagent personas / info setup" feature, do **not** store canonical Persona body overrides inside `SubagentGuiConfig`. Persona description/instruction edits persist in Puppet Master Persona storage per `Plans/Personas.md`; config may store selection or visibility state only if needed. At runtime, resolve the subagent name against Puppet Master Persona storage first; provider-native agent directories are seed/import sources only. Orchestrator and interview both read the same canonical Persona content.

### 3. Doctor Gemini plan-mode check: source of tier config

- **Gap:** The check must know "any tier has platform Gemini and plan_mode == true." Doctor checks currently have `async fn run(&self) -> CheckResult` with no parameters.
- **Clarify:** The Gemini plan-mode check should **discover and load the project config** inside `run()`: use `config_discovery::discover_config_path(None)` then `gui_config::load_config(path)` (or the same loader the Config page uses). If the file is not GuiConfig-shaped, fall back to "skip check" or "warn: could not read tier config." This keeps the DoctorCheck trait unchanged and uses the same config file as the app.

### 4. Canonical list of subagent names

### Delegated tool-contract alignment

Orchestrator delegation enters the same `task` tool child-run contract used elsewhere.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Commands_System.md, ContractName:Plans/interview-subagent-integration.md

Rules:
- no provider-native `/subagent`, `/agent`, `/fleet`, or `/delegate` syntax is normative orchestrator runtime behavior.
- launch validation goes through `subagent_registry` and the requested/effective runtime pipeline.
- explicit runtime-surface requests do not silently fallback.
- Copilot-native routing remains strict-denied unless the parent is already Copilot-rooted.
- command subtasks and orchestrator child runs are not separate runtime classes.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Run_Modes.md
### 5. Tier overrides: one list per tier vs contextual keys

- **Gap:** YAML shows `tierOverrides.phase.default`, `.phase.architecture`, `.phase.product`, `.task.rust`, `.task.python`, etc. The GUI section says "for each tier (phase/task/subtask/iteration), a text field or list editor for override subagent names."
- **Clarify:** Decide (a) **Simple:** one list per tier (phase, task, subtask, iteration) so `tier_overrides` is e.g. `HashMap<TierName, Vec<String>>` and YAML is `phase: [project-manager]`, `task: [rust-engineer]`, or (b) **Full:** keep contextual keys (phase.default, phase.architecture, task.rust, ...) and add UI for them (e.g. phase: "default" / "architecture" / "product" with a list each). For first implementation, (a) is enough; document that contextual overrides can be added later if needed.

### 6. Orchestrator and subagent code not yet present

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0628
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - whenever a seam still depends on a missing canonical event/record family or a missing owner doc, it is not yet reconciliation-ready
  - `focused_run_id` when present
  - focused_run_id
  - Owner docs currently disagree on whether `resume_url` is required or merely carried when present.
  - resume_url
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

- **Gap:** The plan references `execute_tier_with_subagents`, `build_subagent_invocation`, `execute_with_subagent`, and `SubagentSelector`. These do not exist in the codebase yet; they are specified in the plan's "Integration with Orchestrator" and Phase 3.
- **Clarify:** Phase 3 (and any subagent execution path) must: (1) Read `enable_tier_subagents` from config; if false, skip subagent invocation (or use a single non-subagent path). (2) When building the list of subagents for a tier, apply `tier_overrides` (replace or merge with selected list), then filter by `disabled_subagents` and ensure `required_subagents` are included. (3) When building `ExecutionRequest` for each subagent run, set `request.plan_mode = tier_config.plan_mode`. Ensure the checklist item "Ensure subagent/invocation path receives tier plan_mode" is done in that code path.

### 7. Message enum and app.rs handlers

- **Gap:** The plan names messages (e.g. `ConfigUsePlanModeAllTiersToggled`, `ConfigEnablePlanModeAllTiers`, `ConfigSubagentEnableTierSubagentsToggled`, ...) but does not list all new `Message` variants or where each is handled in `app.rs`.
- **Clarify:** During implementation, add every new variant to the `Message` enum and a corresponding branch in `App::update`. Document in the plan or in code: "Plan mode global: ConfigUsePlanModeAllTiersToggled, ConfigEnablePlanModeAllTiers; Subagent: ConfigSubagentEnableTierSubagentsToggled, ConfigSubagentTierOverrideChanged, ConfigSubagentDisabledListChanged, ConfigSubagentRequiredListChanged."

### 8. Tier id type for `last_per_tier_plan_mode`

- **Gap:** Plan says `last_per_tier_plan_mode: Option<HashMap<TierId, bool>>`. The codebase uses tier names as strings (e.g. `"phase"`, `"task"`).
- **Clarify:** Use `HashMap<String, bool>` keyed by tier name (`"phase"`, `"task"`, `"subtask"`, `"iteration"`) unless a dedicated `TierId` type already exists; then use that consistently.

### 9. Interview config wiring and execution config

- **Gap:** Several interview settings exist in `InterviewGuiConfig` and `InterviewConfig` but are not in `InterviewOrchestratorConfig` and are never used in `interview/` (orchestrator, phase_manager, prompt_templates). See **"Interviewer Enhancements and Config Wiring"** and **"Avoiding Built but Not Wired"** in this plan.
- **Clarify:** (1) **Min/max questions:** Add `min_questions_per_phase` and `max_questions_per_phase` (Option for unlimited) to `InterviewOrchestratorConfig`; set from `gui_config.interview` in `app.rs`; pass into PhaseManager and use in phase-complete logic and prompts. (2) **require_architecture_confirmation** and **vision_provider:** Add to `InterviewOrchestratorConfig`, set at construction, and use in interview flow (architecture gate and vision platform selection). (3) For any future execution-affecting interview setting, follow the three-step wiring checklist: add to execution config, set at construction, use in runtime.

### 10. Platform-specific subagent output parsers

- **Gap:** Structured handoff validation (`validate_subagent_output`) needs platform-specific parsers: JSON for Cursor/Claude/Gemini, JSONL for Codex, text parsing for Copilot. The plan does not yet specify parser implementation details or fallback behavior when parsing fails.
- **Clarify:** (1) **JSON parsers:** For Cursor/Claude/Gemini, use `serde_json` to parse `--output-format json` output into `SubagentOutput`. Handle missing fields gracefully (e.g., `downstream_context: None` if field absent). (2) **JSONL parser:** For Codex, parse `--json` or `--experimental-json` JSONL stream; aggregate events into single `SubagentOutput` (last event wins for fields, accumulate findings). (3) **Text parser:** For Copilot, use regex or pattern matching to extract "Task Report:", "Downstream Context:", "Findings:" sections from text output. If sections missing, treat as malformed and retry. (4) **Fallback:** If parsing fails after retry, create partial `SubagentOutput { task_report: raw_output, downstream_context: None, findings: vec![] }` and mark tier as "complete with warnings" rather than failing the run.

**Subagent Output Parser Fallback (Resolved):**

Platform-specific parsers handle output from each Provider:
- **Cursor/Claude/Gemini:** JSON parser (stream-json NDJSON events)
- **Codex:** JSONL parser (newline-delimited JSON events)
- **Copilot:** Text parser (plain text output, regex-based signal extraction)

When a platform-specific parser fails:
1. **Log:** Record parse error in seglog (`parser.error` event) with the first 500 characters of raw output for diagnostics.
2. **Generic fallback:** Attempt generic text extraction — scan for completion signals (including legacy naming variants), error patterns (stack traces, "error:", "fatal:"), and file modification markers.
3. **If generic succeeds:** Use extracted data; flag the turn as `parser_fallback_used` in seglog metadata.
4. **If generic also fails:** Treat as a Provider error. Retry once with the same Provider. If retry also fails, surface error to user: "Could not parse output from [Provider]. [Retry] [Skip] [View raw output]."
5. **Never silently drop output.** All raw output is preserved in the seglog event regardless of parse success.

### 11. Subagent Persona info: storage, overrides, and injection

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0625
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - subagent overrides do not accidentally become package defaults
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

- **Resolved:** Persona storage layout, schema, validation, GUI management, and context-injection rules are canonically defined in `Plans/Personas.md` (SSOT). This gap is closed; do not restate those definitions here.
- **Summary:** (1) **Storage:** `Plans/Personas.md` §2 — project-local (`.puppet-master/personas/<id>/PERSONA.md`) overrides global (`~/.config/puppet-master/personas/<id>/PERSONA.md`). (2) **Overrides:** User edits Personas via the GUI (Settings > Advanced > Personas); edits persist to Puppet Master Persona storage only — never to `.claude/`, `.github/`, or other provider-native dirs (`Plans/Personas.md` §4.4). (3) **Injection:** The context compiler resolves the Persona and injects its Markdown body into the Instruction Bundle (`Plans/Personas.md` §5.2). Orchestrator and interview use the same injection logic. (4) **Interview:** Interview selects Personas dynamically by phase/tech stack; Persona overrides supply custom content for selected Personas but do not change *which* Personas are selected (`Plans/Personas.md` §5.2).

ContractRef: ContractName:Plans/Personas.md#PERSONA-INJECTION, ContractName:Plans/Personas.md#STORAGE-LAYOUT

---

