# Arm deepseek41 — adjudication against the continuation-3 union

I am an Opus 5 agent acting as adjudicator. I ran no arm. This scores the deepseek41 arm's frozen outputs
against the adjudicated 110-finding union from continuation 3, using continuation 3's own crediting rules.

Scope: the **clean rerun** `runs/jujutsu-deepseek41-20260916-202016` only. `arm-history/deepseek41-attempt-1/`
is not scored — it was cut short by an accounting defect.

Unlike Arm C, there is no model-family relationship between me and the reviewed model here.

## Verification of the arm's durable state

The runner reported manifest SHA-256 `de1811511814da303a8116ce53dbc260ec11144acc1054023b86dccc76206558`.
As with Arm C, that is the manifest's **internal** `manifest_sha256` over the sorted file rows, not the
manifest file's own bytes (`b07dae8a565233e449b0fc7d2ff246b3bc5266dae8823dd13d4e47f39eb2389a`). Both check out:

- Recomputing from the 7,015 rows reproduces `de181151…`.
- Independently re-hashing the whole run tree (7,015 files, 351,090,321 bytes) yields the same digest. The
  frozen tree is unaltered since the 2026-09-16T20:40:43Z freeze.

Job table rebuilt from `jobs/*/{job,outcome,delivery,native-job-end-accounting}.json` and
`raw-omp/usage.json`. Everything the runner reported reproduced: 12 jobs — **9 reconcile** (J0017, J0018,
J0019, J0020, J0021, J0023, J0025, J0026, J0027) and **3 compare** (J0022, J0024, J0028); 10 ceiling-bound
and 2 finished (J0025 at 39 responses, J0026 at 24); 470 native responses with receipts equal to responses
in all 12; reconcile wall 1133.74 s, compare wall 751.47 s, arm wall 1135.81 s, summed 3095.415 s, average
concurrency 2.7253; captured $0.531509; notes.md from 7 of 12; 17 receipted lead deliveries.

### The `budget_truncated` caveat, verified independently

The runner warned that the oh-my-pi adapter labels any meter denial `budget_truncated`, including a plain
response ceiling. I did not take the report's `bound_by` field on trust. From durable state:
`protocol/arm-budgets/deepseek41.json` carries **no per-job money ceiling**; the arm cap is $50 against
$0.531509 captured with a per-job maximum of $0.0592; `timing.json` has `money_stop_reason: null`; and every
`budget_truncated` job sits at 40–41 native responses while both `completed` jobs sit at 39 and 24.
**All 10 are response-ceiling truncations. No job was money-truncated.** Note the off-by-one: 7 of the 10
recorded 41 responses against a 40 ceiling, because the adapter registers a response that already happened
and then denies the next one.

### Two discrepancies against the runner's brief (recorded, no effect on scoring)

1. `raw-omp/run.json` records the runtime as the `omp-18.1.12-linux-x64` binary (sha256 `77c3520a…`)
   self-reporting version **`omp/18.2.2`**. The brief said oh-my-pi 18.1.13.
2. `protocol/arm-budgets/deepseek41.json` carries `bound.deepseek_metadata.selector =
   opencode-go/deepseek-v4-flash` (no `.1`), while all 470 receipts record `deepseek-v4.1-flash`.

**Both resolved by the runner, and the first one corrects me.** `arm-outputs/corrections.json` (read while
scoring claude-hicap) establishes that (2) is **not a deepseek41 field**: it is the frozen continuation-3
cost-policy block describing the *hybrid* arm's research model, copied into every arm's budget including
both Claude arms. My flag overstated it; the route actually called was never in doubt. And (1) is an
in-place binary replacement at the same path — the runtime self-reported 18.1.13 at 18:49Z and 18.2.2
afterwards, so the brief was correct when written and went stale. deepseek41 ran against 18.2.2. Neither
affects the score. The 41-against-40 response count is likewise resolved: the ceiling is enforced *after* a
response, so one further request can already be in flight.

