# DG6A — standing-check fix round 4

Worker: DG6A-FIX4, VM. Branch: `plans/ea-w2-gui-concerns-20261104`.
Reviewed head: `de28e8be91b347e209f8b75e25838ef3bf686f73`. Repair commit: `8142c5bfa35e47b011ae7e8ff0ae8452e30e189c`. The final report commit is self-inclusive.

Seven families are prepared without admission. Each recovers the historical-oracle cell from the cycle-4 review's PARTIAL to PASS. Membership stays ABSENT, retention stays PARTIAL / PENDING_RETENTION_DECISION, and native execution stays NOT_RUN. All nine stopped family records and their exact final question/recommendation pairs are unchanged.

## Family grades before and after

| Family | Cycle-4 independent review | Round-4 self-grade |
|---|---|---|
| `alert.acknowledged` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `alert.dismissed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `alert.rule_muted` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `alert.snoozed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `concern.created` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `panel.redocked` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `panel.undocked` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |

All other cells carry forward after current-citation verification. All 534 final citations resolve. No native or event admission is claimed.

## Review round 4: findings and responses

1. **Blocking 1 — fixed (`8142c5bfa35e47b011ae7e8ff0ae8452e30e189c`). Where:** `scripts/pm-alert-event-contracts-check.py:196,228,268,367`, `scripts/pm-panel-event-contracts-check.py:121`, `scripts/pm-concern-created-contracts-check.py:103`, each of the seven exact family's fixtures, and `scripts/pm-dg6a-final-regression-check.py:187`. **Cause:** the prior byte pager never consumed actual checkpoint publication state and original-event evidence. **Fix:** the read-only historical gate validates the actual checkpoint and independently supplied original event/payload/schema, original eleven-field receipt/four-field result, Storage/source selection and current disclosure permissions/deletion/withdrawal. It feeds only accepted refs into pagination and rechecks after the helper returns. It does not invoke current writer/retry predicates. Superseded alert/rule revision, ended panel session/closed window and already-created concern positives remain readable while the respective writer models refuse new actions. Each exact family refuses withdrawn/staged checkpoints and events, forged publications/tokens/originals/payloads/receipts/source, foreign Storage/Project/consumer context, unknown payload version and originally invalid writes. Panel v1 and v2 are dispatched by their stored payload id/version; both immutable v1 schemas are unchanged. Verify with the three family checkers and the full regression command below.

   Each historical version has 26 one-leaf negative vectors plus five returning-helper revocation cases. Every one fails for exactly its named guard, then discloses through the same reader and byte pager when only that guard is weakened. Permission includes current membership and original source access. The event `state` in this synthetic read-evidence wrapper describes publication availability, never a new EventRecord field or live owner lifecycle. Exact-16384-byte ACTUAL-checkpoint positives are tested before isolated negatives use a separately declared compact publication witness; otherwise changing current to withdrawn would also exceed the byte cap. Neither physical bounds nor state schemas are weakened. Stored withdrawn/staged states remain valid storage lifecycle values but cannot authorize disclosure.

2. **Note 2 — addressed in this report.** No generated timestamp is hand-edited and no governance artifact is refreshed. Pinned no-edit regeneration leaves all 3325 shard files and both JSONL indexes byte-identical. The same four JSON artifacts change only `generated_at_utc`: coverage_report, dependencies, doc_cards and node_readiness_report. This pre-existing timestamp exception is retained explicitly.

## Per-family standing checks

P = pass. F = fixed by `8142c5bfa35e47b011ae7e8ff0ae8452e30e189c`. † = Project-only family: an application attempt is refused; no application writer is invented. Each cell links to actual observations in `standing-checks.json` and `full-cli-mutations.json`.

| Family | 1 replay | 2 app key | 3 partition | 4 bytes/ref | 5 LF | 6 semantic | 7 context | 8 exit | 9 refs | 10 history | 11 isolation |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `alert.acknowledged` | P | P† | P | P | P | P | P | P | P | F | F |
| `alert.dismissed` | P | P† | P | P | P | P | P | P | P | F | F |
| `alert.rule_muted` | P | P† | P | P | P | P | P | P | P | F | F |
| `alert.snoozed` | P | P† | P | P | P | P | P | P | P | F | F |
| `concern.created` | P | P† | P | P | P | P | P | P | P | F | F |
| `panel.redocked` | P | P | P | P | P | P | P | P | P | F | F |
| `panel.undocked` | P | P | P | P | P | P | P | P | P | F | F |

