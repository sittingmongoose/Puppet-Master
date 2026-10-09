# Evidence-first derivation — A-M06-B/treatment/critic (case S12, brief: archive-transfer)

Method note (M06 evidence-first): this file was produced by reading **only** the exact brief
(`cases/S12/brief.md`, read 2026-10-09T21:26:07+00:00) and independently chosen public primary
sources below. No predecessor draft, discovery, source-map, or revealed plan was opened before
this file was saved. All access timestamps are UTC, 2026-10-09.

## 1. What the brief asks for (facts from the brief itself)

A digital handoff service for a regional historical archive receiving files from small donors, needing:
- **F1 package validation** of incoming transfer packages;
- **F2 malware/quarantine separation** (quarantine is distinct from validation);
- **F3 understandable rejection reports** (human-readable, not machine dumps);
- **F4 metadata repair**;
- **F5 repeatable transfer history**;
- **F6 provenance must not be assumed from a checksum** — the brief explicitly warns "without assuming a checksum proves provenance";
- research obligations: interoperable tools and materially different workflows (O1), primary-source behavior/defaults/limits (O2), an issue/fix/release evolution chain (O3), per-clause comparison after plan reveal (O4–O5), discriminating validations separating executed vs proposed (O6), and a **low-cost deployment path**.

## 2. Primary-source derivations, per need

### F1+F6 — BagIt packaging and what checksums do and do not prove
Source: RFC 8493, "The BagIt File Packaging Format" — https://www.rfc-editor.org/rfc/rfc8493.html (accessed 2026-10-09T21:27:53+00:00)
- BagIt is a set of hierarchical, directory-based packaging conventions ("just enough structure to enclose descriptive metadata 'tags' and a file 'payload'"); a `bagit.txt` declares `BagIt-Version` (1.0 in the RFC) and tag-file character encoding.
- A **valid** bag is one where every checksum in `manifest-<algorithm>.txt` verifies against the corresponding payload files; tag manifests cover tag files and must list every payload manifest.
- Bag 1.0 creation/validation tools **MUST support SHA-256 and SHA-512**; SHA-512 recommended default for new bags; MD5/SHA-1 optional (SHOULD support) for backwards compatibility. → An implementation should not hard-code MD5; rejection reports should name the manifest algorithm per file.
- `Payload-Oxum` (OctetCount.StreamCount in bag-info.txt) is a fast completeness pre-check only — an optimization; full checksum validation is still REQUIRED before calling a bag valid. → A rejection report can use Oxum failures as a quick "transfer incomplete, re-send" class before slow hash comparison.
- **Directly supports F6:** the RFC states BagIt gives "high levels of confidence against data corruption" and "is not designed to be secure against active attacks"; tamper protection "SHOULD agree on additional measures, such as digital signatures" (out of scope). Fixity ≠ provenance: bag-info.txt metadata is "intended primarily for human use" and is not authenticated. → A handoff service needs a separate chain-of-custody record (who sent what, when, received by whom) alongside fixity; a matching checksum only proves the file survived transfer, not where it came from.
- Complementary framing: NDSA Levels of Digital Preservation — https://ndsa.org/publications/levels-of-digital-preservation/ (accessed 2026-10-09T21:27:53+00:00): created 2013, V2.0 2019, V2.1 March 2026; treats fixity verification and provenance/information content as **separate functional areas** with staged maturity — useful as an audit rubric for a small archive rather than a binary gate.

### F2 — malware scanning and quarantine separation
Source: ClamAV documentation — https://docs.clamav.net/ (accessed 2026-10-09T21:27:53+00:00)
- ClamAV is an open-source antivirus engine with a scripted, digitally signed signature updater (freshclam) and DNS-based version queries; signature changes after submissions take **at least 48 hours** to propagate. → A donor-file quarantine flow cannot treat "not detected" as clean; detection is partial and signature-age matters, so quarantine must be a distinct state with its own release rule, not just a validation failure.
- Version/platform conditions: supported platforms are current Linux LTS/rolling lines (Ubuntu 22.04/24.04, Debian 12/13, AlmaLinux 9/10, Alpine 3.22, Fedora 41/42, openSUSE 15, FreeBSD 13/14, macOS 13–15, Windows 10/11); older OSes (HP-UX, Solaris, sparc64, armhf, ppc64le) unsupported. Minimum **3 GiB+ RAM** (Docker environments advised 3–4 GiB), 1 CPU ≥2.0 GHz, 5 GiB disk. → A low-cost host must budget ~4 GB RAM for the scanner alone, or scan on a separate machine; this is a real constraint on "one tiny VPS does everything".
- The docs page itself does not state a version EOL policy or signature-update interval guarantee (absence noted honestly — O3-style: say when evidence is absent).

