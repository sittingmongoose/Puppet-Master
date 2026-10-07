# I-METHOD-04 research-v2: proposed revision for the oral-history ingest desk

**Status:** `DIAGNOSTIC_UNQUALIFIED` — this is a research proposal, not a product-quality or speed result. No application was built, no media was processed, and no conversion recipe was validated.

**Scope held fixed:** one archivist, batches of up to 100 selected WAV/BWF, FLAC, and MP3 files; no speech transcription and no public publishing. This proposal does not provide legal advice or automate rights decisions. References `[S01]`–`[S18]` resolve to public source URLs and local byte captures in `source-map.json`.

## 1. Open discovery findings (O1)

Discovery began from the archive's needs—inspect removable-drive media, keep originals, make optional listening copies, and record the work—before comparing the frozen P1–P6 choices.

- **Archivematica is a useful workflow analogy, not a scope match.** Its transfer workflow assigns file identifiers and checksums, verifies supplied checksums, and records original order in METS. Its ingest workflow has explicit normalization decision points. Its manual-normalization guide links original and derivative files and supports PREMIS event details, but its documented manual workflow expects a one-to-one filename relationship. That supports explicit source-to-derivative relationships and inspectable workflow states; this small local desk does not need to adopt Archivematica's broader pipeline or its automated decisions. [S14, S15]
- **BWF MetaEdit is a focused BWF metadata product.** Its documentation describes technical metadata tables, structural warnings, selectable validation rules, and CSV/XML export. It also has commands that edit and save embedded metadata. The useful analogy is to present observed embedded values and validation warnings separately from archivist-entered corrections. Do not make the ingest desk silently apply BWF MetaEdit-like edits to source files. These docs concern BWF/WAVE and do not establish equivalent support for FLAC or MP3. [S09, S11, S13]
- **Whole-file integrity differs from audio-bitstream integrity.** BWF MetaEdit's embedded MD5 covers the audio data chunk while excluding metadata chunks, specifically so metadata can change without changing that audio-only checksum. That is useful for a separate audio-stream check, but it cannot replace a whole-file fixity digest for an untouched original or package member. [S12]
- **Preservation format preferences are not listening-copy requirements.** The Library of Congress describes BWF/LPCM as a preferred archival master for mono/stereo reformatting and prefers uncompressed audio and higher sampling/word length in that context. This does not decide the right access derivative for these interviews, nor justify transforming an already-digital source. Keep derivative codec, channel, and quality settings as explicit archivist/product choices. [S09, S10]
- **BagIt offers a concrete directory-package model.** RFC 8493 treats payload files as opaque bytes, requires a payload manifest to name every payload file once, and defines a valid bag as complete with every manifest checksum verified. `Payload-Oxum` can cheaply detect incomplete payloads, but is only an optimization and cannot by itself establish validity. BagIt can also carry a `fetch.txt` with payload holes; that optional capability conflicts with this desk's offline, complete-local-package behavior and should be disabled by policy. [S01 §§1.3, 2.1.2–2.1.3, 2.2.2–2.2.3]

These findings support a staged copy, explicit user decisions, read-only inspection, and complete package verification. They do not establish that any product is the right application dependency.

## 2. Pinned component code and implementation history (O2–O3)

### Evaluated component

I inspected **Library of Congress `bagit-python` v1.9.0**, pinned to tag commit `861ddacb339d5b92659f0187a402f501d841abbe`. The exact source files are captured as `[S02]` (`bagit.py`) and `[S03]` (`test.py`); the release record is `[S04]`.

In that pinned source:

