# Draft recommendation — local note search

Run: `A3-01-treatment`; fixture: `ER12-A3-01-FRESH`. This is a bounded adapter recommendation for the 50,000-note local SQLite database. It is not an application implementation, editor build, or sync build.

## Preferred approach

Prefer **SQLite FTS5 external-content indexing**, subject to verifying FTS5 in the exact SQLite library shipped on both Linux and Windows and validating the query contract below. Keep SQLite as the only source of truth. Create an FTS5 virtual table over only `title` and `body`, with `content='notes'` and an integer `content_rowid` mapping back to the canonical note row. This avoids FTS5's default second copy of title/body while retaining token/posting data. Collection tags and the stable note ID stay in canonical SQLite tables and are joined/filtered there. FTS5 can fetch source-column values from its external content table, so an excerpt need not be stored a second time in the FTS index. The index is still derived data and requires maintained triggers. [S01, S03, S04]

This fits the user's SQLite preference and makes source-row plus FTS maintenance one local SQLite transaction. Add database triggers for note insert, title/body update, and delete; for update/delete, remove old FTS tokens using the old rowid/text before inserting replacement text. Collection-only changes need no FTS rewrite if collection is filtered from canonical rows. Create the triggers and then run FTS5 `rebuild` under a write boundary to populate existing notes. At repair time run the external-content `integrity-check` with `rank=1`; if it finds drift, rebuild from canonical notes. A missing match cannot be discovered by joining search results alone, so use integrity checking/reconciliation as well. Never delete or alter authoritative notes as index repair. Verify the actual database write paths invoke the triggers, including any bulk import/replace path; do not assume a UI callback is the only writer. [S03, S05]

Keep **Tantivy** as the alternative if FTS5 is unavailable in a shipped build, tested query semantics are insufficient, or a measured benefit justifies a second local index lifecycle. The candidate research artifact is Tantivy 0.26.2 at tag commit `72d1ef9a6468aa68bbc69dcc80cdf60aaf64364d`; this is not a selected application dependency. Tantivy would use a local index directory, one writer, and SQLite as authority. It offers typed query/index controls, but cannot atomically commit an SQLite note mutation and a separate Tantivy commit. It therefore needs an outbox, ordered/idempotent replay, explicit reader freshness, and a rebuild from SQLite. Its cost is operational consistency and another index format to version/repair, not a hosted service. [S07, S08, S09, S13, S14, S18]

### Mechanism comparison

| Concern | FTS5 external content | Tantivy sidecar |
|---|---|---|
| Write/update/delete | SQLite trigger writes add/delete-old/add-new/delete into the virtual index in the same transaction as the note row. | Outbox trigger writes a sequence/ID/operation in the source transaction; one writer later deletes/adds and commits to a separate directory. |
| Recovery cost | Verify with external-content integrity check, then rebuild from the SQLite content table. | Replay ordered pending events; if the index or checkpoint is invalid, rebuild a fresh index by scanning a consistent SQLite snapshot, drain later events, validate, then publish. |
| Query semantics | FTS5 `MATCH` has its own phrase, Boolean, column, NEAR and prefix grammar; the adapter deliberately exposes less. | `QueryParser` has a broad grammar; typed query objects can express the bounded adapter language without exposing it. Both are lexical. |
| Content/storage | External content avoids a second body copy but retains token/posting data and fetches source values for snippets. | Index body for search. To use Tantivy's documented snippet generator, its example stores text; otherwise fetch body by canonical ID and form an excerpt in the adapter. Measure that storage choice. |
| Failure coupling | One SQLite transaction, subject to journal/VFS/filesystem durability settings. | No cross-store atomic commit; outbox, idempotent replay, lag barrier, sidecar versioning, platform validation. |

No benchmark was run. The 50,000-note size is small enough to make FTS5 a plausible first implementation, but query latency, index footprint, rebuild time, and write cost remain unmeasured. Keep the alternative open until those measurements and actual cross-platform FTS5 capability are known.

## Bounded query contract

Propose this small user grammar, independent of either engine's complete query language:

```text
query := atom (SPACE atom){0..15}
atom  := word | QUOTE phrase-tokens QUOTE
```

