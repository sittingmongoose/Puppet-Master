"""C12-SR shared helpers for the restore-point and recovery-unavailable boundaries.

This is NOT an extension module: the s3bo loader discovers only
pm_s3bo_ext_*.py. It holds fixture constructors and owner-recipe helpers used by
the SR extensions. Nothing here decides acceptance; every refusal is a table
predicate over raw operands projected by an extension's operands().
"""
import copy
import hashlib

import pm_s3bo_oracles as w
from pm_event_numbers import qualified_jcs

APPLICATION_SCHEMA_PATH = 'Plans/restore_point_application_corruption_contracts.schema.json'


def jcs_sha(value):
    """Lowercase SHA-256 of RFC 8785 canonical JSON (the shared CV-317 primitive)."""
    return hashlib.sha256(qualified_jcs(value)).hexdigest()


def custody_key(event_id):
    """SP-286 first-receipt custody key of an event, as SP-2202/SP-2204 name it."""
    return 'event_append_receipt_custody.v1:' + w.STORE + ':' + w.sha(event_id.encode())


def schema_root(path, definition):
    doc = w.read_json(path)
    return dict(doc, **{'$ref': '#/$defs/' + definition})


def keyword_errors(root, value):
    """Every non-format keyword diagnostic; format is owned by the shared date-time row."""
    if value is None:
        return []
    return [e for e in w.schema_errors(root, value) if e[-1] != 'format']


def time_errors(value, keys, profile):
    """Shared CV-1101 date_time at each named nullable timestamp of a value."""
    errors = []
    if not isinstance(value, dict):
        return errors
    for key in keys:
        text = value.get(key)
        if text is None:
            continue
        error = w.caught(w.date_time, text, profile=profile)
        if error:
            errors.append((key, error))
    return errors


def integer_errors(value, slots):
    """Shared CV-1100 current_integer at each (key, minimum, maximum) slot."""
    errors = []
    if not isinstance(value, dict):
        return errors
    for key, minimum, maximum in slots:
        if key not in value or value[key] is None:
            continue
        error = w.caught(w.current_integer, value[key], minimum=minimum, maximum=maximum)
        if error:
            errors.append((key, error))
    return errors


def physical_hex(value):
    """Complete Storage event-value bytes of an independently held copy."""
    try:
        return w.storage_value_bytes(value, profile=w.EVENT_VALUE).hex()
    except w.Refusal as exc:
        return 'refused:' + exc.reason


def control(family_id, label, value):
    return {'id': family_id + '/' + label, 'value': value, 'boundary': 'append'}


def deep(value):
    return copy.deepcopy(value)
