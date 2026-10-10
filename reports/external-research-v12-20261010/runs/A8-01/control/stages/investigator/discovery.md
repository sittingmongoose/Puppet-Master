# Independent discovery — revision-aware exhibition asset deposits

Stage: investigator / A8-01-control. Discovery was conducted from the complete brief only. This file is frozen by the one-time release helper; do not edit it after release.

## Emerging recommendation

For a small gallery that already stores files on ordinary local disk and an offsite copy, use immutable, versioned deposit directories packaged as BagIt 1.0 for the pilot. Give each logical asset a registrar-assigned stable `asset_id`; assign each accepted deposit/version a separate `version_id`; keep the actual delivered filename/path and SHA-512 per file in the package manifest. A corrected caption becomes a new version associated with the same logical asset, with an explicit `supersedes`/relationship row; retain the prior package. A separate human-readable CSV inventory maps exhibition, asset ID, role (photograph/caption/diagram/catalogue), version, display title, filename, and relationships. This keeps a useful directory and inventory readable without repository software, while the standard manifest supports byte/path checking.

BagIt is a directory-based packaging convention: payload files are directly accessible, the manifest lists payload paths and checksums, and a tag manifest can checksum package metadata. BagIt 1.0 requires SHA-256 and SHA-512 support and recommends SHA-512 as the creator default; the gallery still owns choosing and recording its algorithm policy. `Payload-Oxum` can detect incomplete payloads quickly but is explicitly only an optimization; it cannot replace full per-file digest validation. A complete/valid bag is about its listed contents and digests, not whether the registrar chose the right inventory or whether the offsite copy can be restored. See [S01].

Compare OCFL 1.1 as the stronger versioned-object alternative. It uses a stable object ID, sequential immutable version directories, version states, a digest-to-content-path manifest and self-checksummed inventories; it can retain prior states and deduplicate identical file content across versions. It is attractive if many corrections and object relationships need to be managed systematically, but it has more structure, inventory rules, and validation burden than a few handoff packages. For this pilot, it is a credible second option and a future migration path, not a platform dependency. OCFL 1.1 is filesystem/object-storage oriented and rebuildability is a design goal, but a storage-layout standard alone still does not establish registrar completeness or prove a copy is recoverable. See [S02], [S03].

## Identity, versioning, custody, and readable inventory

A filename is a location label and can change; a digest is a byte-level identifier; neither alone is the logical identity of a photograph/caption or an exhibition relationship. The registrar should issue an opaque stable `asset_id` and control which version is authoritative. For example, a caption correction keeps `asset_id=CAP-042`, makes `version_id=2`, preserves version 1, records a correction date/reason and links v2 to v1. A filename/path change is recorded as a path change/alias, not silently treated as a new identity. Keep path and digest in each deposit's machine-checkable manifest; keep identity, role, exhibition, version, prior-version relation, and human-facing title in a registrar-owned inventory.

Use a small append-only custody/event CSV or text log as an accessible analogue of PREMIS: event ID, UTC time, actor/role, action, object/version/package ID, manifest digest, source/destination copy label, validator/tool and version if used, and success/failure plus exception note. PREMIS 3.0 treats Objects, Events, Rights, and Agents as separate entities; its fixity guidance says the digest comparison indicates whether bytes changed over an interval, while the event and outcome record who/when and what happened. A checksum alone does not identify an author, establish chain of custody, or prove every expected exhibition asset was deposited. A copy record is also not a restore test. See [S09], [S10].

A useful adjacent option is git-annex whereis/log for galleries that later need to track where annexed content is believed to exist. Its own documentation cautions that `whereis` reports last-received remote information and does not contact the remotes to verify present content. That makes it a possible location-history aid, not a replacement for periodic read-only checks and an actual restore rehearsal; it is not needed for this pilot and would add software/repository operations. See [S11].

## Historical evidence and practical impact

