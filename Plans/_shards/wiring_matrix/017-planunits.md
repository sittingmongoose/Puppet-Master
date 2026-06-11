# Shard 017: PlanUnits

Source: `Plans/Wiring_Matrix.md`

Source lines: L573-L725

Source SHA256: `e1c5df49364c535832aae1f2e12e624e9dfdac1ca7a5118e1845daa4621fc750`

---

## PlanUnits

### WM-001 - Wiring Matrix (Canonical) Source-Preserving PlanUnit

```yaml
plan_unit_id: WM-001
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Plans/Wiring_Matrix.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Wiring_Matrix-S0043
preserved_exact_tokens:
- Wiring Matrix (Canonical)
- Canonical owner-section requirements
- Route/open compatibility-only fallback marking
- 0. Scope
- 'ContractRef: SchemaID:Wiring_Matrix.schema.json, ContractName:Plans/UI_Wiring_Rules.md, Gate:GATE-010'
- 1. Template
- 'ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#7-uicommand, Gate:GATE-010'
- 2. Example Entries
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, SchemaID:Wiring_Matrix.schema.json'
- 'ContractRef: UICommand:cmd.github.connect, UICommand:cmd.github.disconnect, UICommand:cmd.lsp.goto_definition, UICommand:cmd.lsp.find_references, UICommand:cmd.widget.add, UICommand:cmd.widget.remove, UICommand:cmd.graph.select_node, UICommand:cmd.graph.retry_node, UICommand:cmd.orchestrator.switch_'
- 3. JSON Example
- 'ContractRef: SchemaID:Wiring_Matrix.schema.json, ContractName:Plans/Contracts_V0.md#EventRecord'
- 4. Verification
- 4.1 Schema validation
- 4.2 Coverage
- 4.2.1 One element, one command enforcement
- 4.3 Handler resolution
- 4.4 Event tests
- 'ContractRef: Gate:GATE-010, Invariant:INV-011, Invariant:INV-012, SchemaID:Wiring_Matrix.schema.json'
- 4.5 Gate/schema limits and owner references
- References
- Scheduler/Remediation/Event Wiring Addendum (2026-03-08)
- 1. Scheduler analysis
- 2. Blocked/unblocked
negative_constraints:
- Terminal/editor wiring treats `Concepts/PMConcept.html` (`/PMConcept.html`) as GUI concept lineage only while preserving the command coverage implied by that concept. Wiring rows cover `/workgroup` activation, active-group `/subtab` focus, split-pane tree operations, editor-integrated multi-panel te
- '- `Plans/Wiring_Matrix.md` is the wiring SSOT for browser command producer/consumer rows; stale `Plans/newfeatures.md §15.18` and `/newfeatures.md` references are cross-reference cleanup lineage only, and the old `trust-tier`/`/trust-tier` matrix must not stand beside the current permission-layer `/'
- '- `auth_session` is not general-purpose browsing state, is not auto-restored, must not auto-close or auto-complete on presumed success, and normal selection, `/copy/paste`, `/share`, and capture interactions remain available unless the normal permission-layer blocks them.'
- '| Source Control review, diff, and conflict actions | `cmd.source_control.open_review`, `cmd.source_control.set_compare_target`, `cmd.source_control.toggle_generated_filter`, `cmd.source_control.open_conflict`, `cmd.source_control.open_merge_editor`, `cmd.source_control.resolve_conflict_side`, `cmd.'
compatibility_only_notes:
- '### Route/open compatibility-only fallback marking'
- '- If older naming exists, refer to it only as "legacy naming" (do not quote it).'
- Research-session and web-tool wiring entries must use the canonical command identities from `Plans/UI_Command_Catalog.md` and tool payload owners from `Plans/Tools.md`; stale local command aliases for research-session, web-tool, or terminal command identity are verification failures, not compatibili
- Route/open compatibility evidence references `Plans/Contracts_V0.md` / `/Contracts_V0.md` for `/open`, `tab_id`, `resume_url`, and `/prohibited` serialization classes. Runtime-artifact, chat, catalog, and file-open consumer references remain `Plans/Runtime_Artifacts_Panel.md` / `/Runtime_Artifacts_P
- '- canonical event: `scheduler.pass` (legacy alias: `run.scheduler_analysis`)'
- '- canonical events: `node.blocked`, `node.unblocked`, `wizard.blocked`, `wizard.unblocked` (legacy aliases: `run.node_blocked`, `run.node_unblocked`)'
- '- canonical events: `remediation.spawned`, `remediation.resolved` (legacy aliases: `run.remediation_started`, `run.remediation_completed`)'
- Terminology for thread worktree binding, accordion layout, `working_directory`, merge lock, and pre-merge test gate stays in `Plans/Glossary.md` (`/Glossary.md` compatibility references); Wiring Matrix records producer/consumer edges only.
- '### Compatibility-only fallback marking'
- '- Mark timestamp/run/thread fallback logic as compatibility-only inside route/open contracts'
stale_retired_dispositions:
- Research-session and web-tool wiring entries must use the canonical command identities from `Plans/UI_Command_Catalog.md` and tool payload owners from `Plans/Tools.md`; stale local command aliases for research-session, web-tool, or terminal command identity are verification failures, not compatibili
- 'Wiring_Matrix and UI_Wiring_Rules / `UI_Wiring_Rules.md` share the `/docs` and `/consumer` boundary for recovery wiring, but the matrix must still expose exact structural limits: `cmd.runtime` / `cmd.runtime.*` CTAs need dispatcher-level producer/consumer rows, stale-projection revalidation, `correl'
- '- `Plans/Wiring_Matrix.md` is the wiring SSOT for browser command producer/consumer rows; stale `Plans/newfeatures.md §15.18` and `/newfeatures.md` references are cross-reference cleanup lineage only, and the old `trust-tier`/`/trust-tier` matrix must not stand beside the current permission-layer `/'
- '- Expand Wiring Matrix and GATE-010 to verify route args, wrapper normalization, stale revalidation, admissibility, and correlation passthrough'
- '`GATE-010` completeness includes `GATE` coverage for route/subject-aware navigation, stale-projection revalidation, wrapper-to-canonical normalization, admissibility, and correlation passthrough. The clean rule for `/gates` is catalog-owned normalization metadata consumed by wiring/gates, not a seco'
owner_boundary_notes:
- '# Wiring Matrix (Canonical)'
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- PUPPET MASTER -- UI WIRING MATRIX SSOT
- '| `handler_location` | Canonical Rust module/function path (e.g., `handlers::github_auth::connect` or `crate::core::handlers::auth::connect`). |'
- Research-session and web-tool wiring entries must use the canonical command identities from `Plans/UI_Command_Catalog.md` and tool payload owners from `Plans/Tools.md`; stale local command aliases for research-session, web-tool, or terminal command identity are verification failures, not compatibili
- The canonical format is `(crate::)?module(::submodule)+::function`, with the final segment naming the callable handler symbol. When resolution fails, GATE-010 evidence MUST record the owning `ui_element_id`, `ui_command_id`, unresolved `handler_location`, and the candidate files/modules inspected so
- '### 4.5 Gate/schema limits and owner references'
- 'Wiring_Matrix and UI_Wiring_Rules / `UI_Wiring_Rules.md` share the `/docs` and `/consumer` boundary for recovery wiring, but the matrix must still expose exact structural limits: `cmd.runtime` / `cmd.runtime.*` CTAs need dispatcher-level producer/consumer rows, stale-projection revalidation, `correl'
- 'Extraction hazards are explicit gate failures, not real command IDs: regex-style scans must distinguish catalog IDs from filename-shaped `cmd.*.json`, generic `cmd.*` prose, command-family references, and `schema.json` evidence names. GUI side-panel targets such as Unraid and shell commands such as '
- Route-aware gate evidence is shared with `Plans/Wiring_Matrix.md` / `/Wiring_Matrix.md`, `Plans/Progression_Gates.md` / `/Progression_Gates.md`, and `evidence.schema.json`; `/gate/evidence` records must show `GATE`, `GATE-010`, `/route`, route-aware checks, first-class `OpenSubject`, `cmd.nav` / `cm
- 'Runtime owner references remain split by contract: Contracts_V0 / `Contracts_V0.md` names `scheduler.pass`, `attempt.started`, `attempt.completed`, `node.blocked`, `safe_point`, and `safe_point.*`; Prompt_Pipeline / `Prompt_Pipeline.md` owns immutable attempt-start handoff context; storage-plan / `s'
- Command/wiring ownership must keep `cmd.chat.run_user_command`, `/compact`, `/mode`, runtime-mode, slash-command, `IDs`, `GUI`, `{ mode }`, `/wiring`, command-owner, command-system, and reverse-coverage visible until the catalog, command-system, and matrix agree on canonical dispatch boundaries.
- '`Wiring_Matrix` / `Wiring_Matrix.md` remains a wiring-row owner, not a general runtime schema: `/recovery` producer/consumer prose may require widened evidence, but `Wiring_Matrix.schema.json` and `schema.json` still validate matrix shape until a separate producer/consumer matrix is adopted.'
- Route/open compatibility evidence references `Plans/Contracts_V0.md` / `/Contracts_V0.md` for `/open`, `tab_id`, `resume_url`, and `/prohibited` serialization classes. Runtime-artifact, chat, catalog, and file-open consumer references remain `Plans/Runtime_Artifacts_Panel.md` / `/Runtime_Artifacts_P
- '- `Plans/UI_Wiring_Rules.md` — UI wiring rules and dispatcher boundary'
- '- `Plans/UI_Command_Catalog.md` — Canonical command ID definitions'
- Add the following producer -> consumer paths to the wiring matrix.
- '- canonical event: `scheduler.pass` (legacy alias: `run.scheduler_analysis`)'
- '- canonical events: `node.blocked`, `node.unblocked`, `wizard.blocked`, `wizard.unblocked` (legacy aliases: `run.node_blocked`, `run.node_unblocked`)'
- '- canonical events: `safe_point.created`, `safe_point.restored`'
- '- canonical events: `remediation.spawned`, `remediation.resolved` (legacy aliases: `run.remediation_started`, `run.remediation_completed`)'
- '- canonical event: `plan.decomposition_degraded`'
owner_hints:
- Plans/Wiring_Matrix.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

