# Shard 059: History, Vision Bridge And Teacher Command Rows Addendum - 2026-11-05

Source: `Plans/UI_Command_Catalog.md`

Source lines: L21813-L21864

Source SHA256: `7955fc2002d936d8076c7f8f0553a95d26b927b19032ac7d4a0f63648395aad4`

---

## History, Vision Bridge And Teacher Command Rows Addendum - 2026-11-05

Q5 resolution 9b (DL-333): UCC-100, UCC-101 and UCC-102 named these command families without concrete ids. The rows below mint one id for each action those units list, taking each label, description and precondition from the unit and its owners (History: OP-026, OP-027; Vision bridge: T-165, ACD-425, PS-121; Teacher: F3-403, CS-053, CV-297, PS-122). Two listed actions add no History id: resume and retry of a historical run map through `allowed_action_ids[]` to `cmd.runtime.resume_after_prerequisite` and `cmd.runtime.retry_now`, because the Recovery command definitions forbid a surface-local recovery family. Typing /teach opens the Teach popup (DL-127), not the Teacher. The rows hold no data shapes; UCC-230 routes each id to its owner-doc definition (History OP-049, Vision bridge ACD-640, Teacher F3-718).

### History command rows (UCC-100)

| Command ID | Label | Description | Preconditions | command_kind |
|---|---|---|---|---|
| `cmd.history.focus` | Open History | Opens or focuses the current project's Orchestrator History tab | `project_selected` | `navigation_wrapper` |
| `cmd.history.switch_subview` | Switch History Subview | Switches History between its Documents and Runs subviews as view state | `history_visible` | `shell_view` |
| `cmd.history.set_include_archived` | Include Archived | Shows or hides archived rows inside All history; archived rows keep a visible label | `history_visible && all_history_selected` | `shell_view` |
| `cmd.history.open_row` | Open | Opens the selected historical document or run by its stable identity, read-only | `history_row_selected` | `navigation_wrapper` |
| `cmd.history.open_artifacts` | Open Artifacts | Opens the artifacts linked to the selected row | `history_row_selected && row_artifacts_linked` | `navigation_wrapper` |
| `cmd.history.open_evidence` | Open Evidence | Opens the evidence linked to the selected row | `history_row_selected && row_evidence_linked` | `navigation_wrapper` |
| `cmd.history.compare_versions` | Compare Versions | Opens the deep compare of the selected document versions: side-by-side rendered diff, metadata and source-lineage pane, and atom/manifest change table; blocked while the projection is stale | `history_document_versions_selected && history_projection_current` | `navigation_wrapper` |
| `cmd.history.duplicate_as_draft` | Duplicate As Draft | Creates a new draft from the selected historical document; the historical record is not changed | `history_document_selected` | `domain_action` |
| `cmd.history.reopen_in_wizard` | Reopen In Wizard | Reopens the selected historical document in the Planning Wizard as new mutable state after currentness and authority checks; the record stays immutable | `history_document_selected && history_projection_current && currentness_allows` | `domain_action` |
| `cmd.history.send_forward` | Send Forward | Sends the selected historical document forward when currentness allows | `history_document_selected && history_projection_current && currentness_allows` | `domain_action` |
| `cmd.history.export_selected` | Export | Exports the selected row as zip with manifest, JSON, or rendered Markdown, HTML or PDF, under an explicit evidence/redaction profile | `history_row_selected && history_projection_current` | `domain_action` |
| `cmd.history.export_bundle` | Export Bundle | Exports the multi-selected rows as one bundle with its manifest | `history_rows_multi_selected && history_projection_current` | `domain_action` |
| `cmd.history.export_filtered_view` | Export Filtered View | Exports the whole filtered view with its active filter context and manifest | `history_visible && history_projection_current` | `domain_action` |
| `cmd.history.clone_as_new_run` | Clone As New Run | Starts a new run cloned from the selected historical run under a new identity after currentness and authority checks | `history_run_selected && currentness_allows` | `domain_action` |
| `cmd.history.inspect_records` | Inspect Records | Opens the ledger and raw records behind the selected row for read-only inspection | `history_row_selected` | `navigation_wrapper` |
| `cmd.history.rebuild_projection` | Rebuild | Rebuilds the History projection from the immutable source records without changing them; compare, export, reopen and send forward stay blocked until it succeeds | `history_visible` | `domain_action` |

