# audit-20260619-006-prd-planning-wizard-post-repair-head-semantic-fidelity

Status: PASS_WITH_WARNINGS

## IDs And Range
- ledger_id: `pldg-20260618-001-prd-planning-wizard`
- audit_id: `audit-20260619-006-prd-planning-wizard-post-repair-head-semantic-fidelity`
- baseline_ref: `242415aba82384c58032bcaed49ad0819d8551c8`
- current_ref: `0f3edbfa3e95ac9f749121f2f20334f6a5e052a3`
- range: `242415aba82384c58032bcaed49ad0819d8551c8..0f3edbfa3e95ac9f749121f2f20334f6a5e052a3`
- inference: latest non-background ledger in registry/recent commits; earliest contiguous cycle commit touching the target ledger/registry is `da55b1732f484a60d16cd716a6ac81eec04fb493`, so the baseline is its parent.

## Changed Files
- Live non-pipeline Plans docs: `Plans/Plan_To_Node_Compilation.md`
- Ledger records/projections: target ledger files plus `Plans/ledgers/v2/ledger_registry.json`
- Generated governance/index: `.plan_index`, `_shards`, `.evidence`, `Spec_Lock.json`
- Audit artifacts: audit-004, audit-005, and closure registry rows in the inspected range

## PlanUnit Deltas
- Added PlanUnits: none
- Deleted PlanUnits: none
- Changed `.plan_index` PlanUnit rows: 17
- Substantive live PlanUnit delta: `PNC-014` adds `source_atom_ids` for `atom-0002`, `atom-0101`, `atom-0102`, `atom-0103`, `atom-0104`, `atom-0105`, `atom-0106`, and `atom-0109`.
- `PNC-015`, `PNC-016`, and `PNC-017` changes are generated index/hash/location churn only.

## Semantic Fidelity
- Atom matrix rows: 168
- Classifications: `{'equivalent_with_evidence': 62, 'exact_present': 92, 'previously_closed': 14}`
- Unclosed exact-detail losses/drift in live Plans: none
- Previously closed count: 14
- Closure reuse rows: 16; hash mismatches: 0

## Reciprocal Lineage
- PlanUnit source-claim rows: 62
- Status counts: `{'source_lineage_supported': 62}`
- Overclaims: 0
- Missing lineage: 0

## Owner Routing
No owner-routing findings. `PNC-014` correctly owns the Plan Compile handoff matrix/schema boundary; adjacent GUI, contract, storage, permission, artifact, provider, security, and governance docs remain valid consumer/reference owners.

## Ledger And Governance
- Ledger status: `sealed` / phase `compiled_prd_planning_wizard_governance_sealed`
- Open questions: 0
- Open blockers: 0
- Ready-for-compile atoms: 0
- Warning: sealed ledger latest-audit projections still point at audit-004 even though HEAD includes audit-005 repair validation.
- Warning: PNC-014 governance/index refresh is validator-clean, but the PRD Planning Wizard `auto_decisions.jsonl` row does not separately name that PNC-014 refresh.

## Validators
- Validators run: 13
- Passed: 13
- Failed: 0
- Side effects: 0
- Git status was recorded before/after each validator; no validator mutations needed revert.

## Forbidden Artifacts
No WorkNodes, NodeSeeds, NodeSeed candidates, executable queues, final node manifests, build tasks, runtime dispatch, or implementation files were found. Node readiness remains `blocked_compiler_contract_incomplete` with runtime disabled.

## Next Safe Action
Bounded projection/governance provenance repair only if requested; no canonical Plans semantic repair is required by this audit.

## Compact Repair Prompt
Bounded repair only for audit-20260619-006: update sealed ledger latest_audit_* projections to reflect audit-20260619-005 repair validation, or explicitly mark audit-005 as artifact-only/non-projection latest; update stale audit-005 repair next-action wording from review/commit to post-commit/fresh-audit wording if editing prior audit artifacts is allowed; optionally add a governance provenance/no-decision-required note for the PNC-014 Spec Lock/index refresh. Do not change canonical Plans text, WorkNodes, NodeSeeds, executable queues, manifests, implementation files, runtime dispatch, or production build tasks unless explicitly requested.