### F1 (identification) — file format identification tools
Source: Siegfried — https://github.com/richardlehane/siegfried (accessed 2026-10-09T21:27:53+00:00)
- Signature-based format identification using UK National Archives **PRONOM** signatures (plus freedesktop MIME-info, LOC FDD, Wikidata beta); by default scans without buffer limits (full-file scan), DROID-compatible output via `sf -droid`, custom signatures via `roy`.
- Latest release v1.11.9, dated 2026-09-27; Apache-2.0; Go-based (library needs Go ≥1.25); packaged for Homebrew, Ubuntu/Debian APT, FreeBSD pkg, Arch AUR, Windows binaries, WASM build, `sf -serve` server mode.
- → For a low-cost service: Siegfried gives PRONOM identification without running DROID/JRE; the `sf -serve` mode suits a small always-on validation service; identification failures are a natural rejection-report category distinct from checksum failures.
- DROID (TNA) page was not fetched (URL 404 at access time); DROID facts are therefore **not** evidence-backed here and any critique claim about DROID versions must be re-verified.

### O1/O2 — full-workflow tool with version conditions
Source: Archivematica releases — https://github.com/artefactual/archivematica/releases (accessed 2026-10-09T21:27:53+00:00)
- Open-source digital preservation ingest system; recent releases: **v1.18.0 (Sep 26, latest)**, v1.17.1 (May 20), v1.17.0 (Dec 6), v1.16.0 (May 16), v1.15.1 (Nov 29), v1.15.0, v1.14.x, v1.13.2, v1.12.2; companion **Storage Service 0.24.0** pairs with 1.18.0; release notes live on the project wiki; cadence ≈1–2 minor/patch releases per year.
- License and system requirements are **not stated on the releases page** (honest absence; Archivematica is widely known as AGPL-3.0, but that is not evidence-backed here and must be re-verified against the repo LICENSE).
- → Alternative-workflow comparison: full Archivematica pipeline vs. a **thin custom pipeline** (BagIt validation + ClamAV quarantine + Siegfried ID + scripted PREMIS-style event log) — materially different cost/complexity points. Small-donor volume likely favors the thin pipeline; Archivematica buys normalization/metadata/AIP workflow but carries its operational weight (multi-component, Elasticsearch/OpenSearch-family dependencies implied by companion Storage Service releases — component requirements to be verified before citing).

### F5 — repeatable transfer history
Derived (brief + RFC 8493 access): BagIt gives per-transfer integrity artifacts (manifests, bag-info.txt, Payload-Oxum); repeatable history needs the service's own append-only record per transfer (IDs, timestamps, tool versions, scan results, operator actions). No single fetched source prescribes the store; OCFL/PREMIS are candidate standards but were **not fetched in this evidence-first pass** — any critique relying on OCFL/PREMIS specifics must independently verify them.

## 3. Uncertainties and evidence gaps (recorded now, before any draft is seen)
1. No fetched source gives ClamAV version-EOL policy or guaranteed update cadence (48 h signature-propagation note is the closest dated fact).
2. Archivematica license + OS/component requirements unverified from the fetched page.
3. DROID current version unverified (404); Siegfried is the only evidence-backed identifier.
4. veraPDF was only partially reached (parser repo; dual GPL-3.0+/MPL-2.0; Java 8–25 + Maven build; releases page empty in fetch) — PDF/A validation specifics and endorsed-validator status unconfirmed.
5. No source yet fetched covers human-readable rejection-report design (F3) or metadata-repair tooling (F4, e.g. ExifTool/FITS) — those need their own primary checks or must be marked uncertain.
6. NDSA Levels V2.1 (March 2026) matrix content itself lives on OSF and was not fetched; only version dates are evidence-backed.

## 4. Independent low-cost deployment derivation (from fetched evidence only)
Minimal viable path consistent with the above: single Linux LTS host (Ubuntu 22.04/24.04 per ClamAV support list) with ≥4 GiB RAM running (a) BagIt validation (RFC 8493 rules: SHA-256/512 required), (b) ClamAV quarantine lane with time-boxed release policy, (c) Siegfried `sf -serve` for PRONOM identification, (d) append-only per-transfer event log producing plain-language accept/reject reports; Archivematica reserved as the heavier alternative if the archive later needs normalization/AIPs (v1.18.0 + Storage Service 0.24.0 as of 2026-09-26).
