# Draft — S12 archive-transfer planning deliverable (A-M12-A / control / research)

Self-contained final for this scope. It retains all useful discovery findings,
conditions, alternatives, constraints, disagreement and uncertainty in full prose
(citations like [S05] point at `source-map.json` + `sources/` but no finding is
replaced by an ID). Later stages may correct it. `discovery.md` was frozen by
`reveal-plan.py` at 2026-10-09T19:00:33Z (sha256 recorded in `plan-reveal.json`)
and was not rewritten after reveal.

Executed checks this stage: NONE (no sandbox; web-primary research only).
Everything under "validation" is PROPOSED. No witness output is claimed anywhere.

Revealed thin plan (exact, `revealed-plan.md`):
P1: Accept ZIP uploads. P2: Verify SHA-256 checksums. P3: Extract to the archive
folder and update a database. P4: Let staff edit metadata after import.
P5: Keep original filenames. P6: Test with three good packages.

---

## 1. O4 — Per-P disposition (every clause)

Disposition vocabulary: correction (plan text must change), optional enhancement
(improvement, plan shippable without), user decision (needs Jared/staff choice),
already-covered (retained as-is), rejected (must not do), uncertain (evidence
insufficient). Each clause keeps its retained kernel and gains conditions.

### P1 "Accept ZIP uploads." — CORRECTION (retain ZIP as one serialization)

Retained kernel: ZIP is a legitimate transfer serialization — BagIt bags are
routinely serialized as `.zip`/`.tar`, and donor tooling built on the BagIt File
Packaging Format (RFC 8493 v1.0, Oct 2018, Informational) explicitly serves
"reliable storage and transfer" of arbitrary content without payload-semantics
knowledge [S01].

Why the clause as written is wrong:
- A bare ZIP is not a transfer unit: no manifest, no fixity contract, no
  provenance fields. The evidenced transfer unit is the BagIt bag (payload +
  tags + manifests), created donor-side with bagit-python or an Exactly-class
  sender app and validated staff-side before anything else happens [S05][S09d].
- ZIP-as-content is a format-identification trap: PRONOM-signature engines
  (DROID and Siegfried alike) identify ZIP-container formats as plain ZIP when
  no container signature expresses the inner format (worked USDZ example)
  [S07d]. "Accept ZIP" with no identification policy auto-passes opaque containers.
- Nested archives interact with malware-scanner recursion caps (ClamAV
  MaxRecursion 16, MaxFiles 10000 in current guides [S08c]); scan-before-extract
  ordering (§3) matters, and bare-ZIP acceptance says nothing about it.

Corrected clause: accept BagIt packages as directory, `.zip`, or `.tar`
serializations through a donor-onboarding path (Exactly-class app for
low-skill donors, bagit-python CLI for capable ones); bare ZIP without a
bag structure enters a LEGACY lane where staff re-bag on receipt and the
re-bagging is logged as a provenance event. ZIP remains a transfer
serialization only — never the preservation storage form (that is a
versioned object store, §3).

### P2 "Verify SHA-256 checksums." — CORRECTION (dangerous incompleteness)

Retained kernel (already-covered part): SHA-256 verification stays. It is half
of the bagit-python default (SHA-256 AND SHA-512 are both generated unless
flags select otherwise) [S05], and manifest verification is the correct
fixity mechanism.

Why the clause as written is wrong:
- It invites the exact fallacy the brief forbids: a matching checksum proves
  bit-level integrity/attendance across the handoff, NOT donor identity,
  pre-bag tampering, or metadata truth. Every accepted transfer additionally
  needs a provenance record (who/when/how-received, submission docs,
  scan/ID/validation verdicts) stored with the object; the checksum is one
  field in it, not the verdict [S01][S06][S09d].
