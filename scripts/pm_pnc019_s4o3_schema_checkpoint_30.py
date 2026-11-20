"""W3I schema guard table checkpoint_30 (generated).
sc_4c6f87a194c6795d: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/hold_refs/type
sc_ded73d9a074a4604: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/hold_refs/uniqueItems
sc_6f31b99dbf50db10: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/hold_refs/items/maxLength
sc_8e9a6bd353ab1910: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/hold_refs/items/pattern
sc_5addcc39ad58daec: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/hold_refs/items/not
sc_1fa97464a71807b2: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/allOf/0/then/properties/withdrawn_at_utc/type
sc_adc63b7d0510f26c: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/allOf/0/else/properties/withdrawn_at_utc/type
"""
import pm_guard_isolation as g


def sc_4c6f87a194c6795d(value, context):
    if value['sc_4c6f87a194c6795d'] != []:
        return 'schema_invalid'
    return None


def sc_ded73d9a074a4604(value, context):
    if value['sc_ded73d9a074a4604'] != []:
        return 'schema_invalid'
    return None


def sc_6f31b99dbf50db10(value, context):
    if value['sc_6f31b99dbf50db10'] != []:
        return 'schema_invalid'
    return None


def sc_8e9a6bd353ab1910(value, context):
    if value['sc_8e9a6bd353ab1910'] != []:
        return 'schema_invalid'
    return None


def sc_5addcc39ad58daec(value, context):
    if value['sc_5addcc39ad58daec'] != []:
        return 'schema_invalid'
    return None


def sc_1fa97464a71807b2(value, context):
    if value['sc_1fa97464a71807b2'] != []:
        return 'schema_invalid'
    return None


def sc_adc63b7d0510f26c(value, context):
    if value['sc_adc63b7d0510f26c'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_4c6f87a194c6795d', g.Invariant('/checkpoint/hold_refs', 'type at owner schema /properties/hold_refs/type'), 'schema_invalid', sc_4c6f87a194c6795d),
        g.Guard('sc_ded73d9a074a4604', g.Invariant('/checkpoint/hold_refs', 'uniqueItems at owner schema /properties/hold_refs/uniqueItems'), 'schema_invalid', sc_ded73d9a074a4604),
        g.Guard('sc_6f31b99dbf50db10', g.Invariant('/checkpoint/hold_refs/*', 'maxLength at owner schema /properties/hold_refs/items/maxLength'), 'schema_invalid', sc_6f31b99dbf50db10),
        g.Guard('sc_8e9a6bd353ab1910', g.Invariant('/checkpoint/hold_refs/*', 'pattern at owner schema /properties/hold_refs/items/pattern'), 'schema_invalid', sc_8e9a6bd353ab1910),
        g.Guard('sc_5addcc39ad58daec', g.Invariant('/checkpoint/hold_refs/*', 'not at owner schema /properties/hold_refs/items/not'), 'schema_invalid', sc_5addcc39ad58daec),
        g.Guard('sc_1fa97464a71807b2', g.Invariant('/checkpoint/withdrawn_at_utc', 'type at owner schema /allOf/0/then/properties/withdrawn_at_utc/type'), 'schema_invalid', sc_1fa97464a71807b2),
        g.Guard('sc_adc63b7d0510f26c', g.Invariant('/checkpoint/withdrawn_at_utc', 'type at owner schema /allOf/0/else/properties/withdrawn_at_utc/type'), 'schema_invalid', sc_adc63b7d0510f26c),
    ])

    def check(value):
        table.require('sc_4c6f87a194c6795d', value, context)
        table.require('sc_ded73d9a074a4604', value, context)
        table.require('sc_6f31b99dbf50db10', value, context)
        table.require('sc_8e9a6bd353ab1910', value, context)
        table.require('sc_5addcc39ad58daec', value, context)
        table.require('sc_1fa97464a71807b2', value, context)
        table.require('sc_adc63b7d0510f26c', value, context)
        return True
    return g.Case(table, check, context)
