# audit-20260615-002-part-4-fable-cleanup

Status: BLOCKED

## Inferred Range

- ledger_id: `pldg-20260615-001-part-4-fable-cleanup`
- baseline_ref: `085f76661b7b754f09eb4cfd429a25d42b26267e`
- current_ref: `a9913aec2fd5e6bf9c4c5733c5e25f767e018585`
- range: `085f76661b7b754f09eb4cfd429a25d42b26267e..a9913aec2fd5e6bf9c4c5733c5e25f767e018585`
- Inference: latest non-background registry entry is `pldg-20260615-001-part-4-fable-cleanup`; the first commit touching that ledger directory is `a9913aec2`, so its parent `085f76661` is the baseline.

## Changed Files

- Live top-level Plans docs changed: `Plans/Contracts_V0.md`, `Plans/Executor_Protocol.md`, `Plans/FinalGUISpec.md`, `Plans/Tools.md`, `Plans/Wiring_Matrix.md`, `Plans/assistant-chat-design.md`.
- Generated/index/governance paths changed: `Plans/.plan_index/**`, `Plans/.plan_migration/pds-20260611-002-atomize-planunits/**`, `Plans/Spec_Lock.json`, `Plans/_shards/**`, `Plans/.evidence/**`.
- Forbidden/boundary path changed: `scripts/pm-governance-seal.py`.

## PlanUnit Deltas

- Added: `F3-391`, `F3-392`, `ACD-415`, `T-158`, `CV-285`, `EP-097`, `WM-036`.
- Deleted: none detected.
- Existing live-doc PlanUnit changes: none detected; live doc edits are additive.
- Removed prose/headings/ContractRefs/exact tokens: none detected in the six changed live docs.
- Index count moved from 4,998 to 5,005 PlanUnits; added units have 28 acceptance rows total.

## Blocking Findings

1. Governance state is incoherent. Ledger projections say `governance_status=pending_seal` and claim Spec Lock/shards/evidence were not updated, but the range updates `Plans/Spec_Lock.json`, `Plans/_shards/**`, `Plans/.evidence/**`, and migration proof files.
2. `scripts/pm-governance-seal.py` changed by 17 inserted lines. That is an implementation-file edit inside a cycle whose ledger and PlanUnit acceptance criteria say no implementation files were updated.
3. Ledger validation projections say migration proof is stale/failing, but current migration validation passes with `live_plan_unit_count=5005` and `failures=[]`.

## Possible Losses Or Drift

- Extract cleanup was softened into "interpret through Core rules/PlanUnits" while old mixed `Fields:` / `Rules:` blocks remain inline.
- FinalGUISpec blocked/recovery addenda were not collapsed; compatibility PlanUnit `F3-392` was appended instead.
- Executor and Wiring addenda consolidation remains append-only; old normative addenda remain as peer sections.
- Source lineage is incomplete for accepted verification atoms `atom-0008`, `atom-0009`, `atom-0013`, `atom-0014`, and for `atom-0015` -> `F3-392`.
- Owner metadata is thin for extract normalization, `CV-285` has a questionable `local:Plans/Contracts_V0.md:494` source ref, and `WM-036 gui_related=true` needs adjudication.

## Ledger Consistency

- Records/projections mostly agree on counts: 19 design atoms, 4 decisions, 3 questions, 0 blockers, 0 corrections, 10 events, 1 compiled queue item.
- No active candidate/open_question/ready_for_plan_compile atoms remain; sealed-ledger rule is not applicable because registry status is `compiled`, not `sealed`.
- `state/operating_capsule.json` is stale: it still describes pre-compile conversation mode and forbids compile/governance outputs after current/handoff/health moved to compiled state.

## Governance And Index

- `.plan_index` is internally consistent: 5,005 PlanUnits, 17,798 acceptance rows, coverage pass, unresolved dependency references 0.
- Node readiness is correctly blocked by `blocked_compiler_contract_incomplete`; no WorkNodes, NodeSeed candidates, executable build tasks, or final node queues are reported.
- Governance artifact truth is inconsistent with the ledger status and generated addenda text.

## Validators

All requested validators passed. `git status --short` was empty before and after the validator sequence, so the validator run did not mutate the repository. `git diff --check` passed.

## Forbidden Artifacts

- WorkNodes: none found.
- NodeSeeds / NodeSeed candidates: none found.
- Executable queues / final node manifests / production build tasks: none found.
- Legacy Iced app recreation: none found.
- Implementation files: failed, `scripts/pm-governance-seal.py` changed.

## Subagent Summary

- Changed-doc fidelity: additive live-doc PlanUnits only; no deleted prose; flagged governance contradiction and metadata risks.
- Evidence mapping: found governance contradiction and source-lineage gaps.
- Governance/index: index counts pass; readiness blocked as designed; ledger/governance state inconsistent.
- Semantic drift: extract and addenda work did not fully perform the ledger's requested normalization/collapse.
- Ledger consistency: stale operating capsule and false no-governance-update claims.
- Forbidden artifacts: node artifacts absent, but implementation script edit present.

## Next Safe Action

Do not repair as part of this audit. Start a separate explicit repair cycle that reconciles the ledger/governance status with the committed artifacts, accounts for or removes the script change from this cycle, fixes the source-lineage and semantic cleanup gaps, and then reruns the validator suite with before/after Git status.

## Compact Repair Prompt

```text
Repair audit-20260615-002-part-4-fable-cleanup for pldg-20260615-001-part-4-fable-cleanup. Do not edit audit files except to add a repair report. Reconcile ledger registry/current/handoff/open_items/ledger_health/operating_capsule with actual Spec_Lock/shard/evidence/migration state; account for scripts/pm-governance-seal.py or move it to a separate authorized tooling cycle; fix PlanUnit lineage for atom-0015/F3-392 and accepted verification atoms; decide whether extract/addenda cleanup should actually rewrite/collapse old sections or mark them residual lineage; rerun validators and record before/after git status.
```
