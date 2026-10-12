# Independent critic review — incremental search for a research notebook

**Run/stage:** B03-P01-control / critic  
**Inputs reviewed:** original brief; investigator discovery, proposal, source map and navigable source index; exact released plan. The review stayed within the paths listed by the stage input map and source index.  
**Review time:** 2026-10-12 UTC.  
**Role boundary:** This is a critique, not a final proposal, implementation, or approval.

## Overall assessment

The draft is a strong, conditional research proposal. It addresses the brief’s major requirements and individually disposes of all 20 clauses in the released plan. In particular, it rejects the plan’s unsafe assumption that an older delayed retry cannot overwrite a newer update, makes deletion durable rather than relying on a startup comparison, treats tags as exact IDs, and gives rebuilds a snapshot/change-stream handoff. It does not select an engine or claim that performance has been measured.

I found no material factual error in the consequential SQLite and Tantivy claims I independently checked against the primary documentation and maintainer records listed in this stage’s source map. One material technical caveat is missing from the SQLite contentless sidecar discussion: the ordinary contentless FTS5 table’s update/delete restrictions matter directly to this workload. Target-application behavior also remains unverified because no application repository, callers, schema, or tests are identified or supplied by the permitted inputs. The draft discloses that limitation rather than claiming integration facts.

## Findings

### C-01 — Material incomplete: contentless FTS5 update/delete behavior is not stated

**Draft locator:** “Proposed design,” SQLite FTS5 bullet, sentence beginning “If asynchronous lag is required”; also the corresponding FTS5 comparison in “Brief-only discovery.”  
**Evidence:** FTS5 sections 4.4.1–4.4.2 say a traditional contentless table does not support ordinary UPDATE, DELETE, or REPLACE operations. Rows can be removed with the FTS5 delete command, but SQLite requires that command to receive the original indexed values as well as the rowid; an ID-only tombstone may no longer have those values after canonical deletion. Since SQLite 3.43.0, contentless-delete tables provide different UPDATE/DELETE behavior and the documentation recommends them for new code unless backward compatibility is required. The available behavior therefore depends on the table mode and shipped SQLite version. See S-SQLITE-FTS5 in source-map.json.  
**Assessment:** The draft correctly calls a contentless sidecar a candidate and correctly says its column values cannot be read and its documented rebuild command is unavailable. But it does not say how its central edit/delete workload would be applied, or identify the contentless-delete version gate. A reader could take “contentless local sidecar plus ID map/outbox” as a complete update strategy. This is material because the brief explicitly includes repeated edits and deletions while indexing is in flight. Keep the approach conditional until the selected table mode, delete/update operation, runtime floor, and rebuild-generation behavior are evaluated. I am flagging the missing condition, not prescribing a final implementation.

### C-02 — Honestly unresolved external input: target application integration

**Brief locator:** paragraph beginning “Produce a research-backed software proposal,” which calls for relevant repository code, callers/tests, and consequential issue/fix or release history.  
**Draft locator:** “Responsiveness measurements and proposed checks,” first paragraph; “Bounded integration sequence,” step 1; “Owner decisions and unresolved facts.”  
**Evidence:** The input map supplies the brief, investigator artifacts and their carried source tree, but no target editor repository or app path. The draft explicitly records that no target repository, storage schema, callers or test suite was identified or inspected.  
**Assessment:** The requested repository/caller/test review is therefore unverified, and the design cannot yet claim fit with the actual save/delete transaction boundary, stable-ID model, tag relation, OS set, SQLite build, or snapshot capability. This is an unresolved external input, not a false claim by the investigator: the limitation is stated and the integration sequence begins by gathering those facts. Do not treat the conditional alternatives as a chosen product design.

### C-03 — Minor locator/wording: “no hosted service” is stronger than the exact brief boundary

