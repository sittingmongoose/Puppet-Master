# Draft proposal — oral-history intake and transcript handoff
Run A-F02-A8 · investigator stage · based on the exact released plan

## Proposal at a glance

Build a local, batch-first intake workflow with four independent records per donation: the immutable media copy and its fixity; technical identification/probe results; preview capability; and transcript/permission associations. A review can accept or reject an original without requiring a preview decode, but a preview failure must never be presented as an unreadable original. A missing transcript is a normal state. Missing or conflicting usage permissions hold the item from release. No speech recognition, cloud service, or mandatory transcoding is part of this proposal.

Do not choose a single media stack or supported-codec promise yet. FFmpeg/ffprobe, GStreamer, and Symphonia offer feasible alternatives with different packaging, support, security, and integration costs; DROID/PRONOM can supply an independent signature-based format identity but cannot decode. The release-specific capability matrix must say which exact build can identify, probe, and preview each format. The known upstream evidence already rules out treating FFmpeg 9.0.2 as safe without a fix: an advisory published 2026-10-08 reports crafted-MP4 stack exhaustion through that release [S01, S06]. GStreamer 1.28.8 is the stable series current at review, and its security advisory says that release fixes the reported RTP/SDP issue; that issue is not the local-file path in this brief [S07, S10]. This is a research proposal, not a library selection, implementation, migration, or deployment.

The discovery report is [discovery.md](discovery.md); source IDs below resolve through [sources/index.md](sources/index.md) and [source-map.json](source-map.json). Source claims are tagged. Design choices and implications are identified as proposal or owner decision rather than presented as product facts.

## Proposed end-to-end flow

### 1. Open a batch without touching media content

Create a durable batch record and a row for each spreadsheet donation before probing the audio. Keep the supplied donation identifier, original path as a local-only source locator, exact permission text supplied by staff, and the original row/source location. Preserve the spreadsheet's raw text. The portable export should carry relative payload paths, not workstation-specific absolute paths.

A local SQLite job database is one feasible checkpoint store: write each item transition in its own transaction, and persist the source hash and tool/build identity with the transition. SQLite documents atomic transaction behavior under its filesystem assumptions but explicitly warns that broken flush/fsync or network-filesystem locking can defeat those guarantees; keep the active database on a local filesystem, with tested durability settings [S19]. An append-only event file with atomic checkpointing is another feasible design. No storage backend was executed; SQLite is one proposed local journal.

On restart, recheck source identity before reusing a previous result. If the file has changed, move it back to review/probe rather than attaching stale metadata. Treat a correction to a transcript as a transcript transition only; it must not rerun media copy/probe or create a second catalog object.

### 2. Preserve and verify each original

Read the submitted audio without writing tags or replacing its bytes. Compute SHA-256 and byte size before inspection. Copy exact bytes into a staging payload, initially under a temporary name, then hash the copy and compare it with the recorded source hash before marking the copy complete. Finalize with an atomic rename when the copy and metadata journal are complete. A failed or interrupted copy remains incomplete and is safe to retry.

Do not make an archive, conversion, metadata rewrite, or sidecar edit to the received source. Any temporary decode needed for playback is an output of a preview pipeline, not the item of record; keep it transient or in a disposable cache keyed to the source hash and channel mapping. If the museum elects to retain preview derivatives, record that they are derivatives, preserve the original, and keep their provenance separate. No derivative is required for acceptance or catalog transfer.

### 3. Identify, probe, and report duration with limits

Treat the extension as a clue, not format truth. Run a local signature/format identification step where useful, then a bounded metadata probe. Store the identifier's result and confidence separately from the parser's result. DROID/PRONOM is a batch signature-identification option, but is not a media decoder or corruption test [S17].

Record at minimum:

- exact filename and source locator (private/local), byte size, SHA-256, and intake time;
- identified format/signature and evidence, plus actual parsed container/demuxer and exact parser name/version/build;
- every audio stream's stream index/ID, codec, sample rate, channel count, channel mask/layout and whether the mapping was absent/unknown, bit depth/sample format where present, and any tags captured;
- raw reported duration, units/time base where applicable, selected display duration, probe method/limits, and an explicit unknown, partial, timed-out, or estimate reason instead of a fabricated zero/precise value;
- parser diagnostics and preview diagnostics in different fields.

