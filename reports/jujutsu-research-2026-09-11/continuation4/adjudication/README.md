# Continuation 4 — adjudication of six Jujutsu arms against the continuation-3 union

**I am an Opus 5 agent** (`claude-opus-5[1m]`) acting as adjudicator. **I ran no arm.** This bundle
scores six frozen arms against the adjudicated **110-finding union** from continuation 3, using
continuation 3's own crediting rules: a finding is credited only when a **delivered assertion states
the same proposition, cited to a passage**. Partial matches are recorded separately. Propositions
outside the union are recorded as candidates with evidence and are **never added to the union** —
that is not the adjudicator's authority.

**What ran, under which limits, on which code, at what cost, and what stopped each job is the
runner's bundle, not this one.** It is on branch `research/continuation4-20260917`, commit
`2bd36e1881`, at `reports/jujutsu-research-2026-09-11/continuation4/` — `README.md` for the arm
table, timing, job-status, cost and delivery counts; `arm-reports/<arm>.json` for per-job rows with
`bound_by`; `output-manifests.json`, `freeze-history.json`, `protocol-fingerprints.json`,
`runtime-identity.json` and `corrections.json`. **Nothing in those tables is reproduced here.** Where
I verified a runner figure and found it wrong, it is in "Cross-arm factual verifications" below.

## Method

For every arm I verified the manifest and rebuilt the job table from durable state myself, never from
the runner's summary; confirmed the terminal stop was a designed gate before scoring; read every
delivered assertion the arm produced; and reported request-limited coverage and the reached-delivery
fraction separately, so a reader can tell "did not get there" from "got there and missed". The
assertion corpus is `workspace/notes.md` plus `workspace/leads/*.md` only — never handoffs, briefs,
navigation or the source-locator inventories, which are acquisition receipts rather than assertions.
Budget-limited **saved** assertions count when supported, per continuation 3.

## Two comparisons, kept separate

A review replacement and a full arm answer different questions, and ranking them against each other
would read a ceiling as a judgement.

**Review arms** — `claude`, `deepseek41`, `muse13`, `glm53`, `claude-hicap` — replaced the review
model over the premium arm's frozen discovery, study and history artifacts, from an identical
starting state. **Their recall is bounded by what those artifacts contain.**

**Full-pipeline arms** — `premium`, `hybrid`, `union` — ran from discovery on the frozen case
`bc7569b3f5`. The `union` arm's recall is **not** bounded by any other arm's artifacts. Premium and
hybrid accumulated over two campaigns; the union arm ran all five stages in one 106-minute run.

### Review arms — recall on the fixed 110-finding union

| Arm | Model, effort | /110 | corr /5 | cap /36 | prod /6 | unsup /63 | Jobs bound | Jobs with a saved assertion |
|---|---|---:|---:|---:|---:|---:|---|---:|
| `claude` (Arm C) | claude-opus-5 xhigh | 18 (16.36%) | 0 | 1 | 0 | 17 | 11 of 12 on responses | 4/12 |
| `deepseek41` | deepseek-v4.1-flash max | 33 (30.00%) | 0 | 2 | 1 | 30 | 10 of 12 on responses | 8/12 |
| `glm53` | glm-5.3-flash max | 37 (33.64%) | 0 | 2 | 0 | 35 | 7 of 12 on responses | 8/12 |
| `muse13` | muse-spark-1.3 xhigh | 40 (36.36%) | 1 | 3 | 1 | 35 | 2 of 12 on responses | 11/12 |
| `claude-hicap` | claude-opus-5 xhigh, 160-response ceiling | **46 (41.82%)** | 3 | 4 | 3 | 36 | **none** | 12/12 |

Cost and duration are comparable among `claude`, `deepseek41`, `glm53` and `muse13` — identical
per-job limits. **`claude-hicap`'s are not comparable with any of them**: it ran under an authorized
higher ceiling. Only its outputs are.

### Full-pipeline arms

