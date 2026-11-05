# DF — sweep part 1, 2026-11-05

Implementation head: `ef27813b0cd3d851f586729eddf94aef434f2fdd` on `plans/ea-w2-filesafe-20261104`. Rebased the 21 lane commits from `a10cfa6d834fad8984285510dd8abd438b893ff6` onto fetched main `e42ce235b4711325ced818c777f070c3ee0d7952` before editing. The shared clone's origin/main may advance while other workers fetch; this report's base is pinned. Generated conflicts were deferred and regenerated, never hand-merged. All pre-existing main owner prose is preserved as an exact prefix of the three shared owner docs.

**NOT_READY — part 2 remains required.** R7-B1, R7-B2 and S6 are fixed; deck-2 items 2.a–2.e are applied exactly. This is preparation without admission: every membership cell is ABSENT and native execution is NOT_RUN. S1–S5 remain open. Deck 3 Card 7 remains with Jared; application-scope FileSafe security-event retention is unchanged.

## Sweep part 1: findings and responses

| Item | Response / implementation commit | Current location | How to verify |
|---|---|---|---|
| R7-B1 | **Fixed** (`ad9b9c63b92c1ac8a5d3cedf512558783e6b2ff5`): both safe-point histories now use DL-401 G28 Run year, not a pending classification. | Plans/storage-plan.md:30066; Plans/storage-plan.md:30134; own two source graphs; scripts/pm_filesafe_event_authority.py:147 | Both own authority CLIs; 72 run-year cases through graph checks; `focused-probes.py` rejects each wrong policy and wrong decision ref. |
| R7-B2 | **Fixed** (`ad9b9c63b92c1ac8a5d3cedf512558783e6b2ff5`): 12 new controls independently exercise Project-count-only and disk-only refusal/eligible expiry in the three seven-year suites. | `Plans/filesafe_event_retention_fixtures.json:357,383,1468,1494,1873,1899` own independent cases; scripts/pm_filesafe_retention.py:53 | Complete authority CLIs; bounded clause-only probes remove exactly one OR operand. Only its two new cases fail per family; the peer remains enabled. Existing compound full cases stay as combination controls. |
| S6 | **Fixed** (`ad9b9c63b92c1ac8a5d3cedf512558783e6b2ff5`), final year-zero coverage at `ef27813b0cd3d851f586729eddf94aef434f2fdd`: date-time support is always supplied locally to every DF validator, independently of optional FormatChecker packages. | scripts/pm_filesafe_schema_graph.py:20; scripts/pm_filesafe_schema_graph.py:43; both checker entry points and original-body/issued validators | All-nine full checkers, 24 grammar cases, coherent materialization/issued negatives, nine exact review witnesses, absent-global-handler controls and format-only cuts in `focused-probes.json`. |
| N1 | **Resolved by rebase/regeneration** (`ad9b9c63b92c1ac8a5d3cedf512558783e6b2ff5`), no unrelated ledger repair. | `index-validate.stdout`, top-level `pass` | Index validation exits 0 with no failures; the old cycle-7 errors are absent on the rebased tree. Part-1 work changes no PlanUnit-removal ledger or Decision Log. |

Bounded capacity and format cuts are evidence for the repaired fixtures, not new proof machinery. `scripts/pm_filesafe_guard_isolation.py` and the old historical `DF.guard-removal.json` remain unchanged. No guard-table refactor, new numeric helper, serializer or cap was authored.

## Landed decision premises and deck-2 verification

