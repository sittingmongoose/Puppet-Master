"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sl_qtn_numbers(value, context):
    record = value['sl_qtn_numbers']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'sl_qtn_numbers_refused'
    return None

def sl_qtn_time(value, context):
    record = value['sl_qtn_time']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'sl_qtn_time_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sl_qtn_numbers', g.Invariant('/sl_qtn_numbers', 'The byte length and the occurrence use shared current_integer with minimum 0 and 1.'), 'sl_qtn_numbers_refused', sl_qtn_numbers),
        g.Guard('sl_qtn_time', g.Invariant('/sl_qtn_time', 'Detection time uses Storage UTC-Z; transition times use the EventRecord profile.'), 'sl_qtn_time_refused', sl_qtn_time),
    ])

    def check(value):
        table.require('sl_qtn_numbers', value, context)
        table.require('sl_qtn_time', value, context)
        return True
    return g.Case(table, check, context)
