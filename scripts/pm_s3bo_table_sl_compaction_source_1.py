"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sl_cmp_journal(value, context):
    record = value['sl_cmp_journal']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_journal_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sl_cmp_journal', g.Invariant('/sl_cmp_journal', 'A journal is removable only when every member is settled and none is needed; a mutable journal holding a needed member is never unlinked whole.'), 'sl_cmp_journal_refused', sl_cmp_journal),
    ])

    def check(value):
        table.require('sl_cmp_journal', value, context)
        return True
    return g.Case(table, check, context)
