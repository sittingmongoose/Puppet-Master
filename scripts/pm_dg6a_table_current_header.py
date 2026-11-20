"""DG6A guard table current_header: a current write may start at all.

Method B guard rows (scripts/pm_guard_isolation.py) for the opening chain of
scripts/pm-card5-event-contracts-check.py::current_errors. Each predicate
reads one observation the checker derives from (family, context); predicates
never recompute, repair or call helpers. The pre-table chain returned at the
first refusal, so CU02-CU04 are entailed in order: each refuses only under
every earlier row's fact, as in the DS15 follower rows. Neither retries nor
normal appends may request a replay-only writer policy (CU02). FIELDS names
every observation the rows read; the checker passes no other. The rest of
current_errors (operation guards, context joins, append resolution) is not
in this phase and earns no credit from it.
"""
import pm_guard_isolation as g

FIELDS = ('disposition_is_historical_only', 'policy_is_replay_only', 'policy_is_dedupe', 'admitted_is_true')


def CU01_not_historical_only(value, context):
    return 'compatibility_no_new_writes' if value['disposition_is_historical_only'] is not False else None


def CU02_not_replay_only(value, context):
    return 'replay_only_not_appendable' if value['disposition_is_historical_only'] is False and value['policy_is_replay_only'] is not False else None


def CU03_policy_is_dedupe(value, context):
    return 'unsupported_replay_policy' if value['disposition_is_historical_only'] is False and value['policy_is_replay_only'] is False and value['policy_is_dedupe'] is not True else None


def CU04_admitted_is_true(value, context):
    return 'family_not_admitted' if value['disposition_is_historical_only'] is False and value['policy_is_replay_only'] is False and value['policy_is_dedupe'] is True and value['admitted_is_true'] is not True else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('CU01_not_historical_only', g.Invariant('/disposition_is_historical_only', 'family disposition is not HISTORICAL_ONLY'), 'compatibility_no_new_writes', CU01_not_historical_only),
        g.Guard('CU02_not_replay_only', g.Invariant('/policy_is_replay_only', 'context replay_policy is not projector_replay_only'), 'replay_only_not_appendable', CU02_not_replay_only),
        g.Guard('CU03_policy_is_dedupe', g.Invariant('/policy_is_dedupe', 'context replay_policy is dedupe_by_idempotency_key'), 'unsupported_replay_policy', CU03_policy_is_dedupe),
        g.Guard('CU04_admitted_is_true', g.Invariant('/admitted_is_true', 'context admitted is exactly True'), 'family_not_admitted', CU04_admitted_is_true),
    ])

    def check(value):
        table.require('CU01_not_historical_only', value, context)
        table.require('CU02_not_replay_only', value, context)
        table.require('CU03_policy_is_dedupe', value, context)
        table.require('CU04_admitted_is_true', value, context)
        return True
    return g.Case(table, check, context)