| Arm | Model, effort | /110 | corr /5 | cap /36 | prod /6 | unsup /63 | Stages |
|---|---|---:|---:|---:|---:|---:|---|
| `premium` | gpt-6-astra xhigh | 78 (70.91%) | 4 | 20 | 3 | 51 | five, over two campaigns |
| `hybrid` | deepseek-v4-flash | 90 (81.82%) | 2 | 30 | 5 | 53 | five, over two campaigns |
| `union` | stealth/union-alpha high | 43 (39.09%) | 0 | 7 | 0 | 36 | **five, in one run** |

The union arm's recall **by stage** — 12 at discovery, 0 at implementation, 0 at history, 10 at
reconcile, 21 at compare — against premium's 73 research-stage plus 5 late and hybrid's 86 plus 4.
Premium and hybrid earned ~95% of their coverage in the research stages across 88 and 91 leads over
two campaigns; the union arm earned 72% of its coverage in reconcile and compare from **8 admitted
leads**. Its cost ($0 at a zero tariff) is not comparable with anything. Detail in
`union-README.md`.

## What the six arms did and did not establish

**No arm extended the union.** Six arms — five review replacements and one full arm on the same case
— produced **zero** propositions I could credit as a union finding outside premium ∪ hybrid. That
includes the union arm, which is the one thing in this experiment that could have changed the union:
all 43 of its credits sit inside premium ∪ hybrid. A different research model **redistributed**
coverage; it did not extend it.

**Reachability did change.**

| Set | Findings | % of 110 |
|---|---:|---:|
| Four-arm review union (before glm53) | 46 | 41.82 |
| **Five-arm review union** | **50** | **45.45** |
| Union arm alone | 43 | 39.09 |
| **Six-arm union** | **59** | **53.64** |
| Reached by no arm | 51 | 46.36 |

The union arm adds **11** findings no review arm reached: F005 (Expected operation is not native compare-and-swap), F015 (Operation history navigation), F019 (Stale workspace recovery), F024 (Interdiff), F025 (Change evolution view), F038 (Credential architecture and custody already chosen), F052 (Git HEAD and index health are separate), F057 (Exact-profile conflict byte regression), F065 (Revset assistance).

`glm53` adds **4** no other review arm reached: F068 (Description drafts survive refresh), F069 (Immutable content caches and async selection), F085 (Capture generation differs from upload resume), F086 (Clone completion and cleanup).

The review arms hold **14** the union arm misses: F001 (Terminal attempts always have receipts), F032 (Edited text line-ending policy), F033 (External editor path confinement), F034 (Partial external editor writes), F036 (External editor stale sessions), F037 (Bound reads before allocating), F044 (Adapter implementation shape), F053 (Windows links and native file types), F074 (Process execution follows owner environment), F083 (Backup derived indexes), F085 (Capture generation differs from upload resume), F086 (Clone completion and cleanup), F089 (Partial clone and LFS/submodule eligibility), F090 (Authorized incomplete-object materialization), F106 (Restore readiness consistency), F107 (Graph page consistency and adjacency bounds). Seven of those fourteen are one lead family —
diffedit3 and external editors — which the union arm's own discovery found as lead 23 and never
routed to a study or compare job within 20 admissions.

## Nesting, recomputed with glm53

Proper subsets:

- `claude` (18) ⊂ `glm53` (37), ⊂ `muse13` (40), ⊂ `union` (43), ⊂ `claude-hicap` (46)
- `deepseek41` (33) ⊂ `muse13` (40), ⊂ `claude-hicap` (46)
- `muse13` (40) ⊂ `claude-hicap` (46)

Not comparable: `claude` vs `deepseek41`; `deepseek41` vs `glm53`; `deepseek41` vs `union`; `muse13`
vs `glm53`; `muse13` vs `union`; `claude-hicap` vs `glm53`; `claude-hicap` vs `union`; `union` vs
`glm53`.

**glm53 changed this result.** After four arms the review set was a clean chain ending at
`claude-hicap`, and the four-arm review union was **exactly claude-hicap's own 46** — no arm had
contributed anything it missed. glm53 holds F068, F069, F085 and F086, which no other review arm
reached, so **claude-hicap is no longer the review-arm ceiling** and the review arms differ in depth
**and, at the margin, in kind.**

