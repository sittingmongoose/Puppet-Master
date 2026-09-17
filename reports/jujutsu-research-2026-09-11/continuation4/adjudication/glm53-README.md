# Continuation 4 adjudication — the `glm53` arm (review replacement)

> **All six arms are now scored. The final comparison table, the recomputed nesting, the six-arm union, all 27 out-of-union candidates and the cross-arm factual verifications are in [`README.md`](README.md)**, which supersedes every comparison table below.

**I am an Opus 5 agent** (`claude-opus-5[1m]`) acting as adjudicator. I ran no arm and have no
model-family relationship with the reviewed model. Every figure was rebuilt from durable state.

`zai/glm-5.3-flash` at effort `max` through oh-my-pi 18.2.2, replacing the review model over the
**premium arm's frozen discovery, study and history artifacts — the same starting state as Arm C**.
Its recall is bounded by what those artifacts contain, so it is comparable with `claude`,
`deepseek41`, `muse13` and `claude-hicap`, and **not** with the `union` arm, which ran the full
pipeline from discovery.

## The stop was designed — confirmed three ways before scoring

`campaign-terminal.json`, `monitor-state.json` and `protocol/arm-budgets/glm53.json` all record
`Stop: admitted_attempt_cap`; the budget file adds `stop_kind: "limit_or_gate"`. A designed gate, not
the `FileNotFoundError` that quarantined the 21:57Z glm53 attempt.

## Verification, including one file that moved

The runner's internal digest `e2d003ea…` **verifies exactly** against the manifest's 5,758 sorted
rows. An independent re-hash of the tree gives `7b1385c3…` instead, and **the entire difference is
one file**: `monitor-state.json`, 592 bytes in the manifest and 769 bytes now.

The manifest froze at `01:02:04Z`; the scheduler's monitor wrote its final heartbeat at `01:02:08Z`,
four seconds later, adding the `stop_reason` and `terminal` block. It is the monitor's own state
file, not an arm output. I confirmed byte-identity for **every one of the 12 assertion documents**,
every job record, `run.json`, `timing.json`, `progress.json`, `priced-usage-final.json` and
`campaign-terminal.json` — so the designed-stop evidence rests on frozen bytes. muse13, union and
claude-hicap froze after their monitor's last write and show no such difference. Worth fixing in the
freeze procedure: quiesce the monitor before hashing. **No effect on scoring.**

| Item | Value |
|---|---|
| Run directory | `/home/sittingmongoose/PM-Experiments/jujutsu-followup-20260911/continuation4/runs/jujutsu-glm53-20260917-000655` |
| Internal `manifest_sha256` | `e2d003ea0eb895d403cd42a28c2416f13ade5d81ee8d1a358ca2031d6a5b1931` |
| Manifest file's own bytes | `1901695d71d0a2f9ada51bcaaff23020d982303ec658734b4a779be3077f225d` |
| Files / bytes | 5,758 / 345,923,877 |

## Every runner figure checked out

This is **the first continuation-4 arm for which every figure I checked was already correct** — Arm
C, deepseek41, muse13 and union each needed at least one correction. 12 jobs (7 reconcile, 5
compare); 7 truncated and 5 finished; 24–41 requests per job; reconcile wall 3,183 s, compare wall
2,425 s, arm wall 3,250 s, summed 9,340 s, concurrency 2.874; captured $0.819490 with all 12
reconciled and $0 unresolved; 8 of 12 wrote `notes.md`; 16 lead deliveries.

## The `budget_truncated` label, re-verified

All seven are **response-ceiling** truncations. `protocol/arm-budgets/glm53.json` has no per-job
money ceiling (`policy.glm53_usd: 50` is the arm cap) and no `glm53` row in
`lifetime_captured_caps_usd` at all; the arm spent $0.82 of $50 with a largest single job of $0.0936;
`money_stop_reason` and `stop_reason` are both null; all 12 jobs record accounting `complete: true`
with **zero gaps**. The seven truncated jobs sit at 40 or 41 receipts, the five completed at 24–31.
**No job was money-truncated and none was time-truncated** — the longest ran 1,106 s of a 2,400 s
wall. Five jobs recorded 41 against a 40 ceiling: the post-response off-by-one the runner documented
as correction C3.

