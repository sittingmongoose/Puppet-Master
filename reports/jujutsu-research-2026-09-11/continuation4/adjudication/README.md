# Arm C (Claude Opus 5 review) — adjudication against the continuation-3 union

I am an Opus 5 agent acting as adjudicator. I ran no arm. This scores the Claude arm's frozen outputs
against the adjudicated 110-finding union from continuation 3, using continuation 3's own crediting rules.

**Adjudicator/subject family overlap is a stated bias caveat**: the reviewed model is `claude-opus-5` and I
am an Opus 5 agent. Every credit below names the delivered assertion and the passage it cites, so the
judgement can be re-checked against the artifacts rather than taken on my word.

Arms deepseek41, glm53, muse13 and union are **not scored here**. At the time of writing deepseek41 is
live (its 20:02:55Z attempt was archived for an accounting defect and it relaunched at 20:20:22Z as
`jujutsu-deepseek41-20260916-202016`); glm53, muse13 and union have not started. A **`claude-hicap`** arm
is also queued — the same model with a raised response ceiling. That arm is the direct control for this
adjudication's main caveat: Arm C's recall is dominated by the 40-response ceiling, not by judgement, and
`claude-hicap` is what will separate the two. All of these will be scored on resume.

## What I read, by path and hash

Union and method (all under `/mnt/Cursor/PuppetMaster/reports/jujutsu-research-2026-09-11/continuation3/`):

| File | SHA-256 |
|---|---|
| `final/comparison.json` | `c3006253a5c68074109312747feb67130fb6e12d4f82c66132b268487156370b` |
| `final/closing-job-reviews.json` | `e3c64edd60a6ea7664fc98d1541f649665ef2b681915bf249e50046e6917d5e1` |
| `final/symmetric-adjudication.json` | `531c6d831890598a99b159ae160aa7bd501d13c2885ef1344f51acaaea74bcc2` |
| `final/independent-review.json` | `923df1b300d4de20d29eff414046661590835902074e95a36df3e350161bf28b` |
| `final/job-coverage.json` | `8a9a264ab287c8f22546a953e24d9703d2621bc6e1b0df0137ad4286367831fa` |
| `final/README.md` | `fb775eb0f26ded27d835d8ecface357a3f1ab8a65adc612da5685bfd1e446e53` |
| `end/README.md` | `6356d64f8f6c6e64248aacf34795f62463fc36250e0ceeec045d2b04c262bc67` |

Also read:

