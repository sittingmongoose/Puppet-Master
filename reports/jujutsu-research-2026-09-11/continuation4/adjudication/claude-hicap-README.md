# Arm claude-hicap — adjudication against the continuation-3 union

I am an Opus 5 agent acting as adjudicator. I ran no arm. Same method and verification as for Arm C and
deepseek41.

This is the **control arm** for Arm C's response-ceiling caveat: the same model (`claude-opus-5` xhigh,
Claude Code CLI 2.1.226, binary sha256 `4e9bec11…`) over the same premium artifacts and starting state,
with the per-job limits raised to 160 responses, 3,600 s and $20, under a $150 cap.

The reviewed model and I share a family. Every credit names its assertion and cited passage.

## Verification

Manifest internal `manifest_sha256` `ebf8612dd5953cbf8f4da9fa6b6b5b11a89e4015cc907c26d0afc553b0eafbb5`
(the runner's figure; the manifest file's own bytes are `feefc4c94ccec…`). Recomputed from the 8,098 rows:
match. Independently re-hashed the whole tree (8,098 files, 228,660,085 bytes): match.

Job table rebuilt from durable state. All reproduced: 12 jobs — **6 reconcile** (J0017, J0018, J0019,
J0023, J0024, J0025) and **6 compare** (J0020, J0021, J0022, J0026, J0027, J0028); 800 native responses
with receipts equal to responses in all 12; reconcile wall 2,635.6 s, compare wall 2,682.6 s, arm wall
3,535.2 s, summed 10,259.3 s, average concurrency 2.9021; captured $82.516376 equal to the CLI figure;
12/12 reconciled, $0 unresolved; 12/12 wrote notes.md; 28 receipted lead deliveries; the lead set grew
from 88 to 140 (126 still at `discovered`, 14 at `comparison_delivered`, 0 at `reconciled` because every
reconciled lead was promoted).

**Nothing was bound, verified rather than assumed.** Every job carries `runtime_status: completed` with
raw-claude `terminal_reason: "completed"` and `result_is_error: false`; responses ran 37–110 of 160 (mean
66.7), elapsed 685.6–1,070.1 s of 3,600, per-job cost $4.0991–$12.1166 of $20, and `money_stop_reason` is
null. The busiest job used 69% of the response ceiling, 30% of the time budget and 61% of the money.

### Runner corrections to my earlier flags — read and accepted

`arm-outputs/corrections.json` and `runtime-identity.json` answer both discrepancies I raised while
scoring deepseek41. **C1: I was wrong.** The "stale selector" is not a deepseek41 field — it is the frozen
continuation-3 cost-policy block `bound.deepseek_metadata`, describing the *hybrid* arm's research model
and copied into every arm's budget, including both Claude arms. I have amended the deepseek41 files.
**C2:** the omp runtime genuinely self-reported 18.1.13 when the union attempt ran at 18:49Z and 18.2.2
after the binary was replaced in place at the same path, so the brief's figure was correct when written
and went stale; per-arm job records are authoritative. **C3** answers my open question: 41 responses
against a 40 ceiling is the kill window of a post-response boundary, not an off-by-one.

## Assertion corpus — 64 documents, 836,145 bytes, in 12 of 12 jobs

12 notes.md (29,455–65,166 bytes each) and 52 `workspace/leads/*.md`. That is **4.6× Arm C's** 18-document,
~180 KB corpus. No job is empty.

## Credited — 46 of 110 (41.82%)

| Class | Credited | Denominator |
|---|---:|---:|
| **Correction** | **3** | 5 |
| Optional capability | 4 | 36 |
| Product choice | 3 | 6 |
| Unsupported or already-covered | 36 | 63 |
| **Total** | **46** | **110** |

- **Corrections (3/5):** `F001`, **`F106`**, **`F107`** — the first corrections credited to any new arm.
  Only `F108` and `F109` are missed.
