# Critic source index

This index records the bounded public primary evidence independently inspected for the A5-01-control critique. Stable IDs S01–S14 keep the investigator's exact bindings; details of accessed version, locator, access UTC, observed operation, conditions and limitations are in [`../source-map.json`](../source-map.json). The same IDs are not reassigned. No executable code or media files were downloaded or run.

| ID | Primary source | Main use in critique |
|---|---|---|
| [S01](#s01) | [FADGI BWF embedding guideline v3 (2021)](https://www.digitizationguidelines.gov/audio-visual/documents/BWF_Embed_Guideline_v3_2021.pdf) | Field bounds/recommendation levels, OriginationDate meaning, CSET code-page default. |
| [S02](#s02) | [LoC BWF format description](https://www.loc.gov/preservation/digital/formats/fdd/fdd000356.shtml) | Labeled Text transcript limits for accessibility; codec-dependent fidelity. |
| [S03](#s03) | [BWF MetaEdit README](https://github.com/MediaArea/BWFMetaEdit) | Tool-documented operations and audio-data-only MD5 scope. |
| [S04](#s04) | [BWF MetaEdit release history](https://raw.githubusercontent.com/MediaArea/BWFMetaEdit/master/History_GUI.txt) | The 20.05 ASCII correction explicitly names issue #29; later code-page/CSET changes. Mutable master, no commit returned. |
| [S05](#s05) | [BWF MetaEdit issue #29](https://github.com/MediaArea/BWFMetaEdit/issues/29) | Reported non-7-bit quotation-mark translation issue and current displayed state. |
| [S06](#s06) | [IETF RFC 8493 — BagIt 1.0](https://www.rfc-editor.org/rfc/rfc8493/) | Payload vs tag-file manifest coverage; package integrity limits. |
| [S07](#s07) | [LoC PREMIS 3.0](https://www.loc.gov/standards/premis/v3/) | Object derivation relationships and event provenance as an optional model. |
| [S08](#s08) | [LoC Veterans History Project transcript guidance](https://www.loc.gov/programs/veterans-history-project/how-to-participate/transcribing-interviews/) | Optional transcript and revision-provenance guidance; direct open failed, official search-result text only. |
| [S09](#s09) | [W3C WAI accessible media guidance](https://www.w3.org/WAI/media/av/) | Transcript and accessible-player guidance, with audience-specific needs. |
| [S10](#s10) | [University of Kentucky Nunn Center OHMS resources](https://libraries.uky.edu/locations/special-collections-research-center/louie-b-nunn-center-oral-history/nunn-center-resources) | Word-level oral-history search linked to interview moments and account path. |
| [S11](#s11) | [OHMS Viewer releases](https://github.com/uklibraries/ohms-viewer/releases) | v3.10.16 / commit 3343b78 as an observed version anchor, not compatibility proof. |
| [S12](#s12) | [LoC digital preservation tools](https://wwws.loc.gov/preservation/digital/index.html) | Public availability of BagIt-Python, BWF MetaEdit and PREMIS references. |
| [S13](#s13) | [LoC WAVE format description](https://www.loc.gov/preservation/digital/formats/fdd/fdd000001.shtml) | WAVE container/codec distinction and extension limits. |
| [S14](#s14) | [LoC Recommended Formats Statement — Audio](https://www.loc.gov/preservation/resources/rfs/audio.html) | LoC's own format preferences, not a society mandate. |

## S01

FADGI Audio-Visual Working Group, *Guidelines for Embedding Metadata in Broadcast WAVE Files*, Version 3, approved 2021-04-26. Opened official PDF pp. 6–10 and searched CSET/ISO 8859/1 at pp. 26–27. Page 10 also notes older BWF-aware readers may ignore newer metadata. Field labels and lengths are field-specific. CSET absent/zero uses ISO 8859/1 for internal metadata text. No toolchain was tested.

## S02

Library of Congress, *Broadcast WAVE Audio File Format, Version 1*, FDD fdd000356 (last significant update 2024-04-23). Inspected official page's ltxt/accessibility passage and fidelity entries. The `ltxt` transcript may not be structured or screen-reader tagged; fidelity depends on encoding. This does not establish behavior in a particular player.

## S03

MediaArea, BWF MetaEdit default-branch README (mutable; commit/version not exposed in reviewed view). Inspected feature list. It documents embed/export/validate actions and an MD5 of the WAVE `data` chunk only. Not a local execution or cross-tool compatibility test.

## S04

MediaArea, `History_GUI.txt` on mutable `master` (commit not exposed). Inspected 20.05 (2020-05-28), 20.08 (2020-08-11), 23.04 (2023-04-10), and 25.04 (2025-04-30); top entry observed was 26.08 (2026-08-27). In 20.05 the exact entry is “Improve ASCII support (Issue #29, #63).” The explicit issue link is evidence of a related change, not proof of end-to-end interoperability.

## S05

MediaArea, issue #29, “non 7-bit ASCII,” opened 2017-10-18 and shown closed in the reviewed page. The report mentions open/close quotation bytes `0x93`/`0x94` that did not translate well. The 20.05 history entry explicitly references #29; neither the issue nor history proves every case fixed across all readers.

## S06

IETF RFC 8493, October 2018, BagIt 1.0. Inspected §§2.1.2–2.1.3 (payload and required payload manifest), §2.2.1 (optional tag manifest), §§2.3–2.4 and §3. The payload manifest covers payload files under `data/`; a tag manifest can cover tag files. Checksums do not establish descriptive truth, permissions or ongoing preservation.

## S07

Library of Congress, PREMIS Data Dictionary v3.0, official full PDF updated November 2015. Inspected landing page and PDF passages on objects/events, derivation relationship and event timestamp/outcome. PREMIS supports this modeling pattern, but a compact local log is not a conformant PREMIS implementation.

## S08

Library of Congress, Veterans History Project, “Transcribing Interviews,” current unversioned page. Direct open returned an internal retrieval error; an official-domain search result returned extensive current page text. The text says transcripts are welcome but not required, recommends transcriber/editor/date identification, and asks that differences be marked. It describes transcripts as access/reference substitutes; it does not substantiate “complementary, not substitutes” as attributed in the draft. Direct source access remains limited.

## S09

W3C WAI, *Making Audio and Video Media Accessible*, first published September 2019, updated 2024-09-17. Inspected official guidance on transcripts and accessible players. This supports evaluating a transcript and playback interface for the intended audience, not a particular player or storage format.

## S10

University of Kentucky Libraries, Nunn Center OHMS Resources page, current unversioned page. Inspected the official description of word-level search linked to interview moments and the free account request/login path. This is discovery/access evidence only.

## S11

University of Kentucky Libraries, OHMS Viewer GitHub release v3.10.16, commit `3343b78` (release page displays 15 Dec; year not exposed in the inspected excerpt). Inspected the official release entry and tag page. The version is an evidence anchor, not a society compatibility or hosting result.

## S12

Library of Congress, *Digital Preservation at the Library of Congress*, current unversioned overview. Inspected the tool list for BagIt-Python, BWF MetaEdit and PREMIS. A tool listing is not product validation or an endorsement for this collection.

## S13

Library of Congress, *WAVE Audio File Format*, FDD fdd000001 (last significant update 2024-04-23). Inspected container, codec, fidelity and extension information. `.wav` identifies a filename convention and does not identify the contained audio encoding.

## S14

Library of Congress, *Recommended Formats Statement — Audio Works*, current page as accessed 2026-10-10 (revision label not exposed in inspected excerpt). Inspected the media-independent digital-audio preference table: LoC prefers WAVE with embedded metadata and separately prefers uncompressed files. This is a Library-specific preference, not an intake requirement for volunteer recordings.
