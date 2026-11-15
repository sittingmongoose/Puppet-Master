"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sl_cmp_publication(value, context):
    record = value['sl_cmp_publication']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_publication_refused'
    return None

def sl_cmp_authority(value, context):
    record = value['sl_cmp_authority']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_authority_refused'
    return None

def sl_cmp_core(value, context):
    record = value['sl_cmp_core']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_core_refused'
    return None

def sl_cmp_restart(value, context):
    record = value['sl_cmp_restart']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_restart_refused'
    return None

def sl_cmp_delivery(value, context):
    record = value['sl_cmp_delivery']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_delivery_refused'
    return None

def sl_cmp_terminal(value, context):
    record = value['sl_cmp_terminal']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_terminal_refused'
    return None

def sl_cmp_detail(value, context):
    record = value['sl_cmp_detail']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_detail_refused'
    return None

def sl_cmp_members(value, context):
    record = value['sl_cmp_members']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_members_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sl_cmp_publication', g.Invariant('/sl_cmp_publication', 'Publication persists pending, seals the carrier, publishes and reads back the manifest, replaces and syncs CURRENT, activates the derived index before the pointer commit, then finalizes.'), 'sl_cmp_publication_refused', sl_cmp_publication),
        g.Guard('sl_cmp_authority', g.Invariant('/sl_cmp_authority', 'Reads select only what synchronized CURRENT selects, never a staged_prefix entry, mtime or lifecycle event, report last-proven history separately and have no effect.'), 'sl_cmp_authority_refused', sl_cmp_authority),
        g.Guard('sl_cmp_core', g.Invariant('/sl_cmp_core', 'Every frozen input event has exactly one survivor or removal outcome, removal needs policy evidence and no current row, survivors keep their bytes and carrier events are outside the outcome set.'), 'sl_cmp_core_refused', sl_cmp_core),
        g.Guard('sl_cmp_restart', g.Invariant('/sl_cmp_restart', 'Restart resumes the same identity at the next proved edge or enters recovery_required, stays fenced in recovery_required, returns a terminal result unchanged and never repeats a physical effect.'), 'sl_cmp_restart_refused', sl_cmp_restart),
        g.Guard('sl_cmp_delivery', g.Invariant('/sl_cmp_delivery', 'Proved observations are delivered in legal predecessor order and a later group waits for the previous first receipt.'), 'sl_cmp_delivery_refused', sl_cmp_delivery),
        g.Guard('sl_cmp_terminal', g.Invariant('/sl_cmp_terminal', 'The terminal result is published only with a proved terminal phase, every attempt disposed, every observation issued and the required aftermath, freezes its first settlement once and replays it unchanged.'), 'sl_cmp_terminal_refused', sl_cmp_terminal),
        g.Guard('sl_cmp_detail', g.Invariant('/sl_cmp_detail', 'Detail is eligible at first settlement + 604800 s inclusive only for a settled operation with no hold, live, backup, rollback, recovery or maintenance protection, with no reset by reads or retries.'), 'sl_cmp_detail_refused', sl_cmp_detail),
        g.Guard('sl_cmp_members', g.Invariant('/sl_cmp_members', 'Retirement targets exactly the eligible detail members and never CURRENT, manifests, active, pending, source, carrier, target or core segments, receipts, dedupe, terminal map or owner values.'), 'sl_cmp_members_refused', sl_cmp_members),
    ])

    def check(value):
        table.require('sl_cmp_publication', value, context)
        table.require('sl_cmp_authority', value, context)
        table.require('sl_cmp_core', value, context)
        table.require('sl_cmp_restart', value, context)
        table.require('sl_cmp_delivery', value, context)
        table.require('sl_cmp_terminal', value, context)
        table.require('sl_cmp_detail', value, context)
        table.require('sl_cmp_members', value, context)
        return True
    return g.Case(table, check, context)