- `Bag.validate()` (`bagit.py`, `Bag.validate`, around line 586) defaults to `fast=False` and calls structure validation, `validate_fetch()`, then `_validate_contents()`. `_validate_contents()` (`bagit.py`, around line 778) checks Payload-Oxum when present, returns early only when `fast=True`, then checks manifest completeness and calls `_validate_entries()` for hashes. `_validate_entries()` (around line 860) computes file hashes, compares them with manifest values, and in the multiprocessing path calls `pool.close()` and `pool.join()` after a successful `pool.map()` (around lines 889–890). This supports using a strict, full validation mode as a candidate behavior; it does not make a `fast=True` check equivalent to fixity verification. [S02, S01 §2.2.2]
- The pinned tests contain `test_validate_flipped_bit()` (around line 100): after changing a file without changing its size, ordinary validation is expected to raise a checksum error while fast validation succeeds. `test_validate_pool_error()` (around line 462) simulates `multiprocessing.Pool` construction raising and checks that the original `RuntimeError` is propagated rather than masked by an unbound pool variable. These are inspected regression tests, not tests run for this research task. [S03]
- **Do not use `make_bag()` directly on the removable source directory.** In this release, `make_bag()` (`bagit.py`, around line 141) changes into the selected directory, moves its children into a temporary directory and renames that directory to `data/`; it requires write access and changes the directory layout. It also writes `BagIt-Version: 0.97` (around line 243). Package only a verified working copy, and do not assume this writer produces BagIt 1.0. [S02]
- **The v1.9.0 writer has a material path-encoding limitation.** Its `_encode_filename()` (around line 1405) replaces CR and LF but does not percent-encode `%`. RFC 8493 §2.1.3 requires percent-encoding `%` as well as CR/LF in manifest paths. The still-open `bagit-python` issue #157 describes the same incompatibility, including a `%0A` example. The pinned v1.9.0 code and issue record therefore disqualify this version as the production writer for a BagIt 1.0 package when exact filenames must be preserved. [S01 §2.1.3, S02, S18]
- The release's `validate_fetch()` explicitly accepts a `file:` URI without a URL netloc (around line 776), following the merged fix for issue #153. This matters to validator behavior but is not a reason to permit `fetch.txt` or remote payload in this product. [S05, S06, S02, S04]

### Issue, fix, regression, and release applicability

Issue #173 reported that multiprocessed validation could raise `UnboundLocalError` if pool creation failed and could fail to join worker processes. The issue remained open at capture. PR #183 merged on 2024-10-16; its description and diff replace unconditional pool termination with close/join after the map, and add `test_validate_pool_error()`. Release v1.9.0 lists PR #183, and the pinned release source contains the corresponding code and test. This is concrete fix and release evidence for the successful-map and pool-constructor-error paths. It is not proof that every exceptional `pool.map()` path is cleaned up: the pinned code does not put close/join in a `finally` block, so that failure path remains a validation proposal for any adopter. Do not report the issue as fully resolved merely because a related PR merged. [S16, S07, S08, S03, S04]

A second useful evolution is issue #153: the validator rejected a valid `file:///...` fetch URI because it had no network location. PR #154 merged a code change permitting the `file` scheme, and v1.9.0 release notes and pinned code carry that behavior. The PR reports its test suite passing and links a proposed conformance fixture, but the linked conformance-suite PR #14 remained open at capture; the pinned `bagit-python` `test.py` has no explicit `file:` URI regression case. This is evidence of a shipped parser change, not a claim that the broader conformance fixture was merged or that the desk should use file-URI payload references. [S05, S06, S17, S02, S03, S04]

**Component disposition:** retain BagIt 1.0 as a package-format option, not as a settled dependency. `bagit-python` v1.9.0 is a useful validator/code reference, but its `make_bag()` writes 0.97 and its manifest path encoder is not conformant for `%`. Select or build a writer only after a pinned implementation passes the exact path, version, and cross-platform tests proposed below. This conclusion is limited to the supplied P1–P6 plan slice; no wider project architecture or existing-component coverage was supplied or inferred.

## 3. Comparison with each frozen plan decision (O4)

