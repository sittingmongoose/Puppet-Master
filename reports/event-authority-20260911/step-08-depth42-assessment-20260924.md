# Step 8(a): current depth of the 42 registered families, 2026-09-24

This replaces the dated 39-family matrix (`step-08-depth-assessment.json`, 2026-09-11) as the current depth picture. It grades all 42 families of `Plans/event_family_registry.json` at revision `2026-09-11.2` (SHA-256 `0be544181eda423dcea4d8661206e7da6d066fdcf51913d5962f1a283635c842`, the checkpoint Jared approved on 2026-09-23). It uses the twelve criteria of the Browser pair assessment, with a stricter producer rule (SP-286 adoption by name, `storage-plan.md` 22035-22036) that the Browser pair assessment did not apply, against the owner text on `main` `f1ce058ccd`. The text is identical at `792d2fb8b1`, because the reseal changed only governance artifacts. At this branch's current base (`main` `ac9c0ad2e4`) every cited line is still byte-identical. Only the three DL-076 citations moved, from `Decision_Log.md` 5775 to 5997, when DL-077 to DL-083 were inserted above them.

It grades what canon says. It is not a runtime result. Native execution is NOT_RUN for every family, and that alone never lowers a grade. The machine-readable file is `step-08-depth42-assessment-20260924.json` (SHA-256 below).

## Result

| | PASS | PARTIAL | CONFLICT | ABSENT | Cells |
|---|---:|---:|---:|---:|---:|
| All 42 families | 335 | 144 | 13 | 12 | 504 |
| The 39 families of the dated matrix, then (2026-09-11) | 201 | 186 | 42 | 39 | 468 |
| The same 39 families, now | 304 | 139 | 13 | 12 | 468 |

- **Normatively complete (12 of 12):** `goal.created`, `restore_point.deleted` and `run.started`.
- **One criterion short (11 of 12):**
  - `restore_point.created`: oracles; capture-category assignment is undefined, so it cannot be tested.
  - `restore_point.expired`: oracles; its pinned suite still stores `redb_snapshot_id`, which DL-076 forbids.
  - `storage.integrity_detected`: oracles; the owner says the full-u64 adapter is missing.
  - `storage.retention_hold_changed`: transitions; post-restore acceptance of new hold commands is not supplied.
  - `workspace.layout_changed`: oracles; its pinned suites store `redb_snapshot_id`.
  - `context.compaction.completed`: oracles; the PM7 GUI validator still rejects the family.
  - `browser.workspace.reset`: producer; SP-286 is not adopted by name.
- **Dispositions:** 27 current writers, 7 historical-only, 8 with no current disposition.
- **Answers since the grading:** Jared answered its product cards on 2026-09-24 (DL-079 to DL-083; one deferred). They are applied to the gaps and notes of 11 rows by `step-08-depth42-card-answers-20260924.md`. No grade or disposition changes until the owners write those answers into their text.

The dated matrix counted differently, so the rows above are not a straight trend. Against it, the 468 old cells moved like this:
- **Up to PASS: 133.** From PARTIAL 92, from CONFLICT 26, from ABSENT 15. The owner work since 2026-09-11 did this: the per-family supplements, the v3 Goal adoptions, the historical-only rulings, the shared wire, first-receipt and full-value definitions, and DL-076.
- **Better but still short: 15.** ABSENT to PARTIAL 12, CONFLICT to PARTIAL 3.
- **Unchanged: 290.** PASS 171, PARTIAL 94, CONFLICT 13, ABSENT 12.
- **Lower: 30, all PASS to PARTIAL, and no canon was removed.** The rubric applies rules the old matrix did not apply, and each lowered cell names its rule in its `change_reason`:

  | Rule | Canon basis or rubric clause | Cells |
  |---|---|---:|
  | First-receipt recovery adopts SP-286 by name | `storage-plan.md` 22035-22036 | 1 |
  | An exact event-ID and idempotency-key recipe | `Contracts_V0.md` 1008, 1016, 1028 | 8 |
  | DL-076 holds for oracle suites an owner unit pins | `Decision_Log.md` 5997; rubric clarification 2 | 2 |
  | Untestable boundary or prose-only oracles | rubric criterion 12 | 10 |
  | Facet the owner itself leaves open | `storage-plan.md` 23548 and 22924; SP-292 | 6 |
  | Stale or disclaiming owner anchor | rubric clarification 1(a) and 1(b) | 2 |
  | Missing transition ordering barrier | rubric criterion 9 | 1 |
  | Total | | 30 |

  Against later supplements, 4 more cells fell to PARTIAL: the producer cells of both Browser families (against the Browser pair assessment, under the stricter producer rule), `workspace.layout_changed` oracles (against the Home supplement, DL-076) and `context.compaction.completed` oracles (against Step 6, the PM7 GUI validator).

