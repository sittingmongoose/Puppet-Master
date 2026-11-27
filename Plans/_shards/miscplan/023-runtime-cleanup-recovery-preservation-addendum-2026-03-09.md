# Shard 023: Runtime Cleanup / Recovery Preservation Addendum (2026-03-09)

Source: `Plans/MiscPlan.md`

Source lines: L1308-L1316

Source SHA256: `5a1f16c378542a770e66a87875b19486d78da6ded77f1e798b0f4c0b9078ba87`

---

## Runtime Cleanup / Recovery Preservation Addendum (2026-03-09)


Cleanup logic must not erase the data required to explain or resume blocked and retried work.

### Required rules
- keep safe-point metadata until the originating attempt lineage reaches terminal resolution
- keep remediation lineage metadata until the parent lineage is terminal
- cleanup may compact derived summaries, but must not destroy the canonical history needed for recovery explanation and audit
