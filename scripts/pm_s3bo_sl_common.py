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


def _days_from_civil(y, m, d):
    """Proleptic Gregorian day number (Hinnant), valid for every year the shared profiles admit, including 0000."""
    y -= m <= 2
    era = (y if y >= 0 else y - 399) // 400
    yoe = y - era * 400
    doy = (153 * (m + (-3 if m > 2 else 9)) + 2) // 5 + d - 1
    doe = yoe * 365 + yoe // 4 - yoe // 100 + doy
    return era * 146097 + doe - 719468


def utc(text):
    """Comparable UTC instant of an already admitted RFC 3339 value, by integer seconds plus fraction digits.

    The shared date_time call admits the spelling first; this only orders two
    admitted values (any year, offset, case, fraction length or leap second).
    """
    m = _INSTANT.fullmatch(text)
    if m is None:
        raise ValueError('not an admitted date-time: ' + text)
    y, mo, d, h, mi, sec, frac, zone = m.groups()
    seconds = _days_from_civil(int(y), int(mo), int(d)) * 86400 + int(h) * 3600 + int(mi) * 60 + int(sec)
    if zone not in ('Z', 'z'):
        sign = 1 if zone[0] == '+' else -1
        seconds -= sign * (int(zone[1:3]) * 3600 + int(zone[4:6]) * 60)
    return _Instant(seconds, (frac or '').rstrip('0'))


class _Span:
    def __init__(self, seconds):
        self.seconds = seconds

    def total_seconds(self):
        return self.seconds


class _Instant:
    def __init__(self, seconds, frac):
        self.seconds = seconds; self.frac = frac

    def _key(self):
        return (self.seconds, self.frac.ljust(32, '0'))

    def __ge__(self, other):
        return self._key() >= other._key()

    def __sub__(self, other):
        return _Span(self.seconds - other.seconds)

    def timestamp(self):
        return self.seconds


def time_ok(text, profile):
    return isinstance(text, str) and w.caught(w.date_time, text, profile=profile) is None


def int_ok(value, minimum=0, maximum=None):
    return w.caught(w.current_integer, value, minimum=minimum, maximum=maximum) is None


def number_errors(slots, required=False):
    """Shared CV-1100 current_integer at each (label, value, minimum, maximum) slot.

    None is an absent optional slot; with required=True a null is refused like
    any other non-integer (the owner field is a required non-null integer).
    """
    out = []
    for label, value, minimum, maximum in slots:
        if value is None and not required:
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


def _external_refs(node):
    if isinstance(node, dict):
        return any(k == '$ref' and isinstance(v, str) and not v.startswith('#') for k, v in node.items()) \
            or any(_external_refs(v) for v in node.values())
    if isinstance(node, list):
        return any(_external_refs(v) for v in node)
    return False


REGISTRY_VALUE_ID = 'urn:pm:s3bo:sl:registry-value-schema'


def keyword_errors(schema, value):
    """Every non-format keyword diagnostic of the complete owner schema; format is the shared date-time row's.

    A registry value schema without $id or external $ref validates directly.
    Identified schemas, and registry value schemas that reference an owner
    resource (the event_obligation member of storage_deletion_record and
    storage_quarantine_record refers to EventRecord 2.0.0), use the s3bo
    owner-resource catalogue; it never retrieves URLs.
    """
    if '$id' not in schema and not _external_refs(schema):
        from jsonschema import Draft202012Validator
        return [list(e.absolute_path) + [e.validator] for e in Draft202012Validator(schema).iter_errors(value) if e.validator != 'format']
    if '$id' not in schema:
        schema = dict(schema, **{'$id': REGISTRY_VALUE_ID})
    return [e for e in w.schema_errors(schema, value) if e[-1] != 'format']


# ---------------------------------------------------------------- stored event obligation (SP-2200, SP-2201)

STORAGE_ASSIGNED = ('sequence_id', 'observed_at_utc', 'persisted_at_utc')
OWNER_DERIVED = ('event_id', 'idempotency_key', 'payload', 'scope_kind', 'project_id', 'thread_id', 'run_id',
                 'attempt_id', 'replay_policy', 'event_type')
OBLIGATION = 'event_obligation'


def producer_part(event):
    """The producer-supplied EventRecord fields: what the record CAS freezes and an append sends; Storage adds the rest."""
    if not isinstance(event, dict):
        return event
    return {k: v for k, v in event.items() if k not in STORAGE_ASSIGNED}


def record_split(record):
    """(digest of the record without its obligation, the stored obligation or None)."""
    if not isinstance(record, dict):
        return cj(record), None
    return cj({k: v for k, v in record.items() if k != OBLIGATION}), record.get(OBLIGATION)


def obligation_owner(obligation):
    """The owner-derived part of a stored obligation: identity, payload digest and envelope scope."""
    if not isinstance(obligation, dict):
        return ['not_an_object', cj(obligation)]
    return (obligation.get('event_id'), obligation.get('idempotency_key'), cj(obligation.get('payload')),
            (obligation.get('scope_kind'), obligation.get('project_id'), obligation.get('thread_id'), obligation.get('run_id'),
             obligation.get('attempt_id'), obligation.get('replay_policy'), obligation.get('event_type')))


def obligation_rest(obligation):
    """Digest of the remaining producer fields, which the barrier append must send unchanged."""
    if not isinstance(obligation, dict):
        return cj(['not_an_object', obligation])
    return cj({k: v for k, v in obligation.items() if k not in OWNER_DERIVED})


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
