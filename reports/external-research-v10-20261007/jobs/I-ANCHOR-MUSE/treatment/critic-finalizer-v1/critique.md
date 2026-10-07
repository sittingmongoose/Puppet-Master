# Critique — I-ANCHOR-MUSE treatment research-v1 draft (fresh same-family critic)

Critic: fresh same-family critic-finalizer, 2026-10-07 ~18:37Z. Predecessor
is the REQUIRED base: every section below dispositions to adopt / adopt
with correction / preserve-as-uncertainty. New live evidence: C01–C04 in
`sources/SOURCES.md`. Nothing was executed; OBSERVED = text/code read.

## K1. Pinned code read (§3) — VERIFIED, then superseded by stronger evidence

The predecessor's v1.8.1 `_validate_contents` account (unconditional
`_validate_oxum()` before `if fast: return`) matches its saved excerpt
exactly, and I independently read the same function at tag v1.9.0 (C01,
lines 778–796): IDENTICAL structure, oxum-first intact.
`DEFAULT_CHECKSUMS = ["sha256", "sha512"]` also confirmed at v1.9.0
(C01 line 128). Adopt §3 as verified.

Consequence: predecessor uncertainty U1 ("does oxum-first still ship in
v1.9.0?") is RESOLVED — yes, by direct code read, upgrading the draft's
honest changelog-absence inference to a fact. The final anchors the pin
at v1.9.0-with-known-behavior instead of "verify on upgrade" for this
version; the per-upgrade re-read becomes regression T2 rather than an
open question.

## K2. Issue/fix/release chain (§4) — VERIFIED live, one sharpening

C02 confirms PR #174 `state=closed, merged_at=null` (closed unmerged
2024-09-18); C03 confirms #137 and #177 still open. The draft's §4
account is accurate in every checkable detail. Adopt.

Sharpening (carried into final): the S05 patch moves oxum INSIDE `if
fast:`, i.e. full validation would stop checking oxum at all. A strictly
better repair is warn-and-continue in full mode (record the oxum mismatch
as a screening signal, then still run completeness + per-file hashes).
The final therefore recommends "S05 semantics OR warn-and-continue
wrapper" rather than naming the patch as the single fix. The draft's
"wrap validation (retry entries-only on oxum failure)" already points
this way; the final makes it the primary recommendation since upstream
has now twice (v1.8.1 → v1.9.0) shipped the trap.

## K3. New nuance from C01: oxum-absent bags skip the gate

`_validate_oxum()` returns silently when `Payload-Oxum` is missing. So
the S03/S04 trap bites exactly the oxum-carrying bags that proposal P1
mandates — the final's P1/P4 pair MUST carry the mitigation (it does),
and a "no oxum, full validate passed" report must never be presented as
a fixity verdict without per-file hashes having run. This is an addition,
not a correction: the draft is consistent with it throughout.

## K4. Frozen-plan gap map (F1–F10) — ADOPT all, minor refinements

- F1 (content-hash identity): sound; S01/S02 support is real (manifest
  `checksum filepath` lines; per-file recompute). Adopt.
- F2 (fixity schedule + repair): sound. Adopt.
- F3 (live-DB copy): sound; the S10 "power-loss during copy can corrupt
  the backup" and writer-blocking points are fairly represented. Adopt.
- F4 (AIP/DIP split): sound analogy from S11; the draft correctly adopts
  ROLES without mandating Archivematica itself. Adopt.
- F5 (staged atomic ingest): sound; correctly notes DB transactions alone
  do not make file+row atomic. Adopt.
- F6 (rights split): sound; the S12 notice-vs-file semantics
  ("visibility applies only on files, never hides the notice"; private
  item/media never public-side) are quoted accurately. Adopt.
- F7 (preservation formats): sound; TIFF/BWF-WAV/PDF-A direction matches
  S13/S14 hierarchies. Adopt.
- F8 (offsite): sound. Adopt.
- F9 (keep SQLite, conditioned): correct product choice, correctly
  conditioned (Backup API, WAL limits, file+row protocol). Adopt.
- F10 (keep catalog, conditioned): correct; rights-aware indexing proviso
  is the load-bearing part. Adopt.

Refinements (in final, none contradicting the draft):
R-a. M6/P6: prefer the Backup API for the NIGHTLY job (incremental,
lock-only-while-reading per S10) and reserve `VACUUM INTO` for periodic
compacting snapshots — VACUUM takes a write lock and is the heavier
nightly choice on a busy catalog. The draft lists both without ordering.
R-b. R3/P6: strengthen to "local SQLite per station + push protocol is
PRIMARY; journal-mode-on-share only where locking is known-good," since
S08's own failure list includes broken locking on network filesystems —
rollback journal on a share is not unconditionally safe either.
R-c. P2: add an orphan sweep — crash between refcount-zero and byte
delete leaves unreferenced objects, and abort paths leak staged hashes;
the fixity job must periodically re-verify refcount↔bytes consistency.
R-d. M2: dual sha256+sha512 doubles ingest hashing CPU; for a small shop
this is negligible, but the final notes sha256-alone as an acceptable
choice with sha512 kept for BagIt-manifest convention, rather than
presenting the default as mandatory.

