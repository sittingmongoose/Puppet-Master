"""DG6B guard table persona_update_cas: Update source identity, revision and order.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('source_revision', 'expected_owner_revision', 'source_id', 'persona_id', 'source_sha256', 'revision')


def UC01_expected_is_source_revision(value, context):
    return 'cas' if value['source_revision'] is not None and value['expected_owner_revision'] != value['source_revision'] else None


def UC02_source_is_target(value, context):
    return 'cas' if value['source_id'] is not None and value['source_id'] != value['persona_id'] else None


def UC03_source_id_named(value, context):
    return 'cas' if value['source_id'] is None else None


def UC04_source_revision_named(value, context):
    return 'cas' if value['source_revision'] is None else None


def UC05_source_sha256_named(value, context):
    return 'cas' if value['source_sha256'] is None else None


def UC06_revision_order(value, context):
    return 'cas' if type(value['expected_owner_revision']) is int and type(value['revision']) is int and value['expected_owner_revision'] >= value['revision'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('UC01_expected_is_source_revision', g.Invariant('/expected_owner_revision', 'equals source_revision (source_revision named)'), 'cas', UC01_expected_is_source_revision),
        g.Guard('UC02_source_is_target', g.Invariant('/source_id', 'equals persona_id (source_id named)'), 'cas', UC02_source_is_target),
        g.Guard('UC03_source_id_named', g.Invariant('/source_id', 'is not null'), 'cas', UC03_source_id_named),
        g.Guard('UC04_source_revision_named', g.Invariant('/source_revision', 'is not null'), 'cas', UC04_source_revision_named),
        g.Guard('UC05_source_sha256_named', g.Invariant('/source_sha256', 'is not null'), 'cas', UC05_source_sha256_named),
        g.Guard('UC06_revision_order', g.Invariant('/revision', 'is greater than expected_owner_revision (both integers)'), 'cas', UC06_revision_order),
    ])

    def check(value):
        table.require('UC01_expected_is_source_revision', value, context)
        table.require('UC02_source_is_target', value, context)
        table.require('UC03_source_id_named', value, context)
        table.require('UC04_source_revision_named', value, context)
        table.require('UC05_source_sha256_named', value, context)
        table.require('UC06_revision_order', value, context)
        return True
    return g.Case(table, check, context)
