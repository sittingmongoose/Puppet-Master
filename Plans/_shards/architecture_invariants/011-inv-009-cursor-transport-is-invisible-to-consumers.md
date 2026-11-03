# Shard 011: INV-009 -- Cursor transport is invisible to consumers

Source: `Plans/Architecture_Invariants.md`

Source lines: L114-L123

Source SHA256: `480fac0bed813d64ffbc35f54515ef098785f04fd1b0893cdf132bba61a93e2b`

---

## INV-009 -- Cursor transport is invisible to consumers


**Rule:** Cursor must support both `stream-json` and ACP transports under one Provider facade; consumers MUST NOT branch on transport type.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.providers, ContractName:Plans/CLI_Bridged_Providers.md

---

<a id="INV-010"></a>
