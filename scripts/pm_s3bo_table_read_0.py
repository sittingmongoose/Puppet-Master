"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def stored_token(value, context):
    record = value['stored_token']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'stored_token_refused'
    return None

def live_snapshot(value, context):
    record = value['live_snapshot']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'live_snapshot_refused'
    return None

def token_join(value, context):
    record = value['token_join']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'token_join_refused'
    return None

def source_selection(value, context):
    record = value['source_selection']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'source_selection_refused'
    return None

def coverage(value, context):
    record = value['coverage']
    if record['applies'] is not True:
        return None
    if record['left'] not in record['right']:
        return 'coverage_refused'
    return None

def read_permission(value, context):
    record = value['read_permission']
    if record['applies'] is not True:
        return None
    if record['left'] not in record['right']:
        return 'read_permission_refused'
    return None

def deletion_fence(value, context):
    record = value['deletion_fence']
    if record['applies'] is not True:
        return None
    if record['left'] in record['right']:
        return 'deletion_fence_refused'
    return None

def passive_reads(value, context):
    record = value['passive_reads']
    if record['applies'] is not True:
        return None
    if record['left'] != []:
        return 'passive_reads_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('stored_token', g.Invariant('/stored_token', 'Stored read token is exactly DL-076 nine fields.'), 'stored_token_refused', stored_token),
        g.Guard('live_snapshot', g.Invariant('/live_snapshot', 'Live disclosure joins the actual current snapshot, never a stored snapshot.'), 'live_snapshot_refused', live_snapshot),
        g.Guard('token_join', g.Invariant('/token_join', 'Each durable token value matches the current live token.'), 'token_join_refused', token_join),
        g.Guard('source_selection', g.Invariant('/source_selection', 'Live token source selection matches actual CURRENT-selected coverage.'), 'source_selection_refused', source_selection),
        g.Guard('coverage', g.Invariant('/coverage', 'Coverage proves the event sequence before filtering history.'), 'coverage_refused', coverage),
        g.Guard('read_permission', g.Invariant('/read_permission', 'Current viewer permission is checked immediately before disclosure.'), 'read_permission_refused', read_permission),
        g.Guard('deletion_fence', g.Invariant('/deletion_fence', 'Deleted source subjects cannot be disclosed.'), 'deletion_fence_refused', deletion_fence),
        g.Guard('passive_reads', g.Invariant('/passive_reads', 'Passive event history never appends, dispatches or advances a checkpoint.'), 'passive_reads_refused', passive_reads),
    ])

    def check(value):
        table.require('stored_token', value, context)
        table.require('live_snapshot', value, context)
        table.require('token_join', value, context)
        table.require('source_selection', value, context)
        table.require('coverage', value, context)
        table.require('read_permission', value, context)
        table.require('deletion_fence', value, context)
        table.require('passive_reads', value, context)
        return True
    return g.Case(table, check, context)
