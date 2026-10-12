# Independent critic review — Multilingual media-package import/export

## Scope and disposition

I reviewed the frozen brief, the complete investigator discovery and draft, the released plan, the carried source map and README, and the plan-release record named in input-map.json. I did not inspect parent history or unlisted candidates. The plan SHA-256 is 16b9632d851af40d2759e5c686525183f38a1e24989ffc6597cb35aeabaf7247; the discovery digest and byte count match plan-reveal.json exactly: e61d807d2cf719ff0c4481f2a443201f07462c4c9942fd6ecce782dcf3d84bc4 and 15,676 bytes. The plan file hashes to the released digest and is 1,722 bytes.

**Disposition:** The draft is a strong, faithful plan adjudication and is ready for a fresh complete reviser after addressing two material omissions below. I found no materially wrong core correction. This critique identifies findings and evidence; it does not author or repair the final proposal.

Classifications: **material wrong** (a consequential claim/correction conflicts with the brief or evidence); **material incomplete** (a required concern is missing or not decision-ready); **unsupported** (evidence/provenance does not establish a claim); **minor locator/wording** (substance is sound but needs precision); **honestly unresolved external input** (a real owner/user fact is absent).

## Findings

### C1 — Material incomplete: descriptive metadata needs an explicit preservation model

**Draft locator:** “Proposal → Representation,” especially the listed separations and the manifest sentence beginning “The manifest names stable IDs”; “Exact released-plan clause dispositions,” ZIP-package row.

The brief names descriptive metadata alongside audio/video clips and tracks, and requires supported round trips to preserve it. The draft identifies IDs, kind, language, profile, clip association, timestamps, hashes, and original/derived status, but never says what descriptive metadata belongs to the package, clip, resource, or track, how it is preserved when normalized, or how it appears in export loss reporting. The earlier discovery explicitly named package human metadata; that detail is not carried into the draft’s representation list. Keeping opaque original bytes may preserve a file, but does not establish that its metadata stays inspectable, associated, or mapped in a supported round trip.

**Revision direction:** Add an explicit metadata-bearing entity/extension model and rules for source metadata, unknown metadata, and target mappings. Exact fields can remain an owner decision pending representative packages.

### C2 — Material incomplete: state the hard no-paid-cloud boundary

**Draft locator:** “Safe, selective, recoverable import,” item 5; “Loss-aware export and preview”; “Owner decisions required.”

The draft correctly prohibits remote fetching and does not propose a cloud converter. It does not expressly carry forward the brief’s separate exclusion of paid cloud conversion. Because future adapters and the authoring-tool roster remain open, include this boundary alongside the other import/export constraints so later choices cannot be read as authorizing a paid remote conversion service. No evidence suggests the draft currently depends on such a service; this is a missing negative constraint, not an observed violation.

### C3 — Minor locator/wording: distinguish independent source checks from carried alternatives

**Draft locator:** “Adapters and compatibility,” optional Matroska/H5P/Common Cartridge/BagIt/OTIO alternatives; validation record.

The central evidence is strong, but not every carried source was independently verified in this critic pass. S06’s live FFmpeg support rows and its latest-stable-release context, S11’s H5P package-spec page (direct open returned an internal error), S19’s advisory-linked patch commit, and S20’s sample contents remain carried or incompletely checked. The draft already qualifies these sources and keeps the adapters optional. Preserve that qualification and do not use these entries to justify a frozen commitment. Detailed statuses and checked locators are in the critic source map.

### C4 — Honestly unresolved external input: profiles and operational thresholds

**Draft locator:** “Owner decisions required before implementation scope is frozen,” items 1–10; “Safe, selective, recoverable import,” item 3.

The unknowns listed there are genuine blockers to fixing compatibility promises or numeric limits: tool/version roster and representative files, target exports, required profiles/features, playback backend, schema ownership, originals retention, size/count/time/memory limits, recovery retention, and adapter demand. They are correctly presented as owner facts to obtain, not reasons to shrink the brief or defects in the research.

## Released-plan clause review

