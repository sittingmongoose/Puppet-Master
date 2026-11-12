"""DS adapter for the shared CV-1101 date-time predicate (`pm_event_datetime.date_time`).

DS keeps no timestamp grammar of its own (sweep part 2B). Every `format:
date-time` a DS validator meets is checked by the shared predicate under one
explicit owner profile, and a refusal is a format error whose cause is the
shared `Refusal`. At the Storage-assigned `observed_at_utc` / `persisted_at_utc`
fields of every schema node the shared inventory classifies as a CV-253 Storage
node (read as data by its reviewed path and pointer, never by a field-name
guess), the strict `storage_utc_z` profile is added on top (`storage_properties`,
installed by `pm_home_layout_v2_slot_receipt` in every DS validator class).
Strings are validated only, never rewritten: hashes and identities keep the
exact original spelling. Ordering uses `instant`, an exact key on the shared
predicate's own calendar and announced leap-second table, so every value the
predicate accepts (lowercase `t`/`z`, offsets, a legitimate leap second, year
0000, any fraction length) orders exactly and no fraction is truncated.

`datetime_validator` and the whole-`Plans/` inventory gate are not called here:
in a lane tree they refuse on hash drift (SWEEP-P2B addendum 2); they run at
batch-2 integration.
"""
import hashlib
import json
from bisect import bisect_left
from fractions import Fraction
from functools import lru_cache
from pathlib import Path

from jsonschema import Draft202012Validator
from jsonschema import FormatChecker as _FormatChecker
from jsonschema.exceptions import FormatError, ValidationError

import pm_event_datetime as _shared
from pm_event_datetime import EVENT_RECORD, STORAGE_UTC_Z, date_time as shared_date_time
from pm_event_numbers import Refusal

__all__ = ('EVENT_RECORD', 'STORAGE_UTC_Z', 'FormatChecker', 'Refusal', 'date_time_ok', 'date_time_refusal',
           'instant', 'after_seconds', 'shared_date_time', 'storage_properties', 'storage_node_fields', 'keep_dialect')

ROOT = Path(__file__).resolve().parents[1]
INVENTORY = 'Plans/event_datetime_inventory.json'
DRAFT202012 = 'https://json-schema.org/draft/2020-12/schema'
# DS's own drafted EventRecord successor (the DL-270 3.0.0 body route, not yet in the shared inventory)
# carries the same Storage-assigned fields as the inventoried 2.0.0 root and its frozen 1.0.0 reader
# (CV-253; Plans/event_record_v3.schema.json). Recorded for the batch-2 inventory refresh.
LANE_STORAGE_NODES = (
    ('Plans/event_record_v3.schema.json', '', ('observed_at_utc', 'persisted_at_utc')),
    ('Plans/event_record_v3.schema.json', '/$defs/event_record_1_0_0_compatibility_reader',
     ('observed_at_utc', 'persisted_at_utc')),
)

# The shared predicate's own announced leap seconds (the UTC second index of each inserted 23:59:60's predecessor).
_LEAP = sorted(_shared._LEAP_PRECEDING_SECONDS)


class FormatChecker(_FormatChecker):
    """The stock formats plus the shared CV-1101 `date-time` predicate under one explicit profile.

    A format DS does not implement fails instead of being skipped. As in the
    shared `format_checker`, every value the validator treats as a string
    reaches the predicate (a `str` subclass refuses as `date_time_type`); a
    non-string is left to the schema's `type` keyword.
    """

    def __init__(self, formats=None, *, profile=EVENT_RECORD):
        super().__init__(formats)
        if type(profile) is not str or profile not in _shared.PROFILES:
            raise Refusal('date_time_profile')
        self.profile = profile

        def check(value):
            return True if not isinstance(value, str) else shared_date_time(value, profile=profile) == value

        self.checks('date-time', raises=Refusal)(check)

    def check(self, instance, format):
        if format not in self.checkers:
            raise FormatError('unimplemented contract format: ' + format)
        return super().check(instance, format)


def date_time_refusal(value, profile=EVENT_RECORD):
    """The shared predicate's refusal reason for `value` under `profile`, or None when it accepts."""
    try:
        shared_date_time(value, profile=profile)
    except Refusal as refusal:
        return refusal.reason
    return None


def date_time_ok(value, profile=EVENT_RECORD):
    return date_time_refusal(value, profile) is None


