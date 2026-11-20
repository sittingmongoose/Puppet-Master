"""DG6B guard table retry: Retry against the verified original append.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('event_id', 'original_event_id', 'idempotency_key', 'original_idempotency_key', 'semantic_digest', 'original_semantic_digest')


def RY01_event_id(value, context):
    return 'retry_identity' if value['event_id'] != value['original_event_id'] else None


def RY02_idempotency_key(value, context):
    return 'retry_identity' if value['event_id'] == value['original_event_id'] and value['idempotency_key'] != value['original_idempotency_key'] else None


def RY03_semantic_body(value, context):
    return 'idempotency_conflict' if value['event_id'] == value['original_event_id'] and value['idempotency_key'] == value['original_idempotency_key'] and value['semantic_digest'] != value['original_semantic_digest'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('RY01_event_id', g.Invariant('/event_id', 'equals the original event_id'), 'retry_identity', RY01_event_id),
        g.Guard('RY02_idempotency_key', g.Invariant('/idempotency_key', 'equals the original idempotency_key (event_id equal)'), 'retry_identity', RY02_idempotency_key),
        g.Guard('RY03_semantic_body', g.Invariant('/semantic_digest', 'the caller semantic EventRecord body equals the original (identity equal)'), 'idempotency_conflict', RY03_semantic_body),
    ])

    def check(value):
        table.require('RY01_event_id', value, context)
        table.require('RY02_idempotency_key', value, context)
        table.require('RY03_semantic_body', value, context)
        return True
    return g.Case(table, check, context)
