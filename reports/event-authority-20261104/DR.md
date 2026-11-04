# DR — Runtime artifact Event Authority, fix round 2

**Branch:** `plans/ea-w2-runtime-artifacts-20261104`. **Reviewed head:** `7e59fce39abf814ef5e439c432999e8f62e73f91`. **Implementation commit:** `ad863eefda44dfae7c358d5f5384ec39b0e6e0c9`. The report/grade follow-up preserves these implementation bytes; the pushed delivery head is recorded in external `drafts/DR/HEAD.txt`.

**Result:** 19/19 Project-edition families are self-graded prepared without admission, up from the cycle-2 independent verdict of 0/19. Every family moves from 10 PASS / 1 PARTIAL / 1 ABSENT to 11 PASS / membership ABSENT. B5, B6 and N2 are fixed; B1–B4 and N1 remain fixed. Native execution remains NOT_RUN. No outstanding product question or disputed finding remains. Independent approval and separate family admissions remain integration work.

## Review round 2: findings and responses

- **B5 — fixed (`ad863eefda44dfae7c358d5f5384ec39b0e6e0c9`).** Where: `scripts/pm-runtime-artifact-event-drafts.py:218`, `AppendModel.append`, and per-family inline/packed loops; fixture `append_policy_refusals`; ATS-260. Cause: a successful retry returned from dedupe before validating replay policy, which canon deliberately excludes from the semantic digest. Fix: after envelope validation, refuse `projector_replay_only` as `replay_only_not_appendable` and any other non-family policy before global/scoped dedupe; preserve the canonical digest and all existing conflict checks. Verify: every family checks schema-valid/unchanged-digest policy mutations, fresh and retry refusals, alternate delivery IDs, packed routes, and unchanged original event/receipt/dedupe state. The full checker passes; removing only the policy guard in memory makes it fail with 209 expected failures across all 19 families.
- **B6 — fixed (`ad863eefda44dfae7c358d5f5384ec39b0e6e0c9`).** Where: `scripts/pm-runtime-artifact-event-drafts.py:275`, `grouping_identity` and `observation_admissible`; ATS-260. Cause: equality to a predecessor correlation cannot establish the required value for the first observation or two equally wrong values. Fix: recompute RAP-113's exact four-member length-framed SHA-256 `ra1:` grouping key for every observation before first/next admission. Verify: the frozen correct key passes; wrong first correlation and another artifact group's well-formed key remain schema/dispatch-valid but refuse observation admission. Wrong successors and equally wrong predecessor/candidate correlations refuse. Removing only this guard in memory makes the full checker fail with four expected failures. The original independent first-correlation counterexample now refuses.
- **N2 — fixed (`ad863eefda44dfae7c358d5f5384ec39b0e6e0c9`).** Where: RAP-054 `canonical_text`, `Plans/Runtime_Artifacts_Panel.md:2528`. Cause: the predecessor PlanUnit still stated an unqualified four-member event-dedupe rule. Fix: state the RAP-113 exception inside RAP-054 itself: 18 event recipes remain four-member; restore grouping remains four-member while source-backed observation identity additionally binds its producer sequence. Point identity, rows and actions remain the authored ones. Verify: inspect the regenerated RAP-054 shard/index unit or the current scope-identity evidence in the restore self-grade.

The canon already defines both refusal boundaries (Contracts §1.2, CV-520..538 and RAP-113). This round authors no new binding, identity recipe, product behavior or ID. **Disputed:** none. **Stopped for Jared:** none. **Out-of-lane integration notes:** none.

## Cycle-1 regression disposition

- **B1 — still fixed.** Actual registered index and checkpoint policies are unchanged; the copied independent driver injects the old wrong index policy into every input row and the actual full checker exits 1 with 38 expected failures.
- **B2 — still fixed.** All 19 independently generated 16,383/16,384/16,385-byte payloads select the canonical SP-337 route. The exact 17,000-ASCII-byte summary remains schema-valid, round-trips through a pack and refuses inline; missing/corrupt/unsynced/unauthorized pack variants refuse.
- **B3 — now closed in the bounded model.** Complete EventRecords, eleven-field receipts, all semantic fields, the three Storage fields, full-value commitments and exact known answers retain their assertions; B5/B6's missing refusals are now covered. The cycle-2 oracle grade was PARTIAL and is upgraded only after these executions.
- **B4 — still fixed.** Complete first/consecutive observation, recomputed-key stale/gapped ordinal, immutable point/artifact/source joins, source proof/currentness, refresh-only, terminal-state/action and source-effect probes pass. No extra visible rows or source actions appear.
- **N1 — still fixed.** RAP-100..118 still distinguish the three Storage-owned fields from producer occurrence time; authored-time join and semantic/full-value Storage-field tests pass.

