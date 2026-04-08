# MCP Integration

This document is the single SSOT for PM MCP configuration, naming, availability, credential binding, and invalidation.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md

## 1. Canonical naming

MCP tools use the underscore-only form `{server_slug}_{tool_name}`.

Rules:
- slash-separated aliases are not canonical
- wildcard rules match the underscore form
- consumer docs refer back to this document for naming, auth-state, and availability vocabulary instead of restating their own variants

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md

## 2. Requested versus effective availability

MCP state is disclosed in both requested and effective form.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/newtools.md

Requested fields:
- requested server enablement
- requested tool access
- requested client registration binding when a server requires it

Effective auth-state enum:
- `authenticated`
- `expired`
- `not_authenticated`

Effective connection-state enum:
- `connected`
- `disabled`
- `needs_auth`
- `needs_client_registration`
- `failed`

Mapping and alignment rules:
- provider-style `LoggedIn` maps to MCP `authenticated`
- provider-style `LoggedOut` maps to MCP `not_authenticated`
- provider-style `AuthExpired` maps to MCP `expired`
- provider-style `AuthFailed` maps to MCP effective `failed`
- `needs_auth` is the effective state when the server is requested-on but auth is missing or expired
- `needs_client_registration` is the effective state when auth is present but the client registration handshake is incomplete
## 3. Credential binding and invalidation

Credential state is part of the effective MCP contract rather than an implementation footnote.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md

Rules:
- server credentials bind to the server identity that used them
- invalid, rotated, or revoked credentials move the auth state to `expired` or `not_authenticated` and the effective state to `needs_auth` until revalidation succeeds
- client-registration loss moves the effective state to `needs_client_registration` even when stored credentials remain present
- repeated connection or handshake failures move the effective state to `failed` and preserve the last failure detail for disclosure
- consumer docs cross-reference this owner contract rather than publishing their own credential or invalidation vocabulary
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

Effective tool availability remains independent of raw server connection state.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FinalGUISpec.md

Rules:
- a connected server may still have individual tools disabled
- a requested-on server may still surface `needs_auth`, `needs_client_registration`, or `failed`
- GUI surfaces show requested/effective state, auth state, debug entry points, and underscore-only tool naming without becoming a second owner document
