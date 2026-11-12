"""DG6B guard table frozen_source: Frozen at-write source custody.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('payload_digest', 'frozen_payload_digest', 'payload_storage_digest', 'source_storage_digest')


def FS01_frozen_payload(value, context):
    return 'original_source_join' if value['payload_digest'] != value['frozen_payload_digest'] else None


def FS02_storage_instance(value, context):
    return 'original_source_join' if value['payload_storage_digest'] != value['source_storage_digest'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('FS01_frozen_payload', g.Invariant('/payload', 'equals the frozen source payload (exact typed bytes)'), 'original_source_join', FS01_frozen_payload),
        g.Guard('FS02_storage_instance', g.Invariant('/payload/storage_instance_id', 'equals the source storage_instance_id (exact typed bytes)'), 'original_source_join', FS02_storage_instance),
    ])

    def check(value):
        table.require('FS01_frozen_payload', value, context)
        table.require('FS02_storage_instance', value, context)
        return True
    return g.Case(table, check, context)
