# Reviser source index

This index preserves the investigator and critic source IDs and points to the reviser's independent primary-document checks. Full identity and access records, including inherited records, UTC access times, locators, operations, conditions, and applicability, are in [source-map.json](../source-map.json). Rechecks do not silently replace predecessor records.

| ID | Source identity | Reviser use |
|---|---|---|
| BRIEF-01 | BRIEF-01 (ER13_RUNTIME/mechanics/dispatch-v1/admitted/B07-P02-treatment/run/B07-P02-treatment/inputs/brief.md) | Exact product scope and constraints |
| MEDIA-01 | [Media Fragments URI 1.0 (basic)](https://www.w3.org/TR/media-frags/) | Half-open NPT interval convention; millisecond-form limit |
| ANNOT-01 | [Web Annotation Data Model](https://www.w3.org/TR/annotation-model/) | Optional annotation selectors and no transport prescription |
| HTML-01 | [HTML Standard: media elements](https://html.spec.whatwg.org/multipage/media.html) | Time origin, duration, seekable ranges, asynchronous and approximate seeking |
| WAI-01 | [WAI-ARIA Authoring Practices Guide: Slider Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) | Optional slider keyboard pattern and AT test warning |
| WS-CODE-01 | [WaveSurfer.js Regions plugin source](https://raw.githubusercontent.com/katspaugh/wavesurfer.js/8.0.2/src/plugins/regions.ts) | Pinned WaveSurfer region behavior |
| WS-README-01 | [WaveSurfer.js 8.0.2 README](https://raw.githubusercontent.com/katspaugh/wavesurfer.js/8.0.2/README.md) | Long-file memory, VBR, and stereo caveats |
| WS-TEST-01 | [WaveSurfer.js Regions plugin Cypress tests](https://raw.githubusercontent.com/katspaugh/wavesurfer.js/8.0.2/cypress/e2e/regions.cy.js) | Pinned upstream test coverage boundary |
| WS-ISSUE-01 | [WaveSurfer discussion #2737: playhead out of sync on long audio](https://github.com/katspaugh/wavesurfer.js/discussions/2737) | Historical long-file mismatch report, version bounded |
| PEAKS-API-01 | [Peaks.js API documentation](https://raw.githubusercontent.com/bbc/peaks.js/v3.4.2/doc/API.md) | Pinned API, local peaks, custom player, keyboard defaults |
| PEAKS-STATE-01 | [Peaks.js releases and repository README](https://github.com/bbc/peaks.js/releases) | Release/prerelease and upstream status snapshot |
| PEAKS-TEST-01 | [Peaks.js 3.4.2 package manifest](https://raw.githubusercontent.com/bbc/peaks.js/v3.4.2/package.json) | Upstream harness existence only; not run |
| PEAKS-ISSUE-01 | [Peaks.js issue #573: waveform/audio mismatch after seek](https://github.com/bbc/peaks.js/issues/573) | Historical custom-seek report |
| AUD-LABEL-01 | [Audacity Manual: Importing and Exporting Labels](https://manual.audacityteam.org/man/importing_and_exporting_labels.html) | Human-readable export precedent |
| AUD-KBD-01 | [Audacity Support: keyboard shortcuts](https://github.com/audacity/audacity-support/blob/main/basics/keyboard-shortcuts.md) | Keyboard labeling precedent |
| AUD-ISSUE-01 | [Audacity issue #5690: label export selection/regression report](https://github.com/audacity/audacity/issues/5690) | Historical export regression report |
| ELAN-UI-01 | [ELAN manual: changing boundaries and entering annotations](https://www.mpi.nl/tools/elan/docs/manual/Sec_Changing_the_boundaries_of_an_existing_selection_and_annotation.html) | Original supplied boundary URL; unavailable; identity preserved |
| EAF-SPEC-01 | [ELAN Annotation Format 3.0 and ELAN](https://www.mpi.nl/tools/elan/EAF_Annotation_Format_3.0_and_ELAN.pdf) | ELAN tier/time-slot comparison; direct PDF access limitation |
| ELAN-UI-02 | [ELAN manual: Changing the boundaries of an existing selection and annotation (recovered official URL)](https://www.mpi.nl/tools/elan/docs/manual/Sec_Changing_the_boundaries_of_an_existing_selection.html) | Recovered official typed-time/tier guidance; separate source ID |

Reviser rechecks were direct opens at the URLs shown in the complete source map. They confirmed the time-boundary/seeking/accessibility claims stated in final.md. Source operation and applicability remain limited to each source's recorded condition.
