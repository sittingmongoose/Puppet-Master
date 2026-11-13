"""DG6B guard table persona_override_empty: No override: an empty runtime lineage.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('override_scope', 'lineage_thread_id', 'lineage_run_id', 'lineage_node_id', 'lineage_attempt_id', 'lineage_actor_id')


def OE01_thread_id(value, context):
    return 'override_lineage' if value['override_scope'] is None and value['lineage_thread_id'] is not None else None


def OE02_run_id(value, context):
    return 'override_lineage' if value['override_scope'] is None and value['lineage_run_id'] is not None else None


def OE03_node_id(value, context):
    return 'override_lineage' if value['override_scope'] is None and value['lineage_node_id'] is not None else None


def OE04_attempt_id(value, context):
    return 'override_lineage' if value['override_scope'] is None and value['lineage_attempt_id'] is not None else None


def OE05_actor_id(value, context):
    return 'override_lineage' if value['override_scope'] is None and value['lineage_actor_id'] is not None else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('OE01_thread_id', g.Invariant('/runtime_lineage/thread_id', 'is null without an override'), 'override_lineage', OE01_thread_id),
        g.Guard('OE02_run_id', g.Invariant('/runtime_lineage/run_id', 'is null without an override'), 'override_lineage', OE02_run_id),
        g.Guard('OE03_node_id', g.Invariant('/runtime_lineage/node_id', 'is null without an override'), 'override_lineage', OE03_node_id),
        g.Guard('OE04_attempt_id', g.Invariant('/runtime_lineage/attempt_id', 'is null without an override'), 'override_lineage', OE04_attempt_id),
        g.Guard('OE05_actor_id', g.Invariant('/runtime_lineage/actor_id', 'is null without an override'), 'override_lineage', OE05_actor_id),
    ])

    def check(value):
        table.require('OE01_thread_id', value, context)
        table.require('OE02_run_id', value, context)
        table.require('OE03_node_id', value, context)
        table.require('OE04_attempt_id', value, context)
        table.require('OE05_actor_id', value, context)
        return True
    return g.Case(table, check, context)
