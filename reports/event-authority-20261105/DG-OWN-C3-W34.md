# DG-OWN-C3-W34 — stopped at the original projection representation gate

Branch `plans/ea-goal-own-c3-w34-20261105`, based exactly on `e1188eae0c5fa5cf0a8548d9dba76f6f0de8c437`. **Neither assigned suite is COMPLETE. Both stop on the exact technical blocker below.** This is a blocker handoff, not another partial source-witness delivery. Native execution is NOT_RUN.

## Location, cause, and required repair

**Location.** `Plans/storage-plan.md:26505` (SP-311) explicitly requires a reference representation when the entire derived projection would exceed 16 KiB: “the row keeps the Event identity, whole-value commitment and BLAKE3 payload-store reference (SP-337)”. The same paragraph explicitly applies it to `CancelledProjection` in SP-312. SP-337 is at `Plans/storage-plan.md:28895`.

The selected original roots cannot express that representation:

| Family | Exact selected complete wrapper | Required full Event member |
|---|---|---|
| `goal_run.started` / W3 | `Plans/goal_run_started_consumer_contracts/consumer.schema.json:544`, `#/$defs/StorageProjection` | Closed `Projection` at line 113 requires `original_event` at line 120; its schema at line 142 selects the complete `TypedOriginalEvent`. |
| `goal_run.cancelled` / W4 | `Plans/goal_run_cancelled_consumer_contracts/consumer.schema.json:1392`, `#/$defs/CombinedStorageProjection` | Closed `CancelledProjection` at line 1103 requires `original_event` at line 1110; its schema at line 1146 selects the complete `TypedCancelledEvent`. |

`Plans/storage_value_registry.json:115883` and `:116145` select those same whole wrappers. Neither the wrapper nor its record has a payload-reference alternative. The combined union's other branch is the original full started projection, not a reference branch. W4's positive Event itself remains inline-only; this finding concerns the **derived projection**, including a case whose Event is below the inline limit.

**Cause.** DL-270's newer projection/payload owner requirement has no corresponding representation in these frozen original whole schemas. The eight diagnostic schema checks in `scripts/pm_goal_own_c3_w34_oracles.py` reproduce it without modifying a schema, bank, URI, hash, registry selection or existing checker:

| Schema specimen | Embedded Event MessagePack bytes | Complete wrapper MessagePack bytes | Result |
|---|---:|---:|---|
| Started `StorageProjection` | 12,749 | 16,385 | Complete original schema accepts; whole stored value exceeds the owner limit. |
| Cancelled branch of `CombinedStorageProjection` | 10,199 | 16,385 | Complete original schema accepts; whole stored value exceeds the owner limit. |

For each wrapper a small complete schema specimen also validates. Removing only `record.original_event` refuses. Substituting a scalar reference at its original Event-schema seam refuses with `type`. These are **schema specimens**, not authentic native-source positives: they do not assert Start/D06 issuance, provenance, coherent source digests, native admission, or a complete semantic path. MessagePack is used only to measure byte length; map ordering does not change that length. No numeric identity codec, cap, or physical-float normalization was introduced.

**Required repair.** Supply an explicitly versioned whole projection schema/resource/physical-selection successor for each exact family that implements the existing SP-311/SP-312 reference obligation. Preserve old roots and historical bytes. Define the exact reference/identity/whole-value-commitment join, original pack durability/read/access/source-lifetime predicates, wrapper and operation limits, and rebuild/cutover selection, then run the original-path suites against that explicitly selected edition. This is technical schema/selection work, not a new retention or product choice.

**Why a new test contract cannot supply the missing original.** A prose adoption or TEST_ONLY issuer cannot make a reference validate against these exact closed original roots. Widening their required Event member would change frozen original schema bytes and their banks; selecting a different representation implicitly would substitute a schema edition. C3's brief prohibits rewriting/restamping original banks, URIs and hashes, and prohibits registry changes. Silently accepting an oversized wrapper, treating a failed projection as successful reference publication, or claiming the producer's inline-only refusal covers the newer mandatory projection-reference route would weaken the requirement. This worker stops at that incompatibility. It does not claim the missing successor was implemented.

