# Shard 044: PlanUnits

Source: `Plans/assistant-chat-design.md`

Source lines: L3441-L21834

Source SHA256: `91bcd0b171815c2822094085d3e4a9d34e3fdf9c61dbb106a0eae64e9cf296a3`

---

## PlanUnits

### ACD-001 - Assistant & Chat UI -- Design Plan Source-Preserving PlanUnit

```yaml
plan_unit_id: ACD-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The former doc-level source-preserving bridge is retired in place after
  Phase 2B atomized assistant-chat-design-S0001 through
  assistant-chat-design-S0182 into ACD-002 through ACD-412. ACD-001 remains
  only as migration lineage for the retired bridge span and must not re-own
  atomized source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - ACD-001 no longer uses the source-preserving PlanUnit compile hint.
  - Prior source coverage remains carried by ACD-002 through ACD-412.
  - The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
  - Coverage for the retired bridge is recorded in the Phase 2B batch 010 coverage map.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0183
preserved_exact_tokens:
  - "ACD-001"
  - "source_preserving_planunit"
  - "ACD-002"
  - "ACD-412"
negative_constraints:
  - "Do not remap atomized assistant-chat-design spans back to ACD-001."
  - "Do not treat the retired bridge as implementation-ready product coverage."
  - "Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this migration-lineage unit."
compatibility_only_notes:
  - "The old source-preserving bridge is retained only so migration lineage and historical references to ACD-001 remain auditable."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-002 - Assistant Chat Scope And Source Authority

```yaml
plan_unit_id: ACD-002
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant Chat owns the shared Assistant/Interview chat UX, source-preserved
  owner-section requirements, compliance posture, route-payload boundary
  headings, change history, executive role, and table-of-contents anchors for
  this Phase 2B window. Original source prose remains in place for exact audit.
gui_related: true
gui_classification_reason: This unit defines the user-visible Assistant and Interview chat surface and its navigation anchors.
depends_on: []
unblocks: []
acceptance_criteria:
  - Spans assistant-chat-design-S0001 through assistant-chat-design-S0005 and S0007 through S0008 are mapped to this PlanUnit in the Phase 2B coverage map.
  - The source body remains available in place for exact-token audit.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: source_preservation
reasoning_tier: standard
context_scope: assistant_chat_window_001
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: planunit_atomization
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0001
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0002
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0003
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0004
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0005
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0007
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0008
preserved_exact_tokens:
  - "Assistant & Chat UI -- Design Plan"
  - "Canonical owner-section requirements"
  - "Shared conversational/runtime boundary"
  - "Canonical route payload"
  - "Calls to Action (CtAs)"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-003 - Rewrite Runtime Identity Boundary

```yaml
plan_unit_id: ACD-003
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant Chat targets the rewrite architecture while displaying concrete
  requested/effective runtime identity and preserving shared provider/auth
  fields without reopening the Contracts_V0 additive field set.
gui_related: true
gui_classification_reason: Runtime identity, platform, account, and auth state are user-visible chat display requirements.
depends_on: []
unblocks: []
acceptance_criteria:
  - Assistant Chat displays concrete requested/effective provider identity instead of collapsing Gemini Direct, Antigravity, or retired Gemini CLI lineage into one generic badge.
  - Assistant Chat consumes shared provider/auth fields and does not invent a parallel field set.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_identity_drift
reasoning_tier: standard
context_scope: assistant_chat_window_001
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - Plans/Multi-Account.md
node_compile_hint:
  mode: runtime_identity_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0006
preserved_exact_tokens:
  - "Rust + Slint"
  - "gemini"
  - "gemini_cli"
  - "Gemini Direct"
  - "Gemini CLI"
  - "provider_family_id = gemini"
negative_constraints:
  - "Assistant Chat must not invent a parallel provider/auth field set."
  - "Reconciliation may align wording and placement but must not reopen the shared field set."
  - "Do not display Gemini CLI as an active provider row."
compatibility_only_notes:
  - "gemini_cli and Gemini CLI are preserved only as retired/source-lineage tokens."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-004 - Primary Assistant Mode Strip

```yaml
plan_unit_id: ACD-004
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant exposes stable Ask, Agent, Debug, Plan, and Deep Plan choices.
  Specialized Interview, BrainStorm, and Crew workflows remain overlays or
  routed flows that normalize through the shared requested/effective runtime
  and overlay model.
gui_related: true
gui_classification_reason: The Assistant mode strip and workflow choices are visible chat controls.
depends_on: []
unblocks: []
acceptance_criteria:
  - The Assistant mode strip exposes Ask, Agent, Debug, Plan, and Deep Plan as stable choices.
  - Specialized workflows remain overlays rather than replacements for the primary mode strip.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: mode_routing_drift
reasoning_tier: standard
context_scope: assistant_chat_window_001
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: visible_mode_strip
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0007
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0009
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0010
preserved_exact_tokens:
  - "Ask"
  - "Agent"
  - "Debug"
  - "Plan"
  - "Deep Plan"
  - "Interview"
  - "BrainStorm"
  - "Crew"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
```

### ACD-005 - Planning Read-Only Approval Boundary

```yaml
plan_unit_id: ACD-005
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Plan and Deep Plan are read-only planning runs. Execution requires approval
  and then runs under regular or yolo, never under plan; queueing applies only
  to post-approval execution.
gui_related: false
gui_classification_reason: This unit governs runtime execution posture and approval boundaries rather than visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
  - Planning-time runs do not mutate project files.
  - Execution after approval reuses approved plan/TODO state under regular or yolo, never plan.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: execution_boundary
reasoning_tier: standard
context_scope: assistant_chat_window_001
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: read_only_planning_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0011
preserved_exact_tokens:
  - "planning is read-only"
  - "Puppet Master-controlled draft"
  - "regular"
  - "yolo"
  - "plan"
negative_constraints:
  - "Queueing affects only post-approval execution, never the planning-time read-only run."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
```

### ACD-006 - Debug Overlay Entrypoint

```yaml
plan_unit_id: ACD-006
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Debug Mode is an Assistant workflow overlay, stronger than a behavioral hint,
  that persists requested/effective debug overlay fields, remains
  execution-capable, and is visually distinct in transcript and status
  labeling.
gui_related: true
gui_classification_reason: Debug overlay selection, transcript treatment, and status labeling are visible chat UI behavior.
depends_on: []
unblocks: []
acceptance_criteria:
  - /mode debug preserves requested and effective debug overlay fields through restore and resume.
  - Debug transcript and status labeling remain visually distinct from Agent and Plan threads.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_mode_drift
reasoning_tier: standard
context_scope: assistant_chat_window_001
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
  - Plans/Run_Modes.md
node_compile_hint:
  mode: debug_overlay_entrypoint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0012
preserved_exact_tokens:
  - "requested_mode_overlay = debug"
  - "effective_mode_overlay = debug"
  - "/mode debug"
  - "Debug + ask"
negative_constraints:
  - "There is no stable `Debug + ask` combination for automated investigations."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-007 - Debug Phase And Revalidation Loop

```yaml
plan_unit_id: ACD-007
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Debug investigations follow closed phases from target_binding through cleanup.
  Drift triggers explicit revalidation, verification is mandatory, and cleanup
  is the terminal mutation-capable phase unless preservation is explicit.
gui_related: true
gui_classification_reason: Investigation Context, attention status, and cleanup/resolution state are user-visible in the chat surface.
depends_on: [ACD-006]
unblocks: []
acceptance_criteria:
  - Target, runtime, worktree, auth, instrumentation, and evidence drift trigger explicit revalidation before mutation-capable steps continue.
  - A fix attempt without recorded verification remains attention_required or failed_cleanup, not resolved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: evidence_loop
reasoning_tier: high
context_scope: assistant_chat_window_001
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: debug_revalidation_loop
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0012
preserved_exact_tokens:
  - "target_binding"
  - "baseline_capture"
  - "instrumentation"
  - "verification"
  - "cleanup"
  - "attention_required"
  - "failed_cleanup"
  - "resolved"
negative_constraints:
  - "A revalidation gate surfaces an explicit reason in the Investigation Context; it MUST NOT silently continue as though the earlier target binding were still valid."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-008 - Runtime Mode Normalization And Project Gating

```yaml
plan_unit_id: ACD-008
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant workflow identity is closed to ask, agent, debug, plan, and
  deep_plan. Only runtime posture normalizes to the run-envelope mode, and
  project-scoped capabilities require a selected project.
gui_related: true
gui_classification_reason: Workflow identity, mode display, and project-gated capability disclosure are user-visible chat behavior.
depends_on: []
unblocks: []
acceptance_criteria:
  - Debug and deep_plan do not mint extra canonical runtime-mode enum values.
  - Project-scoped capabilities are unavailable or gated when no project is selected.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_mode_drift
reasoning_tier: standard
context_scope: assistant_chat_window_001
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - Plans/Run_Modes.md
node_compile_hint:
  mode: runtime_mode_normalization
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0013
preserved_exact_tokens:
  - "ask | agent | debug | plan | deep_plan"
  - "run-envelope"
  - "regular"
  - "yolo"
  - "Requires a project"
  - "@"
negative_constraints:
  - "Subordinate behavior/profile fields may describe investigation or planning depth, but they do not replace this workflow-mode enum."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
```

### ACD-009 - Chat Header Runtime Controls

```yaml
plan_unit_id: ACD-009
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The chat header exposes platform, model, reasoning/effort, and worktree
  controls. Selections apply to the next turn and do not interrupt a streaming
  response.
gui_related: true
gui_classification_reason: Header dropdowns, icons, and worktree visual states are direct UI controls.
depends_on: []
unblocks: []
acceptance_criteria:
  - Platform and model lists come from platform_specs and dynamic discovery rather than hardcoded UI lists.
  - Platform, model, effort, and worktree changes apply to the next turn while an in-flight response completes with its prior selection.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: gui_state_sync
reasoning_tier: standard
context_scope: assistant_chat_window_001
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Models_System.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: chat_header_controls
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0014
preserved_exact_tokens:
  - "platform_specs"
  - "fallback_model_ids(platform)"
  - "Reasoning / effort"
  - "Worktree"
  - "bound-dirty"
  - "bound-conflict"
  - "turn"
negative_constraints:
  - "Data comes from `platform_specs`; no hardcoding."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Models_System.md
```

### ACD-010 - Dual ELI5 Toggle Contract

```yaml
plan_unit_id: ACD-010
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Chat ELI5 and app-level ELI5 are separate toggles with independent scope.
  Generated docs stay technical, and authored copy maintains Expert/ELI5
  variants without creating concept-help drift.
gui_related: true
gui_classification_reason: The ELI5 toggles, tooltips, and authored user-facing copy variants are visible product UI.
depends_on: []
unblocks: []
acceptance_criteria:
  - Chat ELI5 affects Assistant chat behavior only and is not passed into generated interview documentation prompts.
  - App-level ELI5 affects tooltips and interviewer Q&A responses without changing generated documentation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: copy_policy_drift
reasoning_tier: standard
context_scope: assistant_chat_window_001
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: dual_copy_toggle_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0015
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0016
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0017
preserved_exact_tokens:
  - "two separate ELI5 toggles"
  - "Interaction Mode (Expert/ELI5)"
  - "Expert"
  - "ELI5"
  - "concept-help"
negative_constraints:
  - "There are two separate ELI5 toggles; they are independent and must not be conflated."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-011 - Permission Posture And Approval Ladder

```yaml
plan_unit_id: ACD-011
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Chat supports YOLO and Regular permission postures. Regular uses the
  canonical deny, once, for session, and always approval ladder, while durable
  approval defaults remain owned by Permissions_System.
gui_related: true
gui_classification_reason: Permission prompts and approval choices are user-facing controls.
depends_on: []
unblocks: []
acceptance_criteria:
  - Regular mode asks before executing or editing and presents the canonical approval ladder.
  - Durable approval/default behavior remains routed to Permissions_System.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: permission_boundary
reasoning_tier: standard
context_scope: assistant_chat_window_001
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: permission_posture_surface
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0018
preserved_exact_tokens:
  - "YOLO mode"
  - "Regular mode"
  - "deny"
  - "once"
  - "for session"
  - "always"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Permissions_System.md
```

### ACD-012 - Message Controls And Queue Semantics

```yaml
plan_unit_id: ACD-012
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Stop, Edit, and Resend scope to the most recent user message. Copy controls
  stay visible, the queue is FIFO with max 2 entries, queue state is transient,
  and delete/rewrite shorthand labels remain retired.
gui_related: true
gui_classification_reason: Message-row controls, composer behavior, queue affordances, and copy actions are visible chat UI.
depends_on: []
unblocks: []
acceptance_criteria:
  - Stop, Edit, and Resend attach only to the most recent user-sent message and discard later generated history/work where specified.
  - Code-block and message-row copy controls remain visible and do not depend on hover-only discovery.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: message_history_safety
reasoning_tier: standard
context_scope: assistant_chat_window_001
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: message_control_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0019
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0020
preserved_exact_tokens:
  - "Stop"
  - "Edit"
  - "Resend"
  - "/steer"
  - "/resend"
  - "/follow"
  - "max 2"
  - "/open-in-editor"
negative_constraints:
  - "Copy availability must not depend on hover-only discovery."
stale_retired_terms:
  - "/edit/delete"
  - "/control"
  - "/composer"
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-013 - Footer Queue And Files-Touched Projection

```yaml
plan_unit_id: ACD-013
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The chat footer owns the send/stop morph, queued-message affordance,
  latest-message actions, and compact files-touched projections synchronized
  with operation cards.
gui_related: true
gui_classification_reason: Footer controls, queue UI, files-touched rows, and click-to-open affordances are visible UI.
depends_on: [ACD-012]
unblocks: []
acceptance_criteria:
  - Queue UI shows FIFO order, pending count, and stop/interrupt state without restoring transient queued text after reload or restart.
  - Files-touched summaries stay synchronized with operation cards rather than forking status models.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: projection_fork
reasoning_tier: standard
context_scope: assistant_chat_window_001
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: footer_projection_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0021
preserved_exact_tokens:
  - "Read:"
  - "Edited:"
  - "diff counts"
  - "operation cards"
negative_constraints:
  - "Files touched output stays a compact projection of edit/diff activity rather than a second transcript."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-014 - Reserved Built-In Commands And Alias Disposition

```yaml
plan_unit_id: ACD-014
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Reserved slash commands are canonical and non-overridable. Deprecated and
  retired aliases remain visibly distinct and cannot suppress active command
  canon.
gui_related: false
gui_classification_reason: This unit governs command authority and compatibility routing rather than visual implementation.
depends_on: []
unblocks: []
acceptance_criteria:
  - Built-in commands remain reserved and non-editable by user-defined commands.
  - Retired aliases such as /assistant-chat and /clear remain compatibility lineage unless the command-catalog owner re-promotes them.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_alias_drift
reasoning_tier: standard
context_scope: assistant_chat_window_001
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
node_compile_hint:
  mode: reserved_command_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0022
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0023
preserved_exact_tokens:
  - "/new"
  - "/model"
  - "/mode"
  - "/stop"
  - "/revert"
  - "/web"
  - "/skill"
  - "/cancel"
  - "cmd.chat.stop"
  - "cmd.chat.revert"
negative_constraints: []
compatibility_only_notes:
  - "/assistant-chat and /clear are retired legacy or compatibility aliases in this Assistant Chat SSOT."
stale_retired_terms:
  - "/assistant-chat"
  - "/clear"
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### ACD-015 - Web Command Family And Capability Disclosure

```yaml
plan_unit_id: ACD-015
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  /web stays one command family with explicit subcommands, stable command IDs,
  help-only bare behavior, capability disclosure, normalized schemas, URL
  normalization, and source-obligation carry-through.
gui_related: true
gui_classification_reason: Web help, autocomplete, settings disclosure, and command availability are user-visible.
depends_on: []
unblocks: []
acceptance_criteria:
  - Bare /web shows help/autocomplete only and executable web intents require explicit subcommands.
  - /web help and settings disclose provider support tier, credential state, failures, and availability.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: web_tool_routing
reasoning_tier: standard
context_scope: assistant_chat_window_001
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/Tools.md
node_compile_hint:
  mode: web_command_family
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0024
preserved_exact_tokens:
  - "/web search <query>"
  - "/web extract <url>"
  - "/web research <task>"
  - "/web crawl <url>"
  - "cmd.chat.web.help"
  - "obl-037"
  - "obl-046"
  - "obl-047"
  - "obl-048"
  - "obl-051"
negative_constraints:
  - "Do not flatten /web into separate slash families."
  - "Bare /web is /help-only autocomplete and dispatches cmd.chat.web.help."
compatibility_only_notes:
  - "Legacy /what lineage is compatibility/help-only."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### ACD-016 - Skill Invocation Paths

```yaml
plan_unit_id: ACD-016
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Skill discovery and invocation are locked to the GUI panel, /skill, and
  natural language, all converging on invoke_skill without an MVP subcommand
  family.
gui_related: true
gui_classification_reason: The skill panel, slash help, and natural-language invocation are user-visible interaction paths.
depends_on: []
unblocks: []
acceptance_criteria:
  - /skill with no args lists available skills, and /skill with a name invokes the shared invoke_skill path.
  - GUI skill management, /skill, and natural-language invocation do not fork separate dispatch behavior.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: skill_dispatch_drift
reasoning_tier: standard
context_scope: assistant_chat_window_001
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Skills_System.md
node_compile_hint:
  mode: skill_invocation_paths
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0024
preserved_exact_tokens:
  - "/skill <skill_name> [args]"
  - "/skill with no args"
  - "invoke_skill"
  - "Skills panel"
  - "Natural language"
  - "No subcommand family for MVP"
negative_constraints:
  - "Do not create a separate MVP subcommand family for skills."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Skills_System.md
```

### ACD-017 - Git And GitHub Dispatch Boundary

```yaml
plan_unit_id: ACD-017
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  /git and local repository requests route to source-control commands. /github
  and hosted-repo requests route to GitHub commands. Cross-domain flows disclose
  the boundary and preserve repo, worktree, and compare handoff identity.
gui_related: false
gui_classification_reason: This unit governs routing and source-control boundaries rather than visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
  - The assistant does not reinterpret Git requests as GitHub requests or GitHub requests as Git requests just because one path appears easier.
  - Cross-domain flows preserve canonical repo/worktree/compare identity fields between local and hosted stages.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: source_control_boundary
reasoning_tier: standard
context_scope: assistant_chat_window_001
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/GitHub_Integration.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: git_github_dispatch_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0025
preserved_exact_tokens:
  - "/git ..."
  - "/github ..."
  - "local compare first, then hosted PR creation"
  - "repo/worktree/compare identity"
negative_constraints:
  - "The assistant MUST NOT silently reinterpret a Git request as a GitHub request, or vice versa, just because one path appears easier."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/GitHub_Integration.md
```

### ACD-018 - Custom Command Boundary

```yaml
plan_unit_id: ACD-018
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: User Commands may complement built-ins, but they cannot replace or suppress the canonical Assistant Chat command set. PM-native Ask and Plan behavior remains authoritative even when upstream reference products handle modes or permissions differently.
gui_related: false
gui_classification_reason: This unit governs command authority and compatibility routing, not GUI implementation.
depends_on: []
unblocks: []
acceptance_criteria:
  - User Commands do not override reserved Assistant Chat built-ins.
  - PM-native Ask and Plan remain authoritative over upstream reference-product differences.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_authority
reasoning_tier: standard
context_scope: assistant_chat_window_002
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
  - Plans/Commands_System.md
node_compile_hint:
  mode: custom_command_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0026
preserved_exact_tokens:
  - "User Commands"
  - "PM-native Ask"
  - "Plan"
negative_constraints:
  - "User Commands may complement built-ins, but they do not replace or suppress the canonical Assistant Chat command set."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Commands_System.md
```

### ACD-019 - Dispatcher Parity For Web Intents

```yaml
plan_unit_id: ACD-019
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Natural-language web intents and slash commands use the same dispatcher. Site or page reading intents route to webfetch rather than websearch or provider extract.
gui_related: true
gui_classification_reason: Dispatcher parity affects user-visible command routing, help, and activity behavior.
depends_on: [ACD-015]
unblocks: []
acceptance_criteria:
  - Natural-language and slash-command web intents resolve through the same dispatcher.
  - Reading intents such as read this URL and fetch this page resolve to webfetch, not websearch.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: web_dispatch_drift
reasoning_tier: standard
context_scope: command_surface
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: dispatcher_parity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0027
preserved_exact_tokens:
  - "read this site"
  - "read this URL"
  - "fetch this page"
  - "webfetch"
  - "websearch"
  - "webextract"
  - "webresearch"
  - "site/page reading is not search"
negative_constraints:
  - "Reading intents MUST resolve to `webfetch`, not `websearch`."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
```

### ACD-020 - Teach Capture Workflow

```yaml
plan_unit_id: ACD-020
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Teach is an explicit capture workflow for durable codebase knowledge, user preferences, and workflow constraints. It uses user-locked records and requires explicit user confirmation before storage; it is not a separate closed mode_overlay.
gui_related: false
gui_classification_reason: Teach capture and memory persistence behavior are backend/chat workflow behavior rather than visual implementation.
depends_on: []
unblocks: [ACD-021, ACD-022]
acceptance_criteria:
  - Teach may be invoked through /teach or equivalent natural-language persistence intent.
  - Persistence requires explicit user-confirming action before knowledge is stored.
  - Teach does not create a separate closed mode_overlay.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_capture_boundary
reasoning_tier: standard
context_scope: teach
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: teach_capture_workflow
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0028
preserved_exact_tokens:
  - "user-locked"
  - "/teach"
  - "remember that..."
  - "for this repo always..."
  - "please prefer..."
  - "mode_overlay"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
```

### ACD-021 - Teach Scope And Record Fields

```yaml
plan_unit_id: ACD-021
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Every Teach record declares thread, project, or user scope before commit and stores the required durable memory fields, including identity, provenance, capture time, normalized fact, supersession, and revocation metadata.
gui_related: false
gui_classification_reason: Teach scope and record fields are persistence/schema requirements, not GUI implementation.
depends_on: [ACD-020]
unblocks: [ACD-022]
acceptance_criteria:
  - Each taught item declares thread, project, or user scope before commit.
  - Persisted Teach records store the required minimum identity, provenance, normalized_fact, supersession, and revocation fields.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persistence_scope
reasoning_tier: standard
context_scope: teach_storage
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: teach_scope_schema
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0028
preserved_exact_tokens:
  - "thread"
  - "project"
  - "user"
  - "memory_id"
  - "scope"
  - "source_thread_id"
  - "author_message_id"
  - "captured_at"
  - "normalized_fact"
  - "supersedes_memory_id"
  - "revoked_at"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-022 - Teach Audit And Safety Rules

```yaml
plan_unit_id: ACD-022
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Teach retrieval, disclosure, conflict handling, inspection, narrowing, supersession, revocation, and secret exclusion are auditable safety rules. Taught knowledge enters prompts as explicit memory/context rather than undocumented hidden prompt mutation.
gui_related: false
gui_classification_reason: Teach audit and secret-exclusion behavior are memory governance requirements, not GUI implementation.
depends_on: [ACD-020, ACD-021]
unblocks: []
acceptance_criteria:
  - Conflicting teachings record supersession or revocation rather than silently overwriting prior knowledge.
  - Users can inspect, narrow, supersede, or revoke taught knowledge later.
  - Teach does not persist secrets, tokens, passwords, or other credentials.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: safety_audit
reasoning_tier: high
context_scope: teach
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Decision_Policy.md
  - Plans/Tools.md
node_compile_hint:
  mode: teach_audit_safety
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0028
preserved_exact_tokens:
  - "explicit memory/context"
  - "MUST NOT persist secrets, tokens, passwords, or other credentials"
negative_constraints:
  - "Teach MUST NOT persist secrets, tokens, passwords, or other credentials."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Decision_Policy.md
```

### ACD-023 - Structured Input And External Capability Provenance

```yaml
plan_unit_id: ACD-023
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Assistant Chat accepts structured inputs and external capability integrations beyond plain text while preserving provenance. Attachments, web search, and extensibility surfaces do not hide origin or capability use.
gui_related: false
gui_classification_reason: This unit owns provenance and external capability boundaries rather than concrete visual rendering.
depends_on: []
unblocks: [ACD-024, ACD-025, ACD-026]
acceptance_criteria:
  - Structured inputs retain provenance instead of being flattened into hidden context.
  - External capability use remains attributable to its source or integration.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provenance_boundary
reasoning_tier: standard
context_scope: attachments_web
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Media_Generation_and_Capabilities.md
  - Plans/Tools.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: external_capability_provenance
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0029
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0032
preserved_exact_tokens:
  - "Attachments, Web Search, and Extensibility"
  - "provenance"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
```

### ACD-024 - Attachment Payload Schema

```yaml
plan_unit_id: ACD-024
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Attachments persist as structured message payloads with defined attachment families and minimum fields for identity, display, source, media type, size, and preview state.
gui_related: false
gui_classification_reason: Attachment payload persistence and field shape are storage/schema behavior, not GUI implementation.
depends_on: [ACD-023]
unblocks: [ACD-025]
acceptance_criteria:
  - Supported attachment families include files, images, URLs, inline code snippets, and browser capture chips.
  - Attachment payloads include the minimum field set required by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: payload_schema
reasoning_tier: standard
context_scope: attachments
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: attachment_payload_schema
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0030
preserved_exact_tokens:
  - "files"
  - "images"
  - "URLs"
  - "inline code snippets"
  - "attachment_id"
  - "attachment_type"
  - "display_name"
  - "source_ref"
  - "mime_type?"
  - "size_bytes?"
  - "preview_state"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-025 - Visible Composer And Browser Capture Attachments

```yaml
plan_unit_id: ACD-025
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Composer attachments, voice drafts, browser capture chips, and browser-to-agent selection lifecycle remain visible, pending, removable, and user-triggered. Browser capture never arrives as hidden automatic context injection.
gui_related: true
gui_classification_reason: Composer drafts, chips, browser highlight/share flows, and removability are visible interaction surfaces.
depends_on: [ACD-023, ACD-024]
unblocks: []
acceptance_criteria:
  - Voice input becomes a visible draft or pending input transcript before send.
  - Browser capture chips remain pending, visible, and removable until the user sends.
  - Browser selection and element-pick commands do not auto-send chat messages.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: hidden_context_injection
reasoning_tier: high
context_scope: composer
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: attachment_composer_capture
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0030
preserved_exact_tokens:
  - "browser_selection_context"
  - "browser_element_context"
  - "document_selection_context"
  - "cmd.browser.add_selection_to_chat"
  - "cmd.browser.pick_element_for_chat"
  - "/primary"
  - "/highlight"
  - "/new-thread"
negative_constraints:
  - "Ordinary browser capture never arrives as hidden automatic context injection."
stale_retired_terms:
  - "Plans/newfeatures.md"
  - "/newfeatures.md"
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
```

### ACD-026 - Web Search Chat Disclosure

```yaml
plan_unit_id: ACD-026
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Web search is a first-class chat capability with explicit web activity cards, related-turn citations, provenance-preserving source disclosure, policy limitation disclosure, and distinct origin labels for user-supplied URLs versus assistant-triggered web results.
gui_related: true
gui_classification_reason: Web activity cards, source blocks, citations, and limitation disclosures are visible chat UI behavior.
depends_on: [ACD-019, ACD-023]
unblocks: []
acceptance_criteria:
  - Web use shows explicit web activity cards and later source or citation disclosure in the related assistant turn.
  - Fetched or extracted content preserves provenance distinct from synthesized conclusions.
  - Provider or policy inability to use web search is disclosed instead of implied away.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: web_provenance
reasoning_tier: standard
context_scope: chat_activity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: web_search_chat_disclosure
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0031
preserved_exact_tokens:
  - "web activity cards"
  - "operation cards"
  - "source blocks"
  - "citations"
  - "search snippets"
  - "extracted page text"
  - "synthesized conclusions"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
```

### ACD-027 - Question Flow Lifecycle

```yaml
plan_unit_id: ACD-027
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Question flows are PM-managed, draft-backed, resumable, and follow the canonical lifecycle draft -> incomplete -> ready_to_submit -> submitted -> paused.
gui_related: true
gui_classification_reason: Question draft state, completion state, submission state, and pause/resume behavior are user-visible interaction behavior.
depends_on: []
unblocks: [ACD-028, ACD-029, ACD-030, ACD-031]
acceptance_criteria:
  - Question drafts are thread-scoped and auto-save until submit.
  - Users can answer out of order and revise before submit where the question type allows it.
  - The canonical lifecycle states are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: question_lifecycle
reasoning_tier: standard
context_scope: questionnaire
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: question_flow_lifecycle
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0033
preserved_exact_tokens:
  - "draft"
  - "incomplete"
  - "ready_to_submit"
  - "submitted"
  - "paused"
  - "Thread-scoped draft state"
  - "drafts auto-save continuously"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-028 - Question Schema And Compatibility Normalization

```yaml
plan_unit_id: ACD-028
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Question schema names, enums, answer sources, legacy aliases, and compatibility normalizations are locked to the questionnaire envelope while preserving single_question compatibility through internal promotion.
gui_related: false
gui_classification_reason: Schema fields, aliases, enum values, and compatibility normalization are data-contract behavior rather than visual implementation.
depends_on: [ACD-027]
unblocks: [ACD-029, ACD-030]
acceptance_criteria:
  - single_question callers are promoted into the questionnaire envelope before processing.
  - Legacy input and output aliases normalize into canonical answer arrays and object-array options before draft storage, validation, or final answer submission.
  - allow_freeform is canonical and allow_other remains a retired alias.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: schema_compatibility
reasoning_tier: standard
context_scope: questionnaire
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: question_schema_normalization
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0033
preserved_exact_tokens:
  - "single_question"
  - "questionnaire"
  - "QuestionItem"
  - "allow_freeform"
  - "allow_other"
  - "default_values"
  - "draft_value"
  - "response_kind"
  - "validation_state"
  - "header?: string"
  - "text: string"
  - "options?: string[]"
  - "answer: string"
  - "Something else"
  - "Decision #9"
negative_constraints: []
compatibility_only_notes:
  - "single_question is legacy syntactic sugar over the questionnaire envelope with exactly one QuestionItem."
  - "Legacy tool-shape aliases header?: string, text: string, and options?: string[] are accepted only at the compatibility boundary."
stale_retired_terms:
  - "allow_other"
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-029 - Question Card Rendering Contract

```yaml
plan_unit_id: ACD-029
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Question-card rendering supports visible options, freeform or Other paths, multi-select checkbox layouts, shared question-card styling across Assistant and document-building flows, and optional source-text-first visual context.
gui_related: true
gui_classification_reason: Question-card options, checkbox groups, shared styling, and visual context are direct UI presentation and interaction requirements.
depends_on: [ACD-027, ACD-028]
unblocks: []
acceptance_criteria:
  - Multi-select renders options as a checkbox group and preserves selected option IDs in order.
  - Shared question styling uses one consistent question-card flow across Assistant, Interviewer, requirements, and document-builder questions.
  - Source-text-first visual context may be attached while PM remains owner of draft and submit lifecycle.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: visual_flow_drift
reasoning_tier: standard
context_scope: questionnaire_ui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: question_card_rendering
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0033
preserved_exact_tokens:
  - "multi_select"
  - "options?: Array<{id, label, description?}>"
  - "string[]"
  - "/flow"
  - "/Interviewer/requirements"
  - "/document-builder"
  - "source-text-first visual context"
negative_constraints: []
compatibility_only_notes:
  - "string[] remains backwards-compatible only for legacy single_question callers."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-030 - Question Submit And Dismiss Contract

```yaml
plan_unit_id: ACD-030
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Question submission and dismissal preserve submitted-versus-dismissed distinction. Dismissal pauses the flow and never fabricates partial submitted answers, auto-submits, or auto-cancels the broader thread.
gui_related: true
gui_classification_reason: Submit, dismissal, pause, and status feedback are user-visible question-card behavior.
depends_on: [ACD-027, ACD-028]
unblocks: []
acceptance_criteria:
  - /submit is the explicit user action that moves a ready question flow to submitted.
  - Dismissing pauses rather than auto-submitting, auto-cancelling, or fabricating partial answers.
  - Inline visuals do not invoke submit through sendPrompt.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: answer_integrity
reasoning_tier: high
context_scope: questionnaire
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: question_submit_dismiss_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0033
preserved_exact_tokens:
  - "answered"
  - "submitted"
  - "dismissed"
  - "timed_out"
  - "unavailable"
  - "/submit"
  - "/dismiss"
  - "NOT via `sendPrompt`"
  - "submitted_at?"
negative_constraints:
  - "Question flows never perform auto-submitting or auto-cancelling when dismissed."
stale_retired_terms:
  - "/dismiss"
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-031 - Subagent Question Boundary

```yaml
plan_unit_id: ACD-031
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Subagent question tool access is default-denied. Subagents escalate user questions to the parent orchestrator, and headless or HITL-unavailable flows return unavailable status.
gui_related: false
gui_classification_reason: Subagent question routing and default-denial are orchestration and policy behavior, not GUI implementation.
depends_on: [ACD-027]
unblocks: []
acceptance_criteria:
  - Subagents cannot address users directly unless explicitly re-enabled by run config.
  - Parent orchestrator owns the user-question surface decision.
  - Headless or HITL-unavailable question flows report unavailable status.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: subagent_boundary
reasoning_tier: standard
context_scope: hitl
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/human-in-the-loop.md
node_compile_hint:
  mode: subagent_question_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0033
preserved_exact_tokens:
  - "default-denial"
  - "Subagent question tool access is DENIED by default"
  - "status = \"unavailable\""
  - "assistant-chat-design.md §15.2"
negative_constraints:
  - "Subagent-direct question flows are prohibited product behavior, not a configurable local default."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/human-in-the-loop.md
```

### ACD-032 - Planning Model Core

```yaml
plan_unit_id: ACD-032
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Plan and Deep Plan share a normalized TODO projection, named Q&A loop, locked TODO schema, and locked status set while preserving explicit plan/checklist review before execution.
gui_related: false
gui_classification_reason: This unit defines planning data and workflow semantics rather than concrete visual presentation.
depends_on: []
unblocks: [ACD-033, ACD-034, ACD-035, ACD-038, ACD-040, ACD-043]
acceptance_criteria:
  - Plan and Deep Plan both project to a normalized TODO list.
  - TODO items preserve the canonical schema and active status set.
  - Competitive rationale remains source-lineage context without changing the canonical PM planning model.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: planning_model
reasoning_tier: standard
context_scope: plan_modes
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: planning_model_core
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0034
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0035
preserved_exact_tokens:
  - "Plan"
  - "Deep Plan"
  - "Q&A loop"
  - "todo_id"
  - "title"
  - "summary"
  - "status"
  - "dependencies[]"
  - "owner_hint"
  - "verification_hint"
  - "pending | in_progress | completed | blocked | skipped"
  - "Cursor"
  - "Codex"
  - "Claude Code"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-033 - Visible Plan Review Surface

```yaml
plan_unit_id: ACD-033
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Plan review is checklist-forward and visible, with a reviewable plan artifact, normalized TODO projection, live execution progress, sticky panel, and structural controls before approval.
gui_related: true
gui_classification_reason: Plan panel, checklist review, structural controls, sticky panel, and live execution progress are user-visible GUI behavior.
depends_on: [ACD-032]
unblocks: []
acceptance_criteria:
  - Planning is not hidden inside an opaque unified planning/execution loop.
  - The review surface exposes add, remove, and reorder structural controls before approval.
  - Live execution progress remains connected to the normalized TODO projection.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: planning_ui_projection
reasoning_tier: standard
context_scope: plan_review
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: visible_plan_review_surface
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0035
preserved_exact_tokens:
  - "visible plan/checklist review"
  - "execution-tracker"
  - "plan panel"
  - "/add/remove/reorder"
  - "sticky panel"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-034 - Plan Revision And TODO History

```yaml
plan_unit_id: ACD-034
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Plan and TODO persistence uses explicit revision states, gated structural edits, bounded history, chat.plan_todo_updated emissions, Deep Plan diff reconciliation, run-level states, and explicit replans.
gui_related: false
gui_classification_reason: Revision history, mutation events, and plan state persistence are backend/data behavior rather than visual implementation.
depends_on: [ACD-032]
unblocks: [ACD-043, ACD-044]
acceptance_criteria:
  - Structural edits after approval create a new revision rather than invisibly mutating approved history.
  - Deep Plan artifact edits resync the TODO projection through PM-extracted diffs.
  - chat.plan_todo_updated records durable normalized TODO mutations.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: todo_history_drift
reasoning_tier: high
context_scope: plan_persistence
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: plan_revision_todo_history
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0035
preserved_exact_tokens:
  - "chat.plan_todo_updated"
  - "todoread"
  - "source_surface"
  - "/diffs"
  - "/run-level"
  - "/replans"
  - "stale artifact copy"
negative_constraints:
  - "`todoread` must not survive as a `source_surface` mutation source."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-035 - Plan Thoroughness Control Surface

```yaml
plan_unit_id: ACD-035
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Plan Thoroughness is a visible Assistant Chat GUI control for Plan and Deep Plan with the enum Light, Balanced, and Comprehensive; both Plan and Deep Plan default to Balanced.
gui_related: true
gui_classification_reason: Plan Thoroughness is a visible Assistant Chat GUI control.
depends_on: [ACD-032]
unblocks: [ACD-036, ACD-037]
acceptance_criteria:
  - The Plan Thoroughness enum is limited to Light, Balanced, and Comprehensive.
  - Plan and Deep Plan default Plan Thoroughness is Balanced.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: planning_control_sync
reasoning_tier: standard
context_scope: pt
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: pt_control_surface
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0036
preserved_exact_tokens:
  - "Plan Thoroughness (PT)"
  - "Assistant Chat GUI"
  - "Light"
  - "Balanced"
  - "Comprehensive"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-036 - Plan Thoroughness Intensity Semantics

```yaml
plan_unit_id: ACD-036
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Plan Thoroughness controls clarifying-question budget, repo research breadth, cited web research posture, risk, alternative, dependency, and validation detail, TODO detail, and relative intensity between Plan and Deep Plan.
gui_related: false
gui_classification_reason: Planning intensity and research-budget semantics are workflow behavior, not GUI implementation.
depends_on: [ACD-035]
unblocks: [ACD-037]
acceptance_criteria:
  - Deep Plan at a given PT remains more intensive than Plan at the same PT.
  - Research continuation starts from the current work-item ledger and narrows to relevant docs rather than sweeping unrelated docs by default.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: planning_intensity
reasoning_tier: standard
context_scope: pt
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: pt_intensity_semantics
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0036
preserved_exact_tokens:
  - "clarifying-question budget"
  - "repo-research breadth"
  - "cited web research"
  - "current work-item ledger"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-037 - Plan Thoroughness Budget Matrix

```yaml
plan_unit_id: ACD-037
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: The PT budget matrix is the deterministic first-implementation ceiling/default baseline, including Plan budgets 2, 4, and 6, Deep Plan budgets 4, 6, and 8, web-research rules, and primary or official source preference for platform-capability research.
gui_related: false
gui_classification_reason: Budget ceilings and research-source posture are planning workflow constraints, not GUI implementation.
depends_on: [ACD-035, ACD-036]
unblocks: [ACD-038, ACD-040]
acceptance_criteria:
  - PT budget values are ceilings/defaults rather than promises that every run uses the full budget.
  - Web research follows the cited web-search contract when used.
  - Deep Plan favors primary or official sources when researching current platform capabilities, provider behavior, or best practices.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: budget_drift
reasoning_tier: standard
context_scope: pt_matrix
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: pt_budget_matrix
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0037
preserved_exact_tokens:
  - "ceilings/defaults"
  - "Plan | Light | 2"
  - "Plan | Balanced | 4"
  - "Plan | Comprehensive | 6"
  - "Deep Plan | Light | 4"
  - "Deep Plan | Balanced | 6"
  - "Deep Plan | Comprehensive | 8"
  - "primary/official sources"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-038 - Standard Plan Workflow

```yaml
plan_unit_id: ACD-038
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Standard Plan is for medium-complexity work, asks clarifying questions, remains a read-only planning run, may use safe parallel research where allowed, and prefers repo or codebase research first.
gui_related: false
gui_classification_reason: Standard Plan mode boundaries and research posture are workflow behavior, not GUI implementation.
depends_on: [ACD-032, ACD-037]
unblocks: [ACD-039]
acceptance_criteria:
  - Clarifying questions are allowed and expected in Standard Plan.
  - Standard Plan remains read-only during planning.
  - Standard Plan prefers repo/codebase research first and uses shorter web research than Deep Plan.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: mode_boundary
reasoning_tier: standard
context_scope: standard_plan
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: standard_plan_workflow
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0038
preserved_exact_tokens:
  - "Clarifying questions are allowed and expected; they are not optional."
  - "read-only planning run"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-039 - Standard Plan Artifact Surface

```yaml
plan_unit_id: ACD-039
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Standard Plan shows the written plan plus normalized TODO list in the plan panel, may open the artifact in the editor on demand, and has defined minimum artifact contents.
gui_related: true
gui_classification_reason: Plan panel display, editor opening, and artifact review are user-visible GUI behavior.
depends_on: [ACD-038]
unblocks: []
acceptance_criteria:
  - Standard Plan displays written plan content and normalized TODO list in the plan panel.
  - Opening the plan artifact in the editor is available on demand but is not automatic.
  - Standard Plan artifact minimums are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: artifact_surface
reasoning_tier: standard
context_scope: standard_plan
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: standard_plan_artifact_surface
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0038
preserved_exact_tokens:
  - "concise problem statement"
  - "current-state summary"
  - "proposed approach summary"
  - "normalized TODO list"
  - "verification / validation notes"
  - "unresolved questions"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-040 - Deep Plan Intensity Boundary

```yaml
plan_unit_id: ACD-040
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Deep Plan is for larger or higher-uncertainty work and differs from Standard
  Plan by degree and intensity: more questions, broader local research, and
  broader web research at the same PT.
gui_related: false
gui_classification_reason: Deep Plan intensity and mode boundary are planning workflow behavior, not GUI implementation.
depends_on: [ACD-032, ACD-037]
unblocks: [ACD-041, ACD-042]
acceptance_criteria:
  - Deep Plan asks more questions than Standard Plan at the same PT.
  - Deep Plan performs materially broader repo and web research than Standard Plan at the same PT.
  - Plan versus Deep Plan difference remains degree/intensity, not categorical.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: mode_boundary
reasoning_tier: standard
context_scope: deep_plan
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: deep_plan_intensity_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0039
preserved_exact_tokens:
  - "LOCKED behavior"
  - "degree/intensity, not categorical"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-041 - Deep Plan Artifact Opening

```yaml
plan_unit_id: ACD-041
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Deep Plan produces a rich markdown planning document, automatically opens it in a preview-capable editing surface, defaults to planning_draft, and uses transient generated:// artifact buffers when not persisted.
gui_related: true
gui_classification_reason: Automatic preview-capable editor opening and rich document rendering are user-visible GUI behavior.
depends_on: [ACD-040]
unblocks: [ACD-042]
acceptance_criteria:
  - Deep Plan documents open automatically in a preview-capable editing surface.
  - Non-persisted Deep Plan documents open as transient generated:// artifact buffers.
  - Source markdown and Mermaid text remain canonical even when richly rendered.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: artifact_identity
reasoning_tier: standard
context_scope: deep_plan
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FileManager.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: deep_plan_artifact_opening
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0039
preserved_exact_tokens:
  - "planning_draft"
  - "open_source"
  - "generated://<artifact_id>"
  - "source markdown / Mermaid text"
  - "Mermaid Diagrams"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FileManager.md
```

### ACD-042 - Deep Plan Section Minimums

```yaml
plan_unit_id: ACD-042
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Deep Plan documents have locked minimum sections and allowed optional sections covering objective, scope, context, approach, questions, execution TODOs, validation, risks, alternatives, diagrams, snippets, affected areas, and rollout notes.
gui_related: false
gui_classification_reason: Document section requirements are content structure constraints, not GUI implementation.
depends_on: [ACD-041]
unblocks: []
acceptance_criteria:
  - Deep Plan documents include every minimum section.
  - Optional Deep Plan sections remain allowed without becoming required for every document.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: document_completeness
reasoning_tier: standard
context_scope: deep_plan
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: deep_plan_section_minimums
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0039
preserved_exact_tokens:
  - "Objective"
  - "Scope"
  - "Current State / Relevant Context"
  - "Proposed Approach"
  - "Open Questions / Assumptions"
  - "Execution Plan / TODOs"
  - "Validation / Acceptance"
  - "Risks"
  - "Alternatives Considered"
  - "Mermaid Diagrams"
  - "Code Snippets"
  - "Affected Files / Areas"
  - "Rollout / Migration Notes"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-043 - Normalized TODO Schema

```yaml
plan_unit_id: ACD-043
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: The normalized TODO schema owns fields, ordering, notes, legacy payload normalization, plan-level superseded summaries, verification scope labeling, and visible TODO checklist terminology.
gui_related: false
gui_classification_reason: TODO field shape, compatibility normalization, and plan-level status semantics are data-contract behavior, not GUI implementation.
depends_on: [ACD-032, ACD-034]
unblocks: [ACD-044, ACD-045]
acceptance_criteria:
  - TODO items use order_index and notes as canonical fields.
  - Legacy TODO payloads normalize into the Assistant TODO schema.
  - Superseded TODO N/N remains a plan-level summary and not an active item-level TODO status.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: schema_compatibility
reasoning_tier: standard
context_scope: todo
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: normalized_todo_schema
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0040
preserved_exact_tokens:
  - "order_index"
  - "notes"
  - "notes?"
  - "order_index?"
  - "Superseded TODO N/N"
  - "verification_hint"
  - "todos: Array<{ id?, content, status? }>"
  - "todos: Array<{ id, content, status }>"
  - "TODO"
negative_constraints: []
compatibility_only_notes:
  - "Legacy optional spellings notes? and order_index? normalize to canonical notes and order_index."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-044 - TODO Tool Mutation Boundary

```yaml
plan_unit_id: ACD-044
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: todowrite and todoread use the normalized TODO schema; todowrite is not blanket auto-denied in ask or plan mode, and Deep Plan markdown edits resync TODO projection before execution begins.
gui_related: false
gui_classification_reason: TODO tool mutation, read behavior, and execution gating are runtime/tool behavior, not GUI implementation.
depends_on: [ACD-043]
unblocks: [ACD-045]
acceptance_criteria:
  - todowrite can create, reorder, and update TODO statuses or notes through the normalized schema.
  - todoread returns the current normalized list for the active thread or run.
  - Editing Deep Plan markdown updates the normalized TODO projection before execution begins.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: tool_mutation_boundary
reasoning_tier: high
context_scope: todo
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: todo_tool_mutation_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0040
preserved_exact_tokens:
  - "todowrite"
  - "todoread"
  - "chat.plan_todo_updated"
  - "source_surface"
  - "Remove `todowrite` from blanket `ask/plan` mode auto-deny"
  - "MUST update the normalized TODO projection BEFORE execution begins"
negative_constraints:
  - "`todoread` must not survive as a `source_surface` mutation source."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-045 - TODO Auto-Use Review Surface

```yaml
plan_unit_id: ACD-045
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: TODO auto-use may propose or refresh TODOs for multi-step work, emits proposed items through the resolved permission posture, records chat.plan_todo_updated, and keeps plan-panel state reviewable before execution observes revisions.
gui_related: true
gui_classification_reason: Proposed TODO approval prompts and reviewable plan-panel state are user-visible Assistant Chat behavior.
depends_on: [ACD-043, ACD-044]
unblocks: []
acceptance_criteria:
  - Auto-use on-trigger behavior emits proposed TODO items.
  - Ask-mode displays an approval prompt listing proposed TODO items before creation.
  - Execution observes revised TODOs only after chat.plan_todo_updated records the mutation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: approval_visibility
reasoning_tier: standard
context_scope: todo_auto_use
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: todo_auto_use_review_surface
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0040
preserved_exact_tokens:
  - "on-trigger"
  - "ask-mode"
  - "proposed TODO items"
  - "auto-approved"
  - "dependency-bearing work"
  - "multi-file or multi-subsystem work"
  - "delegated subagent or crew execution"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-046 - Standard Plan Review Loop

```yaml
plan_unit_id: ACD-046
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Standard Plan review lets the user continue chat, request revisions, or open
  the plan in the editor; follow-up chat responses may revise the planning
  artifact.
gui_related: true
gui_classification_reason: Review actions and editor opening are visible Assistant Chat interactions.
depends_on: [ACD-038, ACD-039]
unblocks: [ACD-053]
acceptance_criteria:
  - Standard Plan review supports continuing chat, requesting revisions, and opening the plan in the editor.
  - Follow-up chat can revise the planning artifact without starting execution.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: plan_review_flow
reasoning_tier: standard
context_scope: assistant_chat_window_003
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Crosswalk.md
node_compile_hint:
  mode: standard_plan_review_loop
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0041
preserved_exact_tokens:
  - "continue the chat"
  - "request revisions"
  - "open the plan in the editor"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-047 - Deep Plan Annotation Palette

```yaml
plan_unit_id: ACD-047
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Deep Plan review uses an editor or preview-capable planning surface, supports
  direct markdown edits, and exposes the source-backed annotation palette with
  the five allowed selection actions.
gui_related: true
gui_classification_reason: The editor/preview surface and annotation palette are visible document-review UI.
depends_on: [ACD-041]
unblocks: [ACD-048, ACD-049, ACD-053]
acceptance_criteria:
  - Deep Plan documents open in a preview-capable planning surface for review.
  - Source-backed or deterministically mapped selections expose the allowed action palette.
  - Read-only or no-source-map renders do not expose mutating annotation actions without a stable semantic-anchor contract.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: annotation_surface_drift
reasoning_tier: standard
context_scope: deep_plan_review
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Crosswalk.md
node_compile_hint:
  mode: deep_plan_annotation_palette
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0041
preserved_exact_tokens:
  - "Comment / Ask"
  - "Replace with..."
  - "Insert after..."
  - "Remove / Strike this"
  - "Send selection to chat"
  - "quote-only"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-048 - Annotation Persistence Boundary

```yaml
plan_unit_id: ACD-048
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Durable Deep Plan actions create note_record.v1 annotations. Send selection
  to chat creates a visible pending document_selection_context chip and remains
  an ephemeral handoff action; v1 does not expose direct patch-apply behavior
  from document annotations.
gui_related: false
gui_classification_reason: Annotation persistence and mutation boundaries are storage/workflow behavior, not GUI presentation.
depends_on: [ACD-047]
unblocks: [ACD-049, ACD-051]
acceptance_criteria:
  - Durable annotation actions use note_record.v1 lineage.
  - Send selection to chat creates a pending document_selection_context chip rather than a durable annotation.
  - Mutating annotations are applied only through targeted revision after validation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: annotation_mutation_boundary
reasoning_tier: high
context_scope: deep_plan_review
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Prompt_Pipeline.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: annotation_persistence_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0041
preserved_exact_tokens:
  - "note_record.v1"
  - "document_selection_context"
  - "terminal-associated"
  - "/non-writable"
  - "patch-apply"
negative_constraints:
  - "v1 does not expose direct `patch-apply` behavior from document annotations."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-049 - Targeted Revision Annotation Lifecycle

```yaml
plan_unit_id: ACD-049
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Resubmit with Annotations runs a targeted revision pass over open durable
  annotations or selected subsets, may update the plan document or answer
  comments, and must not auto-run Multi-Pass Review.
gui_related: false
gui_classification_reason: Targeted revision lifecycle and review gates are workflow/governance behavior, not GUI implementation.
depends_on: [ACD-048]
unblocks: [ACD-050, ACD-053]
acceptance_criteria:
  - Targeted revision can operate on all open durable annotations or a user-selected subset.
  - Conflicting or stale mutating annotations are excluded from automatic revision until resolved.
  - Final review gates use no open annotations rather than no open notes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: revision_gate_drift
reasoning_tier: high
context_scope: deep_plan_review
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: targeted_revision_lifecycle
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0041
preserved_exact_tokens:
  - "Resubmit with Annotations"
  - "open -> addressed -> resolved"
  - "no open annotations"
  - "no open notes"
negative_constraints:
  - "targeted revision MUST NOT auto-run Multi-Pass Review"
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
```

### ACD-050 - Annotation Reanchor And Recovery

```yaml
plan_unit_id: ACD-050
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Annotation anchors reattach deterministically by position or quote; missing
  anchors remain open with an explicit warning, and interrupted targeted
  revision recovery preserves revision lineage and safe-point metadata.
gui_related: false
gui_classification_reason: Reanchor matching, recovery lineage, and safe-point preservation are storage/workflow behavior.
depends_on: [ACD-049]
unblocks: []
acceptance_criteria:
  - position_match or quote_match keeps an annotation eligible.
  - anchor_not_found leaves an annotation unresolved and open.
  - Interrupted revision runs preserve revision_id and resume lineage.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: annotation_recovery
reasoning_tier: high
context_scope: deep_plan_review
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/FileSafe.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: annotation_reanchor_recovery
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0041
preserved_exact_tokens:
  - "position_match"
  - "quote_match"
  - "anchor_not_found"
  - "/unresolved"
  - "revision_run.{bundle_id}.{revision_id}"
  - "resumed_from_revision_id?"
negative_constraints:
  - "if an anchor cannot be reattached, keep the annotation open and show an explicit warning rather than silently dropping it"
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-051 - Document Selection Composer Handoff

```yaml
plan_unit_id: ACD-051
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Document selection handoff always creates chat-visible pending composer chips
  in the shared Context and Attachments prep tray, never hidden messages,
  thread mutation before send, document-selection-only trays, or full-document
  inline chat dumps.
gui_related: true
gui_classification_reason: Pending chips, prep tray grouping, snackbars, and chat launcher feedback are visible GUI behavior.
depends_on: [ACD-025, ACD-048]
unblocks: [ACD-052]
acceptance_criteria:
  - Selection-to-chat and document-selection create visible pending composer chips.
  - Hidden chat panels can receive pending chips without auto-opening by default.
  - Chat keeps document-pane/editor pointers plus bounded excerpts instead of full-document inline bodies.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: hidden_context_injection
reasoning_tier: high
context_scope: document_selection
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: document_selection_composer_handoff
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0041
preserved_exact_tokens:
  - "selection-to-chat"
  - "document-selection"
  - "auto-open"
  - "/snackbar"
  - "Selection added to Assistant chat"
  - "Open chat"
  - "pre-send"
  - "Context Lens"
  - "full-document"
negative_constraints:
  - "selection-to-chat and document-selection always create chat-visible pending composer chips; they must not silently inject hidden messages or mutate a thread before the user sends."
  - "Do not create a document-selection-only /tray or a separate document-only strip."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
```

### ACD-052 - Selection Target Privacy And GUI Drawer

```yaml
plan_unit_id: ACD-052
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Selection target resolution stays on the owning thread or surface, honors
  FileSafe privacy and sensitivity statuses, and exposes reusable annotation
  drawer, palette, filter, overlay, and ghost-preview GUI affordances.
gui_related: true
gui_classification_reason: Target badges, drawer filters, palettes, overlays, and ghost-preview styling are visible GUI behavior.
depends_on: [ACD-051]
unblocks: []
acceptance_criteria:
  - Explicit user-selected targets win before page-owned chat or new-thread fallback.
  - No silent cross-thread fallback is allowed.
  - Blocked, expired, or scrubbed chips stay visible with statuses and reason codes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: selection_target_privacy
reasoning_tier: high
context_scope: document_selection
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FileSafe.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: selection_target_privacy_gui
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0041
preserved_exact_tokens:
  - "cross-thread"
  - "/privacy"
  - "/statuses"
  - "/palette"
  - "Open / Addressed / Resolved"
  - "/overlays"
  - "ghost-preview"
negative_constraints:
  - "no silent `cross-thread` fallback is allowed"
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FileSafe.md
```

### ACD-053 - Post-Plan Approval Actions

```yaml
plan_unit_id: ACD-053
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Post-plan approval requires explicit user action and presents exactly four
  primary choices after Plan or Deep Plan output: Accept the plan and build with
  Yolo, Accept the plan and build on default permissions, Exit plan, and Suggest
  plan changes.
gui_related: true
gui_classification_reason: Post-plan action choices are user-visible Assistant Chat controls.
depends_on: [ACD-032, ACD-046]
unblocks: [ACD-054]
acceptance_criteria:
  - Planning output never auto-executes.
  - The four primary post-plan choices remain present after Plan or Deep Plan output.
  - Crew execution configuration cannot replace the four primary choices.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: execution_approval_boundary
reasoning_tier: high
context_scope: post_plan_handoff
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: post_plan_approval_actions
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0042
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0044
preserved_exact_tokens:
  - "Accept the plan and build with Yolo"
  - "Accept the plan and build on default permissions"
  - "Exit plan"
  - "Suggest plan changes"
negative_constraints:
  - "Planning output never auto-executes."
  - "Crew execution may be selected through execution configuration or a crew-specific flow, but it must not replace the four primary post-plan choices."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-054 - Accepted Plan Execution Handoff

```yaml
plan_unit_id: ACD-054
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Accepted plans freeze planning artifact and TODO state, switch out of Plan or
  Deep Plan into the correct execution mode and persona, and start or queue
  execution using regular by default or yolo only when explicitly selected.
gui_related: false
gui_classification_reason: Execution handoff, freezing, mode switching, and runtime posture are workflow/runtime behavior, not GUI presentation.
depends_on: [ACD-053, ACD-043]
unblocks: []
acceptance_criteria:
  - Approval freezes the planning artifact and TODO state as the execution starting point.
  - Execution uses regular by default and yolo only when explicitly selected.
  - If another run is active in the same thread, accepted execution may queue behind it through Queue Execution.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: execution_handoff
reasoning_tier: high
context_scope: post_plan_handoff
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: accepted_plan_execution_handoff
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0042
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0044
preserved_exact_tokens:
  - "Queue Execution"
  - "regular"
  - "yolo"
  - "frozen as the execution starting point"
negative_constraints:
  - "Execution starts only after explicit approval and uses `regular` or `yolo`, never `plan`."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
```

### ACD-055 - Planning Wizard Escalation

```yaml
plan_unit_id: ACD-055
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Planning overlays may recommend the Planning Wizard when work is better treated
  as feature or enhancement specification plus adaptive interview/orchestrator
  flow. Deep Plan must perform the wizard-escalation check before final
  execute-first recommendations, but the recommendation is a CTA, not a forced
  redirect.
gui_related: true
gui_classification_reason: Wizard recommendations and CTAs are visible planning UI behavior.
depends_on: [ACD-038, ACD-040]
unblocks: []
acceptance_criteria:
  - Standard Plan may recommend Planning Wizard when signals are strong.
  - Deep Plan performs a wizard-escalation check before final execute-first recommendations.
  - Recommendations are user-facing suggestions and not automatic redirects.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: planning_escalation
reasoning_tier: standard
context_scope: planning_overlay
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: planning_wizard_escalation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0043
preserved_exact_tokens:
  - "Planning Wizard"
  - "UI + data + security + deployment"
negative_constraints:
  - "Recommendation is a user-facing suggestion/CTA, not an automatic forced redirect."
stale_retired_dispositions:
  - "Chain Wizard is a legacy source token for this span; current product prose and UI use Planning Wizard."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
```

### ACD-056 - File Reference Handoff

```yaml
plan_unit_id: ACD-056
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Chat file references are explicit visible composer chips inserted through the
  canonical add-file-reference command, file-only for MVP, and never hidden
  full-file context injection.
gui_related: true
gui_classification_reason: File chips, pickers, and Add to Assistant Chat handoff are visible chat/file-manager UI behavior.
depends_on: [ACD-025]
unblocks: []
acceptance_criteria:
  - "@ mention and picker flows insert visible chips rather than hidden file content."
  - File Manager Add to Assistant Chat uses cmd.chat.add_file_reference.
  - Folder insertion remains out of MVP scope.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: hidden_file_context
reasoning_tier: high
context_scope: file_reference
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FileManager.md
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: file_reference_handoff
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0045
preserved_exact_tokens:
  - "@"
  - "cmd.chat.add_file_reference { project_id, thread_id?, path, line_range? }"
  - "file-only in MVP"
negative_constraints:
  - "File Manager `Add to Assistant Chat` uses that command to insert a visible canonical file reference into the active composer/thread context; it must not inline full file contents as a hidden side effect."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FileManager.md
```

### ACD-057 - Chat Revert Restore Boundary

```yaml
plan_unit_id: ACD-057
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  cmd.chat.revert is the canonical entrypoint for Revert last agent edit and
  file-mutation restore, while cmd.chat.rewind remains conversation-history
  rewind only.
gui_related: false
gui_classification_reason: Restore and rewind boundaries are command/runtime behavior, not GUI implementation.
depends_on: []
unblocks: []
acceptance_criteria:
  - Omitted target_message_id resolves to the latest assistant turn with persisted file mutations.
  - Multi-file turn reverts apply to the whole turn across affected files.
  - Deleted worktree paths fail inline rather than recreating missing directories or resolving through the current working_directory.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: restore_boundary
reasoning_tier: high
context_scope: file_restore
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FileSafe.md
  - Plans/GitHub_Integration.md
node_compile_hint:
  mode: chat_revert_restore_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0045
preserved_exact_tokens:
  - "cmd.chat.revert"
  - "cmd.chat.rewind"
  - "Revert last agent edit"
  - "target_message_id"
  - "/project/.puppet-master/worktrees/thread-abc/src/main.rs"
  - "working_directory"
negative_constraints:
  - "cmd.chat.rewind remains conversation-history rewind only"
  - "fails with a file-not-found style inline error instead of recreating missing directories"
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FileSafe.md
```

### ACD-058 - Chat Diff Source Control Consumer

```yaml
plan_unit_id: ACD-058
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant Chat is a review-oriented Source Control consumer. It may preview,
  summarize, annotate, or collect review comments, while review, compare,
  conflict, stage, commit, worktree, graph, and source-control mutations route
  to the owning surfaces and command catalog entries.
gui_related: true
gui_classification_reason: Chat diff cards, review CTAs, and source-control deep links are user-visible GUI behavior.
depends_on: [ACD-057]
unblocks: [ACD-059]
acceptance_criteria:
  - Chat does not own hunk-level stage, unstage, discard, conflict-review, or commit operations.
  - Chat CTAs call the canonical source-control and git worktree commands.
  - Generated commit text is not persisted as history before acceptance.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: source_control_owner_drift
reasoning_tier: high
context_scope: source_control_consumer
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FileSafe.md
  - Plans/GitHub_Integration.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: chat_diff_source_control_consumer
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0045
preserved_exact_tokens:
  - "Review mode"
  - "Open Review Mode"
  - "cmd.source_control.open_review"
  - "cmd.source_control.set_compare_target"
  - "cmd.source_control.toggle_generated_filter"
  - "cmd.source_control.suggest_commit_groups"
  - "cmd.source_control.accept_commit_group"
  - "cmd.source_control.generate_commit_message"
  - "cmd.git.worktree.open|compare|recover|prune|focus_lineage"
  - "/event/storage"
  - "/tradeoffs"
negative_constraints:
  - "Chat may preview diffs and edit counts, but it must not own hunk-level stage/unstage/discard controls, conflict-review state, or chat-local review mutations."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/GitHub_Integration.md
```

### ACD-059 - Files Touched SCM Projection

```yaml
plan_unit_id: ACD-059
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Files-touched strips, worktree cards, and completed-work cards are aggregate
  chat projections that deep-link to source, diff/review, Source Control, Run
  Graph, Orchestrator, and evidence contexts without owning SCM truth.
gui_related: true
gui_classification_reason: Files-touched rows, completed-work cards, labels, and deep links are visible chat UI.
depends_on: [ACD-058]
unblocks: []
acceptance_criteria:
  - Clicking file-preview rows opens the canonical source file or diff/review owner surface.
  - Worktree and completed-work cards show SCM context as a consumer projection.
  - Tier-level, run-scoped, or completed-work SCM ownership badges are not treated as canonical ownership.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: scm_projection_drift
reasoning_tier: standard
context_scope: source_control_consumer
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Run_Graph_View.md
  - Plans/Orchestrator_Page.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: files_touched_scm_projection
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0045
preserved_exact_tokens:
  - "files-touched"
  - "Read:"
  - "Edited:"
  - "/branch/worktree"
  - "/worktree/run"
  - "Open in Source Control"
  - "Compare run output"
  - "GITHUB ACTIONS"
  - "Git (GitHub)"
negative_constraints:
  - "Chat never treats tier-level, run-scoped, or completed-work SCM /ownership badges as canonical ownership."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Run_Graph_View.md
```

### ACD-060 - Chat Search Owner Boundary

```yaml
plan_unit_id: ACD-060
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Chat search and history retrieval are chat-domain retrieval only; project-wide
  find and replace remain Search side-panel owned, and semantic symbol or
  reference lookup remains editor/LSP owned even when chat launches it.
gui_related: true
gui_classification_reason: Search results and owner-surface routing are user-visible, while ownership stays with the relevant surfaces.
depends_on: []
unblocks: [ACD-061, ACD-062]
acceptance_criteria:
  - Chat-domain retrieval does not become project-wide find/replace ownership.
  - Symbol and reference lookup route to editor/LSP ownership.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: search_owner_boundary
reasoning_tier: standard
context_scope: search
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/LSPSupport.md
  - Plans/FileManager.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: chat_search_owner_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0045
preserved_exact_tokens:
  - "chat search/history retrieval"
  - "Search side-panel"
  - "editor/LSP"
negative_constraints:
  - "project-wide find-in-files and replace-in-files remain Search side-panel owned"
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/LSPSupport.md
```

### ACD-061 - Human Chat History Search

```yaml
plan_unit_id: ACD-061
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Human chat history search is a first-class UI feature for searching across
  chats and history, with search box, filters, results list, and a Tantivy chat
  index fed by the seglog projector.
gui_related: true
gui_classification_reason: Search box, filters, and results list are visible user-facing UI.
depends_on: [ACD-060]
unblocks: [ACD-062, ACD-063]
acceptance_criteria:
  - Users can search within current chat and, where applicable, across past chats or sessions.
  - Human chat history search uses a Tantivy chat index fed by seglog projection.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_history_search
reasoning_tier: standard
context_scope: chat_history
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: human_chat_history_search
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0046
preserved_exact_tokens:
  - "search across chats / history"
  - "search box"
  - "filters"
  - "results list"
  - "Tantivy chat index"
  - "seglog projector"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-062 - Agent Chat History Search

```yaml
plan_unit_id: ACD-062
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Agents can query chat history through tool, API, MCP-equivalent, or context
  pipeline access to retrieve prior decisions, explanations, and outcomes for
  continuity.
gui_related: false
gui_classification_reason: Agent retrieval interfaces are backend/context-pipeline behavior, not GUI implementation.
depends_on: [ACD-061]
unblocks: [ACD-063]
acceptance_criteria:
  - Assistant, Interview, and subagents can retrieve relevant prior messages or sessions when answering or planning.
  - Agent search can share the same storage/index as human chat search while exposing an agent-callable interface.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: context_continuity
reasoning_tier: standard
context_scope: chat_history
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: agent_chat_history_search
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0046
preserved_exact_tokens:
  - "Assistant, Interview, or subagent"
  - "tool/MCP"
  - "context pipeline"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
```

### ACD-063 - Auto Retrieval Scope

```yaml
plan_unit_id: ACD-063
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Smart auto-retrieval is project-only by default across chat history, project
  workspace code, and project logs; it must not search other projects or
  external sources unless the user explicitly requests external navigation or
  import.
gui_related: false
gui_classification_reason: Retrieval scope is context-pipeline behavior, not GUI implementation.
depends_on: [ACD-061, ACD-062]
unblocks: [ACD-064, ACD-065, ACD-066]
acceptance_criteria:
  - Auto-retrieval searches only within the current project by default.
  - External or cross-project retrieval requires explicit user request.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: retrieval_scope
reasoning_tier: high
context_scope: auto_retrieval
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: auto_retrieval_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0047
preserved_exact_tokens:
  - "Project-only by default"
  - "current project"
  - "chat/code/logs"
negative_constraints:
  - "It MUST NOT search other projects or external sources unless the user explicitly requests external navigation/import."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-064 - Auto Retrieval Triggers And Budget

```yaml
plan_unit_id: ACD-064
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Auto-retrieval is triggered and budgeted, not always-on for everything, with
  deterministic per-source query, hit, and byte caps plus deterministic trigger
  heuristics for chat, code, and log retrieval.
gui_related: false
gui_classification_reason: Retrieval trigger and budget rules are context-pipeline behavior, not GUI implementation.
depends_on: [ACD-063]
unblocks: [ACD-066]
acceptance_criteria:
  - Auto-retrieval does not search everything every turn.
  - Per-source query, hit, and byte caps prevent retrieved context from crowding out user/assistant messages.
  - Trigger heuristics remain deterministic.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: retrieval_budget
reasoning_tier: standard
context_scope: auto_retrieval
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: auto_retrieval_triggers_budget
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0047
preserved_exact_tokens:
  - "Not always-on for everything"
  - "Deterministic budget caps"
  - "Chat-history triggers"
  - "Code triggers"
  - "Logs triggers"
negative_constraints:
  - "Auto-retrieval MUST be triggered and budgeted, not \"search everything every turn.\""
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
```

### ACD-065 - Auto Retrieval Settings Surface

```yaml
plan_unit_id: ACD-065
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Retrieval settings expose off, auto, and always per retrieval source, default
  chat, code, and logs to auto, and provide a thread-local Auto Retrieval chip
  with On and Off states.
gui_related: true
gui_classification_reason: Settings rows and the thread-local Auto Retrieval chip are visible UI controls.
depends_on: [ACD-063]
unblocks: []
acceptance_criteria:
  - Each retrieval source supports off, auto, and always settings.
  - Chat, code, and logs default to auto.
  - A thread-local Auto Retrieval chip can toggle On or Off without changing project defaults.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: retrieval_settings
reasoning_tier: standard
context_scope: auto_retrieval
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: auto_retrieval_settings_surface
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0047
preserved_exact_tokens:
  - "off"
  - "auto"
  - "always"
  - "Auto Retrieval chip"
  - "On/Off"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-066 - Retrieved Context Memory Boundary

```yaml
plan_unit_id: ACD-066
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Retrieved results enter the Work bundle as a Retrieved Context block with
  source type, provenance, snippet sizes, and truncation notes. Retrieved
  Context is not Assistant memory and must respect Context Lens overlays.
gui_related: false
gui_classification_reason: Retrieved Context assembly and memory boundaries are prompt/context pipeline behavior.
depends_on: [ACD-063, ACD-064]
unblocks: []
acceptance_criteria:
  - Retrieved Context carries source type, provenance, byte/token sizes, and truncation notes.
  - Retrieved Context is not written to Assistant memory unless separately captured as a verified gist.
  - Context Lens muted, focused, and subcompacted rules affect retrieval injection.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_boundary
reasoning_tier: high
context_scope: auto_retrieval
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/assistant-memory-subsystem.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: retrieved_context_memory_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0047
preserved_exact_tokens:
  - "Retrieved Context"
  - "Work bundle"
  - "memory"
  - "Plans/assistant-memory-subsystem.md"
  - "Context Lens"
negative_constraints:
  - "Retrieved Context is not \"memory\" and must not be written into the Assistant memory store unless separately captured as a verified gist."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/assistant-memory-subsystem.md
```

### ACD-067 - Agent Search Tool Contracts

```yaml
plan_unit_id: ACD-067
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Project-scoped agent search tools expose chatsearch, codesearch, logsearch,
  logread, and grep contracts over project indices to support explicit agent
  reasoning and smart retrieval.
gui_related: false
gui_classification_reason: Agent search tools and query contracts are backend/tool behavior.
depends_on: [ACD-063]
unblocks: [ACD-068, ACD-069]
acceptance_criteria:
  - chatsearch, codesearch, logsearch, logread, and grep expose project-scoped query contracts.
  - logread payloads are bounded by size caps and stricter permission defaults.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: search_tool_contract
reasoning_tier: standard
context_scope: agent_search
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
  - Plans/Permissions_System.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: agent_search_tool_contracts
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0048
preserved_exact_tokens:
  - "chatsearch(query, filters={thread_id?, time_range?}, k)"
  - "codesearch(query, path?, mode={text|symbol}, k)"
  - "logsearch(query, filters={time_range?, run_id?, thread_id?, tool_name?, level?}, k)"
  - "logread(ref)"
  - "grep(pattern, path?, glob?)"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
```

### ACD-068 - Search Freshness And Grep Fallback

```yaml
plan_unit_id: ACD-068
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Grep and search freshness disclosure distinguishes valid stale snapshots,
  raw-ripgrep fallback, dirty-layer freshness protection, and sparse n-gram
  acceleration without re-owning Tools implementation details.
gui_related: false
gui_classification_reason: Search freshness and fallback semantics are tool/runtime behavior, not GUI implementation.
depends_on: [ACD-067]
unblocks: []
acceptance_criteria:
  - Missing, disabled, corrupted, building, invalid, or query-skipped indices fall back to raw ripgrep.
  - Stale-but-valid snapshots remain usable with disclosure.
  - Chat summaries preserve same-freshness guarantees while Tools owns performance targets and implementation detail.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: freshness_disclosure
reasoning_tier: standard
context_scope: agent_search
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: search_freshness_grep_fallback
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0048
preserved_exact_tokens:
  - "raw-ripgrep"
  - "search-tool"
  - "stale-but-valid snapshots"
  - "dirty-layer freshness"
  - "sparse n-gram"
negative_constraints:
  - "raw-ripgrep fallback is active"
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
```

### ACD-069 - GUI Log Search Surface

```yaml
plan_unit_id: ACD-069
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Dedicated GUI log surfaces expose logsearch and logread summary rows,
  drill-down, export, and on-demand dereference without turning full payloads
  into default chat transcript content.
gui_related: true
gui_classification_reason: Log summary rows, drill-down, export, and dereference controls are GUI surfaces.
depends_on: [ACD-067]
unblocks: []
acceptance_criteria:
  - GUI log surfaces provide summary rows and drill-down for logsearch/logread.
  - Full log payloads are dereferenced on demand rather than placed in default chat transcript content.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: log_payload_exposure
reasoning_tier: standard
context_scope: agent_search
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_log_search_surface
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0048
preserved_exact_tokens:
  - "logsearch"
  - "logread"
  - "summary rows"
  - "drill-down"
  - "export"
  - "on-demand deref"
negative_constraints:
  - "without turning full payloads into default chat transcript content"
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
```

### ACD-070 - Per-Project Tantivy Indices

```yaml
plan_unit_id: ACD-070
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Chat, code, and log Tantivy indices are stored per project under
  storage/tantivy/projects/{project_id}/chat, /code, and /logs for project-only
  search, performance, retention, cleanup, and future cross-project top-K merge.
gui_related: false
gui_classification_reason: Per-project index storage and retention are storage architecture behavior.
depends_on: [ACD-063, ACD-067]
unblocks: []
acceptance_criteria:
  - Chat, code, and log indices are partitioned by project_id.
  - Per-project storage supports cleanup and retention per project.
  - The design does not block future cross-project top-K merge as an enhancement.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: project_scope_integrity
reasoning_tier: standard
context_scope: search_storage
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: per_project_tantivy_indices
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0049
preserved_exact_tokens:
  - "storage/tantivy/projects/{project_id}/chat"
  - "storage/tantivy/projects/{project_id}/code"
  - "storage/tantivy/projects/{project_id}/logs"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-071 - Threads And Chat Management Scope

```yaml
plan_unit_id: ACD-071
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Section 11 groups thread and chat management requirements for message taxonomy, lifecycle, identity, debug investigation state, shared navigation, branching, and session browser behavior.
gui_related: false
gui_classification_reason: This is a scope/anchor unit for thread-management semantics, not GUI implementation by itself.
depends_on: []
unblocks: [ACD-072, ACD-073, ACD-074, ACD-075, ACD-076, ACD-077, ACD-078, ACD-084, ACD-086, ACD-088]
acceptance_criteria:
  - Thread-management spans remain covered without turning the empty section heading into a separate behavior.
  - Subsequent thread-management PlanUnits carry the concrete requirements.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: section_scope
reasoning_tier: standard
context_scope: threads
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: thread_management_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0050
preserved_exact_tokens:
  - "Threads and chat management"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-072 - Message Type Taxonomy

```yaml
plan_unit_id: ACD-072
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Canonical chat records use the closed message_type taxonomy with required senders, properties, and rendering categories for user, assistant, system, tool_result, operation_card, blocked_notice, subagent_card, and error records.
gui_related: false
gui_classification_reason: Message record taxonomy and persisted properties are data-contract behavior, not visual implementation.
depends_on: [ACD-071]
unblocks: [ACD-073]
acceptance_criteria:
  - Persisted chat records use the canonical message_type values.
  - Each taxonomy value retains the specified sender, properties, and rendering role.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: transcript_schema
reasoning_tier: standard
context_scope: messages
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: message_type_taxonomy
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0051
preserved_exact_tokens:
  - "message_type"
  - "user"
  - "assistant"
  - "system"
  - "tool_result"
  - "operation_card"
  - "blocked_notice"
  - "subagent_card"
  - "error"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-073 - Message Rendering Persistence Boundary

```yaml
plan_unit_id: ACD-073
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Visible message rendering vocabulary is closed to the taxonomy, independent
  of thread lifecycle state and runtime posture, and persisted transcripts
  retain canonical message_type so restore, export, and search do not infer type
  from presentation alone.
gui_related: true
gui_classification_reason: Rendering vocabulary is visible UI, while persisted message_type protects restore/export/search behavior.
depends_on: [ACD-072]
unblocks: []
acceptance_criteria:
  - Rendering vocabulary is not extended outside the closed taxonomy without a later SSOT contract.
  - Message taxonomy remains independent of lifecycle state and runtime posture.
  - Restore, export, and search use persisted message_type rather than presentation inference.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: transcript_restore
reasoning_tier: standard
context_scope: messages
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: message_rendering_persistence_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0051
preserved_exact_tokens:
  - "visible rendering vocabulary"
  - "canonical `message_type`"
  - "restore, export, and search"
negative_constraints:
  - "persisted transcript records MUST retain their canonical `message_type` so restore, export, and search do not infer type from presentation alone"
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-074 - Thread Lifecycle State Machine

```yaml
plan_unit_id: ACD-074
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Thread lifecycle state is separate from operational status markers and follows creating -> active -> suspended -> archived -> deleted with explicit, auditable transitions.
gui_related: false
gui_classification_reason: Thread lifecycle state and transitions are storage/runtime behavior, not GUI implementation.
depends_on: [ACD-071]
unblocks: [ACD-075]
acceptance_criteria:
  - Lifecycle state stays separate from attention_required, blocked, completed, or failed operational status markers.
  - Lifecycle transitions follow the canonical path and allowed transitions.
  - Lifecycle transitions are explicit and auditable.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: lifecycle_state
reasoning_tier: standard
context_scope: threads
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: thread_lifecycle_state_machine
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0052
preserved_exact_tokens:
  - "creating -> active -> suspended -> archived -> deleted"
  - "attention_required"
  - "blocked"
  - "completed"
  - "failed"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-075 - Thread Lifecycle Persistence

```yaml
plan_unit_id: ACD-075
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Thread lifecycle persistence keeps or prunes transcript, queue state,
  metadata, restorable UI state, caches, and tombstones by lifecycle state while
  preserving lineage and treating deletion as terminal for ordinary navigation.
gui_related: false
gui_classification_reason: Lifecycle persistence and retention behavior are storage/runtime requirements.
depends_on: [ACD-074]
unblocks: []
acceptance_criteria:
  - Active threads keep full transcript, queue state, metadata, runtime references, and restorable UI state.
  - Suspended and archived states prune only the allowed transient state.
  - Deletion removes the thread from normal user-visible chat surfaces while retaining only required integrity, sync, or compliance metadata.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: retention_integrity
reasoning_tier: standard
context_scope: threads
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: thread_lifecycle_persistence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0052
preserved_exact_tokens:
  - "creating"
  - "active"
  - "suspended"
  - "archived"
  - "deleted"
negative_constraints:
  - "archiving does not rewrite message ids, thread lineage, or worktree lineage"
  - "deletion is terminal for ordinary user navigation"
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-076 - Thread Identity Fields

```yaml
plan_unit_id: ACD-076
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Thread identity is stable across reopen, restore, archive, and branch-aware history, minted on the first user message, and carries canonical thread, session lineage, persona, overlay, and title metadata.
gui_related: false
gui_classification_reason: Thread identity and metadata are storage/runtime schema behavior.
depends_on: [ACD-071]
unblocks: [ACD-077]
acceptance_criteria:
  - thread_id uses thr_{ulid} and is minted on the first user message.
  - Empty unsent drafts do not receive durable thread_id values.
  - persona_id remains registry/storage lineage only and not a thread runtime Persona identity field.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: thread_identity
reasoning_tier: standard
context_scope: threads
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: thread_identity_fields
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0053
preserved_exact_tokens:
  - "thr_{ulid}"
  - "dev_session_id"
  - "terminal_session_id"
  - "mode_overlay"
  - "persona_id"
negative_constraints:
  - "the system MUST NOT mint a durable `thread_id` for an unsent empty draft"
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-077 - Terminal Thread Compatibility Boundary

```yaml
plan_unit_id: ACD-077
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Terminal-associated threads are ordinary chat threads with terminal lineage. terminal-thread is a compatibility/search label for terminal or non-writable boundaries, not a durable object type.
gui_related: false
gui_classification_reason: Terminal lineage and compatibility labels are identity/modeling behavior, not GUI implementation.
depends_on: [ACD-076]
unblocks: []
acceptance_criteria:
  - Terminal lineage remains attached for audit after terminal exit.
  - Live terminal/output/ports surfaces remain owned by terminal or dev-session identity.
  - terminal-thread does not become a separate durable object type.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: identity_model_drift
reasoning_tier: standard
context_scope: threads
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: terminal_thread_compatibility_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0053
preserved_exact_tokens:
  - "terminal or non-writable"
  - "terminal-thread"
  - "/surfaces"
negative_constraints:
  - "Terminal-associated threads are ordinary chat threads with terminal lineage, not a second terminal-thread identity model."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-078 - Debug Investigation Lifecycle

```yaml
plan_unit_id: ACD-078
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Threads may contain multiple historical investigations, but only one non-terminal investigation may be active for prompt injection and mutation-capable automation at a time.
gui_related: false
gui_classification_reason: Investigation lifecycle and prompt/mutation eligibility are workflow/runtime behavior.
depends_on: [ACD-071]
unblocks: [ACD-079, ACD-080, ACD-081, ACD-082, ACD-083]
acceptance_criteria:
  - A thread can retain multiple historical investigations.
  - Only one active, blocked, attention_required, verifying, or failed_cleanup investigation is eligible for prompt injection and mutation-capable automation at a time.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_lifecycle
reasoning_tier: high
context_scope: debug_investigation
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: debug_investigation_lifecycle
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0054
preserved_exact_tokens:
  - "active"
  - "blocked"
  - "attention_required"
  - "verifying"
  - "failed_cleanup"
  - "resolved"
  - "cancelled"
  - "superseded"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
```

### ACD-079 - Debug Reopen And Supersede

```yaml
plan_unit_id: ACD-079
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Switching debug targets in a thread with a non-terminal investigation defaults to continuing the current investigation; materially different targets require explicit supersede, and terminal investigations reopen as historical views unless new lineage is created.
gui_related: false
gui_classification_reason: Investigation supersession and reopen lineage are workflow/runtime behavior.
depends_on: [ACD-078]
unblocks: [ACD-080, ACD-081]
acceptance_criteria:
  - A materially different debug target requires an explicit supersede action.
  - resolved, cancelled, and superseded investigations reopen as historical views by default.
  - New live work from a terminal investigation creates a new investigation lineage linked by supersedes_investigation_id.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_reopen
reasoning_tier: high
context_scope: debug_investigation
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: debug_reopen_supersede
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0054
preserved_exact_tokens:
  - "supersedes_investigation_id"
negative_constraints:
  - "resolved, cancelled, and superseded investigations reopen as historical views by default; they do not silently restart automation, instrumentation, or browser/dev sessions."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-080 - Debug Restore Context Surface

```yaml
plan_unit_id: ACD-080
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Thread restore rehydrates the visible Investigation Context header, linked artifacts, requested and effective debug posture, revalidation reason, frozen target bindings, and allowed recovery actions without silent target rebinding.
gui_related: true
gui_classification_reason: The Investigation Context header and allowed recovery actions are visible debug UI behavior.
depends_on: [ACD-078, ACD-079]
unblocks: [ACD-081]
acceptance_criteria:
  - Restore rehydrates the Investigation Context header and linked artifacts.
  - Attention-required investigations restore with attention_required_reason_code and allowed recovery actions.
  - Resume-time restore does not silently rebind to a different target.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_restore
reasoning_tier: high
context_scope: debug_investigation
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: debug_restore_context_surface
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0054
preserved_exact_tokens:
  - "Investigation Context"
  - "attention_required_reason_code"
  - "no-silent-rebind"
negative_constraints:
  - "attention_required investigations do not auto-resume execution"
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
```

### ACD-081 - Debug Revalidation Cleanup Boundary

```yaml
plan_unit_id: ACD-081
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Revalidation and cleanup safety prevent silent resume or rebinding, and failed_cleanup investigations block a new mutation-capable debug loop against the same target until residue is resolved, rolled back, or explicitly promoted.
gui_related: false
gui_classification_reason: Revalidation, cleanup, and mutation eligibility are runtime safety behavior.
depends_on: [ACD-078, ACD-080]
unblocks: []
acceptance_criteria:
  - Revalidation prevents silent resume after target, auth, worktree, HEAD, instrumentation, safe-point, or remediation-lineage drift.
  - failed_cleanup reopens directly into cleanup-recovery state.
  - New mutation-capable debugging against the same target waits until residue is handled.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_safety
reasoning_tier: high
context_scope: debug_investigation
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: debug_revalidation_cleanup_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0054
preserved_exact_tokens:
  - "target replacement"
  - "auth/account switch"
  - "worktree or branch drift"
  - "HEAD drift"
  - "expired instrumentation"
  - "stale safe-point"
  - "failed_cleanup"
negative_constraints:
  - "PM must not start a new mutation-capable debug loop against the same target until residue is resolved, rolled back, or explicitly promoted into the durable fix lane."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
```

### ACD-082 - Debug Stop Reason Mapping

```yaml
plan_unit_id: ACD-082
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Debug investigation terminal and non-terminal states map deterministically to stop_reason_code, attention_required_reason_code, and blocked_reason_code values.
gui_related: false
gui_classification_reason: Stop reason codes and deterministic state mapping are runtime/event semantics, not GUI implementation.
depends_on: [ACD-078]
unblocks: []
acceptance_criteria:
  - resolved, attention_required, blocked, failed, failed_cleanup, cancelled, and superseded states map to the specified stop reason families.
  - attention_required and blocked carry the related reason-code fields.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_status_mapping
reasoning_tier: standard
context_scope: debug_investigation
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: debug_stop_reason_mapping
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0054
preserved_exact_tokens:
  - "stop_reason_code"
  - "attention_required_reason_code"
  - "blocked_reason_code"
  - "investigation.resolved_verified"
  - "investigation.analysis_only_completed"
  - "investigation.verification_failed"
  - "investigation.no_repro_observed"
  - "investigation.budget_exhausted"
  - "investigation.runtime_unavailable"
  - "investigation.target_unreachable"
  - "investigation.adapter_unavailable"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-083 - Debug Budget And Attention Taxonomy

```yaml
plan_unit_id: ACD-083
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Debug automation budgets and attention defaults are fixed initial ceilings with a machine-readable Debug-specific attention taxonomy for auth, manual repro, manual verification, app start, reconnect, credentials, degraded evidence, sensitive capture, adapter, target, workspace, and bundle import cases.
gui_related: false
gui_classification_reason: Debug budgets and attention taxonomies are runtime/policy behavior.
depends_on: [ACD-078]
unblocks: []
acceptance_criteria:
  - Initial browser/evidence and cleanup/resume ceilings are enforced as machine-readable values.
  - Debug attention taxonomy reason codes remain machine-readable.
  - Budget, blocked, and attention stops continue to use stop_reason_code values.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_budget
reasoning_tier: standard
context_scope: debug_investigation
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Permissions_System.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: debug_budget_attention_taxonomy
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0054
preserved_exact_tokens:
  - "max_browser_scenario_branches = 3"
  - "max_consecutive_no_new_evidence_loops = 2"
  - "max_active_temporary_instrumentation_lanes = 1"
  - "max_cleanup_retries = 2"
  - "max_attention_required_resume_cycles = 3"
  - "auth_handoff_required"
  - "manual_repro_required"
  - "manual_verification_required"
  - "external_app_start_required"
  - "session_reconnect_required"
  - "missing_credentials_or_secret"
  - "degraded_evidence_review_required"
  - "sensitive_capture_review_required"
  - "adapter_switch_recommended"
  - "target_selection_required"
  - "workspace_binding_required"
  - "import_bundle_required"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
```

### ACD-084 - Shared Navigation Contract

```yaml
plan_unit_id: ACD-084
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant Chat consumes shared navigation and runtime identity contracts
  through route_target, OpenSubject, and OpenFile. resume_url is serialized
  transport only and must not outgrow the canonical route contract.
gui_related: false
gui_classification_reason: Navigation contract consumption and serialized transport boundaries are routing behavior, not GUI implementation.
depends_on: [ACD-071]
unblocks: [ACD-085, ACD-090]
acceptance_criteria:
  - Routed opens resolve through route_target.
  - Source opens resolve through OpenSubject or OpenFile.
  - Assistant Chat does not define chat-local replacements for shared navigation contracts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_contract_drift
reasoning_tier: standard
context_scope: navigation
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - Plans/FileManager.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: shared_navigation_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0055
preserved_exact_tokens:
  - "route_target"
  - "OpenSubject"
  - "OpenFile"
  - "resume_url"
negative_constraints:
  - "resume_url is serialized transport only and must not outgrow the canonical route contract"
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-085 - Runtime Identity Display Snapshot

```yaml
plan_unit_id: ACD-085
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Chat may display requested/effective runtime identity and projection state, but it must not define assistant-local replacements for owner-doc fields; historical views use frozen requested/effective runtime snapshots captured for execution.
gui_related: true
gui_classification_reason: Runtime identity and projection-state display are user-visible chat UI behavior.
depends_on: [ACD-084]
unblocks: []
acceptance_criteria:
  - Chat displays requested/effective runtime identity only as a consumer of owner-doc fields.
  - Historical views use frozen requested/effective runtime snapshots from execution.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_identity_drift
reasoning_tier: standard
context_scope: navigation
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
  - Plans/Multi-Account.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: runtime_identity_display_snapshot
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0055
preserved_exact_tokens:
  - "requested/effective runtime identity"
  - "frozen requested/effective runtime snapshots"
negative_constraints:
  - "chat must not define assistant-local replacements for the owner-doc field set"
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
```

### ACD-086 - Branch Conversation Lineage

```yaml
plan_unit_id: ACD-086
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Restore-and-branch creates a new thread_id and branch_id linked to the source restore point and source thread, and branch lineage remains queryable for restore, history, and usage attribution.
gui_related: false
gui_classification_reason: Branch identity and lineage are storage/history behavior, not GUI implementation.
depends_on: [ACD-071]
unblocks: [ACD-087]
acceptance_criteria:
  - Restore-and-branch creates new thread and branch identities.
  - Branch lineage is linked to the source restore point and source thread.
  - Branch lineage remains queryable for restore/history and usage attribution.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: branch_lineage
reasoning_tier: standard
context_scope: branching
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: branch_conversation_lineage
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0056
preserved_exact_tokens:
  - "restore-and-branch"
  - "thread_id"
  - "branch_id"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-087 - Branch Conversation UI Confirmation

```yaml
plan_unit_id: ACD-087
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Branch labels are visible in history and thread navigation, and branching from a running or dirty thread requires confirmation that names the preserved source state and new branch target.
gui_related: true
gui_classification_reason: Branch labels and confirmation prompts are user-visible UI behavior.
depends_on: [ACD-086]
unblocks: []
acceptance_criteria:
  - Branch labels appear in history and thread navigation.
  - Branching from running or dirty threads requires explicit confirmation naming source state and branch target.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: branch_user_confirmation
reasoning_tier: standard
context_scope: branching
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: branch_conversation_ui_confirmation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0056
preserved_exact_tokens:
  - "branch labels"
  - "running or dirty thread"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-088 - Session Browser Thread Focus

```yaml
plan_unit_id: ACD-088
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Project or session browsing may open or focus a thread, but active-thread navigation remains local to the chat shell, and blocked, queued, and background states remain visible through badges and attention surfaces when the thread is inactive.
gui_related: true
gui_classification_reason: Thread focus, badges, and attention surfaces are visible UI behavior.
depends_on: [ACD-071]
unblocks: []
acceptance_criteria:
  - Project/session browsing can open or focus a thread.
  - Active-thread navigation remains local to the chat shell.
  - Blocked, queued, and background states remain visible when the thread is not active.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: attention_visibility
reasoning_tier: standard
context_scope: session_browser
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: session_browser_thread_focus
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0057
preserved_exact_tokens:
  - "project/session browsing"
  - "blocked, queued, and background states"
  - "badges and attention surfaces"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-089 - Context Usage Display Ownership

```yaml
plan_unit_id: ACD-089
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Normal thread context-usage behavior is owned by Assistant Chat plus usage-feature, and Assistant, Interview, BrainStorm, and Crew views route cross-doc open/focus actions to the canonical thread usage surface.
gui_related: true
gui_classification_reason: Context usage display and open/focus routing are user-visible UI behavior.
depends_on: [ACD-071]
unblocks: [ACD-090]
acceptance_criteria:
  - Assistant Chat and usage-feature remain the primary feature owners for context/usage display.
  - Assistant, Interview, BrainStorm, and Crew views route context/usage open/focus actions to the canonical thread usage surface.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: usage_owner_boundary
reasoning_tier: standard
context_scope: context_usage
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: context_usage_display_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0058
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0059
preserved_exact_tokens:
  - "context-usage"
  - "Assistant, Interview, BrainStorm, and Crew"
  - "canonical thread usage surface"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/usage-feature.md
```

### ACD-090 - Context Usage Route Stale Disposition

```yaml
plan_unit_id: ACD-090
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Context and usage open behavior resolves through canonical route/open to the editor-tab Context Detail Pane; side-panel, artifact-local, or chat-local usage route wording is stale and non-buildable until reconciled against Assistant Chat and usage-feature owners.
gui_related: true
gui_classification_reason: Context Detail Pane routing and stale route cleanup affect user-visible navigation.
depends_on: [ACD-084, ACD-089]
unblocks: []
acceptance_criteria:
  - Context/usage open behavior resolves through canonical route/open to the editor-tab Context Detail Pane.
  - Side-panel, artifact-local, and chat-local usage route wording remains stale/non-buildable until reconciled.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: stale_usage_route
reasoning_tier: standard
context_scope: context_usage
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/usage-feature.md
  - Plans/UI_Command_Catalog.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: context_usage_route_stale_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0059
preserved_exact_tokens:
  - "/open"
  - "editor-tab Context Detail Pane"
  - "side-panel"
  - "artifact-local"
  - "chat-local"
  - "non-buildable"
negative_constraints:
  - "Stale wording that sends this seam to a side-panel, artifact-local, or chat-local usage route is non-buildable until reconciled against those owners."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/usage-feature.md
```

### ACD-091 - Context Usage Thread Signals

```yaml
plan_unit_id: ACD-091
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant and Interview threads expose a visible context-usage summary for
  the context actually consumed, including current usage versus the effective
  model window, last compaction/truncation reason, provider-authoritative
  versus estimated token/cost status, and whether hidden/background usage
  contributed.
gui_related: true
gui_classification_reason: Context usage signals are visible in thread UI.
depends_on: [ACD-089, ACD-090]
unblocks: [ACD-092, ACD-093, ACD-094]
acceptance_criteria:
  - Thread context usage is computed against the effective model window.
  - Compaction and truncation reasons are visible when present.
  - Provider-authoritative and estimated token/cost status remain distinguishable.
  - Hidden/background usage contribution remains visible.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: usage_disclosure
reasoning_tier: standard
context_scope: context_usage
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: context_usage_thread_signals
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0060
preserved_exact_tokens:
  - "effective model window"
  - "provider-authoritative"
  - "estimated"
  - "hidden/background usage"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/usage-feature.md
```

### ACD-092 - Context Detail Pane Information Architecture

```yaml
plan_unit_id: ACD-092
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The Context Detail Pane is an editor-tab pane with top-level `Curated` and
  `Raw` views; `Curated` contains `Overview`, `Breakdown`, and `Messages`, and
  `Raw` exposes message payloads, related `tool-part` payloads, provider
  metadata blobs, and path/runtime debug data through an accordion.
gui_related: true
gui_classification_reason: Context Detail Pane tabs and accordions are visible editor-pane UI.
depends_on: [ACD-091]
unblocks: [ACD-093, ACD-100]
acceptance_criteria:
  - Context Detail Pane opens as an editor-tab pane.
  - Top-level Curated and Raw views are available.
  - Curated includes Overview, Breakdown, and Messages.
  - Raw exposes payloads, tool-part data, provider metadata, and runtime/path debug data.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: pane_ia
reasoning_tier: standard
context_scope: context_usage
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: context_detail_pane_ia
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0060
preserved_exact_tokens:
  - "Curated"
  - "Raw"
  - "Overview"
  - "Breakdown"
  - "Messages"
  - "/model/mode/persona"
  - "/context/cost"
  - "tool-part"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-093 - Context Breakdown Source Taxonomy

```yaml
plan_unit_id: ACD-093
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Context Detail Pane breakdowns include system/instruction blocks,
  user/assistant messages, compiled attachments and forwarded document
  selections, tool/activity-derived context, canonical `usage.event` and
  `run.completed.usage` snapshots, and debug-only Investigation Context items
  for active debug threads.
gui_related: true
gui_classification_reason: Breakdown rows and source groups are visible in the Context Detail Pane.
depends_on: [ACD-092]
unblocks: [ACD-094, ACD-095]
acceptance_criteria:
  - Context breakdowns include all canonical user, assistant, system, attachment, tool, usage, and debug source families.
  - Investigation Context items appear only for active debug threads.
  - Canonical usage snapshots remain separate from ordinary chat-local message estimates.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: breakdown_source_taxonomy
reasoning_tier: standard
context_scope: context_usage
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/usage-feature.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: context_breakdown_source_taxonomy
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0060
preserved_exact_tokens:
  - "usage.event"
  - "run.completed.usage"
  - "Investigation Context"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
```

### ACD-094 - Context Usage Runtime Source Boundary

```yaml
plan_unit_id: ACD-094
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The thread surface derives usage from canonical runtime records and must not
  invent a second chat-local cost model; hidden/background helper usage remains
  source-class inspectable, and truncation, redaction, and
  context-serialization state remain visible so omitted context is never
  presented as serialized.
gui_related: true
gui_classification_reason: Runtime usage source and omitted-context state affect user-visible usage/cost display.
depends_on: [ACD-091, ACD-093]
unblocks: []
acceptance_criteria:
  - Usage derives from canonical runtime records.
  - Hidden/background helper usage remains inspectable by source class.
  - Truncation, redaction, and serialization state remain visible.
  - Omitted context is never presented as serialized.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: cost_model_drift
reasoning_tier: high
context_scope: context_usage
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/usage-feature.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: context_usage_runtime_source_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0060
preserved_exact_tokens:
  - "MUST NOT invent a second chat-local cost model"
  - "UI MUST NOT silently present omitted context as if it were still serialized"
negative_constraints:
  - "MUST NOT invent a second chat-local cost model"
  - "UI MUST NOT silently present omitted context as if it were still serialized"
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/usage-feature.md
```

### ACD-095 - Investigation Context Debug Surface Scope

```yaml
plan_unit_id: ACD-095
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Debug threads expose visible Investigation Context alongside normal
  context-usage affordances as a live bounded bundle of evidence, target
  metadata, instrumentation state, verification outcomes, and revalidation
  state.
gui_related: true
gui_classification_reason: Investigation Context is a visible debug-thread surface.
depends_on: [ACD-078, ACD-091]
unblocks: [ACD-096, ACD-097, ACD-098, ACD-099, ACD-100]
acceptance_criteria:
  - Debug threads expose Investigation Context as visible context.
  - Evidence, target metadata, instrumentation, verification, and revalidation state remain bounded.
  - Normal context usage affordances remain available alongside Investigation Context.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_context_scope
reasoning_tier: standard
context_scope: investigation_context
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: investigation_context_debug_surface_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0061
preserved_exact_tokens:
  - "Investigation Context"
  - "evidence"
  - "target metadata"
  - "instrumentation state"
  - "verification outcomes"
  - "revalidation state"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
```

### ACD-096 - Investigation Context Header Field Boundary

```yaml
plan_unit_id: ACD-096
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant Chat consumes canonical Investigation Context header fields from
  Contracts_V0 without durable chat-local renaming; presentation labels may
  layer on top, but aliases such as `primary_target` and
  `final_or_intermediate_state` are retired.
gui_related: false
gui_classification_reason: Header field names and retired aliases are durable contract boundaries.
depends_on: [ACD-095]
unblocks: [ACD-097]
acceptance_criteria:
  - Assistant Chat consumes canonical Investigation Context header fields.
  - Presentation labels do not become durable chat-local field names.
  - Retired aliases remain retired.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: field_name_drift
reasoning_tier: high
context_scope: investigation_context
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: investigation_context_header_field_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0061
preserved_exact_tokens:
  - "investigation_id"
  - "target"
  - "requested_target?"
  - "effective_target?"
  - "display_label?"
  - "primary_target_summary"
  - "debug_target_kind"
  - "adapter_id?"
  - "investigation_phase"
  - "state"
  - "verification_state?"
  - "attention_reason_code?"
  - "blocked_reason_code?"
  - "revalidation_reason_code?"
  - "active_instrumentation_count"
  - "last_updated_at_utc"
  - "primary_target"
  - "final_or_intermediate_state"
negative_constraints:
  - "Assistant Chat must not durably rename canonical Investigation Context header fields."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-097 - Investigation Context Item State Serialization Boundary

```yaml
plan_unit_id: ACD-097
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Investigation Context item states are `active`, `redacted`, `revoked`,
  `blocked`, `expired`, and `omitted`; only `active` and `redacted` items may
  serialize into prompt context, while the others remain audit-visible and must
  not serialize as successful context.
gui_related: false
gui_classification_reason: Serialization eligibility is prompt/runtime behavior; visible rendering is covered separately.
depends_on: [ACD-096]
unblocks: [ACD-098, ACD-100]
acceptance_criteria:
  - Item state values remain machine-readable and canonical.
  - Only active and redacted items serialize into prompt context.
  - Revoked, blocked, expired, and omitted items remain audit-visible without successful-context serialization.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: prompt_leak
reasoning_tier: high
context_scope: investigation_context
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: investigation_context_item_state_serialization
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0061
preserved_exact_tokens:
  - "active"
  - "redacted"
  - "revoked"
  - "blocked"
  - "expired"
  - "omitted"
negative_constraints:
  - "Only active/redacted items may serialize into prompt context."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
```

### ACD-098 - Debug Auto-Ingestion Visibility Boundary

```yaml
plan_unit_id: ACD-098
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Investigation Context is separate from ordinary browser/document composer
  chips; ordinary browser `/capture` remains explicit, and debug
  auto-ingestion or agent-fed evidence may enter only an active investigation
  as visible Investigation Context items, not hidden messages.
gui_related: true
gui_classification_reason: Auto-ingested debug evidence must remain visible in the user-facing Investigation Context surface.
depends_on: [ACD-095, ACD-097]
unblocks: []
acceptance_criteria:
  - Investigation Context remains separate from ordinary composer chips.
  - Ordinary browser /capture remains explicit.
  - Debug auto-ingestion and agent-fed evidence enter only active investigations as visible items.
  - Hidden message injection is prohibited.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: hidden_context_injection
reasoning_tier: high
context_scope: investigation_context
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: debug_auto_ingestion_visibility_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0061
preserved_exact_tokens:
  - "/capture"
  - "debug auto-ingestion"
  - "agent-fed evidence"
  - "not hidden messages"
negative_constraints:
  - "Debug auto-ingestion and agent-fed evidence must not enter as hidden messages."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
```

### ACD-099 - Investigation Context Artifact Ownership Boundary

```yaml
plan_unit_id: ACD-099
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Runtime Artifacts owns raw logs, traces, screenshots, recordings, full
  transcripts, raw manifests, artifact bytes, and export/import schema;
  Investigation Context carries bounded summaries and stable refs, and
  revocation does not imply deletion of the underlying artifact record.
gui_related: false
gui_classification_reason: Artifact ownership and retention are storage/runtime boundaries.
depends_on: [ACD-095]
unblocks: [ACD-100]
acceptance_criteria:
  - Runtime Artifacts owns raw artifact payloads and export/import schema.
  - Investigation Context carries only bounded summaries and stable refs.
  - Revocation does not delete the underlying artifact record.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: artifact_ownership_drift
reasoning_tier: high
context_scope: investigation_context
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: investigation_context_artifact_ownership_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0061
preserved_exact_tokens:
  - "Runtime Artifacts"
  - "bounded summaries"
  - "stable refs"
  - "revocation does not imply deletion"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
```

### ACD-100 - Investigation Context Rendering Filtering Actions

```yaml
plan_unit_id: ACD-100
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Investigation Context may render as card, `/chip/panel`, or compact
  equivalent with explicit attach, `/removal/revocation`, `/revoke`,
  provenance, timestamp, redaction/truncation state, filtering, and actions
  `Open target`, `Open artifacts`, `Export bundle`, `Revalidate target`,
  `Revoke item`, and `Show raw in Context Detail Pane`.
gui_related: true
gui_classification_reason: Rendering, filtering, and actions are visible Investigation Context UI.
depends_on: [ACD-092, ACD-095, ACD-097, ACD-099]
unblocks: []
acceptance_criteria:
  - Investigation Context renders as a card, /chip/panel, or compact equivalent.
  - Attach, removal/revocation, provenance, timestamps, redaction/truncation, and filtering are visible.
  - Open, export, revalidate, revoke, and raw-detail actions are available where supported.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: investigation_surface
reasoning_tier: standard
context_scope: investigation_context
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: investigation_context_rendering_filtering_actions
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0061
preserved_exact_tokens:
  - "/chip/panel"
  - "/removal/revocation"
  - "/revoke"
  - "Open target"
  - "Open artifacts"
  - "Export bundle"
  - "Revalidate target"
  - "Revoke item"
  - "Show raw in Context Detail Pane"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-101 - Activity Transparency Operation Card Owner Scope

```yaml
plan_unit_id: ACD-101
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Activity transparency uses a shared `inline operation card` family rather
  than isolated widgets; Assistant Chat is the primary owner for
  operation-card behavior, while FinalGUISpec, Permissions_System, and
  UI_Command_Catalog consume the relevant surfaces.
gui_related: true
gui_classification_reason: Operation cards are shared user-visible activity UI.
depends_on: []
unblocks: [ACD-102, ACD-103, ACD-104, ACD-105, ACD-106, ACD-107, ACD-108]
acceptance_criteria:
  - Activity transparency uses a shared inline operation-card family.
  - Assistant Chat remains the primary operation-card owner.
  - Consumer docs do not define isolated or incompatible activity widgets.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary
reasoning_tier: high
context_scope: activity_transparency
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Permissions_System.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: activity_transparency_operation_card_owner_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0062
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0063
preserved_exact_tokens:
  - "inline operation card"
  - "FinalGUISpec"
  - "Permissions_System"
  - "UI_Command_Catalog"
negative_constraints:
  - "PM must not describe this as a separate activity strip, external terminal pop-out, or non-unified card behavior."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-102 - Operation Card Bounded Preview Anatomy

```yaml
plan_unit_id: ACD-102
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Inline operation cards use bounded inline previews, persistent per-command
  cards, narrative-order placement, shared anatomy, 5-line collapsed and
  15-line expanded previews, read-only/non-interactive content, one card per
  command `/instance`, and refs/blobs for large payloads.
gui_related: true
gui_classification_reason: Operation-card previews, placement, and expansion are visible UI.
depends_on: [ACD-101]
unblocks: [ACD-103, ACD-104, ACD-108, ACD-126]
acceptance_criteria:
  - Operation cards use bounded inline previews.
  - Collapsed and expanded preview line budgets remain 5 and 15.
  - Operation-card content is read-only and non-interactive.
  - Large payloads remain behind refs/blobs.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: card_anatomy
reasoning_tier: standard
context_scope: activity_transparency
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: operation_card_bounded_preview_anatomy
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0063
preserved_exact_tokens:
  - "5-line collapsed"
  - "15-line expanded"
  - "/instance"
  - "refs/blobs"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-103 - Operation Card Family Subtypes And Actions

```yaml
plan_unit_id: ACD-103
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Operation cards preserve the terminal/command, web/search, and diff/edit
  subtype distinction, including `Open in Terminal`, source/result/browser
  detail open, editor diff open, file-touched `+N -M` summaries, and no silent
  inheritance of generic fenced-code behavior.
gui_related: true
gui_classification_reason: Operation-card subtype actions and summaries are visible UI.
depends_on: [ACD-102]
unblocks: [ACD-120, ACD-130]
acceptance_criteria:
  - Terminal/command, web/search, and diff/edit cards keep distinct action sets.
  - File-touched summaries use +N -M aggregate form.
  - Operation cards do not silently inherit generic fenced-code behavior.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: subtype_drift
reasoning_tier: standard
context_scope: activity_transparency
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: operation_card_family_subtypes_actions
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0063
preserved_exact_tokens:
  - "Open in Terminal"
  - "+N -M"
  - "terminal/command"
  - "web/search"
  - "diff/edit"
negative_constraints:
  - "Operation cards must not silently inherit generic fenced-code behavior."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### ACD-104 - Operation Card State Machine And Blocked Recovery

```yaml
plan_unit_id: ACD-104
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Lifecycle-bearing operation cards use card-level states including `pending`,
  `running`, `completed`, `failed`, `cancelled`, `blocked`, `starting`, and
  `exited`, with visible badges, `running -> blocked -> running | cancelled`,
  machine-actionable `allowed_action_ids[]`, blocked reason/projection/adapter
  fields, and compatibility for the legacy compact badge shorthand as only a
  base path.
gui_related: true
gui_classification_reason: Operation-card state badges and recovery actions are visible UI.
depends_on: [ACD-101]
unblocks: [ACD-107]
acceptance_criteria:
  - Operation-card lifecycle states remain explicit and card-level.
  - Blocked cards expose machine-actionable recovery data.
  - Legacy compact badge shorthand remains only a compatibility base path.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: state_machine
reasoning_tier: high
context_scope: activity_transparency
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: operation_card_state_machine_blocked_recovery
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0063
preserved_exact_tokens:
  - "pending"
  - "running"
  - "completed"
  - "failed"
  - "cancelled"
  - "blocked"
  - "starting"
  - "exited"
  - "allowed_action_ids[]"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Permissions_System.md
```

### ACD-105 - Operation Card Widget Exclusions

```yaml
plan_unit_id: ACD-105
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Operation cards are restricted to lifecycle-bearing operations and explicitly
  exclude question cards, permission-request approval cards, sticky
  plan-tracker panels, reasoning-transparency blocks, delegated-task/subagent
  disclosure blocks, and simple read/grep/glob inline text unless a later owner
  contract specializes them.
gui_related: true
gui_classification_reason: Excluded card families are user-visible widget boundaries.
depends_on: [ACD-101]
unblocks: []
acceptance_criteria:
  - Non-operation widgets are not treated as operation cards.
  - Simple read/grep/glob inline text is not upgraded without a later owner contract.
  - Question, approval, plan, reasoning, and subagent disclosure blocks remain separate families.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: widget_family_boundary
reasoning_tier: high
context_scope: activity_transparency
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: operation_card_widget_exclusions
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0063
preserved_exact_tokens:
  - "question cards"
  - "permission-request approval cards"
  - "sticky plan-tracker panels"
  - "reasoning-transparency blocks"
  - "delegated-task/subagent disclosure blocks"
  - "read/grep/glob"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-106 - Batch Task Subagent Operation Semantics

```yaml
plan_unit_id: ACD-106
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Batch, task, and subagent operation semantics preserve `continue_on_error:
  false`, stop-on-first-failure behavior, completed-results-plus-failure-detail
  return, task/subagent lifecycle including `timed_out`, `task.failed`, 120s
  and 300s child-operation defaults, parent-owned retries, and denied child
  access to `question` unless parent orchestration grants it.
gui_related: false
gui_classification_reason: Batch, task, and subagent semantics are orchestration behavior rather than GUI implementation.
depends_on: [ACD-104, ACD-105]
unblocks: []
acceptance_criteria:
  - Batch operations preserve stop-on-first-failure semantics when continue_on_error is false.
  - Completed results plus failure detail are returned.
  - Task/subagent lifecycles preserve timed_out and task.failed states.
  - Child operations keep 120s and 300s defaults and parent-owned retry behavior.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: orchestration_semantics
reasoning_tier: high
context_scope: activity_transparency
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: batch_task_subagent_operation_semantics
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0063
preserved_exact_tokens:
  - "continue_on_error: false"
  - "timed_out"
  - "task.failed"
  - "120s"
  - "300s"
  - "question"
negative_constraints:
  - "Child access to question remains denied unless parent orchestration grants it."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-107 - Operation Permission Status Carry-Through

```yaml
plan_unit_id: ACD-107
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Operation-card permission status preserves the four-tier approval ladder
  `deny`, `once`, `for session`, `always`, the `/session/always/deny` surface,
  HITL-gated question default `allow`, visible ask-gating for `websearch`,
  `webfetch`, `webextract`, `webresearch`, `webcrawl`, and `webmap`, strict
  `read_only` denial, and blocked/unavailable payload fields.
gui_related: true
gui_classification_reason: Permission status, ask-gating, and recovery actions are visible operation-card behavior.
depends_on: [ACD-104]
unblocks: []
acceptance_criteria:
  - The four-tier approval ladder remains visible and machine-readable.
  - HITL-gated question defaults remain allow.
  - Web operations use visible ask-gating.
  - read_only denial remains strict.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: permission_carrythrough
reasoning_tier: high
context_scope: activity_transparency
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: operation_permission_status_carrythrough
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0063
preserved_exact_tokens:
  - "deny"
  - "once"
  - "for session"
  - "always"
  - "/session/always/deny"
  - "allow"
  - "websearch"
  - "webfetch"
  - "webextract"
  - "webresearch"
  - "webcrawl"
  - "webmap"
  - "read_only"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Permissions_System.md
```

### ACD-108 - Terminal Handoff From Operation Cards

```yaml
plan_unit_id: ACD-108
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Interactive, long-running, stdin/TTY, watch/server, or user-promoted
  operations bind to a terminal session while chat retains bounded preview,
  audit card, and stable `Open in Terminal`; shell owns interactive state,
  chat owns preview+audit, and retries create a new terminal and mini-terminal
  card.
gui_related: true
gui_classification_reason: Terminal handoff, preview, audit card, and Open in Terminal are visible UI behavior.
depends_on: [ACD-102, ACD-104]
unblocks: [ACD-126, ACD-127]
acceptance_criteria:
  - Interactive, long-running, stdin/TTY, watch/server, and user-promoted operations bind to terminal sessions.
  - Chat keeps bounded preview and audit card after handoff.
  - Shell owns interactive state.
  - Retries create new terminal and mini-terminal card instances.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: terminal_handoff
reasoning_tier: high
context_scope: activity_transparency
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: terminal_handoff_from_operation_cards
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0063
preserved_exact_tokens:
  - "stdin/TTY"
  - "watch/server"
  - "Open in Terminal"
  - "preview+audit"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-109 - Web Activity Owner Contract Bridge

```yaml
plan_unit_id: ACD-109
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Web/provider activity consumes storage, contracts, browser, and permissions
  payload contracts through the `/tool/storage/runtime` bridge; owner contracts
  define payload shape while Assistant Chat owns visible provenance, setup
  guidance, runtime disclosure, and exact ContractRef alignment.
gui_related: true
gui_classification_reason: Web provenance, setup guidance, and runtime disclosure are visible Assistant Chat surfaces.
depends_on: [ACD-101, ACD-103]
unblocks: [ACD-110, ACD-111, ACD-112, ACD-113, ACD-114, ACD-115, ACD-116, ACD-117, ACD-118, ACD-119, ACD-120, ACD-121, ACD-122, ACD-123, ACD-124, ACD-125]
acceptance_criteria:
  - Web/provider activity consumes owner payload contracts rather than redefining them.
  - Assistant Chat owns visible web provenance and runtime disclosure.
  - ContractRef alignment remains exact.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_contract_bridge
reasoning_tier: high
context_scope: web_activity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: web_activity_owner_contract_bridge
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0064
preserved_exact_tokens:
  - "/tool/storage/runtime"
  - "ContractRef"
  - "Plans/storage-plan.md#4.4 Activity transparency payloads"
  - "Plans/Contracts_V0.md#3.4 Tool-specific payload extensions"
  - "Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
```

### ACD-110 - Web Provider Capability Matrix

```yaml
plan_unit_id: ACD-110
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The provider capability matrix keeps capability tier separate from routing
  posture: Firecrawl, Tavily, and Exa retain real `webfetch` capability and
  are not flattened to `fallback-only`; Anthropic/OpenAI `websearch` remains
  `native (model)` / model-native, not `pm-composed`.
gui_related: false
gui_classification_reason: Provider capability classification is a routing and contract boundary.
depends_on: [ACD-109]
unblocks: [ACD-111, ACD-112]
acceptance_criteria:
  - Capability tier remains separate from routing posture.
  - Firecrawl, Tavily, and Exa retain real webfetch capability.
  - Anthropic/OpenAI websearch remains model-native.
  - Provider capability is not flattened to fallback-only or pm-composed when canon says otherwise.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_capability_drift
reasoning_tier: high
context_scope: web_activity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
node_compile_hint:
  mode: web_provider_capability_matrix
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0064
preserved_exact_tokens:
  - "Firecrawl"
  - "Tavily"
  - "Exa"
  - "webfetch"
  - "fallback-only"
  - "native (model)"
  - "pm-composed"
negative_constraints:
  - "Anthropic/OpenAI websearch remains model-native, not pm-composed."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
```

### ACD-111 - Web Routing Setup And Priority Disclosure

```yaml
plan_unit_id: ACD-111
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Web routing includes a `capability-unavailable terminal branch` with clear
  setup guidance; the global provider stack is user-changeable in Settings,
  per-operation priority reordering is NOT MVP, and consumers show effective
  provider order and capability results.
gui_related: true
gui_classification_reason: Setup guidance, Settings provider order, and capability results are visible user-facing behavior.
depends_on: [ACD-110]
unblocks: []
acceptance_criteria:
  - Capability-unavailable terminal branches provide setup guidance.
  - Global provider stack is user-changeable in Settings.
  - Per-operation priority reordering remains outside MVP.
  - Consumers show effective provider order and capability results.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: routing_disclosure
reasoning_tier: standard
context_scope: web_activity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
  - Plans/Settings.md
node_compile_hint:
  mode: web_routing_setup_priority_disclosure
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0064
preserved_exact_tokens:
  - "capability-unavailable terminal branch"
  - "Settings"
  - "per-operation priority reordering is NOT MVP"
negative_constraints:
  - "Per-operation priority reordering is NOT MVP."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
```

### ACD-112 - Site Reader Native Identity Boundary

```yaml
plan_unit_id: ACD-112
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  `webfetch = native Site Reader path by DEFAULT`; Site Reader is PM-native and
  reserves `Reading Site: <url>`, while provider-routed fetch uses `Fetching
  Site: <url> (via <provider>)`; `Extracting Site` is a separate evidence path,
  and Site Reader v1 requires real browser-interaction capability.
gui_related: true
gui_classification_reason: Site Reader identity and activity labels are visible web activity behavior.
depends_on: [ACD-110]
unblocks: [ACD-113, ACD-120]
acceptance_criteria:
  - webfetch defaults to the native Site Reader path.
  - Reading Site is reserved for PM-native Site Reader.
  - Provider-routed fetch uses Fetching Site with provider disclosure.
  - Extracting Site remains a separate evidence path.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: native_identity_drift
reasoning_tier: high
context_scope: web_activity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: site_reader_native_identity_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0064
preserved_exact_tokens:
  - "webfetch = native Site Reader path by DEFAULT"
  - "Reading Site: <url>"
  - "Fetching Site: <url> (via <provider>)"
  - "Extracting Site"
  - "Site Reader v1"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
```

### ACD-113 - Search-Then-Read Answer Provenance

```yaml
plan_unit_id: ACD-113
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Web answer construction preserves search-then-read behavior: chat may
  shortlist with search, but final citations must come from the actual read
  path, and raw search snippets alone are not enough final evidence.
gui_related: false
gui_classification_reason: Citation source validity is answer/provenance behavior rather than GUI implementation.
depends_on: [ACD-112]
unblocks: []
acceptance_criteria:
  - Search may shortlist sources.
  - Final citations come from the actual read path.
  - Raw search snippets alone are not treated as final evidence.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: citation_provenance
reasoning_tier: high
context_scope: web_activity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
node_compile_hint:
  mode: search_then_read_answer_provenance
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0064
preserved_exact_tokens:
  - "search-then-read"
  - "final citations"
  - "actual read path"
  - "raw search snippets alone are not enough final evidence"
negative_constraints:
  - "Raw search snippets alone are not enough final evidence."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
```

### ACD-114 - Firecrawl Transport Route Disclosure

```yaml
plan_unit_id: ACD-114
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  PM must not silently switch between self-hosted Firecrawl and hosted/cloud
  Firecrawl; when Firecrawl transport changes, the activity card and audit
  payload disclose requested and effective Firecrawl route.
gui_related: true
gui_classification_reason: Firecrawl route disclosure appears in activity cards and audit-visible payloads.
depends_on: [ACD-109, ACD-110]
unblocks: []
acceptance_criteria:
  - Self-hosted and hosted/cloud Firecrawl routes are distinguishable.
  - Activity cards disclose requested and effective Firecrawl route when route changes.
  - Audit payloads preserve requested and effective route details.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: transport_disclosure
reasoning_tier: high
context_scope: web_activity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: firecrawl_transport_route_disclosure
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0064
preserved_exact_tokens:
  - "self-hosted Firecrawl"
  - "hosted/cloud Firecrawl"
  - "requested and effective Firecrawl route"
negative_constraints:
  - "PM must not silently switch between self-hosted Firecrawl and hosted/cloud Firecrawl."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
```

### ACD-115 - Provider Fallback And Cost-Aware Routing

```yaml
plan_unit_id: ACD-115
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Web routing remains cost-aware when multiple providers offer similar
  capability, preserves the `>100 credits` warning and `500 credits` cap, and
  falls back on rate-limit/outage to the next eligible provider supporting the
  same operation with `provider_fallback_summary` audit linkage.
gui_related: false
gui_classification_reason: Provider fallback and cost caps are routing/runtime behavior.
depends_on: [ACD-110, ACD-111]
unblocks: [ACD-120]
acceptance_criteria:
  - Similar web capabilities route with cost awareness.
  - Firecrawl credit warning and cap are preserved.
  - Rate-limit and outage fallback use the next eligible provider for the same operation.
  - provider_fallback_summary links fallback behavior to audit records.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: fallback_cost_routing
reasoning_tier: high
context_scope: web_activity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: provider_fallback_cost_aware_routing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0064
preserved_exact_tokens:
  - ">100 credits"
  - "500 credits"
  - "provider_fallback_summary"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
```

### ACD-116 - Firecrawl Research And Search Capability Mapping

```yaml
plan_unit_id: ACD-116
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Firecrawl `webresearch` preserves provider-native no-URL natural-language
  research, navigation/forms/pagination capability, and structured extraction;
  Firecrawl `websearch` preserves provider-specific search behavior,
  Serper-backed Google-result behavior, categories, sources, and optional
  result scraping.
gui_related: false
gui_classification_reason: Firecrawl capability mapping is provider/tool behavior.
depends_on: [ACD-110]
unblocks: [ACD-117]
acceptance_criteria:
  - Firecrawl webresearch keeps no-URL natural-language research semantics.
  - Navigation, forms, pagination, and structured extraction capability are preserved.
  - Firecrawl websearch keeps provider-specific search, categories, sources, and optional scraping behavior.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_capability_mapping
reasoning_tier: standard
context_scope: web_activity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
node_compile_hint:
  mode: firecrawl_research_search_mapping
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0064
preserved_exact_tokens:
  - "webresearch"
  - "websearch"
  - "no-URL natural-language research"
  - "Serper-backed Google-result behavior"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
```

### ACD-117 - Firecrawl Change Tracking Contract

```yaml
plan_unit_id: ACD-117
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The Firecrawl owner section must preserve `changeTracking` structured output
  or explicitly retire it; same-URL change tracking requires previous
  fetch/cache state and emits `change_status: "new" | "same" | "changed" |
  "removed"`, `pages[].change_status`, and `change_summary` rather than
  disappearing silently.
gui_related: false
gui_classification_reason: changeTracking output is a provider payload contract.
depends_on: [ACD-116]
unblocks: []
acceptance_criteria:
  - Firecrawl changeTracking is preserved or explicitly retired by owner contract.
  - Same-URL change tracking requires previous fetch/cache state.
  - change_status, pages[].change_status, and change_summary remain available when change tracking applies.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: change_tracking_loss
reasoning_tier: high
context_scope: web_activity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: firecrawl_change_tracking_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0064
preserved_exact_tokens:
  - "changeTracking"
  - 'change_status: "new" | "same" | "changed" | "removed"'
  - "pages[].change_status"
  - "change_summary"
negative_constraints:
  - "changeTracking must not disappear silently."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
```

### ACD-118 - Denied Web Operation And Error Taxonomy

```yaml
plan_unit_id: ACD-118
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Denied web-operation activity preserves `tool.denied.payload.meta` with
  `web_operation`, `web_input`, `denial_reason_code`, `denial_source`,
  `suggested_recovery_action`, requested adapter/projection fields,
  `allowed_action_ids[]`, and `headless_denied`; web error applicability stays
  aligned with canonical provider-to-PM error mapping.
gui_related: false
gui_classification_reason: Denied payload metadata and error taxonomy are contract/runtime behavior.
depends_on: [ACD-109, ACD-107]
unblocks: []
acceptance_criteria:
  - Denied web operations preserve canonical metadata fields.
  - Requested/effective adapter and projection fields remain available.
  - Web error applicability stays aligned with provider-to-PM error mapping.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: denied_payload_taxonomy
reasoning_tier: high
context_scope: web_activity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: denied_web_operation_error_taxonomy
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0064
preserved_exact_tokens:
  - "tool.denied.payload.meta"
  - "web_operation"
  - "web_input"
  - "denial_reason_code"
  - "denial_source"
  - "suggested_recovery_action"
  - "allowed_action_ids[]"
  - "headless_denied"
  - "adapter_unavailable"
  - "unsupported_operation"
  - "content_blocked"
  - "content_not_found"
  - "unsupported_source"
  - "extraction_schema_mismatch"
  - "autonomous_budget_exceeded"
  - "no_previous_version"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Permissions_System.md
```

### ACD-119 - Web Output Fields And Runtime Projection Payloads

```yaml
plan_unit_id: ACD-119
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  All web tools share output fields for provider identity, routing reason,
  timing, cache status, errors, warnings, adapter selection, and projection
  state, including `tool_use_id`, `adapter_id`, `adapter_selection_reason`,
  `duration_ms`, `timestamp`, `cached`, `error_code?`, `error_message?`,
  `warnings?`, `requested_adapter_id`, `effective_adapter_id`,
  `projection_freshness`, and `projection_health`.
gui_related: false
gui_classification_reason: Web output fields and projection payloads are contract/runtime data.
depends_on: [ACD-109]
unblocks: [ACD-120, ACD-121]
acceptance_criteria:
  - Web tool output fields remain common across web operations.
  - Adapter selection and requested/effective adapter fields are preserved.
  - Projection freshness and health fields are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: payload_field_loss
reasoning_tier: high
context_scope: web_activity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: web_output_runtime_projection_payloads
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0064
preserved_exact_tokens:
  - "tool_use_id"
  - "adapter_id"
  - "adapter_selection_reason"
  - "duration_ms"
  - "timestamp"
  - "cached"
  - "error_code?"
  - "error_message?"
  - "warnings?"
  - "requested_adapter_id"
  - "effective_adapter_id"
  - "projection_freshness"
  - "projection_health"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-120 - Web Activity Card Labels Details Badges

```yaml
plan_unit_id: ACD-120
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Expanded web activity-card details show operation input,
  requested/effective runtime delta, support tier, fallback disclosure, source
  count/scope, and warning/error text; collapsed labels use exact operation
  labels, and provenance badges are locked to concrete evidence families.
gui_related: true
gui_classification_reason: Web activity labels, detail fields, and badges are visible operation-card UI.
depends_on: [ACD-103, ACD-112, ACD-115, ACD-119]
unblocks: []
acceptance_criteria:
  - Expanded web cards expose operation input and requested/effective runtime deltas.
  - Support tier, fallback, source scope, and warnings/errors are visible.
  - Collapsed labels use exact operation labels.
  - Provenance badges remain locked to concrete evidence families.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: web_card_label_drift
reasoning_tier: high
context_scope: web_activity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: web_activity_card_labels_details_badges
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0064
preserved_exact_tokens:
  - "Searching Web"
  - "Fetching Site"
  - "Reading Site"
  - "Extracting Site"
  - "Researching Web"
  - "Crawling Site"
  - "Mapping Site"
  - "search snippet"
  - "site extract"
  - "site reader"
  - "research synthesis"
  - "crawl result"
  - "map result"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-121 - Web Inspector Deferred Dereference

```yaml
plan_unit_id: ACD-121
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  History rows and `/inspector` details combine requested/effective runtime
  fields with web child payloads and dereference `sources_ref`, `content_ref`,
  `map_ref`, and `answer_summary_ref` only on demand; source sets/blob refs
  carry URLs, titles, snippets, provenance badges, topology, bounded previews,
  and scrubbed storage keys.
gui_related: true
gui_classification_reason: History rows, inspector details, and deferred dereference are visible web inspection behavior.
depends_on: [ACD-119, ACD-120]
unblocks: []
acceptance_criteria:
  - Web inspector and history rows combine runtime fields with child payload references.
  - sources_ref, content_ref, map_ref, and answer_summary_ref are dereferenced on demand.
  - Source sets and blob refs expose bounded previews and scrubbed keys.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: eager_payload_exposure
reasoning_tier: high
context_scope: web_activity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: web_inspector_deferred_dereference
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0064
preserved_exact_tokens:
  - "/inspector"
  - "sources_ref"
  - "content_ref"
  - "map_ref"
  - "answer_summary_ref"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-122 - Batch Webfetch Execution Limits

```yaml
plan_unit_id: ACD-122
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Batch webfetch preserves exact batch inputs and limits: `urls: string[]`
  required min 1 max 50, `concurrency?: number` default 3 max 10,
  `continue_on_error?: boolean` default true, and `individual_timeout x
  min(url_count, 5)` capped at 600s.
gui_related: false
gui_classification_reason: Batch webfetch execution limits are tool/runtime behavior.
depends_on: [ACD-109]
unblocks: [ACD-123]
acceptance_criteria:
  - Batch webfetch accepts urls string array with min 1 max 50.
  - concurrency defaults to 3 and maxes at 10.
  - continue_on_error defaults to true.
  - Timeout formula and 600s cap are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: batch_execution_limits
reasoning_tier: standard
context_scope: web_activity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
node_compile_hint:
  mode: batch_webfetch_execution_limits
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0064
preserved_exact_tokens:
  - "urls: string[]"
  - "concurrency?: number"
  - "continue_on_error?: boolean"
  - "individual_timeout x min(url_count, 5)"
  - "600s"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
```

### ACD-123 - Batch Webfetch Domain Permission Prompt

```yaml
plan_unit_id: ACD-123
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Batch webfetch shared-host permission flow uses a single confirmation prompt
  showing all unique domains in the batch, and `For Session` grants all listed
  domains for that session.
gui_related: true
gui_classification_reason: Batch permission confirmation prompts are visible UI.
depends_on: [ACD-107, ACD-122]
unblocks: []
acceptance_criteria:
  - Batch webfetch shows one confirmation prompt for unique domains.
  - For Session grants all listed domains for that session.
  - Batch permission scope remains tied to displayed domains.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: batch_permission_scope
reasoning_tier: high
context_scope: web_activity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Permissions_System.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: batch_webfetch_domain_permission_prompt
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0064
preserved_exact_tokens:
  - "For Session"
  - "all unique domains"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Permissions_System.md
```

### ACD-124 - Stale Cited-Search Ownership Disposition

```yaml
plan_unit_id: ACD-124
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Stale cited-search ownership residue is retired from reference sections;
  provider-capability and web-routing canon is owned by `Plans/Tools.md`
  sections 11-12, while `Plans/newtools.md#8.2.1` is non-normative consumer
  guidance only.
gui_related: false
gui_classification_reason: Stale ownership disposition is document-governance and owner routing, not GUI behavior.
depends_on: [ACD-109]
unblocks: []
acceptance_criteria:
  - Stale cited-search ownership residue remains retired from reference sections.
  - Plans/Tools.md sections 11-12 own provider capability and web routing canon.
  - Plans/newtools.md#8.2.1 remains non-normative consumer guidance.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: stale_owner_residue
reasoning_tier: standard
context_scope: web_activity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
  - Plans/newtools.md
node_compile_hint:
  mode: stale_cited_search_ownership_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0064
preserved_exact_tokens:
  - "Plans/Tools.md"
  - "Plans/newtools.md#8.2.1"
  - "non-normative consumer guidance"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
```

### ACD-125 - Provider-Native Research And Upload Carry-Through

```yaml
plan_unit_id: ACD-125
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Provider-native web research preserves source-lineage fields such as
  `enableWebSearch`; Firecrawl consumer copy may surface Fire Engine limits,
  and file-upload/webfetch summaries preserve the `5 MB default` when that cap
  applies.
gui_related: true
gui_classification_reason: Provider-native research disclosure and upload/webfetch summaries are visible consumer copy.
depends_on: [ACD-109, ACD-116]
unblocks: []
acceptance_criteria:
  - Provider-native research preserves enableWebSearch source-lineage fields.
  - Firecrawl consumer copy may surface Fire Engine limits.
  - File-upload/webfetch summaries preserve the 5 MB default when applicable.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_native_lineage
reasoning_tier: standard
context_scope: web_activity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
node_compile_hint:
  mode: provider_native_research_upload_carrythrough
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0064
preserved_exact_tokens:
  - "enableWebSearch"
  - "Fire Engine"
  - "5 MB default"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
```

### ACD-126 - Bash Terminal Card Preview Anatomy

```yaml
plan_unit_id: ACD-126
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Bash/terminal command cards keep bounded inline previews, persistent
  per-command cards, narrative-order placement, 5-line collapsed and 15-line
  expanded previews, status/cwd/command summary/elapsed/exit/truncation
  metadata, read-only non-interactive content, one card per command
  `/instance`, refs/blobs for large payloads, and reloadable persisted
  metadata.
gui_related: true
gui_classification_reason: Bash/terminal card previews and metadata are visible operation-card UI.
depends_on: [ACD-102, ACD-108]
unblocks: [ACD-127, ACD-128, ACD-130]
acceptance_criteria:
  - Bash/terminal cards keep bounded inline previews and persistent per-command cards.
  - Preview budgets remain 5 collapsed and 15 expanded lines.
  - Status, cwd, command summary, elapsed, exit, and truncation metadata are visible.
  - Large output remains behind refs/blobs.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: terminal_card_anatomy
reasoning_tier: standard
context_scope: bash_terminal
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: bash_terminal_card_preview_anatomy
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0065
preserved_exact_tokens:
  - "5-line collapsed"
  - "15-line expanded"
  - "status/cwd/command summary/elapsed/exit/truncation metadata"
  - "/instance"
  - "refs/blobs"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-127 - Terminal Promotion Session Ownership

```yaml
plan_unit_id: ACD-127
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Commands requiring stdin/TTY start Terminal immediately,
  background/watch/server actions create terminal-owned sessions, one-shot
  commands remain chat-inline by default, non-interactive work may promote if
  long-running, and every promoted command card binds to stable
  `terminal_session_id` while chat stops owning the full transcript.
gui_related: true
gui_classification_reason: Terminal promotion and session identity are visible handoff behavior.
depends_on: [ACD-108, ACD-126]
unblocks: [ACD-128, ACD-129]
acceptance_criteria:
  - stdin/TTY commands start Terminal immediately.
  - Background/watch/server actions create terminal-owned sessions.
  - One-shot commands remain chat-inline by default.
  - Promoted command cards bind to a stable terminal_session_id.
  - Chat stops owning the full transcript after promotion.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: terminal_session_ownership
reasoning_tier: high
context_scope: bash_terminal
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: terminal_promotion_session_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0065
preserved_exact_tokens:
  - "stdin/TTY"
  - "background/watch/server"
  - "terminal_session_id"
  - "chat stops owning the full transcript"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-128 - Terminal Action Canon And Detach Alias

```yaml
plan_unit_id: ACD-128
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Terminal action canon preserves distinct `Open in Terminal`, `Show
  Terminal`, `Rerun in Terminal`, and `Detach/Pop-Out`; `Open in Terminal` and
  `Show Terminal` focus the same live session, `Rerun in Terminal` keeps
  command-table treatment, and legacy `Pop Out Terminal` is only a deprecated
  alias for `Detach/Pop-Out`.
gui_related: true
gui_classification_reason: Terminal action labels and aliases are visible command-card/menu behavior.
depends_on: [ACD-127]
unblocks: [ACD-129]
acceptance_criteria:
  - Open in Terminal, Show Terminal, Rerun in Terminal, and Detach/Pop-Out remain distinct.
  - Open in Terminal and Show Terminal focus the same live session.
  - Rerun in Terminal keeps command-table treatment.
  - Pop Out Terminal remains a deprecated alias only.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: terminal_action_alias
reasoning_tier: high
context_scope: bash_terminal
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: terminal_action_canon_detach_alias
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0065
preserved_exact_tokens:
  - "Open in Terminal"
  - "Show Terminal"
  - "Rerun in Terminal"
  - "Detach/Pop-Out"
  - "Pop Out Terminal"
negative_constraints:
  - "Pop Out Terminal is only a deprecated alias for Detach/Pop-Out."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### ACD-129 - Terminal Attach Recovery And Inline-Only Actions

```yaml
plan_unit_id: ACD-129
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Attach failure recovery differs for live process, ended process, and
  inline-only completed command; command-card `/edit/manage` menus expose
  terminal-focus, `View output`, `View output log`, `Retry attach`, and `Stop
  process` only when supported, and completed inline commands without a real
  `terminal_session_id` must not fabricate `Open in Terminal`.
gui_related: true
gui_classification_reason: Attach recovery and inline-only command-card actions are visible UI behavior.
depends_on: [ACD-127, ACD-128]
unblocks: []
acceptance_criteria:
  - Attach recovery branches differ for live, ended, and inline-only command cases.
  - Command-card edit/manage menus expose actions only when supported.
  - Completed inline commands without terminal_session_id do not fabricate Open in Terminal.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: terminal_action_fabrication
reasoning_tier: high
context_scope: bash_terminal
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: terminal_attach_recovery_inline_only_actions
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0065
preserved_exact_tokens:
  - "/edit/manage"
  - "View output"
  - "View output log"
  - "Retry attach"
  - "Stop process"
  - "terminal_session_id"
  - "Open in Terminal"
negative_constraints:
  - "Completed inline commands without a real terminal_session_id must not fabricate Open in Terminal."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### ACD-130 - Shared Collapsible Result Behavior

```yaml
plan_unit_id: ACD-130
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  `/collapsible` behavior is shared across command, search, and diff activity
  cards: collapsed cards retain material status, subject summary, failure line
  when present, and primary reveal action; expansion exposes bounded detail
  only, full payloads stay behind refs/blobs or owning surfaces, and
  search/diff do not stream progressively.
gui_related: true
gui_classification_reason: Collapsible card behavior is visible command/search/diff UI behavior.
depends_on: [ACD-103, ACD-126]
unblocks: []
acceptance_criteria:
  - Collapsed cards retain material status, subject summary, failure line, and primary reveal action.
  - Expanded cards expose bounded detail only.
  - Full payloads remain behind refs/blobs or owning surfaces.
  - Search and diff activity do not stream progressively.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: collapsible_payload_boundary
reasoning_tier: standard
context_scope: activity_transparency
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: shared_collapsible_result_behavior
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0065
preserved_exact_tokens:
  - "/collapsible"
  - "refs/blobs"
  - "search/diff do not stream progressively"
negative_constraints:
  - "Search/diff do not stream progressively."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-131 - Terminal Consumer Owner Boundary

```yaml
plan_unit_id: ACD-131
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Chat consumes the terminal model without owning the terminal engine/emulator,
  PTY/process host, or UI shell/chrome; chat cards expose bounded preview,
  audit, and reveal controls only.
gui_related: true
gui_classification_reason: Terminal preview, audit, and reveal controls are visible chat UI.
depends_on: [ACD-108, ACD-127]
unblocks: [ACD-132, ACD-133, ACD-134, ACD-135, ACD-137, ACD-143, ACD-145]
acceptance_criteria:
  - Chat consumes terminal state without owning terminal execution or shell chrome.
  - Chat cards expose only bounded preview, audit, and reveal controls.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: terminal_owner_boundary
reasoning_tier: high
context_scope: terminal_consumer
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: terminal_consumer_owner_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0066
preserved_exact_tokens:
  - "terminal engine/emulator"
  - "PTY/process host"
  - "UI shell/chrome"
  - "bounded preview"
  - "audit"
  - "reveal controls"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-132 - Terminal Product Fidelity

```yaml
plan_unit_id: ACD-132
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Terminal fidelity carries GPU fallback with context-loss disclosure, IME
  correctness, `/accessibility/Unicode-width` handling, `/log/CI-safe` and
  machine-readable output modes, diff-based redraw, `/command/exit markers`,
  recent-command navigation, `/detach/revive/reconnect` flows, and narrow
  `/extensibility` APIs rather than broad plugin surfaces.
gui_related: true
gui_classification_reason: Terminal fidelity affects visible terminal rendering, accessibility, and recovery surfaces.
depends_on: [ACD-131]
unblocks: []
acceptance_criteria:
  - Terminal rendering and accessibility fidelity preserves the listed product-critical cases.
  - Extensibility remains narrow and PM-owned rather than broad plugin surface.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: terminal_fidelity
reasoning_tier: high
context_scope: terminal_consumer
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: terminal_product_fidelity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0066
preserved_exact_tokens:
  - "GPU fallback with context-loss disclosure"
  - "IME correctness"
  - "/accessibility/Unicode-width"
  - "/log/CI-safe"
  - "/command/exit markers"
  - "/detach/revive/reconnect"
  - "/extensibility"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-133 - PTY Backed Continuity

```yaml
plan_unit_id: ACD-133
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Shell-first command continuity is `/PTY-backed` and preserves `/env/session`,
  working-directory, and terminal-session state; chat is not a pseudo-terminal
  or earlier-thread transcript owner, and continuity remains visible in audit
  rather than hidden in chat-only reconstruction.
gui_related: true
gui_classification_reason: PTY continuity and audit visibility affect user-visible command cards and terminal reveal.
depends_on: [ACD-131]
unblocks: [ACD-134, ACD-145]
acceptance_criteria:
  - Shell-first command continuity is backed by PTY/session state.
  - Chat does not own pseudo-terminal or full transcript continuity.
  - Audit surfaces expose continuity rather than reconstructing it chat-locally.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: pty_continuity
reasoning_tier: high
context_scope: terminal_consumer
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: pty_backed_continuity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0066
preserved_exact_tokens:
  - "/PTY-backed"
  - "/env/session"
  - "working-directory"
  - "terminal-session state"
negative_constraints:
  - "Chat is not a pseudo-terminal or earlier-thread transcript owner."
  - "Continuity must not be hidden in a chat-only reconstruction."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-134 - Shell First Surface Routing

```yaml
plan_unit_id: ACD-134
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Shell-like `/CLI-native`, stdin, PTY, `/TUI`, TTY, session-continuity, and
  live-takeover work routes to Terminal; non-interactive bounded
  `/progress/result` or `/results/structured` output routes to Output;
  diagnostics with `/line/code/location` route to Problems; discovered
  endpoints route to Ports.
gui_related: true
gui_classification_reason: Routing determines visible terminal, output, problems, ports, and chat preview surfaces.
depends_on: [ACD-131, ACD-133]
unblocks: [ACD-146]
acceptance_criteria:
  - Terminal owns shell-like interactive and session-continuity work.
  - Output owns bounded non-interactive structured process output.
  - Problems and Ports receive only their owning diagnostic or endpoint semantics.
  - Inline previews, command cards, and chat summaries remain audit/preview surfaces.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: surface_routing
reasoning_tier: high
context_scope: terminal_consumer
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/FileManager.md
node_compile_hint:
  mode: shell_first_surface_routing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0066
preserved_exact_tokens:
  - "/CLI-native"
  - "/TUI"
  - "TTY"
  - "/progress/result"
  - "/results/structured"
  - "/line/code/location"
negative_constraints:
  - "Inline previews, command cards, and chat summaries are never the canonical execution-surface for shell work."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-135 - Terminal Workspace Controller Split

```yaml
plan_unit_id: ACD-135
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Terminal workspace behavior preserves `/tabs/panes`,
  `/focus/send-input/interrupt/resize/state` APIs,
  `/status/search/selection` state, overlay state,
  persistence/diagnostics/labeling/docking settings, `/cwd/shell` disclosure,
  linked Problems/Ports surfaces, tab-scoped overrides, `/reuse/binding`, and
  session-reveal semantics while keeping Terminal, Output, Problems, Ports,
  and chat controller ownership distinct.
gui_related: true
gui_classification_reason: Terminal workspace controls, labels, linked surfaces, and reveal behavior are visible UI.
depends_on: [ACD-131]
unblocks: [ACD-136, ACD-138, ACD-139, ACD-140, ACD-141, ACD-142]
acceptance_criteria:
  - Terminal workspace state and controller APIs remain explicit.
  - Terminal, Output, Problems, Ports, and chat ownership stay distinct.
  - Chat owns only preview/reveal cards for terminal work.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: controller_split
reasoning_tier: high
context_scope: terminal_workspace
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: terminal_workspace_controller_split
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0066
preserved_exact_tokens:
  - "/tabs/panes"
  - "/focus/send-input/interrupt/resize/state"
  - "/status/search/selection"
  - "/cwd/shell"
  - "/reuse/binding"
  - "/controller"
negative_constraints:
  - "Chat does not guarantee full terminal transcript ownership after promotion."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-136 - Terminal Search Review Tool

```yaml
plan_unit_id: ACD-136
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Terminal search is a first-class review tool that targets whole-transcript
  history in the current `/pane` and `/session`, shows result count and
  current-hit position, supports next and `/previous`, keeps stable highlights
  while output streams, jumps between `/matching` command blocks when metadata
  exists, and restores live/review state predictably on exit.
gui_related: true
gui_classification_reason: Terminal search controls, hit navigation, and highlights are visible review UI.
depends_on: [ACD-135]
unblocks: []
acceptance_criteria:
  - Search scopes to current pane/session transcript history.
  - Streaming output does not destabilize highlights.
  - Search exit restores prior live/review state predictably.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: terminal_search
reasoning_tier: standard
context_scope: terminal_workspace
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: terminal_search_review_tool
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0066
preserved_exact_tokens:
  - "/pane"
  - "/session"
  - "/previous"
  - "/matching"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-137 - Command Block Confidence Rules

```yaml
plan_unit_id: ACD-137
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Rich or basic shell integration may show authoritative command blocks with
  start/end markers, cwd, exit metadata, sticky headers, failed-command
  navigation, `/confidence` metadata, and safe rerun; weak grouping must look
  approximate and running output extends the active block without re-keying the
  block identity.
gui_related: true
gui_classification_reason: Command blocks, sticky headers, rerun controls, and confidence disclosure are visible terminal UI.
depends_on: [ACD-131, ACD-126]
unblocks: [ACD-143, ACD-144]
acceptance_criteria:
  - Authoritative command blocks require rich/basic shell integration.
  - Weak grouping remains visually approximate.
  - Running output extends the active block without changing block identity.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_block_confidence
reasoning_tier: high
context_scope: terminal_workspace
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: command_block_confidence_rules
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0066
preserved_exact_tokens:
  - "rich"
  - "basic"
  - "weak grouping"
  - "/confidence"
  - "/copy-command"
negative_constraints:
  - "PM must not show fake exact command blocks, exact command-text, /copy-command, or rerun controls unless command-text capture is authoritative or sufficiently trustworthy."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-138 - Terminal Empty Restore Review States

```yaml
plan_unit_id: ACD-138
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Terminal empty, restore, and review states preserve no-structure-yet,
  hidden-structure, review-only, `/review-only`, history-only,
  pane-without-live-runtime, restored-without-history, `/disconnected`, and
  `/tab/pane/session` restore semantics as distinct user-visible states.
gui_related: true
gui_classification_reason: Empty, restore, and review states are visible terminal workspace states.
depends_on: [ACD-135]
unblocks: [ACD-145]
acceptance_criteria:
  - Hidden structure is not treated as first-run empty.
  - Restored-without-history is distinguished from no retained transcript/history.
  - Tab/pane/session structure restore remains separate from live runtime restore.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: terminal_restore_states
reasoning_tier: standard
context_scope: terminal_workspace
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: terminal_empty_restore_review_states
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0066
preserved_exact_tokens:
  - "no-structure-yet"
  - "hidden-structure"
  - "review-only"
  - "/review-only"
  - "history-only"
  - "pane-without-live-runtime"
  - "restored-without-history"
  - "/disconnected"
  - "/tab/pane/session"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-139 - Pane Status Badges Notifications

```yaml
plan_unit_id: ACD-139
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Pane status, badges, and notifications preserve terminal_session states,
  aggregate precedence, exact runtime-state in pane headers, compact quiet tab
  counts, dock/chrome attention, focus-clearing rules, and contextual TUI
  mouse-capture guidance rather than permanent warning banners.
gui_related: true
gui_classification_reason: Pane status, badges, notifications, and chrome attention are visible terminal UI.
depends_on: [ACD-135]
unblocks: []
acceptance_criteria:
  - terminal_session states and aggregate precedence are preserved.
  - Runtime state placement remains pane-header authoritative.
  - Focus clear rules preserve unseen output/completion and failure attention semantics.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: terminal_attention
reasoning_tier: high
context_scope: terminal_workspace
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: pane_status_badges_notifications
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0066
preserved_exact_tokens:
  - "terminal_session"
  - "failed_to_start"
  - "restore_action_needed"
  - "failed_command_since_focus"
  - "unseen_completion"
  - "unseen_output"
  - "TUI mouse-capture"
negative_constraints:
  - "TUI mouse-capture guidance is contextual, not a permanent warning banner."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-140 - Transcript Alternate Screen Reset Actions

```yaml
plan_unit_id: ACD-140
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Persisted transcript is review continuity, not emulator-state resurrection;
  `/TUI` and alternate-screen markers, clear scrollback, `/reset`,
  `/reinitialize`, clear/reset/replace/close action separation, partial export
  history, metadata-only command blocks, and per-project retention settings
  remain distinct.
gui_related: true
gui_classification_reason: Transcript, alternate-screen, reset, and history actions are visible terminal review controls.
depends_on: [ACD-135]
unblocks: []
acceptance_criteria:
  - Persisted transcript is not treated as emulator-state resurrection.
  - Clear, reset, replace, and close remain separate actions.
  - Metadata-only command blocks do not fabricate output text.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: transcript_reset
reasoning_tier: high
context_scope: terminal_workspace
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: transcript_altscreen_reset_actions
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0066
preserved_exact_tokens:
  - "/TUI"
  - "/reset"
  - "/reinitialize"
  - "Clear"
  - "reset"
  - "replace"
  - "close"
negative_constraints:
  - "Persisted transcript is review continuity, not emulator-state resurrection."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-141 - Terminal Labels Accessibility

```yaml
plan_unit_id: ACD-141
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Terminal labels and accessibility preserve pane headers, runtime status
  chips, context badges, subtitles, `/tooltips`, sticky headers, derived
  suggestions, `/metadata`, user labels, default Terminal/Terminal 2 labels,
  accessibility-name, descriptions, user-rename behavior, and reset-to-auto.
gui_related: true
gui_classification_reason: Terminal labels, badges, names, and accessibility descriptions are visible or assistive UI.
depends_on: [ACD-135]
unblocks: []
acceptance_criteria:
  - User labels always win over derived context.
  - Runtime status and context badges continue updating after rename.
  - Accessibility-name identifies the same object as the visible primary label.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: terminal_accessibility
reasoning_tier: standard
context_scope: terminal_workspace
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: terminal_labels_accessibility
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0066
preserved_exact_tokens:
  - "/tooltips"
  - "/metadata"
  - "Terminal 2"
  - "accessibility-name"
  - "reset-to-auto"
negative_constraints:
  - "Derived context must not overwrite a user-facing label after rename."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-142 - Terminal Diagnostics Recovery

```yaml
plan_unit_id: ACD-142
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Terminal diagnostics use structured events and typed failure reasons; the
  user-facing pane UI avoids noisy internals and offers retry, restart pane,
  rerun command, reveal logs, or switch renderer mode while support exports and
  diagnostics surfaces share structured source state.
gui_related: true
gui_classification_reason: Diagnostic banners, actions, and drill-down details are visible terminal UI.
depends_on: [ACD-135]
unblocks: []
acceptance_criteria:
  - Diagnostics use structured events and typed reasons.
  - User-facing recovery actions are available when applicable.
  - Support exports and diagnostics surfaces share structured source state.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: terminal_diagnostics
reasoning_tier: standard
context_scope: terminal_workspace
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: terminal_diagnostics_recovery
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0066
preserved_exact_tokens:
  - "failed_to_start_session"
  - "attach_failed"
  - "reconnect_failed"
  - "shell_integration_unavailable"
  - "shell_integration_degraded"
  - "transcript_persist_failed"
  - "renderer_fallback_activated"
  - "IME /input_pipeline_error"
  - "unsupported_platform_capability"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-143 - Command Card Transcript Adjacent Summary

```yaml
plan_unit_id: ACD-143
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Command cards are transcript-adjacent summaries rather than a second shell
  implementation; they surface summary, status, and a primary reveal action
  without pretending to own the full shell lifecycle, and shell-integration
  confidence governs whether cwd, duration, exit code, and command labels may
  appear.
gui_related: true
gui_classification_reason: Command cards and reveal actions are visible chat UI.
depends_on: [ACD-126, ACD-137]
unblocks: [ACD-144, ACD-146]
acceptance_criteria:
  - Command cards remain transcript-adjacent summaries.
  - Cards do not own full shell lifecycle.
  - Shell-integration confidence gates metadata display.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_card_boundary
reasoning_tier: high
context_scope: command_cards
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/storage-plan.md
  - Plans/Tools.md
node_compile_hint:
  mode: command_card_transcript_adjacent_summary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0067
preserved_exact_tokens:
  - "transcript-adjacent summaries"
  - "rich"
  - "basic"
  - "opaque"
  - "cwd"
  - "duration"
  - "exit code"
negative_constraints:
  - "Command cards are not a second shell implementation."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
```

### ACD-144 - Command Card Opaque Degradation

```yaml
plan_unit_id: ACD-144
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  When shell integration is `opaque`, the card degrades to lower-confidence
  activity disclosure and transcript continuity remains canonical even when
  command-card metadata is degraded.
gui_related: true
gui_classification_reason: Degraded command-card disclosure is visible in chat activity UI.
depends_on: [ACD-137, ACD-143]
unblocks: []
acceptance_criteria:
  - Opaque shell integration shows lower-confidence activity disclosure.
  - Transcript continuity remains canonical under degraded metadata.
  - Exact command text or boundaries are not fabricated.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: shell_integration_degradation
reasoning_tier: high
context_scope: command_cards
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: command_card_opaque_degradation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0067
preserved_exact_tokens:
  - "opaque"
  - "lower-confidence activity disclosure"
  - "transcript continuity remains canonical"
negative_constraints:
  - "MUST NOT fabricate exact command text or exact command boundaries"
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-145 - Terminal Reveal Focus Origin

```yaml
plan_unit_id: ACD-145
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  `Open in Terminal` and `Show Terminal` focus or reveal the existing
  pane/tab/session or historical shell receipt; explicit `New Terminal`,
  restart, and `/rerun/new` remain separate user-visible actions.
gui_related: true
gui_classification_reason: Terminal reveal, focus, recovery, restart, and new-terminal actions are visible UI.
depends_on: [ACD-128, ACD-138, ACD-143]
unblocks: []
acceptance_criteria:
  - Visible terminal sessions are focused rather than duplicated.
  - Hidden sessions reveal existing panes or tabs before creating anything new.
  - Historical state opens a historical shell receipt with recovery actions.
  - New Terminal, restart, and rerun/new remain explicit separate choices.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: terminal_reveal
reasoning_tier: high
context_scope: command_cards
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: terminal_reveal_focus_origin
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0068
preserved_exact_tokens:
  - "Open in Terminal"
  - "Show Terminal"
  - "/exited"
  - "/review-only"
  - "/rerun/new"
  - "New Terminal"
negative_constraints:
  - "Reveal-origin must not silently replace the true origin with a fresh shell unless the user chooses restart, /rerun/new, or explicit New Terminal."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### ACD-146 - Command Card Status Linked Surfaces

```yaml
plan_unit_id: ACD-146
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Command-card status badges may reflect `starting`, `running`, `exited`,
  `failed`, `terminated`, `disconnected`, `restoring`, and
  `attention_required`; compact previews stay compact, and Output, Problems,
  Debug Console, and Ports route through the owning terminal or dev-session
  identity rather than chat-local state.
gui_related: true
gui_classification_reason: Status badges, compact previews, and linked surface navigation are visible UI.
depends_on: [ACD-134, ACD-143]
unblocks: []
acceptance_criteria:
  - Command-card status badge vocabulary is preserved.
  - Large terminal transcripts do not expand chat previews.
  - Output, Problems, Debug Console, and Ports links preserve owner identity.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: linked_surface_routing
reasoning_tier: standard
context_scope: command_cards
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/FileManager.md
node_compile_hint:
  mode: command_card_status_linked_surfaces
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0069
preserved_exact_tokens:
  - "starting"
  - "running"
  - "exited"
  - "failed"
  - "terminated"
  - "disconnected"
  - "restoring"
  - "attention_required"
negative_constraints:
  - "Linked surfaces must not route through chat-local state."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-147 - Shared Runtime Identity Owner Boundary

```yaml
plan_unit_id: ACD-147
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant Chat may display requested/effective runtime identity, but it
  consumes the owner-doc shared runtime model and canonical shared fields
  rather than inventing assistant-local runtime fields.
gui_related: true
gui_classification_reason: Requested/effective runtime identity appears in compact chat and message runtime display.
depends_on: [ACD-094]
unblocks: [ACD-148, ACD-149, ACD-173]
acceptance_criteria:
  - Chat displays runtime identity as a consumer of owner-doc shared runtime fields.
  - Historical views use frozen requested/effective runtime state from execution.
  - Assistant-local replacement runtime fields are prohibited.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_identity_drift
reasoning_tier: high
context_scope: runtime_identity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - Plans/Prompt_Pipeline.md
  - Plans/Multi-Account.md
node_compile_hint:
  mode: shared_runtime_identity_owner_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0070
preserved_exact_tokens:
  - "requested/effective runtime identity"
  - "active_model"
  - "actual_model"
  - "assistant_runtime_state"
negative_constraints:
  - "assistant/chat MUST NOT introduce local replacement fields such as active_model, actual_model, or assistant_runtime_state"
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-148 - Message Runtime Popover Closed Fields

```yaml
plan_unit_id: ACD-148
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The message-level `info-popover` consumes the closed field list `Mode`,
  `Provider`, `Model`, `Effort`, `Persona`, `Worker`, `Tokens`, and `Context`;
  it is not a second schema and stays aligned with context-detail `Messages`
  row expansion and shared Contracts field labels.
gui_related: true
gui_classification_reason: Message runtime popover fields are visible message UI.
depends_on: [ACD-147]
unblocks: []
acceptance_criteria:
  - Message info-popover fields are limited to the closed field list.
  - Popover labels stay aligned with context-detail Messages rows and shared Contracts fields.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_popover_schema
reasoning_tier: standard
context_scope: runtime_identity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: message_runtime_popover_closed_fields
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0070
preserved_exact_tokens:
  - "info-popover"
  - "Mode"
  - "Provider"
  - "Model"
  - "Effort"
  - "Persona"
  - "Worker"
  - "Tokens"
  - "Context"
negative_constraints:
  - "The message-level info-popover is not a second schema."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-149 - Runtime Mode Display Mapping

```yaml
plan_unit_id: ACD-149
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Runtime display labels map to `Ask`, `Agent`, `Plan`, and `Deep Plan`;
  `Worker` is `Agent` or `Subagent`, token/context display rules are
  preserved, compact surfaces do not show version or `current`/`frozen`
  wording, and display mapping follows effective overlay and runtime posture.
gui_related: true
gui_classification_reason: Mode, worker, token, and context labels are visible message runtime UI.
depends_on: [ACD-147]
unblocks: []
acceptance_criteria:
  - Mode labels use normalized user-facing labels.
  - Worker labels distinguish Agent and Subagent.
  - Compact surfaces omit version and current/frozen wording.
  - Effective overlay and runtime posture drive Ask, Agent, Plan, and Deep Plan display.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: mode_label_mapping
reasoning_tier: standard
context_scope: runtime_identity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
  - Plans/Run_Modes.md
node_compile_hint:
  mode: runtime_mode_display_mapping
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0070
preserved_exact_tokens:
  - "Ask"
  - "Agent"
  - "Plan"
  - "Deep Plan"
  - "Worker"
  - "Subagent"
  - "current"
  - "frozen"
negative_constraints:
  - "Compact chat surfaces do not show version and do not show current or frozen wording."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
```

### ACD-150 - PM Child Run Subagent Identity

```yaml
plan_unit_id: ACD-150
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Subagents and crews use the PM child-run model with their own identity,
  lifecycle, requested/effective runtime state, inspectable history, and
  disposable-by-default spawn/run/complete/cancel/fail semantics.
gui_related: false
gui_classification_reason: Child-run identity and lifecycle are runtime/storage semantics.
depends_on: []
unblocks: [ACD-151, ACD-152, ACD-153, ACD-157, ACD-159, ACD-161, ACD-163, ACD-168]
acceptance_criteria:
  - Subagents and crews use child-run identity and lifecycle.
  - Child requested/effective runtime state remains inspectable.
  - Subagents are disposable by default and remain in history after terminal outcomes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: child_run_model
reasoning_tier: high
context_scope: subagents_crew
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: pm_child_run_subagent_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0071
preserved_exact_tokens:
  - "PM child-run model"
  - "requested/effective runtime state"
  - "disposable by default"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
```

### ACD-151 - Parent Thread Subagent Visibility

```yaml
plan_unit_id: ACD-151
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Active subagents remain visible in the parent thread with real-time status
  chips showing subagent name, status `running`, `waiting`, `done`, or
  `failed`, elapsed time, a thread-header active count badge, inline
  collapsible output, and named failure cards.
gui_related: true
gui_classification_reason: Subagent chips, badges, inline cards, and failure cards are visible thread UI.
depends_on: [ACD-150]
unblocks: [ACD-152, ACD-153]
acceptance_criteria:
  - Active subagents show visible status chips and elapsed time.
  - Parent thread header shows active subagent count.
  - Subagent output streams inline as collapsible cards.
  - Failure cards identify the failing subagent and failure summary.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: subagent_thread_visibility
reasoning_tier: standard
context_scope: subagents_crew
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Tools.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: parent_thread_subagent_visibility
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0072
preserved_exact_tokens:
  - "running"
  - "waiting"
  - "done"
  - "failed"
  - "active subagent count badge"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-152 - Subagent Visibility Projection Boundary

```yaml
plan_unit_id: ACD-152
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Subagent collapse/expand state is thread-local, collapsed summaries preserve
  latest status and headline result, and inline cards and header badges project
  canonical child-run state rather than a divergent subagent-only lifecycle.
gui_related: true
gui_classification_reason: Collapse state, summaries, inline cards, and header badges are visible thread UI.
depends_on: [ACD-150, ACD-151]
unblocks: []
acceptance_criteria:
  - Collapse/expand state persists thread-locally.
  - Collapsed summaries preserve latest status and headline result.
  - Provider TUI references remain comparative evidence only.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: subagent_projection_boundary
reasoning_tier: high
context_scope: subagents_crew
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: subagent_visibility_projection_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0072
preserved_exact_tokens:
  - "OpenCode `view subagents`"
  - "9a006d87004835d1867207def09c9aa4cf7394db"
negative_constraints:
  - "Chat MUST NOT invent a divergent subagent-only lifecycle model."
  - "Provider-specific parent TUI affordances are reference examples only."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-153 - Inline Child Card Required Presence

```yaml
plan_unit_id: ACD-153
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Every child run MUST appear inline in the parent thread as a visually distinct subagent card.
gui_related: true
gui_classification_reason: Inline child cards are visible parent-thread UI.
depends_on: [ACD-150, ACD-151]
unblocks: [ACD-154, ACD-155, ACD-156]
acceptance_criteria:
  - Every child run has an inline parent-thread card.
  - Child cards are visually distinct from ordinary chat messages.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: inline_child_cards
reasoning_tier: high
context_scope: subagents_crew
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: inline_child_card_required_presence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0073
preserved_exact_tokens:
  - "Every child run MUST appear inline"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-154 - Collapsed Child Card Metadata

```yaml
plan_unit_id: ACD-154
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Collapsed child cards show Persona, Task, Status, and Provider/model hover metadata.
gui_related: true
gui_classification_reason: Collapsed child card fields and hover metadata are visible UI.
depends_on: [ACD-153]
unblocks: []
acceptance_criteria:
  - Collapsed child cards show effective child Persona label.
  - Collapsed child cards show plain-language task and current status.
  - Provider/model metadata is available on hover.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: collapsed_child_card
reasoning_tier: standard
context_scope: subagents_crew
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: collapsed_child_card_metadata
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0073
preserved_exact_tokens:
  - "Persona"
  - "Task"
  - "Status"
  - "Provider/model"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-155 - Expanded Child Panel Stream Blocks

```yaml
plan_unit_id: ACD-155
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Expanded child panels show Work stream, Thought stream, State block, Context state, and Result block regions.
gui_related: true
gui_classification_reason: Expanded child panel regions are visible parent-thread UI.
depends_on: [ACD-153]
unblocks: [ACD-156]
acceptance_criteria:
  - Work and Thought streams remain distinct in expanded child panels.
  - State block exposes blocked, awaiting-parent, failure, or cancellation reasons when relevant.
  - Result block shows concise final outcome summary after completion.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: expanded_child_panel
reasoning_tier: standard
context_scope: subagents_crew
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: expanded_child_panel_stream_blocks
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0073
preserved_exact_tokens:
  - "Work stream"
  - "Thought stream"
  - "State block"
  - "Context state"
  - "Result block"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-156 - Expanded Child Context State Disclosure

```yaml
plan_unit_id: ACD-156
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Expanded child-panel context-state disclosure and hover metadata are MVP and
  show context-expansion/rehydration requests plus whether dynamic context
  shrinking affected what the child received.
gui_related: true
gui_classification_reason: Context-state disclosure and hover metadata are visible expanded child-panel UI.
depends_on: [ACD-155]
unblocks: []
acceptance_criteria:
  - Expanded child panels disclose context-expansion and rehydration requests.
  - Dynamic context shrinking effects are visible.
  - Hover metadata includes enough context-shaping state for user understanding.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: child_context_disclosure
reasoning_tier: high
context_scope: subagents_crew
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: expanded_child_context_state_disclosure
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0073
preserved_exact_tokens:
  - "context-expansion/rehydration"
  - "dynamic context shrinking"
  - "MVP"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
```

### ACD-157 - Child Status Projection Vocabulary

```yaml
plan_unit_id: ACD-157
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Chat thread and child-run runtime share the visible status vocabulary
  `queued`, `running`, `awaiting_parent`, `blocked`, `complete`, `failed`, and
  `cancelled`, and child status projection remains direct canonical lifecycle
  projection.
gui_related: false
gui_classification_reason: Child status vocabulary is lifecycle contract data; visible rendering is covered by child card units.
depends_on: [ACD-150]
unblocks: [ACD-158, ACD-161]
acceptance_criteria:
  - Child status vocabulary matches canonical child lifecycle state.
  - Chat does not create a separate child status enum.
  - Status meanings preserve queued, running, awaiting_parent, blocked, complete, failed, and cancelled semantics.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: child_status_projection
reasoning_tier: high
context_scope: child_status
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - Plans/Permissions_System.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: child_status_projection_vocabulary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0074
preserved_exact_tokens:
  - "queued"
  - "running"
  - "awaiting_parent"
  - "blocked"
  - "complete"
  - "failed"
  - "cancelled"
  - "child_status_projection"
negative_constraints:
  - "Child status projection into chat MUST remain a direct projection of canonical child lifecycle state and MUST NOT create a separate chat-only status enum."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-158 - Child Signal Mapping Terminal Reasons

```yaml
plan_unit_id: ACD-158
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  `clarification_needed`, `user_input_requested`, and
  `context_expansion_requested` render as `awaiting_parent`; policy, tool,
  provider, and runtime denials render as `blocked`; replacement and
  supersession remain terminal reason metadata even when visible terminal
  status is `cancelled`.
gui_related: false
gui_classification_reason: Child signal mapping is lifecycle/status projection behavior.
depends_on: [ACD-157]
unblocks: [ACD-162]
acceptance_criteria:
  - Clarification and context-expansion signals map to awaiting_parent.
  - Policy/tool/provider/runtime denials map to blocked.
  - Replacement and supersession remain terminal reason metadata.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: child_signal_mapping
reasoning_tier: high
context_scope: child_status
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: child_signal_mapping_terminal_reasons
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0074
preserved_exact_tokens:
  - "clarification_needed"
  - "user_input_requested"
  - "context_expansion_requested"
  - "awaiting_parent"
  - "blocked"
  - "cancelled"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-159 - Parallel Child Fanout Ordering

```yaml
plan_unit_id: ACD-159
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Parallel child spawning and grouping are first-class behavior; the thread
  must not assume only one or two children exist, canonical child order remains
  launch order, status changes do not reorder the list, and
  `continue_on_error` false preserves strict-stop semantics.
gui_related: false
gui_classification_reason: Fan-out cardinality, ordering, and strict-stop behavior are child orchestration semantics.
depends_on: [ACD-150]
unblocks: [ACD-160]
acceptance_criteria:
  - Parent thread supports parallel fan-out beyond one or two children.
  - Child ordering remains launch order.
  - Strict-stop batches preserve completed results and not-run children accurately.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: fanout_cardinality
reasoning_tier: high
context_scope: subagents_crew
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: parallel_child_fanout_ordering
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0075
preserved_exact_tokens:
  - "Parallel child spawning"
  - "one or two children"
  - "launch order"
  - "continue_on_error"
negative_constraints:
  - "The thread must not assume only one or two children exist."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-160 - Batch Card Subgroup Inspection

```yaml
plan_unit_id: ACD-160
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Large fan-out renders as one top-level batch card with intermediate
  subgroups of 10 children, one subgroup expanded by default, visible blocked,
  awaiting-parent, and failed counts, failing subgroup/child links, and
  inspectable parent and child audit identity.
gui_related: true
gui_classification_reason: Batch cards, subgroups, counts, and child links are visible parent-thread UI.
depends_on: [ACD-159]
unblocks: []
acceptance_criteria:
  - Large fan-out uses a top-level batch card with subgroups of 10.
  - Only one subgroup is expanded by default unless the user opens more.
  - Attention counts and failing child links remain visible.
  - Parent and child audit identity remain inspectable.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: batch_subgroup_ui
reasoning_tier: standard
context_scope: subagents_crew
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: batch_card_subgroup_inspection
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0075
preserved_exact_tokens:
  - "subgroups of 10"
  - "blocked"
  - "awaiting-parent"
  - "failed"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-161 - Parent Mediated Child Clarification

```yaml
plan_unit_id: ACD-161
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Children do not question the user directly by default; a child escalates to
  the parent, and the parent decides whether to answer, send context, ask the
  user, reroute, reframe, replace, expand context, or cancel.
gui_related: false
gui_classification_reason: Parent-mediated clarification is orchestration and authority behavior.
depends_on: [ACD-150, ACD-157]
unblocks: [ACD-162]
acceptance_criteria:
  - Children escalate clarification needs to the parent.
  - Parent owns user-facing question routing.
  - Missing-capability signals preserve parent choices for reframing, reroute, replacement, context expansion, question, or cancellation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: parent_mediated_clarification
reasoning_tier: high
context_scope: subagents_crew
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Permissions_System.md
  - Plans/Prompt_Pipeline.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: parent_mediated_child_clarification
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0076
preserved_exact_tokens:
  - "/runtime/tool"
  - "/reframing"
  - "awaiting_parent"
  - "blocked"
negative_constraints:
  - "Children do not question the user directly by default."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
```

### ACD-162 - Child Awaiting Blocked User Input Display

```yaml
plan_unit_id: ACD-162
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  When user input is required, the child card shows `awaiting_parent` with the
  reason, the parent emits the actual user-facing question in the main thread,
  and the user answers the parent thread rather than a hidden child channel.
gui_related: true
gui_classification_reason: Child awaiting-parent cards and parent-thread questions are visible UI.
depends_on: [ACD-158, ACD-161]
unblocks: []
acceptance_criteria:
  - Child card shows awaiting_parent and reason when parent action can continue the child.
  - The parent emits the actual user-facing question.
  - User answers occur in the parent thread.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: child_escalation_display
reasoning_tier: standard
context_scope: subagents_crew
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: child_awaiting_blocked_user_input_display
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0076
preserved_exact_tokens:
  - "awaiting_parent"
  - "the user answers the parent thread"
negative_constraints:
  - "The user answers the parent thread, not a hidden child channel."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-163 - Crew Mode Child Run Overlay

```yaml
plan_unit_id: ACD-163
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Crew mode is a multi-model coordination overlay over the child-run system and
  does not replace child cards, child history, or parent-owned synthesis.
gui_related: false
gui_classification_reason: Crew overlay semantics are runtime/orchestration behavior.
depends_on: [ACD-150]
unblocks: [ACD-164, ACD-165, ACD-167, ACD-168]
acceptance_criteria:
  - Crew mode uses child-run infrastructure.
  - Child cards and child history remain present under Crew mode.
  - Parent owns final synthesis.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: crew_overlay_boundary
reasoning_tier: high
context_scope: crew_mode
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
  - Plans/Models_System.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: crew_mode_child_run_overlay
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0077
preserved_exact_tokens:
  - "multi-model coordination overlay"
  - "child-run system"
negative_constraints:
  - "Crew mode does not replace child cards, child history, or parent-owned synthesis."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
```

### ACD-164 - Attributable Crew Board

```yaml
plan_unit_id: ACD-164
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Default crew behavior uses same task framing, often same Persona, model and
  provider diversity, an explicit attributable crew board, and parent-owned
  final synthesis; crew boards are inspectable on demand, not hidden memory or
  capability grants.
gui_related: true
gui_classification_reason: Crew boards and inspectable attribution are visible coordination UI.
depends_on: [ACD-163]
unblocks: []
acceptance_criteria:
  - Crew members share task framing unless configured otherwise.
  - Diversity comes primarily from model/provider choice.
  - Crew board attribution is inspectable on demand.
  - Crew boards do not become hidden memory or capability grants.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: crew_board
reasoning_tier: standard
context_scope: crew_mode
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: attributable_crew_board
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0077
preserved_exact_tokens:
  - "Persona"
  - "explicit attributable crew board"
  - "not hidden memory"
  - "do not grant capabilities"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Models_System.md
```

### ACD-165 - Plan Crew Child Run Alignment

```yaml
plan_unit_id: ACD-165
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Plan-mode and crew-mode rules align with the PM child-run contract.
gui_related: false
gui_classification_reason: Plan/Crew alignment is runtime contract behavior.
depends_on: [ACD-163]
unblocks: [ACD-166, ACD-167]
acceptance_criteria:
  - Plan-mode delegated work follows child-run contracts.
  - Crew-mode delegated work follows child-run contracts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: plan_crew_alignment
reasoning_tier: standard
context_scope: crew_mode
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: plan_crew_child_run_alignment
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0078
preserved_exact_tokens:
  - "Plan Mode + Crew Mode"
  - "PM child-run contract"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
```

### ACD-166 - Ask Plan Readonly Children

```yaml
plan_unit_id: ACD-166
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  `ask` and `plan` may launch delegated child runs only for read-only research
  or analysis; parent mode is a hard ceiling, children may narrow but not widen
  parent authority, and unresolved required planning children keep the plan
  provisional rather than falsely complete.
gui_related: false
gui_classification_reason: Parent/child authority ceilings are run-mode and permission semantics.
depends_on: [ACD-165]
unblocks: [ACD-167]
acceptance_criteria:
  - Ask and Plan delegated children remain read-only research or analysis.
  - Children cannot widen parent mode authority.
  - Unresolved required planning children keep plans provisional.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: plan_mode_delegation
reasoning_tier: high
context_scope: run_modes
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
  - Plans/Permissions_System.md
  - Plans/Tools.md
node_compile_hint:
  mode: ask_plan_readonly_children
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0079
preserved_exact_tokens:
  - "ask"
  - "plan"
  - "read-only research or analysis"
  - "parent mode is a hard ceiling"
negative_constraints:
  - "No code-writing, file mutation, or execution child may be launched from ask or plan."
  - "A child may narrow but must not widen parent authority."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
```

### ACD-167 - Crew Mode Parent Ceiling Inheritance

```yaml
plan_unit_id: ACD-167
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Crew is an overlay, not a new runtime-mode enum; a crew launched from `plan`
  remains read-only, and a crew launched from `regular` or `yolo` inherits
  those parent ceilings and guardrails.
gui_related: false
gui_classification_reason: Crew parent ceiling inheritance is run-mode authority behavior.
depends_on: [ACD-163, ACD-166]
unblocks: [ACD-168]
acceptance_criteria:
  - Crew mode does not define a separate runtime-mode enum.
  - Plan-launched crews remain read-only.
  - Regular/yolo-launched crews inherit parent ceilings and guardrails.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: crew_parent_ceiling
reasoning_tier: high
context_scope: crew_mode
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
  - Plans/Models_System.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: crew_mode_parent_ceiling_inheritance
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0080
preserved_exact_tokens:
  - "plan"
  - "regular"
  - "yolo"
negative_constraints:
  - "Crew is an overlay, not a new runtime-mode enum."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
```

### ACD-168 - Crew Selection Provider Resolution

```yaml
plan_unit_id: ACD-168
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  When crew mode is first invoked for a relevant scope, PM asks whether to use
  a valid default crew, otherwise asks which models to use, confirms
  provider/runtime mapping where ambiguity or restriction-sensitive mapping
  exists, and normalizes any Copilot member to a crew-level Copilot provider
  constraint.
gui_related: true
gui_classification_reason: Crew selection prompts and provider confirmation are visible user flows.
depends_on: [ACD-163]
unblocks: []
acceptance_criteria:
  - Valid default crew prompts are offered first.
  - Model selection occurs when no valid default crew exists.
  - Ambiguous or restriction-sensitive provider/runtime mapping is confirmed.
  - Copilot crew members normalize the crew to a Copilot provider constraint.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: crew_selection
reasoning_tier: standard
context_scope: crew_mode
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Models_System.md
  - Plans/FinalGUISpec.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: crew_selection_provider_resolution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0081
preserved_exact_tokens:
  - "default crew"
  - "Copilot"
  - "crew-level provider constraint"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Models_System.md
```

### ACD-169 - Interview Shared Question System Bridge

```yaml
plan_unit_id: ACD-169
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Interview mode uses the same shared question system that powers assistant clarification flows and builder clarification flows.
gui_related: true
gui_classification_reason: Interview mode question flows are visible chat UI.
depends_on: []
unblocks: [ACD-170, ACD-171, ACD-172]
acceptance_criteria:
  - Interview mode uses the shared question system.
  - Assistant clarification and builder clarification flows share the same baseline question behavior.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: interview_question_bridge
reasoning_tier: standard
context_scope: interview_chat
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: interview_shared_question_system_bridge
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0082
preserved_exact_tokens:
  - "Interview"
  - "shared question system"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-170 - Shared Question Card Baseline Fields

```yaml
plan_unit_id: ACD-170
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Question flows show question text, suggested options as buttons/chips when
  provided, a mandatory `Something else` or freeform path when freeform is
  allowed, and current draft answer state.
gui_related: true
gui_classification_reason: Question text, buttons/chips, freeform path, and draft state are visible question UI.
depends_on: [ACD-169]
unblocks: [ACD-171, ACD-172]
acceptance_criteria:
  - Question flows show question text and suggested options.
  - Something else/freeform path is mandatory when freeform is allowed.
  - Current draft answer state remains visible.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: question_card_baseline
reasoning_tier: standard
context_scope: interview_chat
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
  - Plans/FinalGUISpec.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: shared_question_card_baseline_fields
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0083
preserved_exact_tokens:
  - "Something else"
  - "freeform"
  - "current draft answer state"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-171 - Questionnaire Order Optional Dismissed State

```yaml
plan_unit_id: ACD-171
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Interview question UI is the reusable baseline for Assistant, Interviewer,
  and requirements/document-builder question cards; questions are required
  unless explicitly optional, multiple-question questionnaires may be answered
  or revised in any order, and dismissal pauses the branch with explicit
  dismissed state rather than fabricated submission.
gui_related: true
gui_classification_reason: Questionnaire order, revision, and dismissed state are visible question-flow UI.
depends_on: [ACD-170]
unblocks: [ACD-172]
acceptance_criteria:
  - Question UI baseline is shared across Assistant, Interviewer, and builder flows.
  - Multiple questions can be answered and revised in any order.
  - Dismissal pauses the branch with explicit dismissed state.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: questionnaire_state
reasoning_tier: high
context_scope: interview_chat
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: questionnaire_order_optional_dismissed_state
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0083
preserved_exact_tokens:
  - "Assistant"
  - "Interviewer"
  - "requirements/document-builder"
  - "dismissed state"
negative_constraints:
  - "Dismissing a questionnaire pauses that conversational branch and returns an explicit dismissed state; it does not fabricate a submitted answer set."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
```

### ACD-172 - Clarification Questionnaire Identity Resume

```yaml
plan_unit_id: ACD-172
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Structured clarification flows preserve question identity and deterministic
  resume; `clarification_request` may point at a multi-question questionnaire,
  `question_ids[]` remain canonical cross-surface identifiers, and thread or
  wizard resume restores the same outstanding questionnaire state or resolved
  outcome.
gui_related: false
gui_classification_reason: Clarification identity and resume are cross-surface state semantics.
depends_on: [ACD-170, ACD-171]
unblocks: []
acceptance_criteria:
  - Clarification requests can reference multi-question questionnaires.
  - question_ids[] remains canonical across surfaces.
  - Resume restores outstanding questionnaire state or resolved outcome.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: clarification_resume
reasoning_tier: high
context_scope: interview_chat
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - Plans/chain-wizard-flexibility.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: clarification_questionnaire_identity_resume
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0084
preserved_exact_tokens:
  - "clarification_request"
  - "question_ids[]"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-173 - Interview Runtime Disclosure

```yaml
plan_unit_id: ACD-173
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Active Interview work blocks show the effective runtime state required by
  shared runtime owner docs, and chat-visible runtime/account information
  remains owner-doc consistent; `/runtime-disclosure` is presentation over the
  resolved runtime/account snapshot, not a chat-local account-routing model.
gui_related: true
gui_classification_reason: Interview runtime and account disclosure are visible chat UI.
depends_on: [ACD-147, ACD-169]
unblocks: [ACD-174, ACD-175]
acceptance_criteria:
  - Active Interview work blocks show effective runtime state.
  - Runtime/account information remains owner-doc consistent.
  - runtime-disclosure does not become chat-local account routing.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: interview_runtime_display
reasoning_tier: high
context_scope: interview_chat
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - Plans/Prompt_Pipeline.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: interview_runtime_disclosure
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0085
preserved_exact_tokens:
  - "effective runtime state"
  - "/runtime-disclosure"
  - "resolved runtime/account snapshot"
negative_constraints:
  - "/runtime-disclosure is presentation over the resolved runtime/account snapshot, not a new chat-local account-routing model."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-174 - Assistant Invoked Dev Surface Ownership

```yaml
plan_unit_id: ACD-174
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant-invoked `/dev` and live command work uses shell-owned
  terminal/output/ports and `/output/ports` surfaces, and chat must not invent
  a parallel dev-output model.
gui_related: false
gui_classification_reason: Dev output ownership is a shell/runtime surface boundary.
depends_on: [ACD-173]
unblocks: []
acceptance_criteria:
  - Assistant-invoked dev work uses shell-owned terminal/output/ports.
  - Chat does not define a parallel dev-output model.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dev_output_surface_boundary
reasoning_tier: high
context_scope: interview_chat
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: assistant_invoked_dev_surface_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0085
preserved_exact_tokens:
  - "/dev"
  - "/output/ports"
negative_constraints:
  - "Chat must not invent a parallel dev-output model."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-175 - Approval Runtime Account Display Copy

```yaml
plan_unit_id: ACD-175
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Approval display copy uses PM-native durable/default approval wording;
  external labels such as Bypass, Autopilot, and Default Approvals are
  reference-baseline terms only and do not become canonical PM approval modes.
gui_related: true
gui_classification_reason: Approval display copy is visible UI text.
depends_on: [ACD-173]
unblocks: []
acceptance_criteria:
  - PM-native durable/default approval wording is used for display copy.
  - External labels remain reference-baseline terms only.
  - Bypass, Autopilot, and Default Approvals do not become canonical modes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: approval_copy_disposition
reasoning_tier: standard
context_scope: interview_chat
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: approval_runtime_account_display_copy
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0085
preserved_exact_tokens:
  - "Bypass"
  - "Autopilot"
  - "Default Approvals"
negative_constraints:
  - "External labels such as Bypass, Autopilot, and Default Approvals are reference-baseline terms only and do not become canonical PM approval modes."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-176 - Context Truncation Strategy Provenance

```yaml
plan_unit_id: ACD-176
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Chat context strategy preserves the goal of not truncating important context
  and may draw provenance examples from VBW, Get Shit Done (GSD), and yume
  while applying context compilation, compaction-aware re-reads, and clear
  current-versus-summarized boundaries.
gui_related: false
gui_classification_reason: Context preservation strategy is prompt/context pipeline behavior.
depends_on: []
unblocks: [ACD-177, ACD-178]
acceptance_criteria:
  - Important context is preserved as a primary design goal.
  - Provenance examples remain examples, not replacement canon.
  - Context compilation and compaction-aware rereads remain applicable strategies.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: context_preservation_strategy
reasoning_tier: standard
context_scope: context_truncation
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: context_truncation_strategy_provenance
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0086
preserved_exact_tokens:
  - "VBW"
  - "Get Shit Done (GSD)"
  - "yume"
  - "current"
  - "summarized"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
```

### ACD-177 - Compact Session Chat Entrypoint

```yaml
plan_unit_id: ACD-177
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  User-triggered "Compact session" or "Summarize and continue" in chat runs the
  same compaction pipeline as auto-compact when invoked by slash command, menu,
  or the chat context circle's Compact Now action. The entrypoint dispatches
  cmd.chat.compact_context only after explicit user choice, shows clear UI
  feedback such as "Compacting...", emits context.compaction.started,
  context.compaction.completed, and context.compaction.failed or an equivalent
  visible failure/degraded state, reports already_running, cancelled, no_op,
  degraded, unavailable, retry_scheduled, completed, or failed command results,
  and treats Plans/newfeatures.md §10 as
  source-lineage only rather than live owner prose.
gui_related: true
gui_classification_reason: Compact-session command/menu entrypoint and feedback are visible chat UI.
depends_on: [ACD-176]
unblocks: []
acceptance_criteria:
  - Compact session can be invoked by the user from chat.
  - User-triggered compaction runs the same pipeline as auto-compact.
  - The chat context circle Compact Now click path dispatches cmd.chat.compact_context only after explicit user choice.
  - Visible feedback is shown during compaction.
  - Already-running, cancelled, no-op, degraded, unavailable, retry, reload, completed, and failed outcomes remain visible or receipt-backed.
  - Failure or unavailable compaction produces context.compaction.failed or an equivalent visible degraded state with next-action copy.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
  - Compact Now chat context circle acceptance fixture
risk_class: compact_session_ui
reasoning_tier: standard
context_scope: context_truncation
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: compact_session_chat_entrypoint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0086
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/compaction_compile_readiness_matrix.json:cmp-owner-cleanup-001
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/compaction_compile_readiness_matrix.json:cmp-automated-testing-acceptance
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0090
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0094
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/questions.jsonl:q-0013
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/decisions.jsonl:dec-0015
preserved_exact_tokens:
  - "Compact session"
  - "Summarize and continue"
  - "Compact Now"
  - "cmd.chat.compact_context"
  - "context.compaction.started"
  - "context.compaction.completed"
  - "context.compaction.failed"
  - "Compacting..."
  - "already_running"
  - "cancelled"
  - "no_op"
  - "retry_scheduled"
  - "Plans/newfeatures.md"
  - "newfeatures.md"
  - "§10 auto-compact"
negative_constraints:
  - Do not revive Plans/newfeatures.md as a live implementation surface or owner hint for Compact Now, manual compaction, or auto-compact behavior.
  - Do not dispatch Compact Now from hover alone; explicit click/choice is required.
  - Do not treat manual Compact Now alone as a new cache lineage unless logical run lineage changes.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
  - Plans/UI_Command_Catalog.md
owner_boundary_notes:
  - Plans/newfeatures.md is historical/source-lineage for this compaction reference, not a live implementation owner.
```

### ACD-178 - Assistant Turn Bundle Ordering

```yaml
plan_unit_id: ACD-178
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Every Assistant turn and chat-triggered run assembles run context as three
  explicit bundles in deterministic order: (1) Instruction Bundle, (2) Work
  Bundle, and (3) Memory Bundle.
gui_related: false
gui_classification_reason: Bundle ordering is prompt/context pipeline behavior.
depends_on: [ACD-176]
unblocks: [ACD-179, ACD-180, ACD-181, ACD-183, ACD-186]
acceptance_criteria:
  - Assistant turns use explicit Instruction, Work, and Memory bundles.
  - Bundle order is deterministic for chat-triggered runs.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: context_bundle_order
reasoning_tier: high
context_scope: context_truncation
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: assistant_turn_bundle_ordering
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0087
preserved_exact_tokens:
  - "Instruction Bundle"
  - "Work Bundle"
  - "Memory Bundle"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-179 - Work Bundle Acceptance Criteria Guard

```yaml
plan_unit_id: ACD-179
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Work Bundle acceptance criteria MUST NEVER be truncated; when truncation is
  required, instruction example or illustrative content is removed first, then
  conversation summaries or older turns before any acceptance criteria content.
gui_related: false
gui_classification_reason: Acceptance criteria truncation guard is context pipeline behavior.
depends_on: [ACD-178]
unblocks: [ACD-183]
acceptance_criteria:
  - Work Bundle acceptance criteria are never truncated.
  - Truncation order removes examples/illustrative content before summaries/older turns.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: acceptance_truncation_guard
reasoning_tier: high
context_scope: context_truncation
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: work_bundle_acceptance_criteria_guard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0087
preserved_exact_tokens:
  - "MUST NEVER be truncated"
  - "AgentsMdLightEnforcement"
negative_constraints:
  - "Work Bundle acceptance criteria MUST NEVER be truncated."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-180 - Injected Context Breakdown Transparency

```yaml
plan_unit_id: ACD-180
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Chat UI surfaces an "Injected Context" breakdown per run or turn, including
  included `AGENTS.md` paths and byte counts, parent summary and attempt
  journal inclusion plus byte counts, and whether truncation occurred with its
  reason and order.
gui_related: true
gui_classification_reason: Injected Context breakdown is visible chat UI.
depends_on: [ACD-178]
unblocks: []
acceptance_criteria:
  - Injected Context breakdown appears per run or turn.
  - AGENTS.md, parent summary, and attempt journal inclusion disclose byte counts.
  - Truncation occurrence, reason, and order are visible.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: injected_context_ui
reasoning_tier: standard
context_scope: context_truncation
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: injected_context_breakdown_transparency
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0088
preserved_exact_tokens:
  - "Injected Context"
  - "AGENTS.md"
  - "parent summary"
  - "attempt journal"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-181 - Context Injector User Configuration

```yaml
plan_unit_id: ACD-181
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The three context injectors are user-configurable per project with optional
  per-run override and deterministic defaults.
gui_related: true
gui_classification_reason: Context injector configuration and per-run override are user-facing settings/controls.
depends_on: [ACD-178]
unblocks: [ACD-182]
acceptance_criteria:
  - Three context injectors can be configured per project.
  - Optional per-run override exists.
  - Defaults are deterministic.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: context_injector_config
reasoning_tier: standard
context_scope: context_truncation
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: context_injector_user_configuration
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0088
preserved_exact_tokens:
  - "per-project"
  - "per-run override"
  - "deterministic defaults"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-182 - Context Injector Budget Default Recording

```yaml
plan_unit_id: ACD-182
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Context injector budget defaults for bytes, lines, and headings are decided
  deterministically and recorded via `auto_decisions.jsonl`; this PlanUnit is a
  contract reference only and does not authorize governance artifact writes in
  ordinary plan standardization.
gui_related: false
gui_classification_reason: Budget default recording is governance/config behavior.
depends_on: [ACD-181]
unblocks: []
acceptance_criteria:
  - Budget defaults cover bytes, lines, and headings.
  - Defaults are deterministic and recorded by governance flow only.
  - Phase 2B standardization does not write auto_decisions.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: default_governance
reasoning_tier: high
context_scope: context_truncation
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: context_injector_budget_default_recording
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0088
preserved_exact_tokens:
  - "auto_decisions.jsonl"
  - "bytes/lines/headings"
negative_constraints:
  - "This is a contract reference only for this phase, not a permission to write governance artifacts."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-183 - Model Switch Context Repack Sequence

```yaml
plan_unit_id: ACD-183
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  On model switch, the context pipeline re-packs before the next turn by
  preserving system prompt, Instruction Bundle, active file references, and the
  last 6 turns, summarizing older turns, truncating summary then oldest
  preserved turns if needed, normalizing provider formatting, and running
  synchronously before send.
gui_related: false
gui_classification_reason: Model-switch repack is context pipeline behavior; UI feedback is covered by the source and related UI unit.
depends_on: [ACD-178, ACD-179]
unblocks: [ACD-184, ACD-185]
acceptance_criteria:
  - Repack runs synchronously before the next turn after model switch.
  - Preserve/summarize/truncate/normalize sequence remains deterministic.
  - Summary truncates before oldest preserved turns.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: model_switch_repack
reasoning_tier: high
context_scope: context_truncation
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: model_switch_context_repack_sequence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0089
preserved_exact_tokens:
  - "last 6 turns"
  - "Conversation Summary"
  - "Repacking context…"
negative_constraints:
  - "Never truncate the system prompt or the Work Bundle acceptance criteria."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-184 - Repack Model Window Config Source

```yaml
plan_unit_id: ACD-184
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Repack configuration preserves `context.repack.verbatim_turns` with default
  `6`, and model-window limits come from
  `platform_specs::context_window(provider)`.
gui_related: false
gui_classification_reason: Repack configuration source is runtime/config behavior.
depends_on: [ACD-183]
unblocks: []
acceptance_criteria:
  - context.repack.verbatim_turns default remains 6.
  - Model context limits come from platform_specs::context_window(provider).
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: repack_config_source
reasoning_tier: standard
context_scope: context_truncation
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: repack_model_window_config_source
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0089
preserved_exact_tokens:
  - "context.repack.verbatim_turns"
  - "6"
  - "platform_specs::context_window(provider)"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-185 - AGENTS Promotion UI Enforcement

```yaml
plan_unit_id: ACD-185
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Any UI affordance that offers "Promote to AGENTS.md" or similar must enforce
  Promotion rules and AGENTS.md lightness enforcement, including budgets,
  before applying changes.
gui_related: true
gui_classification_reason: Promote-to-AGENTS affordance is a visible UI action.
depends_on: [ACD-178]
unblocks: []
acceptance_criteria:
  - Promote-to-AGENTS UI enforces Promotion rules.
  - AGENTS.md lightness budgets are checked before changes.
  - The action cannot bypass governance constraints.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: agents_promotion_guard
reasoning_tier: high
context_scope: context_truncation
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - AGENTS.md
node_compile_hint:
  mode: agents_md_promotion_ui_enforcement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0089
preserved_exact_tokens:
  - "Promote to AGENTS.md"
  - "PromotionRules"
  - "AgentsMdLightEnforcement"
negative_constraints:
  - "Promotion rules and AGENTS.md lightness enforcement must run before applying changes."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-186 - Assistant Memory Capsule Retrieval Contract

```yaml
plan_unit_id: ACD-186
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant turns with a selected project call Assistant-memory SSOT interfaces
  `build_capsule(project_id, now)` and `search(project_id, user_message, now,
  k)` and enforce configured capsule and retrieval budgets.
gui_related: false
gui_classification_reason: Assistant memory capsule/retrieval injection is prompt/context pipeline behavior.
depends_on: [ACD-178]
unblocks: [ACD-187, ACD-188, ACD-189]
acceptance_criteria:
  - Assistant turns call build_capsule for selected project.
  - Assistant turns call search with project_id, user_message, now, and k.
  - Capsule and retrieval budgets are enforced.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: assistant_memory_injection
reasoning_tier: high
context_scope: assistant_memory
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: assistant_memory_capsule_retrieval_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0090
preserved_exact_tokens:
  - "build_capsule(project_id, now)"
  - "search(project_id, user_message, now, k)"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/assistant-memory-subsystem.md
```

### ACD-187 - Assistant Memory Eligibility Summary Boundary

```yaml
plan_unit_id: ACD-187
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Automatic memory injection applies Assistant-memory SSOT eligibility gating:
  Verified-only by default, Unverified inclusion only with explicit user
  action, memory text summary-only, and memory injection separate from the
  Application/Project rules pipeline.
gui_related: false
gui_classification_reason: Memory eligibility and summary-only boundaries are prompt/context policy behavior.
depends_on: [ACD-186]
unblocks: [ACD-188]
acceptance_criteria:
  - Verified-only automatic inclusion remains default.
  - Unverified memory inclusion requires explicit user action.
  - Memory text is summary-only and separate from Application/Project rules.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_eligibility
reasoning_tier: high
context_scope: assistant_memory
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/assistant-memory-subsystem.md
  - Plans/agent-rules-context.md
node_compile_hint:
  mode: assistant_memory_eligibility_summary_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0090
preserved_exact_tokens:
  - "Verified-only"
  - "Unverified"
  - "summary-only"
  - "Application/Project rules pipeline"
negative_constraints:
  - "Any Unverified inclusion requires explicit user action."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/assistant-memory-subsystem.md
```

### ACD-188 - Assistant Memory Non Forwarding

```yaml
plan_unit_id: ACD-188
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Assistant memory MUST NOT be forwarded to subagents or non-Assistant execution paths from chat.
gui_related: false
gui_classification_reason: Assistant memory forwarding boundary is execution/context policy behavior.
depends_on: [ACD-186, ACD-187]
unblocks: []
acceptance_criteria:
  - Assistant memory remains scoped to Assistant chat.
  - Subagents do not receive Assistant memory from chat.
  - Non-Assistant execution paths do not receive Assistant memory from chat.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: assistant_only_scope
reasoning_tier: high
context_scope: assistant_memory
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/assistant-memory-subsystem.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: assistant_memory_non_forwarding
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0090
preserved_exact_tokens:
  - "Assistant memory MUST NOT be forwarded"
negative_constraints:
  - "Assistant memory MUST NOT be forwarded to subagents or non-Assistant execution paths from chat."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/assistant-memory-subsystem.md
```

### ACD-189 - Gist Review Memory Command Canon

```yaml
plan_unit_id: ACD-189
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Gist Review actions in Assistant chat dispatch canonical
  `cmd.chat.memory.*` UI command IDs and must not use ad-hoc command
  identifiers.
gui_related: true
gui_classification_reason: Gist Review actions and UI command IDs are visible chat commands.
depends_on: [ACD-186]
unblocks: []
acceptance_criteria:
  - Gist Review actions dispatch cmd.chat.memory.* UI command IDs.
  - Ad-hoc memory command identifiers are prohibited.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_ui_commands
reasoning_tier: high
context_scope: assistant_memory
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/assistant-memory-subsystem.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: gist_review_memory_command_canon
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0090
preserved_exact_tokens:
  - "cmd.chat.memory.*"
negative_constraints:
  - "Gist Review actions in Assistant chat MUST NOT use ad-hoc command identifiers."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### ACD-190 - Project Retrieval Separation

```yaml
plan_unit_id: ACD-190
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Project retrieval injection may add project-scoped chat/code/log context for
  the current turn, but it remains separate from Assistant memory injection and
  is fresh, ephemeral Work Bundle context.
gui_related: false
gui_classification_reason: Project retrieval separation is context assembly policy, not GUI behavior.
depends_on: [ACD-186]
unblocks: [ACD-191]
acceptance_criteria:
  - Project retrieval injection stays separate from Assistant memory injection.
  - Retrieved context is fresh, ephemeral context for the current turn.
  - Assistant memory is never implicitly expanded by chat/code/log retrieval.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: retrieval
reasoning_tier: high
context_scope: context
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Tools.md
node_compile_hint:
  mode: project_retrieval_separation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0091
preserved_exact_tokens:
  - "project-scoped retrieved context"
  - "chat/code/logs"
  - "MUST remain separate"
  - "fresh, ephemeral context"
negative_constraints:
  - "Assistant memory injection is never implicitly expanded by chat/code/log retrieval."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/assistant-memory-subsystem.md
```

### ACD-191 - Project Retrieval Controls

```yaml
plan_unit_id: ACD-191
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Project retrieval injection respects the Thread-local Auto Retrieval chip,
  per-project retrieval settings, and Context Lens overlays.
gui_related: true
gui_classification_reason: Retrieval chips, Settings/Memory controls, and Context Lens overlays are visible or user-configurable UI.
depends_on: [ACD-190]
unblocks: [ACD-194]
acceptance_criteria:
  - Thread-local Auto Retrieval override defaults On and can be disabled per thread.
  - Per-project retrieval settings preserve allowlist, modes, and budgets.
  - Context Lens overlays affect retrieval injection.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: retrieval
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: project_retrieval_controls
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0091
preserved_exact_tokens:
  - "Thread-local Auto Retrieval override"
  - "default On"
  - "Settings/Memory"
  - "allowlist + modes + budgets"
  - "Context Lens overlays"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-192 - Context Lens Control

```yaml
plan_unit_id: ACD-192
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Context Lens is a top-right chat control immediately right of chat search,
  rendered as an icon plus dropdown exposing `Mute`, `Focus`, `Subcompact`,
  and `Turn Off`.
gui_related: true
gui_classification_reason: Context Lens placement and dropdown controls are visible chat UI.
depends_on: [ACD-191]
unblocks: [ACD-193]
acceptance_criteria:
  - Context Lens lives in the top-right of the chat window.
  - The control appears immediately to the right of chat search.
  - Dropdown exposes Mute, Focus, Subcompact, and Turn Off.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: context_lens
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: context_lens_control
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0092
preserved_exact_tokens:
  - "Mute"
  - "Focus"
  - "Subcompact"
  - "Turn Off"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-193 - Context Lens Modes

```yaml
plan_unit_id: ACD-193
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Context Lens modes support selecting multiple messages at once; `Mute` and
  `Focus` apply immediately, `Subcompact` requires an explicit apply action,
  and `Turn Off` exits Context Lens mode and clears active selection state.
gui_related: true
gui_classification_reason: Context Lens mode selection and apply behavior are visible chat UI.
depends_on: [ACD-192]
unblocks: [ACD-194]
acceptance_criteria:
  - Mute, Focus, and Subcompact support multi-message selection.
  - Mute and Focus apply as selection toggles happen.
  - Subcompact requires explicit apply before creating a local summary artifact.
  - Turn Off clears active selection state.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: context_lens
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: context_lens_modes
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0092
preserved_exact_tokens:
  - "Mute"
  - "Focus"
  - "Subcompact"
  - "Turn Off"
  - "explicit apply action"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### ACD-194 - Context Lens Assembly

```yaml
plan_unit_id: ACD-194
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Context Lens effective assembly excludes muted messages, protects focused
  messages, and replaces Subcompact selections with a local summary while
  preserving canonical source history and rehydration handles.
gui_related: false
gui_classification_reason: Context Lens assembly changes prompt/context construction rather than visual presentation.
depends_on: [ACD-193]
unblocks: [ACD-195]
acceptance_criteria:
  - Muted messages are excluded from effective context assembly and agent chatsearch results.
  - Focused messages remain protected and high priority.
  - Subcompact uses a local summary while preserving canonical source history and rehydration handles.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: context_lens
reasoning_tier: high
context_scope: context
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: context_lens_assembly
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0092
preserved_exact_tokens:
  - "chatsearch"
  - "local summary"
  - "canonical source history"
  - "rehydration handles"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
```

### ACD-195 - Context Lens Handoff Boundary

```yaml
plan_unit_id: ACD-195
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Context Lens state is thread-local UI shaping, not Assistant memory; child
  handoff bundles derive from canonical source state plus current effective
  shaping state and never from a lossy copy as their only truth.
gui_related: false
gui_classification_reason: Context Lens handoff boundary is context pipeline and child-run behavior.
depends_on: [ACD-194]
unblocks: []
acceptance_criteria:
  - Context Lens state remains thread-local shaping.
  - Context Lens state is not Assistant memory.
  - Child handoff bundles derive from canonical source state plus effective shaping.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: context_lens
reasoning_tier: high
context_scope: handoff
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
  - Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: context_lens_handoff_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0092
preserved_exact_tokens:
  - "not Assistant memory"
negative_constraints:
  - "Children do not inherit a lossy copy as their only truth."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
```

### ACD-196 - BrainStorm Plan Flow

```yaml
plan_unit_id: ACD-196
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: BrainStorm uses one coordinated plan-style Q&A, research, and debugging flow to form a single plan.
gui_related: false
gui_classification_reason: BrainStorm plan flow is mode/orchestration behavior.
depends_on: []
unblocks: [ACD-197]
acceptance_criteria:
  - BrainStorm uses a plan-style flow.
  - One coordinated Q&A/research phase forms the plan.
  - Questions are not asked repeatedly by multiple subagents.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: brainstorm
reasoning_tier: standard
context_scope: run_modes
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
node_compile_hint:
  mode: brainstorm_plan_flow
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0093
preserved_exact_tokens:
  - "BrainStorm"
  - "plan-style flow"
  - "single plan"
negative_constraints:
  - "Questions are not asked multiple times by multiple subagents."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
```

### ACD-197 - BrainStorm Execution Switch

```yaml
plan_unit_id: ACD-197
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Starting or executing a BrainStorm plan switches chat to Agent mode, and
  execution may run through a regular agent, a crew, or Agent plus subagents,
  with manager auto-decision or user request.
gui_related: true
gui_classification_reason: BrainStorm execution switch and user-requested executor choice are visible chat behavior.
depends_on: [ACD-196]
unblocks: [ACD-198]
acceptance_criteria:
  - BrainStorm execution switches chat to Agent mode.
  - Execution supports regular agent, crew, and Agent plus subagents.
  - Manager auto-decision and user-requested executor choice are supported.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: brainstorm
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: brainstorm_execution_switch
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0093
preserved_exact_tokens:
  - "chat must switch to Agent mode"
  - "regular agent"
  - "crew"
  - "Agent + subagents"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
```

### ACD-198 - BrainStorm Subagent Projection

```yaml
plan_unit_id: ACD-198
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  BrainStorm subagent collaboration is only the chat-facing projection of the
  canonical crew message board; schema, routing rules, priority model, rate
  limit, and orchestrator-visibility contract remain owned by orchestrator
  docs.
gui_related: true
gui_classification_reason: BrainStorm collaboration appears in chat, but this unit preserves its visible projection boundary.
depends_on: [ACD-196]
unblocks: []
acceptance_criteria:
  - Chat may describe BrainStorm collaboration as user-facing projection.
  - Orchestrator owner docs retain schema, routing, priority, rate-limit, and visibility contracts.
  - Assistant Chat does not become the normative schema owner.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary
reasoning_tier: high
context_scope: subagents
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/interview-subagent-integration.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: brainstorm_subagent_projection
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0093
preserved_exact_tokens:
  - "canonical crew message board"
  - "schema, routing rules, priority model, rate limit, and orchestrator-visibility contract"
negative_constraints:
  - "This chat document is not the normative schema owner."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/orchestrator-subagent-integration.md
```

### ACD-199 - AI Overseer Documentation

```yaml
plan_unit_id: ACD-199
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Interview-generated documentation and plans target AI execution and must be
  unambiguous, wire-explicit, DRY, complete, fully wired to GUI/config/API as
  intended, and free of built-but-not-wired or stubbed components.
gui_related: true
gui_classification_reason: Generated plan content must explicitly wire GUI/config/API behavior.
depends_on: []
unblocks: []
acceptance_criteria:
  - Generated documents assume an AI agent will execute them.
  - Generated instructions are unambiguous and wire-explicit.
  - Generated tasks require completeness and reject built-but-not-wired stubs.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: docs_generation
reasoning_tier: high
context_scope: interview
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: ai_overseer_docs
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0094
preserved_exact_tokens:
  - "AI agent"
  - "wire-explicit"
  - "DRY Method"
  - "No partially complete components"
  - "built but not wired"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/interview-subagent-integration.md
```

### ACD-200 - Reference Owner Deferral

```yaml
plan_unit_id: ACD-200
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Reference lists defer to live owner docs instead of stale section-number citations.
gui_related: false
gui_classification_reason: Reference deferral is documentation ownership behavior.
depends_on: []
unblocks: [ACD-201]
acceptance_criteria:
  - References route to live owner docs.
  - Stale section-number citations do not own current behavior.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: reference_drift
reasoning_tier: high
context_scope: docs
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: reference_owner_deferral
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0095
preserved_exact_tokens:
  - "Reference lists"
  - "live owner docs"
  - "stale section-number citations"
negative_constraints:
  - "Reference lists must defer to live owner docs instead of stale section-number citations."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-201 - Chat Reference Owner Set

```yaml
plan_unit_id: ACD-201
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Chat reference ownership routes through AGENTS, interview, orchestrator,
  HITL, agent-rules, FileSafe, Tools, Commands, UI Command Catalog,
  Permissions, Skills, MCP, GitHub, usage, and performance owner docs.
gui_related: false
gui_classification_reason: Reference owner routing is documentation/source-of-truth behavior.
depends_on: [ACD-200]
unblocks: []
acceptance_criteria:
  - Chat references preserve live owner-doc routing for commands, permissions, skills, MCP, usage, and performance.
  - Slash-command and web-provider behavior routes to Commands/UI Command Catalog/Tools/Permissions owners.
  - MCP naming and availability terms route to MCP_Integration.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: reference_drift
reasoning_tier: high
context_scope: owner_map
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Permissions_System.md
  - Plans/MCP_Integration.md
node_compile_hint:
  mode: chat_reference_owner_set
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0095
preserved_exact_tokens:
  - "YOLO = no ask prompts"
  - "Regular"
  - "/web"
  - "deprecated aliases"
  - "MCP naming"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
```

### ACD-202 - Historical References Non Normative

```yaml
plan_unit_id: ACD-202
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Historical cited web-search and comparative references are lineage and
  background only and do not replace Tools, FinalGUISpec, MCP, usage, or
  performance owner canon.
gui_related: false
gui_classification_reason: Historical reference disposition is source-lineage documentation behavior.
depends_on: [ACD-200]
unblocks: []
acceptance_criteria:
  - Historical cited search references remain background only.
  - Comparative VBW, GSD, and yume references remain lineage examples only.
  - Owner canon remains in live Plans owner docs.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: reference_drift
reasoning_tier: high
context_scope: source_lineage
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
  - Plans/FinalGUISpec.md
  - Plans/MCP_Integration.md
node_compile_hint:
  mode: historical_refs_non_normative
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0095
preserved_exact_tokens:
  - "historical background only"
  - "opencode-websearch-cited"
  - "VBW"
  - "GSD"
  - "yume"
negative_constraints:
  - "These references do not replace the owner canon."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
```

### ACD-203 - Dashboard CtA Attention

```yaml
plan_unit_id: ACD-203
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Dashboard warnings and Calls to Action are user-attention items that require or benefit from explicit user response.
gui_related: true
gui_classification_reason: Dashboard warnings and CtAs are visible Dashboard UI.
depends_on: []
unblocks: [ACD-204, ACD-205]
acceptance_criteria:
  - Dashboard warnings identify items requiring or benefiting from user attention.
  - Dashboard CtAs prompt explicit user interaction.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dashboard_cta
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/human-in-the-loop.md
node_compile_hint:
  mode: dashboard_cta_attention
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0096
preserved_exact_tokens:
  - "warnings"
  - "Calls to Action (CtAs)"
  - "approve"
  - "acknowledge"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/human-in-the-loop.md
```

### ACD-204 - Assistant Addresses CtA

```yaml
plan_unit_id: ACD-204
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: The Assistant can address Dashboard warnings and CtAs in natural language before or instead of direct controls.
gui_related: true
gui_classification_reason: Assistant handling of Dashboard CtAs is visible chat/Dashboard behavior.
depends_on: [ACD-203]
unblocks: [ACD-205]
acceptance_criteria:
  - Users can open Assistant and respond to CtAs in natural language.
  - Users can clarify warnings or suggested actions before taking action.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dashboard_cta
reasoning_tier: standard
context_scope: chat
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: assistant_addresses_cta
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0096
preserved_exact_tokens:
  - "approve and continue"
  - "what's blocking?"
  - "run the suggested fix"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-205 - HITL Continue In Assistant

```yaml
plan_unit_id: ACD-205
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  HITL pauses show a Dashboard CtA and spawn a named Assistant thread;
  orchestrator completion or pause offers `Continue in Assistant` with run
  summary and package, seam, node, or blocked episode context injected.
gui_related: true
gui_classification_reason: HITL Dashboard CtA, spawned thread, and Continue in Assistant handoff are visible UI.
depends_on: [ACD-203]
unblocks: []
acceptance_criteria:
  - HITL pauses show Dashboard CtAs.
  - HITL pauses spawn an appropriately named Assistant thread.
  - Continue in Assistant opens Assistant with relevant run context.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dashboard_cta
reasoning_tier: high
context_scope: handoff
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/human-in-the-loop.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: hitl_continue_assistant
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0096
  - Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:7
  - Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/decisions.jsonl:7
  - Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:13
preserved_exact_tokens:
  - "HITL"
  - "new thread"
  - "Continue in Assistant"
  - "run summary"
  - "phase/task/subtask id"
  - "orchestrator pauses at a tier boundary"
negative_constraints:
  - "Assistant handoff context must not use tier boundary as live runtime authority."
compatibility_only_notes:
  - "phase/task/subtask id and tier-boundary examples are compatibility lineage only."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/human-in-the-loop.md
```

### ACD-206 - Dev Action Mapping

```yaml
plan_unit_id: ACD-206
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Assistant-invoked dev actions map to stable UI commands and visible shell state changes.
gui_related: true
gui_classification_reason: Dev actions, commands, and shell state changes are visible chat/shell UI.
depends_on: []
unblocks: [ACD-207, ACD-208, ACD-209]
acceptance_criteria:
  - Assistant dev intents resolve to canonical cmd.dev.* or terminal command IDs.
  - Shell state changes remain visible.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dev_session
reasoning_tier: standard
context_scope: commands
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: dev_action_mapping
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0097
preserved_exact_tokens:
  - "cmd.dev.*"
  - "start hot reload dev mode"
  - "start dev server"
  - "run tests in watch mode"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### ACD-207 - Dev Output Projection Boundary

```yaml
plan_unit_id: ACD-207
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Chat shows dev-session lifecycle state while output routes to canonical
  Terminal, Output, Problems, Debug Console, and Ports surfaces rather than a
  parallel chat output model.
gui_related: true
gui_classification_reason: Dev-session lifecycle state and output routing are visible shell/chat UI.
depends_on: [ACD-206]
unblocks: []
acceptance_criteria:
  - Dev-session states are visible in chat/shell surfaces.
  - Output routes to canonical shell-owned surfaces.
  - Chat does not create a parallel dev-output model.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dev_session
reasoning_tier: high
context_scope: owner_boundary
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/FileManager.md
node_compile_hint:
  mode: dev_output_projection
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0097
preserved_exact_tokens:
  - "starting"
  - "active"
  - "failed"
  - "restored"
  - "Terminal, Output, Problems, Debug Console, and Ports"
negative_constraints:
  - "Chat does not create a parallel dev-output model."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-208 - Dev Session Consequence Disclosure

```yaml
plan_unit_id: ACD-208
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Project switch or workspace-tab close surfaces explicit consequences for active dev sessions.
gui_related: true
gui_classification_reason: Project switch and workspace-tab close consequence disclosure is visible UI.
depends_on: [ACD-206]
unblocks: [ACD-214]
acceptance_criteria:
  - Project switch discloses consequences for active dev sessions.
  - Workspace-tab close discloses consequences for active dev sessions.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dev_session
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: dev_session_consequence_disclosure
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0097
preserved_exact_tokens:
  - "project switch"
  - "workspace-tab close"
  - "active dev session"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-209 - Dev Terminal Identity

```yaml
plan_unit_id: ACD-209
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: A dev session can own or link multiple terminal sessions without collapsing them into one PTY identity.
gui_related: false
gui_classification_reason: Dev-session to terminal identity is runtime ownership behavior.
depends_on: [ACD-206]
unblocks: [ACD-210, ACD-211, ACD-212]
acceptance_criteria:
  - Dev sessions can own or link multiple terminal sessions.
  - Linked terminal sessions preserve distinct PTY identities.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dev_session
reasoning_tier: high
context_scope: runtime
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: dev_terminal_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0098
preserved_exact_tokens:
  - "multiple terminal sessions"
  - "PTY identity"
negative_constraints:
  - "A dev session must not collapse multiple terminal sessions into one PTY identity."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-210 - Dev Session Surface Reveal

```yaml
plan_unit_id: ACD-210
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Dev-session surface actions reveal current `dev_session_id` Output,
  Problems, Ports, or primary/last-active terminal without changing canonical
  owning runtime records.
gui_related: true
gui_classification_reason: Show Output, Problems, Ports, and Open in Terminal are visible UI actions.
depends_on: [ACD-209]
unblocks: []
acceptance_criteria:
  - Show Output, Show Problems, and Show Ports reveal surfaces linked to dev_session_id.
  - Open in Terminal reveals the primary or last-active terminal when one exists.
  - Reveal actions do not mutate owning runtime records.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dev_session
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: dev_session_surface_reveal
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0098
preserved_exact_tokens:
  - "Show Output"
  - "Show Problems"
  - "Show Ports"
  - "Open in Terminal"
  - "dev_session_id"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### ACD-211 - Editor Pane Reconciliation

```yaml
plan_unit_id: ACD-211
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Workgroup and editor-stack pane mirroring stays reconciled, and the bottom
  workspace shows placeholder guidance when a pane exists only in the editor
  stack rather than pretending the pane no longer exists.
gui_related: true
gui_classification_reason: Workgroup, pane, editor-stack, and placeholder guidance are visible shell/editor UI.
depends_on: [ACD-209]
unblocks: []
acceptance_criteria:
  - Mirrored workgroup/editor-stack pane references are removed or updated on close.
  - Editor-stack-only panes show placeholder guidance in bottom workspace surfaces.
  - UI does not pretend editor-stack-only panes no longer exist.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dev_session
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: editor_pane_reconciliation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0098
preserved_exact_tokens:
  - "workgroups"
  - "leaf panes"
  - "editor-embedded terminal panels"
  - "placeholder guidance"
negative_constraints:
  - "A pane that exists only in the editor stack must not be treated as nonexistent."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-212 - Dev Session History

```yaml
plan_unit_id: ACD-212
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Stopping a dev session preserves historical shell evidence and linked surface history after process exit.
gui_related: false
gui_classification_reason: Dev-session history preservation is storage/runtime behavior.
depends_on: [ACD-209]
unblocks: []
acceptance_criteria:
  - Stopping a dev session preserves historical shell evidence.
  - Linked Output, Problems, Ports, and terminal history remains available after exit.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dev_session
reasoning_tier: high
context_scope: storage
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: dev_session_history
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0098
preserved_exact_tokens:
  - "historical shell evidence"
  - "linked surface history"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-213 - Project Switch State

```yaml
plan_unit_id: ACD-213
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Switching projects recalculates effective shell, tool, and dev-session state
  for the new project context while old-project background activity remains
  visible through badges and attention surfaces tied to its project and
  session identities.
gui_related: true
gui_classification_reason: Project switch recalculation, badges, and attention surfaces are visible UI behavior.
depends_on: [ACD-208]
unblocks: [ACD-214]
acceptance_criteria:
  - Project switch recalculates effective shell/tool/dev-session state.
  - Old-project background activity remains visible via project/session-specific badges.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dev_session
reasoning_tier: high
context_scope: project_context
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Run_Modes.md
node_compile_hint:
  mode: project_switch_state
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0099
preserved_exact_tokens:
  - "effective shell"
  - "tool"
  - "dev-session state"
  - "badges"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-214 - No Silent Dev Session Orphan

```yaml
plan_unit_id: ACD-214
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Closing a workspace or terminal tab with an active dev session requires
  explicit consequence disclosure, and Puppet Master must not silently orphan
  background workflows by default.
gui_related: true
gui_classification_reason: Workspace/terminal close consequence disclosure is visible safety UI.
depends_on: [ACD-213]
unblocks: []
acceptance_criteria:
  - Closing a workspace tab with active dev session discloses consequences.
  - Closing a terminal tab with active dev session discloses consequences.
  - Background workflows are not silently orphaned by default.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dev_session
reasoning_tier: high
context_scope: safety
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Run_Modes.md
node_compile_hint:
  mode: no_silent_orphan
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0099
preserved_exact_tokens:
  - "Puppet Master MUST NOT silently orphan the background workflow by default"
negative_constraints:
  - "Puppet Master MUST NOT silently orphan the background workflow by default."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-215 - Gap Review MVP Scope

```yaml
plan_unit_id: ACD-215
unit_type: decision
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: All gaps listed in section 23 are adopted as MVP and reflected in the main body sections 1-22.
gui_related: true
gui_classification_reason: Adopted gaps include user-visible chat behavior and UI controls.
depends_on: []
unblocks: [ACD-216]
acceptance_criteria:
  - Section 23 gap review is treated as adopted MVP scope.
  - Main body sections 1-22 remain the normative location for adopted behavior.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: scope
reasoning_tier: standard
context_scope: mvp
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: gap_review_mvp_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0100
preserved_exact_tokens:
  - "All gaps listed below are adopted as MVP"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-216 - File Reference Chips

```yaml
plan_unit_id: ACD-216
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: MVP gap closure includes visible file-reference chips and `cmd.chat.add_file_reference` ownership for file handoff.
gui_related: true
gui_classification_reason: File-reference chips and add-file commands are visible chat UI.
depends_on: [ACD-215]
unblocks: []
acceptance_criteria:
  - File references render as visible chips rather than hidden context injection.
  - File handoff uses cmd.chat.add_file_reference ownership.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_gap
reasoning_tier: standard
context_scope: file_handoff
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FileManager.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: file_reference_chips
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0101
preserved_exact_tokens:
  - "visible file-reference chips"
  - "cmd.chat.add_file_reference"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FileManager.md
```

### ACD-217 - Revert Rewind Split

```yaml
plan_unit_id: ACD-217
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Chat separates `cmd.chat.revert` file restore from `cmd.chat.rewind` conversation rewind.
gui_related: true
gui_classification_reason: Revert and rewind are visible chat command behaviors.
depends_on: [ACD-215]
unblocks: []
acceptance_criteria:
  - cmd.chat.revert restores files.
  - cmd.chat.rewind rewinds conversation state.
  - The two command IDs are not conflated.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_gap
reasoning_tier: high
context_scope: commands
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: revert_rewind_split
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0101
preserved_exact_tokens:
  - "cmd.chat.revert"
  - "cmd.chat.rewind"
negative_constraints:
  - "cmd.chat.revert and cmd.chat.rewind must remain separate."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### ACD-218 - Chat Gap Owner Boundary

```yaml
plan_unit_id: ACD-218
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Chat consumes Search, Source Control, LSP, browser/preview, and
  remote-recovery results or copy without taking over their owners and aligns
  with requested/effective and no-silent-fallback contracts.
gui_related: false
gui_classification_reason: Search, source control, LSP, browser, and remote recovery ownership is cross-surface contract behavior.
depends_on: [ACD-215]
unblocks: []
acceptance_criteria:
  - Chat consumes owner results without becoming their owner.
  - Browser/preview and remote recovery copy align with requested/effective contracts.
  - No-silent-fallback contracts remain intact.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary
reasoning_tier: high
context_scope: chat_consumers
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FileManager.md
  - Plans/FinalGUISpec.md
  - Plans/GitHub_Integration.md
node_compile_hint:
  mode: chat_gap_owner_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0101
preserved_exact_tokens:
  - "without taking over"
  - "requested/effective"
  - "no-silent-fallback"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-219 - Queue FIFO Resolution

```yaml
plan_unit_id: ACD-219
unit_type: decision
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Steer and queue ordering is resolved as FIFO with max 2 messages, and `Send now` sends that message immediately as steer.
gui_related: true
gui_classification_reason: Queue ordering and Send now are visible chat input/run controls.
depends_on: [ACD-215]
unblocks: []
acceptance_criteria:
  - Queue order is FIFO.
  - Chat queue max is 2 messages.
  - Send now sends that message immediately as steer.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: risk_resolution
reasoning_tier: high
context_scope: chat_queue
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: queue_fifo_resolution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0102
preserved_exact_tokens:
  - "FIFO"
  - "max 2 messages"
  - "Send now"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-220 - Model Switch Repack Resolution

```yaml
plan_unit_id: ACD-220
unit_type: decision
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Model-switch context repack preserves prompt, rules, file refs, and last 6
  turns, summarizes older turns, truncates summary first, normalizes Provider
  formatting, and uses `platform_specs::context_window(provider)`.
gui_related: false
gui_classification_reason: Model-switch repack is context pipeline behavior.
depends_on: [ACD-183]
unblocks: []
acceptance_criteria:
  - Model-switch repack follows the resolved preserve/summarize/truncate/normalize order.
  - Repack uses context.repack.verbatim_turns default 6.
  - Context window comes from platform_specs::context_window(provider).
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: risk_resolution
reasoning_tier: high
context_scope: context
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: model_switch_repack_resolution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0102
preserved_exact_tokens:
  - "context.repack.verbatim_turns"
  - "6"
  - "platform_specs::context_window(provider)"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-221 - Thought Stream Unification

```yaml
plan_unit_id: ACD-221
unit_type: decision
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Thought stream UX is unified across Interview and Assistant when model reasoning or thinking is available.
gui_related: true
gui_classification_reason: Thought stream and thinking toggle are visible chat UI.
depends_on: []
unblocks: []
acceptance_criteria:
  - Interview and Assistant thought stream UX align.
  - Thought stream appears only when model reasoning/thinking is available.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: risk_resolution
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: thought_stream_unification
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0102
preserved_exact_tokens:
  - "thought stream"
  - "thinking toggle"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-222 - Crew Plan Format Resolution

```yaml
plan_unit_id: ACD-222
unit_type: decision
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Crew execution uses the same plan/todo JSON as single-agent execution, and
  Provider output parsers normalize non-standard formats before orchestrator
  ingestion.
gui_related: false
gui_classification_reason: Crew execution format and provider parsing are orchestrator/runtime behavior.
depends_on: []
unblocks: []
acceptance_criteria:
  - Crew execution uses the canonical plan schema.
  - Provider output parsers normalize non-standard formats before ingestion.
  - No translation layer is required between single-agent and crew plan/todo JSON.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: risk_resolution
reasoning_tier: high
context_scope: orchestrator
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: crew_plan_format_resolution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0102
preserved_exact_tokens:
  - "No translation layer"
  - "canonical plan schema"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/orchestrator-subagent-integration.md
```

### ACD-223 - ELI5 Prompt Size

```yaml
plan_unit_id: ACD-223
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: ELI5 prompt appendages stay short to avoid context bloat.
gui_related: false
gui_classification_reason: ELI5 appendage length is prompt/context policy.
depends_on: []
unblocks: []
acceptance_criteria:
  - ELI5 prompt appendages remain short.
  - ELI5 behavior does not introduce context bloat.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: prompt_size
reasoning_tier: standard
context_scope: context
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: eli5_prompt_size
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0102
preserved_exact_tokens:
  - "ELI5"
  - "one sentence"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
```

### ACD-224 - Long Thread Risk Mitigation

```yaml
plan_unit_id: ACD-224
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Long-thread lag and flicker risk is mitigated by section 24 virtualization, stable IDs, incremental updates, and no full rebuild on stream.
gui_related: true
gui_classification_reason: Long-thread lag, flicker, virtualization, and streaming updates are visible chat UI performance behavior.
depends_on: []
unblocks: [ACD-235]
acceptance_criteria:
  - Long-thread UI uses virtualization and stable IDs.
  - Streaming uses incremental updates.
  - Full list rebuild on stream is prohibited.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: performance
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: long_thread_risk_mitigation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0102
preserved_exact_tokens:
  - "Long thread performance and flicker"
  - "§24"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-225 - Competitive Matrix

```yaml
plan_unit_id: ACD-225
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Preserve the competitive coverage matrix across OpenCode, Claude Code, Codex, Gemini, Antigravity, Cursor, and Our plan.
gui_related: true
gui_classification_reason: The competitive matrix covers visible chat feature scope and UI parity.
depends_on: [ACD-215]
unblocks: [ACD-226]
acceptance_criteria:
  - Competitive comparison rows remain traceable.
  - OpenCode, Claude Code, Codex, Gemini, Antigravity, Cursor, and Our plan columns are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: competitive_scope
reasoning_tier: standard
context_scope: reference
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: competitive_matrix
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0103
preserved_exact_tokens:
  - "OpenCode"
  - "Claude Code"
  - "Codex"
  - "Gemini"
  - "Antigravity"
  - "Cursor"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-226 - MVP Scope Summary

```yaml
plan_unit_id: ACD-226
unit_type: decision
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  MVP scope includes the listed chat features and LSP-aware chat/editor
  integration, while Inbox-per-agent and real-time collaboration are out of
  initial desktop MVP scope.
gui_related: true
gui_classification_reason: MVP scope includes visible chat/editor behavior and excludes visible collaboration features.
depends_on: [ACD-225]
unblocks: []
acceptance_criteria:
  - LSP-aware chat/editor integration is included in MVP.
  - Inbox-per-agent is out of initial desktop MVP scope.
  - Real-time collaboration is out of initial desktop MVP scope.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: competitive_scope
reasoning_tier: high
context_scope: mvp
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: mvp_scope_summary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0103
preserved_exact_tokens:
  - "LSP is MVP"
  - "Inbox-per-agent"
  - "real-time collaboration"
negative_constraints:
  - "Inbox-per-agent and real-time collaboration are out of scope."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-227 - Adopted Command Thread Lifecycle

```yaml
plan_unit_id: ACD-227
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Adopted MVP command and thread lifecycle includes thinking toggle, slash
  commands, export, compact, resume/rewind, revert, share, delete, copy,
  custom-vs-built-in commands, and plan panel per thread.
gui_related: true
gui_classification_reason: Command/thread lifecycle items are visible chat UI features.
depends_on: [ACD-215]
unblocks: []
acceptance_criteria:
  - Adopted command lifecycle features remain MVP.
  - Plan panel is per-thread.
  - Custom and built-in command distinction is preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: adopted_mvp
reasoning_tier: standard
context_scope: chat
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: command_thread_lifecycle
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0104
preserved_exact_tokens:
  - "thinking toggle"
  - "slash commands"
  - "resume/rewind"
  - "plan panel per thread"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### ACD-228 - Adopted Queue Interrupt Error UX

```yaml
plan_unit_id: ACD-228
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Adopted MVP run controls include two-slot FIFO queue, `Send now`, Interrupt
  distinct from Stop, active task in this thread, and error UX with Resend or
  Cancel.
gui_related: true
gui_classification_reason: Run queue, interrupt, stop, active task, and error controls are visible chat UI.
depends_on: [ACD-219]
unblocks: []
acceptance_criteria:
  - Queue is FIFO with two slots.
  - Interrupt and Stop are distinct.
  - Error UX offers Resend or Cancel.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: adopted_mvp
reasoning_tier: high
context_scope: chat_run
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: queue_interrupt_error
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0104
preserved_exact_tokens:
  - "no clear-queue action"
  - "Interrupt != Stop"
  - "Resend or Cancel"
negative_constraints:
  - "Interrupt is not Stop."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-229 - Adopted Platform Input Streaming

```yaml
plan_unit_id: ACD-229
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Adopted MVP platform and input behavior includes model/platform change UI, streaming/fallback batch, paste/drag-drop, rate-limit switch option, and keyboard shortcuts.
gui_related: true
gui_classification_reason: Platform controls, paste/drag-drop, rate-limit switch option, and shortcuts are visible input UI.
depends_on: [ACD-215]
unblocks: []
acceptance_criteria:
  - Model/platform change UI remains MVP.
  - Paste and drag/drop input remain MVP.
  - Rate-limit switch option and keyboard shortcuts remain MVP.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: adopted_mvp
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: platform_input_streaming
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0104
preserved_exact_tokens:
  - "model/platform change UI"
  - "streaming/fallback batch"
  - "paste/drag-drop"
  - "rate-limit switch option"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-230 - Adopted HITL Run Notifications

```yaml
plan_unit_id: ACD-230
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Adopted MVP notifications include HITL spawned thread, run-complete notification with opt-out setting, and orchestrator `Continue in Assistant` handoff.
gui_related: true
gui_classification_reason: HITL thread notifications and Continue in Assistant handoff are visible UI.
depends_on: [ACD-205]
unblocks: []
acceptance_criteria:
  - HITL notifications spawn a new thread.
  - Run-complete notification has a setting to turn off.
  - Orchestrator handoff uses Continue in Assistant.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: adopted_mvp
reasoning_tier: high
context_scope: handoff
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/human-in-the-loop.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: hitl_run_notifications
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0104
preserved_exact_tokens:
  - "new thread spawned"
  - "setting to turn off"
  - "Continue in Assistant"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/human-in-the-loop.md
```

### ACD-231 - Assistant Concurrency Boundary

```yaml
plan_unit_id: ACD-231
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Assistant UI concurrent thread setting defaults to 10 and must not redefine global runtime or interview subagent ceilings.
gui_related: true
gui_classification_reason: Assistant concurrent thread setting is visible/configurable UI.
depends_on: []
unblocks: []
acceptance_criteria:
  - Assistant UI concurrent thread default remains 10.
  - Assistant UI concurrency does not redefine global runtime concurrency.
  - Assistant UI concurrency does not redefine interview subagent ceilings.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: adopted_mvp
reasoning_tier: high
context_scope: concurrency
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: assistant_concurrency_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0104
preserved_exact_tokens:
  - "default 10"
  - "max_total_active_agents=32"
negative_constraints:
  - "Assistant UI concurrent thread setting must not redefine global runtime concurrency."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-232 - Plan Panel Error Scope

```yaml
plan_unit_id: ACD-232
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Plan panel is per-thread and Accessibility is not MVP; custom/built-in command conflicts explain why, and error UX suggests switching platform or model when appropriate.
gui_related: true
gui_classification_reason: Plan panel, command conflict copy, accessibility scope, and error suggestions are visible UI behavior.
depends_on: [ACD-227]
unblocks: []
acceptance_criteria:
  - Plan panel is per-thread.
  - Accessibility is explicitly not MVP in this scope.
  - Custom/built-in command conflicts explain why.
  - Error UX can suggest platform/model switch when appropriate.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: adopted_mvp
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: plan_panel_error_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0104
preserved_exact_tokens:
  - "Accessibility is not MVP"
  - "no conflicting names"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-233 - No Blanket Closure Traceability

```yaml
plan_unit_id: ACD-233
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Previously open gaps are traceability only and do not claim blanket closure; competitive-comparison traceability remains intact.
gui_related: false
gui_classification_reason: Previously open gaps traceability is documentation/governance behavior.
depends_on: [ACD-225]
unblocks: []
acceptance_criteria:
  - Previously open gaps table remains traceability.
  - The table does not claim blanket closure.
  - Competitive-comparison traceability remains intact.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: traceability
reasoning_tier: standard
context_scope: docs
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: no_blanket_closure
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0105
preserved_exact_tokens:
  - "without claiming blanket closure"
negative_constraints:
  - "This traceability table must not claim blanket closure."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-234 - Git Parity Chat

```yaml
plan_unit_id: ACD-234
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Git and GitHub parity is specified in GitHub_Integration, and chat git commands drive git operations without switching to the Git panel.
gui_related: true
gui_classification_reason: Chat git commands and Git panel handoff are visible UI behavior.
depends_on: []
unblocks: []
acceptance_criteria:
  - Git/GitHub parity routes to GitHub_Integration.
  - Chat git commands can drive git operations.
  - Users need not switch to the Git panel to use chat git commands.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: git
reasoning_tier: standard
context_scope: chat_consumer
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/GitHub_Integration.md
node_compile_hint:
  mode: git_parity_chat
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0106
preserved_exact_tokens:
  - "Git panel"
  - "GitHub API integration"
  - "SSH remote dev servers"
  - "no-wizard project flows"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/GitHub_Integration.md
```

### ACD-235 - Long Thread Performance Scope

```yaml
plan_unit_id: ACD-235
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Long chat thread performance requirements apply to chat message list and thread content on Rust + Slint with advanced renderer assumptions.
gui_related: true
gui_classification_reason: Long-thread performance applies to visible chat message list rendering.
depends_on: [ACD-224]
unblocks: [ACD-236]
acceptance_criteria:
  - Long chat thread requirements cover message list and related thread content.
  - Rust + Slint and advanced renderer assumptions remain explicit.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: performance
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: long_thread_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0107
preserved_exact_tokens:
  - "Rust + Slint"
  - "winit + Skia"
  - "Composergui5"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-236 - Virtualized Message List

```yaml
plan_unit_id: ACD-236
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The message list must virtualize the visible viewport plus overscan of 10
  items above and below, using virtual spacer height and estimated or measured
  item heights.
gui_related: true
gui_classification_reason: Message-list virtualization and overscan affect visible scrolling and rendering.
depends_on: [ACD-235]
unblocks: [ACD-237, ACD-242, ACD-243, ACD-244, ACD-248]
acceptance_criteria:
  - Only visible viewport plus overscan is rendered.
  - Overscan defaults to 10 items above and below.
  - Scrollbar height uses virtual spacer and estimated/measured item heights.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: performance
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/newfeatures.md
node_compile_hint:
  mode: virtualized_message_list
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0108
preserved_exact_tokens:
  - "ui.chat.virtualization_overscan"
  - "10"
  - "virtual spacer height"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/newfeatures.md
```

### ACD-237 - Slint Visible Slice Stable ID

```yaml
plan_unit_id: ACD-237
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Slint implementation uses ListView or an equivalent visible-slice model with
  stable message/block IDs to avoid huge widget trees and reduce flicker.
gui_related: true
gui_classification_reason: Slint visible-slice rendering and stable IDs affect visible chat UI performance.
depends_on: [ACD-236]
unblocks: [ACD-238, ACD-239, ACD-241]
acceptance_criteria:
  - Slint renders only a visible slice rather than a full thread widget tree.
  - Visible slice can be driven by start_index and count.
  - Message/block IDs remain stable across scrolling.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: performance
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: slint_visible_slice_stable_id
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0108
preserved_exact_tokens:
  - "ListView"
  - "(start_index, count)"
  - "message_id"
  - "event_id"
negative_constraints:
  - "Avoid building a single huge widget tree for the entire thread."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-238 - No Full Replace Streaming

```yaml
plan_unit_id: ACD-238
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Streaming appends or updates the active message in place and never replaces or rebuilds the entire visible message list on chunks.
gui_related: true
gui_classification_reason: Streaming updates and flicker avoidance are visible chat UI behavior.
depends_on: [ACD-237]
unblocks: [ACD-240, ACD-244]
acceptance_criteria:
  - Streaming updates the current message node in place.
  - Stream chunks do not rebuild the full visible list.
  - Other visible items do not re-render or jump because of active streaming content.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: performance
reasoning_tier: high
context_scope: streaming
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: no_full_replace_streaming
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0109
preserved_exact_tokens:
  - "not replace the entire message list"
  - "do not trigger a full re-layout or re-build"
negative_constraints:
  - "Do not replace the entire message list on stream chunks."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-239 - Scroll Layout Stability

```yaml
plan_unit_id: ACD-239
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Expand/collapse preserves scroll position, caches or estimates heights, and avoids read-write-read layout thrash.
gui_related: true
gui_classification_reason: Expand/collapse and scroll stability are visible chat UI behavior.
depends_on: [ACD-237]
unblocks: [ACD-249]
acceptance_criteria:
  - Expand/collapse preserves or minimally adjusts scroll position.
  - Height estimates or caches prevent recalculating every item on every action.
  - Layout avoids read-write-read patterns.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: performance
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: scroll_layout_stability
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0109
preserved_exact_tokens:
  - "scroll position"
  - "read-write-read"
  - "visible slice"
negative_constraints:
  - "Avoid read-write-read layout thrash."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-240 - Streaming Single Update Path

```yaml
plan_unit_id: ACD-240
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Active streaming uses one buffer/model update path with coalescing or throttling rather than node replacement.
gui_related: true
gui_classification_reason: Streaming update path affects visible chat streaming performance.
depends_on: [ACD-238]
unblocks: []
acceptance_criteria:
  - Active streaming appends to a buffer or model.
  - Renderer draws current streamed state on a coalesced cadence.
  - Streaming does not replace the whole active node.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: performance
reasoning_tier: standard
context_scope: streaming
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: streaming_single_update_path
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0109
preserved_exact_tokens:
  - "1-2 frames per second"
  - "single update path"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-241 - Lazy Collapsed Content

```yaml
plan_unit_id: ACD-241
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Collapsed sections lazily render only summary lines while full content remains stored for persistence and search.
gui_related: true
gui_classification_reason: Collapsed section lazy rendering is visible chat UI behavior.
depends_on: [ACD-237]
unblocks: []
acceptance_criteria:
  - Collapsed thought, bash, diff, and web sections render only summary content.
  - Full content remains in the thread model for persistence and search.
  - Full content renders only after expansion.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: performance
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: lazy_collapsed_content
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0110
preserved_exact_tokens:
  - "Thought stream (expand)"
  - "Ran: cargo test"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-242 - Load Older Optional

```yaml
plan_unit_id: ACD-242
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Optional load-older pagination may bound extreme thread display while preserving full history in storage.
gui_related: true
gui_classification_reason: Load older pagination is visible long-thread UI behavior.
depends_on: [ACD-236]
unblocks: [ACD-250]
acceptance_criteria:
  - Load older pagination is available as an optional enhancement if virtualization alone is insufficient.
  - Full history remains in storage.
  - UI can fetch older slices on demand.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: performance
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: load_older_optional
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0110
preserved_exact_tokens:
  - "Load 50 older"
  - "optional"
  - "Full history remains in storage"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-243 - Thread Hot Memory Cap

```yaml
plan_unit_id: ACD-243
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Current-thread hot memory is capped at the last 200 messages or 8 MB, paging older message content from storage on demand.
gui_related: false
gui_classification_reason: Hot memory cap and paging are storage/runtime performance behavior.
depends_on: [ACD-236]
unblocks: []
acceptance_criteria:
  - Hot memory caps to last 200 messages or 8 MB.
  - Older message content is paged from storage on demand.
  - Full thread persistence is not reduced by hot memory caps.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: performance
reasoning_tier: high
context_scope: storage
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: thread_hot_memory_cap
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0110
preserved_exact_tokens:
  - "ui.chat.in_memory_cap_messages"
  - "200"
  - "ui.chat.in_memory_cap_bytes"
  - "8388608"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-244 - Performance Enhancement Integration

```yaml
plan_unit_id: ACD-244
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: MVP performance enhancements must integrate with virtualization and flicker avoidance.
gui_related: true
gui_classification_reason: Performance enhancements are visible chat UI loading, scrolling, and search behavior.
depends_on: [ACD-236, ACD-238]
unblocks: [ACD-245, ACD-246, ACD-247]
acceptance_criteria:
  - Skeleton placeholders integrate with virtualization.
  - Jump-to-message integrates with virtualization.
  - Search-in-thread highlights integrate with virtualization and flicker avoidance.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: performance
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: performance_enhancement_integration
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0111
preserved_exact_tokens:
  - "MVP"
  - "virtualization"
  - "flicker avoidance"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-245 - Skeleton Placeholders

```yaml
plan_unit_id: ACD-245
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Skeleton placeholders show 8 theme-aware rows on thread load or fast scroll, replace in place, and fail to an error placeholder plus Retry.
gui_related: true
gui_classification_reason: Skeleton rows, error placeholders, and Retry are visible loading UI.
depends_on: [ACD-244]
unblocks: []
acceptance_criteria:
  - Thread load shows 8 skeleton rows until first slice loads.
  - Skeletons replace in place when content arrives.
  - Load failure shows error placeholder and Retry.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: performance
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: skeleton_placeholders
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0111
preserved_exact_tokens:
  - "ui.chat.skeleton_row_count"
  - "8"
  - "Retry"
negative_constraints:
  - "Do not leave skeletons indefinitely."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-246 - Jump To Message

```yaml
plan_unit_id: ACD-246
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Jump to message resolves stable ID or index, loads the target slice with
  overscan, scrolls the target into view, highlights or focuses it briefly, and
  handles missing or deleted targets.
gui_related: true
gui_classification_reason: Jump to message is visible navigation and highlighting UI.
depends_on: [ACD-244]
unblocks: []
acceptance_criteria:
  - Search results, shared links, or command palette can jump to a message.
  - Target slice loads with overscan.
  - Missing or deleted target shows Message not found.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: performance
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: jump_to_message
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0111
preserved_exact_tokens:
  - "Go to message"
  - "target_index +/- overscan"
  - "Message not found"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-247 - Search Thread Highlights

```yaml
plan_unit_id: ACD-247
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Search-in-thread highlights visible matches with cached ranges per
  message/query, caps matches per message, escapes regex or special characters,
  and clears on empty query or thread change.
gui_related: true
gui_classification_reason: Search highlights and next/previous navigation are visible chat UI.
depends_on: [ACD-244]
unblocks: []
acceptance_criteria:
  - Only visible items need highlight computation under virtualization.
  - Match ranges are cached by message and query.
  - Matches per message are capped and empty query clears highlights.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: performance
reasoning_tier: high
context_scope: search
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: search_thread_highlights
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0111
preserved_exact_tokens:
  - "Highlight all in thread"
  - "Next/Previous"
  - "(message_id, query)"
  - "50"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-248 - Overscan Height Mitigation

```yaml
plan_unit_id: ACD-248
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Overscan remains 10, and item height estimation uses per-type estimates or measured-height cache keyed by stable ID.
gui_related: true
gui_classification_reason: Overscan and height estimation affect visible virtual list scroll behavior.
depends_on: [ACD-236]
unblocks: []
acceptance_criteria:
  - Overscan remains 10 items.
  - Item heights use per-type estimates or measured cache keyed by stable ID.
  - Scrollbar updates as measured heights become known.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: performance
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: overscan_height_mitigation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0112
preserved_exact_tokens:
  - "Overscan: 10"
  - "message ~80px"
  - "diff ~200px"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-249 - Scroll Restore Mitigation

```yaml
plan_unit_id: ACD-249
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Expand/collapse and scroll restore preserve anchors, last visible message, or offset and recompute visible slices without arbitrary jumps.
gui_related: true
gui_classification_reason: Expand/collapse and restored scroll position are visible chat UI behavior.
depends_on: [ACD-239]
unblocks: []
acceptance_criteria:
  - Expand/collapse preserves a stable scroll anchor.
  - Thread reopen restores scroll position by last visible message id or offset.
  - Visible slice recomputation avoids arbitrary jumps.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: performance
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: scroll_restore_mitigation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0112
preserved_exact_tokens:
  - "first visible item id"
  - "last visible message id"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-250 - Streaming Tail Display Limit

```yaml
plan_unit_id: ACD-250
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Streaming tail remains visible only when the user is already at bottom;
  persistence has no hard limit while display relies on virtualization and
  optional load-older for 10k+ message threads.
gui_related: true
gui_classification_reason: Streaming tail behavior and long-thread display limits are visible chat UI behavior.
depends_on: [ACD-242]
unblocks: []
acceptance_criteria:
  - Streaming auto-scrolls only when already at bottom.
  - User scroll-up during stream is respected.
  - Persistence has no hard thread length limit.
  - Display uses virtualization and optional load-older for very long threads.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: performance
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: streaming_tail_display_limit
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0112
preserved_exact_tokens:
  - "do not auto-scroll"
  - "No hard limit for persistence"
  - "10k+ messages"
negative_constraints:
  - "When user has scrolled up during stream, do not auto-scroll."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-251 - Context Circle Owner Deferral

```yaml
plan_unit_id: ACD-251
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Context Circle addendum defers canonical thread-usage behavior to section 12
  and usage-feature, and compact-now remains valid only through canonical
  compaction commands.
gui_related: false
gui_classification_reason: Context Circle owner deferral is compatibility/source ownership behavior.
depends_on: []
unblocks: [ACD-252]
acceptance_criteria:
  - Thread-usage behavior is owned by section 12 and usage-feature.
  - Compact-now behavior remains valid only when backed by canonical compaction commands.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: context_usage
reasoning_tier: high
context_scope: compat
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: context_circle_owner_deferral
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0113
preserved_exact_tokens:
  - "## 12. Context usage display"
  - "Plans/usage-feature.md"
  - "compact-now"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/usage-feature.md
```

### ACD-252 - Context Popout Retired

```yaml
plan_unit_id: ACD-252
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Detached usage pop-out model, old command IDs, and persistence keys are
  retired or superseded by the canonical thread-scoped Context Detail
  Pane/editor-tab model and its stable command IDs.
gui_related: true
gui_classification_reason: Detached usage pop-out and Context Detail Pane are user-visible context/usage UI models.
depends_on: [ACD-251]
unblocks: []
acceptance_criteria:
  - Detached usage pop-out is no longer canonical.
  - Old command IDs and persistence keys for the pop-out model are superseded.
  - Thread-scoped Context Detail Pane/editor-tab model remains canonical.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: context_usage
reasoning_tier: high
context_scope: stale_retired
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/usage-feature.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: context_popout_retired
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0113
preserved_exact_tokens:
  - "detached usage pop-out is no longer canonical"
  - "superseded"
negative_constraints:
  - "Detached usage pop-out is no longer canonical."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/usage-feature.md
```

### ACD-253 - Validation Settings Context

```yaml
plan_unit_id: ACD-253
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: One Auditor validation-loop setting exposes provider/model choices for the Auditor invariant loop after interview/wizard project-plan generation; per-pass settings are retired compatibility lineage.
gui_related: true
gui_classification_reason: Auditor validation provider/model settings are visible Settings UI.
depends_on: []
unblocks: [ACD-254]
acceptance_criteria:
  - Auditor invariant loop is exposed through one provider/model settings row.
  - Settings apply after interview/wizard project-plan generation cycles.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_settings
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: validation_settings_context
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0114
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0115
preserved_exact_tokens:
  - "Three-Pass Canonical Validation Workflow"
  - "provider + model selection"
negative_constraints:
  - "Do not expose per-pass provider/model settings."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
```

### ACD-254 - Validation Settings Location

```yaml
plan_unit_id: ACD-254
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Auditor validation loop provider/model selection lives in Settings -> Interview / Planning Wizard -> Auditor Validation, not the chat UI.
gui_related: true
gui_classification_reason: Settings navigation and non-chat placement are visible configuration UI.
depends_on: [ACD-253]
unblocks: [ACD-255, ACD-261]
acceptance_criteria:
  - Auditor Validation settings group exists under Interview / Planning Wizard settings.
  - Auditor loop selection is not placed in chat UI.
  - Validation settings remain co-located with interview/wizard settings.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_settings
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: auditor_validation_settings_location
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0116
preserved_exact_tokens:
  - "Auditor Validation"
  - "Settings -> Interview / Planning Wizard -> Auditor Validation"
negative_constraints:
  - "Fixed Pass 1 / Pass 2 / Pass 3 provider and model selections are retired."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-255 - Validation Pass Controls

```yaml
plan_unit_id: ACD-255
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Auditor Validation settings expose one row for the Auditor validation loop
  with label, default provider, default model, and Provider and Model dropdowns
  sourced from platform specs.
gui_related: true
gui_classification_reason: Auditor validation loop row and provider/model dropdowns are visible Settings UI.
depends_on: [ACD-254]
unblocks: [ACD-256, ACD-262]
acceptance_criteria:
  - Auditor Validation has one settings row for the whole validation loop.
  - Provider dropdown lists enabled platforms from platform_specs.
  - Model dropdown lists provider models and falls back through platform_specs::fallback_model_ids(platform).
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_settings
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: auditor_validation_controls
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0117
preserved_exact_tokens:
  - "Document Creation"
  - "Docs + Canonical Alignment"
  - "Canonical Systems Only"
  - "Auditor Validation"
  - "Provider"
  - "Model"
  - "platform_specs::fallback_model_ids(platform)"
negative_constraints:
  - "Do not expose independent Pass 1 / Pass 2 / Pass 3 provider/model rows."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-256 - No Effort Control Widget Tag

```yaml
plan_unit_id: ACD-256
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Auditor Validation settings show no reasoning/effort control and tag reusable wrappers with `// DRY:WIDGET:auditor-validation-provider-model-selector`.
gui_related: true
gui_classification_reason: The omitted effort control and reusable widget tag govern visible Auditor Validation settings controls.
depends_on: [ACD-255]
unblocks: [ACD-263]
acceptance_criteria:
  - Reasoning/effort control is not shown in Auditor Validation settings.
  - Auditor validation provider/model selector wrappers use the DRY widget tag.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_settings
reasoning_tier: high
context_scope: dry
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: auditor_no_effort_control_widget_tag
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0117
preserved_exact_tokens:
  - "// DRY:WIDGET:auditor-validation-provider-model-selector"
negative_constraints:
  - "No reasoning/effort control is shown in this settings group."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/DRY_Rules.md
```

### ACD-257 - Validation Default Chain

```yaml
plan_unit_id: ACD-257
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Default provider/model resolution uses the explicit Auditor loop stored value, then Auditor Model role default, then primary chat platform/model, then first available platform plus first fallback model.
gui_related: false
gui_classification_reason: Default resolution priority is settings/config behavior.
depends_on: [ACD-253]
unblocks: [ACD-258, ACD-259]
acceptance_criteria:
  - Stored model_roles.auditor provider/model values take priority.
  - Auditor Model role default is second priority.
  - Primary chat platform/model is third priority.
  - First available platform plus first fallback model is final fallback.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_settings
reasoning_tier: high
context_scope: defaults
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: validation_default_chain
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0118
preserved_exact_tokens:
  - "model_roles.auditor.provider"
  - "model_roles.auditor.model"
  - "platform_specs::fallback_model_ids(platform)"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-258 - Validation Default Invariants

```yaml
plan_unit_id: ACD-258
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Validation defaults are deterministic for the same app settings and resolved defaults are written on first explicit save for reproducible reads.
gui_related: false
gui_classification_reason: Default invariants are deterministic settings behavior.
depends_on: [ACD-257]
unblocks: [ACD-259]
acceptance_criteria:
  - Same app settings state resolves the same provider/model.
  - First explicit save writes resolved default to app settings.
  - Resolution avoids randomness and environment-dependent branching.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_settings
reasoning_tier: high
context_scope: defaults
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: validation_default_invariants
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0118
preserved_exact_tokens:
  - "no randomness, no environment-dependent branching"
negative_constraints:
  - "Default resolution uses no randomness and no environment-dependent branching."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-259 - Validation App Settings Only

```yaml
plan_unit_id: ACD-259
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Auditor validation loop selections are app settings only, not project artifacts, not emitted to seglog as project data, and not included in project exports.
gui_related: false
gui_classification_reason: Auditor validation settings storage scope is persistence/config behavior.
depends_on: [ACD-257]
unblocks: [ACD-260]
acceptance_criteria:
  - Auditor validation loop selections are stored in app settings only.
  - Auditor validation loop selections are not project artifacts.
  - Auditor validation loop selections are not emitted to seglog as project data or included in exports.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_storage
reasoning_tier: high
context_scope: settings
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: app_settings_only
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0119
preserved_exact_tokens:
  - "not stored in project artifacts"
  - "not emitted to seglog as project data"
  - "not included in project exports"
negative_constraints:
  - "Auditor validation loop selections are app settings only."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-260 - Validation Storage Keys

```yaml
plan_unit_id: ACD-260
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Each Auditor cycle report records the resolved Auditor validation loop
  provider/model in `auditor_cycle_report` payload fields and uses normative
  `model_roles.auditor.{provider,model}` storage keys. Legacy
  `validation_pass_report` mirrors may copy those values only with
  compatibility_only true and cycle_report_ref.
gui_related: false
gui_classification_reason: Validation storage keys and audit payload fields are persistence behavior.
depends_on: [ACD-259]
unblocks: []
acceptance_criteria:
  - auditor_cycle_report records resolved Auditor loop provider and model.
  - validation_pass_report mirrors resolved Auditor loop provider and model only as a compatibility mirror with compatibility_only true and cycle_report_ref.
  - Normative model_roles.auditor provider/model keys are used.
  - Settings keys themselves are not stored as project artifacts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_storage
reasoning_tier: high
context_scope: audit
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: validation_storage_keys
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0119
preserved_exact_tokens:
  - "auditor_cycle_report"
  - "validation_pass_report"
  - "cycle_report_ref"
  - "compatibility_only"
  - "provider"
  - "model"
  - "model_roles.auditor.provider"
  - "model_roles.auditor.model"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-261 - Validation UX Copy

```yaml
plan_unit_id: ACD-261
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Auditor Validation UX copy uses the specified section header, loop description, and `(Default)` indicator.
gui_related: true
gui_classification_reason: Auditor Validation labels and descriptions are visible Settings copy.
depends_on: [ACD-254]
unblocks: []
acceptance_criteria:
  - Section header is "Auditor Validation".
  - Section description and loop description match the specified copy.
  - Default indicator shows "(Default)" for automatically resolved provider/model values.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_settings
reasoning_tier: standard
context_scope: copy
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: auditor_validation_ux_copy
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0120
preserved_exact_tokens:
  - "Auditor Validation"
  - "Puppet Master runs the canonical validation sweep with the Auditor Model. Choose the provider and model for the whole audit loop."
  - "Audit / Repair / Audit"
  - "Document Creation"
  - "Canonical Alignment"
  - "Canonical Systems Only"
  - "(Default)"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-262 - Provider Models Registry Only

```yaml
plan_unit_id: ACD-262
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Provider and model lists must come from the account-bound Provider -> models registry and shared capability resolver; hardcoded provider names or model lists are not allowed, and legacy platform_specs is source-lineage only.
gui_related: false
gui_classification_reason: Provider/model source-of-truth is DRY/config behavior.
depends_on: [ACD-255]
unblocks: [ACD-263]
acceptance_criteria:
  - Provider lists source from the account-bound Provider -> models registry.
  - Model lists source from the shared provider/model registry and capability resolver.
  - Hardcoded provider names and model lists are prohibited.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_settings
reasoning_tier: high
context_scope: dry
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/DRY_Rules.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: provider_models_registry_only
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0121
preserved_exact_tokens:
  - "platform_specs"
  - "No hardcoded provider names or model lists"
negative_constraints:
  - "Provider and model lists MUST NOT be sourced exclusively from legacy platform_specs."
  - "No hardcoded provider names or model lists anywhere in this feature."
compatibility_only_notes:
  - "platform_specs is preserved only as a retired source-lineage token."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/DRY_Rules.md
```

### ACD-263 - Validation Dropdown Reuse

```yaml
plan_unit_id: ACD-263
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Auditor Validation reuses the same provider and model dropdown widgets as chat controls and applies the auditor-validation DRY widget tag.
gui_related: true
gui_classification_reason: Provider/model dropdown reuse affects visible Auditor Validation settings controls.
depends_on: [ACD-256, ACD-262]
unblocks: []
acceptance_criteria:
  - Auditor Validation uses the same provider dropdown widget as chat controls.
  - Auditor Validation uses the same model dropdown widget as chat controls.
  - Reusable settings wrappers carry the auditor-validation DRY widget tag.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_settings
reasoning_tier: high
context_scope: dry
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: auditor_validation_dropdown_reuse
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0121
preserved_exact_tokens:
  - "§1.1 chat controls"
  - "// DRY:WIDGET:auditor-validation-provider-model-selector"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/DRY_Rules.md
```

### ACD-264 - Validation Next Sweep Application

```yaml
plan_unit_id: ACD-264
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Validation settings changes take effect only on the next validation sweep run;
  an in-progress sweep continues with the provider/model active when it started.
gui_related: false
gui_classification_reason: Validation sweep timing is lifecycle behavior rather than GUI implementation.
depends_on: [ACD-253, ACD-257]
unblocks: []
acceptance_criteria:
  - Settings changes apply on the next validation sweep run.
  - A validation sweep in progress does not change provider/model mid-sweep.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_lifecycle
reasoning_tier: high
context_scope: validation_settings
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: validation_next_sweep_application
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0122
preserved_exact_tokens:
  - "next"
  - "not mid-sweep"
negative_constraints:
  - "Settings changes must not mutate provider/model selection for a validation sweep already in progress."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-265 - Validation Unavailable Provider Warning

```yaml
plan_unit_id: ACD-265
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  When a saved validation provider is unavailable, Puppet Master falls back to
  the deterministic default and displays the warning "Auditor validation provider
  [name] is unavailable; using Auditor Model default."
gui_related: true
gui_classification_reason: The unavailable-provider warning is visible user-facing settings feedback.
depends_on: [ACD-257]
unblocks: []
acceptance_criteria:
  - Unavailable saved validation providers fall back to the deterministic default.
  - The fallback displays the specified warning text.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: silent_fallback
reasoning_tier: high
context_scope: validation_settings
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Decision_Policy.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: validation_unavailable_provider_warning
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0122
preserved_exact_tokens:
  - "Auditor validation provider [name] is unavailable; using Auditor Model default."
negative_constraints:
  - "Unavailable saved validation providers must not fail silently."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-266 - Validation Pass Persistence And Independence

```yaml
plan_unit_id: ACD-266
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Auditor validation provider/model settings persist across app restarts, and Pass 1, Pass 2, and Pass 3 are compatibility aliases only, not independently configurable model settings or active stages.
gui_related: false
gui_classification_reason: Restart persistence and one-loop Auditor validation settings are configuration behavior.
depends_on: [ACD-253, ACD-260]
unblocks: []
acceptance_criteria:
  - Auditor validation settings are preserved across app restarts.
  - Auditor cycle reports use the same resolved Auditor validation loop provider/model.
  - Legacy Pass 1, Pass 2, and Pass 3 report mirrors are compatibility aliases only.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_settings
reasoning_tier: standard
context_scope: validation_storage
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: auditor_validation_persistence_no_pass_independence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0122
preserved_exact_tokens:
  - "Pass 1"
  - "Pass 2"
  - "Pass 3"
negative_constraints:
  - "Pass 1, Pass 2, and Pass 3 are not independently configurable model settings."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-267 - Validation Default Indicator Lifecycle

```yaml
plan_unit_id: ACD-267
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: The `(Default)` indicator is visible until an explicit Auditor validation loop provider/model selection is saved, then disappears.
gui_related: true
gui_classification_reason: The default indicator is visible settings UI.
depends_on: [ACD-254, ACD-261]
unblocks: []
acceptance_criteria:
  - The `(Default)` indicator appears when no explicit Auditor validation loop selection is saved.
  - The `(Default)` indicator disappears after the user saves an explicit Auditor validation loop selection.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_settings
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: auditor_validation_default_indicator_lifecycle
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0122
preserved_exact_tokens:
  - "(Default)"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-268 - Validation Dropdown And Report Parity

```yaml
plan_unit_id: ACD-268
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Auditor validation provider/model dropdowns draw from the account-bound Provider -> models registry and shared capability resolver, and
  each Auditor cycle report emits provider and model values matching the
  resolved Auditor validation loop provider/model; legacy
  `validation_pass_report.provider` and `.model` values mirror them for
  compatibility.
gui_related: false
gui_classification_reason: Dropdown data-source and emitted report parity are contract/config behavior.
depends_on: [ACD-260, ACD-262, ACD-263]
unblocks: []
acceptance_criteria:
  - Auditor validation dropdowns use the same Provider -> models and capability resolver source as chat controls.
  - Each emitted Auditor cycle report provider/model matches the resolved Auditor validation loop settings.
  - Legacy validation pass report provider/model values mirror the Auditor cycle report values only with compatibility_only true and cycle_report_ref.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_storage
reasoning_tier: high
context_scope: validation_report
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: auditor_validation_dropdown_report_parity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0122
preserved_exact_tokens:
  - "platform_specs"
  - "validation_pass_report.provider"
  - ".model"
  - "model_roles.auditor.provider"
  - "model_roles.auditor.model"
negative_constraints:
  - "Do not use legacy platform_specs as the active Auditor validation dropdown source."
compatibility_only_notes:
  - "platform_specs remains preserved only as a retired source-lineage token."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-269 - Validation Section Reference Boundary

```yaml
plan_unit_id: ACD-269
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Section 26 consumes `Plans/chain-wizard-flexibility.md §12`,
  `Plans/Project_Output_Artifacts.md §10.2`, `Plans/Decision_Policy.md §2`,
  `Plans/DRY_Rules.md`, `Plans/Contracts_V0.md`, and Section 1.1 chat
  controls without re-owning those contracts.
gui_related: false
gui_classification_reason: Reference ownership and contract boundary are documentation/governance behavior.
depends_on: [ACD-253]
unblocks: []
acceptance_criteria:
  - Section 26 references preserve the linked owner documents.
  - Assistant chat does not re-own the validation workflow, output artifact, decision policy, DRY, or platform_specs contracts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary
reasoning_tier: high
context_scope: validation_references
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Decision_Policy.md
  - Plans/DRY_Rules.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: validation_section_reference_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0123
preserved_exact_tokens:
  - "ContractName:Plans/chain-wizard-flexibility.md§12"
  - "ContractName:Plans/Project_Output_Artifacts.md"
  - "PolicyRule:Decision_Policy.md§2"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
```

### ACD-270 - Persona Control Scope

```yaml
plan_unit_id: ACD-270
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Persona Control defines Persona behavior for the Assistant chat surface.
gui_related: false
gui_classification_reason: The Persona Control scope statement defines behavior ownership, not a GUI element by itself.
depends_on: []
unblocks: [ACD-271]
acceptance_criteria:
  - Persona behavior for Assistant chat is explicitly scoped in this document.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_scope
reasoning_tier: standard
context_scope: persona
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: persona_control_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0124
preserved_exact_tokens:
  - "Persona Control in Assistant Chat"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-271 - Persona Modes

```yaml
plan_unit_id: ACD-271
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Assistant chat supports Persona modes `manual`, `auto`, and `hybrid`, with `manual` user-selected, `auto` context-resolved, and `hybrid` auto-by-default with temporary or persistent override.
gui_related: false
gui_classification_reason: Persona mode semantics are resolver behavior, while specific controls are covered by separate GUI units.
depends_on: [ACD-270]
unblocks: [ACD-272, ACD-283]
acceptance_criteria:
  - Assistant chat supports manual, auto, and hybrid Persona modes.
  - Manual, auto, and hybrid mode definitions match the canonical semantics.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_resolution
reasoning_tier: standard
context_scope: persona
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Personas.md
node_compile_hint:
  mode: persona_modes
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0125
preserved_exact_tokens:
  - "manual"
  - "auto"
  - "hybrid"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Personas.md
```

### ACD-272 - Persona Eligibility Boundary

```yaml
plan_unit_id: ACD-272
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Chat selection consumes `Plans/Personas.md`: `assistant` is the default
  direct-chat Persona; `explorer` and `bash` are subagent-only; `teacher` is
  direct-chat eligible but not a subagent Persona.
gui_related: false
gui_classification_reason: Persona eligibility is owned by Personas and consumed by Assistant Chat.
depends_on: [ACD-271]
unblocks: [ACD-275, ACD-278, ACD-284]
acceptance_criteria:
  - Assistant chat consumes Persona eligibility from `Plans/Personas.md`.
  - Subagent-only Personas are not selectable as direct chat Personas.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary
reasoning_tier: high
context_scope: persona
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Personas.md
node_compile_hint:
  mode: persona_eligibility_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0125
preserved_exact_tokens:
  - "assistant"
  - "explorer"
  - "bash"
  - "teacher"
negative_constraints:
  - "`explorer` and `bash` cannot be selected as the direct chat Persona."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Personas.md
```

### ACD-273 - Persona Runtime Identity Normalization

```yaml
plan_unit_id: ACD-273
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Chat must normalize assistant-local runtime identity substitutes to canonical
  requested/effective Persona, effective model, account fields,
  `execution_role`, runtime snapshot, projection freshness/health, and
  adapter/account switch reason fields.
gui_related: false
gui_classification_reason: Runtime identity normalization is data-contract behavior.
depends_on: [ACD-270]
unblocks: [ACD-274]
acceptance_criteria:
  - Assistant-local `_id` substitute fields normalize to canonical runtime identity fields.
  - Model, account, execution role, runtime snapshot, projection, and reason fields use their canonical names.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_identity
reasoning_tier: high
context_scope: persona_runtime
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Models_System.md
  - Plans/Provider_OpenCode.md
node_compile_hint:
  mode: persona_runtime_identity_normalization
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0126
preserved_exact_tokens:
  - "requested_persona_id"
  - "effective_persona_id"
  - "active_model"
  - "actual_model"
  - "projection_trust"
negative_constraints:
  - "Chat MUST NOT invent assistant-local substitutes."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-274 - Current Persona Display Fields

```yaml
plan_unit_id: ACD-274
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Current Persona display exposes the canonical requested/effective Persona,
  effective account label, effective model, execution role, projection
  freshness/health, and selection/account-switch reason fields when applicable.
gui_related: true
gui_classification_reason: Current Persona display fields are visible Assistant Chat identity UI.
depends_on: [ACD-273]
unblocks: [ACD-277, ACD-283, ACD-284, ACD-285]
acceptance_criteria:
  - Current Persona display shows requested and effective Persona fields.
  - Current Persona display surfaces effective account, model, execution role, projection, and selection reason fields when applicable.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_display
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: current_persona_display_fields
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0126
preserved_exact_tokens:
  - "requested_persona"
  - "effective_persona"
  - "effective_account_label"
  - "effective_model"
  - "execution_role"
  - "projection_freshness"
  - "projection_health"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-275 - Natural Language Persona Invocation

```yaml
plan_unit_id: ACD-275
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant supports natural-language Persona invocation for requests such as
  `Use Collaborator`, `Be a Rust engineer`, `Answer as a technical writer`,
  `Switch to security auditor`, `Ask Explorer to inspect the repo`, and `Run
  that with Bash`.
gui_related: false
gui_classification_reason: Natural-language Persona invocation is resolver behavior.
depends_on: [ACD-271, ACD-272]
unblocks: [ACD-276, ACD-278]
acceptance_criteria:
  - Natural-language Persona examples resolve through the Persona invocation path.
  - Subagent Persona requests are distinguished from direct-chat Persona requests.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_resolution
reasoning_tier: standard
context_scope: persona_invocation
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Personas.md
node_compile_hint:
  mode: natural_language_persona_invocation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0127
preserved_exact_tokens:
  - "Use Collaborator"
  - "Be a Rust engineer"
  - "Answer as a technical writer"
  - "Switch to security auditor"
  - "Ask Explorer to inspect the repo"
  - "Run that with Bash"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Personas.md
```

### ACD-276 - Persona Override Scope Semantics

```yaml
plan_unit_id: ACD-276
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Persona override scope maps `for this`, `for this answer`, and `right now` to
  turn scope, while `from now on`, `in this chat`, and `for this session` map
  to session scope.
gui_related: false
gui_classification_reason: Persona override scope mapping is command interpretation behavior.
depends_on: [ACD-275]
unblocks: [ACD-277]
acceptance_criteria:
  - Turn-scope phrases resolve to turn-scoped Persona overrides.
  - Session-scope phrases resolve to session-scoped Persona overrides.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_scope
reasoning_tier: standard
context_scope: persona_invocation
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: persona_override_scope_semantics
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0128
preserved_exact_tokens:
  - "for this"
  - "for this answer"
  - "right now"
  - "from now on"
  - "in this chat"
  - "for this session"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-277 - Persona Override Display

```yaml
plan_unit_id: ACD-277
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: UI shows active natural-language Persona overrides and returns to auto display when the override expires.
gui_related: true
gui_classification_reason: Active Persona override display is visible Assistant Chat UI.
depends_on: [ACD-276, ACD-274]
unblocks: []
acceptance_criteria:
  - Active natural-language Persona override state is visible in chat.
  - Expired overrides return the UI to auto Persona display.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_display
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: persona_override_display
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0128
preserved_exact_tokens:
  - "Persona: Collaborator (User requested)"
  - "Persona: Researcher (User requested, session lock)"
  - "Persona: Rust Engineer (Auto: Rust repo + code task)"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-278 - Subagent Persona Invocation Boundary

```yaml
plan_unit_id: ACD-278
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Subagent-only Persona requests route or create child runs when delegation is
  allowed; they do not switch the direct chat Persona, and invalid direct-chat
  requests explain the eligibility constraint with the closest valid route.
gui_related: false
gui_classification_reason: Subagent-only Persona routing is workflow behavior rather than visual presentation.
depends_on: [ACD-272, ACD-275]
unblocks: []
acceptance_criteria:
  - Subagent-only Persona requests do not switch the direct chat Persona.
  - Invalid direct-chat Persona requests explain the eligibility constraint and offer a valid route.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_boundary
reasoning_tier: high
context_scope: subagents
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Personas.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: subagent_persona_invocation_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0128
preserved_exact_tokens:
  - "Ask Explorer"
  - "Run that with Bash"
negative_constraints:
  - "Subagent-only Personas do not become direct chat Personas."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Personas.md
```

### ACD-279 - Persona Alias Resolution

```yaml
plan_unit_id: ACD-279
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Persona invocation resolves through canonical Persona IDs, display names,
  aliases, and normalized natural-language forms, including `rust engineer ->
  rust-engineer`, `tech writer -> technical-writer`, and `collaborator ->
  collaborator`.
gui_related: false
gui_classification_reason: Alias and fuzzy matching are resolver behavior.
depends_on: [ACD-271]
unblocks: [ACD-280, ACD-281, ACD-282, ACD-283]
acceptance_criteria:
  - Persona invocation resolves canonical IDs, display names, aliases, and normalized natural-language forms.
  - The specified example aliases resolve to the expected Persona IDs.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_resolution
reasoning_tier: standard
context_scope: persona_aliases
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Personas.md
node_compile_hint:
  mode: persona_alias_resolution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0129
preserved_exact_tokens:
  - "canonical Persona IDs"
  - "display names"
  - "aliases"
  - "rust engineer -> rust-engineer"
  - "tech writer -> technical-writer"
  - "collaborator -> collaborator"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Personas.md
```

### ACD-280 - Persona Clarification On Ambiguity

```yaml
plan_unit_id: ACD-280
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Ambiguous Persona matches may request clarification; no-match natural-language requests must ask for clarification before starting a run.
gui_related: false
gui_classification_reason: Ambiguous and missing Persona resolution behavior is command/resolver logic.
depends_on: [ACD-279]
unblocks: [ACD-289]
acceptance_criteria:
  - Multiple possible Persona matches may produce clarification.
  - No-match natural-language requests ask for clarification before a run starts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_resolution
reasoning_tier: standard
context_scope: persona_aliases
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Personas.md
node_compile_hint:
  mode: persona_clarification_on_ambiguity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0129
preserved_exact_tokens:
  - "If multiple Personas match"
  - "If no Persona matches"
negative_constraints:
  - "Chat must not silently pretend a Persona request resolved when it did not."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-281 - Manual Persona Picker Validation

```yaml
plan_unit_id: ACD-281
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Manual Persona picker rejects unresolved submissions with inline `Persona not found` validation.
gui_related: true
gui_classification_reason: Manual Persona picker validation is visible GUI behavior.
depends_on: [ACD-279, ACD-283]
unblocks: [ACD-289]
acceptance_criteria:
  - Manual Persona picker rejects unresolved Persona submissions.
  - The inline validation state displays `Persona not found`.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_display
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: manual_persona_picker_validation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0129
preserved_exact_tokens:
  - "Persona not found"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-282 - Persona Unresolved Reference Fallback

```yaml
plan_unit_id: ACD-282
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Persisted unresolved Persona references follow `Plans/Personas.md §2.3`, and chat surfaces that the run proceeds without Persona context.
gui_related: false
gui_classification_reason: Persisted unresolved reference fallback is runtime behavior; the visible disclosure is covered by acceptance.
depends_on: [ACD-279]
unblocks: [ACD-289]
acceptance_criteria:
  - Persisted unresolved Persona references use the `Plans/Personas.md §2.3` fallback contract.
  - Chat surfaces that the run is proceeding without Persona context.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_fallback
reasoning_tier: high
context_scope: persona_runtime
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Personas.md
node_compile_hint:
  mode: persona_unresolved_reference_fallback
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0129
preserved_exact_tokens:
  - "Plans/Personas.md"
  - "§2.3"
  - "without Persona context"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Personas.md
```

### ACD-283 - Chat Persona Controls

```yaml
plan_unit_id: ACD-283
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Chat includes Persona mode selector, effective Persona pill/badge, optional manual Persona picker, selection-reason tooltip or sublabel, effective talkativeness details, and lock/unlock control.
gui_related: true
gui_classification_reason: Persona selectors, badges, picker, tooltip/sublabel, details, and lock controls are visible chat UI.
depends_on: [ACD-271, ACD-274, ACD-279]
unblocks: [ACD-281]
acceptance_criteria:
  - Chat includes Persona mode selector and effective Persona pill/badge.
  - Chat supports optional manual Persona picker and lock/unlock control.
  - Persona details expose selection reason and effective talkativeness when relevant.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_display
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chat_persona_controls
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0130
preserved_exact_tokens:
  - "Auto"
  - "Manual"
  - "Hybrid"
  - "effective Persona pill/badge"
  - "effective talkativeness"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-284 - Subagent Persona Display

```yaml
plan_unit_id: ACD-284
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Inline subagent/child-run blocks show effective Persona name, task label, meaningful selection reason, effective platform, effective model, elapsed time, and skipped unsupported Persona controls when relevant.
gui_related: true
gui_classification_reason: Inline subagent/child-run blocks are visible chat UI.
depends_on: [ACD-272, ACD-274]
unblocks: [ACD-286, ACD-289]
acceptance_criteria:
  - Inline child-run blocks show effective Persona, platform, model, task label, and elapsed time.
  - Inline child-run blocks disclose meaningful selection reasons and skipped unsupported Persona controls when relevant.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: subagent_display
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: subagent_persona_display
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0131
preserved_exact_tokens:
  - "effective Persona name"
  - "task label"
  - "effective platform"
  - "effective model"
  - "elapsed time"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-285 - Requested Effective Runtime Disclosure

```yaml
plan_unit_id: ACD-285
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Chat discloses requested versus effective runtime choice when that distinction affects trust or behavior.
gui_related: true
gui_classification_reason: Requested/effective runtime disclosure is visible chat and child-run UI.
depends_on: [ACD-274]
unblocks: [ACD-286, ACD-287, ACD-288]
acceptance_criteria:
  - Requested versus effective runtime choices are disclosed when they matter to user trust or behavior.
  - Disclosure consumes model/provider owner contracts rather than redefining them.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_disclosure
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Models_System.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Provider_OpenCode.md
node_compile_hint:
  mode: requested_effective_runtime_disclosure
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0132
preserved_exact_tokens:
  - "requested versus effective runtime choice"
  - "ContractName:Plans/Models_System.md"
  - "ContractName:Plans/CLI_Bridged_Providers.md"
  - "ContractName:Plans/Provider_OpenCode.md"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Models_System.md
```

### ACD-286 - Child Run Runtime Disclosure

```yaml
plan_unit_id: ACD-286
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Child-run cards disclose provider/model on hover when collapsed, and expanded panels may show requested/effective runtime surface, effective effort, and fallback reason after remap.
gui_related: true
gui_classification_reason: Hover disclosure and expanded child panels are visible chat UI.
depends_on: [ACD-285, ACD-284]
unblocks: []
acceptance_criteria:
  - Collapsed child-run cards expose provider/model on hover.
  - Expanded child panels may show requested/effective runtime surface, effective effort, and fallback reason when remapped.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_disclosure
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: child_run_runtime_disclosure
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0132
preserved_exact_tokens:
  - "provider/model"
  - "requested versus effective runtime surface"
  - "effective effort"
  - "fallback reason"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-287 - Runtime Fallback Disclosure Constraint

```yaml
plan_unit_id: ACD-287
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Explicit user-chosen runtime surfaces must not silently fallback, and Copilot-native routing restrictions surface as incompatibility or denial rather than a degraded execution path.
gui_related: true
gui_classification_reason: Fallback, incompatibility, and denial disclosure are user-visible trust UI.
depends_on: [ACD-285]
unblocks: []
acceptance_criteria:
  - Explicit user-chosen runtime surfaces disclose fallback instead of silently remapping.
  - Copilot-native routing restrictions surface as incompatibility or denial.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: silent_fallback
reasoning_tier: high
context_scope: runtime
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Provider_OpenCode.md
node_compile_hint:
  mode: runtime_fallback_disclosure_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0132
preserved_exact_tokens:
  - "explicit user-chosen runtime surfaces"
  - "Copilot-native routing restrictions"
negative_constraints:
  - "Explicit user-chosen runtime surfaces must not silently fallback without disclosure."
  - "Copilot-native routing restrictions must not silently degrade into a different execution path."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/CLI_Bridged_Providers.md
```

### ACD-288 - Crew Runtime Surface Disclosure

```yaml
plan_unit_id: ACD-288
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Crew confirmation shows each member as `model -> provider/runtime surface`;
  the crew editor may expose per-member selectors for non-Copilot surfaces,
  while Copilot normalizes the whole crew to a crew-level provider constraint
  with explanation.
gui_related: true
gui_classification_reason: Crew confirmation and crew editor selectors are visible UI.
depends_on: [ACD-285]
unblocks: []
acceptance_criteria:
  - Crew confirmation shows each member as `model -> provider/runtime surface`.
  - Non-Copilot crew surfaces may expose per-member runtime selectors.
  - Selecting Copilot for any member normalizes the whole crew to a crew-level provider constraint with explanation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: crew_runtime_disclosure
reasoning_tier: high
context_scope: crew
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Models_System.md
node_compile_hint:
  mode: crew_runtime_surface_disclosure
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0132
preserved_exact_tokens:
  - "model -> provider/runtime surface"
  - "per-member model selectors"
  - "per-member provider/runtime surface selectors"
  - "Copilot"
negative_constraints:
  - "`Copilot` is not a per-member freely mixed provider in the default crew editor."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-289 - Persona Acceptance Addendum

```yaml
plan_unit_id: ACD-289
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Persona acceptance requires natural-language invocation, auto resolution
  disclosure, current Persona/model/platform visibility, non-default
  `talkativeness` exposure, subagent effective identity display, unresolved
  manual blocking, and clarification/fallback disclosure instead of silent
  wrong-Persona resolution.
gui_related: true
gui_classification_reason: Persona acceptance criteria cover visible chat controls and disclosures.
depends_on: [ACD-274, ACD-275, ACD-280, ACD-281, ACD-282, ACD-283, ACD-284]
unblocks: []
acceptance_criteria:
  - Assistant chat supports explicit natural-language Persona invocation.
  - Auto Persona mode discloses the resolved Persona and reason.
  - Current effective Persona/model/platform is visible in chat.
  - Non-default `talkativeness` and subagent effective identity are displayed.
  - Unresolved manual or natural-language Persona requests block or clarify instead of silently choosing the wrong Persona.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_acceptance
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Personas.md
node_compile_hint:
  mode: persona_acceptance_addendum
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0133
preserved_exact_tokens:
  - "talkativeness"
  - "not a silent wrong-Persona resolution"
negative_constraints:
  - "Natural-language Persona requests that do not resolve to a single reliable match must not produce silent wrong-Persona resolution."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-290 - Mermaid Inline Visualizer Split

```yaml
plan_unit_id: ACD-290
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Chat and planning surfaces support both Mermaid and the broader inline visualizer as distinct contracts.
gui_related: true
gui_classification_reason: Mermaid and inline visualizer rendering are user-visible chat and planning surfaces.
depends_on: []
unblocks: [ACD-291]
acceptance_criteria:
  - Chat and planning surfaces support Mermaid rendering.
  - Chat and planning surfaces support inline visualizer rendering as a distinct contract.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: visualizer_boundary
reasoning_tier: standard
context_scope: rendering
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: mermaid_inline_visualizer_split
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0134
preserved_exact_tokens:
  - "Mermaid"
  - "inline visualizer"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-291 - Visualizer Widget Taxonomy

```yaml
plan_unit_id: ACD-291
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Mermaid remains the fenced-diagram path; inline visualizer is a separate
  sandboxed HTML/SVG module; neither path owns hidden mutable state; message
  widget taxonomy keeps code blocks, diff/operation cards, Mermaid/native
  diagram cards, question cards, and `inline visual module` distinct.
gui_related: true
gui_classification_reason: Message widget taxonomy and renderer split are visible surface behavior.
depends_on: [ACD-290]
unblocks: [ACD-292, ACD-294]
acceptance_criteria:
  - Mermaid and inline visualizer rendering paths remain distinct.
  - Neither rendering path owns hidden mutable state outside durable source or metadata refs.
  - The inline visual module remains distinct from code blocks, diff cards, Mermaid/native diagram cards, and question cards.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: renderer_taxonomy
reasoning_tier: high
context_scope: rendering
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: visualizer_widget_taxonomy
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0135
preserved_exact_tokens:
  - "plain code blocks"
  - "diff/operation cards"
  - "Mermaid/native diagram cards"
  - "question cards"
  - "inline visual module"
negative_constraints:
  - "The inline visual module is not a Mermaid/native diagram card, not a plain code block, and not a diff/operation card."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-292 - Inline Visual Module Iframe Path

```yaml
plan_unit_id: ACD-292
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The Inline HTML/JS Visual Module is a sandboxed iframe rendering path for
  agent-generated HTML/JS/CSS used for data visualizations, interactive
  diagrams, and custom UI beyond Mermaid/code-block capabilities.
gui_related: true
gui_classification_reason: Inline visual modules render user-visible visual artifacts.
depends_on: [ACD-291]
unblocks: [ACD-293, ACD-295, ACD-296, ACD-298, ACD-299]
acceptance_criteria:
  - Inline HTML/JS Visual Module renders inside a sandboxed iframe.
  - The module supports visualizations and interactive artifacts that exceed Mermaid/code-block capabilities.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: visualizer_security
reasoning_tier: high
context_scope: rendering
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: inline_visual_module_iframe_path
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0136
preserved_exact_tokens:
  - "Inline HTML/JS Visual Module"
  - "sandboxed iframe"
  - "agent-generated HTML/JS/CSS"
  - "Plans/FinalGUISpec.md#15.6 Mermaid and inline visualizer widgets"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-293 - Inline Visualizer Sandbox Policy

```yaml
plan_unit_id: ACD-293
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Inline visualizer iframes use explicit sandbox policy closed by default: MVP
  minimum is `sandbox='allow-scripts'`; `allow-same-origin`, `allow-forms`,
  `allow-popups`, and `allow-top-navigation` are denied; `postMessage` is the
  only cross-boundary bridge.
gui_related: false
gui_classification_reason: Sandbox policy is a security/runtime constraint.
depends_on: [ACD-292]
unblocks: [ACD-295, ACD-300]
acceptance_criteria:
  - Inline visualizer iframes set an explicit sandbox token set.
  - MVP sandbox minimum is `sandbox='allow-scripts'`.
  - Denied sandbox tokens remain denied.
  - Cross-boundary communication uses `postMessage` only.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: visualizer_security
reasoning_tier: high
context_scope: sandbox
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: inline_visualizer_sandbox_policy
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0136
preserved_exact_tokens:
  - "sandbox=\"allow-scripts\""
  - "sandbox='allow-scripts'"
  - "allow-same-origin"
  - "allow-forms"
  - "allow-popups"
  - "allow-top-navigation"
  - "postMessage"
negative_constraints:
  - "`allow-same-origin`, `allow-forms`, `allow-popups`, and `allow-top-navigation` are explicitly DENIED."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-294 - Message Flow Sanitizer Boundary

```yaml
plan_unit_id: ACD-294
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Non-iframe Markdown, Mermaid, HTML, and SVG rendering uses the current
  rendering contract until a dedicated `Plans/security-sanitization.md` owner
  exists, with DOMPurify `DEFAULT_ALLOWED_TAGS` safe subset and approved URL
  attributes only.
gui_related: false
gui_classification_reason: Sanitizer ownership and allowlist behavior are security/runtime constraints.
depends_on: [ACD-291]
unblocks: []
acceptance_criteria:
  - Non-iframe rendering uses the current rendering contract until a dedicated sanitizer owner exists.
  - Message-flow rendering uses DOMPurify `DEFAULT_ALLOWED_TAGS` plus approved URL-bearing attributes only.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: sanitization
reasoning_tier: high
context_scope: rendering_security
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: message_flow_sanitizer_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0136
preserved_exact_tokens:
  - "Plans/security-sanitization.md"
  - "DOMPurify"
  - "DEFAULT_ALLOWED_TAGS"
negative_constraints:
  - "Raw `<script>`, `<iframe>`, `<object>`, `<embed>`, and `<style>` with external URL references are denied in message-flow rendering."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-295 - Visualizer Host Bridge Surface

```yaml
plan_unit_id: ACD-295
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Visualizer host bridge exposes only async-safe `sendPrompt`, `openLink`, `copyToClipboard`, and `requestResize`; question-flow visuals omit `sendPrompt` and use the narrowed PM-managed question-draft bridge.
gui_related: false
gui_classification_reason: Host bridge method surface is runtime/API behavior.
depends_on: [ACD-292, ACD-293]
unblocks: [ACD-297, ACD-299]
acceptance_criteria:
  - Visualizer host bridge exposes only the specified async-safe calls.
  - Question-flow embedded visuals do not receive `sendPrompt`.
  - Question-flow embedded visuals write draft answers only through the narrowed question bridge.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: visualizer_bridge
reasoning_tier: high
context_scope: bridge
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: visualizer_host_bridge_surface
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0136
preserved_exact_tokens:
  - "sendPrompt(text: string): void"
  - "openLink(url: string, target?: \"_blank\" | \"_self\"): void"
  - "copyToClipboard(text: string): Promise<boolean>"
  - "requestResize(width?: number, height?: number): void"
negative_constraints:
  - "Question-flow embedded visual modules omit `sendPrompt` from the bridge."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-296 - Visualizer Theme Token Injection

```yaml
plan_unit_id: ACD-296
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Visualizer theme-token injection is locked to CSS custom properties injected
  through inline `style`, with MVP tokens `--pm-viz-bg`, `--pm-viz-fg`,
  `--pm-viz-accent`, `--pm-viz-border`, `--pm-viz-font-family`, and
  `--pm-viz-font-size`.
gui_related: true
gui_classification_reason: Theme-token injection controls visible visualizer styling.
depends_on: [ACD-292]
unblocks: [ACD-297]
acceptance_criteria:
  - Visualizer theme tokens are injected as CSS custom properties through inline `style`.
  - Visualizer fragments consume the MVP token set.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: visualizer_theme
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: visualizer_theme_token_injection
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0136
preserved_exact_tokens:
  - "Decision #10"
  - "--pm-viz-bg"
  - "--pm-viz-fg"
  - "--pm-viz-accent"
  - "--pm-viz-border"
  - "--pm-viz-font-family"
  - "--pm-viz-font-size"
negative_constraints:
  - "Visualizer fragments must not hardcode replacement colors."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-297 - Visualizer Bridge Host Semantics

```yaml
plan_unit_id: ACD-297
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Bridge calls preserve host semantics for `sendPrompt`, dual-context question
  routing, `openLink` routing through `cmd.browser.open_detached_preview` or
  system browser, theme updates on mount/change, and resize telemetry `{ height:
  px }`.
gui_related: false
gui_classification_reason: Bridge host semantics are integration/runtime behavior.
depends_on: [ACD-295, ACD-296]
unblocks: []
acceptance_criteria:
  - "`sendPrompt(text)` routes to active thread composer outside question-flow contexts."
  - Questionnaire-active `sendPrompt` calls route as question answers.
  - "`openLink(url)` routes through detached preview or system browser according to target."
  - Theme and resize bridge behavior follows host semantics.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: visualizer_bridge
reasoning_tier: high
context_scope: bridge
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: visualizer_bridge_host_semantics
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0136
preserved_exact_tokens:
  - "sendPrompt(text)"
  - "cmd.browser.open_detached_preview"
  - "{ height: px }"
negative_constraints:
  - "Question-flow visuals cannot bypass PM draft state by queueing chat messages."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-298 - Open Webui Visualizer Lineage Disposition

```yaml
plan_unit_id: ACD-298
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  `Classic298/open-webui-plugins` and `/open-webui-plugins` remain
  reference-only lineage; PM names the live surface inline visual module and
  treats `/catalog`, folder-based `SKILL.md`, `/discovery/runtime`, and
  `/preview/editor` as owner-consumed import/editor concepts, not visualizer
  authority.
gui_related: false
gui_classification_reason: The open-webui references are source-lineage and authority disposition.
depends_on: [ACD-292]
unblocks: []
acceptance_criteria:
  - Open-webui plugin references remain lineage only.
  - PM names the live surface inline visual module.
  - Catalog, skill, discovery, and preview/editor concepts are owner-consumed imports rather than visualizer authority.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: stale_lineage
reasoning_tier: high
context_scope: compatibility
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: open_webui_visualizer_lineage_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0136
preserved_exact_tokens:
  - "Classic298/open-webui-plugins"
  - "/open-webui-plugins"
  - "/catalog"
  - "SKILL.md"
  - "/discovery/runtime"
  - "/preview/editor"
negative_constraints:
  - "Reference-only lineage must not become visualizer authority."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-299 - Inline Visual Module Controls And Source

```yaml
plan_unit_id: ACD-299
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Inline visual modules support interactive `/controls`, local visual-state
  `/queues`, `/diagrams/explainers`, host-mediated `/auto-resize`, and
  source/copy/export metadata behind the visual-module contract.
gui_related: true
gui_classification_reason: Inline visual module controls, diagrams, resize, and source actions are user-visible artifact UI.
depends_on: [ACD-292, ACD-295]
unblocks: []
acceptance_criteria:
  - Inline visual modules support interactive controls, local visual queues, diagram explainers, and host-mediated auto-resize.
  - Source, copy, export, and generated-asset metadata stay behind the visual-module contract.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: visualizer_controls
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: inline_visual_module_controls_source
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0136
preserved_exact_tokens:
  - "/controls"
  - "/queues"
  - "/diagrams/explainers"
  - "/auto-resize"
  - "Copy source"
  - "Open in editor"
  - "Open detached preview"
  - "Export diagram"
negative_constraints:
  - "Visualizer source handling must not inject raw controls into the main chat DOM."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-300 - Visualizer Library Network Constraint

```yaml
plan_unit_id: ACD-300
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Visualizer third-party `/library` code is allowed only when policy allows and
  must be bundled, version-pinned, and integrity-recorded; arbitrary external
  network loads are denied; the visualizer is not limited to `/questions` and
  is not accessibility-only fallback.
gui_related: false
gui_classification_reason: Third-party library and network policy are security/runtime constraints.
depends_on: [ACD-293]
unblocks: []
acceptance_criteria:
  - Third-party visualizer library code is allowed only when policy allows it.
  - Allowed third-party code is bundled, version-pinned, and integrity-recorded.
  - Arbitrary external network loads are denied.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: visualizer_security
reasoning_tier: high
context_scope: sandbox
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: visualizer_library_network_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0136
preserved_exact_tokens:
  - "/library"
  - "/questions"
  - "Arbitrary external network loads are denied"
negative_constraints:
  - "Arbitrary external network loads are denied."
  - "The visualizer is not limited to `/questions`, and it is not an accessibility-only fallback path."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-301 - Natural Language Mode And Wizard Escalation Scope

```yaml
plan_unit_id: ACD-301
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Natural-language mode invocation and wizard escalation define how chat resolves workflow identity, runtime posture, and Planning Wizard escalation.
gui_related: false
gui_classification_reason: This scope statement defines behavior and escalation ownership.
depends_on: []
unblocks: [ACD-302, ACD-306, ACD-308]
acceptance_criteria:
  - Natural-language mode invocation resolves workflow identity and runtime posture separately.
  - Wizard escalation behavior is defined for Assistant Chat and Deep Plan.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: mode_invocation
reasoning_tier: standard
context_scope: modes
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: natural_language_mode_wizard_escalation_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0137
preserved_exact_tokens:
  - "Natural-language mode invocation"
  - "Wizard Escalation"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-302 - Mode Invocation Runtime Fields

```yaml
plan_unit_id: ACD-302
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Natural-language mode invocation records requested/effective overlay, requested/effective runtime mode, requested/effective plan thoroughness, selection source/reason, and override scope.
gui_related: false
gui_classification_reason: Mode invocation field records are runtime data-contract behavior.
depends_on: [ACD-301]
unblocks: [ACD-303, ACD-314]
acceptance_criteria:
  - Mode invocation records requested and effective mode overlay fields.
  - Mode invocation records requested and effective runtime mode and Plan Thoroughness fields.
  - Selection source, selection reason, and override scope are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: mode_invocation
reasoning_tier: high
context_scope: modes
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
  - Plans/Contracts_V0.md
  - Plans/Run_Modes.md
node_compile_hint:
  mode: mode_invocation_runtime_fields
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0138
preserved_exact_tokens:
  - "requested_mode_overlay"
  - "effective_mode_overlay"
  - "requested_runtime_mode"
  - "effective_runtime_mode"
  - "requested_plan_thoroughness"
  - "effective_plan_thoroughness"
  - "selection_source"
  - "selection_reason"
  - "override_scope"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
```

### ACD-303 - Mode Overlay Enum Closure

```yaml
plan_unit_id: ACD-303
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Mode overlays are closed to `none`, `plan`, `deep_plan`, `debug`,
  `interview`, `brainstorm`, and `crew`; runtime mode is closed by
  `Plans/Run_Modes.md`; `deep_plan` survives normalization through overlay
  fields.
gui_related: false
gui_classification_reason: Enum closure and normalization are runtime contract constraints.
depends_on: [ACD-302]
unblocks: [ACD-304]
acceptance_criteria:
  - Mode overlay values are limited to the canonical closed enum.
  - Runtime mode values are limited to `Plans/Run_Modes.md` postures.
  - "`deep_plan` survives normalization through overlay fields."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: mode_invocation
reasoning_tier: high
context_scope: modes
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: mode_overlay_enum_closure
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0138
preserved_exact_tokens:
  - "none"
  - "plan"
  - "deep_plan"
  - "debug"
  - "interview"
  - "brainstorm"
  - "crew"
negative_constraints:
  - "`deep_plan` MUST survive normalization through the overlay fields and MUST NOT be discarded from historical/runtime records simply because the runtime posture is planning."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
```

### ACD-304 - Natural Language Mode Resolution

```yaml
plan_unit_id: ACD-304
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Natural-language requests resolve deterministically: ask/read-only phrases map
  to overlay `none` plus runtime `ask`; plan phrases map to overlay `plan` plus
  runtime `plan`; deep-plan phrases map to overlay `deep_plan` plus runtime
  `plan`; agent phrases clear planning overlays and preserve explicit permission
  posture.
gui_related: false
gui_classification_reason: Natural-language mode resolution is command/resolver behavior.
depends_on: [ACD-303]
unblocks: [ACD-305, ACD-314]
acceptance_criteria:
  - Ask/read-only phrases resolve to overlay `none` and runtime `ask`.
  - Plan phrases resolve to overlay `plan` and runtime `plan`.
  - Deep Plan phrases resolve to overlay `deep_plan` and runtime `plan`.
  - Agent mode requests clear planning overlays and preserve explicit permission posture.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: mode_invocation
reasoning_tier: high
context_scope: modes
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: natural_language_mode_resolution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0138
preserved_exact_tokens:
  - "use ask mode"
  - "don't edit"
  - "just inspect"
  - "use plan mode"
  - "use deep plan"
  - "use agent mode"
  - "regular"
  - "yolo"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
```

### ACD-305 - Mode Compact Display Labels

```yaml
plan_unit_id: ACD-305
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Compact visible labels derive from effective overlay plus runtime posture so labels may remain `Ask`, `Agent`, `Plan`, or `Deep Plan`.
gui_related: true
gui_classification_reason: Compact mode labels are visible Assistant Chat UI.
depends_on: [ACD-304]
unblocks: []
acceptance_criteria:
  - Compact display labels derive from effective overlay plus runtime posture.
  - Visible labels may be Ask, Agent, Plan, or Deep Plan.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: mode_display
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: mode_compact_display_labels
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0138
preserved_exact_tokens:
  - "Ask"
  - "Agent"
  - "Plan"
  - "Deep Plan"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-306 - Assistant Planning Wizard Recommendation

```yaml
plan_unit_id: ACD-306
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Assistant chat recommends Planning Wizard when feature, substantial enhancement, major refactor/change, broad scope, open questions, or Deep Plan output suggests planning-workspace scoping and orchestrator follow-through would help.
gui_related: false
gui_classification_reason: Recommendation trigger detection is workflow behavior; CTA display is covered separately.
depends_on: [ACD-301]
unblocks: [ACD-307, ACD-308, ACD-314]
acceptance_criteria:
  - Assistant chat detects feature, enhancement, major change, and major refactor requests as Planning Wizard recommendation candidates.
  - Broad scope, many open questions, or large plan size may trigger recommendation.
  - Deep Plan output may trigger recommendation when interview scoping or orchestrator follow-through would help.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wizard_escalation
reasoning_tier: standard
context_scope: wizard_handoff
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: assistant_planning_wizard_recommendation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0139
preserved_exact_tokens:
  - "add a feature"
  - "major enhancement"
  - "big change"
  - "large refactor"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
```

### ACD-307 - Planning Wizard Recommendation CTA

```yaml
plan_unit_id: ACD-307
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Planning Wizard recommendation is a CTA, not an automatic redirect; the user may accept or decline, and declining keeps the user in chat with no hidden workflow switch.
gui_related: true
gui_classification_reason: Recommendation CTA and accept/decline behavior are visible user-facing flow.
depends_on: [ACD-306]
unblocks: [ACD-309]
acceptance_criteria:
  - Planning Wizard recommendation appears as a CTA.
  - The user may accept or decline the recommendation.
  - Declining keeps the user in chat without a hidden workflow switch.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wizard_escalation
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: planning_wizard_recommendation_cta
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0139
preserved_exact_tokens:
  - "CTA"
  - "not an automatic redirect"
negative_constraints:
  - "Declining keeps the user in chat with no hidden workflow switch."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-308 - Deep Planning Wizard Escalation Evaluation

```yaml
plan_unit_id: ACD-308
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Deep Plan performs a final wizard-escalation evaluation before defaulting to
  chat execution and recommends Planning Wizard when work spans several domains,
  has unresolved material questions, reads like a feature spec, or should
  produce orchestrator-ready artifacts.
gui_related: false
gui_classification_reason: Deep Plan escalation evaluation is planning workflow behavior.
depends_on: [ACD-301, ACD-306]
unblocks: [ACD-309, ACD-314]
acceptance_criteria:
  - Deep Plan performs a final wizard-escalation evaluation before chat execution.
  - Deep Plan recommends Planning Wizard for multi-domain, unresolved, spec-like, or artifact-producing work.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wizard_escalation
reasoning_tier: high
context_scope: deep_plan
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: deep_planning_wizard_escalation_evaluation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0140
preserved_exact_tokens:
  - "Deep Plan MUST perform"
  - "orchestrator-ready project artifacts"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
```

### ACD-309 - Planning Wizard Handoff Bundle

```yaml
plan_unit_id: ACD-309
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Accepting a recommendation launches Planning Wizard / Interview with a structured
  handoff bundle containing source, reason, origin IDs, project context,
  `default_intent = EnhanceRewriteAdd`, user goal, summaries, GUI hint, plan
  refs, todos, open questions, assumptions, and `chat_excerpt_refs[]`.
gui_related: false
gui_classification_reason: Handoff bundle schema is integration data behavior.
depends_on: [ACD-307, ACD-308]
unblocks: [ACD-310, ACD-311, ACD-312]
acceptance_criteria:
  - Accepting a recommendation launches Planning Wizard / Interview with a structured handoff bundle.
  - The handoff bundle carries source, reason, origin, project, goal, summary, GUI hint, plan, TODO, question, assumption, and excerpt references.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wizard_handoff
reasoning_tier: high
context_scope: handoff
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: planning_wizard_handoff_bundle
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0141
preserved_exact_tokens:
  - "handoff_source"
  - "handoff_reason"
  - "origin_thread_id"
  - "origin_message_id"
  - "default_intent = EnhanceRewriteAdd"
  - "has_gui_hint"
  - "chat_excerpt_refs[]"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
```

### ACD-310 - Chat Excerpt Reference Lineage

```yaml
plan_unit_id: ACD-310
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  `chat_excerpt_refs[]` are bounded lineage pointers with `thread_id`,
  `message_id`, optional `range_ref`, `excerpt_role`, and `redaction_state`;
  they are not copied transcript authority and resolve through canonical
  thread/message storage.
gui_related: false
gui_classification_reason: Chat excerpt references are lineage and storage behavior.
depends_on: [ACD-309]
unblocks: [ACD-311]
acceptance_criteria:
  - "`chat_excerpt_refs[]` identify bounded source excerpts by canonical pointer fields."
  - Excerpt references are lineage pointers, not copied transcript authority.
  - Wizard resolves excerpt references through canonical thread/message storage.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: handoff_lineage
reasoning_tier: high
context_scope: handoff
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chat_excerpt_reference_lineage
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0141
preserved_exact_tokens:
  - "chat_excerpt_refs[]"
  - "thread_id"
  - "message_id"
  - "range_ref"
  - "excerpt_role"
  - "redaction_state"
negative_constraints:
  - "`chat_excerpt_refs[]` entries are lineage pointers, not copied transcript authority."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-311 - Wizard Handoff Visibility And Audit

```yaml
plan_unit_id: ACD-311
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Imported handoff context remains visible and auditable; imported plans become wizard/interviewer context rather than immediate executable artifacts, and the launch audit trail is preserved.
gui_related: true
gui_classification_reason: Imported context visibility and audit trail are user-facing handoff behavior.
depends_on: [ACD-309, ACD-310]
unblocks: [ACD-314]
acceptance_criteria:
  - Imported handoff context is visible to the user.
  - Imported plans become wizard/interviewer context rather than immediate executable artifacts.
  - Handoff preserves an audit trail from Assistant Chat / Deep Plan.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: handoff_visibility
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: wizard_handoff_visibility_audit
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0141
preserved_exact_tokens:
  - "imported context"
  - "visible"
  - "audit trail"
negative_constraints:
  - "Imported context must be visible to the user; it must not be hidden system state."
  - "The imported plan is not an immediate executable artifact."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-312 - Wizard Launch Context Routing

```yaml
plan_unit_id: ACD-312
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Wizard launch opens preloaded `EnhanceRewriteAdd` when project/path context
  exists, or preserves imported context and lands on project-setup review first
  when required project context is missing.
gui_related: true
gui_classification_reason: Wizard launch path and project-setup review landing are visible workflow UI.
depends_on: [ACD-309]
unblocks: [ACD-313, ACD-314]
acceptance_criteria:
  - Threads with active project/path open the preloaded `EnhanceRewriteAdd` flow.
  - Threads missing required project context preserve imported context and land on project-setup review first.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wizard_launch
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: wizard_launch_context_routing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0142
preserved_exact_tokens:
  - "EnhanceRewriteAdd"
  - "project-setup review path"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-313 - Wizard Imported Context Before Interview

```yaml
plan_unit_id: ACD-313
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The interviewer must not start cold: imported context is available before the
  first question, imported plan context may be opened, and the mandatory scope
  probe still runs without bypassing phase 0.
gui_related: false
gui_classification_reason: Interview start-state and phase gating are workflow constraints.
depends_on: [ACD-312]
unblocks: []
acceptance_criteria:
  - Imported context is available before the first interview question.
  - Imported plans may be opened as additional interviewer context.
  - Mandatory scope probe still runs and imported context does not bypass phase 0.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wizard_launch
reasoning_tier: high
context_scope: interview
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: wizard_imported_context_before_interview
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0142
preserved_exact_tokens:
  - "The interviewer must not start cold"
  - "mandatory scope probe"
  - "phase 0"
negative_constraints:
  - "Imported context does not bypass phase 0."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
```

### ACD-314 - Mode And Wizard Acceptance

```yaml
plan_unit_id: ACD-314
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Acceptance requires natural-language Ask/Plan/Deep Plan resolution, wizard
  recommendation from chat and Deep Plan, imported assistant context/plan
  artifact handoff, visible/auditable handoff, and no silent repo-file creation.
gui_related: true
gui_classification_reason: Acceptance includes visible mode resolution, recommendation, and handoff behavior.
depends_on: [ACD-302, ACD-304, ACD-306, ACD-308, ACD-311, ACD-312]
unblocks: []
acceptance_criteria:
  - Ask, Plan, and Deep Plan are reachable through natural-language requests.
  - Assistant chat and Deep Plan can recommend Planning Wizard when appropriate.
  - Accepting a recommendation opens Planning Wizard / Interview with imported assistant context and plan artifact references when present.
  - Handoff remains visible/auditable and does not silently create a repo file.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: mode_wizard_acceptance
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: mode_wizard_acceptance
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0143
preserved_exact_tokens:
  - "Ask mode"
  - "Plan"
  - "Deep Plan"
  - "does not silently create a repo file"
negative_constraints:
  - "The imported handoff remains visible/auditable and does not silently create a repo file."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-315 - Blocked State Compatibility Disposition

```yaml
plan_unit_id: ACD-315
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Canonical thread blocked surfaces reuse the shared blocked packet instead of
  local ask-flow tuples; earlier overlapping blocked-state addenda are
  historical transfer notes and not peer recovery guidance.
gui_related: false
gui_classification_reason: Blocked-state compatibility disposition concerns canonical packet ownership and retired local tuples.
depends_on: []
unblocks: [ACD-316, ACD-317]
acceptance_criteria:
  - Thread blocked surfaces reuse the shared blocked packet.
  - Earlier overlapping blocked-state addenda remain historical transfer notes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_state
reasoning_tier: high
context_scope: compatibility
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: blocked_state_compatibility_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0144
preserved_exact_tokens:
  - "shared blocked packet"
  - "local ask-flow tuples"
  - "historical transfer notes"
negative_constraints:
  - "Earlier overlapping blocked-state addenda must not be read as peer recovery guidance."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-316 - Blocked Packet Required Fields

```yaml
plan_unit_id: ACD-316
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: The shared blocked packet required fields are `blocked_notice`, `blocked_sequence`, `approval_scope_key`, and `allowed_action_ids[]`.
gui_related: false
gui_classification_reason: Blocked packet field requirements are data-contract behavior.
depends_on: [ACD-315]
unblocks: [ACD-317]
acceptance_criteria:
  - Shared blocked packets include `blocked_notice`.
  - Shared blocked packets include `blocked_sequence`, `approval_scope_key`, and `allowed_action_ids[]`.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_state
reasoning_tier: high
context_scope: blocked_packet
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: blocked_packet_required_fields
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0144
preserved_exact_tokens:
  - "blocked_notice"
  - "blocked_sequence"
  - "approval_scope_key"
  - "allowed_action_ids[]"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Executor_Protocol.md
```

### ACD-317 - Blocked Episode Display

```yaml
plan_unit_id: ACD-317
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Each `blocked_notice` renders as its own system message;
  `validation_blocked` and `remediation_ceiling_exceeded` remain ordinary
  blocked taxonomy members; chat buttons render from ordered
  `allowed_action_ids[]`; resolving one blocked episode does not collapse
  siblings.
gui_related: true
gui_classification_reason: Blocked notices, system messages, and action buttons are visible chat UI.
depends_on: [ACD-316]
unblocks: []
acceptance_criteria:
  - Each blocked notice renders as its own system message.
  - Blocked taxonomy members stay ordinary taxonomy members.
  - Chat action buttons render from ordered `allowed_action_ids[]`.
  - Resolving one blocked episode does not collapse sibling blocked episodes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_state
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: blocked_episode_display
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0145
preserved_exact_tokens:
  - "blocked_notice"
  - "validation_blocked"
  - "remediation_ceiling_exceeded"
  - "allowed_action_ids[]"
negative_constraints:
  - "Resolving one blocked episode does not collapse sibling blocked episodes."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-318 - Worktrees In Assistant Scope

```yaml
plan_unit_id: ACD-318
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Worktrees in Assistant covers the W.1-W.17 thread-level worktree binding
  feature: chat header worktree button, thread selector icon, merge-back flow,
  pre-merge test gate, lifecycle, data model, events, commands, settings, and
  errors.
gui_related: true
gui_classification_reason: Worktree button, thread selector icon, merge-back flow, and related errors are visible Assistant Chat UI.
depends_on: []
unblocks: [ACD-319]
acceptance_criteria:
  - Assistant worktree scope covers W.1-W.17 thread-level worktree binding.
  - Scope includes header/thread selector UI, merge-back, pre-merge test gate, lifecycle, data model, events, commands, settings, and error handling.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_assistant
reasoning_tier: high
context_scope: worktrees
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
  - Plans/GitHub_Integration.md
  - Plans/storage-plan.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: worktrees_in_assistant_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0146
preserved_exact_tokens:
  - "W.1-W.17"
  - "thread-level worktree binding"
  - "pre-merge test gate"
  - "ContractName:Plans/WorktreeGitImprovement.md"
  - "ContractName:Plans/GitHub_Integration.md"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
```

### ACD-319 - Source Control Worktree Ownership Boundary

```yaml
plan_unit_id: ACD-319
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Assistant chat deep-links into Source Control without owning accordion layout; Source Control owns the Worktrees row layout and filters Assistant links to.
gui_related: false
gui_classification_reason: This unit defines Assistant as a Source Control consumer, not the UI layout owner.
depends_on: [ACD-318]
unblocks: [ACD-320, ACD-321]
acceptance_criteria:
  - Assistant chat deep-links into Source Control.
  - Source Control retains ownership of accordion layout, Worktrees row layout, and filters.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary
reasoning_tier: high
context_scope: source_control
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
  - Plans/GitHub_Integration.md
node_compile_hint:
  mode: source_control_worktree_ownership_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0147
preserved_exact_tokens:
  - "Source Control consumer state"
  - "without owning its accordion layout"
  - "Source Control owns the Worktrees row layout"
negative_constraints:
  - "Assistant Chat does not own Source Control accordion layout."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
```

### ACD-320 - Source Control Accordion State

```yaml
plan_unit_id: ACD-320
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Per-project Source Control accordion open/close state persists at
  `config:project:{pid}:source_control.accordion_state` using the JSON shape `{
  "Changes": true, "Worktrees": false, "Branches/Stash": false, "History":
  false, "Graph": false }`, and inline diagnostics may render the same object.
gui_related: false
gui_classification_reason: Accordion state persistence is storage/config behavior.
depends_on: [ACD-319]
unblocks: [ACD-321]
acceptance_criteria:
  - Source Control accordion open/close state persists per project at the specified config key.
  - Persisted accordion state uses the specified JSON shape.
  - Inline diagnostics may render the same persisted object.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: source_control_state
reasoning_tier: standard
context_scope: source_control
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: source_control_accordion_state
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0147
preserved_exact_tokens:
  - "config:project:{pid}:source_control.accordion_state"
  - "{\"Changes\": true, \"Worktrees\": false, \"Branches/Stash\": false, \"History\": false, \"Graph\": false}"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-321 - Source Control Worktree Filter State

```yaml
plan_unit_id: ACD-321
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Source Control section order is Changes, Worktrees, Branches/Stash, History,
  Graph; scroll position is not persisted; each project state is independent;
  expanded sections may scroll internally while the outer accordion scrolls;
  Worktrees filter is `All | Threads | Orchestrator | Manual`, persists as
  `worktree_filter`, defaults to `All`, and is not shared across projects.
gui_related: true
gui_classification_reason: Source Control section order, scrolling, and Worktrees filter are visible UI behavior.
depends_on: [ACD-319, ACD-320]
unblocks: []
acceptance_criteria:
  - Source Control sections use the fixed order Changes, Worktrees, Branches/Stash, History, Graph.
  - Scroll position is not persisted and each project's accordion state remains independent.
  - Worktrees filter options, persistence key, default, and per-project scope match the source contract.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: source_control_state
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: source_control_worktree_filter_state
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0147
preserved_exact_tokens:
  - "Changes, Worktrees, Branches/Stash, History, Graph"
  - "All | Threads | Orchestrator | Manual"
  - "config:project:{pid}:source_control.worktree_filter"
  - "worktree_filter"
  - "All"
negative_constraints:
  - "User reordering is outside MVP."
  - "Worktrees filter state is not shared across projects."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-322 - Worktree Header Button Placement

```yaml
plan_unit_id: ACD-322
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Chat header appends the Worktree button after Reasoning/effort; mode buttons
  remain separate; the button is visible in Ask, Agent, Debug, Plan, and Deep
  Plan and hidden when the active project has no git repository.
gui_related: true
gui_classification_reason: Chat header placement, visibility, and mode presentation are visible Assistant Chat UI.
depends_on: [ACD-318]
unblocks: [ACD-323]
acceptance_criteria:
  - The Worktree button appears after the Reasoning/effort control in the chat header strip.
  - Mode buttons remain separate from the header strip and are not adjacent to the Worktree button.
  - The button is visible in Ask, Agent, Debug, Plan, and Deep Plan and hidden when no git repository is active.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_header_ui
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: worktree_header_button_placement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0148
preserved_exact_tokens:
  - "Reasoning/effort"
  - "Ask"
  - "Agent"
  - "Debug"
  - "Plan"
  - "Deep Plan"
negative_constraints:
  - "Mode buttons are separate from the header strip and not adjacent to this button."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-323 - Worktree Header Icon States

```yaml
plan_unit_id: ACD-323
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Worktree header icon states are unbound, bound clean, bound dirty, and bound conflict, using theme tokens and compact overflow behavior.
gui_related: true
gui_classification_reason: Worktree icon states, colors, indicators, tooltips, and overflow behavior are visible UI.
depends_on: [ACD-322]
unblocks: [ACD-324, ACD-341]
acceptance_criteria:
  - Unbound, bound clean, bound dirty, and bound conflict icon states render with the specified tooltips and indicators.
  - Icon colors resolve through theme tokens rather than hardcoded hex values.
  - Accessibility announcements and compact overflow behavior match the source span.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_header_ui
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: worktree_header_icon_states
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0148
preserved_exact_tokens:
  - "No worktree — click to create"
  - "icon-secondary"
  - "accent-warning"
  - "accent-error"
  - "dirty_state"
  - "conflict_state"
  - "aria-live=\"polite\""
negative_constraints:
  - "Icon colors must not use hardcoded hex values."
  - "Narrow controls degrade to icon-only controls rather than wrapping text into the compact chat header."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-324 - Worktree Dropdown Rows

```yaml
plan_unit_id: ACD-324
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Worktree dropdown rows differ for unbound and bound states, including `None`,
  `Create Worktree…`, branch/path/status info, `Unbind`, `Merge into Base…`,
  `Create PR…`, and destructive `Remove Worktree`.
gui_related: true
gui_classification_reason: Worktree dropdown rows and actions are visible chat header UI.
depends_on: [ACD-323]
unblocks: [ACD-325, ACD-331]
acceptance_criteria:
  - The unbound dropdown shows `None` and `Create Worktree…`.
  - The bound dropdown shows branch name, path, status, `Unbind`, `Merge into Base…`, `Create PR…`, and destructive `Remove Worktree`.
  - Info labels and status pills have no action.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_header_ui
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: worktree_dropdown_rows
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0148
preserved_exact_tokens:
  - "None"
  - "Create Worktree…"
  - "Unbind"
  - "Merge into Base…"
  - "Create PR…"
  - "Remove Worktree"
negative_constraints:
  - "Dropdown info labels have no action."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### ACD-325 - Worktree Binding Change Rules

```yaml
plan_unit_id: ACD-325
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Binding changes apply to the next turn; in-flight turns make the dropdown
  read-only; `Unbind` sets binding to None; `Remove Worktree` calls
  `WorktreeManager::remove_worktree` and is blocked when an active run exists.
gui_related: true
gui_classification_reason: Dropdown read-only and blocked-action behavior are visible chat UI states.
depends_on: [ACD-324]
unblocks: [ACD-326, ACD-343]
acceptance_criteria:
  - Binding changes apply only to the next turn.
  - In-flight turns make the dropdown read-only.
  - Remove is blocked when the worktree has an active run in any thread or orchestrator tier.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_binding
reasoning_tier: high
context_scope: worktrees
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: worktree_binding_change_rules
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0148
preserved_exact_tokens:
  - "next turn"
  - "WorktreeManager::remove_worktree"
negative_constraints:
  - "No binding changes during execution."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
```

### ACD-326 - Thread Worktree Binding Storage

```yaml
plan_unit_id: ACD-326
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Thread worktree binding persists at
  `thread_state:{thread_id}:worktree_binding` with `worktree_id`,
  `branch_name`, `worktree_path`, `bound_at_utc`, `binding_origin`, and
  `temp_branch_name`.
gui_related: false
gui_classification_reason: Thread worktree binding storage is persistence/data-contract behavior.
depends_on: [ACD-318]
unblocks: [ACD-327, ACD-328, ACD-329, ACD-335]
acceptance_criteria:
  - Thread worktree binding uses the specified redb key family and JSON fields.
  - UI display uses `branch_name`; `temp_branch_name` is internal bookkeeping.
  - Worktree filesystem paths use `.puppet-master/worktrees/thread-{short_id}` with suffixes when needed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_storage
reasoning_tier: high
context_scope: storage
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: thread_worktree_binding_storage
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0149
preserved_exact_tokens:
  - "thread_state:{thread_id}:worktree_binding"
  - ".puppet-master/worktrees/thread-{short_id}"
  - "thread-{short_id}-2"
  - "wt-*"
negative_constraints:
  - "`temp_branch_name` is internal bookkeeping only."
  - "`worktree_id` remains the stable record identity and MUST NOT make `wt-*` the filesystem path model."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-327 - Worktree Reverse Binding Enforcement

```yaml
plan_unit_id: ACD-327
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Reverse lookup `worktree_binding_reverse:{worktree_id}` enforces one worktree per thread and one thread per worktree, with explicit error and deep link when already bound.
gui_related: false
gui_classification_reason: Reverse lookup and one-to-one enforcement are storage/runtime behavior.
depends_on: [ACD-326]
unblocks: [ACD-328]
acceptance_criteria:
  - Reverse lookup stores the owning `thread_id` for a `worktree_id`.
  - Binding a worktree already bound to another thread is blocked with an explicit error.
  - The error includes a deep link to the owning thread when available.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_storage
reasoning_tier: high
context_scope: storage
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: worktree_reverse_binding_enforcement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0149
preserved_exact_tokens:
  - "worktree_binding_reverse:{worktree_id}"
  - "thread_id"
negative_constraints:
  - "Duplicate thread/worktree binding is blocked."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-328 - Worktree Binding Projection Revalidation

```yaml
plan_unit_id: ACD-328
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Projectors replay `chat.thread_worktree_bound` and
  `chat.thread_worktree_unbound`; startup lazily revalidates path membership in
  `git worktree list`, auto-unbinds missing paths, emits
  `reason=path_missing`, and notifies the user.
gui_related: false
gui_classification_reason: Event replay and startup revalidation are storage/runtime behavior.
depends_on: [ACD-326]
unblocks: [ACD-329]
acceptance_criteria:
  - Binding projectors replay bound/unbound events in sequence order.
  - Startup lazily verifies the recorded path exists and appears in `git worktree list`.
  - Missing worktrees auto-unbind with `reason=path_missing` and notify the user.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_storage
reasoning_tier: high
context_scope: storage
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: worktree_binding_projection_revalidation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0149
preserved_exact_tokens:
  - "chat.thread_worktree_bound"
  - "chat.thread_worktree_unbound"
  - "git worktree list"
  - "reason=path_missing"
negative_constraints:
  - "Missing worktrees must not be silently re-created."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-329 - Worktree Aware File Identity

```yaml
plan_unit_id: ACD-329
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  File identity for chat/debug/Source Control/GitHub pivots is `{ repo_id,
  worktree_id, relative_path }`; turn start freezes
  `execution_unit_context.worktree_id` and `working_directory`; historical cards
  remain pinned.
gui_related: false
gui_classification_reason: Worktree-aware file identity and turn-start freezing are runtime/contract behavior.
depends_on: [ACD-326]
unblocks: [ACD-330, ACD-367]
acceptance_criteria:
  - Worktree-aware file identity uses repo, worktree, and relative path.
  - Turn start freezes worktree ID and working directory for the whole turn.
  - Historical cards, receipts, and debug evidence remain pinned to captured worktree identity.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_identity
reasoning_tier: high
context_scope: contracts
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - Plans/GitHub_Integration.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: worktree_aware_file_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0149
preserved_exact_tokens:
  - "{ repo_id, worktree_id, relative_path }"
  - "execution_unit_context.worktree_id"
  - "working_directory"
  - "HEAD_sha"
negative_constraints:
  - "Path alone is not sufficient."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-330 - Mode Worktree Invariant

```yaml
plan_unit_id: ACD-330
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Worktree binding is thread-level and orthogonal to Ask, Agent, Debug, Plan,
  and Deep Plan; mode transitions do not rebind, unbind, or change frozen
  `working_directory` for an in-flight turn.
gui_related: false
gui_classification_reason: Mode/worktree orthogonality is runtime invariant behavior.
depends_on: [ACD-329]
unblocks: []
acceptance_criteria:
  - Mode transitions never rebind, unbind, or change frozen working directory for an in-flight turn.
  - The next turn observes the same bound worktree unless the user explicitly changes binding.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: run_modes
reasoning_tier: high
context_scope: worktrees
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
node_compile_hint:
  mode: mode_worktree_invariant
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0149
preserved_exact_tokens:
  - "Mode-worktree invariant"
  - "working_directory"
negative_constraints:
  - "Mode transitions never mutate worktree binding."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
```

### ACD-331 - Create Worktree Dialog Surface

```yaml
plan_unit_id: ACD-331
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Create Worktree dialog opens from `Create Worktree…`, with Branch name and Base ref fields, defaults, validation, and `Create`/`Cancel` buttons.
gui_related: true
gui_classification_reason: Create Worktree dialog fields, defaults, validation, and buttons are visible UI.
depends_on: [ACD-324]
unblocks: [ACD-332]
acceptance_criteria:
  - "`Create Worktree…` opens a dialog with Branch name and Base ref fields."
  - Branch name and Base ref defaults and validation match the source span.
  - Dialog exposes `Create` and `Cancel` buttons.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_create
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: create_worktree_dialog_surface
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0150
preserved_exact_tokens:
  - "Create Worktree…"
  - "assistant/thread-<short_id>"
  - "branching.assistant_worktree_base_ref"
  - "branching.base_branch"
  - "Create"
  - "Cancel"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-332 - Worktree Create Backend Transaction

```yaml
plan_unit_id: ACD-332
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Backend create flow calls
  `WorktreeManager::create_worktree(branch_name, base_ref, worktree_path)`,
  writes `worktree_record`, writes thread binding, emits
  `chat.thread_worktree_bound`, and uses the generated
  `.puppet-master/worktrees/thread-{short_id}` path with numeric suffixes.
gui_related: false
gui_classification_reason: Worktree creation backend transaction is storage/runtime behavior.
depends_on: [ACD-331]
unblocks: [ACD-333, ACD-334]
acceptance_criteria:
  - Backend creates worktrees through `WorktreeManager::create_worktree`.
  - Successful creation writes worktree record and thread binding and emits the bound event.
  - Auto-generated worktree paths use the thread short-id path and numeric suffixes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_create
reasoning_tier: high
context_scope: storage
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: worktree_create_backend_transaction
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0150
preserved_exact_tokens:
  - "WorktreeManager::create_worktree(branch_name, base_ref, worktree_path)"
  - "chat.thread_worktree_bound"
  - "thread-{short_id}-2"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
```

### ACD-333 - Create Worktree Dialog Result States

```yaml
plan_unit_id: ACD-333
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Create dialog success closes and updates bound state/thread selector; failure
  keeps dialog open with inline error; branch collision warning is advisory with
  `Create Anyway` and `Use Different Branch`; loading disables dropdown/create
  button and shows `Creating…`.
gui_related: true
gui_classification_reason: Create Worktree success, failure, warning, and loading states are visible dialog UI.
depends_on: [ACD-332]
unblocks: []
acceptance_criteria:
  - Successful create closes the dialog and updates button and thread selector state.
  - Failure keeps the dialog open with inline error and allows retry or cancel.
  - Branch collision warning and loading states match the specified copy and buttons.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_create
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: create_worktree_dialog_result_states
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0150
preserved_exact_tokens:
  - "Branch already exists"
  - "Create Anyway"
  - "Use Different Branch"
  - "Creating…"
negative_constraints:
  - "Branch name collision warning is advisory only."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-334 - Worktree Creation Tool Boundary

```yaml
plan_unit_id: ACD-334
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Worktree creation/removal entrypoints are user-initiated or system-initiated by auto-create; the AI agent never invokes worktree creation/removal as a direct tool call.
gui_related: false
gui_classification_reason: Tool-call boundary is command/runtime behavior.
depends_on: [ACD-332]
unblocks: [ACD-335]
acceptance_criteria:
  - Worktree creation/removal starts from chat header dropdown, slash command, Source Control action, or auto-create setting.
  - AI agents do not directly invoke worktree creation/removal as tools.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: tool_boundary
reasoning_tier: high
context_scope: worktrees
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: worktree_creation_tool_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0150
preserved_exact_tokens:
  - "chat header dropdown"
  - "slash command"
  - "Source Control action"
negative_constraints:
  - "The AI agent never invokes worktree creation or removal as a direct tool call."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### ACD-335 - Assistant Auto Worktree Creation

```yaml
plan_unit_id: ACD-335
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: When `branching.assistant_auto_worktree` is true, new thread creation synchronously creates a worktree before first turn dispatch; failure creates the thread without a worktree and warns the user.
gui_related: false
gui_classification_reason: Auto-create timing is chat runtime behavior.
depends_on: [ACD-326]
unblocks: [ACD-336, ACD-337, ACD-338]
acceptance_criteria:
  - New thread creation checks `branching.assistant_auto_worktree`.
  - Auto-create happens before first turn dispatch when enabled.
  - Failure leaves the thread without a worktree and warns the user.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_auto_create
reasoning_tier: high
context_scope: chat_runtime
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: assistant_auto_worktree_creation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0151
preserved_exact_tokens:
  - "branching.assistant_auto_worktree"
  - "cmd.chat.new"
  - "Could not create worktree: {error}. Thread will use project root."
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
```

### ACD-336 - Auto Worktree Title Rename

```yaml
plan_unit_id: ACD-336
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Title rename flow sanitizes generated titles, targets
  `assistant/<sanitized_title>`, appends numeric suffixes silently, renames the
  branch, updates records, emits `chat.thread_worktree_renamed`, and keeps the
  temp name on failure.
gui_related: false
gui_classification_reason: Auto title rename is branch/runtime storage behavior.
depends_on: [ACD-335]
unblocks: [ACD-337]
acceptance_criteria:
  - Title generation sanitizes branch names using the specified examples and fallback.
  - Existing target branch names receive numeric suffixes silently.
  - Successful rename updates records and emits `chat.thread_worktree_renamed`; failure keeps the temp name without user interruption.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_auto_create
reasoning_tier: high
context_scope: chat_runtime
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: auto_worktree_title_rename
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0151
preserved_exact_tokens:
  - "Fix Auth Bug"
  - "users-login-v2"
  - "thread-a1b2c3d4"
  - "assistant/<sanitized_title>"
  - "chat.thread_worktree_renamed"
negative_constraints:
  - "Auto-create title suffixing uses no user dialog."
  - "Rename failure keeps the temp name with no user interruption."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-337 - Auto Worktree Runtime Ownership

```yaml
plan_unit_id: ACD-337
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Chat runtime owns auto-create; Executor never invokes `WorktreeManager`
  directly; create is serialized per project and reverse lookup write is atomic;
  race failures retry with the next suffix, while non-race failures do not retry.
gui_related: false
gui_classification_reason: Auto-create ownership, serialization, and retry rules are runtime constraints.
depends_on: [ACD-335]
unblocks: []
acceptance_criteria:
  - Chat runtime owns auto-create calls.
  - "`WorktreeManager::create_worktree` is serialized per project and reverse lookup write is atomic."
  - Race failures retry with next suffix; non-race failures do not retry.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: executor_boundary
reasoning_tier: high
context_scope: chat_runtime
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Executor_Protocol.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: auto_worktree_runtime_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0151
preserved_exact_tokens:
  - "mutex/lock"
  - "redb transaction"
negative_constraints:
  - "Executor never invokes WorktreeManager directly for thread worktree creation."
  - "Auto-create does not retry on non-race failures."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Executor_Protocol.md
```

### ACD-338 - Assistant Worktree Settings Registry

```yaml
plan_unit_id: ACD-338
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Settings registry adds project-level worktree settings with exact keys, types,
  defaults, labels, and descriptions for auto-create, cleanup default, base ref,
  follow-thread, warning threshold, create timeout, pre-merge test, test
  command, timeout, and test target.
gui_related: true
gui_classification_reason: The settings registry includes visible labels and project settings UI values.
depends_on: [ACD-335]
unblocks: [ACD-339, ACD-340, ACD-369]
acceptance_criteria:
  - Project-level assistant worktree settings preserve their exact keys, types, defaults, labels, and descriptions.
  - Cleanup default supports `ask`, `keep`, and `remove`.
  - Pre-merge test target supports `merged_result` and `branch_only`.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: settings_registry
reasoning_tier: high
context_scope: settings
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: assistant_worktree_settings_registry
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0152
preserved_exact_tokens:
  - "config:project:{pid}:branching.assistant_auto_worktree"
  - "config:project:{pid}:branching.assistant_worktree_cleanup_default"
  - "config:project:{pid}:branching.assistant_worktree_base_ref"
  - "config:project:{pid}:file_manager.worktree_follow_thread"
  - "ask"
  - "keep"
  - "remove"
  - "merged_result"
  - "branch_only"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-339 - Assistant Worktrees Settings Placement

```yaml
plan_unit_id: ACD-339
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Settings UI places Assistant Worktrees under Settings > Branching below existing branching controls, grouped as Creation, Merge & Testing, and Behavior.
gui_related: true
gui_classification_reason: Settings placement and grouping are visible configuration UI.
depends_on: [ACD-338]
unblocks: [ACD-340]
acceptance_criteria:
  - Assistant Worktrees appears below existing branching controls in Settings > Branching.
  - Settings are grouped into Creation, Merge & Testing, and Behavior groups.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: settings_ui
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: assistant_worktrees_settings_placement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0152
preserved_exact_tokens:
  - "Assistant Worktrees"
  - "Creation"
  - "Merge & Testing"
  - "Behavior"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-340 - Assistant Worktree Settings Namespace And Clamps

```yaml
plan_unit_id: ACD-340
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Namespace rules keep `file_manager.worktree_follow_thread` under `file_manager.*`; numeric settings clamp on load with warning using min/max/zero behavior.
gui_related: false
gui_classification_reason: Settings namespace and clamping are persistence/config behavior.
depends_on: [ACD-338]
unblocks: []
acceptance_criteria:
  - "`file_manager.worktree_follow_thread` stays in the `file_manager.*` namespace."
  - Assistant-specific and generic worktree setting prefixes keep their distinct meanings.
  - Out-of-range numeric settings clamp to valid bounds on load with a log warning.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: settings_registry
reasoning_tier: standard
context_scope: settings
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: assistant_worktree_settings_namespace_clamps
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0152
preserved_exact_tokens:
  - "file_manager.*"
  - "assistant_worktree_*"
  - "worktree_*"
  - "0 = disabled"
negative_constraints:
  - "Do not move file manager behavior into `branching.*`."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-341 - Thread Selector Worktree Icon

```yaml
plan_unit_id: ACD-341
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Thread selector shows a theme-consistent branch/tree glyph, not emoji, in the left gutter; absent when unbound; compact rows use `wt_icon`, branch label, status/owner copy, and full tooltip lines.
gui_related: true
gui_classification_reason: Thread selector glyph, row slot, copy, and tooltip behavior are visible UI.
depends_on: [ACD-323]
unblocks: [ACD-342]
acceptance_criteria:
  - Thread selector shows a theme-consistent branch/tree glyph in the left gutter only when bound.
  - Compact/default rows use the `wt_icon` slot before branch label and chevron.
  - Tooltips and owner copy preserve branch/path/status and owner labels.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: thread_selector_ui
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: thread_selector_worktree_icon
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0153
preserved_exact_tokens:
  - "wt_icon"
  - "Thread: <thread_title>"
  - "Orch: <tier_label>"
  - "Manual"
negative_constraints:
  - "Thread selector worktree icon is not emoji."
  - "No placeholder is shown when unbound."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-342 - Worktree Projection Status Compatibility

```yaml
plan_unit_id: ACD-342
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Status rendering preserves projection wording as compatibility lineage: icons
  read `worktree_projection.v1:{project_id}:{worktree_id}` with `dirty_state`,
  `conflict_state`, and stale freshness display, without making Assistant Chat
  the storage projection owner.
gui_related: true
gui_classification_reason: Stale projection status changes visible icon and tooltip behavior.
depends_on: [ACD-341]
unblocks: []
acceptance_criteria:
  - Chat header and thread selector icons read status from the worktree projection.
  - Stale projection status renders last-known state with desaturation and tooltip copy.
  - Assistant Chat does not become a second projection owner.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: projection_compatibility
reasoning_tier: high
context_scope: compatibility
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: worktree_projection_status_compatibility
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0153
preserved_exact_tokens:
  - "worktree_projection.v1:{project_id}:{worktree_id}"
  - "dirty_state"
  - "conflict_state"
  - "projection_freshness = stale"
  - "(status may be outdated)"
negative_constraints:
  - "Assistant Chat must not define a second storage projection owner."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-343 - Thread Delete Worktree Cleanup Scope

```yaml
plan_unit_id: ACD-343
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Cleanup choices belong to thread delete only; there is no automatic completed-thread cleanup; keep unbinds and leaves disk state, while remove unbinds and prunes after dirty/active-run safeguards.
gui_related: false
gui_classification_reason: Cleanup lifecycle scope and disk semantics are workflow/storage behavior.
depends_on: [ACD-325]
unblocks: [ACD-344, ACD-346]
acceptance_criteria:
  - Cleanup choices are part of thread delete confirmation only.
  - Keep unbinds and leaves the worktree on disk.
  - Remove unbinds and prunes the worktree after dirty and active-run safeguards.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_cleanup
reasoning_tier: high
context_scope: cleanup
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: thread_delete_worktree_cleanup_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0154
preserved_exact_tokens:
  - "branching.assistant_worktree_cleanup_default"
  - "chat.thread_worktree_unbound"
negative_constraints:
  - "Cleanup is not part of archive/unarchive lifecycle changes."
  - "There is no automatic completed-thread cleanup path."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-344 - Thread Delete Worktree Confirmation UI

```yaml
plan_unit_id: ACD-344
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Existing delete confirmation extends with keep/remove choices, dirty warning, exact button labels, tertiary cancel default focus, and default choice from settings.
gui_related: true
gui_classification_reason: Extended thread delete confirmation is visible modal UI.
depends_on: [ACD-343]
unblocks: [ACD-345]
acceptance_criteria:
  - Cleanup options are embedded into the existing delete confirmation dialog.
  - The extended confirmation preserves title, body, dirty warning, and button copy.
  - Default choice follows `branching.assistant_worktree_cleanup_default`.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_cleanup
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: thread_delete_worktree_confirmation_ui
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0154
preserved_exact_tokens:
  - "Delete thread?"
  - "Delete and keep worktree"
  - "Delete and remove worktree"
  - "Cancel"
negative_constraints:
  - "Cleanup options are not shown as a separate modal."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-345 - Dirty Worktree Destructive Cleanup

```yaml
plan_unit_id: ACD-345
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Dirty destructive removal uses `git worktree remove --force <path>` plus `git branch -D <branch>` only after warning; unbind has no dedicated MVP undo.
gui_related: false
gui_classification_reason: Destructive cleanup command and no-undo behavior are workflow/runtime constraints.
depends_on: [ACD-344]
unblocks: []
acceptance_criteria:
  - Dirty destructive removal uses forced worktree removal and branch deletion after warning.
  - Unbind leaves the worktree on disk as a manual worktree.
  - Dedicated unbind undo is post-MVP.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: destructive_action
reasoning_tier: high
context_scope: cleanup
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: dirty_worktree_destructive_cleanup
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0154
preserved_exact_tokens:
  - "git worktree remove --force <path>"
  - "git branch -D <branch>"
negative_constraints:
  - "Unbind has no dedicated undo in MVP."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
```

### ACD-346 - Completed Thread Worktree Retention

```yaml
plan_unit_id: ACD-346
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Completed or failed threads with bound worktrees do not auto-unbind or clean up; dirty completed/failed worktrees surface in Source Control and may toast merge/cleanup guidance.
gui_related: true
gui_classification_reason: Completed/failed worktree status and toast guidance are visible UI behavior.
depends_on: [ACD-343]
unblocks: [ACD-347]
acceptance_criteria:
  - Completed or failed threads keep their bound worktree unless the user explicitly deletes, unbinds, merges, or creates a PR.
  - Dirty completed or failed worktrees surface combined status in Source Control.
  - Completion may toast merge or cleanup guidance.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_cleanup
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: completed_thread_worktree_retention
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0155
preserved_exact_tokens:
  - "dirty · completed"
  - "dirty · failed"
  - "Thread completed. Worktree has uncommitted changes — merge or clean up when ready."
negative_constraints:
  - "There is no auto-cleanup for `completed` or `failed` threads."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-347 - Worktree Merge PR Entry Paths

```yaml
plan_unit_id: ACD-347
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Merge/PR access paths are equivalent across chat header dropdown, Source Control worktree section, slash commands, and natural language.
gui_related: true
gui_classification_reason: Merge/PR entry points include visible UI, slash commands, and natural-language chat affordances.
depends_on: [ACD-346]
unblocks: [ACD-348, ACD-349, ACD-364, ACD-366]
acceptance_criteria:
  - Chat header dropdown, Source Control worktree section, slash commands, and natural language reach equivalent merge/PR outcomes.
  - Slash command defaults and natural language dialog prefill behavior remain preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: merge_entry_paths
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/GitHub_Integration.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: worktree_merge_pr_entry_paths
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0155
preserved_exact_tokens:
  - "Merge into Base…"
  - "Create PR…"
  - "/worktree merge [--squash\\|--rebase]"
  - "/worktree pr"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### ACD-348 - Worktree Compare And Source Control Routing

```yaml
plan_unit_id: ACD-348
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Compare buttons open committed branch-to-branch review through `cmd.git.open_diff`; Source Control merge buttons route through `cmd.chat.worktree.merge` with `thread_id=null`, omitting thread-specific behaviors.
gui_related: false
gui_classification_reason: Compare and merge command routing are command-contract behavior.
depends_on: [ACD-347]
unblocks: [ACD-361]
acceptance_criteria:
  - Compare buttons open committed branch-to-branch review through `cmd.git.open_diff`.
  - Source Control merge buttons call `cmd.chat.worktree.merge` with `thread_id=null`.
  - Null thread ID omits thread-specific unbind, status update, and chat notification behavior.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_routing
reasoning_tier: high
context_scope: commands
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/GitHub_Integration.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: worktree_compare_source_control_routing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0155
preserved_exact_tokens:
  - "cmd.git.open_diff"
  - "cmd.chat.worktree.merge"
  - "thread_id=null"
negative_constraints:
  - "Compare buttons open committed branch-to-branch review only."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### ACD-349 - Merge Confirmation Dialog

```yaml
plan_unit_id: ACD-349
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Merge confirmation dialog has Strategy, Target branch, Commit message, defaults, buttons, and reactive message visibility for Squash/Merge/Rebase while preserving edits across strategy switches.
gui_related: true
gui_classification_reason: Merge confirmation dialog fields, controls, and reactivity are visible UI.
depends_on: [ACD-347]
unblocks: [ACD-350]
acceptance_criteria:
  - Merge dialog exposes Strategy, Target branch, and Commit message fields with the specified defaults and visibility rules.
  - Strategy choices support Squash, Merge, and Rebase.
  - User edits are preserved across strategy switches.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: merge_dialog
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: merge_confirmation_dialog
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0156
preserved_exact_tokens:
  - "Squash"
  - "Merge"
  - "Rebase"
  - "branching.assistant_worktree_base_ref"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-350 - Merge Dialog Loading State

```yaml
plan_unit_id: ACD-350
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: After confirmation, dialog enters strategy-specific loading with disabled controls, read-only commit message when shown, loading spinner label, and Cancel still enabled.
gui_related: true
gui_classification_reason: Strategy-specific merge loading state is visible dialog UI.
depends_on: [ACD-349]
unblocks: [ACD-351]
acceptance_criteria:
  - Strategy and target controls are disabled during merge loading.
  - Commit message is read-only/greyed when shown during loading.
  - Merge button shows a strategy-specific loading label while Cancel remains enabled.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: merge_dialog
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: merge_dialog_loading_state
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0156
preserved_exact_tokens:
  - "Merging..."
  - "Squashing..."
  - "Rebasing..."
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-351 - Pre Merge Guard Matrix

```yaml
plan_unit_id: ACD-351
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Pre-merge guards block uncommitted changes, merge conflicts, active run, deleted target branch, detached HEAD, and dirty main repo for squash/merge with merged_result, preserving exact warning/error copy.
gui_related: true
gui_classification_reason: Pre-merge guard warnings and disabled buttons are visible merge UI.
depends_on: [ACD-350]
unblocks: [ACD-352, ACD-353]
acceptance_criteria:
  - Merge is blocked for uncommitted worktree changes, conflicts, active runs, deleted target branch, detached HEAD, and dirty main repo for relevant test mode.
  - Guard rows preserve exact warning/error copy where specified.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: merge_guards
reasoning_tier: high
context_scope: merge
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: pre_merge_guard_matrix
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0157
preserved_exact_tokens:
  - "Cannot merge while a run is active."
  - "Cannot run pre-merge test: main repo has uncommitted changes."
  - "Cannot merge: worktree is on a detached HEAD. Checkout a branch first."
negative_constraints:
  - "Detached HEAD blocks merge/PR."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
```

### ACD-352 - Detached Head Recovery

```yaml
plan_unit_id: ACD-352
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Detached HEAD recovery is explicit via terminal checkout or unbind/re-create named-branch worktree through normal create flow.
gui_related: false
gui_classification_reason: Detached HEAD recovery path is runtime/workflow guidance.
depends_on: [ACD-351]
unblocks: [ACD-353]
acceptance_criteria:
  - Detached HEAD recovery requires explicit user action.
  - Recovery may use terminal branch checkout or normal unbind/re-create flow.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: merge_guards
reasoning_tier: standard
context_scope: merge
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: detached_head_recovery
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0157
preserved_exact_tokens:
  - "git checkout -b <branch>"
negative_constraints:
  - "Detached HEAD recovery is not automatic."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
```

### ACD-353 - Merge Execution Context

```yaml
plan_unit_id: ACD-353
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Merge executes in the main repo working tree, not inside the worktree; Rebase is the exception with worktree rebase then main repo fast-forward merge.
gui_related: false
gui_classification_reason: Merge execution context is backend Git behavior.
depends_on: [ACD-351, ACD-352]
unblocks: [ACD-354]
acceptance_criteria:
  - Squash and Merge execute in the main repo working tree.
  - Rebase runs first in the worktree and then fast-forwards in the main repo.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: merge_execution
reasoning_tier: high
context_scope: git
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: merge_execution_context
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0158
preserved_exact_tokens:
  - "NOT inside the worktree"
  - "git rebase {target}"
  - "git merge --ff-only"
negative_constraints:
  - "Merge execution must not run squash/merge inside the worktree."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
```

### ACD-354 - Merge Lock Atomicity

```yaml
plan_unit_id: ACD-354
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  `.git/pm-merge.lock` is acquired before guard checks, makes
  guard-plus-execution atomic, disables all merge buttons project-wide, and
  covers the full Rebase sequence with post-lock rechecks.
gui_related: false
gui_classification_reason: Merge lock acquisition and atomicity are backend runtime behavior.
depends_on: [ACD-353]
unblocks: [ACD-355, ACD-356, ACD-363]
acceptance_criteria:
  - Merge lock is acquired before guard checks.
  - Guard checks and execution are atomic after lock acquisition.
  - The lock disables all merge buttons project-wide and covers the full Rebase sequence.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: merge_lock
reasoning_tier: high
context_scope: git
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: merge_lock_atomicity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0158
preserved_exact_tokens:
  - ".git/pm-merge.lock"
  - "FIRST merge-execution step"
negative_constraints:
  - "The UI pre-check `/disabling` state is advisory only."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Executor_Protocol.md
```

### ACD-355 - Stale Merge Lock Recovery Compatibility

```yaml
plan_unit_id: ACD-355
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Stale lock recovery wording is preserved as compatibility disposition: lazy
  startup removes dead PID or older-than-five-minute lock before new merge and
  toasts `Stale merge lock cleaned up.`
gui_related: true
gui_classification_reason: Stale lock recovery includes a visible toast.
depends_on: [ACD-354]
unblocks: []
acceptance_criteria:
  - Startup lazily removes stale merge locks when PID is dead or lock is older than five minutes.
  - Stale lock cleanup happens before new merge execution proceeds.
  - Cleanup toasts `Stale merge lock cleaned up.`
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: merge_lock
reasoning_tier: standard
context_scope: compatibility
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: stale_merge_lock_recovery_compatibility
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0158
preserved_exact_tokens:
  - "older than 5 minutes"
  - "Stale merge lock cleaned up."
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-356 - Merge Strategy Command Templates

```yaml
plan_unit_id: ACD-356
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Strategy command templates preserve Squash, Merge, Rebase sequences and canonical `{worktree_branch}` aliases for source branch.
gui_related: false
gui_classification_reason: Merge command templates are backend Git behavior.
depends_on: [ACD-354]
unblocks: [ACD-357, ACD-358, ACD-359]
acceptance_criteria:
  - Squash, Merge, and Rebase execution steps preserve their command sequences.
  - Canonical command templates may use `{worktree_branch}` for the source branch.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: merge_execution
reasoning_tier: high
context_scope: git
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: merge_strategy_command_templates
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0158
preserved_exact_tokens:
  - "git merge --squash {worktree_branch}"
  - "git merge --no-ff {worktree_branch} -m \"{message}\""
  - "git merge --ff-only {worktree_branch}"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
```

### ACD-357 - Worktree Merge Auto Fetch

```yaml
plan_unit_id: ACD-357
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Auto-fetch runs `git fetch origin {target_branch}` before any merge; if no remote or offline, merge proceeds with local state and advisory toast.
gui_related: true
gui_classification_reason: Auto-fetch failure behavior includes an advisory toast.
depends_on: [ACD-356]
unblocks: [ACD-358]
acceptance_criteria:
  - Backend runs `git fetch origin {target_branch}` before any merge strategy.
  - Fetch failure from no remote or offline state does not block merge.
  - Fetch failure shows an advisory toast while proceeding with local state.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: merge_execution
reasoning_tier: standard
context_scope: git
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: worktree_merge_auto_fetch
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0158
preserved_exact_tokens:
  - "git fetch origin {target_branch}"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
```

### ACD-358 - Non Interactive Rebase Constraint

```yaml
plan_unit_id: ACD-358
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Rebase is non-interactive only; interactive rebase, `-i`, pick/squash/fixup, and `/squash/fixup` workflows are terminal-only.
gui_related: false
gui_classification_reason: Rebase mode limitation is backend command/workflow behavior.
depends_on: [ACD-356]
unblocks: [ACD-359]
acceptance_criteria:
  - Merge dialog runs non-interactive rebase only.
  - Interactive rebase and pick/squash/fixup workflows are terminal-only.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: merge_execution
reasoning_tier: high
context_scope: git
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: non_interactive_rebase_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0158
preserved_exact_tokens:
  - "interactive `git rebase -i`"
  - "-i"
  - "pick/squash/fixup"
  - "/squash/fixup"
negative_constraints:
  - "Interactive rebase is not available through the merge dialog."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
```

### ACD-359 - Merge Authorship And Hooks

```yaml
plan_unit_id: ACD-359
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Merge commit authorship uses user git identity with no AI co-author injection; hooks are not bypassed, hook failure is merge failure, and hooks run after pre-merge test pass as part of commit pipeline.
gui_related: false
gui_classification_reason: Commit authorship and hook execution are backend Git behavior.
depends_on: [ACD-356, ACD-358]
unblocks: [ACD-360]
acceptance_criteria:
  - Merge commit authorship uses `user.name` and `user.email`.
  - AI co-author injection is not added.
  - Git hooks run normally and hook failure is merge failure with Retry/Cancel.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: merge_execution
reasoning_tier: high
context_scope: git
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: merge_authorship_hooks
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0158
preserved_exact_tokens:
  - "user.name"
  - "user.email"
  - "No AI co-author injection"
  - "pre-merge-commit"
  - "prepare-commit-msg"
negative_constraints:
  - "Git hooks are NOT bypassed."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
```

### ACD-360 - Post Merge Modal

```yaml
plan_unit_id: ACD-360
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Post-merge modal offers `Keep worktree`, `Remove worktree`, and `Cancel`, defaults from cleanup setting, and has no undo for completed merge.
gui_related: true
gui_classification_reason: Post-merge modal and no-undo guidance are visible UI.
depends_on: [ACD-359]
unblocks: []
acceptance_criteria:
  - Post-merge modal shows merged branch and target branch.
  - Modal offers Keep worktree, Remove worktree, and Cancel.
  - Default follows cleanup setting and completed merge has no undo.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: merge_post_behavior
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: post_merge_modal
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0159
preserved_exact_tokens:
  - "Branch `assistant/{title}` has been merged into `{target}`."
  - "Keep worktree"
  - "Remove worktree"
  - "git reset"
  - "git revert"
negative_constraints:
  - "No undo for completed merge."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-361 - Source Control Conflict Routing

```yaml
plan_unit_id: ACD-361
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: UI-initiated conflicts route to Source Control > Changes and `cmd.source_control.open_conflict`; lower-level `cmd.git.*` may support mechanics but is not the GUI entrypoint.
gui_related: true
gui_classification_reason: Conflict routing and Source Control entrypoints are visible UI behavior.
depends_on: [ACD-348]
unblocks: [ACD-362]
acceptance_criteria:
  - UI-initiated conflicts route to Source Control > Changes.
  - "`cmd.source_control.open_conflict` is the GUI entrypoint."
  - Lower-level `cmd.git.*` operations may support mechanics but do not become the GUI entrypoint.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: conflict_routing
reasoning_tier: high
context_scope: source_control
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: source_control_conflict_routing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0160
preserved_exact_tokens:
  - "Source Control > Changes"
  - "cmd.source_control.open_conflict"
  - "cmd.git.conflict_apply_resolution"
negative_constraints:
  - "Assistant-bound worktree conflicts do not define a second chat-local conflict UI."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### ACD-362 - Natural Language Conflict Assistance Boundary

```yaml
plan_unit_id: ACD-362
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Natural-language conflict assistance may explain and propose edits, but semantic resolution requires explicit user approval and follows Source Control Conflict assistant rules, including `/disabled`, `/settings`, and per-project preferences.
gui_related: true
gui_classification_reason: Natural-language conflict assistance and approval handoff are user-visible chat and Source Control behavior.
depends_on: [ACD-361]
unblocks: [ACD-363]
acceptance_criteria:
  - Natural-language assistance may explain choices and propose edits.
  - Semantic resolution requires explicit user approval.
  - Conflict flow follows Source Control disabled/settings/preference rules.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: conflict_routing
reasoning_tier: high
context_scope: source_control
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: natural_language_conflict_assistance_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0160
preserved_exact_tokens:
  - "NL-initiated"
  - "Open Conflict Assistant"
  - "cmd.source_control.open_review"
  - "/disabled"
  - "/settings"
negative_constraints:
  - "Semantic resolution requires explicit user approval."
  - "Conflict assistance must not create a second chat-local conflict UI."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### ACD-363 - Rebase Conflict Abort Behavior

```yaml
plan_unit_id: ACD-363
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Rebase conflicts during `git rebase {target}` auto-abort, show dialog error, skip tests, and release lock.
gui_related: false
gui_classification_reason: Rebase conflict abort behavior is backend merge/runtime behavior.
depends_on: [ACD-354, ACD-362]
unblocks: []
acceptance_criteria:
  - Rebase conflicts run `git rebase --abort`.
  - Dialog shows an error, tests do not run, and merge lock is released.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: conflict_routing
reasoning_tier: high
context_scope: git
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: rebase_conflict_abort_behavior
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0160
preserved_exact_tokens:
  - "git rebase --abort"
  - "Tests never run"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
```

### ACD-364 - Worktree PR Panel Prefill

```yaml
plan_unit_id: ACD-364
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Create PR opens the existing GitHub PR creation panel with title, body, target branch, and source branch prefilled from thread and commit data.
gui_related: true
gui_classification_reason: PR creation panel and prefilled fields are visible UI.
depends_on: [ACD-347]
unblocks: [ACD-365]
acceptance_criteria:
  - Create PR opens the existing GitHub Integration PR creation panel.
  - Title, body, target branch, and source branch are prefilled from thread/commit data.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: github_pr_flow
reasoning_tier: standard
context_scope: github
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/GitHub_Integration.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: worktree_pr_panel_prefill
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0161
preserved_exact_tokens:
  - "GitHub_Integration.md §B"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/GitHub_Integration.md
```

### ACD-365 - Worktree PR Push And Failure Flow

```yaml
plan_unit_id: ACD-365
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: PR flow auto-pushes `git push -u origin {branch}` before panel open; push/API failures prevent panel opening, show failure behavior, emit `chat.thread_worktree_pr_failed` with `phase=push` or `phase=api`, require GitHub remote, and keep worktree bound post-PR with no cleanup modal.
gui_related: true
gui_classification_reason: PR failure toasts/panel behavior and post-PR state are visible UI.
depends_on: [ACD-364]
unblocks: []
acceptance_criteria:
  - PR flow pushes the worktree branch before opening the panel.
  - Push and API failures prevent panel opening and emit phase-specific failure events.
  - PR flow requires a configured GitHub remote and keeps the worktree bound after PR creation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: github_pr_flow
reasoning_tier: high
context_scope: github
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/GitHub_Integration.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: worktree_pr_push_failure_flow
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0161
preserved_exact_tokens:
  - "git push -u origin {branch}"
  - "chat.thread_worktree_pr_failed"
  - "phase=push"
  - "phase=api"
  - "PR creation failed: {error}"
negative_constraints:
  - "PR panel does not open after push or API failure."
  - "No cleanup modal after PR."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/GitHub_Integration.md
```

### ACD-366 - Natural Language Merge Structured Action

```yaml
plan_unit_id: ACD-366
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Natural-language merge emits structured action `cmd.chat.worktree.merge` with strategy/target/message params, follows `cmd.chat.revert` pattern, never runs merge directly via bash, and always shows user-confirmed dialog even under yolo/auto-approve posture.
gui_related: true
gui_classification_reason: Natural-language merge produces a visible confirmation dialog and chat action flow.
depends_on: [ACD-347]
unblocks: [ACD-367, ACD-368]
acceptance_criteria:
  - Natural-language merge emits a structured `cmd.chat.worktree.merge` action.
  - Merge parameters include strategy, target branch, and optional commit message.
  - The user-confirmed dialog appears regardless of entry path or approval posture.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: natural_language_merge
reasoning_tier: high
context_scope: commands
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/Run_Modes.md
node_compile_hint:
  mode: natural_language_merge_structured_action
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0162
preserved_exact_tokens:
  - "{ \"action\": \"cmd.chat.worktree.merge\""
  - "squash|merge|rebase"
  - "cmd.chat.revert"
negative_constraints:
  - "The agent does not run merge directly via bash."
  - "Even yolo or auto-approve posture still shows the dialog before mutation."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### ACD-367 - Natural Language Merge Tool Context

```yaml
plan_unit_id: ACD-367
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Before emitting merge action, agent may run `git status` through normal tools, auto-scoped to bound worktree via `working_directory` or `/cwd`.
gui_related: false
gui_classification_reason: Tool context scoping is runtime behavior.
depends_on: [ACD-329, ACD-366]
unblocks: [ACD-368]
acceptance_criteria:
  - Agent may inspect `git status` through normal tools before emitting merge action.
  - Tool context scopes the check to the bound worktree working directory.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: tool_context
reasoning_tier: standard
context_scope: commands
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: natural_language_merge_tool_context
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0162
preserved_exact_tokens:
  - "git status"
  - "working_directory"
  - "/cwd"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-368 - Natural Language Merge Mode Guard

```yaml
plan_unit_id: ACD-368
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Agent natural-language merge is rejected in `ask` or `plan` with exact error copy; UI clicks remain allowed; agent can chain commit, merge, cleanup in one conversational exchange.
gui_related: true
gui_classification_reason: Mode guard error and UI click exception are visible chat behavior.
depends_on: [ACD-366, ACD-367]
unblocks: []
acceptance_criteria:
  - Agent natural-language merge is rejected in ask or plan mode with the exact error copy.
  - User UI clicks are always allowed.
  - Agent can chain commit, merge, and cleanup in a single conversational exchange.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: natural_language_merge
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/Run_Modes.md
node_compile_hint:
  mode: natural_language_merge_mode_guard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0162
preserved_exact_tokens:
  - "Merge is not available via assistant in {mode} mode. Use the Merge button in the chat header dropdown."
negative_constraints:
  - "Agent natural-language merge invocation is rejected in ask or plan mode."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### ACD-369 - Pre Merge Test Gate Settings

```yaml
plan_unit_id: ACD-369
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Pre-merge test gate runs project tests before committing a merge to verify integration, controlled by the four settings listed in W.9.
gui_related: false
gui_classification_reason: Pre-merge test gate purpose and settings are backend merge behavior.
depends_on: [ACD-338]
unblocks: [ACD-370]
acceptance_criteria:
  - Pre-merge test gate runs project tests before committing a merge.
  - Gate settings preserve bool, command, timeout, and target configuration.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: pre_merge_test
reasoning_tier: high
context_scope: merge
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: pre_merge_test_gate_settings
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0163
preserved_exact_tokens:
  - "branching.assistant_worktree_pre_merge_test"
  - "branching.assistant_worktree_pre_merge_cmd"
  - "branching.worktree_pre_merge_test_timeout_s"
  - "branching.assistant_worktree_pre_merge_test_target"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-370 - Pre Merge Test Command Override Boundary

```yaml
plan_unit_id: ACD-370
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: When `branching.assistant_worktree_pre_merge_cmd` is set, PM runs that exact command; when empty, PM auto-detects using rules in the next span.
gui_related: false
gui_classification_reason: Test command override and auto-detect boundary are backend behavior.
depends_on: [ACD-369]
unblocks: []
acceptance_criteria:
  - Explicit pre-merge command setting runs exactly as configured.
  - Empty command setting defers to auto-detection rules outside this batch.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: pre_merge_test
reasoning_tier: high
context_scope: merge
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: pre_merge_test_command_override_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0163
preserved_exact_tokens:
  - "empty = auto-detect"
  - "merged_result"
  - "branch_only"
negative_constraints:
  - "S0164 auto-detection rules are not imported into this batch."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-371 - Pre Merge Test Auto Detection Verification

```yaml
plan_unit_id: ACD-371
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Auto-detected pre-merge test commands require script/target verification, with only explicit file-presence-sufficient exceptions.
gui_related: false
gui_classification_reason: Test command detection is backend merge behavior.
depends_on: [ACD-370]
unblocks: [ACD-373, ACD-374]
acceptance_criteria:
  - Auto-detection verifies relevant script or target existence before inferring a command.
  - File-presence-sufficient rows are treated only as explicit convention-backed exceptions.
  - Detection matrix command and priority rows match the source span.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: pre_merge_test
reasoning_tier: high
context_scope: merge
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: pre_merge_test_auto_detection_verification
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0164
preserved_exact_tokens:
  - "branching.assistant_worktree_pre_merge_cmd"
  - "scripts.test"
  - "[tool.pytest]"
  - "test:"
  - "npm test"
  - "cargo test"
  - "pytest"
  - "go test ./..."
negative_constraints:
  - "Do not infer test commands from config-file presence alone except explicit file-presence-sufficient exceptions."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
```

### ACD-372 - Pre Merge Test Detection Priority

```yaml
plan_unit_id: ACD-372
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Multiple auto-detect matches use highest priority; persisted command overrides detection; clearing the setting reruns detection.
gui_related: false
gui_classification_reason: Detection priority and override behavior are backend settings behavior.
depends_on: [ACD-371]
unblocks: [ACD-373]
acceptance_criteria:
  - Multiple matches resolve to the highest-priority detected command.
  - Persisted command settings override auto-detection.
  - Clearing the persisted setting reruns auto-detection.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: pre_merge_test
reasoning_tier: standard
context_scope: merge
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: pre_merge_test_detection_priority
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0164
preserved_exact_tokens:
  - "Multiple matches → highest priority"
  - "Persisted command overrides auto-detection"
  - "Clear setting"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-373 - Pre Merge Test Detection First Run UX

```yaml
plan_unit_id: ACD-373
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: First run shows auto-detected command prefilled with `Change`; no detection while enabled shows info row, Settings link, skips tests, and does not block merge.
gui_related: true
gui_classification_reason: First-run prefill, Change link, info row, and Settings link are visible merge dialog UI.
depends_on: [ACD-371, ACD-372]
unblocks: [ACD-376]
acceptance_criteria:
  - First run shows the auto-detected test command prefilled.
  - User can change the command from the first-run UI.
  - No detection while enabled shows info row and Settings link, skips test step, and does not block merge.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: pre_merge_test_ui
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: pre_merge_test_detection_first_run_ux
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0164
preserved_exact_tokens:
  - "First run"
  - "Change"
  - "No test command detected"
  - "Settings"
  - "merge NOT blocked"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-374 - Merged Result Test Gate Execution

```yaml
plan_unit_id: ACD-374
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: "`merged_result` test gate preserves Squash, Merge, and Rebase execution order and the no-commit invariant before committing."
gui_related: false
gui_classification_reason: Test-gate execution ordering is backend Git behavior.
depends_on: [ACD-369, ACD-371]
unblocks: [ACD-377]
acceptance_criteria:
  - Squash, Merge, and Rebase merged-result strategies run tests before the merge result is committed.
  - Merge uses explicit `--no-commit`, while Squash leaves the result staged and uncommitted.
  - Rebase tests the post-rebase worktree before main repo fast-forward merge.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: pre_merge_test
reasoning_tier: high
context_scope: git
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: merged_result_test_gate_execution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0165
preserved_exact_tokens:
  - "git merge --squash"
  - "--no-ff --no-commit"
  - "git rebase {target}"
  - "git merge --ff-only"
  - "git reset --hard HEAD"
  - "git merge --abort"
  - "git rebase --abort"
negative_constraints:
  - "Squash/Merge test gate must not commit before tests pass."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
```

### ACD-375 - Branch Only Test Gate

```yaml
plan_unit_id: ACD-375
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: "`branch_only` tests run against the branch as-is before merge/rebase mutation; failure blocks merge with override."
gui_related: false
gui_classification_reason: Branch-only test target is backend merge behavior.
depends_on: [ACD-370, ACD-371]
unblocks: [ACD-376]
acceptance_criteria:
  - "`branch_only` tests run in the worktree before any merge or rebase operation."
  - Rebase plus branch_only runs tests before rebase begins.
  - Failure blocks merge while preserving override behavior.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: pre_merge_test
reasoning_tier: high
context_scope: git
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: branch_only_test_gate
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0165
preserved_exact_tokens:
  - "branch_only"
  - "BEFORE any merge/rebase operation"
  - "/rebase"
negative_constraints:
  - "`branch_only` must not test an already mutated merge/rebase state."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
```

### ACD-376 - Pre Merge Test Dialog UX

```yaml
plan_unit_id: ACD-376
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Test dialog transitions in-place to read-only test phase with live output, cancel, pass auto-proceed, failure/timeout/process-error UI, `Merge Anyway`, and seglog override.
gui_related: true
gui_classification_reason: Test phase, output region, pass/fail UI, override, and cancel behavior are visible dialog UI.
depends_on: [ACD-373, ACD-374, ACD-375]
unblocks: [ACD-377, ACD-378, ACD-394]
acceptance_criteria:
  - Merge dialog transitions in-place to read-only test phase with live output.
  - Passing tests auto-proceed to commit with a brief passed indicator.
  - Failure, timeout, and process error show failure UI with Merge Anyway and Cancel; override is recorded in seglog.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: pre_merge_test_ui
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: pre_merge_test_dialog_ux
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0166
preserved_exact_tokens:
  - "~200px max-height"
  - "Tests passed"
  - "Tests failed"
  - "Merge Anyway"
  - "Cancel"
  - "seglog records override"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-377 - Pre Merge Test Clean Abort

```yaml
plan_unit_id: ACD-377
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Clean abort paths keep repos out of half-committed state using strategy-specific cleanup.
gui_related: false
gui_classification_reason: Abort cleanup is backend Git state management.
depends_on: [ACD-374, ACD-376]
unblocks: [ACD-379, ACD-394]
acceptance_criteria:
  - Squash cleanup uses `git reset --hard HEAD`.
  - Merge cleanup uses `git merge --abort`.
  - Rebase cleanup uses `git rebase --abort`.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: pre_merge_test
reasoning_tier: high
context_scope: git
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: pre_merge_test_clean_abort
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0166
preserved_exact_tokens:
  - "git reset --hard HEAD"
  - "git merge --abort"
  - "git rebase --abort"
negative_constraints:
  - "Clean abort paths must keep the repo out of a half-committed state."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
```

### ACD-378 - Pre Merge Test Execution Environment

```yaml
plan_unit_id: ACD-378
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Test execution environment uses strategy/target working directory, platform shell command, no PM environment injection, merged stdout/stderr, remote host execution, and output normalization/caps.
gui_related: false
gui_classification_reason: Test execution environment and output handling are backend runtime behavior.
depends_on: [ACD-376]
unblocks: [ACD-379, ACD-397]
acceptance_criteria:
  - Test working directory depends on strategy and target.
  - Unix and Windows shells use the specified command wrappers.
  - Output handling merges stdout/stderr, caps output, strips ANSI, decodes UTF-8 lossily, and normalizes CRLF.
  - Remote SSH executes on the remote host.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: pre_merge_test
reasoning_tier: high
context_scope: runtime
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: pre_merge_test_execution_environment
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0166
preserved_exact_tokens:
  - "/bin/sh -c \"{command}\""
  - "cmd /c \"{command}\""
  - "No PM environment injection"
  - "1MB cap"
  - "ANSI stripped"
  - "UTF-8 lossy decode"
  - "CRLF normalized to LF"
  - "Remote SSH"
negative_constraints:
  - "PM must not inject environment variables into the test command."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Executor_Protocol.md
```

### ACD-379 - Pre Merge Test Recovery And PR Exclusion

```yaml
plan_unit_id: ACD-379
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Crash recovery handles orphaned test process and transitional repo state via WorktreeManager reconciliation; test gate does not apply to PR creation.
gui_related: false
gui_classification_reason: Crash recovery and PR exclusion are backend runtime boundaries.
depends_on: [ACD-377, ACD-378]
unblocks: []
acceptance_criteria:
  - WorktreeManager reconciliation detects merge or rebase transitional state on next launch.
  - Test gate does not apply to PR creation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: pre_merge_test
reasoning_tier: high
context_scope: recovery
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
  - Plans/GitHub_Integration.md
node_compile_hint:
  mode: pre_merge_test_recovery_pr_exclusion
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0166
preserved_exact_tokens:
  - ".git/MERGE_HEAD"
  - ".git/rebase-merge/"
  - "Test gate does NOT apply to PR creation"
negative_constraints:
  - "Pre-merge test gate does not gate PR creation."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
```

### ACD-380 - Worktree Binding Seglog Events

```yaml
plan_unit_id: ACD-380
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Binding lifecycle seglog events preserve bound, unbound, renamed, and create-failed event schemas.
gui_related: false
gui_classification_reason: Seglog event schemas are storage/audit behavior.
depends_on: [ACD-326]
unblocks: []
acceptance_criteria:
  - Binding lifecycle events preserve type names and required fields for bound, unbound, renamed, and create-failed events.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: seglog
reasoning_tier: standard
context_scope: storage
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: worktree_binding_seglog_events
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0167
preserved_exact_tokens:
  - "chat.thread_worktree_bound"
  - "chat.thread_worktree_unbound"
  - "chat.thread_worktree_renamed"
  - "chat.thread_worktree_create_failed"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-381 - Worktree Merge PR Seglog Events

```yaml
plan_unit_id: ACD-381
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Merge and PR seglog events preserve merged, merge failed, PR created, and PR failed schemas.
gui_related: false
gui_classification_reason: Merge/PR event schemas are storage/audit behavior.
depends_on: [ACD-347, ACD-365]
unblocks: []
acceptance_criteria:
  - Merge and PR lifecycle events preserve their type names and fields.
  - PR failure events preserve push/api phase values.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: seglog
reasoning_tier: standard
context_scope: storage
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/GitHub_Integration.md
node_compile_hint:
  mode: worktree_merge_pr_seglog_events
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0167
preserved_exact_tokens:
  - "chat.thread_worktree_merged"
  - "chat.thread_worktree_merge_failed"
  - "chat.thread_worktree_pr_created"
  - "chat.thread_worktree_pr_failed"
  - "phase"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-382 - Worktree Pre Merge Test Seglog Events

```yaml
plan_unit_id: ACD-382
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Pre-merge test seglog events preserve started, passed, and failed schemas including duration and override state.
gui_related: false
gui_classification_reason: Pre-merge test event schemas are storage/audit behavior.
depends_on: [ACD-369, ACD-376]
unblocks: []
acceptance_criteria:
  - Pre-merge test started, passed, and failed events preserve type names and fields.
  - Failed test events include override state.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: seglog
reasoning_tier: standard
context_scope: storage
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: worktree_pre_merge_test_seglog_events
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0167
preserved_exact_tokens:
  - "chat.thread_worktree_pre_merge_test_started"
  - "chat.thread_worktree_pre_merge_test_passed"
  - "chat.thread_worktree_pre_merge_test_failed"
  - "duration_ms"
  - "user_override"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-383 - Worktree Command Catalog

```yaml
plan_unit_id: ACD-383
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Command catalog preserves six `cmd.chat.worktree.*` commands, slash aliases, params, and surfaces; `/worktree merge` remains one command with flags.
gui_related: false
gui_classification_reason: Command catalog IDs, aliases, params, and surfaces are command-contract behavior.
depends_on: [ACD-347, ACD-366]
unblocks: [ACD-384]
acceptance_criteria:
  - Six worktree chat command IDs preserve their slash aliases, parameters, and surfaces.
  - "`/worktree merge` remains one command using flags rather than separate slash commands."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_catalog
reasoning_tier: high
context_scope: commands
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: worktree_command_catalog
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0168
preserved_exact_tokens:
  - "cmd.chat.worktree.create"
  - "cmd.chat.worktree.unbind"
  - "cmd.chat.worktree.remove"
  - "cmd.chat.worktree.merge"
  - "cmd.chat.worktree.pr"
  - "cmd.chat.worktree.info"
  - "/worktree merge [--squash\\|--rebase]"
negative_constraints:
  - "Separate slash commands are not introduced for squash or rebase."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### ACD-384 - Worktree Command Visibility Enablement

```yaml
plan_unit_id: ACD-384
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Command visibility and enablement follow binding, git, active-run, merge-lock, dirty, conflict, detached HEAD, and GitHub-remote conditions.
gui_related: true
gui_classification_reason: Command visibility and enablement are visible UI state.
depends_on: [ACD-383, ACD-351]
unblocks: []
acceptance_criteria:
  - Worktree commands are visible only under the specified binding/git/GitHub-remote conditions.
  - Worktree commands are enabled only under the specified active-run, lock, dirty, conflict, detached HEAD, and remote conditions.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_catalog
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: worktree_command_visibility_enablement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0168
preserved_exact_tokens:
  - "Visible when"
  - "Enabled when"
  - "No active run"
  - "no merge lock"
  - "not dirty"
  - "not detached HEAD"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### ACD-385 - File Manager Worktree Root Follow

```yaml
plan_unit_id: ACD-385
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: File manager follows bound thread root when enabled, with breadcrumb glyph, branch name, binary swap toggle, reset on thread switch, and accessible label.
gui_related: true
gui_classification_reason: File manager root switching, breadcrumb, toggle, and label are visible UI.
depends_on: [ACD-329, ACD-338]
unblocks: [ACD-386, ACD-387, ACD-394]
acceptance_criteria:
  - File manager root switches to the bound worktree on thread focus when follow-thread setting is true.
  - Breadcrumb shows worktree glyph, branch name, and binary swap toggle.
  - Toggle resets on any thread switch and accessible label copy is preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: file_manager_worktree
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FileManager.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: file_manager_worktree_root_follow
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0169
preserved_exact_tokens:
  - "file_manager.worktree_follow_thread"
  - "Worktree glyph"
  - "Binary toggle"
  - "Viewing worktree assistant/fix-auth. Click to switch to project root."
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FileManager.md
```

### ACD-386 - File Manager Worktree UI Scope

```yaml
plan_unit_id: ACD-386
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: File manager UI scope rules preserve unaffected editor tabs, search under current root, project-scoped quick-open, and unbound fallback toast.
gui_related: true
gui_classification_reason: File manager search/root behavior, quick-open scope, and fallback toast are visible UI behavior.
depends_on: [ACD-385]
unblocks: []
acceptance_criteria:
  - Editor tabs are not affected by file manager root switches.
  - File manager search follows the current file manager root.
  - Quick-open remains project-scoped.
  - Unbinding falls back to project root with the specified toast.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: file_manager_worktree
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FileManager.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: file_manager_worktree_ui_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0169
preserved_exact_tokens:
  - "Open editor tabs NOT affected"
  - "Quick-open (Ctrl+P)"
  - "Worktree unbound — showing project root."
negative_constraints:
  - "Quick-open remains project-scoped regardless of worktree context."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FileManager.md
```

### ACD-387 - Worktree Working Directory Consumers

```yaml
plan_unit_id: ACD-387
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: "`@file`, MCP tools, and `/providers` use the bound thread worktree path as `working_directory`."
gui_related: false
gui_classification_reason: Consumer working-directory resolution is runtime/context behavior.
depends_on: [ACD-329, ACD-385]
unblocks: [ACD-388]
acceptance_criteria:
  - "`@file` resolves relative to the thread's active working directory."
  - MCP tools and providers receive the thread worktree path when a worktree binding is active.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_identity
reasoning_tier: high
context_scope: runtime
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - Plans/FileManager.md
node_compile_hint:
  mode: worktree_working_directory_consumers
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0169
preserved_exact_tokens:
  - "@file"
  - "working_directory"
  - "MCP tools"
  - "/providers"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-388 - Worktree Relative File Edit Cards

```yaml
plan_unit_id: ACD-388
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Chat file-edit cards display paths relative to active `working_directory` without rewriting captured absolute mutation-log paths.
gui_related: true
gui_classification_reason: File-edit card path display is visible chat UI.
depends_on: [ACD-387]
unblocks: []
acceptance_criteria:
  - Bound threads show worktree-relative file-edit card paths.
  - Captured absolute mutation-log paths are not rewritten.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: file_card_paths
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: worktree_relative_file_edit_cards
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0169
preserved_exact_tokens:
  - "File-edit card path semantics"
  - "active `working_directory`"
  - "captured absolute mutation-log paths"
negative_constraints:
  - "Captured absolute mutation-log paths must not be rewritten."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-389 - LSP Worktree Root Identity

```yaml
plan_unit_id: ACD-389
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: LSP sessions remain keyed by `(host_id, server_id, root_identity)`; different worktree paths naturally create separate sessions with no new keying model.
gui_related: false
gui_classification_reason: LSP root identity and keying are backend integration behavior.
depends_on: [ACD-329]
unblocks: [ACD-390]
acceptance_criteria:
  - Worktree paths produce distinct LSP root identities under the existing keying model.
  - No new LSP session keying model is introduced.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: lsp_worktree
reasoning_tier: standard
context_scope: lsp
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/LSPSupport.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: lsp_worktree_root_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0170
preserved_exact_tokens:
  - "(host_id, server_id, root_identity)"
  - "No new keying model needed"
negative_constraints:
  - "Do not introduce a new LSP keying model for worktrees."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/LSPSupport.md
```

### ACD-390 - LSP Worktree Session Lifecycle

```yaml
plan_unit_id: ACD-390
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Thread focus change drives workspace-folder/session updates; diagnostics/hover/completion use worktree state; sessions lazy-create, idle-collect after 5 minutes, and destroy on worktree removal.
gui_related: false
gui_classification_reason: LSP workspace folder updates and session lifecycle are backend integration behavior.
depends_on: [ACD-389]
unblocks: []
acceptance_criteria:
  - Thread focus changes trigger workspace folder updates or lazy session initialization.
  - Diagnostics, hover, and completion operate against worktree file state.
  - Worktree LSP sessions idle-collect after five minutes with no open files and are destroyed when the worktree is removed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: lsp_worktree
reasoning_tier: standard
context_scope: lsp
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/LSPSupport.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: lsp_worktree_session_lifecycle
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0170
preserved_exact_tokens:
  - "workspace/didChangeWorkspaceFolders"
  - "Diagnostics/hover/completion"
  - "5 minutes"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/LSPSupport.md
```

### ACD-391 - Remote SSH Worktree Host Authority

```yaml
plan_unit_id: ACD-391
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Remote SSH worktree creation follows project host authority, runs WorktreeManager on the remote host, uses remote filesystem paths, and forbids silent local fallback or `/mirror` authority.
gui_related: false
gui_classification_reason: Remote host authority and filesystem behavior are backend runtime constraints.
depends_on: [ACD-329]
unblocks: [ACD-392, ACD-393]
acceptance_criteria:
  - WorktreeManager executes on the remote host for remote SSH projects.
  - Worktree, FileSafe, terminal, editor, provider, and file manager paths use the remote filesystem.
  - PM does not create a silent local checkout or primary local mirror for remote-mode projects.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: remote_worktree
reasoning_tier: high
context_scope: remote
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/GitHub_Integration.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: remote_ssh_worktree_host_authority
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0171
preserved_exact_tokens:
  - "WorktreeManager"
  - "remote host via SSH subprocess"
  - "No silent local fallback"
  - "/mirror"
  - "/offline"
  - "SFTP"
  - "SSH `find`/`ls`"
  - "/session-supervision"
negative_constraints:
  - "PM MUST NOT create a silent local checkout `/mirror` as primary authority."
  - "Remote editing is not a download-edit-upload flow unless an explicit degraded `/offline` cache path is surfaced."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/GitHub_Integration.md
```

### ACD-392 - Remote Provider CLI Fallback Constraint

```yaml
plan_unit_id: ACD-392
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Missing remote provider CLIs degrade or mark provider capability unavailable; PM may probe remote CLIs but must not auto-install or retarget to local CLI silently.
gui_related: false
gui_classification_reason: Remote provider CLI fallback is runtime/provider behavior.
depends_on: [ACD-391]
unblocks: []
acceptance_criteria:
  - Missing remote provider CLIs surface degraded or unavailable capability.
  - PM may probe configured provider CLIs on the remote host.
  - PM does not auto-install missing provider CLIs or silently retarget provider execution to a local CLI.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: remote_provider
reasoning_tier: high
context_scope: remote
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/GitHub_Integration.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: remote_provider_cli_fallback_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0171
preserved_exact_tokens:
  - "MUST NOT auto-install"
  - "explicit user consent"
  - "MUST NOT retarget provider execution to a local CLI"
negative_constraints:
  - "PM must not auto-install a missing remote provider CLI without explicit user consent and provisioning confirmation."
  - "PM must not retarget provider execution to a local CLI as a silent fallback."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/GitHub_Integration.md
```

### ACD-393 - Remote Owner Consumer Boundary

```yaml
plan_unit_id: ACD-393
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Remote owner/consumer boundary stays with `GitHub_Integration.md §C`; chat consumes remote-state vocabulary and owns only preview/reveal/confirmation surfaces for `/file-manager/remote/review/runtime`.
gui_related: false
gui_classification_reason: Remote owner/consumer boundaries are cross-doc ownership constraints.
depends_on: [ACD-391]
unblocks: []
acceptance_criteria:
  - GitHub Integration owns remote host identity, reconnect policy, and remote-means-remote semantics.
  - Assistant chat consumes remote-state vocabulary alongside File Manager, editor, terminal, and LSP.
  - Assistant chat owns only preview, reveal, and confirmation surfaces in the remote review runtime handoff.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary
reasoning_tier: high
context_scope: remote
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/GitHub_Integration.md
  - Plans/FileManager.md
node_compile_hint:
  mode: remote_owner_consumer_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0171
preserved_exact_tokens:
  - "GitHub_Integration.md §C"
  - "offline"
  - "stale"
  - "retrying"
  - "/pending-write"
  - "read-only"
  - "/file-manager/remote/review/runtime"
negative_constraints:
  - "Assistant chat must never silently substitute local host behavior for a remote-mode project."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/GitHub_Integration.md
```

### ACD-394 - Worktree Lifecycle Error Handling

```yaml
plan_unit_id: ACD-394
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Worktree lifecycle errors preserve dialog/toast/retry/cancel behavior for create failure, auto-create failure, rename failure, missing path, remove blocked, branch collision, 1:1 violation, project switch, and deleted path revert.
gui_related: true
gui_classification_reason: Lifecycle errors are surfaced through dialogs, toasts, disabled buttons, and retry/cancel UI.
depends_on: [ACD-332, ACD-343, ACD-385]
unblocks: []
acceptance_criteria:
  - Create, auto-create, branch rename, missing path, removal, collision, 1:1 violation, project switch, and deleted path errors preserve specified user-visible behavior.
  - Missing paths auto-unbind with `path_missing` and are not recreated.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_errors
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: worktree_lifecycle_error_handling
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0172
preserved_exact_tokens:
  - "path_missing"
  - "Already bound to thread '{title}'"
  - "Worktree belongs to project '{name}'"
  - "-2"
  - "-3"
negative_constraints:
  - "PM does not re-create the missing worktree."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-395 - Merge Test Lock Error Handling

```yaml
plan_unit_id: ACD-395
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Merge/test/lock errors preserve inline dialog errors, conflict routing, lock contention, test failures, truncation, detached HEAD, hook rejection, stale lock startup cleanup, and binding-disappears-mid-dialog final behavior.
gui_related: true
gui_classification_reason: Merge/test/lock errors are user-visible dialog, toast, and disabled-state behavior.
depends_on: [ACD-351, ACD-354, ACD-376, ACD-377]
unblocks: []
acceptance_criteria:
  - Merge, conflict, lock, test, detached HEAD, hook, stale lock, and disappearing-binding errors preserve their specified user-visible behavior.
  - Binding disappearance after dialog open prevents merge execution and closes with an error.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: merge_errors
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: merge_test_lock_error_handling
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0172
preserved_exact_tokens:
  - "Another merge in progress"
  - "[OUTPUT TRUNCATED]"
  - "Merge failed: {hook} rejected commit"
  - "Auto-remove if PID dead or >5 min"
  - "binding-disappears-mid-dialog"
negative_constraints:
  - "No merge executes after the when-clause and binding re-check fail."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-396 - Worktree UI Acceptance Criteria

```yaml
plan_unit_id: ACD-396
unit_type: validation_rule
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: UI acceptance criteria preserve header, settings, thread selector, file manager, merge-back, natural-language guard, and failure override checks.
gui_related: true
gui_classification_reason: Acceptance criteria cover visible UI features and interactions.
depends_on: [ACD-322, ACD-338, ACD-341, ACD-385, ACD-347, ACD-368, ACD-376]
unblocks: []
acceptance_criteria:
  - Worktree UI acceptance coverage preserves the listed AC identifiers and feature groups.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: acceptance
reasoning_tier: standard
context_scope: validation
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: worktree_ui_acceptance_criteria
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0173
preserved_exact_tokens:
  - "AC-1"
  - "AC-16"
  - "AC-25"
  - "AC-28"
  - "AC-66"
  - "AC-84"
  - "AC-89"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-397 - Worktree Runtime Acceptance Criteria

```yaml
plan_unit_id: ACD-397
unit_type: validation_rule
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Runtime/test acceptance criteria preserve LSP, lifecycle, pre-merge test, clean rollback, PR exclusion, exclusive lock, and remote SSH execution checks.
gui_related: false
gui_classification_reason: Acceptance criteria cover runtime, LSP, test, lock, and remote behavior.
depends_on: [ACD-389, ACD-380, ACD-369, ACD-377, ACD-379, ACD-354, ACD-391]
unblocks: []
acceptance_criteria:
  - Runtime/test acceptance coverage preserves the listed AC identifiers and feature groups.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: acceptance
reasoning_tier: standard
context_scope: validation
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: worktree_runtime_acceptance_criteria
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0173
preserved_exact_tokens:
  - "AC-29"
  - "AC-35"
  - "AC-86"
  - "AC-99"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-398 - Worktree UI MVP Non Goals

```yaml
plan_unit_id: ACD-398
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: UI/MVP non-goals preserve no GUI emojis, no Bind Existing MVP, no inline chat history markers, main-repo Changes scope, and no thread export metadata.
gui_related: true
gui_classification_reason: UI/MVP non-goals constrain visible Worktree UI behavior.
depends_on: []
unblocks: []
acceptance_criteria:
  - Worktree UI excludes GUI emojis, Bind Existing MVP, inline chat history markers, worktree-scoped Changes, and thread export metadata.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: scope_non_goal
reasoning_tier: standard
context_scope: mvp
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: worktree_ui_mvp_non_goals
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0174
preserved_exact_tokens:
  - "No emojis in the GUI"
  - "No \"Bind Existing\" in MVP"
  - "owner_node_id"
  - "Changes section always shows main repo"
negative_constraints:
  - "No Bind Existing in MVP."
  - "No inline chat history markers for worktree context changes."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-399 - Worktree Backend Lifecycle Non Goals

```yaml
plan_unit_id: ACD-399
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Backend/lifecycle non-goals preserve no orchestrator worktree changes, submodules out of scope, no undo, no per-merge override, no uninstall auto-clean, no special terminal management, and no orchestrator-to-assistant transfer.
gui_related: false
gui_classification_reason: Backend/lifecycle non-goals constrain runtime and ownership scope.
depends_on: []
unblocks: []
acceptance_criteria:
  - Worktree backend/lifecycle scope excludes orchestrator worktree changes, submodules, undo, per-merge command override, uninstall cleanup, special terminal management, and orchestrator-to-assistant transfer.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: scope_non_goal
reasoning_tier: standard
context_scope: mvp
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: worktree_backend_lifecycle_non_goals
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0174
preserved_exact_tokens:
  - "Git submodules out of scope"
  - "App uninstall does NOT auto-clean worktrees"
  - "no special terminal management"
negative_constraints:
  - "No changes to orchestrator's own worktree management."
  - "No orchestrator-to-assistant worktree transfer on handoff."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
```

### ACD-400 - Chat Actor Runtime Identity Boundary

```yaml
plan_unit_id: ACD-400
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Chat actors share runtime identity semantics but remain chat/session actors, not nodes or lanes; requested/effective identity fields are visible in chat surfaces and child handoffs.
gui_related: false
gui_classification_reason: Actor identity boundary is runtime semantics, while visible display is covered by acceptance.
depends_on: []
unblocks: []
acceptance_criteria:
  - Chat actors share runtime identity semantics with Orchestrator and Interview agents.
  - Chat actors remain chat/session actors and do not become nodes or lanes when delegating.
  - Requested/effective runtime identity, execution role, and operational identity are visible on chat surfaces and child handoffs.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: actor_boundary
reasoning_tier: high
context_scope: runtime_identity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: chat_actor_runtime_identity_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0175
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0176
preserved_exact_tokens:
  - "execution_role"
  - "operational_identity"
  - "package-overseer"
  - "seam-overseer"
negative_constraints:
  - "Delegating to subagents does not make chat actors nodes or lanes."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/interview-subagent-integration.md
```

### ACD-401 - Chat Route Args Immutability

```yaml
plan_unit_id: ACD-401
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Route args are included from parent run/session, govern accessible tools/subagents, and remain immutable for the chat session.
gui_related: false
gui_classification_reason: Route payload immutability is runtime routing behavior.
depends_on: []
unblocks: []
acceptance_criteria:
  - Chat context includes route args from the parent run or session.
  - Route args govern accessible tools and subagents.
  - Route args remain immutable for the chat session.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_payload
reasoning_tier: high
context_scope: routing
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: chat_route_args_immutability
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0175
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0177
preserved_exact_tokens:
  - "route args"
  - "immutable"
  - "dynamic route changes are prohibited"
negative_constraints:
  - "Dynamic route changes are prohibited for the duration of the chat session."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### ACD-402 - Chat Blocked Notice Packet

```yaml
plan_unit_id: ACD-402
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Unresolved route/context queries emit structured `blocked_notice` packets
  with reason, detail refs, preserved-local-work summary, and ordered allowed
  actions; older `pre-runtime-escalation` wizard shape is compatibility evidence
  only.
gui_related: false
gui_classification_reason: Blocked notice packet content is runtime/route behavior.
depends_on: []
unblocks: []
acceptance_criteria:
  - Blocked notices include blocked reason, detail reference, applicable attempt/node refs, preserved-local-work summary, and ordered allowed actions.
  - Wizard and node blocked states consume the stronger blocked taxonomy.
  - Older pre-runtime escalation wizard shape remains compatibility evidence only.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_notice
reasoning_tier: high
context_scope: routing
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: chat_blocked_notice_packet
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0175
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0178
preserved_exact_tokens:
  - "blocked_notice"
  - "/attempt"
  - "allowed_action_ids[]"
  - "wizard.blocked"
  - "node.blocked"
  - "pre-runtime-escalation"
negative_constraints:
  - "Blocked notices are distinct from errors."
  - "Older `pre-runtime-escalation` wizard shape is compatibility evidence, not a separate live state."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Executor_Protocol.md
```

### ACD-403 - Shared Conversational Runtime Identity

```yaml
plan_unit_id: ACD-403
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Assistant chat, interview, requirements-doc-builder, and PRD builder share `/account/usage/runtime` identity behavior and requested/effective provider/model/persona/account/auth display while remaining conversational/document-production actors.
gui_related: true
gui_classification_reason: Requested/effective provider/model/persona/account/auth display is visible conversational actor UI.
depends_on: [ACD-400]
unblocks: [ACD-404, ACD-405, ACD-406]
acceptance_criteria:
  - Conversational actors share account/usage/runtime identity behavior and requested/effective identity display.
  - Conversational actors remain conversational or document-production actors rather than orchestration nodes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_identity
reasoning_tier: high
context_scope: actor_identity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: shared_conversational_runtime_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0179
preserved_exact_tokens:
  - "/account/usage/runtime"
  - "/model/effort/persona"
  - "/brainstorming"
  - "/artifacts"
  - "/rules"
  - "/contract"
negative_constraints:
  - "Requirements-doc-builder and PRD flows are not orchestration-style HITL escalation routes."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/interview-subagent-integration.md
```

### ACD-404 - Conversational Runtime Recovery Boundary

```yaml
plan_unit_id: ACD-404
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Blocked `/HITL/critical` resolution-thread pattern must not be projected back onto ordinary assistant/interview/requirements-builder conversation, and adjacent runtime recovery owners must not soften chat `/effective` identity or safe-point rules.
gui_related: false
gui_classification_reason: Runtime recovery boundary is ownership/runtime behavior.
depends_on: [ACD-403]
unblocks: []
acceptance_criteria:
  - Orchestrator HITL resolution-thread behavior is not projected onto ordinary conversational actors.
  - Adjacent runtime recovery owners preserve chat effective identity and safe-point rules.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_recovery
reasoning_tier: high
context_scope: actor_identity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Architecture_Invariants.md
  - Plans/Decision_Log.md
  - Plans/MiscPlan.md
  - Plans/FileSafe.md
node_compile_hint:
  mode: conversational_runtime_recovery_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0179
preserved_exact_tokens:
  - "/HITL/critical"
  - "/interviewer/requirements-builder"
  - "Architecture_Invariants.md"
  - "Decision_Log.md"
  - "MiscPlan.md"
  - "FileSafe.md"
  - "/remediation"
negative_constraints:
  - "Ordinary conversational actors do not become Orchestrator-style resolution objects."
  - "Under-documentation in adjacent docs must not soften chat's own `/effective` identity and safe-point rules."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Architecture_Invariants.md
```

### ACD-405 - Execution Policy UI Identity Split

```yaml
plan_unit_id: ACD-405
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Execution-policy `/UI` split keeps worker kind and retry-context policy separate, exposes requested-identity override/display/account disclosure, and aligns requested/effective identity across chat and orchestration actors.
gui_related: true
gui_classification_reason: Requested identity override/display and account disclosure are visible UI behavior.
depends_on: [ACD-403]
unblocks: []
acceptance_criteria:
  - Worker kind and retry-context policy remain separate settings.
  - Requested identity override, display, execution role, actor kind, platform/model identity, account switch identity, and account disclosure are exposed.
  - Requested/effective identity aligns across chat actors and orchestration actors.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: execution_policy
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: execution_policy_ui_identity_split
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0179
preserved_exact_tokens:
  - "/UI"
  - "execution_role"
  - "actor_kind"
  - "/platform/model-level"
  - "/account/switch"
  - "delegated-worker provider/model/effort policy"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-406 - Chat Package Seam Lane Boundary

```yaml
plan_unit_id: ACD-406
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Package/seam/lane schema questions stay owned by package `/seam/lane` family; chat may render a small `inspector_target` route, attempt/lane/session-aware attribution, and persisted `auto` selections must retain resolved reason.
gui_related: true
gui_classification_reason: Inspector routes and live attribution are visible chat UI behavior.
depends_on: [ACD-403]
unblocks: []
acceptance_criteria:
  - Package, seam, lane, promotion, review, and resolution-thread schemas remain owned by the package/seam/lane family.
  - Chat inspector target enum stays small and does not become a fallback bag.
  - Live attribution is attempt/lane/session-aware and avoids tier-only routing.
  - Historical auto persona/model selections preserve resolved effective reason.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary
reasoning_tier: high
context_scope: actor_identity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chat_package_seam_lane_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0179
preserved_exact_tokens:
  - "package"
  - "seam"
  - "lane"
  - "resolution_thread"
  - "inspector_target"
  - "attempt_id"
  - "scheduler_lane"
  - "tier_id"
  - "/widget"
  - "auto"
  - "/reason"
negative_constraints:
  - "`inspector_target` must never become a fallback bag for unresolved route design."
  - "Live page/widget attribution avoids tier-only routing through `tier_id` or generic `/widget` summaries."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-407 - Permission Approval Scope Boundary

```yaml
plan_unit_id: ACD-407
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Permission approval state is scoped by canonical actor/account/lane key and must not leak across lanes, accounts, or shared-runtime actors.
gui_related: false
gui_classification_reason: Permission approval scope is runtime policy behavior.
depends_on: []
unblocks: []
acceptance_criteria:
  - Permission approval state is scoped by canonical actor/account/lane scope key.
  - Permission approval does not leak across lanes, accounts, or shared-runtime actors.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: permissions
reasoning_tier: high
context_scope: permissions
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: permission_approval_scope_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0180
preserved_exact_tokens:
  - "always"
  - "reject-cascade"
  - "doom-loop"
  - "todoread"
  - "todowrite"
  - "/member/lane/account-bounded"
negative_constraints:
  - "Permission approval state must not leak across lanes, accounts, or shared-runtime actors."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Permissions_System.md
```

### ACD-408 - Worker Handoff Retry Memory Records

```yaml
plan_unit_id: ACD-408
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Worker handoff and `/retry` memory are project-scoped structured runtime records, not vague JSON-like logs; projections and bounded worker packets stay separate from full raw history.
gui_related: false
gui_classification_reason: Worker handoff/retry memory records are runtime/storage behavior.
depends_on: []
unblocks: []
acceptance_criteria:
  - Worker handoff and retry memory use concrete project-scoped structured runtime records.
  - Worker-facing handoff packets stay bounded and separate from full raw history.
  - Backing storage path/domain and projection ownership must be explicit.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worker_handoff
reasoning_tier: high
context_scope: storage
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: worker_handoff_retry_memory_records
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0180
preserved_exact_tokens:
  - "/retry"
  - "/JSONL/redb-backed"
  - "/path/delivery"
  - "/projections"
negative_constraints:
  - "Worker handoff and `/retry` memory must not be vague JSON-like logs."
  - "Full raw history must not be treated as the worker-facing handoff packet."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### ACD-409 - History Settings Graph Performance

```yaml
plan_unit_id: ACD-409
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: History remains chronological but windowed; Settings show source-axis inheritance and override origin; graph/history consumers use culling, virtualization, layout caching, incremental updates, throttling, and canvas fallback.
gui_related: true
gui_classification_reason: History, Settings, graph, and performance behavior are visible UI surfaces.
depends_on: []
unblocks: []
acceptance_criteria:
  - History uses chronological windowed loading with older-item controls and event burst collapse.
  - Settings show inheritance and override origin.
  - Graph/history consumers use viewport culling, overscan, layout caching, incremental updates, burst throttling, and canvas fallback.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: history_performance
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: history_settings_graph_performance
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0180
preserved_exact_tokens:
  - "History"
  - "load-older"
  - "Settings"
  - "origin"
  - "viewport culling"
  - "overscan"
  - "canvas-style rendering"
negative_constraints:
  - "`origin` is audit-only and must never become behavior-driving actor identity."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-410 - Internal Target Payload Navigation

```yaml
plan_unit_id: ACD-410
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: CtA cards, blocked notices, search results, artifact pivots, thread usage jumps, command palette entries, FileManager, and `/Editor` opens resolve through the same internal target payload model; `cmd.chat.focus_thread_usage` focuses thread Usage detail and may dock/floating.
gui_related: true
gui_classification_reason: Target payload navigation affects visible CtA, blocked, search, artifact, FileManager, editor, and usage surfaces.
depends_on: [ACD-402]
unblocks: []
acceptance_criteria:
  - Chat target restores destination and scope using a shared internal payload model.
  - Command palette entries, search results, artifact deep-links, blocked notices, and FileManager/editor opens resolve through this target model.
  - Thread usage focus command targets the thread Usage detail surface.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: navigation_payload
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/FileManager.md
node_compile_hint:
  mode: internal_target_payload_navigation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0180
preserved_exact_tokens:
  - "cmd.chat.focus_thread_usage"
  - "allowed_action_ids[]"
  - "/floating"
  - "/Editor"
negative_constraints:
  - "Assistant chat must not invent thread-local recovery semantics."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-411 - Route Catalog Determinism

```yaml
plan_unit_id: ACD-411
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Route catalog policy is deterministic, avoids public `cmd.nav.*`/`cmd.nav` as primary answer, bans hedge words, keeps wizard-step detail narrow, and preserves `OpenFile` `/editor` scope plus `OpenSubject` identity-open contract; reconciliation gaps are spec-integrity failures.
gui_related: false
gui_classification_reason: Route catalog policy and identity-open contracts are navigation/routing constraints.
depends_on: [ACD-410]
unblocks: []
acceptance_criteria:
  - Route catalog policy is deterministic and avoids public `cmd.nav.*`/`cmd.nav` as the main catalog-facing answer.
  - Canonical direction avoids hedge words and states allowed serialized data classes directly.
  - "`OpenFile` and `OpenSubject` preserve their scoped contracts."
  - Owner-consumer gaps are treated as spec-integrity failures.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_catalog
reasoning_tier: high
context_scope: routing
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/FileManager.md
node_compile_hint:
  mode: route_catalog_determinism
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0180
preserved_exact_tokens:
  - "cmd.nav.*"
  - "cmd.nav"
  - "optional"
  - "maybe"
  - "OpenFile"
  - "/editor"
  - "OpenSubject"
  - "spec-integrity failures"
negative_constraints:
  - "Do not make a large public `cmd.nav.*` or `cmd.nav` family the main catalog-facing answer."
  - "Do not use hedge words such as `optional` or `maybe` when stating canonical direction."
  - "The remaining work is reconciliation-order implementation, not open-ended research or model invention."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### ACD-412 - Assistant Chat Owner Consumer Preservation

```yaml
plan_unit_id: ACD-412
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: This standardization preserves original owner/consumer boundaries; `Plans/assistant-chat-design.md` remains owner for its described behavior and cross-doc ownership follows ContractRefs and boundary notes.
gui_related: false
gui_classification_reason: Owner/consumer preservation is plan governance behavior.
depends_on: []
unblocks: []
acceptance_criteria:
  - Assistant Chat remains owner for behavior described by its preserved sections.
  - Cross-doc ownership follows preserved ContractRefs and boundary notes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary
reasoning_tier: standard
context_scope: governance
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Plan_Document_System.md
  - Plans/Bootstrap_Planning_Migration.md
node_compile_hint:
  mode: assistant_chat_owner_consumer_preservation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0181
preserved_exact_tokens:
  - "Owner / Consumer Map"
  - "Plans/assistant-chat-design.md"
  - "ContractName:Plans/Plan_Document_System.md"
  - "ContractName:Plans/Bootstrap_Planning_Migration.md"
negative_constraints: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Plan_Document_System.md
```
