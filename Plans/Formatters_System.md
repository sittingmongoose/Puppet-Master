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

`Plans/Formatters_System.md` remains the owner doc for formatter scope, definitions, HTE lifecycle, formatter evidence, built-in and custom formatter configuration, formatter Settings UI requirements, and OpenCode formatter deltas. Cross-doc consumers must continue to use the anchors and ContractRefs in the source body instead of restating formatter behavior.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### FS-002 - Formatter Scope, SSOT, And Support Boundaries

```yaml
plan_unit_id: FS-002
unit_type: requirement
status: accepted
owner_doc: Plans/Formatters_System.md
canonical_text: Formatters_System.md is the canonical formatter SSOT for formatter execution, trigger timing, configuration, evidence tracking, format.* event registration, HTE formatter delivery, and formatter /schema, while Plugins_System, Skills_System, and FileSafe retain their own subprocess, skill-delivery, prompt-hook, and file-safety boundaries.
gui_related: false
gui_classification_reason: This unit defines formatter ownership and cross-document boundaries, not GUI presentation; SSOT references to GUI docs are routing references only.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad FS-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: formatter_drift
reasoning_tier: standard
context_scope: formatters_standardization
implementation_surfaces:
- Plans/Formatters_System.md
node_compile_hint:
  mode: formatter_scope_ssot_support_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0003
preserved_exact_tokens:
- Formatters System (Canonical SSOT)
- single canonical source of truth
- Plans/Formatters_System.md#FORMATTER-CONFIG
- format.*
- HTE formatter delivery
- formatter /schema
- mutation_capable
- /param
- /FileSafe
negative_constraints:
- All other plan documents MUST reference this document by anchor rather than restating formatter definitions or lifecycle rules.
- Under-specified gaps must be visible in the owning SSOTs before implementation treats them as safe defaults.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Formatters_System.md owns formatter lifecycle, config, evidence, event registration, HTE delivery, and formatter /schema.
- Plans/Plugins_System.md owns mutation_capable, in-process execution, subprocess-sandbox expectations, and prompt /param hooks.
- Plans/Skills_System.md owns DAE /bundling, runtime skills /listing, and HTE reachability.
- Plans/FileSafe.md owns file-safety boundaries when formatter subprocesses touch project files.
owner_hints:
- Plans/Formatters_System.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
```

### FS-003 - Formatter Definitions And Trigger Event

```yaml
plan_unit_id: FS-003
unit_type: requirement
status: accepted
owner_doc: Plans/Formatters_System.md
canonical_text: A Formatter is a stateless external command that transforms a file in place after hosted file-write/edit tools succeed, and the formatter trigger event is the File.Edited-equivalent internal event carrying file path and extension for write, edit, patch, and multiedit operations.
gui_related: false
gui_classification_reason: This unit defines runtime formatter and event semantics, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad FS-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: formatter_drift
reasoning_tier: standard
context_scope: formatters_standardization
implementation_surfaces:
- Plans/Formatters_System.md
node_compile_hint:
  mode: formatter_definitions_and_trigger_event
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0004
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0006
preserved_exact_tokens:
- DEF-FORMATTER
- DEF-FORMATTER-EVENT
- Formatter
- File.Edited
- write
- edit
- patch
- multiedit
- file path and extension
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Formatters_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Glossary.md, ContractName:Plans/Run_Modes.md#STRATEGY-HTE'
```

### FS-004 - HTE Formatter Lifecycle And DAE Exclusion

