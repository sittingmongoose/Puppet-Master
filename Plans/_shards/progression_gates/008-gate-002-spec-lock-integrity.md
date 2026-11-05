# Shard 008: GATE-002 -- Spec Lock integrity

Source: `Plans/Progression_Gates.md`

Source lines: L236-L251

Source SHA256: `28b32843c89be43a1e730dae715652ef22f99c911144c83f89b42fd938ba22b9`

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
