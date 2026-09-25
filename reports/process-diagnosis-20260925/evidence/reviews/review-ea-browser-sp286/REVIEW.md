# Review: plans/ea-browser-pair-sp286-20260924 (tip 2df56dd8a9)

**Verdict: fix_then_land. Landing-ready: no.**

There are 10 findings, none of them blocking:
- **Should fix (5):** S-02, S-03 and S-04 in the canon text, S-09 for what landing will show, S-10 for the depth claim.
- **Notes (5):** S-01, S-05, S-06, S-07, S-08.

S-01 was recorded as blocking and downgraded during the review, when the depth42 branch landed (see the note under S-01).

The findings are in `findings.jsonl` and the report comparison is in `RECONCILIATION.md`. A tested patch that repairs S-02 to S-07 is in `proposed-edits.patch`, and the full edited file is in `proposed/`.

This was a read-only review:
- Nothing under `/mnt/Cursor/PuppetMaster` was edited, no worktree was created and nothing was pushed.
- All checks ran on `git archive` exports under this directory.
- The ignored currentness edition was symlinked, never copied.
- The logs are in `logs/` and the helper scripts in `scratch/`.

## Order followed

1. **The authority, before the branch.** At `ac9c0ad2e4` I read:
   - DL-046: `Decision_Log.md` 616-640 and the PlanUnit at 3963. On the new `main` its text is byte-identical and the PlanUnit is at 4121.
   - SP-286: prose 21904-22019 and the unit at 22020-22079, including 22035-22036.
   - CV-339: `Contracts_V0.md` 22096-22278.
   - The Executor's run.started adoption: `Executor_Protocol.md` 7283-7293 and EP-116.
   - SMPFS-167 and SMPFS-168 as they stand on `main`.
   - SP-266 v1 and its conditional v2 successor: `storage-plan.md` 19710-20033.
   - SP-278 (20956-21077) and SP-282.
   - The depth42 assessment (`.md` and `.json` at `3ce6eb882c`) and its rubric.
   - For wording comparison, the two other Section 15 and Storage adoptions: terminal-move and seglog observability.
2. **The bytes against that authority.** I read the diff, regenerated the derived files, ran the checks and tests, and wrote S-01 to S-08.
3. **The author's report, then the reconciliation.** The branch has no report file. The author's report is the commit message plus the claims in the dispatch. The commit message was on screen with the first diffstat, but I did not use it for S-01 to S-08. S-09 and S-10 come from this step.

## What holds

- **Scope (item 1).** The diff against `ac9c0ad2e4` is exactly `Plans/Section15_MVP_Promoted_Features_Spec.md`, its 29 shard files and the six `Plans/.plan_index` files.
  - A whole-tree diff of the two exports, excluding derived directories, differs only in Section 15.
  - `Plans/event_family_registry.json` is `0be544181eda...c842` on both, revision `2026-09-11.2`, so the checkpoint is untouched.
  - `Plans/browser_event_admission.json` is unchanged.
- **Adoption by name (item 2, core).** Both units name `storage.first_append_receipt.resolve.v2` under SP-286/CV-339 in:
  - a dated DL-046 subsection;
  - the canonical sentence;
  - a new criterion (SMPFS-167-A006 and SMPFS-168-A005);
  - `depends_on` and the ContractRef line.

  The owner never calls `issue.v2`. Declining `resolve_full_value.v1` matches SP-286 ("Each full-value-dependent caller must explicitly adopt that separate interface"), and the Browser owners make no full-value claim anywhere: their retry and replay checks are semantic-digest checks. It also matches depth42's own gap wording: "and resolve_full_value.v1 if full-value proof is relied on".
- **Wording (item 3), where it follows the precedent.** It follows the Executor text sentence for sentence in these places:
  - request is not a custody row or receipt;
  - Storage authenticates global/scoped identity, the semantic tuple and issued custody;
  - eleven-field receipt plus four-field result joined to the original event/sequence and segment ref/offset;
  - exact synced barrier class, with no locator, timestamp, digest or four-field result as a substitute;
  - alternate scoped event ID;
  - no first mint from a missing receipt, lost delivery, tail absence or never-issued flag;
  - passive resolution.

  Dropping the new-run formula and the full-value adoption are real Browser differences. The differences that are not Browser differences are S-02, S-03, S-05, S-06 and S-07.
