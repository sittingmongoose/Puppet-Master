"""DG6A guard table profile: one Storage profile's physical binding and size cap.

Method B guard rows (scripts/pm_guard_isolation.py) for
scripts/pm-alert-event-contracts-check.py::profile_errors (shared by the
panel and concern checkers). Each predicate reads one observation the
checker derives for one (registry, family id, kind, group) call; predicates
never recompute, repair or call helpers. The pre-table guard returned at the
first refusal, so PF02-PF05 are entailed in order: each refuses only under
every earlier row's fact. The compound file-or-group refusal is split into
PF02/PF03 with the same code. FIELDS names every observation the rows read.
"""
import pm_guard_isolation as g

FIELDS = ('profile_present', 'redb_file_matches', 'storage_group_matches', 'maximum_is_int', 'maximum_in_range')


def PF01_profile_present(value, context):
    return 'missing profile' if value['profile_present'] is not True else None


def PF02_redb_file_matches(value, context):
    return 'wrong physical binding' if value['profile_present'] is True and value['redb_file_matches'] is not True else None


def PF03_storage_group_matches(value, context):
    return 'wrong physical binding' if value['profile_present'] is True and value['redb_file_matches'] is True and value['storage_group_matches'] is not True else None


def PF04_maximum_is_int(value, context):
    return 'non-integer maximum' if value['profile_present'] is True and value['redb_file_matches'] is True and value['storage_group_matches'] is True and value['maximum_is_int'] is not True else None


def PF05_maximum_in_range(value, context):
    return 'missing/oversized maximum' if value['profile_present'] is True and value['redb_file_matches'] is True and value['storage_group_matches'] is True and value['maximum_is_int'] is True and value['maximum_in_range'] is not True else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('PF01_profile_present', g.Invariant('/profile_present', 'a storage profile exists for the family id'), 'missing profile', PF01_profile_present),
        g.Guard('PF02_redb_file_matches', g.Invariant('/redb_file_matches', 'profile redb_file is the file its storage kind requires'), 'wrong physical binding', PF02_redb_file_matches),
        g.Guard('PF03_storage_group_matches', g.Invariant('/storage_group_matches', 'profile storage_group is the group the caller requires'), 'wrong physical binding', PF03_storage_group_matches),
        g.Guard('PF04_maximum_is_int', g.Invariant('/maximum_is_int', 'profile max_value_bytes (default 0) is exactly an integer'), 'non-integer maximum', PF04_maximum_is_int),
        g.Guard('PF05_maximum_in_range', g.Invariant('/maximum_in_range', 'profile maximum is between 1 and 16384 encoded bytes'), 'missing/oversized maximum', PF05_maximum_in_range),
    ])

    def check(value):
        table.require('PF01_profile_present', value, context)
        table.require('PF02_redb_file_matches', value, context)
        table.require('PF03_storage_group_matches', value, context)
        table.require('PF04_maximum_is_int', value, context)
        table.require('PF05_maximum_in_range', value, context)
        return True
    return g.Case(table, check, context)
