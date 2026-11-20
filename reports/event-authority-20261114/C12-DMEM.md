# C12-DMEM — static oracle closure

Implementation commit: `232d40bba3d9e063c8ad860806ab17f866c43c9c`. Base: `origin/main` `7cf56368356da2b7a5ff25f6452cf753ce36bf45`. Branch: `plans/ea-pnc-c12-dmem-20261114`. Lane 10; no new IDs. Implementation self-grade; independent acceptance review remains with the lead.

All twelve criterion-12 cells move **PARTIAL → PASS**. Every other criterion cell is preserved unchanged. The old aggregate grade's `ABSENT` membership, other retention cells and native `NOT_RUN` remain outside this regrade; no family is admitted here.

| Family | C12 before → after | New schema-row exact kills | Invalid proposals, no credit |
|---|---|---:|---:|
| `memory.dedup_sweep.completed` | PARTIAL → PASS | 30690 | 5497 |
| `memory.dedup_sweep.started` | PARTIAL → PASS | 4559 | 2495 |
| `memory.index.lexical.rebuild.completed` | PARTIAL → PASS | 13487 | 3852 |
| `memory.index.lexical.rebuild.started` | PARTIAL → PASS | 4559 | 2495 |
| `memory.index.semantic.rebuild.completed` | PARTIAL → PASS | 12307 | 3844 |
| `memory.index.semantic.rebuild.started` | PARTIAL → PASS | 4559 | 2495 |
| `memory.verification_sweep.completed` | PARTIAL → PASS | 7119 | 3635 |
| `memory.verification_sweep.started` | PARTIAL → PASS | 5761 | 3283 |
| `memory.monthly_summary.completed` | PARTIAL → PASS | 6365 | 3234 |
| `memory.monthly_summary.started` | PARTIAL → PASS | 2794 | 1866 |
| `memory.prune_archive.completed` | PARTIAL → PASS | 6211 | 3088 |
| `memory.prune_archive.started` | PARTIAL → PASS | 2783 | 1757 |

The counts are distinct executions in the **schema-phase ledger**, not counts of individually proved schema keywords or full-boundary code mutants. There are **101,194 exact schema-row kills and 37,541 invalid/no-schema-defect proposals**. The 300 authored controls cover 96 exact-family schema sites; 29 shared sites reuse only identical schema, table and case pins. Reused mutation references add no new kills. Complete definitions retain type, const/enum, closed properties, required fields, branch/ref structure, lengths, patterns, formats, number bounds and array/containment constraints. This is the W3H whole-definition Method B route allowed by the C12 scope, with clause/branch inventory and concrete field witnesses, rather than a claim of keyword independence. The existing validators and named refusing predicates remain the authority; no schema or frozen tool is weakened.

## Real checker changes and gated result

All implementation items below are commit `232d40bba3d9e063c8ad860806ab17f866c43c9c`.

| Item | Source | Verify |
|---|---|---|
| Whole-definition schema clauses and strict mutation ledger | `scripts/pm_memory_c12.py:269` | Run pm_memory_c12.py; verify coverage and mutation/invalid files. |
| Actual retained-store observations | `scripts/pm_memory_c12.py:364` | Check closure/retained-store.json and verification.json. |
| Ordered singleton expansion | `scripts/pm_memory_maintenance_events.py:112` | Generator --check; predicate-parity.json; gated singleton reports. |
| Stale CK08 implication replaced | `scripts/pm_memory_guard_witnesses.py:420` | Full exact-family replay; guards-complete/ck_scope.json.gz. |
| Twenty-six checked implications and cap bounds | `scripts/pm_memory_c12_entailments.py:56` | Run pm_memory_c12_entailments.py; compare the exact unproved-row set. |
| Proof-tool and exact policy negatives | `scripts/pm_memory_c12_selftest.py:18` | Run pm_memory_c12_selftest.py; all sixteen tests pass. |

**Where:** `scripts/pm_memory_guard_witnesses.py` checkpoint joins. **Why:** the former CK08 implication assumed both envelope editions fixed Project scope, while the current generic EventRecord permits Application with null `project_id`. **Fix:** present a coherent Application-scope envelope, independently sealed as written; the complete join reaches exactly `CK08_scope_kind/checkpoint_join` on all twelve families.

Six grouped implication sites are expanded into ordered singleton tables by the original generator and `require()` adapter. Ordered predicate specs are identical to the base: 316 rows before/after, 183 → 191 tables, maximum seven rows. Extra observation fields still refuse.