- "Verify checksums" underspecifies the check: bagit-python's `--validate
  --fast` examines structure plus payload-oxum (byte count + file count) ONLY,
  while full `--validate` walks every manifest checksum, optionally parallel
  (`--processes N`) [S05]. Fast mode is triage, not proof; reports must label it.
- It names one failure mode but the validator produces three typed outcomes —
  `ChecksumMismatch` (with path, algorithm, expected, found), `FileMissing`,
  `UnexpectedFile` — and the payload-oxum pre-check can catch gross damage
  first [S05]. The rejection report must handle all three, not "checksum OK/fail".
- One-shot verification is not fixity: scheduled re-validation over time is
  required (open AVP Fixity is dead — COPTR status Gone, superseded by Fixity
  Pro [S09] — so the default is scheduled bag/OCFL re-validation, §3).

Corrected clause: full manifest validation over SHA-256+SHA-512 defaults at
ingest (fast mode for triage only, labelled preliminary), typed-error rejection
vocabulary, provenance record alongside every verdict, and scheduled
re-validation as the fixity program. SHA-256-only permitted only as a documented
local option for large donor pre-checks.

### P3 "Extract to the archive folder and update a database." — CORRECTION (major; ordering + architecture)

Retained kernel: after acceptance there IS a preservation store and there IS an
index. The "folder + database" shape survives only as the degenerate small-site
form WITH conditions (below).

Why the clause as written is wrong:
- Order of operations is unsafe: extract-then-whatever skips the evidenced
  pipeline order — malware scan + quarantine decision BEFORE extract (nested
  archives, recursion caps), then validation, then format identification, then
  versioned ingest [S08][S05][S07]. ClamAV over-limit content is otherwise
  silently unscanned under default caps unless ClamAV ≥1.2 with
  `--alert-exceeds-max`/`AlertExceedsMax` converts skips into alerts [S08d],
  and files over 2 GB are unscannable by design ("technical design
  limitations") and need an explicit exception lane with a documented non-scan —
  never a fake "clean" [S08c]. Oral-history video from small donors will hit
  this ceiling; the plan must name the lane.
- A plain folder is not preservation storage: no versioning, no fixity binding,
  no re-validatable history. The evidenced storage contract is the Oxford Common
  File Layout v1.1 (application-independent, transparent object storage;
  completeness/parsability/versioning/robustness/storage-diversity): every
  object carries a root `inventory.json` for the current version, version dirs
  SHOULD carry their own, the digest sidecar is written LAST, versions are
  immutable, and validation implements fixity checking [S02][S04-secondary].
  Re-running validation later reproduces verdicts or explains drift.
- "Update a database" underspecifies the history the brief demands
  ("repeatable transfer history"). The evidenced history elements are:
  per-transfer bag manifests + validation logs + scan verdicts + ID reports +
  repair events + provenance record, then versioning of the preserved result
  (OCFL versions in the lightweight pipeline; METS/PREMIS + Storage Service in
  Archivematica, where transfer names become AIP names and accession numbers
  land in AIP METS as registration events) [S06]. Tool/signature/spec versions
  must be recorded on every run or later re-validation cannot explain drift.
- Path safety: storing donor-supplied paths verbatim risks traversal/oddity
  bugs — the OCFL ecosystem carries an explicit path-validation fix for exactly
  this (ocfl-java PR #70: never access files outside the object) [S03b].
  Ingest must validate content paths (ties to P5).

Corrected clause: staged pipeline
quarantine-scan → validate → identify → versioned-store → index, with a
rejection path at every stage; preservation store is an OCFL v1.1 storage root
(lightweight default) or Archivematica AIPs (heavyweight alternative, §4); the
"database" is a transfer-event/provenance index recording every verdict with
tool versions. Degenerate small-site permission: OCFL-on-disk plus a simple
event log is acceptable; plain-folder-plus-untracked-DB is REJECTED as
preservation storage.

### P4 "Let staff edit metadata after import." — CORRECTION (timing + guard)

Retained kernel (already-covered part): staff CAN edit metadata, including
after import. Curatorial post-ingest editing is legitimate and stays.

Why the clause as written is wrong:
- Post-import-only editing misses the two earlier evidenced metadata points:
  recipient-defined sender templates filled before submission (Exactly model,
  with delivery email carrying transfer data + manifests) [S09d], and typed
  ingest metadata (descriptive/rights/event, submission documentation,
  existing checksums/PIDs) at transfer time (Archivematica transfer types)
  [S06]. Pushing everything post-import guarantees re-work and weak provenance.
- Unconditional post-import editing breaks the fixity contract: in bagit-python,
  `save()` deliberately does NOT regenerate manifests by default so a
  metadata-only save cannot bless an invalid bag; payload changes require
  `save(manifests=True)` [S05]. A repair workflow that edits `data/` without
  re-manifesting plus re-validating silently invalidates the bag. Every repair
  must re-run validation and append an event.
- Silent DB edits destroy repeatability: post-ingest edits must be versioned
  events (new OCFL version / METS event), not in-place overwrites.

Corrected clause: metadata at three points — sender template pre-submit,
staff repair pre-ingest, curatorial post-ingest — with the repair loop
(template → `bag-info.txt` edit + `save()` metadata-only, or
`save(manifests=True)` + re-validate when payload is touched → repository
descriptive top-up), every edit logged as a versioned event, and no
repair-then-ship without re-validation. Dedicated repair/characterization
editors (ExifTool-class, MediaConch-class, JHOVE-output loops) were NOT
verified this pass and remain named follow-ups, not specified tooling.

### P5 "Keep original filenames." — USER DECISION with recommended default + conditions

This is the one clause that is neither clearly right nor clearly wrong; it
needs a staff choice because the brief does not state access-system or
donor-deed requirements (uncertainty §6).

- Preservation argument FOR: original names are provenance evidence (chain of
  custody, donor recognition, deed matching). Nothing in the evidence says to
  discard them.
- Safety argument AGAINST verbatim storage: traversal/confusion/collision risk
  (cf. the OCFL path-validation fix [S03b]); Unicode, overlong, and
  case-colliding names; OCFL's content-addressed layout exists precisely to
  decouple storage identity from donor naming [S02].
- Recommended default (a decision proposal, not a finding): preserve original
  names in the manifest/metadata/accession record AND show them in rejection
  reports, but store bytes under safe opaque-or-sanitized names inside the
  object. That satisfies provenance and safety jointly.
- The decision to put to staff: (a) accept the recommended default; (b) any
  deed/access constraint requiring verbatim on-disk names (if yes, add a
  path-sanitization + collision + traversal-test rule to the validation matrix).

Disposition: user decision. No correction is forced, but shipping P5 verbatim
without the storage-identity rule is rejected: "keep" must mean "preserve as
recorded metadata", never "trust as a storage path".

### P6 "Test with three good packages." — CORRECTION (grossly inadequate)

Retained kernel: three good packages survive as the SMOKE subset of deployment
validation (V6), not as the test plan.

Why the clause as written is wrong: three happy-path packages cannot
discriminate any consequential behavior — no bad checksum, no missing/
unexpected file, no malware hit, no over-limit archive, no >2GB file, no
unknown/generic-container format, no fast-vs-full divergence, no
provenance-incomplete acceptance. A test plan that cannot fail is not a plan.

Corrected clause: the discriminating validation matrix V1–V7 (§5), each item
capable of changing a recommendation. P6's three packages become V6's intake
smoke set inside a matrix that also carries negative, adversarial, and
repeatability cases, with executed-vs-proposed tracking from day one.

---

## 2. O5a — Retained findings (what the build takes as given)

- Transfer unit: BagIt bags (RFC 8493) created with bagit-python/Exactly-class
  tooling; bare ZIP only via the staff re-bag legacy lane (P1).
- Validation: full manifest walk over SHA-256+SHA-512 defaults; typed errors
  (`ChecksumMismatch`/`FileMissing`/`UnexpectedFile`) as the package-validation
  report vocabulary; fast/oxum mode labelled triage-only (P2).
- Storage: OCFL v1.1 objects (pinned validator + spec version; E-code-keyed
  messages) as the lightweight preservation store; E-code semantics ERROR↔MUST,
  WARNING↔SHOULD, validators covering objects AND roots; exactly-one
  conformance declaration; UTF-8 inventories; manifest/state correspondence;
  monotonic spec versions across immutable versions [S02][S03][S04].
- Malware: version-controlled `clamd.conf`/`freshclam.conf`, Unix socket
  (tightened mode — the default is world-RW [S08b]), TCP never exposed
  (unauthenticated by design [S08]); version ≥1.2 with the exceeds-max alert
  set; quarantine directory + report as application architecture; >2GB
  exception lane with documented non-scan (P3).
- Format ID policy names TOOL + PRONOM snapshot + fallback order
  (Siegfried → JHOVE → extension + human): Siegfried for CLI/batch throughput,
  DROID for GUI-led small batches, JHOVE where version detail is policy
  (proven TIFF-version gap [S07c]), generic-container results never auto-pass
  (PRONOM container gap [S07d]).
- Provenance: per-transfer record (who/when/how-received + submission docs +
  scan/ID/validation verdicts with tool versions) stored WITH the object;
  checksums are one field (P2/P3). Post-ingest edits are versioned events (P4).
- Fixity program: scheduled re-validation (bag/OCFL), NOT the dead open-Fixity
  binary; Fixity Pro only after a license/cost/API evaluation (§3.2 chain).
- Rejection reports (two views, one source): staff view = code + tool +
  tool-version + signature/spec version + path (BagIt typed errors, OCFL
  E-codes + spec anchors, ClamAV verdicts + exceeds-max alerts + >2GB
  non-scans, Siegfried unknown/generic/version-gap flags); donor view =
  plain-language sentence + what-to-do-next + resubmit path.
- Filenames: recommended default per P5 (originals preserved as metadata,
  storage under safe names), pending the staff decision.

## 3. O5b — Reference pipeline (lightweight default) + version pins

Donor-side Exactly/bagit-python bags → staff intake (legacy re-bag lane for
bare ZIP) → ClamAV scan + quarantine dir + >2GB lane → bagit-python full
validate → Siegfried → JHOVE fallback → OCFL v1.1 object store → scheduled
re-validation → S3-compatible backend (MinIO-class single container; same code
runs against MinIO or AWS via env vars; path-style addressing required [S11];
portable across R2/B2/Wasabi/GCS-interop via the S3 API [S11b]).

Implementation/version conditions (all evidenced, none invented):
- BagIt RFC 8493 v1.0; bagit-python pinned release AND the three documented
  behaviors (dual-hash default, `save()` guard, fast-vs-full) encoded in code
  review checklists [S05]. (Current release number unverified — pin at build.)
- OCFL 1.1 + pinned validator; E-code-keyed messages cite validator + spec
  version because codes shifted between 1.0 and 1.1 (E103/E106/E107 added,
  E003/E076 updated via issues #544/#537/#581 [S03]).
- ClamAV ≥1.2, exceeds-max alert ON, `clamd.conf` in version control,
  freshclam freshness monitored; offline sites need a signature-mirror
  procedure (follow-up detail).
- Siegfried/DROID pinned with PRONOM snapshot recorded per run; JHOVE pinned
  for version-sensitive policy.
- S3 backend: re-check MinIO licensing before recommending (NOT verified this
  pass); SeaweedFS (Apache-2.0, all-in-one `server -s3`) is the named
  alternative to evaluate [S11c].
- Low-cost shape: single host + containers; indexless-by-default thinking
  (no Elasticsearch-class dependency in the lightweight pipeline at all).

## 4. O5c — Alternatives retained (with fit conditions)

- Heavyweight: Archivematica full pipeline (Transfer tab → SIP → ingest
  micro-services → AIP + DIP; typed transfers incl. metadata, submission docs,
  existing checksums/PIDs, manual-normalization derivatives [S06]). Choose it
  where normalization + METS/PREMIS + multi-seat workflow justify the ops cost.
  Conditions: pin Archivematica+Storage Service as a pair (1.16.0+SS 0.22.0
  dated May 16 2024; 1.17.x needs ES 6, 1.18.x needs ES 8, upgrade tooling
  refuses on mismatch [S06b]); default to indexless (ES optional since 1.7;
  skipping cuts compute/complexity, costs Backlog/Appraisal/Archival-Storage
  search [S06c]) unless staff search is proven necessary.
- Second full-pipeline name: RODA (configurable ingest workflow, ingest
  automation, characterization/metadata-extraction tooling [S10]). Evaluate
  before committing to Archivematica; no RODA primary read this pass.
- Hosted: ArchivesDirect/DuraCloud-class or Preservica/Rosetta-class. Names
  only, no verified pricing/features [S10b][S10c]. Fit condition: no-ops staff
  with budget; require a priced trial before any commitment.
- Small-donor UX fork: Exactly-class GUI (templates, sync-service +
  removable-media paths, delivery email with manifests [S09d]) vs bagit-python
  CLI for capable donors [S05][S09f] vs Bagger legacy knowledge only (LoC use
  into 2020 [S09c], but "no longer maintained or supported" per SFU [S09b] —
  disagreement retained, §7).
- Signed-bag pointer: harvard-lil/bag-nabit named as a provenance-adjacent
  follow-up, not a recommendation [S09e].

## 5. O6 — Discriminating validations: executed vs proposed

EXECUTED this stage: none. No sandbox existed; no command ran against any
candidate tool (the only executions were directory listing, JSON validation,
time checks, and the mandated `reveal-plan.py`). The matrix below is entirely
PROPOSED. Each item states what decision it can flip.

- V1 BagIt round-trip: `make_bag` → corrupt one payload byte → `validate()`
  must raise `ChecksumMismatch` naming path/algorithm/expected/found; the same
  bag under `--fast` must PASS. Flips: report wording + fast/full policy (P2).
- V2 Repair-guard: metadata-only `save()` on an invalid bag must NOT bless it;
  `save(manifests=True)` after a payload edit must restore validity. Flips:
  repair-loop correctness (P4).
- V3 OCFL E-code mapping: fixtures violating E003/E009/E106/E107 through the
  pinned validator must return exactly those codes. Flips: rejection-report
  keys + validator pin (P3).
- V4 ClamAV lanes: EICAR test file detected + quarantined; crafted over-limit
  archive with the exceeds-max alert set produces an ALERT (not silent pass);
  >2GB file routes to the exception lane with a non-scan record. Flips:
  quarantine design + version floor (P3).
- V5 Format-ID fallback: version-sensitive TIFF sample through
  Siegfried → JHOVE → human asserts version recovery; ZIP-container sample
  asserts no blanket pass. Flips: ID policy wording (P1/P3).
- V6 Deployment smoke: single-host compose (validator + clamd/freshclam + OCFL
  store + S3-compatible backend) ingests P6's three good packages end-to-end,
  then re-runs validation to reproduce verdicts. Flips: lightweight-vs-
  Archivematica on real effort numbers (§4). P6 survives ONLY as this smoke set.
- V7 Provenance record: a bag with VALID checksums but missing/weak submission
  docs must still flag provenance-INCOMPLETE. Flips: whether the brief's core
  constraint (checksum ≠ provenance) is actually implemented (P2).

Scope honesty (O6): this matrix validates the small-product brief (donor
handoff → quarantine → validated, versioned preservation with honest reports),
not unlimited production guarantees. Load, multi-tenancy, and long-horizon
media migration are out of scope.

## 6. Uncertainty + disagreement register (carried forward)

- U1 Exactly canonical repo URL (medium confidence; two guessed URLs 404'd;
  facts rest on fork README + vendor guide + index records — S09d note).
- U2 Current release numbers: bagit-python, Siegfried engine + PRONOM snapshot,
  ocfl-java/gocfl/rocfl, MinIO + its license, ClamAV latest. Pin at build; no
  "current version" claims made.
- U3 Fixity Pro cost/features/API; RODA depth; JHOVE/MediaConch/ExifTool roles;
  ClamAV/PRONOM offline-mirror procedures and signature-update cadence.
- U4 OCFL v1.1.0→v1.1.1 item list (partially observed — retrieval truncated).
- U5 Archivematica virus-scan/format-ID micro-service admin configuration
  (transfer docs read; admin config not read).
- U6 Staff-side unknowns for P5: deed/access constraints on verbatim filenames;
  access-system search needs (affects indexless-vs-ES only in the heavyweight fork).
- Disagreement retained: Bagger "established + LoC-used into 2020" vs "no
  longer maintained" — resolved as legacy-only knowledge, not the donor default.
- Honest negatives: no CVE/regression records pulled for ClamAV/bagit-python/
  Siegfried (time-boxed, not "none exist"); no witness runs; no pricing evidence
  for any commercial option.

## 7. Constraints that must survive into build (original + derived)

- Checksum ≠ provenance (brief; evidenced §P2). Any future edit implying
  otherwise is a defect.
- No silent passes: fast-mode labelled triage; exceeds-max alerts on; >2GB
  non-scans recorded; generic-container IDs held for staff (P2/P3/V4/V5).
- No repair-then-ship without re-validation + event append (P4/V2).
- No shift of E-code/report keys without validator+spec version citation (P3/V3).
- No Archivematica/ES half-upgrades (version-pair pin, §4 chain).
- Filenames preserved as metadata; storage paths validated, never trusted (P5).
- Validations stay discriminating and tracked executed-vs-proposed; V1–V7 are
  the acceptance bar P6 failed to be.

---

*End of draft. Required science artifacts in this directory: `discovery.md`
(frozen pre-reveal), `source-map.json`, `sources/` (+ index), this `draft.md`,
plus `revealed-plan.md` / `plan-reveal.json` written by the reveal step.*