### Vision bridge command rows (UCC-101)

| Command ID | Label | Description | Preconditions | command_kind |
|---|---|---|---|---|
| `cmd.chat.vision_bridge.select_source` | Select Image Source | Chooses the image the bridge reads from the allowed source classes (current-turn attachment, selected artifact, project file allowed by FileSafe, clipboard image, recent OS screenshot) and shows the selected source | `vision_bridge_available` | `domain_action` |
| `cmd.chat.vision_bridge.pick_recent_screenshot` | Choose Recent Screenshot | Opens the recent OS screenshot picker and uses the screenshot the user picks; an ambiguous recent screenshot is never chosen silently | `vision_bridge_available && recent_screenshot_access_allowed` | `domain_action` |
| `cmd.chat.vision_bridge.inspect` | Inspect | Opens the bridge-derived description with its source image or artifact link, provider/model used, and freshness/cache state | `vision_bridge_result_present` | `navigation_wrapper` |
| `cmd.chat.vision_bridge.rerun` | Rerun With A Question | Runs the bridge again on the same source with the user's question | `vision_bridge_result_present && permission_allowed` | `domain_action` |
| `cmd.chat.vision_bridge.copy_description` | Copy Description | Copies the derived description to the clipboard | `vision_bridge_result_present` | `shell_view` |
| `cmd.chat.vision_bridge.attach_result` | Attach Result | Attaches the bridge result to the current turn or run, labelled as bridge-derived | `vision_bridge_result_present && attach_target_available` | `domain_action` |
| `cmd.chat.vision_bridge.manage_permission` | Manage Always Accept | Opens the remembered always-accept image permission for inspection, narrowing or revocation in its Permissions owner (PS-121) | `remembered_vision_permission_present` | `navigation_wrapper` |

### Teacher guided GUI command rows (UCC-102)

| Command ID | Label | Description | Preconditions | command_kind |
|---|---|---|---|---|
| `cmd.teacher.open_from_help` | Ask Teacher | Opens a new Teacher thread from a help icon with the current surface and control context | `help_icon_visible` | `domain_action` |
| `cmd.teacher.continue_in_teacher` | Continue With Teacher | Hands an intent-classified natural-language request off into a new or selected Teacher thread with the current surface context (CS-053) | `teach_intent_classified` | `domain_action` |
| `cmd.teacher.guide.open_route` | Open Route | Guided step: opens a canonical route target to show the user where something is | `teacher_guidance_active && route_target_resolvable` | `navigation_wrapper` |
| `cmd.teacher.guide.focus` | Focus Panel | Guided step: focuses a tab or panel | `teacher_guidance_active && target_present` | `shell_view` |
| `cmd.teacher.guide.highlight` | Highlight | Guided step: spotlights or outlines a control or region with an anchored caption that does not cover the target | `teacher_guidance_active && target_present` | `shell_view` |
| `cmd.teacher.guide.scroll_to` | Scroll To Field | Guided step: scrolls to a section or field | `teacher_guidance_active && target_present` | `shell_view` |
| `cmd.teacher.guide.inspect` | Show Details | Guided step: expands non-mutating details or previews a selection, read-only | `teacher_guidance_active && target_present` | `shell_view` |
| `cmd.teacher.explain_current_ui` | Explain This Screen | Asks Teacher to explain the current surface in the Teacher thread | `teacher_thread_available` | `domain_action` |
| `cmd.teacher.guide.do_it` | Do It | Runs an explicitly safe action for the user through its stable command after confirmation and permission gates; a mutation always needs confirmation | `teacher_guidance_active && action_explicitly_safe && confirmation_given` | `domain_action` |

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Wiring_Matrix.md
