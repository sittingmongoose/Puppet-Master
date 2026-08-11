# Shard 022: Validation (gated; autonomous)

Source: `Plans/Architecture_Invariants.md`

Source lines: L247-L262

Source SHA256: `a1488a98949bf363a0c763a51dae6dc4db5261708c7828eeca492e65f251c543`

---

## Validation (gated; autonomous)
Invariants are governed by progression gate `GATE-003`. Current `run-gates` coverage is intentionally partial for architecture invariants until a dedicated invariant verifier materializes; a green gate run is not by itself proof that every invariant row has executable enforcement.

**Minimum automated checks (scriptable):**
- Validate schemas (plan graph, evidence, change budget, auto decisions).  
  ContractRef: Gate:GATE-001
- Enforce `INV-008` by scanning for GitHub CLI usage in build-governing docs and implementation surfaces.  
  ContractRef: Invariant:INV-008
- Enforce `INV-010` naming compliance in `Plans/` (platform name only).  
  ContractRef: Invariant:INV-010
- Enforce `INV-011` by verifying no UI code directly calls backend/storage/provider modules (static analysis or import-graph check).  
  ContractRef: Invariant:INV-011
- Enforce `INV-012` by validating wiring matrix coverage: every UICommandID in the catalog has a handler entry, and every interactive element has a wiring entry.  
  ContractRef: Invariant:INV-012, Gate:GATE-010

ContractRef: Gate:GATE-003
