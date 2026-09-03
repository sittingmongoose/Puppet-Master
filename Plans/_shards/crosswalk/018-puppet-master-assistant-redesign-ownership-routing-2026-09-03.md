# Shard 018: Puppet Master Assistant Redesign Ownership Routing - 2026-09-03

Source: `Plans/Crosswalk.md`

Source lines: L3511-L3532

Source SHA256: `9ec60383b4d1dbbf8296abf0656249a24639590f6a26edd22c6600871284974c`

---

## Puppet Master Assistant Redesign Ownership Routing - 2026-09-03

The Assistant redesign introduces five owner documents and moves several disputes to them. Route any question in these areas to the named owner and do not create an Assistant-local shadow contract for it.

| Primitive or dispute | Sole owner | Notes |
|---|---|---|
| Thread-scoped `AssistantPlan` identity, six strategies, read-only document, versions, Build control, PlanRun, adherence | `Plans/Assistant_Plan_Runtime.md` | Distinct from `NamedPlan` and from canonical repository `Plans/**`. Owns no Plan Compile, WorkNode, or Orchestrator behavior. |
| Deep Plan run-scoped ledger profile | `Plans/Planning_Ledger_System.md` | A profile of the existing ledger owner, not a second ledger. Does not run the bootstrap migration pipeline. |
| Plan-scoped PlanUnit profile for Deep Plan | `Plans/Plan_Document_System.md` | Scoped units are never admitted into the global product PlanUnit index. |
| Assistant Plan to Orchestrator route | `Plans/Planning_Wizard.md` | Only via explicit `Send To Planning Wizard`, which bypasses PRD Builder. |
| One thread-local To-Do list, hierarchy, dependencies, statuses, `ToDoController`, transitions | `Plans/ToDo_Runtime.md` | Rejects whole-list model authority, verification status, source grouping, cross-thread aggregation. |
| Provider-native To-Do proposal translation | `Plans/Tools.md` reading `Plans/ToDo_Runtime.md` | Translation never transfers authority. |
| Crew, BrainStorm, Review, Chat Room shared runtime and all four protocols | `Plans/Collaborative_Workflows.md` | One runtime, four protocols. Not Orchestrator and not child-goal orchestration. |
| Wonderer and Grill Me participant-role semantics | `Plans/Collaborative_Workflows.md` | Persona identity is `Plans/Personas.md`; skill materialization is `Plans/Skills_System.md`. |
| Back Seat Driver policy, assignments, held findings, stage bindings, quarantine | `Plans/Back_Seat_Driver.md` | Read-only advisor. `Plans/Shared_Integration_Runtime.md` keeps generic resource admission and ObservableWork; it does not own BSD semantics. |
| Scheduled message snapshots, execution windows, wind-down, DST, quota reset truth and consent, automation precedence | `Plans/Scheduling_and_Quota_Resume.md` | Goal, Plan, Crew and the composer consume this service and own no timers. |
| Simplified Goal objective, revision, lifecycle, durable host continuation | `Plans/Goal_Runtime_System.md` | No phases, tranches, child Goals, budgets, or mandatory role cast. Workflow owners keep their own state. |
| Invisible per-thread `ComposerBuffer`, destination targeting, input history, spellcheck, thread-title policy | `Plans/assistant-chat-design.md` | There is no user-facing Draft product. |
| Teach and automatic memory | `Plans/assistant-memory-subsystem.md` | Distinct from the Teacher Persona owned by `Plans/Personas.md`. |
| Browser capture, component selection, DevTools policy | `Plans/Section15_MVP_Promoted_Features_Spec.md` | Protected authentication browser stays human-only. |

Three meanings of the word Plan remain distinct and must never be conflated: `AssistantPlan` is a thread task Plan; `NamedPlan` is a durable cross-surface aggregate owned by `Plans/Named_Plan_System.md`; and canonical `Plans/**` are product and build specifications. Do not use the bare word `Plan` in code without a disambiguating type or owner.
