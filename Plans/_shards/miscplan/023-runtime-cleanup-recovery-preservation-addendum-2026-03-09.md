# Shard 023: Runtime Cleanup / Recovery Preservation Addendum (2026-03-09)

Source: `Plans/MiscPlan.md`

Source lines: L1307-L1316

Source SHA256: `37d2cb724014b4aa42d8ad8efe2c6269e508f7ca0e5fbf45209a1f97fb8373c4`

---

## Runtime Cleanup / Recovery Preservation Addendum (2026-03-09)


Cleanup logic must not erase the data required to explain or resume blocked and retried work.

### Required rules
- keep safe-point metadata until the originating attempt lineage reaches terminal resolution
- keep remediation lineage metadata until the parent lineage is terminal
- cleanup may compact derived summaries, but must not destroy the canonical history needed for recovery explanation and audit

