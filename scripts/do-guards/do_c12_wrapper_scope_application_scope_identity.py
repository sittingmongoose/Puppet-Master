"""C12-DO singleton production table: wrapper_scope_application_scope_identity.

The unchanged predicate was extracted from do_board_application_source_3.py.
The closure matrix supplies its witness or exact source/schema entailment.
"""
import pm_guard_isolation as g


def wrapper_scope_application_scope_identity(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'application_scope_identity' if 'application_scope_identity' in value['wrapper_scope_failures'] else None


ROWS = (
    ('wrapper_scope_application_scope_identity', '/wrapper', 'has no application_scope_identity (the shared scope_failures helper)',
     'application_scope_identity', wrapper_scope_application_scope_identity, ('wrapper_scope_failures', 'board_branch', 'application_shape_valid'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('wrapper_scope_application_scope_identity', g.Invariant('/wrapper', 'has no application_scope_identity (the shared scope_failures helper)'), 'application_scope_identity', wrapper_scope_application_scope_identity),
    ])
    context = None

    def check(complete):
        table.require('wrapper_scope_application_scope_identity', complete, context)
        return True
    return g.Case(table, check, context)
