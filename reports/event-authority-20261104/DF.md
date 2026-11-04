# DF — extra authorized review round 4

Branch: `plans/ea-w2-filesafe-20261104`. Reviewed starting head: `d82ede0801cf2f66a5bc869e4664838729ea1241`. Assessed repair head: `67aeb8c7228003c40324d5b30a0fdf875a5665ec`. The following report/self-grade commit changes no assessed source or derived artifact. This extra round fixes only Astra's two standing-check blockers. No further review was spawned.

All nine are prepared in the static contract scope after the two repairs and complete regression run. Membership remains ABSENT; native execution remains NOT_RUN. Seven unchanged, narrowed EventRecord retention questions remain pending for Jared. No admission, deletion choice or runtime/governance clearance follows.

## Review round 4: findings and responses

- **Astra B1 — fixed (`67aeb8c7228003c40324d5b30a0fdf875a5665ec`). Where:** `scripts/pm_filesafe_event_authority.py:546`, own inline/reference Project/application protocol cases, ATS-275..279. **Why:** passive event reads called current writer materialization, reopening domain controls and comparing historical writer_epoch to live writer_epoch. **Fix:** independently resolve the retained original issued EventRecord and unchanged first receipt against the selected retained boundary, Storage identity and reader generation; verify complete issued/payload custody without reopening current writer controls. Reader withdrawal, forged/lost issued rows, altered receipts, absent boundary, stale reader generation and wrong Storage still refuse. Writer acceptance retains its original selection/epoch checks. All 36 earlier historical counterexamples now read successfully. Own fixtures add 486 protocol traces, including all inline/reference/scope combinations and 18 body reads after epoch rollover. The nine old missing-body tests now explicitly request `read_body`, keep their original `read_unavailable` assertion, and also assert that the intact event row remains readable; no body-refusal expectation is removed. Native body access/holds remain their owner's responsibility and NOT_RUN. Verify both full checkers, `probes.py`, `cli-mutations.py` and the own protocol fixtures.
- **Astra B2 — fixed (`67aeb8c7228003c40324d5b30a0fdf875a5665ec`). Where:** `scripts/pm_filesafe_schema_graph.py:42`, `scripts/pm_filesafe_event_contracts.py:92`, all nine own source graphs and `Plans/filesafe_schema_graph_fixtures.json`. **Why:** the graph omitted the existing shared integration expansion resource and check_schema never dereferenced unused definitions. **Fix:** pin the missing exact dependency in each graph, preserve all prior pins, and resolve every selected `$ref`/`$dynamicRef` offline, including unused definitions and nested `$id` scopes. Both entry points run five own negative graph cases per family (45 each): dangling source, payload and dependency definitions, unselected dependency and nested-scope missing reference. All 3,937 independently inspected references now resolve. Rehashed additions of 18 unexercised dangling definitions produce exit 1/status fail and exactly 18 unresolved-reference diagnostics in each complete CLI. Their prior incorrect exit 0 is gone. Verify the full schema fixture tests and `cli-mutations.py`.

No finding is disputed. No standing-check defect remains open in the static scope. N1's timestamp-only index note is retained: generation refreshes generated_at_utc; structural content, not literal timestamp identity, is asserted.

## Earlier findings B1 through B8: every mutation rerun

These are the numbered findings from the earlier Sol reviews, distinct from Astra's restarted B1/B2 numbering. Each result is based on this round's execution, not a carried old log.

