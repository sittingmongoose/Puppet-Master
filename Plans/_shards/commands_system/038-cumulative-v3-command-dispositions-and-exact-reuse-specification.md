# Shard 038: Cumulative v3 Command Dispositions and Exact Reuse Specification (2026-09-07)

Source: `Plans/Commands_System.md`

Source lines: L6180-L6319

Source SHA256: `6faf36d17e149faabc6f59591d59e875158a51f5a552ec7f444101ab61af4b52`

---

## Cumulative v3 Command Dispositions and Exact Reuse Specification (2026-09-07)

This section incorporates the cumulative command reuse census, handler owner alignments, and
disposition rules in accordance with APR-014, APR-019, and APR-023, strictly adhering to
`COMMAND_DISPOSITION.md`.

### 16. Canonical Command Dispositions and Exact Reuse Invariants (APR-023)

- **Strict Command Reuse Invariant:** In accordance with DRY governance, product operations must reuse
  existing canonical command identities, request/result types, and handler owners rather than minting
  parallel commands for visual state or secondary entry points:
  1. *BSD Mode:* Reuses `cmd.bsd.set`.
  2. *BSD Configuration & Policy:* Reuses `cmd.bsd.configure`; stage binding configuration uses
     `cmd.bsd.workflow.configure`. One UI Save preserves existing transaction boundaries.
  3. *BSD Finding, Transcript, Usage:* Reuses `cmd.bsd.finding.open`, `cmd.bsd.open_transcript`,
     `cmd.bsd.open_usage`.
  4. *Collaborator Configuration & Start:* Reuses `cmd.collaboration.configure` and
     `cmd.collaboration.start`. Preview is side-effect-free; Start freezes the roster.
  5. *Crew Auto Configuration:* Reuses `cmd.chat.crew_auto.open_config` and `cmd.chat.crew_auto.set`.
     Checkmarks reflect effective stored state after confirmation and Settings transaction.
  6. *Plan Build:* Reuses `cmd.chat.plan.build`. Execution topology (`goal_driven` vs `direct`) is a
     typed payload discriminator; minting `build_as_goal` is strictly prohibited.
  7. *Plan Schedule:* Reuses `cmd.chat.plan.schedule_build`, freezing exact plan version and topology.
  8. *Scheduled Message Lifecycle:* Reuses `cmd.chat.schedule_message`,
     `cmd.chat.schedule_message.update`, and `cmd.chat.schedule_message.cancel`.
  9. *Execution Windows:* Reuses `cmd.execution_window.create`, `cmd.execution_window.update`, and
     `cmd.execution_window.cancel`.
  10. *Quota Resume Consent:* Reuses `cmd.runtime.quota_resume.set`, preserving manual stop precedence.
- **Local Presentation Boundary:** Pure visual toggles—shared picker dropdown open/filter/selection,
  collapsible sections, plan Rich/Markdown toggle, Activity Detail unpin/pin, and manager tabs—are
  classified as `LOCAL_PRESENTATION`. They utilize local or shared view-state primitives and emit no
  domain command.
- **Isolation of Demo Fixtures (APR-014):** Test fixtures, replay commands, mock simulations, and
  sample loaders are classified as `CONCEPT_DEMO_ONLY`. They reside exclusively in the Demo Gallery
  and are strictly prohibited from registration in the product command catalog or production wiring.

```yaml
plan_unit_id: CS-079
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Product operations enforce canonical command reuse: BSD mode uses cmd.bsd.set; BSD policy uses
  cmd.bsd.configure / cmd.bsd.workflow.configure; collaboration uses cmd.collaboration.configure /
  cmd.collaboration.start; Crew Auto uses cmd.chat.crew_auto.open_config / cmd.chat.crew_auto.set;
  Plan Build uses cmd.chat.plan.build with topology discriminator (prohibiting build_as_goal); Plan
  schedule uses cmd.chat.plan.schedule_build; scheduled messages use cmd.chat.schedule_message[.update|.cancel];
  execution windows use cmd.execution_window.create/update/cancel; quota consent uses cmd.runtime.quota_resume.set.
  View toggles are classified as LOCAL_PRESENTATION view state, and test fixtures are classified as
  CONCEPT_DEMO_ONLY, excluded from product command catalogs.
gui_related: false
gui_classification_reason: Governs command catalog dispositions, canonical ID reuse, and demo separation.
depends_on: [CS-078]
unblocks: []
acceptance_criteria:
  - Specified operations reuse canonical command IDs without minting parallel commands.
  - Plan Build uses topology discriminator; build_as_goal is prohibited.
  - View toggles are classified as LOCAL_PRESENTATION without domain commands.
  - Demo fixtures are classified as CONCEPT_DEMO_ONLY and excluded from product catalogs.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: command_duplication_or_demo_command_leak
reasoning_tier: high
context_scope: command_dispositions
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: command_disposition_specification
  create_worknodes: false
source_lineage:
  - APR-014
  - APR-019
  - APR-023
preserved_exact_tokens:
  - "cmd.chat.plan.build"
  - "cmd.bsd.configure"
  - "cmd.collaboration.start"
  - "CONCEPT_DEMO_ONLY"
  - "LOCAL_PRESENTATION"
negative_constraints:
  - Do not mint cmd.chat.plan.build_as_goal.
  - Do not register demo fixtures in the product command catalog.
owner_hints:
  - Plans/Commands_System.md
```

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md


