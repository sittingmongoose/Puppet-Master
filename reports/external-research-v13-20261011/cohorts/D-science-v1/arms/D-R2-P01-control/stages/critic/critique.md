# Independent critic review — D-R2-P01-control

## Review basis and judgment

I reviewed the original brief, full investigator discovery and draft, its source map and source index, the released plan, and plan-release record at the paths in input-map.json. The released plan is the exact reviewed text: 2,186 bytes hashing to c036fb29c9b1ffb4c0179c9919eee7484ba71bf2fbe1c9be8167bb2e25db2d00. The frozen discovery is 15,578 bytes and matches b9c5c944e0eadfacf8d4255d1afb290fd97b15b975dd96b2bfe0cdc2b7d27bac.

The package is strong and covers the complete brief and all released-plan disposition groups. I found no material wrong or unsupported consequential claim among those checked against primary sources. One security behavior needs a more exact explanation; the remaining findings are an unchosen owner input and two minor clarifications. Proposed validation is clearly separated from executed checks.

## Findings

### Material incomplete — OpenSearch DLS role composition is not stated

**Draft locator:** draft.md, “Supported alternatives and evidence,” paragraph beginning “PostgreSQL RLS and OpenSearch DLS…” (line 38); also the DLS row in “Exact clause dispositions” (line 19).

The draft says DLS has “special multi-role behavior” and that exact role combinations matter, but does not state the behavior. OpenSearch documentation says DLS queries combine with OR; if a DLS role is combined with a role without DLS, results still match the DLS from the first role. It also documents the dfm_empty_overrides_all setting for access to documents without DLS. These details affect how team memberships and overlapping roles map to authorization. State the rule and its version/configuration caveat, then retain the draft’s requirement to test the actual role model. Do not treat the vendor filter as the authoritative ACL policy. Evidence: C09 and C14.

### Honestly unresolved external input — Revocation consistency boundary

**Draft locators:** permission and cache disposition rows (lines 19–20), “Proposed validation, not executed” (line 79), and “Uncertain or unresolved” (line 96).

The draft correctly calls for a revocation SLA, current authorization checks, ACL epochs, cache invalidation, and tests including in-flight searches. It does not select the authoritative point at which a permission change counts as effective, the maximum propagation window, or how a revoke racing the final response/copy check is handled. Public engine documentation cannot choose those organization-specific semantics. Keep this unresolved until identity/security owners choose a contract; do not imply immediate revocation from an index filter or cache invalidation alone. Evidence C03, C09, C12–C14 shows engine controls have privilege, mapping, role, or aggregation boundaries and do not establish an end-to-end revocation guarantee.

### Minor locator/wording — Make removed-state disclosure boundary explicit in the opening recommendation

**Draft locator:** “Recommendation,” second paragraph; compare the removed-passage row in “Exact clause dispositions” (line 23) and the resolver order under “Passage identity.”

The opening says a citation must resolve to the original passage “or stop with an explicit unavailable/removed state after checking current authorization.” Later text correctly says to disclose no title or snippet when access is denied or unknown, and to show a tombstone only after authorization. The opening could be read as allowing a removed-versus-restricted distinction before that gate. Clarify that explicit removed/unavailable detail is for a currently authorized caller; denial or unknown access remains non-disclosing. This is ambiguity in the summary, not a contradiction in the detailed resolver path.

### Minor locator/wording — Preserve the v0.8.0 follow-up in pgvector issue #719

**Draft locator:** “Failure/release history and applicability,” first paragraph (line 65 onward).

The draft accurately describes #719 as a report about v0.7.0 and records the maintainer’s advice to try 0.8.0 and a B-tree for selective predicates. The same issue also contains a reporter follow-up that the error persisted after moving to 0.8.0 on PostgreSQL 17, after which the maintainer requested ANALYZE and an EXPLAIN plan. The separate #785 discussion partly supplies the needed caution, so this does not overturn the conclusion. Add this nuance or point to the follow-up so the upgrade suggestion cannot be mistaken for a documented resolution. Evidence C06–C07.

## Coverage against the brief and released plan

| Obligation or disposition | Assessment and locator |
|---|---|
| Compare lexical, semantic, and hybrid retrieval without selecting a product | Covered in “Supported alternatives and evidence” and retrieval tables. PostgreSQL FTS, pgvector, and OpenSearch are conditional candidates; exact terms, paraphrases, filtering selectivity, fusion, and ranking limits are distinct. C01, C04, C08, C10, C17. |
| Replace ordinal/chunk identity with a durable passage strategy | Covered in the chunk and edition-plus-position rows and “Passage identity.” Stable passage identity is separated from regenerable search chunks; snapshot/hash and selectors are fallbacks. W3C selector limits and quote-content risk are included. C11. |
| Preserve what the user saw and distinguish a later edition | Covered in citation and newer-edition rows and resolver path: immutable edition plus passage, copy-time capture, and separate current-edition status. A live URL is only a navigation hint. |
| Prevent disclosure after permission changes, including caches | Substantively covered by authorized retrieval and per-item checks, open/copy rechecks, fail-closed behavior, ACL generation, cache scope, and tests. Keep the owner revocation contract open as above. The draft correctly treats vendor controls as examples, not substitutes for enterprise authorization. C03, C09, C12–C14. |
| Describe eventual indexing and uncertain freshness | Covered by proposed queued-to-ready and stale/failed/withdrawn states, source and ACL generations, timestamps, and conditional atomic cutover. Alias atomicity is not represented as authorization freshness. C16. |
| Handle a removed passage without implying equivalence | Covered: resolve the original when retained and authorized; otherwise stop with a non-content-bearing tombstone; offer a new related passage only as a different result. Align opening wording as above. |
| Preserve ranking, privacy, and export constraints | Covered: rank is not authority/currency/access; no private upload to an external provider is proposed; exported copies are expressly outside revocation guarantees. |
| Explain owner boundaries and distinguish proposed from executed validation | Covered in “Owner boundaries” and “Proposed validation, not executed.” No synthetic benchmark, production relevance evaluation, or authorization test is claimed as run. Toy and production checks are proposed separately. |
| Exact plan dispositions: chunk identity, citation, permission, edition replacement, missing passage | All five have explicit accept/reject/conditional dispositions in draft.md lines 15–23. Corrections preserve scope and do not silently substitute a product or reduce the brief. |

## Evidence and validation notes

Primary-source checks support the material mechanism claims: PostgreSQL FTS configuration and application-specific ranking (C01), GIN’s optional randomized soft result limit (C02), RLS enablement and owner/bypass and policy-composition exceptions (C03), pgvector’s post-scan filtering and underfill trade-offs (C04), OpenSearch’s version-specific DLS, vector-filter, and RRF behaviors (C08–C10), W3C selector/state limits (C11), and Elasticsearch’s scoped aggregate/cache examples (C12–C13). The versioned OpenSearch 3.8 pages explicitly say they are no longer maintained; the investigator discloses this, and current-route cross-checks have no pinned release identifier (C14–C17). A selected release still needs verification.

I did not run a corpus, query benchmark, authorization harness, or implementation test. My verification was read-only source review plus hashes of the frozen discovery and released plan. The investigator’s “not run; proposed only” status is accurate. Issue reports are bounded reports, not benchmarks or universal product behavior.
