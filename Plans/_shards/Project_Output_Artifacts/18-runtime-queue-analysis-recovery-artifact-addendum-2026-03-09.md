## Runtime Queue Analysis / Recovery Artifact Addendum (2026-03-09)

Optional runtime artifacts must align with attempt identity and recovery semantics.

### Artifact families
- queue-analysis snapshots keyed by scheduler pass
- attempt detail exports keyed by `attempt_id`
- remediation lineage summaries keyed by `remediation_root_id`
- safe-point manifests keyed by `safe_point_id`

### Rules
- artifacts may summarize, but must not contradict canonical event/projection history
- blocked outcomes that preserve local work must say so explicitly
- stale attempts from older generations remain historical artifacts only and must be labeled as stale rather than resumable
