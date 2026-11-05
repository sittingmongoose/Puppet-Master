# DCW — fix round 9, Event Authority

Branch `plans/ea-w2-chain-wizard-20261104`; implementation `0f0a41de7ff79a1d9c097284a514138abc899ae6`; final focused controls `a6e652c86c3df3f93efa6530cf6a93b48a49028d`; reviewed head `92276eeff0c6ef8a7f3bd3946a1fdd786567ff8d`. Scope B1. All six B1 family repairs pass. Membership ABSENT, retention PARTIAL and native NOT_RUN remain. Full technical prepared PASS is withheld while B2/B3 sweep evidence is incomplete; both held Wizard families remain held.

## Review round 9: findings and responses

- **B1 — fixed (0f0a41de7ff79a1d9c097284a514138abc899ae6; controls a6e652c86c3df3f93efa6530cf6a93b48a49028d). Where:** `scripts/pm_dcw_event_oracles.py:804–807` called an embedded `payload_schema` on the ordinary registered `run.started` row. **Why:** the registry's actual contract is `payload_schema_ref.path/json_pointer/schema_id`; complete global captures necessarily contain nonmatching families and Projects. **Fix:** `scripts/pm_dcw_registered_schemas.py:108` resolves that exact path and RFC6901 pointer, checks both registered and selected schema IDs, validates with the offline resource registry, and eagerly checks the full closure at `:77`, including unused definitions in external documents. Exact scope/ID editions are selected from registry metadata; the seven owner-supported historical pointers are explicitly bound to Storage's existing v1-reader table (`Plans/storage-plan.md:18130–18144`). No lexical version fallback or arbitrary `$defs` discovery grants support. The generic scan preserves and validates originals; it does not emit a transient run-start consumer view or run its upgrader. The run-start-specific consumer retains its separate upgrade obligations (`:19831`). All captured records remain in coverage and row/source joins; no skip or registry field was added.
- **B2 — sweep, unmodified by instruction. Where:** `scripts/pm_dcw_event_oracles.py:688–709`, its format uses at `:45–52`, `:205`, `:801`, and round-8 positives `scripts/pm_dcw_index_cases.py:164–172`. **Why:** non-Z persisted offsets pass despite CV-253 (`Plans/Contracts_V0.md:2895,15894–15906`); the valid `1990-12-31T23:59:60Z` fails, including retained originals. **Fix owner:** adopt shared CV-1101 on `plans/ea-numrule-20261105`; preserve exact original strings, permitted fractions and historical dispatch. No local timestamp grammar, cap, uppercase-T rule or historical normalizer was added. The independent replay retains the offset/leap-second observations; they are not credited as fixes.
- **B3 — sweep, unmodified proof machinery by instruction. Where:** `scripts/pm_dcw_index_cases.py:46–53`, `scripts/pm_dcw_event_isolation.py:497–526`, and the old guard table. **Why:** row/source equality and row-set digest integrity are different fields/predicates; a common refusal code or compound enforcement site does not make them duplicates. **Fix owner:** adopt `scripts/pm_guard_isolation.py` from `plans/ea-guardtool-20261105`. The report/table now withdraw the old complete check-11 claim. No proof script is rebuilt or re-run. New B1 baseline negatives and single-fact repairs exercise the full checker. Diagnostic cuts in the focused runner include a shared-code dispatch selector; neither those cuts nor the old script receive predicate-isolation credit. Shared-tool adoption also replaces that diagnostic selector; no whole-lane inventory is claimed. Existing round-8 unrehashed stress cases are not credited as isolated proof. Their coherent rehashed variants remain the source-join witnesses. Any fixture masking exposed during shared-tool adoption must be repaired, not relabelled a duplicate.
- **SW-N1 — number-domain sweep. Where:** `scripts/pm_dcw_event_oracles.py:97–132,147–149,628–661,796,818–820`; `Plans/event_record.schema.json:94–100,200–205`, shared receipt/checkpoint and lane source/payload numeric positions. Adopt CV-1100/SP-1100/SP-1101 at each actual semantic, physical and authenticated historical recipe boundary. The independent replay records `1`, `1.0`, `1e0`, `-0`, `01` and wide integers. No new cap/serializer was added. Preserve full uint64 Storage metadata, physical floats and signed zero. This is nonblocking sweep work, not a local type-equality exemption.

## Mixed-source positives and isolated new negatives

