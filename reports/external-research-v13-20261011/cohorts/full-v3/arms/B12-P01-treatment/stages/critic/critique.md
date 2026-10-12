# Independent critic review — B12-P01-treatment

## Scope and conclusion

I reviewed the frozen original brief, full investigator discovery and draft, investigator source map and source index, and the exact revealed plan plus plan-reveal record. I did not read another stage’s work, including any reviser proposal, and did not edit or repair a final. I checked primary documentation and tagged implementation sources independently; exact identities and conditions are in this stage’s source-map.json, indexed in sources/index.md.

The draft gives dispositions for every material clause in the revealed plan and carries forward the brief’s important constraints. Its changes to filename-derived identity, floating-point-only timing, silent feature loss, destructive cancellation, compressed-size-only checks, sparse diagnostics, and automatic remote fetch are well supported. I found no material wrong correction among those checked. It also clearly labels future validation separately from checks actually run; no parser, package, media, application, UI, or transaction validation was run here.

Three material incompleteness findings, one unsupported suitability statement, and one minor alternative-description omission remain. They do not invalidate the overall architecture, but the first three need resolution in a final proposal.

## Findings

### 1. Material incomplete — launch compatibility scope conflicts with unresolved owner decision

**Draft locators:** §Recommendation, second paragraph; §Per-clause disposition, rows “Export can generate a simple subtitle file for other tools” and “No proposed parser or resource limit is implementation proof”; §Interchange alternatives (WebVTT and SRT); §Owner decisions and assumptions to resolve, item 2.

The recommendation says the bounded first implementation has full read/write support for a native bundle, a declared WebVTT subset, and an explicitly lossy SRT fallback. Elsewhere it says whether WebVTT and SRT are launch commitments is still an owner decision, and requires named, tested profiles while leaving the actual WebVTT subset and target player/tool matrix unspecified. These statements do not establish what the component is committing to support. This is material because track formatting, timing precision, and tool compatibility are central brief requirements.

The W3C source confirms WebVTT is one data kind per file and exposes cues, voice/language spans, settings, regions and styling, while the cited 2026 document is a Candidate Recommendation Draft. FFmpeg’s tagged reader demonstrates a particular implementation’s millisecond timebase and ignored STYLE/REGION/NOTE chunks; that is useful adapter evidence, not evidence that the proposed profile interoperates with the unidentified teacher tools or players. See SRC-WEBVTT-2026-CRD and SRC-FFMPEG-WEBVTT-N9.0.2.

**Disposition:** Before finalization, make WebVTT/SRT a clearly provisional candidate set pending the named tool/player matrix and corpus, or state exact profile/version commitments and acceptance evidence. Resolve the duplicate “proposed commitment” versus “owner decision” wording. This review does not choose a different format.

### 2. Material incomplete — recoverable cancellation has no stated durability contract

**Draft locators:** §Import, steps 6–7; §Failure handling, “Cancellation/error/crash”; §Owner decisions and assumptions to resolve, item 4; §Proposed future validation, “Transaction/recovery.”

The draft promises a named retained session and Resume/Discard after cancellation, with a journal, hashes and revalidation. It separately leaves open whether resume survives process restart or OS reboot, session retention, and upgrade behavior. The brief requires selective import and cancellation with recoverable partial work; without saying what interruption boundary recovery covers, a retained in-process staging directory may not fulfill that requirement. The proposal is strong on the information to journal and on future failure-injection scenarios, but it defers a defining behavior to product input.

**Disposition:** Specify the minimum promised recovery boundary (at least cancellation and process restart, if that is the intent), when selected work becomes durable, and the safe expiry/discard rules. Keep platform-dependent storage limits as owner decisions. No implementation test was run.

### 3. Material incomplete — database/filesystem commit protocol is not designed

**Draft locators:** §Import, steps 6–7; §Failure handling, “Cancellation/error/crash”; §Proposed future validation, “Transaction/recovery.”

