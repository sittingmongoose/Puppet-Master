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
        return True if type(value) is not str else date_time(value, profile=profile) == value

    return checker


def _eventrecord_storage_properties(validator, properties, instance, schema):
    """Add only CV-253's zone predicate when an envelope is evaluated.

    This runs during ordinary descent, including $ref and nested resources.
    The frozen 1.0.0 compatibility definition has no $id of its own; its
    envelope discriminator selects the same Storage field ownership.
    Resource authentication remains the installing owner's responsibility.
    """
    identity, version = properties.get("schema_id"), properties.get("schema_version")
    envelope = (schema.get("$id") ==
                "https://puppetmaster.local/schemas/event_record/2.0.0/event_record.schema.json" or
                (type(identity) is dict and identity.get("const") == "pm.event.v0" and
                 type(version) is dict and version.get("const") == "1.0.0"))
    if envelope and validator.is_type(instance, "object"):
        for field in ("observed_at_utc", "persisted_at_utc"):
            if field in properties and field in instance:
                yield from validator.descend(instance[field], {"pattern": r"Z(?![\s\S])"},
                                             path=field, schema_path=field)


@lru_cache(maxsize=None)
def _bound_validator(base):
    """Keep the field boundary installed when jsonschema evolves at $schema.

    Extending properties alone is insufficient: jsonschema normally switches
    back to its stock class on entering a resource with an explicit dialect.
    These classes are private to this helper; no global dialect is replaced.
    """
    from attrs import fields
    from jsonschema import validators

    def properties(validator, value, instance, schema):
        yield from base.VALIDATORS["properties"](validator, value, instance, schema)
        yield from _eventrecord_storage_properties(validator, value, instance, schema)

    bound = validators.extend(base, {"properties": properties})

    def evolve(self, **changes):
        schema = changes.setdefault("schema", self.schema)
        selected = validators.validator_for(schema, default=base)
        for field in fields(type(self)):
            if field.init and field.alias not in changes:
                changes[field.alias] = getattr(self, field.name)
        return _bound_validator(selected)(**changes)

    bound.evolve = evolve
    return bound


def datetime_validator(schema, *, profile=EVENT_RECORD, **kwargs):
    """Enforce date-time and CV-253 on direct, referenced and nested envelopes.

    Pass authentic frozen resources in registry for retained validation. Both
    the supplied resources and their pinned hashes remain unchanged.
    """
    from jsonschema import Draft202012Validator
    return _bound_validator(Draft202012Validator)(
        schema, format_checker=format_checker(profile=profile), **kwargs)
