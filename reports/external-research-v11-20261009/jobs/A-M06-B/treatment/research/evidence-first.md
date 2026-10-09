# Evidence-first critic pass — A-M06-B / treatment / research (S12, M06 v1)

Written 2026-10-09 ~21:12–21:20 UTC, before any plan reveal or draft reading, per M06
evidence-first-challenge. Sources: brief.md plus independently chosen public primary
sources found via web search in this session. No case plan, no prior draft, no campaign
or counterpart material was read. All access timestamps are this session's.

## Brief restatement (from brief.md alone)

A regional historical archive must accept digital file packages from small donors.
Staff-side needs named by the brief: package validation; separation of malware handling
from quarantine handling; understandable rejection reports; metadata repair; repeatable
transfer history. The brief explicitly warns not to assume a checksum proves provenance.
Research obligations: interoperable tools and competing workflows, implementation/version
conditions, low-cost deployment path.

Independently derived obligation set (O1–O6 exactly as written in brief.md):
- O1 discover useful unfamiliar tools/products/materially different approaches.
- O2 investigate consequential primary source/code behavior, governing defaults,
  units/types, limits, applicability for selected mechanisms.
- O3 investigate at least one issue/fix/regression/release or evolution chain; state
  honestly where evidence is absent or inapplicable.
- O4 compare every exact P clause after plan reveal (correction / optional enhancement /
  user decision / already-covered / rejected / uncertain).
- O5 retain alternatives, conditions, original constraints, disagreement and uncertainty
  in one self-contained coherent final.
- O6 propose discriminating validations, keeping executed checks separate from proposals;
  no runtime is available in this stage, so nothing below is claimed to have run.

## O1 — Tools, products and materially different approaches discovered

Chosen for their direct fit to the brief's five staff needs, found independently:

1. **Archivematica (Artefactual Systems, open source).** OAIS-style pipeline whose
   "Scan for viruses" microservice runs at multiple points in both transfer and ingest,
   powered by ClamAV; infected transfers are failed rather than ingested. Processing
   behavior (including an optional quarantine stage and its duration) is governed by a
   processing configuration file (`processingMCP.xml`) editable via the dashboard.
   - Docs: "Scan for viruses", Archivematica documentation (archivematica.org),
     accessed 2026-10-09 ~21:12 UTC.
   - Antivirus administration (clamscan vs clamdscan, freshclam update logs under
     `/var/log/clamav/`), archivematica.org/docs/antivirus-admin, accessed ~21:14 UTC.
   - Legacy micro-service reference: wiki.archivematica.org (Archivematica 1.1
     micro-services; failed-transfer directory `/sharedDirectoryStructure/failed`),
     accessed ~21:13 UTC.
2. **BagIt packaging (RFC 8493, BagIt V1.0) + bagit-python (Library of Congress).**
   Directory-layout transfer format with per-algorithm manifest files; the de facto
   interchange wrapper between donors and repositories.
   - RFC 8493, rfc-editor.org, accessed ~21:13 UTC.
   - bagit-python on PyPI (project page documents manifest-generation flags), accessed
     ~21:13 UTC.
3. **DART — Digital Archivist's Resource Tool (APTrust, open source, GUI + CLI).**
   Drag-and-drop BagIt packaging for non-technical users, driven by BagIt profiles, with
   direct upload to S3-style ingest repositories. This is the strongest found fit for the
   small-donor side of the brief: donors package correctly without learning CLI tooling,
   and the profile enforces what the archive requires.
   - aptrust.org ("How APTrust Works"), aptrust.github.io (DART),
     github.com/APTrust/dart, COPTR entry (coptr.digipres.org), DPC Tech Watch article
     "DART 3: A Free, Open Source Packaging Tool"; all accessed ~21:15 UTC.
