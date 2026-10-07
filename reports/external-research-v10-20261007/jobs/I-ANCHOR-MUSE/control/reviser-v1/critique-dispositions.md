# Critique dispositions (ER10 I-ANCHOR-MUSE control reviser-v1)

Required predecessor: `control/critic-v1/critique.md` (C-1–C-13, keep list, §§4–7). Every disposition
below records the action taken in `final.md` with its source support. Nothing was silently dropped.

## Required corrections

- C-1 [F9 unsupported S6 citation] — FIXED via option (b) reframe. Final F9 claims no Archivematica
  support: it is labeled [design proposal/synthesis], cites the plan's own "preservation formats
  remain unspecified" clause for the gap, and notes the C6 term counts (normaliz/BagIt/PREMIS/
  "format policy" 0 on the intro page) as the reason. No new Archivematica source was fetched, so no
  new methodology claim is made. Typo fixed: "uncompressed or lossless". (Sources: C6, R1-range
  negative confirmation by design; S6 in-range uses kept only at M-b/F6.)
- C-2 [F1 unsupported S6 citation] — FIXED by deletion. Final F1 contains no Archivematica-consumption
  claim; the envelope argument rests on R1 (RFC checksums/completeness) alone. (Sources: R1, C6.)
- C-3 [S5.2/S5.4 section swap] — FIXED. Final cites S5.2 for the older-algorithm/spoofing sentence
  and S5.4 for the general active-attack limit + digital-signatures recommendation, in §7 and via F1
  conditions. (Sources: R1 verbatim excerpts, confirming C2.)
- C-4 [F7(c) "redaction" overstated] — FIXED. Final uses "per-field visibility — role-scoped hiding"
  and carries the caveat that Global Admins/Supervisors/Editors still see "private" fields, so
  genuinely sensitive notes need staff-role discipline or storage outside the catalog field. The
  three-layer structure is kept. (Sources: R3 verbatim, confirming C4.)
- C-5 [F7 leak vector incomplete] — FIXED. Final F7 condition covers BOTH settings (per-site
  auto-add AND per-user Default-sites, reviewed/empty for volunteers), and V5 tests both. (Sources:
  R3 verbatim dual-path quotes, confirming C4.)
- C-6 [F1 bag-contents framing] — FIXED. Final F1 separates required (bagit.txt, data/, manifest)
  from policy-adopted (dual manifests, bag-info.txt + tagmanifest), recommends DUAL manifests
  sha256+sha512 matching DEFAULT_CHECKSUMS (R4 L128), and notes the RFC SHOULD (SHA-512 default,
  R1 S2.4). (Sources: R1 S2.1/S2.2/S2.4, R4.)
- C-7 [unsourced synthesis labeling] — FIXED. Final labels: (a) M-c/M-d/M-e comparisons as [design
  proposal/synthesis: no sources retrieved]; (b) F4 quarantine/fsync/transaction/atomic-move protocol
  as [design proposal/synthesis on a sourced premise] with the C3 premise cited; (c) F5 versioned
  snapshot as [design proposal/synthesis]; (d) F10 softened to "typed fields", "linked records"
  explicitly disclaimed (R3/C4 range note); (e) the backup-API/snapshot alternative labeled
  researcher reasoning with the C3 absence note ("backup" not in the SQLite page). Nothing dropped.
- C-8 [F3 dedup/bag tension] — FIXED by explicit resolution. Final F3 states dedup lives BELOW the
  bag layer (storage-level ledger; each bag complete/valid standalone per R1 S3 rule 4) and names the
  rejected alternative (pointer-bags, non-portable). Both filename+size failure modes kept. (Sources:
  R1 S3 rule 4, R4 defaults.)
- C-9 [U2 resolved] — APPLIED. Final cites "v1.9.0 (2025-06-13)" in §3/§4/§7, and §6 records U2 as
  RESOLVED with the R2 API timestamp (published_at 2025-06-13T17:43:22Z). U1/U3/U4/U5 kept. (Source:
  R2, confirming C5.)
