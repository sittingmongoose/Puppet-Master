"""DDBG guard table: Payload phase: the family's closed payload schema (one document per family).

Part of the DDBG guard tables; the domain rule and phase order are in
pm_debug_investigation_guard_constants.py. Every refusal here is a named
predicate row; the factory builds a fresh table and Case for each candidate.
"""
import pm_guard_isolation as g
from pm_debug_investigation_guard_constants import PAYLOAD_ROOTS, PAYLOAD_URI

# Injected by pm_debug_investigation_transitions.load_documents() before any
# case is built: {document key: {document_uri: schema}}.
DOCUMENTS = None


def payload_subject(value, context):
    return value.get('payload')


def payload_case(case_value):
    catalog = g.SchemaCatalog(DOCUMENTS[case_value.get('event_type')], roots=PAYLOAD_ROOTS)
    table = g.schema_table(catalog, {PAYLOAD_URI: payload_subject})
    context = None

    def check(value):
        table.validate(PAYLOAD_URI, value, context)
        return True
    return g.Case(table, check, context)
