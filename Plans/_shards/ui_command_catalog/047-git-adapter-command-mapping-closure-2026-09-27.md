# Shard 047: Git adapter command mapping closure — 2026-09-27

Source: `Plans/UI_Command_Catalog.md`

Source lines: L13382-L13439

Source SHA256: `9edd6a2872acb22c9bfce15cb5971bd12a50ff32676587054706478f940c7df3`

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
