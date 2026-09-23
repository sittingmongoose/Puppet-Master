# Landing-check baseline re-record, 2026-09-23

`reports/landing-checks/baseline.json` was re-recorded from a full run against `main` `75bcda93bc`, recorded at 2026-09-23T19:49:23Z. It replaces the 2026-09-17 baseline from `b29eab7b99`. Jared set this re-record as the last condition of the governance reseal.

## Where it was recorded

It was recorded in the shared checkout `/mnt/Cursor/PuppetMaster`, with the output written to a git-ignored scratch path and then committed from a worktree. The shared checkout is the environment every landing check runs in. Its tracked `Plans`, `scripts`, `tests` and `reports` matched `main` exactly, and `HEAD` did not move during the run.

A first attempt in a separate worktree, with the ignored inputs symlinked in, produced two failures no landing sees (`validate_audit_status_index` and `validate_web_capability_contracts`, which reject symlinked paths outside the repository root). It was discarded. So was a second attempt in the shared checkout that `main` moved underneath.

The ignored inputs present were the same as for any landing: the currentness edition written by the reseal, the ignored `Plans/.audits/*` audit directories and files, the touch-closure central map under `scratchpad/`, and the `tests/agent_packet_restrictions` evidence symlink. The tool itself records only the last of these in `untracked_inputs`.

## What it contains that is not the reseal's state

Landings were meant to stay frozen until this baseline landed. The BSD lifecycle contract-closure landing nevertheless reached `main` first: `e6571faf7a`, plus its landing record `75bcda93bc`. Relative to the resealed state measured at `aff2a0d692`, the baseline therefore also records that landing's post-reseal staleness:

| Check | At reseal `aff2a0d692` | In this baseline | Change |
|---|---:|---:|---:|
| `validate_evidence` / `evidence` | 0 | 665 | +665 |
| `validate_plan_graph` / `plan_graph` | 0 | 665 | +665 |
| `verify_spec_lock` / `spec_lock` | 0 | 5 | +5 |
| `validate_plan_migration` / `plan_migration` | 2 | 13 | +11 |
| `validate_implementation_readiness` / `implementation_readiness` | 73 | 79 | +6 |
| `plan-migration-validate` (current run 017) | 32,839 | 32,967 | +128 |

The five Spec Lock `stale_hash` rows are `Plans/00-plans-index.md`, `Plans/storage-plan.md`, `Plans/storage_value_registry.json`, `scripts/pm-shard-plans.py` and `scripts/pm-plan-index.py`, all edited by landing `e6571faf7a`. The evidence and plan-graph rows are the live plan-sharding bundle going stale as that landing changed shards.

**These rows are post-reseal staleness of landing `e6571faf7a`, to be cleared by the next reseal.** This baseline records them so they are reported rather than hidden: they do not stop later landings, and the next reseal clears them.

Totals: `run-gates` 2,875 failures in 12 checks, `audit-governance` 2,875, `plan-migration-validate` 32,967, in 150 buckets. The recurring touch-closure finding from the ignored scratchpad map (`ui.project.restore_archived`) is now part of the baseline, so it stops showing as new in every landing.

Cost: three baseline runs, one kept; monetary attribution unavailable.