## Method

- **Rubric.** Twelve criteria and four statuses, with explicit rules for:
  - SP-278 adoption, with DL-076's nine-field durable token;
  - SP-286/CV-339 first-receipt adoption;
  - the shared SeglogFrameV2 bytes;
  - historical-only families.

  Three clarifications were added during grading.
  1. An anchor that resolves to a generic Storage persistence section governing every family (Case L-5) is an acceptable payload route, and a whole-document semantic anchor is acceptable when the document holds the governing text. An anchor grades PARTIAL only when (a) it resolves to text that is stale for the registered version, or (b) it resolves to text that explicitly disclaims the role it is anchored for, and in either case the governing text cannot be reached from it.
  2. Pinned external oracle suites count, unless a later owner amendment contradicts them.
  3. DL-076 applies to every stored token.

  The rubric is in the evidence directory.
- **Grading.** Six read-only passes by owner batch:
  - GA: Goal current writers.
  - GB: Goal historical-only families.
  - GC: undispositioned Goal families.
  - R: restore, Executor and Platform.
  - S: Storage.
  - N: August and newly admitted families.

  Every cell cites current line ranges with an exact quote. The input packs carried each family's registry row, the dated matrix cells and every later supplement's cells, and all of those were treated as prior evidence to re-check, never as answers.
- **Verification.** All 2,630 quotes were checked mechanically: every one is an exact substring of its cited lines. Each cited range's SHA-256 is recorded, and the quotes themselves are in the evidence bundle. The 42 rows match the registry exactly, in order.
- **Harmonization.** The batch results were compared criterion by criterion. Producers pass only where recovery through the first receipt adopts SP-286 by name, and N applied this to both Browser families as R and S did. The rule applies where publication or the returned result waits on the AppendReceipt (Section 15, 11626-11628). It does not apply where visibility rests on a verified seglog marker and recovery never needs the receipt (`storage-plan.md` 19298-19300); this decides compaction PASS and Browser reset PARTIAL. Consumers with an explicit `none_required` checkpoint pass where the owner names each reader, adopts SP-278 and stores no token. `context.compaction.completed` passes consumers through the rubric's equivalent-complete-checkpoint route (`storage-plan.md` 19304-19306) without naming SP-278; it is the only family that route decides. They stay PARTIAL where the owner itself flags a missing operating consumer (the historical-only families) or names only a generic consumer.
- **Static suites** run on the assessed tree: Browser created 63 OK, Browser reset 53 OK, Browser admission 38 OK, restore phase contracts 10 OK, event-index binding 14 OK, emit-only boundaries 13 OK, holding bucket 13 OK, Goal lineage 1 OK and vocabulary migration 9 OK. PNC-019 currentness gave 8 OK and 1 failure on `f1ce058ccd`, because the shared currentness edition had already been rewritten for the reseal; it gives 9 OK on `792d2fb8b1`.

## Per family

P = PASS, p = PARTIAL, C = CONFLICT, A = ABSENT. Columns follow the rubric order.

