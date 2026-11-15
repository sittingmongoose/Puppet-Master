"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sl_hold_sir(value, context):
    record = value['sl_hold_sir']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_hold_sir_refused'
    return None

def sl_hold_union(value, context):
    record = value['sl_hold_union']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_hold_union_refused'
    return None

def sl_hold_resume(value, context):
    record = value['sl_hold_resume']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_hold_resume_refused'
    return None

def sl_hold_restore(value, context):
    record = value['sl_hold_restore']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_hold_restore_refused'
    return None

def sl_hold_history(value, context):
    record = value['sl_hold_history']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_hold_history_refused'
    return None

def sl_hold_legacy(value, context):
    record = value['sl_hold_legacy']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_hold_legacy_refused'
    return None

def sl_hold_numbers(value, context):
    record = value['sl_hold_numbers']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'sl_hold_numbers_refused'
    return None

def sl_hold_time(value, context):
    record = value['sl_hold_time']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'sl_hold_time_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sl_hold_sir', g.Invariant('/sl_hold_sir', 'A later SIR observation advances only the current source, never regresses progress or time, keeps the original source, and an unacknowledged command cannot append.'), 'sl_hold_sir_refused', sl_hold_sir),
        g.Guard('sl_hold_union', g.Invariant('/sl_hold_union', 'A target is protected while any set_pending, held or clear_pending hold names it; clearing one hold never releases another and nothing clears automatically.'), 'sl_hold_union_refused', sl_hold_union),
        g.Guard('sl_hold_resume', g.Invariant('/sl_hold_resume', 'After first-receipt issuance the original receipt finishes the operation without another append; ambiguous existence and failed commits stay pending and protective with no success.'), 'sl_hold_resume_refused', sl_hold_resume),
        g.Guard('sl_hold_restore', g.Invariant('/sl_hold_restore', 'A restored pending intent resolves only an exact surviving receipt and never first-mints; a new operation needs a command accepted after the post-restore session opened.'), 'sl_hold_restore_refused', sl_hold_restore),
        g.Guard('sl_hold_history', g.Invariant('/sl_hold_history', 'History reports current protection from the same-snapshot row, not from a historical set event, returns unavailable for a missing slot and has no effect.'), 'sl_hold_history_refused', sl_hold_history),
        g.Guard('sl_hold_legacy', g.Invariant('/sl_hold_legacy', 'A legacy v1 legal hold is admitted with its original core hash and a null original set receipt; its later clear emits only the clear event.'), 'sl_hold_legacy_refused', sl_hold_legacy),
        g.Guard('sl_hold_numbers', g.Invariant('/sl_hold_numbers', 'First-receipt integer slots use shared storage_uint64.'), 'sl_hold_numbers_refused', sl_hold_numbers),
        g.Guard('sl_hold_time', g.Invariant('/sl_hold_time', 'SIR capture times use the EventRecord date-time profile.'), 'sl_hold_time_refused', sl_hold_time),
    ])

    def check(value):
        table.require('sl_hold_sir', value, context)
        table.require('sl_hold_union', value, context)
        table.require('sl_hold_resume', value, context)
        table.require('sl_hold_restore', value, context)
        table.require('sl_hold_history', value, context)
        table.require('sl_hold_legacy', value, context)
        table.require('sl_hold_numbers', value, context)
        table.require('sl_hold_time', value, context)
        return True
    return g.Case(table, check, context)
