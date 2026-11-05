# Check 11 adoption — Method B: guard tables

Method B replaces the Python AST rewrite, recompilation, bytecode patch and function/state clone proof. `AstGuards` and `CodeSite` are removed. Old round reports and the old Python cut census describe the retired method; they confer no Method B credit. ATS-003/004 remain the existing oracle/evidence owners. No owner contract, PlanUnit or event-family grade changes here.

## API in five lines

```python
Guard(name, Invariant(field_path, predicate_in_words), refusal_code, predicate)
table = GuardTable(guards); table.require(name, complete_value, context)
factory(value) -> Case(table, original_check, context)  # factory() also works
Suite(name, factory, controls, negatives, checker_modules, repository_root, duplicates=[], non_guards=[])
report = run(suite); markdown(report)  # --adapter file:factory --json report.json --markdown report.md
```

A Python predicate is an original, source-backed `def` function taking `(complete_value, context)`. Return `None` for pass or the row's exact refusal string. Do not raise, return booleans/Outcomes, invoke other guards, repair inputs, or mutate input/context. Every predicate must check the one declared invariant. The checker calls `table.require(name, value, context)` and finishes with exact `True`. It does not translate exceptions or construct refusals. `Outcome.refuse`, `False`, `None`, exit zero and forged `GuardRefusal` objects are untracked results.

Registered predicate entry is checked by its known function/code/global identity and bound receiver. Calls through aliases, raw bound methods, another predicate or the checker fail with `table_protocol_error`. The authorized entries are the table's `require`, schema attribution and the engine's individual matrix evaluation. Calling the internal `_test` from lane code is also refused.

`require` must receive the entire bound value and the exact context object; select fields inside the predicate. This makes the direct predicate matrix and the full boundary use the same arguments. A context of `None` may be omitted. A non-None context must be passed explicitly at each call.

## Restructure a lane checker

1. Extract each independent invariant into a named predicate function. Split an `x_bad or y_bad` refusal into two rows even when both retain the same refusal code. One helper, field group, schema keyword or return statement is not evidence of one invariant.
2. Build a fresh `GuardTable` in the per-case factory. Build all model/trace/Storage state there as well. `factory(value)` can initialize state from the frozen case; it must not change the fixture. Fixed-family `factory()` is supported. Reusing mutable globals, defaults, closure state, objects, table instances or contexts across cases fails freshness checks.
3. Replace inline refusals with `table.require(...)`. Keep the original complete append, retry or retained-history sequence. Put state preparation needed by individually tested predicates in the factory; do not rely on a preceding guard to repair or initialize it. Preserve authenticated at-write recipes and original custody joins.
4. Name the checker module files and repository root. The static scan follows their repository imports transitively, including dormant imports and package initialization. Include any extra modules loaded by existing orchestration explicitly. Dynamic code/imports and star imports fail closed; do not use them to evade the closure.
5. Declare each pure computation or plumbing site that the conservative scan flags with a `NonGuard(path, qualified_function, kind, exact_ast_unparse_source, reason)`. A declaration must match exactly one site; stale, broad or duplicate declarations fail. Review each reason. Product refusals belong in guard predicates.
6. Supply the complete original controls and negatives, labeled with guard names and exact codes. A negative names its control and source defect. Freeze derived copies, hashes, keys and post-state before proof execution. A stale copy is a fixture defect.

Example predicate and checker wiring:

```python
def nonnegative_x(value, context):
    return 'bad_x' if value['x'] < 0 else None

def make_case(value):
    context = {}
    table = GuardTable([Guard('x', Invariant('/x', 'nonnegative'), 'bad_x', nonnegative_x)])
    def check(complete):
        table.require('x', complete, context)
        return True
    return Case(table, check, context)
```

The return of `Case(...)` is a plumbing return: declare its exact source as a non-guard. Pure helper returns, mutation used by an original successful transition, and delegation calls likewise need specific reasons when flagged. A declaration does not allow an untagged runtime rejection: an uncaught plumbing exception still fails the case. A caught plumbing exception is permitted only at a specifically declared exception site. An exception in a guard predicate remains an error.

An exception allowance binds the exact bytecode operation and source span: the assertion's raise, the explicit raise, or the declared refusal-helper call. It does not cover another statement on the same line, evaluation failures in an assertion test/raise payload, or an undeclared new raise of a previously allowed exception. Only verified propagation of the same authorized exception is permitted. Missing instruction positions fail closed.

