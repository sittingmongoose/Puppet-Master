# Investigator source index

Read-only source evidence collected from the brief-defined research question. No gallery package or product was operated. IDs are stable and correspond to `../source-map.json`; do not reuse an ID for another source. These short notes paraphrase bounded passages, with primary URLs and locators for verification.

| ID | Source | Version / locator | Relevance |
|---|---|---|---|
| [S01](#s01-bagit) | IETF RFC Editor, BagIt | RFC 8493 v1.0 (2018), §§1–3, 5–6.1.1 | Directory packaging, manifests, completeness, hash defaults, path portability |
| [S02](#s02-ocfl) | OCFL specification | v1.1.0 (2022), §§3.1–3.8, 5 | Stable object identity, immutable versions, digest-backed inventory, logs |
| [S03](#s03-ocfl-change-log) | OCFL change log | v1.1 (2022), changes from 1.0 | Version history, immutability, UTF-8/path/id clarifications |
| [S04](#s04-unicode-path-issue) | bagit-python issue #51 | 2016; milestone 1.6 | Unicode pathname mismatch after cross-system copy |
| [S05](#s05-fix-commit) | bagit-python fix commit | `16f34b6` (2016) | Normalization fix and regression test |
| [S06](#s06-released-code) | bagit-python released code | v1.6.0, tag commit `43fd500` | Normalized comparison and conflict detection |
| [S07](#s07-recent-release) | bagit-python release | v1.9.0, `861ddac` (2025) | Recent unsafe-path check change |
| [S08](#s08-merged-path-fix) | bagit-python merged PR #184 | merged commit `753679c` (2025) | Path check implementation history |
| [S09](#s09-premis-data-dictionary) | Library of Congress PREMIS Data Dictionary | v3.0 (2015), Introduction and §1.5.2 | Fixity limits; event/outcome model |
| [S10](#s10-premis-fields) | Library of Congress PREMIS semantic listing | v3.0, Event and Agent units | Human-readable custody/event log fields |
| [S11](#s11-git-annex-location-report) | git-annex project manual | Page does not state a release version | Optional copy-location history and its stale-information limitation |

Exact access time, operation, governing condition/default/exception and applicability for each record are in [`../source-map.json`](../source-map.json). The locators below identify the inspected passages; the live release pages remain primary evidence. Source retrieval is research only, not executed product validation.

## Evidence notes

### S01 — BagIt

[Official RFC 8493](https://www.rfc-editor.org/rfc/rfc8493), v1.0 (October 2018), §§1.1, 2.1.2–2.1.3, 2.2.1–2.2.2, 2.4, 3, 5, 6.1.1. BagIt defines a directory with directly accessible payload files and tag files. Each v1.0 payload manifest must list every payload file once; a valid bag also needs every listed digest to match. The RFC says SHA-256/SHA-512 support is required for v1.0 tools and says SHA-512 should be the creator default. `Payload-Oxum` is an optimization and cannot replace checksum validation. The RFC distinguishes completeness/validity, describes integrity rather than active-attack security, and warns that filesystems/utilities differ in case, Unicode normalization and path handling. It recommends discouraging case-only collisions, preventing normalization-form collisions, tolerating equivalent normalization when comparing, and using `/` in manifest paths. Applicability: a readable package and manifest for copied exhibition deposits; registrar still owns whether the set is complete.

### S02 — OCFL

[Official OCFL v1.1.0 spec](https://ocfl.io/1.1.0/spec/), §§3.1, 3.3–3.8, 5.2. The object identifier stays stable across versions; versions use a continuous sequence of `v1`, `v2`, etc. and existing version directories are intended to be immutable. The inventory maps content digests to paths and records version state/head; every inventory has a digest sidecar. Per-version inventory and a logs directory have specified optional/recommended behavior. Applicability: richer filesystem/object-storage version history without a required hosted platform, with more conventions than a small package deposit.

### S03 — OCFL version history

[Official v1.1 change log](https://ocfl.io/1.1.0/spec/change-log.html), dated 7 October 2022. The release is described as correction/clarification plus backward-compatible rules for earlier versions. Changes include prior-version immutability and monotonic spec version declarations (issue #544), UTF-8 inventory, direct-child content directory, and stable object ID clarifications. Applicability: use the released spec/version and validate old version directories; do not assume release history repairs local objects automatically.

### S04 — reported Unicode path mismatch

[Library of Congress bagit-python issue #51](https://github.com/LibraryOfCongress/bagit-python/issues/51), opened 20 January 2016, milestone 1.6. The report describes a large bag created/validated on a Mac and copied to a transfer server, where accented filenames generated “in manifest but not found” and “on filesystem but is not in manifest” warnings. Discussion identifies composed versus decomposed Unicode paths; fast Payload-Oxum succeeding did not establish successful full path validation. Applicability: ordinary cross-platform copy can create path portability concerns or apparent path mismatches; preserve the exact path and investigate rather than accept fast size checks.

### S05 — normalization fix

[Commit `16f34b6`](https://github.com/LibraryOfCongress/bagit-python/commit/16f34b6), “Apply Unicode NFD normalization to filenames.” The change normalizes filenames when reading/writing manifests and includes a regression test that changes a name between composed/decomposed forms. Applicability: a released implementation fix for the issue, not a universal rule to rewrite gallery filenames.

### S06 — released implementation behavior

[bagit-python v1.6.0 source](https://github.com/LibraryOfCongress/bagit-python/blob/v1.6.0/bagit.py), release tag commit `43fd500`, `compare_manifests_with_fs` and normalization helpers. The tagged code compares normalized manifest and filesystem names and detects two filenames that normalize to the same value. Applicability: confirms a release-specific mitigation and that normalization collisions remain an error case.

### S07/S08 — later unsafe-path history

[bagit-python v1.9.0 release](https://github.com/LibraryOfCongress/bagit-python/releases/tag/v1.9.0), tag commit `861ddac`, lists removal of environment-variable expansion from an unsafe-path check (#184). The [merged PR](https://github.com/LibraryOfCongress/bagit-python/pull/184) records merge commit `753679c` on 13 June 2025. This changes implementation path-safety behavior, not BagIt manifest semantics. Applicability: qualify/pin the validator release; do not infer gallery behavior from a format name alone.

### S09/S10 — custody/fixity model

[Library of Congress PREMIS 3.0](https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf), introduction and §1.5.2, and the [semantic unit listing](https://www.loc.gov/standards/premis/v3/premis-hierarchical-3-0.html), Event/Agent entities. PREMIS v3.0 PDF §1.5.2 says a digest comparison can show whether bytes changed during an interval; the fixity act/date is an event and its result an event outcome. The same PDF says this does not establish integrity or authenticity. The current HTML semantic listing describes five entities including Intellectual Entity, while the 2015 v3.0 PDF data model describes four; this proposal uses only the shared Event/Agent field concepts and makes no conformance claim. Applicability: borrow simple object/event/agent/time/outcome fields for a readable local log, without claiming the CSV is PREMIS conformant or deploying a repository.

### S11 — optional location-history mechanism

[git-annex `whereis` manual](https://git-annex.branchable.com/git-annex-whereis/), DESCRIPTION. The page explicitly says the command reports last-received remote location information and does not contact remotes to verify current content. It can be a future location-history aid, not a restore check. Applicability: not needed for the pilot; if adopted later, pair it with read-back digest validation and an actual restore rehearsal.
