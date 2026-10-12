# Source index — C-R1-P02-control investigator

Access session: 2026-10-12 UTC, bounded by 02:38:54–02:40:44 UTC. The browser tool does not expose a per-request timestamp or immutable page snapshot; source-map.json records the observed window and UNKNOWN build identifiers where the source did not expose them. Search-result excerpts were reviewed; sources are linked directly for later version-pinned review. No source media was downloaded.

## Media inspection and time

- S001 [FFprobe](https://ffmpeg.org/ffprobe.html) — official overview and machine-readable sections, stream specifiers, packet/frame output, timecode extraction. Live documentation version not surfaced. Basis for per-stream inspection and explicit track selection.
- S002 [FFmpeg](https://www.ffmpeg.org/ffmpeg.html) — official seek, timestamp, fps-mode and stream-copy behavior. Live documentation version not surfaced. Basis for not promising exact stream-copy excerpt boundaries.
- S003 [FFmpeg Formats](https://www.ffmpeg.org/ffmpeg-formats.html) — wall-clock timestamp and negative-timestamp defaults. Live documentation version not surfaced. Basis for making timestamp transforms explicit.
- S004 [MLT releases](https://github.com/mltframework/mlt/releases) — v7.30.0 (d6eaddc) fixed incorrect AVCHD frame-rate handling and added mixed-rate xml-clip; v7.40.0 (bef9d89) was marked latest. Basis for version pinning and VFR regression tests.
- S005 [MLT XML](https://mltframework.org/docs/mltxml/) — serialization mirrors MLT's internal model; XML parsing described as non-validating. Current page version not surfaced.

## Existing products and interchange

- S006 [Kdenlive project files, 26.08](https://docs.kdenlive.org/en/project_and_asset_management/file_management/project_files.html) — original media mostly referenced, proxy refs and edits in project, upgrades make backups, project documents are not backward compatible across relevant version changes.
- S007 [Kdenlive proxy settings, 26.08](https://docs.kdenlive.org/en/project_and_asset_management/project_settings/proxy_settings.html) — optional reduced media per project/clip, used for editing and originals for full-resolution render.
- S008 [ELAN multi-video synchronization](https://www.mpi.nl/tools/elan/docs/manual/Sec_Synchronizing_video_files.html) — manual anchor and offset workflow; millisecond offset controls; offers annotation shifting after changed sync.
- S009 [ELAN moved-media relinking](https://www.mpi.nl/tools/elan/docs/manual/Sec_Changing_the_links_to_media_files.html) — explicit update of moved/renamed files, master and default-audio ordering.
- S010 [ELAN annotation files](https://www.mpi.nl/tools/elan/docs/manual/Sec_Media_Files_and_Annotation_Files.html) — annotation/time alignment is stored in EAF, not source media.
- S011 [ELAN player options](https://www.mpi.nl/tools/elan/docs/manual/Sec_The_Media_Player_options.html) — display can be ms or standard frame-code conversions; distinguish display code from exact media time.
- S012 [OTIO releases](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/releases) — v0.18.0 (209d723) changed schema including Clip.2 multi-media refs and schema downgrade; v0.18.1 (4423671) fixed Python wheels.
- S013 [OTIO file bundles](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/blob/main/docs/tutorials/otio-filebundles.md) — otioz/otiod package timeline and media, with unique flat basenames and copy/size consequences. Main documentation commit not surfaced.
- S014 [OTIO issue 1985](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/issues/1985) — open 1.0 Release issue, opened 2025-12-11. Reporter says documentation and tests differ on file:// prefixes and cites Premiere Beta 26.1 / DaVinci Resolve 20.2 interop; maintainer describes POSIX examples and says Windows path behavior is uncertain. This is a report, not an independently reproduced test.

## Transfer integrity and fixtures

- S015 [RFC 8493](https://datatracker.ietf.org/doc/html/rfc8493) — BagIt 1.0 payload and relative-path checksum manifests, complete/valid definitions and path safety.
- S016 [FFmpeg FATE](https://www.ffmpeg.org/fate.html) — regression-suite tests and public samples. Use candidate samples only after recording license, exact file hash and tool compatibility; FATE does not test this application's alignment or packaging rules.

Each source-map record preserves source ID, URL, version or explicit UNKNOWN, locator, access UTC/session capture, observed operation, applicable default/condition/exception and claim scope. Do not reuse an ID for a different source.


### Source correction after discovery freeze

The discovery file frozen by the one-time reveal helper contains an incorrect issue identifier/date for S014 (#1990 / 2026-01-15). Direct review of [#1990](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/issues/1990) established that it concerns release automation updating the version matrix; the target_url interoperability issue is [#1985](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/issues/1985), opened 2025-12-11. Both exact records are preserved as S017 and corrected S014. The discovery hash was preserved unchanged as required. The corrected identity and detailed finding are in source-map.json and draft.md.

- S017 [OTIO issue 1990](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/issues/1990) — exact page is the release-automation/version-matrix issue. It verifies the correction to frozen discovery; unrelated to media-path semantics.
