"""DG6B guard table checkpoint_join: Durable read token joined to the payload Storage instance.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('token_storage_instance_id', 'payload_storage_instance_id', 'selection_storage_instance_id', 'checkpoint_key', 'expected_checkpoint_key')


def CJ01_token_storage(value, context):
    return 'checkpoint_storage_join' if value['token_storage_instance_id'] != value['payload_storage_instance_id'] else None


def CJ02_selection_storage(value, context):
    return 'checkpoint_storage_join' if value['selection_storage_instance_id'] != value['payload_storage_instance_id'] else None


def CJ03_checkpoint_key(value, context):
    return 'checkpoint_storage_join' if value['checkpoint_key'] != value['expected_checkpoint_key'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('CJ01_token_storage', g.Invariant('/durable_read_token/storage_instance_id', 'equals the payload storage_instance_id'), 'checkpoint_storage_join', CJ01_token_storage),
        g.Guard('CJ02_selection_storage', g.Invariant('/durable_read_token/source_selection/storage_instance_id', 'equals the payload storage_instance_id'), 'checkpoint_storage_join', CJ02_selection_storage),
        g.Guard('CJ03_checkpoint_key', g.Invariant('/durable_read_token/checkpoint_key', 'is event_record_index_checkpoint.v1:<storage_instance_id>'), 'checkpoint_storage_join', CJ03_checkpoint_key),
    ])

    def check(value):
        table.require('CJ01_token_storage', value, context)
        table.require('CJ02_selection_storage', value, context)
        table.require('CJ03_checkpoint_key', value, context)
        return True
    return g.Case(table, check, context)
