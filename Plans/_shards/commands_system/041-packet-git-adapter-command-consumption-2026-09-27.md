# Shard 041: Packet Git adapter command consumption — 2026-09-27

Source: `Plans/Commands_System.md`

Source lines: L7451-L7552

Source SHA256: `c0b219b0450e1afc7d8f24fc7ce7db1002b0d81ee56d18e3fa7c0b1a802b4ce2`

---

## Packet Git adapter command consumption — 2026-09-27

These seven Source Control and Git adapter primaries consume one closed request/result family from `Plans/git_adapter_command_contracts.schema.json`; this addendum does not change the nineteen backend-neutral Source Control primaries or their request schema. The existing stash/create and branch/create catalog IDs acquire explicit typed effect contracts. Every row is a sole future target with `handler_unavailable`, `expected_event_types=[]`, an owner-typed result/receipt and exact caller return. The central UICommand response cannot substitute for owner effect truth.

| Primary | Semantic owner | Sole future handler | Request → result |
|---|---|---|---|
| `cmd.git.stage` | `Plans/Source_Control_System.md#SCS-024` | `handlers::git::stage_files` | `Plans/git_adapter_command_contracts.schema.json#/$defs/git_command_request` → `Plans/git_adapter_command_contracts.schema.json#/$defs/git_command_result` |
| `cmd.git.unstage` | `Plans/Source_Control_System.md#SCS-024` | `handlers::git::unstage_files` | `Plans/git_adapter_command_contracts.schema.json#/$defs/git_command_request` → `Plans/git_adapter_command_contracts.schema.json#/$defs/git_command_result` |
| `cmd.source_control.remote.update` | `Plans/Source_Control_System.md#SCS-024` | `handlers::source_control::remote_update` | `Plans/git_adapter_command_contracts.schema.json#/$defs/git_command_request` → `Plans/git_adapter_command_contracts.schema.json#/$defs/git_command_result` |
| `cmd.source_control.stash.create` | `Plans/Source_Control_System.md#SCS-024` | `handlers::source_control::stash_create` | `Plans/git_adapter_command_contracts.schema.json#/$defs/git_command_request` → `Plans/git_adapter_command_contracts.schema.json#/$defs/git_command_result` |
| `cmd.source_control.stash.apply` | `Plans/Source_Control_System.md#SCS-024` | `handlers::source_control::stash_apply` | `Plans/git_adapter_command_contracts.schema.json#/$defs/git_command_request` → `Plans/git_adapter_command_contracts.schema.json#/$defs/git_command_result` |
| `cmd.source_control.branch.create` | `Plans/Source_Control_System.md#SCS-024` | `handlers::source_control::branch_create` | `Plans/git_adapter_command_contracts.schema.json#/$defs/git_command_request` → `Plans/git_adapter_command_contracts.schema.json#/$defs/git_command_result` |
| `cmd.source_control.branch.delete` | `Plans/Source_Control_System.md#SCS-024` | `handlers::source_control::branch_delete` | `Plans/git_adapter_command_contracts.schema.json#/$defs/git_command_request` → `Plans/git_adapter_command_contracts.schema.json#/$defs/git_command_result` |

The Git adapter revalidates the selected repository/workspace, expected Git HEAD and index/configuration, writer lease, FileSafe and permission before effects. Whole-file stage/unstage accepts explicit safe `paths[]` including untracked and binary files; hunk commands remain separate. Stash apply and branch delete resolve current target-bound previews before mutation; branch delete also requires dangerous-action authority. A remote configuration update changes no hosted ref and cannot stand in for fetch or publish. Replayed idempotency observes the prior result; an uncertain local effect is reconciled against the exact repository object/configuration before retry. No row here admits an EventRecord or native handler.

### CS-083 - Git Adapter Command Contracts And Sole Targets

