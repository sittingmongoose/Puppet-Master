"""DR guard table append_policy: Hypothetical admitted append and retry model.

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


def A03b_policy(value, context):
    return 'invalid' if value['replay_policy'] != 'dedupe_by_idempotency_key' else None


def policy_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('A03b_policy', g.Invariant('/replay_policy', 'is dedupe_by_idempotency_key'), 'invalid', A03b_policy),
    ])

    def check(value):
        table.require('A03b_policy', value, context)
        return True
    return g.Case(table, check, context)
