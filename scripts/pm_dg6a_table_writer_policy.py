"""DG6A guard table writer_policy: a current writer never selects replay-only.

Method B guard rows (scripts/pm_guard_isolation.py) for
scripts/pm-alert-event-contracts-check.py::writer_policy_errors (shared by
the panel and concern checkers). A current writer or retry model must never
select or accept projector_replay_only (standing check 1); any other policy
than dedupe_by_idempotency_key is unsupported. The pre-table guard returned
the replay-only refusal first, so WP02 is entailed on WP01's fact. FIELDS
names every observation the rows read; predicates never recompute.
"""
import pm_guard_isolation as g

FIELDS = ('policy_is_replay_only', 'policy_is_dedupe')


def WP01_not_replay_only(value, context):
    return 'replay_only_not_appendable' if value['policy_is_replay_only'] is not False else None


def WP02_policy_is_dedupe(value, context):
    return 'unsupported current writer policy' if value['policy_is_replay_only'] is False and value['policy_is_dedupe'] is not True else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('WP01_not_replay_only', g.Invariant('/policy_is_replay_only', 'writer policy is not projector_replay_only'), 'replay_only_not_appendable', WP01_not_replay_only),
        g.Guard('WP02_policy_is_dedupe', g.Invariant('/policy_is_dedupe', 'writer policy is dedupe_by_idempotency_key'), 'unsupported current writer policy', WP02_policy_is_dedupe),
    ])

    def check(value):
        table.require('WP01_not_replay_only', value, context)
        table.require('WP02_policy_is_dedupe', value, context)
        return True
    return g.Case(table, check, context)
