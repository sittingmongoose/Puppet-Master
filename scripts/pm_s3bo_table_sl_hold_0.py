"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sl_hold_admission(value, context):
    record = value['sl_hold_admission']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_hold_admission_refused'
    return None

def sl_hold_zero(value, context):
    record = value['sl_hold_zero']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_hold_zero_refused'
    return None

def sl_hold_identity(value, context):
    record = value['sl_hold_identity']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_hold_identity_refused'
    return None

def sl_hold_event(value, context):
    record = value['sl_hold_event']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_hold_event_refused'
    return None

def sl_hold_core(value, context):
    record = value['sl_hold_core']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_hold_core_refused'
    return None

def sl_hold_phase(value, context):
    record = value['sl_hold_phase']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_hold_phase_refused'
    return None

def sl_hold_result(value, context):
    record = value['sl_hold_result']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_hold_result_refused'
    return None

def sl_hold_order(value, context):
    record = value['sl_hold_order']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_hold_order_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sl_hold_admission', g.Invariant('/sl_hold_admission', 'Each command is refused at the first failing admission condition (writer, installed versions, authenticated SIR, post-restore acceptance, permission, reason, resolved target with canonical refs and exact scope, expected core hash, set absence or active legal-hold preimage); otherwise it replays, conflicts, stays pending or commits.'), 'sl_hold_admission_refused', sl_hold_admission),
        g.Guard('sl_hold_zero', g.Invariant('/sl_hold_zero', 'A refusal, conflict or replay appends nothing, leaves the whole hold row unchanged and takes no hold action.'), 'sl_hold_zero_refused', sl_hold_zero),
        g.Guard('sl_hold_identity', g.Invariant('/sl_hold_identity', 'Transition id, evt_hold_ event id, idempotency key and logical receipt follow the SP-288 recipes over the original request, target and preimage core.'), 'sl_hold_identity_refused', sl_hold_identity),
        g.Guard('sl_hold_event', g.Invariant('/sl_hold_event', 'The appended EventRecord equals the original producer intent: action, actor, reason, accepted time, held-target policy, anchor and affected refs, receipt, Project only for Project scope.'), 'sl_hold_event_refused', sl_hold_event),
        g.Guard('sl_hold_core', g.Invariant('/sl_hold_core', 'Set creates the immutable set core; clear preserves every set field and adds only its clear fields and event; other holds are untouched.'), 'sl_hold_core_refused', sl_hold_core),
        g.Guard('sl_hold_phase', g.Invariant('/sl_hold_phase', 'Phases run set_pending -> held and clear_pending -> cleared, pending stays protective, a cleared id is terminal, one set and at most one clear.'), 'sl_hold_phase_refused', sl_hold_phase),
        g.Guard('sl_hold_result', g.Invariant('/sl_hold_result', 'The OwnerResult binds command, key, action, status, event, receipt and committed core hash, and SIR success is published only after committed readback.'), 'sl_hold_result_refused', sl_hold_result),
        g.Guard('sl_hold_order', g.Invariant('/sl_hold_order', 'Fence capture and pending admission precede acknowledgement capture, the single barrier append, first receipt, terminal commit, readback and publication.'), 'sl_hold_order_refused', sl_hold_order),
    ])

    def check(value):
        table.require('sl_hold_admission', value, context)
        table.require('sl_hold_zero', value, context)
        table.require('sl_hold_identity', value, context)
        table.require('sl_hold_event', value, context)
        table.require('sl_hold_core', value, context)
        table.require('sl_hold_phase', value, context)
        table.require('sl_hold_result', value, context)
        table.require('sl_hold_order', value, context)
        return True
    return g.Case(table, check, context)
