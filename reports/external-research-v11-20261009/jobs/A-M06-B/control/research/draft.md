# Draft — S12 archive-transfer plan comparison (A-M06-B / control / research)

- Generated: 2026-10-09T21:1xZ (UTC), after `reveal-plan.py` froze discovery.
- Inputs: `cases/S12/brief.md` (obligations O1–O6), frozen `discovery.md` +
  `source-map.json` (S01–S06, written before reveal, hashes pinned), and
  `revealed-plan.md` (the thin plan quoted below). Discovery was **not** rewritten after
  reveal; this draft is the complete planning deliverable for this scope. Later stages may
  correct it.
- Dispositions used (per O4): **correction**, **optional enhancement**, **user decision**,
  **already-covered**, **rejected**, **uncertain**. Every P clause carries one; several carry
  more than one where the clause needs splitting.

## P1 — "Accept ZIP uploads."

Disposition: **correction** (keep the clause; change what surrounds it) + **user decision**
(accept BagIt bags as a first-class alternative?).

Retained findings and reasoning:
- A bare ZIP carries no manifests, so P1 alone gives transport, not *package validation*
  (brief need). BagIt (S01) provides the validation structure: a bag is *complete* when all
  required elements are present and every payload file is listed in every payload manifest,
  and *valid* only when checksums also verify. Accepting ZIP is workable if the service either
  (a) accepts BagIt ZIPs (`bagit.zip`-style packages) and validates them with bagit-python, or
  (b) wraps an incoming plain ZIP into a bag on arrival so validation and history attach to
  something structured.
- Security conditions on extraction (from S02/S03): the ZIP must be treated as untrusted input
  — quarantined, scanned, and extracted with path-traversal protection (zip-slip) and size
  limits — before any archive-folder write. This is a correction to the implied flow (extract
  happens only after the P3 gate below).
