"""S4 reference-store connection predicates (generated)."""
import pm_guard_isolation as g


def connection_session(v, context):
    if v['session_id'] != v['verified_session_id']:
        return 'connection_session_unverified'
    return None


def connection_trust(v, context):
    if v['trust_generation'] != v['current_trust_generation']:
        return 'connection_trust_stale'
    return None


def connection_cursor(v, context):
    if v['cursor_ref'] != v['verified_cursor_ref']:
        return 'connection_cursor_unverified'
    return None


def connection_work(v, context):
    if v['work_after'] != v['work_before']:
        return 'connection_created_work'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('connection_session', g.Invariant('/connection_session', 'actual reference-store connection_session invariant'), 'connection_session_unverified', connection_session),
        g.Guard('connection_trust', g.Invariant('/connection_trust', 'actual reference-store connection_trust invariant'), 'connection_trust_stale', connection_trust),
        g.Guard('connection_cursor', g.Invariant('/connection_cursor', 'actual reference-store connection_cursor invariant'), 'connection_cursor_unverified', connection_cursor),
        g.Guard('connection_work', g.Invariant('/connection_work', 'actual reference-store connection_work invariant'), 'connection_created_work', connection_work),
    ])

    def check(value):
        table.require('connection_session', value, context)
        table.require('connection_trust', value, context)
        table.require('connection_cursor', value, context)
        table.require('connection_work', value, context)
        return True
    return g.Case(table, check, context)
