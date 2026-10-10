# Source index — investigator discovery

The exact URL, release/version claim, locator, observed operation, access UTC, condition/exception and scope for each source are recorded in `../source-map.json`. IDs are stable and must not be silently rebound.

| ID | Primary source | Evidence used |
|---|---|---|
| [FADGI](https://www.digitizationguidelines.gov/audio-visual/documents/BWF_Embed_Guideline_v3_2021.pdf) | FADGI Broadcast WAVE embedding guideline v3 (2021) | BEXT limits and optionality; identifiers; `ltxt`/`tran`; transcript text constraints. |
| [FADGI-INDEX](https://www.digitizationguidelines.gov/guidelines/digitize-embedding.html) | FADGI current guide | Current v3 status, BWF scope, MetaEdit support and audio-chunk-only MD5 scope. |
| [EBU](https://tech.ebu.ch/docs/tech/tech3285.pdf) | EBU Tech 3285 v2 | RIFF/BWF chunk model, ASCII BEXT, version compatibility, optional/unknown chunk support. |
| [METAEDIT](https://mediaarea.net/BWFMetaEdit) | MediaArea BWF MetaEdit project | Current listed version, import/edit/embed/export, validation, platforms and MD5 boundary. |
| [BEXT](https://mediaarea.net/BWFMetaEdit/bext) | MediaArea BEXT help | Field definitions, limits and pointer/identifier guidance. |
| [LISTINFO](https://mediaarea.net/BWFMetaEdit/listinfo) | MediaArea LIST-INFO help | Descriptive metadata can become stale; follow identifiers for current information. |
| [CORE](https://mediaarea.net/BWFMetaEdit/core_doc_help) | MediaArea CORE exchange help | CSV/XML exchange, one record per file, filepath association and ASCII limits. |
| [XML](https://mediaarea.net/BWFMetaEdit/xml_chunks) | MediaArea XML chunk help | aXML/iXML/XMP validation and undo limitations. |
| [HISTORY](https://github.com/MediaArea/BWFMetaEdit/blob/master/History_GUI.txt) | MediaArea BWF MetaEdit GUI release history | Versioned fixes and feature additions for XML/encoding and core-file reading; mutable master, commit unavailable. |
| [BAGIT](https://datatracker.ietf.org/doc/html/rfc8493) | RFC 8493 BagIt 1.0 | Portable package layout, required fixity manifests, UTF-8 tag default, security boundary. |
| [PREMIS](https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf) | PREMIS Data Dictionary v3.0 | Structural/derivation relationships and identifiers/events for lineage. |
| [W3C](https://www.w3.org/WAI/media/av/) | W3C WAI accessible media guidance | Transcript scope and accessible player; guidance only, not an executed test. |
| [W3C-PLAN](https://www.w3.org/WAI/media/av/planning/) | W3C WAI audio/video planning guidance | For prerecorded audio-only media, a separate transcript is listed at WCAG Level A; user need and policy/time constraints affect scope. |

Only public documentation and public release-history text were read. No local audio sample, downloaded code, application, or product behavior was executed. No direct raw source snapshots are stored; this index and the exact provenance fields in `source-map.json` keep the evidence bounded and navigable.