```yaml
plan_unit_id: FS-004
unit_type: requirement
status: accepted
owner_doc: Plans/Formatters_System.md
canonical_text: In HTE mode, formatters run after every hosted-tool file write/edit by resolving matching enabled formatters from file extension and invoking them sequentially in registration order; formatters never run during DAE, where provider CLIs own their formatting behavior.
gui_related: false
gui_classification_reason: This unit constrains runtime lifecycle and execution-strategy boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad FS-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: formatter_drift
reasoning_tier: standard
context_scope: formatters_standardization
implementation_surfaces:
- Plans/Formatters_System.md
node_compile_hint:
  mode: hte_formatter_lifecycle_dae_exclusion
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0007
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0008
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0024
preserved_exact_tokens:
- LIFECYCLE
- AC-FMT01
- HTE strategy only
- File.Edited
- sequentially
- registration order
- DAE
- post-hoc formatting
- tool-event
negative_constraints:
- Formatters MUST NOT run during Delegated Agent Execution (DAE).
- Puppet Master performs no post-hoc formatting in DAE mode.
- The formatter subsystem records only HTE formatter events and must not synthesize DAE tool-event history after the fact.
- 'AC-FMT01: Formatters MUST run after every file write/edit performed by hosted tools in HTE mode and MUST NOT run in DAE mode.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Formatters_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md#STRATEGY-HTE, ContractName:Plans/Run_Modes.md#STRATEGY-DAE'
- 'ContractRef: ContractName:Plans/Formatters_System.md, ContractName:Plans/Progression_Gates.md'
```

### FS-005 - Formatter Evidence Events

```yaml
plan_unit_id: FS-005
unit_type: requirement
status: accepted
owner_doc: Plans/Formatters_System.md
canonical_text: When formatter output differs beyond whitespace-only changes, Puppet Master records the tool-output-to-formatted-output diff in the evidence ledger as a format.applied event with formatter_id, file_path, diff_bytes, and timestamp metadata.
gui_related: false
gui_classification_reason: This unit defines evidence event recording, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad FS-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: formatter_drift
reasoning_tier: standard
context_scope: formatters_standardization
implementation_surfaces:
- Plans/Formatters_System.md
node_compile_hint:
  mode: formatter_evidence_events
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0009
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0024
preserved_exact_tokens:
- format.applied
- formatter_id
- file_path
- diff_bytes
- timestamp
- evidence ledger
- AC-FMT06
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Formatters_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord'
- 'ContractRef: ContractName:Plans/Formatters_System.md, ContractName:Plans/Progression_Gates.md'
```

### FS-006 - Formatter Error Preservation

```yaml
plan_unit_id: FS-006
unit_type: requirement
status: accepted
owner_doc: Plans/Formatters_System.md
canonical_text: Formatter non-zero exits preserve the original hosted-tool output, log a format.error event with formatter ID, file path, exit code, and stderr, and allow the pipeline to continue without corrupting the file.
gui_related: false
gui_classification_reason: This unit defines error handling and file preservation behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad FS-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: formatter_drift
reasoning_tier: standard
context_scope: formatters_standardization
implementation_surfaces:
- Plans/Formatters_System.md
node_compile_hint:
  mode: formatter_error_preservation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0010
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0024
preserved_exact_tokens:
- format.error
- non-zero status
- original tool output
- exit code
- stderr
- pipeline continues
- AC-FMT05
negative_constraints:
- Formatter errors MUST NOT corrupt the file.
- The original tool output MUST be preserved.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Formatters_System.md
preserved_contractrefs:
- 'ContractRef: PolicyRule:Decision_Policy.md§2'
- 'ContractRef: ContractName:Plans/Formatters_System.md, ContractName:Plans/Progression_Gates.md'
```

### FS-007 - Built-In Formatter Detection Catalog

```yaml
plan_unit_id: FS-007
unit_type: requirement
status: accepted
owner_doc: Plans/Formatters_System.md
canonical_text: Built-in formatters are enabled by default when their per-session or per-project-switch detection checks pass, with the canonical catalog preserving every formatter name, extension set, and detection rule from prettier through cljfmt.
gui_related: false
gui_classification_reason: This unit defines formatter catalog and detection behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad FS-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: formatter_drift
reasoning_tier: standard
context_scope: formatters_standardization
implementation_surfaces:
- Plans/Formatters_System.md
node_compile_hint:
  mode: builtin_formatter_detection_catalog
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0011
preserved_exact_tokens:
- BUILT-IN-FORMATTERS
- auto-detection
- enabled by default
- prettier
- biome
- rustfmt
- gofmt
- ruff
- shfmt
- clang-format
- dart
- mix
- zig
- ktlint
- rubocop
- standardrb
- pint
- ocamlformat
- nixfmt
- ormolu
- terraform
- latexindent
- gleam
- cljfmt
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Formatters_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md'
```

