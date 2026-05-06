# Prompt / process updates (generic, repo-agnostic)

Use these when revising pipeline prompts or automation outside this work item. Avoid one-off wording tied only to `gap-00077`.

## 1. Target-adjacent arrays vs process artifacts

- **Issue:** Obligation text that mentions process files can land in `exact_missing_items` and look like live targets.
- **Fix:** In Open Gaps / reducer prompts, require `process_followup` gaps to use `process_artifact_refs[]` (or equivalent) for any `Plans/.pipeline/**` reference; keep `exact_missing_items` for live `Plans/**` doc paths only. Add a mechanical check before classification waves.

## 2. Completion proof bundle

- **Issue:** Completion certifier expects named artifacts; missing files were interpreted as failure even when an earlier gate passed.
- **Fix:** In stages 11–13 prompts, require outputs at stable paths (work item and/or `runs/<run_id>/`) and list them explicitly in a “completion proof manifest” schema so stage 14 can diff required vs present without ad hoc discovery.

## 3. Gate ordering

- **Issue:** Different artifacts suggested different next stages after the packet (Scribe vs Fidelity Evidence Indexer).
- **Fix:** Maintain one canonical DAG in a single `pm.pipeline_order.v*` doc referenced by packet builder, verifier, and fidelity prompts; prohibit free-text `next_required_stage` divergences without a version bump.

## 4. Subagent attestation

- **Issue:** Stage 01 recorded `subagents.used: false` while contract marked required.
- **Fix:** Prompts should either enforce Task/subagent invocation when `required: true` or emit an explicit waiver field when the principal agent performs an equivalent bounded verification with the same evidence IDs.

## 5. Run-scoped mirrors

- **Issue:** `meta.run_id` null while work relies on `runs/r-…-run-034/` for truth.
- **Fix:** Optional but recommended: after packet build, set `meta.run_id` to the active packet run or add a `meta.active_packet_run_id` field so completion and hygiene gates do not infer run from multiple summaries.

## 6. Auxiliary report successor drift

- **Issue:** `packet_shape_report.txt` may still advertise an older `next_required_stage` (e.g. Scribe) after normalize/verify has already advanced the run to fidelity/completion.
- **Fix:** Regenerate or amend packet-shape mirror text when stage 12 completes, or drop redundant `next_required_stage` fields from non-canonical artifacts so completion does not see contradictory hints.
