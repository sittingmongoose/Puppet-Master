"""DO guard suite `checkpoint_identity_1` (sweep part 2A). Checkpoint read: the storage instance copies.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def checkpoint_storage_identity(value, context):
    left, right = value['checkpoint_storage_instance_id'], value['storage_instance_id']
    return 'checkpoint_storage_identity' if type(left) is not type(right) or left != right else None


def read_token_storage_identity(value, context):
    left, right = value['read_token']['storage_instance_id'], value['storage_instance_id']
    return 'checkpoint_storage_identity' if type(left) is not type(right) or left != right else None


ROWS = (
    ('checkpoint_storage_identity', '/read/checkpoint/storage_instance_id', 'equals the payload storage instance (typed)',
     'checkpoint_storage_identity', checkpoint_storage_identity, ('checkpoint_storage_instance_id', 'storage_instance_id'), None),
    ('read_token_storage_identity', '/read/read_token/storage_instance_id', 'equals the payload storage instance (typed)',
     'checkpoint_storage_identity', read_token_storage_identity, ('read_token', 'storage_instance_id'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('checkpoint_storage_identity', g.Invariant('/read/checkpoint/storage_instance_id', 'equals the payload storage instance (typed)'), 'checkpoint_storage_identity', checkpoint_storage_identity),
        g.Guard('read_token_storage_identity', g.Invariant('/read/read_token/storage_instance_id', 'equals the payload storage instance (typed)'), 'checkpoint_storage_identity', read_token_storage_identity),
    ])
    context = None

    def check(complete):
        table.require('checkpoint_storage_identity', complete, context)
        table.require('read_token_storage_identity', complete, context)
        return True
    return g.Case(table, check, context)