Before parsing, split unquoted text on whitespace and punctuation; punctuation inside a balanced phrase is also a tokenizer separator. Limit input to 256 Unicode scalar values, at most 16 atoms, and each searchable token to 40 UTF-8 bytes. Reject longer query tokens, unmatched/nested quotes, over-limit input, empty input, and punctuation-only input with an ordinary validation message; do not turn an empty or malformed query into match-all. Longer source tokens remain intact in notes but are outside the searchable contract. A quoted atom is an adjacent ordered phrase after tokenization. Outside quotes, all tokens are ANDed in any order. Thus `canoe-kayak` means both lexical terms; `"old desk"` means the adjacent phrase. Do not expose operator syntax, negation, column names, wildcards/prefix search, NEAR, regex, or arbitrary SQL; words such as `AND`, `OR`, and `NOT` are ordinary literal search terms. The first version can reject literal delimiter quotes inside a phrase rather than inventing escaping behavior.

Select an explicit analyzer for indexing and query text. For FTS5, use `unicode61 remove_diacritics 2` as the initial policy: Unicode 6.1 letter/number/private-use token categories, case-insensitive matching, punctuation/space separators, and Latin diacritic removal, including the documented multi-diacritic exception fix. This is not Unicode-wide transliteration. For Tantivy, select a named `SimpleTokenizer` pipeline with lowercase, explicit `AsciiFoldingFilter`, and `RemoveLongFilter::limit(40)` (the filter limit is UTF-8 bytes); apply the same 40-byte rejection to query tokens. Keep longer source tokens in canonical notes but outside the searchable contract. Do not rely on an implicit default that silently drops long tokens. These tokenizers are not equivalent by promise: Unicode tables, fold mappings, punctuation classes, and token limits differ. Test precomposed/decomposed accents, `ø`, `ß`, combining marks and non-Latin text before describing broader behavior. Do not add stemming, synonyms, fuzzy or substring search without an owner decision and evidence; lexical matches are not semantic understanding. [S01, S02, S09]

Parse query text into app-owned typed atoms, then build engine input from those atoms. For FTS5, generate only quoted term/phrase expressions and bind the `MATCH` value; SQL parameter binding does not restrict FTS5's own grammar. For Tantivy, construct typed term/phrase/Boolean queries or pass only safe generated syntax to `QueryParser`. Do not pass raw user input as SQL or as unrestricted engine syntax. A historical issue documents `QueryParser::parse_query("- *")` panicking in `tantivy` 0.22.1 / `tantivy-query-grammar` 0.22.0. Its linked fix-like commit is in a contributor fork, not proof that an upstream release contains the change. This is a reason to pin, inspect and test the chosen parser, not a claim that current Tantivy 0.26.2 has that bug. [S02, S10, S15]

Treat the selected collection/tag as a separate required filter. In FTS5, join note search rowid to the canonical note and apply a bound collection filter (use an `EXISTS`/join against tag membership if notes can carry several tags). In Tantivy, combine the text query with an exact collection term/facet filter. Keep tag identity out of user query grammar. Decide whether selecting several tags means any or all; the brief does not specify it. [S03, S09]

## Corrected assumptions, optional choices, and owner decisions

