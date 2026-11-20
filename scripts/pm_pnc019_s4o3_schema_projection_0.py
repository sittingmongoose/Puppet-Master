"""W3I schema guard table projection_0 (generated).
sc_59e76b28076b1634: Plans/continuity_event_contracts.schema.json#/$defs/projection/type
sc_618ce20ef8ddef27: Plans/continuity_event_contracts.schema.json#/$defs/projection/required/schema_id
sc_1d24054cdae7556a: Plans/continuity_event_contracts.schema.json#/$defs/projection/required/schema_version
sc_c477c3bda765b77a: Plans/continuity_event_contracts.schema.json#/$defs/projection/required/project_id
sc_9473363b57fa51b4: Plans/continuity_event_contracts.schema.json#/$defs/projection/required/continuity_id
sc_569ba721c4238f71: Plans/continuity_event_contracts.schema.json#/$defs/projection/required/stream_id
sc_07f85a6e1854997b: Plans/continuity_event_contracts.schema.json#/$defs/projection/required/event_type
sc_0430b51a22e41962: Plans/continuity_event_contracts.schema.json#/$defs/projection/required/event_id
"""
import pm_guard_isolation as g


def sc_59e76b28076b1634(value, context):
    if value['sc_59e76b28076b1634'] != []:
        return 'schema_invalid'
    return None


def sc_618ce20ef8ddef27(value, context):
    if value['sc_618ce20ef8ddef27'] != []:
        return 'schema_invalid'
    return None


def sc_1d24054cdae7556a(value, context):
    if value['sc_1d24054cdae7556a'] != []:
        return 'schema_invalid'
    return None


def sc_c477c3bda765b77a(value, context):
    if value['sc_c477c3bda765b77a'] != []:
        return 'schema_invalid'
    return None


def sc_9473363b57fa51b4(value, context):
    if value['sc_9473363b57fa51b4'] != []:
        return 'schema_invalid'
    return None


def sc_569ba721c4238f71(value, context):
    if value['sc_569ba721c4238f71'] != []:
        return 'schema_invalid'
    return None


def sc_07f85a6e1854997b(value, context):
    if value['sc_07f85a6e1854997b'] != []:
        return 'schema_invalid'
    return None


def sc_0430b51a22e41962(value, context):
    if value['sc_0430b51a22e41962'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_59e76b28076b1634', g.Invariant('/projection/', 'type at owner schema /type'), 'schema_invalid', sc_59e76b28076b1634),
        g.Guard('sc_618ce20ef8ddef27', g.Invariant('/projection/', 'required at owner schema /required/schema_id'), 'schema_invalid', sc_618ce20ef8ddef27),
        g.Guard('sc_1d24054cdae7556a', g.Invariant('/projection/', 'required at owner schema /required/schema_version'), 'schema_invalid', sc_1d24054cdae7556a),
        g.Guard('sc_c477c3bda765b77a', g.Invariant('/projection/', 'required at owner schema /required/project_id'), 'schema_invalid', sc_c477c3bda765b77a),
        g.Guard('sc_9473363b57fa51b4', g.Invariant('/projection/', 'required at owner schema /required/continuity_id'), 'schema_invalid', sc_9473363b57fa51b4),
        g.Guard('sc_569ba721c4238f71', g.Invariant('/projection/', 'required at owner schema /required/stream_id'), 'schema_invalid', sc_569ba721c4238f71),
        g.Guard('sc_07f85a6e1854997b', g.Invariant('/projection/', 'required at owner schema /required/event_type'), 'schema_invalid', sc_07f85a6e1854997b),
        g.Guard('sc_0430b51a22e41962', g.Invariant('/projection/', 'required at owner schema /required/event_id'), 'schema_invalid', sc_0430b51a22e41962),
    ])

    def check(value):
        table.require('sc_59e76b28076b1634', value, context)
        table.require('sc_618ce20ef8ddef27', value, context)
        table.require('sc_1d24054cdae7556a', value, context)
        table.require('sc_c477c3bda765b77a', value, context)
        table.require('sc_9473363b57fa51b4', value, context)
        table.require('sc_569ba721c4238f71', value, context)
        table.require('sc_07f85a6e1854997b', value, context)
        table.require('sc_0430b51a22e41962', value, context)
        return True
    return g.Case(table, check, context)
