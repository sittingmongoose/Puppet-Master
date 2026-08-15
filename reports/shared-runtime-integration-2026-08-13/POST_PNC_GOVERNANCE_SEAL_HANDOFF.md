# Remaining Runtime Integration — post-PNC governance-seal handoff

Status: `WAITING_FOR_PNC_OWNER_STABILITY`

No generated PlanUnit index, Spec Lock, shards, evidence bundle, plan graph, or
governance seal was refreshed in this wave. The commands below are the next safe
sequence only after the PNC/Event Authority owner publishes stable canon and all
concurrent Plan writers stop.

## Preconditions

1. PNC/Event Authority has a stable owner result and the handoff in
   `PNC_HANDOFF.md` is resolved or explicitly retained as quarantined.
2. `git status --short` and hashes for every closure-owned file are frozen; any
   concurrent change is reconciled before generation.
3. The bounded validators in the closure report pass from the exact frozen tree.
4. No WorkNode, NodeSeed, WorkGraph, executable queue, Rust/Slint runtime, or
   deployment artifact is introduced by the seal.
5. The protected readiness owner has reconciled its hard-coded Case-L sidecar and
   storage-registry expectations with the current transitive migration-receipt
   bundle, without weakening the owner schema.

## Ordered seal sequence

1. Register new canonical documents with the repository helper, including at
   minimum `Plans/Project_Sync_and_Backbone.md`, the new contract schemas, and the
   v2 disposition/schema pair:

   ```bash
   python3 scripts/pm-governance-seal.py register-canonical-docs --doc <exact-path>
   ```

   Run once per reviewed document with deliberate decision metadata if the seal
   owner requires it. Do not glob or bulk-register unreviewed files.

2. Generate and immediately validate the PlanUnit index:

   ```bash
   python3 scripts/pm-plan-index.py generate
   python3 scripts/pm-plan-index.py validate
   ```

3. Generate shards, then check body/path/hash parity and produce a review report:

   ```bash
   python3 scripts/pm-shard-plans.py --generate
   python3 scripts/pm-shard-plans.py --check --report <reviewed-shard-report.json>
   ```

4. Sync the reviewed shard report into the named evidence bundle, then refresh
   only the explicitly reviewed Spec Lock/evidence artifacts:

   ```bash
   python3 scripts/pm-governance-seal.py sync-plan-sharding-evidence --evidence <evidence.json> --report <reviewed-shard-report.json>
   python3 scripts/pm-governance-seal.py refresh --spec-lock Plans/Spec_Lock.json --evidence <evidence.json> --no-node-artifacts
   ```

5. Run the complete governance aggregate with bounded subcheck timeouts:

   ```bash
   python3 scripts/pm-plans-verify.py run-gates --report <run-gates-report.json> --subcheck-timeout-seconds 120
   ```

6. Re-run the closure-owned validators from `CANON_CLOSURE_REPORT.md`, compare the
   final no-touch/custody hashes, and review every changed generated artifact before
   accepting the seal. A failed, skipped, manual, or inconclusive gate remains
   non-pass.

## Stop conditions

Stop without refreshing governance if PNC inputs change during the sequence, a
new owner conflict appears, a generated diff includes unreviewed documents, a
validator reports stale source/hash evidence, or the command would overwrite
concurrent uncommitted work.
