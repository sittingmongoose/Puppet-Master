# Research-backed proposal: offline saved-state workspace comparison and copy-recovery prototype

Case: V8-NB-BREADTH-C-M (research + proposal stage). This document revises `inputs/THIN_PLAN.md` into a concrete, source-backed plan. It is a plan, not an implementation: **no test or arithmetic in this document has been executed; all validation items are proposed and unexecuted** (no execution receipt exists for them in this case).

## 0. Method and epistemic labels

Every consequential claim below is labeled:

- **[SOURCE]** — fact read from a captured public primary source, cited as [inline excerpt omitted; original artifact pin retained] with the captured body sha256 recorded by the host capture log. Conditions, exceptions and normative force of the source are preserved where they matter.
- **[INFERENCE]** — engineering reasoning that goes beyond the cited sources.
- **[CHOICE]** — a product decision this prototype makes, which a different product could legitimately make differently.
- **[PROPOSED-TEST]** — a discriminating check designed but **not executed** in this case.
- **[CORRECTION]** — a supported correction to the thin plan.

Sources were independently discovered and captured this session (public HTTPS, pinned refs):

- S1: [inline excerpt omitted; original artifact pin retained]
- S2: [inline excerpt omitted; original artifact pin retained]
- S3: [inline excerpt omitted; original artifact pin retained]
- S4: [inline excerpt omitted; original artifact pin retained] (symbols: `get_validator`, `_normalize`, `validate`, `isvalid`, `_get_schema_json`)
- S5: [inline excerpt omitted; original artifact pin retained] (JEP-62, status: Implemented)
- S6: [inline excerpt omitted; original artifact pin retained]
- S7: [inline excerpt omitted; original artifact pin retained] (symbols: `notebook_predicates`, `compare_cell_by_ids`, `compare_cell_approximate/moderate/strict`, `set_notebook_diff_targets`, `diff_single_outputs`, `compare_output_approximate/strict`, module docstring)
- S8: [inline excerpt omitted; original artifact pin retained] (options `-M`/`--find-renames`, `-B`, `-C`, `-l<num>`, `--no-renames`)
- S9: [inline excerpt omitted; original artifact pin retained] (short/porcelain v1/v2 formats, `??` untracked, rename [inline excerpt omitted; original artifact pin retained], `R<score>`)
- S10: commit record [inline excerpt omitted; original artifact pin retained] (PR #217), plus parent-linked commits `9ede360` ([verbatim excerpt omitted; original artifact/source locator retained]) and `94c17b0` (PR #214), retrieved via the GitHub commits API.

---

## 1. Q1 — Two precedent components and the version-specific behavior they contribute

### Component A: nbdime (notebook-aware structured diff/merge)

[SOURCE S6] nbdime v4.0.2 provides `nbdiff`, `nbmerge`, `nbdiff-web`, `nbmerge-web`, `nbshow` — diff/merge of Jupyter Notebooks.

Version-specific and structural facts that support a minimal approach **[SOURCE S7]**:

- The diffing module [verbatim excerpt omitted; original artifact/source locator retained]; [verbatim excerpt omitted; original artifact/source locator retained] (module docstring). *Condition:* notebook comparison must first fix and record the declared `(nbformat, nbformat_minor)` of each side; nbdime itself does not resolve cross-version comparison.
- Cell alignment over `/cells` uses a multilevel predicate list in low→high precedence order: `compare_cell_approximate`, `compare_cell_moderate`, `compare_cell_strict`, `compare_cell_by_ids`. The terminal predicate `compare_cell_by_ids` returns true [verbatim excerpt omitted; original artifact/source locator retained]. So the shipped precedent is: **id-based identity when ids exist and match; graded content-similarity fallback otherwise**.
- `compare_cell_approximate/moderate/strict` all deliberately ignore cell `metadata` and `execution_count` ([verbatim excerpt omitted; original artifact/source locator retained]), and `set_notebook_diff_targets(sources, outputs, attachments, metadata, identifier, details)` toggles `/cells/*/source`, `/cells/*/outputs`, `/metadata`, `/cells/*/id`, `/cells/*/outputs/*/metadata` and `execution_count` independently. *Precedent:* separating **source vs outputs vs metadata vs identifier vs execution state** is a designed axis of notebook comparison, not an invention of this proposal.
- `diff_single_outputs` splits output `data` out from output metadata before diffing; output comparison ignores `metadata` and `execution_count` by design.
- Approximation is bounded and explicit: strings shorter than 10 characters compare equal (`shortlen = 10`), approximate text similarity threshold 0.7, strict 0.95, base64 compared by exact length + equality, `TEXT_MIMEDATA_MAX_COMPARE_LENGTH = 10000`, `STREAM_MAX_COMPARE_LENGTH = 1000`. *Condition:* nbdime's loose modes can declare near-identical things [verbatim excerpt omitted; original artifact/source locator retained]; any reuse must expose these constants as policy, not hide them.

### Component B: Git diffcore/status (rename inference and workspace-state semantics)

- **[SOURCE S8]** `-M[<n>]` / `--find-renames[=<n>]`: rename detection uses [verbatim excerpt omitted; original artifact/source locator retained]; [verbatim excerpt omitted; original artifact/source locator retained]; `-M100%` limits detection to exact renames. `-B` interplay: a totally-rewritten file can be considered a rename source (default 50% under `-B`). `-l<num>`: the exhaustive rename/copy check is O(N²) and is **skipped** when source/destination counts exceed the limit (`diff.renameLimit`) — detection has documented limits, not guarantees. `--no-renames` turns detection off entirely.
- **[SOURCE S9]** [inline excerpt omitted; original artifact pin retained] porcelain v1: rename entries render as [inline excerpt omitted; original artifact pin retained] (only when detection fired); untracked paths render as `??` ("When a path is untracked, `X` and `Y` are always the same, since they are unknown to the index"); porcelain v2 renders renamed/copied entries with an explicit similarity score `<X><score>` (e.g. `R100`) plus `path`/`origPath`. *Normative shape:* a **rename is an inferred classification with a reported score, never a recorded fact of the tree**; untracked is a first-class reported state, distinct from modified and ignored.

### Why these two support a minimal approach

**[INFERENCE]** Together they fix the three hard parts of the brief: (1) *what to compare* in a notebook (source/outputs/metadata/identifier axes — nbdime's target config), (2) *how to identify cells under differing version conditions* (id-first with declared fallback — nbdime predicates, constrained by nbformat's 4.4/4.5 schema conditions, §2), and (3) *how to represent file renames/untracked files without overclaiming* (similarity-threshold inference with score and limits — git). Recovery safety then needs no precedent component: it is plain verified copying (§4), which keeps the component surface minimal.

---

## 2. Version-specific cell-identity conditions (the normative spine)

These conditions are binding inputs to the matcher design in §3:

- **[SOURCE S1]** In the v4.5 schema, `id` is **required** on `raw_cell`, `markdown_cell`, `code_cell` ([inline excerpt omitted; original artifact pin retained]); the `cell_id` definition is [inline excerpt omitted; original artifact pin retained], [inline excerpt omitted; original artifact pin retained], [inline excerpt omitted; original artifact pin retained], [inline excerpt omitted; original artifact pin retained]; notebook `nbformat` is [inline excerpt omitted; original artifact pin retained]; `nbformat_minor` [inline excerpt omitted; original artifact pin retained].
- **[SOURCE S2]** In the v4.4 schema there is **no `id` property at all**; `nbformat_minor` [inline excerpt omitted; original artifact pin retained]. *Condition:* an id on a cell is meaningful **only relative to the declared minor version**; identical cell objects can be valid in 4.5 and (field-wise) undefined in 4.4.
- **[SOURCE S4]** The JSON schema alone cannot enforce id uniqueness; uniqueness is a code-level check. In `validator._normalize`, for [inline excerpt omitted; original artifact pin retained]: a missing `id` raises `MissingIDFieldWarning` ([verbatim excerpt omitted; original artifact/source locator retained]); a duplicate id raises [inline excerpt omitted; original artifact pin retained] **unless** `repair_duplicate_cell_ids=True`, in which case the validator *silently repairs* by regenerating an id (`generate_corpus_id()`) with a `DuplicateCellId` warning. `isvalid()` passes `repair_duplicate_cell_ids=False` and asserts no mutation of its input (deepcopy comparison).
- **[SOURCE S4 + S3]** nbformat itself treated silent repair as a defect: 5.2.0 [verbatim excerpt omitted; original artifact/source locator retained]; 5.5.0 deprecated the auto-fixing arguments of `validate()` — docstring: "`validate()` ... is assumed in a number of places to not mutate its argument, or try to fix notebooks passed to it. Auto fixing of notebook in validate can also hide subtle bugs."
- **[SOURCE S4 `get_validator`/`_allow_undefined`]** A notebook whose `nbformat_minor` exceeds the library's known minor ([verbatim excerpt omitted; original artifact/source locator retained]) is validated with all [inline excerpt omitted; original artifact pin retained] relaxed and `unrecognized_cell`/`unrecognized_output` allowed. *Condition:* future-minor inputs must be tolerated and preserved verbatim, not rejected.
- **[SOURCE S5 (JEP-62)]** Normative intents for ids: required for 4.5+; [verbatim excerpt omitted; original artifact/source locator retained]; an id [verbatim excerpt omitted; original artifact/source locator retained] (content edits do not change it); on paste [verbatim excerpt omitted; original artifact/source locator retained], else generate new; on cell split, one part keeps the id and the other gets a new one. Documented con, quoted: [verbatim excerpt omitted; original artifact/source locator retained]
- **[SOURCE S4]** The validator's repair path generates ids via `corpus.words.generate_corpus_id()` — i.e., generated ids are tool-assigned, content-independent values (see §5 for that generator's history).