| Frozen decision | Disposition | Proposed change and evidence |
|---|---|---|
| **P1 — Batch capture:** selected WAV/BWF, FLAC, MP3; copy originals; fixity; preserve names and relative folders without source edits. | **Retain, add explicit failure and path handling.** The central choice is sound and remains in scope. | Make copying a staged operation with per-file states; hash source and destination bytes and do not mark a copy complete until they match. Preserve original relative paths and names where representable; detect path traversal, case-fold collisions, reserved names, and duplicate destinations before writing. Keep a reversible mapping when a package path must differ from a source path, and preserve the original path in provenance. Archivematica's checksum and original-order steps are useful analogies, not requirements to copy its pipeline. [S01, S15] |
| **P2 — Inspection:** duration/channels/encoding/embedded metadata/notes; waveform/listen; observations separate from corrections. | **Retain; make source-read-only behavior explicit.** Separating observations and corrections is already covered in P2. | Display parser results, provenance, unsupported/malformed metadata warnings, and user corrections as distinct fields. Do not write a correction into the embedded file during inspection. Keep BWF validation rules as optional, visible checks, not automatic edits or universal rules for FLAC/MP3. BWF MetaEdit shows both useful rule-driven validation and an explicit save-modified-files step. [S11, S13] |
| **P3 — Derivatives:** explicit request; choose settings after preview; retain original; visible failed/interrupted state. | **Retain; specify the record and partial-output semantics.** The important user controls already appear in P3. | Bind each derivative to a stable source ID and record profile/settings, tool and version, output characteristics, start/end status, and any failure/cancellation. A failed or interrupted output must never appear as a completed listening copy; keep or remove its partial bytes according to an explicit recovery choice. No fixed codec or preservation-quality claim is selected here. [S14, S10] |
| **P4 — Packaging:** originals, derivative references, provenance, fixity, transform settings/tool version; reopening shows changed/missing content. | **Retain intent; add a testable package contract.** Most of this is already covered in P4. | Prefer a complete directory package with a versioned manifest format. BagIt RFC 8493 v1.0 is the leading interoperability option: manifest all payload members and tag files, use whole-file SHA-256, and require full checksum verification on reopen. Keep provenance/settings as package metadata. Reject `fetch.txt`/remote holes for this local-offline product. Do not use Payload-Oxum-only validation or BWF audio-data MD5 as package fixity. Do not adopt bagit-python v1.9.0 as the BagIt 1.0 writer until its 0.97 version output and `%` encoding gap are addressed. A custom versioned directory manifest is the fallback if a conformant BagIt writer is not practical. [S01, S02, S12, S18] |
| **P5 — Components/environment:** metadata/audio/package/playback components undecided; offline on Windows/Linux; no upload; no embedded metadata edits for display. | **Retain constraints; turn “undecided” into bounded decisions.** No product constraint should be weakened to fit a component. | Keep the application fully local on Windows/Linux with no interview-audio upload. Evaluate separate parser, decoder/encoder, playback, and package adapters; pin every accepted implementation and its version. BagIt 1.0 is a format candidate; bagit-python v1.9.0 is not yet an acceptable writer. BWF MetaEdit is a useful product analogy for BWF-only validation, not a recommended automatic editor or general parser. The playback and transformation engines remain product choices. [S02, S09, S11, S18] |
| **P6 — Acceptance:** synthetic interrupted copy, malformed metadata, unusual channels, encoding conversion, package fixity. | **Retain and expand into observable cases.** The initial categories are already covered in P6. | Add path collisions/percent names, source immutability, same-size byte mutation, missing/extra files, incomplete staging, failed process cleanup, and offline-package checks. Use only synthetic media and synthetic metadata. No acceptance check below is represented as executed. [S01–S03, S18] |

The frozen comparison slice contains only P1–P6. I do not infer that another plan or cross-reference elsewhere covers these requirements.

## 4. Proposed replacement sandbox plan (O6)

### P1 — Batch capture

The desk accepts an archivist-selected batch of at most 100 WAV/BWF, FLAC, and MP3 files from removable storage. It creates a new local accession staging area and copies each selected file without changing the source file or its embedded metadata. Preserve each source filename and relative folder path when they can be represented safely on the target platform. Before copying, detect duplicate destinations, path traversal, case-insensitive collisions, unsupported path characters, and files that cannot be read. A conflict is visible and requires an archivist choice; never overwrite a prior source or silently rename one.

Record source path, byte length, selection status, and copy status. Write each destination to a temporary name, calculate independent whole-file SHA-256 values for source and destination, and mark the item complete only after the values match. Interrupted or failed copies remain visibly incomplete and can be retried without presenting partial bytes as an accession original. Where a packaged path must be changed for portability, preserve the exact source path and deterministic mapping in provenance. This is a proposed design; copy durability and recovery behavior have not been tested.

### P2 — Inspection and notes

For each staged original, display duration, channels/channel layout when known, sample rate, encoding/codec, bit depth where meaningful, embedded metadata, file-level warnings, and the verified whole-file fixity. Show parser/version and distinguish “not present,” “not understood,” “malformed,” and “read failed.” Provide waveform and listening review for spot checks. No transcript or speech recognition is in scope.

Keep parser-observed metadata immutable as an observation record. Store archivist notes or corrections separately with field, prior observation, corrected value, author, and time. Inspection and correction entry must not rewrite the original. Optional BWF rule sets may flag BWF-specific values for review but must be visible and opt-in; they do not determine rights or correctness for all formats.

### P3 — Listening derivatives

The archivist explicitly requests a listening copy, chooses a named output profile/settings, previews the intended transformation and expected output properties, and confirms before execution. Keep every derivative linked to the stable source item ID. Record the profile/version, codec/container, sample rate, channel operation, bitrate or sample format as applicable, encoder name/version, parameters, output path, and result status. Show `queued`, `running`, `completed`, `cancelled`, and `failed` distinctly. Do not treat partial bytes as complete; do not overwrite the source or an earlier derivative on retry.

