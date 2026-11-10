"""Exact DG6A input domains. No optional format-validation dependencies.

Numbers follow the shared NUMRULE number scope (CV-1100, SP-1100; helper
scripts/pm_event_numbers.py, merged at a16f67c1ef): raw JSON is parsed by
loads_current_json, every schema integer slot is admitted by current_integer
with the schema's own bounds, and no lane-local integer cap remains. Timestamp
grammar below is unchanged (the date-time gate is part 2B; this lane's own
review of its timestamp fields is interim only).
"""
import json
import re
import sys
from contextlib import contextmanager
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from jsonschema import Draft202012Validator as BaseValidator, FormatChecker, validators

if str(Path(__file__).resolve().parent) not in sys.path:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
from pm_event_numbers import Refusal, current_integer, loads_current_json  # noqa: E402
# RFC3339 spelling with a required zone; calendar validity checked separately.
# Fractional seconds have one or more decimal digits. Leap seconds are refused.
INSTANT_PATTERN = r"[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt](?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](?:\.[0-9]+)?(?:[Zz]|[+-](?:[01][0-9]|2[0-3]):[0-5][0-9])"
UUID_PATTERN = r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"


def instant(value):
    if type(value) is not str or re.fullmatch(INSTANT_PATTERN, value) is None:
        return False
    try:
        # datetime truncates long fractions, but validation compares no fractions.
        # The grammar checks spelling; datetime checks date, time and offset ranges.
        if value[17:19] == '60':
            return False
        datetime.fromisoformat(value.upper())
    except ValueError:
        return False
    return True


FORMATS = FormatChecker()
FORMATS.checks('date-time')(lambda v: type(v) is not str or instant(v))
FORMATS.checks('uuid')(lambda v: type(v) is not str or re.fullmatch(UUID_PATTERN, v) is not None)
def current_integer_slot(checker, value):
    """A schema integer slot admits exactly what the shared current_integer admits.

    The slot's owner bounds stay its own minimum/maximum keywords (CV-1100 sets no
    global cap); bool, float and Decimal carriers are not integers.
    """
    try:
        current_integer(value)
    except Refusal:
        return False
    return True


ExactValidator = validators.extend(BaseValidator, type_checker=BaseValidator.TYPE_CHECKER.redefine(
    'integer', current_integer_slot))


@contextmanager
def exact_integer_text():
    """Render integers exactly while jsonschema formats error messages, then restore.

    CV-1100 sets no global integer cap, so a valid 4,400-digit integer must not make
    Python's default str() digit limit raise inside a refusal message.
    """
    previous = sys.get_int_max_str_digits()
    sys.set_int_max_str_digits(0)
    try:
        yield
    finally:
        sys.set_int_max_str_digits(previous)


class ExactSchemaValidator:
    """The exact-type, enforced-format validator; errors are materialized under exact_integer_text."""

    def __init__(self, inner):
        self._inner = inner

    def iter_errors(self, instance):
        with exact_integer_text():
            return iter(list(self._inner.iter_errors(instance)))

    def is_valid(self, instance):
        return not list(self.iter_errors(instance))


def validator(schema, *args, **kwargs):
    # Passing an empty ambient FormatChecker must never disable these formats.
    kwargs['format_checker'] = FORMATS
    # Embedded payloads carry their own $schema. jsonschema otherwise evolves
    # back to its permissive base type checker while descending into them.
    def exact_dialect(node):
        if type(node) is dict:
            return {k:exact_dialect(v) for k,v in node.items() if k != '$schema'}
        if type(node) is list:
            return [exact_dialect(v) for v in node]
        return node
    return ExactSchemaValidator(ExactValidator(exact_dialect(schema), *args, **kwargs))


validator.check_schema = ExactValidator.check_schema


def loads(text):
    """The shared CV-1100 current parser: -0, 01, nonfinite constants, duplicate keys and
    lone surrogates refuse (Refusal is a ValueError); fractional tokens stay exact
    ParsedDecimal carriers, never binary64."""
    return loads_current_json(text)


def semantic_numbers(value):
    """One numeric spelling in a semantic recipe preimage (CV-1100), with no lane cap.

    A request/identity preimage holds exact integers only: a float or Decimal
    carrier (an integral float would yield a second identity for the same value)
    refuses. Magnitude is not limited here; an integer the canonical MessagePack
    recipe cannot encode is refused by that recipe (an existing route refusal).
    """
    if type(value) is float or isinstance(value, Decimal):
        raise Refusal('semantic_number_kind')
    if type(value) is dict:
        for child in value.values():
            semantic_numbers(child)
    elif type(value) is list:
        for child in value:
            semantic_numbers(child)


def instant_key(value):
    if not instant(value):
        raise ValueError('invalid timestamp')
    match = re.fullmatch(r'(.*:[0-9]{2})(\.[0-9]+)?([Zz]|[+-][0-9]{2}:[0-9]{2})', value)
    base, fraction, zone = match.groups()
    dt = datetime.fromisoformat((base + zone).upper())
    # Integer local-day arithmetic also handles valid year-1/year-9999
    # instants whose UTC day would fall outside datetime's representable years.
    delta = dt.replace(tzinfo=None) - datetime(1970, 1, 1)
    offset = dt.utcoffset()
    offset_seconds = offset.days * 86400 + offset.seconds
    # Compare fractions as digit strings padded on the right, without truncation
    # or a Decimal arithmetic context that could round a long input.
    return delta.days * 86400 + delta.seconds - offset_seconds, (fraction or '.0')[1:].rstrip('0')


def instant_le(left, right):
    a, af = instant_key(left)
    b, bf = instant_key(right)
    width = max(len(af), len(bf))
    return (a, af.ljust(width, '0')) <= (b, bf.ljust(width, '0'))


def semantic_formats(value):
    if type(value) is dict:
        for key, child in value.items():
            if key in {'ts', 'settled_at_utc', 'created_at', 'updated_at', 'occurred_at_utc',
                       'resolved_at', 'snooze_until', 'mute_expires_at', 'acknowledged_at_utc', 'observed_at_utc', 'persisted_at_utc'}:
                if child is not None or key in {'ts', 'settled_at_utc', 'created_at', 'updated_at', 'occurred_at_utc', 'acknowledged_at_utc', 'observed_at_utc', 'persisted_at_utc'}:
                    if not instant(child):
                        raise ValueError('invalid semantic timestamp')
            semantic_formats(child)
    elif type(value) is list:
        for child in value:
            semantic_formats(child)