**[INFERENCE]** Therefore cell identity in this prototype is *conditional*, never absolute: id-equality implies same cell only when both sides declare ≥4.5 and ids on each side are present, schema-valid, and unique. Anything else is a graded fallback whose output must carry its uncertainty.

---

## 3. Q2 — Distinguishing source / output / metadata changes; identity, renames, untracked, capture limits

### 3.1 Observation model (N2)

**[CHOICE]** Parse each snapshot's `.ipynb` strictly as captured JSON; record [inline excerpt omitted; original artifact pin retained] from the file **and** cross-check it against the snapshot manifest's declared minor; disagreement is itself an observation. Refuse (report unsupported) any file with [inline excerpt omitted; original artifact pin retained] [SOURCE S1/S2: `nbformat` maximum is 4].

**[CHOICE]** Each cell is decomposed into independent axes, following nbdime's target separation [SOURCE S7]: [inline excerpt omitted; original artifact pin retained], `cell_type`, `source`, `outputs` (with per-output `data` vs output `metadata`/`execution_count` kept separate), [inline excerpt omitted; original artifact pin retained], `attachments`, `execution_count`. `execution_count` changes are reported as *execution-state* observations, explicitly not content changes (nbdime ignores it in all cell comparisons [SOURCE S7]).

### 3.2 Matching algorithm (bounded, exact-first)

