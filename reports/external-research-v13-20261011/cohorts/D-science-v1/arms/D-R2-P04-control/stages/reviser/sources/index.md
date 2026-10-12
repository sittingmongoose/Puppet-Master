# Source index — reviser stage

Final source map for D-R2-P04-control. Stable IDs S01–S22 are carried forward without rebinding; S23–S25 are reviser-pass additions. Full release/commit context, locator, access time, observed operation, condition, and applicability are in [source-map.json](../source-map.json).

No parser, index, OCR engine, code sample, or upstream test was run in this stage. This navigable source index contains links and locators, not raw captures.

- [S01] [Tantivy 0.26.2 tokenizer documentation](https://docs.rs/tantivy/0.26.2/tantivy/tokenizer/index.html) — tantivy 0.26.2
- [S02] [Tantivy 0.26.2 IndexWriter documentation](https://docs.rs/tantivy/0.26.2/tantivy/indexer/struct.IndexWriter.html) — tantivy 0.26.2
- [S03] [Tantivy issue: Multi-Language Index?](https://github.com/quickwit-oss/tantivy/issues/2619) — Issue #2619, opened 2025-04-09; observed open in source page/search result on access date
- [S04] [Lindera tokenizer integration for Tantivy](https://docs.rs/lindera-tantivy/5.0.1/lindera_tantivy/tokenizer/index.html) — lindera-tantivy 5.0.1; docs.rs dependency listing observed Tantivy ^0.26.1
- [S05] [SQLite FTS5 documentation](https://www.sqlite.org/fts5.html) — SQLite FTS5 documentation, accessed 2026-10-12; docs do not expose a pinned SQLite build in this page
- [S06] [SQLite forum report on Polish Ł tokenization](https://sqlite.org/forum/info/e336faf90e60d53f?t=c) — SQLite forum discussion 2020-05-11 / maintainer reply 2021-01-11; release context 3.30.1 in report
- [S07] [lopdf 0.45.0 Document API](https://docs.rs/lopdf/0.45.0/lopdf/struct.Document.html) — lopdf 0.45.0
- [S08] [Tesseract command-line usage: TSV output](https://tesseract-ocr.github.io/tessdoc/Command-Line-Usage.html) — Official tessdoc main page, version not pinned in URL; current release notes separately list 5.5.3 (2026-07-24)
- [S09] [Tesseract regression report and fix history: issue #4014](https://github.com/tesseract-ocr/tesseract/issues/4014) — Issue #4014; regression bisected to commit 842cca1; fix PR #4136; issue says fixed in 5.3.3
- [S10] [OCRmyPDF v15.2.0 documentation snapshot](https://ocrmypdf.readthedocs.io/_/downloads/en/v15.2.0/pdf/) — OCRmyPDF documentation v15.2.0
- [S11] [ECMA-376 Office Open XML File Formats standard page](https://ecma-international.org/publications-and-standards/standards/ecma-376/) — 5th edition, December 2021; Part 2 adopted in the latest edition; other parts listed at their cited 2015/2016 editions
- [S12] [quick-xml 0.42.0 Reader documentation](https://docs.rs/quick-xml/0.42.0/quick_xml/reader/struct.Reader.html) — quick-xml 0.42.0
- [S13] [zip 8.6.0 ZipFile documentation](https://docs.rs/zip/8.6.0/zip/read/struct.ZipFile.html) — zip 8.6.0
- [S14] [W3C WebVTT specification](https://www.w3.org/TR/webvtt1/) — W3C WebVTT specification page observed 2026-10-12
- [S15] [OCRmyPDF sidecar regression history: issue #194](https://github.com/ocrmypdf/OCRmyPDF/issues/194) — Issue #194; regression in v5.4.1 fixed in v5.4.2 per maintainer; release note in v5 history
- [S16] [Tantivy 0.26.2 segment updater source and deletion test](https://github.com/quickwit-oss/tantivy/blob/0.26.2/src/indexer/segment_updater.rs) — Tantivy tag 0.26.2; commit hash not displayed on inspected source page
- [S17] [SQLite FTS5 Unicode61 tokenizer implementation](https://github.com/sqlite/sqlite/blob/master/ext/fts5/fts5_tokenize.c) — SQLite repository master as observed; exact commit hash was not exposed by the inspected source page (UNKNOWN)
- [S18] [SQLite upstream FTS5 Unicode tokenizer test](https://github.com/sqlite/sqlite/blob/master/ext/fts5/test/fts5unicode.test) — SQLite repository master as observed; exact commit hash was not exposed by the inspected source page (UNKNOWN)
- [S19] [lopdf 0.45.0 source and security/test changelog](https://docs.rs/crate/lopdf/0.45.0/source/CHANGELOG.md) — lopdf crate 0.45.0 (release date 2026-09-08); changelog includes 0.44.0 (2026-07-10)
- [S20] [Tesseract regression fix PR #4136](https://github.com/tesseract-ocr/tesseract/pull/4136) — Merged 2023-10-05 as commit 063ad31; fix targets regression from commit 842cca1 and issue #4014
- [S21] [Tantivy repository changelog (release-currentness check)](https://github.com/quickwit-oss/tantivy/blob/main/CHANGELOG.md) — main branch as observed; 0.27.0 appears as the first release heading; exact commit UNKNOWN
- [S22] [OCRmyPDF official releases page (release-currentness check)](https://github.com/ocrmypdf/OCRmyPDF/releases) — v17.13.0 listed latest; tag commit 1a1cfb5; release page excerpt shows 28 Sep 18:55, year not displayed in excerpt
- [S23] [Library of Congress SubRip (SRT) format description](https://www.loc.gov/preservation/digital/formats/fdd/fdd000569.shtml) — Format Description FDD000569; last significant update 2025-05-27; page status Preliminary; accessed 2026-10-12
- [S24] [OCRmyPDF 17.13.0 cookbook: sidecar text output](https://ocrmypdf.readthedocs.io/en/latest/cookbook.html) — OCRmyPDF docs 17.13.0 as served by latest docs; release page lists v17.13.0/tag commit 1a1cfb5 as latest at inspection [S22]
- [S25] [lopdf official changelog for v0.44.0 and v0.45.0](https://github.com/J-F-Liu/lopdf/blob/main/CHANGELOG.md) — Official main branch as accessed; changelog lists v0.45.0 (2026-09-08) and v0.44.0 (2026-07-10); exact main commit not exposed

## Reviser notes

- S14 confirms track-relative cue times but does not bind a supplied transcript to an audio revision.
- S19 critic-stage access uncertainty is retained as historical context and its changelog claims are rechecked through S25.
- S21 and S22 are release-currentness observations; they do not prove formal support or behavior transfer.
- S23 is a preliminary Library of Congress description, not an SRT standard or parser test.
- S24 checks OCRmyPDF 17.13.0 sidecar behavior in current documentation.
- S25 rechecks the scoped lopdf changelog history, not comprehensive PDF security.
