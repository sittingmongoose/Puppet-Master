# Step 9 procedure record (the J248 campaign), 2026-09-24

This is the tracked record of how Step 9 is run. It restates the Step 9 text of the DL-039 step list and adds the rules Jared has set since. The step list itself is `Plans/.audits/event-authority-2026-08-12/NEXT_STEPS_20260910.md`. It is git-ignored and pinned by SHA-256 `85dde9aaaef7c1834fe6df3a5ad5ffed2f383bd0c1cfddf32b0985d789d150e1`; a byte-identical copy is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step04-current/NEXT_STEPS_20260910.md`. That file is not edited. Where this record and the step list differ, the Decision Log entries cited here govern.

## Scope and outcomes

The campaign covers the 252 stored-but-unregistered events that DL-039 quarantined as an interim stance (`J248-VETO-BATCH-252` = `CONFIRM_ALL_QUARANTINE_NO_ADMIT`). Every row ends with exactly one outcome, backed by cited Plans evidence:

- **Registered:** its full Event Authority contract is written and it is admitted to `Plans/event_family_registry.json` through the Storage owner, one family per landing.
- **Excluded:** it is shown not to be a persisted event (prose-only, an alias of a registered family, retired, or answered as not persisted), and the exclusion is recorded with its evidence.
- **Carded:** registering it needs a product choice (a feature that may not exist, a retention policy, an owner conflict). It goes to Jared as a plain-language decision card in the DL-036 form, batched by owner document, never one card per row unless the rows are genuinely different questions.

Rows the review marked TECHNICAL_BLOCKED are unfinished technical work. They are finished, not re-asked: missing payload, producer, checkpoint or replay bindings are not grounds for a card. No bulk registration, no inference from a sibling row, and no row left in quarantine silently (DL-039).

## Per batch

1. One branch per owner batch, organized as `step-09-review-packet.md` groups them, starting from the current `main` in a sparse worktree.
2. For each row, re-read its row report (`step-09-execution-rows.jsonl`, `step-09-extensions-rows.jsonl` or `step-09-interaction-rows.jsonl`) and the current owner text, then reach exactly one outcome.
3. A new binding identifier is authored only under DL-045 (the 285-family scope) or DL-046 (the 53 Browser names): only after a documented per-family search of current canon, with citations to existing partial contracts and scoped negative evidence, and labelled a newly authored owner contract.
4. The batch report lists every row's outcome with its evidence, the commits, the checks run and their counts, and the running count of registered, excluded, carded and remaining.
5. Before landing, a blind form-driven review runs. The coordinator dispatches the reviewer; one review and at most one repair cycle, then open points are written down (DL-066).
6. Landings go one at a time under the landing lock, after the coordinator's go.

## Per registration

A family is admitted only with its complete contract: exact payload schema (closed), scope and identity joins, producer, consumers and projector, checkpoint key and version, custody, retention and oracles, with all twelve depth criteria passing on current owner text. Then:

1. **Its own Storage admission landing, one family per landing.** The landing adds the registry row, advances the registry revision, and writes the family's admission record in the DL-077 form: the Decision Log entry that admits it, the registry revision and SHA-256 before and after, and the current depth assessment with all twelve criteria passing.
2. **The checkpoint moves in the same landing, under DL-078's standing rule.** A registration that has passed this whole procedure (full contract, blind review, its own Storage admission landing with one family per landing, and the coordinator's landing go) moves the approved PNC-019 checkpoint in that landing:
   - `EVENT_FAMILY_REGISTRY_REVISION` and `EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT` in `scripts/pm_pnc019_currentness.py`, with their provenance comment, move to the new registry revision and family count;
   - the two test pins in `tests/test_pm_testing_session_events.py` and `tests/test_pm_github_project_integration.py` move with them;
   - the readiness projections are regenerated with the Step 4 commands (`pm-implementation-readiness.py generate`, `pm-plan-index.py generate`, `pm-implementation-readiness.py generate`);
   - a Decision Log entry records the new registry revision and SHA-256 and cites DL-078. The Decision Log entry each such landing adds names the family and is the decision entry its DL-077 admission record cites.

   Any other registry change still needs Jared's own checkpoint approval, and so does a registration that skipped any part of this procedure. Jared can revoke the rule at any time, which returns to one approval per registration.
3. The row's disposition records are updated in the same landing, with the admission record cited.

## Per exclusion

Record `RECLASSIFY_TO_EXCLUDED` on the row in `Plans/.audits/event-authority-2026-08-12/individual-disposition/` and on its line in the census adjudication ledger, citing the owner text and any Decision Log answer. Keep the legacy bucket and cohort pins, since the frozen schema has no J248 exclusion category, and claim no denominator removal. Write an application record with before and after hashes, as batch 1 did (`step-09-card-answer-application-20260924.json`).

## Standing constraints

- One family per registration landing; no bulk registration (DL-039, DL-045, DL-046).
- No invented consumer, projector or checkpoint identifiers outside DL-045 and DL-046.
- No validator edits except DL-039's holding-bucket change and DL-077's admission-record amendment, each receipted; no restamping of freeze digests or closure hashes.
- Product choices go to Jared as DL-036 cards; decisions already recorded in DL-035, DL-036 and DL-039 onward are not re-asked.
- Retention for the 19 `runtime_artifact.*` families is settled by DL-075 (`RP-AUTHORITY-INDEFINITE` at admission); their full contracts are still Step 9 work.

## Count

| Date | Registered | Excluded | Carded | Remaining |
|---|---:|---:|---:|---:|
| 2026-09-11 (review packet) | 0 | 6 | 20 | 226 |
| 2026-09-24, batch 1 (DL-074 and DL-075 applied to their 20 rows), on branch `plans/ea-step09-card-answers-20260924`, counted here once it lands | 0 | 7 | 0 | 245 |