## Assertion corpus — 19 documents across 8 of 12 jobs

notes.md from J0019, J0021, J0022-compare, J0024-compare, J0025, J0026, J0027 (all 7 `notes_sha256`
receipts match the file on disk), plus 12 `workspace/leads/*.md` from J0019 (1), J0020 (3), J0021 (2),
J0025 (3), J0026 (3). Full paths and hashes are in `evidence-manifest.json` in the repo bundle.

**J0020-reconcile is a scoring subtlety worth naming.** It authored three lead documents but never wrote
notes.md, so the scheduler receipted zero lead deliveries for it. Its saved lead documents are assertion
documents and are scored, per continuation 3's "budget-limited saved findings count when supported". One of
them, `jj-resolve-partial-result.md`, is the **sole** basis for the F008 credit — a premium-unique finding.
Scoring only receipted deliveries would have lost it.

Four jobs produced no assertion document at all: J0017, J0018, J0023 and **J0028-compare**.

## Credited findings — 33 of 110 (30.00%)

| Class | Credited | Denominator |
|---|---:|---:|
| Correction | 0 | 5 |
| Optional capability | 2 | 36 |
| Product choice | 1 | 6 |
| Unsupported or already-covered | 30 | 63 |
| **Total** | **33** | **110** |

On the fixed original-105 denominator: **33/105 (31.43%)** — none of F106–F110 was credited.

- **Optional capability (2/36):** `F035` external diff/merge tool handoff, `F066` direct graph manipulation.
- **Product choice (1/6):** `F032` edited-text line-ending policy — the line-endings lead poses exactly the
  choice ("per-row unchanged ⇒ write back original bytes, or an explicit, documented normalization decision").
- **Unsupported or already-covered (30/63):** `F002` `F004` `F006` `F007` `F008` `F010` `F011` `F029` `F030`
  `F031` `F033` `F034` `F036` `F037` `F050` `F053` `F056` `F059` `F061` `F062` `F072` `F074` `F079` `F080`
  `F081` `F082` `F084` `F089` `F092` `F102`.

Per-finding basis, job and evidence hashes are in `deepseek41-findings.json`. Highlights:

- **F008** — the partial-resolve lead traces `MergeToolPartialResolutionError` through `cmd_resolve`, which
  rewrites the commit with the partial tree and awaits `tx.finish()` **before** returning the error:
  "a nonzero native outcome need not mean no native mutation."
- **F089** — `fetch_if_missing = 1` in git v2.55.0 `odb.c`, fsck stopping its walk at the promisor boundary
  and never reporting promisor objects missing, so "a clean result is consistent with arbitrary absence
  inside that closure."
- **F056** — R1 finds the exact catalog row (`mark_conflict_resolved`, gated only on `no_conflict_markers`)
  whose stated precondition a marker-free file with an unresolved typed JJ conflict would satisfy.
- **F080** — 153 of 168 changed files "left at old content while HEAD/workspace commit/base moved on … No
  error, no conflict prompt — silent", which is F080's "successful commands with skipped paths" exactly.

## Partial matches — 9, recorded not credited

`F001` `F028` `F051` `F052` `F069` `F073` `F083` `F090` `F094`, each with its reason in
`deepseek41-findings.json`. `F051` is the one Arm C has and this arm does not: Arm C stated the
colocated-import/export-unavailable-by-default rule explicitly; deepseek41 stops at the adjacent
"no fallback Git mutation" policy citation. `F069` is a deliberate parity call — both arms are at the same
depth on that material and both are recorded as partial.

## Candidates outside the union — 4

Recorded with evidence, **not added to the union**. Full text in `deepseek41-candidates.json`.

