"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def aftermath_receipt(value, context):
    record = value['aftermath_receipt']
    if record['applies'] is not True:
        return None
    if record['left'] > record['right']:
        return 'aftermath_receipt_refused'
    return None

def aftermath_owner(value, context):
    record = value['aftermath_owner']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'aftermath_owner_refused'
    return None

def aftermath_generation(value, context):
    record = value['aftermath_generation']
    if record['applies'] is not True:
        return None
    if record['left'] == record['right']:
        return 'aftermath_generation_refused'
    return None

def aftermath_restart(value, context):
    record = value['aftermath_restart']
    if record['applies'] is not True:
        return None
    if record['left'] != []:
        return 'aftermath_restart_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('aftermath_receipt', g.Invariant('/aftermath_receipt', 'Recovery aftermath follows a verified first receipt.'), 'aftermath_receipt_refused', aftermath_receipt),
        g.Guard('aftermath_owner', g.Invariant('/aftermath_owner', 'Only the generic projector owns the checkpoint advance.'), 'aftermath_owner_refused', aftermath_owner),
        g.Guard('aftermath_generation', g.Invariant('/aftermath_generation', 'Rebuild action publishes a fresh index generation.'), 'aftermath_generation_refused', aftermath_generation),
        g.Guard('aftermath_restart', g.Invariant('/aftermath_restart', 'A covered frontier on restart repeats no aftermath.'), 'aftermath_restart_refused', aftermath_restart),
    ])

    def check(value):
        table.require('aftermath_receipt', value, context)
        table.require('aftermath_owner', value, context)
        table.require('aftermath_generation', value, context)
        table.require('aftermath_restart', value, context)
        return True
    return g.Case(table, check, context)
