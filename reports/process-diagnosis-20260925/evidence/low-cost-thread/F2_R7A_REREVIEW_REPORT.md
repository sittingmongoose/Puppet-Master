# Task F2: affected-rows re-review of R7-A's repaired revision-3

STATUS: COMPLETE. All steps finished: packaging fix applied, the rejected attempt sealed as evidence,
R7A-REREVIEW-002 run and sealed, independently adjudicated, and this report written and mirrored.

The acceptance rule cited throughout is the bounded acceptance rule (DL-059, renumbering to DL-066).

Attempt `R7A-REREVIEW-002` is the last step of the bounded acceptance rule **DL-059**: deterministic
checks, one scoped review, one bounded repair round, an affected-rows re-review; remaining findings
become open questions rather than another repair round.

Package: `/home/sittingmongoose/PM-Experiments/gitlab-r7a-rereview-20260918-v1/`
Built packet (read only, unmodified):
`/home/sittingmongoose/PM-Experiments/gitlab-r7-known-defect-20260917-v1/candidate/baseline/r7a-repair-003/review-packet-001/`

## 1. Package

### 1.1 Scope

| | |
|---|---|
| reviewed | `revision-2`, commit `15cb5286a9f4b93947e6ec5336892d480e1d2518` |
| repaired | `revision-3`, commit `a0739481f55cec6ce828aaeb029348b6180ebeee` |
| scope rows | 354 — 4 finding impact rows, 2 repair-diff, 231 seal-derived (named, not carried), 117 reverse-support |
| files the repair wrote | **2**, both named by a finding; `changed_paths_named_by_no_finding` empty |
| carried public files | 93 subject files on both sides, plus the review and repair records — 105 bound paths in all |

The packet was copied out of the run directory and every one of its 104 files re-hashed: **zero
mismatches, zero missing, zero extra**. The run directory was never modified; the review ran entirely
on the copy.

### 1.2 The two findings the repair was given

From `public/review/FINDINGS.json`, exactly as the first review's adjudication keyed them:

- **F2** — `sfk-163c1b590a403531fd228557`, the orphan `adapter_profile_audit_fidelity` definition.
  Blocking, candidate-introduced. Bound: either give it a real referent — a `$ref` that reaches it
  and a fixture that exercises it, with `target_profile_id` able to express `gitlab_dedicated` — or
  remove it; do not restructure the schema, do not touch the three valid adapter profiles, and change
  no other file except where the finding reaches it.
- **F4** — `sfk-8f34bcf263e4a84c3ebfd1a9`, event-authority currentness. Not charged to the candidate,
  and its bound said the remedy is root-owned and it may not be closable.

### 1.3 What the repair actually did

Two edits, and nothing else:

- `Plans/forge_integration_contracts.schema.json` — the 14-line `adapter_profile_audit_fidelity`
  definition block **removed**. That is the second branch of F2's bound.
- `Plans/GitLab_Integration.md` — **one paragraph added** recording that event-authority currentness
  is an unresolved acceptance obligation, naming the failing check and the open denominator, stating
  that the remedy is root-owned refreshed registration, generated governance updates and fresh
  approval, and ending "No currentness closure is claimed here."

### 1.4 Provenance — a different model wrote the repair

`public/review/PROVENANCE.json` declares `same_model_across_revisions: false`. Revisions 1 and 2 were
written by `openrouter-union/stealth/union-alpha` at xhigh; revision-3 by
`opencode-go/deepseek-v4.1-flash` at max, after union-alpha was retired. `PROTOCOL.md`, `CRITERIA.md`
and `REVIEWER_TASK.md` each tell the reviewer that a difference in style, ordering or phrasing
between the two revisions is a model difference before it is a finding, and require it to say which
each difference is.

### 1.5 Method and the honest limits

The method is the one task F ran, re-pointed for a bounded scope. `HOST_INTERFACE.md` is carried
byte-for-byte by the packet builder; `record.schema.json` changes only its attempt-id const, its
target enum (F2, F4, SCOPE, METHOD_CONTROL) and its workstream enum. `PROTOCOL.md`, `CRITERIA.md`,
`REVIEWER_TASK.md` and `WORKSTREAMS.json` are written for this scope. `delivery.py`, `project.py` and
`observe_metadata.py` are unchanged; `admission.py`, `prepare_release.py`, `seal_state.py` and
`write_disposition.py` are the four the packet builder carried *for re-pointing*, and are re-pointed.