## Job table, rebuilt from durable state

| Job | Stage | Status | Elapsed s | Receipts | Attempt | notes.md | Leads written | Primary credits |
|---|---|---|---:|---:|---|---|---:|---:|
| `J0017-reconcile` | reconcile | budget_truncated | 819.8 | 41 | 1 | yes | 1 | 7 |
| `J0018-reconcile` | reconcile | budget_truncated | 672.6 | 41 | 1 | NO | 0 | 0 |
| `J0019-reconcile` | reconcile | budget_truncated | 642.4 | 41 | 1 | NO | 0 | 0 |
| `J0020-reconcile` | reconcile | budget_truncated | 1106.1 | 41 | 2 (retry of J0019-reconcile) | yes | 0 | 4 |
| `J0021-reconcile` | reconcile | budget_truncated | 907.7 | 41 | 2 (retry of J0018-reconcile) | yes | 3 | 2 |
| `J0022-compare` | compare | completed | 697.8 | 29 | 1 | yes | 0 | 3 |
| `J0023-reconcile` | reconcile | completed | 747.3 | 27 | 1 | yes | 0 | 5 |
| `J0024-compare` | compare | completed | 667.6 | 31 | 1 | yes | 0 | 4 |
| `J0025-compare` | compare | budget_truncated | 727.1 | 40 | 1 | NO | 0 | 0 |
| `J0026-reconcile` | reconcile | completed | 928.7 | 30 | 1 | yes | 0 | 6 |
| `J0027-compare` | compare | budget_truncated | 660.6 | 40 | 1 | NO | 0 | 0 |
| `J0028-compare` | compare | completed | 762.5 | 24 | 2 (retry of J0025-compare) | yes | 0 | 6 |

**Three of the twelve admissions were retries, and every retry delivered.** J0018→J0021,
J0019→J0020 and J0025→J0028: in each pair the first attempt wrote nothing and the retry delivered.
Those three retries carry **12 of the 37 credits**, including the whole Dojjo family and the
jj-resolve partial-resolution lead. **No lead was lost to truncation.** The cost is that 12
admissions bought only **nine distinct logical jobs**.

## Recall on the fixed 110-finding union

**37 / 110 = 33.64%.** On the original 105 basis, 37/105 = 35.24%.

| Class | Credited | Denominator |
|---|---:|---:|
| correction | 0 | 5 |
| optional_capability | 2 | 36 |
| product_choice | 0 | 6 |
| unsupported_or_rejected | 35 | 63 |

Corrections missed: F001, F106, F107, F108, F109.

### optional_capability (2)

| ID | Title | First earned | Strongest statement |
|---|---|---|---|
| F035 | External diff and merge tool handoff | compare | `J0024-compare` |
| F066 | Direct graph manipulation | reconcile | `J0023-reconcile` |

### unsupported_or_rejected (35)

