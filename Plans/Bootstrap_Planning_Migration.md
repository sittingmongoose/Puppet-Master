# Bootstrap Planning Migration

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. This document owns how the bootstrap ledger and PlanUnit standard are used now, migrated safely, and later sealed through governance.

## 0. Scope

This document owns the operational migration path from current bootstrap planning files to standardized canonical Plan docs and, later, native Puppet Master planning services. It covers AGENTS trigger rules, Codex phase usage, compact goal prompts, lossless Plan conversion sequencing, governance seal timing, and retired-experiment exclusions.

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md

## 1. Migration Principles

- Use the bootstrap ledger now for planning/source memory.
- Compile only when Jared explicitly asks to compile a ledger.
- Convert existing Plans losslessly in controlled batches, with a representative pilot first.
- Generate PlanUnit indexes and node-readiness reports only after the source Plan docs are stable enough to index.
- Refresh Spec Lock and generated governance artifacts only in an explicit governance seal phase.

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/Plan_Document_System.md

## 2. PlanUnits

### BPM-001 - AGENTS Trigger Surface

```yaml
plan_unit_id: BPM-001
unit_type: decision
status: accepted
owner_doc: Plans/Bootstrap_Planning_Migration.md
canonical_text: Root AGENTS.md defines trigger phrases and read/write rules so Codex knows when to start, continue, compile, standardize, index, report readiness, or seal through the PM Bootstrap Planning Ledger workflow.
gui_related: false
gui_classification_reason: Agent trigger and repository instruction rules are not GUI implementation work.
depends_on: [PLS-004, PLS-006]
unblocks: [BPM-002, BPM-003]
acceptance_criteria:
  - Trigger phrases include Start a PM ledger, Continue ledger <ledger_id>, Compile ledger <ledger_id> to Plans, Convert Plans to the standard format, Generate PlanUnit index, Generate node-readiness report, and Seal governance.
  - Root AGENTS.md keeps ledger source memory separate from canonical Plans prose.
validation_surfaces:
  - Manual AGENTS.md review.
  - 'Ledger workflow smoke test: python3 scripts/pm-plans-verify.py validate-bootstrap-ledgers includes active, compiled, sealed, and historical pldg-* ledgers by default.'
risk_class: agent_instruction_drift
reasoning_tier: standard
context_scope: repo_agents
implementation_surfaces: [AGENTS.md, Plans/bootstrap]
node_compile_hint: {mode: workflow_instruction, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0011
  - source_ref:chat:design-discussion
preserved_exact_tokens: ["AGENTS.md", "Start a PM ledger", "Continue ledger <ledger_id>", "Compile ledger <ledger_id> to Plans"]
negative_constraints: []
owner_hints: [Plans/Bootstrap_Planning_Migration.md]
```

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/Planning_Ledger_System.md

### BPM-002 - Codex Phase And Goal Prompt Model

```yaml
plan_unit_id: BPM-002
unit_type: constraint
status: accepted
owner_doc: Plans/Bootstrap_Planning_Migration.md
canonical_text: Bootstrap use in the Mac Codex app may use separate threads per phase. Conversational ledger creation usually runs in normal chat; compile, audit, migration, indexing, node-readiness, and governance seal phases use Goal Mode. Goal prompts stay compact, with reusable repo files, skills, and context carrying the detail.
gui_related: false
gui_classification_reason: Codex phase/thread usage and prompt budgeting are not GUI implementation work.
depends_on: [BPM-001]
unblocks: [BPM-003, BPM-004, BPM-005]
acceptance_criteria:
  - Conversational design/spec turns update the ledger without requiring Goal Mode.
  - Artifact transformation phases use Goal Mode.
  - Goal prompts stay less than 4,000 characters when possible by reading repo instructions and compact state.
validation_surfaces:
  - Goal prompt templates in Plans/bootstrap/Codex_Prompts.md.
  - Per-turn ledger state projections.
risk_class: workflow_continuity
reasoning_tier: standard
context_scope: codex_bootstrap
implementation_surfaces: [Plans/bootstrap/Codex_Prompts.md, Plans/ledgers/v2/*/state]
node_compile_hint: {mode: phase_guidance, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0013
  - pldg-20260610-001-ledger-plan-system:atom-0014
  - pldg-20260610-001-ledger-plan-system:dec-0006
  - source_ref:chat:design-discussion
preserved_exact_tokens: ["Mac Codex app", "Goal Mode", "separate threads", "conversational design/spec thread", "less than 4,000 characters", "/goal"]
negative_constraints: []
owner_hints: [Plans/Bootstrap_Planning_Migration.md]
```

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/bootstrap/Codex_Prompts.md

