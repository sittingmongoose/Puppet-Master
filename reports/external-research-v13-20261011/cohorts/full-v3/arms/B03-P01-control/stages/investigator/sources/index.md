# Source index — investigator discovery

The initial 12-source set was collected before plan release and re-opened at 2026-10-12T01:14:45Z. The nested-trigger source was added after release at 2026-10-12T01:18:14Z. These are bounded notes and locators, not full-page captures. Sources are primary project documentation, versioned code/examples, official release history, or maintainer issue/forum records. See ../source-map.json for structured identity, URL, version/commit, access time, observed operation, conditions, and applicability.

## SQLite

### [S-SQLITE-FTS5 — FTS5 Extension](https://www.sqlite.org/fts5.html)

Living official SQLite documentation; retrieved sections include 2.1, 3, 4.3, 4.4, 6.7 and 6.12.

- FTS5 has query terms, phrases, prefixes, NEAR/Boolean syntax and ranking; the expression on the right side of MATCH is an FTS query language string, not plain SQL text. Use an application query model, compile and validate it, bind SQL parameters, and expose parse errors.
- FTS5 is in the SQLite amalgamation since 3.9.0; canonical source-tree builds enable it with --enable-fts5. Runtime/build qualification is necessary.
- unicode61 is default and based on Unicode 6.1. It treats contiguous letter/number/private-use codepoints as tokens and strips Latin diacritics by default. Porter is for English. Trigram matches substrings; fewer-than-three-character full-text queries do not match, and LIKE/GLOB can scan if no three-character literal exists.
- Ordinary FTS5 stores a copy of rows. External-content mode reads columns from a same-database table/view and avoids that copy, but consistency is the caller’s responsibility. Example insert/update/delete triggers maintain it, but triggers do not backfill old rows. Inconsistent content can produce unintuitive results. FTS5 rebuild deletes the whole index and rebuilds from the content table. Contentless tables cannot use that rebuild command.
- Indexing and query behavior need versioned language fixtures. FTS5 docs describe token categories and options, not morphological segmentation for every writing system.
- FTS5 delete postings can remain in database until merge unless secure-delete is enabled; this matters if deleted-token residue is in scope.

### [S-SQLITE-WAL — SQLite Write-Ahead Logging](https://www.sqlite.org/wal.html)

Official WAL documentation, sections 1–2.3. WAL mode allows readers and a writer concurrently, but only one writer at a time. Long read transactions can hold back checkpoint progress. WAL shared memory requires processes on one host and does not work on a network filesystem. This supports a local database and highlights potential contention if an index worker writes into the same SQLite database as edits.

### [S-SQLITE-CHANGES — SQLite Release History](https://www.sqlite.org/changes.html)

Official release history, especially 3.46.1 (2024-08-13): improved robustness parsing FTS5 tokenize= arguments; associated with forum post 171bcc2bcd. The later 3.50.0 entry adds fts5_tokenizer_v2 / locale=1 and contentless_unindexed; these do not imply an out-of-box language segmenter. Check actual app runtime before relying on newer features.

### [S-SQLITE-TRIGRAM-ISSUE — FTS5 malformed trigram options crash report and fix](https://sqlite.org/forum/forumpost/171bcc2bcd?t=c)

SQLite forum report dated 2024-08-06 against a July 31 trunk check-in: malformed trigram tokenizer options without a value crashed; maintainer confirmed trunk behavior changed to an error, and the report points to 3.46.1 as the release containing the parser robustness fix. Applicability: do not carry malformed configuration; pin/test the deployed SQLite version when using trigram or any tokenizer options.

### [S-SQLITE-DIACRITIC-ISSUE — FTS5 Polish ł/Ł report](https://sqlite.org/forum/info/e336faf90e60d53f?t=c)

SQLite forum report (3.30.1) and maintainer explanation: Unicode’s mapping for ł/Ł differs from canonical base-plus-diacritic cases; remove_diacritics does not fold it, and custom tokenization may be required. Historical report is a concrete test case; verify behavior on the selected current SQLite build before making language claims.

