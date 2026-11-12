# DF — sweep parts 1, 2A and 2B, 2026-11-11

Sweep part 1 below is the 2026-11-05 record at its implementation head
`ef27813b0cd3d851f586729eddf94aef434f2fdd`, retained unchanged. Sweep part 2A
and part 2B numbers are the record through
`8ba3cc12e8b7112d3e855a66d51f8e761893f491`. Part 2B date-time adoption is
`b1dc935fe09ae15163cad080fa393683656d52a7` on `plans/ea-w2-filesafe-20261104`,
after the clean merge `78910a98bc2e311950c982c858008f3fd5417785` of gated
NUMRULE head `58c2816ff33365384d4039553f5efdb5370930e6`.

**NOT_READY_REVIEW_PENDING.** Timestamp fields this lane validates are checked
by the shared `date_time` predicate: the EventRecord profile for schema
`format: date-time`, and `storage_utc_z` for Storage-assigned `observed_at_utc`
and `persisted_at_utc`. `datetime_validator` and the inventory gate run at
batch-2 integration. The gated guard tool proves 354/403 rows (174 PASS, 0 FAIL).
C12 stays PARTIAL because each schema occurrence is one structural row and
because that gate is not run in this lane tree. Membership stays ABSENT, native
execution stays NOT_RUN, deck 3 Card 7 stays with Jared, and the Sol/Astra
part-2 review is still pending.

Part-1 implementation head: `ef27813b0cd3d851f586729eddf94aef434f2fdd`. Rebased the 21 lane commits from `a10cfa6d834fad8984285510dd8abd438b893ff6` onto fetched main `e42ce235b4711325ced818c777f070c3ee0d7952` before editing. The shared clone's origin/main may advance while other workers fetch; that report's base is pinned. Generated conflicts were deferred and regenerated, never hand-merged.

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

## Sweep part 2A — guard tables on the gated shared tool

The gated tool is adopted exactly: merge `167253b8f36393be72361da9051f318b37db3e0d`
(parents the part-1 head `f7b88ca1033707205109e58f965f61ddbf475271` and gated
`004bdedd632d9463f3535190a6ed5772338cdce1` exactly). `git diff` from that merge
to the implementation head over the tool's files is empty;
`scripts/pm_guard_isolation.py` at the certified run has SHA-256
`e8038992eabbe067c8bcba8d48824b97fbb6b5b7e69cbfe28a669f939a96c0b8`.

Restructure commit `47402a02739257c960a66faf1b992648df44c459` rewrote every
refusal of both checkers as a named row of a generated guard table
(`scripts/pm-filesafe-table-generate.py`, registry `scripts/pm_filesafe_tables.py`
with `table_order_errors()` keeping checker evaluation order and index order in
agreement), added the observation recorder and suite builder
(`scripts/pm_filesafe_guard_suites.py`), the runner
(`scripts/pm-filesafe-guard-tables.py`) and the coherent one-defect witnesses
(`Plans/filesafe_event_p2a_cases.json`, builder `scripts/pm-filesafe-p2a-cases.py`;
1,081 cases at the final head). A three-point outcome differential over the
4,629 pre-existing witnesses records: original checkers → 2A restructure = 191
changes (129 duplicate-code collapses from per-phase distinct codes, 62 from the
authenticated custody catalogue added with SP-1101); 2A → final (number pass,
crash fixes, witness/adapter work and the follower splits below) =
**4,629/4,629 identical, 0 changes**, reproduced at the final head.

Two defects found while finishing this pass, both fixed in lane code only:
(1) the suite adapter still passed the pre-number facts shape to
`contract_payload_schema`, so every contract witness raised `KeyError:
'slot_type'` in collection and recorded nothing (369 untracked); the adapter now
uses `payload_validator` + `schema_facts` exactly as the contracts CLI does, and
each family's first positive also runs through `materialization_raw_failures`,
giving `current_raw_json` the passing control it lacked
(`2466c6d0ddba732c140fb971fe2c8dd10a2f0001`). (2) Thirteen rows had no
single-row negative although they can refuse first; coherent witnesses now
prove them: IS01/IS02 (issued shape), AM04 (manifest SCM worktree),
CS03–CS05 (SCM-absent worktree fields), AS01–AS03 (symlink/non-file payloads),
BD03 (protocol read_body result), PJ03/FV02/DD04 (other-reason rows; below)
(`58a4e44db11b85d9abd5ed1578617e893d8ff4a5`, `50f21167ef7cb2a0676310cea3320b69af73d31c`).
Four entailed rows (PJ03 before it was witnessed, DJ03, FV02, CS02) first sat in
mixed tables whose eight proved neighbours lost table-level credit; each
entailed row now sits in its own follower phase evaluated immediately after its
phase from the same observation (`pm_filesafe_tables.FOLLOWERS`), 204 tables /
405 rows total (`4fdb836ec0c7e64b778a7bd2320b8f73a45456ef`). PJ03, FV02 and DD04
were then themselves witnessed, so three of those follower tables also PASS.

Final collection and tool run (collection 550 s, tool 936 s, serial): 5,716
witnesses replayed (285 control / 3,709 negative / 1,722 model); 4,356 distinct
control observations, 1,186 distinct negatives (4,693 aliases); lane matrix **0**
problems in 204 suites; collection findings **7**, all two-row observations
(SM03/SM04 one manifest-digest fact recorded in two fields, HJ01/HJ02 one
hold-list equality in two copies ×5, OO01/OO02 one operation list) naming no
target and earning no credit. The tool ran 174 tables: **174 PASS, 0 FAIL,
356/405 rows proved, 23,356 evaluations** (1,186 negatives ×tables as collected,
1,467 chosen controls, cap 40 per table), cuts **1,186 flips / 2,173 stays / 0
unrelated / 0 masked**. The lane's complete-boundary flips (cut one row, re-run
the whole witness): 1,664 accepted, 2,038 refused later by an independent row
watching the same source fact. Runner exit 1 is the expected unproved/two-row
signal; `bad` is 0.

| Checker part | Tables run/passed | Rows | Proved | Negatives | Tool controls | Evaluations | Flips/stays/unrelated |
|---|---:|---:|---:|---:|---:|---:|---|
| Schema graph, payload contracts, identity | 20/20 of 24 | 55 | 43 | 86 | 177 | 1,973 | 86/123/0 |
| Source graph, retention binding, census | 25/25 | 40 | 40 | 158 | 146 | 2,008 | 158/160/0 |
| Materialization (SP-337, producer, full value) | 39/39 of 48 | 92 | 80 | 524 | 547 | 10,044 | 524/1,226/0 |
| Application original (safe points) | 46/46 of 60 | 147 | 125 | 149 | 311 | 5,674 | 149/382/0 |
| Issued and retained (SP-1101 dispatch) | 10/10 of 11 | 20 | 19 | 155 | 156 | 2,345 | 155/228/0 |
| Protocol oracle | 34/34 of 36 | 51 | 49 | 114 | 130 | 1,312 | 114/54/0 |

(Corrected in fix round 1: the OS01 and MK03 rows of the table below are reachable and now witnessed; see "Fix round 1 after the Opus recheck".)
49 rows in 30 tables have no negative and earn no credit. Each sits in a table
with no proved row; the reason (every input it would refuse is refused first, or
the two sides are computed identically) is:

