"""One coordination guard table."""
import pm_guard_isolation as g

def p_0(value, context):
    return None if value['retired_checkpoint_scope_partition'] is True else 'retired_checkpoint_scope_partition'

def p_1(value, context):
    return None if value['retired_checkpoint_publication_reused'] is True else 'retired_checkpoint_publication_reused'

def projection_unprovable_case():
    table = g.GuardTable([
        g.Guard('retired_checkpoint_scope_partition', g.Invariant('/retired_checkpoint_scope_partition', 'the retired checkpoint scope partition observation holds'), 'retired_checkpoint_scope_partition', p_0),
        g.Guard('retired_checkpoint_publication_reused', g.Invariant('/retired_checkpoint_publication_reused', 'the retired checkpoint publication reused observation holds'), 'retired_checkpoint_publication_reused', p_1),
    ])
    def check(value):
        table.require('retired_checkpoint_scope_partition', value)
        table.require('retired_checkpoint_publication_reused', value)
        return True
    return g.Case(table, check)

