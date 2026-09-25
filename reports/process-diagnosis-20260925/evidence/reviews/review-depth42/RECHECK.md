# Cycle 2 recheck: depth42 branch at `91bffc84e7`

**Landing-ready: no.**

The eight cycle-1 findings are handled: seven repaired, and G-07 partly repaired with a note left open. The block is a new-check failure. DL-083 records Jared's approval of card 5 as covering `platform.capability_evaluated`, but the card he actually answered did not name that family (C-1). The fix is small: narrow DL-083, or have Jared confirm the wider scope.

Method:
- **Export.** `git archive 91bffc84e7` (Plans, scripts, reports, tests) into `export-91bffc84e7/`, which lives in this directory and not in the author's worktree.
- **Currentness edition.** The ignored edition was copied in: 15 files, hash-identical to the shared checkout's copy.
- **Validation baseline.** A local `origin/main` ref holds only `ac9c0ad2e4`'s `plan_units.jsonl`, for `validate`.
- **Comparison.** Every result below was checked against the bytes, not against the author's claims.

## Cycle-1 findings

| ID | Disposition | What the bytes show |
|---|---|---|
| G-01 | repaired | Option A: Platform retention is PARTIAL with its three new citations. I recomputed everything from the JSON: 335/144/13/12, retention 38/4, Platform 10, 7 families one short, 39-family "now" row 304/139/13/12, Lower 30, Unchanged 290, `change_against_prior` 342/129/33. The Markdown and the JSON agree. See C-1 for how DL-083 now uses this. |
| G-02 | repaired | Seven rules with counts 1/8/2/10/6/2/1 = 30, each with its canon basis. The withdrawal bullet is dropped, and clarification 1 is stated in full. |
| G-03 | repaired | "the two restore families above". `browser.workspace.created` is added to group 4. |
| G-04 | repaired | The stricter producer rule is named on line 3. The four cells lowered against later supplements are listed under Lower. |
| G-05 | repaired | The Harmonization paragraph states the trigger test and cites S15:11626-11628 and storage-plan:19298-19300. |
| G-06 | repaired | The equivalent-complete-checkpoint route is stated, with compaction as its only use. |
| G-07 | partly repaired, **open (note)** | Five of the seven findings are right. The seglog and Hold oracle findings say their external suites are "reached only through a report", but canon fixture files pin both by path and SHA-256 (details below). Neither grade changes. |
| G-08 | repaired | The Platform consumers PARTIAL now rests on the unclosed read-through output and the unavailable aggregate use. The grade is unchanged. |

**G-07, the text that remains.** My cycle-1 evidence listed storage-plan 21463 and 22946 as report routes without opening these fixture files, and that invited the overcorrection.

- **Seglog.**
  - The finding says: "The relational join/prefix/retention suite is reached only through a report (storage-plan.md 21463), so under clarification 2 it is not counted …"
  - The bytes show otherwise. `Plans/seglog_append_observability_contract_fixtures.json` lines 5-7 pin `…/event-authority-step08-seglog-appended-20260911/v4-root/manifest.json` with SHA-256 `1dbd8542…`. This is the same manifest the seglog report names, and I verified it on disk.
  - The sentence also contradicts the Markdown's own Lower row "DL-076 holds for oracle suites an owner unit pins", which counts seglog, and group 5's "pinned by SP-270 (seglog)".
- **Hold.**
  - The finding says: "The external suites SP-288 relies on are reached only through a report (storage-plan.md 22946), so under clarification 2 they are not counted".
  - The bytes show otherwise. `Plans/storage_retention_hold_contract_fixtures.json` lines 5-7 pin `…/event-authority-step08-storage-retention-hold-20260911/v9/manifest.json` with SHA-256 `8d250dd0…`, verified on disk.
- **Repair.** In both findings, say the suite is pinned by that fixture file. The seglog cell then stays PARTIAL on DL-076 alone. If the JSON is not rebuilt for C-1, record this as an open question. The cycle cap has been reached.

## New checks

**C-1: FAIL (blocking).** Four of the five answers are recorded correctly:
- DL-079, DL-080 and DL-081 each record Approve on the recommended option, in both Decision Log sections and in `decision-responses.jsonl`.
- DL-082 records "no answer" with Jared's words byte-exact, and says it is not an approval.
- The worknode follow-up appears in the assessment's product section, the application record and the progress file.