| Check | Verification |
|---|---|
| 1 | Current writer/retry projector_replay_only remains replay_only_not_appendable; false positive-policy expectations exit 1 per family. |
| 2 | Both panel application positives use CV-366's exact application@1 lowercase UTF-8 hex recipe; malformed/unequal/uppercase/raw keys exit 1. Project-only null-Project attempts exit 1. |
| 3 | Encoded project~Zml4dHVyZQ positives remain; raw Project partition mutations exit 1 per family. |
| 4 | Schema-valid complete operations above 16384 bytes exit 1; alert exact 16384/16385 boundaries remain. All seven unchanged owner contracts use SP-337 payload refs above the EventRecord inline cap; oversized metadata is still refused. |
| 5 | Payload identifier and nested token trailing-LF mutations exit 1; existing suites exercise every authored pattern leaf with full-string guards. |
| 6 | Altered caller bodies cannot retain the same digest; changes only to assigned sequence/observed/persisted metadata cannot change it. False expectations exit 1 per family. |
| 7 | Single foreign token and coherent checkpoint/token/source Storage triple mutations exit 1, independently of the original operation. |
| 8 | A negative marked valid and a real process exit 0 supplied to the failure-oracle entry point both exit 1. All process negatives compare actual exits. |
| 9 | Every schema and embedded-schema unresolved-ref mutation exits 1; all eight permitted nonempty alert optional-array positives exit 0/status pass. |
| 10 | Actual withdrawn/staged checkpoint and event mutations, original evidence forgeries, foreign contexts and denied disclosure fail. Originally valid retained refs survive live owner changes. Both panel historical v1 readers pass the same composed suite. |
| 11 | All 279 historical negative witnesses (31 per reader version, nine versions) change exactly one leaf, fail exactly one guard and disclose only after that guard is weakened; the 18 live-change positives pass. |

## Earlier findings rerun

All **221 earlier observations pass again**, with their original required exits: 202 refusals and 19 successes. Added historical coverage produces **700/700 total observations**: 403 full CLI runs (384 exit-1 refusals, 19 exit-0 successes) and 297 composed historical/isolation observations. Mutated inputs are restored byte-for-byte in finally and SHA-256 verified.

| Earlier finding | Rerun result |
|---|---|
| A1 physical profiles | Every operation/checkpoint, both shared alert states and concern_record profile removal is refused (17 probes). |
| A2 bounded History | All seven refuse 1000 accumulated refs, persisted redb_snapshot_id and oversized complete checkpoints; exact 16384 positives pass (28 probes). Existing large-token, complete-response boundaries, unpageable ref/metadata, 1000-match and empty-filter continuation cases remain. A legitimate changed positive token carries its independently supplied matching publication witness. |
| A3 panel semantics | Generic panel, saved host, layout co-emission and historical-v1-as-current-writer mutations are refused (8 probes). |
| A4 authorized creators | Worker/User/External Resource/Recovery/Observer changes update both creator fields and recompute the full digest; all five are refused. Existing authorized creators remain positive. |
| A5 grades/citations | Each false retention-PASS and wrong CV-049 annotation citation is refused; the unmodified 534-citation/nine-hold audit passes (9 observations). |
| Full panel digests | Both unchanged-digest timestamp/transaction mutations remain refused per panel (4 probes). |
| Cycle-3 checkpoint/alert/ref findings | Exact coherent foreign triple, two 17000-byte owner refs and unused unresolved refs remain refused; permitted alert arrays remain positive. |
| A6 known authority | All nine stopped records and final question/recommendation pairs remain exact. No creator, owner or resolver privilege is added. |

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

No new PlanUnit ID or product binding is authored in round 4. Existing IDs remain **SP-660..666, CV-680..686, F3-700..705, ATS-330..334** (25 definitions). Existing exact-family owner contracts already require these historical-read fences; only their synthetic oracle composition is repaired.

