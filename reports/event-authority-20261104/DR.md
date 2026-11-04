# DR — Runtime artifact Event Authority, fix round 1

**Branch:** `plans/ea-w2-runtime-artifacts-20261104`. **Reviewed head:** `2e5f805bc660eb3fd0a15f51ffb6c2a7145f6616`. **Implementation commit:** `796707f50aa275cba7debed746bc1d363a7e24ba`. The report/grade follow-up retains these exact owner bytes; the pushed delivery head is recorded in the external `drafts/DR/HEAD.txt`.

**Result:** all 19 Project-edition families are self-graded prepared without admission. The blind review found 0/19 prepared; the initial self-grade's 18/19 claim was too strong. Round 1 fixes B1–B4 and N1. No family remains stopped for Jared. Membership stays ABSENT for every family; native execution stays NOT_RUN. Independent approval and separate family admissions remain integration work.

## Review round 1: findings and responses

- **B1 — fixed (`796707f50aa275cba7debed746bc1d363a7e24ba`).** Where: `Plans/storage-plan.md:29494`, SP-520..538, and every draft routing row. Cause: index rows and checkpoint history were incorrectly assigned one 3GEN policy. Fix: index rows retain the existing `RP-EVENT-INDEX-SOURCE`; only checkpoint generation history uses `RP-PROJECTION-3GEN`. The draft companion now carries separate index/checkpoint fields. Verify: run the full DR checker; each family checks its actual registered policies and rejects the previous wrong index assignment (`wrong_index_policy_rejected`). No retention policy or registry row changes.
- **B2 — fixed (`796707f50aa275cba7debed746bc1d363a7e24ba`).** Where: `Plans/Contracts_V0.md:24483`, CV-520..538, fixtures and checker. Cause: unconditional inline payloads had no permitted route above 16 KiB. Fix: explicit SP-337 adoption with canonical UTF-8 JSON size, <=16,384-byte inline object/null ref, and >16,384-byte pack reference/empty placeholder. Each family binds the exact string encoding, BLAKE3/size/media checks, logical schema dispatch, durable bytes/index before acknowledgement, original retry bytes, authorization and retention/backup custody. Logical schemas and EventRecord schema stay unchanged. Verify: each family runs 16,383/16,384/16,385/17,000 total-byte cases and the review's exact 17,000-ASCII-byte summary case; oversized inline, missing/corrupt/unsynced/unauthorized packs, digest/size/media, duplicate JSON keys, noncanonical JSON, wrong-family decoding and both/neither routes refuse. A source-body ref inside type_payload is not treated as this externalization route.
- **B3 — fixed (`796707f50aa275cba7debed746bc1d363a7e24ba`).** Where: `Plans/Automated_Testing_System.md:7243` (ATS-260), `scripts/pm-runtime-artifact-event-drafts.py:63` and `:179`, and the complete fixture envelopes. Cause: payload equality and a three-field mock receipt did not cover the full producer semantic or original-value domains. Fix: all 19 families have complete current EventRecords, closed eleven-field first receipts, v2 custody/full-value results, RFC 8785 producer digests and separately domain-bound canonical MessagePack full-value commitments. Every producer-semantic field is mutated independently; changed Storage fields preserve semantic digest while failing original full-value resolution. Every required envelope/receipt field and receipt coordinate is exercised, including alternate incoming IDs, unknown fields, v1 custody refusal and unsupported dispatch. The unchanged CV-339 known-answer vector independently checks the full-value codec/preimage. Verify: the full checker passes **3,212 assertions**; every old schema/source/payload/retry/withdrawal assertion remains represented. No native source, issuance, group sync, CAS or runtime execution is claimed.
- **B4 — fixed (`796707f50aa275cba7debed746bc1d363a7e24ba`).** Where: `Plans/Runtime_Artifacts_Panel.md:2490` (RAP-054 recommendation), `:3804` (RAP-113), new SP-533/CV-533, the restored draft row and observation fixtures; checker `scripts/pm-runtime-artifact-event-drafts.py:254`. Cause: an unfinished technical observation identity was incorrectly framed as a new product choice. Fix: DL-045 permits completing that identity after search. Keep one artifact_id and primary type_payload.restore_point_id; the four-member tuple remains grouping identity. Each original lifecycle observation adds its exact producer_sequence_id ordinal to a length-framed five-member idempotency recipe, with a verified predecessor event and original receipt. Complete history and current canonical rp/source evidence are checked under the existing writer/selection fence; missing/stale/gapped proof fences publication. No counter/pending value, point identity change, visible artifact/version row, action, lifecycle edge, hold change or source-event admission is introduced. Replay resolves the original frozen event/receipt; changed same-revision semantics conflict. Verify: first/consecutive observation, same point/artifact with distinct event identity, lost-ack replay, stale/missing predecessor, missing proof/currentness, cross-point joins, refresh-only refusal, all three terminal statuses and unavailable actions/source-effect refusals pass. There is no remaining demonstrated product choice for Jared.
- **N1 — fixed (`796707f50aa275cba7debed746bc1d363a7e24ba`).** Where: `Plans/Runtime_Artifacts_Panel.md:3280` and every RAP-100..118 identity clause. Cause: “all original timestamps are Storage-owned” incorrectly included producer-authored occurrence time. Fix: identify sequence_id, observed_at_utc and persisted_at_utc as the three Storage assignments; occurred_at_utc preserves payload.created_at_utc. Verify: full-envelope authored-time join negatives and separate semantic/storage-field digest cases pass for each family.

