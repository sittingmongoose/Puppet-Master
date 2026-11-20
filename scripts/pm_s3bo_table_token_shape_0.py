"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def token_schema(value, context):
    record = value['token_schema']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'token_schema_refused'
    return None

def token_numbers(value, context):
    record = value['token_numbers']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'token_numbers_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('token_schema', g.Invariant('/token_schema', 'The complete live SP-278 read token keeps every owner schema keyword.'), 'token_schema_refused', token_schema),
        g.Guard('token_numbers', g.Invariant('/token_numbers', 'Every stored/live SP-278 integer slot uses shared current_integer with its exact owner range.'), 'token_numbers_refused', token_numbers),
    ])

    def check(value):
        table.require('token_schema', value, context)
        table.require('token_numbers', value, context)
        return True
    return g.Case(table, check, context)
