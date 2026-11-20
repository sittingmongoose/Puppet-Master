"""DR guard table history: SP-1101 retained-original dispatch: the authenticated write-time recipe selects the frozen verifier.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('dispatch_refusal',)


def H05c_no_caller_recipe(value, context):
    return 'unavailable' if value['dispatch_refusal'] == 'caller_recipe_override' else None


def H05b_original_binding(value, context):
    return 'unavailable' if value['dispatch_refusal'] == 'original_binding' else None


def H05_decoder(value, context):
    return 'unavailable' if value['dispatch_refusal'] in ('recipe_unknown', 'recipe_selection') else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('H05c_no_caller_recipe', g.Invariant('/dispatch_refusal', 'no caller supplies or overrides the retained recipe (SP-1101 RetainedDispatcher)'), 'unavailable', H05c_no_caller_recipe),
        g.Guard('H05b_original_binding', g.Invariant('/dispatch_refusal', 'the authenticated original binding equals the requested original (SP-1101 RetainedDispatcher)'), 'unavailable', H05b_original_binding),
        g.Guard('H05_decoder', g.Invariant('/dispatch_refusal', 'the authenticated write-time recipe has an installed frozen historical verifier'), 'unavailable', H05_decoder),
    ])

    def check(value):
        table.require('H05c_no_caller_recipe', value, context)
        table.require('H05b_original_binding', value, context)
        table.require('H05_decoder', value, context)
        return True
    return g.Case(table, check, context)
