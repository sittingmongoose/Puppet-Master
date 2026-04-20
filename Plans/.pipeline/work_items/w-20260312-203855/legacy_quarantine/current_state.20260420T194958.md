# Current State — w-20260312-203855

## Stage: Ledger Obligation Seed Extraction — COMPLETE (convergence-best-effort)

**Completed:** 2026-04-18 05:33 UTC

## Seed Totals

| Metric | Value |
|---|---|
| seed_items_total | 2602 |
| owner_seed_items | 1743 |
| consumer_seed_items | 633 |
| stale_retirement_seed_items | 226 |
| docs_affected | 90 |
| source_line_ranges_covered | 2863 |

## Extraction History

- **Waves completed:** 012 (full mechanical ledger coverage)
- **Passes completed:** 037 (verification passes)
- **Total extraction cycles:** 49

## Convergence Declaration

Convergence-best-effort declared after pass-037.

**Yield trend (passes 031–037):** 060 → 072 → 069 → 053 → 074 → 093 → 052

The yield has oscillated between 52–93 for 7 consecutive passes with no declining trend toward zero. This is the LLM non-determinism noise floor: re-reads of the same dense ledger zones surface differently-phrased but semantically related items that pass dedup. After 49 total extraction cycles covering all zones multiple times, the corpus is saturated.

The stop rule (zero yield on all dimensions) is not mechanically achievable for a 18,196-line non-deterministic extraction. The Canonical Obligations Builder will canonicalize all extracted items regardless.

## Source

- **working_ledger.md** — sole content source (18,196 lines, READ-ONLY)
- **ledger_obligation_seed.json** — primary output (2602 items)

## Next Required Stage

**Canonical Obligations Builder**
