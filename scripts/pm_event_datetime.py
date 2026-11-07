"""CV-1101 EventRecord date-time predicates; preserve exact input spelling.

Local profiles retain their existing owners. Retained verifiers bind a profile
from SP-1101 authenticated frozen resources, never from a request parameter.
"""
from __future__ import annotations

import calendar
from functools import lru_cache
import re

from pm_event_numbers import Refusal, _refuse

EVENT_RECORD = "event_record"
STORAGE_UTC_Z = "storage_utc_z"
COORDINATION_UTC_Z = "coordination_utc_z"
LEGACY_NORMALIZATION_OUTPUT = "legacy_normalization_output"
PROFILES = (EVENT_RECORD, STORAGE_UTC_Z, COORDINATION_UTC_Z, LEGACY_NORMALIZATION_OUTPUT)
_DATE_TIME = re.compile(
    r"([0-9]{4})-([0-9]{2})-([0-9]{2})[Tt]"
    r"([0-9]{2}):([0-9]{2}):([0-9]{2})(?:\.([0-9]+))?"
    r"([Zz]|[+-][0-9]{2}:[0-9]{2})", re.ASCII)

# IERS Leap_Second.dat, Bulletin C72 (July 2026), valid through 2027-06-28.
# https://hpiers.obspm.fr/iers/bul/bulc/Leap_Second.dat
# These are insertion days (the table lists the following effective day).
# A new announced insertion needs a governed frozen-resource update. Never
# infer a leap second from a month boundary or the current wall clock.
_LEAP_DAYS = (
    "1972-06-30", "1972-12-31", "1973-12-31", "1974-12-31", "1975-12-31",
    "1976-12-31", "1977-12-31", "1978-12-31", "1979-12-31", "1981-06-30",
    "1982-06-30", "1983-06-30", "1985-06-30", "1987-12-31", "1989-12-31",
    "1990-12-31", "1992-06-30", "1993-06-30", "1994-06-30", "1995-12-31",
    "1997-06-30", "1998-12-31", "2005-12-31", "2008-12-31", "2012-06-30",
    "2015-06-30", "2016-12-31",
)


def _day_number(year, month, day):
    # Proleptic Gregorian, including RFC3339's four-digit year 0000.
    previous = year - 1
    return (365 * previous + previous // 4 - previous // 100 + previous // 400
            + sum(calendar.monthrange(year, m)[1] for m in range(1, month)) + day)


_LEAP_PRECEDING_SECONDS = frozenset(
    _day_number(*(int(x) for x in day.split("-"))) * 86400 + 86399 for day in _LEAP_DAYS)


def date_time(value, *, profile=EVENT_RECORD):
    """Validate RFC3339 5.6/5.7 or an explicitly selected stricter owner profile.

    Fractions have no general digit ceiling; they never pass through a float or
    microsecond datetime. Offsets apply to leap-second validation as well.
    The original string is returned unchanged, including lower case and zone.
    """
    if type(profile) is not str or profile not in PROFILES:
        _refuse("date_time_profile")
    if type(value) is not str:
        _refuse("date_time_type")
    match = _DATE_TIME.fullmatch(value)
    if match is None:
        _refuse("date_time_syntax")
    year, month, day, hour, minute, second = map(int, match.group(1, 2, 3, 4, 5, 6))
    fraction, zone = match.group(7, 8)
    if not 1 <= month <= 12:
        _refuse("date_time_month")
    if not 1 <= day <= calendar.monthrange(year, month)[1]:
        _refuse("date_time_day")
    if hour > 23:
        _refuse("date_time_hour")
    if minute > 59:
        _refuse("date_time_minute")
    if second > 60:
        _refuse("date_time_second")
    offset = 0
    if zone not in ("Z", "z"):
        offset_hour, offset_minute = int(zone[1:3]), int(zone[4:6])
        if offset_hour > 23:
            _refuse("date_time_offset_hour")
        if offset_minute > 59:
            _refuse("date_time_offset_minute")
        offset = (1 if zone[0] == "+" else -1) * (offset_hour * 3600 + offset_minute * 60)
    if second == 60:
        preceding = _day_number(year, month, day) * 86400 + hour * 3600 + minute * 60 + 59 - offset
        if preceding not in _LEAP_PRECEDING_SECONDS:
            _refuse("date_time_leap_second")
    if profile in (STORAGE_UTC_Z, COORDINATION_UTC_Z, LEGACY_NORMALIZATION_OUTPUT) and zone != "Z":
        _refuse("date_time_utc_z")
    if profile == LEGACY_NORMALIZATION_OUTPUT:
        if fraction is None or len(fraction) != 9:
            _refuse("date_time_legacy_fraction")
    return value


