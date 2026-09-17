# Continuation 5 adjudication — Arm P (prioritized depth)

**I am an Opus 5 agent** (`claude-opus-5[1m]`) acting as adjudicator. I ran no arm. Every figure was
rebuilt from the run's durable state, and — under continuation 5's standing addition — **every
code-fact assertion was verified against the pinned source before credit**.

A cheap prioritization pass (`muse-code/muse-spark-1.3-contributor`, xhigh) ranked all 88 frozen
leads; `claude-opus-5` at effort **max** then worked down that ranking over **the same premium
artifacts and starting state as `claude-hicap`**. The variable under test is admission **order**.

## Headline: prioritization lost

| | claude-hicap (baseline) | **Arm P** |
|---|---:|---:|
| Credited / 110 | **45 (40.91%)** | **32 (29.09%)** |
| corrections / capabilities / product / unsupported | 2 / 4 / 3 / 36 | 0 / 2 / 1 / 29 |
| Leads reaching a comparison | 14 of 88 | **16 of 88** |
| Captured cost | $82.52 | $85.50 |
| Cost per credited finding | $1.834 | **$2.672** |
| Arm wall | 3,535 s | 4,193 s |

**Arm P compared two more leads, spent more, took 18.6% longer, and returned 13 fewer findings.**

It **gained 6**: F005 (Expected operation is not native compare-and-swap), F019 (Stale workspace recovery), F052 (Git HEAD and index health are separate), F054 (Effective config and template parsing), F057 (Exact-profile conflict byte regression), F064 (Hidden graph regression qualification).

It **lost 19**, and they are not scattered — they are two coherent families the ranking pushed below
rank 16:

- **external editor and diff**: F028, F029, F031, F032, F034, F036, F037, F053, F087
- **graph, history and process**: F043, F059, F062, F066, F074, F083, F088, F092, F106, F107

Muse Spark's top 16 are almost entirely backup closure, GC fencing, store integrity, colocation
certification and identity — nine of its top ten reasons name operation recovery, GC, closure,
colocation or config. **The prioritizer optimised for one theme and got depth in it.**

## The ranking did not predict yield

| Rank band | Compare job | Leads | Credits | Per lead |
|---|---|---:|---:|---:|
| 1-3 | `J0022-compare` | 3 | **7** | 2.33 |
| 4-6 | `J0021-compare` | 3 | **6** | 2.00 |
| 7 | `J0020-compare` | 1 | **2** | 2.00 |
| 8-10 | `J0026-compare` | 3 | **5** | 1.67 |
| 11-13 | `J0027-compare` | 3 | **7** | 2.33 |
| 14-16 | `J0028-compare` | 3 | **5** | 1.67 |

**The yield is flat.** Ranks 11–13 produced as many credits as ranks 1–3. If the ordering carried
information about union yield, credits would decline with rank; they do not. So recall here is
governed by **which families** the admitted leads belong to, not by their order — which is exactly
why comparing two more leads still lost 13 findings.

*Caveat, stated plainly:* this measures yield against the 110-finding union only. The top-ranked
leads did produce this arm's deepest contract repairs and two findings no other arm reached. A
prioritizer optimising for something the union does not contain is penalised here by construction.

## Verification

Both manifests verify **three ways** — internal digest recomputed from the sorted rows, matched
against the runner's quoted value, and an independent re-hash of the whole tree — with **zero
differing files**:

| Tree | Internal `manifest_sha256` | Files |
|---|---|---:|
| depth run | `bb21eaef631ad7c4bd6edee9f24860314ccffda32ee008a996e7816e09dd7cd2` | 7,404 |
| prioritization job | `9ef19ee20e5d2cb62295fec0250172d06389c408798c9d15d7d5e08cbc573126` | 115 |

The runner quiesced the monitor and the allowance heartbeat before freezing — the fix for the race I
reported on glm53 in continuation 4. Same frozen case as every review arm
(`input_manifest_sha256 11a497945f…`). Designed stop confirmed before scoring:
`Stop: admitted_attempt_cap` in both `campaign-terminal.json` and `monitor-state.json`.

