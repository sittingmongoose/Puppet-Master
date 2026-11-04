# DG6A — final fix round 3

Worker: DG6A-FIX3, VM. Branch: `plans/ea-w2-gui-concerns-20261104`.
Reviewed head: `b6ddf461659e979362f9f58d8781733a23737a42`. Repair commit: `65a6a61e0ddbec2d55a9f017c0dbf9df15aee995`.
The final report commit is self-inclusive. This is the final allowed fix round, pending the final independent review.

Seven families are prepared without admission. Each moves from the cycle-3 review's **9 PASS / 2 PARTIAL / 1 ABSENT** to this worker's **10 PASS / 1 PARTIAL / 1 ABSENT**. Membership remains ABSENT and retention remains PARTIAL. All nine stopped records and decision-card questions/recommendations are unchanged. Native execution remains NOT_RUN.

## Family grades before and after

| Family | Cycle-3 review | Round-3 self-grade |
|---|---|---|
| `alert.acknowledged` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `alert.dismissed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `alert.rule_muted` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `alert.snoozed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `concern.created` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `panel.redocked` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `panel.undocked` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |

The nine stopped families retain their exact prior twelve-cell grades. All seven upgrades are confined to positive_negative_oracles; admission and retention stay open.

## Review round 3: findings and responses

1. **Blocking 1 — fixed (`65a6a61e0ddbec2d55a9f017c0dbf9df15aee995`).** Where: `scripts/pm-alert-event-contracts-check.py:93`, `scripts/pm-panel-event-contracts-check.py:45`, `scripts/pm-concern-created-contracts-check.py:94`; all seven checkpoint paths. Cause: three mutually consistent checkpoint/token/source identities were accepted without joining the original event's Storage context. Fix: every checkpoint oracle now requires the separately supplied original operation context and compares Storage instance and the Project/server/partition fields present in both contracts. Four alert operation fixture sets now use the checkpoint's actual UUID instead of `store`. Each family rejects both a single foreign token and the coherent UUID `00000000-0000-4000-8000-000000000002` triple through its full CLI. Internal consistency, schema closure, byte limits and native NOT_RUN obligations remain.

2. **Blocking 2 — fixed (`65a6a61e0ddbec2d55a9f017c0dbf9df15aee995`).** Where: `scripts/pm-alert-event-contracts-check.py:68` and `:74`, each alert's operation fixture and SP-660..663's existing physical bound. Cause: operation values received only JSON Schema validation. Fix: measure canonical MessagePack of the complete operation and refuse above 16384 bytes. Every alert exercises schema-valid exact 16384/16385 boundaries and two oversized frozen snapshots. The full CLI rejects both 17000-byte snapshot refs and an attempted positive expectation at 16385. Existing SP-337 body-reference ownership and separate checkpoint/History limits are preserved; spill/pack durability is native NOT_RUN.

3. **Blocking 3 — fixed (`65a6a61e0ddbec2d55a9f017c0dbf9df15aee995`).** Where: the four `Plans/alert_event_contracts/alert_*_operation.schema.json` files (`$defs/payload_ref_array/items`, acknowledgement line 362) and the matching four embedded `value_schema` objects in `Plans/storage_value_registry.json`; `scripts/pm-alert-event-contracts-check.py:38`. Cause: embedding renamed `non_secret_ref` but left its optional array pointer unchanged. Fix: use `#/$defs/payload_non_secret_ref` in all four external/embedded schemas. Nonempty source/evidence arrays are retained as positives and pass eight full CLI probes. Every lane schema and relevant embedded schema now receives a local-reference resolution walk, including unused definitions. Full CLI mutations inserting unused unresolved refs fail for every family, independently of instance validation. No permitted field is removed and no positive exception is treated as a valid negative.

4. **Note 4 — reported accurately (final report commit).** No generated timestamp is hand-edited and no governance artifact is refreshed. The no-edit regeneration comparison below retains the existing four `generated_at_utc` exceptions.

## Per-family standing checks

P = pass; F = fixed by `65a6a61e0ddbec2d55a9f017c0dbf9df15aee995`. Each numbered check has negative cases run through the complete checker command. The detailed JSON records every command, expected exit and actual exit. Check 9 is included because FIX-ROUND.md adds it after checks 1–8.

