# Shard 031: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/Permissions_System.md`

Source lines: L7910-L8287

Source SHA256: `9aaebb4076398655d3e72ea34024342ef2d315b82a167c3390e6a3d78fb4f205`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### PS-120 - History Permission Redaction And Authority Gates

```yaml
plan_unit_id: PS-120
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: History action authority gates resume, retry, reopen, send-forward, compare, and export against
  currentness, archive/retention, projection freshness, project scope, and user permission. Raw records and evidence
  export requires an explicit evidence/redaction profile. Stale projection blocks compare/export/reopen/send-forward
  until rebuild succeeds. Authority-sensitive actions create or bind live continuations; they never mutate immutable
  historical records in place.
gui_related: true
gui_classification_reason: Defines visible permission/redaction profile choices and authority-blocked action states.
depends_on:
- OP-027
- POA-051
unblocks:
- ATS-012
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: history_permission_leak
reasoning_tier: high
context_scope: history_permission_authority
implementation_surfaces:
- Plans/Permissions_System.md
- future History export/action permission prompts
node_compile_hint:
  mode: history_permission_authority
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0018
- pldg-20260626-001-feature-name:atom-0027
- pldg-20260626-001-feature-name:atom-0042
- pldg-20260626-001-feature-name:atom-0058
- pldg-20260626-001-feature-name:atom-0059
- pldg-20260626-001-feature-name:atom-0062
- chat:history-defaults-answers
- chat:history-scope-retention-actions-answers
- chat:history-export-compare-archive-answers
- chat:history-degraded-mode-answer
- chat:history-pressure-test-request
- chat:history-pressure-test-defaults-answer
source_atom_ids:
- atom-0018
- atom-0027
- atom-0042
- atom-0058
- atom-0059
- atom-0062
decision_refs:
- dec-0003
- dec-0004
- dec-0007
- dec-0010
- dec-0011
- dec-0012
preserved_exact_tokens:
- resuming/retrying
- cloning as a new run
- historical orchestrator runs
- Reopen in Wizard
- Send forward when currentness allows
- currentness allows
- yes, and yes.
- raw records/evidence
- explicit evidence/redaction profile
- sounds good
- block compare/export/reopen/send-forward until rebuild succeeds
- until rebuild succeeds
- currentness
- authority
- permissions/redaction profile details
- 'yes'
negative_constraints:
- Do not mutate immutable historical run/document identity in place.
- Do not resume or retry a stale historical run without currentness and authority checks.
- Do not treat clone-as-new-run as the same identity as the original historical run.
- Do not launch Plan Compile, Orchestrator execution, or mutable wizard state directly from stale historical documents
  without currentness checks.
- Do not mutate immutable approved packs or historical document records in place.
- Do not silently include raw records or evidence in ordinary exports.
- Do not bypass permissions or redaction policy when exporting evidence/raw records.
- Do not allow compare/export/reopen/send-forward from stale projection state.
- Do not bypass currentness/authority checks just because rebuild is requested.
- Do not treat successful rebuild as automatic permission to bypass currentness or authority checks.
- Do not mutate immutable historical records after rebuild.
- Do not export secrets, unauthorized provider/account details, or evidence outside the user's permissions.
- Do not omit a manifest of redactions/omissions when evidence export is requested.
owner_hints:
- Plans/Orchestrator_Page.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
- Plans/Planning_Wizard.md
- Plans/PRD_Builder.md
- Plans/Project_Output_Artifacts.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/UI_Command_Catalog.md
```

### PS-121 - Vision Bridge Image Disclosure Permission

```yaml
plan_unit_id: PS-121
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: Before PM sends a local image or screenshot to a separate vision provider, it evaluates project
  policy, sensitivity/redaction state, source class, destination provider/account, and user disclosure permission.
  The popup offers choices like reject, accept, and always accept; exact wording may differ. Always accept is explicit,
  scoped by project_id, user/account identity, source class, destination provider/account or provider-family policy,
  tool id, and sensitivity/redaction class, then remains visible, auditable, and revocable/resettable. PM must not
  silently reroute images to a destination outside the accepted permission scope.
gui_related: true
gui_classification_reason: Defines the user-visible disclosure popup, reject/accept/always-accept choices, settings
  visibility, and revocation UI.
depends_on: []
unblocks:
- RAP-035
- ACD-425
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: vision_disclosure_leak
reasoning_tier: high
context_scope: vision_bridge_disclosure_permission
implementation_surfaces:
- Plans/Permissions_System.md
- future bridge disclosure popup
- future permission settings
node_compile_hint:
  mode: vision_bridge_permission
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0077
- pldg-20260626-001-feature-name:atom-0079
- pldg-20260626-001-feature-name:atom-0083
- pldg-20260626-001-feature-name:atom-0085
- pldg-20260626-001-feature-name:atom-0087
- Plans/Tools.md
- Plans/Prompt_Pipeline.md
- chat:vision-bridge-defaults-answer
- external:github.com/alfaoz/opencode-see-image@cde1615f6dfc9039c58da6813112ee53391b5b49
- chat:vision-pressure-test-request
- chat:vision-pressure-test-defaults-answer
- Plans/Permissions_System.md
- Plans/FileSafe.md
- Plans/Models_System.md
- Plans/Media_Generation_and_Capabilities.md
source_atom_ids:
- atom-0077
- atom-0079
- atom-0083
- atom-0085
- atom-0087
decision_refs:
- dec-0014
- dec-0015
- dec-0016
- dec-0017
preserved_exact_tokens:
- local images
- screenshots
- vision provider
- project policy
- permissions
- redaction
- sensitivity_state
- degraded
- 4. Yes
- reject
- accept
- always accept
- doesnt have to be that exact wording
- when you do always, it stops asking
- pop up
- project_id
- user/account identity
- source class
- destination provider/account
- provider-family policy
- tool id
- sensitivity/redaction class
- revocable/resettable
- 'yes'
- sensitivity/redaction policy
- disclosure destination
- explicit user override
- redaction/omission details
- derived artifact manifest
- secrets
- requested/effective provider/model/account
- usage/cost refs
- bounded transient failures
- falls back
- policy permits
- disclosure permission covers the destination
negative_constraints:
- Do not silently send screenshots containing secrets or sensitive local/project context to another provider route.
- Do not bypass the existing tool permission model just because the bridge is model-assistive.
- Do not serialize revoked, blocked, expired, or omitted image artifacts as successful prompt content.
- Do not make always-accept global, irreversible, hidden, or impossible to revoke.
- Do not create an implicit always-accept rule without an explicit user choice.
- Do not make always-accept hidden, global by accident, irreversible, or impossible to audit.
- Do not keep prompting after an applicable always-accept rule exists.
- Do not make always-accept global across all projects, providers, users, source types, or sensitivity classes by
  accident.
- Do not create a hidden permission rule that cannot be inspected or revoked.
- Do not keep prompting after an applicable remembered permission exists.
- Do not silently send sensitive screenshots or images to another provider without policy evaluation.
- Do not claim redaction happened without recording redaction/omission metadata.
- Do not expose secret material in manifests, receipts, GUI previews, or exports.
- Do not silently reroute an image to a different provider/account than the user allowed.
- Do not treat provider catalog visibility as proof that a route can currently process image input.
- Do not hide usage/cost attribution when the bridge uses a separate model route.
owner_hints:
- Plans/Permissions_System.md
- Plans/FileSafe.md
- Plans/Prompt_Pipeline.md
- Plans/Tools.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/storage-plan.md
- Plans/Project_Output_Artifacts.md
- Plans/Models_System.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/usage-feature.md
```