`scripts/pm_dcw_registered_cases.py:33` imports the genuine `run.started@2.0.0` original from `Plans/event_index_consumer_adoption_fixtures.json#/positive/both_full_owner_joins/generic/current_source/frames`. Only its synthetic Storage-order sequence is placed immediately after the DCW originals. Its payload, original identity, Project and timestamps stay exact. Both Projects use their encoded `project~` partitions. Complete source bytes, rows, manifest/anchor/frontier, transactions and tokens are issued coherently before each mutation.

**18/18 genuine v2 positives accept**: six families × read/rebuild/compatibility_read. **18/18 separate synthetic v1 original-reader positives accept** through the exact owner-supported pointer; they claim no native historical admission or v2 upgrade. **90/90 new event negatives refuse**: wrong schema ID, unsupported version ID, wrong payload version, extra current payload property and extra historical payload property, on all three paths for all six families. Each changes one fact and reissues dependent capture bindings.

The focused runner adds **342 full-CLI reference/closure observations**: 90 positives (a real external schema closure, an escaped non-root pointer, a definition carrying `properties.schema_id.const`, an array pointer and exact scope-edition selection), plus 252 expected refusals (reference schema ID, path, missing/malformed-prefix pointer, foreign scope edition, malformed pointer escape with an otherwise present target, selected `$id`/schema-ID constant, signed/leading-zero array indices, unused local/external references, a transitive unused reference and actual external-target validation). **252 single-fact repair controls accept**; 54 unused-reference closure-cut controls accept. The dispatch/version/additional-property diagnostic cuts are retained as observations only, with zero check-11 proof credit; B3 governs predicate isolation. Overall focused evidence: **1278 outcomes**, all matched. The full CLI is fixture-selected for these input perturbations; no product semantic guard, preflight or native obligation is bypassed in its negative runs.

The six adapted independent reviewer programs additionally reproduce **18/18 B1 current registered-source accepts**, zero unmatched expectations, all previous identity/custody/byte-boundary counterexamples, and the unchanged B2/B3 observations. Counts overlap the family suites and are not independent native campaigns.

## Family grades before and after

Before is the cycle-9 independent re-grade, not the superseded fix8 self-grade. After restores only `consumers_checkpoints` for B1. `compatibility_withdrawal` remains PARTIAL for B2; `positive_negative_oracles` remains PARTIAL for B2/B3. Retention is still PARTIAL and membership ABSENT. All other normative cells retain their current supported grade.

| Family | Before cycle 9 | After round 9 | Full / total static cases |
|---|---|---|---:|
| `bundle.revision_requested` | 7 PASS / 4 PARTIAL / 1 ABSENT | 8 PASS / 3 PARTIAL / 1 ABSENT | 785 / 822 |
| `bundle.revision_started` | 7 PASS / 4 PARTIAL / 1 ABSENT | 8 PASS / 3 PARTIAL / 1 ABSENT | 790 / 838 |
| `bundle.revision_completed` | 7 PASS / 4 PARTIAL / 1 ABSENT | 8 PASS / 3 PARTIAL / 1 ABSENT | 791 / 838 |
| `bundle.revision_interrupted` | 7 PASS / 4 PARTIAL / 1 ABSENT | 8 PASS / 3 PARTIAL / 1 ABSENT | 789 / 836 |
| `wizard.deferred_payload.loaded` | 7 PASS / 4 PARTIAL / 1 ABSENT | 8 PASS / 3 PARTIAL / 1 ABSENT | 1339 / 1339 |
| `wizard.opened` | 7 PASS / 4 PARTIAL / 1 ABSENT | 8 PASS / 3 PARTIAL / 1 ABSENT | 801 / 801 |
| `wizard.blocked` | 6 PARTIAL / 6 ABSENT | unchanged; held for Jared | not run |
| `wizard.unblocked` | 6 PARTIAL / 6 ABSENT | unchanged; held for Jared | not run |

All 96 cells are retained in the self-grade; **304 exact current quotations** are rechecked at their cited line spans. No all-criteria prepared PASS, admission or native execution is inferred from static success.

## Checks and limits

| Check | Exit/result |
|---|---|
| Six sequential full family CLIs | 0 each; 5295 full / 5474 total cases |
| Six sequential standing suites | 0 each; authored 66/66 cells remain subject to the independent B2/B3 overrides |
| Six final focused registered-schema suites | 0 each; 1278 matched outcomes |
| Six independent reviewer replays | 0 each; 2052 recorded outcomes; zero unmatched |
| Storage recovery self-test | 0; top-level pass |
| Shard check | 0; top-level pass |
| Plan index validate | fail; 23 diagnostics; no clean-index claim |
| Quotation/preservation/diff checks | pass; canon, schemas, fixtures and all previous cases unchanged |

