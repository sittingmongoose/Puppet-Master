# MCP Integration

This document is the single SSOT for PM MCP configuration, naming, availability, credential binding, and invalidation.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md

## 1. Canonical naming
This section defines the canonical contract for this surface.

Core rules:
- canonical naming uses underscore form `{server_slug}_{tool_name}`
- Credential lifecycle still surfaces `LoggedIn | LoggedOut | AuthExpired | AuthFailed`, but that lifecycle vocabulary does not redefine the naming format.

Fields:
- {server_slug}_{tool_name}
- LoggedIn | LoggedOut | AuthExpired | AuthFailed

Labels and values:
- canonical naming
## 2. Requested versus effective availability
This section defines the canonical contract for this surface.

Core rules:
- requested and effective MCP availability remain distinct disclosure surfaces
- Requested availability uses `authenticated | expired | not_authenticated`.
- Effective availability uses `connected | disabled | needs_auth | needs_client_registration | failed`.

Fields:
- authenticated | expired | not_authenticated
- connected | disabled | needs_auth | needs_client_registration | failed

Labels and values:
- requested availability
- effective availability
## 3. Credential binding and invalidation
This section defines the canonical contract for this surface.

Core rules:
- credential binding or invalidation behavior remains MCP-owned canon
- Auth lifecycle outcomes surface as `LoggedIn | LoggedOut | AuthExpired | AuthFailed` for bound, missing, expired, or failed credentials.

Labels and values:
- credential binding

Rules:
- LoggedIn | LoggedOut | AuthExpired | AuthFailed
## 4. Cross-surface responsibilities

- `Plans/Tools.md` consumes MCP naming and tool-registry behavior.
- `Plans/storage-plan.md` consumes requested/effective availability and audit projection fields.
- `Plans/Permissions_System.md` consumes permission-key behavior, not a competing auth-state taxonomy.
- `Plans/newtools.md` and GUI summary surfaces reference this document as the live SSOT for MCP availability and credential vocabulary.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Models_System.md

## 5. Server config schema

MCP server config is implementation-facing canon, not a GUI-only convenience shape.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

Canonical config fields include:
- `server_id`
- `enabled`
- `timeout_ms`
- local launch fields (`command`, `args[]`, `env?`, `working_directory?`)
- remote launch fields (`host_id`, `remote_command`, `remote_args[]`, `remote_env?`)
- auth binding fields, including OAuth-disabled / auth-state semantics
- per-tool enable/disable entries independent of connection state

## 6. Supported flows

Supported owner-level flows are exactly `auth`, `list/status`, `logout`, and `debug`.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/newtools.md

Flow rules:
- `auth` resolves missing or expired auth without redefining tool permissions
- `list/status` surfaces requested/effective availability plus last-failure disclosure
- `logout` revokes the effective auth binding without deleting the server definition
- `debug` surfaces connection, handshake, and tool-registration diagnostics without minting a second status vocabulary

## 7. Effective tool availability and GUI surfacing
This section defines the canonical contract for this surface.

Core rules:
- The GUI-facing MCP owner contract preserves the auth-state and effective-availability enums used by downstream GUI consumers.

Fields:
- authenticated | expired | not_authenticated
- connected | disabled | needs_auth | needs_client_registration | failed

Labels and values:
- effective tool availability
- GUI surfacing

Rules:
- GUI summary surfaces reference the MCP SSOT instead of re-owning connection-state vocabulary
- Plans/FinalGUISpec.md#7.4.4 Settings (Unified) panel specification
- Plans/newtools.md#8.2 GUI/settings alignment