4. **BitCurator environment + BitCurator Consortium workflows.** For media that arrives
   as physical disks/cards rather than network packages: disk imaging, data triage, PII
   discovery, filesystem analytics; published small-institution accessioning workflows
   (CPRER module 2018; Educopia common-steps write-up covering image → virus check →
   format ID → fixity → sensitive-content review). Materially different acquisition
   approach than network package intake; applicable to the same donor population.
   - bitcurator.net, bitcuratorconsortium.org/workflows, cprerc.wordpress.com
     ("Accessioning Born-Digital Content with BitCurator", 2018), educopia.org;
     accessed ~21:14 UTC.
5. **DROID / PRONOM (The National Archives, UK) and PRONOM signature files.** Format
   identification backed by a versioned signature-file registry; identification results
   depend on the signature-file version in force. Useful for package validation and for
   metadata repair (identifying what a file actually is versus what its extension claims).
   - DCC announcement of DROID open-source release (dcc.ac.uk); COPTR "PRONOM Signature
     Development Utility" (v2 released October 2020, container-signature support); DPC
     "Explore the new PRONOM beta"; TNA file-format reference pages; accessed ~21:14 UTC.

Competing-workflow shape that falls out of O1 (derived, not copied): a low-cost path can
be either (a) donor-side BagIt profiles via DART + a minimal staff-side validation/
quarantine harness, or (b) a full Archivematica pipeline accepting raw transfers, with
more operational weight. Approaches (a) and (b) differ materially in where validation
responsibility sits.

## O2 — Governing defaults, units, limits, applicability

1. **RFC 8493 (BagIt V1.0) checksum mandate vs bagit-python default.** RFC 8493 states
   that starting with BagIt 1.0, bag creation and validation tools MUST support SHA-256
   and SHA-512, and SHOULD enable SHA-512 by default when creating bags. bagit-python's
   own project page documents that manifest generation defaults to MD5 unless `--sha256`
   / `--sha512` flags are passed. Consequence for this brief: an archive whose intake
   scripts build or validate bags without overriding the algorithm default silently ends
   up with collision-prone MD5 manifests even though the governing spec recommends
   SHA-512 — a version/implementation condition, not just a preference. Units: manifest
   entries are hex digests per file; validation compares recomputed digests.
2. **A checksum proves fixity, not provenance.** BagIt manifests attest that bytes now
   match digests recorded at packaging time; nothing in RFC 8493 binds the bag to an
   identity, a custody chain, or the donor's original creation. Applicability limit: the
   brief's warning is structurally correct — manifest match is evidence the package was
   not corrupted after sealing, and nothing more. Provenance must come from accompanying
   metadata (donor identity, transfer agreement, chain-of-custody records) carried
   alongside the bag (e.g., in bag-info.txt tag files), not from the digest itself.
3. **Archivematica quarantine default.** The quarantine stage and its duration are set in
   `processingMCP.xml`; search-level evidence indicates the default value is 0 days
   (quarantine effectively off) and admins must opt in. Limit: the quarantine only helps
   if ClamAV definitions are updated (freshclam) between arrival and scan; a 0-day
   quarantine with stale definitions gives the brief's "malware/quarantine separation"
   in name only. Exact default value in the shipped processingMCP.xml is UNCONFIRMED at
   this stage (search summary only; to be pinned against the repo in discovery).
4. **ClamAV operational limits.** clamscan loads definitions per run (slow, no daemon);
   clamdscan uses the clamd daemon (fast, but definitions update only as often as the
   daemon reloads). Detection is signature-based with an open-world gap: zero-days and
   targeted malware are not detected; quarantine (time-delayed rescan after definition
   updates) mitigates but does not eliminate this. `--move`/`--copy` quarantine options
   are documented in ClamAV's own docs (docs.clamav.net, accessed ~21:13 UTC).
5. **PRONOM/DROID versioning condition.** Format identification outcomes depend on the
   signature-file version; signature files are periodically released (utility v2,
   October 2020, added container-signature sequence support; PRONOM beta underway
   2025–2026). Any repeatable transfer history must therefore record the signature-file
   version used at validation time, or identification is not reproducible.

## O3 — Issue/fix/regression/release chain (selected chain)