| Plan statement or preference | Disposition | Evidence-based treatment |
|---|---|---|
| “A contentless full-text index cannot support deletion or replacement.” | **Partly correct; configuration-specific correction.** | Ordinary `content=''` contentless FTS5 tables do not support SQL `UPDATE`/`DELETE`; `REPLACE` is treated as a regular insert, and the special FTS delete command needs original indexed text. Since SQLite 3.43.0, `contentless_delete=1` supports `DELETE` and `INSERT OR REPLACE`, and supports `UPDATE` only when every user-defined FTS column is supplied; it does not support the FTS delete command. External-content FTS5 supports trigger-maintained insert/update/delete using old values. Do not assume `contentless_delete` exists in an unpinned app build. [S03] |
| “Excerpts require the text to live inside the index.” | **Incorrect for external content; constrained for contentless.** | FTS5 external-content tables fetch needed column values from the content table and support snippets without a private full-text copy. A truly contentless table cannot return indexed columns beyond rowid, so retrieve excerpt text by joining its rowid to authoritative SQLite notes; its own `snippet()` cannot reconstruct unavailable text. Tantivy can store text, but this adapter may also retrieve canonical text by stable ID. Prefer external content for simpler snippet and rebuild behavior. [S03, S04, S12] |
| “Changing tokenizer choices always forces replacing the database.” | **Incorrect; derived-index rebuild is required.** | Tokenizer choice is part of the FTS table configuration, and `rebuild` uses that table configuration. Create a new derived FTS table with the selected tokenizer and repopulate it from canonical notes; keep the authoritative SQLite database and notes. A contentless table cannot use the external-content `rebuild` command and would need its own reindex procedure, another reason not to start there. For Tantivy, build/validate a versioned sidecar index and switch its active generation; preserve SQLite rows. No live deployment has been tested for migration duration. [S01, S03, S07] |
| “Rewrite a search row whenever the editor saves.” | **Optional sketch; prefer DB triggers for FTS5.** | Triggers run within the same SQLite transaction for inserts, indexed-text updates, and deletes and avoid relying on each writer remembering a callback. Validate every write path and keep collection filtering on canonical rows. If a source writer bypasses SQLite triggers, the design is incomplete. [S03, S05] |
| “Sort by relevance is sufficient.” | **Corrected.** | FTS5 BM25 uses lower numbers for better matches; Tantivy `order_by_score()` uses decreasing BM25. Specify `score` followed by stable canonical `note_id`. Tantivy's built-in equal-score tie-break is ascending `DocAddress`, an internal address that is not the public note identity and may change with segment layout/rebuild. Scores can also change when the corpus/analyzer/version changes. [S04, S11] |
| “A separate library can update its index after each database commit.” | **Not sufficient; add a durable handoff.** | A second index cannot join the SQLite transaction. Write an ordered change record in the same SQLite transaction as each note change; commit Tantivy; acknowledge only afterward. Replay unacknowledged operations idempotently; update is delete-by-stable-ID then add current row, delete is delete-by-ID. A crash before Tantivy commit leaves the event pending; a crash after index commit but before acknowledgement replays it. Test both boundaries. [S05, S08] |
| Disk savings are a goal. | **Accepted as a constraint; measurement remains proposed.** | External-content FTS5 avoids a second full copy of title/body, but postings/token metadata still occupy space. Contentless-delete may be considered only if space measurements justify its more manual excerpt/rebuild path; do not break delete or repair to save bytes. [S01, S03] |
| “I prefer to reuse SQLite.” | **Accepted as the current preference, not a deployment fact.** | FTS5 is preferred if the actual shipped library supports it and the query behavior meets tests. Tantivy remains justified by a demonstrated capability/latency need or unavailable FTS5. [S01, S06, S07] |

## Write, crash, freshness, and rebuild plan

### Preferred FTS5/external-content path

- Canonical `notes` retains stable `note_id`, an integer primary key used as FTS rowid, title, body, and collection/tag relations. The public result ID always comes from `notes.note_id`, never FTS rowid.
- FTS5 indexes title/body only, with `content='notes'` and `content_rowid` set to the canonical integer key. Do not index collection as full text; filter through the canonical collection relation.
- In the note creation/update/delete transaction, SQLite triggers insert the new text, remove old token entries and add replacements, or delete old entries. A title/body change updates FTS; collection-only changes alter canonical filter data only. No separate “write note, then remember to update index” callback is required for ordinary SQL writes.
- Create the external-content FTS table and triggers, then populate existing rows with the FTS5 `rebuild` command in a migration/write boundary. Confirm exact app writes, including any bulk/replacement operation, fire the intended triggers.
- A committed transaction exposes canonical content and matching FTS rows together. If trigger/schema damage or drift is suspected, run `integrity-check` with `rank=1`; on mismatch, rebuild the derived index from current canonical notes and rerun the check. If an FTS table must be recreated with a new tokenizer, retain notes and rebuild only the derived table. Never delete source notes during repair.
- If WAL is configured, the database, `-wal`, and `-shm` are one persistent set while connections are open. Record `journal_mode` and `synchronous`. SQLite's docs describe `synchronous=FULL` as syncing WAL each commit and `NORMAL` as omitting that sync, which can lose recent commits on power failure/hard reset. WAL defaults to a 1000-page auto-checkpoint and is same-host only; do not copy only the main DB file while a WAL is active. These claims depend on actual VFS/filesystem behavior; test the chosen mode on both target OSes. [S03, S05, S16, S17]

### Tantivy alternative

