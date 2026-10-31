# Shard 013: INV-011 -- UI command dispatch only (Rule 1)

Source: `Plans/Architecture_Invariants.md`

Source lines: L135-L146

Source SHA256: `822393a6f0344b214af8956dad4c888e8996f4676b530cdab4e83b2fdb16dada`

---

## INV-011 -- UI command dispatch only (Rule 1)

Command ownership follows mutation domain, not menu location: `Add to Assistant Chat` dispatches `cmd.chat.add_file_reference { project_id, thread_id?, path, line_range? }` because it mutates chat `/context`; file-tree actions remain under `cmd.file` / `cmd.file.*`; `Open in Terminal` reveals through `cmd.terminal.open` and `Show Terminal` focuses through `cmd.terminal.show` rather than either action becoming a file command.


**Rule:** The UI layer MUST dispatch only typed `UICommand` envelopes to trigger non-trivial behavior. The UI MUST NOT call backend services, storage, domain logic, or provider integrations directly. All user-initiated interactions flow through the UI Command Dispatcher boundary.

ContractRef: Primitive:UICommand, ContractName:Plans/UI_Wiring_Rules.md#section-1, ContractName:Plans/Contracts_V0.md#7-uicommand, ContractName:Plans/UI_Command_Catalog.md

---

<a id="INV-012"></a>
