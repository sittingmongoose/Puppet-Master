# Independent critic review — A3-01-control

## Review basis

I reviewed the complete frozen synthetic brief, investigator discovery and draft, investigator source map and its sources/index.md, and the exact released user plan. The listed SHA-256 values were recomputed and match the freeze manifest. Original S01–S11 bindings are preserved unchanged in this stage’s source-map.json; independent primary-source checks use separate C01–C13 IDs in sources/index.md.

I directly opened the governing SQLite pages and version-pinned Tantivy documentation/source. Documentation review only was performed: no app, build, query test, index operation, benchmark, crash simulation, note-data access, or validation-matrix item was run. The draft clearly labels its matrix as proposed.

The native Goal was directly observed active before these artifacts were saved. Raw observed fields are in source-map.json. Terminal status and unavailable Goal provenance/timestamps are UNKNOWN at save time.

## Overall assessment

The recommendation is coherent and within scope: it prefers same-database FTS5 external content for its simpler consistency model, retains Tantivy as a meaningful alternative with its outbox/replay cost, preserves unknown deployment/schema facts, and does not claim upstream documentation proves an app build. I found no material-wrong technical claim in the draft.

Three material incompleteness points remain for the later reviser. The most significant is a concurrent-write gap at Tantivy generation cutover. Two conditional details should be stated before implementation: how collection-membership changes reach Tantivy when collection keys are indexed, and the exact query-time analyzer application for each backend. These findings do not authorize scope reduction and are not a replacement plan.

## Issue register

### R1 — Material incomplete: Tantivy rebuild cutover needs synchronization

**Draft locator:** “Tantivy alternative,” generation rebuild paragraph: snapshot plus outbox watermark, replay later changes, compare, then switch active generation. The validation matrix’s “Crash windows” row tests interruption around source/index commit and acknowledgement, but not a concurrent mutation during final catch-up and switch.

**Finding:** Snapshot and replay are a sound direction, but the stated sequence does not establish a race-free cutover. If a note changes after the new generation’s last replayed sequence and before its active marker is switched, while new writes are routed only to the old active index, the newly active generation can omit a committed mutation. “Catch up,” “verify,” and “switch when ready” need a concrete synchronization condition.

**Evidence and basis:** Tantivy publishes its updates at its own IndexWriter commit, separate from SQLite’s transaction and outbox acknowledgement (C09); SQLite serializes writes within its database (C03). The missed-update window is an architectural inference from the proposed cross-store sequence, not a documented defect in either component.

**Needed resolution:** Define a durable cutover watermark and coordination mechanism, such as briefly fencing source writes while recording the final sequence, draining through it, verifying and switching before resuming writes; or keeping both generations current and switching only at a verified sequence. State how readers know which generation is complete. No implementation check was run.

**Classification:** material incomplete.

### R2 — Material incomplete, conditional: collection membership must participate in Tantivy maintenance

**Draft locators:** S1 says Tantivy may index an exact collection key or intersect against the source. The Tantivy schema paragraph proposes an exact collection-key field; outbox paragraphs describe note mutations by note ID.

**Finding:** If collection tags live in a separate one-to-many relationship and the implementation indexes keys in Tantivy, tag additions/removals/renames must also reach the transactional change stream and rebuild verification. A note-body-only outbox can leave the required filter stale. The draft appropriately records the schema as unknown and offers source-side intersection, so this is conditional rather than a false assertion.

**Evidence and basis:** The brief requires a collection filter; the released plan includes collection in its working search-row sketch. The actual schema is not supplied. This follows from the proposed derived-field consistency model, not from an upstream Tantivy limitation (C09).

**Needed resolution:** Either include relationship mutations in the outbox or select source-side intersection and describe its consistency behavior. Keep tag cardinality/key normalization as unresolved external input until schema evidence exists.

**Classification:** material incomplete, conditional on indexing collection keys.

### R3 — Material incomplete: define query-time analyzer use and Unicode boundaries

**Draft locators:** “Narrow query and result contract,” items 1–2; Tantivy typed-query construction; proposed accent/punctuation compatibility test.

**Finding:** The draft specifies a useful bounded grammar and distinct FTS5/Tantivy analyzer policies, but it does not say exactly how query text becomes backend terms with the same normalization as indexed content, especially for decomposed accents/combining marks and punctuation inside a quoted phrase. This matters for Tantivy typed TermQuery/PhraseQuery construction: the app must supply analyzed terms, not assume typed query constructors analyze arbitrary user text. FTS5 tokenizes the MATCH value itself, but the adapter still parses and safely constructs that expression.

**Evidence:** SQLite Unicode61 defaults to L*, N*, Co token categories; remove_diacritics=2 has Latin-script-specific behavior, not universal transliteration (C01). Tantivy selects a tokenizer per text field and its folding policy is not equivalent by definition (C06). PhraseQuery requires indexed positions and zero slop for adjacency (C08). The draft correctly proposes composed/decomposed accent and punctuation tests; no test result is claimed.

**Needed resolution:** Specify the adapter lexer’s Unicode treatment, query-normalization path for each backend, and phrase behavior after normalization. Preserve the “not universal language quality” limitation and treat parity as a validation result.

