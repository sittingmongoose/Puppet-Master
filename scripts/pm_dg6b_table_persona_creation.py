"""DG6B guard table persona_creation: Create and duplicate source rules.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('command_id', 'source_id', 'source_revision', 'source_sha256', 'persona_id', 'result_status')


def CR01_duplicate_source_id(value, context):
    return 'creation_source' if value['command_id'] == 'cmd.persona.duplicate' and value['source_id'] is None else None


def CR02_duplicate_source_revision(value, context):
    return 'creation_source' if value['command_id'] == 'cmd.persona.duplicate' and value['source_revision'] is None else None


def CR03_duplicate_source_sha256(value, context):
    return 'creation_source' if value['command_id'] == 'cmd.persona.duplicate' and value['source_sha256'] is None else None


def CR04_duplicate_distinct_target(value, context):
    return 'creation_source' if value['command_id'] == 'cmd.persona.duplicate' and value['source_id'] is not None and value['source_id'] == value['persona_id'] else None


def CR05_duplicate_status(value, context):
    return 'creation_source' if value['command_id'] == 'cmd.persona.duplicate' and value['result_status'] != 'duplicated' else None


def CR06_create_source_all_or_none(value, context):
    return 'creation_source' if value['command_id'] != 'cmd.persona.duplicate' and not (value['source_id'] is None) == (value['source_revision'] is None) == (value['source_sha256'] is None) else None


def CR07_create_status(value, context):
    return 'creation_source' if value['command_id'] != 'cmd.persona.duplicate' and value['result_status'] != 'created' else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('CR01_duplicate_source_id', g.Invariant('/source_id', 'a duplicate names its source_id'), 'creation_source', CR01_duplicate_source_id),
        g.Guard('CR02_duplicate_source_revision', g.Invariant('/source_revision', 'a duplicate names its source_revision'), 'creation_source', CR02_duplicate_source_revision),
        g.Guard('CR03_duplicate_source_sha256', g.Invariant('/source_sha256', 'a duplicate names its source_sha256'), 'creation_source', CR03_duplicate_source_sha256),
        g.Guard('CR04_duplicate_distinct_target', g.Invariant('/source_id', 'a duplicate source differs from the new persona_id (source named)'), 'creation_source', CR04_duplicate_distinct_target),
        g.Guard('CR05_duplicate_status', g.Invariant('/result_status', 'a duplicate reports duplicated'), 'creation_source', CR05_duplicate_status),
        g.Guard('CR06_create_source_all_or_none', g.Invariant('/source_id', 'a plain create names all three source fields or none'), 'creation_source', CR06_create_source_all_or_none),
        g.Guard('CR07_create_status', g.Invariant('/result_status', 'a plain create reports created'), 'creation_source', CR07_create_status),
    ])

    def check(value):
        table.require('CR01_duplicate_source_id', value, context)
        table.require('CR02_duplicate_source_revision', value, context)
        table.require('CR03_duplicate_source_sha256', value, context)
        table.require('CR04_duplicate_distinct_target', value, context)
        table.require('CR05_duplicate_status', value, context)
        table.require('CR06_create_source_all_or_none', value, context)
        table.require('CR07_create_status', value, context)
        return True
    return g.Case(table, check, context)
