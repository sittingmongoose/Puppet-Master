"""DG6B guard table history_flags: Retained-history provenance, withdrawal and access flags.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('retained', 'authentic', 'admitted_when_written', 'family_withdrawn', 'reader_current', 'access_current', 'body_deleted')


def HF01_retained(value, context):
    return 'historical_provenance' if value['retained'] is not True else None


def HF02_authentic(value, context):
    return 'historical_provenance' if value['authentic'] is not True else None


def HF03_admitted_when_written(value, context):
    return 'historical_provenance' if value['admitted_when_written'] is not True else None


def HF04_family_withdrawn(value, context):
    return 'historical_withdrawn' if value['family_withdrawn'] is not False else None


def HF05_reader_current(value, context):
    return 'historical_withdrawn' if value['reader_current'] is not True else None


def HF06_access_current(value, context):
    return 'historical_access' if value['access_current'] is not True else None


def HF07_body_deleted(value, context):
    return 'historical_access' if value['body_deleted'] is not False else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('HF01_retained', g.Invariant('/retained', 'is exactly True'), 'historical_provenance', HF01_retained),
        g.Guard('HF02_authentic', g.Invariant('/authentic', 'is exactly True'), 'historical_provenance', HF02_authentic),
        g.Guard('HF03_admitted_when_written', g.Invariant('/admitted_when_written', 'is exactly True'), 'historical_provenance', HF03_admitted_when_written),
        g.Guard('HF04_family_withdrawn', g.Invariant('/family_withdrawn', 'is exactly False'), 'historical_withdrawn', HF04_family_withdrawn),
        g.Guard('HF05_reader_current', g.Invariant('/reader_current', 'is exactly True'), 'historical_withdrawn', HF05_reader_current),
        g.Guard('HF06_access_current', g.Invariant('/access_current', 'is exactly True'), 'historical_access', HF06_access_current),
        g.Guard('HF07_body_deleted', g.Invariant('/body_deleted', 'is exactly False'), 'historical_access', HF07_body_deleted),
    ])

    def check(value):
        table.require('HF01_retained', value, context)
        table.require('HF02_authentic', value, context)
        table.require('HF03_admitted_when_written', value, context)
        table.require('HF04_family_withdrawn', value, context)
        table.require('HF05_reader_current', value, context)
        table.require('HF06_access_current', value, context)
        table.require('HF07_body_deleted', value, context)
        return True
    return g.Case(table, check, context)
