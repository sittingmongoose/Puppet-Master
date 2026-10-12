# Reviser source index — A-F02-R0

This proposal uses stable investigator IDs S01–S19 and S07A and critic IDs C01–C18 without rebinding them. Full source identity, locator, conditions, access time, observed operation, and applicability are preserved in [source-map.json](../source-map.json). That map also binds the reviewed artifacts and predecessor source maps by path and SHA-256.

## Reviser’s bounded primary-source rechecks

| ID | Issue | Primary source |
|---|---|---|
| R01 | MI-01: transaction scope, readers/writer, busy behavior | [SQLite transaction documentation](https://www.sqlite.org/lang_transaction.html) |
| R02 | MI-01: atomic commit scope and storage/journal assumptions | [Atomic Commit In SQLite](https://www.sqlite.org/atomiccommit.html) |
| R03 | MIN-02: moving DROID branch versus release identity | [DROID 6.9.13 release page](https://github.com/digital-preservation/droid/releases/tag/6.9.13) |

The official GitHub REST endpoint for the moving develop branch was attempted but inaccessible through the browser tool. No branch SHA is inferred from that failed request. The 6.9.13 page displayed short release commit deb91d0 and 27 commits to develop at this read; that is a time-sensitive observation, not a pin for develop.

## Carried primary evidence

| IDs | Area | Navigation |
|---|---|---|
| S01–S05, C01–C04 | FFmpeg release/build, probe fields, stream selection, channels, FATE | [FFmpeg download](https://ffmpeg.org/download.html), [ffprobe](https://ffmpeg.org/ffprobe.html), [FFmpeg manual](https://www.ffmpeg.org/ffmpeg.html), [tagged audio filters](https://raw.githubusercontent.com/FFmpeg/FFmpeg/n9.0.2/doc/filters.texi), [FATE definitions](https://github.com/FFmpeg/FFmpeg/blob/n9.0.2/tests/fate/ffprobe.mak) |
| S06–S09, S07A, C05–C08 | Symphonia features, caller, fixes, duration, Opus adapter | [Symphonia 0.6.1](https://docs.rs/symphonia/0.6.1/symphonia/), [feature manifest](https://raw.githubusercontent.com/pdeljanov/Symphonia/v0.6.1/symphonia/Cargo.toml), [example](https://github.com/pdeljanov/Symphonia/blob/v0.6.1/symphonia/examples/getting-started.rs), [release notes](https://github.com/pdeljanov/Symphonia/releases/tag/v0.6.1), [regression discussion](https://github.com/pdeljanov/Symphonia/discussions/337), [libopus adapter](https://docs.rs/symphonia-adapter-libopus/0.3.0/symphonia_adapter_libopus/) |
| S10–S11, C09–C10 | GStreamer discovery and missing-plugin policy | [GstDiscoverer](https://gstreamer.freedesktop.org/documentation/pbutils/gstdiscoverer.html), [missing-plugin design](https://gstreamer.freedesktop.org/documentation/additional/design/missing-plugins.html) |
| S12–S13, C15–C16 | DROID/PRONOM identity and signature coverage | [DROID repository](https://github.com/digital-preservation/droid), [National Archives guidance](https://www.nationalarchives.gov.uk/information-management/manage-information/preserving-digital-records/our-role/) |
| S14, C11 | Portable package structure and integrity limits | [RFC 8493](https://www.rfc-editor.org/rfc/rfc8493.html) |
| S15–S16, C12–C13 | SQLite transactions and commit assumptions | [Transactions](https://www.sqlite.org/lang_transaction.html), [atomic commit](https://www.sqlite.org/atomiccommit.html) |
| S17, C14 | Keyboard and status-message criteria | [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/) |
| S18 | Preservation-format context | [Library of Congress sound curator guidance](https://www.loc.gov/preservation/digital/formats/content/sound_curator.shtml) |
| S19, C17–C18 | FFmpeg release and packaging conditions | [FFmpeg downloads](https://ffmpeg.org/download.html), [FFmpeg legal notes](https://ffmpeg.org/legal.html) |

## Review boundary

The investigator and critic source maps retain their original read windows and methods. The reviser independently rechecked the SQLite points relevant to MI-01 and the DROID release/branch distinction relevant to MIN-02. No source code was downloaded or executed and no media was read.