ffprobe exposes machine-readable JSON and distinct format, stream, and error sections [S02, S04]. Its documentation describes a default five-second analyzeduration; more probing can improve detection while increasing latency, and duration estimation is not extended at all costs [S03]. Therefore duration is a measured parser report, not an acceptance oracle: preserve the raw value and how it was obtained; let staff review missing or implausible values. The exact probe duration/resource limits are an implementation and testing choice.

The three parser families have materially different support boundaries:

| Candidate | Evidence-backed fit | Explicit boundary |
|---|---|---|
| FFmpeg/ffprobe | Broad demuxer/codec ecosystem and JSON metadata output; FATE has dedicated format-writer tests [S02, S04–S05]. | Support depends on the shipped configure/build options. Current stable was 9.0.2 at review, and a published advisory identifies that version as affected by a crafted-PSSH stack-exhaustion path; a patched upstream version or verified fix is a prerequisite, with an isolated, resource-limited worker still recommended [S01, S06]. |
| GStreamer | Discoverer reports streams, tags and duration and can run asynchronously; its result enum separates invalid URI, error, timeout, busy and missing plugins [S08–S09]. | Runtime plugin set, distribution packaging and renderer determine actual behavior. Missing plugins mean full discovery is incomplete, not that bytes are corrupt. Some error results may still carry partial information [S08]. Pin and update the complete runtime/plugin set; do not enable network URI sources for this local intake. |
| Symphonia 0.6.1 | Rust-native probing/demuxing/decoding with modular codecs and formats [S11]. | The default feature set is narrower than the advertised support list: e.g. AAC-LC, ALAC, AIFF, CAF, MP3 and ISO/MP4 features are not all enabled by default. Project status also distinguishes Good/Great/Excellent; v0.6.1 release notes include concrete decoder fixes and malicious-input hardening [S11–S13]. Select features deliberately and test the chosen build. |
| DROID/PRONOM | Adds independent byte-signature identification for batches [S17]. | Does not provide stream metadata, duration, decoder support, preview, or proof of file health. |

Keep identified, metadata readable, and preview available independent. A file that parses but has no decoder/audio-output plugin can be marked “preview unsupported by this installation” and sent to catalog review where other acceptance criteria are satisfied. If an identifier recognizes a format but no parser can read it, show “format identified; metadata unreadable here” or “needs manual review”, not “unsupported preview.” If bounded parsing cannot establish usable media facts, mark “could not read media” and preserve the exact diagnostic. GStreamer documents both missing-plugin and other result states; its sample caller ultimately treats every non-OK as “cannot be played”. The intake should retain the API's richer distinction instead of copying that binary presentation [S08–S09].

### 4. Preserve channel evidence and make audition optional

Store the technical stream index and channel index/layout exactly as reported. Keep technical positions (e.g. front-left/front-right or unknown) separate from staff's speaker labels. A two-channel recording may represent two microphones/speakers; do not infer narrator/interviewer from channel order or standard stereo labels. GStreamer documents channel masks and default position conventions, while audioconvert offers an explicit input/output mix matrix; these are processing mechanics, not evidence of which human spoke on which channel [S18, S20].

Offer “both channels”, “channel 1 only”, and “channel 2 only” audition when the selected preview stack can do so. Do not downmix before staff review. A decoded pipeline may select/remap channels only for playback, leaving source bytes unchanged. The exact plan correctly leaves timing alignment and the need for any conversion unresolved: API docs establish that channel conversion is possible, but do not establish correct alignment for this museum's files or prove that every original can be previewed without a temporary decode/conversion. Keep the original authoritative; test sample-accurate seek, channel isolation, duration/timeline alignment and audible speaker separation on permitted fixtures before making an implementation claim. If a preview cannot be generated, log that status, keep the source, and let staff continue the non-preview review.

### 5. Match transcripts conservatively and keep corrections as versions

Use the spreadsheet's donation identifier as the association key. Preserve the raw identifier and the normalization policy/version. The released plan's filename-stem rule—lowercase and remove spaces—may be used to make a candidate match, but is not safe as an unverified auto-binding rule. Require a unique mapping from spreadsheet row to media and transcript before linking. Check for duplicate/colliding normalized stems and absent IDs; ambiguous, fuzzy-only, or missing-ID cases go to manual review. Do not silently choose by directory order or basename.

