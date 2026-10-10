# Independent primary evidence — A7-02 control v1

Return to [assessment.md](../assessment.md), [assessment.json](../assessment.json) and [source-map.json](../source-map.json). Original S01–S21 bindings are recorded without changing them; reviewer IDs R01–R21 reference fresh independent captures. R22–R24 are additional governing local-use evidence. All retrievals were read-only; no application, live metadata API query, downloaded code or test was executed. Raw captures document source bytes; their hashes do not decide semantics.

<a id="r01"></a>
## R01 — Zotero Duplicate Detection

[Primary source](https://www.zotero.org/support/duplicate_detection)

Version/commit: 2017-11-25 documentation; no app release pinned
Locator: Finding Duplicates / Merging Duplicates; numbered capture 64–70
Retrieved UTC: 2026-10-10T05:14:09.765601+00:00

Title/DOI/ISBN match or absence, publication years within one year, creator last name plus first initial; library-local candidates; no non-duplicate marking in served guide; master and alternative field values; merged tags/collections retained.

Judgment: SUPPORTED_WITH_STATED_VERSION_LIMIT. The final accurately describes served documentation, not a verified current algorithm. It recommends human review; neither similarity nor a duplicate list proves identity.

- [S01 numbered text](S01-numbered.txt); [raw source bytes](S01.html); SHA-256 `747a16916cc1542a451a02eeb5ade689a9cce7b0cdd861bfbaafe198b3e84123`; HTTP 200; [URL](https://www.zotero.org/support/duplicate_detection).

<a id="r02"></a>
## R02 — Zotero standardized import

[Primary source](https://www.zotero.org/support/kb/importing_standardized_formats)

Version/commit: 2018-11-04 documentation; no app release pinned
Locator: Format list; numbered capture 61–75
Retrieved UTC: 2026-10-10T05:14:09.767762+00:00

RIS, BibTeX, BibLaTeX and CSL JSON are listed import formats; file support alone does not demonstrate field fidelity or round-trip success.

Judgment: SUPPORTED. Common interchange support is enough to investigate an optional file; final retains actual mapping tests.

- [S02 numbered text](S02-numbered.txt); [raw source bytes](S02.html); SHA-256 `f814602970bbadab622da22833f77f78250a92c7de8b186afac716bbe10a19be`; HTTP 200; [URL](https://www.zotero.org/support/kb/importing_standardized_formats).

<a id="r03"></a>
## R03 — Zotero Quick Copy/export preferences

[Primary source](https://www.zotero.org/support/preferences/export)

Version/commit: 2024-10-27 documentation; no app release pinned
Locator: Quick Copy / Character Encoding; numbered capture 64–73
Retrieved UTC: 2026-10-10T05:14:09.770608+00:00

Output can be a citation style or bibliographic format. Text is default; dragging over 50 items can be disabled by its default threshold. Import encoding is auto-detected with manual override.

Judgment: SUPPORTED. Final uses the configurable mechanism without claiming unlimited drag capacity or default RIS. The threshold governs drag Quick Copy, not all bibliography exports.

- [S03 numbered text](S03-numbered.txt); [raw source bytes](S03.html); SHA-256 `0b22102eed5cdb738a150e09606d9a2e43d546da974f0e59365259721da9c514`; HTTP 200; [URL](https://www.zotero.org/support/preferences/export).

<a id="r04"></a>
## R04 — Zotero field mappings and loss

[Primary source](https://www.zotero.org/support/kb/field_mappings)

Version/commit: 2017-11-22 documentation; no app release pinned
Locator: Data loss and active-development warning; numbered capture 62–65
Retrieved UTC: 2026-10-10T05:14:09.772291+00:00

Whole-library transfer can lose word-processor links; RDF is least lossy; RIS/MODS can carry notes but do not carry attachment files or collections; mappings can become outdated.

Judgment: SUPPORTED_WITH_STATED_LIMIT. Final's warning does not forbid a public citation subset. It keeps provenance/version relations outside the interchange file and promises no lossless archive.

- [S04 numbered text](S04-numbered.txt); [raw source bytes](S04.html); SHA-256 `d9a5b05744430d1af17c45bd98dd602fedee13440d11f50b1e5f1cf7c633f3de`; HTTP 200; [URL](https://www.zotero.org/support/kb/field_mappings).

<a id="r05"></a>
## R05 — Zotero bibliography modes/date

[Primary source](https://www.zotero.org/support/creating_bibliographies)

Version/commit: 2025-12-12 documentation; no app release pinned
Locator: Quick Copy / right-click bibliography / footer; numbered capture 70–76 and 85
Retrieved UTC: 2026-10-10T05:14:09.886472+00:00

Quick Copy supports BibTeX and RIS. Styled bibliography has RTF, HTML, clipboard and print output. The footer date is 2025-12-12.

Judgment: SUPPORTED; ORIGINAL_WORDING_CORRECTED. The critic's documentation-date correction is justified. Styled output and manager interchange remain distinct operations.

- [S05 numbered text](S05-numbered.txt); [raw source bytes](S05.html); SHA-256 `8726f0138b69baaef1a5c2c0b0cf38f49ab2660a557098338d9e8ef587a86ace`; HTTP 200; [URL](https://www.zotero.org/support/creating_bibliographies).

<a id="r06"></a>
## R06 — JabRef duplicate candidates

[Primary source](https://docs.jabref.org/finding-sorting-and-cleaning-entries/findduplicates)

Version/commit: Living documentation, retrieved 2026-10-10; not pinned to beta
Locator: Detection / Selecting which entry to keep; numbered capture 43–67
Retrieved UTC: 2026-10-10T05:14:09.887652+00:00

Edit distance gives additional weight to author/editor/title/journal. Choices include left/right/both/merged. Exact duplicate automatic removal is an offered action; keep-merged removes prior entries.

Judgment: SUPPORTED_WITH_STATED_VERSION_LIMIT. Final does not convert offered exact removal to a mandated automatic policy; preserved source text is a separate local design.

- [S06 numbered text](S06-numbered.txt); [raw source bytes](S06.html); SHA-256 `52a9fcc026838de638efae0d70fbbf159c3ce02988444dc07ebb44672141e8aa`; HTTP 200; [URL](https://docs.jabref.org/finding-sorting-and-cleaning-entries/findduplicates).

<a id="r07"></a>
## R07 — JabRef field merge

[Primary source](https://docs.jabref.org/finding-sorting-and-cleaning-entries/mergeentries)

Version/commit: Living documentation; no current app release pinned
Locator: Selecting two records / field controls; numbered capture 43–66
Retrieved UTC: 2026-10-10T05:14:09.914739+00:00

User selects two entries; compares/chooses values or manually edits; selected fields can combine groups/keywords/comments/files; Merge or Cancel remains explicit.

Judgment: SUPPORTED. A manager merge is not an immutable audit log. The final correctly supplies a retained submission/provenance model as a local choice.

- [S07 numbered text](S07-numbered.txt); [raw source bytes](S07.html); SHA-256 `49b97d1c6869d6a4e0f23ef83626acaa389d1d82a0c223ee4d3e0ad0eae3b8ef`; HTTP 200; [URL](https://docs.jabref.org/finding-sorting-and-cleaning-entries/mergeentries).

<a id="r08"></a>
## R08 — JabRef identifier enrichment defaults

[Primary source](https://docs.jabref.org/finding-sorting-and-cleaning-entries/getbibtexdatafromdoi)

Version/commit: Living documentation; illustrative image mentions 5.2, not a version pin
Locator: Identifier discovery and DOI/ISBN completion; numbered capture 44–56
Retrieved UTC: 2026-10-10T05:14:09.935449+00:00

Identifier discovery needs sufficient accurate input and can fail. DOI/ISBN completion is disabled without an identifier. Original left fields are default; missing fields obtain DOI values in a merge view; final Merge/Cancel is explicit. Full-text search is a separate route.

Judgment: SUPPORTED. Final keeps lookup and editor approval distinct and does not misapply the identifier-completion prerequisite to separate DOI-less bibliographic search.

- [S08 numbered text](S08-numbered.txt); [raw source bytes](S08.html); SHA-256 `69431f5e149d8754db6e3d8cfa5b7a8b441c34a8e69e5efa79d059f04a37443d`; HTTP 200; [URL](https://docs.jabref.org/finding-sorting-and-cleaning-entries/getbibtexdatafromdoi).

<a id="r09"></a>
## R09 — JabRef CLI import/export

[Primary source](https://docs.jabref.org/advanced/commandline)

Version/commit: Served docs say since 5.0; installed build not chosen
Locator: Basics and Import/Export options; numbered capture 49 and 95–109
Retrieved UTC: 2026-10-10T05:14:09.961127+00:00

File conversion can run without GUI. -o defaults to BibTeX unless a filter is named. Import precedes export; without -i, last successfully loaded file is exported. One -i/-o file; a same-name custom filter takes precedence.

Judgment: SUPPORTED_AS_LIVING_DOCS. Final recommends a version-pinned conversion option, not a command run or beta CLI guarantee. No field/default/unit is overgeneralized.

- [S09 numbered text](S09-numbered.txt); [raw source bytes](S09.html); SHA-256 `f5b5b6af0b99c50e4c561133d65e6b95144c56ea352d9fa90fd4a00aa789f0ca`; HTTP 200; [URL](https://docs.jabref.org/advanced/commandline).

<a id="r10"></a>
## R10 — JabRef beta release and CSL opportunity

[Primary source](https://github.com/JabRef/jabref/releases/tag/v6.0-beta.1)

Version/commit: v6.0-beta.1, 3992b12; 2026-09-21T20:19:44Z; prerelease
Locator: Release heading/commit and compatibility change; numbered capture 111–131 and 161; HTML relative-time
Retrieved UTC: 2026-10-10T05:14:10.171383+00:00

Release is beta/prerelease. Zotero Compatibility Mode is a preference for CSL citations emitted/read through LibreOffice, not general RIS fidelity.

Judgment: SUPPORTED. Conditional first testing and the alternative are reasonable. Chronology alone does not prove all alpha fixes survived; the final retains chosen-build validation.

- [S10 numbered text](S10-numbered.txt); [raw source bytes](S10.html); SHA-256 `15e4cff9b9052cab18cc221eb3007a8c967ee6ab41a5d257b525ade220ed2282`; HTTP 200; [URL](https://github.com/JabRef/jabref/releases/tag/v6.0-beta.1).

<a id="r11"></a>
## R11 — JabRef issue #15106

[Primary source](https://github.com/JabRef/jabref/issues/15106)

Version/commit: Reported 2026-02-13 on 5.15, GNU/Linux, Ubuntu 24.04.4 LTS
Locator: Issue description and closure; numbered capture 126–141 and 260
Retrieved UTC: 2026-10-10T05:14:10.210447+00:00

BibTeX pages 13905--13911 exported the complete normalized range into both RIS SP and EP; reporter says single '-' behaved correctly. Closed through #15315 on 2026-03-13.

Judgment: SUPPORTED_AS_REPORTED_CASE. The final names the affected operation, fields, input and reported version. It does not claim all releases/fields/records fail.

- [S11 numbered text](S11-numbered.txt); [raw source bytes](S11.html); SHA-256 `2aa39e47f3a8c7b5aea822d6aaa4ee7b7b847a59447f84ba3a5208ffc615590e`; HTTP 200; [URL](https://github.com/JabRef/jabref/issues/15106).

<a id="r12"></a>
## R12 — JabRef PR #15315

[Primary source](https://github.com/JabRef/jabref/pull/15315)

Version/commit: Merged to main 2026-03-13 at d687c08
Locator: PR description/test instructions and merge queue; numbered capture 134–140 and 894–896
Retrieved UTC: 2026-10-10T05:14:10.285591+00:00

Old helpers only split ASCII; change adds en/em dash. PR links #15106 and gives SP=13905/EP=13911 test instructions. Merge queue says d687c08 and 49/50 checks passed.

Judgment: SUPPORTED_WITH_ORACLE_LIMIT. Externally reported tests/check counts are not local semantic validation. Normalization between BibTeX and RIS matters; final explicitly preserves that check.

- [S12 numbered text](S12-numbered.txt); [raw source bytes](S12.html); SHA-256 `aa11a1f0a6dfd8063a2236dd75fff3c47acaf2fe2fdcb65ed64f967472d30f0f`; HTTP 200; [URL](https://github.com/JabRef/jabref/pull/15315).

<a id="r13"></a>
## R13 — Crossref public API coverage/query

[Primary source](https://www.crossref.org/documentation/retrieve-metadata/rest-api/)

Version/commit: Living documentation; no API schema version or service deployment pinned
Locator: REST API description and endpoints; numbered capture 300–324
Retrieved UTC: 2026-10-10T05:14:10.290170+00:00

JSON metadata comes from members/trusted sources; no signup needed; /works search and /works/{doi} record retrieval concern Crossref records, not all DOI agencies or scholarly objects.

Judgment: SUPPORTED. A no-match is correctly treated as provider non-return, never invalidity/nonexistence. Broad bibliographic search is a realistic DOI-less candidate path.

- [S13 numbered text](S13-numbered.txt); [raw source bytes](S13.html); SHA-256 `7fa3b2fcca9134b850c9f433516e4bedbf44b304d0cc914ecb615c72962875f8`; HTTP 200; [URL](https://www.crossref.org/documentation/retrieve-metadata/rest-api/).

<a id="r14"></a>
## R14 — Crossref access/limits

[Primary source](https://www.crossref.org/documentation/retrieve-metadata/rest-api/access-and-authentication/)

Version/commit: Documentation updated 2025-10-16; limits are operational/header-dependent
Locator: Access modes / Request limits / Best practice; numbered capture 303–338
Retrieved UTC: 2026-10-10T05:14:10.399767+00:00

Public access needs no authentication/identification. Polite mode supplies email through mailto or agent header; Plus is keyed/premium. Rate and interval headers and concurrency header govern requests. 429 calls for lower rate/concurrency; cache responses. Table values have no fixed interval stated in its cells.

Judgment: SUPPORTED. Final does not invent a requests-per-second quota, conflate public with polite, or require an account. Lead email/provider choice is an honest policy decision.

- [S14 numbered text](S14-numbered.txt); [raw source bytes](S14.html); SHA-256 `b5629e0f250e6d6d181fdf3368198b51de845c860cb2f106b2829d599036eeb3`; HTTP 200; [URL](https://www.crossref.org/documentation/retrieve-metadata/rest-api/access-and-authentication/).

<a id="r15"></a>
## R15 — Crossref efficient API use

[Primary source](https://www.crossref.org/documentation/retrieve-metadata/rest-api/tips-for-using-the-crossref-rest-api/)

Version/commit: Living documentation, retrieved 2026-10-10
Locator: Rows/cursors and bulk-query cautions; numbered capture 329–339
Retrieved UTC: 2026-10-10T05:14:10.497439+00:00

Choose small useful result sets; cache; large queries can change due to reindexing; 429 requires backoff. These bulk conditions are not a claim that small pilot lookup always succeeds.

Judgment: SUPPORTED. The final's smallest-request/caching advice is bounded and not reported as an API check.

- [S15 numbered text](S15-numbered.txt); [raw source bytes](S15.html); SHA-256 `4df4eca3812c8bcc76307855e4a39e513833dd26b8c4ebca1df94c22363a9bc9`; HTTP 200; [URL](https://www.crossref.org/documentation/retrieve-metadata/rest-api/tips-for-using-the-crossref-rest-api/).

<a id="r16"></a>
## R16 — Crossref typed relations and identifiers

[Primary source](https://www.crossref.org/documentation/schema-library/markup-guide-metadata-segments/relationships/)

Version/commit: Living relation-schema guide; schema release not pinned
Locator: Vocabulary / General typed relations; numbered capture 322–340 and 372–394
Retrieved UTC: 2026-10-10T05:14:10.612475+00:00

Intra-work relation names include isPreprintOf/hasPreprint, isVersionOf/hasVersion, variant and manifestation. A typed relation can target another agency's DOI or non-DOI identifier. Missing DOI causes deposit failure; non-DOI identifiers are unverified. DOI deposits create reciprocal relations; the second item's own metadata need not assert it.

Judgment: SUPPORTED_WITH_PROVIDER_DOMAIN. Final uses an analogy and source-conditioned asserted links, not universal deduplication or consumer truth. Related manifestations remain separate.

- [S16 numbered text](S16-numbered.txt); [raw source bytes](S16.html); SHA-256 `21e3f0918322210b44fbfcd0efcf087007e2ff03c525539209251f5a8620d1ba`; HTTP 200; [URL](https://www.crossref.org/documentation/schema-library/markup-guide-metadata-segments/relationships/).

<a id="r17"></a>
## R17 — Crossref posted-content schema

[Primary source](https://www.crossref.org/documentation/schema-library/markup-guide-record-types/posted-content-includes-preprints/)

Version/commit: posted_content from schema 4.4.0; version/status from 5.4.0; served page 2025-07-12
Locator: Purpose, metadata and AAM/VoR relations; numbered capture 303–350
Retrieved UTC: 2026-10-10T05:14:10.718626+00:00

Guide concerns member direct XML deposits; helper tools cannot register this record type. Preprint is a type enumeration. Status values are withdrawn/removed; version number/description and status are 5.4.0 additions. isPreprintOf links to AAM/VoR. Cited-by posted content inclusion defaults off, a different operation.

Judgment: SUPPORTED_WITH_EXACT_TYPE_DOMAIN. Final does not assert that volunteers can deposit or that every repository supplies these fields. Its local publication-kind labels are not claimed as Crossref status enum values; Cited-by default is inapplicable to proposed REST lookup.

- [S17 numbered text](S17-numbered.txt); [raw source bytes](S17.html); SHA-256 `429fb86acef76385341f20a73501be9554c07f4d1532714d5a0e5616791ac975`; HTTP 200; [URL](https://www.crossref.org/documentation/schema-library/markup-guide-record-types/posted-content-includes-preprints/).

<a id="r18"></a>
## R18 — Crossref preprint obligations/notification

[Primary source](https://www.crossref.org/documentation/research-nexus/posted-content-includes-preprints/)

Version/commit: Living documentation, page 2024-04-01
Locator: Obligations / Associating preprints; numbered capture 303–333
Retrieved UTC: 2026-10-10T05:14:10.886555+00:00

Accepted manuscripts are not posted content. Crossref's preprint-provider rules use separate version DOIs/isVersionOf, above-fold label/link, and relationship updates after notification. Title/first-author matches are emailed review suggestions to the depositor.

Judgment: SUPPORTED_WITH_PROVIDER_SCOPE. The final does not impose member deposit duties on the volunteer group or declare a universal DOI rule. Absent relations remain inconclusive.

- [S18 numbered text](S18-numbered.txt); [raw source bytes](S18.html); SHA-256 `b5b3b4b59f3d49143dfd2a4b644e41d6ebdf89495af0b4feb56fd97c29b043da`; HTTP 200; [URL](https://www.crossref.org/documentation/research-nexus/posted-content-includes-preprints/).

<a id="r19"></a>
## R19 — Crossref historical matching strategy/dataset

[Primary source](https://www.crossref.org/blog/discovering-relationships-between-preprints-and-journal-articles/)

Version/commit: Official post 2023-12-07; dataset records through 2023-08-31
Locator: Introduction vs Matching strategy vs dataset; numbered capture 88–101, 119–139
Retrieved UTC: 2026-10-10T05:14:10.932107+00:00

The historical notification method uses exact title/first author. The same post introduces a newer bibliographic-query/fuzzy-title/author/year heuristic, explicit candidate thresholds, and an experimental journal-DOI-to-preprint API. Dataset filtering is posted-content subtype preprint and journal-article with both sides present by August 2023.

Judgment: SUPPORTED_SELECTIVE_SUMMARY / BREADTH_LIMIT. Final's review-cue/incomplete-coverage conclusion is supported. It does not claim dataset performance or the new method as current production behavior; it leaves useful newer mechanism detail unexplored.

- [S19 numbered text](S19-numbered.txt); [raw source bytes](S19.html); SHA-256 `2d28876ef39de2593a35e0eb2c93e9cffb4ce7e08f54dfdaf6ae58754fd11e79`; HTTP 200; [URL](https://www.crossref.org/blog/discovering-relationships-between-preprints-and-journal-articles/).

<a id="r20"></a>
## R20 — JabRef alpha.6 fix release

[Primary source](https://github.com/JabRef/jabref/releases/tag/v6.0-alpha.6)

Version/commit: v6.0-alpha.6, 6d24100; 2026-05-14T19:46:35Z; prerelease
Locator: Release header/commit and Fixed #15106; numbered capture 111–131 and 193
Retrieved UTC: 2026-10-10T05:14:10.988382+00:00

Official prerelease note identifies the RIS full-range duplication into start/end fields as fixed and links #15106.

Judgment: SUPPORTED_AS_RELEASED_FIX_RECORD. Evidence of released fix intent/history, not this proposal's exporter run and not proof of arbitrary record correctness.

- [S20 numbered text](S20-numbered.txt); [raw source bytes](S20.html); SHA-256 `e4a396baa89c48d889951a96936fbabb4866912d762eedffcdb604c9fbf434ac`; HTTP 200; [URL](https://github.com/JabRef/jabref/releases/tag/v6.0-alpha.6).

<a id="r21"></a>
## R21 — JabRef formatter source/test domain

[Primary source](https://raw.githubusercontent.com/JabRef/jabref/d687c08/jablib/src/main/java/org/jabref/logic/layout/format/FirstPage.java)

Version/commit: Raw text at merge commit d687c08
Locator: FirstPage/LastPage format methods and FirstPageTest/LastPageTest provide arguments; all four captures complete
Retrieved UTC: 2026-10-10T05:14:11.029471+00:00

Regex splits spaces, ASCII hyphen and U+2013/U+2014. FirstPage takes first only for exactly two parts, otherwise input; LastPage takes last for two, first for other nonempty parts, empty for null/no parts. Tests cover 345 ASCII single/double ranges and 13905 Unicode ranges including spaced en dash.

Judgment: SUPPORTED_WITH_HELPER_ONLY_ORACLE. Final accurately limits tests to helpers and names full RIS normalization/export as unrun. It does not generalize to discontinuous ranges or every page field.

- [S21 numbered text](S21-numbered.txt); [raw source bytes](S21.txt); SHA-256 `4e74dd66977f450dfda8bd2aa9ef779e6b5dbaa405b9c7df280adf0f15fdde37`; HTTP 200; [URL](https://raw.githubusercontent.com/JabRef/jabref/d687c08/jablib/src/main/java/org/jabref/logic/layout/format/FirstPage.java).

- [S21-1 numbered text](S21-1-numbered.txt); [raw source bytes](S21-1.txt); SHA-256 `a589b4b6df3c2ccfdc41584b3fe58bb05b9feeb50f43dd5cdd6b4eea8a674f8b`; HTTP 200; [URL](https://raw.githubusercontent.com/JabRef/jabref/d687c08/jablib/src/main/java/org/jabref/logic/layout/format/LastPage.java).

- [S21-2 numbered text](S21-2-numbered.txt); [raw source bytes](S21-2.txt); SHA-256 `15c6f4090ac25e2921b06ae8ca10858c27d5aca5bf1762083858f88ade94db57`; HTTP 200; [URL](https://raw.githubusercontent.com/JabRef/jabref/d687c08/jablib/src/test/java/org/jabref/logic/layout/format/FirstPageTest.java).

- [S21-3 numbered text](S21-3-numbered.txt); [raw source bytes](S21-3.txt); SHA-256 `142d7c84ce25a41ef4d80fe80c01ab68ecb2e400d25ba34d22232cebe1b83862`; HTTP 200; [URL](https://raw.githubusercontent.com/JabRef/jabref/d687c08/jablib/src/test/java/org/jabref/logic/layout/format/LastPageTest.java).

<a id="r22"></a>
## R22 — Zotero Privacy Policy

[Primary source](https://www.zotero.org/support/privacy)

Version/commit: Living page updated 2026-05-18
Locator: Data We Collect / Disabling Automatic Requests
Retrieved UTC: 2026-10-10T05:17:00.635759+00:00

Local data and account-free use are documented; sync is optional and initially disabled. Attachment retrieval is a separate automatic setting which can be disabled. Final metadata-only/no-account policy is feasible; it is not a claim that unconfigured capture defaults were tested safe.

Judgment: SUPPORTED_WITH_CONDITIONS. Independently retrieved additional governing evidence for consequential local/manual/no-account recommendations. No candidate feedback or repair supplied.

- [R22 numbered text](R22-numbered.txt); [raw source bytes](R22.html); SHA-256 `aaec18ba26288b1c92416a8613f2e1427aa5faa6214c7acca41801dff3f01839`; HTTP 200; [URL](https://www.zotero.org/support/privacy).

<a id="r23"></a>
## R23 — Zotero Syncing

[Primary source](https://www.zotero.org/support/sync)

Version/commit: Living page updated 2026-06-17
Locator: Opening paragraph and Data Syncing
Retrieved UTC: 2026-10-10T05:17:00.743152+00:00

Local storage is default; enabling server data sync requires a Zotero account. File sync is a distinct operation. The proposal leaves sync unconfigured and does not require contributor accounts.

Judgment: SUPPORTED_WITH_CONDITIONS. Independently retrieved additional governing evidence for consequential local/manual/no-account recommendations. No candidate feedback or repair supplied.

- [R23 numbered text](R23-numbered.txt); [raw source bytes](R23.html); SHA-256 `1a9f45b49bac152455c813e60b60a222cd8d4a0f754be57807c6f87ebe363224`; HTTP 200; [URL](https://www.zotero.org/support/sync).

<a id="r24"></a>
## R24 — JabRef Getting Started

[Primary source](https://docs.jabref.org/getting-started)

Version/commit: Living documentation; no application release pinned
Locator: Creation of a new library / entry creation
Retrieved UTC: 2026-10-10T05:17:00.837384+00:00

The library is a text-based BibTeX file by default and can be created through File > New library with manual bibliographic entry. Supports the proposed local/manual workflow; actual field behavior remains unrun.

Judgment: SUPPORTED_WITH_CONDITIONS. Independently retrieved additional governing evidence for consequential local/manual/no-account recommendations. No candidate feedback or repair supplied.

- [R24 numbered text](R24-numbered.txt); [raw source bytes](R24.html); SHA-256 `e79bacdeb312565485d8da8c1f51688e81294b712be1695ce898f5031c73335b`; HTTP 200; [URL](https://docs.jabref.org/getting-started).

## Supplementary original lineage navigation

[Draft-to-final diff](draft-to-final.diff) records textual changes without modifying originals. Semantic preservation is assessed against the full files, not inferred from diff size or a hash.

## Tool-returned independent web extracts

The following captures preserve the independent web retrieval results; source claims are governed by the actual primary URLs and saved source text, not by tool reference IDs.

- [evidence_code.json](evidence_code.json)

- [evidence_conditions.json](evidence_conditions.json)

- [evidence_context.json](evidence_context.json)

- [evidence_crossref.json](evidence_crossref.json)

- [evidence_deepconditions.json](evidence_deepconditions.json)

- [evidence_history.json](evidence_history.json)

- [evidence_jabref_docs.json](evidence_jabref_docs.json)

- [evidence_local_primary.json](evidence_local_primary.json)

- [evidence_local_use.json](evidence_local_use.json)

- [evidence_zotero.json](evidence_zotero.json)
