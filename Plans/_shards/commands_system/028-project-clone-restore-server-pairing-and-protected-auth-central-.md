# Shard 028: Project, clone, restore, Server, pairing, and protected-auth central registration addendum - 2026-09-01

Source: `Plans/Commands_System.md`

Source lines: L4979-L5064

Source SHA256: `4db908950fd355b040ad67c3e4730fd479bad8eb70cc34ed4b05c52e821d08b4`

---

## Project, clone, restore, Server, pairing, and protected-auth central registration addendum - 2026-09-01

The packet-owner contracts remain the sole semantic owners. This addendum centrally registers only the
ten owner commands that were missing from the command catalog boundary and strengthens the six existing
Project and Authentication registrations. A handler path below is a required dispatch target, not proof
that Rust code, a native dispatcher, persistence, or a production runtime exists. Until that evidence
exists, consumers must surface `handler_unavailable` or the exact owner-disabled reason.

| Command ID | Request -> result | Sole specified target | Boundary |
|---|---|---|---|
| `cmd.source_control.repository.clone` | `source_control_command_request` -> `source_control_command_result` | `handlers::source_control::repository_clone` | Ordinary Git only; never aliases Jujutsu clone. |
| `cmd.jujutsu.git.clone` | `command_request` -> `command_result` | `handlers::jujutsu::git_clone` | Jujutsu-native operation and snapshot fence. |
| `cmd.restore.preview` | `backup_restore_command_request` -> `backup_restore_command_result` | `handlers::backup_restore::preview_restore` | Validates and previews without activation. |
| `cmd.server.connect` | `command_payload` -> `command_result` | `handlers::server::connect` | One id carries `connect`, `reconnect`, and `resume`; no duplicate reconnect/resume commands. |
| `cmd.server.bootstrap.start` | `supplemental_command_payload` -> `supplemental_command_result` | `handlers::server::bootstrap_start` | Post-claim standalone/container bootstrap only. |
| `cmd.client.pair.start` | `supplemental_command_payload` -> `supplemental_command_result` | `handlers::client_pairing::start` | Starts one generation-fenced pairing run; grants no trust. |
| `cmd.client.pair.approve` | `supplemental_command_payload` -> `supplemental_command_result` | `handlers::client_pairing::approve` | Explicit current identity approval before trust issuance. |
| `cmd.client.pair.reject` | `supplemental_command_payload` -> `supplemental_command_result` | `handlers::client_pairing::reject` | Trusted approver's terminal refusal. |
| `cmd.client.pair.cancel` | `supplemental_command_payload` -> `supplemental_command_result` | `handlers::client_pairing::cancel` | Requesting Client's terminal abort; distinct from rejection. |
| `cmd.client.revoke` | `supplemental_command_payload` -> `supplemental_command_result` | `handlers::client_trust::revoke` | Revokes the whole Client trust record and every active session. |

`cmd.project.new_local`, `cmd.project.add_existing`, and `cmd.project.open` retain their existing IDs and
sole Project targets, but their central contracts now reference `project_action_request` and
`project_action_result`. They preserve the stable Project, home Server, Source Location, repository,
revision/generation/hash, receipt, and exact caller surface/route/focus/invocation/continuation context.
Closing or navigating away from a caller does not cancel owner work.

`cmd.authentication.start`, `cmd.authentication.cancel`, and `cmd.authentication.resume` retain the
Shared Integration Runtime `AuthenticationBroker` lifecycle. The exact authentication operation/revision,
origin Client/session lineage, protected-session reference, return target, continuation, timeout/cancel
disposition, and redacted return fence travel through the shared request and result. Under RAS-015 and
the September 9 approved SIR-032 reconciliation, hosted Tailscale uses
`server_owned_authorized_client_handoff`: a broker-verified current authorized Client/session and new
handoff generation may resume the same Server-owned operation after original-Client loss. The
`server_owned_handoff` is a non-secret reference binding, never a credential or a caller-selected bypass.
Other protected providers retain the initiating-active-Client-only fence. Remote Access adapters create
no Remote- or Browser-owned authentication lifecycle, and a replacement Client inherits no protected content.

