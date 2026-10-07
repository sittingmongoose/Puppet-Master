# Critique v1 — Community archive digital preservation (ER10 I-ANCHOR-MUSE, control)

Critic: fresh control critic-v1. Predecessor (REQUIRED, immutable): `control/research-v1/draft.md`
(freeze hash per prepared.json) with `control/research-v1/SOURCES.md` (S1–S6) and `sources/S1–S6`.
This file is critique ONLY for the fresh final reviser; it does not author final.md.

Instructions read: workspace `AGENTS.md` (Puppet Master canon/landing rules, via session context; applicable
here only for safety: no secrets, no canon/main/WorkNodes — all observed) and global
`~/.claude/CLAUDE.md` (pm-mail / gpu-recording / extra-workers / t3-rules; t3-rules defers mailbox and
worker rules inside T3; no nested delegation used, no temp files left outside this output directory).

Executed checks by the critic: NONE beyond page/API retrieval. No code run, installed, or downloaded for
execution; no accounts, purchases, or sockets beyond retrieval. All behavior claims below come from reading
the predecessor's S1–S6 notes (verified) and the critic's independently retrieved C1–C6 evidence in
`sources/`. Everything under validation remains a proposal, not a result. The final MUST keep this
executed-versus-proposed distinction.

Verdict: the draft is strong and nearly reviser-ready. Its pinned-component analysis (S2/C1), issue-chain
forensics (S3/C5), SQLite crash analysis (S4/C3), and rights/orphaning analysis (S5/C4) all verify
verbatim against independent re-retrieval. The required fixes are bounded: two S6 over-citations (F1, F9),
one section-number swap (S5.2/S5.4), one overstated term ("redaction"), one incomplete leak-vector (user
default-sites), labeling of unsourced design synthesis (F4 protocol, M-c/M-d/M-e, F5 snapshots, F10 linked
records), one resolved uncertainty (U2: v1.9.0 = 2025-06-13), one genuine gap (RFC S5.1 path traversal), and
small precision items. No finding is dropped: every F/O/U/V item has a keep/correct disposition below.

## 1. Obligation-map coverage (brief's integrated obligations)

| # | Obligation | Draft status | Critic verdict |
|---|-----------|--------------|----------------|
| O1 | Real primary public-source selection from the brief | S1–S6 independently selected from ingest/fixity/catalog/rights/recovery needs; no other arms/reviews read (selection note) | PASS. Byte counts re-verified by C1–C4 (54632/63600/77968/64527 match). Keep selection note in final. |
| O2 | Compare materially different mechanisms + useful alternatives | M-a..M-e (BagIt+SQLite / OAIS system / content-addressed store / checksumming fs / cloud versioning) with recommendations | PASS with correction: M-c/M-d/M-e are unsourced reasoning — final must label them as such (see C-7). Comparison itself is genuine (cost/ops/custody axes differ). |
| O3 | Inspect actual component/code behavior at a pinned version | bagit-python v1.9.0 bagit.py: defaults, validate ordering, fast semantics, CLI gating, tagmanifest v0.97+ | PASS. Every claim re-verified line-level in C1. Strengthen with C1 nuances (see Keep list). |
| O4 | Pertinent issue/fix/regression + release applicability, or equivalent history | #177 (open) → PR #174 (closed unmerged) → v1.9.0 applicability; reporting-not-coverage defect; wrapper guidance | PASS. States/dates re-verified via API in C5; maintainer refutation quotes confirmed. U2 resolved by C5. |
| O5 | Compare every relevant discovery against the frozen plan | F1–F10 each carry an explicit Comparison paragraph vs plan clauses | PASS. Cross-check table in §4 confirms every plan clause is met; comparisons are fair. |
| O6 | Preserve supported corrections, product choices, covered dispositions, optional leads, justified uncertainties, useful validations | F1–F10, M-choices, O1–O5, U1–U5, V1–V7 | PASS with dispositions: keep all per §6–§9; C-1/C-2 reframe two citations, C-9 resolves U2. |
| O7 | Complete same-family criticism and final proposal | This critique is the same-family criticism; final proposal is the reviser's job | PASS (critic half). Reviser: produce final proposal from this critique + draft, not from the draft alone. |
| O8 | Distinguish executed checks from proposals | "Executed checks: NONE" header; §8 labeled "all proposals; nothing executed" | PASS. No execution language found anywhere in the draft. Final MUST retain the header. |