- Add `search_changes(seq, note_id, operation)` and applied-watermark metadata in SQLite. SQLite triggers append an event in the same transaction as each canonical note create/update/delete, so writers do not need a remembered callback. Keep note bodies out of the queue to avoid duplicating full content there.
- A single local Tantivy writer consumes changes in increasing sequence. For update, read the canonical note state and issue delete by exact stored/indexed note ID plus add one current document; for deletion, issue delete by exact note ID. Commit batches and acknowledge their queue range in SQLite only after the Tantivy commit succeeds. Tantivy documents a delete as applying to earlier committed and earlier same-commit documents, so preserve operation order and test replays. [S08]
- On restart, replay pending changes; an uncommitted Tantivy batch returns to its last commit, while a committed-but-unacknowledged batch is repeated idempotently. Validate index metadata/schema/tokenizer version and queue watermark. If invalid or drifted, read all notes plus the sequence watermark `G` from one SQLite snapshot, build and commit a fresh local index, drain outbox events after `G`, and publish only once the new index is validated and caught up; retain the old generation until handoff succeeds. Never “repair” by deleting canonical notes. Tantivy has no SQLite content-table `rebuild` command, so the application owns this procedure. An open issue asks about orphan segment files after a writer dies before commit; treat uncommitted data as untrusted and recover from SQLite, not from speculative orphan-file salvage. [S07, S08, S14]
- To avoid presenting partial search results as complete, capture the current SQLite change sequence for a request. Serve Tantivy results as complete only after the committed index watermark reaches it; recheck the source sequence before returning and wait/retry or return “search updating” if it advanced. Filter each hit against SQLite to suppress stale deleted IDs; this cannot detect missing index rows, so sequence/checksum/count reconciliation and rebuild remain necessary. `IndexReader` uses `OnCommitWithDelay` by default and may take tens of milliseconds to expose a commit; force/await reload at the completeness barrier. [S03, S08, S14, S18]
- The writer and sidecar stay on this machine, with local-only paths. No hosted service, query upload, note export, or note-body logging is part of this adapter. On backup/restore, SQLite remains authoritative and the Tantivy sidecar is verified or rebuilt locally. [S07, S08]

## Result identity, order, and safe excerpts

Return stable `note_id`, score/rank, title, collection context, and one short excerpt. Do not expose internal FTS rowid, Tantivy `DocAddress`, or index sequence as note identity.

For FTS5, order by `bm25(note_search)` ascending and then `note_id` in a fixed binary order; add `LIMIT` as a bound parameter. For Tantivy, higher BM25 scores sort first; use a custom collector that ties by canonical note ID (or collect and fully sort the modest 50,000-note match set before truncating). Do not rely on TopDocs' internal address tie-break for a cross-rebuild contract. State rank stability only for a fixed corpus, dependency version, schema, and tokenizer; inserts/deletes or version/analyzer changes can alter IDF and order. No ranking score promises semantic understanding. [S04, S11]

Define the excerpt contract as at most 24 lexical tokens and 180 grapheme clusters, trimmed at a safe text boundary. FTS5 `snippet()` can read external content and allows at most 64 tokens; request 24 tokens with empty match markers to return plain text, then apply the grapheme cap and treat the value as untrusted text. For Tantivy, either store body text and account for that duplicate in the disk budget when using its documented snippet generator, or fetch canonical body text by note ID and build the same bounded plain-text excerpt in the adapter using the selected analyzer's token boundaries. The documented generator example stores text fields and defaults to a 150-character cap; its character limit alone does not establish this product's token/grapheme limits. Use fragment/highlight ranges only with text-safe rendering; do not insert `to_html()` output until its escaping behavior is verified. [S19] Test markup/script-looking text, quotes, control characters, and long combining sequences. The UI must display text, not interpret note bodies as markup. [S03, S04, S12]

## Optional improvements after the first adapter

These are not required for the initial contract: a title BM25 boost if relevance examples support it; word/phrase highlighting after safe range rendering is verified; custom stemming/synonyms/fuzzy/substrings if a language-specific need is established; Tantivy if cross-platform FTS5 or measured scale is insufficient; and contentless-delete only if storage measurements justify manual excerpts and a custom full reindex path. Test first, then decide whether the added behavior is useful.

## Exact S1–S6 clause disposition

