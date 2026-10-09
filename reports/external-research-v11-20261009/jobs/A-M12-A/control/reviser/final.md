# Final — S12 archive-transfer planning deliverable (A-M12-A / control / reviser)

Self-contained final for this scope. It retains all useful discovery findings,
conditions, alternatives, constraints, disagreement and uncertainty in full prose.
Citations like [S05], [C02], [R03] point at `source-map.json` + `sources/` but no
finding is replaced by an ID. Predecessor IDs S01–S11 (research) and C01–C04
(critic) are cited as inspected-not-reobserved except where a reviser source R01–R04
independently reconfirms the same fact (stated explicitly). Every criticism in the
observed critique text is explicitly accepted, amended, rejected, or held uncertain
in §8; no criticism was obeyed automatically — each was checked against evidence,
including four independent reviser re-observations.

Executed checks this stage: NONE (no sandbox; web-primary research only).
Everything under "validation" is PROPOSED. No witness output is claimed anywhere.

Boundary condition — truncated critique: the predecessor `critique.md` file ends
mid-sentence at "V2 (repair-guard: metadata-only `save()` must not bless; ..." with
a literal truncation marker. Everything from V2's applicability verdict onward
(V2–V7 verdicts, any further sections) is UNOBSERVED, not disagreed with. This final
therefore retains V2/V3/V5/V6/V7 as written (amending only V4, which is fully
determined by the observed findings F1/F3), adds V8 (proposed in the fully-observed
M6 text), and records the truncation as uncertainty U7. No validation item was
weakened or dropped on the basis of unseen text.

Revealed thin plan (exact, `revealed-plan.md` as frozen for the research stage):
P1: Accept ZIP uploads. P2: Verify SHA-256 checksums. P3: Extract to the archive
folder and update a database. P4: Let staff edit metadata after import.
P5: Keep original filenames. P6: Test with three good packages.

Summary of what revision changed relative to `draft.md`: ClamAV floor raised to
≥1.2.1 with a named alert string (F1); P2 split into correction + optional
enhancement (F2); clamav-large-archive-scanner named as an archives-only evaluated
alternative with the critic's video-benefit sentence corrected (F3); legacy lane
retains as-received bytes (F4); `.tar` demoted to follow-up (M1); traversal cite
softened (M2); comparison-table editorial fragment repaired (M5); Exactly
staleness flag + V8 interop validation added (M6); P5 restated as decision plus
non-negotiable condition (M9); degenerate-permission enforceable line added (P3
review). All other draft content is retained.

---

## 1. O4 — Per-P disposition (every clause)

Disposition vocabulary: correction (plan text must change), optional enhancement
(improvement, plan shippable without), user decision (needs staff choice),
already-covered (retained as-is), rejected (must not do), uncertain (evidence
insufficient). Each clause keeps its retained kernel and gains conditions.

### P1 "Accept ZIP uploads." — CORRECTION (retain ZIP as one serialization)

Retained kernel: ZIP is a legitimate transfer serialization — BagIt bags are
routinely moved as packed directories, and donor tooling built on the BagIt File
Packaging Format (RFC 8493 v1.0, Oct 2018, Informational) explicitly serves
"reliable storage and transfer" of arbitrary content without payload-semantics
knowledge [S01]. My independent read of the bagit-python README [R01] confirms bags
are directory structures created/validated by the tool; packing a finished bag
directory into a `.zip` for transit is a transport step outside the tool, which the
staff side reverses (scan → extract → validate) before any fixity verdict.

Why the clause as written is wrong (load-bearing argument first): a bare ZIP is
not a transfer unit — no manifest, no fixity contract, no provenance fields. The
evidenced transfer unit is the BagIt bag (payload + tags + manifests), created
donor-side with bagit-python or an Exactly-class sender app and validated
staff-side before anything else happens [S05][S09d][C01][R01]. Secondary support
only: ZIP-as-content is a format-identification trap (PRONOM-signature engines
identify ZIP-container formats as plain ZIP when no container signature expresses
the inner format, worked USDZ example [S07d]); even with perfect identification,
bare ZIP has no fixity contract, so the correction does not depend on this
single-post observation (M8).
Nested archives interact with malware-scanner recursion caps (ClamAV MaxRecursion
16, MaxFiles 10000 in current guides [S08c]); scan-before-extract ordering (§3)
matters, and bare-ZIP acceptance says nothing about it.

Corrected clause: accept BagIt packages as directories or as `.zip`-packed bag
directories through a donor-onboarding path (Exactly-class app for low-skill
donors, bagit-python CLI for capable ones); bare ZIP without a bag structure
enters a LEGACY lane where staff re-bag on receipt, the re-bagging is logged as a
provenance event, AND the original as-received ZIP bytes are retained in
quarantined content-addressed storage referenced by the provenance record (F4 —
without the bytes, the surviving checksums would all be staff-generated and the
lane would weaken exactly the provenance it exists to protect). `.tar` packing is
NOT accepted at build until verified: no donor tooling in evidence produces tar
bags and the bagit-python README documents no serialization flags at all [R01], so
tar is demoted to a named follow-up (M1). ZIP remains a transfer serialization
only — never the preservation storage form (that is a versioned object store, §3).