**`host.py` carries two changed lines**, both stated rather than claimed away: the fixed-allowance
check reads 1800 instead of 3600, and the hardcoded judgment target tuple reads
`F2, F4, SCOPE, SOURCE, METHOD_CONTROL` to match the record schema. The second of those is the fix
described in section 2.1.

The source admission is **not** an independent audit — the coordinator performed the mechanical
verification itself and signed under a distinct role label so the host gate had a well-formed input.
The control author is the coordinator. The machine is not exclusive. Instructional isolation is not
OS isolation. All four limits are recorded on the face of `operator/source-admission-001.json`.

### 1.6 Fresh controls

Four newly authored cases; no R4, R5, CCAL or CR7 text or id reused. They are the four judgments this
bounded scope actually turns on.

| Case | Class | Sealed expected verdict |
|---|---|---|
| RR-118 | removal_leaves_dangling_reference | FAIL |
| RR-354 | honest_open_obligation_recorded_not_resolved | PASS |
| RR-607 | declared_model_difference_is_not_a_defect | PASS |
| RR-892 | edit_outside_the_bound | FAIL |

## 2. Reviewer timeline

### 2.1 Attempt R7A-REREVIEW-001 — impaired by a coordinator packaging defect

The first attempt ran its full 1800 s and produced 26 records, but **every** judgment carrying one of
the three required targets was rejected `invalid_target`. The cause was mine, not the reviewer's:
`host.py` carries a hardcoded judgment target tuple that I did not re-point when I changed the record
schema's target enum, so the host accepted `METHOD_CONTROL` and refused `F2`, `F4` and `SCOPE`.

The reviewer handled it well — it diagnosed the cause, filed it as a preflight defect, and published
its determinations as checkpoints so they would reach accepted custody. Its four control judgments
were all accepted and all correct. But the three required determinations could not reach accepted
custody in their canonical form, so the attempt is sealed and retained as evidence rather than
adjudicated:

| Artifact | SHA-256 |
|---|---|
| `seal/output-seal-001.json` | `8d099b83fa8fe5057dee0d51025f68f42cdb31a572aff8d68fd361c9841c872e` |
| `operator/terminal-observation-001.json` | `9c612147ca794a48552374754f8bbb92f3ec9854be8e705aa6360d988017253e` |
| `operator/reviewer-runtime-transcript-001.jsonl` | `312d85cdd4363730356331b7c5e58ec9ed45a4df5288886fdb4eeeaefffe679b` |

### 2.2 Attempt R7A-REREVIEW-002 — one line fixed, full allowance

The one line was corrected, a fresh package built (119 members, 105 bound paths, freeze
`16e46f65b3d0e3eec59bee491e8d1dd5cae92c197dc40bdcfcabf4b122d57231`), and a new reviewer dispatched
that inherits nothing from the first. The fix was proved before dispatch: a `target: F2` judgment now
validates.

| | |
|---|---|
| release / deadline | 02:28:22.344846Z / 02:58:22.344846Z, 1800 s fixed |
| first supported judgment | **t+173.6 s** (journal 1, F2) |
| four controls accepted by | t+376.4 s |
| checkpoints | t+583.4 (vs 600), t+1118.2 (vs 1200), plus t+1302.9 and t+1393.8 |
| determinations | F2 journal 1, F4 journal 2, SCOPE journal 8 (t+655.5) |
| last record | t+1393.8 s, 406 s inside the deadline |
| sealed records | **24** events, 24 receipts, 60 delivery members; 19 accepted, 5 own-record defects restated and accepted |
| shell calls | 75, **all Bash, no other tool** |
| host invocations | **91** — deliver 28, submit 24, scan 18, search 10, json 7, list 3, status 1 |
| reviewer tokens | 244,606; wall clock 1,372.8 s |

