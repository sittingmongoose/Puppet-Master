"""One coordination guard table."""
import pm_guard_isolation as g

def p_0(value, context):
    return None if value['ledger_schema'] is True else 'ledger_schema'

def p_1(value, context):
    return None if value['ledger_row_order'] is True else 'ledger_row_order'

def p_2(value, context):
    return None if value['ledger_family_id'] is True else 'ledger_family_id'

def p_3(value, context):
    return None if value['prepared_registry_row_mismatch'] is True else 'prepared_registry_row_mismatch'

def p_4(value, context):
    return None if value['prepared_registry_row_sha256'] is True else 'prepared_registry_row_sha256'

def p_5(value, context):
    return None if value['ledger_registry_row_join'] is True else 'ledger_registry_row_join'

def p_6(value, context):
    return None if value['ledger_producer_binding'] is True else 'ledger_producer_binding'

def p_7(value, context):
    return None if value['ledger_consumer_refs'] is True else 'ledger_consumer_refs'

def p_8(value, context):
    return None if value['mirror_payload_schema_unresolved'] is True else 'mirror_payload_schema_unresolved'

def ledger_case():
    table = g.GuardTable([
        g.Guard('ledger_schema', g.Invariant('/ledger_schema', 'the ledger schema observation holds'), 'ledger_schema', p_0),
        g.Guard('ledger_row_order', g.Invariant('/ledger_row_order', 'the ledger row order observation holds'), 'ledger_row_order', p_1),
        g.Guard('ledger_family_id', g.Invariant('/ledger_family_id', 'the ledger family id observation holds'), 'ledger_family_id', p_2),
        g.Guard('prepared_registry_row_mismatch', g.Invariant('/prepared_registry_row_mismatch', 'the prepared registry row mismatch observation holds'), 'prepared_registry_row_mismatch', p_3),
        g.Guard('prepared_registry_row_sha256', g.Invariant('/prepared_registry_row_sha256', 'the prepared registry row sha256 observation holds'), 'prepared_registry_row_sha256', p_4),
        g.Guard('ledger_registry_row_join', g.Invariant('/ledger_registry_row_join', 'the ledger registry row join observation holds'), 'ledger_registry_row_join', p_5),
        g.Guard('ledger_producer_binding', g.Invariant('/ledger_producer_binding', 'the ledger producer binding observation holds'), 'ledger_producer_binding', p_6),
        g.Guard('ledger_consumer_refs', g.Invariant('/ledger_consumer_refs', 'the ledger consumer refs observation holds'), 'ledger_consumer_refs', p_7),
        g.Guard('mirror_payload_schema_unresolved', g.Invariant('/mirror_payload_schema_unresolved', 'the mirror payload schema unresolved observation holds'), 'mirror_payload_schema_unresolved', p_8),
    ])
    def check(value):
        table.require('ledger_schema', value)
        table.require('ledger_row_order', value)
        table.require('ledger_family_id', value)
        table.require('prepared_registry_row_mismatch', value)
        table.require('prepared_registry_row_sha256', value)
        table.require('ledger_registry_row_join', value)
        table.require('ledger_producer_binding', value)
        table.require('ledger_consumer_refs', value)
        table.require('mirror_payload_schema_unresolved', value)
        return True
    return g.Case(table, check)