**Arm C is the floor, and that is a ceiling artefact, not a judgement.** Its 18 findings are a proper
subset of every other arm's — the only arm in the experiment contained by all five others. Eleven of
its twelve jobs stopped at the 40-response ceiling, and its own control proves the point:
`claude-hicap`, identical in inputs, model, effort, admissions, workers and batching, finished all
twelve jobs and scored 46. **Arm C's 16.36% must never be quoted as a model result.**

## Out-of-union candidates — 27 across six arms

Full detail in `consolidated-candidates.json` and in each arm's `<arm>-candidates.json`. **None is
added to the union.** Each carries the assertion, the passages it cites, my classification and an
explicit check against continuation 3's four rejected expansions: the marker-only conflict command; a
mutating `status.refresh` branch as a required correction; generic in-operation credential prompting;
and the refinement cluster under F082/F086/F056.

By classification: **20 corrections, 5 capabilities, 2 product choices.** Five are flagged as sitting
inside a continuation-3 rejection: `C4C-04`, `C4D-04`, `C4M-03`, `C4U-05`, `C4G-02`.

### Where arms converged independently

### Restore-drill object verification has no defined depth

**C4C-01, C4G-01** — claude, glm53. My classification: **correction**.

THE STRONGEST CONVERGENCE IN THE EXPERIMENT. Two arms with different models reached the same defect from opposite directions and never saw each other's work. Arm C came from the receipt side - object_closure_result: complete is admissible whatever depth produced it, and the Backup owner already has an integrity_verification_level enum to reference. glm53 came from the semantics side - git-fsck(1)'s --connectivity-only 'will detect corruption in commits and trees, but not do any semantic checks ... Corruption in blob objects will not be detected at all' - plus field evidence from Dojjo, where refs agreed via ls-remote while the object store was torn and only a full fsck caught it. glm53 supplies the discriminating fixture: a byte-flipped blob under matching refs. Neither was rejected by continuation 3, and continuation 3's own F106 is a correction in the same JJI-008 restore family.

*The one candidate from continuation 4 I would put in front of the Plans owners on its own.*

### No owner-level save contract for a diff/compare or merge-editor surface

**C4D-04, C4M-03, C4G-02** — deepseek41, muse13, glm53. My classification: **product choice**.

Three arms independently. Each proposes a typed per-path save vocabulary in place of a string map, and each states the alternative of an explicit decision to keep conflict resolution terminal-native. FLAGGED FOR ALL THREE: this is the surface of continuation 3's rejected cluster 'Corruption taxonomy, extras detector, clone stage details and arbitrary conflict editor', and much of each proposal restates union obligations (F029, F031, F033, F034, F036, F037, F056) already credited to the arm that raised it. The genuinely new part, common to all three, is that 'missing' must never be admissible as a write instruction.

*Record; expect it to be declined on continuation 3's reasoning unless the owners decide to open the surface.*

### A divergent change has no representable state

**C4H-05, C4M-05** — claude-hicap, muse13. My classification: **correction (hicap) / product choice (muse13 half A)**.

Two arms. claude-hicap establishes that the word appears nowhere in any source-control, Jujutsu or GUI context in the Plans and that node_state, the GUI graph_states prefix list and the JJ error and disabled-reason enums are all closed without it; muse13 frames the same gap as a product choice about offset-qualified targeting. F006 (identity separation) is credited to both and F022 (explicit convergence) is a union capability neither earned. Neither was rejected.

*A real representability gap; cheap to check against the closed enums.*

### The closure and certification records bind no version, environment or resolved path

**C4D-01, C4M-02, C4C-02, C4U-02** — deepseek41, muse13, claude, union. My classification: **correction**.

