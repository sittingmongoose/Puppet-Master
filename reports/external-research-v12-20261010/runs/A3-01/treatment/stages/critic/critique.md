# Independent critic review — A3-01-treatment

Stage: critic  
Run: A3-01-treatment  
Input brief: ER12_RUNTIME/runs/A3-01/treatment/inputs/brief.md  
Released plan: ER12_RUNTIME/runs/A3-01/treatment/stages/investigator/revealed-plan.md  
Investigator package: discovery.md, draft.md, source-map.json, revealed-plan.md, plan-reveal.json  
Brief SHA-256: ce8e377b5dbae266b408c6793e2336e145bea2e143511444a246ceaf5841fac4  
Released-plan SHA-256: d490464e9066ef07d933d5e8fb1b91980c28695182e280fc0e0722837e7d2718

## Review result

The recommendation preserves the complete brief and released-plan scope. FTS5 external-content is a defensible conditional preference for this SQLite-backed adapter; Tantivy remains a real alternative with the additional index lifecycle clearly described. The package makes no performance claim, keeps deployment capability unknown pending exact build probes, and clearly marks validation as proposed. I found no material-wrong technical claim in the bounded primary evidence I checked.

Two material-incompleteness findings remain conditional on the eventual schema and write paths: SQLite REPLACE writes can bypass the FTS delete trigger unless recursive triggers are enabled, and the Tantivy outbox must also capture collection-membership changes if tags are stored or changed separately from the note row. These gaps do not prove either current application behavior; the app write paths and schema were not supplied. See M1 and M2.

## Findings

| ID | Classification | Draft locator | Evidence and assessment |
|---|---|---|---|
| M1 | Material incomplete | “Preferred approach” and “Write, crash, freshness, and rebuild plan” — trigger maintenance and verification of bulk/replacement operations | The draft correctly requires checking all real write paths, including replacement paths, but leaves out a consequential SQLite trigger condition. SQLite REPLACE first deletes the conflicting canonical row; delete triggers for that conflict-resolution delete fire only when recursive triggers are enabled. The pragma was initially off for compatibility, with its current default allowed to change. If any canonical note write uses INSERT OR REPLACE while the delete trigger does not fire, stale FTS postings are possible. This is conditional: no application SQL or pragma value was provided. The plan should make this a named check and either rule out REPLACE on notes or verify the required trigger behavior on each shipped connection. Do not infer this is an observed app bug. [C03, C04] |
| M2 | Material incomplete | Mechanism comparison; Tantivy outbox write/replay sections | The Tantivy design promises an exact collection term/facet filter and freshness watermark, but describes events for note create/update/delete without explicitly covering collection-tag membership changes. If tags live in a relation table or can change without updating the note row, the Tantivy facet can go stale and the watermark can falsely imply a complete filter result. This is conditional on the actual schema. Either emit durable ordered events for membership changes too, or filter from canonical SQLite rows with a retrieval/completeness design that cannot silently omit matching notes. Tantivy exposes index mutations through writer operations and makes them searchable on commit; it does not automatically track SQLite relations. [C05; brief sentence “A collection filter is needed.”] |
| U1 | Honestly unresolved external input | Bounded query contract; collection-filter paragraph; unresolved owner decisions | The brief requires a collection filter but does not say whether unfiltered search remains available or whether several selected tags use any/all semantics. The draft says “separate required filter” and records the any/all question, but not optional-versus-mandatory selection. This needs an owner decision; no correction can be grounded in the supplied brief. [brief sentence “A collection filter is needed.”; draft §Bounded query contract] |
| U2 | Minor locator/wording | “Negative Constraints” bullets | Several bullets append “rejected” to the negative requirement, including “No direct execution of user text as SQL: rejected,” then immediately specify fixed prepared SQL and a bounded parser. Read literally, the label rejects the constraint while the sentence accepts it. The supporting design follows the negative constraint; disposition wording should say accepted/complied or otherwise remove the polarity ambiguity. |
| U3 | Minor locator/wording | Investigator source-map S10, cited for parser behavior | S10 identifies Tantivy 0.26.2 but the exact URL uses the mutable docs.rs/latest path. It transparently says the page header showed 0.26.2 at access, so this is not a hidden rebinding; pin the URL or tag source before using it as release-specific evidence. The cited panic issue itself is correctly bounded to Tantivy 0.22.1 / grammar 0.22.0. [S10, S15, C11] |

No separate unsupported finding was identified for the principal capability corrections reviewed. No executable validation, application build, installation, or target-platform probe was run by this critic.

## Full-scope and released-plan review

### Brief clauses S1–S6