```yaml
plan_unit_id: CS-083
unit_type: integration_contract
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: 'Commands System consumes seven Git-only Source Control primaries through the SCS-024 typed
  adapter request/result and one sole future handler each. Whole-file stage/unstage, local remote update, stash
  create/apply and branch create/delete retain exact currentness, permission, FileSafe, preview, confirmation,
  idempotency and target guards. Existing canonical stash and branch-create identities remain. Each row stays
  handler_unavailable with expected_event_types=[] until native proof.


  Current projects-refresh contract: One reviewed Project setup binding serves onboarding/New Project/conversion-to-new;
  no generic create or clone wrapper. Preserve all nine historical registration kinds, add owner-verified mounted_existing,
  and native clone plus acquisition provenance for online_import/fork_contribute. Rename changes display name
  only; refresh remains nullable-Project registry read; remove remains list-only and delete_data remains strong
  Storage purge. Inspection is read-only evidence, not a linked origin. Source-location repoint and physical
  move remain distinct. Starters/My starters are file sets; Saved setups are detached own values/things/account
  choices. Preserve FO-22 and live DL-273 service admission, Git/JJ capabilities, exact remote-create/fork
  recovery and all receipt joins. Backups use first-policy absent-key CAS, Standard plus Advanced, archive
  pause and last-good protection. The exact consumer contract is UCC-215/WM-101 and Plans/projects_refresh_command_bindings.json.
  Historical schema/hash/replay resources and all unrelated PM7 service/FO-22/motion/auth/identity clauses
  remain as specified; unavailable handlers remain handler_unavailable.'
gui_related: true
gui_classification_reason: Commands back visible Source Control controls and their disabled, confirmation and
  return states.
depends_on:
- SCS-024
- UCC-167
unblocks:
- WM-060
acceptance_criteria:
- Each table primary has exactly one matching UCC-167 catalog and production-intent wiring row.
- Every request validates the owner schema branch and returns an owner result, including typed stale or denied
  outcomes.
- No hunk, Jujutsu or hosted transport route substitutes for a whole-file or local-configuration mutation.
- Static registration does not claim a native handler, EventRecord or runtime effect.
- Validate application versus actual Project-target cases, original exact Project replay, stale scope/preview/permission/Stop/return
  refusal and the exact command/local/tool binding from UCC-215; no native/event/governance proof follows from
  static closure.
validation_surfaces:
- Plans/git_adapter_command_contracts.schema.json
- Plans/git_adapter_command_contract_fixtures.json
- Plans/Wiring_Matrix.production.json
- scripts/pm_git_adapter_commands.py
risk_class: cross_target_git_mutation_or_false_effect
reasoning_tier: high
context_scope: packet_git_adapter_central_commands
implementation_surfaces:
- Plans/Commands_System.md
- future UICommand dispatcher
node_compile_hint:
  mode: static_command_consumer_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_report:packet-sweep-20260927/cross-contracts/report.md
- source_report:packet-sweep-20260927/egolite/command_followup.json
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
- Do not register historical candidate Git-prefixed stash or branch aliases as peer primaries.
- Do not dispatch a mutation from stale projection, focus, inferred remote or raw path text.
- Do not treat an acceptance or command response as terminal Git effect truth.
- Do not replace a required real target with focus, a synthetic Project, an empty identity or borrowed app/source
  authority.
owner_hints:
- Plans/Commands_System.md
```

ContractRef: ContractName:Plans/Source_Control_System.md#SCS-024, ContractName:Plans/UI_Command_Catalog.md#UCC-167, ContractName:Plans/Wiring_Matrix.md#WM-060

### CS-084 - Forge Review Edit Contract

`cmd.forge.review.edit` has sole planned handler `handlers::forge::review_edit` under FGI-022. The typed Forge request, result, error and MutationReceipt bind provider, account, repository binding, review ID, expected immutable revision and nonempty title/description patch. Authorization, direct currentness revalidation, target confirmation, idempotency and effect reconciliation gate the remote mutation. It starts `handler_unavailable` and has `expected_event_types=[]`. Runner list and registration preview remain Forge-owned typed read producers rather than extra central command aliases.