### BPM-003 - Initial Canonical Doc Compilation

```yaml
plan_unit_id: BPM-003
unit_type: requirement
status: accepted
owner_doc: Plans/Bootstrap_Planning_Migration.md
canonical_text: The bootstrap design compiles first into Planning_Ledger_System.md, Plan_Document_System.md, Plan_To_Node_Compilation.md, Bootstrap_Planning_Migration.md, and the Plans index registration. This creates owner docs before broader Plan conversion.
gui_related: false
gui_classification_reason: Canonical doc creation and index registration are not GUI implementation work.
depends_on: [BPM-001, BPM-002, PLS-001, PDS-001, PNC-001]
unblocks: [BPM-004, BPM-005]
acceptance_criteria:
  - The four owner docs exist under Plans/.
  - Plans/00-plans-index.md can route readers to the new owner docs.
  - The ledger remains source lineage, not canonical prose.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-shard-plans.py --check
risk_class: initial_compile
reasoning_tier: standard
context_scope: repo
implementation_surfaces: [Plans/Planning_Ledger_System.md, Plans/Plan_Document_System.md, Plans/Plan_To_Node_Compilation.md, Plans/Bootstrap_Planning_Migration.md, Plans/00-plans-index.md]
node_compile_hint: {mode: canonical_docs_only, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0018
  - source_ref:chat:design-discussion
preserved_exact_tokens: ["Plans/Bootstrap_Planning_Migration.md"]
negative_constraints: []
owner_hints: [Plans/Bootstrap_Planning_Migration.md]
```

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/00-plans-index.md

### BPM-004 - Controlled Lossless Plan Conversion

```yaml
plan_unit_id: BPM-004
unit_type: requirement
status: accepted
owner_doc: Plans/Bootstrap_Planning_Migration.md
canonical_text: Existing Plans convert losslessly through inventory, original hashes, heading/body span maps, coverage maps, ContractRef preservation, anchor or alias preservation, explicit dispositions, a representative pilot conversion, validators, and controlled batches.
gui_related: false
gui_classification_reason: Migration mechanics are not GUI implementation work.
depends_on: [PDS-002, PDS-004, PDS-005]
unblocks: [BPM-005]
acceptance_criteria:
  - The first representative pilot Plan doc is chosen after inventory; likely a substantial owner/consumer doc rather than a tiny addendum.
  - Broad rewrites do not begin before inventory and pilot validation.
  - Content deletion or semantic change without source coverage stops the migration.
validation_surfaces:
  - Original hash inventory.
  - Heading/body span inventory.
  - Coverage map.
  - Validators after pilot and each batch.
risk_class: content_loss
reasoning_tier: high
context_scope: all_plans
implementation_surfaces: [Plans/*.md, future migration inventory]
node_compile_hint: {mode: migration_batch_planning, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0020
  - pldg-20260610-001-ledger-plan-system:q-0002
  - source_ref:chat:design-discussion
  - source_ref:chat:lossless-conversion
preserved_exact_tokens: ["hash originals", "heading/body spans", "coverage map", "ContractRef", "anchors", "Which representative pilot Plan doc should be converted first?", "Codex should choose after inventory", "substantial owner/consumer doc", "tiny addendum"]
negative_constraints:
  - Do not start broad rewrites until inventory and pilot validation exist.
owner_hints: [Plans/Plan_Document_System.md, Plans/Bootstrap_Planning_Migration.md]
owner_adjudication:
  candidate_owners: [Plans/Plan_Document_System.md, Plans/Bootstrap_Planning_Migration.md]
  evidence: "Plan_Document_System owns the conversion proof; Bootstrap_Planning_Migration owns sequencing and pilot choice."
```

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/Plan_Document_System.md

### BPM-005 - Governance Seal Timing

