# Check 11 adoption — Method B: guard tables

Method B replaces the Python AST rewrite, recompilation, bytecode patch and function/state clone proof. `AstGuards` and `CodeSite` are removed. Old round reports and the old Python cut census describe the retired method; they confer no Method B credit. ATS-003/004 remain the existing oracle/evidence owners. No owner contract, PlanUnit or event-family grade changes here.

## API in five lines

```python
Guard(name, Invariant(field_path, predicate_in_words), refusal_code, predicate)
table = GuardTable(guards); table.require(name, complete_value, context)
factory(value) -> Case(table, original_check, context)  # factory() also works
Suite(name, factory, controls, negatives, checker_modules, repository_root, duplicates=[], non_guards=[], reset=None, reset_seams=[])
report = run(suite); markdown(report)  # --adapter file:factory --json report.json --markdown report.md
```

A Python predicate is an original, source-backed `def` function taking `(complete_value, context)`. Return `None` for pass or the row's exact refusal string. Do not raise, return booleans/Outcomes, invoke other guards, repair inputs, or mutate input/context. Every predicate must check the one declared invariant. The checker calls `table.require(name, value, context)` and finishes with exact `True`. It does not translate exceptions or construct refusals. `Outcome.refuse`, `False`, `None`, exit zero and forged `GuardRefusal` objects are untracked results.

Registered predicate entry is checked by its known function/code/global identity and bound receiver. Calls through aliases, raw bound methods, another predicate or the checker fail with `table_protocol_error`. The authorized entries are the table's `require`, schema attribution and the engine's individual matrix evaluation. Calling the internal `_test` from lane code is also refused.

`require` must receive the entire bound value and the exact context object; select fields inside the predicate. This makes the direct predicate matrix and the full boundary use the same arguments. A context of `None` may be omitted. A non-None context must be passed explicitly at each call.

## Restructure a lane checker

1. Extract each independent invariant into a named predicate function. Split an `x_bad or y_bad` refusal into two rows even when both retain the same refusal code. One helper, field group, schema keyword or return statement is not evidence of one invariant.
2. Build a fresh `GuardTable` in the per-case factory. Build all model/trace/Storage state there as well. `factory(value)` can initialize state from the frozen case; it must not change the fixture. Fixed-family `factory()` is supported. Shared per-case contexts, defaults, closure state, objects and tables fail identity checks. Adapter/factory module state is fingerprinted before construction and each run, including scalar bindings; any difference fails. Independently built case graphs for the same input must also agree in value, order and alias structure.
3. Replace inline refusals with `table.require(...)`. Keep the original complete append, retry or retained-history sequence. Put state preparation needed by individually tested predicates in the factory; do not rely on a preceding guard to repair or initialize it. Preserve authenticated at-write recipes and original custody joins.
4. Name the checker module files and repository root. The static scan follows their repository imports transitively, including dormant imports and package initialization. Include any extra modules loaded by existing orchestration explicitly. Dynamic code/imports and star imports fail closed; do not use them to evade the closure.
5. Declare each pure computation or plumbing site that the conservative scan flags with a `NonGuard(path, qualified_function, kind, exact_ast_unparse_source, reason)`. A declaration must match exactly one site; stale, broad or duplicate declarations fail. Review each reason. Product refusals belong in guard predicates.
6. Supply the complete original controls and negatives, labeled with guard names and exact codes. A negative names its control and source defect. Freeze derived copies, hashes, keys and post-state before proof execution. A stale copy is a fixture defect.

Example predicate and checker wiring:

```python
import pm_guard_isolation as g

def nonnegative_x(value, context):
    return 'bad_x' if value['x'] < 0 else None

def make_case(value):
    context = {}
    table = g.GuardTable([g.Guard('x', g.Invariant('/x', 'nonnegative'), 'bad_x', nonnegative_x)])
    def check(complete):
        table.require('x', complete, context)
        return True
    return g.Case(table, check, context)
```

Keep this shape: the engine imported as `g`, `table` bound once in the factory, and each `table.require` directly in the function passed to `g.Case`. The automatic forms below are proven only for that shape. Any other shape is still valid but needs a `call_review` declaration for the reasoning the scan cannot do, including `table.require` in a helper and every `table.validate`.