- Alternative transport worth retaining: BagIt `fetch.txt` pointer bags for large donor
  transfers (S01 §2.4) — a small manifest first, files fetched at ingest; bagit-python's
  handling of fetch.txt changed as recently as v1.9.0 (#154, S04), so version-pin it.

## P2 — "Verify SHA-256 checksums."

Disposition: **already-covered** (the algorithm choice) + **correction** (what the checksum
means and how failure is reported).

- Already-covered: SHA-256 is a sound, interoperable choice — RFC 8493 requires tool support
  for SHA-256 and SHA-512 (S01); verification against a supplied SHA-256 matches standard
  practice. No change needed to the algorithm itself.
- Correction 1 (semantics): per the brief, the design must not assume a checksum proves
  provenance. BagIt's own RFC states its integrity checking "is designed to provide high levels
  of confidence against data corruption but is not designed to be secure against active
  attacks" and points to digital signatures for stronger guarantees (S01 §5.4); §5.2 adds that
  older checksums may not resist intentional spoofing. So the checksum verdict must be labeled
  as *fixity/corruption detection*, with provenance carried by the transfer-history record
  (who/what/when/channel/tool-version), not by the hash alone.
- Correction 2 (reporting): a single pass/fail hides the useful distinction. Adopt the
  BagIt *complete* vs *valid* split (S01) so rejection reports can say "package structurally
  complete; these N files failed checksum" — the understandable-rejection-report need.
- Condition: if accepting BagIt bags, honor their manifests; read MD5/SHA-1 legacy manifests
  read-only; emit SHA-512 on outbound/repaired packages (RFC default recommendation, S01).
- Uncertain (carried from discovery): whether donor-side tooling in this region commonly emits
  BagIt packages at all — no evidence either way was gathered; treat as a survey/rollout
  question.

## P3 — "Extract to the archive folder and update a database."

Disposition: **correction** (ordering and safety gate) + **user decision** (quarantine window
length).

- Correction (ordering): extraction into the archive folder must come **after** the malware
  gate, not as part of a single step. The Archivematica pattern (S02) separates: quarantine
  "for a set duration, to allow virus definitions to update, before virus scan"; then "Scan for
  viruses … uses ClamAV …; if a virus is found, the transfer is automatically placed in
  …/failed/ and all processing on the transfer is stopped." Concretely: accept → quarantine →
  scan (fail-closed to a failed area, never the live archive) → extract path-safely → database
  update. Quarantine (waiting) and failed (detected) must remain distinct states with distinct
  staff reports.
- Correction (dependency conditions): ClamAV must run a supported branch — the 2023 patch
  releases fixed ≤1.0.0/≤0.105.1/≤0.103.7 in 1.0.1/0.105.2/0.103.8 and explicitly did **not**
  patch the EOL 0.104 branch (S03). The engine and its definition set are attack surface fed
  directly by donor files (DMG/HFS+ parser CVEs, S03), so run it unprivileged and record its
  version with each verdict.
- Correction (database): the database update belongs after acceptance and should be
  append-only event records (transfer history: receipt, quarantine start/end, scan verdict +
  engine version, validation verdict complete/valid, metadata operations, staff actions) — the
  brief's "repeatable transfer history" and the provenance weight once checksums are
  disclaimed as authenticity proof (P2 correction 1).
- User decision: quarantine duration. Archivematica exposes it as configuration ("Remove from
  quarantine after (days)" — seen only in unfetched search summaries, so **secondary**) and the
  fetched micro-services page states no default (S02). The number is archive policy (risk
  appetite vs donor turnaround); propose a default (e.g., a week, re-scan on release) but mark
  it for staff decision.

## P4 — "Let staff edit metadata after import."

Disposition: **optional enhancement** + **user decision** (overlay vs rewrite) + embedded
**correction** (untrusted-input handling and fixity).

- Optional enhancement: the thin plan's staff-editing is a useful *access-layer* capability
  (authoritative descriptive metadata overlay). It does not by itself deliver the brief's
  "metadata repair," which happens earlier: normalizing/repairing embedded metadata on untrusted
  donor files with ExifTool (S05/S06) — version floor ≥12.24 (12.24: "Security update
  (vulnerability in DjVu reader)", Apr. 13, 2021), current production line 13.55/13.59 at
  access time — run sandboxed, because a metadata *reader* has been exploitable through file
  content.
- Correction embedded: if embedded metadata is rewritten in place, file bytes change and every
  checksum/manifest must be regenerated, with the event appended to the transfer history;
  otherwise the fixity record silently breaks.
- User decision: staff edits live as a database/overlay layer (originals + fixity untouched) or
  rewrite embedded metadata (fixity regenerated, history extended). Recommend overlay-first.
- Uncertain (carried from discovery, honest gap): the specific CVE-to-fix mapping for ExifTool
  12.24 is unverified — the vendor page cites no CVE numbers (S05), and secondary search
  results conflated CVE-2021-22204 and CVE-2021-36370. Only the vendor's own note is primary.
  Also absent from evidence: whether metadata *writing* (vs reading) was affected by the 2021
  DjVu vulnerability, and when the vulnerability was introduced.

## P5 — "Keep original filenames."

Disposition: **already-covered** (intent aligns with chain-of-custody) + **correction**
(storage safety) + **user decision** (Unicode normalization policy).

- Already-covered in intent: preserving original names is consistent with the provenance
  posture retained from discovery (originals plus history carry the evidence; §3 of discovery).
- Correction: original filenames are untrusted input — inconsistent encodings, control
  characters, path separators, reserved names, collisions. Keep the original byte-exact name as
  recorded metadata (in the bag `bag-info.txt`/manifests and the database), but store the file
  under a safe generated key with a mapping, so a hostile or merely weird name can never affect
  storage layout or the web app. Rejection reports must name collisions explicitly rather than
  silently renaming.
- User decision: whether access copies normalize Unicode (e.g., NFC) and case for staff
  search, while originals stay untouched. Recommend yes for access copies, never for stored
  originals; flag as policy.

## P6 — "Test with three good packages."

Disposition: **rejected** (as a sufficient validation plan) + **correction** (keep it as a
smoke test inside a larger matrix).

- Three good packages exercise only the happy path and cannot detect any failure the brief
  cares about (malware handling, quarantine timing, rejection-report quality, fixity failure
  reporting). As the *whole* test plan it is rejected; as a smoke test it is retained.
- Correction — the discriminating validation matrix (see also the proposals section): good
  packages; a package with one corrupted payload file (must report *complete-but-invalid* with
  per-file detail, not a generic fail); an incomplete manifest (must report *incomplete* with
  the missing list); a zip-slip attempt (must be blocked); an EICAR standard antivirus test
  file (must route to the failed path, not quarantine-wait, and halt processing); a benign
  package released after the quarantine window (must re-scan with updated definitions and then
  proceed); a report-readability pass with a non-technical donor.

## Cross-cutting gaps in the thin plan (retained, not tied to one P)

- **Malware/quarantine separation as a first-class concept** (brief need): only P3 touches
  malware, implicitly. The P3 correction supplies it.
- **Understandable rejection reports** (brief need): only addressable via the P2
  complete/valid split and P5 collision reporting.
- **Repeatable transfer history** (brief need): addressed by the P3 database correction
  (append-only events with tool versions) and P2's provenance relabeling.
- **Low-cost deployment path** (brief): the composable path from discovery §5 — bagit-python +
  ClamAV + ExifTool + a small scheduler — against the monolithic alternative (adopt
  Archivematica whole). All cited components are open-source; no per-seat licensing appears in
  any cited source; no pricing claims beyond that are made.

## Optional capabilities and user decisions (consolidated)

1. BagIt-bag acceptance as first-class input alongside plain ZIP (P1).
2. fetch.txt pointer-bag intake for large transfers (P1).
3. Quarantine window length and re-scan policy (P3).
4. Staff metadata edits as overlay vs embedded rewrite (P4).
5. Unicode/case normalization for access copies (P5).

## Uncertainty register

- ExifTool 12.24 ↔ specific CVE mapping: unverified (vendor page cites no CVE IDs; S05).
- Whether ExifTool metadata writing was affected by the 2021 DjVu vulnerability: absent from
  all fetched evidence.
- Archivematica default quarantine duration and dashboard config text: secondary-only
  (search summaries; not fetched; S02 records the gap).
- Regional donor familiarity with BagIt packaging: no evidence gathered.
- bagit-python behavior differences pre/post v1.9.0 for fetch.txt file URLs (#154) and the
  unsafe-path check (#184): release notes are primary; runtime behavior differences are
  unverified (nothing was executed).

## Discriminating validation proposals (PROPOSED — none executed)

Each proposal is chosen to distinguish between competing designs or versions, per O6:

1. **Fail-path discrimination**: run an EICAR test file through intake. Distinguishes
   fail-closed (routes to failed, halts) from quarantine-wait (would sit out the window) —
   validates the P3 state separation against Archivematica's documented behavior (S02).
2. **Quarantine-window discrimination**: release a clean package after the window with
   definitions updated mid-window. Distinguishes "re-scan on release" implementations from
   "scan-once" ones, testing the S02 rationale (definitions advance during quarantine).
3. **Report-quality discrimination**: corrupted-file and incomplete-manifest packages.
   Distinguishes complete/valid two-level reporting (S01) from single binary verdicts; a
   non-technical donor comprehension check discriminates report designs.
4. **Library-version discrimination**: same inputs validated under bagit-python 1.8.1 vs
   1.9.0. Release notes say fetch.txt file-URL validation and the unsafe-path check changed
   (S04); running both discriminates whether pinning matters for our accepted inputs.
5. **Scanner-branch discrimination**: ClamAV on a supported branch (≥1.0.1) vs an EOL branch
   (0.104) against the S03 CVE-era samples if obtainable — expected to show EOL misses; in
   practice this validates the dependency-pinning rule rather than the CVEs themselves.
6. **Fixity-vs-provenance discrimination**: tamper with a payload file *and* update its
   manifest checksum. The package validates (P2 passes) — demonstrating the checksum cannot
   detect deliberate substitution and that transfer history is the compensating control
   (S01 §5.4, brief's assumption-ban).
7. **ExifTool floor check**: feed a malformed DjVu to the metadata-repair step on ≥12.24 vs an
   older build in a sandbox. Distinguishes whether the version floor is load-bearing for our
   input mix.

## Executed checks (this stage only — nothing above has run)

- Six primary-source retrievals (WebFetch) recorded in `source-map.json` with access
  timestamps; bounded excerpts retained in `sources/` with SHA-256 pins (verified OK).
- `reveal-plan.py` run; exit 0; discovery frozen (pre/post hashes identical).
- All design statements above are **proposals with cited evidence**; no code was run, no
  scanner invoked, no packages processed. "No runtime available" is honest here; items 1–7
  remain proposed work.
