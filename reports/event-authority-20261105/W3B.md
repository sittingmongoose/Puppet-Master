# W3B — Source Control, phase 1 (2026-11-05)

Branch: `plans/ea-w3-source-control-20261105`. Base: `f9c5de6561dff0a53a48e530f2a5c6804a7e941d` (current origin/main fetched before branching). Final head is in the handoff; the self-grade pins the exact owner content by SHA-256 to avoid a self-referential commit hash.

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