## 2. Required corrections (exact, actionable, with evidence)

C-1 [F9 — unsupported S6 citation; FIX]. F9 claims "S6 shows normalization-with-logging as the affordable
middle path". The S6 retrieved ranges (docs index, 1.18 root, intro) contain ZERO occurrences of
"normaliz", "PREMIS", "format policy", or "BagIt" (C6 term counts on the intro page). The claim is therefore
unsupported by S6 as retrieved. Reviser, pick one: (a) fetch Archivematica normalization/format-policy
pages as NEW sources (new IDs, own timestamps, never rebound); or (b) reframe F9 as an unsourced design
proposal ("adopt a small preservation-format policy; log every normalization as an event") and move the
Archivematica methodology reference to M-b only. Do NOT keep "S6 shows" wording without (a). The F9
proposal itself is sound and fills the plan's "preservation formats remain unspecified" hole — keep the
proposal, fix the citation. Also fix the typo "uncompressed/st lossless" → "uncompressed or lossless".

C-2 [F1 — unsupported S6 citation; FIX]. F1 claims BagIt is "a transfer format other tools
(Archivematica-style pipelines, S6) already consume". C6 shows "BagIt" occurs 0 times on the S6 intro page;
no S6 retrieved range covers BagIt consumption. Reviser: delete "(Archivematica-style pipelines, S6)" from
F1, or replace with a NEW retrieved source showing BagIt tooling interop. Keep the rest of F1 intact (the
RFC-based integrity-envelope argument is fully supported by C2).

C-3 [Source condition — section swap; FIX]. The draft twice attributes the "older checksum algorithms ...
transit corruption ... deliberate/spoofing" point to S5.4 (S1 note line; §7 S1 bullet). The sentence lives
in RFC S5.2 ("Control of URLs in fetch.txt"), and S5.4 ("Attacks on Payload File Content") is the GENERAL
limitation — "manifests ... not designed to be secure against active attacks ... SHOULD agree on additional
measures, such as digital signatures" (C2 verbatim). Reviser: cite S5.2 for the algorithm point and S5.4
for the signatures recommendation. Both points stay; only the numbers change.

C-4 [F7(c) — overstated term; FIX]. "Per-field redaction" overstates S5. The page says private properties
"are still visible to Global Admins, Supervisors, and Editors" and that authors see all properties on items
they own (C4 verbatim). That is role-scoped hiding, not redaction. Reviser: rename to "per-field
visibility (role-scoped hiding)" and carry the caveat: staff roles still see "private" fields, so genuinely
sensitive notes (donor PII, appraisals) need either staff-role discipline or storage outside the catalog
field. The three-layer structure (item flag / media override / field eyes) stays — all three are verbatim
in C4.

C-5 [F7 leak vector — incomplete; FIX]. The draft names only the site-level auto-add setting. The page
documents TWO ingestion-to-public paths: "Each site can be set to have all new items automatically added to
it. Each user can have one or more sites to always add new items to by default" ("Default sites for items",
needs site Creator/Manager role) (C4 verbatim). Reviser: the F7 condition must be "site auto-add OFF for
restricted collections AND per-user Default-sites reviewed/empty for volunteer accounts". V5 must test both.

C-6 [F1 bag contents — misleading parenthetical; FIX]. "each accession becomes a complete, valid bag
(bagit.txt, data/, manifest-sha512.txt, bag-info.txt, tagmanifest)" reads as if all five are required for
validity. Per RFC S2.1/S2.2 (C2), only bagit.txt + data/ + manifest are REQUIRED; bag-info.txt and
tagmanifest are OPTIONAL. Reviser: reword to "each accession becomes a complete, valid bag (required:
bagit.txt, data/, manifest-sha512.txt; adopted by policy: bag-info.txt + tagmanifest-sha512.txt)". Keep the
policy (dual manifests + tag coverage are good), fix the MUST/OPTIONAL framing. Related: recommend DUAL
manifests (sha256+sha512, matching bagit-python DEFAULT_CHECKSUMS, C1 L128) rather than sha512-only, and
note the RFC SHOULD ("SHOULD enable SHA-512 by default", C2).

