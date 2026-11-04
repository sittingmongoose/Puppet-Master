# Lane DS (stream E, batch 1): clearing the frozen seal check's blockers

**Branch:** `plans/ea-b1-seal-blockers-20261104`, from `origin/main` `be4766513f`. Review round 2 is current; earlier sections are historical.
**Historical first-pass worktree:** Nas1 `~/pm-worktrees/ea-ds`, kept for the lead. Second pass (DS-P2): VM sparse worktree `~/pm-worktrees/DS-p2` from `600575221d`, removed after the push.
**Inputs:** `BRIEF-DRAFT.md`, `lanes/DS.md`, D1b's `BLOCKERS.md` and `DEPTH.jsonl`. Every D1b claim used here was re-checked on this branch.

## Review round 2: findings and responses (DS-FIX2, current)

**Current fix worktree:** VM `/home/sittingmongoose/pm-worktrees/DS-fix2`, removed after the final push.

**Source head:** `9f83b5ed566206585dcff5a22ac4db94feaf3cee`. **Final grade:** 54 PASS / 6 PARTIAL; no 12/12 family claim. All older grades and supersession claims below are dated history and are superseded by this section and the corrected JSON. No native execution or successful seal is claimed.

| Finding / ruling | Response and verification | Commit |
|---|---|---|
| DS-SOL2-01 | Fixed the concrete Browser inline/reference route. Exact canonical MessagePack 16,384/16,385-byte controls, resolved references, missing/hash/size/media/encoding cases, original-result retries and retained readers pass. The separate 65,536-byte JSON body budget remains. | `2a9364409a`, `bd168f51ab` |
| DS-SOL2-02 | Fixed full-match/end-of-input guards across the actual schema closure. Four compaction ids plus Browser artifact and checkpoint publication ids have isolated LF negatives; resolved reference positives pass. | `2a9364409a` |
| DS-SOL2-03 | Fixed unsupported assessment/repoint claims through `ds-fix2-depth-retraction.json` and `ds-fix2-regrade-application.json`. Same honest assessment path, receipted before/after hashes, depth-only admission-record changes, explicit compaction supersession-history correction. Fresh/retry replay-only, LF and eager dormant-ref negatives are authored. Full check-11 work remains PARTIAL at the review cap. | `72abc40713`, current receipted regrade |
| Ruling 1 | Implemented all three authorized steps: governed EventRecord 3.0.0 successor with exact prior readers/upgrader and pack custody; explicit SP-273/Home4 amendment covering writer/reader/checkpoint; complete 1,208-affected-id large-event oracle (1,200 added tabs and all originals) and complete Home4 value reference. No new tab/panel cap, truncation, omitted or split event. Producer now PASS; oracle stays PARTIAL for check 11. | `2a9364409a` |
| Ruling 2 | Applied the review's honest baseline before repair, then upgraded only the three repaired producer cells. No registration history, Jared membership decision, registry row or frozen validator change. | `72abc40713`, current receipted regrade |
| Cycle-1 fixes and whitespace | Kept complete-value references, exact BLAKE3 ids, terminal's non-PASS cells and all four original application records. Independent 40/100-tab and 38-length BLAKE3 probes still pass. Removed the introduced search-excerpt whitespace. | `72abc40713`; preservation checks |

### Governed owner contract and exact family reuse

`Contracts_V0.md` section 1.2.1 and `event_record_v3.schema.json` close object/null-inline versus null/verified-reference forms. Resolved bodies pass their registered payload schema and joins. Exact uncompressed MessagePack bytes determine size/BLAKE3; existing producer-semantic digest inputs and Storage metadata exclusions remain. Pack bytes/index precede acknowledgment, or share its durable segment group; SP-337 retains holds, retention, GC and coherent restore. StorageMigrationCoordinator installs the exact writer/reader/checkpoint paths before native activation (NOT_RUN). Original `event_record.schema.json` and payload meanings remain unchanged. A legacy string reference is never silently interpreted as the successor object.

Search: `ds-fix2-binding-search.json`, base `093d102406`, live owner/schema/script/test scope excluding ledgers and generated pipelines. No pre-existing EventRecord 3.0.0 reference schema was found. Each family reuses its own emitter, consumer, projector, checkpoint, exact receipt binding and retention; none is inferred from a sibling. Browser producer evidence retains each exact SMPFS command/handler/first-AppendReceipt adoption. Newly authored technical representation only, under the user's ruling and existing DL-270/DL-045/DL-046 authority.

### Family grades

| Family | Unsupported branch claim | Cycle-2 review baseline | After repair |
|---|---:|---:|---:|
| context.compaction.completed | 12 | 11 | **11/12** |
| browser.workspace.created | 12 | 10 | **11/12** |
| browser.workspace.reset | 12 | 10 | **11/12** |
| workspace.layout_changed | 10 | 10 | **11/12** |
| terminal.workgroup_moved | 10 | 10 | **10/12** |

The four oracle cells remain PARTIAL because full own-defect guard-removal witnesses are incomplete. Terminal's consumer and oracle cells remain PARTIAL for the unchanged Jared question in review round 1. Native NOT_RUN alone lowers no cell. The three admission records pin the same corrected partial assessment; those pins do not supply full-depth admission proof. The layout producer ledger cell is PASS, oracle cell FAIL; all historical dispositions, cohort pins, AUG-CP choices and provisional flags remain unchanged. Compaction's historical row keeps its evidence/disposition and explicitly retracts current complete-depth supersession proof.

### Guard-removal result and follow-up at the cap

`ds-fix2-guard-removal.md` contains the table and exact case-number key; the full source table is retained with its SHA-256. Boundary oracles: **24 positives / 46 negatives**, **10 guard groups witnessed / 2 incomplete**. Whole source inventory: **525 conditions**, **62 with observed flips**; complete ownership/other-negative proof remains open. Empty/exception/nonflipping rows are explicitly partial, never PASS. Every guard is restored after its in-memory mutation.

The broad audit caught an impossible-calendar acceptance in the new compaction model and an audit input-wiring mistake (`store_ops` instead of fixture `payload_store_ops`). Both are fixed in `13ab3a1a91`: an invalid-calendar negative and valid leap-day positive, correct payload-store mutations, and a full baseline preflight that refuses accepted negatives before ablation. Its injected bad-negative control passes. All **194 distinct baseline negatives reject** at the final source revision. The large-panel control retains all 1,208 original/added tab ids (`f3433cc603`), without omission. The large-panel control retains all 1,208 original/added tab ids (`f3433cc603`), without omission. The shared Browser projector also explicitly retains exact 2.0.0 readers (`bd168f51ab`); paired controls prove retained replay succeeds while a fresh writer still refuses 2.0.0 and an unknown retained payload field refuses projection. The reset replay ablation targets the exact cached gate instance used by preflight, and a supplied nonflipping guard now fails the boundary suite (`9f83b5ed56`); its injected bad-proof self-test passes. The two explicit boundary follow-ups are `verified_reference_resolution` (missing/hash/size/media/encoding and layout missing/corrupt references) and `browser_historical_authenticity` (unverified-source and withdrawn-checkpoint controls for each Browser reader). The remaining table rows need isolated/coherent own-defect controls and ownership adjudication; no further blind-review loop or 12/12 assertion is opened at this cap. This is technical follow-up, not a request for a new layout decision.

### Eleven standing checks