Four arms, three of them review arms bounded by the same artifacts and one the full arm. deepseek41 binds the JJ tool and store-format version; muse13 binds the resolving environment and the pointer chains with their distinct bases (alternates relative to the object database, commondir relative to $GIT_DIR); Arm C binds the drill-time resolution of in-store pointers inside the isolation boundary; the union arm binds a nine-row certification scenario matrix. F050 is the behavioural rule and is credited to five of six arms; none of these is in the union.

*The largest agreed gap by arm count. Worth one consolidated owner question rather than four.*

### Reads must be pinned rather than granted write authority

**C4H-02, C4U-01** — claude-hicap, union. My classification: **correction**.

Both arms land on the same side of a boundary continuation 3 settled by REJECTING an expansion. Continuation 3 declined to 'add a mutating status.refresh branch as a required correction' because F002 already fixes read effects and a writer-bearing branch would change that authority. claude-hicap requires every capture and drill read to be pinned to an exact operation with ignore-working-copy and never load_at_head(); the union arm requires a proven non-mutating observation path with typed stale results and states that 'blanket addition of writer leases to all reads would change the existing contract unnecessarily'. Independent convergence on an already-adjudicated boundary is the best evidence in this experiment that the 110-finding union is well drawn.

*No union change; record as confirmation.*

### All 27

| ID | Arm | Class | Label | Inside a continuation-3 rejection? |
|---|---|---|---|---|
| `C4C-01` | claude | correction | JJ restore drill object verification has no stated depth | no |
| `C4C-02` | claude | correction | Isolated drill must resolve and rebind in-store location pointers | no |
| `C4C-03` | claude | correction | Machine-local and ephemeral native store entries have no stated disposition | no |
| `C4C-04` | claude | correction | No blocker class for present-but-unloadable native metadata | **inside a rejection** |
| `C4C-05` | claude | correction | gc_fence_outcome held_during_capture does not state what the fence covered | no |
| `C4D-01` | deepseek41 | correction | No record binds the JJ tool/format version a closure requires | no |
| `C4D-02` | deepseek41 | correction | mark_conflict_resolved's text-based precondition can contradict JJI-005 | no |
| `C4D-03` | deepseek41 | correction | The JJ command inventory has no conflict-resolution entry, so the Conflict-assistant commands have no JJ-scoped preconditions | no |
| `C4D-04` | deepseek41 | capability | No save contract exists for a diff/compare or merge-editor surface | **inside a rejection** |
| `C4H-01` | claude-hicap | correction | cmd.jujutsu.change.split has no expressible non-interactive execution | no |
| `C4H-02` | claude-hicap | correction | An unpinned JJ read authors an operation, so capture and drill can mutate what they observe | no |
| `C4H-03` | claude-hicap | correction | allowed_action_ids has no floor, so a blocked repository can admit no recovery action | no |
| `C4H-04` | claude-hicap | correction | bookmark.track and bookmark.untrack are classified as transport mutations requiring a credential lease | no |
| `C4H-05` | claude-hicap | correction | A divergent change has no representable state anywhere in the corpus | no |
| `C4M-01` | muse13 | correction | JJI-008 states the ends of closure completeness but names no decision procedure | no |
| `C4M-02` | muse13 | correction | The closure manifest records neither the resolved backend paths nor the environment that resolved them | no |
| `C4M-03` | muse13 | capability | No save contract exists for a three-dir or external diff editor touching a JJ workspace | **inside a rejection** |
| `C4M-04` | muse13 | correction | Bookmark controls have the hooks for scope disclosure but none of the content | no |
| `C4M-05` | muse13 | capability | Divergent-change identity and draft-description retention are undefined product choices | no |
| `C4U-01` | union | correction | A read-class PM command must not be implemented by a default mutating jj invocation | no |
| `C4U-02` | union | correction | The certification references have no scenario matrix behind them | no |
| `C4U-03` | union | product choice | Graph gestures are a distinct operation vocabulary, not pictures of the existing scalar target | no |
| `C4U-04` | union | capability | Contextual source, evolution and operation inspection with assisted revset entry | no |
| `C4U-05` | union | capability | Conflict presentation must not replace a real change with a deletion-shaped surrogate | **inside a rejection** |
| `C4G-01` | glm53 | correction | "Object verification" has no defined depth, and a connectivity-only verifier would pass a corrupt-blob closure | no |
| `C4G-02` | glm53 | product choice | A typed per-file save vocabulary, or an explicit decision to keep JJ conflict resolution terminal-native | **inside a rejection** |
| `C4G-03` | glm53 | correction | merge_editor_available is referenced as a command condition and defined by no owner | no |