C-7 [Unsourced synthesis — label, do not drop; FIX]. The following are sound but UNSOURCED design
reasoning; the final must label each as "design proposal/synthesis", never as a sourced finding:
(a) M-c/M-d/M-e trade-off claims (no sources retrieved for any of them); keep the comparisons, add the
label. (b) F4's quarantine+fsync+single-transaction+atomic-move protocol: C3 supports the PREMISE (single
-file atomicity, hot-journal recovery, S5 cross-file gap, S9 live-copy hazards) but no retrieved source
prescribes quarantine directories, fsync placement, or atomic rename — label the protocol as standard-practice
synthesis. (c) F5's "versioned snapshot on disk 2" (same: risk is sourced, snapshot design is synthesis).
(d) F10's "linked records" (C4: properties confirmed, linked-data/resource templates NOT in range — soften
to "typed fields" or fetch a new source). (e) The S4-note aside "backup API/snapshot" alternative: the word
"backup" does not occur in the SQLite page (C3) — keep as reasoning, label as such.

C-8 [F3 — design tension to address; FIX]. "Keep one stored copy with back-references from each accession
record" is fine as storage engineering but conflicts with F1's self-contained-bag story: a bag whose
payload is a pointer into a dedup store is neither portable nor valid standalone per RFC S3 (C2 rule 4:
every payload file present and listed). Reviser: resolve explicitly — dedup MUST live BELOW the bag layer
(storage-level content addressing; each bag stays complete and valid) with the ledger mapping
content-hash→accessions, OR accept non-portable ledger-bags and say so. Either resolution is acceptable;
silence is not. The core correction (content hash replaces filename+size) is fully supported (C1 defaults,
C2 algorithm rules) and MUST stay, including both failure modes (same name/size merge = loss; same bytes
different names = waste).

C-9 [U2 — RESOLVED; apply]. v1.9.0 was published 2025-06-13T17:43:22Z (C5 API: published_at). Remove U2 from
uncertainties; cite "v1.9.0 (2025-06-13)" in the component and issue-chain sections. U1/U3/U4/U5 stay as
justified uncertainties (see §8).

C-10 [M-e scope creep; FIX]. "upload bandwidth for audio/video-scale masters" — the brief covers photos,
oral-history AUDIO, and scanned documents; there is no video in scope. Reviser: change to "audio-scale
masters". One word; do not expand scope.

C-11 [NEW gap — RFC S5.1 path traversal; ADD]. The draft never addresses malicious-path handling, but RFC
S5.1 warns that "a maliciously crafted 'tagmanifest-sha512.txt' file might contain entries that begin with
a path character such as '/', '..', or a '~username' home directory reference in an attempt to cause a naive
implementation to leak or overwrite targeted files" (C2). Bagit-python has an unsafe-path check (#184
"Remove expandvars call in unsafe path check", C5), but ingest of volunteer-supplied directory names still
needs its own rule. Reviser: add to F1 or F4 a filename/path validation requirement (reject absolute paths,
`..`, drive letters, control characters; normalize per S6.1.x) and a V-item (path-traversal drill).
Cite C2 S5.1.

C-12 [Tag-manifest precision; SHARPEN]. "Tag manifests (v0.97+) are verified, so bag-info.txt tampering is
detectable" is true only for CURRENT tagmanifests: coverage comes from _make_tagmanifest_file hashing all
found tag files (C1), and validation "can only check for entries with missing files (not missing entries
for existing files)" (C1 docstring). Reviser: add the two caveats — (i) regenerate the tagmanifest after
every authorized tag change or face false failures; (ii) untracked NEW tag files are invisible to
validation. The wrapper/V1 design must regenerate-then-validate, never validate-then-trust.

