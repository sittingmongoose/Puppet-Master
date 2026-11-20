"""S4 reference-store extra_remote_access_route_migration_state_changed_1 predicates (generated)."""
import pm_guard_isolation as g


def extra_migration_trust_generation(v, context):
    if v['extra_migration_trust_generation']['numeric_reasons'] == {'expected': None, 'actual': None} and (type(v['extra_migration_trust_generation']['expected']) is not type(v['extra_migration_trust_generation']['actual']) or v['extra_migration_trust_generation']['expected'] != v['extra_migration_trust_generation']['actual']):
        return 'owner_predicate_failed'
    return None


def extra_migration_command(v, context):
    if v['extra_migration_command']['command_after'] != v['extra_migration_command']['command_before']:
        return 'owner_predicate_failed'
    return None


def extra_migration_cursor(v, context):
    if v['extra_migration_cursor']['cursor_after'] != v['extra_migration_cursor']['cursor_before']:
        return 'owner_predicate_failed'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('extra_migration_trust_generation', g.Invariant('/extra_migration_trust_generation', 'actual reference-store extra_migration_trust_generation invariant'), 'owner_predicate_failed', extra_migration_trust_generation),
        g.Guard('extra_migration_command', g.Invariant('/extra_migration_command', 'actual reference-store extra_migration_command invariant'), 'owner_predicate_failed', extra_migration_command),
        g.Guard('extra_migration_cursor', g.Invariant('/extra_migration_cursor', 'actual reference-store extra_migration_cursor invariant'), 'owner_predicate_failed', extra_migration_cursor),
    ])

    def check(value):
        table.require('extra_migration_trust_generation', value, context)
        table.require('extra_migration_command', value, context)
        table.require('extra_migration_cursor', value, context)
        return True
    return g.Case(table, check, context)
