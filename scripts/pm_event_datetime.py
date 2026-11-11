"""CV-1101 EventRecord date-time predicates; preserve exact input spelling.

Local profiles retain their existing owners. Retained verifiers bind a profile
from SP-1101 authenticated frozen resources, never from a request parameter.
"""
from __future__ import annotations

import calendar
from functools import lru_cache
import re
import threading
import weakref

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
    from types import MappingProxyType
    if type(profile) is not str or profile not in PROFILES:
        _refuse("date_time_profile")
    checker = _fixed_checker_class()()

    @checker.checks("date-time", raises=Refusal)
    def check(value):
        # JSON Schema format applies only to strings; type remains independent.
        # Every value the validator treats as a string reaches the predicate,
        # which refuses a str subclass or StrEnum member (date_time_type).
        return True if not isinstance(value, str) else date_time(value, profile=profile) == value

    checker.checkers = MappingProxyType(dict(checker.checkers))
    checker._fixed = True
    return checker


@lru_cache(maxsize=None)
def _fixed_checker_class():
    """A FormatChecker whose table is read-only once the predicate is in it (T166).

    Its checkers mapping is a read-only proxy, so checks() and item assignment
    raise TypeError, and assigning or deleting any attribute raises TypeError:
    the table can never lose or replace date-time after format_checker()
    returns, and deleting it cannot fall back to the stock class table.
    """
    from jsonschema import FormatChecker

    class FixedFormatChecker(FormatChecker):
        def __setattr__(self, name, value):
            if "_fixed" in self.__dict__:
                raise TypeError("datetime_format_checker_fixed: " + name)
            super().__setattr__(name, value)

        def __delattr__(self, name):
            raise TypeError("datetime_format_checker_fixed: " + name)

    return FixedFormatChecker


def _eventrecord_storage_properties(validator, properties, instance, schema):
    """Compose CV-253 and CV-1101 at inventory-authenticated resource/field paths only.

    The fields come from the node's classification, never from a format
    annotation of the original (fix round 18): the Storage fields of a
    Storage-classified node take the strict Storage profile, and the source
    occurred_at_utc of an EventRecord node takes the broad EventRecord
    predicate, whether or not the original declares format.
    """
    if validator.is_type(instance, "object"):
        storage, source = validator.storage_selection.classified(schema)
        for field in storage:
            if field in instance:
                yield from validator.descend(instance[field], {"type": "string", "format": "date-time",
                                                              "pattern": r"Z(?![\s\S])"},
                                             path=field, schema_path=field)
        for field in source:
            if field in instance:
                yield from _source_timestamp(validator, instance[field], field)


_SOURCE_FIELD = {"type": "string"}


def _source_timestamp(validator, value, field):
    """CV-1101 on one EventRecord source field: the broad EventRecord profile, whatever profile the validator runs.

    A refusal is a format error at the field whose cause is the predicate's
    Refusal; every value the validator treats as a string reaches it, so a str
    subclass or StrEnum member refuses (date_time_type), as the checker does.
    """
    from jsonschema.exceptions import ValidationError
    yield from validator.descend(value, _SOURCE_FIELD, path=field, schema_path=field)
    if validator.is_type(value, "string"):
        try:
            date_time(value, profile=EVENT_RECORD)
        except Refusal as refusal:
            yield ValidationError("%r is not a 'date-time'" % (value,), validator="format", validator_value="date-time",
                                  instance=value, schema=_SOURCE_FIELD, path=(field,), schema_path=(field, "format"),
                                  cause=refusal)


class _Binding(tuple):
    """The checker, closed registry and selection one datetime_validator fixed, and the pins of its configuration."""
    __slots__ = ()

    def __new__(cls, checker, registry, selection, pins=None):
        return super().__new__(cls, (checker, registry, selection, pins))

    checker = property(lambda self: self[0])
    registry = property(lambda self: self[1])
    selection = property(lambda self: self[2])
    pins = property(lambda self: self[3])


# Attributes a bound validator never reassigns or deletes after construction (T166, T189).
_FIXED_ATTRIBUTES = ("format_checker", "_registry", "_resolver", "_ref_resolver", "storage_selection",
                     "datetime_binding", "_datetime_fixed")
# Every pin set _bind issued (fix round 18). A binding whose pins are not here was not made by datetime_validator.
_ISSUED = weakref.WeakSet()
# Each bound validator class and the keyword table and type checker it was created with (its dialect).
_DIALECTS = {}
# The verified validation runs executing on this thread, innermost last.
_ACTIVE = threading.local()


