"""DG6B guard table persona_mutation: Persona mutations: no Computer mirror and no protected core target.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

PROTECTED_PERSONA_IDS = ('assistant', 'general-purpose', 'overseer', 'bash', 'teacher', 'collaborator', 'researcher', 'deep-researcher', 'explorer')

FIELDS = ('computer_mirror', 'protected_id', 'persona_id')


def PM01_not_mirror(value, context):
    return 'mirror' if value['computer_mirror'] is not False else None


def PM02_not_protected(value, context):
    return 'protected' if value['protected_id'] is not False else None


def PM03_target_not_protected(value, context):
    return 'protected_identity' if value['persona_id'] in PROTECTED_PERSONA_IDS else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('PM01_not_mirror', g.Invariant('/computer_mirror', 'is exactly False'), 'mirror', PM01_not_mirror),
        g.Guard('PM02_not_protected', g.Invariant('/protected_id', 'is exactly False'), 'protected', PM02_not_protected),
        g.Guard('PM03_target_not_protected', g.Invariant('/persona_id', 'is not one of the nine protected core Persona IDs (Personas section 6)'), 'protected_identity', PM03_target_not_protected),
    ])

    def check(value):
        table.require('PM01_not_mirror', value, context)
        table.require('PM02_not_protected', value, context)
        table.require('PM03_target_not_protected', value, context)
        return True
    return g.Case(table, check, context)
