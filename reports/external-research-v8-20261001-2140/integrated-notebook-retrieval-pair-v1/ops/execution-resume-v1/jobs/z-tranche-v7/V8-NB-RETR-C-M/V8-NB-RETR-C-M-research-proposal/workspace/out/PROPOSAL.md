# V8-NB-RETR-C-M — Research proposal: offline saved-state comparison and copy recovery for a notebook workspace

Research-backed revision of `inputs/THIN_PLAN.md` for the synthetic brief in `inputs/BRIEF.md`. This stage's deliverable is the plan only: nothing was implemented and no test was executed here. Every validation item in §8 is **proposed and unexecuted** (no execution receipt exists for it).

Inline labels used throughout:
- **[SRC]** — source fact from a cited public primary source, with its conditions/exceptions preserved.
- **[INF]** — engineering inference from source facts.
- **[CHOICE]** — product choice for this prototype (not source-mandated).
- **[FIX]** — supported correction to the thin plan.
- **[PROPOSED TEST]** — planned, unexecuted validation.

## 1. Research order (short note)

Three coherent batches, with sources reused across obligations: (1) notebook-format authority + notebook-diff component — nbformat changelog, nbdime diffing internals (grounds Q1/Q2, N1/N2); (2) cell-id spec (JEP 62), git rename-detection and clone-destination docs, and an issue search for a real failure chain (grounds Q1/Q3, N3/N4/N5); (3) verification reads — nbformat validator source, nbdime similarity settings, latest-release locators (grounds Q2/Q3 precision). Host histories/captures hold the actual operation records.

## 2. Primary sources and locators

All captures taken 2026-10-03 via this case's public-HTTPS capture tool. Each citation names the exact artifact (repo, path/ref, function/section, issue/PR number); capture sha256 prefixes are listed here (full hashes are in the host's mechanical capture ledger). Branch refs were current at capture time; behavior claims are conditioned on those refs.

