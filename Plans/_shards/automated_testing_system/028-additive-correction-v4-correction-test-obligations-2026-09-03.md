# Shard 028: Additive Correction v4 — Correction Test Obligations (2026-09-03)

Source: `Plans/Automated_Testing_System.md`

Source lines: L4004-L4055

Source SHA256: `92a37e73a67b4a820fc5be5ef5b1033682608005a6cf09da37b46ab2455ba2e7`

---

## Additive Correction v4 — Correction Test Obligations (2026-09-03)

This section applies `PM_Assistant_v2_Additive_Correction_v4` (`CDRY-016`, `CDRY-018`,
`CONCEPT-019`) to this owner.

### CDRY-016 — Every correction requirement is linked, in both directions

Each of the 245 correction requirements maps to at least one positive test, plus the negative,
race, restart, stale-currentness, permission, provider-degradation, or migration test its own
statement implies. Traceability is bidirectional: a requirement with no test and a test with no
requirement are both failures. Coverage counted only as a total is not certification.

The test families the correction requires, by seam:

| Seam | Required beyond the positive test |
|---|---|
| Question budget | negative (admission at ceiling returns `question_budget_exhausted` and persists nothing), restart (projection equals durable truth), migration (untouched factory value moves, explicit override does not) |
| Plan progress | stale currentness (projection disclosed stale, mutation controls disabled), restart (rebuild from durable records, not a view cache), race (late To-Do or work event rejected on epoch/revision) |
| Plan failure | restart (`Building…` plus exact secondary reason restored, no false `Build`/`Completed` frame), negative (a failed attempt never sets `Completed`, never starts a duplicate run) |
| Plan details and embeds | negative (unavailable, denied and unsupported embeds render explicitly and export truthfully), permission (sandbox and origin checks on interactive content) |
| Build as Goal | race (atomic Goal + PlanRun + binding; idempotent retry yields one of each), negative (stale Plan version fails closed) |
| Scheduled build | negative (nothing runs before first dispatch), race (repeated timer delivery admits one run; edit after dispatch refused), provider degradation (Held or Failed, never substituted), restart |
| Goal replay | restart (objective revision and admitted context reconstructed), negative (completion refused while required work is unresolved), race (late callback after pause or cancel ignored) |
| Modal boundary | negative (open → configure → cancel leaves zero durable effects, instrumented), stale target (Review target changed while the modal was open) |
| Participants | negative (no silent substitution, no fabricated consensus), race (superseded attempt cannot vote), provider degradation (constrained independence disclosed) |
| Scheduled messages | negative (composer preserved on failure; no destination or model fallback), race (edit versus in-flight dispatch), restart (projection rebuilt without client timers) |
| Browser currentness | negative (zero, multiple, destroyed, mismatched all return `stale_capture`), race (late resolution fenced by epoch and buffer revision) |
| Folder attachments | negative (the file-only alias rejects a folder), stale (scheduled manifest unavailable at dispatch holds or fails) |
| To-Do graph | negative (self-parent, parent cycle, dependency cycle, cross-thread, unknown, duplicate each rejected atomically), race (stale event retained as rejected evidence) |
| Wonderer | negative (abstention excluded from the denominator and never counted as opposition) |

### CDRY-018, CONCEPT-019 — Three readiness levels, reported separately

Canonical Plan readiness, concept behaviour, and native implementation readiness are three
separate verdicts and are reported separately.

- **Canonical** proves only that owner documents, commands, wiring, schemas, settings, and
  migrations agree with one another.
- **Concept** proves only that the 5.6 Pro surface responds and renders. It is fixture-backed and
  is never recorded as native handler, storage, provider, scheduler, or recovery proof.
- **Native** requires Rust, Slint, services, adapters, and persistence executing these contracts
  under source-hashed evidence.

A lower level never certifies a higher one. A toast, a screenshot, a truncated file, or a
requirement counted as covered is not a pass.

### Generated-output byte check

The concept's two deliverables are regenerated from `build.py` and compared byte-for-byte against
a fresh second build. Hand-editing generated HTML is a test failure, not a shortcut, and a source
module omitted from `build.py`'s `MODULES` list must fail the check rather than silently vanish
from the deliverables.
