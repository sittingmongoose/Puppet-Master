"""W3I schema guard table payload_redaction_applied_3 (generated).
sc_6c3f6a698320b5f1: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/fact_ref/maxLength
sc_86b90011569d8138: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/fact_ref/pattern
sc_0e7535dc1b4beb80: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/fact_ref/not
sc_1e67b293efad6804: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/actor_ref/maxLength
sc_51e21cd535308324: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/actor_ref/pattern
sc_5ab096d3e586f3f9: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/actor_ref/not
sc_a13843c1ff504141: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/actor_kind/maxLength
sc_33888d8a1bae1904: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/actor_kind/pattern
"""
import pm_guard_isolation as g


def sc_6c3f6a698320b5f1(value, context):
    if value['sc_6c3f6a698320b5f1'] != []:
        return 'schema_invalid'
    return None


def sc_86b90011569d8138(value, context):
    if value['sc_86b90011569d8138'] != []:
        return 'schema_invalid'
    return None


def sc_0e7535dc1b4beb80(value, context):
    if value['sc_0e7535dc1b4beb80'] != []:
        return 'schema_invalid'
    return None


def sc_1e67b293efad6804(value, context):
    if value['sc_1e67b293efad6804'] != []:
        return 'schema_invalid'
    return None


def sc_51e21cd535308324(value, context):
    if value['sc_51e21cd535308324'] != []:
        return 'schema_invalid'
    return None


def sc_5ab096d3e586f3f9(value, context):
    if value['sc_5ab096d3e586f3f9'] != []:
        return 'schema_invalid'
    return None


def sc_a13843c1ff504141(value, context):
    if value['sc_a13843c1ff504141'] != []:
        return 'schema_invalid'
    return None


def sc_33888d8a1bae1904(value, context):
    if value['sc_33888d8a1bae1904'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_6c3f6a698320b5f1', g.Invariant('/payload_redaction_applied/fact_ref', 'maxLength at owner schema /properties/fact_ref/maxLength'), 'schema_invalid', sc_6c3f6a698320b5f1),
        g.Guard('sc_86b90011569d8138', g.Invariant('/payload_redaction_applied/fact_ref', 'pattern at owner schema /properties/fact_ref/pattern'), 'schema_invalid', sc_86b90011569d8138),
        g.Guard('sc_0e7535dc1b4beb80', g.Invariant('/payload_redaction_applied/fact_ref', 'not at owner schema /properties/fact_ref/not'), 'schema_invalid', sc_0e7535dc1b4beb80),
        g.Guard('sc_1e67b293efad6804', g.Invariant('/payload_redaction_applied/actor_ref', 'maxLength at owner schema /properties/actor_ref/maxLength'), 'schema_invalid', sc_1e67b293efad6804),
        g.Guard('sc_51e21cd535308324', g.Invariant('/payload_redaction_applied/actor_ref', 'pattern at owner schema /properties/actor_ref/pattern'), 'schema_invalid', sc_51e21cd535308324),
        g.Guard('sc_5ab096d3e586f3f9', g.Invariant('/payload_redaction_applied/actor_ref', 'not at owner schema /properties/actor_ref/not'), 'schema_invalid', sc_5ab096d3e586f3f9),
        g.Guard('sc_a13843c1ff504141', g.Invariant('/payload_redaction_applied/actor_kind', 'maxLength at owner schema /properties/actor_kind/maxLength'), 'schema_invalid', sc_a13843c1ff504141),
        g.Guard('sc_33888d8a1bae1904', g.Invariant('/payload_redaction_applied/actor_kind', 'pattern at owner schema /properties/actor_kind/pattern'), 'schema_invalid', sc_33888d8a1bae1904),
    ])

    def check(value):
        table.require('sc_6c3f6a698320b5f1', value, context)
        table.require('sc_86b90011569d8138', value, context)
        table.require('sc_0e7535dc1b4beb80', value, context)
        table.require('sc_1e67b293efad6804', value, context)
        table.require('sc_51e21cd535308324', value, context)
        table.require('sc_5ab096d3e586f3f9', value, context)
        table.require('sc_a13843c1ff504141', value, context)
        table.require('sc_33888d8a1bae1904', value, context)
        return True
    return g.Case(table, check, context)