**[INFERENCE + CHOICE]**

1. **Condition pass (read-only).** For each side, evaluate id presence, pattern (`^[a-zA-Z0-9-_]+$`, 1–64 [SOURCE S1]) and uniqueness per declared minor. No mutation, no repair — ever. [SOURCE S4/S3: nbformat's own lesson that auto-repair hides bugs; `isvalid()`'s no-mutation assertion is the precedent.] Conditions found (missing ids, invalid-pattern ids, duplicate ids, minor-version mismatch vs manifest) are first-class report entries.
2. **Id-first matching.** If both sides have usable (present, valid-pattern, unique) ids → match by exact id equality. Same id ⇒ same cell; then diff each axis separately (source / outputs / metadata / attachments / execution_count). Reordering with intact id pairing ⇒ a **move/order observation**, never delete+add. This is nbdime's terminal `compare_cell_by_ids` policy [SOURCE S7], adopted in its exact form.
3. **Fallback (no usable ids on one or both sides).** Match remaining cells by exact source equality first (unique partner required), then by exact (cell_type, source, outputs) equality; only then report as unmatched add/remove pairs. **[CHOICE]** No fuzzy similarity thresholds in v1: nbdime's approximate mode treats <10-char strings as equal and uses 0.7/0.95 similarity [SOURCE S7], which is tuned for interactive review; a comparison tool whose job is to *expose* differences must not silently equate near-identical sources. The tradeoff is explicit: lower recall of moved-but-edited cells, in exchange for deterministic, explainable output.
4. **Ambiguity rules (exposed, not smoothed over).** Duplicate id within a side ⇒ id matching disabled for that id; its cells fall to content matching and the report lists `duplicate-id` ambiguity. Ids on one side only (e.g. 4.4 vs 4.5) ⇒ matched cells are labeled `identity-uncertain` (content may match exactly while identity is unproven — JEP-62's byte-inequality con [SOURCE S5]). Equal source with different ids on both id-carrying sides ⇒ reported as [verbatim excerpt omitted; original artifact/source locator retained], not silently merged.
5. **Unrecognized content.** Cells/outputs from a higher minor than the shipped schemas are preserved verbatim and reported as `unrecognized` per the future-minor rule [SOURCE S4], never dropped.

### 3.3 Workspace files: edits, renames, untracked (N3)

- **Observed difference (fact):** path-set membership diff between the two manifests ⇒ `added(p)` / `removed(p)`; same-path byte-difference (sha256) ⇒ `modified(p)`. This layer makes no claims.
- **Rename (inference, labeled):** a `removed(p)` paired with `added(p')` becomes *rename* only under a declared rule. **[CHOICE]** Adopt git's rule shape [SOURCE S8]: default mode = exact content equality (sha256 identical ⇒ rename reported with score 100, git `-M100%` semantics); optional similarity mode with threshold 50% (git's default) reporting a score as in porcelain v2's `R<score>` [SOURCE S9]; at most one source per target; detection skipped above a configurable path-count limit (git `-l`/`diff.renameLimit` precedent, documented O(N²) cutoff [SOURCE S8]). Below threshold, the pair is reported as independent add+delete. **The report always shows both layers: the raw add/remove observations and, separately, the inferred rename with its score and rule.** Unresolved identity stays visible.
- **Untracked (fact of the capture, not an inference):** tracked/untracked status is taken only from the snapshot manifest's per-file `tracked` field (values [inline excerpt omitted; original artifact pin retained]), semantically aligned with git-status's `??` state ([verbatim excerpt omitted; original artifact/source locator retained] [SOURCE S9]). **[INFERENCE]** If the capture did not record status (`unknown`), the prototype must report *capture-unknown*, never guess [verbatim excerpt omitted; original artifact/source locator retained] from content.
- **Limits of two saved states (conditions, stated in every report):** no common ancestor exists, so edit direction and three-way move/rename chains are undecidable; unsaved editor buffers are out of scope by the brief; notebook output changes may reflect re-execution between captures, not intent (outputs are reported, not interpreted); anything not captured in a snapshot is unrecoverable and unreportable beyond its absence.

