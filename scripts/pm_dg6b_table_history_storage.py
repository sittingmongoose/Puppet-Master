"""DG6B guard table history_storage: Retained original joined to the authenticated Storage record.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('authenticated', 'storage_instance_id', 'token_storage_instance_id', 'scope_partition', 'original_scope_partition', 'storage_hex_digest', 'record_hex_digest')


def HS01_authenticated(value, context):
    return 'historical_storage_source' if value['authenticated'] is not True else None


def HS02_storage_instance(value, context):
    return 'historical_storage_join' if value['storage_instance_id'] != value['token_storage_instance_id'] else None


def HS03_scope_partition(value, context):
    return 'historical_storage_join' if value['scope_partition'] != value['original_scope_partition'] else None


def HS04_record_bytes(value, context):
    return 'historical_storage_record' if value['storage_hex_digest'] != value['record_hex_digest'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('HS01_authenticated', g.Invariant('/storage_record/authenticated', 'is exactly True'), 'historical_storage_source', HS01_authenticated),
        g.Guard('HS02_storage_instance', g.Invariant('/storage_record/storage_instance_id', 'equals the original read token storage_instance_id'), 'historical_storage_join', HS02_storage_instance),
        g.Guard('HS03_scope_partition', g.Invariant('/storage_record/scope_partition', 'equals the original scope_partition'), 'historical_storage_join', HS03_scope_partition),
        g.Guard('HS04_record_bytes', g.Invariant('/storage_record/event_record_bytes_hex', 'equals the hex of the original canonical EventRecord bytes'), 'historical_storage_record', HS04_record_bytes),
    ])

    def check(value):
        table.require('HS01_authenticated', value, context)
        table.require('HS02_storage_instance', value, context)
        table.require('HS03_scope_partition', value, context)
        table.require('HS04_record_bytes', value, context)
        return True
    return g.Case(table, check, context)