The gated tool `004bdedd63` freshly proves **290/316 rows**. The other **26 are checked implications, each alone in its own table**, with exact source citations and explicit encoded upper bounds in `entailments.json`; none is counted as a kill. CK08 increases the proved count from 289 to 290. The proof has **589/589 own flips, 989 stays, zero masked negatives and zero unrelated changes**; uncapped lane matrix and collection findings are empty. It records 30,948 complete-checker witness calls. The original CLI exits **1**, because it reports the 26 deliberately unproved rows (25 `FAIL unproved_guards`, one `NOT_RUN_NO_CONTROL` for archive's unreachable prepared reservation). This report preserves that result. `verify-evidence.py` checks exact equality with the implication ledger and returns `pass`.

The cap implications are checked, not inferred from unsuccessful mutation proposals: payload bounds are at most 3,822 bytes, archive operations at most 5,196, and selectors at most 16,261, all below 16,384. A self-test enlarging the selector invalidates the implication proof.

## Complete replay, numbers, time and original custody

The original eight-family maintenance and four-family archive suites passed. The final gated collection then replayed the **original complete suite for every exact family** on the changed checker, including lifecycle/failure/crash/recovery, source/receipt/result/checkpoint joins, dormant references, current/compatibility history, cutoff authorities and policy preservation. All twelve returned pass; collection findings are empty. The new CK08 negative is a distinct sealed copy, with the operation and checkpoint witnesses intact.

The shared number self-test passes **580/580**. Every exact family passes its **111 applicable corpus cases** at its own boundaries; non-applicable operations keep their reasons. A 4,400-digit integer presented to the complete writer reaches exactly the Storage uint64 refusal, without an integer-string crash.

The original local date-time inventory/battery covers **76 date-time declarations** among 85 formatted declarations, through the explicit owner profiles and shared predicate. It exercises 2,432 leaf values, 504 shared refusal causes and 76 string-subclass refusals per complete suite invocation, plus real writer/retained envelope profiles and policy instants. Current operation and Storage timestamps retain their stricter Z profiles; EventRecord and policy instants keep their broad profile. Dedicated policy tests accept exact 90/180-day thresholds, reject one exact rational tick of recency beyond 4,400 fractional digits, and reject equality at the exclusive score cutoffs.

**336 retained-read observations** cover four authored editions/modes per family, with accepted, missing-receipt, ambiguous-receipt, other-original, unknown-recipe, withdrawal and revoked-access cases. Each records the actual synthetic custody-store snapshot, before/after hashes and caller non-mutation. Missing/foreign/ambiguous receipts are never fabricated during reading. Physical authentication remains native `NOT_RUN`.

The adapter's **16 self-tests** include incorrect codes/rows/phases, unrelated errors, ineffective cuts, failed restoration, extra split fields, stale cap implications, the large integer and exact policy edges. Those failures cannot earn mutation credit.

## Shared gate boundary and DL-475

The repository-wide date-time inventory is **refused**, not passed: `pm_event_datetime_exclusions.json` cites missing `Plans/.plan_migration/pds-20261114-002-current-planunit-snapshot/span_map.jsonl` at the pinned base. All eight required tracked audit dependencies were materialized unchanged before reproducing `scan_exclusions_invalid` plus 290 derivative missing-node failures. The combined 13,626-case self-test therefore records `NOT_RUN_ADMISSION_REFUSED`, zero case execution. This matches the existing C12-DT/DG6B tool issue; DMEM confirmation and the evidence hash are appended to the shared tool-issues list. No frozen helper/exclusion edit, fake old file or broad shared-suite PASS is used. Local DMEM profile/boundary evidence is separate.

DL-475 / Jared's E4-1 A stays intact: AMS-023 says no user-invokable Memory workbench or button is planned. This lane edits no Plans owner, registry, command catalog, governance artifact or UI. Fading and archive-only upkeep remain built in, with their existing holds. **Nothing needs a new product choice from Jared.**

## Evidence and replay

The compact owner/schema-site → predicate → control/negative/cut/restoration matrix is `reports/event-authority-20261114/C12-DMEM-coverage.json`; full inventories, controls, exact mutation/invalid ledgers, gated reports and store snapshots are in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/c12-dmem`. `SHA256SUMS` pins the entire delivered evidence. `quote-audit.json` checks every new C12 quote at its exact current line and verifies other criterion cells were preserved.

Run heavy commands only after 12 GiB is available and inside the mandated 2 GiB/no-swap scope, using `long-job start` and foreground `long-job wait <name> --timeout 1500`, re-armed on 124. Commands are:

```sh
python3 scripts/pm-memory-table-generate.py scripts --check
python3 scripts/pm_memory_maintenance_events.py
python3 scripts/pm_memory_archive_events.py
python3 scripts/pm-memory-guard-tables.py --pause-when-low 12 --resume-at 13 --max-rss 1800 --out <guards>
python3 scripts/pm_memory_c12.py --out <closure>
python3 scripts/pm_memory_c12_entailments.py --out <entailments.json>
python3 scripts/pm_memory_c12_selftest.py --out <selftest>
python3 scripts/pm_event_numbers.py --self-test --scope numbers
python3 scripts/pm_event_datetime_inventory.py
python3 scripts/pm_event_numbers.py --self-test
python3 /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/c12-dmem/verify-evidence.py --repo <worktree>
```

Generator check, Python compilation, predicate parity and whitespace checks pass. No subagent, browser, landing lock, main push or governance reseal was used. The clean worktree is retained for the lead until merge, as C12-RUN requires.
