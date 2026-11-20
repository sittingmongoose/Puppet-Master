"""S4 reference-store append predicates (generated)."""
import pm_guard_isolation as g


def admission(v, context):
    if v['edition'] not in v['registry']:
        return 'missing_event_registration'
    return None


def cutoff(v, context):
    if v['generation'] != v['live_generation']:
        return 'writer_cutoff'
    return None


def dedupe_frontier(v, context):
    if v['dedupe_through'] != v['durable_through']:
        return 'dedupe_unavailable'
    return None


def dedupe_body(v, context):
    if v['prior_digest'] is not None and v['digest'] != v['prior_digest']:
        return 'idempotency_conflict'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('admission', g.Invariant('/admission', 'actual reference-store admission invariant'), 'missing_event_registration', admission),
        g.Guard('cutoff', g.Invariant('/cutoff', 'actual reference-store cutoff invariant'), 'writer_cutoff', cutoff),
        g.Guard('dedupe_frontier', g.Invariant('/dedupe_frontier', 'actual reference-store dedupe_frontier invariant'), 'dedupe_unavailable', dedupe_frontier),
        g.Guard('dedupe_body', g.Invariant('/dedupe_body', 'actual reference-store dedupe_body invariant'), 'idempotency_conflict', dedupe_body),
    ])

    def check(value):
        table.require('admission', value, context)
        table.require('cutoff', value, context)
        table.require('dedupe_frontier', value, context)
        table.require('dedupe_body', value, context)
        return True
    return g.Case(table, check, context)
