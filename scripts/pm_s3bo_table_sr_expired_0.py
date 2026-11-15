"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sr_exp_eligible(value, context):
    record = value['sr_exp_eligible']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_exp_eligible_refused'
    return None

def sr_exp_events(value, context):
    record = value['sr_exp_events']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_exp_events_refused'
    return None

def sr_exp_order(value, context):
    record = value['sr_exp_order']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_exp_order_refused'
    return None

def sr_exp_point(value, context):
    record = value['sr_exp_point']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_exp_point_refused'
    return None

def sr_exp_identity(value, context):
    record = value['sr_exp_identity']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_exp_identity_refused'
    return None

def sr_exp_payload(value, context):
    record = value['sr_exp_payload']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_exp_payload_refused'
    return None

def sr_exp_evidence(value, context):
    record = value['sr_exp_evidence']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_exp_evidence_refused'
    return None

def sr_exp_resume(value, context):
    record = value['sr_exp_resume']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_exp_resume_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sr_exp_eligible', g.Invariant('/sr_exp_eligible', 'Expiry happens exactly when the point is available, hash-authenticated, at or after the inclusive boundary, every protecting class is clear, the policy is the exact row and evidence is present.'), 'sr_exp_eligible_refused', sr_exp_eligible),
        g.Guard('sr_exp_events', g.Invariant('/sr_exp_events', 'One expiry appends exactly one restore_point.expired by E2; refusals, replay and resumption after E2 append nothing.'), 'sr_exp_events_refused', sr_exp_events),
        g.Guard('sr_exp_order', g.Invariant('/sr_exp_order', 'Steps run eligibility, E1, E2 append, first receipt, E3, publish; a resumption continues from the pending intent.'), 'sr_exp_order_refused', sr_exp_order),
        g.Guard('sr_exp_point', g.Invariant('/sr_exp_point', 'E1 moves only available to expired; nothing rolls back, rewrites the record hash or clears a hold.'), 'sr_exp_point_refused', sr_exp_point),
        g.Guard('sr_exp_identity', g.Invariant('/sr_exp_identity', 'expiry_id, event_id and the EventRecord key follow the rpe_ recipe over project, point and original record hash.'), 'sr_exp_identity_refused', sr_exp_identity),
        g.Guard('sr_exp_payload', g.Invariant('/sr_exp_payload', 'The payload joins the original hash, the exact policy row and the frozen admission release-evidence list.'), 'sr_exp_payload_refused', sr_exp_payload),
        g.Guard('sr_exp_evidence', g.Invariant('/sr_exp_evidence', "The commit's eligibility is the owner's complete evaluation: selection, release fact and all eleven protecting classes."), 'sr_exp_evidence_refused', sr_exp_evidence),
        g.Guard('sr_exp_resume', g.Invariant('/sr_exp_resume', 'Recovery after E1 resolves the same identity with the frozen input unchanged; it never recaptures or substitutes a result.'), 'sr_exp_resume_refused', sr_exp_resume),
    ])

    def check(value):
        table.require('sr_exp_eligible', value, context)
        table.require('sr_exp_events', value, context)
        table.require('sr_exp_order', value, context)
        table.require('sr_exp_point', value, context)
        table.require('sr_exp_identity', value, context)
        table.require('sr_exp_payload', value, context)
        table.require('sr_exp_evidence', value, context)
        table.require('sr_exp_resume', value, context)
        return True
    return g.Case(table, check, context)
