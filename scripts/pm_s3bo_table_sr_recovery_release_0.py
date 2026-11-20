"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sr_sru_outcome(value, context):
    record = value['sr_sru_outcome']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_sru_outcome_refused'
    return None

def sr_sru_receipt_reason(value, context):
    record = value['sr_sru_receipt_reason']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_sru_receipt_reason_refused'
    return None

def sr_sru_release(value, context):
    record = value['sr_sru_release']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_sru_release_refused'
    return None

def sr_sru_snapshots(value, context):
    record = value['sr_sru_snapshots']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_sru_snapshots_refused'
    return None

def sr_sru_replay(value, context):
    record = value['sr_sru_replay']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_sru_replay_refused'
    return None

def sr_sru_conflict(value, context):
    record = value['sr_sru_conflict']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_sru_conflict_refused'
    return None

def sr_sru_no_release(value, context):
    record = value['sr_sru_no_release']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_sru_no_release_refused'
    return None

def sr_sru_effects(value, context):
    record = value['sr_sru_effects']
    if record['applies'] is not True:
        return None
    if record['left'] != []:
        return 'sr_sru_effects_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sr_sru_outcome', g.Invariant('/sr_sru_outcome', 'A command succeeds only with every owner admission and verification or confirmation satisfied; anything else is a nonsuccess.'), 'sr_sru_outcome_refused', sr_sru_outcome),
        g.Guard('sr_sru_receipt_reason', g.Invariant('/sr_sru_receipt_reason', 'A nonsuccess carries the exact owner reason token where one is named, otherwise a non-null reason; success carries none.'), 'sr_sru_receipt_reason_refused', sr_sru_receipt_reason),
        g.Guard('sr_sru_release', g.Invariant('/sr_sru_release', 'The anchor releases only by its three closed reasons, each only after its own durable evidence.'), 'sr_sru_release_refused', sr_sru_release),
        g.Guard('sr_sru_snapshots', g.Invariant('/sr_sru_snapshots', 'Before refs equal the admitted anchor set; locate success records the verified set; abandonment and nonsuccess preserve it.'), 'sr_sru_snapshots_refused', sr_sru_snapshots),
        g.Guard('sr_sru_replay', g.Invariant('/sr_sru_replay', 'Replay of the same request and key returns the original receipt byte-for-byte with no second transition.'), 'sr_sru_replay_refused', sr_sru_replay),
        g.Guard('sr_sru_conflict', g.Invariant('/sr_sru_conflict', 'A different request digest under one key is invalid_args and never overwrites the original receipt.'), 'sr_sru_conflict_refused', sr_sru_conflict),
        g.Guard('sr_sru_no_release', g.Invariant('/sr_sru_no_release', 'Age, exit, archive, completion, unbinding, compaction, pressure, cleanup and withdrawal never release; restore and retry refuse.'), 'sr_sru_no_release_refused', sr_sru_no_release),
        g.Guard('sr_sru_effects', g.Invariant('/sr_sru_effects', 'No resolution performs cleanup, deletion, abort_run, worktree detachment or a higher-level terminal transition.'), 'sr_sru_effects_refused', sr_sru_effects),
    ])

    def check(value):
        table.require('sr_sru_outcome', value, context)
        table.require('sr_sru_receipt_reason', value, context)
        table.require('sr_sru_release', value, context)
        table.require('sr_sru_snapshots', value, context)
        table.require('sr_sru_replay', value, context)
        table.require('sr_sru_conflict', value, context)
        table.require('sr_sru_no_release', value, context)
        table.require('sr_sru_effects', value, context)
        return True
    return g.Case(table, check, context)
