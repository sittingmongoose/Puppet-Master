# Source index — investigator stage

Bounded primary-source reading log for D-R2-P04-control. Entries map stable IDs to exact URLs, release/commit context, observed operation and applicability in ../source-map.json. S01–S15 were accessed 2026-10-12T04:21:14Z–04:22:33Z; S16–S20 were accessed 2026-10-12T04:22:33Z–04:27:15Z. Web documentation/issue excerpts were read; no source code, downloaded package, private attachment, OCR run, parser run, or search fixture was executed.

- [S01] Tantivy tokenizer defaults and custom tokenizer API — https://docs.rs/tantivy/0.26.2/tantivy/tokenizer/index.html
- [S02] Tantivy commit, rollback, and delete semantics — https://docs.rs/tantivy/0.26.2/tantivy/indexer/struct.IndexWriter.html
- [S03] Open mixed-language indexing question — https://github.com/quickwit-oss/tantivy/issues/2619
- [S04] Lindera tokenizer integration for Tantivy — https://docs.rs/lindera-tantivy/5.0.1/lindera_tantivy/tokenizer/index.html
- [S05] SQLite FTS5 tokenizer and table behavior — https://www.sqlite.org/fts5.html
- [S06] SQLite Unicode61 Polish Ł behavior — https://sqlite.org/forum/info/e336faf90e60d53f?t=c
- [S07] lopdf page extraction and decompression cap — https://docs.rs/lopdf/0.45.0/lopdf/struct.Document.html
- [S08] Tesseract TSV word/page geometry — https://tesseract-ocr.github.io/tessdoc/Command-Line-Usage.html
- [S09] Tesseract regression/fix case — https://github.com/tesseract-ocr/tesseract/issues/4014
- [S10] OCRmyPDF v15.2.0 sidecar behavior — https://ocrmypdf.readthedocs.io/_/downloads/en/v15.2.0/pdf/
- [S11] ECMA-376 OOXML scope and edition — https://ecma-international.org/publications-and-standards/standards/ecma-376/
- [S12] quick-xml namespace/encoding behavior — https://docs.rs/quick-xml/0.42.0/quick_xml/reader/struct.Reader.html
- [S13] ZIP member sizes and path warning — https://docs.rs/zip/8.6.0/zip/read/struct.ZipFile.html
- [S14] WebVTT cue timing and overlap — https://www.w3.org/TR/webvtt1/
- [S15] OCRmyPDF sidecar regression history — https://github.com/ocrmypdf/OCRmyPDF/issues/194

Research claims are deliberately bounded to the source/version scope in source-map.json. Issue reports are evidence of specific reported/fixed cases, not broad performance or accuracy guarantees. No raw page captures were retained.

- [S16] Tantivy 0.26.2 source and delete test — https://github.com/quickwit-oss/tantivy/blob/0.26.2/src/indexer/segment_updater.rs
- [S17] SQLite FTS5 Unicode61 implementation — https://github.com/sqlite/sqlite/blob/master/ext/fts5/fts5_tokenize.c
- [S18] SQLite upstream FTS5 Unicode test — https://github.com/sqlite/sqlite/blob/master/ext/fts5/test/fts5unicode.test
- [S19] lopdf 0.45.0 security/test changelog — https://docs.rs/crate/lopdf/0.45.0/source/CHANGELOG.md
- [S20] Tesseract regression fix PR #4136 — https://github.com/tesseract-ocr/tesseract/pull/4136