The return of `g.Case(...)` is a plumbing return: declare its exact source as a non-guard. Pure helper returns, mutation used by an original successful transition, and delegation calls likewise need specific reasons when flagged. A declaration does not allow an untagged runtime rejection: an uncaught plumbing exception still fails the case. A caught plumbing exception is permitted only at a specifically declared exception site. An exception in a guard predicate remains an error.

An exception allowance binds the exact bytecode operation and source span: the assertion's raise, the explicit raise, or the declared refusal-helper call. It does not cover another statement on the same line, evaluation failures in an assertion test/raise payload, or an undeclared new raise of a previously allowed exception. Only verified propagation of the same authorized exception is permitted. Missing instruction positions fail closed.

## Certification boundaries after Method B review round 2

The scanner follows the actual module origins, Python search paths, loaded package paths and package context. Loaded origins must agree with the search result. From-import bindings and package initializers are included. Missing/ambiguous origins, unsupported repository loaders, native repository modules and unresolved bindings fail closed. Importlib, `__import__` and runpy loaders retain that classification through import aliases and assignment aliases, including inside predicate bodies and dormant branches. A non-guard declaration cannot waive these import failures. Supply a source-backed, statically imported seam that can be reviewed and scanned.

Freshness fingerprints the factory and adapter module namespaces, closure cells of every reached function, defaults and class attributes. A closure certification error propagates; only reading an actually empty cell is ignored. Shared classes themselves are mutable state. The original per-case identity check remains as an additional defense. An opaque/slotted graph, custom access/metaclass graph or external function/class graph that cannot be certified fails with `state_shared_across_cases`; no row earns credit. Construct the supported model/state per case or supply an explicit reviewed seam instead of treating an unknown graph as safe.

Input purity uses a separate diagnostic graph snapshot. It retains dictionary/set iteration order, aliases, cycles, typed scalar bits and object identities, keeping references so detached nodes cannot recycle their IDs. This does not change product number, identity or storage serialization. Exact builtin scalar/container data is supported; subclasses, descriptors and opaque input/context data fail closed. Fixture reconstruction still refuses sets; original context sets are observed without copying them.

Predicate mutation syntax and uncertified calls are static failures, including dormant mutations and calls to mutating helpers. Supported calls are the named pure builtin data operations in `static_scan` (with their actual builtin bindings verified) and listed read-only methods on certified data expressions; arbitrary helper/native/reflective call effects are not inferred. Inline the supported pure computation or develop a separately reviewed supported seam. A `NonGuard` does not waive predicate purity. Runtime instruction checkpoints also compare the original value/context graph, so temporary mutations and helper writes cannot be hidden by restoring values before return. Factory and schema-selector before/after comparisons use the same order/alias-aware graph witness. These checks supplement review of each predicate's declared invariant.

## Proof and report

Every predicate is evaluated independently on every negative in a fresh case. A negative must fail its own guard and pass every other guard. The only off-diagonal exception is a declared duplicate which must then pass its complete site-by-site proof. Off-diagonal failures are fixture defects or undeclared overlap. Diagonal passes mean the witness does not expose its claimed guard. Predicates also run individually on every control.

The complete checker then runs with all entries enabled, each single entry swapped to always-pass, and fresh uncut restoration. Every cut executes every control and negative. Its own negatives must accept; all other controls and negative guard tags/codes must retain their exact result. Restoration executes the entire case set again. The engine never rewrites or recompiles Python, constructs replacement functions, or copies checker defaults, closures, globals or model state. Only the selected table entry changes. Fixture data is reconstructed separately, preserving dict/list aliases and typed scalar bytes; sets and opaque fixture objects fail closed. Create non-JSON model state in the lane factory.

Runtime refusals must be exception objects issued by the active table, with that guard's name and code. Merely having matching attributes is insufficient. Swallowed table refusals, unknown table names, predicate protocol errors, rejecting returns and untracked exceptions fail the run. A runtime trace also catches handled exceptions in the scanned source and calls into repository source missing from the static closure.

The static allowlist requires obligations for conversions, subscripts/lookups, unpacking, data attribute access, potentially raising comparisons, iteration, unproven bindings and calls, in addition to raises, assertions, non-success/implicit returns, yields and mutation/error-list writes outside predicate bodies. Only the forms in the allowlist audit below are automatic; each has a written reason. Static literal table names must exist in the inventory; dynamic names are refused even on dormant paths. Each other operation needs an exact reviewed plumbing declaration; finite fixture agreement does not exempt it. Predicate identification includes the exact file, definition line and qualified name, so a comprehension target or same-line function cannot waive another function. Nested predicate code and unknown statement forms fail closed. This census grants no cut credit. The adapter's non-guard reasons and predicate bodies remain reviewer obligations.

