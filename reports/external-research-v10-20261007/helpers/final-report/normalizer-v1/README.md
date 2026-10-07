# ER10 mechanical normalizer — WORKING / IN_PROGRESS

This finite helper normalizes an explicitly captured working snapshot of the
exact immutable 40-slot / 80-arm population. It does not certify campaign closure,
re-evaluate Source, adjudicate scientific grades, rank defects or declare a winner.
Original scientific, coverage, qualification and economic metadata remain original
evidence, including failed and incomplete versions.

## Files

- `normalizer.py`: offline Python standard-library implementation.
- `field-map.json`: explicit per-slot, per-version, per-arm selectors and operation
  definitions. Every source selector carries original path, SHA-256, JSON pointer
  and capture timestamp. Missing selectors are visible rather than guessed.
- `WORKING-normalized.json`: 40 records in the immutable index order, every
  observed bound version, two arms for every version, and a separate prospectively
  authorized final version. The final version is not selected by grade or speed.
- `WORKING.md`: readable notes for this particular observed snapshot.
- `validation.json`: meaningful checks using the actual captured records.
- `unresolved-schema-mapping.json`: exact unresolved selectors, conflicts and
  missing original-version lineage bindings. These are unknowns, not zeroes.
- `working-*-manifest.json` and `working-input/`: preserved input bytes and their
  identities. Owner COMPARISONS were copied and hashed before parsing. Supplement
  manifests preserve separately captured frozen references; this is not one
  simultaneous transactional snapshot.
- `OUTPUT_IDENTITIES.json`: delivery identities, including code and notes.

## Reproduce this snapshot

Run from this directory with Python 3.11 or newer:

```sh
python3 -B normalizer.py
```

The command verifies every supplied snapshot's exact bytes and SHA-256 **before**
parsing the cached verified bytes. It never reads an original campaign path,
contacts a service, opens a model rollout, starts a worker or watches a live file.
It writes only the four generated JSON outputs inside this helper directory.

To reuse the explicit map with the identical inputs:

```sh
python3 -B normalizer.py --field-map field-map.json --out reproduction-check
```

The helper was separately rerun this way and all four output byte identities
matched. The temporary reproduction directory was removed after the comparison.
Each JSON uses deterministic sorted keys, preserved array order, UTF-8, two-space
indentation and one trailing newline. It contains observed input timestamps, not
the rerun clock. No dependency installation is needed.

## Later finite snapshots

Root may capture a **new explicit immutable input set** after the finite queues
close. Keep the current snapshots unchanged. A manifest must have `campaign_root`,
`observed_cutoff`, and `files`; each present file has `relative_path`,
`original_path`, `snapshot_path` relative to the manifest directory, `sha256`,
`bytes`, and `capture_at`. If an owner supplies a frozen hash, retain it as
`expected_sha256`; a mismatch is rejected. Record missing paths explicitly.

Pass every required manifest in observation order, for example:

```sh
python3 -B normalizer.py \
  --manifest /absolute/path/to/later-immutable-input-manifest.json \
  --out later-normalization
```

Omit `--field-map` when any source bytes changed, so the explicit map is rebuilt
against that new immutable set. A reused map whose path/hash no longer matches
is rejected; old hashes can never cite new values. Unknown later schemas require
an explicit adapter/mapping change, not a filename or favorable-score fallback.
The index and prospective-admissions authority identities remain pinned. Include
the seven owner sources, the root bindings, the mechanical state snapshots and
the referenced complete frozen own-case comparison/review metadata needed by the
adapters. All output paths must remain under this authorized helper directory.

Later root normalization still produces a **WORKING / IN_PROGRESS** helper
artifact. Root independently verifies final closure and writes the final report.
This helper never automatically certifies or watches the campaign.

## Field meanings and conservative mappings

The logical slot is the denominator. A version/attempt, seed, helper, critic,
reviewer or reviewer repair never becomes another logical slot. Duplicate
slot/version rows in the same primary owner collection are rejected. Repeated
historical projections are evidence fragments of one version, not more attempts.
The 53 current bound version records include declared unstarted successors;
this number is neither 53 executions nor 53 scientific comparisons.

