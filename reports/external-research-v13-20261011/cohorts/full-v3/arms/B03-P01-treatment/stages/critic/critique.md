# Independent critic review — B03-P01-treatment

## Review boundary and overall assessment

I read the complete brief, released plan, discovery, draft, source map, plan-reveal record, and carried source index. I checked the official SQLite FTS5, release, WAL, and compile-option documentation; the SQLite forum evidence on Ł and trigger ordering; and version-pinned Tantivy 0.26.2 writer, reader, tokenizer, changelog, and update-example material. Exact identities and conditions are recorded in this stage's source map. I reviewed no parent discussion, other candidate, app repository, private notebook, or campaign history.

The draft is a sound provisional proposal and follows the revealed plan closely. I found no material wrong technical correction and no unsupported recommendation that changes the design. The central corrections—revision-checked latest-snapshot processing, durable replay, visible failures, a generation handoff, explicit tokenizer limits, and no engine winner absent app/build evidence—are supported and properly distinguished from unrun validation. It does not implement or endorse deployment.

Two scope questions remain honestly unresolved external inputs: the brief requests repository/caller/test review but supplies no app repository identity or path; and “saved query retains its meaning” needs a product definition for title-based queries. These are disclosed in the draft. They should remain open rather than be filled by conjecture. Exact script coverage, tag Boolean behavior, and latency/freshness limits are also properly left to app evidence or product decisions.

## Released-plan disposition review

| Released clause | Draft disposition | Critic assessment |
|---|---|---|
| P1.1 derived index beside store | Accept with storage/privacy boundary | Sound. FTS5's default content behavior and its external/contentless alternatives are distinguished; Tantivy body storage is explicitly excluded. Same database versus sidecar remains correctly open. |
| P1.2 internal ID, title, revision | Accept with immutable ID and revision | Sound design correction. Existing application support is unknown and disclosed. |
| P1.3 enqueue after authoritative save | Accept, strengthen durability | Sound. Atomic outbox is a recommendation conditional on the store; the fallback requires durable replay/reconciliation. |
| P1.4 free text, tags, exact-note navigation | Accept | Sound; stable IDs and current-store lookup meet the exact-note requirement. Tag indexing versus canonical filtering remains a real implementation choice. |
| P1.5 persist query/filter, not result list | Accept and version semantics | Good preservation of the expression. Owner decision remains for saved searches that refer to a note versus searches whose terms include a title; this is unresolved external input, not a false correction. |
| P1.6 no hosted service | Accept as hard constraint | Correctly preserves the prohibition. |
| P2.1 replace document on revision | Accept with serialization/freshness | Sound. Tantivy delete/add visibility and FTS5 mode/version differences are accurately qualified. |
| P2.2 background batching and pending status | Accept with coverage/failures | Sound; pending alone is not treated as proof of complete coverage. |
| P2.3 assume FIFO despite delayed retry | Reject; use revisions/latest source snapshot | Essential and correct correction. The proposed stale-retry and crash tests are appropriate. |
| P2.4 queue deletes and startup reconciliation | Accept with tombstone/replay | Sound; does not discard a deletion before index confirmation. |
| P2.5 freshness/tag path unresolved | Resolve as implementation requirement | Sound. Tag changes are placed in the version protocol or filtered canonically; AND/OR and renamed/deleted-tag semantics remain open. |
| P3.1 language-neutral split/casefold baseline | Retain only as measured baseline | Correct. The draft avoids language-coverage promises and names concrete failure cases. |
| P3.2 second generation and swap | Accept with replay/cutover rule | Sound. It captures a start sequence, replays changes, verifies catch-up, retains last-good state, and avoids blocking edits. Contentless FTS5 rebuild is distinguished from content-backed rebuild. |
| P3.3 failed records visible | Accept | Sound; retained retry/error state and degraded status avoid silent omission. |
| P3.4 proposed validation set | Accept and expand | Strong expansion. It labels the tests as proposed, not executed. |
| P3.5 no engine/measurement selected | Accept | Sound. FTS5, Tantivy, and scan remain alternatives; the segment report is expressly one downstream workload, not a benchmark. |
| P3.6 separate query, reliability, semantic tracks | Accept | Sound. Semantic search remains optional and deferred pending evidence and a local cost budget. |
| P4.1 provisional, resolve with primary evidence | Accept with open questions | Source behavior is supported by the checked primary material. Repository/caller/test evidence is absent because no target repository is identified; the draft says so rather than implying it ran. See external-input finding below. |
| P4.2 no deployment requested | Accept | Correct. The deliverable stays a proposal and reports no implementation/deployment. |