### PS-122 - Teach Guided Mutation Confirmation Gates

```yaml
plan_unit_id: PS-122
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: Teacher can guide GUI use through safe route, highlight, focus, scroll, explain, and read-only inspect
  actions. Any mutation, external side effect, settings change, file write, provider disclosure, memory save, or
  command execution requires explicit confirmation or existing policy permission. Degraded states for permission
  denied, unavailable command, missing target, stale navigation, model fallback, missing help entry, or user stop
  must remain visible with a next action rather than silently proceeding.
gui_related: true
gui_classification_reason: Defines visible confirmation and permission gates for Teacher-guided GUI actions.
depends_on:
- CV-297
unblocks:
- ATS-014
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: teacher_mutation_authority_drift
reasoning_tier: high
context_scope: teach_guided_permission_gates
implementation_surfaces:
- Plans/Permissions_System.md
- future Teacher guided action confirmations
node_compile_hint:
  mode: teach_guided_permission_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0098
- pldg-20260626-001-feature-name:atom-0126
- pldg-20260626-001-feature-name:atom-0142
- pldg-20260626-001-feature-name:atom-0144
- chat:teacher-feature-initial-framing
- Plans/UI_Command_Catalog.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md#ACD-410---Internal-Target-Payload-Navigation
- chat:teach-gap-fill-correction
- q-0028
- chat:teach-bundle-accepted-pmconcept-reference
- chat:work-through-teach-gaps
- Plans/Permissions_System.md#2.4A-requested-vs-effective-permissioned-capability-state
- Plans/Permissions_System.md#approval-ui
- Plans/Media_Generation_and_Capabilities.md#capability-usability-semantics
source_atom_ids:
- atom-0098
- atom-0126
- atom-0142
- atom-0144
decision_refs:
- dec-0018
- dec-0019
- dec-0020
- dec-0024
correction_refs:
- corr-0003
preserved_exact_tokens:
- teacher can control the Gui to show the user how to do things
- Gui
- show the user how
- OpenSubject
- route_target
- highlight
- spotlight
- safe guided action
- mutation confirmation
- opening a route
- focusing a panel
- scrolling
- highlighting
- previewing
- explicit confirmation
- action name
- affected object
- risk
- rollback/undo
- Cancel
- control the Gui
- open route
- focus panel
- scroll to section
- highlight control/region
- expand non-mutating details
- preview selection
- changing a setting
- saving memory
- approving a permission
- undo/rollback
- target surface unavailable
- route/control no longer exists
- context stale
- selection lost
- permission blocked
- capability unavailable
- help entry missing
- model fallback/clamp
- user stops
negative_constraints:
- Do not let Teacher perform raw uncontrolled GUI mutation outside stable UI command/route contracts.
- Do not allow mutating/destructive GUI actions without confirmation and capability/permission gates.
- Do not use stale or private panel-local route fields when the route/open contract provides canonical targets.
- Do not let `Do it` execute mutations without a confirmation step.
- Do not make confirmation copy vague about the affected object.
- Do not default a destructive confirmation to proceed.
- Do not use raw cursor/click automation as the teaching UI.
- Do not let Teacher execute mutating actions through `Do it` without confirmation.
- Do not let guided GUI actions bypass Permissions_System requested/effective disclosure.
- Do not keep stepping through a stale or missing UI target.
- Do not hide permission/capability/model degraded states.
- Do not turn degraded guidance into generic apology text without a next action.
owner_hints:
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Contracts_V0.md
- Plans/assistant-chat-design.md
- Plans/Permissions_System.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Glossary.md
```
