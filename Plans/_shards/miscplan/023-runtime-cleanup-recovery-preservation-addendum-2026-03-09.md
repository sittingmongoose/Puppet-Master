# Shard 023: Runtime Cleanup / Recovery Preservation Addendum (2026-03-09)

Source: `Plans/MiscPlan.md`

Source lines: L1308-L1316

Source SHA256: `9fe00e10eab87efa104b8d9deeac8ba2ce657ee0776a20f86f99a6053793f37e`

---

## Runtime Cleanup / Recovery Preservation Addendum (2026-03-09)


Cleanup logic must not erase the data required to explain or resume blocked and retried work.

### Required rules
- keep safe-point metadata until the originating attempt lineage reaches terminal resolution
- keep remediation lineage metadata until the parent lineage is terminal
- cleanup may compact derived summaries, but must not destroy the canonical history needed for recovery explanation and audit
