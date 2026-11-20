"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def dedupe_available(value, context):
    record = value['dedupe_available']
    if record['applies'] is not True:
        return None
    if record['left'] not in record['right']:
        return 'dedupe_unavailable'
    return None

def request_digest(value, context):
    record = value['request_digest']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'idempotency_conflict'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('dedupe_available', g.Invariant('/dedupe_available', 'Retry requires an actual original key in independently held dedupe custody.'), 'dedupe_unavailable', dedupe_available),
        g.Guard('request_digest', g.Invariant('/request_digest', 'Same request key with a changed normalized request digest conflicts.'), 'idempotency_conflict', request_digest),
    ])

    def check(value):
        table.require('dedupe_available', value, context)
        table.require('request_digest', value, context)
        return True
    return g.Case(table, check, context)