Keep the submitted transcript file unchanged as an attached object with its own size/hash, source filename, received time and any supported format/encoding facts. A correction creates a new transcript version linked to the same donation ID and marks the prior version as superseded only after staff review. Preserve both byte sequences and their association history. Do not remove the earlier version, change audio status, or repeat the media probe when a corrected transcript arrives.

A missing transcript is represented as “No transcript provided” (or the configured neutral equivalent), separately from every audio state. The brief prohibits sending recordings to cloud transcription; this proposal does not request local or cloud ASR. The transcript is supplied by the museum/donor or remains absent.

### 6. Hold permission ambiguity and release rules

Store the exact permission text and spreadsheet source alongside a controlled interpretation only if the museum's owner defines and approves a mapping. Never infer permission from a filename, transcript, donor identity, or prior item. Treat missing, conflicting, or unrecognized terms as “permission needs staff decision”; retain the intake copy in its controlled staging location but block release/export according to the released plan. Make the hold visible and keyboard-operable. Catalog intake, permission review, and release/transfer are separate lifecycle states.

### 7. Make batch restart idempotent and scale from 40 to 500

Give each batch and each donation row a stable ID; give each media/transcript object a content hash and relative object path. Persist transitions such as queued → copy complete/hash verified → identified/probed → reviewed → export ready. A retry of the same row/source hash resumes the incomplete stage and cannot duplicate a completed item. A changed source hash creates a new review event instead of overwriting prior intake evidence.

Run work with a bounded worker pool and explicit per-item probe/preview timeout, memory ceiling, cancellation and retry policy. Processing libraries accept complex untrusted files, so parse local files only in an isolated worker where the chosen platform permits it; do not allow network URLs, external upload, or embedded instructions to cause network access. Report progress as rows completed/total, with a batch summary and per-item status. The workload size does not justify loading 500 media files into memory: stream hash/copy/probe, keep only bounded work active, and measure throughput with the proposed test batches. No capacity result is claimed here.

### 8. Export a self-contained, relocatable directory

Export a directory package containing:

- a lossless UTF-8 JSON manifest with stable donation/object IDs, relative payload paths, technical metadata and provenance, independent media/preview/transcript/permission/release states, and diagnostics;
- a staff-friendly CSV projection for inventory/review (the JSON remains authoritative for nested streams, version history and null reasons);
- exact-byte copies of accepted original media and supplied transcript files under stable, collision-resistant relative paths;
- SHA-256 payload manifest and package metadata, with a BagIt 1.0 profile/layout as a feasible packaging convention.

BagIt treats payloads as opaque octets and defines complete/valid bags through manifests and checksum verification; its SHA-256 support and payload rules fit a handoff that does not rewrite audio [S14]. Include relative references that resolve inside the package. The plan's assumption that a receiving catalog will resolve references after someone copies a folder is unsupported until that catalog's import contract is known. A self-contained package avoids that assumption; if the real receiving catalog requires a different import format, the owner must approve the adapter and the handoff must be validated after relocation. Do not export raw workstation paths or permission guesses.

### 9. Keyboard review and accessible status

Keep the table and detail flow operable with keyboard alone: predictable focus order, visible focus, named actions, channel controls with text labels, no keyboard trap, and status text that does not rely on color or icons alone. Give each row concise text for unreadable media, partial metadata, preview unsupported, transcript absent/revision pending, and permission hold. Batch progress and item-level results must be available as text and programmatically exposed through the selected toolkit's accessibility API.

For asynchronous announcements, announce meaningful milestones and errors without moving focus. Coalesce rapid per-file updates into a readable count/summary, keep individual row status available on demand, and let staff choose a quieter or more detailed announcement mode if the UI produces too much speech. WCAG 2.2 supports logical keyboard focus order and programmatically determinable status messages for markup-based content [S15–S16]; exact announcement cadence and the mapping to a native toolkit remain implementation questions. Verify with actual keyboard and screen-reader use rather than treating conformance language as a substitute for user testing.

## Exact released-plan clause dispositions

