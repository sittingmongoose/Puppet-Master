# Independent governing evidence — A5-01 treatment v1

Evidence is reviewer retrieval/static inspection, not candidate product validation. [Assessment](../assessment.md), [source map](../source-map.json), [original hashes](../original-inspected-manifest.json), [XML conflict detail](xml-conflict.md).

## IND-FADGI

Primary source: [IND-FADGI](https://www.digitizationguidelines.gov/audio-visual/documents/BWF_Embed_Guideline_v3_2021.pdf)

Version/commit: Version 3, approved 2021-04-26. Locator: Printed pp. 6–9, 12, 22–26; Parts I and III.

Independent retrieval: 2026-10-10T04:48:10.789784+00:00. Raw capture: [fadgi.pdf](fadgi.pdf); SHA-256 `8072afec5ab3bfbfdf47b9625a8a983d622cb0012d744946eda0e7695e07e5bd`; 535236 bytes.

The BWF guidance distinguishes recommendation levels. BEXT Description and OriginatorReference have 256/32 ASCII-character limits; identifiers may point outward, with a pathname-security caution. FADGI interprets origination date/time locally, without unambiguous UTC. The ltxt recommendation permits tran and recommends ASCII free text linked to cue ranges, with termination/padding conditions. Its optional Code Page entry has an ISO 8859/1 fallback when CSET is absent or zero. Thus the ASCII recommendation is not proof of an ASCII-only implementation for every ltxt tool. These are embedding conditions, not a recorder-wide compatibility result.

Supports the bounded BWF profile and timed-transcript lead. The final’s short-segment choice is a pilot recommendation, not a normative length cap.

Extracted text: [fadgi.txt](fadgi.txt).

## IND-FADGI-INDEX

Primary source: [IND-FADGI-INDEX](https://www.digitizationguidelines.gov/guidelines/digitize-embedding.html)

Version/commit: Live index, last updated 2025-02-26; v3 current. Locator: Guidelines: Current Version; Reusing ADTL; BWF MetaEdit: About the tool; independent text lines 18–59.

Independent retrieval: 2026-10-10T04:48:10Z to 04:48:12Z. Raw capture: [fadgi-index.html](fadgi-index.html); SHA-256 `3aecbcf89b6f9356e48f6a4296f4f187c5c4f24bbf9250bb2eb05daf12138b6b`; 14886 bytes.

The index identifies BWF scope and v3, synergy with organizational databases, cue/adtl support starting with MetaEdit v21.07, and an experimental AudiAnnotate/IIIF reuse lead. It explicitly lists command-line and GUI choices across Windows, Mac and Linux. This supports the investigator’s interface fact at an alternative primary locator; the narrower METAEDIT page does not itself say GUI/CLI.

Useful discovery and criticism-disposition evidence. The IIIF opportunity is a breadth lead, not a newly imposed deliverable.

Extracted text: [fadgi-index.txt](fadgi-index.txt).

## IND-EBU

Primary source: [IND-EBU](https://tech.ebu.ch/docs/tech/tech3285.pdf)

Version/commit: EBU Tech 3285 Version 2.0, May 2011. Locator: Printed pp. 7–10; §1.1, §2.1, §2.3; Appendix A1 p. 15.

Independent retrieval: 2026-10-10T04:48:12.297275+00:00. Raw capture: [ebu.pdf](ebu.pdf); SHA-256 `60f59140c7dfa4c4b26a9c05914da98a69b47c07d24f07fb02ac2c4b11a7321c`; 243500 bytes.

BWF extends RIFF/WAVE using bext. Older readers ignore later UMID/loudness fields; early devices may not recognize later chunks. For unspecified private chunks, interpretation/use is not required and integrity is not guaranteed, but conforming BWF applications must pass them. Appendix A1 tells generic WAVE programs to expect and ignore unknown chunks. BEXT string limits apply to named fields, not every possible WAV comment. None of this proves arbitrary editor write behavior.

Confirms CR-2’s clarification and the final’s original/copy separation. The draft’s reader shorthand did not explicitly claim all unknown chunks are dropped.

Extracted text: [ebu.txt](ebu.txt).

## IND-METAEDIT

Primary source: [IND-METAEDIT](https://mediaarea.net/BWFMetaEdit)

Version/commit: Live project page listed 26.08.1 at independent access. Locator: Purpose, download/platform list, BWF MetaEdit features; independent text lines 37–82.

Independent retrieval: 2026-10-10T04:48:10Z to 04:48:12Z. Raw capture: [metaedit.html](metaedit.html); SHA-256 `7ec25815af64a1a912cbfb63fffe88de3610949bb768922e6d73c4a17c52ff70`; 20610 bytes.

Official page documents BWF metadata import/edit/embed/export, CSV/XML extraction, construction reports and MD5 of the WAVE data chunk only. It lists multi-platform downloads. It does not establish GUI/CLI through those exact terms. The version label is a listing; no local binary or volunteer file was tested.

Supports a realistic conditional tool candidate and the distinction between audio-only and full-file fixity.

Extracted text: [metaedit.txt](metaedit.txt).

## IND-BEXT

Primary source: [IND-BEXT](https://mediaarea.net/BWFMetaEdit/bext)

Version/commit: Rolling official help; no documentation release pin. Locator: Description, OriginatorReference, OriginationDate and OriginationTime entries.

Independent retrieval: 2026-10-10T04:48:10Z to 04:48:12Z. Raw capture: [bext.html](bext.html); SHA-256 `bb7445b6a5f57b139fc86982fcd2565f2ed1ea9734b0bda4b49e88b7b28c5f97`; 24655 bytes.

Help reproduces EBU bounded ASCII definitions and FADGI identifier/pointer and local-date/time guidance. FADGI application advice can differ from the underlying EBU wording. Embedded convenience fields do not decide this society’s authority model.

Corroborates named field applicability; no implication that all WAV tools implement these fields.

Extracted text: [bext.txt](bext.txt).

## IND-LISTINFO

Primary source: [IND-LISTINFO](https://mediaarea.net/BWFMetaEdit/listinfo)

Version/commit: Rolling official help. Locator: ICOP and INAM FADGI application notes.

Independent retrieval: 2026-10-10T04:48:10Z to 04:48:12Z. Raw capture: [listinfo.html](listinfo.html); SHA-256 `d81760b5ecdff9bc2dcf382f996bf819fd3c7b349ea4bde6a4c279219f0e80c4`; 20369 bytes.

The official notes warn that embedded restrictions and working titles may become outdated and recommend following identifiers for later information. INFO elements have differing guidance and optionality.

Supports the proposed external authority policy as an inference. It does not choose the archivist’s policy.

Extracted text: [listinfo.txt](listinfo.txt).

## IND-CORE

Primary source: [IND-CORE](https://mediaarea.net/BWFMetaEdit/core_doc_help)

Version/commit: Rolling official help. Locator: CORE Document introduction; CSV FileName/Description/OriginatorReference columns; XML format section.

Independent retrieval: 2026-10-10T04:48:10Z to 04:48:12Z. Raw capture: [core.html](core.html); SHA-256 `2f23ac2b3cccc3dcba8cbe1640b655b0a08c754b977c720bdf6d2ef857721f9d`; 17130 bytes.

CORE exchanges BEXT/LIST-INFO as CSV/XML, one record per audio file, associated with full filepaths. CSV lists named bounded ASCII fields. XML uses its own document encoding. A CORE path is an exchange association, not durable collection identity. Rolling help is not proof of a specific release’s round-trip results.

Supports the optional batch workflow; stable IDs/checksums and representative-value tests are local design choices.

Extracted text: [core.txt](core.txt).

## IND-XML

Primary source: [IND-XML](https://mediaarea.net/BWFMetaEdit/xml_chunks)

Version/commit: Rolling help with no binary/version linkage. Locator: XML Chunks, Warning; independent text lines 54–55.

Independent retrieval: 2026-10-10T04:48:10Z to 04:48:12Z. Raw capture: [xml.html](xml.html); SHA-256 `53b8f707fa8ddc57c8ddbeface5fcdc9489c7cbf4933bcd0050b64ec7721b6fd`; 13719 bytes.

The published warning says entered XML receives no document/instance verification and edits have no undo. This is an accurate account of that help text. Its broad absence-of-verification warning conflicts with the later release history and inspected v26.08 code. The final carries it as a tool condition without reconciling that conflict.

M1: documentation provenance alone does not settle released operational applicability. Schema conformance and syntax warnings must be separated.

Extracted text: [xml.txt](xml.txt).

## IND-HISTORY

Primary source: [IND-HISTORY](https://raw.githubusercontent.com/MediaArea/BWFMetaEdit/master/History_GUI.txt)

Version/commit: Mutable master capture; also independently pinned to v26.08 commit 318d800d92c4a3cc8a814f6fdceba0ed8b3416ec. Locator: Version entries 0.2.2, 20.08, 21.07, 23.04 and 25.04; captured history lines 12–15, 47–50, 61–87, 99–104 and 293–301.

Independent retrieval: 2026-10-10T04:48:11.533000+00:00. Raw capture: [history.txt](history.txt); SHA-256 `88faeb6b107187959435d46c55a36f8538995bddea23953b62cc0b9b1a762b15`; 15486 bytes.

The cited CR/escaping/full-file-write, UNICODE=1 import, code-page/CSET and CORE fallback changes are present for the named releases. They justify version/path-specific prospective checks, not present universal compatibility. The same history records XML checks in 20.08 and an invalid-XML data-entry warning in 21.07. Those relevant entries were omitted from the proposal’s XML applicability discussion. The immutable v26.08 file has the same inspected history bytes; this is supporting provenance, not semantic proof.

Supports the bounded historical example and independently exposes the unresolved source conflict in M1.

## IND-BAGIT

Primary source: [IND-BAGIT](https://datatracker.ietf.org/doc/html/rfc8493)

Version/commit: RFC 8493, BagIt v1.0, October 2018; Informational. Locator: §§1.3, 2.1.1–2.1.3, 2.2.1, 2.4, 3 and 5.4.

Independent retrieval: 2026-10-10T04:48:10Z to 04:48:12Z. Raw capture: [bagit.html](bagit.html); SHA-256 `2b32dd7019a823c94344f562c684ea3dfd904dcc621f071634b5195e1ac2b65b`; 121173 bytes.

Payload is opaque. Each bag needs at least one payload manifest; each manifest lists every payload file once. Tag manifests are optional, must list payload manifests, and must not list other tag manifests or payload files. bagit.txt is UTF-8 without BOM; remaining tag encoding should be UTF-8 but may differ for compatibility. A valid bag is complete with all manifest checksums verified. Tools must support SHA-256/SHA-512 and should default to SHA-512. The proposed SHA-256 choice is allowed. Fixity does not secure against active attacks.

Confirms CR-4 and the analogous transfer mechanism. No completed bag, implementation conformance or audio semantics are established.

Extracted text: [bagit.txt](bagit.txt).

## IND-PREMIS

Primary source: [IND-PREMIS](https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf)

Version/commit: Data Dictionary v3.0; June 2015 release, final PDF updated November 2015. Locator: Printed pp. 18–20 and semantic unit 1.13 (p. 117 onward); PDF physical pages differ from printed pages.

Independent retrieval: 2026-10-10T04:48:12.149311+00:00. Raw capture: [premis.pdf](premis.pdf); SHA-256 `2e3e3fe001798f3f43d26b4aed03e8737310fa044ee001af2493f7c72517b0e0`; 2176353 bytes.

Relationships identify related Objects and characterize structural/derivation links; events can be associated. Sibling representations do not thereby derive from one another. PREMIS is implementation independent and can be used as a conceptual model; whole-standard adoption is not required by this pilot brief.

Supports the lineage model without claiming a generated or validated PREMIS record.

Extracted text: [premis.txt](premis.txt).

## IND-W3C

Primary source: [IND-W3C](https://www.w3.org/WAI/media/av/)

Version/commit: Live WAI guidance; not a player conformance certificate. Locator: Transcripts and Media Players; independent text lines 102–107.

Independent retrieval: 2026-10-10T04:48:10Z to 04:48:12Z. Raw capture: [w3c.html](w3c.html); SHA-256 `a03d29cc27e3c9af8da3d876d6acde6ced0b1c250290773e800a15aba28d11e9`; 43349 bytes.

WAI recommends text for speech and relevant non-speech audio and a player with accessibility support. Actual needed features depend on media and users.

Supports the optional accessible experience, while leaving product validation proposed.

Extracted text: [w3c.txt](w3c.txt).

## IND-W3C-PLAN

Primary source: [IND-W3C-PLAN](https://www.w3.org/WAI/media/av/planning/)

Version/commit: Live WAI planning guidance; WCAG level discussion. Locator: Audio-only Checklists, Pre-Recorded Audio-only; Standards section; independent text lines 117–126, 200–226.

Independent retrieval: 2026-10-10T04:48:10Z to 04:48:12Z. Raw capture: [w3c-plan.html](w3c-plan.html); SHA-256 `0a9628cd43b56637c251bfd694f1d90778154eb670abe6d0d354327f5e85f06d`; 58494 bytes.

The prerecorded audio-only checklist lists a separate transcript at Level A, distinguished from live audio and video paths. Guidance and WCAG applicability do not demonstrate that a proposed player or transcript conforms.

Supports retention of the human-reviewed transcript/listening option, subject to owner and recipient decisions.

Extracted text: [w3c-plan.txt](w3c-plan.txt).

## IND-CODE-HANDLER

Primary source: [IND-CODE-HANDLER](https://github.com/MediaArea/BWFMetaEdit/blob/318d800d92c4a3cc8a814f6fdceba0ed8b3416ec/Source/Riff/Riff_Handler.cpp)

Version/commit: v26.08 at 318d800d92c4a3cc8a814f6fdceba0ed8b3416ec. Locator: Lines 1959–1984, 2927–2932 and 3205–3211.

Independent retrieval: 2026-10-10T04:48:56.421356+00:00. Raw capture: [release-26.08-riff-handler.cpp](release-26.08-riff-handler.cpp); SHA-256 `b610951194f7100931c14bf834f38147a75b27924848d772cc3209249dea6af4`; 184884 bytes.

For nonempty axml/ixml/xmp, the released handler invokes TinyXML2 parsing and records a syntax warning on failure. A warning alone does not turn IsValid false; errors do. This is static code evidence of a verification/warning path, not schema validation or guaranteed refusal to save malformed XML.

Static public released-source evidence only; installed 26.08.1 binary behavior remains untested.

## IND-PINNED-HISTORY

Primary source: [IND-PINNED-HISTORY](https://github.com/MediaArea/BWFMetaEdit/blob/318d800d92c4a3cc8a814f6fdceba0ed8b3416ec/History_GUI.txt)

Version/commit: v26.08 at 318d800d92c4a3cc8a814f6fdceba0ed8b3416ec. Locator: Version 20.08/21.07 entries and named encoding releases.

Independent retrieval: 2026-10-10T04:48:56.392005+00:00. Raw capture: [release-26.08-history.txt](release-26.08-history.txt); SHA-256 `88faeb6b107187959435d46c55a36f8538995bddea23953b62cc0b9b1a762b15`; 15486 bytes.

Released v26.08 history corroborates the XML check/warning changes and versioned encoding example, independently of moving master.

Static public released-source evidence only; installed 26.08.1 binary behavior remains untested.

## IND-ISSUE-125-COMMENTS

Primary source: [IND-ISSUE-125-COMMENTS](https://api.github.com/repos/MediaArea/BWFMetaEdit/issues/125/comments)

Version/commit: Public repository API snapshot at recorded access. Locator: v26.08 tag mapping; issue 125 body and comments; tree paths and root SHA as applicable.

Independent retrieval: 2026-10-10T04:48:56.433949+00:00. Raw capture: [issue-125-comments.json](issue-125-comments.json); SHA-256 `61b5e232e0f66ef196d96b9f1c3f8a8d2feadecd94a95c8fbd64489a79640518`; 3656 bytes.

Repository provenance and bounded issue context. Issue 125 requested basic XML checks rather than format-spec checks and was closed in July 2020. The tag mapping identifies the inspected released source. Tree data was used only to locate relevant source files.

Supporting provenance/context; tag names, closure and hashes alone do not prove implementation behavior.

## IND-CODE-GUI

Primary source: [IND-CODE-GUI](https://github.com/MediaArea/BWFMetaEdit/blob/318d800d92c4a3cc8a814f6fdceba0ed8b3416ec/Source/GUI/Qt/GUI_Main_xxxx_TextEditDialog.cpp)

Version/commit: v26.08 at 318d800d92c4a3cc8a814f6fdceba0ed8b3416ec. Locator: Lines 83–88 and 112–156.

Independent retrieval: 2026-10-10T04:50:05.620483+00:00. Raw capture: [release-26.08-GUI_Main_xxxx_TextEditDialog.cpp](release-26.08-GUI_Main_xxxx_TextEditDialog.cpp); SHA-256 `6820925b88a89bc91e1f238985c0020893c5cce5e64df7e080e37ccc9af9a0ad`; 9517 bytes.

The released GUI distinguishes absent format-specific validation and undo from the IsValid editing path. Text changes call IsValid and display LastWarning when no blocking error exists; acceptance can continue. This establishes relevance to entered XML, not merely file import.

Static public released-source evidence only; installed 26.08.1 binary behavior remains untested.

## IND-CODE-CORE

Primary source: [IND-CODE-CORE](https://github.com/MediaArea/BWFMetaEdit/blob/318d800d92c4a3cc8a814f6fdceba0ed8b3416ec/Source/Common/Core.cpp)

Version/commit: v26.08 at 318d800d92c4a3cc8a814f6fdceba0ed8b3416ec. Locator: Lines 1573–1615.

Independent retrieval: 2026-10-10T04:50:05.629557+00:00. Raw capture: [release-26.08-Core.cpp](release-26.08-Core.cpp); SHA-256 `bf8bda2de2abc7d2f75ff4574bca24dbc733ad8c429abea3651a0f2d0ee7c5d3`; 90821 bytes.

Core forwards IsValid to Riff_Handler and exposes its last warning to the GUI. Static call-chain inspection supports M1; no compiled application was run.

Static public released-source evidence only; installed 26.08.1 binary behavior remains untested.

## IND-GITHUB-TAGS

Primary source: [IND-GITHUB-TAGS](https://api.github.com/repos/MediaArea/BWFMetaEdit/tags?per_page=100)

Version/commit: Public repository API snapshot at recorded access. Locator: v26.08 tag mapping; issue 125 body and comments; tree paths and root SHA as applicable.

Independent retrieval: 2026-10-10T04:48:45.656329+00:00. Raw capture: [github-tags.json](github-tags.json); SHA-256 `ec5da3e7b277683dd9a88ec48d31b0442bca56cc6276dfba0f170a17ad1ed4a9`; 5545 bytes.

Repository provenance and bounded issue context. Issue 125 requested basic XML checks rather than format-spec checks and was closed in July 2020. The tag mapping identifies the inspected released source. Tree data was used only to locate relevant source files.

Supporting provenance/context; tag names, closure and hashes alone do not prove implementation behavior.

## IND-GITHUB-ISSUE-125

Primary source: [IND-GITHUB-ISSUE-125](https://api.github.com/repos/MediaArea/BWFMetaEdit/issues/125)

Version/commit: Public repository API snapshot at recorded access. Locator: v26.08 tag mapping; issue 125 body and comments; tree paths and root SHA as applicable.

Independent retrieval: 2026-10-10T04:48:45.840330+00:00. Raw capture: [github-issue-125.json](github-issue-125.json); SHA-256 `aad89d9ca2089966bb035c7826dce936348b44a9f66e71388d31eaed2e6334b9`; 5695 bytes.

Repository provenance and bounded issue context. Issue 125 requested basic XML checks rather than format-spec checks and was closed in July 2020. The tag mapping identifies the inspected released source. Tree data was used only to locate relevant source files.

Supporting provenance/context; tag names, closure and hashes alone do not prove implementation behavior.

## IND-GITHUB-MASTER-TREE

Primary source: [IND-GITHUB-MASTER-TREE](https://api.github.com/repos/MediaArea/BWFMetaEdit/git/trees/master?recursive=1)

Version/commit: Public repository API snapshot at recorded access. Locator: v26.08 tag mapping; issue 125 body and comments; tree paths and root SHA as applicable.

Independent retrieval: 2026-10-10T04:48:46.037320+00:00. Raw capture: [github-master-tree.json](github-master-tree.json); SHA-256 `45e72b457088aacdf4fda3ae73f71b0cc01a59e466c5856dca3eac229a6e4050`; 91830 bytes.

Repository provenance and bounded issue context. Issue 125 requested basic XML checks rather than format-spec checks and was closed in July 2020. The tag mapping identifies the inspected released source. Tree data was used only to locate relevant source files.

Supporting provenance/context; tag names, closure and hashes alone do not prove implementation behavior.

