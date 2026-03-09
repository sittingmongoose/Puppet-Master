## User-Facing Runtime Recovery Semantics Consolidation Addendum (2026-03-09)

Any user-facing summary of this feature set MUST explain:
- scored deterministic scheduling instead of lexical dispatch
- queue-analysis visibility and wake reasons
- immutable attempt lineage with explicit remediation children
- blocked outcomes that preserve local work and expose recovery actions
- safe points as runtime recovery anchors
- restore points as user-facing history checkpoints distinct from safe points
- degraded draft fallback only before graph lock

User-facing recovery copy MUST NOT collapse runtime safe-point recovery into history rewind/restore-point language.
