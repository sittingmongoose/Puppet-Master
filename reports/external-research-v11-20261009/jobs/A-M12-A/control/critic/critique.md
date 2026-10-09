# Critique — S12 archive-transfer (A-M12-A / control / critic)

Scope: independent critic review of the complete own-arm predecessor
`research/draft.md` (+ frozen `discovery.md`, `source-map.json`,
`revealed-plan.md`) against the original brief (`cases/S12/brief.md`)
and governing primary evidence. Method M12 v1 control:
competent conventional investigator; queries adapted freely.

Inputs inspected in full (byte counts from `freeze.json`):
brief.md (1435), draft.md (22398), discovery.md (25837),
research source-map.json (18638), revealed-plan.md (279),
research `sources/` excerpts (21087 total:
bagit-ocfl.md, pipeline-tools.md, security-fixity-transfer.md,
alternatives-deployment.md, index.md).
No campaign/history/evaluator/counterpart read. No repair of the
candidate outside this critique (per assignment recipe).

Critic's independent sources use IDs C01–C04 (mapped in
`source-map.json`, excerpts in `sources/`). Predecessor IDs S01–S11
are cited only as inspected-but-not-reobserved, except where a
critic source independently reconfirms the same fact (stated explicitly).

Executed checks this stage: NONE (no sandbox; web-primary research only).
No witness output is claimed anywhere.

Headline verdict: the draft's direction is sound — every P disposition
is directionally sustained, no false correction or false rejection was
found, and the executed-vs-proposed separation is exemplary. The
material findings below strengthen P3 (ClamAV version floor must rise
to >=1.2.1 on new upstream fix evidence), sharpen P2/P5 disposition
precision, add one evaluated alternative to the >2GB lane, and harden
the P1 legacy lane's provenance handling. Minor findings are editorial,
citation-thinness, or follow-up validations.

---

## 1. Material findings (F1–F5)

### F1 — MATERIAL (P3/V4): ClamAV version floor must be >=1.2.1, not >=1.2

The draft requires ClamAV >=1.2 with `AlertExceedsMax` / `--alert-exceeds-max`
set, converting silent over-limit skips into reportable alerts [S08d].
My independent search confirms the mechanism AND uncovers that it was
broken for exactly the highest-risk files on 1.2.0:

- Upstream issue Cisco-Talos/clamav#1030: alert-exceeds-max fails for
  files >2GB and < max-filesize; fixed by PR #1032, backported/duplicate
  PR #1039 titled "Fix alert-exceeds-max feature for files > 2GB and <
  max-filesize (1.2.1)". The 1.2.0 code path's `goto done` skipped the
  alert-reporting logic; the fix moves the >2GB check to where the
  max-filesize engine option is set (clamping requests >2GB-1 to 2GB-1)
  [C02].
- The alert signature name is confirmed: over-limit files report
  "Heuristics.Limits.Exceeded FOUND" when `AlertExceedsMax TRUE` is set;
  without it, "scanning will abort at the limit, and the file will be
  marked as OK" (openSUSE clamav-document-maxsize patch text) [C02].
- The Ubuntu oracular `clamd.conf` manpage (which 404'd for the
  predecessor) resolves in current search results and documents
  `AlertExceedsMax BOOL ... Default: no` [C02].

Consequences for the draft:

1. Version floor: every ">=1.2" (draft P3, §2 retained findings, §3
   conditions, V4) must read ">=1.2.1". On 1.2.0, V4's crafted
   over-limit archive sub-case would pass (small files alert) while the
   >2GB file it cares about most would silently not alert — the exact
   silent-pass mode the pipeline exists to eliminate.
2. V4 must assert the alert NAME (`Heuristics.Limits.Exceeded`), not just
   "an ALERT", so the quarantine report keys on a stable verdict string.
3. The >2GB sub-case must assert a NON-SCAN record (exception lane), never
   an alert-or-clean, because >2GB remains unscannable by design even on
   1.2.1 (clamp, not scan) [C02].

Uncertainty: the fix-item evidence is PR/issue metadata + patch text via
search results, not a fetched release-notes page; the reviser should cite
the 1.2.1 release notes at build time. Confidence in the floor-raising:
high (two PR records + issue number agree).

### F2 — MATERIAL, classification (P2): split correction from enhancement

P2's CORRECTION bundles two different things:

