"""S4 reference-store destination predicates (generated)."""
import pm_guard_isolation as g


def existing_repository(v, context):
    if v['disposition'] == 'use_existing' and v['initialized_repositories'] != []:
        return 'repository_reinitialized'
    return None


def repository_survives_removal(v, context):
    if v['repositories_after'] != v['repositories_before']:
        return 'repository_authority_changed'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('existing_repository', g.Invariant('/existing_repository', 'actual reference-store existing_repository invariant'), 'repository_reinitialized', existing_repository),
        g.Guard('repository_survives_removal', g.Invariant('/repository_survives_removal', 'actual reference-store repository_survives_removal invariant'), 'repository_authority_changed', repository_survives_removal),
    ])

    def check(value):
        table.require('existing_repository', value, context)
        table.require('repository_survives_removal', value, context)
        return True
    return g.Case(table, check, context)