| Family | Disposition | Mem | Own | Prod | Schema | Scope | Replay | Ret | Custody | Trans | Cons | Compat | Oracles | PASS |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---:|
| `goal_run.blocked` | undispositioned | P | P | p | C | p | p | P | p | p | A | p | p | 3 |
| `goal_run.cancelled` | current writer | P | P | P | P | P | P | P | P | P | P | p | p | 10 |
| `goal_run.certified` | current writer | P | p | P | P | P | P | P | P | P | P | P | p | 10 |
| `goal_run.replanned` | undispositioned | P | P | p | C | p | p | P | p | p | A | p | p | 3 |
| `goal_run.started` | current writer | P | P | P | P | P | P | P | P | P | P | p | p | 10 |
| `goal_run.stopped` | undispositioned | P | P | p | C | p | p | P | p | p | A | p | p | 3 |
| `goal.blocked` | undispositioned | P | P | p | C | p | p | P | p | C | A | p | p | 3 |
| `goal.cancelled` | current writer | P | P | P | P | p | P | P | P | P | P | p | p | 9 |
| `goal.child_status_changed` | historical only | P | P | p | P | P | P | P | P | P | p | P | p | 9 |
| `goal.completed` | undispositioned | P | P | p | C | p | p | P | p | C | A | p | p | 3 |
| `goal.created` | current writer | P | P | P | P | P | P | P | P | P | P | P | P | 12 |
| `goal.degraded` | historical only | P | P | p | P | P | P | P | P | P | p | P | p | 9 |
| `goal.evidence_captured` | undispositioned | P | P | p | C | p | p | P | p | C | A | p | p | 3 |
| `goal.progressed` | historical only | P | P | p | P | P | P | P | P | P | p | P | p | 9 |
| `goal.receipt_recorded` | undispositioned | P | P | p | C | p | p | P | p | C | A | p | p | 3 |
| `goal.replanned` | historical only | P | P | p | P | P | P | P | P | P | p | P | p | 9 |
| `goal.scheduled` | historical only | P | P | p | P | P | P | P | P | P | p | P | p | 9 |
| `goal.stopped` | historical only | P | P | p | P | P | P | P | P | P | p | P | p | 9 |
| `goal.tool_check_recorded` | undispositioned | P | P | p | C | p | p | P | p | C | A | p | p | 3 |
| `goal.updated` | current writer | P | P | p | P | p | P | P | P | P | P | P | p | 9 |
| `goal.verification_decided` | historical only | P | P | p | P | P | P | P | P | P | p | P | p | 9 |
| `platform.capability_evaluated` | current writer | P | P | P | P | P | P | p | P | P | p | P | P | 10 |
| `restore_point.applied` | current writer | P | P | p | P | p | p | P | p | P | A | p | p | 5 |
| `restore_point.corrupt` | current writer | P | P | p | P | p | p | P | p | p | A | p | p | 4 |
| `restore_point.created` | current writer | P | P | P | P | P | P | P | P | P | P | P | p | 11 |
| `restore_point.deleted` | current writer | P | P | P | P | P | P | P | P | P | P | P | P | 12 |
| `restore_point.expired` | current writer | P | P | P | P | P | P | P | P | P | P | P | p | 11 |
| `run.started` | current writer | P | P | P | P | P | P | P | P | P | P | P | P | 12 |
| `safe_point.recovery_unavailable` | current writer | P | P | p | P | p | p | P | p | P | p | p | p | 5 |
| `seglog.event_appended` | current writer | P | p | P | P | P | P | P | P | P | P | P | p | 10 |
| `storage.boot_recovery` | current writer | P | P | P | P | P | P | p | P | p | p | P | p | 8 |
| `storage.compaction_lifecycle_changed` | current writer | P | P | P | P | P | P | p | P | P | p | P | p | 9 |
| `storage.deletion_lifecycle_changed` | current writer | P | P | p | P | p | p | P | P | P | A | p | p | 6 |
| `storage.integrity_detected` | current writer | P | P | P | P | P | P | P | P | P | P | P | p | 11 |
| `storage.recovery_applied` | current writer | P | P | P | P | P | P | p | P | P | p | P | p | 9 |
| `storage.retention_hold_changed` | current writer | P | P | P | P | P | P | P | P | p | P | P | P | 11 |
| `storage.value_quarantine_changed` | current writer | P | P | p | P | p | p | P | p | P | A | p | p | 5 |
| `workspace.layout_changed` | current writer | P | P | P | P | P | P | P | P | P | P | P | p | 11 |
| `terminal.workgroup_moved` | current writer | P | P | p | P | p | p | P | p | P | P | P | p | 7 |
| `context.compaction.completed` | current writer | P | P | P | P | P | P | P | P | P | P | P | p | 11 |
| `browser.workspace.created` | current writer | P | P | p | P | P | P | P | P | P | p | P | p | 9 |
| `browser.workspace.reset` | current writer | P | P | p | P | P | P | P | P | P | P | P | P | 11 |

## What is left, by kind

Each row of the JSON lists its own gaps, naming the owner unit that would close each one. Most of them fall into eight groups:

1. **Producers that recover through the first receipt without adopting SP-286 by name.** `browser.workspace.created` and `browser.workspace.reset`, `restore_point.applied` and `restore_point.corrupt`, `safe_point.recovery_unavailable`, `storage.deletion_lifecycle_changed` and `storage.value_quarantine_changed`. Several of these also lack an exact emitter and an ordering of commit, append and publication.
2. **No event-ID or idempotency-key recipe.** `goal.updated`, `goal.cancelled`, the two restore families above, `safe_point.recovery_unavailable`, `terminal.workgroup_moved` (deferred to its companion schemas) and the two Storage lifecycle families.
3. **No explicit withdrawal protocol.** `goal_run.started`, `goal_run.cancelled`, `goal.cancelled`, `restore_point.applied` and `restore_point.corrupt`, `safe_point.recovery_unavailable`, and the Storage deletion and quarantine families.
4. **No consumer, checkpoint or SP-278 adoption.**
   - ABSENT: the eight undispositioned Goal families, `restore_point.applied`, `restore_point.corrupt`, and the Storage deletion and quarantine families.
   - PARTIAL: the seven historical-only readers, which name no operating consumer; `platform.capability_evaluated`, whose read-through output is not closed and whose aggregate use is unavailable; `safe_point.recovery_unavailable`, where SP-278 is not adopted; `browser.workspace.created`, whose registered v1 checkpoint lacks the SP-278 token (Step 8(c)); and the Boot, recovery and compaction-lifecycle families, which have only generic consumers.