No EventRecord family is admitted by this registration. Dispatch remains receipt/projection-only until
Event Authority admits a named family. `cmd.server.reconnect`, `cmd.server.resume`, `cmd.git.clone`,
`cmd.scm.clone`, `cmd.project.clone`, `cmd.project.jj_clone`, `cmd.client.pair.qr.import`, and
`cmd.server.peer_candidate.select` remain rejected primary spellings.

ContractRef: ContractName:Plans/Project_System.md, ContractName:Plans/Source_Control_System.md, ContractName:Plans/Jujutsu_Integration.md, ContractName:Plans/Backup_Restore_System.md, ContractName:Plans/Server_System.md, ContractName:Plans/Shared_Integration_Runtime.md

### CS-070 - Cross-owner command registration and exact-return fences

```yaml
plan_unit_id: CS-070
unit_type: command_contract
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The central command system registers the ten missing Project-adjacent clone, restore-preview, Server,
  pairing, and Client-trust command identities without stealing their owner semantics, and strengthens the
  three existing Project plus three existing Authentication rows with their exact owner schemas and
  caller/Client return fences. Each ID has one specified handler target and remains unavailable when that
  native handler is absent; a catalog or wiring string is never implementation evidence.
gui_related: true
gui_classification_reason: These commands back Product Onboarding, Settings, Doctor, Server, restore, SCM, and project controls and their accessible disabled states.
depends_on: [CS-069, PJCT-002, SCS-006, JJI-005, BRS-006, SRV-006, SIR-020]
unblocks: [UCC-148, WM-047]
acceptance_criteria:
  - Exactly the ten commands listed in this addendum receive new central registrations; the six strengthened commands retain their existing identities and do not duplicate rows.
  - Every request and result reference resolves to its packet-owner schema and every visible consumer has an exact return route and disabled reason.
  - Ordinary Git and Jujutsu clone remain distinct; reconnect/resume are modes of cmd.server.connect; QR and peer selection are typed inputs to cmd.client.pair.start.
  - Protected authentication uses the exact same operation/revision and owner-selected Client fence; RAS-015 hosted Tailscale permits a current authorized Client/session only through a newly authorized handoff and exact return context, while other protected providers remain initiating-active-Client-only. No protected content is exposed, inherited, captured, recorded, or persisted.
  - A specified target path, static schema, fixture, PMConcept7 simulation, or browser pass does not prove a native handler or production runtime.
  - No new EventRecord family or rejected alias is admitted.
validation_surfaces: [Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json, Plans/shared_runtime_command_contract_fixtures.json, python3 scripts/pm-touch-closure-verify.py]
risk_class: cross_owner_command_duplication_or_false_handler_claim
reasoning_tier: high
context_scope: packet_owner_central_command_closure
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json]
node_compile_hint: {mode: cross_owner_command_registration, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - scratchpad/pm-integration-20260831/authority-repairs/central-owner-merge/merged-central-owner-delta-manifest.json
  - approved Parallel Canon, Settings, and PMConcept7 Integration Plan
preserved_exact_tokens: [cmd.source_control.repository.clone, cmd.jujutsu.git.clone, cmd.restore.preview, cmd.server.connect, cmd.server.bootstrap.start, cmd.client.pair.start, cmd.client.pair.approve, cmd.client.pair.reject, cmd.client.pair.cancel, cmd.client.revoke, handler_unavailable]
negative_constraints:
  - Do not interpret a handler target string as executable or native-runtime evidence.
  - Do not create generic clone, Server reconnect/resume, QR-import, peer-selection, or owner-local authentication-lifecycle commands.
  - Do not let caller close cancel owner work or let protected authentication return to an unauthorized fallback Client; RAS-015 replacement requires the explicit SIR-032 handoff, not inherited browser content.
  - Do not invent an EventRecord family.
owner_hints: [Plans/Commands_System.md, Plans/Project_System.md, Plans/Server_System.md, Plans/Shared_Integration_Runtime.md]
```