| ID | Title | First earned | Strongest statement |
|---|---|---|---|
| F004 | Writer authority is stronger than native locks | reconcile | `J0026-reconcile` |
| F006 | Exact durable identity and operation-local selectors | reconcile | `J0026-reconcile` |
| F007 | Process failure and cancellation are not no-effect proof | reconcile | `J0021-reconcile` |
| F008 | Partial multi-file resolve | reconcile | `J0021-reconcile` |
| F010 | Native versus sidecar crash boundary | reconcile | `J0023-reconcile` |
| F029 | Hunk and editable diff safety | compare | `J0022-compare` |
| F030 | Empty, absent and failed reads are distinct | reconcile | `J0017-reconcile` |
| F031 | Diff text and metadata round-trip | reconcile | `J0017-reconcile` |
| F033 | External editor path confinement | reconcile | `J0017-reconcile` |
| F034 | Partial external editor writes | reconcile | `J0017-reconcile` |
| F036 | External editor stale sessions | compare | `J0022-compare` |
| F037 | Bound reads before allocating | reconcile | `J0017-reconcile` |
| F043 | Authenticated browser and local IPC | compare | `J0024-compare` |
| F050 | Included tools and exact qualification | compare | `J0028-compare` |
| F051 | Colocated import/export stays fail-closed | compare | `J0028-compare` |
| F053 | Windows links and native file types | reconcile | `J0017-reconcile` |
| F056 | Native conflict truth and supported shape | compare | `J0022-compare` |
| F059 | Push targets and bookmark effects | reconcile | `J0023-reconcile` |
| F061 | Graph bounds, continuity and isolation | reconcile | `J0026-reconcile` |
| F062 | Graph visual and menu regressions | reconcile | `J0023-reconcile` |
| F068 | Description drafts survive refresh | reconcile | `J0026-reconcile` |
| F069 | Immutable content caches and async selection | reconcile | `J0026-reconcile` |
| F072 | One catalog and authoritative eligibility | compare | `J0024-compare` |
| F073 | Runtime evidence versus unused scaffolding | reconcile | `J0020-reconcile` |
| F074 | Process execution follows owner environment | compare | `J0024-compare` |
| F079 | Complete retained native backup closure | compare | `J0028-compare` |
| F080 | Snapshot omission and skipped checkout | compare | `J0028-compare` |
| F081 | Backup existence is not verified recovery | compare | `J0028-compare` |
| F082 | Extras head integrity and crash corruption | reconcile | `J0020-reconcile` |
| F084 | Sanitized inactive restore configuration | compare | `J0028-compare` |
| F085 | Capture generation differs from upload resume | reconcile | `J0020-reconcile` |
| F086 | Clone completion and cleanup | reconcile | `J0020-reconcile` |
| F088 | Parent retention in history edits | reconcile | `J0023-reconcile` |
| F092 | Performance mechanisms are not capability proof | reconcile | `J0026-reconcile` |
| F102 | Upstream narrative inconsistencies | reconcile | `J0017-reconcile` |

**Unusually reconcile-weighted: 24 of 37 credits are first earned in a reconcile job**, the opposite
shape from the union arm (10 reconcile, 21 compare). Three of this arm's five compare jobs took
Dojjo and diffedit3 leads whose reconcile work had already stated the propositions.

## Request-limited coverage, and the reached-delivery fraction

| Measure | Value |
|---|---|
| Jobs bound by the 40-response ceiling | 7 of 12 |
| Jobs money- or time-truncated | 0 |
| Jobs with a saved assertion | 8 of 12 (66.7%) |
| Jobs with none | J0018, J0019, J0025, J0027 |
| Input leads | 88 |
| Leads admitted to a reconcile job / with a saved reconcile assertion | 11 / 11 = **100%** |
| Leads admitted to a compare job / with a saved comparison | 8 / 5 = 62.5% |
| Of the 88 input leads: reached reconcile / reached compare | 12.5% / 5.7% |

J0019, J0025 and J0027 spent their budget on source-locator acquisition (7, 34 and 81 receipts) and
wrote no assertion; J0018 wrote nothing at all. Three of those four were retried and all three
retries delivered. **J0027 was not retried — the admission cap was reached** — so its three leads
are the only ones that reached compare without a comparison; their reconcile work (J0023) is scored
and carries 5 credits.

**Named structural loss: F107.** J0026 confirmed the paged-graph defects that are F107's external
form and no compare job in this arm ever took a graph lead, so the contract defect was never stated.
See the partials below.

## Partial matches — 10, recorded not credited

### F001 — Terminal attempts always have receipts

J0028 quotes the existing requirement - 'every terminal attempt emits a typed operation receipt even when the effect is unknown or recovery is required' (Source_Control_System.md:130-131) - and J0024 lists the seven typed results including effect_unknown. Neither states the correction: that a contract shape permits a terminal attempt with a null receipt. The arm treats the obligation as satisfied rather than finding where it is not enforced.

### F005 — Expected operation is not native compare-and-swap

