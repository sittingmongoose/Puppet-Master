# Continuation 5 adjudication — A24 (the admission-budget arm)

**I am an Opus 5 agent** (`claude-opus-5[1m]`) acting as adjudicator. I ran no arm. Every figure was
rebuilt from durable state, and every credited code fact was verified against the arm's own pinned
checkout.

`claude-opus-5` at effort **xhigh**, on the same premium artifacts and the same frozen starting state,
in the **frozen** lead order, 3 workers, 160 responses / 3,600 s / $20 per job — the same as
claude-hicap. **One variable: 24 admissions instead of 12.**

**Scored: A24 attempt 2 only.** Attempt 1 is archived, cut by an arm collision and a hold race.

## This is the cleanest admission comparison possible

claude-hicap's **14 compared leads are a strict subset** of A24's 26, and the split falls exactly on a
job boundary. I checked it lead by lead:

| | A24 compare jobs | leads |
|---|---|---:|
| **Exactly claude-hicap's leads** | `J0020`, `J0021`, `J0022`, `J0026`, `J0027`, `J0029` | **14** |
| **Leads hicap never reached** | `J0031`, `J0033`, `J0035`, `J0036` | **12** |
| Lost to the sentinel | `J0038` | 3 |

So the marginal value of admissions 13–24 is not an estimate. It is whatever the last four compare
jobs produced that the first six did not.

# THE RESULT: doubling admissions bought five findings and cost two

**A24 scored 43/110 (39.09%) against claude-hicap's 45 — a net of −2 — while comparing 26 leads to 14
and spending $162.15 against $82.52.**

| | Credits | Leads | Per lead |
|---|---:|---:|---:|
| A24's first six compare jobs (hicap's own 14 leads) | **38** | 14 | **2.71** |
| A24's last four compare jobs (12 new leads) | **5 new** | 12 | **0.42** |
| claude-hicap, same 14 leads | **45** | 14 | 3.21 |

The five findings the marginal twelve leads bought: **F005** (expected operation is not native
compare-and-swap), **F025** (change evolution view), **F027** (persistent review marks), **F057** (the
0.44 carriage-return conflict defect), **F086** (clone completion and cleanup). Two of those are
genuinely new readings of this case. Against a fixed union of 110, **the twelfth-to-twenty-fourth
admission bought five findings for about $80**.

**Credits per compared lead across the campaign:** claude-hicap 3.21 · A24 first-14 2.71 · T80 2.36 ·
Arm P 2.00 · A24 overall 1.65 · Arm B 1.22 · **A24 last-12 0.42**.

## THE VARIANCE FLOOR, CONFIRMED A SECOND TIME

On lead sets that were **identical**, with the same model at the same effort and **no limit reached by
either run**, A24 earned **38** where claude-hicap earned **45**. That is a **seven-finding** run-to-run
difference. T80 measured **eight** on four jobs; A24 measures **seven** on six.

**Two independent estimates, 7 and 8, on the same case and the same model.** This is now the
best-supported number in the campaign, and it governs every table in this bundle: any arm-to-arm
difference smaller than about eight findings is **not distinguishable from noise**.

Inside the band: A24 vs hicap (−2), A24 vs Arm B (+4), Arm B vs hicap (−6). Outside it, and therefore
real: Arm P (−13), T80 (−19), A24 vs T80 (+17).

The eight hicap found on those same fourteen leads that A24 did not: F036, F043, F062, F083, F088,
F092, F094, F106.

## The three stopped jobs are the sentinel, not money

All three carry `runtime_status: budget_truncated` and `bound_by: budget` — the label the adapter puts
on **any** meter denial. The journal says otherwise, in order:

1. `admission_hold_pinned`, reason *"typed rate_limit_event five_hour status=allowed_warning
   utilization=0.9"*, `committed_without_hold_usd: 176.46`, `cap_usd: 300`, **`pin_size_usd: 145.19`**,
   `committed_with_hold_usd: 321.66`;
