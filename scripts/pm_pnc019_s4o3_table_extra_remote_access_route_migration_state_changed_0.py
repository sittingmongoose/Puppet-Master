"""S4 reference-store extra_remote_access_route_migration_state_changed_0 predicates (generated)."""
import pm_guard_isolation as g


def extra_migration_server_generation_number_expected(v, context):
    if v['extra_migration_server_generation']['numeric_reasons']['expected'] is not None:
        return 'number_domain'
    return None


def extra_migration_server_generation_number_actual(v, context):
    if v['extra_migration_server_generation']['numeric_reasons']['actual'] is not None:
        return 'number_domain'
    return None


def extra_migration_server_generation(v, context):
    if v['extra_migration_server_generation']['numeric_reasons'] == {'expected': None, 'actual': None} and (type(v['extra_migration_server_generation']['expected']) is not type(v['extra_migration_server_generation']['actual']) or v['extra_migration_server_generation']['expected'] != v['extra_migration_server_generation']['actual']):
        return 'owner_predicate_failed'
    return None


def extra_migration_endpoint_generation_number_expected(v, context):
    if v['extra_migration_endpoint_generation']['numeric_reasons']['expected'] is not None:
        return 'number_domain'
    return None


def extra_migration_endpoint_generation_number_actual(v, context):
    if v['extra_migration_endpoint_generation']['numeric_reasons']['actual'] is not None:
        return 'number_domain'
    return None


def extra_migration_endpoint_generation(v, context):
    if v['extra_migration_endpoint_generation']['numeric_reasons'] == {'expected': None, 'actual': None} and (type(v['extra_migration_endpoint_generation']['expected']) is not type(v['extra_migration_endpoint_generation']['actual']) or v['extra_migration_endpoint_generation']['expected'] != v['extra_migration_endpoint_generation']['actual']):
        return 'owner_predicate_failed'
    return None


def extra_migration_trust_generation_number_expected(v, context):
    if v['extra_migration_trust_generation']['numeric_reasons']['expected'] is not None:
        return 'number_domain'
    return None


def extra_migration_trust_generation_number_actual(v, context):
    if v['extra_migration_trust_generation']['numeric_reasons']['actual'] is not None:
        return 'number_domain'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('extra_migration_server_generation_number_expected', g.Invariant('/extra_migration_server_generation_number_expected', 'actual reference-store extra_migration_server_generation_number_expected invariant'), 'number_domain', extra_migration_server_generation_number_expected),
        g.Guard('extra_migration_server_generation_number_actual', g.Invariant('/extra_migration_server_generation_number_actual', 'actual reference-store extra_migration_server_generation_number_actual invariant'), 'number_domain', extra_migration_server_generation_number_actual),
        g.Guard('extra_migration_server_generation', g.Invariant('/extra_migration_server_generation', 'actual reference-store extra_migration_server_generation invariant'), 'owner_predicate_failed', extra_migration_server_generation),
        g.Guard('extra_migration_endpoint_generation_number_expected', g.Invariant('/extra_migration_endpoint_generation_number_expected', 'actual reference-store extra_migration_endpoint_generation_number_expected invariant'), 'number_domain', extra_migration_endpoint_generation_number_expected),
        g.Guard('extra_migration_endpoint_generation_number_actual', g.Invariant('/extra_migration_endpoint_generation_number_actual', 'actual reference-store extra_migration_endpoint_generation_number_actual invariant'), 'number_domain', extra_migration_endpoint_generation_number_actual),
        g.Guard('extra_migration_endpoint_generation', g.Invariant('/extra_migration_endpoint_generation', 'actual reference-store extra_migration_endpoint_generation invariant'), 'owner_predicate_failed', extra_migration_endpoint_generation),
        g.Guard('extra_migration_trust_generation_number_expected', g.Invariant('/extra_migration_trust_generation_number_expected', 'actual reference-store extra_migration_trust_generation_number_expected invariant'), 'number_domain', extra_migration_trust_generation_number_expected),
        g.Guard('extra_migration_trust_generation_number_actual', g.Invariant('/extra_migration_trust_generation_number_actual', 'actual reference-store extra_migration_trust_generation_number_actual invariant'), 'number_domain', extra_migration_trust_generation_number_actual),
    ])

    def check(value):
        table.require('extra_migration_server_generation_number_expected', value, context)
        table.require('extra_migration_server_generation_number_actual', value, context)
        table.require('extra_migration_server_generation', value, context)
        table.require('extra_migration_endpoint_generation_number_expected', value, context)
        table.require('extra_migration_endpoint_generation_number_actual', value, context)
        table.require('extra_migration_endpoint_generation', value, context)
        table.require('extra_migration_trust_generation_number_expected', value, context)
        table.require('extra_migration_trust_generation_number_actual', value, context)
        return True
    return g.Case(table, check, context)
