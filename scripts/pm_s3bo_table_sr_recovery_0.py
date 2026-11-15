"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sr_sru_order(value, context):
    record = value['sr_sru_order']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_sru_order_refused'
    return None

def sr_sru_reason(value, context):
    record = value['sr_sru_reason']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_sru_reason_refused'
    return None

def sr_sru_actions(value, context):
    record = value['sr_sru_actions']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_sru_actions_refused'
    return None

def sr_sru_attempt(value, context):
    record = value['sr_sru_attempt']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_sru_attempt_refused'
    return None

def sr_sru_anchor(value, context):
    record = value['sr_sru_anchor']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_sru_anchor_refused'
    return None

def sr_sru_episode(value, context):
    record = value['sr_sru_episode']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_sru_episode_refused'
    return None

def sr_sru_events(value, context):
    record = value['sr_sru_events']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_sru_events_refused'
    return None

def sr_sru_identity(value, context):
    record = value['sr_sru_identity']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_sru_identity_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sr_sru_order', g.Invariant('/sr_sru_order', 'Establishment runs classify, durability commit, barrier append, first receipt, then offers actions; resumption never reclassifies.'), 'sr_sru_order_refused', sr_sru_order),
        g.Guard('sr_sru_reason', g.Invariant('/sr_sru_reason', "The payload reason is FileSafe's classification, one of the five; recovery and re-detection never change it."), 'sr_sru_reason_refused', sr_sru_reason),
        g.Guard('sr_sru_actions', g.Invariant('/sr_sru_actions', 'The action array is the exact owner order, with start_fresh_attempt only when the isolated baseline predicate holds; the UI offers it unchanged.'), 'sr_sru_actions_refused', sr_sru_actions),
        g.Guard('sr_sru_attempt', g.Invariant('/sr_sru_attempt', 'Pre-attempt surfaces omit or null attempt_id; post-attempt surfaces carry the exact prior attempt everywhere.'), 'sr_sru_attempt_refused', sr_sru_attempt),
        g.Guard('sr_sru_anchor', g.Invariant('/sr_sru_anchor', 'The anchor joins the episode facts, names this event as set_event_ref and is recovery_unavailable until a release.'), 'sr_sru_anchor_refused', sr_sru_anchor),
        g.Guard('sr_sru_episode', g.Invariant('/sr_sru_episode', 'The payload carries the Executor episode facts, the anchor key and preserved local work exactly.'), 'sr_sru_episode_refused', sr_sru_episode),
        g.Guard('sr_sru_events', g.Invariant('/sr_sru_events', 'One episode appends exactly one event, after the durability commit; no resolution appends any EventRecord.'), 'sr_sru_events_refused', sr_sru_events),
        g.Guard('sr_sru_identity', g.Invariant('/sr_sru_identity', 'event_id and the EventRecord key follow the sru_ recipe of the anchor; re-detection mints nothing.'), 'sr_sru_identity_refused', sr_sru_identity),
    ])

    def check(value):
        table.require('sr_sru_order', value, context)
        table.require('sr_sru_reason', value, context)
        table.require('sr_sru_actions', value, context)
        table.require('sr_sru_attempt', value, context)
        table.require('sr_sru_anchor', value, context)
        table.require('sr_sru_episode', value, context)
        table.require('sr_sru_events', value, context)
        table.require('sr_sru_identity', value, context)
        return True
    return g.Case(table, check, context)
