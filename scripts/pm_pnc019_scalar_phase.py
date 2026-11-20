"""PNC-019 atomic schema phase; its owner schema is also executed in full."""
import pm_guard_isolation as g

DOCUMENTS = None
URI = 'https://puppetmaster.local/pnc019/s4o1/atomic-phase.schema.json'


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
