# Shard 011: INV-009 -- Cursor transport is invisible to consumers

Source: `Plans/Architecture_Invariants.md`

Source lines: L147-L156

Source SHA256: `fab349fb07405fa12bb0ee2bf0c49308e8b0bb9581290de3ba5db02abe5c0b1e`

---

## INV-009 -- Cursor transport is invisible to consumers


**Rule:** Cursor must support both `stream-json` and ACP transports under one Provider facade; consumers MUST NOT branch on transport type.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.providers, ContractName:Plans/CLI_Bridged_Providers.md

---

<a id="INV-010"></a>
