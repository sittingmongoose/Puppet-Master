"""DG6B guard table preparation_a: Prepared-oracle fences: fixture and grade coverage, disposition.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('fixture_families', 'expected_families', 'fixture_rows', 'grade_families', 'dispositions')


def PR01_fixture_families(value, context):
    return 'fixture_family_coverage' if value['fixture_families'] != value['expected_families'] else None


def PR02_fixture_rows(value, context):
    return 'fixture_family_coverage' if value['fixture_families'] == value['expected_families'] and value['fixture_rows'] != len(value['expected_families']) else None


def PR03_grade_families(value, context):
    return 'grade_family_coverage' if value['grade_families'] != value['expected_families'] else None


def PR04_undispositioned(value, context):
    return 'unadmitted_disposition' if value['dispositions'].count('UNDISPOSITIONED') != len(value['dispositions']) else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('PR01_fixture_families', g.Invariant('/fixture_families', 'equals the nineteen DG6B families'), 'fixture_family_coverage', PR01_fixture_families),
        g.Guard('PR02_fixture_rows', g.Invariant('/fixture_rows', 'is one fixture row per DG6B family (family set equal)'), 'fixture_family_coverage', PR02_fixture_rows),
        g.Guard('PR03_grade_families', g.Invariant('/grade_families', 'equals the nineteen DG6B families'), 'grade_family_coverage', PR03_grade_families),
        g.Guard('PR04_undispositioned', g.Invariant('/dispositions', 'every graded row is UNDISPOSITIONED'), 'unadmitted_disposition', PR04_undispositioned),
    ])

    def check(value):
        table.require('PR01_fixture_families', value, context)
        table.require('PR02_fixture_rows', value, context)
        table.require('PR03_grade_families', value, context)
        table.require('PR04_undispositioned', value, context)
        return True
    return g.Case(table, check, context)
