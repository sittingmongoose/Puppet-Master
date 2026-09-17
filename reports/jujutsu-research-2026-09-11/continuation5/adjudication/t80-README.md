# Continuation 5 adjudication — T80 (the turn-budget control)

**I am an Opus 5 agent** (`claude-opus-5[1m]`) acting as adjudicator. I ran no arm. Every figure was
rebuilt from durable state, and every credited code fact was verified against the pinned source in
the arm's own cache.

`claude-opus-5` at effort **xhigh**, on the same premium artifacts and the same frozen starting
state, in the **frozen** lead order, with the same 12 admissions, 3 workers and $20 per job as
claude-hicap. **One variable: 80 responses per job instead of 160.**

**Scored: T80 attempt 2 only.** Attempt 1 is archived — cut by a since-corrected sentinel rule that
fired on a seven-day `allowed_warning` at 0.25 utilization while the five-hour window was clean and
spend was $36.68 of $150. Not money, not an arm limit.

## This is the cleanest comparison in the campaign

Every other arm pair differs in at least two ways. This pair differs in one. I confirmed it by
checking lead sets job by job: **J0017 through J0025 carry identical lead sets in both runs**, and
the three compare jobs carry the same three lead groups, paired to different job numbers only
because reconcile completion order differed. So every credit difference is the ceiling, the clock,
or run-to-run variance — and the decomposition below separates the three.

## Four-arm comparison

| | claude-hicap (baseline) | Arm P (prioritized depth) | Arm B (breadth → compare) | **T80 (ceiling 80)** |
|---|---:|---:|---:|---:|
| **Credited / 110** | **45 (40.91%)** | 32 (29.09%) | 39 (35.45%) | **26 (23.64%)** |
| corrections / 5 | 2 | 0 | 1 | **1** |
| optional capability / 36 | 4 | 2 | 6 | **1** |
| product choice / 6 | 3 | 1 | 1 | **0** |
| unsupported or covered / 63 | 36 | 29 | 31 | **24** |
| Response ceiling | 160 | 160 | 160 | **80** |
| Max responses actually used | 110 | 89 | 86 | **80 (the cap)** |
| Leads reaching a comparison | 14 of 88 | 16 of 88 | 32 of 88 | **11 of 88** |
| Credits per compared lead | **3.21** | 2.00 | 1.22 | **2.36** |
| Admission order | frozen | Muse ranking | frozen (Muse delivery) | **frozen** |
| Reconcile model | Opus 5 | Opus 5 | Muse Spark | **Opus 5** |
| Jobs bound by the response ceiling | 0 | 0 | 0 | **3 of 12** |
| Jobs cut by another limit | 0 | 1 (account session limit) | 0 | **1 (3,600 s timeout)** |
| Captured cost | $82.52 | $85.50 | $102.56 | **$76.45** |
| Cost per credited finding | **$1.83** | $2.67 | $2.63 | **$2.94** |
| Arm wall | 3,535 s | 4,193 s | 5,509 s (two stages) | **6,260 s** |
| Candidates inside a continuation-3 rejection | — | 4 of 6 | 0 of 6 | **0 of 4** (1 half-flagged) |
| New to the campaign union | — | 0 | 3 | **0** |

**Against claude-hicap: gained 1, lost 20, net −19.** Gained **F068** (description drafts survive
refresh) — earned in a turn-capped job. Lost F028, F032, F037, F043, F044, F050, F051, F053, F059,
F062, F066, F072, F074, F083, F087, F088, F090, F092, F094, F106.

**Against Arm P: net −6.** Gained F029, F031, F034, F036, F068, F107; lost F005, F019, F044, F050,
F051, F052, F054, F057, F064, F072, F090, F094.

**Against Arm B: net −13.** Gained F080; lost F005, F025, F027, F037, F043, F044, F050, F057, F059,
F060, F066, F086, F094, F110.

T80's **11 compared leads are a strict subset of claude-hicap's 14**. The three it lacks are exactly
the lead group its `J0028-compare` timed out on.

