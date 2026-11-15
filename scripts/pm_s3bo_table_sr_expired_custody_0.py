"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sr_exp_replay(value, context):
    record = value['sr_exp_replay']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_exp_replay_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sr_exp_replay', g.Invariant('/sr_exp_replay', 'Same identity and digest returns the original result; a different digest fails closed with no transition.'), 'sr_exp_replay_refused', sr_exp_replay),
    ])

    def check(value):
        table.require('sr_exp_replay', value, context)
        return True
    return g.Case(table, check, context)
