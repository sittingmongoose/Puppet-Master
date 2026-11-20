"""W3I schema guard table checkpoint_29 (generated).
sc_7083d99e45428930: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/withdrawn_at_utc/anyOf
sc_1184c16f45bef82d: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/hold_refs/type
sc_bee21252d6a34d68: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/hold_refs/uniqueItems
sc_5918b81eeecddef1: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/hold_refs/items/maxLength
sc_a6b0e2c2b7ac7801: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/hold_refs/items/pattern
sc_aaf1acaae67ab81d: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/hold_refs/items/not
sc_d625f1409858cbe3: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/allOf/0/then/properties/withdrawn_at_utc/type
sc_b574911e5b06aed5: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/allOf/0/else/properties/withdrawn_at_utc/type
"""
import pm_guard_isolation as g


def sc_7083d99e45428930(value, context):
    if value['sc_7083d99e45428930'] != []:
        return 'schema_invalid'
    return None


def sc_1184c16f45bef82d(value, context):
    if value['sc_1184c16f45bef82d'] != []:
        return 'schema_invalid'
    return None


def sc_bee21252d6a34d68(value, context):
    if value['sc_bee21252d6a34d68'] != []:
        return 'schema_invalid'
    return None


def sc_5918b81eeecddef1(value, context):
    if value['sc_5918b81eeecddef1'] != []:
        return 'schema_invalid'
    return None


def sc_a6b0e2c2b7ac7801(value, context):
    if value['sc_a6b0e2c2b7ac7801'] != []:
        return 'schema_invalid'
    return None


def sc_aaf1acaae67ab81d(value, context):
    if value['sc_aaf1acaae67ab81d'] != []:
        return 'schema_invalid'
    return None


def sc_d625f1409858cbe3(value, context):
    if value['sc_d625f1409858cbe3'] != []:
        return 'schema_invalid'
    return None


def sc_b574911e5b06aed5(value, context):
    if value['sc_b574911e5b06aed5'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_7083d99e45428930', g.Invariant('/checkpoint/retired_publications/*/withdrawn_at_utc', 'anyOf at owner schema /properties/retired_publications/items/properties/withdrawn_at_utc/anyOf'), 'schema_invalid', sc_7083d99e45428930),
        g.Guard('sc_1184c16f45bef82d', g.Invariant('/checkpoint/retired_publications/*/hold_refs', 'type at owner schema /properties/retired_publications/items/properties/hold_refs/type'), 'schema_invalid', sc_1184c16f45bef82d),
        g.Guard('sc_bee21252d6a34d68', g.Invariant('/checkpoint/retired_publications/*/hold_refs', 'uniqueItems at owner schema /properties/retired_publications/items/properties/hold_refs/uniqueItems'), 'schema_invalid', sc_bee21252d6a34d68),
        g.Guard('sc_5918b81eeecddef1', g.Invariant('/checkpoint/retired_publications/*/hold_refs/*', 'maxLength at owner schema /properties/retired_publications/items/properties/hold_refs/items/maxLength'), 'schema_invalid', sc_5918b81eeecddef1),
        g.Guard('sc_a6b0e2c2b7ac7801', g.Invariant('/checkpoint/retired_publications/*/hold_refs/*', 'pattern at owner schema /properties/retired_publications/items/properties/hold_refs/items/pattern'), 'schema_invalid', sc_a6b0e2c2b7ac7801),
        g.Guard('sc_aaf1acaae67ab81d', g.Invariant('/checkpoint/retired_publications/*/hold_refs/*', 'not at owner schema /properties/retired_publications/items/properties/hold_refs/items/not'), 'schema_invalid', sc_aaf1acaae67ab81d),
        g.Guard('sc_d625f1409858cbe3', g.Invariant('/checkpoint/retired_publications/*/withdrawn_at_utc', 'type at owner schema /properties/retired_publications/items/allOf/0/then/properties/withdrawn_at_utc/type'), 'schema_invalid', sc_d625f1409858cbe3),
        g.Guard('sc_b574911e5b06aed5', g.Invariant('/checkpoint/retired_publications/*/withdrawn_at_utc', 'type at owner schema /properties/retired_publications/items/allOf/0/else/properties/withdrawn_at_utc/type'), 'schema_invalid', sc_b574911e5b06aed5),
    ])

    def check(value):
        table.require('sc_7083d99e45428930', value, context)
        table.require('sc_1184c16f45bef82d', value, context)
        table.require('sc_bee21252d6a34d68', value, context)
        table.require('sc_5918b81eeecddef1', value, context)
        table.require('sc_a6b0e2c2b7ac7801', value, context)
        table.require('sc_aaf1acaae67ab81d', value, context)
        table.require('sc_d625f1409858cbe3', value, context)
        table.require('sc_b574911e5b06aed5', value, context)
        return True
    return g.Case(table, check, context)
