# PNC019 s4o1 — bounded executable oracle evidence

Implementation head: `bfafb7e515d7c1a40da0f42f4eb106db170466c0`. Branch: `plans/ea-pnc-s4o1-20261114`.
Base: `3c33510c576d87a9ad512c4519d417e4fd4441df`. Selection: alphabetical positions 1–94 of the 187 batch-2 oracle-short families, pinned to the readiness SHA in the manifest.

## Grade and boundary

**C12: 94 PARTIAL.** The implementation provides executable, source-bound schema phases. It does not close full-family C12. The other eleven criterion counts are carried from the pinned readiness source and were not regraded. Membership and retention changes remain with their assigned lanes. Native producer conformance is `NOT_RUN`; it is a separate boundary rather than the reason for these partial grades.

All 2119 required-member rows and 1841 atomic rows passed the unchanged gated tool: **3960 proved rows**, zero unproved registered rows, zero masked phase negatives and zero unrelated phase changes. Tables contain one guard, below the maximum of eight. The proof is scoped to these phases. No isolation credit is assigned to unported or opaque schema semantics.

The 9936 generated proposals produced 9761 exact expected-refusal kills. 175 proposals did not reach their expected schema occurrence and receive no kill credit. 4984 candidates also accepted after the one full owner-schema clause cut. All 1841 atomic candidates were independently revalidated against the complete selected owner schema, cut, and restored. These are schema cuts, not whole-lifecycle checker cuts. Prior report flags cannot substitute for those calls.

The raw kill field counts a matching expected refusal observation, including cases with other owner errors. It is not a count of isolated owner predicates. Isolation credit is limited to the explicitly scoped native phase reports and complete-schema cut/restoration results above.

## Mutation table

| Metric | Count |
|---|---:|
| Valid payload controls | 228 |
| Proposals | 9936 |
| Exact expected-refusal kills | 9761 |
| Non-targeting proposals, no credit | 175 |
| Full owner-schema single-clause flips | 4984 |
| Gated required-member rows | 2119 |
| Gated atomic rows | 1841 |
| Independently reverified atomic cuts | 1841 |
| Retained-read store observations | 67930 |

Store observation totals count repeated dispatcher calls, not unique cases, origins or independent witnesses. The compact snapshot index records accepted/refused outcomes, actual map names and authenticated-owner source locations.

## Implementation and verification

- `tests/fixtures/pnc019_s4o1/families.json:1` pins the exact split, schemas, fixtures and control digests. `scripts/pm_pnc019_s4o1.py` loads those bytes and refuses drift. It preserves owner schema keywords and uses shared integer and EventRecord date-time calls; `acknowledged_at_utc` retains the broad EventRecord profile.
- `scripts/pm_pnc019_required_table.py:1`, `scripts/pm_pnc019_scalar_phase.py:1` and `scripts/pm_pnc019_schema_worker.py:1` construct fresh cases on the inherited gated engine. Each report binds its tool and source hashes. `scripts/pm_pnc019_s4o1_required.py:1` checks the exact original owner refusal before a required-member phase. `scripts/pm_pnc019_s4o1_atomic.py:1` reproduces complete-owner cuts and restoration before atomic credit. Unsupported patterns/formats remain uncredited. The 31 observed pattern forms are listed by family in `oracle-cells.json`.
- `scripts/pm_pnc019_s4o1_regression.py:1` runs the listed existing owner checkers. The 29-command observed sequence is supplemented by the DS part-2B complete-entry witnesses: its round-4 supplement alone makes no target dispatcher calls. The obsolete no-family DS15 invocation is superseded by six successful explicit-family runs. Initial DCH imports lacked eight tracked audit inputs excluded by the lane sparse checkout; those exact HEAD bytes were materialized and the retained DCH runs supersede the initial infrastructure refusals. No audit content was edited.
- `scripts/pm_pnc019_retained_snapshot.py:1` observes real shared dispatcher calls. Snapshots cover owner state plus actual sealed custody surfaces: DT worlds/resources, DCW `_ISSUED`, DG6A `SEALED`, DS15's already-composed sealed catalogue and DS's already-materialized custody cache, alongside named custody maps and owner-held stores. The observer never manufactures a receipt. Unsupported state receives no store-proof credit. Initial DT/DCW/DS15/DG6A limited observations are superseded by their explicit refreshed runs. Final observations show zero store mutations and zero unavailable snapshots. This is finite in-memory model evidence; native Storage is `NOT_RUN`.
- `tests/test_pm_pnc019_s4o1.py:1` passes 16 regression tests, including exact refusal attribution, required-member attribution, branch/array occurrence paths, exception propagation, 4,400-digit integers, timestamp profiles, actual DG6A/DS store mutations, closed serialization and forged upstream cut flags.

