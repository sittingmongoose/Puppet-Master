"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sr_cor_event_schema(value, context):
    record = value['sr_cor_event_schema']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'sr_cor_event_schema_refused'
    return None

def sr_cor_upgrade(value, context):
    record = value['sr_cor_upgrade']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cor_upgrade_refused'
    return None

def sr_cor_upgrade_source(value, context):
    record = value['sr_cor_upgrade_source']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cor_upgrade_source_refused'
    return None

def sr_cor_stored(value, context):
    record = value['sr_cor_stored']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cor_stored_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sr_cor_event_schema', g.Invariant('/sr_cor_event_schema', 'Every appended payload validates against the complete registered v2 payload schema, all oneOf branches intact.'), 'sr_cor_event_schema_refused', sr_cor_event_schema),
        g.Guard('sr_cor_upgrade', g.Invariant('/sr_cor_upgrade', 'A frozen v1 payload upgrades only with exactly one identity-matching evidence result, to the derived root v2 value; otherwise it quarantines.'), 'sr_cor_upgrade_refused', sr_cor_upgrade),
        g.Guard('sr_cor_upgrade_source', g.Invariant('/sr_cor_upgrade_source', 'Upgrade preserves the v1 source bytes and the semantic event count and appends nothing.'), 'sr_cor_upgrade_source_refused', sr_cor_upgrade_source),
        g.Guard('sr_cor_stored', g.Invariant('/sr_cor_stored', 'The first appended corruption event of the record-hash scenario is the independently stored EventRecord.'), 'sr_cor_stored_refused', sr_cor_stored),
    ])

    def check(value):
        table.require('sr_cor_event_schema', value, context)
        table.require('sr_cor_upgrade', value, context)
        table.require('sr_cor_upgrade_source', value, context)
        table.require('sr_cor_stored', value, context)
        return True
    return g.Case(table, check, context)
