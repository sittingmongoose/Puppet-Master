"""DR guard table checkpoint_manifest_type: Bounded SP-278 initial-generation checkpoint join (one-segment, one-event edition).

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('current_generation_type', 'manifest_segment_type', 'manifest_generation_type', 'recovery_epoch_type')


def C08a_current_generation_type(value, context):
    return 'checkpoint_mismatch' if value['current_generation_type'] != 'int' else None


def C08b_manifest_segment_type(value, context):
    return 'checkpoint_mismatch' if value['manifest_segment_type'] != 'int' else None


def C08c_manifest_generation_type(value, context):
    return 'checkpoint_mismatch' if value['manifest_generation_type'] != 'int' else None


def C08d_recovery_epoch_type(value, context):
    return 'checkpoint_mismatch' if value['recovery_epoch_type'] != 'int' else None


def manifest_type_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('C08a_current_generation_type', g.Invariant('/current_selected_segment_generation', 'is an exact int'), 'checkpoint_mismatch', C08a_current_generation_type),
        g.Guard('C08b_manifest_segment_type', g.Invariant('/manifest_selected_segment_generation', 'is an exact int'), 'checkpoint_mismatch', C08b_manifest_segment_type),
        g.Guard('C08c_manifest_generation_type', g.Invariant('/manifest_generation', 'is an exact int'), 'checkpoint_mismatch', C08c_manifest_generation_type),
        g.Guard('C08d_recovery_epoch_type', g.Invariant('/manifest_recovery_epoch', 'is an exact int'), 'checkpoint_mismatch', C08d_recovery_epoch_type),
    ])

    def check(value):
        table.require('C08a_current_generation_type', value, context)
        table.require('C08b_manifest_segment_type', value, context)
        table.require('C08c_manifest_generation_type', value, context)
        table.require('C08d_recovery_epoch_type', value, context)
        return True
    return g.Case(table, check, context)
