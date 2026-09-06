# Shard 046: Additive Correction v4 — Records, Replay, And Migration Matrix (2026-09-03)

Source: `Plans/storage-plan.md`

Source lines: L18694-L18772

Source SHA256: `6cae6d4bebe68a39b13ecadcec32580598254209e62566daff4d272354e4dd08`

---

## Additive Correction v4 — Records, Replay, And Migration Matrix (2026-09-03)

This section applies `PM_Assistant_v2_Additive_Correction_v4` (`CDRY-014..015`, and the storage
side of `QMAX-016/019`, `PPROG-013`, `PFAIL-009`, `GREPLAY-003`, `SMSG-012/017`) to this owner.

### PDET-006 — Retention is reachability, not card visibility

Deleting or hiding a thread card never purges a Plan artifact revision that is still
referenced by a Planning Wizard handoff, a Goal, a Crew or Review run, a Usage record,
an export, or another artifact. Retention follows the shared reachability and hold
rules this document already owns; card visibility is not deletion authority, and a
`PlanArtifactEmbed` naming an exact `artifact_version` is itself a hold on that
revision. `Plans/Runtime_Artifacts_Panel.md` owns the artifact identity; this owner
owns the durability rule.

### Registered record families

The seventeen record shapes admitted by this correction are tabulated in the Additive Correction
v4 section of `Plans/Contracts_V0.md`. Three storage rules govern them:

1. **Projections are rebuilt, never trusted as authority.** `PlanProgressProjection`,
   `PlanningQuestionBudgetProjection`, `ScheduledMessageProjection`, and
   `CollaborationCompletionProjection` are derived. Each is reconstructible from durable owner
   records after a restart, and a persisted copy is a **cache** carrying a `currentness_hash`.
   A cache whose hash no longer matches its inputs is stale and is disclosed as stale, never
   served as current. A view cache is never the only durable copy of a fact.
2. **Question charge is durable at first presentation.** The charge point is the durable question
   record, not the rendered card, so re-render, reconnect, restart, retry, and reopen do not
   re-charge. The counter is keyed by planning run, shared by every participant, and continues
   across Plan revisions.
3. **Goal replay reads records, not chat retention.** `pm.goal.origin_lineage.v1` reconstructs
   the exact accepted objective revision and its admitted context manifest after a crash, a
   compaction, a model switch, or a host transfer.

### Idempotency domains

Four idempotency domains are independent and separately tested: Build admission, Goal/PlanRun
binding, schedule creation, and first-dispatch admission. Wall-clock time is never a
deduplication key. Repeated Build clicks return one `PlanRun`; repeated schedule creation returns
one schedule; repeated timer delivery admits one run.

### CDRY-014 — Migration matrix

| ID | Legacy | Canonical | Rule |
|---|---|---|---|
| MIG-001 | BrainStorm base 15 | BrainStorm base 20 | migrate untouched factory values; preserve explicit user override; remove old active examples and fixtures |
| MIG-002 | Grill Me `+10` | Grill Me `+25` | migrate untouched factory values; preserve explicit user override |
| MIG-003 | Light/Balanced/Comprehensive budgets | Plan 3/6/8, Deep 10/15/20 | normalise where the mapping is exact; preserve ambiguous choices for review; remove active old labels |
| MIG-004 | progress in Plan checkboxes/text or model-authored status | `PlanProgressProjection` | preserve approved Plan bytes; derive status; quarantine unsupported status writes |
| MIG-005 | Failed/Paused/Waiting as primary Plan labels | `Building…` plus a secondary condition | map unfinished states to `Building…`, preserving the exact run reason |
| MIG-006 | unversioned or latest-resolving embeds | `PlanArtifactEmbed` exact version | resolve from a historical receipt where possible; otherwise mark unavailable — never pick latest silently |
| MIG-007 | implicit goal-driven execution | `execution_topology: goal_driven` + `GoalPlanBinding` | link an unambiguous existing PlanRun/Goal; quarantine duplicates and ambiguity |
| MIG-008 | schedule without topology or frozen Crew definition | exact topology snapshot | preserve an Agent schedule; require user repair for ambiguous Goal/Crew intent; never infer |
| MIG-009 | complex Goal fields, phases, child Goals, budgets | simple objective plus hidden lineage | preserve historical data as migration provenance; map workflow state to its owning runtime; never expose as active Goal fields |
| MIG-010 | card or run created at modal open | `WorkflowLaunchDraft` until confirmed Start | discard non-admitted placeholders that have no provider or effect receipt; preserve real admitted runs |
| MIG-011 | silent substitution, or a missing participant treated as complete | explicit `ParticipantDisposition` | recover requested/effective attempts; mark unknown or partial for the user and the audit rather than fabricate |
| MIG-012 | schedule with no visible projection | `ScheduledMessageProjection` | project existing schedule records; `Sent` links to the dispatched message where evidence exists |
| MIG-013 | live attachment/browser reference resolved at dispatch | immutable snapshot | use the retained historical hash if present; otherwise hold or fail and require user repair |
| MIG-014 | component send without revalidation | unique compatible match or `stale_capture` | no legacy send is reissued automatically; future sends validate |
| MIG-015 | `add_file_reference` declares folders out of scope | shared `attachment.add` file\|folder; alias file-only | retire the conflicting active prose and any duplicate handler candidate |
| MIG-016 | whole-list provider replacement and stale graph edges | `ToDoController` stable graph, list revisions, work bindings | import only when the graph validates; preserve ambiguous active work as blocked migration |
| MIG-017 | To-Do verification field/status/test terminology | validation as an ordinary To-Do; `todo-runtime` naming | retire active `verifying` semantics; preserve historical evidence outside current status |
| MIG-018 | Wonderer counted as a final voting participant | default abstention, excluded from quorum | recompute a historical vote projection only where raw role and votes permit; do not rewrite old decisions |
| MIG-019 | domain commands for local view toggles | local or shared view-state primitives | normalise aliases; remove independent domain handlers and events |
| MIG-020 | the old v2 audit Goal plus an addendum | one replacement audit Goal | mark the original audit Goal replaced for this implementation; never concatenate |

### CDRY-015 — Migration safety

Every migration above is **idempotent**: re-running it over already-migrated data is a no-op.
Unknown and legacy fields are preserved for inspection rather than dropped, so complex Goal
history and old schedule references survive as provenance. An ambiguous record is **quarantined**
with its reason and surfaced for user or audit resolution; a mapping is never fabricated to make
a migration finish. A restart part-way through a migration is recoverable, and the migration
receipt records the alias mapping, the accepted and quarantined records, before/after hashes,
disclosed ambiguity, and residual risk.

The distinction between "untouched factory value" and "explicit user override" is carried by the
setting's source-of-value. MIG-001, MIG-002, and MIG-003 migrate only the former; a user who
deliberately set BrainStorm to 15 or the Grill extension to 10 keeps that value.