| Clause | Requested outcome | Disposition in this draft |
|---|---|---|
| S1 | Describe a bounded query language, tokenization/normalization policy, and behavior for punctuation, accents, malformed queries, and a collection filter. | Covered in “Bounded query contract”: grammar/limits, punctuation split, phrase semantics, accent policy and known differences, malformed-input behavior, no exposed operators, separate exact collection filter. Actual analyzer parity remains proposed validation. |
| S2 | Compare indexing/update mechanisms and query semantics of the two approaches; explain the cost of keeping derived content consistent with the source database. | Covered in the mechanism-comparison table, corrections, and lifecycle sections: FTS5 same-DB external-content triggers vs Tantivy local sidecar/outbox; FTS5 `MATCH`/tokenizers vs Tantivy typed queries/parser; FTS5 no full body copy, Tantivy consistency queue/lag/replay/rebuild. |
| S3 | Define create/update/delete, crash recovery, and rebuild behavior, including stale or missing search rows. | Covered in “Write, crash, freshness, and rebuild plan”: trigger operations, crash boundaries, outbox/replay, checkpoints, stale-hit filtering, missing-row reconciliation, full rebuild from SQLite; authoritative notes are never deleted. |
| S4 | Specify result identity, rank/order stability, and safe excerpt generation without claiming universal language quality. | Covered in “Result identity, order, and safe excerpts”: canonical IDs, engine score direction, stable ID tie, score scope, 24-token/180-grapheme excerpt, safe text rendering, lexical-only limits. |
| S5 | Tie capability and limitation claims to the actual component, deployed version, build/configuration, and operation. Include one relevant implementation or release/history detail. | Covered in evidence/version section and source map: SQLite FTS5 reference docs plus 3.53.4 source ID, Tantivy 0.26.2 commit, exact operations/config conditions, contentless-delete since 3.43.0, and version-bounded Tantivy issue history. **Actual app version/build is UNKNOWN**; no selected binding or target build was supplied or probed. Capability claims for the app remain conditional. |
| S6 | Provide a small validation matrix and distinguish checks actually run from checks merely proposed; preserve explicit unresolved questions and decisions. | Covered below. Every validation item is proposed; no adapter test/build/check was executed. Open owner decisions are listed explicitly. |

## Negative constraints

- **No hosted service or network export of notes:** accepted. Search and index remain on-device; do not log or transmit note bodies/queries.
- **No whole editor or sync build:** accepted. Scope is the adapter/schema/trigger/outbox boundary only.
- **No direct execution of user text as SQL:** rejected. Use fixed prepared SQL, a bounded parser, and bound collection/limit values; bind generated FTS `MATCH` separately.
- **No claim that lexical search is semantic:** rejected. Describe token matches and BM25 only.
- **No deletion of authoritative notes during index repair:** rejected. Rebuild or replace derived FTS/Tantivy data from canonical SQLite notes.
- **No unsupported universal capability-absence claim:** rejected. State exact version/build/operation and condition; app deployment availability is UNKNOWN until its actual connection/build is probed.

## Supported findings, alternatives, and uncertain points

**Supported by primary documentation:** FTS5 is a virtual table module; its tokenizer is build/runtime dependent. External-content tables query a same-database content table for values and rely on the application for consistency. Triggers do not backfill old rows; rebuild and integrity-check are documented repair operations. Normal contentless and contentless-delete modes have different update/delete behavior, with the latter appearing since SQLite 3.43.0. Tantivy commits/publishes batches separately, deletes become visible after commit, reader refresh is delayed by default, and TopDocs uses `DocAddress` for equal scores. The source references and their exact conditions are in `source-map.json`. [S01, S03, S04, S06, S07, S08, S11, S18]

**History detail:** Tantivy 0.26.2 was released at commit `72d1ef9a6468aa68bbc69dcc80cdf60aaf64364d` on 2026-09-08. The Windows issue #2847 is open and specifically reports 0.25.0 on Windows 10/11 NTFS; it is a test lead, not proof about 0.26.2. The malformed-query report is specifically 0.22.1/grammar 0.22.0 and its linked fix-like commit is from a fork. Neither issue supports a universal version claim. [S07, S13, S15]

**Already covered by the brief and retained:** 50,000 short notes, SQLite as source of truth, local-only privacy, create/update/delete, title/body/tag fields, FTS5 and Tantivy, punctuation/accent/quoted phrase needs, collection filtering, stable ID/order/excerpt needs, no semantic search, and no editor/sync implementation.

**Rejected or corrected:** full note-body duplication is not required for FTS5 external content; “contentless cannot delete” is only true for the ordinary configuration, not version-gated contentless-delete; excerpts can use canonical external content or a source-table join; changing the tokenizer does not require replacing SQLite or authoritative notes, though it requires derived-index regeneration; raw unrestricted query syntax and relevance-only ties are inadequate; post-commit Tantivy update without an outbox is incomplete.

