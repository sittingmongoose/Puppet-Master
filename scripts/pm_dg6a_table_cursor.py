"""DG6A guard table cursor: unsigned sequence cursors in the complete u64 domain.

Method B guard rows (scripts/pm_guard_isolation.py) for
scripts/pm-alert-event-contracts-check.py::cursor_errors (shared by the
panel and concern checkers). The pre-table guard was one compound condition
with one code; each conjunct is its own row here with that same code, the
comparison rows entailed on the exact-int facts they need. Predicates read
only the derived observations and never recompute.
"""
import pm_guard_isolation as g

FIELDS = ('after_is_int', 'frontier_is_int', 'after_nonnegative', 'after_le_frontier', 'frontier_le_u64max')


def CR01_after_is_int(value, context):
    return 'invalid unsigned cursor/frontier' if value['after_is_int'] is not True else None


def CR02_frontier_is_int(value, context):
    return 'invalid unsigned cursor/frontier' if value['after_is_int'] is True and value['frontier_is_int'] is not True else None


def CR03_after_nonnegative(value, context):
    return 'invalid unsigned cursor/frontier' if value['after_is_int'] is True and value['after_nonnegative'] is not True else None


def CR04_after_le_frontier(value, context):
    return 'invalid unsigned cursor/frontier' if value['after_is_int'] is True and value['frontier_is_int'] is True and value['after_le_frontier'] is not True else None


def CR05_frontier_le_u64max(value, context):
    return 'invalid unsigned cursor/frontier' if value['frontier_is_int'] is True and value['frontier_le_u64max'] is not True else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('CR01_after_is_int', g.Invariant('/after_is_int', 'after cursor is exactly an integer'), 'invalid unsigned cursor/frontier', CR01_after_is_int),
        g.Guard('CR02_frontier_is_int', g.Invariant('/frontier_is_int', 'frontier is exactly an integer'), 'invalid unsigned cursor/frontier', CR02_frontier_is_int),
        g.Guard('CR03_after_nonnegative', g.Invariant('/after_nonnegative', 'after cursor is at least zero'), 'invalid unsigned cursor/frontier', CR03_after_nonnegative),
        g.Guard('CR04_after_le_frontier', g.Invariant('/after_le_frontier', 'after cursor does not exceed the frontier'), 'invalid unsigned cursor/frontier', CR04_after_le_frontier),
        g.Guard('CR05_frontier_le_u64max', g.Invariant('/frontier_le_u64max', 'frontier is at most the uint64 maximum'), 'invalid unsigned cursor/frontier', CR05_frontier_le_u64max),
    ])

    def check(value):
        table.require('CR01_after_is_int', value, context)
        table.require('CR02_frontier_is_int', value, context)
        table.require('CR03_after_nonnegative', value, context)
        table.require('CR04_after_le_frontier', value, context)
        table.require('CR05_frontier_le_u64max', value, context)
        return True
    return g.Case(table, check, context)