## Findings, classified

### Honestly unresolved external input — target application repository and callers

**Location:** draft.md, “Review status and evidence boundary” and “Validation proposals and executed work / Actually executed / observed”; discovery.md, “Scope and evidence boundary.”

**Evidence:** The original brief explicitly asks for relevant repository code, callers/tests, and consequential issue-to-fix or release history. The package reports no app repository or callers inspected and does not claim app tests ran. The provided brief and input map name no target app repository. The source package does cover upstream release/test history and issue reports. I cannot determine whether an app repository exists or which codebase should govern this proposal.

**Assessment:** This is a real evidence boundary, transparently disclosed; classify as honestly unresolved external input rather than an unsupported claim or a request to invent a repository. If the brief's author intended an app-specific review, they must identify the repository/callers. It does not invalidate the vendor-level comparison.

### Honestly unresolved external input — saved-query meaning after a title rename

**Location:** draft.md, P1.5 disposition and “Owner decisions and unknowns”; discovery.md, “Open product decisions.”

**Evidence:** The brief requires a saved query to retain its meaning after a note title changes. The draft preserves query text and a versioned representation, while distinguishing a query expression from an object that means “this note.” It leaves whether title terms should follow the renamed note, stay literal, or preserve an alias to an owner decision.

**Assessment:** The expression remains stable as a search predicate, but the product meaning of title-scoped saved searches is not chosen. Keep the distinction explicit; the package correctly does not claim that storing the same text also preserves the same result set.

### No material wrong or unsupported technical issue found

The reviewed primary evidence supports the consequential vendor claims:

- FTS5 contentless-delete begins in SQLite 3.43.0; external-content postings require application synchronization; external-content integrity comparison requires rank 1; and WAL permits reader/writer overlap but only one writer. The package preserves these conditions rather than treating them as universal SQLite properties.
- The checked SQLite forum report is narrow: the corrected nested AFTER UPDATE trigger case can make old/new values observed by the FTS synchronization logic surprising. The draft labels it as a trigger-interaction caveat, not general FTS5 corruption.
- Tantivy 0.26.2 commit blocks and publishes pending documents, delete visibility follows commit, reader reload may lag by tens of milliseconds, and the default tokenizer drops tokens over 40 characters. The pinned upstream example says Tantivy does not enforce unique IDs. The draft uses these facts to require batching, ID discipline, visible watermarks, and analyzer tests—not to claim performance.
- The changelog gives explicit compatibility examples and reindex-required releases; the draft appropriately requires format/schema tracking and rebuild fallback without claiming universal compatibility.

### Minor wording / locator note

**Location:** draft.md, P3.2 and “Candidate comparison without selecting a winner”; source-map.json S01.

The phrase “FTS5 REBUILD is unavailable for contentless tables” follows the manual's command description. Since FTS5 separately names ordinary contentless and contentless-delete tables, readers may benefit from saying explicitly that the proposed contentless-delete path will be rebuilt by streaming canonical notes into a fresh generation, not by issuing REBUILD. The draft already states that operation in P3.2, so this is locator clarity only, not a substantive defect.

## Alternatives, obligations, and validation

The comparison retains SQLite FTS5, Tantivy, and a source-store scan with their actual dependencies and costs; it excludes hosted search under the brief and defers semantic retrieval without inventing a need. The response preserves all core obligations: authoritative note storage, no hosted text transfer, stable identity, exact-note lookup, tag filtering, edit/delete races, incomplete-result communication, nonblocking rebuild, script limits, 20,000-entry responsiveness measurements, and a bounded integration sequence.

The proposed checks are relevant and sufficiently broad for a planning document: synthetic fixtures; rename/edit/delete and stale-retry ordering; tag changes; crash/ack boundaries; interrupted rebuild/cutover; tokenizer scripts and edge cases; current-store result resolution; packaged-engine compatibility; and latency/resource measurements during editing. None is reported as run. No benchmark, implementation, private-notebook access, or executable witness was performed in this critic stage.

## Critic conclusion

Retain the draft's no-winner, source-backed proposal boundary. Carry the target-repository identity and saved-query semantics as explicit unresolved questions. No rewrite or repair is warranted by this review.
