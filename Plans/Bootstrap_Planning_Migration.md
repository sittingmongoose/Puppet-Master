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
  - Ledger workflow smoke test.
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
canonical_text: Spec Lock, generated shards, evidence bundles, plan graph, and governance locks are refreshed only during an explicit governance seal phase after canonical docs and generated indexes stop changing.
gui_related: false
gui_classification_reason: Governance seal timing is not GUI implementation work.
depends_on: [BPM-003, BPM-004, PDS-006, PNC-004]
unblocks: []
acceptance_criteria:
  - Ordinary ledger writing, plan drafting, plan conversion batches, and PlanUnit indexing do not update Spec Lock or generated governance artifacts.
  - The seal phase runs only after doc/index churn stops.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-shard-plans.py --check
  - Explicit governance seal report.
risk_class: governance_artifact_staleness
reasoning_tier: standard
context_scope: repo_governance
implementation_surfaces: [Plans/Spec_Lock.json, Plans/_shards, Plans/.evidence, Plans/plan_graph.json, Plans/auto_decisions.jsonl]
node_compile_hint: {mode: seal_phase_only, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0027
  - pldg-20260610-001-ledger-plan-system:atom-0031
  - pldg-20260610-001-ledger-plan-system:dec-0007
  - pldg-20260610-001-ledger-plan-system:dec-0010
  - source_ref:chat:design-discussion
  - source_ref:chat:user-node-readiness-correction
preserved_exact_tokens: ["Plans/Spec_Lock.json", "Plans/_shards/**", "Plans/.evidence/**", "Plans/plan_graph.json", "PlanUnit index", "node-readiness report", "Do not create WorkNodes"]
negative_constraints:
  - Do not update Spec Lock during ordinary ledger writing, plan drafting, or plan conversion batches.
  - Do not create WorkNodes or executable build tasks during PlanUnit indexing.
owner_hints: [Plans/Bootstrap_Planning_Migration.md, Plans/Plan_Document_System.md, Plans/Plan_To_Node_Compilation.md]
```

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/Plan_To_Node_Compilation.md

### BPM-006 - Retired Experiments Excluded

```yaml
plan_unit_id: BPM-006
unit_type: constraint
status: accepted
owner_doc: Plans/Bootstrap_Planning_Migration.md
canonical_text: Retired prompt-packet, tranche, and subagent conversion experiments are stale/retired source-lineage only. The replacement architecture is Goal + new ledger + validators + compact operating views.
gui_related: false
gui_classification_reason: Retired process vocabulary and migration guardrails are not GUI implementation work.
depends_on: [BPM-001, PLS-001]
unblocks: []
acceptance_criteria:
  - Retired packet/tranche mechanics are not cited as the basis for the new architecture.
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
preserved_exact_tokens: ["Goal + Ledger + Validators + Compact Operating Views", "Do not reference", "failed experiments", "completely replaced by goal and this new ledger", "prompt-packet", "tranche", "subagent conversion experiments"]
negative_constraints:
  - Do not reference retired packet/tranche mechanics as the basis of the new architecture.
stale_retired_terms:
  - prompt-packet
  - tranche
  - subagent conversion experiments
owner_hints: [Plans/Planning_Ledger_System.md, Plans/Bootstrap_Planning_Migration.md]
```

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/Planning_Ledger_System.md

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

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md