The proposal correctly observes that a database transaction alone may not make filesystem writes atomic, calls for a journal and recovery, and requires old lessons to remain unchanged on failure. It does not yet specify the state transitions or idempotent recovery/rollback behavior when a failure occurs between staging-file publication, database commit, and marking the import committed. The future validation list would detect many of these failures but is not itself a design.

**Disposition:** Keep the design at component level, but state the transaction/recovery invariant and the authoritative session states before the final is called complete. The proposed crash, disk-full, cancel, resume and exactly-once tests are appropriate future validation; they were not executed here.

### 4. Unsupported — broad legacy-tool suitability for SRT is not evidenced

**Draft locators:** §Interchange alternatives, “SubRip/SRT”; §Recommendation, second paragraph.

“Practical simple subtitle sidecar when broad legacy tooling is the goal” is plausible, but no target authoring tool, player, or interoperability corpus is identified. The FFmpeg n9.0.2 muxer and its history establish only FFmpeg’s specific single-subtitle-stream behavior; they cannot establish broad external-tool compatibility. The draft appropriately limits SRT to sidecars and labels conversion lossy, so this is a claim-strength issue rather than a demonstrated false statement.

**Disposition:** Present SRT as a candidate pending named-tool evidence, or cite tested target compatibility in a later proposal. Keep the explicit one-sidecar-per-track and loss-report policy.

### 5. Minor omission — EAF tier constraints could be made more concrete

**Draft locator:** §Interchange alternatives, “ELAN EAF.”

The alternatives review correctly describes EAF as an annotation file with linked media and richer tier-parent/subdivision semantics than a flat subtitle model. The official ELAN manual further shows that tier type governs whether annotations are time-alignable, subdivided, or symbolically associated; for example, “None” independent tiers cannot have overlapping annotations, while dependent tiers inherit or subdivide parent alignment. The draft mentions tier constraints generally but not an example relevant to overlap.

**Disposition:** Minor if EAF remains evaluated rather than promised. Add a short constraint example if the final uses EAF as evidence for overlap/timeline behavior or prioritizes an EAF adapter. See SRC-ELAN-MANUAL-TIERS.

## Released-plan coverage check

| Revealed-plan clause | Critic disposition of investigator response |
|---|---|
| ZIP metadata/media/track-file package | Addressed with a versioned manifest, stable IDs and explicit resource records; a candidate design, not an established product fact. |
| Extract whole archive to temp | Addressed by directory/manifest preflight and selected-resource staging. The ZIP documentation supports inspection and member-level addressing; actual safe extraction remains future validation. |
| Flatten media filenames | Correctly rejected; identity is separate from names and collision policy is explicit. |
| Plain text and floating-point seconds | Correctly rejected; richer spans, exact timebase and source time representation are proposed. |
| Sort cues by time | Correctly changed to preserve source sequence and make a separately sorted timeline; format ordering rules still apply. |
| Generic overlap warning | Correctly changed: overlap is retained and only target-specific rendering/export conflicts warrant a warning. |
| Keep unknown fields only in originals | Correctly strengthened with opaque data and original retention; opaque retention is not mislabeled as support. |
| Select tracks/media before final transaction | Retained and strengthened with dependency selection, staging and precommit validation; see recovery findings 2–3. |
| Export same internal package | Retained as a versioned candidate bundle with manifest/resource validation; schema/version details remain proposed. |
| Generate a simple subtitle file | Correctly made profile-specific and lossy where appropriate; launch profile remains unresolved (finding 1). |
| Language from filename suffix | Correctly rejected for explicit language metadata and preserved source labels/tags. |
| Clip association by matching base names | Correctly rejected in favor of manifest references and user repair for unresolved links. |
| Delete temporary directory on cancel | Correctly changed to recoverable Resume/Discard staging; durability semantics remain unresolved (finding 2). |
| Existing lessons untouched | Retained as an invariant, including failures beyond ordinary cancellation; cross-store protocol remains unresolved (finding 3). |
| Text/time/warning-only preview | Expanded usefully to associations, availability, timeline, severity, source location, next action and safe rendering. No UI was run. |
| Compressed cap and absolute-path rejection | Correctly expanded to actual expanded-byte, count, ratio, path/type and work limits; numeric values remain owner decisions. |
| Preserve originals for lossy conversion; do not fetch | Correctly retained and strengthened with item-level loss reports and unresolved external-link behavior. |
| Do not treat proposal as implementation proof | Correctly maintained: implementation/security/transaction validations are proposed, not executed. |

