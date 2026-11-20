"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def ss_rec_identity(value, context):
    record = value['ss_rec_identity']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_rec_identity_refused'
    return None

def ss_rec_projection(value, context):
    record = value['ss_rec_projection']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_rec_projection_refused'
    return None

def ss_rec_payload(value, context):
    record = value['ss_rec_payload']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_rec_payload_refused'
    return None

def ss_rec_phase(value, context):
    record = value['ss_rec_phase']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_rec_phase_refused'
    return None

def ss_rec_immutable(value, context):
    record = value['ss_rec_immutable']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_rec_immutable_refused'
    return None

def ss_rec_events(value, context):
    record = value['ss_rec_events']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_rec_events_refused'
    return None

def ss_rec_receipt(value, context):
    record = value['ss_rec_receipt']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_rec_receipt_refused'
    return None

def ss_rec_aftermath(value, context):
    record = value['ss_rec_aftermath']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_rec_aftermath_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('ss_rec_identity', g.Invariant('/ss_rec_identity', 'input, prepared and physical-receipt MP digests and every derived identity follow SP-293 exactly.'), 'ss_rec_identity_refused', ss_rec_identity),
        g.Guard('ss_rec_projection', g.Invariant('/ss_rec_projection', 'The frozen producer input is the application Storage projection of the physical receipt and original actor.'), 'ss_rec_projection_refused', ss_rec_projection),
        g.Guard('ss_rec_payload', g.Invariant('/ss_rec_payload', 'The frozen payload is the physical receipt effect payload plus its durability reference.'), 'ss_rec_payload_refused', ss_rec_payload),
        g.Guard('ss_rec_phase', g.Invariant('/ss_rec_phase', 'Capsule phases follow the closed graph; recovery_required keeps the last proven phase; committed never reopens; revisions advance by one.'), 'ss_rec_phase_refused', ss_rec_phase),
        g.Guard('ss_rec_immutable', g.Invariant('/ss_rec_immutable', 'Input, actor, admission, prepared result, intent, physical receipt, frozen input and reservation never change once captured.'), 'ss_rec_immutable_refused', ss_rec_immutable),
        g.Guard('ss_rec_events', g.Invariant('/ss_rec_events', 'Exactly one append, at the commit step; a resumed commit replays the original receipt with no append.'), 'ss_rec_events_refused', ss_rec_events),
        g.Guard('ss_rec_receipt', g.Invariant('/ss_rec_receipt', 'The committed capsule, shared custody, publish.v1 response and stored event join one original first receipt.'), 'ss_rec_receipt_refused', ss_rec_receipt),
        g.Guard('ss_rec_aftermath', g.Invariant('/ss_rec_aftermath', 'Aftermath follows a verified receipt with no newer block, through the projector CAS by action class, and repeats nothing.'), 'ss_rec_aftermath_refused', ss_rec_aftermath),
    ])

    def check(value):
        table.require('ss_rec_identity', value, context)
        table.require('ss_rec_projection', value, context)
        table.require('ss_rec_payload', value, context)
        table.require('ss_rec_phase', value, context)
        table.require('ss_rec_immutable', value, context)
        table.require('ss_rec_events', value, context)
        table.require('ss_rec_receipt', value, context)
        table.require('ss_rec_aftermath', value, context)
        return True
    return g.Case(table, check, context)