- **Derived files (item 4).**
  - Regenerating shards and index on the branch export, with the edition symlinked, reproduces every committed derived file, apart from four `generated_at_utc` stamps.
  - Shard check: pass, 99 documents, 2,722 shards.
  - `pm-plan-index.py validate`: its only failure is the retention baseline, which needs git. I reproduced that check by hand: no PlanUnit is removed or added (6,723 on both sides).
  - SMPFS-167 and SMPFS-168 are the only units whose content changes. The other 168 Section 15 units change `source_doc_sha256`, and SMPFS-169/170 also move their line.
  - Acceptance units go from 26,241 to 26,243 by adding SMPFS-167-A006 and SMPFS-168-A005, and 22 rows move their line only.
  - Dependencies add four `depends_on` edges, with no unresolved references and no cycles.
  - PyYAML parses both blocks to exactly the index values. The new criteria contain no `: `, ` #` or apostrophe.
  - `lint-contractrefs` has the same single pre-existing failure on both exports, so `#SP-286` and `#CV-339` resolve.
- **Tests (item 5).** On both `main` and the branch:
  - Browser created 63 OK, reset 53 OK, admission 38 OK;
  - program semantics and result binding 64 OK;
  - holding bucket 13 OK;
  - `pm-browser-event-admission.py` passes.

  None of them reads the new text (S-08).
- **The v2 checkpoint and the v1 route (item 7).** No sentence about SP-266 v2, SP-278 or the reader changed.
  - "Until that replacement the v1 checkpoint and reader remain the current route" is intact.
  - The new subsection sits between the producer and consumer sections and speaks only about producer recovery.
  - Nothing pre-empts the v2-current branch.
- **Evidence rows (item 8).**
  - The edit adds exactly 30 `artifact_hash_stale` rows (Section 15 and its 29 shards) to each of evidence and plan graph. Against `main` these go from 11 to 41, under both print caps (50 and 100).
  - It also adds 1 readiness drift row and 3 plan-migration rows in each aggregate (S-09).
  - The rebased simulation on the new `main` `38b8c1301d` gives the same deltas.
- **Spec Lock.** Section 15 has no entry in `Plans/Spec_Lock.json`, so there is no Spec Lock staleness.

## What must change before landing

**S-02: the restore half of SP-286/CV-339 is missing.**
- CV-339 says "Event-specific producers must adopt their actual accepted-operation interface".
- The Executor precedent adopts in-place restart handoff, "A verified older restore does not make omitted run-start work fresh" and fresh-operation admission for genuinely new work.
- Neither Browser subsection mentions restore or restart. The only related sentence is the generic "Missing or conflicting custody keeps the operation recovery-required".

**S-03: the request is defined by command-level identifiers.**
- The colon list names `command_instance_id` (not an EventRecord or payload field) and, for reset, "the checked owner revision". The reset payload's facts are only state, prior generation and generation.
- It leaves out the original event ID.
- CV-339 defines the request as "An incoming EventRecord identity/semantic request under its existing replay policy". The Executor preserves the "actual original event ID and scoped idempotency key".

**S-04: no route when no original event exists.**
- The canonical sentences and criteria say recovery resolves the original append "only through" resolve.v2. resolve.v2 answers missing custody with "unavailable/fenced".
- The reset subsection adds "Missing or conflicting custody keeps the path unavailable".
- The retained reset text still says "Reconcile or retry only the **original append identity**", and the reset oracle models that retry.
- As written, a reset whose effect committed but whose event never became durable is unavailable for good.
- Section 15's terminal-move adoption already has the right wording: "resumption may retry only through the unchanged shared idempotency route with the same original input".

**S-09: expected-at-landing is not recorded (item 9).** There is no report, and the commit message mentions only the 30 plan-sharding rows. The block below is the text to add to the landing record.

**S-10: "reset 12 of 12" is a forecast, not a result.** The producer gap is closed by name. Created can reach at most 10 of 12, because its consumers and oracles are untouched. Reset reaches 12 only if S-02 is adopted and the oracle cell is not lowered for the untested A005 (S-08). The exact wording to use is in S-10.

## Notes

- **S-01 (resolved during the review).**
  - Both subsections cite `reports/event-authority-20260911/step-08-depth42-assessment-20260924.md`. That file was on neither the tip nor its base, only on the depth42 branch.
  - At 23:50Z the re-fetch showed depth42 landed (`main` `ac9c0ad2e4` -> `3ce6eb882c`, record `38b8c1301d`), so the citation resolves after the rebase.
  - The rebase conflicts on four `Plans/.plan_index` files; `plan_units.jsonl` and `acceptance_units.jsonl` merge cleanly as text. Regenerate all six, never hand-merge.
- **S-05.** "returns the original identity and result from that resolution" makes the Storage resolver sound like the source of the `browser_command_result`.
- **S-06.** The first-mint sentence drops the precedent's "current" and its barrier/check clause.
- **S-07.** The final held-boundary recheck, which both precedents have, is absent.
- **S-08.** No test or named obligation covers A006 or A005.

## Exact edits to land

