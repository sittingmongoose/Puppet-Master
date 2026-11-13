"""Exact DG6A input domains. No optional format-validation dependencies.

Numbers follow the shared NUMRULE number scope (CV-1100, SP-1100; helper
scripts/pm_event_numbers.py, merged at a16f67c1ef): raw JSON is parsed by
loads_current_json, every schema integer slot is admitted by current_integer
with the schema's own bounds, and no lane-local integer cap remains.

Timestamps follow CV-1101 (sweep part 2B, gated NUMRULE head 58c2816ff3): every
DG6A timestamp goes through the shared predicate pm_event_datetime.date_time
with the explicit owner profile of its field. Family payload, state and record
fields, EventRecord occurred_at_utc and the first-receipt acknowledged_at_utc
(declared format: date-time by their owner schemas) take the broad EventRecord
profile; Storage-assigned observed_at_utc/persisted_at_utc take CV-253's strict
storage_utc_z profile. The lane's own grammar is gone. datetime_validator and
the whole-Plans inventory gate run at batch-2 integration (lead, addendum 2).
"""
import calendar
import json
import re
import sys
from contextlib import contextmanager
from decimal import Decimal
from pathlib import Path
from jsonschema import Draft202012Validator as BaseValidator, FormatChecker, validators

if str(Path(__file__).resolve().parent) not in sys.path:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
from pm_event_numbers import Refusal, current_integer, loads_current_json  # noqa: E402
from pm_event_datetime import EVENT_RECORD, STORAGE_UTC_Z, date_time  # noqa: E402

UUID_PATTERN = r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
# CV-253: Storage assigns these two fields; every other DG6A timestamp keeps the broad EventRecord profile.
FIELD_PROFILES = {'observed_at_utc': STORAGE_UTC_Z, 'persisted_at_utc': STORAGE_UTC_Z}


def profile_of(field):
    """The explicit CV-1101 owner profile of a named DG6A timestamp field."""
    return FIELD_PROFILES.get(field, EVENT_RECORD)


def instant_refusal(value, profile=EVENT_RECORD):
    """The shared predicate's refusal reason for value under profile, or None when it accepts."""
    try:
        date_time(value, profile=profile)
    except Refusal as refusal:
        return refusal.reason
    return None


def instant(value, profile=EVENT_RECORD):
    return instant_refusal(value, profile) is None


FORMATS = FormatChecker()


@FORMATS.checks('date-time', raises=Refusal)
def event_record_date_time(value):
    """CV-1101: every `format: date-time` the lane validates runs the shared predicate (EventRecord profile).

    As in the shared format_checker, every value the validator treats as a string reaches the predicate (a str
    subclass refuses, date_time_type); a non-string is left to `type`. The original string is never rewritten.
    """
    return True if not isinstance(value, str) else date_time(value, profile=EVENT_RECORD) == value


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



def checkpoint_source_constraints(schema):
    """Compose the existing private lexical profile with the canonical SP-278 selector.

    The registry stores the exact nine-field nonsecret selector schema. This
    additional source-boundary check preserves all pre-integration constraints;
    it does not redact, rename, normalize or rewrite a selector value.
    """
    declaration = json.loads((Path(__file__).resolve().parents[1] / 'Plans/dg6a_checkpoint_source_constraints.json').read_text())
    canonical = declaration['canonical_durable_selector_schema']
    strict = declaration['source_constraint_schema']
    def compose(node):
        if isinstance(node, dict):
            result = {key: compose(value) for key, value in node.items()}
            properties = result.get('properties')
            if isinstance(properties, dict) and properties.get('index_read_token') == canonical:
                # The preserved profile only strengthens canonical lexical bounds.
                properties['index_read_token'] = strict
            return result
        if isinstance(node, list):
            return [compose(value) for value in node]
        return node
    return compose(schema)


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
    return ExactSchemaValidator(ExactValidator(exact_dialect(checkpoint_source_constraints(schema)), *args, **kwargs))


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


_INSTANT = re.compile(r"([0-9]{4})-([0-9]{2})-([0-9]{2})[Tt]([0-9]{2}):([0-9]{2}):([0-9]{2})(?:\.([0-9]+))?"
                      r"([Zz]|[+-][0-9]{2}:[0-9]{2})", re.ASCII)


def _day_number(year, month, day):
    # Proleptic Gregorian, including RFC 3339's year 0000 (no host datetime range).
    previous = year - 1
    return (365 * previous + previous // 4 - previous // 100 + previous // 400
            + sum(calendar.monthrange(year, m)[1] for m in range(1, month)) + day)


def instant_key(value, profile=EVENT_RECORD):
    """Exact order key of a timestamp the shared predicate accepts under profile (CV-1101 keeps exact
    comparison with its owners: offsets applied mathematically, every fractional digit kept).

    A legitimate leap second 23:59:60 sorts after 23:59:59.x and before the next 00:00:00: its key is
    the :59 second with the leap marker set. Refuses (Refusal, a ValueError) what the predicate refuses.
    """
    date_time(value, profile=profile)
    match = _INSTANT.fullmatch(value)
    year, month, day, hour, minute, second = map(int, match.group(1, 2, 3, 4, 5, 6))
    fraction, zone = match.group(7, 8)
    offset = 0
    if zone not in ('Z', 'z'):
        offset = (1 if zone[0] == '+' else -1) * (int(zone[1:3]) * 3600 + int(zone[4:6]) * 60)
    base = _day_number(year, month, day) * 86400 + hour * 3600 + minute * 60 + min(second, 59) - offset
    return base, 1 if second == 60 else 0, (fraction or '').rstrip('0')


def instant_le(left, right):
    a, al, af = instant_key(left)
    b, bl, bf = instant_key(right)
    width = max(len(af), len(bf))
    return (a, al, af.ljust(width, '0')) <= (b, bl, bf.ljust(width, '0'))


def semantic_formats(value):
    """Named semantic timestamps in a recipe preimage pass the shared CV-1101 predicate with their field profile."""
    if type(value) is dict:
        for key, child in value.items():
            if key in {'ts', 'settled_at_utc', 'created_at', 'updated_at', 'occurred_at_utc',
                       'resolved_at', 'snooze_until', 'mute_expires_at', 'acknowledged_at_utc', 'observed_at_utc', 'persisted_at_utc'}:
                if child is not None or key in {'ts', 'settled_at_utc', 'created_at', 'updated_at', 'occurred_at_utc', 'acknowledged_at_utc', 'observed_at_utc', 'persisted_at_utc'}:
                    if not instant(child, profile_of(key)):
                        raise ValueError('invalid semantic timestamp')
            semantic_formats(child)
    elif type(value) is list:
        for child in value:
            semantic_formats(child)
