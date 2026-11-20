"""C12-SS shared helpers for the Storage, platform and seglog family boundaries.

This is NOT an extension module: the s3bo loader discovers only
pm_s3bo_ext_*.py. It holds owner codecs and fixture constructors used by the SS
extensions. Nothing here decides acceptance; every refusal is a table predicate
over raw operands projected by an extension's operands().
"""
import copy
import hashlib
import json

import pm_s3bo_oracles as w
from pm_event_numbers import qualified_jcs

RECEIPT_KEYS = ('event_id', 'sequence_id', 'segment_generation', 'segment_name', 'byte_offset', 'commit_group_id',
                'durability_class', 'durable_end_offset', 'durability_state', 'manifest_generation', 'acknowledged_at_utc')
RECEIPT_NUMBERS = ('sequence_id', 'segment_generation', 'byte_offset', 'durable_end_offset', 'manifest_generation')


class CodecRefusal(ValueError):
    def __init__(self, reason):
        super().__init__(reason)
        self.reason = reason


def _string(text):
    out = ['"']
    for ch in text:
        o = ord(ch)
        if 0xD800 <= o <= 0xDFFF:
            raise CodecRefusal('surrogate')
        if ch == '"':
            out.append('\\"')
        elif ch == '\\':
            out.append('\\\\')
        elif ch == '\b':
            out.append('\\b')
        elif ch == '\t':
            out.append('\\t')
        elif ch == '\n':
            out.append('\\n')
        elif ch == '\f':
            out.append('\\f')
        elif ch == '\r':
            out.append('\\r')
        elif o < 0x20:
            out.append('\\u%04x' % o)
        else:
            out.append(ch)
    out.append('"')
    return ''.join(out)


def canonical_json(value, *, signed=False):
    """SP-279 canonical_uint_json.v1 (signed=False) or the SP-290 restricted JSON codec (signed=True).

    Objects, arrays, strings, booleans, null and exact integers only (unsigned
    for canonical_uint_json.v1); keys sorted by UTF-8 bytes; no whitespace;
    quote/backslash and the five short escapes; other C0 controls as lowercase
    \\u00hh; every other scalar literal UTF-8. Floats, booleans-as-numbers,
    non-string keys and surrogates refuse. Returns UTF-8 bytes.
    """
    def enc(v):
        if v is None:
            return 'null'
        if v is True:
            return 'true'
        if v is False:
            return 'false'
        if type(v) is int:
            if v < 0 and not signed:
                raise CodecRefusal('negative_integer')
            return str(v)
        if type(v) is str:
            return _string(v)
        if type(v) is list:
            return '[' + ','.join(enc(x) for x in v) + ']'
        if type(v) is dict:
            if any(type(k) is not str for k in v):
                raise CodecRefusal('key_type')
            keys = sorted(v, key=lambda k: k.encode('utf-8', 'surrogatepass'))
            return '{' + ','.join(_string(k) + ':' + enc(v[k]) for k in keys) + '}'
        raise CodecRefusal('value_type')
    return enc(value).encode('utf-8')


def decode_canonical_json(raw, *, signed=False):
    """Decode exact bytes; refuse duplicate keys, non-integers and any bytes unequal to re-encoding."""
    def pairs(items):
        out = {}
        for k, v in items:
            if k in out:
                raise CodecRefusal('duplicate_key')
            out[k] = v
        return out
    try:
        text = raw.decode('utf-8')
        value = json.loads(text, object_pairs_hook=pairs, parse_float=lambda s: (_ for _ in ()).throw(CodecRefusal('float')),
                           parse_constant=lambda s: (_ for _ in ()).throw(CodecRefusal('constant')))
    except CodecRefusal:
        raise
    except (UnicodeDecodeError, ValueError):
        raise CodecRefusal('syntax')
    if canonical_json(value, signed=signed) != raw:
        raise CodecRefusal('noncanonical')
    return value


