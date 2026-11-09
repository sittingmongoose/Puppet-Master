# Shard 019: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/UI_Command_Catalog.md`

Source lines: L8827-L10956

Source SHA256: `0ec6a6d55443c27a3159cecbf0fa51ab923e7b5249dfb2b4f5c7573f22f1a0a3`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime UI command catalog rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-ddc264cdea296caf349adecd`: active semantic-command rows UCC-049 through UCC-105 inherit the strict schema overlay below. Each active row exposes `command_id`, `payload_required`, `payload_optional`, `result_fields`, `error_codes`, `disabled_reason_codes`, and `owner_doc_ref` either through a concrete current `cmd.*` token in its preserved tokens or through the owner-referenced family schema named in the overlay. Rows with prose-only or slash-token source lineage are implementation-ready only through that owner reference, not as free-form handler text. UCC-106 is now an explicit lineage exclusion: its eleven retained `cmd.onboarding.*` command-era tokens are not active commands or aliases; its separate eight packet candidates are rejected as commands, aliases, and handlers; and its current fourteen `ui.onboarding.*` tokens (`ui.onboarding.choose_look` added by DL-153) are typed local UI actions rather than command-schema rows. Amended 2026-11-05 (DL-333): the owner reference for each active row is the owner-doc typed definition that UCC-230 names, not this catalog.
- Repairs `sfk-ed92df2325332306b2463b50`: browser production command IDs keep `cmd.browser.share_with_agent` and `cmd.browser.revoke_share_with_agent`; `cmd.browser.run_code`, `cmd.browser.evaluate`, legacy `browser_run_code`, and legacy `browser_evaluate` are compatibility-only diagnostic/page-evaluation lineage, not default production browser commands.

### UCC-049 through UCC-105 strict schema overlay and UCC-106 lineage exclusion

This overlay is the owner reference for every active command row from UCC-049 through UCC-105. It keeps the catalog as the command-ID SSOT while avoiding duplicated payload tables. Implementers MUST resolve each active row through the row range below, then through the row's concrete current `cmd.*` tokens or compatibility notes. UCC-106 does not inherit this command schema; its retained command-era tokens and current typed local actions have the closed disposition stated in the final row below. Amended 2026-11-05 (DL-333): typed payload definitions live in the owner docs that UCC-230 names; this overlay keeps the common fields and closed code sets and stays the command-id and alias authority.

Common fields for every covered row:

- `command_id`: every concrete current `cmd.*` token in the row's `preserved_exact_tokens`, except a token expressly marked retired, source-lineage-only, or non-alias in `compatibility_only_notes` or `stale_retired_dispositions`; grouped or wildcard tokens are family aliases and must normalize to a concrete active `cmd.*` row before dispatch.
- `payload_required`: `dispatch_id`, `command_id`, `source_surface`, `actor_ref`, and the row-specific identity listed below.
- `payload_optional`: `route_target?`, `OpenSubject?`, `project_id?`, `repo_id?`, `worktree_id?`, `run_id?`, `attempt_id?`, `node_id?`, `thread_id?`, `usage_event_ref?`, `usage_record_id?`, `provider_attempt_ref?`, `tool_call_id?`, `trace_ref?`, `receipt_ref?`, `receipt_refs[]?`, `raw_payload_ref?`, `query_session_id?`, `selection_ref?`, `confirmation_ref?`, `idempotency_key?`, and family-specific args defined by the owner-doc definition that UCC-230 names.
- `result_fields`: the shared closed v2 `UICommandResponse` schema in CV-333, consuming the separately owned typed result rather than duplicating its domain fields.
- `error_codes`: closed to `invalid_route`, `unknown_command`, `invalid_args`, `permission_denied`, `blocked_state_required`, `stale_projection`, `handler_unavailable`, and `internal_error`; family owners may narrow but not expand this set without a new owner-doc row.
- `disabled_reason_codes`: closed to `unsupported`, `not_configured`, `unauthorized`, `unreachable`, `degraded`, `partial_capability`, `blocked_state_required`, `stale_projection`, and `permission_required`.
- `owner_doc_ref`: the owner-doc definition unit that UCC-230 names for the command; no handler may invent unowned payload keys or fabricate `*.command_applied` events.

| Rows | Family owner reference | Row-specific required identity |
|---|---|---|
| `UCC-049` through `UCC-053` | Docker and Kubernetes command families: `Plans/Containers_Registry_and_Unraid.md` CRAU-115; storage and capability details remain with `Plans/FinalGUISpec.md`, `Plans/Wiring_Matrix.md`, `Plans/storage-plan.md`, and `Plans/Tools.md` ContractRefs already carried by the rows. | `container_ref?`, `image_ref?`, `compose_project_ref?`, `kubernetes_context?`, `namespace?`, and `capability_snapshot_ref` for mutating or capability-gated actions. |
| `UCC-054` through `UCC-055` | Project-scope worktree command family: `Plans/WorktreeGitImprovement.md` W-095. | `repo_id`, `worktree_id?`, `branch_ref?`, `safe_point_id?`, and `worktree_lifecycle_state` when mutating worktree state. |
| `UCC-056` through `UCC-060` | Assistant chat, context lens, thread worktree, and context-detail command families: `Plans/assistant-chat-design.md` ACD-637. | `thread_id` plus `message_id?`, `context_lens_mode?`, `worktree_id?`, `usage_detail_ref?`, or `context_projection_ref?` according to the concrete command. |
| `UCC-061` through `UCC-065` | Browser and preview command family: `Plans/Section15_MVP_Promoted_Features_Spec.md` SMPFS-328. | `browser_session_id?`, `preview_subject_ref?`, `selection_ref?`, `screenshot_ref?`, and `agent_share_scope?` for capture/share/takeover commands. |
| `UCC-066` through `UCC-072` | Terminal and dev-session command families: `Plans/Section15_MVP_Promoted_Features_Spec.md` SMPFS-329 (terminal, dev-session and catalog lifecycle commands). | `terminal_session_id?`, `pane_id?`, `dev_session_id?`, `command_ref?`, and `layout_target?` for focus, rerun, split, reveal, and recovery commands. |
| `UCC-073` through `UCC-076` | Chat message, code-block, rewind/revert, and activity-dimension command families: `Plans/assistant-chat-design.md` ACD-638. | `thread_id`, `message_id?`, `code_block_id?`, `checkpoint_ref?`, and `activity_dimension?` for the concrete action. |
| `UCC-077` through `UCC-083` | Debug, web/slash dispatcher, web activity, reserved slash alias, and route-mapping command families: `Plans/Commands_System.md` CS-125 (`cmd.debug.*`) and `Plans/assistant-chat-design.md` ACD-639 (`cmd.chat.web.*`, `cmd.chat.stop`). | `thread_id`, `debug_session_id?`, `web_operation_id?`, `slash_command_id?`, `route_target?`, and `provider_route_ref?`; retired slash labels must normalize before dispatch. |
| `UCC-084` through `UCC-088` | Memory, artifact side-panel, and search command families: `Plans/assistant-memory-subsystem.md` AMS-141 (memory), `Plans/Runtime_Artifacts_Panel.md` RAP-129 (artifacts) and `Plans/FinalGUISpec.md` F3-716 (search). | `memory_item_id?`, `artifact_id?`, `ledger_ref?`, `query_session_id?`, `replacement?`, and `index_scope?` as required by the concrete command. |
| `UCC-089` through `UCC-095` | Runtime recovery command family: `Plans/Executor_Protocol.md` EP-236. | `run_id`, `blocked_sequence`, `allowed_action_id`, `node_id?`, `attempt_id?`, `safe_point_id?`, `baseline_ref?`, and `permission_carry_ref?`; pre-attempt blocked rows MUST NOT fabricate an `attempt_id`. |
| `UCC-096` through `UCC-100` | Goal, Planning Wizard, Plan Compile, discovery-routed search, and history wrapper command families: `Plans/Goal_Runtime_System.md` GRS-218, `Plans/PRD_Builder.md` PRDB-024, `Plans/Planning_Wizard.md` PWIZ-109 and `Plans/Plan_To_Node_Compilation.md` PNC-037, and `Plans/Orchestrator_Page.md` OP-049 (History); UCC-230 routes each concrete command and its `prose_unit_resolution` records the units that add no command row. | `goal_id?`, `thread_id?`, `planning_session_id?`, `plan_pack_ref?`, `plan_compile_run_id?`, `history_query_ref?`, and `target_identity_ref?` for the concrete command. |
| `UCC-101` through `UCC-105` | Vision bridge, Teach, notification/sound, DRY settings, and containerized-host command families: `Plans/FinalGUISpec.md` F3-717 (notifications and sounds), `Plans/Settings_System.md` SSYS-076 (`cmd.settings.open`), `Plans/Containers_Registry_and_Unraid.md` CRAU-116 (Docker/Hosts, `cmd.docker.run`, `cmd.docker.container.open`), `Plans/assistant-chat-design.md` ACD-640 (Vision bridge) and `Plans/FinalGUISpec.md` F3-718 (Teacher guided GUI); UCC-230 routes each concrete command and its `prose_unit_resolution` records the units that add no command row. UCC-103 expressly excludes retired non-alias `cmd.settings.open_notifications`; current Notifications navigation uses `cmd.settings.open`. | `image_ref?`, `teach_session_id?`, `notification_destination_id?`, `sound_asset_id?`, `settings_key?`, `host_capability_ref?`, and `host_profile_id?` for the concrete current command. |
| `UCC-106` | Product Onboarding is owned by `Plans/Planning_Wizard.md` PWIZ-021 through PWIZ-025. Its eleven command-era `cmd.onboarding.*` identifiers are retained source lineage only, its separate eight packet candidate tokens are rejected as commands/aliases/handlers, and its fourteen `ui.onboarding.*` identifiers (`ui.onboarding.choose_look` added by DL-153) are typed owner-local UI actions. | Not applicable: no Onboarding command schema, alias, primary handler, or production-wiring row. Owner-launch actions consume the v2 phase/draft/preflight/Project-commit bindings and target the existing owner's command; local request/result IDs are `pm.product_onboarding.action_request.v2` and `pm.product_onboarding.action_result.v2`. |

Compatibility-only and retired source tokens in these rows remain searchable lineage. They do not become command IDs unless the row's `command_id` rule maps them to a concrete active `cmd.*` value or an explicit `alias_of_command_id`; tokens expressly marked non-alias never normalize or dispatch.

### UCC-230 - Strict Schema Overlay Owner Definition Map

```yaml
plan_unit_id: UCC-230
unit_type: schema_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  UCC-230 maps every active command row of the UCC-049 through UCC-105 strict schema overlay to the owner-doc
  PlanUnit that holds its typed payload definition (DL-333). A definition is one entry of a
  pm.command_payload_definitions.v1 block: a fenced yaml block whose only top-level key is
  command_payload_definitions, with no plan_unit_id key, placed directly after the fence of a command_contract
  PlanUnit in the owner doc that the owners routing below names, and that unit lists every command it defines in
  preserved_exact_tokens. A definition gives the command's UICommand.args, each field with a type from the closed
  vocabulary below, a required flag, a default and canon or gap provenance; its command_kind and response_kind;
  its owner request and its owner result carried by the CV-333 UICommandResponse; and error and disabled-reason
  codes narrowed from the overlay's closed sets by the error_narrowing rule. It never restates dispatch_id,
  command_id, source_surface or actor_ref and never changes the canonical type of a common optional field. The
  expected set is the overlay command_id rule over the concrete tokens of UCC-049 through UCC-105, plus
  prose_unit_resolution, minus non_definition_tokens, each of which quotes the canon that marks it. A contested
  command gets no definition until the coordinator rules. Owner disabled states that fall outside the closed set
  map to closed codes through owner_state_code_map and stay display detail; identity exemptions exist only where
  this map records them with a decision. The catalog stays the command-id and alias authority and its command rows
  hold no data shapes. Fields of type timestamp, url or path take no literal default: their default is none,
  their owners validate syntax at run time, and an owner that needs a literal default first adds its validation to
  the checker (DL-333 coordinator resolution 11). scripts/pm-command-payload-defs-check.py checks this map against
  the overlay and every definition against this map. Amended 2026-11-07 (DL-341): a definition records every
  judgment it makes in an optional judgments list; each entry has a key (command_kind, response_kind,
  disabled_reason_codes, error_codes, owner_request, owner_result, aliases for which alias tokens it records,
  omitted:<field> for a field it deliberately leaves out, or field:<arg path> for a judgment that is not that
  field's own gap_note, where a [] step names a list field), the choice the definition made, equal to its own value
  for a fixed key (for aliases the alias tokens it records, or none) and without repeats in a list, and a gap_note
  saying what canon lacks or where it disagrees. A judgment carries no provenance, and a canon field whose source or
  gap_note says JUDGMENT is a provenance finding. A definitions block holds no YAML comment: any # comment inside a
  pm.command_payload_definitions.v1 fence is a C11 provenance finding, whatever it says, because comments are
  invisible to tools and no word list can tell a recorded choice from a note. No string in a definitions block names
  review or evidence material (review rounds and findings, fix rounds and their reports, review files, the
  owner-answers folder, the evidence share, the Q5 design's sections or the fix reports' canon-conflict labels):
  canon text stands on canon, and only a unit fence's source_lineage cites evidence. A field marked nullable: true
  may be JSON null, with any required value, except a required row-group identity and a restated common optional
  field: neither the overlay nor this map records a nullable one, so both are refused. A definition may restate a
  common optional field, required or optional, only with its canonical type and with constraints that only narrow
  the inherited ones; this replaces the Q5 design rule that allowed a restatement only to make the field required or
  add constraints. Enum values keep canon's exact spelling: non-empty strings without surrounding whitespace, unique
  within the field. worktree_lifecycle_state is required when the command mutates worktree state, as the overlay
  cell says: the map lists the mutating commands and the domain_action commands that do not mutate (not_mutating),
  both lists always present, each command with canon evidence that names it, and a domain_action it lists in neither
  fails closed. identity_aliases records, per row group, a canon name that stands for an overlay identity name, with
  canon evidence, so gist_id stands for memory_item_id and investigation_id for debug_session_id and canon is never
  renamed. A conditional identity exemption keeps its field, requires it on every branch of branch_field except
  exempt_branch and forbids it on exempt_branch: cmd.runtime.approve and cmd.runtime.decline define both the node
  shape and the HITL-038 chat-tool shape, with blocked_sequence and allowed_action_id required on the node branch
  and forbidden on the chat_tool branch. Canon names only the chat_tool value of approval_kind; the node branch
  value is not canon, so the definition marks approval_kind a gap. A definition may list in owner_state_codes each
  owner state it shows as a disabled reason, with the closed code owner_state_code_map gives it, which must be one
  of its disabled_reason_codes. Owner states maintenance_cutoffs_pending (DL-403, DL-446, DL-447) and
  dedup_hold_pending (DL-444, DL-445) map to not_configured, and the thirteen CRAU-095 local-runtime reason codes map to the closed codes the
  map lists. Amended 2026-11-09 (DL-471): outside_range_commands is a closed list of additional concrete
  command ids, each with catalog_unit, owner_unit, the inherited row_group and a registration evidence line.
  Exactly one definition is required in that owner unit, under every ordinary field, identity, envelope,
  provenance, kind, result and closed-code rule. No namespace or other out-of-range token is admitted by
  that list. unresolved_tokens can record standing questions with evidence, a question_id, judgment and
  alternative. The two packet standings are decided by DL-471 Q-ID1/Q-ID2 and now appear in
  non_definition_tokens; unresolved_tokens is empty.
  A Markdown contract ref is typed only as Plans/<Doc>.md#<UNIT-ID>/<ContractName>, naming a contract in
  a pm.typed_contracts.v1 block directly after that schema_contract unit's fence in the same owner doc.
  A bare Plans/<Doc>.md#<UNIT-ID> is an error. The block has only typed_contracts at top level and no
  plan_unit_id key; its body has exactly format, owner_unit, vocabulary (this unit), and contracts. Each
  named contract is a nonempty fields record checked by this vocabulary's field/default/provenance rules,
  or a closed union with exactly discriminator, discriminator_source and branches, naming fields records
  in that same block. discriminator_source is required: in_record requires every branch to carry the
  named selector as a required const equal to its branch key; external requires every contract use site
  (including list items) to declare discriminator_source: {arg: <selector>} or
  discriminator_source: {owner: <record>.<selector>}. arg names an existing sibling selector enum;
  owner names the owner-held record and selector (create uses {arg: provider}, update uses
  {owner: stored_destination.provider}). Owner selection is revalidated against that immutable stored
  record. Source maps have exactly one key and nonempty identifier/path values ending in the selector;
  arg must match the discriminator name. Source maps on other types or in_record uses are refused.
  Branch keys are exact selector values.
  An enclosing enum selector must equal the union's branch keys. Named refs, including forward refs,
  resolve against the actual typed blocks, never merely a PlanUnit id. YAML merges, comments, duplicate
  keys, unknown block/contract keys, misplaced blocks and review/evidence references are refused as for
  command definitions. No other contract-ref form changes.
gui_related: false
gui_classification_reason: Records where command payload types live and how they are checked; no GUI behavior changes.
split_recommended: false
depends_on: [DL-333, CV-333, UCC-109, DL-341, DL-471]
unblocks: []
acceptance_criteria:
  - "Every expected UCC-049..UCC-105 command has exactly one definition, in the owner unit this map routes it to, or is listed in contested."
  - "Every outside_range_commands entry has exactly one definition in its explicit owner unit under all ordinary rules; no other out-of-range command joins scope (DL-471)."
  - "Every Markdown contract ref names a checked typed_contracts definition by unit/ContractName; bare unit refs fail, and discriminator branches match their named contracts and enclosing selector enum (DL-471)."
  - "row_groups equal the overlay's row-specific identity cells, and envelope equals the overlay's payload_required and payload_optional bullets."
  - "Every non_definition_tokens entry quotes the canon that marks it, and every token a unit's compatibility or stale note marks is listed."
  - "Every judgment a definition makes is in its judgments list with a key, a choice and a gap_note; no judgment claims provenance and no canon field records one; no definitions block holds a YAML comment, whatever it says (any # comment in the fence is a C11 finding), or a string that names review or evidence material (a C11 finding too) (DL-341)."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-command-payload-defs-check.py --self-test
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - scripts/pm-command-payload-defs-check.py
node_compile_hint:
  mode: command_payload_definition_map
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to closure question Q5"
  - "pm-mail 1105034552-f6f4 (pm7-build, 2026-11-05): coordinator resolutions 1-10 under that answer"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/DESIGN.md sections 4-6"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/RESOLUTIONS.md"
  - "pm-mail 1107140349-9370 (pm7-build, 2026-11-07T14:03Z): coordinator resolutions 1-5 after definitions review round 1 (DL-341); /mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/defs-review/R1-DECISIONS.md and r1-opus-S1.md..r1-opus-S5.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/defs-review/r2-opus-S1.md..r2-opus-S6.md (definitions review round 2) and owner-answers/q5/P0C-BRIEF.md: the DL-341 amendment of 2026-11-07, with the stream C lead's proposals sent to pm7-build at 2026-11-07T15:54Z"
preserved_exact_tokens:
  - UCC-230
  - pm.command_payload_definitions.v1
  - command_payload_definitions
  - command_payload_definition_map
  - DL-341
  - judgments
  - nullable
  - identity_aliases
  - not_mutating
  - branch_field
  - exempt_branch
  - maintenance_cutoffs_pending
  - dedup_hold_pending
  - owner_state_codes
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias, source-lineage, unresolved or contested token, or an outside-range token absent from outside_range_commands.
  - Do not expand the overlay's closed error or disabled-reason sets; map owner states to closed codes instead.
  - Do not record an identity exemption anywhere but this map, and only with a decision.
  - Do not write a YAML comment in a definitions block, and do not record a judgment in a canon field; record it in the definition's judgments list.
  - Do not cite review or evidence material in a definitions block; cite canon, and keep evidence paths in a unit fence's source_lineage.
  - Do not rename canon to an overlay identity name; record an identity alias instead.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Decision_Log.md
command_payload_definition_map:
  format: pm.command_payload_definitions.v1
  overlay_section: UCC-049 through UCC-105 strict schema overlay and UCC-106 lineage exclusion
  unit_range:
  - UCC-049
  - UCC-105
  type_vocabulary:
  - id
  - ref
  - secret_ref
  - string
  - boolean
  - integer
  - sha256
  - timestamp
  - url
  - path
  - enum
  - const
  - list
  - object
  - contract
  constraint_keys:
  - min_length
  - max_length
  - pattern
  - minimum
  - maximum
  - min_items
  - max_items
  - unique_items
  conditional_keys:
  - required_when
  - forbidden_when
  contract_ref_forms:
  - Plans/<file>.schema.json#/$defs/<Name>
  - Plans/<Doc>.md#<UNIT-ID>/<ContractName> (a contract in that unit's pm.typed_contracts.v1 block; bare unit refs are errors)
  - Primitive:RouteTarget
  - Primitive:OpenSubject
  - Primitive:ExecutionContext
  - local:<Name> (a result named in the same definitions block)
  literal_default_forbidden_types:
  - timestamp
  - url
  - path
  default_sentinel: none (absent; the handler applies no implied value)
  error_narrowing:
    always:
    - handler_unavailable
    - internal_error
    - invalid_args
    - permission_denied
    domain_action_or_stale_disabled:
    - stale_projection
    blocked_disabled_or_runtime_group:
    - blocked_state_required
    navigation_or_route_args:
    - invalid_route
    never:
    - unknown_command
  envelope:
    required_not_restated:
    - dispatch_id
    - command_id
    - source_surface
    - actor_ref
    common_optional:
      route_target:
        type: contract
        ref: Primitive:RouteTarget
      OpenSubject:
        type: contract
        ref: Primitive:OpenSubject
      project_id:
        type: id
      repo_id:
        type: id
      worktree_id:
        type: id
      run_id:
        type: id
      attempt_id:
        type: id
      node_id:
        type: id
      thread_id:
        type: id
      usage_event_ref:
        type: ref
      usage_record_id:
        type: id
      provider_attempt_ref:
        type: ref
      tool_call_id:
        type: id
      trace_ref:
        type: ref
      receipt_ref:
        type: ref
      receipt_refs:
        type: list
        item:
          type: ref
      raw_payload_ref:
        type: ref
      query_session_id:
        type: id
      selection_ref:
        type: ref
      confirmation_ref:
        type: ref
      idempotency_key:
        type: string
        constraints:
          max_length: 256
    identity_typing: row-group identity fields ending in _id are type id and in _ref are type ref; they become required
      only where the overlay marks them required or canon makes the subject mandatory, citing the source; a recorded
      identity alias's canon name is typed and required as the overlay name it stands for (DL-341)
  row_groups:
  - id: UCC-049..UCC-053
    first: UCC-049
    last: UCC-053
    required_identity:
    - field: capability_snapshot_ref
      when: domain_action
    optional_identity:
    - container_ref
    - image_ref
    - compose_project_ref
    - kubernetes_context
    - namespace
  - id: UCC-054..UCC-055
    first: UCC-054
    last: UCC-055
    required_identity:
    - field: repo_id
      when: always
    - field: worktree_lifecycle_state
      when: mutating
      source: 'Overlay UCC-054 through UCC-055 identity cell: "`worktree_lifecycle_state` when mutating worktree state"
        (DL-341); each command below is marked by its row in this catalog''s section 2.5C project-scope git worktree
        commands table (UCC-054)'
      commands:
      - command_id: cmd.git.worktree.create
        evidence:
          doc: Plans/UI_Command_Catalog.md
          quote: '`cmd.git.worktree.create` | Create Worktree | Creates a new git worktree at specified path'
      - command_id: cmd.git.worktree.lock
        evidence:
          doc: Plans/UI_Command_Catalog.md
          quote: '`cmd.git.worktree.lock` | Lock Worktree | Prevents accidental removal of worktree'
      - command_id: cmd.git.worktree.prune
        evidence:
          doc: Plans/UI_Command_Catalog.md
          quote: '`cmd.git.worktree.prune` | Prune Worktree | Prunes eligible stale worktree metadata'
      - command_id: cmd.git.worktree.recover
        evidence:
          doc: Plans/UI_Command_Catalog.md
          quote: '`cmd.git.worktree.recover` | Recover Worktree | Reopens or rebinds a worktree from stored lineage'
      - command_id: cmd.git.worktree.release
        evidence:
          doc: Plans/UI_Command_Catalog.md
          quote: '`cmd.git.worktree.release` | Release Worktree Ownership | Releases runtime ownership'
      - command_id: cmd.git.worktree.remove
        evidence:
          doc: Plans/UI_Command_Catalog.md
          quote: '`cmd.git.worktree.remove` | Remove Worktree | Removes an existing live worktree'
      - command_id: cmd.git.worktree.reuse
        evidence:
          doc: Plans/UI_Command_Catalog.md
          quote: '`cmd.git.worktree.reuse` | Reuse Worktree | Rebinds a clean, lineage-compatible worktree to a new run/lane/package owner'
      - command_id: cmd.git.worktree.unlock
        evidence:
          doc: Plans/UI_Command_Catalog.md
          quote: '`cmd.git.worktree.unlock` | Unlock Worktree | Removes lock from worktree'
      - command_id: cmd.git.worktree.merge
        evidence:
          doc: Plans/WorktreeGitImprovement.md
          unit: W-081
          field: canonical_text
          quote: Non-thread child integration uses cmd.git.worktree.merge only after exact-result approval
      - command_id: cmd.git.worktree.repair
        evidence:
          doc: Plans/GitHub_Integration.md
          quote: '`cmd.git.worktree.repair`'
        note: "Decided by DL-471 Q-ID7b: conservatively mutation-capable; handler_unavailable without mutation until the exact owner repair operation is defined."
      not_mutating:
      - command_id: cmd.git.worktree.request_prune
        evidence:
          doc: Plans/UI_Command_Catalog.md
          quote: '`cmd.git.worktree.request_prune` | Request Worktree Prune | Requests an approval-gated prune of the selected worktree without mutating it'
        note: 'GI-041 acceptance criterion: "request_prune never mutates worktree state".'
      - command_id: cmd.git.worktree.select
        evidence:
          doc: Plans/UI_Command_Catalog.md
          quote: '`cmd.git.worktree.select` | Select Worktree | Selects a worktree row and persists selected worktree/filter state per project'
        note: 'Selection and filter state are per-project panel state, not worktree state; W-075 keeps the selected worktree
          an owner runtime/view record.'
    optional_identity:
    - worktree_id
    - branch_ref
    - safe_point_id
  - id: UCC-056..UCC-060
    first: UCC-056
    last: UCC-060
    required_identity:
    - field: thread_id
      when: always
    optional_identity:
    - message_id
    - context_lens_mode
    - worktree_id
    - usage_detail_ref
    - context_projection_ref
  - id: UCC-061..UCC-065
    first: UCC-061
    last: UCC-065
    required_identity: []
    optional_identity:
    - browser_session_id
    - preview_subject_ref
    - selection_ref
    - screenshot_ref
    - agent_share_scope
  - id: UCC-066..UCC-072
    first: UCC-066
    last: UCC-072
    required_identity: []
    optional_identity:
    - terminal_session_id
    - pane_id
    - dev_session_id
    - command_ref
    - layout_target
  - id: UCC-073..UCC-076
    first: UCC-073
    last: UCC-076
    required_identity:
    - field: thread_id
      when: always
    optional_identity:
    - message_id
    - code_block_id
    - checkpoint_ref
    - activity_dimension
  - id: UCC-077..UCC-083
    first: UCC-077
    last: UCC-083
    required_identity:
    - field: thread_id
      when: always
    optional_identity:
    - debug_session_id
    - web_operation_id
    - slash_command_id
    - route_target
    - provider_route_ref
  - id: UCC-084..UCC-088
    first: UCC-084
    last: UCC-088
    required_identity: []
    optional_identity:
    - memory_item_id
    - artifact_id
    - ledger_ref
    - query_session_id
    - replacement
    - index_scope
  - id: UCC-089..UCC-095
    first: UCC-089
    last: UCC-095
    required_identity:
    - field: run_id
      when: always
    - field: blocked_sequence
      when: always
    - field: allowed_action_id
      when: always
    optional_identity:
    - node_id
    - attempt_id
    - safe_point_id
    - baseline_ref
    - permission_carry_ref
  - id: UCC-096..UCC-100
    first: UCC-096
    last: UCC-100
    required_identity: []
    optional_identity:
    - goal_id
    - thread_id
    - planning_session_id
    - plan_pack_ref
    - plan_compile_run_id
    - history_query_ref
    - target_identity_ref
  - id: UCC-101..UCC-105
    first: UCC-101
    last: UCC-105
    required_identity: []
    optional_identity:
    - image_ref
    - teach_session_id
    - notification_destination_id
    - sound_asset_id
    - settings_key
    - host_capability_ref
    - host_profile_id
  pre_attempt_admissible:
    field: attempt_id
    commands:
    - cmd.runtime.abandon_recovery
    - cmd.runtime.approve
    - cmd.runtime.decline
    - cmd.runtime.locate_and_verify_recovery
    - cmd.runtime.open_attempt_details
    - cmd.runtime.replan
    - cmd.runtime.resume_after_prerequisite
    - cmd.runtime.skip_node
    - cmd.runtime.start_fresh_attempt
    source: 'References allowed_action_id table (minimum args with attempt_id?) and the Pre-attempt blocked rule;
      UCC-092. Amended 2026-11-07 (DL-341): locate_and_verify_recovery and abandon_recovery, from the Known-37
      recovery-unavailable catalog rows ("Pre-attempt payloads omit `attempt_id`"), Plans/Commands_System.md
      ("Pre-attempt dispatch omits `attempt_id`") and Plans/Contracts_V0.md ("A pre-attempt request omits
      `attempt_id`")'
  owners:
    routing_rule: an exact exception wins; otherwise the longest namespace (an id starting with cmd.<namespace>.)
      among the routes of the command's primary row group (the row group of its lowest-numbered token unit, else
      of its lowest-numbered prose_unit_resolution unit that adds it)
    units:
      CRAU-115: Plans/Containers_Registry_and_Unraid.md
      CRAU-116: Plans/Containers_Registry_and_Unraid.md
      W-095: Plans/WorktreeGitImprovement.md
      ACD-637: Plans/assistant-chat-design.md
      ACD-638: Plans/assistant-chat-design.md
      ACD-639: Plans/assistant-chat-design.md
      SMPFS-328: Plans/Section15_MVP_Promoted_Features_Spec.md
      SMPFS-329: Plans/Section15_MVP_Promoted_Features_Spec.md
      CS-125: Plans/Commands_System.md
      AMS-141: Plans/assistant-memory-subsystem.md
      RAP-129: Plans/Runtime_Artifacts_Panel.md
      F3-716: Plans/FinalGUISpec.md
      F3-717: Plans/FinalGUISpec.md
      EP-236: Plans/Executor_Protocol.md
      GRS-218: Plans/Goal_Runtime_System.md
      PRDB-024: Plans/PRD_Builder.md
      PWIZ-109: Plans/Planning_Wizard.md
      PNC-037: Plans/Plan_To_Node_Compilation.md
      SSYS-076: Plans/Settings_System.md
      OP-049: Plans/Orchestrator_Page.md
      ACD-640: Plans/assistant-chat-design.md
      F3-718: Plans/FinalGUISpec.md
    routes:
    - row_group: UCC-049..UCC-053
      namespace: docker
      unit: CRAU-115
    - row_group: UCC-054..UCC-055
      namespace: git.worktree
      unit: W-095
    - row_group: UCC-056..UCC-060
      namespace: chat
      unit: ACD-637
    - row_group: UCC-061..UCC-065
      namespace: browser
      unit: SMPFS-328
    - row_group: UCC-066..UCC-072
      namespace: terminal
      unit: SMPFS-329
    - row_group: UCC-066..UCC-072
      namespace: dev
      unit: SMPFS-329
    - row_group: UCC-066..UCC-072
      namespace: catalog
      unit: SMPFS-329
    - row_group: UCC-073..UCC-076
      namespace: chat
      unit: ACD-638
    - row_group: UCC-077..UCC-083
      namespace: debug
      unit: CS-125
    - row_group: UCC-077..UCC-083
      namespace: chat.web
      unit: ACD-639
    - row_group: UCC-084..UCC-088
      namespace: chat.memory
      unit: AMS-141
    - row_group: UCC-084..UCC-088
      namespace: artifacts
      unit: RAP-129
    - row_group: UCC-084..UCC-088
      namespace: search
      unit: F3-716
    - row_group: UCC-089..UCC-095
      namespace: runtime
      unit: EP-236
    - row_group: UCC-096..UCC-100
      namespace: chat.goal
      unit: GRS-218
    - row_group: UCC-096..UCC-100
      namespace: prd_builder
      unit: PRDB-024
    - row_group: UCC-096..UCC-100
      namespace: planning_wizard
      unit: PWIZ-109
    - row_group: UCC-096..UCC-100
      namespace: plan_compile
      unit: PNC-037
    - row_group: UCC-101..UCC-105
      namespace: notifications
      unit: F3-717
    - row_group: UCC-101..UCC-105
      namespace: sound
      unit: F3-717
    - row_group: UCC-101..UCC-105
      namespace: docker
      unit: CRAU-116
    - row_group: UCC-096..UCC-100
      namespace: history
      unit: OP-049
    - row_group: UCC-101..UCC-105
      namespace: chat.vision_bridge
      unit: ACD-640
    - row_group: UCC-101..UCC-105
      namespace: teacher
      unit: F3-718
    exceptions:
    - command_id: cmd.orchestrator.push_image
      unit: CRAU-115
      reason: UCC-051 token in the Orchestrator namespace; the Docker publication contract is CRAU's.
    - command_id: cmd.docker.run
      unit: CRAU-116
      reason: UCC-105 Docker/Hosts id.
    - command_id: cmd.docker.container.open
      unit: CRAU-116
      reason: UCC-105 Docker/Hosts id.
    - command_id: cmd.chat.stop
      unit: ACD-639
      reason: UCC-083 token outside cmd.chat.web.*; chat-owned stop.
    - command_id: cmd.settings.open
      unit: SSYS-076
      reason: UCC-103 token; Settings route owner.
  prose_unit_resolution:
  - unit: UCC-053
    adds: []
    covers: []
    basis: 'Rules only: cmd.container.* retires to cmd.docker.* and cmd.docker.k8s.*; adds disabled-state and approval
      rules to the UCC-049..UCC-052 commands, no new command.'
  - unit: UCC-055
    adds: []
    covers:
    - cmd.git.worktree.prune
    - cmd.git.worktree.recover
    - cmd.git.worktree.remove
    - cmd.git.worktree.reuse
    basis: Covers cmd.git.worktree.remove, prune and reuse (its tokens) and recover (recovery); no new command.
  - unit: UCC-059
    adds: []
    covers:
    - cmd.chat.worktree.create
    - cmd.chat.worktree.info
    - cmd.chat.worktree.merge
    - cmd.chat.worktree.pr
    - cmd.chat.worktree.remove
    - cmd.chat.worktree.unbind
    basis: Guard variables for the six cmd.chat.worktree.* commands; no new command.
  - unit: UCC-061
    adds: []
    covers:
    - cmd.browser.add_full_screenshot_to_chat
    - cmd.browser.add_screenshot_to_chat
    - cmd.browser.add_selection_full_screenshot_to_chat
    - cmd.browser.add_selection_screenshot_to_chat
    - cmd.browser.add_selection_to_chat
    - cmd.browser.detach_browser_tab
    - cmd.browser.focus_browser_tab
    - cmd.browser.keep_closed
    - cmd.browser.let_agent_continue
    - cmd.browser.open_detached_preview
    - cmd.browser.open_devtools
    - cmd.browser.open_workspace_preview
    - cmd.browser.pause_agent
    - cmd.browser.pick_element_for_chat
    - cmd.browser.promote_to_normal_browsing
    - cmd.browser.reopen
    - cmd.browser.retry
    - cmd.browser.revoke_share_with_agent
    - cmd.browser.share_with_agent
    - cmd.browser.stop_agent_keep_browser
    - cmd.browser.take_over
    - cmd.browser.toggle_devtools_dock
    - cmd.terminal.open
    - cmd.terminal.show
    basis: Ownership boundary over the browser, terminal and dev commands in range; no new command.
  - unit: UCC-062
    adds: []
    covers:
    - cmd.browser.add_full_screenshot_to_chat
    - cmd.browser.add_screenshot_to_chat
    - cmd.browser.add_selection_full_screenshot_to_chat
    - cmd.browser.add_selection_screenshot_to_chat
    - cmd.browser.add_selection_to_chat
    - cmd.browser.detach_browser_tab
    - cmd.browser.focus_browser_tab
    - cmd.browser.keep_closed
    - cmd.browser.let_agent_continue
    - cmd.browser.open_detached_preview
    - cmd.browser.open_devtools
    - cmd.browser.open_workspace_preview
    - cmd.browser.pause_agent
    - cmd.browser.pick_element_for_chat
    - cmd.browser.promote_to_normal_browsing
    - cmd.browser.reopen
    - cmd.browser.retry
    - cmd.browser.revoke_share_with_agent
    - cmd.browser.share_with_agent
    - cmd.browser.stop_agent_keep_browser
    - cmd.browser.take_over
    - cmd.browser.toggle_devtools_dock
    basis: cmd.browser.* resolves to the 22 concrete browser rows of UCC-063..UCC-065.
  - unit: UCC-066
    adds: []
    covers:
    - cmd.terminal.open
    - cmd.terminal.show
    basis: Covers cmd.terminal.open and cmd.terminal.show (promotion and handoff).
  - unit: UCC-068
    adds: []
    covers:
    - cmd.terminal.focus
    - cmd.terminal.open
    - cmd.terminal.restart_replace
    - cmd.terminal.show
    basis: Covers cmd.terminal.focus, show, open and restart_replace (reuse precedence).
  - unit: UCC-069
    adds: []
    covers:
    - cmd.terminal.open
    - cmd.terminal.rerun
    - cmd.terminal.show
    basis: Covers cmd.terminal.open, show and rerun (cards).
  - unit: UCC-076
    adds: []
    covers:
    - cmd.chat.edit_last_user_message
    - cmd.chat.resend_last_user_message
    - cmd.chat.revert
    - cmd.chat.rewind
    - cmd.chat.stop
    basis: Covers cmd.chat.stop, edit_last_user_message, resend_last_user_message, rewind and revert; /edit/delete
      is a shorthand, not a command.
  - unit: UCC-079
    adds: []
    covers:
    - cmd.chat.web.crawl
    - cmd.chat.web.extract
    - cmd.chat.web.fetch
    - cmd.chat.web.map
    - cmd.chat.web.research
    - cmd.chat.web.search
    basis: Web activity provenance over the six cmd.chat.web.* operations; no new command.
  - unit: UCC-080
    adds: []
    covers:
    - cmd.chat.stop
    - cmd.chat.web.crawl
    - cmd.chat.web.extract
    - cmd.chat.web.fetch
    - cmd.chat.web.map
    - cmd.chat.web.research
    - cmd.chat.web.search
    basis: Slash policy over the cmd.chat.web.* operations and cmd.chat.stop; no new command.
  - unit: UCC-081
    adds: []
    covers:
    - cmd.chat.web.crawl
    - cmd.chat.web.extract
    - cmd.chat.web.fetch
    - cmd.chat.web.help
    - cmd.chat.web.map
    - cmd.chat.web.research
    - cmd.chat.web.search
    basis: Supplies provider option names for cmd.chat.web.help and the six cmd.chat.web.* operations; no new command.
  - unit: UCC-082
    adds: []
    covers:
    - cmd.chat.web.crawl
    - cmd.chat.web.extract
    - cmd.chat.web.fetch
    - cmd.chat.web.help
    - cmd.chat.web.map
    - cmd.chat.web.research
    - cmd.chat.web.search
    basis: Supplies result-shape hints for cmd.chat.web.help and the six cmd.chat.web.* operations; no new command.
  - unit: UCC-088
    adds: []
    covers:
    - cmd.search.find_in_files
    - cmd.search.open_result
    - cmd.search.replace_all
    - cmd.search.replace_in_files
    - cmd.search.replace_selected
    basis: Covers cmd.search.find_in_files, replace_in_files, open_result, replace_selected and replace_all.
  - unit: UCC-089
    adds:
    - cmd.runtime.abort_run
    - cmd.runtime.replan
    - cmd.runtime.restore_safe_point_then_retry
    - cmd.runtime.resume_after_prerequisite
    - cmd.runtime.skip_node
    - cmd.runtime.start_fresh_attempt
    covers: []
    basis: Maps allowed_action_id tokens through the References table (allowed_action_id -> canonical command id),
      adding resume_after_prerequisite, restore_safe_point_then_retry, start_fresh_attempt, replan, skip_node and
      abort_run.
  - unit: UCC-090
    adds: []
    covers:
    - cmd.runtime.restore_safe_point_then_retry
    - cmd.runtime.retry_now
    - cmd.runtime.start_fresh_attempt
    basis: Rules over the runtime recovery retry and restore commands; no new command.
  - unit: UCC-092
    adds: []
    covers:
    - cmd.runtime.abandon_recovery
    - cmd.runtime.abort_run
    - cmd.runtime.approve
    - cmd.runtime.decline
    - cmd.runtime.locate_and_verify_recovery
    - cmd.runtime.open_attempt_details
    - cmd.runtime.replan
    - cmd.runtime.restore_safe_point_then_retry
    - cmd.runtime.resume_after_prerequisite
    - cmd.runtime.retry_now
    - cmd.runtime.skip_node
    - cmd.runtime.start_fresh_attempt
    basis: Pre-attempt blocked-sequence identity over the runtime recovery commands; no new command.
  - unit: UCC-093
    adds: []
    covers:
    - cmd.runtime.abandon_recovery
    - cmd.runtime.abort_run
    - cmd.runtime.approve
    - cmd.runtime.decline
    - cmd.runtime.locate_and_verify_recovery
    - cmd.runtime.open_attempt_details
    - cmd.runtime.replan
    - cmd.runtime.restore_safe_point_then_retry
    - cmd.runtime.resume_after_prerequisite
    - cmd.runtime.retry_now
    - cmd.runtime.skip_node
    - cmd.runtime.start_fresh_attempt
    basis: Recovery verb copy over the runtime recovery commands; no new command.
  - unit: UCC-094
    adds:
    - cmd.runtime.abandon_recovery
    - cmd.runtime.locate_and_verify_recovery
    covers:
    - cmd.runtime.abort_run
    - cmd.runtime.approve
    - cmd.runtime.decline
    - cmd.runtime.open_attempt_details
    - cmd.runtime.replan
    - cmd.runtime.restore_safe_point_then_retry
    - cmd.runtime.resume_after_prerequisite
    - cmd.runtime.retry_now
    - cmd.runtime.skip_node
    - cmd.runtime.start_fresh_attempt
    basis: cmd.runtime.* covers the runtime recovery commands plus cmd.runtime.locate_and_verify_recovery and cmd.runtime.abandon_recovery
      from the Known-37 recovery-unavailable catalog rows.
  - unit: UCC-095
    adds: []
    covers:
    - cmd.runtime.abandon_recovery
    - cmd.runtime.abort_run
    - cmd.runtime.approve
    - cmd.runtime.decline
    - cmd.runtime.locate_and_verify_recovery
    - cmd.runtime.open_attempt_details
    - cmd.runtime.replan
    - cmd.runtime.restore_safe_point_then_retry
    - cmd.runtime.resume_after_prerequisite
    - cmd.runtime.retry_now
    - cmd.runtime.skip_node
    - cmd.runtime.start_fresh_attempt
    basis: Recovery metadata resolver and permission carry-through over the runtime recovery commands; no new command.
  - unit: UCC-097
    adds: []
    covers:
    - cmd.plan_compile.cancel
    - cmd.plan_compile.inspect_assignment
    - cmd.plan_compile.inspect_blocker
    - cmd.plan_compile.inspect_evidence
    - cmd.plan_compile.open_build
    - cmd.plan_compile.pause
    - cmd.plan_compile.request_bounded_recompile
    - cmd.plan_compile.resume
    - cmd.plan_compile.retry
    - cmd.planning_wizard.amendment.accept
    - cmd.planning_wizard.approve_and_build
    - cmd.planning_wizard.start
    - cmd.planning_wizard.topic.add
    - cmd.planning_wizard.topic.defer
    - cmd.planning_wizard.topic.mark_impacted
    - cmd.planning_wizard.topic.merge
    - cmd.planning_wizard.topic.open
    - cmd.planning_wizard.topic.rename
    - cmd.planning_wizard.topic.reopen
    - cmd.planning_wizard.topic.reorder
    - cmd.planning_wizard.topic.split
    - cmd.prd_builder.annotation.resolve
    - cmd.prd_builder.annotation.upsert
    - cmd.prd_builder.answer.upsert
    - cmd.prd_builder.approve_for_planning_wizard
    - cmd.prd_builder.conflict.resolve
    - cmd.prd_builder.pack.reopen
    - cmd.prd_builder.source.import
    basis: Covers the 28 rows of Concrete PRD Builder, Planning Wizard, and Plan Compile command rows (UCC-098 adds
      them).
  - unit: UCC-098
    adds:
    - cmd.plan_compile.cancel
    - cmd.plan_compile.inspect_assignment
    - cmd.plan_compile.inspect_blocker
    - cmd.plan_compile.inspect_evidence
    - cmd.plan_compile.open_build
    - cmd.plan_compile.pause
    - cmd.plan_compile.request_bounded_recompile
    - cmd.plan_compile.resume
    - cmd.plan_compile.retry
    - cmd.planning_wizard.amendment.accept
    - cmd.planning_wizard.approve_and_build
    - cmd.planning_wizard.start
    - cmd.planning_wizard.topic.add
    - cmd.planning_wizard.topic.defer
    - cmd.planning_wizard.topic.mark_impacted
    - cmd.planning_wizard.topic.merge
    - cmd.planning_wizard.topic.open
    - cmd.planning_wizard.topic.rename
    - cmd.planning_wizard.topic.reopen
    - cmd.planning_wizard.topic.reorder
    - cmd.planning_wizard.topic.split
    - cmd.prd_builder.annotation.resolve
    - cmd.prd_builder.annotation.upsert
    - cmd.prd_builder.answer.upsert
    - cmd.prd_builder.approve_for_planning_wizard
    - cmd.prd_builder.conflict.resolve
    - cmd.prd_builder.pack.reopen
    - cmd.prd_builder.source.import
    covers: []
    basis: Adds the 28 rows of Concrete PRD Builder, Planning Wizard, and Plan Compile command rows (the command
      family required by UCC-098 is concrete).
  - unit: UCC-099
    adds: []
    covers:
    - cmd.search.find_in_files
    basis: No cmd.discovery.* family is needed; cmd.search.* stays canon. Covers cmd.search.find_in_files.
  - unit: UCC-100
    adds: []
    covers:
    - cmd.runtime.resume_after_prerequisite
    - cmd.runtime.retry_now
    basis: 'Its History actions are minted as concrete tokens (DL-333 resolution 9b). Resume and retry of a historical
      run add no History command: they map through allowed_action_ids[] to cmd.runtime.resume_after_prerequisite
      and cmd.runtime.retry_now (Recovery command definitions).'
  - unit: UCC-104
    adds: []
    covers: []
    basis: Its only token is retired source lineage; the toggle reuses cmd.settings.transaction.preview and .apply
      (UCC-120, SSYS-018). No command.
  - unit: UCC-105
    adds:
    - cmd.docker.container.open
    - cmd.docker.host.access.open_app
    - cmd.docker.host.instance.restart
    - cmd.docker.host.instance.retain
    - cmd.docker.host.instance.start
    - cmd.docker.host.instance.stop
    - cmd.docker.host.preflight
    - cmd.docker.host.profile.save
    - cmd.docker.host.receipt.open
    - cmd.docker.host.refresh
    - cmd.docker.host.session.launch
    - cmd.docker.hosts.open
    - cmd.docker.run
    covers:
    - cmd.docker.cleanup.prune
    - cmd.docker.cleanup.scan
    - cmd.docker.container.attach_shell
    - cmd.docker.container.view_logs
    basis: Wildcards only; its canonical_text names the Docker/Hosts ids. Adds the 11 host ids, cmd.docker.run and
      cmd.docker.container.open; covers cmd.docker.container.view_logs, attach_shell, cleanup.scan and cleanup.prune.
  outside_range_commands:
  - command_id: cmd.docker.bake
    catalog_unit: UCC-231
    owner_unit: CRAU-115
    row_group: UCC-049..UCC-053
    evidence: {doc: Plans/UI_Command_Catalog.md, unit: UCC-231, field: canonical_text, line: 21882, quote: "cmd.docker.bake is the live bare Bake command exposed by CRAU-011"}
  - command_id: cmd.docker.container.stats
    catalog_unit: UCC-231
    owner_unit: CRAU-115
    row_group: UCC-049..UCC-053
    evidence: {doc: Plans/UI_Command_Catalog.md, unit: UCC-231, field: canonical_text, line: 21883, quote: "cmd.docker.container.stats shows live or cached container stats with freshness markers"}
  - command_id: cmd.git.worktree.merge
    catalog_unit: UCC-132
    owner_unit: W-095
    row_group: UCC-054..UCC-055
    evidence: {doc: Plans/UI_Command_Catalog.md, unit: UCC-132, field: canonical_text, line: 13077, quote: "cmd.git.worktree.merge mints the project-scope worktree merge the UCC-054 family lacked"}
  - command_id: cmd.git.worktree.open_topology
    catalog_unit: UCC-231
    owner_unit: W-095
    row_group: UCC-054..UCC-055
    evidence: {doc: Plans/UI_Command_Catalog.md, unit: UCC-231, field: canonical_text, line: 21885, quote: "cmd.git.worktree.open_topology and cmd.git.worktree.repair are the live project-scope ids listed"}
  - command_id: cmd.git.worktree.repair
    catalog_unit: UCC-231
    owner_unit: W-095
    row_group: UCC-054..UCC-055
    evidence: {doc: Plans/UI_Command_Catalog.md, unit: UCC-231, field: canonical_text, line: 21885, quote: "cmd.git.worktree.open_topology and cmd.git.worktree.repair are the live project-scope ids listed"}
  - command_id: cmd.debug.record_verification
    catalog_unit: UCC-142
    owner_unit: CS-125
    row_group: UCC-077..UCC-083
    evidence: {doc: Plans/UI_Command_Catalog.md, unit: UCC-142, field: canonical_text, line: 14061, quote: "cmd.debug.record_verification and cmd.debug.run_cleanup are registered with the"}
  - command_id: cmd.debug.run_cleanup
    catalog_unit: UCC-142
    owner_unit: CS-125
    row_group: UCC-077..UCC-083
    evidence: {doc: Plans/UI_Command_Catalog.md, unit: UCC-142, field: canonical_text, line: 14061, quote: "cmd.debug.record_verification and cmd.debug.run_cleanup are registered with the"}
  unresolved_tokens: []
  non_definition_tokens:
  - token: cmd.docker.remove
    disposition: compatibility_alias
    targets: [cmd.docker.container.delete]
    evidence:
      doc: Plans/Decision_Log.md
      unit: DL-471
      field: canonical_text
      quote: "DL-471 Q-ID1 decides cmd.docker.remove is a compatibility_alias of cmd.docker.container.delete."
  - token: cmd.git.worktree
    disposition: family_alias
    evidence:
      doc: Plans/Decision_Log.md
      unit: DL-471
      field: canonical_text
      quote: "DL-471 Q-ID2 decides cmd.git.worktree is a non-dispatch family token."
  - token: cmd.browser.*
    disposition: family_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-062
      field: stale_retired_dispositions
      quote: Older /focus/detach/share/revoke shorthand maps only to concrete rows
  - token: cmd.browser.devtools.open
    disposition: alias
    targets:
    - cmd.browser.open_devtools
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-063
      field: stale_retired_dispositions
      quote: cmd.browser.devtools.open is an alias of cmd.browser.open_devtools
  - token: cmd.chat.add_file_reference
    disposition: compatibility_alias
    targets:
    - cmd.chat.attachment.add
    evidence:
      doc: Plans/UI_Command_Catalog.md
      quote: File-only compatibility alias to `cmd.chat.attachment.add`
    note: Target cmd.chat.attachment.add is owned by UCC-156, outside UCC-049..UCC-105; the signature-locked spelling
      stays.
  - token: cmd.chat.close_thread_usage
    disposition: superseded_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-060
      field: negative_constraints
      quote: cmd.chat.open_thread_usage, cmd.chat.focus_thread_usage, and cmd.chat.close_thread_usage are superseded
    note: Normalizes to cmd.nav.open_usage_subject (UCC-109).
  - token: cmd.chat.focus_thread_usage
    disposition: superseded_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-060
      field: negative_constraints
      quote: cmd.chat.open_thread_usage, cmd.chat.focus_thread_usage, and cmd.chat.close_thread_usage are superseded
    note: Normalizes to cmd.nav.open_usage_subject (UCC-109).
  - token: cmd.chat.open_thread_usage
    disposition: superseded_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-060
      field: negative_constraints
      quote: cmd.chat.open_thread_usage, cmd.chat.focus_thread_usage, and cmd.chat.close_thread_usage are superseded
    note: Normalizes to cmd.nav.open_usage_subject (UCC-109, outside UCC-049..UCC-105).
  - token: cmd.chat.teach.capture
    disposition: owned_outside_range
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-102
      field: canonical_text
      quote: typing /teach opens the Teach popup through cmd.chat.teach.capture
    note: The Teach popup command (DL-127, UCC-172); not a Teacher guided GUI command.
  - token: cmd.chat.worktree.*
    disposition: family_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-054
      field: preserved_exact_tokens
      quote: cmd.chat.worktree.*
    note: Thread-scoped family; its concrete rows are UCC-058's.
  - token: cmd.chat.worktree.bind_existing
    disposition: retired_non_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-058
      field: stale_retired_dispositions
      quote: 'cmd.chat.worktree.bind_existing: retired non-alias; no primary handler, production-wiring row or dispatch
        alias'
    note: 'Q5 resolution 4 (DL-335): UCC-058 forbids exposing Bind Existing as this command, so it is retired and gets
      no definition.'
  - token: cmd.chat.worktree.create_pr
    disposition: compatibility_alias
    targets:
    - cmd.chat.worktree.pr
    evidence:
      doc: Plans/Contracts_V0.md
      unit: CV-160
      field: acceptance_criteria
      quote: cmd.chat.worktree.open_files and cmd.chat.worktree.create_pr may route to canonical assistant worktree
        commands.
    note: CV-160 names no target among the canonical six; the alias goes to cmd.chat.worktree.pr, the six's Create PR
      command (UCC-058 row; Contracts_V0 section 7.1 registration table). Recorded by DL-341 max_review_changes.
  - token: cmd.chat.worktree.open_files
    disposition: compatibility_alias
    targets:
    - cmd.git.worktree.open
    evidence:
      doc: Plans/Contracts_V0.md
      unit: CV-160
      field: acceptance_criteria
      quote: cmd.chat.worktree.open_files and cmd.chat.worktree.create_pr may route to canonical assistant worktree
        commands.
    note: Canon conflict on the target. CV-160 lets the alias route to the canonical assistant worktree commands, none
      of which opens files, while UCC-058 routes Open Files through the project-scope cmd.git.worktree.open and the
      section 2.5C rules let the thread-scoped family normalize to project-scope worktree operations. The catalog keeps
      aliases, so the target is cmd.git.worktree.open. Recorded by DL-341 max_review_changes.
  - token: cmd.chat.{new,archive,delete,rename,pin,export,search}
    disposition: family_alias
    targets:
    - cmd.chat.new
    - cmd.chat.archive
    - cmd.chat.delete
    - cmd.chat.rename
    - cmd.chat.pin
    - cmd.chat.export
    - cmd.chat.search
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-056
      field: preserved_exact_tokens
      quote: cmd.chat.{new,archive,delete,rename,pin,export,search}
  - token: cmd.container.*
    disposition: retired
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-053
      field: stale_retired_dispositions
      quote: Legacy cmd.container.* references are retired to active cmd.docker.* and cmd.docker.k8s.* namespaces
  - token: cmd.debug.*
    disposition: family_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-077
      field: preserved_exact_tokens
      quote: cmd.debug.*
  - token: cmd.docker.*
    disposition: family_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-105
      field: preserved_exact_tokens
      quote: cmd.docker.*
  - token: cmd.docker.build
    disposition: compatibility_alias
    targets:
    - cmd.docker.build.image
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-049
      field: compatibility_only_notes
      quote: cmd.docker.build/logs/exec/inspect are compatibility aliases
    note: 'Cozy Shelves reconciliation: alias-of cmd.docker.build.image (selected path).'
  - token: cmd.docker.compose.scenario.save/run/edit/delete
    disposition: family_alias
    targets:
    - cmd.docker.compose.scenario.save
    - cmd.docker.compose.scenario.run
    - cmd.docker.compose.scenario.edit
    - cmd.docker.compose.scenario.delete
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-050
      field: compatibility_only_notes
      quote: Grouped scenario command token denotes the scenario command family
  - token: cmd.docker.compose_down
    disposition: compatibility_alias
    targets:
    - cmd.docker.compose.down
    evidence:
      doc: Plans/UI_Command_Catalog.md
      quote: '| `cmd.docker.compose_down` | Compose Down | Compatibility alias for full-compose down |'
    note: Target cmd.docker.compose.down is owned by UCC-137, outside UCC-049..UCC-105.
  - token: cmd.docker.compose_up
    disposition: compatibility_alias
    targets:
    - cmd.docker.compose.up
    evidence:
      doc: Plans/UI_Command_Catalog.md
      quote: '| `cmd.docker.compose_up` | alias-of `cmd.docker.compose.up` |'
    note: Target cmd.docker.compose.up is owned by UCC-137, outside UCC-049..UCC-105.
  - token: cmd.docker.exec
    disposition: compatibility_alias
    targets:
    - cmd.docker.container.attach_shell
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-049
      field: compatibility_only_notes
      quote: cmd.docker.build/logs/exec/inspect are compatibility aliases
  - token: cmd.docker.inspect
    disposition: compatibility_alias
    targets:
    - cmd.docker.container.inspect
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-049
      field: compatibility_only_notes
      quote: cmd.docker.build/logs/exec/inspect are compatibility aliases
  - token: cmd.docker.k8s.*
    disposition: family_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-105
      field: preserved_exact_tokens
      quote: cmd.docker.k8s.*
  - token: cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace
    disposition: family_alias
    targets:
    - cmd.docker.k8s.apply
    - cmd.docker.k8s.diff
    - cmd.docker.k8s.logs
    - cmd.docker.k8s.exec
    - cmd.docker.k8s.port_forward
    - cmd.docker.k8s.select_context
    - cmd.docker.k8s.select_namespace
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-052
      field: preserved_exact_tokens
      quote: cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace
  - token: cmd.docker.logs
    disposition: compatibility_alias
    targets:
    - cmd.docker.container.view_logs
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-049
      field: compatibility_only_notes
      quote: cmd.docker.build/logs/exec/inspect are compatibility aliases
  - token: cmd.docker.restart
    disposition: compatibility_alias
    targets:
    - cmd.docker.container.restart
    evidence:
      doc: Plans/UI_Command_Catalog.md
      quote: '`cmd.docker.restart` becomes a recorded compatibility alias'
  - token: cmd.docker.set_context
    disposition: compatibility_alias
    targets:
    - cmd.docker.context.select
    evidence:
      doc: Plans/UI_Command_Catalog.md
      quote: '| `cmd.docker.set_context` | alias-of `cmd.docker.context.select` |'
  - token: cmd.docker.stop
    disposition: compatibility_alias
    targets:
    - cmd.docker.container.stop
    evidence:
      doc: Plans/UI_Command_Catalog.md
      quote: '`cmd.docker.stop` becomes a recorded compatibility alias'
  - token: cmd.git.worktree.open_files
    disposition: compatibility_alias
    targets:
    - cmd.git.worktree.open
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-054
      field: compatibility_only_notes
      quote: cmd.git.worktree.open_files
  - token: cmd.git.worktree.switch
    disposition: compatibility_alias
    targets:
    - cmd.git.worktree.open
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-054
      field: compatibility_only_notes
      quote: and switch are compatibility aliases
    note: '2.5C: compatibility alias for select plus open until callers migrate.'
  - token: cmd.k8s.*
    disposition: compatibility_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-052
      field: compatibility_only_notes
      quote: Existing cmd.k8s.*, set_context, and set_namespace rows are compatibility aliases
  - token: cmd.orchestrator.restore_safe_point_then_retry
    disposition: compatibility_alias
    targets:
    - cmd.runtime.restore_safe_point_then_retry
    evidence:
      doc: Plans/UI_Command_Catalog.md
      quote: '`normalization.kind = compatibility_alias`, `normalizes_to_contract = cmd.runtime.restore_safe_point_then_retry`,
        `alias_of_command_id = cmd.orchestrator.safe_point_retry`'
    note: 'Owned by UCC-111, outside UCC-049..UCC-105. The exact recovery command contracts table gives its immediate
      alias_of_command_id as the wrapper cmd.orchestrator.safe_point_retry, which is itself a wrapper
      (normalization.kind wrapper, alias_of_command_id null) and not an alias, and its normalizes_to_contract as
      cmd.runtime.restore_safe_point_then_retry; the Orchestrator safe-point retry prose calls it a compatibility alias
      for that same runtime command. It accepts the wrapper input, applies the wrapper''s identical
      permission-validation and consumption transform, and dispatches the exact canonical payload to the runtime
      command''s handler, with no handler, result, effect, admission or idempotency domain of its own (Executor_Protocol.md
      Approved baseline-target retry and restore lifecycle). Recorded by DL-341 max_review_changes.'
  - token: cmd.panel_tab.close
    disposition: owned_outside_range
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-072
      field: canonical_text
      quote: cmd.panel_tab.close ends the tab's session after the terminal kind's close check
    note: Owned by UCC-200.
  - token: cmd.plan_compile.retry_stage
    disposition: compatibility_alias
    targets:
    - cmd.plan_compile.retry
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.plan_compile.retry", "alias_command_ids": ["cmd.plan_compile.retry_stage"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.planning_wizard.accept_amendment
    disposition: compatibility_alias
    targets:
    - cmd.planning_wizard.amendment.accept
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.planning_wizard.amendment.accept", "alias_command_ids": ["cmd.planning_wizard.accept_amendment"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.planning_wizard.add_topic
    disposition: compatibility_alias
    targets:
    - cmd.planning_wizard.topic.add
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.planning_wizard.topic.add", "alias_command_ids": ["cmd.planning_wizard.add_topic"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.planning_wizard.defer_topic
    disposition: compatibility_alias
    targets:
    - cmd.planning_wizard.topic.defer
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.planning_wizard.topic.defer", "alias_command_ids": ["cmd.planning_wizard.defer_topic"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.planning_wizard.mark_impacted
    disposition: compatibility_alias
    targets:
    - cmd.planning_wizard.topic.mark_impacted
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.planning_wizard.topic.mark_impacted", "alias_command_ids": ["cmd.planning_wizard.mark_impacted"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.planning_wizard.merge_topic
    disposition: compatibility_alias
    targets:
    - cmd.planning_wizard.topic.merge
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.planning_wizard.topic.merge", "alias_command_ids": ["cmd.planning_wizard.merge_topic"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.planning_wizard.rename_topic
    disposition: compatibility_alias
    targets:
    - cmd.planning_wizard.topic.rename
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.planning_wizard.topic.rename", "alias_command_ids": ["cmd.planning_wizard.rename_topic"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.planning_wizard.reopen_topic
    disposition: compatibility_alias
    targets:
    - cmd.planning_wizard.topic.reopen
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.planning_wizard.topic.reopen", "alias_command_ids": ["cmd.planning_wizard.reopen_topic"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.planning_wizard.reorder_topic
    disposition: compatibility_alias
    targets:
    - cmd.planning_wizard.topic.reorder
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.planning_wizard.topic.reorder", "alias_command_ids": ["cmd.planning_wizard.reorder_topic"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.planning_wizard.split_topic
    disposition: compatibility_alias
    targets:
    - cmd.planning_wizard.topic.split
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.planning_wizard.topic.split", "alias_command_ids": ["cmd.planning_wizard.split_topic"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.planning_wizard.start_from_prd
    disposition: compatibility_alias
    targets:
    - cmd.planning_wizard.start
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.planning_wizard.start", "alias_command_ids": ["cmd.planning_wizard.start_from_prd"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.prd_builder.annotate_source
    disposition: compatibility_alias
    targets:
    - cmd.prd_builder.annotation.upsert
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.prd_builder.annotation.upsert", "alias_command_ids": ["cmd.prd_builder.annotate_source"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.prd_builder.answer_question
    disposition: compatibility_alias
    targets:
    - cmd.prd_builder.answer.upsert
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.prd_builder.answer.upsert", "alias_command_ids": ["cmd.prd_builder.answer_question"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.prd_builder.approve_for_planning
    disposition: compatibility_alias
    targets:
    - cmd.prd_builder.approve_for_planning_wizard
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.prd_builder.approve_for_planning_wizard", "alias_command_ids": ["cmd.prd_builder.approve_for_planning"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.prd_builder.import_sources
    disposition: compatibility_alias
    targets:
    - cmd.prd_builder.source.import
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.prd_builder.source.import", "alias_command_ids": ["cmd.prd_builder.import_sources"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.prd_builder.reopen_pack
    disposition: compatibility_alias
    targets:
    - cmd.prd_builder.pack.reopen
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.prd_builder.pack.reopen", "alias_command_ids": ["cmd.prd_builder.reopen_pack"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.prd_builder.resolve_conflict
    disposition: compatibility_alias
    targets:
    - cmd.prd_builder.conflict.resolve
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.prd_builder.conflict.resolve", "alias_command_ids": ["cmd.prd_builder.resolve_conflict"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.runtime.*
    disposition: family_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-089
      field: stale_retired_dispositions
      quote: 'Canonical recovery commands use one shared namespace: cmd.runtime.*'
    note: Legacy recovery command namespaces are deprecated aliases only (UCC-089 compatibility_only_notes).
  - token: cmd.settings.agent_rules.dry_method_default_guard.set
    disposition: source_lineage
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-104
      field: stale_retired_dispositions
      quote: 'cmd.settings.agent_rules.dry_method_default_guard.set: retired source lineage'
  - token: cmd.settings.open_notifications
    disposition: retired_non_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-103
      field: stale_retired_dispositions
      quote: 'cmd.settings.open_notifications: retained source lineage only; no primary handler, production-wiring
        row, or alias'
  - token: cmd.settings.transaction.apply
    disposition: owned_outside_range
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-104
      field: canonical_text
      quote: reuses cmd.settings.transaction.preview and cmd.settings.transaction.apply from SSYS-018
    note: Owned by UCC-120 and SSYS-018.
  - token: cmd.settings.transaction.preview
    disposition: owned_outside_range
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-104
      field: canonical_text
      quote: reuses cmd.settings.transaction.preview and cmd.settings.transaction.apply from SSYS-018
    note: Owned by UCC-120 and SSYS-018.
  - token: cmd.terminal.close_pane
    disposition: retired
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-072
      field: stale_retired_dispositions
      quote: termination_policy retires with cmd.terminal.close_pane
  - token: cmd.terminal.detach
    disposition: retired
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-067
      field: stale_retired_dispositions
      quote: the detach and pane rows retire; replacements in UCC-201
  - token: cmd.terminal.focus_session
    disposition: alias
    targets:
    - cmd.terminal.focus
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-202
      field: canonical_text
      quote: cmd.terminal.focus is canonical and cmd.terminal.focus_session is its alias
    note: 'DL-341: recorded alias metadata of cmd.terminal.focus (UCC-202, DL-180), with no handler or row of its own.'
  - token: cmd.terminal.kill_session
    disposition: owned_outside_range
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-072
      field: canonical_text
      quote: ending a session while keeping its tab is cmd.terminal.terminate_session or cmd.terminal.kill_session
        (UCC-201)
    note: Owned by UCC-201.
  - token: cmd.terminal.move_pane
    disposition: retired
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-067
      field: stale_retired_dispositions
      quote: the detach and pane rows retire; replacements in UCC-201
  - token: cmd.terminal.split_pane
    disposition: retired
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-067
      field: stale_retired_dispositions
      quote: the detach and pane rows retire; replacements in UCC-201
  - token: cmd.terminal.terminate_session
    disposition: owned_outside_range
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-072
      field: canonical_text
      quote: ending a session while keeping its tab is cmd.terminal.terminate_session or cmd.terminal.kill_session
        (UCC-201)
    note: Owned by UCC-201.
  - token: cmd.thread.request
    disposition: owned_outside_range
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-056
      field: canonical_text
      quote: Existing cmd.thread.request/spawn Send uses current local previews and receiver authority
    note: Owned by UCC-145 and UCC-216.
  - token: cmd.worktree.provision
    disposition: compatibility_alias
    targets:
    - cmd.git.worktree.create
    evidence:
      doc: Plans/UI_Command_Catalog.md
      quote: '| `cmd.worktree.provision` / `cmd.worktree.release` | alias intents -> `cmd.git.worktree.create` / `cmd.git.worktree.release`; no new rows |'
    note: 'Commands_System.md''s candidate census calls it a compatibility spelling, not registered, of
      cmd.git.worktree.create, one of the seven compatibility intents of CS-066 and UCC-145; DRY_Rules.md and
      Shared_Integration_Runtime.md normalize it to cmd.git.worktree.create, with only the existing thread wrapper
      for a thread-scoped caller. Recorded by DL-341 max_review_changes.'
  - token: cmd.worktree.release
    disposition: compatibility_alias
    targets:
    - cmd.git.worktree.release
    evidence:
      doc: Plans/UI_Command_Catalog.md
      quote: '| `cmd.worktree.provision` / `cmd.worktree.release` | alias intents -> `cmd.git.worktree.create` / `cmd.git.worktree.release`; no new rows |'
    note: 'Commands_System.md''s candidate census calls it a compatibility spelling, not registered, of
      cmd.git.worktree.release, one of the seven compatibility intents of CS-066 and UCC-145; DRY_Rules.md and
      Shared_Integration_Runtime.md normalize it to cmd.git.worktree.release. Recorded by DL-341
      max_review_changes.'
  - token: compose.run_scenario
    disposition: compatibility_alias
    targets:
    - cmd.docker.compose.scenario.run
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-137
      field: canonical_text
      quote: the flat compose.save_scenario and compose.run_scenario spellings recorded as compatibility aliases
    note: 'DL-341: the flat spelling canon records (UCC-137; the Cozy Shelves table row for the scenario family).'
  - token: compose.save_scenario
    disposition: compatibility_alias
    targets:
    - cmd.docker.compose.scenario.save
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-137
      field: canonical_text
      quote: the flat compose.save_scenario and compose.run_scenario spellings recorded as compatibility aliases
    note: 'DL-341: the flat spelling canon records (UCC-137; the Cozy Shelves table row for the scenario family).'
  - token: set_context
    disposition: compatibility_alias
    targets:
    - cmd.docker.k8s.select_context
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-137
      field: canonical_text
      quote: cmd.docker.k8s.select_context and cmd.docker.k8s.select_namespace are canonical with set_context and set_namespace
        recorded aliases
    note: 'DL-341: the bare K8s-era form; UCC-052 compatibility_only_notes also marks it a compatibility alias. The prototype
      token cmd.docker.set_context is a different alias, of cmd.docker.context.select.'
  - token: set_namespace
    disposition: compatibility_alias
    targets:
    - cmd.docker.k8s.select_namespace
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-137
      field: canonical_text
      quote: cmd.docker.k8s.select_context and cmd.docker.k8s.select_namespace are canonical with set_context and set_namespace
        recorded aliases
    note: 'DL-341: the bare K8s-era form; UCC-052 compatibility_only_notes also marks it a compatibility alias.'
  owner_state_code_map:
  - owner_state: phase_not_reached
    maps_to: blocked_state_required
    sources:
    - "Plans/Commands_System.md CS-065 and Plans/UI_Command_Catalog.md UCC-142 name phase_not_reached outside the closed overlay set. Decided by DL-471 Q-DB3: blocked_state_required under DL-333 resolution 6; retain the exact owner state as display detail."
  - owner_state: preservation_hold_active
    maps_to: blocked_state_required
    sources:
    - "Plans/Commands_System.md CS-065 and Plans/UI_Command_Catalog.md UCC-142 name preservation_hold_active outside the closed overlay set. Decided by DL-471 Q-DB3: blocked_state_required under DL-333 resolution 6; retain the exact owner state as display detail."
  - owner_state: access_url_unresolved
    maps_to: not_configured
    sources:
    - 'Plans/Containers_Registry_and_Unraid.md CRAU-095 and section 2B list access_url_unresolved in the canonical
      local-runtime reason-code base enum; canon names the code and gives it no meaning there. Mapped to
      not_configured from the code''s name: the P0c worker''s choice, under DL-333 resolution 6 as the stream C lead
      applies it (DL-341 under_dl333_resolution_6). Not configured is a family of the shared Docker/Kubernetes
      disabled-state taxonomy (UCC-053; this catalog''s section 2.5B taxonomy paragraph: Unsupported, Not configured,
      Unauthorized, Unreachable, Degraded, Partial capability); section 2A Runtime access URL resolution: when no
      access URL is available, Docker Manager MUST show No direct access URL detected and disable the open action
      rather than guessing'
  - owner_state: activation_not_active
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: actor_not_authorized
    maps_to: unauthorized
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: annotation_terminal
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: assignment_missing
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: bake_unavailable
    maps_to: partial_capability
    sources:
    - 'Plans/Containers_Registry_and_Unraid.md CRAU-095 and section 2B list bake_unavailable in the canonical
      local-runtime reason-code base enum; canon names the code and gives it no meaning there. Mapped to
      partial_capability from the code''s name: the P0c worker''s choice, under DL-333 resolution 6 as the stream C
      lead applies it (DL-341 under_dl333_resolution_6). Partial capability is a family of the shared
      Docker/Kubernetes disabled-state taxonomy (UCC-053; this catalog''s section 2.5B taxonomy paragraph:
      Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability)'
  - owner_state: blocker_missing
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: blocking_findings
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: buildx_unavailable
    maps_to: partial_capability
    sources:
    - 'Plans/Containers_Registry_and_Unraid.md CRAU-095 and section 2B list buildx_unavailable in the canonical
      local-runtime reason-code base enum; canon names the code and gives it no meaning there. Mapped to
      partial_capability from the code''s name: the P0c worker''s choice, under DL-333 resolution 6 as the stream C
      lead applies it (DL-341 under_dl333_resolution_6). Partial capability is a family of the shared
      Docker/Kubernetes disabled-state taxonomy (UCC-053; this catalog''s section 2.5B taxonomy paragraph:
      Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability); section 2A persists
      buildx readiness for the build surfaces'
  - owner_state: compile_terminal
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: compose_invalid
    maps_to: blocked_state_required
    sources:
    - 'Plans/Containers_Registry_and_Unraid.md CRAU-095 and section 2B list compose_invalid in the canonical
      local-runtime reason-code base enum; canon names the code and gives it no meaning there. Mapped to
      blocked_state_required from the code''s name: the P0c worker''s choice, under DL-333 resolution 6 as the stream
      C lead applies it (DL-341 under_dl333_resolution_6); by its name the command waits for a valid compose file.
      CRAU-093: compose validation failures (compose_invalid, compose_service_missing) render as reason-coded rows
      whose repair path is the editor handoff. Canon reads two ways here: blocked_state_required is not a family of
      the shared Docker/Kubernetes disabled-state taxonomy (UCC-053; this catalog''s section 2.5B taxonomy paragraph:
      Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability), while
      Plans/Containers_Registry_and_Unraid.md section 2B gives runtime identity a local-runtime blocked/degraded
      classification and lists compose-up failure, unhealthy container, missing Docker context, cluster unreachable
      and rollout failure among local-runtime blockers. Kept as the best fit and asked of the CRAU owner (DL-341
      crau_owner_questions)'
  - owner_state: compose_service_missing
    maps_to: blocked_state_required
    sources:
    - 'Plans/Containers_Registry_and_Unraid.md CRAU-095 and section 2B list compose_service_missing in the canonical
      local-runtime reason-code base enum; canon names the code and gives it no meaning there. Mapped to
      blocked_state_required from the code''s name: the P0c worker''s choice, under DL-333 resolution 6 as the stream
      C lead applies it (DL-341 under_dl333_resolution_6); by its name the command waits for the named compose
      service. CRAU-093: compose validation failures (compose_invalid, compose_service_missing) render as reason-coded
      rows whose repair path is the editor handoff. Canon reads two ways here: blocked_state_required is not a family
      of the shared Docker/Kubernetes disabled-state taxonomy (UCC-053; this catalog''s section 2.5B taxonomy
      paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability), while
      Plans/Containers_Registry_and_Unraid.md section 2B gives runtime identity a local-runtime blocked/degraded
      classification and lists compose-up failure, unhealthy container, missing Docker context, cluster unreachable
      and rollout failure among local-runtime blockers. Kept as the best fit and asked of the CRAU owner (DL-341
      crau_owner_questions)'
  - owner_state: container_unhealthy
    maps_to: degraded
    sources:
    - 'Plans/Containers_Registry_and_Unraid.md CRAU-095 and section 2B list container_unhealthy in the canonical
      local-runtime reason-code base enum; canon names the code and gives it no meaning there. Mapped to degraded from
      the code''s name: the P0c worker''s choice, under DL-333 resolution 6 as the stream C lead applies it (DL-341
      under_dl333_resolution_6). Degraded is a family of the shared Docker/Kubernetes disabled-state taxonomy
      (UCC-053; this catalog''s section 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized,
      Unreachable, Degraded, Partial capability); section 2B lists unhealthy container among local-runtime blockers
      under its blocked/degraded classification'
  - owner_state: dedup_hold_pending
    maps_to: not_configured
    sources:
    - 'Plans/Decision_Log.md DL-444 and DL-445: the duplicate sweep''s automatic jobs and panel buttons stay unavailable
      until the answer is applied and all remaining definition, review and recording approvals pass. Mapped as
      maintenance_cutoffs_pending is (DL-403); a stream C lead proposal recorded in DL-341, not a coordinator resolution'
  - owner_state: dependency_conflict
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: dependency_order_conflict
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: dirty_worktree
    maps_to: blocked_state_required
    sources:
    - Plans/GitHub_Integration.md#GI-041; GitHub_Integration.md Worktree Topology Commands
  - owner_state: duplicate_title
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: evidence_missing
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: image_missing
    maps_to: blocked_state_required
    sources:
    - 'Plans/Containers_Registry_and_Unraid.md CRAU-095 and section 2B list image_missing in the canonical
      local-runtime reason-code base enum; canon names the code and gives it no meaning there. Mapped to
      blocked_state_required from the code''s name: the P0c worker''s choice, under DL-333 resolution 6 as the stream
      C lead applies it (DL-341 under_dl333_resolution_6); by its name the command waits for an image that is built or
      pulled. Canon reads two ways here: blocked_state_required is not a family of the shared Docker/Kubernetes
      disabled-state taxonomy (UCC-053; this catalog''s section 2.5B taxonomy paragraph: Unsupported, Not configured,
      Unauthorized, Unreachable, Degraded, Partial capability), while Plans/Containers_Registry_and_Unraid.md section
      2B gives runtime identity a local-runtime blocked/degraded classification and lists compose-up failure,
      unhealthy container, missing Docker context, cluster unreachable and rollout failure among local-runtime
      blockers. Kept as the best fit and asked of the CRAU owner (DL-341 crau_owner_questions)'
  - owner_state: k8s_context_missing
    maps_to: not_configured
    sources:
    - 'Plans/Containers_Registry_and_Unraid.md CRAU-095 and section 2B list k8s_context_missing in the canonical
      local-runtime reason-code base enum; canon names the code and gives it no meaning there. Mapped to
      not_configured from the code''s name: the P0c worker''s choice, under DL-333 resolution 6 as the stream C lead
      applies it (DL-341 under_dl333_resolution_6). Not configured is a family of the shared Docker/Kubernetes
      disabled-state taxonomy (UCC-053; this catalog''s section 2.5B taxonomy paragraph: Unsupported, Not configured,
      Unauthorized, Unreachable, Degraded, Partial capability)'
  - owner_state: k8s_context_unreachable
    maps_to: unreachable
    sources:
    - 'Plans/Containers_Registry_and_Unraid.md CRAU-095 and section 2B list k8s_context_unreachable in the canonical
      local-runtime reason-code base enum; canon names the code and gives it no meaning there. Mapped to unreachable
      from the code''s name: the P0c worker''s choice, under DL-333 resolution 6 as the stream C lead applies it
      (DL-341 under_dl333_resolution_6). Unreachable is a family of the shared Docker/Kubernetes disabled-state
      taxonomy (UCC-053; this catalog''s section 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized,
      Unreachable, Degraded, Partial capability); section 2B lists cluster unreachable among local-runtime blockers'
  - owner_state: k8s_namespace_missing
    maps_to: not_configured
    sources:
    - 'Plans/Containers_Registry_and_Unraid.md CRAU-095 and section 2B list k8s_namespace_missing in the canonical
      local-runtime reason-code base enum; canon names the code and gives it no meaning there. Mapped to
      not_configured from the code''s name: the P0c worker''s choice, under DL-333 resolution 6 as the stream C lead
      applies it (DL-341 under_dl333_resolution_6). Not configured is a family of the shared Docker/Kubernetes
      disabled-state taxonomy (UCC-053; this catalog''s section 2.5B taxonomy paragraph: Unsupported, Not configured,
      Unauthorized, Unreachable, Degraded, Partial capability)'
  - owner_state: k8s_rollout_blocked
    maps_to: blocked_state_required
    sources:
    - 'Plans/Containers_Registry_and_Unraid.md CRAU-095 and section 2B list k8s_rollout_blocked in the canonical
      local-runtime reason-code base enum; canon names the code and gives it no meaning there. Mapped to
      blocked_state_required from the code''s name: the P0c worker''s choice, under DL-333 resolution 6 as the stream
      C lead applies it (DL-341 under_dl333_resolution_6); by its name the command waits for the rollout to progress.
      Canon reads two ways here: blocked_state_required is not a family of the shared Docker/Kubernetes disabled-state
      taxonomy (UCC-053; this catalog''s section 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized,
      Unreachable, Degraded, Partial capability), while Plans/Containers_Registry_and_Unraid.md section 2B gives
      runtime identity a local-runtime blocked/degraded classification and lists compose-up failure, unhealthy
      container, missing Docker context, cluster unreachable and rollout failure among local-runtime blockers. Kept as
      the best fit and asked of the CRAU owner (DL-341 crau_owner_questions)'
  - owner_state: ledger_sync_blocked
    maps_to: degraded
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: maintenance_cutoffs_pending
    maps_to: not_configured
    sources:
    - 'Plans/Decision_Log.md DL-403: memory maintenance waits for approved cutoffs, and the two maintenance buttons
      show as unavailable with the reason until they exist; DL-341 coordinator resolution 3'
    - 'Plans/Decision_Log.md DL-446 and DL-447: the cutoffs now exist (monthly summary: 90 idle days and score below
      0.10; prune archive: 180 idle days and score below 0.05), and what still holds the two maintenance commands is
      each card''s "Automatic jobs and panel buttons stay unavailable until your answer is applied and all remaining
      definition, review and recording approvals pass". The owner state names that hold until it lifts; source added
      by the stream C lead''s P0d task (DL-341 round_3_changes)'
  - owner_state: missing_approver
    maps_to: permission_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: missing_claims
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: missing_impact_evidence
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: missing_project_context
    maps_to: not_configured
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: missing_remote
    maps_to: not_configured
    sources:
    - Plans/GitHub_Integration.md#GI-041; GitHub_Integration.md Worktree Topology Commands
  - owner_state: missing_resource_limit_profile
    maps_to: not_configured
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: missing_resume_ref
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: missing_source_lineage
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: mutation_already_active
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: no_invalidated_refs
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: operation_in_progress
    maps_to: blocked_state_required
    sources:
    - Plans/GitHub_Integration.md#GI-041; GitHub_Integration.md Worktree Topology Commands
  - owner_state: pack_missing
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: parser_sandbox_unavailable
    maps_to: degraded
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: permission_denied
    maps_to: permission_required
    sources:
    - Plans/GitHub_Integration.md#GI-041; GitHub_Integration.md Worktree Topology Commands; Plans/prd_planning_runtime_contracts.json
      ui_command_contracts disabled_reason_codes
  - owner_state: projection_stale
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: protected_branch
    maps_to: blocked_state_required
    sources:
    - Plans/GitHub_Integration.md#GI-041; GitHub_Integration.md Worktree Topology Commands
  - owner_state: required_topic
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: runtime_context_missing
    maps_to: not_configured
    sources:
    - 'Plans/Containers_Registry_and_Unraid.md CRAU-095 and section 2B list runtime_context_missing in the canonical
      local-runtime reason-code base enum; canon names the code and gives it no meaning there. Mapped to
      not_configured from the code''s name: the P0c worker''s choice, under DL-333 resolution 6 as the stream C lead
      applies it (DL-341 under_dl333_resolution_6). Not configured is a family of the shared Docker/Kubernetes
      disabled-state taxonomy (UCC-053; this catalog''s section 2.5B taxonomy paragraph: Unsupported, Not configured,
      Unauthorized, Unreachable, Degraded, Partial capability); CRAU-099 carries a typed daemon diagnosis inside this
      code''s payload; section 2B lists missing Docker context among local-runtime blockers'
  - owner_state: runtime_context_unreachable
    maps_to: unreachable
    sources:
    - 'Plans/Containers_Registry_and_Unraid.md CRAU-095 and section 2B list runtime_context_unreachable in the
      canonical local-runtime reason-code base enum; canon names the code and gives it no meaning there. Mapped to
      unreachable from the code''s name: the P0c worker''s choice, under DL-333 resolution 6 as the stream C lead
      applies it (DL-341 under_dl333_resolution_6). Unreachable is a family of the shared Docker/Kubernetes
      disabled-state taxonomy (UCC-053; this catalog''s section 2.5B taxonomy paragraph: Unsupported, Not configured,
      Unauthorized, Unreachable, Degraded, Partial capability); CRAU-099 carries a typed daemon diagnosis inside this
      code''s payload'
  - owner_state: safe_point_missing
    maps_to: blocked_state_required
    sources:
    - 'Plans/UI_Command_Catalog.md UCC-111 and the Orchestrator projection-action and safe-point retry commands table:
      cmd.orchestrator.safe_point_retry preserves the four pre-modal disabled reasons safe_point_missing,
      state_changed, permission_denied, and operation_in_progress, and normalizes to
      cmd.runtime.restore_safe_point_then_retry, which shares its admission decision; the safe-point/Chat-revert
      section lets Orchestrator availability additionally expose safe_point_missing | state_changed |
      operation_in_progress. Canon gives no closed code. Mapped to blocked_state_required (the command waits for a
      safe point to exist; its precondition is safe_point_available): the P0d worker''s choice, under DL-333
      resolution 6 as the stream C lead applies it (DL-341 under_dl333_resolution_6)'
  - owner_state: source_coverage_missing
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: source_limit_exceeded
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: source_quarantined
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stage_not_retryable
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_acceptance_index
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_anchor_unrelocated
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_approved_plan_pack
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_final_audit_closure
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_named_plan
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_pack
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_planning_run_revision
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_planunit_index
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_project_context
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_source_security_policy
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_testing_policy
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_topic_map_version
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_workspace
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: state_changed
    maps_to: stale_projection
    sources:
    - 'Plans/UI_Command_Catalog.md UCC-111 and the Orchestrator projection-action and safe-point retry commands table:
      cmd.orchestrator.safe_point_retry preserves the four pre-modal disabled reasons safe_point_missing,
      state_changed, permission_denied, and operation_in_progress, with the precondition state_current; the storage
      fallback divergence dispositions also close their disabled reasons to a list that includes state_changed, which
      the storage handler returns when a root-binding, hash or captured-generation component changed. Canon gives no
      closed code. Mapped to stale_projection (the state the projection showed is no longer current): the P0d
      worker''s choice, under DL-333 resolution 6 as the stream C lead applies it (DL-341 under_dl333_resolution_6)'
  - owner_state: topic_busy
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: topic_not_deferred_or_ready
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: topics_not_ready
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: untracked_files
    maps_to: blocked_state_required
    sources:
    - Plans/GitHub_Integration.md#GI-041; GitHub_Integration.md Worktree Topology Commands
  - owner_state: zero_incomplete_failed
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  identity_exemptions:
  - command_id: cmd.runtime.open_queue_analysis
    field: allowed_action_id
    decision: DL-333
    reason: 'Q5 resolution 7: runtime navigation opens a route by run identity (References navigation commands);
      it carries no blocked episode.'
  - command_id: cmd.runtime.open_queue_analysis
    field: blocked_sequence
    decision: DL-333
    reason: 'Q5 resolution 7: runtime navigation opens a route by run identity (References navigation commands);
      it carries no blocked episode.'
  - command_id: cmd.runtime.open_remediation_lineage
    field: allowed_action_id
    decision: DL-333
    reason: 'Q5 resolution 7: runtime navigation opens a route by run identity (References navigation commands);
      it carries no blocked episode.'
  - command_id: cmd.runtime.open_remediation_lineage
    field: blocked_sequence
    decision: DL-333
    reason: 'Q5 resolution 7: runtime navigation opens a route by run identity (References navigation commands);
      it carries no blocked episode.'
  - command_id: cmd.runtime.open_safe_point_history
    field: allowed_action_id
    decision: DL-333
    reason: 'Q5 resolution 7: runtime navigation opens a route by run identity (References navigation commands);
      it carries no blocked episode.'
  - command_id: cmd.runtime.open_safe_point_history
    field: blocked_sequence
    decision: DL-333
    reason: 'Q5 resolution 7: runtime navigation opens a route by run identity (References navigation commands);
      it carries no blocked episode.'
  - command_id: cmd.chat.new
    field: thread_id
    decision: DL-333
    reason: 'Q5 resolution 8: cmd.chat.new runs before a thread exists (thread_id is minted when the first user
      message commits); it carries draft identity (ChatNewRequestScopeV2).'
  - command_id: cmd.runtime.approve
    field: allowed_action_id
    decision: DL-341
    condition: required_when
    branch_field: approval_kind
    exempt_branch: chat_tool
    reason: 'DL-341 coordinator resolution 1: HITL-038 keeps one approval host with separate typed envelopes. The node
      branch keeps the overlay''s blocked-run identity (run_id, blocked_sequence, allowed_action_id), so allowed_action_id is
      required there; OrchestratorNodeApprovalRequestV1 itself carries run_id, node_id, blocked_sequence and an optional
      attempt_id, and no allowed_action_id or approval_kind. The chat-tool branch (RuntimeApproveV3ToolRequest, approval_kind
      chat_tool) binds run, request, tool and target, has no blocked episode and forbids allowed_action_id. Canon names
      only the chat_tool value of approval_kind; the node branch value is not canon and the definition marks it a gap.'
  - command_id: cmd.runtime.approve
    field: blocked_sequence
    decision: DL-341
    condition: required_when
    branch_field: approval_kind
    exempt_branch: chat_tool
    reason: 'DL-341 coordinator resolution 1: HITL-038 keeps one approval host with separate typed envelopes. The node
      branch keeps the overlay''s blocked-run identity (run_id, blocked_sequence, allowed_action_id), so blocked_sequence is
      required there; OrchestratorNodeApprovalRequestV1 itself carries run_id, node_id, blocked_sequence and an optional
      attempt_id, and no allowed_action_id or approval_kind. The chat-tool branch (RuntimeApproveV3ToolRequest, approval_kind
      chat_tool) binds run, request, tool and target, has no blocked episode and forbids blocked_sequence. Canon names
      only the chat_tool value of approval_kind; the node branch value is not canon and the definition marks it a gap.'
  - command_id: cmd.runtime.decline
    field: allowed_action_id
    decision: DL-341
    condition: required_when
    branch_field: approval_kind
    exempt_branch: chat_tool
    reason: 'DL-341 coordinator resolution 1: HITL-038 keeps one approval host with separate typed envelopes. The node
      branch keeps the overlay''s blocked-run identity (run_id, blocked_sequence, allowed_action_id), so allowed_action_id is
      required there; OrchestratorNodeApprovalRequestV1 itself carries run_id, node_id, blocked_sequence and an optional
      attempt_id, and no allowed_action_id or approval_kind. The chat-tool branch (RuntimeDeclineV3ToolRequest, approval_kind
      chat_tool) binds run, request, tool and target, has no blocked episode and forbids allowed_action_id. Canon names
      only the chat_tool value of approval_kind; the node branch value is not canon and the definition marks it a gap.'
  - command_id: cmd.runtime.decline
    field: blocked_sequence
    decision: DL-341
    condition: required_when
    branch_field: approval_kind
    exempt_branch: chat_tool
    reason: 'DL-341 coordinator resolution 1: HITL-038 keeps one approval host with separate typed envelopes. The node
      branch keeps the overlay''s blocked-run identity (run_id, blocked_sequence, allowed_action_id), so blocked_sequence is
      required there; OrchestratorNodeApprovalRequestV1 itself carries run_id, node_id, blocked_sequence and an optional
      attempt_id, and no allowed_action_id or approval_kind. The chat-tool branch (RuntimeDeclineV3ToolRequest, approval_kind
      chat_tool) binds run, request, tool and target, has no blocked episode and forbids blocked_sequence. Canon names
      only the chat_tool value of approval_kind; the node branch value is not canon and the definition marks it a gap.'
  identity_aliases:
  - row_group: UCC-077..UCC-083
    overlay_name: debug_session_id
    canon_name: investigation_id
    decision: DL-341
    evidence:
      doc: Plans/Contracts_V0.md
      quote: '| `debug.investigation.started` | `investigation_id`, `project_id`, `thread_id?`'
    note: 'DL-341 coordinator resolution 4: the debug investigation identity is investigation_id in Contracts_V0 section
      3.5 Debug investigation events (CV-123) and assistant-chat-design.md section 12.0A (ACD-096 keeps the canonical
      header names).'
  - row_group: UCC-084..UCC-088
    overlay_name: memory_item_id
    canon_name: gist_id
    decision: DL-341
    evidence:
      doc: Plans/UI_Command_Catalog.md
      quote: '| `cmd.chat.memory.verify` | `{ project_id, gist_id }` |'
    note: 'DL-341 coordinator resolution 4: the memory item identity is gist_id in the catalog memory rows and in
      Plans/assistant-memory-subsystem.md (MemoryGist).'
  contested: []
```