## Search, original realms, and premises

Each family was searched separately across live Goal_Runtime_System, Executor_Protocol, Contracts_V0, Automated_Testing_System, storage-plan, Event/Storage registries, its own complete consumer schema/method/physical roots, and DG-OWN-C protocol/suite metadata. `source-search.json` records all fifteen paths, complete file hashes and exact term line hits independently for each family. The existing producer, passive-reader, projector and checkpoint bindings are reused as evidence; no missing owner identifier was inferred from a sibling. No selected reference alternative was found in either family's own original wrapper. The current `origin/main` copies of both whole consumer schemas are byte-identical to the pinned base; `main-comparison.json` records the exact revision and hashes. This is not a branch-local deletion.

DL-045's exact Goal row still names both registered families and permits technical depth work. GRS-079/EP-120/SP-311 still bind original Start; GRS-080/EP-121/SP-312 still bind positive D06 and its distinct causal graph. Those premises hold. DL-270's 16 KiB/store-once decision remains in SP-337 and the specific SP-311 projection amendment. The failed premise is narrower: an original schema-valid inline projection is **not** a complete current stored representation for the amended owner requirement. No new product ruling, retention/deletion interpretation, application Stop edition or DL-448 work is authored.

Eight whole-resource location mappings resolve the exact frozen prerequisite bytes, including the different old/v7 Source Control hashes. These are diagnostic file locations only, not new bank members or new source authority. The old W3 consumer's two isolated realms eagerly resolve all their references. The W4 native consumer retains 22 unresolved reference sites (eleven distinct relative references exposed through two literal retrieval roots); its Goal and FileSafe realms resolve. They point at the old completion input's `inputs/Plans/plans_to_code_handoff.schema.json` URI.

The native-v7 composition has an **existing explicit** scoped import for that exact URI in `Plans/goal_certified_event_coordinator_contracts/original-reference-routing.json`. Its target is the whole retained original resource at SHA-256 `1b1cff7b32b90f22734e90f025c020a05f9145fbea82ce156cb2224611ce8d4d`; nested resolution stays in the retained realm. The bare native-v7 bank's 22 sites are therefore not reported as a missing v7 contract. No corresponding edge was inferred for the older W4 bank. The older report already identifies those aliases as inactive, and this handoff does **not** claim that they break an active D06 method. They remain an eager-whole-bank qualification item, separate from the primary projection-root blocker.

## Closure and twelve-criterion re-grade

| Family | Whole-root closure | Before | After | Exact stop |
|---|---|---:|---:|---|
| `goal_run.started` | **BLOCKED** | 11/12 | 10/12 | Selected `StorageProjection` cannot represent SP-311's required oversized-row reference route. |
| `goal_run.cancelled` | **BLOCKED** | 11/12 | 10/12 | Selected combined wrapper's `CancelledProjection` cannot represent the same expressly adopted route. |

Criterion order follows the twelve-criterion rubric. Both families have the same vector; the JSON beside this report contains current citations, exact quotes and complete file hashes for every cell.

| Criterion | Started | Cancelled |
|---|---|---|
| membership_version | PASS | PASS |
| owner_doc | PASS | PASS |
| producer | PASS | PASS |
| closed_payload_schema | PASS | PASS |
| scope_identity | PASS | PASS |
| replay_idempotency | PASS | PASS |
| retention | PASS | PASS |
| redaction_custody | PASS | PASS |
| transitions | PASS | PASS |
| consumers_checkpoints | **PARTIAL** | **PARTIAL** |
| compatibility_withdrawal | PASS | PASS |
| positive_negative_oracles | **PARTIAL** | **PARTIAL** |

