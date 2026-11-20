"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def ss_pf_outcome(value, context):
    record = value['ss_pf_outcome']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_pf_outcome_refused'
    return None

def ss_pf_decision(value, context):
    record = value['ss_pf_decision']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_pf_decision_refused'
    return None

def ss_pf_ref(value, context):
    record = value['ss_pf_ref']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_pf_ref_refused'
    return None

def ss_pf_identity(value, context):
    record = value['ss_pf_identity']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_pf_identity_refused'
    return None

def ss_pf_envelope(value, context):
    record = value['ss_pf_envelope']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_pf_envelope_refused'
    return None

def ss_pf_row(value, context):
    record = value['ss_pf_row']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_pf_row_refused'
    return None

def ss_pf_retry(value, context):
    record = value['ss_pf_retry']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_pf_retry_refused'
    return None

def ss_pf_read(value, context):
    record = value['ss_pf_read']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_pf_read_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('ss_pf_outcome', g.Invariant('/ss_pf_outcome', 'Each evaluation commits or refuses exactly as N2-157 and SP-290 decide over the authenticated original inputs.'), 'ss_pf_outcome_refused', ss_pf_outcome),
        g.Guard('ss_pf_decision', g.Invariant('/ss_pf_decision', 'The decision follows source precedence, the closed state and reason products and the not_requested result exactly.'), 'ss_pf_decision_refused', ss_pf_decision),
        g.Guard('ss_pf_ref', g.Invariant('/ss_pf_ref', 'The payload subject is the original request subject and the frozen active catalog revision and entry.'), 'ss_pf_ref_refused', ss_pf_ref),
        g.Guard('ss_pf_identity', g.Invariant('/ss_pf_identity', 'event_id, idempotency_key, physical key and request and frozen-input digests follow SP-290 exactly.'), 'ss_pf_identity_refused', ss_pf_identity),
        g.Guard('ss_pf_envelope', g.Invariant('/ss_pf_envelope', 'The frozen producer input is the original request and context projection with Storage fields absent.'), 'ss_pf_envelope_refused', ss_pf_envelope),
        g.Guard('ss_pf_row', g.Invariant('/ss_pf_row', 'The decision row joins request, catalog selection, minimal source facts, frozen input, Storage assignments and the first receipt.'), 'ss_pf_row_refused', ss_pf_row),
        g.Guard('ss_pf_retry', g.Invariant('/ss_pf_retry', 'A committed retry returns the exact original receipt without authority; a changed request conflicts; deleted custody stays unavailable.'), 'ss_pf_retry_refused', ss_pf_retry),
        g.Guard('ss_pf_read', g.Invariant('/ss_pf_read', 'The passive read returns the retained decision with the complete current marker and live token, or one closed unavailable reason.'), 'ss_pf_read_refused', ss_pf_read),
    ])

    def check(value):
        table.require('ss_pf_outcome', value, context)
        table.require('ss_pf_decision', value, context)
        table.require('ss_pf_ref', value, context)
        table.require('ss_pf_identity', value, context)
        table.require('ss_pf_envelope', value, context)
        table.require('ss_pf_row', value, context)
        table.require('ss_pf_retry', value, context)
        table.require('ss_pf_read', value, context)
        return True
    return g.Case(table, check, context)
