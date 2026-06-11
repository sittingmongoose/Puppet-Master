# Formatters System (Canonical SSOT)


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## 0. Scope and SSOT status

This document is the **single canonical source of truth** for the Puppet Master formatter system — how formatters run, when they trigger, how they are configured, and how formatting changes are tracked. All other plan documents MUST reference this document by anchor (e.g., `Plans/Formatters_System.md#FORMATTER-CONFIG`) rather than restating formatter definitions or lifecycle rules.

Support-system SSOTs must surface runtime and safety gaps instead of hiding them: `Plans/Formatters_System.md` / `/Formatters_System.md` owns `format.*` event registration, HTE formatter delivery, and formatter `/schema`; `Plans/Plugins_System.md` / `/Plugins_System.md` owns `mutation_capable`, in-process execution, subprocess-sandbox expectations, and prompt `/param` hooks; `Plans/Skills_System.md` / `/Skills_System.md` owns DAE `/bundling`, runtime skills `/listing`, and HTE reachability; `/FileSafe` owns file-safety boundaries when formatter subprocesses touch project files. Under-specified gaps must be visible in the owning SSOTs before implementation treats them as safe defaults.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

### SSOT references (DRY)
- Locked decisions: `Plans/Spec_Lock.json`
- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`
- DRY + ContractRef rule: `Plans/DRY_Rules.md`
- Canonical terms: `Plans/Glossary.md`
- Deterministic ambiguity handling: `Plans/Decision_Policy.md` + `Plans/auto_decisions.jsonl`
- Tool registry + tool semantics: `Plans/Tools.md`
- Run modes (HTE/DAE): `Plans/Run_Modes.md`
- Plugin system: `Plans/Plugins_System.md`
- OpenCode baseline (formatters): `Plans/OpenCode_Deep_Extraction.md` §7E
- GUI specification: `Plans/FinalGUISpec.md`
- Document packaging: `Plans/Document_Packaging_Policy.md` / `/Document_Packaging_Policy.md`
- File safety: `Plans/FileSafe.md` / `/FileSafe.md`
- Formatter owner path: `Plans/Formatters_System.md` / `/Formatters_System.md`

---

## 1. Definitions

<a id="DEF-FORMATTER"></a>
### 1.1 Formatter

A **Formatter** is an external command that transforms a file's content to conform to a style or convention. Puppet Master invokes formatters after file-write/edit operations during Hosted Tool Execution (HTE). Formatters are stateless; they read a file, transform it in-place, and exit.

<a id="DEF-FORMATTER-EVENT"></a>
### 1.2 Formatter trigger event

The formatter trigger event is an internal event equivalent to `File.Edited` — emitted whenever a hosted tool (`write`, `edit`, `patch`, `multiedit`) successfully modifies a file. This event carries the file path and extension.

ContractRef: ContractName:Plans/Glossary.md, ContractName:Plans/Run_Modes.md#STRATEGY-HTE

---

## 2. Lifecycle

<a id="LIFECYCLE"></a>

### 2.1 When formatters run

Formatters run **after every file write/edit performed by hosted tools** (HTE strategy only). When a tool modifies a file:

1. The tool completes and emits a `File.Edited` event with the file path.
2. The formatter engine determines the file extension and finds matching enabled formatters (§3, §4).
3. Matching formatters are invoked **sequentially** in registration order.
4. The formatted file replaces the tool's output on disk.

Rule: Formatters MUST NOT run during Delegated Agent Execution (DAE). In DAE mode, the provider CLI manages its own formatting; Puppet Master performs no post-hoc formatting.

DAE analytics and `/blocked` truth still require a post-hoc `tool-event` story in the provider/run-mode event owners; the formatter subsystem records only HTE formatter events and must not synthesize DAE tool-event history after the fact.

ContractRef: ContractName:Plans/Run_Modes.md#STRATEGY-HTE, ContractName:Plans/Run_Modes.md#STRATEGY-DAE

### 2.2 Formatting changes in diffs and evidence


When a formatter modifies a file beyond whitespace-only changes, the diff between the tool's output and the formatted output is recorded in the evidence ledger as a `format.applied` event:

```
{
  "event_type": "format.applied",
  "formatter_id": "rustfmt",
  "file_path": "src/main.rs",
  "diff_bytes": 142,
  "timestamp": "..."
}
```

This ensures reviewers can distinguish agent-authored changes from formatter-applied changes.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord

### 2.3 Error handling

If a formatter command exits with a non-zero status:
- The original tool output is **preserved** (the file is not corrupted).
- A `format.error` event is logged with the formatter ID, file path, exit code, and stderr.
- The pipeline continues; formatter failures do not block the run.

ContractRef: PolicyRule:Decision_Policy.md§2

---

## 3. Built-in formatters

<a id="BUILT-IN-FORMATTERS"></a>

The following formatters are available out of the box. Each has an **auto-detection** check that runs once per session (or per project switch) to determine availability.

Rule: Built-in formatters are enabled by default when their detection check passes. Users can disable any formatter via config (§4).

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md

| Formatter | Extensions | Detection |
|-----------|-----------|-----------|
| `prettier` | .js, .jsx, .ts, .tsx, .html, .css, .json, .yaml, .md | `prettier` in package.json dependencies |
| `biome` | .js, .jsx, .ts, .tsx, .json, .css, .html | `biome.json` or `biome.jsonc` exists |
| `rustfmt` | .rs | `rustfmt` binary on PATH |
| `gofmt` | .go | `gofmt` binary on PATH |
| `ruff` | .py, .pyi | `ruff` binary on PATH + config present |
| `shfmt` | .sh, .bash | `shfmt` binary on PATH |
| `clang-format` | .c, .cpp, .h, .hpp | `.clang-format` file exists |
| `dart` | .dart | `dart` binary on PATH |
| `mix` | .ex, .exs, .eex | `mix` binary on PATH |
| `zig` | .zig, .zon | `zig` binary on PATH |
| `ktlint` | .kt, .kts | `ktlint` binary on PATH |
| `rubocop` | .rb, .rake | `rubocop` binary on PATH |
| `standardrb` | .rb, .rake | `standardrb` binary on PATH |
| `pint` | .php | `laravel/pint` in composer.json |
| `ocamlformat` | .ml, .mli | `ocamlformat` binary + `.ocamlformat` exists |
| `nixfmt` | .nix | `nixfmt` binary on PATH |
| `ormolu` | .hs | `ormolu` binary on PATH |
| `terraform` | .tf, .tfvars | `terraform` binary on PATH |
| `latexindent` | .tex | `latexindent` binary on PATH |
| `gleam` | .gleam | `gleam` binary on PATH |
| `cljfmt` | .clj, .cljs | `cljfmt` binary on PATH |

---

## 4. Configuration

<a id="FORMATTER-CONFIG"></a>

### 4.1 Global disable

Setting `config.formatters.enabled = false` disables **all** formatters globally. No formatters run regardless of per-formatter config.

ContractRef: PolicyRule:Decision_Policy.md§2

### 4.2 Per-formatter config

Each formatter can be individually configured:

```toml
[formatter.rustfmt]
disabled = false
command = ["rustfmt", "--edition", "2021", "$FILE"]
environment = { RUST_LOG = "warn" }
extensions = [".rs"]
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `disabled` | `bool` | `false` | When `true`, this formatter is skipped even if detected. |
| `command` | `string[]` | Built-in default | Command and arguments. `$FILE` is replaced with the file path at execution time. If empty (`[]`), the formatter is skipped. |
| `environment` | `map<string, string>` | `{}` | Environment variables set when running the formatter command. |
| `extensions` | `string[]` | Built-in default | File extensions this formatter handles. Overrides the built-in extension list. |