| Family | 1 replay | 2 app key | 3 partition | 4 bytes/ref | 5 LF | 6 semantic | 7 context | 8 failure exit | 9 refs |
|---|---|---|---|---|---|---|---|---|---|
| `alert.acknowledged` | P | P† | P | F | P | P | F | P | F |
| `alert.dismissed` | P | P† | P | F | P | P | F | P | F |
| `alert.rule_muted` | P | P† | P | F | P | P | F | P | F |
| `alert.snoozed` | P | P† | P | F | P | P | F | P | F |
| `concern.created` | P | P† | P | P | P | P | F | P | P |
| `panel.redocked` | P | P | P | P | P | P | F | P | P |
| `panel.undocked` | P | P | P | P | P | P | F | P | P |

† Project-only families reject an application-scope attempt; no application capability or key extension is invented. The two panel application positives use the exact CV-366 lowercase UTF-8 hex recipe. Arbitrary, unequal, uppercase and raw-identity keys fail independently.

| Check | Negative case and full-checker assertion |
|---|---|
| 1 | Replace the positive current-writer policy with `projector_replay_only`; exit 1 for each family. Actual guard/retry models also retain their replay-only negatives. |
| 2 | For each panel mutate the application positive to malformed/unequal keys. For the five Project-only families mutate the original positive to null Project scope. Each full CLI exits 1. |
| 3 | Replace the encoded positive partition with raw `fixture`; exit 1. Panels/creation additionally reject a raw original-operation partition. All seven use the actual shared reversible Project codec. |
| 4 | Supply schema-valid oversized complete operations; exit 1 in all seven. Alerts additionally reject a 16385-byte operation claimed as valid. Exact 16384 operation positives, SP-337 ownership and independent checkpoint/complete-History boundaries remain. |
| 5 | Add trailing LF to a populated payload identifier and nested token hash; exit 1 per family. Ordinary suites also cover every authored pattern leaf, including optional leaves. |
| 6 | Claim an altered caller body has the original digest, or claim only changed `sequence_id`, `observed_at_utc` or `persisted_at_utc` changes the digest; each false expectation exits 1. The actual shared producer digest keeps each assigned-metadata-only retry equal and changes for altered semantic payload. |
| 7 | Change one token UUID, then all three checkpoint/token/source UUIDs coherently, preserving the original operation; both full CLI cases exit 1 per family. |
| 8 | Change a negative policy expectation to success and feed actual exit 0 to the full failure-oracle entry point; both exit 1 per family. The mutation runner requires actual exit 1 for a negative and refuses unexpected success. |
| 9 | Insert an unused unresolved local ref into each payload/operation/checkpoint schema and the embedded registry schema; each full CLI exits 1. Eight permitted nonempty alert-array positives exit 0, status=pass. |

## Earlier findings rerun

| Finding | Negative cases and result |
|---|---|
| A1 — physical profiles | Delete each prepared operation/checkpoint profile, both shared alert-state profiles, and the concern_record profile. Every relevant full CLI exits 1. Existing profiles/groups/budgets are unchanged; the complete profile checker retains the reviewed head's same 41 unrelated errors. |
| A2 — unbounded checkpoints/History | Add 1000 accumulated event refs or a persisted redb_snapshot_id, and exceed complete checkpoint bytes: every family exits 1. Dedicated exact-16384 checkpoint positives pass. Ordinary suites retain 1000-match traversal, empty filtered continuation, large valid token, exact complete-response bytes, 16385 refusal and individually unpageable metadata/ref checks for every family. |
| A3 — panel current versus historical semantics | For each panel mutate chat identity, persisted-host flag, co-emission flag, or replace the current positive with historical v1. All eight full CLI negatives exit 1. Historical schema bytes remain unchanged. |
| A4 — creation authority | Worker/User/External Resource/Recovery/Observer mutate both command creator and candidate record creator with the full digest recomputed; all five full CLI cases exit 1. Authorized creators and independent accountable owners remain positive. |
| A5 — grades/citations | Change each prepared family's pending retention grade to PASS, and change the annotation owner citation to CV-049. The full grade/citation checker rejects all eight mutations. The unmodified audit resolves 527 citations and verifies the nine stopped records match the reviewed head. |
| Panel digests | For each panel change only settled_at_utc or interaction_transaction_id, retaining the original digest/event/receipts. All four full CLIs exit 1. Full frozen command/payload preimages remain unchanged. |

