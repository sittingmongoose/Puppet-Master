"""DR guard table agreement_cost_usage_b: CV-526/CV-537 current-writer copied source agreement, one row per copy site.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('usage_cost', 'usage_flag_provider_reported', 'usage_flag_cli_reported', 'usage_flag_local_context_estimate', 'usage_flag_estimated')


def usage_cost(value, context):
    for pair in value['usage_cost']:
        if pair[0] != pair[1]:
            return 'usage_cost: source/copy disagreement'
    return None


def usage_flag_provider_reported(value, context):
    for pair in value['usage_flag_provider_reported']:
        if pair[0] != pair[1]:
            return 'usage_flags: source/copy disagreement'
    return None


def usage_flag_cli_reported(value, context):
    for pair in value['usage_flag_cli_reported']:
        if pair[0] != pair[1]:
            return 'usage_flags: source/copy disagreement'
    return None


def usage_flag_local_context_estimate(value, context):
    for pair in value['usage_flag_local_context_estimate']:
        if pair[0] != pair[1]:
            return 'usage_flags: source/copy disagreement'
    return None


def usage_flag_estimated(value, context):
    for pair in value['usage_flag_estimated']:
        if pair[0] != pair[1]:
            return 'usage_flags: source/copy disagreement'
    return None


def cost_usage_b_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('usage_cost', g.Invariant('/usage_cost', 'cost_microdollars equals the sum of integer bucket costs'), 'usage_cost: source/copy disagreement', usage_cost),
        g.Guard('usage_flag_provider_reported', g.Invariant('/usage_flag_provider_reported', 'is_provider_reported matches the authority source class'), 'usage_flags: source/copy disagreement', usage_flag_provider_reported),
        g.Guard('usage_flag_cli_reported', g.Invariant('/usage_flag_cli_reported', 'is_cli_reported matches the authority source class'), 'usage_flags: source/copy disagreement', usage_flag_cli_reported),
        g.Guard('usage_flag_local_context_estimate', g.Invariant('/usage_flag_local_context_estimate', 'is_local_context_estimate matches the authority source class'), 'usage_flags: source/copy disagreement', usage_flag_local_context_estimate),
        g.Guard('usage_flag_estimated', g.Invariant('/usage_flag_estimated', 'is_estimated matches the authority source class'), 'usage_flags: source/copy disagreement', usage_flag_estimated),
    ])

    def check(value):
        table.require('usage_cost', value, context)
        table.require('usage_flag_provider_reported', value, context)
        table.require('usage_flag_cli_reported', value, context)
        table.require('usage_flag_local_context_estimate', value, context)
        table.require('usage_flag_estimated', value, context)
        return True
    return g.Case(table, check, context)