```yaml
plan_unit_id: BPM-005
unit_type: constraint
status: accepted
owner_doc: Plans/Bootstrap_Planning_Migration.md
canonical_text: >-
  Spec Lock, generated shards, evidence bundles, plan graph, and governance locks are refreshed only
  during an explicit governance seal phase after canonical docs and generated indexes stop changing.
  A per-plan seal runs the plan-layer profile, which is the fifteen operations register_owners,
  index_generate, index_validate, readiness_generate, audit_status_generate, audit_status_validate,
  shards_generate, shards_check, shard_evidence_sync, spec_lock_refresh, final_index_validate,
  readiness_projection_check, spec_lock_verify, plan_graph_validate, and evidence_validate. The four
  repository-wide operations run_gates, audit_governance, migration_snapshot, and migration_validate
  are omitted from a per-plan seal and run at landing and on a nightly schedule instead. Every
  plan-layer seal record is labelled with seal_profile plan_layer, omitted_operations naming exactly
  those four, full_repository_qualified false, and repository_gates_status not_run_in_this_seal. A
  plan-layer seal is a production seal because it states what it did not run; it never claims
  repository qualification and never reports a result for an operation it did not run. The plan-layer
  profile is the exact subset of the full profile: every retained operation runs the same validator
  with the same arguments and the same scope it ran under the full profile, so no validator is
  weakened, reordered, or narrowed.
gui_related: false
gui_classification_reason: Governance seal timing is not GUI implementation work.
depends_on: [BPM-003, BPM-004, PDS-006, PNC-004]
unblocks: []
acceptance_criteria:
  - Ordinary ledger writing, plan drafting, plan conversion batches, and PlanUnit indexing do not update Spec Lock or generated governance artifacts.
  - The seal phase runs only after doc/index churn stops.
  - A per-plan governance seal runs exactly the fifteen plan-layer operations and omits run_gates, audit_governance, migration_snapshot, and migration_validate.
  - Every plan-layer seal record carries seal_profile plan_layer, the four omitted operation names, full_repository_qualified false, and repository_gates_status not_run_in_this_seal.
  - No plan-layer seal record, report, or certification claims repository qualification or reports an outcome for an operation it did not run.
  - Every operation the plan-layer profile retains runs the same validator, with the same arguments and scope, that it ran under the full profile.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-shard-plans.py --check
  - Explicit governance seal report.
risk_class: governance_artifact_staleness
reasoning_tier: standard
context_scope: repo_governance
implementation_surfaces: [Plans/Spec_Lock.json, Plans/_shards, Plans/.evidence, Plans/plan_graph.json, Plans/auto_decisions.jsonl, Plans/bootstrap/Bootstrap_Planning_Workflow.md, Plans/bootstrap/Bootstrap_Design_Brief.md, Plans/bootstrap/Codex_Prompts.md]
node_compile_hint: {mode: seal_phase_only, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0027
  - pldg-20260610-001-ledger-plan-system:atom-0031
  - pldg-20260610-001-ledger-plan-system:dec-0007
  - pldg-20260610-001-ledger-plan-system:dec-0010
  - source_ref:chat:design-discussion
  - source_ref:chat:user-node-readiness-correction
  - Plans/Decision_Log.md#DL-055
preserved_exact_tokens: ["Plans/Spec_Lock.json", "Plans/_shards/**", "Plans/.evidence/**", "Plans/plan_graph.json", "PlanUnit index", "node-readiness report", "Do not create WorkNodes", "plan_layer", "seal_profile", "omitted_operations", "full_repository_qualified", "repository_gates_status", "not_run_in_this_seal", "run_gates", "audit_governance", "migration_snapshot", "migration_validate"]
negative_constraints:
  - Do not update Spec Lock during ordinary ledger writing, plan drafting, or plan conversion batches.
  - Do not create WorkNodes or executable build tasks during PlanUnit indexing.
  - Do not read a plan-layer seal as a full-profile seal or as evidence that the repository-wide gates passed.
  - Do not weaken, reorder, or narrow the scope of any operation the plan-layer profile retains.
  - Do not omit the profile label, the omitted operation names, or the repository-gate status from a plan-layer seal record.
owner_hints: [Plans/Bootstrap_Planning_Migration.md, Plans/Plan_Document_System.md, Plans/Plan_To_Node_Compilation.md]
```

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/Plan_To_Node_Compilation.md

