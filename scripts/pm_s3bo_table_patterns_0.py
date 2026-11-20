"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def payload_pattern(value, context):
    record = value['payload_pattern']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'payload_pattern_refused'
    return None

def auxiliary_pattern(value, context):
    record = value['auxiliary_pattern']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'auxiliary_pattern_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('payload_pattern', g.Invariant('/payload_pattern', 'Anchored payload identifiers consume the entire string, including a final LF.'), 'payload_pattern_refused', payload_pattern),
        g.Guard('auxiliary_pattern', g.Invariant('/auxiliary_pattern', 'Anchored custody identifiers consume the entire string, including a final LF.'), 'auxiliary_pattern_refused', auxiliary_pattern),
    ])

    def check(value):
        table.require('payload_pattern', value, context)
        table.require('auxiliary_pattern', value, context)
        return True
    return g.Case(table, check, context)
