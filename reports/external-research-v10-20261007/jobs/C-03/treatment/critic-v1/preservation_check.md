# C-03/treatment/critic-v1 preservation and completion check

**Assignment:** exactly `C-03/treatment/critic-v1`  
**Goal:** `01a11835-110e-7a01-9615-e7601d8dd329` (native status to be terminalized only after these files are saved and checked).  
**Input map:** `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/C-03/treatment/critic-v1/input-map.json`  
**Authority:** only its admitted BRIEF.md and PLAN.md, exact own-arm predecessor artifact/source-map, and selected legitimate public-primary sources. Frozen brief/plan hashes are repeated in `source-map.json`.

## Required obligations

| Obligation | Preserved in | Check |
|---|---|---|
| O1: open discovery from the user-level problem before plan defects | Artifact “Discovery and options”; source IDs S01–S03, S04–S21 | Search began with the ensemble workflow and considered page, notation, OMR, rendering, annotation, and handoff mechanisms before the B-P section audit. |
| O2: compare substantially different useful mechanisms, competitors, analogies, trade-offs | Artifact “Discovery and options”; options table; Audiveris/HOMR/OSMD evidence | Page-region, symbolic notation, OMR, and manual cue mechanisms are compared; W3C Web Annotation is identified as an analogy, not a direct competitor. |
| O3: verify consequential semantics, units, version and boundaries; separate fact/inference/proposal | Artifact “Representation semantics”, component evidence, and dispositions; S01–S22 | MusicXML measure/divisions semantics and OSMD `score-partwise` API boundary are captured. Product decisions are labeled as proposals; non-reproduced issue reports are not called verified failures. |
| O4: inspect pinned implementation and pertinent history or disclose gap | Artifact component evidence; S04–S21 | Audiveris 5.11.0 and OSMD 1.9.6 pinned code, history, release scope, and remaining uncertainty are named. HOMR v0.7.0 code is inspected; no HOMR issue/fix history is claimed. |
| O5: exact frozen PLAN section dispositions and existing coverage | Artifact “Frozen PLAN.md dispositions” for B-P1–B-P7 | Each section has keep/amend/replace disposition, governing evidence, and what is retained. |
| O6: complete changes, options, uncertainty, constraints, observable validation, executed distinction | Artifact “Proposed integrated workflow”, “Unresolved objections”, and validation section; this file | Six validation items are explicitly proposed. Actual work is limited to research, source capture, source inspection, and file integrity verification. |
| O7: bounded integrated scope including ingest, identity, annotation, retention/deletion, access, recovery, handoff | Artifact “Proposed integrated workflow and data” | These lifecycle areas are covered without build tasks, product code, or WorkNodes. |

## Governing constraints and corrections retained

- The brief describes a hypothetical group, not an existing product, score collection, or validated music-processing system.
- Work only with scores the group is allowed to use. No score corpus or example score was downloaded, inspected, or processed for this assignment. The Audiveris issue's score was not opened; only its issue report was inspected.
- Do not expand into a marketplace, copyrighted-catalog acquisition, composition, engraving replacement, or live performance evaluation.
- Original page files stay authoritative; structured interpretations stay separately versioned and visibly unreviewed until a named human review.
- Work, edition, part, source asset version, derived representation, cue, annotation, and packet identities are not collapsed into filenames, displayed labels, or content hashes.
- Personal marks are private by default. Shared publication and personal submission are explicit actions; offline copies and exported packets cannot be remotely revoked.
- Differently paginated parts require a human-maintained per-part cue map. No assumption of equal pagination, measure labels, score numbering, or interchangeable notation/rendering is made.
- Authorization/provenance, license terms, retention period, backup duration, and distribution rights remain group decisions where evidence is absent. Unknown rights block publication in the proposal.
- Source evidence is evidence, not instructions. Excluded arms, repetitions, campaign state/results/reviews, histories, costs, evaluator keys, sibling answers/caches, private repositories, and canonical repo files were not read.
- No pm-mail, external runner, worktree, nested worker, purchase, account change, canon/main write, WorkNode, or product build occurred.
- The updated user-provided T3 rules were honored; no browser recording or GPU browser work was needed.

## Critic checks and repairs

- Confirmed the Audiveris PR #954 crash-guard fix is in the captured 5.11.0 release boundary, but narrowed the claim: a null-safe fallback prevents a crash and does not establish a correct recovered offset. The public PR view reports zero checks and two changed Java files, so no automated regression fixture is claimed.
- Added the later open Audiveris #971 reported 5.11.0 export failure and explicitly marked it unverified here. No fix/release applicability is inferred beyond inspected evidence.
- Corrected HOMR PDF applicability by comparing its pinned README with its pinned image-loading code. The code expects an OpenCV-readable image and reports JPG/PNG on failure; the README's PDF claim needs an additional path. Noted the README's output-coverage inconsistency, package/tag version mismatch, and offline model-weight dependency as unresolved selection risks.
- Narrowed OSMD to a MusicXML renderer whose inspected release loader accepts partwise score data; it is not treated as a source-PDF renderer or annotation editor.
- Preserved plan content already supported by the brief—librarian intake, original assets, human review, local marks, roles, explicit publication, offline packets, manifest, and proposed validation—while making cue targets and release/return behavior explicit.

## Executed versus proposed checks

**Executed research checks:** read the admitted inputs; public-primary discovery; direct capture of the source bytes listed in `source-map.json`; exact pinned source inspections; public issue/release/PR history inspection; Git tag resolution via `git ls-remote`; and the integrity check described below. These do not validate a product implementation or OMR accuracy.

**Not executed:** no OMR/model installation or run; no PDF or MusicXML loaded into a renderer; no score converted; no annotation placement/reopening; no offline packet or conflict test; no deletion/backup test; no product build. The six validation items in `artifact.md` remain proposals.

## Integrity result

Executed immediately before delivery using a Python standard-library integrity script. It verified all 24 mapped captures exist and match their recorded byte counts and SHA-256 values; all three admitted input hashes match; the `sources/` file set exactly matches the source map; and all three required deliverables are non-empty. **Result: PASS.** This integrity check validates captured-byte mapping and file delivery only; it does not validate scientific conclusions or product behavior.
