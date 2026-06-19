# Shard 033: PlanUnits

Source: `Plans/chain-wizard-flexibility.md`

Source lines: L2311-L9923

Source SHA256: `a9b5fbfbdf0de54c9447b116a9680bc755a2a5ce2c6b87a9d549a4a409bec2fd`

---

## PlanUnits

### CWF-001 - Chain Wizard & Interview Flexibility Source-Preserving Bridge Retired

```yaml
plan_unit_id: CWF-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The former doc-level source-preserving bridge is retired in place after Phase
  2B atomized chain-wizard-flexibility-S0001 through
  chain-wizard-flexibility-S0154 into CWF-002 through CWF-147. CWF-001 remains
  only as migration lineage for the retired bridge span and must not re-own
  atomized source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- CWF-001 no longer uses the source-preserving PlanUnit compile hint.
- Prior source coverage remains carried by CWF-002 through CWF-147.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
- Coverage for the retired bridge is recorded in the Phase 2B batch 021 coverage map.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
- Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0068
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0069
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0070
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0071
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0072
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0073
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0074
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0075
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0076
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0077
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0078
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0079
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0080
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0081
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0082
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0083
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0084
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0085
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0086
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0087
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0088
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0089
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0090
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0091
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0092
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0093
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0094
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0095
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0096
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0097
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0098
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0099
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0100
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0101
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0102
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0103
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0104
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0105
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0106
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0107
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0108
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0109
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0110
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0111
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0112
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0113
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0114
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0115
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0116
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0117
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0118
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0119
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0120
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0121
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0122
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0123
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0124
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0125
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0126
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0127
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0128
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0129
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0130
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0131
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0132
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0133
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0134
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0135
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0136
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0137
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0138
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0139
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0140
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0141
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0142
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0143
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0144
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0145
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0146
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0147
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0148
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0149
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0150
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0151
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0152
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0153
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0154
preserved_exact_tokens:
- Chain Wizard & Interview Flexibility -- Intent-Based Workflows
- Change Summary
- Plan Document Status
- Rewrite alignment (2026-02-21)
- SSOT references (DRY)
- 'ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, PolicyRule:Decision_Policy.md§1'
- Executive Summary
- Table of Contents
- 1. Intent-Based Workflows
- 1.1 New Project (greenfield)
- 1.2 Fork & Evolve
- 1.3 Enhance / Rewrite / Add (existing project, new to Puppet Master)
- 1.4 Contribute (PR)
- 1.5 Summary Table
- 2. How Intent Affects the Flow
- 2.1 Wizard State Shape
- 2.2 Canonical wizard runtime state
- 'ContractRef: ContractName:Plans/Project_Output_Artifacts.md, PolicyRule:no_secrets_in_storage, ContractName:Plans/GitHub_Integration.md'
- 'ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/interview-subagent-integration.md, Primitive:SessionStore'
- 'ContractRef: Plans/Project_Output_Artifacts.md#POA-045, Plans/Project_Output_Artifacts.md#11.1 `traceability/requirements_quality_report.json` (machine-readable), Plans/Prompt_Pipeline.md#6.4 Effective resolution record'
- 2.3 Wizard Cancellation Cleanup
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Project_Output_Artifacts.md'
- 3. GUI Updates
negative_constraints:
- '- Wizard/interview flows consume runtime `budget-outcome` names and usage snapshot fields only after `Plans/Contracts_V0.md` confirms the `/schema` surface stays stable across `Plans/Run_Modes.md`, `Plans/usage-feature.md`, and `Plans/orchestrator-subagent-integration.md`; this document must not min'
- The `wizard_status` enum is the wizard's own lifecycle. Builder bundle state, agent activity run state, and executor node status are separate state families and MUST NOT be conflated with `wizard_status`.
- For blocked wizard persistence, canonical fields use `wizard_status = blocked` with `blocked_reason_code`. Legacy blocked field names such as `is_blocked`, `blocked_info`, `blocked_state`, and `blocked_episode_ref` are non-canonical aliases and MUST NOT be introduced in new wizard state.
- '- Secrets or credential-bearing GitHub URLs MUST NOT be persisted in wizard state; store redacted remote metadata + credential-store account refs only.'
- '- Builder may read/write requirements-stage fields only; it must not mutate GitHub setup fields except via explicit wizard actions.'
- '- Pass reports must not masquerade as run, node, or attempt records.'
- '**Pause, cancel, resume:** Provide **pause**, **cancel**, and **resume** as user options during Multi-Pass Review and during document generation (Builder, Interview). **Pause:** Takes effect at **next handoff boundary** (no new subagents spawned; in-flight subagents complete and report; review agent'
- '**Stale progress:** If no progress event is received for **30 seconds** during an active run, show a warning in the progress indicator: "Progress stalled -- last update 30s ago" (amber). Do not auto-cancel; user may still pause or cancel.'
- '- **Contract Layer seed pack (Builder output; staging only):** `.puppet-master/requirements/contract-seeds.md`. This is an input to the interview’s contract unification pass (§6.6) and MUST NOT be treated as the canonical project contract pack (which lives under `.puppet-master/project/contracts/`; '
- '| **Non-goals** | What we are not trying to achieve. |'
- '| **Constraints** | Hard constraints (versions, platforms, compliance, budgets, forbidden deps) that must be enforced downstream. |'
- '- Do not ask follow-up questions for sections already marked `filled`.'
- 9. When all docs are Approved/Done and there are no open annotations, enable **Run Final Review**. Do not auto-run.
- '**Hard rule:** `Resubmit with Annotations` MUST NOT trigger Multi-Pass Review.'
- '- MUST NOT trigger Multi-Pass Review'
- '- Execution nodes must reference project contracts via `contract_refs: ["ProjectContract:..."]` (resolvable via `contracts/index.json`) and must not embed contract content inline.'
- '- **Skip:** Do not run phase questions, research, or document generation for that phase.'
- '**Resolution:** On handoff from Builder, persist project_path and intent in the same state used by Interview. When transitioning to Interview step, pass or read that state; Interview initialization must not overwrite with empty/default. Add assertion or guard: if handoff occurred, project_path and i'
- '**Resolution:** Define and document a single Builder output template: required top-level sections (e.g. Scope, Goals, Out of scope, Acceptance criteria, Non-goals). Assistant/Builder prompt and any post-processing must emit this structure. PRD generator and Interview assume this template; add a vali'
- '**Resolution:** Before opening PR, call GitHub API `GET /repos/{owner}/{repo}` and use the returned `default_branch` as PR target. Do not hardcode `main` or `master`.'
- '- **IDE-grade complexity risk:** The wizard may borrow selectively from IDEs and IDE-grade workspace/project models, but it must not import a high-complexity project shell that causes hangs, heavy navigation regressions, terminal-cwd friction, or cross-tool `/source-resolution` bugs.'
- '- **No secrets in handoff:** Requirements doc and Builder output must not be used to pass tokens or secrets; Interview and PR body must not include them (MiscPlan §3.6).'
- '**Resolution:** Builder and Interview do not accept or embed tokens/secrets in generated docs. PR body template (WorktreeGitImprovement/MiscPlan) must not include secrets; sanitize or exclude sensitive fields before opening PR. Add checklist item in implementation: no secrets in requirements doc, Bu'
- '**Resolution:** See §9.2 (required sections: Scope, Goals, Out of scope, Acceptance criteria, Non-goals).'
compatibility_only_notes:
- '- 2026-02-25: Hardened §12 cross-doc contract consistency with `Plans/Project_Output_Artifacts.md §10.2`: normalized pass report field names and enums (`pass_name`, `pass_verdict`, `verdict_reason`, `findings[]`, `unresolved_findings[]`), replaced legacy wording (`pass_report`, `verdict`, `violation'
- '- **Interview:** **Lighter** than full product or delta: focus on feature scope, acceptance criteria, and compatibility with upstream (e.g. style, tests). Many phases skipped or collapsed; AI decides.'
- For blocked wizard persistence, canonical fields use `wizard_status = blocked` with `blocked_reason_code`. Legacy blocked field names such as `is_blocked`, `blocked_info`, `blocked_state`, and `blocked_episode_ref` are non-canonical aliases and MUST NOT be introduced in new wizard state.
- '**Pause/cancel/resume UI:** Place **Pause**, **Cancel**, and **Resume** in a single control row (toolbar or footer of the agent activity pane). Order: Pause | Resume | Cancel. When running: show Pause and Cancel (Resume disabled). When paused: show Resume and Cancel (Pause disabled). **Cancel** must'
- '- `Resubmit with Notes` is a legacy UI label for the same targeted pass; it consumes open durable annotations, or a user-selected subset, and maps the output into the `open -> addressed -> resolved` lifecycle.'
- '- Compatibility note: legacy source references to `phase.config.max_questions` normalize to `interview.phases.{phase_name}.max_questions` or the global `interview.max_questions_per_phase`; they do not define a separate phase-config schema.'
- '- **If Pass 2 ends with non-empty `needs_user_clarification[]`:** transition the wizard to the clarification/resume path, emit Pass 3 as `skipped`, and preserve the corrected-but-blocked artifact set for resume.'
- '### 15.2 Wizard State Transition'
- Wizard/interview output must converge on graph-native planning. `chain-wizard-flexibility` and `chain-wizard-flexibility.md` produce plan-graph output for Orchestrator/GUI consumption, while older `/Task/Subtask/Iteration` and `/Interview` vocabulary is compatibility context. The compact status mode
stale_retired_dispositions:
- '**Stale progress:** If no progress event is received for **30 seconds** during an active run, show a warning in the progress indicator: "Progress stalled -- last update 30s ago" (amber). Do not auto-cancel; user may still pause or cancel.'
- '- Revision input records also preserve `anchor.text_position`, `anchor.text_quote`, bounded `selected_text`, `provenance` (`path`, `source_surface`, bounded excerpt), `conflict_state`, and `staleness_state`.'
- '- Conflicting or stale mutating annotations are excluded from automatic revision until resolved'
- '- Remaining non-blocking buckets are tagged explicitly as `/future-phase`, `/risk`, `/providers`, `/conflicts`, `revision-prompt`, `thread-target`, `send-to-chat`, `sensitivity-aware`, `/stale`, and `/degradation`.'
- '- **Builder and Interview in one session:** If user opens Builder, hands off, then we go to Interview, ensure project path and intent are still set when Interview starts (no stale "no project" state).'
owner_boundary_notes:
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '- 2026-02-25: Added §12 Three-Pass Canonical Validation Workflow (Mandatory Invariant Sweep): always-on, headless, post-Contract-Unification-Pass pipeline (Pass 1: Document Creation; Pass 2: Docs + Canonical Alignment; Pass 3: Canonical Systems Only). Separate from optional §5.6 Multi-Pass Review. P'
- '- 2026-02-24: Updated user-project **Project Contract Pack + executable artifacts** under `.puppet-master/project/**` to make the plan graph **sharded-only and canonical** (`.puppet-master/project/plan_graph/`); removed any requirement that `.puppet-master/project/plan_graph.json` is required/canoni'
- '- 2026-02-23: Added Contract Layer handoff section near Requirements Doc Builder/Interview describing Platform vs Project contracts, contract seeds, contract unification, and DRY contract-ID references (SSOT: `Plans/Project_Output_Artifacts.md`).'
- '- 2026-02-23: Added explicit dry-run validator acceptance requirements for contract-ref resolvability and acceptance-manifest coverage (SSOT: `Plans/Project_Output_Artifacts.md` Validation Rules).'
- '- 2026-02-23: Updated requirements semantics so `.puppet-master/requirements/*` remains staging while canonical downstream requirements are promoted to `.puppet-master/project/requirements.md`.'
- '- "Canonical requirements" artifacts should be treated as first-class **artifacts** in the event stream and projection layer'
- '## SSOT references (DRY)'
- '- Canonical contracts: `Plans/Contracts_V0.md`'
- '- Canonical terms: `Plans/Glossary.md`'
- '- **§4:** Requirements: multiple uploads, merge/canonical input, storage.'
- '- **§11:** User-project output artifacts (sharded-only canonical graph).'
- 12. [Auditor Invariant Loop (Mandatory Invariant Sweep)](#12-auditor-invariant-loop-mandatory-invariant-sweep) (legacy three-pass anchor is a compatibility alias only)
- '- **Entry:** User selects "Fork & evolve." We need **upstream repo** (URL or `owner/repo`). We **offer to create the fork** for the user (via GitHub HTTPS API; see `Plans/GitHub_API_Auth_and_Flows.md`), or the user can create the fork themselves and point us at the fork path or URL.'
- '- **Entry:** User selects "Contribute (PR)." We need **upstream repo** (URL or `owner/repo`). We **offer to create the fork** for the user, or they can create it themselves and point us at their fork.'
- Thread lifecycle references in this wizard/Interview plan use the canonical thread states `active`, `attention_required`, `blocked`, `completed`, and `failed`; permanent thread removal is a `delete` action with confirmation, and `archive` is not a thread lifecycle state.
- '### 2.2 Canonical wizard runtime state'
- '/// Upstream repo: URL or "owner/repo".'
- '/// Single canonical path: merged result. Interview and start chain read only this.'
- '| `wizard_status` | enum | See canonical `wizard_status` definition below. |'
- '| `phase_plan_ref` | path/null | Canonical persisted phase-plan location used by resume and audit. |'
- '| `remote_repo_ref` | object/null | Credential-safe remote reference (`owner`, `repo`, `host`, `clone_transport`, `clone_url_redacted`) for GitHub/fork flows. |'
- '**Canonical `wizard_status` definition (normative):**'
- requirements,       // requirements upload, Requirements Doc Builder, or canonical requirements merge is active
owner_hints:
- Plans/chain-wizard-flexibility.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

### CWF-002 - Document Compliance, Status, and Rewrite Alignment

```yaml
plan_unit_id: CWF-002
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Chain Wizard & Interview Flexibility remains a plan-only canonical workflow
  document that follows DRY/Contracts/Decision Policy requirements and aligns
  wizard, Interview, Assistant, artifact, event-stream, projection, and Slint
  implementation semantics with the rewrite without changing user-visible flow.
gui_related: true
gui_classification_reason: The covered spans include GUI and flow changes plus Slint UI implementation alignment.
split_recommended: false
depends_on: []
unblocks: [CWF-003, CWF-004, CWF-010]
acceptance_criteria:
  - The document preserves Puppet Master naming and deterministic-default compliance.
  - The plan-only status is preserved and does not imply code changes.
  - Wizard, Interview, and Assistant orchestration target the unified event model.
  - Canonical requirements remain first-class artifacts in the event stream and projection layer.
  - UI implementation details are re-expressed in Slint, not Iced, without changing user-visible flow.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: rewrite_alignment
reasoning_tier: standard
context_scope: wizard_interview
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/rewrite-tie-in-memo.md
node_compile_hint:
  mode: chain_wizard_document_compliance_rewrite_alignment
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0001
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0003
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0004
preserved_exact_tokens:
  - "Chain Wizard & Interview Flexibility -- Intent-Based Workflows"
  - "PLAN DOCUMENT ONLY"
  - "No code changes have been made"
  - "unified event model"
  - "seglog ledger"
  - "first-class artifacts"
  - "Slint"
  - "not Iced"
negative_constraints:
  - "Do not treat this plan document as an implementation patch."
  - "Do not change user-visible flow while re-expressing UI implementation details in Slint."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-003 - Change Summary and SSOT Guardrails

```yaml
plan_unit_id: CWF-003
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The change summary and SSOT guardrails preserve validation pass field names,
  sharded-only user-project plan graph output, GitHub HTTPS API-only operations,
  provider/OpenCode references, output artifact ownership, and the prohibition
  on minting fresh budget-outcome schema deltas.
gui_related: true
gui_classification_reason: The covered change-summary span includes GUI provider selection, settings, wiring artifacts, and GUI-conditioned project contract pack behavior.
split_recommended: false
depends_on: [CWF-002]
unblocks: [CWF-004, CWF-016]
acceptance_criteria:
  - Validation pass field names and enum names remain normalized to Project_Output_Artifacts ownership.
  - User-project plan graph output remains sharded-only under .puppet-master/project/plan_graph/.
  - No user-project Plans/ assumption is introduced.
  - GitHub operations follow Spec Lock and GitHub auth/API flow owners.
  - Wizard/interview flows do not mint fresh budget-outcome event or schema deltas.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: ssot_drift
reasoning_tier: high
context_scope: cross_doc_contracts
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/Provider_OpenCode.md
node_compile_hint:
  mode: chain_wizard_change_summary_ssot_guardrails
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0002
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0005
preserved_exact_tokens:
  - "pass_name"
  - "pass_verdict"
  - "verdict_reason"
  - "findings[]"
  - "unresolved_findings[]"
  - "validation_pass_report"
  - ".puppet-master/project/plan_graph/"
  - "plan_graph.monolithic.json"
  - "no user-project `Plans/` assumption"
  - "Spec_Lock.json#locked_decisions.github_operations"
  - "budget-outcome"
negative_constraints:
  - "Do not require or canonicalize .puppet-master/project/plan_graph.json."
  - "Do not mint a fresh event/schema delta for budget-outcome surfaces."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-004 - Executive Scope and Navigation

```yaml
plan_unit_id: CWF-004
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The plan scope and navigation preserve intent-based workflows, GUI/flow
  support, requirements uploads and Builder handoff, adaptive Interview, project
  setup and GitHub/fork/PR flow, no-wizard flows, validation workflow, and
  readiness checklist navigation.
gui_related: true
gui_classification_reason: The covered summary and table of contents describe GUI and flow changes, user-visible entry points, and navigation sections.
split_recommended: false
depends_on: [CWF-002, CWF-003]
unblocks: [CWF-005, CWF-010, CWF-018]
acceptance_criteria:
  - The four workflow intents remain visible in scope.
  - Requirements uploads, Requirements Doc Builder, adaptive Interview, GitHub setup, fork, and PR flows remain in scope.
  - Sections 12 and 13 remain navigable for mandatory validation and no-wizard flows.
  - DRY references to platform specs, GUI catalog, rules pipeline, git/worktree, subagent registry, and Assistant/Interview UI patterns remain preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: scope_navigation_drift
reasoning_tier: standard
context_scope: wizard_interview
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_executive_scope_navigation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0006
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0007
preserved_exact_tokens:
  - "Intent-based workflow definitions"
  - "GUI and flow changes"
  - "Requirements Doc Builder"
  - "Adaptive interview phases"
  - "Project setup and GitHub"
  - "Three-Pass Canonical Validation Workflow"
  - "No-Wizard Project Management Flows"
  - "Change Summary"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-005 - Intent Model Overview and Summary Matrix

```yaml
plan_unit_id: CWF-005
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: The wizard and Interview support four distinct intents, with each intent changing requirements framing, Interview depth, upstream/fork handling, and resulting PRD or plan shape as shown in the summary matrix.
gui_related: false
gui_classification_reason: Intent taxonomy and outcome matrix are workflow model requirements; user-facing GUI labels are covered by later GUI sections.
split_recommended: false
depends_on: [CWF-004]
unblocks: [CWF-006, CWF-007, CWF-008, CWF-009, CWF-010]
acceptance_criteria:
  - The four intents remain New project, Fork & evolve, Enhance/rewrite/add, and Contribute (PR).
  - Each intent can alter setup questions, requirements framing, Interview depth, and outcome shape.
  - The summary matrix preserves upstream/fork, requirements framing, Interview depth, and outcome columns.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: intent_model_drift
reasoning_tier: standard
context_scope: wizard_intent
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_intent_model_overview
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0008
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0013
preserved_exact_tokens:
  - "four distinct intents"
  - "Upstream/fork?"
  - "Requirements framing"
  - "Interview depth"
  - "Outcome"
  - "Full product"
  - "Delta"
  - "Feature/fix scope"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-006 - New Project Intent

```yaml
plan_unit_id: CWF-006
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: New Project supports greenfield products or codebases from scratch, with optional new directory initialization, optional GitHub repo creation, full-product requirements, full adaptive Interview, and full PRD/plan outcome.
gui_related: false
gui_classification_reason: This span defines intent semantics rather than GUI presentation.
split_recommended: false
depends_on: [CWF-005]
unblocks: [CWF-010, CWF-012]
acceptance_criteria:
  - New project remains the greenfield intent.
  - Project path may be empty or a new directory to initialize.
  - Requirements are full-product requirements rather than delta requirements.
  - Interview may use all phases while still adapting to scope signals.
  - Outcome is new repo, full PRD, full plan, then execution.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: intent_semantics
reasoning_tier: standard
context_scope: wizard_intent
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_new_project_intent
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0009
preserved_exact_tokens:
  - "New Project"
  - "greenfield"
  - "Start a new product or codebase from scratch"
  - "Full product interview"
  - "New repo"
  - "full PRD and plan"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-007 - Fork & Evolve Intent

```yaml
plan_unit_id: CWF-007
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Fork & Evolve supports derivative work from an upstream repo, offers GitHub HTTPS API fork creation or user-provided forks, frames requirements and Interview as delta/evolution, and produces a delta PRD/plan over upstream.
gui_related: false
gui_classification_reason: This span defines fork/evolution workflow semantics rather than GUI presentation.
split_recommended: false
depends_on: [CWF-005]
unblocks: [CWF-010, CWF-012, CWF-015]
acceptance_criteria:
  - Upstream repo may be supplied as URL or owner/repo.
  - Puppet Master offers to create the fork through GitHub HTTPS API or accepts a user-created fork.
  - Requirements describe what to add or change in the fork.
  - Interview is framed as delta/evolution and adapts phase depth to context.
  - Outcome is fork plus delta PRD/plan then execution on the fork.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: fork_flow_drift
reasoning_tier: standard
context_scope: wizard_intent
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
node_compile_hint:
  mode: chain_wizard_fork_evolve_intent
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0010
preserved_exact_tokens:
  - "Fork & evolve"
  - "upstream repo"
  - "URL or `owner/repo`"
  - "offer to create the fork"
  - "GitHub HTTPS API"
  - "delta/evolution"
  - "delta PRD"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-008 - Enhance / Rewrite / Add Intent

```yaml
plan_unit_id: CWF-008
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Enhance, Rewrite, or Add supports existing projects new to Puppet Master, uses an existing project path without requiring a fork, frames requirements and Interview as scoped delta work, scans the current codebase for context, and executes in the existing project directory.
gui_related: false
gui_classification_reason: This span defines existing-project intent semantics rather than GUI presentation.
split_recommended: false
depends_on: [CWF-005]
unblocks: [CWF-010, CWF-012]
acceptance_criteria:
  - The project already exists and is new to Puppet Master.
  - The user supplies an existing clone or directory path.
  - No fork is required unless the user later chooses upstream contribution.
  - Requirements describe scoped enhancement, rewrite, or add work.
  - Existing codebase scanning seeds Interview context.
  - Outcome is delta PRD/plan and execution in the existing project directory.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: existing_project_flow_drift
reasoning_tier: standard
context_scope: wizard_intent
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_enhance_rewrite_add_intent
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0011
preserved_exact_tokens:
  - "Enhance / Rewrite / Add"
  - "existing project, new to Puppet Master"
  - "project path"
  - "existing clone or directory"
  - "codebase_scanner"
  - "delta PRD/plan"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-009 - Contribute PR Intent

```yaml
plan_unit_id: CWF-009
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Contribute PR supports feature or fix contributions to someone else's project, guides fork and feature-branch setup, keeps requirements lightweight, focuses Interview on scope/acceptance/upstream compatibility, and offers commit, push, and pull-request completion.
gui_related: false
gui_classification_reason: This span defines PR contribution workflow semantics rather than GUI presentation.
split_recommended: false
depends_on: [CWF-005]
unblocks: [CWF-010, CWF-012, CWF-015]
acceptance_criteria:
  - Upstream repo may be supplied as URL or owner/repo.
  - Puppet Master offers to create the fork or accepts a user-created fork.
  - Requirements are feature/fix scope plus acceptance criteria.
  - Interview is lighter and focuses on scope, acceptance, style, tests, and upstream compatibility.
  - Work happens on a feature branch and Puppet Master offers commit, push, and PR opening.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: pr_flow_drift
reasoning_tier: standard
context_scope: wizard_intent
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
node_compile_hint:
  mode: chain_wizard_contribute_pr_intent
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0012
preserved_exact_tokens:
  - "Contribute (PR)"
  - "feature/fix scope"
  - "Pull Request"
  - "feature branch"
  - "commit, push, and open the PR"
  - "What's a PR?"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-010 - Intent-Driven Flow Adaptation

```yaml
plan_unit_id: CWF-010
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Intent selection happens at flow start and drives project setup questions, fork/repo creation offers, requirements prompt copy, Interview phase/depth configuration, PRD/plan framing, and downstream state handoff through app state and optional .puppet-master recovery state.
gui_related: false
gui_classification_reason: The covered span defines flow-state adaptation; the visible start-surface controls are covered by later GUI sections.
split_recommended: false
depends_on: [CWF-006, CWF-007, CWF-008, CWF-009]
unblocks: [CWF-012, CWF-015]
acceptance_criteria:
  - Intent selection happens at Dashboard or the first wizard step.
  - Intent drives upstream URL, fork/repo creation, project path, requirements prompt, Interview configuration, and PRD/plan framing.
  - Selected intent is stored in app state and optionally in .puppet-master for recovery.
  - Changing intent after downstream state exists requires invalidation or confirmation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: intent_state_drift
reasoning_tier: standard
context_scope: wizard_state
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_intent_driven_flow_adaptation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0014
preserved_exact_tokens:
  - "Intent selection"
  - "flow start"
  - "project setup"
  - "offer to create a fork"
  - "create a repo"
  - "requirements prompt"
  - "Interview"
  - "full vs. delta vs. feature"
  - ".puppet-master/"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-011 - Wizard Thread Lifecycle Boundary

```yaml
plan_unit_id: CWF-011
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Wizard and Interview thread lifecycle references use active, attention_required, blocked, completed, and failed as canonical thread states; permanent removal is a delete action with confirmation, and archive is not a lifecycle state.
gui_related: false
gui_classification_reason: Thread lifecycle vocabulary is state-contract behavior, not GUI implementation work.
split_recommended: false
depends_on: [CWF-010]
unblocks: [CWF-013, CWF-014]
acceptance_criteria:
  - Canonical thread states are active, attention_required, blocked, completed, and failed.
  - Permanent removal is modeled as delete with confirmation.
  - archive is not introduced as a thread lifecycle state.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: lifecycle_vocab_drift
reasoning_tier: standard
context_scope: runtime_state
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_thread_lifecycle_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0015
preserved_exact_tokens:
  - "active"
  - "attention_required"
  - "blocked"
  - "completed"
  - "failed"
  - "delete"
  - "archive"
negative_constraints:
  - "archive is not a thread lifecycle state."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-012 - Canonical Wizard State Shape

```yaml
plan_unit_id: CWF-012
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: ChainWizardState captures intent, wizard_step, project path, new-repo fields, fork/upstream fields, PR branch, requirements upload/Builder/canonical path fields, and recovery correlation in Rust and JSON-equivalent forms.
gui_related: true
gui_classification_reason: Wizard state drives project setup, requirements, downstream Interview/start chain, and GUI recovery behavior.
split_recommended: true
split_recommendation_reason: Source span S0016 contains several distinct runtime contracts; this PlanUnit covers only the state-shape subset.
depends_on: [CWF-006, CWF-007, CWF-008, CWF-009, CWF-010]
unblocks: [CWF-013, CWF-015]
acceptance_criteria:
  - WizardIntent preserves NewProject, ForkAndEvolve, EnhanceRewriteAdd, and ContributePr.
  - ChainWizardState preserves intent, wizard_step, project_path, repo fields, upstream/fork fields, branch_name, requirements paths, builder_used, canonical_requirements_path, and last_updated.
  - The JSON equivalent preserves the same fields for persistence and recovery.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wizard_state_shape
reasoning_tier: high
context_scope: wizard_state
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_canonical_state_shape
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0016
preserved_exact_tokens:
  - "WizardIntent"
  - "ChainWizardState"
  - "NewProject"
  - "ForkAndEvolve"
  - "EnhanceRewriteAdd"
  - "ContributePr"
  - "project_path"
  - "upstream_url"
  - "branch_name"
  - "canonical_requirements_path"
  - "JSON equivalent"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-013 - Wizard Runtime Fields and Lifecycle

```yaml
plan_unit_id: CWF-013
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Wizard runtime state adds required fields including wizard_id, wizard_status, launch_source, phase override and plan references, GUI flag, attention report reference, remote repo reference, deferred payload reference, and the canonical wizard_status lifecycle enum without conflating state families.
gui_related: true
gui_classification_reason: Runtime fields include GUI launch sources, Dashboard CTAs, thread deep links, and wizard user-visible lifecycle state.
split_recommended: true
split_recommendation_reason: Source span S0016 contains several distinct runtime contracts; this PlanUnit covers only runtime fields and lifecycle.
depends_on: [CWF-012]
unblocks: [CWF-014, CWF-015, CWF-017]
acceptance_criteria:
  - Required runtime fields include wizard_id, wizard_status, launch_source, phase_override_mode, phase_plan_ref, has_gui, attention_required_report_path, remote_repo_ref, and deferred_wizard_payload_ref.
  - wizard_status values preserve setup, requirements, interview, validating, attention_required, blocked, ready_to_execute, complete, and cancelled.
  - Wizard lifecycle, Builder bundle state, agent activity run state, and executor node status remain separate state families.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wizard_lifecycle_drift
reasoning_tier: high
context_scope: wizard_state
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_runtime_fields_lifecycle
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0016
preserved_exact_tokens:
  - "wizard_id"
  - "wizard_status"
  - "launch_source"
  - "phase_override_mode"
  - "phase_plan_ref"
  - "has_gui"
  - "remote_repo_ref"
  - "deferred_wizard_payload_ref"
  - "ready_to_execute"
  - "cancelled"
negative_constraints:
  - "Builder bundle state, agent activity run state, and executor node status MUST NOT be conflated with wizard_status."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-014 - Wizard Contracts and Blocked Persistence Aliases

```yaml
plan_unit_id: CWF-014
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Wizard step contracts remain PhaseSelectorContract, RequirementsGatheringContract, InterviewContract, and ValidationPassContract, and blocked wizard persistence uses wizard_status=blocked with blocked_reason_code while rejecting legacy blocked field aliases.
gui_related: true
gui_classification_reason: Wizard contracts and blocked persistence drive user-visible wizard flow and recovery surfaces.
split_recommended: true
split_recommendation_reason: Source span S0016 contains several distinct runtime contracts; this PlanUnit covers contract families and blocked alias rules.
depends_on: [CWF-011, CWF-013]
unblocks: [CWF-015, CWF-017]
acceptance_criteria:
  - Canonical wizard step contracts remain PhaseSelectorContract, RequirementsGatheringContract, InterviewContract, and ValidationPassContract.
  - Implementations may store contracts as structs or schema-backed payloads while keeping lifecycle handoff families distinct.
  - Blocked wizard persistence uses wizard_status = blocked with blocked_reason_code.
  - New wizard state does not introduce is_blocked, blocked_info, blocked_state, or blocked_episode_ref.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_state_alias_drift
reasoning_tier: high
context_scope: wizard_state
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_contracts_blocked_aliases
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0016
preserved_exact_tokens:
  - "PhaseSelectorContract"
  - "RequirementsGatheringContract"
  - "InterviewContract"
  - "ValidationPassContract"
  - "blocked_reason_code"
  - "is_blocked"
  - "blocked_info"
  - "blocked_state"
  - "blocked_episode_ref"
negative_constraints:
  - "Legacy blocked field names must not be introduced in new wizard state."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-015 - Wizard Persistence and Handoff Payload

```yaml
plan_unit_id: CWF-015
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Wizard state persists in app state and .puppet-master recovery storage, preserves credential-safe remote metadata, promotes canonical requirements before execution, and hands one normalized payload to Builder handoff, Interview initialization, and start-chain kickoff.
gui_related: true
gui_classification_reason: Persistence and handoff payloads drive GUI recovery, Dashboard CTAs, wizard resume, and user-visible flow continuity.
split_recommended: true
split_recommendation_reason: Source span S0016 contains several distinct runtime contracts; this PlanUnit covers persistence and handoff payload rules.
depends_on: [CWF-012, CWF-013, CWF-014]
unblocks: [CWF-016, CWF-017]
acceptance_criteria:
  - Full ChainWizardState remains available in app state and persists under .puppet-master or redb for recovery.
  - canonical_requirements_path is set only after upload merge, Builder output, or both, and points to promoted .puppet-master/project/requirements.md for execution.
  - Contribute PR work happens on branch_name in the main clone.
  - Secrets or credential-bearing GitHub URLs are not persisted in wizard state.
  - Builder may mutate requirements-stage fields only; Interview consumes read-mostly input; Start chain reads the post-validation canonical .puppet-master/project package.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: handoff_persistence_drift
reasoning_tier: high
context_scope: wizard_state
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: chain_wizard_persistence_handoff_payload
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0016
preserved_exact_tokens:
  - ".puppet-master/wizard-state.json"
  - "redb"
  - "canonical_requirements_path"
  - ".puppet-master/project/requirements.md"
  - "no_secrets_in_storage"
  - "redacted remote metadata"
  - "deferred_wizard_payload_ref"
  - "resume_checkpoint_ref"
  - ".puppet-master/project/**"
negative_constraints:
  - "Secrets or credential-bearing GitHub URLs MUST NOT be persisted in wizard state."
  - "Builder must not mutate GitHub setup fields except via explicit wizard actions."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-016 - Validation Report Bridge and Runtime Identity Carry-Through

```yaml
plan_unit_id: CWF-016
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Validation report bridge fields and canonical auditor_cycle_report terms must carry accepted or final sweep output into launched execution through a launch receipt or promoted package ref while preserving effective runtime identity; validation_pass_report may appear only as a legacy mirror with compatibility_only true and cycle_report_ref, and pass reports must not masquerade as run, node, or attempt records.
gui_related: true
gui_classification_reason: Validation bridge and runtime identity visibility feed wizard handoff, launch receipts, and user-visible validation/report surfaces.
split_recommended: true
split_recommendation_reason: Source span S0016 contains several distinct runtime contracts; this PlanUnit covers validation bridge and runtime identity carry-through.
depends_on: [CWF-003, CWF-015]
unblocks: []
acceptance_criteria:
  - Required bridge fields include workflow_run_id, staged_bundle_ref, requirements_quality_report_ref, execution_role, effective_account_id, and run_id.
  - Canonical terms include auditor_cycle_report, launch receipt, and promoted package ref.
  - validation_pass_report is allowed only as a legacy mirror with compatibility_only true and cycle_report_ref.
  - Accepted or final sweep output bridges into launched execution through a launch receipt or promoted package ref.
  - Pass reports do not masquerade as run, node, or attempt records.
  - Effective runtime identity survives downstream handoff.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_report_identity_drift
reasoning_tier: high
context_scope: validation_handoff
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: chain_wizard_validation_report_runtime_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0016
preserved_exact_tokens:
  - "workflow_run_id"
  - "staged_bundle_ref"
  - "requirements_quality_report_ref"
  - "execution_role"
  - "effective_account_id"
  - "run_id"
  - "auditor_cycle_report"
  - "validation_pass_report"
  - "compatibility_only"
  - "cycle_report_ref"
  - "launch receipt"
  - "promoted package ref"
negative_constraints:
  - "Pass reports must not masquerade as run, node, or attempt records."
compatibility_only_notes:
  - "validation_pass_report is a legacy mirror only and must carry compatibility_only true plus cycle_report_ref to auditor_cycle_report."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-017 - Wizard Cancellation Cleanup and Resume

```yaml
plan_unit_id: CWF-017
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Wizard cancellation terminates subagents, aborts tool calls, conditionally cleans up or preserves branches, preserves Interview state for a 24-hour resume window, moves partial artifacts to .cancelled, counts consumed usage, emits wizard.cancelled, and keeps FUTURE FEATURE or OPEN QUESTION labels non-blocking unless promoted.
gui_related: false
gui_classification_reason: Cancellation cleanup and resume behavior are runtime lifecycle and recovery rules; GUI controls are covered by later GUI sections.
split_recommended: false
depends_on: [CWF-013, CWF-014, CWF-015]
unblocks: []
acceptance_criteria:
  - Running subagents receive cancel, wait up to five seconds, then force kill remaining processes.
  - Pending tool calls are aborted.
  - Worktree branches created by the wizard are removed only if no commits exist; committed branches are preserved and tagged [cancelled].
  - Interview state remains recoverable for 24 hours.
  - Partial plan artifacts move to .cancelled/.
  - Consumed usage tokens remain counted and wizard.cancelled is emitted.
  - FUTURE FEATURE and OPEN QUESTION labels do not block current contracts unless later promoted.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: cancellation_cleanup
reasoning_tier: high
context_scope: wizard_runtime
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_cancellation_cleanup_resume
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0017
preserved_exact_tokens:
  - "Wizard Cancellation Cleanup"
  - "5 seconds"
  - "[cancelled]"
  - "24 hours"
  - ".cancelled/"
  - "wizard.cancelled"
  - "FUTURE FEATURE"
  - "OPEN QUESTION"
negative_constraints:
  - "Do not clean up wizard-created branches when commits exist."
  - "FUTURE FEATURE or OPEN QUESTION labels do not block the current wizard/interview contract unless promoted."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-018 - GUI Updates Boundary

```yaml
plan_unit_id: CWF-018
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: The GUI Updates and Intent Selection headings are preserved as structural boundaries for the next GUI-specific window; batch 016 does not pull the 3.1A Feature/enhancement entry copy body into this PlanUnit.
gui_related: true
gui_classification_reason: The headings establish the GUI updates section and intent-selection surface boundary.
split_recommended: false
depends_on: [CWF-010]
unblocks: []
acceptance_criteria:
  - The 3. GUI Updates heading remains preserved.
  - The 3.1 Intent Selection at Flow Start heading remains preserved.
  - Content from 3.1A and later GUI subsections is not claimed by this batch.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: structural_boundary
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_gui_updates_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0018
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0019
preserved_exact_tokens:
  - "3. GUI Updates"
  - "3.1 Intent Selection at Flow Start"
negative_constraints:
  - "Do not infer or claim the 3.1A body content in batch 016."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-019 - Feature Enhancement CTA and Intent Selection Copy

```yaml
plan_unit_id: CWF-019
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: The Chain Wizard start surface exposes Add a new Feature or Enhancement as a user-facing CTA that maps to EnhanceRewriteAdd without creating a fifth intent, preserves the four intent options, and can be reused from Assistant Chat, Deep Plan, and deferred-wizard shortcuts.
gui_related: true
gui_classification_reason: This unit defines user-facing CTA text, start-surface placement, and intent option copy.
split_recommended: false
depends_on: [CWF-005, CWF-008, CWF-018]
unblocks: [CWF-020, CWF-022]
acceptance_criteria:
  - The start surface exposes Add a new Feature or Enhancement.
  - The CTA maps to existing intent EnhanceRewriteAdd and does not create a fifth intent.
  - Intent selection appears before or as the first wizard step.
  - The four option labels New project, Fork & evolve, Enhance/rewrite/add, and Contribute (PR) remain preserved.
  - Selected intent persists into wizard/app state and downstream Interview/start-chain handoff.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: gui_intent_copy_drift
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: chain_wizard_feature_enhancement_cta_intent_copy
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0020
preserved_exact_tokens:
  - "Add a new Feature or Enhancement"
  - "EnhanceRewriteAdd"
  - "does not create a new fifth intent"
  - "New project"
  - "Fork & evolve"
  - "Enhance/rewrite/add"
  - "Contribute (PR)"
  - "Assistant Chat / Deep Plan"
negative_constraints:
  - "Do not create a new fifth intent."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-020 - OpenCode Provider Settings Surface

```yaml
plan_unit_id: CWF-020
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: OpenCode is configured as a first-class provider backend in Settings, with enable toggle, Direct server and CLI launcher/discovery fallback connection methods, auth/sign-in options, and shared Provider model selection without OpenCode-only picker behavior.
gui_related: true
gui_classification_reason: This unit defines Settings controls, auth actions, and provider model picker behavior.
split_recommended: false
depends_on: [CWF-003, CWF-019]
unblocks: [CWF-022]
acceptance_criteria:
  - Settings exposes a single OpenCode enable toggle.
  - Settings exposes Direct server and CLI launcher/discovery fallback connection methods.
  - opencode path is used only for local launch/discovery fallback, not primary HTTP runtime transport.
  - Server auth inputs and sign-in actions are exposed for OpenCode provider auth flows.
  - Tier model pickers source OpenCode models through the shared Provider model contract.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_settings_drift
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Provider_OpenCode.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: chain_wizard_opencode_provider_settings_surface
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0021
preserved_exact_tokens:
  - "OpenCode Provider Settings Surface"
  - "first-class provider backend"
  - "Direct server"
  - "CLI launcher/discovery fallback"
  - "opencode"
  - "not for primary HTTP runtime transport"
  - "no OpenCode-only picker behavior"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-021 - Requirements Step Entry and Builder Option

```yaml
plan_unit_id: CWF-021
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: The requirements step prompts users to provide Requirements Document(s), supports uploading one or multiple files under .puppet-master/requirements, and offers Requirements Doc Builder as a no-reupload Assistant-generated requirements path into Interview.
gui_related: true
gui_classification_reason: This unit defines requirements-step labels, upload options, and Builder button behavior.
split_recommended: false
depends_on: [CWF-019]
unblocks: [CWF-028, CWF-029, CWF-032]
acceptance_criteria:
  - The prompt remains Provide your Requirements Document(s).
  - Upload your own supports one or multiple files.
  - Requirements Doc Builder opens Builder chat from the requirements step.
  - Builder output can hand off without re-upload.
  - Helper text can vary by intent while preserving the same canonical requirements handoff.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: requirements_entry_drift
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_requirements_entry_builder_option
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0022
preserved_exact_tokens:
  - "Provide your Requirements Document(s)."
  - "Upload your own"
  - "multiple"
  - "Requirements Doc Builder"
  - ".puppet-master/requirements/"
  - "No re-upload required"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-022 - Project Setup GitHub Fields and Readiness Strips

```yaml
plan_unit_id: CWF-022
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Project setup collects project path, intent-specific GitHub create/fork/existing repo fields, provider auth readiness, tool install readiness, manual Cursor/Claude paths, and command-contract actions from FinalGUISpec.
gui_related: true
gui_classification_reason: This unit defines wizard setup controls, readiness strips, install-state labels, and manual path controls.
split_recommended: false
depends_on: [CWF-019, CWF-020]
unblocks: [CWF-023, CWF-028]
acceptance_criteria:
  - Project setup shows project path and intent-specific fields.
  - New project create-repo flow captures repo name and fields needed for GitHub create-repo API.
  - Fork and Contribute flows capture Upstream repo and Create fork for me or I'll create the fork myself.
  - Existing repo URL/path is supported as link-only input.
  - Provider readiness strip preserves provider auth states and account summary.
  - Tool readiness strip preserves Cursor CLI, Claude CLI, and Playwright state/action rules.
  - Cursor/Claude manual path controls use Use manual path checkbox plus file picker; Playwright has no manual path controls.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: setup_ui_drift
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_project_setup_github_readiness
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0023
preserved_exact_tokens:
  - "Create GitHub repo"
  - "repo name"
  - "Upstream repo"
  - "Create fork for me"
  - "I'll create the fork myself"
  - "Use existing repo"
  - "LoggedOut"
  - "AuthExpired"
  - "Not Installed"
  - "Use manual path"
  - "Plans/FinalGUISpec.md §7.15"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-023 - Navigation and Recovery Reset Semantics

```yaml
plan_unit_id: CWF-023
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Wizard navigation permits back/forward changes while requiring documented reset or confirmation behavior when intent changes, and recovery snapshots include current view, wizard step, intent, and project path.
gui_related: true
gui_classification_reason: This unit covers user-visible navigation, reset confirmation, and recovery restoration behavior.
split_recommended: false
depends_on: [CWF-022]
unblocks: [CWF-026, CWF-027]
acceptance_criteria:
  - Users can go back and change intent or setup fields.
  - Intent changes mid-flow clear downstream requirements/interview state or prompt for confirmation.
  - Recovery snapshots preserve current view, wizard step, intent, and project path.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: recovery_state_drift
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_navigation_recovery_reset
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0024
preserved_exact_tokens:
  - "Back/forward"
  - "Changing intent will reset requirements and interview; continue?"
  - "Recovery"
  - "current view"
  - "wizard step"
  - "intent"
  - "project path"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-024 - Wizard Plan Deep Plan TODO Handoff and Permission Boundary

```yaml
plan_unit_id: CWF-024
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Wizard-produced Plan and Deep Plan artifacts use the normalized TODO schema, treat Plan and Deep Plan as intensity variants of plan runtime mode, may use read-only research subagents and web tools through normal permissions, and keep mutating tools denied in plan mode.
gui_related: true
gui_classification_reason: This unit covers wizard planning surfaces, questionnaire cards, runtime identity display, and user-visible Plan/Deep Plan/TODO handoff.
split_recommended: true
split_recommendation_reason: Source span S0026 contains several distinct GUI/runtime contracts; this unit covers plan/deep-plan/TODO and permission boundaries.
depends_on: [CWF-021]
unblocks: [CWF-025]
acceptance_criteria:
  - Wizard-generated plans use the normalized TODO schema from assistant-chat-design and storage-plan.
  - Plan and Deep Plan are intensity variants, not categorical runtime modes.
  - Deep Plan may spawn read-only research subagents including web research.
  - Wizard questions render through the shared questionnaire card and preserve effective_persona.
  - Web tools use the normal permission stack and mutating tools remain denied in plan mode.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: plan_mode_permission_drift
reasoning_tier: high
context_scope: wizard_planning
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Run_Modes.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: chain_wizard_plan_deep_plan_todo_permission_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0026
preserved_exact_tokens:
  - "plan"
  - "/intensity"
  - "read-only research subagents"
  - "TODO auto-use heuristic"
  - "/questionnaire"
  - "effective_persona"
  - "/web"
  - "/skill"
  - "default `ask`"
  - "Mutating tools remain denied"
negative_constraints:
  - "Mutating tools remain denied in plan mode regardless of wizard context."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-025 - Embedded Agent Activity Pane and Progress Placement

```yaml
plan_unit_id: CWF-025
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Requirements Builder, Multi-Pass Review, Interview document creation, and review work show a same-page embedded read-only agent activity pane with streaming agent output, blocked-state badges/actions, progress status, and separate document review/editing pane.
gui_related: true
gui_classification_reason: This unit defines embedded user-visible progress/activity panes, blocked cards, and same-page placement.
split_recommended: true
split_recommendation_reason: Source span S0026 contains several distinct GUI/runtime contracts; this unit covers activity pane and progress placement.
depends_on: [CWF-024]
unblocks: [CWF-026, CWF-027]
acceptance_criteria:
  - Agent activity pane is chat-like, embedded, read-only, and streams prompts, model responses, and subagent reports.
  - The pane has no user input, no slash commands, and minimal chrome.
  - Permission, FileSafe, MCP, Provider, config, and headless blocked states map to blocked badge and recovery/informational behavior.
  - Document review/editing is handled by a separate embedded document pane.
  - The pane appears on the same page where Builder, Multi-Pass Review, Interview document creation, or review is triggered.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: activity_visibility_drift
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_embedded_agent_activity_pane
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0025
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0026
preserved_exact_tokens:
  - "chat-like window"
  - "streaming agent output"
  - "read-only"
  - "no user input"
  - "no slash commands"
  - "blocked"
  - "/Provider"
  - "/config"
  - "same page"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-026 - Pause Cancel Resume Runtime Semantics

```yaml
plan_unit_id: CWF-026
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Multi-Pass Review and document generation expose pause, cancel, and resume controls whose runtime semantics preserve handoff boundaries, avoid killing in-flight subagents on pause/cancel, discard cancelled reports, and support crash recovery choices.
gui_related: true
gui_classification_reason: This unit covers user-visible pause/cancel/resume controls and runtime behavior.
split_recommended: true
split_recommendation_reason: Source span S0026 contains several distinct GUI/runtime contracts; this unit covers pause/cancel/resume runtime semantics.
depends_on: [CWF-023, CWF-025]
unblocks: [CWF-027]
acceptance_criteria:
  - Pause takes effect at the next handoff boundary and does not kill in-flight subagents.
  - Resume continues from persisted handoff state.
  - Cancel stops spawning immediately, lets in-flight subagents complete, discards reports, and surfaces no changes applied.
  - If review agent is producing, cancel waits for current revision to finish, discards it, and sets cancelled.
  - Crash recovery offers Resume or Start over when state is restorable, and Start over only when state is missing or corrupted.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: pause_cancel_resume_drift
reasoning_tier: high
context_scope: runtime
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_pause_cancel_resume_runtime
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0026
preserved_exact_tokens:
  - "pause"
  - "cancel"
  - "resume"
  - "next handoff boundary"
  - "Do not kill in-flight subagents"
  - "stop spawning"
  - "discard their reports"
  - "Resume"
  - "Start over"
negative_constraints:
  - "Do not kill in-flight subagents on pause or cancel."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-027 - Run States Control Row Stale Progress and Checkpoint Payload

```yaml
plan_unit_id: CWF-027
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Agent activity progress uses the canonical run-state enum, a Pause Resume Cancel control row, confirmation modal/toasts, stale-progress warning after 30 seconds, and a recoverable checkpoint payload with run type, run id, phase, step/document indexes, subagent task count, and checkpoint version.
gui_related: true
gui_classification_reason: This unit defines user-facing run states, controls, modal/toast copy, stale progress warning, and recovery prompt behavior.
split_recommended: true
split_recommendation_reason: Source span S0026 contains several distinct GUI/runtime contracts; this unit covers run states and checkpoint payload.
depends_on: [CWF-026]
unblocks: []
acceptance_criteria:
  - Run states are idle, generating, reviewing, paused, cancelling, cancelled, interrupted, complete, and error.
  - Control row order is Pause, Resume, Cancel.
  - Cancel confirmation and resume/cancel toasts preserve the specified text.
  - Stale progress warning appears after 30 seconds without auto-cancel.
  - Recovery checkpoint preserves run_type, run_id, phase, step_index, document_index, total_documents, subagent_tasks_done, and checkpoint_version.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: progress_checkpoint_drift
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_run_states_control_checkpoint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0026
preserved_exact_tokens:
  - "idle"
  - "generating"
  - "reviewing"
  - "paused"
  - "cancelling"
  - "cancelled"
  - "interrupted"
  - "complete"
  - "error"
  - "Pause | Resume | Cancel"
  - "Progress stalled -- last update 30s ago"
  - "checkpoint_version"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-028 - Requirements Upload UI and Normalization

```yaml
plan_unit_id: CWF-028
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Requirements uploads allow up to ten ordered files, enforce a five MiB per-file limit, preserve originals byte-for-byte, normalize each upload into deterministic UTF-8 text projections, and exclude failed extraction files until replaced or removed.
gui_related: true
gui_classification_reason: Upload controls, list ordering, rejection messages, and file errors are user-visible requirements-step behavior.
split_recommended: false
depends_on: [CWF-021]
unblocks: [CWF-029, CWF-030, CWF-031]
acceptance_criteria:
  - Multiple file upload supports Add file plus remove/reorder controls.
  - Max upload count is 10.
  - Max file size per file is 5 MiB.
  - Merge order is UI list order with no primary/supplements distinction.
  - Original uploads are preserved byte-for-byte.
  - Canonical merge input is normalized UTF-8 text projection and never raw bytes.
  - PDF and DOCX extraction failures stay on the requirements step and exclude failed files until replaced or removed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: upload_normalization_drift
reasoning_tier: high
context_scope: requirements
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_requirements_upload_normalization
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0027
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0028
preserved_exact_tokens:
  - "10"
  - "5 MiB"
  - "list order"
  - "No \"primary\" vs \"supplements\""
  - "byte-for-byte"
  - "normalized UTF-8 text projection"
  - "never raw bytes"
  - "pdf"
  - "docx"
negative_constraints:
  - "Canonical merge input is never raw bytes."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-029 - Canonical Requirements Merge and Single Source

```yaml
plan_unit_id: CWF-029
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Requirements merging always concatenates normalized uploads and/or Builder output into canonical staging and promotion paths, uses exact separators and list order, performs no AI or rule-based conflict resolution, and makes Interview/start chain read only canonical_requirements_path.
gui_related: true
gui_classification_reason: Merge order, Builder combination, conflict handling, and canonical requirements status are user-visible wizard behavior.
split_recommended: false
depends_on: [CWF-028]
unblocks: [CWF-030, CWF-034]
acceptance_criteria:
  - Upload-only merge concatenates normalized text in UI list order.
  - Builder-only output promotes requirements-builder.md into project requirements.
  - Uploads plus Builder append Builder output after all uploads.
  - The exact separators for Requirements doc N and Requirements Doc Builder are preserved.
  - There is no conflicting-content merge and no AI/rule conflict resolution.
  - Interview and start chain read only canonical_requirements_path after promotion.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: requirements_merge_drift
reasoning_tier: high
context_scope: requirements
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_canonical_requirements_merge_single_source
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0029
preserved_exact_tokens:
  - "--- Requirements doc N ---"
  - "--- Requirements Doc Builder ---"
  - "uploads first"
  - "Builder output"
  - "canonical-requirements.md"
  - ".puppet-master/project/requirements.md"
  - "canonical_requirements_path"
negative_constraints:
  - "No AI merge."
  - "No rule-based conflict resolution."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-030 - Requirements Artifact Storage Paths

```yaml
plan_unit_id: CWF-030
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Requirements artifacts are represented in seglog/redb, stored under .puppet-master/requirements and .puppet-master/project paths with exact upload, normalized, Builder, contract seed, merge, and canonical requirements locations, while contract-seeds.md remains staging input and not the canonical project contract pack.
gui_related: false
gui_classification_reason: Storage events, paths, redb projections, and artifact ownership are backend storage contracts.
split_recommended: false
depends_on: [CWF-029]
unblocks: [CWF-034]
acceptance_criteria:
  - Requirements added, merged, or set canonical emit artifact events.
  - Projectors can mirror to JSONL and maintain redb projections.
  - Uploads, normalized projections, Builder output, contract seed pack, merged staging result, and canonical project requirements use the exact prescribed paths.
  - contract-seeds.md is staging input and not the canonical project contract pack.
  - Canonical project contracts live under .puppet-master/project/contracts/.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: requirements_storage_drift
reasoning_tier: high
context_scope: storage
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: chain_wizard_requirements_artifact_storage_paths
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0030
preserved_exact_tokens:
  - "seglog"
  - "redb"
  - ".puppet-master/requirements/uploaded/<sanitized_filename>"
  - ".puppet-master/requirements/normalized/<two_digit_index>-<sanitized_stem>.md"
  - ".puppet-master/requirements/requirements-builder.md"
  - ".puppet-master/requirements/contract-seeds.md"
  - ".puppet-master/requirements/canonical-requirements.md"
  - ".puppet-master/project/requirements.md"
  - ".puppet-master/project/contracts/"
negative_constraints:
  - "contract-seeds.md MUST NOT be treated as the canonical project contract pack."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-031 - Upload Limits and Merge Edge Constraints

```yaml
plan_unit_id: CWF-031
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Requirements upload edge cases are resolved by enforcing ten files, five MiB per file, upload-specific errors, no reference-only or sampling fallback, and always-concatenation merge semantics controlled by user ordering.
gui_related: true
gui_classification_reason: Limit rejection messages, upload-specific errors, and user-controlled reorder behavior are visible in the requirements UI.
split_recommended: false
depends_on: [CWF-028, CWF-029]
unblocks: []
acceptance_criteria:
  - Maximum number of uploads is 10 and shows Maximum 10 files.
  - Maximum file size is 5 MiB and oversized files are rejected before saving.
  - No reference-only or sampling mode exists for MVP.
  - Merge is always concatenation in defined order.
  - Users resolve content/order issues by reordering or removing files.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: upload_edge_case_drift
reasoning_tier: standard
context_scope: requirements
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_upload_limits_merge_edges
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0031
preserved_exact_tokens:
  - "Maximum 10 files."
  - "5 MiB"
  - "reference only"
  - "sampling"
  - "always concatenation"
negative_constraints:
  - "No reference-only or sampling fallback for MVP."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-032 - Builder Concept and Opening Prompts

```yaml
plan_unit_id: CWF-032
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Requirements Doc Builder is a conversation-first button in the requirements step with no questionnaire before first response, staged output until approval/handoff, and context-dependent opening prompts that the Assistant sends first.
gui_related: true
gui_classification_reason: Builder launch, opening prompts, and conversation-first flow are user-visible wizard and Assistant behavior.
split_recommended: false
depends_on: [CWF-021]
unblocks: [CWF-033, CWF-034]
acceptance_criteria:
  - Requirements Doc Builder opens Builder chat on the requirements/wizard page.
  - No questionnaire appears before the first user response.
  - Builder output remains staged until final approval and handoff.
  - Opening prompts preserve What are you building?, What are you adding or changing?, and What are you adding or changing in this fork?
  - The Assistant does not wait for the user to speak first.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_prompt_drift
reasoning_tier: standard
context_scope: builder
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: chain_wizard_builder_concept_opening_prompts
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0032
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0033
preserved_exact_tokens:
  - "Requirements Doc Builder"
  - "conversation-first flow"
  - "No questionnaire"
  - "What are you building?"
  - "What are you adding or changing?"
  - "What are you adding or changing in this fork?"
  - "does NOT wait"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-033 - Builder Conversation and Generation Trigger

```yaml
plan_unit_id: CWF-033
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Builder conversation counts completed turns only after Assistant message plus user response, may suggest generation when enough information exists or completed_turns reaches six, never auto-generates, and starts generation only after explicit user confirmation.
gui_related: false
gui_classification_reason: Turn counting and generation trigger semantics are conversation/runtime state rules rather than GUI layout or presentation.
split_recommended: false
depends_on: [CWF-032]
unblocks: [CWF-034, CWF-036]
acceptance_criteria:
  - One completed turn is one Assistant message plus one user response.
  - completed_turns increments only after user response arrives.
  - Assistant may suggest generation when it has enough information or completed_turns >= 6.
  - Suggestion text is confirmatory and does not auto-generate.
  - User can continue indefinitely until explicitly confirming generation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_trigger_drift
reasoning_tier: standard
context_scope: builder
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_builder_conversation_generation_trigger
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0034
preserved_exact_tokens:
  - "completed_turns"
  - "completed_turns >= 6"
  - "Would you like me to create the requirements doc?"
  - "does not auto-generate"
  - "explicit user confirmation"
negative_constraints:
  - "Generation starts only after explicit user confirmation."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-034 - Builder Handoff Artifacts and Packaging Gate

```yaml
plan_unit_id: CWF-034
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Builder handoff emits one requirements document plus a staging-only contract seed pack, persists paths/source/checklist/conversation/approval state, and packages qualifying .puppet-master/requirements outputs as verified Document Sets before handoff continues.
gui_related: false
gui_classification_reason: Builder output, handoff persistence, and packaging gate behavior are artifact and governance contracts.
split_recommended: true
split_recommendation_reason: Source span S0035 contains output format, seed template, state, and qualifying-question contracts; this unit covers artifact and packaging gate rules.
depends_on: [CWF-029, CWF-030, CWF-032, CWF-033]
unblocks: [CWF-035, CWF-036, CWF-037]
acceptance_criteria:
  - Builder produces one requirements document per generation run.
  - Builder emits .puppet-master/requirements/contract-seeds.md as staging input.
  - contract-seeds.md is not the canonical project contract pack.
  - Handoff state persists paths, source, checklist/conversation state, and approval stage.
  - Packaging triggers emit Document Sets and verify them per Document_Packaging_Policy before handoff continues.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_handoff_artifact_drift
reasoning_tier: high
context_scope: builder
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Document_Packaging_Policy.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_builder_handoff_artifacts_packaging_gate
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0035
preserved_exact_tokens:
  - ".puppet-master/requirements/contract-seeds.md"
  - "not the canonical project contract pack"
  - "ProjectContract:*"
  - "Document Sets"
  - "Gate:GATE-014"
negative_constraints:
  - "Builder contract-seeds.md must not be treated as the canonical project contract pack."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-035 - Builder Output and Contract Seed Templates

```yaml
plan_unit_id: CWF-035
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Builder output and contract seed pack templates require named top-level sections for requirements and contract seeds while allowing additional sections and validation warnings for missing required headings.
gui_related: false
gui_classification_reason: Template heading requirements are artifact structure and validation rules, not GUI presentation.
split_recommended: true
split_recommendation_reason: Source span S0035 contains output format, seed template, state, and qualifying-question contracts; this unit covers template heading requirements.
depends_on: [CWF-034]
unblocks: [CWF-036]
acceptance_criteria:
  - Requirements output preserves Scope, Goals, Out of scope, Acceptance criteria, and Non-goals headings.
  - Contract seed pack preserves Assumptions, Constraints, Glossary, and Non-functional budgets headings.
  - Additional sections such as Risks, Dependencies, and Constraints are allowed.
  - Implementations may validate and warn when required sections are missing.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_template_drift
reasoning_tier: standard
context_scope: builder
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_builder_templates
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0035
preserved_exact_tokens:
  - "Scope"
  - "Goals"
  - "Out of scope"
  - "Acceptance criteria"
  - "Non-goals"
  - "Assumptions"
  - "Constraints"
  - "Glossary"
  - "Non-functional budgets"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-036 - Builder State Contracts and Qualifying Questions

```yaml
plan_unit_id: CWF-036
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Builder tracks separate conversation and checklist state contracts, uses empty/thin/filled section statuses and requirements_doc or contract_seed_pack sources, and asks qualifying questions only for empty or thin checklist entries.
gui_related: false
gui_classification_reason: Builder state contracts and qualifying-question rules are backend conversation/checklist state behavior.
split_recommended: true
split_recommendation_reason: Source span S0035 contains output format, seed template, state, and qualifying-question contracts; this unit covers state contracts and question rules.
depends_on: [CWF-033, CWF-035]
unblocks: [CWF-037]
acceptance_criteria:
  - builder_conversation_state.v1 preserves session_id, completed_turns, last_suggestion_turn, awaiting_generation_confirmation, and awaiting_final_approval.
  - session_id format is PM-YYYY-MM-DD-HH-MM-SS-NNN.
  - builder_checklist_state.v1 preserves section_id, status, source, last_updated_event_id, and coverage_note.
  - Status values remain empty, thin, and filled.
  - Source values remain requirements_doc and contract_seed_pack.
  - Qualifying questions are asked only for empty or thin sections, not filled sections.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_state_drift
reasoning_tier: high
context_scope: builder
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_builder_state_contracts_questions
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0035
preserved_exact_tokens:
  - "builder_conversation_state.v1"
  - "PM-YYYY-MM-DD-HH-MM-SS-NNN"
  - "builder_checklist_state.v1"
  - "empty | thin | filled"
  - "requirements_doc | contract_seed_pack"
  - "empty"
  - "thin"
  - "filled"
negative_constraints:
  - "Do not ask follow-up questions for sections already marked filled."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-037 - Builder Staged Bundle Promotion Lifecycle

```yaml
plan_unit_id: CWF-037
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Builder promotion operates on staged bundle artifacts, with Accept, Reject, and Edit gates controlling promotion to accepted Builder artifacts and enabling Done -- hand off to Interview only when the bundle state is approved_for_handoff.
gui_related: false
gui_classification_reason: Promotion gates and staged bundle paths are artifact lifecycle behavior, not GUI layout.
split_recommended: false
depends_on: [CWF-034, CWF-036]
unblocks: [CWF-039, CWF-040]
acceptance_criteria:
  - Staged requirements, contract-seeds, and review-summary paths preserve the builder run_id directory.
  - Accept promotes staged requirements and contract seeds, updates canonical_requirements_path, and allows handoff.
  - Reject discards staged review output and preserves the last accepted Builder artifact.
  - Edit keeps user edits staged until the same Accept gate completes.
  - Done -- hand off to Interview is enabled only when bundle state is approved_for_handoff.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_promotion_drift
reasoning_tier: high
context_scope: builder
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_builder_staged_bundle_promotion
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0036
preserved_exact_tokens:
  - ".puppet-master/requirements/staging/builder/<run_id>/requirements.md"
  - ".puppet-master/requirements/staging/builder/<run_id>/contract-seeds.md"
  - ".puppet-master/requirements/staging/builder/<run_id>/review-summary.json"
  - "Accept"
  - "Reject"
  - "Edit"
  - "approved_for_handoff"
  - "Done -- hand off to Interview"
  - "builder_stage"
  - "builder_run_id"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-038 - Builder Dependencies and No Duplicate Rules

```yaml
plan_unit_id: CWF-038
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Requirements Doc Builder depends on Assistant chat plus current project path and intent, uses the shared rules pipeline, and does not duplicate interview-specific rules beyond producing a requirements document for handoff.
gui_related: false
gui_classification_reason: Dependencies and prompt-rule reuse are backend workflow and DRY constraints.
split_recommended: false
depends_on: [CWF-032]
unblocks: [CWF-039]
acceptance_criteria:
  - Assistant chat is implemented before Builder.
  - Assistant knows current project path and intent.
  - Builder uses the same rules pipeline as Assistant.
  - Builder prompt does not duplicate interview-specific rules beyond requirements-doc handoff.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_rules_drift
reasoning_tier: standard
context_scope: builder
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/agent-rules-context.md
node_compile_hint:
  mode: chain_wizard_builder_dependencies_no_duplicate_rules
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0037
preserved_exact_tokens:
  - "Assistant chat"
  - "current project path"
  - "intent"
  - "same rules pipeline"
  - "do not duplicate interview-specific rules"
negative_constraints:
  - "Do not duplicate interview-specific rules in the Builder prompt beyond producing a requirements doc for handoff."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-039 - Builder Bundle and Doc State Model

```yaml
plan_unit_id: CWF-039
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Builder document review uses canonical bundle-level and doc-level states for generation, review, targeted revision, approvals, final gate, completion, errors/interruption, and doc approval/revision badges.
gui_related: false
gui_classification_reason: Bundle/doc state model is runtime state contract; GUI rendering of later flows is covered by adjacent PlanUnits.
split_recommended: false
depends_on: [CWF-037, CWF-038]
unblocks: [CWF-040, CWF-041]
acceptance_criteria:
  - Bundle states preserve idle, generating, awaiting_user_review, revision_running, awaiting_approvals, ready_for_final_review, final_review_running, final_gate, complete, error, and interrupted.
  - Doc states preserve writing... to draft to approved plus draft to/from changes-requested.
  - needs-review may be used as a doc badge when helpful.
  - Bundle/doc state model uses storage-plan, FinalGUISpec, TargetedRevisionPass, and Crosswalk ContractRefs.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_doc_state_drift
reasoning_tier: high
context_scope: builder
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
  - Plans/Crosswalk.md
node_compile_hint:
  mode: chain_wizard_builder_bundle_doc_state_model
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0038
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0039
preserved_exact_tokens:
  - "idle"
  - "generating"
  - "awaiting_user_review"
  - "revision_running"
  - "awaiting_approvals"
  - "ready_for_final_review"
  - "final_review_running"
  - "final_gate"
  - "writing… -> draft -> approved"
  - "draft <-> changes-requested"
  - "needs-review"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-040 - Updated Builder Review Flow and Final Review Gate

```yaml
plan_unit_id: CWF-040
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Requirements Doc Builder review generates staged artifacts as a bundle, supports durable annotations and Resubmit with Annotations targeted revision, enables Run Final Review only after all docs are Approved/Done and no annotations remain open, and ends final review with Accept, Reject, or Edit.
gui_related: true
gui_classification_reason: This unit defines document-pane review flow, user buttons, final review gate, and workflow acceptance behavior.
split_recommended: false
depends_on: [CWF-039]
unblocks: [CWF-041, CWF-044]
acceptance_criteria:
  - Builder generates staged artifacts as a bundle into the Embedded Document Pane.
  - User can edit, create durable annotations, and run Resubmit with Annotations.
  - User marks each doc Approved/Done.
  - Run Final Review is enabled only when all docs are Approved/Done and no open annotations remain.
  - Multi-Pass Review runs once by default and ends with Accept, Reject, or Edit.
  - Resubmit with Annotations does not trigger Multi-Pass Review.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_review_gate_drift
reasoning_tier: high
context_scope: builder
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: chain_wizard_builder_review_flow_final_gate
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0040
preserved_exact_tokens:
  - "Resubmit with Annotations"
  - "Approved/Done"
  - "Run Final Review"
  - "Accept | Reject | Edit"
  - "MUST NOT trigger Multi-Pass Review"
negative_constraints:
  - "Resubmit with Annotations MUST NOT trigger Multi-Pass Review."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-041 - Targeted Revision Input Contract

```yaml
plan_unit_id: CWF-041
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Resubmit with Annotations accepts current docs plus open durable annotations in deterministic order, structured annotation operations and payloads, source-text anchors, bounded provenance, and preview-mode downgrade behavior when deterministic source mapping is unavailable.
gui_related: true
gui_classification_reason: Targeted revision input comes from document selection palettes, annotations, preview mode, and chat handoff UI.
split_recommended: true
split_recommendation_reason: Source span S0041 contains input, output, validation, and hard-rule contracts; this unit covers input shape.
depends_on: [CWF-040]
unblocks: [CWF-042, CWF-043]
acceptance_criteria:
  - Inputs include current doc contents and open durable annotations in deterministic order.
  - Annotation records include annotation_id, operation, intent_kind, selected anchor context, and operation_payload.
  - Operation values preserve comment, replace, insert_after, and remove.
  - Payload shapes preserve body, replacement_text, insert_text, and rationale forms.
  - Structured revision input is anchored to source text, not rendered visual tree.
  - Preview-mode unavailable source mapping downgrades durable structured changes to comment-only or chat/provenance flow.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: targeted_revision_input_drift
reasoning_tier: high
context_scope: targeted_revision
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Prompt_Pipeline.md
  - Plans/Permissions_System.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: chain_wizard_targeted_revision_input_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0041
preserved_exact_tokens:
  - "annotation_id"
  - "operation = comment | replace | insert_after | remove"
  - "intent_kind = question | change_request | both"
  - "operation_payload"
  - "source-of-truth anchored to source text"
  - "preview-mode selections"
  - "anchor.text_position"
  - "anchor.text_quote"
  - "provenance"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-042 - Targeted Revision Output and Validation Contract

```yaml
plan_unit_id: CWF-042
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Targeted revision output returns updated doc text, replies, and one ordered result record per input annotation, with runtime validation authoritative for addressed, still_open, cannot_apply, or unresolved transitions.
gui_related: true
gui_classification_reason: Targeted revision results drive visible annotation lifecycle, document updates, and status transitions.
split_recommended: true
split_recommendation_reason: Source span S0041 contains input, output, validation, and hard-rule contracts; this unit covers output and validation.
depends_on: [CWF-041]
unblocks: [CWF-043, CWF-044]
acceptance_criteria:
  - Output includes updated doc text for modified docs and replies for question/comment annotations.
  - One result record is returned per input annotation in the same order.
  - Outcome values preserve addressed, still_open, and cannot_apply.
  - Output records preserve addressed_explanation, updated_anchor, and failure_code fields.
  - Runtime, not the model, is authoritative for status transitions.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: targeted_revision_output_drift
reasoning_tier: high
context_scope: targeted_revision
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Crosswalk.md
node_compile_hint:
  mode: chain_wizard_targeted_revision_output_validation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0041
preserved_exact_tokens:
  - "addressed | still_open | cannot_apply"
  - "addressed_explanation"
  - "updated_anchor?"
  - "failure_code?"
  - "same order"
  - "runtime, not the model"
negative_constraints:
  - "Partial success is represented per annotation rather than by a bundle-level vague success."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-043 - Targeted Revision Hard Rules and Capability Modes

```yaml
plan_unit_id: CWF-043
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Targeted revision may answer questions without changing docs, must not trigger Multi-Pass Review, excludes conflicting or stale mutating annotations, allows one retry on structured validation failure, exposes requested/effective capability, preserves non-blocking tags, and does not introduce direct patch-apply semantics.
gui_related: true
gui_classification_reason: Revision hard rules and capability disclosure affect document review UI, annotation handling, and chat handoff behavior.
split_recommended: true
split_recommendation_reason: Source span S0041 contains input, output, validation, and hard-rule contracts; this unit covers hard rules and capability modes.
depends_on: [CWF-041, CWF-042]
unblocks: [CWF-044]
acceptance_criteria:
  - Targeted revision does not trigger Multi-Pass Review.
  - It may answer questions without changing docs.
  - Conflicting or stale mutating annotations are excluded until resolved.
  - One automatic retry is allowed on structured validation failure before explicit degrade/fail.
  - Capability modes preserve schema_enforced_structured_revision, validated_structured_revision, and chat_handoff_only.
  - Non-blocking tags and no direct patch-apply semantics are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: targeted_revision_hard_rule_drift
reasoning_tier: high
context_scope: targeted_revision
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: chain_wizard_targeted_revision_hard_rules_capabilities
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0041
preserved_exact_tokens:
  - "MUST NOT trigger Multi-Pass Review"
  - "MAY answer questions"
  - "Conflicting or stale mutating annotations"
  - "one automatic retry"
  - "schema_enforced_structured_revision"
  - "validated_structured_revision"
  - "chat_handoff_only"
  - "/structured-output"
  - "/order/shape"
  - "patch-apply"
negative_constraints:
  - "Do not introduce direct patch-apply semantics."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-044 - Workflow Acceptance and Legacy Label Compatibility

```yaml
plan_unit_id: CWF-044
unit_type: validation_rule
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Document review workflow acceptance preserves selection-palette operations, Send selection to chat chips, deterministic re-anchoring with explicit anchor_not_found, Resubmit with Annotations targeted revision, Resubmit with Notes as a legacy label for the same pass, and the final-review gate.
gui_related: true
gui_classification_reason: This unit defines user-visible selection palette, chat chip, legacy label, annotation lifecycle, and final review gating behavior.
split_recommended: false
depends_on: [CWF-040, CWF-041, CWF-042, CWF-043]
unblocks: []
acceptance_criteria:
  - Selection palette creates durable annotations for Comment, Replace, Insert after, and Remove.
  - Send selection to chat creates a thread-scoped composer chip in the owning chat surface.
  - Durable annotations persist and re-anchor deterministically.
  - anchor_not_found remains explicit and never silent.
  - Resubmit with Notes is a legacy UI label for the same targeted pass.
  - Final review cannot run until all docs are Approved/Done and no annotations remain open.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: review_workflow_acceptance
reasoning_tier: standard
context_scope: targeted_revision
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: chain_wizard_review_acceptance_legacy_label
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0042
preserved_exact_tokens:
  - "Comment"
  - "Replace"
  - "Insert after"
  - "Remove"
  - "Send selection to chat"
  - "anchor_not_found"
  - "Resubmit with Notes"
  - "open -> addressed -> resolved"
  - "Final review cannot run"
compatibility_only_notes:
  - "Resubmit with Notes is a legacy UI label for the same targeted pass."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-045 - Multi-Pass Final Review Gate

```yaml
plan_unit_id: CWF-045
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Multi-Pass Review is the Requirements Doc Builder final-review action,
  enabled only when all bundle docs are Approved/Done, no annotations remain
  open, and the user explicitly clicks Run Final Review; it never auto-runs or
  replaces targeted revision.
gui_related: true
gui_classification_reason: This unit defines the user-visible Run Final Review gate and document-review controls.
split_recommended: false
depends_on: [CWF-040, CWF-044]
unblocks: []
acceptance_criteria:
  - Run Final Review is enabled only after all docs are Approved/Done.
  - Question/comment annotations count as open until the user resolves them.
  - The user must explicitly click Run Final Review.
  - Multi-Pass Review must not auto-run when conditions become true.
  - Send selection to chat chips do not satisfy or bypass the final-review gate.
  - Targeted revision and final review keep separate runtime actions and audit trails.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: review_gate_drift
reasoning_tier: high
context_scope: requirements_builder_review
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/Crosswalk.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
  - Plans/MiscPlan.md
node_compile_hint:
  mode: chain_wizard_multipass_final_review_gate
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0043
preserved_exact_tokens:
  - "Multi-Pass Review"
  - "final-review"
  - "Approved/Done"
  - "no open annotations"
  - "Run Final Review"
  - "Must not auto-run"
  - "Send selection to chat"
  - "safe-point lineage"
negative_constraints:
  - "Multi-Pass Review must not auto-run when gate conditions become true."
  - "Send selection to chat chips do not satisfy or bypass the final-review gate."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/Crosswalk.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
  - Plans/MiscPlan.md
```

### CWF-046 - Contract Layer Two-Layer Boundary

```yaml
plan_unit_id: CWF-046
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The wizard inserts a Contract Layer between requirements and execution, with
  Platform Contracts referenced only by stable names or IDs and Project
  Contracts generated per user project under Project Contract Pack IDs.
gui_related: false
gui_classification_reason: Contract routing and owner boundaries are backend/governance behavior, not GUI implementation work.
split_recommended: true
split_recommendation_reason: Source span S0044 contains boundary, artifact, storage, and validation rules; this unit covers only the two-layer contract boundary.
depends_on: [CWF-035]
unblocks: [CWF-047, CWF-048, CWF-056, CWF-057]
acceptance_criteria:
  - Requirements flow through Project Contract Pack before plan.md, plan_graph, and execution.
  - Platform Contracts remain Puppet Master SSOT docs referenced by stable name or ID only.
  - User-project artifacts do not copy internal Plans schemas or docs into the user project.
  - Project Contracts are generated per user project under .puppet-master/project/contracts/ and referenced by stable ProjectContract IDs.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary_drift
reasoning_tier: high
context_scope: contract_layer
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
  - Plans/Tools.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Crosswalk.md
  - Plans/DRY_Rules.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_contract_layer_two_layer_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0044
preserved_exact_tokens:
  - "Contract Layer"
  - "requirements.md"
  - "Project Contract Pack"
  - "plan.md"
  - "plan_graph/"
  - "Platform Contracts"
  - "Project Contracts"
  - "ProjectContract:*"
  - "ContractName:*"
  - "SchemaID:*"
negative_constraints:
  - "Do not copy internal Plans schemas/docs into user projects."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Contracts_V0.md
```

### CWF-047 - Contract Artifact Materialization and Storage

```yaml
plan_unit_id: CWF-047
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Project contract artifacts materialize under .puppet-master/project/, while
  .puppet-master/requirements/contract-seeds.md remains staging input and seglog
  remains the canonical source with regenerable filesystem projections.
gui_related: false
gui_classification_reason: Artifact materialization and storage projection rules are backend persistence behavior.
split_recommended: true
split_recommendation_reason: Source span S0044 contains boundary, artifact, storage, and validation rules; this unit covers artifact location and storage semantics.
depends_on: [CWF-046]
unblocks: [CWF-048, CWF-058, CWF-060]
acceptance_criteria:
  - Required user-project artifacts materialize under .puppet-master/project/.
  - .puppet-master/requirements/contract-seeds.md remains a staging input for contract unification.
  - Canonical artifact truth is persisted in seglog with full-content artifact events and sha256 integrity.
  - Filesystem copies are materializations or cache and must be regenerable from seglog.
  - redb projections and Tantivy indexing expose artifacts by logical path, artifact type, contract IDs, and content search.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: artifact_storage_drift
reasoning_tier: high
context_scope: project_artifact_storage
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: chain_wizard_contract_artifact_materialization_storage
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0044
preserved_exact_tokens:
  - ".puppet-master/project/"
  - ".puppet-master/requirements/contract-seeds.md"
  - "staging input"
  - "Canonical source of truth is seglog"
  - "sha256"
  - "redb"
  - "Tantivy"
  - "materializations/cache"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/storage-plan.md
```

### CWF-048 - Contract DRY Validation Gate

```yaml
plan_unit_id: CWF-048
unit_type: validation_rule
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Execution nodes reference resolvable ProjectContract IDs through
  contract_refs, acceptance checks resolve through acceptance_manifest.json,
  evidence outputs use schema IDs, and headless execution must work from project
  artifacts alone.
gui_related: false
gui_classification_reason: Contract reference validation is backend/governance behavior.
split_recommended: true
split_recommendation_reason: Source span S0044 contains boundary, artifact, storage, and validation rules; this unit covers DRY validation gates.
depends_on: [CWF-046, CWF-047]
unblocks: [CWF-058, CWF-060]
acceptance_criteria:
  - Every plan node contains contract_refs with at least one resolvable ProjectContract ID via contracts/index.json.
  - Every node shard acceptance check_id is present in acceptance_manifest.json.
  - Evidence outputs point to .puppet-master/project/evidence/<node_id>.json with schema pm.evidence.schema.v1.
  - Orchestrator can execute headlessly from .puppet-master/project/ artifacts alone.
  - HITL-blocked nodes do not prevent non-blocked schedulable work from continuing where dependencies allow.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dry_contract_drift
reasoning_tier: high
context_scope: project_contract_validation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: chain_wizard_contract_dry_validation_gate
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0044
preserved_exact_tokens:
  - "contract_refs: [\"ProjectContract:...\"]"
  - "contracts/index.json"
  - "Canonical source: ProjectContract:<...>"
  - "acceptance[].check_id"
  - "acceptance_manifest.json"
  - "pm.evidence.schema.v1"
  - ".puppet-master/project/evidence/<node_id>.json"
negative_constraints:
  - "Execution nodes must not embed contract content inline."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Contracts_V0.md
```

### CWF-049 - Adaptive Interview Phase Selection Goal

```yaml
plan_unit_id: CWF-049
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Adaptive Interview chooses which phases to cut, shorten, or double down on so
  New Project, Fork & Evolve, Enhance/Rewrite/Add, and Contribute PR receive
  appropriate depth.
gui_related: false
gui_classification_reason: Interview phase selection goals are workflow behavior rather than GUI presentation.
split_recommended: false
depends_on: [CWF-005, CWF-010]
unblocks: [CWF-050, CWF-051, CWF-052]
acceptance_criteria:
  - Adaptive Interview can cut phases.
  - Adaptive Interview can shorten phases.
  - Adaptive Interview can double down on phases where more depth is appropriate.
  - Full products, PR contributions, and fork/evolve work receive intent-appropriate interview depth.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: interview_depth_drift
reasoning_tier: standard
context_scope: adaptive_interview
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: chain_wizard_adaptive_interview_phase_goal
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0045
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0046
preserved_exact_tokens:
  - "Adaptive Interview Phases"
  - "cut"
  - "shorten"
  - "double down on"
  - "full product"
  - "PR contribution"
  - "fork/evolve"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
```

### CWF-050 - Scope Probe and Depth Enforcement

```yaml
plan_unit_id: CWF-050
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Phase 0 always runs a mandatory max-two-question scope probe before phase
  selection, and phase depth enforces Full, Short, or Skip using question-count
  caps and force-complete behavior.
gui_related: false
gui_classification_reason: Scope probe and depth enforcement are interview runtime behavior, not GUI presentation.
split_recommended: true
split_recommendation_reason: Source spans S0047 and S0066 contain mechanism plus gap-resolution details; this unit covers scope-probe and depth enforcement.
depends_on: [CWF-049]
unblocks: [CWF-051, CWF-052]
acceptance_criteria:
  - Phase 0 is mandatory and not skippable.
  - Scope probe asks at most two questions before phase selector invocation.
  - Short means max 2 questions and no research tool calls.
  - Full means all questions in the phase template plus research tool calls when needed.
  - Skip means phase questions, research, and document generation are not run.
  - If max is reached without phase completion, the runner asks the agent to wrap up and may force-complete with phase.force_completed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: phase_enforcement_drift
reasoning_tier: high
context_scope: adaptive_interview
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: chain_wizard_scope_probe_depth_enforcement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0047
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0066
preserved_exact_tokens:
  - "phase 0"
  - "interview.scope_probe.max_questions"
  - "Short"
  - "Full"
  - "Skip"
  - "phase.force_completed"
  - "Please wrap up this phase"
  - "max + 1"
compatibility_only_notes:
  - "Legacy source references to phase.config.max_questions normalize to interview.phases.{phase_name}.max_questions or the global interview.max_questions_per_phase."
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
```

### CWF-051 - Phase Selector Contract and Normalization

```yaml
plan_unit_id: CWF-051
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The phase selector consumes intent, requirements summary, optional codebase
  summary, and has_gui, then persists a normalized ordered eight-entry
  Vec<PhasePlanEntry> with invalid duplicate or unknown phases falling back
  safely.
gui_related: false
gui_classification_reason: Phase selector input/output and normalization are runtime contract behavior.
split_recommended: true
split_recommendation_reason: Source span S0048 contains selector contract, fallback, persistence, resume, and UI override controls; this unit covers selector schema and normalization.
depends_on: [CWF-049, CWF-050]
unblocks: [CWF-052, CWF-053]
acceptance_criteria:
  - Selector input preserves intent, requirements_summary, codebase_summary, and has_gui.
  - Phase registry preserves the ordered eight canonical phase IDs.
  - Output uses phase_plan as Vec<PhasePlanEntry> with phase_id and depth.
  - Array order is execution order.
  - Duplicate and unknown phase IDs are invalid and cause selector failure fallback.
  - Omitted registry phases normalize to Skip before persistence.
  - Persisted plan is the phase manager normalizer output, even when an AI recommendation is obtained.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: selector_schema_drift
reasoning_tier: high
context_scope: adaptive_interview
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: chain_wizard_phase_selector_contract_normalization
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0048
preserved_exact_tokens:
  - "NewProject"
  - "ForkAndEvolve"
  - "EnhanceRewriteAdd"
  - "ContributePr"
  - "requirements_summary"
  - "first 2000 characters"
  - "codebase_summary"
  - "has_gui"
  - "Vec<PhasePlanEntry>"
  - "Full | Short | Skip"
negative_constraints:
  - "No separate selector-only provider/model contract is required for MVP."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
```

### CWF-052 - Phase Plan Persistence Fallback and Resume

```yaml
plan_unit_id: CWF-052
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Phase plans persist with source and override metadata, selector failures use
  the canonical fallback table without re-invocation, resume never reruns
  selection, and failures emit phase_selector.fallback.
gui_related: false
gui_classification_reason: Phase plan persistence, fallback, and resume are runtime state behavior.
split_recommended: true
split_recommendation_reason: Source spans S0048 and S0066 contain persistence, fallback, and resume behavior; this unit covers deterministic replay.
depends_on: [CWF-050, CWF-051]
unblocks: [CWF-053]
acceptance_criteria:
  - ContributePr fallback uses Short for scope_goals, architecture_technology, and testing_verification and Skip for all other phases.
  - NewProject, ForkAndEvolve, and EnhanceRewriteAdd fallback to all phases Full.
  - Phase plan persists in interview state or .puppet-master/interview/phase_plan.json.
  - phase_override_mode and phase_plan_source persist for audit and replay.
  - Resume loads the stored phase_plan and does not rerun the phase selector.
  - Selector failures log phase_selector.fallback with original error and normalized fallback plan.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: resume_nondeterminism
reasoning_tier: high
context_scope: adaptive_interview_state
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: chain_wizard_phase_plan_persistence_fallback_resume
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0048
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0066
preserved_exact_tokens:
  - ".puppet-master/interview/phase_plan.json"
  - "phase_override_mode"
  - "phase_plan_source"
  - "selector | fallback | run_all | manual_checklist"
  - "phase_selector.fallback"
  - "Never synthesize an ad-hoc phase subset outside the canonical fallback table."
negative_constraints:
  - "Do not re-invoke selector when fallback is selected."
  - "Do not rerun phase selection on resume."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
```

### CWF-053 - Phase Override Controls

```yaml
plan_unit_id: CWF-053
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The Interview UI exposes a default-off Run all phases checkbox and an ordered
  phase checklist whose manual edits persist into the normalized phase plan.
gui_related: true
gui_classification_reason: This unit defines user-visible checkbox and checklist controls for Interview phase overrides.
split_recommended: true
split_recommendation_reason: Source spans S0048, S0050, and S0066 mix runtime phase persistence with user override controls; this unit covers the GUI override surface.
depends_on: [CWF-051, CWF-052]
unblocks: []
acceptance_criteria:
  - Run all phases is a GUI checkbox.
  - Run all phases defaults off.
  - When Run all phases is on, all registry phases run at Full depth.
  - Phase checklist shows the ordered registry with checkboxes.
  - Unchecked checklist entries force Skip.
  - Manual edits persist as the next normalized phase_plan.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: override_ui_drift
reasoning_tier: standard
context_scope: adaptive_interview_ui
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: chain_wizard_phase_override_controls
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0048
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0050
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0066
preserved_exact_tokens:
  - "Run all phases"
  - "default off"
  - "ordered registry"
  - "checkboxes"
  - "Unchecked = force `Skip`"
  - "Manual edits persist"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/interview-subagent-integration.md
```

### CWF-054 - Interview Subagent Compatibility Boundary

```yaml
plan_unit_id: CWF-054
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Adaptive phases select which existing Interview subagents and
  document/research subagents run without changing subagent ownership or phase
  assignment semantics.
gui_related: false
gui_classification_reason: This is a subagent ownership and compatibility boundary, not GUI presentation.
split_recommended: false
depends_on: [CWF-049, CWF-051]
unblocks: []
acceptance_criteria:
  - Phase subagents remain in place.
  - Document generation subagents still apply to phases that run.
  - Research and validation subagents still apply to phases that run.
  - interview-subagent-integration.md records adaptive phases as intent and context driven phase selection and depth.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: subagent_boundary_drift
reasoning_tier: standard
context_scope: interview_subagents
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: chain_wizard_interview_subagent_compatibility_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0049
preserved_exact_tokens:
  - "product-manager"
  - "architect-reviewer"
  - "Document generation"
  - "research/validation"
  - "Adaptive phases: intent and context drive phase selection and depth"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
```

### CWF-055 - Adaptive Selection Determinism Risk

```yaml
plan_unit_id: CWF-055
unit_type: risk
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Adaptive phase selection must surface determinism risk and may be cached by
  intent plus requirements_hash or made rule-based with optional AI
  recommendation.
gui_related: false
gui_classification_reason: Determinism and caching strategy are runtime policy concerns.
split_recommended: false
depends_on: [CWF-051, CWF-052]
unblocks: []
acceptance_criteria:
  - Determinism risk remains explicit for AI-driven phase selection.
  - Same intent and requirements_hash may be used as a cache key.
  - Rule-based selection with optional AI override remains an allowed mitigation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: nondeterministic_phase_plan
reasoning_tier: standard
context_scope: adaptive_interview
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: chain_wizard_adaptive_selection_determinism_risk
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0050
preserved_exact_tokens:
  - "Determinism"
  - "AI-driven"
  - "(intent, requirements_hash)"
  - "rule-based with optional AI override"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
```

### CWF-056 - Per-Phase Contract Fragments

```yaml
plan_unit_id: CWF-056
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Adaptive Interview phases emit structured contract fragments for scope,
  architecture, product/UX, data, security, deployment, performance, and
  testing, including UI wiring fragments when the user project has a GUI.
gui_related: true
gui_classification_reason: Product/UX phases may emit UI wiring fragments for user-project GUI surfaces.
split_recommended: false
depends_on: [CWF-046, CWF-049]
unblocks: [CWF-057, CWF-058, CWF-059]
acceptance_criteria:
  - Each adaptive interview phase can contribute structured, citable contract fragments.
  - Scope & Goals feeds contract seeds and acceptance checks.
  - Architecture & Technology feeds API, module, and command contracts.
  - Product / UX feeds interface and acceptance contracts.
  - GUI projects also emit UI wiring fragments with interactive-element inventory, preliminary UICommandID assignments, and UI-to-handler mapping seeds.
  - Testing & Verification feeds acceptance_manifest.json and node acceptance arrays.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: fragment_coverage_drift
reasoning_tier: high
context_scope: adaptive_interview_contracts
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: chain_wizard_per_phase_contract_fragments
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0051
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0052
preserved_exact_tokens:
  - "contract fragments"
  - "Scope & Goals"
  - "Architecture & Technology"
  - "Product / UX"
  - "Data & Persistence"
  - "Security & Secrets"
  - "Deployment & Environments"
  - "Performance & Reliability"
  - "Testing & Verification"
  - "UICommandID"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-057 - Contract Unification Ownership and Conflict Handling

```yaml
plan_unit_id: CWF-057
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The wizard pipeline owns the deterministic Contract Unification Pass after
  Interview completion and before plan generation, merging fragments or blocking
  with blocked_reason equal to contract_conflict.
gui_related: false
gui_classification_reason: Contract unification ownership and conflict handling are pipeline behavior.
split_recommended: true
split_recommendation_reason: Source span S0053 contains ownership, artifact materialization, GUI wiring, and large-output rules; this unit covers ownership and conflict handling.
depends_on: [CWF-056]
unblocks: [CWF-058, CWF-059, CWF-060]
acceptance_criteria:
  - Contract Unification Pass runs after interview status transitions to completed.
  - Contract Unification Pass runs before plan generation begins.
  - Wizard pipeline owns the pass.
  - The pass merges fragments into one coherent contract document with conflict resolution notes.
  - Unresolved deterministic conflicts transition the wizard to blocked with blocked_reason = contract_conflict.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: unification_phase_boundary
reasoning_tier: high
context_scope: contract_unification
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_contract_unification_ownership_conflict
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0053
preserved_exact_tokens:
  - "Contract Unification Pass"
  - "wizard pipeline"
  - "interview status transitions to `completed`"
  - "blocked_reason = contract_conflict"
  - "not a post-processing afterthought"
negative_constraints:
  - "The Contract Unification Pass is not owned by the interview loop."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-058 - Project Artifact Pack and Sharded Graph Materialization

```yaml
plan_unit_id: CWF-058
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Contract Unification materializes required .puppet-master/project/ artifacts
  exactly per Project_Output_Artifacts, including contracts, sharded plan_graph,
  acceptance manifest, and contract-referenced plan.md.
gui_related: false
gui_classification_reason: User-project artifact pack and sharded graph materialization are backend artifact contracts.
split_recommended: true
split_recommendation_reason: Source span S0053 contains ownership, artifact materialization, GUI wiring, and large-output rules; this unit covers project artifact materialization.
depends_on: [CWF-047, CWF-048, CWF-057]
unblocks: [CWF-059, CWF-060]
acceptance_criteria:
  - Contract unification assigns stable namespaced deterministic ProjectContract IDs.
  - Required output includes contracts/ and contracts/index.json.
  - Required output includes canonical sharded plan_graph/ with index.json and nodes/<node_id>.json.
  - acceptance_manifest.json is materialized.
  - plan.md remains a human-readable view that references contract IDs.
  - plan_graph.monolithic.json may be materialized only as an optional non-canonical convenience export.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: sharded_graph_drift
reasoning_tier: high
context_scope: project_artifact_pack
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_project_artifact_pack_sharded_graph
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0053
preserved_exact_tokens:
  - "ProjectContract:*"
  - "contracts/index.json"
  - "plan_graph/"
  - "index.json"
  - "nodes/<node_id>.json"
  - "edges.json"
  - "acceptance_manifest.json"
  - "plan_graph.monolithic.json"
compatibility_only_notes:
  - "plan_graph.monolithic.json is optional, derived, and non-canonical."
negative_constraints:
  - "Validators and orchestrator MUST use sharded plan_graph/ as the execution source of truth."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-059 - GUI Project Wiring Artifacts

```yaml
plan_unit_id: CWF-059
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  When has_gui is true, Contract Unification emits
  .puppet-master/project/ui/wiring_matrix.json and ui_command_catalog.json, and
  UI-scope plan nodes carry wiring or catalog ContractRefs.
gui_related: true
gui_classification_reason: This unit defines generated UI wiring artifacts and GUI-scope validation for user projects with graphical interfaces.
split_recommended: true
split_recommendation_reason: Source spans S0053 and S0054 mix project artifact materialization, GUI wiring, and validation gates; this unit covers GUI wiring artifacts.
depends_on: [CWF-056, CWF-058]
unblocks: [CWF-060]
acceptance_criteria:
  - has_gui true causes Contract Unification to generate .puppet-master/project/ui/wiring_matrix.json.
  - has_gui true causes Contract Unification to generate ui/ui_command_catalog.json.
  - wiring_matrix entries map interactive UI elements to UICommandID, handler, expected events, acceptance checks, and evidence requirements.
  - Project-local schema adaptation preserves Wiring_Matrix schema shape while using project module paths for handler_location and ui_location.
  - UI-scope plan graph nodes include contract_refs for relevant wiring matrix entries or command catalog IDs.
  - Dry-run validation enforces catalog-matrix coverage and no unbound actions when has_gui is true.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: ui_wiring_gap
reasoning_tier: high
context_scope: user_project_gui_wiring
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: chain_wizard_gui_project_wiring_artifacts
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0053
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0054
preserved_exact_tokens:
  - ".puppet-master/project/ui/"
  - "ui/wiring_matrix.json"
  - "ui/ui_command_catalog.json"
  - "UICommandID"
  - "handler_location"
  - "ui_location"
  - "desktop, web, or mobile"
  - "catalog↔matrix coverage"
negative_constraints:
  - "When has_gui is true, dry-run validation must not allow unbound actions."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
```

### CWF-060 - Large Output and Dry-Run Validation

```yaml
plan_unit_id: CWF-060
unit_type: validation_rule
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Contract packs may be chunked with contracts/index.json as the resolver,
  seglog chunking preserves sha256 integrity, and dry-run validation gates
  execution on schema, deterministic ID, contract, graph, and acceptance
  coverage.
gui_related: false
gui_classification_reason: Large-output chunking and dry-run validation are backend artifact validation behavior.
split_recommended: true
split_recommendation_reason: Source spans S0053 and S0054 contain large-output handling and validation rules; this unit covers non-GUI validation.
depends_on: [CWF-047, CWF-048, CWF-058]
unblocks: []
acceptance_criteria:
  - Contract pack chunks remain resolvable through contracts/index.json.
  - Seglog artifact persistence supports deterministic chunking with sha256 integrity events.
  - Dry-run validation enforces artifact presence and schema validity.
  - Dry-run validation enforces deterministic node IDs.
  - Dry-run validation enforces ProjectContract resolvability and acceptance-manifest coverage.
  - Derived monolithic graph exports validate only as consistency exports and never as canonical sources.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_false_pass
reasoning_tier: high
context_scope: project_artifact_validation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: chain_wizard_large_output_dry_run_validation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0053
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0054
preserved_exact_tokens:
  - "contracts/index.json"
  - "deterministic chunking"
  - "sha256"
  - "dry-run validator"
  - "ProjectContract:* resolvability"
  - "acceptance-manifest coverage"
negative_constraints:
  - "If plan_graph.monolithic.json is materialized, validate it only as a derived consistency export and never canonical."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-061 - GitHub Create Repo Setup Flow

```yaml
plan_unit_id: CWF-061
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Project setup for New Project supports actual GitHub repository creation with
  repo name, visibility, optional metadata, HTTPS API create flow, remote setup,
  and optional initial push.
gui_related: true
gui_classification_reason: Repository setup fields and Create action are user-visible wizard controls.
split_recommended: false
depends_on: [CWF-006, CWF-022]
unblocks: [CWF-065]
acceptance_criteria:
  - New Project setup includes an optional Create GitHub repo step.
  - Required field is repository name.
  - Visibility supports Public and Private.
  - Optional fields include description, .gitignore template, license, and default branch name where supported by the GitHub API contract.
  - Create action calls the GitHub HTTPS API create-repo flow.
  - Successful creation sets the remote and may push an initial commit.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: github_create_flow_drift
reasoning_tier: standard
context_scope: github_setup
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_github_create_repo_setup
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0055
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0056
preserved_exact_tokens:
  - "Create GitHub repo"
  - "Repository name"
  - "Public | Private"
  - ".gitignore template"
  - "license"
  - "default branch name"
  - "origin"
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/FinalGUISpec.md
```

### CWF-062 - Fork Creation vs User-Provided Fork

```yaml
plan_unit_id: CWF-062
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Fork & Evolve and Contribute PR offer Create fork for me through GitHub API
  or I'll create the fork myself with fork URL or path validation and explicit
  fork_created_by_app state.
gui_related: true
gui_classification_reason: Fork choice, buttons, instructions, and URL/path fields are user-visible wizard controls.
split_recommended: false
depends_on: [CWF-007, CWF-009, CWF-022]
unblocks: [CWF-063, CWF-064, CWF-065]
acceptance_criteria:
  - User supplies upstream repo as URL or owner/repo.
  - Create fork for me calls the GitHub HTTPS API fork/create flow.
  - App-created fork resolves clone URL, clones to chosen project path, sets working project, optionally sets upstream remote, and stores fork_created_by_app true.
  - I'll create the fork myself shows instructions, accepts fork URL or local path, avoids fork/create API, and stores fork_created_by_app false.
  - User-provided fork path or URL is validated as a git repo.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: fork_path_drift
reasoning_tier: standard
context_scope: github_fork_flow
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_fork_creation_user_provided_fork
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0057
preserved_exact_tokens:
  - "Fork & evolve"
  - "Contribute (PR)"
  - "URL or `owner/repo`"
  - "Create fork for me"
  - "I'll create the fork myself"
  - "fork_url_or_path"
  - "fork_created_by_app: true"
  - "fork_created_by_app: false"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
```

### CWF-063 - PR Start Feature Branch Flow

```yaml
plan_unit_id: CWF-063
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Contribute PR starts by resolving fork, clone, and one feature branch in the
  main fork clone, with user-provided or suggested branch naming before
  Interview or orchestrator work begins.
gui_related: true
gui_classification_reason: Feature branch creation is exposed through user-visible wizard controls and branch-name input.
split_recommended: true
split_recommendation_reason: Source span S0058 covers both PR start UI and worktree boundary rules; this unit covers start and branch creation.
depends_on: [CWF-062]
unblocks: [CWF-064, CWF-066]
acceptance_criteria:
  - Contribute PR start offers fork, clone, and feature branch setup.
  - If the app created the fork, it clones the fork to the chosen path.
  - If the user provided fork path or URL, the app uses or clones that source.
  - Feature branch name may be user-provided or suggested from intent and requirements.
  - Create feature branch control runs git checkout -b or equivalent before continuing.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: pr_start_drift
reasoning_tier: standard
context_scope: pr_start_flow
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/WorktreeGitImprovement.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_pr_start_feature_branch
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0058
preserved_exact_tokens:
  - "fork -> clone -> create a feature branch"
  - "feature/add-x"
  - "fix/issue-42"
  - "feature/"
  - "Create feature branch"
  - "git checkout -b <branch>"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/WorktreeGitImprovement.md
```

### CWF-064 - PR Finish and Default Branch Targeting

```yaml
plan_unit_id: CWF-064
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  PR finish offers commit, push, and Open PR via GitHub HTTPS API, fetching
  upstream default_branch instead of assuming main or master, and linking the
  created PR.
gui_related: true
gui_classification_reason: Commit, push, Open PR, self-service instructions, and PR links are user-visible controls and outputs.
split_recommended: true
split_recommendation_reason: Source spans S0059 and S0067 cover PR finish controls, API behavior, and default branch gap resolution; this unit covers finish and target branch selection.
depends_on: [CWF-063]
unblocks: [CWF-065]
acceptance_criteria:
  - Finish flow offers commit with user-provided or suggested commit message.
  - Finish flow offers push to current branch on the fork remote.
  - Open PR uses GitHub HTTPS API from the fork branch to upstream default branch.
  - Upstream default_branch is fetched through GitHub API before creating the PR.
  - UI links to the created PR.
  - User may choose to commit and open the PR themselves with instructions and optional Compare & pull request link.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wrong_pr_target
reasoning_tier: high
context_scope: pr_finish_flow
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_pr_finish_default_branch_target
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0059
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0067
preserved_exact_tokens:
  - "Commit"
  - "Push"
  - "Open PR"
  - "GET /repos/{owner}/{repo}"
  - "default_branch"
  - "Do not hardcode `main` or `master`."
  - "Compare & pull request"
  - "What's a PR?"
negative_constraints:
  - "Do not assume upstream default branch is main or master."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
```

### CWF-065 - GitHub Auth Scopes Rate Limits and Host Scope

```yaml
plan_unit_id: CWF-065
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  GitHub create, fork, and PR flows require documented scopes,
  OS-credential-store auth, permission and rate-limit surfacing, GitHub-only MVP
  scope, explicit organization-fork destination selection and preflight, and typed unsupported-host
  outcomes for GitLab or Bitbucket. The retired source-lineage phrase `MVP = user fork only` no
  longer constrains the active organization-fork path; `read:org` is required when organization fork
  destination discovery or permission checks are enabled.
gui_related: true
gui_classification_reason: Permission errors, rate-limit messages, setup/doctor documentation, and future host options are user-visible surfaces.
split_recommended: true
split_recommendation_reason: Source spans S0059-S0061 and S0067 mix auth, no-secret, host-scope, rate-limit, and branch-targeting details; this unit covers auth and host scope.
depends_on: [CWF-061, CWF-062, CWF-064]
unblocks: []
acceptance_criteria:
  - Push and PR creation source auth from SSH or OS credential store at runtime.
  - Tokens are not embedded in remotes or logs.
  - Required GitHub scopes include repo for MVP create repo, fork, push branch, and open PR.
  - Organization fork destination selection requires explicit preflight and `read:org` when organization discovery or permission checks are enabled.
  - Permission errors surface a message naming required scopes.
  - Non-GitHub hosts return typed unsupported-host outcomes with owner docs and recovery/help actions; they are not silent placeholders.
  - Rate limits are respected and surfaced to the user.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: auth_scope_drift
reasoning_tier: high
context_scope: github_auth_scope
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/MiscPlan.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_github_auth_scope_rate_limit_host_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0059
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0060
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0061
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0067
  - pldg-20260614-002-part-3-fable-cleanup:atom-0027
preserved_exact_tokens:
  - "repo"
  - "read:org"
  - "workflow"
  - "Permission denied"
  - "OS credential store"
  - "do not embed tokens in remotes or logs"
  - "GitHub only"
  - "MVP = user fork only"
  - "organization-fork preflight"
  - "typed unsupported-host outcomes"
  - "Rate limits"
compatibility_only_notes:
  - "`MVP = user fork only` is preserved as stale source lineage only; active canon requires a typed organization-fork path with preflight and scoped `read:org` behavior when organization forks are enabled."
negative_constraints:
  - "Do not store tokens in seglog/redb/Tantivy or logs."
  - "Do not preserve `MVP = user fork only` as a blocker to organization-fork destination selection and preflight."
  - "Do not implement non-GitHub repository hosts silently; return typed unsupported-host outcomes with owner docs and recovery/help actions."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/MiscPlan.md
```

### CWF-066 - PR Branch and Worktree Boundary

```yaml
plan_unit_id: CWF-066
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Contribute PR uses the main clone feature branch as the user-facing branch,
  while any orchestrator worktrees remain distinct and must not replace the PR
  branch ref.
gui_related: false
gui_classification_reason: Branch/worktree separation is runtime and git workflow behavior rather than GUI presentation.
split_recommended: true
split_recommendation_reason: Source spans S0058, S0060, and S0067 mix PR start and worktree collision boundaries; this unit covers branch/worktree separation.
depends_on: [CWF-063]
unblocks: []
acceptance_criteria:
  - Contribute PR uses one feature branch in the main fork clone.
  - Contribute PR does not create node worktrees or per-node worktree branches for that intent.
  - Branch naming reuses WorktreeGitImprovement sanitization and invalid-ref handling.
  - If orchestrator subtask worktrees are used, they are distinct and do not replace the PR branch ref.
  - PR branch remains the checked-out user-facing branch in the single clone.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_pr_collision
reasoning_tier: high
context_scope: git_worktree_boundary
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/WorktreeGitImprovement.md
  - Plans/MiscPlan.md
node_compile_hint:
  mode: chain_wizard_pr_branch_worktree_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0058
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0060
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0067
preserved_exact_tokens:
  - "single feature branch"
  - "main clone"
  - "no per-node worktree branches"
  - "WorktreeGitImprovement.md"
  - "no invalid refs"
  - "PR branch is the user-facing branch"
negative_constraints:
  - "Contribute (PR) does not create node worktrees or per-node worktree branches."
  - "Orchestrator worktrees must not replace the PR branch ref."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/WorktreeGitImprovement.md
```

### CWF-067 - Adjacent Plan Owner Map

```yaml
plan_unit_id: CWF-067
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The Relationship table records adjacent owner and consumer docs for
  requirements, Builder, Interview, Project_Output_Artifacts,
  WorktreeGitImprovement, MiscPlan, usage, providers, and tools without
  re-owning those contracts.
gui_related: false
gui_classification_reason: Owner map routing is documentation/governance behavior, not GUI implementation work.
split_recommended: false
depends_on: [CWF-046, CWF-056, CWF-061]
unblocks: []
acceptance_criteria:
  - REQUIREMENTS.md remains a referenced source for Start Chain steps.
  - assistant-chat-design.md remains the Assistant/Builder handoff consumer.
  - interview-subagent-integration.md remains the adaptive Interview consumer.
  - Project_Output_Artifacts.md remains the SSOT for required user-project artifacts and canonical seglog persistence.
  - WorktreeGitImprovement.md remains the branch, PR creation, and worktree lifecycle owner.
  - MiscPlan remains the git-ignore, no-secrets, and cleanup allowlist companion.
  - usage-feature, Provider_OpenCode, and newtools remain adjacent consumers without direct wizard flow ownership.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_map_drift
reasoning_tier: standard
context_scope: cross_doc_owner_map
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/00-plans-index.md
node_compile_hint:
  mode: chain_wizard_adjacent_plan_owner_map
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0062
preserved_exact_tokens:
  - "Plans/Project_Output_Artifacts.md"
  - "Single source of truth"
  - ".puppet-master/project/"
  - "WorktreeGitImprovement.md"
  - "additional GUI and flow steps"
  - "No direct change"
  - "Provider_OpenCode.md"
negative_constraints:
  - "The Relationship table does not re-own adjacent contracts."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/00-plans-index.md
```

### CWF-068 - Intent Change Recovery and Builder-Interview State Guard

```yaml
plan_unit_id: CWF-068
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Intent changes after downstream state require the exact confirmation modal and
  reset behavior, recovery snapshots preserve intent and wizard_step, and
  Builder handoff must carry project_path and intent into Interview without
  empty/default overwrite.
gui_related: true
gui_classification_reason: This unit includes the user-visible confirmation modal and recovery/resume effects on wizard screens.
split_recommended: true
split_recommendation_reason: Source spans S0063 and S0064 contain section boundary plus multiple flow-state resolutions; this unit covers flow-state recovery guards.
depends_on: [CWF-010, CWF-015, CWF-023]
unblocks: []
acceptance_criteria:
  - Intent changes after requirements or interview show the exact confirmation modal.
  - Continue clears requirements list, canonical path, Builder handoff flag, and interview state.
  - Continue sets wizard step to project setup and keeps project_path plus the new intent value.
  - Cancel closes the modal without changing state.
  - Recovery snapshots preserve intent and wizard_step.
  - Builder-to-Interview handoff persists project_path and intent and guards against empty/default overwrite.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: state_reset_loss
reasoning_tier: high
context_scope: wizard_state_recovery
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/newfeatures.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_intent_change_recovery_builder_interview_guard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0063
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0064
preserved_exact_tokens:
  - "Changing intent will clear requirements and interview progress. Continue?"
  - "[Continue] [Cancel]"
  - "intent"
  - "wizard_step"
  - "project_path"
  - "no stale \"no project\" state"
negative_constraints:
  - "Interview initialization must not overwrite handoff project_path and intent with empty/default values."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/newfeatures.md
  - Plans/FinalGUISpec.md
```

### CWF-069 - Requirements Merge Template and Builder Abandonment Resolutions

```yaml
plan_unit_id: CWF-069
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Requirements and Builder gap resolutions fix merge order, required Builder
  sections, and abandonment controls, with uploads first, Builder last,
  validation warnings for missing sections, and no automatic save or handoff on
  cancel or timeout.
gui_related: true
gui_classification_reason: Cancel, return, timeout, and warning controls are user-visible Builder and requirements UI behavior.
split_recommended: false
depends_on: [CWF-029, CWF-031, CWF-035, CWF-037]
unblocks: []
acceptance_criteria:
  - Multiple uploads plus Builder output merge uploaded files first and Builder output last.
  - MVP may concatenate with section separators while documenting uploads first and Builder last.
  - Builder output template includes required top-level sections.
  - Assistant/Builder prompt and post-processing emit the single Builder output template.
  - PRD generator and Interview assume the Builder output template and warn when sections are missing.
  - Cancel and return to requirements saves nothing.
  - Idle-timeout prompt does not automatically save or hand off Builder output.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_gap_regression
reasoning_tier: high
context_scope: requirements_builder
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_requirements_merge_template_builder_abandonment
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0065
preserved_exact_tokens:
  - "uploads first, Builder last"
  - "Scope"
  - "Goals"
  - "Out of scope"
  - "Acceptance criteria"
  - "Non-goals"
  - "Cancel and return to requirements"
  - "30 minutes"
  - "No automatic save or handoff"
negative_constraints:
  - "Do not automatically save or hand off Builder output on cancel or timeout."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### CWF-070 - Wizard Progress Indicator and Deferred Skip-to-Execution

```yaml
plan_unit_id: CWF-070
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard length is mitigated with a visible step/total progress indicator while
  skip-to-execution for users who already have requirements and prd.json remains
  future work only.
gui_related: true
gui_classification_reason: Progress indicators and skip affordances are user-visible wizard UX.
split_recommended: true
split_recommendation_reason: Source span S0068 contains several GUI/UX resolutions; this unit covers wizard length and deferred skip-to-execution only.
depends_on: [CWF-018, CWF-025]
unblocks: []
acceptance_criteria:
  - Wizard UI shows current step index and total.
  - Progress indicator copy can use examples such as Step 2 of 6.
  - Skip-to-execution for already available requirements and prd.json is deferred to later phase.
  - Deferred skip-to-execution is documented as future work rather than current implementation scope.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wizard_length
reasoning_tier: standard
context_scope: wizard_gui
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_progress_indicator_deferred_skip
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0068
preserved_exact_tokens:
  - "Step 2 of 6"
  - "I already have requirements and prd.json"
  - "deferred to a later phase"
  - "future work"
negative_constraints:
  - "Do not implement skip-to-execution in the current phase."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-071 - Legible Project Shell Complexity Guard

```yaml
plan_unit_id: CWF-071
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The wizard may borrow selectively from IDE workspace models but must avoid a
  high-complexity project shell and prefer legible setup, file-tree ergonomics,
  and immediate /test/share/apply workflows.
gui_related: true
gui_classification_reason: Project shell complexity, navigation, and file-tree ergonomics are user-visible GUI concerns.
split_recommended: true
split_recommendation_reason: Source span S0068 contains several GUI/UX resolutions; this unit covers visible project shell complexity.
depends_on: [CWF-018]
unblocks: [CWF-072]
acceptance_criteria:
  - Wizard can borrow selectively from IDE workspace or project models.
  - Wizard does not import a high-complexity project shell.
  - GUI avoids hangs, heavy navigation regressions, terminal-cwd friction, and cross-tool source-resolution bugs.
  - Project setup, file-tree ergonomics, and visible immediate test/share/apply workflows are preferred over abstract flexibility.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: ide_complexity_regression
reasoning_tier: high
context_scope: wizard_gui_shell
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/FileManager.md
node_compile_hint:
  mode: chain_wizard_legible_project_shell_complexity_guard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0068
preserved_exact_tokens:
  - "IDE-grade complexity risk"
  - "hangs"
  - "terminal-cwd friction"
  - "/source-resolution"
  - "/test/share/apply"
negative_constraints:
  - "Do not import a high-complexity project shell."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/FileManager.md
```

### CWF-072 - Cross-Surface Source Context Preservation

```yaml
plan_unit_id: CWF-072
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Cross-surface handoffs must preserve exact source, project, terminal cwd, and file context so source resolution does not drift between tools.
gui_related: false
gui_classification_reason: Source/project/cwd/file handoff identity is runtime context preservation, not visual presentation.
split_recommended: true
split_recommendation_reason: Source span S0068 mixes GUI complexity with runtime handoff identity; this unit covers context preservation.
depends_on: [CWF-071]
unblocks: []
acceptance_criteria:
  - Cross-surface handoff preserves exact source identity.
  - Cross-surface handoff preserves project identity.
  - Cross-surface handoff preserves terminal cwd.
  - Cross-surface handoff preserves file context.
  - Source resolution does not drift between tools.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: source_context_drift
reasoning_tier: high
context_scope: cross_surface_handoff
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/storage-plan.md
  - Plans/FileManager.md
node_compile_hint:
  mode: chain_wizard_cross_surface_source_context_preservation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0068
preserved_exact_tokens:
  - "exact source"
  - "project"
  - "terminal cwd"
  - "file context"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/storage-plan.md
  - Plans/FileManager.md
```

### CWF-073 - Agent Activity Pane Accessibility and Stream Bounds

```yaml
plan_unit_id: CWF-073
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The shared agent activity pane keeps bounded, readable, accessible streaming
  output with fixed minimum height, stream virtualization, progressbar semantics,
  keyboard controls, and reduced-motion behavior.
gui_related: true
gui_classification_reason: The activity pane, stream, progressbar, and buttons are visible interactive UI surfaces.
split_recommended: true
split_recommendation_reason: Source span S0068 contains several GUI/UX resolutions; this unit covers activity pane layout and accessibility.
depends_on: [CWF-025, CWF-026, CWF-027]
unblocks: []
acceptance_criteria:
  - Shared agent activity view is non-interactive and streaming.
  - Minimum embedded pane height is 120px in wizard or Interview.
  - Stream shows at most 500 visible lines before virtualization or Show older.
  - Stream content uses monospace font.
  - Progress bar or status strip uses aria-live polite and role progressbar with values when determinate.
  - Pause, Cancel, and Resume buttons are keyboard focusable and clearly labeled for assistive tech.
  - Reduced-motion preference disables animated progress bar fill.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: agent_activity_a11y_drift
reasoning_tier: high
context_scope: agent_activity_ui
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_agent_activity_pane_a11y_stream_bounds
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0068
preserved_exact_tokens:
  - "120px"
  - "500"
  - "Show older"
  - "aria-live=\"polite\""
  - "role=\"progressbar\""
  - "aria-valuenow"
  - "Review pass 2 of 3"
negative_constraints:
  - "When reduced-motion is preferred, do not animate progress bar fill."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-074 - New Wizard Control Accessibility

```yaml
plan_unit_id: CWF-074
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Intent selection and Builder, Create fork, and Open PR controls must preserve focus order, labels, keyboard activation, ARIA where needed, and screen-reader text.
gui_related: true
gui_classification_reason: Intent selection and new action buttons are visible wizard controls.
split_recommended: true
split_recommendation_reason: Source span S0068 contains multiple GUI/UX concerns; this unit covers control accessibility.
depends_on: [CWF-019, CWF-061, CWF-062, CWF-064]
unblocks: []
acceptance_criteria:
  - Intent selection is keyboard-accessible and screen-reader friendly.
  - Builder controls are keyboard-accessible and screen-reader friendly.
  - Create fork controls are keyboard-accessible and screen-reader friendly.
  - Open PR controls are keyboard-accessible and screen-reader friendly.
  - Existing widget catalog and patterns are used for focus order, labels, and ARIA where needed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: a11y_regression
reasoning_tier: high
context_scope: wizard_controls
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/Widget_System.md
node_compile_hint:
  mode: chain_wizard_new_control_accessibility
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0068
preserved_exact_tokens:
  - "Intent selection"
  - "Builder"
  - "Create fork"
  - "Open PR"
  - "focus order"
  - "ARIA"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/Widget_System.md
```

### CWF-075 - Centralized User-Facing Wizard Strings

```yaml
plan_unit_id: CWF-075
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: New intent labels, buttons, and help text are stored in a centralized string module or locale resource keyed by ID, with no inline hardcoded strings in view code.
gui_related: true
gui_classification_reason: User-facing labels, buttons, and help text are visible GUI copy.
split_recommended: true
split_recommendation_reason: Source span S0068 contains multiple GUI/UX concerns; this unit covers i18n and string ownership.
depends_on: [CWF-019, CWF-061, CWF-062, CWF-064]
unblocks: []
acceptance_criteria:
  - Intent labels are stored in a central string module or locale resource.
  - Button labels are stored in a central string module or locale resource.
  - Help text is stored in a central string module or locale resource.
  - Strings are keyed by stable IDs.
  - View code does not inline hardcoded strings for these features.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: i18n_drift
reasoning_tier: standard
context_scope: wizard_i18n
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_centralized_user_facing_strings
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0068
preserved_exact_tokens:
  - "strings.rs"
  - "locale files"
  - "keyed by id"
  - "no inline hardcoded strings"
negative_constraints:
  - "Do not inline hardcoded strings in view code for these features."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-076 - Handoff and PR Body Secret Exclusion

```yaml
plan_unit_id: CWF-076
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Requirements docs, Builder output, Interview handoff, and PR body generation must not accept, embed, or propagate tokens/secrets and must sanitize sensitive fields before PR creation.
gui_related: false
gui_classification_reason: Secret exclusion and sanitization are security/data-handling requirements, not GUI presentation.
split_recommended: true
split_recommendation_reason: Source span S0069 contains multiple security resolutions; this unit covers no-secrets behavior.
depends_on: [CWF-034, CWF-064, CWF-065]
unblocks: []
acceptance_criteria:
  - Requirements doc does not accept or embed tokens/secrets.
  - Builder output does not accept or embed tokens/secrets.
  - Interview handoff does not include tokens/secrets.
  - PR body template excludes or sanitizes sensitive fields before opening PR.
  - Implementation checklist includes no secrets in requirements doc, Builder output, or PR body.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: secret_leak
reasoning_tier: high
context_scope: wizard_security
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/MiscPlan.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: chain_wizard_handoff_pr_body_secret_exclusion
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0069
preserved_exact_tokens:
  - "No secrets in handoff"
  - "requirements doc"
  - "Builder output"
  - "PR body"
  - "sanitize"
negative_constraints:
  - "Requirements doc and Builder output must not be used to pass tokens or secrets."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/MiscPlan.md
  - Plans/WorktreeGitImprovement.md
```

### CWF-077 - Untrusted Upstream Clone No-Execution Boundary

```yaml
plan_unit_id: CWF-077
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Fork/PR setup from untrusted upstreams may clone and create a branch but must not run upstream scripts, hooks, or code during fork/clone.
gui_related: false
gui_classification_reason: Avoiding upstream code execution is security/runtime behavior.
split_recommended: true
split_recommendation_reason: Source span S0069 contains multiple security resolutions; this unit covers untrusted upstream behavior.
depends_on: [CWF-062, CWF-063]
unblocks: []
acceptance_criteria:
  - Fork/PR flow may clone upstream-derived repositories.
  - Fork/PR flow may create a branch.
  - Fork/PR flow does not run upstream scripts during fork or clone.
  - Fork/PR flow does not run upstream hooks during fork or clone.
  - Documentation clearly states that setup does not execute code from upstream.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: untrusted_code_execution
reasoning_tier: high
context_scope: github_security
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
node_compile_hint:
  mode: chain_wizard_untrusted_upstream_no_execution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0069
preserved_exact_tokens:
  - "Fork/PR from untrusted upstream"
  - "only clone and create a branch"
  - "do not run upstream scripts or hooks"
  - "No execution of code from upstream"
negative_constraints:
  - "Do not run upstream scripts, hooks, or code during fork/clone."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
```

### CWF-078 - User-Project Artifact Consumer Boundary

```yaml
plan_unit_id: CWF-078
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Chain Wizard consumes Plans/Project_Output_Artifacts.md for exact user-project artifact, sharding, and persistence contracts, while keeping CWF flow-specific and avoiding local schema restatement.
gui_related: false
gui_classification_reason: Artifact owner/consumer boundaries are governance and backend artifact behavior.
split_recommended: true
split_recommendation_reason: Source span S0072 contains artifact owner boundary plus sharded artifact requirements; this unit covers owner boundary and staging promotion.
depends_on: [CWF-047, CWF-058]
unblocks: [CWF-079]
acceptance_criteria:
  - Interviewer and Wizard outputs follow Project_Output_Artifacts canonical artifact, sharding, and persistence contract.
  - Chain Wizard remains flow-specific and does not restate SSOT schema fields.
  - Uploads and Builder output remain staging inputs under .puppet-master/requirements/*.
  - Before Interview/start-chain execution, canonical promotion writes .puppet-master/project/requirements.md.
  - Contract Unification materializes canonical outputs under .puppet-master/project/ exactly per SSOT.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: artifact_owner_boundary_drift
reasoning_tier: high
context_scope: project_artifact_pack
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: chain_wizard_user_project_artifact_consumer_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0072
preserved_exact_tokens:
  - "flow-specific"
  - "does not restate SSOT schema fields"
  - ".puppet-master/requirements/*"
  - ".puppet-master/project/requirements.md"
negative_constraints:
  - "Do not restate SSOT schema fields in this plan."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Document_Packaging_Policy.md
```

### CWF-079 - Sharded Project Graph Execution Input Boundary

```yaml
plan_unit_id: CWF-079
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Validators and orchestrator use only the canonical sharded plan_graph as scheduling/execution input; monolithic graph export is optional, derived, and consistency-only.
gui_related: false
gui_classification_reason: Sharded plan graph scheduling input rules are backend artifact validation behavior.
split_recommended: false
depends_on: [CWF-058, CWF-060, CWF-078]
unblocks: []
acceptance_criteria:
  - Canonical execution graph is sharded-only.
  - Scheduling/execution input uses .puppet-master/project/plan_graph/index.json and referenced nodes/<node_id>.json shards.
  - optional edges.json remains optional.
  - plan_graph.monolithic.json is optional derived export only.
  - Validators and orchestrator never treat monolithic graph export as canonical input.
  - Field-level schema, deterministic node-ID, contract/acceptance coverage, and evidence requirements stay owned by Project_Output_Artifacts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: sharded_graph_execution_input_drift
reasoning_tier: high
context_scope: project_plan_graph
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_sharded_project_graph_execution_input
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0072
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0073
preserved_exact_tokens:
  - "sharded-only"
  - "plan_graph/index.json"
  - "nodes/<node_id>.json"
  - "edges.json"
  - "plan_graph.monolithic.json"
  - "non-canonical"
  - "never required"
compatibility_only_notes:
  - "plan_graph.monolithic.json is optional derived export only."
negative_constraints:
  - "Validators and orchestrator MUST use only the canonical sharded graph for scheduling/execution inputs."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-080 - Project Auto-Decisions and HITL Scheduling

```yaml
plan_unit_id: CWF-080
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Ambiguity uses deterministic defaults with auto-decision records in project artifacts and seglog, while tool_policy_mode ask approvals do not block unrelated runnable scheduler work.
gui_related: false
gui_classification_reason: Automatic decisions, HITL policy, and scheduler continuation are runtime/governance behavior.
split_recommended: false
depends_on: [CWF-058, CWF-060]
unblocks: []
acceptance_criteria:
  - Remaining ambiguity applies deterministic defaults per Decision Policy.
  - Each automatic decision records node_id, decision_id, chosen, reason, and contract_refs.
  - Automatic decisions are written to .puppet-master/project/auto_decisions.jsonl and canonically in seglog.
  - Nodes may require approvals with tool_policy_mode = ask.
  - A node waiting on approval does not block other runnable nodes whose dependencies allow scheduling.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: hitl_scheduler_drift
reasoning_tier: high
context_scope: autonomy_hitl
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Contracts_V0.md
  - Plans/DRY_Rules.md
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: chain_wizard_project_auto_decisions_hitl_scheduling
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0074
preserved_exact_tokens:
  - "auto_decisions.jsonl"
  - "{node_id, decision_id, chosen, reason, contract_refs[]}"
  - "tool_policy_mode = ask"
  - "without blocking the entire run"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Contracts_V0.md
```

### CWF-081 - Mandatory Headless Invariant Sweep Boundary

```yaml
plan_unit_id: CWF-081
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The always-on Auditor invariant loop runs immediately after Contract
  Unification on the provisional project pack, is separate from optional §5.6
  Multi-Pass Review, cannot be disabled, and repeats audit, bounded repair,
  and re-audit until certification or critical block without human intervention
  or GUI.
gui_related: false
gui_classification_reason: The invariant sweep is a headless validation pipeline; the GUI is mentioned only as absent.
split_recommended: true
split_recommendation_reason: Source spans S0075-S0076 introduce the sweep and legacy pass ordering; this unit covers the boundary and current Auditor loop sequencing.
depends_on: [CWF-057, CWF-060]
unblocks: [CWF-082, CWF-083, CWF-084, CWF-085]
acceptance_criteria:
  - Auditor invariant loop runs immediately after Contract Unification Pass produces provisional canonical project artifact pack.
  - Auditor invariant loop is separate from optional user-facing §5.6 Multi-Pass Review.
  - Auditor invariant loop cannot be disabled.
  - Auditor invariant loop runs even when other review features are present or enabled.
  - Loop cycles repeat audit, bounded repair, and re-audit until certified or critically blocked.
  - Loop requires no human intervention and no running GUI.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_bypass
reasoning_tier: high
context_scope: validation_sweep
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_mandatory_headless_invariant_sweep
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0075
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0076
preserved_exact_tokens:
  - "always-on mandatory invariant sweep"
  - "provisional"
  - "cannot be disabled"
  - "without requiring human intervention or a running GUI"
  - "Pass 1 → Pass 2 → Pass 3"
  - "Auditor audit-to-repair loop"
negative_constraints:
  - "The invariant sweep cannot be disabled."
  - "Do not treat Pass 1 / Pass 2 / Pass 3 as active process stages; they are compatibility aliases only."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-082 - Legacy Pass 1 Alias And Initial Auditor Quality Report

```yaml
plan_unit_id: CWF-082
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The initial Auditor audit cycle validates and completes the provisional
  artifact pack, may mirror legacy Pass 1 / validation_pass_report fields for
  document_creation compatibility, and writes a read-only
  requirements_quality_report without authoring requirements or contract
  fragments.
gui_related: false
gui_classification_reason: Initial Auditor report generation and artifact validation are backend validation behavior.
split_recommended: false
depends_on: [CWF-081]
unblocks: [CWF-083, CWF-085]
acceptance_criteria:
  - Initial Auditor audit validates and completes the provisional artifact pack produced by Contract Unification.
  - Initial Auditor audit may materialize missing derived artifacts or deterministic projections.
  - Initial Auditor audit is not the first author of requirements or contract fragments.
  - Legacy Pass 1 validation_pass_report fields may be mirrored with pass_number 1 and pass_name document_creation only when compatibility_only is true and cycle_report_ref points to the canonical Auditor cycle report.
  - Initial Auditor audit writes requirements_quality_report at .puppet-master/project/traceability/requirements_quality_report.json.
  - requirements_quality_report is read-only for requirements intent and classifies auto_fixable true/false without editing requirements.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: auditor_initial_quality_report_drift
reasoning_tier: high
context_scope: validation_sweep
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_auditor_initial_quality_report
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0077
preserved_exact_tokens:
  - "pass_name: \"document_creation\""
  - "diff_pointers"
  - "requirements_quality_report"
  - "pm.requirements_quality_report.schema.v1"
  - "auto_fixable"
negative_constraints:
  - "Pass 1 is a compatibility alias only."
  - "Initial Auditor audit does not edit requirements."
  - "Initial Auditor audit is not the first author of requirements or contract fragments."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-083 - Legacy Pass 2 Alias And Bounded Auditor Repair

```yaml
plan_unit_id: CWF-083
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Bounded Auditor repair compares project artifacts against contracts and canon,
  applies resolvable fixes, applies auto_fixable requirement-quality fixes,
  updates reports, and records unresolved findings without treating legacy Pass
  2 as an active process stage.
gui_related: false
gui_classification_reason: Bounded Auditor correction and report behavior are backend validation pipeline behavior.
split_recommended: false
depends_on: [CWF-081, CWF-082]
unblocks: [CWF-084, CWF-085, CWF-086]
acceptance_criteria:
  - Bounded Auditor repair compares requirements, contract pack, plan_graph nodes, and acceptance_manifest against canonical references.
  - For each gap or contradiction, bounded Auditor repair records findings and applies fixes where possible.
  - Bounded Auditor repair records diff_pointer information for applied fixes.
  - Bounded Auditor repair records unresolved_findings when no fix is possible.
  - Bounded Auditor repair applies auto-fixes from requirements_quality_report where auto_fixable == true.
  - Bounded Auditor repair updates requirements_quality_report in place with final post-fix state.
  - Bounded Auditor repair does not escalate directly; it updates the quality report artifact for certification/block semantics.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: canonical_alignment_false_pass
reasoning_tier: high
context_scope: validation_sweep
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Contracts_V0.md
  - Plans/DRY_Rules.md
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: chain_wizard_auditor_bounded_repair_auto_fixes
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0078
preserved_exact_tokens:
  - "canonical_alignment"
  - "findings[]"
  - "changes_applied_summary"
  - "unresolved_findings[]"
  - "auto_fixes_applied[]"
  - "auto_fixable == true"
negative_constraints:
  - "Pass 2 is a compatibility alias only."
  - "Bounded Auditor repair does not escalate directly."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-084 - Legacy Pass 3 Alias And Auditor Certification Gate

```yaml
plan_unit_id: CWF-084
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The Auditor certification gate enforces DRY/SSOT, plan graph, wiring,
  evidence, and deterministic decision invariants while never modifying
  requirements.md, plan.md, or user-intent-derived content; legacy Pass 3 fields
  are compatibility aliases only.
gui_related: false
gui_classification_reason: Auditor certification validates artifacts, including GUI wiring when present, but does not implement GUI presentation.
split_recommended: false
depends_on: [CWF-081, CWF-083]
unblocks: [CWF-085, CWF-086]
acceptance_criteria:
  - Auditor certification focuses on canonical system integrity before certifying or blocking.
  - Auditor certification enforces DRY/SSOT compliance.
  - Auditor certification enforces plan graph integrity.
  - Auditor certification enforces wiring matrix consistency when the user project has a GUI.
  - Auditor certification enforces evidence/invariants alignment.
  - Auditor certification enforces deterministic decisions/autonomy compliance.
  - Auditor certification never modifies requirements.md, plan.md, or user-intent-derived artifacts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: canonical_systems_sweep_drift
reasoning_tier: high
context_scope: validation_sweep
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/DRY_Rules.md
  - Plans/Wiring_Matrix.schema.json
node_compile_hint:
  mode: chain_wizard_auditor_certification_gate
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0079
preserved_exact_tokens:
  - "canonical_systems"
  - "DRY/SSOT"
  - "UICommandID"
  - "pass_3_violation:"
  - "MUST NOT modify"
negative_constraints:
  - "Pass 3 is a compatibility alias only."
  - "Auditor certification MUST NOT modify requirements.md, plan.md, or any artifact whose content is driven by user intent or product scope."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-085 - Validation Sweep Execution Settings and Report Emission

```yaml
plan_unit_id: CWF-085
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The sweep runs deterministically and headlessly, uses one Auditor validation
  loop provider/model setting for all Auditor cycle reports, emits enough
  reports to prove audit/repair/re-audit/certification or block, and treats
  legacy pass reports as compatibility rows only.
gui_related: false
gui_classification_reason: Sweep execution settings and report emission are backend validation behavior.
split_recommended: true
split_recommendation_reason: Source spans S0080 and S0081 mix execution settings, report rules, acceptance criteria, and failure routing; this unit covers execution/report emission.
depends_on: [CWF-081, CWF-082, CWF-083, CWF-084]
unblocks: [CWF-086, CWF-087]
acceptance_criteria:
  - Auditor loop cycles run deterministically without human intervention.
  - Each cycle runs headless with no GUI and no approval gate inside the loop.
  - Auditor validation loop provider and model are configurable through app settings.
  - Defaults are deterministic and safe when not explicitly configured.
  - Each Auditor cycle report includes provider and model matching the resolved Auditor validation loop provider/model from sweep start.
  - The loop emits enough reports to prove audit, bounded repair, re-audit, and certified or critical-block terminal state.
  - Legacy validation_pass_report rows and pass_verdict skipped values may be emitted only as compatibility mirrors with compatibility_only true and cycle_report_ref.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_report_emission_drift
reasoning_tier: high
context_scope: validation_sweep
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_validation_sweep_execution_settings_reports
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0080
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0081
preserved_exact_tokens:
  - "model_roles.auditor.provider"
  - "model_roles.auditor.model"
  - "Auditor validation loop"
  - "Exactly three pass reports"
  - "pass_verdict: \"skipped\""
  - "certified or critical-block terminal state"
negative_constraints:
  - "No GUI is required and no user approval gate exists between passes."
  - "Do not expose fixed Pass 1 / Pass 2 / Pass 3 model settings."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-086 - Validation Failure Routing and Finding Artifact Split

```yaml
plan_unit_id: CWF-086
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Auditor loop blocks route to user-visible clarification or resolution
  surfaces using distinct needs_user_clarification and unresolved_findings
  artifacts while preserving corrected-but-blocked artifacts for resume.
gui_related: true
gui_classification_reason: Failure routing drives user-visible Interview clarification and review/resolution UI surfaces.
split_recommended: true
split_recommendation_reason: Source spans S0080 and S0081 mix backend report semantics with user-visible clarification/review routing; this unit covers routing and artifact split.
depends_on: [CWF-083, CWF-084, CWF-085]
unblocks: []
acceptance_criteria:
  - Initial Auditor audit failure without allowed deterministic repair halts and surfaces failure to the user.
  - If bounded Auditor repair produces non-empty needs_user_clarification, wizard transitions to clarification/resume path.
  - Auditor certification is blocked when clarification or authority boundaries block progress.
  - Corrected-but-blocked artifact set is preserved for resume.
  - unresolved_findings is distinct from needs_user_clarification.
  - needs_user_clarification drives interview UI.
  - unresolved_findings drives review/resolution UI.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: clarification_routing_drift
reasoning_tier: high
context_scope: validation_failure_routing
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/Project_Output_Artifacts.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_validation_failure_routing_finding_split
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0080
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0081
preserved_exact_tokens:
  - "needs_user_clarification[]"
  - "unresolved_findings[]"
  - "question_id"
  - "finding_id"
  - "corrected-but-blocked artifact set"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### CWF-087 - Auditor Cycle Report Lineage and Runtime Identity Carry-Through

```yaml
plan_unit_id: CWF-087
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Auditor cycle reports carry lineage fields and skipped-verdict support, legacy validation_pass_report mirrors may expose the same data only with compatibility_only true and cycle_report_ref, and effective runtime identity survives validation into launch handoff.
gui_related: false
gui_classification_reason: Validation report lineage and runtime identity handoff are backend/report semantics.
split_recommended: false
depends_on: [CWF-016, CWF-085]
unblocks: []
acceptance_criteria:
  - Auditor cycle reports include workflow_run_id.
  - Auditor cycle reports include phase_plan_ref.
  - Auditor cycle reports include staged_bundle_ref.
  - Auditor cycle reports include requirements_quality_report_ref.
  - Auditor cycle reports include run_id.
  - Auditor validation cycles emit lineage-rich cycle reports explaining what was evaluated and what execution was seeded.
  - Legacy validation_pass_report mirrors carry compatibility_only true and cycle_report_ref.
  - pass_verdict supports skipped.
  - Effective runtime identity survives validation into launch handoff.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_lineage_identity_drift
reasoning_tier: high
context_scope: validation_report_identity
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: chain_wizard_validation_report_lineage_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0082
preserved_exact_tokens:
  - "workflow_run_id"
  - "phase_plan_ref"
  - "staged_bundle_ref"
  - "requirements_quality_report_ref"
  - "run_id"
  - "lineage-rich pass reports"
  - "pass_verdict"
  - "skipped"
  - "effective runtime identity"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-088 - No-Wizard Flow Owner Boundary

```yaml
plan_unit_id: CWF-088
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: CWF records no-wizard entry-point wiring and cross-references, while the full flow specification remains owned by Plans/GitHub_Integration.md §D.
gui_related: false
gui_classification_reason: This unit is an owner/consumer boundary and cross-reference, not GUI implementation.
split_recommended: false
depends_on: [CWF-067]
unblocks: [CWF-089, CWF-090, CWF-091, CWF-092]
acceptance_criteria:
  - Full no-wizard flow specification remains in GitHub_Integration.md §D.
  - CWF only records cross-reference and entry-point wiring.
  - DRY and Decision Policy constraints still apply.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: no_wizard_owner_boundary_drift
reasoning_tier: standard
context_scope: no_wizard_flows
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
node_compile_hint:
  mode: chain_wizard_no_wizard_flow_owner_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0083
preserved_exact_tokens:
  - "No-Wizard Project Management Flows"
  - "Plans/GitHub_Integration.md §D"
  - "entry-point wiring"
negative_constraints:
  - "CWF does not re-own the full no-wizard flow specification."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
```

### CWF-089 - No-Wizard Entry Points and Later-Wizard Preload Overview

```yaml
plan_unit_id: CWF-089
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Three project management flows are reachable from File menu Project or Dashboard and each finishes with a Run Chain Wizard later affordance that preloads the new project context.
gui_related: true
gui_classification_reason: File menu, Dashboard entry points, and finish-screen affordance are user-visible GUI surfaces.
split_recommended: false
depends_on: [CWF-088]
unblocks: [CWF-090, CWF-091, CWF-092]
acceptance_criteria:
  - Add Existing Project flow is available without requiring Chain Wizard.
  - Create New Local Project flow is available without requiring Chain Wizard.
  - Create New GitHub Repo + Project flow is available without requiring Chain Wizard.
  - Users can reach no-wizard flows from File menu Project or Dashboard.
  - Each no-wizard flow surfaces Run Chain Wizard later on its finish screen.
  - Run Chain Wizard later preloads the newly added or created project context.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: no_wizard_entry_drift
reasoning_tier: standard
context_scope: no_wizard_flows
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_no_wizard_entry_points_preload
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0084
preserved_exact_tokens:
  - "Add Existing Project"
  - "Create New Local Project"
  - "Create New GitHub Repo + Project"
  - "Run Chain Wizard later"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
  - Plans/FinalGUISpec.md
```

### CWF-090 - Add Existing Project No-Wizard Flow

```yaml
plan_unit_id: CWF-090
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Add Existing Project lets users pick a local folder or SSH remote path, auto-detects repo/language/framework/project name, optionally links GitHub, opens File Manager/editor, and offers Run Chain Wizard later.
gui_related: true
gui_classification_reason: Add Existing Project is a user-visible project-add flow with picker, dashboard/menu entry, and finish action.
split_recommended: false
depends_on: [CWF-088, CWF-089]
unblocks: []
acceptance_criteria:
  - Entry is File menu -> Add Existing Project or Dashboard -> Add Project.
  - User selects a local folder through native OS picker or picks an SSH remote and path.
  - Puppet Master auto-detects git repo presence, language/framework, and suggested project name.
  - Optional Link to GitHub uses device-code auth if needed.
  - Finish opens the project in File Manager and editor.
  - Finish offers Run Chain Wizard later.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: add_existing_project_flow_drift
reasoning_tier: standard
context_scope: no_wizard_flows
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/FileManager.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_add_existing_project_no_wizard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0085
preserved_exact_tokens:
  - "File menu → \"Add Existing Project\""
  - "Dashboard → \"Add Project\""
  - "native OS picker"
  - "SSH remote + path"
  - "Link to GitHub"
  - "File Manager + editor"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
  - Plans/GitHub_API_Auth_and_Flows.md
```

### CWF-091 - Create New Local Project No-Wizard Flow

```yaml
plan_unit_id: CWF-091
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Create New Local Project collects project name, parent folder, default-on git-init, and optional language/framework preset, then creates/opens the project and offers Run Chain Wizard later.
gui_related: true
gui_classification_reason: Create New Local Project is a visible project creation flow with form controls and finish action.
split_recommended: false
depends_on: [CWF-088, CWF-089]
unblocks: []
acceptance_criteria:
  - Entry is File menu -> New Project -> Local Only or Dashboard -> New Project.
  - Inputs include project name and parent folder.
  - git-init toggle defaults on.
  - Optional language/framework preset can be selected.
  - Finish creates and opens the project.
  - Finish offers Run Chain Wizard later.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: create_local_project_flow_drift
reasoning_tier: standard
context_scope: no_wizard_flows
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_create_local_project_no_wizard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0086
preserved_exact_tokens:
  - "File menu → \"New Project\" → \"Local Only\""
  - "project name"
  - "parent folder"
  - "git-init toggle (default on)"
  - "language/framework preset"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
```

### CWF-092 - Create New GitHub Repo Project No-Wizard Flow

```yaml
plan_unit_id: CWF-092
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Create New GitHub Repo + Project requires github_api auth, launches inline device-code if needed, collects repo/visibility/README/gitignore/license/local clone inputs, creates via API, clones locally, and offers Run Chain Wizard later.
gui_related: true
gui_classification_reason: Create New GitHub Repo + Project is a visible project creation flow with auth, form controls, and finish action.
split_recommended: false
depends_on: [CWF-088, CWF-089, CWF-065]
unblocks: []
acceptance_criteria:
  - Entry is File menu -> New Project -> On GitHub or Dashboard -> New Project -> On GitHub.
  - Flow requires github_api auth.
  - Device-code auth launches inline when the user is not authenticated.
  - Inputs include repo name, description, visibility default Private, README/gitignore/license toggles, and local clone path.
  - Puppet Master creates the GitHub repo via API and clones locally.
  - Finish adds and opens the project.
  - Finish offers Run Chain Wizard later.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: create_github_project_flow_drift
reasoning_tier: standard
context_scope: no_wizard_flows
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_create_github_repo_project_no_wizard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0087
preserved_exact_tokens:
  - "github_api"
  - "device-code"
  - "visibility (default Private)"
  - "README/gitignore/license toggles"
  - "local clone path"
  - "creates GitHub repo via API and clones locally"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
  - Plans/GitHub_API_Auth_and_Flows.md
```

### CWF-093 - Deferred Chain Wizard Later Affordance and Payload

```yaml
plan_unit_id: CWF-093
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  No-wizard project-management finish screens expose Run Chain Wizard later,
  launch the canonical no-wizard wizard command, preload project context and
  default intent, persist the deferred payload for restart recovery, and open
  at Project Setup review rather than a blank intent picker.
gui_related: true
gui_classification_reason: Finish-screen action, wizard navigation, and Project Setup review are visible flow behavior.
split_recommended: true
split_recommendation_reason: Source span S0088 mixes visible finish-screen behavior, launch payload fields, recovery state, and backend default-intent mapping.
depends_on: [CWF-089, CWF-090, CWF-091, CWF-092]
unblocks: []
acceptance_criteria:
  - All three no-wizard flows show Run Chain Wizard later on their finish screen.
  - The action dispatches the canonical wizard-launch command from the no-wizard flow owner.
  - Project context includes name, path, language/frameworks, and GitHub remote when linked.
  - Default intent maps Add Existing Project to EnhanceRewriteAdd and both new-project flows to NewProject.
  - Deferred payloads include wizard_id, launch_source, default_intent, project_name, project_path, detected_language_frameworks[], remote_repo_ref, and created_repo_but_clone_failed when relevant.
  - Deferred launches open at Project Setup review, not at a blank intent picker.
  - Basic project setup remains possible without a mandatory wizard step.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: deferred_wizard_launch_drift
reasoning_tier: standard
context_scope: no_wizard_flows
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_deferred_later_affordance_payload
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0088
preserved_exact_tokens:
  - "Run Chain Wizard later"
  - "EnhanceRewriteAdd"
  - "NewProject"
  - "created_repo_but_clone_failed"
  - "Project Setup review"
negative_constraints:
  - "The wizard opens at Project Setup review, not at a blank intent picker, when launched from a deferred payload."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
```

### CWF-094 - Requirements Completion Contract Gate

```yaml
plan_unit_id: CWF-094
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Every requirement must satisfy C-1 through C-5 before leaving the Chain
  Wizard/Interview phase, with the Auditor invariant loop identifying, fixing,
  and escalating blocking issues under the requirements quality report schema
  and Decision Policy section 6.
gui_related: false
gui_classification_reason: Requirements completion and schema enforcement are backend validation semantics.
split_recommended: false
depends_on: [CWF-081]
unblocks: [CWF-095, CWF-096, CWF-097, CWF-098, CWF-099, CWF-100]
acceptance_criteria:
  - Requirements cannot leave Chain Wizard/Interview until all C-1 through C-5 criteria are met.
  - Initial Auditor audit identifies issues.
  - Bounded Auditor repair auto-fixes where possible.
  - Auditor certification blocks or escalates remaining blocking issues.
  - SchemaID pm.requirements_quality_report.schema.v1 and ContractName Plans/requirements_quality_report.schema.json are preserved.
  - Unknown resolution follows Decision_Policy.md section 6.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: requirements_completion_gate_drift
reasoning_tier: high
context_scope: requirements_quality
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/requirements_quality_report.schema.json
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: chain_wizard_requirements_completion_contract_gate
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0089
preserved_exact_tokens:
  - "pm.requirements_quality_report.schema.v1"
  - "PolicyRule:Decision_Policy.md§6"
  - "Three-Pass Canonical Validation Workflow"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/requirements_quality_report.schema.json
```

### CWF-095 - C-1 Scenario Coverage

```yaml
plan_unit_id: CWF-095
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Each requirement includes at least one happy-path scenario and one
  negative/failure scenario in given/when/then or equivalent structure, with
  missing coverage reported as missing_scenarios.
gui_related: false
gui_classification_reason: Scenario coverage is requirement-quality validation, not visual presentation.
split_recommended: false
depends_on: [CWF-094]
unblocks: [CWF-100]
acceptance_criteria:
  - At least one positive happy-path scenario is present.
  - At least one negative/failure scenario is present.
  - Scenarios use {given, when, then} or equivalent structured form.
  - Missing scenario coverage emits missing_scenarios.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: scenario_coverage_drift
reasoning_tier: standard
context_scope: requirements_quality
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/requirements_quality_report.schema.json
node_compile_hint:
  mode: chain_wizard_c1_scenario_coverage
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0090
preserved_exact_tokens:
  - "1 positive (happy-path) scenario"
  - "1 negative/failure scenario"
  - "{given, when, then}"
  - "missing_scenarios"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-096 - C-2 Boundary Declaration

```yaml
plan_unit_id: CWF-096
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Each requirement declares explicit in-scope and out-of-scope boundaries and
  rejects deferred placeholder or unresolved marker language.
gui_related: false
gui_classification_reason: Boundary declaration is requirement-quality validation, not visual presentation.
split_recommended: false
depends_on: [CWF-094]
unblocks: [CWF-100]
acceptance_criteria:
  - Each requirement has an explicit in-scope statement.
  - Each requirement has an explicit out-of-scope statement.
  - Deferred placeholder text such as later is rejected.
  - Similar unresolved marker text is rejected.
  - Missing boundary coverage emits missing_boundary.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: requirements_boundary_drift
reasoning_tier: standard
context_scope: requirements_quality
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/requirements_quality_report.schema.json
node_compile_hint:
  mode: chain_wizard_c2_boundary_declaration
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0091
preserved_exact_tokens:
  - "in-scope"
  - "out-of-scope"
  - "missing_boundary"
negative_constraints:
  - "May not use deferred placeholder text or similar deferral language."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-097 - C-3 Implementation Anchor

```yaml
plan_unit_id: CWF-097
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Each requirement carries either a ProjectContract reference that pins the
  implementing spec or an explicit research-node-required annotation before
  implementation can start.
gui_related: false
gui_classification_reason: Implementation anchoring is traceability and dependency validation.
split_recommended: false
depends_on: [CWF-094]
unblocks: [CWF-100]
acceptance_criteria:
  - A ProjectContract:* reference satisfies the implementation anchor.
  - An explicit research node required annotation satisfies the implementation anchor.
  - Research-required annotations create a blocking graph dependency before implementation can start.
  - Missing implementation anchor emits missing_anchor.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: implementation_anchor_drift
reasoning_tier: high
context_scope: requirements_quality
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_c3_implementation_anchor
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0092
preserved_exact_tokens:
  - "ProjectContract:*"
  - "research node required"
  - "missing_anchor"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-098 - C-4 Executable Verification Reference

```yaml
plan_unit_id: CWF-098
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Each requirement includes at least one acceptance check command path or named
  verification gate reference that will appear in the acceptance manifest.
gui_related: false
gui_classification_reason: Verification references and acceptance manifest linkage are backend validation semantics.
split_recommended: false
depends_on: [CWF-094]
unblocks: [CWF-100]
acceptance_criteria:
  - Each requirement has at least one acceptance check command path.
  - Inline verification uses verify: <command-or-gate-id>.
  - Named gate verification uses Gate:GATE-XXX.
  - Verification references appear in the acceptance manifest.
  - Missing acceptance verification emits missing_acceptance.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: acceptance_verification_drift
reasoning_tier: high
context_scope: requirements_quality
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_c4_executable_verification_reference
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0093
preserved_exact_tokens:
  - "verify: <command-or-gate-id>"
  - "Gate:GATE-XXX"
  - "missing_acceptance"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-099 - C-5 Unknown Resolution

```yaml
plan_unit_id: CWF-099
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Unknowns become blocking research dependencies, deterministic auto-decisions
  only when Decision Policy permits, or needs_user_clarification entries in the
  requirements quality report.
gui_related: false
gui_classification_reason: Unknown resolution is requirements-quality and decision-policy validation.
split_recommended: false
depends_on: [CWF-094]
unblocks: [CWF-100, CWF-102]
acceptance_criteria:
  - Blocking research nodes create graph dependencies.
  - Implementation cannot start until blocking research resolves.
  - Deterministic auto-decisions are used only for equally valid options.
  - Missing user intent is not treated as an auto-decision.
  - Remaining open unknowns become needs_user_clarification[] entries.
  - Unresolved unknowns emit missing_research.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: unknown_resolution_policy_drift
reasoning_tier: high
context_scope: requirements_quality
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/requirements_quality_report.schema.json
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: chain_wizard_c5_unknown_resolution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0094
preserved_exact_tokens:
  - "blocking research node"
  - "deterministic auto-decision"
  - "needs_user_clarification[]"
  - "missing_research"
negative_constraints:
  - "Deterministic auto-decision is allowed only when it is truly a choice between equally valid options, not missing user intent."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Decision_Policy.md
```

### CWF-100 - Requirements Quality Report Artifact

```yaml
plan_unit_id: CWF-100
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Initial Auditor audit produces and bounded Auditor repair updates a requirements_quality_report artifact
  that evaluates requirements against C-1 through C-5 using the canonical schema
  and required top-level arrays.
gui_related: false
gui_classification_reason: Quality report artifact shape is machine-readable validation output.
split_recommended: false
depends_on: [CWF-094, CWF-095, CWF-096, CWF-097, CWF-098, CWF-099]
unblocks: [CWF-101, CWF-102]
acceptance_criteria:
  - The artifact is named requirements_quality_report.
  - The artifact captures per-requirement evaluation against C-1 through C-5.
  - Bounded Auditor repair updates the report in place after autofixes.
  - Required fields include verdict, requirements_touched[], issues[], auto_fixes_applied[], and needs_user_clarification[].
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: requirements_quality_report_schema_drift
reasoning_tier: high
context_scope: requirements_quality
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/requirements_quality_report.schema.json
node_compile_hint:
  mode: chain_wizard_requirements_quality_report_artifact
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0095
preserved_exact_tokens:
  - "requirements_quality_report"
  - "pm.requirements_quality_report.schema.v1"
  - "requirements_touched[]"
  - "auto_fixes_applied[]"
  - "needs_user_clarification[]"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/requirements_quality_report.schema.json
```

### CWF-101 - Deterministic Quality Report Shaping

```yaml
plan_unit_id: CWF-101
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Requirements quality reports are stable across equivalent reruns by ordering
  touched requirements, issues, fixes, and clarification questions
  deterministically and emitting zero-padded IDs.
gui_related: false
gui_classification_reason: Deterministic ordering and identifier shaping are backend artifact invariants.
split_recommended: false
depends_on: [CWF-100]
unblocks: [CWF-102]
acceptance_criteria:
  - requirements_touched[] follows canonical requirement order from requirements.md.
  - issues[] is ordered by requirement_id, category, and description.
  - issue_id values are zero-padded report-order ordinals.
  - auto_fixes_applied[] and needs_user_clarification[] are ordered by referenced issue_id.
  - fix_id values use FIX-0001 style.
  - question_id values use Q-0001 style.
  - Equivalent reruns preserve byte-stable ordering.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: quality_report_determinism_drift
reasoning_tier: high
context_scope: requirements_quality
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/requirements_quality_report.schema.json
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: chain_wizard_deterministic_quality_report_shaping
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0096
preserved_exact_tokens:
  - "ISS-0001"
  - "FIX-0001"
  - "Q-0001"
  - "byte-stable ordering"
  - "Invariant:INV-005"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-102 - Requirements Quality Escalation Trigger

```yaml
plan_unit_id: CWF-102
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Auditor certification reads the post-repair requirements_quality_report and triggers user
  escalation only when needs_user_clarification is non-empty, while never
  editing product requirements.
gui_related: false
gui_classification_reason: Escalation trigger evaluation is backend validation and state transition logic.
split_recommended: false
depends_on: [CWF-083, CWF-100, CWF-101]
unblocks: [CWF-103, CWF-104, CWF-105, CWF-106]
acceptance_criteria:
  - Auditor certification reads the quality report and triggers only the escalation path defined here.
  - Auditor certification never edits product requirements.
  - Escalation fires when final post-repair needs_user_clarification[] is non-empty.
  - No escalation fires when bounded Auditor repair autofixes resolve all blocking issues.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: quality_escalation_trigger_drift
reasoning_tier: high
context_scope: requirements_quality_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/requirements_quality_report.schema.json
node_compile_hint:
  mode: chain_wizard_quality_escalation_trigger
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0097
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0098
preserved_exact_tokens:
  - "Requirements Quality Escalation Semantics"
  - "needs_user_clarification[]"
  - "No escalation fires"
negative_constraints:
  - "Pass 3 never edits product requirements."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-103 - Attention Required Wizard State

```yaml
plan_unit_id: CWF-103
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Quality escalation moves the wizard to attention_required, disables proceed
  actions, marks the triggering step, and returns to normal only after answers
  produce a passing quality report with no clarification entries.
gui_related: true
gui_classification_reason: Disabled buttons and lock or warning badge are visible wizard state and control behavior.
split_recommended: false
depends_on: [CWF-102]
unblocks: [CWF-104, CWF-105, CWF-106]
acceptance_criteria:
  - Escalation sets wizard state to attention_required.
  - Proceed and Start Run are disabled while attention is required.
  - A lock icon or warning badge appears on the triggering wizard step.
  - Normal state resumes only after all clarification entries are answered.
  - Auditor audit/repair cycles rerun with injected answers.
  - The resumed report has verdict PASS and empty needs_user_clarification[].
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: attention_required_state_drift
reasoning_tier: high
context_scope: requirements_quality_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_attention_required_state
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0099
preserved_exact_tokens:
  - "attention_required"
  - "Proceed"
  - "Start Run"
  - "lock icon or warning badge"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-104 - Thread Clarification Surface

```yaml
plan_unit_id: CWF-104
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Requirements clarification appears in the relevant chain/wizard chat thread
  as a clarification_request system message with full questions, wizard step,
  and resume URL, while the thread list shows unanswered-question count.
gui_related: true
gui_classification_reason: Thread message and thread-list badge are user-visible chat UI surfaces.
split_recommended: false
depends_on: [CWF-102, CWF-103]
unblocks: [CWF-109]
acceptance_criteria:
  - Both mandatory UI surfaces exist.
  - The relevant chain/wizard thread receives a system message.
  - The message type is clarification_request.
  - The message carries questions[], wizard_step, and resume_url.
  - The thread list entry shows a badge count of unanswered questions.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: thread_clarification_surface_drift
reasoning_tier: standard
context_scope: requirements_quality_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_thread_clarification_surface
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0100
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0101
preserved_exact_tokens:
  - "Mandatory — Both Required"
  - "clarification_request"
  - "questions[]"
  - "wizard_step"
  - "resume_url"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
```

### CWF-105 - Dashboard Attention Required Card

```yaml
plan_unit_id: CWF-105
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Requirements clarification also appears on the Dashboard under Attention
  Required as a card with canonical fields, Resume Wizard and View in Thread
  actions, and automatic dismissal when the wizard leaves attention_required.
gui_related: true
gui_classification_reason: Dashboard card fields, section placement, and actions are user-visible UI behavior.
split_recommended: false
depends_on: [CWF-102, CWF-103]
unblocks: [CWF-109]
acceptance_criteria:
  - A Dashboard card appears under Attention Required.
  - The card title is Requirements need your input.
  - The card carries reason, wizard_id, wizard_step, question_count, and resume_url.
  - Resume Wizard deep-links to the wizard at the blocked step.
  - View in Thread opens the thread containing the clarification_request message.
  - The card dismisses automatically when all questions are answered and wizard state is no longer attention_required.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dashboard_attention_card_drift
reasoning_tier: standard
context_scope: requirements_quality_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_dashboard_attention_required_card
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0100
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0102
preserved_exact_tokens:
  - "Attention Required"
  - "Requirements need your input"
  - "Resume Wizard"
  - "View in Thread"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-106 - Clarification Payload Storage

```yaml
plan_unit_id: CWF-106
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The canonical requirements quality report is stored under project traceability,
  linked from the wizard record through attention_required_report_path, and
  regenerated at the same path after clarification answers are injected.
gui_related: false
gui_classification_reason: Clarification payload storage is artifact and database state behavior.
split_recommended: false
depends_on: [CWF-102, CWF-103]
unblocks: [CWF-107, CWF-108]
acceptance_criteria:
  - The report is stored at .puppet-master/project/traceability/requirements_quality_report.json.
  - The wizard record gains attention_required_report_path.
  - Answer submission reruns Auditor audit/repair cycles with answers injected.
  - The canonical quality report file is regenerated at the same path and the pointer is updated.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: clarification_storage_drift
reasoning_tier: high
context_scope: requirements_quality_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_clarification_payload_storage
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0103
preserved_exact_tokens:
  - ".puppet-master/project/traceability/requirements_quality_report.json"
  - "attention_required_report_path"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-107 - Clarification Round Cap

```yaml
plan_unit_id: CWF-107
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  A clarification cycle is report, answer submission, and automatic Auditor
  audit/repair rerun; each wizard instance is capped at three cycles and becomes
  blocked if questions remain after the third cycle.
gui_related: false
gui_classification_reason: Cycle counting and blocked transition are backend wizard-state rules.
split_recommended: true
split_recommendation_reason: Source span S0104 mixes round-cap state rules with visible blocked copy and override evidence.
depends_on: [CWF-106]
unblocks: [CWF-108]
acceptance_criteria:
  - A cycle includes a report with non-empty needs_user_clarification[].
  - A cycle includes user answer submission.
  - A cycle includes automatic Auditor audit/repair rerun.
  - Maximum clarification cycles for one wizard instance is 3.
  - Cycles 1 and 2 remain in active clarification when follow-up questions remain.
  - After cycle 3 still produces non-empty needs_user_clarification[], wizard state becomes blocked.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: clarification_cycle_cap_drift
reasoning_tier: high
context_scope: requirements_quality_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: chain_wizard_clarification_round_cap
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0104
preserved_exact_tokens:
  - "maximum clarification cycles"
  - "3"
  - "blocked"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
```

### CWF-108 - Blocked Clarification Override Evidence

```yaml
plan_unit_id: CWF-108
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Blocked clarification disables proceed actions, explains repeated failure to
  resolve requirements, preserves the latest canonical quality report, forbids
  further automatic requirement rewrites without explicit user input, and allows
  override only with risk acknowledgement, gate permission, and evidence.
gui_related: true
gui_classification_reason: Blocked copy, disabled actions, and override affordance are user-visible wizard behavior backed by evidence policy.
split_recommended: true
split_recommendation_reason: Source span S0104 mixes backend cycle cap with visible blocked and override semantics.
depends_on: [CWF-107]
unblocks: []
acceptance_criteria:
  - blocked disables Proceed and Start Run exactly like the clarification hold state.
  - UI copy explains that repeated clarification attempts did not resolve the requirements set.
  - Puppet Master preserves the latest canonical quality report.
  - Puppet Master does not auto-rewrite requirements further without new explicit user input.
  - Override is offered only after risk acknowledgement and downstream gate permission.
  - Override is recorded as evidence.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_override_evidence_drift
reasoning_tier: high
context_scope: requirements_quality_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: chain_wizard_blocked_clarification_override_evidence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0104
preserved_exact_tokens:
  - "MUST preserve the latest canonical quality report"
  - "MUST NOT auto-rewrite requirements further without new explicit user input"
  - "recorded as evidence"
negative_constraints:
  - "Puppet Master MUST NOT auto-rewrite requirements further without new explicit user input."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
```

### CWF-109 - Shared Questionnaire Alignment

```yaml
plan_unit_id: CWF-109
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard clarification uses the shared question and /questionnaire contract plus
  QuestionItem shape, preserving stable IDs, shared answer fields, draft/resume
  behavior, and prohibiting wizard-local prompt, status, or draft names.
gui_related: false
gui_classification_reason: Questionnaire envelope and item-shape alignment are shared contract semantics consumed by UI surfaces.
split_recommended: false
depends_on: [CWF-104, CWF-105]
unblocks: []
acceptance_criteria:
  - Clarification uses the shared question / /questionnaire contract.
  - Clarification uses QuestionItem rather than a wizard-local prompt schema.
  - Wizard consumes question_id, question, options[], required, multi_select, allow_freeform, and default_values.
  - question_id remains stable across thread, wizard, and stored report state.
  - Per-question display text is question and prompt is only envelope/header side.
  - Required questions gate submit.
  - Dismiss pauses the flow and resume restores outstanding questionnaire from PM-managed draft state or submitted outcome.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: questionnaire_contract_drift
reasoning_tier: high
context_scope: requirements_quality_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Tools.md
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: chain_wizard_shared_questionnaire_alignment
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0105
preserved_exact_tokens:
  - "QuestionItem"
  - "question_id"
  - "draft_value"
negative_constraints:
  - "The wizard does not invent alternate status or draft/resume names."
  - "prompt is allowed only on the envelope/header side and must not become the per-question field."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Tools.md
  - Plans/assistant-chat-design.md
```

### CWF-110 - Builder Stage Taxonomy and Default Personas

```yaml
plan_unit_id: CWF-110
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Requirements Builder and related wizard generation/review work distinguish
  intake, drafting, domain-specialized fragment generation, quality review, and
  final review stages, with default top-level wizard personas for Interview,
  Planning, Execution, and Review.
gui_related: false
gui_classification_reason: Builder stage taxonomy and default persona selection are orchestration semantics.
split_recommended: false
depends_on: []
unblocks: [CWF-111, CWF-115, CWF-116]
acceptance_criteria:
  - Builder stages include intake / clarification, drafting, domain-specialized fragment generation, quality review, and final review / multi-pass review.
  - Interview stage uses the interview persona by default.
  - Planning stage uses the planning / architect persona by default.
  - Execution stage uses the executor persona by default.
  - Review stage uses the reviewer persona by default.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_persona_stage_drift
reasoning_tier: standard
context_scope: builder_personas
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Personas.md
node_compile_hint:
  mode: chain_wizard_builder_stage_taxonomy_default_personas
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0106
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0107
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0108
preserved_exact_tokens:
  - "Requirements Builder Persona Strategy Addendum (2026-03-06)"
  - "domain-specialized fragment generation"
  - "planning / architect persona"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Personas.md
```

### CWF-111 - Deterministic Builder Persona Resolver

```yaml
plan_unit_id: CWF-111
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Requirements Builder resolves Personas in deterministic priority order from
  explicit override to configured mapping, stage default, and general-purpose
  fallback, with collaborator intake bias, reviewer-pass separation, and
  persona_registry validity.
gui_related: false
gui_classification_reason: Persona resolution is runtime selection logic rather than visible presentation.
split_recommended: false
depends_on: [CWF-110]
unblocks: [CWF-112, CWF-113, CWF-114, CWF-115, CWF-116]
acceptance_criteria:
  - Explicit stage/pass override has highest priority when present.
  - Configured stage/pass mapping is used before stage default.
  - general-purpose is the final fallback.
  - Intake and clarification bias toward collaborator unless explicitly overridden.
  - Review passes do not silently reuse the drafting Persona when a reviewer Persona mapping exists.
  - Automatic resolution returns only IDs valid in persona_registry.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_persona_resolution_drift
reasoning_tier: high
context_scope: builder_personas
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Personas.md
  - Plans/Prompt_Pipeline.md
  - Plans/FinalGUISpec.md#178-interviewbuilderorchestrator-mapping-editors
node_compile_hint:
  mode: chain_wizard_deterministic_builder_persona_resolver
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0109
preserved_exact_tokens:
  - "general-purpose"
  - "collaborator"
  - "persona_registry"
negative_constraints:
  - "Review passes MUST NOT silently reuse the drafting Persona when a reviewer Persona mapping exists."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Personas.md
  - Plans/Prompt_Pipeline.md
```

### CWF-112 - Review Pass Persona Key Contract

```yaml
plan_unit_id: CWF-112
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  review_pass_personas persists canonical ordinal pass_1 through pass_5 keys,
  treats extra or unmapped keys deterministically, may display human labels in
  the GUI, and does not override final synthesis or writer behavior.
gui_related: true
gui_classification_reason: The unit preserves persistence key rules plus compatibility-limited GUI label handling for review-pass persona mapping.
split_recommended: false
depends_on: [CWF-111]
unblocks: [CWF-113, CWF-114]
acceptance_criteria:
  - review_pass_personas uses canonical ordinal keys pass_1 through pass_5.
  - Extra keys are ignored when a configured run uses fewer passes.
  - Unmapped passes fall back to deterministic reviewer-selection rules in section 5.6.
  - GUI labels may display Pass 1, Pass 2, and similar labels only for legacy/imported Multi-Pass Review compatibility rows; active UI copy uses reviewer-pass ordinal wording, and persistence uses canonical keys.
  - Final synthesis/writer step is not implicitly overwritten by reviewer-pass mappings.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: review_pass_persona_key_drift
reasoning_tier: high
context_scope: builder_personas
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md#178-interviewbuilderorchestrator-mapping-editors
node_compile_hint:
  mode: chain_wizard_review_pass_persona_key_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0110
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0111
preserved_exact_tokens:
  - "review_pass_personas"
  - "pass_1"
  - "pass_5"
  - "Pass 1"
negative_constraints:
  - "The final synthesis/writer step remains governed by the Builder workflow and is not implicitly overwritten by reviewer-pass mappings."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
```

### CWF-113 - Builder Persona Settings Config

```yaml
plan_unit_id: CWF-113
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Builder Persona settings persist a canonical config object with mode,
  stage_personas, review_pass_personas, optional platform/model overrides, and
  optional next-execution override as the backing store for the mapping editor.
gui_related: true
gui_classification_reason: The persisted config backs the Builder Persona mapping editor required by the GUI spec.
split_recommended: false
depends_on: [CWF-111, CWF-112]
unblocks: [CWF-114, CWF-117]
acceptance_criteria:
  - Config mode is one of manual, auto, or hybrid.
  - Config includes stage_personas and review_pass_personas.
  - Config supports optional per-mapping platform/model overrides.
  - Config supports an optional explicit override for the next eligible Builder execution.
  - The config backs the FinalGUISpec section 17.8 mapping editor.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_persona_config_drift
reasoning_tier: high
context_scope: builder_personas
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md#178-interviewbuilderorchestrator-mapping-editors
  - Plans/Personas.md
node_compile_hint:
  mode: chain_wizard_builder_persona_settings_config
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0111
preserved_exact_tokens:
  - "manual | auto | hybrid"
  - "stage_personas"
  - "review_pass_personas"
  - "mapping editor"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-114 - Builder Requested Effective Runtime Record

```yaml
plan_unit_id: CWF-114
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Every Builder stage or pass persists and exposes requested/effective Persona,
  selection, platform, model, control, and provider identity fields using the
  same canonical requested/effective record as other surfaces.
gui_related: true
gui_classification_reason: The record is exposed to Builder activity/status UIs, even though the canonical record is shared runtime state.
split_recommended: false
depends_on: [CWF-111, CWF-113]
unblocks: [CWF-118]
acceptance_criteria:
  - Each stage/pass persists requested_persona, effective_persona, persona_selection_source, and selection_reason.
  - Each stage/pass persists effective_platform and effective_model.
  - applied_persona_controls[] and skipped_persona_controls[] are exposed.
  - requested_model_provider_id and effective_model_provider_id are included when provider-specific runtime IDs are available.
  - Builder activity/status UIs use the same canonical requested/effective record as other surfaces.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_runtime_identity_drift
reasoning_tier: high
context_scope: builder_personas
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_builder_requested_effective_runtime_record
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0112
preserved_exact_tokens:
  - "requested_persona"
  - "effective_persona"
  - "persona_selection_source"
  - "skipped_persona_controls[]"
  - "requested_model_provider_id"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Prompt_Pipeline.md
```

### CWF-115 - Intake and Drafting Persona Behavior

```yaml
plan_unit_id: CWF-115
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Intake defaults to collaborator-style clarification behavior, while drafting
  uses workflow-resolved drafting Personas and may use technical-writer only
  when retained or explicitly configured without requiring a protected core
  document-writer Persona.
gui_related: false
gui_classification_reason: Intake and drafting Persona behavior is prompt/runtime behavior, not visual presentation.
split_recommended: false
depends_on: [CWF-110, CWF-111]
unblocks: [CWF-118]
acceptance_criteria:
  - Intake / clarification default Persona is collaborator.
  - Intake asks clarifying questions and suggests options and tradeoffs.
  - Drafting uses the workflow-resolved drafting Persona.
  - technical-writer may be used only when retained as an available specialty or explicitly configured for drafting.
  - Drafting does not require or recreate protected core document-writer.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_intake_drafting_persona_drift
reasoning_tier: standard
context_scope: builder_personas
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Personas.md
node_compile_hint:
  mode: chain_wizard_intake_drafting_persona_behavior
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0113
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0114
preserved_exact_tokens:
  - "collaborator"
  - "technical-writer"
  - "document-writer"
negative_constraints:
  - "Drafting MUST NOT require or recreate a protected core document-writer Persona."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Personas.md
```

### CWF-116 - Specialized and Review Persona Defaults

```yaml
plan_unit_id: CWF-116
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Domain-specialized fragment generation may use domain or language Personas,
  quality review defaults to requirements-quality-reviewer, and final
  review/Multi-Pass uses reviewer Personas such as requirements, code, security,
  and architect reviewers.
gui_related: false
gui_classification_reason: Specialized and review Persona defaults are runtime/persona routing behavior.
split_recommended: false
depends_on: [CWF-110, CWF-111]
unblocks: [CWF-118]
acceptance_criteria:
  - Domain-specialized fragment generation can use domain or language Personas as needed.
  - Preserved examples include security-engineer, devops-engineer, ux-researcher, rust-engineer, and frontend-developer.
  - Quality review defaults to requirements-quality-reviewer.
  - Final review / Multi-Pass can use requirements-quality-reviewer, code-reviewer, security-auditor, and architect-reviewer.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_review_persona_drift
reasoning_tier: standard
context_scope: builder_personas
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Personas.md
node_compile_hint:
  mode: chain_wizard_specialized_review_persona_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0115
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0116
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0117
preserved_exact_tokens:
  - "security-engineer"
  - "requirements-quality-reviewer"
  - "security-auditor"
  - "architect-reviewer"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Personas.md
```

### CWF-117 - Stage And Auditor Loop Platform Model Filtering

```yaml
plan_unit_id: CWF-117
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Requirements Builder settings allow platform and model selection per stage and
  use the Auditor validation loop for sweep pass reports while still enforcing
  provider capability filtering.
gui_related: false
gui_classification_reason: Provider capability filtering is runtime selection behavior.
split_recommended: false
depends_on: [CWF-113]
unblocks: [CWF-118]
acceptance_criteria:
  - Builder settings allow platform/model selection per stage.
  - Validation sweep pass reports use the Auditor validation loop provider/model.
  - Per-stage selections and Auditor loop selection pass through provider capability filtering.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_provider_filtering_drift
reasoning_tier: standard
context_scope: builder_personas
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Provider_OpenCode.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: chain_wizard_stage_auditor_platform_model_filtering
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0118
preserved_exact_tokens:
  - "platform/model selection per stage"
  - "Auditor validation loop"
  - "provider capability filtering"
negative_constraints:
  - "Do not keep independent provider/model settings per validation pass."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Provider_OpenCode.md
```

### CWF-118 - Builder Requested Effective UI Visibility

```yaml
plan_unit_id: CWF-118
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Requirements Builder UI exposes effective Persona, selection reason, effective
  platform/model, and skipped unsupported controls for the active stage or Auditor loop,
  while acceptance preserves stage/pass Persona selection, collaborator intake,
  non-required Document Writer, distinct reviewer Personas, and visibility.
gui_related: true
gui_classification_reason: This unit describes visible Builder UI runtime identity and control-skip disclosure.
split_recommended: false
depends_on: [CWF-114, CWF-115, CWF-116, CWF-117]
unblocks: []
acceptance_criteria:
  - Builder UI displays effective Persona, selection reason, effective platform/model, and skipped unsupported Persona controls.
  - Builder supports Persona selection by stage/pass.
  - Collaborator is the default intake/clarification Persona.
  - Drafting does not require a protected core Document Writer.
  - Reviewer Personas are distinct from drafting Personas for review passes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_runtime_visibility_drift
reasoning_tier: standard
context_scope: builder_personas
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_builder_requested_effective_ui_visibility
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0119
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0120
preserved_exact_tokens:
  - "effective Persona"
  - "selection reason"
  - "skipped unsupported Persona controls"
  - "Acceptance criteria addendum"
negative_constraints:
  - "Drafting does not require a protected core Document Writer."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-119 - Assistant Deep Plan Chain Wizard Escalation Optionality

```yaml
plan_unit_id: CWF-119
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Assistant Chat and Deep Plan may recommend escalation into Chain Wizard /
  Interview for larger work without losing collected context; the
  recommendation can come from intent detection, post-plan escalation, or
  explicit user request, remains user-facing and optional, and decline keeps the
  current flow with no hidden redirect.
gui_related: true
gui_classification_reason: User-facing recommendation, accept/decline choice, and no-hidden-redirect behavior are visible flow semantics.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Assistant Chat can escalate larger feature/enhancement work without cold-starting the interviewer.
  - Deep Plan can escalate larger feature/enhancement work without losing collected context.
  - Recommendation sources include Assistant Chat detection, Deep Plan post-plan escalation check, and explicit user request.
  - The recommendation is user-facing and optional.
  - The user may accept or decline.
  - Decline keeps the user in the current chat/planning flow with no hidden redirect.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: assistant_deep_plan_escalation_drift
reasoning_tier: standard
context_scope: assistant_wizard_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: chain_wizard_assistant_deep_plan_escalation_optionality
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0121
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0122
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0123
preserved_exact_tokens:
  - "Assistant / Deep Plan Escalation into Chain Wizard (2026-03-08)"
  - "without losing already-collected context"
  - "Assistant Chat natural-language detection"
  - "Deep Plan post-plan escalation check"
  - "user-facing and optional"
  - "no hidden redirect"
negative_constraints:
  - "Decline keeps the user in the current chat/planning flow with no hidden redirect."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
```

### CWF-120 - Feature Enhancement CTA Intent Mapping

```yaml
plan_unit_id: CWF-120
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Accepted Assistant Chat or Deep Plan recommendations for feature/enhancement
  work map friendly CTA copy to the canonical EnhanceRewriteAdd intent without
  minting a new intent.
gui_related: true
gui_classification_reason: The Add a new Feature or Enhancement CTA is user-facing entry copy.
split_recommended: false
depends_on: [CWF-119]
unblocks: [CWF-121, CWF-124]
acceptance_criteria:
  - Accepted feature/enhancement recommendations target EnhanceRewriteAdd.
  - Add a new Feature or Enhancement remains friendly CTA copy only.
  - CTA copy does not create or rename the canonical intent enum.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: intent_alias_drift
reasoning_tier: standard
context_scope: assistant_wizard_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: chain_wizard_feature_enhancement_cta_intent_mapping
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0124
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0129
preserved_exact_tokens:
  - "Add a new Feature or Enhancement"
  - "EnhanceRewriteAdd"
negative_constraints:
  - "Do not create a new canonical intent for the friendly CTA copy."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-121 - Assistant Deep Plan Typed Handoff Payload

```yaml
plan_unit_id: CWF-121
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Assistant Chat and Deep Plan create a typed handoff payload with source,
  reason, origin refs, project context, summaries, GUI hint, plan refs, TODO
  snapshot, questions, assumptions, excerpt refs, and optional phase/runtime
  hints.
gui_related: false
gui_classification_reason: Typed handoff payload shape is backend orchestration state.
split_recommended: false
depends_on: [CWF-120]
unblocks: [CWF-122, CWF-123, CWF-124, CWF-126]
acceptance_criteria:
  - Payload includes handoff_source and handoff_reason.
  - Payload includes origin_thread_id and origin_message_id.
  - Payload includes default_intent, project_id or project_path when available, user_goal, requirements_summary, scope_summary, codebase_summary, and has_gui_hint.
  - Payload includes plan_artifact_ref when available, plan_todo_snapshot[], open_questions[], assumptions[], and chat_excerpt_refs[].
  - Optional fields may include recommended_phase_hints[], effective_persona, effective_platform, and effective_model.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: assistant_handoff_payload_drift
reasoning_tier: high
context_scope: assistant_wizard_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_assistant_deep_plan_typed_handoff_payload
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0124
preserved_exact_tokens:
  - "handoff_source"
  - "handoff_reason"
  - "assistant_chat"
  - "deep_plan"
  - "has_gui_hint"
  - "plan_todo_snapshot[]"
  - "chat_excerpt_refs[]"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-122 - Handoff Runtime Attribution and Permission Lineage

```yaml
plan_unit_id: CWF-122
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard handoff carries runtime attribution, validation lineage, and permission
  identity explicitly rather than by implication, preserving effective account
  and execution role across the handoff.
gui_related: false
gui_classification_reason: Runtime attribution and permission carry-through are backend lineage semantics.
split_recommended: false
depends_on: [CWF-121]
unblocks: [CWF-139]
acceptance_criteria:
  - Handoff payload includes node_id, attempt_id, lane_id, package_id, execution_role, effective_account_id, operational_identity, workflow_run_id, and run_id.
  - Canonical terms include auditor_cycle_report.
  - validation_pass_report is allowed only as a legacy mirror with compatibility_only true and cycle_report_ref.
  - Handoff explicitly carries validation lineage.
  - effective account and execution role survive wizard handoff payloads.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: handoff_lineage_permission_drift
reasoning_tier: high
context_scope: assistant_wizard_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_handoff_runtime_attribution_permission_lineage
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0124
preserved_exact_tokens:
  - "node_id"
  - "attempt_id"
  - "lane_id"
  - "package_id"
  - "execution_role"
  - "effective_account_id"
  - "operational_identity"
  - "auditor_cycle_report"
  - "validation_pass_report"
  - "compatibility_only"
  - "cycle_report_ref"
negative_constraints: []
compatibility_only_notes:
  - "validation_pass_report is a legacy mirror only and must carry compatibility_only true plus cycle_report_ref to auditor_cycle_report."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-123 - Imported Handoff State Persistence

```yaml
plan_unit_id: CWF-123
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  ChainWizardState persists assistant handoff fields for recovery, resume,
  audit, and user visibility while using imported context only to seed canonical
  requirements and interview artifacts.
gui_related: true
gui_classification_reason: The persisted fields are auditable and user-visible even though they are stored state.
split_recommended: true
split_recommendation_reason: Source span S0125 mixes backend recovery state with user-visible audit expectations.
depends_on: [CWF-121]
unblocks: [CWF-124, CWF-126]
acceptance_criteria:
  - ChainWizardState or equivalent state includes assistant_handoff_ref, assistant_handoff_source, assistant_handoff_reason, imported_plan_ref, imported_has_gui_hint, and imported_context_summary_ref.
  - These fields persist for recovery and resume.
  - These fields are auditable and user-visible.
  - These fields seed canonical requirements/interview artifacts and do not replace them.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: imported_handoff_state_drift
reasoning_tier: high
context_scope: assistant_wizard_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: chain_wizard_imported_handoff_state_persistence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0125
preserved_exact_tokens:
  - "assistant_handoff_ref"
  - "assistant_handoff_source"
  - "assistant_handoff_reason"
  - "imported_plan_ref"
  - "imported_has_gui_hint"
  - "imported_context_summary_ref"
negative_constraints:
  - "Imported handoff fields do not replace canonical requirements/interview artifacts; they seed them."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-124 - Context Aware Wizard Launch After Acceptance

```yaml
plan_unit_id: CWF-124
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Accepted assistant/deep-plan handoffs open a preloaded EnhanceRewriteAdd path
  when project context is known or project-setup review when it is missing,
  never a blank intent picker, with imported context visible and in scope.
gui_related: true
gui_classification_reason: Wizard launch route, visible origin, and imported context visibility are user-facing flow behavior.
split_recommended: false
depends_on: [CWF-120, CWF-121, CWF-123]
unblocks: [CWF-125, CWF-126]
acceptance_criteria:
  - Known project context opens a preloaded EnhanceRewriteAdd path.
  - Known project context lands in the requirements/interview-ready path rather than a blank intent picker.
  - Missing project context opens with imported context preserved and lands on project-setup review first.
  - The wizard shows it was opened from Assistant Chat / Deep Plan.
  - The user can continue into the interview with imported materials in scope.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: context_aware_launch_drift
reasoning_tier: standard
context_scope: assistant_wizard_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_context_aware_launch_after_acceptance
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0126
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0129
preserved_exact_tokens:
  - "EnhanceRewriteAdd"
  - "project-setup review path"
  - "Assistant Chat / Deep Plan"
negative_constraints:
  - "Accepted handoffs do not land on a blank intent picker."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-125 - Handoff Evidence Quality Preservation

```yaml
plan_unit_id: CWF-125
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Imported handoff bundles preserve redaction, truncation, and omission metadata
  instead of flattening evidence quality during wizard handoff.
gui_related: false
gui_classification_reason: Evidence quality preservation is artifact metadata behavior.
split_recommended: false
depends_on: [CWF-121, CWF-124]
unblocks: [CWF-126, CWF-140]
acceptance_criteria:
  - Imported bundles preserve redaction_state.
  - Imported bundles preserve truncation_state.
  - Imported bundles preserve omission metadata.
  - Imported context remains visible and auditable without flattening evidence quality.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: handoff_evidence_quality_drift
reasoning_tier: high
context_scope: assistant_wizard_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_handoff_evidence_quality_preservation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0126
preserved_exact_tokens:
  - "redaction_state"
  - "truncation_state"
  - "omission metadata"
negative_constraints:
  - "Imported bundles must not flatten evidence quality during wizard handoff."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-126 - Interview Ownership After Handoff

```yaml
plan_unit_id: CWF-126
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  After assistant/deep-plan handoff, Interview still owns scoping and adaptive
  phase selection; imported context informs the first question and phase
  selector but the normalized phase_plan remains the source of truth.
gui_related: false
gui_classification_reason: Interview ownership and phase-plan authority are orchestration semantics.
split_recommended: false
depends_on: [CWF-121, CWF-124, CWF-125]
unblocks: [CWF-127]
acceptance_criteria:
  - Phase 0 scope probe still runs.
  - The interviewer receives the imported handoff bundle before the first question.
  - Imported plan context is not treated as an already-approved project artifact.
  - The phase selector may use imported context as input.
  - The normalized phase_plan remains the source of truth.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: interview_ownership_handoff_drift
reasoning_tier: high
context_scope: assistant_wizard_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: chain_wizard_interview_ownership_after_handoff
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0127
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0129
preserved_exact_tokens:
  - "phase 0 scope probe"
  - "phase_plan"
  - "source of truth"
negative_constraints:
  - "Imported plans act as context, not as already-approved project artifacts."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
```

### CWF-127 - Adaptive Phase Pruning Across Intents

```yaml
plan_unit_id: CWF-127
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Adaptive phase pruning applies across all chain-wizard intents, using imported
  feature/enhancement evidence to skip or shorten irrelevant UX, persistence,
  and deployment phases while keeping testing at least Short except pure
  non-runtime documentation and keeping the local normalizer authoritative.
gui_related: true
gui_classification_reason: Phase pruning affects user-visible interview flow, especially product_ux skipping.
split_recommended: false
depends_on: [CWF-126]
unblocks: []
acceptance_criteria:
  - Pruning applies to NewProject, ForkAndEvolve, EnhanceRewriteAdd, and ContributePr.
  - product_ux defaults to Skip when has_gui = false or strong evidence indicates no UI impact unless the user asks for UX/UI work.
  - data_persistence and deployment_environments may default to Short or Skip when imported context shows no impact.
  - testing_verification remains at least Short except purely non-functional documentation with no runtime effect.
  - Imported plan recommendations may suggest phase hints.
  - The local phase-manager normalizer remains authoritative.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: adaptive_phase_pruning_drift
reasoning_tier: high
context_scope: assistant_wizard_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: chain_wizard_adaptive_phase_pruning_across_intents
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0128
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0129
preserved_exact_tokens:
  - "product_ux"
  - "Skip"
  - "Short"
  - "testing_verification"
  - "NewProject"
  - "ForkAndEvolve"
  - "ContributePr"
negative_constraints:
  - "Imported phase hints do not override the local phase-manager normalizer."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-128 - Wizard Status Reference Consolidation

```yaml
plan_unit_id: CWF-128
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Later blocked-state and enum addenda defer to the canonical wizard_status
  definition in section 2.1 and preserve cross-doc ContractRefs without
  duplicating enum semantics.
gui_related: false
gui_classification_reason: This is a compatibility/reference consolidation, not GUI behavior.
split_recommended: false
depends_on: [CWF-010]
unblocks: [CWF-129, CWF-137, CWF-138]
acceptance_criteria:
  - Clarification Escalation and Draft Decomposition Addendum references canonical wizard_status in section 2.1.
  - Canonical Wizard Blocked-State Canonical Alignment references canonical wizard_status in section 2.1.
  - Canonical Wizard Blocked Lifecycle references canonical wizard_status in section 2.1.
  - Wizard Status Enum Correction Addendum references canonical wizard_status in section 2.1.
  - ContractRefs to Contracts_V0.md, FinalGUISpec.md, and assistant-chat-design.md are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wizard_status_duplicate_drift
reasoning_tier: standard
context_scope: blocked_lifecycle
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: chain_wizard_status_reference_consolidation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0130
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0131
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0141
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0145
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0148
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0149
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0152
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0153
preserved_exact_tokens:
  - "wizard_status"
  - "See canonical `wizard_status` definition in §2.1."
negative_constraints:
  - "Do not duplicate or fork the canonical wizard_status enum semantics outside section 2.1."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
```

### CWF-129 - Attention Required Versus Blocked Semantics

```yaml
plan_unit_id: CWF-129
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  attention_required means the current clarification cycle can still resolve the
  issue set, while blocked means automatic progress is exhausted or impossible;
  Debug budget trips preserve investigation.budget_exhausted with budget_kind.
gui_related: false
gui_classification_reason: State semantics and stop_reason_code preservation are runtime contract behavior.
split_recommended: false
depends_on: [CWF-128]
unblocks: [CWF-130, CWF-131, CWF-136]
acceptance_criteria:
  - attention_required means current clarification can continue.
  - blocked means clarification rounds are exhausted or automatic progress cannot continue.
  - Debug investigation budget trips may surface as failed or attention_required depending on recovery usefulness.
  - Machine-readable stop_reason_code remains investigation.budget_exhausted.
  - Budget exhaustion carries budget_kind.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: attention_blocked_semantics_drift
reasoning_tier: high
context_scope: blocked_lifecycle
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: chain_wizard_attention_required_blocked_semantics
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0132
preserved_exact_tokens:
  - "attention_required"
  - "blocked"
  - "stop_reason_code"
  - "investigation.budget_exhausted"
  - "budget_kind"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-130 - Blocked Controls Copy and Rewrite Stop

```yaml
plan_unit_id: CWF-130
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Blocked state disables proceed actions, explains unresolved repeated
  clarification, preserves the latest canonical quality report, and stops
  automatic requirement rewrites unless new explicit user input arrives.
gui_related: true
gui_classification_reason: Disabled controls and explanatory copy are user-visible wizard behavior.
split_recommended: false
depends_on: [CWF-129]
unblocks: [CWF-131, CWF-136]
acceptance_criteria:
  - Proceed remains disabled in blocked state.
  - Start Run remains disabled in blocked state.
  - UI copy explains repeated clarification attempts did not resolve the issue set.
  - Latest canonical quality report remains preserved.
  - No further automatic rewrite of requirements happens without new explicit user input.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_copy_rewrite_drift
reasoning_tier: high
context_scope: blocked_lifecycle
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_blocked_controls_copy_rewrite_stop
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0132
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0135
preserved_exact_tokens:
  - "Proceed"
  - "Start Run"
  - "no further automatic rewrite"
negative_constraints:
  - "No further automatic rewrite of requirements may happen without new explicit user input."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-131 - Wizard Attention Blocked Resume Packet

```yaml
plan_unit_id: CWF-131
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard packets support both wizard_attention_required and wizard_blocked with
  shared resume/deep-link fields so dashboard, thread, and resume behavior works
  for both states.
gui_related: false
gui_classification_reason: Packet field shape is shared runtime contract semantics.
split_recommended: false
depends_on: [CWF-129, CWF-130]
unblocks: [CWF-141]
acceptance_criteria:
  - Wizard packet supports wizard_attention_required.
  - Wizard packet supports wizard_blocked.
  - Shared fields include wizard_id, wizard_step, report_ref, resume_url, thread_id?, and status.
  - Resume/deep-link behavior works for attention_required and blocked.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wizard_packet_resume_drift
reasoning_tier: high
context_scope: blocked_lifecycle
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: chain_wizard_attention_blocked_resume_packet
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0133
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0135
preserved_exact_tokens:
  - "wizard_attention_required"
  - "wizard_blocked"
  - "resume_url"
  - "thread_id?"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
```

### CWF-132 - Pre Lock Draft Decomposition Degradation

```yaml
plan_unit_id: CWF-132
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Before canonical graph lock, invalid or cyclic adaptive decomposition may
  degrade to deterministic flat draft sequencing only when the degraded draft
  structure is tagged, warning evidence is emitted, and the degradation reason is
  preserved.
gui_related: false
gui_classification_reason: Draft decomposition degradation is graph/draft planning behavior.
split_recommended: false
depends_on: []
unblocks: [CWF-133, CWF-134, CWF-135]
acceptance_criteria:
  - Pre-canonical invalid or cyclic decomposition may degrade to deterministic flat draft sequencing.
  - Degraded fallback output is tagged as degraded draft structure.
  - Warning evidence is emitted.
  - The reason for degradation is preserved.
  - Draft decomposition degradation is evidence-backed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: prelock_degradation_drift
reasoning_tier: high
context_scope: draft_decomposition
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Executor_Protocol.md
  - Plans/interview-subagent-integration.md
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: chain_wizard_prelock_draft_decomposition_degradation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0134
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0135
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0136
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0137
preserved_exact_tokens:
  - "deterministic flat draft sequencing"
  - "degraded draft structure"
  - "warning evidence"
  - "ContractName:Plans/Executor_Protocol.md"
negative_constraints:
  - "Deterministic flat draft fallback is allowed only before graph lock."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Executor_Protocol.md
```

### CWF-133 - Post Lock Decomposition Integrity Block

```yaml
plan_unit_id: CWF-133
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  After graph lock, invalid canonical decomposition is a blocking integrity
  problem rather than a graceful fallback, and the wizard stops forward
  execution while surfacing repair or replan.
gui_related: false
gui_classification_reason: Post-lock integrity handling is planning/runtime gate behavior.
split_recommended: false
depends_on: [CWF-132]
unblocks: [CWF-134]
acceptance_criteria:
  - After graph lock, invalid canonical decomposition is blocking.
  - After graph lock, invalid decomposition is not treated as graceful fallback.
  - Wizard forward execution stops.
  - The wizard surfaces a repair/replan path.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: postlock_integrity_fallback_drift
reasoning_tier: high
context_scope: draft_decomposition
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Executor_Protocol.md
  - Plans/Decision_Policy.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: chain_wizard_postlock_decomposition_integrity_block
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0135
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0138
preserved_exact_tokens:
  - "blocking integrity problem"
  - "repair/replan path"
negative_constraints:
  - "After graph lock, invalid canonical decomposition is not a graceful fallback case."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Decision_Policy.md
```

### CWF-134 - Degradation and Recovery State Fields

```yaml
plan_unit_id: CWF-134
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard state persists attention, blocked, report, resume, recovery,
  degradation, and replan fields needed to audit blocked/degraded lifecycle and
  recovery attempts.
gui_related: false
gui_classification_reason: Persisted recovery and degradation fields are storage/runtime contract semantics.
split_recommended: false
depends_on: [CWF-132, CWF-133]
unblocks: [CWF-137]
acceptance_criteria:
  - State persists attention_required_reason and blocked_reason_code.
  - State persists clarification_round_count and latest_quality_report_ref.
  - State persists resume_url and attempted_recovery_actions[].
  - State persists decomposition_degraded, degradation reason, and active replan_generation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: degradation_recovery_field_drift
reasoning_tier: high
context_scope: blocked_lifecycle
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: chain_wizard_degradation_recovery_state_fields
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0139
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0143
preserved_exact_tokens:
  - "attention_required_reason"
  - "blocked_reason_code"
  - "latest_quality_report_ref"
  - "attempted_recovery_actions[]"
  - "decomposition_degraded"
  - "replan_generation"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-135 - Wizard Status UX Differentiation

```yaml
plan_unit_id: CWF-135
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard UX differentiates clarification still pending, blocked on correction,
  auth, approval, or integrity, and degraded-but-usable draft structure before
  lock.
gui_related: true
gui_classification_reason: This unit defines visible state differentiation in the wizard.
split_recommended: false
depends_on: [CWF-129, CWF-132]
unblocks: [CWF-136]
acceptance_criteria:
  - UI distinguishes clarification still pending as attention_required.
  - UI distinguishes blocked on user correction, auth, approval, or integrity as blocked.
  - UI distinguishes degraded but still usable draft structure before lock.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wizard_status_ux_drift
reasoning_tier: standard
context_scope: blocked_lifecycle
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_status_ux_differentiation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0140
preserved_exact_tokens:
  - "clarification still pending"
  - "blocked on user correction / auth / approval / integrity"
  - "degraded but still usable draft structure before lock"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-136 - Block Escalation Thresholds

```yaml
plan_unit_id: CWF-136
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard remains attention_required while the current loop can resolve the issue
  set and escalates to blocked after three unresolved clarification rounds or
  when the next action cannot be completed inside the current flow.
gui_related: true
gui_classification_reason: Escalation changes visible wizard attention or blocked state.
split_recommended: false
depends_on: [CWF-129, CWF-130, CWF-135]
unblocks: [CWF-137, CWF-138]
acceptance_criteria:
  - Wizard remains attention_required while the current clarification/review loop can still resolve the issue set.
  - Wizard escalates to blocked when clarification_round_count reaches 3 without clearing blocking issues.
  - Wizard escalates to blocked when the next required action needs auth recovery outside the current flow.
  - Wizard escalates to blocked when explicit user correction outside the inline form or replan approval is required.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_escalation_threshold_drift
reasoning_tier: high
context_scope: blocked_lifecycle
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_block_escalation_thresholds
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0142
preserved_exact_tokens:
  - "clarification_round_count"
  - "3"
  - "auth recovery"
  - "replan approval"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-137 - Canonical Wizard Blocked Record Payload

```yaml
plan_unit_id: CWF-137
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Canonical blocked records persist wizard identity, step, reason, round count,
  report and resume refs, degradation fields, replan generation, and attempted
  recovery action IDs, preserving repeated cross-doc contract ownership.
gui_related: false
gui_classification_reason: Blocked record payload shape is storage/runtime contract semantics.
split_recommended: false
depends_on: [CWF-128, CWF-134, CWF-136]
unblocks: [CWF-138, CWF-141]
acceptance_criteria:
  - Blocked records persist wizard_id and wizard_step.
  - Blocked records persist blocked_reason_code and clarification_round_count.
  - Blocked records persist report_ref and resume_url?.
  - Blocked records persist decomposition_degraded, degradation_reason?, replan_generation?, and attempted_recovery_action_ids[].
  - ContractRefs to Contracts_V0.md, storage-plan.md, and assistant-chat-design.md remain preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_record_payload_drift
reasoning_tier: high
context_scope: blocked_lifecycle
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: chain_wizard_canonical_blocked_record_payload
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0144
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0146
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0148
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0150
preserved_exact_tokens:
  - "wizard_id"
  - "wizard_step"
  - "blocked_reason_code"
  - "report_ref"
  - "resume_url?"
  - "attempted_recovery_action_ids[]"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
```

### CWF-138 - Blocked Clear and Counter Preservation Rules

```yaml
plan_unit_id: CWF-138
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  A wizard leaves blocked only when materially new input, resolved external
  prerequisites, new replan generation, or cancellation changes the blocked
  condition; reopening the same blocked wizard does not clear state or reset the
  clarification counter.
gui_related: false
gui_classification_reason: Blocked clear conditions and counter preservation are lifecycle contract semantics.
split_recommended: false
depends_on: [CWF-137]
unblocks: []
acceptance_criteria:
  - Materially new user input creating a new issue set can clear blocked.
  - Resolution of the external prerequisite named by blocked_reason_code can clear blocked.
  - A new replan_generation for the wizard context can clear blocked.
  - Wizard cancellation can clear blocked.
  - Reopening the same blocked wizard without those changes does not clear state.
  - Reopening the same blocked wizard without those changes does not reset clarification_round_count.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_clear_counter_drift
reasoning_tier: high
context_scope: blocked_lifecycle
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: chain_wizard_blocked_clear_counter_preservation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0147
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0151
preserved_exact_tokens:
  - "materially new user input"
  - "external prerequisite"
  - "replan_generation"
  - "does not reset `clarification_round_count`"
negative_constraints:
  - "Reopening the same blocked wizard without a material change does not clear blocked state."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-139 - Runtime Identity Carry Through For Wizard Planning

```yaml
plan_unit_id: CWF-139
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard planning output carries execution, lane, package, seam, attempt,
  node/tier, model/runtime, account, role, and operational identity fields so
  sweep and execution lineage can be explained.
gui_related: false
gui_classification_reason: Runtime identity carry-through is backend lineage and storage behavior.
split_recommended: true
split_recommendation_reason: Source span S0154 mixes runtime identity, routes, audit lineage, gates, GUI summaries, and compatibility vocabulary; this unit covers runtime identity only.
depends_on: [CWF-122]
unblocks: [CWF-141, CWF-146, CWF-147]
acceptance_criteria:
  - Planning output carries node_id, package_id, seam_id, lane_id, attempt_id, and tier_id where applicable.
  - Planning output preserves effective_identity, node-identity, tier-identity, /model, and /runtime context.
  - Handoff carries wizard_step, blocked_reason_code, clarification_round_count, report_ref, replan_generation, /degraded, execution-unit context, and account/role linkage.
  - Provider/account identity fields include effective_auth_mode, effective_account_id, effective_project_id, and operational_identity.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_identity_drift
reasoning_tier: high
context_scope: runtime_identity
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: chain_wizard_runtime_identity_carry_through
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0154
preserved_exact_tokens:
  - "seam_id"
  - "tier_id"
  - "effective_identity"
  - "effective_auth_mode"
  - "effective_account_id"
  - "effective_project_id"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
```

### CWF-140 - Audit Lineage Exact Value Preservation

```yaml
plan_unit_id: CWF-140
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Audit refinement tokens, gap IDs, exact counters, source model pass labels,
  and sweep labels are preserved as audit lineage, not broad summary labels,
  runtime model requirements, or new planning blockers.
gui_related: false
gui_classification_reason: Audit lineage exact-value preservation is governance memory, not GUI behavior.
split_recommended: true
split_recommendation_reason: Source span S0154 mixes dense audit lineage with active runtime and GUI route requirements; this unit isolates audit-only preservation.
depends_on: [CWF-125]
unblocks: []
acceptance_criteria:
  - Exact tokens such as supersedes_prior, wave-one, gap-007, gap-003, gap-004, gap-005, and gap-008 remain preserved.
  - Exact counters planning_blockers = 0, fix_backlog_items = 8, total_gaps = 8, docs_affected = 20, and underlying_gap_evidence_count = 62 remain audit lineage.
  - Source model-pass labels such as GPT-5.3-Codex are audit lineage, not wizard runtime model requirements.
  - Early broader-second-sweep and jumbo-doc read labels remain coverage lineage, not runtime states or generated project artifacts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: audit_lineage_value_loss
reasoning_tier: high
context_scope: audit_lineage
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_audit_lineage_exact_value_preservation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0154
preserved_exact_tokens:
  - "supersedes_prior"
  - "planning_blockers = 0"
  - "fix_backlog_items = 8"
  - "total_gaps = 8"
  - "docs_affected = 20"
  - "underlying_gap_evidence_count = 62"
  - "GPT-5.3-Codex"
negative_constraints:
  - "Audit labels are not wizard runtime model requirements or broad summary labels."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-141 - Shared Route Payloads and Typed Selectors

```yaml
plan_unit_id: CWF-141
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard, thread, search, card, and deep-link navigation normalize to shared
  route payloads and typed selectors, with serialized URLs used as anchors
  rather than a separate routing schema.
gui_related: true
gui_classification_reason: Route payloads drive visible navigation from cards, search results, threads, and wizard resume links.
split_recommended: true
split_recommendation_reason: Source span S0154 mixes route selectors with runtime identity, severity, gates, and compatibility vocabulary.
depends_on: [CWF-131, CWF-137, CWF-139]
unblocks: [CWF-147]
acceptance_criteria:
  - FinalGUISpec search clicks and wizard blocked state normalize to shared route payloads.
  - Shared route fields include resume_url, attention_required, blocked, blocked_reason_code, allowed_action_ids, and allowed_action_ids[].
  - wizard_step and usage_event_ref are not primary selectors.
  - Typed selectors include object_kind = wizard, object_id = <wizard_id>, target_kind = primary_view, project_id = <project_id>, and thread_id = <thread_id>.
  - Deep links preserve puppet-master://wizard/<wizard_id>/step/<wizard_step_id>/clarify as serialized anchors.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_payload_selector_drift
reasoning_tier: high
context_scope: route_navigation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: chain_wizard_shared_route_payloads_typed_selectors
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0154
preserved_exact_tokens:
  - "allowed_action_ids[]"
  - "object_kind = wizard"
  - "object_id = <wizard_id>"
  - "target_kind = primary_view"
  - "puppet-master://wizard/<wizard_id>/step/<wizard_step_id>/clarify"
negative_constraints:
  - "wizard_step and usage_event_ref are not primary selectors."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-142 - Gate Registry and Attention Evidence Separation

```yaml
plan_unit_id: CWF-142
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Gate registry integrity keeps reserved gate/tombstone handling visible and
  preserves separate machine-verifiable evidence paths for attention_required
  and true blocked escalation.
gui_related: false
gui_classification_reason: Gate registry and evidence separation are validation/governance behavior.
split_recommended: true
split_recommendation_reason: Source span S0154 mixes gate evidence with routes, UI summaries, and runtime identity.
depends_on: [CWF-136]
unblocks: []
acceptance_criteria:
  - GATE-007, GATE-008, GATE, and /reserved tombstone handling remain visible.
  - GATE-012 does not collapse attention_required and true wizard blocked escalation into one evidence path.
  - attention_required has a persisted shape parallel to blocked_notice.
  - Attention evidence supports append-only corrections, /interview alignment, and machine-verifiable expectations.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: gate_attention_evidence_drift
reasoning_tier: high
context_scope: governance_validation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: chain_wizard_gate_attention_evidence_separation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0154
preserved_exact_tokens:
  - "GATE-007"
  - "GATE-008"
  - "GATE-012"
  - "blocked_notice"
  - "machine-verifiable expectations"
negative_constraints:
  - "GATE-012 must not collapse attention_required and true wizard blocked escalation into one evidence path."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Progression_Gates.md
```

### CWF-143 - Project Attention Summaries and Severity Model

```yaml
plan_unit_id: CWF-143
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Project-level attention summaries remain compact and severity semantics stay
  distinct across info, warning, attention_required, blocked, and
  system_notification.
gui_related: true
gui_classification_reason: Primary attention/blocked summaries, count badges, banners, cards, and notifications are user-visible presentation behavior.
split_recommended: true
split_recommendation_reason: Source span S0154 mixes GUI summary rules with runtime route and identity constraints.
depends_on: [CWF-136]
unblocks: [CWF-147]
acceptance_criteria:
  - Project summaries show one primary attention reason or primary blocked reason.
  - Project summaries may show an optional count badge for additional issues.
  - Severity values are info, warning, attention_required, blocked, and system_notification.
  - info stays in-app local /history.
  - warning can use an in-app banner /card/badge.
  - blocked is action-blocking until a required /precondition changes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: attention_summary_severity_drift
reasoning_tier: standard
context_scope: route_navigation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_project_attention_summaries_severity_model
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0154
preserved_exact_tokens:
  - "primary attention reason"
  - "primary blocked reason"
  - "count badge"
  - "system_notification"
negative_constraints:
  - "Project-level attention summaries should not summarize every problem."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-144 - Persona Historical Mode and Mutable Command Boundaries

```yaml
plan_unit_id: CWF-144
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Persona ownership and Historical mode boundaries remain explicit: overseer
  personas are settings-owned, worker runtime identity remains overrideable, and
  Historical mode disables live controls and current-runtime mutation commands.
gui_related: false
gui_classification_reason: Persona and Historical mode boundaries are runtime/control policy, not direct presentation.
split_recommended: true
split_recommendation_reason: Source span S0154 mixes persona/mode policy with route, UI summary, and audit lineage.
depends_on: [CWF-113, CWF-117]
unblocks: []
acceptance_criteria:
  - Overseer personas are settings-owned roles.
  - Worker persona/provider/model remain overrideable through /provider/model and /type.
  - Historical mode disables live pause/resume/cancel.
  - Historical mode disables live retry/remediation and approval /recovery.
  - Historical mode disables commands that mutate current runtime state.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_mode_boundary_drift
reasoning_tier: standard
context_scope: runtime_identity
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Personas.md
  - Plans/Provider_OpenCode.md
node_compile_hint:
  mode: chain_wizard_persona_historical_mode_mutable_command_boundaries
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0154
preserved_exact_tokens:
  - "Overseer personas"
  - "Historical mode"
  - "/provider/model"
  - "/type"
  - "/recovery"
negative_constraints:
  - "Historical mode disables commands that mutate current runtime state."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Personas.md
```

### CWF-145 - Subject First Document Identity

```yaml
plan_unit_id: CWF-145
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard planning and document systems identify the staged or generated artifact
  first; filesystem paths are later materialization or backing-document
  assignments.
gui_related: false
gui_classification_reason: Subject-first document identity is artifact identity semantics.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - The first-class identity is the staged artifact or generated artifact.
  - Filesystem path is a later materialization or backing-document assignment.
  - /document systems remain subject-first.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: document_identity_drift
reasoning_tier: standard
context_scope: document_identity
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_subject_first_document_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0154
preserved_exact_tokens:
  - "/document"
  - "/generated"
negative_constraints:
  - "Filesystem path is not the first-class document identity."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-146 - Graph Native Planning Output and Compatibility Vocabulary

```yaml
plan_unit_id: CWF-146
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard/interview output converges on graph-native planning for
  Orchestrator/GUI consumption while older Task/Subtask/Iteration and Interview
  vocabulary remains compatibility context only, and compact status separates
  Activity, Attention, and Health.
gui_related: true
gui_classification_reason: Graph-native output is consumed by Orchestrator/GUI, and compact status affects visible state presentation.
split_recommended: true
split_recommendation_reason: Source span S0154 mixes GUI consumption and compatibility vocabulary with runtime identity and audit lineage.
depends_on: [CWF-139]
unblocks: []
acceptance_criteria:
  - chain-wizard-flexibility produces plan-graph output for Orchestrator/GUI consumption.
  - Older /Task/Subtask/Iteration and /Interview vocabulary is compatibility context.
  - Activity values are idle, running, paused, queued, and background_active.
  - Attention values are none, attention_required, blocked, and degraded.
  - Health covers setup /config/repo integrity.
  - Conversational /document-production surfaces expose runtime identity, effective runtime, effective platform /model, skipped-control disclosure, /pass stage context, /task/runtime identity in-thread, and requested/effective visibility.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: graph_native_output_compatibility_drift
reasoning_tier: high
context_scope: graph_native_planning
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Orchestrator_Page.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_graph_native_planning_output_compatibility
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0154
preserved_exact_tokens:
  - "/Task/Subtask/Iteration"
  - "Activity"
  - "Attention"
  - "Health"
  - "background_active"
negative_constraints:
  - "Older /Task/Subtask/Iteration and /Interview vocabulary is compatibility context only."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Orchestrator_Page.md
  - Plans/FinalGUISpec.md
```

### CWF-147 - Cross Surface Actions and Work Type Explanation

```yaml
plan_unit_id: CWF-147
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Cross-surface actions and explanation fields remain shared across Usage,
  Ledger, Wizard, thread, message, artifact, document, and usage-event surfaces,
  with work-type bias explained without dumping internals.
gui_related: true
gui_classification_reason: Shared actions and deep links are user-visible cross-surface controls.
split_recommended: true
split_recommendation_reason: Source span S0154 mixes shared actions with runtime identity, route selectors, and audit lineage.
depends_on: [CWF-141, CWF-143]
unblocks: []
acceptance_criteria:
  - Shared actions include Show in Usage, Show in Ledger, Resume Wizard, and message deep links.
  - Shared action identifiers include wizard_id, wizard_step, message_id, artifact_id, document_id, and usage_event_ref.
  - Cross-surface explanation accounts for /work-type biases without dumping internals.
  - Coverage notes preserve re-audited, six-pass, 39, 22, Plans/*.md, and top-level counts without treating them as planning blockers.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: cross_surface_action_drift
reasoning_tier: standard
context_scope: route_navigation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: chain_wizard_cross_surface_actions_work_type_explanation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0154
preserved_exact_tokens:
  - "Show in Usage"
  - "Show in Ledger"
  - "Resume Wizard"
  - "usage_event_ref"
  - "/work-type"
  - "six-pass"
negative_constraints:
  - "Cross-surface explanation must account for /work-type biases without dumping internals."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```
