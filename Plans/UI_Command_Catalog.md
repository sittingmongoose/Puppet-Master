# UI Command Catalog (Canonical)

<!--
PUPPET MASTER — UI COMMAND SSOT

ABSOLUTE NAMING RULE:
- Platform name is “Puppet Master” only.
- If older naming exists, refer to it only as “legacy naming” (do not quote it).
-->

## 0. Scope
This file is the SSOT list of stable UI command IDs.
Command IDs are referenced by plans and tests; implementations MUST treat these IDs as stable.

ContractRef: Primitive:UICommand, ContractName:Contracts_V0.md#UICommand

---

## 1. Naming rules
- IDs MUST be lowercase and dot-separated.
- Prefix MUST be `cmd.`.

ContractRef: Primitive:UICommand

---

## 2. Canonical command IDs

### 2.1 GitHub auth (GitHub HTTPS API only)
- `cmd.github.connect` — start GitHub OAuth device-code flow.
- `cmd.github.disconnect` — disconnect and delete token.

ContractRef: UICommand:cmd.github.connect, UICommand:cmd.github.disconnect

---

### 2.2 LSP (minimum required)
These IDs are required by `Plans/LSPSupport.md`.

- `cmd.lsp.goto_definition`
- `cmd.lsp.find_references`
- `cmd.lsp.rename_symbol`
- `cmd.lsp.format_document`
- `cmd.lsp.format_selection`
- `cmd.lsp.code_action`
- `cmd.lsp.goto_symbol`
- `cmd.lsp.open_problems`
- `cmd.lsp.restart_server`

ContractRef: Plans/LSPSupport.md#13

---

## References
- `Plans/Contracts_V0.md#UICommand`
- `Plans/GitHub_API_Auth_and_Flows.md`
- `Plans/LSPSupport.md`
