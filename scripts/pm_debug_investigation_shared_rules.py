"""DDBG adapters to the gated shared rules (NUMRULE, merged at 58c2816ff3).

CV-1100 current integers and qualified RFC 8785, SP-1100 EventRecord physical
bytes and Storage uint64 metadata, and CV-1101 date-time profiles, called
through the shared helpers pm_event_numbers and pm_event_datetime. Nothing
here is a lane serializer, grammar or cap: each function calls one shared
helper and returns its result, or the shared helper's own refusal reason.

These functions never raise for a refusal (they catch the shared helpers'
Refusal and return its reason or None). The guard tables do not call them:
pm_debug_investigation_transitions builds each view with them before a table
runs, so no table input carries a value the guard tool cannot render, and
the guard-table rows decide on the measured result.
"""
import hashlib

from pm_event_datetime import EVENT_RECORD, STORAGE_UTC_Z, date_time
from pm_event_numbers import (
    EVENT_VALUE, PRODUCER_FIELDS, Refusal, current_integer, producer_semantic_digest, qualified_jcs,
    storage_uint64, storage_value_bytes)

import pm_debug_investigation_guard_constants as constants

# CV-1101 profiles by field: the broad EventRecord profile for the caller's
# source time, CV-253's uppercase-Z Storage profile for Storage assignments.
TIMESTAMP_PROFILES = (('occurred_at_utc', EVENT_RECORD), ('observed_at_utc', STORAGE_UTC_Z),
                      ('persisted_at_utc', STORAGE_UTC_Z))



def digest_fields_are_producer_projection():
    """The DDBG semantic projection is exactly the CV-317 producer projection (the lane runner checks it
    for every family; the shared helper digests only PRODUCER_FIELDS)."""
    return set(PRODUCER_FIELDS) == set(constants.DIGEST_FIELDS) | {'event_type', 'payload'}

# Schema integer slots that sit inside the producer projection. CV-1100
# type_sensitive_paths: the owner schemas say integer here, so a binary64
# value that serializes like an integer is refused rather than digested.
TYPE_SENSITIVE_PATHS = frozenset({('payload', 'item_count'), ('payload', 'artifact_count'),
                                  ('payload', 'target_bindings', 'binding_revision'),
                                  ('producer_sequence_id',)})


def date_time_refusal(value, profile):
    """None when date_time(value, profile=...) accepts the value, else its refusal reason."""
    try:
        date_time(value, profile=profile)
    except Refusal as refusal:
        return refusal.reason
    return None


def integer_refusal(value, minimum=None, maximum=None):
    """None when current_integer(value, minimum=..., maximum=...) accepts, else its reason."""
    try:
        current_integer(value, minimum=minimum, maximum=maximum)
    except Refusal as refusal:
        return refusal.reason
    return None


def uint64_refusal(value):
    """None when storage_uint64(value) accepts (exact 0..2^64-1), else its reason."""
    try:
        storage_uint64(value)
    except Refusal as refusal:
        return refusal.reason
    return None


def producer_projection(case):
    """The record's producer projection: the envelope fields of DIGEST_FIELDS (absent members as null),
    the event type and the payload. Storage-assigned fields are never part of it."""
    envelope = case.get('envelope') if type(case) is dict else None
    envelope = envelope if type(envelope) is dict else {}
    pairs = [(key, envelope.get(key)) for key in constants.DIGEST_FIELDS]
    body = dict(pairs + [('event_type', case.get('event_type')), ('payload', case.get('payload'))])
    return body


def producer_refusal(case):
    """None when the producer projection qualifies (CV-1100 producer_semantic_bytes), else the reason."""
    try:
        producer_semantic_digest(producer_projection(case), type_sensitive_paths=TYPE_SENSITIVE_PATHS)
    except Refusal as refusal:
        return refusal.reason
    return None


def semantic_digest(case):
    """CV-317 producer_semantic_digest over the record's projection (shared qualified RFC 8785), or None
    when the projection does not qualify. Caller-supplied semantic fields only, never Storage metadata."""
    try:
        return producer_semantic_digest(producer_projection(case), type_sensitive_paths=TYPE_SENSITIVE_PATHS)
    except Refusal:
        return None


def identity(event, project, payload):
    """The lane's immutable identity (recipe debug-project-rfc8785-v1): SHA-256 of the qualified RFC 8785
    bytes of [event type, Project, investigation id, operation id]; the preimage and tuple positions are
    unchanged. None when a member is missing or the preimage does not qualify."""
    if type(payload) is not dict or 'investigation_id' not in payload or 'operation_id' not in payload:
        return None
    try:
        preimage = qualified_jcs([event, project, payload['investigation_id'], payload['operation_id']])
    except Refusal:
        return None
    digest = hashlib.sha256(preimage).hexdigest()
    return 'debug:' + digest, 'evt_debug_' + digest


def event_value_size(value):
    """SP-337 inline bytes, measured as SP-236/SP-1100 EventRecord physical bytes (EVENT_VALUE canonical
    MessagePack via storage_value_bytes); None when the value has no EVENT_VALUE encoding."""
    try:
        return len(storage_value_bytes(value, profile=EVENT_VALUE))
    except Refusal:
        return None


def exact_token(value):
    """A type-exact, renderable stand-in for a Storage metadata value, for equality rows: integers by
    their exact hexadecimal digits (no decimal digit limit), floats by float.hex, so 1 and 1.0 differ."""
    if value is None:
        return ['null']
    if type(value) is bool:
        return ['bool', value]
    if type(value) is int:
        return ['int', hex(value)]
    if type(value) is float:
        return ['float', value.hex()]
    if type(value) is str:
        return ['str', value]
    # Any other kind is outside every Storage field's domain: the original's own profile row refuses it
    # (an offered value of another kind differs from a valid original's token).
    return ['other', type(value).__name__]
