"""DDBG guard table: Instrumentation source phase: the original source record schema (DL-429).

Part of the DDBG guard tables; the domain rule and phase order are in
pm_debug_investigation_guard_constants.py. Every refusal here is a named
predicate row; the factory builds a fresh table and Case for each candidate.
"""
import pm_guard_isolation as g
from pm_debug_investigation_guard_constants import (
    SOURCE_ROOTS, SOURCE_URI)

# Injected by pm_debug_investigation_transitions.load_documents() before any
# case is built: {document key: {document_uri: schema}}.
DOCUMENTS = None


def instrumentation_source_subject(value, context):
    return value.get('instrumentation_source')


def instrumentation_source_case(case_value):
    catalog = g.SchemaCatalog(DOCUMENTS['instrumentation_source'], roots=SOURCE_ROOTS)
    table = g.schema_table(catalog, {SOURCE_URI: instrumentation_source_subject})
    context = None

    def check(value):
        table.validate(SOURCE_URI, value, context)
        return True
    return g.Case(table, check, context)