### CS-080 - Shared Runtime Result To Command Outcome Binding

```yaml
plan_unit_id: CS-080
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: "All twenty-six canonical shared-runtime command results inherit one required command_outcome_ref in command_result_envelope. CV-333 joins that existing result to its actual Full Thread operation without merging the two closed status vocabularies."
gui_related: false
gui_classification_reason: This governs backend record binding and dispatcher contracts.
depends_on: [CV-333, SIR-015]
unblocks: []
acceptance_criteria:
  - "All twenty-six result definitions inherit the required non-secret outcome ref through the existing shared envelope."
  - "Resolve matching command, command instance, operation, target generation and request binding before projecting the owner result."
  - "Accepted remains nonterminal; no_change projects verified no_op, blocked projects rejected, and recovery_required retains recovery semantics without automatic retry."
  - "Cancellation and no-change carry the actual required terminal receipt; replay returns the original result and operation identity."
  - "Existing generalized command IDs, compatibility spellings, remote wrapper normalization, permission and no-unregistered-event rules remain unchanged."
validation_surfaces: [Plans/ui_command_response_fixtures.json, tests/test_pm_ui_command_response.py, python3 scripts/pm-plans-verify.py validate-ui-command-response, python3 scripts/pm-plan-index.py validate]
risk_class: command_response_identity_or_false_completion
reasoning_tier: high
context_scope: central_command_response_bridge
implementation_surfaces: [Plans/shared_runtime_command_contracts.schema.json, Plans/shared_runtime_command_contract_fixtures.json, Plans/Commands_System.md]
node_compile_hint: {mode: static_command_response_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [USER-PACKET-GAP-CLOSURE-20260910, Plans/Shared_Integration_Runtime.md#SIR-015]
negative_constraints:
  - No native dispatcher, owner authentication, effect execution, new command, event or physical storage-family admission is proved by static fixtures.
  - No second command outcome owner, fabricated operation scope, automatic retry of unknown effects, or governance/readiness lift.
```

ContractRef: ContractName:Plans/Contracts_V0.md#CV-333, ContractName:Plans/ui_command_response.schema.json, ContractName:Plans/Shared_Integration_Runtime.md#SIR-015

### Existing Evidence-Consumer Dispatch Bindings — 2026-09-11

ATS-048 owns the five existing Testing session/bundle command contracts; RAP-056
owns the two existing recording Play/Watch command contracts. Dispatch uses the
exact request/result schema references on all eleven existing placements in
`Plans/Wiring_Matrix.production.json`, with the same sole planned handlers.
The central response bridge requires the typed owner request, its authenticated
normalized request binding, typed owner result and shared CommandOutcome to agree.
It consumes the owners' status/currentness/receipt/replay rules; acceptance is not
terminal success. Native owner lookup and policy enforcement remain unimplemented.

Shared metadata/idempotency fields are referenced, not redefined; the shared-runtime
26-command enum and TCME ten-command enum do not expand. No generic schema whose
closed command enum excludes a command is a valid binding for that command. The
owner schemas, static fixtures and planned handler names confer no execution,
capture, test-verdict, protected-auth, storage or Event Authority permission.

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-048, ContractName:Plans/Runtime_Artifacts_Panel.md#RAP-056, ContractName:Plans/Contracts_V0.md#CV-333, ContractName:Plans/UI_Command_Catalog.md