## Family grades before and after

Before is the cycle-2 independent grade. After is this fix-worker assessment at the implementation commit. Each ordinary family has 188 assertions; restore_point has 229; seven shared assertions bring the total to **3,620**. All 228 cells were regraded with fresh exact-unit line locations; membership stays ABSENT and native proof stays NOT_RUN.

| Exact family | Owner / Storage / Contracts | Before | After |
|---|---|---|---|
| `runtime_artifact.api_web_call` | RAP-100 / SP-520 / CV-520 | 10 PASS; 1 PARTIAL; 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.artifact_version` | RAP-101 / SP-521 / CV-521 | 10 PASS; 1 PARTIAL; 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.before_after_snapshot` | RAP-102 / SP-522 / CV-522 | 10 PASS; 1 PARTIAL; 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.browser_recording` | RAP-103 / SP-523 / CV-523 | 10 PASS; 1 PARTIAL; 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.code_diff` | RAP-104 / SP-524 / CV-524 | 10 PASS; 1 PARTIAL; 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.context_snapshot` | RAP-105 / SP-525 / CV-525 | 10 PASS; 1 PARTIAL; 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.cost_usage` | RAP-106 / SP-526 / CV-526 | 10 PASS; 1 PARTIAL; 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.document` | RAP-107 / SP-527 / CV-527 | 10 PASS; 1 PARTIAL; 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.evidence` | RAP-108 / SP-528 / CV-528 | 10 PASS; 1 PARTIAL; 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.failed_attempts` | RAP-109 / SP-529 / CV-529 | 10 PASS; 1 PARTIAL; 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.hitl_approval` | RAP-110 / SP-530 / CV-530 | 10 PASS; 1 PARTIAL; 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.implementation_plan` | RAP-111 / SP-531 / CV-531 | 10 PASS; 1 PARTIAL; 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.reasoning_summary` | RAP-112 / SP-532 / CV-532 | 10 PASS; 1 PARTIAL; 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.restore_point` | RAP-113 / SP-533 / CV-533 | 10 PASS; 1 PARTIAL; 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.screenshot` | RAP-114 / SP-534 / CV-534 | 10 PASS; 1 PARTIAL; 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.subagent_lineage` | RAP-115 / SP-535 / CV-535 | 10 PASS; 1 PARTIAL; 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.suggested_next_steps` | RAP-116 / SP-536 / CV-536 | 10 PASS; 1 PARTIAL; 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.tool_llm_trace` | RAP-117 / SP-537 / CV-537 | 10 PASS; 1 PARTIAL; 1 ABSENT | 11 PASS; membership ABSENT |
| `runtime_artifact.validation_test` | RAP-118 / SP-538 / CV-538 | 10 PASS; 1 PARTIAL; 1 ABSENT | 11 PASS; membership ABSENT |

**Totals:** 190 PASS / 19 PARTIAL / 19 ABSENT → 209 PASS / 0 PARTIAL / 19 ABSENT; 0 CONFLICT in either assessment. No family claims twelve PASS, admission or runtime certification.

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

## Round-2 scope and ids

- **Runtime_Artifacts_Panel.md:** amend only RAP-054 canonical_text to expose the already accepted RAP-113 exception.
- **Automated_Testing_System.md:** amend ATS-260 with policy-before-dedupe and every-observation grouping refusal oracles.
- **Companions:** add explicit policy-negative fixture data and strengthen the checker; preserve logical/EventRecord schemas and all earlier assertion groups.
- **Derived:** regenerate 97 files only in these two owners' shard directories and six standard global index outputs. No other owner's derived files changed. Shard check and top-level index validate pass.

Existing branch IDs remain **58 — RAP-100..118, SP-520..538, CV-520..538, ATS-260**. Round 2 also edits the existing predecessor RAP-054. **New IDs minted: zero.** The original allocation/search evidence above remains valid; no registry, admission, Decision Log or stored-value row is changed.

## Verification and evidence

Start checks: **20 GB available memory and 123 GB free disk**, above 6 GB / 50 GB stop thresholds. Worktree `/home/sittingmongoose/pm-worktrees/DR-fix2` is a sparse detached checkout of the exact requested branch head from the VM local clone. The 15 ignored currentness files were copied before index generation and every SHA-256 matched. Current origin/main remains `5e37ffb616ec393af9097a198a9fc78dee9b8605`; the five premise-owner documents still have no changes from the original base.

| Check | Exit / result | Log SHA-256 |
|---|---|---|
| `diff-check` | 0 / clean | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `draft-check` | 0 / pass | `ad722046e2d63b7ec7e417c4752654de8eb979bbd697df77ab54347161bdd8b7` |
| `index-generate` | 0 / pass | `0bfe4c79fdf6f9282c4dee7ae321a69f3ab39919d0da16be4c50e0ed5de58951` |
| `index-validate` | 0 / pass | `a43447a7ae769938eeb9b46007d59cc5b89263a4ccb402b45efe90bf3cd3b3b5` |
| `regression-mutations` | 0 / pass | `cfb83c1e15befdcc2af35dbb4fbaf5c3000b7d771ce60c519158b7f83f8673b2` |
| `review-cycle2-probes` | 0 / no failed expectations | `9e3b06c1bf01b727db689a79d8caeb9e031d0a8859805f895fba08ec372316ea` |
| `schema-check` | 0 / pass | `e91678590ca2759016a7e269bb72ffb0430c2c5d0c1b3bb7a63352040c7a6059` |
| `shard-check` | 0 / pass | `10cde07211161ba5007ce9acf94b977462852fb760eea82736b42c96996d0c85` |
| `shard-generate` | 0 / pass | `fafb1c33a567c68de84f9f26c3cbd2828d5f49a400771374af7218463f00b5d2` |

| `delivery-audit` | 0 / pass; 480 exact quotes; all 19 actual Project custody partitions encoded | `6c8f2cd2ce5d0511e1b214f930f8a0bbe5a7d21af277c9bf8edf30210b75651e` |

Each log and result is under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-2/`; `DR.checks.json` records exact commands, source hashes and evidence paths with SHA-256. Index statuses were parsed from the top-level JSON. The copied cycle-2 review driver retains every test unchanged; only provenance fields identify the fixed input bytes. It now records **931 family assertions and 26 observation assertions with zero failed expectations**. Its B1 input mutation retains the expected checker failure. Separate in-memory guard-removal tests run the full current checker and fail for B5/B6 as expected; repository rules are never changed for those mutations.

