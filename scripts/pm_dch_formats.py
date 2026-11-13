#!/usr/bin/env python3
"""Mandatory DCH format checks (sweep part 2B: CV-1101 adopted).

Date-time: the shared CV-1101 check (scripts/pm_event_datetime.py, gated at
58c2816ff3). Every DCH validator is pm_event_datetime.datetime_validator over
the complete outer schema, so the explicitly registered RFC 3339 predicate runs
through the validator: EventRecord occurred_at_utc keeps the broad EventRecord
profile (CV-317/CV-1101) and the inventory-classified Storage fields
observed_at_utc/persisted_at_utc keep CV-253's storage_utc_z profile. The
DCH-owned timestamp fields (payload ts, Stop outcome_at_utc, checkpoint
retired_at_utc) take the same predicate together with their unchanged
owner-schema terminal uppercase-Z pattern. No DCH-local timestamp grammar
remains. Strings are never rewritten; DCH compares timestamps as exact strings.

URI: DCH's own RFC 3986 HTTPS PR-URL grammar (a DCH payload rule, not a
date-time rule). The shared checker is fixed (read-only), so the URI rule is a
second validator composed beside it at the same boundary.
"""
import copy
import hashlib
import ipaddress
import json
import re
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker as JSONFormatChecker
from pm_event_datetime import datetime_validator, format_checker as shared_format_checker
from pm_event_datetime_inventory import DatetimeAdmissionError, declarations

# The frozen recipes skipped URI checks (their recorded checker); DCH's URI rule
# is added only at the current boundary. Refuse an environment whose shared
# checker would silently add a generic URI check and change either recipe.
if 'uri' in shared_format_checker().checkers:
    raise RuntimeError('shared date-time checker unexpectedly installs a uri format check')


# RFC 3986: pct-encoded / unreserved / sub-delims. Raw non-ASCII is an IRI,
# not a URI. A port is syntactic digits, without a new host/port allowlist.
_UNRESERVED = r'A-Za-z0-9._~\-'
_SUBDELIMS = r"!$&'()*+,;="
_UNIT = rf'(?:[{_UNRESERVED}{_SUBDELIMS}]|%[0-9A-Fa-f]{{2}})'
_PCHAR = rf'(?:{_UNIT}|[:@])'
_URI = re.compile(rf'https://(?:(?P<userinfo>(?:{_UNIT}|:)*)@)?(?P<host>\[[^\[\]]+\]|{_UNIT}+)(?::[0-9]*)?(?:/{_PCHAR}*)*(?:\?(?:{_PCHAR}|[/?])*)?(?:\#(?:{_PCHAR}|[/?])*)?')


def https_uri(value):
    if not isinstance(value, str):
        return True
    match = _URI.fullmatch(value)
    if match is None:
        return False
    host = match['host']
    if not host.startswith('['):
        return True
    host = host[1:-1]
    if re.fullmatch(rf'[vV][0-9A-Fa-f]+\.[{_UNRESERVED}{_SUBDELIMS}:]+', host):
        return True  # RFC 3986 IPvFuture
    try:
        ipaddress.IPv6Address(host)
        return '%' not in host
    except ValueError:
        return False


def uri_checker():
    """DCH's HTTPS PR-URL grammar only; date-time is never checked here."""
    checker = JSONFormatChecker(formats=())
    checker.checks('uri')(https_uri)
    return checker


def skipped_checker():
    """A frozen recipe's own recorded checker: stock formats, date-time and URI skipped."""
    checker = JSONFormatChecker()
    checker.checkers.pop('date-time', None)
    checker.checkers.pop('uri', None)
    return checker


class Composite:
    """One validation boundary made of several validators; valid only when every part is."""
    __slots__ = ('schema', 'parts')

    def __init__(self, schema, parts):
        self.schema, self.parts = schema, tuple(parts)

    def iter_errors(self, instance):
        for part in self.parts:
            yield from part.iter_errors(instance)

    def is_valid(self, instance):
        return all(part.is_valid(instance) for part in self.parts)


_CACHE = {}


def _key(kind, schema):
    text = json.dumps(schema, sort_keys=True, separators=(',', ':'), ensure_ascii=False)
    return kind, hashlib.sha256(text.encode('utf-8')).hexdigest()


_SELECTOR_PROFILE = json.loads((Path(__file__).resolve().parents[1] / 'Plans/dch_checkpoint_source_constraints.json').read_text())


