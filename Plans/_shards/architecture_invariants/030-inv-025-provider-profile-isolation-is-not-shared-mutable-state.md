# Shard 030: INV-025 -- Provider profile isolation is not shared mutable state

Source: `Plans/Architecture_Invariants.md`

Source lines: L394-L401

Source SHA256: `3f3e3b9f42434b65cdfcdfd03597ce25926979886fe66d28c06cd0f8d23a3cc3`

---

## INV-025 -- Provider profile isolation is not shared mutable state

**Rule:** CLI/provider profile mechanisms used for account separation MUST be treated as isolated runtime profiles unless an owner contract explicitly marks a PM-managed overlay as safely shareable.

- Cursor's `--user-data-dir` workaround is an isolated-profile mechanism, not shared mutable state; `user-data-dir` profile separation does not authorize sharing auth, cooldown, usage, session history, runtime cache, or telemetry state between accounts.
- PM-managed overlays such as instructions, projected PM skills, selected MCP/tool definitions, and selected plugins/extensions may be shared only when the provider/runtime contract explicitly allows safe projection and drift handling.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/BinaryLocator_Spec.md, ContractName:Plans/Permissions_System.md
