"""DR guard table observation_recipe: RAP-113 restore-point observation ordinal, predecessor and owner-snapshot model.

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


def O12_recorded_recipe(value, context):
    return 'observation_refused' if value['dispatch_refusal'] in ('recipe_unknown', 'recipe_selection') else None


def O14_predecessor_binding(value, context):
    return 'observation_refused' if value['dispatch_refusal'] == 'original_binding' else None


def recipe_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('O12_recorded_recipe', g.Invariant('/recorded_decoder', 'the authenticated write-time recipe has an installed frozen verifier (SP-1101 RetainedDispatcher)'), 'observation_refused', O12_recorded_recipe),
        g.Guard('O14_predecessor_binding', g.Invariant('/predecessor_source/authenticated_original', 'the authenticated predecessor binding equals the supplied predecessor (SP-1101 RetainedDispatcher)'), 'observation_refused', O14_predecessor_binding),
    ])

    def check(value):
        table.require('O12_recorded_recipe', value, context)
        table.require('O14_predecessor_binding', value, context)
        return True
    return g.Case(table, check, context)
