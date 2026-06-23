# PM Bootstrap Ledger-to-Plans Semantic Audit - audit-20260623-001-fff-ledger-to-plans-semantic-fidelity

## Result

Status: **BLOCKED**. Scope coverage is **552/552 rows classified (100%)**.

Target ledger: `pldg-20260622-001-fff`  
Observation ref: `HEAD` (`49585be3171e`)  
Subject ref: `49585be3171e`  
Baseline ref: `b685c3d9a909`

## Actionable Findings

1. `sfk-cc34ce26231d63bcfd452fdd` - worktree currentness: Closed-world audit cannot prove observation_ref=HEAD against a clean committed/pushed tree because non-audit Plans/governance/ledger paths were dirty before and after validator execution.
2. `sfk-e2d145fdce3e754060317dcd` - ledger projection drift: Target ledger operating capsule is partially refreshed after governance seal: governance_status is sealed, but current_phase, agent_task, last_validated_at_utc, and some phase wording still describe a pending governance/migration state.
3. `sfk-e1fcd45c960c7c2508038375` - closure registry currentness: Closure validator failed because the global semantic closure registry has stale evidence hashes after current plan/index/registry changes; audit-only scope cannot refresh the registry.
4. `sfk-003b63f2385d012c589fe4bf` - closure validator failed; see `validator_results.json` for stale registry hashes and missing impact/closure coverage produced by this audit-only BLOCKED state.

## Semantic Evidence

- Atom coverage: `95/95` atoms accounted for; disposition matrix reports `83` compiled, `11` not-for-plan, and `1` superseded.
- PlanUnit source claims: `25` PlanUnits reference `pldg-20260622-001-fff`; no missing reciprocal ledger refs were found.
- Owner routing: `20` owner/consumer rows reviewed; no owner misroute was found.
- Forbidden artifacts: no WorkNodes, NodeSeeds, NodeSeed candidates, executable queues, final node manifests, implementation files, production build tasks, or runtime launches were found under `Plans/**`.
- Closure reuse: `0` rows; no matching prior closure rows existed for this ledger/finding surface.

## Warnings

- `T-072` preserves `source_lineage` to `atom-0063` and `atom-0076` but lacks the newer `source_atom_ids` helper field.
- `auto_decisions.jsonl` validates structurally but has no specific `pldg-20260622-001-fff` / `DiscoveryService` decision row.
- Manual ledger support artifacts remain source-lineage evidence and are not fully bootstrap-validator-backed.
- Untracked/generated shard addenda and modified governance artifacts remain outside the audit directory.

## Validators

Passed: `14`. Failed: `1`. Validator side effects: `0`.

Failed validator:
- `closure`: global semantic closure registry hashes are stale and the audit-only BLOCKED result has no repair impact/closure matrix.

All other requested validators passed: target ledger, PlanUnit index, migration, run-gates, audit-governance, shard check, auto-decisions, Spec Lock, evidence, plan graph, JSON syntax, PRD/Planning runtime contracts, plans-to-code handoff schema, and `git diff --check`.

## Next Action

Repair is required outside this audit-only lane: clean/commit or restamp generated governance state, refresh closure registry hashes through the governed script path, and align `state/operating_capsule.json` with the sealed ledger projections. No repair was performed by this audit.