| File | SHA-256 |
|---|---|
| `…/process-pilot-20260908/BRIEF_ADJUDICATE_NEW_ARMS_20260916.md` | `352942fec6ac5671c953c33ed466936b78b3f16797fa2ddf553a2007f0b4aa81` |
| `/mnt/Cursor/PuppetMaster/AGENTS.md` | `778ee8e5b13c4e6011e5b1de1bb0889638ddd43a5d7b30ee45b6e951bf9d697f` |
| `continuation4/PROGRESS.md` (runner's log) | `868969215f231260c3d77acc231d4c3b95150e3d4eddbd3c70ddced166d97dbf` |
| `runs/jujutsu-claude-20260916b/run.json` | `8a6632de52ae9554e67816f8a91c63422c77f82771354fc1288829556500101b` |
| `runs/jujutsu-claude-20260916b/timing.json` | `78235f5006c4558acaa3f9be5382443a433aec1a9c2a2866242c3e4e52d94b66` |
| `runs/jujutsu-claude-20260916b/progress.json` | `7895190214ff9145dbf343b93f7c1bceda1c5dc5277fd11cb2456ec911614de4` |

Arm C's 18 delivered assertion documents, all under
`~/PM-Experiments/jujutsu-followup-20260911/continuation4/runs/jujutsu-claude-20260916b/jobs/`:

| Document | SHA-256 |
|---|---|
| `J0019-reconcile/workspace/notes.md` | `2ff85492dd1742a6b82163fa2295c058c4adfdbb2706e923f709594037b9172b` |
| `J0019-reconcile/workspace/leads/dojjo-create-verification-is-local-side-only.md` | `928f554149c4c5d8685851343168f85ba815fe862ef431ef0c8f545bcb8877dd` |
| `J0019-reconcile/workspace/leads/dojjo-git-transport-need-computed-not-honored.md` | `b33b087f5324dde222b260772b454287bc89d14a7e65d5d7243c5623aff0bef0` |
| `J0019-reconcile/workspace/leads/dojjo-op-store-gc-unix-epoch-and-lock-gap.md` | `c0cf000f2adb55ddfb0b922d9285421544c4480239ccf634b40101c3d87cc1ad` |
| `J0019-reconcile/workspace/leads/dojjo-setup-manufactures-native-operations.md` | `e041c847638129d3e2fd088b710d98d7080295fd506b7f083ba5c8fcced0543a` |
| `J0019-reconcile/workspace/leads/dojjo-workspace-name-uniqueness-is-local-precheck.md` | `7b3e0f3e2f51ed9b1671cf2e8642e6287c42ad59d5a3596cc16c222cbaa89e87` |
| `J0019-reconcile/workspace/leads/git-fsck-connectivity-only-rationale.md` | `826f4ad11fc3c4e9c7aefd9936cc5f2164d22b332857f1a8de54876755dccd62` |
| `J0022-reconcile/workspace/notes.md` | `8763c8457e5637cafb2fde67bb6881f7d091cadd1ee8c5fcb6fdf4e1a43b5750` |
| `J0022-reconcile/workspace/leads/bookmark-verb-vocabulary-delete-forget-rename.md` | `b3d4b9f1a1732715d3202f4ac197003bdd36622b3adfd5ba8c1ebb32c4eb1dcb` |
| `J0022-reconcile/workspace/leads/direct-manipulation-target-resolution-bugs.md` | `edf1f48f843cdd7eda1d2f6663f10ffc9fc08a6afcd84f6f57298d637ae264b5` |
| `J0022-reconcile/workspace/leads/dojjo-sync-complete-prunes-operation-history.md` | `7c11e0db99b4ebae2e55a786bdb01cfadb5fb5a06ae0b803e0d8aab90695ddad` |
| `J0025-reconcile/workspace/notes.md` | `d03c593639d2d7a134b532ef71edcef21fb0f877fc445b4fe499491259a34dba` |
| `J0026-compare/workspace/notes.md` | `eca15bac6cb2d2d0d830c62287bb69b995b2197761c1d7237cb51148d93e92b2` |
| `J0026-compare/workspace/leads/pm-gc-fence-held-does-not-state-coverage.md` | `dc302a4eb282257dcc9d97546180f80d36490ed70b34f2aa8fb1757294c6509d` |
| `J0026-compare/workspace/leads/pm-jj-isolated-drill-must-rebind-store-pointers.md` | `ba3330c47a0981ac4c7eb1eb5b58854282112320e4d15ada6c72a19b570a3ab5` |
| `J0026-compare/workspace/leads/pm-jj-machine-local-store-entries-unclassified.md` | `dab6c73e05e87cb97a0c1f3cd920290d69172f242d9367164eff93ea2a6cdc7d` |
| `J0026-compare/workspace/leads/pm-jj-restore-object-verification-depth-unstated.md` | `fbbf91951173bb339429a27499ec14498e378ad5a2341a6b26314fefb1d17c1b` |
| `J0026-compare/workspace/leads/pm-jj-unloadable-metadata-has-no-blocker-class.md` | `1b6d1d993382cb5d0c8226c6717e7bffff7b43d9e70de7835f03a58ecf459080` |

## Verification of the arm's durable state

The runner reported manifest SHA-256 `a0d3b38cb37ee3dfa47ec5ac878ce903f0ff15a0166d51c235af82613c01dd39`
for `arm-outputs/arm-c-manifest.json`. That value is the manifest's **internal** `manifest_sha256` field — a
digest over the sorted file rows — not the manifest file's own bytes (those hash to
`bda960668eda9c08b2d1c0a2c2e6831694f1b744da7bc76011f46b588fdf2f59`). Both check out:

