"""Exact DG6A input domains. No optional format-validation dependencies."""
import json
import re
from datetime import datetime, timezone
from jsonschema import Draft202012Validator as BaseValidator, FormatChecker, validators

SAFE_INTEGER = 9007199254740991
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
ExactValidator = validators.extend(BaseValidator, type_checker=BaseValidator.TYPE_CHECKER.redefine(
    'integer', lambda checker, value: type(value) is int))


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
    return ExactValidator(exact_dialect(schema), *args, **kwargs)


validator.check_schema = ExactValidator.check_schema


def integer_token(token):
    if token == '-0':
        raise ValueError('noncanonical negative-zero integer token')
    return int(token)


def invalid_constant(token):
    raise ValueError('non-JSON numeric constant: ' + token)


def loads(text):
    return json.loads(text, parse_int=integer_token, parse_constant=invalid_constant)


def semantic_numbers(value):
    """Safe exact integer semantic domain, before hash/identity/retry encoding."""
    if type(value) is float or (type(value) is int and abs(value) > SAFE_INTEGER):
        raise ValueError('noncanonical or unsafe semantic number')
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