Any safety, inventory, matrix or proof failure withholds every row's credit. JSON includes guard metadata, source SHA-256 hashes, the full predicate matrix, exact baseline/cut/restoration outcomes, per-site duplicate checks, masks, static sites and non-guard reasons. Markdown summarizes those same rows. Missing witnesses are unproved. Neither a successful constructor nor a suite-level FAIL excuses a broad credited cut.

Case certification is one graph. Each build of a case is fingerprinted together with the anchored shared state: the input, the factory, reset and checker modules with their namespaces, then the context, checker closure and table. Numeric addresses are erased, because a fresh object has no stable address, but every identity edge stays. A case value that is the stable shared object is an edge to that node; an equal value that is not the shared object is a separate node. Function global namespaces are nodes too. The input plus the shared state groups builds of the same input, and every later build must match the first. A change fails `factory_nondeterministic` with zero credit. A function whose globals bring in state that cannot be certified fails closed with `state_shared_across_cases`, and once shared state has failed, credit is already withheld and these relations are not compared. To use this, name every module whose state a case depends on in `checker_modules`.

## Outside-predicate allowlist audit

Every operation outside a guard predicate is either in this table or an obligation. An obligation needs a table predicate or an exact reviewed `NonGuard`. The table is `TOTAL_FORMS` in the tool: `static_scan` classifies each syntax node through an explicit allowlist, so a form with no entry here, including syntax added by a later Python, is an obligation by default. Each report's `static.automatic_totals` lists the forms that scan used, with counts and these reasons. Resource exhaustion, interpreter interruption and warnings promoted to errors are outside every argument.

### Automatic forms and why they cannot raise

| Form | Why it cannot raise at this boundary |
|---|---|
| `statement:control-transfer` | pass, break and continue only move the program counter. |
| `statement:expression` | An expression statement discards a value; the expression is classified on its own. |
| `statement:try` | Entering try runs no code and each handler is classified on its own; except* is excluded. |
| `statement:except-builtin` | A bare except or unshadowed canonical builtin exception classes: matching is a subclass check with no user hook. |
| `statement:return-true` | Returns the literal True, the engine success value. |
| `statement:executed-module-import` | Module scope of a loaded module: the import already ran, its live binding is verified and no case runs it again. |
| `definition:function` | def and lambda only build a function object; defaults, annotations and decorators are classified on their own in the enclosing scope. |
| `binding:name` | Binding a plain name to a computed value runs no hook; unpacking, attribute and subscript targets and any __builtins__ binding are excluded. |
| `control:literal-test` | if or a conditional expression on a builtin literal: literal truthiness has no failure path. |
| `expression:literal` | Loading a compile-time constant cannot raise. |
| `expression:bound-name` | The name resolves by the language scope rules (class namespaces do not enclose nested functions or comprehensions) and a binding of that scope dominates the read: parameter, earlier sibling statement, loop or comprehension target, its own handler target, or the certified module or builtin namespace. Deleted names, handler targets outside their own handler body, private names under a class and type-parameter scopes are excluded, and the compiler symbol table must agree where it has a table for the scope. |
| `expression:identity-compare` | is and is not compare identities with no user hook; every other comparison is an obligation. |
| `unary:not-literal` | not on a builtin literal (None, bool, int, float, complex, str, bytes, Ellipsis): literal truthiness has no failure path. |
| `unary:sign-numeric-literal` | Unary + or - on an exact int or float literal is defined for every value. |
| `unary:invert-int-literal` | ~ on an exact int literal is defined for every value. |
| `display:sequence` | A list or tuple display stores already computed values; star items are excluded. |
| `display:dict-literal-keys` | A dict display whose keys are builtin literals, which always hash; ** and mixed str and bytes keys are excluded. |
| `display:set-literal-items` | A set display whose items are builtin literals, which always hash; mixed str and bytes items are excluded. |
| `display:comprehension-shell` | A list comprehension or generator shell only collects or wraps results; each for clause is its own obligation. |
| `display:covered-by-parent` | An f-string field or a slice exists only under a JoinedStr or Subscript, which is itself an obligation. |
| `attribute:function-code` | Reading __code__ on an unshadowed module-level Python function reads a fixed function slot. |
| `attribute:code-bytes` | Reading co_code on that code object is defined for every code object. |
| `attribute:engine-callee` | A callee read on the verified, unshadowed engine alias for a name present in the engine namespace. |
| `attribute:table-callee` | require or validate read on the factory single fresh engine table; both are GuardTable methods. |
| `call:type-one-argument` | Unshadowed canonical one-argument type(x) reads the object type with no user hook; star arguments are excluded. |
| `call:bool-literal` | Unshadowed canonical bool on a builtin literal: literal truthiness has no failure path. |
| `call:table.require` | Receiver is the factory single fresh table, the name is a literal inventory row, the value is the Case checker unrebound root parameter and the context is the Case context: the only remaining exits are the tagged refusal and errors inside the table row. |
| `constructor:Invariant` | __post_init__ raises only on a non-string or blank field; both arguments must be literal nonblank strings. |
| `constructor:Guard` | __post_init__ only strips name and code and tests callable; name and code must be literal nonblank strings and the predicate an unshadowed module-level callable. |
| `constructor:GuardTable` | __init__ raises only on a non-Guard row or a repeated name; the argument must be a literal sequence of total g.Guard calls with distinct literal names. |
| `constructor:Case` | Dataclass with no __post_init__, __new__ or validating descriptor: argument binding, which is checked, is its whole boundary. |
| `constructor:Suite` | Dataclass with no __post_init__, __new__ or validating descriptor; its only default factories are list: argument binding, which is checked, is its whole boundary. |
| `constructor:Control` | Frozen dataclass with no __post_init__, __new__ or validating descriptor: argument binding, which is checked, is its whole boundary. |
| `constructor:Negative` | Frozen dataclass with no __post_init__, __new__ or validating descriptor: argument binding, which is checked, is its whole boundary. |
| `constructor:NonGuard` | Frozen dataclass with no __post_init__, __new__ or validating descriptor: argument binding, which is checked, is its whole boundary. |
| `constructor:Duplicate` | Frozen dataclass with no __post_init__, __new__ or validating descriptor: argument binding, which is checked, is its whole boundary. |