| Earlier finding | Result at assessed head | Current reproduction evidence |
|---|---|---|
| B1: opaque application safe-point originals | PASS; prior fix `42b9a62384` holds | Re-encoded/rehashed wrong subjects and manifest counts refuse; restored impossible cursors refuse. Full-checker B1/B7 mutations and independent original-record probes pass. Original Project resources remain byte-identical. |
| B2: terminal/cached retry after failed recovery | PASS; prior fix `42b9a62384` holds | Every family/scope loses issued row, custody or first receipt; recovery, terminal and cached retry refuse through two crashes. No prior counterexample is accepted. |
| B3: reduced survivors/pending owner commit | PASS; prior fix `42b9a62384` holds | Before-constructor/cutoff/rebuild/publication loss, pre-prepare pending work and source/reader generation races retain fences. B2/B3's 396 earlier refusal assertions pass; intact custody supports disposed-control retry/rebuild/publication. |
| B4: already-governed retention defaults | PASS; prior fixes `42b9a62384`, `a73fe06f23` hold | Thirty-six independent assignment probes plus three rehashed full-CLI batches reject every wrong alternative (27 mutations, 18 exact diagnostics per batch, exit 1). Granted remains authority-indefinite; policy_degraded remains 2,555-day non-authority diagnostics. Seven narrow questions unchanged. |
| B5: false missing-source index failures | PASS; prior fix `42b9a62384` holds | All 269 inventoried sources and 15 SHA-verified currentness inputs exist; generated index validates with parsed top-level pass. Removing inventoried ledger_registry.json makes the full index validator exit 1/status fail; exact restoration returns final validation to pass. No false missing-source rows remain. |
| B6: replay-only retry acceptance | PASS; prior fix `655a0d97e8` holds | 126 independent current-writer/retry refusals, including after disposed controls; added full-checker traces pass. Storage's semantic digest implementation is byte-unchanged. |
| B7: restore journal/result/operation contradictions | PASS; prior fix `655a0d97e8` holds | Rehashed wrong result pointers/delete-against-live-target mutations refuse for all five app outcomes; 45 journal probes preserve 39 expected refusals and six valid controls. Pre-append null/create/delete/metadata positives remain supported. |
| B8: oversized inline semantic bodies | PASS; prior fix `223e52e83e` holds | All 18 independent oversized originals refuse, including when deliberately supplied as positives to the actual CLI. ASCII/UTF-8 exact 16,383/16,384/16,385 boundaries, 18 large SP-337 reference positives, reference loss/corruption/non-durability and consistently committed oversized issued copies pass their expected oracle outcomes. |

## Family grades before and after

Before is Astra's pinned review. Counts are PASS / PARTIAL / ABSENT. Only C12 positive_negative_oracles upgrades PARTIAL to PASS for each family. All 108 cells have refreshed, exact own-family source citations; C1 stays ABSENT and seven C7 cells stay PARTIAL. Native NOT_RUN does not lower a normative grade.

| Family | Before | After |
|---|---|---|
| `filesafe.command_denied` | 9 / 2 / 1 | 10 / 1 / 1 |
| `filesafe.destructive_override_denied` | 9 / 2 / 1 | 10 / 1 / 1 |
| `filesafe.destructive_override_granted` | 10 / 1 / 1 | 11 / 0 / 1 |
| `filesafe.destructive_override_requested` | 9 / 2 / 1 | 10 / 1 / 1 |
| `filesafe.guard_init_failed` | 9 / 2 / 1 | 10 / 1 / 1 |
| `filesafe.path_denied` | 9 / 2 / 1 | 10 / 1 / 1 |
| `filesafe.policy_degraded` | 10 / 1 / 1 | 11 / 0 / 1 |
| `safe_point.created` | 9 / 2 / 1 | 10 / 1 / 1 |
| `safe_point.restored` | 9 / 2 / 1 | 10 / 1 / 1 |

## All ten standing checks per family

P = pass; F = fixed by `67aeb8c7228003c40324d5b30a0fdf875a5665ec`; no cell is open in the implemented static scope. Checks: 1 replay-only writer/retry refusal; 2 exact CV-366 application key; 3 encoded project~ partition; 4 SP-337 16 KiB/reference custody; 5 trailing-LF guards; 6 caller semantic retry comparison; 7 checkpoint/storage identities; 8 nonzero failure exits; 9 complete reference closure; 10 retained historical reads across live writer-state changes.

| Family | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| `filesafe.command_denied` | P | P | P | P | P | P | P* | P | F | F |
| `filesafe.destructive_override_denied` | P | P | P | P | P | P | P* | P | F | F |
| `filesafe.destructive_override_granted` | P | P | P | P | P | P | P* | P | F | F |
| `filesafe.destructive_override_requested` | P | P | P | P | P | P | P* | P | F | F |
| `filesafe.guard_init_failed` | P | P | P | P | P | P | P* | P | F | F |
| `filesafe.path_denied` | P | P | P | P | P | P | P* | P | F | F |
| `filesafe.policy_degraded` | P | P | P | P | P | P | P* | P | F | F |
| `safe_point.created` | P | P | P | P | P | P | P* | P | F | F |
| `safe_point.restored` | P | P | P | P | P | P | P* | P | F | F |

