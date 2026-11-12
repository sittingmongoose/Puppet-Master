"""DG6B guard table persona_override_set: An override names its lineage owner.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('override_scope', 'override_owner', 'lineage_owner')


def OO02_owner_not_tier(value, context):
    return 'override_lineage' if value['override_scope'] is not None and value['override_owner'] == 'tier_id' else None


def OO03_owner_is_lineage(value, context):
    return 'override_lineage' if value['override_scope'] is not None and value['override_owner'] is not None and value['override_owner'] != 'tier_id' and value['override_owner'] != value['lineage_owner'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('OO02_owner_not_tier', g.Invariant('/persona_override_owner_id', 'is not the literal tier_id'), 'override_lineage', OO02_owner_not_tier),
        g.Guard('OO03_owner_is_lineage', g.Invariant('/persona_override_owner_id', 'equals runtime_lineage <scope>_id (named, not tier_id)'), 'override_lineage', OO03_owner_is_lineage),
    ])

    def check(value):
        table.require('OO02_owner_not_tier', value, context)
        table.require('OO03_owner_is_lineage', value, context)
        return True
    return g.Case(table, check, context)
