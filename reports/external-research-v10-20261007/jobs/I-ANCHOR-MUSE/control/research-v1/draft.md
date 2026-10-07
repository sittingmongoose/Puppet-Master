# Research draft v1 — Community archive digital preservation (ER10 I-ANCHOR-MUSE, control)

Scope: user-level brief (photos, oral-history audio, scanned documents; originals + derivatives; safe dedup; rights/restricted access; silent-corruption detection; ingest/storage-failure recovery; public browse vs internal preservation) compared against the frozen sandbox plan v1 (directory tree; dedup by filename+size; SQLite metadata; previews beside originals; nightly copy to second disk; filename/notes search catalog; checksums/fixity/recovery/provenance/rights/formats unspecified).

Executed checks: NONE. No code was run, installed, or downloaded for execution; no accounts, purchases, or sockets beyond page retrieval. All behavior claims come from reading the pinned/primary sources in SOURCES.md (S1–S6). Everything under "proposed validation" is a proposal, not a result.

## 1. Findings and proposed changes (each compared to the frozen plan)

F1. Package every ingest as a BagIt bag (S1). Proposed change: replace "files land directly in the tree" with "each accession becomes a complete, valid bag (bagit.txt, data/, manifest-sha512.txt, bag-info.txt, tagmanifest)". Comparison: the frozen plan has no integrity envelope at all; BagIt adds checksums, declared completeness, and a transfer format other tools (Archivematica-style pipelines, S6) already consume. Condition: adopt S1 S5.2–S5.3 rules if fetch.txt is ever used (treat URLs/sizes as untrusted); keep bags local (no fetch holes) for v1.

F2. Fixity scheduling with two tiers (S1, S2). Proposed change: nightly fast presence/size sweep PLUS weekly full checksum re-validation, recorded per run. Comparison: frozen plan has zero corruption detection; the two-tier design bounds nightly cost while guaranteeing eventual full coverage. Condition (from S2/S3): never report the fast tier as "valid" — log it as presence-only, because fast validation by construction skips checksums.

