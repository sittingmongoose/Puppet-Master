"""DR guard table codec_oracle: Codec, identity, validator-profile, oracle and reference preconditions.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('raised',)


def S05_failure_oracle(value, context):
    return 'success_is_not_failure' if value['raised'] is not True else None


def oracle_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('S05_failure_oracle', g.Invariant('/raised', 'a failure oracle counts only a raised refusal, never a success'), 'success_is_not_failure', S05_failure_oracle),
    ])

    def check(value):
        table.require('S05_failure_oracle', value, context)
        return True
    return g.Case(table, check, context)