DL-401 is present on the rebased main. Its G28 cell says: **“The 2 restore-point records: Run year.”** Its Run year legend says: **“One year after the run finishes.”** Limits: **“1,000,000 per run and 5,000,000 per project, then the history continues in a linked successor. Needs a real run.”** Citation: Plans/Decision_Log.md:4414, Plans/Decision_Log.md:4493; original RT-G28 rows 288–289 in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/RT/RETENTION.jsonl` (SHA-256 `6b0e330f45f80b304488d3e3ba0bfaf362cf00f9eb86efae8903de6d46032bca`) identify `safe_point.created` and `safe_point.restored`.

Current CV-557/558, closed payload/source roots and F2-213 still require the real capture/use run. The two own SP units and graphs now select the existing exact `RP-RUNTIME-365D` object: run completion + 31,536,000 seconds, no expiry anchor while running, independent run and applicable Project counts, linked successor, existing holds/recovery/latest-25-run/live-reference/backup protections. A real application run gets no fabricated Project count. Released safe-point files keep their existing policy; original snapshot bodies and restore journals are separate. Registered Chat `restore_point.*` histories are separate families. No classification question remains for either safe-point event.

The five deck-2 bindings were already authored in `6f75d3d2d3039c83fec8e8b784e723bcfe5b500c` (replayed during this rebase), and are verified/applied at `ef27813b0cd3d851f586729eddf94aef434f2fdd`. Own SP citations now point to the landed Decision Log; dependency/source-lineage metadata names the actual decision. No option was extended.

| Deck item | Family | Landed answer / exact chosen policy | Verification result |
|---|---|---|---|
| 2.a | `filesafe.command_denied` | Plans/Decision_Log.md:4880; `RP-OPERATIONAL-2555D` | **Fixed/applied** (`ad9b9c63b92c1ac8a5d3cedf512558783e6b2ff5`); Plans/storage-plan.md:29592; own graph and full retention suite. |
| 2.b | `filesafe.destructive_override_denied` | Plans/Decision_Log.md:4906; `RP-AUTHORITY-INDEFINITE` | **Fixed/applied** (`ad9b9c63b92c1ac8a5d3cedf512558783e6b2ff5`); Plans/storage-plan.md:29660; own graph and full retention suite. |
| 2.c | `filesafe.destructive_override_requested` | Plans/Decision_Log.md:4932; `RP-AUTHORITY-INDEFINITE` | **Fixed/applied** (`ad9b9c63b92c1ac8a5d3cedf512558783e6b2ff5`); Plans/storage-plan.md:29795; own graph and full retention suite. |
| 2.d | `filesafe.guard_init_failed` | Plans/Decision_Log.md:4958; `RP-OPERATIONAL-2555D` | **Fixed/applied** (`ad9b9c63b92c1ac8a5d3cedf512558783e6b2ff5`); Plans/storage-plan.md:29863; own graph and full retention suite. |
| 2.e | `filesafe.path_denied` | Plans/Decision_Log.md:4984; `RP-OPERATIONAL-2555D` | **Fixed/applied** (`ad9b9c63b92c1ac8a5d3cedf512558783e6b2ff5`); Plans/storage-plan.md:29931; own graph and full retention suite. |

Exact approved option-A text, quoted from each landed entry:

- **2.a / DL-422:** Keep this event about a command FileSafe refused as troubleshooting history for seven years under the limits above. It may disappear after expiry and protection checks; the original approval or action result keeps its own lifetime.
- **2.b / DL-423:** Keep this event about a refused destructive override as permanent proof of the request, refusal or failure. It never expires by age or count and survives deletion of the described file or chat. For Project entries, only explicit Delete Puppet Master project data removes it under existing protections; Remove project from list does not. You can inspect it after seven years unless that Project data has been explicitly deleted.
- **2.c / DL-424:** Keep this event about the request for a destructive override as permanent proof of the request, refusal or failure. It never expires by age or count and survives deletion of the described file or chat. For Project entries, only explicit Delete Puppet Master project data removes it under existing protections; Remove project from list does not. You can inspect it after seven years unless that Project data has been explicitly deleted.
- **2.d / DL-425:** Keep this event about FileSafe failing to initialize and refusing unsafe execution as troubleshooting history for seven years under the limits above. It may disappear after expiry and protection checks; the original approval or action result keeps its own lifetime.
- **2.e / DL-426:** Keep this event about FileSafe refusing a path as troubleshooting history for seven years under the limits above. It may disappear after expiry and protection checks; the original approval or action result keeps its own lifetime.

The common Card 2 conditions are also preserved. Seven-year Project history uses 2,555 days from the first durable save of the original refusal/startup failure; retry, recovery and reprocessing cannot reset it. Only expired entries free of investigation, live-reference, recovery and backup protection can compact; existing legal/recent-run/rollback/maintenance protections remain. Capacity with no eligible expiry refuses new entries. Permanent proof has no age/count expiry, survives the described file/chat, and is removed only by authorized explicit Delete Puppet Master project data under existing protections; Remove project from list retains it. Full storage refuses new records. Supporting approvals, original action results, snapshots, journals and recovery logs keep their own policies. The adopted exact policy objects are unchanged from main.

Card 2 explicitly grants **no counting or deletion rule for future entries outside Projects**. All five application graph bindings, release barriers and pending-refusal fixtures are preserved. The application-retention clauses in SP-550/551/553/554/555 are unchanged. Exact questions remain with Jared, under deck 3 Card 7:

- **SP-550 / DL-422:** What counting scope, capacity/overflow behavior and deletion/protection rules govern application-scoped `filesafe.command_denied` history?
- **SP-551 / DL-423:** What counting scope, capacity/overflow behavior and deletion/protection rules govern application-scoped `filesafe.destructive_override_denied` history?
- **SP-553 / DL-424:** What counting scope, capacity/overflow behavior and deletion/protection rules govern application-scoped `filesafe.destructive_override_requested` history?
- **SP-554 / DL-425:** What counting scope, capacity/overflow behavior and deletion/protection rules govern application-scoped `filesafe.guard_init_failed` history?
- **SP-555 / DL-426:** What counting scope, capacity/overflow behavior and deletion/protection rules govern application-scoped `filesafe.path_denied` history?

## Format enforcement and input adoption

The selected resource closure uses only `date-time` formats. Both complete entry points and all body/retained-issued validators use an instance-local handler, with full-string ASCII RFC3339 grammar, integral calendar/time/offset range checks and no normalization. It preserves original strings, arbitrary fractional precision and valid offset/lowercase spellings. It rejects missing zones, malformed separators, invalid dates/time/offset fields, trailing LF, leap seconds (as the existing datetime consumers do) and empty/comma fractions. No optional handler absence silently admits a value. The nine cycle-7 malformed original-source witnesses now refuse.

New timestamp controls rebuild complete-value commitments, source copies, body bytes/manifests where relevant and independently retained issued copies. Removing only the date-time predicate makes each own negative pass; the enabled guard and missing optional global handler both refuse it. Full checkers include payload, materialization and issued controls. This is S6 enforcement of the declared format; authenticated original schema/recipe dispatch remains S4 for part 2, not a current-then-legacy fallback.

Main's `shared_integration_runtime.schema.json` changed three unrelated Settings copy-command wrappers and added their versioned/legacy definitions. Before updating the nine whole-resource selections, `shared-resource-adoption.json` compares every DF-reachable shared definition and verifies `WorkflowScopeV2` unchanged. No shared schema text, original Project resource, receipt policy or application rule was altered. This is explicit selection of the rebased input, not a governance hash refresh. All selected resource hashes then match their files and full eager reference checks still run.

## Family grades before and after

Before is the independent cycle-7 review, including its five C12 downgrades, not the overstated old self-grade. Counts are PASS / PARTIAL / ABSENT. C7 upgrades for both safe-point events; only the five application FileSafe contracts retain C7 PARTIAL. **C12 is conservatively PARTIAL for all nine until shared guard-table certification in part 2.** This accounts for the sweep readiness requirement; it does not claim a new regression in the four previously prepared families. Fixed R7-B1/B2/S6 controls pass, but no complete predicate inventory is certified. All nine remain NOT_READY_PART_2_PENDING.

| Exact family | Before | After | C7 after |
|---|---|---|---|
| `filesafe.command_denied` | 9 / 2 / 1 | 9 / 2 / 1 | PARTIAL |
| `filesafe.destructive_override_denied` | 10 / 1 / 1 | 9 / 2 / 1 | PARTIAL |
| `filesafe.destructive_override_granted` | 11 / 0 / 1 | 10 / 1 / 1 | PASS |
| `filesafe.destructive_override_requested` | 10 / 1 / 1 | 9 / 2 / 1 | PARTIAL |
| `filesafe.guard_init_failed` | 9 / 2 / 1 | 9 / 2 / 1 | PARTIAL |
| `filesafe.path_denied` | 9 / 2 / 1 | 9 / 2 / 1 | PARTIAL |
| `filesafe.policy_degraded` | 11 / 0 / 1 | 10 / 1 / 1 | PASS |
| `safe_point.created` | 9 / 2 / 1 | 10 / 1 / 1 | PASS |
| `safe_point.restored` | 9 / 2 / 1 | 10 / 1 / 1 | PASS |

All 108 cells are carried/reassessed against the implementation head; current exact citations and file/excerpt hashes are revalidated in `grade-citations.json`. Membership remains ABSENT; native execution remains NOT_RUN. Existing per-family CV/SP technical bindings, original-source search evidence and negative evidence remain in their own units. No new producer, consumer, checkpoint, event identity or native interface was invented.

## Checks and limits

All nine families ran sequentially, each through the full payload and authority CLI. Totals: `{'positive': 329, 'negative': 2728, 'identity': 18, 'protocol': 1323}`; every family CLI exits 0/status pass. Retention graph checks include 125 existing Card 2 cases, 12 independent capacity cases and 72 safe-point Run year cases. Focused probes: **1024**, status pass. The initial CLI harness expected two wrong-binding diagnostics, but the existing approved-policy probe correctly adds a third; the harness was corrected without a product edit. Both CLI layers retain failure-exit behavior; 20 part-1 false-outcome/valid-as-negative CLI results are retained separately. Their checker source is identical to the final source; the final follow-up adds only year-zero fixture coverage. Shard/index generation and shard check exit 0; regenerated shard sources are limited to this lane's Contracts, Storage and ATS owner documents. Fifteen ignored currentness inputs were copied from the shared checkout and hash-verified before generation.

Index validation exits **0**, top-level **pass**, with **zero failures**; exact output is retained in `index-validate.stdout`. N1 is resolved on the rebased tree without unrelated ledger edits. This does not claim repository-wide governance or native certification. No governance reseal, migration snapshot/baseline refresh or unrelated ledger repair was attempted. `git diff --check` and scope/preservation checks pass.

Standing checks 1–10 continue through the existing complete family suites: current replay-only refusal and retained compatibility, exact CV-366/encoded Project keys, full 16 KiB/SP-337 custody, LF identifiers, caller-semantic retry, full-value receipt/checkpoint identities, failure exit, eager reference closure and retained-history directions. Check 11 gets bounded independent capacity/format evidence here; its whole-lane inventory remains S5. Earlier selected-source exact-type and restore-journal negative repairs remain present and are not weakened. Recurring forged identity/source/body, Storage metadata, historical read, schema-reference, full-size and custody checks run through the full suites. Numeric spellings, semantic JCS, physical profiles and original-recipe/resource selection are explicitly unresolved as S1–S4; no claim of having ruled them out is made.

Resource policy: start disk 117 GB available; memory floor 6 GB, resume 7 GB. This lane runs one checker/generator process at a time under the memory floor. Initial peer-checker waits are retained; scoped family oracles were then measured at roughly 34–90 MB before proceeding serially alongside other workers. Peer process observations and the RAM floor are logged for repository-wide jobs. Minimum recorded available RAM: 9 GB. There are 0 low-memory pauses and 96 pre-start serialization/memory waits. Each heavy checker runs alone in this lane. No pm-mail, subagents, admission/registry append, Decision Log edit, protected governance change, landing lock or main push. Existing IDs only: CV/SP-550..558, ATS-275..279; no new allocation, 559 remains unused.

## Part 2 items

| Item | Exact remaining location | Required follow-up |
|---|---|---|
| S1 | `scripts/pm_filesafe_event_authority.py:36–37,684–689`, current raw loads and CV-550..558 integer paragraphs | Adopt CV-1100/1101 current raw-number grammar/decoder; preserve authentic original grammar. No lane cap or serializer. |
| S2 | `scripts/pm_filesafe_event_authority.py:450,480,574`; inherited `scripts/pm-implementation-readiness.py:2773,3280`; `scripts/pm_filesafe_event_contracts.py:51` | Adopt qualified semantic JCS for its existing purpose; preserve distinct CV-366 typed source/string identity recipes. |
| S3 | `scripts/pm_filesafe_event_authority.py:47–52,162–203`, full commitment/application decoder and inherited physical codec | Adopt SP-1100 purpose/profile dispatch; preserve physical floats, signed zero and retained bytes. |
| S4 | `scripts/pm_filesafe_event_authority.py:107–113,458–490` plus original decoder/selected source/history paths | Adopt SP-1101's independently authenticated immutable original recipe/resource tuple; no downgrade, current-then-legacy or restamping. S6 does not close this. |
| S5 | `scripts/pm_filesafe_guard_isolation.py` (stale lookup around line 1103), `reports/event-authority-20261104/DF.guard-removal.json` | Adopt shared `scripts/pm_guard_isolation.py` and named guard tables. Slice each predicate; prove genuine duplicate sites individually/jointly. The old KeyError/whole-keyword/merged-predicate machinery is not rebuilt. |

No lane READY claim is made until both shared tools are adopted and the required Sol/Astra part-2 review passes. Native custody, fsync, restore execution, access/hold enforcement and CAS remain NOT_RUN; actual registry admission is a later integration task. Application FileSafe retention stays with Jared.

## Retained evidence

All paths below are under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/sweep-p1/`. Raw evidence is outside product canon; only compact report/grades are committed. SHA-256 identifies each cited input/result.

