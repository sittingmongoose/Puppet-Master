"""S4 reference-store expiry predicates (generated)."""
import pm_guard_isolation as g


def expiry_clock(v, context):
    if v['clock'] < v['expires']:
        return 'expiry_not_reached'
    return None


def expiry_observation(v, context):
    if v['decision_observation'] != v['observation']:
        return 'expiry_observation_mismatch'
    return None


def expiry_preserves_trust(v, context):
    if v['trust_after'] != v['trust_before']:
        return 'expiry_changed_trust'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('expiry_clock', g.Invariant('/expiry_clock', 'actual reference-store expiry_clock invariant'), 'expiry_not_reached', expiry_clock),
        g.Guard('expiry_observation', g.Invariant('/expiry_observation', 'actual reference-store expiry_observation invariant'), 'expiry_observation_mismatch', expiry_observation),
        g.Guard('expiry_preserves_trust', g.Invariant('/expiry_preserves_trust', 'actual reference-store expiry_preserves_trust invariant'), 'expiry_changed_trust', expiry_preserves_trust),
    ])

    def check(value):
        table.require('expiry_clock', value, context)
        table.require('expiry_observation', value, context)
        table.require('expiry_preserves_trust', value, context)
        return True
    return g.Case(table, check, context)
