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

FIELDS = ('physical_refusal',)


def I02_finite_float(value, context):
    return 'nonfinite' if value['physical_refusal'] == 'physical_nonfinite' else None


def I03_supported_type(value, context):
    return 'unsupported value' if value['physical_refusal'] in ('physical_type', 'physical_key_type') else None


def I04_integer_range(value, context):
    return 'physical integer range' if value['physical_refusal'] == 'physical_integer_range' else None


def I05_unicode_scalar(value, context):
    return 'invalid unicode' if value['physical_refusal'] == 'unicode_scalar' else None


def value_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('I02_finite_float', g.Invariant('/physical_refusal', 'every float in the EVENT_VALUE bytes is finite (SP-1100 storage_value_bytes)'), 'nonfinite', I02_finite_float),
        g.Guard('I03_supported_type', g.Invariant('/physical_refusal', 'every value and map key has an EVENT_VALUE type (SP-1100 storage_value_bytes)'), 'unsupported value', I03_supported_type),
        g.Guard('I04_integer_range', g.Invariant('/physical_refusal', 'every integer is within the SP-1100 physical range -2^63..2^64-1'), 'physical integer range', I04_integer_range),
        g.Guard('I05_unicode_scalar', g.Invariant('/physical_refusal', 'every string and key is Unicode scalar values (SP-1100 storage_value_bytes)'), 'invalid unicode', I05_unicode_scalar),
    ])

    def check(value):
        table.require('I02_finite_float', value, context)
        table.require('I03_supported_type', value, context)
        table.require('I04_integer_range', value, context)
        table.require('I05_unicode_scalar', value, context)
        return True
    return g.Case(table, check, context)