| ID | Proposition (abbreviated) |
|---|---|
| C4D-01 (J0022 R2) | No record binds the JJ tool/format version a closure requires, so JJI-008 ac5's "version-compatible" cannot be validated by the Plans' own schemas. A required-field audit with a named validator path. |
| C4D-02 (J0024 R1) | `mark_conflict_resolved` is gated only on `no_conflict_markers`; for `scm_backend=jujutsu` it must require a fresh native conflict-state probe with `conflict_state_unresolved` as the blocked reason. |
| C4D-03 (J0024 R2) | The 31-entry JJ command inventory has no conflict-resolution entry, so the Conflict-assistant commands have no JJ-scoped precondition set. |
| C4D-04 (J0024 §5) | No save contract exists for a diff/compare or merge-editor surface. **Flagged as partly duplicative**: items 1–5 restate union findings already credited to this arm; the new part is the surface-level gap and the isolated-tree rule for third-party tools. |

`deepseek41-candidates.json` also carries four **observations**, including two cross-arm findings below.

## Two cross-arm findings

### 1. deepseek41 caught a factual error in Arm C, and I verified the correction myself

Arm C asserted — in J0019, J0022, J0026 and in its lead
`dojjo-sync-complete-prunes-operation-history.md` — that `op_store().gc(head, SystemTime::UNIX_EPOCH)`
"preserves nothing by recency", so the dojjo server mirror retains only what is reachable from the resolved
head after every sync. deepseek41's J0025 item 2 asserted the opposite, citing jj's
`lib/src/simple_op_store.rs`.

I read that source directly
(`runs/jujutsu-deepseek41-20260916-202016/cache/v3/repos/jj-vcs--jj/lib/src/simple_op_store.rs:285–298`):

```rust
let remove_file_if_not_new = |entry: &fs::DirEntry| -> Result<(), PathError> {
    let mtime = metadata.modified().expect("unsupported platform?");
    if mtime > keep_newer { /* "not removing" */ Ok(()) }
    else { /* "removing" */ fs::remove_file(&path) }
};
```

With `keep_newer = UNIX_EPOCH` every real file's mtime is greater, so **nothing is removed**. deepseek41 is
right and Arm C is wrong. Arm C's F079 and F004 credits stand on independent Plans citations, but its lead
`dojjo-sync-complete-prunes-operation-history.md` is materially false and one of the two external legs of
Arm C candidate C4C-05 rests on it. The Arm C files are amended accordingly.

Worth noting how deepseek41 got there: its own J0019 item 5 explicitly **declined** to assert the retention
effect ("was NOT verified — jj-lib source was not read"), and J0025 then went and read the source.

### 2. deepseek41 answered an open question Arm C had flagged

Arm C described GG's drag hints as typed target previews and flagged its own open question of whether the
hint appears at the drop target or only at the source. deepseek41's J0025 correction 4 answered it from
code: source-side highlight plus a drop-hint slot string, with no post-mutation preview anywhere. Not a
contradiction — a resolution. Both arms are credited under F066.

## Shared versus unique coverage

| | Count |
|---|---:|
| deepseek41 ∩ premium | 33 (all of them) |
| deepseek41 ∩ hybrid | 25 |
| deepseek41 ∩ premium only | 8 — `F008` `F031` `F032` `F033` `F034` `F036` `F053` `F084` |
| deepseek41 ∩ hybrid only | 0 |
| **Unique to deepseek41** | **0** |
| Held by premium, missed | 45 |
| Held by hybrid, missed | 65 |
| Held by **both** others, missed | 33 |

Against Arm C: **17 shared, 16 added by deepseek41, 1 (`F051`) held only by Arm C.** The two new arms
combined reach 34 of 110 (30.91%) — only one more than deepseek41 alone.

The eight premium-only findings are the whole story of the gap: `F008`, `F031`, `F032`, `F033`, `F034`,
`F036`, `F053` are the external-editor and diff-fidelity family, and they come almost entirely from one
compare job (J0024) plus the reconcile jobs feeding it. Arm C lost that entire family — both of its attempts
on those leads (J0017/J0021 reconcile, and no compare) produced nothing.