## Brief-scope review

The internal representation covers packages, clips, multiple tracks, language, media-resource associations, cue timing/order/overlap, structured text, provenance and opaque source data. The compatibility section distinguishes copied original bytes, supported-profile semantic round trips, lossy conversions and unsupported content. Alternatives include WebVTT, SRT, TTML, Matroska, EAF, Praat TextGrid and EPUB, with their different roles stated. Package handling addresses duplicate archive names, manifest ambiguity, unsafe paths, resource quotas and no-follow staging; exact safe numeric limits appropriately remain unresolved. Preview and diagnostics are meaningfully richer than a warning list. Import selection and failure isolation are discussed. Export previews included, omitted and changed material and preserves source originals. The proposal does not call for cloud conversion, a playback-engine rewrite, automatic network fetch, or universal support.

Useful uncertainty is retained for platforms, target tools, playback service, limits, retention, malformed-track handling and user workflow. Those are legitimate external inputs. The recommendation should keep their effect on launch compatibility explicit, rather than treating the candidate adapter set as settled.

## Independent source checks and limits

- WebVTT snapshot: cue starts are nondecreasing, end follows start, and different cues can overlap; processing must not normalize Unicode. Its single-kind-per-file rule means it is a timed-text sidecar, not a multi-track lesson package. Candidate Recommendation Draft status and the limits of styling/player behavior matter to any support promise (SRC-WEBVTT-2026-CRD).
- Python zipfile 3.14.8: callers can use ZipInfo to address duplicate member names; documentation warns to inspect untrusted archives and distinguishes extraction sanitation from zipfile.Path behavior. This supports the draft’s preflight/identity warning but does not supply safe quotas or certify the proposed code (SRC-PY-ZIPFILE-3.14.8).
- JSON and language tags: RFC 8259 says object names SHOULD be unique because duplicate behavior is unpredictable; RFC 5646 requires case-insensitive treatment. Both support the draft’s parser/tag recommendations (SRC-RFC8259; SRC-RFC5646).
- TTML2 Recommendation: frame rate, multiplier, tick rate and time-base parameters affect how time expressions map to media time. This supports retaining source time semantics rather than only floating seconds (SRC-TTML2-REC-2018).
- Matroska’s default flag is a player-selection hint. ELAN stores annotations/tier and time alignment in the annotation file and its tier types carry constraints. Praat TextGrid has interval and point tiers. EPUB 3.3 has a ZIP/OCF package and media overlays, but these formats answer different jobs; the investigator’s comparative framing is sound (SRC-MATROSKA-ELEMENTS; SRC-MATROSKA-NOTES; SRC-ELAN-MANUAL-MEDIA; SRC-ELAN-MANUAL-TIERS; SRC-PRAAT-TEXTGRID; SRC-EPUB33-REC-2026).
- FFmpeg n9.0.2 source supports the reported WebVTT parser observations and a one-stream SRT muxer limit. The 2024 muxer change record and 2025 developer-list exchange illustrate implementation history and disagreement over parser tolerance, not a universal format rule or proof the proposed behavior was tested (SRC-FFMPEG-WEBVTT-N9.0.2; SRC-FFMPEG-SRT-N9.0.2; SRC-FFMPEG-SRT-HISTORY; SRC-FFMPEG-WEBVTT-HISTORY). CLI stream-selection defaults are conditional, so explicit mapping is a sound future adapter requirement (SRC-FFMPEG-CLI-DOCS).

I only read documentation, standards and source/history pages. No code was downloaded or run; no package, parser, test suite, media, UI or transaction was exercised. All validations in the investigator draft’s future-validation section remain proposed. Source access versions/conditions and locators are recorded in this stage’s source-map.json; see sources/index.md for the navigable source list.
