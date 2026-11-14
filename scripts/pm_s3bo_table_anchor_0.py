"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def anchor_receipt(value, context):
    record = value['anchor_receipt']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'anchor_receipt_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('anchor_receipt', g.Invariant('/anchor_receipt', 'Recovery-unavailable receipt_ref names its own SP-286 first receipt custody key.'), 'anchor_receipt_refused', anchor_receipt),
    ])

    def check(value):
        table.require('anchor_receipt', value, context)
        return True
    return g.Case(table, check, context)