| Clause | Critic assessment |
|---|---|
| S1 — bounded grammar, normalization, punctuation, accents, malformed queries, collection filter | Substantially addressed. The draft gives explicit query and token limits, phrase/AND behavior, punctuation and malformed-input rules, analyzer choices, accent caveats, and a filter outside engine syntax. Analyzer parity and language behavior remain untested as the draft says. U1 records the filter-selection ambiguity. |
| S2 — compare indexing/update and query semantics; derived-content consistency cost | Substantially addressed for both alternatives. The contrast between same-database FTS triggers and a separate Tantivy sidecar/outbox is clear. M2 is the missing condition for collection-metadata changes on Tantivy. |
| S3 — create/update/delete, crash recovery, rebuild, stale/missing rows | Strong coverage. FTS rebuild/integrity checking and Tantivy ordered replay, commit/ack boundary, source snapshot, stale-hit filtering, and missing-row reconciliation are distinct. M1 adds a named SQLite REPLACE/trigger caveat; M2 applies when indexed collection values can change separately. |
| S4 — identity, rank/order stability, safe excerpt, no universal language claim | Substantially addressed: canonical IDs, engine-specific BM25 direction, explicit stable-ID tie policy, bounded excerpts, and text-safe rendering are specified without asserting semantic search. The 24-token / 180-grapheme limits are design choices, not requirements from the brief, and are correctly offered as the proposed contract. |
| S5 — component, deployed version/build/configuration/operation, implementation or history detail | Strong conditional treatment. FTS5 availability and app versions/builds remain UNKNOWN; Tantivy 0.26.2 and SQLite 3.53.4 are evidence snapshots, not selected dependencies. The contentless-delete release and version-bounded Tantivy issues provide history. U3 is a locator-quality improvement, not a rebuttal of the bounded version claim. |
| S6 — validation matrix, executed versus proposed, unresolved questions | Correctly distinguishes the proposed matrix from checks actually run. The investigator reports none run and retains substantial owner decisions. This critic did not execute product validation either. |

### Exact released-plan dispositions

- The user preference to reuse SQLite is preserved conditionally, with FTS5 preferred only if the actual Linux and Windows builds expose it and the lexical contract passes.
- The released sketch that duplicates ID/title/body/collection in a search table is narrowed to FTS5 external content over title/body; the canonical note/tag data stays in SQLite and collection filtering is joined there. This is consistent with the disk-saving goal without claiming zero index storage.
- The old “contentless cannot delete or replace” assumption is correctly split by configuration. Current FTS5 documentation says ordinary contentless tables do not support SQL UPDATE/DELETE (and their columns read as NULL except rowid); contentless-delete tables, introduced in SQLite 3.43.0, support DELETE and INSERT OR REPLACE, and support UPDATE only when new values for every user-defined FTS column are supplied. They do not support the FTS5 delete command. This is a real exception to an unqualified “cannot,” not evidence that the app has it. [C01, C02]
- The excerpt and tokenizer assumptions are corrected with the right distinctions: external-content FTS5 can fetch canonical column values for auxiliary functions; a plain contentless index cannot return those source values; changing tokenizer choice calls for a new derived index/repopulation plan, not replacing authoritative notes or the database. The draft’s external-content preference is reasoned from this product’s rebuild/excerpt/source-table needs. SQLite’s statement that new code should prefer contentless-delete is explicitly limited to comparison with ordinary contentless; it does not establish a universal preference over external-content indexing. [C01]
- Query operators, punctuation, phrase handling, score ties, crash gaps between stores, no-partial-result behavior, privacy, and rebuild authority are all addressed without broad capability-absence claims. The Tantivy parser issue is treated as a focused test lead, not generalized from an old version.
- No obligation was removed and no editor, sync, hosted service, or application implementation was added.

## Targeted challenge of absolutes and defaults

The FTS5 page and the SQLite 3.43.0 release record agree on contentless-delete’s version gate and update/delete exception. The newer-looking general sentence “new code should prefer contentless-delete” is not a recommendation over every other FTS5 mode; it directly compares contentless-delete against ordinary contentless. It therefore does not refute the draft’s external-content choice, but it does make the distinction worth retaining. The release page dates availability to 2023-08-24 and identifies source ID 0f80b798b3f4b81a7bb4233c58294edd0f1156f36b6ecf5ab8e83631d468778c. [C01, C02]

The FTS5 documentation says external-content triggers do not backfill rows that predate trigger creation, and its rebuild command reconstructs from the current content table; rank 1 is required for an external-content integrity comparison. The draft states those conditions rather than claiming triggers or default integrity checks do more than they do. [C01]

Tantivy 0.26.2 documentation confirms that IndexWriter commit publishes and persists pending additions; delete operations apply to earlier committed and earlier same-commit documents and are visible only after commit. Its 0.26.2 IndexReader docs retain the default delayed reload policy and say it may take tens of milliseconds. This supports the draft’s commit/ack and freshness barrier, while leaving actual application operation proposed. [C05, C09]

The upstream Tantivy issue #3031 remains open in the inspected page and reports malformed “- *” panics for Tantivy 0.22.1 / tantivy-query-grammar 0.22.0. The linked fix-like change is in a contributor fork. Tantivy 0.26.2 package metadata in the investigator source map records a ^0.26.0 grammar dependency, but the checked history does not establish whether the report persists or is fixed in that dependency. The draft correctly preserves this as unresolved and proposes exact-version malformed-input testing. [S07, S15, C11]

## Validation status

The investigator’s matrix is a proposal only. According to the inspected package, no adapter test, build, install, platform probe, benchmark, or sandbox witness was executed. My work checked documentation and released-history evidence only; I did not execute code or product validations. Proposed checks must remain labelled proposed until actually run on the selected application builds.

## Native Goal provenance observed before terminal completion

The native Goal creation tool directly returned:

- threadId: 01a12408-0794-70a1-a4e0-05e8984e545e
- objective: ER12 critic stage, run A3-01-treatment: execute ER12_RUNTIME/runs/A3-01/treatment/stages/critic/assignment.md; preserve complete brief scope and save required outputs before completing this native Goal.
- status at creation: active
- tokensUsed: 0
- timeUsedSeconds: 0
- createdAt: 1791605899
- updatedAt: 1791605899
- remainingTokens: null
- completionBudgetReport: null

Provider/model provenance and native ISO-formatted timestamp fields were not exposed: UNKNOWN. The raw numeric timestamp fields above are retained as returned. This artifact was saved before native Goal terminal completion; T3 task completion is not used as evidence of Goal activation or completion.

