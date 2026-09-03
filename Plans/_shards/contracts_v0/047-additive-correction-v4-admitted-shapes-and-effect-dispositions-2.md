# Shard 047: Additive Correction v4 — Admitted Shapes And Effect Dispositions (2026-09-03)

Source: `Plans/Contracts_V0.md`

Source lines: L21241-L21291

Source SHA256: `a3be47f5e955848bc80a0e5e520138bac0c9a225986aba2f30e79c0b74641810`

---

## Additive Correction v4 — Admitted Shapes And Effect Dispositions (2026-09-03)

This section applies `PM_Assistant_v2_Additive_Correction_v4` (`CDRY-010..011`) to this owner.
Each record below reuses the existing typed request/result/error envelope of its owning command
family; no duplicate envelope is introduced.

### New and changed record shapes

| Schema ID | Owner | Purpose |
|---|---|---|
| `pm.assistant_plan.question_budget_policy.v2` | Assistant_Plan_Runtime | `policy_version`, `plan_limits`, `deep_plan_limits`, `grill_me_extension` |
| `pm.assistant_plan.question_budget_projection.v1` | Assistant_Plan_Runtime | strategy, base, Grill state, effective limit, asked, remaining, reused, research-resolved |
| `pm.assistant_plan.progress_projection.v1` | Assistant_Plan_Runtime | plan/run keys, projection revision, currentness hash, step states |
| `pm.assistant_plan.execution_attention_projection.v1` | Assistant_Plan_Runtime | `plan_run_id`, `condition_kind`, `reason`, `allowed_action_ids`, `currentness_hash` |
| `pm.assistant_plan.artifact_embed.v1` | Assistant_Plan_Runtime + Runtime_Artifacts | frozen block/artifact/version/renderer/fallback |
| `pm.assistant_plan.execution_report.v1` | Runtime_Artifacts | separate versioned execution artifact |
| `pm.goal.plan_binding.v1` | Assistant_Plan_Runtime + Goal_Runtime | one Goal, one PlanRun, one exact Plan binding |
| `pm.goal.origin_lineage.v1` | Goal_Runtime | hidden origin, source refs, context manifest, bound Plan, owning workflow |
| `pm.schedule.plan_topology_snapshot.v1` | Scheduling_and_Quota_Resume | frozen topology and eligibility policy |
| `pm.schedule.message_projection.v1` | Scheduling_and_Quota_Resume | six visible states, exact destination/time/timezone |
| `pm.schedule.attachment_snapshot.v1` | Scheduling + Attachment owner | frozen artifact version, content hash, folder manifest hash |
| `pm.collaboration.launch_draft.v1` | GUI / Collaborative_Workflows | local modal draft; not durable unless an owner already persists it |
| `pm.collaboration.participant_disposition.v1` | Collaborative_Workflows | required flag, attempt, outcome, requested/effective, waiver |
| `pm.collaboration.completion_projection.v1` | Collaborative_Workflows | required/completed/failed/waived slots, output, quorum, attention |
| `pm.browser.component_revalidation_result.v1` | Browser Program | generations, locator count, identity match, result, recapture action |
| `pm.todo.graph_validation_result.v1` | ToDo_Runtime | self-parent, parent cycles, dependency cycles, unknown, cross-thread |
| `pm.todo.list_replacement_disposition.v1` | ToDo_Runtime | retained, rebound, canceled, refused, active work refs |

### Typed results added to existing error enumerations

`question_budget_exhausted` (planning owners), `invalid_graph` (ToDo owner), and `stale_capture`
(browser owner) are typed results, not exceptions. Each leaves the run alive: exhaustion
continues to synthesis, an invalid graph commits nothing, and a stale capture admits no message.

### Effect dispositions

| Semantic effect | Disposition | Rule |
|---|---|---|
| Question budget exhausted | owner result/record; optional admitted `planning.question_budget_exhausted` | no failed run, no extra QuestionItem |
| Plan progress recompute | projector checkpoint and projection revision | no public status-set command |
| Goal-driven Plan binding | atomic build result/receipt plus an admitted binding event where required | one Goal and one PlanRun; replay idempotent |
| Participant disposition | admitted collaboration participant event or owner attempt receipt | every terminal slot outcome durable |
| Partial collaboration completion | completion projection/receipt | never the normal completed event while required slots or outputs are unresolved |
| Scheduled-message state | existing scheduled-message lifecycle events | projection maps owner state; no event per render |
| Scheduled attachment snapshot | schedule-creation receipt referencing the snapshot | no later latest-version resolution |
| To-Do list replacement | ToDo owner transaction event/receipt | carries retain/rebind/cancel/refuse dispositions |
| Browser stale component | typed command result/error | no message admitted |
| Local modal or view toggle | no domain event | may use shared UI preference storage where one exists |

No owner document in this correction emits an unregistered event name, and a proposed event list
is never treated as a registration.
