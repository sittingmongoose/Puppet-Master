"""DG6B's seven retained-history flag predicates, ported to Method B.

Lineage: ff6d98d8740eff0df68a44f5d4eca0894c4fdf41,
scripts/pm-dg6b-event-contracts.py::history_contract. This runnable example is
an extracted phase (synthetic boundary), not a complete retained-reader proof.
history_case wires the original adapter/record/Storage boundaries for a lane
port; their entire source closure must pass the same static/runtime checks.
"""
import pm_guard_isolation as g


def retained(value, context):
    return 'historical_provenance' if value['retained'] is not True else None


def authentic(value, context):
    return 'historical_provenance' if value['authentic'] is not True else None


def admitted_when_written(value, context):
    return 'historical_provenance' if value['admitted_when_written'] is not True else None


def family_withdrawn(value, context):
    return 'historical_withdrawn' if value['family_withdrawn'] is not False else None


def reader_current(value, context):
    return 'historical_withdrawn' if value['reader_current'] is not True else None


def access_current(value, context):
    return 'historical_access' if value['access_current'] is not True else None


def body_deleted(value, context):
    return 'historical_access' if value['body_deleted'] is not False else None


def flag_case():
    table = g.GuardTable([
        g.Guard('retained', g.Invariant('/retained', 'is exactly True'), 'historical_provenance', retained),
        g.Guard('authentic', g.Invariant('/authentic', 'is exactly True'), 'historical_provenance', authentic),
        g.Guard('admitted_when_written', g.Invariant('/admitted_when_written', 'is exactly True'), 'historical_provenance', admitted_when_written),
        g.Guard('family_withdrawn', g.Invariant('/family_withdrawn', 'is exactly False'), 'historical_withdrawn', family_withdrawn),
        g.Guard('reader_current', g.Invariant('/reader_current', 'is exactly True'), 'historical_withdrawn', reader_current),
        g.Guard('access_current', g.Invariant('/access_current', 'is exactly True'), 'historical_access', access_current),
        g.Guard('body_deleted', g.Invariant('/body_deleted', 'is exactly False'), 'historical_access', body_deleted),
    ])
    def check(value):
        table.require('retained', value)
        table.require('authentic', value)
        table.require('admitted_when_written', value)
        table.require('family_withdrawn', value)
        table.require('reader_current', value)
        table.require('access_current', value)
        table.require('body_deleted', value)
        return True
    return g.Case(table, check)


def history_case(adapter_check, record_check, storage_check):
    """Original complete path after the lane ports all three called checkers.

    Construct these callbacks and all their state afresh in the lane factory.
    This function grants no exception/refusal translation waiver.
    """
    flags = flag_case()
    table = flags.table
    def check(value):
        adapter_check(value)
        flags.check(value)
        record_check(value)
        storage_check(value)
        return True
    return g.Case(table, check)


# Every allowance is a concrete positive construction or delegation. A lane
# must separately classify its original pure return values/plumbing sites;
# its product refusals must move into Guard rows, never into this list.
NON_GUARDS = [
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'factory', 'data_operation', 'not value', 'Toggle the builtin boolean from the literal flag dictionary.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'history_case', 'data_operation', 'flags.table', 'Read the newly returned engine Case table.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'history_case.check', 'data_operation', 'flags.check', 'Read the newly returned engine Case checker; the call remains separately reviewed.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'factory', 'data_operation', 'g.Path(__file__).resolve().parents[1]', 'Find the example repository root from its source path.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'factory', 'data_operation', "root / 'scripts/pm_guard_isolation_dg6b_example.py'", 'Build the source path used by the scanner.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'factory', 'data_operation', 'flag_case().table.guards', 'Read the fresh engine table metadata.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'factory', 'data_operation', 'g.Path(__file__).resolve().parents', 'Read the source path ancestors.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'factory', 'data_operation', 'flag_case().table', 'Read the fresh engine Case table.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'factory', 'data_operation', ' for name, value in good.items()', 'Iterate the literal flag dictionary to construct synthetic negatives.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'factory', 'data_operation', "'flag/' + name", 'Construct a negative label from a literal string key.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'factory', 'data_operation', '{**good, name: not value}', 'Copy the literal flag dictionary and toggle one boolean.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'factory', 'data_operation', 'rows[name].refusal_code', 'Read the declared engine Guard code for the literal fixture flag.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'factory', 'data_operation', "'Toggle only /' + name", 'Describe the one-field fixture change.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'factory', 'data_operation', '(name, value)', 'Unpack builtin dict.items pairs from the literal fixture dictionary.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'factory', 'data_operation', 'g.Path(__file__).resolve', 'Read the builtin path resolution method for this source path.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'factory', 'data_operation', 'rows[name]', 'Read the existing named engine Guard from the literal fixture keys.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'factory', 'data_operation', 'good.items', 'Read dict.items on the literal builtin dictionary.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'flag_case', 'return', 'return g.Case(table, check)', 'Fresh execution-object construction; not an acceptance decision.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'history_case', 'return', 'return g.Case(table, check)', 'Fresh complete-path execution-object construction.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'history_case', 'call_review', 'flag_case()', 'Construct a fresh flag table and its original checker.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'history_case.check', 'call_review', 'adapter_check(value)', 'Delegate original structure boundary; all its repository source must be scanned and its refusals tagged.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'history_case.check', 'call_review', 'flags.check(value)', 'Execute the original flag-phase checker through the same table.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'history_case.check', 'call_review', 'record_check(value)', 'Delegate original record/custody boundary; all its refusals remain scan obligations.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'history_case.check', 'call_review', 'storage_check(value)', 'Delegate original historical Storage join; every refusal must be a table row.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'factory', 'call_review', 'g.Path(__file__)', 'Locate this checked-in example module.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'factory', 'call_review', 'g.Path(__file__).resolve()', 'Resolve the repository location; not an input predicate.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'factory', 'call_review', 'list(NON_GUARDS)', 'Copy the explicit reviewed declarations for this suite.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'factory', 'call_review', 'flag_case()', 'Read the declared flag metadata from a fresh example case.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'factory', 'call_review', 'good.items()', 'Enumerate literal fixture flags for isolated negatives.'),
    g.NonGuard('scripts/pm_guard_isolation_dg6b_example.py', 'factory', 'return', 'return suite', 'Return the Suite declaration; it performs no checker acceptance/refusal.'),
]


def factory():
    root = g.Path(__file__).resolve().parents[1]
    module = root / 'scripts/pm_guard_isolation_dg6b_example.py'
    good = {'retained': True, 'authentic': True, 'admitted_when_written': True,
            'family_withdrawn': False, 'reader_current': True, 'access_current': True, 'body_deleted': False}
    rows = flag_case().table.guards
    negatives = [g.Negative('flag/' + name, {**good, name: not value}, name, rows[name].refusal_code,
                            'retained-flags-valid', 'Toggle only /' + name) for name, value in good.items()]
    suite = g.Suite('DG6B extracted retained-history flag phase', flag_case,
                    [g.Control('retained-flags-valid', good, 'synthetic')], negatives, (module,), root,
                    non_guards=list(NON_GUARDS))
    return suite
