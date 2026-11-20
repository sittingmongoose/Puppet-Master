"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def auxiliary_schema(value, context):
    record = value['auxiliary_schema']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'auxiliary_schema_refused'
    return None

def auxiliary_time(value, context):
    record = value['auxiliary_time']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'auxiliary_time_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('auxiliary_schema', g.Invariant('/auxiliary_schema', 'SP-2202/2203 custody and SP-2209 read output retain every owner schema keyword.'), 'auxiliary_schema_refused', auxiliary_schema),
        g.Guard('auxiliary_time', g.Invariant('/auxiliary_time', 'Custody timestamps use the shared Storage UTC-Z profile.'), 'auxiliary_time_refused', auxiliary_time),
    ])

    def check(value):
        table.require('auxiliary_schema', value, context)
        table.require('auxiliary_time', value, context)
        return True
    return g.Case(table, check, context)