Run the scripts under `long-job`, with at least 12 GiB available and a `systemd-run --user --scope -p MemoryMax=2G -p MemorySwapMax=0` cap. The proof worker uses the scratch output directory as cwd; this avoids the inherited tool's false classification of third-party generated frames as repository code, while real repository imports retain absolute source checking. No tool source was changed.

Example: `python3 -B scripts/pm_pnc019_s4o1.py --family alert.acknowledged --out /home/sittingmongoose/pm-scratch/ea-pnc-s4o1-recheck/payload`; then run the required and atomic drivers with the same manifest. The atomic driver supports `--verify-only`. `python3 -B tests/test_pm_pnc019_s4o1.py` checks driver regressions.

From this lane worktree, inside the required capped scope, the companion commands for that example are:

```sh
python3 -B scripts/pm_pnc019_s4o1_required.py --family alert.acknowledged --out /home/sittingmongoose/pm-scratch/ea-pnc-s4o1-recheck/required
python3 -B scripts/pm_pnc019_s4o1_atomic.py --family alert.acknowledged --evidence /home/sittingmongoose/pm-scratch/ea-pnc-s4o1-recheck/payload --out /home/sittingmongoose/pm-scratch/ea-pnc-s4o1-recheck/atomic
python3 -B scripts/pm_pnc019_s4o1_atomic.py --family alert.acknowledged --evidence /home/sittingmongoose/pm-scratch/ea-pnc-s4o1-recheck/payload --out /home/sittingmongoose/pm-scratch/ea-pnc-s4o1-recheck/reverified --verify-only
```

## Remaining work and shared result

`unclosed-oracles.json` records the non-targeting proposals and each family's opaque pattern forms. `schema-keyword-summary.json` separates expected-refusal kills, complete-owner flips and gated rows by keyword; it covers evaluated fixture cases and makes no claim about unvisited branches. Complete-boundary coverage of all reachable assertions and owner semantics remains required for C12 promotion. Whole-schema or phase-level success is not a substitute for that coverage. These 94 families must not be treated as 11/11 admission-ready on the strength of this report.

- The new phase inventory covers the payload/schema edition selected in each manifest row. Companion envelope, outcome, checkpoint and operation schemas need their own per-clause inventory and proofs; passing an existing owner suite does not port those clauses.
- The generator enumerates fixture-evaluated branches. Unvisited branches and reference-occurrence cuts receive no completeness credit. The 175 non-targeting proposals also remain uncredited.
- `pattern` and `format` are explicitly unsupported atomic clauses in this inherited engine; their complete-owner refusal cases are observations, not gated isolation proofs. Context-bound adapters and witnesses remain necessary.
- Existing lifecycle/join proof lineage is carried from the pinned owner reports. This lane adds finite owner regressions and store snapshots; it does not freshly prove every lifecycle and distinct-copy join predicate. Integration review remains open.
- Native schema phases use the inherited engine's dialect semantics. In particular, a schema type phase is not a proof of the shared current-number admission rule. The complete selected-schema runner and existing owner checkers call the shared number boundary separately; exact semantic equivalence of all production predicates remains outside phase credit.

`chat.response_stop_requested` has zero shared-dispatcher observations. Its existing context-based read and commitment checks pass their owner suite, but they do not establish a sealed-store snapshot. This is a remaining oracle gap, not zero-mutation evidence. Pattern inventory sites are evaluation coordinates (including reference traversal markers), not necessarily physical JSON pointers into a single schema document.

All families with no target dispatcher observation in these runs: `browser.workspace.reset`, `chat.response_stop_requested`, `context.compaction.completed`. Their schema phases remain usable, but these runs supply no retained-store nonmutation evidence for them.

The number-only shared self-test passes. The combined self-test's inventory passes (290 nodes), but 32 node checks fail, all in W3H `external_prepared_event` schemas outside this lane. `shared-failed-nodes.json` gives exact paths, pointers and control sources. The frozen shared helper files remain unchanged. No new product decision was made.