### FS-008 - Formatter Config Switch, Schema, And File Placeholder

```yaml
plan_unit_id: FS-008
unit_type: requirement
status: accepted
owner_doc: Plans/Formatters_System.md
canonical_text: Formatter configuration supports a global config.formatters.enabled kill switch, per-formatter disabled/command/environment/extensions fields, empty-command skip behavior, and $FILE replacement or final-argument append semantics for command execution.
gui_related: false
gui_classification_reason: This unit defines configuration and command argument semantics, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad FS-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: formatter_drift
reasoning_tier: standard
context_scope: formatters_standardization
implementation_surfaces:
- Plans/Formatters_System.md
node_compile_hint:
  mode: formatter_config_schema_and_file_placeholder
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0013
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0014
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0015
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0024
preserved_exact_tokens:
- FORMATTER-CONFIG
- AC-FMT02
- AC-FMT03
- AC-FMT04
- config.formatters.enabled = false
- disabled
- command
- environment
- extensions
- $FILE
- empty (`[]`)
- absolute path
negative_constraints:
- If config.formatters.enabled = false, no formatters run regardless of per-formatter config.
- Per-formatter disabled = true prevents that formatter from running even if auto-detection passes.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Formatters_System.md
preserved_contractrefs:
- 'ContractRef: PolicyRule:Decision_Policy.md§2'
- 'ContractRef: ContractName:Plans/Formatters_System.md, ContractName:Plans/Progression_Gates.md'
```

### FS-009 - Custom Formatter Definitions

```yaml
plan_unit_id: FS-009
unit_type: requirement
status: accepted
owner_doc: Plans/Formatters_System.md
canonical_text: Users can define custom formatters with command and extensions; custom formatters have no auto-detection and their enabled check is always true unless disabled = true.
gui_related: false
gui_classification_reason: This unit defines custom formatter config behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad FS-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: formatter_drift
reasoning_tier: standard
context_scope: formatters_standardization
implementation_surfaces:
- Plans/Formatters_System.md
node_compile_hint:
  mode: custom_formatter_definitions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0016
preserved_exact_tokens:
- Custom formatters
- command
- extensions
- no auto-detection
- enabled()
- disabled = true
- '[formatter.my-custom-formatter]'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Formatters_System.md
```

### FS-010 - Formatter Config Persistence And Scope Overrides

```yaml
plan_unit_id: FS-010
unit_type: requirement
status: accepted
owner_doc: Plans/Formatters_System.md
canonical_text: Formatter config persists under the global ~/.config/puppet-master/config.toml and project .puppet-master/config.toml [formatter] sections, with project per-formatter config overriding global config.
gui_related: false
gui_classification_reason: This unit defines config storage and override behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad FS-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: formatter_drift
reasoning_tier: standard
context_scope: formatters_standardization
implementation_surfaces:
- Plans/Formatters_System.md
node_compile_hint:
  mode: formatter_config_persistence_scope_overrides
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0017
preserved_exact_tokens:
- ~/.config/puppet-master/config.toml
- .puppet-master/config.toml
- '[formatter]'
- Project
- Global
- overrides global per-formatter
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Formatters_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plugins_System.md#PLUGIN-CONFIG'
```

### FS-011 - Formatters Settings Tab Controls

