"""DG6B guard table envelope_b: EventRecord fields joined to the source accounts and runtime lineage (part b).

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('requested_account_ref', 'source_requested_account_ref', 'effective_account_ref', 'source_effective_account_ref', 'thread_id', 'lineage_thread_id', 'run_id', 'lineage_run_id', 'node_id', 'lineage_node_id', 'attempt_id', 'lineage_attempt_id')


def EJ08_requested_account(value, context):
    return 'envelope_source_join' if value['requested_account_ref'] != value['source_requested_account_ref'] else None


def EJ09_effective_account(value, context):
    return 'envelope_source_join' if value['effective_account_ref'] != value['source_effective_account_ref'] else None


def EJ10_thread_id(value, context):
    return 'envelope_source_join' if value['thread_id'] != value['lineage_thread_id'] else None


def EJ11_run_id(value, context):
    return 'envelope_source_join' if value['run_id'] != value['lineage_run_id'] else None


def EJ12_node_id(value, context):
    return 'envelope_source_join' if value['node_id'] != value['lineage_node_id'] else None


def EJ13_attempt_id(value, context):
    return 'envelope_source_join' if value['attempt_id'] != value['lineage_attempt_id'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('EJ08_requested_account', g.Invariant('/event_record/requested_account_ref', 'equals the source requested account'), 'envelope_source_join', EJ08_requested_account),
        g.Guard('EJ09_effective_account', g.Invariant('/event_record/effective_account_ref', 'equals the source effective account'), 'envelope_source_join', EJ09_effective_account),
        g.Guard('EJ10_thread_id', g.Invariant('/event_record/thread_id', 'equals payload runtime_lineage thread_id'), 'envelope_source_join', EJ10_thread_id),
        g.Guard('EJ11_run_id', g.Invariant('/event_record/run_id', 'equals payload runtime_lineage run_id'), 'envelope_source_join', EJ11_run_id),
        g.Guard('EJ12_node_id', g.Invariant('/event_record/node_id', 'equals payload runtime_lineage node_id'), 'envelope_source_join', EJ12_node_id),
        g.Guard('EJ13_attempt_id', g.Invariant('/event_record/attempt_id', 'equals payload runtime_lineage attempt_id'), 'envelope_source_join', EJ13_attempt_id),
    ])

    def check(value):
        table.require('EJ08_requested_account', value, context)
        table.require('EJ09_effective_account', value, context)
        table.require('EJ10_thread_id', value, context)
        table.require('EJ11_run_id', value, context)
        table.require('EJ12_node_id', value, context)
        table.require('EJ13_attempt_id', value, context)
        return True
    return g.Case(table, check, context)
