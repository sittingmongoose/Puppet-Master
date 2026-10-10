# Critic source index — A5-01-treatment

The critic's exact URL, version or commit status, locator, access time, observed operation, governing condition and applicability are in [source-map.json](../source-map.json). IDs below retain their meanings from the investigator source map; no source ID was rebound. This is a compact navigation index, not a set of local source copies.

| ID | Direct primary source | Evidence checked |
|---|---|---|
| [BAGIT](https://datatracker.ietf.org/doc/html/rfc8493) | RFC 8493, BagIt v1.0 | Opaque payload, mandatory payload manifest, optional tag manifest and security boundary; relevant to CR-4. |
| [FADGI-INDEX](https://www.digitizationguidelines.gov/guidelines/digitize-embedding.html) | FADGI BWF embedding guide | Current BWF guideline scope/version and synergy with organizational metadata. |
| [FADGI](https://www.digitizationguidelines.gov/audio-visual/documents/BWF_Embed_Guideline_v3_2021.pdf) | FADGI BWF embedding guideline v3 | BEXT and time conditions; ltxt tran, cue-range, ASCII and RIFF conditions. |
| [EBU](https://tech.ebu.ch/docs/tech/tech3285.pdf) | EBU Tech 3285 v2 | Version compatibility, field limits and the distinction between not interpreting unknown chunks and BWF pass-through; relevant to CR-2. |
| [METAEDIT](https://mediaarea.net/BWFMetaEdit) | MediaArea BWF MetaEdit page | Listed version, platform binaries, supported operations and audio-data-only MD5; page does not substantiate GUI/CLI wording in the draft, relevant to CR-3. |
| [CORE](https://mediaarea.net/BWFMetaEdit/core_doc_help) | MediaArea CORE help | One record per audio file, filepath association and ASCII field limits. |
| [LISTINFO](https://mediaarea.net/BWFMetaEdit/listinfo) | MediaArea LIST-INFO help | Embedded values may be stale; follow identifiers for newer/better data. |
| [XML](https://mediaarea.net/BWFMetaEdit/xml_chunks) | MediaArea XML chunks help | aXML/iXML/XMP validation and undo warning. |
| [HISTORY](https://raw.githubusercontent.com/MediaArea/BWFMetaEdit/master/History_GUI.txt) | MediaArea release history | Versioned encoding/import and complete-file-write history; mutable master, no commit exposed. |
| [PREMIS](https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf) | PREMIS Data Dictionary v3.0 | Structural/derivation relationships, identifiers and possible event association. |
| [W3C](https://www.w3.org/WAI/media/av/) | W3C WAI accessible media guidance | Transcript and accessible-player guidance. |
| [W3C-PLAN](https://www.w3.org/WAI/media/av/planning/) | W3C WAI planning guidance | Separate transcript and player guidance scoped to prerecorded audio-only content and WCAG levels. |

Only read-only public pages/PDFs and release-history text were accessed. The review did not execute an application, downloaded code, sample file, BagIt validation, transcript workflow, or accessibility test. See critique.md for how this evidence was used and for the limits of the assessment.