| Rows | Why no input can refuse there first |
|---|---|
| CI02–CI04 (identity selfcheck) | Both event ids are recomputed by the same df-event-v2 call inside the checker; they can only be observed agreeing. |
| MO03, BD02 (source/body commitment) | The selected-source commitment and the exact selected join are computed on the same value immediately before. |
| MG01 (grant expiry) | PG01 refuses the same issued/expires window in payload semantics, evaluated first. |
| OS01 (override scope kind) | The grant scope kind is derived from the same payload scope value it is compared to. |
| SU01–SU02, SU06–SU11 (override subsets) | The requested-scope subset facts are decided by the override scope rows/semantics before the subset tables on every schema-admitted scope. |
| ME01, MX02, MD01, MJ02 | Envelope/effect/policy and SCM joins (AD01/MA01, MX01, SM09) refuse the same joined values first. |
| MK03–MK06, CS02 (worktree fields) | Payload worktree rows (PW01/PW02) and the owner joins refuse partial worktree presence first; with all fields present the sibling rows refuse the same observation together (CS02 probe: first refusal PW01). |
| AB01, AB03, AF08 (application body/entry) | A schema keyword of the preceding closed root validation refuses the same values first. |
| SP03/SP04, TR04/TR05 | The safe-point/transaction record schemas fix node/attempt to the result's null values; body schema precedes. |
| OK02/OK03, OQ02–OQ03, OQ06–OQ07, OQ09–OQ10, OQ13, OQ17 | Operation-record presence and outcome-state combinations unreachable on any schema-admitted seed; the outcome/state rows that can occur are proved. |
| JC03 (journal lease), MT11/IR08 (durability state), RB02 | Schema minimum/const keywords and the DL-401 retention decision binding precede in the root validations. |
| DJ03 (descriptor JCS other) | The descriptor schema admits only a blake3-hex id, a const media type and one integer slot; no other JCS refusal domain remains. |
| AJ01–AJ03 (manifest JCS) | Every manifest role is pinned to the RFC8785 body codec; a body that qualified RFC 8785 cannot encode is refused at `app_body_decode` before the manifest rows. |

## Sweep part 2B numbers (CV-1100, SP-1100, SP-1101)

The gated number scope is adopted exactly: merge
`19ad339c368834a8b32d64da40f5c47b5d7bb00b` (parents the tool merge and gated
`a16f67c1ef21796758f4209ff12c0f4d12b86ce9` exactly). `git diff` from that merge
to the implementation head over `scripts/pm_event_numbers*.py`,
`scripts/pm_event_datetime.py` and `Plans/event_number_recipe_corpus.json` is
empty; the date-time code is adopted nowhere in this lane (no import in any lane
file). Number adoption is at `ef2842284a04990ca02c58d2450e63857c86ffab` plus
`0c1e8a873a842cf9425c771f95b99489728f5332`:

- **Slots (CV-1100).** `SlotValidator` (`scripts/pm_filesafe_schema_graph.py`)
  records every schema-declared integer from the actual composed instance while
  the stock Draft 2020-12 checks run; `split_errors` admits each recorded slot
  once through the shared `current_integer` with the schema's own min/max (range
  stays with the schema), under `exact_integer_text` so schema-error rendering
  cannot crash on long integers. JSON Schema `1.0`/`1e0`/`-0.0` at an integer
  slot refuse; exact integers keep every prior byte. No blanket value walk and
  no lane ceiling.
- **Raw current ingress.** `materialization_raw_failures` parses raw candidate
  text only through `loads_current_json` (CR01–CR03 `current_raw_json`): `-0`,
  `01`, non-finite tokens and duplicate keys refuse before any commitment.
- **Qualified RFC 8785.** Payload canonical bytes and identity
  (`pm_filesafe_event_contracts.py:20-33`), the CV-317 producer digest and the
  CV-339 full-value commitment (`producer_semantic_digest`,
  `full_value_commitment`), descriptor and manifest JCS all route through the
  shared qualified call, split into binary64/decimal/other guard facts.
- **Physical profiles (SP-1100).** Full-value bytes use EVENT_VALUE, application
  bodies APP_PHYSICAL (`storage_value_bytes`/`decode_storage_value`); schema
  ranges are honoured as-is (EventRecord `sequence_id`/`producer_sequence_id`
  are `minimum: 0` with no maximum; the physical range refuses through FV01).
- **Retained dispatch (SP-1101).** `DFOriginalOwner` + `RetainedDispatcher`
  resolve retained originals only from Storage's sealed custody catalogue
  (`original_custody` in every authority bank: write-time edition, ordered
  resource manifest, local source-commitment profile, application body codecs);
  frozen verifiers recompute the local recipes, current guards never run on a
  retained original, and forged/downgraded custody resolves to no verifier.
- **Local recipes preserved.** df-event-v2 identity (four UTF-8 strings, no
  numbers), Project canonical-MessagePack source commitment and CV-366
  `accepted_source` are unchanged. The DIY scan's remaining hits are exactly
  these recipes, hash-of-bytes observations, fixture/schema/report loading, the
  recipe-pinned retained body decoder, and, at that head, the lane date-time grammar part 2B replaces.

