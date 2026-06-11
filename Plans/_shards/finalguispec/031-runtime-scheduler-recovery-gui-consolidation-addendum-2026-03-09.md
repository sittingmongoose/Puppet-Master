# Shard 031: Runtime Scheduler Recovery GUI Consolidation Addendum (2026-03-09)

Source: `Plans/FinalGUISpec.md`

Source lines: L2930-L2947

Source SHA256: `e7d74c518f43fb85d1bcb78c9f41c6ecf73d29086b5c1f37693b3c4ed79ecdd2`

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
