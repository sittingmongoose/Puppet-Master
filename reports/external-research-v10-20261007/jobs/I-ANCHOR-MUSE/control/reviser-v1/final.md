# Final v1 — Community archive digital preservation (ER10 I-ANCHOR-MUSE, control)

Scope: user-level brief (photographs, oral-history audio, scanned documents; originals + derivatives;
safe dedup; rights/restricted access; silent-corruption detection; ingest/storage-failure recovery;
public browse vs internal preservation) compared against the frozen sandbox plan v1 (directory tree;
dedup by filename+size; SQLite metadata; previews beside originals; nightly copy to second disk;
filename/notes search catalog; checksums/fixity/recovery/provenance/rights/formats unspecified).

Executed checks: NONE. No code was run, installed, or downloaded for execution; no accounts,
purchases, or sockets beyond page/API retrieval. All behavior claims come from reading the primary
sources in SOURCES.md (S1–S6, C1–C6, R1–R4). Everything under "proposed validation" is a proposal,
not a result.

Obligation-map coverage (brief's integrated obligations):

| # | Obligation | Where satisfied |
|---|-----------|-----------------|
| O1 | Real primary public-source selection from the brief | S1–S6 (researcher) + C1–C6 (critic verification) + R1–R4 (reviser re-check); selection notes in each SOURCES.md |
| O2 | Compare materially different mechanisms + useful alternatives | §2 M-a..M-e; unsourced reasoning explicitly labeled (M-c/M-d/M-e) |
| O3 | Inspect actual component/code behavior at a pinned version | §3 bagit-python v1.9.0 (2025-06-13), line-level behavior |
| O4 | Pertinent issue/fix/regression + release applicability, or equivalent history | §4 #177 → PR #174 → v1.9.0 chain with applicability judgment |
| O5 | Compare every relevant discovery against the frozen plan | F1–F10 each carry a Comparison paragraph; §9 cross-check table |
| O6 | Preserve supported corrections, product choices, covered dispositions, optional leads, justified uncertainties, useful validations | F1–F10, M dispositions, O1–O5, U1/U3/U4/U5 (+U2 resolved), V1–V8 |
| O7 | Complete same-family criticism and final proposal | Critic-v1 critique (required predecessor) + this final proposal |
| O8 | Distinguish executed checks from proposals | "Executed checks: NONE" header above; §8 labeled proposals |

Conventions: [sourced] = directly supported by the cited source. [design proposal/synthesis] =
reviser/researcher reasoning built on a sourced premise; sound but unsourced as a prescription.
Source IDs: S = research-v1, C = critic-v1, R = reviser-v1 (this stage). No ID was rebound.

## 1. Findings and proposed changes (each compared to the frozen plan)

F1. Package every ingest as a BagIt bag (S1/C2/R1) [sourced envelope; policy choices labeled].
Proposed change: replace "files land directly in the tree" with "each accession becomes a complete,
valid bag (required: bagit.txt, data/, manifest; adopted by policy: dual manifests
manifest-sha256.txt + manifest-sha512.txt, bag-info.txt + tagmanifest coverage)". Comparison: the
frozen plan has no integrity envelope at all; BagIt adds checksums, declared completeness, and a
standard transfer/packaging format. Conditions: adopt R1 S5.2–S5.3 rules if fetch.txt is ever used
(treat URLs/sizes as untrusted); keep bags local (no fetch holes) for v1. Path rule (R1 S5.1): reject
absolute paths, `..`, drive letters, `~user` references, and control characters in contributed
file/tag paths, and normalize per S6.1.x; a maliciously crafted tagmanifest entry can otherwise make
a naive implementation leak or overwrite targeted files. Tag-manifest policy [design
proposal/synthesis]: regenerate the tagmanifest after every authorized tag change (else false
failures), and never treat "valid" as covering untracked new tag files, which validation cannot see
(R4 missing_optional_tagfiles caveat).

F2. Fixity scheduling with two tiers (S1/S2, C1/C2, R1/R4) [sourced]. Proposed change: nightly fast
presence/size sweep PLUS weekly full checksum re-validation, recorded per run. Comparison: frozen
plan has zero corruption detection; the two-tier design bounds nightly cost while guaranteeing
eventual full coverage (R1: Payload-Oxum exists for "quickly detecting incomplete bags before
performing checksum validation"). Condition: never report the fast tier as "valid" — log it as
presence-only, because fast validation by construction skips checksums (R4 CLI: fast success reads
"valid according to Payload-Oxum", full success reads "is valid").

F3. Content-addressed safe dedup (S1/S2, C1/C2, R1/R4) [sourced correction; storage design labeled].
Proposed change: dedup on SHA-256/SHA-512 of byte content (bagit-python's defaults, R4 L128), not
filename+size. Comparison: filename+size dedup silently merges distinct files with the same
name/size (data loss) and misses identical bytes under different names (waste); content hashing
fixes both. Layering resolution [design proposal/synthesis]: dedup MUST live BELOW the bag layer —
each bag stays complete and valid standalone per R1 S3 rule 4 (every payload file present and
listed in every manifest), while a storage-level content-hash→accessions ledger holds one stored
copy with back-references. A bag whose payload is a pointer into a dedup store would be neither
portable nor valid standalone; that alternative is rejected for v1.

F4. Crash-safe ingest protocol (S4/C3 premise; protocol steps are synthesis). Proposed change
[design proposal/synthesis on a sourced premise]: stage each ingest in a quarantine directory; write
the metadata row as "incomplete"; fsync; verify the bag; then flip the row to "complete" inside a
single SQLite transaction and atomically move into the store; validate contributed paths per F1/R1
S5.1 before accepting them. Comparison: frozen plan's direct-tree writes + nightly copy can copy
half-written files and a mid-transaction database (S4/C3 S9: partial deletions, garbage, broken
locking on network shares). Sourced premise: SQLite atomicity and hot-journal rollback cover the
.db file only; sidecar/tree writes get no cross-file atomicity (C3 S5). Recovery rule: on restart,
re-verify quarantine, discard or resume incomplete rows per hot-journal semantics, never
auto-promote.

F5. Replica that cannot copy corruption (S4/C3 risk; snapshot design is synthesis). Proposed change:
replace the blind nightly tree copy with verify-then-replicate: re-validate source fixity (or at
least completeness + spot fixity) before copying, copy to a versioned snapshot on disk 2 [design
proposal/synthesis], and verify the replica after copy. Comparison: frozen plan copies whatever is
there, propagating corruption and interrupted writes to the only backup (C3 S9 live-copy hazards).
Alternative noted [researcher reasoning, not a claim of the SQLite page]: quiescing writes or using
a snapshot/backup mechanism for the copy; the word "backup" does not occur in the cited SQLite doc
(C3).

F6. Derivative provenance (S1, S6/C6 for the separation precedent only). Proposed change [field set
is design choice; separation precedent sourced]: record per derivative {source original checksum,
tool+version, parameters, date, operator} as tag metadata; store derivatives outside data/ or in a
separate access tree. Comparison: frozen "previews beside originals" cannot answer "which original,
made how, still current?"; after an original is re-scanned the stale preview is indistinguishable.
Sourced precedent: preservation and access copies are separate components (Archivematica packaged
with AtoM for access, S6 — the one S6 use within the retrieved range, C6).

F7. Rights and restricted access, three layers (S5/C4/R3) [sourced]. Proposed change: (a) item-level
public/private flag; (b) per-media override so a public record can carry restricted originals (R3
mixed-visibility rule); (c) per-field visibility — role-scoped hiding via per-property eye icons.
Comparison: frozen plan serves everything it catalogs; the brief's sensitive originals require
default-private ingest with explicit publication. Conditions: new items default to private; BOTH
auto-publication paths stay off for restricted collections — the per-site "automatically add new
items" setting AND each volunteer's per-user "Default sites for items" list (R3) — with the latter
reviewed/empty for volunteer accounts; role table distinguishes volunteer add/edit-own from
publish/delete-others. Caveat (R3): "private" properties are still visible to Global Admins,
Supervisors, and Editors, so genuinely sensitive notes (donor PII, appraisals) need staff-role
discipline or storage outside the catalog field.

F8. Volunteer-turnover hardening (S5/C4/R3) [sourced]. Proposed change: mandatory owner reassignment
before account deletion; no orphaned records. Comparison: frozen plan has no ownership concept; R3
documents the orphan trap ("Deleting a user orphans their items ... You cannot currently search and
batch-edit items without an owner") as a known hazard directly analogous to the volunteer-managed
catalog.

F9. Preservation formats + normalization log [design proposal/synthesis; the GAP it fills is sourced
from the plan itself]. Proposed change: define a small preservation-format policy (e.g. uncompressed
or lossless masters retained; access derivatives normalized) and log every normalization as a
preservation event. Comparison: frozen plan keeps bytes but never addresses format obsolescence (its
own "preservation formats remain unspecified" clause). Citation note: the retrieved Archivematica
ranges contain no normalization/format-policy/PREMIS/BagIt coverage (C6 term counts), so no
methodology claim is sourced to S6 here; Archivematica remains the migration-target reference only
(M-b).

F10. Catalog over structured metadata, not filenames (S5/C4/R3; S1/R1 S6.1.2) [sourced, softened].
Proposed change: search/describe via typed fields (title, creator, date, rights, subject).
Comparison: filename+notes search breaks on volunteer naming inconsistency (R1 S6.1.2 cross-platform
naming pitfalls) and cannot express rights; structured fields also enable "public view hides
restricted fields" rendering (R3 structured-property display). Softening: "linked records" is NOT
claimed — linked-data/resource-template behavior is outside the retrieved manual range (C4/R3).

## 2. Materially different mechanisms considered

M-a. BagIt + SQLite registry (recommended, F1–F5): bags are the integrity unit, SQLite the index.
Affordable, single-machine, tool-compatible. [sourced components; recommendation is judgment]
M-b. Full OAIS system, Archivematica-style (S6): SIP→AIP→DIP pipeline with appraisal gates and
separate access system. Stronger methodology and format policy, but heavier deployment/ops than a
volunteer station may sustain; recommended as the migration target, not v1. [sourced: OAIS/SIP
methodology, low-capacity audience fit, AtoM separation — all in S6 range]
M-c. Content-addressed object store (dedup by hash as the storage layout, not just the check):
maximal dedup and implicit integrity, but custom tooling and harder volunteer comprehension;
recommended only as a later optimization of M-a's dedup table. [design proposal/synthesis:
no sources retrieved; comparison kept, labeled]
M-d. Filesystem-level integrity (checksumming filesystem/scrub): transparent silent-corruption
detection, but ties the archive to specific OS/storage and gives no packaging, provenance, or
rights story; recommended as a complement (run the store on integrity-capable storage where
affordable), never the sole mechanism. [design proposal/synthesis: no sources retrieved;
comparison kept, labeled]
M-e. Cloud object storage with versioning: off-site durability and cheap immutability, but recurring
cost, upload bandwidth for audio-scale masters, and custody questions for sensitive originals;
recommended as an optional encrypted third copy, not the primary replica. [design
proposal/synthesis: no sources retrieved; comparison kept, labeled]

## 3. Component/code behavior (pinned)

bagit-python v1.9.0, released 2025-06-13 (R2), file bagit.py (S2/C1/R4; read, not executed):
validate() defaults to full fixity recalculation (fast=False); fast=True checks Payload-Oxum
presence/size only; _validate_contents ALWAYS runs the oxum check first ("fail early"), then
returns early only if fast; the full path continues through completeness to per-file
_validate_entries, which COLLECTS every ChecksumMismatch and raises once with the full list.
CLI --fast is documented as skipping corruption detection ("without performing checksum validation
to detect corruption"); main() gates --fast/--completeness-only behind --validate; success messages
distinguish "valid according to Payload-Oxum" (fast) from "is valid" (full). DEFAULT_CHECKSUMS =
["sha256", "sha512"] (R4 L128). Tag manifests (v0.97+, R4 `version_info >= (0, 97)`) are verified,
so bag-info.txt tampering is detectable — for CURRENT tagmanifests only: regenerate after every
authorized tag change, and untracked new tag files are invisible to validation. Multiprocess hashing
available (processes=N); the #183 pool-completion fix is in this tag. Relevance: the library
directly implements F1/F2/F3, but its fail-early oxum ordering creates the reporting gap in §4, and
its oxum-masks-details behavior must be wrapped (F2/V1).

## 4. Pertinent issue/fix/regression/release chain

bagit-python #177 (open, opened 2024-05-02; state re-verified open at R2 retrieval) → PR #174
(closed unmerged 2024-09-18 by its author; merged=false) → v1.9.0 (released 2025-06-13T17:43:22Z,
R2; U2 resolved).
The reporter's mechanism claim (validation always fast; checksums never checked) was refuted by the
maintainer, who pointed to slow-validation test coverage and the intentional always-check-oxum
design (C5 verified quotes). The surviving defect is reporting, not coverage: an oxum mismatch
raises before per-file checksum results, so operators learn "bag corrupt" without learning which
files failed. v1.9.0 ships related validation hardening (#183 pool-completion fix, #162 CLI tests,
#140/#154/#184 behavioral fixes — all confirmed in the R2 release body) but no #177 reporting fix
(the body contains no reference to 177). PR #174 is NOT a fix to cherry-pick (closed by the author
as the wrong change). Implication for this case: adopt v1.9.0+ for the pool/CLI fixes, but wrap
validation so fixity detail is captured even when oxum fails (catch the oxum error, then run
entry-level verification and report both — implementable because _validate_entries collects every
error, R4), run the wrapper on oxum-SUCCESS paths too (a stale-but-plausible oxum passes while
checksums fail; oxum is byte/file counts only), store per-file results rather than just the
bag-level boolean, and pin + re-check the issue before each release upgrade.

## 5. Optional opportunities (not required for v1)

O1. Oral-history extras: per-interview consent/rights form linked as a tag file; chapter/segment
metadata for long audio. O2. Fixity audit exports: monthly signed manifest of all checksums for
off-site custody proof. O3. Duplicate-bit harvesting: report cross-accession duplicates to
prioritize re-description. O4. Format-watch list: annual check of master formats against a public
obsolescence registry. O5. Encrypted third copy (M-e) for disaster recovery once F1–F7 are stable.

## 6. Uncertainties (justified, with what would resolve them)

U1. Rights metadata standard: no PREMIS/rights-schema source was retrieved (time ceiling);
U-resolve by sourcing PREMIS Data Dictionary or an equivalent rights vocabulary before finalizing
F7 field names.
U2. RESOLVED: v1.9.0 was published 2025-06-13T17:43:22Z (R2 API record). Removed from uncertainties;
the date is cited in §3/§4.
U3. Station hardware/OS: digitization-station platform unknown, so M-d feasibility and R1 S6.1.2
filename rules cannot be finalized; U-resolve from deployment facts.
U4. Collection scale/throughput: full-checksum cadence (F2) and replica windows (F5) need
bytes/counts; U-resolve by measuring the pilot ingest.
U5. Sensitivity/legal regime: access tiers (F7) assume generic donor/volunteer sensitivity;
statutory regimes (e.g. Indigenous knowledge, biometric voice) would add tiers; U-resolve with
archive policy input.

## 7. Source-specific conditions (adoption caveats)

- S1/R1: RFC 8493 is Informational, not Standards-track; follow R1 S3's every-file-in-every-manifest
  rule for 1.0 bags; never trust fetch.txt sizes/URLs (S5.2/S5.3); cite S5.2 for the
  older-algorithm/spoofing point and S5.4 for the general active-attack limit + digital-signatures
  recommendation; enforce the S5.1 path-traversal rule (F1).
- S2/R4: single-file pure-Python library; multiprocess hashing available (processes=N);
  oxum-masks-details behavior must be wrapped including on oxum-success paths (§4); tagmanifest
  coverage is generation-time (regenerate-then-validate, never validate-then-trust).
- S3/C5/R2: #177 still open at reviser retrieval (2026-10-07); PR #174 is NOT a fix to cherry-pick
  (closed by author as the wrong change); re-check issue state at build time. Pin v1.9.0
  (2025-06-13) or later.
- S4/C3: SQLite atomicity covers the .db file only — sidecar/tree writes need the F4 protocol; never
  copy the live tree as a backup; rolling versionless doc — re-verify section numbers at build time;
  the "backup API/snapshot" alternative is researcher reasoning, not a claim of that page.
- S5/C4/R3: Omeka S behavior cited from the rolling manual (unversioned page); re-verify
  visibility/role semantics against the deployed Omeka S version; auto-publication is TWO settings
  (site auto-add + per-user Default-sites); field-hiding is role-scoped (staff still see "private"
  fields).
- S6/C6: Archivematica is the methodology reference and migration target, not the v1 build; only the
  in-range uses are claimed (M-b methodology/audience, F6 AtoM separation); AGPL applies if its code
  (not just ideas) is reused.

## 8. Proposed validation (all proposals; nothing executed)

V1. Corruption drill: flip bytes in a copy of a payload file and in a tag file; assert full
validation fails naming the file, fast tier reports presence-only, and the wrapper still emits
per-file detail despite oxum mismatch — on both oxum-failure and oxum-success paths (covers F2,
§4).
V2. Crash drill: kill ingest mid-copy and mid-transaction; assert restart leaves store bags valid,
quarantine isolated, and no partial promotion (F4, S4/C3).
V3. Replica drill: corrupt source after snapshot; assert verify-then-replicate refuses to overwrite
the good replica and alerts (F5).
V4. Dedup drill: same bytes under different names/paths dedup to one stored copy with each bag
still complete/valid standalone; different bytes with same name/size do NOT merge (F3).
V5. Rights drill: restricted original under public record is unreachable via public routes (browse,
search, direct media URL, API) but reachable to authorized roles; newly ingested items are private
by default; both auto-add settings verified off (site auto-add + per-user Default-sites) (F7).
V6. Provenance drill: regenerate a derivative; assert the old derivative is marked stale/superseded
with tool/version/parameters recorded (F6).
V7. Volunteer drill: delete a volunteer account only after reassignment; assert zero orphaned
records (F8).
V8. Path-traversal drill: submit ingest names with absolute paths, `..`, drive letters, `~user`,
and control characters; assert rejection/normalization and no out-of-store write (F1, R1 S5.1).

## 9. Plan cross-check (every discovery vs the frozen sandbox plan)

Frozen plan clauses: (P1) directory-tree store; (P2) dedup by filename+size; (P3) SQLite metadata;
(P4) previews beside originals; (P5) nightly copy to second disk; (P6) web catalog with
filename/notes search; (P7) checksums/fixity/recovery/provenance/rights/formats unspecified.

| Finding | Plan clause(s) | Comparison |
|---|---|---|
| F1 BagIt envelope + path rule | P1, P7-checksums | Plan has no integrity envelope; bags add it without abandoning the tree. |
| F2 two-tier fixity | P7-fixity | Plan has zero corruption detection; tiers bound cost with full coverage. |
| F3 content-hash dedup (below bag layer) | P2 | Both filename+size failure modes fixed; bags stay valid standalone. |
| F4 crash-safe ingest | P1, P3, P7-recovery | Direct-tree writes + live DB copy risks addressed by stage+verify+flip. |
| F5 verify-then-replicate | P5 | Blind copy replaced; replica verified before and after. |
| F6 derivative provenance | P4, P7-provenance | Beside-originals cannot answer source/method/staleness; now recorded. |
| F7 rights layers | P6 (serves all), P7-rights | Plan serves everything cataloged; default-private + dual-setting guard. |
| F8 ownership | P3 (no ownership), P6 volunteers | Orphan trap closed by mandatory reassignment. |
| F9 format policy (proposal) | P7-formats | Plan keeps bytes, never addresses obsolescence; policy fills the gap. |
| F10 structured catalog | P6 | Filename search replaced by typed fields incl. rights. |
| M-b..M-e | P1–P6 architecture | Explicitly non-v1 dispositions (target/optimization/complement/optional). |

No plan clause is unaddressed. The "thin plan" characterization stands (P7 lists six unspecified
areas; this final covers all six).

