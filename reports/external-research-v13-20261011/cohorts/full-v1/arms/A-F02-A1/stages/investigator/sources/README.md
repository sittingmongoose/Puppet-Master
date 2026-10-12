# Sources index

Bounded primary-source notes collected for investigator discovery. Source identity metadata is in [source-map.json](../source-map.json). Stable IDs are not reused.

| ID | Source | Evidence note |
|---|---|---|
| [S01](#s01) | ffprobe docs | Probe container/stream and emit machine-readable sections; not a playback promise. |
| [S02](#s02) | FFmpeg release page | Version/release-branch policy and FFmpeg 9.0.2 on access date. |
| [S03](#s03) | GStreamer Discoverer | Duration, audio streams, channel count/mask. |
| [S04](#s04) | GStreamer missing plugins | App receives missing-plugin data and decides policy; missing demuxer/decoder share a decoder message type. |
| [S05–S09](#s05) | Symphonia | 0.6.1 support matrix, build features, player code, test tool, release fixes. |
| [S10–S12](#s10) | Symphonia issue/release/testing history | ADPCM variant gaps, associated PR, regression fixture reproducibility concern. |
| [S13](#s13) | MediaInfo SDK | Metadata-only candidate with stream index access and Unicode caveat. |
| [S14](#s14) | SQLite transactions | Per-item atomic checkpoint candidate, with single-writer/SQLITE_BUSY conditions. |
| [S15](#s15) | RFC 8493 BagIt | Portable package structure and checksum manifests; opaque payload semantics. |
| [S16](#s16) | PBCore 2.1 instantiation | Identifier, format, duration, channel configuration are possible export fields. |
| [S17](#s17) | WCAG 2.2 | Keyboard and status-message reference; native app conformance not implied. |
| [S18–S19](#s18) | Slint docs | Accessibility semantics and keyboard focus/shortcut behavior. |

## S01 — ffprobe
[Exact URL](https://ffmpeg.org/ffprobe.html) · Current live docs, not release-stamped. Locator: container/stream description, stream specifiers, `-show_error`, `-show_format`, `-show_streams`, JSON writer. It reports what the current build can probe; inability to open/recognize input is an explicit probe error. Applicability: content-level metadata and an independent probe/read status.

## S02 — FFmpeg releases
[Exact URL](https://ffmpeg.org/download.html) · FFmpeg 9.0.2, 2026-09-18; 9.0 branch cut 2026-06-26. Locator: release branch policy and 9.0.2 library versions. Release builds can differ from development builds and from downstream configurations. Applicability: pin, inventory and validate the exact distributed binary.

## S03 — GStreamer Discoverer
[Exact URL](https://gstreamer.freedesktop.org/documentation/pbutils/gstdiscoverer.html) · Live API docs; not version-pinned. Locator: DiscovererInfo duration; DiscovererAudioInfo channel count/mask; container/stream topology. Applicability: integrated demux/probe option and channel metadata. Returned duration is reported metadata, not an assurance it was computed accurately for every malformed/quirky item.

## S04 — GStreamer missing plugins
[Exact URL](https://gstreamer.freedesktop.org/documentation/additional/design/missing-plugins.html) · Project design docs (historical version requirement is stated on page). Locator: typefind, missing demuxer/decoder, application-level policy. Important nuance: missing demuxer and missing decoder are both reported as message type `decoder`; do not overstate diagnostic precision. Applicability: “preview backend lacks needed component” can be distinct from probe unreadable.

## S05 — Symphonia 0.6.1 support matrix
[Versioned docs](https://docs.rs/symphonia/0.6.1/symphonia/) · Exact version 0.6.1. Locator: container, codec and metadata feature tables. Applicability: constrained Rust alternative; exact features determine capability.

## S06 — Symphonia pinned build features
[Source at release commit](https://raw.githubusercontent.com/pdeljanov/Symphonia/ee35874b571a35a9a6e15d3bc9a3aaf8f11fbeee/symphonia/Cargo.toml) · Commit `ee35874b571a35a9a6e15d3bc9a3aaf8f11fbeee`, v0.6.1. Locator: feature defaults and `all-codecs`/`all-formats`. Applicability: concrete build-default support boundary.

## S07 — Symphonia player caller
[Source at release commit](https://raw.githubusercontent.com/pdeljanov/Symphonia/ee35874b571a35a9a6e15d3bc9a3aaf8f11fbeee/symphonia-play/src/main.rs) · Same commit. Locator: `Hint` gets file extension; separate probe-only, verify/decode-only and output playback; track selection; output-open and nonfatal decode errors. Applicability: illustrates why parse and preview must be separate states.

## S08 — Symphonia check tool
[Source at release commit](https://raw.githubusercontent.com/pdeljanov/Symphonia/ee35874b571a35a9a6e15d3bc9a3aaf8f11fbeee/symphonia-check/src/main.rs) · Same commit. Locator: reference decoder process, per-sample comparisons and exit/result paths. Applicability: independent decoder comparison for licensed regression fixtures; it is not a test of intake identity, permissions, restart or UI.

## S09 — Symphonia v0.6.1 release
[Release/tag](https://github.com/pdeljanov/Symphonia/releases/tag/v0.6.1) · Tag v0.6.1, commit `ee35874b571a35a9a6e15d3bc9a3aaf8f11fbeee`, released 2026-08-13. Locator: release feature and bug-fix notes. Applicability: shows real fixes to MP3 silence/tags, mono MP1 and parser safety; Opus channel metadata is not the same as Opus decode support.

## S10 — Symphonia ADPCM issue
[Issue #41](https://github.com/pdeljanov/Symphonia/issues/41) · Opened 2021-07-09; closed with PR #160. Locator: requested WAV ADPCM variants and ambiguous naming/real-world channel variation. Applicability: support claims should enumerate variant fixtures.

## S11 — ADPCM decoder fix
[PR #160](https://github.com/pdeljanov/Symphonia/pull/160) · Issue-to-fix link from #41. Locator: decoder implementation. Applicability: implementation history; verify release coverage instead of assuming the issue's entire format family is handled.

## S12 — Regression fixture discussion
[Discussion #337](https://github.com/pdeljanov/Symphonia/discussions/337) · Maintainer reply 2025-01-15. Locator: maintainer describes personal media/problem-file checks and their non-reproducibility due to copyright, size and effort. Applicability: use generated/openly licensed fixtures and store expected metadata/results with them.

## S13 — MediaInfo SDK Quick Start
[Exact URL](https://mediaarea.net/en/MediaInfo/Support/SDK/Quick_Start) · Live SDK docs, version not stamped. Locator: Open/Get/Inform APIs, stream-kind/numbers, Unicode note. Applicability: metadata-only alternative, possibly useful for cross-checking a second reader.

## S14 — SQLite transaction control
[Exact URL](https://www.sqlite.org/lang_transaction.html) · Current docs, version not stamped. Locator: explicit/implicit transactions, single simultaneous writer, `SQLITE_BUSY`. Applicability: atomic local status/checkpoint update option; retry/concurrency policy needed.

## S15 — BagIt
[RFC 8493](https://www.rfc-editor.org/rfc/rfc8493) · BagIt 1.0, October 2018, informational RFC. Locator: abstract and payload/manifests requirements. Payloads are opaque byte sequences; manifest checksums verify fixity. Applicability: transport structure, not catalog schema or permissions authority.

## S16 — PBCore instantiation
[Element documentation](https://pbcore.org/elements/pbcoreinstantiationdocument.html) · PBCore 2.1 current project release. Locator: instantiation identifier, digital format, duration and optional narrative channel configuration. Applicability: audiovisual catalog mapping if accepted; verify the receiver's XSD/API and field semantics.

## S17 — WCAG 2.2
[W3C Recommendation](https://www.w3.org/TR/WCAG22/) · Version 2.2, 2023-10-05. Locator: 2.1.1 Keyboard; 2.1.2 No Keyboard Trap; 4.1.3 Status Messages. Applicability: accessibility reference; it is scoped to web content and does not establish native UI conformance.

## S18 — Slint accessibility properties
[Exact URL](https://docs.slint.dev/latest/docs/slint/reference/common/) · Live latest docs, not release-pinned. Locator: accessibility roles, labels, states and IDs. Applicability: native semantics for visible text and accessible controls; platform screen-reader tests remain necessary.

## S19 — Slint FocusScope
[Exact URL](https://docs.slint.dev/latest/docs/slint/reference/keyboard-input/focusscope/) · Live latest docs, not release-pinned. Locator: focus-dependent event delivery and logical-key bindings. Applicability: keyboard review flow and focus-state handling; do not assume a global shortcut works when its scope lacks focus.

## S20 — FFmpeg pan filter
[Exact URL](https://ffmpeg.org/ffmpeg-filters.html) · Live filter docs, not release-pinned. Locator: pan channel remapping and the conditions for an optimized pure mapping (zero/one gains, one input per output). The search result was inspected; opening the page returned an Internal Error, so no more detailed source claims are made. Applicability: choose an input channel for preview at the decode/output stage without writing a converted source file.

## S21 — WCAG 2.2 progress status guidance
[Exact URL](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) · Live WCAG 2.2 Understanding guidance. Locator: situation C for process progress; status should be available without focus and avoid unnecessary interruptions. Applicability: use coalesced polite milestones and a persistent textual count, then validate announcement rate with screen-reader users. This is web guidance, not proof of native-app conformance.

## S22 — WAI-ARIA 1.2 status role
[Exact URL](https://www.w3.org/TR/wai-aria-1.2/#status) · W3C Recommendation, WAI-ARIA 1.2 (2023-06-06). Locator: status role; advisory status with polite live behavior and atomic announcement defaults. Applicability: reference model only; native Slint/OS accessibility semantics and announcement behavior require their own verification.
