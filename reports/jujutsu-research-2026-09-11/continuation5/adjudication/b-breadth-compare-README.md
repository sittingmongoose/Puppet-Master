# Continuation 5 adjudication — Arm B (breadth then compare)

**I am an Opus 5 agent** (`claude-opus-5[1m]`) acting as adjudicator. I ran no arm. Every figure was
rebuilt from durable state, and every credited code fact was verified against the pinned source.

Muse Spark reconciled the 88 frozen leads in the frozen order (30 admissions, 54 delivered, 25 min,
$0.36); `claude-opus-5` at effort **max** then compared **32** of them against the frozen Plans in
Muse's delivery order, **with no premium reconcile output reachable**.

**Scored: b-compare attempt 2 only.** Attempt 1 was destroyed by the account's shared five-hour rate
limit and is archived. I verified independently that it delivered zero comparisons and that no job in
it wrote `notes.md` — it contains no assertion document to score even in principle.

## Three-arm comparison

All three ran on the same premium artifacts, the same frozen case, 12 compare-stage admissions,
3 workers and the same 160-response / 3,600 s / $20 per-job ceilings.

| | claude-hicap (baseline) | Arm P (prioritized depth) | **Arm B (breadth → compare)** |
|---|---:|---:|---:|
| **Credited / 110** | **45 (40.91%)** | 32 (29.09%) | **39 (35.45%)** |
| corrections / 5 | 2 | 0 | **1** |
| optional capability / 36 | 4 | 2 | **6** |
| product choice / 6 | 3 | 1 | **1** |
| unsupported or covered / 63 | 36 | 29 | **31** |
| Leads reaching a comparison | 14 of 88 | 16 of 88 | **32 of 88** |
| **Credits per compared lead** | **3.21** | 2.00 | **1.22** |
| Reconcile model | Opus 5 | Opus 5 | **Muse Spark** |
| Admission order | frozen | Muse ranking | frozen (Muse delivery) |
| Captured cost | $82.52 | $85.51 | **$102.56** |
| Cost per credited finding | **$1.83** | $2.67 | $2.63 |
| Arm wall | 3,535 s | 4,193 s | **5,509 s** (two stages) |
| Candidates inside a continuation-3 rejection | — | 4 of 6 | **0 of 6** |

**Arm B beats Arm P by 7 and still loses to claude-hicap by 6.**

Against Arm P it **gained 15** — the whole external-editor family (F029 F031 F034 F036 F037), the
graph family (F061 F066 F107), the bookmark family (F059 F060), plus F025, F027, F043, F068, F086,
F110. That is precisely the breadth the Muse ranking had thrown away. It **lost 8**:
F019 (Stale workspace recovery), F051 (Colocated import/export stays fail-closed), F052 (Git HEAD and index health are separate), F054 (Effective config and template parsing), F064 (Hidden graph regression qualification), F072 (One catalog and authoritative eligibility), F080 (Snapshot omission and skipped checkout), F090 (Authorized incomplete-object materialization).

Against claude-hicap it **gained 8** — F005 (Expected operation is not native compare-and-swap), F025 (Change evolution view), F027 (Persistent review marks), F057 (Exact-profile conflict byte regression), F060 (Guided bookmark conflict resolution), F068 (Description drafts survive refresh), F086 (Clone completion and cleanup), F110 (New-repository object-format selection) — and **lost 14**:
F028 (Machine-readable hunk selection), F032 (Edited text line-ending policy), F051 (Colocated import/export stays fail-closed), F053 (Windows links and native file types), F062 (Graph visual and menu regressions), F072 (One catalog and authoritative eligibility), F074 (Process execution follows owner environment), F080 (Snapshot omission and skipped checkout), F083 (Backup derived indexes), F087 (Read preview and dry-run side effects), F088 (Parent retention in history edits), F090 (Authorized incomplete-object materialization), F092 (Performance mechanisms are not capability proof), F106 (Restore readiness consistency).