# THE HEADLINE: 19 findings separate 80 turns from 160, and only 2 of them are the ceiling

The 20 findings lost against claude-hicap decompose four ways, and I attributed each one to the job
that should have produced it.

| Cause | Count | Findings | Where |
|---|---:|---|---|
| **The 80-turn ceiling** | **2** | F092, F094 | `J0027-compare` capped at 80 on the lead group hicap's `J0026-compare` spent **110** responses on |
| **The 3,600 s job limit — not the ceiling** | **8** | F050, F051, F059, F062, F066, F072, F087, F088 | `J0028-compare` killed at the wall having used only **60 of its 80** permitted responses; zero output |
| **Capped but confounded with variance** | **2** | F032, F043 | `J0017`/`J0018` hit 80, but hicap completed **the same single leads in 66 and 58** |
| **Jobs that hit NO LIMIT AT ALL** | **8** | F028, F037, F044, F053, F074, F083, F090, F106 | `J0020`, `J0021`, `J0022`, `J0026` all finished under every limit, on lead sets identical to hicap's |

**So the marginal value of raising 80 → 160 on this workload is about 2 findings**, and only for the
minority of jobs that want more than 80 turns — **1 of 12 here**. The 30 turns from 80 to 110 bought
exactly two findings on the one job group that needed them. Everything else in the 19-finding gap is
a clock fault or noise.

## THE VARIANCE FLOOR: 8 findings, no limit involved

This is the most useful number the arm produced. `J0020`, `J0021`, `J0022` and `J0026` completed
under every limit — no ceiling, no timeout, no money bound, no rate limit — on lead sets identical
to claude-hicap's, with the same model at the same effort, and still missed **eight** union findings
that hicap earned on those same leads.

**Two runs of `claude-opus-5` over identical inputs differ by 8 union findings through run-to-run
variance alone.** That is four times what the turn ceiling itself cost, and it is a floor on how much
of *any* arm-to-arm difference in this campaign can be read as a real effect.

It qualifies my own earlier reports. Arm B's 6-finding deficit against claude-hicap sits **inside**
this band and should not be read as an effect of the breadth/depth split. Differences of roughly
eight findings or fewer, between two single runs, are not distinguishable from noise here.

## A capped job is not an empty job

All three turn-capped jobs wrote **complete documents** — `J0017`, `J0018` and `J0027` each end on a
finished summary section, not mid-sentence. The ceiling ended the turn loop *after* the conclusions
were written, so nothing was lost to truncation of the document itself; what was lost is work never
done. **Seven of the arm's 26 credits were earned in those jobs** (F004, F006, F030, F061, F068,
F084, F107), including F068, the only finding this arm reaches that claude-hicap did not. The capped
compare job still reached **five of the seven** findings hicap earned on the same leads with 110
turns.

The timed-out job is the opposite case and the only real hole: `J0028-compare` wrote no `notes.md`
at all and delivered nothing.

## Per-job attribution of the capped and timed-out jobs

| T80 job | Limit | hicap counterpart | hicap used | hicap credits on those leads | T80 reached | Lost |
|---|---|---|---:|---|---|---:|
| `J0017-reconcile` | capped at 80 | `J0017-reconcile` | **66** | F032 | — | 1 |
| `J0018-reconcile` | capped at 80 | `J0018-reconcile` | **58** | F043 | — | 1 |
| `J0027-compare` | capped at 80 | `J0026-compare` | **110** | F004 F006 F030 F061 F092 F094 F107 | F004 F006 F030 F061 F107 | **2** |
| `J0028-compare` | **timeout, 60 of 80 used** | `J0027-compare` | 78 | F050 F051 F059 F062 F066 F072 F082 F084 F087 F088 | F082 F084 (from other leads) | **8** |

The two capped *reconciles* are not a ceiling result: hicap completed the same single leads in fewer
responses than T80's ceiling allowed, so 80 was not structurally insufficient — those two runs simply
took a longer path. The capped *compare* is the genuine ceiling case. The timeout is a clock fault.

