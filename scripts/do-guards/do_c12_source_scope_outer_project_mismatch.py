"""C12-DO singleton production table: source_scope_outer_project_mismatch.

The unchanged predicate was extracted from do_board_application_source_2.py.
The closure matrix supplies its witness or exact source/schema entailment.
"""
import pm_guard_isolation as g


def source_scope_outer_project_mismatch(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'outer_project_mismatch' if 'outer_project_mismatch' in value['source_scope_failures'] else None


ROWS = (
    ('source_scope_outer_project_mismatch', '/source', 'has no outer_project_mismatch (the shared scope_failures helper)',
     'outer_project_mismatch', source_scope_outer_project_mismatch, ('source_scope_failures', 'board_branch', 'application_shape_valid'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('source_scope_outer_project_mismatch', g.Invariant('/source', 'has no outer_project_mismatch (the shared scope_failures helper)'), 'outer_project_mismatch', source_scope_outer_project_mismatch),
    ])
    context = None

    def check(complete):
        table.require('source_scope_outer_project_mismatch', complete, context)
        return True
    return g.Case(table, check, context)