- Recomputing `manifest_sha256` from the 6,234 rows reproduces `a0d3b38c…` exactly.
- Independently re-hashing the whole run tree with the run's own algorithm (`hash_manifest.py`) on
  2026-09-16 yields 6,234 files, 167,320,784 bytes and the same digest `a0d3b38c…`. The frozen tree is
  unaltered since the 2026-09-16T20:02:24Z freeze.

The job table was rebuilt from `jobs/*/outcome.json`, `jobs/*/job.json`, `jobs/*/delivery.json`,
`jobs/*/native-job-end-accounting.json` and `jobs/*/raw-claude/claude-usage.json`, not from the runner's
summary. Every figure the runner reported reproduced: 12 jobs — 8 reconcile (J0017, J0018, J0019, J0020,
J0021, J0022, J0023, J0025) and 4 compare (J0024, J0026, J0027, J0028) — 11 `request_limit_reached` and 1 `completed`
(J0019, 38 responses, 641.0 s), 478 responses with receipts equal to responses in all 12, reconcile wall
1386.18 s, compare wall 1215.92 s, arm wall 1867.96 s, summed 4888.92 s, average concurrency 2.6173,
captured $36.124045, and notes.md from exactly 4 of 12. `J0001`–`J0016` carry no `raw-claude/` and are the
inherited premium upstream artifacts.

## Credited findings — 18 of 110 (16.36%)

Crediting rule applied, from continuation 3: a job is credited only when a **delivered assertion states the
same proposition, cited to a passage**. Topic contact is not credit; source locator inventories
(`research-evidence/sources/**`) are not assertion documents.

| Class | Credited | Denominator |
|---|---:|---:|
| Correction | 0 | 5 |
| Optional capability | 1 | 36 |
| Product choice | 0 | 6 |
| Unsupported or already-covered | 17 | 63 |
| **Total** | **18** | **110** |

On continuation 3's fixed original-105 denominator the figure is the same 18 — **18/105 (17.14%)** — because
none of the five new findings F106–F110 was credited.

**Corrections (0/5).** F001, F106, F107, F108, F109 all missed. F107 is the notable one and it is a request
ceiling loss, not a judgement loss — see below.

**Optional capability (1/36).** `F066` direct graph manipulation — J0022-reconcile.

**Unsupported or already-covered (17/63).** `F004` `F006` `F010` `F030` `F050` `F051` `F059` `F061` `F062`
`F072` `F079` `F080` `F081` `F082` `F084` `F092` `F102`.

Per-finding basis, crediting job and evidence hashes are in `arm-c-findings.json`. Highlights:

- **F061** (graph bounds, continuity, isolation) — J0025 asserts all four clauses with line-exact citations,
  including that GG's page bound is an equality test a phantom missing-edge row can straddle so "the loop
  runs to stream exhaustion", and that "continuation identity is not bound to anything".
- **F081** (backup existence is not verified recovery) — all three clauses asserted across J0026's R1 and R3,
  J0019's create-verification lead and J0025's alternates finding.
- **F079** (complete retained native backup closure) — J0026 quotes the closure requirement in full and the
  failing substitutes; J0022 asserts the mirror is "a current-head closure, not a retained-history closure".
- **F059** (push targets and bookmark effects) — J0022 proves GG's rename leaves the old name's tracked
  remote with an absent local ref so the next push deletes it, and that a local Delete is logged as "forget".

## Partial matches — 13, recorded not credited

`F001` `F002` `F007` `F011` `F029` `F069` `F074` `F083` `F087` `F088` `F089` `F094` `F097`.
Each with its reason in `arm-c-findings.json`. Examples: F088's merge-parent-drop regression is cited as
evidence but the obligation the arm draws is about target resolution; F074 has the scrubbed-Git-environment
clause but not signing/filters/hooks/tools routing; F089 has shallow and alternates but not
promisor/LFS/submodule.

