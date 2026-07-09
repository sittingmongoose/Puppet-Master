# Shard 013: INV-011 -- UI command dispatch only (Rule 1)

Source: `Plans/Architecture_Invariants.md`

Source lines: L135-L146

Source SHA256: `6d940af76f0d50c6f92e8692ebc817938edcf6015f12a2072bc063517d7020f1`

---

## INV-011 -- UI command dispatch only (Rule 1)

Command ownership follows mutation domain, not menu location: `Add to Assistant Chat` dispatches `cmd.chat.add_file_reference { project_id, thread_id?, path, line_range? }` because it mutates chat `/context`; file-tree actions remain under `cmd.file` / `cmd.file.*`; `Open in Terminal` reveals through `cmd.terminal.open` and `Show Terminal` focuses through `cmd.terminal.show` rather than either action becoming a file command.


**Rule:** The UI layer MUST dispatch only typed `UICommand` envelopes to trigger non-trivial behavior. The UI MUST NOT call backend services, storage, domain logic, or provider integrations directly. All user-initiated interactions flow through the UI Command Dispatcher boundary.

ContractRef: Primitive:UICommand, ContractName:Plans/UI_Wiring_Rules.md#section-1, ContractName:Plans/Contracts_V0.md#7-uicommand, ContractName:Plans/UI_Command_Catalog.md

---

<a id="INV-012"></a>
