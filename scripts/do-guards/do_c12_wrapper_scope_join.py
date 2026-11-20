"""C12-DO singleton production table: wrapper_scope_join.

The unchanged predicate was extracted from do_board_application_source_11.py.
The closure matrix supplies its witness or exact source/schema entailment.
"""
import pm_guard_isolation as g


def wrapper_scope_join(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'source_original_join' if value['wrapper']['scope'] != value['message']['scope'] else None


ROWS = (
    ('wrapper_scope_join', '/wrapper/scope', "equals the original message's",
     'source_original_join', wrapper_scope_join, ('wrapper', 'message', 'board_branch', 'application_shape_valid'), 'original_join'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('wrapper_scope_join', g.Invariant('/wrapper/scope', "equals the original message's"), 'source_original_join', wrapper_scope_join),
    ])
    context = None

    def check(complete):
        table.require('wrapper_scope_join', complete, context)
        return True
    return g.Case(table, check, context)