### P2 "Verify SHA-256 checksums." — CORRECTION plus OPTIONAL ENHANCEMENT (split per F2)

CORRECTION kernel (already-covered part retained inside it): SHA-256 verification
stays. It is half of the bagit-python default (SHA-256 AND SHA-512 are both
generated unless flags select otherwise) [S05][C01][R01], and manifest verification
is the correct fixity mechanism.

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
  (`--processes N`) [S05][C01][R01]. Fast mode is triage, not proof; reports must
  label it.
- It names one failure mode but the validator produces three typed outcomes —
  `ChecksumMismatch` (with path, algorithm, expected, found), `FileMissing`,
  `UnexpectedFile` — and the payload-oxum pre-check can catch gross damage
  first [S05][C01][R01]. The rejection report must handle all three, not "checksum
  OK/fail".
- One-shot verification motivates but does not itself constitute a fixity
  program (see enhancement below).

Corrected clause: full manifest validation over SHA-256+SHA-512 defaults at
ingest (fast mode for triage only, labelled preliminary), typed-error rejection
vocabulary, and a provenance record alongside every verdict. SHA-256-only is
permitted ONLY as a documented donor-side pre-check option for large transfers;
staff ingest always re-hashes both defaults, and a pre-check hash must never be
mistaken for the ingest verdict (scoping sentence attached, per P2 review).

OPTIONAL ENHANCEMENT (split out of the correction per F2): a scheduled
re-validation program over time. The brief's "repeatable transfer history" is
satisfied by per-transfer manifests + validation logs + tool-versioned verdicts
re-runnable later; longitudinal monitoring is a justified, well-argued improvement
beyond that bar, not something P2-as-written gets wrong. Default mechanism:
scheduled bag/OCFL re-validation (open AVP Fixity is dead — COPTR status Gone,
superseded by Fixity Pro [S09] — so the default is re-validation, §3, with Fixity
Pro only after a license/cost/API evaluation).

### P3 "Extract to the archive folder and update a database." — CORRECTION (major; ordering + architecture)

Retained kernel: after acceptance there IS a preservation store and there IS an
index. The "folder + database" shape survives only as the degenerate small-site
form WITH conditions (below).

