# Shard 047: Git adapter command mapping closure — 2026-09-27

Source: `Plans/UI_Command_Catalog.md`

Source lines: L13489-L13619

Source SHA256: `8270343f398ab6372b0ff16dbe15e8c567b637b99baf8e172aedf1dece604ab2`

---

## Git adapter command mapping closure — 2026-09-27

The Source Control owner keeps the nineteen backend-neutral primaries closed. The following Git-only commands use `Plans/git_adapter_command_contracts.schema.json` and preserve exact repository, workspace, Git revision, permission, FileSafe, writer-lease, currentness, preview, confirmation, and return context. A disabled command exposes the owner reason; no visible row establishes a native handler. Historical Git-prefixed stash and branch candidates resolve through the existing Source Control primaries shown here.

| Primary | Label | Availability and refusal | Confirmation | Sole future handler |
|---|---|---|---|---|
| `cmd.git.stage` | Stage Files | Git workspace and explicit whole-file `paths[]`; accepts untracked and binary files under FileSafe; stale index, path escape, conflicted/unsafe selection, permission or handler absence disables | none | `handlers::git::stage_files` |
| `cmd.git.unstage` | Unstage Files | Git workspace and explicit indexed whole-file `paths[]`; stale index, path escape, unsafe selection, permission or handler absence disables | none | `handlers::git::unstage_files` |
| `cmd.source_control.remote.update` | Update Remote | Exact selected remote plus separately validated fetch and push URLs; stale configuration, unsafe URL, permission or handler absence disables | none | `handlers::source_control::remote_update` |
| `cmd.source_control.stash.create` | Create Stash | Git dirty tree with exact `include_untracked` and message; stale tree, FileSafe denial, permission or handler absence disables | none | `handlers::source_control::stash_create` |
| `cmd.source_control.stash.apply` | Apply Stash | Exact stash object, current preview and workspace state; conflict/stale preview, FileSafe denial, permission or handler absence disables | current preview | `handlers::source_control::stash_apply` |
| `cmd.source_control.branch.create` | Create Branch | Exact validated branch ref and immutable base commit; name collision, stale base, permission or handler absence disables | none | `handlers::source_control::branch_create` |
| `cmd.source_control.branch.delete` | Delete Branch | Exact branch/head and current destructive preview; protected, checked-out or attached branch, stale head, missing dangerous-action authority or handler absence disables | explicit dangerous action | `handlers::source_control::branch_delete` |

`cmd.git.stage_hunks` and `cmd.git.unstage_hunks` keep their hunk-scoped payloads; neither is an alias for a whole-file action. Remote update changes local remote configuration only and does not fetch, publish or grant a credential lease. A branch-create request does not automatically switch the workspace. Every mutation receives an owner-typed result/receipt or typed refusal, with `expected_event_types=[]` pending separate Event Authority admission.

### UCC-167 - Git Adapter Command Mapping And Availability

```yaml
plan_unit_id: UCC-167
unit_type: command_binding
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Seven Git-only primaries resolve whole-file staging, local remote configuration, stash create/apply,
  and branch create/delete through the Source Control owner contract. The existing stash and branch-create
  command identities are retained; stage, unstage, remote update and branch delete are distinct primaries.
  Availability is exact Git repository/workspace/currentness/capability/permission state, with FileSafe,
  preview and dangerous-action gates for the relevant effects. Every route remains handler_unavailable
  until native evidence and emits expected_event_types=[].
gui_related: true
gui_classification_reason: Registers visible Source Control actions and exact disabled and confirmation states.
depends_on: [SCS-024, UCC-127]
unblocks: [CS-083, WM-060]
acceptance_criteria:
  - The seven table identities each have one owner, sole future handler, typed request/result and production-intent wiring row.
  - Whole-file paths include untracked and binary files and never normalize to hunk commands.
  - Existing stash and branch-create primaries retain their command IDs; historical Git-prefixed spellings are not independently registered.
  - Remote update has no transport side effect and branch deletion fails closed on stale or protected targets.
validation_surfaces: [Plans/git_adapter_command_contracts.schema.json, Plans/git_adapter_command_contract_fixtures.json, Plans/Wiring_Matrix.production.json, scripts/pm_git_adapter_commands.py]
risk_class: wrong_git_target_or_phantom_handler
reasoning_tier: high
context_scope: packet_git_command_mapping
implementation_surfaces: [Plans/UI_Command_Catalog.md, future Git adapter and Source Control panel]
node_compile_hint: {mode: static_command_catalog_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_report:packet-sweep-20260927/cross-contracts/report.md, source_report:packet-sweep-20260927/egolite/command_followup.json]
preserved_exact_tokens: [cmd.git.stage, cmd.git.unstage, cmd.source_control.remote.update, cmd.source_control.stash.create, cmd.source_control.stash.apply, cmd.source_control.branch.create, cmd.source_control.branch.delete, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - Do not route whole-file Git staging through hunk commands or through Jujutsu.
  - Do not treat a catalog row, future handler string or planning receipt as runtime proof.
  - Do not infer a repository, remote, branch, stash or selected path from UI focus alone.
```

