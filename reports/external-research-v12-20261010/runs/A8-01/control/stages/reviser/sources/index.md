# Reviser source index — A8-01-control

This index is a navigation aid for the complete proposal in ../final.md. Source IDs S01–S11 are preserved from the investigator register and retain the same URLs. Exact source identity, version/commit, access time, operation, locator, condition and applicability are in [../source-map.json](../source-map.json). Public-source retrieval is research evidence only, not product validation.

| ID | Primary source | Version / locator | Use in proposal |
|---|---|---|---|
| [S01](#s01-bagit) | [RFC 8493, RFC Editor](https://www.rfc-editor.org/rfc/rfc8493) | BagIt v1.0, 2018; §§1–3, 5.4, 6.1 | Directory package, manifests, complete/valid, hash defaults, Payload-Oxum, path portability; BagIt does not enforce retention immutability |
| [S02](#s02-ocfl) | [OCFL specification](https://ocfl.io/1.1.0/spec/) | v1.1.0, 2022; §§3.1, 3.3–3.8, 5.2 | Stable object ID, version directories, inventories, intended version immutability |
| [S03](#s03-ocfl-change-log) | [OCFL v1.1 change log](https://ocfl.io/1.1.0/spec/change-log.html) | 7 October 2022; changes from v1.0 | Version-directory, UTF-8 inventory and stable-ID clarifications |
| [S04](#s04-issue-51) | [bagit-python issue #51](https://github.com/LibraryOfCongress/bagit-python/issues/51) | Opened 20 January 2016; milestone 1.6; issue body and comments | Unicode path mismatch report and correction of the destination-OS claim |
| [S05](#s05-commit-16f34b6) | [Commit 16f34b6](https://github.com/LibraryOfCongress/bagit-python/commit/16f34b6) | March 2016; commit and test diff | NFD normalization fix and regression test |
| [S06](#s06-v160-code) | [bagit-python v1.6.0 source](https://github.com/LibraryOfCongress/bagit-python/blob/v1.6.0/bagit.py) | Tag commit 43fd500; path comparison and normalization helpers | Release-specific NFC comparison and conflict handling |
| [S07](#s07-v190-release) | [bagit-python v1.9.0 release](https://github.com/LibraryOfCongress/bagit-python/releases/tag/v1.9.0) | Commit 861ddac, 13 June 2025; release notes | Narrow unsafe-path check release change |
| [S08](#s08-pr184) | [bagit-python PR #184](https://github.com/LibraryOfCongress/bagit-python/pull/184) | Merged commit 753679c, 13 June 2025 | Implementation change behind S07 |
| [S09](#s09-premis-pdf) | [PREMIS Data Dictionary v3.0](https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf) | 2015; introduction and fixity sections | Digest interval limits and event/outcome analogy |
| [S10](#s10-premis-listing) | [PREMIS v3.0 semantic-unit listing](https://www.loc.gov/standards/premis/v3/premis-hierarchical-3-0.html) | Event/Agent fields | Human-readable event fields; entity-count phrasing differs from the PDF |
| [S11](#s11-git-annex) | [git-annex whereis manual](https://git-annex.branchable.com/git-annex-whereis/) | Rolling page; no version stated | Last-known location is not live remote verification |

Reviser stage direct rechecks: S01–S06 were opened/searched read-only at 2026-10-10T04:38:58Z. S07–S11 retain the exact predecessor access records; they were not re-opened in this stage.

## Bounded evidence notes

### S01 BagIt

RFC 8493 describes BagIt as a hierarchical filesystem layout for storage/transfer and leaves payload files directly accessible. Each payload manifest must list each payload file exactly once. BagIt “complete” and “valid” refer to package elements and manifest-listed files; gallery completeness still depends on the registrar’s expected inventory. SHA-256 and SHA-512 support is required for v1.0 tools; SHA-512 as creation default is a SHOULD. Payload-Oxum is a quick incomplete-bag check, not a substitute for full checksum validation. The RFC’s portability discussion covers Unicode normalization and filesystem/path differences. It does not define custodian write-protection or retention immutability.

### S02/S03 OCFL

The pinned v1.1 specification describes stable object IDs, ordered version directories and inventories mapping digests to paths. Existing version directories are intended not to change when a later version is added. The v1.1 change log describes corrections and clarifications, including prior-version rules and UTF-8 inventory. This supports OCFL as a more structured transparent alternative, not a guarantee that a particular gallery copy or restore works.

### S04 Issue #51

The issue reporter describes a bag validated on a Mac and copied to an Archivematica transfer server, where path warnings appeared for accented filenames. The reporter does not identify the server as Linux. Later comments separately describe an OS X/Linux test and platform/filesystem differences in Unicode normalization. The issue is evidence of a reported path-handling problem, not proof that the gallery has the same condition.

### S05/S06 Released path behavior

Commit 16f34b6 applies NFD normalization when reading/writing manifest names and adds a regression test. The v1.6.0 source uses NFC normalization-aware comparison and detects names that normalize to the same value. These are different release-specific observations; do not describe the commit and release as using the same normalization form or as setting a universal BagIt rule.

### S07/S08 Later unsafe-path history

The v1.9.0 release note and merged PR #184 document removal of environment-variable expansion from an unsafe-path check. This changes an implementation path-safety check, not BagIt manifest semantics. The source register carries the prior read-only retrieval record; the reviser did not reopen these pages.

### S09/S10 Custody and fixity

PREMIS 3.0 says the same algorithm producing equal digests at two points indicates no byte change during that interval and describes the fixity check as an Event with an outcome. It does not make the digest proof of authorship or authenticity. The v3.0 PDF and current HTML listing differ in entity-count phrasing; the proposal uses only Event/Agent field concepts and makes no PREMIS conformance claim. These records were carried from the predecessor register, not reopened in this stage.

### S11 Optional location history

The git-annex whereis manual says it reports remote location information last received and does not contact remotes to verify present content. It can be a future location-history aid, not copy verification or restore evidence. This source was carried from the predecessor register, not reopened in this stage.
