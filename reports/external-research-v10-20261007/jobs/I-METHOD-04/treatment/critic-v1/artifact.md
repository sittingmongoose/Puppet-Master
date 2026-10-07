# Independent critic — I-METHOD-04, treatment/research-v1

Critique only; this is not a final-plan rewrite. I assessed the complete semantic set and full M14 projection. The renderer is a mechanical view; judgments below concern candidate-authored content.

## Overall assessment

The draft is a useful, careful proposed plan. Preserve its bounded scope, conditional component choices, source/copy distinction, no-upload/no-write constraints, provenance sidecar, and honest separation of proposed from executed validation. Its BWF MetaEdit evidence chain is strong: v26.08 commit 318d800d92c4a3cc8a814f6fdceba0ed8b3416ec contains the PCM/WAVEFORMATEXTENSIBLE-PCM bit-alignment warning; PR #207 introduced the prior check; issue #214 reports valid 24-bit mono files rejected; PR #218 changes the arithmetic and records a user CLI retest. Current code supports applicability of the correction; the issue and retest remain user evidence, not independent reproduction. See [verified sources](sources/review-evidence.md).

The proposed P1–P6 plan covers all frozen decisions and O1–O6 topics. It is not ready for finalization unchanged. Corrections below retain its findings while tightening product meaning and claim strength.

## Material to preserve

- P1 preflight, staging, source/copy fixity comparison, explicit incomplete states, retry checks, no source mutation, and explicit disposition of collisions, special, and unreadable inputs.
- P2 separate extracted metadata and archivist corrections, parser/version/warning record, read-only display, and BWF MetaEdit's limited role.
- P3 explicit request, separate derivative identity, explicit stream/settings, metadata policy, provenance, failure disposition, and no preservation-quality claim.
- P4 BagIt alongside an app event record: RFC 8493 covers payload manifests/fixity, not original-to-derivative event meaning.
- P5 offline Windows/Linux and no-upload constraints, conditional FFmpeg/ffprobe shortlist, BWF-specific option, and downstream-only Archivematica analogy.
- P6 synthetic interruption, malformed metadata, multi-stream/channel, conversion, package-mutation, and restart cases. The researcher correctly says none were executed.

## Corrections and omissions for the reviser

1. **P3 preview:** “an output preview or short synthetic/sample preview” allows an unrelated sample to stand in for the transformation the archivist is requesting. Frozen P3 requires preview of the intended transformation. Require a local preview generated from the selected input with the selected codec/rate/channel/metadata settings, or an equivalent preview that exposes those exact effects; require confirmation before committing the derivative. Research and validation examples remain synthetic; do not upload or use private interview audio as research evidence. This is my principal disagreement.

2. **FFmpeg claim strength:** “the strongest broad-format CLI candidate” is unsupported by the submitted evidence: live docs only, no pinned release/source/binary, comparative format matrix, packaging, or license review. The official docs do support the risks cited: -map controls selection, omission invokes automatic selection, and metadata has defaults. Keep FFmpeg as one conditional candidate; remove “strongest” and do not treat it as selected. Before adoption, compare a pinned build with a plausible alternative on required WAV/BWF, FLAC, and MP3 fixtures plus offline Windows/Linux packaging. The BWF code study fulfills O2 but does not validate FFmpeg.

3. **P2/P6 severity conflict:** P2 preserves warning/error text and avoids auto-repair, while P6 asks malformed/misaligned files to produce a warning. Do not require every malformed/truncated file to warn. Test nonfatal PCM alignment as a warning when the chosen parser classifies it so; test truncated/structurally invalid inputs as parser errors, rejection, or explicit manual disposition. Check source immutability on both paths.

4. **P1 reproducibility:** Stable IDs alone do not define collision-safe destinations. Retain the exact source-relative path, define deterministic destination naming/escaping and case/Unicode/reserved-name behavior, and test that collisions never overwrite silently. Record the digest algorithm with every fixity value and choose a non-BagIt default before implementation; BagIt's SHA-256/SHA-512 support and SHA-512 default do not automatically govern an app-native package. Add a near-capacity/large-file test; a 100-file count alone does not bound storage.

5. **Personal-material handling:** Offline/no-upload is necessary but leaves temporary derivatives, staging, playback caches, crash reports, logs, recent-file lists, and backups unspecified. Add a local-data inventory and decide location, access, retention/cleanup, and whether diagnostic logs can contain names or metadata. Keep this technical, not a rights decision.

6. **P4 verification limits:** BagIt completeness and checksums do not authenticate who created/changed a bag. Keep that limit explicit. Specify whether unexpected files at package root, payload, and tag areas are rejected or reported and test each. Event records should identify source/derivative digests, effective settings, tool version, operator action, time, and result; do not imply tamper-evident history without a separate mechanism.

7. **Input provenance:** Researcher's source-map lists cases/I-METHOD-04/INPUTS.md and research-v1/input-map.json as input documents, although neither is in this critic map's exact-input boundary. I did not read them. Confirm whether they were authorized for the research stage; do not rely on claims that depend on them unless admitted. This does not undermine the public code/source checks.

## O1–O6 disposition

- **O1 discovery:** Useful brief-led sources beyond the frozen plan: LOC custody practice, BWF MetaEdit, BagIt, FFmpeg/ffprobe, and Archivematica as a broader analogue. Preserve negative boundaries. LOC is institutional analogy, not a mandate for this product.
- **O2 pinned code:** Satisfied for BWF MetaEdit. Riff_Handler::Open delegates to Open_Internal; pinned code checks PCM and extensible-PCM fields and records a warning for bit misalignment. Field and data-size definitions are cited. This is not a general WAV/FLAC/MP3 validity rule and does not validate FFmpeg.
- **O3 history:** Satisfied with limits. PR #207 → issue #214 → PR/commit #218/8337405 → current v26.08 code is coherent. Keep user-report/manual-retest caveats; do not call it automated regression evidence or proof of a v21.07 package.
- **O4 comparison:** P1–P6 crosswalk has exact plan references and retain/refine/conditional dispositions. Apply corrections above; broader-project coverage remains unknown.
- **O5 criticism:** This critic result now exists. The final reviser must preserve each correction, disagreement, and unresolved provenance item with an explicit accepted/rejected/uncertain disposition. The current CRITIC_DELIVERABLE finding is stale for finalization.
- **O6 proposed change:** The document is a coherent full P1–P6 proposal with rationale, choices, validation, and uncertainty, not a lead list. Incorporate required corrections and keep proposed checks separate from executed checks.

## Validation and open items

Executed by this critic: read exact brief/plan and complete semantic/projection; inspected pinned BWF source/definitions, issue/fix/release history, RFC 8493, official FFmpeg/ffprobe documentation, captured LOC JSON, and Archivematica 1.16 docs. No build, binary, application, or audio fixture was run.

Proposed: (a) selected-source preview with exact settings before derivative commit; (b) path collision and near-capacity copy tests; (c) malformed/truncated severity and source immutability tests; (d) missing/changed/extra payload and tag tests; (e) temporary-data/log cleanup checks; (f) pinned FFmpeg-versus-alternative format, metadata, offline packaging, license, and failure comparison using synthetic files.

Unresolved product choices: non-BagIt hash default; destination mapping; local temporary-data retention; preview duration/presentation; warning acceptance; derivative codec/quality/channel policy; and receiving repository/package profile. No disagreement changes the frozen scope.
