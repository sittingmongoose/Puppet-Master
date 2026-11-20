"""S4 reference-store withdraw predicates (generated)."""
import pm_guard_isolation as g


def withdraw_cutoff(v, context):
    if v['writer_generation'] != v['expected_cutoff']:
        return 'writer_cutoff'
    return None


def withdraw_head(v, context):
    if v['expected_head'] != v['stored_head']:
        return 'checkpoint_cas_failed'
    return None


def withdraw_successor(v, context):
    if v['successor_rows'] != v['source_rows']:
        return 'successor_rebuild'
    return None


def withdraw_generation(v, context):
    if v['successor_generation'] == v['old_generation']:
        return 'successor_rebuild'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('withdraw_cutoff', g.Invariant('/withdraw_cutoff', 'actual reference-store withdraw_cutoff invariant'), 'writer_cutoff', withdraw_cutoff),
        g.Guard('withdraw_head', g.Invariant('/withdraw_head', 'actual reference-store withdraw_head invariant'), 'checkpoint_cas_failed', withdraw_head),
        g.Guard('withdraw_successor', g.Invariant('/withdraw_successor', 'actual reference-store withdraw_successor invariant'), 'successor_rebuild', withdraw_successor),
        g.Guard('withdraw_generation', g.Invariant('/withdraw_generation', 'actual reference-store withdraw_generation invariant'), 'successor_rebuild', withdraw_generation),
    ])

    def check(value):
        table.require('withdraw_cutoff', value, context)
        table.require('withdraw_head', value, context)
        table.require('withdraw_successor', value, context)
        table.require('withdraw_generation', value, context)
        return True
    return g.Case(table, check, context)
