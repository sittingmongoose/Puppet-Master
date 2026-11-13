# W3B — Source Control, phase 1 (2026-11-05)

Branch: `plans/ea-w3-source-control-20261105`. Base: `f9c5de6561dff0a53a48e530f2a5c6804a7e941d` (current origin/main fetched before branching). Final head is in the handoff; the self-grade pins the exact owner content by SHA-256 to avoid a self-referential commit hash.

**Wave 3 phase 2 (2026-11-13):** executable synthetic oracles, guard tables on the gated tool, shared numbers and date-time, SP-1101 retained reads and event-history retention bound to DL-453/DL-454/DL-455; see "Wave 3 phase 2: findings and responses" at the end. Phase-1 text below is kept as reviewed.

**Outcome:** 19 prepared, 0 merged, 0 excluded, 0 stopped for a non-retention product/owner conflict. All 19 prepared rows have `PENDING_RETENTION_DECISION` for event/source-fact retention. They are **not ready for admission**. Each self-grade is 9 PASS / 2 PARTIAL / 1 ABSENT: criterion 1 membership ABSENT, criterion 7 retention PARTIAL, criterion 12 oracles PARTIAL. Native execution NOT_RUN. No review round has run; phase 2 comes first.

## Per-row outcome and bindings

| Exact family | Outcome | Owner / payload / Storage | Oracle-plan unit | Retention |
|---|---|---|---|---|
| `source_control.backend.detected` | prepared | SCS-1250 / CV-1250 / SP-1250 | ATS-1210 | PENDING_RETENTION_DECISION |
| `source_control.backend.selected` | prepared | SCS-1251 / CV-1251 / SP-1251 | ATS-1210 | PENDING_RETENTION_DECISION |
| `source_control.checkpoint.created` | prepared | SCS-1252 / CV-1252 / SP-1252 | ATS-1211 | PENDING_RETENTION_DECISION |
| `source_control.checkpoint.restored` | prepared | SCS-1253 / CV-1253 / SP-1253 | ATS-1211 | PENDING_RETENTION_DECISION |
| `source_control.remote.fetch_completed` | prepared | SCS-1254 / CV-1254 / SP-1254 | ATS-1212 | PENDING_RETENTION_DECISION |
| `source_control.remote.fetch_started` | prepared | SCS-1255 / CV-1255 / SP-1255 | ATS-1212 | PENDING_RETENTION_DECISION |
| `source_control.remote.publish_completed` | prepared | SCS-1256 / CV-1256 / SP-1256 | ATS-1213 | PENDING_RETENTION_DECISION |
| `source_control.remote.publish_started` | prepared | SCS-1257 / CV-1257 / SP-1257 | ATS-1213 | PENDING_RETENTION_DECISION |
| `source_control.remote.sync_completed` | prepared | SCS-1258 / CV-1258 / SP-1258 | ATS-1214 | PENDING_RETENTION_DECISION |
| `source_control.remote.sync_started` | prepared | SCS-1259 / CV-1259 / SP-1259 | ATS-1214 | PENDING_RETENTION_DECISION |
| `source_control.repository.bound` | prepared | SCS-1260 / CV-1260 / SP-1260 | ATS-1215 | PENDING_RETENTION_DECISION |
| `source_control.repository.unbound` | prepared | SCS-1261 / CV-1261 / SP-1261 | ATS-1215 | PENDING_RETENTION_DECISION |
| `source_control.status.refreshed` | prepared | SCS-1262 / CV-1262 / SP-1262 | ATS-1216 | PENDING_RETENTION_DECISION |
| `source_control.workspace.created` | prepared | SCS-1263 / CV-1263 / SP-1263 | ATS-1216 | PENDING_RETENTION_DECISION |
| `source_control.workspace.opened` | prepared | SCS-1264 / CV-1264 / SP-1264 | ATS-1217 | PENDING_RETENTION_DECISION |
| `source_control.workspace.removed` | prepared | SCS-1265 / CV-1265 / SP-1265 | ATS-1217 | PENDING_RETENTION_DECISION |
| `source_control.workspace.switched` | prepared | SCS-1266 / CV-1266 / SP-1266 | ATS-1218 | PENDING_RETENTION_DECISION |
| `source_control.writer_lease.granted` | prepared | SCS-1267 / CV-1267 / SP-1267 | ATS-1218 | PENDING_RETENTION_DECISION |
| `source_control.writer_lease.lost` | prepared | SCS-1268 / CV-1268 / SP-1268 | ATS-1219 | PENDING_RETENTION_DECISION |

## Search evidence and reuse

The per-family pre-edit search is `W3B-search.json`: live Plans prose, schemas, registries and fixtures, excluding generated shards/index, audit/evidence/migration trees and source-only ledgers. At the base each exact name occurs only once, in Source_Control_System §3.2 (lines 395–413). No exact closed event payload, original-event source/custody, event identity recipe, filtered consumer/checkpoint, replay or withdrawal definition existed for any row. The frozen recount was used as a lead; its old line references were rechecked against this base. No alias, retirement or merge proof exists for these nineteen. All new bindings are explicitly labelled **newly authored owner contracts**.

Reused: SCS-002 repository/native revisions; SCS-003 current writer/credential leases and command result/receipt semantics; SCS-004 exact-environment detection/selection; SCS-008 checkpoint/workspace semantics; SCS-009/010 exact future handler routes; SCS-014 Backup closure; SCS-015/016 captured remote targets, independent capability and reconciliation; SCS-025 v2 local-only sync. Commands retain their existing DRY schemas, unknown-effect refusals and exact return context. Git and JJ stay independent native tagged revisions, separate from forge identity.

New per family: one closed payload definition; one original source-body/fact value; one exact event-ID and scoped-key recipe; one append adapter; one passive history projector and operating reader; one filtered checkpoint; its explicit withdrawal/cutoff and successor rebuild contract. Names and exact routes are in `Plans/source_control_event_preparation.json`. The shared prerequisite is adopted **by name for every family**, not by analogy from a sibling.

## Current premises checked

- **Deck 2 item 9.a A / DL-450:** answer record says “i approve all of it”; the unchanged deck includes exactly these 19 Source Control names. This authorizes definitions for already specified behavior only. No admission, live writer or feature/retention choice is inferred. The DL entry is applied by its designated answer lane, not here.
- **Card 1 G01/G26 and DL-401:** G01 is twelve file-tree action names; G26 is formatter/LSP/model-list names. Neither names these Source Control families or proves their classification. Closest-group fields in the recount remain analogies, not assignments. No policy is imported from them.
- **Storage Case L-3:** audit/source-lineage, operational/recovery and ordinary telemetry are possible classes, but today's Source Control text does not unambiguously classify these event histories and their newly specified original source facts. Exact per-row questions below retain the uncertainty. Unknown defaults do not count as approved retention.
- **Application scope:** SCS-025's null-Project read-only repository.inspect is separate and explicitly receipt-only. Existing nineteen-ID command lineage stays Project-bound, including exact-environment/pre-repository branches that do not fabricate repo/workspace/writer fields. The new families are project_only; no application event edition is invented.
- **Sync and remote effects:** SCS-025's current v2 local_reconcile_only branch is adopted with both repositories/revisions, strategy/fetch receipt, `push_targets=[]` and `publish_performed=false`. It is not forced into transport-only legacy scope. Remote start and verified successful completion are separate facts. Unknown/failed/cancelled outcomes keep the existing typed receipts and never claim successful completion. No new failure event is added.
- **Lease authority:** SCS-003/native writer_lease schema records exact repository/workspace/backend/holder/generation/epoch; expiry/revocation does not prove cleanup. Historical grant/loss replay cannot restore current mutation authority.
- **Envelope/receipt/physical owners:** CV-317 owns producer semantics, Storage metadata exclusion and normal append refusal of projector_replay_only. SP-278/DL-076 owns global current coverage and nine stored read-token fields. SP-286/CV-339 strict stored v2 uses the actual `storage.first_append_receipt.resolve_full_value.v1` interface. SP-236 and SP-336/347 retain physical encoding/issuance; no number/timestamp code was written.
- **SP-337 integration detail:** current EventRecord schema still spells payload_ref as a nullable string, while CV-317/SP-337 prose requires a pack reference holding BLAKE3/size/media type. The local original-source-body pointer materializes those existing three owner fields as a closed object; it does not amend EventRecord. Phase 2 must reconcile/use the reviewed foundation's envelope route and prove both wrapper and decoded-body boundaries before admission. This is a technical shared-owner/schema gap, not a lifetime choice.

No August/September answer was extended to these newly authorized names. No failing old premise was silently applied.

## Oracle plan and standing checks

`W3B-oracle-plan.json` contains 19 separate inventories with 2629 explicitly enumerated local guard constructions: positive control, one negative defect, and non-target repair rule. It is a plan, not fixture code or a proof. It covers each local required field/type/const/enum/bound, native-source joins, transitions, original acceptance and receipt, idempotency, current/historical replay, passive effects, custody/Backup/deletion, complete global checkpoint coverage/CAS/currentness, withdrawal and pending-retention refusal. Every inherited owner-schema predicate must be expanded by the shared tool before phase-2 coverage closes. No local proof machinery was authored.

The twelve recurring Astra classes plus 10a are **planned, not executed** in this phase:

