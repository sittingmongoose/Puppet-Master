"""DR guard table observation_advance: RAP-113 restore-point observation ordinal, predecessor and owner-snapshot model.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('point', 'old_point', 'old_status', 'status', 'producer_sequence_id', 'expected_ordinal', 'parent_event_id', 'previous_event_id', 'correlation_id', 'previous_correlation_id')


def O06_changed(value, context):
    return 'observation_refused' if value['point'] == value['old_point'] else None


def O07_terminal(value, context):
    return 'observation_refused' if value['old_status'] != 'available' and value['status'] != value['old_status'] else None


def O08_ordinal(value, context):
    return 'observation_refused' if value['producer_sequence_id'] != value['expected_ordinal'] else None


def O09_parent(value, context):
    return 'observation_refused' if value['parent_event_id'] != value['previous_event_id'] else None


def O10_prior_group(value, context):
    return 'observation_refused' if value['correlation_id'] != value['previous_correlation_id'] else None


def advance_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('O06_changed', g.Invariant('/type_payload', 'differs from the predecessor restore point'), 'observation_refused', O06_changed),
        g.Guard('O07_terminal', g.Invariant('/type_payload/status', 'a terminal predecessor status is never reopened or changed'), 'observation_refused', O07_terminal),
        g.Guard('O08_ordinal', g.Invariant('/producer_sequence_id', 'equals the predecessor ordinal plus one'), 'observation_refused', O08_ordinal),
        g.Guard('O09_parent', g.Invariant('/parent_event_id', 'equals the predecessor event_id'), 'observation_refused', O09_parent),
        g.Guard('O10_prior_group', g.Invariant('/correlation_id', 'equals the predecessor correlation_id'), 'observation_refused', O10_prior_group),
    ])

    def check(value):
        table.require('O06_changed', value, context)
        table.require('O07_terminal', value, context)
        table.require('O08_ordinal', value, context)
        table.require('O09_parent', value, context)
        table.require('O10_prior_group', value, context)
        return True
    return g.Case(table, check, context)