class _RegistryPins:
    """One registry as it was at construction: its retrieval, every resource and anchor, its uncrawled URIs."""
    __slots__ = ("retrieve", "resources", "anchors", "uncrawled")

    def __init__(self, registry):
        object.__setattr__(self, "retrieve", registry._retrieve)
        object.__setattr__(self, "resources", {uri: (resource.contents, resource._specification)
                                               for uri, resource in registry._resources.items()})
        object.__setattr__(self, "anchors", {key: (type(anchor), anchor.name, anchor.resource.contents)
                                             for key, anchor in registry._anchors.items()})
        object.__setattr__(self, "uncrawled", frozenset(registry._uncrawled))

    def __setattr__(self, name, value):
        raise TypeError("datetime_validator_pins_fixed: " + name)

    def __delattr__(self, name):
        raise TypeError("datetime_validator_pins_fixed: " + name)


def _row_pin(row):
    """What runtime admission reads from one inventory row."""
    return row.get("node_sha256"), tuple(row.get("fields", ())), row.get("profile"), row.get("classification")


class _Pins:
    """The complete configuration one datetime_validator fixed at construction (fix round 18).

    The checker and its table, the closed registry and the resolver's
    registry (every resource URI with its content object and specification,
    every anchor, the retrieval callback), and the selection's pins, nodes,
    rows and resources. Every use compares the validator's effective
    configuration with these; content hashes are the selection's own pins.
    """
    __slots__ = ("checker", "table", "entry", "registry", "closed", "resolver_registry", "combined", "selection",
                 "uri_pins", "nodes", "rows", "selected", "__weakref__")

    def __init__(self, checker, registry, resolver, selection):
        values = {"checker": checker, "table": checker.checkers, "entry": checker.checkers.get("date-time"),
                  "registry": registry, "closed": _RegistryPins(registry), "resolver_registry": resolver._registry,
                  "combined": _RegistryPins(resolver._registry), "selection": selection,
                  "uri_pins": dict(selection.uri_pins), "nodes": dict(selection.nodes),
                  "rows": {key: _row_pin(row) for key, (_, row) in selection.nodes.items()},
                  "selected": dict(selection.resources)}
        for name, value in values.items():
            object.__setattr__(self, name, value)
        _ISSUED.add(self)

    def __setattr__(self, name, value):
        raise TypeError("datetime_validator_pins_fixed: " + name)

    def __delattr__(self, name):
        raise TypeError("datetime_validator_pins_fixed: " + name)


class _Run:
    """One verified validation run: its pins and the registries and dialect classes verified during it."""
    __slots__ = ("pins", "registries", "classes")

    def __init__(self, pins):
        self.pins, self.registries, self.classes = pins, {}, set()


def _runs():
    runs = getattr(_ACTIVE, "runs", None)
    if runs is None:
        runs = _ACTIVE.runs = []
    return runs


def _verify_registry(registry, pinned):
    """A registry equals its pins: type, retrieval, uncrawled URIs, every resource and anchor, nothing added."""
    from referencing import Registry
    from pm_event_datetime_inventory import DatetimeAdmissionError
    if type(registry) is not Registry:
        raise DatetimeAdmissionError("datetime_validator_use_registry_type")
    if registry._retrieve is not pinned.retrieve:
        raise DatetimeAdmissionError("datetime_validator_use_retrieval")
    if not pinned.uncrawled.issuperset(registry._uncrawled):
        raise DatetimeAdmissionError("datetime_validator_use_uncrawled")
    if len(registry._resources) != len(pinned.resources):
        raise DatetimeAdmissionError("datetime_validator_use_resource_map")
    for uri, resource in registry._resources.items():
        expected = pinned.resources.get(uri)
        if expected is None or resource.contents is not expected[0] or resource._specification is not expected[1]:
            raise DatetimeAdmissionError("datetime_validator_use_resource_map")
    if len(registry._anchors) != len(pinned.anchors):
        raise DatetimeAdmissionError("datetime_validator_use_anchors")
    for key, anchor in registry._anchors.items():
        expected = pinned.anchors.get(key)
        if expected is None or type(anchor) is not expected[0] or anchor.name != expected[1] or \
                anchor.resource.contents is not expected[2]:
            raise DatetimeAdmissionError("datetime_validator_use_anchors")


