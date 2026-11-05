# Shard 027: Field Name Verification Gate Update Addendum

Source: `Plans/Progression_Gates.md`

Source lines: L661-L673

Source SHA256: `28b32843c89be43a1e730dae715652ef22f99c911144c83f89b42fd938ba22b9`

---

## Field Name Verification Gate Update Addendum

### Gate rule clarification: canonical blocked-payload field name


The verification sweep rule that flags docs using `recovery_options[]` or `allowed_actions[]` as the canonical shared blocked-payload field now also flags any prescriptive usage (payload definition, schema, storage shape, or contract) of these deprecated names. The sole canonical name is `allowed_action_ids[]`.

The gate rule MUST:
1. Flag any doc that uses `recovery_options[]` or `allowed_actions[]` in a prescriptive context (not just as the canonical field name).
2. Accept `recovery_options[]` or `allowed_actions[]` only in deprecation notices, migration notes, or gate rules that detect their presence as a defect.
3. Verify that `allowed_action_ids[]` is used in all canonical blocked payloads, HITL contracts, FileSafe contracts, and container publishing contracts.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/DRY_Rules.md