def instant(value, profile=EVENT_RECORD):
    """Exact order key of a timestamp the shared predicate accepts (raises its Refusal otherwise).

    Elapsed seconds count every announced leap second, so 23:59:60 is the one
    second between 23:59:59 and the next 00:00:00; the fraction is exact.
    """
    shared_date_time(value, profile=profile)
    match = _shared._DATE_TIME.fullmatch(value)
    year, month, day, hour, minute, second = map(int, match.group(1, 2, 3, 4, 5, 6))
    fraction, zone = match.group(7, 8)
    offset = 0
    if zone not in ('Z', 'z'):
        offset = (1 if zone[0] == '+' else -1) * (int(zone[1:3]) * 3600 + int(zone[4:6]) * 60)
    base = _shared._day_number(year, month, day) * 86400 + hour * 3600 + minute * 60 + min(second, 59) - offset
    elapsed = base + bisect_left(_LEAP, base) + (1 if second == 60 else 0)
    return elapsed, (Fraction(int(fraction), 10 ** len(fraction)) if fraction else Fraction(0))


def after_seconds(key, seconds):
    """The order key `seconds` elapsed seconds after `key` (an `instant` key)."""
    return key[0] + seconds, key[1]


def _fingerprint(node):
    return hashlib.sha256(json.dumps(node, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()


def _pointer(document, pointer):
    node = document
    for part in pointer.split('/')[1:] if pointer else []:
        part = part.replace('~1', '/').replace('~0', '~')
        node = node[int(part)] if isinstance(node, list) else node[part]
    return node


@lru_cache(maxsize=4)
def storage_nodes(root=ROOT):
    """{content fingerprint of a classified schema node: its CV-253 Storage fields}.

    Each node is the shared inventory's `storage_utc_z` row resolved at its
    reviewed path and pointer in this tree (rows whose file is absent here are
    skipped), plus the lane's own v3 successor nodes. Every classified node
    declares `properties`, the keyword `storage_properties` extends.
    """
    rows = [(n['path'], n['pointer'], tuple(n['fields'])) for n in json.loads((root / INVENTORY).read_text())['nodes']
            if n['profile'] == STORAGE_UTC_Z and n['origin'] == 'json']
    out, documents = {}, {}
    for path, pointer, fields in rows + list(LANE_STORAGE_NODES):
        if path not in documents:
            documents[path] = json.loads((root / path).read_text()) if (root / path).exists() else None
        if documents[path] is None:
            continue
        node = _pointer(documents[path], pointer)
        if not isinstance(node, dict) or 'properties' not in node:
            raise ValueError('storage_node_without_properties: ' + path + '#' + pointer)
        out.setdefault(_fingerprint(node), set()).update(fields)
    return {key: tuple(sorted(value)) for key, value in out.items()}


_CLASSIFIED = {}


def storage_node_fields(schema):
    """The CV-253 Storage fields of this exact schema node (empty for every other node)."""
    cached = _CLASSIFIED.get(id(schema))
    if cached is not None and cached[0] is schema:
        return cached[1]
    fields = storage_nodes().get(_fingerprint(schema), ()) if isinstance(schema, dict) else ()
    _CLASSIFIED[id(schema)] = (schema, fields)
    return fields


_STOCK_PROPERTIES = Draft202012Validator.VALIDATORS['properties']


def storage_properties(validator, properties, instance, schema):
    """`properties`, then CV-253 `storage_utc_z` at the Storage fields of a classified Storage node.

    The original schema and the validator's own date-time predicate stay in
    force (the stock keyword runs first); the strict profile is composed on top,
    only at the inventoried nodes and fields. A refusal is a format error at the
    field whose cause is the shared Refusal.
    """
    yield from _STOCK_PROPERTIES(validator, properties, instance, schema)
    fields = storage_node_fields(schema)
    if not fields or not validator.is_type(instance, 'object'):
        return
    for field in fields:
        value = instance.get(field)
        if field not in instance or not validator.is_type(value, 'string'):
            continue
        try:
            shared_date_time(value, profile=STORAGE_UTC_Z)
        except Refusal as refusal:
            yield ValidationError('%r is not a CV-253 storage_utc_z date-time' % (value,), validator='format',
                                  validator_value='date-time', instance=value, schema=properties.get(field, {}),
                                  path=(field,), schema_path=('properties', field, 'format'), cause=refusal)


def keep_dialect(cls):
    """Keep this validator class across `$ref` into a resource that declares `$schema`.

    jsonschema 4.19.2's `evolve` re-selects the stock class by the declared
    dialect, which drops an extended type checker, keyword or format profile
    exactly where validation crosses into another resource. Every committed
    Plans schema is draft 2020-12; any other declared dialect is refused.
    """
    import attrs

    def evolve(self, **changes):
        schema = changes.setdefault('schema', self.schema)
        if isinstance(schema, dict) and schema.get('$schema', DRAFT202012).rstrip('#') != DRAFT202012:
            raise Refusal('unsupported_schema_dialect')
        for field in attrs.fields(type(self)):
            if field.init and field.alias not in changes:
                changes[field.alias] = getattr(self, field.name)
        return type(self)(**changes)

    cls.evolve = evolve
    return cls
