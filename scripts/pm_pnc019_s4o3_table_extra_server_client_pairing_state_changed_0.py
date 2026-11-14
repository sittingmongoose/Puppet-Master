"""S4 reference-store extra_server_client_pairing_state_changed_0 predicates (generated)."""
import pm_guard_isolation as g


def extra_pairing_reject_no_grant(v, context):
    if v['extra_pairing_reject_no_grant']['outcome'] in ['rejected', 'cancelled'] and v['extra_pairing_reject_no_grant']['issued_trust'] != []:
        return 'owner_predicate_failed'
    return None


def extra_pairing_answered_generation_number_request_generation(v, context):
    if v['extra_pairing_answered_generation']['numeric_reasons']['request_generation'] is not None:
        return 'number_domain'
    return None


def extra_pairing_answered_generation_number_answered_generations(v, context):
    if v['extra_pairing_answered_generation']['numeric_reasons']['answered_generations'] is not None:
        return 'number_domain'
    return None


def extra_pairing_answered_generation(v, context):
    if v['extra_pairing_answered_generation']['numeric_reasons'] == {'request_generation': None, 'answered_generations': None} and (v['extra_pairing_answered_generation']['request_generation'] in v['extra_pairing_answered_generation']['answered_generations'] and v['extra_pairing_answered_generation']['new_state'] in ['created', 'waiting_identity', 'waiting_approval']):
        return 'owner_predicate_failed'
    return None


def extra_pairing_preserves_prior_trust(v, context):
    if v['extra_pairing_preserves_prior_trust']['trust_after_later_rejection'] != v['extra_pairing_preserves_prior_trust']['trust_before_request']:
        return 'owner_predicate_failed'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('extra_pairing_reject_no_grant', g.Invariant('/extra_pairing_reject_no_grant', 'actual reference-store extra_pairing_reject_no_grant invariant'), 'owner_predicate_failed', extra_pairing_reject_no_grant),
        g.Guard('extra_pairing_answered_generation_number_request_generation', g.Invariant('/extra_pairing_answered_generation_number_request_generation', 'actual reference-store extra_pairing_answered_generation_number_request_generation invariant'), 'number_domain', extra_pairing_answered_generation_number_request_generation),
        g.Guard('extra_pairing_answered_generation_number_answered_generations', g.Invariant('/extra_pairing_answered_generation_number_answered_generations', 'actual reference-store extra_pairing_answered_generation_number_answered_generations invariant'), 'number_domain', extra_pairing_answered_generation_number_answered_generations),
        g.Guard('extra_pairing_answered_generation', g.Invariant('/extra_pairing_answered_generation', 'actual reference-store extra_pairing_answered_generation invariant'), 'owner_predicate_failed', extra_pairing_answered_generation),
        g.Guard('extra_pairing_preserves_prior_trust', g.Invariant('/extra_pairing_preserves_prior_trust', 'actual reference-store extra_pairing_preserves_prior_trust invariant'), 'owner_predicate_failed', extra_pairing_preserves_prior_trust),
    ])

    def check(value):
        table.require('extra_pairing_reject_no_grant', value, context)
        table.require('extra_pairing_answered_generation_number_request_generation', value, context)
        table.require('extra_pairing_answered_generation_number_answered_generations', value, context)
        table.require('extra_pairing_answered_generation', value, context)
        table.require('extra_pairing_preserves_prior_trust', value, context)
        return True
    return g.Case(table, check, context)