## Request-limited coverage

10 of 12 jobs ended at the 40-response ceiling; 2 finished. **Zero money truncations.** Four jobs produced
no assertion document (J0017, J0018, J0023, J0028-compare), their entire output being 8–115 source locator
receipts.

Three concrete losses:

1. **The graph triple was never compared.** `L-ad68a4ac94ad`, `L-2e0dc4dec29d` and `L-289201b4f4ec` — the
   leads whose Plans comparison produced **F107** in both premium and hybrid — were reconciled in full by
   J0026, and its pagination lead states every one of F107's obligations. But that triple was never admitted
   to a compare job: the 12-admission cap ran out first. So F107 was out of reach for both new arms, for two
   different reasons — Arm C's compare job existed and died at the ceiling, deepseek41's was never scheduled.
2. **J0028-compare** held the bookmark and direct-manipulation triple whose reconcile assertions earned
   F059, F062 and F066. It produced 88 source receipts and no assertion document.
3. **A declared deliverable was lost mid-job.** J0021 §8 tabulates three extracted directions including
   `leads/native-interactive-symlinks.md`; only two lead files exist on disk. The third was never written.

### F106 is a different kind of miss

Worth separating from the ceiling losses: **J0022 had every field of F106 in hand and concluded "covered".**
It cites `workspace_map_result` including `collision_blocked`, `colocation_activation_disposition` including
`blocked_dual_writer_or_identity_collision`, and `working_copy_relation` — all three fields F106 is about —
and treats them as evidence that PM's acceptance language already covers the case, without testing whether
the validation conditional actually rejects `ready_for_owner_activation` under them. That is an analytical
miss, not a budget one. The arm reached the material and drew the wrong conclusion.

## Reached-delivery fraction

| Measure | Value |
|---|---|
| Input leads | 88 |
| Distinct leads admitted to a reconcile job | 14 |
| …that reached a saved reconcile assertion | **14 of 14 (100%)** |
| Distinct leads admitted to a compare job | 7 |
| …that reached a saved comparison | **4 of 7 (57.1%)** |
| Of the 88 input leads: reached a saved reconcile assertion | 14/88 (15.9%) |
| Of the 88 input leads: reached a saved comparison | 4/88 (4.5%) |

By `delivery.json` receipts alone the reconcile figure would be 13/14, because J0020's three lead documents
were never receipted. The saved-document figure is the one that matches how continuation 3 adjudicated.

The arm reached a saved reconcile assertion for **every** lead it admitted. 4 of 88 input leads (4.5%)
reached the stage where a canon proposition is stated, against Arm C's 3 of 88 — and that one extra compare
job is where 8 of the 16 findings over Arm C come from.

## Comparison table

**The current, full comparison table now lives in `../muse13/README.md`** and supersedes the one below. Headline after four new arms: claude 18/110, deepseek41 33/110, muse13 40/110, claude-hicap 46/110, with claude and deepseek41 both proper subsets of muse13 and muse13 a proper subset of claude-hicap.


**The current, full comparison table now lives in `../claude-hicap/README.md`** and supersedes the one below. Headline: claude-hicap — the control arm for Arm C's ceiling caveat — scored 46/110 (41.82%) including 3 of 5 corrections, a strict superset of both Arm C (18) and deepseek41 (33).


Premium and hybrid rows are continuation 3's own numbers from `continuation3/final/README.md` and
`continuation3/end/README.md`; denominators unchanged.

