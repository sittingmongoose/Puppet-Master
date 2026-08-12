# Git / main hygiene — Event Authority campaign

**Generated:** 2026-08-12T08:40:00Z  
**Repo root:** `P:/` (mapped `//TRUENAS/Cursor/PuppetMaster`)  
**Source:** live `git status` this turn + GitMainHygiene scout (read-only; this file is the write-up)

## Live git

| Fact | Value |
|---|---|
| Branch | `main` tracking `origin/main` |
| HEAD | `43b5b635c4ae285544745762b79218b07786263c` |
| origin/main | `43b5b635c4ae285544745762b79218b07786263c` (identical; 0 divergence) |
| `git diff --name-status origin/main -- scripts` | **empty** |
| `git status --short -- scripts` | **empty** |
| Dubious-ownership / `safe.directory` warning | **none** in this run |
| Extra `safe.directory` exception required | **no** — Git succeeds from `P:/` |

Node REPL `CreateProcessWithLogonW` error 267 is a runner limitation on the mapped drive, not a Git ownership failure.

## Dirty worktree (do not mix)

Pre-existing dirty files (out of campaign; **do not commit**, **do not revert**):

- `Concepts/**` (client workspaces)
- generated `Plans/_shards/**`, `Plans/.plan_index/**`, `Plans/.evidence/**`
- other modified canonical Plans sources already dirty vs origin/main

Untracked campaign / related (isolate from Concepts and generated derived artifacts):

- `Plans/.audits/event-authority-2026-08-12/` (entire directory; not on origin/main at `43b5b635`)
- `Plans/.audits/irb-closure/`
- `Plans/event_authority_package_registry.json`
- `Plans/event_authority_package_registry.schema.json`

`scripts/**` is clean vs origin/main. Keep scripts excluded from this campaign.

## Push blockers (no commit/push requested this turn)

1. Isolate intended audit/registry changes from unrelated dirty files.
2. Keep `scripts/**` excluded.
3. Complete owner-gated Event Authority closure before certification.
4. Requirement 12 (clean worktree + fast-forward push) cannot be satisfied by committing Concepts dirt or by discarding it.

## Commands (do not run until gates say so)

- PNC-019 sole receipt producer: `python scripts/pm-pnc019-certification-harness.py run`  
  Output: `Plans/.implementation_readiness/pnc019_certification_receipt.json`
- 26 governance gates: `python scripts/pm-plans-verify.py run-gates`
- IRB append-only registry: `Plans/.audits/_semantic_closure_registry.jsonl`
