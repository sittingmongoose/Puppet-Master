"""DDBG guard table: Typed cleanup retry initiation (DL-429), before an attempt or body exists.

Part of the DDBG guard tables; the domain rule and phase order are in
pm_debug_investigation_guard_constants.py. Every refusal here is a named
predicate row; the factory builds a fresh table and Case for each candidate.
"""
import pm_guard_isolation as g
from pm_debug_investigation_guard_constants import (
    RETRY_CEILING, RETRY_ROOTS, RETRY_URI)

# Injected by pm_debug_investigation_transitions.load_documents() before any
# case is built: {document key: {document_uri: schema}}.
DOCUMENTS = None


def retry_request_subject(value, context):
    return value


def retry_authorization(value, context):
    if type(value) is not dict:
        return None
    return 'retry_authorization_required' if value.get('authorized') is False else None


def retry_ceiling(value, context):
    if type(value) is not dict:
        return None
    used = value.get('retries_used')
    if type(used) is not int or not 0 <= used <= 2:
        return None
    return 'retry_ceiling' if used >= RETRY_CEILING else None


def retry_request_case(case_value):
    catalog = g.SchemaCatalog(DOCUMENTS['retry_request'], roots=RETRY_ROOTS)
    table = g.schema_table(catalog, {RETRY_URI: retry_request_subject}, guards=[
        g.Guard('retry.authorization', g.Invariant('/authorized', 'is true'), 'retry_authorization_required', retry_authorization),
        g.Guard('retry.ceiling', g.Invariant('/retries_used', 'is below two (two retries after the initial attempt)'), 'retry_ceiling', retry_ceiling)])
    context = None

    def check(value):
        table.validate(RETRY_URI, value, context)
        table.require('retry.authorization', value, context)
        table.require('retry.ceiling', value, context)
        return True
    return g.Case(table, check, context)