def _verify_resolver(resolver, pins, run):
    """A resolver reads only the pinned resource map, from pinned URIs (its base and its dynamic scope)."""
    from referencing._core import Resolver
    from pm_event_datetime_inventory import DatetimeAdmissionError
    if type(resolver) is not Resolver:
        raise DatetimeAdmissionError("datetime_validator_use_resolver")
    if any(uri.rstrip("#") not in pins.uri_pins for uri in (resolver._base_uri, *resolver._previous)):
        raise DatetimeAdmissionError("datetime_resource_not_preloaded")
    registry = resolver._registry
    if run.registries.get(id(registry)) is not registry:
        _verify_registry(registry, pins.combined)
        run.registries[id(registry)] = registry


def _verify_dialect(validator, run):
    """The validator's class is a bound class with its keyword table and type checker, and nothing shadows them."""
    from pm_event_datetime_inventory import DatetimeAdmissionError
    cls = type(validator)
    pinned = _DIALECTS.get(cls)
    if pinned is None or dict(cls.VALIDATORS) != pinned[0] or cls.TYPE_CHECKER is not pinned[1]:
        raise DatetimeAdmissionError("datetime_validator_use_dialect")
    if not pinned[2].isdisjoint(validator.__dict__):
        raise DatetimeAdmissionError("datetime_validator_use_shadowed")
    run.classes.add(cls)


def _verify_use(validator, resolver=None, *, rehash=True):
    """Fix round 18: the effective configuration, recomputed at use, equals the pins fixed at construction.

    Every entry point that validates runs this before anything validates,
    content hashes included. Any difference raises, whatever route made it:
    evolution, assignment or deletion, a copy, a substituted resolver or
    registry, a changed resource map, or an in-place edit of any of them.
    A run that resumes after yielding an error runs it again, since the
    caller's code ran in between, without re-hashing content (rehash=False):
    that run has already refused its instance, and the next entry re-hashes.
    """
    from pm_event_datetime_inventory import DatetimeAdmissionError
    state = validator.__dict__
    binding = state.get("datetime_binding")
    if type(binding) is not _Binding or binding[3] not in _ISSUED:
        raise DatetimeAdmissionError("datetime_validator_use_binding")
    pins = binding[3]
    if binding[0] is not pins.checker or binding[1] is not pins.registry or binding[2] is not pins.selection:
        raise DatetimeAdmissionError("datetime_validator_use_binding_entries")
    if state.get("_datetime_fixed") is not True:
        raise DatetimeAdmissionError("datetime_validator_use_marker")
    run = _Run(pins)
    _verify_dialect(validator, run)
    checker = validator.format_checker
    if checker is not pins.checker or type(checker) is not _fixed_checker_class() or \
            checker.__dict__.keys() != {"checkers", "_fixed"} or checker.checkers is not pins.table or \
            pins.table.get("date-time") is not pins.entry:
        raise DatetimeAdmissionError("datetime_validator_use_format_checker")
    if validator._ref_resolver is not None:
        raise DatetimeAdmissionError("datetime_validator_use_ref_resolver")
    if validator._registry is not pins.registry:
        raise DatetimeAdmissionError("datetime_validator_use_registry")
    _verify_registry(pins.registry, pins.closed)
    _verify_resolver(validator._resolver, pins, run)
    if resolver is not None:
        _verify_resolver(resolver, pins, run)
    _verify_selection(validator.storage_selection, pins, rehash)
    return run


def _verify_selection(selection, pins, rehash=True):
    """The selection is the bound one, with its pins, nodes, rows and resources as fixed, and content unchanged."""
    from pm_event_datetime_inventory import DatetimeAdmissionError, StorageSelection
    if selection is not pins.selection or type(selection) is not StorageSelection:
        raise DatetimeAdmissionError("datetime_validator_use_selection")
    if selection.uri_pins != pins.uri_pins:
        raise DatetimeAdmissionError("datetime_validator_use_selection_pins")
    if selection.nodes.keys() != pins.nodes.keys():
        raise DatetimeAdmissionError("datetime_validator_use_selection_nodes")
    for key, entry in selection.nodes.items():
        if entry is not pins.nodes[key] or _row_pin(entry[1]) != pins.rows[key]:
            raise DatetimeAdmissionError("datetime_validator_use_selection_nodes")
    if selection.resources.keys() != pins.selected.keys():
        raise DatetimeAdmissionError("datetime_validator_use_selection_resources")
    for key, entry in selection.resources.items():
        if entry is not pins.selected[key]:
            raise DatetimeAdmissionError("datetime_validator_use_selection_resources")
    if rehash:
        selection.verify_resources()


