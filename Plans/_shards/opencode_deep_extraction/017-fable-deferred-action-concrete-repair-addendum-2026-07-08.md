# Shard 017: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/OpenCode_Deep_Extraction.md`

Source lines: L4611-L4616

Source SHA256: `f1e61125d0fea62ee6dc85a0c67a875c0e6feff6f42ffafa1ca0b9eb18e48b7c`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime OpenCode extraction rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-7183d3e1a2341af0a3d114e6`: OpenCode Plan mode, permission resolution, and wildcard matching content is source-lineage unless restated here or in owner docs. PM wildcard matching fields are `pattern`, `scope`, `case_sensitive`, `allow_subpaths`, and `owner_doc_ref`; result states are `matched`, `not_matched`, and `ambiguous`.
- Repairs `sfk-4da31b138448d57593acde8d`: plugin runtime strategy is owned by `Plans/Plugins_System.md`; Puppet Master uses plugin.json entries for WASM modules, subprocess-based entries, or dynamic libraries, and must not require JavaScript/TypeScript/Bun runtime dependency. OpenCode JS/TS/import behavior remains source-lineage only.