Syntax nodes with no operation of their own (operators, argument lists, aliases, contexts) are not listed. Raises, assertions, deletions, augmented assignments, `yield`, `global`, `nonlocal` and other calls are explicit sites, never automatic.

### Constructor and call hook audit

The trap `C4-constructor-hook-audit` fails if any of these changes, so a new hook cannot arrive without revisiting its argument.

| Constructor | Validation hooks | Descriptors | Argument boundary |
|---|---|---|---|
| `Invariant` | `__post_init__` raises on a non-string or blank field | None | Both arguments are literal nonblank strings |
| `Guard` | `__post_init__` strips name and code and tests `callable` | Read-only `id` property, not read during construction | Name and code are literal nonblank strings; predicate is an unshadowed module-level callable |
| `GuardTable` | `__init__` raises on a non-`Guard` row or a repeated name | Read-only `guards` property, not read during construction | A literal list or tuple of total `g.Guard` calls with distinct literal names |
| `Case`, `Suite` | None | None | Argument binding only; `Suite` defaults are `list` factories |
| `Control`, `Negative`, `NonGuard`, `Duplicate` | None; frozen dataclass `__setattr__` is not reached by `__init__` | None | Argument binding only |

### Now an obligation

These were automatic at `dec0a57dce`, and each named trap was a credited PASS there. Where the operation can raise, its trap also runs the unchanged original on a held-out input to prove it. Entries marked removed needed no argument because nothing uses them.