The current self-grade contains **480 verified exact-unit quotes across 228 cells**. It carries the agreed cycle-2 normative grades, updates the 19 repaired oracle cells and includes direct checker/ATS evidence. Report/grade/check files are copied to `drafts/DR/` after the report commit.

Native source authentication, receipt issuance, real pack sync, crash recovery, actual SP-278 transactions/CAS, backup/restore and UI execution remain NOT_RUN. No frozen validator, lock, governance evidence, auto-decision, .gitignore or test file changed. No subagent, admission, landing lock or main push occurred. One read-only inbox check ran before the no-pm-mail brief was known; no registration/message or subsequent mailbox command occurred. The pushed fix worktree and temporary isolated checker venv are removed at handoff.

## Review round 1: findings and responses (historical)

These responses describe commit 796707f50aa275cba7debed746bc1d363a7e24ba. Its complete-oracle claim was subsequently lowered by cycle 2; current disposition and counts are the round-2 sections above.

- **B1 — fixed (`796707f50aa275cba7debed746bc1d363a7e24ba`).** Where: `Plans/storage-plan.md:29494`, SP-520..538, and every draft routing row. Cause: index rows and checkpoint history were incorrectly assigned one 3GEN policy. Fix: index rows retain the existing `RP-EVENT-INDEX-SOURCE`; only checkpoint generation history uses `RP-PROJECTION-3GEN`. The draft companion now carries separate index/checkpoint fields. Verify: run the full DR checker; each family checks its actual registered policies and rejects the previous wrong index assignment (`wrong_index_policy_rejected`). No retention policy or registry row changes.
- **B2 — fixed (`796707f50aa275cba7debed746bc1d363a7e24ba`).** Where: `Plans/Contracts_V0.md:24483`, CV-520..538, fixtures and checker. Cause: unconditional inline payloads had no permitted route above 16 KiB. Fix: explicit SP-337 adoption with canonical UTF-8 JSON size, <=16,384-byte inline object/null ref, and >16,384-byte pack reference/empty placeholder. Each family binds the exact string encoding, BLAKE3/size/media checks, logical schema dispatch, durable bytes/index before acknowledgement, original retry bytes, authorization and retention/backup custody. Logical schemas and EventRecord schema stay unchanged. Verify: each family runs 16,383/16,384/16,385/17,000 total-byte cases and the review's exact 17,000-ASCII-byte summary case; oversized inline, missing/corrupt/unsynced/unauthorized packs, digest/size/media, duplicate JSON keys, noncanonical JSON, wrong-family decoding and both/neither routes refuse. A source-body ref inside type_payload is not treated as this externalization route.
- **B3 — fixed (`796707f50aa275cba7debed746bc1d363a7e24ba`).** Where: `Plans/Automated_Testing_System.md:7243` (ATS-260), `scripts/pm-runtime-artifact-event-drafts.py:63` and `:179`, and the complete fixture envelopes. Cause: payload equality and a three-field mock receipt did not cover the full producer semantic or original-value domains. Fix: all 19 families have complete current EventRecords, closed eleven-field first receipts, v2 custody/full-value results, RFC 8785 producer digests and separately domain-bound canonical MessagePack full-value commitments. Every producer-semantic field is mutated independently; changed Storage fields preserve semantic digest while failing original full-value resolution. Every required envelope/receipt field and receipt coordinate is exercised, including alternate incoming IDs, unknown fields, v1 custody refusal and unsupported dispatch. The unchanged CV-339 known-answer vector independently checks the full-value codec/preimage. Verify: the full checker passes **3,212 assertions**; every old schema/source/payload/retry/withdrawal assertion remains represented. No native source, issuance, group sync, CAS or runtime execution is claimed.
- **B4 — fixed (`796707f50aa275cba7debed746bc1d363a7e24ba`).** Where: `Plans/Runtime_Artifacts_Panel.md:2490` (RAP-054 recommendation), `:3804` (RAP-113), new SP-533/CV-533, the restored draft row and observation fixtures; checker `scripts/pm-runtime-artifact-event-drafts.py:254`. Cause: an unfinished technical observation identity was incorrectly framed as a new product choice. Fix: DL-045 permits completing that identity after search. Keep one artifact_id and primary type_payload.restore_point_id; the four-member tuple remains grouping identity. Each original lifecycle observation adds its exact producer_sequence_id ordinal to a length-framed five-member idempotency recipe, with a verified predecessor event and original receipt. Complete history and current canonical rp/source evidence are checked under the existing writer/selection fence; missing/stale/gapped proof fences publication. No counter/pending value, point identity change, visible artifact/version row, action, lifecycle edge, hold change or source-event admission is introduced. Replay resolves the original frozen event/receipt; changed same-revision semantics conflict. Verify: first/consecutive observation, same point/artifact with distinct event identity, lost-ack replay, stale/missing predecessor, missing proof/currentness, cross-point joins, refresh-only refusal, all three terminal statuses and unavailable actions/source-effect refusals pass. There is no remaining demonstrated product choice for Jared.
- **N1 — fixed (`796707f50aa275cba7debed746bc1d363a7e24ba`).** Where: `Plans/Runtime_Artifacts_Panel.md:3280` and every RAP-100..118 identity clause. Cause: “all original timestamps are Storage-owned” incorrectly included producer-authored occurrence time. Fix: identify sequence_id, observed_at_utc and persisted_at_utc as the three Storage assignments; occurred_at_utc preserves payload.created_at_utc. Verify: full-envelope authored-time join negatives and separate semantic/storage-field digest cases pass for each family.

**Disputed findings:** none. **Stopped for Jared:** none. **Out-of-lane notes:** none. Every review finding is handled above; no checker rule was weakened.