- C-10 [M-e video scope creep] — FIXED. Final M-e reads "audio-scale masters". No scope expansion.
- C-11 [RFC S5.1 path traversal gap] — ADDED. Final F1 carries the path-validation requirement
  (reject absolute paths, `..`, drive letters, `~user`, control characters; normalize per S6.1.x)
  citing R1 S5.1 (re-verified verbatim, including the Windows drive-letter clause); F4 references it;
  new V8 path-traversal drill added. (Sources: R1 S5.1, R2 #184 unsafe-path context.)
- C-12 [tag-manifest precision] — SHARPENED. Final §3 and F1 carry both caveats: (i) regenerate the
  tagmanifest after every authorized tag change; (ii) untracked new tag files are invisible to
  validation; regenerate-then-validate. (Sources: R4 missing_optional_tagfiles docstring +
  v0.97 gate, confirming C1.)
- C-13 [wrapper guidance] — KEPT and SHARPENED. Final §4 keeps the catch-oxum-then-verify-entries
  wrapper, adds that it MUST also run on oxum-success paths (stale-but-plausible oxum passes while
  checksums fail; oxum is counts only, R1/R4) and that fixity records store per-file results. V1
  covers both paths. (Sources: R4 _validate_entries collects-all-errors + CLI semantics, R1 oxum
  purpose.)

## Keep list (§3) — all preserved

F1 core, F2 two-tier fixity, F3 incl. both failure modes, F4 (labeled), F5 (labeled), F6 (AtoM
precedent + design-choice field set), F7 layers + default-private + role table (fixed terms), F8
orphan rule, F9 as proposal, F10 softened, M-a..M-e dispositions (labeled, C-10 fixed), component
section (+ R4 line refs L128/fail-early wording/success messages), issue chain (mechanism-refuted/
reporting-stands + pin-and-recheck + PR-#174 warning + 2025-06-13 date), O1–O5 as explicitly
optional, V1–V7 kept (V5 dual-setting) + V8 added, U1/U3/U4/U5 kept, "Executed checks: NONE" header
and proposals-not-results framing retained.

## Plan cross-check (§4) — adopted

Final §9 reproduces the P1–P7 clause map with per-finding comparisons; no clause unaddressed, no
comparison misstates the plan. The "thin plan" characterization is kept.

## Source conditions (§5) — carried into final §7

RFC Informational caveat + S3 rule + fetch rules + section numbers per C-3 + S5.1 rule; bagit-python
single-file/multiprocess/wrapper/tagmanifest-generation-time conditions; #177-open/#174-not-a-fix/
re-check + v1.9.0 (2025-06-13) pin; SQLite .db-only + no-live-copy + versionless re-verify + C-7(e)
label; Omeka rolling-manual re-verify + dual settings + role-scoped hiding; Archivematica
methodology-only + in-range uses + AGPL-on-code caveat.

## Proposal structure (§6) — followed

Final keeps the executed/proposed header; F1–F10 with corrected citations and synthesis labels;
M-a..M-e dispositions; pinned behavior + issue chain with the 2025-06-13 date; O/U/V appendices; §7
source conditions. No KEEP item downgraded, no O-item promoted, no unsourced item presented as
sourced. New reviser sources use new R-IDs with URL/range/retrieval-time; S-IDs and C-IDs untouched.

## Critic evidence log (§7) — verified by re-retrieval

R1/R3/R4 byte counts (63600/64527/54632) match C1–C4; R2 JSON counts (4260/3149) match C5 files;
all key excerpts re-verified verbatim (R1 S5.1 traversal incl. Windows clause; R4 tag-scope
docstring; R2 What's Changed PR set with no #177 reference; R3 dual auto-add + role-scoped hiding
+ orphaning). The two earlier grep misses during verification were needle-format artifacts (quote
style, line break, PR-number-vs-URL form), resolved by context inspection — all claims confirmed.
