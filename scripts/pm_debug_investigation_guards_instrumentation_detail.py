"""DDBG guard table: Instrumentation detail phase: the referenced change detail, its schema and inline size (DL-429, SP-337).

Part of the DDBG guard tables; the domain rule and phase order are in
pm_debug_investigation_guard_constants.py. Every refusal here is a named
predicate row; the factory builds a fresh table and Case for each candidate.
"""
import json

import pm_guard_isolation as g
from pm_debug_investigation_guard_constants import (
    DETAIL_ROOTS, DETAIL_URI, INLINE_LIMIT)

# Injected by pm_debug_investigation_transitions.load_documents() before any
# case is built: {document key: {document_uri: schema}}.
DOCUMENTS = None


def instrumentation_detail_subject(value, context):
    # The detail schema judges the record payload.detail_ref names. When there is
    # no such record, instr.detail_available refuses and the wrapper holds no member.
    detail = context['detail']
    return {} if detail is None else {'detail': detail}


def instr_detail_available(value, context):
    if type(value.get('payload')) is not dict or type(value.get('detail_records')) is not dict:
        return None
    payload = value['payload']
    records = value['detail_records']
    ref = payload.get('detail_ref')
    if type(ref) is not str or not 0 < len(ref) <= 256:
        return None
    return 'detail_unavailable' if ref not in records else None


def instr_detail_size(value, context):
    size = context['detail_bytes']
    return 'detail_payload_reference_required' if type(size) is int and size > INLINE_LIMIT else None


def instrumentation_detail_case(case_value):
    payload, records = case_value.get('payload'), case_value.get('detail_records')
    ref = payload.get('detail_ref') if type(payload) is dict else None
    detail = records.get(ref) if type(ref) is str and type(records) is dict else None
    # SP-337: the detail body is stored on its own, so its encoded bytes are measured on their own.
    size = None if detail is None else len(json.dumps(detail, ensure_ascii=False, separators=(',', ':')).encode())
    context = {'detail': detail, 'detail_bytes': size}
    catalog = g.SchemaCatalog(DOCUMENTS['instrumentation_detail'], roots=DETAIL_ROOTS)
    table = g.schema_table(catalog, {DETAIL_URI: instrumentation_detail_subject}, guards=[
        g.Guard('instr.detail_available', g.Invariant('/payload/detail_ref', 'names a record in detail_records'), 'detail_unavailable', instr_detail_available),
        g.Guard('instr.detail_size', g.Invariant('/detail_records/<detail_ref>', 'encoded UTF-8 JSON is at most 16 KiB inline (SP-337)'), 'detail_payload_reference_required', instr_detail_size)])

    def check(value):
        table.require('instr.detail_available', value, context)
        table.validate(DETAIL_URI, value, context)
        table.require('instr.detail_size', value, context)
        return True
    return g.Case(table, check, context)
