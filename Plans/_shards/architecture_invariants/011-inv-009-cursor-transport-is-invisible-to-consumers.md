# Shard 011: INV-009 -- Cursor transport is invisible to consumers

Source: `Plans/Architecture_Invariants.md`

Source lines: L114-L123

Source SHA256: `d48461a5189f0540f72edec82e53ffffd9a421fcdd39f7ec884aa1a81e22e254`

---

## INV-009 -- Cursor transport is invisible to consumers


**Rule:** Cursor must support both `stream-json` and ACP transports under one Provider facade; consumers MUST NOT branch on transport type.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.providers, ContractName:Plans/CLI_Bridged_Providers.md

---

<a id="INV-010"></a>