The index readiness diagnostic raised in cycle 9 remains an integration item. The ignored currentness edition was copied and hash-matched; no index generation, governance repair or baseline change is used to excuse the diagnostic. This lane does not land. The grade and report carry the limitation.

Standing checks 1–6 and 8 retain their full serial regressions. Check 7 now includes the actual registered mixed source; check 9 includes selected schemas' full reference closure. Check 10 retains its B2 qualification and check 11 its B3 qualification. Prior claims of 146 sites/4,656 negatives/906,471 comparisons are historical, superseded proof claims. Recurring forged identity, assigned metadata, contradictory joins, multiple readings, unused references, complete stored-value sizes, custody and wrong-type regressions are retained and rerun. Number spellings/history recipes remain SW-N1. Formats remain B2. The new single-defect fixtures and focused controls do not certify the old proof inventory.

Synthetic source adapters, CURRENT/manifest codecs, frame CRC, real redb snapshots/CAS/fences and native authentication remain NOT_RUN. Unsupported versions refuse complete coverage; supported nonmatching records are never dropped. No history read performs a writer effect.

## Holds, authority and IDs

**wizard.blocked:** Jared still must identify the actual current PlanningRun/topic subject and blocked/remediation emission predicate, including the source of `round_count` (CV-233, `Contracts_V0.md:14896`; `Planning_Wizard.md:116`; `assistant-chat-design.md:3524`). **wizard.unblocked:** for that same episode, Jared must identify the matching authorized resolution boundary and its `resolution_source`/causality mapping (CV-234, `Contracts_V0.md:14944`). Answers remain PENDING. No three-round threshold or retired wizard-status lifecycle is revived.

DL-045/current owner, SP-278/DL-076 and SP-286/CV-339 premises remain unchanged. Initial per-family search lineage is in `drafts/DCW/base-family-search.json` and `fix1-wizard-search.json`; this fix authors no producer, consumer, checkpoint or other product binding. Existing IDs only: **CV-590–595, SP-575–579, ACD-571–574, PWIZ-097/098 (17); no new PlanUnit IDs.** `round9_*` names identify fixture cases only.

No owner Markdown/schema/registry/fixture, Decision Log, admission, Spec Lock, generated shards/index/evidence, frozen validator, test file or .gitignore was changed. Owner Markdown was unchanged, so no derived regeneration was required. No mailbox, subagent, browser, server, main push, landing lock or reseal. Disk was 60 GB free and memory 16 GB available before worktree creation; checker starts and pauses are recorded in commands.json. All checkers ran serially. Push only the assigned branch; remove `/home/sittingmongoose/pm-worktrees/DCW-fix9` with a literal-path worktree removal after the final push.

## Review lineage and evidence

Round 8's report and self-grade remain in git at `92276eeff0c6ef8a7f3bd3946a1fdd786567ff8d` and externally in `drafts/DCW/fix8/`. Its guard claims are superseded by cycle 9 and this report. Round 9 raw evidence is outside the repository at `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/fix9`; all final files are bound by SHA256SUMS. Adapted reviewer code changes only ROOT and output location.

| Evidence under fix9/ | SHA-256 |
|---|---|
| `commands.json` | `6cdb77c3f37ecf79e2a3ae5a8b345ba93a0ae6873163a2fda458852e94eb41b0` |
| `summary.json` | `d90760a074f37049fb7256d8d123696a5f8c131ccb5d1cb4ed3f39592c26e945` |
| `source-closure.json` | `9ab2140956289b390a845daf1180852c8023633beba67523525e6f1a5bf3c74c` |
| `regrade-citations.json` | `e76c6366d3a98f9e3ed16599159604a01e379b2b7f700cdf6316124633bca198` |
| `currentness-sha256.json` | `ce7bebfff8362953a3ebb92fba9e37235d771ca442f282a4ac1d40d9644a69ab` |
| `index-comparison.json` | `87989a1469468331a7ab8fc6ccdfb0b770594bd47d6d01939ab96ecbeb39189f` |
| `index-validate.log` | `118696124108a2f4bdff1d08084c421a1a985517d35c2f401e418a66a308990e` |
| `shard-check.log` | `353b434b8f99c23e82801aee68941ecef36e9fc71638a6bce463523cd6b01ade` |
| `storage-check.log` | `e56e543c18588569abd7a299f25004750f6954e919c5571c6a669b38668eca1a` |
| `preservation.json` | `a2e59fb79dc526b88c3de14be164f4acafb0590c8eb305e71213bdfeaf2d38d6` |