**Disputed findings:** none. **Stopped for Jared:** none. **Out-of-lane notes:** none. Every review finding is handled above; no checker rule was weakened.

## Family grades before and after

“Before” is the independent Sol review, not the original optimistic self-grade. Every after grade is a fix-worker judgment against the implementation head and all 228 fresh exact-source quotes. Eighteen families have 167 assertions each; restore_point has 199; seven shared checks bring the total to 3,212.

| Exact family | Owner / Storage / Contracts | Before | After |
|---|---|---|---|
| `runtime_artifact.api_web_call` | RAP-100 / SP-520 / CV-520 | 8 PASS, 2 PARTIAL, 1 CONFLICT, 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.artifact_version` | RAP-101 / SP-521 / CV-521 | 8 PASS, 2 PARTIAL, 1 CONFLICT, 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.before_after_snapshot` | RAP-102 / SP-522 / CV-522 | 8 PASS, 2 PARTIAL, 1 CONFLICT, 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.browser_recording` | RAP-103 / SP-523 / CV-523 | 8 PASS, 2 PARTIAL, 1 CONFLICT, 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.code_diff` | RAP-104 / SP-524 / CV-524 | 8 PASS, 2 PARTIAL, 1 CONFLICT, 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.context_snapshot` | RAP-105 / SP-525 / CV-525 | 8 PASS, 2 PARTIAL, 1 CONFLICT, 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.cost_usage` | RAP-106 / SP-526 / CV-526 | 8 PASS, 2 PARTIAL, 1 CONFLICT, 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.document` | RAP-107 / SP-527 / CV-527 | 8 PASS, 2 PARTIAL, 1 CONFLICT, 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.evidence` | RAP-108 / SP-528 / CV-528 | 8 PASS, 2 PARTIAL, 1 CONFLICT, 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.failed_attempts` | RAP-109 / SP-529 / CV-529 | 8 PASS, 2 PARTIAL, 1 CONFLICT, 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.hitl_approval` | RAP-110 / SP-530 / CV-530 | 8 PASS, 2 PARTIAL, 1 CONFLICT, 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.implementation_plan` | RAP-111 / SP-531 / CV-531 | 8 PASS, 2 PARTIAL, 1 CONFLICT, 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.reasoning_summary` | RAP-112 / SP-532 / CV-532 | 8 PASS, 2 PARTIAL, 1 CONFLICT, 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.restore_point` | RAP-113 / SP-533 / CV-533 | 3 PASS, 7 PARTIAL, 2 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.screenshot` | RAP-114 / SP-534 / CV-534 | 8 PASS, 2 PARTIAL, 1 CONFLICT, 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.subagent_lineage` | RAP-115 / SP-535 / CV-535 | 8 PASS, 2 PARTIAL, 1 CONFLICT, 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.suggested_next_steps` | RAP-116 / SP-536 / CV-536 | 8 PASS, 2 PARTIAL, 1 CONFLICT, 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.tool_llm_trace` | RAP-117 / SP-537 / CV-537 | 8 PASS, 2 PARTIAL, 1 CONFLICT, 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.validation_test` | RAP-118 / SP-538 / CV-538 | 8 PASS, 2 PARTIAL, 1 CONFLICT, 1 ABSENT | 11 PASS; membership ABSENT |