## Certification boundaries after Method B review round 1

The scanner follows the actual module origins, Python search paths, loaded package paths and package context. Loaded origins must agree with the search result. From-import bindings and package initializers are included. Missing/ambiguous origins, unsupported repository loaders, native repository modules and unresolved bindings fail closed. Importlib, `__import__` and runpy loaders retain that classification through import aliases and assignment aliases, including inside predicate bodies and dormant branches. A non-guard declaration cannot waive these import failures. Supply a source-backed, statically imported seam that can be reviewed and scanned.

Freshness walks reachable class attributes/bases/descriptors and builtin bound-method receivers. Shared classes themselves are mutable state. An opaque/slotted graph, custom access/metaclass graph or external function/class graph that cannot be certified fails with `state_shared_across_cases`; no row earns credit. Construct the supported model/state per case or supply an explicit reviewed seam instead of treating an unknown graph as safe.

Input purity uses a separate diagnostic graph snapshot. It retains dictionary/set iteration order, aliases, cycles, typed scalar bits and object identities, keeping references so detached nodes cannot recycle their IDs. This does not change product number, identity or storage serialization. Exact builtin scalar/container data is supported; subclasses, descriptors and opaque input/context data fail closed. Fixture reconstruction still refuses sets; original context sets are observed without copying them.

Predicate mutation syntax and uncertified calls are static failures, including dormant mutations and calls to mutating helpers. Supported calls are the named pure builtin data operations in `static_scan` and listed read-only methods on certified data expressions; arbitrary helper/native/reflective call effects are not inferred. Inline the supported pure computation or develop a separately reviewed supported seam. A `NonGuard` does not waive predicate purity. Runtime instruction checkpoints also compare the original value/context graph, so temporary mutations and helper writes cannot be hidden by restoring values before return. Factory and schema-selector before/after comparisons use the same order/alias-aware graph witness. These checks supplement review of each predicate's declared invariant.

## Proof and report

Every predicate is evaluated independently on every negative in a fresh case. A negative must fail its own guard and pass every other guard. The only off-diagonal exception is a declared duplicate which must then pass its complete site-by-site proof. Off-diagonal failures are fixture defects or undeclared overlap. Diagonal passes mean the witness does not expose its claimed guard. Predicates also run individually on every control.

The complete checker then runs with all entries enabled, each single entry swapped to always-pass, and fresh uncut restoration. Every cut executes every control and negative. Its own negatives must accept; all other controls and negative guard tags/codes must retain their exact result. Restoration executes the entire case set again. The engine never rewrites or recompiles Python, constructs replacement functions, or copies checker defaults, closures, globals or model state. Only the selected table entry changes. Fixture data is reconstructed separately, preserving dict/list aliases and typed scalar bytes; sets and opaque fixture objects fail closed. Create non-JSON model state in the lane factory.

Runtime refusals must be exception objects issued by the active table, with that guard's name and code. Merely having matching attributes is insufficient. Swallowed table refusals, unknown table names, predicate protocol errors, rejecting returns and untracked exceptions fail the run. A runtime trace also catches handled exceptions in the scanned source and calls into repository source missing from the static closure.

The static census flags raises, assertions, non-success/implicit returns, yields, mutation/error-list writes and potential refusal/delegation calls outside the registered predicate bodies. Predicate identification includes the exact file, definition line and qualified name, so a comprehension target or same-line function cannot waive another function. Nested predicate code and unknown statement forms fail closed. This census grants no cut credit. The adapter's non-guard reasons and predicate bodies remain reviewer obligations.

Any safety, inventory, matrix or proof failure withholds every row's credit. JSON includes guard metadata, source SHA-256 hashes, the full predicate matrix, exact baseline/cut/restoration outcomes, per-site duplicate checks, masks, static sites and non-guard reasons. Markdown summarizes those same rows. Missing witnesses are unproved. Neither a successful constructor nor a suite-level FAIL excuses a broad credited cut.

## Duplicates