```yaml
plan_unit_id: FS-011
unit_type: requirement
status: accepted
owner_doc: Plans/Formatters_System.md
canonical_text: The unified Settings page exposes a dedicated Formatters tab with a global enable toggle, built-in and custom formatter table, detected/not found/disabled/custom status, expandable command/environment/extensions editors, reset-to-default controls, custom formatter add/remove workflows, validation, and Global/Project scope selection.
gui_related: true
gui_classification_reason: This unit defines a user-visible Settings tab, controls, form fields, table columns, and validation behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad FS-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: formatter_drift
reasoning_tier: standard
context_scope: formatters_standardization
implementation_surfaces:
- Plans/Formatters_System.md
node_compile_hint:
  mode: formatters_settings_tab_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0018
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0019
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0024
preserved_exact_tokens:
- GUI-FORMATTERS
- AC-FMT07
- Settings page
- Formatters tab
- Enable formatters
- Name, Extensions, Status
- detected/not found/disabled/custom
- Command
- Environment
- Reset to defaults
- Add formatter
- Remove
- Global and Project config
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Formatters_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md'
- 'ContractRef: ContractName:Plans/Formatters_System.md, ContractName:Plans/Progression_Gates.md'
```

### FS-012 - Formatter Interaction Mode Copy

```yaml
plan_unit_id: FS-012
unit_type: requirement
status: accepted
owner_doc: Plans/Formatters_System.md
canonical_text: 'Formatter UI follows the app-level Expert/ELI5 interaction mode: ELI5 shows the formatter list with enable/disable toggles only, while Expert exposes command, environment, and extension editing and uses tooltip.formatters.* copy keys.'
gui_related: true
gui_classification_reason: This unit defines visible UI copy and mode-dependent control exposure.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad FS-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: formatter_drift
reasoning_tier: standard
context_scope: formatters_standardization
implementation_surfaces:
- Plans/Formatters_System.md
node_compile_hint:
  mode: formatter_interaction_mode_copy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0020
preserved_exact_tokens:
- ELI5
- Expert
- Interaction Mode
- tooltip.formatters.*
- enable/disable toggles only
- Command, environment, and extension editing are hidden
- Full view with all sections visible
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Formatters_System.md
```

### FS-013 - OpenCode Formatter Baseline

```yaml
plan_unit_id: FS-013
unit_type: requirement
status: accepted
owner_doc: Plans/Formatters_System.md
canonical_text: 'The OpenCode formatter baseline records automatic File.Event.Edited handling, binary/config-file detection, formatter: false global disable, per-formatter { disabled, command, environment, extensions } config, $FILE placeholder behavior, and custom formatter config.'
gui_related: false
gui_classification_reason: This unit records external baseline behavior for comparison, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad FS-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: formatter_drift
reasoning_tier: standard
context_scope: formatters_standardization
implementation_surfaces:
- Plans/Formatters_System.md
node_compile_hint:
  mode: opencode_formatter_baseline
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0021
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0022
preserved_exact_tokens:
- BASELINE-DELTAS
- OpenCode
- File.Event.Edited
- binary checks
- config file presence
- 'formatter: false'
- '{ disabled, command, environment, extensions }'
- $FILE
- Custom formatters
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Formatters_System.md
```

### FS-014 - Puppet Master Runtime And Evidence Deltas

```yaml
plan_unit_id: FS-014
unit_type: requirement
status: accepted
owner_doc: Plans/Formatters_System.md
canonical_text: Puppet Master differs from OpenCode by implementing formatter triggers through Rust internal event dispatch after hosted tool writes/edits, resolving binaries with the which crate or path_utils::resolve_executable, recording formatter diff evidence, and enforcing HTE-only formatter execution.
gui_related: false
gui_classification_reason: This unit defines runtime, detection, evidence, and execution-strategy deltas, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad FS-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: formatter_drift
reasoning_tier: standard
context_scope: formatters_standardization
implementation_surfaces:
- Plans/Formatters_System.md
node_compile_hint:
  mode: puppet_master_formatter_runtime_evidence_deltas
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0023
preserved_exact_tokens:
- Event-driven trigger in Rust
- Formatter auto-detection in Rust
- which crate
- path_utils::resolve_executable
- Evidence tracking
- format.applied
- HTE-only enforcement
- provider CLI
negative_constraints:
- DAE delegates formatting to the provider CLI.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime formatter event dispatch and evidence deltas remain owned by Plans/Formatters_System.md; provider execution-strategy behavior remains cross-referenced to Run_Modes.
owner_hints:
- Plans/Formatters_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md'
```

