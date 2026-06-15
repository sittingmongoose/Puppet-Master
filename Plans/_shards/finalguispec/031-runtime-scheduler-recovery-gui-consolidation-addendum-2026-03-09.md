# Shard 031: Runtime Scheduler Recovery GUI Consolidation Addendum (2026-03-09)

Source: `Plans/FinalGUISpec.md`

Source lines: L2976-L2993

Source SHA256: `e757b69c58378f86efe32340625f8e1dcb9687b43bc8ce1739a5ad9712b3435e`

---

## Runtime Scheduler Recovery GUI Consolidation Addendum (2026-03-09)

> **Superseded** — see Canonical Blocked/Recovery Behavior below.

This addendum retains GUI-specific recovery rules that supplement the canonical blocked/recovery section below.

### FileSafe rendering
A FileSafe block is a persistent blocked episode until the underlying runtime block resolves. It MUST NOT auto-dismiss while still active.

### Degraded draft warning


Decomposition degradation is a pre-lock planning state only. GUI copy MUST NOT imply silent degraded canonical execution after graph lock.

### All-nodes-blocked gating


Until owner runtime contracts define dedicated all-blocked events, GUI surfaces MAY derive all-blocked banners from current projections but MUST NOT treat undeclared runtime events as canonical.
