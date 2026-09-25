# Shard 039: Git Public Remote Adapter Central Registration - 2026-09-25

Source: `Plans/Commands_System.md`

Source lines: L6359-L6427

Source SHA256: `a79022bbc83c008fee0a83e0ac56200067306b372c4b8726e4d94d785d1edf74`

---

## Git Public Remote Adapter Central Registration - 2026-09-25

The existing registered public Git remote commands `cmd.git.fetch` and `cmd.git.push` keep their own command identity
and their existing sole planned handler targets `handlers::git::fetch` and `handlers::git::push`. The UI catalog
adjudicates both as newly registered commands (2026-07-27 Cozy Shelves reconciliation), not as alias-of a recorded
target, and this section records their exact typed contract instead of a blanket alias. They are therefore Git adapter
commands in the SCS-003 §3.1 sense and are not before-dispatch normalizations into
`cmd.source_control.remote.fetch` or `cmd.source_control.remote.publish`; the `cmd.source_control.select_worktree`
compatibility input and the `cmd.git.show_commit` alias remain the recorded examples of explicit normalization and no
such recording exists for these two routes. Both remain `handler_unavailable`, keep `expected_event_types=[]`, and
receive no peer handler, event, wiring row or availability change.

| Command ID | Canonical owner | Sole future handler | Exact request -> result | Current evidence boundary |
|---|---|---|---|---|
| `cmd.git.fetch` | `Plans/Source_Control_System.md#SCS-025` | `handlers::git::fetch` | `Plans/git_remote_selected.schema.json#/$defs/request` -> `Plans/git_remote_selected.schema.json#/$defs/result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.git.push` | `Plans/Source_Control_System.md#SCS-025` | `handlers::git::push` | `Plans/git_remote_selected.schema.json#/$defs/request` -> `Plans/git_remote_selected.schema.json#/$defs/result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |

The authentic original and the nullable error projection for both routes are
`pm.sir.git_remote_dispatch_binding.v1` and `pm.sir.git_remote_error_projection.v1` in
`Plans/sir_git_remote_dispatch.schema.json` under SIR-042. Selected operands, independently generated target/preview,
the existing ordinary-Git publication preview/observation values under the existing `RemoteOperationTarget.preview_ref`,
the disjoint fetch observations and the unchanged `pm.source_control.operation_receipt.v1` carry truthful partial and
unknown effects. No refspec, force, lease or expected head is inferred, replay never re-pushes, and static values prove
no dispatcher, issuer, permission, lease, effect, receipt or physical custody.

### CS-081 - Git Public Remote Adapter Registration

```yaml
plan_unit_id: CS-081
unit_type: command_registry
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The existing public Git remote commands cmd.git.fetch and cmd.git.push receive concrete central records over their
  existing Git adapter identities, their existing sole planned handlers handlers::git::fetch and handlers::git::push,
  and the closed selected companion Plans/git_remote_selected.schema.json with the authentic SIR original/error binding
  in Plans/sir_git_remote_dispatch.schema.json under SCS-025 and SIR-042. Both remain handler_unavailable with
  expected_event_types=[], are not aliases of or normalizations into the neutral Source Control routes, mint no peer
  handler, event, wiring or availability row, and claim no native or physical custody evidence from static values.
gui_related: true
gui_classification_reason: The Source Control remote surface, palette/API and disabled reasons expose these two commands.
depends_on: [SCS-025, SIR-042]
unblocks: []
acceptance_criteria:
  - Each exact command appears once in this table with its owner, typed request/result and one sole future Git handler.
  - Both keep handler_unavailable, expected_event_types=[] and their existing production-intent and Touch Closure rows; no compatibility spelling receives a peer row or handler.
  - The neutral nineteen-command scope and the historical v1 neutral request/result binding remain unchanged; the neutral remote.fetch/remote.publish routes keep their own enrolled selected-operands binding.
  - >-
    No seventh neutral route, duplicate publication, inferred refspec/default force, second publication-preview owner
    or new effect policy is introduced, and the Git and Jujutsu publication mappings are never relabelled.
validation_surfaces: [Plans/git_remote_selected.schema.json, Plans/sir_git_remote_dispatch.schema.json, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json, python3 scripts/pm-new-contracts-verify.py]
risk_class: command_route_authority_or_false_git_remote_closure
reasoning_tier: high
context_scope: git_public_remote_adapter_registration
implementation_surfaces: [Plans/Commands_System.md, Plans/Source_Control_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json]
node_compile_hint: {mode: static_git_remote_adapter_registration_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Source_Control_System.md#SCS-003
  - Plans/Source_Control_System.md#SCS-025
  - Plans/Shared_Integration_Runtime.md#SIR-042
  - Plans/UI_Command_Catalog.md#UCC-127
preserved_exact_tokens: [cmd.git.fetch, cmd.git.push, handlers::git::fetch, handlers::git::push, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - Do not register a peer alias, normalizing wrapper, second handler, EventRecord, store or availability change for either command.
  - Do not widen the nineteen neutral command scope or reinterpret the historical v1 neutral request/result binding.
  - Do not claim native dispatcher, handler, permission, lease, effect, receipt or runtime evidence from this registration.
```

ContractRef: ContractName:Plans/Source_Control_System.md#SCS-025, ContractName:Plans/Shared_Integration_Runtime.md#SIR-042, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/touch_closure.json