| File | SHA-256 |
|---|---|
| `family-checks.json` | `eeaedcc780ac7c28fecc47dab2eca49b93b4428008cfe0ee29883296af227a35` |
| `focused-probes.json` | `1038b0da1d54b7161c64d2b92e3f693f0a97b9736a6d71082ed9e2499eed7d90` |
| `cli-controls.json` | `3f5fa5c654cfac5280beb2ee41a074316ca1e0e2dd918b4facd860d817d15598` |
| `shared-resource-adoption.json` | `46acb77d86ebdf9f42e01adc7fd43a9fd7bd1eeb2fd63f2f8dffb1fa963b3f85` |
| `scope-check.json` | `e4f50080b1903ec1e5714314358128b0fa9c33b31e36c8154f577b88cd2a730e` |
| `currentness-sha256.json` | `b72623c6887c9cb3b53eb0da0baf1e1b8c0b5d46fe116d4f25746361bbe73b8b` |
| `grade-citations.json` | `0e848c77da8ebcc6e209bafb88aec0e5ca406406bccb81cbe2fabc8c93506f16` |
| `shard-check.stdout` | `a715ce384c99d89a8b5576fb6a07f92786372746197d08d9bad57c619fec35c1` |
| `index-validate.stdout` | `9d0fe5a50f38ae8504877cf3fd9742fece9299af3546215ab960400e637886b5` |
| `memory-monitor.jsonl` | `61275bb95bcb0feb152a3c9298eaf462cf8b6bb13ebe50c1ba2372ecfae0b5b2` |

The report, aggregate grade and nine per-family grades are copied into this sweep-p1 directory. The sparse detached worktree `/home/sittingmongoose/pm-worktrees/df-sweep1` is removed with literal-path `git worktree remove --force` after pushing the final report commit. No temporary server or browser was started.
