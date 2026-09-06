# Shard 041: Assistant Redesign Consumer Addendum - 2026-09-03

Source: `Plans/Tools.md`

Source lines: L12539-L12768

Source SHA256: `151ae97002f04f5abb1a940614750fb3417e0c7ddec0b530358a58b333a2cc6f`

---

## Assistant Redesign Consumer Addendum - 2026-09-03

### T-179 - To-Do Tool Proposal Semantics And Receipted Item Transitions

```yaml
plan_unit_id: T-179
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  The todowrite tool and every provider-native TodoWrite-style whole-list payload are proposal endpoints that Tools
  normalizes, binds to exact thread, project, list revision, actor, permission snapshot, and idempotency key, and hands
  to the ToDoController owned by Plans/ToDo_Runtime.md for reconciliation against the canonical list; whole-list
  replacement is never live authority, per-item proposal outcomes are returned individually, and every canonical status
  change is one receipted transition carrying item-level cause evidence with a satisfied expected outcome rather than a
  bare tool success.
gui_related: true
gui_classification_reason: Determines what the Activity To-Do list and approval prompts may show as an applied change versus a proposal outcome.
depends_on: [T-027, T-028, T-007, T-076]
unblocks: []
acceptance_criteria:
  - A whole-list payload with a stale or absent expected list revision is reconciled or rejected and never overwrites the canonical list.
  - A mixed payload returns per-item accepted and rejected outcomes with exact reasons and drops no item from the envelope.
  - A green tool receipt without a satisfied expected outcome and a terminal successful work binding cannot produce a completed transition.
  - todoread remains a projection read and never appears as a source_surface mutation source.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plan-index.py validate
risk_class: todo_whole_list_authority_drift
reasoning_tier: high
context_scope: todo_tool_proposal_boundary
implementation_surfaces:
  - Plans/Tools.md
  - Plans/ToDo_Runtime.md
node_compile_hint:
  mode: todo_tool_proposal_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:TODO-009
  - pm-assistant-implementation-2026-09-02-recovered:TODO-010
  - pm-assistant-implementation-2026-09-02-recovered:TODO-011
  - pm-assistant-implementation-2026-09-02-recovered:TODO-012
  - pm-assistant-implementation-2026-09-02-recovered:PROVIDER-007
source_atom_ids: []
preserved_exact_tokens:
  - todowrite
  - todoread
  - TodoWrite
  - ToDoController
  - pm.chat.todo_item.v2
  - pm.chat.todo_transition.v1
  - pm.chat.todo_work_binding.v1
negative_constraints:
  - Do not let a whole-list payload directly mark canonical items complete.
  - Do not collapse a mixed proposal result into one success or one failure.
  - Do not move To-Do semantics, hierarchy, statuses, or rollups into Tools.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/Tools.md
  - Plans/ToDo_Runtime.md
```

### T-180 - Canonical Read-Only Tool Profile For Advisors And Reviewers

```yaml
plan_unit_id: T-180
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  Tools defines exactly one canonical read-only tool profile admitting search/read, grep and LSP diagnostics,
  diff and source-control inspection, test and build output inspection, artifact/receipt/Usage lookup, ordinary browser
  inspection, and network-policy-bounded research, while forbidding project write, mutating shell, installation or MCP
  mutation, approval, permission or credential mutation, publish/deploy/merge/commit, the protected authentication
  browser, and direct primary-run control; Back Seat Driver, Review, and BrainStorm consume this profile by ID and no
  parent run, Persona, Skill, or provider adapter may widen it.
gui_related: true
gui_classification_reason: The profile and its narrowing source are shown in advisor and participant detail surfaces and gate visible tool controls.
depends_on: [T-007, T-074, T-092]
unblocks: []
acceptance_criteria:
  - Each forbidden capability class is rejected under the profile including protected authentication browser access.
  - A route that cannot honor the read-only boundary returns an availability failure naming the unsatisfied profile instead of a downgraded profile.
  - Review holds no direct mutating tool against its frozen target and BrainStorm holds none against the target project.
  - Persona or Skill selection never adds a tool outside the profile.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plan-index.py validate
risk_class: read_only_profile_widening
reasoning_tier: high
context_scope: read_only_tool_profile
implementation_surfaces:
  - Plans/Tools.md
  - Plans/Back_Seat_Driver.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: read_only_tool_profile_owner
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-011
  - pm-assistant-implementation-2026-09-02-recovered:REVIEW-011
  - pm-assistant-implementation-2026-09-02-recovered:BRAIN-007
source_atom_ids: []
preserved_exact_tokens:
  - read_only_tool_profile_id
  - protected authentication browser
negative_constraints:
  - Do not define a second read-only profile in an advisor, reviewer, or workflow document.
  - Do not permit per-run widening of the profile.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/Tools.md
  - Plans/Back_Seat_Driver.md
```