### BPM-006 - Retired Legacy Experiments Excluded

```yaml
plan_unit_id: BPM-006
unit_type: constraint
status: accepted
owner_doc: Plans/Bootstrap_Planning_Migration.md
canonical_text: Retired legacy transfer experiments are stale/retired source-lineage only. The replacement architecture is Goal + new ledger + validators + compact operating views. Exact retired labels remain in ledger/source evidence when needed, not in active architecture prose.
gui_related: false
gui_classification_reason: Retired process vocabulary and migration guardrails are not GUI implementation work.
depends_on: [BPM-001, PLS-001]
unblocks: []
acceptance_criteria:
  - Retired legacy experiment mechanics are not cited as the basis for the new architecture.
  - Historical terms may appear only as stale/retired lineage or negative constraints.
validation_surfaces:
  - Manual plan review.
  - Source-lineage coverage.
risk_class: stale_architecture_revival
reasoning_tier: standard
context_scope: repo
implementation_surfaces: [Plans/*.md, Plans/ledgers/v2]
node_compile_hint: {mode: stale_lineage_only, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0028
  - pldg-20260610-001-ledger-plan-system:corr-0001
  - source_ref:chat:user-retired-experiments-correction
preserved_exact_tokens: ["Goal + Ledger + Validators + Compact Operating Views", "Do not reference", "failed experiments", "completely replaced by goal and this new ledger"]
negative_constraints:
  - Do not reference retired legacy experiment mechanics as the basis of the new architecture.
stale_retired_terms:
  - retired legacy transfer experiments
owner_hints: [Plans/Planning_Ledger_System.md, Plans/Bootstrap_Planning_Migration.md]
```

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/Planning_Ledger_System.md


### BPM-007 - Phase Handoff And Thread Boundary Contract

```yaml
plan_unit_id: BPM-007
unit_type: requirement
status: accepted
owner_doc: Plans/Bootstrap_Planning_Migration.md
canonical_text: Bootstrap work may run across separate Codex threads. Each phase starts from the relevant ledger_id, compact state, and canonical owner docs; each phase ends by updating handoff/projection state, reporting validators, and leaving an exact next safe action. Conversational ledger creation is not required to use Goal Mode; transformation phases should use compact Goal prompts under the Codex objective limit.
gui_related: false
gui_classification_reason: Bootstrap phase orchestration is not GUI implementation work.
depends_on: [BPM-001, BPM-002, PLS-004, PLS-006]
unblocks: [BPM-003, BPM-004, BPM-005]
acceptance_criteria:
  - Start/continue/compile/conversion/index/seal prompts can be used independently in new threads.
  - Every phase produces a clear handoff and validator list before stopping.
  - Ordinary conversation is allowed to create and update ledgers without Goal Mode.
validation_surfaces:
  - Plans/bootstrap/Codex_Prompts.md
  - Plans/ledgers/v2/<ledger_id>/state/handoff.json
  - Phase validator reports.
risk_class: thread_restart_continuity
reasoning_tier: standard
context_scope: codex_bootstrap
implementation_surfaces: [Plans/bootstrap/Codex_Prompts.md, Plans/bootstrap/Bootstrap_Planning_Workflow.md, Plans/ledgers/v2/*/state]
node_compile_hint: {mode: phase_handoff_contract, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0040
  - source_ref:chat:implementation-readiness-review
preserved_exact_tokens: ["separate Codex threads", "ledger_id", "compact state", "Goal prompts", "less than 4,000 characters", "conversational ledger creation"]
negative_constraints:
  - Do not require Goal Mode for the feature-spec conversation phase unless Jared chooses it.
owner_hints: [Plans/Bootstrap_Planning_Migration.md, Plans/bootstrap/Codex_Prompts.md]
```

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/bootstrap/Codex_Prompts.md

## 3. Compilation Coverage

| Ledger atom | Disposition |
| --- | --- |
| atom-0011 | BPM-001 |
| atom-0013 | BPM-002 |
| atom-0014 | BPM-002 |
| atom-0018 | BPM-003 |
| atom-0020 | BPM-004; PDS-004 owns conversion proof. |
| atom-0027 | BPM-005 |
| atom-0028 | BPM-006 |
| atom-0031 | BPM-005; PDS-006 and PNC-001/PNC-004 own index/readiness boundary. |
| q-0002 | BPM-004 records the pilot-choice disposition and leaves the actual choice for the later inventory phase. |
| atom-0040 | BPM-007 |
| atom-0041 | BPM-006 |

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### BPM-008 - Mandatory Parallel Evidence And Prompt Hardening

