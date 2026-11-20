"""DR guard table append_replay: Hypothetical admitted append and retry model.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('replay_policy',)


def A03a_replay_only(value, context):
    return 'replay_only_not_appendable' if value['replay_policy'] == 'projector_replay_only' else None


def replay_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('A03a_replay_only', g.Invariant('/replay_policy', 'is not projector_replay_only'), 'replay_only_not_appendable', A03a_replay_only),
    ])

    def check(value):
        table.require('A03a_replay_only', value, context)
        return True
    return g.Case(table, check, context)
