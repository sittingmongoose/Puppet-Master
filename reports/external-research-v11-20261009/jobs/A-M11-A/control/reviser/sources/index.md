# Evidence index — reviser stage, A-M11-A control (case S11, method M11)

Navigable index of the source evidence available to and produced by the reviser stage.

## Convention for this stage's sources/ directory

The reviser inherited 11 captured + 2 access-failed sources (S01–S13) from the research stage and re-verified the consequential ones locally. Bounded captures are **not duplicated** into this directory: the single authoritative copy of each inherited capture lives under `../research/sources/` (duplicating would create divergence risk), and the critic stage performed local reads only (its declared evidence roots contain no captures; see `../critic/source-map.json` conventions). This directory holds the reviser stage's **own new bounded evidence** and this index.

## This stage's new evidence

- [S12-reviser-reattempt.md](S12-reviser-reattempt.md) — bounded record of the reviser's one permitted re-access of the failed BBC Subtitle Guidelines source (WebFetch, 2026-10-09T21:01Z, HTTP 404 again). Required by adjudication of critique finding m7 and by the arm's drift policy (explicit drift note, no silent update).

## Inherited captures (authoritative copies in ../research/sources/)

| ID | Title | Kind | Status | File (under ../research/sources/) |
|---|---|---|---|---|
| S01 | W3C WebVTT: The Web Video Text Tracks Format (CR Draft, 20 May 2026) | spec | captured | S01-webvtt-spec.md |
| S02 | W3C WAI: Making Audio and Video Media Accessible | guidance | captured | S02-wai-media-av.md |
| S03 | Video.js accessibility concept docs | product-docs | captured | S03-videojs-accessibility-docs.md |
| S04 | video.js issue #2746 "Accessibility of the Captions Settings dialog" | issue-chain | captured (unregistered-mirror gap noted) | S04-videojs-issue-2746.md |
| S05 | video.js GitHub releases (v10.0.1 stable, 2026-10-02) | release-feed | captured | S05-videojs-releases.md |
| S06 | WCAG 2.2 Understanding SC 1.2.2 Captions (Prerecorded) | governing-requirement | captured | S06-wcag-122-captions.md |
| S07 | WCAG 2.2 Understanding SC 1.2.5 Audio Description (Prerecorded) | governing-requirement | captured | S07-wcag-125-audio-description.md |
| S08 | MDN WebVTT API (last modified 2026-02-11) | reference-docs | captured | S08-mdn-webvtt-api.md |
| S09 | Subtitle Edit GitHub releases (betas only; no stable evidenced) | release-feed | captured | S09-subtitle-edit-releases.md |
| S10 | W3C WAI Evaluating Web Accessibility Overview | guidance | captured | S10-wai-test-evaluate.md |
| S11 | Plyr README (sampotts/plyr, v3.8.5, deprecated → Video.js 10) | product-repo | captured | S11-plyr.md |
| S12 | BBC Subtitle Guidelines | style-guidance | access-failed (×2 research + ×1 reviser) | S12-bbc-subtitle-guidelines.md |
| S13 | Amara captioning/translation platform | product-page | access-failed | S13-amara.md |

## Cross-references

- Full lineage (exact URLs, versions/commits, access windows, operations): `../research/source-map.json` (fetch authority) and `../critic/source-map.json` (critic local-inspection record, includes the S04 drift note for the unregistered v7.2.x changelog mirror).
- This stage's own access and inspection record: `../source-map.json` (reviser).
- How each source was used and every criticism adjudicated against it: `../adjudication.md`; the consolidated deliverable: `../final.md`.
