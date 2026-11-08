# Guard isolation tool

Method B proves a named guard by swapping its table row, running the complete
checker and its peers, then restoring the row. It does not rewrite checker code.
See the adoption guide for the adapter contract and review obligations.

## Standalone installation

Copy these three files into one directory on the target project:

- `scripts/pm_guard_isolation.py`
- `scripts/pm_guard_isolation_traps.py`
- `Plans/guard_isolation_traps.json` (beside the Python files)

Also copy this README and, optionally, `pm_guard_isolation_dg6b_example.py` and
`reports/event-authority-20261105/GUARDTOOL-ADOPTION.md`. Repository-layout use
continues to find the corpus under `Plans/`; an adjacent corpus takes priority.
No share, source checkout, Git repository or program mount is needed to run it.

The supported interpreter contract is **CPython 3.11–3.14 on Linux or macOS**:
the trace uses CPython instruction positions, and RSS uses POSIX `resource`.
This change is exercised on CPython 3.14.4/Linux; other listed combinations
need their own self-test before adoption. Windows and PyPy are unsupported.
Available-memory polling (`--pause-when-low`) requires Linux `/proc/meminfo`;
the default is off. macOS callers may supply `MemoryGate(available=...)` when
using the Python API. Do not claim memory polling passed on another platform.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install 'jsonschema>=4.19,<5' 'referencing>=0.30,<1'
.venv/bin/python tools/pm_guard_isolation.py --self-test --json self-test.json
```

The exercised dependency versions are jsonschema 4.19.2 and referencing 0.36.2.
Install the files in `tools/` for the commands above/below, or substitute their
actual location. Keep that directory on the adapter's Python import path.

## Commands and results

```sh
PYTHONPATH=tools .venv/bin/python tools/pm_guard_isolation.py \
  --adapter checks/adapter.py:factory --json isolation.json --markdown isolation.md
.venv/bin/python tools/pm_guard_isolation.py \
  --self-test --scratch ./scratch --json self-test.json
```

`factory` in the adapter returns a `Suite`; its per-case factory returns a
fresh `Case`. CLI exit 0 means PASS; exit 1 means FAIL; malformed arguments use
argparse exit 2. `--help` lists resource and output options. JSON is printed to
stdout when `--json` is omitted. `--scratch` is an optional self-test scratch
parent. By default the OS temporary directory is used, respecting `TMPDIR`.
Temporary modules are removed on completion. A project may pass its own
evidence directory explicitly; the tool has no hard-coded evidence location.

## Certification and reset seams

Before construction and every baseline, matrix, cut and restoration run, the
engine fingerprints the adapter/factory namespace, closures, classes, defaults
and reachable module state. It compares binding values, aliases, order and
identities with the first snapshot. It also certifies each independently
constructed case together with that shared state as one graph, for the same input.
Addresses are erased, identity edges are not: a case value that is the stable
shared object differs from an equal value that is not, and only fresh identities
are treated as interchangeable. Name every module a case depends on in
`checker_modules`; state a case brings in that cannot be certified fails closed.

Global/nonlocal statements and writes through shared bindings need entries in
`Suite.reset_seams`, each an exact `NonGuard` of kind `shared_state_write`, and
a source-backed `Suite.reset` callable. The engine calls that reset before
construction/evaluation and checks the snapshot again. Ordinary `non_guards`
cannot waive these writes. Reset code itself is scanned and its shared writes
also need exact reset-seam entries. A reset that replaces identity-bearing
shared containers or leaves a changed binding fails the snapshot.

Only the supported builtin scalar/container graph, source-backed local code
and explicit engine metadata can be certified. Slotted/opaque/custom-access
objects, external functions/objects/modules and unknown native objects fail
closed, including through closures. Reset declarations do not waive an
unsupported graph. Input/context mutation and predicate-call provenance remain
independent checks. No safety failure can retain a credited row.
Function metadata and immutable code include constants, argument/operand tables
and cell aliases. Lazy function annotations are refused without evaluation;
materialize reviewed builtin-only annotations before running the suite.

Every repository module the static scan covers must be named in
`checker_modules`, or the run fails `scanned_module_not_declared`: only named
modules have their state watched.

Each cut row is also checked by guard-call trace. The baseline and the row's
restoration (two uncut runs) must call the same guards in the same order; a cut
run must repeat the baseline trace up to and including the refusing cut guard,
and otherwise match it whole. A divergence fails `noncausal_flip` (an own
negative) or `guard_trace_changed` (any other case) with zero credit. Traces are
in the JSON report.

Outside predicates, every operation needs a written reason it cannot raise or an
exact reviewed `NonGuard` declaration. Name reads resolve by Python's scope rules:
a class namespace does not enclose nested functions or comprehensions, so a read
needs a dominating function, global or builtin binding, or it is an obligation.
A read of a module binding is automatic only when the file binds the name once,
by a top-level unconditional assignment, `def`, `class` or import before the
statement holding the read; the live namespace at scan time certifies nothing.
Name operations in a class body are automatic only in a class with no bases,
keywords, decorators or type parameters, because any other class body runs in
its metaclass's mapping. Any read of `eval`, `exec`, `__builtins__` and the other
dynamic-code names is an error a declaration cannot waive. `TOTAL_FORMS` in the tool lists the automatic
forms with their reasons, and the adoption guide's allowlist audit records each
entry and each form that became an obligation. A form with no entry, including new
syntax, is an obligation by default. Each report's `static.automatic_totals` shows
which forms that scan used. Literal table names must exist; dynamic table names fail.
Import the engine as `g` and call `table.require` directly in the function passed
to `g.Case`; other shapes work but need a `call_review` declaration, as does every
`table.validate`. A declaration
grants no permission to translate an untracked runtime exception into a guard.
The static scan and baselines still run for useful diagnostics after a snapshot
failure; that execution earns no proof credit and is not a sandbox.

Review predicate honesty, duplicate equivalence, complete boundaries and every
plumbing/reset reason. The finite matrix cannot establish those semantics.
