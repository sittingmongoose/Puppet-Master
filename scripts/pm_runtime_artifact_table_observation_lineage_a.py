"""DR guard table observation_lineage_a: RAP-113 restore-point observation ordinal, predecessor and owner-snapshot model.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('artifact_id', 'old_artifact_id', 'restore_point_id', 'old_restore_point_id', 'point_project_id', 'old_point_project_id', 'record_ref', 'old_record_ref')


def O05_artifact(value, context):
    return 'observation_refused' if value['artifact_id'] != value['old_artifact_id'] else None


def O05_restore_point_id(value, context):
    return 'observation_refused' if value['restore_point_id'] != value['old_restore_point_id'] else None


def O05_project_id(value, context):
    return 'observation_refused' if value['point_project_id'] != value['old_point_project_id'] else None


def O05_record_ref(value, context):
    return 'observation_refused' if value['record_ref'] != value['old_record_ref'] else None


def lineage_a_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('O05_artifact', g.Invariant('/artifact_id', 'equals the predecessor artifact_id'), 'observation_refused', O05_artifact),
        g.Guard('O05_restore_point_id', g.Invariant('/type_payload/restore_point_id', 'equals the predecessor value'), 'observation_refused', O05_restore_point_id),
        g.Guard('O05_project_id', g.Invariant('/type_payload/project_id', 'equals the predecessor value'), 'observation_refused', O05_project_id),
        g.Guard('O05_record_ref', g.Invariant('/type_payload/record_ref', 'equals the predecessor value'), 'observation_refused', O05_record_ref),
    ])

    def check(value):
        table.require('O05_artifact', value, context)
        table.require('O05_restore_point_id', value, context)
        table.require('O05_project_id', value, context)
        table.require('O05_record_ref', value, context)
        return True
    return g.Case(table, check, context)