DL-083 is recorded too broadly:
- **What Jared saw.** He answered from artifact `VG4oMJck5yPYeQijpmuQPB`, live version `1790286168-5758`. Read as a Unix time, that version number is 2026-09-24 21:42:48 UTC. Its card 5 reads "Boot recovery, recovery-applied and compaction-lifecycle events are application-wide …" and "Families: storage.boot_recovery, storage.recovery_applied, storage.compaction_lifecycle_changed; policy RP-OPERATIONAL-2555D." It does not name Platform.
- **How Platform got in.** The Platform sentence entered the card file in `fb7e6a2877`, authored at 22:09:12. The live artifact still lacks the sentence, so it was never republished with it. The answers file is dated about 22:28 to 22:30 UTC.
- **Where DL-083 goes too far.** It records Approve as covering "the application-scoped evaluations of platform.capability_evaluated" in six places:
  - the entry: its Why and answer paragraph;
  - the PlanUnit: `canonical_text` and acceptance criterion 1;
  - the "effect" of the `decision-responses` row;
  - the application record's DL-083 row;
  - the assessment's product-question answer;
  - Platform's retention finding and `remaining_gaps`.
- **Wrong card hash.** All five `decision-responses` rows carry `frozen_card_sha256` `b83dbae4…`, the edited card file. The presented revision is `193f481dd79112c81eda3a98b497c6d505f7e4e06ea5402311e8aed49f38d90f` (`31b2f80048` and `fd980eb2d4`).
- **Grades.** No grade moves: Platform retention is PARTIAL either way.

Repair, taking either route:
- **(a) Narrow DL-083** to the three Storage families.
  - In the DL-083 entry, the PlanUnit (`canonical_text`, AC1, `negative_constraints`) and its response row, say that Platform's application-scoped evaluations sit on the same seam but that this answer does not cover them. Leave that part open for Jared.
  - Change the Platform retention finding and gap, the product-question bullet and the application record to match.
  - Set `frozen_card_sha256` in all five rows to `193f481d…`, or cite the artifact version.
- **(b) Get Jared's explicit confirmation** that DL-083 extends to Platform, and record it with its own SourceRef. The hash correction still applies.

**C-2: pass.**
- **Grades.** Between the pre-answer JSON (`078d64bb…`, which is `b6edfdd9f4`) and the tip JSON (`ff7dbd59…`, which matches the Markdown pin): no status or disposition changes. Totals stay 335/144/13/12 and dispositions 27/7/8. Only the gaps of 11 rows and 4 retention findings changed.
- **DL-076 citations.** The three moved from line 5775 to 5997 with an equal `excerpt_sha256`. The source lines are byte-identical: 5775 at `f1ce058ccd` and 5997 at `91bffc84e7`.
- **Quotes.** All 2,630 quotes are exact at the tip.
- **Evidence.** Both evidence `SHA256SUMS` files verify.

**C-3: pass, with one wording note.**
- DL-078's Answer line is unchanged. The clarification sits in the procedure part and is credited to the coordinating thread.
- Every DL-076 to DL-083 YAML block parses. `canonical_text` and AC1 read literally.
- The ruling sentence is byte-identical in DL-078 and the procedure record.
- Note: "regenerates the derived plan index (its readiness projection only; …)" can be read as regenerating only the readiness projection. The prose and AC1 say the whole index. This can be fixed in a later Decision Log edit.

**C-4: pass.**
- **Shards.** Regeneration is byte-identical: 99 documents, 2,722 shards.
- **Index.** Regeneration is identical apart from `generated_at_utc`. `--check` and `validate` pass on the committed bytes.
- **Unit counts.** PlanUnits go from 6,723 to 6,728, and acceptance units from 26,241 to 26,257. Every added or changed unit is a `Plans/Decision_Log.md` unit.
- **Readiness.** The status is unchanged from main.

**C-5: pass.** The diff against `origin/main` names 26 paths:
- `Plans/Decision_Log.md`;
- 10 decision-log shard files;
- 6 `.plan_index` files;
- 9 `reports/event-authority-20260911/` files.

Nothing under `Plans/.implementation_readiness/` is touched.

## The three author choices

- **Card file kept "as presented", with blank Answer lines:** acceptable in form, under the DL-068 to DL-075 precedent. It is not literally as presented, though: the Platform sentence postdates the artifact. Either restore the presented text with the G-01 note moved to the application record, or add a dated line saying the sentence was added later. In both cases fix `frozen_card_sha256`, as in C-1.
- **Card 3's "11 of 12" wording, with a note:** acceptable. The artifact said only "otherwise nearly complete", so the stale count never reached Jared, and the application record's "10 of 12" is correct.
- **DL-080's "needed; this entry does not schedule it":** acceptable. The presented card said the replanned contract depends on the unfinished Replan source work, and that "This answer also decides whether the external Replan package is needed at all". Scheduling was not asked.

Files: `rechecks.jsonl` has 17 rows (G-01 to G-08, C-1 to C-5, A-1 to A-3, and a summary). `export-91bffc84e7/` (458 MB) can be deleted once the coordinator is done.

## Repair round re-review: tip `3ce6eb882c` (appended 2026-09-24)

**Landing-ready: yes.**

