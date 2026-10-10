# Reviser source index — A5-01-treatment

The complete source identity and evidence records are in [source-map.json](../source-map.json). Investigator IDs are the source registry and remain unchanged. The critic’s access records and the reviser’s independent checks attach to those IDs; no source ID is silently rebound. The final proposal cites these IDs as links to this index.

| ID | Direct primary source | Evidence used in the final proposal |
|---|---|---|
| <a id="FADGI"></a>[FADGI](https://www.digitizationguidelines.gov/audio-visual/documents/BWF_Embed_Guideline_v3_2021.pdf) | FADGI BWF embedding guideline v3 (2021) | Optional BEXT/INFO fields, fixed-width ASCII fields, local origination-time interpretation, and `ltxt`/`tran` conditions. |
| <a id="FADGI-INDEX"></a>[FADGI-INDEX](https://www.digitizationguidelines.gov/guidelines/digitize-embedding.html) | FADGI current guide | BWF scope, current version, MetaEdit support, and audio-data-only MD5 boundary. |
| <a id="EBU"></a>[EBU](https://tech.ebu.ch/docs/tech/tech3285.pdf) | EBU Tech 3285 v2 (2011) | RIFF/BWF chunks, BEXT limits, older-reader version behavior, and CR-2’s distinction between ignoring meaning and BWF pass-through. Independently rechecked for this stage. |
| <a id="METAEDIT"></a>[METAEDIT](https://mediaarea.net/BWFMetaEdit) | MediaArea BWF MetaEdit project page | Listed version, operating-system packages, import/edit/embed/export capabilities, and audio-data-only MD5. Independently rechecked for this stage; the checked page does not substantiate GUI/CLI wording. |
| <a id="BEXT"></a>[BEXT](https://mediaarea.net/BWFMetaEdit/bext) | MediaArea BEXT help | Field constraints and use of short identifiers/pointers after archivist selection. |
| <a id="LISTINFO"></a>[LISTINFO](https://mediaarea.net/BWFMetaEdit/listinfo) | MediaArea LIST-INFO help | Embedded descriptive values can become stale; identifiers can point to newer information. |
| <a id="CORE"></a>[CORE](https://mediaarea.net/BWFMetaEdit/core_doc_help) | MediaArea CORE exchange help | CSV/XML exchange, filepath association, one record per audio file, and ASCII limits. |
| <a id="XML"></a>[XML](https://mediaarea.net/BWFMetaEdit/xml_chunks) | MediaArea XML chunk help | Current-editor aXML/iXML/XMP validity and undo warnings. |
| <a id="HISTORY"></a>[HISTORY](https://raw.githubusercontent.com/MediaArea/BWFMetaEdit/master/History_GUI.txt) | MediaArea BWF MetaEdit release history | Named fixes/additions for encoding and complete-file-write behavior; mutable master, commit unavailable. |
| <a id="BAGIT"></a>[BAGIT](https://datatracker.ietf.org/doc/html/rfc8493) | RFC 8493 BagIt v1.0 (2018) | Opaque payload, required payload manifest, optional tag manifest, UTF-8 tag recommendation, and security boundary. Independently rechecked for this stage. |
| <a id="PREMIS"></a>[PREMIS](https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf) | PREMIS Data Dictionary v3.0 (2015) | Structural/derivation relationships and object identifiers as a model, not a requirement to implement PREMIS. |
| <a id="W3C"></a>[W3C](https://www.w3.org/WAI/media/av/) | W3C WAI accessible media guidance | Transcript content and accessible-player recommendations; guidance, not local conformance. |
| <a id="W3C-PLAN"></a>[W3C-PLAN](https://www.w3.org/WAI/media/av/planning/) | W3C WAI planning guidance | Separate transcript for prerecorded audio-only media, WCAG level context, and accessible-player planning. |

## Evidence boundary

No raw source snapshots are stored here. The linked official documents and the source map’s exact URL, version, locator, access UTC, observed operation, conditions, and applicability provide the bounded, navigable evidence record. No WAV, photo, note, transcript, BagIt package, application, account, or accessibility workflow was executed or validated.
