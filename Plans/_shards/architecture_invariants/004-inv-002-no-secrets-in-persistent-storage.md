# Shard 004: INV-002 -- No secrets in persistent storage

Source: `Plans/Architecture_Invariants.md`

Source lines: L45-L56

Source SHA256: `a1488a98949bf363a0c763a51dae6dc4db5261708c7828eeca492e65f251c543`

---

## INV-002 -- No secrets in persistent storage

**Rule:** Secrets (tokens, credentials, private keys) MUST NOT be written to:
- seglog event stream
- redb projections
- Tantivy indexes
- sparse n-gram regex-index artifacts (`frequency_table.bin`, `postings.bin`, `lookup.bin`, `file_map.bin`, `index_meta.json`) except for secrets-scrubbed derived content and project-relative paths
- plaintext logs, evidence bundles, or state files

**Allowed persistence:** OS credential store only.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.storage, SchemaID:evidence.schema.json, PolicyRule:no_secrets_in_storage, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md
