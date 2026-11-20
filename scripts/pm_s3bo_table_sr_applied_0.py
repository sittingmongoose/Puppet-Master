"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sr_app_result(value, context):
    record = value['sr_app_result']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_app_result_refused'
    return None

def sr_app_reason(value, context):
    record = value['sr_app_reason']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_app_reason_refused'
    return None

def sr_app_record(value, context):
    record = value['sr_app_record']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_app_record_refused'
    return None

def sr_app_events(value, context):
    record = value['sr_app_events']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_app_events_refused'
    return None

def sr_app_branches(value, context):
    record = value['sr_app_branches']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_app_branches_refused'
    return None

def sr_app_targets(value, context):
    record = value['sr_app_targets']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_app_targets_refused'
    return None

def sr_app_order(value, context):
    record = value['sr_app_order']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_app_order_refused'
    return None

def sr_app_replay(value, context):
    record = value['sr_app_replay']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_app_replay_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sr_app_result', g.Invariant('/sr_app_result', 'Only an admitted first execution or its resumption returns branched; every failed precondition returns refused or failed.'), 'sr_app_result_refused', sr_app_result),
        g.Guard('sr_app_reason', g.Invariant('/sr_app_reason', 'A non-branched result carries the exact UCC-126 reason token where one is named, otherwise a non-empty reason; branched carries none.'), 'sr_app_reason_refused', sr_app_reason),
        g.Guard('sr_app_record', g.Invariant('/sr_app_record', 'The commit row records exactly the step reached: absent before step 2, pending through step 3, branched from step 4, terminal for a step-2 refusal.'), 'sr_app_record_refused', sr_app_record),
        g.Guard('sr_app_events', g.Invariant('/sr_app_events', 'Exactly one restore_point.applied is appended per application, only by the step-5 append of a branched row.'), 'sr_app_events_refused', sr_app_events),
        g.Guard('sr_app_branches', g.Invariant('/sr_app_branches', 'Materialization creates exactly the reserved thread/branch pair once; a resumed step adopts its own creation.'), 'sr_app_branches_refused', sr_app_branches),
        g.Guard('sr_app_targets', g.Invariant('/sr_app_targets', 'An execution returns the reserved target pair only for branched, never for refused or failed.'), 'sr_app_targets_refused', sr_app_targets),
        g.Guard('sr_app_order', g.Invariant('/sr_app_order', 'Steps run in the exact SP-2202 order for the run kind; the result is published only after the first receipt.'), 'sr_app_order_refused', sr_app_order),
        g.Guard('sr_app_replay', g.Invariant('/sr_app_replay', 'Replay returns the recorded result, targets and original receipt, and the commit row is unchanged.'), 'sr_app_replay_refused', sr_app_replay),
    ])

    def check(value):
        table.require('sr_app_result', value, context)
        table.require('sr_app_reason', value, context)
        table.require('sr_app_record', value, context)
        table.require('sr_app_events', value, context)
        table.require('sr_app_branches', value, context)
        table.require('sr_app_targets', value, context)
        table.require('sr_app_order', value, context)
        table.require('sr_app_replay', value, context)
        return True
    return g.Case(table, check, context)
