"""C12-DO singleton production table: wrapper_scope_application_outer_project.

The unchanged predicate was extracted from do_board_application_source_4.py.
The closure matrix supplies its witness or exact source/schema entailment.
"""
import pm_guard_isolation as g


def wrapper_scope_application_outer_project(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'application_outer_project' if 'application_outer_project' in value['wrapper_scope_failures'] else None


ROWS = (
    ('wrapper_scope_application_outer_project', '/wrapper', 'has no application_outer_project (the shared scope_failures helper)',
     'application_outer_project', wrapper_scope_application_outer_project, ('wrapper_scope_failures', 'board_branch', 'application_shape_valid'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('wrapper_scope_application_outer_project', g.Invariant('/wrapper', 'has no application_outer_project (the shared scope_failures helper)'), 'application_outer_project', wrapper_scope_application_outer_project),
    ])
    context = None

    def check(complete):
        table.require('wrapper_scope_application_outer_project', complete, context)
        return True
    return g.Case(table, check, context)