No SP/CV/ATS id was minted; 2600–2699 is unused. No Plans owner prose, schema, registry, Spec Lock, generated shard, evidence bundle or auto-decision content was changed. No main push, landing lock, reseal, subagent or browser was used. The lead's harness worktree received initial read-only inspection only; no working file there was changed. This lane worktree remains for the lead's merge.

## Source citations and verification

All locations below are at implementation commit `bfafb7e515d7c1a40da0f42f4eb106db170466c0`. Source hashes in the proof reports independently bind the gated phase files.

| Item | Location | How to verify |
|---|---|---|
| Exact family split and pinned source bytes | `tests/fixtures/pnc019_s4o1/families.json:1`; `scripts/pm_pnc019_s4o1.py:142` and `:161` | Compare the 94 sorted names to positions 1–94 of the pinned readiness input; `load_rows()` refuses schema, fixture or control digest drift. |
| Closed current-schema lookup | `scripts/pm_pnc019_s4o1.py:177` | Run the resource-shadowing unit test; a differing current duplicate id refuses instead of silently replacing a resource. |
| Expected-refusal-only kills | `scripts/pm_pnc019_s4o1.py:262` and `:355` | Replay one family; compare keyword, evaluated schema occurrence, instance occurrence and required member. An exception propagates. |
| Gated required and atomic clauses | `scripts/pm_pnc019_required_table.py:17`; `scripts/pm_pnc019_scalar_phase.py:12`; `scripts/pm_pnc019_schema_worker.py:24` | Re-run the phase drivers and verify each native report's tool/source hashes, proved rows, empty masks and empty unrelated changes. |
| Independent full-owner cut/restoration | `scripts/pm_pnc019_s4o1_atomic.py:37` and `:59` | Run `--verify-only`; the forged-flag regression must refuse a candidate still masked by a different owner clause. |
| Owner regressions | `scripts/pm_pnc019_s4o1_regression.py:51` | Run the 30 listed commands serially with `--retained-snapshots`; check each exit and the before/after custody-file maps. The saved run has 29 commands plus an independent `DS-p2b` run. |
| Actual retained store snapshots | `scripts/pm_pnc019_retained_snapshot.py:20`, `:54` and `:88` | Compare before/after hashes for every accepted or refused dispatcher call. Inspect the actual owner/map names; unsupported state has no credit. |
| Driver regressions | `tests/test_pm_pnc019_s4o1.py:18` | `python3 -B tests/test_pm_pnc019_s4o1.py`: 16 tests, exit 0. |

Implementation fixes and the original failing conditions are retained with the evidence:

| Commit | Location | Cause and fix | Verification |
|---|---|---|---|
| `2a932f7639d2b4fd1f68c0be584fe8bcc149f1d9` | `scripts/pm_pnc019_s4o1.py:177`, `:203`, `:234` | Retained duplicates could shadow current schemas; huge integer diagnostic formatting could crash. Use closed current-resource lookup and safe shared-number diagnostics. | Resource-shadowing and 4,400-digit tests pass. |
| `956ec90926e2983918aa97aba6caa844d3b3b603` | `scripts/pm_pnc019_s4o1.py:61`; `scripts/pm_pnc019_s4o1_required.py:21` | Stop's payload binding selected its outcome instead of its request; table minimum excluded a valid singleton. Bind the request and permit 1–8 rows. | All 94 family bindings load; 228 controls validate; all 2,119 required rows prove. |
| `8197644a4034bdde3e2fdd2004cd8c2d0f3cbf7b` | `scripts/pm_pnc019_s4o1_regression.py:60` | The DS15 deck checker requires an explicit family. Run the six selected names separately. | All six explicit commands pass; supersede the old exit 2. |
| `23014f59712d2a929b2cbdb43b9d5cd24f12d710` | `scripts/pm_pnc019_s4o1_atomic.py:37`; `scripts/pm_pnc019_retained_snapshot.py:25` | Upstream cut flags were insufficient evidence; DT's custody container included an opaque operational dispatcher. Recompute all full-owner cuts and snapshot its actual sealed worlds/resources. | 1,841 cuts reverified; DT 324 observations available and unchanged. |
| `52ba198e8735869e3c47c9c11a13598a37414745` | `scripts/pm_pnc019_retained_snapshot.py:31` and `:33` | Empty DCW owner state and DS15 receipt metadata omitted the real store. Snapshot `_ISSUED` and the already-materialized sealed catalogue; refuse unsupported empty owners. | Refreshed DCW 2,522 and DS15 516 observations available and unchanged. |
| `5c80896996d06e05f9baccb8f469f61ed9c34681` | `scripts/pm_pnc019_retained_snapshot.py:33` and `:41`; `tests/test_pm_pnc019_s4o1.py:117` | DG6A metadata omitted `SEALED`; DS original bytes omitted its backing cached catalogue. Capture the actual maps without composing them on read. | Real store mutation regressions pass; all eleven DG6A commands re-observed with the corrected selector. |