### 4.3 `$FILE` placeholder

The literal string `$FILE` in the `command` array is replaced with the absolute path of the file being formatted at execution time. If `$FILE` does not appear in the command, the file path is appended as the last argument.

### 4.4 Custom formatters

Users can define custom formatters by adding entries to the config with `command` and `extensions`. Custom formatters have no auto-detection; their `enabled()` check is always `true` (unless `disabled = true`).

```toml
[formatter.my-custom-formatter]
command = ["my-fmt", "--fix", "$FILE"]
extensions = [".xyz", ".abc"]
```

### 4.5 Config persistence

Formatter config is stored in:
- **Global:** `~/.config/puppet-master/config.toml` under the `[formatter]` section.
- **Project:** `.puppet-master/config.toml` under the `[formatter]` section (overrides global per-formatter).

ContractRef: ContractName:Plans/Plugins_System.md#PLUGIN-CONFIG

---

## 5. GUI requirements

<a id="GUI-FORMATTERS"></a>

The Formatters settings screen is a tab in the unified Settings page (`Plans/FinalGUISpec.md` §7.4).

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md

### 5.1 Formatters tab

A dedicated **Formatters** tab in Settings MUST provide:

1. **Global disable toggle:** "Enable formatters" toggle (default on). When off, all formatters are skipped.