def effective_checkpoint_schema(schema):
    """The unchanged strict owner constraints beside the canonical stored selector."""
    def compose(node):
        if isinstance(node, dict):
            result = {key: compose(value) for key, value in node.items()}
            properties = result.get('properties')
            if isinstance(properties, dict) and properties.get('source_read_token') == _SELECTOR_PROFILE['canonical_durable_selector_schema']:
                properties['source_read_token'] = copy.deepcopy(_SELECTOR_PROFILE['source_constraint_schema'])
            return result
        if isinstance(node, list):
            return [compose(value) for value in node]
        return node
    return compose(schema)


def _checkpoint_source_projection(schema):
    """Timestamp-free supplementary constraints; the shared validator sees the real resource."""
    if not isinstance(schema, dict):
        return {}
    projection = {}
    properties = {}
    for key, value in schema.get('properties', {}).items():
        if key == 'source_read_token' and value == _SELECTOR_PROFILE['canonical_durable_selector_schema']:
            properties[key] = copy.deepcopy(_SELECTOR_PROFILE['source_constraint_schema'])
        else:
            child = _checkpoint_source_projection(value)
            if child:
                properties[key] = child
    if properties:
        projection['properties'] = properties
    child = _checkpoint_source_projection(schema.get('items'))
    if child:
        projection['items'] = child
    return projection


def validator(schema):
    """Current (strict-v4) boundary: the shared CV-1101 validator and DCH's URI rule.

    The validator keeps its own copy of the schema; a caller's later change to
    its dictionary selects a different (separately admitted) validator.
    """
    key = _key('current', schema)
    found = _CACHE.get(key)
    if found is None:
        owned = copy.deepcopy(schema)
        parts = [datetime_validator(owned), Draft202012Validator(owned, format_checker=uri_checker())]
        source_projection = _checkpoint_source_projection(owned)
        if source_projection:
            assert _timestamp_free(source_projection)
            parts.append(Draft202012Validator(source_projection, format_checker=JSONFormatChecker(formats=('uuid',))))
        found = _CACHE[key] = Composite(owned, parts)
    return found


def _timestamp_free(node):
    """No date-time format and no inventory-classified Storage field declaration anywhere below node."""
    if isinstance(node, dict):
        if node.get('format') == 'date-time' or declarations(node):
            return False
        return all(_timestamp_free(child) for child in node.values())
    if isinstance(node, list):
        return all(_timestamp_free(child) for child in node)
    return True


def frozen_extends(frozen, current):
    """True only when frozen is exactly current plus timestamp-free allOf entries appended.

    Then frozen = current AND extra, the timestamp declaration nodes are the
    same nodes, and current's own constraints are implied by frozen.
    """
    if not (isinstance(frozen, dict) and isinstance(current, dict)):
        return False
    base, extra = frozen.get('allOf'), current.get('allOf')
    if type(base) is not list or type(extra) is not list or len(base) < len(extra):
        return False
    trimmed = {**frozen, 'allOf': base[:len(extra)]}
    return trimmed == current and _timestamp_free(base[len(extra):])


def retained_validator(schema, current_schema=None):
    """Frozen SP-1101 boundary for one retained recipe's pinned original resource.

    The recipe's recorded checker skipped date-time and URI formats. CV-1101
    and SP-1101: a skipped format check never authenticates invalid history,
    so the shared date-time predicate (and CV-253 on Storage fields) applies to
    the frozen resource; the skipped URI check is preserved. When the shared
    inventory does not classify the frozen resource (DCH's strict-v3 envelope,
    TOOL-ISSUES), the boundary composes the inventoried current resource's
    shared validator with the frozen resource under its recorded checker, and
    only when frozen_extends(frozen, current) holds; otherwise it refuses.
    """
    key = _key('retained', schema)
    found = _CACHE.get(key)
    if found is None:
        owned = copy.deepcopy(schema)
        try:
            parts = (datetime_validator(owned),)
        except DatetimeAdmissionError:
            if current_schema is None or not frozen_extends(owned, current_schema):
                raise
            parts = (datetime_validator(copy.deepcopy(current_schema)),
                     Draft202012Validator(owned, format_checker=skipped_checker()))
        found = _CACHE[key] = Composite(owned, parts)
    return found


def refused_by_predicate(validator, instance, reason):
    """True when the shared CV-1101 predicate's own Refusal with this reason caused an error.

    Errors under oneOf/anyOf/allOf sit in an error's context; the whole error
    tree is searched, so a refusal by a pattern or another keyword never counts.
    """
    from pm_event_numbers import Refusal
    pending = list(validator.iter_errors(instance))
    while pending:
        error = pending.pop()
        if isinstance(error.cause, Refusal) and error.cause.reason == reason:
            return True
        pending.extend(error.context or ())
    return False
