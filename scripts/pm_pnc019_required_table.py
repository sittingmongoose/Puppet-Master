"""PNC-019 required-member phase, on the gated SchemaCatalog engine.

The driver binds one literal required-member group of at most eight entries.
This is a schema phase, not a complete lifecycle checker. The owner schema is
also executed in full against the same complete payload by the cell runner.
"""
import pm_guard_isolation as g

DOCUMENTS = None
URI = 'https://puppetmaster.local/pnc019/s4o1/required-phase.schema.json'


def selected(value, context):
    return value


def case():
    catalog = g.SchemaCatalog(DOCUMENTS, roots=(URI,))
    table = g.schema_table(catalog, {URI: selected})
    context = None

    def check(value):
        table.validate(URI, value, context)
        return True
    return g.Case(table, check, context)