**So: splitting cheap breadth from expensive depth is better than prioritizing depth, and both are
worse than simply running the expensive model over the frozen order.**

### Yield per compared lead falls steeply as breadth rises

3.21 → 2.00 → **1.22**. Doubling the compared leads from 16 to 32 bought **7** findings. The marginal
leads land in families the union is already saturated on, so they re-earn findings other leads
already earned. Against a *fixed* union, admission breadth has sharply diminishing returns — and
neither an explicit ranking nor delivery order carries usable yield information.

| Positions | Job | Leads | Credits | Per lead |
|---|---|---:|---:|---:|
| 1-3 | `J0047-compare` | 3 | **6** | 2.00 |
| 4 | `J0048-compare` | 1 | **3** | 3.00 |
| 5 | `J0049-compare` | 1 | **8** | 8.00 |
| 6-8 | `J0050-compare` | 3 | **2** | 0.67 |
| 9-11 | `J0051-compare` | 3 | **5** | 1.67 |
| 12-14 | `J0052-compare` | 3 | **2** | 0.67 |
| 15-17 | `J0053-compare` | 3 | **0** | 0.00 |
| 18-20 | `J0054-compare` | 3 | **2** | 0.67 |
| 21-23 | `J0055-compare` | 3 | **4** | 1.33 |
| 24-26 | `J0056-compare` | 3 | **3** | 1.00 |
| 27-29 | `J0057-compare` | 3 | **3** | 1.00 |
| 30-32 | `J0058-compare` | 3 | **1** | 0.33 |

## Recall by stage: the cheap reconcile credited nothing, and could not have

| Stage | Credits |
|---|---:|
| Muse Spark reconcile (54 leads, $0.36) | **0** |
| Opus 5 compare (32 leads, $102.20) | **39** |

**This is structural, not a failure.** Every union finding is a proposition about what Puppet Master
must do, and a credit requires that proposition stated against a cited passage. All 23 Muse reconcile
notes are headed *"external technical, no Plans comparison"*, and I verified that **not one of them
cites a single `Plans/` passage**. The stage verifies lead claims against primary sources and records
corrections; it never reaches the Plans. What it contributed is evidence, breadth and an order — it
turned 88 unreviewed leads into 54 reconciled ones for $0.36 in 25 minutes, which is what let the
expensive stage compare 32 leads instead of 14.

## Was the cheap reconcile an adequate basis?

**Adequate in substance, thin as evidence — and the compare paid to re-do the verification.**

**In substance it held.** Where the compare could check the inherited reconciliation it generally
found it correct: *"The parent prose and the child note agree … I re-verified the last point directly
and it holds"* (J0057); *"the handoff/child notes agree with primary sources"* (J0055). I found **no
case where the compare adopted a false conclusion** from the cheap stage.

**But the compare re-verified everything anyway.** Eleven of the twelve compare jobs carry explicit
re-verification or correction language, 2 to 11 statements each: *"Child notes were treated as
evidence, not authority"*; *"re-verified at `f9588f3`, **not taken from handoff prose**"*; *"Upstream
child evidence was treated as evidence, not authority. Where it conflicted with a primary source I
re-read the primary source and say so."*

**The clearest case of being *limited*.** Muse's J0019 declined the `--connectivity-only` question
outright — *"the Git-docs claim about `--connectivity-only` semantics was not independently verified
— retained as unverified"* — handing forward **both an unresolved question and an incorrect
rationale**. J0047-compare fetched `git-fsck`'s documentation itself and found the operational
conclusion right but the reason wrong: refs including `refs/jj/keep/*` *are* reachability roots, so
`--connectivity-only` neither skips them nor misses absent objects; what it misses is byte-level
corruption inside blobs. It replaced the rationale with **"presence and reachability are not
integrity"** and explicitly superseded the child note. Had the compare accepted it, a wrong reason
would have propagated into a PM repair.

