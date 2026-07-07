# Shard 014: GATE-008 -- Reserved tombstone

Source: `Plans/Progression_Gates.md`

Source lines: L320-L335

Source SHA256: `8f884b510c35f1f7bceb11f6f55804f46405d0a8b5c37870a464e2adf399fb33`

---

## GATE-008 -- Reserved tombstone

`GATE-008` is a reserved/tombstoned registry slot. It has no active pass/fail condition, no run-gates check, and no executable progression authority.

Registry obligations:
- The slot MUST remain visible in the canonical registry so numbered gates do not appear silently omitted.
- The number MUST NOT be reused for a new gate without a governance migration that records the prior tombstone and updates ContractRefs, generated shards, and affected PlanUnits.
- Consumers that previously inferred a hidden `GATE-008` from retired/source-lineage material MUST resolve to this tombstone or to the explicit current gate that owns their behavior.

**Script enforcement status:** Tombstoned/manual. Owner docs are `Plans/Progression_Gates.md`; source-lineage consumers include `Plans/Run_Modes.md` and retired `Plans/chain-wizard-flexibility.md` references where present.

ContractRef: Gate:GATE-008, ContractName:Plans/Run_Modes.md

---

<a id="GATE-009"></a>
