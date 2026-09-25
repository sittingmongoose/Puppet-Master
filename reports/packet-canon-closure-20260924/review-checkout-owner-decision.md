# Review checkout owner decision — 2026-09-25

Status: amended DL-097 owner prose integrated on the repair branch; selected-request/result/preview companions and native implementation remain pending.

`Plans/Forge_Integrations.md` §3.4 and FGI-008 now preserve separate-workspace checkout and also permit explicitly chosen current-workspace checkout after the existing safety preview. Exact Source Location, placement, Source Control handoff, FileSafe and local-write authority remain bound to the original request. A changed placement invalidates the preview. Neither placement waives mutation safety or permits dirty/uncommitted work to be discarded or overwritten. No new command, alias, event, handler availability, generic publication authority or physical admission is introduced.

This implements Jared's exact amendment, not the original separate-workspace-only answer. Decision Log and frozen cards are unchanged. The first proposal's prose-only indexing omission and ambiguous dirty-work exception were corrected before acceptance: FGI-008 now includes the decision in acceptance criteria, source lineage and negative constraints. All existing PlanUnit IDs remain.

## Review and application evidence

External base directory: `/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/jobs/review-checkout/`.

- Independent GPT-6 Sol high `REVIEW-2.md`, SHA-256 `1f1b1c53aa67aa49b620f2c5bb0c24566c3c94645f7eb1723789d7971a7a4285`.
- Approved `changes.patch`, SHA-256 `6f636915c0b65554ecc1aedc4ef66a590fc192e00ebb1b1273fd0fd32d133555`.
- Root preimage matches the frozen input: `39096b554e7ff3f14facc0cc4f18b45426590f4f464eb84292be0132cd73552d`.
- Root post-application bytes match the reviewed candidate exactly: `c8141be6d11eab8a5ed38ba71e6016ea3032b3287449d689b9807f1a1abebfab`.

Root inspected all four patch hunks and the independent review before application. The review verifies patch reconstruction, reverse applicability, all 21 unique YAML PlanUnits, unchanged frozen inputs, and preservation of newer-main text. The proposal REPORT's older two-hunk description is stale; the reviewed artifact has four hunks, as this record states.

Authoring ran in Muse Code on `muse-spark-1.3-contributor`, max, native Goal `goal-52b83b2c-eb65-4847-a0a8-2b99c5ec4edd`, session `01a0d923-2818-7a20-8ba6-c684bf3020d1`. Task turns durably completed, but the native Goal remained active despite assistant prose claiming completion. That claim is not a native terminal receipt. No additional billed closure-chasing turn is required for accepting independently reviewed artifact bytes; the native-state fault stays explicit.

Derived-file verification passes: shards generate/check 99 documents and 2,760 shards, with no shard bytes changed; index generation 6,740 PlanUnits and 26,509 acceptance units. The exact index delta adds/removes no PlanUnit ID and changes existing rows only for Forge. `git diff --check` passes. The preceding step's 34 known index-validation findings remain a separate recorded baseline; this step does not claim a full validation rerun. This record does not claim aggregate gates, current-main rebase, main landing, governance reseal, native checkout execution or packet-wide closure.