## Cross-arm factual verifications

Checks I ran against primary sources, not against the arms' claims about each other.

### V1 — jj op-store garbage collection with SystemTime::UNIX_EPOCH

**Ground truth.** jj lib/src/simple_op_store.rs:285-357. remove_file_if_not_new KEEPS a file when mtime > keep_newer and removes it otherwise, so with keep_newer = UNIX_EPOCH every real file's mtime is greater and NOTHING is removed. I read the source directly.

**Outcome by arm.**

- **claude** — WRONG, asserted as fact: gc(head, UNIX_EPOCH) 'preserves nothing by recency', therefore the dojjo server prunes everything unreachable.
- **claude-hicap** — WRONG, and it quoted the correct predicate while drawing the opposite conclusion - the control's counter-result.
- **deepseek41** — RIGHT. It read simple_op_store.rs and caught Arm C. This is why Arm C's four adjudication files were amended.
- **muse13** — NEUTRAL. Recorded the call without characterising a retention direction it had not verified.
- **union** — NOT REACHED. The lead family never entered a study or compare job.
- **glm53** — BOTH, in different jobs. J0020 preserved the correct framing it inherited ('op-store GC with UNIX_EPOCH, no aggressive retention cutoff'); J0023 inferred the wrong direction and then quarantined its own inference in the same document - 'inferred from the call shape ... not verified against pinned jj source. Flagged uncertain; verify against jj simple_op_store before reusing the claim' - naming the exact file deepseek41 read.

**Conclusion.** Five distinct outcomes on one code fact. An error labelled as an unverified inference with the verification step written down is not the same failure as an error asserted as fact.

### V2 — The deepseek-v4-flash selector appearing in every arm's budget file

**Ground truth.** It is continuation 3's frozen hybrid-arm cost-policy block copied into every arm's budget, not a per-arm selector. Each arm's real route is in its own run.json, its gate, its adapter argv and its native usage rows. The runner documented this as corrections.json item C1.

**Outcome.** I OVERSTATED IT against deepseek41 and amended that arm's README, scoring and candidates against myself. The same stale-block class recurs for other arms: protocol/arm-budgets/union.json still names opencode-go/union-alpha and oh-my-pi 18.1.13 where run.json names openrouter/stealth/union-alpha and the binary reports omp/18.2.2; protocol/arm-budgets/glm53.json has no glm53 block at all and no glm53 row in lifetime_captured_caps_usd.

**Conclusion.** run.json is the selector of record for every arm. The budget file is not.

### V3 — Jobs recording 41 native responses against a 40-response ceiling

**Ground truth.** The boundary runs after a response, so at most one further response can already be in flight. The runner documented it as corrections.json item C3.

**Outcome.** Observed in muse13 (J0020, one job) and glm53 (five of twelve jobs). Not an accounting defect.

**Conclusion.** Read the limit as 'at most 40 admitted, one may already be on the wire'.

### V4 — union: how many jobs saved notes.md

**Ground truth.** 19 of 20, not 18. J0018-reconcile (6,336 bytes plus 8 lead documents) and J0020-reconcile (8,790 bytes) both timed out and still saved notes.md; only J0019-reconcile produced nothing.

**Outcome.** The runner's bundle at commit 2bd36e1881 still reports 18 of 20. Those two documents carry 12 of the union arm's 43 credits, so taking the reported figure would have dropped real credit.

**Conclusion.** Corrected in union-scoring.json; the runner's own count is the one to amend.

### V5 — union: the 12-to-39 response range and the $3 unresolved