ContractRef: ContractName:Plans/Source_Control_System.md#SCS-024, ContractName:Plans/Commands_System.md#CS-083, ContractName:Plans/Wiring_Matrix.md#WM-060

### UCC-168 - Forge Review Edit And Runner Read Producers

`cmd.forge.review.edit` is the sole primary for a typed title/description patch of an exact provider review at an expected immutable revision. FGI-022 owns currentness, effective authority, remote_side_effect permission, target-bound confirmation and reconciliation guards. `cmd.forge.review.mark_ready` requires `draft=false`; the existing version.open/compare commands supply immutable review diff selection. Runner list and registration preview are FGI-022 owner-local read producers, with typed request/projection or preview/result records; they have no command-palette dispatch ID. Every Forge route remains `handler_unavailable` until native evidence exists.

### Chat busy-send steer command

`cmd.chat.queue.send_now` is the command identity for Send now on a queued composer message (ACD-219, DL-108). `cmd.chat.send` carries `delivery_mode` (`queue` or `steer`), resolved from `general.interaction.queue-behavior` when the composer's switch does not override it.

| Command ID | Label | Description | Preconditions | command_kind |
|------------|-------|-------------|----------------|--------------|
| `cmd.chat.queue.send_now` | Send Queued Message Now | Steers one queued, not-yet-dispatched composer message into the running turn at once, without stopping the answer; other queued messages keep their order. | `queued_message_exists` | `domain_action` |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md

### UCC-168 - Chat Busy Send Steer Command And Reused Chat Controls

```yaml
plan_unit_id: UCC-168
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.chat.queue.send_now steers one queued, not-yet-dispatched message into the running turn
  without stopping the answer and emits chat.message.submitted for that message with delivery_mode
  steer; it never advances the rest of the queue. cmd.chat.send gains delivery_mode (queue or
  steer), resolved from general.interaction.queue-behavior (default Queue, DL-108) unless the
  composer's switch overrides it; a queued send becomes an outbox entry that later dispatches
  through the same handler. The other chat controls of ACD-469 through ACD-475 reuse existing
  identities and add none: Stop is cmd.chat.stop; Edit on a queued entry is cmd.chat.queue.remove
  followed by a local composer restore; Remove is cmd.chat.queue.remove; the header sound mute is
  cmd.settings.transaction.apply on general.interaction.sound-effects; approving or declining a
  needs-you item is cmd.runtime.approve or cmd.runtime.decline; jump-to-latest, working card fold,
  expand, subject pin and follow-live are local view state (CDRY-013).
gui_related: true
gui_classification_reason: "Registers the Send now command and maps every other chat control to an existing identity."
split_recommended: false
depends_on: [ACD-219, ACD-471, DL-108, UCC-119]
unblocks: [F3-563]
acceptance_criteria:
  - "cmd.chat.queue.send_now has one handler and a production wiring entry."
  - "cmd.chat.send accepts delivery_mode queue or steer."
  - "No new command exists for Edit, the header mute, approvals or view-state controls."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: chat_command_catalog_gap
reasoning_tier: high
context_scope: chat_composer_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: chat_composer_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-108"
  - "Plans/assistant-chat-design.md#ACD-219"
preserved_exact_tokens:
  - "cmd.chat.queue.send_now"
  - "delivery_mode"
  - "cmd.chat.send"
  - "cmd.chat.queue.remove"
  - "cmd.runtime.approve"
  - "cmd.runtime.decline"
negative_constraints:
  - "Do not mint a separate edit, mute or steer command."
  - "Do not let cmd.chat.queue.send_now stop the running answer or advance the rest of the queue."
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-471, ContractName:Plans/Decision_Log.md#DL-108