A BagIt implementation issue reports a large bag created and locally validated on a Mac, then copied to a Linux transfer server where Unicode diacritics caused apparently missing manifest paths and unexpected filesystem paths. The maintainer traced it to composed versus decomposed Unicode filenames. The issue's fix commit added normalization when reading/writing/comparing paths; v1.6.0 code shows normalization-aware comparison and explicitly detects conflicting normalized names. The current BagIt RFC still warns that OS/filesystem behavior differs for case and Unicode normalization. Thus, ordinary local/offsite copy can preserve file bytes but change a pathname representation or reveal a portability collision; a path-based validator may report absent/unexpected members even when the text looks identical. Keep originals untouched, package a copy, avoid ambiguous names/case-only collisions, test actual paths on the gallery's source and restore filesystems, and investigate every mismatch rather than auto-renaming or rewriting manifests. See [S04]–[S06], [S01].

A separate released `bagit-python` change (v1.9.0, commit `861ddac`) removed environment-variable expansion from an unsafe-path check, with merged PR #184 commit `753679c`. This is a reminder to pin a validator release and qualify its path-safety behavior; it is not a change to BagIt's manifest rules, and the release note alone does not prove every implementation handles every path equivalently. See [S07], [S08].

## Bounded copy/restore proposal

1. Registrar freezes a per-exhibition inventory and explicitly marks it complete/approved; copy selected files from originals to a staging deposit without relocating originals.
2. Assign IDs and version relationships, preserve delivered names (or record an explicit approved mapped name), create a BagIt 1.0 directory with the inventory and payload; generate SHA-512 and tag manifest if the selected implementation supports the chosen profile.
3. Independently run a full validator against the finished local package (not fast Oxum-only mode). Preserve tool name/version, command/configuration, time, outcome, and exceptions. Compare expected inventory coverage and package file list; a valid bag alone is not proof of catalog completeness.
4. Copy the exact package directory tree to the already-existing offsite location. Read back the copied destination; run full digest and path/completeness validation against the original package manifest. Do not update the manifest to match a mismatching copy.
5. In a scheduled small sample or pilot, restore one entire package to a clean temporary destination, verify every listed path and digest, open representative image/PDF/caption files, compare the human inventory, and record elapsed time, errors, and resolved failures. This is a proposed check, not performed. The actual restore demonstrates the copy workflow; it does not guarantee a future restore.

Expected failure handling: a missing manifest path is reported as absent; a new path not listed by the manifest is unexpected; changed names cause both conditions and require registrar review against stable IDs. A digest mismatch means bytes differ; preserve both copies for investigation, do not overwrite originals, and let the registrar decide whether to approve a corrected version. An inventory/manifest mismatch blocks acceptance pending reconciliation. A failed offsite check or restore stays failed until the custodian records a successful retry; do not label a checksum or old remote location record as successful recovery.

## Owner decisions and preserved limits

- Registrar owns the complete exhibition inventory, asset IDs, version assignment, correction meaning, and asset-to-exhibition/version relationships.
- Storage custodian owns exact copy directions, validator/tool qualification, offsite read-back cadence, restore sample and incident handling.
- SHA-512 is the standards-based BagIt default recommendation; SHA-256 remains required support. Owners choose which algorithm(s) to instantiate, compatibility window, and any future upgrade/dual-manifest policy.
- Owners choose package depth: one bag per exhibition/version or one package per logical asset. Recommend one bag per approved exhibition deposit initially to keep handoff and completeness review simple; corrected asset versions can still be individually related within the inventory. If correction-level restore becomes common, reassess OCFL.
- Keep optional human-readable inventory as an authorized option, not a mandatory technical feature. Retain it when registrar can own and reconcile it. Exclude a second full prose catalogue only if it duplicates an authoritative catalogue and owners affirm the CSV crosswalk is usable; do not exclude all human-readable access.
- No originals moved; no new account/platform required; no checksum claimed to prove authorship, provenance, completeness, or backup recoverability; no replacement of the existing offsite copy with an untested system.

## Validation status at discovery

No implementation, package, validator, file-copy, offsite access, restore, local executable, or product behavior test was run. Public source retrieval above is research evidence, not product validation. All copy, path portability, version-link, readable-inventory, digest-mismatch and restore exercises remain proposals / NOT_RUN. The stage's later draft must disposition every numbered plan clause separately after the released plan becomes available.

## Sources

See [sources/index.md](sources/index.md) for the navigable source register and [source-map.json](../source-map.json) for URL, version, locator, access, observed operation, conditions, and applicability.