**Ground truth.** The three timeout jobs have no raw-omp/usage.json at all, so their native receipt count is zero while the durable meter recorded 27, 12 and 13. 484 native receipts across the 17 completed jobs (22-39 each) plus 52 durable-metered requests never receipted = 536 attempted.

**Outcome.** The runner's bundle now states 536 in total, which matches. The per-job range is 22-39 for jobs that receipted at all.

**Conclusion.** The $1 each retained by the three killed jobs is exactly the missing_retained_usage_records and durable_meter_request_count_mismatch pair.

### V6 — glm53: the frozen manifest raced the monitor's final write

**Ground truth.** The runner's internal digest e2d003ea... verifies exactly against the manifest's 5,758 rows. An independent tree re-hash gives 7b1385c3... and the entire difference is one file: monitor-state.json, 592 bytes in the manifest and 769 bytes now. The manifest froze at 01:02:04Z; the monitor wrote its final heartbeat at 01:02:08Z.

**Outcome.** Benign. Every assertion document, every job record, run.json, timing.json, progress.json, priced-usage-final.json and campaign-terminal.json are byte-identical to the manifest, so the designed-stop evidence rests on frozen bytes. muse13, union and claude-hicap show no such difference.

**Conclusion.** Worth fixing in the freeze procedure: quiesce the monitor before hashing. No effect on scoring.

### V7 — Arm C's ceiling caveat, tested by its own control

**Ground truth.** Arm C stopped 11 of 12 jobs at the 40-response ceiling. claude-hicap ran the same inputs, model, effort, admissions, workers and batching at 160 responses per job and finished all 12, using 37-110 responses per job; 11 of those 12 used more than 40.

**Outcome.** 18 to 46 of 110. The ceiling, not judgement, produced Arm C's figure - and Arm C's set is a proper subset of claude-hicap's.

**Conclusion.** Arm C's 16.36% must never be quoted as a model result. Its cost and duration are not comparable with claude-hicap's either.

## Files

| File | Contents |
|---|---|
| `README.md` | This six-arm index |
| `claude-README.md`, `deepseek41-README.md`, `glm53-README.md`, `muse13-README.md`, `claude-hicap-README.md`, `union-README.md` | Per-arm adjudications |
| `arm-c-*.json`, `deepseek41-*.json`, `glm53-*.json`, `muse13-*.json`, `claude-hicap-*.json`, `union-*.json` | Per-arm findings, candidates and scoring |
| `consolidated-candidates.json` | All 27 out-of-union candidates with classification and rejection checks |
| `cross-arm.json` | Recall, nesting, unions, and the seven factual verifications |
| `evidence-manifest.json` | Every run, manifest and assertion document by path and SHA-256 |
| `SHA256SUMS` | Hashes of every file in this bundle |

Per-arm adjudication sources, each with its own hash manifest, are under
`~/PM-Experiments/jujutsu-followup-20260911/continuation4/adjudication/<arm>/`. Raw run workspaces
stay outside this repository per AGENTS.md; everything is cited by path plus SHA-256.

## Limits

1. One frozen case. This does not establish a general model ranking.
2. Recall is measured against continuation 3's adjudicated union, which was itself built from premium
   and hybrid output. **Every arm could only score inside it.** "No arm extended the union" means no
   arm produced a proposition I judged a distinct, supported union finding outside it — not that no
   such proposition could exist. The 27 candidates are where that judgement can be re-examined.
3. "Unsupported or already-covered" is a union class, not a false-positive rate. It includes
   propositions the Plans already own.
4. The adjudicator is an Opus 5 agent and two reviewed arms ran `claude-opus-5`. Every credit names
   its assertion and the passage it cites so the judgement can be re-checked against the artifacts
   rather than taken on my word — and the one place it mattered, the UNIX_EPOCH garbage-collection
   fact, both Claude arms got wrong and I recorded it (V1).
5. Request-limited coverage and reached-delivery fractions are reported per arm. Unperformed work is
   unknown, never a negative finding.
6. **Nothing here is landed.** This branch is pushed for review only.
