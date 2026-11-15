"""DO C12: the original complete index-row schema predicate, before field inspection."""
import pm_guard_isolation as g


def index_row_value_schema(value, context):
    return 'index_row_schema' if value['index_row_schema_valid'] is not True else None


ROWS = (
    ('index_row_value_schema', '/read/row', 'validates against the event_record_index value schema',
     'index_row_schema', index_row_value_schema, ('index_row_schema_valid',), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('index_row_value_schema', g.Invariant('/read/row', 'validates against the event_record_index value schema'), 'index_row_schema', index_row_value_schema),
    ])
    context = None

    def check(complete):
        table.require('index_row_value_schema', complete, context)
        return True
    return g.Case(table, check, context)