## Nine stopped families: unchanged decision-card questions

Each row remains STOPPED_FOR_JARED. Its exact question and recommendation are copied unchanged from the reviewed report; all recommendations remain unapplied. Existing lifecycle, creator/owner/resolver separation, GUI/runtime split, permissions/currentness and blocking-promotion prerequisites stay fixed.

| Family | Final narrowed question | Review recommendation — unapplied | Current evidence |
|---|---|---|---|
| `bundle.annotation_state_changed` | Which exact serialized identity governs durable annotation creation/status changes: the split bundle.note_created/bundle.note_status_changed identities, a distinct bundle.annotation_state_changed, or approved co-emission? If the generic spelling is compatibility-only, what verifiable mapping applies? | Use the existing split native identities: one bundle.note_created per creation and one bundle.note_status_changed per real status transition. Make bundle.annotation_state_changed a compatibility spelling only after an explicit verifiable mapping is approved; no duplicate co-emission, and quarantine ambiguous legacy data. | `Plans/Contracts_V0.md:907` (CV-077); `Plans/Contracts_V0.md:951` (CV-077 / event catalog); `Plans/storage-plan.md:1170` (SP-095) |
| `bundle.note_created` | For a durable annotation creation, is bundle.note_created the sole event, or is a distinct generic annotation event also required? What approved read mapping, if any, relates the generic spelling? | Emit one bundle.note_created for durable creation, preserving annotation id/provenance; no additional generic event for the same mutation. note_record.v1 compatibility lineage does not itself decide an EventRecord alias. | `Plans/Contracts_V0.md:907` (CV-077); `Plans/Contracts_V0.md:951` (CV-077 / event catalog); `Plans/storage-plan.md:1169` (SP-095) |
| `bundle.note_status_changed` | For a committed annotation lifecycle change, is bundle.note_status_changed the sole current spelling, or is a distinct generic annotation event required? What approved compatibility mapping applies? | Emit one bundle.note_status_changed for each real committed lifecycle transition, preserving open/addressed/still_open/cannot_apply/resolved; generic annotation spelling becomes compatibility-only only after Jared approves the mapping. | `Plans/Contracts_V0.md:907` (CV-077); `Plans/Contracts_V0.md:951` (CV-077 / event catalog); `Plans/storage-plan.md:1170` (SP-095) |
| `concern.assigned` | Which actors may commit concern owner reassignment, which may only request it, and when is additional confirmation required? Concern identity and separate creator/owner/resolver roles remain fixed. | Accountable runtime or scoped package/seam authority commits; others request. Require reason, original/new owner and authority evidence, preserve identity, and require strong confirmation for a cross-authority transfer. | `Plans/Orchestrator_Page.md:118` (OP-002); `Plans/Orchestrator_Page.md:176` (OP-002); `Plans/UI_Command_Catalog.md:8573` (UCC-147) |
| `concern.evidence_linked` | Which actors may commit additive concern evidence links rather than propose them, and does that addition require extra confirmation under existing permission/currentness rules? Destructive replacement/removal is a separate action. | Permit authorized user and accountable runtime/overseer additions through the owner command with current source-access and revision checks. Ordinary additive linking needs no extra confirmation; destructive replacement/removal needs a separate authorized action. Preserve who linked what. | `Plans/Orchestrator_Page.md:118` (OP-002); `Plans/Orchestrator_Page.md:176` (OP-002); `Plans/UI_Command_Catalog.md:8576` (UCC-147) |
| `concern.promoted` | Which scoped actors commit concern promotion versus request it, and which confirmation/HITL privileges remain for the user? Existing automation-first gate/evidence and critical/security/governance rules stay fixed. | Scoped runtime/overseer commits after gate/evidence validation; a user requests promotion or answers a true HITL gate. Preserve automation-first promotion and explicit critical/security/governance gates. | `Plans/Orchestrator_Page.md:118` (OP-002); `Plans/Orchestrator_Page.md:176` (OP-002); `Plans/UI_Command_Catalog.md:8577` (UCC-147) |
| `concern.reopened` | Who may commit reopening, who may only request it, and what additional confirmation applies under existing critical/HITL policy? The new-evidence resolved-or-dismissed -> active transition and prior terminal lineage remain fixed. | Current accountable owner commits when new evidence invalidates the prior resolution/dismissal; user or worker may request. Require new evidence, reason and retained terminal lineage; confirmation only where existing critical/HITL policy requires it. | `Plans/Orchestrator_Page.md:118` (OP-002); `Plans/Orchestrator_Page.md:176` (OP-002); `Plans/UI_Command_Catalog.md:8575` (UCC-147) |
| `concern.resolved` | Which actors may commit evidence-backed true resolution or authorize accepted_risk, with which confirmation? Acknowledgement/dismissal remain distinct triage actions and cannot clear an active blocker; lineage edits remain guided and audited. | Scoped runtime/overseer records evidence-backed true resolution. Accepted risk requires an explicit authorized human decision and retained evidence. Preserve separate acknowledge/dismiss triage and guided, audited lineage edits. | `Plans/Orchestrator_Page.md:118` (OP-002); `Plans/Orchestrator_Page.md:176` (OP-002); `Plans/UI_Command_Catalog.md:8574` (UCC-147) |
| `concern.updated` | Which actors may commit operational severity/category/authority patches versus request them, and what additional confirmation is required? Existing current evidence, exact revision and consequential-change rationale rules stay fixed. | Accountable runtime/overseer commits operational severity/category/authority patches within scope; user/worker requests go through that owner. Require current evidence, exact revision and rationale for consequential reclassification, never a projection edit. | `Plans/Orchestrator_Page.md:118` (OP-002); `Plans/Orchestrator_Page.md:176` (OP-002); `Plans/UI_Command_Catalog.md:8572` (UCC-147) |