No default conversion recipe is selected. Product owners still need to decide the target listener/device compatibility, quality/file-size trade-off, channel handling, and whether one or multiple listening profiles are needed. LOC preservation preferences do not answer those access-copy choices. [S10]

### P4 — Accession package and reopen validation

Build a package only from completed, verified staging data. The proposed layout is:

```text
<accession>/
  bagit.txt
  bag-info.txt
  manifest-sha256.txt
  tagmanifest-sha256.txt
  metadata/
    observations.json
    provenance.json
  data/
    originals/<preserved-relative-path>/...
    derivatives/<source-id>/<derivative-id>.<extension>
```

Prefer BagIt 1.0 / RFC 8493 for interoperable manifests, using SHA-256 over whole payload files and tag files. The package must be complete and local: every original, derivative, and declared metadata file is present; package provenance records the source-to-derivative relation, fixity, tool/settings, and copy/transformation disposition. Do not include `fetch.txt` or remote payload references. On reopen, run full checksum validation and report missing, extra, renamed, or changed content by path; a size/count shortcut alone is not a valid result. An audio-only embedded checksum may be displayed separately but never substitutes for whole-file fixity. [S01, S12]

BagIt 1.0 is a proposed format choice, but the writer is not chosen: the researched `bagit-python` v1.9.0 writer creates a 0.97 declaration and does not encode `%` as RFC 8493 requires. Before implementation, either select a different pinned writer that passes the acceptance cases, implement the small package-writing layer with an external conformance check, or choose a custom versioned manifest and explicitly give up BagIt interoperability. Do not use the v1.9.0 in-place `make_bag()` on removable originals. [S02, S04, S18]

### P5 — Components and environment

The application runs offline on Windows or Linux and never uploads interview audio. Metadata inspection, decoding/playback, transformation, and package writing are separate component decisions. Before selection, document the supported formats and malformed-input behavior, exact component versions/builds, licenses/distribution constraints, and file-mutation/network behavior. Keep source inspection read-only. The researched bagit-python v1.9.0 may inform validation semantics, but it is not yet approved as a BagIt 1.0 writer. BWF MetaEdit is an optional standalone analogy for BWF-specific validation, not an automatic metadata editor. No decoder, encoder, or playback library has been selected or validated.

### P6 — Synthetic acceptance plan

Run the following only after implementation, using generated media and metadata:

1. **Copy:** successful copy preserves bytes, names, and folder structure; injected interruption leaves a visible incomplete item; retry does not overwrite another item or mark partial bytes complete; source hash and copied-file hash must match.
2. **Paths:** exercise duplicate names in different folders, Windows case-fold collisions, reserved/unsupported names, Unicode, literal `%`, CR/LF names where the platform permits them, and traversal-like inputs. Confirm either lossless path preservation or a reversible, displayed mapping.
3. **Inspection:** synthetic WAV/BWF, FLAC, and MP3 examples cover known and unknown metadata, malformed headers/tags, parser warnings, unusual channel layouts, missing technical fields, and mismatched embedded metadata. Confirm inspection never changes the original hash and corrections remain separate.
4. **Derivative:** synthetic stereo, mono, multichannel, and unusual-layout inputs cover each selected encoder profile. Compare output properties to the confirmed settings; interrupt/fail the process and verify the status, partial-file policy, retry behavior, and source immutability. These checks do not prove subjective quality.
5. **Package:** reopen a valid package; delete, add, rename, and same-size-modify payload bytes; alter manifests/tag files; test omitted or duplicated manifest entries; and confirm full validation identifies each condition. Include a literal-percent filename to catch BagIt path-encoding defects. Reject `fetch.txt`/remote holes and demonstrate that offline reopen works without network access.
6. **Validator lifecycle:** if parallel validation is enabled, test worker creation failure and map failure on Windows and Linux; confirm an error cannot be reported as successful validation and child workers are joined or terminated. The upstream `test_validate_pool_error()` is evidence for one constructor-error case, not this full matrix. [S03, S16–S18]
7. **Scope and load:** generate batches of 1 and 100 synthetic files and verify item states and progress. Establish any performance threshold only as a separate product acceptance decision; none is claimed here.

**Executed versus proposed:** I read the supplied brief/plan, reviewed public documentation and pinned source, captured source bytes, checked capture hashes/byte counts, and parsed `source-map.json` as JSON. I did not run `bagit-python` tests, execute any downloaded code, construct synthetic media, copy real media, benchmark, or build the application. Every check in P6 is proposed, not executed.

## 5. Alternatives, rejected leads, and remaining product choices

