# Shard 011: INV-009 -- Cursor transport is invisible to consumers

Source: `Plans/Architecture_Invariants.md`

Source lines: L114-L123

Source SHA256: `6d940af76f0d50c6f92e8692ebc817938edcf6015f12a2072bc063517d7020f1`

---

## INV-009 -- Cursor transport is invisible to consumers


**Rule:** Cursor must support both `stream-json` and ACP transports under one Provider facade; consumers MUST NOT branch on transport type.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.providers, ContractName:Plans/CLI_Bridged_Providers.md

---

<a id="INV-010"></a>