- **Optional capability (4/36):** `F028` `F035` `F066` `F090`.
- **Product choice (3/6):** `F032` `F044` `F083`.
- **Unsupported or already-covered (36/63):** `F002` `F004` `F006` `F007` `F008` `F010` `F011` `F029`
  `F030` `F031` `F033` `F034` `F036` `F037` `F043` `F050` `F051` `F053` `F056` `F059` `F061` `F062`
  `F072` `F073` `F074` `F079` `F080` `F081` `F082` `F084` `F087` `F088` `F089` `F092` `F094` `F102`.

Per-finding basis in `claude-hicap-findings.json`. The two new corrections:

- **F107** — J0026 states all four clauses against the SourceGraph contract: Repair 1 requires
  `returned_count == len(nodes)` and `returned_count <= page_size` with edge endpoints resolving in-page
  ("a record with `page_size: 80, returned_count: 200` and 200 nodes validates today"); Repair 2 adds a
  required `page.termination` discriminator with `error_ref` so a truncated-by-error page cannot present
  as end-of-history; Repair 3 makes `parent_refs` membership explicit through `elided_ancestor` and
  `missing_ancestor` edge kinds.
- **F106** — J0028 read every `allOf` branch of the restore-verification receipt and found the readiness
  branch "constrains `historical_operation_result`, `object_closure_result`, `conflict_refs`,
  `collision_refs` and `activation_config_disposition` — and **never** `working_copy_relation` or
  `workspace_map_result`", so `ready_for_owner_activation` validates with `working_copy_relation:
  "unverified"` and with `workspace_map_result: "collision_blocked"` plus empty `collision_refs`. Two of
  F106's three counterexamples, named exactly; the `colocation_activation_disposition` case is not.

Six partials: `F019` `F020` `F022` `F069` `F076` `F103`.

## The control result

| | Arm C | claude-hicap |
|---|---:|---:|
| Credited | 18 (16.36%) | **46 (41.82%)** |
| Corrections | 0/5 | **3/5** |
| Jobs with a saved assertion | 4/12 | **12/12** |
| Jobs bound by a limit | 11/12 | **0/12** |
| Input leads reaching a comparison | 3/88 (3.4%) | **14/88 (15.9%)** |

**claude-hicap is a strict superset of Arm C and of deepseek41.** It gained **28** findings over Arm C
and lost none; it adds 13 over deepseek41 and loses none. The union of all three new arms equals
claude-hicap's own set.

Gained over Arm C: `F001` `F002` `F007` `F008` `F011` `F028` `F029` `F031` `F032` `F033` `F034` `F035`
`F036` `F037` `F043` `F044` `F053` `F056` `F073` `F074` `F083` `F087` `F088` `F089` `F090` `F094` `F106`
`F107`.

### Do Arm C's turn-capped jobs now reach delivery?

**All of them.** Arm C had 11 `request_limit_reached` jobs, 8 of which delivered nothing. Those 8 held
`L-80244e477912` (twice), `L-7dc9a6726cf9` (twice), the graph triple at reconcile and at compare, the
dojjo triple's duplicate compare, and the bookmark triple's compare. In claude-hicap every one of those
lead groups produced a notes.md at both stages — and with no duplicated attempts, which is why 12 jobs
covered 14 leads instead of Arm C's 11.

### On the leads both arms completed, do the assertions differ in substance?

**Yes, and in kind rather than in volume.** Both Claude arms reconciled *and* compared the dojjo triple.
Arm C's compare produced five repairs about the backup receipt surface: verification depth, machine-local
store entries, in-store pointer rebinding, a present-but-unloadable metadata blocker, gc-fence covered
paths. claude-hicap's compare on the same three leads produced a largely **disjoint** set: `refs/jj/keep`
and the extras table as named closure axes (a heads-only capture loses every abandoned and rewritten
commit to the first `git gc`), fetch-versus-push ref coverage symmetry, per-workspace working-copy state
as a closure axis (the first ordinary `jj` command in a restored workspace manufactures the snapshot
JJI-008 forbids), and operation-pinned reads. Only the gc-fence topic overlaps, and even there the two
arms ask different questions.

The same pattern explains F107: both arms read the three graph leads at reconcile, but Arm C stopped at
the external defects while hicap carried them into three named SourceGraph contract repairs. Reaching the
compare stage does not lengthen the analysis — it changes what kind of proposition the arm can state.

### The counter-result: the ceiling did not buy correctness

deepseek41 caught a factual error in Arm C's UNIX_EPOCH garbage-collection claim, which I verified. **The
higher-cap arm makes the same error — while holding the correct primary source.** J0019 quotes the correct
predicate ("The implementation removes any file whose mtime is not greater than `keep_newer`",
`simple_op_store.rs:286-299`) and then concludes "Passing `UNIX_EPOCH` therefore disables the concurrency
grace window entirely … every operation and view not reachable from the freshly-resolved head is destroyed
server-side immediately." J0023 and its lead repeat it.

I read the whole `gc` implementation in this arm's own cache (`simple_op_store.rs`, sha256
`a42ce0f6208002fc26c5796af00240b7e8b64b9b52957cc64446fc5b2ce610da`, lines 285–357): reachable entries
`continue`; unreachable entries go to `remove_file_if_not_new`, which **keeps** when `mtime > keep_newer`.
With `keep_newer = UNIX_EPOCH` every file's mtime is greater, so **nothing is removed at all**.

Both Claude arms are wrong in the same direction; deepseek41 is right. Arm C never read the
implementation; hicap read it, quoted it correctly, and drew the opposite conclusion two sentences later.
That is a reasoning error, not a budget error — so the control separates coverage from judgement, and on
this point the extra budget bought nothing. It does not affect either arm's score: F079, F004 and F082
rest on independent Plans citations in both.

## Candidates outside the union — 5

Recorded with evidence, **not added to the union**. Full text in `claude-hicap-candidates.json`.

| ID | Proposition (abbreviated) |
|---|---|
| C4H-01 (J0022 R1) | `cmd.jujutsu.change.split` is canonical and wired, but the frozen target can only name a `change_id` and a native `jj split` with no paths always launches a diff editor — a canonical command with no admissible execution path. |
| C4H-02 (J0020) | Every JJ read by capture or drill must be operation-pinned: `load_at_head()` authors a "reconcile divergent operations" operation, so an unpinned read mutates what it observes. All five fixtures carrying `operation_head_refs` hold exactly one head. |
| C4H-03 (J0028 R5) | `allowed_action_ids` carries no conditional, so an empty array validates for a blocked quarantined repository — and under `Contracts_V0.md:508` an empty set means no recovery action is admitted at all. |
| C4H-04 (J0027 Defect 1) | `bookmark.track`/`.untrack` are classified as transport mutations requiring a credential lease, while the same fixture sets `permission.scope: local_mutation` and native untrack is a purely local view transaction. |
| C4H-05 (J0026 Repair 2) | A divergent change — multiple visible commits sharing one change ID — is native and user-visible and cannot be named, shown or refused anywhere in the Plans' closed enums. |

## Shared versus unique coverage

| | Count |
|---|---:|
| hicap ∩ premium | 44 |
| hicap ∩ hybrid | 35 |
| hicap ∩ premium only | 11 — `F001` `F008` `F031` `F032` `F033` `F034` `F036` `F053` `F084` `F090` `F106` |
| hicap ∩ hybrid only | 2 — `F073` `F083` |
| **Unique to hicap** | **0** |
| Held by premium, missed | 34 |
| Held by hybrid, missed | 55 |

Still nothing unique to the arm — all 46 sit inside premium or hybrid. But it is the first new arm to
reach hybrid-only findings and the first to credit any correction.

Of the 64 findings missed, 32 are optional capabilities. That residue is dominated by leads the arm was
**never given**: it admitted 14 of 88 input leads.

## Comparison table

**The current, full comparison table now lives in `../muse13/README.md`** and supersedes the one below. Headline after four new arms: claude 18/110, deepseek41 33/110, muse13 40/110, claude-hicap 46/110, with claude and deepseek41 both proper subsets of muse13 and muse13 a proper subset of claude-hicap.


Premium and hybrid rows are continuation 3's own numbers. **Read the cost and duration rows with the
caveat below.**

| Measure | Premium | Hybrid | Claude (Arm C) | deepseek41 | **claude-hicap** | glm53 | muse13 | union |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Review model | gpt-6-astra xhigh | gpt-6-astra xhigh | claude-opus-5 xhigh | deepseek-v4.1-flash max | **claude-opus-5 xhigh** | pending | pending | running |
| Inputs | own arm | own arm | premium's artifacts | premium's artifacts | **premium's artifacts** | – | – | – |
| Recall / expanded 110 | 78 (70.91%) | 90 (81.82%) | 18 (16.36%) | 33 (30.00%) | **46 (41.82%)** | – | – | – |
| Corrections / 5 | 4 | 2 | 0 | 0 | **3** | – | – | – |
| Optional capabilities / 36 | 20 | 30 | 1 | 2 | **4** | – | – | – |
| Product choices / 6 | 3 | 5 | 0 | 1 | **3** | – | – | – |
| Unsupported or already-covered / 63 | 51 | 53 | 17 | 30 | **36** | – | – | – |
| Unique to the arm | 20 | 32 | 0 | 0 | **0** | – | – | – |
| Reconcile / compare split | 6 / 6 | 6 / 4 | 8 / 4 | 9 / 3 | **6 / 6** | – | – | – |
| Completed / limited / interrupted | 7 / 5 / 0 | 2 / 5 / 3 | 1 / 11 / 0 | 2 / 10 / 0 | **12 / 0 / 0** | – | – | – |
| Jobs with a saved assertion | 12/12 | 10/10 | 4/12 | 8/12 | **12/12** | – | – | – |
| Input leads reaching a comparison | – | – | 3/88 (3.4%) | 4/88 (4.5%) | **14/88 (15.9%)** | – | – | – |
| Assertion documents | – | – | 18 | 19 | **64** | – | – | – |
| Reconcile wall (min) | 48.186 | 42.341 | 23.103 | 18.896 | **43.927** | – | – | – |
| Compare wall (min) | 53.615 | 27.546 | 20.265 | 12.524 | **44.710** | – | – | – |
| Arm wall (min) | 66.346 | 42.343 | 31.133 | 18.930 | **58.920** | – | – | – |
| Summed job time (min) | 185.362 | 126.294 | 81.482 | 51.590 | **170.988** | – | – | – |
| Average concurrency | 2.794 | 2.983 | 2.617 | 2.725 | **2.902** | – | – | – |
| Per-job limits | continuation-3 regime | continuation-3 regime | 40 resp / 2400 s / $12 | 40 resp / 2400 s | **160 resp / 3600 s / $20** | – | – | – |
| Lifetime captured / cap | $121.92 / $250 | $73.72 / $100 | $36.12 / $100 | $0.53 / $50 | **$82.52 / $150** | – | – | – |
| New unresolved charges | $24.00 | $36.00 | $0.00 | $0.00 | **$0.00** | – | – | – |
| Job-end reconciled | 10 of 12 | 7 of 10 | 12 of 12 | 12 of 12 | **12 of 12** | – | – | – |
| Captured $ per credited finding | $1.563 | $0.819 | $2.007 | $0.016 | **$1.794** | – | – | – |

**Cost and duration are not comparable for this arm.** It ran under a deliberately different budget
regime, chosen to *remove* the binding constraint rather than to measure one, and it is not comparable
with goal 2's arms (premium, hybrid) or with the other continuation-4 arms. Only the **outputs** are
comparable. The honest cost statement is narrower and holds: within the Claude family alone, 2.3× the
captured spend bought 2.6× the recall and the first corrections — and, per the counter-result above, no
improvement on the one factual error both Claude arms share.

## Limits

1. One frozen case; a same-input review replacement bounded by the premium arm's research artifacts.
2. Adjudicator and reviewed model share a family; every credit names its assertion and cited passage.
3. Recall is against the adjudicated continuation-3 union, not an external exhaustive truth set.
4. "Unsupported or already-covered" is a union class, not a false-positive rate.
5. Cost and duration are not comparable across budget regimes; only outputs are.
6. The arm admitted 14 of 88 input leads, so most of what it missed it was never given.
7. Observation O4H-01 records a factual error this arm shares with Arm C; it does not affect the score.
8. glm53, muse13 and union are unscored; union is running now as a full arm through OpenRouter.