def decode_hex_or_reason(text, *, signed=False):
    try:
        return decode_canonical_json(bytes.fromhex(text), signed=signed), None
    except (CodecRefusal, ValueError, TypeError) as exc:
        return None, 'undecodable:' + getattr(exc, 'reason', 'hex')


def jcs_sha(value):
    """Lowercase SHA-256 of actual qualified RFC 8785 (the shared CV-317 primitive)."""
    return hashlib.sha256(qualified_jcs(value)).hexdigest()


def receipt_for(event, *, offset=512, group='group-A', time=None, durability='barrier'):
    """An eleven-field first AppendReceipt for a stored event (fixture constructor)."""
    return dict(event_id=event['event_id'], sequence_id=event['sequence_id'], segment_generation=3,
                segment_name='seg-000003-' + str(event['sequence_id']).zfill(20) + '.active', byte_offset=offset,
                commit_group_id=group, durability_class=durability, durable_end_offset=offset + 1792,
                durability_state='synced', manifest_generation=17, acknowledged_at_utc=time or w.TIME)


def append_result(receipt):
    """The four-field original append result joined to its first receipt."""
    return dict(event_id=receipt['event_id'], sequence_id=receipt['sequence_id'], byte_offset=receipt['byte_offset'],
                segment_ref=receipt['segment_name'])


def semantic_or_reason(event):
    """Shared producer-semantic digest, or the shared route's refusal reason (never a substitute digest)."""
    try:
        return w.producer_semantic_digest(w.semantic(event))
    except w.Refusal as exc:
        return 'unavailable:' + exc.reason


def full_value_or_reason(event):
    try:
        return w.full_value_commitment(event)
    except w.Refusal as exc:
        return 'unavailable:' + exc.reason


def physical_sha(value):
    try:
        return w.sha(w.storage_value_bytes(value, profile=w.EVENT_VALUE))
    except w.Refusal as exc:
        return 'refused:' + exc.reason


def time_errors(paths_values, profile):
    errors = []
    for path, value in paths_values:
        error = w.caught(w.date_time, value, profile=profile)
        if error:
            errors.append((path, error))
    return errors


def number_errors(paths_values):
    """(path, value, minimum, maximum) tuples through shared current_integer."""
    errors = []
    for path, value, minimum, maximum in paths_values:
        error = w.caught(w.current_integer, value, minimum=minimum, maximum=maximum)
        if error:
            errors.append((path, error))
    return errors


def numbers_ok(paths_values):
    return not number_errors(paths_values)


def control(family_id, label, value):
    return {'id': family_id + '/ss/' + label, 'value': value, 'boundary': 'append'}


def deep(value):
    return copy.deepcopy(value)


def live_token(case, snapshot='snapshot-A'):
    return dict(case['token'], redb_snapshot_id=snapshot)


def typed(value):
    """Type-exact projection for an equality row: True, 1, 1.0 and '1' never compare equal."""
    return json.dumps(value, sort_keys=True, ensure_ascii=False, allow_nan=True, default=repr)


def typed_put(put):
    """Wrap put so equality operands compare by exact JSON type (error rows keep raw diagnostics)."""
    def wrapped(name, left, right=None, applies=True):
        if right is None:
            return put(name, left, right, applies)  # error and empty rows keep their raw diagnostics
        return put(name, typed(left), typed(right), applies)
    return wrapped


def instant(text):
    """Exact RFC 3339 instant (seconds since epoch, decimal fraction) without lexical comparison or rounding."""
    import datetime
    from decimal import Decimal
    body, zone = (text[:-1], '+00:00') if text[-1] in 'Zz' else (text[:-6], text[-6:])
    frac = Decimal(0)
    if '.' in body:
        body, digits = body.split('.', 1)
        frac = Decimal('0.' + digits)
    stamp = datetime.datetime.fromisoformat(body.replace('t', 'T') + zone)
    return (int(stamp.timestamp()), frac)


def instant_le(a, b):
    return instant(a) <= instant(b)
