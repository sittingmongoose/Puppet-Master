"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def ss_boot_outcome(value, context):
    record = value['ss_boot_outcome']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_boot_outcome_refused'
    return None

def ss_boot_events(value, context):
    record = value['ss_boot_events']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_boot_events_refused'
    return None

def ss_boot_workset(value, context):
    record = value['ss_boot_workset']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_boot_workset_refused'
    return None

def ss_boot_identity(value, context):
    record = value['ss_boot_identity']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_boot_identity_refused'
    return None

def ss_boot_repeat(value, context):
    record = value['ss_boot_repeat']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_boot_repeat_refused'
    return None

def ss_boot_floor(value, context):
    record = value['ss_boot_floor']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_boot_floor_refused'
    return None

def ss_boot_anchor(value, context):
    record = value['ss_boot_anchor']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_boot_anchor_refused'
    return None

def ss_boot_earliest(value, context):
    record = value['ss_boot_earliest']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_boot_earliest_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('ss_boot_outcome', g.Invariant('/ss_boot_outcome', 'Each episode issues, replays, settles no_obligation or refuses exactly as SP-291, SP-292 and SP-2205 decide.'), 'ss_boot_outcome_refused', ss_boot_outcome),
        g.Guard('ss_boot_events', g.Invariant('/ss_boot_events', 'An issued episode appends exactly one Boot event; replay, no-work, refusal and restored pending intents append none.'), 'ss_boot_events_refused', ss_boot_events),
        g.Guard('ss_boot_workset', g.Invariant('/ss_boot_workset', 'The payload work set is the sorted unique union of the captured members, and the epoch, manifest and segment are the episode values.'), 'ss_boot_workset_refused', ss_boot_workset),
        g.Guard('ss_boot_identity', g.Invariant('/ss_boot_identity', 'W, S, event_id, idempotency_key, recovery_set_id and the publish actor follow SP-291 exactly.'), 'ss_boot_identity_refused', ss_boot_identity),
        g.Guard('ss_boot_repeat', g.Invariant('/ss_boot_repeat', 'repeat_of names the earliest matching original event by original sequence, and is absent for the first episode.'), 'ss_boot_repeat_refused', ss_boot_repeat),
        g.Guard('ss_boot_floor', g.Invariant('/ss_boot_floor', 'Every floor transition is exact: one issuance step for a complete floor, revision only for an unavailable one, continuity after restore.'), 'ss_boot_floor_refused', ss_boot_floor),
        g.Guard('ss_boot_anchor', g.Invariant('/ss_boot_anchor', 'The external anchor equals the published complete floor, consumes its pending replacement and never rolls back.'), 'ss_boot_anchor_refused', ss_boot_anchor),
        g.Guard('ss_boot_earliest', g.Invariant('/ss_boot_earliest', 'resolve_earliest returns the minimum original sequence row for W with its original receipt, or unavailable.'), 'ss_boot_earliest_refused', ss_boot_earliest),
    ])

    def check(value):
        table.require('ss_boot_outcome', value, context)
        table.require('ss_boot_events', value, context)
        table.require('ss_boot_workset', value, context)
        table.require('ss_boot_identity', value, context)
        table.require('ss_boot_repeat', value, context)
        table.require('ss_boot_floor', value, context)
        table.require('ss_boot_anchor', value, context)
        table.require('ss_boot_earliest', value, context)
        return True
    return g.Case(table, check, context)
