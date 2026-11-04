# Shard 040: Git adapter packet command production intent — 2026-09-27

Source: `Plans/Wiring_Matrix.md`

Source lines: L5923-L6012

Source SHA256: `3819f6ec249a5245d6ea0b61a8aa574ecd65cb2cf84f00db2a3beb0b6bdf5bf1`

---

## Git adapter packet command production intent — 2026-09-27

`Plans/Wiring_Matrix.production.json` carries one row for each UCC-167/CS-083 command. Source Control Changes, Branches / Stash, remote configuration, command palette and authorized automation consume the same exact owner request and availability. The planned dispatch path begins at the selected repository and Git workspace, resolves current capability, permission, FileSafe and writer lease, then binds the action-specific paths, remote, stash or branch target before returning to the invoking surface. It cannot infer these identities from focus or display text. Whole-file stage/unstage remain separate from hunk actions. Remote update has no network transport effect. Stash apply and branch delete require current target-bound previews; branch delete requires dangerous-action authority. Every row has `handler_unavailable` and `expected_event_types=[]` until source-hashed native dispatcher, receipt, currentness and regression evidence exists.

### WM-060 - Git Adapter Exact Wiring And Reverse Coverage

```yaml
plan_unit_id: WM-060
unit_type: integration_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Seven Git-only command rows bind the UCC-167 primaries to the SCS-024 owner request/result,
  sole future handler, projected availability/disabled reason, owner receipt and deterministic return. Source
  Control, palette and authorized automation share exact target and refusal semantics. The rows are production
  intent only and retain handler_unavailable and expected_event_types=[].


  Current projects-refresh contract: Exactly five Settings primaries consume offered level/key, the single
  resolver, per-setting CAS, exact owner readback and return. All chats/All editors/All terminals uses Everywhere.
  Human rows edit their origin; agent edits use SSYS-065. Library things retain their home/reach/whole Project
  versions and sole owner. Computer installations, credentials and protected source trust never travel in copy.
  Origin-word/Details/Changed/Varies menus are local. Commands & Shortcuts retains exactly eight commands.*
  local owner actions through handlers::commands::apply_local_action, not cmd.commands.custom.*. The exact
  consumer contract is UCC-214/WM-100 and Plans/projects_refresh_command_bindings.json. Historical schema/hash/replay
  resources and all unrelated PM7 service/FO-22/motion/auth/identity clauses remain as specified; unavailable
  handlers remain handler_unavailable.'
gui_related: true
gui_classification_reason: Binds Source Control controls and reverse consumers to typed dispatch, disabled
  state, accessible focus and return.
depends_on:
- SCS-024
- UCC-167
- CS-083
unblocks: []
acceptance_criteria:
- Seven exact production rows and reverse touch-closure entries agree on command ID, owner, handler, request/result
  and consumer surfaces.
- Dispatch refuses stale, wrong-backend, wrong-target, FileSafe, permission, preview and dangerous-action failures
  before any effect.
- No hunk command is reused for whole-file staging; no remote update transports bytes or changes hosted refs.
- Static wiring claims no native dispatch, EventRecord, provider effect or readiness.
- Validate application versus actual Project-target cases, original exact Project replay, stale scope/preview/permission/Stop/return
  refusal and the exact command/local/tool binding from UCC-214; no native/event/governance proof follows from
  static closure.
validation_surfaces:
- Plans/Wiring_Matrix.production.json
- Plans/touch_closure.json
- scripts/pm-touch-closure-verify.py
- scripts/pm-plans-verify.py
risk_class: cross_target_dispatch_or_false_runtime_claim
reasoning_tier: high
context_scope: packet_git_adapter_production_intent
implementation_surfaces:
- Plans/Wiring_Matrix.md
- Plans/Wiring_Matrix.production.json
- Plans/touch_closure.json
node_compile_hint:
  mode: production_intent_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Source_Control_System.md#SCS-024
- Plans/UI_Command_Catalog.md#UCC-167
- Plans/Commands_System.md#CS-083
- source_ref:chat:2026-11-03-projects-pass2-approved
preserved_exact_tokens:
- cmd.git.stage
- cmd.git.unstage
- cmd.source_control.remote.update
- cmd.source_control.stash.create
- cmd.source_control.stash.apply
- cmd.source_control.branch.create
- cmd.source_control.branch.delete
- handler_unavailable
- expected_event_types=[]
negative_constraints:
- Do not treat production-intent strings or static fixtures as a native handler or Event Authority admission.
- Do not infer repository, workspace, paths, remote, stash or branch from mutable UI focus.
- Do not silently retry an effect whose outcome is unknown before exact reconciliation.
- Do not replace a required real target with focus, a synthetic Project, an empty identity or borrowed app/source
  authority.
owner_hints:
- Plans/Wiring_Matrix.md
```

ContractRef: ContractName:Plans/Source_Control_System.md#SCS-024, ContractName:Plans/UI_Command_Catalog.md#UCC-167, ContractName:Plans/Commands_System.md#CS-083

### WM-061 - Forge Review Edit And Runner Producer Binding

`catalog.forge_review_edit` maps `cmd.forge.review.edit` to the sole future `handlers::forge::review_edit` route, the FGI-022 typed command request/result/error and owner MutationReceipt. Availability and disabled reason derive from exact provider/binding/revision/capability/currentness and `handler_unavailable` until native proof. The Forge-owned runner list and registration preview producers have typed FGI-022 records and no central command dispatch row; apply consumes the exact current preview by ref and digest. Reverse GUI consumers use Source Control reviews and Actions & Pipelines administration, preserving keyboard/pointer parity and return focus.
