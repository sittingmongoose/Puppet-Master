"""W3I schema guard table entailed_sc_518ecfdd94257990 (generated).
sc_518ecfdd94257990: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/actor_kind/minLength
Entailed after sc_2292a09b79a12dbf: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_518ecfdd94257990(value, context):
    if value['sc_2292a09b79a12dbf'] != []:
        return None
    if value['sc_518ecfdd94257990'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_518ecfdd94257990', g.Invariant('/payload_actor_identified/actor_kind', 'minLength at owner schema /properties/actor_kind/minLength'), 'schema_invalid', sc_518ecfdd94257990),
    ])

    def check(value):
        table.require('sc_518ecfdd94257990', value, context)
        return True
    return g.Case(table, check, context)
