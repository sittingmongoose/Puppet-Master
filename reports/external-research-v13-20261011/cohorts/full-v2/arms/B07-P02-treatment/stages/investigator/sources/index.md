# Source index

Read-only evidence gathered from the released brief, without consulting the withheld plan. Full identity, access UTC, locator, operation, scope/condition, and applicability are recorded by stable ID in [source-map.json](../source-map.json).

| ID | Source | Use |
|---|---|---|
| BRIEF-01 | [Exact assigned brief](ER13_RUNTIME/mechanics/dispatch-v1/admitted/B07-P02-treatment/run/B07-P02-treatment/inputs/brief.md) | Scope and constraints |
| MEDIA-01 | [W3C Media Fragments 1.0](https://www.w3.org/TR/media-frags/) | Half-open media intervals and seconds |
| ANNOT-01 | [W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/) | Annotation target/body, temporal and transcript selectors; no transport protocol |
| HTML-01 | [WHATWG HTML media standard](https://html.spec.whatwg.org/multipage/media.html) | Seconds, duration, seekable ranges, async/clamped seeking |
| WAI-01 | [WAI-ARIA APG Slider Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) | Keyboard operation and accessible time values |
| WS-CODE-01 | [WaveSurfer.js 8.0.2 Regions source](https://raw.githubusercontent.com/katspaugh/wavesurfer.js/8.0.2/src/plugins/regions.ts) | Region seconds, defaults, pointer/mouse handlers |
| WS-README-01 | [WaveSurfer.js 8.0.2 README](https://raw.githubusercontent.com/katspaugh/wavesurfer.js/8.0.2/README.md) | Large-file, VBR and stereo caveats; upstream test approach |
| WS-TEST-01 | [WaveSurfer.js 8.0.2 Regions Cypress tests](https://raw.githubusercontent.com/katspaugh/wavesurfer.js/8.0.2/cypress/e2e/regions.cy.js) | Existing pointer interaction/marker/stereo assertions; inspected, not run |
| WS-ISSUE-01 | [WaveSurfer discussion #2737](https://github.com/katspaugh/wavesurfer.js/discussions/2737) | Historical long-file playhead mismatch report (6.6.1) |
| PEAKS-API-01 | [Peaks.js 3.4.2 API](https://raw.githubusercontent.com/bbc/peaks.js/v3.4.2/doc/API.md) | Local peaks/custom player/multichannel/keyboard option |
| PEAKS-STATE-01 | [Peaks.js releases](https://github.com/bbc/peaks.js/releases), [repository](https://github.com/bbc/peaks.js) | Stable vs beta version; development moved to Codeberg |
| PEAKS-TEST-01 | [Peaks.js 3.4.2 package manifest](https://raw.githubusercontent.com/bbc/peaks.js/v3.4.2/package.json) | Karma test harness; tests not run |
| PEAKS-ISSUE-01 | [Peaks.js issue #573](https://github.com/bbc/peaks.js/issues/573) | Reported custom-seek waveform/audio mismatch |
| AUD-LABEL-01 | [Audacity label import/export manual](https://manual.audacityteam.org/man/importing_and_exporting_labels.html) | Tab-separated seconds/text export; multi-track default |
| AUD-KBD-01 | [Audacity keyboard shortcuts](https://github.com/audacity/audacity-support/blob/main/basics/keyboard-shortcuts.md) | Keyboard mark-in/out and accessible label table |
| AUD-ISSUE-01 | [Audacity issue #5690](https://github.com/audacity/audacity/issues/5690) | Historical selection/export regression report |
| ELAN-UI-01 | [ELAN time-boundary editing manual](https://www.mpi.nl/tools/elan/docs/manual/Sec_Changing_the_boundaries_of_an_existing_selection_and_annotation.html), [transcription mode](https://www.mpi.nl/tools/elan/docs/manual/Sec_TM_Entering_Annotation.html) | Exact typed bounds and annotation navigation |
| EAF-SPEC-01 | [EAF Annotation Format 3.0](https://www.mpi.nl/tools/elan/EAF_Annotation_Format_3.0_and_ELAN.pdf) | Tier and time-slot constraints |