After totals: **209 PASS, 19 ABSENT, 0 PARTIAL, 0 CONFLICT** across 228 cells. No row claims all twelve PASS, registration or runtime certification. The self-grade records the previous independent and self grades cell by cell.

## Newly authored bindings and source searches

The original per-family producer/history-reader searches remain at `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/canon-search.json`, SHA-256 `94c22a7cf45511240628db8dbe4cfe94e8da51b545eba8d8dae04b333d999bac`. The 18 original publish/history-reader identifiers are unchanged.

Round-1 searches cover current top-level `Plans/*.md` and `Plans/*.json` at the reviewed head, excluding ledgers, generated shards, audits and reports. Each of the 19 families has its own positive source hits and exact negative searches in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-1/canon-search.json`, SHA-256 `ca087c26e09c210688290cda3ead21bc309c4a5899e5111e29ad8cb548433556`. The literal `pm.payload_pack.v1:` binding is absent before this fix for each family; reuse SP-337's existing packs and EventRecord's string payload_ref instead of inventing a stored-value family. Each CV unit explicitly labels its exact serialization/dispatch definition newly authored under DL-045. No family gets a sibling's contract by inference.

For restore_point specifically, exact searches for `owner.runtime_artifacts.restore_point.publish@1.0.0`, `reader.runtime_artifacts.restore_point.history@1.0.0` and `ra-observation1:` returned exit 1/no matches at the reviewed head. RAP-054 gives only an unfinished tuple recommendation; RAP-059/060 and Chat's source lifecycle already define primary point identity, immutable capture, retained custody and action guards. Reuse those definitions. The new RAP-113 handler/reader and observation ordinal/parent joins are explicitly authored technical bindings for that already specified behavior, not evidence that they existed before. App owner_revision/source graphs in CV-366 remain separate and are not silently substituted for this Project payload.

Each family retains its own explicit SP-278 generic index/checkpoint adoption: actual key `event_record_index_checkpoint.v1:{storage_instance_id}`, value `pm.storage_value.event_record_index_checkpoint.v1@1.0.0`, exact schema `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, actual generation/table, current source verification and atomic frontier CAS. Each stateless history reader persists neither a token nor a filtered checkpoint. The panel projector and its physical values remain independently deferred.

## Current-premise checks

- **DL-045:** `Plans/Decision_Log.md:564–568` still authorizes missing technical identity/scope/replay/currentness/recovery/withdrawal bindings for already specified behavior; its exact Runtime Artifacts scope still names these 19. RAP-054's Option 2 names/transitions and separate restore-point primary identity at RAP-059 remain. This supports the technical observation join, without answering a product question.
- **DL-075:** `Plans/Decision_Log.md:1420–1463`, RAP-054 at `Plans/Runtime_Artifacts_Panel.md:2490`, and Case L-3 at `Plans/storage-plan.md:17421` still assign all 19 histories RP-AUTHORITY-INDEFINITE, including retained event text. This does not assign body/Usage/receipt/restore-point retention or 3GEN to source-coupled index rows. Externalized logical event metadata stays reachable from its retained event; linked source/body access and deletion remain separate.
- **DL-076:** `Plans/Decision_Log.md:1500–1512` still requires the nine-field durable token without redb_snapshot_id. No DR reader persists a token. The ten-field live SP-278 transaction token is not relabelled durable.
- **DL-270/SP-337:** current Contracts §1.2 (`Contracts_V0.md:1019`) and `storage-plan.md:28245` already require the 16 KiB limit, store-once BLAKE3 packs and durability before acknowledgement. The new dispatch supplies the missing per-family technical encoding without choosing a retention policy or changing the logical schemas.
- **Current main comparison:** origin/main was `5e37ffb616ec393af9097a198a9fc78dee9b8605`; `git diff --stat be4766513ff71776346fc73b84f2542990f955af..origin/main -- Plans/Decision_Log.md Plans/Runtime_Artifacts_Panel.md Plans/storage-plan.md Plans/Contracts_V0.md Plans/storage_value_registry.json` returned no differences. Current premise checks therefore do not import stale answers from changed owner text.

**Failed premise checks:** none. **Retention cells PENDING:** none. Project payload editions remain separate from app source/key contracts. Restore-point fixtures explicitly retain RP-RESTOREPOINT-90D-AFTER-RELEASE for the canonical point's policy, distinct from this event history's indefinite assignment.