## Separate unapplied creator proposal (not a preparation blocker)

The following original question/recommendation is preserved as a separate proposed feature expansion. No new direct creator or additional confirmation policy is applied to canon.

| Family | Final narrowed question | Review recommendation — unapplied | Current evidence |
|---|---|---|---|
| `concern.created` | Beyond the already authorized runtime/package-overseer/seam-overseer/corroboration/graph-patch creators and worker nomination-only rule, may User or External Resource input directly commit a concern, or must an authorized owner accept its nomination, and with what confirmation? | Keep the already specified canonical creators. Worker, User and External Resource input is nomination until accepted by an authorized owner. Record creator separately from accountable owner. Do not re-ask whether the listed runtime creators may create. | `Plans/Orchestrator_Page.md:118` (OP-002); `Plans/Orchestrator_Page.md:176` (OP-002); `Plans/UI_Command_Catalog.md:8571` (UCC-147) |


## Authority, scope and IDs

No new PlanUnit IDs or product bindings were minted in round 3. Existing lane IDs are SP-660..666, CV-680..686, F3-700..705 and ATS-330..334 (25 total); OP-004 remains the existing creation route. This repair implements existing owner limits/context joins, without a new actor, retention, event, command, projector or checkpoint identity.

All six owner documents (Storage, Contracts, Orchestrator, Executor, FinalGUISpec and Automated_Testing_System) remain byte-identical to the reviewed head. Existing per-family searches and DL-045/DL-076/current panel/creator premise checks remain as recorded in prior lane evidence; no August/September answer is newly applied or extended. No new Jared choice is taken. No event-family registry append, admission, exclusion application, Decision Log, .gitignore, Spec Lock, .evidence, auto_decisions, frozen-validator or main change.

Shared-file edits are exactly the four dangling-pointer corrections in storage_value_registry.json. No registry row/profile/group/budget is added, removed or reordered. Derived shards/indexes are regenerated with the ignored currentness edition copied and all fifteen files SHA-256 matched. No test file is edited; the reproducible full-CLI mutation runner is an allowed scripts/ companion.

