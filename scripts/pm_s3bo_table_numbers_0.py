"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def integer_domain(value, context):
    record = value['integer_domain']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'integer_domain_refused'
    return None

def storage_sequence(value, context):
    record = value['storage_sequence']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'storage_sequence_refused'
    return None

def physical_value(value, context):
    record = value['physical_value']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'physical_value_refused'
    return None

def producer_jcs(value, context):
    record = value['producer_jcs']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'producer_jcs_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('integer_domain', g.Invariant('/integer_domain', 'Every schema integer slot uses current_integer with its owner bounds.'), 'integer_domain_refused', integer_domain),
        g.Guard('storage_sequence', g.Invariant('/storage_sequence', 'Storage sequence_id uses storage_uint64, independent of producer JCS.'), 'storage_sequence_refused', storage_sequence),
        g.Guard('physical_value', g.Invariant('/physical_value', 'The full stored EventRecord uses storage_value_bytes EVENT_VALUE.'), 'physical_value_refused', physical_value),
        g.Guard('producer_jcs', g.Invariant('/producer_jcs', 'Full producer projection uses producer_semantic_bytes before effects.'), 'producer_jcs_refused', producer_jcs),
    ])

    def check(value):
        table.require('integer_domain', value, context)
        table.require('storage_sequence', value, context)
        table.require('physical_value', value, context)
        table.require('producer_jcs', value, context)
        return True
    return g.Case(table, check, context)