**Chain chosen: Archivematica quarantine-removal virus-scan skip (2019).**
- A GitHub issue in the Archivematica repository (~May 15, 2019), surfaced in this
  session's search as "Problem: Scan for viruses not being triggered after remove":
  when a user removes a transfer from quarantine, the transfer proceeds directly to
  "identify file format", skipping the "Scan for viruses" microservice — contrary to
  expected behavior where the scan runs after quarantine removal before continuing.
- Why it is consequential here: it sits exactly on the brief's malware/quarantine
  separation and shows the failure mode of home-rolled or pipeline workflows — the
  quarantine path's exit edge can silently bypass the security control that the normal
  path enforces. Any staff-facing rejection-report design must make the scan status of
  a quarantine release explicit.
- Evidence status, honestly stated: the issue's exact number, current open/closed state
  and fix version are UNCONFIRMED at this stage (located via search snippets only).
  Pinning number/state/fix commit is queued for the discovery stage against
  github.com/artefactual/archivematica (or the Issues repo). If it cannot be pinned,
  this stays a reported-but-unresolved chain with the uncertainty recorded, per O3's
  "say when evidence is absent".
- Secondary evolution chains noted: PRONOM Signature Development Utility v1→v2
  (Oct 2020) and the PRONOM web beta; bagit-python manifest-algorithm flags versus the
  RFC 8493 SHA-512 default recommendation (a spec/implementation drift chain).

## O4–O6 status at this point in M06

- O4: cannot be started yet — the exact P clauses only exist after reveal-plan.py; this
  file intentionally contains no plan content.
- O5: constraints already retained above (small donors, low cost, regional archive staff
  skill level; checksum ≠ provenance; signature/definition versioning affects
  repeatability). Disagreement/uncertainty so far: search-level summaries vs primary
  repo confirmation (quarantine default value; issue pinning).
- O6: nothing has been executed. No sandbox, no witness run, no tool invocation against
  artifacts — all findings above are documentary. Proposed discriminating validations
  (e.g., reproduce the MD5-default manifest behavior with bagit-python; drive a
  quarantine removal through an Archivematica instance to observe the scan-skip; verify
  processingMCP.xml default quarantine value from the shipped repo file) are recorded as
  proposals only and will be separated from executed checks in the final deliverable.

## Source list (independently chosen; accessed 2026-10-09, this session)

| # | Source | Locator | Access (UTC) |
|---|--------|---------|--------------|
| S1 | Archivematica docs, "Scan for viruses" | archivematica.org (user manual) | ~21:12 |
| S2 | Archivematica docs, Antivirus administration | archivematica.org/docs/antivirus-admin | ~21:14 |
| S3 | Archivematica wiki, micro-services / failed dir | wiki.archivematica.org | ~21:13 |
| S4 | RFC 8493, BagIt File Packaging Format V1.0 | rfc-editor.org (RFC 8493) | ~21:13 |
| S5 | bagit-python project page | pypi.org/project/bagit | ~21:13 |
| S6 | APTrust "How APTrust Works" | aptrust.org | ~21:15 |
| S7 | DART (APTrust) site + repo | aptrust.github.io; github.com/APTrust/dart | ~21:15 |
| S8 | DPC "DART 3" article; COPTR DART entry | dpconline.org; coptr.digipres.org | ~21:15 |
| S9 | BitCurator environment + Consortium workflows | bitcurator.net; bitcuratorconsortium.org | ~21:14 |
| S10 | CPRER accessioning module (2018); Educopia common steps | cprerc.wordpress.com; educopia.org | ~21:14 |
| S11 | DCC DROID open-source announcement; TNA DROID/PRONOM pages | dcc.ac.uk; nationalarchives.gov.uk | ~21:14 |
| S12 | COPTR PRONOM Signature Development Utility (v2, Oct 2020); DPC PRONOM beta | coptr.digipres.org; dpconline.org | ~21:14 |
| S13 | ClamAV documentation (scan/quarantine options) | docs.clamav.net | ~21:13 |
| S14 | Archivematica GitHub issue: scan-for-viruses not triggered after quarantine remove (number/state UNCONFIRMED — pin in discovery) | github.com/artefactual/... (search-located, ~2019-05) | ~21:15 |
