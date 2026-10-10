# Critic source index — A8-01-control

This index records read-only independent verification of the investigator's fixed source IDs. IDs point to the same URLs in the carried [source map](../source-map.json); none were reassigned. Retrieval is research evidence, not executed product validation.

| ID | Primary source | Version / locator | Review use |
|---|---|---|---|
| [S01](#s01-bagit) | [RFC 8493, RFC Editor](https://www.rfc-editor.org/rfc/rfc8493) | v1.0 (2018), §§1.1, 2.1–2.4, 3, 5.4, 6.1 | Bag layout, digest rules, complete/valid, SHA-512, Payload-Oxum, path portability |
| [S02](#s02-ocfl) | [OCFL Specification](https://ocfl.io/1.1.0/spec/) | v1.1.0 (2022), §§3.1, 3.3–3.8, 5.2 | Stable identity, versions, inventories, intended immutability |
| [S03](#s03-ocfl-change-log) | [OCFL v1.1 Change Log](https://ocfl.io/1.1.0/spec/change-log.html) | 7 Oct 2022, changes from v1.0 | Prior-version rules, UTF-8, stable ID and layout clarifications |
| [S04](#s04-path-issue) | [bagit-python issue #51](https://github.com/LibraryOfCongress/bagit-python/issues/51) | Opened 20 Jan 2016, milestone 1.6 | Unicode path mismatch; distinguishes reported destination from Linux reproduction |
| [S05](#s05-fix-commit) | [Commit 16f34b6](https://github.com/LibraryOfCongress/bagit-python/commit/16f34b6) | March 2016 | NFD normalization and regression test |
| [S06](#s06-v160-code) | [bagit-python v1.6.0 code](https://github.com/LibraryOfCongress/bagit-python/blob/v1.6.0/bagit.py) | Tag commit 43fd500 | Release-specific NFC comparison and conflict detection |
| [S07](#s07-v190-release) | [bagit-python v1.9.0 release](https://github.com/LibraryOfCongress/bagit-python/releases/tag/v1.9.0) | Commit 861ddac, 13 Jun 2025 | Unsafe-path check release note |
| [S08](#s08-pr184) | [bagit-python PR #184](https://github.com/LibraryOfCongress/bagit-python/pull/184) | Merged commit 753679c, 13 Jun 2025 | Exact implementation change behind S07 |
| [S09](#s09-premis-pdf) | [PREMIS Data Dictionary v3.0](https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf) | 2015, introduction and fixity passages | Digest limits and event/outcome analogy |
| [S10](#s10-premis-listing) | [PREMIS 3.0 semantic listing](https://www.loc.gov/standards/premis/v3/premis-hierarchical-3-0.html) | Event/Agent units | Human-readable event fields; visible difference from PDF entity count |
| [S11](#s11-git-annex) | [git-annex whereis manual](https://git-annex.branchable.com/git-annex-whereis/) | Rolling page, no version shown | Last-known location is not live remote verification |

Exact URL, version, locator, review time, operation, governing conditions and applicability are in the [source map](../source-map.json).

## Bounded evidence notes

### S01 BagIt

RFC 8493 describes a directly accessible directory layout, at least one payload manifest, separate complete/valid conditions, and SHA-256/SHA-512 support with SHA-512 as a SHOULD default. Payload-Oxum is only an optimization before full checksum validation. The RFC’s interoperability notes explain filesystem/path differences. It does not create a gallery asset registry or an immutability control. See §§1.1, 2.1.3, 2.4, 3, 5.4 and 6.1.

### S02 OCFL

The pinned v1.1.0 specification describes stable object IDs, sequential version directories, digest-backed inventories and intended immutability of existing version directories. It describes rebuildability from the storage root as a design goal. This supports OCFL as a richer object-level history alternative, not as proof of gallery completeness or local recovery.

### S03 OCFL Change Log

The change log identifies v1.1 as a correction/clarification update with backwards-compatible prior-version rules. It specifically notes monotonic specification versioning, UTF-8 inventory, historic manifests, direct-child content directories and stable IDs. This supports the version-specific comparison; release history does not mean a gallery object was repaired.

### S04 Path Issue

Issue #51’s reporter says a Mac-validated bag was copied to an Archivematica transfer server and produced missing/unexpected paths for composed/decomposed accented names; fast validation passed. A later maintainer comment separately describes a Linux reproduction. The reporter does not identify the transfer server as Linux.

### S05 Fix Commit

Commit 16f34b6 added NFD normalization when reading or writing manifest names and a regression test. This is a commit-specific behavior, not a universal normalization requirement or permission to rename gallery files.

### S06 v1.6.0 Code

The v1.6.0 code uses NFC for normalized comparisons and detects normalized-name conflicts. It confirms release-specific comparison behavior; the earlier fix commit used NFD, so the release and commit should not be described as using the same form.

### S07 v1.9.0 Release

The release note lists removal of environment-variable expansion from an unsafe-path check. It documents a narrow implementation change, not a change to BagIt manifest semantics.

### S08 PR #184

The merged PR records removal of expandvars from the implementation’s unsafe-path check. It supports the release note but does not establish unrelated implementation behavior.

### S09 PREMIS PDF

The PREMIS v3.0 PDF says equal digests from the same algorithm at two points indicate no byte change during that interval; it treats the check as an event and says this procedure does not by itself establish object integrity or authenticity. Its data model describes four entities.

### S10 PREMIS Listing

The HTML hierarchical listing says five entities including Intellectual Entities, while the 2015 PDF describes four and discusses Intellectual Entity as an object category. The draft recognizes this difference and claims only an analogy for event/agent fields.

### S11 git-annex

The whereis manual says it reports information last received from remotes and does not contact them to verify current content. This is a possible location-history aid, not an integrity or restore check.