**Uncertain / owner decisions:** actual SQLite binding and versions on Linux/Windows; FTS5 availability and extension-loading policy; exact FTS5 table/analyzer configuration; supported tag cardinality and any/all semantics; accent/combining/non-Latin policy; query limits, stopwords, phrase boundary, and quote escape; title/body weighting and result limit; excerpt length/highlight policy; allowed Tantivy freshness lag; WAL versus rollback mode and `synchronous`; backup/index sidecar policy; tokenizer/schema migration window; and whether measurements justify Tantivy or contentless-delete; and whether Tantivy body text is stored for built-in snippets or fetched from SQLite to preserve the disk-saving goal.

## Validation matrix and execution status

The released plan lists proposed synthetic checks. The full matrix is recorded below. **Executed checks: none.** The research stage did not install/build dependencies, execute downloaded code, run an application or sandbox witness, or test a platform build.

| Check | Proposed operation and observable outcome | Status |
|---|---|---|
| Component/build provenance | On Linux and Windows record `sqlite_version()`/source ID, build options and successful create/drop FTS5 virtual-table probe; record Tantivy lock/tag, target, Rust toolchain, schema and analyzer if selected. | Proposed; not run |
| Query language | Test unquoted AND, quoted adjacent phrase, `canoe-kayak`, `café`/`cafe`, decomposed accents, `ø`, `ß`, combining marks, punctuation-only, empty, unmatched quotes, operator-looking words, over-limit query/token. Malformed input must return a user error, never match-all or panic. | Proposed; not run |
| Filter/identity/order | Two collections with identical terms, multi-tag note, duplicate/equal scores, repeat search before/after update/rebuild. Assert exact collection semantics and stable `note_id` order for a fixed corpus/config. | Proposed; not run |
| CRUD and consistency | Create, update title/body, change collection only, delete; verify source + FTS transaction; if Tantivy is selected, fault-inject before commit and after commit/before outbox acknowledgement, then restart/replay. | Proposed; not run |
| Missing/stale rows and rebuild | Remove an FTS derived row, corrupt a stale index record, and omit an indexed note; run `integrity-check rank=1`/rebuild or Tantivy sequence reconciliation/rebuild. Search must converge without deleting notes; missing rows must be detected by the reconciliation path, not merely result joins. | Proposed; not run |
| No partial Tantivy results | Pause writer behind a committed change; issue a request with target sequence. Confirm it waits/retries or reports “search updating” until index watermark covers target; verify reader reload. | Proposed; not run |
| Excerpt safety/size | Notes contain `<script>`, markup-like text, quote delimiters, controls, emoji and long combining clusters. Assert <=24 tokens and <=180 grapheme clusters, displayed as text, never executed/interpreted. | Proposed; not run |
| Platform/release regression | On selected Tantivy release, stress rapid commits/merges on Windows; fuzz malformed wrapper inputs; test rebuild after process termination. On FTS5, test the exact bundled/system library and journal mode on both OSes. | Proposed; not run |
| 50k measurement | Deterministic synthetic corpus: cold/warm query latency, index size, update/delete cost, filter latency and rebuild time for both viable candidates. Record criteria before selecting. | Proposed; not run |

## Release and Goal provenance

The plan-release helper was run exactly once at `2026-10-10T04:04:36.847Z`. It returned `single_use: true`, discovery SHA-256 `2d2f70dfc0b31a2e0843faf7467d8da39e8980cdb7df7b8eb7253bdb96be4479` (`16544` bytes), and released-plan SHA-256 `d490464e9066ef07d933d5e8fb1b91980c28695182e280fc0e0722837e7d2718` (`2623` bytes). The only plan read was `revealed-plan.md`.

The native Goal tool returned this actual Goal and it was confirmed active before work completed:

```json
{
  "threadId": "01a123f3-dc9f-7d50-8b7e-2ed4d124bfdd",
  "objective": "ER12 investigator stage, run A3-01-treatment: execute ER12_RUNTIME/runs/A3-01/treatment/stages/investigator/assignment.md; preserve complete brief scope and save required outputs before completing this native Goal.",
  "status": "active",
  "tokensUsed": 238258,
  "timeUsedSeconds": 496,
  "createdAt": 1791604584,
  "updatedAt": 1791605080,
  "remainingTokens": null,
  "completionBudgetReport": null
}
```

Native provider/model provenance and native ISO-formatted timestamp fields were not exposed: **UNKNOWN**. The raw native timestamp fields above are retained without inferred provenance. Terminal Goal completion is intentionally recorded by the native Goal tool only after this draft and the other required outputs are saved.
