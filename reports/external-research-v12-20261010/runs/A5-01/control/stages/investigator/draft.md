# Research proposal — Volunteer oral-history deposit package

**Stage:** investigator, A5-01-control. This is a pilot-scale proposal based on the supplied brief and the released draft plan. It is not an implementation, a system selection, consent determination or product validation report. Source IDs are stable and resolve through [`sources/index.md`](sources/index.md) and [`source-map.json`](source-map.json).

## Recommendation

Use a sidecar-authoritative, format-agnostic package as the pilot baseline. Preserve the received recording bytes and submitted filename, photographs, interviewer notes and any transcript as separately identified objects. Give the interview/event and every file a stable local ID; describe links in a UTF-8 metadata record rather than relying on names or a WAV comment. Package content and metadata together with a BagIt 1.0 manifest, using a documented checksum algorithm. Keep received audio distinct from a derived listening copy. This fits the society's varied volunteer recorders and does not depend on them selecting a metadata-writing application.

Offer BWF metadata enrichment only as an optional staff step after the collections archivist approves a small field profile and the target files/readers pass a representative encoding and round-trip check. Create and identify a copy; never edit the received source in place. Keep the sidecar record authoritative for full descriptions, photo/note relationships, transcript revisions, approvals and access decisions. A BWF field can be a convenient repeated subset, not a substitute for that record. [S01](https://www.digitizationguidelines.gov/audio-visual/documents/BWF_Embed_Guideline_v3_2021.pdf), [S02](https://www.loc.gov/preservation/digital/formats/fdd/fdd000356.shtml), [S03](https://github.com/MediaArea/BWFMetaEdit)

## Clause-by-clause disposition

### 1. Two metadata/deposit workflows and an analogous preservation mechanism

**Disposition: Correct the released draft's one-comment-field/file-name proposal; compare alternatives and recommend a sidecar-first baseline.**

| Workflow | How it works | Portability and recorder compatibility | Limits and pilot fit |
|---|---|---|---|
| **A. Package-first sidecars (recommended baseline)** | Retain mixed media as received; assign IDs; include UTF-8 interview/file/revision records with relative paths and relationships; build a BagIt package and verify its payload manifest. Bagger or another RFC 8493 conformant tool is a possible packaging utility, not a required choice. | Independent of recorder metadata support and accommodates WAV, photos, notes, transcript and access copy together. Ordinary files and relative paths are readily inspectable. | Sidecars can be separated or mislinked if packages are unpacked carelessly; the society must define a small stable schema, preserve source filenames as values and keep the package structure. The BagIt checksum is fixity against the manifest, not proof that a description is true or consent exists. [S06](https://www.rfc-editor.org/rfc/rfc8493/), [S12](https://wwws.loc.gov/preservation/digital/index.html) |
| **B. BWF-aware field embedding (optional enrichment)** | After intake and archivist approval, use a BWF-aware editor such as BWF MetaEdit on a designated copy of a WAVE file. Embed only selected short fields; export/validate the fields; retain the sidecar record and package manifest. | BWF metadata travels inside a WAVE file for readers that expose it, and BWF remains playable in ordinary WAV readers that may ignore the extra metadata. It does not require every volunteer to record with the same app if embedding is a staff-side option. | Field meanings/lengths and code-page support differ; not every recorder/editor/player supports the same chunks or preserves them on rewrite. A writing operation changes the file container; its result must be inspected and validated. Use only when sharing the embedded subset provides enough value to justify the extra copy and checks. [S01](https://www.digitizationguidelines.gov/audio-visual/documents/BWF_Embed_Guideline_v3_2021.pdf), [S02](https://www.loc.gov/preservation/digital/formats/fdd/fdd000356.shtml), [S03](https://github.com/MediaArea/BWFMetaEdit) |

**Preservation analogue.** BagIt is the most proportionate analogous mechanism discovered: an interoperable directory envelope for arbitrary payload files, with a manifest that checks every payload path. PREMIS 3.0 is a useful model if later preservation events need more formal structure: it models Objects, Events, Rights and Agents, and can capture event dates, agents, outcomes and object relationships. For this pilot, a compact event/revision log can follow that pattern without claiming PREMIS conformance. A bag or a PREMIS record is not itself a preservation program: maintain independent storage copies, document fixity checks over time, and apply the society's approved access restrictions. [S06](https://www.rfc-editor.org/rfc/rfc8493/), [S07](https://www.loc.gov/standards/premis/v3/)

### 2. Recording identity, metadata authority, transcript revisions and original/access links

**Disposition: Replace filename-only links and unspecified metadata authority with explicit IDs and relationships.**

Create one interview/event ID, plus separate file IDs for each received audio recording, photograph, note, transcript revision and derivative. A metadata record should link each file ID to its parent interview ID and record the submitted filename, relative package path, received format details and relevant supplied/staff metadata. Preserve both supplied and normalized descriptions where they disagree; do not silently overwrite volunteer values. The collections archivist decides which fields and values are authoritative and what conflict history to retain.

Record every approved transcript revision under a new revision ID or versioned filename. Link it to the interview and recording ID; capture the transcriber, editor, correction date, interviewer approval, revision/change summary and any passages or wording that intentionally differ from the recording. Keep the earlier transcript version when available; do not replace a published/corrected transcript without a trace. The interviewer approves corrections, as the brief requires. LoC VHP guidance supports identifying transcriber/editor/date and indicating differences; it also describes recordings and transcripts as complementary, not substitutes. That page was retrieved from its search result because direct open returned 403; see the limitation on [S08](https://www.loc.gov/programs/veterans-history-project/how-to-participate/transcribing-interviews/).

Model each access file as a separate object with its own ID and an explicit `derived_from` link to the received source, plus process date, tool/version and relevant conversion settings. If an access copy is only a metadata-enriched copy, say so; do not imply its audio was transcoded. If it was transcoded, identify the source encoding and destination encoding and record that operation. PREMIS's Object relationship and Event model is a reference for these links, not a pilot requirement. [S07](https://www.loc.gov/standards/premis/v3/)

### 3. Conditions for optional embedded descriptive metadata

**Disposition: Research the conditions; reject the draft's assumption that one comment field or every editor is enough.**

BWF is a WAVE extension with a required `bext` chunk, but many individual descriptive values are recommendations or optional fields. FADGI v3 (2021) calls `Originator`, `OriginatorReference` and `Description` strongly recommended; their respective lengths are 32, 32 and 256 characters. It distinguishes recommended and optional INFO fields. `OriginationDate` is described for the file-creation date in the archive's local time zone, so keep interview/event date and recording/file date distinct in the external record. Use a short stable file ID for `OriginatorReference` only if the archivist approves it and it fits; retain richer description and all cross-file links outside the WAV. Do not expose private paths inside a BWF description. [S01](https://www.digitizationguidelines.gov/audio-visual/documents/BWF_Embed_Guideline_v3_2021.pdf)

A BWF-aware tool can embed, validate and export metadata, but that establishes only the tool's documented feature set. BWF-aware recorders and readers vary. A generic WAV reader may play the audio while not displaying the BWF metadata; LoC also notes that embedded Labeled Text transcription content is not necessarily structured or screen-reader tagged. Therefore a separate plain-text transcript is the more portable transcript/access artifact. [S02](https://www.loc.gov/preservation/digital/formats/fdd/fdd000356.shtml), [S03](https://github.com/MediaArea/BWFMetaEdit)

Only embed after: (a) identify the actual WAVE codec/container and determine that the file is accepted by the selected tool; (b) the archivist has approved field semantics and values; (c) values fit the limits and do not disclose restricted data; (d) the exact tool version and output readers pass the encoding/field round-trip; and (e) a copy is available and the package/file fixity and audio-bitstream checks are recorded. FADGI states CSET identifies the code page for internal metadata; if CSET is absent or zero, it documents an ISO 8859/1 default. BWF MetaEdit's 23.04 history added read/write for CP437, CP850, CP858, Windows-1252, ISO 8859-1 and ISO 8859-2 plus CSET; 25.04 added an ISO8859-1 fallback for reading core files. These versioned changes do not establish that all volunteer devices or downstream tools handle the same encodings. Keep the UTF-8 sidecar authoritative and do not add non-ASCII embedded values until the exact chain is checked. [S01](https://www.digitizationguidelines.gov/audio-visual/documents/BWF_Embed_Guideline_v3_2021.pdf), [S04](https://github.com/MediaArea/BWFMetaEdit/blob/master/History_GUI.txt)

### 4. Relevant encoding/round-trip issue or released change

**Disposition: Replace “current tool listing proves compatibility” with a documented version history and a testable uncertainty.**

BWF MetaEdit issue #29, opened 2017-10-18, reports open/close quote bytes `0x93`/`0x94` that did not translate well. The release history records ASCII-support work in 20.05 and 20.08. It later records 23.04 support for several named legacy code pages and CSET read/write, followed by a 25.04 ISO-8859-1 fallback when reading a core file. These records establish that character handling changed across releases and that non-ASCII text is a real edge case; they do **not** establish which release fixed issue #29 end-to-end or that the current pilot's readers agree on every character. [S05](https://github.com/MediaArea/BWFMetaEdit/issues/29), [S04](https://github.com/MediaArea/BWFMetaEdit/blob/master/History_GUI.txt)

For this collection, avoid lossy field substitution, smart-quote corruption and silent name changes by keeping UTF-8 sidecars authoritative. If embedding is selected, test representative accented names, curly quotation marks and any expected scripts through a pinned recorder/export/editor/reader combination; inspect the saved values after reopening. If character integrity is not confirmed, omit that embedded value and keep the correct full value in the sidecar. No such fixture test was executed in this stage.

### 5. Human-reviewed plain-text transcript and accessible listening copy

**Disposition: Retain as supported, optional scope; do not promote it to mandatory or remove it based only on the baseline workflow. No evidence-based exclusion is currently warranted.**

The brief authorizes a human-reviewed plain-text transcript and accessible listening copy alongside the preserved original. Recommend offering them when staff capacity, technical source quality and consent/access review allow. The transcript is a separate UTF-8 text object with source audio ID, version, transcriber/editor, reviewer/approval and correction trace. Interviewer approval is required for transcript corrections. The listening copy is a separately identified derivative linked to the source; provide it through a player tested for the intended users and an independently reachable transcript. W3C WAI guidance calls for transcripts and accessible media players. LoC VHP says a transcript is complementary to, not a replacement for, the recording. [S08](https://www.loc.gov/programs/veterans-history-project/how-to-participate/transcribing-interviews/), [S09](https://www.w3.org/WAI/media/av/)

The brief does not specify codec, player, audience, delivery route or which consent permissions are in place. Select an access encoding only after identifying the received codec and testing the target environment; a `.wav` extension alone does not establish PCM, lossless data or a safe rewrite. The LoC format description explains WAVE's codec-dependent fidelity and identifies `.wav` as an extension/signifier, while its Recommended Formats Statement expresses LoC preferences rather than a mandate for this society's volunteer deposits. [S13](https://www.loc.gov/preservation/digital/formats/fdd/fdd000001.shtml), [S14](https://www.loc.gov/preservation/resources/rfs/audio.html)

If no reviewed transcript exists, keep transcript generation optional and mark it absent/pending rather than using an unreviewed transcript as authority. If a file cannot be converted or made accessible without a material compromise, retain the original and record that the optional derivative is unavailable with a reason; revisit when a supported route exists. This is a conditional exception, not a conclusion that the option is currently technically unsupported. No automatic speech recognition requirement is introduced.

OHMS is a useful later access-layer opportunity: University of Kentucky describes it as connecting word-level search to moments in oral-history media; its viewer repository has a recent observed v3.10.16 release and describes a hosted/customizable viewer requiring web-server access. It may make interviews more discoverable, but it is not a deposit/fixity format and would add hosting, consent, player and maintenance decisions. Keep the package readable without it; do not create an OHMS account or service in this research. [S10](https://libraries.uky.edu/locations/special-collections-research-center/louie-b-nunn-center-oral-history/nunn-center-resources), [S11](https://github.com/uklibraries/ohms-viewer/releases/tag/v3.10.16)

### 6. Owner decisions and external consent review

**Disposition: Preserve the stated owners verbatim as owners; no decisions were obtained in research.**

- **Collections archivist:** decides descriptive-field authority, including the conflict policy and whether selected short fields are repeated in BWF.
- **Interviewer:** approves transcript corrections.
- **Consent review:** external owner input. Identify who supplies the review and what permissions it establishes before distribution. Possession of an interview, permission to preserve, permission to create an access derivative and permission to publish/listen publicly may be distinct. Do not infer consent from possession, and do not replace review with a Boolean default or software setting.

Until the relevant owner review is supplied, the package can preserve an access-status field as “unreviewed/restricted” under a policy the owners approve, but this is a recommended fail-safe choice, not a reported society decision. Do not invent a policy, review authority, consent evidence or public release.

### 7. Negative constraints

**Disposition: Binding; the revised proposal keeps each exclusion.**

- Do not alter received originals during this research. No source WAV was supplied or edited.
- Do not promise lossless edits from a filename extension alone. WAVE can contain different codecs and fidelity depends on the actual encoding. Inspect file structure/codec, use a working copy, verify the whole-file manifest and compare an audio-data digest where the tool supports it; then listen/check the derivative. A matching audio-data digest is not a substitute for full-file fixity, and no such check was run. [S02](https://www.loc.gov/preservation/digital/formats/fdd/fdd000356.shtml), [S03](https://github.com/MediaArea/BWFMetaEdit), [S13](https://www.loc.gov/preservation/digital/formats/fdd/fdd000001.shtml)
- Do not require automatic speech recognition. Any transcript in this optional scope is human-reviewed; transcript corrections require interviewer approval.
- Do not infer consent from possession. Consent review remains external owner input.

### 8. Evidence-backed proposal, discoveries, unresolved inputs and validation

**Disposition: The table below replaces the released draft's incomplete evidence and validation status.** The source and version evidence is directly linked above and indexed by IDs. The LoC Veterans History Project transcript page was available in a search-result excerpt, but direct retrieval returned 403; that limitation is explicit in [S08](https://www.loc.gov/programs/veterans-history-project/how-to-participate/transcribing-interviews/). Documentation review and the reveal-helper operation are not product validation.

**What discovery establishes.** Public primary references describe practical BWF field/encoding constraints, a BagIt package/checksum model, PREMIS relationship/event concepts, a relevant metadata encoding history, transcript/access principles and an oral-history access tool candidate. They support a conditional sidecar-first recommendation and optional BWF/OHMS paths. They do not prove target-tool interoperability, the society's consent scope, an actual recording's codec or lossless rewrite behavior.

**Corrections, optional improvements and owner decisions.**

| Type | Proposal |
|---|---|
| Correction | Reject one comment field as the complete metadata record; BWF fields are bounded and optional/recommended field by field. Reject filenames as the sole links between recordings and photos. Reject universal metadata preservation across editors. Treat a tool listing as evidence of documented features only, not local compatibility. |
| Optional improvement | Add BagIt packaging/fixity, a compact PREMIS-inspired event/revision log, selective BWF metadata on a copy after round-trip checks, and later OHMS discovery if hosting/access needs justify it. These choices are not prerequisites to receiving a volunteer deposit. |
| Owner decision | The collections archivist chooses descriptive authority and embedded subset; the interviewer approves corrections; consent reviewer/authority and access permissions must be supplied externally. |
| Uncertain | Exact volunteer WAVE codecs/chunks, device/editor code-page behavior, downstream reader support, access encoding/player, available staffing/hosting, and consent state are unknown. No external behavior can resolve the society-specific policy choices. |

**Validation status.**

| Check | Status | Evidence / proposed observation |
|---|---|---|
| Brief, released plan and public documentation/version review | **EXECUTED — research only** | Read the supplied brief and released plan; reviewed indexed primary documentation, format references, public source/release history and a related issue. This confirms no product operation. |
| Stage disclosure/freeze | **EXECUTED — control operation only** | Ran the required reveal helper once after saving `discovery.md` and `source-map.json`; it recorded discovery SHA-256 `da02e0037cc5846af2a4ae08375b5ea8f2684f297034daefed00d9e1a0c17051` (8,637 bytes) and revealed plan SHA-256 `b80e30c3938344528a49c1b43144af18f14b0d8ed27a2603b845042467e4e067` (6,139 bytes). This does not validate the product. |
| Pilot scenario walkthrough | **PROPOSED / NOT_RUN** | Walk one deposit through receipt, photographs/notes, missing or conflicting metadata, interrupted/duplicate transfer, transcript correction and access restriction. Confirm every item remains linked and originals unchanged. |
| BagIt package completeness and checksum | **PROPOSED / NOT_RUN** | Build a sample package; verify every payload path/checksum at receipt and after copy; separately test recovery from a missing/renamed payload. Does not prove redundancy or long-term preservation. |
| Optional BWF metadata field and encoding round-trip | **PROPOSED / NOT_RUN** | Use non-production fixtures with ASCII, accented names and curly quotes; pin BWF MetaEdit and recorder/player versions; compare selected BEXT/INFO values across read/write/reopen. Test CSET absent/zero and explicit encoding only if those cases are expected. Do not test on a received original. |
| Audio preservation through an optional metadata edit/derivative | **PROPOSED / NOT_RUN** | Identify codec from content, preserve source, capture whole-file hash and tool-supported data-chunk digest, create a copy, compare expected audio samples/bitstream and play it. A `.wav` suffix or unchanged audio-only digest alone is not full validation. |
| Human-reviewed transcript and accessible listening path | **PROPOSED / NOT_RUN** | Have a human reviewer and interviewer confirm a correction trace; test transcript visibility and the chosen player with target users/accessibility tools; verify the derivative links to the correct source and is gated by the consent decision. No transcript, player or OHMS setup was tested. |
| End-to-end product/service operation | **NOT_RUN** | No install, account, production access, live writes, purchases or deployment were performed or authorized. |

## Scope limits and outstanding owner inputs

The pilot remains a portable deposit proposal, not a new recording-application requirement, mass-transcription process, online repository selection or schema implementation. Before any implementation choice, obtain the local ID convention; archivist's field authority and conflict handling; interviewer correction workflow; consent-review owner and approved access statuses; acceptable optional access format/player; accessibility criteria; and a decision about whether hosting OHMS is worthwhile. These open inputs do not defer the publicly answerable format, packaging, encoding and version-history findings above.

**Research operations:** source retrieval and plan release were performed as described. No local audio/media fixture, downloaded executable, metadata editor, BagIt validator, player or OHMS service was run. Every media/product check in the table remains proposed or not run.
