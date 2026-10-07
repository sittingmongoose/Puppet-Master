# Candidate preservation and delivery check

## Renderer execution

- Exact command executed:
  `python3 /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/helpers/m14-renderer/render.py /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/I-METHOD-04/treatment/research-v2/semantic.json --output /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/I-METHOD-04/treatment/research-v2/artifact.md`
- Renderer: `m14-renderer-1.0.0`; exit code 0. The output file was new at invocation.
- The renderer was run after semantic authoring and completed no later than 2026-10-07T21:09:46Z.
- Rendered artifact: 143,639 bytes; SHA-256 `6eca00c854395b38c8418fb815f66dbf7237df9d7336f02d0d2caa29a469db23`.
- Semantic source: 48,099 bytes; SHA-256 `1bc410403d7d44825e84bdf7c6829b167a5821c5aa72c04341404209b02a8b56`.
- Source map: 18,153 bytes; SHA-256 `7157817f25f8393e5704a620f93469bf4f92c1a0accc2923b1052ea6e812149b`.
- Source map IDs were aligned to the semantic set after rendering; semantic.json was unchanged. Every authored source reference resolves to exactly one source-map entry and each referenced capture file exists.

## Preservation checks performed

- Parsed semantic.json and source-map.json as JSON. The semantic set contains 8 unique findings; every finding has all nine required fields: id, summary, disposition, evidence, conditions, options, optional_leads, validation, uncertainty and sources.
- Confirmed the complete semantic JSON text is present in artifact.md under Exact authored input.
- Confirmed the Evidence, Conditions, Options, Optional leads, Validation, Uncertainty, Sources, Complete record detail and Exact authored input views are present.
- Confirmed each finding ID is present in the rendered views and all O1–O6 and P1–P6 markers occur in the artifact.
- Confirmed all 16 source-map capture paths exist and all semantic source references resolve to source-map records containing source identity, version/date, public URL, capture path, locator and host-computed SHA-256.
- Reviewed scope coverage: one archivist/up to 100; WAV/BWF, FLAC and MP3; no transcription or publishing; original preservation; separate metadata observations/corrections; explicit derivative preview; package provenance/fixity/reopen checks; offline Windows/Linux; no upload; no metadata rewrite for display; all five original P6 synthetic scenarios; additional path, interruption, platform and no-egress proposals.
- O5 remains explicitly pending a fresh same-family critic. No criticism, agreement or final adjudication was fabricated.
- artifact.md is generated output and was not hand-edited. Renderer projections preserve candidate-authored order and text; no substantive host writing occurred in a view.

## Proposed versus executed validation

Executed: read admitted inputs and dispatch stage bounds; search public primary sources; capture 16 source byte streams and compute SHA-256; statically inspect pinned source, tests, issue, fix and release; run the specified generic renderer; perform the structural and preservation checks above.

Not executed: no application build, test suite, synthetic audio test, copy/fixity operation on an accession package, decoder/encoder/playback operation, performance measurement, quality assessment or offline-egress product test. Those remain proposals in semantic.json.

## Time and cost record

- Earliest cold preparation: 2026-10-07T20:47:52.249474Z.
- Research role cap/deadline: 1,500 seconds; 2026-10-07T21:12:52.249474Z.
- Whole-arm cap/deadline: 3,600 seconds; 2026-10-07T21:47:52.249474Z; 900 seconds for critic and 1,200 seconds for final were preserved.
- Preservation check completed no later than 2026-10-07T21:09:46Z, approximately 1,314 seconds from earliest cold preparation and within the research-stage cap.
- First useful finding was observed no later than 2026-10-07T20:53:03Z. Source capture time windows, exact URLs, versions, byte counts and capture hashes are in source-map.json.
- Generic preparation lower bound 454.056 seconds and qualification lower bound 0.316 seconds are separate recorded components. Actual qualification wall time and billing are unknown; neither is treated as free time.
- Provider input, cache-read, cache-creation, generated, reasoning and billing components remain null/unknown, not zero.
- The actual native Goal tool reported an active aggregate snapshot at 2026-10-07T21:00:54Z: tokensUsed 175446 and timeUsedSeconds 484. This is one unsummed aggregate counter snapshot, separate from provider component usage. Terminal counters are to be obtained from the native Goal tool after completion.
- No quality or speed claim is made. Candidate status remains DIAGNOSTIC_UNQUALIFIED.