### T-181 - Collaborative Participant Tool Dispatch Without A Workflow Registry

```yaml
plan_unit_id: T-181
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  Plans/Collaborative_Workflows.md selects per-participant tools and discloses requested versus effective assignment
  while Tools remains the sole tool authority that registers, resolves, dispatches, receipts, and attributes every
  participant invocation; a participant effective tool set is the intersection of its requested set, the workflow tool
  policy, and the parent permission ceiling frozen at run start, cannot be widened by the participant or its
  coordinator, and there is no workflow-local tool registry, schema, permission path, or receipt format.
gui_related: true
gui_classification_reason: Participant rows and panels display exact requested and effective tool sets and their narrowing source.
depends_on: [T-002, T-005, T-058, T-074]
unblocks: []
acceptance_criteria:
  - Effective participant tool sets are computed by intersection and never by union.
  - A coordinator cannot grant a member a tool outside the frozen parent ceiling.
  - Every participant invocation carries workflow run, participant slot, attempt, and active Plan or To-Do identity.
  - A tool narrowed away returns typed unavailability naming the narrowing source rather than being silently omitted.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plan-index.py validate
risk_class: workflow_local_tool_registry_drift
reasoning_tier: high
context_scope: collaborative_tool_dispatch
implementation_surfaces:
  - Plans/Tools.md
  - Plans/Collaborative_Workflows.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: collaborative_tool_dispatch_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:COLLAB-003
  - pm-assistant-implementation-2026-09-02-recovered:COLLAB-009
  - pm-assistant-implementation-2026-09-02-recovered:CREW-005
  - pm-assistant-implementation-2026-09-02-recovered:DRY-001
source_atom_ids: []
preserved_exact_tokens:
  - requested_tool_profile_id
  - participant_slot_id
negative_constraints:
  - Do not create a workflow-local tool registry or dispatcher.
  - Do not let Crew Auto or a coordinator widen authority.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/Tools.md
  - Plans/Collaborative_Workflows.md
```

### T-182 - Research Capability Requests, Provider-Native Tool Order, And Browser Capture Dispatch

```yaml
plan_unit_id: T-182
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  A research participant capability request is routed to the ResearchCapabilityProvisioningOperation path rather than
  installed by Tools, is exposed to the requesting run only between ready and cleaned states, and never permits direct
  target-project or host mutation; provider-native tool, To-Do, Plan, subagent, MCP, and Skill facilities are disabled,
  redirected, projected, or observed as noncanonical in that exact order with Host Tool Execution preferred, delegated
  isolated execution as fallback and reasoning-only as final fallback; browser capture dispatches through Tools with the
  protected authentication browser excluded regardless of provider capability or profile.
gui_related: true
gui_classification_reason: Governs visible provisioning operation cards, capture actions, DevTools availability, and control-tier disclosure.
depends_on: [T-068, T-164, T-176]
unblocks: []
acceptance_criteria:
  - A requested research capability is unavailable before the operation reaches ready and unreachable after it reaches cleaned.
  - Persistent project, host, or global installation requires ordinary explicit approval through the installation owner.
  - A provider-native tool intent that cannot be host-executed is disclosed at its true control tier and never reported as full interception.
  - Protected authentication browser sessions return an explicit exclusion for capture, DevTools, and advisor inspection.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plan-index.py validate
risk_class: provisioning_or_provider_tool_authority_drift
reasoning_tier: high
context_scope: research_provisioning_and_provider_tools
implementation_surfaces:
  - Plans/Tools.md
  - Plans/MCP_Integration.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: provider_and_provisioning_tool_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BRAIN-008
  - pm-assistant-implementation-2026-09-02-recovered:BRAIN-009
  - pm-assistant-implementation-2026-09-02-recovered:PROVIDER-002
  - pm-assistant-implementation-2026-09-02-recovered:PROVIDER-006
  - pm-assistant-implementation-2026-09-02-recovered:BROWSER-008
  - pm-assistant-implementation-2026-09-02-recovered:BROWSER-009
source_atom_ids: []
preserved_exact_tokens:
  - ResearchCapabilityProvisioningOperation
  - pm.research.capability_provisioning.v1
  - Host Tool Execution
negative_constraints:
  - Do not install research capability from inside the tool layer.
  - Do not promote provider-native observation to canonical state.
  - Do not expose the protected authentication browser through any tool, profile, or provider projection.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/Tools.md
  - Plans/MCP_Integration.md
```