def _verify_step(validator, resolver, run):
    """Inside a verified run on this thread: the evolved validator still carries exactly the pinned objects."""
    from pm_event_datetime_inventory import DatetimeAdmissionError
    pins = run.pins
    if validator.__dict__.get("_datetime_fixed") is not True:
        raise DatetimeAdmissionError("datetime_validator_use_marker")
    if type(validator) not in run.classes:
        _verify_dialect(validator, run)
    if validator.format_checker is not pins.checker or validator._ref_resolver is not None or \
            validator._registry is not pins.registry or validator.storage_selection is not pins.selection:
        raise DatetimeAdmissionError("datetime_validator_use_step")
    _verify_resolver(validator._resolver, pins, run)
    if resolver is not None:
        _verify_resolver(resolver, pins, run)


def _pins_of(validator):
    binding = validator.__dict__.get("datetime_binding")
    return binding[3] if type(binding) is _Binding else None


def _guarded(validator, resolver, body):
    """Run one validating entry point's body under a verified configuration.

    Nested in a run already verified on this thread (jsonschema's own descend,
    references and in-place applicators), a step check suffices: no caller
    code runs while the run executes. Otherwise this call is an entry point:
    verify the whole configuration first, and again whenever the body
    resumes after yielding an error to the caller (by identity: content is
    re-hashed at every entry).
    """
    runs = _runs()
    if runs and runs[-1].pins is _pins_of(validator):
        _verify_step(validator, resolver, runs[-1])
        yield from body
        return
    run = _verify_use(validator, resolver)
    while True:
        runs.append(run)
        try:
            error = next(body)
        except StopIteration:
            return
        finally:
            runs.pop()
        yield error
        run = _verify_use(validator, resolver, rehash=False)


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
        "datetime_binding": field(kw_only=True),
    }, bases=(extended,))

    def evolve(self, **changes):
        schema = changes.setdefault("schema", self.schema)
        selected = _dialect_validator(schema, default=base)
        for field in fields(type(self)):
            if field.init and field.alias not in changes:
                changes[field.alias] = getattr(self, field.name)
        return _bound_validator(selected)(**changes)

    bound.evolve = evolve

    def post_init(self):
        # T166: every construction checks the binding fixed at datetime_validator:
        # this evolve, jsonschema's own (schema and _resolver only), attrs.evolve
        # and copy.replace alike. A changed checker, registry, resolver or
        # selection raises the TypeError construction gives. Fix round 18: the
        # binding must carry pins _bind issued, and a resolver over another
        # registry object must read exactly the pinned resource map.
        from pm_event_datetime_inventory import DatetimeAdmissionError
        extended.__attrs_post_init__(self)
        binding = self.datetime_binding
        if type(binding) is not _Binding or binding[3] not in _ISSUED or \
                binding[0] is not binding[3].checker or binding[1] is not binding[3].registry or \
                binding[2] is not binding[3].selection:
            raise TypeError("datetime_validator_binding_forged")
        if self.format_checker is not binding.checker:
            raise TypeError("datetime_validator_fixed_format_checker")
        if self._registry is not binding.registry:
            raise TypeError("datetime_validator_fixed_registry")
        if self._ref_resolver is not None or self._resolver._registry._retrieve is not binding.registry._retrieve:
            raise TypeError("datetime_validator_fixed_resolver")
        if self._resolver._registry is not binding.pins.resolver_registry:
            try:
                _verify_registry(self._resolver._registry, binding.pins.combined)
            except DatetimeAdmissionError as error:
                raise TypeError("datetime_validator_fixed_resolver: " + error.reason) from None
        if self.storage_selection is not binding.selection:
            raise TypeError("datetime_validator_fixed_storage_selection")
        self.__dict__["_datetime_fixed"] = True

    def setattr_(self, name, value):
        # After construction the binding cannot be reassigned either; this also
        # stops the deprecated .resolver property installing a legacy resolver.
        # Fix round 18: nor can an instance attribute shadow a method or a
        # class-level table (iter_errors, is_valid, VALIDATORS, TYPE_CHECKER).
        if "_datetime_fixed" in self.__dict__ and (name in _FIXED_ATTRIBUTES or name in _DIALECTS[type(self)][2]):
            raise TypeError("datetime_validator_fixed: " + name)
        object.__setattr__(self, name, value)

    def delattr_(self, name):
        # T189: the marker and the fixed attributes cannot be deleted either.
        if "_datetime_fixed" in self.__dict__ and name in _FIXED_ATTRIBUTES:
            raise TypeError("datetime_validator_fixed: " + name)
        object.__delattr__(self, name)

    bound.__attrs_post_init__ = post_init
    bound.__setattr__ = setattr_
    bound.__delattr__ = delattr_

    def iter_errors(self, instance, _schema=None):
        from pm_event_datetime_inventory import DatetimeAdmissionError
        if _schema is not None and _schema is not self.schema:
            raise DatetimeAdmissionError("datetime_schema_override_unsupported")
        schema = self.schema
        self.storage_selection.admit(schema)
        yield from _eventrecord_storage_properties(self, None, instance, schema)
        yield from extended.iter_errors(self, instance, _schema)

    def descend(self, instance, schema, path=None, schema_path=None, resolver=None):
        # descend executes keywords itself; it does not call iter_errors.
        # Admission must precede *every* fragment, including required-only or
        # patternProperties schemas and dialect changes during reference use.
        # Composed errors carry this fragment's own path, as jsonschema's are.
        # An explicit resolver's URIs and registry are verified at use, before
        # this body runs (_verify_resolver; fix round 18).
        self.storage_selection.admit(schema)
        for error in _eventrecord_storage_properties(self, None, instance, schema):
            if path is not None:
                error.path.appendleft(path)
            if schema_path is not None:
                error.schema_path.appendleft(schema_path)
            yield error
        yield from extended.descend(self, instance, schema, path=path, schema_path=schema_path, resolver=resolver)

    def validate_reference(self, ref, instance):
        from urllib.parse import urljoin, urldefrag
        from pm_event_datetime_inventory import DatetimeAdmissionError
        base_uri = self._resolver._base_uri
        uri = urldefrag(base_uri if ref.startswith("#") else urljoin(base_uri, ref))[0]
        if uri not in self.storage_selection.uri_pins:
            raise DatetimeAdmissionError("datetime_resource_not_preloaded: " + uri)
        yield from extended._validate_reference(self, ref, instance)

    # Fix round 18: every validating entry point verifies the configuration at use.
    def guarded_iter_errors(self, instance, _schema=None):
        return _guarded(self, None, iter_errors(self, instance, _schema))

    def guarded_descend(self, instance, schema, path=None, schema_path=None, resolver=None):
        return _guarded(self, resolver, descend(self, instance, schema, path, schema_path, resolver))

    def guarded_reference(self, ref, instance):
        return _guarded(self, None, validate_reference(self, ref, instance))

    def is_valid(self, instance, _schema=None):
        # The class's own iter_errors, never an attribute of the instance.
        if _schema is not None:
            return extended.is_valid(self, instance, _schema)
        return next(guarded_iter_errors(self, instance), None) is None

    def validate(self, *args, **kwargs):
        error = next(guarded_iter_errors(self, *args, **kwargs), None)
        if error is not None:
            raise error

    bound._validate_reference = guarded_reference
    bound.iter_errors = guarded_iter_errors
    bound.descend = guarded_descend
    bound.is_valid = is_valid
    bound.validate = validate
    _DIALECTS[bound] = (dict(bound.VALIDATORS), bound.TYPE_CHECKER, frozenset(dir(bound)))
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
    return _bind(base, schema, registry, selection, profile, **kwargs)


def _bind(base, schema, registry, selection, profile, **kwargs):
    """Construct the bound validator with its binding fixed (T166).

    The checker, the closed registry and the selection are fixed here: every
    later construction (evolve, attrs.evolve, copy.replace) and assignment
    that changes one of them raises TypeError, as a format_checker,
    storage_selection or datetime_binding argument to datetime_validator does.
    Fix round 18: the resolver is the one jsonschema itself builds for this
    schema and registry, and the pins of the whole configuration are issued
    here, for every use to compare against.
    """
    checker = format_checker(profile=profile)
    resolver = base(schema, registry=registry)._resolver
    pins = _Pins(checker, registry, resolver, selection)
    return _bound_validator(base)(
        schema, registry=registry, format_checker=checker, storage_selection=selection,
        datetime_binding=_Binding(checker, registry, selection, pins), _resolver=resolver, **kwargs)
