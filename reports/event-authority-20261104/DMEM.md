# DMEM fix round 4 — 2026-11-04

Branch: `plans/ea-w2-memory-maintenance-20261104`. Assessed source head: `e850f298670855b745b0cfe6ee75acd3cf3518f8`. Reviewed head: `009027140a5c3ecab7df7d22214b78a92b7a4ae8` (Astra round 2). Gate redesign: `74995bb921`. Standing check 9: `e850f29867`. This report and the self-grade are a report-only follow-up; the source pin is exact. Earlier reports remain in Git history.

The program lead allowed one extra round: redesign the start-custody gate that failed three times (Astra round 1 B3, Sol cycle 3 B4, Astra round 2 B1) and fix Astra round 2 B2. Nothing else was changed.

## Outcome and family grades

**Worker result: 8/8 prepared**, up from Astra round 2's 0/8, pending independent review. Only the eight `positive_negative_oracles` cells change (PARTIAL → PASS). Membership stays ABSENT and retention PARTIAL. Native execution stays NOT_RUN. The four monthly-summary and prune/archive families stay held and ungraded; their contract rows are byte-identical.

| Exact family | Before P/Q/A | After P/Q/A |
|---|---|---|
| `memory.dedup_sweep.completed` | 9/2/1 | 10/1/1 |
| `memory.dedup_sweep.started` | 9/2/1 | 10/1/1 |
| `memory.index.lexical.rebuild.completed` | 9/2/1 | 10/1/1 |
| `memory.index.lexical.rebuild.started` | 9/2/1 | 10/1/1 |
| `memory.index.semantic.rebuild.completed` | 9/2/1 | 10/1/1 |
| `memory.index.semantic.rebuild.started` | 9/2/1 | 10/1/1 |
| `memory.verification_sweep.completed` | 9/2/1 | 10/1/1 |
| `memory.verification_sweep.started` | 9/2/1 | 10/1/1 |

Prepared totals move from **72 PASS / 16 PARTIAL / 8 ABSENT** to **80 PASS / 8 PARTIAL / 8 ABSENT**. Including the four preserved held rows, the file holds 84 / 16 / 44. All 392 citations were re-pinned to the source head; every quote is an exact substring of at most 200 characters.

## The start custody gate (one rule)

**Rule.** Every path of a memory-maintenance operation after first start admission must resolve and verify the exact original start record before it appends, CAS-publishes a row or selector, settles an effect, or returns or discloses an original. Paths covered: start-append retry, start-row advance, effect/prepare/swap/settle, terminal append, the effect_committed → completed advance, retry and replay of either original, recovery from every phase, canonical writer append/retry, boundary acceptance and the history reader. The start record is the SP-286/CV-339 retained full-value original of `memory.<op>.started@1.0.0` under the operation's canonical key, read through `resolve_full_value.v1`. Five things are verified:

- **Identity.** `event_id`/`idempotency_key` recompute from the started family's recipe.
- **Digest.** The full-value commitment recomputes.
- **Operation.** Correlation and payload fields equal the operation row.
- **Phase.** The event type is exactly the started type, and the row is `accepted` only before the receipt.
- **Receipt.** It is settled under full flush. The row's `started_event_id` and every later original's causation and `started_event_id` name exactly this record.

There must also be no withdrawal fence on either edition. Missing, corrupted, mismatched or withdrawn custody refuses with `start_receipt_missing` (or `permission_or_withdrawal` under a fence), with no append, CAS, effect or output. The operation stays at its last durable phase and is never reissued. The gate is checked on the prior durable state and again on the tentative result immediately before commit. A path that skips an earlier check, or a path added later, therefore still cannot complete without it. The only relaxation is the started family's first append from an accepted row with no receipt and no later original. Even then a record that is present is verified, and the append must leave a verified record.

**Where it is written.** Each family's own storage unit carries its own "Start custody gate for exactly <family>@1.0.0" paragraph, citing SP-286, CV-339 and its own AMS/CV/SP units (SP-630–SP-637, `Plans/storage-plan.md`). Each writer-boundary paragraph's old patched custody sentence now points to it. The checker asserts each paragraph and its citations exist.

**How it is enforced.**

- **Checker.** `scripts/pm_memory_maintenance_events.py` has one `start_custody_gate`. Every earlier custody check calls it, and it is evaluated again at the commit point of `transition` (all ops except `crash`, which only drops volatile state), `append_current`, `accept` and the new `read_history`.
- **Schemas.** The closed operation schemas already require an exact-format `started_event_id` in every phase after `accepted`, and every completed payload requires it. Round 4 adds null, foreign-identity and trailing-LF start-receipt cases for every later phase of all four operation definitions (42 cases).
- **Cross-document equality.** The retained record's equality with the row cannot be expressed in JSON Schema, so the gate carries it.