The shared inventory's sparse-input failure is superseded by materializing eight tracked audit files byte-for-byte from HEAD. No audit source changed. The remaining 32 W3H failures are preserved in `shared-failed-nodes.json` for their owning lane. The inherited tool's generated-frame classification is handled by the worker cwd; its source is unchanged. Neither infrastructure issue is a mutation kill.

## Family grid

Each manifest citation is at implementation head `bfafb7e515d7c1a40da0f42f4eb106db170466c0`. The JSON contains schema/fixture SHA-256, original grade citations, counts and scope; the CSV contains the per-family mutation counts. The manifest preserves the pinned source lineage. Re-run `--family <event_type>` to verify that row. Raw native proof reports are keyed by family and case in the external evidence archive, bound by SHA-256 in the companion sums.

| Position | Family | Required rows | Atomic rows | Exact kills/proposals | Store observations | C12 | Source binding |
|---:|---|---:|---:|---:|---:|---|---|
| 1 | `alert.acknowledged` | 17 | 13 | 63/63 | 178 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:7` |
| 2 | `alert.dismissed` | 18 | 13 | 68/68 | 178 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:44` |
| 3 | `alert.rule_muted` | 19 | 14 | 70/70 | 178 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:81` |
| 4 | `alert.snoozed` | 19 | 15 | 94/94 | 178 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:118` |
| 5 | `approval.denied` | 8 | 23 | 35/35 | 54 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:156` |
| 6 | `approval.granted` | 10 | 29 | 43/43 | 54 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:190` |
| 7 | `approval.requested` | 8 | 29 | 41/41 | 54 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:224` |
| 8 | `approval.timeout` | 7 | 20 | 31/31 | 54 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:258` |
| 9 | `auth.github.authenticated` | 15 | 32 | 55/55 | 148 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:292` |
| 10 | `auth.github.device_code.issued` | 16 | 30 | 58/58 | 148 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:328` |
| 11 | `auth.github.disconnected` | 15 | 28 | 53/53 | 148 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:364` |
| 12 | `auth.github.failed` | 15 | 30 | 51/51 | 148 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:400` |
| 13 | `auth.github.token.polling` | 17 | 33 | 56/56 | 148 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:436` |
| 14 | `brainstorm.plan_synthesized` | 18 | 19 | 108/108 | 36 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:472` |
| 15 | `brainstorm.proposal_added` | 17 | 12 | 85/85 | 32 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:505` |
| 16 | `brainstorm.vote_added` | 19 | 14 | 104/104 | 32 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:537` |
| 17 | `browser.context_share_revoked` | 11 | 26 | 59/60 | 91 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:569` |
| 18 | `browser.context_shared` | 12 | 29 | 66/66 | 85 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:606` |
| 19 | `browser.workspace.created` | 35 | 6 | 147/149 | 9 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:643` |
| 20 | `browser.workspace.reset` | 35 | 6 | 147/150 | 0 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:674` |
| 21 | `bundle.annotation_state_changed` | 20 | 23 | 59/60 | 32 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:705` |
| 22 | `bundle.note_created` | 18 | 22 | 54/54 | 91 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:744` |
| 23 | `bundle.note_status_changed` | 18 | 21 | 54/55 | 91 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:782` |
| 24 | `bundle.revision_completed` | 16 | 39 | 60/60 | 276 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:820` |
| 25 | `bundle.revision_interrupted` | 16 | 39 | 60/60 | 277 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:858` |
| 26 | `bundle.revision_requested` | 16 | 38 | 59/59 | 1127 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:896` |
| 27 | `bundle.revision_started` | 16 | 39 | 60/60 | 842 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:934` |
| 28 | `bundle.selection_forward_blocked` | 42 | 0 | 162/167 | 777 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:972` |
| 29 | `bundle.selection_sent_to_chat` | 46 | 0 | 186/191 | 777 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1009` |
| 30 | `catalog.remove.completed` | 14 | 31 | 72/72 | 85 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1046` |
| 31 | `catalog.remove.started` | 14 | 31 | 72/72 | 85 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1081` |
| 32 | `catalog.update.completed` | 16 | 35 | 84/84 | 85 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1116` |
| 33 | `catalog.update.started` | 16 | 35 | 84/84 | 85 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1151` |
| 34 | `chat.message` | 42 | 0 | 150/155 | 777 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1186` |
| 35 | `chat.response_stop_requested` | 28 | 0 | 116/118 | 0 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1223` |
| 36 | `chat.thread_archived` | 46 | 0 | 158/163 | 777 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1261` |
| 37 | `chat.thread_created` | 36 | 0 | 138/143 | 777 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1298` |
| 38 | `chat.thread_deleted` | 36 | 0 | 134/139 | 777 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1335` |
| 39 | `chat.thread_worktree_bound` | 40 | 0 | 150/155 | 777 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1372` |
| 40 | `chat.thread_worktree_create_failed` | 36 | 0 | 134/139 | 777 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1409` |
| 41 | `chat.thread_worktree_merge_failed` | 44 | 0 | 162/167 | 777 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1446` |
| 42 | `chat.thread_worktree_merged` | 42 | 0 | 156/161 | 777 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1483` |
| 43 | `chat.thread_worktree_pr_created` | 42 | 0 | 160/165 | 875 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1520` |
| 44 | `chat.thread_worktree_pr_failed` | 40 | 0 | 150/155 | 777 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1557` |
| 45 | `chat.thread_worktree_pre_merge_test_failed` | 50 | 0 | 176/183 | 777 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1594` |
| 46 | `chat.thread_worktree_pre_merge_test_passed` | 42 | 0 | 158/163 | 777 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1631` |
| 47 | `chat.thread_worktree_pre_merge_test_started` | 40 | 0 | 146/151 | 1351 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1668` |
| 48 | `chat.thread_worktree_renamed` | 38 | 0 | 146/151 | 777 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1705` |
| 49 | `chat.thread_worktree_unbound` | 36 | 0 | 134/139 | 777 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1742` |
| 50 | `collaboration.artifact_added` | 15 | 9 | 95/95 | 32 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1779` |
| 51 | `collaboration.cancelled` | 17 | 13 | 79/79 | 36 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1812` |
| 52 | `collaboration.completed` | 18 | 18 | 118/118 | 32 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1844` |
| 53 | `collaboration.configuration_changed` | 19 | 22 | 145/145 | 32 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1877` |
| 54 | `collaboration.created` | 16 | 14 | 100/100 | 147 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1911` |
| 55 | `collaboration.failed` | 14 | 13 | 83/83 | 32 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1943` |
| 56 | `collaboration.message_added` | 19 | 16 | 171/171 | 32 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:1976` |
| 57 | `collaboration.participant_completed` | 20 | 14 | 151/151 | 32 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2011` |
| 58 | `collaboration.participant_started` | 18 | 12 | 115/115 | 32 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2046` |
| 59 | `collaboration.paused` | 14 | 11 | 67/67 | 32 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2079` |
| 60 | `collaboration.resumed` | 14 | 11 | 67/67 | 32 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2111` |
| 61 | `collaboration.started` | 22 | 22 | 170/170 | 32 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2143` |
| 62 | `concern.assigned` | 13 | 17 | 42/42 | 168 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2178` |
| 63 | `concern.created` | 21 | 9 | 101/101 | 142 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2216` |
| 64 | `concern.evidence_linked` | 13 | 17 | 42/42 | 168 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2253` |
| 65 | `concern.promoted` | 13 | 17 | 42/42 | 168 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2291` |
| 66 | `concern.reopened` | 13 | 17 | 42/42 | 168 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2329` |
| 67 | `concern.resolved` | 13 | 17 | 42/42 | 168 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2367` |
| 68 | `concern.updated` | 13 | 17 | 42/42 | 168 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2405` |
| 69 | `config.migrated` | 8 | 14 | 29/29 | 56 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2443` |
| 70 | `config.validation.failed` | 14 | 28 | 47/47 | 6542 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2477` |
| 71 | `context.compaction.completed` | 19 | 42 | 115/115 | 0 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2512` |
| 72 | `crew.board_message_posted` | 22 | 41 | 124/124 | 17846 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2545` |
| 73 | `crew.board_message_read` | 14 | 27 | 62/62 | 10042 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2583` |
| 74 | `crew.board_messages_archived` | 14 | 29 | 65/65 | 9834 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2619` |
| 75 | `file.copied` | 20 | 13 | 78/78 | 40 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2655` |
| 76 | `file.created` | 19 | 13 | 73/73 | 32 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2693` |
| 77 | `file.deleted` | 19 | 13 | 73/73 | 32 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2731` |
| 78 | `file.exported` | 21 | 14 | 80/80 | 40 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2769` |
| 79 | `file.moved` | 21 | 14 | 80/80 | 40 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2807` |
| 80 | `file.renamed` | 21 | 14 | 80/80 | 32 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2845` |
| 81 | `filesafe.command_denied` | 26 | 53 | 212/222 | 367 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2883` |
| 82 | `filesafe.destructive_override_denied` | 26 | 45 | 204/214 | 366 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2929` |
| 83 | `filesafe.destructive_override_granted` | 49 | 82 | 323/337 | 366 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:2975` |
| 84 | `filesafe.destructive_override_requested` | 49 | 84 | 317/331 | 366 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:3019` |
| 85 | `filesafe.guard_init_failed` | 28 | 54 | 255/265 | 366 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:3065` |
| 86 | `filesafe.path_denied` | 27 | 55 | 227/237 | 366 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:3112` |
| 87 | `filesafe.policy_degraded` | 25 | 48 | 215/225 | 366 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:3158` |
| 88 | `folder.copied` | 22 | 13 | 86/86 | 40 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:3203` |
| 89 | `folder.created` | 19 | 13 | 73/73 | 32 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:3241` |
| 90 | `folder.deleted` | 21 | 13 | 81/81 | 32 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:3279` |
| 91 | `folder.exported` | 23 | 14 | 88/88 | 40 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:3317` |
| 92 | `folder.moved` | 22 | 14 | 84/84 | 40 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:3355` |
| 93 | `folder.renamed` | 22 | 17 | 84/84 | 32 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:3393` |
| 94 | `gate.evaluation_started` | 6 | 14 | 24/24 | 52 | PARTIAL | `tests/fixtures/pnc019_s4o1/families.json:3431` |

## External evidence

Raw evidence is outside the repository, in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/s4o1`. Verify `SHA256SUMS` there before extracting either archive. The compact repository bundle contains the grade grid and indices; it does not contain raw captures.

