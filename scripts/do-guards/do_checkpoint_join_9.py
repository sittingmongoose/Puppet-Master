"""DO guard suite `checkpoint_join_9` (sweep part 2A). Checkpoint read: the read token, row and source joins.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def row_birth_recovery_epoch(value, context):
    locator = value['row'].get('publication_locator')
    if type(locator) is not dict:
        return None
    left, right = locator.get('recovery_epoch'), value['anchor_source_selection']['recovery_epoch']
    return 'index_birth_anchor_join' if type(left) is not type(right) or left != right else None


def row_birth_survivor_prefix(value, context):
    locator = value['row'].get('publication_locator')
    if type(locator) is not dict:
        return None
    left, right = locator.get('survivor_prefix_sha256'), value['expected_prefix_sha256']
    return 'index_birth_anchor_join' if type(left) is not type(right) or left != right else None


ROWS = (
    ('row_birth_recovery_epoch', '/read/row/publication_locator/recovery_epoch', "equals the birth anchor selection's recovery epoch (typed)",
     'index_birth_anchor_join', row_birth_recovery_epoch, ('row', 'anchor_source_selection'), None),
    ('row_birth_survivor_prefix', '/read/row/publication_locator/survivor_prefix_sha256', "equals the prefix recomputed from the event's bytes",
     'index_birth_anchor_join', row_birth_survivor_prefix, ('row', 'expected_prefix_sha256'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('row_birth_recovery_epoch', g.Invariant('/read/row/publication_locator/recovery_epoch', "equals the birth anchor selection's recovery epoch (typed)"), 'index_birth_anchor_join', row_birth_recovery_epoch),
        g.Guard('row_birth_survivor_prefix', g.Invariant('/read/row/publication_locator/survivor_prefix_sha256', "equals the prefix recomputed from the event's bytes"), 'index_birth_anchor_join', row_birth_survivor_prefix),
    ])
    context = None

    def check(complete):
        table.require('row_birth_recovery_epoch', complete, context)
        table.require('row_birth_survivor_prefix', complete, context)
        return True
    return g.Case(table, check, context)