### FS-015 - Puppet Master Formatter GUI Delta

```yaml
plan_unit_id: FS-015
unit_type: requirement
status: accepted
owner_doc: Plans/Formatters_System.md
canonical_text: Puppet Master adds a GUI delta absent from OpenCode by providing a dedicated Formatters settings tab with per-formatter config editing.
gui_related: true
gui_classification_reason: This unit defines the user-visible GUI delta for formatter configuration.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad FS-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: formatter_drift
reasoning_tier: standard
context_scope: formatters_standardization
implementation_surfaces:
- Plans/Formatters_System.md
node_compile_hint:
  mode: puppet_master_formatter_gui_delta
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0023
preserved_exact_tokens:
- GUI settings
- OpenCode has no GUI
- dedicated Formatters settings tab
- per-formatter config editing
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Formatters_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md'
```

### FS-001 - Formatters System Source-Preserving Bridge Retired

```yaml
plan_unit_id: FS-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Formatters_System.md
canonical_text: The former Formatters_System doc-level source-preserving bridge is retired after Phase 2B atomized Formatters_System-S0001 through Formatters_System-S0024 into FS-002 through FS-015 and structurally dispositioned Formatters_System-S0025, S0026, and S0028. FS-001 remains only as migration lineage for Formatters_System-S0027 and must not re-own atomized source coverage or use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: This retired bridge records migration lineage only; product GUI coverage is owned by fine-grained FS-011, FS-012, and FS-015.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- FS-001 no longer uses source_preserving_planunit compile mode.
- FS-002 through FS-015 own product coverage for Formatters_System-S0001 through Formatters_System-S0024.
- Formatters_System-S0025, S0026, and S0028 are structural owner-map, PlanUnits-heading, and Migration Coverage dispositions.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/Formatters_System.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Formatters_System-S0027
preserved_exact_tokens:
- FS-001
- source_preserving_planunit
- source_preserving_bridge_retired
- Formatters_System-S0001
- Formatters_System-S0028
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- FS-001 must not re-own Formatters_System-S0001 through Formatters_System-S0024 product coverage.
- FS-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this retired bridge.
compatibility_only_notes:
- FS-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The broad Formatters_System source-preserving bridge was retired in Phase 2B batch 075.
owner_boundary_notes:
- FS-002 through FS-015 own Formatters_System product coverage for Formatters_System-S0001 through Formatters_System-S0024.
- Formatters_System-S0025, S0026, and S0028 are structural/coverage dispositions, not product coverage owned by FS-001.
owner_hints:
- Plans/Formatters_System.md
```

## Migration Coverage

Original hash: `841153deb0b40a91ed918a8627949361b605326365dffbe4a2a5b2eb5e09c592`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 075 atomized `Formatters_System-S0001` through `Formatters_System-S0024` into `FS-002` through `FS-015`, with mixed GUI/runtime spans split where safe. `Formatters_System-S0025`, `Formatters_System-S0026`, and `Formatters_System-S0028` are structural owner-map, PlanUnits-heading, and Migration Coverage dispositions. `Formatters_System-S0027` maps to retired bridge lineage `FS-001`; `FS-001` no longer uses source-preserving compile mode, and `Plans/Formatters_System.md` has no remaining source-preserving product coverage. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 364` (repaired; source line 1221; `sfk-52b912e858e3f723a8838777`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L57: "invoked sequentially in registration order" "registration order" itself is never defined (config order? alphabetical? built-in-then-custom?).

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
