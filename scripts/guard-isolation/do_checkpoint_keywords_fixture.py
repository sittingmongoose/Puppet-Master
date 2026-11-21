"""Compare the DO coverage rule with its published schema const."""

import pm_guard_isolation as g
from do_checkpoint_coverage_1 import coverage_complete

URI = 'urn:test:do-checkpoint-coverage'
CONST = None
SCHEMA = None


def coverage_value(value, context):
    return value['coverage']


def make_case(value):
    catalog = g.SchemaCatalog({URI: SCHEMA})
    invariant = g.Invariant('/read/checkpoint/generations/*/frontier/coverage/complete_to_captured_boundary',
                            'is exactly true (duplicates the schema const)')
    catalog.bind(CONST, invariant, 'The generated DO guard and the coverage schema read the same field.',
                 refusal_code='checkpoint_schema')
    table = g.schema_table(catalog, {URI: coverage_value}, guards=[
        g.Guard('coverage_complete', invariant, 'index_complete_source_coverage', coverage_complete)])
    context = None

    def check(value):
        table.validate(URI, value, context)
        table.require('coverage_complete', value, context)
        return True

    return g.Case(table, check, context)
