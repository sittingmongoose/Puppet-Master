# Critic source index

This bounded index lists primary sources accessed or checked for A-F02-A1. S08 was opened but no detailed excerpt was exposed; S12 and S22 are carried as inherited identities only. Full identity records, version/commit, locator, governing condition, applicability, original access record and critic access note are in [source-map.json](../source-map.json). Stable IDs S01–S22 are inherited from the investigator without URL rebinding; S12 and S22 are carried but were not independently reopened in this critic stage.

| ID | Primary source | Critic locator / condition checked |
|---|---|---|
| <a id="s01"></a> [S01](../source-map.json) | [FFprobe documentation](https://ffmpeg.org/ffprobe.html) | Description; stream formats; JSON, show-format/streams/error. A failed open or recognition is not proof that original bytes are corrupt. |
| <a id="s02"></a> [S02](../source-map.json) | [FFmpeg release page](https://ffmpeg.org/download.html) | Official result identified 9.0.2 on the 9.0 release branch. Deployment must pin its exact binary/build. |
| <a id="s03"></a> [S03](../source-map.json) | [GstDiscoverer API](https://gstreamer.freedesktop.org/documentation/pbutils/gstdiscoverer.html) | Duration and audio channel accessors; output depends on available plugins and file metadata. |
| <a id="s04"></a> [S04](../source-map.json) | [GStreamer missing-plugin design](https://gstreamer.freedesktop.org/documentation/additional/design/missing-plugins.html) | Typefind and plugin failures; missing demuxer and decoder share a message type, leaving app policy to the application. |
| <a id="s05"></a> [S05](../source-map.json) | [Symphonia 0.6.1 support matrix](https://docs.rs/symphonia/0.6.1/symphonia/) | Feature-gated codec/container table and defaults. |
| <a id="s06"></a> [S06](../source-map.json) | [Symphonia v0.6.1 Cargo.toml](https://raw.githubusercontent.com/pdeljanov/Symphonia/ee35874b571a35a9a6e15d3bc9a3aaf8f11fbeee/symphonia/Cargo.toml) | Pinned commit ee35874b571a35a9a6e15d3bc9a3aaf8f11fbeee; default vs all-codecs/all-formats features. |
| <a id="s07"></a> [S07](../source-map.json) | [Symphonia v0.6.1 player caller](https://raw.githubusercontent.com/pdeljanov/Symphonia/ee35874b571a35a9a6e15d3bc9a3aaf8f11fbeee/symphonia-play/src/main.rs) | Exact commit; extension hint, probe/decode/play modes, track selection, output-device errors. |
| <a id="s08"></a> [S08](../source-map.json) | [Symphonia v0.6.1 check tool](https://raw.githubusercontent.com/pdeljanov/Symphonia/ee35874b571a35a9a6e15d3bc9a3aaf8f11fbeee/symphonia-check/src/main.rs) | Exact source opened, but no detailed excerpt was surfaced by the web tool; see caveat in source map. |
| <a id="s09"></a> [S09](../source-map.json) | [Symphonia v0.6.1 release](https://github.com/pdeljanov/Symphonia/releases/tag/v0.6.1) | MP3 silence/tags, mono MP1, Opus channel metadata and malformed-input hardening notes. |
| <a id="s10"></a> [S10](../source-map.json) | [Symphonia ADPCM issue #41](https://github.com/pdeljanov/Symphonia/issues/41) | ADPCM names/variants and format ambiguity. |
| <a id="s11"></a> [S11](../source-map.json) | [Symphonia ADPCM PR #160](https://github.com/pdeljanov/Symphonia/pull/160) | Merged decoder limits and issue linkage; does not promise every ADPCM variant. |
| <a id="s13"></a> [S13](../source-map.json) | [MediaInfo SDK quick start](https://mediaarea.net/en/MediaInfo/Support/SDK/Quick_Start) | Metadata API, Unicode and version pinning; SDK documents default Internet contact and an opt-out. |
| <a id="s14"></a> [S14](../source-map.json) | [SQLite transaction control](https://www.sqlite.org/lang_transaction.html) | One simultaneous writer and SQLITE_BUSY conditions. |
| <a id="s15"></a> [S15](../source-map.json) | [BagIt RFC 8493](https://www.rfc-editor.org/rfc/rfc8493) | Opaque payload, checksummed manifests, completeness and validity; not a catalog metadata schema. |
| <a id="s16"></a> [S16](../source-map.json) | [PBCore instantiation document](https://pbcore.org/elements/pbcoreinstantiationdocument.html) | Required instantiation identifier; duration and channel configuration optional; no receiving API implied. |
| <a id="s17"></a> [S17](../source-map.json) | [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Keyboard and status-message criteria apply to web content; not native-app conformance proof. |
| <a id="s18"></a> [S18](../source-map.json) | [Slint accessibility properties](https://docs.slint.dev/latest/docs/slint/reference/common/) | Accessibility role/label/state properties; target assistive-technology behavior still needs testing. |
| <a id="s19"></a> [S19](../source-map.json) | [Slint FocusScope](https://docs.slint.dev/latest/docs/slint/reference/keyboard-input/focusscope/) | Focus-dependent keyboard event and KeyBinding behavior. |
| <a id="s20"></a> [S20](../source-map.json) | [FFmpeg audio filters](https://ffmpeg.org/ffmpeg-filters.html) | Pan/channel remap with pure 0/1 mapping condition; does not prove target player/device behavior. |
| <a id="s21"></a> [S21](../source-map.json) | [WAI status-message guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) | Progress status visible without focus and avoid unnecessary interruption; web guidance only. |

S12 (Symphonia regression-fixture discussion) and S22 (WAI-ARIA status role) are kept in the map as inherited records, not independently checked here. No raw source captures or downloaded code were added.
