"""Enforced ledger observations outside the credited ledger-input witness set."""
import pm_guard_isolation as g

LEDGER_RESOURCE_GAPS = {
    'prepared_registry_row_ref_unresolved': (
        'In a fixed root with resolvable pinned refs, a changed prepared source or owner ref that passes '
        'ledger_schema changes the canonical row and trips prepared_registry_row_mismatch. With root resources in scope, '
        'a missing referenced file, pointer or anchor can fail ref_resolves on the unchanged row.'
    ),
    'ledger_retention_binding': (
        'The ledger schema pins both retention refs to RP-COORDINATION-180D version 1.0.0 and '
        'requires run_id in required_context_fields. The committed policy satisfies the version and '
        'hold eligibility checks. With root resources in scope, a missing policy, different policy '
        'version or loss of hold eligibility can fail the binding on the unchanged row.'
    ),
}

def p_0(value, context):
    return None if value['ledger_owner_join'] is True else 'ledger_owner_join'

def p_1(value, context):
    return None if value['prepared_payload_schema_unresolved'] is True else 'prepared_payload_schema_unresolved'

def p_2(value, context):
    return None if value['prepared_registry_row_ref_unresolved'] is True else 'prepared_registry_row_ref_unresolved'

def p_3(value, context):
    return None if value['mirror_owner_ref_unresolved'] is True else 'mirror_owner_ref_unresolved'

def p_4(value, context):
    return None if value['prepared_registry_row_schema'] is True else 'prepared_registry_row_schema'

def p_5(value, context):
    return None if value['ledger_retention_binding'] is True else 'ledger_retention_binding'

def ledger_unprovable_case():
    table = g.GuardTable([
        g.Guard('ledger_owner_join', g.Invariant('/ledger_owner_join', 'the ledger owner join observation holds'), 'ledger_owner_join', p_0),
        g.Guard('prepared_payload_schema_unresolved', g.Invariant('/prepared_payload_schema_unresolved', 'the prepared payload schema unresolved observation holds'), 'prepared_payload_schema_unresolved', p_1),
        g.Guard('prepared_registry_row_ref_unresolved', g.Invariant('/prepared_registry_row_ref_unresolved', 'the prepared registry row ref unresolved observation holds'), 'prepared_registry_row_ref_unresolved', p_2),
        g.Guard('mirror_owner_ref_unresolved', g.Invariant('/mirror_owner_ref_unresolved', 'the mirror owner ref unresolved observation holds'), 'mirror_owner_ref_unresolved', p_3),
        g.Guard('prepared_registry_row_schema', g.Invariant('/prepared_registry_row_schema', 'the prepared registry row schema observation holds'), 'prepared_registry_row_schema', p_4),
        g.Guard('ledger_retention_binding', g.Invariant('/ledger_retention_binding', 'the ledger retention binding observation holds'), 'ledger_retention_binding', p_5),
    ])
    def check(value):
        table.require('ledger_owner_join', value)
        table.require('prepared_payload_schema_unresolved', value)
        table.require('prepared_registry_row_ref_unresolved', value)
        table.require('mirror_owner_ref_unresolved', value)
        table.require('prepared_registry_row_schema', value)
        table.require('ledger_retention_binding', value)
        return True
    return g.Case(table, check)

