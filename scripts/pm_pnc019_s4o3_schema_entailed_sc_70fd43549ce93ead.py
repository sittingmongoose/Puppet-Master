"""W3I schema guard table entailed_sc_70fd43549ce93ead (generated).
sc_70fd43549ce93ead: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/provenance_ref/type
Entailed after sc_1ccb525bcd8176fd: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_70fd43549ce93ead(value, context):
    if value['sc_1ccb525bcd8176fd'] != []:
        return None
    if value['sc_70fd43549ce93ead'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_70fd43549ce93ead', g.Invariant('/payload_redaction_applied/provenance_ref', 'type at owner schema /properties/provenance_ref/type'), 'schema_invalid', sc_70fd43549ce93ead),
    ])

    def check(value):
        table.require('sc_70fd43549ce93ead', value, context)
        return True
    return g.Case(table, check, context)
