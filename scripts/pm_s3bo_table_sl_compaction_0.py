"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sl_cmp_admission(value, context):
    record = value['sl_cmp_admission']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_admission_refused'
    return None

def sl_cmp_graph(value, context):
    record = value['sl_cmp_graph']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_graph_refused'
    return None

def sl_cmp_phase(value, context):
    record = value['sl_cmp_phase']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_phase_refused'
    return None

def sl_cmp_disposition(value, context):
    record = value['sl_cmp_disposition']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_disposition_refused'
    return None

def sl_cmp_identity(value, context):
    record = value['sl_cmp_identity']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_identity_refused'
    return None

def sl_cmp_event(value, context):
    record = value['sl_cmp_event']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_event_refused'
    return None

def sl_cmp_actions(value, context):
    record = value['sl_cmp_actions']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_actions_refused'
    return None

def sl_cmp_aftermath(value, context):
    record = value['sl_cmp_aftermath']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_aftermath_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sl_cmp_admission', g.Invariant('/sl_cmp_admission', 'Admission resolves the command against live journals and terminal mappings first (rejoin, conflict or unavailable), then mints the nonce compaction_id with target generation exactly source + 1 and the carrier outside the frozen inputs.'), 'sl_cmp_admission_refused', sl_cmp_admission),
        g.Guard('sl_cmp_graph', g.Invariant('/sl_cmp_graph', 'Every reserved edge is in the complete adjacency from the last proved phase; initial preparing has ordinal zero and no edge leaves finalized or failed.'), 'sl_cmp_graph_refused', sl_cmp_graph),
        g.Guard('sl_cmp_phase', g.Invariant('/sl_cmp_phase', 'An edge is proved only with its phase postcondition: frozen header, source-authoritative build and verification, durable pending with unchanged CURRENT, target CURRENT with complete activation, complete finalization, proven source authority for failed, ambiguity for recovery_required.'), 'sl_cmp_phase_refused', sl_cmp_phase),
        g.Guard('sl_cmp_disposition', g.Invariant('/sl_cmp_disposition', 'An unprovable reservation is closed without observation and the actual exceptional successor is proved from the last proved phase at a fresh ordinal; ordinals never repeat.'), 'sl_cmp_disposition_refused', sl_cmp_disposition),
        g.Guard('sl_cmp_identity', g.Invariant('/sl_cmp_identity', 'Transition ids and the evt_storage_compaction_ event id and key follow the HMP recipe over compaction_id, ordinal, predecessor, from and to.'), 'sl_cmp_identity_refused', sl_cmp_identity),
        g.Guard('sl_cmp_event', g.Invariant('/sl_cmp_event', 'The frozen producer joins the header refs, policy and selected modes, carries failure_reason only for recovery_required and failed, the initiator actor and correlation and the proof capture time.'), 'sl_cmp_event_refused', sl_cmp_event),
        g.Guard('sl_cmp_actions', g.Invariant('/sl_cmp_actions', 'translate_by_semantic_identity only with a matching survivor digest and every position resolved by semantic identity; activate_verified_target_shadow only with a complete verified target shadow.'), 'sl_cmp_actions_refused', sl_cmp_actions),
        g.Guard('sl_cmp_aftermath', g.Invariant('/sl_cmp_aftermath', 'Committed and finalized apply the selected outcomes, only finalized claims success, recovery_required stays fenced, failed activates nothing, and no phase deletes the old source.'), 'sl_cmp_aftermath_refused', sl_cmp_aftermath),
    ])

    def check(value):
        table.require('sl_cmp_admission', value, context)
        table.require('sl_cmp_graph', value, context)
        table.require('sl_cmp_phase', value, context)
        table.require('sl_cmp_disposition', value, context)
        table.require('sl_cmp_identity', value, context)
        table.require('sl_cmp_event', value, context)
        table.require('sl_cmp_actions', value, context)
        table.require('sl_cmp_aftermath', value, context)
        return True
    return g.Case(table, check, context)