J0026 gets the strongest half - GG's admission is 'an explicit stale-target admission policy, weaker than an exact expected-native-revision rule' (gui_util.rs:537-571) - and J0028 quotes 'Every JJ mutation compares the expected operation and immutable commit identity'. What is missing is the distinguishing clause: nothing in the corpus says --at-operation selects a starting view rather than performing a compare-and-swap, or addresses the after-a-long-fetch case. Credited as F006, which is what the arm actually proves.

### F009 — Unknown auth retry effects

J0024 and J0028 assert the general rule ('Do not retry an effect-unknown mutation automatically', Source_Control_System.md:154) and apply it to a killed editor process. The credential-specific proposition - do not copy fail-prompt-retry credential flows unless the prior operation is proven safe to replay under the same command instance - is not stated; no credential retry flow is examined.

### F032 — Edited text line-ending policy

The preservation clause is asserted twice ('untouched CRLF file byte-identical after save'; 'Unchanged files byte-identical on save (no re-encode; line endings preserved per the FileManager.md:349 principle)'), but the product choice itself - which newline convention applies to genuinely newly inserted or replaced boundaries in mixed-ending edited text - is never posed. J0021 asks only whether a no-edit Save can round-trip and whether unsupported combinations should disable saving. muse13 and claude-hicap were credited because each poses the edited-row policy explicitly; this arm does not.

### F038 — Credential architecture and custody already chosen

J0024 asserts authenticated IPC, operation/session binding, typed waits ('browser-open failure alone is non-fatal and surfaces as a typed wait reason') and the loopback-is-not-authorization negative. It does not reach the credential half of the proposition: the owner-brokered HTTPS/SSH paths, operation-scoped credential leases and the refusal to copy a raw askpass architecture are not discussed, because no credential flow was in this arm's leads.

### F052 — Git HEAD and index health are separate

J0026 proves the structural half from gitrepository-layout: HEAD (298-312) and index (346-348) carry no $GIT_COMMON_DIR redirection clause and are therefore workspace-sensitive, split indexes use sharedindex.<SHA-1> 'only valid in split index mode', and refs/bisect, refs/rewritten, refs/worktree and logs/HEAD stay per-worktree. J0020 adds that a client's Git HEAD is realigned locally by git checkout -B rather than transported. What is not asserted is the finding's actual point: that colocated Git HEAD, index entries and index recovery state must be qualified separately from JJ status.

### F087 — Read preview and dry-run side effects

J0024 gets close - 'a no-edit save can change the tree jj snapshots ... users would see spurious diffs' - which is a read-shaped action with real effects. But the proposition is about preview, dry-run and immutable-override retry being labelled read-only by a client; none of those three is examined.

### F089 — Partial clone and LFS/submodule eligibility

J0026 establishes the non-self-contained store set from primary sources - shallow clones and alternates including $GIT_ALTERNATE_OBJECT_DIRECTORIES (gitrepository-layout 226-234), jj v0.44.0's shallow_root_ids cached from gix shallow_commits() with shallow commits treated as parentless and a TODO on unshallow consistency (git_backend.rs:371-380) - and states 'Shallow/partial data is therefore a supported adapter state that a closure drill must detect, not a hypothetical'. That is the shallow half. Partial/promisor, LFS and nested/submodule qualification, and the never-silently-hydrate clause, are not stated.

### F094 — Operation metadata is not idempotency

J0028 asserts that a durable command instance is required per mutation and that Dojjo's GitPushed phase marker 'carries no server-side evidence and resume replays on assumed push idempotence'. That is a progress marker, not the finding's subject: native operation descriptions and rewritten operation IDs being treated as a substitute for durable command-instance identity. Credited as F085, which is what the arm actually proves.

### F107 — Graph page consistency and adjacency bounds

THE ARM HAD THE EVIDENCE AND NEVER ROUTED IT. J0026's three confirmed GG defects are the external form of three of F107's four clauses - emitted counts versus page bounds (visual rows counted against the boundary), usable continuation on a page claiming more data (continuation bound only to the revset string; the resume skip silently drops commits), and unambiguous node identity (change-id offset plus commit prefix plus a working-copy exception). But J0026 was a reconcile job under an external-only assignment, and no compare job in this arm took a graph lead, so the defect was never stated against the SourceGraph contract. F061 and F092 capture what the arm did deliver.