### [S-SQLITE-NESTED-TRIGGER-ISSUE — external-content FTS5 with nested update triggers](https://sqlite.org/bugs/info/552f36384c7900ef72448f71118f9c6fe8aa2553e7ef617ef7323c3d0f54b104)

SQLite Fossil bug/forum record dated 2026-08-04/05, status resolved, with a corrected report against SQLite 3.45.1, 3.45.3 and 3.53.2. The condition is an external-content FTS5 sync trigger combined with another same-table AFTER UPDATE trigger that performs a nested UPDATE. Maintainer explains trigger order can cause the FTS sync to see unexpected old/new values; recommendation is to avoid that nested-write pattern or fold the change into the application’s original update. This is a specific trigger-graph caveat, not a claim that external-content FTS5 generally fails.

## Tantivy

### [S-TANTIVY-RELEASE-0262 — release 0.26.2](https://github.com/quickwit-oss/tantivy/releases/tag/0.26.2)

Official release tag page. Version 0.26.2, short commit 72d1ef9, tagged 2026-09-08. Used to pin the version examined below. docs.rs showed crate version 0.26.2 at retrieval.

### [S-TANTIVY-INDEXWRITER-0262 — IndexWriter API](https://docs.rs/tantivy/0.26.2/tantivy/indexer/struct.IndexWriter.html)

Version-pinned docs.rs API. IndexWriter manages indexing threads and a shared queue; add/delete operations become visible only after commit; commit publishes/persists pending docs; add may block if the pipeline is full. Version 0.26.2 release docs are the applicability target, not proof about a future dependency.

### [S-TANTIVY-TOKENIZERS-0262 — tokenizer module](https://docs.rs/tantivy/0.26.2/tantivy/tokenizer/index.html)

Version-pinned docs.rs. Default tokenizer splits on punctuation/whitespace, drops tokens longer than 40 characters and lowercases. en_stem adds English stemming, is slower, and is recommended for English recall. Custom Tokenizer / TokenFilter registration is supported. Applicability: default behavior alone is not proof of multilingual word segmentation.

### [S-TANTIVY-UPDATE-EXAMPLE-0262 — deleting/updating example](https://github.com/quickwit-oss/tantivy/blob/0.26.2/examples/deleting_updating_documents.rs)

Repository code pinned to the 0.26.2 tag. Lines 561–600 use a raw indexed stable id and mark it stored for results; lines 656–708 explain/update by delete_term(id)+add_document and commit+reader.reload. The example explicitly says Tantivy has no primary ID and does not enforce uniqueness; integrating with a key-value store is recommended. Adaptation: index a canonical ID but do not store title/body if they must remain authoritative elsewhere.

### [S-TANTIVY-CJK-ISSUE-718 — CJK query/parser report](https://github.com/quickwit-oss/tantivy/issues/718)

Historical issue opened 2019-11-29 and currently closed. The reporter described a query-parser/tokenizer mismatch when using a CJK segmenter, with manual tokenization as a workaround. Issue status/age prevents treating this as proof of a current 0.26.2 defect; it justifies a version-pinned indexing-plus-query test for each target script.

### [S-TANTIVY-CRASH-ISSUE-3079 — uncommitted segment files after crash](https://github.com/quickwit-oss/tantivy/issues/3079)

Open maintainer-tracked repository issue opened 2026-09-07. Its report describes writer-process termination before commit, with segment component files present but meta.json still showing no searchable segments/opstamp 0. This is issue evidence, not a general guarantee; applicability is to recovery/replay design: acknowledge the canonical outbox only after commit and replay uncommitted work after restart.

### [S-TANTIVY-WINDOWS-ISSUE-2847 — ManagedDirectory concurrent commit race](https://github.com/quickwit-oss/tantivy/issues/2847)

Open issue opened 2026-03-04 against Tantivy 0.25.0 / Windows 10/11 NTFS. Report describes a race between user commit and Tantivy’s internal merge thread on managed-file metadata. Applicability is conditional: if Tantivy is selected for Windows and commits are frequent, test the exact selected version and directory mode; do not assume the 0.25.0 report reproduces in 0.26.2.