**Plan locator:** released-plan paragraph 2: “No hosted service is planned.”  
**Brief locator:** the explicit restriction is “Do not send note text to a hosted search service.”  
**Draft locator:** exact-plan disposition row 7 labels “No hosted service” a “requirement”; elsewhere the draft correctly states that note text must not be sent to a hosted search service.  
**Assessment:** The local-only search recommendation is consistent with the plan and privacy goal. The disposition table slightly upgrades “no hosted service is planned” into a blanket requirement. Keep the plan’s wording distinct from the hard text-handling constraint so later readers do not mistake a plan assumption for a separate user requirement. This does not change the proposed local-engine comparison.

### C-04 — Honestly unresolved external input: multi-tag Boolean semantics

**Brief locator:** “search text, filter by tag.”  
**Plan locator:** “Queries combine free text with a tag filter” and “saved query stores its query text and filter expression.”  
**Draft locator:** “Keep tags as exact stable IDs”; “Query contract and saved queries”; “Owner decisions and unresolved facts.”  
**Assessment:** The draft correctly avoids treating tag labels as full-text tokens and offers canonical-relation versus mirrored-ID paths. It does not settle whether several selected tags mean all-tags or any-tag, and the supplied brief and plan do not specify that rule. The draft leaves query modes for owner approval, so this is an open product semantic, not an unsupported implementation fact. Record it explicitly before the saved-query contract is fixed.

## Exact released-plan review

Each released clause is represented in the draft’s “Exact plan clause disposition” table. The following checks whether the disposition is adequate, not whether the eventual product choice is settled.

| Clause | Critic assessment |
|---|---|
| 1. Derived index next to store | Retained conditionally; placement and recovery remain store-dependent. |
| 2. Internal ID, title, revision | Correctly strengthens ID to permanent and independent of title/path; revision freshness is addressed. |
| 3. Queue after save | Correctly identifies a crash gap and recommends durable change capture in the authoritative transaction where possible. Actual store capability remains unresolved. |
| 4. Text plus tag filter | Retained and clarified as exact stable-ID membership, not tokenized labels. Define multi-tag all/any semantics. |
| 5. Result link by identifier | Correctly resolves through current canonical data rather than a stale path. |
| 6. Save query criteria, not results | Correctly adds versioning and stable IDs; saved-query field/query semantics remain owner decisions. |
| 7. No hosted service planned | Local design fits. See C-03 for the small wording upgrade in the disposition table. |
| 8. Replace document on revision | Correctly guards logical replacement with latest-revision checks. |
| 9. Background batches/status | Correctly expands this to bounded work and visible lag/failure; Tantivy’s blocking behavior is independently supported by the pinned API docs. |
| 10. Assume queue order protects freshness | Correctly rejects this assumption; an older retry can arrive after a newer save. Durable sequence and revision/tombstone checks address the race. |
| 11. Delete by queue plus startup reconciliation | Correctly makes a durable tombstone the deletion mechanism and keeps reconciliation secondary. |
| 12. Freshness and tag propagation unresolved | Correctly offers a freshness rule and two tag strategies, while leaving store/query cost open. |
| 13. “Language-neutral” splitting | Correctly rejects an unsupported universal guarantee and asks for target-script fixtures. |
| 14. Stemming/tokenizer exploration | Correctly makes it evidence-gated and field/language-specific. |
| 15. Second index and swap | Correctly adds a consistent snapshot/watermark, event catch-up, barrier, integrity/coverage check and swap. Feasibility depends on the actual store. |
| 16. Visible failed records | Correctly expands status to lag, per-note failure and retry without claiming success past a gap. |
| 17. Proposed validation cases | Correctly adds race, crash, tag, malformed query, corruption, migration and resource cases. None is claimed as executed. |
| 18. No engine or performance winner | Correctly retains a conditional scan/FTS5/Tantivy comparison and makes no benchmark claim. |
| 19. Separate query, reliability and semantic choices | Correctly keeps these separate; semantic retrieval is not selected. |
| 20. Provisional plan; no deployment | Correctly says this is a proposal and reports no implementation or deployment. |

## Original-brief coverage