Use `Duplicate(id, sites, Invariant(field, predicate), evidence)`. Every site must declare the same field AND predicate AND defect code. Negatives target the duplicate-set ID. Overlapping sets are refused. The engine proves each single-site cut still rejects, each remaining site alone rejects, the joint cut accepts, all peers keep their result, and full restoration succeeds. Matrix cells may share a failure only for that proven set. A declaration, shared code or single witness cannot establish semantic equivalence by itself; review both bodies and the evidence.

## Schemas

The reviewed `SchemaCatalog` inventory and per-keyword/per-predicate cuts are retained. Only its internal metadata class is renamed `SchemaGuard`. Eager reference resolution includes dormant definitions; required/dependency members, occurrence-specific references, type-preserving membership cuts, legacy contains and branch contexts retain their existing logic. Unknown vocabulary, compound negation/applicability, recursive/dynamic/mixed-dialect contexts, patterns/formats and other previously unsupported forms remain unclassified. Method B does not waive them.

Use `schema_table(catalog, selectors, guards=())` in a fresh factory. `selectors` binds every consumed root to a source-backed function `(complete_value, context) -> schema_input`. Name distinct roots for distinct consumer/input occurrences; do not reuse a root to hide two subjects. Call `table.validate(root, complete_value, context)` at the original schema boundary. It invokes the complete original/cut validator; the engine attributes a refusal to an enabled schema row. A refusal with no attributable row fails closed. Actual baseline root consumption is checked, including roots with no active assertions.

Each schema row's individual predicate preserves routing/selector context while cutting the other supported assertions. Full boundary cuts continue to use the original reviewed per-occurrence schema mutations. Both kinds appear in the same predicate matrix and proof report. The predicates and selectors must agree with the complete consumer binding; unsupported interactions cannot earn credit. An unavailable format checker remains a failure, not an implicit format pass.

## DG6B worked example

Run:

```sh
python3 -B scripts/pm_guard_isolation.py --adapter scripts/pm_guard_isolation_dg6b_example.py:factory --json result.json --markdown result.md --max-rss 1536 --pause-when-low 6 --resume-at 6
```

The example ports the seven independent flag predicates from `history_contract` at `ff6d98d8740eff0df68a44f5d4eca0894c4fdf41`. Same-code predicates remain separate named rows. The extracted phase uses a `synthetic` boundary and proves 7/7 guards and 49 matrix cells. `history_case(adapter_check, record_check, storage_check)` shows where the original complete structure, record/custody and historical Storage calls remain.

The reproducible external driver also uses the unchanged complete retained-history fixtures for `plugin.loaded`, `plugin.hook.invoked` and `auth.github.authenticated`. The original complete controls accept; each extracted flag phase proves 7/7. The unported complete original fails the static/freshness checks and receives zero credit. The lane must move its remaining inline refusals into rows, classify pure plumbing and initialize its original mutable state per case before claiming complete adoption. Passing this bounded example is not a family grade.

## Resources and limits

Run one lane/family process at a time. MemoryGate checks finite limits, fresh available-memory samples, peak RSS before/after factories and evaluations, and RSS again on resume. The default CLI poll is 30 seconds. These are sampled limits, not an allocation sandbox. A fresh child process may be needed to avoid inheriting an unrelated high-water RSS mark; never disable the gate to make a run pass.

Freshness checks retain references to prior mutable state to detect reuse without copying it or mistaking recycled IDs for reuse. Memory therefore grows with the evaluated state graphs. Large lanes must partition complete family/boundary suites to stay under the RSS cap. Repository module state is checked; external libraries, native services and stores need independent reset/semantics review.

No finite matrix proves arbitrary Python predicate honesty, complete boundary selection, semantic duplicate equality or a non-guard declaration. Review these explicitly. Dynamic imports, non-source callables, unscannable modules, opaque fixture data and unported checker closures cannot receive automatic proof credit. No current lane/family admission or twelve-criterion grade is granted by this tool task.

## Lane adapters

This table covers all 19 drafting lanes discovered on the fetched `plans/ea-*` branches. Detailed source pins for the seven surveyed proof implementations are in section 1 of `reports/event-authority-20261104/GUARDTOOL.md`. Other lane interface pins are in the external `survey/other-lane-interfaces.json` manifest. These are migration instructions; no lane branch or grade was changed by this task. A prior Astra NOT_READY remains open until independent clearance; the lead's older sweep-item wording grants no waiver.

