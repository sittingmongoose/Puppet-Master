# Claim-notes — A-M06-B / control / critic (ticket 1: ingest)

Working notes from ingesting the declared inputs. Not the critique; feeds critique.md.
Sources quoted as "Sxx §…" per predecessor source-map.json (IDs kept immutable).
Ingest integrity check (this stage, executed): `sha256sum research/sources/*.md` — all six
hashes match `source-map.json` `evidence_sha256` pins exactly (S01 9973cb…83a6, S02 2397e4…ffe7,
S03 bec2d1…d14f5, S04 c6c962…a207, S05 c29e19…6618, S06 b62f75…03d5). Predecessor claim
"hashes pinned, verified OK" re-confirmed at ingest.

## Input inventory (all present, read in full)
- brief: cases/S12/brief.md (obligations O1–O6; needs: package validation, malware/quarantine
  separation, understandable rejection reports, metadata repair, repeatable transfer history,
  no checksum-proves-provenance assumption; low-cost path).
- predecessor: research/draft.md (P1–P6 dispositions + cross-cutting + proposals + uncertainty register).
- predecessor: research/discovery.md (§1 tools, §2 behavior/defaults, §3 checksum-vs-provenance,
  §4 three evolution chains, §5 competing workflows, §6 honest gaps).
- predecessor: research/source-map.json (S01–S06 + secondary-only X01; immutable IDs).
- predecessor: research/revealed-plan.md (thin plan P1–P6, exact text).
- source roots: research/sources/S01–S06 excerpts (all read).

## P-disposition inventory with challenge candidates

### P1 "Accept ZIP uploads." — draft: correction + user decision
- [CHALLENGE-material-candidate] "BagIt ZIPs (`bagit.zip`-style packages)" — the quoted-style
  name has no support in S01; the retained RFC excerpt defines bags (data/, bagit.txt,
  manifests, fetch.txt) but never a `bagit.zip` convention. Packaging a bag inside a ZIP is
  plausible practice but the draft's phrasing implies a named standard. Check S01 text; likely
  unsupported terminology / false precision.
- [CHALLENGE-minor] Disposition blend: is BagIt acceptance a "correction" to P1 or an
  "optional enhancement"? Draft itself labels BagIt as first-class alternative via user
  decision; the correction half ("ZIP alone = transport, not validation") is well grounded in
  brief + S01 complete/valid split. Argue classification consistency.
- [OK] zip-slip / quarantine-before-extract ordering: design correction grounded in S02
  pattern (quarantine → scan before processing) + general untrusted-input practice; acceptable
  as proposal, but not primary-sourced as zip-slip (no source mentions zip-slip; fine, it is
  presented as design condition, not sourced fact).
- [OK-verbatim] S01 §2.4 fetch.txt exists; S04 #154 fetch.txt file-URL validation change.
  Nuance: #154 concerns *file URLs* specifically; draft sometimes generalizes to "handling of
  fetch.txt changed" — slight overreach, minor.
- [OMISSION-candidate] fetch.txt pointer bags recommended in P1 but absent from the P6
  validation matrix (no test exercises a pointer bag), and §5.2's warning that fetch URLs may
  point outside sender control never gets a corresponding test/control. Internal inconsistency
  between recommendation and validation plan.
- [OMISSION-candidate] P1 recommends "size limits" and path-traversal protection, but no
  encrypted/password-protected ZIP handling anywhere — encrypted members can evade ClamAV
  scanning entirely; a ZIP-accepting malware-gated service needs an explicit policy. Genuine
  gap in the draft's challenge coverage (design-level, flag as material gap or minor? decide
  in critique).

### P2 "Verify SHA-256 checksums." — draft: already-covered (algorithm) + correction ×2
- [OK] "RFC 8493 requires tool support for SHA-256 and SHA-512" — matches S01 ("creation/
  validation tools MUST support"). Already-covered disposition is sound.
- [OK] §5.4 integrity-vs-active-attacks quote and §5.2 spoofing warning — verbatim in S01
  excerpt; the provenance-relabel correction is the strongest-grounded finding in the draft.
- [OK-minor] "emit SHA-512 on outbound/repaired packages (RFC default recommendation)" — S01
  says SHA-512 SHOULD be default for *new bags*; draft's paraphrase accurate (recommendation
  not requirement) — verify critique wording keeps SHOULD status.
- [OK] complete vs valid split — verbatim in S01; drives understandable-rejection-reports need.
- [CARRY] Uncertainty honestly carried: donor-side BagIt familiarity untested (no evidence);
  keep as legitimate user-decision/rollout question, not a flaw.

### P3 "Extract to the archive folder and update a database." — draft: correction + user decision
- [OK-verbatim] S02 quarantine purpose quote + ClamAV fail-closed quote match excerpt word
  for word; quarantine (waiting) vs failed (detected) state separation is well grounded.
- [OK-verbatim] S03: affected ≤1.0.0/≤0.105.1/≤0.103.7 → fixed 1.0.1/0.105.2/0.103.8 on
  2023-02-15; 0.104 EOL unpatched; CVE-2023-20032 HFS+ RCE / CVE-2023-20052 DMG info leak;
  libmspack 0.11alpha; PoC exists for 20032. Draft mapping of DMG↔HFS+ to CVE IDs is correct
  (draft says only "DMG/HFS+ parser CVEs", discovery §1.3 maps them correctly in order).