| Check | Exact planned probe |
|---|---|
| 1 contradictory inputs | Independent original acceptance/source join per payload field; recompute supplied copies/hashes to isolate provenance. |
| 2 Storage metadata | Separate source joins for sequence, observed time and persisted time; producer equality excludes all three. |
| 3 history both directions | Valid retained replay-only/original history after live-state changes; substituted/withdrawn originals refused. |
| 4 inconsistent representations | Exact types and shared owner profiles at each consuming join. |
| 5 unresolved refs | Eager whole-schema startup resolution, including unused branches. |
| 6 stored sizes | Exact 16 KiB event/body/wrapper boundaries and SP-337 bytes/index durability, BLAKE3, size and media-type joins. |
| 7 custody every path | Original source/full-value first receipt before retry, recovered terminal, read or continuation. |
| 8 masked negatives / check 11 | Valid control, one predicate defect, all dependent copies repaired; shared isolation tool in phase 2. |
| 9 grades | Membership ABSENT; retention/oracles PARTIAL; no fixture or guard proof PASS. |
| 10 number forms | Shared rule for raw 1.0/1e0/-0/01 and exact uint64 domains; no local cap/normalization. |
| 11 confused types | Separate null/array/object/string-boolean/string-number negatives at each relevant field. |
| 12 skipped formats | Shared fail-closed actual owner timestamp/URI/UUID profiles and malformed/LF/edge cases. |
| 10a old history | Authenticated original recipe dispatch; old valid values readable; substituted weak-selector provenance refuses. |

Standing checks are likewise planned per family: normal replay-only refusal, exact Storage project~ encoding, SP-337, LF/full-match/length, semantic-only retries, coherent checkpoint Storage identities, independently verified success rather than exit code, eager refs, passive historical reads and one-defect guard isolation. CV-366 application-key spelling is not used because these drafts add no app scope.

## Stopped and pending questions

**Stopped rows:** none for a non-retention product/owner choice. **Pending retention:** each exact question below is unanswered; none is resolved by this report.

- For `source_control.backend.detected` in its existing Project scope, does its saved history use ordinary telemetry versus source-lineage audit? Please choose its exact retention class and anchor, count limit/scope and overflow/deletion rule, and whether the original source-fact custody shares that rule. G01/G26 are analogies only and do not assign this name.
- For `source_control.backend.selected` in its existing Project scope, does its saved history use configuration/source-lineage audit versus ordinary telemetry? Please choose its exact retention class and anchor, count limit/scope and overflow/deletion rule, and whether the original source-fact custody shares that rule. G01/G26 are analogies only and do not assign this name.
- For `source_control.checkpoint.created` in its existing Project scope, does its saved history use source-lineage audit versus migration/recovery operational history? Please choose its exact retention class and anchor, count limit/scope and overflow/deletion rule, and whether the original source-fact custody shares that rule. G01/G26 are analogies only and do not assign this name.
- For `source_control.checkpoint.restored` in its existing Project scope, does its saved history use source-lineage audit versus migration/recovery operational history? Please choose its exact retention class and anchor, count limit/scope and overflow/deletion rule, and whether the original source-fact custody shares that rule. G01/G26 are analogies only and do not assign this name.
- For `source_control.remote.fetch_completed` in its existing Project scope, does its saved history use source-lineage/receipt audit versus operational remote history? Please choose its exact retention class and anchor, count limit/scope and overflow/deletion rule, and whether the original source-fact custody shares that rule. G01/G26 are analogies only and do not assign this name.
- For `source_control.remote.fetch_started` in its existing Project scope, does its saved history use source-lineage/receipt audit versus operational remote history? Please choose its exact retention class and anchor, count limit/scope and overflow/deletion rule, and whether the original source-fact custody shares that rule. G01/G26 are analogies only and do not assign this name.
- For `source_control.remote.publish_completed` in its existing Project scope, does its saved history use source-lineage/receipt audit versus operational remote history? Please choose its exact retention class and anchor, count limit/scope and overflow/deletion rule, and whether the original source-fact custody shares that rule. G01/G26 are analogies only and do not assign this name.
- For `source_control.remote.publish_started` in its existing Project scope, does its saved history use source-lineage/receipt audit versus operational remote history? Please choose its exact retention class and anchor, count limit/scope and overflow/deletion rule, and whether the original source-fact custody shares that rule. G01/G26 are analogies only and do not assign this name.
- For `source_control.remote.sync_completed` in its existing Project scope, does its saved history use source-lineage/receipt audit versus operational remote history? Please choose its exact retention class and anchor, count limit/scope and overflow/deletion rule, and whether the original source-fact custody shares that rule. G01/G26 are analogies only and do not assign this name.
- For `source_control.remote.sync_started` in its existing Project scope, does its saved history use source-lineage/receipt audit versus operational remote history? Please choose its exact retention class and anchor, count limit/scope and overflow/deletion rule, and whether the original source-fact custody shares that rule. G01/G26 are analogies only and do not assign this name.
- For `source_control.repository.bound` in its existing Project scope, does its saved history use source-lineage audit versus operational binding history? Please choose its exact retention class and anchor, count limit/scope and overflow/deletion rule, and whether the original source-fact custody shares that rule. G01/G26 are analogies only and do not assign this name.
- For `source_control.repository.unbound` in its existing Project scope, does its saved history use source-lineage audit versus operational binding history? Please choose its exact retention class and anchor, count limit/scope and overflow/deletion rule, and whether the original source-fact custody shares that rule. G01/G26 are analogies only and do not assign this name.
- For `source_control.status.refreshed` in its existing Project scope, does its saved history use ordinary telemetry versus source-lineage audit? Please choose its exact retention class and anchor, count limit/scope and overflow/deletion rule, and whether the original source-fact custody shares that rule. G01/G26 are analogies only and do not assign this name.
- For `source_control.workspace.created` in its existing Project scope, does its saved history use source-lineage audit versus the separately approved Git-worktree release-anchored class? Please choose its exact retention class and anchor, count limit/scope and overflow/deletion rule, and whether the original source-fact custody shares that rule. G01/G26 are analogies only and do not assign this name.
- For `source_control.workspace.opened` in its existing Project scope, does its saved history use ordinary telemetry versus source-lineage audit? Please choose its exact retention class and anchor, count limit/scope and overflow/deletion rule, and whether the original source-fact custody shares that rule. G01/G26 are analogies only and do not assign this name.
- For `source_control.workspace.removed` in its existing Project scope, does its saved history use source-lineage audit versus the separately approved Git-worktree release-anchored class? Please choose its exact retention class and anchor, count limit/scope and overflow/deletion rule, and whether the original source-fact custody shares that rule. G01/G26 are analogies only and do not assign this name.
- For `source_control.workspace.switched` in its existing Project scope, does its saved history use source-lineage audit versus ordinary selection telemetry? Please choose its exact retention class and anchor, count limit/scope and overflow/deletion rule, and whether the original source-fact custody shares that rule. G01/G26 are analogies only and do not assign this name.
- For `source_control.writer_lease.granted` in its existing Project scope, does its saved history use write-authorization audit versus operational lease history? Please choose its exact retention class and anchor, count limit/scope and overflow/deletion rule, and whether the original source-fact custody shares that rule. G01/G26 are analogies only and do not assign this name.
- For `source_control.writer_lease.lost` in its existing Project scope, does its saved history use write-authorization audit versus operational lease history? Please choose its exact retention class and anchor, count limit/scope and overflow/deletion rule, and whether the original source-fact custody shares that rule. G01/G26 are analogies only and do not assign this name.

## Owner investigations

No outside-name investigation is assigned to W3B. Current native-owner evidence was also checked: WorktreeGitImprovement W-071 (lines 4978 onward at the base) retains worktree/owner-lane/lease or blocker evidence and blocks overlapping writes; Jujutsu_Integration consumes the same source-control writer lease (including its current JJI-005/SCS-018 recovery fence). Neither supplies another saved-event name or a competing lease event owner. The current-text checks above settle only the technical source/command/lease/scope distinctions for these nineteen names. No new-history or competing-owner product choice was discovered; shared SP-337 envelope schema integration remains an explicit phase-2 technical item.

## Shared-file hunks and IDs

| File | Append-only range | Purpose |
|---|---|---|
| Plans/Contracts_V0.md | CV-1250..CV-1268, end of document | One payload/joins unit per exact family. |
| Plans/storage-plan.md | SP-1250..SP-1268, end of document | One source/custody/checkpoint unit per family. |
| Plans/Automated_Testing_System.md | ATS-1210..ATS-1219, end of document | Per-family oracle-plan references, at most two per unit. |
| Plans/storage_value_registry.json | No hunk | Thirty-eight row proposals staged separately; central registry unchanged. |
| Plans/Source_Control_System.md | SCS-1250..SCS-1268, end of document | Nineteen independent semantic owner contracts. |

Exact appended line ranges in this branch: Source_Control_System.md 2139–4876; Contracts_V0.md 24469–25777; storage-plan.md 29477–31649; Automated_Testing_System.md 7237–7737. All four preserve the complete prior body and append only. The current sharding configuration covers the latter three; Source Control units are present in the regenerated PlanUnit index. No unrelated shard source changed.

The assigned blocks were checked before minting against main and all **528 origin refs**, covering **183 unique owner blobs**; no collision. Raw evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3B/id-allocation-check.json`, SHA-256 `89259c105ab22e6cf34272b679065b7f7daa951e209f496d4672815a558b0aa7`. The main branch name also resolves to an older local snapshot in the clone, but current origin/main was the base and all remotes were checked. IDs used: SCS/CV/SP-1250..1268 and ATS-1210..1219. No DL or other prefix minted.

## Verification

| Check | Exit | Evidence SHA-256 |
|---|---:|---|
| shard-generate | 0 | `4580172d0223709a6fb4d9b19629202b9fa567c072acac77a03bdc874e57c543` |
| index-generate | 0 | `9e0e2127dd51dfa5a315ac6a8719af3567fb148c7faee2b48b2cfd1f2a03727f` |
| structure | 0 | `6d7abdc0da6f629d807ee4566c0c3d8998870e8ddda0079a104d4ee584df1627` |
| shard-check | 0 | `fba1c36054a83d9c3416be7e4daee87e6c4b513f0a6d9855ec799ece79702957` |
| index-validate | 0 | `86bedcccf2c837379a22b0891bbba631ab38aac47b74730313d680f075a6aaa4` |
| source-control-effects | 0 | `c4021716d69660f21368c665e60b69fe1d8adbc20be10e01f3e3c16252719068` |
| source-control-response | 0 | `38eb6e4abb44ee18acb61b4dfa679e32434f79cf2de962c37e12b1ebb93fe27b` |
| new-contracts | 0 | `9e315376e2c190e8c42440c89cb858fb30f5a64a4edabaf8f97ecad378404c11` |

All log paths are pinned in `W3B-checks.json` under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3B/`. Plan-index validation was parsed at the top level: `status=pass`, `failures=[]`. Structure check: 19 families, 83 definitions, 70 eager-resolved refs, 38 staged rows, 2,629 local guard plans; no failures. Existing Source Control suites: 13 effects + 12 response tests passed. These do not execute the new event-family oracles. `git diff --check` passed. Checks were serialized; the broad verifier paused below 6 GB available and resumed above 7 GB after two-minute memory rechecks. Currentness copy: all 15 files matched by `sha256sum`. No mutation/guard-isolation/native execution is claimed in phase 1.

