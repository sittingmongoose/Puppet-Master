"""W3I schema guard table checkpoint_1 (generated).
sc_b1b5db7e5d2aab5f: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/required/publication_id
sc_72facdc7eba63a30: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/required/admitted_event_types
sc_8233f1c1d7a5313e: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/required/index_read_token
sc_84a0c18e97eae096: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/required/index_through_sequence_id
sc_05ec9c0ba7f35117: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/required/source_cursor
sc_3a617a25c313bab8: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/required/filter_complete
sc_9df7f0517aa64e63: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/required/state
sc_d21d1547b9cc113c: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/required/withdrawn_at_utc
"""
import pm_guard_isolation as g


def sc_b1b5db7e5d2aab5f(value, context):
    if value['sc_b1b5db7e5d2aab5f'] != []:
        return 'schema_invalid'
    return None


def sc_72facdc7eba63a30(value, context):
    if value['sc_72facdc7eba63a30'] != []:
        return 'schema_invalid'
    return None


def sc_8233f1c1d7a5313e(value, context):
    if value['sc_8233f1c1d7a5313e'] != []:
        return 'schema_invalid'
    return None


def sc_84a0c18e97eae096(value, context):
    if value['sc_84a0c18e97eae096'] != []:
        return 'schema_invalid'
    return None


def sc_05ec9c0ba7f35117(value, context):
    if value['sc_05ec9c0ba7f35117'] != []:
        return 'schema_invalid'
    return None


def sc_3a617a25c313bab8(value, context):
    if value['sc_3a617a25c313bab8'] != []:
        return 'schema_invalid'
    return None


def sc_9df7f0517aa64e63(value, context):
    if value['sc_9df7f0517aa64e63'] != []:
        return 'schema_invalid'
    return None


def sc_d21d1547b9cc113c(value, context):
    if value['sc_d21d1547b9cc113c'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_b1b5db7e5d2aab5f', g.Invariant('/checkpoint/', 'required at owner schema /required/publication_id'), 'schema_invalid', sc_b1b5db7e5d2aab5f),
        g.Guard('sc_72facdc7eba63a30', g.Invariant('/checkpoint/', 'required at owner schema /required/admitted_event_types'), 'schema_invalid', sc_72facdc7eba63a30),
        g.Guard('sc_8233f1c1d7a5313e', g.Invariant('/checkpoint/', 'required at owner schema /required/index_read_token'), 'schema_invalid', sc_8233f1c1d7a5313e),
        g.Guard('sc_84a0c18e97eae096', g.Invariant('/checkpoint/', 'required at owner schema /required/index_through_sequence_id'), 'schema_invalid', sc_84a0c18e97eae096),
        g.Guard('sc_05ec9c0ba7f35117', g.Invariant('/checkpoint/', 'required at owner schema /required/source_cursor'), 'schema_invalid', sc_05ec9c0ba7f35117),
        g.Guard('sc_3a617a25c313bab8', g.Invariant('/checkpoint/', 'required at owner schema /required/filter_complete'), 'schema_invalid', sc_3a617a25c313bab8),
        g.Guard('sc_9df7f0517aa64e63', g.Invariant('/checkpoint/', 'required at owner schema /required/state'), 'schema_invalid', sc_9df7f0517aa64e63),
        g.Guard('sc_d21d1547b9cc113c', g.Invariant('/checkpoint/', 'required at owner schema /required/withdrawn_at_utc'), 'schema_invalid', sc_d21d1547b9cc113c),
    ])

    def check(value):
        table.require('sc_b1b5db7e5d2aab5f', value, context)
        table.require('sc_72facdc7eba63a30', value, context)
        table.require('sc_8233f1c1d7a5313e', value, context)
        table.require('sc_84a0c18e97eae096', value, context)
        table.require('sc_05ec9c0ba7f35117', value, context)
        table.require('sc_3a617a25c313bab8', value, context)
        table.require('sc_9df7f0517aa64e63', value, context)
        table.require('sc_d21d1547b9cc113c', value, context)
        return True
    return g.Case(table, check, context)
