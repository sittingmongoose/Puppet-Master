# Current State — w-20260312-203855

## Stage: Ledger Obligation Seed Extractor — BLOCKED (Deferred)

**Status**: active  
**Next required stage**: Canonical Obligations Builder (after deferred rerun)

## Ledger Obligation Seed Summary

| Field | Value |
|---|---|
| seed_items_total | 594 |
| owner_seed_items | 402 |
| consumer_seed_items | 162 |
| stale_retirement_seed_items | 28 |
| docs_affected | 93 |
| source_line_ranges_covered | 587 |
| verification_passes_completed | 3 (hard cap) |
| material_findings_deferred | 29 |

## Wave Files Written

ledger_obligation_seed.wave-001.json through wave-012.json  
Coverage: L1–L18196 (full ledger, 46 chunks × ~400 lines, 12 waves)

## Verification Passes

| Pass | Ranges | Material | Noise |
|---|---|---|---|
| pass-001 | L2000–2400, L5600–6000, L9600–10000, L13600–14000 | 22 | 20 |
| pass-002 | L800–1200, L7600–8000, L10000–10400, L12000–12400 | 59 | 49 |
| pass-003 | L3200–3600, L4800–5200, L11200–11600, L15200–15600 | 29 | 58 |

Pass 3 reached the hard cap and still found 29 material items.  
32 high-risk ranges remain unverified by re-check passes.

## Deferred

- ledger_obligation_seed.deferred.json contains the 29 pass-3 material findings
- and 32 unverified ranges recommended for next run

## Files Active

- working_ledger.md — sole content source, READ-ONLY
- ledger_obligation_seed.json — merged seed (594 items, 93 docs)
- ledger_obligation_seed.wave-001..012.json — wave results
- ledger_obligation_seed.pass-001..003.json — verification pass material
- ledger_obligation_seed.noise-001..003.json — noise (not merged)
- ledger_obligation_seed.deferred.json — deferred findings for next run
- meta.json — control record

## Legacy Quarantine

All prior-run artifacts quarantined in legacy_quarantine/.  
This run is a clean-slate extraction.
