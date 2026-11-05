# DR — fix round 8: authenticated historical restore predecessors

Branch `plans/ea-w2-runtime-artifacts-20261104`; reviewed head `679bc22ad3a5109a070a064235a2ed8bca838492`; implementation `ec476040a569d117e5315891e6749169d57f8b6c`. Delivery head is in external `drafts/DR/HEAD.txt`.

**Result:** C7-B1 fixed. **18/19 → 19/19 prepared without admission**, subject to the explicit sweep and integration items below. Reviewer grades **208 PASS / 1 PARTIAL / 19 ABSENT → 209 PASS / 0 PARTIAL / 19 ABSENT**. Membership is ABSENT; native execution is NOT_RUN. This self-grade does not claim independent review clearance or shared-tool proof certification.

## Review round 8: findings and responses

- **C7-B1 — fixed (`ec476040a569d117e5315891e6749169d57f8b6c`).** Where: `scripts/pm-runtime-artifact-event-drafts.py:1035–1051`, `observation_admissible`, and `scripts/pm_runtime_artifact_round8_cases.py`. Why: the default current decoder reached an authentic retained predecessor containing original Storage `sequence_id=1.0`. Fix: independently authenticated source input carries the recorded recipe and original event/first result/custody. Verify the proposed predecessor and its SP-286 first receipt against that independent original before the historical read, refuse unsupported recipes and withdrawn sources, then decode through the supported recorded profile. Candidate decoding and the complete current canonical-source schema/exact-value join stay strict. Recipe selection never reads the candidate, supplied receipt or supplied custody. The adapter models trusted authentication; native authentication/issuance remains NOT_RUN. Verify with `historical-predecessors.json`, the actual checker’s round-8 cases, and the full nineteen-family rerun.
- **R1 — verification rerun.** All nineteen family checkers and the complete 6,910-pair baseline pass. The 3 new-guard rows also run the complete pair inventory and all family checkers sequentially. The inherited full mutation run stopped after D01 exposed an overbroad proof cut; its remaining rows and the old incomplete uncached matrix are deferred to shared-tool Sweep P1 under FIX-ROUND. B02/B03/S07 causal certification is not claimed complete here. Resource pauses and superseded runs remain in the procedure record.
- **S1 — sweep item retained.** Timestamp grammar is outside this one-blocker fix, as explicitly requested; see below.
- **N1 — integration item retained.** Run the original `pm-plan-index.py validate` against the copied currentness edition. Its top-level failure is retained, not normalized into a pass. Preserve current-main units including DL-302 at integration, regenerate and rerun; do not silence unrelated removal-ledger errors.

**Disputed:** none. **Stopped for Jared:** none.

## Authentic historical routes and refusals

| Frozen predecessor | Current successor | Result |
|---|---|---|
| `numeric_inline` | inline | PASS |
| `numeric_inline` | packed | PASS |
| `numeric_packed` | inline | PASS |
| `numeric_packed` | packed | PASS |

All four routes pass after reproducing the pre-fix refusal. Old issuer `b96dc768a5cc93f7e0edb82b41a7f51ca02dec7c` reproduces each frozen original's exact event/result/custody bytes. Its checker SHA-256 is `fae56bf0407dab11f389f90ad3ff471ec39a234d07209e11bbc828f2af740156`. Frozen full-original SHA-256: inline `53420e558e597fd900ed97d02a6944ac6c342280778ee6775bd562b8293130b1`, packed `0f359255f74b0a0a29e3238342f963935a4001c6933c24480e528614c028a45f`. Originals remain unchanged. Old issuance is a test control only; the producer never reissues history.

**24 one-defect pairs:** four each for forged event bytes, forged first receipt, forged custody, withdrawn predecessor, unsupported recorded recipe, and a current candidate with an integral-float Storage number. Offered receipt copies agree in the forged-receipt case; the independent authentic original stays unchanged. Every valid control accepts and every negative refuses. No candidate, logical body, grouping, ordinal, predecessor identity or canonical-source copy is left stale to mask the named fault. Missing predecessor authentication also refuses; an untrusted caller recipe preference cannot override the independently recorded recipe. The existing 832 source-type pairs remain in the full checker.

## New guard rows

These are **legacy diagnostic rows**, with the proof limits in Sweep P1. The recipe-removal mutant binds the already supported historical decoder after removing recipe support; it does not invent a new historical recipe. Forwarded inspection shares H01’s withdrawn predicate, and forged custody also reaches F13. Full names and linked sites are recorded in `DR.guard-removal.json`.