- [OK-honest] "Remove from quarantine after (days)" marked secondary-only — matches S02
  excerpt's own note and X01; no false primary claim.
- [CHALLENGE-minor] "propose a default (e.g., a week, re-scan on release)" — the *scan order*
  in S02 is quarantine-then-scan (definitions advance during quarantine, then scan). Draft's
  proposal 2 speaks of "re-scan on release", which mixes the Archivematica order
  (scan-after-window) with a re-scan concept. Not wrong as design, but the critique should
  check the draft's flow description is internally consistent (accept → quarantine → scan vs
  scan → quarantine → re-scan).
- [OK] append-only event DB correction — design proposal, coherent with P2 provenance relabel.

### P4 "Let staff edit metadata after import." — draft: optional enhancement + user decision + embedded correction
- [OK-verbatim] S05: 12.24 Apr 13 2021 "Security update (vulnerability in DjVu reader)";
  12.23/12.25 no security notes; vendor page cites no CVE IDs. Draft's CVE-mapping honesty
  matches the excerpt exactly (secondary CVE-2021-22204/36370 conflation flagged, not asserted).
- [CHALLENGE-minor] "current production line 13.55/13.59 at access time" — S06 banner says
  production is 13.55 (Apr 7 2026); 13.59 (May 27 2026) is merely the newest listed entry
  whose security note is unrelated to DjVu. Conflating production vs newest line is a
  precision slip; minor but worth a finding.
- [OK] fixity-regeneration-if-rewritten correction — sound design logic; consistent with P2.
- [CARRY] "whether metadata writing was affected by the DjVu vuln" + introduction date:
  correctly absent from evidence; do not let critique assert beyond S05.

### P5 "Keep original filenames." — draft: already-covered + correction + user decision
- [OK] safe-generated-key + mapping design; collisions named not silently renamed — design
  proposal consistent with untrusted-input posture. No source contradiction.
- [CHALLENGE-minor] "already-covered in intent" disposition is thin — the correction is the
  substance; acceptable but classification could be argued. Low priority.

### P6 "Test with three good packages." — draft: rejected + correction (smoke test)
- [OK] Rejection reasoning (happy-path only) is sound and matches O6.
- [OK] Matrix items map to sources: corrupted payload → S01 complete/invalid; incomplete
  manifest → S01 completeness; EICAR → S02 fail-closed; quarantine release → S02 rationale.
- [OMISSION-candidate] Matrix has no encrypted-ZIP case, no oversize/resource-limit case, no
  fetch.txt pointer-bag case, no legacy MD5/SHA-1-manifest bag case (despite P2 accepting
  legacy manifests read-only). Each is a discriminating validation the draft's own mechanisms
  imply. Decide materiality in critique.

## Cross-cutting / obligation-level challenge candidates
- [CHALLENGE-minor→material?] O1 "unfamiliar tools beyond the thin plan": discovery surfaces
  BagIt/bagit-python, Archivematica, ClamAV, ExifTool — all mainstream in digital preservation.
  §6 honestly lists Siegfried/DROID, PREMIS, ePADD/DSpace as *unresearched leads*. Defensible,
  but a critic may note O1 depth is modest; the honest-gap register prevents dishonesty.
- [CHALLENGE-minor] bagit-python "actively maintained (latest release v1.9.0, 2025-06-13)" —
  at access (2026-10-09) that is ~16 months old; "actively maintained" is an inference from
  the 2025 release, not a demonstrated current fact. Minor overclaim; S04 supports only
  "released 2025-06-13".
- [OK] Low-cost claim bounded to "open-source, no per-seat license mentioned in cited
  sources; no pricing fetched" — honest, no overclaim.
- [OK] "Executed vs proposed" separation (O6): draft's executed list (6 retrievals, reveal-plan
  freeze, hash pins) is checkable and I re-verified hashes at ingest; proposals correctly
  labeled never-run.
- [OK] O4 coverage: all six exact P clauses from revealed-plan.md carry dispositions; none
  skipped. Verify in critique that no clause's *exact text* was altered in quotation.

## Secondary/unverified register (must stay unasserted)
- X01: NVD CVE-2021-22204 / CVE-2021-36370 records; Archivematica dashboard config page —
  never fetched; draft keeps them secondary. Critique must not silently upgrade these.
- Runtime behaviors (bagit-python #154/#184 pre/post differences, ClamAV EOL misses, ExifTool
  floor load-bearing): correctly listed as proposed discriminations, not results.
- Usage/billing: unobserved → null everywhere (nothing claims cost figures beyond licensing
  absence).

## Open questions for critique stage (tickets 2–3)
1. Materiality split for the omission set: encrypted-ZIP evasion; fetch.txt test gap; legacy
   manifest test gap; oversize case; P6 matrix incompleteness vs "smoke test" framing.
2. `bagit.zip`-style terminology — challenge as unsupported by S01 (check exact retained text).
3. 13.55 vs 13.59 production-line conflation precision finding.
4. "Actively maintained" inference vs S04 evidence.
5. Whether P1's correction/optional-enhancement/user-decision blend matches the draft's own
   disposition definitions (O4 consistency).
6. Quarantine scan-order internal consistency (P3 flow vs proposal 2 phrasing).