## Negative matrix

`start_custody_matrix` in `Plans/memory_maintenance_event_fixtures.json` is fixture-declared. Expected outcomes were written from the rule above, not taken from checker output. **938 paths, each run first as a positive control against its authored after-state and output. 9,248 negative cells. All 9,248 refuse exactly, with unchanged state and no output.**

| Model | Paths | Negative cells | What the paths are |
|---|---:|---:|---|
| Phase model (`transition`) | 616 | 6,088 | Every positive non-crash step of every unedited trace, plus retry and replay of every retained original, recovery from every phase, and both terminal advances (succeeded and failed). Ops covered: append_started, advance_started, prepare, swap, settle, append_completed, advance_completed, retry, replay, recover. |
| Canonical writer (`append_current`) | 76 | 812 | Every positive append/retry step. Started families add retries at started, completed and failed_completed. |
| History reader (`read_history`) | 200 | 2,000 | A read of every retained original in every state. |
| Boundary (`accept`) | 46 | 348 | Every positive boundary case, plus new positives at every later phase. |

**Defect kinds** (each applied to the reduced start record, and separately to the started writer's own canonical start):

- missing
- digest zeroed
- value changed without rehash
- other operation, rehashed
- foreign storage identity, rehashed
- wrong event type, rehashed
- changed payload (frozen time), rehashed
- unflushed receipt
- extra record field
- withdrawal fence

**Expected refusal.** `start_receipt_missing`. The one exception is retry/replay of the started event in the phase model, whose own requested-original check already reports `original_missing` first. A withdrawal fence gives `permission_or_withdrawal`, and the boundary gives `false`. Absence is skipped only for first start admission.

**Per family:**

| Family | Paths | Cells |
|---|---:|---:|
| dedup completed | 96 | 951 |
| dedup started | 98 | 956 |
| lexical completed | 136 | 1,351 |
| lexical started | 139 | 1,366 |
| semantic completed | 136 | 1,351 |
| semantic started | 139 | 1,366 |
| verification completed | 96 | 951 |
| verification started | 98 | 956 |

The checker also requires that each family covers every op, every lawful phase in the phase and reader models, and the writer phases, and that its declared cell count matches.

## Review round 4: findings and responses

### Astra round 2 B1 — fixed (`74995bb921`)

**Where:** `transition(op="advance_completed")` in the checker; SP-630–637.
**Cause:** the effect_committed → completed advance checked terminal custody and CAS but not the start record. Each earlier fix (Astra 1 B3 in `accept`, Sol cycle 3 B4 in `append_current`) patched one path and left this one open.
**Fix:** the one gate above, checked at the commit point of every path, plus an explicit call in `advance_completed`. The new `failed_terminal_saved` state adds the failed-outcome advance.
**Verify:**

- Astra's 64 invalid advances (4 defects × 2 outcomes × 8 families) all refuse `start_receipt_missing` with unchanged state; the 16 intact controls advance (`prior-findings.json`, `astra2-B1`).
- Astra's own harness, rerun at this head, reports `invalid_start_advances_accepted: 0` (was 64).
- Astra's added negative trace now passes the full checker (`custody-negative`).
- Restoring the defect (removing the gate from `advance_completed` and the commit point) makes the full checker exit 1 (`restored/astra2-B1-terminal-advance.py`).

### Astra round 2 B2 — fixed (`e850f29867`)

**Where:** `validator()` and `main()` in the checker.
**Cause:** `check_schema` checks syntax only, and instance validation resolves only the references a fixture reaches. Definitions were also validated outside their own document.
**Fix:** before any instance validation, `require_resolved_references()` walks every subschema of the five schema documents the checker uses and the six registry mirrors. It follows nested `$id` bases, resolves every `$ref`/`$dynamicRef` offline (no retrieval) and fails on any unresolved one. Definitions are now validated inside their own documents.

Each family has eight `reference_cases`:

- dormant missing reference
- active missing reference
- dormant resolving reference
- nested-`$id` base
- cross-document resolving reference
- cross-document missing reference
- unknown document
- dormant missing reference in its operation definition

**Verify:**

- Astra's dormant mutation now exits 1 for all eight families, through both Astra's harness and `fix4-audit.py`.
- Active, nested-base, operation-definition and flipped-expectation mutations also exit 1.
- With the walk removed (`restored/astra2-B2-no-reference-walk.py`), the same dormant mutation exits 0. That control shows the walk is what catches it.

### Earlier findings — rerun at this head

| Finding | Rerun result |
|---|---|
| Sol cycle 1 blocker 1 (target custody) | Prepared target required, unknown target field and wrong target identity rejected for all index definitions. Astra 2 harness: 0 target false accepts. |
| Sol cycle 1 blocker 2 (semantic oracles) | Changed terminal result rejected for all four completed families. Null completed start receipt fails the schema. |
| Astra 1 B1 (replay-only) | 16 replay-only refusals and 224 required-field deletions, all refused exactly. |
| Astra 1 B2 (recovery fences) | 32 denied or withdrawn recoveries refuse, succeeded and failed. Restored defect exits 1. |
| Astra 1 B3 (started boundary) | Four exact reproductions return false. Restored defect exits 1. |
| Sol cycle 3 B4 (terminal writer retry) | 20 missing-start writer retries refuse. Restored defect exits 1. |
| Sol cycle 3 N1 / Astra 2 note (timestamps) | Unchanged qualification: four index JSON files carry `generated_at_utc`. |

The reviewers' harnesses were copied unchanged except for their checkout and output paths, and run at this head:

| Harness | Result at this head |
|---|---|
| Sol cycle 2 `independent-probes.py` | 248/248 |
| Sol cycle 3 `cycle3-probes.py` | 665/673; 8 explained below |
| Fix 3 adapted probes | 665/673; same 8 |
| Fix 3 `prior-findings.py` | 180/180 |
| Sol cycle 1 `review-probes.py` | Exits 1 at its setup row (see below) |
| Astra round 2 `review_probes.py` | 444 direct probes with 0 false accepts; full-checker table below |

**The eight `cycle3-probes.py` failures** are all its `regression:old-states-and-traces` probe. That probe requires exact equality of the whole state map, and round 4 adds one state per family (`failed_terminal_saved`). Every older state and trace is unchanged (`scope-audit.json`), so this is an additive change, not a weakening.

**Sol cycle 1's `review-probes.py`** asserts that the defects exist, using a row shape that has lacked the required `started_occurred_at_utc` since fix round 1. It now exits 1 at that setup assertion. Its two findings are re-expressed at this head in `prior-findings.json` (`cycle1-B1`, `cycle1-B2`: 16/16).

**No finding is disputed, and no cell needs a Jared decision.**

## All ten standing checks

Every row is run through the complete checker, once per family. A corrupted expectation must make the process exit 1 with an AssertionError. Exit 0 fails the audit.

| Exact family | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | Gate |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `memory.dedup_sweep.completed` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.dedup_sweep.started` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.index.lexical.rebuild.completed` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.index.lexical.rebuild.started` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.index.semantic.rebuild.completed` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.index.semantic.rebuild.started` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.verification_sweep.completed` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.verification_sweep.started` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

Each cell is backed by three sources: `fix4-audit.py` (23 full-checker mutations per family, 184 in all), Astra round 2's own harness (13 per family, 104 in all; 96 exit 1, and the 8 `custody-negative` runs exit 0 because the added lost-start trace now passes), and the direct probes. `standing-checks.json` holds every exit code.

| # | Negative that must fail the full checker (each family) | Qualification |
|---|---|---|
| 1 | Fresh and retained-original `projector_replay_only` expected to succeed. | Replay-only is never a current writer policy. |
| 2 | Exact CV-366 Application key expected to succeed. | These contracts are Project-only; no Application writer is introduced. |
| 3 | Raw Project partition expected to succeed. | Positives use `project~cHJvamVjdC0x`. |
| 4 | 17,000-character body expected valid. | Bounded inline roots (2,348–2,649 MessagePack bytes); SP-337 stays authoritative for larger bodies. |
| 5 | Trailing-LF identifier expected valid. | 170 guarded pattern declarations unchanged. |
| 6 | Caller-semantic conflict expected to succeed; Storage-assigned sequence expected in the returned original. | |
| 7 | Foreign checkpoint storage expected to join. | Adopted SP-278 generic identity only. |
| 8 | Denied-permission negative expected to accept. | Checker failure propagation; these events have no process-exit field. |
| 9 | Dormant, active, nested-base and operation-definition missing references; flipped reference-case expectation. | |
| 10 | Withdrawn read expected to return; source-changed read expected to refuse; forged read expected to return. | History reader. |
| Gate | Refusal code flipped, cell count changed, a defect kind dropped, a control's after-state changed. | Astra's lost-start trace must pass (exit 0). |

**Restored defects**, one patched checker copy each under `restored/`. Each must make the suite fail:

| Restored defect (patched copy of this head's checker) | Exit | Where the suite fails |
|---|---:|---|
| Astra 2 B1: no gate in `advance_completed` and no commit point | 1 | Matrix `phase:advance_completed@terminal_appended`, missing start |
| Sol cycle 3 B4: writer gate after the original return, no commit point | 1 | `effect_committed-retry-start-missing` |
| Astra 1 B2: recovery without permission/withdrawal check | 1 | `completed-recovery-permission-refusal` |
| Astra 1 B3: boundary acceptance without the gate | 1 | `started-missing-original-start` |
| Gate made a no-op | 1 | `started-missing-original-start` |
| Astra 2 B2 control: reference walk and reference cases removed, dormant `$ref` added | 0 | Defect reproduced; the head exits 1 on the same mutation |

## Checks, scope and limits

| Command / check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_memory_maintenance_events.py` | 0 | 224 boundaries; 126 operation cases; 276 traces / 464 steps; 340 writer steps; 129 identifier cases; 32 checkpoint joins; 108 history cases; 64 reference cases; 6 registry mirrors reference-checked; matrix 938 controls / 9,248 negatives. Runs in about 12 s. |
| `fix4-audit.py` (in-process) | 0 | 400/400 direct probes of every earlier finding. |
| `fix4-audit.py` (full checker) | 0 | 190/190 subprocesses as required: 184 standing/gate mutations (176 exit 1; 8 `custody-negative` exit 0) and 6 restored defects. The first B1 restored copy had an empty `if` body; it was fixed and the restored rows rerun (`restored_rerun_note`). |
| Reviewer harness reruns | see above | 248/248; 665/673 twice (8 explained); 180/180; Astra 2: 444 direct probes, 0 false accepts. |
| Shard `--generate`, then index `generate` (each commit) | 0 / 0 | Parsed status pass. Only `automated_testing_system` and `storage-plan` shards and the index changed. |
| Shard `--check --config Plans/sharding_config.json` | 0 | Pass, failures empty; 99 sources / 3,107 shards. |
| `python3 scripts/pm-plan-index.py validate` | 0 | Parsed top-level pass; failures empty. |
| Scope and preservation audit | 0 | No forbidden or test path. No new PlanUnit id. Lane schemas, contracts and storage-value registry unchanged. Every older case, state, trace and expectation unchanged. Four held rows still `blocked_on_Jared`. |
| Regrade and quote check | 0 | 392 citations re-pinned; eight oracle upgrades only. |
| Currentness copy and owner premises | 0 | 15/15 edition files match. None of the owner documents changed on `origin/main` `16acf7594a` since the merge base. |
| `git diff --check 009027140a e850f29867` | 0 | No whitespace errors. |

**Paths touched.** `Plans/storage-plan.md` (SP-630–637 gate paragraphs), `Plans/Automated_Testing_System.md` (ATS-315), `Plans/memory_maintenance_event_fixtures.json` (additive), `scripts/pm_memory_maintenance_events.py`, and the generated shards and index.

**Not touched.** No test file, event-family registry append, admission, Decision Log, `.gitignore`, Spec Lock, `.evidence`, auto-decisions, frozen validator, landing lock or `main` push. No mail and no subagent. Aggregate landing checks are left to the landing agent.

**Resource gates.** Initial: 109 GB disk free and 16 GB RAM available. The sparse worktree uses `Plans scripts reports tests`.

## IDs and remaining work

**New IDs: none.** Existing lane IDs are retained: AMS-100–107, CV-650–657, SP-630–637 and ATS-315. Only SP-630–637 and ATS-315 prose changed this round. Unused reservations stay unused.

Still open after this round:

- Final independent review.
- Event, operation, selector and target retention (`PENDING_RETENTION_DECISION`). The gate selects no retention period.
- Admission.
- Native receipt, atomicity, flush, crash, backup and read-race proof.
- Applying DL-402/DL-403 to the four held families, which is separate work.

## Evidence and cleanup

Raw outputs and runnable audit scripts are outside the repository under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix4/`. Key files:

- `targeted-check.json`
- `prior-findings.json`
- `full-checker-mutations.json`
- `standing-checks.json`
- `restored/`
- `rerun/` (each reviewer harness with its `run.log` and outputs)
- `scope-audit.json`
- `premise-checks.json`
- `regrade-validation.json`
- `c1-*` and `c2-*` generate/check/validate outputs
- `currentness-sha256.txt`
- `author_fix4.py` and `owner_fix4.py` (the fixture and owner-text authoring scripts)

SHA-256 values are in `evidence-sha256.json`. The worktree `/home/sittingmongoose/pm-worktrees/DMEM-fix4` is removed with a literal-path `git worktree remove --force` after the report is pushed.
