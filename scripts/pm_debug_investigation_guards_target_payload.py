"""DDBG guard table: target_bound payload phase (closed payload schema plus the digest character set).

Part of the DDBG guard tables; the domain rule and phase order are in
pm_debug_investigation_guard_constants.py. Every refusal here is a named
predicate row; the factory builds a fresh table and Case for each candidate.
"""
import pm_guard_isolation as g
from pm_debug_investigation_guard_constants import HEX, PAYLOAD_ROOTS, PAYLOAD_URI

# Injected by pm_debug_investigation_transitions.load_documents() before any
# case is built: {document key: {document_uri: schema}}.
DOCUMENTS = None


def payload_subject(value, context):
    return value.get('payload')


def target_sha256_hex(value, context):
    # The published schema's pattern ^[0-9a-f]{64}$ is not a supported atomic
    # schema row. The payload phase keeps its type and 64-character bounds as
    # schema rows; this row checks the character set of a 64-character string.
    if type(value.get('payload')) is not dict:
        return None
    payload = value['payload']
    if type(payload.get('target_bindings')) is not dict:
        return None
    bindings = payload['target_bindings']
    digest = bindings.get('source_sha256')
    if type(digest) is not str or len(digest) != 64:
        return None
    return 'invalid_payload' if not all(character in HEX for character in digest) else None


def target_payload_case(case_value):
    catalog = g.SchemaCatalog(DOCUMENTS[case_value.get('event_type')], roots=PAYLOAD_ROOTS)
    table = g.schema_table(catalog, {PAYLOAD_URI: payload_subject}, guards=[
        g.Guard('payload.target_sha256_hex', g.Invariant('/payload/target_bindings/source_sha256', 'has only lowercase hexadecimal characters'), 'invalid_payload', target_sha256_hex)])
    context = None

    def check(value):
        table.validate(PAYLOAD_URI, value, context)
        table.require('payload.target_sha256_hex', value, context)
        return True
    return g.Case(table, check, context)
