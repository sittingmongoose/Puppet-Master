# Shard 026: Runtime Recovery Canonicalization Gate Addendum

Source: `Plans/Progression_Gates.md`

Source lines: L629-L639

Source SHA256: `68b1b2cca109eacddb3d7b4246d67ecb83cd862cd9430302f03e66c5b15c8405`

---

## Runtime Recovery Canonicalization Gate Addendum

The runtime recovery sweep MUST fail if any doc:
- uses `allowed_actions[]` or `recovery_options[]` in a prescriptive runtime-facing context
- uses `analysis_id` as canonical queue-analysis identity instead of `scheduler_pass_id`
- leaves stale canonical text in owner docs while only appending a contradictory later note
- treats blocked reasons as `failure_class` values in runtime policy or consumer contracts

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Crosswalk.md

Accept deprecated names only inside deprecation notices, migration notes, or gate rules that detect them as defects.