def format_checker(*, profile=EVENT_RECORD):
    """Explicitly install the predicate; a bare FormatChecker can skip it."""
    from jsonschema import FormatChecker
    if type(profile) is not str or profile not in PROFILES:
        _refuse("date_time_profile")
    checker = FormatChecker()

    @checker.checks("date-time", raises=Refusal)
    def check(value):
        # JSON Schema format applies only to strings; type remains independent.
        # Every value the validator treats as a string reaches the predicate,
        # which refuses a str subclass or StrEnum member (date_time_type).
        return True if not isinstance(value, str) else date_time(value, profile=profile) == value

    return checker


def _eventrecord_storage_properties(validator, properties, instance, schema):
    """Compose CV-253 at inventory-authenticated resource/field paths only."""
    if validator.is_type(instance, "object"):
        for field in validator.storage_selection.fields(schema):
            if field in instance:
                yield from validator.descend(instance[field], {"type": "string", "format": "date-time",
                                                              "pattern": r"Z(?![\s\S])"},
                                             path=field, schema_path=field)


@lru_cache(maxsize=None)
def _bound_validator(base):
    """Keep the field boundary installed when jsonschema evolves at $schema.

    Extending properties alone is insufficient: jsonschema normally switches
    back to its stock class on entering a resource with an explicit dialect.
    These classes are private to this helper; no global dialect is replaced.
    """
    from attrs import fields, make_class, field
    from jsonschema import validators

    extended = validators.extend(base, {})
    from pm_event_datetime_inventory import StorageSelection
    bound = make_class("InventoryDatetimeValidator", {
        "storage_selection": field(factory=StorageSelection, kw_only=True),
    }, bases=(extended,))

    def evolve(self, **changes):
        schema = changes.setdefault("schema", self.schema)
        selected = _dialect_validator(schema, default=base)
        for field in fields(type(self)):
            if field.init and field.alias not in changes:
                changes[field.alias] = getattr(self, field.name)
        return _bound_validator(selected)(**changes)

    bound.evolve = evolve

    def iter_errors(self, instance, _schema=None):
        from pm_event_datetime_inventory import DatetimeAdmissionError
        if _schema is not None and _schema is not self.schema:
            raise DatetimeAdmissionError("datetime_schema_override_unsupported")
        schema = self.schema
        self.storage_selection.verify_resources()
        self.storage_selection.admit(schema)
        yield from _eventrecord_storage_properties(self, None, instance, schema)
        yield from extended.iter_errors(self, instance, _schema)

    def descend(self, instance, schema, *args, **kwargs):
        # descend executes keywords itself; it does not call iter_errors.
        # Admission must precede *every* fragment, including required-only or
        # patternProperties schemas and dialect changes during reference use.
        from pm_event_datetime_inventory import DatetimeAdmissionError
        resolver = kwargs.get("resolver")
        if resolver is not None and resolver._base_uri.rstrip("#") not in self.storage_selection.uri_pins:
            raise DatetimeAdmissionError("datetime_resource_not_preloaded")
        self.storage_selection.admit(schema)
        yield from _eventrecord_storage_properties(self, None, instance, schema)
        yield from extended.descend(self, instance, schema, *args, **kwargs)

    def validate_reference(self, ref, instance):
        from urllib.parse import urljoin, urldefrag
        from pm_event_datetime_inventory import DatetimeAdmissionError
        base_uri = self._resolver._base_uri
        uri = urldefrag(base_uri if ref.startswith("#") else urljoin(base_uri, ref))[0]
        if uri not in self.storage_selection.uri_pins:
            raise DatetimeAdmissionError("datetime_resource_not_preloaded: " + uri)
        yield from extended._validate_reference(self, ref, instance)

    bound._validate_reference = validate_reference
    bound.iter_errors = iter_errors
    bound.descend = descend
    return bound


