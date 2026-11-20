"""S4 reference-store extra_server_catalog_changed_0 predicates (generated)."""
import pm_guard_isolation as g


def extra_catalog_identity_dedupe(v, context):
    if v['extra_catalog_identity_dedupe']['merged_server_id'] != v['extra_catalog_identity_dedupe']['independently_verified_server_id']:
        return 'owner_predicate_failed'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('extra_catalog_identity_dedupe', g.Invariant('/extra_catalog_identity_dedupe', 'actual reference-store extra_catalog_identity_dedupe invariant'), 'owner_predicate_failed', extra_catalog_identity_dedupe),
    ])

    def check(value):
        table.require('extra_catalog_identity_dedupe', value, context)
        return True
    return g.Case(table, check, context)
