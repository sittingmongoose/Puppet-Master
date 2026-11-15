"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sl_qtn_envelope(value, context):
    record = value['sl_qtn_envelope']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_qtn_envelope_refused'
    return None

def sl_qtn_retire(value, context):
    record = value['sl_qtn_retire']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_qtn_retire_refused'
    return None

def sl_qtn_cap(value, context):
    record = value['sl_qtn_cap']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_qtn_cap_refused'
    return None

def sl_qtn_disclosure(value, context):
    record = value['sl_qtn_disclosure']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_qtn_disclosure_refused'
    return None

def sl_qtn_restore(value, context):
    record = value['sl_qtn_restore']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_qtn_restore_refused'
    return None

def sl_qtn_resume(value, context):
    record = value['sl_qtn_resume']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_qtn_resume_refused'
    return None

def sl_qtn_withdrawal(value, context):
    record = value['sl_qtn_withdrawal']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_qtn_withdrawal_refused'
    return None

def sl_qtn_replay(value, context):
    record = value['sl_qtn_replay']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_qtn_replay_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sl_qtn_envelope', g.Invariant('/sl_qtn_envelope', 'The envelope names a thread only when the quarantined value belongs to it; Project id null exactly when the payload omits it.'), 'sl_qtn_envelope_refused', sl_qtn_envelope),
        g.Guard('sl_qtn_retire', g.Invariant('/sl_qtn_retire', 'Operational records retire only after the purge, its event and first receipt settle and every dependency is released; the audit shows the purge with Source evidence unavailable and opens nothing.'), 'sl_qtn_retire_refused', sl_qtn_retire),
        g.Guard('sl_qtn_cap', g.Invariant('/sl_qtn_cap', 'Cap pressure never evicts an unresolved item, and for Q-CRITICAL blocks new mutation-capable writes.'), 'sl_qtn_cap_refused', sl_qtn_cap),
        g.Guard('sl_qtn_disclosure', g.Invariant('/sl_qtn_disclosure', 'A viewer without read access to the source sees only that a value was quarantined; raw bytes leave only through permitted protected explicit export.'), 'sl_qtn_disclosure_refused', sl_qtn_disclosure),
        g.Guard('sl_qtn_restore', g.Invariant('/sl_qtn_restore', 'Restore brings back the raw custody with the record or reports it unavailable, and never re-runs a live-key effect.'), 'sl_qtn_restore_refused', sl_qtn_restore),
        g.Guard('sl_qtn_resume', g.Invariant('/sl_qtn_resume', 'A crash resumes the obligation or resolves the original receipt; it never re-copies raw bytes over another capture, repeats a live-key effect, purges twice or appends twice.'), 'sl_qtn_resume_refused', sl_qtn_resume),
        g.Guard('sl_qtn_withdrawal', g.Invariant('/sl_qtn_withdrawal', 'Withdrawal resolves or fences pending obligations, keeps record, raw custody and receipts and never releases, resets or purges a value.'), 'sl_qtn_withdrawal_refused', sl_qtn_withdrawal),
        g.Guard('sl_qtn_replay', g.Invariant('/sl_qtn_replay', 'Same identity and digest returns the original result; a different digest conflicts; unavailable dedupe and projector_replay_only refuse with zero effects.'), 'sl_qtn_replay_refused', sl_qtn_replay),
    ])

    def check(value):
        table.require('sl_qtn_envelope', value, context)
        table.require('sl_qtn_retire', value, context)
        table.require('sl_qtn_cap', value, context)
        table.require('sl_qtn_disclosure', value, context)
        table.require('sl_qtn_restore', value, context)
        table.require('sl_qtn_resume', value, context)
        table.require('sl_qtn_withdrawal', value, context)
        table.require('sl_qtn_replay', value, context)
        return True
    return g.Case(table, check, context)
