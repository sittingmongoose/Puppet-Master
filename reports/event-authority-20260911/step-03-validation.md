# Event Authority Step 3 — receipted holding-bucket repair

Authority: `Plans/Decision_Log.md` DL-039 and the user-ordered Step 3 campaign. Base: `79464dc0311b6e99dcef2e659d6c226a6f02348b`. Author and eventual lander: agent task `/root/step03_holding_bucket`. This task is forbidden to apply the later seal; no human identity is claimed.

The individual-disposition schema and independent validator now bind `quarantined_not_admitted` to the genuine DL-039 permission and exactly 54 names: 26 emit-only candidates and 28 non-alias J40 residuals. The original eight sheet IDs remain exact. The implementation receipt pins the exact genuine EMIT/J40 response objects, DL-039 section bytes, validator bytes, cohort/machine-scan sources, member names, and retained evidence-object hashes. Per-row application provenance and a replacement DL-039 rationale are mandatory. Compaction, August, J248 and alias membership, registry/denominator admission, malformed authority/receipt, forged provenance and changed evidence fail closed for denominator, depth and overall validation.

The existing 57 holding rows and their forged application records were not rewritten. Step 5 must explicitly apply genuine provenance to the 54 eligible rows and resolve the three unauthorized holding entries under their own decisions. Evidence hashes preserve gaps and history; they do not endorse evidence correctness or certify depth. Historical failed validator receipts, freeze digests, closure hashes, registry, readiness and Spec Lock remain unchanged.

Validation: 13 focused behavioral tests passed in 0.837 seconds, including a sheet-plus-row future-timestamp forgery against the fixed receipt, unrelated next-decision insertion, missing/malformed authority, stale rationale, membership leakage, admission and evidence tampering. The live diagnostic ran with an external `RECEIPT_DIR`, exited 1 in 1.158 seconds, and retained `complete_denominator_known=false`, `contract_depth_complete=false`, `seal_prerequisites_met=false`, `pass=false`. Its six failures are `holding_bucket_invalid`, `august_checkpoint_veto_status_mismatch_owner_choice`, `census_adjudication_category_count_mismatch`, `census_adjudication_independent_set_mismatch`, `census_adjudication_partition_artifact_stale`, and `registered_contract_depth_incomplete`. These are open application/depth conditions, not a Step 3 pass claim for the campaign.

Required final pipeline: shard generation passed (1.713 s), plan-index generation passed (25.437 s), local shard check passed (7.552 s). The validator and spec retain their original CRLF; the schema retains LF. The command-local CRLF-aware whitespace check preserves that byte convention rather than normalizing unrelated text.

Required generation produced four unrelated `.plan_index` file differences: generation timestamps and an absolute worktree path in the already-failing `event_authority_currentness_audit_unavailable` diagnostic. The scope check stopped and the root reviewer adjudicated exact semantic equality outside those values. The exact generated diff and comparison were preserved externally; with explicit reviewer authorization, only these four side effects of this fresh worktree's own generator run were restored from unchanged HEAD. No generated JSON was manually normalized and no generator/source script was changed. A normal-locking local index refresh reported exactly the three edited audit files as needing update. The final retained change scope is the three audit files, the named focused test, the implementation receipt and this report.

Out-of-scope limitation: the pre-existing `live_august = live_set - known37` check assumes only the August additions; later compaction registration may expose that existing limitation. It was not changed under the sole holding-bucket validator exception. No Step 4, row application, registration, depth promotion, readiness or seal work is included.

Governed change receipt: `reports/event-authority-20260911/step-03-holding-bucket-receipt.json`, SHA-256 `d7800b98e7304f1f2853ea786f6b438b7df5753c3f62fd365f50c7a55d0ca8b3`. Validator SHA-256 `bd54afffc689146753daec474d6cdbc7ac663afaf21d842aad4fcf10255112d5`. Independent 54-name newline hash: `8ddd2db382d37e07c166f91be43dfa41f415e32333f8124340de8eeb0a408ed8`; all 54 member/decision/evidence hashes agree with the independent review.

Raw evidence (path plus SHA-256):

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-03/focused-tests-final.txt` — `962d953cfd763b8e55e6f314c13eae9fe81bd4f45661019d08db3ec0953da446`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-03/current-diagnostic.txt` — `5d0a9313ec98f9639d490039ff26b53af5c4d70470f64005130ba7e33a5b42d7`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-03/current-diagnostic/event_authority_validator_receipt.json` — `c178a077a6a16cf0c01c09e20de25f3eda7778c46b9ed9e88b59ca193a64a5de`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-03/pipeline-results.json` — `83489cabee54fbbc59564c0d883ac7234ff6583b31b106a06bad4cc2f528d9e4`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-03/independent-review/cohort-and-provenance.json` — `89983096d92e7f52cd47081492fffcd728bd22ab7d94ef4beeca94944c419662`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-03/focused-tests.txt` — `47f98dcc3bae8d4f14a0794e8daafce3911213fef2e744c5d7548917a10d8996` (interrupted exploratory run; not the final passing run).

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-03/generated-noise.diff` — `7f60f41f6d0e2d0f3ffb8c9f0fbbdb67e51c3c74a10b7b45487acbb05c2e0a3b`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-03/generated-noise-adjudication.json` — `f3520e379468ee11df47ec1c3946688faabd836edd0bdba651ee0183ac637bb5`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-03/local-index-refresh.txt` — `af2ca6048c0ef6721b1033b452eb32bcc5d4f3e86f6f74126f79ceddca3d0750`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-03/git-read-recovery.json` — `a78d5ea0d4fdd8e039a297c9dee86c60602bd32c60b3b1beaa786a5c3c9eda8d`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-03/scope-and-preservation.json` — `35cdf668e3b9323d0404c24588bbacc145d8e4c4da9a4970b43d81ca14471d0a`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-03/git-read-final-results.json` — `7b6fbf586889c76211f3da6dc382c77a3ec3ba0786d71524a499fe5b1fe6be86`.

Cost: measured successful focused tests 0.837 s, diagnostic 1.158 s, final generation/check pipeline 34.702 s. Billing and token-cost telemetry are unavailable. The earlier NFS-fixture test run was interrupted; its raw capture remains `focused-tests.txt`. Local transient fixtures were then used under the authorized experiment runtime; retained captures remain in the external evidence directory.
