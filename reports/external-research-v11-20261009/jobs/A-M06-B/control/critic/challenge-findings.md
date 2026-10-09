# Challenge findings — A-M06-B / control / critic (ticket 2: challenge vs primary evidence)

Method M06 v1 evidence-first-challenge. The critic independently re-fetched the governing
public primary sources and challenged the predecessor draft/discovery claims against them.
Predecessor evidence (research/sources/S01–S06) was read in full in ticket 1 and its SHA-256
pins re-verified. Findings classified material vs minor; every material finding cites a
retained source file or a fetched public URL. Invalid critic demands are explicitly explained
rather than raised. Access log of the critic's own sources is at the end (feeds ticket 4
source-map).

## Material findings

### MF1 — Wrong RFC section locator for fetch.txt (citation-chain error, persists in three artifacts)
The draft cites "BagIt `fetch.txt` pointer bags … (S01 §2.4)" (research/draft.md, P1). The same
wrong locator appears in research/source-map.json (S01 locator: "Sec. 2.4 (fetch.txt)") and
research/sources/S01 header. Per the RFC's own table of contents, fetch.txt is **§2.2.3 "Fetch
File: fetch.txt"** under "2.2 Optional Elements"; **§2.4 is "Bag Checksum Algorithms"** (the
SHA-256/SHA-512 MUST-support text the draft separately relies on). Two independent fetches of
https://datatracker.ietf.org/doc/html/rfc8493 agree (TOC listing; and "Section 2.4 does not
discuss fetch.txt at all"). The substantive claims (fetch.txt exists; §5.2 warning) are
unaffected, but a locator error inside an immutable-ID source map is exactly the kind of
drift a validation service must not inherit. Uncertainty: none on the section facts (double
fetched); the error's origin (predecessor excerpt vs source-map transcription) is not
attributable further.

### MF2 — "`bagit.zip`-style packages" is unsupported terminology (false precision in P1)
research/draft.md P1 offers option (a) "accepts BagIt ZIPs (`bagit.zip`-style packages)". The
retained RFC evidence contains **no** such convention: the RFC nowhere mentions "bagit.zip"
or ZIP encapsulation and explicitly positions BagIt against serialized formats — "BagIt
differs from serialized archival formats such as MIME, TAR, or ZIP in two general areas"
(fetched from https://datatracker.ietf.org/doc/html/rfc8493). Zipping a bag for transport is
ordinary practice, and accepting zipped bags remains a reasonable *design option*; what fails
is the implication of a named standard-style package type sourced from S01. Fix is wording:
"an ordinary ZIP whose contents are a bag", validated after extraction. Uncertainty: none.

### MF3 — CVE-2021-36370 is not an ExifTool CVE; the draft's CVE uncertainty can be tightened, one half refuted
The draft/discovery (P4; discovery §4.2; sources/S05 honesty note) report secondary search
results "referencing CVE-2021-22204 (DjVu RCE, 7.44+) and CVE-2021-36370 (directory traversal,
through 12.23)", variously attributed to 12.24, and honestly mark the mapping unverified.
The critic independently fetched authoritative public records:
- CVE-2021-22204 **is** the ExifTool DjVu vulnerability: "Improper neutralization of user data
  in the DjVu file format in ExifTool versions 7.44 and up allows arbitrary code execution"
  (https://security-tracker.debian.org/tracker/CVE-2021-22204, which links the upstream fix
  commit, Launchpad 1925985, and a public writeup). This matches the vendor's 12.24 note
  "Security update (vulnerability in DjVu reader)" (research/sources/S05) in format, timing
  (April 2021), and affected-function area. The mapping is now **corroborated** though the
  vendor page itself never prints the CVE ID.
