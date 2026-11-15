"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sl_del_retry(value, context):
    record = value['sl_del_retry']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_del_retry_refused'
    return None

def sl_del_replay(value, context):
    record = value['sl_del_replay']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_del_replay_refused'
    return None

def sl_del_resume(value, context):
    record = value['sl_del_resume']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_del_resume_refused'
    return None

def sl_del_handler(value, context):
    record = value['sl_del_handler']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_del_handler_refused'
    return None

def sl_del_reader(value, context):
    record = value['sl_del_reader']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_del_reader_refused'
    return None

def sl_del_withdrawal(value, context):
    record = value['sl_del_withdrawal']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_del_withdrawal_refused'
    return None

def sl_del_restore(value, context):
    record = value['sl_del_restore']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_del_restore_refused'
    return None

def sl_del_deadline(value, context):
    record = value['sl_del_deadline']
    if record['applies'] is not True:
        return None
    if record['left'] > record['right']:
        return 'sl_del_deadline_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sl_del_retry', g.Invariant('/sl_del_retry', 'A retry after failed reuses deletion_id and the request key, takes the next ordinal, revalidates every authority first and never bypasses to purge_pending or purged.'), 'sl_del_retry_refused', sl_del_retry),
        g.Guard('sl_del_replay', g.Invariant('/sl_del_replay', 'Same identity and digest returns the original receipt and result; a different digest conflicts; unavailable dedupe and projector_replay_only refuse with zero effects.'), 'sl_del_replay_refused', sl_del_replay),
        g.Guard('sl_del_resume', g.Invariant('/sl_del_resume', 'A crash before the append resumes the same obligation once; after the commit frame it resolves the original receipt and never appends, hides, purges or re-evaluates holds again.'), 'sl_del_resume_refused', sl_del_resume),
        g.Guard('sl_del_handler', g.Invariant('/sl_del_handler', 'Handlers only submit; remove-from-list is a registry tombstone only; Project-data deletion needs its separate confirmation.'), 'sl_del_handler_refused', sl_del_handler),
        g.Guard('sl_del_reader', g.Invariant('/sl_del_reader', 'History is available only with complete coverage and a verified token, otherwise unavailable; canonical readers use the deletion record, never the event.'), 'sl_del_reader_refused', sl_del_reader),
        g.Guard('sl_del_withdrawal', g.Invariant('/sl_del_withdrawal', 'Withdrawal resolves durable obligations by their original receipt, fences the rest, keeps every record, tombstone and receipt and never deletes, restores or un-hides.'), 'sl_del_withdrawal_refused', sl_del_withdrawal),
        g.Guard('sl_del_restore', g.Invariant('/sl_del_restore', 'Restore replays tombstones before visibility, never shows a deleted subject and keeps backup bytes at most 30 days unless held.'), 'sl_del_restore_refused', sl_del_restore),
        g.Guard('sl_del_deadline', g.Invariant('/sl_del_deadline', 'A thread deletion purge deadline is no later than 24 hours after the request.'), 'sl_del_deadline_refused', sl_del_deadline),
    ])

    def check(value):
        table.require('sl_del_retry', value, context)
        table.require('sl_del_replay', value, context)
        table.require('sl_del_resume', value, context)
        table.require('sl_del_handler', value, context)
        table.require('sl_del_reader', value, context)
        table.require('sl_del_withdrawal', value, context)
        table.require('sl_del_restore', value, context)
        table.require('sl_del_deadline', value, context)
        return True
    return g.Case(table, check, context)