def _dialect_validator(schema, *, default=None):
    """Select only the supported declared dialects, including at the root."""
    from jsonschema import (Draft202012Validator, Draft201909Validator,
                            Draft7Validator, Draft6Validator)
    from pm_event_datetime_inventory import DatetimeAdmissionError
    supported = {base.META_SCHEMA["$id"].rstrip("#"): base for base in
                 (Draft202012Validator, Draft201909Validator, Draft7Validator, Draft6Validator)}
    if isinstance(schema, dict) and "$schema" in schema:
        uri = schema["$schema"]
        if not isinstance(uri, str) or uri.rstrip("#") not in supported:
            raise DatetimeAdmissionError("datetime_dialect_unsupported")
        return supported[uri.rstrip("#")]
    return default or Draft202012Validator


def _closed_datetime_graph(schema, registry=None, *, selection=None):
    """Shared resolver setup for runtime admission and source-value probes.

    Source probes run before inventory authentication, so they use the same
    dialects, resources and resolver without installing inventory selections.
    Runtime callers always supply their authenticated StorageSelection.
    """
    from referencing import Registry, Resource
    from referencing.jsonschema import specification_with
    from pm_event_datetime_inventory import DatetimeAdmissionError
    base = _dialect_validator(schema)
    if registry is None:
        registry = Registry()
    if type(registry) is not Registry or registry._retrieve is not Registry()._retrieve:
        raise DatetimeAdmissionError("datetime_on_demand_retrieval_unsupported")
    if selection is not None:
        selection.install(schema)
    # Crawl only supplied bytes. This discovers embedded $ids/anchors without
    # retrieving anything and pins all aliases as well as canonical URIs.
    for resource in registry.values():
        _dialect_validator(resource.contents, default=base)
        if selection is not None:
            selection.install(resource.contents)
    root_uri = (base.ID_OF(schema) if isinstance(schema, dict) else None) or ""
    root_resource = Resource.from_contents(schema, default_specification=specification_with(base.META_SCHEMA["$id"]))
    if selection is not None:
        selection.pin(root_uri, schema)
    registry = registry.with_resource(root_uri, root_resource).crawl()
    for uri, resource in registry.items():
        _dialect_validator(resource.contents, default=base)
        if selection is not None:
            selection.pin(uri, resource.contents)

    def refuse_retrieve(uri):
        raise DatetimeAdmissionError("datetime_resource_not_preloaded: " + uri)

    from attrs import evolve
    registry = evolve(registry, retrieve=refuse_retrieve)
    return base, registry


def datetime_validator(schema, *, profile=EVENT_RECORD, **kwargs):
    """Enforce date-time over a closed, preloaded, content-pinned graph.

    Neutral outer wrappers are admitted at construction. Supply every current
    or authentic frozen dependency in registry; retrieval is never permitted.
    """
    from pm_event_datetime_inventory import DatetimeAdmissionError, StorageSelection
    if any(kwargs.get(key) is not None for key in ("resolver", "_resolver")):
        raise DatetimeAdmissionError("datetime_custom_resolver_unsupported")
    selection = StorageSelection()
    base, registry = _closed_datetime_graph(schema, kwargs.pop("registry", None), selection=selection)
    return _bound_validator(base)(
        schema, registry=registry, format_checker=format_checker(profile=profile),
        storage_selection=selection, **kwargs)
