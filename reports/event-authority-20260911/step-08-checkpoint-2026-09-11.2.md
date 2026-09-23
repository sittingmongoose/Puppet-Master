# Step 8 — Comparison checkpoint moved to 42 families (`2026-09-11.2`)

On 2026-09-23 Jared approved the live 42-family registry as the PNC-019 comparison checkpoint for Step 8.

- **Recorded identity:** revision `2026-09-11.2`, SHA-256 `0be544181eda423dcea4d8661206e7da6d066fdcf51913d5962f1a283635c842`.
- **Predecessor:** his approval first named `1972a6aa6ef168a46091be5347bc9cff657985a1c21ab1b84665b9ed96c1ed3a`, which is recorded as the approved predecessor. The two differ in one row, landed in `a73cb06d10`: `goal_run.certified` moved from 2.0.0 to 3.0.0. The set of event types is the same.
- **Where the proposal came from:** the coordinator session, building on the 2026-09-21 governance review.
- **Answers:** "Approved, separate branch", "Live registry 0be54418", "Step 4 precedent".

The change follows Step 4 exactly:

- **Helper:** `scripts/pm_pnc019_currentness.py` changes only `EVENT_FAMILY_REGISTRY_REVISION` (from `2026-09-11.1` to `2026-09-11.2`), `EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT` (from 40 to 42) and their provenance comment. Only those two AST nodes differ.
- **Test guards:** two test files pinned the count at 40 to stop anyone lifting it without approval. They now pin 42.
- **Projections:** the buildability and node-readiness projections were regenerated with the same Step 4 commands.

## Results

- **Focused checks:** all 14 pass. The live registry clears the checkpoint. The prior revision, a future revision, a wrong schema ID or version, ±1 family and a 40-family registry all still fail closed. The quarantine count stays 252, the denominator stays `UNKNOWN_OPEN`, and bulk registration stays false.
- **Readiness** (same currentness inputs): 179 failures before, 175 after. Removed: two `event_authority_checkpoint_changed_requires_fresh_approval`, one `event_family_registry_kernel_row_count_mismatch` and the stale buildability report. Nothing was added.
- **Still open:** `event_denominator_unresolved` and `event_family_contract_depth_unresolved`.

## Pre-existing failures, not repaired here

Both edited test files already fail five tests on `main`: a frozen hash of the 40 upstream rows, `preexisting_registry_changed`, and the standard gate. These date from the `goal_run` v3 adoptions and are unchanged by this branch.

## What this does not do

This records a checkpoint only. It admits nothing to the registry, does not resolve the denominator or depth, certifies nothing, changes no validator logic, and does not seal Spec Lock. The receipt, with every hash, is [step-08-checkpoint-2026-09-11.2.json](step-08-checkpoint-2026-09-11.2.json). Raw captures are in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/checkpoint-42-20260923/`.

Cost: one session, focused checks and two readiness validations; monetary attribution unavailable.
