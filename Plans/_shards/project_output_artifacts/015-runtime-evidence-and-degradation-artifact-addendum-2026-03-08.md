# Shard 015: Runtime Evidence and Degradation Artifact Addendum (2026-03-08)

Source: `Plans/Project_Output_Artifacts.md`

Source lines: L779-L793

Source SHA256: `ae7e0502a3f2c65598c998f9117b20d8670cb186c088c481a4869f5e9150cdb2`

---

## Runtime Evidence and Degradation Artifact Addendum (2026-03-08)
Runtime evidence projections remain downstream consumers of the storage-owned receipt packet.

### validation artifact lineage
Required fields:
- `auditor_cycle_report`
- `workflow_run_id`
- `pass_verdict`
- `phase_plan_ref`
- `requirements_quality_report_ref`
- legacy `validation_pass_report` mirror only when `compatibility_only: true` and `cycle_report_ref` points to the canonical Auditor cycle report

Rules:
- Validation lineage stays concrete and inspectable.
- Auditor cycle reports remain upstream artifacts rather than local replacement identifiers; legacy pass-report mirrors are compatibility/export rows only.