5. **Pinned oracle suites that predate DL-076.** They still store `redb_snapshot_id` in a persisted token: the external suites pinned by SP-270 (seglog), SP-273 (Home) and SP-275 (restore expiry). Re-freezing and repinning them closes three oracle cells.
6. **Owner-anchor routing.**
   - `seglog.event_appended`: its semantic anchor (storage section 2.2.5) disclaims producer semantics and does not lead to SP-270.
   - `goal_run.certified`: its anchors still describe v2. Step 8(d) closes this with a routing edit (`plans/ea-certified-anchors-20260924`); the registry row is unchanged.
7. **The eight undispositioned Goal families.** No current-writer contract and no historical-only ruling cover `goal.blocked`, `goal.completed`, `goal.evidence_captured`, `goal.receipt_recorded`, `goal.tool_check_recorded`, `goal_run.blocked`, `goal_run.replanned` or `goal_run.stopped`. Their v2 schemas and transitions conflict with Goal V2 (13 CONFLICT cells). Jared answered the product part on 2026-09-24: DL-079 makes `goal.evidence_captured`, `goal.receipt_recorded` and `goal.tool_check_recorded` read-only history, and DL-080 gives `goal_run.blocked`, `goal_run.replanned` and `goal_run.stopped` current events. `goal.blocked` and `goal.completed` were owner work already. All eight stay undispositioned until the owners write those contracts.
8. **Owner-flagged open facets.** Examples:
   - Hold: post-restore acceptance of new hold commands.
   - Boot: post-restore continuity.
   - Integrity: the full-u64 adapter.
   - Restore created: capture-category assignment.
   - Goal updated: the agent-proposed approval provider.
   - Terminal move: pending/result companion schemas.
   - Platform: the empty active catalog, which DL-082 defers to build time.

## Step 8(c): Browser-created

It is still PARTIAL on producer, consumers and oracles. The conditional v2 checkpoint landed (`22e516b456`), but it is `conditional_not_admitted`, and Section 15 keeps the v1 reader as "the current route until the v2 replacement". The companion itself names what closes it: register the v2 value in the storage value registry, add the row to the section 2.3.1 read-token list, and amend SP-266, Section 15 and SMPFS-167, the v2 schema's status markers and the event authority binding, so that v2 becomes the specified current definition. Installation on a real store stays a native StorageMigrationCoordinator step. Adopting SP-286 for its producer closes the third cell, and `browser.workspace.reset` needs the same adoption. This is being prepared as its own branch.

`terminal.workgroup_moved` is graded with SMPFS-170 and SP-319 (landed `566576ea55`): 7 PASS and 5 PARTIAL. SMPFS-170 itself keeps the producer disabled until its pending/result companion schemas, custody, SIR delegation and migration exist.

## Step 8(b): what the external source packages gate

- **Replan v8** (`pm.executor.workflow_source.all_writers.v8`, the Replan Stop route, native v8 installation into Plans, and consumer adoption from v7 to v8):
  - It would give `goal_run.replanned` a current writer, and with it possibly `goal_run.blocked` and `goal_run.stopped`. GRS-085's mandatory projection halts on unsupported same-run replanned, blocked or stopped rows.
  - These are three of the eight undispositioned families, together 27 non-PASS cells.
  - Canon disagrees on whether a current `goal_run.replanned` writer exists. The 2026-09-21 scope adjudication found no new product decision, because GRS-026 and D-R19 carry Replan. This grading found that EP-118, GRS-082 and the Workflow source list no writer.
  - DL-080 (2026-09-24) settles the product side: the three become current events, `goal_run.replanned` after this source work. The package is therefore needed; when it is done is not decided here.
