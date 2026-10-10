# Offline note-search adapter

Fixture ID: ER12-A3-01-FRESH. Queue slot: A3-01.
Authoring status: FINALIZED. Synthetic user input; no external facts are asserted.

A small desktop field-notes tool already stores note IDs, titles, bodies, and collection tags in SQLite. We need a local search adapter for 50,000 short notes. Research and plan this one adapter, including updating or deleting an indexed note. The existing editor and sync system are out of scope. An ordinary SQLite full-text extension and a separate embedded search library are plausible approaches; investigate SQLite FTS5 and Tantivy as meaningful alternatives without assuming either wins.

Fictional environment: Rust desktop application on Linux and Windows; upstream dependency versions have not been selected. Notes may contain accented words, punctuation, and quoted phrases. Search should return stable note IDs, an ordering, and a small safe excerpt. A collection filter is needed. Personal notes must stay on the machine. The application database remains the source of truth.

Required final clauses:
- S1: Describe a bounded query language, tokenization/normalization policy, and behavior for punctuation, accents, malformed queries, and a collection filter.
- S2: Compare indexing/update mechanisms and query semantics of the two approaches; explain the cost of keeping derived content consistent with the source database.
- S3: Define create/update/delete, crash recovery, and rebuild behavior, including stale or missing search rows.
- S4: Specify result identity, rank/order stability, and safe excerpt generation without claiming universal language quality.
- S5: Tie capability and limitation claims to the actual component, deployed version, build/configuration, and operation. Include one relevant implementation or release/history detail.
- S6: Provide a small validation matrix and distinguish checks actually run from checks merely proposed; preserve explicit unresolved questions and decisions.

Negative constraints: no hosted service; no network export of notes; no whole editor or sync build; no direct execution of user text as SQL; no claim that lexical search provides semantic understanding; no deletion of authoritative notes during index repair; no unsupported universal capability-absence claim.

Use 30 minutes for investigation, 12 for critique, and 18 for revision. Seek primary documentation and relevant implementation/history evidence for the consequential design choices. Save discovery before receiving the concealed user plan: a source map, important findings, a comparator mechanism, and unresolved implementation questions. The final output is a recommendation and bounded adapter plan, not a completed application. A tiny synthetic check is optional; installing/building a large dependency tree is unnecessary. No winning source, assessor solution, or executed validation is supplied.
