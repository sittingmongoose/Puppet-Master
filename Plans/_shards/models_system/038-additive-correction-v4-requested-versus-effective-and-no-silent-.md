# Shard 038: Additive Correction v4 — Requested Versus Effective, And No Silent Fallback (2026-09-03)

Source: `Plans/Models_System.md`

Source lines: L9549-L9569

Source SHA256: `117994732b67efbb2279148d469030d2175a733ee1beab59b62a24ce81506288`

---

## Additive Correction v4 — Requested Versus Effective, And No Silent Fallback (2026-09-03)

This owner **consumes** the correction's routing truth (`PART-003`, `PART-021..022`, `PART-024`,
`PSCHED-007`, `SMSG-011`).

- A participant slot always carries both requested and effective identity. When they differ, the
  difference is disclosed with its reason. An unavailable or failed participant is never silently
  replaced, and the original label is never retained while another model runs.
- A model unavailable **before** a workflow Start blocks Start or requires explicit replacement
  in the modal. Configuration alone never creates a failed runtime participant and never claims a
  provider attempt occurred.
- Repeated Review slots on the same model still resolve to independent fresh sessions with
  distinct attempt IDs; they are never collapsed into one route. Where an adapter cannot
  guarantee freshness, parallelism, or isolation, the constrained control tier is disclosed
  before Start and again in the final artifact.
- At scheduled dispatch, provider, model, or account unavailability follows the stored fallback
  policy. Absent an explicit stored fallback the work is `Held` or `Failed` rather than
  substituted, and no hidden modal opens.
- For a scheduled message, an explicit model or account selection never silently falls back.
  `Default` may re-resolve only under its recorded resolver policy, and the dispatch result
  records the route that actually ran.
