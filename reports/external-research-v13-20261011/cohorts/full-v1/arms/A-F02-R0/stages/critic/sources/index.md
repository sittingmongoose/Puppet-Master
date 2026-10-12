# Critic source index — A-F02-R0

Source identity, locators, access window, observed operation, governing conditions and applicability are recorded in [source-map.json](../source-map.json). Critic IDs C01–C18 are new verification records; investigator IDs S01–S19 and S07A remain unchanged and are referenced explicitly.

| Critic IDs | Investigator IDs | Area |
|---|---|---|
| C01–C04 | S02–S05 | FFprobe output, stream selection, channel filters and FATE tests |
| C05–C08 | S06–S09 | Symphonia feature flags, caller behavior, release fixes and duration/reproducibility discussion |
| C09–C10 | S10–S11 | GStreamer discovery and missing-plugin states |
| C11–C14 | S14–S17 | BagIt, SQLite transactions/atomicity and WCAG |
| C15–C16 | S12–S13 | DROID signature handling and National Archives coverage guidance |
| C17–C18 | S01, S19 | FFmpeg release/build and licensing conditions |

## Primary links

- [ffprobe documentation](https://ffmpeg.org/ffprobe.html) · [FFmpeg stream-selection manual](https://www.ffmpeg.org/ffmpeg.html) · [FFmpeg n9.0.2 filters source](https://raw.githubusercontent.com/FFmpeg/FFmpeg/n9.0.2/doc/filters.texi) · [FFmpeg n9.0.2 FATE tests](https://github.com/FFmpeg/FFmpeg/blob/n9.0.2/tests/fate/ffprobe.mak)
- [Symphonia v0.6.1 Cargo features](https://raw.githubusercontent.com/pdeljanov/Symphonia/v0.6.1/symphonia/Cargo.toml) · [getting-started caller](https://github.com/pdeljanov/Symphonia/blob/v0.6.1/symphonia/examples/getting-started.rs) · [release notes](https://github.com/pdeljanov/Symphonia/releases/tag/v0.6.1) · [regression-pack discussion](https://github.com/pdeljanov/Symphonia/discussions/337)
- [GstDiscoverer](https://gstreamer.freedesktop.org/documentation/pbutils/gstdiscoverer.html) · [missing-plugin design](https://gstreamer.freedesktop.org/documentation/additional/design/missing-plugins.html)
- [RFC 8493](https://www.rfc-editor.org/rfc/rfc8493.html) · [SQLite transactions](https://www.sqlite.org/lang_transaction.html) · [SQLite atomic commit](https://www.sqlite.org/atomiccommit.html) · [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [DROID repository](https://github.com/digital-preservation/droid) · [National Archives guidance](https://www.nationalarchives.gov.uk/information-management/manage-information/preserving-digital-records/our-role/)
- [FFmpeg downloads](https://ffmpeg.org/download.html) · [FFmpeg legal notes](https://ffmpeg.org/legal.html)

Evidence is read-only research. It is not a build, media test, package validation, accessibility run, or legal opinion.