| Measure | Premium | Hybrid | Claude (Arm C) | **deepseek41** | glm53 | muse13 | union | claude-hicap |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Review model | gpt-6-astra xhigh | gpt-6-astra xhigh | claude-opus-5 xhigh | **deepseek-v4.1-flash max** | pending | pending | pending | running |
| Inputs | own arm | own arm | premium's frozen artifacts | **premium's frozen artifacts** | – | – | – | – |
| Recall / expanded 110 | 78 (70.91%) | 90 (81.82%) | 18 (16.36%) | **33 (30.00%)** | – | – | – | – |
| Recall / fixed original 105 | 74 (70.48%) | 88 (83.81%) | 18 (17.14%) | **33 (31.43%)** | – | – | – | – |
| Corrections / 5 | 4 | 2 | 0 | **0** | – | – | – | – |
| Optional capabilities / 36 | 20 | 30 | 1 | **2** | – | – | – | – |
| Product choices / 6 | 3 | 5 | 0 | **1** | – | – | – | – |
| Unsupported or already-covered / 63 | 51 | 53 | 17 | **30** | – | – | – | – |
| Unique to the arm | 20 | 32 | 0 | **0** | – | – | – | – |
| Reconcile / compare split | 6 / 6 | 6 / 4 | 8 / 4 | **9 / 3** | – | – | – | – |
| Completed / limited / interrupted | 7 / 5 / 0 | 2 / 5 / 3 | 1 / 11 / 0 | **2 / 10 / 0** | – | – | – | – |
| Jobs with a saved assertion | 12/12 | 10/10 | 4/12 | **8/12** | – | – | – | – |
| Input leads reaching a comparison | – | – | 3/88 (3.4%) | **4/88 (4.5%)** | – | – | – | – |
| Reconcile wall (min) | 48.186 | 42.341 | 23.103 | **18.896** | – | – | – | – |
| Compare wall (min) | 53.615 | 27.546 | 20.265 | **12.524** | – | – | – | – |
| Arm wall (min) | 66.346 | 42.343 | 31.133 | **18.930** | – | – | – | – |
| Summed job time (min) | 185.362 | 126.294 | 81.482 | **51.590** | – | – | – | – |
| Average concurrency | 2.794 | 2.983 | 2.617 | **2.725** | – | – | – | – |
| Continuation increment captured | $81.583790 | $70.126680 | $36.124043 | **$0.531509** | – | – | – | – |
| Cap | $250 | $100 | $100 | **$50** | – | – | – | – |
| New unresolved charges | $24.00 | $36.00 | $0.00 | **$0.00** | – | – | – | – |
| Job-end reconciled / unresolved | 10 / 2 | 7 / 3 | 12 / 0 | **12 / 0** | – | – | – | – |
| Lifetime captured | $121.923954 | $73.723142 | $36.124043 | **$0.531509** | – | – | – | – |
| Lifetime captured $ per credited finding | $1.563 | $0.819 | $2.007 | **$0.016** | – | – | – | – |

**The cost column is the headline and it needs stating carefully.** deepseek41 scored 33 findings for
**$0.53** — 68× cheaper than Arm C for 1.8× the recall, and 154× cheaper than the premium increment. That is
a published-tariff valuation of 470 native responses, not a cash invoice, and it is not a like-for-like
quality claim: both new arms are same-input review replacements bounded by the premium arm's artifacts, and
neither found anything the premium arm had not. What the number does support is that at this price the
response ceiling, not the money, is the binding constraint — the arm used 1.06% of a $50 cap.

## Limits

1. One frozen case; a same-input review replacement bounded by the premium arm's research artifacts.
2. Recall is against the adjudicated continuation-3 union, not an external exhaustive truth set.
3. "Unsupported or already-covered" is a union class, not a false-positive rate.
4. 10 of 12 jobs were response-limited; request-limited coverage and the reached-delivery fraction are
   reported separately. Unperformed work is unknown, never a negative finding.
5. Cost is a captured upper valuation priced from native receipts at the published tariff.
6. Two runner-brief discrepancies (runtime version, stale selector metadata) are recorded above.
7. glm53, muse13, union and claude-hicap are unscored; claude-hicap was launched at 20:39:37Z and is running
   now. It remains the control for Arm C's ceiling caveat.