2. three `next_request_denied` events for `J0038`, `J0039`, `J0040`, reason `captured_plus_live_cap`;
3. `admission_hold_released` once the arm reached its terminal.

**The arm's own spend was $176.46 of a $300 cap.** It was the sentinel's headroom hold that pushed
committed over the cap. This is the rate-limit gate firing, and it is the same caveat I recorded for
deepseek41 in continuation 4: read the journal, not the status.

**And the hold behaved correctly.** It fired *after* all 24 admissions were spent, so it cost no
admissions; live jobs were denied their next request and settled to their own terminals rather than
being cancelled; **all 24 jobs reconciled with $0.00 unresolved** — the cleanest accounting of any arm
in either continuation. `J0039` still wrote `notes.md` and delivered 1 of its 3 leads. On the measured
marginal yield of 0.42, the three stopped jobs cost roughly **one** union finding.

## A high-quality job can produce zero marginal credit

`J0031-compare` is the campaign's sharpest statement that `$defs/command_result` carries **no condition
on `cancelled`** beyond "has an error payload" — so a cancelled `cmd.jujutsu.git.push` may report
`effect_state: none` with a null `after_revision` and empty `affected_identities` **and validate**. It
proves the corpus's one cancelled fixture is *clone*, the single operation where absence of effect is
provable because the destination is new. Every union finding it reaches (F007, F074, F081) had already
been earned from the first fourteen leads. **Three fresh leads, real new work, zero marginal credit.**

That is what the 0.42 figure is made of, and it is a property of measuring against a **fixed** union as
much as of the leads.

## A24 bounds a blast radius three earlier arms left unbounded

`J0020` verified the whole matcher chain first-hand at its own pinned commit
(`a497458e49e89a5559f32f3884e1d5294bd77a4f`) and closed its own open uncertainty. I re-verified both
sites against that checkout:

- **V-A1** — `cli/src/merge_tools/diff_working_copies.rs:297–318`: `snapshot_results` snapshots
  `diff_wc.output.unwrap_or(diff_wc.right)` with `start_tracking_matcher: &EverythingMatcher`,
  `force_tracking_matcher: &NothingMatcher`, `max_new_file_size: u64::MAX`.
- **V-A2** — `lib/src/local_working_copy.rs:1314–1326`: the effective matcher is
  `IntersectionMatcher::new(sparse_matcher, UnionMatcher::new(fsmonitor_matcher, force_tracking_matcher))`
  and a `None` fsmonitor matcher falls through to `&EverythingMatcher`; `:1436–1444`:
  `FsmonitorSettings::None => (None, None)`.

With `force_tracking_matcher = NothingMatcher` the union is `EverythingMatcher` and **the intersection
is exactly the sparse set**. A file the editor creates outside `changed_files` is *not* snapshotted; a
file it writes at a changed path is picked up with no prompt. The arm's own conclusion — *"the blast
radius should not be described as unbounded"* — is a correction to the campaign's earlier framing, made
by an arm against itself.

## Verification

Manifest `b08f251811a565eca2730ead9c256504da56fef3ace2bd361a6c333ef929f460` (18,368 files,
416,976,628 bytes) verifies **three ways** — rows recomputed, the runner's quoted value matched, and an
independent re-hash of the live tree — with **zero differing files**. Terminal stop `Stop:
admitted_attempt_cap` at 01:29:51Z, confirmed designed before scoring. All runner figures confirmed.

## Job table

