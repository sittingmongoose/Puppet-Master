"""DR guard table observation_lineage_b: RAP-113 restore-point observation ordinal, predecessor and owner-snapshot model.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('record_sha256', 'old_record_sha256', 'source_thread_id', 'old_source_thread_id', 'source_branch_id', 'old_source_branch_id', 'source_message_id', 'old_source_message_id')


def O05_record_sha256(value, context):
    return 'observation_refused' if value['record_sha256'] != value['old_record_sha256'] else None


def O05_source_thread_id(value, context):
    return 'observation_refused' if value['source_thread_id'] != value['old_source_thread_id'] else None


def O05_source_branch_id(value, context):
    return 'observation_refused' if value['source_branch_id'] != value['old_source_branch_id'] else None


def O05_source_message_id(value, context):
    return 'observation_refused' if value['source_message_id'] != value['old_source_message_id'] else None


def lineage_b_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('O05_record_sha256', g.Invariant('/type_payload/record_sha256', 'equals the predecessor value'), 'observation_refused', O05_record_sha256),
        g.Guard('O05_source_thread_id', g.Invariant('/type_payload/source_thread_id', 'equals the predecessor value'), 'observation_refused', O05_source_thread_id),
        g.Guard('O05_source_branch_id', g.Invariant('/type_payload/source_branch_id', 'equals the predecessor value'), 'observation_refused', O05_source_branch_id),
        g.Guard('O05_source_message_id', g.Invariant('/type_payload/source_message_id', 'equals the predecessor value'), 'observation_refused', O05_source_message_id),
    ])

    def check(value):
        table.require('O05_record_sha256', value, context)
        table.require('O05_source_thread_id', value, context)
        table.require('O05_source_branch_id', value, context)
        table.require('O05_source_message_id', value, context)
        return True
    return g.Case(table, check, context)