| Artifact | SHA-256 |
|---|---|
| `attempt-002/seal/output-seal-001.json` | `757897328af6e02bbeb9ea80401b1b94c865e2174b4ee6e7faa3ee3b6cef0623` |
| `attempt-002/seal/output-projection-001.json` | `bc9b24302da16fa0dc06dff2f3b2ee28bfba3c5ebaff308ae1b247be4678a775` |
| `attempt-002/operator/terminal-observation-001.json` | `e33dc562638f4418917ca5f92f5db71dcb08e8ad9226c8e45d94d0e7bab3f2dd` |
| `attempt-002/operator/reviewer-runtime-transcript-002.jsonl` | `f12635c437b85d6ba430690ad91ab82a506517872862c4a2cce23248e9b99834` |

The five unresolved records are the reviewer's own: four failed revisions of one record (one
ambiguous citation, then three invalid `supersedes` values) and one mis-escaped nested-JSON quote.
Each was restated cleanly and accepted, and the reviewer declared all five in its checkpoints.

## 3. Closure of the two repaired findings

A fresh Opus adjudicator — a separate agent, spawned after the state was sealed, given the sealed
outputs, the packaged scope, the control freeze and gold and the retained runtime transcript, and
told to decide closure from the repaired bytes rather than from the reviewer's labels — produced
`attempt-002/adjudication-001/`:

| Adjudication artifact | SHA-256 |
|---|---|
| `adjudication.json` | `0b51b6fac198038da2d431409426035dd4a38a15a661a0044952e4953728a043` |
| `REPORT.md` | `643136dca4759d368c7314d933557bfec858694bde14d1f1853c12348d44c992` |
| `CITATION_CUSTODY_CHECKS.json` | `0fc51a29ceb3ddcfa3bd6e9bc2dfd89930a791547dd5f5e3f9c923463d5e7bba` |
| `F2_CLOSURE_CHECKS.json` | `65fe8529b271c256d1785353a9e5c0d68e8d69c2643f249933bbe6a56fb6a2c7` |
| `CARRIED_PATH_DIFF.json` | `a4b66b79951de92fe7129d9793658947aa068e8a9243b217530993e2bf9139a0` |
| `NEW_FINDINGS_SCAN.json` | `9ab94343eb2e91fc7129070278a375ce9b40a18de77d08ed2216b3286d16c1ef` |
| `CONTROL_DELIVERY_CHECKS.json` | `90c3671be3f6499b60e35610c12ccda4d3707b487020b8bf0f05d8bb4927f0d3` |
| `COMPLETION.json` | `607b464cb93946436d005aaa7ab73e489977a2169cf2929c12187746aca67014` |

The adjudicator was itself interrupted by an account rate limit after writing every mechanical check
but before its summary artifacts; it was resumed once the limit reset and told to derive them from
the checks it had already run without changing any assessment. It **accepts the review**: validity `VALID_AND_USABLE`, completeness
`COMPLETE_AT_THE_REQUIRED_BOUNDED_SCOPE`. On all three determinations the adjudicator and the
reviewer agree, each reached independently.

| Target | Reviewer | Adjudicator | Coverage | Meaning |
|---|---|---|---|---|
| F2 | PASS | **PASS** | COMPLETE | F2 is **closed**, by the removal branch |
| F4 | FAIL | **FAIL** | COMPLETE | F4 is **not closed**; the repair gave the honest disposition its bound allowed |
| SCOPE | PASS | **PASS** | COMPLETE | The repair stayed inside its bound and introduced no new blocking finding |

### 3.1 F2 — `sfk-163c1b590a403531fd228557` — **CLOSED**

The repair took the removal branch, and the removal is complete in every sense the bound and the
criteria asked about. The adjudicator's mechanical checks, in `F2_CLOSURE_CHECKS.json`:

- the tokens `adapter_profile_audit_fidelity`, `audit_fidelity` and `target_profile_id` each occur
  **zero** times across all 42 carried paths in revision-3, against one, one and two occurrences in
  revision-2 — no renamed remnant survives;
- `definitions_only_in_r2` is exactly `["adapter_profile_audit_fidelity"]` and
  `definitions_only_in_r3` is empty;
- `distinct_refs_only_in_r2` and `distinct_refs_only_in_r3` are **both empty** — nothing referenced
  the definition before and nothing dangles after it;
- the decisive test: **the parsed revision-2 document with that one member deleted is equal to the
  parsed revision-3 document** (`r2_minus_definition_equals_r3: true`);