2. **Formatter list:** Table of all formatters (built-in + custom). Columns: Name, Extensions (truncated), Status (detected/not found/disabled/custom), Enable/Disable toggle. Built-in formatters that fail detection show "(not found)" in Status.

3. **Formatter detail (expand row):** Expanding a row shows:
   - **Command:** Editable command array (text input or tag list). `$FILE` placeholder highlighted.
   - **Environment:** Key-value editor for environment variables.
   - **Extensions:** Editable extension list.
   - "Reset to defaults" per field (for built-in formatters).

4. **Add custom formatter:** "Add formatter" button with fields: Name (ID), Command, Extensions, Environment. Validates: name unique, command non-empty, at least one extension.

5. **Remove:** Remove button for custom formatters. Built-in formatters can only be disabled, not removed.

6. **Scope selector:** Toggle between Global and Project config (same pattern as Permissions tab in `Plans/Permissions_System.md` §10.8).

### 5.2 ELI5/Expert copy

Formatter UI elements follow the app-level Interaction Mode (Expert/ELI5) toggle per `Plans/FinalGUISpec.md` §7.4.0. Tooltip keys: `tooltip.formatters.*` prefix.

- **ELI5:** Simplified view showing formatter list with enable/disable toggles only. Command, environment, and extension editing are hidden.
- **Expert:** Full view with all sections visible.

---

## 6. OpenCode baseline and Puppet Master deltas

<a id="BASELINE-DELTAS"></a>

Per `Plans/OpenCode_Deep_Extraction.md` §7E and §9E:

### 6.1 Baseline

OpenCode formatters run automatically after every `File.Event.Edited` bus event. Built-in formatters auto-detect availability via binary checks and config file presence. Config `formatter: false` disables all. Per-formatter config: `{ disabled, command, environment, extensions }`. `$FILE` placeholder in command arrays. Custom formatters added via config with `command` and `extensions`.

### 6.2 Puppet Master deltas

1. **Event-driven trigger in Rust:** OpenCode uses a TypeScript bus event system. Puppet Master implements the trigger via internal event dispatch after hosted tool write/edit operations.
2. **Formatter auto-detection in Rust:** OpenCode uses `BunProc.which()` for binary detection. Puppet Master uses `which` crate or PATH search via `path_utils::resolve_executable`.
3. **Evidence tracking:** OpenCode does not explicitly track formatting diffs. Puppet Master records `format.applied` events with diff metadata in the evidence ledger.
4. **HTE-only enforcement:** OpenCode runs formatters regardless of execution strategy. Puppet Master restricts formatters to HTE mode only; DAE delegates formatting to the provider CLI.
5. **GUI settings:** OpenCode has no GUI. Puppet Master provides a dedicated Formatters settings tab with per-formatter config editing.

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md

---

## 7. Acceptance criteria

<a id="ACCEPTANCE"></a>

These criteria are testable assertions that MUST hold for any conforming implementation.

ContractRef: ContractName:Plans/Formatters_System.md, ContractName:Plans/Progression_Gates.md

<a id="AC-FMT01"></a>
**AC-FMT01:** Formatters MUST run after every file write/edit performed by hosted tools in HTE mode. Formatters MUST NOT run in DAE mode.

