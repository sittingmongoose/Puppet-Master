"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def ss_pf_context(value, context):
    record = value['ss_pf_context']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_pf_context_refused'
    return None

def ss_pf_legacy(value, context):
    record = value['ss_pf_legacy']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_pf_legacy_refused'
    return None

def ss_pf_schema(value, context):
    record = value['ss_pf_schema']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'ss_pf_schema_refused'
    return None

def ss_pf_time(value, context):
    record = value['ss_pf_time']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'ss_pf_time_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('ss_pf_context', g.Invariant('/ss_pf_context', 'The run-context consumer joins every original owner fact, returns the committed decision and unchanged snapshot, and refuses aggregate use.'), 'ss_pf_context_refused', ss_pf_context),
        g.Guard('ss_pf_legacy', g.Invariant('/ss_pf_legacy', 'A v1 payload is never converted without provable owner derivation: it quarantines with its exact reason, bytes kept, no event or checkpoint.'), 'ss_pf_legacy_refused', ss_pf_legacy),
        g.Guard('ss_pf_schema', g.Invariant('/ss_pf_schema', 'Every decision row, request and read output keeps every keyword of its closed owner schema.'), 'ss_pf_schema_refused', ss_pf_schema),
        g.Guard('ss_pf_time', g.Invariant('/ss_pf_time', 'First-receipt acknowledgements use the EventRecord date_time profile (E5-2).'), 'ss_pf_time_refused', ss_pf_time),
    ])

    def check(value):
        table.require('ss_pf_context', value, context)
        table.require('ss_pf_legacy', value, context)
        table.require('ss_pf_schema', value, context)
        table.require('ss_pf_time', value, context)
        return True
    return g.Case(table, check, context)
