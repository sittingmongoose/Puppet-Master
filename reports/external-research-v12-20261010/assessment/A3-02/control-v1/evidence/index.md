# Independent primary evidence — A3-02 control

Each capture is a read-only HTTPS retrieval. Access times, exact URL, resolved URL, bytes and SHA-256 are in [source-map.json](../source-map.json) and [retrieval-manifest.json](retrieval-manifest.json). Text line numbers in the assessment refer to the extracted `E##-text.txt` files. Capture does not establish a browser runtime result.

## E01 — MediaStream Recording

[W3C Working Draft 2026-03-16](https://www.w3.org/TR/2026/WD-mediastream-recording-20260316/) · [raw](E01.html) · [text](E01-text.txt)

Locator: §2.1; §2.3 start, stop, pause/resume, isTypeSupported; §2.4. Inspected surrounding text: [{'start_line': 136, 'end_line': 153}, {'start_line': 225, 'end_line': 243}, {'start_line': 350, 'end_line': 377}, {'start_line': 390, 'end_line': 443}, {'start_line': 444, 'end_line': 503}].

Access: 2026-10-10T05:33:52.975968+00:00 through 2026-10-10T05:33:53.152688+00:00. Raw SHA-256: `b9da30d58668525c133eb92b2f8bd80be62f31a57503f4a870990715dc7427de`.

Applicability: Governs M1 and lifecycle/negotiation/chunk corrections; draft status does not prove runtime adoption.

## E02 — Media Capture and Streams

[W3C Candidate Recommendation Draft 2025-10-09](https://www.w3.org/TR/mediacapture-streams/) · [raw](E02.html) · [text](E02-text.txt)

Locator: §4.2 active stream; §4.3.1 track lifecycle/stop/getSettings; §10 getUserMedia; §11 constraints. Inspected surrounding text: [{'start_line': 391, 'end_line': 399}, {'start_line': 799, 'end_line': 838}, {'start_line': 913, 'end_line': 952}, {'start_line': 1535, 'end_line': 1545}, {'start_line': 2037, 'end_line': 2041}, {'start_line': 3130, 'end_line': 3154}].

Access: 2026-10-10T05:33:52.978327+00:00 through 2026-10-10T05:33:53.486625+00:00. Raw SHA-256: `a5b825c2f691cb776575a25eddf24c78aa43b93d32c5eff1a749fff798383a27`.

Applicability: Governs M1 and permission/cleanup/sample-rate/device corrections; no exact target-runtime observation.

## E03 — Web Audio API 1.1

[W3C Working Draft 2026-09-22](https://www.w3.org/TR/webaudio/) · [raw](E03.html) · [text](E03-text.txt)

Locator: §1.24 MediaStreamAudioSourceNode; §1.32 AudioWorklet; §2.5–2.6 quantum/rendering. Inspected surrounding text: [{'start_line': 6722, 'end_line': 6741}, {'start_line': 8127, 'end_line': 8133}, {'start_line': 8170, 'end_line': 8204}, {'start_line': 8736, 'end_line': 8754}, {'start_line': 9123, 'end_line': 9165}].

Access: 2026-10-10T05:33:52.979858+00:00 through 2026-10-10T05:33:54.075877+00:00. Raw SHA-256: `8dbacf76c5a3f92900a5ff915a53ee7f1ac43a1c10257fc53df541d8e99588f1`.

Applicability: Supports mechanism comparison and units; configurable-quantum runtime support remains feature-dependent.

## E04 — Media Capabilities

[W3C Working Draft 2026-06-09](https://www.w3.org/TR/media-capabilities/) · [raw](E04.html) · [text](E04-text.txt)

Locator: §2.1.3 MediaEncodingType; §2.1.8 AudioConfiguration. Inspected surrounding text: [{'start_line': 168, 'end_line': 180}, {'start_line': 327, 'end_line': 354}].

Access: 2026-10-10T05:33:52.980869+00:00 through 2026-10-10T05:33:53.348585+00:00. Raw SHA-256: `849ad2aae83cb807a908611e6635f59be271e77dc2e9b697f1c296ad3bc62baf`.

Applicability: Supports the proposed query shape without a runtime availability guarantee.

## E05 — New WebKit Features in Safari 14.1

[Safari 14.1; article published 2021-04-29](https://webkit.org/blog/11648/new-webkit-features-in-safari-14-1/) · [raw](E05.html) · [text](E05-text.txt)

Locator: MediaRecorder API; separate WebM Support headings. Inspected surrounding text: [{'start_line': 35, 'end_line': 38}, {'start_line': 73, 'end_line': 78}].

Access: 2026-10-10T05:33:52.981972+00:00 through 2026-10-10T05:33:53.885329+00:00. Raw SHA-256: `ab6077488deebb221e3b6314c4bef560591197bc7484ae3aec4c7be9142c2230`.

Applicability: Direct evidence against blanket Safari denial; no present exact-MIME guarantee.

## E06 — WebKit Features in Safari 18.4

[Safari 18.4; 2025-03-31 article](https://webkit.org/blog/16574/webkit-features-in-safari-18-4/) · [raw](E06.html) · [text](E06-text.txt)

Locator: Media section. Inspected surrounding text: [{'start_line': 130, 'end_line': 145}].

Access: 2026-10-10T05:33:52.983646+00:00 through 2026-10-10T05:33:54.074969+00:00. Raw SHA-256: `6acbe75ab52a20f5ff9a3d94717a18fabc9a154f291c261a5b9e634a9b0b5710`.

Applicability: Justifies bounded format candidates; exact audio-only strings and Ogg recording need runtime qualification.

## E07 — WebKit Features in Safari 26.0

[Safari 26.0; 2025-09-15 article](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/) · [raw](E07.html) · [text](E07-text.txt)

Locator: Media section. Inspected surrounding text: [{'start_line': 285, 'end_line': 293}].

Access: 2026-10-10T05:33:53.152887+00:00 through 2026-10-10T05:33:54.135702+00:00. Raw SHA-256: `ebe0484c74dd22e1597d7d9713daebe2f493e177e8d93f1f4964c93cd8357b01`.

Applicability: Supports the candidate and history, not a guarantee for unspecified current targets.

## E08 — WebKit issue 258567

[Safari 16.4/16.5.1 incident; 266130@main (8c01a9fbfd35), 2023-07-18](https://bugs.webkit.org/show_bug.cgi?id=258567) · [raw](E08.html) · [text](E08-text.txt)

Locator: Comments 4–13; issue status. Inspected surrounding text: [{'start_line': 64, 'end_line': 86}, {'start_line': 127, 'end_line': 151}, {'start_line': 157, 'end_line': 173}].

Access: 2026-10-10T05:33:53.348924+00:00 through 2026-10-10T05:33:54.223458+00:00. Raw SHA-256: `e724b539f162aa2f89cae81e8c9b31dae11c3e27bce1201bf3f7b9cc1c60c02e`.

Applicability: Confirms F3 correction; reporter conditions are not universal causality or branded-release inclusion.

## E09 — WebKit issue 243837

[iPad 8th generation/iOS 15.6; 253529@main (f2967879748b), 2022-08-17](https://bugs.webkit.org/show_bug.cgi?id=243837) · [raw](E09.html) · [text](E09-text.txt)

Locator: Report; comments 2–5. Inspected surrounding text: [{'start_line': 24, 'end_line': 34}, {'start_line': 45, 'end_line': 74}].

Access: 2026-10-10T05:33:53.487279+00:00 through 2026-10-10T05:33:54.154297+00:00. Raw SHA-256: `6f16acea02ea6671456f9f38d3cc71ed49270069f4b9e4268e76ea7f1b02baf6`.

Applicability: Supports bounded final-flush history, not a defect asserted in current desktop microphone capture.

## E10 — Chrome Developers MediaRecorder article

[Historical article last updated 2016-01-30](https://developer.chrome.com/blog/mediarecorder) · [raw](E10.html) · [text](E10-text.txt)

Locator: Support note; Browser support. Inspected surrounding text: [{'start_line': 123, 'end_line': 130}, {'start_line': 206, 'end_line': 216}].

Access: 2026-10-10T05:33:53.885525+00:00 through 2026-10-10T05:33:54.366687+00:00. Raw SHA-256: `88be18ad93f0ffe75f4fbbe2e6948f0235139fdfc368be0edd62d3244b3b546c`.

Applicability: Supports released implementation history; no current exact-format result.

## E11 — Chrome Page Lifecycle API

[Live official documentation retrieved 2026-10-10; Chrome 68 lifecycle additions](https://developer.chrome.com/docs/web-platform/page-lifecycle-api) · [raw](E11.html) · [text](E11-text.txt)

Locator: Frozen state; recommendations. Inspected surrounding text: [{'start_line': 298, 'end_line': 323}, {'start_line': 604, 'end_line': 613}, {'start_line': 775, 'end_line': 780}].

Access: 2026-10-10T05:33:54.075121+00:00 through 2026-10-10T05:33:54.440765+00:00. Raw SHA-256: `12c6884eaec3a2c2f645d1f66a30e74d866d1973cc7c6fe21656323dc850762c`.

Applicability: Supports the qualified timer limitation as an inference, not a browser recording observation.

## E12 — Chromium muxer README

[Commit 042aaa189184e3d303c01946589eb84926d91000](https://chromium.googlesource.com/chromium/src/media/+/042aaa189184e3d303c01946589eb84926d91000/muxers/README.md) · [raw](E12.html) · [text](E12-text.txt)

Locator: README codec list. Inspected surrounding text: [{'start_line': 1, 'end_line': 14}].

Access: 2026-10-10T05:33:54.077258+00:00 through 2026-10-10T05:33:54.444415+00:00. Raw SHA-256: `1a0f6473087a55a7acd8982f670b167f912ba05b1314938c701e5c88f3736b8a`.

Applicability: Implementation-level candidate evidence only.

## E13 — opus-media-recorder upstream README

[Unpinned master at independent retrieval](https://raw.githubusercontent.com/kbumsik/opus-media-recorder/master/README.md) · [raw](E13.txt) · [text](E13-text.txt)

Locator: Architecture, bundler setup, limitations. Inspected surrounding text: [{'start_line': 6, 'end_line': 8}, {'start_line': 80, 'end_line': 99}, {'start_line': 199, 'end_line': 212}].

Access: 2026-10-10T05:33:54.135926+00:00 through 2026-10-10T05:33:54.257244+00:00. Raw SHA-256: `ae8cfd6d308c95933234310b9680d1317a9d2fffb72d81212fded04f1c6a15bc`.

Applicability: Readable upstream cross-check; E16 is the version-bound governing analog.

## E14 — npm registry opus-media-recorder

[Release 0.8.0; gitHead dd2f1d1249f9b7a66678f9833f8c01521eb4a2d9](https://registry.npmjs.org/opus-media-recorder/0.8.0) · [raw](E14.json) · [text](E14-text.txt)

Locator: version, gitHead, repository fields. Inspected surrounding text: [].

Access: 2026-10-10T05:33:54.154384+00:00 through 2026-10-10T05:33:54.367249+00:00. Raw SHA-256: `2c01f36fa7a87a89fdd76bd399285932622dabe52bfa49d3cff941d8bfefe4d3`.

Applicability: Version identity for the optional implementation analog.

## E15 — Apple Safari 17.4 Release Notes structured documentation

[Safari 17.4 (19618.1.15), 2024-03-05](https://developer.apple.com/tutorials/data/documentation/safari-release-notes/safari-17_4-release-notes.json) · [raw](E15.json) · [text](E15-text.txt)

Locator: Media → Resolved Issues; issue 115979604. Inspected surrounding text: [{'start_line': 2135, 'end_line': 2150}].

Access: 2026-10-10T05:33:54.223581+00:00 through 2026-10-10T05:33:54.367520+00:00. Raw SHA-256: `74cda1f52243dd55d643c621b207ce83d6984babaa7b1d62b7e74f6b77509beb`.

Applicability: Corroborates S7 release history only.

## E16 — opus-media-recorder version-bound README

[npm 0.8.0 gitHead dd2f1d1249f9b7a66678f9833f8c01521eb4a2d9](https://raw.githubusercontent.com/kbumsik/opus-media-recorder/dd2f1d1249f9b7a66678f9833f8c01521eb4a2d9/README.md) · [raw](E16.txt) · [text](E16-text.txt)

Locator: Architecture; bundler; MIME and limitations. Inspected surrounding text: [{'start_line': 6, 'end_line': 8}, {'start_line': 80, 'end_line': 99}, {'start_line': 190, 'end_line': 212}].

Access: 2026-10-10T05:36:19.170063+00:00 through 2026-10-10T05:36:19.323290+00:00. Raw SHA-256: `ae8cfd6d308c95933234310b9680d1317a9d2fffb72d81212fded04f1c6a15bc`.

Applicability: Supports useful unfamiliar analog and costs while preserving the stale-table exclusion.

## Original freeze and reviewer receipts

- [Original inspected hashes](original-inspected-hashes.json)
- [Stage/terminal integrity before assessment](freeze-integrity-before.json)
- [Exact original plan sentences](exact-plan-clauses.json)
- [Actual reviewer active Goal observation](reviewer-native-active.json)
- [Web tool standards retrieval](independent-web-standards.json)
- [Web tool targeted cross-check](independent-web-checks.json)


- [Final report/evidence/original-freeze integrity check](final-integrity-check.json)
- [Actual reviewer native Goal completion, after complete judgment save](reviewer-native-completion.json)
