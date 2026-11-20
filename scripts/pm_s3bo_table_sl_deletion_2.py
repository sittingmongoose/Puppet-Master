"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sl_del_numbers(value, context):
    record = value['sl_del_numbers']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'sl_del_numbers_refused'
    return None

def sl_del_time(value, context):
    record = value['sl_del_time']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'sl_del_time_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sl_del_numbers', g.Invariant('/sl_del_numbers', 'Generation slots use shared current_integer with minimum 0.'), 'sl_del_numbers_refused', sl_del_numbers),
        g.Guard('sl_del_time', g.Invariant('/sl_del_time', 'The request time uses Storage UTC-Z and the payload deadline uses the EventRecord profile.'), 'sl_del_time_refused', sl_del_time),
    ])

    def check(value):
        table.require('sl_del_numbers', value, context)
        table.require('sl_del_time', value, context)
        return True
    return g.Case(table, check, context)