- `definition_order_preserved_after_removal: true`, the top-level key order is unchanged, and the
  `/$defs/provider_adapter_profile` node — the one the three valid adapter profiles validate against
  — is **byte-identical** between the revisions;
- every fixture's definition references still resolve in revision-3 (`NEW_FINDINGS_SCAN.json`,
  `fixture_definition_resolution`: `ALL_RESOLVE`), and all 20 JSON files on each side parse.

Every constraint the bound imposed held: the three valid adapter profiles sit in a file the repair
never opened, the schema was not restructured, and the only other file changed is the one the other
finding reaches.

**F2 was the one finding charged to the candidate.** It is closed.

### 3.2 F4 — `sfk-8f34bcf263e4a84c3ebfd1a9` — **NOT CLOSED**

Two things are true at once and the report means both.

**What revision-3 did is the right thing.** It inserted exactly one paragraph into
`Plans/GitLab_Integration.md` and changed nothing else in that file. The paragraph names the failing
check by its error identifier `event_authority_currentness_source_drift`, records that the Event
Authority denominator status remains `UNKNOWN_OPEN`, states that the remedy is root-owned — refreshed
central registration, generated governance updates and fresh Event Authority approval after stable
edits — and ends "No currentness closure is claimed here." That is the second branch of the bound,
executed completely and honestly, and it is the only branch that was open to the repairer: it was
forbidden the repository-wide verifiers and governance reseals that would actually discharge the
obligation.

**The obligation is nevertheless still open.** Event-authority currentness remains unproved across
the registered source set, both global aggregates still fail, and the drift still reaches the
selected scope through one `event_authority_currentness_source_drift` row against
`Plans/GitLab_Integration.md` itself. Recording an open obligation truthfully does not close it.

F4 is **not closed**, it is **not chargeable to the repair**, and its remedy owner is **root**.

## 4. New findings in the affected rows

**None. Zero new blocking findings and zero new non-blocking findings.**

The adjudicator swept every carried path itself rather than relying on the reviewer's sweep
(`CARRIED_PATH_DIFF.json`): of the **42 carried subject paths, 40 are byte-identical** between
revision-2 and revision-3, and exactly two differ — `Plans/GitLab_Integration.md` and
`Plans/forge_integration_contracts.schema.json`, the two the findings name. There is no third file,
no incidental improvement, and no change that a finding does not reach.

Because the only two differences are the two the findings required, the declared model difference
never became a question: there is no reordering, rewrapping or restyling anywhere to classify.
Revision-3 was written by `opencode-go/deepseek-v4.1-flash` at max against revisions 1 and 2 by
`openrouter-union/stealth/union-alpha` at xhigh, and it produced a minimal diff rather than a
rewritten file. That is worth recording as a positive result about the fallback model on a bounded
repair task.

### 4.1 The review's own quality

| | |
|---|---|
| records | 24 sealed, **19 accepted**, 5 not — all five the reviewer's own record defects, each restated cleanly and declared in its checkpoints; no accepted evidence erased by any supersession |
| citations | 87 submitted, **85 custody-verified against the frozen bytes**, 2 host-unresolved; **zero source-hash, interval or quote-hash mismatches** |
| coverage | **5 of 5** workstreams COMPLETE |
| controls | **4 of 4 correct** against sealed gold; **4 of 4** actual deliveries verified from the retained carrier |
| first substantive judgment | t+173.6 s against a 150 s target — 23.6 s late, the one target missed |
| checkpoints | t+583.4 (within 600) and t+1118.2 (within 1200); last record t+1393.8, 406 s inside the deadline |
| input procedure | **ACCEPTED** — 75 tool calls, all Bash; 91 host invocations, all inside the released allowlist; no other tool of any kind |

## 5. Disposition under the bounded acceptance rule (DL-059, renumbering to DL-066)

The rule: ACCEPTED only if no blocking finding remains in scope; otherwise UNACCEPTED with the
blocking findings listed. Remaining findings become open questions rather than another repair round.

**One blocking finding remains in scope. The disposition is UNACCEPTED.**