- **Text search, tag filtering, exact-note navigation:** Covered with lexical candidates, exact tag IDs and canonical-store lookup by permanent note ID.
- **Rename/edit/delete races:** Covered by same-transaction change events where possible, coalescing, current-revision reads/checks, tombstones and replay. The delayed-old-retry scenario is explicitly rejected.
- **Different scripts:** Covered without a broad language promise. FTS5 and Tantivy defaults are described with their documented tokenizer conditions; target scripts need combined indexing/query fixtures.
- **Twenty thousand entries and usefulness while catching up:** The proposal does not infer speed from count alone. It specifies a scan baseline, candidate local engines, latency/lag/resource metrics and a visible incomplete state. These are proposed checks, not results.
- **Saved query after title rename:** Query criteria and stable IDs are separated from result snapshots. The draft correctly notes that a query which searches title text can keep its definition while its matching result set changes with the title.
- **Rebuild without blocking edits:** Shadow generation, bounded scan, change replay and cutover are specified as a proposed handoff. The required store snapshot and ordered change stream are identified as a prerequisite, not asserted to exist.
- **Authoritative data and privacy:** Search hits resolve through the notebook; the draft avoids stored title/body copies and recognizes that postings still contain searchable terms and may retain deleted-term residue. This distinction is useful and correctly scoped.
- **Failures, alternatives, measures, sequence:** The draft covers surfaced failures/retries, scan/FTS5/Tantivy comparison, a proposed metric set, and a bounded integration sequence. It recommends no hosted text search and does not recommend semantic search without a separate cost/quality case.
- **Research sources and target code:** Primary product documentation and release/maintainer records were reviewed. The target application repository/callers/tests remain unavailable as described in C-02.

## Source and validation assessment

I independently opened the SQLite FTS5 and WAL documentation, SQLite attached-database transaction documentation, the listed SQLite maintainer/forum records for the nested-trigger, Polish ł/Ł and malformed trigram-option examples, and version-pinned Tantivy 0.26.2 API/tokenizer/update-example sources. The resulting source identities, locators, conditions, access time and relevance are in this stage’s source-map.json.

The checked claims match the source conditions: FTS5’s Unicode61 default is based on Unicode 6.1; its external-content table reads from a same-database object and is caller-synchronized; its rebuild command deletes and reconstructs the index and is unavailable to contentless tables; WAL permits readers alongside a writer but only one writer; the nested-trigger report requires the specific same-table nested AFTER UPDATE pattern; Tantivy 0.26.2 documents that commit blocks/publishes pending changes and add_document may block when the pipeline is full; and the pinned default tokenizer and ID/update example match the draft’s qualified descriptions.

The ATTACH caution is also appropriately phrased as “do not assume”: SQLite documents cross-file crash atomicity only under conditions, and states that with WAL or an in-memory main database each file remains individually atomic but a crash during commit can leave attached files inconsistent. This is a condition to retain if the sidecar path is discussed.

**Executed by investigator, as represented in the draft:** source/document review; no app repository, app tests, downloaded-code execution, private-notebook benchmark, integration test or performance check.  
**Executed by this critic:** independent reading of the permitted artifacts and direct primary-source page checks described above. No code or app validation was run.  
**Proposed, not executed:** every fixture, correctness/race/recovery check and performance measurement in the draft.

## Useful discovery and alternatives

The strongest useful discovery is the durability/freshness distinction: a queue ordered by save time is not enough if an old operation can be retried late. Keeping a durable change cursor, comparing revisions before publication, preserving delete tombstones through acknowledgement, and resolving result IDs against current source data form a coherent conditional reliability model.

The alternatives are reasonably balanced for the evidence available. A canonical scan is a real baseline and possible implementation, not dismissed by note count. SQLite FTS5 is conditional on the actual SQLite runtime and synchronization model; its external-content and contentless tradeoffs are made explicit, subject to C-01. Tantivy is a plausible separate Rust index with a pinned API, writer-commit and tokenizer discussion, while OS/runtime fit and duplicate prevention remain app responsibilities. The proposal does not treat the historical CJK report or conditional Windows issue as proof of a current defect. No winner can be selected from these sources alone.

The work is therefore suitable as a conditional research draft after carrying C-01 through the engine evaluation and retaining C-02/C-04 as open inputs. This critic has not rewritten or repaired the investigator’s proposal.