| ID | Source / version locator | Capture sha256 (prefix) |
|----|--------------------------|-------------------------|
| S1 | jupyter/nbformat `CHANGELOG.md` @ `main` (latest release entry: 5.11.1; historical entries 4.0→5.11.1) | `414e10d37deb…` |
| S2 | jupyter/nbdime `README.md` @ `main`; latest release `v4.0.4`, published 2026-02-10 (GitHub Releases API, tag_name v4.0.4, target_commitish main) | `24cc7e5ead43…` / `8bc19b500333…` |
| S3 | jupyter/nbdime `nbdime/diffing/notebooks.py` @ `main` | `9f9739feb52d…` |
| S4 | jupyter/nbdime `nbdime/diffing/generic.py` @ `main` | `8a4493e7e622…` |
| S5 | jupyter/enhancement-proposals `62-cell-id/cell-id.md` @ `master` — JEP 62, front-matter `status: Implemented`, PR jupyter/enhancement-proposals#62 | `7f52a9c224fd…` |
| S6 | jupyter/nbformat `nbformat/v4/` directory listing @ `main`: per-minor schemas `nbformat.v4.{4.0,4.1,4.2,4.3,4.4,4.5}.schema.json`; `nbformat.v4.schema.json` is byte-identical to the 4.5 schema (same git blob sha `670bbd35f343…`) | `b3385c61115d…` |
| S7 | jupyter/nbformat `nbformat/validator.py` @ `main` | `3db1fe48de10…` |
| S8 | jupyter/nbformat issue #235 "Validation should not mutate arguments" (opened 2021-11-16 by @Carreau, MEMBER; state: open) via GitHub API | `40420f0c01c3…` |
| S9 | jupyter/nbformat PR #447 "Remove deprecated kwargs from validate() function" — files patch touching `nbformat/validator.py` and `tests/test_validator.py` via GitHub API | `bb26336a680f…` |
| S10 | GitHub issues search `repo:jupyter/nbformat "duplicate cell id"` (hits #400, #243 "Merciful validation", #359 "Ambiguous warning about missing cell IDs") | `f234572e4467…` |
| S11 | git/git `Documentation/gitdiffcore.adoc` @ `master`, section "diffcore-rename: For Detecting Renames and Copies" | `28cf7eb14e75…` |
| S12 | git/git `Documentation/git-clone.adoc` @ `master`, `<directory>` parameter description | `32ab4dc61fe9…` |

## 3. Q1 — Which two existing components offer useful precedents, and what version-specific behavior supports a minimal approach?

### 3.1 Component A: nbdime (Jupyter notebook diff/merge tools) [SRC S2–S4]

- Purpose-fit tooling: `nbdiff`, `nbmerge`, `nbdiff-web`, `nbmerge-web`, `nbshow` (S2 README). Latest numbered release: **v4.0.4** (2026-02-10) (S2).
- Notebook-aware diffing core (S3, `main`): the `/cells` sequence is aligned by a multilevel algorithm using predicates in explicit **low→high precedence** order: `compare_cell_approximate` → `compare_cell_moderate` → `compare_cell_strict` → `compare_cell_by_ids`. `compare_cell_by_ids` is documented: "Compare cells x,y strictly using cell IDs … Only consider equal if both have IDs and they match." So cell **id equality is the strictest alignment signal**, with similarity-based fallback beneath it — the exact two-regime identity model our prototype needs.
- Lane separation is built in: `set_notebook_diff_targets(sources, outputs, attachments, metadata, identifier, details)` toggles diffs at paths `/cells/*/source`, `/cells/*/outputs`, `/cells/*/metadata`, `/metadata`, `/cells/*/id`, `/cells/*` (execution_count) (S3). Output comparison "deliberately" skips metadata and execution_count in approximate mode (`compare_output_approximate`), and `diff_single_outputs` splits output `data` from the rest of the output dict (S3).
- Bounded comparisons: `TEXT_MIMEDATA_MAX_COMPARE_LENGTH = 10000`, `STREAM_MAX_COMPARE_LENGTH = 1000`, `MIN_MATCH_LENGTH = 5` (S3); similarity defaults `{"threshold": 0.3, "ignore_whitespace_lines": True}` configurable via `set_text_similarity_options` (0.0–1.0 enforced) (S4); `compare_strings_approximate` uses `difflib.SequenceMatcher` ratio with fast cutoffs (S4).
- Version condition preserved: module docstring — the diff tools "assume the notebooks have already been converted to the same format version, currently v4 … Up- and down-conversion is handled by nbformat" (S3). **[SRC]** nbdime does not do version normalization itself.

### 3.2 Component B: git (diffcore rename detection + clone destination rule) [SRC S11–S12]

- Rename detection (`diffcore-rename`, enabled by `-M`) merges a deleted/added filepair into a rename (`R100 fileX file0`) when contents are "similar enough"; similarity uses the "extent of changes" score with a **default of 50%**, customizable via `-M<n>` (e.g. `-M8` = 80%) (S11).
- Pipeline and ambiguity policy (S11): exact rename detection runs first; then a **preliminary same-filename-across-directories pass** "uses a bit higher threshold" and marks those pairs as renames, excluding later candidates — git documents the accepted tradeoff that "an added docs/ext.md that may be even more similar to the deleted docs/ext.txt" will *not* be considered once the same-name pass matched; the final quadratic step pairwise compares all unmatched files for the highest-content-similarity best matches.
- Safety precedent: `git clone` into `<directory>` — "Cloning into an existing directory is only allowed if the directory is empty." (S12).

### 3.3 Comparison and recommendation [INF / CHOICE / FIX]

| Criterion | nbdime | git diff/diffcore |
|---|---|---|
| Notebook-awareness | Native (cell/source/outputs/metadata lanes) [SRC S3] | None — notebooks are opaque JSON [INF] |
| Cell identity under 4.5+/pre-4.5 | id-match predicate + similarity fallback [SRC S3] | n/a |
| Rename handling | n/a (not a file tool) | Exact-first, 50% default, best-match auto-resolution [SRC S11] |
| Safety model | n/a | Clone refuses non-empty destination [SRC S12] |
| Reuse cost | Importable library; we consume alignment + lane diffs [INF] | Policy precedent only; snapshots are not repositories, and shelling out to git would require fabricating a repo [CHOICE] |

**Recommendation [CHOICE]:** reuse **nbdime's notebook diffing library** (`nbdime.diffing.notebooks.diff_notebooks` + predicates) for the notebook lane, and adopt **git's rename-detection policy** (exact-hash first, then thresholded similarity, best-match last) reimplemented in a small manifest-based matcher for the file lane — but with one deliberate divergence: **expose ambiguous pairings instead of auto-resolving them** (see §4.3; git's same-name preliminary pass silently excludes a possibly-better candidate, which is acceptable for displaying a diff but not for a recovery tool where the inferred pairing decides what is copied). **Concrete tradeoff:** reusing nbdime inherits its tested multilevel alignment and lane separation (less code to own) at the price of accepting its default similarity behavior (threshold 0.3, whitespace-line ignoring — S4) unless overridden; a hand-written minimal matcher would give full control but re-create and re-test alignment logic nbdime has already debugged. We take the nbdime reuse plus an explicit ambiguity layer on top; we do not adopt its diff *format* for presentation, only its alignment/diff computation.

**Version-specific behavior supporting a minimal approach [SRC]:**
1. nbdime requires both inputs already at the same format version (v4) and delegates conversion to nbformat (S3) → the prototype can require both snapshots to be nbformat 4.x (the brief fixes version-4) and skip any conversion code entirely.
2. JEP 62 makes `id` required **only for nbformat 4.5+**; older formats are id-less by spec (S5) → the matcher legitimately has two declared regimes (§4.2) instead of guessing one universal rule.
3. nbformat ships per-minor schemas 4.0–4.5 and, for a *newer* minor than known ("notebook from the future"), validates against the latest schema with all `additionalProperties: False` relaxed and `unrecognized_cell`/`unrecognized_output` allowed (`get_validator`/`_allow_undefined`, S7) → the prototype can report and *degrade* validation for unknown minors instead of failing.
4. nbformat ≥(4,5) enforces id uniqueness (ValidationError in the non-repairing path, S7 `_normalize`) → duplicate-id ambiguity is *detectable*, not guessable.

## 4. Q2 — Separating source/outputs/metadata; identity under differing conditions; renames, untracked files, capture limits

### 4.1 Notebook change observations [SRC S3, S4 → CHOICE]

The prototype adopts nbdime's lane separation and reports five observation lanes per cell pair: **source** (line-level diff), **outputs** (structural: `output_type`, `ename/evalue/traceback`, mime-bundle `data`; output `metadata` kept as its own sub-lane), **cell metadata**, **notebook top-level metadata**, and **identifier/execution_count** (`/cells/*/id`, `execution_count`) — mirroring `set_notebook_diff_targets` and the deliberate skipping of metadata/execution_count in output comparison (S3). Comparison bounds copied as defaults: text-mime compare cap 10 000 chars, stream cap 1 000 chars (S3) **[CHOICE]**.

### 4.2 Identity and matching — conditions from JEP 62 preserved [SRC S5, S7, S3 → INF/CHOICE]

Source conditions [SRC]:
- nbformat 4.5+ cells: `id` is **required**, pattern `^[a-zA-Z0-9-_]+$`, `minLength 1`, `maxLength 64`, **unique within the notebook**; ids are stable across content edits; on paste, an application "always needs to check for collisions and generate a new id if and only if there is one"; on split, one part keeps the id, the other gets a new id; uniqueness *across* notebooks is explicitly not a goal (S5, status Implemented).
- Pre-4.5: cells have no `id` field at all; the JEP only describes populating ids when upgrading (S5).
- nbformat validation, `(version, version_minor) >= (4, 5)`: missing id → `MissingIDFieldWarning`; duplicate id → `ValidationError("Non-unique cell id '<id>' detected.")` on the non-repairing path; the repairing path instead warns `DuplicateCellId` and regenerates ids (S7 `_normalize`; see §5 caveat on which path the public default takes).
- nbdime: id equality is the strictest cell predicate and matches **only when both cells have ids and they are equal** (S3 `compare_cell_by_ids`).

Prototype matching rule [INF + CHOICE]:
1. Both snapshots declared 4.5+ and valid: match cells **by id**; such pairs are "identified".
2. A duplicate id within either snapshot: id-based matching is **refused for that id** (mirroring nbformat's non-repairing ValidationError semantics) and all same-id cells are listed as ambiguous candidates; similarity may propose candidates, always labeled **inferred**. Captures are never repaired — contrast the upstream repair path that rewrites ids (S7), which destroys exactly the signal a differ needs.
3. Either snapshot declared ≤4.4, or ids absent: fall back to order-anchored similarity (cell_type equality + `difflib` source-similarity, **threshold 0.5** [CHOICE]; nbdime's default 0.3 (S4) is deliberately not adopted here because with no ids to corroborate, false alignments are costlier — the value is a tunable knob); every such pair is labeled **inferred identity**.
4. Reorder observation = matched pairs whose relative order differs between snapshots. Unmatched cells = added/removed.
5. If the similarity fallback yields a many-to-many alignment, report **unresolved identity** rather than choosing.

### 4.3 Ordinary files: edits, renames, untracked, and the limits of captured states [SRC S11 → INF/CHOICE/FIX]

- **Observed difference is primary [OBSERVATION]:** the manifest records a sha256 per captured path. Same path, different hash → *edited*. Path present only in one snapshot → *disappeared* / *appeared*.
- **A rename is an inference, never an observation [FIX — the thin plan's "a rename" is re-scoped]:** follow git's policy order (S11): (1) exact content-hash match between disappeared and appeared names → "inferred rename (exact content)"; (2) otherwise similarity-threshold pairing, **default 50%** [CHOICE — borrowed from git's documented default, but our metric is `difflib`-based and is **not** git's "extent of changes" metric; not equivalent, labeled as such]; (3) **if multiple pairings are plausible (e.g., two byte-identical files in A, only one in B), all candidates are listed and identity stays unresolved** — no auto best-match. This is the deliberate divergence from git's same-filename preliminary pass, which documents marking such pairs as renames and excluding a possibly-more-similar candidate (S11): acceptable for rendering a diff, unacceptable for deciding what a recovery copies.
- **Untracked [CHOICE definition]:** a file present in the snapshot directory but absent from the manifest. Limit preserved: the prototype cannot know whether it was untracked at capture time or created/modified afterwards; it is reported as found at comparison time.
- **Limits of captured states [INF]:** unsaved editor buffers are excluded by the brief, so any divergence between in-editor and saved state is unknowable; a manifest entry whose content is missing or fails hash verification leaves that entry's integrity unknown; outputs are known only as saved in the `.ipynb` — current kernel state is out of scope offline.

## 5. Q3 — Real issue → fix → test chain, scoped lesson, and validation

All steps below are [SRC S8/S9/S1/S7/S10], with conditions preserved:

- **Issue:** jupyter/nbformat **#235 "Validation should not mutate arguments"** (opened 2021-11-16 by @Carreau, MEMBER; open as a tracking issue): "Currently if a code cell has a missing id, it will silently add one to it" — (1) it mutates its argument, (2) it contradicts the documented raising behavior; the concrete harm is **signature breakage**: validate() runs during save, so the signature computed before saving no longer matches what was saved, "and worse, as it mutates you may be scratching your head as to why." Proposed remedy: raise unconditionally; provide an explicit normalize step (S8).
- **Corroborating report:** issue **#243 "Merciful validation"** describes the same mutation for non-unique cell ids: a validation error is emitted *and* "the notebook that you passed in will be modified" (S10).
- **Fix, stage 1 — nbformat 5.5.0 (S1):** the auto-fix arguments of `validate()` are deprecated; explicit `normalize()` is introduced ("available since nbformat 5.5.0") returning `(changes, deep-copied notebook)`; the changelog states validate() "is core to the security model of Jupyter", callers rely on it not mutating its argument, and "validation will fail instead of silently modifying an invalid notebook."
- **Fix, stage 2 — PR #447 "Remove deprecated kwargs from validate() function" (listed under release 5.11.0 in S1):** removes the `repair_duplicate_cell_ids` / `strip_invalid_metadata` kwargs from public `validate()` — and removes a `_DEPRECATION_PENALTY_SECONDS = 3` `time.sleep` that had deliberately penalized callers of the deprecated kwargs (S9 patch to `nbformat/validator.py`).
- **Tests (S9 patch to `tests/test_validator.py`; consistent with current `main`, S7):** `test_non_unique_cell_ids` — fixture `invalid_unique_cell_id.ipynb`, expects `ValidationError` with repair off, **then validates a second time "to verify that we didn't modify the content"**; `test_no_cell_ids` — fixture `v4_5_no_cell_id.ipynb`, same double-validation non-mutation pattern; `test_repair_non_unique_cell_ids` covers the opt-in repair path; `test_strip_invalid_metadata` now goes through explicit `normalize(...)`. Independently, `isvalid()` deep-copies its input, validates with repair off, and **raises `AssertionError` if its argument changed** (S7).
- **Condition preserved on the current source (important):** on `main` (S7, captured 2026-10-03), public `validate()` delegates to `_validate()` whose `repair_duplicate_cell_ids` **defaults to `True`**, i.e. the default public path still reaches `_normalize` and repairs missing/duplicate ids (emitting `MissingIDFieldWarning` / `DuplicateCellId` warnings); the non-mutating *failure* path is what `isvalid()` and `_validate(..., repair_duplicate_cell_ids=False)` exercise. The 5.5.0 changelog sentence states the project's direction; the captured default path still repairs. **[INF] The prototype must not rely on `validate()` being non-mutating.**

**Scoped engineering lesson [INF]:**
1. Any library call inside a read-only pipeline must be *verified* non-mutating at the boundary — deep-copy inputs, as `isvalid()` does, and re-hash captured bytes afterwards.
2. Identity fields are precisely what upstream code may silently "fix"; pin the upstream version and assert captured structures are byte-identical after every library call.
3. Duplicate identifiers must be surfaced as ambiguity, not repaired: a repair destroys the id-equality signal that nbdime's strictest predicate (`compare_cell_by_ids`, S3) depends on.

**Validation derived from this chain:** boundary-mutation guard T9 and duplicate-id fixture T1 in §8 (**proposed, unexecuted** — no execution receipt exists).

## 6. N1 — Bounded capture/input contract and read-only comparison [CHOICE, with SRC-grounded duties]

- **Inputs:** exactly one version-4 `.ipynb` plus ordinary text files (brief scope). `capture` copies the workspace files into `snapshots/<id>/` and writes `manifest.json`: `schema_version`, `created_utc`, and per file: `path`, `sha256`, `bytes`; for the notebook additionally: declared `nbformat`, `nbformat_minor`, `cell_count`, and the cell-id inventory with duplicates marked. After capture, snapshot and manifest are treated as read-only; comparison and recovery open all inputs read-only. No watching, collaborative editing, remote sync, editor buffers, git-history repair, or notebook execution (brief exclusions).
- **Declared versions are reported verbatim** (major, minor). **Unsupported inputs:** notebook major ≠ 4 → refused as out of scope [CHOICE, per the brief's version-4 scope]; minor > 5 ("notebook from the future") → comparison proceeds but validation is reported as **degraded/relaxed**, mirroring nbformat's own relaxed-schema handling (S7 `get_validator`) and without claiming conformance to the unknown minor; minor ≤ 4.4 → identity switches to the similarity regime, which is spec-conformant because `id` is only required at 4.5+ (S5). Note nbformat itself only *requires* `nbformat_minor` for v4 (S1, 5.7.2 "Only require nbformat_minor for v4") — a missing minor on a v4 notebook is reported as a capture defect.
- **Unknowns stated explicitly:** absent capture content (hash unverifiable → integrity unknown); unsaved changes (unknowable by scope); any workspace mutation after capture (the prototype hashes what it reads at comparison time and claims nothing about the live workspace's history).

## 7. N4 — Recovery into a new destination [CHOICE with SRC precedents]

- Interface: `recover --snapshot <id> --dest <new-dir> [--include-untracked] [--on-collision fail|skip|rename] [--allow-partial]` — defaults: collisions **fail**, partial recovery **off**.
- **Destination rule:** the destination must not exist or must be empty; otherwise the whole recovery is refused before anything is written. Precedent: `git clone` — "Cloning into an existing directory is only allowed if the directory is empty." (S12). The original workspace and snapshots are never written; recovery never resets, checks out over, merges into, or rewrites anything (brief).
- **Preconditions:** every manifest entry's content must be present and hash-verified before copying. Missing or mismatched content → that entry is refused and reported as **"not recoverable: content not captured/corroborated."** The prototype never promises recovery of uncaptured content (brief N4); untracked files are copied only with `--include-untracked`, as-is, under their observed names, with no identity claims.
- **Collisions inside the destination** (e.g., an inferred-rename name vs. an untracked file, or duplicate recovered names): default fail with the colliding-name list; `skip`/`rename` variants are permitted but the report must state that the destination then differs from the snapshot.
- **Report:** per file — recovered / skipped / refused + reason; the notebook is recovered **byte-identical to the snapshot**: recovery copies files and never re-serializes notebooks [CHOICE — byte fidelity over canonicalization].

## 8. Revised thin plan — concrete steps and discriminating validation

The thin plan's four wishes (capture contract + minimal components; observations with identity ambiguity and capture limits; copy recovery with explicit refusals; a tiny discriminating fixture set) are replaced by:

- **R1 (N1) Capture:** implement §6 (copy + `manifest.json` + id inventory with duplicate marking). [PROPOSED TEST] manifest round-trip; read-only assertion (mode + hashes before/after).
- **R2 (N2) Notebook lane:** parse with a **pinned nbformat release**; validate only on deep copies using `isvalid()`-style non-mutating checks — never assume public `validate()` is non-mutating (§5 caveat); compute lane diffs reusing `nbdime.diffing.notebooks.diff_notebooks` (S3); layer our identity/ambiguity logic (§4.2) above it. [PROPOSED TEST] T4 below.
- **R3 (N3) File lane:** manifest hash comparison; rename inference per §4.3 (exact-hash → thresholded similarity → ambiguity surfaced); untracked detection. [PROPOSED TEST] T5, T6, T7.
- **R4 (N4) Recovery:** implement §7 (empty-destination rule, hash verification, collision policy, byte-identical copy). [PROPOSED TEST] T8, T8b, T10, plus byte-identity of every recovered file.
- **R5 Reporting:** one comparison report containing declared versions, the identity regime used, observed-vs-inferred labels with their rules/thresholds, ambiguity listings, and explicit unknowns.
- **R6 Fixtures + end-to-end checks:** the fixture suite below wired as automated checks over the full compare→recover path (thin plan step 4, made concrete).

**Discriminating validation — all [PROPOSED TEST], unexecuted in this stage:**
- **T1** duplicate cell ids within one snapshot → identity ambiguity reported, id matching refused for that id, no crash, no silent repair. Discriminates *refuse-and-expose* vs. *repair* design.
- **T2** notebook declared 4.4 (no ids) → similarity-only matching, every alignment labeled inferred; declared minor reported as 4.4. Discriminates the two-regime identity design.
- **T3** same id set, reordered → reorder observation; no source diff fabricated from misalignment.
- **T4** source-only edit / outputs-only change / metadata-only change → each appears in exactly its own lane. Discriminates lane separation.
- **T5** renamed file, identical bytes → "inferred rename (exact content)"; old path not doubly reported as delete+add.
- **T6** two byte-identical files in A, one missing in B → ambiguity: candidate pairs listed, identity unresolved. Discriminates *exposure-based* pairing vs. git-style auto best-match.
- **T7** untracked file → listed; excluded from recovery unless `--include-untracked`.
- **T8** non-empty destination → entire recovery refused, nothing written.
- **T8b** manifest entry without content → entry refused as unrecoverable; default all-or-nothing (partial only with `--allow-partial`).
- **T9** mutation guard: sha256 of every input file and deep-copied notebook structures identical before/after compare and after recover (the §5 lesson, operationalized).
- **T10** collision between a recovered file and an included untracked file → default fail with the name list.

## 9. Claim-status summary

- **Source requirements (normative force preserved):** nbformat schema makes `id` required in cells at 4.5+ with pattern `^[a-zA-Z0-9-_]+$`, length 1–64, unique per notebook (S5, S6); the non-repairing validation path raises `ValidationError` on non-unique ids and `MissingIDFieldWarning` on missing ids (S7); nbdime's strictest cell predicate matches only on id equality and its tools assume both inputs already at the same (v4) format version (S3); git clone only clones into an empty/existing-empty directory (S12); git rename detection is exact-first with a 50% default similarity and a documented best-match exclusion tradeoff (S11).
- **Examples / optional behavior:** JEP 62's id-generation options A–D are recommendations, not requirements (S5); consumers may ignore metadata fields (S1, nbformat 4.4 note); nbdime's similarity threshold/whitespace handling are configurable settings (S4); git's 50% is a customizable default (S11).
- **Engineering inference:** the two-regime matcher (§4.2), the §5 lessons, the capture-limit statements (§4.3, §6).
- **Prototype choices:** thresholds (rename 0.5, id-less cells 0.5), CLI shape and defaults (fail-on-collision, all-or-nothing recovery), major ≠ 4 refusal, byte-identical recovery, untracked definition.
- **Supported corrections to the thin plan [FIX]:** renames are labeled inferences with exposed rules, never observations; refusal/error states are concretely defined (empty-destination, hash-verified content, collisions); "identity ambiguity" is split into *declared* (id-based, with duplicate detection) vs. *inferred* (similarity-based) regimes; validation in the read-only pipeline is explicitly non-mutating because the default upstream path cannot be trusted to be.
- **Proposed, unexecuted tests:** everything in §8 — no execution receipt exists for any of them.