<a id="AC-FMT02"></a>
**AC-FMT02:** Setting `config.formatters.enabled = false` MUST disable all formatters globally.

<a id="AC-FMT03"></a>
**AC-FMT03:** Per-formatter `disabled = true` MUST prevent that formatter from running, even if auto-detection passes.

<a id="AC-FMT04"></a>
**AC-FMT04:** The `$FILE` placeholder in command arrays MUST be replaced with the actual file path at execution time.

<a id="AC-FMT05"></a>
**AC-FMT05:** Formatter errors (non-zero exit) MUST NOT corrupt the file. The original tool output MUST be preserved.

<a id="AC-FMT06"></a>
**AC-FMT06:** Formatting changes MUST be recorded as `format.applied` events in the evidence ledger with diff metadata.

<a id="AC-FMT07"></a>
**AC-FMT07:** The GUI Formatters tab MUST display all formatters with enable/disable toggles, and support per-formatter command/environment/extension editing.

---

*Document created for planning only; no code changes.*

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Formatters_System.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### FS-001 - Formatters System (Canonical SSOT) Source-Preserving PlanUnit

```yaml
plan_unit_id: FS-001
unit_type: requirement
status: accepted
owner_doc: Plans/Formatters_System.md
canonical_text: Plans/Formatters_System.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/Formatters_System.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Formatters_System-S0024
preserved_exact_tokens:
- Formatters System (Canonical SSOT)
- 0. Scope and SSOT status
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
- SSOT references (DRY)
- 1. Definitions
- 1.1 Formatter
- 1.2 Formatter trigger event
- 'ContractRef: ContractName:Plans/Glossary.md, ContractName:Plans/Run_Modes.md#STRATEGY-HTE'
- 2. Lifecycle
- 2.1 When formatters run
- 'ContractRef: ContractName:Plans/Run_Modes.md#STRATEGY-HTE, ContractName:Plans/Run_Modes.md#STRATEGY-DAE'
- 2.2 Formatting changes in diffs and evidence
- 'ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord'
- 2.3 Error handling
- 'ContractRef: PolicyRule:Decision_Policy.md§2'
- 3. Built-in formatters
- 'ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md'
- 4. Configuration
- 4.1 Global disable
- 4.2 Per-formatter config
- 4.3 `$FILE` placeholder
- 4.4 Custom formatters
- 4.5 Config persistence
- 'ContractRef: ContractName:Plans/Plugins_System.md#PLUGIN-CONFIG'
negative_constraints:
- 'Rule: Formatters MUST NOT run during Delegated Agent Execution (DAE). In DAE mode, the provider CLI manages its own formatting; Puppet Master performs no post-hoc formatting.'
- DAE analytics and `/blocked` truth still require a post-hoc `tool-event` story in the provider/run-mode event owners; the formatter subsystem records only HTE formatter events and must not synthesize DAE tool-event history after the fact.
- '**AC-FMT01:** Formatters MUST run after every file write/edit performed by hosted tools in HTE mode. Formatters MUST NOT run in DAE mode.'
- '**AC-FMT05:** Formatter errors (non-zero exit) MUST NOT corrupt the file. The original tool output MUST be preserved.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- '# Formatters System (Canonical SSOT)'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '## 0. Scope and SSOT status'
- This document is the **single canonical source of truth** for the Puppet Master formatter system — how formatters run, when they trigger, how they are configured, and how formatting changes are tracked. All other plan documents MUST reference this document by anchor (e.g., `Plans/Formatters_System.m
- '### SSOT references (DRY)'
- '- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`'
- '- Canonical terms: `Plans/Glossary.md`'
- '- Formatter owner path: `Plans/Formatters_System.md` / `/Formatters_System.md`'
owner_hints:
- Plans/Formatters_System.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `b587099da1e4420b1a124d3e4e02a85237b94cc7c81cfc0851ba8eae49073310`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Formatters_System-S0001` through `Formatters_System-S0024` are preserved in place and mapped in `coverage_map.jsonl` to `FS-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.