## Coverage against the other arms

| | Premium (78) | Hybrid (90) |
|---|---:|---:|
| Shared with glm53 | 36 | 29 |
| glm53 has, that arm lacks | 1 | 8 |
| That arm has, glm53 lacks | 42 | 61 |

Unique to glm53 against premium ∪ hybrid: **none**. 36 of its 37 credits are in premium; F073 is
its one hybrid-only credit.

### The structural result: claude-hicap is no longer the review-arm ceiling

After four arms the picture was a clean chain — `claude` (18) and `deepseek41` (33) both proper
subsets of `muse13` (40), `muse13` a proper subset of `claude-hicap` (46) — and the four-arm review
union was exactly claude-hicap's own 46, so no arm had contributed anything claude-hicap missed.
**glm53 ends that.** It holds **four findings no other review arm reached** — F068 (description
drafts survive refresh), F069 (immutable content caches and async selection), F085 (capture
generation differs from upload resume), F086 (clone completion and cleanup) — and is therefore not a
subset of claude-hicap.

- Five-arm **review** union: 46 → **50 (45.45%)**
- Six-arm union including the full `union` arm: **59 (53.64%)**

The revised reading: the review arms differ in depth **and, at the margin, in kind**.

## Out-of-union candidates

Recorded with evidence; **none is added to the union.** Continuation 3's rejected expansions, checked
against each: the marker-only conflict command; a mutating `status.refresh` branch as a required
correction; generic in-operation credential prompting; and the refinement cluster under
F082/F086/F056.

### C4G-01 — "Object verification" has no defined depth, and a connectivity-only verifier would pass a corrupt-blob closure

**Where** `glm53/J0028-compare`, J0028-compare, L-4f94a6cc2232 concrete repair.

**My classification: correction.**

**The assertion.** JJI-008's restore acceptance says the drill must 'restore the selected historical operation with object verification', and the consumer acceptance rows repeat the phrase, but no Plan, schema or fixture defines what object verification must detect; a plan-search for fsck and connectivity returns no matches. The proposed replacement: 'full object-store integrity verification - commits, trees, and blob contents are read and checked (Git fsck default-class semantics); a connectivity-only check cannot satisfy this, and agreement of refs, bookmarks, or operation-log text alone cannot pass verification', plus a named negative family 'restore-time integrity with torn/missing objects under matching refs', mirrored into the consumer acceptance rows. Acceptance checks: a torn-pack negative, a byte-flipped-blob negative (named 'the discriminating test' because a connectivity-only verifier passes it), an intact positive, and all three across colocated, non-colocated and shared/multi-workspace fixtures. Bounded by running it once on the disposable restored copy before activation, never on the original and never while holding the capture barrier.

**Passages cited.**
  - Plans/Jujutsu_Integration.md:468 (JJI-008 acceptance, 'with object verification'), :482 (validation surfaces), :470 (distinct blocking receipt refs), :501 (no verification on the original)
  - Plans/forge_backup_tsnet_acceptance.json:1158 and :4841 (consumer acceptance rows repeating the phrase), :2334 (the three layout fixtures), :3087 ('GC coordinated; missing objects explicitly partial, not complete')
  - Plans/Source_Control_System.md:793; Plans/Backup_Restore_System.md:982
  - git-fsck(1) fetched 2026-09-17: --connectivity-only 'check[s] only the connectivity of reachable objects ... avoiding reading blobs entirely ... Corruption in blob objects will not be detected at all'
  - keanemind/dojjo @ a0ad17ba client/src/git_sync.rs and client/src/sync.rs: refs agreeing via ls-remote while the local object store is torn, caught only by full git fsck and healed by git fetch --refetch after deleting objects/, refs/ and packed-refs