C-13 [Wrapper guidance — CONFIRMED and sharpened; KEEP+]. The draft's wrapper ("catch the oxum error, then
run entry-level verification and report both") is exactly right AND implementable: C1 shows
_validate_entries collects EVERY ChecksumMismatch and raises once with the full list. Reviser: keep the
guidance and add that the wrapper MUST also run on oxum-SUCCESS paths (a stale-but-plausible oxum passes
while checksums fail — oxum is byte/file counts only), and that fixity records must store per-file results,
not just the bag-level boolean. V1 already covers this; keep V1.

## 3. Keep list (verified; the reviser must preserve these)

- F1 core (BagIt envelope: checksums, declared completeness, transfer format; no-fetch-holes v1; fetch
  S5.2/S5.3 rules if ever used) — C2 verified line-for-line. With C-2/C-6/C-11 fixes.
- F2 two-tier fixity (nightly presence/size sweep + weekly full re-validation, per-run records; fast tier
  logged presence-only, never "valid") — C1 CLI messages and Payload-Oxum purpose (C2) support it. Keep.
- F3 content-hash dedup incl. both filename+size failure modes — C1/C2 support. Keep, with C-8 resolution.
- F4 crash-safe ingest (quarantine; incomplete→complete row flip in one transaction; re-verify on restart;
  never auto-promote; hot-journal semantics) — premise verified in C3. Keep, with C-7(b) label.
- F5 verify-then-replicate (validate source before copy; verify replica after; never blind-copy live tree)
  — risk verified in C3/S9. Keep, with C-7(c) label.
- F6 derivative provenance ({source checksum, tool+version, parameters, date, operator}; stale/superseded
  marking; Archivematica+AtoM separation precedent — the one S6 use that IS in range) — keep; field set is
  design choice, label as such.
- F7 three layers + default-private + role table (volunteer add/edit-own vs publish/delete-others) — C4
  verified. Keep, with C-4/C-5 fixes.
- F8 owner reassignment before deletion (orphan trap) — C4 verbatim. Keep.
- F9 proposal (small preservation-format policy + normalization log) — keep AS PROPOSAL with C-1 fix.
- F10 structured-metadata catalog (typed fields incl. rights; public view hides restricted fields;
  filename-search breakage incl. S6.1.2 naming pitfalls) — keep, with C-7(d) softening.
- M-a recommended / M-b migration target / M-c later optimization / M-d complement-never-sole / M-e
  optional encrypted third copy — keep all five dispositions with C-7(a) labels and C-10 fix.
- Component section: keep all, add C1 line refs (L128/L131/L778-795/success messages) and the
  _validate_entries collects-all-errors nuance (C-13).
- Issue chain: keep the mechanism-refuted/reporting-stands distinction (C5 quotes), the "adopt v1.9.0+ for
  pool/CLI fixes" judgment (#183/#162 confirmed in C5 release body), the pin-and-recheck rule, and the
  "PR #174 is NOT a fix to cherry-pick" warning. Apply C-9 date.
- O1–O5: keep all as explicitly optional (consent tag files; signed fixity exports; duplicate harvesting;
  format watch; encrypted third copy). None is required for v1; none contradicts the plan.
- V1–V7: keep all; V5 gains the dual auto-add settings (C-5); add a V8 path-traversal drill (C-11).
- U1/U3/U4/U5: keep (see §8). U2: resolved (C-9).
- The "Executed checks: NONE" header and the "proposals, not results" framing — mandatory in final.

## 4. Plan cross-check (every discovery vs the frozen sandbox plan)

Frozen plan clauses: (P1) directory-tree store; (P2) dedup by filename+size; (P3) SQLite metadata; (P4)
previews beside originals; (P5) nightly copy to second disk; (P6) web catalog with filename/notes search;
(P7) checksums/fixity/recovery/provenance/rights/formats unspecified.