**And it found evidence the cheap stage never had.** *"New primary evidence found in this job (not in
the handoff)"* (J0056); *"New, load-bearing detail not present in `handoff.md` or the J0025 child
note"* (J0055). **F110 — the finding that closed a three-continuation gap — is marked "newly verified
here" and was not in the cheap reconcile at all.**

| Adequacy measure | Value |
|---|---:|
| Compared leads | 32 |
| …from a **response-limited** Muse job | **14** |
| …from a Muse note the job itself labelled partial | 3 |
| Muse jobs that wrote no `notes.md` at all | 7 of 30 |
| Compare jobs recording re-verification or correction | **11 of 12** |

## Verification

Both manifests verify three ways — rows, the runner's quoted value, and an independent tree re-hash —
with zero differing files: breadth `711302fab6dd…` (18,258 files), compare attempt 2
`17b32556b5d3…` (20,012 files). Both stages stopped on `admitted_attempt_cap`.

**Isolation, checked independently of the runner's proof.** I rebuilt it from the compare jobs' own
`job.json` upstream chains: every reconcile job cited upstream is a Muse b-breadth job, and **not one
of the twelve premium reconcile jobs appears**. The carry-across is byte-faithful — all 23 Muse
`notes.md` are sha256-identical across the two trees. *Honest caveat the runner's proof does not
state:* the compare jobs do see the premium arm's **implementation and history** study notes, exactly
as claude-hicap and Arm P did. The isolated layer is the **reconcile** layer.

**Code facts: 8 verified, 8 upheld** — the `--at-op=@` / `--ignore-working-copy` distinction (V-B1),
diffedit3's `FileEntry`, `save_unchecked` and `MAX_FILE_LENGTH` (V-B2–B4), the partial-resolve error
and `tx.finish` ordering (V-B5–B6), `ToolAborted` before `snapshot_results` (V-B7), and
`get_head` on an empty head set (V-B8).

## Job table (compare stage)

| Job | Positions | Elapsed s | Responses | notes.md | Leads | Credits |
|---|---|---:|---:|---:|---:|---:|
| `J0047-compare` | 1–3 | 1068 | 76 | 42,122 | 2 | 6 |
| `J0048-compare` | 4–4 | 762 | 59 | 38,288 | 4 | 3 |
| `J0049-compare` | 5–5 | 827 | 86 | 35,693 | 4 | 8 |
| `J0050-compare` | 6–8 | 1106 | 76 | 75,304 | 3 | 2 |
| `J0051-compare` | 9–11 | 869 | 78 | 50,375 | 3 | 5 |
| `J0052-compare` | 12–14 | 887 | 78 | 42,496 | 3 | 2 |
| `J0053-compare` | 15–17 | 1096 | 78 | 50,664 | 3 | 0 |
| `J0054-compare` | 18–20 | 1301 | 62 | 50,240 | 2 | 2 |
| `J0055-compare` | 21–23 | 733 | 79 | 39,000 | 3 | 4 |
| `J0056-compare` | 24–26 | 900 | 68 | 55,245 | 3 | 3 |
| `J0057-compare` | 27–29 | 953 | 77 | 51,650 | 5 | 3 |
| `J0058-compare` | 30–32 | 785 | 56 | 51,574 | 2 | 1 |

**No compare job was request-, time-, money- or rate-limited.** 56–86 responses against a 160
ceiling; longest 1,300.7 s of 3,600; dearest $10.21 of $20. Every typed `rate_limit_event` stayed
`allowed`. The breadth stage is the limited one: **16 of 30 Muse jobs hit the 40-response ceiling.**

## Recall: 39 / 110 (35.45%)

corrections **1/5** (F107) · optional capability **6/36** · product choice **1/6** · unsupported or
already-covered **31/63**. Five partials: F022, F051, F074, F080, F090.