## The arm with the lowest ceiling is the slowest of the four

Arm wall **6,259.7 s** — 104 min 20 s, **29 minutes over the 75-minute target**, and slower than
claude-hicap (3,535 s), Arm P (4,193 s) and Arm B's compare stage (3,981 s). Reconcile wall 2,647.3 s,
compare wall 5,522.1 s, summed job time 12,850 s at 2.05 average concurrency. The single 3,600 s
timeout accounts for most of the overrun: it held a worker for a full hour and produced nothing.
**A lower response ceiling did not make the arm faster, because the binding constraint on wall time
was a job that was not turn-bound at all.**

## Verification

Manifest `b5498edb9f39ef4e444a109362c6233d1e1e7af0b5021436c9679facc33c448b` (13,222 files) verifies
**three ways** — recomputed from the sorted rows, matched against the runner's quoted value, and an
independent tree re-hash — with **zero differing files**. Terminal stop `Stop: admitted_attempt_cap`
in `campaign-terminal.json`: a designed gate, confirmed before scoring.

**Attempt boundary, recorded precisely.** The coordinator quoted `472b5e5eaa…` for attempt 1; that is
the **archive directory's** manifest. The archived run tree's own output manifest is `7b8c1ad075…`.
Two different objects; both recorded in `t80-scoring.json`.

**Code facts: 3 verified, 3 upheld.**

- **V-T1** — jj-lib 0.44.0 `op_heads_store.rs` `resolve_op_heads`, lines 146–151: the branch commented
  `// Return without creating a merge operation` **still calls** `op_heads_store.update_op_heads(&ancestor_op_heads, op_head.id())`,
  and that marker write **precedes the resolver call at line 155**. This is the fact the arm's
  refinement of F002 rests on.
- **V-T2** — `OpHeadsStore::update_op_heads` doc: *"Remove the old op heads and add the new one."*
- **V-T3** — `lib/src/stacked_table.rs:352–375` `save_in` serializes, hashes with **Blake2b512**, uses
  the hex digest as the file name and calls `persist_content_addressed_temp_file`. Segment names are
  content hashes, so the arm's ordering argument follows.

Re-checked from my Arm P adjudication: the unconditional `tables[1..]` removal loop (V-P1) and
`save_table`'s `parent_table.name != table.name` guard (V-P5), both at v0.44.0.

## Job table

| Job | Phase | Bound by | Elapsed s | Responses | Leads | Delivered | notes.md | Ends cleanly | Credits |
|---|---|---|---:|---:|---:|---:|---:|:---:|---:|
| `J0017-reconcile` | reconcile | **ceiling 80** | 817.8 | **80** | 1 | 1 | 23,141 | yes | 0 |
| `J0018-reconcile` | reconcile | **ceiling 80** | 928.1 | **80** | 1 | 1 | 28,430 | yes | 0 |
| `J0019-reconcile` | reconcile | finished | 730.8 | 41 | 3 | 3 | 36,861 | yes | 0 |
| `J0020-compare` | compare | finished | 1019.3 | 74 | 3 | 3 | 47,589 | yes | **7** |
| `J0021-compare` | compare | finished | 870.6 | 61 | 1 | 1 | 37,468 | yes | **7** |
| `J0022-compare` | compare | finished | 762.1 | 56 | 1 | 1 | 41,192 | yes | **2** |
| `J0023-reconcile` | reconcile | finished | 950.5 | 79 | 3 | 3 | 40,659 | yes | 0 |
| `J0024-reconcile` | reconcile | finished | 771.2 | 67 | 3 | 3 | 37,065 | yes | 0 |
| `J0025-reconcile` | reconcile | finished | 686.7 | 53 | 3 | 3 | 43,084 | yes | 0 |
| `J0026-compare` | compare | finished | 853.0 | 77 | 3 | 3 | 50,905 | yes | **3** |
| `J0027-compare` | compare | **ceiling 80** | 859.0 | **80** | 3 | 3 | 67,312 | yes | **7** |
| `J0028-compare` | compare | **timeout 3,600 s** | 3600.6 | 60 | 3 | **0** | **0** | — | 0 |