## Shared-file hunks and ids

- **Runtime_Artifacts_Panel.md:** reconcile the existing RAP-054 tuple recommendation explicitly; correct timestamp ownership in RAP-100..112/114..118; replace stopped RAP-113 with its complete exact family contract.
- **storage-plan.md:** repair retention in SP-520..532/534..538; add SP-533 for restore_point. No physical stored-value registration.
- **Contracts_V0.md:** repair exact per-family dispatch in CV-520..532/534..538; add CV-533 for restore_point. Existing logical and envelope schemas remain unchanged.
- **Automated_Testing_System.md:** expand ATS-260's per-family static and separate native obligations.
- **Companions:** update draft routes and fixture matrix; strengthen the checker; add pinned isolated-environment dependencies. No test file or .gitignore edits.
- **Derived:** regenerate all shards for only these four owner documents, plus the six standard global PlanUnit index outputs. Generation changed 256 shard files in those four owner directories; no other owner's shard changed. Full shard check and top-level index validate pass.

Ids used: **58 total — RAP-100..118, SP-520..538, CV-520..538, ATS-260**. Round 1 adds only the previously unused **SP-533 and CV-533**. No other ID is minted. A fresh scan of 496 origin refs and 99 unique Storage/Contracts owner blobs found no collision for either new ID: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-1/id-allocation.json`, SHA-256 `251a97a666d8dfbb154b2b8ba238efdc1b55e048a315226494d230ad3e20dba5`. The original 56-ID inventory remains preserved at `drafts/DR/id-allocation.json`, SHA-256 `6321437a5ee7c311ec59f31b2850e3a3d4afbfeef0cc03f54ca6e0ccbffab078`.

## Verification and reproduction

Start gates passed on the VM: **22 GB memory available**, **125 GB disk free** (6 GB/50 GB required). Worktree `/home/sittingmongoose/pm-worktrees/DR-fix1` was detached from the requested origin branch and made sparse with Plans/scripts/reports/tests. Fetch and checkout succeeded. The 15 ignored currentness files were copied before index generation and every SHA-256 matched: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-1/currentness-copy.json`, SHA-256 `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c`.

Install `scripts/requirements-runtime-artifact-drafts.txt` into a virtual environment outside the repository; run its Python for the DR checker. The dependencies provide RFC 8785, BLAKE3 and MessagePack instead of substituting approximate digest algorithms. Other listed repository checks used python3. Check logs and SHA-256 values are in `DR.checks.json`; all JSON statuses below were parsed at the top level.

| Check | Exit / top-level status | Log SHA-256 |
|---|---|---|
| `index-generate` | 0 / pass | `3317126f3fde5302a4331f34a489bb3e2232c3c008afe5f25becac24c696258c` |
| `shard-generate` | 0 / pass | `fafb1c33a567c68de84f9f26c3cbd2828d5f49a400771374af7218463f00b5d2` |
| `shard-check` | 0 / pass | `10cde07211161ba5007ce9acf94b977462852fb760eea82736b42c96996d0c85` |
| `index-validate` | 0 / pass | `dff115dca1eff507d6465d613b5a052b33ffcdc4136f8a900c3849009a88329a` |
| `schema-check` | 0 / pass | `3c8290c06a486139c8506a7c1730322b2043c6344946bc28dab2ee7a4d992d9b` |
| `draft-check` | 0 / pass | `ff1d77e0b56e440f0a5ac306fe2ce225b3b827f9cdde6a254f8f41079e718ab6` |
| `diff-check` | 0 / clean | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

Each log is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-1/<check>.log`. Logs establish bounded static coverage only; actual current-source authentication, pack sync, codec/native I/O, crash/recovery, real first issuance, CAS, backup/restore and GUI execution remain NOT_RUN, with per-family native obligations in ATS-260. Membership stays ABSENT; no event registry/admission/Decision Log, frozen validator, Spec Lock, governance evidence or auto-decision change. No pm-mail, subagent, landing lock, admission or main push occurred.

The implementation step was pushed before this report/grade follow-up. The final report and self-grade are copied over `drafts/DR/DR.md` and `drafts/DR/DR.self-grade.json`. After the final push, the temporary worktree and isolated checker venv are removed; implementation/evidence hashes remain available for the re-review.