| Blocking finding remaining | |
|---|---|
| id / key | **F4** — `sfk-8f34bcf263e4a84c3ebfd1a9` |
| family | `event_authority_currentness` |
| level | blocker; `precludes_PASS: true` |
| closed | **no** |
| chargeable to | **root, not the repair** — `blocks_candidate_verdict: false`, provenance `pre-existing-in-subject` |
| remedy owner | **root**: refreshed central registration, generated governance updates and fresh Event Authority approval after stable edits |
| why it remains | The repairer was forbidden the repository-wide verifiers and governance reseals that would discharge it, and disposed of it in the only way open to it — an explicit, truthful record that the obligation is open |

What the bounded round achieved, stated plainly so the UNACCEPTED is not read as a failure of the
repair:

- **F2, the one finding charged to the candidate, is closed**, completely and within its bound.
- **The repair introduced nothing.** Zero new findings, blocking or not, across 42 carried paths.
- **The repair stayed inside its bound.** Exactly two files changed, both named by a finding.
- The single remaining blocker is one the candidate was never able to close and was never charged
  with. Under DL-059 it does not trigger another repair round; it becomes an open question with a
  named owner.

Candidate acceptance remains **UNACCEPTED** and root acceptance is not authorized. Neither the
reviewer nor the adjudicator grants acceptance; this disposition is root's, derived from the
published records and the adjudication.

## 6. Open questions carried forward

From this re-review:

| # | Open question | Owner | Status |
|---|---|---|---|
| F4 | Event-authority currentness unproved across the registered source set; both global aggregates fail; one source-drift row against `Plans/GitLab_Integration.md` | **root** | open, blocking, recorded honestly in revision-3 |

Carried from the first review's non-blocking findings, unchanged by this round:

| # | Open question | Owner | Status |
|---|---|---|---|
| F1 | `catalog.forge_review_create` and `catalog.forge_review_merge` bind pull-request nouns and a no-GitHub-remote disabled state to provider-neutral `cmd.forge.review.*` commands | canon | **already answered** by DL-044 and DL-050; pre-existing in this frozen subject and deliberately not fixed here |
| F3 | The measured seal failure census reports 11 identities over 6 distinct checks and an audit-closure aggregate of 201 against 1,469 rows — the merge keys on the producer's spelling and so cannot merge | **harness** | open; this is task R7's finding R7-1, independently reproduced |
| F5 | `Plans/Forge_Integrations.md` and `Plans/Source_Control_System.md` are live PlanUnit-bearing owners but are registered in neither the sharding configuration nor any shard set | subject | open; pre-existing, and the candidate added only the one owner its task required |
| — | The typed evidence mapping cannot be established from the committed bytes: both released shapes are closed objects with no field for census completeness or a final fence | subject | open bounded UNKNOWN |
| — | `W-R1-BASELINE` and `W-AFFECTED-TRAVERSAL` did not close in the first review's hour | review method | open; a second pass or a longer allowance is what would close them |

And one from this task's own conduct:

| # | Open question | Owner | Status |
|---|---|---|---|
| — | The re-review host tool needs its judgment target tuple derived from the record schema rather than hardcoded, so a re-pointed package cannot silently reject every required target | **harness / this coordinator** | open; it cost attempt R7A-REREVIEW-001 its whole allowance |

## 7. Where everything is

- Re-review package, both attempts, seals and adjudication:
  `/home/sittingmongoose/PM-Experiments/gitlab-r7a-rereview-20260918-v1/`
  (`package-001/` and `seal/` for the rejected attempt 001; `attempt-002/` for the adjudicated run;
  `COORDINATOR_NOTES.md`)
- Built packet and repair run, read only and unmodified:
  `/home/sittingmongoose/PM-Experiments/gitlab-r7-known-defect-20260917-v1/candidate/baseline/r7a-repair-003/`
- First review and its adjudication:
  `/home/sittingmongoose/PM-Experiments/gitlab-r7a-scoped-review-20260917-v1/`
- This report, mirrored:
  `/mnt/Cursor/PuppetMaster-Evidence/tests/harness-latency-20260916/reports/F2_R7A_REREVIEW_REPORT.md`

## 8. Summary

- **F2 closed: YES.** Removal complete; parsed revision-2 minus the one definition equals parsed
  revision-3; no dangling reference; every bound constraint held.
- **F4 closed: NO.** The repair recorded the open root-owned obligation honestly, which is the
  correct answer to its bound, but the obligation itself remains open and blocking.