| ID | Title | Class | Job |
|---|---|---|---|
| F002 | Nominal reads may write | unsupported or rejected | `J0047-compare` |
| F004 | Writer authority is stronger than native locks | unsupported or rejected | `J0051-compare` |
| F005 | Expected operation is not native compare-and-swap | unsupported or rejected | `J0056-compare` |
| F006 | Exact durable identity and operation-local selectors | unsupported or rejected | `J0051-compare` |
| F007 | Process failure and cancellation are not no-effect proof | unsupported or rejected | `J0048-compare` |
| F008 | Partial multi-file resolve | unsupported or rejected | `J0048-compare` |
| F010 | Native versus sidecar crash boundary | unsupported or rejected | `J0047-compare` |
| F011 | Native recovery has explicit scope | unsupported or rejected | `J0052-compare` |
| F025 | Change evolution view | optional capability | `J0055-compare` |
| F027 | Persistent review marks | optional capability | `J0054-compare` |
| F029 | Hunk and editable diff safety | unsupported or rejected | `J0049-compare` |
| F030 | Empty, absent and failed reads are distinct | unsupported or rejected | `J0049-compare` |
| F031 | Diff text and metadata round-trip | unsupported or rejected | `J0049-compare` |
| F033 | External editor path confinement | unsupported or rejected | `J0049-compare` |
| F034 | Partial external editor writes | unsupported or rejected | `J0049-compare` |
| F035 | External diff and merge tool handoff | optional capability | `J0049-compare` |
| F036 | External editor stale sessions | unsupported or rejected | `J0049-compare` |
| F037 | Bound reads before allocating | unsupported or rejected | `J0049-compare` |
| F043 | Authenticated browser and local IPC | unsupported or rejected | `J0048-compare` |
| F044 | Adapter implementation shape | product choice | `J0054-compare` |
| F050 | Included tools and exact qualification | unsupported or rejected | `J0056-compare` |
| F056 | Native conflict truth and supported shape | unsupported or rejected | `J0057-compare` |
| F057 | Exact-profile conflict byte regression | unsupported or rejected | `J0057-compare` |
| F059 | Push targets and bookmark effects | unsupported or rejected | `J0055-compare` |
| F060 | Guided bookmark conflict resolution | optional capability | `J0055-compare` |
| F061 | Graph bounds, continuity and isolation | unsupported or rejected | `J0051-compare` |
| F066 | Direct graph manipulation | optional capability | `J0050-compare` |
| F068 | Description drafts survive refresh | unsupported or rejected | `J0051-compare` |
| F073 | Runtime evidence versus unused scaffolding | unsupported or rejected | `J0050-compare` |
| F079 | Complete retained native backup closure | unsupported or rejected | `J0047-compare` |
| F081 | Backup existence is not verified recovery | unsupported or rejected | `J0047-compare` |
| F082 | Extras head integrity and crash corruption | unsupported or rejected | `J0057-compare` |
| F084 | Sanitized inactive restore configuration | unsupported or rejected | `J0047-compare` |
| F086 | Clone completion and cleanup | unsupported or rejected | `J0055-compare` |
| F089 | Partial clone and LFS/submodule eligibility | unsupported or rejected | `J0052-compare` |
| F094 | Operation metadata is not idempotency | unsupported or rejected | `J0058-compare` |
| F102 | Upstream narrative inconsistencies | unsupported or rejected | `J0047-compare` |
| F107 | Graph page consistency and adjacency bounds | correction | `J0051-compare` |
| F110 | New-repository object-format selection | optional capability | `J0056-compare` |

## Three findings no arm had ever reached

**F027** (persistent review marks), **F060** (guided bookmark conflict resolution) and **F110**
(new-repository object-format selection) are reached by none of the six continuation-4 arms and not
by Arm P. The **eight-arm union rises to 62 of 110 (56.36%)** and findings reached by no arm fall
**51 → 48**. Progression: continuation-4 six-arm 57 → with Arm P 59 → with Arm B **62**.

## Out-of-union candidates

Six, checked against continuation 3's four rejected expansions. **None falls inside one** — against
four of six for Arm P. Breadth spread this arm across families the union had not already closed.