- **Package format:** BagIt 1.0 directory plus manifests is preferred if a conformant writer and path strategy pass tests. A custom versioned directory manifest is the alternative, with less ecosystem interoperability. A valid BagIt may use `fetch.txt`, but this product should reject it to keep packages complete and offline. [S01]
- **Package library:** `bagit-python` v1.9.0 is useful as a code and validator reference. Its in-place writer and 0.97 declaration make direct use on originals unsuitable; its `%` path handling means it is not an approved BagIt 1.0 writer. A replacement library or a small writer remains undecided pending tests. [S02, S18]
- **Fixity:** Reject Payload-Oxum-only “valid” status and reject embedded BWF audio-data MD5 as the sole accession/package fixity. Use whole-file SHA-256 for source copies and package members; optional audio-data checks may be supplementary. [S01 §2.2.2, S12]
- **Metadata:** Reject automatic embedded metadata normalization during inspection. Keep parser observations and archivist corrections separate. BWF MetaEdit's validation rules are optional BWF-specific cues, not a basis for rewriting all WAV/BWF, FLAC, or MP3 metadata. [S11, S13]
- **Conversion:** Reject applying a preservation-master recommendation as the default listening-copy recipe. The product must choose a supported profile after compatibility and quality needs are specified; until then show settings and preserve the original. [S10]
- **Open uncertainty:** exact path/Unicode policy across Windows/Linux; whether BagIt 1.0 is required for interoperability; package writer/runtime fit; format identification/metadata parser; audio decoder/encoder/playback choices; partial-output retention and retry policy; and the definition of “preview” for a derivative. The supplied slice does not resolve these.

## 6. O5 — independent fresh-critic review

**Pending.** No flash-family critic result was supplied to this research role, and I did not solicit one. No criticism or agreement is invented. The fresh critic should independently inspect the pinned package-format/component evidence, writer/path-encoding limitation, issue/fix/release claims, and P1–P6 scope, then record each objection and its disposition in the final handoff. This pending item affects the BagIt 1.0 recommendation, `bagit-python` rejection as a writer, and the proposed reopen-validation tests. Preserve the critic's exact substantive findings and whether the proposal accepts, rejects, or leaves each unresolved.

## 7. Operations and cost record

- **Timing:** prospective arm start/deadline from dispatch: `2026-10-07T20:47:52.249474Z` to `2026-10-07T21:47:52.249474Z`; research stage deadline: `2026-10-07T21:12:52.249474Z`. The native research thread was created at `2026-10-07T20:51:06.741Z`. No reset or extension was used. First useful discovery was the broad-source finding that BagIt treats package payload as opaque bytes and Archivematica separates transfer/fixity from normalization; it appeared in the first public-source search at approximately 20:51–20:52 UTC. The web tool did not expose an exact event timestamp, so the interval is not presented as exact.
- **Inputs read:** `input-map.json` (1,576 bytes); `brief.md` (5,140); `plan.md` (1,718); `INPUTS.md` (1,927); candidate `task.txt` and dispatch/config/response/start-observation files (15,669 combined). Total local input files read: 26,030 bytes. The input map records brief SHA-256 `c609c2ea956f269df5fbab3694b7a9425f72f24b65279e12aab3b5c1d727a1ab` and plan SHA-256 `c3da0fde53189778a3685ff4dae7f8c9cca2bd3a5d5a0f8614bc666c21a01a59`.
- **Operations:** created one fresh native Goal with no token budget and confirmed it active; sent the one activation-only notice to the specified parent thread; read only this candidate's admitted input/dispatch files; conducted public primary-source discovery; captured 18 source response bodies under `sources/`; recorded each capture URL, timestamp, size, and SHA-256 in `source-map.json`; inspected code and tests without executing them; wrote this full artifact. No source-cache method, semantic cache, nested delegation, parent-history research, campaign/evaluator material, repository changes, or third-party messages were used.
- **Generated/captured bytes:** 18 primary-source captures totaling 2,535,372 bytes (entity bodies after redirects; hashes in `source-map.json`). `artifact.md` and `source-map.json` are the authored outputs; their final host sizes and hashes are reported in the handoff.
- **Separate accounting:** input bytes are as above; source/cache bytes are not separately reported by the web service (`null`); generated source-capture bytes are 2,535,372; stage-specific reasoning-token and billing counters are unavailable (`null`). The native Goal snapshot at `2026-10-07T21:00:44Z` reported aggregate `tokensUsed=248634` and `timeUsedSeconds=566` while active; these are Goal totals, not research-stage counters or values to add to other measures. Final terminal Goal counters are reported in the handoff. No billing amount is inferred.
- **Native-output fallback:** not used because both complete authored files and source captures were written successfully. No summary substitutes for the artifact.
