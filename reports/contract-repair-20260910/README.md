# Bounded contract repair integration — 2026-09-10

Applied the guarded BSD, Context Lens, Browser-candidate, and packet-audit tooling repair from baseline `400d97e71b06cf39ce7263772a84eeb7e4b62e4a`. The original package reused existing PlanUnit `ACD-459`; integration assigns the new Lens requirement `ACD-460` and preserves the research-decision requirement. `BSD-029` is the other new unit.

Validation: 89 package tests, 15 candidate tests against the complete Browser owner schema, and 22 existing packet-audit regressions pass. The real legacy custody corpus verifies 339 documents, 569 slices, and 74,180 reconstructed lines. Shard and PlanUnit-index validation pass, and derived changes belong only to edited owners. One protected-auth fixture test fails identically before and after the repair.

The scoped checker resolves six targeted gaps (25 → 19). Sixteen Touch Closure disposition findings, three reference findings, and all 53 Browser admissions remain open. Structural checks do not supply per-case semantic review or native proof.

Standard gates fail in the same 12 categories before and after integration. Evidence and plan-graph checks each add 105 failures: 104 historical pins become stale after the settings/source-shard changes and the old final-shard path is renamed by regeneration. Historical evidence and Spec Lock are not repinned. Runtime readiness remains blocked.

Browser Event Authority admission, the full formal packet audit, and exhaustive DRY/command/UI-wiring closure are not completed. No governance seal, native implementation, or Batch 13 completion is claimed. The exact counts, source list, boundaries, and external evidence paths with SHA-256 are in [integration.json](integration.json).