| Released-plan clause | Draft disposition | Independent critic assessment |
|---|---|---|
| ZIP with one metadata document, media folder, one text file per subtitle track | Retain with correction | Sound packaging candidate, not a format contract. Versioned manifest and stable IDs are appropriate. Add explicit descriptive-metadata preservation (C1). |
| Extract into a temporary directory | Correct to inventory-first isolated staging | Correct. Do not trust member paths or extract the full archive before selection. Python’s ZIP path caveat and the zip-rs symlink-redirect advisory support an isolated staging boundary (S17–S18). |
| Flatten media filenames | Reject | Correct. Basename collisions erase identity and can misassociate content. Keep original display/path separate from stable resource identity. |
| Convert every recognized track to plain text plus float seconds | Reject | Correct. This loses structured formatting and timing precision. WebVTT has bounded structured cue text; TTML2 has profiles and timing constructs; the pinned SRT writer uses a 1/1000 time base (S01, S03, S07). |
| Store one start/end pair per cue | Retain outer interval with extension | Correct. Keep subcue timing or preserve it opaquely with a visible loss warning. Invalid input must not be silently repaired. |
| Sort cues by start time | Correct; preserve source order and derive output order | Correct. WebVTT requires nondecreasing cue starts but permits overlap; target serialization can reorder a derivative while retaining source order (S01 §4.1). |
| Treat overlap as warning, not rejection | Retain and clarify | Correct. Overlap is valid in WebVTT; warn for preview collision or target limitations, not merely because intervals intersect (S01 §4.1). |
| Leave unrecognized fields only in imported originals | Correct | Correct. Originals alone are not a visible loss policy; preserve bytes, report unsupported fields, and present export choices. |
| Choose tracks/media before final database transaction | Retain and clarify | Correct and aligned with selective import. Inventory/validation and recoverable staging precede atomic commit. |
| Export same internal package; optionally simple subtitle file | Retain with correction | Correct. Named target profiles and itemized loss reporting avoid implying broad compatibility. Write a new artifact and keep originals when conversion loses data. |
| Infer track language from filename suffix | Reject as authoritative; allow confirmed suggestion | Correct. HTML distinguishes srclang from label language (S02); filenames are not governing language metadata. |
| Infer clip association from matching base filenames | Reject as authoritative; allow confirmed suggestion | Correct. Duplicate names are a stated risk. Stable references or explicit user choice are safer. |
| Cancellation deletes temp directory; lessons stay untouched | Split: retain no mutation, correct deletion to recoverable journal/staging | Correct. The brief requires recoverable partial work; expiration and explicit discard remain owner policy. |
| Preview text, time ranges, warnings | Retain and extend | Correct. Add language/kind, association, overlap, formatting, and export-loss context as proposed. |
| Maximum compressed size and reject absolute paths | Retain as minimum; expand controls | Correct. Add expanded bytes, ratios, counts, depth, parser resources, traversal, symlink and normalized collision handling. Exact values remain unresolved; proposals are not implementation proof (S17–S18). |
| Examine representation, compatibility, error/cancellation and round-trip promises | Retain and scope | Correct; the draft also covers diagnostics and alternatives required by the brief. |
| Retain originals for lossy transformation; never auto-fetch remote media | Retain as hard requirements | Correct. BagIt fetch.txt is not permission to fetch; leave remote references unresolved (S16). |
| Proposed parser/resource limit is not implementation proof | Retain as validation constraint | Correct. No parser, archive extraction, app build or product round-trip was run in the reviewed package. |

## Discovery, alternatives, and correction quality

The discovery is useful and the draft preserves its strongest findings: versioned neutral graph; immutable original resource bytes; separate identity/path/language/kind/label/association; exact timebase and source-order retention; scoped WebVTT, TTML2, SRT, ASS, Matroska and H5P adapters; optional Common Cartridge, BagIt and OTIO alternatives; archive/resource boundaries; resumable selection; and loss-aware preview. The plan’s flattening, float normalization, filename inference and destructive cancellation choices are corrected for reasons tied to the brief’s collision, formatting, timing, and recovery requirements.

Primary evidence independently checked here includes W3C WebVTT CR Draft status, ordered starts, positive duration and permitted overlap; WHATWG language/default-track distinctions; TTML2 profiles and local timing; Matroska timestamp notes; the exact FFmpeg n8.1.1 SRT writer branches; Aegisub v3.5.0 exporter guards and security note; H5P.com’s direct-video VTT limitation; OTIO’s external media references; Common Cartridge’s LMS focus; BagIt fetch security notes; Python 3.13.16 ZIP path guidance; and the reviewed zip-rs advisory’s affected/patched range. Exact identities, UTC access, URLs and locators are in sources/README.md and source-map.json. Source-specific examples remain examples, not universal behavior.

## Validation: proposed versus actually evidenced

**Proposed, not run:** teacher-tool golden fixtures; per-format timing/text/profile round trips; archive traversal/duplicate/resource-exhaustion cases; cancellation/crash recovery; export loss-consent checks; hash preservation; and accessibility/usability review. The draft labels these future validations appropriately.

**Evidence visible in this critic stage:** native Goal activation was saved and its binding guard passed; discovery and plan hashes/byte counts match plan-reveal.json; the carried source-map JSON parsed; primary sources were opened and checked as indexed. No application code, sample archive, parser, conversion, build, or deployment was run. plan-reveal.json supports the stated one-shot release and its hashes, although the helper process itself has no separate execution log in the supplied inputs. Investigator claims about earlier checks are not independent proof beyond these inspectable records.

## Guidance to the fresh reviser

Carry the full brief and all 18 released-plan dispositions forward. Add the metadata preservation model and explicit no-paid-cloud constraint; retain the current scope, originals, no-network, no-playback-rewrite, recovery, diagnostics and fidelity safeguards. Keep tool roster/profile/limit decisions open, source IDs fixed, proposed-versus-executed validation labels distinct, and implementation proof claims out.
