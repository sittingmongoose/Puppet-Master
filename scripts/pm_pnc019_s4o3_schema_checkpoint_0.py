"""W3I schema guard table checkpoint_0 (generated).
sc_5f6c93fa7a929a36: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/type
sc_742b36756f0dd34c: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/required/schema_id
sc_5a96e8ff46ec2b71: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/required/schema_version
sc_84c0624734c37df4: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/required/projector_id
sc_773ca17d67dd5ce3: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/required/projector_version
sc_3c99e9e62e3033c6: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/required/storage_instance_id
sc_680529c2239684dd: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/required/project_id
sc_000760c4ba07b249: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/required/stream_id
"""
import pm_guard_isolation as g


def sc_5f6c93fa7a929a36(value, context):
    if value['sc_5f6c93fa7a929a36'] != []:
        return 'schema_invalid'
    return None


def sc_742b36756f0dd34c(value, context):
    if value['sc_742b36756f0dd34c'] != []:
        return 'schema_invalid'
    return None


def sc_5a96e8ff46ec2b71(value, context):
    if value['sc_5a96e8ff46ec2b71'] != []:
        return 'schema_invalid'
    return None


def sc_84c0624734c37df4(value, context):
    if value['sc_84c0624734c37df4'] != []:
        return 'schema_invalid'
    return None


def sc_773ca17d67dd5ce3(value, context):
    if value['sc_773ca17d67dd5ce3'] != []:
        return 'schema_invalid'
    return None


def sc_3c99e9e62e3033c6(value, context):
    if value['sc_3c99e9e62e3033c6'] != []:
        return 'schema_invalid'
    return None


def sc_680529c2239684dd(value, context):
    if value['sc_680529c2239684dd'] != []:
        return 'schema_invalid'
    return None


def sc_000760c4ba07b249(value, context):
    if value['sc_000760c4ba07b249'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_5f6c93fa7a929a36', g.Invariant('/checkpoint/', 'type at owner schema /type'), 'schema_invalid', sc_5f6c93fa7a929a36),
        g.Guard('sc_742b36756f0dd34c', g.Invariant('/checkpoint/', 'required at owner schema /required/schema_id'), 'schema_invalid', sc_742b36756f0dd34c),
        g.Guard('sc_5a96e8ff46ec2b71', g.Invariant('/checkpoint/', 'required at owner schema /required/schema_version'), 'schema_invalid', sc_5a96e8ff46ec2b71),
        g.Guard('sc_84c0624734c37df4', g.Invariant('/checkpoint/', 'required at owner schema /required/projector_id'), 'schema_invalid', sc_84c0624734c37df4),
        g.Guard('sc_773ca17d67dd5ce3', g.Invariant('/checkpoint/', 'required at owner schema /required/projector_version'), 'schema_invalid', sc_773ca17d67dd5ce3),
        g.Guard('sc_3c99e9e62e3033c6', g.Invariant('/checkpoint/', 'required at owner schema /required/storage_instance_id'), 'schema_invalid', sc_3c99e9e62e3033c6),
        g.Guard('sc_680529c2239684dd', g.Invariant('/checkpoint/', 'required at owner schema /required/project_id'), 'schema_invalid', sc_680529c2239684dd),
        g.Guard('sc_000760c4ba07b249', g.Invariant('/checkpoint/', 'required at owner schema /required/stream_id'), 'schema_invalid', sc_000760c4ba07b249),
    ])

    def check(value):
        table.require('sc_5f6c93fa7a929a36', value, context)
        table.require('sc_742b36756f0dd34c', value, context)
        table.require('sc_5a96e8ff46ec2b71', value, context)
        table.require('sc_84c0624734c37df4', value, context)
        table.require('sc_773ca17d67dd5ce3', value, context)
        table.require('sc_3c99e9e62e3033c6', value, context)
        table.require('sc_680529c2239684dd', value, context)
        table.require('sc_000760c4ba07b249', value, context)
        return True
    return g.Case(table, check, context)
