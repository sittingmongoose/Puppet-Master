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
5. Before landing, one blind form-driven review runs, dispatched by the coordinator. One bounded repair round addresses its blocking findings, and a re-review limited to the rows the repair touched finds no blocking finding; findings still standing after that are written down as open questions (DL-066's bound, applied here to Step 9 batches). A batch with an unrepaired blocking finding does not land.
6. Landings go one at a time under the landing lock, after the coordinator's go.

## Per registration

A family is admitted only with its complete contract: exact payload schema (closed), scope and identity joins, producer, consumers and projector, checkpoint key and version, custody, retention and oracles, with all twelve depth criteria passing on current owner text. Then:

1. **Its own Storage admission landing, one family per landing.** The landing adds the registry row, advances the registry revision, and writes the family's admission record in the DL-077 form: the Decision Log entry that admits it, the registry revision and SHA-256 before and after, and the current depth assessment with all twelve criteria passing.
2. **The checkpoint moves in the same landing, under DL-078's standing rule.** A registration that has passed this whole procedure (full contract, blind review, its own Storage admission landing with one family per landing, and the coordinator's landing go) moves the approved PNC-019 checkpoint in that landing:
   - `EVENT_FAMILY_REGISTRY_REVISION` and `EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT` in `scripts/pm_pnc019_currentness.py`, with their provenance comment, move to the new registry revision and family count;
   - the two test pins in `tests/test_pm_testing_session_events.py` and `tests/test_pm_github_project_integration.py` move with them;
   - following the Step 4 and Step 8 precedent as clarified on 2026-09-24 (procedure, not part of Jared's answer), the derived plan index is regenerated with `pm-plan-index.py generate` after the shard regeneration; `pm-implementation-readiness.py generate` is not run at a registration landing, and the gate report it writes is reported as stale in the reseal request;
   - a Decision Log entry records the new registry revision and SHA-256 and cites DL-078. The Decision Log entry each such landing adds names the family and is the decision entry its DL-077 admission record cites.

   Any other registry change still needs Jared's own checkpoint approval, and so does a registration that skipped any part of this procedure. Jared can revoke the rule at any time, which returns to one approval per registration.
3. The row's disposition records are updated in the same landing, with the admission record cited.

## Per exclusion

Record `RECLASSIFY_TO_EXCLUDED` on the row in `Plans/.audits/event-authority-2026-08-12/individual-disposition/` and on its line in the census adjudication ledger, citing the owner text and any Decision Log answer. Keep the legacy bucket and cohort pins, since the frozen schema has no J248 exclusion category, and claim no denominator removal. Write an application record with before and after hashes, as batch 1 does (`step-09-card-answer-application-20260924.json`, landed with batch 1 at `41fbecb612`).

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
| 2026-09-24, batch 1 (DL-074 and DL-075 applied to their 20 rows), landed at `41fbecb612` (landing record `bc1d99c11e`) | 0 | 7 | 0 | 245 |
| 2026-09-25, batch 2 card answers (DL-084, DL-085 and DL-086 decide retention for 25 rows, which stay technical work with their retention cells FAIL until the Storage owner binding lands; DL-087 and DL-088 exclude the 6 crew lifecycle rows and the 2 spawn request rows as retired; the 7 coordination rows had no card), landed at `bf2a9e877b` (landing record `cd46487bf0`) | 0 | 15 | 0 | 237 |
| 2026-09-25, the first registration: `coordination.agent_registered` is registered at registry revision `2026-09-25.1` (43 families) under DL-078, with DL-094 as its decision entry and its DL-077 admission record `reports/event-authority-20260911/admission-records/coordination.agent_registered.json`; its J248 row cites the record and otherwise stays as written (R6 form R); on `plans/ea-s09-coord-registered-20260925`, not yet landed | 1 | 15 | 0 | 236 |

DL-090 and DL-091 (2026-09-25) add 18 collaborative workflow families to the campaign as new scope outside the 252: the 17 names of `Plans/Collaborative_Workflows.md` section 13 and `collaboration.failed`. They are worked as their own batch and are not counted in this table.

## Open questions from the review

The blind review of this record and of DL-077 and DL-078 ran two cycles, its cap, and found the branch landing-ready (`/home/sittingmongoose/PM-Experiments/review-dl077-078-20260924/`, re-check in `RECHECK.md`). The points below still stand. They are recorded here, not argued further, and none of them changes an answer Jared gave.

1. **Re-review scope and the deterministic checks (D-05).** Step 5 of "Per batch" says "a re-review limited to the rows the repair touched". DL-066 defines the scope as "the rows the repair changed and the rows it was supposed to change", so that a repair that did not repair is caught. Step 5 also leaves out DL-066's requirement that the deterministic checks pass before the review and again after the repair. The review proposes replacing the clause with "a re-review limited to the affected rows (the rows the repair changed and the rows it was supposed to change) finds no blocking finding" and adding "The deterministic checks pass before the review and again after the repair." Until step 5 is changed, DL-066's own wording is the rule.
2. **The label of the first element of an admission record (D-02).** Step 1 of "Per registration" calls it "the Decision Log entry that admits it"; DL-077 says "Jared's decision entry for that family". The last sentence of step 2 makes them the same entry, so only the label differs. That sentence, in step 2 and in DL-078 ("is the decision entry its DL-077 admission record cites"), is the coordinator's reading of item 2 of the card, and unlike the readiness sentence it is not labelled as a reading. If Jared should see that reading, it goes to him.

   **Answered for the seven coordination families (2026-09-25), recorded in DL-093.** The host put this reading to Jared for the seven coordination admissions as its question 4, and he answered "4 i approve": the Decision Log entry each registration landing of the seven coordination families adds under DL-078, which names the family, is Jared's decision entry for that family in the DL-077 sense, and the family's admission record cites it. So for those seven, step 1's label and DL-077's name the same entry. Neither DL-077 nor DL-078 is edited, and no other Step 9 requirement changes. For every other Step 9 registration D-02 stays open.
3. **DL-077's canonical text (D-08).** DL-077's prose says DL-039's "passes without modification" "is read as passing with only the DL-039 holding-bucket change and this amendment". Its `canonical_text` still says "DL-039's seal condition now reads as passing with the holding-bucket change and this amendment and no other modification". The `canonical_text` should be aligned with the prose in a later Decision Log edit.
4. **Readiness regeneration at a registration landing (D-07).** `.claude/CLAUDE.md` and `AGENTS.md` reserve readiness artifacts to the designated Plans agent: "Governance reseals (`Plans/Spec_Lock.json`, `Plans/.evidence/**`, readiness artifacts) are done only by the designated Plans agent, never as part of ordinary work." Step 2 of "Per registration" has each registration landing run the Step 4 commands. What they write:
   - `pm-implementation-readiness.py generate`, run first and last, writes one file: `Plans/.implementation_readiness/buildability_gate_report.json`. It sits in the readiness artifact directory beside `readiness_blockers.jsonl`, `readiness_matrix.json` and the PNC-019 certification receipt, and the 2026-09-24 reseal (`792d2fb8b1`) regenerated it with the readiness projections. It is one of the reserved, evidence-side readiness artifacts.
   - `pm-plan-index.py generate` writes the derived index under `Plans/.plan_index/`: `plan_units.jsonl`, `doc_cards.json`, `dependencies.json`, `acceptance_units.jsonl`, `coverage_report.json` and `node_readiness_report.json`. Every Plans edit regenerates these as ordinary work. `node_readiness_report.json` is the derived index report.

   The Step 4 (`c423c3890d`) and Step 8 (`3d391fd297`) checkpoint landings committed both kinds. Open for the coordinator: whether a registration landing may write `buildability_gate_report.json` itself, or leaves it to the designated Plans agent's next reseal and reports it as stale. No Step 9 registration has landed, so nothing depends on the answer yet.

   **Ruling (2026-09-24), recorded in DL-078.** Clarified on 2026-09-24 by the coordinating thread (PM Low cost/complexity process), applying the reseal scope in `.claude/CLAUDE.md`, in answer to review question D-07: at a registration landing the Step 4 commands are the shard regeneration and `pm-plan-index.py generate`, which write only derived files. `pm-implementation-readiness.py generate` and the gate report it writes, `Plans/.implementation_readiness/buildability_gate_report.json`, are left to the reseal by the designated Plans agent, and the landing reports the gate report as stale in its reseal request. The Step 4 and Step 8 checkpoint landings that wrote it predate that reseal scope and stay as history, not precedent.
5. **DL-077's Name line (D-12).** It still reads "Letting the seal check accept families you approved after August", in the second person, while the Question now speaks of Jared in the third person. A later Decision Log edit can align it.
6. **The card's Answer line (D-09, a note).** The card copy `step-10-validator-live-set-card-20260924.md` keeps its blank Answer line. The answer is recorded in DL-077, DL-078 and the two `approved_recorded` rows of `decision-responses.jsonl`; the DL-068 to DL-075 cards on `main` are kept the same way. The copy is byte-identical to the one on `plans/ea-step08-depth42-20260924`, so the two branches can land in either order. A status line can be added once both have landed.
7. **DL-078's canonical_text wording (review of the depth42 branch, cycle 2, check 3).** The clarified `canonical_text` says the landing "regenerates the derived plan index (its readiness projection only; ...)", which can be read as regenerating only part of the index. The prose and acceptance criterion 1 say the whole derived plan index. A later Decision Log edit may reword it.
8. **Exclusions recorded before their owner edits land (batch 2 answers review, B2-06, a note).** Batch 2 records the DL-087 and DL-088 exclusions before the Contracts owner edits land; confirm that an exclusion may rest on a Decision Log answer while its owner edit is pending.
