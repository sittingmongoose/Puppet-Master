# DMEM fix round 2 — 2026-11-04

Branch: `plans/ea-w2-memory-maintenance-20261104`. Assessed source head / repair commit: `9d197a494c9e091fde0529788d7f6959d1ff0b18`. Astra reviewed head: `47b099a837b84ce8718f69c40a84ebd9f1179d3b`. Original base: `be4766513ff71776346fc73b84f2542990f955af`. This report and the self-grade are a report-only follow-up; the source pin is exact. The previous round's report remains in the reviewed commit.

## Outcome and family regrade

B1, B2 and B3 are fixed. The worker self-grade moves the prepared set from Astra's 0/8 to 8/8 prepared, pending independent re-review. Each prepared row retains membership ABSENT and retention PARTIAL. Native execution remains NOT_RUN. No admission or policy answer is claimed.

| Exact family | Before: Astra review | After: round-2 self-grade |
|---|---|---|
| `memory.dedup_sweep.completed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `memory.dedup_sweep.started` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `memory.index.lexical.rebuild.completed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `memory.index.lexical.rebuild.started` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `memory.index.semantic.rebuild.completed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `memory.index.semantic.rebuild.started` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `memory.verification_sweep.completed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `memory.verification_sweep.started` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |

The four `memory.monthly_summary.started`, `memory.monthly_summary.completed`, `memory.prune_archive.started` and `memory.prune_archive.completed` rows remain held and untouched: each 1 PASS / 2 PARTIAL / 9 ABSENT. Their contract rows and complete self-grade row objects are unchanged. Across all 144 cells, the review baseline was 76 PASS / 24 PARTIAL / 44 ABSENT; after repair it is 84 PASS / 16 PARTIAL / 44 ABSENT. Only the eight `positive_negative_oracles` grades change from PARTIAL to PASS. All prepared-family evidence was re-read and all 252 citation instances resolve to current exact substrings of at most 200 characters.

## Review round 2: findings and responses

### B1 — fixed in `9d197a494c9e091fde0529788d7f6959d1ff0b18`

**Where:** `scripts/pm_memory_maintenance_events.py:142` (`canonical_value`), `:166` (`append_current`) and `:462` (`run_writers`); `Plans/memory_maintenance_event_fixtures.json#/writer_families`; the eight independent SP-630–637 additions beginning at `Plans/storage-plan.md:29499`; `Plans/Automated_Testing_System.md:7245` (ATS-315); each prepared row in `Plans/memory_maintenance_contracts.json`.

**Why:** The reduced nine-field phase values omitted the canonical writer envelope and could not exercise its replay-only refusal.

**Fix:** Keep those values explicitly reduced and synthetic. Add a separate independently checked canonical EventRecord 2.0.0 boundary suite, with 28 required fields, canonical schema/format validation, exact payload definition URI, payload/Project/correlation/causation/identity joins and each family's newly authored `dedupe_by_idempotency_key` selection. Both fresh append and retained-original retry with `projector_replay_only` fail as exactly `replay_only_not_appendable`, with no output or durable mutation. Positive append/retry returns the retained complete original with one append and no maintenance effect. Retry changes to Storage-assigned sequence/observed/persisted fields return the original; changed producer semantics under the same identity refuse `idempotency_conflict`. The scoped key uses `project~cHJvamVjdC0x` for fixture Project `project-1`; a raw Project partition is rejected. Frozen compatibility 1.0.0 shapes cannot pass this current-writer suite. No compatibility reader is implemented or claimed.

**Verify:** The full checker runs 128 canonical writer steps over all eight exact families, including both replay-only negatives per family. All eight positive full envelopes independently validate against `Plans/event_record.schema.json`. Restoring a replay-policy bypass makes the full checker fail at `memory.dedup_sweep.completed:append-projector-replay-only`. See `targeted-check.json` and `review-regressions.json` below.

### B2 — fixed in `9d197a494c9e091fde0529788d7f6959d1ff0b18`

**Where:** `scripts/pm_memory_maintenance_events.py:367` (`recover`); each exact family's own SP current-writer/recovery paragraph; ATS-315 at `Plans/Automated_Testing_System.md:7247`; each family's `completed-recovery-permission-refusal` and `completed-recovery-withdrawal-refusal` traces.

**Why:** Completed recovery returned its retained original without rechecking current permission or family withdrawal.

**Fix:** Recovery applies both current fences before any disclosure or tentative transition. A refusal returns no output and preserves the complete durable state. It leaves the operation pending at its existing durable phase; it does not invent an internal settlement. Each exact family also has an authorized completed-recovery positive that returns its original.

**Verify:** All 16 Astra permission/withdrawal probes now refuse `permission_or_withdrawal`. Removing only recovery's new authorization guard makes the full checker fail at `completed-recovery-permission-refusal`. Both new negative traces run for every exact family, with unchanged-state assertions.

### B3 — fixed in `9d197a494c9e091fde0529788d7f6959d1ff0b18`