| Form | Why it is not total | Trap |
|---|---|---|
| `g.Invariant` with a non-literal, blank or non-string argument | `__post_init__` raises `IsolationError` | `C4-hidden-invariant-constructor`, `C4-blank-invariant-literal`, `C4-nonstring-invariant-literal`, `C4-invariant-name-argument` |
| `g.Guard` whose predicate name is rebound locally | `__post_init__` raises when the local value is not callable | `C4-guard-shadowed-predicate` |
| Unary operators outside the three certified pairs, including `-'x'`, `~1.5`, `+None`, `-b'x'`, `-True` and `-1j` | Most raise `TypeError`; the rest have no written argument | `C4-hidden-unary-string`, `C4-hidden-float-invert`, `C4-hidden-none-plus`, `C4-hidden-bytes-minus`, `C4-uncertified-unary-forms` |
| `table.require` with a foreign value or context, in a helper, or on a rebound receiver | Protocol `IsolationError` or `AttributeError`; a runtime check cannot see a dormant call | `C4-table-foreign-value`, `C4-table-foreign-context`, `C4-table-rebound-receiver` |
| `table.validate`, always | Raises on a missing schema, an undeclared root or an unattributable refusal, and runs the selector and validator | `C4-table-validate-without-schema` |
| Engine callee read for an absent name or a rebound `g` | `AttributeError` | `C4-engine-missing-member`, `C4-engine-alias-shadowed` |
| Function-scope imports, and module-scope imports in a module that is not loaded | They execute module code on the visited path | `C4-function-scope-import` |
| Reads of a default's or annotation's own parameter name | Defaults and annotations run in the enclosing scope | `C4-default-argument-name` |
| Reads of a name made local by a nested `def`, import, handler or match capture | `UnboundLocalError`, even when a module binding of that name exists | `C4-read-before-nested-def`, `C4-read-before-local-import` |
| Reads of a deleted name, or a handler target outside its handler | `UnboundLocalError`; a handler target is deleted when the handler ends | `C4-deleted-name`, `C4-handler-name-implicit-delete` |
| Any binding of `__builtins__`, and reads of a builtin the module's own builtins lack | `NameError` in functions defined after the rebinding | `C4-private-builtins-binding` |
| `except` naming a rebound builtin exception | Matching raises `TypeError` | `C4-shadowed-exception-class` |
| `except*` | Matching has its own runtime failures | `C4-except-star` |
| `type(*x)` | A star can select another `type` form or arity | `C4-star-type-argument` |
| Dict or set displays mixing `str` and `bytes` literals | Equal-hash items compare during construction, which `-bb` makes an error | `C4-mixed-text-dict-keys` |
| `__code__` on a rebound name | The local value need not be a function | Removed from the automatic path; covered by the same local-binding rule |
| `type` alias statements and generic parameters on `def` | No lane needs them and no argument was written | Removed; covered by the default for unlisted forms |

### Name-read scope audit

`expression:bound-name` follows Python's scope rules (language reference 4.2.2), with `symtable` as a second opinion: wherever the compiler has a table for the scope and disagrees, the read is an obligation. List, set and dict comprehensions have no table of their own from Python 3.12, so the resolver alone decides them. A read is automatic only when it resolves to a scope and a binding of that scope dominates it. These forms were automatic at `07fefa83bd`; each trap holds out the original raising, except the lazy forms and the annotation below, which do not raise on that path and are obligations because they have no written argument.

| Read | Python's rule | Now | Trap |
|---|---|---|---|
| Method, nested `def`, lambda, comprehension result or condition, later iterable, or generator, with a class binding of that name | A class namespace does not enclose them | Resolves past the class; an obligation unless a function, global or builtin binding exists | `C6-class-binding-is-not-method-binding`, `C6-class-binding-nested-def`, `C6-class-binding-lambda`, `C6-class-binding-list-comprehension-result`, `C6-class-binding-comprehension-condition`, `C6-class-binding-second-iterable`, `C6-class-binding-generator-result` |
| A nested class body, with the outer class binding | Class namespaces do not nest | Obligation | `C6-outer-class-binding-in-nested-class` |
| A class body read or method default of a name the class binds later | `LOAD_NAME` goes to globals and builtins, never the enclosing function | Obligation unless a module or builtin binding exists | `C6-class-read-skips-enclosing-function`, `C6-class-default-before-class-binding` |
| A comprehension iterable or condition reading a later target of the same comprehension | The target makes the name comprehension-local | Obligation, whatever the enclosing function binds | `C6-comprehension-later-target-iterable`, `C6-comprehension-later-target-condition` |
| A read under `global` | Skips every enclosing function | Needs a module or builtin binding | `C6-global-skips-enclosing-function`, `C6-class-global-skips-enclosing-function` |
| A closure read of a handler target | The target is deleted when the handler ends, so the closure can outlive it | Obligation | `C6-handler-target-in-closure` |
| A read after a nested handler with the same target, or a loop target a handler in the loop reuses | That handler deletes it | Obligation | `C6-nested-handler-deletes-target`, `C6-handler-deletes-loop-target` |
| A `__private` name under a class | The compiler mangles it, so the module binding is a different name | Obligation | `C6-private-name-in-method`, `C6-private-name-in-class-body` |
| A generic method | The type-parameter scope is function-like and the class stays excluded | Obligation | `C6-type-params-keep-class-exclusion` |
| A type-parameter bound, or a type alias value (lazy) | A lazily evaluated annotation scope, with no written argument | Obligation, even with an enclosing binding | `C6-type-bound-read-is-an-obligation`, `C6-type-alias-read-is-an-obligation` |
| An annotation | Evaluation is deferred or absent, depending on version and future import | Automatic only for a module or builtin binding no scope in the file rebinds | `C6-annotation-local-name-is-an-obligation`, with `C6-annotation-builtin-control` |