The repair round covers the C-1 block and the G-07 note. Scope was limited to the rows the coordinator listed, checked against my own `git archive` export of `3ce6eb882c`, which sits on the same base, `ac9c0ad2e4`. The ignored currentness edition was copied in: 15 files, hash-identical to the shared checkout's copy.

- **DL-083, the six places: repaired.**
  - Entry "Why": Platform is gone. It now reads "Boot recovery, recovery-applied and compaction-lifecycle events are application-wide …", which matches the card as presented.
  - Entry answer paragraph: it names only the three Storage families and "the three retention cells". It adds: "The application-scoped evaluations of `platform.capability_evaluated` sit on the same seam, but the card Jared answered named only the three Storage families, so this answer does not cover them; that part stays open for Jared."
  - PlanUnit: `canonical_text`, AC1 and AC3 now say "three". A new negative constraint reads "Do not apply this answer to the application-scoped evaluations of platform.capability_evaluated …". The YAML parses, and every preserved token is present.
  - The DL-083 `decision-responses` row's `effect`: narrowed the same way.
  - Application record: the DL-083 row is narrowed.
  - Assessment: the product-question answer is split into "Answered for the three Storage families" and "Open for Platform".
  - Platform's retention finding and cardinality gap: both read "DL-083 … answers that seam for the three Storage families only … stays open". The latter reads "OPEN, not covered by DL-083 …".
  - Decision Log scope: the only semantic PlanUnit change in `Plans/Decision_Log.md` is DL-083's `canonical_text`, `acceptance_criteria` and `negative_constraints`. The other 79 units change only `source_doc_sha256` (one also moves its `source_location`).
- **Five response rows: repaired.** All five EA-S08D rows carry `frozen_card_sha256` `193f481dd79112c81eda3a98b497c6d505f7e4e06ea5402311e8aed49f38d90f`. Apart from that field, only the cardinality row's `effect` changed, and the 20 rows from `main` are unchanged.
- **Card file bytes: repaired.** The SHA-256 is `193f481d…`, and the file is byte-identical to `fd980eb2d4`, the presented revision. The application record, in both Markdown and JSON, records the post-publication edit (`fb7e6a2877`) and the restoration (`6d81bfe924`).
- **The two G-07 sentences: repaired.**
  - Seglog: the finding now says the relational suite is pinned by `seglog_append_observability_contract_fixtures.json` (`external_joined_subject`, lines 5-7), so it counts, and the cell is PARTIAL on DL-076 alone. Two pin quotes were added (lines 6 and 7). Both are exact.
  - Hold: the finding now says the v9 suite is pinned by `storage_retention_hold_contract_fixtures.json` (`source_manifest`, lines 5-7), so it counts. One pin quote was added (line 7), and it is exact.
  - "The v4 full-value suite has no canon pin" is accurate: only the v9 manifest path appears anywhere in `Plans/`.
- **No grade or disposition moved.** Comparing `ff7dbd59…` with `ba9b84f9…`: 0 status changes and 0 disposition changes. Totals are 335/144/13/12, dispositions 27/7/8, and `change_against_prior` 342/129/33.
  - The changed cells are Platform retention (finding), seglog oracles (finding, reason, +2 evidence) and Hold oracles (finding, reason, +1 evidence), plus Platform's gaps.
  - All 2,633 quotes are exact at `3ce6eb882c`, and every excerpt hash matches.
  - The JSON SHA-256 `ba9b84f9…` matches the Markdown pin. The evidence `SHA256SUMS` `d3bb2f55…` (106 files) and card-answers `SHA256SUMS` `6c75b0a8…` (34 files) all verify.
- **Shards and index: pass.**
  - Shard regeneration is byte-identical: 99 documents, 2,722 shards.
  - `pm-plan-index.py generate` differs only in `generated_at_utc` in 4 files.
  - On the committed bytes, `--check` passes and `validate` passes.
  - Counts stay at 6,728 PlanUnits and 26,257 acceptance units.

**Residual, a note only (non-blocking).**
- **Where.** `step-08-depth42-card-answers-20260924.md` line 40 still says "Review G-01 later lowered its retention cell to PARTIAL for the application-scoped count that card 4 covers, so the assessment shows 10 of 12."
- **Why it is wrong.** Card 4, as presented and as restored, does not cover Platform's count. The same paragraph says so a sentence earlier.
- **Suggested wording.** "… for its application-scoped count, which sits on the same seam as card 4's three Storage families but was not on the card …".
- **Effect.** It is report text only, with no canon or grade effect, and it is not in the pinned JSON.

**FYI, not a finding.** The progress file (not touched in this round) still says the admission records "must pin the final depth42 JSON, which is `ff7dbd59...` for now". The current JSON is `ba9b84f9…`.

Exports: `export-91bffc84e7/` (458 MB) and `export-3ce6eb882c/` (466 MB) have both been deleted.
