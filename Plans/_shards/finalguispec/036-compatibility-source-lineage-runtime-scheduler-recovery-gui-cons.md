# Shard 036: Compatibility/source-lineage - Runtime Scheduler Recovery GUI Consolidation Addendum (2026-03-09)

Source: `Plans/FinalGUISpec.md`

Source lines: L4931-L4948

Source SHA256: `ef139c75bd5f1746bfb9aaf2dc84a02f6dbb339c6e74cf0104859ebcf3a4c835`

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