- CVE-2021-36370 **is not ExifTool at all**: it is Midnight Commander — "the fingerprint of
  the server is neither checked nor displayed" for SFTP, mc ≤ 4.8.26, fixed 4.8.27
  (https://security-tracker.debian.org/tracker/CVE-2021-36370;
  https://ubuntu.com/security/CVE-2021-36370, CVSS 7.5, USN-5160-1). Any secondary source
  calling it an ExifTool directory traversal through 12.23 is simply wrong, not merely
  conflated.
Consequence for the critique: the draft's uncertainty register should be updated from "two
candidates, conflated, unverified" to "CVE-2021-22204 corroborated as the DjVu fix;
CVE-2021-36370 refuted as non-ExifTool." Residual uncertainty (kept honest): the vendor note
names no CVE ID; Debian/Ubuntu shipped backports (DSA-4910-1 to 11.16/10.40; unstable
12.16+dfsg-2), so "12.24 = the upstream fix version" rests on version-note alignment plus the
Debian-linked upstream commit, not on a fetched vendor statement. The public writeup
(blog.devcraft.io) could not be fetched (DNS failure) — recorded, not asserted.
Materiality: the ≥12.24 version floor (a load-bearing recommendation in P4) survives intact;
the refutation removes a phantom second vulnerability from the evidence base.

### MF4 — Encrypted ZIP members can pass the malware gate unscanned; absent from mechanisms and test matrix
P1 accepts ZIP uploads (research/draft.md) and P3 gates on a ClamAV scan
(research/sources/S02). ClamAV cannot decrypt password-protected archive members; the only
documented behavior is *alerting* on the fact of encryption, and it is off by default:
clamd.conf(5) documents `AlertEncrypted` ("encrypted archives and documents (encrypted .zip,
.7zip, .rar, .pdf)"), `AlertEncryptedArchive` ("encrypted archives (encrypted .zip, .7zip,
.rar)") and `AlertEncryptedDoc`, each **"Default: no"**
(https://manpages.debian.org/trixie/clamav-daemon/clamd.conf.5.en.html; the same options are
quoted in the Cisco-Talos/clamav clamd.conf.sample). So a donor can place arbitrary content
in an encrypted member and the out-of-the-box scanner sees nothing — while the draft's P6
matrix tests EICAR only in a plain package and its P1 correction mentions path traversal and
size limits but never encryption. This directly attacks the brief's core malware/quarantine
need. Required design response (proposed, not executed): a service policy — reject encrypted
archives, or enable `AlertEncryptedArchive`-style detection and route to failed; plus a
discriminating validation: an encrypted ZIP containing the EICAR test string must not be
treated as clean. Uncertainty: the man page documents the alert options and defaults; the
inability to decrypt members is the documented reason such alerts exist (and common
knowledge), but no single fetched sentence states "contents are skipped" — flagged as such
rather than overquoted. Related, same origin: ClamAV cannot scan a ZIP from a non-seekable
stream (search-corroborated via exav.org; secondary) — relevant if the service ever pipes
archives to the scanner.

### MF5 — fetch.txt pointer-bag recommendation lacks a trust-boundary control and any test coverage
P1 recommends accepting BagIt fetch.txt pointer bags for large transfers (research/draft.md);
discovery §2 notes §5.2's warning that fetch URLs may point at hosts outside the sender's
control and that "fetched content needs the same validation as uploaded files"
(research/sources/S01, research/discovery.md). Two gaps remain:
1. **file-URL local-read surface**: bagit-python v1.9.0 explicitly "Allow[s] fetch.txt with
   file URLs to validate" (#154; research/sources/S04, confirmed by the critic's fetch of
   https://github.com/LibraryOfCongress/bagit-python/releases). A server-side validator that
   accepts pointer bags therefore accepts *paths on its own filesystem* as fetch targets — a
   local-file-inclusion vector the draft never names. §5.2's remote-host warning does not
   cover it.
2. **No test**: the P6 validation matrix (research/draft.md) contains no pointer-bag case at
   all — neither a remote-URL bag (SSRF/egress control) nor a file-URL bag (LFI control) —
   despite P1 recommending the feature. A recommendation that enters the trust boundary must
   appear in the validation plan that claims to discriminate designs.
Proposed checks (not executed): pointer bag whose fetch.txt lists `file:///etc/` and an
internal-network URL — both must be rejected by policy; a legitimate remote pointer bag
fetches and validates like an upload. Uncertainty: none on #154's text or §5.2; the LFI/SSRF
framing is the critic's inference from confirmed behavior, stated as design reasoning.

## Minor findings

- **m1 "Actively maintained" is an overclaim as of access time.** bagit-python's latest
  release remains v1.9.0 (2025-06-13) — the critic's fresh fetch of
  https://github.com/LibraryOfCongress/bagit-python/releases (2026-10-09) confirms no newer
  release; ~16 months of silence. research/sources/S04 supports "latest release 2025-06-13",
  not "actively maintained". Recommend the draft say "latest release v1.9.0, 2025-06-13;
  verify currency before pinning."
- **m2 Production vs newest ExifTool line conflated.** research/draft.md P4 says "current
  production line 13.55/13.59 at access time". The vendor banner states production is
  **13.55** (Apr 7, 2026); **13.59** (May 27, 2026) is the newest listed entry, with a
  security update unrelated to DjVu (critic fetch of https://exiftool.org/history.html;
  identical to research/sources/S06 — no drift on re-access ~25 min later). Precision fix,
  no substantive consequence.
- **m3 fetch.txt generalization.** The draft says "bagit-python's handling of fetch.txt
  changed as recently as v1.9.0"; precisely, #154 changed validation of fetch.txt *entries
  using file URLs* only (research/sources/S04). Precision nit that feeds MF5.
- **m4 Quarantine scan-order phrasing inconsistency (internal).** The P3 flow is
  "accept → quarantine → scan" (matching S02's quarantine-then-scan rationale), but
  validation proposal 2 speaks of "re-scan on release", implying scan → hold → re-scan.
  Either is a coherent design; the draft should pick one consistently. (research/draft.md P3
  + proposals; research/sources/S02 quote confirmed verbatim by critic fetch.)
- **m5 P1 disposition blend is arguable, not wrong.** "correction + user decision" for P1 is
  defensible under the draft's own definitions (the correction is that ZIP alone = transport
  without validation; the user decision is first-class BagIt acceptance). A critic demanding
  reclassification would be applying taste, not evidence — noted, not raised.
- **m6 P5 "already-covered (intent)" is thin.** The clause's real content is the storage-
  safety correction; the already-covered half adds little. Cosmetic.
- **m7 P6 matrix has two further small gaps.** No legacy-manifest bag (MD5/SHA-1 read-only
  path, which P2 explicitly accepts) and no oversize/resource-limit case (despite P1's "size
  limits"). Same class as MF4/MF5 but lower stakes. (research/draft.md P2/P6.)

## Invalid critic demands (raised nowhere, explained here)

- **"You should have fetched the NVD CVE records."** The predecessor explicitly marked the
  CVE mapping unverified rather than assert from conflated summaries — correct M06 discipline.
  The critic fetched records itself and resolved them (MF3); the original restraint was
  right, and NVD's own anti-scraping behavior (generic "NVD - Home" responses on both CVE
  fetches this stage) shows why fetch-resilient sources matter.
- **"Run the discriminating validations now."** Nothing outside the existing qualified
  sandbox may run witnesses; the draft correctly separates executed checks (six retrievals,
  freeze, hash pins — re-verified by this critic) from proposals. Demanding execution would
  violate the assignment, not improve the science.
- **"Cite sources for zip-slip / Unicode / EICAR design conditions."** The draft presents
  these as design conditions and proposals, not as sourced facts; demanding citations
  misreads the claim types. (Where a claim *is* factual and unsourced — MF4's encryption
  behavior — the critic supplies the citation rather than demanding it retroactively.)
- **"Pick the quarantine duration."** research/source-map.json/S02 and the critic's own fetch
  confirm no default is documented on the fetched page, and the draft correctly defers the
  number to archive policy. Nothing to correct.
- **"Prove the low-cost claim."** The draft bounds it to "open-source components; no per-seat
  license mentioned in cited sources" and explicitly disclaims pricing claims. That is the
  honest maximum the evidence supports.

## Validated predecessor claims (checked, no finding)

- S01 §5.4 integrity/active-attacks quote, §5.2 fetch-URL/spoofing warnings, complete-vs-valid
  definitions, MUST SHA-256/SHA-512 + SHOULD default SHA-512 — all confirmed against
  https://datatracker.ietf.org/doc/html/rfc8493 (two fetches).
- S02 quarantine purpose and ClamAV fail-closed quotes — verbatim confirmed; "no default
  duration" confirmed; "Remove from quarantine after (days)" confirmed absent from the page
  (predecessor's secondary-only marking stands). https://wiki.archivematica.org/Micro-services.
- S03 ClamAV 2023 post: dates, affected/fixed lists, CVE wordings, 0.104 EOL, libmspack
  0.11alpha, public PoC, Simon Scannell — all confirmed.
  https://blog.clamav.net/2023/02/clamav-01038-01052-and-101-patch.html.
- S04 release notes #154/#140/#184 texts confirmed (GitHub releases page).
- S06 snapshot confirmed unchanged on re-access (13.55 production / 13.59 newest / page
  covers 13.36+).
- Evidence-integrity: all six `evidence_sha256` pins in research/source-map.json re-hashed
  and matched (ticket 1).

## Critic's independent source access log (for ticket 4 source-map; minute-precision UTC)

- C01 https://datatracker.ietf.org/doc/html/rfc8493 — fetched 2026-10-09 ~21:16Z and ~21:18Z
  (two retrievals: quote checks; TOC/section-numbering check). Primary; static RFC; locators
  §2.2.3, §2.4, §3, §5.2, §5.4.
- C02 https://security-tracker.debian.org/tracker/CVE-2021-22204 — ~21:18Z. Primary CVE
  record text via distro tracker; description quoted; fix-commit/Launchpad/writeup links noted.
- C03 https://security-tracker.debian.org/tracker/CVE-2021-36370 — ~21:18Z. Primary CVE
  record text; attribution to Midnight Commander; fix mc 4.8.27.
- C04 https://ubuntu.com/security/CVE-2021-36370 — ~21:20Z. Corroborates C03 (mc; CVSS 7.5;
  USN-5160-1).
- C05 https://github.com/LibraryOfCongress/bagit-python/releases — ~21:16Z. Release list
  (v1.9.0 still latest), v1.9.0 change notes (#154/#140/#184 verbatim).
- C06 https://wiki.archivematica.org/Micro-services — ~21:18Z. Quarantine/fail-closed quotes;
  absence of default duration and of "(days)" config text. Mutable page; snapshot 2026-10-09.
- C07 https://blog.clamav.net/2023/02/clamav-01038-01052-and-101-patch.html — ~21:18Z.
  Full confirmation of S03 details.
- C08 https://exiftool.org/history.html — ~21:20Z. Banner 13.55; newest 13.59; range 13.36+.
  Mutable page; snapshot 2026-10-09; no drift vs S06.
- C09 https://manpages.debian.org/trixie/clamav-daemon/clamd.conf.5.en.html — ~21:26Z.
  AlertEncrypted/AlertEncryptedArchive/AlertEncryptedDoc, all "Default: no". Secondary-
  packaged primary documentation (Debian's man page of clamd.conf(5)); upstream sample
  (Cisco-Talos/clamav clamd.conf.sample) quoted identically in search results; upstream raw
  fetch returned 404 at the attempted path. Also NVD CVE pages (both) returned generic
  "NVD - Home" — fetch-blocked, recorded as not-fetched; blog.devcraft.io DNS-failed, not
  fetched; exav.org ClamAV-quirks page seen only in search summaries (secondary, MF4 aside).

Search-engine summaries were used only to locate C09 and the encrypted-archive behavior;
every load-bearing quote in the material findings comes from a directly fetched page or a
retained predecessor excerpt.
