# Shard 041: Additive Correction v4 — Sandboxed Plan Content And Uncommitted Grants (2026-09-03)

Source: `Plans/Permissions_System.md`

Source lines: L9437-L9450

Source SHA256: `65f8cfc8efb2bacf69961629152d9bdba0f2c626c8121147d3ec11b2985f1c53`

---

## Additive Correction v4 — Sandboxed Plan Content And Uncommitted Grants (2026-09-03)

`PDET-010`, `MODAL-002`, `MODAL-016`. This owner **consumes** the correction.

- Interactive content embedded in a Plan runs only in the shared artifact sandbox. Renderer
  capability and origin are checked before render; Markdown-embedded HTML is never treated as
  trusted application UI, and arbitrary untrusted script is not executed.
- Opening or configuring a workflow modal grants nothing. No permission grant, no provisioning
  approval, and no install occurs before a confirmed Start, and preflight never mutates host or
  project.
- Temporary MCP, tool, or package provisioning requested by BrainStorm is admitted only after
  Start, through the normal approval path, scoped to the run and torn down at its end.
- A scheduled build revalidates its permission snapshot at dispatch. A permission that no longer
  holds yields `Held` or `Failed` with a reason; it is never widened to let the dispatch proceed.
