"""S4 reference-store relocate predicates (generated)."""
import pm_guard_isolation as g


def relocation_original(v, context):
    if v['original_ref'] != v['mapped_original_ref']:
        return 'relocation_binding'
    return None


def relocation_instance(v, context):
    if v['storage_instance'] != v['mapped_instance']:
        return 'relocation_binding'
    return None


def relocation_bytes(v, context):
    if v['original_bytes'] != v['translated_bytes']:
        return 'relocation_commitment'
    return None


def relocation_prior(v, context):
    if v['expected_locator'] != v['stored_locator']:
        return 'relocation_binding'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('relocation_original', g.Invariant('/relocation_original', 'actual reference-store relocation_original invariant'), 'relocation_binding', relocation_original),
        g.Guard('relocation_instance', g.Invariant('/relocation_instance', 'actual reference-store relocation_instance invariant'), 'relocation_binding', relocation_instance),
        g.Guard('relocation_bytes', g.Invariant('/relocation_bytes', 'actual reference-store relocation_bytes invariant'), 'relocation_commitment', relocation_bytes),
        g.Guard('relocation_prior', g.Invariant('/relocation_prior', 'actual reference-store relocation_prior invariant'), 'relocation_binding', relocation_prior),
    ])

    def check(value):
        table.require('relocation_original', value, context)
        table.require('relocation_instance', value, context)
        table.require('relocation_bytes', value, context)
        table.require('relocation_prior', value, context)
        return True
    return g.Case(table, check, context)
