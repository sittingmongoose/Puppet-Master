# Critic verification evidence

First useful saved finding: 2026-10-07T20:08:43Z — P3 permits a synthetic/sample preview that may not preview the selected source's actual transformation.
Critic native Goal identity: 01a117f3-568c-7ad1-9570-c3cf5c815860.

## Primary sources checked

- [BWF MetaEdit v26.08 release](https://github.com/MediaArea/BWFMetaEdit/releases/tag/v26.08): tag is shown on verified commit 318d800d92c4a3cc8a814f6fdceba0ed8b3416ec.
- [Pinned Riff_Handler.cpp](https://github.com/MediaArea/BWFMetaEdit/blob/318d800d92c4a3cc8a814f6fdceba0ed8b3416ec/Source/Riff/Riff_Handler.cpp#L499-L867): Open delegates to Open_Internal; current PCM and WAVEFORMATEXTENSIBLE-PCM check compares data Size*8 modulo channelCount*bitsPerSample and records a warning. [Pinned format fields](https://github.com/MediaArea/BWFMetaEdit/blob/318d800d92c4a3cc8a814f6fdceba0ed8b3416ec/Source/Riff/Riff_Base.h#L222-L242), [fmt parser](https://github.com/MediaArea/BWFMetaEdit/blob/318d800d92c4a3cc8a814f6fdceba0ed8b3416ec/Source/Riff/Riff_Chunks_WAVE_fmt_.cpp#L18-L39), [data chunk](https://github.com/MediaArea/BWFMetaEdit/blob/318d800d92c4a3cc8a814f6fdceba0ed8b3416ec/Source/Riff/Riff_Chunks_WAVE_data.cpp#L19-L37).
- [PR #207](https://github.com/MediaArea/BWFMetaEdit/pull/207), [issue #214](https://github.com/MediaArea/BWFMetaEdit/issues/214), [fix PR #218](https://github.com/MediaArea/BWFMetaEdit/pull/218), [merge commit 8337405](https://github.com/MediaArea/BWFMetaEdit/commit/8337405), [v26.08 history](https://raw.githubusercontent.com/MediaArea/BWFMetaEdit/318d800/History_GUI.txt): report is user evidence; fix changes byte arithmetic to bit arithmetic; reporter says manual CLI retest on Ubuntu 20.04 fixed their case; current source contains the correction. No automated regression test is shown. History mentions #214 in 21.07 but does not prove a particular package.
- [LOC external-media guidance](https://www.loc.gov/programs/digital-collections-management/inventory-and-custody/managing-external-media-and-digital-content/): supplied captured official JSON says move external-media content into approved inventory/control and use write-blockers or other practices where media can be overwritten. Direct page fetch returned 403; this is an institutional analogy, not a universal mandate.
- [RFC 8493](https://datatracker.ietf.org/doc/html/rfc8493#section-2.1.3) and [algorithm/validity rules](https://datatracker.ietf.org/doc/html/rfc8493#section-2.4): BagIt manifests and fixity; BagIt 1.0 tools must support SHA-256/SHA-512 and SHOULD default to SHA-512.
- [FFmpeg stream selection](https://ffmpeg.org/ffmpeg.html#Stream-selection), [metadata mapping](https://ffmpeg.org/ffmpeg.html#Advanced-options), [ffprobe](https://ffmpeg.org/ffprobe.html#Main-options): documented explicit mapping and metadata defaults support the draft's caution, but live docs do not pin an implementation version.
- [Archivematica 1.16 docs](https://www.archivematica.org/en/docs/archivematica-1.16/): transfer/ingest/storage and BagIt as broader workflow analogy, not a local desktop runtime.

## Review operations

Four web calls: 32 page opens, 12 find operations, one search query; zero critic direct HTTP attempts. Local searches: one pinned handler capture and one supplied LOC capture. Read critic input-map, full brief/plan, semantic.json, source-map.json, and all of artifact.md in four complete slices (the initial whole-file transport was truncated). No binary, application, or audio fixture was run.
