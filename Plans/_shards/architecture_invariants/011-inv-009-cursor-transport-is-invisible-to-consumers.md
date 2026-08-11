# Shard 011: INV-009 -- Cursor transport is invisible to consumers

Source: `Plans/Architecture_Invariants.md`

Source lines: L114-L123

Source SHA256: `a1488a98949bf363a0c763a51dae6dc4db5261708c7828eeca492e65f251c543`

---

## INV-009 -- Cursor transport is invisible to consumers


**Rule:** Cursor must support both `stream-json` and ACP transports under one Provider facade; consumers MUST NOT branch on transport type.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.providers, ContractName:Plans/CLI_Bridged_Providers.md

---

<a id="INV-010"></a>