F3. Content-addressed safe dedup (S1, S2). Proposed change: dedup on SHA-256/SHA-512 of byte content (bagit-python's defaults, S2), not filename+size. Comparison: filename+size dedup silently merges distinct files with the same name/size (data loss) and misses identical bytes under different names (waste); content hashing fixes both. Keep one stored copy with back-references from each accession record.

F4. Crash-safe ingest protocol (S4). Proposed change: stage each ingest in a quarantine directory; write metadata row as "incomplete"; fsync; verify bag; then flip the row to "complete" inside a single SQLite transaction and atomically move into the store. Comparison: frozen plan's direct-tree writes + nightly copy can copy half-written files and a mid-transaction database (S4 S9: partial deletions, garbage, broken locking on network shares). Recovery rule: on restart, re-verify quarantine, discard or resume incomplete rows per S4 hot-journal semantics, never auto-promote.

F5. Replica that cannot copy corruption (S4). Proposed change: replace the blind nightly tree copy with verify-then-replicate: re-validate source fixity (or at least completeness+spot fixity) before copying, copy to a versioned snapshot on disk 2, and verify the replica after copy. Comparison: frozen plan copies whatever is there, propagating corruption and interrupted writes to the only backup.

F6. Derivative provenance (S1, S6). Proposed change: record per derivative {source original checksum, tool+version, parameters, date, operator} as tag metadata; store derivatives outside data/ or in a separate access tree. Comparison: frozen "previews beside originals" cannot answer "which original, made how, still current?"; after an original is re-scanned the stale preview is indistinguishable. S6 precedent: preservation and access copies are separate components (Archivematica + AtoM).

F7. Rights and restricted access, three layers (S5). Proposed change: (a) item-level public/private flag; (b) per-media override so a public record can carry restricted originals (S5 mixed-visibility rule); (c) per-field redaction for sensitive notes. Comparison: frozen plan serves everything it catalogs; the brief's sensitive originals require default-private ingest with explicit publication. Conditions: new items default to private; any auto-publish setting is off (S5 site auto-add leak vector); role table distinguishes volunteer add/edit-own from publish/delete-others.

F8. Volunteer-turnover hardening (S5). Proposed change: mandatory owner reassignment before account deletion; no orphaned records. Comparison: frozen plan has no ownership concept; S5 documents the orphan trap (unsearchable, un-batch-editable ownerless items) as a known hazard.

F9. Preservation formats + normalization log (S6). Proposed change: define a small preservation-format policy (e.g. uncompressed/st lossless masters retained; access derivatives normalized) and log every normalization as a preservation event. Comparison: frozen plan keeps bytes but never addresses format obsolescence; S6 shows normalization-with-logging as the affordable middle path between "keep everything" and "migrate blindly".

F10. Catalog over structured metadata, not filenames (S5). Proposed change: search/describe via typed fields (title, creator, date, rights, subject) with linked records. Comparison: filename+notes search breaks on volunteer naming inconsistency (S1 S6.1.2: cross-platform naming pitfalls) and cannot express rights; structured fields also enable "public view hides restricted fields" rendering.

## 2. Materially different mechanisms considered

M-a. BagIt + SQLite registry (recommended, F1–F5): bags are the integrity unit, SQLite the index. Affordable, single-machine, tool-compatible.
M-b. Full OAIS system, Archivematica-style (S6): SIP→AIP→DIP pipeline with appraisal gates and separate access system. Stronger methodology and format policy, but heavier deployment/ops than a volunteer station may sustain; recommended as the migration target, not v1.
M-c. Content-addressed object store (dedup by hash as the storage layout, not just the check): maximal dedup and implicit integrity, but custom tooling and harder volunteer comprehension; recommended only as a later optimization of M-a's dedup table.
M-d. Filesystem-level integrity (checksumming filesystem/scrub): transparent silent-corruption detection, but ties the archive to specific OS/storage and gives no packaging, provenance, or rights story; recommended as a complement (run the store on integrity-capable storage where affordable), never the sole mechanism.
M-e. Cloud object storage with versioning: off-site durability and cheap immutability, but recurring cost, upload bandwidth for audio/video-scale masters, and custody questions for sensitive originals; recommended as an optional encrypted third copy, not the primary replica.

## 3. Component/code behavior (pinned)

bagit-python v1.9.0 (S2): validate() defaults to full fixity recalculation; fast=True checks Payload-Oxum presence/size only; _validate_contents ALWAYS runs the oxum check first, then returns early only if fast; full path continues through completeness to per-file _validate_entries. CLI --fast is documented as skipping corruption detection; main() gates --fast/--completeness-only behind --validate. Tag manifests (v0.97+) are verified, so bag-info.txt tampering is detectable. Relevance: the library directly implements F1/F2/F3, but its fail-early oxum ordering creates the reporting gap in S4.

## 4. Pertinent issue/fix/regression/release chain

bagit-python #177 (open, 2024-05-02) → PR #174 (closed unmerged 2024-09-18) → v1.9.0 (released, "13 Jun", year undisplayed; details in S3).
The reporter's mechanism claim (validation always fast; checksums never checked) was refuted by the maintainer, who pointed to slow-validation test coverage and the intentional always-check-oxum design. The surviving defect is reporting, not coverage: an oxum mismatch raises before per-file checksum results, so operators learn "bag corrupt" without learning which files failed. v1.9.0 ships related validation hardening (#183 pool-completion fix, #162 CLI tests, #140/#154/#184 behavioral fixes) but no #177 reporting fix. Implication for this case: adopt v1.9.0+ for the pool/CLI fixes, but wrap validation so fixity detail is captured even when oxum fails (e.g. catch the oxum error, then run entry-level verification and report both), and pin + re-check the issue before each release upgrade.

## 5. Optional opportunities (not required for v1)

O1. Oral-history extras: per-interview consent/rights form linked as a tag file; chapter/segment metadata for long audio. O2. Fixity audit exports: monthly signed manifest of all checksums for off-site custody proof. O3. Duplicate-bit harvesting: report cross-accession duplicates to prioritize re-description. O4. Format-watch list: annual check of master formats against a public obsolescence registry. O5. Encrypted third copy (M-e) for disaster recovery once F1–F7 are stable.

## 6. Uncertainties (justified, with what would resolve them)

U1. Rights metadata standard: no PREMIS/rights-schema source was retrieved in this round (time ceiling); U-resolve by sourcing PREMIS Data Dictionary or an equivalent rights vocabulary before finalizing F7 field names.
U2. v1.9.0 release year: the release page displays "13 Jun" without a year; U-resolve via the tag's commit date or PyPI metadata (not fetched).
U3. Station hardware/OS: digitization-station platform unknown, so M-d feasibility and S1 S6.1.2 filename rules cannot be finalized; U-resolve from deployment facts.
U4. Collection scale/throughput: full-checksum cadence (F2) and replica windows (F5) need bytes/counts; U-resolve by measuring the pilot ingest.
U5. Sensitivity/legal regime: access tiers (F7) assume generic donor/volunteer sensitivity; statutory regimes (e.g. Indigenous knowledge, biometric voice) would add tiers; U-resolve with archive policy input.

## 7. Source-specific conditions (adoption caveats)

- S1: RFC 8493 is Informational, not Standards-track; follow S3's every-file-in-every-manifest rule for 1.0 bags; never trust fetch.txt sizes/URLs.
- S2: single-file pure-Python library; multiprocess hashing available (processes=N); oxum-masks-details behavior must be wrapped (S4).
- S3: #177 still open at retrieval; PR #174 is NOT a fix to cherry-pick (closed by author as the wrong change); re-check issue state at build time.
- S4: SQLite atomicity covers the .db file only — sidecar/tree writes need the F4 protocol; never copy the live tree as a backup.
- S5: Omeka S behavior cited from the rolling manual (unversioned page); re-verify visibility/role semantics against the deployed Omeka S version; auto-add-to-site defaults to a leak if misconfigured.
- S6: Archivematica is the methodology reference and migration target, not the v1 build; AGPL applies if its code (not just ideas) is reused.

## 8. Proposed validation (all proposals; nothing executed)

V1. Corruption drill: flip bytes in a copy of a payload file and in a tag file; assert full validation fails naming the file, fast tier reports presence-only, and the wrapper still emits per-file detail despite oxum mismatch (covers F2, S4).
V2. Crash drill: kill ingest mid-copy and mid-transaction; assert restart leaves store bags valid, quarantine isolated, and no partial promotion (F4, S4).
V3. Replica drill: corrupt source after snapshot; assert verify-then-replicate refuses to overwrite the good replica and alerts (F5).
V4. Dedup drill: same bytes under different names/paths dedup to one stored copy; different bytes with same name/size do NOT merge (F3).
V5. Rights drill: restricted original under public record is unreachable via public routes (browse, search, direct media URL, API) but reachable to authorized roles; newly ingested items are private by default (F7).
V6. Provenance drill: regenerate a derivative; assert the old derivative is marked stale/superseded with tool/version/parameters recorded (F6).
V7. Volunteer drill: delete a volunteer account only after reassignment; assert zero orphaned records (F8).