## Candidates outside the union — 5, all from J0026-compare

Recorded with evidence, **not added to the union**. Full text, distinctness and cited passages in
`arm-c-candidates.json`.

| ID | Proposition (abbreviated) | Evidence SHA-256 |
|---|---|---|
| C4C-01 (R1/P1) | The JJ restore-verification receipt must state the verification depth behind `object_closure_result`, by reference to the Backup owner's existing `integrity_verification_level`; a reachability-only pass cannot yield `complete`. | `fbbf91951173bb339429a27499ec14498e378ad5a2341a6b26314fefb1d17c1b` |
| C4C-02 (R3) | The isolated drill must resolve and record every in-store location pointer before any native command runs; a pointer resolving outside the boundary is a typed blocker, rebound with the rebinding recorded or blocking — never followed. | `ba3330c47a0981ac4c7eb1eb5b58854282112320e4d15ada6c72a19b570a3ab5` |
| C4C-03 (R2) | Machine-local and ephemeral entries inside `.jj/repo` need an enumerated, source-traced, version-pinned classification — captured but non-authoritative — never a `*.lock` filename pattern. | `dab6c73e05e87cb97a0c1f3cd920290d69172f242d9367164eff93ea2a6cdc7d` |
| C4C-04 (R4) | The drill blocker taxonomy needs a class for metadata that is present-but-unloadable, separate from missing object closure. **Adjudicator flag:** this falls inside continuation 3's already-rejected expansion "Corruption taxonomy, extras detector … refinements under existing F082/F086/F056". | `1b6d1d993382cb5d0c8226c6717e7bffff7b43d9e70de7835f03a58ecf459080` |
| C4C-05 (R5) | `gc_fence_outcome: held_during_capture` must enumerate the writer paths the fence covered; a claim with an empty covered-path list is rejected. | `dc302a4eb282257dcc9d97546180f80d36490ed70b34f2aa8fb1757294c6509d` |

C4C-02 is the strongest: it identifies a route to a false complete-recovery badge that the current owner
text permits, and grounds it in the BKP-006/BKP-007 lineage packet, which stated the clean-host condition
that current owner text reduced to a future test surface.

## Amendment after scoring deepseek41 — a verified error in Arm C's supporting text

Arm C asserted, in J0019, J0022 and J0026 and in two of its lead documents, that
`op_store().gc(head, SystemTime::UNIX_EPOCH)` "preserves nothing by recency", and therefore that the dojjo
server mirror "retains only operations and views reachable from the single resolved head" after every sync.

That is backwards. jj's `lib/src/simple_op_store.rs:285-298` keeps a file when `mtime > keep_newer` and
removes it otherwise, so with `keep_newer = UNIX_EPOCH` **nothing is removed**. I read the source directly.
deepseek41's J0025 got this right and Arm C did not; Arm C cited only the docs.rs trait documentation, while
deepseek41 read the implementation.

Consequences, all recorded in the JSON files:

- **The F079 and F004 credits stand.** Both rest on Arm C's independent Plans citations, not on this claim.
- **Arm C's lead `dojjo-sync-complete-prunes-operation-history.md` is materially false.** Its central claim
  — that a dojjo mirror "is a current-state replica, never an operation-history archive" — does not hold.
- **Candidate C4C-05 loses one of its two external legs** and survives on the other (the per-instance
  `FsDojoUploadStore` io_lock that does not coordinate across concurrent HTTP requests, plus the `file://`
  remote path that bypasses the smart-HTTP lock entirely). The covered-writer-path proposition itself does
  not depend on the GC claim.

A second, softer cross-arm note: Arm C described GG's drag hints as typed target previews and explicitly
flagged its own open question of whether the hint appears at the drop target or only at the source.
deepseek41 answered it from code — source-side only, no post-mutation preview. Not a contradiction, a
resolution; both arms keep F066.