Responses 41–80, mean 67.3. `J0028` is the only accounting-incomplete job — gaps
`missing_native_result_record` and `missing_usage_sidecar`, carrying **$12.00 unresolved**; 11 of 12
jobs reconciled. **No money truncation, no rate limiting, no admission hold.** The meter records zero
hold events and the sentinel never fired. Every limit in this arm is a real one.

**Request-limited coverage:** 3 of 12 jobs bound by the 80-response ceiling (`J0017`, `J0018`,
`J0027`), 1 killed by the job time limit (`J0028`), 8 finished. **Reached delivery: 25 deliveries,
11 of 12 jobs wrote `notes.md`, 11 of 88 leads compared.**

## Recall: 26 / 110 (23.64%)

corrections **1/5** (F107) · optional capability **1/36** · product choice **0/6** · unsupported or
already-covered **24/63**. Five partials: F037, F053, F028, F001, F022.

| ID | Title | Class | Job | |
|---|---|---|---|---|
| F002 | Nominal reads may write | unsupported or rejected | `J0020-compare` | |
| F004 | Writer authority is stronger than native locks | unsupported or rejected | `J0027-compare` | **capped** |
| F006 | Exact durable identity and operation-local selectors | unsupported or rejected | `J0027-compare` | **capped** |
| F007 | Process failure and cancellation are not no-effect proof | unsupported or rejected | `J0022-compare` | |
| F008 | Partial multi-file resolve | unsupported or rejected | `J0022-compare` | |
| F010 | Native versus sidecar crash boundary | unsupported or rejected | `J0020-compare` | |
| F011 | Native recovery has explicit scope | unsupported or rejected | `J0026-compare` | |
| F029 | Hunk and editable diff safety | unsupported or rejected | `J0021-compare` | |
| F030 | Empty, absent and failed reads are distinct | unsupported or rejected | `J0027-compare` | **capped** |
| F031 | Diff text and metadata round-trip | unsupported or rejected | `J0021-compare` | |
| F033 | External editor path confinement | unsupported or rejected | `J0021-compare` | |
| F034 | Partial external editor writes | unsupported or rejected | `J0021-compare` | |
| F035 | External diff and merge tool handoff | optional capability | `J0021-compare` | |
| F036 | External editor stale sessions | unsupported or rejected | `J0021-compare` | |
| F056 | Native conflict truth and supported shape | unsupported or rejected | `J0021-compare` | |
| F061 | Graph bounds, continuity and isolation | unsupported or rejected | `J0027-compare` | **capped** |
| F068 | Description drafts survive refresh | unsupported or rejected | `J0027-compare` | **capped** |
| F073 | Runtime evidence versus unused scaffolding | unsupported or rejected | `J0020-compare` | |
| F079 | Complete retained native backup closure | unsupported or rejected | `J0020-compare` | |
| F080 | Snapshot omission and skipped checkout | unsupported or rejected | `J0026-compare` | |
| F081 | Backup existence is not verified recovery | unsupported or rejected | `J0020-compare` | |
| F082 | Extras head integrity and crash corruption | unsupported or rejected | `J0020-compare` | |
| F084 | Sanitized inactive restore configuration | unsupported or rejected | `J0027-compare` | **capped** |
| F089 | Partial clone and LFS/submodule eligibility | unsupported or rejected | `J0026-compare` | |
| F102 | Upstream narrative inconsistencies | unsupported or rejected | `J0020-compare` | |
| F107 | Graph page consistency and adjacency bounds | **correction** | `J0027-compare` | **capped** |

### Partials (recorded, not credited)

- **F037** *Bound reads before allocating* — `J0021` records the external fact (the scan marks
  oversized/NUL/invalid-UTF-8 files unsupported **after a full read**, and drops walk errors) and its
  typed model keeps a `too_large{limit, measured}` variant, but never states the obligation to bound
  the read before allocating. hicap stated it on the same lead in an unlimited job.