---

## 4. Q3 — Real issue → fix → test chain: nbformat cell-id generation

This chain is fully traced in captured primary sources; it is directly about cell identifiers, which our matcher depends on.

1. **Spec/feature.** JEP-62 [SOURCE S5] made `id` required in nbformat 4.5+ and recommended corpus-generated human-readable ids ([verbatim excerpt omitted; original artifact/source locator retained]); nbformat implemented it in commit `9ede360` [verbatim excerpt omitted; original artifact/source locator retained] (2020-08-27) [SOURCE S10] and shipped it in 5.1.0: [verbatim excerpt omitted; original artifact/source locator retained] [SOURCE S3].
2. **Real failure.** The shipped generator drew `adjective-noun` pairs from bundled word lists: `nbformat/corpus/words.py` was [inline excerpt omitted; original artifact pin retained] over `adjectives.txt` (1366 words) × `nouns.txt` (3714 words) [SOURCE S10, fix-commit diff]. The space was ~5.07M combinations — the then-test documented the collision odds in-source: [verbatim excerpt omitted; original artifact/source locator retained] [SOURCE S10]. Two concrete defects: (a) **user-visible offensive identifiers** — the fix commit message states the motivation verbatim: [verbatim excerpt omitted; original artifact/source locator retained] [SOURCE S10], and the removed `adjectives.txt` visibly contained words such as [verbatim excerpt omitted; original artifact/source locator retained], [verbatim excerpt omitted; original artifact/source locator retained], [verbatim excerpt omitted; original artifact/source locator retained], [verbatim excerpt omitted; original artifact/source locator retained], [verbatim excerpt omitted; original artifact/source locator retained]; (b) the corpus plumbing kept breaking — PR #214 [verbatim excerpt omitted; original artifact/source locator retained] [SOURCE S10]. Auto-generated ids land in files, URLs and databases (JEP-62's own rationale for character restrictions [SOURCE S5]), so a [verbatim excerpt omitted; original artifact/source locator retained] was a real product failure, not cosmetics.
3. **Fix.** PR #217, commit `75f4f442952464c1ab9a6401e526163f2ee9b778` (2021-04-02): `generate_corpus_id()` became `uuid.uuid4().hex[:8]`; `adjectives.txt` (1366 lines), `nouns.txt` (3714 lines) and the corpus-generator notebook were deleted (commit stats: +15/−5305) [SOURCE S10]. Release-recorded in the changelog as 5.1.3: [verbatim excerpt omitted; original artifact/source locator retained] [SOURCE S3].
4. **Test.** The same commit updated `nbformat/corpus/tests/test_words.py::test_generate_corpus_id`: it asserts a generated id has length > 7, that two successive ids differ, that no warnings are emitted, and it replaced the in-source collision comment with the new bound [verbatim excerpt omitted; original artifact/source locator retained]; the corpus-set tests (`test_acceptable_nouns_set`, `test_acceptable_adjectives_set`) were removed with the corpus [SOURCE S10]. The generator remains in use by the validator's repair path ([inline excerpt omitted; original artifact pin retained], S4).