## Shared versus unique coverage

| | Count |
|---|---:|
| Claude ∩ premium | 18 (all of them) |
| Claude ∩ hybrid | 17 |
| Claude ∩ both | 17 |
| Claude ∩ premium only | 1 (`F084`) |
| Claude ∩ hybrid only | 0 |
| **Unique to Claude** | **0** |
| Held by premium, missed by Claude | 60 |
| Held by hybrid, missed by Claude | 73 |
| Held by **both** others, missed by Claude | 41 |

Every finding the Claude arm earned is a subset of premium's coverage. The arm added nothing to the union's
covered set. That is the expected shape for a same-input review replacement that delivered 4 of 12 jobs.

## Request-limited coverage, and what "did not get there" costs

11 of 12 jobs ended `request_limit_reached` at the 40-response ceiling; 1 completed. **No job was
budget-truncated** — the $12-per-job Meter boundary never fired, so every truncation here is the response
ceiling, not money.

Eight jobs produced **zero** delivered assertions: J0017, J0018, J0020, J0021, J0023 (reconcile) and J0024,
J0027, J0028 (compare). Their entire output is 28–40 source locator receipts plus a 16–55 byte truncated
last assistant turn. Three named losses:

1. **J0028-compare held exactly the three graph leads** (`L-ad68a4ac94ad`, `L-2e0dc4dec29d`,
   `L-289201b4f4ec`) whose comparison against Plans produced **F107** in both premium and hybrid. The arm
   *did* deliver their reconcile evidence — J0025, credited under F061, F030, F092, F006 and F081, and
   materially stronger on the pagination defects than the parent notes it reconciled. The compare that
   would state the SourceGraph contract defect died at the ceiling with nothing saved. F107 was in reach.
2. **J0027-compare held the bookmark and direct-manipulation leads** whose reconcile assertions were
   credited under F059, F062, F066 and F079. Their comparison against canon was never delivered.
3. **`L-80244e477912` (diffedit3 file-type and partial-write limits) and `L-7dc9a6726cf9` each got two
   reconcile attempts** — J0017/J0021 and J0018/J0020 — and delivered nothing from any of the four. That
   lead family is the source of premium-unique F031/F033/F034/F036 in continuation 3.

## Reached-delivery fraction