- **F053** *Windows links and native file types* — names symlink target bytes and the Windows
  read-only attribute, adds `type_change{before_kind, after_kind}`, but not the distinctive clause
  separating a Windows link or reparse point from its target.
- **F028** *Machine-readable hunk selection* — the typed per-path selection family is the right shape,
  but scoped to the internal contract rather than exposed to agents and scripts.
- **F001** *Terminal attempts always have receipts* — requires an after-operation identity and a
  receipt for one case (a mutation that failed after committing its transaction), not the general
  obligation. Refused on the same test I applied to six earlier arms.
- **F022** *Divergent change convergence* — proposes representability of divergent and hidden changes,
  which is not the explicit convergence of commits sharing one change identity. Same call as for
  claude-hicap and Arm B.

## T80 adds nothing to the campaign union

Every one of its 26 credits was already reached by an earlier arm. The **nine-arm union stays at 62
of 110 (56.36%)** and findings reached by no arm stay at **48**. That is the expected result for a
control: it was run to measure a limit, not to extend coverage. Its single finding over claude-hicap
(F068) was already held by Arm B and by the continuation-4 union arm.

## Out-of-union candidates

Four, each checked against continuation 3's four rejected expansions. **None falls wholly inside
one**; one has a half I am flagging.

### C5T-01 — Divergent operation heads are not a named condition, and PM's own storage owner already refuses the equivalent

**Where** `J0020-compare`. **My classification: correction.**

**The assertion.** Every PM read of a JJ repository binds an **explicit operation id** and loads at it;
`--ignore-working-copy` alone is not a sufficient read fence and `--at-op=@` is not equivalent, because
`resolve_op_heads` performs the ancestor-marker cleanup write before the `@` resolver is reached.
`divergent_operation_heads` becomes a typed first-class condition on the closure record and the
restore-verification receipt, distinct from conflicts, collisions, missing object closure, stale target
state and operation mismatch; capture records it, verification blocks on it, and PM never resolves it
implicitly as a side effect of reading.