| Plan clause | Disposition | Reason and effect |
|---|---|---|
| P1. Create the batch manifest before examining recordings. | **Keep; strengthen.** | Create batch and item rows from the spreadsheet first. Persist only supplied facts at that point; later parsing appends results rather than mutating the source row. |
| P2a. Store donation identifier and original path. | **Keep; constrain export.** | Preserve the exact identifier and local original locator in the intake journal. The package should use stable relative paths and avoid machine-specific absolute paths. |
| P2b. Store permission text supplied by staff. | **Keep exactly; do not guess.** | Preserve raw source text and row provenance. Controlled interpretation requires an owner-approved vocabulary; unknown/conflicting values block release. |
| P2c. Store byte hash and separate probe/preview statuses. | **Keep; extend.** | Use SHA-256 for source and copy, plus distinct identification, metadata, preview, transcript, permission and release states. The RFC 8493 handoff manifest is a proposed package control, not a substitute for intake/source hash [S14]. |
| P3. Copy originals without alteration, then probe container/channels/duration. | **Keep; add a verified staging boundary.** | Copy exact bytes to a temporary destination, hash-compare and atomically finalize before declaring it complete. Probe each stream and capture codec/layout, parser/build and duration provenance. |
| P4. Preview is optional; successful cataloging need not require playable preview. | **Keep; specify status semantics.** | Readable/identified original can proceed through review when preview is unavailable, subject to permission and other acceptance rules. A missing decoder/output is an unsupported-preview warning, not an unreadable-original decision [S08–S09]. |
| P5. Associate transcript when filename stem matches ID after lowercasing/removing spaces. | **Revise to candidate matching only.** | Use the spreadsheet ID as authority. The filename rule may propose a match, but require uniqueness and human review of collisions/absent IDs before binding. |
| P6. Later transcript replaces the current association while preserving the prior file. | **Revise to explicit versioning.** | Keep immutable transcript versions and their IDs/hashes. A reviewed correction may become current while the prior version remains addressable; never overwrite bytes or rerun audio intake. |
| P7. Normalized stems are assumed unique and spreadsheet IDs consistently present, neither checked. | **Reject the assumption; retain as open data question.** | No collection or sample spreadsheet was inspected. Add uniqueness/required-ID checks and a hold state. Confirm real data consistency only with an authorized sample or the museum's owner. |
| P8. Permission can be unknown and block release instead of being inferred. | **Keep as a hard rule.** | Missing, conflicting and unrecognized permissions remain visible holds. Staff decide; no automatic inference or release. |
| P9. No cloud transcription. | **Keep as a hard rule.** | No transcription service is proposed. Missing/corrected transcripts stay independent from media states. |
| P10. Keyboard-navigable table with text status for accepted, review, unsupported preview and unreadable original. | **Keep; refine.** | Use text labels and accessible row actions; state details distinguish parser failure, plugin gap, timeout and partial metadata. |
| P11. How to avoid overwhelming screen-reader users with progress announcements is unresolved. | **Propose a testable policy; keep exact cadence open.** | Announce coalesced progress/milestones and critical errors without focus theft; expose per-item details on demand. Tune verbosity with keyboard/screen-reader testing. The cited W3C criterion does not prescribe an exact frequency [S16]. |
| P12. Export a directory with manifest, transcripts and media references. | **Keep; require relocatable, self-contained content.** | Include unchanged media/transcript payload copies, JSON manifest, CSV projection, relative paths, build provenance and checksums. Use BagIt 1.0 as one feasible convention, subject to receiver needs [S14]. |
| P13. Assume receiving catalog resolves references after folder copy. | **Reject as unsupported.** | The catalog/API is unspecified. Do not assume path semantics; use internal relative package paths and validate a real catalog adapter once the target contract is known. |
| P14. Investigate channel preview/timing before deciding conversion. | **Keep open; sharpen investigation.** | GStreamer channel metadata and mix-matrix APIs show channel-aware processing is feasible, but do not establish correct speaker identity or timing for these files [S18, S20]. Do not require conversion; test playback/channel isolation/seek alignment with permitted fixtures first. |
| P15. Validate renamed extensions, interrupted restart, corrupt files, stereo speakers, transcript corrections and keyboard/screen reader. | **Keep all; expand.** | Preserve each proposed case and add collisions/absent IDs, permissions, unknown signatures, missing plugin, timeout, hash mismatch, 40/500 item batches, cancellation/recovery, relocated export verification and adversarial files in a qualified sandbox. |
| P16. No collection files inspected and no validation executed. | **Keep; accurate at this stage.** | No collection or media was inspected, and no code, parser, application, or catalog validation was run. The only executed checks were local artifact integrity/release checks described below. |
| P17. Provisional draft; resolve assumptions with primary evidence and keep unanswered user-data questions open. | **Keep.** | This draft is grounded in the indexed primary sources and labels open data/catalog decisions rather than filling them by assumption. |
| P18. No product deployment requested. | **Keep; scope boundary.** | This is research and planning only. It does not create an implementation, change a catalog, ingest actual donations or deploy software. |

