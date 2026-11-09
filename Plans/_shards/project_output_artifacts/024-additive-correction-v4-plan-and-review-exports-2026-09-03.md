# Shard 024: Additive Correction v4 — Plan And Review Exports (2026-09-03)

Source: `Plans/Project_Output_Artifacts.md`

Source lines: L3539-L3554

Source SHA256: `be275a792dec417e8a434ad1d760814f666028e68fd29b3c19ba19bfa43f7355`

---

## Additive Correction v4 — Plan And Review Exports (2026-09-03)

`PPROG-015..016`, `PDET-011`. This owner **consumes** Plan and Review exports and does not
re-own Plan content or the shared renderer.

- A Plan export carries the approved document only. An execution report
  (`pm.assistant_plan.execution_report.v1`) is a **separate** versioned artifact keyed to the
  exact `plan_version`, `plan_hash`, and `plan_run_id`, and is never presented as the approved
  Plan. Both are produced by `cmd.chat.plan.export` under `content_kind`.
- PDF output renders video and interactive blocks through their `static_fallback_ref` with the
  caption and a stable artifact reference. A supported block is never silently dropped, and the
  PDF never implies that interactivity survived.
- A missing, stale, denied, or unsupported embed produces an explicit unavailable block in the
  export result, matching what the on-screen block reports. No other artifact version is
  substituted.
- Exporting never alters `plan_hash`.