| Job | Phase | Bound by | Elapsed s | Responses | Leads | Delivered | notes | Credits |
|---|---|---|---:|---:|---:|---:|:---:|---:|
| `J0017-reconcile` | reconcile | finished | 743.9 | 79 | 1 | 1 | yes | 0 |
| `J0018-reconcile` | reconcile | finished | 772.4 | 58 | 1 | 1 | yes | 0 |
| `J0019-reconcile` | reconcile | finished | 754.5 | 51 | 3 | 3 | yes | 0 |
| `J0020-compare` | compare | finished | 596.7 | 49 | 1 | 1 | yes | **8** |
| `J0021-compare` | compare | finished | 1214.6 | **131** | 3 | 3 | yes | **6** |
| `J0022-compare` | compare | finished | 745.1 | 72 | 1 | 1 | yes | **7** |
| `J0023-reconcile` | reconcile | finished | 725.0 | 82 | 3 | 3 | yes | 0 |
| `J0024-reconcile` | reconcile | finished | 932.2 | 92 | 3 | 3 | yes | 0 |
| `J0025-reconcile` | reconcile | finished | 1164.6 | 44 | 3 | 3 | yes | 0 |
| `J0026-compare` | compare | finished | 924.5 | 82 | 3 | 3 | yes | **6** |
| `J0027-compare` | compare | finished | 1322.8 | 67 | 3 | 3 | yes | **10** |
| `J0028-reconcile` | reconcile | finished | 936.7 | 88 | 3 | 3 | yes | 0 |
| `J0029-compare` | compare | finished | 1434.2 | 86 | 3 | 3 | yes | **3** |
| `J0030-reconcile` | reconcile | finished | 792.2 | 55 | 3 | 3 | yes | 0 |
| `J0031-compare` | compare | finished | 661.8 | 70 | 3 | 3 | yes | 0 new (corroborates F007, F074, F081) |
| `J0032-reconcile` | reconcile | finished | 671.7 | 45 | 3 | 3 | yes | 0 |
| `J0033-compare` | compare | finished | 905.8 | 69 | 3 | 3 | yes | **2** |
| `J0034-reconcile` | reconcile | finished | 836.2 | 53 | 3 | 3 | yes | 0 |
| `J0035-compare` | compare | finished | 1066.5 | 98 | 3 | 3 | yes | **2** |
| `J0036-compare` | compare | finished | 915.1 | 66 | 3 | 3 | yes | **1** |
| `J0037-reconcile` | reconcile | finished | 769.0 | 72 | 3 | 3 | yes | 0 |
| `J0038-compare` | compare | **sentinel hold** | 290.5 | 41 | 3 | **0** | no | 0 |
| `J0039-reconcile` | reconcile | **sentinel hold** | 236.0 | 27 | 3 | 1 | yes | 0 |
| `J0040-reconcile` | reconcile | **sentinel hold** | 200.7 | 32 | 3 | **0** | no | 0 |

Responses 27–131, mean 68.0. **Nothing hit a ceiling.** Zero request-, time-, money- or rate-limited
jobs; three stopped by the sentinel hold. $162.1497 of $300. **All 24 reconciled, $0.00 unresolved.**
26 of 88 leads compared, 22 of 24 jobs wrote `notes.md`.

Timing: reconcile wall 6,608.2 s, compare wall 5,863 s, **arm wall 6,617.0 s** (110 min, 47% over the
75-minute target), summed 19,612.7 s at **2.96 average concurrency** — the best-scheduled arm of the
five. The overrun is the admission count, not a stall.

## Recall: 43 / 110 (39.09%)

corrections **1/5** (F107) · optional capability **6/36** · product choice **2/6** · unsupported or
already-covered **34/63**. Six partials: F001, F022, F060, F083, F088, F108.

F002 F004 F005 F006 F007 F008 F010 F011 F025 F027 F028 F029 F030 F031 F032 F033 F034 F035 F037 F044
F050 F051 F053 F056 F057 F059 F061 F066 F068 F072 F073 F074 F079 F080 F081 F082 F084 F086 F087 F089
F090 F102 F107

**Against Arm P: +11.** Gained 16, lost F019, F052, F054, F064, F094.
**Against Arm B: +4.** Gained 9, lost F036, F043, F060, F094, F110.
**Against T80: +17.** Gained 18, lost only F036.

## A24 adds nothing to the campaign union

Every one of its 43 credits was already reached by an earlier arm. The **ten-arm union stays at 62 of
110** and findings reached by no arm stay at **48**. Three continuation-5 arms in a row — P, T80 and
A24 — have now added zero; only Arm B extended the union, by three.