| Artifact | SHA-256 | Contents |
|---|---|---|
| [schema-evidence.tar.gz](/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/s4o1/schema-evidence.tar.gz) | `4f756583766b23054e4c918b538b6379b079dcdc0003739e4b9838f624115fc5` | 94 payload suites, 94 required and 94 atomic phase summaries and their native reports, independent cut revalidation, proof-source audit, shared helper logs and residual pattern inventory. |
| [owner-evidence.tar.gz](/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/s4o1/owner-evidence.tar.gz) | `af37096ebc099081b8eef2fb33636a4452808e2eee246556f2f9194fffb26618` | Completed owner command logs, explicit refreshed store observations, superseded attempts marked by the source-state index, 16 unit tests and report-building code. |

To regenerate this report, extract both archives into `/home/sittingmongoose/pm-scratch/ea-pnc-s4o1`, check out implementation head `bfafb7e515d7c1a40da0f42f4eb106db170466c0` in this lane's worktree, and run `python3 /home/sittingmongoose/pm-scratch/ea-pnc-s4o1/build_report.py`. Run the archived `prepare_bundle.py` only after verifying the archive hashes. Report regeneration rechecks native report/source hashes and refuses an incomplete or failing owner sequence.

This is a partial oracle implementation handoff. It is ready for integration review, with the unclosed cells and shared W3H failures preserved; it is not an admission-ready verdict.