| Guard | Predicate / boundary | Own flips | Other negatives stay refused | Full checker exit |
|---|---|---:|---:|---:|
| `O11` | predecessor: original event, SP-286 first result and custody authentication | 12 | 6898 | 1 |
| `O12` | predecessor recorded recipe support and explicit historical dispatch | 4 | 6906 | 1 |
| `O13` | predecessor: forward authenticated historical source inspection | 4 | 6906 | 1 |

## Family grades before and after

P=PASS, Q=PARTIAL, A=ABSENT. Only restore_point.positive_negative_oracles changes. All other owner contracts and rubric cells retain their grades after their full family runs.

| Exact family | Before → after |
|---|---|
| `runtime_artifact.api_web_call` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.artifact_version` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.before_after_snapshot` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.browser_recording` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.code_diff` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.context_snapshot` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.cost_usage` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.document` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.evidence` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.failed_attempts` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.hitl_approval` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.implementation_plan` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.reasoning_summary` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.restore_point` | 10P / 1Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.screenshot` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.subagent_lineage` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.suggested_next_steps` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.tool_llm_trace` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.validation_test` | 11P / 0Q / 1A → 11P / 0Q / 1A |

## Whole-lane baseline and new-guard verification

**20,448 assertions pass** across nineteen full family invocations, run one at a time. Immutable fixture/schema reads are reused and hash-checked; validation, codecs and guard outcomes are not cached in that rerun. The first standalone raw CLI family also passed; the superseded multi-process CLI attempt was cancelled before replacement, not run in parallel. An earlier restore trial was cancelled after family-selection changes and is not claimed as a pass. Procedure exception: the initial guard runner started during final input fingerprinting after all family checks had returned, was cancelled before its first guard row, and was restarted after the family runner exited; no family checker jobs overlapped. The later legacy matrix was superseded after its D01 machinery defect, as required by the sweep instruction.

**6,910 valid/negative pairs; 3 diagnostic guard rows; 20 owned flips; 0 unrelated flips.** Every complete mutant checker returns exit 1/status fail. Each new guard is checked against the complete lane pair inventory; the old full guard matrix is not claimed rerun. Its compound cuts, duplicate grouping and assertion inventory still require the shared tool in Sweep P1. Diagnostic rows not satisfying the inherited isolation test: `none`. These rows are classified explicitly after execution; a proof-machinery failure is not reported as an isolation pass. Raw corroboration is reported in its own evidence file at its stated scope; no missing result is inferred.

| Guard | Owned flips | Other negatives still refused | Unrelated flips |
|---|---:|---:|---:|
| `O11` | 12 | 6898 | 0 |
| `O12` | 4 | 6906 | 0 |
| `O13` | 4 | 6906 | 0 |

Standing checks 1–11 remain in every full family suite: replay-only writer refusal, Project-only scope/application refusal, encoded Project partitions, inline/packed size and integrity, exact identifier matching, producer-semantic retry comparisons, checkpoint identity/source joins, failure exit behavior, eager reference resolution, authenticated retained history and one-defect diagnostics. Application-writer certification and native execution are not claimed.

Astra classes 1/2/4/5/6/7/11 remain exercised by the unchanged identity/receipt/source/type/reference/size/custody cases in the full suite. Class 3 and 10a gain the authentic predecessor route. Class 8 is qualified by Sweep P1; class 9 is reflected in the grade limits. Existing numeric tests rerun but add no lane-local number policy. Class 12 remains S1. Earlier standalone standing-mutation and independent type/number campaigns are historical evidence from round 7, not asserted to have rerun here.

## Sweep and integration items