Storage, Contracts, Orchestrator, Executor, FinalGUISpec and Automated_Testing_System owner docs are byte-identical to the reviewed head, as are storage/event registries, Decision Log and immutable panel v1 schemas. Previous per-family searches and checked premises remain applicable to these unchanged contracts; no old retention answer is extended and no Jared choice is taken. No admission, registry append, Decision Log, .gitignore, Spec Lock, .evidence, auto_decision, frozen validator, governance seal or main edit/push occurs. All previous writer, retry, byte and reference guards remain.

## Verification and evidence

| Command/check | Exit | Result |
|---|---:|---|
| python3 scripts/pm-alert-event-contracts-check.py | 0 | pass; 709 cases, four exact families. |
| python3 scripts/pm-panel-event-contracts-check.py | 0 | pass; 448 cases, two exact families including immutable historical v1. |
| python3 scripts/pm-concern-created-contracts-check.py | 0 | pass; 340 cases, concern.created. |
| python3 scripts/pm-dg6a-final-regression-check.py --output <evidence>/full-cli-mutations.json | 0 | 700/700 observations, all eleven checks per family and all earlier mutation probes. Executed repair head and restored input hashes are recorded. |
| Same runner --audit-grade-only | 0 | All 534 current citations resolve; nine stopped records identical. |
| pm-shard-plans.py --check / --generate / --check | 0 each | All 3325 shard files stable; 99 source documents. |
| pm-plan-index.py validate / generate / validate | 0 each | Parsed top-level status pass before/after; only four timestamp differences. |
| Boundary/input audit | 0 | Exact unchanged owner/registry/historical-schema comparisons; zero new IDs or forbidden paths. |
| git diff --check | 0 | No whitespace errors. |

The mutation runner uses the exclusive assigned worktree. Derived regeneration uses a selective pinned scratch extract to avoid reading the runner's temporarily mutated fixtures. Its first incomplete-input validation stopped before generation; the review's unchanged pinned read transport supplied missing tracked references for the complete rerun, without changing parsers, schemas, validators or assertions. That extract used 195679367 bytes and is deleted. Every ignored currentness-edition file was copied and SHA-256 matched before generation.

| Evidence | Absolute path | SHA-256 |
|---|---|---|
| `full-cli-mutations.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix4/full-cli-mutations.json` | `46abe5b46c3a7db4eca6ea533906a7c1f684f87d6d875484ea3de1274a496102` |
| `standing-checks.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix4/standing-checks.json` | `62c584227106fd9811678f448baf19fcf3cf27ecba9d2c7f12478fadc332cf35` |
| `targeted-checks.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix4/targeted-checks.json` | `3adf0208d7d539f6d200afadac8e1c0c461ac3b515bd1f1e1765998efb752527` |
| `boundary-audit.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix4/boundary-audit.json` | `41158df3c647e73282abf8cb623d31a91a3df7b30ed3626838b8bb0f1270dc3c` |
| `regeneration.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix4/regeneration.json` | `a5af23fcff8a488712e876a353ad868a299824def005aaaba27db7b1aa760a0d` |
| `history-coverage.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix4/history-coverage.json` | `5cf310a7c52524dff73cf5d833aa521fa837484429501613116af70b4c0386cd` |
| `currentness-copy.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix4/currentness-copy.json` | `1b765b9ac2ab42d60576eba5c1f1edd03454965e434717497da8cbcf32c009bf` |
| `derived-inputs.jsonl` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix4/derived-inputs.jsonl` | `02a14215862d54254884b213e6a1825d02dd1d4dec3cb80e43a957b9eaecd2d9` |
| `index-incomplete-extract.log` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix4/index-incomplete-extract.log` | `8102db82dd39e69875698e03d6a00cb906b13f09129d6bf680cfe2f1e1dfe06d` |

Initial resources were 18 GiB available RAM and 89 GB root disk free; repeated checks remained above the required 6 GiB / 50 GB thresholds. Only the lane branch is pushed. The sparse detached worktree is removed after final push and evidence copies. No pm-mail, subagent, browser or server was used. Remaining open facets are the allowed pending admission/retention, native NOT_RUN, and the same nine Jared decision holds.