- **Original capture for restore-point corruption** (79 external packages): it gates `restore_point.corrupt`'s producer, scope, replay, custody, transitions, consumers, withdrawal and oracles (8 cells). It also touches `restore_point.created`'s oracle cell, through capture-category assignment.
- **Compaction currentness:** done here. All 23 cited Step 6 lines are byte-identical, and 20 of them moved. Only the oracle cell changed, to PARTIAL, because of the PM7 GUI validator.

## Product questions this grading surfaced, and their answers

Jared answered the cards (`step-08-depth42-product-cards-20260924.md`) on 2026-09-24. His answers are in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260924/ANSWERS_DEPTH_GRADING.md` (SHA-256 `cfea2eb818663d22eba69dca9296657aa05c51383a470bc1796b87aef65b923c`). They are recorded as DL-079 to DL-083 and applied to this assessment by `step-08-depth42-card-answers-20260924.md`. Each changes the owner work that is left, not a grade.

- The Goal owner: for each of `goal.evidence_captured`, `goal.receipt_recorded`, `goal.tool_check_recorded`, `goal_run.blocked`, `goal_run.replanned` and `goal_run.stopped`, should it get a current writer or a historical-only ruling? `goal.blocked` and `goal.completed` are required current names (Goal V2 events), so their successors are owner work, not a product choice.
  - **Answered:** DL-079 makes the first three read-only history, in the pattern of the four retired on 2026-09-12. DL-080 gives the three `goal_run` states current events: stopped and blocked first, replanned after the Replan source work.
- `goal.completed`: may a Goal complete on an approved verification exception? GRS-065 calls that route "separately unbound".
  - **Answered:** DL-081 keeps the exception route. The user who owns the project approves each exception through the existing approval flow, naming the residual risks, and the finish is labelled "completed with approved verification exception". The route contract is owner work.
- `platform.capability_evaluated`: when is a first capability admitted to the active catalog, which is empty today?
  - **Deferred:** DL-082 records no answer. Jared defers filling the catalog to build time, as part of the building process and likely as one of the worknodes. The family stays registered and dormant. This is a follow-up for whoever owns the worknode work.
- The Storage retention policy that Boot, recovery, compaction lifecycle and Platform capability evaluation share counts cardinality per project, but the first three are application-only and Platform can be application-scoped; SP-291 calls this an "unproved policy-owner adapter seam".
  - **Answered:** DL-083 counts them in one application-wide bucket with the same cap and overflow rule. The four retention cells stay PARTIAL until the Storage retention owner writes that into the SP-291 policy text.

## Queue adjudication (the other half of Step 8)

The 2026-08-13 queues are fully reviewed: 75 likely, 9 contested and 153 ambiguous tokens (`step-08-review-packet.md`). Their product cards are answered as DL-041, DL-042 and DL-071 to DL-073, and the remaining unresolved tokens stay in the DL-039 holding bucket. Nothing in the queues is pending.

## Evidence

| Artifact | SHA-256 |
|---|---|
| `step-08-depth42-assessment-20260924.json` (this assessment) | `ff7dbd59b678aa53f311e5c6727ea5835e2a03c398d9b5d4639d52957f73e30e` |
| Evidence directory `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-08-depth42-20260924/`, `SHA256SUMS` | `725ac105851008a3f8a0863dd6efb63752e6b15612ba520a890b22a33d99bdbb` |
| `rubric.md` | `81f1d8b25ee407975fea50d14ecf44f94127608b912e08b27edd7f62f9b10221` |
| `compiled_rows.json` (every cell with its quotes) | `d5ba83aa6d1a837a1cc345a5aeae077c31d06838e257b9f49f4973cdbb4aaa5b` |
| `verify.json` (2,630 quote checks) | `0a80bee7ac889c228140bd77ea41031b3993bc6e4f47a930dc557cd03a9d37f3` |
| `compile_depth42.py` | `b22b2d1541d2626be06190ca042ce2ed3e99fce5fbb2e4f1e496b8f38c9785b8` |
| `build_report.py` | `76936f33faf3124d2ada90eee09e56c1d6713f9fa12037909b0131a97f350573` |
| Handover currentness pass, `depth_currentness2.json` | `4d19bc83b11638fd25960db9d40412b96d85940db1c5f79eb9671f85105a17f0` |

The handover's excerpt-currentness pass (136 cells carrying, 332 to re-grade) was the starting point. Every one of the 504 cells was re-graded against current text, so the 136 carried cells were re-read as well.

## What this does not do

It changes no canon, registry, checkpoint, validator or governance artifact, and it admits nothing. The PNC-019 currentness helper still reports depth as not complete, and only Step 10 re-certification changes that. The dated matrix stays as lineage. Step 9's count is unchanged by this report.