```yaml
plan_unit_id: BPM-008
unit_type: requirement
status: accepted
owner_doc: Plans/Bootstrap_Planning_Migration.md
canonical_text: 'Resume Ledger continues to read compact state first, avoid full event and record scans unless referenced, use Collaborator behavior, update ledger after each substantive turn, and infer gui_related. The ledger-to-Plans Goal prompt must require many bounded read-only subagents in parallel when atom, owner, or document thresholds are exceeded, require assignment/result evidence, and block rather than silently use one broad agent; main agent remains sole writer. The ledger-local governance seal prompt validates this ledger ID when present, seals only after Plans and indexes stabilize, and preserves runtime-disabled readiness unless runtime contracts were explicitly completed. The deep-audit Goal uses many bounded read-only subagents in parallel for atom fidelity, reciprocal lineage, owner routing, changed-doc fidelity, ledger consistency, index/governance, forbidden artifacts, and validator mutability, with the main agent writing
  audit artifacts. The repair Goal builds a closure matrix only for repair_required=true findings, repairs or adjudicates those actionable rows, updates the semantic closure registry only for actionable closures, uses bounded read-only specialist subagents, and no-ops when no actionable rows exist. Passing validators alone are insufficient when repair_required=true rows remain unclosed. Ledger-to-Plans compilation writes or updates canonical Plans and allowed PlanUnit indexes only in their proper phases; it does not start Plan Compile, create WorkNodes, launch GoalRuns, modify implementation code, or start an Orchestrator build.'
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Bootstrap_Planning_Migration.md
- Plans/bootstrap/Codex_Prompts.md
- Plans/bootstrap/Bootstrap_Planning_Workflow.md
- Plans/Planning_Ledger_System.md
- Plans/Plan_To_Node_Compilation.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0162
- pldg-20260618-001-prd-planning-wizard:atom-0163
- pldg-20260618-001-prd-planning-wizard:atom-0165
- pldg-20260618-001-prd-planning-wizard:atom-0166
- pldg-20260618-001-prd-planning-wizard:atom-0167
- pldg-20260618-001-prd-planning-wizard:atom-0168
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/09-bootstrap-prompts-and-transfer.md#SRC-PROMPTS
source_atom_ids:
- atom-0162
- atom-0163
- atom-0165
- atom-0166
- atom-0167
- atom-0168
decision_refs:
- dec-0030
correction_refs: []
preserved_exact_tokens:
- Resume Ledger
- compact state first
- gui_related
- HARD PARALLEL GATE
- main agent is the only writer
- pldg-20260618-001-prd-planning-wizard
- governance seal
- Deep Audit
- many bounded read-only subagents in parallel
- repair_closure_matrix.jsonl
- semantic closure registry
- repair_required
- finding_level
- ledger-to-Plans
- not runtime
negative_constraints:
- Do not reference or invoke superseded experimental planning-pipeline machinery.
- Do not confuse the bootstrap compile Goal with the finished-product Approve And Build runtime.
- Do not treat repair_required=false warnings, previously_closed rows, or audit-artifact wording as repair work.
owner_hints:
- Plans/bootstrap/Codex_Prompts.md
- Plans/bootstrap/Bootstrap_Planning_Workflow.md
- Plans/Planning_Ledger_System.md
- Plans/Plan_To_Node_Compilation.md
```

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime bootstrap-migration rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-dfcc395f84654bcabdfbe6aa`: this document is migration/source-lineage for the early AGENTS.md/Codex-thread workflow. Current live behavior is owned by `Plans/Planning_Wizard.md`, `Plans/Planning_Ledger_System.md`, and the PM Bootstrap Planning Ledger v2 state files. Any contradiction resolves in favor of those current owner docs.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 343` (explicitly_deferred; source line 1158; `sfk-dfcc395f84654bcabdfbe6aa`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [HIGH] whole doc vs Planning_Wizard.md's later ledger addenda: describes an AGENTS.md/Codex-thread workflow that appears superseded by more detailed, differently-worded later addenda not marked stale/retired.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->

## Plan-Layer Seal Profile And Landing Gates Addendum - 2026-09-17

This addendum records the seal profile a per-plan governance seal runs and where the repository-wide
gates run instead. It changes no validator, creates no WorkNodes, NodeSeeds, executable queues, final
node manifests, implementation files, production build tasks, or generated governance artifacts, and
it seals nothing by itself.

A per-plan governance seal runs the plan-layer profile: `register_owners`, `index_generate`,
`index_validate`, `readiness_generate`, `audit_status_generate`, `audit_status_validate`,
`shards_generate`, `shards_check`, `shard_evidence_sync`, `spec_lock_refresh`,
`final_index_validate`, `readiness_projection_check`, `spec_lock_verify`, `plan_graph_validate`, and
`evidence_validate`. Those fifteen operations act on the plan being sealed and on the artifacts
derived from it, and they take about two to three minutes between them.

Four operations are omitted: `run_gates`, `audit_governance`, `migration_snapshot`, and
`migration_validate`. They read the whole corpus rather than the plan, they were measured taking 80
to 85 percent of a seal's script time -- about 22 of 27 minutes on the clean run of 2026-09-10 -- and
a change to one plan cannot be what they are checking. The plan-layer profile is the exact subset of
the full profile: every operation it retains runs the same validator with the same arguments and the
same scope, so the reduction removes work rather than weakening it.

A plan-layer seal is a production seal because its record says what it did not run. Every such record
carries `seal_profile: plan_layer`, `omitted_operations` naming exactly those four,
`full_repository_qualified: false`, and `repository_gates_status: not_run_in_this_seal`. A plan-layer
seal therefore never claims repository qualification, and nothing may read it as a full-profile seal
or as evidence that the repository-wide gates passed.

Three of the four omitted operations, `run_gates`, `audit_governance` and `migration_validate`, run
when a branch lands on `main` and on a nightly schedule. At landing they run in the shared checkout
after the fast-forward and the shard check and before `main` is pushed, and they cost about ten
minutes there. The lander runs them through `scripts/pm-landing-check.py`, which reports only the
failures that are new since the recorded baseline `reports/landing-checks/baseline.json` and the
failures that name a path the branch touches; the three checks produce tens of thousands of
pre-existing failures that name no landed file, and reading that list at every landing told the
lander nothing. The baseline is refreshed from a full run against `main` on the nightly schedule,
never per landing. `migration_snapshot`
creates a new tracked run directory, so it never runs in the shared checkout at landing; it runs on
the nightly schedule in a worktree by the designated Plans agent. They fail on this repository today for reasons that belong to no single plan,
which is why the landing rule turns on whose files a failure names rather than on the gate passing
outright. A landing is refused when a failure names a file the landing branch touches, and that
failure is fixed on the branch; when every failure names files the branch does not touch, the landing
proceeds and the failures are reported, which is the rule the shard check already follows.
Stale-hash failures for documents the branch itself edited, in Spec Lock, owner or artifact evidence
hashes, the readiness report or the plan-migration inventory, are the expected consequence of editing
canon before the designated Plans agent's next reseal; they never stop a landing and are reported with
a reseal request. The
nightly run covers the repository whether or not anything landed, so repository qualification never
depends on a branch having been pushed. `AGENTS.md` and `.claude/CLAUDE.md` carry this step in their
landing procedure.

### BPM-009 - Repository-Wide Gates Run At Landing And Nightly

```yaml
plan_unit_id: BPM-009
unit_type: constraint
status: accepted
owner_doc: Plans/Bootstrap_Planning_Migration.md
canonical_text: >-
  The repository-wide operations run_gates, audit_governance, and migration_validate run when a
  branch lands on main and on a nightly schedule, not inside a per-plan governance seal; the
  migration_snapshot creates a new tracked run directory, so it runs only on the nightly schedule, in
  a worktree, by the designated Plans agent, never in the shared checkout at landing. At landing the
  three checks run in the shared checkout after the fast-forward and the shard check, before main is
  pushed, and cost about ten minutes there. The lander runs them through
  scripts/pm-landing-check.py, which reports only failures that are new since the recorded baseline
  reports/landing-checks/baseline.json or that name a path the branch touches, because the three
  produce tens of thousands of pre-existing failures that name no landed file. The baseline is
  recorded from a full run against main in a full checkout, committed with the commit it was taken
  at, and refreshed on the nightly schedule only, never per landing. A landing is refused when a
  repository-wide failure
  names a file the landing branch touches, and that failure is fixed on the branch; when every
  failure names files the branch does not touch, the landing proceeds and the failures are reported,
  which is the rule the shard check already follows. Stale-hash failures for documents the branch
  itself edited, in Spec Lock, owner or artifact evidence hashes, the readiness report or the
  plan-migration inventory, are the expected consequence of editing canon before the designated
  Plans agent's next reseal; they never stop a landing and are reported with a reseal request. The
  nightly run covers the repository whether or
  not anything landed, so repository qualification never depends on a branch having been pushed.
  AGENTS.md and .claude/CLAUDE.md carry this step in their landing procedure with the measured cost
  stated.
gui_related: false
gui_classification_reason: Gate placement in the landing and nightly repository procedures is governance timing, not GUI behavior.
split_recommended: false
depends_on: [BPM-005]
unblocks: []
acceptance_criteria:
  - The landing procedure in AGENTS.md and .claude/CLAUDE.md names run-gates, audit-governance, and the migration validate as one step after the fast-forward and the shard check and before main is pushed, states the measured cost of about ten minutes, and keeps the migration snapshot out of the shared checkout.
  - That step is run through scripts/pm-landing-check.py, which reports only failures that are new since reports/landing-checks/baseline.json or that name a path from git diff --name-only origin/main..HEAD, and which runs the same three checks with the same arguments and scope.
  - The baseline is recorded from a full run against main in a full checkout, is committed with the commit it was taken at, and is refreshed on the nightly schedule only, never per landing.
  - A repository-wide failure that names a file the landing branch touches stops the landing and is fixed on the branch.
  - A repository-wide failure that names only files the landing branch does not touch does not stop the landing; main is pushed and the failures are reported, exactly as the shard-check rule reads.
  - A stale-hash failure for a document the landing branch itself edited (Spec Lock, owner or artifact evidence hashes, the readiness report, the plan-migration inventory) is the expected consequence of editing canon before the next designated reseal; it never stops the landing and is reported with a reseal request.
  - All four operations, including the migration snapshot taken in a worktree by the designated Plans agent, run on a nightly schedule against main, independently of whether anything landed.
  - No per-plan seal is required to run them, and no seal record claims their outcome.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-landing-check.py --base origin/main
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py audit-governance
  - "python3 scripts/pm-plan-migration.py validate --run-dir <the run named in Plans/.plan_migration/current_run.json>"
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - Manual AGENTS.md and .claude/CLAUDE.md landing-procedure review.
risk_class: repository_gate_placement_drift
reasoning_tier: standard
context_scope: repo_governance
implementation_surfaces:
  - AGENTS.md
  - .claude/CLAUDE.md
  - Plans/Bootstrap_Planning_Migration.md
  - scripts/pm-landing-check.py
  - reports/landing-checks/baseline.json
node_compile_hint:
  mode: landing_gate_placement
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-055
  - Plans/Bootstrap_Planning_Migration.md#BPM-005
preserved_exact_tokens:
  - run_gates
  - audit_governance
  - migration_snapshot
  - migration_validate
  - scripts/pm-landing-check.py
  - reports/landing-checks/baseline.json
  - "git merge --ff-only"
  - AGENTS.md
  - .claude/CLAUDE.md
negative_constraints:
  - Do not run the four repository-wide operations inside a per-plan seal in order to satisfy this rule.
  - Do not land a branch whose own files fail a repository-wide gate.
  - Do not repair or commit another thread's files to make a repository-wide gate pass at landing.
  - Do not treat the nightly run as a substitute for the landing run, or the landing run as a substitute for the nightly one.
  - Do not record a baseline from a checkout that is missing any input the three checks read, and do not refresh the baseline to make a landing pass.
owner_hints:
  - Plans/Bootstrap_Planning_Migration.md
  - Plans/bootstrap/Bootstrap_Planning_Workflow.md
```

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/Planning_Ledger_System.md