**Where:** `scripts/pm_memory_maintenance_events.py:241` (started acceptance), `:360` (retry/replay start custody) and `:370` (recovery start custody); each of SP-631/633/635/637; the four started-family boundary suites and completed recovery/retry traces.

**Why:** A later-phase operation with both receipt IDs could pass started acceptance after its original start value had been removed.

**Fix:** Missing first-start custody is lawful only in the accepted pre-append phase. A recorded start or any later phase requires and compares the retained exact original. Started boundaries now exercise missing originals in started, prepared where applicable, effect_committed and completed phases, plus lawful accepted pre-append positives. Post-completion recovery also requires the start original; started retry with its original removed refuses. The current permission/withdrawal fences run first.

**Verify:** All four exact Astra acceptance reproductions now return false. Removing the started-custody gate makes the full checker fail at `memory.dedup_sweep.started:started-missing-original-start`. Every exact family's completed recovery with lost start custody refuses; all four started-family post-completion retry negatives also run.

### Standing check 5 — fixed in `9d197a494c9e091fde0529788d7f6959d1ff0b18`

**Where:** The three `Plans/memory_maintenance_*schema.json` documents and their six existing inline schema mirrors in `Plans/storage_value_registry.json`; `Plans/memory_maintenance_event_fixtures.json#/identifier_cases`.

**Why:** Python regex `$` also matches before a final LF. Several lane-owned patterned identifiers had no exact length or full-input guard.

**Fix:** All 170 lane pattern occurrences now carry exact fixed lengths or a full-input guard. Closed raw-schema positives and trailing-LF negatives cover payload hashes/receipt IDs/result refs, operation rows, target IDs/manifests/artifact names and hashes, selectors and nullable prior-selector hashes. The six registry mirrors are structurally identical to their canonical definitions; no other registry row or profile changes.

**Verify:** The full checker runs 105 identifier cases. Removing those guards from the payload schema makes it fail on a trailing-LF source hash. Current-writer event-name trailing LF is also explicitly refused by the exact envelope join.

No finding is disputed or stopped for a new Jared decision. The review contains no additional numbered should-fix findings or lane-owned notes requiring changes. Its four holds and native/admission/retention boundaries remain intact.

## Bindings, current premises and standing checks

Each prepared family's `review_round_2` record in `reports/event-authority-20261104/DMEM-search.json` states its independent current-canon search scope, negative evidence and reuse. Own SP units previously had neither a selected replay policy nor exact payload dispatch URI. Reuse is Contracts_V0 EventRecord 2.0.0 and its existing replay-only rejection, the family's own existing closed payload definition, SP-286 original custody and Storage §2.2.5 partition encoding. Each exact family labels its newly authored writer contract independently; no sibling supplies its authority.

The exact payload URI is the schema document's existing `$id`, `https://puppetmaster.local/Plans/memory_maintenance_event_payloads.schema.json`, plus `#/$defs/` and that family's dot-to-underscore definition name. SP-630/631 bind dedup completed/started, SP-632/633 lexical completed/started, SP-634/635 semantic completed/started, SP-636/637 verification completed/started. Every prepared contract row records its own URI and legal writer policy. The synthetic canonical fixtures use non-secret `component:MemoryMaintenance` and fixed example Storage clocks/sequences; they do not allocate real native identities or authenticate receipts.

The current EventRecord rules (`Contracts_V0.md:1000–1002,1028–1036`), AMS §7.2 (`assistant-memory-subsystem.md:398–414`) and DL-045 (`Decision_Log.md:6662–6683`) were rechecked and occur unchanged on fetched `origin/main` `5e37ffb616ec393af9097a198a9fc78dee9b8605`. No changed premise or new feature/retention/deletion choice was applied. Existing SP-278/SP-286, DL-076/DL-270 and BRS-031 bindings remain unchanged from round 1.

Standing checks: (1) both writer/retry replay-only negatives exist per prepared family; (2) CV-366 Application key rules are inapplicable to these explicitly Project-only families; (3) positives use the encoded Project partition; (4) event payloads remain bounded metadata far below 16 KiB, with the inline cap checked and no new large body, while SP-337 remains authoritative for larger bodies; (5) all lane identifier patterns are guarded and tested. No Application writer is introduced.

## Checks and scope

The full checker passes 206 boundary cases, all 84 original operation cases, 276 stateful traces / 464 steps, 128 canonical writer steps and 105 identifier cases. No original case or expected outcome was removed or changed: all original 188 boundaries, 84 operation cases, every old state snapshot and every old trace prefix are identical to the reviewed head. The four restored-defect probes each execute the full checker and are rejected by the new negative cases.

