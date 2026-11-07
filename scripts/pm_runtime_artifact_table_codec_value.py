"""DR guard table codec_value: Codec, identity, validator-profile, oracle and reference preconditions.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('nonfinite_floats', 'unsupported_values')


def I02_finite_float(value, context):
    return 'nonfinite' if value['nonfinite_floats'] != 0 else None


def I03_supported_type(value, context):
    return 'unsupported value' if value['unsupported_values'] != 0 else None


def value_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('I02_finite_float', g.Invariant('/nonfinite_floats', 'every float in the encoded value is finite'), 'nonfinite', I02_finite_float),
        g.Guard('I03_supported_type', g.Invariant('/unsupported_values', 'every encoded value is dict, list, str, int, float, bool or null'), 'unsupported value', I03_supported_type),
    ])

    def check(value):
        table.require('I02_finite_float', value, context)
        table.require('I03_supported_type', value, context)
        return True
    return g.Case(table, check, context)