Verification: `pm_event_numbers.py --self-test --scope numbers` passes
**580/580**. `scripts/pm-filesafe-number-corpus.py` (new) runs the 81
number-scope corpus values through the complete checkers — raw, producer-complete,
sequence-complete and payload-contract routes in all nine families, expectations
composed from the shared helpers alone: **2,148 route runs, 518 accepted, 1,630
refused, 0 disagreements, 0 untracked**. Three 4,400-digit integers run the same
routes plus a coherent writer-epoch materialization. That probe found a real
lane crash, now fixed (`ae6e4abee972fd45d477db8cbacbd845c6a6cfef`):
**Location** `mat_source_commitment` (and the protocol read_body commitment and
native Project record bytes). **Cause:** the Project canonical-MessagePack
recipe raised `ValueError: integer outside MessagePack range` out of
`materialization_failures` for a schema-admitted epoch beyond the MessagePack
range, instead of refusing through its row. **Fix:** `source_commitment_or_none`
yields None there, so MO03/BD02 and the project-original row refuse; encodable
inputs are byte-identical (differential 4,629/4,629 above). PJ03, FV02 and DD04
were likewise first listed as unreachable "other" rows and then witnessed: a
lone-surrogate `command_preview` (payload JCS other, contracts boundary), a
lone-surrogate `event_id` outside the CV-317 projection (EVENT_VALUE other,
issued boundary), and a coherent 2^64 sequence in every retained copy
(retained-dispatch other, via the SP-1101 owner's physical bytes).

**Timestamp review at the part 2A head (closed by Sweep part 2B).** At this head the timestamp review was still open.
The DF date-time grammar (`pm_filesafe_schema_graph.py` `date_time` /
`date_time_grammar` / `date_time_fields`, format fixtures) was still the part-1
(S6) code. Part 2B, recorded below, replaces it with CV-1101
`datetime_validator`/`date_time` at every `format_checker` and schema
`format: date-time` site; use `storage_utc_z` for Storage-assigned
observed/persisted fields (the lane grammar admitted numeric offsets at that head);
decide leap seconds (refused at that head, `60` not in `00..59`) and year zero (refused
at that head by the `datetime` constructor) per CV-1101; and re-run the witness,
differential, collection and tool certification for the affected tables.

Owner text (`644142fe4b6b757ac07f6465f89a0ef2c90ace91`,
`9145fdd04758f72870d638c187b44fe5bba7f290`): one sweep paragraph in each of
CV-550..558 (CV-1100 slots, qualified JCS, SP-1100 profiles, SP-1101 dispatch
and custody catalogue), SP-550..558 and ATS-275..279 (guard-table runner,
witnesses, corpus; new commands in the five ATS validation surfaces). The nine
round-6 "`-0` decodes once to integer zero" sentences and the nine ATS
"`1`/`0`/`-0` controls" bullets are corrected to the CV-1100 raw refusal.
Shards and plan index regenerated (derived changes confined to the three edited
documents); shard `--check` passes; `pm-plan-index.py validate` failures (53)
are byte-identical to the pre-edit lane head — fork drift against current
`origin/main`, none in an edited document.

## Sweep regrade

Re-graded at the implementation head against the same rubric; **no cell
changes** in any family (totals 85 PASS / 14 PARTIAL / 9 ABSENT before and
after). C12 (`positive_negative_oracles`) stays PARTIAL in all nine: guard
tables are now certified on the gated shared tool, but each schema occurrence
remains one structural verdict row (individual JSON Schema keywords are not cut
one by one) and, at this part 2A regrade, the timestamp review was still open (closed in Sweep part 2B). C7 stays PARTIAL for the
five application-scope rule sets held with Jared; membership (C1) stays ABSENT.
All 336 evidence quotes (309 carried, relocated to their lines at the
implementation head; 27 new) verify exactly against the cited files
(`file_sha256`/`excerpt_sha256` recomputed).

| Family | PASS before → after | Distinct rows refused by own single-row negatives |
|---|---:|---:|
| filesafe.command_denied | 9 → 9 | 178 |
| filesafe.destructive_override_denied | 9 → 9 | 61 |
| filesafe.destructive_override_granted | 10 → 10 | 63 |
| filesafe.destructive_override_requested | 9 → 9 | 71 |
| filesafe.guard_init_failed | 9 → 9 | 57 |
| filesafe.path_denied | 9 → 9 | 58 |
| filesafe.policy_degraded | 10 → 10 | 54 |
| safe_point.created | 10 → 10 | 147 |
| safe_point.restored | 10 → 10 | 131 |

## Final checks at the part 2A head

- `python3 scripts/pm_filesafe_event_contracts.py` — pass (94 positive / 360 negative / 18 identity).
- `python3 scripts/pm_filesafe_event_authority.py` — pass (235 positive / 2,368 negative / 1,323 protocol steps).
- `python3 scripts/pm-filesafe-table-generate.py --check` — 204 tables, 405 rows; stale 0, extra 0.
- `python3 scripts/pm-filesafe-p2a-cases.py --check` — 1,081 cases kept, 0 rejected; stale: none.
- `python3 scripts/pm_event_numbers.py --self-test --scope numbers` — pass, 580/580.
- `python3 scripts/pm-filesafe-number-corpus.py` — pass, 2,148 route runs, 0 failures.
- `python3 scripts/pm-filesafe-guard-tables.py --out DIR` — 174 PASS / 0 FAIL / 30 tables without negatives; 356/405 rows proved (exit 1: unproved rows and the 7 two-row observations).
- Differential 2A → final over 4,629 witnesses — identical, 0 changes.
- `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` — pass.
- `python3 scripts/pm-plan-index.py validate` — 53 failures, byte-identical to the pre-edit lane head (fork drift; none new).
- Python 3.14.4, msgpack 1.2.1, rfc8785 0.1.4, jsonschema 4.26.0. Native execution NOT_RUN throughout; no browsers used.

## Sweep part 2B: findings and responses

Part 2B for this lane is date-time only. The number scope and the SP-1101 dispatcher were already on the branch. Merge of `58c2816ff33365384d4039553f5efdb5370930e6` was clean (`78910a98bc2e311950c982c858008f3fd5417785`): no content conflict, so neither Addendum 1 resolution was used. The gate commits touch no `Plans/*.md`, so that merge did not regenerate shards. Adoption commit: `b1dc935fe09ae15163cad080fa393683656d52a7`.

| Item | Outcome | Where | How to verify |
|---|---|---|---|
| Merge `58c2816ff3` | Clean merge. No NUMRULE file edited. | `78910a98bc2e311950c982c858008f3fd5417785` | `git log -1 --format=%P 78910a98bc` starts with `8ba3cc12e8`. |
| Shared `date_time` | EventRecord profile at every schema `format: date-time`. Refusal is guard row `DT01_event_record`. | `scripts/pm_filesafe_schema_graph.py:47`, `scripts/pm_filesafe_schema_graph.py:195` | `format_case_failures()` is empty. A rejected fixture's `ValidationError.cause` is `Refusal` with the fixture `reason`. A `str` subclass refuses `date_time_type`. |
| `storage_utc_z` | `observed_at_utc` and `persisted_at_utc` only, after schema admission, in materialization and in the SP-1101 issued/retained path. | `scripts/pm_filesafe_schema_graph.py:67`, `scripts/pm_filesafe_event_authority.py:547`, `scripts/pm_filesafe_event_authority.py:686` | Storage witnesses: real leap `2016-12-31T23:59:60Z` and year `0000-01-01T00:00:00Z` materialize; `+00:00` and lowercase `z` refuse `date_time_storage` and the complete-boundary flip accepts. |
| Order key | Tuple of ints `(posix microseconds, leap flag, extra digits)` so the guard tool can fingerprint it. Comparisons of timestamps with at most six fractional digits match the previous microsecond order. | `scripts/pm_filesafe_schema_graph.py:86` | `payload_grant_window`, `mat_grant_window` and `retention_compact_age` PASS on the gated tool. |
| Guard rows | `date_time_grammar` and `date_time_fields` removed. `date_time_event_record` / `DT01_event_record` and `date_time_storage` / `DT02_storage` added. | `scripts/pm-filesafe-table-generate.py`; generated `scripts/pm_filesafe_table_date_time_event_record.py`, `scripts/pm_filesafe_table_date_time_storage.py` | `pm-filesafe-table-generate.py --check`: 204 tables, 403 rows; stale 0, extra 0. |

### Timestamp fields and profiles

| Field | Profile |
|---|---|
| `occurred_at_utc`, payload `ts`, `issued_at`, `expires_at`, `maximum_expires_at`, `created_at_utc`, `started_at_utc`, `updated_at_utc`, receipt `acknowledged_at_utc`, and every other schema `format: date-time` this lane validates | EventRecord (`date_time` default profile) |
| `observed_at_utc`, `persisted_at_utc` | `storage_utc_z` (uppercase `Z` only), after the EventRecord check |

No coordination or legacy-normalization profile is used. The SP-1101 frozen verifier calls the same issued path, so retained originals use those profiles and the original strings are not rewritten.

### Fixture expectations that changed

- `Plans/filesafe_event_format_fixtures.json`: `date_time.year_zero` (`0000-02-01T10:00:00Z`) is accepted. Added accepted `date_time.real_leap_second` (`2016-12-31T23:59:60Z`) and `date_time.offset_leap_second` (`2017-01-01T00:59:60+01:00`). Rejected cases carry the shared `reason`. Illegitimate leap `2026-06-30T23:59:60Z` still refuses `date_time_leap_second`.
- Nine contract negatives and eighteen authority negatives named `format.year_zero` were removed. Those inputs now pass the complete checker; leaving them as negatives made the checker report `negative_accepted`.
- Each family's `format.offset` and `format.lowercase` authority positives keep their strings and are now required to refuse `date_time_storage` (EventRecord still accepts a numeric offset and a lowercase `z`). The complete-boundary flip of that row accepts.

### Checks

- `python3 scripts/pm_filesafe_event_contracts.py` — pass. 94 positive / 351 negative / 18 identity (9 year-zero negatives removed).
- `python3 scripts/pm_filesafe_event_authority.py` — pass. 217 positive / 2,368 negative / 1,323 protocol steps. The 18 offset and lowercase positives are counted as storage-profile negatives; the 18 year-zero negatives are gone, so the negative total is unchanged.
- `python3 scripts/pm-filesafe-table-generate.py --check` — 204 tables, 403 rows; stale 0, extra 0.
- `python3 scripts/pm-filesafe-p2a-cases.py --check` — 1,081 cases kept, 0 rejected.
- `python3 scripts/pm_event_numbers.py --self-test --scope numbers` — pass, 580/580.
- `python3 scripts/pm_event_numbers.py --self-test` (scope all) — exit 1 before any case: `case_execution` `NOT_RUN_ADMISSION_REFUSED`, `corpus_cases` 13626, failure `datetime_inventory_complete_and_classified`. Not repaired.
- `python3 scripts/pm_event_datetime.py --self-test` is not a self-test entry point and is not counted.
- `python3 scripts/pm-filesafe-number-corpus.py` — pass, 2,148 route runs, 518 accepted, 1,630 refused, 0 untracked, 0 failures.
- `python3 scripts/pm_event_datetime_inventory.py` — exit 1. 233 nodes, 202 failure rows: `unclassified_mentioning_container` 111, `stale_scan_exclusion` 48, `unreadable_mentioning_container` 43. Examples: `Plans/.plan_index/acceptance_units.jsonl` (`jsonl:4692`, unclassified mentioning container), `Plans/Contracts_V0.md` (`fence:21002`, unreadable mentioning container), `Plans/_shards/storage_value_registry/056-lines-11001-11200.md` (`code:11`, stale scan exclusion). Inventory and exclusions were not edited. `datetime_validator` and this gate run at batch-2 integration.
- `python3 scripts/pm-filesafe-guard-tables.py --out DIR` — tool `e8038992eabbe067c8bcba8d48824b97fbb6b5b7e69cbfe28a669f939a96c0b8` (gated `004bdedd63`). 174 PASS / 0 FAIL / 30 tables with no negative. 354/403 rows proved. Exit 1 from 49 rows with no negative and 7 two-row observations. `bad` 0. `date_time_event_record` PASS (`DT01_event_record`). `date_time_storage` PASS (`DT02_storage`). Collection findings are the same 7 two-row observations as part 2A (SM03/SM04, HJ01/HJ02 five times, OO01/OO02).
- `python3 scripts/pm-shard-plans.py --check` — pass. Regenerated shards are only `contracts_v0` and `storage-plan`.
- `python3 scripts/pm-plan-index.py validate` against `origin/main` `77bae0c63605d0a6f643aa3f1d8c51c2f3bb7947` — 60 failures (`plan_unit_removed_without_ledger_decision` 39, `plan_unit_removal_ledger_invalid` 21). Index unit text changed only for `Plans/Contracts_V0.md` and `Plans/storage-plan.md`. `CV-369` is one of the 60: it is on that `origin/main` and was already absent from this lane's `Contracts_V0.md` and index at `8ba3cc12e8`, before this edit. Not restored.

### Rows with no negative

**Corrected in fix round 1:** the OS01 and MK03 proofs below are false. Both rows are reachable and now have single-defect witnesses; every other proof was rebuilt as an attempted negative. See "Fix round 1 after the Opus recheck".

The 49 rows with no negative are the same set as part 2A (the four retired date-time rows were proved, and both new rows are proved). They earn no credit. Proof that no input refuses them first:

| Rows | Proof |
|---|---|
| CI02–CI04 | `scripts/pm_filesafe_guard_suites.py:233` recomputes both event ids with the same `identity` call. `scripts/pm_filesafe_guard_suites.py:51` names the phase unprovable. |
| MO03, BD02 | `scripts/pm_filesafe_event_authority.py:565` and `scripts/pm_filesafe_event_authority.py:1001` compare a commitment to the value just computed for that same source. |
| MG01 | `scripts/pm_filesafe_event_contracts.py:132` (`payload_grant_window`) refuses the issued/expires window before `scripts/pm_filesafe_event_authority.py:612` (`mat_grant_order`). |
| OS01 | `scripts/pm_filesafe_event_contracts.py:40` compares `grant['scope_kind']` to the payload scope kind it was derived from. |
| SU01–SU02, SU06–SU11 | `scripts/pm_filesafe_event_contracts.py:66` runs the subset tables only after the scope rows in `override_scope_semantic`. |
| ME01, MX02, MD01, MJ02 | `scripts/pm_filesafe_event_authority.py:579`, `:604`, `:646` and `:621` re-check joins the earlier envelope, effect, policy and body rows already refused. |
| MK03–MK06, CS02 | `scripts/pm_filesafe_event_authority.py:640` and `:433` see worktree fields only after the payload worktree rows have refused a partial worktree. |
| AB01, AB03, AF08 | `scripts/pm_filesafe_event_authority.py:319`, `:337` and `:394` follow the closed body-schema validation of the same values. |
| SP03–SP04, TR04–TR05 | `scripts/pm_filesafe_event_authority.py:406` and `:444` run after the record schema has fixed node and attempt. |
| OK02–OK03, OQ02–OQ03, OQ06–OQ07, OQ09–OQ10, OQ13, OQ17 | `scripts/pm_filesafe_event_authority.py:497` and `:513` only see schema-admitted operation and outcome combinations; the combinations these rows name do not occur on those seeds. |
| JC03, MT11, IR08, RB02 | `scripts/pm_filesafe_event_authority.py:504`, `:662`, `:709` and `:967` follow schema const/minimum checks and the retention-decision binding. |
| DJ03 | `scripts/pm_filesafe_event_authority.py:268` feeds a descriptor the schema has already limited to a blake3-hex id, a const media type and one integer slot. |
| AJ01–AJ03 | `scripts/pm_filesafe_event_authority.py:343` runs after `scripts/pm_filesafe_event_authority.py:334` (`app_body_decode`) has refused a body qualified RFC 8785 cannot encode. |

### Readiness

Timestamps are no longer an open review for the fields in the table above. `datetime_validator` and the inventory gate run at batch-2 integration; their lane-tree failure is the stale inventory, recorded above and not edited. C12 stays PARTIAL for the single structural schema row and for that gate. C7 stays PARTIAL for the five application-scope families held with Jared. Membership stays ABSENT. Native execution stays NOT_RUN. Family PASS counts are unchanged (9, 9, 10, 9, 9, 9, 10, 10, 10). No READY or admission claim. Sol/Astra part-2 review is pending. Nothing in this pass was stopped for a Jared decision.

## Fix round 1 after the Opus recheck

Recheck: `reviews/GROK-RECHECK/DF-DCO.md` (Opus 5.5, NOT_READY: DF-1 blocking; notes DF-N1..N5). Brief: `lanes/GROK-FIX-DF-DCO.md`. Worked on Nas1 in a trimmed worktree (plan-migration runs 001, 002 and the current run only). Old head `90eec9ea128c0d5711c6f5ba5066b20442f00fed`. No NUMRULE or guard-tool file was edited: `git diff 90eec9ea12 HEAD --` the five guard-tool files and the NUMRULE files is empty.

| Commit | What |
|---|---|
| `f3b5b0f104` | DF-1 and DF-N1..N5: OS01 and MK03 witnesses, MK04-MK06 follower table, the fix-round fixture builder and its cases, the attempts and pair-proof script, `instant_key` |
| `1533229134` | `format_case_failures` records an order case whose instant cannot be keyed (found by M8); attempts-script proof text; 36 self-grade pins relocated |
| this commit | report |

### Findings and fixes

| Finding | Fix | Where | Evidence |
|---|---|---|---|
| **DF-1** (blocking) `OS01_kind` is reachable; the report's "derived scope kind" proof was false | New contract negative `filesafe.destructive_override_granted.p2bfix1.override-scope-kind`: the granted Project positive with the application positive's `authorized_scope`, nothing else changed (semantic layer). Then every other "no negative" proof was rebuilt as an attempted negative (next section). That found a second false proof: **MK03 is reachable**. New p2a witness `safe_point_created.p2a.MK03_worktree_id.absent` (payload and native Project record both omit `worktree_id`; path, branch and HEAD stay). MK04-MK06 move to the follower table `mat_capture_worktree_rest`, evaluated right after `mat_capture_worktree` from the same observation, so MK03's table keeps its credit, as part 2A did for PJ03, DJ03, FV02 and CS02. | `Plans/filesafe_event_contract_fixtures.json:6327`; `scripts/pm-filesafe-fix1-cases.py:67`; `scripts/pm_filesafe_p2a_specs.py:342`; `Plans/filesafe_event_p2a_cases.json` (1,082 cases); `scripts/pm-filesafe-table-generate.py:376`; `scripts/pm_filesafe_tables.py:34` | OS01 negative: closed schema 0 errors, `payload_failures(…, 'semantic')` is `['payload_semantics']`, the only refusing table is `override_scope_kind` with `OS01_kind` (`pm-filesafe-fix1-cases.py --check`). MK03 witness: the complete materialization refuses only `MK03_worktree_id` (`pm-filesafe-p2a-cases.py --check`, 0 rejected). Guard tool: both tables now PASS (below). |
| **DF-N5** (note) MG01, MO03, BD02 are duplicates; MT11, IR08 duplicate the receipt schema const | Pair proofs in `scripts/pm-filesafe-unproved-attempts.py`: each site is cut per predicate (a row swapped to always-pass, a schema keyword removed from exactly the node that refused). The same machinery proves RB02, MJ02, MK05, MK06, JC03, OQ17, SP03, SP04 and MD01. | `scripts/pm-filesafe-unproved-attempts.py:402` (cuts), `:505` (pairs) | 14 of 14 proved: with every site present the negative is refused, with any one site cut it is still refused by the other site for the same defect, with all sites cut it is accepted (table below). The gated tool cannot credit these: its `Duplicate` sites must be rows of one suite, and these sites sit in different tables or in a schema. They stay uncredited in the tool totals and are proved here. |
| **DF-N1** (should-fix) the 27 year-0000 negatives were removed, not converted | The 9 contract inputs return as positives (`positive_payloads[1]` with `ts` `0000-02-01T10:00:00Z`). The 18 authority inputs (one materialization and one `.issued` negative per family, identical edits) return as 9 positives `<family>.p2bfix1.format.year_zero` (`observed_at_utc` `0000-02-01T10:00:00Z`, copies and commitments rebuilt). Every authority positive is checked on materialization, the issued copy and the retained boundary, so each covers both former routes. | `scripts/pm-filesafe-fix1-cases.py:67`, `:134` | `pm-filesafe-fix1-cases.py --check`: 0 failures. Contract and authority CLIs pass (below). Mutation M11 caught by these positives. |
| **DF-N2** (should-fix) no full-route positive with an offset or lowercase timestamp at a family field | Per family `<family>.p2bfix1.format.offset_ts` (Project seed, `2026-11-04T13:00:00+01:00`) and `<family>.p2bfix1.format.lowercase_ts` (application seed, `2026-11-04t12:00:00z`): payload `ts`, `occurred_at_utc`, the source `ts` and every other copy of that instant (`issued_at`, `created_at_utc`, `updated_at_utc`, native and application records) take the same spelling; bodies, commitments, digests and the issued and retained copies are rebuilt. Storage-assigned `observed_at_utc` and `persisted_at_utc` keep their uppercase-Z values. | `scripts/pm-filesafe-fix1-cases.py:106`, `:134` | All 18 accepted on all three routes. Mutation M7 (`occurred_at_utc` given `storage_utc_z`) is now caught by the authority checker. |
| **DF-N3** (note) only a guard-suite witness tested `persisted_at_utc` | Per family `<family>.p2bfix1.format.persisted_offset` (materialization, `+00:00`) and `<family>.p2bfix1.format.persisted_lowercase.issued` (issued layer, lowercase `t` and `z`), `expected_error` `date_time_storage`. | `scripts/pm-filesafe-fix1-cases.py:134`, `:169` | Each is refused by `DT02_storage` alone. Mutations M3 and M9 are now caught by the authority checker, not only by the guard-suite witnesses. |
| **DF-N4** (hypothetical) `instant_key` gave every instant inside a leap second one key | The leap key is `(posix microseconds of second 59 + 999999, 1, micros, *extra digits)`: still after second 59 and before the next second, and ordered inside the leap second. | `scripts/pm_filesafe_schema_graph.py:118`; order cases `Plans/filesafe_event_format_fixtures.json` checked at `scripts/pm_filesafe_schema_graph.py:228` | 8 order cases (60.1 before 60.9; 60.0000001 before 60.000001 and before 60.9; 60 before 60.000001; 59.999999999 before 60; 60.999999999 before the next second; `+01:00` and `Z` spellings of 60.5 equal; six-digit microseconds unchanged). The part 2B key fails the first four (mutation M12). No fixture has a leap second in a grant or retention field, so no window outcome changes. |

### Every "no negative" proof rebuilt as an attempted negative (DF-1)

`python3 scripts/pm-filesafe-unproved-attempts.py --out DIR` builds each attempt from a named valid seed with the p2a builder (one fact changes; bodies, commitments, digests and the issued and retained copies move with it), runs it through the complete boundary under the observation recorder, and checks its first refusing table and rows against the cited proof. It exits 1 if an attempt reaches its own row first and alone (REACHABLE) or refuses somewhere other than the cited place. Result: **69 attempts over all 47 remaining rows, 69 confirmed, 0 reachable, 0 mismatched.** Before OS01 and MK03 were witnessed, the same procedure is what found them reachable. "Masked" below means the target row does refuse first in its own table, but a second, unrelated row refuses the same coupled value in the same run, so the row never refuses alone and no single-defect witness exists.

| Row | Attempted negative (built, run through the complete boundary) | First refusal | Status | Proof |
|---|---|---|---|---|
| SU01_kind | granted scope kind changed (authorized_scope from the application positive) | override_scope_kind: OS01_kind | confirmed | scripts/pm_filesafe_event_contracts.py:128 (semantic, on authorized_scope) and scripts/pm_filesafe_event_authority.py:610 (override_scope_semantic on the requested scope) tie both scope kinds to the payload scope kind before override_subset (scripts/pm_filesafe_event_contracts.py:65) |
|  | requested scope kind changed | override_scope_kind: OS01_kind | confirmed | as above |
| SU02_project | granted project_id changed | override_scope_root: OS02_project | confirmed | OS02 ties both project_ids to the payload scope project_id first |
|  | requested project_id changed | override_scope_root: OS02_project | confirmed | as above |
| SU06_server | granted server_id changed | override_scope_application: OS05_server | confirmed | OS05_server ties the granted and the requested server_id to the same execution value first |
|  | requested server_id changed | override_scope_application: OS05_server | confirmed | OS05_server ties the granted and the requested server_id to the same execution value first |
| SU07_computer | granted computer_id changed | override_scope_application: OS06_computer | confirmed | OS06_computer ties the granted and the requested computer_id to the same execution value first |
|  | requested computer_id changed | override_scope_application: OS06_computer | confirmed | OS06_computer ties the granted and the requested computer_id to the same execution value first |
| SU08_thread | granted thread_id changed | override_scope_application: OS07_thread | confirmed | OS07_thread ties the granted and the requested thread_id to the same execution value first |
|  | requested thread_id changed | override_scope_application: OS07_thread | confirmed | OS07_thread ties the granted and the requested thread_id to the same execution value first |
| SU09_run | granted run_id changed | override_scope_application: OS08_run | confirmed | OS08_run ties the granted and the requested run_id to the same execution value first |
|  | requested run_id changed | override_scope_application: OS08_run | confirmed | OS08_run ties the granted and the requested run_id to the same execution value first |
| SU10_host | granted host_id changed | override_scope_application: OS09_host | confirmed | OS09_host ties the granted and the requested host_id to the same execution value first |
|  | requested host_id changed | override_scope_application: OS09_host | confirmed | OS09_host ties the granted and the requested host_id to the same execution value first |
| SU11_environment | granted environment_id changed | override_scope_application: OS10_environment | confirmed | OS10_environment ties the granted and the requested environment_id to the same execution value first |
|  | requested environment_id changed | override_scope_application: OS10_environment | confirmed | OS10_environment ties the granted and the requested environment_id to the same execution value first |
| ME01_scope_kind | event scope_kind changed alone | mat_schema: MS01_schema | confirmed | Plans/event_record.schema.json couples scope_kind with project_id nullness |
|  | event scope_kind and its schema-coupled project_id changed | mat_envelope_kind: ME01_scope_kind | confirmed | masked: ME02_project (mat_envelope_subject) refuses the same coupled project_id; ME01 never refuses alone |
| MX02_run | execution-context run_id empty in every copy | mat_schema: MS01_schema | confirmed | schema minLength on every run_id copy |
|  | execution-context run_id null in request and result contexts only | payload_scope: PS03_run_copy | confirmed | PS03 joins the payload run_id copy to the context run_id first |
| MK04_worktree_path | payload worktree_path absent (the native record requires it) | payload_worktree: PW01_path | confirmed | PW01 (scripts/pm_filesafe_event_contracts.py:141) refuses an absent path first; the native project record schema requires worktree_path, so MJ04 also refuses the join |
| MK05_branch | branch_name absent from payload and native record | payload_worktree: PW02_branch | confirmed | duplicate of PW02 (pair proof below) |
| MK06_head | HEAD_sha absent from payload and native record | payload_worktree: PW03_head | confirmed | duplicate of PW03 (pair proof below) |
| MD01_enforcement | authoritative_enforcement_intact false | mat_schema: MS01_schema | confirmed | schema const true on the result (pair proof below) |
| MJ02_body_present | native Project body missing from the bank | mat_body_member: MB02_present | confirmed | duplicate of MB02 for the same member (pair proof below) |
|  | native Project body stored as an integer | mat_body_member: MB02_present | confirmed | as above |
| MO03_commitment | accepted_source_sha256 wrong in the candidate and the selected bank copy | selected_source_commitment: SS03_commitment | confirmed | duplicate of SS03 through the exact join SS04 (pair proof below) |
|  | accepted_source_sha256 wrong in the candidate only | selected_source_join: SS04_join | confirmed | SS04 refuses a candidate that differs from the selected source |
| MG01_issued_before_expiry | issued_at equal to expires_at | payload_grant_window: PG01_window | confirmed | duplicate of PG01 (pair proof below) |
| MT11_durability_state | first receipt durability_state pending | mat_schema: MS01_schema | confirmed | duplicate of the receipt schema const (pair proof below) |
| IR08_durability_state | issued first receipt durability_state pending | issued_schema: IS05_schema | confirmed | duplicate of the receipt schema const (pair proof below) |
| AB01_role | snapshot_blobs member dropped | mat_schema: MS01_schema | confirmed | body_members minItems, then MB01 (role set equals the required roles) refuse first |
| AB03_schema | snapshot_blobs body schema-invalid, record unchanged | app_body_schema: AB03_schema | confirmed | masked: AB04 refuses the body that differs from its record; a coherent record and body are refused first by mat_schema on the same schema fragment |
|  | snapshot_blobs record and body both schema-invalid | mat_schema: MS01_schema | confirmed | as above |
| AF08_entry_address | entry payload_id changed | app_entry_blob_match: AF01_one_blob | confirmed | the blob is selected by payload_id equality (scripts/pm_filesafe_event_authority.py:370), so AF08 sees only equal ids |
| SP03_node_id | safe-point record node_id set | mat_schema: MS01_schema | confirmed | schema type null on the record field (pair proof below) |
| SP04_attempt_id | safe-point record attempt_id set | mat_schema: MS01_schema | confirmed | schema type null on the record field (pair proof below) |
| CS02_no_worktree_id | SCM-absent capture that keeps worktree_id | payload_worktree: PW01_path, PW02_branch, PW03_head | confirmed | PW01-PW03 refuse a worktree_id without path, branch and HEAD first |
| TR04_node_id | restore transaction node_id set | mat_schema: MS01_schema | confirmed | schema type null on restore_transaction.node_id |
|  | result node_id set | mat_request_subject: MQ01_subject | confirmed | MQ01, ME05 and MA01 refuse an application result node_id first |
| TR05_attempt_id | restore transaction attempt_id set | mat_schema: MS01_schema | confirmed | schema type null on restore_transaction.attempt_id |
| OK02_before_presence | create operation relabelled replace | mat_schema: MS01_schema | confirmed | the operation schema ties operation_kind to expected_before_type nullness |
|  | create operation relabelled replace with a before type and digest | app_operation_subject: OP03_before_sha256, OP05_before_type | confirmed | OP03/OP05 tie the before fields to the absent pre-restore entry first |
| OK03_target_presence | delete operation relabelled replace | mat_schema: MS01_schema | confirmed | the operation schema ties operation_kind to target_type nullness |
| JC03_lease | mutation_lease_ref empty | mat_schema: MS01_schema | confirmed | schema minLength (pair proof below) |
| OQ02_post_is_target | restored_clean post manifest equal to the pre manifest | payload_restore: PR01_clean_target | confirmed | PR01 joins the result post digest to the target first; TM and the result joins carry it |
| OQ03_scm_target | restored_clean scm_equal_target false | app_equality_scm: EQ06_scm_target | confirmed | EQ06 ties the flag to the recomputed SCM equality first |
| OQ06_post_is_pre | restore_failed post manifest equal to the target | payload_restore: PR02_unchanged | confirmed | PR02 first |
| OQ07_scm_pre | restore_failed scm_equal_pre_restore false | app_equality_scm: EQ07_scm_pre | confirmed | EQ07 first |
| OQ09_target_is_pre | restore_skipped target digest differs from pre | payload_restore: PR03_skipped_target | confirmed | PR03 first |
| OQ10_pre_is_post | restore_skipped post manifest differs from pre | payload_restore: PR04_skipped_after | confirmed | PR04 first |
| OQ13_post_is_pre | restore_refused post manifest equal to the target | payload_restore: PR02_unchanged | confirmed | PR02 first |
| OQ17_holds | restore_recovery_required hold_refs empty in every copy | mat_schema: MS01_schema | confirmed | schema minItems (pair proof below) |
| DJ03_other | descriptor byte_size NaN | payload_ref_descriptor: EP04_schema, EP03a_slot_type | confirmed | the descriptor schema (EP04/EP03a) refuses every non-finite, key and string-domain form first |
|  | descriptor byte_size Infinity | payload_ref_descriptor: EP04_schema, EP03a_slot_type | confirmed | the descriptor schema (EP04/EP03a) refuses every non-finite, key and string-domain form first |
|  | descriptor media_type lone surrogate | payload_ref_descriptor: EP04_schema | confirmed | the descriptor schema (EP04/EP03a) refuses every non-finite, key and string-domain form first |
|  | descriptor extra lone-surrogate key | payload_ref_descriptor: EP04_schema | confirmed | the descriptor schema (EP04/EP03a) refuses every non-finite, key and string-domain form first |
|  | descriptor payload_id lone surrogate | payload_ref_descriptor: EP04_schema | confirmed | the descriptor schema (EP04/EP03a) refuses every non-finite, key and string-domain form first |
| AJ01_binary64 | manifest record entry length 2**53+1, body unchanged | app_body_check: AB04_value | confirmed | masked: a record no RFC 8785 body can encode always differs from its body (AB04); the coherent rebuild cannot encode it at all |
|  | manifest record entry length 2**53+1, coherent rebuild | BUILD_REFUSED:Refusal:jcs_binary64 | confirmed | qualified RFC 8785 cannot encode the manifest body (jcs_binary64) |
| AJ02_decimal | manifest record entry length 1.5, body unchanged | mat_schema: MS01_schema | confirmed | the manifest schema admits integers only; a body cannot carry another number |
| AJ03_other | manifest record string with a lone surrogate, coherent rebuild | BUILD_REFUSED:Refusal:unicode_scalar | confirmed | no body and no source commitment can encode a lone surrogate |
|  | manifest record string with a lone surrogate, bodies and commitment unchanged | selected_source_join: SS04_join | confirmed | the caller source differs from the selected source first; AB04 and AJ03 follow |
| CI02_retry_stable | identity self-check on every contract positive of every family | 103 observations, 0 refused | confirmed | declared UNPROVABLE (scripts/pm_filesafe_guard_suites.py:51): a pure function recomputed on the same input |
| CI03_family_distinct | identity self-check on every contract positive of every family | 103 observations, 0 refused | confirmed | declared UNPROVABLE (scripts/pm_filesafe_guard_suites.py:51): a pure function recomputed on the same input |
| CI04_operation_distinct | identity self-check on every contract positive of every family | 103 observations, 0 refused | confirmed | declared UNPROVABLE (scripts/pm_filesafe_guard_suites.py:51): a pure function recomputed on the same input |
| BD02_commitment | read_body after the source commitment is wrong in both copies | selected_source_commitment: SS03_commitment | confirmed | duplicate of SS03 through the exact join SS04 (pair proof below) |
| RB02_pending | rebuild after owner_commit, writer and reader withdrawal | proto_rebuild_gate: RB01_reader_fence | confirmed | WR02 refuses the reader withdrawal while pending, so rebuild meets RB01 first (pair proof below) |
|  | owner_commit again after a terminal original and both withdrawals | proto_commit_fence: PC01_writer | confirmed | PC01 refuses a new owner commit once the writer is fenced, so pending stays false |

The three CI rows stay declared `UNPROVABLE` by the lane (`scripts/pm_filesafe_guard_suites.py:51`): a pure identity function recomputed on the same input; the attempt runs the self-check on all 103 contract positives and nothing refuses.

### Pair proofs for duplicates (DF-N5, MT11, IR08 and the other duplicate sets)

A duplicate set is one invariant (same field, same predicate) at two or more sites. Each site is cut per predicate: a guard row is swapped to always-pass in the recorder's row table, exactly as the suite builder's complete-boundary flip does; a schema keyword is removed from exactly the schema node that refused (found by identity in the cached registry document, and removed from every fresh load of that document for the issued route). Nothing is edited on disk.

| Duplicate set | Sites | Every site present | Each site cut alone | All sites cut | Result |
|---|---|---|---|---|---|
| MG01_issued_before_expiry | payload_grant_window:PG01_window; mat_grant_order:MG01_issued_before_expiry | refused (PG01_window) | refused (MG01_issued_before_expiry); refused (PG01_window) | accepted | proved |
| MO03_commitment | selected_source_commitment:SS03_commitment; mat_source_commitment:MO03_commitment | refused (SS03_commitment) | refused (MO03_commitment); refused (SS03_commitment) | accepted | proved |
| BD02_commitment | selected_source_commitment:SS03_commitment; proto_body_commitment:BD02_commitment | refused (SS03_commitment) | refused (BD02_commitment); refused (SS03_commitment) | accepted | proved |
| MT11_durability_state | Plans/event_append_receipt_contracts.schema.json#/$defs/AppendReceipt/properties/durability_state:const; mat_receipt_state:MT11_durability_state | refused (MS01_schema) | refused (MT11_durability_state); refused (MS01_schema) | accepted | proved |
| IR08_durability_state | Plans/event_append_receipt_contracts.schema.json#/$defs/AppendReceipt/properties/durability_state:const; issued_receipt_state:IR08_durability_state | refused (IS05_schema) | refused (IR08_durability_state); refused (IS05_schema) | accepted | proved |
| RB02_pending | proto_withdraw_reader:WR02_pending; proto_rebuild_pending:RB02_pending | refused (RB01_reader_fence) | refused (RB02_pending); refused (RB01_reader_fence) | accepted | proved |
| MJ02_body_present | mat_body_member:MB02_present; mat_project_body_present:MJ02_body_present | refused (MB02_present) | refused (MJ02_body_present); refused (MB02_present) | accepted | proved |
| MK05_branch | payload_worktree:PW02_branch; mat_capture_worktree_rest:MK05_branch | refused (PW02_branch) | refused (MK05_branch); refused (PW02_branch) | accepted | proved |
| MK06_head | payload_worktree:PW03_head; mat_capture_worktree_rest:MK06_head | refused (PW03_head) | refused (MK06_head); refused (PW03_head) | accepted | proved |
| JC03_lease | Plans/filesafe_event_sources/safe_point_restored.schema.json#/$defs/application_restore_transaction/properties/mutation_lease_ref:minLength; app_journal_lease:JC03_lease | refused (MS01_schema) | refused (JC03_lease); refused (MS01_schema) | accepted | proved |
| OQ17_holds | Plans/filesafe_event_sources/safe_point_restored.schema.json#/$defs/application_safe_point_record/properties/hold_refs:minItems; Plans/filesafe_event_sources/safe_point_restored.schema.json#/$defs/application_restore_transaction/properties/hold_refs:minItems; app_outcome_recovery_holds:OQ17_holds | refused (MS01_schema) | refused (MS01_schema); refused (MS01_schema); refused (MS01_schema) | accepted | proved |
| SP03_node_id | Plans/filesafe_event_sources/safe_point_created.schema.json#/$defs/application_safe_point_record/properties/node_id:type; app_safe_point_ids:SP03_node_id | refused (MS01_schema) | refused (SP03_node_id); refused (MS01_schema) | accepted | proved |
| SP04_attempt_id | Plans/filesafe_event_sources/safe_point_created.schema.json#/$defs/application_safe_point_record/properties/attempt_id:type; app_safe_point_ids:SP04_attempt_id | refused (MS01_schema) | refused (SP04_attempt_id); refused (MS01_schema) | accepted | proved |
| MD01_enforcement | Plans/event_payloads/filesafe_policy_degraded_v2.schema.json#/properties/authoritative_enforcement_intact:const; mat_policy_degraded:MD01_enforcement | refused (MS01_schema) | refused (MD01_enforcement); refused (MS01_schema) | accepted | proved |

Notes: in RB02 the negative is a protocol trace (`owner_commit`, `withdraw_writer`, `withdraw_reader`, `rebuild`); with WR02 cut, `withdraw_reader` passes and `rebuild` meets RB02, and with both cut `rebuild` returns `retained_survivors_verified`. OQ17's empty hold list must be the same in the safe-point record, the transaction and the equality result (HJ01/HJ02 join them), so its set holds the `minItems` of both record copies and the row. MD01's `const` is one node: the source result, the inline event payload and the Result root all `$ref` it.

### Guard tool (gated `004bdedd63`, tool SHA-256 `e8038992eabbe067c8bcba8d48824b97fbb6b5b7e69cbfe28a669f939a96c0b8`)

`python3 scripts/pm-filesafe-guard-tables.py --out DIR --max-rss 2048 --pause-when-low 6 --resume-at 7`, all nine families (every family gained witnesses). Run at `1533229134`: collection 470 s, total 1,592 s. The "Part 2B" column is the recheck's own run at `90eec9ea12` (`reviews/GROK-RECHECK/DF-DCO-evidence/df-guard-summary.json`).

| | Part 2B | Fix round 1 |
|---|---:|---:|
| Tables / rows | 204 / 403 | **205 / 403** (`mat_capture_worktree_rest` split out) |
| Tables run, PASS, FAIL | 174, 174, 0 | **176, 176, 0** |
| Rows proved | 354 | **356** (+`OS01_kind`, +`MK03_worktree_id`) |
| Tables / rows with no negative | 30 / 49 | **29 / 47** (3 declared unprovable: CI02-CI04) |
| Lane matrix problems, masked, failure kinds, `bad` | 0, 0, none, 0 | 0, 0, none, 0 |
| Collection findings | 7 two-row observations | the same 7 (SM03/SM04, HJ01/HJ02 ×5, OO01/OO02), each row also proved by its single-row p2a witness |
| Distinct negatives (aliases), evaluations | 1,192 (4,680), 23,346 | 1,194 (4,698), 23,750 |
| Complete-boundary flips: accepted / refused later | 1,620 / 2,075 | 1,639 / 2,076 |

Exit 1 is the expected signal for the 47 rows without a negative and the 7 two-row observations. Every one of the 47 has the path:line proof above and a built attempt that confirms it; 14 of them are also duplicates proved by pair.

**OS01, stated plainly.** Its witness is refused by `OS01_kind` alone at the boundary: payload semantics stop at the first refusing table, and the gated tool proves the row. Its complete-boundary flip is "refused later" by `OS02_project`: the granted scope's kind and `project_id` are coupled by the `authorized_scope` `oneOf` (a Project grant carries a string `project_id`, an application grant a null one), so a grant whose kind differs from the payload scope's always differs in `project_id` too. No grant can violate OS01 without that coupled `project_id`. This is the "refused later by an independent row watching the same source fact" pattern the lane's other 2,075 refused-later flips record, and it is the negative the recheck asked for. ME01 has the same coupling (event `scope_kind` with event `project_id`), but materialization accumulates refusals, so its attempt is refused by ME01 and ME02 in the same run and is not counted as a witness. MK03's flip is accepted: when MK03 is cut its witness passes the whole boundary.

### Checks (Nas1, at `1533229134`)

| Command | Exit | Result |
|---|---:|---|
| `python3 scripts/pm-filesafe-fix1-cases.py --check` | 0 | stale none, 0 failures |
| `python3 scripts/pm_filesafe_event_contracts.py` | 0 | pass, **103 positive / 352 negative / 18 identity** (was 94 / 351 / 18) |
| `python3 scripts/pm_filesafe_event_authority.py` | 0 | pass, **244 positive / 2,386 negative / 1,323 protocol steps**, failures `[]` (was 217 / 2,368 / 1,323); 328 s |
| `python3 scripts/pm-filesafe-table-generate.py --check` | 0 | 205 tables, 403 rows; stale 0, extra 0 |
| `python3 scripts/pm-filesafe-p2a-cases.py --check` | 0 | **1,082 kept**, 0 rejected; stale none (was 1,081) |
| `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | 0 | pass, **580/580**, failures `[]` |
| `python3 scripts/pm-filesafe-number-corpus.py` | 0 | pass: 2,148 route runs, 518 accepted, 1,630 refused, 0 untracked |
| `python3 scripts/pm-filesafe-unproved-attempts.py --out DIR` | 0 | 69/69 attempts confirmed, 14/14 pair proofs |
| `python3 scripts/pm-filesafe-guard-tables.py --out DIR …` | 1 | as above |
| `python3 scripts/pm_event_numbers.py --self-test` (scope all) | 1 | `NOT_RUN_ADMISSION_REFUSED` before any case; only check `datetime_inventory_complete_and_classified` |
| `python3 scripts/pm_event_datetime_inventory.py` | 1 | `inventory_node_missing` 233, `scan_exclusions_invalid` 1; the gate stops at `scan_exclusions_invalid` (`exclusion_purpose_citation_unreadable: Plans/.plan_migration/pds-20260906-017-current-planunit-snapshot/span_map.jsonl`): this trimmed worktree leaves out the snapshot run that exclusion cites, so the rows are not comparable with part 2B's full-tree 202 |

`datetime_validator` and the inventory gate run at batch-2 integration (addendum 2). No `Plans/*.md` document was edited, so shards and the index were not regenerated; `pm-shard-plans.py --check` passes (99 documents, 3,100 shards). Nas1 lacked `blake3` and `rfc8785`; every command ran in a scratch venv with `--system-site-packages` plus `blake3 1.0.11`, `rfc8785 0.1.4`, `msgpack 1.2.4`.

### Recheck mutations (in memory; format pack, the four guard-suite Storage witnesses, `check(families=('filesafe.command_denied',))`)

The recheck's harness `df_mut.py` re-pointed at this worktree (`df_mut_fix1.py`); M12 is new and restores the part 2B leap-second key. Run at the final code (`1533229134`). At `f3b5b0f104` M8 crashed the harness: under that mutation an order case's `instant_key` raised `Refusal` inside `format_case_failures`, which `1533229134` now records as a failure (`instant_order_refused`) instead of stopping.

| # | Mutation | At `90eec9ea12` (recheck) | Now | Caught by |
|---|---|---|---|---|
| — | none | clean | clean | — |
| M1 | Storage fields checked with event_record | caught | **caught** | authority: p2bfix1.format.persisted_lowercase.issued, p2bfix1.format.persisted_offset, sweep1.format.lowercase, sweep1.format.offset; guard-suite witnesses: storage_offset, storage_lower_z |
| M2 | Storage profile accepts a lowercase z | caught | **caught** | authority: p2bfix1.format.persisted_lowercase.issued, sweep1.format.lowercase; guard-suite witnesses: storage_lower_z |
| M3 | persisted_at_utc dropped from the Storage check | guard-suite witness only | **caught** | authority: p2bfix1.format.persisted_lowercase.issued, p2bfix1.format.persisted_offset; guard-suite witnesses: storage_lower_z |
| M4 | hour 24 accepted | caught | **caught** | format pack: date_time.hour_24; authority: sweep1.format.hour_24, sweep1.format.hour_24.issued |
| M5 | trailing LF accepted | caught | **caught** | format pack: date_time.trailing_lf; authority: sweep1.format.trailing_lf, sweep1.format.trailing_lf.issued |
| M6 | str subclass accepted | caught | **caught** | format pack: date_time.str_subclass |
| M7 | occurred_at_utc given storage_utc_z | **survived** | **caught** | authority: p2bfix1.format.lowercase_ts, p2bfix1.format.offset_ts |
| M8 | every second 60 refused | caught | **caught** | format pack: date_time.invalid_minute, date_time.invalid_offset_minute, date_time.real_leap_second …; guard-suite witnesses: storage_leap |
| M9 | Storage profile accepts +00:00 | guard-suite witness only | **caught** | authority: p2bfix1.format.persisted_offset; guard-suite witnesses: storage_offset |
| M10 | Storage check dropped on the issued/retained path | caught | **caught** | authority: p2bfix1.format.persisted_lowercase.issued, sweep1.format.lowercase, sweep1.format.offset |
| M11 | year 0000 refused | caught | **caught** | format pack: date_time.year_zero; authority: p2bfix1.format.year_zero; guard-suite witnesses: storage_year0 |
| M12 | part 2B leap-second key restored (DF-N4 defect) | not run (new) | **caught** | format pack: order.leap_fraction, order.leap_extra_digits, order.leap_extra_before_tenth … |

**12 of 12 caught.**

### Grades and self-grade

No cell moves: family PASS counts stay 9, 9, 10, 9, 9, 9, 10, 10, 10; C12 and C7 stay PARTIAL for the reasons above; membership ABSENT. DF-1 was a guard-table proof row, not a grade cell, and is now witnessed. Self-grade: 672 of 672 quotes exact at their lines with current file hashes; 36 pins that the appended fixture cases and the `instant_key` docstring moved were relocated through the git diff hunks (quotes and `excerpt_sha256` unchanged).

### Readiness

Prepared for re-review. Not READY. Batch-2 items unchanged: inventory refresh, `datetime_validator`, the combined self-test. Native NOT_RUN, membership ABSENT. No new ids, no Decision Log entry, no registry append, no `Plans/*.md` edit. **Stopped for Jared:** none.