| Check | Current evidence / limit |
|---|---|
| 1 Replay-only | Explicit fresh refusals for all four current families, known retry refusals for both Browser writers; no current writer selects replay-only. Compaction's native retry obligation remains authored/NOT_RUN. |
| 2 App key format | These registered editions are Project-only; no app writer/key is invented. |
| 3 Project partition | Existing Browser positives use `project~`; the generic-source/Storage-id controls remain intact. |
| 4 Inline bound | Canonical MessagePack exact boundary and reference route for Browser/layout; bounded compaction metadata stays inline. |
| 5 Identifier LF | Full closure uses exact end-of-input semantics; eight isolated LF controls plus valid references pass. |
| 6 Semantic retry | Original physical body/ref pins; sequence and observed/persisted changes reuse the original. No Storage metadata added to semantic comparison. |
| 7 Checkpoint identity | Existing family/generic token tests retain exact Storage-instance and encoded scope joins. No synthetic generic fixture is claimed as an end-to-end indexed family event. |
| 8 Failure exit | New invalid-positive CLI returns 1; self-test requires it. Audit refuses an accepted negative before weakening. Existing family CLIs and declared suites pass. |
| 9 Ref closure | Offline eager traversal, including dormant definitions; five broken-ref controls pass. Home closure resolves 415 refs with zero unresolved. |
| 10 Historical validity | Exact prior envelope readers, stale-live-state-independent retained facts, deleted-thread content-free audit, forged/withdrawn refusals; terminal disclosure untouched. |
| 11 Own-defect proof | **Incomplete**; full tables and exact outstanding source rows retained. All four affected oracle cells remain PARTIAL. |

### Verification and frozen seal

- Browser owner tests: **118 OK**; shared Browser admission: **38 OK**; PM7 tests: **13 OK**.
- Browser created/v2/reset/shared checkers, Home4 checker/self-test, PM7/shared-runtime validators: exit 0. New boundary suite, CLI fault control and audit input fault control: see `ds-fix2-verification.json`.
- Shard generation/check and PlanUnit index generation/validation: top-level pass, 99 sources / 3,093 shards / 7,422 units. Only the edited Contracts, Storage and materialized Storage registry sources changed derived shards. JSON syntax and whitespace checks pass.
- All current exact quotes, application file/line hashes and admission pins verify. The original envelope, event registry, Decision Log, frozen validator and four original application records remain byte-identical to the reviewed head.
- Frozen validator SHA-256 `190a86f23e06362bdb98e27eb23268c9691db46cc41bc9f97e1fbb6bde1abc20`, scratch roots only: before **exit 1 / 4 categories**; after **exit 1 / 5 categories**. After retraction, only coordination.agent_registered counts as complete post-August depth. The compaction evidence-gap failure is honestly restored; registered incomplete rows are compaction, layout and terminal. DL-300 records/denominator remain open. Seal flags stay false; nothing is weakened to obtain a seal.

### Open items and ids

**Technical:** finish the exact guard-removal rows and adjudication listed in the table, then re-grade. No complete-depth admission or landing readiness claim. Integration still owns landing checks and governance-staleness/reseal handling. No reseal, registry append, admission or Decision Log edit was performed.

**For Jared only:** terminal.workgroup_moved's existing withdrawal/read-disclosure question remains byte-unchanged; see the original question below. No terminal consumer is invented or reactivated.

**Ids used:** no new PlanUnit ids. Existing SP-400 retained/amended, with existing CV-332, SP-259, SP-273 and SP-337. The unused allocated blocks stay unused.

## Review round 1: findings and responses (DS-FIX1, VM, 2026-11-04)

