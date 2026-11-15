"""C12-SL shared helpers for the Storage compaction, deletion, hold and quarantine boundaries.

This is NOT an extension module: the s3bo loader discovers only
pm_s3bo_ext_*.py. It holds owner-recipe codecs, compact projections and fixture
constructors used by the SL extensions. Nothing here decides acceptance; every
refusal is a table predicate over raw operands projected by an extension's
operands().
"""
import copy
import datetime
import hashlib
import json
import re

import pm_s3bo_oracles as w
from pm_event_numbers import INDEX_BINDING


def sha(data):
    return hashlib.sha256(data).hexdigest()


def hmp(value):
    """SP-295 HMP(x) = SHA-256 of the unchanged Case L-2 canonical MessagePack (shared storage_value_bytes)."""
    return sha(w.storage_value_bytes(value, profile=w.EVENT_VALUE))


def mp(value):
    return w.storage_value_bytes(value, profile=w.EVENT_VALUE)


def bdig(value):
    """SP-278 binding digest: SHA-256 of the canonical binding MessagePack of {domain, value}."""
    return sha(w.storage_value_bytes({'domain': INDEX_BINDING, 'value': value}, profile=INDEX_BINDING))


def _canon(value):
    """Typed canonical tree: huge integers by hex (no decimal-length limit), floats by hex."""
    if value is None or isinstance(value, bool):
        return ['k', value]
    if isinstance(value, int):
        return ['i', format(value, 'x') if value >= 0 else '-' + format(-value, 'x')]
    if isinstance(value, float):
        return ['f', value.hex()]
    if isinstance(value, str):
        return ['s', value]
    if isinstance(value, (list, tuple)):
        return ['l', [_canon(x) for x in value]]
    if isinstance(value, dict):
        return ['d', [[str(k), _canon(v)] for k, v in sorted(value.items(), key=lambda kv: str(kv[0]))]]
    return ['o', type(value).__name__, str(value)]


def cj(value):
    """Compact typed digest of an independently held copy (equal iff the typed tree is identical).

    Booleans, integers and floats keep distinct tags, so 1, 1.0 and true never
    compare equal; a 4,400-digit integer is encoded without decimal conversion.
    """
    return sha(json.dumps(_canon(value), separators=(',', ':'), ensure_ascii=False).encode())


def physical_hex(value):
    try:
        return sha(w.storage_value_bytes(value, profile=w.EVENT_VALUE))
    except w.Refusal as exc:
        return 'refused:' + exc.reason


_INSTANT = re.compile(r'(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?([Zz]|[+-]\d{2}:\d{2})')


def utc(text):
    """Comparable UTC instant of an already admitted RFC 3339 value: (datetime, fraction digits).

    The shared date_time call admits the spelling first; this only orders two
    admitted values, with any number of fraction digits and either case.
    """
    m = _INSTANT.fullmatch(text)
    if m is None:
        raise ValueError('not an admitted date-time: ' + text)
    y, mo, d, h, mi, sec, frac, zone = m.groups()
    base = datetime.datetime(int(y), int(mo), int(d), int(h), int(mi), int(sec), tzinfo=datetime.timezone.utc)
    if zone not in ('Z', 'z'):
        sign = 1 if zone[0] == '+' else -1
        base -= sign * datetime.timedelta(hours=int(zone[1:3]), minutes=int(zone[4:6]))
    return _Instant(base, (frac or '').rstrip('0'))


class _Instant:
    def __init__(self, base, frac):
        self.base = base; self.frac = frac

    def _key(self):
        return (self.base, self.frac.ljust(32, '0'))

    def __ge__(self, other):
        return self._key() >= other._key()

    def __sub__(self, other):
        return self.base - other.base

    def timestamp(self):
        return self.base.timestamp()


def plus(text, seconds):
    return (utc(text) + datetime.timedelta(seconds=seconds)).strftime('%Y-%m-%dT%H:%M:%SZ')


def time_ok(text, profile):
    return isinstance(text, str) and w.caught(w.date_time, text, profile=profile) is None


def int_ok(value, minimum=0, maximum=None):
    return w.caught(w.current_integer, value, minimum=minimum, maximum=maximum) is None


def number_errors(slots):
    """Shared CV-1100 current_integer at each (label, value, minimum, maximum) slot; None is an absent slot."""
    out = []
    for label, value, minimum, maximum in slots:
        if value is None:
            continue
        error = w.caught(w.current_integer, value, minimum=minimum, maximum=maximum)
        if error:
            out.append((label, error))
    return out


def date_errors(slots):
    """Shared CV-1101 date_time at each (label, text, profile) slot; non-strings are owned by a schema type row."""
    out = []
    for label, text, profile in slots:
        if text is None:
            continue
        if not isinstance(text, str):
            out.append((label, 'not_a_string'))
            continue
        error = w.caught(w.date_time, text, profile=profile)
        if error:
            out.append((label, error))
    return out


def keyword_errors(schema, value):
    """Every non-format keyword diagnostic of the complete owner schema; format is the shared date-time row's.

    Registry value schemas carry no $id and no external $ref, so they validate
    directly; identified schemas use the s3bo owner-resource catalogue.
    """
    if '$id' not in schema:
        from jsonschema import Draft202012Validator
        return [list(e.absolute_path) + [e.validator] for e in Draft202012Validator(schema).iter_errors(value) if e.validator != 'format']
    return [e for e in w.schema_errors(schema, value) if e[-1] != 'format']


def control(family, label, value):
    return {'id': family + '/sl/' + label, 'value': value, 'boundary': 'append'}


def deep(value):
    return copy.deepcopy(value)


def runs_of(case, family):
    sl = case.get('sl')
    if not isinstance(sl, dict) or sl.get('family') != family or not isinstance(sl.get('runs'), list):
        return None
    return sl['runs']


def event(base, payload, event_id, key, **envelope):
    """A complete EventRecord copy for one boundary run, derived from the family's common control."""
    value = copy.deepcopy(base)
    value['payload'] = copy.deepcopy(payload)
    value['event_id'] = event_id
    value['idempotency_key'] = key
    value.update(envelope)
    return value
