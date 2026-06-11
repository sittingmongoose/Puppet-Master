# Shard 032: PlanUnits

Source: `Plans/chain-wizard-flexibility.md`

Source lines: L2294-L2576

Source SHA256: `e5a47a11437fc556e9e309fed3faf756fe1cadb0b1936958b13b407dfd328346`

---

## PlanUnits

### CWF-001 - Chain Wizard & Interview Flexibility -- Intent-Based Workflows Source-Preserving PlanUnit

```yaml
plan_unit_id: CWF-001
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Plans/chain-wizard-flexibility.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: source_preserving_planunit
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
- 'ContractRef: Plans/Project_Output_Artifacts.md#10. Validation Pass Report Artifacts, Plans/Project_Output_Artifacts.md#11.1 `traceability/requirements_quality_report.json` (machine-readable), Plans/Prompt_Pipeline.md#6.4 Effective resolution record'
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
- 12. [Three-Pass Canonical Validation Workflow (Mandatory Invariant Sweep)](#12-three-pass-canonical-validation-workflow-mandatory-invariant-sweep)
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

