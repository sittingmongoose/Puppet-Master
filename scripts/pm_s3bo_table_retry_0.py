"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def retry_receipt(value, context):
    record = value['retry_receipt']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'retry_receipt_refused'
    return None

def retry_effects(value, context):
    record = value['retry_effects']
    if record['applies'] is not True:
        return None
    if record['left'] != []:
        return 'retry_effects_refused'
    return None

def replay_policy(value, context):
    record = value['replay_policy']
    if record['applies'] is not True:
        return None
    if record['left'] == record['right']:
        return 'replay_only_not_appendable'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('retry_receipt', g.Invariant('/retry_receipt', 'A semantic retry returns exact original first-receipt bytes.'), 'retry_receipt_refused', retry_receipt),
        g.Guard('retry_effects', g.Invariant('/retry_effects', 'An original retry has zero new effects.'), 'retry_effects_refused', retry_effects),
        g.Guard('replay_policy', g.Invariant('/replay_policy', 'Current append/retry cannot choose projector_replay_only.'), 'replay_only_not_appendable', replay_policy),
    ])

    def check(value):
        table.require('retry_receipt', value, context)
        table.require('retry_effects', value, context)
        table.require('replay_policy', value, context)
        return True
    return g.Case(table, check, context)