*Check 7 is scoped precisely: all nine own graphs select family_checkpoint=none_required, with zero family checkpoint positives. Each separately adopts SP-278/DL-076's generic checkpoint, nine-field durable token, fresh live snapshot and CAS. All receipt Storage/partition mismatches and changed-store retries refuse. These receipt tests are not execution of generic checkpoint/CAS; native token/CAS remains NOT_RUN.

Per-family machine evidence: `standing-checks.json`, own graph-negative fixtures and `history-case-map.json`. The independent eight-check suite reran 126 replay refusals, 432 retry comparisons, 108 guarded identifier patterns, 144 composed LF cases and 45 journal probes, with no unexpected acceptance. The independent all-ten probe suite records 5,054 assertions, zero failures, including 90 unchanged/changed-live-state/withdrawn/forged history controls. Both complete CLIs reject nine valid cases deliberately labelled negative; the wrapper requires both nonzero exit and failing status. All mutation inputs restore byte-for-byte.

## Commands and limits

| Check | Exit | Result |
|---|---:|---|
| Full authority CLI | 0 | pass: 131 positives, 1,570 negatives, 1,170 protocol traces; 45 graph-negative cases |
| Full payload CLI | 0 | pass: 92 positives, 186 negatives, 18 identity vectors; 45 graph-negative cases |
| Independent all-ten probes | 0 | 5,054 assertions, zero failures; 3,937 reference resolutions |
| Independent earlier B1/B2/B3/B4/B6/B7/B8 probes | 0 | every prior counterexample refuses; valid controls retained |
| Added rehashed source/payload dangling definitions | 1 / 1 | both complete CLIs fail, exactly 18 unresolved-reference diagnostics each |
| Added retained-history epoch positives | 0 | all 18 pass the actual authority CLI |
| Valid-labelled-negative controls | 1 / 1 | both CLIs fail with exactly nine diagnostics |
| Earlier B1/B7 negatives and B6 retry traces in full CLI | 0 | all pass |
| Earlier B4 rehashed wrong assignments | 1 each | three batches, 18 exact diagnostics per batch |
| Earlier B8 invalid positives plus valid-negative controls | 1 / 1 | authority 27 expected failures; payload nine |
| Shard generate/check | 0 / 0 | only Automated Testing derived directory changes |
| Index generate/validate | 0 / 0 | parsed top-level pass; complete inputs; readiness remains blocked_runtime_certification_incomplete |
| Full index missing-source negative | 1 | expected fail; exact source restoration; final validate pass |
| Scope/case preservation/citations/diff check | 0 | all earlier positive/negative cases retained; only nine explicit body-read action routes clarified; no forbidden changes |

Existing governance/currentness drift remains visible. A governance reseal is requested at batch integration for these owner edits; this worker does not reseal. No aggregate governance clearance is claimed. Native physical payload packs, fsync, permissions/holds/deletion, source authenticity and generic checkpoint/CAS are NOT_RUN.

## Exact retention questions stopped for Jared

Each question is copied exactly from its own SP retention paragraph. The five security questions do not reopen a runtime class; the two snapshot-history questions explicitly separate already-governed originals. These are the remaining cells, not unfixed technical review findings.

- **`filesafe.command_denied`:** Does the retained command-denial EventRecord constitute audit authority (RP-AUTHORITY-INDEFINITE), or non-authority security diagnostic history (RP-OPERATIONAL-2555D)?
- **`filesafe.destructive_override_denied`:** Does the retained destructive-override refusal EventRecord constitute an authority decision receipt (RP-AUTHORITY-INDEFINITE), or non-authority security diagnostic history (RP-OPERATIONAL-2555D)?
- **`filesafe.destructive_override_requested`:** Does the retained destructive-override request EventRecord itself constitute approval/audit authority (RP-AUTHORITY-INDEFINITE), or non-authority security diagnostic history (RP-OPERATIONAL-2555D)?
- **`filesafe.guard_init_failed`:** Does the retained fail-closed guard-initialization EventRecord constitute audit authority (RP-AUTHORITY-INDEFINITE), or non-authority security diagnostic history (RP-OPERATIONAL-2555D)?
- **`filesafe.path_denied`:** Does the retained path-denial EventRecord constitute audit authority (RP-AUTHORITY-INDEFINITE), or non-authority security diagnostic history (RP-OPERATIONAL-2555D)?
- **`safe_point.created`:** Is safe_point.created EventRecord history an authority/capture receipt (RP-AUTHORITY-INDEFINITE), non-authority recovery operational history (RP-OPERATIONAL-2555D), or runtime history (RP-RUNTIME-365D), independently of the already-governed released snapshot bodies?
- **`safe_point.restored`:** Is safe_point.restored EventRecord history an authority/outcome receipt (RP-AUTHORITY-INDEFINITE), non-authority recovery operational history (RP-OPERATIONAL-2555D), or runtime history (RP-RUNTIME-365D), independently of the already-governed original restore transaction and snapshot bodies?