**Did continuation 3 already reject it?** NO. Continuation 3's rejected expansions were the marker-only conflict command, a mutating status.refresh branch as a required correction, generic in-operation credential prompting, and the refinement cluster under F082/F086/F056. None is this. It is worth noting that continuation 3's own F106 is a correction in exactly this area - the restore-readiness contract admitting ready_for_owner_activation under blocked conditions - so this candidate is a second, independent defect in the same JJI-008 restore-verification family, found from a different direction (an undefined term rather than an unconstrained field).

**Why it is distinct from what is credited.** F081 is credited to this arm and requires verifying destination bytes, complete native object interpretation and an isolated historical-operation restore before activation. This candidate is narrower and sharper: it says the existing Plans phrase that carries that obligation is undefined, that the cheapest reading of it (connectivity) is the one a implementer would pick, and that a single byte-flipped blob is the test that separates the two readings. It is a concrete repair to existing text with a discriminating fixture, which is the shape of F106-F109 rather than of F081.

*Not added to the union. The strongest candidate produced by any continuation-4 review arm, and the only one I would put in front of the Plans owners on its own.*

### C4G-02 — A typed per-file save vocabulary, or an explicit decision to keep JJ conflict resolution terminal-native

**Where** `glm53/J0022-compare`, J0022-compare proposal.

**My classification: product choice.**

**The assertion.** The corpus owns every governing principle the diffedit3 bug class violates, but the surface where the class lives - an interactive JJ conflict/merge-editor save pipeline - has no owner, command or schema: the 31-command JJ inventory contains no conflict-editing command and JJI-008 pins it unchanged, the only merge-editor command rows are Git adapter commands, and no schema models a per-file editor save state. The proposal is a typed per-file save entry referencing the FileSafe manifest vocabulary rather than duplicating it - 'text | deleted | missing | binary | unsupported{reason} | symlink{target} | mode_change{from,to}' plus backend conflict_id and expected snapshot/operation identity per file, where 'saving deleted performs deletion; missing is a scan fact, never a write instruction - the empty-vs-deleted conflation is structurally impossible' - with save validation bound to session/repository/snapshot identity, bounded preflight reads, stage-then-commit or journaled rollback, byte-identical unchanged files and a FileSafe safe point before mutation. The alternative the arm states with equal weight is an explicit owner decision to keep conflict resolution terminal-native and say so, or an upstream-first path that fixes diffedit3 and leaves the corpus untouched.

**Passages cited.**
  - Plans/Jujutsu_Integration.md:255-287 (the closed 31-command inventory), :472 (JJI-008 'The exact 31-command JJ inventory is unchanged'), JJI-005:180-210 including :191, :199 and :208, JJI-002:80-103, JJI-003:105-143 and section 3.3:299-303, section 4.1:309, section 6:327
  - Plans/FileSafe.md:1494, :1497, :1500, :1490, :14223 (typed path entries and fail-closed preflight)
  - Plans/FileManager.md:349 (preserve line endings on save), :252, :263, :351-352, :359, :530
  - Plans/Backup_Restore_System.md:1049, :223; Plans/forge_backup_tsnet_acceptance.json:1576 (stage-and-verify, atomically activate or an explicit journaled rollback)
  - Plans/Source_Control_System.md:295 (Git conflict commands stay Git adapter commands); Plans/UI_Command_Catalog.md:549-551, :559; Plans/storage-plan.md:1928
  - Plans/jujutsu_integration_contracts.schema.json:138, :164 (conflict_state_unresolved as a coarse workspace-level code); Plans/runtime_artifact_code_diff.schema.json:153-161
  - ilyagr/diffedit3 @ 0ae89095: types.rs:5-19 and :80-105, merge_state.ts:37-44, :40, :239-242, :419-432, main.ts:75/90, fs.rs:24-52, :99-133, :378-421, local_server.rs:18, :74-105