### C5B-01 — A verification read may not create an operation, and the verified op-head set must equal the captured set

**Where** `b-compare/J0047-compare`. **My classification: correction.**

**The assertion.** JJI-008 AC5's 'read modes that do not create a hidden JJ snapshot' names only half of the two-part non-mutating read jj itself prescribes. Extend it to 'neither a hidden JJ snapshot nor a new operation, including operation-head resolution/merge, op-head marker rewriting, or rebuild-on-read of derived state'; capture records the op-head set AS A SET with a new operation_head_state of single_head | divergent_heads | unreadable; and the verification receipt asserts set equality with the referenced closure record, any difference forcing blocked_operation_mismatch rather than verified_on_disposable_copy.

**Passages cited.**
  - Plans/Jujutsu_Integration.md:468 (AC5) and :482 (validation surfaces); schema assertion at jujutsu_integration_contracts.schema.json:2719
  - jujutsu_integration_contracts.schema.json:2138, 2183-2190 (closure operation_head_refs) and :2389, 2441-2448 (receipt's own set), with the full receipt allOf at :2587-2700 read to show no condition mentions operation heads
  - jujutsu_integration_contract_fixtures.json:2782-2836 and :2948-2996 - the shipped fixture pair changes operation_id and commit_id across capture and verification while still asserting verified_on_disposable_copy
  - jj CLI reference :2037 and :850 (verified by me as V-B1)

**Did continuation 3 already reject it?** NO. None of the four rejected expansions covers restore-drill read modes or op-head set equality. It is adjacent to continuation 3's own F106 - both are defects in backup_jj_restore_verification_receipt found by reading its conditionals - and F106 was accepted as a correction.

**Distinctness.** F002 and F081 are both credited to this arm. This candidate is narrower and sharper than either: it is the specific observation that the corpus's non-mutating-read requirement is satisfiable while still merging divergent operation heads, plus the set-equality check that would make it falsifiable. The fixture pair it names is shipped evidence that the permissive reading is the one in use.

*Not added to the union. The strongest candidate from this arm.*

### C5B-02 — Closure records carry a completeness claim with no object-integrity axis

**Where** `b-compare/J0047-compare`. **My classification: correction.**

**The assertion.** Both closure records gate 'complete' on missing dependencies, barrier and fence outcomes and a determined captured-files relation - and on nothing about object CONTENT. A torn pack hashes identically on both sides, so a faithful copy of a corrupt store passes every existing check and is still certified complete. Add closure_integrity_level of not_verified | references_resolved | object_content_verified plus a validator receipt ref, require object_content_verified for 'complete', and state the negative: matching ref tips, an 'already up to date' negotiation, a zero exit status, a file-level hash match or a readable manifest are not object-closure evidence.

**Passages cited.**
  - Plans/source_control_contracts.schema.json:2868-2896 and :3079-3114; Plans/jujutsu_integration_contracts.schema.json:2321-2344
  - Plans/Backup_Restore_System.md:236-240, 252-253 (BRS-005's independent-axes rule, which the repair extends rather than redefines)
  - Plans/forge_backup_tsnet_acceptance.json:1141 (capture fidelity proves the copy matches the source, not that the source is intact)
  - Plans/Source_Control_System.md:796 (the analogous remote-side negative already exists)
  - git-fsck documentation, fetched first-hand: --connectivity-only 'Corruption in blob objects will not be detected at all'

**Did continuation 3 already reject it?** NO. Not among the four. It is a new axis on an existing record rather than a corruption taxonomy or a repair route, and the arm explicitly keeps it separate from Backup's own verifying_structure/verifying_data axes and adds no command or handler.

**Distinctness.** F079 and F010 are credited to this arm. This is the contract shape that would make 'presence and reachability are not integrity' enforceable, and it reuses an existing in-corpus pattern (BRS-005's independent axes) rather than inventing one.

*Not added to the union.*

### C5B-03 — Interactive mutations have no ObservableWork obligation, so a command that blocks on a human is schema-legal as a synchronous success

**Where** `b-compare/J0048-compare`. **My classification: correction.**

**The assertion.** JJI-003 enumerates which actions must expose ObservableWork - 'Multi-step workspace, rebase, typed import/export, fetch/push and recovery actions' - and change.split, .squash, .restore, .describe and .edit are all excluded, with the owner's own fixture setting observable_work_id null for split. Externally those are precisely the commands whose native implementation blocks on a human for an unbounded time. Extend the enumeration so any canonical command whose adapter invocation can block on human interaction must return accepted with an observable_work_id and must not return a synchronous succeeded, using the successor 'waiting'/'user' vocabulary and phase evidence rather than a fabricated denominator.

**Passages cited.**
  - Plans/Jujutsu_Integration.md JJI-003 canonical_text:115-117 and §3.3:303
  - Plans/jujutsu_integration_contract_fixtures.json:661 (observable_work_id null for split)
  - Plans/full_thread_runtime_contracts.schema.json:30 and fixtures :44 (legacy awaiting_user -> waiting/user)
  - Plans/Shared_Integration_Runtime.md §8.2:225 and :227

**Did continuation 3 already reject it?** NO. Not among the four rejected expansions. It is adjacent to the declined conflict-editor surface only in that its motivating example is an interactive tool, but the repair touches no command inventory and adds no route - it changes which existing commands must expose work.

**Distinctness.** F035 is credited to this arm for the managed-session proposal. This candidate is the prior obligation: even with no external tool, the frozen contract permits a mutation that blocks indefinitely with no phase, wait reason or cancel.

*Not added to the union.*

### C5B-04 — Mutable-versus-immutable revision state has no typed representation

**Where** `b-compare/J0050-compare`. **My classification: correction.**

**The assertion.** Immutability is a first-class, configuration-derived jj property that decides whether a rewrite is admissible at all, and the corpus's node and revision shapes have no field for it. A projection cannot say which revisions the user may edit, so the UI must either guess or attempt and fail.

**Passages cited.**
  - Plans/source_control_contracts.schema.json node_state closed enum (normal | rewritten | abandoned | conflicted)
  - Plans/final_gui_interaction_contracts.schema.json:603 (the closed Jujutsu graph_states tuple)
  - jj docs/config.md on revset-aliases."immutable_heads()" as the configuration that defines the set

**Did continuation 3 already reject it?** NO. Not among the four. Arm P reached the neighbouring finding from the configuration side (its F054 credit, effective config silently changing which commits are immutable); this arm reaches it from the projection side - the state has no representation even when the configuration is known.

**Distinctness.** F006 is credited to this arm for identity separation and F061 for the graph page. Neither covers a missing typed state. Recorded because the two arms converged on the same gap from opposite directions.

*Not added to the union.*

### C5B-05 — First-class divergent and hidden revisions

**Where** `b-compare/J0051-compare`. **My classification: capability.**

**The assertion.** Add divergent and hidden to node_state and to the GUI graph_states census; when two nodes share a stable_change_ref the page marks both divergent and exposes a disambiguation affordance keyed on the exact commit_id; allow targeting a specific one for READ actions while leaving mutation admission exactly as JJI-002 specifies. A corpus-wide literal search for 'divergent' returns no Source-Control or Jujutsu hit at all.

**Passages cited.**
  - Plans/source_control_contracts.schema.json:2789 (node_state closed enum)
  - Plans/final_gui_interaction_contracts.schema.json:603 (graph_states as a prefixItems/items:false tuple)
  - Plans/Jujutsu_Integration.md JJI-002 (mutation admission left unchanged)

**Did continuation 3 already reject it?** NO, and it is carefully NOT the rejected thing. F022 in the union asks for explicit CONVERGENCE of commits sharing one change identity; this proposal deliberately stops short of that, leaving mutation admission untouched and offering only representation and read targeting. claude-hicap made the same distinction in continuation 4 and was likewise not credited F022.

**Distinctness.** Recorded as a candidate rather than credited as F022 precisely because the arm is explicit that representability is not convergence.

*Not added to the union, and not credited as F022.*

### C5B-06 — A JJ cancellation route, with cancellation classified from an adapter-held signal rather than exit status

**Where** `b-compare/J0053-compare`. **My classification: product choice.**

**The assertion.** No canonical command requests JJ cancellation. The repair proposes that cancellation be classified from an adapter-held signal record, never from exit status or a kill sweep; that a JJ child be registered before spawn under one lock; that cancel terminate the process group or tree rather than the leader; that the terminal outcome be recorded only after drain and reap; that effect_state for a cancelled mutation not be inferred from the kill; that cancellation be scoped to the action rather than the repository; and that Windows parity be stated rather than assumed.

**Passages cited.**
  - Plans/Jujutsu_Integration.md §3.3:303 (the result vocabulary) and §3.2:297 (argv identity, stdout diagnostic only)
  - Plans/Jujutsu_Integration.md:255-287 (the closed 31-command inventory, which contains no cancellation command)
  - Plans/Source_Control_System.md SCS-016:902-904 and :943

**Did continuation 3 already reject it?** NO. Not among the four. It adds a command to a closed inventory, which is the same class of owner adjudication the union's F044 and the conflict-route candidates raise, so it needs owner approval rather than being a repair - which is how the arm files it.

**Distinctness.** F007 is credited to this arm for the effect-disclosure half. This candidate is the missing route and the process-policy mechanics behind it.

*Not added to the union.*

## Observations

**THE HEADLINE: the split recovered most of what prioritization lost, and still lost to the baseline.** Arm B scored 39/110 against Arm P's 32 and claude-hicap's 45. It compared 32 leads to Arm P's 16 and claude-hicap's 14. Against Arm P it gained 15 - the whole external-editor family (F029 F031 F034 F036 F037), the graph family (F061 F066 F107), the bookmark family (F059 F060) and F025, F027, F043, F068, F086, F110 - which is exactly the breadth the Muse ranking had thrown away. Against claude-hicap it still lost 14 and gained 8. So splitting cheap breadth from expensive depth is better than prioritizing depth, and both are worse than simply running the expensive model over the frozen order.

**Yield per compared lead falls steeply as breadth rises.** Credits per compared lead: claude-hicap 45/14 = 3.21; Arm P 32/16 = 2.00; Arm B 39/32 = 1.22. Doubling the compared leads from 16 to 32 bought 7 findings. The marginal leads land in families the union is already saturated on, so they re-earn findings other leads already earned. This is the clearest quantitative result of the two continuation-5 arms together: against a FIXED union, admission breadth has sharply diminishing returns, and neither an explicit ranking (Arm P) nor delivery order (Arm B) carries usable yield information.

**The cheap reconcile earned nothing and could not have - and the compare re-did its verification anyway.** All 23 Muse reconcile notes are headed 'external technical, no Plans comparison' and NOT ONE cites a Plans passage, so the stage cannot earn a union credit by construction. That is the design, not a failure. But the second half is the interesting one: eleven of the twelve compare jobs record re-verifying or correcting the inherited material, with 2 to 11 such statements each - 'treated as evidence, not authority', 'not taken from handoff prose', 'New primary evidence found in this job (not in the handoff)'. So the cheap stage did not save the expensive stage the verification work. What it bought was breadth and an order, for $0.36.

**The cheap stage handed forward an unresolved question AND a wrong rationale, and the compare caught it.** Muse's J0019 declined the --connectivity-only question outright: 'the Git-docs claim about --connectivity-only semantics was not independently verified - retained as unverified, per handoff.' J0047-compare fetched git-fsck's documentation itself and found the operational conclusion right but the stated reason wrong - refs including refs/jj/keep/* ARE reachability roots, so --connectivity-only neither skips them nor misses absent objects; what it misses is byte-level corruption inside blobs. The compare replaced it with 'presence and reachability are not integrity' and explicitly superseded the child note. Had the compare accepted the inherited rationale, a wrong reason would have propagated into a PM repair. This is the clearest case of the cheap reconcile limiting rather than serving the expensive stage - and, notably, glm53 reached the same correction independently in continuation 4.

**Three findings no arm had ever reached, and one of them was not in the cheap reconcile at all.** Arm B adds F027 (persistent review marks), F060 (guided bookmark conflict resolution) and F110 (new-repository object-format selection) over all seven prior arms - the six continuation-4 arms and Arm P. The eight-arm union rises to 62 of 110 (56.36%) and findings reached by no arm fall from 51 to 48. F110 is the one to note: the arm marks it 'Additive correction to the handoff's "just an ID string" framing, NEWLY VERIFIED HERE', establishing from source that the hash choice is structural inside jj rather than a display format - so the finding that closed a three-continuation gap came from the expensive stage going beyond what the cheap stage handed it.

**Attempt 1 is excluded, and I verified it is empty rather than taking that on instruction.** b-compare attempt 1 was destroyed by the account's shared five-hour rate limit - eleven of its twelve jobs died on the session limit, nine of them within 6.6 to 7.9 seconds - and is archived under arm-history/b-compare-attempt-1/. I confirmed independently that it delivered zero comparisons and that no job in it wrote notes.md, so it contains no assertion document to score even in principle. The archive follows the continuation-4 precedent for an arm destroyed by an external fault, and the run tree was deliberately left in place because its manifest hash and the already-pushed bundle cite that path.

**Isolation holds, and I checked it independently of the runner's proof.** The design property Arm B exists to test is that the expensive compare depends only on the cheap arm's reconcile. The runner's compare-isolation.json records pass. I rebuilt it from the compare jobs' own upstream chains: every reconcile job cited upstream is a Muse b-breadth job, and NOT ONE of the twelve premium reconcile jobs appears. I also verified the carry-across was byte-faithful - all 23 Muse reconcile notes.md are sha256-identical between the two trees. One honest caveat the runner's proof does not state: the compare jobs do see the premium arm's implementation and history STUDY notes, exactly as claude-hicap and Arm P did. The isolated layer is the reconcile layer, which is what the design varies.

## Limits

- One frozen case, one cheap model, one split. This does not establish that a breadth/depth split cannot win - only that this one did not beat the single-stage baseline.
- Two variables differ from claude-hicap: the reconcile model AND the lead set that reached compare. The split's effect is not cleanly isolated.
- Recall is measured against continuation 3's fixed 110-finding union, built from premium and hybrid output; every arm can only score inside it.
- The scored result is attempt 2. Attempt 1 was destroyed by the account's shared rate limit and is excluded; I verified it contains no assertion document rather than taking that on instruction.
- 'Unsupported or already-covered' is a union class, not a false-positive rate.
- Adjudicator and the compare-stage model share a family; code facts were verified against pinned bytes to make the judgement re-checkable.

## Files

| File | Contents |
|---|---|
| `b-breadth-compare-findings.json` | 39 credited rows with class, job, delivery positions, basis, evidence hashes and per-finding code-fact verification; 5 partials |
| `b-breadth-compare-candidates.json` | 6 out-of-union candidates and 7 observations, with rejection checks |
| `b-breadth-compare-scoring.json` | Manifest and isolation verification, job table, recall by stage, reconcile adequacy, per-lead yield, three-arm comparison |
| `PROGRESS.md` | Stage-by-stage progress note |
| `../b-breadth-compare-manifest.json` | Hash manifest for this directory |

Runner bundle: branch `research/continuation5-20260917`, commit `2a0a15078d`, at
`reports/jujutsu-research-2026-09-11/continuation5/`. Referenced by path; its tables are not
duplicated here.