- **New blocking findings in the affected rows: 0.** New non-blocking findings: 0. Forty of 42
  carried paths byte-identical; exactly the two authored files differ.
- **Disposition: UNACCEPTED** under the bounded acceptance rule (DL-059, renumbering to DL-066), with
  F4 as the single remaining blocking finding — chargeable to root, not to the repair, and carried
  forward as an open question rather than another repair round.

## 9. Coordinator's note (2026-09-18 07:25 UTC; not part of the adjudication, which stands as sealed)

The disposition in section 5 applies the acceptance rule as written on the branch that records it
(DL-066, PWIZ-028): *blocking findings are the findings carrying `repair_required` true and
`finding_level` blocker*, and F4 carries both, so it blocks. The adjudicator, the reviewer and the
report author all applied the rule correctly. What needs Jared's attention is where F4's two flags
came from and what the rule as written implies.

**Where the flags came from.** F4 was never charged to the candidate: the first review's
adjudicator tagged it `pre-existing-in-subject`, `blocks_candidate_verdict: false`,
`precludes_PASS: true`, remedy root-owned. The repair-round builder in the harness
(`pwflow/repair_round.py`, lines 172–173) then set `finding_level: 'blocker'` and
`repair_required: True` on **every** finding it selected, F4 included, by construction. The canon's
closure model does not do that: `repair_required` is an explicit boolean (Bootstrap Planning
Workflow, line 141), `PASS_WITH_WARNINGS` is terminal when every finding has `repair_required`
false (line 148), and a finding whose remedy needs a decision outside the plan carries the closure
status `blocked_requires_user_decision` (line 167). So under the canon's own vocabulary F4 is a
blocker-level finding with `repair_required` false for this plan and remedy owner root, which
PWIZ-028 records as an open question that does not block acceptance. The harness flag, not the
canon, is what made it block.

**What the strict reading implies.** F4's substance is event-authority currentness: the registered
hash of `Plans/GitLab_Integration.md` is stale because the candidate edited it, and the repo-wide
denominator has been `UNKNOWN_OPEN` since the forged certificate was voided. Closure is, by the
Event Authority's own design, *refreshed registration and fresh approval after stable edits*, which
happens after landing, never inside a seal. Every candidate that edits a registered owner document
therefore produces this row, and a reseal closes it only until the next edit. Read strictly,
DL-066 can never accept a seal that edits a registered document. DL-055 already settled the same
condition at landing: stale governance hashes for a branch's own edited documents are the expected
consequence of editing canon before the designated Plans agent's next reseal, do not stop the
landing, and are reported with a reseal request.

**Decision for Jared** (one card; nothing here changes until he answers):

- *Question.* When the affected-rows re-review leaves only findings whose remedy is owned by root
  governance (registration refresh, Event Authority approval, Spec Lock reseal) rather than by the
  plan's text, is the seal accepted with those findings recorded as open questions owned by root?
- *Why now.* R7-A revision-3 is otherwise the first seal that passed the whole bounded loop: the one
  candidate-introduced defect is closed, the repair stayed inside its bound, the re-review found
  nothing new. It is UNACCEPTED only on F4.
- *Options.* (1) Yes: root-owned obligations are open questions with a named owner and a reseal
  request, the same treatment DL-055 gives them at landing; the harness computes `repair_required`
  from the remedy owner instead of hardcoding it; revision-3 becomes the first accepted seal, with
  F4 (root), F3 (harness), F5 (subject) and the two bounded unknowns on its open-question list.
  (2) No: keep the strict reading and perform the owed reseal first; revision-3 stays UNACCEPTED
  until then, and the next edited candidate re-opens the same row. (3) Both: adopt (1) and schedule
  the reseal, which is owed since 2026-09-07 regardless.
- *Coordinator's recommendation.* (3). Option (2) alone cannot produce an accepted seal for any plan
  that edits a registered document, because the closure step is defined to run after landing.
- *Record.* If accepted, a one-sentence addendum to PWIZ-028 and a DL entry (next free number after
  DL-067), landed with the acceptance branch or right after it; the harness change is B11 and does
  not wait for the canon text.

The sealed disposition of attempt R7A-REREVIEW-002 is not altered by this note.