| Finding | Plan clause(s) | Comparison fair? |
|---|---|---|
| F1 BagIt envelope | P1, P7-checksums | Yes: plan has no integrity envelope; bags add it without abandoning the tree. |
| F2 two-tier fixity | P7-fixity | Yes: plan has zero corruption detection; tiers bound cost. |
| F3 content-hash dedup | P2 | Yes: both failure modes of filename+size correctly stated. |
| F4 crash-safe ingest | P1, P3, P7-recovery | Yes: direct-tree writes + live DB copy risks correctly derived from C3. |
| F5 verify-then-replicate | P5 | Yes: blind copy propagates corruption/interrupted writes; versioning is new. |
| F6 derivative provenance | P4, P7-provenance | Yes: beside-originals cannot answer source/method/staleness. |
| F7 rights layers | P6 (serves all), P7-rights | Yes: plan serves everything cataloged; sensitive originals need default-private. |
| F8 ownership | P3 (no ownership), P6 volunteers | Yes: orphan trap is a real volunteer-catalog hazard (C4). |
| F9 format policy | P7-formats | Yes on the GAP; citation fixed by C-1. "Keeps bytes but never addresses obsolescence" is accurate. |
| F10 structured catalog | P6 | Yes: volunteer naming inconsistency breaks filename search (C2 S6.1.2 supports the pitfall). |
| M-b..M-e | P1–P6 architecture | Yes as explicitly non-v1 dispositions (target/optimization/complement/optional). |

No plan clause is unaddressed; no comparison misstates the plan. The "thin plan" characterization is
accurate (P7 lists six unspecified areas; the draft covers all six).

## 5. Source-condition audit (carry into final)

- S1/C2 (RFC 8493): Informational, not Standards-track — keep the caveat. Follow the 1.0
  every-file-in-every-manifest rule (C2 S3 rule 4). Fetch rules per C-3. ADD S5.1 path-traversal (C-11).
- S2/C1 (bagit-python v1.9.0): single-file pure-Python; multiprocess hashing available; oxum-masks-details
  MUST be wrapped (C-13); tagmanifest coverage is generation-time (C-12). Pin v1.9.0 (2025-06-13) or later.
- S3/C5 (#177/#174/v1.9.0): #177 OPEN at 2026-10-07; #174 closed-unmerged, not a fix; re-check issue state
  at build time. Keep.
- S4/C3 (SQLite atomic commit): atomicity covers the .db file only; sidecar/tree writes need F4; never copy
  the live tree; rolling versionless doc — re-verify section numbers at build time. Keep + C-7(e) label.
- S5/C4 (Omeka S Items): ROLLING UNVERSIONED manual — re-verify visibility/role semantics against the
  DEPLOYED Omeka S version; auto-add is TWO settings (C-5); field-hiding is role-scoped (C-4). Keep.
- S6 (Archivematica 1.18): methodology reference + migration target, NOT v1 build; AGPL applies if its CODE
  (not ideas) is reused — keep. DELETE the two over-citations (C-1, C-2) unless new sources are fetched.

## 6. What the final proposal should contain (guidance, not the proposal)

Reviser: produce final.md from the draft as corrected by §2, preserving §3 breadth. Structure: (1) keep the
executed/proposed header; (2) F1–F10 with corrected citations and C-7 labels; (3) M-a..M-e dispositions;
(4) pinned behavior + issue chain with the 2025-06-13 date; (5) O/U/V appendices per §3; (6) source
conditions per §5. Do not downgrade any KEEP item to optional; do not promote any O-item to required; do
not present M-c/M-d/M-e, the F4 protocol details, or F9 internals as sourced findings. New sources (if any)
get new IDs with URL/version/range/retrieval-time; S-IDs and C-IDs are never rebound.

## 7. Critic's new-evidence log

C1 bagit-python v1.9.0 re-read (2026-10-07T18:37:55Z, 54632 bytes, byte-match with S2). C2 RFC 8493 re-read
(18:38:24Z, 63600 bytes, byte-match with S1). C3 SQLite re-read (18:38:47Z, 77968 bytes, byte-match with
S4). C4 Omeka Items re-read (18:38:52Z, 64527 bytes, byte-match with S5). C5 GitHub API issue/PR/release
(18:39:03–04Z; resolves U2). C6 Archivematica intro scope count (18:39:20Z, 24438 bytes). Full locators in
`sources/SOURCES.md`. Predecessor S1–S6 notes all verified accurate except the items in §2.
