# Shard 015: Runtime Evidence and Degradation Artifact Addendum (2026-03-08)

Source: `Plans/Project_Output_Artifacts.md`

Source lines: L779-L793

Source SHA256: `b3a47beac1f91f6f550d47cc74fd5cf3b618dd1c27d59ec127d2e03e0c33539c`

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
