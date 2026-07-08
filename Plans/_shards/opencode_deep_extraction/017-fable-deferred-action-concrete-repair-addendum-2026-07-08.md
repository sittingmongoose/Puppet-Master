# Shard 017: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/OpenCode_Deep_Extraction.md`

Source lines: L4611-L4616

Source SHA256: `ce5ef845ef33f5e94499a41f3a92007360b822339b65f92544c51a5039e04014`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime OpenCode extraction rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-7183d3e1a2341af0a3d114e6`: OpenCode Plan mode, permission resolution, and wildcard matching content is source-lineage unless restated here or in owner docs. PM wildcard matching fields are `pattern`, `scope`, `case_sensitive`, `allow_subpaths`, and `owner_doc_ref`; result states are `matched`, `not_matched`, and `ambiguous`.
- Keeps `sfk-4da31b138448d57593acde8d` explicitly deferred: plugin runtime language/API choice needs plugin owner decision before closure.