**Review:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DS-sol/REVIEW.md` (Sol, verdict NOT_READY at `a6665ac36c`). **Worktree:** VM sparse `~/pm-worktrees/DS-fix1` from `a6665ac36c`, removed after the push. No new ids were minted: SP-400 and SP-273 are amended in place.

| Finding | Response | Commit |
|---|---|---|
| **DS-SOL-01** (blocking): Home4 had no route through SP-340's whole-value limit | **Fixed.** SP-400 now bounds the complete Home4 value and stores a larger one by reference. | `31cd37713c` |
| **DS-SOL-02** (blocking): `blake3_id` accepted a trailing LF | **Fixed.** Exact 64-character ids, an ECMA-262 end-of-input guard on every pattern, negatives, a valid reference positive and a verified reference branch. | `31cd37713c` |
| **DS-SOL-03** (blocking): terminal's consumer PASS exceeded the rubric | **Fixed.** Receipted update: ledger `OWNER_REQUIRED`, self-grade PARTIAL. | `78a7f8e824` |
| **DS-SOL-04** (should fix): the second application record is post-dated | **Fixed**, and the same defect in the three first-pass records. Explicit correction record. | `2220b74e24` |
| Layout producer and oracles, re-graded after the repair | **Still not PASS**, for a newly found reason (standing check 4): see the open item below. | `2b671a1605` |
| The terminal question | **Stopped for Jared** (wording below). | none |

### DS-SOL-01: the complete Home4 value (newly authored owner contract under DL-045)

**What changed.**
- `Plans/storage-plan.md` SP-400 prose, "The complete value and its reference form" (`:29514`-`:29520`), the unit's canonical text (`:29534`) and two new acceptance criteria. SP-340's limit (16,384 bytes for both families, read from the storage registry) bounds the complete canonical MessagePack value, never one field.
- A value within the limit is stored inline. A larger one is written to the payload store as its exact canonical bytes, and its key holds a fixed-size reference (`stored_value_ref`): schema id and version, Storage instance, logical key, BLAKE3 id, byte size, media type `application/msgpack`, SHA-256. The decoded layouts, source bytes, event fields and SIR custody stay inside the referenced value.
- **Resolution:** every reader verifies the object, BLAKE3, size, media type, SHA-256, canonical decoding, the Home4 schema and invariants, and the key and Storage instance before use. An unresolvable reference makes the value unavailable under SP-273's missing-or-corrupt fence.
- **Custody:** SP-337's durability order, counting, GC and coherent backup, under the holding family's custody and retention (`RP-CONFIG-CURRENT` slot, `RP-AUTHORITY-INDEFINITE` receipt). No family, key, retention policy, hold, setting or user-visible behaviour is added.
- SP-273's byte-capture paragraph has a dated amendment (`:21955`).
- `Plans/home_layout_v2_slot_receipt.schema.json`: `$defs/stored_value_ref`, `blake3_id` and `sha256_hex`; `home4_value` accepts the reference; `$comment` adds I10 (whole-value bound) and I11 (reference resolution).

**Search before authoring:** `reports/event-authority-20261104/ds-fix1-home4-value-reference-search.txt`.
- SP-340 and SP-330 say a value over the limit is "split per key or stored by reference".
- SP-337 defines the reference triple.
- The EventRecord codec explicitly invents no overflow envelope.
- `whole_document_keys` names only `settings:v1` and `config:v1`.
- The two existing `value_ref` fields (settings chain, Browser program spill) are not redb value references.
- No redb whole-value reference shape exists in `Plans/`, `scripts/` or `tests/`.

**Why a whole-value reference, not per-field spills.** The review notes that moving source captures out cannot bound the decoded layout copies, and receipts grow with the event's unbounded `affected_tab_ids` too. One reference to the whole value bounds the slot and the receipt alike, and keeps SP-273's exact-byte custody intact.

**Oracles.** `Plans/home_layout_v2_slot_receipt_fixtures.json` has 10 valid, 30 schema-negative and 33 joined-value-negative cases, plus a synthetic payload store of 5 objects.
- **Boundaries:** a 16,384-byte slot inline; the same slot at 16,385 bytes by reference; that value inline rejected (I10); a reference to an honest 16,384-byte value rejected.
- **The review's 25-tab slot:** 28,743 bytes by reference is valid; inline it is rejected (I10).
- **Receipts:** one over the limit by reference is valid; inline it is rejected.
- **A valid source `payload_ref`:** 16,385 bytes, beside 16,384 inline prior bytes, inside a referenced value.
- **Resolution negatives:** missing, corrupt, resized, retyped, mis-hashed, non-canonical and Home3-versioned objects; foreign key and Storage instance; a resolved value that skips a revision; and the same five branches for the nested source reference.

**Checker** (`scripts/pm_home_layout_v2_slot_receipt.py`):
- measures the stored size against the registry;
- verifies BLAKE3 in pure Python, matching the reference `blake3` library on 33 lengths up to 123,457 bytes;
- strictly decodes canonical MessagePack;
- resolves every reference;
- registers each schema under its `$id` and its repository retrieval URI (as `application_workflow_source_graph.json` names it), never the network;
- has `--self-test`, which shows it fails on a bad positive and a mis-declared case.

**How to verify:**
- `python3 scripts/pm_home_layout_v2_slot_receipt.py`: rc 0, counts 10/30/33, `ref_closure.unresolved` 0.
- `python3 scripts/pm_home_layout_v2_slot_receipt.py --self-test`: rc 0.
- The review's own `evidence/PROBES.py` against this tree: **rc 1**. Both counterexamples are now refused: the trailing-LF id by the schema and I11, the 28,743-byte slot by I10.

### DS-SOL-02: exact identifiers

**Schema.**
- `blake3_id` and `sha256_hex` are pattern plus `minLength` and `maxLength` 64.
- The source reference's `media_type` is an RFC 6838 type/subtype with no line break.
- The readback key carries a no-line-break guard.

**Checker.**
- Every one of the 70 reachable patterns, including the Home3 patterns reused by `$ref`, is evaluated with ECMA-262 end-of-input semantics.
- It fails on any unresolved `$ref` (standing check 9; 384 refs resolve).

**Negatives.**
- Source-reference ids: trailing LF (the review's exact probe), leading LF, upper case, 63 and 65 characters, non-hex.
- Media type with a trailing LF.
- `operation_digest` with a trailing LF: a plain Python validator accepts it; the ECMA guard refuses it.
- The readback key and `original_owner_result_sha256` with a trailing LF.
- `value_ref.blake3_id` and `value_sha256` with a trailing LF; `value_ref.blake3_id` in upper case.
- `projector_replay_only` on slot and receipt event semantics (standing check 1).

**Valid positives:** the reference cases above. The reference branch is now verified (resolution and I6/I11), not left to the inline tests.

### DS-SOL-03: terminal's consumer cell

**Change.** `ds-fix1-terminal-consumer-regrade.{json,md}` is a receipted update with before and after hashes and exact quotes at `2220b74e24`.
- **Ledger:** `consumers_checkpoints` goes PASS → `OWNER_REQUIRED` (`LEDGER.jsonl:279`, `rows/ROW_terminal.workgroup_moved.json`).
- **Self-grade:** the cell is PARTIAL, as the rubric's line 24 directs: "Where the owner itself says a facet is still open ... grade PARTIAL and quote it".
- **Citations kept:** the reader, the `none_required` checkpoint, SP-278, "No consumer operates", and the three withdrawal quotes (SMPFS-170 `:12413`, `:12602`; SP-319 `:26912`).

**What stays.** No consumer is invented or reactivated, and AUG-CP-TWM-001 is unchanged.

**`provisional` stays false.** This is a judgement the re-review may reverse. DL-039's condition is that the consumer, projector and checkpoint be "cited from the Plans", and they are; the review accepted lifting it. What is open is an owner question, which the cell now records. Re-setting it to true would also bring back the validator's `individual_dispositions_provisional` failure.

### DS-SOL-04: application times

**The defect.** All four DS application records were post-dated against the commits that applied them, not only the one the review named.

| Record | Recorded | Evidenced (commit) | Recorded later by |
|---|---|---|---|
| `ds-step5-august-ledger-application.json` | 18:30:00Z | 18:08:51Z (`55f68a717e`) | 1,269 s |
| `ds-step6-compaction-ledger-note.json` | 18:45:00Z | 18:09:32Z (`ade1ee3d6c`) | 2,128 s |
| `ds-step7-exclusions-application.json` | 18:50:00Z | 18:11:24Z (`43d1ab5555`) | 2,316 s |
| `ds-p2-august-regrade-application.json` | 23:30:00Z | 19:11:41Z (`af9bff39ae`) | 15,499 s |

**The correction.** `ds-fix1-application-time-correction.{json,md}` is the record.
- The evidenced time is the application commit's time, an upper bound; the preceding commit bounds it below.
- The mirrored timestamps are corrected in the five rows (layout, terminal, compaction and the two exclusions) and their census lines, each with a note.
- The four original records are byte-unchanged. The correction's before hashes equal DS-P2's after hashes, so the chain continues.

### Layout re-graded at the new head (standing check 4)

**Result.** Producer and oracles stay non-PASS: ledger FAIL, self-grade PARTIAL, record `ds-fix1-layout-regrade.{json,md}`.

**Cause.** A `workspace.layout_changed` 2.0.0 payload over 16 KiB has no append route:
- CV-361's `affected_tab_ids` and the other affected arrays are unbounded, with no tab cap in the v2 layout, and SP-330 contemplates layouts over 16 KiB;
- SP-273 fixes `payload_ref=null` for this family's new writes (`storage-plan.md:21851`);
- the envelope's DL-270 prose replaces a body over 16 KiB with a BLAKE3 `payload_ref` (`Contracts_V0.md:1019`);
- `Plans/event_record.schema.json` 2.0.0 still requires an object `payload` (`:116`) and types `payload_ref` as a nullable string (`:120`-`:121`).

**Why it stays open here.** Settling the envelope's prose against its schema is the envelope owner's work, not this lane's. The family can adopt the route once it is consistent. Under the rubric the producer lacks that append boundary, and the oracles cannot test a boundary missing from the contract.

### The terminal question (stopped for Jared)

> **`terminal.workgroup_moved` was withdrawn on 2026-10-09 (DL-181, SMPFS-170's rule) and its producer never ran, so no move was ever recorded. Which rule should SP-319 and SMPFS-170 both state?**
> - **A.** Keep compatibility only. Any recorded 1.0.0 event keeps its exact meaning, retention, write refusal and no-remint checks. Retire the dedicated passive reader's new-disclosure path, SP-319's original-move oracles and both read-result and custody companions, explicitly, in both owners.
> - **B.** A, plus a passive reader that discloses recorded 1.0.0 events through a closed read-result (`verified_historical` | `unresolved_historical_validation` | `unavailable`) with reader oracles. Since no operation was ever admitted, an authentic event can only resolve to `unresolved_historical_validation`. The original-move oracles and the original result/custody companion become lineage.
> - **C.** Keep SP-319's full literal list: the reader, the original result/custody companion and the original-move paired oracles, written for an operation that never existed.

**The review's recommendation: A**, "explicitly approved and applied to both owners". Its reasons:
- B would add a disclosure route that cannot be inferred from an "unresolved" result.
- C keeps substantial tests for retired behaviour.
- "Readability" should mean preserved compatibility interpretation, not permission for a new disclosure route.

Until Jared answers, `consumers_checkpoints` and `positive_negative_oracles` stay non-PASS. With an answer, the owner edits, fixtures and checker are a short follow-up (ids SMPFS-300-309 or SP-401-409).

### Family grades (self-grade; ledger in brackets)

| Family | Before (`a6665ac36c`) | After (`2b671a1605`) | Not PASS after |
|---|---|---|---|
| `context.compaction.completed` | 12 | 12 | none |
| `browser.workspace.created` | 12 | 12 | none |
| `browser.workspace.reset` | 12 | 12 | none |
| `workspace.layout_changed` | 12 [12] | **10 [10]** | producer, positive_negative_oracles (PARTIAL [FAIL]) |
| `terminal.workgroup_moved` | 11 [11] | **10 [10]** | consumers_checkpoints (PARTIAL [OWNER_REQUIRED]), positive_negative_oracles (PARTIAL [FAIL]) |

Status counts: 59 PASS / 1 PARTIAL before, **56 PASS / 4 PARTIAL** after. Every one of the 279 evidence quotes was re-checked at `2b671a1605`.

### Frozen seal check (validator SHA-256 `190a86f2…`, unchanged, scratch copies)

**Result.** rc 1 both times, `seal_prerequisites_met` false, **4 failures before and 4 after**.

| Failure | Before (`a6665ac36c`) | After (`2b671a1605`) |
|---|---|---|
| `post_august_admission_incomplete` | DL-300 three, no record | unchanged |
| `unexpected_august_set` | DL-300 three + the August pair | unchanged |
| `registered_contract_depth_incomplete` | 1: terminal (oracles) | **2: terminal (consumers, oracles); layout (producer, oracles)** |
| `fresh_census_denominator_not_closed` | present | present |

**Receipts:** `drafts/DS/seal-fix1-before-a6665ac36c-receipt.json`, `seal-fix1-after-<head>-receipt.json`.

### Standing checks across the families this branch prepares

| Check | Layout (Home4, this lane) | Terminal | Compaction, Browser created, Browser reset (oracles outside this lane) |
|---|---|---|---|
| 1 `projector_replay_only` negative | **added** (slot and receipt) | no oracle (stopped) | **absent** from their fixtures and checkers |
| 2 CV-366 app-scope keys | n/a (project_only) | n/a | n/a: compaction's one application case is a `project_only` rejection |
| 3 `project~` partition | n/a: Home keys use no partition | n/a | Browser created fixtures use `project~` |
| 4 bodies over 16 KiB | **Home4 values fixed**; **event body open** (above) | n/a | not re-audited |
| 5 anchored patterns and trailing-LF negatives | **fixed** (exact lengths plus ECMA guard; 9 trailing-LF negatives) | n/a | **no trailing-LF negatives found**; not re-audited per pattern |
| 6 retry body | Home4 compares SP-273's semantic fields only (unchanged) | n/a | not re-audited |
| 7 checkpoint identities | n/a in Home4 fixtures | n/a | not re-audited |
| 8 failure oracles reject success | the Home4 checker exits 1 on any failure; `--self-test` proves it | n/a | not re-audited |
| 9 every `$ref` resolves | **checker fails on an unresolved `$ref`** (384 resolve) | n/a | not re-audited |

These three families' oracle cells are not touched by the fixes and are not re-graded here (the review accepted 12/12). If the lead treats standing checks 1 and 5 as rubric requirements, their oracle cells would be PARTIAL. Step 4's admission repoints would then no longer hold. That is the lead's call; see the open items.

### Checks (round 1, VM, exit codes; baseline worktree at `a6665ac36c` for comparison)

| Check | `a6665ac36c` | Head |
|---|---|---|
| `pm-plan-index.py validate` / `pm-shard-plans.py --check` | 0 / 0 | 0 / 0 (`status: pass`, 7422 units; only storage-plan shards and the index regenerated) |
| `pm_home_layout_v2_slot_receipt.py` / `--self-test` | 0 (5/12/14) / n/a | 0 (10/30/33) / 0 |
| `pm-storage-profile-check.py` | 1 | 1, identical output (pre-existing missing profiles) |
| `pm-plans-verify.py` json-syntax, lint-path-refs, lint-contractrefs | 1 / 1 / 1 | 1 / 1 / 1, identical output |
| `pm-plans-verify.py` lint-banned-phrases | 0 | 0 |
| `pm-plans-verify.py` validate-plan-graph | 1 | 1, same failures; only the Spec Lock `actual` hashes of `storage-plan.md` and its index files differ |
| `pm-plans-verify.py` validate-browser-event-admission, validate-pm7-gui-fixtures, validate-projects-refresh-contracts | 0 / 0 / 0 | 0 / 0 / 0 |
| PM7 GUI, shared runtime, projects refresh, Browser created / created v2 / reset / admission checkers | 0 each | 0 each |
| unittest: Browser admission 38, created 65, reset 53, PM7 GUI 13 | OK | OK |
| unittest: holding bucket / coordination events | 2 / 14 failures | the same 2 / 14 |
| review `evidence/PROBES.py` | (0 at review) | **1**: both defects refused |
| Frozen seal check | 1, 4 failures | 1, 4 failures |

**Expected governance staleness for the reseal request:** the Spec Lock hash of `Plans/storage-plan.md` (again).

### Open items added in round 1

1. **Layout's event body over 16 KiB.** It has no append route, because the envelope's DL-270 prose and `event_record.schema.json` 2.0.0 disagree. This needs the envelope owner. The family then adopts the route: Home4 event semantics, the reader, and a big-event oracle.
2. **Seal-family oracles and standing checks 1 and 5.** The compaction, Browser created and Browser reset oracles have no `projector_replay_only` and no trailing-LF negatives. They are outside this lane's paths; the lead decides whether this reopens their oracle cells and the step-4 repoints.
3. **The Home3 schema's anchored patterns.** `Plans/home_layout_pending_receipt.schema.json` has 168 patterns, without length guards. The Home4 checker guards every pattern it reaches, but a plain Python validator of Home3 values still accepts a trailing LF. The Home3 schema is outside this lane.
4. **Registering the 4.0.0 edges.** When they are registered, SP-340's "the storage registry's storage_profile records which" should also record the Home4 reference form. SP-400 changes no registry row now.
5. **`individual-disposition/COVERAGE.json`.** It is still not regenerated, as in every DS step.

## Second pass (DS-P2, VM, 2026-11-04)

The first pass left the frozen seal check at 4 failures. Three depth cells on the two August families remained, all technical work under DL-045. This pass took each in turn.

| Cell | Outcome | Commit |
|---|---|---|
| `workspace.layout_changed` producer | **PASS.** SP-400 writes the v2 slot and receipt schema that SP-330 required ("Home4", 4.0.0). | `2e5801d7df` |
| `workspace.layout_changed` oracles | **PASS.** The suite SP-273 pins is fixed against DL-076, re-frozen as v5 and repinned, with receipts. | `bef4342ecc` |
| `terminal.workgroup_moved` oracles | **Stopped** with an owner question (below). Nothing was written for it. | none |
| Both August rows re-graded | Receipted row update in the step-5 pattern: layout 12/12, terminal 11/12. | `af9bff39ae` |

**Superseded in review round 1 (above):** the review rejected layout's producer and oracle PASS (DS-SOL-01/02) and terminal's consumer PASS (DS-SOL-03); round 1 repairs the Home4 contract and re-grades layout 10/12 and terminal 10/12.

**Frozen seal check.** The validator was unchanged (SHA-256 `190a86f2…`) and ran on scratch copies.
- **Before (`600575221d`):** 4 failures. The receipt equals the first pass's `43d1ab5555` receipt in every field but the time.
- **After (`af9bff39ae`):** 4 failures. `seal_prerequisites_met` stays false.

| Failure | Before (`600575221d`) | After (`af9bff39ae`) |
|---|---|---|
| `post_august_admission_incomplete` | the DL-300 three have no record | unchanged (waits on cards) |
| `unexpected_august_set` | DL-300 three + the August pair | unchanged: it lists every live family that is neither Known37 nor admitted, whatever its depth |
| `registered_contract_depth_incomplete` | 2: layout (producer, oracles), terminal (oracles) | **1: terminal (oracles)** |
| `fresh_census_denominator_not_closed` | present | present (its `blocked_by` strings are fixed text) |

The count stays 4 because the remaining terminal cell keeps `registered_contract_depth_incomplete` open. The other three failures do not depend on these cells.

### Cell 1: layout producer (SP-400, newly authored owner contract under DL-045)

**Premise check.** SP-330: "The successor slot and receipt schema for v2 writes is not written in this addendum: it must reference `pm.home_workspace_layout.v2` and the CV-361 payload by `$ref` … until it exists no native v2 writer is admitted through those families". SP-273's 2026-10-09 amendment calls it "an open item of SP-330". Both are still current. The registry admits only 2.0.0 appends. The family is one of DL-045's 285 names.

**Search first.** Every `Plans/`, `scripts/` and `tests/` file naming the v2 record, the 2.0.0 payload, the two families or the capture and core codec ids was read (`reports/event-authority-20261104/ds-p2-home4-binding-search.txt`).
- No slot, receipt or capture definition is typed for the v2 record or the 2.0.0 payload.
- No MessagePack capture or core codec id exists.

**What was written:**
- **`Plans/home_layout_v2_slot_receipt.schema.json`.** It references the v2 record and CV-361 by `$ref`. It reuses by `$ref` every Home3 member that is not typed for v1 layouts or the 1.1.0 payload, and replaces only these:
  - the two layouts;
  - event semantics: a 2.0.0 payload, never `migrated_from_v1`, never a null command;
  - `command_id` in the binding and the owner result: the CV-361 set; the owner result moves to 2.0.0;
  - the v2 readback key;
  - the encodings DL-270 retires: binary source bytes, or a BLAKE3 payload reference above 16 KiB, and new canonical MessagePack ids for capture and migration core.
- **Fixtures.** `Plans/home_layout_v2_slot_receipt_fixtures.json` has 5 valid values, 12 schema negatives and 14 joined-value negatives. Each negative was checked to fail for its stated reason.
- **Checker.** `scripts/pm_home_layout_v2_slot_receipt.py` checks the fixtures against the schema and invariants I1–I9; rc 0, pass.
- **Owner text in `Plans/storage-plan.md`:**
  - the SP-400 section and unit;
  - dated amendments in SP-330's transaction paragraph and in SP-273's prose and canonical text.

**What it does not change.** No registry row, family, key, retention policy or hold. The storage registry rows keep naming Home3 until the 4.0.0 edges are registered with their installation, as SP-400 says.

**Newly authored names:**
- schema and slot-producer version `4.0.0` of the existing families;
- owner result `pm.home_layout_owner_result.v1` at `2.0.0`;
- `home_content_free_capture_canonical_msgpack.v1`;
- `home_slot_migration_core_canonical_msgpack.v1`;
- the `layout_source_bytes` shape (`inline` / `payload_ref`).

### Cell 2: layout oracles (DL-076 re-freeze)

The suite at `~/PM-Experiments/event-authority-step08-workspace-layout-20260911` is a symlink into `/mnt/Cursor/archive/PM-Experiments/vm-archive-20260925/`, so it is on the share. v4 was left untouched, and `v5/` was made beside it.

**Proof the change is DL-076 only.** In a scratch copy, v4 first reproduced its own fixtures byte-identically.

**The proposed schema.** v5's proposed schema is byte-identical to canon's DL-076 correction (`fe46283fc5`). v4's copy was byte-identical to that commit's parent content.

**What v5 does:**
- `validate_v5.py` stores the nine-field durable token and joins each read's own live snapshot.
- Converted v2 bundles and synthetic history keep the durable token only.
- The v2 `generic_snapshot` defect moves to the live read.

**Result.**
- Stored `redb_snapshot_id`: 173 → 0. Proposed-schema occurrences: 6 → 0.
- Live-read occurrences (`proof`, `admitted_receipt_store`) are kept: they are live fences.
- All 48 relation, 22 history, 4 cleanup, 32 slot-migration and 12 cleanup-ordinary cases keep their ids, validity and counts. Three negative outcomes now name the DL-076 join.
- `freeze_v5.py` asserts all of this and wrote manifest `62823e0a62173cdd99bc41cc676e1aec9f4b5689122a51bc289ffb951aa70877` (53 members).
- A fresh scratch rerun reproduces every member.

**Repin.**
- `Plans/home_layout_event_contract_fixtures.json` `frozen_joined_subject` names v5. The old pin and the reason sit beside it in `refrozen`, as the Browser pin's reason sits beside its re-frozen value.
- SP-273 records the re-freeze.
- SP-273 also records that the full-value suite (`7ab4fb00…`, pinned by a 2026-09-11 report) stores no reader checkpoint in its own cases, and that its pre-DL-076 checkpoint copies are superseded by the corrected Home3 schema and v5.

That suite was **not** re-frozen. It is 193 MB and 3,658 files, with pinned-source checks against old canon. This is a judgement call a reviewer may reverse.

Receipts: `reports/event-authority-20261104/ds-p2-layout-suite-refreeze.{md,json}`.

### Cell 3: terminal oracles (stopped)

**What canon settles for a withdrawn family:**
- **Withdrawal refusal.** CV-361: "No producer writes terminal.workgroup_moved" (`Contracts_V0.md:23713`); Wiring Matrix: "No entry declares terminal.workgroup_moved" (`:7286`).
- **Historical readability.** "recorded events stay readable at 1.0.0" (CV-361); "the family keeps its registry row for history" (`:23774`).
- **No remint.** A move pending at upgrade "is never reminted" (CV-361).

**What canon leaves open:**
1. **Reader disclosure (two owner documents disagree).**
   - SMPFS-170 says the withdrawal admits "no new producer admission and no new reader disclosure" and "the passive reader admits no new disclosure" (`Section15_MVP_Promoted_Features_Spec.md:12413`, `:12604`).
   - SP-319's DL-181 amendment keeps "this passive reader … only to read 1.0.0 events already written" (`storage-plan.md:26912`).
   - SP-319's canonical text says no consumer operates (`:27073`).
2. **Live-behavior oracles for a feature that never ran.**
   - SP-319 still says "Paired static oracles and closed original/read-result companions remain required" (`:27090`), and "These are required paired oracles for the companion task" (`:27057`).
   - Those oracles are original-move checks: a positive "real-shaped changed move" with original result and append joins; negatives such as fifth-section admission, false rollback after possible append and lost-acknowledgement remint.
   - Writing them needs the original result/custody companion that SP-319 calls "separate unfinished work under SMPFS-170" (`:26991`–`:26992`). SMPFS-170 says no such operation was ever admitted.
   - The DL-181 amendment itself notes that one of these oracles "describes the retired cap of four sections" (`:26912`), but does not retire the list.

**The exact question (for a card; the first two options touch DL-045's reserved "conflict between two owner documents").** For `terminal.workgroup_moved`, withdrawn under SMPFS-170's rule with a producer that never activated, which oracle set does SP-319 require?
- **A.** Withdrawal and historical-readability oracles only. The reader is withdrawn and discloses nothing. SP-319's original-move oracles and both companions become lineage.
  - The withdrawal and readability oracles: any append is refused; a recorded 1.0.0 event validates by its own `payload_schema_id` and is never rewritten or aliased; SP-330's conversion never mints one; a terminal tab move is a `tab_moved`.
- **B.** A, plus the passive reader's closed read-result companion (`verified_historical` | `unresolved_historical_validation` | `unavailable`) and reader oracles. An authentic recorded event can only resolve to `unresolved_historical_validation`, because no operation was ever admitted. The original-move oracles and the original result/custody companion become lineage. This sides with SP-319 over SMPFS-170 on disclosure.
- **C.** Everything SP-319 lists, including the original result/custody companion and the original-move oracles, written for an operation that never existed.

Whichever is chosen, the A-part is needed. With an answer, the fixtures, checker and companion are a short follow-up, using ids from SMPFS-300–309 or SP-401–409.

### Premise checks (second pass)

| Answer or text | Today's text | Result |
|---|---|---|
| DL-045, authoring scope | `workspace.layout_changed` and `terminal.workgroup_moved` are both in its 285 names (first pass) | Holds |
| SP-330/SP-273, "not written … until it exists no native v2 writer is admitted" | Unchanged since 2026-10-09 | Holds; basis of SP-400 |
| DL-270 (SP-337, SP-339, SP-340), JSON/base64 retired for new stored writes | Current | Holds; SP-400 uses binary fields and new MessagePack ids |
| DL-076, stored token without `redb_snapshot_id` | Current; canonical schemas corrected 2026-09-24 | Holds; basis of v5 |
| DL-039 AUG-CP-WLC-001 / AUG-CP-TWM-001 | Unchanged | Holds; owner choices untouched |
| SMPFS-170 withdrawal vs SP-319 reader and oracle list | Disagree (above) | **Open; the terminal cell is stopped** |

### Checks (second pass, VM, exit codes)

| Check | Result |
|---|---|
| `pm-shard-plans.py --generate` / `--check` (after cells 1 and 2) | 0 / 0; only storage-plan shards changed |
| `pm-plan-index.py generate` / `validate` | 0 / 0, top-level `status: pass`; 7422 units (+SP-400) |
| `pm-plans-verify.py lint-path-refs`, `json-syntax`, `lint-contractrefs` | rc 1 on the sparse tree before and after, with the same 14 / 1 / 1 failures (absent `Concepts`, the raw-capture link, an old audit ref); no new failure |
| `pm-plans-verify.py lint-banned-phrases` | rc 0, pass |
| `pm-plans-verify.py validate-plan-graph` | rc 1, 1,438 failures, none naming SP-400 or the new files |
| `scripts/pm_home_layout_v2_slot_receipt.py` | rc 0: 5 positive, 12 schema-negative, 14 invariant-negative cases as declared |
| v5 suite: `check_slot_migration.py`, `validate_v5.py`, `check_slot_migration.py`, `freeze_v5.py`, fresh scratch rerun | rc 0 each; 0 manifest mismatches |
| `pm-validate-pm7-gui-fixtures.py validate` / `pm-plans-verify.py validate-pm7-gui-fixtures` | rc 0, pass / rc 0, pass (7 workspace-event valid fixtures) |
| `pm-projects-refresh-contracts.py` / `pm-shared-runtime-command-contracts.py validate` | rc 0 / rc 0 |
| `tests/test_pm_validate_pm7_gui_fixtures.py` | 13 OK |
| `tests/test_event_authority_holding_bucket.py` | 2 failures, the same two as the first pass and `main` |
| Frozen seal check, scratch copies, validator `190a86f2…` | rc 1 on both: 4 failures before, 4 after (depth sample 2 → 1) |

**Expected governance staleness for the reseal request:** the Spec Lock hash of `Plans/storage-plan.md` (again).

## Result (first pass)

The frozen seal check (`Plans/.audits/event-authority-2026-08-12/independent-validator/`, run unchanged on scratch copies) goes from **6 failures on `main` to 4 on this branch**. `seal_prerequisites_met` stays false.

| Failure | `main` `be4766513f` | This branch |
|---|---|---|
| `post_august_admission_incomplete` | 6 issues: DL-300 three have no record; compaction, created and reset `depth_incomplete` | 3 issues: only the DL-300 three (no record; card CC-D1b-1) |
| `unexpected_august_set` | 8 families | 5: the DL-300 three plus the two August families (it lists every live family that is neither Known37 nor admitted) |
| `individual_dispositions_evidence_gap_blocking` | compaction | **cleared** |
| `individual_dispositions_provisional` | 2 August rows | **cleared** |
| `registered_contract_depth_incomplete` | compaction (11 fields), terminal and layout (`consumers_checkpoints`, provisional) | terminal: `positive_negative_oracles`; layout: `producer`, `positive_negative_oracles` |
| `fresh_census_denominator_not_closed` | present | present (post-seal by the validator's own note; its `blocked_by` text is fixed strings) |

The `main` run's receipt equals `state/independent-validator-diagnostic-be4766513f.json` in every field but `generated_at_utc`.

**Why prerequisites are still not met:**
- **The DL-300 three.** They are untouched, as the lane says; they wait on cards CC-D1b-1 and CC-D1b-2.
- **The August pair (premise failure, step 5).** At today's text they are 10/12 (layout) and 11/12 (terminal), not 12/12. D1b's counterfactual D assumed the ledger's older PASS cells were still true; three of them are not.

## Commits

| # | Commit | Step | What |
|---|---|---|---|
| 1 | `d7e5840240` | 1 | ACD-461 admits `context.compaction.completed` in its Project edition only; the app counterpart emits no EventRecord until Event Authority admits an application payload version. Shards and index regenerated. |
| 2 | `f86b68e982` | 2 | SP-319's canonical text states that no consumer operates on `terminal.workgroup_moved`. Shards and index regenerated. |
| 3 | `62e4f832f0` | 8 (moved earlier) | Re-freeze of the shared Browser admission suite's `upstream40` pin. |
| 4 | `3b7dd7b9f2` | 3 | Fresh depth assessment `depth-b1-seal-families.json` and `.md`. |
| 5 | `66a93f80f3` | 4 | Three DL-077 admission records repointed to it. |
| 6 | `55f68a717e` | 5 | August ledger rows: consumers cited, provisional lifted, citations refreshed, three cells regraded. |
| 7 | `ade1ee3d6c` | 6 | Compaction's July ledger row: superseded note. |
| 8 | `43d1ab5555` | 7 | Exclusions: `dashboard.widget_added`, `coordination.debug_mirror_exported`. |
| 9 | (this report) | 8 | Branch report and self-grade. |

## The eight steps

### 1. Compaction scope (ACD-461)

The 2026-11-03 projects-refresh edit (`7a17526dc2`) wrote "`context.compaction.completed` has explicit original Project and newly admitted application editions". No application edition was ever admitted:

- **Registry row:** `project_only` with no `payload_versions` (`Plans/event_family_registry.json:2874-2917`).
- **SP-259's criterion:** "The sole new family uses project_only scope" (`Plans/storage-plan.md:19531`).
- **DL-300:** "This is the one Event Authority grant of the projects and settings refresh". It gives app editions to eleven Goal families, not this one (`Plans/Decision_Log.md:21055`).
- **CV-366:** "Unknown/missing source, version or family is unavailable/quarantined; a registry or all-true fixture boolean cannot admit native writes". Its event-selection table has no compaction row.

**What changed.** The identity-and-scope paragraph and the canonical text now say three things:
- the family is admitted in its original Project edition only;
- the app counterpart (CV-329, CV-366 `CompactionCompletionApplicationV1`, SP-259) "emits no `context.compaction.completed` EventRecord until Event Authority admits an application payload version of this family";
- the app sibling's replay applies "once that application version is admitted".

`source_lineage` gains DL-300.

**What stays exact.** The Project edition, every binding, and the app counterpart's rules. Nothing is decided about the app thread's compaction operation itself.

**Checks.**
- `pm-plan-index.py generate` rc 0 and `validate` pass; the shard check passes.
- Only ACD files were regenerated.
- `pm-projects-refresh-contracts.py` rc 0 on `main` and on the branch.

### 2. Terminal operating consumer (SP-319)

One sentence was added to SP-319's canonical text:

> "No consumer operates on terminal.workgroup_moved, because its producer never activated and no operation was ever admitted (SMPFS-170's withdrawal rule, applied by DL-181; CV-361); terminal.workgroup_move_history_read.v1@1.0.0 survives only in SMPFS-170's lineage text, and this reader stays only for a 1.0.0 event already recorded, if any."

**Sources.**
- SMPFS-170, superseded: "the producer terminal.workgroup_move_commit.v1 never activates and the passive reader admits no new disclosure; no operation was ever admitted" (`Plans/Section15_MVP_Promoted_Features_Spec.md:12601-12603`).
- CV-361: "No producer writes terminal.workgroup_moved" (`Plans/Contracts_V0.md:23713`).
- SP-319's own 2026-10-09 amendment (`Plans/storage-plan.md:26903`).

I chose the "none operates" form over naming a retained consumer. Naming one would have revived a definition that exists only in superseded lineage text. Nothing was invented.

**A YAML slip, fixed before commit.** The first draft put `: ` inside SP-319's plain-scalar `canonical_text`. `generate` then reported a parse error and 7420 units. The fixed text gives 7421 units, rc 0, and `validate` passes.

### 3. Fresh depth assessment

Files: `reports/event-authority-20261104/depth-b1-seal-families.json` (SHA-256 `4100651156a977284fcf73aca33cede5b4477aef6943d098bd316a004f1a4050`) and `.md`.

**How it was graded.** At `62e4f832f0`, in the 2026-09-24 row format, on the unchanged Step 8 rubric.

**Result.** All 36 cells are PASS with `Plans/` evidence: 31 carried and 5 upgraded. The upgrades are compaction oracles (`64d4567f12`), created producer, consumers and oracles (`a3d6bb616b`, `0ba3ac9019`), and reset producer (`a3d6bb616b`).
- **Compaction scope.** PASS again only because of step 1.
- **Evidence.** 191 items, each an exact single-line quote located by script and hashed like `compile_depth42.py`.

**Static checks at that head:**
- PM7 GUI checker: pass, one compaction family.
- Shared-runtime command contracts, `validate-pm7-gui-fixtures` and JSON syntax: pass. With the PM7 checker and plan-index validate, that is ATS-040's whole required set.
- `pm_browser_workspace_created.py` and `_v2.py` (PASS, 3 positives), `pm_browser_workspace_reset.py`, `pm-browser-event-admission.py`: pass.
- Test suites: PM7 GUI 13 OK, created 65 OK, reset 53 OK, shared admission 38 OK.

### 4. Admission records repointed

`reports/event-authority-20260911/admission-records/{context.compaction.completed,browser.workspace.created,browser.workspace.reset}.json`: only `depth_assessment.path` and `.sha256` change. The script asserts that no other key differs.

**Seal check effect:**
- `post_august_admitted` goes from 1 to 4;
- `individual_dispositions_evidence_gap_blocking` clears;
- compaction leaves the depth sample.

### 5. August ledger rows (deviation: see below)

A receipted row update of the two rows. Records: `ds-step5-august-ledger-application.json` (before and after hashes) and `.md`.

**What changed:**
- `consumers_checkpoints` is PASS, cited from the Plans:
  - **layout:** SP-273's reader/projector `home.workspace_layout_event_reader.v1@1.0.0`, its three 1.0.0 consumers, and checkpoint `home_layout_event_reader_checkpoint.v1:…` with CAS, rebuild and the SP-278 nine-field token;
  - **terminal:** SP-319's reader, no projector, `none_required`, and the step-2 sentence.
- Every citation is re-anchored to exact quotes at `66a93f80f3`.
- `provisional` is false, and the census lines follow.
- `AUG-CP-*` choices, dispositions, buckets and pins are unchanged.

**Line endings.** The ledgers have mixed CRLF/LF endings. My first write normalised them; I restored the files and rewrote preserving each line's ending. Exactly 2 lines change in each ledger.

### 6. Compaction's ledger row

Records: `ds-step6-compaction-ledger-note.json` and `.md`.

**What the note says:**
- the family was registered in Step 6 (`b240dd93e2`);
- the production wiring is repaired (`Plans/Wiring_Matrix.production.json:18191`);
- the DL-077 admission record supersedes this row (`INDIVIDUAL_DISPOSITION_SCHEMA.md:44`).

The disposition `NEEDS_MORE_EVIDENCE` and the evidence cells are kept as the historical July record.

### 7. Exclusions

Records: `ds-step7-exclusions-application.json` and `.md`. Both rows become `RECLASSIFY_TO_EXCLUDED` on the individual row and the census line. Legacy bucket, category and pins are kept, and no denominator removal is claimed.

- **`dashboard.widget_added`.**
  - UCC-202: "No event named dashboard.widget_added is emitted." (`Plans/UI_Command_Catalog.md:16977`).
  - UCC's own DL-180 amendment (`:8589`), which amends the stale table cell at `:8586` on the next line.
  - `Plans/Wiring_Matrix.md:7286`.
- **`coordination.debug_mirror_exported`.**
  - SP-339 and DL-270 card 5: "the live mirror files it described are retired, so no new mirror export attempt is recorded" (`Plans/storage-plan.md:553`), and the event "end[s] with them" (`:570`).
  - An on-request `pm export` failure is reported in its result (`:572`).

**Checks.** The seal check's census counts, partition and exclusion revalidation still pass; `evidence_shape_ok` is true.

### 8. Seal check and the shared Browser suite

**Seal check.** See the Result table. Receipts:
- `drafts/DS/seal-main-be4766513f-receipt.json`
- `drafts/DS/seal-branch-head-43d1ab5555-receipt.json`

**Shared Browser suite.** `tests/test_pm_browser_event_admission.py` is editable (`.gitignore:70`, `!/tests/test_pm_browser_event_admission.py`).
- **Cause.** It failed 30 of 38 in `setUp` on a fingerprint of the 40 pre-Browser registry rows. That fingerprint was last true at `d86090abd9`. It was moved by DL-188's layout 2.0.0 row (`c0d688db9f`, `634412b3ac`) and DL-300's eleven Goal editions (`102a7e99e8`, `5375bfd2a7`).
- **Fix.** I re-froze only the pin to `2fe49c02…` and wrote the reason beside it.
- **Still guarded.** The following check is unchanged. On today's rows, `preexisting_preservation` reports no failures and `current_preexisting_rows_match_reviewed_successors` is true.
- **Result.** 38 OK.

## Deviations from the lane, with reasons

1. **The suite re-freeze (step 8) was committed before step 3.** SP-262, CV-332 and SMPFS-166 name that suite for both Browser families. Grading their oracle cells PASS while it failed 30 of 38 would have rested on D1b's reading that the family-specific units do not name it. Committing the re-freeze first means the assessment is graded on a head where every suite any owner unit names passes.
2. **Step 5 regrades three ledger cells instead of keeping them PASS.**
   - **What the lane asked.** Cite the consumers, refresh layout's citations to 2.0.0, and lift provisional. Counterfactual D shows the seal prerequisites met if the other eleven cells stay PASS.
   - **What today's text says.** Re-reading each cell, three PASS cells written against 1.0.0/1.1.0-era text are false today:
     - **layout `producer` → FAIL.** SP-330: "The successor slot and receipt schema for v2 writes is not written in this addendum … until it exists no native v2 writer is admitted through those families" (`Plans/storage-plan.md:27503`), and SP-273 calls it "an open item of SP-330" (`:21825`).
     - **layout `positive_negative_oracles` → UNKNOWN.** The external suite SP-273 pins (`Plans/home_layout_event_contract_fixtures.json:6`) was found on 2026-09-24 to store `redb_snapshot_id`, contradicting DL-076. It is not reachable from Nas1.
     - **terminal `positive_negative_oracles` → FAIL.** SP-319: "Paired static oracles and closed original/read-result companions remain required" (`:27081`); no fixture, checker or test exists.
   - **Why.** Keeping them PASS would have made the seal check read complete depth that canon does not support.
   - **Agreement.** The 2026-09-24 Step 8 assessment and D1b grade the same cells PARTIAL.
   - **If the lead prefers otherwise.** The alternative is to leave both rows untouched until the three cells are authored.

## Premise checks

| Answer | Today's text | Result |
|---|---|---|
| DL-039 AUG-CP-WLC-001: unknowns "until cited from the Plans" (`Decision_Log.md:413`) | Family now at 2.0.0 (DL-188); SP-273's reader and checkpoint carried to v2 writes by its amendment (`storage-plan.md:21825`) | **Holds** for lifting provisional. **Fails** for the lane's implicit premise that the other eleven cells stay PASS: producer and oracles are not PASS at 2.0.0. |
| DL-039 AUG-CP-TWM-001: "on the same terms" (`:414`) | Feature retired and family withdrawn by DL-181; historical-only | **Holds in its operative terms**: still registered, and consumer, projector and checkpoint now cited. **Premise shifted** from a live family to a withdrawn one; reported to the lead. The oracles cell is not PASS. |
| DL-039 COMPACT-001: wiring repair (`:410`) | Repaired (`Wiring_Matrix.production.json:18191`) | Holds; used in the step-6 note. |
| DL-300 as "the one Event Authority grant" (`:21055`) | Registry 2026-11-04.1; compaction row has no `payload_versions` | Holds; basis of step 1. |
| DL-180, the widget event withdrawn (UCC `:8589`) | UCC-202 current (`:16977`) | Holds; basis of the step-7 exclusion. |
| DL-270 card 5 / SP-339, mirror retired | `storage-plan.md:553`, `:570`, `:28363` current | Holds; basis of the step-7 exclusion. |
| DL-077, a recorded post-August admission supersedes the old row (`INDIVIDUAL_DISPOSITION_SCHEMA.md:44`) | Validator `V:1425-1428` unchanged | Holds; basis of steps 4 and 6. |
| DL-040, compaction bindings and retention (`:429-435`) | ACD-461, SP-259 and SIR-038 unchanged in those parts | Holds. |

## Newly authored bindings

**Second pass:** SP-400, the Home4 v2 slot and receipt contract, newly authored under DL-045 after the search in `ds-p2-home4-binding-search.txt`. Its new names are listed under "Cell 1" above. No consumer, projector, checkpoint, identity recipe or replay mechanic was authored; SP-273's are reused.

**First pass:** none. Step 1 restates the admission state that the registry, SP-259, DL-300 and CV-366 already give. Step 2 states, from existing text, that no consumer operates. No consumer, projector, checkpoint, identity recipe or replay mechanic was authored.

## Ids used

**SP-400** (second pass). It was checked against `Plans/storage-plan.md` on all 505 `origin` branches: SP-400–409 appear nowhere else. The first pass minted none. Unused: SP-401–409, ACD-600–609, SMPFS-300–309, CV-400–409, ATS-200–204.

## Checks run (exit codes)

| Check | Result |
|---|---|
| `pm-shard-plans.py --generate` / `--check` (after steps 1 and 2) | pass / pass |
| `pm-plan-index.py generate` | rc 0 (rc 1 on the first step-2 draft: YAML parse error, fixed before commit) |
| `pm-plan-index.py validate` (after steps 1 and 2) | rc 0, `status: pass` |
| `pm-projects-refresh-contracts.py` | rc 0 on `main` and on the branch |
| `pm-validate-pm7-gui-fixtures.py validate` | rc 0, pass |
| `pm-shared-runtime-command-contracts.py validate` | rc 0 |
| `pm-plans-verify.py validate-pm7-gui-fixtures` | rc 0, pass |
| JSON syntax, `Plans/**/*.json` | pass |
| `pm_browser_workspace_created.py`, `pm_browser_workspace_created_v2.py`, `pm_browser_workspace_reset.py`, `pm-browser-event-admission.py` | rc 0 each |
| `tests/test_pm_validate_pm7_gui_fixtures.py` | 13 OK |
| `tests/test_pm_browser_workspace_created.py` | 65 OK |
| `tests/test_pm_browser_workspace_reset.py` | 53 OK |
| `tests/test_pm_browser_event_admission.py` | 38 OK after re-freeze (30 of 38 failed before it) |
| `tests/test_pm_coordination_events.py` | 14 failures, same set as `main` |
| `tests/test_event_authority_holding_bucket.py` (after steps 2, 5 and 7) | 2 failures, same set as `main` |
| Frozen seal check, scratch copy, validator SHA-256 `190a86f2…` unchanged | rc 1 on both: 6 failures on `main`, 4 on the branch |

`pytest` is not installed on Nas1, so the suites ran under `unittest`.

**Not run:**
- `pm-landing-check.py`, `run-gates` and `audit-governance` are the lead's landing step.
- **Expected governance staleness for the reseal request:** Spec Lock hashes for `Plans/assistant-chat-design.md` and `Plans/storage-plan.md`. The touched audit ledgers carry no Spec Lock or `.evidence` pin.

## Open items

1. **The DL-300 three.** No admission record; they wait on CC-D1b-1 (before-state form) and CC-D1b-2 (DL-045 scope). Untouched here.
2. **Layout producer:** done in the second pass (SP-400, `2e5801d7df`). Native installation of the 4.0.0 edges is NOT_RUN.
3. **Layout oracles:** done in the second pass. The workspace suite was re-frozen as v5 and repinned (`bef4342ecc`). The full-value suite (`7ab4fb00…`) is **not** re-frozen; SP-273 records its stored-token copies as superseded. Re-freeze it if a reviewer prefers that to the note.
4. **Terminal oracles:** **stopped on the owner question** under "Cell 3" above. Nothing was written.
5. **Lead decisions.**
   - Whether to accept step 5's regrade, or revert to untouched rows until items 2–4 land.
   - How to treat the terminal premise shift (a withdrawn family's provisional state ended under DL-039).
6. **Two unrefreshed records.**
   - `individual-disposition/COVERAGE.json` (generated 2026-09-11) still says `provisional_count` 2. The Step 9 batch 1 precedent did not regenerate it either.
   - The validator's `fresh_census_denominator_not_closed.blocked_by` strings are fixed text and still name the cleared items.
7. **Two cleanups not done.** Rewording UCC's stale `:8586` effect cell, and sweeping the residual debug-mirror text in CV-310 and the coordination fixtures. Owner text already overrides both.
8. **Missing memory notes.** `pm-plan-id-allocation.md` and `pm-index-needs-currentness-edition.md` (named in the brief) do not exist on Nas1. The currentness edition was copied and hash-matched as the brief says.

## Files

- `reports/event-authority-20261104/DS.md`: this report.
- `reports/event-authority-20261104/DS.selfgrade.json`: self-grade of the five touched families, re-graded in review round 1 at `2b671a1605`: compaction, created and reset 12/12, layout 10/12, terminal 10/12 (56 PASS, 4 PARTIAL). At `af9bff39ae` it said layout 12/12 and terminal 11/12; the review rejected both.
- `reports/event-authority-20261104/ds-fix1-home4-value-reference-search.txt`, `ds-fix1-application-time-correction.{md,json}`, `ds-fix1-terminal-consumer-regrade.{md,json}`, `ds-fix1-layout-regrade.{md,json}` (review round 1)
- `reports/event-authority-20261104/ds-p2-home4-binding-search.txt`, `ds-p2-layout-suite-refreeze.{md,json}`, `ds-p2-august-regrade-application.{md,json}` (second pass)
- `reports/event-authority-20261104/depth-b1-seal-families.{json,md}`
- `reports/event-authority-20261104/ds-step{5,6,7}-*.{json,md}`
- **Evidence copy:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS/`: this report, the self-grade, the seal-check receipts and the check outputs.