**Did continuation 3 already reject it?** PARTIALLY, and I am flagging it. Continuation 3 rejected 'Conflict command with marker-only resolution' and rejected the cluster 'Corruption taxonomy, extras detector, clone stage details and arbitrary conflict editor' as 'Refinements/alternatives under existing F082/F086/F056 and their scope boundaries, not additional demonstrated product obligations.' This proposal is explicitly NOT marker-only - it keeps typed backend conflict state and says so - but it is a conflict-editor surface, which is the rejected cluster's subject. The genuinely new part is the typed save-entry vocabulary and the structural argument that missing must never be a write instruction; the surface itself I would expect to be declined on continuation 3's reasoning.

**Why it is distinct from what is credited.** F029, F030, F031, F033, F034, F035, F036, F037, F053 and F056 are all credited to this arm and are the individual obligations. This candidate is the single contract that would make them decidable at one boundary, plus the owner-adjudication question about the closed inventory. In kind it is the same move claude-hicap made from the schema side (its Defect 5) and the union arm made for graph gestures (C4U-03): the frozen shape cannot express the operands, so the gestures are different operations rather than a different picture.

*Not added to the union, and flagged as probably inside continuation 3's rejected conflict-editor class.*

### C4G-03 — merge_editor_available is referenced as a command condition and defined by no owner

**Where** `glm53/J0024-compare`, J0024-compare, recorded as a note.

**My classification: correction.**

**The assertion.** cmd.source_control.open_merge_editor carries the condition 'conflict_file_selected && merge_editor_available', but merge_editor_available is a single occurrence in the whole corpus and no owner defines it - it is an in-product structured-editor availability flag with no contract behind it. If an external-tool proposal is ever approved, the Git-side 'open external merge tool preference' plus this flag would need explicit backend and tool scoping. The arm records it as a note rather than a repair on the stated ground that 'the Plans make no false claim today'.

**Passages cited.**
  - Plans/UI_Command_Catalog.md:549 (the condition), with plan-search establishing the single occurrence
  - Plans/Source_Control_System.md:451 (conflict assistant settings including the open-external-merge-tool preference), W-036 at :2815-2871
  - Plans/storage-plan.md:1927-1928 and :12605-12612 (the preference is persisted; these commands 'record resolution events and blocked-state handoff outcomes, not conflict content')

**Did continuation 3 already reject it?** NO. It is not among continuation 3's four rejected expansions, and no union finding covers an undefined command-condition flag. It is closest in kind to F073 (nominal capability flags are not production evidence), which is credited to this arm, but F073 is about not counting such a flag as evidence, whereas this names a specific flag that gates a shipped command row and has no definition.

**Why it is distinct from what is credited.** Small and cheap to check, and the arm's own restraint in classifying it is correct: an undefined condition is not yet a false claim. Recorded because it is the kind of defect that becomes load-bearing exactly when the surface it gates is built.

*Not added to the union.*

## Observations

**glm53 breaks the four-arm result: claude-hicap is no longer the review-arm ceiling.** After four arms the structure was a clean chain - claude (18) and deepseek41 (33) both proper subsets of muse13 (40), muse13 a proper subset of claude-hicap (46) - and the four-arm review union was exactly claude-hicap's own 46, so no arm had contributed anything claude-hicap missed. glm53 ends that. It holds four findings no other review arm reached (F068 drafts survive refresh, F069 immutable content caches, F085 capture generation differs from upload resume, F086 clone completion and cleanup) and is therefore NOT a subset of claude-hicap. The five-arm review union rises from 46 (41.82%) to 50 (45.45%), and the six-arm union to 59 (53.64%). The revised reading: the review arms differ in depth AND, at the margin, in kind.