Why the clause as written is wrong:
- Order of operations is unsafe: extract-then-whatever skips the evidenced
  pipeline order — malware scan + quarantine decision BEFORE extract (nested
  archives, recursion caps), then validation, then format identification, then
  versioned ingest [S08][S05][S07]. ClamAV over-limit content is otherwise
  silently marked OK under default caps ("scanning will abort at the limit, and
  the file will be marked as 'OK'" [C02]); ClamAV ≥1.2.1 with
  `--alert-exceeds-max`/`AlertExceedsMax` converts skips into
  `Heuristics.Limits.Exceeded` alerts (default of the option is `no` [C02]).
  The 1.2.0 implementation was broken for exactly the highest-risk files: PR
  #1039, "Fix alert-exceeds-max feature for files > 2GB and < max-filesize
  (1.2.1)", merged into dev/1.2.1, resolving issue #1030, where a `goto done`
  skipped the alert-reporting logic [R03]. The version floor is therefore
  ≥1.2.1, not ≥1.2 (F1).
- Files over 2 GB are unscannable by ClamAV itself ("technical design
  limitations") and need an explicit exception lane with a documented non-scan —
  never a fake "clean" [S08c]. The evaluated alternative for ONE branch of that
  lane is clamav-large-archive-scanner, which extracts and scans the contents of
  archives >2GB — but its README states it "will not enable you [to] scan large
  documents, graphics, videos, etc.", i.e. archives only, and chunking large
  single files is "not an effective solution" [R04]. Oral-history video, the
  brief's own high-risk donor content, therefore does NOT benefit from that tool
  (correcting F3's video sentence); the documented-non-scan lane stays mandatory
  for large non-archive files whatever the evaluation concludes. The evaluation
  question is whether large ARCHIVES (e.g. >2GB donor zips) clear through the
  tool, with the non-scan lane as the safe default until it does.
- A plain folder is not preservation storage: no versioning, no fixity binding,
  no re-validatable history. The evidenced storage contract is the Oxford Common
  File Layout v1.1 (application-independent, transparent object storage;
  completeness/parsability/versioning/robustness/storage-diversity): every
  object carries a root `inventory.json` for the current version, version dirs
  SHOULD carry their own, the digest sidecar is written LAST, versions are
  immutable, and validation implements fixity checking [S02][S04-secondary].
  Re-running validation later reproduces verdicts or explains drift. E-code
  semantics ERROR↔MUST, WARNING↔SHOULD, validators covering objects AND roots,
  and the v1.1 codes E103 (monotonic spec versions), E106 (manifest-is-object),
  E107 (manifest/state key correspondence) are now doubly observed [S03][S04][C03].
- "Update a database" underspecifies the history the brief demands
  ("repeatable transfer history"). The evidenced history elements are:
  per-transfer bag manifests + validation logs + scan verdicts + ID reports +
  repair events + provenance record, then versioning of the preserved result
  (OCFL versions in the lightweight pipeline; METS/PREMIS + Storage Service in
  Archivematica, where transfer names become AIP names and accession numbers
  land in AIP METS as registration events) [S06]. Tool/signature/spec versions
  must be recorded on every run or later re-validation cannot explain drift.
- Path safety: storing donor-supplied paths verbatim risks traversal/oddity
  bugs — ecosystem practice is explicit path validation (never access files
  outside the object; cf. ocfl-java PR #70 snippet, never repo-read, so cited
  as practice-plus-pointer and flagged for build-time verification [S03b], M2).
  Ingest must validate content paths (ties to P5).

Corrected clause: staged pipeline
quarantine-scan → validate → identify → versioned-store → index, with a
rejection path at every stage; preservation store is an OCFL v1.1 storage root
(lightweight default) or Archivematica AIPs (heavyweight alternative, §4); the
"database" is a transfer-event/provenance index recording every verdict with
tool versions. Degenerate small-site permission: OCFL-on-disk plus a simple
event log is acceptable IFF every ingest and every re-validation runs the pinned
validator and appends versioned events; plain-folder-plus-untracked-DB is
REJECTED as preservation storage.

### P4 "Let staff edit metadata after import." — CORRECTION (timing + guard)

Retained kernel (already-covered part): staff CAN edit metadata, including
after import. Curatorial post-ingest editing is legitimate and stays.

Why the clause as written is wrong:
- Post-import-only editing misses the two earlier evidenced metadata points:
  recipient-defined sender templates filled before submission (Exactly model,
  with delivery email carrying transfer data + manifests) [S09d][C04], and typed
  ingest metadata (descriptive/rights/event, submission documentation,
  existing checksums/PIDs) at transfer time (Archivematica transfer types)
  [S06]. Pushing everything post-import guarantees re-work and weak provenance.
- Unconditional post-import editing breaks the fixity contract: in bagit-python,
  `save()` deliberately does NOT regenerate manifests by default so a
  metadata-only save cannot bless an invalid bag; payload changes require
  `save(manifests=True)` [S05][C01][R01]. A repair workflow that edits `data/`
  without re-manifesting plus re-validating silently invalidates the bag. Every
  repair must re-run validation and append an event.
- Silent DB edits destroy repeatability: post-ingest edits must be versioned
  events (new OCFL version / METS event), not in-place overwrites.

Corrected clause: metadata at three points — sender template pre-submit,
staff repair pre-ingest, curatorial post-ingest — with the repair loop
(template → `bag-info.txt` edit + `save()` metadata-only, or
`save(manifests=True)` + re-validate when payload is touched → repository
descriptive top-up), every edit logged as a versioned event, and no
repair-then-ship without re-validation. Dedicated repair/characterization
editors (ExifTool-class, MediaConch-class, JHOVE-output loops) were NOT
verified this pass and remain named follow-ups, not specified tooling
(boundary sustained, no demands).

### P5 "Keep original filenames." — USER DECISION with recommended default + NON-NEGOTIABLE CONDITION

This is the one clause that is neither clearly right nor clearly wrong; it
needs a staff choice because the brief does not state access-system or
donor-deed requirements (uncertainty §6).

- Preservation argument FOR: original names are provenance evidence (chain of
  custody, donor recognition, deed matching). Nothing in the evidence says to
  discard them.
- Safety argument AGAINST verbatim storage: traversal/confusion/collision risk
  (ecosystem path-validation practice [S03b], M2); Unicode, overlong, and
  case-colliding names; OCFL's content-addressed layout exists precisely to
  decouple storage identity from donor naming [S02].
- Recommended default (a decision proposal, not a finding): preserve original
  names in the manifest/metadata/accession record AND show them in rejection
  reports, but store bytes under safe opaque-or-sanitized names inside the
  object. That satisfies provenance and safety jointly.
- The decision to put to staff: (a) accept the recommended default; (b) any
  deed/access constraint requiring verbatim on-disk names.
- NON-NEGOTIABLE CONDITION on BOTH branches (M9 restatement, same force as the
  draft's "rejected" tail, clean O4 vocabulary): even branch (b) requires a
  path-sanitization + collision + traversal-test rule in the validation matrix.
  "Keep" without that rule is not an available option.

### P6 "Test with three good packages." — CORRECTION (grossly inadequate)

Retained kernel: three good packages survive as the SMOKE subset of deployment
validation (V6), not as the test plan.

Why the clause as written is wrong: three happy-path packages cannot
discriminate any consequential behavior — no bad checksum, no missing/
unexpected file, no malware hit, no over-limit archive, no >2GB file, no
unknown/generic-container format, no fast-vs-full divergence, no
provenance-incomplete acceptance. A test plan that cannot fail is not a plan.

Corrected clause: the discriminating validation matrix V1–V8 (§5), each item
capable of changing a recommendation. P6's three packages become V6's intake
smoke set inside a matrix that also carries negative, adversarial,
repeatability, and interop cases, with executed-vs-proposed tracking from day one.

---

## 2. O5a — Retained findings (what the build takes as given)

- Transfer unit: BagIt bags (RFC 8493) created with bagit-python/Exactly-class
  tooling; bare ZIP only via the staff re-bag legacy lane WITH as-received byte
  retention (P1, F4).
- Validation: full manifest walk over SHA-256+SHA-512 defaults; typed errors
  (`ChecksumMismatch`/`FileMissing`/`UnexpectedFile`) as the package-validation
  report vocabulary; fast/oxum mode labelled triage-only (P2). All three
  behaviors now triply observed [S05][C01][R01].
- Storage: OCFL v1.1 objects (pinned validator + spec version; E-code-keyed
  messages) as the lightweight preservation store; E-code semantics ERROR↔MUST,
  WARNING↔SHOULD, validators covering objects AND roots; exactly-one
  conformance declaration; UTF-8 inventories; manifest/state correspondence;
  monotonic spec versions across immutable versions [S02][S03][S04][C03].
- Malware: version-controlled `clamd.conf`/`freshclam.conf`, Unix socket
  (tightened mode — the default is world-RW [S08b]), TCP never exposed
  (unauthenticated by design [S08]); version ≥1.2.1 with the exceeds-max alert
  set and keyed on `Heuristics.Limits.Exceeded` (F1); quarantine directory +
  report as application architecture; >2GB exception lane with documented
  non-scan, mandatory for large non-archives, with large-archive-scanner
  evaluated for large archives (P3, F3 amended).
- Format ID policy names TOOL + PRONOM snapshot + fallback order
  (Siegfried → JHOVE → extension + human): Siegfried for CLI/batch throughput,
  DROID for GUI-led small batches, JHOVE where version detail is policy
  (proven TIFF-version gap [S07c]), generic-container results never auto-pass
  (PRONOM container gap [S07d]). All Siegfried/DROID substance is snippet-grade
  (S07b–d); no version/release claims are made and the TIFF case + container gap
  are existence proofs only (M3 — the final does not strengthen these cites).
- Provenance: per-transfer record (who/when/how-received + submission docs +
  scan/ID/validation verdicts with tool versions) stored WITH the object;
  checksums are one field (P2/P3). Post-ingest edits are versioned events (P4).
- Fixity program (optional enhancement, F2): scheduled re-validation
  (bag/OCFL), NOT the dead open-Fixity binary; Fixity Pro only after a
  license/cost/API evaluation (§3.2 chain).
- Rejection reports (two views, one source): staff view = code + tool +
  tool-version + signature/spec version + path (BagIt typed errors, OCFL
  E-codes + spec anchors, ClamAV verdicts + `Heuristics.Limits.Exceeded`
  alerts + >2GB non-scans, Siegfried unknown/generic/version-gap flags); donor
  view = plain-language sentence + what-to-do-next + resubmit path.
- Filenames: recommended default per P5 (originals preserved as metadata,
  storage under safe names), pending the staff decision, with the
  non-negotiable sanitization condition on both branches.

## 3. O5b — Reference pipeline (lightweight default) + version pins

Donor-side Exactly/bagit-python bags → staff intake (legacy re-bag lane for
bare ZIP, retaining as-received bytes) → ClamAV ≥1.2.1 scan + quarantine dir +
>2GB lane (non-scan for non-archives; large-archive-scanner evaluated for
archives) → bagit-python full validate → Siegfried → JHOVE fallback → OCFL v1.1
object store → scheduled re-validation (optional enhancement) → S3-compatible
backend (MinIO-class single container; same code runs against MinIO or AWS via
env vars; path-style addressing required [S11]; portable across R2/B2/Wasabi/
GCS-interop via the S3 API [S11b]).

Implementation/version conditions (all evidenced, none invented):
- BagIt RFC 8493 v1.0; bagit-python pinned release AND the three documented
  behaviors (dual-hash default, `save()` guard, fast-vs-full) encoded in code
  review checklists [S05][C01][R01]. (Current release number unverified — pin at
  build.) Exactly output compat with RFC-8493 validators is UNPROVEN (its README
  references pre-RFC `draft-kunze-bagit-12` [C04]) — guarded by V8, not assumed.
- OCFL 1.1 + pinned validator; E-code-keyed messages cite validator + spec
  version because codes shifted between 1.0 and 1.1 (E103/E106/E107 added,
  E003/E076 updated via issues #544/#537/#581 [S03][C03]).
- ClamAV ≥1.2.1, exceeds-max alert ON and keyed on `Heuristics.Limits.Exceeded`,
  `clamd.conf` in version control, freshclam freshness monitored; offline sites
  need a signature-mirror procedure (follow-up detail). Stable cites at build:
  docs.clamav.net + Debian manpages (M4 — the oracular manpage URL that 404'd
  for research resolves in current search results [C02]; transient mirror
  artifact, not a content defect).
- Siegfried/DROID pinned with PRONOM snapshot recorded per run; JHOVE pinned
  for version-sensitive policy. No release numbers claimed (M3).
- S3 backend: re-check MinIO licensing before recommending (NOT verified this
  pass); SeaweedFS (Apache-2.0, all-in-one `server -s3`) is the named
  alternative to evaluate [S11c]. Neither is promoted to unconditional (M7).
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
  removable-media paths, delivery email with manifests [S09d][C04], origin in
  Nunn Center/Univ. of Kentucky donor acquisition with early
  provenance/fixity — directly on-brief [C04]) vs bagit-python CLI for capable
  donors [S05][S09f][R01] vs Bagger legacy knowledge only (LoC use into 2020
  [S09c], but "no longer maintained or supported" per SFU [S09b] —
  disagreement retained, §7). Repo-path confidence for `WeAreAVP/uk-exactly`
  raised to medium-high on vendor-primary + two index corroborations [C04]; the
  pre-RFC staleness flag stands and is guarded by V8 (M6).
- Signed-bag pointer: harvard-lil/bag-nabit named as a provenance-adjacent
  follow-up, not a recommendation [S09e].

## 5. O6 — Discriminating validations: executed vs proposed

EXECUTED this stage: none. No sandbox existed; no command ran against any
candidate tool. The matrix below is entirely PROPOSED. Each item states what
decision it can flip.

- V1 BagIt round-trip: `make_bag` → corrupt one payload byte → `validate()`
  must raise `ChecksumMismatch` naming path/algorithm/expected/found; the same
  bag under `--fast` must PASS. Flips: report wording + fast/full policy (P2).
  Applicable as written; behaviors triply confirmed [S05][C01][R01].
- V2 Repair-guard: metadata-only `save()` on an invalid bag must NOT bless it;
  `save(manifests=True)` after a payload edit must restore validity. Flips:
  repair-loop correctness (P4). Retained as written; critic verdict unobserved
  (truncation, U7) — no evidence of challenge, and the underlying behaviors are
  triply confirmed [S05][C01][R01].
- V3 OCFL E-code mapping: fixtures violating E003/E009/E106/E107 through the
  pinned validator must return exactly those codes. Flips: rejection-report
  keys + validator pin (P3). Retained as written; critic verdict unobserved
  (U7); underlying codes doubly confirmed [S04][C03].
- V4 ClamAV lanes (AMENDED per F1/F3): EICAR test file detected + quarantined;
  crafted over-limit archive with the exceeds-max alert set produces
  `Heuristics.Limits.Exceeded` (assert the NAME, not just "an ALERT"); >2GB
  file routes to the exception lane with a NON-SCAN record (never an
  alert-or-clean assertion, since >2GB is clamped, not scanned, even on 1.2.1);
  large-archive-scanner evaluation sub-case: a >2GB ARCHIVE through the tool
  must yield extracted-content verdicts to pass evaluation, while a >2GB VIDEO
  must still route to the non-scan lane (tool scope is archives-only [R04]).
  Flips: quarantine design + version floor (P3).
- V5 Format-ID fallback: version-sensitive TIFF sample through
  Siegfried → JHOVE → human asserts version recovery; ZIP-container sample
  asserts no blanket pass. Flips: ID policy wording (P1/P3). Retained as
  written; critic verdict unobserved (U7).
- V6 Deployment smoke: single-host compose (validator + clamd/freshclam +
  OCFL store + S3-compatible backend) ingests P6's three good packages
  end-to-end, then re-runs validation to reproduce verdicts. Flips:
  lightweight-vs-Archivematica on real effort numbers (§4). P6 survives ONLY as
  this smoke set. Retained as written; critic verdict unobserved (U7).
- V7 Provenance record: a bag with VALID checksums but missing/weak submission
  docs must still flag provenance-INCOMPLETE. Flips: whether the brief's core
  constraint (checksum ≠ provenance) is actually implemented (P2). Retained as
  written; critic verdict unobserved (U7).
- V8 Exactly→bagit-python interop (ADDED per M6): bags produced by the Exactly
  build chosen for donor onboarding must pass full `bagit-python` validation
  (and OCFL ingest where applicable) without repair; failure demotes Exactly to
  "legacy knowledge" and promotes bagit-python CLI + staff re-bag as the donor
  default. Flips: donor-tooling default (P1/P4). Guard for the pre-RFC
  `draft-kunze-bagit-12` staleness flag [C04].

Scope honesty (O6): this matrix validates the small-product brief (donor
handoff → quarantine → validated, versioned preservation with honest reports),
not unlimited production guarantees. Load, multi-tenancy, and long-horizon
media migration are out of scope.

## 6. Uncertainty + disagreement register (carried forward)

- U1 Exactly canonical repo URL (medium-HIGH confidence after C04
  vendor-primary + two index corroborations of `WeAreAVP/uk-exactly`; direct
  repo read still missing; facts rest on fork README + vendor guide + index
  records — S09d note as narrowed by M6). Output compat with RFC-8493
  validators unproven (pre-RFC draft reference) — guarded by V8.
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
- U7 Critique truncation: `critique.md` ends mid-sentence at V2's verdict; all
  critic applicability verdicts from V2 onward and any further sections are
  unobserved. V2/V3/V5/V6/V7 retained as written on draft evidence (triply or
  doubly confirmed behaviors where applicable); no critic demand is assumed or
  denied for the missing tail.
- Disagreement retained: Bagger "established + LoC-used into 2020" vs "no
  longer maintained" — resolved as legacy-only knowledge, not the donor default.
- Corrected within revision: critic F3's "oral-history video would benefit
  from large-archive-scanner" — rejected on primary README evidence (archives
  only; videos explicitly out of scope [R04]); the tool is retained as an
  evaluated alternative for large archives.
- Honest negatives: no CVE/regression records pulled for ClamAV/bagit-python/
  Siegfried (time-boxed, not "none exist"); no witness runs; no pricing evidence
  for any commercial option.

## 7. Constraints that must survive into build (original + derived)

- Checksum ≠ provenance (brief; evidenced §P2). Any future edit implying
  otherwise is a defect.
- No silent passes: fast-mode labelled triage; exceeds-max alerts on
  (≥1.2.1, keyed on `Heuristics.Limits.Exceeded`); >2GB non-scans recorded;
  generic-container IDs held for staff (P2/P3/V4/V5).
- No repair-then-ship without re-validation + event append (P4/V2).
- No shift of E-code/report keys without validator+spec version citation (P3/V3).
- No Archivematica/ES half-upgrades (version-pair pin, §4 chain).
- Filenames preserved as metadata; storage paths validated, never trusted — on
  BOTH P5 branches (P5 condition).
- Legacy-lane as-received bytes retained alongside every staff re-bag (P1/F4).
- Validations stay discriminating and tracked executed-vs-proposed; V1–V8 are
  the acceptance bar P6 failed to be.

## 8. O4-adjudication — every observed criticism, explicitly dispositioned

Method: each criticism was checked against the draft, the brief, and evidence —
including four independent reviser re-observations (R01–R04) — rather than
obeyed automatically. One critic sentence was corrected on primary evidence (F3
video scope); the rest were accepted, some with scoping amendments.

Material findings:
- F1 (P3/V4: ClamAV floor ≥1.2.1) — ACCEPTED in full. Independently confirmed
  by primary PR read: title "Fix alert-exceeds-max feature for files > 2GB and
  < max-filesize (1.2.1)", merged into dev/1.2.1, resolving issue #1030, with
  the `goto done` alert-skip described on the page [R03]. The 1.2 reporting
  feature and silent-OK default were also independently reconfirmed [R02]. All
  three consequences applied: floor ≥1.2.1 everywhere, V4 asserts the
  `Heuristics.Limits.Exceeded` name, >2GB asserts a non-scan record.
- F2 (P2: split correction/enhancement) — ACCEPTED. The brief's "repeatable
  transfer history" is satisfied by re-runnable per-transfer records, not
  necessarily longitudinal monitoring; the re-label is accurate and no text was
  deleted. P2 now carries CORRECTION + OPTIONAL ENHANCEMENT.
- F3 (P3: large-archive-scanner alternative) — ACCEPTED with AMENDMENT. The
  tool exists and is named as an evaluated alternative (existence + purpose
  independently confirmed via primary README read and the clamav-users
  announcement [R04]). AMENDED: scope is archives-only — the README states it
  "will not enable you [to] scan large documents, graphics, videos, etc." and
  that chunking is not an effective solution [R04]. The critic's sentence
  claiming oral-history video would benefit is therefore REJECTED on primary
  evidence; the non-scan lane stays mandatory for large non-archives and V4
  carries the archive/video discrimination.
- F4 (P1: retain as-received bytes) — ACCEPTED. Provenance logic is sound
  (staff-generated checksums alone cannot attest donor bytes under the brief's
  constraint) and cost is trivial. Legacy lane amended.
- F5 (P2/P3/P4 confirmation) — ACCEPTED. Reviser triple-confirmed the
  bagit-python behaviors (dual-hash default, `--fast` oxum-only, `save()` guard,
  typed errors with path/algorithm/expected/found) by full README read [R01];
  OCFL codes rest doubly confirmed [S04][C03]. Version-citation rule kept.

Per-P review: P1 sustained (+F4/M1/M8 applied) — ACCEPTED. P2 sustained with
F2 split and the SHA-256-only scoping sentence kept attached — ACCEPTED. P3
sustained (+F1/F3, degenerate-permission enforceable IFF line added) —
ACCEPTED. P4 sustained with no demands, honest editor boundary kept — ACCEPTED.
P5 sustained with M9 restatement — ACCEPTED. P6 sustained, demotion to V6 smoke
kept — ACCEPTED. False-correction/false-rejection audit (none found) —
ACCEPTED; no evidenced alternative was wrongly dismissed.

Minor findings:
- M1 (.tar evidence) — ACCEPTED via demote-to-follow-up: my full README read
  found no serialization flags at all [R01], so neither packing format is
  donor-tooling output; `.zip` is retained only as packed-bag-directory
  transport reversed by scan→extract→validate, `.tar` demoted. No disposition
  change.
- M2 (PR #70 traversal cite) — ACCEPTED: rule kept, cite softened to ecosystem
  practice plus pointer, build-time verification flagged.
- M3 (Siegfried snippet-grade) — ACCEPTED: no action; this final makes no
  version/release claims and treats the TIFF case + container gap as existence
  proofs.
- M4 (404s transient) — ACCEPTED: no content action; stable cites named for build.
- M5 (editorial fragment) — ACCEPTED: repaired. The §4 comparison table in this
  final reads "virus-scan micro-service step; admin config unverified here (U5)".
- M6 (Exactly staleness) — ACCEPTED: vendor-primary corroboration + narrowed U1
  (medium-high) retained alongside the pre-RFC flag; donor default survives
  guarded by new V8.
- M7 (low-cost honesty) — ACCEPTED: MinIO/SeaweedFS/commercial items stay
  conditioned; nothing promoted.
- M8 (container-trap weight) — ACCEPTED: kept as secondary support; P1's
  load-bearing argument stated as the missing fixity contract.
- M9 (P5 vocabulary) — ACCEPTED: restated as user decision + non-negotiable
  condition on both branches; re-label only.

Validation applicability (§4 of critique): V1 applicable-as-written — ACCEPTED
(now triply confirmed). V2 onward — UNCERTAINTY RETAINED (U7): verdicts
unobserved due to truncation; items retained as written with only the
F1/F3-determined V4 amendments and the M6-determined V8 addition.

## Appendix A. O1 — Independently discovered tools, products, approaches (retained)

BagIt family: RFC 8493 v1.0 transfer-unit standard [S01]; bagit-python
create+validate CLI/library [S05][C01][R01]; Bagger legacy/fallback (LoC use into
2020 [S09c] vs "no longer maintained" [S09b]); Exactly/uk-exactly sender→recipient
app (BagIt-based, FTP/SFTP + Dropbox/Drive sync + removable media, sender
templates, delivery email with manifests [S09d][C04]); harvard-lil/bag-nabit
signed-bag pointer, follow-up only [S09e]. OCFL family: spec v1.1
(application-independent transparent storage, five requirements [S02]); validation
codes ERROR↔MUST/WARNING↔SHOULD with E003/E009/E103/E106/E107 report keys
[S04][C03]; implementations ocfl-java/gocfl/rocfl as named candidates [S03b].
Repository pipelines: Archivematica+Storage Service full pipeline with typed
transfers and METS/PREMIS history [S06]; RODA second full-pipeline name [S10];
hosted ArchivesDirect/Preservica-class names only [S10b][S10c]; lightweight
BagIt+OCFL+ClamAV+Siegfried pipeline as the materially different low-cost default.
Format ID: Siegfried (CLI/batch) [S07], DROID (GUI batches) [S07b], JHOVE (version
detail) [S07c], PRONOM container gap (USDZ→ZIP) [S07d]. Malware: ClamAV
daemon/client architecture, unauthenticated-TCP warning, quarantine as application
architecture [S08]. Fixity: AVP Fixity→Fixity Pro supersession [S09]; OCFL
validation-as-fixity [S04-secondary]. Metadata repair: `bag-info.txt` + `save()`
semantics [R01], Exactly templates [C04], Archivematica typed transfers [S06];
dedicated editors unverified follow-ups. Deployment: MinIO-class single-container
S3 [S11], S3 portability [S11b], SeaweedFS alternative [S11c], indexless
Archivematica [S06c].

## Appendix B. O2 — Primary-source behavior, defaults, limits (retained)

BagIt structural+fixity contract, not authenticity [S01]; typed validator errors
as the complete rejection vocabulary [R01]. bagit-python: dual-hash default,
`save()` guard, fast-vs-full, `--processes` parallelism [R01]. OCFL: immutable
versions, UTF-8 inventories, sidecar-last, exactly-one conformance declaration,
E-code rules [S02][S03][C03]; OCFL is not a transfer ledger (workflow events need
a side log). ClamAV: drifted size/recursion caps (pin version), 2GB hard per-file
ceiling, ≥1.2.1 + `AlertExceedsMax` alerting, daemon-side config only,
socket hygiene, freshclam prerequisite [S08][S08b][S08c][R02][R03]. Archivematica:
required transfer name → AIP name, accession → METS registration event,
preconfigured failure handling, version-pair pins, indexless costs [S06][S06b][S06c].
Siegfried/DROID: throughput-vs-GUI split, shared PRONOM gaps, JHOVE fallback for
version policy, extension last resort [S07b][S07c][S07d]. Checksum≠provenance with
evidenced provenance substitutes (submission docs, METS registration events,
Exactly handshake+manifests, OCFL post-ingest history) [S06][S09d][C04][S02].

## Appendix C. O3 — Issue/fix/regression/evolution chains (retained)

OCFL v1.0→v1.1.0→v1.1.1 correction chain with exact issues (#544 conformance of
prior versions/E103; #581 exactly-one declaration; #514 UTF-8; #541 at-rest
version naming; #537 E106/E107; v1.1.1 partially observed) + ecosystem echo
(gocfl digest extensions, ocfl-java path fix) [S03][S03b]. Fixity→Fixity Pro
supersession [S09]. Archivematica ES regression hazard (optional since 1.7;
1.17↔ES6 vs 1.18↔ES8 with upgrade refusal) [S06b][S06c]. ClamAV silent-skip →
1.2 alert → 1.2.1 >2GB fix chain (this revision pins the tail: PR #1039 merged
to dev/1.2.1 resolving #1030 [R03]; persistent >2GB unscannable-by-design limit
[R02][R04]). Siegfried TIFF-version gap → JHOVE workaround + USDZ container gap
[S07c][S07d]. Bagger→Exactly donor-UX succession [S09b][S09c][S09d][C04]. Honest
negatives: no CVE/regression pulls for ClamAV/bagit-python/Siegfried; no release
numbers; no Fixity Pro pricing; no RODA/JHOVE/MediaConch/ExifTool primaries.

## Appendix D. Competing-workflow comparison (retained, M5 repaired)

| Dimension | Heavyweight: Archivematica full pipeline | Lightweight: BagIt+OCFL+ClamAV+Siegfried | Hosted (ArchivesDirect/Preservica-class) |
|---|---|---|---|
| Transfer in | Transfer tab → SIP, typed transfers [S06] | Exactly/bagit-python bags, email manifests [R01][C04] | Vendor uploader (unverified) |
| Validation | Micro-services + error handling [S06] | bagit-python typed errors; OCFL E-codes [R01][C03] | Vendor (unverified) |
| Malware | virus-scan micro-service step; admin config unverified here (U5) | clamd ≥1.2.1 + quarantine dir + >2GB lane (§P3) | Vendor (unverified) |
| Format ID | Siegfried micro-service [S07] | Siegfried → JHOVE → human (§2) | Vendor (unverified) |
| History | METS/PREMIS + Storage Service [S06] | OCFL versions + event log (§P3) | Vendor (unverified) |
| Search | ES or indexless [S06c] | Filesystem/S3 + future index (gap) | Vendor (unverified) |
| Cost/effort | Server + ops skill + ES care | Single host + containers, low skill floor | Subscription (unverified) |
| Best fit | Multi-staff, normalization-heavy | THIS brief: small donors, small staff | No-ops staff (if budget allows) |

Standing recommendation (unchanged): lightweight as default, Archivematica where
normalization + METS/PREMIS + multi-seat workflow justify it, hosted only after a
priced trial. RODA as the second full-pipeline name to evaluate before committing
to Archivematica.

---

*End of final. Required science artifacts in this directory: `final.md` (this
file), `source-map.json`, `sources/` (+ index). Predecessor sources were reused by
ID as inspected-not-reobserved; reviser IDs R01–R04 carry the independent
re-observations. Native Goal terminal completion follows only after these saves.*
