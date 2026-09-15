# Batch 16 shared wiring

| Surface / local action | Shared owner route | Proof |
|---|---|---|
| Ordinary Plan Build; Build as Goal; scheduled dispatch | Existing `cmd.chat.plan.build`, topology `agent` or `goal_driven`; existing Plan/Goal/Scheduling transaction | B15 actual handlers + B16 five rollback seams |
| To-Do work action | `ToDoController` → registered existing work owner → admitted binding → accepted result → item receipt and parent rollup | B16 controller and actual-handler cases |
| Open exact work | `cmd.chat.todos.open_work`; current target resolves immutable binding/work/attempt identity | Large hierarchy and restructure journeys |
| Refine list | Shared ToDoController replacement disposition plus existing Plan step mapping in one TX | B16 restructure and injected mapping failure |
| Rich Text / Markdown progress | Sole AssistantPlanProgressProjector; stable block and step identities | B16 immutable export and rail geometry checks |
| Export Plan / execution report | Existing `cmd.chat.plan.export`, `content_kind=plan_document|execution_report` | Actual download and exact bytes checks |
| Goal Pause/Resume | Existing Goal action → Plan fence epoch; work binding remains stable | B15 lifecycle; B16 real asynchronous Worker fence |
| Review / Chat Room source | Existing `review-open-report` / `room-open-discussion` linked to exact source IDs | Retained supplemental/source-link regressions |

`b16-*` actions are local gallery/workspace controls, not newly registered canonical command aliases. No `cmd.chat.plan.progress.set` exists. Projection recomputation is internal and read-only. Existing PM56_EXT registration and intentional chaining remain; executable suites check no undeclared collisions.

The local computation adapter owns input/output/evidence artifacts only. It does not own a second To-Do list, Plan progress store, Goal lifecycle or scheduler. All generated status changes go through ToDoController. Source fixtures do not establish provider/model execution.
