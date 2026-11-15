# C12-DF closure — PNC-019 stream E

Implementation head: `a9d4ede87727abe7695f5a479a29636e5c5e98d0`. Base: `7cf56368356da2b7a5ff25f6452cf753ce36bf45` (`origin/main`). Branch: `plans/ea-pnc-c12-df-20261114`.

All nine assigned families move **C12 PARTIAL → PASS** under the scope's permitted whole-definition Method B route. Other cells are unchanged. This is a static family-oracle assessment; registry admission and native execution (`NOT_RUN`) remain separate. Independent reviews are `NOT_RUN`.

| Exact family | C12 before | C12 after | Reachable schema clauses | Exact clause kills / invalid proposals |
|---|---|---|---:|---:|
| `filesafe.command_denied` | PARTIAL | PASS | 2315 | 1981 / 86 |
| `filesafe.destructive_override_denied` | PARTIAL | PASS | 2546 | 2293 / 110 |
| `filesafe.destructive_override_granted` | PARTIAL | PASS | 3122 | 2818 / 134 |
| `filesafe.destructive_override_requested` | PARTIAL | PASS | 3134 | 2716 / 134 |
| `filesafe.guard_init_failed` | PARTIAL | PASS | 2204 | 1967 / 86 |
| `filesafe.path_denied` | PARTIAL | PASS | 2357 | 2029 / 86 |
| `filesafe.policy_degraded` | PARTIAL | PASS | 2168 | 1931 / 86 |
| `safe_point.created` | PARTIAL | PASS | 4632 | 4567 / 187 |
| `safe_point.restored` | PARTIAL | PASS | 7486 | 7606 / 312 |

## What changed

- The original `pm_filesafe_event_authority.py` and `pm_filesafe_event_contracts.py` entry points, predicates, owner schema bytes and resource/tool pins are preserved. The DF-only closure adapter observes their real schema calls, follows every referenced/conditional branch, and records owner-clause → actual schema row → valid control → expected refusal → clause cut → whole-definition row cut → restoration. It does not award per-keyword gated-row or complete-lifecycle isolation credit.
- Eleven grouped entailed tables become singleton tables through the existing generator: **223 tables, 403 unchanged predicates**. All 48 entailed predicates remain uncredited. The generated follower map preserves row order and observation fields. Fresh construction proofs confirm 69/69 attempts over the 47 legacy rows, 14/14 duplicate-site pair proofs, and the separate OS01 coupling proof. OS01 is still schema-plus-OS02 entailed; no witness is invented.
- Explicit complete-schema controls cover empty SCM index arrays, null SCM, optional original Project fields, the original Project restore operation array and the null post-restore-manifest branch. These controls prove the selected schema boundary; their edited values are not asserted to pass later source/body/receipt joins. Checked application-root scope constants supply 60 implications for unreachable project `else` clauses, with zero mutation/gated credit. The companion preserves and pins the raw inventory/gaps, checks the entire `if` condition and current owner/resource hashes, and supplies one extra exact null-body schema witness with clause/row cut and restoration. That witness earns no gated-row or whole-lifecycle credit. Original coherent full-lifecycle controls remain separate.
- Independent caller-source and selected-store mutations execute 36 exact `selected_source_join` refusals, accept after only SS04's cut, refuse after restoration, and leave the selected store unchanged. Their fresh gated table report is PASS.

## Proof and strict accounting

The unchanged gated tool is `004bdedd63`, source SHA-256 `e8038992eabbe067c8bcba8d48824b97fbb6b5b7e69cbfe28a669f939a96c0b8`. Its original all-family replay has **175 PASS table runs, 355 proved rows and 48 uncredited rows**, zero failed native table reports. The legacy driver exits 1 for its old missing-row metadata and seven coupled observations; that exit is not presented as a CLI pass. The final proof-rebinding report is **PASS**: every credited table has identical source bytes, tool hash, control/negative bytes, ids, target, code and control binding after the singleton extraction. All 48 remaining tables are checked singletons. The seven coupled observations remain invalid; each involved row has its own credited negative.

Schema ledger: **27908 expected-refusal kills; 1221 INVALID proposals**. Original complete-boundary ledger: **1080 exact kills; 0 invalid**. Independent source joins: **36/36 exact kills**. These categories are separate; proposal totals, later/unrelated errors, entailed rows and exceptions are never counted as isolated kills. Every credited schema mutation records the actual clause-cut result, including remaining masks, and the whole-definition row-cut/restoration result. The index covers 29964 reachable clauses and 26184 evaluated occurrences, with zero unresolved clauses.

Raw safe-point schema discovery preserves its 18/43 unvisited-clause counts and exit 1. The evidence-bound companion exits 0, closes all 61 through 60 checked implications plus one exact schema witness, and leaves the raw discovery files unchanged. The C12 grade JSON carries both raw and completed counts and pins both artifacts.

## Replay, numbers, timestamps and retained custody

The final post-split replay passes both original full CLIs, all authored coherent cases, the construction/pair proofs, deterministic table generation, the complete number runner, retained checks, original mutation ledger and adversarial tests. Number scope: **580/580 shared cases**; complete DF number routes: **2148**, zero untracked exceptions, including the 4,400-digit inputs.

