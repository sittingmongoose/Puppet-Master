"""DDBG guard table: Instrumentation detail values, part B: the value constraints of the second half of the detail properties (DL-429).

Part of the DDBG guard tables; the domain rule and phase order are in
pm_debug_investigation_guard_constants.py. Every refusal here is a named
predicate row; the factory builds a fresh table and Case for each candidate.
"""
import pm_guard_isolation as g
from pm_debug_investigation_guard_constants import DETAIL_VALUES_B_ROOTS, DETAIL_VALUES_B_URI

# Injected by pm_debug_investigation_transitions.load_documents() before any
# case is built: {document key: {document_uri: schema}}.
DOCUMENTS = None


def instrumentation_detail_values_subject(value, context):
    # The record payload.detail_ref names, wrapped; no record means an empty
    # wrapper (instr.detail_available refuses in the detail structure phase).
    detail = context['detail']
    return {} if detail is None else {'detail': detail}


def instrumentation_detail_values_b_case(case_value):
    payload, records = case_value.get('payload'), case_value.get('detail_records')
    ref = payload.get('detail_ref') if type(payload) is dict else None
    # Selection only: the record payload.detail_ref names, or None.
    detail = records.get(ref) if type(ref) is str and type(records) is dict else None
    context = {'detail': detail}
    catalog = g.SchemaCatalog(DOCUMENTS['instrumentation_detail_values_b'], roots=DETAIL_VALUES_B_ROOTS)
    table = g.schema_table(catalog, {DETAIL_VALUES_B_URI: instrumentation_detail_values_subject})

    def check(value):
        table.validate(DETAIL_VALUES_B_URI, value, context)
        return True
    return g.Case(table, check, context)
