"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def run_context(value, context):
    record = value['run_context']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'run_context_refused'
    return None

def node_context(value, context):
    record = value['node_context']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'node_context_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('run_context', g.Invariant('/run_context', 'Recovery-unavailable envelope run joins its original episode payload run.'), 'run_context_refused', run_context),
        g.Guard('node_context', g.Invariant('/node_context', 'Recovery-unavailable envelope node joins its original episode payload node.'), 'node_context_refused', node_context),
    ])

    def check(value):
        table.require('run_context', value, context)
        table.require('node_context', value, context)
        return True
    return g.Case(table, check, context)