No standard governance seal, lock refresh, admission record, Decision Log edit, registry family append, pm-mail, subagent or main push. Phase 2 and later integration own their separate reviews/admission. The committed files are planning contracts and oracle plans only.

## Evidence pins

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/WAVE3.md` — SHA-256 `2c9be0f498dbb67a424997998507111e0c88576c6403ffe8310e14aaba742083`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/BRIEF-DRAFT.md` — SHA-256 `41864b36b0ec066dd89e05ce02241cd87dbdcfcedcd3cc6bfaad43830e322191`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/WAVE2.md` — SHA-256 `52c955b4472cc972c5993cac43e6c1a087877e308bacfeb604b5c37add6fa9b9`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3B-rows.jsonl` — SHA-256 `54914a23c1f492c02fc6e9ae4adb6ecd472d4ebfe4e3b5161f67ecfb399249e7`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md` — SHA-256 `e7e8d3f3a2f23737b201becddd94ff0c707815520a366ab32758088c720927fd`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md` — SHA-256 `6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3B/search-before.json` — SHA-256 `b070f3a365a690a425e239a1862bcd72481f36ebb1fa9da0ecddf6880274a4af`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3B/currentness-copy-sha256.json` — SHA-256 `02965ee7f1a51989ceae85dc1cf0cd50090226564a9972b044679fb589b43419`.

## Phase-1 review round 1: findings and responses

- **F1 (blocking), impossible planned negative for `backend_detected` cardinality** (`reviews/W3B-sol/REVIEW-phase1.md`): fixed in `reports/event-authority-20261105/W3B-oracle-plan.json`, guard `backend_detected/schema/16`. The planned "violate only maxItems=2" negative is replaced by the classification `implied_unreachable_alone` with the finite-set evidence (uniqueItems plus a two-value item enum make any third item fail another predicate). `maxItems` stays in the schema; no owner text, schema or other row changed. Verify: the entry's `classification_evidence`, and the reviewer's 3,906-array probe.
- **Retention:** all 19 cells stay pending with their questions; the wave-3 retention pass (`surveys/W3RT/`) maps them before any question reaches Jared.

## Wave 3 phase 2: findings and responses

Task: `lanes/W3-P2.md` (stream E, 2026-11-13), worker for lane W3B. Start: `origin/plans/ea-w3-source-control-20261105` at `11ba6d0dd4` (fetched first; local clone `/home/sittingmongoose/src/PuppetMaster`), sparse local worktree `/home/sittingmongoose/pm-worktrees/w3b-p2` (`Plans scripts reports tests`). No rebase. Heavy commands ran under `systemd-run --user --scope -p MemoryMax=2G -p MemorySwapMax=0`, each started only at 12 GiB or more available. No pm-mail, subagents or browsers; `main` was not pushed. Structure follows W3F phase 2 (`dafe3513e1`); the content is W3B's own. Membership stays ABSENT and native execution NOT_RUN: everything below is synthetic oracle evidence.

### Gated foundations

| Merge | Commit | Parents | Result |
|---|---|---|---|
| Guard tool `004bdedd632d9463f3535190a6ed5772338cdce1` (`--no-ff`) | `c5fd1a5d30` | `11ba6d0dd4`, `004bdedd63` | 11 files, no conflict, none edited. |
| NUMRULE head `58c2816ff33365384d4039553f5efdb5370930e6` (`--no-ff`) | `f4c9d5003e` | `c5fd1a5d30`, `58c2816ff3` | 163 conflicts, all in `Plans/_shards/**` and `Plans/.plan_index/**`; resolved by `pm-shard-plans --generate` and `pm-plan-index generate` (the 15-file currentness edition copied in first, SHA-256 identical to the shared checkout's), then `pm-shard-plans --check` pass. `Contracts_V0.md` and `storage-plan.md` auto-merged; no other path conflicted. No NUMRULE file edited. |

Verify: `git diff --stat c5fd1a5d30^1 c5fd1a5d30` (11 files); `git diff 004bdedd63 HEAD -- scripts/pm_guard_isolation.py scripts/pm_guard_isolation_traps.py Plans/guard_isolation_traps.json scripts/guard-isolation/README.md` and `git diff 58c2816ff3 HEAD -- scripts/pm_event_numbers.py scripts/pm_event_numbers_corpus.py scripts/pm_event_datetime.py scripts/pm_event_datetime_inventory.py scripts/pm_event_datetime_exclusions.json Plans/event_number_recipe_corpus.json Plans/event_datetime_inventory.json` are both empty.

### What phase 2 built

| Part | Path | What it is |
|---|---|---|
| Complete checker | `scripts/pm_w3b_event_oracles.py` | One scenario model for all nineteen families over seven paths: `append` (current writer, SP-286/CV-339 first-receipt custody, source-fact phase CAS, publication order), `retry` (CV-317 producer-digest dedupe, original receipt), `history` (SP-1101 retained read and passive reader), `recovery` (a `source_committed` fact: CAS to the resolved original or fence), `backup` (SCS-014/SP-286 closure), `checkpoint` (SP-278/DL-076 filtered checkpoint) and `install` (eager resource admission). `derive` computes the values rows compare: owner-held values, recipes recomputed from their inputs, and the outcomes of the shared helpers (owner-schema verdicts, `current_integer`, `storage_uint64`, `date_time`, `producer_semantic_bytes`, the `RetainedDispatcher`). It decides nothing. `evaluate` refuses only through the generated predicates in table order; `judge` requires a positive to refuse nowhere and a negative to refuse first at exactly its row, every other refusing row being an entailed row whose proof names that first row. A checker exception is a finding, never a refusal. |
| Guard tables | `scripts/pm_w3b_table_*.py` (76 modules), generator `scripts/pm-w3b-table-generate.py` | 449 rows, at most eight per table. **Each predicate is the row's refusal test itself**, written into the table module (for example `event_identity`: `v['ev'].get('event_id') != v['x_event_id']`; `t_detect_set`: `set(v['native'].get('detected_backends', [])) != set(v['wf'].get('setup_state.observed_backends', []))`), so the gated tool analyses the predicate code the checker runs. 399 rows are comparisons over owner and candidate values; 50 rows test the outcome of a shared helper or owner-schema verdict (schema, full-match, integer-slot, uint64, Storage UTC, producer route, dispatcher refusals), because the tool certifies only pure builtin operations inside a predicate. No row looks up a verdict the checker computed by itself. |
| Fixtures | `Plans/w3b_event_fixtures.json`, builder `scripts/pm-w3b-cases.py` (`--check`), libraries `scripts/pm_w3b_cases_lib.py` and `scripts/pm_w3b_negatives.py` | 492 complete positives and 18,251 one-defect negatives, each stored as its base plus the exact changes. Every scenario is built from owner-held authority (`owner.native`, `owner.world`, `owner.operation`, `owner.authority`); identities come from the lane library's own implementation of the SCS templates in `Plans/source_control_event_preparation.json`, not from the checker. A negative is a rebuild with one knob changed (all dependent copies, keys, digests and post-states recomputed; owner authority untouched) or one post-build change to a value nothing else is derived from. |
| Sealed custody | `Plans/w3b_original_custody.json` | Storage's sealed write custody stand-in for SP-1101: the `w3b@1` recipe (resource manifest over the six schema resources and the CV-1101 field profiles), the recorded but uninstalled `w3b@0`, and 272 sealed receipts. |
| Plan coverage | `reports/event-authority-20261105/W3B-phase2-plan-coverage.json` (`pm-w3b-cases.py --coverage`) | Every phase-1 plan entry with its witnesses and their rows. |
| Tool runner | `scripts/pm-w3b-guard-tables.py` with adapter `scripts/pm_w3b_guard_suites.py` | One gated-tool run per table that has a negative. |
| Mutation proof | `scripts/pm-w3b-mutation-proof.py` | Deletes or weakens one guard per mutant in a scratch copy and runs the complete checker. |
| Number corpus | `scripts/pm-w3b-number-corpus.py` | The shared NUMRULE corpus and the 4,400-digit routes through the complete checker. |
| Timestamp list | `scripts/pm-w3b-timestamp-fields.py` | Derives every timestamp field from the schemas the checker installs. |

**Complete checker: `python3 scripts/pm_w3b_event_oracles.py` exit 0, `"status": "pass"`: 18,945 cases (492 positives, 18,453 negatives, of which 202 are in-memory 2^64 / 10^4399 cases), 0 judged errors, 447 reachable rows each refused first by at least one witness, 2 entailed rows; 1,317 retained reads, sealed store unchanged by every one.**

**Plan coverage: 2,628 of 2,629 phase-1 plan entries witnessed; the remaining one is `backend_detected/schema/16` (`maxItems=2`), kept as the reviewed `implied_unreachable_alone` classification (phase-1 review F1).**

**Owner-schema expansion:** beyond the plan's local sites, the builder walks every assertion the valid base instance reaches (W3B definitions plus every inherited Source Control, EventRecord, CV-339 and SP-278 assertion, through `$ref`, `allOf`, the selected `oneOf`/`anyOf` branch and the selected `if`/`then`/`else` branch) and stores one negative per site and instance occurrence (type, const, enum, pattern, minLength, maxLength, minimum, maximum, format, uniqueItems, minItems, maxItems, required member, closed object), plus a trailing-LF negative at every pattern-bearing string. Every site produced a refused negative; none had to be classified implied. Negatives by first row: `fact_schema` 5,305 (the fact with its embedded source body, payload copy and original request), `envelope_schema` 2,204, `ck_schema` 2,109, `payload_schema` 1,608, `receipt_schema` 912, `fact_fullmatch` 621, `ck_fullmatch` 266, `payload_fullmatch` 241.

### Guard-table result (gated tool `004bdedd63`, credited exactly as reported)

Final run at `8797b403c2` (the table modules, checker and fixtures are byte-identical at the final head; tool SHA-256 `e8038992eabbe067c8bcba8d48824b97fbb6b5b7e69cbfe28a669f939a96c0b8`, byte-identical to `004bdedd63`). The run was split into three table groups run in parallel, each its own process and memory scope (`--table ...`); each collection replays every stored W3B case once through the complete checker: **18,743 cases** (492 positives accepted, 18,251 negatives refused), **0 judged errors, 0 collection findings**. For each table a case none of whose rows refuses contributes the table's value (exactly the derived keys its predicates read) as a control, and the table holding a case's first refusal contributes its value as a negative of that row; the runner picks up to four controls (most readiness gates open, one per path first, then the smallest) and the two smallest negatives per row. The tool then ran once per table that has a negative: **74 runs, all `PASS`; 447 of 447 provable rows proved**; each cut swapped one row to always-pass, ran every control and negative, compared the guard-call trace with the uncut baseline and ran a fresh restoration. **0 unrelated changes, 0 masked negatives, 0 lane-matrix problems.** The two entailed tables have no negative by construction, so the tool does not run them; they stay unproved, each alone in its own table, with the proofs below. Wall time about 99 minutes (groups 3,612 s, 5,934 s and 4,474 s, serial within a group; the slowest table, `transition_remote_sync_completed_2`, took 2,350 s), MemoryGate 1,500 MiB RSS inside a 2 GiB no-swap scope. Command: `python3 scripts/pm-w3b-guard-tables.py --out <dir> --table ...`; the per-table reports and the three `summary.json` files are in the evidence folder.

| Table group | Tables (run / PASS) | Rows | Proved | Entailed | Tool negatives / controls | Evaluations | Cut: own flips | Cut: stays | Unrelated | Masked | Lane matrix |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| scenario | 1 (1 / 1) | 3 | 3 | 0 | 5 / 4 | 90 | 5 | 10 | 0 | 0 | 0 |
| install | 1 (1 / 1) | 2 | 2 | 0 | 4 / 4 | 56 | 4 | 4 | 0 | 0 | 0 |
| envelope | 1 (1 / 1) | 7 | 7 | 0 | 14 / 4 | 396 | 14 | 84 | 0 | 0 | 0 |
| payload | 2 (2 / 2) | 12 | 12 | 0 | 24 / 8 | 656 | 24 | 136 | 0 | 0 | 0 |
| identity | 1 (1 / 1) | 4 | 4 | 0 | 8 / 4 | 156 | 8 | 24 | 0 | 0 | 0 |
| writer | 1 (1 / 1) | 8 | 8 | 0 | 16 / 4 | 500 | 16 | 112 | 0 | 0 | 0 |
| lineage | 2 (2 / 2) | 13 | 13 | 0 | 26 / 8 | 724 | 26 | 152 | 0 | 0 | 0 |
| fact | 2 (2 / 2) | 16 | 16 | 0 | 32 / 8 | 1,000 | 32 | 224 | 0 | 0 | 0 |
| copies | 1 (1 / 1) | 8 | 8 | 0 | 16 / 4 | 500 | 16 | 112 | 0 | 0 | 0 |
| acceptance | 1 (1 / 1) | 6 | 6 | 0 | 12 / 4 | 304 | 12 | 60 | 0 | 0 | 0 |
| request | 3 (3 / 3) | 19 | 19 | 0 | 38 / 12 | 1,100 | 38 | 236 | 0 | 0 | 0 |
| source_join | 6 (6 / 6) | 42 | 42 | 0 | 70 / 24 | 2,242 | 70 | 478 | 0 | 0 | 0 |
| authority | 2 (2 / 2) | 14 | 14 | 0 | 28 / 8 | 804 | 28 | 172 | 0 | 0 | 0 |
| publication | 2 (2 / 2) | 12 | 12 | 0 | 24 / 8 | 656 | 24 | 136 | 0 | 0 | 0 |
| cas | 1 (1 / 1) | 6 | 6 | 0 | 12 / 4 | 304 | 12 | 60 | 0 | 0 | 0 |
| order | 1 (1 / 1) | 8 | 8 | 0 | 16 / 4 | 500 | 16 | 112 | 0 | 0 | 0 |
| dispatch | 2 (2 / 2) | 10 | 10 | 0 | 20 / 8 | 556 | 20 | 116 | 0 | 0 | 0 |
| frozen | 3 (3 / 3) | 20 | 20 | 0 | 40 / 12 | 1,156 | 40 | 248 | 0 | 0 | 0 |
| entailed | 2 (0 / 0) | 2 | 0 | 2 | 0 / 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| retry | 1 (1 / 1) | 4 | 4 | 0 | 8 / 4 | 156 | 8 | 24 | 0 | 0 | 0 |
| reader | 1 (1 / 1) | 5 | 5 | 0 | 10 / 4 | 224 | 10 | 40 | 0 | 0 | 0 |
| effects | 1 (1 / 1) | 7 | 7 | 0 | 14 / 4 | 396 | 14 | 84 | 0 | 0 | 0 |
| recovery | 2 (2 / 2) | 9 | 9 | 0 | 18 / 8 | 524 | 18 | 112 | 0 | 0 | 0 |
| backup | 1 (1 / 1) | 5 | 5 | 0 | 10 / 4 | 224 | 10 | 40 | 0 | 0 | 0 |
| checkpoint | 1 (1 / 1) | 8 | 8 | 0 | 16 / 4 | 500 | 16 | 112 | 0 | 0 | 0 |
| ck_token | 2 (2 / 2) | 10 | 10 | 0 | 20 / 8 | 556 | 20 | 116 | 0 | 0 | 0 |
| ck_cover | 1 (1 / 1) | 4 | 4 | 0 | 8 / 4 | 156 | 8 | 24 | 0 | 0 | 0 |
| ck_cas | 1 (1 / 1) | 5 | 5 | 0 | 10 / 4 | 224 | 10 | 40 | 0 | 0 | 0 |
| ck_commit | 1 (1 / 1) | 6 | 6 | 0 | 12 / 4 | 304 | 12 | 60 | 0 | 0 | 0 |
| transition_backend_detected | 1 (1 / 1) | 7 | 7 | 0 | 8 / 4 | 264 | 8 | 48 | 0 | 0 | 0 |
| transition_backend_selected | 1 (1 / 1) | 5 | 5 | 0 | 5 / 4 | 144 | 5 | 20 | 0 | 0 | 0 |
| transition_checkpoint_created | 1 (1 / 1) | 8 | 8 | 0 | 8 / 4 | 300 | 8 | 56 | 0 | 0 | 0 |
| transition_checkpoint_restored | 1 (1 / 1) | 8 | 8 | 0 | 8 / 4 | 300 | 8 | 56 | 0 | 0 | 0 |
| transition_remote_fetch_completed | 2 (2 / 2) | 12 | 12 | 0 | 12 / 8 | 404 | 12 | 68 | 0 | 0 | 0 |
| transition_remote_fetch_started | 1 (1 / 1) | 7 | 7 | 0 | 7 / 4 | 242 | 7 | 42 | 0 | 0 | 0 |
| transition_remote_publish_completed | 2 (2 / 2) | 14 | 14 | 0 | 14 / 8 | 490 | 14 | 86 | 0 | 0 | 0 |
| transition_remote_publish_started | 1 (1 / 1) | 8 | 8 | 0 | 8 / 4 | 300 | 8 | 56 | 0 | 0 | 0 |
| transition_remote_sync_completed | 3 (3 / 3) | 17 | 17 | 0 | 17 / 12 | 620 | 17 | 112 | 0 | 0 | 0 |
| transition_remote_sync_started | 2 (2 / 2) | 12 | 12 | 0 | 12 / 8 | 404 | 12 | 68 | 0 | 0 | 0 |
| transition_repository_bound | 2 (2 / 2) | 9 | 9 | 0 | 9 / 8 | 320 | 9 | 56 | 0 | 0 | 0 |
| transition_repository_unbound | 2 (2 / 2) | 9 | 9 | 0 | 9 / 8 | 320 | 9 | 56 | 0 | 0 | 0 |
| transition_status_refreshed | 1 (1 / 1) | 8 | 8 | 0 | 8 / 4 | 300 | 8 | 56 | 0 | 0 | 0 |
| transition_workspace_created | 1 (1 / 1) | 6 | 6 | 0 | 6 / 4 | 190 | 6 | 30 | 0 | 0 | 0 |
| transition_workspace_opened | 1 (1 / 1) | 7 | 7 | 0 | 7 / 4 | 242 | 7 | 42 | 0 | 0 | 0 |
| transition_workspace_removed | 2 (2 / 2) | 10 | 10 | 0 | 10 / 8 | 342 | 10 | 58 | 0 | 0 | 0 |
| transition_workspace_switched | 1 (1 / 1) | 6 | 6 | 0 | 6 / 4 | 190 | 6 | 30 | 0 | 0 | 0 |
| transition_writer_lease_granted | 2 (2 / 2) | 12 | 12 | 0 | 12 / 8 | 404 | 12 | 68 | 0 | 0 | 0 |
| transition_writer_lease_lost | 2 (2 / 2) | 9 | 9 | 0 | 9 / 8 | 320 | 9 | 56 | 0 | 0 | 0 |
| **Total** | 76 (74 / 74) | 449 | 447 | 2 | 706 / 296 | 21,060 | 706 | 4192 | 0 | 0 | 0 |

**Entailed rows (unproved, each alone in its own table, with the proof):**

| Row | Rows that always refuse first | Proof |
|---|---|---|
| `original_verified` | `frozen_decodes`, `frozen_envelope_schema`, `frozen_envelope_numbers`, `frozen_observed_utc`, `frozen_persisted_utc`, `frozen_payload_schema`, `frozen_payload_fullmatch`, `frozen_payload_numbers`, `frozen_event_identity`, `frozen_key`, `frozen_full_value`, `frozen_producer`, `frozen_custody_event`, `frozen_receipt_event`, `frozen_receipt_schema`, `frozen_fact_schema`, `frozen_fact_issued`, `frozen_fact_event`, `frozen_fact_receipt`, `frozen_fact_payload` | The dispatcher reaches original_verification only through FrozenRecipe.verify_original (frozen_verifier). Its recipe key is the exact RecipeTuple the owner built from the sealed receipt and the installed map is keyed by that tuple, so original.recipe != expected_tuple never holds; it then returns False only when a FROZEN_ORDER component of frozen_components is not True. Each component is one or more frozen_* rows computed from the same authenticated bytes (decodes: frozen_decodes; envelope: frozen_envelope_schema/numbers; payload: frozen_payload_schema/fullmatch/numbers; storage_times: frozen_observed_utc/persisted_utc; event_identity; key; full_value; producer; custody_event: frozen_custody_event/receipt_event; receipt: frozen_receipt_schema; fact_event: frozen_fact_schema/event and, for an issued fact, frozen_fact_receipt; fact_payload: frozen_fact_payload), and those rows sit in earlier tables, so one of them always refuses first. |
| `ck_uint64` | `ck_schema`, `ck_numbers` | Each of the five slots is declared in Plans/source_control_event_contracts.schema.json (or by its $ref to the SP-278 read_token frontier_revision) as type integer with minimum 0 and maximum 18446744073709551615, so ck_schema refuses every negative, oversized or non-integer value; ck_numbers (current_integer) refuses an integral float the stock integer type admits. storage_uint64 accepts exactly the exact integers 0..2^64-1, so after both rows hold it never refuses. |

### Mutation proof (delete or weaken one guard at a time)

`python3 scripts/pm-w3b-mutation-proof.py --scratch <dir>` copies `scripts/` into a scratch root beside symlinks to the real `Plans/` and `reports/`, applies exactly one source edit there (the old text must occur once), and runs the complete checker with `--fail-fast` in a fresh interpreter. A mutant is killed when that run exits non-zero with a judged finding. The baseline (no edit) passes. **Result: 29 of 29 mutants killed** (`mutation-proof.json` in the evidence folder). Nineteen edit a generated table predicate (a row of the checker's refusal path) and ten edit a derive or shared-call seam (the shared `storage_uint64` and `current_integer` calls, the full-match rule, the owner `format`, `allOf` and `pattern` keywords, receipt selection by the bytes it binds, the sealed store's read-only rule, and a readiness gate).

| Mutant | Where | Guard | Mutation | Result | First finding (case: verdict) |
|---|---|---|---|---|---|
| M01 | `pm_w3b_table_identity_1.py` | event_identity | delete the event-id recipe comparison | killed | `backend_detected/append/base/neg/event-id-substituted`: accepted_negative |
| M02 | `pm_w3b_table_identity_1.py` | key_recipe | weaken the key recipe comparison to its first four characters | killed | `backend_detected/append/base/neg/key-substituted`: accepted_negative |
| M03 | `pm_w3b_table_source_join_2.py` | source_join_repo_id | delete the repo_id source join | killed | `checkpoint_created/append/base/neg/source-repo_id`: accepted_negative |
| M04 | `pm_w3b_table_copies_1.py` | payload_copy | weaken the event-payload / source-payload copy join to referenced (SP-337) bodies only | killed | `backend_detected/append/base/neg/event-payload-copy`: accepted_negative |
| M05 | `pm_w3b_table_acceptance_1.py` | acceptance_commitment | delete the native acceptance commitment join | killed | `backend_detected/append/base/neg/acceptance-caller-fixture`: accepted_negative |
| M06 | `pm_w3b_table_retry_1.py` | retry_conflict | delete the CV-317 retry semantic-digest comparison | killed | `backend_detected/retry/base/neg/semantic-conflict`: accepted_negative |
| M07 | `pm_w3b_table_dispatch_1.py` | recipe_receipt_binding | delete the other-original receipt refusal | killed | `backend_detected/history/base/neg/other-original-receipt`: accepted_negative |
| M08 | `pm_w3b_table_frozen_2.py` | frozen_full_value | delete the frozen full-value commitment check | killed | `backend_detected/retry/base/neg/retry-frozen-full-value`: wrong_first_row: ('original_verified', 'original_verification') expected frozen_full_value |
| M09 | `pm_w3b_table_ck_cover_1.py` | ck_coverage | weaken global coverage to the last scanned row | killed | `backend_detected/checkpoint/base/neg/skip-nonmatching-row`: accepted_negative |
| M10 | `pm_w3b_table_ck_token_2.py` | ck_token_source_selection | delete the durable-token source_selection join | killed | `backend_detected/checkpoint/base/neg/token-source_selection`: accepted_negative |
| M11 | `pm_w3b_table_transition_backend_detected_1.py` | t_detect_set | weaken the detected-backends set join to a count | killed | `backend_detected/append/partial/neg/transition-t_detect_set_same_size`: accepted_negative |
| M12 | `pm_w3b_table_publication_2.py` | receipt_storage | delete the Storage-issued receipt join | killed | `backend_detected/append/base/neg/receipt-not-issued`: accepted_negative |
| M13 | `pm_w3b_table_cas_1.py` | cas_after_receipt | delete the issued-fact first-receipt join | killed | `backend_detected/append/base/neg/cas-after-receipt`: accepted_negative |
| M14 | `pm_w3b_table_acceptance_1.py` | no_secret | weaken the secret scan (drop access_token) | killed | `backend_detected/append/base/neg/secret-material`: accepted_negative |
| M15 | `pm_w3b_table_authority_2.py` | auth_credential_current | delete the credential currentness check | killed | `remote_fetch_completed/append/base/neg/authority-credential-stale`: accepted_negative |
| M16 | `pm_w3b_table_order_1.py` | order_receipt_before_expose | delete the receipt-before-exposure order check | killed | `backend_detected/append/base/neg/order-expose-before-receipt`: accepted_negative |
| M17 | `pm_w3b_event_oracles.py` | sequence_u64 / receipt_u64 | replace the shared storage_uint64 call with a bare int() | killed | `backend_detected/append/base/neg/sequence-2p64`: checker_error: [["derive", "Refusal: physical_integer_range"]] |
| M18 | `pm_w3b_event_oracles.py` | payload/fact/ck fullmatch | weaken full-match identifiers to Python re.search (trailing LF passes) | killed | `backend_detected/append/source-pack/neg/source-pack-body-trailing-lf`: wrong_first_row: ('acceptance_commitment', 'original_acceptance') expected src_body_fullmatch |
| M19 | `pm_w3b_event_oracles.py` | timestamp rows (owner format) | drop the shared pm_event_datetime format checker from owner validation | killed | `backend_detected/append/base/neg/occurred-missing-zone`: wrong_first_row: ('occurred_source', 'source_time') expected envelope_schema |
| M20 | `pm_w3b_event_oracles.py` | recipe_receipt_binding / recipe_unique | select a receipt by id alone (ignore the bytes it binds) | killed | `backend_detected/history/receipt-ack-offset`: refused_positive: ('recipe_unique', 'recipe_unsupported') |
| M21 | `pm_w3b_event_oracles.py` | no receipt created while reading | seal a receipt when a read finds none | killed | `backend_detected/retry/base/neg/retry-unsealed-original`: wrong_first_row: ('recipe_receipt_binding', 'original_unavailable') expected recipe_custody |
| M22 | `pm_w3b_event_oracles.py` | envelope/payload/fact/ck numbers | drop the shared current_integer check at integer slots | killed | `backend_detected/append/base/neg/sequence-integral-float`: wrong_first_row: ('sequence_u64', 'storage_uint64') expected envelope_numbers |
| M24 | `pm_w3b_event_oracles.py` | owner allOf keyword (fact phase/receipt, request conditionals) | drop the owner allOf keyword from validation | killed | `backend_detected/append/base/neg/fact-committed-with-receipt`: wrong_first_row: ('fact_fullmatch', 'fact_fullmatch') expected fact_schema |
| M25 | `pm_w3b_event_oracles.py` | owner pattern keyword | drop the owner pattern keyword from validation | killed | `checkpoint_created/append/base`: refused_positive: ('payload_schema', 'payload_schema') |
| M26 | `pm_w3b_event_oracles.py` | inline_size readiness | let an oversize inline body reach the joins | killed | `checkpoint_created/append/jj_big/neg/inline-oversize`: additional_rows: custody_full_value,custody_producer |
| M27 | `pm_w3b_event_oracles.py` | owner pattern of the W3B id/ref definitions | drop only the W3B id/ref CR/LF pattern from owner validation | killed | `backend_detected/append/base/neg/payload/pattern/project_id@370ccf98`: wrong_first_row: ('payload_fullmatch', 'payload_fullmatch') expected payload_schema |
| M28 | `pm_w3b_table_frozen_2.py` | frozen_receipt_schema | delete the held first-receipt verdict of the frozen verifier | killed | `backend_detected/history/base/neg/frozen-receipt-ack-missing-zone`: wrong_first_row: ('original_verified', 'original_verification') expected frozen_receipt_schema |
| M29 | `pm_w3b_table_order_1.py` | order_steps_present | delete the required-publication-steps check | killed | `backend_detected/append/base/neg/order-missing-source_commit`: accepted_negative |
| M30 | `pm_w3b_table_checkpoint_1.py` | ck_project | delete the checkpoint Project identity join | killed | `backend_detected/checkpoint/base/neg/other-project`: accepted_negative |

How the rounds went: round 1 (24 mutants) killed 22; **M04** (payload copy join weakened to a length comparison) and **M11** (detected-backends set join weakened to a count) survived because their witnesses changed the length too. Both got same-length witnesses (a value changed in its last character; Jujutsu observed where Git was committed), and every string source join, copy join, lineage join and custody digest witness now uses a same-length change. Round 2 (29 mutants, adding M27..M30) killed 28; M27's replacement text had an escaping slip that left it a no-op, fixed and killed alone. Round 3 ran at `8797b403c2` after the predicates moved to digests and views; it killed 28 of 29, and M04's new weakening (compare only the first byte of two SHA-256 digests) is not a real weakening, so M04 was redefined (check the copy only for SP-337-referenced bodies) and killed. Some kills surface as a different finding than an accepted negative, which is still the suite failing: M17 (uint64 check replaced by `int()`) lets 2^64 reach the packer and the checker records an error; M20/M25 make valid positives refuse (receipt selection by id finds two receipts; without `pattern`, the Git `commit_oid` `oneOf` branches both match).

### Quality bar: how each point is met

| Point | How W3B meets it | Verify |
|---|---|---|
| 1. Guard rows are the checker's real predicates | The predicate of every row is its refusal test, generated into `scripts/pm_w3b_table_*.py` from `ROWS` (`scripts/pm_w3b_event_oracles.py`); `evaluate` refuses only through those functions, and the gated tool's suites name exactly those modules. No adapter recomputes or looks up a verdict the checker made by itself. Compound rules are split: for example the publication order is one presence row plus seven single comparisons; the frozen verifier is 20 component rows (the dispatcher's own verdict `original_verified` is entailed); request copies, lineage fields, source joins and transition conjuncts each have their own row. Every reachable row has single-defect witnesses refused first at it (the judge refuses any extra refusing row). | `python3 scripts/pm-w3b-table-generate.py --check`; complete checker; tool result below. |
| 2. Mutation proof (at least 10) | 29 mutants, each deleting or weakening one guard in a table predicate or in a derive/shared-call seam; see the mutation table. | `python3 scripts/pm-w3b-mutation-proof.py --scratch <dir>` |
| 3. Owner schema keywords | Every owner verdict uses the complete owner schema (`Draft202012Validator` over the closed registry with `format_checker(profile=EVENT_RECORD)`): `pattern`, `format`, `not`, `allOf`/`if`/`then`, `oneOf` all stay. A separate full-match row per subject re-applies every pattern with `re.fullmatch` (a trailing LF/CR never passes). Negatives exist for every identifier occurrence the base reaches, including the embedded source-body payload copy, the original request (legacy and v2), the fact's top-level copies, the held receipt and every checkpoint token field (owner-schema expansion above). Mutants M19 (drop `format`), M24 (drop `allOf`), M25 (drop `pattern`), M27 (drop only the W3B id/ref pattern) and M18 (full match weakened to `re.search`) are all killed. | Coverage file; mutation table. |
| 4. Every timestamp field via `pm_event_datetime` | The six fields derived from the schemas (table below), current and retained, including the CV-339 receipt on the append path and the held first receipt of every retained original (`frozen_receipt_schema`). | `python3 scripts/pm-w3b-timestamp-fields.py` |
| 5. Integer slots via `storage_uint64` / `current_integer` | `integer_slots_exact` calls `current_integer` at every slot the stock validator admits (envelope, payload, fact with its embedded copies, decoded source body, receipt, held receipt, checkpoint); Storage uint64 slots call `storage_uint64` (`sequence_u64`, `receipt_u64`, entailed `ck_uint64`). No lane-local bound. 2^64 and 10^4399 at a payload integer slot, as an extra member, at a wrongly typed field, at `sequence_id` and at checkpoint uint64 slots are refused with a code (202 in-memory cases in the complete checker, 65 per-family 4,400-digit routes in the corpus run); nothing raises. | Complete checker (`long_integer_cases`); `python3 scripts/pm-w3b-number-corpus.py`. |
| 6. Retained reads | Every `RetainedDispatcher.resolve` call is wrapped by a SHA-256 snapshot of the sealed store before and after; the run reports `sealed_store_reads` 1,317 and `sealed_store_changed_by_read` 0, and a change fails the run. Mutant M21 (seal a receipt on a read that finds none) is killed. A caller selector goes to `resolve(recipe_override=...)` and is refused there (`caller_recipe_override`, row `recipe_override`). | Complete checker summary; M21. |
| 7. Join rows for copies | Each copy of a value is joined to one canonical copy: event payload to source-body payload (`payload_copy`), envelope Project (`envelope_project_copy`), fact identity copies (`fact_*_copy`, `fact_storage`), request copies (`request_*`), `occurred_at_utc` to the native owner's committed occurrence time (`occurred_source`), the receipt to Storage's issued receipt (`receipt_storage`), the source pack to the fact descriptor and the payload, the checkpoint token to the pinned SP-278 publication. Witnesses change one copy with the same length, so a length-only weakening is also caught (M04, M11). | Complete checker. |

### Retained reads (batch 2 fix 1, built in from the start)

- **Selection only from the sealed receipt for that exact original** (`W3BOriginalOwner.authenticated_original`): receipts are looked up by Store, event type and event id, and must bind the bytes Storage holds (`source_commitment`). The recipe comes only from that receipt; there is no Store default, fallback or probing.
- **Missing or ambiguous receipts** keep the bytes unread: no receipt for the original → `original_unavailable` (row `recipe_custody`; on the recovery path the fact is fenced, `recovery_fenced`/`recovery_no_mint`); a receipt for the same id binding other bytes (another original) → `original_other_receipt` (`recipe_receipt_binding`); two binding receipts → `recipe_ambiguous` (`recipe_unique`); an uninstalled edition → `recipe_unknown` (`recipe_installed`, code `quarantine`); a foreign at-write admission → `original_admission`; a presented identity that is not Storage's → `original_binding`; a presented application-scope request → `original_scope`; bytes Storage cannot hand out canonically → `dispatch_resolved`; a caller selector → `recipe_override`.
- **No receipt is created while reading:** proved by the store snapshots above, not by a fixture flag.
- **New-write selection stays separate:** a fresh append reads no receipt.
- **Live state:** every history positive reads with the writer grant withdrawn, a changed live world and changed authority in the same scenario keys the append rows read; no history row reads them (a mutant that let a current-writer row reach history would refuse those positives). Historical `projector_replay_only` originals that were valid when written are accepted (`history/replay-only-original`).
- **Negatives per family:** missing, ambiguous, other-original, unknown edition, foreign admission, caller selector, malformed request, presented other key, application scope, unencodable original, and 20 frozen-verifier component defects (decodes, envelope schema and numbers, both Storage times, payload schema/full-match/numbers, event identity, key, full value, producer, custody event, receipt event, held-receipt schema with malformed `acknowledged_at_utc`, fact schema, fact not issued, fact event, fact receipt, fact payload).

### Timestamps

Every timestamp field W3B validates, derived from the schemas the checker installs (`python3 scripts/pm-w3b-timestamp-fields.py`, which walks properties, items, `$ref`, `allOf`, `anyOf`, `oneOf` and `if`/`then`/`else`, unvisited branches included). The W3B payload, source-fact and checkpoint definitions declare no timestamp of their own. The timestamp review is no longer interim.

| Field | Owner and profile | Shared check |
|---|---|---|
| EventRecord `occurred_at_utc` (candidate and retained original) | EventRecord/CV-317/CV-1101, `event_record` | `format_checker(profile=EVENT_RECORD)` inside `envelope_schema` / `frozen_envelope_schema`; positives for lowercase `t`/`z`, an offset, a legitimate leap second and a 12-digit fraction; negatives for missing zone, space separator, Feb 30, `24:00:00`, trailing LF, a false leap second and an empty fraction. Join row `occurred_source` (equals the native owner's committed occurrence time). |
| EventRecord `observed_at_utc`, `persisted_at_utc` | CV-253 Storage-assigned, `storage_utc_z` (on top of the `event_record` format) | `date_time(..., STORAGE_UTC_Z)` rows `storage_utc_z_observed_at_utc` / `storage_utc_z_persisted_at_utc` on candidates and `frozen_observed_utc` / `frozen_persisted_utc` on retained originals; negatives `+00:00`, lowercase `z`, `-00:00`. |
| CV-339 AppendReceipt `acknowledged_at_utc` (append custody receipt; held first receipt of every retained original) | its owner schema's plain `format: date-time`: the EventRecord profile, not `storage_utc_z` (lead ruling 2026-11-13; CV-1101 binds `storage_utc_z` to the two EventRecord Storage fields only, `Plans/Contracts_V0.md:1155` at this unrebased head) | `format_checker(profile=EVENT_RECORD)` inside `receipt_schema` and `frozen_receipt_schema`; positives with an offset and with a lowercase `z` on both the append receipt and a retained held receipt (`<family>/append/receipt-ack-offset`, `-lowercase-z`, `<family>/history/receipt-ack-*`); malformed negatives on both. |
| Source Control request `requested_at_utc` (`original_request.legacy_request`, in the fact's source body or its decoded SP-337 pack) | SCS `$defs/timestamp` (`format: date-time`), `event_record` | `format_checker(profile=EVENT_RECORD)` inside `fact_schema` / `src_body_schema`; the seven malformed forms as negatives. |
| v2 sync target `preview_expires_at` (`original_request.target`, sync families' local_reconcile_only requests) | SCS `remote_sync_local_reconcile_target_v2` (`format: date-time`), `event_record` | `format_checker(profile=EVENT_RECORD)` inside `fact_schema`; the seven malformed forms as negatives. |

**Date-time inventory gate** (`python3 scripts/pm_event_datetime_inventory.py`, the shared gate over the whole `Plans/` tree): exit 1, `"status": "fail"`, 233 nodes, 0 unclassified nodes, 41 failure rows. Run again with the two W3B data files moved aside (same tree): 39 rows, so exactly two rows are this lane's, both `unclassified_mentioning_container` data files: `Plans/w3b_event_fixtures.json` (EventRecord instances) and `Plans/w3b_original_custody.json` (the recipe's field-profile map). The other 39 exist without them: `.plan_migration` (19), `.plan_index` (14 unclassified containers and 2 stale scan exclusions, from the regenerated index) and the ignored currentness edition (4). They are recorded here for the batch-3 integration refresh, as W3F and batch 2 did. The lane uses the shared predicate with the explicit profile per field and does not call `datetime_validator` in the lane tree (SWEEP-P2B addendum 2); the inventory and exclusions are NUMRULE files and are not edited here. The W3B schema resource itself raises no gate row (it declares no Storage timestamp field).

### Numbers

Shared calls (CV-1100/SP-1100; `scripts/pm_w3b_event_oracles.py`):

| Slot or route | Shared call | Row |
|---|---|---|
| Fixture text, every integer token | `loads_exact` + `current_integer` (`materialize`) | ingress (a `-0` or `01` token never parses) |
| EventRecord integer slots (`sequence_id`, `producer_sequence_id`) | stock verdict, then `current_integer` per admitted slot (`integer_slots_exact`) | `envelope_schema`, `envelope_numbers` |
| Storage `sequence_id` | `storage_uint64` | `sequence_u64` |
| Payload integer slots (writer-lease generation/epoch, checkpoint and binding generations, Git `index_generation` in every revision) | stock verdict, then `current_integer` | `payload_schema`, `payload_numbers` |
| Fact, embedded source-body copy, original request (topology, currentness and checkpoint generations, v2 sync generations/epochs), decoded source pack | stock verdict, then `current_integer` | `fact_numbers`, `src_body_numbers` |
| CV-317 producer projection (append and retry) | `producer_semantic_bytes` / `producer_semantic_digest` | `producer_route`, `retry_conflict`, `custody_producer`, `frozen_producer` |
| CV-339 full value | `full_value_commitment` | `custody_full_value`, `frozen_full_value` |
| CV-339 AppendReceipt (append custody and held receipt) | stock verdict, `current_integer`, then `storage_uint64` at `sequence_id`, `segment_generation`, `byte_offset`, `durable_end_offset`, `manifest_generation` | `receipt_schema`, `receipt_numbers`, `receipt_u64`, `frozen_receipt_schema` |
| SP-278 checkpoint (`through_sequence_id`, token `frontier_revision`, selection generations, `recovery_epoch`) | stock verdict (schema bounds 0..2^64-1), `current_integer`, then `storage_uint64` | `ck_schema`, `ck_numbers`, entailed `ck_uint64` |
| Inline size, packs, retained bytes, source commitments | `storage_value_bytes`, `decode_storage_value` (`EVENT_VALUE`), `verify_payload_bytes` | `inline_size`, `pack_*`, `src_pack_*`, `fact_wrapper_size`, `acceptance_commitment`, dispatch rows |
| Retained originals | `RetainedDispatcher`, `RecipeTuple`, `OriginalBinding`, `OriginalCustody`, `FrozenRecipe` | dispatch and frozen rows |

Event and key identities are the owner's hex-concatenation templates (SCS-1250..1268 C4/C5), not JCS; no `qualified_jcs` preimage exists in this lane.

Results:
- **Shared self-test:** `python3 scripts/pm_event_numbers.py --self-test --scope numbers` exit 0, `"status": "pass"` (580 corpus cases, 0 failures).
- **Shared corpus through the complete checker:** `python3 scripts/pm-w3b-number-corpus.py` exit 0, `"status": "pass"`: 163 corpus cases, 460 route runs (raw ingress, `producer_sequence_id`, `sequence_id`, payload `lease_generation` of `writer_lease.granted` with its native, world and copy values), 211 accepted, 249 refused, 0 disagreements with the shared helpers' expected row, 0 untracked exceptions.
- **The 4,400-digit integer** (the crash DX, DS15, DF, DM and DCO each found): checked, no crash. Every evaluation runs under a scoped `exact_digits()`. The producer slot refuses at `producer_route`, the Storage slot at `sequence_u64`, and each payload integer slot of each family at `producer_route` (65 per-family routes, all at the expected row); raw ingress of a 4,400-digit token is accepted, as the shared parser accepts it. The complete checker also carries 202 in-memory cases: 2^64 and 10^4399 at a payload integer slot (`producer_route`), as an extra payload member and at a wrongly typed field (`payload_schema`), at `sequence_id` (`sequence_u64`) and at the checkpoint's `through_sequence_id` and token `frontier_revision` (`ck_schema`). They are not stored in the fixture file because a JSON text holding such an integer is unreadable to Python's default parser, which the date-time inventory gate uses.

**Fixture expectations the shared rule decides** (W3B had no executable fixtures before, so these are the cases a stock-schema reading alone would accept):

| Input | Stock JSON Schema | Shared rule | Refusing row and reason |
|---|---|---|---|
| Integral float (`1.0`) or `-0.0` at any integer slot | accepted as integer | `current_integer` refuses | `envelope_numbers` / `payload_numbers` / `fact_numbers` / `src_body_numbers` / `receipt_numbers` / `ck_numbers` |
| `-0`, `01` tokens | not reached | `loads_exact` refuses the token | ingress (corpus raw route) |
| `2^53 + 1`, `2^60` and above at `producer_sequence_id` or a payload integer | accepted | the producer route refuses before effects | `producer_route` |
| `2^64` at `sequence_id` or a receipt uint64 slot | accepted (no maximum) | `storage_uint64` refuses | `sequence_u64` / `receipt_u64` |
| `2^64 - 1` at `sequence_id`; `2^53` at `producer_sequence_id` | accepted | accepted | positives `<family>/append/sequence-u64-max`, `<family>/append/producer-2p53` |
| A retained Storage original holding an integer above uint64 | — | not canonical SP-236 bytes | `dispatch_resolved` (unavailable, never accepted) |
| String number or boolean at an integer slot | refused (type) | — | `envelope_schema` / `payload_schema` |

### Retention cells

All 19 event-history cells are bound to decisions on `main` (Card 1 DL-401, deck 2 DL-415..DL-452, deck 3 DL-453..DL-464 and deck 4 DL-500..DL-509 were read on `main` `8f4eddac6f`). The deck-3 appendix lists every W3B name; no other decision names them.

| Decision (E-CARDS-3 item, option A) | Families | Policy object (Project) | Anchor |
|---|---|---|---|
| DL-453 (1.a) | 9: `backend.selected`, `checkpoint.created`, `checkpoint.restored`, `repository.bound`, `repository.unbound`, `workspace.created`, `workspace.removed`, `writer_lease.granted`, `writer_lease.lost` | `RP-AUTHORITY-INDEFINITE@1.0.0` | none (permanent, no new count allowance) |
| DL-454 (2.a) | 4: `backend.detected`, `status.refreshed`, `workspace.opened`, `workspace.switched` | `RP-TELEMETRY-90D@1.0.0` (shared 2,000,000-entry Project allowance) | first successful save that survives a restart (DL-415), 7,776,000 s |
| DL-455 (3.a) | 6: the six `remote.*` facts | `RP-OPERATIONAL-2555D@1.0.0` with Storage's Project first-save anchor adapter | the original saved change (a start entry from its own first save), 220,752,000 s |

The landed Storage text names every W3B family under these items (`Plans/storage-plan.md` on `main`, "Third-sitting retention assignments (DL-453 through DL-464)"); the three policy objects exist on `main`. All 19 W3B families are Project-only, so no application allowance applies. The binding is written in SCS-1250..SCS-1268 C7, SP-1250..SP-1268, `Plans/source_control_event_preparation.json` (`retention_policy_ref`, `retention_decision`) and checked by the `retention_bound` row (negatives: `PENDING_RETENTION_DECISION`, and the policy of another class).

**Still pending (a question for Jared):** the separate original **source fact** row of each family (`source_control_<family>_fact`, the accepted request, native evidence refs and owner result ref the history cites). DL-453/454/455 decide the history entries and expressly leave original records their own lifetimes (W3RT proposal text: "The additional events' duration does not change their independent source records"); no landed decision assigns the source facts. Each stays `PENDING_RETENTION_DECISION` with its question in SCS C7, SP-12xx, the preparation JSON (`source_fact_retention_question`) and the storage rows. The question: **Should each Source Control source fact keep the same lifetime as its history entry (permanent for the nine DL-453 families, 90 days for the four DL-454 families, seven years for the six DL-455 families), or follow another rule? A shorter lifetime than its history would leave retained history unable to resolve its original source.**

### Item responses (latest review: `reviews/W3B-sol/REVIEW-phase1.md`)

| Item | Disposition and change | Commit, path:line | Verify |
|---|---|---|---|
| **F1** (blocking, phase 1): impossible isolated negative for `backend_detected` `maxItems=2` | Fixed in phase 1 by the reviewed classification (`11ba6d0dd4`). Phase 2 keeps it: the coverage file marks `backend_detected/schema/16` `implied_unreachable_alone` with the phase-1 evidence, the owner-schema expansion confirms no other W3B site needed such a classification (every reached site produced a refused negative), and `uniqueItems` and the item `enum` each have their own witnesses. | `reports/event-authority-20261105/W3B-phase2-plan-coverage.json` entry `backend_detected/schema/16` | `pm-w3b-cases.py --check --coverage` |
| **N1** (note): SP-337 integration gate (EventRecord `payload_ref` is a nullable string; the W3B source-body pointer is an object) | Both routes are exercised separately. Event route: the EventRecord keeps its owner shape (`payload_ref` = `sp337:blake3:<payload_id>`, string); rows `pack_route`, `pack_size`, `pack_blake3`, `pack_media`, `pack_body`, `pack_durable`, `pack_needed` and the >16 KiB owner-valid positives `<family>/append/jj_big` (a Jujutsu revision with 420 bookmarks makes the payload exceed 16 KiB). Source route: the fact's `source_body_ref` object (`blake3_id`, `byte_size`, `media_type`); rows `src_pack_present`, `src_pack_size`, `src_pack_blake3`, `src_pack_media`, `src_pack_decodes`, `src_body_schema`, `src_body_fullmatch`, `src_body_numbers`, `src_pack_needed`, `src_pack_durable` and the positive `<family>/append/source-pack` (80 long native evidence refs push the fact over 16 KiB). The stored wrapper (`fact_wrapper_size`) and the decoded typed body (`src_body_schema`) are measured independently, and a body that fits stays inline (`pack_needed`, `src_pack_needed`). The shared EventRecord schema/prose gap itself (string versus pack-identity object) is unchanged: it is a shared-owner integration item for batch 3, not a lane edit. | `scripts/pm_w3b_event_oracles.py` rows `pack_*`, `src_pack_*`; `scripts/pm_w3b_negatives.py` | Complete checker. |
| **Phase-1 completion condition**: expand every inherited owner-schema assertion | Done by the builder's site walk (above); 0 sites left unwitnessed or implied. | `scripts/pm_w3b_negatives.py` `walk_sites`, `schema_negatives` | `pm-w3b-cases.py --check` |
| **Retention questions Q01..Q19** | Event-history cells bound to DL-453/DL-454/DL-455; source-fact lifetime kept pending with one question (Retention cells). | `34c249a541`; SCS-1250..1268 C7, SP-1250..1268; `8797b403c2` storage rows; preparation JSON | `grep -n "bound by DL-45" Plans/Source_Control_System.md` |
| **Stale owner claims** ("PARTIAL in phase 1: no executable oracles"; "phase 2 uses the reviewed shared helper ... criterion 12 PARTIAL") | SCS C12, CV-1250..1268 and ATS-1210..1219 now name the executable checker, fixtures, sealed custody and tool; the ATS section preamble says phase 1 authored no code and phase 2 implements the plans. Native work and admission stay NOT_RUN/ABSENT. Canonical text changed in exactly these 67 units (index diff). | `34c249a541` | `git diff 8797b403c2~2 34c249a541 -- Plans/*.md` |

**Disputed:** none. **IDs:** no new PlanUnit, Decision Log, registry or admission ID; SCS-1250..1268, CV-1250..1268, SP-1250..1268 and ATS-1210..1219 change in place. New fixture case IDs only.

### What Astra keeps finding: how each was ruled out

1. **Forged or contradictory inputs:** every identity and key is recomputed from the payload identity and Storage instance; supplied digests (custody full value, producer digest, acceptance commitment, pack ids) are compared with recomputed ones; each copy is joined to one canonical copy; native owner values are joined to the committed source; transition conjuncts join the native world records.
2. **Storage-assigned metadata:** the candidate's `sequence_id`, `observed_at_utc`, `persisted_at_utc` and the receipt are compared with Storage's issued values; the retry comparison uses the CV-317 producer projection, which excludes them (the retry positive carries different Storage values and returns the original).
3. **Historical readers:** valid history reads after the writer is withdrawn and live state changed, including originals written with `projector_replay_only`; forged identity, other-original, ambiguous, uninstalled and foreign-admission originals are refused; no current-writer row runs on history or recovery.
4. **One field read two ways:** strict owner types; identifiers full-match their pattern everywhere; canonical bytes (SP-236) are the only digest input; an uppercase or differently spaced identifier differs from its join and is refused there.
5. **Unresolved references:** the closed registry is checked eagerly at import over every `$ref` reachable from the W3B roots, including unvisited branches; the `install` path refuses a dangling reference and an invalid metaschema per family.
6. **Size limits:** the event payload and the stored fact wrapper are each measured against 16 KiB, decoded bodies are validated, and a body that fits must stay inline.
7. **Custody on every path:** first-receipt custody and the fact CAS on append; the sealed original on every retry, retained read and recovery; backup closure members.
8. **Masked negatives:** the judge refuses any negative that refuses anywhere but its own row (entailed rows excepted), and the tool's matrix and cut/restore runs re-check every table.
9. **Grades:** see below; criterion 12 claims only what the checker, tool and mutation proof show.
10. **Numbers written two ways:** `1.0`/`-0.0` refused at integer slots; `-0`/`01` refused at ingress; one canonical byte recipe for every digest.
11. **Types confused:** string numbers, booleans, null, arrays and objects at typed fields come from the owner-schema expansion's `type` sites at every reached occurrence.
12. **Formats skipped by the validator:** date-time through the shared checker; uuid (SP-278 token) through the stock format checker the shared `format_checker` installs; patterns through the full-match rows.
10a. **Tightened rules and history:** retained originals verify under their sealed `w3b@1` recipe; a caller cannot select another; W3B has a single edition, so no older-recipe positive exists to build.

### Stopped for Jared

One question, from the retention pass (no other item needs an owner decision):

**Should each Source Control source fact keep the same lifetime as its history entry (permanent for the nine DL-453 families, 90 days for the four DL-454 families, seven years for the six DL-455 families), or follow another rule?** The decks decided the history entries only and left original records their own lifetimes; a source fact shorter-lived than its history would leave retained history unable to resolve its original source.

### Grades before and after

Per family, cells PASS / PARTIAL / ABSENT (criterion 1, membership, stays ABSENT by design). Re-graded at the phase-2 head; all 266 evidence quotes in `reports/event-authority-20261105/W3B-self-grade.json` were re-pinned and re-checked at their lines and file hashes (209 moved or re-hashed; the 19 phase-1 quotes "C7 retention: PENDING_RETENTION_DECISION." no longer exist and were replaced by the new C7 binding and pending-source-fact quotes, and each oracle cell gained the C12 phase-2 quote; none left stale).

| Families | Before (phase-1 round 1) | After (phase 2) | Cells that changed |
|---|---|---|---|
| All 19 | 9 / 2 / 1 | 10 / 1 / 1 | 12 oracles: PARTIAL -> PASS. 7 retention stays PARTIAL with a new finding: the event history is now bound (DL-453/DL-454/DL-455) but the separate source-fact lifetime is still undecided. |

Why: **12 (oracles)** was PARTIAL because no executable oracle, inherited-assertion expansion or check-11 proof existed; it now has all three for each family (its own positives and one-defect negatives, every phase-1 plan entry witnessed, every reached owner assertion witnessed, rows proved by the gated tool, 29 of 29 single-guard mutants killed). **7 (retention)** stays PARTIAL honestly: binding the history does not decide the source fact. What still bounds these grades: they are synthetic oracle grades (native execution NOT_RUN, membership ABSENT), the two lane data files need the batch-3 date-time inventory refresh, and Sol and Astra have not reviewed phase 2.

### Checks at the phase-2 head

Logs are in the evidence folder with `SHA256SUMS`. Each heavy command ran under the memory wrapper (`MemoryMax=2G`, `MemorySwapMax=0`, started at 12 GiB or more available).

| Command | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_w3b_event_oracles.py --json <file>` | 0 | `pass`: 18,945 cases (492 positives, 18,453 negatives, 202 in-memory long-integer cases), 0 errors, 0 unwitnessed reachable rows; 1,317 retained reads, sealed store changed 0 times |
| `python3 scripts/pm-w3b-cases.py --check --coverage` | 0 | 492 positives, 18,251 stored negatives, 272 sealed receipts; nothing stale (fixtures, custody, plan coverage) |
| `python3 scripts/pm-w3b-table-generate.py --check` | 0 | 76 tables, 449 rows, 2 entailed; nothing stale or extra |
| `python3 scripts/pm-w3b-guard-tables.py --out <dir> --table ...` (three table groups) | 0 (each group) | 74/74 runs PASS, 447/447 provable rows proved, 2 entailed rows unproved with proofs, 0 collection findings |
| `python3 scripts/pm-w3b-mutation-proof.py --scratch <dir>` | 0 | baseline pass; 29 of 29 mutants killed (round 3 at `8797b403c2`, M04 re-run after its weakening was redefined) |
| `python3 scripts/pm-w3b-number-corpus.py` | 0 | `pass`: 163 cases, 460 route runs, 0 disagreements, 0 untracked; 65 per-family 4,400-digit routes at their rows |
| `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | 0 | `pass`: 580 corpus cases, 0 failures |
| `python3 scripts/pm-w3b-timestamp-fields.py` | 0 | 6 timestamp fields (table above) |
| `python3 scripts/pm_event_datetime_inventory.py` | 1 | `fail`: 41 rows, 2 from this lane's data files, 39 present without them |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | `pass`; only Contracts_V0, storage-plan and Automated_Testing_System shards changed (the owner-text edit, plus the NUMRULE-merge regeneration) |
| `python3 scripts/pm-plan-index.py generate` (15-file currentness edition copied in, SHA-256 identical) | 0 | `pass`: 7,493 units; canonical text changed only in SCS-1250..1268, CV-1250..1268, SP-1250..1268, ATS-1210..1219 (67 units) |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | `pass`, 3,098 shards |
| `python3 scripts/pm-plan-index.py validate`, live `origin/main` `564ed6a467` | 1 | 760 rows, all from `main` moving past this unrebased branch: 739 `plan_unit_removed_without_ledger_decision` and the 21 older-ledger rows that come with them (the same pattern W3F recorded) |
| same, in a scratch shared clone with `origin/main` pinned to the branch base `f4c9d5003e` | 0 | `pass`, 0 failures |