## Out-of-union candidates

Six, each checked against continuation 3's four rejected expansions. **None falls inside one**; one has
a half I am flagging.

- **C5A-01** *(correction)* — a four-way, **version-bound** disposition for JJ store entries
  (`shared_content` / `host_local_pathmap` / `pointer` / `ephemeral_lock`), with restore rebinding path
  maps, dropping locks and rewriting pointers to stay inside the isolated boundary. The version binding
  is the part no earlier arm reached: the entry inventory moved between v0.44.0 and main, so a
  classification audited once silently rots. **The strongest candidate from this arm.**
- **C5A-02** *(correction)* — `store/git_target` is a host-local pointer the closure record does not
  enumerate, and `git_common_directory_ref` is *nullable* for `non_colocated`, so a structurally valid
  record can claim `complete` with the object store absent; on restore a surviving absolute target
  makes the "isolated" copy open the **original** Git store.
- **C5A-03** *(correction)* — **a capture blocked for a non-dependency reason is unrepresentable in
  both closure schemas.** `complete` requires `held_during_capture`; `partial`/`blocked` require
  `missing_dependency_refs` `minItems: 1`; `additionalProperties: false` and no blocked-reason field.
  So `{barrier_outcome: lost_during_capture, missing_dependency_refs: []}` cannot be recorded at any
  completeness value. I checked all four conditionals against the schema on `main`; they hold. **The
  most mechanically checkable candidate in continuation 5.**
- **C5A-04** *(correction)* — FileSafe's safe-point profile is defined entirely in Git terms and has no
  Jujutsu profile, while three owner documents require FileSafe to work for Jujutsu. The arm is
  scrupulous: *"I am not claiming this misbehaviour occurs. I am claiming the Plans do not determine
  that it cannot."*
- **C5A-05** *(product choice, half-flagged)* — a 32nd command, `cmd.jujutsu.bookmark.forget`. Raised
  independently by two jobs. It adds to a closed inventory, which is the class the standing rejection
  cluster covers — but it is not the conflict-editor surface and adds no content-selection route.
- **C5A-06** *(product choice)* — an `indirect_ancestor` edge kind for elided ancestry, plus checkable
  page arithmetic. Jujutsu's **default** log revset is filtered, so a filtered page routinely contains
  nodes whose real relationship is "ancestor with hidden commits between".

## Limits

- One frozen case, one admission comparison, one run at each admission count. The marginal-yield figure
  is a single-sample estimate.
- Recall is measured against continuation 3's fixed 110-finding union. The marginal leads can only
  re-earn findings that union already contains — which is exactly what the 0.42-per-lead figure
  measures, and is **not** a claim that those leads produced no value.
- One consistency note for the reviewer: I credited **F053** here and refused it to T80 as a partial.
  The test I applied is whether the arm states the type-transition **obligation** with the failure mode
  it rules out, not just the FileSafe vocabulary. A24 does (acceptance check 4 plus `src/fs.rs:113` and
  jj#8671); T80 named the vocabulary only. claude-hicap met the same standard A24 does.
- *"Unsupported or already-covered"* is a union class, not a false-positive rate.
- Adjudicator and the reviewed model share a family; code facts were verified against pinned bytes.

## Files

| File | Contents |
|---|---|
| `a24-findings.json` | 43 credited rows with class, job, basis, corroborating jobs, source verifications and evidence hashes; 6 partials |
| `a24-candidates.json` | 6 out-of-union candidates and 6 observations, with rejection checks |
| `a24-scoring.json` | Three-way manifest verification, the sentinel-versus-money finding from the journal, job table, the admissions 13–24 decomposition, four-arm comparisons, cost, timing, limits |
| `PROGRESS.md` | Stage-by-stage progress note |
| `../a24-manifest.json` | Hash manifest for this directory |

Runner bundle: branch `research/continuation5-20260917`, commit `ae54b3df2f`. Referenced by path.