| Measure | Value |
|---|---|
| Input leads (premium's frozen state) | 88 |
| Distinct leads admitted to a reconcile job | 11 |
| …that reached a delivered reconcile assertion | **9 of 11 (81.8%)** |
| Distinct leads admitted to a compare job | 9 |
| …that reached a delivered comparison | **3 of 9 (33.3%)** |
| Of the 88 input leads: reached a delivered reconcile assertion | 9/88 (10.2%) |
| Of the 88 input leads: reached a delivered comparison | 3/88 (3.4%) |

This is the number that separates "did not get there" from "got there and missed". Only 3 of 88 input leads
ever reached the compare stage where a canon proposition is stated, and 18 credited findings came out of
that 3.4% plus the 9 reconcile deliveries. Arm C's 16.36% recall is dominated by leads it never reached.
On the 3 leads that completed the full reconcile→compare path, the arm produced 18 credited findings, 13
partials and 5 out-of-union candidates — a high yield per lead reached.

## Comparison table

Premium and hybrid rows are continuation 3's own numbers, read from
`continuation3/final/README.md` and `continuation3/end/README.md`; denominators are unchanged.

**The deepseek41 column is now filled in; the full, current comparison table lives in
`../deepseek41/README.md` and supersedes the one below for every arm scored after Arm C.** Headline:
deepseek41 scored 33/110 (30.00%) for $0.531509 — 16 findings Arm C missed, 1 (`F051`) that only Arm C has.

| Measure | Premium | Hybrid | **Claude (Arm C)** | deepseek41 | glm53 | muse13 | union |
|---|---:|---:|---:|---:|---:|---:|---:|
| Review model | gpt-6-astra xhigh | gpt-6-astra xhigh | **claude-opus-5 xhigh (CLI 2.1.226)** | pending | pending | pending | pending |
| Inputs | own arm | own arm | **premium's frozen artifacts** | pending | pending | pending | pending |
| Recall / expanded 110 | 78 (70.91%) | 90 (81.82%) | **18 (16.36%)** | – | – | – | – |
| Recall / fixed original 105 | 74 (70.48%) | 88 (83.81%) | **18 (17.14%)** | – | – | – | – |
| Corrections / 5 | 4 | 2 | **0** | – | – | – | – |
| Optional capabilities / 36 | 20 | 30 | **1** | – | – | – | – |
| Product choices / 6 | 3 | 5 | **0** | – | – | – | – |
| Unsupported or already-covered / 63 | 51 | 53 | **17** | – | – | – | – |
| Unique to the arm (3-arm basis) | 20 | 32 | **0** | – | – | – | – |
| New admissions | 12/12 | 10/12 | **12/12** | – | – | – | – |
| Completed / request-limited / interrupted | 7 / 5 / 0 | 2 / 5 / 3 | **1 / 11 / 0** | – | – | – | – |
| Jobs with a delivered assertion | 12/12 | 10/10 | **4/12** | – | – | – | – |
| Reconcile wall (min) | 48.186 | 42.341 | **23.103** | – | – | – | – |
| Compare wall (min) | 53.615 | 27.546 | **20.265** | – | – | – | – |
| Arm wall (min) | 66.346 | 42.343 | **31.133** | – | – | – | – |
| Summed job time (min) | 185.362 | 126.294 | **81.482** | – | – | – | – |
| Average concurrency | 2.794 | 2.983 | **2.617** | – | – | – | – |
| Continuation increment captured | $81.583790 | $70.126680 | **$36.124043** | – | – | – | – |
| Lifetime captured / cap | $121.923954 / $250 | $73.723142 / $100 | **$36.124043 / $100** | – | – | – | – |
| New unresolved charges | $24.00 | $36.00 | **$0.00** | – | – | – | – |
| Job-end reconciled / unresolved | 10 / 2 | 7 / 3 | **12 / 0** | – | – | – | – |

**Read the cost row carefully.** Premium's and hybrid's lifetime figures bought a whole arm including
discovery, study and history; Arm C's $36.12 bought 12 review jobs over artifacts it inherited for free. The
like-for-like comparison is the continuation-increment row: **$36.12 for 12 Claude jobs against $81.58 for
12 premium jobs and $70.13 for 10 hybrid jobs**, i.e. the cheapest and fastest of the three review
increments, with the lowest recall and with clean accounting — the only arm of the three with zero
unresolved charges and every job reconciled at job end.

## Limits

1. One frozen case; a same-input review replacement. Recall is bounded by the premium arm's research
   artifacts, which Arm C did not extend.
2. The adjudicator is an Opus 5 agent and the reviewed model is `claude-opus-5`; adjudicator and reviewed
   model share a family. Every credit names its assertion and cited passage so it can be re-checked.
3. Recall is against the adjudicated continuation-3 union, not an external exhaustive truth set.
4. "Unsupported or already-covered" is a union class, not a false-positive rate.
5. 11 of 12 jobs were request-limited. Request-limited coverage and the reached-delivery fraction are
   reported separately; unperformed work remains unknown, never a negative finding.
6. Cost is a captured upper valuation equal to the CLI-reported subscription-equivalent, not a cash invoice.
7. deepseek41, glm53, muse13, union and the queued `claude-hicap` are unscored; the comparison table's
   right-hand columns stay empty until they are. `claude-hicap` matters most: without it, "Claude Opus 5
   scores 16.36%" cannot be separated from "Claude Opus 5 was cut off after 40 responses in 11 of 12 jobs".
