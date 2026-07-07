# Shard 023: Runtime Cleanup / Recovery Preservation Addendum (2026-03-09)

Source: `Plans/MiscPlan.md`

Source lines: L1307-L1315

Source SHA256: `3164dbccba2caba3a75329d9497758a3c9a5976ed1384cdd8dfafecf9d979c5e`

---

## Runtime Cleanup / Recovery Preservation Addendum (2026-03-09)


Cleanup logic must not erase the data required to explain or resume blocked and retried work.

### Required rules
- keep safe-point metadata until the originating attempt lineage reaches terminal resolution
- keep remediation lineage metadata until the parent lineage is terminal
- cleanup may compact derived summaries, but must not destroy the canonical history needed for recovery explanation and audit
