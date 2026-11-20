"""W3I schema guard table entailed_sc_9753007fdbf54178 (generated).
sc_9753007fdbf54178: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/replay_checkpoint_ref/minLength
Entailed after sc_6957cbf3c240890d: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_9753007fdbf54178(value, context):
    if value['sc_6957cbf3c240890d'] != []:
        return None
    if value['sc_9753007fdbf54178'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_9753007fdbf54178', g.Invariant('/payload_redaction_applied/replay_checkpoint_ref', 'minLength at owner schema /properties/replay_checkpoint_ref/minLength'), 'schema_invalid', sc_9753007fdbf54178),
    ])

    def check(value):
        table.require('sc_9753007fdbf54178', value, context)
        return True
    return g.Case(table, check, context)
