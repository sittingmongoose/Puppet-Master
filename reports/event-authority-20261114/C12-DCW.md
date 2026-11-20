# C12-DCW — criterion-12 closure (PNC-019 S4, lane 5)

Branch `plans/ea-pnc-c12-dcw-20261114`. Base `origin/main` `104c6c82b5ea0b5bf154806712496777c48c675b`. Implementation `7f12fdbc02e612d73b3cd8f7c640c7a5015e9d60` (commits `e0c1d8f4a0`, `34f746ec17`, `7f12fdbc02`); this report and the regrade are the next commit. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/c12-dcw/` (`SHA256SUMS`). Implementation self-grade; independent review stays with the lead. No new ids, no Plans owner text change, no admission, no reseal.

All eight families move **C12 PARTIAL → PASS**. Every other cell is unchanged (quotes re-pinned to moved lines only), so each family is now **10 PASS / 1 PARTIAL (retention) / 1 ABSENT (membership)**. Native execution stays `NOT_RUN`.

| Family | C12 | Reached rows | Schema exact kills (main + beyond-cap) | INVALID, no credit | Retained exact | Date-time checks |
|---|---|---:|---:|---:|---:|---:|
| `bundle.revision_requested` | PARTIAL → PASS | 238 | 26,914 + 26,891 | 10,683 + 2,990 | 34/34 | 28,079 |
| `bundle.revision_started` | PARTIAL → PASS | 235 | 30,264 + 13,450 | 12,977 + 1,513 | 34/34 | 41,139 |
| `bundle.revision_completed` | PARTIAL → PASS | 238 | 29,329 + 13,450 | 12,664 + 1,513 | 34/34 | 54,199 |
| `bundle.revision_interrupted` | PARTIAL → PASS | 235 | 30,562 + 13,450 | 13,226 + 1,513 | 34/34 | 56,811 |
| `wizard.opened` | PARTIAL → PASS | 213 | 21,671 + 15,642 | 8,464 + 1,792 | 34/34 | 22,202 |
| `wizard.deferred_payload.loaded` | PARTIAL → PASS | 218 | 26,513 + 17,834 | 11,176 + 2,057 | 34/34 | 32,650 |
| `wizard.blocked` | PARTIAL → PASS | 219 | 20,160 + 3,756 | 8,428 + 441 | 34/34 | 21,549 |
| `wizard.unblocked` | PARTIAL → PASS | 234 | 24,007 + 5,022 | 10,368 + 607 | 34/34 | 28,732 |

## Product checker defect found and fixed

- **Where:** `scripts/pm_dcw_event_oracles.py` `index_read` (new row at `:482`).
- **Why it broke:** all eight DCW readers accepted a current SP-278 generation carrying a schema-valid compaction `translation` whose manifest refs resolve no owner evidence. SP-278 says an opaque ref is insufficient (`Plans/storage-plan.md:21584`), and the checker's own `index_content` docstring says translation snapshots need their owner validator. Shown on real inputs: the accepting `valid_read` controls of all six ordinary families and both blockage bases, plus that translation body, all returned `accept`.
- **Fix:** new row **O234** `generation['translation'] is None` (code `index_translation_unverified`, own table 168): the direct-source reader makes a translated generation unavailable. 20 witnesses (`scripts/pm_dcw_c12_cases.py:101`, `:104`) cover read, rebuild and compatibility_read in every family; each is refused first at O234 and accepted with only O234 disabled. No fixture expectation changed (no authored fixture has a translation).

## Gated proof (tool `004bdedd63`, unedited, SHA-256 `e8038992…c0b8`)

Collection: 7,089 complete-checker executions, 0 mismatches, 0 untracked exceptions, 394 controls, 1,119 distinct negatives. **380 of 394 rows proved**, 168 tables (154 PASS, 14 FAIL = the by-construction singletons), 25,144 evaluations, 0 masked negatives, 0 unrelated changes. Per checker: oracles 241/251, blockage 106/108, legacy 20/22, registered 13/13. `reports/event-authority-20261104/DCW.guard-removal.md` lists every row.

The 14 by-construction rows (O014, O041, O077, O108, O109, O110, O117, O124, O125, B001, B054, L001, OE007, LE001) each sit alone. `scripts/pm_dcw_c12_entailments.py` makes their written proofs executable: 26 cited lines re-checked; **192 attempts**, each single change of the row's own input is refused first by the cited earlier guard with its exact code, and with that guard disabled the row itself refuses the same input (live backstop). OE007 is shown dead: the callback has no raise/assert of its own, and every bundle-path legacy refusal surfaces as `phase_order` before the fallback. L001/LE001 are entailed by OE001 (payload `Z$` pattern and the same shared EventRecord `date_time`).

## Complete boundary

A row is complete-boundary isolated when a witness is refused first there with its exact code and the unchanged complete checker **accepts** it with only that row disabled.

- **311 rows** have such a witness in the collection; **18 more** after `scripts/pm_dcw_c12_boundary.py` classified every lane witness (the collection cut-tests one alias per observation). Of these, 32 rows were closed by new coherent witnesses in `scripts/pm_dcw_c12_cases.py` (every other copy of the changed fact reissued; `sealed` kind installs the matching sealed store for one call). Three of them show load-bearing product rules: **O207** (out-of-order frames with fabricated matching gaps), **B019** (an Unblocked whose predecessor is a valid Unblocked) and **B096** (duplicated restore member).
- **51 rows** carry checked implications (`scripts/pm_dcw_c12_implications.py`, status pass): **25 entailed** (a named later row refuses every input the row refuses, checked against every observed cut chain) and **26 fail-closed preconditions** (the next statement dereferences exactly what the row refuses; checked by exception type and dereference text).
- 329 + 51 + 14 = 394.

## Schema (whole-definition Method B at OE001)

`scripts/pm_dcw_c12.py` captures every value the real `check_schema` accepts at each real site, in that site's historical/current mode, from authored controls. Each data proposal is decided by the real call: credit only for the exact `OE001`/`schema` refusal whose OE001 cut accepts and restoration refuses. Attribution uses a mirror validator whose accept/refuse result is asserted equal to the real call on every proposal. Main ledger: **209,420 exact kills, 87,986 INVALID** over 156 site runs; `scripts/pm_dcw_c12_supplement.py` audits path-novel controls beyond the eight-per-site cap (non-empty checkpoint gaps, translation bodies, payload_reference blockage sources): **109,495 more kills, 12,426 INVALID**. Clauses: 15,501 witnessed, 242 witnessed by the supplement, 91 witnessed at the identical site in another family, 97 vacuous (`minItems: 0` style), **0 unwitnessed**. Keyword independence is not claimed (W3H route); each witnessed clause also records its single-clause cut (isolated or masked).

## Copy joins, replay, numbers, time, retained reads

- **Joins** (`scripts/pm_dcw_c12_joins.py`): 193 two-copy rows. 91 have each copy changed alone and refused first there; 76 have the second copy located and pinned by named earlier joins (checked by disabling those joins until the row is reached); 24 carry written dispositions (derived, configuration or legacy-callback copies); 2 are by-construction rows.
- **Full replay** of the original suite at the final checker: 6 ordinary family CLIs (6,039 full-contract cases), 2 blockage CLIs (489 results), 6 standing suites, 6 registered suites (774 outcomes), table check (394 rows / 168 tables), all exit 0.
- **Numbers:** `pm_event_numbers.py --self-test --scope numbers` pass (580: 276 positives, 304 negatives); DCW number lane 3,040 cases pass (139 raw + 216 scalar shared-corpus inputs); the 4,400-digit Storage sequence reaches exactly `integer_range`.
- **Date-time** (`scripts/pm_dcw_c12_datetime.py`): 437 date-time field instances at real sites, 653 shared battery samples each: 264,465 EventRecord and 20,896 storage_utc_z checks, **0 mismatches**. `acknowledged_at_utc` (custody_v2 receipts) takes EventRecord (E5-2). Six direct `date_time` call sites are inventoried.
- **Shared inventory gate:** refused, not passed — the unmodified exclusions cite missing `pds-20261114-002…/span_map.jsonl` (1 scan refusal + 290 derivative missing nodes; scope-all `NOT_RUN_ADMISSION_REFUSED`). Eight tracked audit inputs were materialized from HEAD first. Same as the existing TOOL-ISSUES row; DCW corroboration appended. No helper or exclusion edited.
- **Retained reads** (`scripts/pm_dcw_c12_retained.py`): 272 observations, all exact — accepted, missing, ambiguous, other-original, unknown-recipe, tampered original, receipt for another original, withdrawn, revoked — across read, rebuild, compatibility_read and retry. The sealed store (`_ISSUED` + `_RECIPES`) and the caller input are identical before and after every read.
- **Tool self-tests** (`scripts/pm_dcw_c12_selftest.py`): 12/12 — wrong-code/unrelated cuts, mirror drift, chains and exceptions, missing implications and a store-mutating read are all refused.

The compact matrix (owner phase → row → control, negatives, gated cut and restoration, complete-boundary status; every schema site and clause) is `reports/event-authority-20261114/C12-DCW-coverage.json`; `scripts/pm_dcw_c12_matrix.py` checks it (status pass, 0 problems).

## Nothing for Jared

No product choice was needed. O234 implements existing SP-278 text.