**Scoped engineering lesson. [INFERENCE]** Identity fields that the tool itself mints must be: content-independent, collision-bounded with the bound documented in the code, and safe to surface in any UI/URL — and comparison tooling must never *silently rewrite* identifiers it dislikes (nbformat's parallel lesson: silent validator repair deprecated by 5.5.0 because [verbatim excerpt omitted; original artifact/source locator retained] [SOURCE S3/S4]).

**Validation that follows (all [PROPOSED-TEST], unexecuted).** Our recovery path, if it must mint ids for a 4.5 destination notebook, uses deterministic content-hash-derived ids (8 hex chars, same schema pattern [SOURCE S1]), records minting as an applied transform in the report, and never mutates snapshot inputs (byte-hash before/after must be equal, per the `isvalid()` no-mutation precedent [SOURCE S4]). Discriminating fixtures: duplicate-id and missing-id notebooks must produce observations, never repairs.

---

## 5. Component comparison and bounded recommendation (N5)

| Axis | nbdime v4.0.2 [S6,S7] | Git diffcore/status v2.42.0 [S8,S9] |
|---|---|---|
| Domain | Structured notebook diff/merge (cells, outputs, mime bundles) | Line-oriented text diff + rename/copy inference over paths/blobs |
| Identity model | Cell id equality as terminal predicate; graded similarity fallback | Pure content-similarity inference; threshold 50% default; score reported |
| Version conditions | Assumes both sides already v4; conversion delegated to nbformat (docstring) | Version-agnostic; content-addressed blobs |
| Bounds/limits | Explicit constants: <10-char strings equal; 0.7/0.95 thresholds; 10k/1k length caps | Explicit `-M<n>` threshold; `-M100%` exact mode; `renameLimit` skips detection (O(N²)) |
| Failure posture | Approximation can mask small edits by design | Under-detects (skips/gaps) rather than over-claims; renames always scored |

**[CHOICE] Recommendation (bounded):** use **nbformat (v5.9.2)** for parsing, schema validation and version handling; implement a **small purpose-built cell matcher** that copies nbdime's *id-first* policy but only its exact tier; and adopt **git's rename rule shape** (scored, thresholded, limit-bounded, default exact). Do **not** embed nbdime wholesale. Concrete tradeoff: we give up nbdime's rendered web diffs, merge machinery and fuzzy alignment of moved+edited cells; we gain deterministic exact comparisons, honest ambiguity reporting, and one fewer heavyweight dependency in a small offline desktop prototype. nbdime remains the normative reference for *which axes exist* (source/outputs/metadata/identifier) and for id-priority matching.

**[CORRECTION]** of the thin plan: step 1 ([verbatim excerpt omitted; original artifact/source locator retained]) resolves to the above combination rather than a single component; step 2 gains explicit identity-ambiguity and version-condition handling the thin plan lacked; step 3 gains refusal semantics and byte-verification the thin plan lacked.

---

## 6. Revised implementation steps (replacing thin-plan steps 1–4)

1. **Capture/input contract (N1).** Snapshot = directory with `manifest.json`: `workspace` id, `created_utc`, per-file entries [inline excerpt omitted; original artifact pin retained] and `notebook_minor` for the one .ipynb; blob content stored alongside. Inputs (original workspace, repository metadata, snapshots) are opened read-only; no watcher, no sync, no editor buffers, no Git history repair, no notebook execution (brief scope). Unsupported inputs refused with reason: [inline excerpt omitted; original artifact pin retained] [S1/S2], id-pattern violations *reported* (not refused — they are observations), missing manifest fields ⇒ that fact is reported **unknown**; unsaved changes ⇒ permanently unknowable from saved states (stated in report).
2. **Comparison engine (N2, N3).** Exactly the model of §3: condition pass → id-first matching → exact-content fallback → ambiguity surfacing; file layer = observed add/remove/modify + scored rename inference + tracked/untracked/unknown status.
3. **Recovery (N4).** Requires an explicitly selected snapshot. Recovery target must be a **new** directory: refuse if the destination path exists (even empty) — no resets, no checkout-over, no merges, no rewrite of the original. Refuse if any selected entry's blob is missing or its sha256 mismatches the manifest (missing snapshot content is never [verbatim excerpt omitted; original artifact/source locator retained]). Untracked files are recovered only if their captured blob exists; [inline excerpt omitted; original artifact pin retained] is recovered like any captured file but reported with its unknown status. Name collisions (two sources → one destination path; case-folding hits) are collected first and refused as a set — **no partial writes**: stage into a sibling temp dir, fsync-copy, verify each sha256, then atomically rename into place; on any failure delete the staged dir and leave the filesystem untouched. Every recovery report lists what was recoverable and what was not, and never promises uncaptured content.
4. **Validation (N4, N5).** Tiny fixture set + the discriminating checks of §7, covering the full compare→recover path.

---

## 7. Discriminating validation (all proposed and unexecuted)

Each check fails under a specific naive alternative, so results discriminate designs, not just code paths:

- **T1 move-vs-churn:** v4.5↔v4.5, cells reordered by id ⇒ report shows order/move, not delete+add. Fails a pure positional matcher.
- **T2 duplicate ids:** one side carries a duplicated id ⇒ id matching suppressed for it, content matching proceeds, `duplicate-id` ambiguity listed. Fails any matcher that trusts ids unconditionally.
- **T3 cross-minor:** v4.4 (no ids) ↔ v4.5 (ids) ⇒ declared minors reported; equal-source cells matched exactly and labeled `identity-uncertain`. Fails an id-required matcher and an id-blind matcher alike.
- **T4 source/output separation:** outputs-only change ⇒ source reported unchanged; source-only change ⇒ outputs not implicated. Fails text-level whole-file diffing of the .ipynb.
- **T5 metadata separation:** cell-metadata-only change ⇒ single metadata observation. Fails matchers that ignore metadata or fold it into source.
- **T6 rename discipline:** identical content moved ⇒ rename score 100; ~60% similar ⇒ rename only in similarity mode (threshold 50%), score shown; ~10% ⇒ add+delete; [inline excerpt omitted; original artifact pin retained] ⇒ reported unknown, never [verbatim excerpt omitted; original artifact/source locator retained]. Fails an always-infer rename heuristic and an never-infer one.
- **T7 recovery refusals:** existing destination ⇒ refusal with zero writes (verify destination parent unchanged); missing/mismatched blob ⇒ refusal; two-source collision ⇒ refusal with both paths listed; success path ⇒ every copied byte-verified against manifest sha256 and original workspace hash unchanged. Fails copy-then-pray recovery.
- **T8 no-mutation:** workspace+snapshot tree hashes before/after compare and recover are identical (precedent: nbformat `isvalid()`'s deepcopy assertion [S4]). Fails any validator-style silent repair.

---

## 8. Obligation map (N1–N5)

- **N1** — §6.1 (contract, read-only, declared versions, unsupported inputs) + §3.3 (capture limits, unknowns) + T7/T8.
- **N2** — §3.1–3.2 (axes, identity/matching, ambiguity under absent/duplicate ids, reordering, version conditions from §2) + T1–T5.
- **N3** — §3.3 (observed vs inferred rename, chosen equivalence rule, untracked/unknown, unresolved identity exposed) + T6.
- **N4** — §6.3 (new-destination recovery, refusals, missing content, collisions, recoverability promises) + T7.
- **N5** — §1 + §5 (two compared components, bounded recommendation with tradeoff), §4 (real issue→fix→test chain), §6–§7 (revised steps + discriminating validation).