**Classification:** material incomplete.

### R4 — Minor locator/wording: validation record omits S11

**Draft locator:** “Actual check record” says evidence review was S01–S10, while the draft cites S11 for TopDocs and the investigator source map includes S11.

**Finding:** The range understates the cited evidence. The TopDocs API directly states decreasing BM25 order (C12); the ascending DocAddress tie rule is independently verified in tagged 0.26.2 source (C13). Investigator S11’s docs.rs/latest URL and search-result-only operation are honestly disclosed; preserve that original identity and use a pinned locator for any new record.

**Classification:** minor locator/wording; no underlying S11 conclusion was unsupported after this independent check.

## Clause-by-clause assessment

| Clause | Assessment |
|---|---|
| **S1 — bounded query, normalization, punctuation, accents, malformed input, collection** | Covered at proposal level: 256-scalar and 8-clause bounds; conjunctive terms; quoted adjacent phrases; punctuation delimiters; empty input never matches all; malformed input gives visible errors; explicit FTS5 and candidate Tantivy folding; exact collection filter. R3 remains for exact query-side analyzer construction and Unicode edges. |
| **S2 — indexing/update/query comparison and consistency cost** | Strong. FTS5 external content, same-database trigger upkeep and rebuild are compared with Tantivy’s separate index commit and outbox/replay burden. Parser breadth, analyzer differences, and score direction are addressed; no measured winner is claimed (C01, C06–C09, C12–C13). |
| **S3 — create/update/delete, crash recovery and rebuild** | Mostly covered: trigger maintenance, backfill, integrity check, rollback/repair, source preservation, outbox, ordered replay and generation rebuild. R1 is a material cutover condition; R2 applies if collection fields are indexed. Crash checks are proposed only. |
| **S4 — identity, order and safe excerpt** | Covered. The public note ID remains authoritative; score then ID is proposed; rank may change with corpus/config/version; DocAddress is not the app key; excerpts come from current SQLite text and generated markup is not trusted as HTML. |
| **S5 — actual component/version/build/operation and history** | Correct boundary: candidate upstream releases are named, while deployed versions/builds remain unknown. The draft calls for inspecting actual SQLite source ID/options per OS and gives Tantivy 0.20.1 Windows mmap history without implying a present defect. SQLite 3.43.0 contentless-delete history is not incorrectly imposed on external content (C02, C05–C06, C11–C13). |
| **S6 — validation matrix, run status, open questions** | Strong. Observable outcomes and pure-query versus recovery/build/UI checks are distinct; none is represented as run. Schema, dependency, privacy, ranking and UX decisions remain open. Only R4’s S01–S10 range needs correction. |

## Released-plan disposition audit

| Revealed-plan point | Draft disposition | Critic assessment |
|---|---|---|
| Reuse SQLite; duplicate ID/title/body/collection and rewrite on editor save; avoid full-body duplication | External-content FTS5 with source rows retained and trigger upkeep | Addresses disk goal without claiming postings are free; schema and row-ID mapping remain open. |
| Contentless cannot delete or replace | Distinguishes standard contentless delete command from 3.43.0+ contentless-delete restrictions | Accurate and version-qualified (C01, C05). |
| Excerpts require indexed text | Fetches current authoritative SQLite text by stable ID and builds bounded excerpt | Correct; contentless FTS cannot return text columns, but app can fetch source. Generated markup is treated cautiously (C01, C10). |
| Tokenizer changes force database replacement | Treats changes as derived-index schema migration, preserving notes | Correct separation; precise in-place versus shadow-table path remains a test question. |
| Space-split query, phrases, collection, no punctuation/accent/operator policy | Replaces with bounded grammar, punctuation delimiters, errors, accent policy and exact filter | Substantial correction; see R3 for final analyzer detail. |
| Relevance alone; no tie-break or score direction | Defines score direction and stable note-ID tie-break | Correctly avoids cross-engine score equivalence. Tantivy’s default collector tie key is DocAddress (C12–C13). |
| Tantivy updated after DB commit; crash gap unresolved | Adds transactional outbox, commit-before-ack replay and generation rebuild | Correctly identifies two-store gap; R1 adds missing cutover synchronization. |
| SQLite callbacks/reconciliation and partial rebuild concern | Uses triggers, initial backfill, rank=1 integrity check and derived-only repair | Accurate; repair preserves source notes (C01, C03–C04). |
| Preserve S1–S6 and negatives; no benchmark or installed capability check | Preserves scope and marks checks proposed | Confirmed. No hosted service, network export, editor/sync build, raw SQL execution, semantic-search claim, destructive repair, or universal absence claim is proposed. |

## Correctly unresolved external inputs

The actual SQLite/Tantivy versions and build features; SQLite journal/VFS mode; note-ID type and immutability; collection-tag cardinality/key semantics; title/body weighting, result page and latency expectations; owner choice on accent/error behavior; and any secure-erasure promise remain unknown. These are not draft errors. The artifact is a recommendation, not a completed application, and this critique does not repair or write a final.
