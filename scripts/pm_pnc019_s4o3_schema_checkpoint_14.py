"""W3I schema guard table checkpoint_14 (generated).
sc_c129e482e56f1e2d: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/source_cursor/anyOf
sc_70265f7f86af3fce: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/filter_complete/const
sc_66633e381a700935: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/state/enum
sc_5e37443babf6491e: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/withdrawn_at_utc/anyOf
sc_731caa2ccef511f0: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/type
sc_b6bcc4b08eaddbfa: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/maxItems
sc_8449c88a55fc72d0: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/type
sc_26dc873985d4f694: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/required/schema_id
"""
import pm_guard_isolation as g


def sc_c129e482e56f1e2d(value, context):
    if value['sc_c129e482e56f1e2d'] != []:
        return 'schema_invalid'
    return None


def sc_70265f7f86af3fce(value, context):
    if value['sc_70265f7f86af3fce'] != []:
        return 'schema_invalid'
    return None


def sc_66633e381a700935(value, context):
    if value['sc_66633e381a700935'] != []:
        return 'schema_invalid'
    return None


def sc_5e37443babf6491e(value, context):
    if value['sc_5e37443babf6491e'] != []:
        return 'schema_invalid'
    return None


def sc_731caa2ccef511f0(value, context):
    if value['sc_731caa2ccef511f0'] != []:
        return 'schema_invalid'
    return None


def sc_b6bcc4b08eaddbfa(value, context):
    if value['sc_b6bcc4b08eaddbfa'] != []:
        return 'schema_invalid'
    return None


def sc_8449c88a55fc72d0(value, context):
    if value['sc_8449c88a55fc72d0'] != []:
        return 'schema_invalid'
    return None


def sc_26dc873985d4f694(value, context):
    if value['sc_26dc873985d4f694'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_c129e482e56f1e2d', g.Invariant('/checkpoint/source_cursor', 'anyOf at owner schema /properties/source_cursor/anyOf'), 'schema_invalid', sc_c129e482e56f1e2d),
        g.Guard('sc_70265f7f86af3fce', g.Invariant('/checkpoint/filter_complete', 'const at owner schema /properties/filter_complete/const'), 'schema_invalid', sc_70265f7f86af3fce),
        g.Guard('sc_66633e381a700935', g.Invariant('/checkpoint/state', 'enum at owner schema /properties/state/enum'), 'schema_invalid', sc_66633e381a700935),
        g.Guard('sc_5e37443babf6491e', g.Invariant('/checkpoint/withdrawn_at_utc', 'anyOf at owner schema /properties/withdrawn_at_utc/anyOf'), 'schema_invalid', sc_5e37443babf6491e),
        g.Guard('sc_731caa2ccef511f0', g.Invariant('/checkpoint/retired_publications', 'type at owner schema /properties/retired_publications/type'), 'schema_invalid', sc_731caa2ccef511f0),
        g.Guard('sc_b6bcc4b08eaddbfa', g.Invariant('/checkpoint/retired_publications', 'maxItems at owner schema /properties/retired_publications/maxItems'), 'schema_invalid', sc_b6bcc4b08eaddbfa),
        g.Guard('sc_8449c88a55fc72d0', g.Invariant('/checkpoint/retired_publications/*', 'type at owner schema /properties/retired_publications/items/type'), 'schema_invalid', sc_8449c88a55fc72d0),
        g.Guard('sc_26dc873985d4f694', g.Invariant('/checkpoint/retired_publications/*', 'required at owner schema /properties/retired_publications/items/required/schema_id'), 'schema_invalid', sc_26dc873985d4f694),
    ])

    def check(value):
        table.require('sc_c129e482e56f1e2d', value, context)
        table.require('sc_70265f7f86af3fce', value, context)
        table.require('sc_66633e381a700935', value, context)
        table.require('sc_5e37443babf6491e', value, context)
        table.require('sc_731caa2ccef511f0', value, context)
        table.require('sc_b6bcc4b08eaddbfa', value, context)
        table.require('sc_8449c88a55fc72d0', value, context)
        table.require('sc_26dc873985d4f694', value, context)
        return True
    return g.Case(table, check, context)
