# Mechanical finding views

Renderer: m14-renderer-1.0.0

Input SHA-256: 1bc410403d7d44825e84bdf7c6829b167a5821c5aa72c04341404209b02a8b56

Candidate-authored content; no substantive adjudication by renderer.


## Decision view


### O1_OPEN_DISCOVERY

[Complete record](#finding-5d976c2e5edc36033854effa23b7f474f78431bedf0bc070ff7766c77a4016a4)


Summary

```
Need-led public discovery supports a staged, reviewable ingest workflow with separate preservation, inspection and access-copy decisions.
```


Disposition

```
Accepted with scope limits; sources are analogies and technical evidence, not a universal recipe.
```


Governing conditions (complete)

```json
{
  "condition": "Begin from oral-history desk need. Do not treat release-format recommendations as a recipe for born-digital interviews or automatically rewrite metadata."
}
```


### O2_PINNED_CODE

[Complete record](#finding-7f228bd14b531372c8d317344c7eb97feef5baba3806e2981a749dae0eaed94f)


Summary

```
bagit-python v1.9.0 source at commit 861ddacb339d5b92659f0187a402f501d841abbe was inspected as the consequential package implementation candidate.
```


Disposition

```
Versioned code evidence accepted; runtime adoption remains conditional.
```


Governing conditions (complete)

```json
{
  "version": "Exact code and tests captured from release commit 861ddacb339d5b92659f0187a402f501d841abbe.",
  "scope": "bagit-python is a reference/optional candidate; BagIt 1.0 is the proposed package standard, not a mandatory Python runtime."
}
```


### O3_HISTORY

[Complete record](#finding-b5e890276412b7e9954549066b865a253b557360887039a1ef70c75979186528)


Summary

```
Issue #152 has a traceable upstream fix in a released version; separate issue #157 remains relevant to the exact release code.
```


Disposition

```
Issue/fix/release applicability supported; no automated regression test for the exact tilde case was found.
```


Governing conditions (complete)

```json
{
  "release": "v1.9.0 commit 861ddacb339d5b92659f0187a402f501d841abbe contains the merged change.",
  "claim_limit": "No inference that any downstream product shipped this code."
}
```


### O4_P1_TO_P6_COMPARISON

[Complete record](#finding-213d79b13427d637b82005438d42b03cf7cf37f0f8b1012270fa64e314140558)


Summary

```
Every frozen P1–P6 decision is compared below with an explicit disposition.
```


Disposition

```
Complete plan comparison; all decisions remain within the frozen scope.
```


Governing conditions (complete)

```json
{
  "already_covered": "The original plan already covers the six headline areas and the constraints repeated in the replacement plan; no unrelated whole-project coverage is inferred.",
  "cross_reference_limit": "The supplied comparison slice contains only this six-part plan; no broader system guarantees are inferred."
}
```


### FULL_PLAN_REPLACEMENT

[Complete record](#finding-f9ebff3c6e088fbe23a281b498cf18a4cef469b395d8ab2683d59b111c72396d)


Summary

```
Complete proposed replacement for the frozen sandbox plan: local ingest, inspection, derivatives, package, component choices and acceptance.
```


Disposition

```
Proposed complete replacement; not built or validated; O5 fresh criticism remains pending.
```


Governing conditions (complete)

```json
{
  "scope": [
    "One archivist and up to 100 selected WAV/BWF, FLAC and MP3 files.",
    "No speech transcription, public publishing, automated rights decision or legal advice.",
    "Offline Windows or Linux; no interview audio/metadata upload; source media remains unchanged."
  ],
  "P1": "Preflight selected files for read access, space, duplicate/case/Unicode collisions, symlink/reparse points and unsafe paths. Show the mapping. Copy to a new local accession staging directory. Hash while reading, re-read the destination and compare SHA-512 and SHA-256 before marking verified. Preserve received names/relative paths; stop for archivist choice if a target filesystem cannot represent a name; record any reversible path mapping. Keep discovered/copying/verified/warning/failed/interrupted/resumed states. Never finalize a partial copy. Resume only after source identity and copied bytes are rechecked; do not delete source.",
  "P2": "Show duration, channel count/layout, encoding, embedded metadata and archivist notes. Evaluate a pinned FFprobe 9.0.2 read-only adapter; record parser version/build and warnings. Keep original embedded fields as an immutable observed snapshot; store corrections separately with author/time. Show errors and unknown channel layouts; no guessing or write function during inspection. Decode waveform on demand and show channels separately.",
  "P3": "Only create a derivative on explicit per-file request. Preview container/codec, sample rate, sample format/bit depth, channel map, metadata map and any resampling/filter. FFmpeg 9.0.2 is a candidate only after build, codec and license review on both platforms. No default lossy recipe, normalization, resampling or downmix. Write temporary output; inspect settings after exit; finalize only if successful. Failure/interruption remains visible with partial output quarantined and original unchanged. Record tool/build, exact settings, source/output identities and outcome.",
  "P4": "Use BagIt 1.0 folder model. Include bagit.txt, bag-info.txt, data/originals/<received-path>, data/derivatives/<stable-id>/<chosen-name>, data/records/ingest.json, SHA-512 and SHA-256 payload manifests and tag manifests. Every payload file including notes/provenance is fixed in manifests; tag files are covered by tag manifests. No fetch.txt or remote payload. Record source digest, copy digest, processing events, tool/settings, derivative relationship and outcome. A digest detects later change against its baseline but proves neither authenticity nor original correctness. Finalize only after complete copy and full fixity. Reopen performs full fixity and reports missing/changed/unexpected; size/count only is not fixity.",
  "P5": "Retain components as undecided but shortlist FFprobe/FFmpeg 9.0.2, BagIt 1.0 and a PREMIS-inspired event record. Compare a native BagIt serializer to bagit-python 1.9.0 only after resolving path encoding and safe-path tests, and only on a staging copy. BWF MetaEdit 26.08.1 is an optional BWF-only QA/export lead, never a writer to originals. Playback backend and UI remain a cross-platform prototype choice. Lock exact binary hashes, build flags, enabled codecs, licenses and dependencies before shipping.",
  "P6": "Propose synthetic checks for interrupted copy/unplug/resume/source change; malformed/contradictory RIFF/BWF, FLAC and ID3 metadata; mono/stereo/multichannel/discrete/unknown layouts; selected conversion parameters and crash/cancel behavior; package tampering by missing/changed/extra/renamed/truncated payload and altered tag files. Add percent/CR/LF path encoding, Unicode/case collisions, long and Windows-reserved paths, symlink/reparse/shared-prefix containment, read-only media, low space, 100 files, disconnected network and no-egress cases. Mark all as proposed until the implementation runs them."
}
```


### O5_CRITIC_PENDING

[Complete record](#finding-db060f6849b9306d7c5d098f0b3606ac2cdb4d01c878b9f61caca0dae7656759)


Summary

```
Independent fresh same-family criticism has not been received in this research stage.
```


Disposition

```
Pending; no critique or disposition fabricated.
```


Governing conditions (complete)

```json
{
  "handoff": "Critic should inspect this semantic set, source-map and captured sources against the admitted brief and frozen plan. No evaluator material is supplied or requested."
}
```


### P6_ACCEPTANCE

[Complete record](#finding-dd2fd434b7641607a71fb8ba03bd837ddc5c13a426525e66fe06dfaee81bfbe1)


Summary

```
P6 retains every requested synthetic case and adds path, interruption, platform and privacy conditions.
```


Disposition

```
Proposed acceptance only; not executed.
```


Governing conditions (complete)

```json
{
  "plan_locator": "Frozen plan P6.",
  "data": "Synthetic content only; no personal interviews."
}
```


### EXECUTION_RECORD

[Complete record](#finding-6ecbcfd2174eab4f3fff9b056d5074eee8e36f6d50be24089fa5d5ab02eec52b)


Summary

```
Research operations are distinct from proposed product validation and from provider cost components.
```


Disposition

```
Executed: admitted-file reading, source retrieval/hash, static source review, native Goal activation and activation notice. Renderer and preservation review result are in preservation_check.md. No application test executed.
```


Governing conditions (complete)

```json
{
  "earliest_cold_preparation_utc": "2026-10-07T20:47:52.249474Z",
  "stage_deadline_utc": "2026-10-07T21:12:52.249474Z",
  "whole_arm_deadline_utc": "2026-10-07T21:47:52.249474Z",
  "role_cap_seconds": 1500,
  "whole_arm_cap_seconds": 3600
}
```


## Evidence view


### O1_OPEN_DISCOVERY

[Complete record](#finding-5d976c2e5edc36033854effa23b7f474f78431bedf0bc070ff7766c77a4016a4)

```json
[
  "A Library of Congress literary audio workflow documents a test ingest that creates a review CSV before formal ingest and scripted FFmpeg MP3 access copies from WAV masters. This supports review-before-commit and derivative provenance, but not importing its settings or storage topology.",
  "The LoC audio statement prefers native resolution and uncompressed media-independent audio and lists BWF WAVE with embedded metadata as preferred in that statement's scope. It does not require converting oral-history intake MP3 or FLAC files to WAVE.",
  "FFprobe documents structured machine-readable format and stream output. FFmpeg documents metadata mapping and override controls. BWF MetaEdit is a specialized BWF tool that can validate and edit embedded metadata."
]
```


### O2_PINNED_CODE

[Complete record](#finding-7f228bd14b531372c8d317344c7eb97feef5baba3806e2981a749dae0eaed94f)

```json
[
  "make_bag() defaults to SHA-256 and SHA-512, then moves input directory contents into a data folder in place before writing bag metadata/manifests. Never run it on the removable source tree; stage a copy first.",
  "Bag.validate() defaults to complete fixity verification. fast=True returns after Payload-Oxum file-count and byte-count checks and does not recalculate manifest checksums.",
  "Bag._load_manifests() and Bag.fetch_entries() call _path_is_dangerous() when interpreting manifest and fetch paths. RFC 8493 requires path containment and percent-encoding rules.",
  "_encode_filename() replaces CR and LF but not literal percent. Issue #157 describes this BagIt 1.0 interoperability problem; exact v1.9.0 tests do not include percent-path coverage.",
  "Code-review inference: _path_is_dangerous() uses os.path.commonprefix() on normalized strings, which is not a path-segment containment proof. Treat as a test/adoption concern, not a confirmed exploit."
]
```


### O3_HISTORY

[Complete record](#finding-b5e890276412b7e9954549066b865a253b557360887039a1ef70c75979186528)

```json
[
  "Issue #152 reports a Linux/Python false unsafe-path rejection for a name containing ~$_- because os.path.expandvars() expands it. The issue supplies a reproducible example.",
  "PR #184 removes the expandvars check from _path_is_dangerous(); merge commit 753679c9b342660d038f65a8dc4f755ab95d679b closes #152. The v1.9.0 release notes list #184 and the exact tagged source no longer calls expandvars.",
  "The merge patch changes one source file with two deletions and no test addition. The release test file has generic unsafe path checks, but not the exact issue #152 name. Thus the issue reproduction and code delta are regression evidence; a committed automated regression test is not established.",
  "At the same v1.9.0 tag, _encode_filename() handles CR/LF but not literal percent; RFC 8493 requires encoding percent too. This is a separate limitation, not a consequence of #152."
]
```


### O4_P1_TO_P6_COMPARISON

[Complete record](#finding-213d79b13427d637b82005438d42b03cf7cf37f0f8b1012270fa64e314140558)

```json
[
  "P1 Batch capture — amend. Retain WAV/BWF, FLAC and MP3, up to 100, original names/relative folders, copy-only and source nonmutation. Add preflight, stable per-file copy/verify/interruption states, streaming SHA-512/SHA-256 and independent destination reread. Rationale: make copy integrity and partial failure visible; bagit-python make_bag() is in-place.",
  "P2 Inspection — amend. Retain duration, channels, encoding, embedded tags, notes, waveform/listen view and correction separation. Add exact parser/build identity, parser warnings, immutable source-tag snapshot, no writes during inspection and explicit unknown channel layouts.",
  "P3 Derivatives — amend. Retain opt-in request, settings preview, original preservation and visible failure. Add per-file explicit container/codec/sample rate/bit depth/channel mapping/metadata mapping, temp output, post-output probe and tool/build/settings provenance; no default conversion recipe.",
  "P4 Packaging — amend. Retain originals, derivative references, provenance, fixity, tool version and reopen checks. Propose BagIt 1.0, data/originals and data/derivatives paths, sidecar provenance, complete SHA-512/SHA-256 manifests and full fixity on reopen; no fetch.txt.",
  "P5 Components/environment — retain undecided status, amend with shortlist and release gates. Keep offline Windows/Linux, no upload and no embedded-metadata writes for display. Candidates: FFprobe/FFmpeg 9.0.2, BagIt 1.0 with conditional bagit-python 1.9.0/native alternative, optional BWF MetaEdit 26.08.1, playback/UI prototype.",
  "P6 Acceptance — amend. Retain interrupted copy, malformed metadata, unusual channels, conversion and package fixity categories; expand to path/collision/partial-file, output verification, tag-manifest, 100-file, disconnected network, Windows/Linux and no-egress synthetic cases."
]
```


### FULL_PLAN_REPLACEMENT

[Complete record](#finding-f9ebff3c6e088fbe23a281b498cf18a4cef469b395d8ab2683d59b111c72396d)

```json
[
  "The replacement keeps the exact P1–P6 scope and user constraints while adding reproducible copy, transform and package records. The content is candidate-authored and the renderer does not adjudicate it."
]
```


### O5_CRITIC_PENDING

[Complete record](#finding-db060f6849b9306d7c5d098f0b3606ac2cdb4d01c878b9f61caca0dae7656759)

```json
[
  "The brief requires an independent check of consequential sources, code/version applicability, plan comparison and the full user scope. The dispatch explicitly marks O5 pending a fresh critic."
]
```


### P6_ACCEPTANCE

[Complete record](#finding-dd2fd434b7641607a71fb8ba03bd837ddc5c13a426525e66fe06dfaee81bfbe1)

```json
[
  "Frozen plan requests interrupted copy, malformed metadata, unusual channel layout, encoding conversion and package fixity. The replacement retains all five."
]
```


### EXECUTION_RECORD

[Complete record](#finding-6ecbcfd2174eab4f3fff9b056d5074eee8e36f6d50be24089fa5d5ab02eec52b)

```json
[
  "Open search began from the oral-history ingest need before decision comparison. Sixteen public primary source byte streams were captured; SHA-256 was computed locally. Captures are source data only and no downloaded code was executed.",
  "No repo/canonical Plan changes, WorkNodes, nested delegation, other arms, source-cache method, external runner, installer, third-party message, issue or PR mutation occurred."
]
```


## Conditions view


### O1_OPEN_DISCOVERY

[Complete record](#finding-5d976c2e5edc36033854effa23b7f474f78431bedf0bc070ff7766c77a4016a4)

```json
{
  "condition": "Begin from oral-history desk need. Do not treat release-format recommendations as a recipe for born-digital interviews or automatically rewrite metadata."
}
```


### O2_PINNED_CODE

[Complete record](#finding-7f228bd14b531372c8d317344c7eb97feef5baba3806e2981a749dae0eaed94f)

```json
{
  "version": "Exact code and tests captured from release commit 861ddacb339d5b92659f0187a402f501d841abbe.",
  "scope": "bagit-python is a reference/optional candidate; BagIt 1.0 is the proposed package standard, not a mandatory Python runtime."
}
```


### O3_HISTORY

[Complete record](#finding-b5e890276412b7e9954549066b865a253b557360887039a1ef70c75979186528)

```json
{
  "release": "v1.9.0 commit 861ddacb339d5b92659f0187a402f501d841abbe contains the merged change.",
  "claim_limit": "No inference that any downstream product shipped this code."
}
```


### O4_P1_TO_P6_COMPARISON

[Complete record](#finding-213d79b13427d637b82005438d42b03cf7cf37f0f8b1012270fa64e314140558)

```json
{
  "already_covered": "The original plan already covers the six headline areas and the constraints repeated in the replacement plan; no unrelated whole-project coverage is inferred.",
  "cross_reference_limit": "The supplied comparison slice contains only this six-part plan; no broader system guarantees are inferred."
}
```


### FULL_PLAN_REPLACEMENT

[Complete record](#finding-f9ebff3c6e088fbe23a281b498cf18a4cef469b395d8ab2683d59b111c72396d)

```json
{
  "scope": [
    "One archivist and up to 100 selected WAV/BWF, FLAC and MP3 files.",
    "No speech transcription, public publishing, automated rights decision or legal advice.",
    "Offline Windows or Linux; no interview audio/metadata upload; source media remains unchanged."
  ],
  "P1": "Preflight selected files for read access, space, duplicate/case/Unicode collisions, symlink/reparse points and unsafe paths. Show the mapping. Copy to a new local accession staging directory. Hash while reading, re-read the destination and compare SHA-512 and SHA-256 before marking verified. Preserve received names/relative paths; stop for archivist choice if a target filesystem cannot represent a name; record any reversible path mapping. Keep discovered/copying/verified/warning/failed/interrupted/resumed states. Never finalize a partial copy. Resume only after source identity and copied bytes are rechecked; do not delete source.",
  "P2": "Show duration, channel count/layout, encoding, embedded metadata and archivist notes. Evaluate a pinned FFprobe 9.0.2 read-only adapter; record parser version/build and warnings. Keep original embedded fields as an immutable observed snapshot; store corrections separately with author/time. Show errors and unknown channel layouts; no guessing or write function during inspection. Decode waveform on demand and show channels separately.",
  "P3": "Only create a derivative on explicit per-file request. Preview container/codec, sample rate, sample format/bit depth, channel map, metadata map and any resampling/filter. FFmpeg 9.0.2 is a candidate only after build, codec and license review on both platforms. No default lossy recipe, normalization, resampling or downmix. Write temporary output; inspect settings after exit; finalize only if successful. Failure/interruption remains visible with partial output quarantined and original unchanged. Record tool/build, exact settings, source/output identities and outcome.",
  "P4": "Use BagIt 1.0 folder model. Include bagit.txt, bag-info.txt, data/originals/<received-path>, data/derivatives/<stable-id>/<chosen-name>, data/records/ingest.json, SHA-512 and SHA-256 payload manifests and tag manifests. Every payload file including notes/provenance is fixed in manifests; tag files are covered by tag manifests. No fetch.txt or remote payload. Record source digest, copy digest, processing events, tool/settings, derivative relationship and outcome. A digest detects later change against its baseline but proves neither authenticity nor original correctness. Finalize only after complete copy and full fixity. Reopen performs full fixity and reports missing/changed/unexpected; size/count only is not fixity.",
  "P5": "Retain components as undecided but shortlist FFprobe/FFmpeg 9.0.2, BagIt 1.0 and a PREMIS-inspired event record. Compare a native BagIt serializer to bagit-python 1.9.0 only after resolving path encoding and safe-path tests, and only on a staging copy. BWF MetaEdit 26.08.1 is an optional BWF-only QA/export lead, never a writer to originals. Playback backend and UI remain a cross-platform prototype choice. Lock exact binary hashes, build flags, enabled codecs, licenses and dependencies before shipping.",
  "P6": "Propose synthetic checks for interrupted copy/unplug/resume/source change; malformed/contradictory RIFF/BWF, FLAC and ID3 metadata; mono/stereo/multichannel/discrete/unknown layouts; selected conversion parameters and crash/cancel behavior; package tampering by missing/changed/extra/renamed/truncated payload and altered tag files. Add percent/CR/LF path encoding, Unicode/case collisions, long and Windows-reserved paths, symlink/reparse/shared-prefix containment, read-only media, low space, 100 files, disconnected network and no-egress cases. Mark all as proposed until the implementation runs them."
}
```


### O5_CRITIC_PENDING

[Complete record](#finding-db060f6849b9306d7c5d098f0b3606ac2cdb4d01c878b9f61caca0dae7656759)

```json
{
  "handoff": "Critic should inspect this semantic set, source-map and captured sources against the admitted brief and frozen plan. No evaluator material is supplied or requested."
}
```


### P6_ACCEPTANCE

[Complete record](#finding-dd2fd434b7641607a71fb8ba03bd837ddc5c13a426525e66fe06dfaee81bfbe1)

```json
{
  "plan_locator": "Frozen plan P6.",
  "data": "Synthetic content only; no personal interviews."
}
```


### EXECUTION_RECORD

[Complete record](#finding-6ecbcfd2174eab4f3fff9b056d5074eee8e36f6d50be24089fa5d5ab02eec52b)

```json
{
  "earliest_cold_preparation_utc": "2026-10-07T20:47:52.249474Z",
  "stage_deadline_utc": "2026-10-07T21:12:52.249474Z",
  "whole_arm_deadline_utc": "2026-10-07T21:47:52.249474Z",
  "role_cap_seconds": 1500,
  "whole_arm_cap_seconds": 3600
}
```


## Options view


### O1_OPEN_DISCOVERY

[Complete record](#finding-5d976c2e5edc36033854effa23b7f474f78431bedf0bc070ff7766c77a4016a4)

```json
[
  "FFprobe 9.0.2 candidate for inspection; validate against synthetic formats and malformed metadata.",
  "Optional BWF MetaEdit for BWF-specific inspection only.",
  "Reviewable batch CSV can be built into UI or exported."
]
```


### O2_PINNED_CODE

[Complete record](#finding-7f228bd14b531372c8d317344c7eb97feef5baba3806e2981a749dae0eaed94f)

```json
[
  "Use v1.9.0 only on completed staging copies and only with strict path conformance checks.",
  "Consider implementing BagIt 1.0 natively in the eventual app language, or use the pinned package as an interoperability reference."
]
```


### O3_HISTORY

[Complete record](#finding-b5e890276412b7e9954549066b865a253b557360887039a1ef70c75979186528)

```json
[
  "Add exact issue #152 filename test on Linux and Windows.",
  "Add literal percent, CR/LF/CRLF path tests including names that resemble encoded paths."
]
```


### O4_P1_TO_P6_COMPARISON

[Complete record](#finding-213d79b13427d637b82005438d42b03cf7cf37f0f8b1012270fa64e314140558)

```json
[
  "Product choices remain: conversion formats/recipes, path collision resolution, exact metadata fields, package serializer implementation, full PREMIS vs subset, playback backend and optional BWF tool."
]
```


### FULL_PLAN_REPLACEMENT

[Complete record](#finding-f9ebff3c6e088fbe23a281b498cf18a4cef469b395d8ab2683d59b111c72396d)

```json
[
  "Product choices not determined by evidence: lossless/lossy outputs, target settings, per-file/batch operations, path collision policy, exact metadata whitelist, full PREMIS or documented subset, native vs bundled package serializer, playback API and whether BWF MetaEdit fits the workflow."
]
```


### O5_CRITIC_PENDING

[Complete record](#finding-db060f6849b9306d7c5d098f0b3606ac2cdb4d01c878b9f61caca0dae7656759)

```json
[
  "Populate criticism and response only after a real critic handoff; preserve objections and disagreements."
]
```


### P6_ACCEPTANCE

[Complete record](#finding-dd2fd434b7641607a71fb8ba03bd837ddc5c13a426525e66fe06dfaee81bfbe1)

```json
[
  "Use selected exact dependency builds once product choices are locked."
]
```


### EXECUTION_RECORD

[Complete record](#finding-6ecbcfd2174eab4f3fff9b056d5074eee8e36f6d50be24089fa5d5ab02eec52b)

```json
[
  "Input/cache/generated/reasoning and billing metrics are all unknown null; see component_usage below.",
  "Aggregate native Goal counters are a separate unsummed snapshot."
]
```


## Optional leads view


### O1_OPEN_DISCOVERY

[Complete record](#finding-5d976c2e5edc36033854effa23b7f474f78431bedf0bc070ff7766c77a4016a4)

```json
[
  "Keep technical metadata, source tags, archivist note and correction as separate values.",
  "Use BWF workflow guidance only when source format and collection policy make it applicable."
]
```


### O2_PINNED_CODE

[Complete record](#finding-7f228bd14b531372c8d317344c7eb97feef5baba3806e2981a749dae0eaed94f)

```json
[
  "Do not rely on fast validation for fixity.",
  "Do not rely on _path_is_dangerous() as the application's sole boundary check without adversarial cross-platform tests."
]
```


### O3_HISTORY

[Complete record](#finding-b5e890276412b7e9954549066b865a253b557360887039a1ef70c75979186528)

```json
[
  "Dispositions: #152 corrected false rejection; #157 path interoperability remains open in the examined release code."
]
```


### O4_P1_TO_P6_COMPARISON

[Complete record](#finding-213d79b13427d637b82005438d42b03cf7cf37f0f8b1012270fa64e314140558)

```json
[
  "Reject converting all sources to BWF/WAV based only on LoC format preferences; reject treating parser success as preservation validation; reject BagIt fast size/count mode as fixity; reject BWF data-chunk MD5 as whole-file fixity; reject automatic metadata correction and remote fetch."
]
```


### FULL_PLAN_REPLACEMENT

[Complete record](#finding-f9ebff3c6e088fbe23a281b498cf18a4cef469b395d8ab2683d59b111c72396d)

```json
[
  "Optional review CSV, BWF-specific QA tool, second digest manifest, full PREMIS integration if required, replaceable parser/playback adapters."
]
```


### O5_CRITIC_PENDING

[Complete record](#finding-db060f6849b9306d7c5d098f0b3606ac2cdb4d01c878b9f61caca0dae7656759)

```json
[
  "Proposed critic checks: BagIt path/validation code, issue-fix-release chain, audio format applicability, every P1–P6 disposition and full O1–O6."
]
```


### P6_ACCEPTANCE

[Complete record](#finding-dd2fd434b7641607a71fb8ba03bd837ddc5c13a426525e66fe06dfaee81bfbe1)

```json
[
  "Keep each check's inputs, outputs, warnings and outcome recorded."
]
```


### EXECUTION_RECORD

[Complete record](#finding-6ecbcfd2174eab4f3fff9b056d5074eee8e36f6d50be24089fa5d5ab02eec52b)

```json
[
  "First useful finding: FFprobe machine-readable output candidate, observed by 2026-10-07T20:53:03Z.",
  "Source capture time windows, URLs, byte sizes and hashes: source-map.json.",
  "Generic preparation lower bound 454.056 seconds and qualification lower bound 0.316 seconds are separately retained; qualification wall time and billing are unknown, never free time."
]
```


## Validation view


### O1_OPEN_DISCOVERY

[Complete record](#finding-5d976c2e5edc36033854effa23b7f474f78431bedf0bc070ff7766c77a4016a4)

```json
[
  "Proposed: compare parser results on synthetic valid/malformed WAV/BWF, FLAC and MP3; no audio file was decoded in this research."
]
```


### O2_PINNED_CODE

[Complete record](#finding-7f228bd14b531372c8d317344c7eb97feef5baba3806e2981a749dae0eaed94f)

```json
[
  "Proposed: create/reopen synthetic bags with SHA-512/SHA-256, changed/missing/extra files, percent/CR/LF names and paths outside the package.",
  "Executed: static reading of captured source/test files only; no downloaded code or tests executed."
]
```


### O3_HISTORY

[Complete record](#finding-b5e890276412b7e9954549066b865a253b557360887039a1ef70c75979186528)

```json
[
  "Proposed only: regression suite on the selected exact build; no upstream or product test was run here."
]
```


### O4_P1_TO_P6_COMPARISON

[Complete record](#finding-213d79b13427d637b82005438d42b03cf7cf37f0f8b1012270fa64e314140558)

```json
[
  "Proposed checks are listed under P6_ACCEPTANCE and in FULL_PLAN_REPLACEMENT; none of the product checks ran."
]
```


### FULL_PLAN_REPLACEMENT

[Complete record](#finding-f9ebff3c6e088fbe23a281b498cf18a4cef469b395d8ab2683d59b111c72396d)

```json
[
  "Synthetic P6 checks above are proposals only. No app build, audio test, conversion, performance test or quality claim."
]
```


### O5_CRITIC_PENDING

[Complete record](#finding-db060f6849b9306d7c5d098f0b3606ac2cdb4d01c878b9f61caca0dae7656759)

```json
[
  "No independent criticism occurred."
]
```


### P6_ACCEPTANCE

[Complete record](#finding-dd2fd434b7641607a71fb8ba03bd837ddc5c13a426525e66fe06dfaee81bfbe1)

```json
[
  "Interrupt at each copy stage; malformed RIFF/BWF, FLAC and ID3; mono/stereo/multichannel/unknown layout; explicit conversion settings and cancellation; missing/altered/extra/truncated/renamed files and tag manifests; percent/CR/LF/Unicode/collision/long/reserved/symlink/shared-prefix paths; read-only source/low space/100 items; Windows/Linux/disconnected network/no egress."
]
```


### EXECUTION_RECORD

[Complete record](#finding-6ecbcfd2174eab4f3fff9b056d5074eee8e36f6d50be24089fa5d5ab02eec52b)

```json
[
  "App tests/build/conversion/quality/performance checks were not executed."
]
```


## Uncertainty view


### O1_OPEN_DISCOVERY

[Complete record](#finding-5d976c2e5edc36033854effa23b7f474f78431bedf0bc070ff7766c77a4016a4)

```json
[
  "FFmpeg/FFprobe docs are live and not release-pinned. A release binary must be verified at build time.",
  "The LoC case study is institutional practice, not a product build or performance result."
]
```


### O2_PINNED_CODE

[Complete record](#finding-7f228bd14b531372c8d317344c7eb97feef5baba3806e2981a749dae0eaed94f)

```json
[
  "The static commonprefix review is a code-level concern, not a proven exploit.",
  "Release page marked v1.9.0 as latest at capture while master had later commits; master was not substituted."
]
```


### O3_HISTORY

[Complete record](#finding-b5e890276412b7e9954549066b865a253b557360887039a1ef70c75979186528)

```json
[
  "The PR does not add a test, and a source release note cannot prove downstream use."
]
```


### O4_P1_TO_P6_COMPARISON

[Complete record](#finding-213d79b13427d637b82005438d42b03cf7cf37f0f8b1012270fa64e314140558)

```json
[
  "No source resolves local rights/consent/retention/access policy or declares output quality thresholds."
]
```


### FULL_PLAN_REPLACEMENT

[Complete record](#finding-f9ebff3c6e088fbe23a281b498cf18a4cef469b395d8ab2683d59b111c72396d)

```json
[
  "Format statements do not mandate converting born-digital oral histories. Interviews may need institutional access/retention decisions beyond this technical scope."
]
```


### O5_CRITIC_PENDING

[Complete record](#finding-db060f6849b9306d7c5d098f0b3606ac2cdb4d01c878b9f61caca0dae7656759)

```json
[
  "O5 remains open; this artifact does not claim final scientific agreement."
]
```


### P6_ACCEPTANCE

[Complete record](#finding-dd2fd434b7641607a71fb8ba03bd837ddc5c13a426525e66fe06dfaee81bfbe1)

```json
[
  "No product test was performed; no performance or preservation-quality conclusion is offered."
]
```


### EXECUTION_RECORD

[Complete record](#finding-6ecbcfd2174eab4f3fff9b056d5074eee8e36f6d50be24089fa5d5ab02eec52b)

```json
[
  "Provider billing and per-request token categories were not exposed; unknown is not zero."
]
```


## Sources view


### O1_OPEN_DISCOVERY

[Complete record](#finding-5d976c2e5edc36033854effa23b7f474f78431bedf0bc070ff7766c77a4016a4)

```json
[
  {
    "identity": "Library of Congress literary audio archives workflow case study",
    "url": "https://blogs.loc.gov/thesignal/files/2022/05/JDMM_10_1_JDMM0002_Darby_et_al.pdf?loclr=blogpoe",
    "version": "2022 institutional case study",
    "capture_path": "sources/S15-loc-literary-audio-workflow-2022.pdf",
    "sha256": "646f2cb4e9ffa47668fcf436d89d84317bae2780e7221fdb4bda9ba89a77d42b",
    "source_id": "SRC-LOC-ORAL-HISTORY",
    "source_map_path": "source-map.json",
    "locator": "PDF discussion of ingest review CSV and MP3 access derivatives",
    "claim": "Institutional oral-history analogy."
  },
  {
    "identity": "Library of Congress Recommended Formats Statement Audio",
    "url": "https://www.loc.gov/preservation/resources/rfs/audio.html",
    "version": "Current annual HTML edition at capture",
    "capture_path": "sources/S02-loc-rfs-audio.html",
    "sha256": "2a419216eb2488959fa1329e2c0c60f411fa979521b58c8c8f2bae1c19b7ca76",
    "source_id": "SRC-LOC-RFS-AUDIO",
    "source_map_path": "source-map.json",
    "locator": "IV.ii.A and IV.ii.C",
    "claim": "Format preference scope."
  },
  {
    "identity": "Library of Congress FDD000357 BWF Version 2",
    "url": "https://www.loc.gov/preservation/digital/formats/fdd/fdd000357.shtml",
    "version": "FDD000357 current page at capture",
    "capture_path": "sources/S03-loc-bwf-v2.html",
    "sha256": "0542ae7a3208323b37f606ff9622e4063ab4b69c6a778711f6b729b9a31e575c",
    "source_id": "SRC-LOC-BWF-V2",
    "source_map_path": "source-map.json",
    "locator": "Local use and sustainability",
    "claim": "BWF/LPCM practice."
  },
  {
    "identity": "FFprobe documentation",
    "url": "https://www.ffmpeg.org/ffprobe-all.html",
    "version": "Live documentation, not release-pinned",
    "capture_path": "sources/S12-ffprobe-8.1.html",
    "sha256": "6a862a570dd572bad0c4c453dc590fe254d3830675b02e7d64f7145dfc0dea46",
    "source_id": "SRC-FFPROBE",
    "source_map_path": "source-map.json",
    "locator": "Description and output writers",
    "claim": "Read-only inspection candidate."
  },
  {
    "identity": "FFmpeg CLI documentation",
    "url": "https://www.ffmpeg.org/ffmpeg.html",
    "version": "Live documentation, not release-pinned",
    "capture_path": "sources/S11-ffmpeg-8.1-cli.html",
    "sha256": "e04c69cd08537b9b9d8d16ecaab9f56d938455e54ef42c37a2019053df8495cb",
    "source_id": "SRC-FFMPEG-DOCS",
    "source_map_path": "source-map.json",
    "locator": "-map_metadata and -metadata sections",
    "claim": "Mapping behavior."
  },
  {
    "identity": "BWF MetaEdit official product page",
    "url": "https://mediaarea.net/BWFMetaEdit",
    "version": "26.08.1 observed at capture",
    "capture_path": "sources/S14-bwfmetaedit-product.html",
    "sha256": "7ec25815af64a1a912cbfb63fffe88de3610949bb768922e6d73c4a17c52ff70",
    "source_id": "SRC-BWF-METAEDIT",
    "source_map_path": "source-map.json",
    "locator": "Features",
    "claim": "BWF-specific optional product."
  }
]
```


### O2_PINNED_CODE

[Complete record](#finding-7f228bd14b531372c8d317344c7eb97feef5baba3806e2981a749dae0eaed94f)

```json
[
  {
    "identity": "bagit.py immutable release source",
    "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py",
    "version": "v1.9.0 commit 861ddacb339d5b92659f0187a402f501d841abbe",
    "capture_path": "sources/S05-bagit-861ddacb339d5b92659f0187a402f501d841abbe.py",
    "sha256": "1c851d04fb8ebdc28e5ad2ffc484569575a1f3922ed83abccd61edd3ee26f80a",
    "source_id": "SRC-BAGIT-CODE",
    "source_map_path": "source-map.json",
    "locator": "make_bag() lines 141–260; validate() 586–616; fetch_entries() 545–574; _load_manifests() 620–745; _path_is_dangerous() 925–941; _encode_filename() 1405–1414",
    "claim": "Pinned definitions and callers."
  },
  {
    "identity": "bagit-python immutable release tests",
    "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/test.py",
    "version": "v1.9.0 same commit",
    "capture_path": "sources/S06-bagit-test-861ddacb339d5b92659f0187a402f501d841abbe.py",
    "sha256": "751f20546c671b9128e9577d077c39574586d7c9be42921f4cd3ab86a5e0ef6a",
    "source_id": "SRC-BAGIT-TESTS",
    "source_map_path": "source-map.json",
    "locator": "test_unsafe_directory_entries_raise_error() and test_fetch_unsafe_payloads()",
    "claim": "Inspected test coverage; not run."
  },
  {
    "identity": "RFC 8493 BagIt 1.0",
    "url": "https://www.rfc-editor.org/rfc/rfc8493.txt",
    "version": "RFC 8493",
    "capture_path": "sources/S01-rfc8493.txt",
    "sha256": "4964147d2e6e16442d4a6dbfbe68178a8f33c3e791c06d68a8b33f51ad821537",
    "source_id": "SRC-RFC8493",
    "source_map_path": "source-map.json",
    "locator": "§§2.1.3, 2.4, 3, 5.1",
    "claim": "Manifest, algorithms, validity and safe paths."
  },
  {
    "identity": "bagit-python issue 157 path encoding bug",
    "url": "https://github.com/LibraryOfCongress/bagit-python/issues/157",
    "version": "Issue opened 2022-02-15",
    "capture_path": "sources/S16-bagit-issue-157.html",
    "sha256": "06e5f79dae382d0c406d6310a0a110c2e9c6e852ab2e977ae11fd5aa2920b4f7",
    "source_id": "SRC-ISSUE-157",
    "source_map_path": "source-map.json",
    "locator": "Issue body",
    "claim": "Path encoding risk."
  }
]
```


### O3_HISTORY

[Complete record](#finding-b5e890276412b7e9954549066b865a253b557360887039a1ef70c75979186528)

```json
[
  {
    "identity": "bagit-python issue 152 tilde filename false error",
    "url": "https://github.com/LibraryOfCongress/bagit-python/issues/152",
    "version": "Issue opened 2021-04-23",
    "capture_path": "sources/S07-issue-152.html",
    "sha256": "4fa807637bcac9272cb97dd2fd1f2b3a18c9635441edfa35cb6861872312ceed",
    "source_id": "SRC-ISSUE-152",
    "source_map_path": "source-map.json",
    "locator": "Issue description and reproduction",
    "claim": "Real regression report."
  },
  {
    "identity": "bagit-python PR 184 remove expandvars",
    "url": "https://github.com/LibraryOfCongress/bagit-python/pull/184",
    "version": "Merged 2025-06-13; closes issue 152",
    "capture_path": "sources/S08-pr-184.html",
    "sha256": "d30fcb139b25d0205337e1e57a7152f595a533479a4d657fdf2f956d7ea89ec0",
    "source_id": "SRC-PR-184",
    "source_map_path": "source-map.json",
    "locator": "Merged PR conversation",
    "claim": "Reviewed fix."
  },
  {
    "identity": "bagit-python merge commit 753679",
    "url": "https://github.com/LibraryOfCongress/bagit-python/commit/753679c9b342660d038f65a8dc4f755ab95d679b.patch",
    "version": "753679c9b342660d038f65a8dc4f755ab95d679b",
    "capture_path": "sources/S09-fix-753679c9b342660d038f65a8dc4f755ab95d679b.patch",
    "sha256": "c423e4f9b7a12fd07bf0b8296dbf0be89b1940c03702f355522320e2486779d7",
    "source_id": "SRC-COMMIT-753679",
    "source_map_path": "source-map.json",
    "locator": "Commit diff",
    "claim": "Exact source change."
  },
  {
    "identity": "LibraryOfCongress bagit-python release",
    "url": "https://github.com/LibraryOfCongress/bagit-python/releases/tag/v1.9.0",
    "version": "v1.9.0, commit 861ddacb339d5b92659f0187a402f501d841abbe",
    "capture_path": "sources/S04-bagit-v1.9.0-release.html",
    "sha256": "5da3ece07de54bebb17417cfa7ab83ebf6ff3343f154192aad9c2a9302056680",
    "source_id": "SRC-BAGIT-RELEASE",
    "source_map_path": "source-map.json",
    "locator": "v1.9.0 release notes",
    "claim": "Release applicability."
  },
  {
    "identity": "bagit.py immutable release source",
    "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py",
    "version": "v1.9.0 commit 861ddacb339d5b92659f0187a402f501d841abbe",
    "capture_path": "sources/S05-bagit-861ddacb339d5b92659f0187a402f501d841abbe.py",
    "sha256": "1c851d04fb8ebdc28e5ad2ffc484569575a1f3922ed83abccd61edd3ee26f80a",
    "source_id": "SRC-BAGIT-CODE",
    "source_map_path": "source-map.json",
    "locator": "_path_is_dangerous() and _encode_filename()",
    "claim": "Release code behavior."
  },
  {
    "identity": "bagit-python immutable release tests",
    "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/test.py",
    "version": "v1.9.0 same commit",
    "capture_path": "sources/S06-bagit-test-861ddacb339d5b92659f0187a402f501d841abbe.py",
    "sha256": "751f20546c671b9128e9577d077c39574586d7c9be42921f4cd3ab86a5e0ef6a",
    "source_id": "SRC-BAGIT-TESTS",
    "source_map_path": "source-map.json",
    "locator": "Unsafe-path tests",
    "claim": "Regression coverage limit."
  },
  {
    "identity": "bagit-python issue 157 path encoding bug",
    "url": "https://github.com/LibraryOfCongress/bagit-python/issues/157",
    "version": "Issue opened 2022-02-15",
    "capture_path": "sources/S16-bagit-issue-157.html",
    "sha256": "06e5f79dae382d0c406d6310a0a110c2e9c6e852ab2e977ae11fd5aa2920b4f7",
    "source_id": "SRC-ISSUE-157",
    "source_map_path": "source-map.json",
    "locator": "Issue description",
    "claim": "Separate path-encoding concern."
  },
  {
    "identity": "RFC 8493 BagIt 1.0",
    "url": "https://www.rfc-editor.org/rfc/rfc8493.txt",
    "version": "RFC 8493",
    "capture_path": "sources/S01-rfc8493.txt",
    "sha256": "4964147d2e6e16442d4a6dbfbe68178a8f33c3e791c06d68a8b33f51ad821537",
    "source_id": "SRC-RFC8493",
    "source_map_path": "source-map.json",
    "locator": "§2.1.3",
    "claim": "Normative encoding rule."
  }
]
```


### O4_P1_TO_P6_COMPARISON

[Complete record](#finding-213d79b13427d637b82005438d42b03cf7cf37f0f8b1012270fa64e314140558)

```json
[
  {
    "identity": "RFC 8493 BagIt 1.0",
    "url": "https://www.rfc-editor.org/rfc/rfc8493.txt",
    "version": "RFC 8493",
    "capture_path": "sources/S01-rfc8493.txt",
    "sha256": "4964147d2e6e16442d4a6dbfbe68178a8f33c3e791c06d68a8b33f51ad821537",
    "source_id": "SRC-RFC8493",
    "source_map_path": "source-map.json",
    "locator": "Package structure, manifests and security",
    "claim": "Supports package amendments."
  },
  {
    "identity": "Library of Congress Recommended Formats Statement Audio",
    "url": "https://www.loc.gov/preservation/resources/rfs/audio.html",
    "version": "Current annual HTML edition at capture",
    "capture_path": "sources/S02-loc-rfs-audio.html",
    "sha256": "2a419216eb2488959fa1329e2c0c60f411fa979521b58c8c8f2bae1c19b7ca76",
    "source_id": "SRC-LOC-RFS-AUDIO",
    "source_map_path": "source-map.json",
    "locator": "Digital audio preferences",
    "claim": "Limited source-format evidence."
  },
  {
    "identity": "Library of Congress literary audio archives workflow case study",
    "url": "https://blogs.loc.gov/thesignal/files/2022/05/JDMM_10_1_JDMM0002_Darby_et_al.pdf?loclr=blogpoe",
    "version": "2022 institutional case study",
    "capture_path": "sources/S15-loc-literary-audio-workflow-2022.pdf",
    "sha256": "646f2cb4e9ffa47668fcf436d89d84317bae2780e7221fdb4bda9ba89a77d42b",
    "source_id": "SRC-LOC-ORAL-HISTORY",
    "source_map_path": "source-map.json",
    "locator": "Test-ingest/derivative workflow",
    "claim": "Analogue for review and access copy."
  },
  {
    "identity": "FFprobe documentation",
    "url": "https://www.ffmpeg.org/ffprobe-all.html",
    "version": "Live documentation, not release-pinned",
    "capture_path": "sources/S12-ffprobe-8.1.html",
    "sha256": "6a862a570dd572bad0c4c453dc590fe254d3830675b02e7d64f7145dfc0dea46",
    "source_id": "SRC-FFPROBE",
    "source_map_path": "source-map.json",
    "locator": "Tool description",
    "claim": "Inspection option."
  },
  {
    "identity": "FFmpeg CLI documentation",
    "url": "https://www.ffmpeg.org/ffmpeg.html",
    "version": "Live documentation, not release-pinned",
    "capture_path": "sources/S11-ffmpeg-8.1-cli.html",
    "sha256": "e04c69cd08537b9b9d8d16ecaab9f56d938455e54ef42c37a2019053df8495cb",
    "source_id": "SRC-FFMPEG-DOCS",
    "source_map_path": "source-map.json",
    "locator": "Metadata controls",
    "claim": "Derivative behavior."
  },
  {
    "identity": "bagit.py immutable release source",
    "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py",
    "version": "v1.9.0 commit 861ddacb339d5b92659f0187a402f501d841abbe",
    "capture_path": "sources/S05-bagit-861ddacb339d5b92659f0187a402f501d841abbe.py",
    "sha256": "1c851d04fb8ebdc28e5ad2ffc484569575a1f3922ed83abccd61edd3ee26f80a",
    "source_id": "SRC-BAGIT-CODE",
    "source_map_path": "source-map.json",
    "locator": "make_bag()/validate()",
    "claim": "Implementation cautions."
  }
]
```


### FULL_PLAN_REPLACEMENT

[Complete record](#finding-f9ebff3c6e088fbe23a281b498cf18a4cef469b395d8ab2683d59b111c72396d)

```json
[
  {
    "identity": "RFC 8493 BagIt 1.0",
    "url": "https://www.rfc-editor.org/rfc/rfc8493.txt",
    "version": "RFC 8493",
    "capture_path": "sources/S01-rfc8493.txt",
    "sha256": "4964147d2e6e16442d4a6dbfbe68178a8f33c3e791c06d68a8b33f51ad821537",
    "source_id": "SRC-RFC8493",
    "source_map_path": "source-map.json",
    "locator": "§§2–5",
    "claim": "BagIt contract."
  },
  {
    "identity": "Library of Congress Recommended Formats Statement Audio",
    "url": "https://www.loc.gov/preservation/resources/rfs/audio.html",
    "version": "Current annual HTML edition at capture",
    "capture_path": "sources/S02-loc-rfs-audio.html",
    "sha256": "2a419216eb2488959fa1329e2c0c60f411fa979521b58c8c8f2bae1c19b7ca76",
    "source_id": "SRC-LOC-RFS-AUDIO",
    "source_map_path": "source-map.json",
    "locator": "IV.ii",
    "claim": "Format preference scope."
  },
  {
    "identity": "Library of Congress FDD000357 BWF Version 2",
    "url": "https://www.loc.gov/preservation/digital/formats/fdd/fdd000357.shtml",
    "version": "FDD000357 current page at capture",
    "capture_path": "sources/S03-loc-bwf-v2.html",
    "sha256": "0542ae7a3208323b37f606ff9622e4063ab4b69c6a778711f6b729b9a31e575c",
    "source_id": "SRC-LOC-BWF-V2",
    "source_map_path": "source-map.json",
    "locator": "Local use and sustainability",
    "claim": "BWF context."
  },
  {
    "identity": "Library of Congress PREMIS Data Dictionary",
    "url": "https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf",
    "version": "PREMIS 3.0",
    "capture_path": "sources/S10-premis-v3.pdf",
    "sha256": "2e3e3fe001798f3f43d26b4aed03e8737310fa044ee001af2493f7c72517b0e0",
    "source_id": "SRC-PREMIS",
    "source_map_path": "source-map.json",
    "locator": "Event entity §§2.1–2.7",
    "claim": "Minimal provenance semantics."
  },
  {
    "identity": "FFmpeg official release page",
    "url": "https://ffmpeg.org/download.html",
    "version": "9.0.2 released 2026-09-18",
    "capture_path": "sources/S13-ffmpeg-download.html",
    "sha256": "e1b15edebbabe602905de2b10aa4784fa3b0ed6125582248b686ba3aab3c6442",
    "source_id": "SRC-FFMPEG-RELEASE",
    "source_map_path": "source-map.json",
    "locator": "9.0.2 release entry",
    "claim": "Version candidate."
  },
  {
    "identity": "FFprobe documentation",
    "url": "https://www.ffmpeg.org/ffprobe-all.html",
    "version": "Live documentation, not release-pinned",
    "capture_path": "sources/S12-ffprobe-8.1.html",
    "sha256": "6a862a570dd572bad0c4c453dc590fe254d3830675b02e7d64f7145dfc0dea46",
    "source_id": "SRC-FFPROBE",
    "source_map_path": "source-map.json",
    "locator": "Description/output sections",
    "claim": "Inspection candidate."
  },
  {
    "identity": "BWF MetaEdit official product page",
    "url": "https://mediaarea.net/BWFMetaEdit",
    "version": "26.08.1 observed at capture",
    "capture_path": "sources/S14-bwfmetaedit-product.html",
    "sha256": "7ec25815af64a1a912cbfb63fffe88de3610949bb768922e6d73c4a17c52ff70",
    "source_id": "SRC-BWF-METAEDIT",
    "source_map_path": "source-map.json",
    "locator": "Features",
    "claim": "Optional tool."
  },
  {
    "identity": "bagit.py immutable release source",
    "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py",
    "version": "v1.9.0 commit 861ddacb339d5b92659f0187a402f501d841abbe",
    "capture_path": "sources/S05-bagit-861ddacb339d5b92659f0187a402f501d841abbe.py",
    "sha256": "1c851d04fb8ebdc28e5ad2ffc484569575a1f3922ed83abccd61edd3ee26f80a",
    "source_id": "SRC-BAGIT-CODE",
    "source_map_path": "source-map.json",
    "locator": "Pinned code symbols",
    "claim": "Adoption conditions."
  },
  {
    "identity": "bagit-python issue 157 path encoding bug",
    "url": "https://github.com/LibraryOfCongress/bagit-python/issues/157",
    "version": "Issue opened 2022-02-15",
    "capture_path": "sources/S16-bagit-issue-157.html",
    "sha256": "06e5f79dae382d0c406d6310a0a110c2e9c6e852ab2e977ae11fd5aa2920b4f7",
    "source_id": "SRC-ISSUE-157",
    "source_map_path": "source-map.json",
    "locator": "Issue body",
    "claim": "Path encoding condition."
  }
]
```


### O5_CRITIC_PENDING

[Complete record](#finding-db060f6849b9306d7c5d098f0b3606ac2cdb4d01c878b9f61caca0dae7656759)

```json
[
  {
    "identity": "bagit.py immutable release source",
    "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py",
    "version": "v1.9.0 commit 861ddacb339d5b92659f0187a402f501d841abbe",
    "capture_path": "sources/S05-bagit-861ddacb339d5b92659f0187a402f501d841abbe.py",
    "sha256": "1c851d04fb8ebdc28e5ad2ffc484569575a1f3922ed83abccd61edd3ee26f80a",
    "source_id": "SRC-BAGIT-CODE",
    "source_map_path": "source-map.json",
    "locator": "Pinned code symbols",
    "claim": "Independent code check."
  },
  {
    "identity": "RFC 8493 BagIt 1.0",
    "url": "https://www.rfc-editor.org/rfc/rfc8493.txt",
    "version": "RFC 8493",
    "capture_path": "sources/S01-rfc8493.txt",
    "sha256": "4964147d2e6e16442d4a6dbfbe68178a8f33c3e791c06d68a8b33f51ad821537",
    "source_id": "SRC-RFC8493",
    "source_map_path": "source-map.json",
    "locator": "Package requirements",
    "claim": "Independent standard check."
  },
  {
    "identity": "Library of Congress Recommended Formats Statement Audio",
    "url": "https://www.loc.gov/preservation/resources/rfs/audio.html",
    "version": "Current annual HTML edition at capture",
    "capture_path": "sources/S02-loc-rfs-audio.html",
    "sha256": "2a419216eb2488959fa1329e2c0c60f411fa979521b58c8c8f2bae1c19b7ca76",
    "source_id": "SRC-LOC-RFS-AUDIO",
    "source_map_path": "source-map.json",
    "locator": "Format scope",
    "claim": "Independent applicability check."
  }
]
```


### P6_ACCEPTANCE

[Complete record](#finding-dd2fd434b7641607a71fb8ba03bd837ddc5c13a426525e66fe06dfaee81bfbe1)

```json
[
  {
    "identity": "RFC 8493 BagIt 1.0",
    "url": "https://www.rfc-editor.org/rfc/rfc8493.txt",
    "version": "RFC 8493",
    "capture_path": "sources/S01-rfc8493.txt",
    "sha256": "4964147d2e6e16442d4a6dbfbe68178a8f33c3e791c06d68a8b33f51ad821537",
    "source_id": "SRC-RFC8493",
    "source_map_path": "source-map.json",
    "locator": "§§2.1.3 and 5.1",
    "claim": "Path/fixity cases."
  },
  {
    "identity": "bagit-python immutable release tests",
    "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/test.py",
    "version": "v1.9.0 same commit",
    "capture_path": "sources/S06-bagit-test-861ddacb339d5b92659f0187a402f501d841abbe.py",
    "sha256": "751f20546c671b9128e9577d077c39574586d7c9be42921f4cd3ab86a5e0ef6a",
    "source_id": "SRC-BAGIT-TESTS",
    "source_map_path": "source-map.json",
    "locator": "Unsafe path test definitions",
    "claim": "Existing test ideas, not run."
  },
  {
    "identity": "Library of Congress literary audio archives workflow case study",
    "url": "https://blogs.loc.gov/thesignal/files/2022/05/JDMM_10_1_JDMM0002_Darby_et_al.pdf?loclr=blogpoe",
    "version": "2022 institutional case study",
    "capture_path": "sources/S15-loc-literary-audio-workflow-2022.pdf",
    "sha256": "646f2cb4e9ffa47668fcf436d89d84317bae2780e7221fdb4bda9ba89a77d42b",
    "source_id": "SRC-LOC-ORAL-HISTORY",
    "source_map_path": "source-map.json",
    "locator": "Test ingest workflow",
    "claim": "Review-before-ingest analogy."
  }
]
```


### EXECUTION_RECORD

[Complete record](#finding-6ecbcfd2174eab4f3fff9b056d5074eee8e36f6d50be24089fa5d5ab02eec52b)

```json
[
  {
    "identity": "FFprobe documentation",
    "url": "https://www.ffmpeg.org/ffprobe-all.html",
    "version": "Live documentation, not release-pinned",
    "capture_path": "sources/S12-ffprobe-8.1.html",
    "sha256": "6a862a570dd572bad0c4c453dc590fe254d3830675b02e7d64f7145dfc0dea46",
    "source_id": "SRC-FFPROBE",
    "source_map_path": "source-map.json",
    "locator": "Tool description",
    "claim": "First useful finding."
  },
  {
    "identity": "bagit.py immutable release source",
    "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py",
    "version": "v1.9.0 commit 861ddacb339d5b92659f0187a402f501d841abbe",
    "capture_path": "sources/S05-bagit-861ddacb339d5b92659f0187a402f501d841abbe.py",
    "sha256": "1c851d04fb8ebdc28e5ad2ffc484569575a1f3922ed83abccd61edd3ee26f80a",
    "source_id": "SRC-BAGIT-CODE",
    "source_map_path": "source-map.json",
    "locator": "Static code inspection",
    "claim": "Research-only operation."
  }
]
```


## Complete record detail view


<a id="finding-5d976c2e5edc36033854effa23b7f474f78431bedf0bc070ff7766c77a4016a4"></a>


### O1_OPEN_DISCOVERY

```json
{
  "id": "O1_OPEN_DISCOVERY",
  "summary": "Need-led public discovery supports a staged, reviewable ingest workflow with separate preservation, inspection and access-copy decisions.",
  "disposition": "Accepted with scope limits; sources are analogies and technical evidence, not a universal recipe.",
  "evidence": [
    "A Library of Congress literary audio workflow documents a test ingest that creates a review CSV before formal ingest and scripted FFmpeg MP3 access copies from WAV masters. This supports review-before-commit and derivative provenance, but not importing its settings or storage topology.",
    "The LoC audio statement prefers native resolution and uncompressed media-independent audio and lists BWF WAVE with embedded metadata as preferred in that statement's scope. It does not require converting oral-history intake MP3 or FLAC files to WAVE.",
    "FFprobe documents structured machine-readable format and stream output. FFmpeg documents metadata mapping and override controls. BWF MetaEdit is a specialized BWF tool that can validate and edit embedded metadata."
  ],
  "conditions": {
    "condition": "Begin from oral-history desk need. Do not treat release-format recommendations as a recipe for born-digital interviews or automatically rewrite metadata."
  },
  "options": [
    "FFprobe 9.0.2 candidate for inspection; validate against synthetic formats and malformed metadata.",
    "Optional BWF MetaEdit for BWF-specific inspection only.",
    "Reviewable batch CSV can be built into UI or exported."
  ],
  "optional_leads": [
    "Keep technical metadata, source tags, archivist note and correction as separate values.",
    "Use BWF workflow guidance only when source format and collection policy make it applicable."
  ],
  "validation": [
    "Proposed: compare parser results on synthetic valid/malformed WAV/BWF, FLAC and MP3; no audio file was decoded in this research."
  ],
  "uncertainty": [
    "FFmpeg/FFprobe docs are live and not release-pinned. A release binary must be verified at build time.",
    "The LoC case study is institutional practice, not a product build or performance result."
  ],
  "sources": [
    {
      "identity": "Library of Congress literary audio archives workflow case study",
      "url": "https://blogs.loc.gov/thesignal/files/2022/05/JDMM_10_1_JDMM0002_Darby_et_al.pdf?loclr=blogpoe",
      "version": "2022 institutional case study",
      "capture_path": "sources/S15-loc-literary-audio-workflow-2022.pdf",
      "sha256": "646f2cb4e9ffa47668fcf436d89d84317bae2780e7221fdb4bda9ba89a77d42b",
      "source_id": "SRC-LOC-ORAL-HISTORY",
      "source_map_path": "source-map.json",
      "locator": "PDF discussion of ingest review CSV and MP3 access derivatives",
      "claim": "Institutional oral-history analogy."
    },
    {
      "identity": "Library of Congress Recommended Formats Statement Audio",
      "url": "https://www.loc.gov/preservation/resources/rfs/audio.html",
      "version": "Current annual HTML edition at capture",
      "capture_path": "sources/S02-loc-rfs-audio.html",
      "sha256": "2a419216eb2488959fa1329e2c0c60f411fa979521b58c8c8f2bae1c19b7ca76",
      "source_id": "SRC-LOC-RFS-AUDIO",
      "source_map_path": "source-map.json",
      "locator": "IV.ii.A and IV.ii.C",
      "claim": "Format preference scope."
    },
    {
      "identity": "Library of Congress FDD000357 BWF Version 2",
      "url": "https://www.loc.gov/preservation/digital/formats/fdd/fdd000357.shtml",
      "version": "FDD000357 current page at capture",
      "capture_path": "sources/S03-loc-bwf-v2.html",
      "sha256": "0542ae7a3208323b37f606ff9622e4063ab4b69c6a778711f6b729b9a31e575c",
      "source_id": "SRC-LOC-BWF-V2",
      "source_map_path": "source-map.json",
      "locator": "Local use and sustainability",
      "claim": "BWF/LPCM practice."
    },
    {
      "identity": "FFprobe documentation",
      "url": "https://www.ffmpeg.org/ffprobe-all.html",
      "version": "Live documentation, not release-pinned",
      "capture_path": "sources/S12-ffprobe-8.1.html",
      "sha256": "6a862a570dd572bad0c4c453dc590fe254d3830675b02e7d64f7145dfc0dea46",
      "source_id": "SRC-FFPROBE",
      "source_map_path": "source-map.json",
      "locator": "Description and output writers",
      "claim": "Read-only inspection candidate."
    },
    {
      "identity": "FFmpeg CLI documentation",
      "url": "https://www.ffmpeg.org/ffmpeg.html",
      "version": "Live documentation, not release-pinned",
      "capture_path": "sources/S11-ffmpeg-8.1-cli.html",
      "sha256": "e04c69cd08537b9b9d8d16ecaab9f56d938455e54ef42c37a2019053df8495cb",
      "source_id": "SRC-FFMPEG-DOCS",
      "source_map_path": "source-map.json",
      "locator": "-map_metadata and -metadata sections",
      "claim": "Mapping behavior."
    },
    {
      "identity": "BWF MetaEdit official product page",
      "url": "https://mediaarea.net/BWFMetaEdit",
      "version": "26.08.1 observed at capture",
      "capture_path": "sources/S14-bwfmetaedit-product.html",
      "sha256": "7ec25815af64a1a912cbfb63fffe88de3610949bb768922e6d73c4a17c52ff70",
      "source_id": "SRC-BWF-METAEDIT",
      "source_map_path": "source-map.json",
      "locator": "Features",
      "claim": "BWF-specific optional product."
    }
  ]
}
```


<a id="finding-7f228bd14b531372c8d317344c7eb97feef5baba3806e2981a749dae0eaed94f"></a>


### O2_PINNED_CODE

```json
{
  "id": "O2_PINNED_CODE",
  "summary": "bagit-python v1.9.0 source at commit 861ddacb339d5b92659f0187a402f501d841abbe was inspected as the consequential package implementation candidate.",
  "disposition": "Versioned code evidence accepted; runtime adoption remains conditional.",
  "evidence": [
    "make_bag() defaults to SHA-256 and SHA-512, then moves input directory contents into a data folder in place before writing bag metadata/manifests. Never run it on the removable source tree; stage a copy first.",
    "Bag.validate() defaults to complete fixity verification. fast=True returns after Payload-Oxum file-count and byte-count checks and does not recalculate manifest checksums.",
    "Bag._load_manifests() and Bag.fetch_entries() call _path_is_dangerous() when interpreting manifest and fetch paths. RFC 8493 requires path containment and percent-encoding rules.",
    "_encode_filename() replaces CR and LF but not literal percent. Issue #157 describes this BagIt 1.0 interoperability problem; exact v1.9.0 tests do not include percent-path coverage.",
    "Code-review inference: _path_is_dangerous() uses os.path.commonprefix() on normalized strings, which is not a path-segment containment proof. Treat as a test/adoption concern, not a confirmed exploit."
  ],
  "conditions": {
    "version": "Exact code and tests captured from release commit 861ddacb339d5b92659f0187a402f501d841abbe.",
    "scope": "bagit-python is a reference/optional candidate; BagIt 1.0 is the proposed package standard, not a mandatory Python runtime."
  },
  "options": [
    "Use v1.9.0 only on completed staging copies and only with strict path conformance checks.",
    "Consider implementing BagIt 1.0 natively in the eventual app language, or use the pinned package as an interoperability reference."
  ],
  "optional_leads": [
    "Do not rely on fast validation for fixity.",
    "Do not rely on _path_is_dangerous() as the application's sole boundary check without adversarial cross-platform tests."
  ],
  "validation": [
    "Proposed: create/reopen synthetic bags with SHA-512/SHA-256, changed/missing/extra files, percent/CR/LF names and paths outside the package.",
    "Executed: static reading of captured source/test files only; no downloaded code or tests executed."
  ],
  "uncertainty": [
    "The static commonprefix review is a code-level concern, not a proven exploit.",
    "Release page marked v1.9.0 as latest at capture while master had later commits; master was not substituted."
  ],
  "sources": [
    {
      "identity": "bagit.py immutable release source",
      "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py",
      "version": "v1.9.0 commit 861ddacb339d5b92659f0187a402f501d841abbe",
      "capture_path": "sources/S05-bagit-861ddacb339d5b92659f0187a402f501d841abbe.py",
      "sha256": "1c851d04fb8ebdc28e5ad2ffc484569575a1f3922ed83abccd61edd3ee26f80a",
      "source_id": "SRC-BAGIT-CODE",
      "source_map_path": "source-map.json",
      "locator": "make_bag() lines 141–260; validate() 586–616; fetch_entries() 545–574; _load_manifests() 620–745; _path_is_dangerous() 925–941; _encode_filename() 1405–1414",
      "claim": "Pinned definitions and callers."
    },
    {
      "identity": "bagit-python immutable release tests",
      "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/test.py",
      "version": "v1.9.0 same commit",
      "capture_path": "sources/S06-bagit-test-861ddacb339d5b92659f0187a402f501d841abbe.py",
      "sha256": "751f20546c671b9128e9577d077c39574586d7c9be42921f4cd3ab86a5e0ef6a",
      "source_id": "SRC-BAGIT-TESTS",
      "source_map_path": "source-map.json",
      "locator": "test_unsafe_directory_entries_raise_error() and test_fetch_unsafe_payloads()",
      "claim": "Inspected test coverage; not run."
    },
    {
      "identity": "RFC 8493 BagIt 1.0",
      "url": "https://www.rfc-editor.org/rfc/rfc8493.txt",
      "version": "RFC 8493",
      "capture_path": "sources/S01-rfc8493.txt",
      "sha256": "4964147d2e6e16442d4a6dbfbe68178a8f33c3e791c06d68a8b33f51ad821537",
      "source_id": "SRC-RFC8493",
      "source_map_path": "source-map.json",
      "locator": "§§2.1.3, 2.4, 3, 5.1",
      "claim": "Manifest, algorithms, validity and safe paths."
    },
    {
      "identity": "bagit-python issue 157 path encoding bug",
      "url": "https://github.com/LibraryOfCongress/bagit-python/issues/157",
      "version": "Issue opened 2022-02-15",
      "capture_path": "sources/S16-bagit-issue-157.html",
      "sha256": "06e5f79dae382d0c406d6310a0a110c2e9c6e852ab2e977ae11fd5aa2920b4f7",
      "source_id": "SRC-ISSUE-157",
      "source_map_path": "source-map.json",
      "locator": "Issue body",
      "claim": "Path encoding risk."
    }
  ]
}
```


<a id="finding-b5e890276412b7e9954549066b865a253b557360887039a1ef70c75979186528"></a>


### O3_HISTORY

```json
{
  "id": "O3_HISTORY",
  "summary": "Issue #152 has a traceable upstream fix in a released version; separate issue #157 remains relevant to the exact release code.",
  "disposition": "Issue/fix/release applicability supported; no automated regression test for the exact tilde case was found.",
  "evidence": [
    "Issue #152 reports a Linux/Python false unsafe-path rejection for a name containing ~$_- because os.path.expandvars() expands it. The issue supplies a reproducible example.",
    "PR #184 removes the expandvars check from _path_is_dangerous(); merge commit 753679c9b342660d038f65a8dc4f755ab95d679b closes #152. The v1.9.0 release notes list #184 and the exact tagged source no longer calls expandvars.",
    "The merge patch changes one source file with two deletions and no test addition. The release test file has generic unsafe path checks, but not the exact issue #152 name. Thus the issue reproduction and code delta are regression evidence; a committed automated regression test is not established.",
    "At the same v1.9.0 tag, _encode_filename() handles CR/LF but not literal percent; RFC 8493 requires encoding percent too. This is a separate limitation, not a consequence of #152."
  ],
  "conditions": {
    "release": "v1.9.0 commit 861ddacb339d5b92659f0187a402f501d841abbe contains the merged change.",
    "claim_limit": "No inference that any downstream product shipped this code."
  },
  "options": [
    "Add exact issue #152 filename test on Linux and Windows.",
    "Add literal percent, CR/LF/CRLF path tests including names that resemble encoded paths."
  ],
  "optional_leads": [
    "Dispositions: #152 corrected false rejection; #157 path interoperability remains open in the examined release code."
  ],
  "validation": [
    "Proposed only: regression suite on the selected exact build; no upstream or product test was run here."
  ],
  "uncertainty": [
    "The PR does not add a test, and a source release note cannot prove downstream use."
  ],
  "sources": [
    {
      "identity": "bagit-python issue 152 tilde filename false error",
      "url": "https://github.com/LibraryOfCongress/bagit-python/issues/152",
      "version": "Issue opened 2021-04-23",
      "capture_path": "sources/S07-issue-152.html",
      "sha256": "4fa807637bcac9272cb97dd2fd1f2b3a18c9635441edfa35cb6861872312ceed",
      "source_id": "SRC-ISSUE-152",
      "source_map_path": "source-map.json",
      "locator": "Issue description and reproduction",
      "claim": "Real regression report."
    },
    {
      "identity": "bagit-python PR 184 remove expandvars",
      "url": "https://github.com/LibraryOfCongress/bagit-python/pull/184",
      "version": "Merged 2025-06-13; closes issue 152",
      "capture_path": "sources/S08-pr-184.html",
      "sha256": "d30fcb139b25d0205337e1e57a7152f595a533479a4d657fdf2f956d7ea89ec0",
      "source_id": "SRC-PR-184",
      "source_map_path": "source-map.json",
      "locator": "Merged PR conversation",
      "claim": "Reviewed fix."
    },
    {
      "identity": "bagit-python merge commit 753679",
      "url": "https://github.com/LibraryOfCongress/bagit-python/commit/753679c9b342660d038f65a8dc4f755ab95d679b.patch",
      "version": "753679c9b342660d038f65a8dc4f755ab95d679b",
      "capture_path": "sources/S09-fix-753679c9b342660d038f65a8dc4f755ab95d679b.patch",
      "sha256": "c423e4f9b7a12fd07bf0b8296dbf0be89b1940c03702f355522320e2486779d7",
      "source_id": "SRC-COMMIT-753679",
      "source_map_path": "source-map.json",
      "locator": "Commit diff",
      "claim": "Exact source change."
    },
    {
      "identity": "LibraryOfCongress bagit-python release",
      "url": "https://github.com/LibraryOfCongress/bagit-python/releases/tag/v1.9.0",
      "version": "v1.9.0, commit 861ddacb339d5b92659f0187a402f501d841abbe",
      "capture_path": "sources/S04-bagit-v1.9.0-release.html",
      "sha256": "5da3ece07de54bebb17417cfa7ab83ebf6ff3343f154192aad9c2a9302056680",
      "source_id": "SRC-BAGIT-RELEASE",
      "source_map_path": "source-map.json",
      "locator": "v1.9.0 release notes",
      "claim": "Release applicability."
    },
    {
      "identity": "bagit.py immutable release source",
      "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py",
      "version": "v1.9.0 commit 861ddacb339d5b92659f0187a402f501d841abbe",
      "capture_path": "sources/S05-bagit-861ddacb339d5b92659f0187a402f501d841abbe.py",
      "sha256": "1c851d04fb8ebdc28e5ad2ffc484569575a1f3922ed83abccd61edd3ee26f80a",
      "source_id": "SRC-BAGIT-CODE",
      "source_map_path": "source-map.json",
      "locator": "_path_is_dangerous() and _encode_filename()",
      "claim": "Release code behavior."
    },
    {
      "identity": "bagit-python immutable release tests",
      "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/test.py",
      "version": "v1.9.0 same commit",
      "capture_path": "sources/S06-bagit-test-861ddacb339d5b92659f0187a402f501d841abbe.py",
      "sha256": "751f20546c671b9128e9577d077c39574586d7c9be42921f4cd3ab86a5e0ef6a",
      "source_id": "SRC-BAGIT-TESTS",
      "source_map_path": "source-map.json",
      "locator": "Unsafe-path tests",
      "claim": "Regression coverage limit."
    },
    {
      "identity": "bagit-python issue 157 path encoding bug",
      "url": "https://github.com/LibraryOfCongress/bagit-python/issues/157",
      "version": "Issue opened 2022-02-15",
      "capture_path": "sources/S16-bagit-issue-157.html",
      "sha256": "06e5f79dae382d0c406d6310a0a110c2e9c6e852ab2e977ae11fd5aa2920b4f7",
      "source_id": "SRC-ISSUE-157",
      "source_map_path": "source-map.json",
      "locator": "Issue description",
      "claim": "Separate path-encoding concern."
    },
    {
      "identity": "RFC 8493 BagIt 1.0",
      "url": "https://www.rfc-editor.org/rfc/rfc8493.txt",
      "version": "RFC 8493",
      "capture_path": "sources/S01-rfc8493.txt",
      "sha256": "4964147d2e6e16442d4a6dbfbe68178a8f33c3e791c06d68a8b33f51ad821537",
      "source_id": "SRC-RFC8493",
      "source_map_path": "source-map.json",
      "locator": "§2.1.3",
      "claim": "Normative encoding rule."
    }
  ]
}
```


<a id="finding-213d79b13427d637b82005438d42b03cf7cf37f0f8b1012270fa64e314140558"></a>


### O4_P1_TO_P6_COMPARISON

```json
{
  "id": "O4_P1_TO_P6_COMPARISON",
  "summary": "Every frozen P1–P6 decision is compared below with an explicit disposition.",
  "disposition": "Complete plan comparison; all decisions remain within the frozen scope.",
  "evidence": [
    "P1 Batch capture — amend. Retain WAV/BWF, FLAC and MP3, up to 100, original names/relative folders, copy-only and source nonmutation. Add preflight, stable per-file copy/verify/interruption states, streaming SHA-512/SHA-256 and independent destination reread. Rationale: make copy integrity and partial failure visible; bagit-python make_bag() is in-place.",
    "P2 Inspection — amend. Retain duration, channels, encoding, embedded tags, notes, waveform/listen view and correction separation. Add exact parser/build identity, parser warnings, immutable source-tag snapshot, no writes during inspection and explicit unknown channel layouts.",
    "P3 Derivatives — amend. Retain opt-in request, settings preview, original preservation and visible failure. Add per-file explicit container/codec/sample rate/bit depth/channel mapping/metadata mapping, temp output, post-output probe and tool/build/settings provenance; no default conversion recipe.",
    "P4 Packaging — amend. Retain originals, derivative references, provenance, fixity, tool version and reopen checks. Propose BagIt 1.0, data/originals and data/derivatives paths, sidecar provenance, complete SHA-512/SHA-256 manifests and full fixity on reopen; no fetch.txt.",
    "P5 Components/environment — retain undecided status, amend with shortlist and release gates. Keep offline Windows/Linux, no upload and no embedded-metadata writes for display. Candidates: FFprobe/FFmpeg 9.0.2, BagIt 1.0 with conditional bagit-python 1.9.0/native alternative, optional BWF MetaEdit 26.08.1, playback/UI prototype.",
    "P6 Acceptance — amend. Retain interrupted copy, malformed metadata, unusual channels, conversion and package fixity categories; expand to path/collision/partial-file, output verification, tag-manifest, 100-file, disconnected network, Windows/Linux and no-egress synthetic cases."
  ],
  "conditions": {
    "already_covered": "The original plan already covers the six headline areas and the constraints repeated in the replacement plan; no unrelated whole-project coverage is inferred.",
    "cross_reference_limit": "The supplied comparison slice contains only this six-part plan; no broader system guarantees are inferred."
  },
  "options": [
    "Product choices remain: conversion formats/recipes, path collision resolution, exact metadata fields, package serializer implementation, full PREMIS vs subset, playback backend and optional BWF tool."
  ],
  "optional_leads": [
    "Reject converting all sources to BWF/WAV based only on LoC format preferences; reject treating parser success as preservation validation; reject BagIt fast size/count mode as fixity; reject BWF data-chunk MD5 as whole-file fixity; reject automatic metadata correction and remote fetch."
  ],
  "validation": [
    "Proposed checks are listed under P6_ACCEPTANCE and in FULL_PLAN_REPLACEMENT; none of the product checks ran."
  ],
  "uncertainty": [
    "No source resolves local rights/consent/retention/access policy or declares output quality thresholds."
  ],
  "sources": [
    {
      "identity": "RFC 8493 BagIt 1.0",
      "url": "https://www.rfc-editor.org/rfc/rfc8493.txt",
      "version": "RFC 8493",
      "capture_path": "sources/S01-rfc8493.txt",
      "sha256": "4964147d2e6e16442d4a6dbfbe68178a8f33c3e791c06d68a8b33f51ad821537",
      "source_id": "SRC-RFC8493",
      "source_map_path": "source-map.json",
      "locator": "Package structure, manifests and security",
      "claim": "Supports package amendments."
    },
    {
      "identity": "Library of Congress Recommended Formats Statement Audio",
      "url": "https://www.loc.gov/preservation/resources/rfs/audio.html",
      "version": "Current annual HTML edition at capture",
      "capture_path": "sources/S02-loc-rfs-audio.html",
      "sha256": "2a419216eb2488959fa1329e2c0c60f411fa979521b58c8c8f2bae1c19b7ca76",
      "source_id": "SRC-LOC-RFS-AUDIO",
      "source_map_path": "source-map.json",
      "locator": "Digital audio preferences",
      "claim": "Limited source-format evidence."
    },
    {
      "identity": "Library of Congress literary audio archives workflow case study",
      "url": "https://blogs.loc.gov/thesignal/files/2022/05/JDMM_10_1_JDMM0002_Darby_et_al.pdf?loclr=blogpoe",
      "version": "2022 institutional case study",
      "capture_path": "sources/S15-loc-literary-audio-workflow-2022.pdf",
      "sha256": "646f2cb4e9ffa47668fcf436d89d84317bae2780e7221fdb4bda9ba89a77d42b",
      "source_id": "SRC-LOC-ORAL-HISTORY",
      "source_map_path": "source-map.json",
      "locator": "Test-ingest/derivative workflow",
      "claim": "Analogue for review and access copy."
    },
    {
      "identity": "FFprobe documentation",
      "url": "https://www.ffmpeg.org/ffprobe-all.html",
      "version": "Live documentation, not release-pinned",
      "capture_path": "sources/S12-ffprobe-8.1.html",
      "sha256": "6a862a570dd572bad0c4c453dc590fe254d3830675b02e7d64f7145dfc0dea46",
      "source_id": "SRC-FFPROBE",
      "source_map_path": "source-map.json",
      "locator": "Tool description",
      "claim": "Inspection option."
    },
    {
      "identity": "FFmpeg CLI documentation",
      "url": "https://www.ffmpeg.org/ffmpeg.html",
      "version": "Live documentation, not release-pinned",
      "capture_path": "sources/S11-ffmpeg-8.1-cli.html",
      "sha256": "e04c69cd08537b9b9d8d16ecaab9f56d938455e54ef42c37a2019053df8495cb",
      "source_id": "SRC-FFMPEG-DOCS",
      "source_map_path": "source-map.json",
      "locator": "Metadata controls",
      "claim": "Derivative behavior."
    },
    {
      "identity": "bagit.py immutable release source",
      "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py",
      "version": "v1.9.0 commit 861ddacb339d5b92659f0187a402f501d841abbe",
      "capture_path": "sources/S05-bagit-861ddacb339d5b92659f0187a402f501d841abbe.py",
      "sha256": "1c851d04fb8ebdc28e5ad2ffc484569575a1f3922ed83abccd61edd3ee26f80a",
      "source_id": "SRC-BAGIT-CODE",
      "source_map_path": "source-map.json",
      "locator": "make_bag()/validate()",
      "claim": "Implementation cautions."
    }
  ]
}
```


<a id="finding-f9ebff3c6e088fbe23a281b498cf18a4cef469b395d8ab2683d59b111c72396d"></a>


### FULL_PLAN_REPLACEMENT

```json
{
  "id": "FULL_PLAN_REPLACEMENT",
  "summary": "Complete proposed replacement for the frozen sandbox plan: local ingest, inspection, derivatives, package, component choices and acceptance.",
  "disposition": "Proposed complete replacement; not built or validated; O5 fresh criticism remains pending.",
  "evidence": [
    "The replacement keeps the exact P1–P6 scope and user constraints while adding reproducible copy, transform and package records. The content is candidate-authored and the renderer does not adjudicate it."
  ],
  "conditions": {
    "scope": [
      "One archivist and up to 100 selected WAV/BWF, FLAC and MP3 files.",
      "No speech transcription, public publishing, automated rights decision or legal advice.",
      "Offline Windows or Linux; no interview audio/metadata upload; source media remains unchanged."
    ],
    "P1": "Preflight selected files for read access, space, duplicate/case/Unicode collisions, symlink/reparse points and unsafe paths. Show the mapping. Copy to a new local accession staging directory. Hash while reading, re-read the destination and compare SHA-512 and SHA-256 before marking verified. Preserve received names/relative paths; stop for archivist choice if a target filesystem cannot represent a name; record any reversible path mapping. Keep discovered/copying/verified/warning/failed/interrupted/resumed states. Never finalize a partial copy. Resume only after source identity and copied bytes are rechecked; do not delete source.",
    "P2": "Show duration, channel count/layout, encoding, embedded metadata and archivist notes. Evaluate a pinned FFprobe 9.0.2 read-only adapter; record parser version/build and warnings. Keep original embedded fields as an immutable observed snapshot; store corrections separately with author/time. Show errors and unknown channel layouts; no guessing or write function during inspection. Decode waveform on demand and show channels separately.",
    "P3": "Only create a derivative on explicit per-file request. Preview container/codec, sample rate, sample format/bit depth, channel map, metadata map and any resampling/filter. FFmpeg 9.0.2 is a candidate only after build, codec and license review on both platforms. No default lossy recipe, normalization, resampling or downmix. Write temporary output; inspect settings after exit; finalize only if successful. Failure/interruption remains visible with partial output quarantined and original unchanged. Record tool/build, exact settings, source/output identities and outcome.",
    "P4": "Use BagIt 1.0 folder model. Include bagit.txt, bag-info.txt, data/originals/<received-path>, data/derivatives/<stable-id>/<chosen-name>, data/records/ingest.json, SHA-512 and SHA-256 payload manifests and tag manifests. Every payload file including notes/provenance is fixed in manifests; tag files are covered by tag manifests. No fetch.txt or remote payload. Record source digest, copy digest, processing events, tool/settings, derivative relationship and outcome. A digest detects later change against its baseline but proves neither authenticity nor original correctness. Finalize only after complete copy and full fixity. Reopen performs full fixity and reports missing/changed/unexpected; size/count only is not fixity.",
    "P5": "Retain components as undecided but shortlist FFprobe/FFmpeg 9.0.2, BagIt 1.0 and a PREMIS-inspired event record. Compare a native BagIt serializer to bagit-python 1.9.0 only after resolving path encoding and safe-path tests, and only on a staging copy. BWF MetaEdit 26.08.1 is an optional BWF-only QA/export lead, never a writer to originals. Playback backend and UI remain a cross-platform prototype choice. Lock exact binary hashes, build flags, enabled codecs, licenses and dependencies before shipping.",
    "P6": "Propose synthetic checks for interrupted copy/unplug/resume/source change; malformed/contradictory RIFF/BWF, FLAC and ID3 metadata; mono/stereo/multichannel/discrete/unknown layouts; selected conversion parameters and crash/cancel behavior; package tampering by missing/changed/extra/renamed/truncated payload and altered tag files. Add percent/CR/LF path encoding, Unicode/case collisions, long and Windows-reserved paths, symlink/reparse/shared-prefix containment, read-only media, low space, 100 files, disconnected network and no-egress cases. Mark all as proposed until the implementation runs them."
  },
  "options": [
    "Product choices not determined by evidence: lossless/lossy outputs, target settings, per-file/batch operations, path collision policy, exact metadata whitelist, full PREMIS or documented subset, native vs bundled package serializer, playback API and whether BWF MetaEdit fits the workflow."
  ],
  "optional_leads": [
    "Optional review CSV, BWF-specific QA tool, second digest manifest, full PREMIS integration if required, replaceable parser/playback adapters."
  ],
  "validation": [
    "Synthetic P6 checks above are proposals only. No app build, audio test, conversion, performance test or quality claim."
  ],
  "uncertainty": [
    "Format statements do not mandate converting born-digital oral histories. Interviews may need institutional access/retention decisions beyond this technical scope."
  ],
  "sources": [
    {
      "identity": "RFC 8493 BagIt 1.0",
      "url": "https://www.rfc-editor.org/rfc/rfc8493.txt",
      "version": "RFC 8493",
      "capture_path": "sources/S01-rfc8493.txt",
      "sha256": "4964147d2e6e16442d4a6dbfbe68178a8f33c3e791c06d68a8b33f51ad821537",
      "source_id": "SRC-RFC8493",
      "source_map_path": "source-map.json",
      "locator": "§§2–5",
      "claim": "BagIt contract."
    },
    {
      "identity": "Library of Congress Recommended Formats Statement Audio",
      "url": "https://www.loc.gov/preservation/resources/rfs/audio.html",
      "version": "Current annual HTML edition at capture",
      "capture_path": "sources/S02-loc-rfs-audio.html",
      "sha256": "2a419216eb2488959fa1329e2c0c60f411fa979521b58c8c8f2bae1c19b7ca76",
      "source_id": "SRC-LOC-RFS-AUDIO",
      "source_map_path": "source-map.json",
      "locator": "IV.ii",
      "claim": "Format preference scope."
    },
    {
      "identity": "Library of Congress FDD000357 BWF Version 2",
      "url": "https://www.loc.gov/preservation/digital/formats/fdd/fdd000357.shtml",
      "version": "FDD000357 current page at capture",
      "capture_path": "sources/S03-loc-bwf-v2.html",
      "sha256": "0542ae7a3208323b37f606ff9622e4063ab4b69c6a778711f6b729b9a31e575c",
      "source_id": "SRC-LOC-BWF-V2",
      "source_map_path": "source-map.json",
      "locator": "Local use and sustainability",
      "claim": "BWF context."
    },
    {
      "identity": "Library of Congress PREMIS Data Dictionary",
      "url": "https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf",
      "version": "PREMIS 3.0",
      "capture_path": "sources/S10-premis-v3.pdf",
      "sha256": "2e3e3fe001798f3f43d26b4aed03e8737310fa044ee001af2493f7c72517b0e0",
      "source_id": "SRC-PREMIS",
      "source_map_path": "source-map.json",
      "locator": "Event entity §§2.1–2.7",
      "claim": "Minimal provenance semantics."
    },
    {
      "identity": "FFmpeg official release page",
      "url": "https://ffmpeg.org/download.html",
      "version": "9.0.2 released 2026-09-18",
      "capture_path": "sources/S13-ffmpeg-download.html",
      "sha256": "e1b15edebbabe602905de2b10aa4784fa3b0ed6125582248b686ba3aab3c6442",
      "source_id": "SRC-FFMPEG-RELEASE",
      "source_map_path": "source-map.json",
      "locator": "9.0.2 release entry",
      "claim": "Version candidate."
    },
    {
      "identity": "FFprobe documentation",
      "url": "https://www.ffmpeg.org/ffprobe-all.html",
      "version": "Live documentation, not release-pinned",
      "capture_path": "sources/S12-ffprobe-8.1.html",
      "sha256": "6a862a570dd572bad0c4c453dc590fe254d3830675b02e7d64f7145dfc0dea46",
      "source_id": "SRC-FFPROBE",
      "source_map_path": "source-map.json",
      "locator": "Description/output sections",
      "claim": "Inspection candidate."
    },
    {
      "identity": "BWF MetaEdit official product page",
      "url": "https://mediaarea.net/BWFMetaEdit",
      "version": "26.08.1 observed at capture",
      "capture_path": "sources/S14-bwfmetaedit-product.html",
      "sha256": "7ec25815af64a1a912cbfb63fffe88de3610949bb768922e6d73c4a17c52ff70",
      "source_id": "SRC-BWF-METAEDIT",
      "source_map_path": "source-map.json",
      "locator": "Features",
      "claim": "Optional tool."
    },
    {
      "identity": "bagit.py immutable release source",
      "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py",
      "version": "v1.9.0 commit 861ddacb339d5b92659f0187a402f501d841abbe",
      "capture_path": "sources/S05-bagit-861ddacb339d5b92659f0187a402f501d841abbe.py",
      "sha256": "1c851d04fb8ebdc28e5ad2ffc484569575a1f3922ed83abccd61edd3ee26f80a",
      "source_id": "SRC-BAGIT-CODE",
      "source_map_path": "source-map.json",
      "locator": "Pinned code symbols",
      "claim": "Adoption conditions."
    },
    {
      "identity": "bagit-python issue 157 path encoding bug",
      "url": "https://github.com/LibraryOfCongress/bagit-python/issues/157",
      "version": "Issue opened 2022-02-15",
      "capture_path": "sources/S16-bagit-issue-157.html",
      "sha256": "06e5f79dae382d0c406d6310a0a110c2e9c6e852ab2e977ae11fd5aa2920b4f7",
      "source_id": "SRC-ISSUE-157",
      "source_map_path": "source-map.json",
      "locator": "Issue body",
      "claim": "Path encoding condition."
    }
  ]
}
```


<a id="finding-db060f6849b9306d7c5d098f0b3606ac2cdb4d01c878b9f61caca0dae7656759"></a>


### O5_CRITIC_PENDING

```json
{
  "id": "O5_CRITIC_PENDING",
  "summary": "Independent fresh same-family criticism has not been received in this research stage.",
  "disposition": "Pending; no critique or disposition fabricated.",
  "evidence": [
    "The brief requires an independent check of consequential sources, code/version applicability, plan comparison and the full user scope. The dispatch explicitly marks O5 pending a fresh critic."
  ],
  "conditions": {
    "handoff": "Critic should inspect this semantic set, source-map and captured sources against the admitted brief and frozen plan. No evaluator material is supplied or requested."
  },
  "options": [
    "Populate criticism and response only after a real critic handoff; preserve objections and disagreements."
  ],
  "optional_leads": [
    "Proposed critic checks: BagIt path/validation code, issue-fix-release chain, audio format applicability, every P1–P6 disposition and full O1–O6."
  ],
  "validation": [
    "No independent criticism occurred."
  ],
  "uncertainty": [
    "O5 remains open; this artifact does not claim final scientific agreement."
  ],
  "sources": [
    {
      "identity": "bagit.py immutable release source",
      "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py",
      "version": "v1.9.0 commit 861ddacb339d5b92659f0187a402f501d841abbe",
      "capture_path": "sources/S05-bagit-861ddacb339d5b92659f0187a402f501d841abbe.py",
      "sha256": "1c851d04fb8ebdc28e5ad2ffc484569575a1f3922ed83abccd61edd3ee26f80a",
      "source_id": "SRC-BAGIT-CODE",
      "source_map_path": "source-map.json",
      "locator": "Pinned code symbols",
      "claim": "Independent code check."
    },
    {
      "identity": "RFC 8493 BagIt 1.0",
      "url": "https://www.rfc-editor.org/rfc/rfc8493.txt",
      "version": "RFC 8493",
      "capture_path": "sources/S01-rfc8493.txt",
      "sha256": "4964147d2e6e16442d4a6dbfbe68178a8f33c3e791c06d68a8b33f51ad821537",
      "source_id": "SRC-RFC8493",
      "source_map_path": "source-map.json",
      "locator": "Package requirements",
      "claim": "Independent standard check."
    },
    {
      "identity": "Library of Congress Recommended Formats Statement Audio",
      "url": "https://www.loc.gov/preservation/resources/rfs/audio.html",
      "version": "Current annual HTML edition at capture",
      "capture_path": "sources/S02-loc-rfs-audio.html",
      "sha256": "2a419216eb2488959fa1329e2c0c60f411fa979521b58c8c8f2bae1c19b7ca76",
      "source_id": "SRC-LOC-RFS-AUDIO",
      "source_map_path": "source-map.json",
      "locator": "Format scope",
      "claim": "Independent applicability check."
    }
  ]
}
```


<a id="finding-dd2fd434b7641607a71fb8ba03bd837ddc5c13a426525e66fe06dfaee81bfbe1"></a>


### P6_ACCEPTANCE

```json
{
  "id": "P6_ACCEPTANCE",
  "summary": "P6 retains every requested synthetic case and adds path, interruption, platform and privacy conditions.",
  "disposition": "Proposed acceptance only; not executed.",
  "evidence": [
    "Frozen plan requests interrupted copy, malformed metadata, unusual channel layout, encoding conversion and package fixity. The replacement retains all five."
  ],
  "conditions": {
    "plan_locator": "Frozen plan P6.",
    "data": "Synthetic content only; no personal interviews."
  },
  "options": [
    "Use selected exact dependency builds once product choices are locked."
  ],
  "optional_leads": [
    "Keep each check's inputs, outputs, warnings and outcome recorded."
  ],
  "validation": [
    "Interrupt at each copy stage; malformed RIFF/BWF, FLAC and ID3; mono/stereo/multichannel/unknown layout; explicit conversion settings and cancellation; missing/altered/extra/truncated/renamed files and tag manifests; percent/CR/LF/Unicode/collision/long/reserved/symlink/shared-prefix paths; read-only source/low space/100 items; Windows/Linux/disconnected network/no egress."
  ],
  "uncertainty": [
    "No product test was performed; no performance or preservation-quality conclusion is offered."
  ],
  "sources": [
    {
      "identity": "RFC 8493 BagIt 1.0",
      "url": "https://www.rfc-editor.org/rfc/rfc8493.txt",
      "version": "RFC 8493",
      "capture_path": "sources/S01-rfc8493.txt",
      "sha256": "4964147d2e6e16442d4a6dbfbe68178a8f33c3e791c06d68a8b33f51ad821537",
      "source_id": "SRC-RFC8493",
      "source_map_path": "source-map.json",
      "locator": "§§2.1.3 and 5.1",
      "claim": "Path/fixity cases."
    },
    {
      "identity": "bagit-python immutable release tests",
      "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/test.py",
      "version": "v1.9.0 same commit",
      "capture_path": "sources/S06-bagit-test-861ddacb339d5b92659f0187a402f501d841abbe.py",
      "sha256": "751f20546c671b9128e9577d077c39574586d7c9be42921f4cd3ab86a5e0ef6a",
      "source_id": "SRC-BAGIT-TESTS",
      "source_map_path": "source-map.json",
      "locator": "Unsafe path test definitions",
      "claim": "Existing test ideas, not run."
    },
    {
      "identity": "Library of Congress literary audio archives workflow case study",
      "url": "https://blogs.loc.gov/thesignal/files/2022/05/JDMM_10_1_JDMM0002_Darby_et_al.pdf?loclr=blogpoe",
      "version": "2022 institutional case study",
      "capture_path": "sources/S15-loc-literary-audio-workflow-2022.pdf",
      "sha256": "646f2cb4e9ffa47668fcf436d89d84317bae2780e7221fdb4bda9ba89a77d42b",
      "source_id": "SRC-LOC-ORAL-HISTORY",
      "source_map_path": "source-map.json",
      "locator": "Test ingest workflow",
      "claim": "Review-before-ingest analogy."
    }
  ]
}
```


<a id="finding-6ecbcfd2174eab4f3fff9b056d5074eee8e36f6d50be24089fa5d5ab02eec52b"></a>


### EXECUTION_RECORD

```json
{
  "id": "EXECUTION_RECORD",
  "summary": "Research operations are distinct from proposed product validation and from provider cost components.",
  "disposition": "Executed: admitted-file reading, source retrieval/hash, static source review, native Goal activation and activation notice. Renderer and preservation review result are in preservation_check.md. No application test executed.",
  "evidence": [
    "Open search began from the oral-history ingest need before decision comparison. Sixteen public primary source byte streams were captured; SHA-256 was computed locally. Captures are source data only and no downloaded code was executed.",
    "No repo/canonical Plan changes, WorkNodes, nested delegation, other arms, source-cache method, external runner, installer, third-party message, issue or PR mutation occurred."
  ],
  "conditions": {
    "earliest_cold_preparation_utc": "2026-10-07T20:47:52.249474Z",
    "stage_deadline_utc": "2026-10-07T21:12:52.249474Z",
    "whole_arm_deadline_utc": "2026-10-07T21:47:52.249474Z",
    "role_cap_seconds": 1500,
    "whole_arm_cap_seconds": 3600
  },
  "options": [
    "Input/cache/generated/reasoning and billing metrics are all unknown null; see component_usage below.",
    "Aggregate native Goal counters are a separate unsummed snapshot."
  ],
  "optional_leads": [
    "First useful finding: FFprobe machine-readable output candidate, observed by 2026-10-07T20:53:03Z.",
    "Source capture time windows, URLs, byte sizes and hashes: source-map.json.",
    "Generic preparation lower bound 454.056 seconds and qualification lower bound 0.316 seconds are separately retained; qualification wall time and billing are unknown, never free time."
  ],
  "validation": [
    "App tests/build/conversion/quality/performance checks were not executed."
  ],
  "uncertainty": [
    "Provider billing and per-request token categories were not exposed; unknown is not zero."
  ],
  "sources": [
    {
      "identity": "FFprobe documentation",
      "url": "https://www.ffmpeg.org/ffprobe-all.html",
      "version": "Live documentation, not release-pinned",
      "capture_path": "sources/S12-ffprobe-8.1.html",
      "sha256": "6a862a570dd572bad0c4c453dc590fe254d3830675b02e7d64f7145dfc0dea46",
      "source_id": "SRC-FFPROBE",
      "source_map_path": "source-map.json",
      "locator": "Tool description",
      "claim": "First useful finding."
    },
    {
      "identity": "bagit.py immutable release source",
      "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py",
      "version": "v1.9.0 commit 861ddacb339d5b92659f0187a402f501d841abbe",
      "capture_path": "sources/S05-bagit-861ddacb339d5b92659f0187a402f501d841abbe.py",
      "sha256": "1c851d04fb8ebdc28e5ad2ffc484569575a1f3922ed83abccd61edd3ee26f80a",
      "source_id": "SRC-BAGIT-CODE",
      "source_map_path": "source-map.json",
      "locator": "Static code inspection",
      "claim": "Research-only operation."
    }
  ]
}
```


## Exact authored input

The fenced payload retains the complete UTF-8 input text, including unknown fields. The separator newline before the closing fence is renderer framing.

```json
{
  "artifact_type": "Candidate-authored authoritative M14 semantic finding set",
  "case_id": "I-METHOD-04",
  "candidate": "treatment/research-v2",
  "status": "DIAGNOSTIC_UNQUALIFIED. Research and proposed change are complete; O5 fresh critic pending. No quality or speed claim.",
  "renderer_contract": "This JSON is the sole candidate-authored semantic input. The qualified generic renderer projects every record and field without ranking, shortening or adding science. Renderer result and preservation review are recorded separately in preservation_check.md.",
  "source_boundary": "Only admitted I-METHOD-04 input-map, brief, plan and INPUTS.md plus public primary sources selected for this research. Input-map predecessors is empty. No other arms/cases, campaign packet/state/evaluator data, prior findings, source cache or downloaded code execution.",
  "input_identities": {
    "input_map": {
      "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/I-METHOD-04/treatment/research-v2/input-map.json",
      "sha256": "0e3fd8651e2db5f6fb5db31c7876a08710d8fa39c98de37e4f0492cbb1ac78c6"
    },
    "brief": {
      "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/I-METHOD-04/brief.md",
      "sha256": "c609c2ea956f269df5fbab3694b7a9425f72f24b65279e12aab3b5c1d727a1ab"
    },
    "plan": {
      "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/I-METHOD-04/plan.md",
      "sha256": "c3da0fde53189778a3685ff4dae7f8c9cca2bd3a5d5a0f8614bc666c21a01a59"
    },
    "inputs": {
      "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/I-METHOD-04/INPUTS.md",
      "sha256": "c18f6a3d3093131e7a9e7f9fc7e9c5dc81cdca766a0ac4efa539781df04a6142"
    }
  },
  "first_useful_finding": {
    "text": "Initial open discovery surfaced FFprobe as a read-only inspection candidate with machine-readable format and stream sections.",
    "source_id": "SRC-FFPROBE",
    "observed_at_or_before_utc": "2026-10-07T20:53:03Z",
    "time_precision": "Search completed before this host clock read; exact request start was not captured."
  },
  "obligation_coverage": {
    "O1": "O1_OPEN_DISCOVERY and source-bound findings.",
    "O2": "O2_PINNED_CODE.",
    "O3": "O3_HISTORY.",
    "O4": "O4_P1_TO_P6_COMPARISON.",
    "O5": "O5_CRITIC_PENDING.",
    "O6": "FULL_PLAN_REPLACEMENT."
  },
  "operations_and_costs": {
    "native_goal_identity": "01a11822-1e5d-79b2-9ff0-90c6ff9f601b",
    "native_goal_active_snapshot": {
      "observed_at_utc": "2026-10-07T21:00:54Z",
      "tokensUsed": 175446,
      "timeUsedSeconds": 484,
      "status": "active",
      "note": "Actual native Goal tool aggregate; unsummed and separate from provider component metrics."
    },
    "parent_notice": "Exactly one activation-only auto message sent using er10-I-METHOD-04-treatment-research-v2-active.",
    "public_capture_count": 16,
    "captured_and_hashed": "See source-map.json for URL, version/date, bounded retrieval time, bytes and local SHA-256 for all public source bytes.",
    "preparation_lower_bound_seconds": 454.056,
    "qualification_lower_bound_seconds": 0.316,
    "qualification_wall_seconds": null,
    "qualification_billing": null,
    "deadline": {
      "cold_start_utc": "2026-10-07T20:47:52.249474Z",
      "research_stage_deadline_utc": "2026-10-07T21:12:52.249474Z",
      "whole_arm_deadline_utc": "2026-10-07T21:47:52.249474Z",
      "research_cap_seconds": 1500,
      "whole_arm_cap_seconds": 3600,
      "critic_seconds_preserved": 900,
      "final_seconds_preserved": 1200
    },
    "component_usage": {
      "input_tokens": null,
      "cache_read_tokens": null,
      "cache_creation_tokens": null,
      "generated_tokens": null,
      "reasoning_tokens": null,
      "billed_amount": null,
      "billed_currency": null,
      "meaning": "Provider component usage and billing were unavailable; null means unknown, not zero."
    },
    "claim_limit": "No app build, app test, audio conversion, performance validation, quality result or shipping claim. DIAGNOSTIC_UNQUALIFIED."
  },
  "findings": [
    {
      "id": "O1_OPEN_DISCOVERY",
      "summary": "Need-led public discovery supports a staged, reviewable ingest workflow with separate preservation, inspection and access-copy decisions.",
      "disposition": "Accepted with scope limits; sources are analogies and technical evidence, not a universal recipe.",
      "evidence": [
        "A Library of Congress literary audio workflow documents a test ingest that creates a review CSV before formal ingest and scripted FFmpeg MP3 access copies from WAV masters. This supports review-before-commit and derivative provenance, but not importing its settings or storage topology.",
        "The LoC audio statement prefers native resolution and uncompressed media-independent audio and lists BWF WAVE with embedded metadata as preferred in that statement's scope. It does not require converting oral-history intake MP3 or FLAC files to WAVE.",
        "FFprobe documents structured machine-readable format and stream output. FFmpeg documents metadata mapping and override controls. BWF MetaEdit is a specialized BWF tool that can validate and edit embedded metadata."
      ],
      "conditions": {
        "condition": "Begin from oral-history desk need. Do not treat release-format recommendations as a recipe for born-digital interviews or automatically rewrite metadata."
      },
      "options": [
        "FFprobe 9.0.2 candidate for inspection; validate against synthetic formats and malformed metadata.",
        "Optional BWF MetaEdit for BWF-specific inspection only.",
        "Reviewable batch CSV can be built into UI or exported."
      ],
      "optional_leads": [
        "Keep technical metadata, source tags, archivist note and correction as separate values.",
        "Use BWF workflow guidance only when source format and collection policy make it applicable."
      ],
      "validation": [
        "Proposed: compare parser results on synthetic valid/malformed WAV/BWF, FLAC and MP3; no audio file was decoded in this research."
      ],
      "uncertainty": [
        "FFmpeg/FFprobe docs are live and not release-pinned. A release binary must be verified at build time.",
        "The LoC case study is institutional practice, not a product build or performance result."
      ],
      "sources": [
        {
          "identity": "Library of Congress literary audio archives workflow case study",
          "url": "https://blogs.loc.gov/thesignal/files/2022/05/JDMM_10_1_JDMM0002_Darby_et_al.pdf?loclr=blogpoe",
          "version": "2022 institutional case study",
          "capture_path": "sources/S15-loc-literary-audio-workflow-2022.pdf",
          "sha256": "646f2cb4e9ffa47668fcf436d89d84317bae2780e7221fdb4bda9ba89a77d42b",
          "source_id": "SRC-LOC-ORAL-HISTORY",
          "source_map_path": "source-map.json",
          "locator": "PDF discussion of ingest review CSV and MP3 access derivatives",
          "claim": "Institutional oral-history analogy."
        },
        {
          "identity": "Library of Congress Recommended Formats Statement Audio",
          "url": "https://www.loc.gov/preservation/resources/rfs/audio.html",
          "version": "Current annual HTML edition at capture",
          "capture_path": "sources/S02-loc-rfs-audio.html",
          "sha256": "2a419216eb2488959fa1329e2c0c60f411fa979521b58c8c8f2bae1c19b7ca76",
          "source_id": "SRC-LOC-RFS-AUDIO",
          "source_map_path": "source-map.json",
          "locator": "IV.ii.A and IV.ii.C",
          "claim": "Format preference scope."
        },
        {
          "identity": "Library of Congress FDD000357 BWF Version 2",
          "url": "https://www.loc.gov/preservation/digital/formats/fdd/fdd000357.shtml",
          "version": "FDD000357 current page at capture",
          "capture_path": "sources/S03-loc-bwf-v2.html",
          "sha256": "0542ae7a3208323b37f606ff9622e4063ab4b69c6a778711f6b729b9a31e575c",
          "source_id": "SRC-LOC-BWF-V2",
          "source_map_path": "source-map.json",
          "locator": "Local use and sustainability",
          "claim": "BWF/LPCM practice."
        },
        {
          "identity": "FFprobe documentation",
          "url": "https://www.ffmpeg.org/ffprobe-all.html",
          "version": "Live documentation, not release-pinned",
          "capture_path": "sources/S12-ffprobe-8.1.html",
          "sha256": "6a862a570dd572bad0c4c453dc590fe254d3830675b02e7d64f7145dfc0dea46",
          "source_id": "SRC-FFPROBE",
          "source_map_path": "source-map.json",
          "locator": "Description and output writers",
          "claim": "Read-only inspection candidate."
        },
        {
          "identity": "FFmpeg CLI documentation",
          "url": "https://www.ffmpeg.org/ffmpeg.html",
          "version": "Live documentation, not release-pinned",
          "capture_path": "sources/S11-ffmpeg-8.1-cli.html",
          "sha256": "e04c69cd08537b9b9d8d16ecaab9f56d938455e54ef42c37a2019053df8495cb",
          "source_id": "SRC-FFMPEG-DOCS",
          "source_map_path": "source-map.json",
          "locator": "-map_metadata and -metadata sections",
          "claim": "Mapping behavior."
        },
        {
          "identity": "BWF MetaEdit official product page",
          "url": "https://mediaarea.net/BWFMetaEdit",
          "version": "26.08.1 observed at capture",
          "capture_path": "sources/S14-bwfmetaedit-product.html",
          "sha256": "7ec25815af64a1a912cbfb63fffe88de3610949bb768922e6d73c4a17c52ff70",
          "source_id": "SRC-BWF-METAEDIT",
          "source_map_path": "source-map.json",
          "locator": "Features",
          "claim": "BWF-specific optional product."
        }
      ]
    },
    {
      "id": "O2_PINNED_CODE",
      "summary": "bagit-python v1.9.0 source at commit 861ddacb339d5b92659f0187a402f501d841abbe was inspected as the consequential package implementation candidate.",
      "disposition": "Versioned code evidence accepted; runtime adoption remains conditional.",
      "evidence": [
        "make_bag() defaults to SHA-256 and SHA-512, then moves input directory contents into a data folder in place before writing bag metadata/manifests. Never run it on the removable source tree; stage a copy first.",
        "Bag.validate() defaults to complete fixity verification. fast=True returns after Payload-Oxum file-count and byte-count checks and does not recalculate manifest checksums.",
        "Bag._load_manifests() and Bag.fetch_entries() call _path_is_dangerous() when interpreting manifest and fetch paths. RFC 8493 requires path containment and percent-encoding rules.",
        "_encode_filename() replaces CR and LF but not literal percent. Issue #157 describes this BagIt 1.0 interoperability problem; exact v1.9.0 tests do not include percent-path coverage.",
        "Code-review inference: _path_is_dangerous() uses os.path.commonprefix() on normalized strings, which is not a path-segment containment proof. Treat as a test/adoption concern, not a confirmed exploit."
      ],
      "conditions": {
        "version": "Exact code and tests captured from release commit 861ddacb339d5b92659f0187a402f501d841abbe.",
        "scope": "bagit-python is a reference/optional candidate; BagIt 1.0 is the proposed package standard, not a mandatory Python runtime."
      },
      "options": [
        "Use v1.9.0 only on completed staging copies and only with strict path conformance checks.",
        "Consider implementing BagIt 1.0 natively in the eventual app language, or use the pinned package as an interoperability reference."
      ],
      "optional_leads": [
        "Do not rely on fast validation for fixity.",
        "Do not rely on _path_is_dangerous() as the application's sole boundary check without adversarial cross-platform tests."
      ],
      "validation": [
        "Proposed: create/reopen synthetic bags with SHA-512/SHA-256, changed/missing/extra files, percent/CR/LF names and paths outside the package.",
        "Executed: static reading of captured source/test files only; no downloaded code or tests executed."
      ],
      "uncertainty": [
        "The static commonprefix review is a code-level concern, not a proven exploit.",
        "Release page marked v1.9.0 as latest at capture while master had later commits; master was not substituted."
      ],
      "sources": [
        {
          "identity": "bagit.py immutable release source",
          "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py",
          "version": "v1.9.0 commit 861ddacb339d5b92659f0187a402f501d841abbe",
          "capture_path": "sources/S05-bagit-861ddacb339d5b92659f0187a402f501d841abbe.py",
          "sha256": "1c851d04fb8ebdc28e5ad2ffc484569575a1f3922ed83abccd61edd3ee26f80a",
          "source_id": "SRC-BAGIT-CODE",
          "source_map_path": "source-map.json",
          "locator": "make_bag() lines 141–260; validate() 586–616; fetch_entries() 545–574; _load_manifests() 620–745; _path_is_dangerous() 925–941; _encode_filename() 1405–1414",
          "claim": "Pinned definitions and callers."
        },
        {
          "identity": "bagit-python immutable release tests",
          "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/test.py",
          "version": "v1.9.0 same commit",
          "capture_path": "sources/S06-bagit-test-861ddacb339d5b92659f0187a402f501d841abbe.py",
          "sha256": "751f20546c671b9128e9577d077c39574586d7c9be42921f4cd3ab86a5e0ef6a",
          "source_id": "SRC-BAGIT-TESTS",
          "source_map_path": "source-map.json",
          "locator": "test_unsafe_directory_entries_raise_error() and test_fetch_unsafe_payloads()",
          "claim": "Inspected test coverage; not run."
        },
        {
          "identity": "RFC 8493 BagIt 1.0",
          "url": "https://www.rfc-editor.org/rfc/rfc8493.txt",
          "version": "RFC 8493",
          "capture_path": "sources/S01-rfc8493.txt",
          "sha256": "4964147d2e6e16442d4a6dbfbe68178a8f33c3e791c06d68a8b33f51ad821537",
          "source_id": "SRC-RFC8493",
          "source_map_path": "source-map.json",
          "locator": "§§2.1.3, 2.4, 3, 5.1",
          "claim": "Manifest, algorithms, validity and safe paths."
        },
        {
          "identity": "bagit-python issue 157 path encoding bug",
          "url": "https://github.com/LibraryOfCongress/bagit-python/issues/157",
          "version": "Issue opened 2022-02-15",
          "capture_path": "sources/S16-bagit-issue-157.html",
          "sha256": "06e5f79dae382d0c406d6310a0a110c2e9c6e852ab2e977ae11fd5aa2920b4f7",
          "source_id": "SRC-ISSUE-157",
          "source_map_path": "source-map.json",
          "locator": "Issue body",
          "claim": "Path encoding risk."
        }
      ]
    },
    {
      "id": "O3_HISTORY",
      "summary": "Issue #152 has a traceable upstream fix in a released version; separate issue #157 remains relevant to the exact release code.",
      "disposition": "Issue/fix/release applicability supported; no automated regression test for the exact tilde case was found.",
      "evidence": [
        "Issue #152 reports a Linux/Python false unsafe-path rejection for a name containing ~$_- because os.path.expandvars() expands it. The issue supplies a reproducible example.",
        "PR #184 removes the expandvars check from _path_is_dangerous(); merge commit 753679c9b342660d038f65a8dc4f755ab95d679b closes #152. The v1.9.0 release notes list #184 and the exact tagged source no longer calls expandvars.",
        "The merge patch changes one source file with two deletions and no test addition. The release test file has generic unsafe path checks, but not the exact issue #152 name. Thus the issue reproduction and code delta are regression evidence; a committed automated regression test is not established.",
        "At the same v1.9.0 tag, _encode_filename() handles CR/LF but not literal percent; RFC 8493 requires encoding percent too. This is a separate limitation, not a consequence of #152."
      ],
      "conditions": {
        "release": "v1.9.0 commit 861ddacb339d5b92659f0187a402f501d841abbe contains the merged change.",
        "claim_limit": "No inference that any downstream product shipped this code."
      },
      "options": [
        "Add exact issue #152 filename test on Linux and Windows.",
        "Add literal percent, CR/LF/CRLF path tests including names that resemble encoded paths."
      ],
      "optional_leads": [
        "Dispositions: #152 corrected false rejection; #157 path interoperability remains open in the examined release code."
      ],
      "validation": [
        "Proposed only: regression suite on the selected exact build; no upstream or product test was run here."
      ],
      "uncertainty": [
        "The PR does not add a test, and a source release note cannot prove downstream use."
      ],
      "sources": [
        {
          "identity": "bagit-python issue 152 tilde filename false error",
          "url": "https://github.com/LibraryOfCongress/bagit-python/issues/152",
          "version": "Issue opened 2021-04-23",
          "capture_path": "sources/S07-issue-152.html",
          "sha256": "4fa807637bcac9272cb97dd2fd1f2b3a18c9635441edfa35cb6861872312ceed",
          "source_id": "SRC-ISSUE-152",
          "source_map_path": "source-map.json",
          "locator": "Issue description and reproduction",
          "claim": "Real regression report."
        },
        {
          "identity": "bagit-python PR 184 remove expandvars",
          "url": "https://github.com/LibraryOfCongress/bagit-python/pull/184",
          "version": "Merged 2025-06-13; closes issue 152",
          "capture_path": "sources/S08-pr-184.html",
          "sha256": "d30fcb139b25d0205337e1e57a7152f595a533479a4d657fdf2f956d7ea89ec0",
          "source_id": "SRC-PR-184",
          "source_map_path": "source-map.json",
          "locator": "Merged PR conversation",
          "claim": "Reviewed fix."
        },
        {
          "identity": "bagit-python merge commit 753679",
          "url": "https://github.com/LibraryOfCongress/bagit-python/commit/753679c9b342660d038f65a8dc4f755ab95d679b.patch",
          "version": "753679c9b342660d038f65a8dc4f755ab95d679b",
          "capture_path": "sources/S09-fix-753679c9b342660d038f65a8dc4f755ab95d679b.patch",
          "sha256": "c423e4f9b7a12fd07bf0b8296dbf0be89b1940c03702f355522320e2486779d7",
          "source_id": "SRC-COMMIT-753679",
          "source_map_path": "source-map.json",
          "locator": "Commit diff",
          "claim": "Exact source change."
        },
        {
          "identity": "LibraryOfCongress bagit-python release",
          "url": "https://github.com/LibraryOfCongress/bagit-python/releases/tag/v1.9.0",
          "version": "v1.9.0, commit 861ddacb339d5b92659f0187a402f501d841abbe",
          "capture_path": "sources/S04-bagit-v1.9.0-release.html",
          "sha256": "5da3ece07de54bebb17417cfa7ab83ebf6ff3343f154192aad9c2a9302056680",
          "source_id": "SRC-BAGIT-RELEASE",
          "source_map_path": "source-map.json",
          "locator": "v1.9.0 release notes",
          "claim": "Release applicability."
        },
        {
          "identity": "bagit.py immutable release source",
          "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py",
          "version": "v1.9.0 commit 861ddacb339d5b92659f0187a402f501d841abbe",
          "capture_path": "sources/S05-bagit-861ddacb339d5b92659f0187a402f501d841abbe.py",
          "sha256": "1c851d04fb8ebdc28e5ad2ffc484569575a1f3922ed83abccd61edd3ee26f80a",
          "source_id": "SRC-BAGIT-CODE",
          "source_map_path": "source-map.json",
          "locator": "_path_is_dangerous() and _encode_filename()",
          "claim": "Release code behavior."
        },
        {
          "identity": "bagit-python immutable release tests",
          "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/test.py",
          "version": "v1.9.0 same commit",
          "capture_path": "sources/S06-bagit-test-861ddacb339d5b92659f0187a402f501d841abbe.py",
          "sha256": "751f20546c671b9128e9577d077c39574586d7c9be42921f4cd3ab86a5e0ef6a",
          "source_id": "SRC-BAGIT-TESTS",
          "source_map_path": "source-map.json",
          "locator": "Unsafe-path tests",
          "claim": "Regression coverage limit."
        },
        {
          "identity": "bagit-python issue 157 path encoding bug",
          "url": "https://github.com/LibraryOfCongress/bagit-python/issues/157",
          "version": "Issue opened 2022-02-15",
          "capture_path": "sources/S16-bagit-issue-157.html",
          "sha256": "06e5f79dae382d0c406d6310a0a110c2e9c6e852ab2e977ae11fd5aa2920b4f7",
          "source_id": "SRC-ISSUE-157",
          "source_map_path": "source-map.json",
          "locator": "Issue description",
          "claim": "Separate path-encoding concern."
        },
        {
          "identity": "RFC 8493 BagIt 1.0",
          "url": "https://www.rfc-editor.org/rfc/rfc8493.txt",
          "version": "RFC 8493",
          "capture_path": "sources/S01-rfc8493.txt",
          "sha256": "4964147d2e6e16442d4a6dbfbe68178a8f33c3e791c06d68a8b33f51ad821537",
          "source_id": "SRC-RFC8493",
          "source_map_path": "source-map.json",
          "locator": "§2.1.3",
          "claim": "Normative encoding rule."
        }
      ]
    },
    {
      "id": "O4_P1_TO_P6_COMPARISON",
      "summary": "Every frozen P1–P6 decision is compared below with an explicit disposition.",
      "disposition": "Complete plan comparison; all decisions remain within the frozen scope.",
      "evidence": [
        "P1 Batch capture — amend. Retain WAV/BWF, FLAC and MP3, up to 100, original names/relative folders, copy-only and source nonmutation. Add preflight, stable per-file copy/verify/interruption states, streaming SHA-512/SHA-256 and independent destination reread. Rationale: make copy integrity and partial failure visible; bagit-python make_bag() is in-place.",
        "P2 Inspection — amend. Retain duration, channels, encoding, embedded tags, notes, waveform/listen view and correction separation. Add exact parser/build identity, parser warnings, immutable source-tag snapshot, no writes during inspection and explicit unknown channel layouts.",
        "P3 Derivatives — amend. Retain opt-in request, settings preview, original preservation and visible failure. Add per-file explicit container/codec/sample rate/bit depth/channel mapping/metadata mapping, temp output, post-output probe and tool/build/settings provenance; no default conversion recipe.",
        "P4 Packaging — amend. Retain originals, derivative references, provenance, fixity, tool version and reopen checks. Propose BagIt 1.0, data/originals and data/derivatives paths, sidecar provenance, complete SHA-512/SHA-256 manifests and full fixity on reopen; no fetch.txt.",
        "P5 Components/environment — retain undecided status, amend with shortlist and release gates. Keep offline Windows/Linux, no upload and no embedded-metadata writes for display. Candidates: FFprobe/FFmpeg 9.0.2, BagIt 1.0 with conditional bagit-python 1.9.0/native alternative, optional BWF MetaEdit 26.08.1, playback/UI prototype.",
        "P6 Acceptance — amend. Retain interrupted copy, malformed metadata, unusual channels, conversion and package fixity categories; expand to path/collision/partial-file, output verification, tag-manifest, 100-file, disconnected network, Windows/Linux and no-egress synthetic cases."
      ],
      "conditions": {
        "already_covered": "The original plan already covers the six headline areas and the constraints repeated in the replacement plan; no unrelated whole-project coverage is inferred.",
        "cross_reference_limit": "The supplied comparison slice contains only this six-part plan; no broader system guarantees are inferred."
      },
      "options": [
        "Product choices remain: conversion formats/recipes, path collision resolution, exact metadata fields, package serializer implementation, full PREMIS vs subset, playback backend and optional BWF tool."
      ],
      "optional_leads": [
        "Reject converting all sources to BWF/WAV based only on LoC format preferences; reject treating parser success as preservation validation; reject BagIt fast size/count mode as fixity; reject BWF data-chunk MD5 as whole-file fixity; reject automatic metadata correction and remote fetch."
      ],
      "validation": [
        "Proposed checks are listed under P6_ACCEPTANCE and in FULL_PLAN_REPLACEMENT; none of the product checks ran."
      ],
      "uncertainty": [
        "No source resolves local rights/consent/retention/access policy or declares output quality thresholds."
      ],
      "sources": [
        {
          "identity": "RFC 8493 BagIt 1.0",
          "url": "https://www.rfc-editor.org/rfc/rfc8493.txt",
          "version": "RFC 8493",
          "capture_path": "sources/S01-rfc8493.txt",
          "sha256": "4964147d2e6e16442d4a6dbfbe68178a8f33c3e791c06d68a8b33f51ad821537",
          "source_id": "SRC-RFC8493",
          "source_map_path": "source-map.json",
          "locator": "Package structure, manifests and security",
          "claim": "Supports package amendments."
        },
        {
          "identity": "Library of Congress Recommended Formats Statement Audio",
          "url": "https://www.loc.gov/preservation/resources/rfs/audio.html",
          "version": "Current annual HTML edition at capture",
          "capture_path": "sources/S02-loc-rfs-audio.html",
          "sha256": "2a419216eb2488959fa1329e2c0c60f411fa979521b58c8c8f2bae1c19b7ca76",
          "source_id": "SRC-LOC-RFS-AUDIO",
          "source_map_path": "source-map.json",
          "locator": "Digital audio preferences",
          "claim": "Limited source-format evidence."
        },
        {
          "identity": "Library of Congress literary audio archives workflow case study",
          "url": "https://blogs.loc.gov/thesignal/files/2022/05/JDMM_10_1_JDMM0002_Darby_et_al.pdf?loclr=blogpoe",
          "version": "2022 institutional case study",
          "capture_path": "sources/S15-loc-literary-audio-workflow-2022.pdf",
          "sha256": "646f2cb4e9ffa47668fcf436d89d84317bae2780e7221fdb4bda9ba89a77d42b",
          "source_id": "SRC-LOC-ORAL-HISTORY",
          "source_map_path": "source-map.json",
          "locator": "Test-ingest/derivative workflow",
          "claim": "Analogue for review and access copy."
        },
        {
          "identity": "FFprobe documentation",
          "url": "https://www.ffmpeg.org/ffprobe-all.html",
          "version": "Live documentation, not release-pinned",
          "capture_path": "sources/S12-ffprobe-8.1.html",
          "sha256": "6a862a570dd572bad0c4c453dc590fe254d3830675b02e7d64f7145dfc0dea46",
          "source_id": "SRC-FFPROBE",
          "source_map_path": "source-map.json",
          "locator": "Tool description",
          "claim": "Inspection option."
        },
        {
          "identity": "FFmpeg CLI documentation",
          "url": "https://www.ffmpeg.org/ffmpeg.html",
          "version": "Live documentation, not release-pinned",
          "capture_path": "sources/S11-ffmpeg-8.1-cli.html",
          "sha256": "e04c69cd08537b9b9d8d16ecaab9f56d938455e54ef42c37a2019053df8495cb",
          "source_id": "SRC-FFMPEG-DOCS",
          "source_map_path": "source-map.json",
          "locator": "Metadata controls",
          "claim": "Derivative behavior."
        },
        {
          "identity": "bagit.py immutable release source",
          "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py",
          "version": "v1.9.0 commit 861ddacb339d5b92659f0187a402f501d841abbe",
          "capture_path": "sources/S05-bagit-861ddacb339d5b92659f0187a402f501d841abbe.py",
          "sha256": "1c851d04fb8ebdc28e5ad2ffc484569575a1f3922ed83abccd61edd3ee26f80a",
          "source_id": "SRC-BAGIT-CODE",
          "source_map_path": "source-map.json",
          "locator": "make_bag()/validate()",
          "claim": "Implementation cautions."
        }
      ]
    },
    {
      "id": "FULL_PLAN_REPLACEMENT",
      "summary": "Complete proposed replacement for the frozen sandbox plan: local ingest, inspection, derivatives, package, component choices and acceptance.",
      "disposition": "Proposed complete replacement; not built or validated; O5 fresh criticism remains pending.",
      "evidence": [
        "The replacement keeps the exact P1–P6 scope and user constraints while adding reproducible copy, transform and package records. The content is candidate-authored and the renderer does not adjudicate it."
      ],
      "conditions": {
        "scope": [
          "One archivist and up to 100 selected WAV/BWF, FLAC and MP3 files.",
          "No speech transcription, public publishing, automated rights decision or legal advice.",
          "Offline Windows or Linux; no interview audio/metadata upload; source media remains unchanged."
        ],
        "P1": "Preflight selected files for read access, space, duplicate/case/Unicode collisions, symlink/reparse points and unsafe paths. Show the mapping. Copy to a new local accession staging directory. Hash while reading, re-read the destination and compare SHA-512 and SHA-256 before marking verified. Preserve received names/relative paths; stop for archivist choice if a target filesystem cannot represent a name; record any reversible path mapping. Keep discovered/copying/verified/warning/failed/interrupted/resumed states. Never finalize a partial copy. Resume only after source identity and copied bytes are rechecked; do not delete source.",
        "P2": "Show duration, channel count/layout, encoding, embedded metadata and archivist notes. Evaluate a pinned FFprobe 9.0.2 read-only adapter; record parser version/build and warnings. Keep original embedded fields as an immutable observed snapshot; store corrections separately with author/time. Show errors and unknown channel layouts; no guessing or write function during inspection. Decode waveform on demand and show channels separately.",
        "P3": "Only create a derivative on explicit per-file request. Preview container/codec, sample rate, sample format/bit depth, channel map, metadata map and any resampling/filter. FFmpeg 9.0.2 is a candidate only after build, codec and license review on both platforms. No default lossy recipe, normalization, resampling or downmix. Write temporary output; inspect settings after exit; finalize only if successful. Failure/interruption remains visible with partial output quarantined and original unchanged. Record tool/build, exact settings, source/output identities and outcome.",
        "P4": "Use BagIt 1.0 folder model. Include bagit.txt, bag-info.txt, data/originals/<received-path>, data/derivatives/<stable-id>/<chosen-name>, data/records/ingest.json, SHA-512 and SHA-256 payload manifests and tag manifests. Every payload file including notes/provenance is fixed in manifests; tag files are covered by tag manifests. No fetch.txt or remote payload. Record source digest, copy digest, processing events, tool/settings, derivative relationship and outcome. A digest detects later change against its baseline but proves neither authenticity nor original correctness. Finalize only after complete copy and full fixity. Reopen performs full fixity and reports missing/changed/unexpected; size/count only is not fixity.",
        "P5": "Retain components as undecided but shortlist FFprobe/FFmpeg 9.0.2, BagIt 1.0 and a PREMIS-inspired event record. Compare a native BagIt serializer to bagit-python 1.9.0 only after resolving path encoding and safe-path tests, and only on a staging copy. BWF MetaEdit 26.08.1 is an optional BWF-only QA/export lead, never a writer to originals. Playback backend and UI remain a cross-platform prototype choice. Lock exact binary hashes, build flags, enabled codecs, licenses and dependencies before shipping.",
        "P6": "Propose synthetic checks for interrupted copy/unplug/resume/source change; malformed/contradictory RIFF/BWF, FLAC and ID3 metadata; mono/stereo/multichannel/discrete/unknown layouts; selected conversion parameters and crash/cancel behavior; package tampering by missing/changed/extra/renamed/truncated payload and altered tag files. Add percent/CR/LF path encoding, Unicode/case collisions, long and Windows-reserved paths, symlink/reparse/shared-prefix containment, read-only media, low space, 100 files, disconnected network and no-egress cases. Mark all as proposed until the implementation runs them."
      },
      "options": [
        "Product choices not determined by evidence: lossless/lossy outputs, target settings, per-file/batch operations, path collision policy, exact metadata whitelist, full PREMIS or documented subset, native vs bundled package serializer, playback API and whether BWF MetaEdit fits the workflow."
      ],
      "optional_leads": [
        "Optional review CSV, BWF-specific QA tool, second digest manifest, full PREMIS integration if required, replaceable parser/playback adapters."
      ],
      "validation": [
        "Synthetic P6 checks above are proposals only. No app build, audio test, conversion, performance test or quality claim."
      ],
      "uncertainty": [
        "Format statements do not mandate converting born-digital oral histories. Interviews may need institutional access/retention decisions beyond this technical scope."
      ],
      "sources": [
        {
          "identity": "RFC 8493 BagIt 1.0",
          "url": "https://www.rfc-editor.org/rfc/rfc8493.txt",
          "version": "RFC 8493",
          "capture_path": "sources/S01-rfc8493.txt",
          "sha256": "4964147d2e6e16442d4a6dbfbe68178a8f33c3e791c06d68a8b33f51ad821537",
          "source_id": "SRC-RFC8493",
          "source_map_path": "source-map.json",
          "locator": "§§2–5",
          "claim": "BagIt contract."
        },
        {
          "identity": "Library of Congress Recommended Formats Statement Audio",
          "url": "https://www.loc.gov/preservation/resources/rfs/audio.html",
          "version": "Current annual HTML edition at capture",
          "capture_path": "sources/S02-loc-rfs-audio.html",
          "sha256": "2a419216eb2488959fa1329e2c0c60f411fa979521b58c8c8f2bae1c19b7ca76",
          "source_id": "SRC-LOC-RFS-AUDIO",
          "source_map_path": "source-map.json",
          "locator": "IV.ii",
          "claim": "Format preference scope."
        },
        {
          "identity": "Library of Congress FDD000357 BWF Version 2",
          "url": "https://www.loc.gov/preservation/digital/formats/fdd/fdd000357.shtml",
          "version": "FDD000357 current page at capture",
          "capture_path": "sources/S03-loc-bwf-v2.html",
          "sha256": "0542ae7a3208323b37f606ff9622e4063ab4b69c6a778711f6b729b9a31e575c",
          "source_id": "SRC-LOC-BWF-V2",
          "source_map_path": "source-map.json",
          "locator": "Local use and sustainability",
          "claim": "BWF context."
        },
        {
          "identity": "Library of Congress PREMIS Data Dictionary",
          "url": "https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf",
          "version": "PREMIS 3.0",
          "capture_path": "sources/S10-premis-v3.pdf",
          "sha256": "2e3e3fe001798f3f43d26b4aed03e8737310fa044ee001af2493f7c72517b0e0",
          "source_id": "SRC-PREMIS",
          "source_map_path": "source-map.json",
          "locator": "Event entity §§2.1–2.7",
          "claim": "Minimal provenance semantics."
        },
        {
          "identity": "FFmpeg official release page",
          "url": "https://ffmpeg.org/download.html",
          "version": "9.0.2 released 2026-09-18",
          "capture_path": "sources/S13-ffmpeg-download.html",
          "sha256": "e1b15edebbabe602905de2b10aa4784fa3b0ed6125582248b686ba3aab3c6442",
          "source_id": "SRC-FFMPEG-RELEASE",
          "source_map_path": "source-map.json",
          "locator": "9.0.2 release entry",
          "claim": "Version candidate."
        },
        {
          "identity": "FFprobe documentation",
          "url": "https://www.ffmpeg.org/ffprobe-all.html",
          "version": "Live documentation, not release-pinned",
          "capture_path": "sources/S12-ffprobe-8.1.html",
          "sha256": "6a862a570dd572bad0c4c453dc590fe254d3830675b02e7d64f7145dfc0dea46",
          "source_id": "SRC-FFPROBE",
          "source_map_path": "source-map.json",
          "locator": "Description/output sections",
          "claim": "Inspection candidate."
        },
        {
          "identity": "BWF MetaEdit official product page",
          "url": "https://mediaarea.net/BWFMetaEdit",
          "version": "26.08.1 observed at capture",
          "capture_path": "sources/S14-bwfmetaedit-product.html",
          "sha256": "7ec25815af64a1a912cbfb63fffe88de3610949bb768922e6d73c4a17c52ff70",
          "source_id": "SRC-BWF-METAEDIT",
          "source_map_path": "source-map.json",
          "locator": "Features",
          "claim": "Optional tool."
        },
        {
          "identity": "bagit.py immutable release source",
          "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py",
          "version": "v1.9.0 commit 861ddacb339d5b92659f0187a402f501d841abbe",
          "capture_path": "sources/S05-bagit-861ddacb339d5b92659f0187a402f501d841abbe.py",
          "sha256": "1c851d04fb8ebdc28e5ad2ffc484569575a1f3922ed83abccd61edd3ee26f80a",
          "source_id": "SRC-BAGIT-CODE",
          "source_map_path": "source-map.json",
          "locator": "Pinned code symbols",
          "claim": "Adoption conditions."
        },
        {
          "identity": "bagit-python issue 157 path encoding bug",
          "url": "https://github.com/LibraryOfCongress/bagit-python/issues/157",
          "version": "Issue opened 2022-02-15",
          "capture_path": "sources/S16-bagit-issue-157.html",
          "sha256": "06e5f79dae382d0c406d6310a0a110c2e9c6e852ab2e977ae11fd5aa2920b4f7",
          "source_id": "SRC-ISSUE-157",
          "source_map_path": "source-map.json",
          "locator": "Issue body",
          "claim": "Path encoding condition."
        }
      ]
    },
    {
      "id": "O5_CRITIC_PENDING",
      "summary": "Independent fresh same-family criticism has not been received in this research stage.",
      "disposition": "Pending; no critique or disposition fabricated.",
      "evidence": [
        "The brief requires an independent check of consequential sources, code/version applicability, plan comparison and the full user scope. The dispatch explicitly marks O5 pending a fresh critic."
      ],
      "conditions": {
        "handoff": "Critic should inspect this semantic set, source-map and captured sources against the admitted brief and frozen plan. No evaluator material is supplied or requested."
      },
      "options": [
        "Populate criticism and response only after a real critic handoff; preserve objections and disagreements."
      ],
      "optional_leads": [
        "Proposed critic checks: BagIt path/validation code, issue-fix-release chain, audio format applicability, every P1–P6 disposition and full O1–O6."
      ],
      "validation": [
        "No independent criticism occurred."
      ],
      "uncertainty": [
        "O5 remains open; this artifact does not claim final scientific agreement."
      ],
      "sources": [
        {
          "identity": "bagit.py immutable release source",
          "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py",
          "version": "v1.9.0 commit 861ddacb339d5b92659f0187a402f501d841abbe",
          "capture_path": "sources/S05-bagit-861ddacb339d5b92659f0187a402f501d841abbe.py",
          "sha256": "1c851d04fb8ebdc28e5ad2ffc484569575a1f3922ed83abccd61edd3ee26f80a",
          "source_id": "SRC-BAGIT-CODE",
          "source_map_path": "source-map.json",
          "locator": "Pinned code symbols",
          "claim": "Independent code check."
        },
        {
          "identity": "RFC 8493 BagIt 1.0",
          "url": "https://www.rfc-editor.org/rfc/rfc8493.txt",
          "version": "RFC 8493",
          "capture_path": "sources/S01-rfc8493.txt",
          "sha256": "4964147d2e6e16442d4a6dbfbe68178a8f33c3e791c06d68a8b33f51ad821537",
          "source_id": "SRC-RFC8493",
          "source_map_path": "source-map.json",
          "locator": "Package requirements",
          "claim": "Independent standard check."
        },
        {
          "identity": "Library of Congress Recommended Formats Statement Audio",
          "url": "https://www.loc.gov/preservation/resources/rfs/audio.html",
          "version": "Current annual HTML edition at capture",
          "capture_path": "sources/S02-loc-rfs-audio.html",
          "sha256": "2a419216eb2488959fa1329e2c0c60f411fa979521b58c8c8f2bae1c19b7ca76",
          "source_id": "SRC-LOC-RFS-AUDIO",
          "source_map_path": "source-map.json",
          "locator": "Format scope",
          "claim": "Independent applicability check."
        }
      ]
    },
    {
      "id": "P6_ACCEPTANCE",
      "summary": "P6 retains every requested synthetic case and adds path, interruption, platform and privacy conditions.",
      "disposition": "Proposed acceptance only; not executed.",
      "evidence": [
        "Frozen plan requests interrupted copy, malformed metadata, unusual channel layout, encoding conversion and package fixity. The replacement retains all five."
      ],
      "conditions": {
        "plan_locator": "Frozen plan P6.",
        "data": "Synthetic content only; no personal interviews."
      },
      "options": [
        "Use selected exact dependency builds once product choices are locked."
      ],
      "optional_leads": [
        "Keep each check's inputs, outputs, warnings and outcome recorded."
      ],
      "validation": [
        "Interrupt at each copy stage; malformed RIFF/BWF, FLAC and ID3; mono/stereo/multichannel/unknown layout; explicit conversion settings and cancellation; missing/altered/extra/truncated/renamed files and tag manifests; percent/CR/LF/Unicode/collision/long/reserved/symlink/shared-prefix paths; read-only source/low space/100 items; Windows/Linux/disconnected network/no egress."
      ],
      "uncertainty": [
        "No product test was performed; no performance or preservation-quality conclusion is offered."
      ],
      "sources": [
        {
          "identity": "RFC 8493 BagIt 1.0",
          "url": "https://www.rfc-editor.org/rfc/rfc8493.txt",
          "version": "RFC 8493",
          "capture_path": "sources/S01-rfc8493.txt",
          "sha256": "4964147d2e6e16442d4a6dbfbe68178a8f33c3e791c06d68a8b33f51ad821537",
          "source_id": "SRC-RFC8493",
          "source_map_path": "source-map.json",
          "locator": "§§2.1.3 and 5.1",
          "claim": "Path/fixity cases."
        },
        {
          "identity": "bagit-python immutable release tests",
          "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/test.py",
          "version": "v1.9.0 same commit",
          "capture_path": "sources/S06-bagit-test-861ddacb339d5b92659f0187a402f501d841abbe.py",
          "sha256": "751f20546c671b9128e9577d077c39574586d7c9be42921f4cd3ab86a5e0ef6a",
          "source_id": "SRC-BAGIT-TESTS",
          "source_map_path": "source-map.json",
          "locator": "Unsafe path test definitions",
          "claim": "Existing test ideas, not run."
        },
        {
          "identity": "Library of Congress literary audio archives workflow case study",
          "url": "https://blogs.loc.gov/thesignal/files/2022/05/JDMM_10_1_JDMM0002_Darby_et_al.pdf?loclr=blogpoe",
          "version": "2022 institutional case study",
          "capture_path": "sources/S15-loc-literary-audio-workflow-2022.pdf",
          "sha256": "646f2cb4e9ffa47668fcf436d89d84317bae2780e7221fdb4bda9ba89a77d42b",
          "source_id": "SRC-LOC-ORAL-HISTORY",
          "source_map_path": "source-map.json",
          "locator": "Test ingest workflow",
          "claim": "Review-before-ingest analogy."
        }
      ]
    },
    {
      "id": "EXECUTION_RECORD",
      "summary": "Research operations are distinct from proposed product validation and from provider cost components.",
      "disposition": "Executed: admitted-file reading, source retrieval/hash, static source review, native Goal activation and activation notice. Renderer and preservation review result are in preservation_check.md. No application test executed.",
      "evidence": [
        "Open search began from the oral-history ingest need before decision comparison. Sixteen public primary source byte streams were captured; SHA-256 was computed locally. Captures are source data only and no downloaded code was executed.",
        "No repo/canonical Plan changes, WorkNodes, nested delegation, other arms, source-cache method, external runner, installer, third-party message, issue or PR mutation occurred."
      ],
      "conditions": {
        "earliest_cold_preparation_utc": "2026-10-07T20:47:52.249474Z",
        "stage_deadline_utc": "2026-10-07T21:12:52.249474Z",
        "whole_arm_deadline_utc": "2026-10-07T21:47:52.249474Z",
        "role_cap_seconds": 1500,
        "whole_arm_cap_seconds": 3600
      },
      "options": [
        "Input/cache/generated/reasoning and billing metrics are all unknown null; see component_usage below.",
        "Aggregate native Goal counters are a separate unsummed snapshot."
      ],
      "optional_leads": [
        "First useful finding: FFprobe machine-readable output candidate, observed by 2026-10-07T20:53:03Z.",
        "Source capture time windows, URLs, byte sizes and hashes: source-map.json.",
        "Generic preparation lower bound 454.056 seconds and qualification lower bound 0.316 seconds are separately retained; qualification wall time and billing are unknown, never free time."
      ],
      "validation": [
        "App tests/build/conversion/quality/performance checks were not executed."
      ],
      "uncertainty": [
        "Provider billing and per-request token categories were not exposed; unknown is not zero."
      ],
      "sources": [
        {
          "identity": "FFprobe documentation",
          "url": "https://www.ffmpeg.org/ffprobe-all.html",
          "version": "Live documentation, not release-pinned",
          "capture_path": "sources/S12-ffprobe-8.1.html",
          "sha256": "6a862a570dd572bad0c4c453dc590fe254d3830675b02e7d64f7145dfc0dea46",
          "source_id": "SRC-FFPROBE",
          "source_map_path": "source-map.json",
          "locator": "Tool description",
          "claim": "First useful finding."
        },
        {
          "identity": "bagit.py immutable release source",
          "url": "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py",
          "version": "v1.9.0 commit 861ddacb339d5b92659f0187a402f501d841abbe",
          "capture_path": "sources/S05-bagit-861ddacb339d5b92659f0187a402f501d841abbe.py",
          "sha256": "1c851d04fb8ebdc28e5ad2ffc484569575a1f3922ed83abccd61edd3ee26f80a",
          "source_id": "SRC-BAGIT-CODE",
          "source_map_path": "source-map.json",
          "locator": "Static code inspection",
          "claim": "Research-only operation."
        }
      ]
    }
  ]
}

```
