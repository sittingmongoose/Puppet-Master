"""W3I schema guard table entailed_sc_bfc6ecd4f6422408 (generated).
sc_bfc6ecd4f6422408: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/actor_kind/minLength
Entailed after sc_a60d8aa090d297e2: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_bfc6ecd4f6422408(value, context):
    if value['sc_a60d8aa090d297e2'] != []:
        return None
    if value['sc_bfc6ecd4f6422408'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_bfc6ecd4f6422408', g.Invariant('/payload_provenance_recorded/actor_kind', 'minLength at owner schema /properties/actor_kind/minLength'), 'schema_invalid', sc_bfc6ecd4f6422408),
    ])

    def check(value):
        table.require('sc_bfc6ecd4f6422408', value, context)
        return True
    return g.Case(table, check, context)