**The UNIX_EPOCH garbage-collection fact now has five distinct outcomes across six arms.** One code fact - jj's op_store().gc(head, SystemTime::UNIX_EPOCH) as called by Dojjo's sync server - separated the arms cleanly. (1) Arm C asserted that it prunes everything unreachable, which is wrong: lib/src/simple_op_store.rs:285-357's remove_file_if_not_new KEEPS a file when mtime > keep_newer, so with keep_newer = UNIX_EPOCH nothing is removed. (2) claude-hicap repeated the same error while quoting the correct predicate. (3) deepseek41 read simple_op_store.rs and got it right; it is the arm that caught Arm C. (4) muse13 recorded the call without characterising the retention direction it had not verified. (5) glm53 did BOTH, in different jobs, and the difference is instructive: J0020 preserved the correct framing it inherited ('op-store GC with UNIX_EPOCH, no aggressive retention cutoff'), while J0023 inferred the wrong direction - 'prunes op-store data unreachable from the single resolved op head with zero time grace' - and then quarantined its own inference in the same document: 'Exact op_store::gc reachability/grace semantics are inferred from the call shape ([op_id], UNIX_EPOCH) and code comments, not verified against pinned jj source. Flagged uncertain; verify against jj simple_op_store before reusing the claim.' It named the exact file deepseek41 read and I verified. An error correctly labelled as an unverified inference, with the verification step written down, is not the same failure as an error asserted as fact.

**The retry policy recovered every lead the response ceiling truncated.** Seven of twelve jobs hit the 40-response ceiling, but three of the twelve admissions were second attempts of truncated logical jobs (J0019 -> J0020, J0018 -> J0021, J0025 -> J0028), and every one of those retries delivered where the first attempt had not. J0018 and J0019 and J0025 wrote nothing; J0021, J0020 and J0028 between them carry 12 of the 37 credits, including the whole Dojjo family and the jj-resolve partial-resolution lead. No lead was lost to truncation. The cost is that the 12-admission budget bought only nine distinct logical jobs.

**The arm had F107's evidence and never routed it.** J0026 confirmed three real defects in GG's paged graph - a swallowed mid-query revset error delivered as end-of-history, visual rows counted against the page boundary, and a resume skip that silently drops one commit per previously counted visual row - plus the finding that page continuation is bound only to the revset string with no operation, snapshot or config identity retained. Those are the external form of three of F107's four clauses. But J0026 was a reconcile job under an external-only assignment and no compare job in this arm took a graph lead, so the defect was never stated against the SourceGraph contract. This is the same shape as the union arm's diffedit3 miss: the finding was in hand and the pipeline never carried it to the surface where it would have counted.

**The manifest raced the monitor's final write; one file of 5,758 differs and it is not an arm output.** The runner's quoted internal digest e2d003ea... verifies exactly against the manifest's 5,758 sorted rows. An independent re-hash of the tree gives 7b1385c3... instead, and the whole difference is one file: monitor-state.json, 592 bytes in the manifest and 769 bytes now. The manifest was frozen at 2026-09-17T01:02:04Z and the scheduler's monitor wrote its final heartbeat at 01:02:08Z, four seconds later, adding the terminal block. Every other file is byte-identical, including every assertion document, every job record, run.json, timing.json, progress.json, priced-usage-final.json and campaign-terminal.json - so the designed-stop evidence rests on frozen bytes. The other three arms I checked (muse13, union, claude-hicap) froze after their monitor's last write and show no difference. Worth fixing in the freeze procedure: quiesce the monitor before hashing.

## Limits

- One frozen case; a same-input review replacement. Recall is bounded by the premium arm's research artifacts.
- Recall is against the adjudicated continuation-3 union, not an external exhaustive truth set.
- 'Unsupported or already-covered' is a union class, not a false-positive rate.
- 7 of 12 jobs were request-limited; request-limited coverage and the reached-delivery fraction are reported separately. Unperformed work remains unknown, never a negative finding.
- Cost is a captured upper valuation at the preserved tariff basis, not a cash invoice.
- One file of the frozen tree (monitor-state.json, the scheduler's heartbeat) was rewritten four seconds after the freeze. No arm output is affected; it is reported rather than passed over.

## Files

| File | Contents |
|---|---|
| `glm53-findings.json` | 37 credited rows with class, stage, credited job, basis and evidence hashes; 10 partials |
| `glm53-candidates.json` | 3 out-of-union candidates and 5 observations, with rejection checks |
| `glm53-scoring.json` | Run verification, job table, retry structure, recall, request-limited and reached-delivery figures |
| `PROGRESS.md` | Stage-by-stage progress note |
| `../glm53-manifest.json` | Hash manifest for this directory |
