"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def scope_partition(value, context):
    record = value['scope_partition']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'scope_partition_refused'
    return None

def project_join(value, context):
    record = value['project_join']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'project_join_refused'
    return None

def payload_project(value, context):
    record = value['payload_project']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'payload_project_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('scope_partition', g.Invariant('/scope_partition', 'Partition is app or project~base64url of the exact project id.'), 'scope_partition_refused', scope_partition),
        g.Guard('project_join', g.Invariant('/project_join', 'Envelope Project equals independently held source Project.'), 'project_join_refused', project_join),
        g.Guard('payload_project', g.Invariant('/payload_project', 'Payload Project agrees with source scope when present.'), 'payload_project_refused', payload_project),
    ])

    def check(value):
        table.require('scope_partition', value, context)
        table.require('project_join', value, context)
        table.require('payload_project', value, context)
        return True
    return g.Case(table, check, context)
