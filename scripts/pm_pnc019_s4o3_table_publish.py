"""S4 reference-store publish predicates (generated)."""
import pm_guard_isolation as g


def publication_cas(v, context):
    if v['expected_head'] != v['stored_head']:
        return 'checkpoint_cas_failed'
    return None


def publication_rows(v, context):
    if v['proposed_rows'] != v['source_rows']:
        return 'source_prefix_incomplete'
    return None


def publication_frontier(v, context):
    if v['through'] != v['durable_through']:
        return 'source_prefix_incomplete'
    return None


def publication_generation(v, context):
    if v['generation'] in v['withdrawn']:
        return 'publication_withdrawn'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('publication_cas', g.Invariant('/publication_cas', 'actual reference-store publication_cas invariant'), 'checkpoint_cas_failed', publication_cas),
        g.Guard('publication_rows', g.Invariant('/publication_rows', 'actual reference-store publication_rows invariant'), 'source_prefix_incomplete', publication_rows),
        g.Guard('publication_frontier', g.Invariant('/publication_frontier', 'actual reference-store publication_frontier invariant'), 'source_prefix_incomplete', publication_frontier),
        g.Guard('publication_generation', g.Invariant('/publication_generation', 'actual reference-store publication_generation invariant'), 'publication_withdrawn', publication_generation),
    ])

    def check(value):
        table.require('publication_cas', value, context)
        table.require('publication_rows', value, context)
        table.require('publication_frontier', value, context)
        table.require('publication_generation', value, context)
        return True
    return g.Case(table, check, context)