The DF date-time inventory has **175 boundary nodes** and **119000 complete-schema corpus checks**, plus **12240 complete materialization/retained rows**. Date-time fields use EventRecord; observed_at_utc/persisted_at_utc add Storage UTC-Z. acknowledged_at_utc keeps EventRecord (E5-2). The exact unchanged executed timestamp function/class text is bound in `datetime-executed-source.json`; complete checker, helper and resource bytes are bound in SOURCE-PINS.json.

Retained store observations: **1952**, all unchanged, across original, missing receipt, ambiguous edition, foreign original, replaced resource and independent issued/expectation/receipt-copy changes. The snapshots cover the actual bank used by DFOriginalOwner, including issued originals, sealed original_custody, retained_boundary, sources, bodies and payloads. No receipt is created or restamped while reading.

**Shared inventory limit:** the unmodified global inventory is blocked by its exclusion citation to `Plans/.plan_migration/pds-20261114-002-current-planunit-snapshot/span_map.jsonl`, absent from HEAD. It reports one scan refusal and 290 derivative missing nodes. This is already on streams/TOOL-ISSUES.md (the origin/main 7cf563 row); no broad shared date-time PASS is claimed. Eight sparse audit inputs were materialized from exact tracked HEAD bytes before reproduction. The helper and exclusion file are unchanged. No Jared decision is needed.

## Evidence and verification

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/c12-df`. Every raw result is external; only this compact report and C12 grade JSON are committed. `C12-DF.json` carries exact current owner quotes, lines and SHA-256 plus per-family matrix, ledger, inventory and snapshot pins. `SOURCE-PINS.json` binds inputs; `SHA256SUMS` binds the complete retained bundle.

Public replay commands (run in a capped long-job with at least 12 GiB available):

```sh
python3 -B scripts/pm_filesafe_event_authority.py
python3 -B scripts/pm_filesafe_event_contracts.py
python3 -B scripts/pm_filesafe_c12_closure.py --mode schema --out /home/sittingmongoose/pm-scratch/ea-c12-df-recheck/schema
python3 -B scripts/pm_filesafe_c12_closure.py --mode datetime --out /home/sittingmongoose/pm-scratch/ea-c12-df-recheck/datetime
python3 -B scripts/pm_filesafe_c12_closure.py --mode retained --out /home/sittingmongoose/pm-scratch/ea-c12-df-recheck/retained
python3 -B scripts/pm_filesafe_c12_closure.py --mode mutations --out /home/sittingmongoose/pm-scratch/ea-c12-df-recheck/mutations
python3 -B scripts/pm-filesafe-c12-source-joins.py --out /home/sittingmongoose/pm-scratch/ea-c12-df-recheck/joins
python3 -B scripts/pm-filesafe-c12-covering.py --family safe_point.created --family safe_point.restored --evidence /home/sittingmongoose/pm-scratch/ea-c12-df-recheck/schema
python3 -B scripts/pm-filesafe-unproved-attempts.py --out /home/sittingmongoose/pm-scratch/ea-c12-df-recheck/entailed
python3 -B scripts/pm-filesafe-number-corpus.py --json /home/sittingmongoose/pm-scratch/ea-c12-df-recheck/numbers.json
python3 -B scripts/pm-filesafe-table-generate.py --check
python3 -B tests/test_pm_filesafe_c12_closure.py
```

`postsplit/summary.json` records the exact final command exits. `postsplit/proof-rebinding/proof-rebinding.json` references every native gated report by hash; rerun `pm-filesafe-c12-proof-reuse.py` with that report directory and `--base 7cf56368356da2b7a5ff25f6452cf753ce36bf45` to check source/tool/case equality. The existing guard driver remains available for a new native full proof.

All locations below are at implementation commit `a9d4ede87727abe7695f5a479a29636e5c5e98d0`. Owner clauses are separately quoted and hashed in C12-DF.json.

| Item | Source location | Verification |
|---|---|---|
| Schema coverage | `scripts/pm_filesafe_c12_closure.py:343` | --mode schema + covering companion |
| Original mutation ledger | `scripts/pm_filesafe_c12_closure.py:609` | --mode mutations |
| Retained store | `scripts/pm_filesafe_c12_closure.py:491` | --mode retained |
| Timestamp inventory/corpus | `scripts/pm_filesafe_c12_closure.py:534` | --mode datetime |
| Singleton extraction | `scripts/pm-filesafe-table-generate.py:863` | --check; order/field adversarial test |
| Exact proof reuse | `scripts/pm-filesafe-c12-proof-reuse.py:18` | postsplit/proof-rebinding/proof-rebinding.json |
| Scope implications | `scripts/pm-filesafe-c12-covering.py:22` | --family safe_point.created/restored --evidence DIR |
| Null-body schema witness | `scripts/pm-filesafe-c12-covering.py:36` | same companion; 1 exact schema kill, zero gated credit |
| Independent source joins | `scripts/pm-filesafe-c12-source-joins.py:12` | source-joins/gated-source-join.json |
| Adversarial tests | `tests/test_pm_filesafe_c12_closure.py:13` | 12 tests; tests-final.txt |

No Plans prose/schema, registry, governance lock/evidence, frozen tool/NUMRULE source, main branch, WorkNode or new SP/CV/ATS/DL id changed. No subagent or browser was used. The lane worktree remains for the lead's merge; final branch pushes are confirmed on both configured URLs in the handoff.
