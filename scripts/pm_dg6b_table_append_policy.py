"""DG6B guard table append_policy: Current-writer replay policy.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('replay_policy',)


def AP01_not_replay_only(value, context):
    return 'replay_only_not_appendable' if value['replay_policy'] == 'projector_replay_only' else None


def AP02_dedupe(value, context):
    return 'writer_replay_policy' if value['replay_policy'] not in ('dedupe_by_idempotency_key', 'projector_replay_only') else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('AP01_not_replay_only', g.Invariant('/replay_policy', 'is not projector_replay_only for a current append'), 'replay_only_not_appendable', AP01_not_replay_only),
        g.Guard('AP02_dedupe', g.Invariant('/replay_policy', 'is dedupe_by_idempotency_key (any other non-replay-only policy)'), 'writer_replay_policy', AP02_dedupe),
    ])

    def check(value):
        table.require('AP01_not_replay_only', value, context)
        table.require('AP02_dedupe', value, context)
        return True
    return g.Case(table, check, context)
