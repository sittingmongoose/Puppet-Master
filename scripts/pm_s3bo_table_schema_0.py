"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def envelope_schema(value, context):
    record = value['envelope_schema']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'envelope_schema_refused'
    return None

def payload_schema(value, context):
    record = value['payload_schema']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'payload_schema_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('envelope_schema', g.Invariant('/envelope_schema', 'EventRecord validates under its complete owner schema.'), 'envelope_schema_refused', envelope_schema),
        g.Guard('payload_schema', g.Invariant('/payload_schema', 'Payload validates against this exact registered owner schema, all keywords intact.'), 'payload_schema_refused', payload_schema),
    ])

    def check(value):
        table.require('envelope_schema', value, context)
        table.require('payload_schema', value, context)
        return True
    return g.Case(table, check, context)