**Every runner figure I checked was already correct** — the second arm in the campaign for which
that is true. I confirmed the 16-leads-at-ranks-1-to-16 claim by mapping every compare job's
`lead_ids` through `arm-p-admission-order.json`: exactly ranks 1–16, no gaps.

### Code-fact verification — 23 checked, 23 upheld, **zero errors**

| Where | Facts | Result |
|---|---:|---|
| `lib/src/stacked_table.rs` @ **tag v0.44.0** (the arm's own fetch receipt, sha `713fed9e…`) | 7 | all upheld |
| `lib/src/git.rs` @ **tag v0.44.0** (sha `eace5106…`) | 2 | all upheld |
| Frozen Plans schema @ `bc7569b3f5` | 1 | upheld **byte-exactly** |
| The arm's pinned cache @ `e6dd2c0d…` | 13 | all upheld |

**This is the only arm in the campaign with a clean verification record.** In continuation 4 both
Claude arms asserted the inverse of jj's `UNIX_EPOCH` garbage-collection predicate and glm53
asserted it in one job while quarantining it in another. The distinguishing habit here is
**re-fetching the raw file at the certified tag and comparing code**, rather than inferring a
defect's presence from release dates — which is how this arm proved the #9648 extras fix and the
#9711/#9712 cache-tree fix are *absent* from the frozen profile.

Three assertions the arm marks as **its own discovery** rather than inherited — the special-file
silent omission category, the submodule-contents category, and `TableStore::gc`'s doc comment
holding at v0.44.0 — are all correct.

## Job table

| Job | Stage | Ranks | Status | Elapsed s | Responses | notes.md | Leads | Credits |
|---|---|---|---|---:|---:|---:|---:|---:|
| `J0017-reconcile` | reconcile | [1, 2, 3] | completed | 1092 | 74 | 42,727 | 4 | 0 |
| `J0018-reconcile` | reconcile | [4, 5, 6] | completed | 924 | 51 | 46,122 | 5 | 0 |
| `J0019-reconcile` | reconcile | [7] | completed | 654 | 43 | 23,518 | 5 | 0 |
| `J0020-compare` | compare | [7] | completed | 841 | 52 | 44,267 | 0 | 2 |
| `J0021-compare` | compare | [4, 5, 6] | completed | 954 | 61 | 78,324 | 5 | 6 |
| `J0022-compare` | compare | [1, 2, 3] | completed | 1008 | 64 | 56,903 | 2 | 7 |
| `J0023-reconcile` | reconcile | [8, 9, 10] | completed | 1018 | 70 | 42,288 | 4 | 0 |
| `J0024-reconcile` | reconcile | [11, 12, 13] | completed | 883 | 62 | 25,807 | 1 | 0 |
| `J0025-reconcile` | reconcile | [14, 15, 16] | completed | 1227 | 65 | 39,436 | 6 | 0 |
| `J0026-compare` | compare | [8, 9, 10] | completed | 1078 | 89 | 52,686 | 3 | 5 |
| `J0027-compare` | compare | [11, 12, 13] | completed | 982 | 82 | 49,638 | 3 | 7 |
| `J0028-compare` | compare | [14, 15, 16] | cli_error | 841 | 76 | 58,935 | 3 | 5 |

`J0001`–`J0016` are byte copies of the premium arm's frozen artifacts, not this arm's output; **no
credit cites them**.

## Request-limited coverage — none

**No job was request-limited, time-limited or money-limited.** Responses ran 43–89 against a 160
ceiling; the longest job took 1,227 s of 3,600 s; the dearest cost $10.89 of $20; the arm spent
$85.50 of $150. All 12 jobs reconciled with receipts equal to requests and zero gaps. The binding
limit was the 12-admission cap, exactly as for claude-hicap.

## The one limit-cut job, reported separately

`J0028-compare` was cut by the **account's shared five-hour window**, not by an arm limit — the typed
`rate_limit_event` at 05:48:52Z records `rejected` / `out_of_credits`, resetting 08:30Z, with two
other Claude Code threads on the account.

**Its output is complete and fully scoreable.** 76 receipts reconciled against 76 requests,
accounting complete with zero gaps, a 58,935-byte `notes.md` that I read to its end — it terminates
on a finished "Explicit limits of this report" section, not mid-sentence — and all three leads
delivered plus three lead documents.

**It carries 5 of the 32 credits**, including F064, one of the two findings this arm adds over all
six continuation-4 arms. Ten minutes earlier and the arm would have lost half its novel
contribution.

## Recall: 32 / 110 (29.09%)

corrections **0/5** · optional capability **2/36** · product choice **1/6** · unsupported or
already-covered **29/63**. Five partials: F001, F029, F071, F087, F107.

**Every credit is earned in a compare job.** The six reconcile jobs verify leads against primary
sources and correct the inherited prose; the compare jobs state the propositions against the Plans.
That means recall is a function of how many leads reached **compare**, not reconcile.

| ID | Title | Class | Job | Ranks |
|---|---|---|---|---|
| F002 | Nominal reads may write | unsupported or rejected | `J0021-compare` | [4, 5, 6] |
| F004 | Writer authority is stronger than native locks | unsupported or rejected | `J0021-compare` | [4, 5, 6] |
| F005 | Expected operation is not native compare-and-swap | unsupported or rejected | `J0021-compare` | [4, 5, 6] |
| F006 | Exact durable identity and operation-local selectors | unsupported or rejected | `J0022-compare` | [1, 2, 3] |
| F007 | Process failure and cancellation are not no-effect proof | unsupported or rejected | `J0027-compare` | [11, 12, 13] |
| F008 | Partial multi-file resolve | unsupported or rejected | `J0027-compare` | [11, 12, 13] |
| F010 | Native versus sidecar crash boundary | unsupported or rejected | `J0028-compare` | [14, 15, 16] |
| F011 | Native recovery has explicit scope | unsupported or rejected | `J0021-compare` | [4, 5, 6] |
| F019 | Stale workspace recovery | unsupported or rejected | `J0021-compare` | [4, 5, 6] |
| F030 | Empty, absent and failed reads are distinct | unsupported or rejected | `J0028-compare` | [14, 15, 16] |
| F033 | External editor path confinement | unsupported or rejected | `J0027-compare` | [11, 12, 13] |
| F035 | External diff and merge tool handoff | optional capability | `J0027-compare` | [11, 12, 13] |
| F044 | Adapter implementation shape | product choice | `J0021-compare` | [4, 5, 6] |
| F050 | Included tools and exact qualification | unsupported or rejected | `J0022-compare` | [1, 2, 3] |
| F051 | Colocated import/export stays fail-closed | unsupported or rejected | `J0022-compare` | [1, 2, 3] |
| F052 | Git HEAD and index health are separate | unsupported or rejected | `J0022-compare` | [1, 2, 3] |
| F054 | Effective config and template parsing | unsupported or rejected | `J0020-compare` | [7] |
| F056 | Native conflict truth and supported shape | unsupported or rejected | `J0027-compare` | [11, 12, 13] |
| F057 | Exact-profile conflict byte regression | unsupported or rejected | `J0027-compare` | [11, 12, 13] |
| F061 | Graph bounds, continuity and isolation | unsupported or rejected | `J0028-compare` | [14, 15, 16] |
| F064 | Hidden graph regression qualification | unsupported or rejected | `J0028-compare` | [14, 15, 16] |
| F072 | One catalog and authoritative eligibility | unsupported or rejected | `J0027-compare` | [11, 12, 13] |
| F073 | Runtime evidence versus unused scaffolding | unsupported or rejected | `J0026-compare` | [8, 9, 10] |
| F079 | Complete retained native backup closure | unsupported or rejected | `J0022-compare` | [1, 2, 3] |
| F080 | Snapshot omission and skipped checkout | unsupported or rejected | `J0026-compare` | [8, 9, 10] |
| F081 | Backup existence is not verified recovery | unsupported or rejected | `J0026-compare` | [8, 9, 10] |
| F082 | Extras head integrity and crash corruption | unsupported or rejected | `J0022-compare` | [1, 2, 3] |
| F084 | Sanitized inactive restore configuration | unsupported or rejected | `J0020-compare` | [7] |
| F089 | Partial clone and LFS/submodule eligibility | unsupported or rejected | `J0026-compare` | [8, 9, 10] |
| F090 | Authorized incomplete-object materialization | optional capability | `J0026-compare` | [8, 9, 10] |
| F094 | Operation metadata is not idempotency | unsupported or rejected | `J0028-compare` | [14, 15, 16] |
| F102 | Upstream narrative inconsistencies | unsupported or rejected | `J0022-compare` | [1, 2, 3] |

## Against the wider campaign

Arm P adds **2** findings over all six continuation-4 arms combined: **F054** (effective config and
template parsing) and **F064** (hidden graph regression qualification) — neither reached by any
earlier arm. The seven-arm union rises from **57** to **59 of 110 (53.64%)**, and findings reached
by no arm fall from 53 to **51**.

Nothing it credited falls outside premium ∪ hybrid — which is the whole union by construction, so
the substantive statement is that it delivered no proposition creditable as a finding the union does
not already contain.

## Out-of-union candidates

Six, recorded with evidence and checked against continuation 3's four rejected expansions. **None is
added to the union.** **Four of the six fall inside standing rejections** — which is itself a
result: the prioritizer steered the most expensive reviewer in the campaign onto ground continuation
3 had already adjudicated closed.

### C5P-01 — The JJ closure record can record `complete` with no fence outcome at all, while the neutral record cannot

**Where** `p-depth/J0022-compare`, R-46-1. **My classification: correction.**

**The assertion.** Two frozen owner artifacts describe the same capture and disagree. `backup_source_closure_record` is falsifiable: it requires `capture_barrier_ref`, `barrier_outcome`, `gc_prune_rewrite_fence_ref` and `gc_fence_outcome` on the closed enum `held_during_capture | not_acquired | lost_during_capture`, and `capture_completeness == complete` implies both outcomes are `held_during_capture`. `backup_jj_closure_record` is not: it requires the two refs as bare `non_secret_ref` strings, has NO `gc_fence_outcome` and no `barrier_outcome`, and gates `complete` only on `missing_dependency_refs` and `captured_files_relation`. So a JJ closure record with `closure_state: complete` and a `gc_fence_ref` string validates today even if the fence was never acquired or was lost. The repair copies the neutral record's existing shape into the JJ record, inventing no vocabulary.

**Passages cited.**
  - Plans/source_control_contracts.schema.json:2865-2953 and :3030-3115 (the falsifiable neutral record)
  - Plans/jujutsu_integration_contracts.schema.json:2127-2374 (the JJ record, and its assertion list at :2371)
  - Plans/jujutsu_integration_contract_fixtures.json:2830-2833 - the shipped fixture pairs "gc_fence_ref": "gc-fence:jj:alpha:41" with "closure_state": "complete"
  - Plans/Source_Control_System.md SCS-014:775-800 - "Complete source closure rejects a lost barrier/fence"
  - Plans/forge_backup_tsnet_acceptance.json:1157 and E2E-037 at :3080-3099, execution_status NOT_RUN

**Did continuation 3 already reject it?** NO. None of the four rejected expansions covers an internal inconsistency between the neutral and JJ closure records. This is the same SHAPE as continuation 3's own F106 - an underdetermined field inside an already-present typed record, found by reading the conditionals rather than the prose - and F106 was accepted as a correction. I regard this as the strongest candidate this arm produced.

**Distinctness.** F079 is credited to this arm and requires the barrier and GC fence to exist. This candidate is narrower: the JJ-owned record cannot express whether the fence held, so the requirement is unenforceable on the JJ side while being enforceable on the neutral side for the same capture. R-46-2 adds the discriminator that makes `held_during_capture` an observation rather than a declaration - op-head set, keep-ref digest, extras segment count and the prune window, before and after.

*Not added to the union. The one candidate here I would put in front of the Plans owners on its own.*

### C5P-02 — A new writer-bearing `snapshot_capable_read` command class for the seven read commands

**Where** `p-depth/J0021-compare`, R1.2. **My classification: correction.**

**The assertion.** Introduce a third `command_class` value `snapshot_capable_read`, move the seven read commands into it, keep `credential_lease_ref`, `confirmation` and `interop_gate` null, and STOP FORCING `writer_lease_ref` TO NULL. Add a required `snapshot_suppression` object where `mode == "permitted"` requires a non-null `writer_lease_ref`, and add `incidental_operation_ids` to the result for operations the command caused but did not intend.

**Passages cited.**
  - Plans/jujutsu_integration_contracts.schema.json command_request allOf[2] (quoted verbatim by the arm; I verified it byte-exactly against bc7569b3f5)
  - Plans/Jujutsu_Integration.md:301 - "Reads and navigation carry no writer, credential, FileSafe, confirmation, or interop authority"
  - jj docs/working-copy.md and lib/src/op_store.rs:414-427 (OperationMetadata.is_snapshot), both verified

**Did continuation 3 already reject it?** YES, SQUARELY, AND I AM FLAGGING IT. Continuation 3 rejected 'Add mutating status.refresh branch as a required correction' with the reason 'F002 already fixes read effects and denial; A NEW WRITER-BEARING BRANCH WOULD CHANGE THAT AUTHORITY.' R1.2 is that proposal: a new command class whose permitted mode requires a writer lease on commands the owner defines as carrying none. The continuation-4 union arm (C4U-01) and claude-hicap (C4H-02) both independently landed on the OPPOSITE side of this boundary - keep reads non-authoring by proving a non-mutating observation path - and the union arm said in its own words that 'blanket addition of writer leases to all reads would change the existing contract unnecessarily'.

**Distinctness.** F002 is credited to this arm on the strength of the finding itself, which is excellent and correct. What is rejected is this particular REMEDY. Worth recording precisely: this arm contains BOTH positions. J0028 A1 - a different job on a different lead - proposes the remedy continuation 3 would accept: every read-class dispatch executes in a non-mutating mode, and 'if a snapshotting refresh is wanted, it must be RECLASSIFIED' into the existing mutation class rather than given a new lease-bearing read branch. A1's remedy is compatible with the rejection; R1.2's is not.

*Not added to the union, and flagged as inside a standing rejection. The finding stands; the remedy is the part already declined.*

### C5P-03 — A three-state extras-store integrity discriminator and a new reason code

**Where** `p-depth/J0022-compare`, R-21-1 / R-21-2. **My classification: correction.**

**The assertion.** Before a JJ repository is reported eligible and before any capture, the adapter evaluates `store/extra/` and reports exactly one of `extras_markers_consistent`, `extras_fresh_store`, or `extras_markers_lost`, discriminated by whether `store/extra/heads` is empty while a segment file of exactly `SEGMENT_FILE_NAME_LENGTH` (128 hex characters) exists - the same filter `TableStore::gc` already applies, so it needs no `jj` invocation. `extras_markers_lost` blocks mutation and capture and forces `closure_state` off `complete`; a new closed reason code `jj_backend_store_markers_lost_integrity_unverified` is added to both vocabularies.

**Passages cited.**
  - jj lib/src/stacked_table.rs @ v0.44.0 - :52-53 the constant, :568-616 TableStore::gc's filter (both verified by me as V-P3 and V-P6)
  - Plans/Jujutsu_Integration.md JJI-006:219-234 and §7.1:339
  - Plans/jujutsu_integration_contracts.schema.json:120-175 (the closed 22/26-value vocabularies)

**Did continuation 3 already reject it?** YES, AND I AM FLAGGING IT. Continuation 3's fourth rejected expansion is 'Corruption taxonomy, EXTRAS DETECTOR, clone stage details and arbitrary conflict editor', declined as 'Refinements/alternatives under existing F082/F086/F056 and their scope boundaries'. An extras-store integrity detector is that item by name. Arm C's C4C-04 in continuation 4 was flagged on the same ground and I contested it there; this is a second, better-evidenced instance of the same declined item.

**Distinctness.** F082 is credited to this arm, and the underlying research - proving the defect is in the certified v0.44.0 profile by direct code comparison - is the best in the campaign. The discriminator is what makes it actionable, and it is also what continuation 3 declined to adopt. Recording both facts is the honest outcome.

*Not added to the union, and flagged as inside a standing rejection.*

### C5P-04 — Drill isolation becomes recorded evidence instead of a `const: true` self-assertion

**Where** `p-depth/J0026-compare`, R1 (with J0020 R1 and J0026 R4). **My classification: correction.**

**The assertion.** Replace `isolated_verification: {"const": true}` with a required `isolation_evidence` object carrying `original_repository_reachable: false`, `alternate_targets_reachable: false`, `network_egress_permitted: false` and `lazy_fetch_disabled: true`, plus the resolved path set actually checked. `object_closure_result = complete` and the outcomes `verified_read_only` / `ready_for_owner_activation` require all of them; any `true` admits only `partial` with a reason ref. J0020 R1 extends the same move to configuration: drill isolation must be environment-level, not repository-level, because the repo config lives outside the repository under 0.44.0.

**Passages cited.**
  - Plans/jujutsu_integration_contracts.schema.json:2558-2566 - isolated_verification const true, remote_write_performed const false
  - Plans/jujutsu_integration_contract_fixtures.json:3092-3098 - the only negative in the area is a write guard
  - Plans/forge_backup_tsnet_acceptance.json E2E-035/E2E-036, both execution_status NOT_RUN
  - git-scm.com/docs/partial-clone :274-283 - a promisor fetch is a READ, so it passes the const-false write guard

**Did continuation 3 already reject it?** NO. No rejected expansion covers drill-isolation evidence. It is adjacent to continuation 3's own F106 - both are defects in `backup_jj_restore_verification_receipt` found by reading its conditionals - but F106 is about readiness under blocked conditions and this is about isolation being unfalsifiable. F073 is credited to this arm for the general observation; this is the specific contract repair.

**Distinctness.** F081 is credited and requires an isolated restore before activation. This candidate is that requirement made falsifiable, and it names the specific hole the union does not: a drill that hydrates over the network is a READ, so it satisfies every existing guard while destroying the offline property the drill exists to prove.

*Not added to the union.*

### C5P-05 — The frozen Plans promise Jujutsu conflict behaviour with no owned command to carry it

**Where** `p-depth/J0027-compare`, F-A / F-B and the L-6ab2467deb87 repair. **My classification: product choice.**

**The assertion.** The Jujutsu owner's command inventory is exactly 31 closed IDs and none resolves a conflict, opens a merge editor or performs an interactive diff edit, while JJI-005, SCS-015 and SCS-017 all promise Jujutsu conflict behaviour. The only conflict surface in the corpus is Git-shaped: `cmd.source_control.open_conflict` is gated on `git_available`, so in a non-colocated Jujutsu repository the corpus's only conflict entrypoint is unreachable for the backend the Plans promise conflict support for; `mark_conflict_resolved` is gated on `no_conflict_markers`, which cannot see jj's default diff-style markers; and `ours|theirs|both` cannot express a conflict with more than two sides. Either the inventory gains a Jujutsu conflict route, or the owner records an explicit decision that Jujutsu conflict resolution stays terminal-native.

**Passages cited.**
  - Plans/Jujutsu_Integration.md:255-287 (the 31 IDs) and :301; schema :110-118 closing the enum
  - Plans/UI_Command_Catalog.md:548-551 and :559; Plans/Source_Control_System.md:295 and :37
  - Plans/Jujutsu_Integration.md JJI-005:191 and :199; Plans/Source_Control_System.md:855-857 and :959
  - jj lib/src/config/misc.toml:46, docs/conflicts.md:93-97 and :109-113, cli/src/merge_tools/mod.rs:105 and :350-356 (all verified by me as V-P19 to V-P21)

**Did continuation 3 already reject it?** PARTIALLY, and I am flagging it. Continuation 3 rejected 'Marker-only conflict command is a JJ owner defect' because 'Frozen Source Control line 308 scopes legacy commands to Git absent explicit normalization', and rejected 'arbitrary conflict editor' in the F056 cluster. This arm's finding is stronger than the rejected one - it is not that the marker-only command is a JJ defect, but that the marker test CANNOT WORK against jj's default marker style, which is a verified code fact rather than a scoping argument. Still, the remedy is a conflict route, which is the declined surface. Three continuation-4 arms (C4D-04, C4M-03, C4G-02) were flagged in the same cluster.

**Distinctness.** F056 is credited to this arm on the truth-and-supported-shape proposition. What is outside the union is the routing consequence: a promise with no command to carry it, and an entrypoint gated on `git_available` that a non-colocated JJ repository can never satisfy.

*Not added to the union, and flagged as inside the declined conflict-surface cluster.*

### C5P-06 — A supervised repository-health and store-recovery route, and four reason classes the closed vocabularies cannot express

**Where** `p-depth/J0028-compare`, B1 / B3. **My classification: capability.**

**The assertion.** The closed `disabled_reason_code` (22 values) and `error_code` (25 values) contain none of: an unsupported repository layout reason (filtered/partial clone, promisor remote, shallow clone), a missing-object-closure reason, a damaged or truncated store reason, or a repository-maintenance-failed reason - so all four collapse into `adapter_failed`, `transport_unavailable` or `repository_quarantined`. B3 proposes a supervised repository-health and store-recovery route as a separate approved capability rather than folding repair into the adapter.

**Passages cited.**
  - Plans/jujutsu_integration_contracts.schema.json:120-144 and :146-174 (the two closed vocabularies, enumerated in full by the arm)
  - Plans/Jujutsu_Integration.md JJI-006:222-225 and :233, §7.1:339
  - Plans/Source_Control_System.md SCS-015:846-849 - "unknown is never flattened to unsupported"

**Did continuation 3 already reject it?** PARTIALLY. The 'damaged/truncated store' reason and the health/recovery route are corruption-taxonomy items under the fourth rejected expansion, and JJI-007's negative constraints already forbid consumers from owning repair logic - which J0022 R-21-3 correctly cites when it refuses to propose a repair action. The unsupported-layout reason is NOT in that cluster and is credited as part of F089.

**Distinctness.** F010 and F089 are credited to this arm. This candidate is the vocabulary consequence - that four distinct failure classes have one bucket - plus a route to act on them, which is the declined half.

*Not added to the union; the taxonomy and route halves are flagged.*

## Observations

**THE HEADLINE: prioritization lost 13 findings while comparing two more leads.** Arm P scored 32/110 against claude-hicap's 45/110 on identical premium artifacts, identical starting state, identical 12 admissions, 3 workers and per-job ceilings - a NET LOSS OF 13 - while comparing 16 leads to claude-hicap's 14 and spending slightly more ($85.50 against $82.52, and 18.6% more wall time). The 19 findings lost are two coherent families the Muse ranking pushed below rank 16: the external-editor and diff family (F028, F029, F031, F032, F034, F036, F037, F053, F087) and the graph, history and process family (F043, F059, F062, F066, F074, F083, F088, F092, F106, F107). The 6 gained (F005, F019, F052, F054, F057, F064) are real and are exactly where the extra depth went. Prioritization bought depth in one theme and paid for it with breadth across families.

**The ranking did not predict yield: credits per lead are flat across the compared band.** Credits by rank band: ranks 1-3 produced 7, ranks 4-6 produced 6, rank 7 produced 2 (a single-lead job), ranks 8-10 produced 5, ranks 11-13 produced 7, ranks 14-16 produced 5. Per lead that is 2.33, 2.00, 2.00, 1.67, 2.33, 1.67 - no decline with rank. If the prioritizer's ordering carried information about union yield, credits would fall as rank rises; they do not. The consequence is that recall here is governed by which FAMILIES the admitted leads belong to, not by their order within the admitted set - which is why comparing two more leads still lost 13 findings.

**The prioritizer steered the arm into territory continuation 3 had already closed.** Muse Spark's top-ranked leads are almost entirely extras-table integrity, GC fencing, backup closure, colocation certification and config identity. That is precisely the F082/F086/F056 scope-boundary area continuation 3 examined and declined to expand: its fourth rejected expansion is 'Corruption taxonomy, EXTRAS DETECTOR, clone stage details and arbitrary conflict editor'. Three of this arm's six out-of-union candidates (C5P-02, C5P-03, C5P-05) and half of a fourth (C5P-06) fall inside standing rejections. So the ranking concentrated the most expensive reviewer in the campaign on ground that had already been adjudicated closed - a second-order cost of prioritizing by apparent severity against a union that had already priced that severity in.

**The arm contains both sides of a boundary continuation 3 settled, in two different jobs.** J0021 R1.2 proposes a new writer-bearing `snapshot_capable_read` class for the seven read commands - which is continuation 3's second rejected expansion almost verbatim ('a new writer-bearing branch would change that authority'). J0028 A1, a different job on a different lead, proposes the remedy continuation 3 would accept: every read-class dispatch executes in a non-mutating mode, and a snapshotting refresh must be RECLASSIFIED into the existing mutation class rather than given a new lease-bearing read branch. The continuation-4 union arm (C4U-01) and claude-hicap (C4H-02) both independently reached A1's side. Same arm, same finding, two incompatible remedies, no cross-job reconciliation - a consequence of running twelve independent compare jobs with no synthesis pass.

**Zero code-fact errors - the only arm in the campaign with a clean verification record.** Under continuation 5's standing addition I verified 23 code-fact assertions against the pinned bytes before crediting anything: seven in lib/src/stacked_table.rs at tag v0.44.0, two in lib/src/git.rs at v0.44.0, one contract fact against the frozen Plans at bc7569b3f5, and thirteen in the arm's own pinned cache at e6dd2c0d. ALL 23 UPHELD. Three assertions the arm explicitly marks as its own discovery rather than inherited - the special-file silent omission category, the submodule-contents category, and TableStore::gc's doc comment holding at v0.44.0 and not only at the pin - are all correct. For contrast, in continuation 4 both Claude arms asserted the inverse of jj's UNIX_EPOCH garbage-collection predicate and glm53 asserted it in one job while quarantining it in another. The distinguishing habit here is re-fetching the raw file AT THE CERTIFIED TAG and comparing code, rather than inferring a defect's presence from release dates.

**The session-limited job carried both of the arm's distinctive findings.** J0028-compare was cut by the account's shared five-hour window, not by any arm limit. Its output is complete - 76 receipts reconciled against 76 requests, a 58,935-byte notes.md ending on a finished section, all three leads delivered - and it carries 5 of the 32 credits including BOTH findings this arm adds over all six continuation-4 arms (F054 is J0020's, F064 is J0028's; F002, F030, F061, F094 are also J0028's). Had the limit landed ten minutes earlier the arm would have lost its only two novel contributions. Worth stating when the sweep arms are scheduled against the same shared account.

## Limits

- One frozen case, one ordering, one prioritizer. This does not establish that prioritization cannot help - only that THIS ranking, on THIS union, lost.
- Two variables moved at once: admission order AND effort (max vs claude-hicap's xhigh). The ordering effect is not cleanly isolated, and the effort difference runs in Arm P's favour, which makes the 13-finding loss a conservative estimate of the ordering penalty.
- Recall is measured against continuation 3's fixed 110-finding union, which was built from premium and hybrid output. A prioritizer that optimises for anything the union does not contain is penalised here by construction - see ranking_yield.caveat.
- The 110-finding union is not a yield oracle. 'Lost' findings are findings claude-hicap reached and this arm did not; they are not necessarily more valuable than the deeper contract repairs Arm P produced in its own band.
- 'Unsupported or already-covered' is a union class, not a false-positive rate.
- Adjudicator and the depth-stage model share a family; all 23 code facts were independently verified against pinned bytes to make the judgement re-checkable.

## Files

| File | Contents |
|---|---|
| `p-depth-findings.json` | 32 credited rows with class, job, rank band, basis, evidence hashes and the per-finding code-fact verification record; 5 partials |
| `p-depth-candidates.json` | 6 out-of-union candidates and 6 observations, with rejection checks |
| `p-depth-scoring.json` | Run and manifest verification, job table, ranking yield, claude-hicap comparison, request-limited and reached-delivery figures |
| `PROGRESS.md` | Stage-by-stage progress note |
| `../p-depth-manifest.json` | Hash manifest for this directory |

Runner bundle (what ran, under which limits and code, at what cost): branch
`research/continuation5-20260917`, commit `eda0c92821`, at
`reports/jujutsu-research-2026-09-11/continuation5/`. Referenced by path; its tables are not
duplicated here.