## Brief coverage checklist

| Original brief obligation | Proposed disposition |
|---|---|
| Format identification despite inconsistent extensions | Extension is advisory; use signature evidence plus parser-reported container, keep identity and parser success distinct. |
| Metadata and duration extraction | Record per-stream metadata, raw duration, units/method/limits and explicit unknown/partial states. |
| Two channels with different speakers | Keep raw indexes/layout; permit optional independent audition; never infer speakers from channel order. |
| Transcript association and later correction | Spreadsheet ID is authoritative; filename normalization is a candidate; preserve immutable transcript versions and history. |
| Safe restart for batches of 40, up to 500 | Stable item IDs/hash, durable per-item state, local transaction journal, bounded concurrency, idempotent resume and measured capacity. |
| Portable catalog handoff, no catalog API fixed | Relocatable self-contained directory, JSON/CSV, relative references, exact payload bytes and verified checksums; owner decision for downstream mapping. |
| Distinguish unreadable media from unsupported preview | Independent identification/probe/preview statuses and separate warnings. |
| Missing transcript is not failed audio | Neutral transcript status, separate from every media state. |
| Keyboard operation and meaningful textual status | Keyboard-only operation, visible focus, text and accessibility API state, coalesced announcements. |
| No fixed codec; explain where support ends | Compare FFmpeg, GStreamer, Symphonia and DROID boundaries; maintain versioned build capability matrix. |
| No byte changes, permission guessing, cloud transcription, or mandatory transcoding | Exact-copy/hash workflow, missing/conflicting permission hold, no ASR service, optional preview only. |

## Validation plan versus execution record

**Proposed, not run:** validate renamed extensions and signatures; compare parser metadata/duration with reference tools; exercise malformed/truncated/unknown media and missing plugin/output; inspect mono/stereo/multichannel and speaker-separated samples; verify original/copy hashes; interrupt and resume at every durable boundary; test duplicate/absent IDs and transcript revisions; check missing/conflicting permissions; benchmark 40 and 500 items; check bounded memory, cancellation and duplicate-free export; test channel isolation and timing alignment; operate the UI with keyboard and screen reader; relocate and verify the package on another path/machine; run malformed files only in an already-qualified sandbox.

**Actually executed:** read the exact brief, assignment, input map, and released plan copy; reviewed sources listed in source-map.json; saved discovery/source map before the single release helper; checked discovery size/source-map shape and recorded SHA-256 3c4ba44e4b0bfba8cd4eca65eec1b9dcb2f5e31dd2771fda8ed662b19e942c5c; the helper confirmed that exact hash and released this plan once. No sample files, media, application code or tests were run. Artifact-preparation checks do not count as product validation.

## Owner decisions still required

1. What operating systems and offline/network constraints apply to the shipped app?
2. What spreadsheet ID syntax, permission vocabulary, and real uniqueness guarantees can the museum confirm? Who resolves ambiguous joins and permissions?
3. Which receiving catalog and import contract will consume the package? Does it require a BagIt package, a particular CSV/JSON schema, or copies in a specific location?
4. Which codec/container/version matrix is acceptable, and which local exemplar files may be used to verify support?
5. What speaker/channel labels do staff need, and which two-channel recordings are actually isolated voices versus ordinary stereo?
6. What screen-reader platforms and announcement verbosity do volunteers use?

Until those facts are supplied and tested, keep codec acceptance, transcript auto-linking, catalog path semantics, permission interpretation, conversion policy and the final parser/playback stack open.
