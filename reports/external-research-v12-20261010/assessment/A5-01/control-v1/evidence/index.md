# Independent evidence index

One-arm source assessment only. These are independently retrieved primary documents/static public code; no product/media execution. Raw captures and numbered extracted text are retained for navigation. The original source freeze is unchanged. IDs E01–E24 belong to this reviewer; S IDs are candidate bindings.

[Full assessment](../assessment.md) · [Machine-readable assessment](../assessment.json) · [Source map](../source-map.json) · [Original inspected hashes](../original-inspected.json)

## E01

FADGI Guidelines for Embedding Metadata in Broadcast WAVE Files — Version 3, approved 2021-04-26

[Primary source](https://www.digitizationguidelines.gov/audio-visual/documents/BWF_Embed_Guideline_v3_2021.pdf) · [Captured evidence](E01.pdf) · [Numbered text](E01.lines.txt)

**Locator:** PDF printed pp.6–10, 19–21, 26; extracted E01.lines.txt 169–272, 314–334, 347–387, 816–946, 1254–1262

**Condition:** Originator/OriginatorReference/Description are ASCII string definitions of 32/32/256 characters, strongly recommended in the FADGI application profile; identifiers may point to external description; OriginationDate is archival-entity-local file creation date in this profile. Code-page guidance says absent CSET or zero code-page field assumes ISO 8859/1, excluding defined control columns. These are field/profile conditions, not a universal tool guarantee.

**Application:** Optional embedding, identity and encoding conditions. The field-domain condition is relevant to F1; the cited code-page passage is real but does not erase EBU ASCII field definitions.

**Independent judgment:** Supports most detailed claims; final omits the consequential BEXT ASCII/code-page distinction.

`SHA-256 8072afec5ab3bfbfdf47b9625a8a983d622cb0012d744946eda0e7695e07e5bd`

## E02

LoC Broadcast WAVE format description — fdd000356, last significant update 2024-04-23

[Primary source](https://www.loc.gov/preservation/digital/formats/fdd/fdd000356.shtml) · [Captured evidence](E02.html) · [Numbered text](E02.lines.txt)

**Locator:** E02.lines.txt 38–56, 132–140, 150–171

**Condition:** BWF adds required bext; ordinary audio rendering and metadata display differ. Audio fidelity depends on contained encoding; ltxt can carry text but is not necessarily structured/tagged for screen readers. Older/larger format variants have applicability limits.

**Application:** Conditional BWF workflow, separate transcript, codec inspection.

**Independent judgment:** Supported with bounded format applicability.

`SHA-256 ddd6c3dc05bf6c1105a1979740106c5d6223c7b2321d33e7e36e63e1d7365680`

## E03

MediaArea BWF MetaEdit README — mutable master capture; independently pinned same bytes in E22 at 5b7f3d20167092ff63dcbb5004e8dae2e88a86ea

[Primary source](https://raw.githubusercontent.com/MediaArea/BWFMetaEdit/master/README.md) · [Captured evidence](E03.txt) · [Numbered text](E03.lines.txt)

**Locator:** E03.lines.txt 3, 8–14

**Condition:** Import/edit/embed/export selected WAVE metadata; technical/core export; MD5 covers the data chunk/audio bitstream only. Documented features do not establish all readers, edits or standard profiles.

**Application:** Candidate tool and distinct bitstream vs whole-file oracle.

**Independent judgment:** Supported.

`SHA-256 bdbd2a69e24e5059216d972dab78ccdff0f38ce93b963626df7af36b3850f295`

## E04

MediaArea GUI release history — master capture; independently pinned same bytes in E23 at 5b7f3d20167092ff63dcbb5004e8dae2e88a86ea; 20.05/23.04/25.04 entries

[Primary source](https://raw.githubusercontent.com/MediaArea/BWFMetaEdit/master/History_GUI.txt) · [Captured evidence](E04.txt) · [Numbered text](E04.lines.txt)

**Locator:** E04.lines.txt 12–15, 43–48, 105–114, 141–144

**Condition:** 20.05 dated 2020-05-28 explicitly names issues #29/#63 for ASCII-support improvement; 23.04 dated 2023-04-10 adds listed legacy encoded fields and CSET read/write; 25.04 dated 2025-04-30 is a fallback for reading core files. A 20.08 non-Unicode compilation fix is not proof of metadata round-trip resolution.

**Application:** Exact release-history claim and original lineage omission.

**Independent judgment:** Final linkage and operation distinctions supported; investigator underlinked #29, and its general 20.08 ASCII-work shorthand is imprecise.

`SHA-256 88faeb6b107187959435d46c55a36f8538995bddea23953b62cc0b9b1a762b15`

## E05

MediaArea issue #29, non 7-bit ASCII — opened 2017-10-18; closed as completed 2020-04-08

[Primary source](https://github.com/MediaArea/BWFMetaEdit/issues/29) · [Captured evidence](E05.html) · [Numbered text](E05.lines.txt)

**Locator:** Issue description and Oct18 comment; Apr2 #34 link and Apr8 closure; E05.lines.txt search for hex 93 / local / question mark / Apr 8

**Condition:** Report concerns hex93/94 quotation translation, Windows/local-code-page behavior, and GUI substitution vs CLI preservation. The closure and PR link establish history, not modern reproduction success.

**Application:** Historical mechanism and representative punctuation test.

**Independent judgment:** Supported as a reported historical case; not present universal failure.

`SHA-256 3cd6a567f545786ab51bd8cab13ffa1f38a0ef3d8bf625b0da390a4555d70bb7`

## E06

RFC 8493 BagIt — BagIt 1.0, October 2018

[Primary source](https://www.rfc-editor.org/rfc/rfc8493.txt) · [Captured evidence](E06.txt) · [Numbered text](E06.lines.txt)

**Locator:** RFC §§2.1.1–2.1.3, 2.2.1, 3; E06.lines.txt 349–382, 439–450, 758–778

**Condition:** Payload is opaque bytes under data/. Every payload manifest must list every payload file exactly once. Tag manifest is optional; if used it must list payload manifests and must not list payload files or other tag manifests. Completeness and checksum validity do not establish descriptions, permissions or preservation storage.

**Application:** Sidecar fixity, corrected C2, portable mixed-media package and correct fixity oracle.

**Independent judgment:** Supported; final data/metadata/ placement resolves original ambiguity.

`SHA-256 4964147d2e6e16442d4a6dbfbe68178a8f33c3e791c06d68a8b33f51ad821537`

## E07

PREMIS Data Dictionary — Version 3.0, November 2015

[Primary source](https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf) · [Captured evidence](E07.pdf) · [Numbered text](E07.lines.txt)

**Locator:** PDF printed introduction pp.15–19 and semantic units 1.13, 2.1–2.7; E07.lines.txt 909–978, 1120–1159

**Condition:** Objects, Events, Agents and Rights provide an event/relationship model. Derivation results from replication/transformation, objects carry IDs and event links, event outcomes can record success/failure and anomalies. Compact local borrowing is not PREMIS conformance.

**Application:** Stable derivative links, correction history and preservation analogue.

**Independent judgment:** Supported as an optional model, not a repository implementation.

`SHA-256 2e3e3fe001798f3f43d26b4aed03e8737310fa044ee001af2493f7c72517b0e0`

## E08-indexed

LoC VHP Transcribing Interviews — independently retrieved indexed primary-page text — unversioned page; web search result reported crawl age 3 months

[Primary source](https://www.loc.gov/programs/veterans-history-project/how-to-participate/transcribing-interviews/) · [Captured evidence](E08-indexed.md)

**Locator:** What is the relationship between the transcript and the recording?; What are some tips for creating and editing transcripts?; opening optionality text

**Condition:** Recording and transcript are complementary documentation while transcript can act as access/reference substitute. Identify transcriber/editor/dates and mark differences. Transcripts welcome, not required. Guidance concerns VHP and does not assign local approval owners.

**Application:** C4 adjudication and optional transcript route.

**Independent judgment:** Final correctly amends the overbroad draft and rejects the critic implication that complementary wording is absent.

`SHA-256 ea841f1bab8c1d9de71a0f36a9648ff22a92ee502e7b13059c2514db06c19852`

## E09

W3C WAI Making Audio and Video Media Accessible — first published September 2019; updated 2024-09-17

[Primary source](https://www.w3.org/WAI/media/av/) · [Captured evidence](E09.html) · [Numbered text](E09.lines.txt)

**Locator:** E09.lines.txt 105–122, 141–145

**Condition:** Transcript conveys needed speech and non-speech information; accessible player and audience needs are separate. The overview also covers video needs that are not all obligations of this audio pilot.

**Application:** Optional transcript/listening route and prospective accessibility review.

**Independent judgment:** Supported; no particular codec/player or local accessibility outcome is established.

`SHA-256 a03d29cc27e3c9af8da3d876d6acde6ced0b1c250290773e800a15aba28d11e9`

## E10

University of Kentucky Nunn Center OHMS resources — unversioned official page, current retrieved bytes

[Primary source](https://libraries.uky.edu/locations/special-collections-research-center/louie-b-nunn-center-oral-history/nunn-center-resources) · [Captured evidence](E10.html) · [Numbered text](E10.lines.txt)

**Locator:** E10.lines.txt 187–194

**Condition:** Word-level search links to interview moments; public account-request path exists. This is access/discovery, not archival package integrity or permission to use a recording.

**Application:** Useful unfamiliar later opportunity.

**Independent judgment:** Supported, correctly conditional.

`SHA-256 95cbe183a9279309289081d43f8e07b12f1c0abfb4d9fec072519fe0b679df31`

## E11

OHMS Viewer release listing — observed v3.10.16; release API in E24 independently resolves year 2025

[Primary source](https://github.com/uklibraries/ohms-viewer/releases) · [Captured evidence](E11.html) · [Numbered text](E11.lines.txt)

**Locator:** v3.10.16 entry; corresponding E18 tag reference and E24 API metadata

**Condition:** A released snapshot is an available version anchor, not a compatible society deployment.

**Application:** C6 and opportunity version applicability.

**Independent judgment:** Supported; candidate year UNKNOWN is an honest display/access limitation rather than false history.

`SHA-256 59457c7886d9831956548399a5f8cd6e659e1486af3f00f1394e95a3fb5a3d4c`

## E12a

Digital Preservation at the Library of Congress — unversioned official overview; alternate www.loc.gov URL

[Primary source](https://www.loc.gov/preservation/digital/index.html) · [Captured evidence](E12a.html) · [Numbered text](E12a.lines.txt)

**Locator:** E12a.lines.txt 40–49

**Condition:** Lists BagIt, Bagger, BagIt-Python, BWF MetaEdit and PREMIS. Listing shows concrete tooling, not collection suitability or product validation.

**Application:** Workflow realism and investigator Bagger lead.

**Independent judgment:** Supported.

`SHA-256 04d7dc55deff0bb39c55ce367244af1c18adf917501b71e866dd05ff19de4aa5`

## E13

LoC WAVE format description — fdd000001, last significant update 2024-04-23

[Primary source](https://www.loc.gov/preservation/digital/formats/fdd/fdd000001.shtml) · [Captured evidence](E13.html) · [Numbered text](E13.lines.txt)

**Locator:** E13.lines.txt 30–46, 159–174; extension signifiers

**Condition:** WAVE is a wrapper for different encodings. Fidelity varies by encoding; extension is not a codec or losslessness proof.

**Application:** Negative constraint, copy/derivative decisions and codec oracle.

**Independent judgment:** Supported.

`SHA-256 0a7f5279f970278226349d3339920699e4d9c431432064a83217cd93cb70a9b2`

## E14

LoC Recommended Formats Statement Audio Works — current unversioned page as retrieved; exact edition not independently established

[Primary source](https://www.loc.gov/preservation/resources/rfs/audio.html) · [Captured evidence](E14.html) · [Numbered text](E14.lines.txt)

**Locator:** E14.lines.txt 85–113

**Condition:** LoC preference orders embedded BWF above WAVE without embedded metadata and prefers uncompressed/native resolution in its context. Does not mandate volunteer intake or access codec.

**Application:** Supporting comparison/reference retained in draft and maps.

**Independent judgment:** Supported as institutional preference; final does not impose it on the society.

`SHA-256 1cb0276d5b78a3058de5d86057b053e39bd224b098c6151508e49cca4452c72b`

## E15

MediaArea PR #34 — merged 2017-11-19, commits 605448d/d5b3957, merge ddf0e8a

[Primary source](https://github.com/MediaArea/BWFMetaEdit/pull/34) · [Captured evidence](E15.html) · [Numbered text](E15.lines.txt)

**Locator:** PR title, merge activity, local-code-page comment, commits and #29 backlink

**Condition:** Aligns GUI and CLI accents behavior using a local code page; added BEXT/INFO warning. The page does not claim universal first fixed release.

**Application:** Added implementation/history evidence and correct C1 qualification.

**Independent judgment:** Historical linkage supported; final leaves exact reproduction unresolved appropriately.

`SHA-256 97a1e52e9732ae8406ce375685332d9f08a40195579cbea0f97c44708421dddd`

## E16

MediaArea PR #34 implementation diff — public PR #34 diff for merged change

[Primary source](https://github.com/MediaArea/BWFMetaEdit/pull/34.diff) · [Captured evidence](E16.txt) · [Numbered text](E16.lines.txt)

**Locator:** Source/GUI/Qt/GUI_Main_Core_Table.cpp and GUI_Main_xxxx_TextEditDialog.cpp; E16.lines.txt 52–68, 362–389

**Condition:** Changes GUI conversions to local 8-bit behavior; warning code distinguishes Description/Originator/OriginatorReference as EBU-ASCII-defined fields from other INFO encoding uncertainty; the GUI can keep OK enabled. Ability to write is distinct from standard admissibility.

**Application:** Independent implementation evidence for F1 and meaningful history.

**Independent judgment:** Confirms the exact omitted condition; inspected statically, never executed.

`SHA-256 a4a8c380213ef1b2e295a418ee501569954beebc1d52b1287fdfe604da266efe`

## E17

BWF MetaEdit master commit API — commit 5b7f3d20167092ff63dcbb5004e8dae2e88a86ea

[Primary source](https://api.github.com/repos/MediaArea/BWFMetaEdit/commits/master) · [Captured evidence](E17.json) · [Numbered text](E17.lines.txt)

**Locator:** JSON sha and commit metadata

**Condition:** Pins reviewer README/history captures; this API does not pin the candidate historical web retrieval or demonstrate tool behavior.

**Application:** Independent source provenance.

**Independent judgment:** Provenance only; no semantic proof from hash equality.

`SHA-256 64d0d4e1a1afd671ffd268606e26fe95254a6134561e618520e17312f45b6b8d`

## E18

OHMS v3.10.16 tag API — 3343b7884d5e18b5925681d84ea0dab8bb165038

[Primary source](https://api.github.com/repos/uklibraries/ohms-viewer/git/ref/tags/v3.10.16) · [Captured evidence](E18.json) · [Numbered text](E18.lines.txt)

**Locator:** JSON object.sha/type

**Condition:** Tag points to this commit. Does not prove hosted operation or media compatibility.

**Application:** Independent release anchor.

**Independent judgment:** Supports abbreviated commit in final.

`SHA-256 fb36eea5c1fe2dca05c9e48f30ce3e0fa937d3a31f061ba4f5ba0878a05e361d`

## E19

OHMS Viewer README — v3.10.16 tagged source, commit 3343b7884d5e18b5925681d84ea0dab8bb165038

[Primary source](https://raw.githubusercontent.com/uklibraries/ohms-viewer/v3.10.16/README.md) · [Captured evidence](E19.txt) · [Numbered text](E19.lines.txt)

**Locator:** E19.lines.txt 26–33, 58–61, 144–174

**Condition:** PHP/server file access and cache-file configuration; custom player must interact with transcript/index timepoint links; README recommends testing search results and timepoint behavior. Versioned documentation is not a present deployment recipe validation.

**Application:** Hosting burden and prospective access-layer oracle.

**Independent judgment:** Supports conditional opportunity and meaningful proposed tests.

`SHA-256 7a0bff85e5c58a7657880dfb7e1e43e2d98b57a7e3aaf4bc1144eba83d42e06e`

## E20

EBU Tech 3285 BWF specification — Version 2.0, May 2011

[Primary source](https://tech.ebu.ch/docs/tech/tech3285.pdf) · [Captured evidence](E20.pdf) · [Numbered text](E20.lines.txt)

**Locator:** Normative notation printed p.4; §2.3 printed pp.9–10; E20.lines.txt 71–96, 317–378

**Condition:** Description, Originator and OriginatorReference are ASCII string fields of 256/32/32 characters, with NUL termination for shorter strings. This is a field-domain requirement distinct from selectable legacy-code-page support and successful reopening.

**Application:** Governing primary standard for F1, within obligation3 optional metadata conditions.

**Independent judgment:** Remaining material omission in final acceptance conditions.

`SHA-256 60f59140c7dfa4c4b26a9c05914da98a69b47c07d24f07fb02ac2c4b11a7321c`

## E21

MediaArea BEXT audio metadata documentation — unversioned official documentation as retrieved

[Primary source](https://mediaarea.net/BWFMetaEdit/bext) · [Captured evidence](E21.html) · [Numbered text](E21.lines.txt)

**Locator:** Description/Originator/OriginatorReference EBU definitions and FADGI application subsections

**Condition:** Current tool documentation repeats the ASCII definitions and length bounds; application guidance and practical write support do not silently replace the standard field domain.

**Application:** Corroborates that F1 is relevant to the recommended tool, not an unrelated invented standard.

**Independent judgment:** Supports F1.

`SHA-256 bb7445b6a5f57b139fc86982fcd2565f2ed1ea9734b0bda4b49e88b7b28c5f97`

## E22

Pinned BWF MetaEdit README — 5b7f3d20167092ff63dcbb5004e8dae2e88a86ea

[Primary source](https://raw.githubusercontent.com/MediaArea/BWFMetaEdit/5b7f3d20167092ff63dcbb5004e8dae2e88a86ea/README.md) · [Captured evidence](E22.txt) · [Numbered text](E22.lines.txt)

**Locator:** same feature list as E03

**Condition:** Same documented data-chunk MD5 and selected metadata functions; no executable run.

**Application:** Pinned reviewer evidence.

**Independent judgment:** Support, not local validation.

`SHA-256 bdbd2a69e24e5059216d972dab78ccdff0f38ce93b963626df7af36b3850f295`

## E23

Pinned BWF MetaEdit GUI history — 5b7f3d20167092ff63dcbb5004e8dae2e88a86ea

[Primary source](https://raw.githubusercontent.com/MediaArea/BWFMetaEdit/5b7f3d20167092ff63dcbb5004e8dae2e88a86ea/History_GUI.txt) · [Captured evidence](E23.txt) · [Numbered text](E23.lines.txt)

**Locator:** same release entries as E04

**Condition:** Exact release-operation history preserved at immutable commit locator.

**Application:** Pinned reviewer evidence.

**Independent judgment:** Support, not universal fix proof.

`SHA-256 88faeb6b107187959435d46c55a36f8538995bddea23953b62cc0b9b1a762b15`

## E24

OHMS release API — v3.10.16 published 2025-12-15T16:33:17Z

[Primary source](https://api.github.com/repos/uklibraries/ohms-viewer/releases/tags/v3.10.16) · [Captured evidence](E24.json) · [Numbered text](E24.lines.txt)

**Locator:** JSON tag_name and published_at

**Condition:** Resolves reviewer release year; no comparison arm or present service result inferred.

**Application:** C6 provenance qualification.

**Independent judgment:** Supports existing version anchor and honest candidate date limitation.

`SHA-256 a474dbdacfcb40e34f0a8eead62b57392353a7b2c43eb1ebcf26f527a8032e5b`

## Retrieval limits

E08 direct requests returned 403; E08-indexed is official-page text delivered by independent web search, explicitly indexed rather than directly captured. E12 on the candidate wwws endpoint timed out; E12a on the official www endpoint succeeded. Original complete candidate source evidence consisted of authored indexes/source maps; those were all read. Retrieval logs record request operation, URLs, observed UTC interval, status, bytes and capture hashes. Hashes identify bytes and are not semantic evidence.
