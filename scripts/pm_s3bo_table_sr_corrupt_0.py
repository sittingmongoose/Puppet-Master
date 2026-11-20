"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sr_cor_outcome(value, context):
    record = value['sr_cor_outcome']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cor_outcome_refused'
    return None

def sr_cor_events(value, context):
    record = value['sr_cor_events']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cor_events_refused'
    return None

def sr_cor_payload(value, context):
    record = value['sr_cor_payload']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cor_payload_refused'
    return None

def sr_cor_evidence(value, context):
    record = value['sr_cor_evidence']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cor_evidence_refused'
    return None

def sr_cor_order(value, context):
    record = value['sr_cor_order']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cor_order_refused'
    return None

def sr_cor_identity(value, context):
    record = value['sr_cor_identity']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cor_identity_refused'
    return None

def sr_cor_thread(value, context):
    record = value['sr_cor_thread']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cor_thread_refused'
    return None

def sr_cor_terminal(value, context):
    record = value['sr_cor_terminal']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cor_terminal_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sr_cor_outcome', g.Invariant('/sr_cor_outcome', 'Detection follows the fixed precedence: missing and indeterminate stop, then record hash, decode, material integrity, content scope; no fifth reason.'), 'sr_cor_outcome_refused', sr_cor_outcome),
        g.Guard('sr_cor_events', g.Invariant('/sr_cor_events', 'Exactly one corrupt event per point, appended only by the owner commit of a finding; readers, re-detection, replay and refusals append nothing.'), 'sr_cor_events_refused', sr_cor_events),
        g.Guard('sr_cor_payload', g.Invariant('/sr_cor_payload', 'The appended payload carries the reason, its paired evidence kind and exactly the branch fields derived from the attested inputs.'), 'sr_cor_payload_refused', sr_cor_payload),
        g.Guard('sr_cor_evidence', g.Invariant('/sr_cor_evidence', 'The commit holds the complete attested FileSafe evidence for this point and material: refs, lowercase hashes and lengths only.'), 'sr_cor_evidence_refused', sr_cor_evidence),
        g.Guard('sr_cor_order', g.Invariant('/sr_cor_order', 'Steps run attest, re-read, commit, barrier append, first receipt, publish; stops and refusals end before any commit.'), 'sr_cor_order_refused', sr_cor_order),
        g.Guard('sr_cor_identity', g.Invariant('/sr_cor_identity', 'corruption_id, event_id and the EventRecord key follow the rpx_ recipe of project and point.'), 'sr_cor_identity_refused', sr_cor_identity),
        g.Guard('sr_cor_thread', g.Invariant('/sr_cor_thread', 'Envelope thread and commit source thread are the point source thread when the record is readable, else null.'), 'sr_cor_thread_refused', sr_cor_thread),
        g.Guard('sr_cor_terminal', g.Invariant('/sr_cor_terminal', 'A deletion or expiry commit excludes a corruption commit, and a settled corruption refuses later branch, delete and expire.'), 'sr_cor_terminal_refused', sr_cor_terminal),
    ])

    def check(value):
        table.require('sr_cor_outcome', value, context)
        table.require('sr_cor_events', value, context)
        table.require('sr_cor_payload', value, context)
        table.require('sr_cor_evidence', value, context)
        table.require('sr_cor_order', value, context)
        table.require('sr_cor_identity', value, context)
        table.require('sr_cor_thread', value, context)
        table.require('sr_cor_terminal', value, context)
        return True
    return g.Case(table, check, context)
