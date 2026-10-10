# Reviser source index

This navigable index preserves the stable source IDs used by the investigator and critic. S01–S14 retain their original bindings; S15 is an additive record for the merged PR directly linked to issue #29. Full identity and evidence records are in [source-map.json](../source-map.json). No source ID is silently rebound. Source retrieval is research evidence, not product validation.

| ID | Primary source | Use in the final proposal |
|---|---|---|
| [#s01](#s01) | [Guidelines for Embedding Metadata in Broadcast WAVE Files](https://www.digitizationguidelines.gov/audio-visual/documents/BWF_Embed_Guideline_v3_2021.pdf) | Direct guidance for any optional BWF embedding; not a mandate to modify volunteer originals or adopt all fields. |
| [#s02](#s02) | [Broadcast WAVE Audio File Format, Version 1 (Library of Congress Sustainability of Digital Formats)](https://www.loc.gov/preservation/digital/formats/fdd/fdd000356.shtml) | Explains tradeoffs between embedded BWF fields, general playback, and separate accessible transcript. |
| [#s03](#s03) | [BWF MetaEdit README](https://github.com/MediaArea/BWFMetaEdit) | Candidate for staff-only optional metadata enrichment/validation on a copy; supports a separate audio-bitstream check. |
| [#s04](#s04) | [BWF MetaEdit GUI release history](https://github.com/MediaArea/BWFMetaEdit/blob/master/History_GUI.txt) | Evidence that encoding handling changed across releases and must be version-pinned/tested in this workflow. |
| [#s05](#s05) | [BWF MetaEdit issue #29: non 7-bit ASCII](https://github.com/MediaArea/BWFMetaEdit/issues/29) | Illustrates punctuation/legacy-encoding risk for names, notes and embedded metadata round-trips. |
| [#s06](#s06) | [RFC 8493 — The BagIt File Packaging Format (V1.0)](https://www.rfc-editor.org/rfc/rfc8493/) | Portable, format-agnostic transfer envelope for audio, photos, notes, transcripts and access copies. |
| [#s07](#s07) | [PREMIS Data Dictionary for Preservation Metadata, Version 3.0](https://www.loc.gov/standards/premis/v3/) | Optional pattern for transcript revisions, derivation links and operator/tool/date/outcome logs; can be simplified for pilot. |
| [#s08](#s08) | [Transcribing Interviews — Veterans History Project, Library of Congress](https://www.loc.gov/programs/veterans-history-project/how-to-participate/transcribing-interviews/) | Oral-history-specific support for optional transcript, separate revisions and provenance notes. |
| [#s09](#s09) | [Making Audio and Video Media Accessible — W3C WAI](https://www.w3.org/WAI/media/av/) | Supports separate transcript and listening interface checks; does not define a preservation format or require a particular codec. |
| [#s10](#s10) | [Oral History Resources / OHMS — University of Kentucky Libraries Nunn Center](https://libraries.uky.edu/locations/special-collections-research-center/louie-b-nunn-center-oral-history/nunn-center-resources) | Useful unfamiliar oral-history access approach; possible later pilot access layer. |
| [#s11](#s11) | [OHMS Viewer repository and releases](https://github.com/uklibraries/ohms-viewer/releases) | Evidence that OHMS has a hosting/customization burden and that player/media linkage needs testing. |
| [#s12](#s12) | [Digital Preservation at the Library of Congress](https://wwws.loc.gov/preservation/digital/index.html) | Confirms concrete freely available tools associated with the two workflows. |
| [#s13](#s13) | [WAVE Audio File Format — Library of Congress Sustainability of Digital Formats](https://www.loc.gov/preservation/digital/formats/fdd/fdd000001.shtml) | Supports inspection of actual format/codec before proposing copy/transcode or lossless claims. |
| [#s14](#s14) | [Recommended Formats Statement — Audio Works, Library of Congress](https://www.loc.gov/preservation/resources/rfs/audio.html) | A preservation-format reference for optional access/derivative choices; not a reason to reject varied volunteer submissions or alter them. |
| [#s15](#s15) | [Implement same behavior in GUI as in CLI about text with accents — Pull Request #34](https://github.com/MediaArea/BWFMetaEdit/pull/34) | Adds a precise historical link for the non-ASCII/GUI discrepancy behind issue #29; helps bound the later 20.05 ASCII-support release entry. |

## S01

**Guidelines for Embedding Metadata in Broadcast WAVE Files**

- **Exact URL:** https://www.digitizationguidelines.gov/audio-visual/documents/BWF_Embed_Guideline_v3_2021.pdf
- **Version/commit:** FADGI Audio-Visual Working Group, Version 3, approved 2021-04-26
- **Locator:** PDF pp. 2–3 change list; pp. 6–10 bext fields; pp. 19–21 INFO; p. 26 CSET/code page
- **Original access UTC:** 2026-10-10 04:21–04:22 UTC
- **Original observed operation:** web search/open; PDF parsed as text; locator lines included p.0–p.26
- **Governing condition/default/exception:** BEXT Originator/OriginatorReference/Description are strongly recommended, with bounded lengths; OriginationDate is applied as file creation date and local archival timezone; INFO fields have individual recommended/optional labels. CSET is optional; absent or zero defaults to ISO 8859/1 for internal metadata text.
- **Applicability:** Direct guidance for any optional BWF embedding; not a mandate to modify volunteer originals or adopt all fields.
- **Limitations:** Guideline is 2021; it does not establish support in every recorder/player.
- **Reviser access UTC window:** 2026-10-10T04:39:55Z–2026-10-10T04:42:30Z
- **Reviser observed operation:** Direct-opened the official FADGI PDF and inspected field, code-page and reader-version passages; page-specific request timestamps were not exposed.
- **Per-request timestamp:** UNKNOWN; the native web tool returned page content but not a per-request UTC timestamp.

## S02

**Broadcast WAVE Audio File Format, Version 1 (Library of Congress Sustainability of Digital Formats)**

- **Exact URL:** https://www.loc.gov/preservation/digital/formats/fdd/fdd000356.shtml
- **Version/commit:** FDD fdd000356; last significant update 2024-04-23
- **Locator:** Description and file structure; Sustainability factors; Self-documentation and accessibility notes; LC experience/preference
- **Original access UTC:** 2026-10-10 04:21 UTC
- **Original observed operation:** web search/open; lines 52–65 and result text
- **Governing condition/default/exception:** BWF is WAVE plus required bext; ordinary WAV-capable software may render audio without exposing BWF metadata; embedded ltxt transcription text is not necessarily structured or screen-reader tagged.
- **Applicability:** Explains tradeoffs between embedded BWF fields, general playback, and separate accessible transcript.
- **Limitations:** LoC practice and preferences are reference points, not binding requirements for this society.
- **Reviser access UTC window:** 2026-10-10T04:39:55Z–2026-10-10T04:42:30Z; 2026-10-10T04:42:43Z–2026-10-10T04:42:44Z
- **Reviser observed operation:** Direct-opened the LoC FDD and inspected its ltxt accessibility qualification, normal rendering, codec-dependent fidelity and file extension passages.
- **Per-request timestamp:** UNKNOWN; the native web tool returned page content but not a per-request UTC timestamp.

## S03

**BWF MetaEdit README**

- **Exact URL:** https://github.com/MediaArea/BWFMetaEdit
- **Version/commit:** Repository master README, version not pinned by observed page; retrieved 2026-10-10
- **Locator:** Feature list: import/edit/embed/export, validate, audio-only MD5 on WAVE data chunk
- **Original access UTC:** 2026-10-10 04:21 UTC
- **Original observed operation:** web search; GitHub page rendered
- **Governing condition/default/exception:** Tool functions apply to WAVE/BWF files it can read; its MD5 feature is explicitly for the data chunk/audio bitstream, not a full-file digest.
- **Applicability:** Candidate for staff-only optional metadata enrichment/validation on a copy; supports a separate audio-bitstream check.
- **Limitations:** README is on a mutable branch; no local install or behavior test was performed.
- **Reviser access UTC window:** 2026-10-10T04:42:43Z–2026-10-10T04:42:44Z; 2026-10-10T04:43:06Z–2026-10-10T04:43:07Z
- **Reviser observed operation:** Direct-opened the official MediaArea repository README and inspected its stated BWF operations and data-chunk-only MD5 scope.
- **Per-request timestamp:** UNKNOWN; the native web tool returned page content but not a per-request UTC timestamp.

## S04

**BWF MetaEdit GUI release history**

- **Exact URL:** https://github.com/MediaArea/BWFMetaEdit/blob/master/History_GUI.txt
- **Version/commit:** Observed entries: 20.05 (2020-05-28), 20.08 (2020-08-11), 23.04 (2023-04-10), 25.04 (2025-04-30); source file on mutable master
- **Locator:** Raw History_GUI.txt on mutable master: lines 6–15 (26.08/25.04), 42–47 (23.04), 91–113 (20.08/20.05), especially line 112: Improve ASCII support (Issue #29, #63). Commit hash UNKNOWN.
- **Original access UTC:** 2026-10-10 04:21–04:22 UTC
- **Original observed operation:** web search/open/find; inspected version history
- **Governing condition/default/exception:** 20.05 (2020-05-28) explicitly references Issue #29 in its ASCII-support entry. 23.04 adds read/write support for named legacy encodings and CSET; 25.04 adds ISO8859-1 fallback when reading core files. These are tool-specific release notes, not universal inter-tool round-trip proof.
- **Applicability:** Evidence that encoding handling changed across releases and must be version-pinned/tested in this workflow.
- **Limitations:** No actual BWF file was tested; historical release notes do not establish current installed version.
- **Reviser access UTC window:** 2026-10-10T04:39:55Z–2026-10-10T04:42:30Z; 2026-10-10T04:43:06Z–2026-10-10T04:43:07Z
- **Reviser observed operation:** Direct-opened the official raw History_GUI.txt on mutable master; inspected 20.05, 23.04, 25.04 and current 26.08 entries. Exact per-page request timestamps were not exposed.
- **Per-request timestamp:** UNKNOWN; the native web tool returned page content but not a per-request UTC timestamp.

## S05

**BWF MetaEdit issue #29: non 7-bit ASCII**

- **Exact URL:** https://github.com/MediaArea/BWFMetaEdit/issues/29
- **Version/commit:** Issue #29 opened 2017-10-18; shown closed 2020-04-08 and linked to merged PR #34. Issue ID #29.
- **Locator:** Issue description lines 129–177 (reported quote bytes 0x93/0x94 and GUI/CLI behavior); activity lines 187–200 and PR #34 link.
- **Original access UTC:** 2026-10-10 04:22 UTC
- **Original observed operation:** web open/find on issue page
- **Governing condition/default/exception:** A report describes non-7-bit ASCII/locale-dependent behavior. Issue closure and a related merged change establish issue/release linkage, not proof that every curly-quote case or downstream reader now round-trips the same bytes.
- **Applicability:** Illustrates punctuation/legacy-encoding risk for names, notes and embedded metadata round-trips.
- **Limitations:** No tested resolution was tied to this issue during research.
- **Reviser access UTC window:** 2026-10-10T04:39:55Z–2026-10-10T04:42:30Z; 2026-10-10T04:43:06Z–2026-10-10T04:43:07Z
- **Reviser observed operation:** Direct-opened issue #29 and inspected its report, state and PR #34 link. Direct-opened linked PR #34 and inspected merge status, title, commits and issue link. The official issue page linked merged PR #34; issue activity showed closure.
- **Per-request timestamp:** UNKNOWN; the native web tool returned page content but not a per-request UTC timestamp.

## S06

**RFC 8493 — The BagIt File Packaging Format (V1.0)**

- **Exact URL:** https://www.rfc-editor.org/rfc/rfc8493/
- **Version/commit:** IETF RFC 8493, October 2018, BagIt 1.0
- **Locator:** §2.1.2 payload; §2.1.3 payload manifest; §2.2 tag files
- **Original access UTC:** 2026-10-10 04:21 UTC
- **Original observed operation:** web search/open; RFC text parsed
- **Governing condition/default/exception:** Bag MUST include data/ and at least one payload manifest; manifest lists every payload path and checksum; payload is treated as opaque octets for verification. Tag files use declared character encoding; bagit.txt UTF-8 without BOM.
- **Applicability:** Portable, format-agnostic transfer envelope for audio, photos, notes, transcripts and access copies.
- **Limitations:** Checksums establish integrity relative to the manifest, not descriptive truth, permission, redundancy or future preservation by themselves.
- **Reviser access UTC window:** 2026-10-10T04:39:55Z–2026-10-10T04:42:30Z
- **Reviser observed operation:** Direct-opened RFC Editor canonical URL (redirected to RFC info page); inspected payload/tag manifests and completeness/validity clauses. Exact per-page request timestamp was not exposed.
- **Per-request timestamp:** UNKNOWN; the native web tool returned page content but not a per-request UTC timestamp.

## S07

**PREMIS Data Dictionary for Preservation Metadata, Version 3.0**

- **Exact URL:** https://www.loc.gov/standards/premis/v3/
- **Version/commit:** PREMIS Data Dictionary v3.0, published/updated November 2015
- **Locator:** Official version landing page; hierarchical semantic units 1.13 relationships, 2.1–2.7 Event, 3 Agent; PDF pp. 28, 128, 151–166
- **Original access UTC:** 2026-10-10 04:22 UTC
- **Original observed operation:** web search/open; official landing page, hierarchy and PDF parsed
- **Governing condition/default/exception:** PREMIS models Objects, Events, Rights and Agents; events carry identifier/type/date-time and can link agents and objects; relationships include derivation/structural types.
- **Applicability:** Optional pattern for transcript revisions, derivation links and operator/tool/date/outcome logs; can be simplified for pilot.
- **Limitations:** Full PREMIS implementation may be disproportionate; used here as a conceptual model, not a required schema.
- **Reviser access UTC window:** 2026-10-10T04:42:43Z–2026-10-10T04:42:44Z
- **Reviser observed operation:** Direct-opened the official LoC PREMIS v3 landing page; used the already reviewed dictionary material only for the bounded model/relationship claim.
- **Per-request timestamp:** UNKNOWN; the native web tool returned page content but not a per-request UTC timestamp.

## S08

**Transcribing Interviews — Veterans History Project, Library of Congress**

- **Exact URL:** https://www.loc.gov/programs/veterans-history-project/how-to-participate/transcribing-interviews/
- **Version/commit:** Current unversioned guidance page as retrieved 2026-10-10
- **Locator:** Official page sections: transcript welcome/not required; 'What is the relationship between the transcript and the recording?'; transcript editing tips on editor/date and indicating differences. Indexed official page text was expanded; direct open failed.
- **Original access UTC:** 2026-10-10 04:22 UTC
- **Original observed operation:** web search returned page text; direct open returned HTTP 403, so content was not independently line-inspected
- **Governing condition/default/exception:** LoC VHP says transcripts are welcome but not required; describes preserving original recording plus transcript as complementary documentation, while also calling the transcript an access/reference substitute. It recommends identifying transcriber/editor/date and indicating differences. This does not make a transcript a preservation replacement or decide this society's approval policy.
- **Applicability:** Oral-history-specific support for optional transcript, separate revisions and provenance notes.
- **Limitations:** Direct page open returned an internal retrieval error in the reviser's check; official-domain search result exposed the full relevant page text. Treated as cautiously attributed primary-source guidance, not a local policy.
- **Reviser access UTC window:** 2026-10-10T04:39:55Z–2026-10-10T04:42:30Z
- **Reviser observed operation:** Direct page open returned an internal retrieval error. An official-domain search result exposed the expanded page text, including complementary documentation and access/reference-substitute wording, transcript optionality, provenance and editing advice. Exact per-page request timestamp was not exposed.
- **Per-request timestamp:** UNKNOWN; the native web tool returned page content but not a per-request UTC timestamp.

## S09

**Making Audio and Video Media Accessible — W3C WAI**

- **Exact URL:** https://www.w3.org/WAI/media/av/
- **Version/commit:** W3C WAI resource first published 2019; updated 2024-09-17
- **Locator:** Sections on transcripts and media players, lines 88–110
- **Original access UTC:** 2026-10-10 04:21 UTC
- **Original observed operation:** web open/find; page parsed
- **Governing condition/default/exception:** WAI recommends a transcript for speech and non-speech audio and an accessible media player; accessibility needs depend on the content/audience.
- **Applicability:** Supports separate transcript and listening interface checks; does not define a preservation format or require a particular codec.
- **Limitations:** General web accessibility guidance; local audience and consent policy remain owner inputs.
- **Reviser access UTC window:** 2026-10-10T04:39:55Z–2026-10-10T04:42:30Z
- **Reviser observed operation:** Direct-opened official W3C WAI guidance and inspected transcript/player recommendations and page update date; exact per-page request timestamp was not exposed.
- **Per-request timestamp:** UNKNOWN; the native web tool returned page content but not a per-request UTC timestamp.

## S10

**Oral History Resources / OHMS — University of Kentucky Libraries Nunn Center**

- **Exact URL:** https://libraries.uky.edu/locations/special-collections-research-center/louie-b-nunn-center-oral-history/nunn-center-resources
- **Version/commit:** Current official resource page, unversioned; retrieved 2026-10-10
- **Locator:** OHMS Resources description, account/tool links
- **Original access UTC:** 2026-10-10 04:22–04:23 UTC
- **Original observed operation:** web search retrieved official UK Libraries page
- **Governing condition/default/exception:** OHMS connects word-level search to interview moments; the page points to a free account and tool resources.
- **Applicability:** Useful unfamiliar oral-history access approach; possible later pilot access layer.
- **Limitations:** Describes access/discovery, not package-level preservation or local consent policy.
- **Reviser access UTC window:** 2026-10-10T04:42:43Z–2026-10-10T04:42:44Z
- **Reviser observed operation:** Direct-opened University of Kentucky Libraries OHMS resources and inspected the word-search/timepoint description and free-account request path.
- **Per-request timestamp:** UNKNOWN; the native web tool returned page content but not a per-request UTC timestamp.

## S11

**OHMS Viewer repository and releases**

- **Exact URL:** https://github.com/uklibraries/ohms-viewer/releases
- **Version/commit:** Latest observed release tag v3.10.16, commit 3343b78; README also gives installation/customization instructions
- **Locator:** Release page; repository README requirements and basic installation/test instructions
- **Original access UTC:** 2026-10-10 04:23 UTC
- **Original observed operation:** web open/search on official University of Kentucky Libraries GitHub repository
- **Governing condition/default/exception:** Viewer is a hosted PHP web app; installation requires web-server file access. Repository guidance calls for checking transcript/index searching and timepoint links after changing players.
- **Applicability:** Evidence that OHMS has a hosting/customization burden and that player/media linkage needs testing.
- **Limitations:** Observed release/version and README are not proof of compatibility with the society's files or server; no installation attempted.
- **Reviser access UTC window:** 2026-10-10T04:42:43Z–2026-10-10T04:42:44Z
- **Reviser observed operation:** Direct-opened official GitHub release tag v3.10.16 and confirmed commit 3343b78; the displayed date was Dec 15 and no year was exposed.
- **Per-request timestamp:** UNKNOWN; the native web tool returned page content but not a per-request UTC timestamp.

## S12

**Digital Preservation at the Library of Congress**

- **Exact URL:** https://wwws.loc.gov/preservation/digital/index.html
- **Version/commit:** Current unversioned LoC overview; retrieved 2026-10-10
- **Locator:** Tools and Open Source Software, lines 30–39
- **Original access UTC:** 2026-10-10 04:21 UTC
- **Original observed operation:** web search/open; official page parsed
- **Governing condition/default/exception:** LoC describes BagIt as an IETF packaging specification, Bagger as an open-source BagIt packaging application, and BWF MetaEdit as embedding/validating/exporting metadata in BWF.
- **Applicability:** Confirms concrete freely available tools associated with the two workflows.
- **Limitations:** Tool listing is not an endorsement for this particular collection or a validation report.
- **Reviser recheck:** Not independently reopened by the reviser; the investigator source identity and applicability record are retained.

## S13

**WAVE Audio File Format — Library of Congress Sustainability of Digital Formats**

- **Exact URL:** https://www.loc.gov/preservation/digital/formats/fdd/fdd000001.shtml
- **Version/commit:** FDD fdd000001; last significant update 2024-04-23
- **Locator:** Identification/description and codec-dependent fidelity; extension/format identifiers
- **Original access UTC:** 2026-10-10 04:23 UTC
- **Original observed operation:** web search; official FDD page text retrieved
- **Governing condition/default/exception:** WAVE is a wrapper that can contain different audio bitstreams; fidelity varies by selected codec. The .wav filename extension is one signifier, not the full codec identity.
- **Applicability:** Supports inspection of actual format/codec before proposing copy/transcode or lossless claims.
- **Limitations:** Format reference, not validation of any submitted file.
- **Reviser access UTC window:** 2026-10-10T04:42:43Z–2026-10-10T04:42:44Z
- **Reviser observed operation:** Direct-opened LoC WAVE FDD fdd000001 and inspected wrapper/codec, fidelity and extension passages.
- **Per-request timestamp:** UNKNOWN; the native web tool returned page content but not a per-request UTC timestamp.

## S14

**Recommended Formats Statement — Audio Works, Library of Congress**

- **Exact URL:** https://www.loc.gov/preservation/resources/rfs/audio.html
- **Version/commit:** Current audio recommendations as accessed 2026-10-10; 2025–2026 statement is also linked on the page
- **Locator:** Section IV, ii. Audio — Media-independent (digital), format preferences
- **Original access UTC:** 2026-10-10 04:23 UTC
- **Original observed operation:** web search on official LoC page
- **Governing condition/default/exception:** For media-independent digital audio, LoC prefers native/high-resolution and uncompressed options and ranks WAVE with embedded BWF metadata above WAVE without embedded metadata.
- **Applicability:** A preservation-format reference for optional access/derivative choices; not a reason to reject varied volunteer submissions or alter them.
- **Limitations:** LoC collection preference, not society-specific policy; source content categories and submission context differ.
- **Reviser recheck:** Not independently reopened by the reviser; the investigator source identity and applicability record are retained.

## S15

**Implement same behavior in GUI as in CLI about text with accents — Pull Request #34**

- **Exact URL:** https://github.com/MediaArea/BWFMetaEdit/pull/34
- **Version/commit:** Merged 2017-11-19; commits 605448d and d5b3957; merge commit ddf0e8a. Repository project/version context; no released version is established by this PR page.
- **Locator:** PR #34 title/status lines 129–153; commit descriptions and merge lines 173–188; issue #29 backlink lines 206–210
- **Original access UTC:** 2026-10-10T04:43:06Z–2026-10-10T04:43:07Z
- **Original observed operation:** Direct-opened the official GitHub pull request page linked from issue #29; inspected merged status, title, commits and backlink.
- **Governing condition/default/exception:** The merged change says it implemented GUI behavior matching CLI behavior for text with accents and included a warning about non-ASCII BEXT/INFO text. It is evidence of a related implementation change, not proof of every reporter byte sequence or end-to-end inter-tool compatibility.
- **Applicability:** Adds a precise historical link for the non-ASCII/GUI discrepancy behind issue #29; helps bound the later 20.05 ASCII-support release entry.
- **Limitations:** The PR was merged in 2017, issue #29 was linked/closed later, and no file-level reproduction or current toolchain was run.
- **Reviser recheck:** Not independently reopened by the reviser; the investigator source identity and applicability record are retained.

## Access and validation limits

The official LoC Veterans History Project page returned an internal retrieval error on direct open. An official-domain search result exposed the expanded page text, including both “complementary documentation” and the transcript's access/reference-substitute role. This was recorded cautiously under S08.

No local media, metadata editor, BagIt validator, player, or OHMS system was run. Source pages, standards, issue reports, and release histories are evidence for planning claims only.