## Verification and evidence

| Command/check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm-dg6a-final-regression-check.py --output <evidence>/full-cli-mutations.json` | 0 | 221 full-command observations passed: 202 required exit-1 rejections, 19 required exit-0 successes; every family has checks 1–9. All mutated input bytes restored. |
| `python3 scripts/pm-alert-event-contracts-check.py` | 0 | pass, 437 cases, four families. |
| `python3 scripts/pm-panel-event-contracts-check.py` | 0 | pass, 180 cases, two families. |
| `python3 scripts/pm-concern-created-contracts-check.py` | 0 | pass, 272 cases, one family. |
| `pm-shard-plans.py --generate --config Plans/sharding_config.json`, then `pm-plan-index.py generate`, twice | 0 each | Only 665 registry-source shard files changed in the repair regeneration, including source-hash headers/index/manifest. No other document's shards changed. No-edit regeneration: all 3325 shards and both JSONL indexes byte-identical; only four generated_at_utc fields differ. |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | pass. |
| `python3 scripts/pm-plan-index.py validate` | 0 | Parsed top-level status=pass. |
| Full registry against `storage_value_registry.schema.json` | 0 (assertion) | 360 rows, zero schema errors. All existing profiles/groups/budgets unchanged. |
| `python3 scripts/pm-storage-profile-check.py`, final / pinned reviewed head | 1 / 1 | Exactly the same 41 unrelated errors, 360 rows / 319 profiles. |
| `python3 scripts/pm-assistant-contract-check.py` | 1 | Existing gaps_found, errors=[], 51 pending Browser rows. |
| `python3 tests/test_pm_assistant_contract_closure.py` | 1 | 41 tests; the same two known failures as the cycle-3 review: definitionless BrainStorm question bank and schedrec_envelope_record_wrong_type reason. No new lane error is claimed fixed. |
| `python3 scripts/pm-dg6a-final-regression-check.py --audit-grade-only` | 0 | 527 citations resolve; all nine stopped records identical to reviewed head. |
| `git diff --check` / staged diff check | 0 / 0 | No whitespace errors. |
| Boundary/scope audit | 0 | Registry differs only at four local pointers; old fixture expectations preserved, historical panel schemas and owner prose unchanged; zero new IDs or forbidden paths. |


Evidence lives under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix3/`; exact paths and SHA-256 values follow.

- **full-cli-mutations.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix3/full-cli-mutations.json`; SHA-256 `901cc7dfc977296d8cc4888125e652e9392af8e677be009d7cc07b8489ac873c`.
- **checks.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix3/checks.json`; SHA-256 `17f8198dd744a9339fde8d6bc8e26902bf060eeeb37ee444ed299bb612f4116b`.
- **boundary-audit.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix3/boundary-audit.json`; SHA-256 `252708b93356c688f7a72137fb9f1618801043563673de78573b0c84049c4a74`.
- **regeneration.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix3/regeneration.json`; SHA-256 `47496c03114197f76bc7074c392cd0a9a89723493401f82199fc237a6d34644c`.
- **currentness-copy.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix3/currentness-copy.json`; SHA-256 `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c`.
- **profile-reviewed.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix3/profile-reviewed.json`; SHA-256 `fc5885fa872722fec087a51bbfe1f79e9a91803254bd03e69d3eb464a3cee17f`.

Initial resources: 21 GiB available RAM, 130 GB root disk free; subsequent checks remained above 6 GiB / 50 GB. The assigned sparse detached worktree is removed after its final branch push. Temporary baseline extracts and uncited working files are deleted. Only the lane branch is pushed.

Process exceptions: an initial read-only pm-mail inbox/who call preceded reading the lane prohibition; no registration or message was sent and no further mailbox use occurred. Two interrupted harness attempts are superseded by the complete final run: one reference-length correction, then routing the exact-size alert positive through its dedicated boundary vector while preserving the compact-baseline assertion. Neither attempt is reported as a repository pass. No subagents, admission, registry append, governance refresh or main push.