## Current premises, bindings and scope

DL-045 still covers these nine exact names; current F2-213/CV-366 scope/original-source semantics, SP-286/CV-339 complete original receipt custody, SP-278/DL-076 durable-token/CAS and SP-337 payload ownership remain explicit. Current Case L-3 still supplies the two bound exact-kind defaults. No premise failed and no product choice was made. This round adds no new consumer, command, public schema root, identity recipe, stored family or lifetime. It repairs existing read and schema validation bindings.

Shared-owner hunk: only nine separately named round-4 regression paragraphs in ATS-275..279. Companions: DF authority fixtures, nine resource graphs, one lightweight per-family schema-graph fixture pack, the two existing DF checkers and one shared offline schema-resolution helper. All own payload/source schemas, original Project resources, Contracts and Storage owner prose, EventRecord/receipt/shared dependency resources and the Storage semantic digest implementation are byte-unchanged. Derived shards/index were regenerated, never hand-edited. No other owner document's derived files changed.

IDs reused: CV-550..558, SP-550..558, ATS-275..279. No new IDs; CV-559/SP-559 remain unused. No registry append/admission/Decision Log/storage-value edit; no Spec Lock/auto-decisions/evidence/frozen-validator/test edit; no main push/landing/reseal/subagent/new review.

## Resource checks and cleanup

Before worktree creation: 17 GiB memory available and 107 GB disk free, above the 6 GiB/50 GB stop thresholds. Work used the sparse detached `/home/sittingmongoose/pm-worktrees/DF-fix4` from `~/src/PuppetMaster`. Later resource checks remained above limits. The fix brief's no-mail rule was followed after loading it: the initial read-only inbox/who calls preceded that read, and no registration/message was sent. No browser/server was started. The pushed source and final report/self-grades are copied to the evidence directory; the temporary worktree is removed with a literal path after push. No temporary branch was created and nothing was landed.

## Evidence custody

Report and all ten self-grade files are copied to `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/`. Reproduction scripts and complete outputs are retained in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix4/`. Manifest: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix4/manifest.json`, SHA-256 `3392ead7e21c3fce785ecc795d87d882dce19e882b79eb033beebd20a9fb2d86`. It records absolute paths, lengths and SHA-256 for every retained technical artifact. Final pushed head and worktree removal are recorded separately in `fix4/delivery.json`.

| Evidence path | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix4/authority.stdout.json` | `99e9fdcfce54d4a4785f1bd7fda208c801c7bca4fdd9679e2e606985b0ea5155` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix4/payload.stdout.json` | `fc8393517396082385ddce65221c2634632d8e0815c7a2ae2381107841b41218` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix4/probe-results.json` | `54b71b5824d2612919df1b2520566b466b02459cec92705c05fc2214961f3780` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix4/cli-mutation-summary.json` | `f978fd62d3b05c64db343d69b267638ac4d3e6499bd2323eb5d17f749029e5ca` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix4/full-mutations-B1-B7.json` | `94a02c9264acd4ee707a15424d560beb5d3c47da6d695f46f572f7e65c193cdf` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix4/full-mutations-B4.json` | `8c9cf150737fc302d3f15cc43a62d4d6fdedbe1998f361e49df1ee61acf0b6ed` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix4/full-mutations-failure.json` | `6995d163c3508efb82db70a640740ab476c55d8784582dcb9706e14da0eb9c85` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix4/B5-index-mutation.json` | `5eb2d8968a4b1a362011bb963d83f1e78d5e9e4454e81476d2ac49e90046dd47` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix4/scope-audit.json` | `c5ce3a2c60cbfda4779383e79b97503466b83aed11d7d813f50ed5a1b3540c9c` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix4/grade-citations.json` | `0656f09ce6b2a2c4324c4ffb0aff998fe06adc333e547dc5994987419124296a` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix4/index-validate.result.json` | `4ecebecdd31e1789f5f8da081a9da4cfe4ba3a783289ac69ce12ff2a2b9f2b1c` |
