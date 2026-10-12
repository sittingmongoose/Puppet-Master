# Source index — D-R2-P04-treatment

Full identity, URLs, versions, access time, observed operation, conditions, and applicability are in [`../source-map.json`](../source-map.json). Stable IDs below are used by `discovery.md`; do not silently rebind them.

- **S01–S03, S12 — Apache Tika**: [release/runtime](https://tika.apache.org/download.html), [formats](https://tika.apache.org/docs/4.1.x/formats.html), [page OCR policy](https://tika.apache.org/docs/4.1.x/configuration/pages.html), [process-isolation guide](https://tika.apache.org/docs/4.1.x/using-tika/java-api/index.html), [security model](https://tika.apache.org/docs/4.1.x/security.html).
- **S04–S05 — extraction/OCR**: [Tesseract 5.5.3 manual](https://github.com/tesseract-ocr/tesseract/blob/5.5.3/doc/tesseract.1.asc), [PDFBox 3.0 FAQ](https://pdfbox.apache.org/3.0/faq.html).
- **S06–S07 — ranked retrieval**: [SQLite FTS5 reference](https://www.sqlite.org/fts5.html), [Tantivy 0.26.2 tokenizer](https://docs.rs/tantivy/0.26.2/tantivy/tokenizer/index.html) and [IndexWriter](https://docs.rs/tantivy/0.26.2/tantivy/indexer/struct.IndexWriter.html).
- **S08–S09 — semantic retrieval/deletion history**: [sqlite-vec repository](https://github.com/asg017/sqlite-vec), [v0.1.9 release](https://github.com/asg017/sqlite-vec/releases/tag/v0.1.9), [issue #274](https://github.com/asg017/sqlite-vec/issues/274).
- **S10–S11 — parser regression history**: [TIKA-4883](https://issues.apache.org/jira/browse/TIKA-4883), [fix and test diff #3145](https://github.com/apache/tika/pull/3145/files).
