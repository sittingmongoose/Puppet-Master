# Shard 033: Current creation consumers and canonical Goal state

Source: `Plans/Goal_Runtime_System.md`

Source lines: L5949-L5959

Source SHA256: `d47d2c6751e64a671b5d4d6e5545b86dfd30f91ab7159eea2d13c79e4530cdca`

---

## Current creation consumers and canonical Goal state

For exactly active `goal.created` v3, the current read-only Goal projection consumed by Activity is a view of already committed canonical Goal custody, not a second event-built Goal record. GRS-064's `reader.goal.body@1.0.0` supplies current state/objective/currentness and `reader.goal.objective_history@1.0.0` supplies accepted revision history through SP-287's actual selected physical families and final current visibility/origin guards. GRS-055 and Assistant Chat still own the Activity item, preview and detail placement. A view may refresh from those original readers after an admitted owner change, but a creation observation alone never creates a body, selects a thread, changes Goal state, reconstructs text or supplies action availability. The complete shared canonical body transaction precedes SP-294's event/result settlement and can remain true while the command is pending. A current-body view must preserve that distinction.

The five exact SP-287 body/history/origin/control/receipt families and SP-294's original command family are written by their actual original owners, not by a `goal.created` consumer. Body/history/current-control persistence and restart come from those canonical values and coherent mandatory backup. Current body/history use their existing Project/thread/Goal visibility and deletion/hold/owner/Stop predicates; receipt-only audit and original command-result audit keep their separate current audit permissions. Missing or lawfully deleted body content is unavailable, not rebuilt from an event, receipt, old `goal_state.v1` row or `goal_runtime_lineage_record`. The existing latter family and Workflow/GoalRun certification records keep their independent owners and schemas; no creation consumer writes them or obtains continuation/certification authority from them.

SP-298/GRS-067 remains the exact event-inspection route and retains its whole SP-278 source, resource, payload-version, original body/shared witness, cursor and final atomic-release checks. It can report an authentic creation while the original command is pending, with `action_authority=none`. Its independent explicit command-member route resolves original result/creation-receipt semantics without a reverse event lookup. Current mutation and first continuation still pass GRS-066's actual original successful creation settlement and all current owner/Stop/source checks. No Activity refresh or event cursor is a durable execution checkpoint.

For this active creation route, no additional event-derived Goal-state, child, certification or evidence projector is assigned: the original durable body/command publications already own the state, and the current semantic views use the existing canonical readers. Accordingly these particular view/inspection consumers have no family checkpoint or durable replay effect. This is an explicit owner mapping from GRS-064/SP-287/SP-294, not a family-wide inference from SP-298's passive exemption. The deferred `goal_projection_families` inventory and SP-214's older `goal_state.v1` / child / evidence / GoalRun projection list do not materialize an active-v3 creation projector or revive retired Goal fields. Whole-v2 stays exact historical interpretation; any separately adopted historical projector or another Goal/GoalRun event requires its own owner/version/currentness and effect/checkpoint contract. This mapping grants neither those routes nor current family-wide event-depth/native readiness.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-055, ContractName:Plans/Goal_Runtime_System.md#GRS-064, ContractName:Plans/Goal_Runtime_System.md#GRS-066, ContractName:Plans/Goal_Runtime_System.md#GRS-067, ContractName:Plans/storage-plan.md#SP-214, ContractName:Plans/storage-plan.md#SP-287, ContractName:Plans/storage-plan.md#SP-294, ContractName:Plans/storage-plan.md#SP-298