**Passages cited.** `Plans/Jujutsu_Integration.md:453-454, :458, :468, :470, :502`; JJI-003:114;
JJI-004:152-158 · `jujutsu_integration_contracts.schema.json:2183-2190` (closure `operation_head_refs`)
and `:2441-2448` (the receipt's own set), **with no binding between them** ·
`forge_backup_tsnet_acceptance.json:1592` REST-007 · **the in-corpus precedent the arm found:**
`Plans/Decision_Log.md:1974` — *"Divergent fallback histories cannot be automatically merged or
overwritten"* — with `fallback_diverged` a recorded state token at `:1970`, and `Decision_Log.md:233`
listing *"no divergent auto-merge, overwrite, or deletion"* among the closed negative constraints ·
jj-lib 0.44.0 `op_heads_store.rs` (verified by me as V-T1).

**Did continuation 3 already reject it?** **No.** Note its relationship to rejection 2, which declined
*a mutating `status.refresh` branch* because a writer-bearing branch would change read authority: this
candidate goes the **other** way, keeping reads non-authoring by binding them to an explicit operation
id — the same side the continuation-4 union arm and claude-hicap took.

**Distinctness.** F002 and F081 are both credited to this arm. What is outside the union is the typed
**condition** and the **precedent**: PM's storage owner already forbids automatic divergent-history
merging *by name*, while the JJ owner has no counterpart, and literal searches return no match for
`op_heads` anywhere in the selected corpus and no Jujutsu-context match for `divergent`.

*Not added to the union. The strongest candidate from this arm, and the in-corpus precedent is what
makes it cheap to adopt.*

### C5T-02 — The GC fence as written is not achievable against external writers

**Where** `J0020-compare`. **My classification: correction.**

**The assertion.** *"Suspend/coordinate JJ/Git GC/prune/rewrites during capture"* cannot be satisfied
against writers PM does not control. Replace it with a fence that is actually constructible —
detection and disclosure of whether a GC ran across the capture window — rather than a suspension PM
has no mechanism to perform.

**Passages cited.** `Plans/forge_backup_tsnet_acceptance.json:1157` ·
`Plans/Jujutsu_Integration.md:452-453` and `:464` (capture barrier and GC fence) ·
`Plans/Source_Control_System.md` SCS-014:793.

**Did continuation 3 already reject it?** **No.** Arm P raised the neighbouring candidate C5P-01 (the
JJ closure record cannot *express* whether the fence held); this is its complement — not that the
outcome is unrecordable, but that the requirement as worded is **unperformable**. Two independent arms
found the same clause unenforceable for two different reasons.

**Distinctness.** F079 is credited to this arm; this is the wording repair behind it.

*Not added to the union.*

### C5T-03 — A typed Source-Control content-selection model and its apply boundary

**Where** `J0021-compare`. **My classification: product choice.**

**The assertion.** One typed per-path entry family — `text{bytes_ref, eol_profile}`, `absent`,
`empty_file`, `binary`, `unsupported{reason}`, `symlink{target_bytes}`, `submodule/gitlink{oid}`,
`mode_change`, `type_change`, `too_large{limit, measured}`, plus a per-entry selection state — reused
by the Changes list, diff view, review surface, conflict surface and any split/squash/restore
selection. The apply boundary takes that typed set, never a path-to-string map, bound to repo,
workspace, change, expected operation, writer lease, FileSafe decision and idempotency key.

**Passages cited.** `Plans/runtime_artifact_code_diff.schema.json:153-178` and
`Plans/evidence.schema.json:602-618` (the only file-status vocabularies in the corpus, both
line-count-shaped evidence projections) · `Plans/FileSafe.md:1492-1500` (the one typed manifest that
already has the shape) · `Plans/Jujutsu_Integration.md:91, :113-114, :255-287, :301` ·
`Plans/Source_Control_System.md:126-131`.

**Did continuation 3 already reject it?** **Partially, and I am flagging it.** The apply boundary
implies a content-selection **route** for Jujutsu, and the corpus's 31-command inventory has none —
which puts that half adjacent to the declined *"arbitrary conflict editor"* cluster that C4D-04,
C4M-03, C4G-02 and C5P-05 were all flagged under. The typed-entry model itself is not in that cluster
and is the part I would keep.

**Distinctness.** F029, F030 and F031 are credited to this arm and are the individual obligations; this
is the single shape that would satisfy all three at one boundary.

*Not added to the union; the apply-route half is flagged.*

### C5T-04 — The sanitisation lists are security-shaped and layout-blind

**Where** `J0027-compare` (a turn-capped job). **My classification: correction.**

**The assertion.** Every sanitisation list in the corpus removes credential-bearing and executable
material, and **none** mentions the configuration and pointer files that decide *where* a restored
repository reads from. Searched and absent from the whole corpus: `core.worktree`, `core.bare`,
`core.sparseCheckout`, `extensions.worktreeConfig`, `commondir`, `git_target`,
`repositoryformatversion`; `gitdir` appears only in the Git worktree owner, in no backup or restore
path.

**Passages cited.** `Plans/Source_Control_System.md:798`; `Plans/Jujutsu_Integration.md:471`;
`Plans/Backup_Restore_System.md:150-158` · `Plans/WorktreeGitImprovement.md:875, :890, :5237` (where
`gitdir` does appear, in a different owner) · `gitrepository-layout` 425-430 —
`worktrees/<id>/gitdir` is *"A text file containing the absolute path back to the .git file that
points to here"* · `git-worktree(1)` 486-508 — `core.worktree` *"should never be shared"*;
`extensions.worktreeConfig`: *"Older Git versions will refuse to access repositories with this
extension."*

**Did continuation 3 already reject it?** **No.** Same family as Arm P's C5P-04 and Arm B's C5B-02 —
defects in the restore path found by reading what the records do not carry — and none of those is
rejected either.

**Distinctness.** F084 is credited to this arm for the sanitized-inactive obligation. This is the
specific enumeration: **the lists are complete for secrets and empty for layout**, so a restored copy
can be sanitized and still point at the original tree.

*Not added to the union. Earned in a turn-capped job.*

## Observations

**The control result.** 80 turns costs 19 findings against 160, and only **2** of them are the
ceiling. Eight are one job lost to the clock, two are capped-but-confounded, and eight are pure
variance. See the decomposition table above.

**The variance floor is the campaign's most reusable number.** Eight union findings separate two runs
of the same model on identical inputs with no limit involved — four times what the ceiling cost. It
applies retrospectively to every comparison I have published in this campaign.

**A capped job is not an empty job.** All three ceiling-cut documents end cleanly and produced seven
of the arm's 26 credits, including its one finding over claude-hicap. Only the timed-out job is a hole.

**The arm with the lowest ceiling is the slowest of the four**, and one job caused it. A lower
response ceiling did not make the arm faster because the binding constraint on wall time was a job
that was not turn-bound at all.

**T80 produced the campaign's most precise statement of the extras-marker defect.** Arm P established
that `get_head_locked` removes `tables[1..]` with no exclusion of the merged table's own name. T80
identifies the exact ordering condition under which v0.44.0's guard fails to help: because segment
files are content-addressed, if `tables[0]` is an **ancestor** of `tables[1]` the merged table
serializes to the same bytes and therefore the same name as `tables[1]`; `save_table` removes
`heads/<tables[0]>` because the names differ and the guard does not fire, and the `tables[1..]` loop
then removes `heads/<tables[1]>` — leaving `heads/` empty with every segment blob intact.
*"The 0.44.0 guard only protects the reverse ordering; readdir order decides."* The arm marks this a
refinement of the inherited child note, *"which asserted the loss without the ordering condition."*
I verified the content-addressing it rests on (V-T3). It came out of `J0020-compare`, which used 74
of 80 responses — **not a turn-budget effect**.

**It also corrects Arm B's recommended remedy on a shared finding.** Arm B's `J0047` recommended
`--at-op=@ --ignore-working-copy` as the non-mutating read mode, following jj's own CLI reference.
T80's `J0020` shows that is still not enough: `--at-op=@` routes through `resolve_op_for_load`, whose
`@` resolver returns `MultipleOperations` rather than merging, **but `resolve_op_heads` performs the
ancestor-marker cleanup write before that resolver is reached**. So `@` is a divergence detector, not
a read fence; only an explicit operation id avoids head resolution entirely. Verified as V-T1. Arm B's
credit stands — the finding is correct — but its remedy is superseded.

**T80 adds nothing to the campaign union**, which is the expected result for a control.

## Limits

- One frozen case, one ceiling comparison, one run at each ceiling. The variance floor measured here
  (8 findings) is itself a single-sample estimate.
- The scored result is attempt 2; attempt 1 was cut by a since-corrected sentinel rule and is archived.
- Recall is measured against continuation 3's fixed 110-finding union, built from premium and hybrid
  output; every arm can only score inside it.
- *"Unsupported or already-covered"* is a union class, not a false-positive rate.
- Adjudicator and the reviewed model share a family; code facts were verified against pinned bytes to
  make the judgement re-checkable.

## Files

| File | Contents |
|---|---|
| `t80-findings.json` | 26 credited rows with class, job, capped flag, premium/hybrid support, basis, evidence hashes, code-fact verifications and clause coverage; 5 partials |
| `t80-candidates.json` | 4 out-of-union candidates and 7 observations, with rejection checks |
| `t80-scoring.json` | Three-way manifest verification, job table, per-job attribution of the capped and timed-out jobs, the 80→160 decomposition and variance floor, four-arm comparison, cost, timing, limits |
| `PROGRESS.md` | Stage-by-stage progress note |
| `../t80-manifest.json` | Hash manifest for this directory |

Runner bundle: branch `research/continuation5-20260917`, commit `5b519ce413`, at
`reports/jujutsu-research-2026-09-11/continuation5/`. Referenced by path; its tables are not
duplicated here.
