"""DO guard suite `checkpoint_join_1` (sweep part 2A). Checkpoint read: the read token, row and source joins.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def read_token_checkpoint_key(value, context):
    left, right = value['read_token']['checkpoint_key'], value['expected_read_token']['checkpoint_key']
    return 'checkpoint_read_token_join' if type(left) is not type(right) or left != right else None


def read_token_checkpoint_ref(value, context):
    left, right = value['read_token']['checkpoint_ref'], value['expected_read_token']['checkpoint_ref']
    return 'checkpoint_read_token_join' if type(left) is not type(right) or left != right else None


def read_token_generation_id(value, context):
    left, right = value['read_token']['generation_id'], value['expected_read_token']['generation_id']
    return 'checkpoint_read_token_join' if type(left) is not type(right) or left != right else None


def read_token_generation_anchor_sha256(value, context):
    left, right = value['read_token']['generation_anchor_sha256'], value['expected_read_token']['generation_anchor_sha256']
    return 'checkpoint_read_token_join' if type(left) is not type(right) or left != right else None


def read_token_frontier_revision(value, context):
    left, right = value['read_token']['frontier_revision'], value['expected_read_token']['frontier_revision']
    return 'checkpoint_read_token_join' if type(left) is not type(right) or left != right else None


ROWS = (
    ('read_token_checkpoint_key', '/read/read_token/checkpoint_key', 'equals the key of the storage instance (typed)',
     'checkpoint_read_token_join', read_token_checkpoint_key, ('read_token', 'expected_read_token'), 'token_join'),
    ('read_token_checkpoint_ref', '/read/read_token/checkpoint_ref', 'equals key + #/generations/ + current id (typed)',
     'checkpoint_read_token_join', read_token_checkpoint_ref, ('read_token', 'expected_read_token'), 'token_join'),
    ('read_token_generation_id', '/read/read_token/generation_id', 'equals the current generation id (typed)',
     'checkpoint_read_token_join', read_token_generation_id, ('read_token', 'expected_read_token'), 'token_join'),
    ('read_token_generation_anchor_sha256', '/read/read_token/generation_anchor_sha256', 'equals the binding digest of the current birth anchor',
     'checkpoint_read_token_join', read_token_generation_anchor_sha256, ('read_token', 'expected_read_token'), 'token_join'),
    ('read_token_frontier_revision', '/read/read_token/frontier_revision', 'equals the frontier publication revision (typed)',
     'checkpoint_read_token_join', read_token_frontier_revision, ('read_token', 'expected_read_token'), 'token_join'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('read_token_checkpoint_key', g.Invariant('/read/read_token/checkpoint_key', 'equals the key of the storage instance (typed)'), 'checkpoint_read_token_join', read_token_checkpoint_key),
        g.Guard('read_token_checkpoint_ref', g.Invariant('/read/read_token/checkpoint_ref', 'equals key + #/generations/ + current id (typed)'), 'checkpoint_read_token_join', read_token_checkpoint_ref),
        g.Guard('read_token_generation_id', g.Invariant('/read/read_token/generation_id', 'equals the current generation id (typed)'), 'checkpoint_read_token_join', read_token_generation_id),
        g.Guard('read_token_generation_anchor_sha256', g.Invariant('/read/read_token/generation_anchor_sha256', 'equals the binding digest of the current birth anchor'), 'checkpoint_read_token_join', read_token_generation_anchor_sha256),
        g.Guard('read_token_frontier_revision', g.Invariant('/read/read_token/frontier_revision', 'equals the frontier publication revision (typed)'), 'checkpoint_read_token_join', read_token_frontier_revision),
    ])
    context = None

    def check(complete):
        table.require('read_token_checkpoint_key', complete, context)
        table.require('read_token_checkpoint_ref', complete, context)
        table.require('read_token_generation_id', complete, context)
        table.require('read_token_generation_anchor_sha256', complete, context)
        table.require('read_token_frontier_revision', complete, context)
        return True
    return g.Case(table, check, context)