These stay automatic, each with a paired control: a genuine enclosing-function binding read through a class or a generic definition; a module binding read past a class attribute; a class-body read after a class binding; a first iterable or method default, both of which run in the class scope; a comprehension result reading its own target; `nonlocal` and `global` with a real dominating binding; a read in a handler's own body. A type-parameter read (`C6-type-parameter-read-is-an-obligation`) is valid Python but has no written argument, so it is an obligation.

The other automatic name uses do not resolve scopes: `type`, `bool`, the `except` classes, `g`, `table`, `__code__` and `Guard` predicates each refuse any rebinding anywhere in the file and verify the live binding, so class and comprehension bindings already make them obligations. Predicate bodies stay outside this scan, as before.

### Already obligations, confirmed

The audit found these forms correct and left them unchanged: subscripts of literals (`(1,)[5]`), comparisons other than `is` and `is not`, including of literals (`1 < 'a'`), every f-string (`f'{1:zz}'`), binary and boolean operators on literals, and truth tests of non-literals (`if`, `while`, `not x` and conditional expressions). So are iteration and comprehension `for` clauses, `with`, `match`, classes, `await`, star items, `**`, and displays with non-literal keys.

`len`, `isinstance`, `int` and every other builtin are `call_review` outside predicates. The pure builtin and method lists apply only inside a predicate body, because an exception there stays inside the table row and fails the run; they grant nothing outside it. `C4-literal-*` keeps one dormant regression for each of these.

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

Freshness checks retain references to prior mutable state to detect reuse without copying it or mistaking recycled IDs for reuse. Memory therefore grows with the evaluated state graphs. Large lanes must partition complete family/boundary suites to stay under the RSS cap. All adapter/factory-owned module state is checked. External functions, objects/modules and opaque/native graphs outside the small immutable builtin/engine metadata boundary fail certification; a review note alone cannot waive them. External service semantics still need independent review and a supported source-backed seam.

Identity certification compares builds; it cannot predict them. A factory that branches on an address passes only in a run where every build happened to agree, and a checker branch on an address changes no graph at all. A reviewer must reject a `call_review` declaration for `id()` whose result can reach a case value or a branch.

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

## Standalone use and reset seams

Installation files, supported Python/platform boundary, dependencies, generic CLI,
self-test and `--scratch` are in [the standalone README](../../scripts/guard-isolation/README.md).
The OS temporary directory is the default; an adjacent trap JSON permits a flat
three-file distribution with no PuppetMaster checkout or mount.

`Suite.reset` and exact `Suite.reset_seams` declarations (kind
`shared_state_write`) are required for global/nonlocal statements and shared
writes. Ordinary `NonGuard` declarations cannot exempt those effects. The reset
function itself is scanned. After resetting, the first-run namespace fingerprint
must match, including object identities. Unknown state remains refused even
when a reset is declared. The corpus includes both an effective diagnostic
scalar reset and a reset that leaves the binding changed.

Every evaluation builds its case twice independently. Table rows, context,
inputs, checker closure state, original predicate metadata and every identity
edge to anchored shared state must agree with the first construction for that
input; cuts and restorations repeat the same comparison. Fresh identities alone
do not establish deterministic state. Shared
fingerprints also run before factories and after original execution, with any
reviewed reset applied first. Certification failures retain census/baseline
diagnostics but withhold every row and duplicate credit.