- True corrections (sustained, evidence C01): provenance record alongside
  every verdict (brief's checksum!=provenance constraint); full manifest
  validation at ingest with fast/oxum mode labelled triage-only; typed
  rejection vocabulary (`ChecksumMismatch`/`FileMissing`/`UnexpectedFile`).
- Smuggled enhancement: "scheduled re-validation over time is required"
  as part of the P2 correction. The brief demands "repeatable transfer
  history", which is satisfied by per-transfer manifests + validation logs
  + tool-versioned verdicts re-runnable later — NOT necessarily by a
  longitudinal fixity-monitoring program. Scheduled re-validation is a
  justified, well-argued OPTIONAL ENHANCEMENT (and the Fixity-Pro
  supersession analysis [S09] correctly keeps the default honest), but
  classifying it as a correction overstates what P2-as-written gets wrong.

Demand: reviser splits P2 into CORRECTION (provenance record, full-vs-fast
policy, typed errors) + OPTIONAL ENHANCEMENT (scheduled re-validation
program with the Fixity-Pro evaluation condition). No text deletion —
re-label only. This is a disposition-precision defect under O4, not a
false correction: nothing asserted is wrong.

### F3 — MATERIAL omission (P3, >2GB lane): unevaluated upstream alternative

The draft treats ">2GB unscannable by design" as terminal and routes all
such files to a documented-non-scan exception lane. My independent search
surfaced `cisco-talos/clamav-large-archive-scanner` (forked/continued as
`micahsnyder/clamav-large-archive-scanner`): "This project extends the
ClamAV software capability to be able to extract and scan the contents of
archives greater than 2GB. ClamAV is unable to scan files larger than 2GB"
[C02]. It also documents the same `AlertExceedsMax yes` + raised
`MaxFiles` practice the draft recommends.

Demand: the reviser names this tool as an EVALUATED alternative for the
>2GB lane (evaluate-then-decide, with the documented-non-scan lane as the
safe default until evaluation passes) rather than leaving the lane's
ceiling unexamined. The draft's "never a fake clean" constraint is
unaffected and stands. Oral-history video — the brief's own high-risk
donor content — is exactly what would benefit, so this omission is
material to the brief, not a nice-to-have.

Caveat (critic限度): I observed only the project tagline + config
excerpts via search results, not a primary repo read; "evaluate" is the
correct demand strength, not "adopt".

### F4 — MATERIAL hardening (P1 legacy lane): retain the as-received bytes

The draft's P1 correction routes bare ZIP without bag structure into a
LEGACY lane where "staff re-bag on receipt and the re-bagging is logged
as a provenance event". The logging is correct but insufficient: after
re-bagging, the preserved bag's manifests attest STAFF handling, not the
donor originals. If the original bare ZIP is discarded, the transfer's
only provenance evidence for donor bytes is staff's word plus a log line —
a provenance weakening in the lane that exists to protect provenance.

Demand: the legacy lane MUST retain the original as-received ZIP bytes
(quarantined, content-addressed, referenced by the provenance record)
alongside the staff-created bag. Cost is trivial (one extra stored blob
per legacy transfer); the alternative (log-only) fails the brief's
"without assuming a checksum proves provenance" constraint in spirit,
because the only checksums that survive would be staff-generated.

### F5 — MATERIAL confirmation (P2/P3/P4 foundations re-observed)

Two independent re-observations (critic-fetch, not predecessor-cite):

- bagit-python README (full fetch, C01): "SHA256 and SHA512 are generated
  by default"; `--fast` = "just examining the structure of the bag, and
  comparing its payload-oxum (byte count and number of files)"; "By
  default `save` will not update manifests. This guards against a
  situation where a call to `save` ... accidentally regenerates manifests
  for an invalid bag"; `details` = list of `ChecksumMismatch` /
  `FileMissing` / `UnexpectedFile` with `(d.path, d.algorithm, d.expected,
  d.found)`. Every P2/P4 load-bearing behavior is reconfirmed verbatim.
- OCFL validation codes v1.1 (full fetch, C03): "The ERROR level
  corresponds with MUST ... WARNING ... SHOULD"; "Validators MUST validate
  OCFL Objects" AND "Validators MUST validate OCFL Storage Roots";
  E003 exactly-one version declaration; E009 sequence starts at 1,
  continuous; E103 same-or-later spec version across version dirs; E106
  manifest-is-object; E107 manifest/state key correspondence — all
  reconfirmed verbatim, including the three v1.1-added codes (E103/E106/
  E107) the draft leans on for report keys and the pinning rule.

Effect: P2/P3/P4 corrections now stand on two independent observations
each. No critic demand arises from F5 except: keep the validator+spec
version citation rule (codes demonstrably shifted between 1.0/1.1).

---

## 2. Per-P disposition review (O4 — every clause)

Disposition vocabulary per draft: correction / optional enhancement /
user decision / already-covered / rejected / uncertain.

### P1 "Accept ZIP uploads." — CORRECTION: SUSTAINED (with F4 + 2 minors)

- Sustain: bare ZIP lacks manifest/fixity/provenance contract; BagIt bag
  as transfer unit is evidenced (RFC 8493 purpose line [S01], re-observed
  README semantics [C01]). The ZIP-container identification trap [S07d] is
  a legitimate secondary support but the correction does not need it —
  even with perfect identification, bare ZIP has no fixity contract.
- The critic considered whether CORRECTION overstates (ZIP statutorily
  fine as a serialization): the draft already retains ZIP as a
  serialization inside the corrected clause, so no overreach. Correct.
- Demands: F4 (retain as-received bytes, material); M1 (.tar evidence,
  minor); M8 (container-trap cite weight, minor — see §3).

### P2 "Verify SHA-256 checksums." — CORRECTION: SUSTAINED with split (F2)

- Sustain the correction kernel: checksum!=provenance (brief constraint,
  evidenced C01/S01); full-vs-fast (C01 verbatim); typed errors (C01
  verbatim); one-shot-is-not-fixity as the MOTIVATION for enhancement.
- Demand F2's split (material classification): move scheduled
  re-validation to OPTIONAL ENHANCEMENT. Also noted: the draft's
  "SHA-256-only permitted as a documented local option for large donor
  pre-checks" is a new normative permission, not a cited practice. It is
  ACCEPTABLE as written (donor-side pre-check only; staff ingest still
  re-hashes both defaults) but the reviser must keep that scoping
  sentence attached — a pre-check hash must never be mistaken for the
  ingest verdict. No change demanded beyond F2.
- No false correction: nothing in P2's corrected clause contradicts evidence.

### P3 "Extract to the archive folder and update a database." — CORRECTION: SUSTAINED (with F1 + F3)

- Sustain: scan-before-extract ordering (nested archives + recursion caps
  + silent-OK default, now doubly evidenced C02/S08); versioned store
  over plain folder (OCFL contract + E-codes, doubly evidenced C03/S02–
  S04); event/provenance index over untracked DB (transfer-history brief
  requirement); path validation (sound rule, thin cite — M2).
- Demands: F1 (floor >=1.2.1 + alert-name assertion + >2GB non-scan
  assertion) and F3 (evaluate large-archive-scanner) are both material.
- The "degenerate small-site permission" (OCFL-on-disk + event log OK;
  plain-folder-plus-untracked-DB REJECTED) is correctly drawn, but the
  REJECTED sub-disposition inside a CORRECTION needs one enforceable
  line: acceptable IFF every ingest and every re-validation runs the
  pinned validator and appends versioned events. Minor wording demand
  (fold into M5-batch or handle with F1 edit; not a separate finding).

### P4 "Let staff edit metadata after import." — CORRECTION: SUSTAINED, no demands

- Sustain in full: three-point timing (sender template [S09d/C04],
  ingest transfer types [S06], curatorial post-ingest) is evidenced at
  all three points; `save()` guard + `save(manifests=True)` + re-validate
  loop is reconfirmed verbatim [C01]; versioned-events rule follows from
  the OCFL/bag fixity contracts.
- The honest "dedicated editors NOT verified" boundary is correct and
  must survive revision. No false correction, no overreach, no demands.

### P5 "Keep original filenames." — USER DECISION: SUSTAINED (minor precision)

- Sustain: the only clause correctly NOT forced. Preservation (provenance
  evidence, deed matching) vs safety (traversal/collision/Unicode) is a
  genuine trade-off the brief does not resolve; staff/deed input is truly
  required. The recommended default (originals preserved as
  metadata/accession record + safe storage names) satisfies both sides
  jointly and is sound.
- Minor precision demand (M9 in §3): the draft's "shipping P5 verbatim
  without the storage-identity rule is rejected" embeds a REJECTED inside
  a USER DECISION. Restate as: disposition USER DECISION with a
  NON-NEGOTIABLE CONDITION applying to BOTH branches — even verbatim
  on-disk names require the sanitization + collision + traversal-test
  rule. Same force, clean O4 vocabulary.

### P6 "Test with three good packages." — CORRECTION: SUSTAINED, no disposition change

- Sustain: three happy-path packages cannot discriminate any consequential
  behavior the draft lists (bad checksum, missing/unexpected file,
  malware hit, over-limit, >2GB, unknown/container format, fast-vs-full
  divergence, provenance-incomplete). Demotion to V6 smoke subset is the
  correct retention. Validation-applicability demands live in §4 (V4/V5
  adjustments + proposed V8), not in the disposition.

### False-correction / false-rejection audit: NONE FOUND

Every CORRECTION is directionally supported by at least one primary
observation; the two classification issues (F2, M9) are precision defects,
not false findings. No P clause is wrongly rejected; no evidenced
alternative is wrongly dismissed (Bagger→legacy is correctly reasoned
from contradictory evidence; hosted options correctly held at names-only
without pricing evidence). Critic demands themselves carry the evidence
and uncertainty stated in §1/§3 — where my evidence is search-result
grade (C02 fix metadata, C04 repo records), I demand "evaluate/cite at
build", not adoption.

---

## 3. Minor findings (M1–M9)

- M1 (.tar acceptance, P1): the corrected clause accepts "directory,
  `.zip`, or `.tar`" but no donor tooling in evidence produces `.tar`
  bags (bagit-python serialization flags / Exactly outputs unverified for
  tar). Either verify `bagit-python` tar serialization at build or demote
  `.tar` to a named follow-up. No disposition change.
- M2 (ocfl-java PR #70, P3/P5): traversal-rule citation is a search
  snippet (S03b), never a repo read. The rule (validate content paths;
  never access outside the object) is sound standard practice — keep the
  rule, soften the cite ("ecosystem practice, cf. ocfl-java PR #70
  snippet") or verify at build.
- M3 (Siegfried substance, P1/P3): predecessor's S07 repo fetch was
  low-yield (site chrome only); all Siegfried/DROID substance is
  snippet-grade (S07b–d). The draft correctly withholds ALL version/release
  claims and treats the TIFF case + container gap as existence proofs.
  Critic concurs: no action, no findings content change. Recorded so the
  reviser does not "strengthen" these cites into claims they cannot bear.
- M4 (predecessor 404s): the Ubuntu oracular `clamd.conf` URL that 404'd
  for the predecessor resolves in current search results [C02]. Transient
  mirror artifact, not a draft defect. Prefer docs.clamav.net + Debian
  manpages as stable cites at build. No action on draft content.
- M5 (editorial, discovery §4 table): stray text "（集成 scan step;
  config unverified here)" — non-English fragment. Reviser should repair
  to "virus-scan micro-service step; admin config unverified here (U5)".
  Content (honest U5 boundary) is correct.
- M6 (Exactly staleness flag, donor default): my independent search
  corroborates the draft's Exactly facts from the vendor primary
  (weareavp.com: sender→recipient born-digital transfer, BagIt-based,
  FTP/SFTP + network + Dropbox/Drive, sender templates; origin: Nunn
  Center/Univ. of Kentucky donor acquisition with early
  provenance/fixity — directly on-brief) [C04], and two independent index
  records corroborate the `WeAreAVP/uk-exactly` repo path (low support
  signals) [C04]. BUT the README references `draft-kunze-bagit-12` —
  a PRE-RFC BagIt draft — so Exactly predates RFC 8493 and its output
  compat with RFC-8493 validators is unproven. The draft's medium
  confidence (U1) and donor-default recommendation survive (vendor-primary
  corroboration raises repo-path confidence to medium-high), with
  proposed V8 (Exactly→bagit-python interop validation) as the guard.
- M7 (low-cost path honesty): MinIO licensing unverified (U2), SeaweedFS
  shallow (S11c), no pricing for any commercial option — all correctly
  held as conditions/follow-ups. The indexless-default and
  single-host-compose recommendations are correctly conditioned. No
  action; the reviser must not promote any of these to unconditional.
- M8 (container-trap cite weight, P1): the USDZ→ZIP point rests on one
  2023 practitioner post (S07d). As used (secondary support for "no
  blanket pass on generic-container IDs"), the weight is correct. Flagged
  only so a reviser does not upgrade it into "ZIP uploads are dangerous
  because containers" — the P1 correction's load-bearing argument is the
  missing fixity contract, not container misidentification.
- M9 (P5 vocabulary): restate the "rejected" tail as a non-negotiable
  condition on both decision branches (see P5 review). Re-label only.

---

## 4. Validation applicability (O6 — V1–V7 + proposed V8)

O6 hygiene is exemplary: EXECUTED = none, all PROPOSED, no sandbox
claimed, no witness output anywhere, scope honestly bounded to the small
product brief. Applicability per item:

- V1 (BagIt round-trip: corrupt byte → `ChecksumMismatch(path/algorithm/
  expected/found)`; `--fast` passes): APPLICABLE AS WRITTEN. Both
  behaviors reconfirmed verbatim [C01]. Directly flips P2 report wording
  + fast/full policy. No change.
- V2 (repair-guard: metadata-only `save()` must not bless; 
...[truncated 2659 chars]