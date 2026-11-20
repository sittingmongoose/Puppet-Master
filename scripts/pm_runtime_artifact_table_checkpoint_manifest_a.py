"""DR guard table checkpoint_manifest_a: Bounded SP-278 initial-generation checkpoint join (one-segment, one-event edition).

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('selection_current_sha256', 'current_sha256', 'selection_manifest_sha256', 'manifest_sha256', 'current_generation', 'selection_segment_generation', 'manifest_segment', 'manifest_generation', 'selection_manifest_generation', 'recovery_epoch', 'selection_recovery_epoch')


def C08e_current_bytes(value, context):
    return 'checkpoint_mismatch' if value['selection_current_sha256'] != value['current_sha256'] else None


def C08f_manifest_bytes(value, context):
    return 'checkpoint_mismatch' if value['selection_manifest_sha256'] != value['manifest_sha256'] else None


def C08g_current_generation(value, context):
    return 'checkpoint_mismatch' if value['current_generation'] != value['selection_segment_generation'] else None


def C08h_manifest_segment(value, context):
    return 'checkpoint_mismatch' if value['manifest_segment'] != value['selection_segment_generation'] else None


def C08i_manifest_generation(value, context):
    return 'checkpoint_mismatch' if value['manifest_generation'] != value['selection_manifest_generation'] else None


def C08j_recovery_epoch(value, context):
    return 'checkpoint_mismatch' if value['recovery_epoch'] != value['selection_recovery_epoch'] else None


def manifest_a_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('C08e_current_bytes', g.Invariant('/selection_current_bytes_sha256', 'equals sha256 of the CURRENT bytes'), 'checkpoint_mismatch', C08e_current_bytes),
        g.Guard('C08f_manifest_bytes', g.Invariant('/selection_manifest_bytes_sha256', 'equals sha256 of the manifest bytes'), 'checkpoint_mismatch', C08f_manifest_bytes),
        g.Guard('C08g_current_generation', g.Invariant('/current_selected_segment_generation', 'equals the selection segment generation'), 'checkpoint_mismatch', C08g_current_generation),
        g.Guard('C08h_manifest_segment', g.Invariant('/manifest_selected_segment_generation', 'equals the selection segment generation'), 'checkpoint_mismatch', C08h_manifest_segment),
        g.Guard('C08i_manifest_generation', g.Invariant('/manifest_generation', 'equals the selection manifest generation'), 'checkpoint_mismatch', C08i_manifest_generation),
        g.Guard('C08j_recovery_epoch', g.Invariant('/manifest_recovery_epoch', 'equals the selection recovery epoch'), 'checkpoint_mismatch', C08j_recovery_epoch),
    ])

    def check(value):
        table.require('C08e_current_bytes', value, context)
        table.require('C08f_manifest_bytes', value, context)
        table.require('C08g_current_generation', value, context)
        table.require('C08h_manifest_segment', value, context)
        table.require('C08i_manifest_generation', value, context)
        table.require('C08j_recovery_epoch', value, context)
        return True
    return g.Case(table, check, context)