| Command / check | Exit | Output under the fix2 evidence directory |
|---|---:|---|
| `python3 scripts/pm_memory_maintenance_events.py` | 0 | `targeted-check.json` |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | `shard-generate.log` |
| `python3 scripts/pm-plan-index.py generate` | 0 | `index-generate.json` |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | `shard-check.log` |
| `python3 scripts/pm-plan-index.py validate` | 0 | `index-validate.json` |
| `Draft202012Validator(storage_value_registry.schema.json).validate(storage_value_registry.json)` | 0 | `storage-value-schema.json` |
| `Full-checker restored-defect probes and independent Astra reproductions` | 0 | `review-regressions.json` |
| `Original fixture / hold / non-lane registry / identifier-pattern scope audit` | 0 | `scope-audit.json` |
| `Current owner-premise comparison with origin/main` | 0 | `premise-checks.json` |
| `All 144 regraded cells and 252 exact current citations` | 0 | `regrade-validation.json` |
| `git diff --check` | 0 | empty |

Top-level index generate/validate statuses were parsed as `pass`; validation has no failures. Shard verification passes for 99 sources / 3,107 shards. All 15 ignored currentness-edition files were copied from the prescribed share before index generation, with matching SHA-256. Initial resource gates passed with 19 GB available RAM and 124 GB free disk; a later check had 10 GB available RAM and 113 GB free disk.

Shared prose changes are additions only within SP-630–637 and ATS-315. Contracts_V0 and AMS prose are unchanged this round. Only the six lane storage value schema mirrors change; all value metadata, profiles and unrelated rows are unchanged. Derived changes are limited to the edited `storage-plan`, `automated_testing_system`, `storage_value_registry` shard groups and the generated plan index. No unrelated document's derived output changed.

The source commit and report commit are pushed only to the DMEM branch. No test file was edited; checker discovery found only `scripts/pm_memory_maintenance_events.py` for this lane. No registry append, admission, Decision Log, `.gitignore`, Spec Lock, `.evidence`, auto-decisions, frozen validator, governance reseal, pm-mail, subagent, landing lock or main push. Auxiliary round-1 storage-profile/Assistant failures were not rerun or treated as proof for these changes.

## IDs and remaining work

No new PlanUnit ID was minted. Existing lane IDs retained: AMS-100–107, CV-650–657, SP-630–637 and ATS-315 (25 total); this round edits SP-630–637 and ATS-315. Unused reservations remain AMS-108–129, CV-658–659, SP-638–639 and ATS-316–319.

The four existing monthly-summary/prune holds keep their exact questions: monthly low-activation Note selection/source retention; archive-versus-delete eligibility with history/holds/pins. Dedup survivor/deletion policy remains unset and policy-dependent mutation stays unavailable. RT still must settle event/operation/selector/target retention. Independent re-review, admission and native receipt/atomicity/flush/crash/backup/read-race proof remain outstanding. Static success grants none of them.

## Evidence and cleanup

Report and self-grade copies overwrite `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/DMEM.md` and `DMEM-self-grade.json`. Round-specific outputs remain below. Temporary authoring/probe scripts are removed after their outputs are recorded. The detached sparse worktree `/home/sittingmongoose/pm-worktrees/DMEM-fix2` is removed with the prescribed literal-path command after the final branch push. No browser or server was started.

| Evidence path | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix2/targeted-check.json` | `018f67818b32d9c1e7b50a62c655457a46191373a0d31d96cd917c5424596471` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix2/review-regressions.json` | `60e9bb7f65f37d838e61596bc4923b5dfe7e94eb9c1c64a92147376358ce7f3f` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix2/scope-audit.json` | `539bc7ad34303079842201cc3e956d4d9ae1e5289444cb2578532747daf79e22` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix2/premise-checks.json` | `b85ec1df1d521af1bd1a7ec9c25b8994e3c1a77e0809b638a157cefde718c8f2` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix2/regrade-validation.json` | `c467d7a63d52998929ced5eb068f9175086a67a70d2f967ddf7e9543bfe2968f` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix2/storage-value-schema.json` | `80312a988d17b68b22b8c49276d6dd948cae7c0b596605dffca4f6ad828fcd7a` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix2/currentness-sha256.json` | `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix2/shard-generate.log` | `84374bbf7bd16b6b26dac68ab50d56c5a61e09d08b6b94ee15824c6f53c8245d` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix2/shard-check.log` | `1a25aa4c77107f640cfffd7413df3618d6e71a670a7cc06f349236660cad9fc6` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix2/index-generate.json` | `c473b236d3dc088c7f3696b0e7c0408073319e5c4f86d781c384ee31c265bb05` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix2/index-validate.json` | `e80de7264ef46b11d9659548ca31842ff25c7515e3a6aa8c0939adcc98fe98dd` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix2/commands.json` | `5c0616367322165ca563d33eaae289ef2f4d9141ede5b6cce12395ac46e191d8` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DMEM-sol/REVIEW-astra.md` | `ffb2ced310c3f14234a0bc85dfd56c3d6e92a0b1ac91e596247ccb8a7ac1f47d` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/FIX-ROUND.md` | `0112fe0c7453d44376870569216482dd5db9da0d37a00d90bd8dd57922480d27` |
