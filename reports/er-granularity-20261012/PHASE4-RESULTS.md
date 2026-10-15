# Phase 4 — winning shape on a fresh case (A8-01, 2026-10-13)

Fresh frozen case ER12 A8-01 (revision-aware exhibition asset deposit;
BagIt/bagit-python, OCFL, git-annex analogy; bundle T1–T10). Each arm ran the
Phase 3 winning shape from the start: three bounded extraction packets, one
comparison packet, a host-generated conditions checklist, and an integration
packet required to carry every KEY condition in prose with provenance stamps
and to name exact gate values. Blind Sol Max grading against a Sol-authored
gold (`case2/GOLD.md`, 20 propositions, conditions C01–C08); the gold's M1
trap was independently re-verified (the normalization-collision helper is
defined in v1.6.0 but has no normal-path caller). Runtime:
`~/PM-Experiments/er-granularity-20261012/{case2,arms2,grades}`; key
`grades/KEY-P4.txt` (F1 = DeepSeek, F2 = Luna, F3 = GLM).

## Headline

**The winning shape did not generalize: 0 of 3 arms passed on the fresh
case.** The failure is not the Phase 1–3 failure. Condition carriage machinery
worked where it was aimed — all three arms correctly extracted and stated
that the collision helper is uncalled, gates name exact tools/versions/modes,
and the GLM final's 20 checked quotations were all verbatim. All three arms
failed on the same deeper class instead: **acceptance-oracle architecture**.
Each final validates a restored copy against manifests that travel with the
copy, without binding the gate to an independently retained approved
path/digest reference and registrar expected set; none adds raw-name
collision screening to the gate its own records show is blind to collisions;
none specifies the full offsite-origin restore protocol (read-back at the
offsite location, retrieval from that copy into a clean location,
representative file opening, failed attempts kept unresolved).

| Arm | Verdict | Diagnostic /40 | Gold met/partial/missing | Conditions retained /8 | Material errors |
|---|---|---:|---|---|---:|
| DeepSeek-W | FAIL | 15 | 4 / 15 / 1 | 2 (C07, C08) | 10 |
| Luna-W | FAIL | 25 | 7 / 13 / 0 | 4 (C01, C02, C06, C07) | 5 |
| GLM-W | FAIL | 23 | 7 / 9 / 4 | 3 (C01, C07, C08) | 5 |

## Shared failure anatomy (all 3 arms)

- **Self-referential acceptance oracle (ME04).** Files and their only
  manifest can be changed together and still pass every proposed gate. The
  bundle supports the independent-reference requirement (OCFL's external
  digest-copy passage; the brief's bounded-restore obligation), but no single
  record states it as a gate component — it has to be synthesized.
- **Known blindness left in the gate (ME15).** Extraction knew the collision
  helper is uncalled; integration still made stock full validation the whole
  acceptance route, with no raw-name multiplicity screen or two-name
  qualification.
- **Restore protocol underspecified.** Restore origin is not bound to the
  offsite copy; read-back and representative opening are absent.
- **Optional inventory thinned (C05 retained 0/3).** Optional status kept,
  but field guide, encoding/escaping, byte coverage, and a staff
  no-specialist-software check are missing in all three.
- C03 and C04 were dropped-or-flattened by all three arms; C07 (negative
  constraints) was retained by all three.

## Per-arm distinguishing errors

- **DeepSeek-W (weakest):** additionally a false universal per-path error
  contract (Oxum/structure branches fail earlier with other shapes), an
  unsupported unwritable-file preflight claim, prior OCFL versions judged
  against the current logical state, BagIt gates left unscoped across routes,
  a false "inventory fits only in `logs`" OCFL restriction, a v1.9.0
  absence-of-change overclaim, a misattributed maintainer probe, and one
  invented quoted word ("requires") inside an ellipsis — which the host
  quote checker missed because the segment before the ellipsis is under its
  length floor. Host-checker limitation recorded.
- **Luna-W (strongest diagnostic):** the only arm to supply a registrar
  expected set, but the approved byte reference still is not bound into the
  gate. Also the pilot's clearest validation-honesty breach since Phase 1:
  authored test code called a passing test path (ME13) despite an otherwise
  correct NOT_RUN table.
- **GLM-W:** cleanest quotation record (20/20 exact) and clean validation
  honesty; still fails on the shared oracle class, plus a checksum
  "establish fixity and completeness" overclaim (ME02) and a default
  parameter presented as corruption protection.

## Reading

- Phase 3's repair worked because case 1's residual defect was *gate
  composition*: exact values unnamed. Case 2's residual defect is *gate
  epistemology*: what the check compares against, and what a pass is allowed
  to mean. The checklist carried extracted conditions into prose, but no
  stage owned the question "independent of what?" for each acceptance gate.
- Extraction quality is no longer the binding constraint on either case. The
  binding constraint moved to design synthesis under strict grading —
  specifically oracle independence, screening for a known blind spot, and
  complete bounded-check protocols.
- Calibration caveat, stated not waived: the independent-reference demand is
  a gold-author synthesis from bundle passages, stricter than any single
  source sentence. All three arms missing the same synthesis is a process
  signal (no stage is assigned to make it), but Jared may also judge part of
  GOLD2's obligation-3 bar to be gold strictness rather than bundle content.
  Either way, verdicts were not close: removing any single shared error
  still leaves every arm failing.
- Cost shape: 5 candidate contexts per arm (3 extraction + comparison +
  integration; checklist is host code). GLM's integration alone took ~28
  minutes of wall time over a 180-block checklist — the checklist that
  protects carriage also inflates the final context. No dollar figures are
  claimed; only wall time and context counts were observed.
- Untested next intervention (not run): an acceptance-design packet between
  comparison and integration whose only job is, per proposed gate, to name
  the oracle, its independence from the artifact under test, known blind
  spots with screens, and the complete bounded protocol — the same
  single-question discipline that fixed gate composition in Phase 3,
  aimed one level deeper.