| Lane | Retain: constructor and complete callback | Supply: target labels | Replace: existing generic proof machinery / open finding |
|---|---|---|---|
| **DG6B** | `pm_dg6b_full_oracles.rebuild`, `family_probes`, `Probe`; run `complete_append_contract` plus its actual retry/recovery path, or the separate complete retained reader | Probe ID, source defect, exact schema occurrence or runtime clause; code/field bindings for synchronized copies | `pm-dg6b-guard-proof.py` inventory, `compiled_module`, `module_for`, `discover`, grouping and `run_family` matrix. C8-B2's overlap/compound removal risk is closed only after adoption passes. C8-B1's stale deletion/CAS fixture remains a lane repair, not a tool fix. The pinned newer source already contains narrower clause/per-site work; do not revert it to the older report's overlap method. |
| **DG** | Existing materialized current/history/stop/lifecycle cases; retain their complete append or successor/read callbacks and original-source joins | Every `Gates` predicate plus every schema assertion, beyond the old type list; exact control/case IDs | `pm_goal_oracle_common.schema_type_inventory`, expanded duplicate sets, keyword removal and `Audit` matrix. C3-F1 missing non-type inventory and C3-F3 whole-member/compound cuts are machinery sweep items. New real guards still require witnesses. |
| **DFM** | `boundary_case`, `negative_case`, `transition_case`; current `validate_case`, original/effect/control paths and `validate_historical_operation` with complete trace | Exact family/case occurrence, original declared predicate or required/dependency member, source-field mapping | External `fix6/guard-audit.py`, `build-rules.py`, predicate/lookup and matrix loops. Preserve DFM's complete-schema controls. Latest pinned report is resource-stopped and retracts final proof credit for the older schema sets; do not inherit the prior sample as a final-head pass. |
| **DS15** | `semantic_input`, `semantic_parent`, `guard_proof_input`; current `evaluate`/`guard_proof_result`, migration and actual retained-reader paths | Each authored instance, source field, named guard predicate and exact code; classify direct helper delegations with source evidence | `pm-ds15-guard-audit.py` mutation inventory, `Replace`, model/caching and loop. The 5,576 unexposed constructions remain unproved until covered or genuinely classified. The tool will report them; adopting it alone supplies no missing negatives. |
| **DCH** | `corpus`, `changed` and coherent fixture construction; actual `pm_dch_events` append, retry, transport/materialization and retained-history paths | Surface plus unique case occurrence, primitive `_guard` field/predicate and full-root schema site; retain actual format parsers | `Proof` inventory/instrumentation/aliases, `normalize`/`aliases` schema removal, duplicate/matrix/restoration loops. Payload-only shape cases must be wrapped in coherent complete-path controls before receiving append proof credit. |
| **DX** | Existing `type_case_specimens`, capture/source/dependency fixtures; `validate_capture` with its full custody/dependencies, `run_trace`, `validate_retry` and `validate_history` routes | Family/suite/case occurrence; each `require` condition leaf and source field, not one helper-wide code; trace identity | External matrix loader/instrumenter, duplicate groups, matrix-result caches and matrix runner. Original-start custody and every previously repaired trace control remain live. Schema-only prerequisites are supplementary until wrapped into the full boundary. |
| **DO** | External `sync_source`, `sync_read`, coherent positive/negative bank; actual `event_errors`, `checkpoint_errors`, `historical_read_errors`, `recover_original` plus applicable owner joins | Domain/family/unique occurrence; each individual error-append predicate, schema atom and original input fact | External `guard_audit.py` caches, `Remove`, `RemoveRetry`, `mutated`, `group_for`, grouping and matrix; `normalize_guard_table.py` complement reconstruction. Keep construction and dispatch; migrate detached shape domains to complete controls before granting boundary credit. |
| **DS** | `pm_ds_guard_cases.capture`, static contexts, DS round-2/3 builders and `pm_home_layout_v2_slot_receipt.Checker`; original Browser creation/reset/checkpoint model routes | Family/edition/scenario occurrence; exact returned failure predicate and schema/member, not aggregate Browser status | `pm_ds_guard_removal.guards/weaken/cohort/audit` and targeted matrix loops. Missing real controls/negatives and all product failures remain lane work. |
| **DC** | Collaboration `contract_probes`, round-two/wrapper cases and integrity cases; complete `evaluate_probe` / `evaluate_integrity` original lifecycle/custody routes | Exact event family, original required slot and case occurrence; independent schema and integrity predicates | `integrity_guard_removal_report`, `schema_guard_removal_report`, `guard_removal_report` generic inventory/removal/matrix. Never replace owner-derived required slots with caller-supplied success criteria. |
| **DCW** | `pm_dcw_event_fixtures` event/source/receipt construction and index fixtures; `pm_dcw_event_oracles.verify` with opened-source custody, original storage and reader path | `Probe` occurrence, exact source slot/field, index predicate and required member | `pm_dcw_event_isolation.guard_inventory`, `schema_leaves`, `supplement`, `audit`, `merge_reports`. Preserve full original/retry/history guards; fix stale copies in fixtures before attempting isolation. |
| **DCO** | `fixture_report`, wave-2 cases and `CoordinationStore` append/project/checkpoint/read transaction sequence | Family/fixture/phase; each producer, transition and checkpoint invariant | Lane/external guard-removal loops. Adapt `pm_coordination_wave2` and base coordination dispatch; a standalone `checkpoint_failures` call is not full append proof. |
| **DDBG** | `patched_case` controls; complete debug candidate/envelope/writer/semantic/identity checks dispatched by `pm-debug-investigation-events.py` and retained originals | Family/case, exact `candidate_refusal`/`refusal` predicate and its input field | Lane/external removal table loops. Keep ordinary checker dispatch and standing checks; shared refusal strings do not establish duplicates. |
| **DF** | `ProtocolOracle`, source/materialization context and existing `Probe` construction; complete authority `check` and original/history reads | Family/phase/case; exact guard predicate, source commitment field and schema/member | `pm_filesafe_guard_isolation.Mutants`, `CachedValidator`, `locations`, `Suite` and `_matrix_guard` loops. No constructor may conceal an unrelated custody or history refusal. |
| **DG6A** | `fixture_cases`, `vectors`, complete producer/protocol/checkpoint routes and `historical_alert_page` / `historical_panel_page` / `historical_concern_page` | Exact module/function/clause, family/domain/case; bind stored times and source observations explicitly | `rejection_mutants`, `install/restore`, `duplicate_proofs`, history/checkpoint matrix loops in `pm-dg6a-guard-check.py`. Keep current format/domain parsers and full history source joins. |
| **DMEM** | Archive candidates/transitions, `append_current`, original `start_custody_gate`, maintenance `matrix_call` and canonical-history/read recipe cases | Family/phase/unique case, each start/cutoff/slot guard and schema/member; written recipe identity | `pm_memory_guard_isolation` mutation classes, `prove_matrix/prove_semantics/prove_complete` loops. Guard removal never substitutes an always-valid schema, format checker or whole structural bypass. |
| **DR** | `pm_runtime_artifact_guard_cases` and round-6/7 constructions; `AppendModel`, original storage validation and `resolve_history` | Family/boundary/case occurrence, original receipt/envelope field and exact predicate | `pm-runtime-artifact-guard-isolation.py` `replace/condition/expr/block/evaluate` mutation/matrix. Keep lawful history positives separate from current-writer gates. |
| **DM** | `boundary_state`, upstream/timestamp states, current retry, original resolution, `retained_event_valid` / `reader_result` and publication rebuild | Family/scenario/occurrence; exact caller versus Storage field, schema atom, written recipe | `pm-small-owner-guard-audit.py` catalogue/container/invoke/matrix machinery. Preserve verified Storage metadata and recipe selection; formats without enforcement stay an explicit sweep gap. |
| **DT** | `source_corpus`, checkpoint/other/boundary constructors and `round6_corpus`; full append/source-stage/recovery/historical paths in `pm-dt-event-contracts.py` | Family/phase/case, exact predicate field and source copy; schema required members independently | `function_mutants`, `replace_function`, `schema_table`, `prove_family/prove` and reference-guard matrix loops. Keep original source custody, history and physical-size guards; no local number-domain policy. |
| **DCN** | `pm_card2_events.mutate` and coherent application/source/evidence fixtures; `_run` dispatch through envelope, payload, transition, token and evidence custody | Exact family/case occurrence, individual claim/fact/evidence field and schema/member | Lane/external check-11 grouping and removal loops. Preserve original verified-evidence and retained-history behavior. |
