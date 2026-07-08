# Shard 022: Validation (gated; autonomous)

Source: `Plans/Architecture_Invariants.md`

Source lines: L270-L285

Source SHA256: `fab349fb07405fa12bb0ee2bf0c49308e8b0bb9581290de3ba5db02abe5c0b1e`

---

## Validation (gated; autonomous)
Invariants are validated by progression gate `GATE-003`.

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