## K5. Mechanisms M1–M8 — ADOPT as genuinely material comparisons

Each M-item contrasts the frozen behavior with a mechanism that differs
in KIND (self-verifying units, identity-by-hash, audit-vs-copy,
role-split storage, staged commit, snapshot-vs-copy, split rights,
normalization) rather than restating the patch. M-series satisfies the
brief's "compare materially different mechanisms" clause. Adopt with R-a…R-d.

## K6. Analogous systems (§5) — ADOPT; scope discipline is correct

Archivematica-as-roles, Omeka-S-Access-as-rights-pattern, NDSA-as-yardstick
are each used for the mechanism lesson, not as procurement advice — the
right scoping for an affordable volunteer shop, and each claim is tied to
its source. Adopt. No cheaper analog was missed that the brief requires;
O3 (object-storage offsite) already covers the obvious cost alternative.

## K7. Hidden risks R1–R8 — ADOPT all; R1 slightly rebalanced

R1–R8 are each source-grounded and non-obvious (hot-journal deletion,
WAL-on-NAS, derivative overwrite, rights drift via snippets/thumbnails,
single-threat geography). One rebalance from C04: the v1.9.0 `--fast`
CLI help text DOES honestly say it skips checksum validation, so CLI
users are warned; the confusion risk concentrates in library/API use
(where only the docstring speaks) and in volunteer-facing wrappers that
parrot "validation passed." Final keeps R1 with that locus correction.

## K8. Proposals P1–P10 — ADOPT as the final's build spine, with K2/K4 deltas

P1–P10 are concrete, minimal-affordable, and each traceable to a source
and a frozen-plan gap. The final retains all ten, applying: oxum
warn-and-continue as the P4 default (K2), Backup-API-first P6 (R-a),
local-DB-first P6 (R-b), orphan sweep in P2/P4 (R-c), hash-choice note in
P2 (R-d), and the oxum-absent reporting rule (K3). No proposal is dropped.

## K9. Optionals O1–O4 — ADOPT; O1 strengthened by C01

O1's hedge ("validate with the v1.9.0 file-URL behavior") is now
OBSERVED: C01 shows `validate_fetch` accepting file-scheme URLs without
netloc at v1.9.0. O1 stays optional (availability risk is real and the
draft states it). O2–O4 are correctly fenced as non-brief work. Adopt all.

## K10. Uncertainties U1–U4 — one resolved, three preserved

- U1: RESOLVED by C01 (oxum-first ships at v1.9.0). Converted to
  regression test T2 (per-upgrade re-read), not an open question.
- U2 (NDSA matrix cell wording): PRESERVED as justified uncertainty —
  level claims must cite the matrix PDF once retrieved. Not resolvable
  from the page fetch alone; correctly fenced.
- U3 (normalization toolchain): PRESERVED — formats named, tools/versions
  rightly deferred to a selection pass with license/fidelity checks.
- U4 (scale math): PRESERVED — sampling windows rescale with backlog;
  mechanisms unchanged. Correctly fenced.

## K11. Validations T1–T4, V1–V7 — ADOPT all, all correctly marked PROPOSED

The regression quartet (T1–T4) precisely targets the oxum-first trap
including the stale-oxum-must-still-report case (T2); V1–V7 cover crash,
corruption, dedup traps, backup realism, rights probing, format
round-trip, and restore rehearsal. Nothing claims execution. Adopt
verbatim into the final; T2 doubles as the per-upgrade gate from K1.

## K12. Unsupported assertions / source-condition audit — none material

- "Hashes computed in 512 KiB blocks" (§3): carried from the
  predecessor's S02 read; I verified validator bodies and CLI at v1.9.0
  but did NOT re-verify hash block internals. Low consequence either
  way; final marks it predecessor-observed.
- NDSA "Level 2–3 claim" (§5): a reading, hedged by U2. Kept hedged.
- Predecessor artifact timestamps are inconsistent (SOURCES.md states a
  18:28:30–18:30:40Z window and first save 18:30:45Z, while the saved
  excerpts claim 18:36Z/18:41Z retrieval). Provenance nit only: it does
  not affect content validity because every consequential claim (pinned
  behavior, issue states, merge status, CLI wiring) was re-verified live
  by this critic (C01–C04). Noted here, not propagated.
- No other assertion lacks a cited source; executed-vs-proposed
  discipline (§12) is exemplary and retained.

## K13. Brief-scope check — complete

Real primary sources (yes, S01–S14 + C01–C04); materially different
mechanisms (M1–M8); pinned code behavior (v1.8.1 + v1.9.0 reads);
issue/fix/regression/release chain with applicability (S03–S06 + C01–C03,
live states); plan-choice comparison (F1–F10 × frozen clauses);
corrections/product-choices/covered-dispositions/optionals/uncertainties/
validations preserved; executed-vs-proposed distinguished. The draft
satisfies the integrated obligation map; the final below is built from it
with the K1–K12 deltas applied.
