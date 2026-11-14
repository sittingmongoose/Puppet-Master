"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def resolution_effect_output(value, context):
    record = value['resolution_effect_output']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'resolution_effect_output_refused'
    return None

def resolution_effect_time(value, context):
    record = value['resolution_effect_time']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'resolution_effect_time_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('resolution_effect_output', g.Invariant('/resolution_effect_output', 'The dependent-effect output hash matches the actual captured resolved value bytes.'), 'resolution_effect_output_refused', resolution_effect_output),
        g.Guard('resolution_effect_time', g.Invariant('/resolution_effect_time', 'The original resolution transition time uses the EventRecord date-time profile.'), 'resolution_effect_time_refused', resolution_effect_time),
    ])

    def check(value):
        table.require('resolution_effect_output', value, context)
        table.require('resolution_effect_time', value, context)
        return True
    return g.Case(table, check, context)