`original_source_grade` uses an explicit original grade/status field. A semantic
narrative or absent numeric/pass-fail grade is not promoted to PASS or FAIL.
`original_scientific_judgment`, per-field observations and verbatim evidence
fragments retain the original strings and dictionaries. Different preserved
review rounds can yield a conflict/NULL in a scalar field; each review delivery
and judgment remains separately inspectable. Reviewer repair version is distinct
from candidate pair version.

`full_declared_scientific_scope_assessed` accepts an explicit original boolean or
an exact declared-scope metadata label listed in the map. It never uses filenames,
claim counts, six-axis words or an enclosing stage total. Full declared **source**
scope and all required source claims verified are separate fields; an ambiguous
generic scope field does not fill those stronger fields. Six-axis inventory
assessment is its own axis and never implies full source verification.

Original obligation fulfillment, preservation, source-unverified remainders,
required chronology and proposed-versus-executed limitations remain in
`coverage_process_and_scope_original` and the exact frozen evidence fragments.
Full scientific coverage may coexist with unverified required process/history.
No inferred history completion follows from all six scientific axes being checked.

`required_final_artifact_delivery_observed` describes the declared final carrier
and explicit mechanical presence/freeze metadata. It does not mean that every
scientific obligation was fulfilled. Actual native activation/terminal evidence,
T3 candidate tree quiet, reviewer delivery, reviewer allowance, provenance,
method and time eligibility remain separate. An old terminal six-case owner
counter never closes a prospectively authorized unstarted successor.

Material defects are an explicit original count only, else NULL. In particular,
C01's original control `material_defect_count: 0` remains exact in the frozen
comparison and observations, while the normalized count is NULL because the
control review is missing/UNASSESSED_HOLD. C02's absent top both-full field is
derived solely from the two explicit original arm booleans, with that derivation
disclosed. C03's treatment full scientific scope and native BLOCKED are independent.

SourcePASS or PASS_WITH_LIMITATIONS never establishes every obligation, actual
native qualification, provenance, time, billing or a qualified twofold win.
Fail/Fail does not imply equal quality. Defect counts are not a ranking.

## Performance and telemetry

Original clocks, overlaps, queue/handoff/setup data and all failed costs are kept
per exact case, arm and frozen version. No aggregate economic sum is invented.
Newly computed ratios require both explicitly observed declared final deliveries
and two explicitly comparable clocks. Every such ratio is descriptive; original
author ratios remain separately in original evidence. Missing native proof,
missing final, dropped scope or a source failure earns no speed-win credit.

Shared seed cost is fully charged to each cold arm and once in an aggregate.
Occupied sums and parallel critical paths differ. An enclosing stage and its
children cannot both be added. New 30/40/50/60/common80/100/120 ceilings are not
original15/45 successes. The normalizer retains original costs instead of
constructing a failure-free composite or selecting the fastest/best version.

The old SDK observation is separately hash-joined to the independent root
validation. Its 72 groups include mixed roles: candidate/reviewer/root/helper
roles stay explicit and an entire group is never assigned to a candidate arm.
Original NULL grade/economic fields are not rewritten by this supplement. The
208-session inventory and 147 distinct summed sessions do not mean complete
arm/campaign usage. Raw native cumulative counters are unsummed proxies.
No new extraction, account call or rollout reading occurred. Actual billing,
remaining account quota, prices and affordability are unknown.

## Validation and public evidence

Validation uses the actual 40 IDs/80 arms, actual duplicate-slot and duplicate-
version injections, an actually missing C01 grade, removal of the actual C04
grade, the original C01 zero/NULL distinction, C02's explicit boolean derivation,
C03's BLOCKED/full-science split, full six-axis coverage with a required-history
gap, the five held v3 successors, cohort1's seven rows/six slots, disjoint sums,
original confirmation 4/3/1/0 and 28 quiet tasks, hash corruption rejection,
and deterministic recomputation. Unknown mappings are reported rather than
converted into a failed scientific grade or a fabricated zero.

Use the captured `resolve_public_evidence.py` with an exact original path **and**
SHA against root's pinned public checkout. It verifies original-to-public
manifest identity; no filename-only/latest-version fallback exists. The selected
confirmation lock `9ba0418a…` stays distinct from unselected `44bab…` history.
This helper did not use Git or write the repository/publication artifacts.