`proposed-edits.patch` (178 lines) applies with `patch -p1` to both `2df56dd8a9` and the rebased tree (`38b8c1301d` plus the branch's Section 15). I tested it in `export-proposed`:
- shard generate and check pass (99 documents, 2,722 shards);
- index generate passes, and validate fails only on the git-dependent retention baseline;
- PyYAML parses both edited blocks to exactly the index values;
- SMPFS-167 and SMPFS-168 are still the only units whose content differs from the branch, and the acceptance unit count is unchanged;
- created and reset tests: 116 OK.

The edited file is `proposed/Section15_MVP_Promoted_Features_Spec.md`, 40 lines longer than the branch's. The YAML changes are these:

```diff
 SMPFS-167 canonical_text, last sentence
-  uncertain-append recovery resolves the original creation append only through the explicitly
+  uncertain-append recovery resolves an issued original creation append only through the explicitly
 SMPFS-167-A006
-  - Lost-acknowledgement and uncertain-append recovery resolves the original creation append only through ... the owner never requests a first mint, and no full-value claim is made without separately adopting storage.first_append_receipt.resolve_full_value.v1.
+  - Lost-acknowledgement and uncertain-append recovery resolves an issued original creation append only through ... the owner never requests a first mint, no full-value claim is made without separately adopting storage.first_append_receipt.resolve_full_value.v1, and restored or lost work is never reaccepted as fresh.
 SMPFS-168 canonical_text, last sentence
-  resolves the original reset append only through the explicitly adopted SP-286/CV-339
-  storage.first_append_receipt.resolve.v2.
+  resolves an issued original reset append only through the explicitly adopted SP-286/CV-339
+  storage.first_append_receipt.resolve.v2 and, when no original event exists, retries only the
+  original append identity through the unchanged shared idempotency route.
 SMPFS-168-A005
-  - Failed, uncertain or lost-acknowledgement append recovery resolves the original reset append only through ... synced barrier class; no supplied row, ...
+  - Failed, uncertain or lost-acknowledgement append recovery resolves an issued original reset append only through ... synced barrier class; when no original event exists, only the original append identity is retried through the unchanged shared idempotency route with the same original input; no supplied row, ... and restored or lost work is never reaccepted as fresh.
```

The prose changes are these:
- **Both subsections:**
  - The request sentence is rewritten (S-03).
  - The first-mint sentence gains "current ... after the original source/manifest barriers and complete current group/source/dedupe/restore checks" (S-06).
  - A restore paragraph mirrors the Executor's (S-02).
  - A new paragraph opens with the final-boundary recheck (S-07).
- **Created:**
  - The lost-acknowledgement sentence joins the owner's own `browser_command_result` and "cannot manufacture a missing owner result" (S-05).
  - A no-original-event sentence keeps the existing pre-commit rule (S-04).
- **Reset:** a no-original-event sentence adds the retry through the unchanged shared idempotency route (S-04).

The patch file is the exact text. The diff above is abridged with "...".

## Landing, once S-02 to S-04 are applied

1. Apply the patch in the author's worktree on the branch.
2. Regenerate shards and index with the edition symlinked, and commit the document and its derived files.
3. `git fetch origin && git rebase origin/main`. `main` is now `38b8c1301d`. Four `Plans/.plan_index` files conflict with the depth42 landing: `coverage_report`, `dependencies`, `doc_cards` and `node_readiness_report`. `plan_units` and `acceptance_units` merge cleanly as text. Take `main`'s version of all six and regenerate with the edition present. Do not hand-merge.
4. Expect the following after the rebase:
   - 6,728 PlanUnits and 26,259 acceptance units;
   - the readiness report equal to `main`'s, plus one `event_authority_currentness_source_drift` row for Section 15, four more `depends_on` edges and one SMPFS-170 line shift (to 12054 with the patch).
5. Land before `plans/ea-certified-anchors-20260924`, or after the wave reseal. That branch adds 132 rows to evidence and plan graph. After it lands, 41 + 132 rows pass the 100-row audit-governance cap, and this branch's rise in a truncated subcheck would make the landing check exit 2.
6. Expected landing check: exit 1, with every row governance staleness on Section 15 (the S-09 block). `main`'s own Decision Log rows from the DL-077/078 and depth42 landings are new against the `792d2fb8b1` baseline but name none of this branch's files.
7. Send one reseal request, appended to the wave's list:
   - the plan-sharding bundle rows for Section 15 and its 29 shards;
   - a currentness edition that includes Section 15;
   - run-002 `refresh-batch-hashes` rows 168 to 170;
   - the implementation-readiness report;
   - the nightly snapshot.

## Not verified

- `pm-landing-check.py` itself. It needs git and a full checkout. I ran its three subchecks directly on two pairs of exports and compared them: `main`/branch and new-`main`/rebased simulation.
- The json-syntax (16) and contractref/support-ref (1) failures come from the ignored `tests/agent_packet_restrictions` and `Plans/.audits` inputs, which are absent from exports. They are identical on both sides of each pair.
- The depth regrade itself (S-10 is a forecast about it).
- Native behaviour of any binding (NOT_RUN by definition).