- **Sweep S1 — timestamp grammar.** `scripts/pm-runtime-artifact-event-drafts.py:296` (`FormatChecker()`), pinned dependencies, EventRecord/receipt/checkpoint/runtime-artifact date-time fields. The pinned environment can silently skip date-time checks. Adopt the existing Contracts_V0 UTC Z grammar with range/calendar/leap/fraction controls at current write boundaries, preserving authenticated historical recipes. Review cycle 7’s `format-probes.json` records 342 wrongly accepted malformed-date route trials and exact schema pointers. No timestamp rule is changed in this fix.
- **Sweep P1 — shared check-11 machinery.** Adopt `scripts/pm_guard_isolation.py` from `plans/ea-guardtool-20261105`. Replace inherited whole-condition/keyword cuts and any removal sets merging distinct predicates. Inventory assertions and prove duplicate predicates site by site: each site removed alone must leave the same defect refused; all sites removed must flip it. Existing examples include O03’s combined schema/value test and compound D/C rules. In particular, D01 removes the entire EventRecord validation, so its cut also removes the current candidate's N01 number predicate; such cross flips are an overbroad proof cut and are not fixed by merging predicate ownership. The O12 legacy forced-dispatch witness is diagnostic only and also needs the shared recipe-dispatch adapter. No local proof-tool rebuild is attempted. The original event/custody/receipt authenticators remain fixed in the event-forgery negative; they are verification truth, not regenerated observations of the tampered event. The new fixtures each carry a single defect and product guards retain refusal coverage.
- **Sweep N2 — shared number/recipe rule.** Adopt CV-1100 / SP-1100 / SP-1101 in the cross-lane sweep, including authenticated full shared write-time recipe dispatch. This fix only uses this lane’s existing supported historical profile. It adds no number cap, serializer, physical float normalization, signed-zero erasure or recipe inferred from untrusted data.
- **Integration N1.** The original index validator exits 1/top-level fail with 23 failures: 21 existing removal-ledger-format failures, DL-302 absent against origin/main, and a stale generated Plans/.plan_index/node_readiness_report.json. The currentness edition was freshly copied before validation. These are reported for integration; no generated readiness/governance artifact is refreshed in this fix. No unrelated owner prose or removal-ledger changes are made.

## Authority and scope

No Plans path changes from the reviewed head: RAP-113, SP-533, CV-533 and ATS-260 already require this boundary. All schemas, fixtures, frozen originals, registry files, generated shards/indexes and governance artifacts remain byte-identical. Canonical Markdown was not edited, so regeneration is unnecessary. Fifteen latest shared-currentness files were copied into the ignored audit path and hash-verified. The original shard and schema checks and index validation have their actual outcomes in `DR.checks.json`.

No new owner decision, technical binding or Decision Log premise is applied. Existing DL-045/DL-075/DL-270, source/body policies, SP-278/SP-286/CV-339 and SP-337 remain as reviewed. Native source authentication/issuance, writer fences, crash/sync/CAS, backup/restore and UI stay NOT_RUN; readiness remains `blocked_runtime_certification_incomplete`.

**IDs used: zero new.** Existing RAP-100..118 / SP-520..538 / CV-520..538 / ATS-260 remain 58 IDs. No admission, registry append, Decision Log entry, governance seal, mailbox use, subagent, landing lock or main push.

## Evidence

All paths below are under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix8/`. `commands.json`, `guards-command.json` and `memory.json` retain commands, outcomes, durations and resource samples. Memory is checked before each family and guard: below 6 GB pauses; recheck every two minutes, resume at 7 GB, stop only after 45 continuous minutes below 6 GB. Disk started at 478 GB available. The sparse local worktree and temporary environment are removed after pushing; external `cleanup.json` records the result.

| Evidence file | SHA-256 |
|---|---|
| `historical-predecessors.json` | `0b64d00ac2d761d290d113974fd4910902890c26562a1cb3690ba6927ce0961c` |
| `full-checker.json` | `cfe9b50d938cb7c5a0ac98ead7949a4c3978d79b20ac25ba15d200096f887572` |
| `complete-guard-removal.json` | `f797d8ea8cb5b62bcaaa8da29b5364f63a945f3a2fea578ae6e45099255fb135` |
| `raw-guard-proof.json` | `32c0a4eb7d374eec62e20bd45ddcfd85b5f613ce7e089db45703a4c93d701285` |
| `runtime-schemas.json` | `644397af6ef28a0670e25d638f1ac2330eb21945b5ae1ede14bd9be4671acea0` |
| `shard-check.json` | `10cde07211161ba5007ce9acf94b977462852fb760eea82736b42c96996d0c85` |
| `index-validate.json` | `5154ced4139d3823cd4d38fba7e1c3efc14a165b4ec0f35d9684180069600b44` |
| `currentness-copy.json` | `1ae1029adda6c6dc268dcad2cf216b132b6d94cbb55d4242de3502be46acea6e` |
| `legacy-guard-partial.json` | `260d3aff63e3e91631307b17ae7a6a993c8192300e56e897750e4159d434824b` |
| `scope-audit.json` | `b522c55c0a324f66e8a1b342e219243cdfaf75083d9759f9a78baca7dcf97f2a` |
