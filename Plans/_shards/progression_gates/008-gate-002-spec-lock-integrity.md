# Shard 008: GATE-002 -- Spec Lock integrity

Source: `Plans/Progression_Gates.md`

Source lines: L236-L251

Source SHA256: `8f884b510c35f1f7bceb11f6f55804f46405d0a8b5c37870a464e2adf399fb33`

---

## GATE-002 -- Spec Lock integrity


**Pass condition:**
- `Plans/Spec_Lock.json` pins schema versions and locked decisions, and
- every `canonical_ssot_hashes.files[*].sha256` matches the current file contents for the listed SSOT files.

Required evidence:
- Evidence bundle entry that includes a Spec Lock hash verification report (must be empty / no mismatches).  
  ContractRef: SchemaID:evidence.schema.json

ContractRef: SchemaID:Spec_Lock.json, PolicyRule:Decision_Policy.md#spec-lock-update-protocol

---

<a id="GATE-003"></a>