The consumer cell is downgraded for the demonstrated missing stored-row representation, not for native NOT_RUN. Event payload-schema and membership cells are unchanged: this is a derived Storage schema gap, not a new Event family or version. Full original Start/native/D01 production/publication, native-v7 dispatch, original D06/D05/effects/current-read, generic source/checkpoint/CAS/crash/staging/cutover/withdrawal suites remain unclosed. No untested facet is upgraded.

## Changes, checks, and merge scope

- **New script:** `scripts/pm_goal_own_c3_w34_oracles.py`, original-resource and projection representation preflight. It deliberately exits 2 with `BLOCKED_ORIGINAL_PROJECTION_REFERENCE_ROOT_MISSING`.
- **New reports:** this file and `DG-OWN-C3-W34-self-grade.json`.
- **Owner units added/amended:** none. **IDs used:** none. No allocation scan/mint was needed.
- **Shared-file hunks:** none. ATS-1118, protocol.md, suites.json, all existing oracle files, original banks, schema resources and registries are unchanged.
- **Complete-path oracles added:** 0 positives / 0 negatives. **Diagnostic checks:** 4 valid schema specimens / 4 required schema refusals. They are not counted as complete-path oracles.
- **New product guards and guard-to-negative mapping:** none. No local guard-isolation engine or check-11 clearance is claimed.

| Command | Exit | Fresh result |
|---|---:|---|
| `git fetch origin` | 1 then 0 | First fetch collided with another process updating remote refs; retry succeeded. Exact requested base verified. |
| New W34 preflight with `--output` | 2 | Exact technical stop; four valid specimens and four refusals. |
| `python scripts/pm_goal_own_c_oracles.py --output ...` | 0 | Inherited bounded adapter: 355 cases, 46 positive / 309 negative; full inherited coverage still PARTIAL. This adapter has no parallel removal audit. |
| `python -m py_compile scripts/pm_goal_own_c3_w34_oracles.py` | 0 | Pass. |
| Current citation check and canonical root comparison | 0 | Carried citations match; both consumer root files equal current origin/main. |
| `git diff --check` | 0 | Pass. |

Commands requiring msgpack/blake3 used an isolated temporary Python 3.14 venv with the system jsonschema/referencing packages, msgpack 1.2.4 and blake3 1.0.11. The initial system-Python import lacked msgpack; the isolated environment resolved that setup issue. No project dependency or machine configuration was changed.

No Plans file changed, so shard/index generation was not run and no generated file is delivered. No fresh ordinary index-validation result is claimed; the pinned branch's previously reported main-ahead/legacy-ledger baseline is neither repaired nor reclassified. The four expensive DG removal suites and Part-2 native-source suite were not rerun after this preflight stop; their earlier results are not presented as fresh. No aggregate gate, governance seal, native execution, admission or landing was run. Resource-intensive runs did not overlap in this worker; sampled available memory stayed at least 8 GB and disk began above 500 GB free. No pm-mail, subagent, main push or other worker's edit occurred.

## Retained evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-OWN-C/C3-W34/`. The final report, self-grade, check results and evidence manifest are copied there. Exact retained inputs/results:

| File | SHA-256 |
|---|---|
| `root-preflight.json` | `d79cc46fce12487f1149b56b0457e143553b2c4f01ea938cdc92e95da720b74e` |
| `source-search.json` | `a5ea4044f294c1c5579114d2931110b235c0166ba2eeb8078025c107f4510d54` |
| `main-comparison.json` | `6dcc94c904a9613d0740ad1cdbb6ab2083769ac5320b533b49f2247f6f3a06cd` |
| `root-diagnostic.json` | `6f459780d6f334771fbfc0824d2484f87e4cae7317622f71cb820c2765e5967e` |

**Stopped question for Jared: none.** The exact technical dependency is the separately selected projection-reference successor described above. This handoff makes no COMPLETE or admission claim.
