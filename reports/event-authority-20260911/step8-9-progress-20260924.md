STATUS: paused at a clean point, 2026-09-25, on Jared's instruction. The Event Authority host session (Claude Code session bae30ae2, reporting to Jared, no coordinator above) stopped after landing the first Step 9 registration. No lock is held and no work is in progress. Two reviewed branches are landing-ready and pushed, each with its worktree kept (see below). Pacing set by Jared: up to 50% of each week's usage allowance; never maximum effort (medium for surveys, high for drafting and repairs, extra-high for blind reviews and depth grading).

# DL-039 Steps 8 and 9: progress, 2026-09-25

## Landed on `main` on 2026-09-25

| What | `main` | Record | Landing check |
|---|---|---|---|
| Handover progress file | `c8acca2aa5` | `9986aeabe5` | exit 1, `main`'s staleness |
| 8(c) first half: the Browser pair adopts SP-286/CV-339 by name | `a3d6bb616b` | `1e5d9b097b` | exit 1, staleness only |
| 8(c) second half: the Browser-created v2 checkpoint is current | `bfa4c8a415` | `c98cccb257` | exit 1, staleness plus 4 `missing_ref` rows from its registry shard rename, cleared by the reseal |
| Step 9 batch 2 answers: DL-084 to DL-093 and 33 J248 rows | `bf2a9e877b` | `cd46487bf0` | exit 1, no row added |
| Step 9 batch 2: the seven coordination families' contracts prepared, no admission | `4a2135b940` | `63cf2cb97f` | exit 1, staleness only |
| **First Step 9 registration: `coordination.agent_registered`** (registry `2026-09-25.1`, 43 families; DL-094; its DL-077 admission record) | `abdf4eead` | this record's commit | see `LANDING_20260925_EA_S09_COORD_REGISTERED.md` |

**Step 9 count:** registered 1, excluded 15, carded 0, remaining 236.

## Landing-ready branches, pushed and not landed

- **`plans/ea-storage-retention-20260925` at `7401f10257`** (worktree `~/pm-worktrees/ea-storage-retention-20260925`). The Storage retention owner edit: SP-291's two application-wide buckets (DL-083 and DL-089, counted apart), the Case L-3 assignments for DL-084, DL-085, DL-086 and DL-092, one materialized policy `RP-CHAT-THREAD-LIFETIME@1.0.0` (the Chat content class; DL-047's Goal policy was not reused), the SP-266 wording note R2-01, and the 25 J248 retention cells moved to PASS under the host's confirmation. Review: `/mnt/Cursor/PM-Experiments/review-ea-storage-retention-20260925/` (cycle 1: SR-01 blocking, repaired; cycle 2 `RECHECK.md`: landing-ready, no finding). **To land:** rebase onto `main` (the admission changed storage-plan below line 17282 and the registry's coordination rows only); if storage-plan changed above 17282 or the storage value registry above line 557, re-pin the 25 row citations and the application record; regenerate derived files; landing check.
- **`plans/ea-s09-decisions-hb-scope-20260925` at `46d4eced3`** (worktree `~/pm-worktrees/ea-s09-decisions-hb-scope-20260925`). DL-095 (heartbeat expiry five minutes, `coordination_heartbeat_expiry_ms` 300000; its owner edit lands with the `coordination.agent_crashed` admission) and DL-096 (DL-093's rule covers the 18 collaborative families and every later registration). Review: `/mnt/Cursor/PM-Experiments/review-ea-s09-decisions-hb-scope-20260925/` (cycle 1 landing-ready; HS-01 to HS-05 applied one commit each). **To land:** rebase onto `main`, where DL-094 now precedes DL-095 in both sections (DL-094's pinned bytes must not change); regenerate. **Number collision:** `fix/server-pairing-issuance-20260925` and `origin/fix/server-pairing-issuance-rebased-20260925` (`73138c6a6`, another thread) carry DL-094 to DL-098 for five unrelated decisions. DL-094 is now taken on `main`, so that thread renumbers. Re-check at this branch's landing fetch; if that thread has landed DL-095 or DL-096 first, renumber here and update every reference.

## Jared's answers of 2026-09-25 (all recorded or on the branches above)

- Batch 2 cards and the Card 4 addendum: DL-084 to DL-092. Answers verbatim in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/`.
- "1-3, as the other thread": the reseal, the `.gitignore` lines and the two compaction-validator notes belong to the other (coordinating) thread; this program never reseals or edits `.gitignore`.
- DL-093 (seven coordination families), then DL-096 (every registration): each registration's own DL-078 entry is Jared's decision entry.
- The heartbeat card: five minutes (DL-095). The correction record of the question's wording is `QUESTION_WORDINGS_DL093_SCOPE.md` (SHA-256 `6c546805...`).

## Host rulings recorded today

- **R6.** A registered family's J248 row keeps every field the frozen schema or the seal check reads, and gains only a citation of its admission record (form R), with an application record.
- **Retention cells.** The landed Case L-3 assignment and Storage owner text move a J248 retention cell to PASS, as in batch 1; the family contract's `retention_policy_ref` stays an admission precondition.
- **Repeat registration.** SP-320's transition table governs (a terminal agent returns `already_terminal`).
- **Heartbeats** are runtime liveness; coordination events are appended on actual change.

## Next, in order

1. Land the two branches above.
2. The six remaining coordination admissions, one family per landing: status, operation, file ownership, unregistered, crashed (with DL-095's owner edit), aborted. Each: fresh independent depth grade (the membership criterion passes only after the registry append), DL-078 entry, DL-077 admission record, form R row, blind review, landing. Each admission adds a currentness live-source reseal item for the payload schema.
3. The Contracts retirement edits for DL-087 and DL-088, and the Run Modes clarifying line.
4. Survey round 1 is done (read-only, medium effort): maps for Section 15 (23 rows), assistant memory (20), assistant chat (18), Executor (16) and FileManager (12) in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-09-survey-round1-20260925/` (SHA256SUMS `6161665c...`). Unreviewed. They suggest cards on retention for each batch, two event-model questions (the older `browser.session.*` names against the 53 Browser names; one or two gist histories in memory), and Stop's record in chat. The maps are verified before any card is drafted; cards go to Jared one owner document per round.
5. The 18-family collaborative batch (DL-090 to DL-092) as its own batch, and the remaining owner batches in rounds, 2 to 3 worktrees at a time.

## Reseal list (the other thread, one reseal for the wave)

Everything on the list before today, plus each landing record's reseal section: the Spec Lock entries of the storage value registry, storage-plan, Contracts, Automated Testing, the readiness script and `scripts/pm_pnc019_currentness.py`; the plan-sharding bundle rows of every edited document and shard (the storage value registry's shard file list changed twice); the PNC-019 receipt pins; a currentness edition covering every edited document plus the new live source `Plans/coordination_event_payloads.schema.json`; run-002 rows and the final summary's PlanUnit count; the readiness gate report; the nightly snapshot.

## Open questions

- The `.gitignore` lines `!/tests/test_pm_coordination_events.py` and `!/tests/test_event_authority_holding_bucket.py`, for the other thread.
- The coordination prep's cycle-2 residuals R4-01 to R4-04 were fixed on the admission branch; the admission review's four notes CR-01 to CR-04 were applied.
- Earlier items still open: the Step 8 regrade (both Browser families, the compaction oracle cell), the DL-079 to DL-081 contracts, the Replan v8 dependency of `goal_run.replanned` (another thread), and the items listed in the landing records of 2026-09-24 and 25.

The host's session log is its Claude Code transcript; every landing has its record under `reports/landing-checks/LANDING_20260925_EA_*`.
