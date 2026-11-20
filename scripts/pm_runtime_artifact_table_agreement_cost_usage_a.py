"""DR guard table agreement_cost_usage_a: CV-526/CV-537 current-writer copied source agreement, one row per copy site.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('usage_alias_reasoning', 'usage_alias_total', 'usage_input', 'usage_output', 'usage_total')


def usage_alias_reasoning(value, context):
    for pair in value['usage_alias_reasoning']:
        if pair[0] != pair[1]:
            return 'usage_aliases: source/copy disagreement'
    return None


def usage_alias_total(value, context):
    for pair in value['usage_alias_total']:
        if pair[0] != pair[1]:
            return 'usage_aliases: source/copy disagreement'
    return None


def usage_input(value, context):
    for pair in value['usage_input']:
        if pair[0] != pair[1]:
            return 'usage_input: source/copy disagreement'
    return None


def usage_output(value, context):
    for pair in value['usage_output']:
        if pair[0] != pair[1]:
            return 'usage_output: source/copy disagreement'
    return None


def usage_total(value, context):
    for pair in value['usage_total']:
        if pair[0] != pair[1]:
            return 'usage_total: source/copy disagreement'
    return None


def cost_usage_a_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('usage_alias_reasoning', g.Invariant('/usage_alias_reasoning', 'reasoning_tokens equals usage.reasoning_tokens'), 'usage_aliases: source/copy disagreement', usage_alias_reasoning),
        g.Guard('usage_alias_total', g.Invariant('/usage_alias_total', 'total_tokens equals usage.provider_total'), 'usage_aliases: source/copy disagreement', usage_alias_total),
        g.Guard('usage_input', g.Invariant('/usage_input', 'input_non_cached equals input_total minus cache buckets when inclusive'), 'usage_input: source/copy disagreement', usage_input),
        g.Guard('usage_output', g.Invariant('/usage_output', 'output_visible equals output_total minus reasoning when inclusive'), 'usage_output: source/copy disagreement', usage_output),
        g.Guard('usage_total', g.Invariant('/usage_total', 'a derived provider_total equals input_total plus output_total'), 'usage_total: source/copy disagreement', usage_total),
    ])

    def check(value):
        table.require('usage_alias_reasoning', value, context)
        table.require('usage_alias_total', value, context)
        table.require('usage_input', value, context)
        table.require('usage_output', value, context)
        table.require('usage_total', value, context)
        return True
    return g.Case(table, check, context)
