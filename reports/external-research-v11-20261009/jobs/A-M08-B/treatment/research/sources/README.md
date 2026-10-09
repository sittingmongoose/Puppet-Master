# Source evidence index

Evidence notes are bounded working notes, not full-page copies. Each note records what was observed, relevant locators, and limits. The source map is the canonical registry for exact URLs, versions, access timestamps, and retrieval operations. Public webpages can change; pinned GitHub tags/commits and RFC/standard versions are noted explicitly.

- [S02 — University of Kentucky OHMS resources](evidence/S02-ohms-resource.md): OHMS search-to-time behavior; free account and current tool link.
- [S03 — OHMS Viewer 3.10.15 release](evidence/S03-ohms-v31015.md): cache-folder HTTP access mitigation and release commit.
- [S04 — OHMS Viewer 3.10.12 release](evidence/S04-ohms-v31012.md): index-to-transcript navigation regression/fix.
- [S05 — OHMS Viewer installation and player integration](evidence/S05-ohms-viewer-readme.md): external media-player customization, synchronization QA, GPL-3.0.
- [S06 — Aviary OHMS transcript module](evidence/S06-aviary-transcripts.md): transcript editing, speakers, timecodes, exports, legacy format.
- [S07 — Aviary indexes and access granularity](evidence/S07-aviary-indexes.md): timed segments, index-level visibility, formats.
- [S08 — Aviary media/storage permissions](evidence/S08-aviary-media.md): item/media/status layers, expiring media leases and storage notes.
- [S09 — Mukurtu v4 cultural protocols](evidence/S09-mukurtu-protocols.md): open/strict, content/media protocols and sync.
- [S10 — Mukurtu audio and sharing settings](evidence/S10-mukurtu-audio.md): required protocols and All/Any semantics.
- [S11 — Omeka S media and user roles](evidence/S11-omeka-media.md): item/media public-private controls and system roles.
- [S12 — Whisper v20250625 model card and code](evidence/S12-whisper.md): supported tasks, training data, limitations, timestamps.
- [S13 — Whisper original paper](evidence/S13-whisper-paper.md): benchmark and multilingual-data findings; external-validity limit.
- [S14 — Whisper v20250625 changelog](evidence/S14-whisper-evolution.md): security/device/timestamp evolution.
- [S15 — Oral History Association guidance](evidence/S15-oha.md): consent, approval, archive access, rolling consent and copyright.
- [S16 — Library of Congress BWF/WAVE guidance](evidence/S16-loc-audio.md): archival master and preferred media-independent audio.
- [S17 — IETF RFC 8493](evidence/S17-bagit.md): BagIt v1.0 structure and checksum validation.
- [S18 — PREMIS 3.0](evidence/S18-premis.md): Object/Event/Rights/Agent preservation model.

## Use

Cite the stable source ID in discovery.md and draft.md, then follow the source-map.json entry to the URL and locator. Proposed validation cases are clearly labeled as proposed; there are no local product-test results in this evidence set.

## Post-reveal source addendum

- [S19 — Aviary pricing](evidence/S19-aviary-pricing.md): displayed subscription/resource tiers, per-minute ASR estimate, and price caveats.
- [S20 — OHMS Viewer v3.10.15 timestamp code](evidence/S20-ohms-timestamp-code.md): exact VTT time conversion and index-to-transcript association behavior in the pinned code.
- [source-map-addendum.json](../source-map-addendum.json): exact versions, commits, locators, access times, observed operations and scope for S19/S20; also resolves the full S04 commit SHA.

The pre-plan discovery.md and source-map.json remain unchanged. These sources were added while revising the final draft after plan comparison.
- [S21 — OHMS Viewer v3.10.14 legacy PDF fix](evidence/S21-ohms-v31014.md): release-note evidence for no-timecode legacy transcript PDF handling.
