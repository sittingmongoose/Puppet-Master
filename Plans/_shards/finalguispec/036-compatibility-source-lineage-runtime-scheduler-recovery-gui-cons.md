# Shard 036: Compatibility/source-lineage - Runtime Scheduler Recovery GUI Consolidation Addendum (2026-03-09)

Source: `Plans/FinalGUISpec.md`

Source lines: L4680-L4697

Source SHA256: `4d0cbee4c81a8f9772413cc2ad62c810efe938f8f4575e9a79f64a238de7c7b1`

---

## Compatibility/source-lineage - Runtime Scheduler Recovery GUI Consolidation Addendum (2026-03-09)

> **Superseded — see Canonical Blocked/Recovery Behavior below. Compatibility/source-lineage only.** This section preserves GUI-specific recovery tokens that supplement the canonical summary only where they do not conflict with named owner docs.

This addendum retains GUI-specific recovery rules that supplement the canonical blocked/recovery section below.

### FileSafe rendering
A FileSafe block is a persistent blocked episode until the underlying runtime block resolves. It MUST NOT auto-dismiss while still active.

### Degraded draft warning


Decomposition degradation is a pre-lock planning state only. GUI copy MUST NOT imply silent degraded canonical execution after graph lock.

### All-nodes-blocked gating


Until owner runtime contracts define dedicated all-blocked events, GUI surfaces MAY derive all-blocked banners from current projections but MUST NOT treat undeclared runtime events as canonical.
