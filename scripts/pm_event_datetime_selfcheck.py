"""Fine-grained, individually runnable checks of the CV-1101 date-time code.

Each check is a named function of a fresh Context that returns True when the
date-time code behaves as the owner text requires, usually by an exact
refusal code or an exact evidence field. run_all() runs every check; the
--scope all self-test runs them through regression_checks. The mutation
replay (pm_event_datetime_mutations.py --mutations) runs one mutant's witness
check alone. Production modules are imported at call time, so a mutant
installed in sys.modules is the code under test. Scratch roots live in a
temporary directory; committed files are never written.

The checks call the date-time functions directly with small inputs: the
predicate and its profiles, the format checker, the closed-graph and bound
validator hooks over a StorageSelection built from explicit rows, the scan
over scratch Plans trees, validate_inventory over one-row scratch inventories,
the value probe over one rewritten map, and reviewed_role over explicit
evidence. Checks that need the committed inventory selections are marked
slow (about 10 s for the first, cached per context).
"""
from __future__ import annotations

import copy
import contextlib
import hashlib
import io
import json
import os
from pathlib import Path
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
CHECKS = {}
SLOW = set()
# Code objects of the module under test, set by the mutation runner so that
# a CLI check executes the mutant's own __main__ path.
CODE = {}
SECTION15 = "Plans/section15_browser_program_contracts.schema.json"
MAP_POINTER = "/$defs/browser_program/properties/result_schema_dependencies"
D202012 = "https://json-schema.org/draft/2020-12/schema"
D201909 = "https://json-schema.org/draft/2019-09/schema"
D7 = "http://json-schema.org/draft-07/schema#"
REVIEW = "wildcard_role_review_required"
CHANGED = "wildcard_role_evidence_changed"


def check(name, *, slow=False):
    def register(function):
        if name in CHECKS:
            raise ValueError("duplicate self-check name: " + name)
        CHECKS[name] = function
        if slow:
            SLOW.add(name)
        return function
    return register


def _mods():
    import pm_event_datetime as dt
    import pm_event_datetime_inventory as inv
    import pm_event_datetime_value_probe as probe
    import pm_event_numbers as m
    return dt, inv, probe, m


class StrSub(str):
    """A str subclass instance: equal to its text, but not exactly a str."""


def outcome(function, *args, **kwargs):
    """('accept', value) | ('refuse', reason) | ('exception', type name)."""
    _, _, _, m = _mods()
    try:
        return ("accept", function(*args, **kwargs))
    except m.Refusal as error:
        return ("refuse", error.reason)
    except Exception as error:  # noqa: BLE001 - any other exception is its own outcome
        return ("exception", type(error).__name__)


def raised(function, *args, **kwargs):
    """outcome(), except that a plain ValueError gives ('value_error', its message)."""
    _, _, _, m = _mods()
    try:
        return ("accept", function(*args, **kwargs))
    except m.Refusal as error:
        return ("refuse", error.reason)
    except ValueError as error:
        return ("value_error", str(error))
    except Exception as error:  # noqa: BLE001
        return ("exception", type(error).__name__)


def _chain(error):
    """The exception and every cause or context below it."""
    seen = []
    while error is not None and error not in seen:
        seen.append(error)
        error = error.__cause__ or error.__context__
    return seen


class Context:
    """Per-run state: the repository root, scratch roots and caches."""

    def __init__(self, root=ROOT):
        self.root = Path(root)
        self._temp = tempfile.TemporaryDirectory(prefix="pm-datetime-selfcheck-")
        self._count = 0
        self.cache = {}

    def close(self):
        self._temp.cleanup()

    def inventory(self):
        if "inventory" not in self.cache:
            _, inv, _, _ = _mods()
            self.cache["inventory"] = json.loads((self.root / inv.INVENTORY).read_text())
        return copy.deepcopy(self.cache["inventory"])

    def row(self, path, pointer):
        return next(r for r in self.inventory()["nodes"] if r["path"] == path and r["pointer"] == pointer)

    def scratch(self, copies=(), exclusions=()):
        """A fresh scratch root with Plans/, scripts/, the listed repository files and exclusions."""
        _, inv, _, _ = _mods()
        self._count += 1
        root = Path(self._temp.name) / ("root%d" % self._count)
        (root / "Plans").mkdir(parents=True)
        (root / "scripts").mkdir()
        for path in copies:
            target = root / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes((self.root / path).read_bytes())
        (root / inv.EXCLUSIONS).write_text(json.dumps(list(exclusions)))
        return root


def write(root, path, data):
    target = Path(root) / path
    target.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(data, bytes):
        target.write_bytes(data)
    elif isinstance(data, str):
        target.write_text(data)
    else:
        target.write_text(json.dumps(data))
    return target


def run_check(name, context):
    """One check's verdict: True, False or the exception type name (a failure)."""
    try:
        result = CHECKS[name](context)
    except Exception as error:  # noqa: BLE001 - an exception fails the check, never passes it
        return "exception:" + type(error).__name__
    return result is True


def run_all(root=ROOT, *, names=None):
    context = Context(root)
    try:
        return {name: run_check(name, context) is True for name in (names or CHECKS)}
    finally:
        context.close()


# ---------------------------------------------------------------------------
# A. The CV-1101 predicate and its owner profiles.
# ---------------------------------------------------------------------------

E, S, C, L = "event_record", "storage_utc_z", "coordination_utc_z", "legacy_normalization_output"
OK = None
DATE_TIME_CASES = (
    # label, value, profile, expected refusal code (None: accepted, returned unchanged)
    ("profile_not_str", "2026-01-01T00:00:00Z", 1, "date_time_profile"),
    ("profile_str_subclass", "2026-01-01T00:00:00Z", StrSub(E), "date_time_profile"),
    ("profile_unknown", "2026-01-01T00:00:00Z", "utc", "date_time_profile"),
    ("value_not_str", 20260101, E, "date_time_type"),
    ("value_str_subclass", StrSub("2026-01-01T00:00:00Z"), E, "date_time_type"),
    ("space_separator", "2026-01-01 00:00:00Z", E, "date_time_syntax"),
    ("missing_zone", "2026-01-01T00:00:00", E, "date_time_syntax"),
    ("trailing_lf", "2026-01-01T00:00:00Z\n", E, "date_time_syntax"),
    ("leading_space", " 2026-01-01T00:00:00Z", E, "date_time_syntax"),
    ("unicode_digits", "２０２６-01-01T00:00:00Z", E, "date_time_syntax"),
    ("empty_fraction", "2026-01-01T00:00:00.Z", E, "date_time_syntax"),
    ("five_digit_year", "12026-01-01T00:00:00Z", E, "date_time_syntax"),
    ("offset_without_colon", "2026-01-01T00:00:00+0000", E, "date_time_syntax"),
    ("month_00", "2026-00-01T00:00:00Z", E, "date_time_month"),
    ("month_13", "2026-13-01T00:00:00Z", E, "date_time_month"),
    ("month_01", "2026-01-15T00:00:00Z", E, OK),
    ("month_12", "2026-12-15T00:00:00Z", E, OK),
    ("day_00", "2026-01-00T00:00:00Z", E, "date_time_day"),
    ("day_32", "2026-01-32T00:00:00Z", E, "date_time_day"),
    ("day_01", "2026-03-01T00:00:00Z", E, OK),
    ("day_31_january", "2026-01-31T00:00:00Z", E, OK),
    ("day_31_april", "2026-04-31T00:00:00Z", E, "date_time_day"),
    ("february_29_common", "2026-02-29T00:00:00Z", E, "date_time_day"),
    ("february_29_leap", "2024-02-29T00:00:00Z", E, OK),
    ("february_29_century", "1900-02-29T00:00:00Z", E, "date_time_day"),
    ("february_29_400", "2000-02-29T00:00:00Z", E, OK),
    ("year_0000_leap_day", "0000-02-29T00:00:00Z", E, OK),
    ("year_9999_last_second", "9999-12-31T23:59:59Z", E, OK),
    ("hour_23", "2026-01-01T23:00:00Z", E, OK),
    ("hour_24", "2026-01-01T24:00:00Z", E, "date_time_hour"),
    ("minute_59", "2026-01-01T00:59:00Z", E, OK),
    ("minute_60", "2026-01-01T00:60:00Z", E, "date_time_minute"),
    ("second_59", "2026-01-01T00:00:59Z", E, OK),
    ("second_61", "2026-01-01T00:00:61Z", E, "date_time_second"),
    ("second_60_not_leap", "2026-01-01T00:00:60Z", E, "date_time_leap_second"),
    ("leap_second_2016", "2016-12-31T23:59:60Z", E, OK),
    ("leap_second_1972_june", "1972-06-30T23:59:60Z", E, OK),
    ("leap_second_lowercase", "2016-12-31t23:59:60z", E, OK),
    ("leap_second_unannounced_june", "2017-06-30T23:59:60Z", E, "date_time_leap_second"),
    ("leap_second_unannounced_december", "2015-12-31T23:59:60Z", E, "date_time_leap_second"),
    ("leap_second_minute_58", "2016-12-31T23:58:60Z", E, "date_time_leap_second"),
    ("leap_second_offset_applied", "2017-01-01T00:59:60+01:00", E, OK),
    ("leap_second_negative_offset", "2016-12-31T18:59:60-05:00", E, OK),
    ("leap_second_half_hour_offset", "2017-01-01T05:29:60+05:30", E, OK),
    ("leap_second_local_month_end", "2016-12-31T23:59:60+01:00", E, "date_time_leap_second"),
    ("offset_23_59", "2026-01-01T00:00:00+23:59", E, OK),
    ("offset_hour_24", "2026-01-01T00:00:00+24:00", E, "date_time_offset_hour"),
    ("offset_negative_hour_24", "2026-01-01T00:00:00-24:00", E, "date_time_offset_hour"),
    ("offset_minute_60", "2026-01-01T00:00:00+00:60", E, "date_time_offset_minute"),
    ("lowercase_t_and_z", "2026-01-01t00:00:00z", E, OK),
    ("plus_zero_offset", "2026-01-01T00:00:00+00:00", E, OK),
    ("minus_zero_offset", "2026-01-01T00:00:00-00:00", E, OK),
    ("nonzero_offset", "2026-01-01T00:00:00+05:30", E, OK),
    ("forty_digit_fraction", "2026-01-01T00:00:00." + "1234567890" * 4 + "Z", E, OK),
    ("storage_upper_z", "2026-01-01T00:00:00Z", S, OK),
    ("storage_long_fraction", "2026-01-01T00:00:00." + "9" * 30 + "Z", S, OK),
    ("storage_leap_second", "2016-12-31T23:59:60Z", S, OK),
    ("storage_lower_z", "2026-01-01T00:00:00z", S, "date_time_utc_z"),
    ("storage_plus_zero", "2026-01-01T00:00:00+00:00", S, "date_time_utc_z"),
    ("storage_minus_zero", "2026-01-01T00:00:00-00:00", S, "date_time_utc_z"),
    ("storage_offset", "2026-01-01T00:00:00+05:30", S, "date_time_utc_z"),
    ("storage_invalid_day_first", "2026-02-30T00:00:00+05:30", S, "date_time_day"),
    ("coordination_upper_z", "2026-01-01T00:00:00.5Z", C, OK),
    ("coordination_offset", "2026-01-01T00:00:00+00:00", C, "date_time_utc_z"),
    ("coordination_lower_z", "2026-01-01T00:00:00z", C, "date_time_utc_z"),
    ("legacy_nine_digits", "2026-01-01T00:00:00.123456789Z", L, OK),
    ("legacy_no_fraction", "2026-01-01T00:00:00Z", L, "date_time_legacy_fraction"),
    ("legacy_eight_digits", "2026-01-01T00:00:00.12345678Z", L, "date_time_legacy_fraction"),
    ("legacy_ten_digits", "2026-01-01T00:00:00.1234567890Z", L, "date_time_legacy_fraction"),
    ("legacy_offset", "2026-01-01T00:00:00.123456789+00:00", L, "date_time_utc_z"),
    ("legacy_lower_z", "2026-01-01T00:00:00.123456789z", L, "date_time_utc_z"),
)


def _date_time_check(value, profile, expected):
    def run(context):
        dt, _, _, _ = _mods()
        kind, result = outcome(dt.date_time, value, profile=profile)
        if expected is None:
            return kind == "accept" and result is value
        return (kind, result) == ("refuse", expected)
    return run


for _label, _value, _profile, _expected in DATE_TIME_CASES:
    check("datetime_unit_date_time_" + _label)(_date_time_check(_value, _profile, _expected))


@check("datetime_unit_date_time_default_profile_is_event_record")
def _default_profile(context):
    dt, _, _, _ = _mods()
    value = "2026-01-01T00:00:00+05:30"
    return dt.date_time(value) is value and dt.EVENT_RECORD == "event_record"


@check("datetime_unit_date_time_every_profile_selectable")
def _profiles(context):
    dt, _, _, _ = _mods()
    value = "2026-01-01T00:00:00.123456789Z"
    return dt.PROFILES == (E, S, C, L) and all(dt.date_time(value, profile=p) is value for p in dt.PROFILES)


@check("datetime_unit_date_time_leap_table_edition")
def _leap_table(context):
    dt, _, _, _ = _mods()
    days = dt._LEAP_DAYS
    return (len(days) == 27 and days[0] == "1972-06-30" and days[-1] == "2016-12-31" and
            all(outcome(dt.date_time, d + "T23:59:60Z")[0] == "accept" for d in days))


# ---------------------------------------------------------------------------
# B. The explicitly registered format checker.
# ---------------------------------------------------------------------------

@check("datetime_unit_format_checker_profile_not_str")
def _fc_profile_type(context):
    dt, _, _, _ = _mods()
    return outcome(dt.format_checker, profile=1) == ("refuse", "date_time_profile")


@check("datetime_unit_format_checker_profile_str_subclass")
def _fc_profile_subclass(context):
    dt, _, _, _ = _mods()
    return outcome(dt.format_checker, profile=StrSub(E)) == ("refuse", "date_time_profile")


@check("datetime_unit_format_checker_profile_unknown")
def _fc_profile_unknown(context):
    dt, _, _, _ = _mods()
    return outcome(dt.format_checker, profile="utc") == ("refuse", "date_time_profile")


@check("datetime_unit_format_checker_runs_predicate")
def _fc_runs(context):
    from jsonschema import FormatError
    dt, _, _, m = _mods()
    checker = dt.format_checker()
    try:
        checker.check("2026-02-30T00:00:00Z", "date-time")
    except FormatError as error:
        refused = isinstance(error.cause, m.Refusal) and error.cause.reason == "date_time_day"
    else:
        refused = False
    return (refused and checker.conforms("2016-12-31t23:59:60z", "date-time") and
            not checker.conforms("2026-01-01T00:00:00", "date-time"))


@check("datetime_unit_format_checker_non_string_passes")
def _fc_non_string(context):
    dt, _, _, _ = _mods()
    checker = dt.format_checker()
    return all(checker.conforms(v, "date-time") for v in (12, None, ["x"], {"a": 1}))


@check("datetime_unit_format_checker_storage_profile")
def _fc_storage(context):
    dt, _, _, _ = _mods()
    checker = dt.format_checker(profile=S)
    return (checker.conforms("2026-01-01T00:00:00Z", "date-time") and
            not checker.conforms("2026-01-01T00:00:00+00:00", "date-time") and
            dt.format_checker().conforms("2026-01-01T00:00:00+00:00", "date-time"))


# ---------------------------------------------------------------------------
# C. Runtime admission: dialects, the closed graph and the bound validator.
# ---------------------------------------------------------------------------

def _admission_reason(function, *args, **kwargs):
    _, inv, _, _ = _mods()
    try:
        function(*args, **kwargs)
    except inv.DatetimeAdmissionError as error:
        return error.reason
    except Exception as error:  # noqa: BLE001
        return "exception:" + type(error).__name__
    return None


@check("datetime_unit_dialect_unsupported_draft4")
def _dialect_draft4(context):
    dt, _, _, _ = _mods()
    return _admission_reason(dt._dialect_validator, {"$schema": "http://json-schema.org/draft-04/schema#"}) == \
        "datetime_dialect_unsupported"


@check("datetime_unit_dialect_not_string")
def _dialect_not_string(context):
    dt, _, _, _ = _mods()
    return _admission_reason(dt._dialect_validator, {"$schema": 4}) == "datetime_dialect_unsupported"


@check("datetime_unit_dialect_supported_four")
def _dialect_supported(context):
    from jsonschema import Draft202012Validator, Draft201909Validator, Draft7Validator, Draft6Validator
    dt, _, _, _ = _mods()
    pairs = ((D202012, Draft202012Validator), (D201909, Draft201909Validator), (D7, Draft7Validator),
             ("http://json-schema.org/draft-06/schema#", Draft6Validator),
             (D202012 + "#", Draft202012Validator), (D7.rstrip("#"), Draft7Validator))
    return (all(dt._dialect_validator({"$schema": uri}) is cls for uri, cls in pairs) and
            dt._dialect_validator({}) is Draft202012Validator and
            dt._dialect_validator({}, default=Draft7Validator) is Draft7Validator)


@check("datetime_unit_closed_graph_retrieve_refused")
def _graph_retrieve(context):
    from referencing import Registry
    dt, _, _, _ = _mods()
    calls = []

    def retrieve(uri):
        calls.append(uri)
        raise LookupError(uri)
    return (_admission_reason(dt._closed_datetime_graph, {}, Registry(retrieve=retrieve)) ==
            "datetime_on_demand_retrieval_unsupported" and not calls)


@check("datetime_unit_closed_graph_registry_lookalike_refused")
def _graph_lookalike(context):
    import types
    from referencing import Registry
    dt, _, _, _ = _mods()
    # Not a Registry, though its retrieve is the default one.
    lookalike = types.SimpleNamespace(_retrieve=Registry()._retrieve)
    return _admission_reason(dt._closed_datetime_graph, {}, lookalike) == "datetime_on_demand_retrieval_unsupported"


@check("datetime_unit_closed_graph_missing_resource_refused")
def _graph_missing(context):
    import referencing.exceptions
    dt, inv, _, _ = _mods()
    _, registry = dt._closed_datetime_graph({"$ref": "urn:pm:missing"})
    try:
        registry.resolver().lookup("urn:pm:missing")
    except referencing.exceptions.Unresolvable as error:
        chain = _chain(error)
        causes = [e for e in chain if isinstance(e, inv.DatetimeAdmissionError)]
        return (any(isinstance(e, referencing.exceptions.Unretrievable) for e in chain) and bool(causes) and
                causes[0].reason == "datetime_resource_not_preloaded: urn:pm:missing")
    except Exception:  # noqa: BLE001
        return False
    return False


@check("datetime_unit_closed_graph_dialect_checked_for_every_resource")
def _graph_resource_dialect(context):
    from referencing import Registry, Resource
    from referencing.jsonschema import DRAFT202012
    dt, _, _, _ = _mods()
    bad = {"$schema": "http://json-schema.org/draft-04/schema#", "$id": "urn:pm:old"}
    registry = Registry().with_resource("urn:pm:old", Resource.from_contents(bad, default_specification=DRAFT202012))
    return _admission_reason(dt._closed_datetime_graph, {"$ref": "urn:pm:old"}, registry) == \
        "datetime_dialect_unsupported"


@check("datetime_unit_custom_resolver_refused")
def _custom_resolver(context):
    dt, _, _, _ = _mods()
    return _admission_reason(dt.datetime_validator, {}, resolver=object()) == "datetime_custom_resolver_unsupported"


@check("datetime_unit_custom_private_resolver_refused")
def _custom_private_resolver(context):
    dt, _, _, _ = _mods()
    return _admission_reason(dt.datetime_validator, {}, _resolver=object()) == "datetime_custom_resolver_unsupported"


def _selection(rows=()):
    """A real StorageSelection over explicit rows, without the committed inventory.

    rows lists (complete resource object, {relative pointer: row}) pairs; the
    selection keys each by the resource digest, as resource_selections does.
    """
    _, inv, _, _ = _mods()
    selection = inv.StorageSelection.__new__(inv.StorageSelection)
    selection.selections = {}
    for resource, by_pointer in rows:
        selection.selections[inv.digest(resource)] = by_pointer
    selection.nodes, selection.visited, selection.resources, selection.uri_pins = {}, {}, {}, {}
    selection.known_uris = {}
    return selection


def _bound(schema, registry=None, selection=None, profile="event_record"):
    """The bound validator as datetime_validator builds it, over an explicit selection."""
    dt, _, _, _ = _mods()
    selection = selection or _selection()
    base, registry = dt._closed_datetime_graph(schema, registry, selection=selection)
    return dt._bound_validator(base)(schema, registry=registry, format_checker=dt.format_checker(profile=profile),
                                     storage_selection=selection)


def _storage_schema():
    return {"$schema": D202012, "$id": "urn:pm:scratch:envelope", "type": "object",
            "properties": {"observed_at_utc": {"type": "string", "format": "date-time"},
                           "persisted_at_utc": {"type": "string", "format": "date-time"},
                           "occurred_at_utc": {"type": "string", "format": "date-time"}}}


def _storage_row(schema, profile="storage_utc_z"):
    _, inv, _, _ = _mods()
    return {"path": "Plans/scratch.json", "origin": "json", "pointer": "", "resource_pointer": "",
            "fields": ["observed_at_utc", "persisted_at_utc"], "profile": profile,
            "node_sha256": inv.digest(schema), "resource_sha256": inv.digest(schema)}


@check("datetime_unit_bound_override_refused")
def _bound_override(context):
    validator = _bound({"type": "object"})
    return _admission_reason(lambda: list(validator.iter_errors({}, _schema={}))) == \
        "datetime_schema_override_unsupported"


@check("datetime_unit_bound_reference_not_preloaded")
def _bound_reference(context):
    validator = _bound({"anyOf": [{"type": "null"}, {"$ref": "urn:pm:missing"}]})
    return _admission_reason(validator.is_valid, {}) == "datetime_resource_not_preloaded: urn:pm:missing"


@check("datetime_unit_bound_resource_mutation_refused")
def _bound_mutation(context):
    schema = {"type": "object", "title": "before"}
    validator = _bound(schema)
    schema["title"] = "after"
    return _admission_reason(validator.is_valid, {}) == "datetime_schema_changed_after_admission"


@check("datetime_unit_bound_unclassified_declaration_refused")
def _bound_unclassified(context):
    return _admission_reason(lambda: _bound({"properties": {"observed_at_utc": {}}}).is_valid({})) == \
        "datetime_schema_unclassified"


@check("datetime_unit_bound_unclassified_nested_reference_refused")
def _bound_unclassified_ref(context):
    from referencing import Registry, Resource
    from referencing.jsonschema import DRAFT202012
    declaration = {"$id": "urn:pm:unclassified", "required": ["persisted_at_utc"]}
    registry = Registry().with_resource("urn:pm:unclassified",
                                        Resource.from_contents(declaration, default_specification=DRAFT202012))
    validator = _bound({"properties": {"value": {"$ref": "urn:pm:unclassified"}}}, registry)
    # A string instance: only descend's own admission sees the referenced declaration.
    return _admission_reason(validator.is_valid, {"value": "x"}) == "datetime_schema_unclassified"


@check("datetime_unit_bound_unclassified_nested_object_refused")
def _bound_unclassified_object(context):
    from referencing import Registry, Resource
    from referencing.jsonschema import DRAFT202012
    declaration = {"$id": "urn:pm:unclassified", "required": ["persisted_at_utc"]}
    registry = Registry().with_resource("urn:pm:unclassified",
                                        Resource.from_contents(declaration, default_specification=DRAFT202012))
    validator = _bound({"properties": {"value": {"$ref": "urn:pm:unclassified"}}}, registry)
    return _admission_reason(validator.is_valid, {"value": {}}) == "datetime_schema_unclassified"


@check("datetime_unit_bound_alias_uri_pinned")
def _bound_alias(context):
    from referencing import Registry, Resource
    from referencing.jsonschema import DRAFT202012
    anonymous = {"type": "string", "format": "date-time"}
    registry = Registry().with_resource("urn:pm:alias", Resource.from_contents(anonymous, default_specification=DRAFT202012))
    validator = _bound({"properties": {"t": {"$ref": "urn:pm:alias"}}}, registry)
    return validator.is_valid({"t": "2026-01-01T00:00:00Z"}) and not validator.is_valid({"t": "2026-02-30T00:00:00Z"})


@check("datetime_unit_bound_descend_unpinned_resolver_refused")
def _bound_descend(context):
    from referencing import Registry
    validator = _bound({"type": "object"})
    resolver = Registry().resolver("urn:pm:unpinned")
    return _admission_reason(lambda: list(validator.descend({}, {"type": "object"}, resolver=resolver))) == \
        "datetime_resource_not_preloaded"


@check("datetime_unit_bound_storage_composition")
def _bound_storage(context):
    schema = _storage_schema()
    validator = _bound(schema, selection=_selection([(schema, {"": _storage_row(schema)})]))
    good = {"observed_at_utc": "2026-01-01T00:00:00.123456789123Z", "persisted_at_utc": "2016-12-31T23:59:60Z",
            "occurred_at_utc": "2026-01-01t00:00:00+05:30"}
    return (validator.is_valid(good) and
            all(not validator.is_valid(dict(good, **{f: v})) for f in ("observed_at_utc", "persisted_at_utc")
                for v in ("2026-01-01T00:00:00+00:00", "2026-01-01T00:00:00-00:00", "2026-01-01T00:00:00z",
                          "2026-01-01T00:00:00+05:30", "2026-01-01T00:00:00Z\n", "2026-02-30T00:00:00Z")))


@check("datetime_unit_bound_storage_composition_through_reference")
def _bound_storage_ref(context):
    from referencing import Registry, Resource
    from referencing.jsonschema import DRAFT202012
    schema = _storage_schema()
    registry = Registry().with_resource(schema["$id"], Resource.from_contents(schema, default_specification=DRAFT202012))
    selection = _selection([(schema, {"": _storage_row(schema)})])
    wrapper = {"properties": {"batch": {"type": "array", "items": {"allOf": [{"$ref": schema["$id"]}]}}}}
    validator = _bound(wrapper, registry, selection)
    return (validator.is_valid({"batch": [{"persisted_at_utc": "2026-01-01T00:00:00Z"}]}) and
            not validator.is_valid({"batch": [{"persisted_at_utc": "2026-01-01T00:00:00+00:00"}]}))


@check("datetime_unit_bound_owner_schema_no_overlay")
def _bound_owner(context):
    schema = _storage_schema()
    validator = _bound(schema, selection=_selection([(schema, {"": _storage_row(schema, "owner_schema")})]))
    return (validator.is_valid({"observed_at_utc": "2026-01-01T00:00:00+05:30"}) and
            not validator.is_valid({"observed_at_utc": "2026-02-30T00:00:00Z"}))


@check("datetime_unit_bound_composition_only_two_fields")
def _bound_two_fields(context):
    schema = _storage_schema()
    validator = _bound(schema, selection=_selection([(schema, {"": _storage_row(schema)})]))
    return (validator.is_valid({"occurred_at_utc": "2026-01-01T00:00:00+05:30"}) and
            validator.is_valid({"occurred_at_utc": "2026-01-01t00:00:00z"}))


@check("datetime_unit_bound_composition_survives_dialect_change")
def _bound_dialect(context):
    from referencing import Registry, Resource
    from referencing.jsonschema import DRAFT202012
    schema = _storage_schema()
    registry = Registry().with_resource(schema["$id"], Resource.from_contents(schema, default_specification=DRAFT202012))
    selection = _selection([(schema, {"": _storage_row(schema)})])
    for dialect in (D7, D201909):
        wrapper = {"$schema": dialect, "$id": "urn:pm:scratch:wrapper:" + dialect[-12:], "allOf": [{"$ref": schema["$id"]}]}
        validator = _bound(wrapper, registry, selection)
        if validator.is_valid({"observed_at_utc": "2026-01-01T00:00:00z"}):
            return False
        if not validator.is_valid({"observed_at_utc": "2026-01-01T00:00:00Z"}):
            return False
    return True


@check("datetime_unit_bound_original_schema_unchanged")
def _bound_unchanged(context):
    schema = _storage_schema()
    before = json.dumps(schema, sort_keys=True)
    validator = _bound(schema, selection=_selection([(schema, {"": _storage_row(schema)})]))
    validator.is_valid({"observed_at_utc": "2026-01-01T00:00:00Z"})
    return json.dumps(schema, sort_keys=True) == before and validator.schema is schema


@check("datetime_unit_bound_preserves_original_predicates")
def _bound_original(context):
    schema = _storage_schema()
    schema["properties"]["observed_at_utc"]["maxLength"] = 20
    validator = _bound(schema, selection=_selection([(schema, {"": _storage_row(schema)})]))
    return (validator.is_valid({"observed_at_utc": "2026-01-01T00:00:00Z"}) and
            not validator.is_valid({"observed_at_utc": "2026-01-01T00:00:00.5Z"}))


@check("datetime_unit_bound_format_predicate_installed")
def _bound_format(context):
    validator = _bound({"format": "date-time"})
    return (validator.is_valid("2016-12-31T23:59:60Z") and not validator.is_valid("2015-12-31T23:59:60Z") and
            not validator.is_valid("2026-01-01T00:00:00") and validator.is_valid(5))


@check("datetime_validator_real_inventory_format_installed", slow=True)
def _real_validator(context):
    dt, _, _, _ = _mods()
    validator = dt.datetime_validator({"type": "string", "format": "date-time"})
    storage = dt.datetime_validator({"type": "string", "format": "date-time"}, profile=S)
    return (validator.is_valid("2016-12-31t23:59:60+00:00") and not validator.is_valid("2026-02-29T00:00:00Z") and
            not validator.is_valid("2026-01-01 00:00:00Z") and storage.is_valid("2026-01-01T00:00:00Z") and
            not storage.is_valid("2026-01-01T00:00:00z"))


@check("datetime_validator_real_inventory_envelope_storage_fields", slow=True)
def _real_envelope(context):
    from referencing import Registry, Resource
    dt, _, _, _ = _mods()
    envelope = json.loads((context.root / "Plans/event_record.schema.json").read_text())
    wire = json.loads((context.root / "Plans/seglog_frame_v2_wire_fixtures.json").read_text())
    registry = Registry().with_resource(envelope["$id"], Resource.from_contents(envelope))
    validator = dt.datetime_validator({"properties": {"event": {"$ref": envelope["$id"]}}}, registry=registry)
    event = wire["base_event"]
    return (validator.is_valid({"event": event}) and
            not validator.is_valid({"event": dict(event, persisted_at_utc="2026-01-01T00:00:00+00:00")}) and
            not validator.is_valid({"event": dict(event, observed_at_utc="2026-01-01T00:00:00z")}) and
            validator.is_valid({"event": dict(event, occurred_at_utc="2026-01-01t00:00:00+05:30")}))


@check("datetime_validator_real_inventory_unclassified_refused", slow=True)
def _real_unclassified(context):
    dt, _, _, _ = _mods()
    return _admission_reason(lambda: dt.datetime_validator({"required": ["observed_at_utc"]}).is_valid({})) == \
        "datetime_schema_unclassified"


@check("datetime_validator_real_inventory_retrieval_refused", slow=True)
def _real_retrieve(context):
    from referencing import Registry
    dt, _, _, _ = _mods()
    calls = []
    registry = Registry(retrieve=lambda uri: calls.append(uri))
    return (_admission_reason(dt.datetime_validator, {"$ref": "urn:pm:x"}, registry=registry) ==
            "datetime_on_demand_retrieval_unsupported" and not calls)


# ---------------------------------------------------------------------------
# D. StorageSelection: pins, resource verification and node admission.
# ---------------------------------------------------------------------------

@check("datetime_unit_selection_fingerprint_unclassified")
def _sel_fingerprint(context):
    selection = _selection()
    selection.known_uris = {"urn:pm:known": {"0" * 64}}
    return _admission_reason(selection.pin, "urn:pm:known#", {"a": 1}) == \
        "datetime_resource_fingerprint_unclassified: urn:pm:known"


@check("datetime_unit_selection_known_fingerprint_pins")
def _sel_known(context):
    _, inv, _, _ = _mods()
    selection = _selection()
    selection.known_uris = {"urn:pm:known": {inv.digest({"a": 1})}}
    selection.pin("urn:pm:known", {"a": 1})
    return selection.uri_pins == {"urn:pm:known": inv.digest({"a": 1})}


@check("datetime_unit_selection_uri_conflict")
def _sel_conflict(context):
    selection = _selection()
    selection.pin("urn:pm:a", {"a": 1})
    selection.pin("urn:pm:a#", {"a": 1})
    return _admission_reason(selection.pin, "urn:pm:a", {"a": 2}) == "datetime_resource_uri_conflict: urn:pm:a"


@check("datetime_unit_selection_verify_resources")
def _sel_verify(context):
    selection = _selection()
    schema = {"properties": {"x": {}}}
    selection.install(schema)
    selection.verify_resources()
    schema["properties"]["x"] = {"type": "string"}
    return _admission_reason(selection.verify_resources) == "datetime_schema_changed_after_admission"


@check("datetime_unit_selection_target_disappearance")
def _sel_disappear(context):
    schema = _storage_schema()
    selection = _selection([(schema, {"": _storage_row(schema)})])
    selection.install(schema)
    schema.clear()
    return _admission_reason(selection.verify_resources) == "datetime_schema_changed_after_admission"


@check("datetime_unit_selection_admit_changed_node")
def _sel_changed(context):
    schema = _storage_schema()
    selection = _selection([(schema, {"": _storage_row(schema)})])
    selection.install(schema)
    schema["title"] = "changed"
    return _admission_reason(selection.admit, schema) == "datetime_schema_changed_after_admission"


@check("datetime_unit_selection_admit_unclassified")
def _sel_unclassified(context):
    return _admission_reason(_selection().admit, {"properties": {"persisted_at_utc": {}}}) == \
        "datetime_schema_unclassified"


@check("datetime_unit_selection_admit_field_set_mismatch")
def _sel_mismatch(context):
    schema = _storage_schema()
    row = dict(_storage_row(schema), fields=["observed_at_utc"])
    selection = _selection([(schema, {"": row})])
    selection.install(schema)
    return _admission_reason(selection.admit, schema) == "datetime_schema_unclassified"


@check("datetime_unit_selection_admit_storage_fields")
def _sel_storage(context):
    schema = _storage_schema()
    selection = _selection([(schema, {"": _storage_row(schema)})])
    selection.install(schema)
    return (selection.admit(schema) == ("observed_at_utc", "persisted_at_utc") and
            selection.fields(schema) == ("observed_at_utc", "persisted_at_utc") and
            selection.admit({"type": "string"}) == () and selection.admit(True) == ())


@check("datetime_unit_selection_admit_owner_schema_empty")
def _sel_owner(context):
    schema = _storage_schema()
    selection = _selection([(schema, {"": _storage_row(schema, "owner_schema")})])
    selection.install(schema)
    return selection.admit(schema) == ()


@check("datetime_unit_selection_install_nested_resource")
def _sel_nested(context):
    _, inv, _, _ = _mods()
    inner = _storage_schema()
    outer = {"$defs": {"inner": inner}}
    selection = _selection([(inner, {"": _storage_row(inner)})])
    selection.install(outer)
    return (selection.admit(inner) == ("observed_at_utc", "persisted_at_utc") and
            selection.uri_pins.get("urn:pm:scratch:envelope") == inv.digest(inner))


@check("datetime_unit_resource_selections_refuses_invalid_inventory")
def _sel_invalid_inventory(context):
    _, inv, _, _ = _mods()
    root = context.scratch()
    write(root, inv.INVENTORY, {"schema_id": "wrong"})
    saved = inv.ROOT
    inv.resource_selections.cache_clear()
    try:
        inv.ROOT = root
        reason = _admission_reason(inv.resource_selections)
    finally:
        inv.ROOT = saved
        inv.resource_selections.cache_clear()
    return (reason or "").startswith("datetime_inventory_invalid: ") and "inventory_schema" in reason


@check("datetime_unit_resource_selections_skip_lineage", slow=True)
def _sel_lineage(context):
    _, inv, _, _ = _mods()
    lineage = {r["resource_sha256"] for r in context.inventory()["nodes"]
               if r["classification"] == "source_lineage_schema_patch"}
    selections = inv.resource_selections()
    return bool(lineage) and not lineage & set(selections) and len(selections) > 50


# ---------------------------------------------------------------------------
# E. The static scan over scratch Plans trees.
# ---------------------------------------------------------------------------

DECLARING = {"$schema": D202012, "type": "object",
             "properties": {"observed_at_utc": {"type": "string", "format": "date-time"}}}


def _scan(root):
    _, inv, _, _ = _mods()
    return inv.scan(root)


def _errors(errors, code, detail=None):
    return [e for e in errors if e.get("error") == code and
            (detail is None or str(e.get("detail", "")).startswith(detail))]


def _exclusion(path, body, *, origin="json", reason="Quoted lineage data example", citation=None):
    return {"path": path, "origin": origin, "sha256": hashlib.sha256(body.encode()).hexdigest(),
            "reason": reason, "citation": citation or path}


@check("datetime_unit_scan_finds_declaration")
def _scan_basic(context):
    root = context.scratch()
    write(root, "Plans/a.json", DECLARING)
    rows, errors = _scan(root)
    return (not errors and [(r["path"], r["origin"], r["pointer"], r["fields"]) for r in rows] ==
            [("Plans/a.json", "json", "", ["observed_at_utc"])])


@check("datetime_unit_scan_duplicate_json_key")
def _scan_duplicate_key(context):
    root = context.scratch()
    write(root, "Plans/a.json", '{"properties": {"observed_at_utc": {}, "observed_at_utc": {"type": "string"}}}')
    rows, errors = _scan(root)
    # Duplicate keys never collapse to the last value: the file is unreadable.
    return not rows and [(e["error"], e["origin"]) for e in errors] == [("unreadable_mentioning_container", "file")]


@check("datetime_unit_scan_bad_regex_fails_closed")
def _scan_regex(context):
    root = context.scratch()
    write(root, "Plans/a.json", {"patternProperties": {"(": {}}})
    rows, errors = _scan(root)
    return not rows and bool(_errors(errors, "scan_read_failed", "unreadable field declaration regex"))


@check("datetime_unit_scan_bad_property_names_fails_closed")
def _scan_property_names(context):
    root = context.scratch()
    write(root, "Plans/a.json", {"propertyNames": {"pattern": "("}})
    rows, errors = _scan(root)
    return not rows and bool(_errors(errors, "scan_read_failed", "unreadable propertyNames declaration"))


@check("datetime_unit_scan_property_names_reference_conservative")
def _scan_property_names_ref(context):
    root = context.scratch()
    write(root, "Plans/a.json", {"propertyNames": {"$ref": "#/$defs/never"}, "$defs": {"never": False}})
    rows, errors = _scan(root)
    return not errors and [r["fields"] for r in rows] == [["observed_at_utc", "persisted_at_utc"]]


@check("datetime_unit_scan_symlink_cycle")
def _scan_cycle(context):
    root = context.scratch()
    (root / "Plans/loop").symlink_to(root / "Plans", target_is_directory=True)
    rows, errors = _scan(root)
    return not rows and bool(_errors(errors, "scan_exclusions_invalid", "symlink directory cycle"))


@check("datetime_unit_scan_broken_symlink")
def _scan_broken(context):
    root = context.scratch()
    (root / "Plans/broken.json").symlink_to(root / "Plans/missing.json")
    rows, errors = _scan(root)
    return not rows and bool(_errors(errors, "scan_exclusions_invalid", "unreadable symlink"))


@check("datetime_unit_scan_follows_file_symlink")
def _scan_file_symlink(context):
    root = context.scratch()
    write(root, "Plans/target.txt", json.dumps(DECLARING))
    (root / "Plans/link.schema.json").symlink_to("target.txt")
    rows, errors = _scan(root)
    return not errors and sorted(r["path"] for r in rows) == ["Plans/link.schema.json", "Plans/target.txt"]


def _exclusion_errors(context, exclusions, files=()):
    root = context.scratch(exclusions=exclusions)
    for path, body in files:
        write(root, path, body)
    rows, errors = _scan(root)
    return rows, errors


@check("datetime_unit_scan_exclusion_duplicate")
def _ex_duplicate(context):
    body = json.dumps({"note": "observed_at_utc"})
    entry = _exclusion("Plans/a.json", body)
    rows, errors = _exclusion_errors(context, [entry, entry], [("Plans/a.json", body)])
    return not rows and _errors(errors, "scan_exclusions_invalid", "duplicate scan exclusion") and len(errors) == 1


def _invalid_exclusion(field, value):
    def run(context):
        body = json.dumps({"note": "observed_at_utc"})
        entry = _exclusion("Plans/a.json", body)
        if value is KeyError:
            del entry[field]
        else:
            entry[field] = value
        rows, errors = _exclusion_errors(context, [entry], [("Plans/a.json", body)])
        return not rows and bool(_errors(errors, "scan_exclusions_invalid", "invalid scan exclusion")) and len(errors) == 1
    return run


for _field in ("path", "origin", "sha256", "reason", "citation"):
    check("datetime_unit_scan_exclusion_not_string_" + _field)(_invalid_exclusion(_field, 7))
for _field in ("sha256", "reason", "citation"):
    check("datetime_unit_scan_exclusion_missing_" + _field)(_invalid_exclusion(_field, KeyError))
check("datetime_unit_scan_exclusion_path_blank")(_invalid_exclusion("path", "   "))
check("datetime_unit_scan_exclusion_reason_blank")(_invalid_exclusion("reason", "   "))


@check("datetime_unit_scan_exclusion_loadable_schema_forbidden")
def _ex_loadable(context):
    body = json.dumps(DECLARING)
    rows, errors = _exclusion_errors(context, [_exclusion("Plans/a.json", body)], [("Plans/a.json", body)])
    return not rows and bool(_errors(errors, "scan_exclusions_invalid", "loadable_schema_exclusion_forbidden: Plans/a.json"))


@check("datetime_unit_scan_exclusion_referenced_file_forbidden")
def _ex_referenced(context):
    body = json.dumps({"properties": {"observed_at_utc": {}}})
    files = [("Plans/a.json", body), ("Plans/ref.json", {"$schema": D202012, "$ref": "a.json"})]
    rows, errors = _exclusion_errors(context, [_exclusion("Plans/a.json", body)], files)
    return not rows and bool(_errors(errors, "scan_exclusions_invalid", "loadable_schema_exclusion_forbidden: Plans/a.json"))


@check("datetime_unit_scan_exclusion_purpose_required")
def _ex_purpose(context):
    body = json.dumps({"note": "observed_at_utc"})
    entry = _exclusion("Plans/a.json", body, reason="Claimed instance values")
    rows, errors = _exclusion_errors(context, [entry], [("Plans/a.json", body)])
    return bool(_errors(errors, "scan_exclusions_invalid", "exclusion_non_runtime_purpose_missing: Plans/a.json"))


@check("datetime_unit_scan_exclusion_citation_unreadable")
def _ex_citation(context):
    body = json.dumps({"note": "observed_at_utc"})
    entry = _exclusion("Plans/a.json", body, citation="Plans/a.json#json; Plans/missing.md#x")
    rows, errors = _exclusion_errors(context, [entry], [("Plans/a.json", body)])
    return bool(_errors(errors, "scan_exclusions_invalid", "exclusion_purpose_citation_unreadable: Plans/a.json"))


@check("datetime_unit_scan_exclusion_pins_content")
def _ex_pinned(context):
    old = json.dumps({"note": "observed_at_utc"})
    new = json.dumps({"note": "observed_at_utc", "properties": {"observed_at_utc": {}}})
    rows, errors = _exclusion_errors(context, [_exclusion("Plans/a.json", old)], [("Plans/a.json", new)])
    return ([r["pointer"] for r in rows] == [""] and
            [e["error"] for e in errors] == ["stale_scan_exclusion"])


@check("datetime_unit_scan_exclusion_pins_file_content")
def _ex_pinned_file(context):
    old = "```json\n" + json.dumps({"note": "observed_at_utc"}) + "\n```\n"
    new = "```json\n" + json.dumps({"properties": {"observed_at_utc": {}}}) + "\n```\n"
    entry = _exclusion("Plans/a.md", old, origin="file")
    rows, errors = _exclusion_errors(context, [entry], [("Plans/a.md", new)])
    return ([(r["origin"], r["pointer"]) for r in rows] == [("fence:1", "")] and
            [e["error"] for e in errors] == ["stale_scan_exclusion"])


@check("datetime_unit_scan_exclusion_used_when_pinned")
def _ex_used(context):
    body = json.dumps({"note": "observed_at_utc"})
    md = "```json\n" + body + "\n```\n"
    rows, errors = _exclusion_errors(context, [_exclusion("Plans/a.json", body),
                                               _exclusion("Plans/b.md", md, origin="file")],
                                     [("Plans/a.json", body), ("Plans/b.md", md)])
    return not rows and not errors


@check("datetime_unit_scan_exclusion_pinned_unreadable_changed")
def _ex_unreadable_changed(context):
    old = '{"observed_at_utc": '
    new = '{"observed_at_utc": 1, '
    entry = _exclusion("Plans/a.txt", old, origin="file", reason="Non-JSON code example")
    rows, errors = _exclusion_errors(context, [entry], [("Plans/a.txt", new)])
    return sorted(e["error"] for e in errors) == ["stale_scan_exclusion", "unreadable_mentioning_container"]


@check("datetime_unit_scan_stale_exclusion")
def _ex_stale(context):
    body = json.dumps({"note": "observed_at_utc"})
    entry = _exclusion("Plans/gone.json", body, citation="Plans/a.json")
    rows, errors = _exclusion_errors(context, [entry], [("Plans/a.json", "{}")])
    return [(e["error"], e.get("path")) for e in errors] == [("stale_scan_exclusion", "Plans/gone.json")]


@check("datetime_unit_scan_unreadable_string_container")
def _scan_string(context):
    root = context.scratch()
    write(root, "Plans/a.json", {"schema_json": '{"observed_at_utc": '})
    rows, errors = _scan(root)
    return not rows and sorted((e["error"], e["origin"]) for e in errors) == [
        ("unclassified_mentioning_container", "json"), ("unreadable_schema_string_container", "json:string:/schema_json")]


@check("datetime_unit_scan_serialized_declaration")
def _scan_serialized(context):
    root = context.scratch()
    write(root, "Plans/a.json", {"schema_json": json.dumps(DECLARING)})
    rows, errors = _scan(root)
    return not errors and [(r["origin"], r["pointer"]) for r in rows] == [("json:string:/schema_json", "")]


@check("datetime_unit_scan_unreadable_fence")
def _scan_fence(context):
    root = context.scratch()
    write(root, "Plans/a.md", '```json\n{"observed_at_utc": \n```\n')
    rows, errors = _scan(root)
    return [(e["error"], e["origin"]) for e in errors] == [("unreadable_mentioning_container", "fence:1")]


@check("datetime_unit_scan_unclassified_fence")
def _scan_fence_unclassified(context):
    root = context.scratch()
    write(root, "Plans/a.md", '```json\n{"note": "observed_at_utc"}\n```\n')
    rows, errors = _scan(root)
    return [(e["error"], e["origin"]) for e in errors] == [("unclassified_mentioning_container", "fence:1")]


@check("datetime_unit_scan_unreadable_file")
def _scan_unreadable_file(context):
    root = context.scratch()
    write(root, "Plans/a.txt", '{"observed_at_utc": ')
    rows, errors = _scan(root)
    return [(e["error"], e["origin"]) for e in errors] == [("unreadable_mentioning_container", "file")]


@check("datetime_unit_scan_unclassified_file")
def _scan_unclassified_file(context):
    root = context.scratch()
    write(root, "Plans/a.json", {"note": "observed_at_utc"})
    rows, errors = _scan(root)
    return [(e["error"], e["origin"]) for e in errors] == [("unclassified_mentioning_container", "json")]


@check("datetime_unit_scan_wildcard_without_names")
def _scan_wildcard(context):
    root = context.scratch()
    write(root, "Plans/a.yaml", 'patternProperties: {".*": {type: string}}\n')
    rows, errors = _scan(root)
    return [(e["error"], e["origin"]) for e in errors] == [("unreadable_mentioning_container", "file")]


@check("datetime_unit_scan_escaped_names")
def _scan_escaped(context):
    root = context.scratch()
    write(root, "Plans/a.json", json.dumps(DECLARING).replace("observed_at_utc", "\\u006fbserved_at_utc"))
    rows, errors = _scan(root)
    return not errors and [r["fields"] for r in rows] == [["observed_at_utc"]]


@check("datetime_unit_scan_utf16")
def _scan_utf16(context):
    root = context.scratch()
    write(root, "Plans/a", json.dumps(DECLARING).encode("utf-16"))
    rows, errors = _scan(root)
    return not errors and [r["path"] for r in rows] == ["Plans/a"]


@check("datetime_unit_fences_need_commonmark")
def _fences_parser(context):
    _, inv, _, _ = _mods()
    saved = sys.modules.get("markdown_it", None)
    present = "markdown_it" in sys.modules
    sys.modules["markdown_it"] = None
    try:
        list(inv._markdown_fences("```json\n{}\n```\n"))
    except ValueError as error:
        result = str(error) == "markdown-it-py is required by the datetime inventory gate"
    except Exception:  # noqa: BLE001
        result = False
    else:
        result = False
    finally:
        if present:
            sys.modules["markdown_it"] = saved
        else:
            sys.modules.pop("markdown_it", None)
    return result


# ---------------------------------------------------------------------------
# F. validate_inventory over one-row scratch inventories.
# ---------------------------------------------------------------------------

NAMED = ("Plans/backup_restore_system_contracts.schema.json", "/$defs/backup_health_projection")
STORAGE = ("Plans/event_record.schema.json", "")
AUTOMATIC = (SECTION15, MAP_POINTER)
REVIEWED = (SECTION15, "/$defs/browser_program_result_validation/properties/result_schema_resources")


def _inventory_root(context, rows, files=(), copies=()):
    """A scratch root holding the rows' sources and citations, the inventory schema, battery and roles."""
    _, inv, probe, _ = _mods()
    paths = {r["path"] for r in rows} | {c["path"] for r in rows for c in r["citation"]} | set(copies)
    paths = sorted(p for p in paths if (context.root / p).is_file())
    root = context.scratch(copies=[inv.INVENTORY_SCHEMA, probe.BATTERY, probe.ROLES, *paths])
    for path, body in files:
        write(root, path, body)
    return root


def _inventory(context, rows):
    header = context.inventory()
    return {**{k: header[k] for k in header if k != "nodes"}, "nodes": rows}


def _validate(context, rows, files=(), copies=(), root=None):
    _, inv, _, _ = _mods()
    root = root or _inventory_root(context, rows, files, copies)
    return inv.validate_inventory(_inventory(context, rows), root)


def _codes(errors):
    return {e["error"] for e in errors}


def _validate_case(pick, change, expected, *, exact=False, files=(), copies=()):
    def run(context):
        rows = [context.row(*key) for key in pick]
        change(rows, context)
        errors = _validate(context, rows, files, copies)
        codes = _codes(errors)
        return codes == set(expected) if exact else set(expected) <= codes
    return run


def _no_change(rows, context):
    return None


check("datetime_unit_validate_named_row_clean")(_validate_case([NAMED], _no_change, (), exact=True))
check("datetime_unit_validate_storage_row_clean")(_validate_case([STORAGE], _no_change, (), exact=True))
check("datetime_unit_validate_wildcard_row_clean")(_validate_case([AUTOMATIC], _no_change, (), exact=True))
check("datetime_unit_validate_reviewed_row_clean")(_validate_case([REVIEWED], _no_change, (), exact=True))


@check("datetime_unit_validate_inventory_schema")
def _v_schema(context):
    _, inv, _, _ = _mods()
    root = _inventory_root(context, [])
    errors = inv.validate_inventory({"schema_id": "wrong", "nodes": []}, root)
    return bool(errors) and _codes(errors) == {"inventory_schema"}


def _set(field, value):
    def change(rows, context):
        rows[0][field] = value
    return change


check("datetime_unit_validate_duplicate_node")(_validate_case(
    [NAMED, NAMED], _no_change, ("duplicate_inventory_node",), exact=True))
check("datetime_unit_validate_storage_profile_conflict")(_validate_case(
    [STORAGE], _set("profile", "owner_schema"), ("classification_profile_conflict",)))
check("datetime_unit_validate_cv253_owner_profile_conflict")(_validate_case(
    [NAMED], _set("owner", "Plans/Contracts_V0.md#CV-253"), ("classification_profile_conflict",)))
check("datetime_unit_validate_owner_schema_row_storage_profile")(_validate_case(
    [NAMED], _set("profile", "storage_utc_z"), ("classification_profile_conflict",)))
check("datetime_unit_validate_storage_owner_missing")(_validate_case(
    [STORAGE], _set("owner", "Plans/Contracts_V0.md#CV-1101"), ("storage_owner_missing",)))
check("datetime_unit_validate_owner_empty")(_validate_case([NAMED], _set("owner", "   "), ("owner_empty",)))


def _citation(index, **changes):
    def change(rows, context):
        rows[0]["citation"][index].update(changes)
    return change


def _append_citation(citation):
    def change(rows, context):
        rows[0]["citation"].append(citation)
    return change


check("datetime_unit_validate_citation_value_changed")(_validate_case(
    [STORAGE], _citation(0, value={"type": "string"}), ("classification_citation_changed",), exact=True))
check("datetime_unit_validate_citation_quote_absent")(_validate_case(
    [STORAGE], _append_citation({"path": "Plans/Contracts_V0.md", "quote": "no such owner sentence anywhere"}),
    ("classification_citation_changed",), exact=True))
check("datetime_unit_validate_citation_quote_one_word")(_validate_case(
    [STORAGE], _append_citation({"path": "Plans/Contracts_V0.md", "quote": "Storage-assigned"}),
    ("classification_citation_changed",), exact=True))
check("datetime_unit_validate_citation_quote_two_words")(_validate_case(
    [STORAGE], _append_citation({"path": "Plans/Contracts_V0.md", "quote": "binds Storage-assigned"}), (), exact=True))
check("datetime_unit_validate_citation_unreadable")(_validate_case(
    [STORAGE], _append_citation({"path": "Plans/missing.md", "quote": "two words and more"}),
    ("classification_citation_unreadable",), exact=True))
check("datetime_unit_validate_owner_profile_quote_missing")(_validate_case(
    [STORAGE], _citation(2, quote="Missing zone, space separator, trailing LF"), ("owner_profile_quote_missing",),
    exact=True))
check("datetime_unit_validate_named_classification_conflict")(_validate_case(
    [NAMED], _set("classification", "wildcard_non_timestamp"), ("source_value_classification_conflict",), exact=True))


def _drop_citation(rows, context):
    rows[0]["citation"] = rows[0]["citation"][:1]


check("datetime_unit_validate_named_citation_evidence_changed")(_validate_case(
    [NAMED], _drop_citation, ("owner_field_schema_evidence_changed",), exact=True))


def _value_samples(rows, context):
    rows[0]["value_evidence"]["samples"] += 1


check("datetime_unit_validate_wildcard_evidence_changed")(_validate_case(
    [AUTOMATIC], _value_samples, ("wildcard_value_evidence_changed",), exact=True))


@check("datetime_unit_validate_role_errors_reported")
def _v_role_errors(context):
    _, inv, probe, _ = _mods()
    rows = [context.row(*REVIEWED)]
    root = _inventory_root(context, rows)
    roles = json.loads((root / probe.ROLES).read_text())
    for record in roles:
        if tuple(record["node"]) == inv.node_key(rows[0]):
            record["value_schema_sha256"] = "0" * 64
    write(root, probe.ROLES, roles)
    return "wildcard_role_schema_changed" in _codes(_validate(context, rows, root=root))


def _add_evidence(rows, context):
    rows[0]["value_evidence"] = context.row(*AUTOMATIC)["value_evidence"]


check("datetime_unit_validate_unexpected_value_evidence")(_validate_case(
    [NAMED], _add_evidence, ("unexpected_wildcard_value_evidence",), exact=True))


def _required(rows, context):
    rows[0]["role_evidence"]["required"] = rows[0]["role_evidence"]["required"][:-1]


check("datetime_unit_validate_role_evidence_changed")(_validate_case(
    [NAMED], _required, ("role_evidence_changed",), exact=True))
check("datetime_unit_validate_source_owner_changed")(_validate_case(
    [NAMED], _set("owner", "Another owner"), ("source_owner_changed",), exact=True))
check("datetime_unit_validate_node_changed")(_validate_case(
    [NAMED], _set("node_sha256", "0" * 64), ("inventory_node_changed",), exact=True))
check("datetime_unit_validate_source_unreadable")(_validate_case(
    [NAMED], _set("path", "Plans/missing.schema.json"), ("inventory_source_unreadable",), exact=True))


def _projected_rows(context, root, rows):
    _, inv, _, _ = _mods()
    return inv.source_inventory_projection(_inventory(context, rows), root)["nodes"]


def _scratch_row(path, pointer, *, classification="other_owner_observation", profile="owner_schema", owner=None,
                 resource_pointer=""):
    return {"path": path, "origin": "json", "pointer": pointer, "fields": [], "resource_pointer": resource_pointer,
            "resource_id": None, "resource_sha256": "0" * 64, "node_sha256": "0" * 64, "profile": profile,
            "classification": classification, "owner": owner or path, "citation": [],
            "role_evidence": {"resource_title": None, "schema_identity": None, "required": []}}


@check("datetime_unit_validate_node_outside_resource")
def _v_outside(context):
    doc = {"$defs": {"a": {"title": "A"}, "b": {"properties": {"observed_at_utc": {"type": "string"}}}}}
    root = _inventory_root(context, [], files=[("Plans/s.json", doc)])
    rows = _projected_rows(context, root, [_scratch_row("Plans/s.json", "/$defs/b", owner="A",
                                                          resource_pointer="/$defs/a")])
    return _codes(_validate(context, rows, root=root)) == {"node_outside_resource"}


@check("datetime_unit_validate_conflicting_field_profile")
def _v_conflict(context):
    _, inv, _, _ = _mods()
    storage = context.row(*STORAGE)
    root = _inventory_root(context, [storage])
    write(root, "Plans/copy.schema.json", (root / STORAGE[0]).read_bytes())
    copy_row = dict(copy.deepcopy(storage), path="Plans/copy.schema.json", profile="owner_schema",
                    classification="other_owner_observation", owner=storage["resource_id"])
    return "conflicting_resource_field_profile" in _codes(_validate(context, [storage, copy_row], root=root))


def _storage_like(name, node_extra, pointer="/$defs/e"):
    def run(context):
        doc = {"$defs": {"e": {"title": "E", **node_extra}}}
        if "original_storage_fields" in pointer:
            doc = {"$defs": {"x": {"properties": {"original_storage_fields": doc["$defs"]["e"]}}}}
        root = _inventory_root(context, [], files=[("Plans/s.json", doc)])
        rows = _projected_rows(context, root, [_scratch_row("Plans/s.json", pointer, owner="E")])
        return _codes(_validate(context, rows, root=root)) == {"source_role_classification_conflict"}
    return run


_TS = {"type": "string", "format": "date-time"}
check("datetime_unit_validate_storage_identity_event")(_storage_like("event", {
    "properties": {"schema_id": {"const": "pm.event.v0"}, "observed_at_utc": _TS}}))
check("datetime_unit_validate_storage_identity_index")(_storage_like("index", {
    "properties": {"schema_id": {"const": "pm.storage_value.event_record_index.v2"}, "observed_at_utc": _TS}}))
check("datetime_unit_validate_storage_required_envelope")(_storage_like("envelope", {
    "required": ["event_type", "payload_schema_id", "replay_policy"], "properties": {"observed_at_utc": _TS}}))
check("datetime_unit_validate_storage_required_publication")(_storage_like("publication", {
    "required": ["source_schema_id", "producer_semantic_digest", "publication_locator"],
    "properties": {"observed_at_utc": _TS}}))
check("datetime_unit_validate_storage_required_receipt")(_storage_like("receipt", {
    "required": ["first_append_receipt", "original_event_value_commitment"], "properties": {"observed_at_utc": _TS}}))
check("datetime_unit_validate_storage_original_fields_pointer")(_storage_like(
    "original", {"properties": {"observed_at_utc": _TS}},
    pointer="/$defs/x/properties/original_storage_fields"))


@check("datetime_unit_validate_storage_class_needs_storage_source")
def _v_not_storage(context):
    named = context.row(*NAMED)
    storage = context.row(*STORAGE)
    row = dict(named, profile="storage_utc_z", classification="EventRecord", owner=storage["owner"],
               citation=storage["citation"])
    return "source_role_classification_conflict" in _codes(_validate(context, [row], copies=[STORAGE[0]]))


def _lineage(doc, pointer):
    def run(context):
        root = _inventory_root(context, [], files=[("Plans/s.json", doc)])
        rows = _projected_rows(context, root, [_scratch_row("Plans/s.json", pointer,
                                                              classification="source_lineage_schema_patch")])
        return _codes(_validate(context, rows, root=root)) == {"source_lineage_role_invalid"}
    return run


_PATCH = {"properties": {"observed_at_utc": {"type": "string"}}}
check("datetime_unit_validate_lineage_pointer")(_lineage({"documents": [], "x": _PATCH}, "/x"))
check("datetime_unit_validate_lineage_resource_id")(_lineage(
    {"$id": "urn:pm:lineage", "documents": [{"changes": [{"after": _PATCH}]}]}, "/documents/0/changes/0/after"))


@check("datetime_unit_validate_lineage_clean")
def _v_lineage_clean(context):
    doc = {"documents": [{"changes": [{"before": {}, "after": _PATCH}]}]}
    root = _inventory_root(context, [], files=[("Plans/s.json", doc)])
    rows = _projected_rows(context, root, [_scratch_row("Plans/s.json", "/documents/0/changes/0/after",
                                                          classification="source_lineage_schema_patch")])
    return not _validate(context, rows, root=root) and rows[0]["classification"] == "source_lineage_schema_patch"


# ---------------------------------------------------------------------------
# G. check_inventory and the derived inventory pin.
# ---------------------------------------------------------------------------

def _gate_root(context, rows, files=(), exclusions=()):
    """A scratch tree whose inventory holds rows, pinned by a derived exclusion."""
    _, inv, _, _ = _mods()
    root = _inventory_root(context, rows, files)
    inventory = _inventory(context, rows)
    write(root, inv.INVENTORY, inventory)
    pin = inv.derived_inventory_pin(inventory, root)
    entry = {"path": inv.INVENTORY, "origin": "json", "sha256": pin, "reason": "Quoted inventory evidence data",
             "citation": inv.INVENTORY_SCHEMA}
    write(root, inv.EXCLUSIONS, [entry, *exclusions])
    return root


def _gate(root):
    _, inv, _, _ = _mods()
    return inv.check_inventory(root)


@check("datetime_unit_gate_clean_pass")
def _g_clean(context):
    result = _gate(_gate_root(context, [context.row(*NAMED)]))
    return result["status"] == "pass" and result["nodes"] == 1 and not result["failures"]


@check("datetime_unit_gate_invalid_inventory_fails")
def _g_invalid(context):
    rows = [context.row(*NAMED)]
    rows[0]["owner"] = "   "
    result = _gate(_gate_root(context, rows))
    return result["status"] == "fail" and "owner_empty" in _codes(result["failures"])


@check("datetime_unit_gate_unreadable_inventory_fails")
def _g_unreadable(context):
    _, inv, _, _ = _mods()
    root = _gate_root(context, [context.row(*NAMED)])
    write(root, inv.INVENTORY, "{not json")
    result = _gate(root)
    return result["status"] == "fail" and [f["error"] for f in result["failures"]] == ["inventory_unreadable"]


@check("datetime_unit_gate_reports_scan_errors")
def _g_scan(context):
    root = _gate_root(context, [context.row(*NAMED)], files=[("Plans/a.txt", '{"observed_at_utc": ')])
    result = _gate(root)
    return result["status"] == "fail" and _codes(result["failures"]) == {"unreadable_mentioning_container"}


@check("datetime_unit_gate_unclassified_node")
def _g_unclassified(context):
    root = _gate_root(context, [context.row(*NAMED)], files=[("Plans/new.json", DECLARING)])
    result = _gate(root)
    return (result["status"] == "fail" and _codes(result["failures"]) == {"unclassified_schema_node"} and
            result["unclassified_nodes"] == 1)


@check("datetime_unit_gate_missing_node")
def _g_missing(context):
    body = json.dumps({"x": {"properties": {"observed_at_utc": {"type": "string"}}}})
    root = _inventory_root(context, [], files=[("Plans/data.json", body)])
    rows = _projected_rows(context, root, [_scratch_row("Plans/data.json", "/x", owner="Plans/data.json")])
    exclusion = _exclusion("Plans/data.json", json.dumps(json.loads(body)))
    result = _gate(_gate_root(context, rows, files=[("Plans/data.json", body)], exclusions=[exclusion]))
    return result["status"] == "fail" and _codes(result["failures"]) == {"inventory_node_missing"}


@check("datetime_unit_gate_changed_node")
def _g_changed(context):
    doc = {"$defs": {"title": "D", "a": {"properties": {"observed_at_utc": {"type": "string"}}}}}
    root = _inventory_root(context, [], files=[("Plans/s.json", doc)])
    rows = _projected_rows(context, root, [_scratch_row("Plans/s.json", "/$defs/a", owner="D",
                                                          resource_pointer="/$defs")])
    result = _gate(_gate_root(context, rows, files=[("Plans/s.json", doc)]))
    return (result["status"] == "fail" and _codes(result["failures"]) == {"inventory_node_changed"} and
            {f.get("field") for f in result["failures"]} >= {"resource_pointer"})


@check("datetime_unit_gate_inventory_pin_origin")
def _g_pin_origin(context):
    _, inv, _, _ = _mods()
    root = _gate_root(context, [context.row(*NAMED)])
    entries = json.loads((root / inv.EXCLUSIONS).read_text())
    entries[0]["origin"] = "file"
    write(root, inv.EXCLUSIONS, entries)
    rows, errors = inv.scan(root)
    return bool(_errors(errors, "scan_exclusions_invalid", "inventory_derived_source_pin_changed"))


@check("datetime_unit_gate_inventory_pin_value")
def _g_pin_value(context):
    _, inv, _, _ = _mods()
    root = _gate_root(context, [context.row(*NAMED)])
    entries = json.loads((root / inv.EXCLUSIONS).read_text())
    entries[0]["sha256"] = "0" * 64
    write(root, inv.EXCLUSIONS, entries)
    rows, errors = inv.scan(root)
    return bool(_errors(errors, "scan_exclusions_invalid", "inventory_derived_source_pin_changed"))


@check("datetime_unit_inventory_cli_exit_status")
def _cli(context):
    _, inv, _, _ = _mods()
    code = CODE.get("pm_event_datetime_inventory") or compile(Path(inv.__file__).read_text(), inv.__file__, "exec")
    good = _gate_root(context, [context.row(*NAMED)])
    bad = _gate_root(context, [context.row(*NAMED)], files=[("Plans/new.json", DECLARING)])
    statuses = []
    for root in (good, bad):
        argv = sys.argv
        sys.argv = ["pm_event_datetime_inventory.py", "--root", str(root)]
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                exec(code, {"__name__": "__main__", "__file__": inv.__file__})
        except SystemExit as error:
            statuses.append(error.code)
        else:
            statuses.append("no exit")
        finally:
            sys.argv = argv
    return statuses == [0, 1]


# ---------------------------------------------------------------------------
# H. The value probe: battery, year sweep, closure, deciding, timestamp-only,
#    automatic credit and withholding, over one rewritten map.
# ---------------------------------------------------------------------------

STAMP = {"type": "string", "pattern": r"^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]{1,9})?Z$"}
STAMP_A = {"type": "string", "pattern": r"^(?:[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z|a)$"}
SAFE = {"type": "string", "minLength": 1, "pattern": "^ref:[a-z]+$", "description": "Named reference values."}
GENERIC = {"type": "string", "minLength": 1, "description": "Generic reference string."}
BASIC = {"type": "object", "propertyNames": {"type": "string"}}
REF = {"$ref": "#/$defs/SafeRef"}
# A battery timestamp outside the year sweep (1970-2100).
BATTERY_ONLY = "0000-01-01T23:59:59Z"
VALUE_POINTER = MAP_POINTER + "/additionalProperties"
DEFINITIONS = {
    "SafeRef": SAFE, "Generic": GENERIC,
    "Anchored": {"$dynamicAnchor": "safe_anchor", **SAFE},
    "RecursiveAnchored": {"$recursiveAnchor": True, **SAFE},
    "Year2027": {"type": "string", "format": "date-time", "pattern": "2027-"},
    "BatteryOnly": {"const": BATTERY_ONLY},
    "OnlyA": {"const": "a"},
    "Draft7Safe": {"$schema": D7, **SAFE},
}


def _map_document(context, node, definitions=None, plain=False):
    _, inv, _, _ = _mods()
    document = json.loads((context.root / SECTION15).read_text())
    target = inv.at(document, MAP_POINTER)
    target.clear()
    target.update(copy.deepcopy(node))
    if not plain:
        document["$defs"].update(copy.deepcopy(DEFINITIONS))
    document["$defs"].update(copy.deepcopy(definitions or {}))
    return json.loads(json.dumps(document))  # unshared objects, as read from bytes


def _seeded(context, roles):
    """A fresh probe cache: the committed battery, and the given role records."""
    _, inv, probe, _ = _mods()
    if "battery" not in context.cache:
        context.cache["battery"] = probe.timestamp_battery(context.root, {})
    return {("timestamp_battery",): context.cache["battery"], ("reviewed_wildcard_roles",): dict(roles)}


def probe_map(context, node, definitions=None, cited=None, classification=None, plain=False, **record_extra):
    """(evidence, role, role_errors, classification) for the section15 map rewritten to node.

    With cited, a coherent role record citing that pointer is supplied, its
    fingerprint computed from the same source, as validate_inventory sees it.
    """
    _, inv, probe, _ = _mods()
    document = _map_document(context, node, definitions, plain)
    row = context.row(*AUTOMATIC)
    roles = {}
    if cited is not None or record_extra:
        evidence, _ = probe.wildcard_probe(row, document, context.root, _seeded(context, {}))
        record = {"node": list(inv.node_key(row)), "value_schema_sha256": evidence["value_schema_sha256"],
                  "role": "scratch_role", "reason": "Scratch role review.", **record_extra}
        if cited is not None:
            record["citation"] = {"path": SECTION15, "pointer": cited, "value": inv.at(document, cited)}
        if classification:
            record["classification"] = classification
        roles = {inv.node_key(row): record}
    cache = _seeded(context, roles)
    result, _ = inv.source_owner_evidence(row, document, context.root, cache)
    evidence, sources = probe.wildcard_probe(row, document, context.root, cache)
    role, errors = probe.reviewed_role(row, evidence, sources, context.root, cache)
    return evidence, role, errors, result


def _target(pointer):
    return {"path": SECTION15, "pointer": pointer}


@check("datetime_unit_year_sweep_complete")
def _sweep_complete(context):
    _, _, probe, _ = _mods()
    sweep = probe.year_sweep({})
    return (len(sweep) == 4743 and {int(v[:4]) for v in sweep} == set(range(1970, 2101)) and
            "2027-01-01T00:00:00Z" in sweep and "2016-12-31T23:59:60Z" in sweep)


@contextlib.contextmanager
def _patched(module, name, value):
    saved = getattr(module, name)
    setattr(module, name, value)
    try:
        yield
    finally:
        setattr(module, name, saved)


@check("datetime_unit_year_sweep_missing_year_refused")
def _sweep_missing(context):
    _, _, probe, _ = _mods()
    values = tuple(v for v in probe._year_sweep_values() if not v.startswith("2027-"))
    with _patched(probe, "_year_sweep_values", lambda: values):
        return raised(probe.year_sweep, {}) == ("value_error", "invalid year sweep")


@check("datetime_unit_year_sweep_invalid_value_refused")
def _sweep_invalid(context):
    _, _, probe, _ = _mods()
    values = probe._year_sweep_values() + ("2027-02-30T00:00:00Z",)
    with _patched(probe, "_year_sweep_values", lambda: values):
        return outcome(probe.year_sweep, {}) == ("refuse", "date_time_day")


def _battery_root(context, change):
    _, _, probe, _ = _mods()
    root = context.scratch()
    battery = json.loads((context.root / probe.BATTERY).read_text())
    change(battery)
    write(root, probe.BATTERY, battery)
    return root


@check("datetime_unit_battery_committed")
def _battery_committed(context):
    _, _, probe, _ = _mods()
    battery, fingerprint = probe.timestamp_battery(context.root, {})
    return fingerprint == "a125323b4261c366275d5f732af49b9f4478e6e3f1c992aaffbcdda4e27e63c3" and len(battery["samples"]) == 653


def _battery_case(change, expected):
    def run(context):
        _, _, probe, _ = _mods()
        result = raised(probe.timestamp_battery, _battery_root(context, change), {})
        if expected is None:
            return result[0] == "accept"
        return result == (("refuse" if expected.startswith("date_time_") else "value_error"), expected)
    return run


def _schema_id(battery):
    battery["schema_id"] = "pm.datetime_timestamp_battery.v0"


def _keep(n):
    def change(battery):
        battery["samples"] = battery["samples"][:n]
    return change


def _duplicate(battery):
    battery["samples"][1] = dict(battery["samples"][0])


def _no_features(battery):
    battery["samples"][5]["features"] = []


def _bad_sample(battery):
    battery["samples"][5]["value"] = "2026-02-30T00:00:00Z"


check("datetime_unit_battery_schema_id_refused")(_battery_case(_schema_id, "invalid committed timestamp battery"))
check("datetime_unit_battery_299_refused")(_battery_case(_keep(299), "invalid committed timestamp battery"))
check("datetime_unit_battery_300_accepted")(_battery_case(_keep(300), None))
check("datetime_unit_battery_duplicate_refused")(_battery_case(_duplicate, "invalid committed timestamp battery"))
check("datetime_unit_battery_featureless_refused")(_battery_case(_no_features, "invalid timestamp battery sample"))
check("datetime_unit_battery_invalid_sample_refused")(_battery_case(_bad_sample, "date_time_day"))


def _probe_error(context, document, files=(), roles=None):
    """The ValueError message under a wildcard_probe failure, or None."""
    _, inv, probe, _ = _mods()
    root = context.scratch()
    for path, body in files:
        write(root, path, body)
    row = {"path": "Plans/a.json", "origin": "json", "pointer": "/$defs/m", "resource_pointer": ""}
    cache = _seeded(context, roles or {})
    try:
        probe.wildcard_probe(row, json.loads(json.dumps(document)), root, cache)
    except Exception as error:  # noqa: BLE001
        messages = [str(e) for e in _chain(error) if type(e) is ValueError]
        return messages[0] if messages else "exception:" + type(error).__name__
    return None


def _wildcard(value):
    return {"$schema": D202012, "$id": "https://puppetmaster.local/Plans/a.json",
            "$defs": {"m": {**BASIC, "additionalProperties": value}}}


@check("datetime_unit_probe_resource_uri_conflict")
def _probe_conflict(context):
    other = {"$schema": D202012, "$id": "https://puppetmaster.local/Plans/a.json", "type": "string"}
    message = _probe_error(context, _wildcard({"$ref": "https://puppetmaster.local/Plans/b.json"}),
                           [("Plans/b.json", other)])
    return message == "source resource URI conflict: https://puppetmaster.local/Plans/a.json"


@check("datetime_unit_probe_offline_only")
def _probe_offline(context):
    message = _probe_error(context, _wildcard({"$ref": "https://example.invalid/x.json"}))
    return message == "source reference is not an offline Plans resource: https://example.invalid/x.json"


@check("datetime_unit_probe_offline_no_parent")
def _probe_parent(context):
    uri = "https://puppetmaster.local/Plans/%2E%2E/x.json"
    return _probe_error(context, _wildcard({"$ref": uri})) == "source reference is not an offline Plans resource: " + uri


@check("datetime_unit_probe_offline_plans_reference")
def _probe_plans_ref(context):
    _, inv, probe, _ = _mods()
    root = context.scratch()
    write(root, "Plans/b.json", {"$schema": D202012, "$id": "https://puppetmaster.local/Plans/b.json", **SAFE})
    row = {"path": "Plans/a.json", "origin": "json", "pointer": "/$defs/m", "resource_pointer": ""}
    evidence, citations = probe.wildcard_probe(row, _wildcard({"$ref": "https://puppetmaster.local/Plans/b.json"}),
                                               root, _seeded(context, {}))
    return evidence["all_refused"] and {"path": "Plans/b.json", "pointer": ""} in [
        {k: c[k] for k in ("path", "pointer")} for c in citations]


def _sibling_context(value):
    def run(context):
        _, inv, _, _ = _mods()
        key = ("Plans/a.json", "json", "/$defs/m")
        message = _probe_error(context, _wildcard(SAFE), roles={key: {"sibling_contexts": [value]}})
        return message == "reviewed sibling context must contain only sibling properties"
    return run


check("datetime_unit_probe_sibling_context_names_field")(_sibling_context({"observed_at_utc": "x"}))
check("datetime_unit_probe_sibling_context_not_object")(_sibling_context("kind"))
# T41 data point (the probe's walk over a record's reviewed sibling contexts): every context is checked, not only
# the first; a field name in the second is refused too.
@check("datetime_unit_probe_every_sibling_context_checked")
def _every_sibling_context(context):
    message = _probe_error(context, _wildcard(SAFE), roles={("Plans/a.json", "json", "/$defs/m"): {
        "sibling_contexts": [{"kind": "x"}, {"observed_at_utc": "x"}]}})
    return message == "reviewed sibling context must contain only sibling properties"


@check("datetime_unit_probe_duplicate_role_record")
def _probe_duplicate_role(context):
    _, _, probe, _ = _mods()
    root = context.scratch()
    record = {"node": ["Plans/a.json", "json", "/x"]}
    write(root, probe.ROLES, [record, record])
    return raised(probe._role_records, root, {}) == ("value_error", "duplicate reviewed wildcard role")


# Closure: dialects and dynamic-scope keywords withhold every non-timestamp credit.

def _closure_withheld(node, definitions=None):
    def run(context):
        evidence, _, errors, result = probe_map(context, node, definitions)
        return (evidence["all_refused"] and not evidence["automatic_credit"] and not evidence["deciding_nodes"] and
                not any(a["unproven"] for a in evidence["role_authority"]) and
                errors == (REVIEW,) and result == "wildcard_review_required")
    return run


check("datetime_unit_closure_mixed_dialect_union")(_closure_withheld(
    {**BASIC, "additionalProperties": {"anyOf": [REF, {"$schema": D7, **REF}]}}))
check("datetime_unit_closure_2019_09_value")(_closure_withheld(
    {**BASIC, "additionalProperties": {"$schema": D201909, **REF}}))
check("datetime_unit_closure_draft7_definition")(_closure_withheld(
    {**BASIC, "additionalProperties": {"$ref": "#/$defs/Draft7Safe"}}))
check("datetime_unit_closure_dynamic_anchor")(_closure_withheld(
    {**BASIC, "additionalProperties": {"$ref": "#/$defs/Anchored"}}))
check("datetime_unit_closure_recursive_anchor")(_closure_withheld(
    {**BASIC, "additionalProperties": {"$ref": "#/$defs/RecursiveAnchored"}}))


@check("datetime_unit_closure_static_credits")
def _closure_static(context):
    evidence, role, errors, result = probe_map(context, {**BASIC, "additionalProperties": REF})
    return (evidence["automatic_credit"] and evidence["all_refused"] and
            _target("/$defs/SafeRef") in evidence["deciding_nodes"] and not errors and
            result == "wildcard_non_timestamp")


@check("datetime_unit_closure_unreachable_draft7_ignored")
def _closure_unreachable(context):
    evidence, _, errors, result = probe_map(context, {**BASIC, "additionalProperties": REF},
                                            {"Legacy": {"$schema": D7, "$id": "urn:pm:legacy", **SAFE}})
    return evidence["automatic_credit"] and not errors and result == "wildcard_non_timestamp"


@check("datetime_unit_closure_mixed_dialect_role_refused")
def _closure_role(context):
    evidence, role, errors, _ = probe_map(context, {**BASIC, "additionalProperties": {
        "anyOf": [REF, {"$schema": D7, **REF}]}}, cited="/$defs/SafeRef")
    return role is None and errors == (REVIEW,) and evidence["all_refused"] and not evidence["deciding_nodes"]


@check("datetime_unit_closure_dynamic_role_refused")
def _closure_dynamic_role(context):
    evidence, role, errors, _ = probe_map(context, {**BASIC, "additionalProperties": {"$ref": "#/$defs/Anchored"}},
                                          cited="/$defs/Anchored")
    return role is None and errors == (REVIEW,) and evidence["all_refused"] and not evidence["deciding_nodes"]


# Deciding: a citation decides only if it refuses every battery timestamp, every
# control and every year-sweep timestamp, in a static closure, and is not an
# implicit endpoint.

def _not_deciding(node, cited, definitions=None):
    def run(context):
        evidence, _, _, _ = probe_map(context, node, definitions)
        target = _target(cited)
        return (all(target in a["endpoints"] for a in evidence["role_authority"]) and
                target not in evidence["deciding_nodes"])
    return run


check("datetime_unit_deciding_excludes_battery_timestamp")(_not_deciding(
    {**BASIC, "additionalProperties": {"$ref": "#/$defs/BatteryOnly"}}, "/$defs/BatteryOnly"))
check("datetime_unit_deciding_excludes_control")(_not_deciding(
    {**BASIC, "additionalProperties": {"$ref": "#/$defs/OnlyA"}}, "/$defs/OnlyA"))
check("datetime_unit_deciding_excludes_sweep_year")(_not_deciding(
    {**BASIC, "additionalProperties": {"allOf": [{"$ref": "#/$defs/Year2027"}, {"not": {}}]}}, "/$defs/Year2027"))
check("datetime_unit_deciding_excludes_implicit_true")(_not_deciding(dict(BASIC), MAP_POINTER))
# The map is a value node for persisted_at_utc and the implicit true value for
# observed_at_utc: it refuses every string, but not as that implicit value.
check("datetime_unit_deciding_excludes_implicit_shadowed_by_value_node")(_not_deciding(
    {**BASIC, "allOf": [{"patternProperties": {"^persisted_at_utc$": {"$ref": "#" + MAP_POINTER}}}]}, MAP_POINTER))


@check("datetime_unit_deciding_includes_safe_citation")
def _deciding_safe(context):
    evidence, role, errors, result = probe_map(context, {**BASIC, "additionalProperties": {
        "allOf": [REF, {"not": {"const": "x"}}]}}, cited="/$defs/SafeRef")
    return (_target("/$defs/SafeRef") in evidence["deciding_nodes"] and role is not None and not errors and
            result == "wildcard_non_timestamp_role")


# Timestamp-only evidence: proven nodes that accept a battery timestamp and
# refuse all 16 controls, recorded only when the value accepts a timestamp.

def _timestamp_only(node, expected):
    def run(context):
        evidence, _, _, _ = probe_map(context, node)
        return sorted(n["pointer"] for n in evidence["timestamp_only_nodes"]) == sorted(expected)
    return run


check("datetime_unit_timestamp_only_value")(_timestamp_only({**BASIC, "additionalProperties": STAMP}, [VALUE_POINTER]))
check("datetime_unit_timestamp_only_union_branches")(_timestamp_only(
    {**BASIC, "additionalProperties": {"anyOf": [STAMP, SAFE]}}, [VALUE_POINTER, VALUE_POINTER + "/anyOf/0"]))
check("datetime_unit_timestamp_only_excludes_control_acceptance")(_timestamp_only(
    {**BASIC, "additionalProperties": STAMP_A}, []))
check("datetime_unit_timestamp_only_none_when_all_refused")(_timestamp_only(
    {**BASIC, "additionalProperties": {"allOf": [STAMP, {"maxLength": 5}]}}, []))


# Automatic credit: all refused, static, no sibling dependency, no unproven
# keyword, and the whole map refuses every year-sweep timestamp.

def _automatic_withheld(node, definitions=None, **expected):
    def run(context):
        evidence, _, errors, result = probe_map(context, node, definitions)
        return (not evidence["automatic_credit"] and all(evidence[k] == v for k, v in expected.items()))
    return run


check("datetime_unit_automatic_needs_all_refused")(_automatic_withheld(
    {**BASIC, "additionalProperties": {"$ref": "#/$defs/BatteryOnly"}}, all_refused=False))
check("datetime_unit_automatic_needs_static")(_automatic_withheld(
    {**BASIC, "additionalProperties": {"anyOf": [REF, {"$schema": D7, **REF}]}}, all_refused=True))
check("datetime_unit_automatic_needs_no_dependency")(_automatic_withheld(
    {**BASIC, "required": ["kind"], "additionalProperties": REF}, all_refused=True, singleton_probes_complete=False))
check("datetime_unit_automatic_needs_proven_keywords")(_automatic_withheld(
    {**BASIC, "additionalProperties": {"type": "integer", "not": {"const": 1}}}, all_refused=True))
check("datetime_unit_automatic_needs_sweep_refusal")(_automatic_withheld(
    {**BASIC, "additionalProperties": {"$ref": "#/$defs/Year2027"}}, all_refused=True))


@check("datetime_unit_withhold_records_sibling_dependency")
def _withhold_dependency(context):
    evidence, _, errors, result = probe_map(context, {**BASIC, "minProperties": 2, "additionalProperties": REF})
    return ([d["keyword"] for d in evidence["sibling_dependencies"]] == ["minProperties"] and
            not evidence["singleton_probes_complete"] and errors == (REVIEW,) and result == "wildcard_review_required")


@check("datetime_unit_withhold_records_reviewed_context")
def _withhold_reviewed(context):
    evidence, _, _, _ = probe_map(context, {**BASIC, "additionalProperties": REF}, cited="/$defs/SafeRef",
                                  sibling_contexts=[{"kind": "x"}])
    return ([d["keyword"] for d in evidence["sibling_dependencies"]] == ["reviewed_sibling_context"] and
            not evidence["singleton_probes_complete"])


@check("datetime_unit_withhold_records_map_keyword")
def _withhold_map(context):
    evidence, _, _, _ = probe_map(context, {**BASIC, "if": {"minProperties": 3}, "then": {},
                                            "additionalProperties": REF})
    return all(any(u["keyword"] == "if" and u["scope"] == "map" for u in a["unproven"])
               for a in evidence["role_authority"]) and not evidence["automatic_credit"]


@check("datetime_unit_withhold_records_value_keyword")
def _withhold_value(context):
    evidence, _, _, _ = probe_map(context, {**BASIC, "additionalProperties": {"allOf": [REF, {"not": {"const": "x"}}]}})
    return all([(u["pointer"], u["keyword"], u["scope"]) for u in a["unproven"]] ==
               [(VALUE_POINTER + "/allOf/1", "not", "value")] for a in evidence["role_authority"])


# ---------------------------------------------------------------------------
# I. reviewed_role over explicit evidence.
# ---------------------------------------------------------------------------

_ROLE_ROW = {"path": "Plans/a.json", "origin": "json", "pointer": "/m"}
_CITED = {"path": "Plans/a.json", "pointer": "/d/S"}
_FIELDS = ("observed_at_utc", "persisted_at_utc")


def _evidence(**changes):
    value = {"path": "Plans/a.json", "pointer": "/m/additionalProperties"}
    evidence = {
        "value_schema_sha256": "f" * 64, "singleton_probes_complete": True, "automatic_credit": False,
        "all_refused": True, "results": [{"field": f, "accepted": 0} for f in _FIELDS],
        "value_constraint_paths": [{"field": f, "path": [{"path": "Plans/a.json", "pointer": "/m"}, value,
                                                         dict(_CITED)]} for f in _FIELDS],
        "role_authority": [{"field": f, "endpoints": [value, dict(_CITED)], "unproven": []} for f in _FIELDS],
        "deciding_nodes": [dict(_CITED)]}
    evidence.update(changes)
    return evidence


def _record(**changes):
    record = {"node": ["Plans/a.json", "json", "/m"], "value_schema_sha256": "f" * 64, "role": "scratch",
              "reason": "Scratch review.", "citation": dict(_CITED, value={"type": "string"})}
    record.update(changes)
    return {k: v for k, v in record.items() if v is not KeyError}


def _role_case(record, evidence, expected_role, expected_errors, citations=None):
    def run(context):
        _, inv, probe, _ = _mods()
        cache = {("reviewed_wildcard_roles",): {inv.node_key(_ROLE_ROW): record} if record else {}}
        cites = citations if citations is not None else [dict(_CITED, value={"type": "string"})]
        role, errors = probe.reviewed_role(_ROLE_ROW, evidence, cites, context.root, cache)
        return (role is record if expected_role else role is None) and errors == expected_errors
    return run


def _paths(*paths):
    return [{"field": f, "path": [{"path": "Plans/a.json", "pointer": "/m"}, *p]} for f, p in paths]


_OFF = {"path": "Plans/a.json", "pointer": "/d/Other"}
ROLE_CASES = {
    "no_record_automatic": (None, _evidence(automatic_credit=True), False, ()),
    "no_record_incomplete": (None, _evidence(automatic_credit=True, singleton_probes_complete=False), False, (REVIEW,)),
    "no_record_refused_without_credit": (None, _evidence(), False, (REVIEW,)),
    "no_record_timestamp_value": (None, _evidence(all_refused=False), False, ()),
    "no_record_timestamp_incomplete": (None, _evidence(all_refused=False, singleton_probes_complete=False), False,
                                       (REVIEW,)),
    "stale_fingerprint": (_record(value_schema_sha256="0" * 64), _evidence(), False, ("wildcard_role_schema_changed",)),
    "empty_role": (_record(role="  "), _evidence(), False, (CHANGED, REVIEW)),
    "missing_role": (_record(role=KeyError), _evidence(), False, (CHANGED, REVIEW)),
    "empty_reason": (_record(reason=" "), _evidence(), False, (CHANGED, REVIEW)),
    "foreign_citation": (_record(citation=dict(_OFF, value={"type": "string"})), _evidence(), False, (CHANGED, REVIEW)),
    "citation_value_changed": (_record(citation=dict(_CITED, value={"type": "integer"})), _evidence(), False,
                               (CHANGED, REVIEW)),
    "unknown_classification": (_record(classification="wildcard_non_timestamp"), _evidence(), False, (CHANGED, REVIEW)),
    "timestamp_review_on_value_path": (_record(classification="other_owner_observation"),
                                       _evidence(all_refused=False, deciding_nodes=[]), True, ()),
    "timestamp_review_off_value_path": (_record(classification="other_owner_observation"), _evidence(
        all_refused=False, value_constraint_paths=_paths(("observed_at_utc", [_OFF]), ("persisted_at_utc", [_OFF]))),
        False, (CHANGED, REVIEW)),
    "timestamp_review_one_field_path": (_record(classification="other_owner_observation"), _evidence(
        all_refused=False, value_constraint_paths=_paths(("observed_at_utc", [dict(_CITED)]),
                                                         ("persisted_at_utc", [_OFF]))), False, (CHANGED, REVIEW)),
    "timestamp_review_cited_mid_path": (_record(classification="other_owner_observation"), _evidence(
        all_refused=False, value_constraint_paths=_paths(("observed_at_utc", [dict(_CITED), _OFF]),
                                                         ("persisted_at_utc", [dict(_CITED), _OFF]))),
        False, (CHANGED, REVIEW)),
    "role_not_endpoint_on_path": (_record(), _evidence(role_authority=[
        {"field": f, "endpoints": [_OFF], "unproven": []} for f in _FIELDS]), False, (REVIEW,)),
    "role_not_endpoint_off_path": (_record(), _evidence(
        role_authority=[{"field": f, "endpoints": [_OFF], "unproven": []} for f in _FIELDS],
        value_constraint_paths=_paths(("observed_at_utc", [_OFF]), ("persisted_at_utc", [_OFF]))), False,
        (CHANGED, REVIEW)),
    "role_endpoint_one_field": (_record(), _evidence(role_authority=[
        {"field": "observed_at_utc", "endpoints": [dict(_CITED)], "unproven": []},
        {"field": "persisted_at_utc", "endpoints": [_OFF], "unproven": []}]), False, (REVIEW,)),
    "role_value_accepts_timestamp": (_record(), _evidence(all_refused=False), False, (REVIEW,)),
    "role_citation_not_deciding": (_record(), _evidence(deciding_nodes=[]), False, (REVIEW,)),
    "role_accepted": (_record(), _evidence(), True, ()),
    "role_accepted_explicit_class": (_record(classification="wildcard_non_timestamp_role"), _evidence(), True, ()),
}
for _name, (_rec, _ev, _ok, _errs) in ROLE_CASES.items():
    check("datetime_unit_role_" + _name)(_role_case(_rec, _ev, _ok, _errs))


# ---------------------------------------------------------------------------
# J. Behaviour rules that are not refusals: universe, decoding, evidence,
#    positive paths, closure and classification.
# ---------------------------------------------------------------------------

@check("datetime_unit_scan_follows_directory_symlink")
def _scan_dir_symlink(context):
    root = context.scratch()
    outside = root / "outside"
    write(outside, "x.json", DECLARING)
    (root / "Plans/linked").symlink_to(outside, target_is_directory=True)
    rows, errors = _scan(root)
    return not errors and [r["path"] for r in rows] == ["Plans/linked/x.json"]


@check("datetime_unit_scan_markdown_fence")
def _scan_md_fence(context):
    root = context.scratch()
    write(root, "Plans/a.mdx", "Text.\n\n```json\n" + json.dumps(DECLARING) + "\n```\n")
    rows, errors = _scan(root)
    return not errors and [(r["origin"], r["pointer"]) for r in rows] == [("fence:3", "")]


@check("datetime_unit_scan_inline_code")
def _scan_inline(context):
    root = context.scratch()
    write(root, "Plans/a.md", "Schema: `" + json.dumps(DECLARING) + "` here.\n")
    rows, errors = _scan(root)
    return not errors and [r["origin"] for r in rows] == ["code_inline:1:1"]


@check("datetime_unit_scan_prose_out_of_scope")
def _scan_prose(context):
    root = context.scratch()
    write(root, "Plans/a.md", "Prose naming observed_at_utc and persisted_at_utc, outside any code.\n")
    rows, errors = _scan(root)
    return not rows and not errors


check("datetime_unit_validate_index_row_clean")(_validate_case(
    [("Plans/goal_run_cancelled_consumer_contracts/consumer.schema.json", "/$defs/GenericIndexRow")], _no_change, (),
    exact=True))


@check("datetime_unit_named_evidence_follows_combinators")
def _named_combinators(context):
    _, inv, _, _ = _mods()
    doc = {"$defs": {"t": {"type": "string", "format": "date-time"},
                     "n": {"title": "N", "properties": {"observed_at_utc": {
                         "anyOf": [{"$ref": "#/$defs/t"}, {"type": "null"}], "not": {"const": ""}}}}}}
    root = _inventory_root(context, [], files=[("Plans/s.json", doc)])
    row = _scratch_row("Plans/s.json", "/$defs/n")
    classification, citations = inv.source_owner_evidence(row, json.loads(json.dumps(doc)), root)
    field = "/$defs/n/properties/observed_at_utc"
    return classification == "other_owner_observation" and [c["pointer"] for c in citations] == [
        field, field + "/anyOf/0", "/$defs/t", field + "/anyOf/1", field + "/not"]


@check("datetime_unit_pin_recomputes_classification")
def _pin_classification(context):
    _, inv, _, _ = _mods()
    rows = [context.row(*NAMED)]
    root = _gate_root(context, rows)
    inventory = _inventory(context, rows)
    inventory["nodes"][0]["classification"] = "wildcard_non_timestamp"
    write(root, inv.INVENTORY, inventory)
    entries = json.loads((root / inv.EXCLUSIONS).read_text())
    entries[0]["sha256"] = hashlib.sha256(json.dumps(inventory).encode()).hexdigest()
    write(root, inv.EXCLUSIONS, entries)
    rows_found, errors = inv.scan(root)
    return bool(_errors(errors, "scan_exclusions_invalid", "inventory_derived_source_pin_changed"))


@check("datetime_unit_probe_format_enforced")
def _probe_format(context):
    # Battery strings are all valid, so only a sibling context can show the map
    # validator's format checker: the derived context "timestamp" is no date-time.
    evidence, _, errors, result = probe_map(context, {**BASIC, "required": ["kind"],
                                                      "properties": {"kind": {"format": "date-time"}},
                                                      "additionalProperties": STAMP})
    return (evidence["all_refused"] and [r.get("context") for r in evidence["results"]].count({"kind": "timestamp"}) == 2
            and result == "wildcard_review_required")


@check("datetime_unit_deciding_uses_format_checker")
def _deciding_format(context):
    # Refuses every timestamp only through an asserted format; accepts the control "a".
    evidence, _, _, _ = probe_map(context, {**BASIC, "additionalProperties": {"$ref": "#/$defs/NotDate"}},
                                  {"NotDate": {"type": "string", "not": {"format": "date-time"}}})
    target = _target("/$defs/NotDate")
    return (evidence["all_refused"] and all(target in a["endpoints"] for a in evidence["role_authority"]) and
            target not in evidence["deciding_nodes"])


@check("datetime_unit_probe_sibling_context_probed")
def _probe_context(context):
    evidence, _, errors, result = probe_map(context, {**BASIC, "required": ["kind"],
                                                      "properties": {"kind": {"const": "timestamp"}},
                                                      "additionalProperties": STAMP})
    contexts = [(r["field"], r.get("context"), r["accepted"] > 0) for r in evidence["results"]]
    return (("observed_at_utc", None, False) in contexts and ("observed_at_utc", {"kind": "timestamp"}, True) in contexts
            and not evidence["all_refused"] and result == "wildcard_review_required")


@check("datetime_unit_probe_property_names_forbid_key")
def _probe_property_names(context):
    evidence, _, errors, result = probe_map(context, {"type": "object", "propertyNames": {"pattern": "^x-"},
                                                      "additionalProperties": {"type": "string"}})
    return evidence["all_refused"] and evidence["automatic_credit"] and result == "wildcard_non_timestamp"


@check("datetime_unit_probe_all_refused_every_field")
def _probe_every_field(context):
    evidence, _, errors, result = probe_map(context, {**BASIC, "additionalProperties": REF,
                                                      "patternProperties": {"^persisted": STAMP}})
    accepted = {r["field"]: r["accepted"] for r in evidence["results"]}
    return (accepted["observed_at_utc"] == 0 and accepted["persisted_at_utc"] > 0 and not evidence["all_refused"] and
            result == "other_owner_observation")


@check("datetime_unit_probe_equivalent_spelling_is_timestamp")
def _probe_spelling(context):
    alternate = {"type": "string", "pattern":
                 r"^[0-9][0-9][0-9][0-9]-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]{1,9})?(?:Z)$"}
    evidence, _, errors, result = probe_map(context, {**BASIC, "additionalProperties": alternate})
    return not evidence["all_refused"] and result == "other_owner_observation" and not errors


def _authority(node, cited, *, endpoint=False, unproven=None, definitions=None):
    def run(context):
        evidence, _, _, _ = probe_map(context, node, definitions)
        target = _target(cited)
        ok = all((target in a["endpoints"]) is endpoint for a in evidence["role_authority"])
        if unproven is not None:
            ok = ok and all(any(u["keyword"] == unproven for u in a["unproven"]) for a in evidence["role_authority"])
        return ok
    return run


check("datetime_unit_authority_partial_union_value")(_authority(
    {**BASIC, "additionalProperties": {"anyOf": [REF, {"type": "integer"}]}}, "/$defs/SafeRef"))
check("datetime_unit_authority_every_branch_union_value")(_authority(
    {**BASIC, "additionalProperties": {"oneOf": [REF, {"allOf": [REF, {"maxLength": 9}]}]}}, "/$defs/SafeRef",
    endpoint=True))
check("datetime_unit_authority_partial_union_map")(_authority(
    {**BASIC, "anyOf": [{"additionalProperties": REF}, {"additionalProperties": STAMP}]}, "/$defs/SafeRef"))
check("datetime_unit_authority_every_branch_union_map")(_authority(
    {**BASIC, "anyOf": [{"additionalProperties": REF}, {"additionalProperties": REF}]}, "/$defs/SafeRef",
    endpoint=True))
check("datetime_unit_authority_not_is_not_a_path")(_authority(
    {**BASIC, "additionalProperties": {"not": REF}}, "/$defs/SafeRef", unproven="not"))
check("datetime_unit_authority_then_is_not_a_path")(_authority(
    {**BASIC, "additionalProperties": {"if": {"type": "string"}, "then": REF}}, "/$defs/SafeRef", unproven="if"))
check("datetime_unit_authority_dynamic_ref_not_a_path")(_authority(
    {**BASIC, "additionalProperties": {"$dynamicRef": "#safe_anchor"}}, "/$defs/Anchored", unproven="$dynamicRef"))
check("datetime_unit_authority_if_unproven")(_authority(
    {**BASIC, "additionalProperties": {"allOf": [REF, {"if": {"minLength": 3}, "then": {}}]}}, "/$defs/SafeRef",
    endpoint=True, unproven="if"))
check("datetime_unit_authority_ref_and_allOf_are_paths")(_authority(
    {**BASIC, "additionalProperties": {"allOf": [{"$ref": "#/$defs/Generic"}, REF]}}, "/$defs/SafeRef", endpoint=True))
check("datetime_unit_authority_draft7_ref_siblings_ignored")(_authority(
    {**BASIC, "additionalProperties": {"$schema": D7, "$id": "urn:pm:authority:draft7", "definitions": {
        "g": GENERIC, "s": SAFE, "shape": {"$ref": "#/definitions/g", "allOf": [{"$ref": "#/definitions/s"}]}},
        "allOf": [{"$ref": "#/definitions/shape"}]}}, VALUE_POINTER + "/definitions/s"))
check("datetime_unit_authority_2020_ref_siblings_apply")(_authority(
    {**BASIC, "additionalProperties": {"$ref": "#/$defs/Generic", "allOf": [REF]}}, "/$defs/SafeRef", endpoint=True))


@check("datetime_unit_closure_nested_dialect_inside_draft7")
def _closure_nested(context):
    nested = {"$schema": D7, "$id": "urn:pm:legacy-holder", "definitions": {
        "inner": {"$schema": D202012, **SAFE}}}
    evidence, _, errors, result = probe_map(context, {**BASIC, "additionalProperties": {
        "$ref": "urn:pm:legacy-holder#/definitions/inner"}}, {"Holder": nested})
    return (evidence["all_refused"] and not evidence["automatic_credit"] and errors == (REVIEW,) and
            result == "wildcard_review_required")


@check("datetime_unit_closure_default_dialect_counts")
def _closure_default(context):
    _, inv, probe, _ = _mods()
    document = {"$id": "https://puppetmaster.local/Plans/a.json", "$defs": {"m": {**BASIC, "additionalProperties": SAFE}}}
    row = {"path": "Plans/a.json", "origin": "json", "pointer": "/$defs/m", "resource_pointer": ""}
    evidence, _ = probe.wildcard_probe(row, document, context.scratch(), _seeded(context, {}))
    return evidence["all_refused"] and evidence["automatic_credit"]


def _schema_valid_row(path, pointer, owner, fields=("observed_at_utc",)):
    row = _scratch_row(path, pointer, owner=owner)
    row.update(fields=list(fields), citation=[{"path": path, "pointer": pointer, "value": None}])
    return row


def _named_unreadable(field_schema, detail, extra=None):
    def run(context):
        _, inv, _, _ = _mods()
        node = {"title": "N", "properties": {"observed_at_utc": field_schema}, **(extra or {})}
        root = _inventory_root(context, [], files=[("Plans/s.json", {"$defs": {"n": node}})])
        row = _schema_valid_row("Plans/s.json", "/$defs/n", "N")
        errors = _validate(context, [row], root=root)
        hits = [e for e in errors if e["error"] == "inventory_source_unreadable"]
        return bool(hits) and all(e["detail"] == detail for e in hits)
    return run


check("datetime_unit_named_evidence_offline_only")(_named_unreadable(
    {"$ref": "https://example.invalid/x.json"}, "owner evidence reference is not an offline Plans resource"))
check("datetime_unit_named_evidence_no_parent_path")(_named_unreadable(
    {"$ref": "https://puppetmaster.local/Plans/%2E%2E/x.json"}, "owner evidence reference is not an offline Plans resource"))
check("datetime_unit_named_evidence_pointer_fragment_only")(_named_unreadable(
    {"$ref": "#stamp"}, "owner evidence requires a JSON-pointer reference"))
check("datetime_unit_named_and_wildcard_mixed")(_named_unreadable(
    {"type": "string"}, "mixed named/wildcard owner evidence needs classification",
    {"patternProperties": {"^persisted": {"type": "string"}}}))


@check("datetime_unit_required_only_declaration_unreadable")
def _required_only(context):
    root = _inventory_root(context, [], files=[("Plans/s.json", {"$defs": {"n": {"title": "N", "required": ["observed_at_utc"]}}})])
    row = _schema_valid_row("Plans/s.json", "/$defs/n", "N")
    errors = _validate(context, [row], root=root)
    hits = [e for e in errors if e["error"] == "inventory_source_unreadable"]
    return bool(hits) and all(e["detail"] == "non-named declaration is not a wildcard value map" for e in hits)


@check("datetime_unit_role_stale_when_reference_target_changes")
def _role_target(context):
    _, inv, probe, _ = _mods()
    node = {**BASIC, "additionalProperties": REF}
    first, role, errors, _ = probe_map(context, node, cited="/$defs/SafeRef")
    if role is None or errors:
        return False
    record = role
    changed = dict(SAFE, maxLength=99)
    document = _map_document(context, node, {"SafeRef": changed})
    row = context.row(*AUTOMATIC)
    cache = _seeded(context, {inv.node_key(row): record})
    evidence, sources = probe.wildcard_probe(row, document, context.root, cache)
    role, errors = probe.reviewed_role(row, evidence, sources, context.root, cache)
    return role is None and errors == ("wildcard_role_schema_changed",) and \
        evidence["value_schema_sha256"] != first["value_schema_sha256"]


@check("datetime_unit_committed_role_counts")
def _committed_counts(context):
    _, inv, probe, _ = _mods()
    rows = context.inventory()["nodes"]
    roles = json.loads((context.root / probe.ROLES).read_text())
    classes = [r.get("classification", "wildcard_non_timestamp_role") for r in roles]
    automatic = [r for r in rows if r["classification"] == "wildcard_non_timestamp"]
    return (len(roles) == 18 and classes.count("wildcard_non_timestamp_role") == 8 and
            classes.count("other_owner_observation") == 10 and len(automatic) == 3 and
            all(r["value_evidence"]["automatic_credit"] for r in automatic) and
            all(r["profile"] == "owner_schema" for r in rows if "value_evidence" in r))


# ---------------------------------------------------------------------------
# K. The cycle-11 to cycle-14 replay attacks.
# ---------------------------------------------------------------------------

ATTACKS = "scripts/pm_event_datetime_attacks.json"


def _attack(entry):
    def run(context):
        evidence, role, errors, result = probe_map(context, entry["node"], entry["defs"], cited=entry["cited"],
                                                   classification=entry.get("record_classification"), plain=True)
        got = ("accepted_as_role" if result == "wildcard_non_timestamp_role" and not errors else
               "pass" if not errors else "refused")
        return got == entry["expect"] and ("classification" not in entry or result == entry["classification"])
    return run


for _entry in json.loads((ROOT / ATTACKS).read_text())["attacks"]:
    check("datetime_attack_" + _entry["id"])(_attack(_entry))


def _role_rows(context):
    _, _, probe, _ = _mods()
    return json.loads((context.root / probe.ROLES).read_text())


def _stale_role(index, target=False):
    """Change one committed role row's value (or its cited reference target); the pinned review goes stale."""
    def run(context):
        _, inv, probe, _ = _mods()
        record = _role_rows(context)[index]
        path, origin, pointer = record["node"]
        row = context.row(path, pointer)
        document = inv._source_document(context.root, row, {})
        if target:
            cited = inv.at(document, record["citation"]["pointer"])
            cited["maxLength"] = 16383
        else:
            node = inv.at(document, pointer)
            node["additionalProperties"] = {"allOf": [copy.deepcopy(node.get("additionalProperties", True)),
                                                      {"maxLength": 99}]}
        document = json.loads(json.dumps(document))
        cache = _seeded(context, {inv.node_key(row): record})
        evidence, sources = probe.wildcard_probe(row, document, context.root, cache)
        role, errors = probe.reviewed_role(row, evidence, sources, context.root, cache)
        return role is None and errors == ("wildcard_role_schema_changed",)
    return run


for _index in range(18):
    check("datetime_attack_c12_targeted_stale_role_map_%d" % (_index + 1))(_stale_role(_index))
for _index in (2, 3, 4, 5, 6, 7, 8, 17):
    check("datetime_attack_c12_targeted_stale_role_target_%d" % (_index + 1))(_stale_role(_index, target=True))


SAFE_KEY = ("Plans/shared_integration_runtime_expansion_contracts.schema.json", "/$defs/TargetRefs")
FOREIGN = "Plans/workflow_standard_source_contracts/inputs/Plans/shared_integration_runtime_expansion_contracts.schema.json"


@check("datetime_attack_c12_targeted_foreign_same_name_unrelated")
def _foreign_unrelated(context):
    _, inv, probe, _ = _mods()
    row = context.row(*SAFE_KEY)
    record = copy.deepcopy(next(r for r in _role_rows(context) if tuple(r["node"]) == inv.node_key(row)))
    record["citation"]["path"] = FOREIGN
    record["citation"]["value"] = json.loads((context.root / FOREIGN).read_text())["$defs"]["SafeRef"]
    document = inv._source_document(context.root, row, {})
    cache = _seeded(context, {inv.node_key(row): record})
    evidence, sources = probe.wildcard_probe(row, document, context.root, cache)
    role, errors = probe.reviewed_role(row, evidence, sources, context.root, cache)
    return role is None and errors == (CHANGED, REVIEW)


@check("datetime_attack_c12_targeted_foreign_same_name_key_evidence")
def _foreign_key(context):
    _, inv, probe, _ = _mods()
    row = context.row(*SAFE_KEY)
    record = copy.deepcopy(next(r for r in _role_rows(context) if tuple(r["node"]) == inv.node_key(row)))
    foreign = "Plans/cycle11-foreign-role.schema.json"
    uri = "https://puppetmaster.local/" + foreign
    root = context.scratch(copies=[probe.BATTERY])
    write(root, foreign, {"$schema": D202012, "$id": uri, "$defs": {"SafeRef": record["citation"]["value"]}})
    document = inv._source_document(context.root, row, {})
    node = inv.at(document, SAFE_KEY[1])
    node["additionalProperties"] = copy.deepcopy(STAMP)
    node["propertyNames"] = {"$ref": uri + "#/$defs/SafeRef"}
    document = json.loads(json.dumps(document))
    evidence, _ = probe.wildcard_probe(row, document, root, _seeded(context, {}))
    record.update(value_schema_sha256=evidence["value_schema_sha256"], citation={
        "path": foreign, "pointer": "/$defs/SafeRef", "value": record["citation"]["value"]})
    cache = _seeded(context, {inv.node_key(row): record})
    evidence, sources = probe.wildcard_probe(row, document, root, cache)
    role, errors = probe.reviewed_role(row, evidence, sources, root, cache)
    return role is None and errors == (CHANGED, REVIEW) and not evidence["all_refused"]


@check("datetime_attack_c12_targeted_changed_battery_committed_inventory")
def _changed_battery(context):
    _, inv, probe, _ = _mods()
    rows = [context.row(*AUTOMATIC)]
    root = _inventory_root(context, rows)
    battery = json.loads((root / probe.BATTERY).read_text())
    battery["samples"][0]["value"] = "2026-01-02T03:04:05.987654321012345678Z"
    write(root, probe.BATTERY, battery)
    return _codes(_validate(context, rows, root=root)) == {"wildcard_value_evidence_changed"}


@check("datetime_attack_c14_kept_roles_refuse_every_sweep_timestamp")
def _kept_roles_sweep(context):
    """measure14: each kept role row's map refuses every year-sweep timestamp, at both fields."""
    _, inv, probe, _ = _mods()
    from referencing import Registry, Resource
    from referencing.jsonschema import DRAFT202012
    dt = _mods()[0]
    sweep = probe.year_sweep({})
    kept = [r for r in context.inventory()["nodes"] if r["classification"] == "wildcard_non_timestamp_role"]
    for row in kept:
        document = inv._source_document(context.root, row, {})
        resource = inv.at(document, row["resource_pointer"])
        uri = resource.get("$id") or "https://puppetmaster.local/" + row["path"]
        selector = {"$schema": D202012, "$ref": uri + "#" + row["pointer"][len(row["resource_pointer"]):]}
        registry = Registry().with_resource(uri, Resource.from_contents(resource, default_specification=DRAFT202012))
        cls, registry = dt._closed_datetime_graph(selector, registry)
        validator = cls(selector, registry=registry, format_checker=dt.format_checker())
        if any(validator.is_valid({field: v}) for field in row["fields"] for v in sweep):
            return False
    return len(kept) == 8


# ---------------------------------------------------------------------------
# M. Tool batch 3 (T41): the data the guards read. REVIEW-datetime-fix16-opus
#    survivors DT-01, DT-03, DT-09, DT-13, DT-16, DT-17 and DT-19, each with the
#    input that tells the mutant from the original, and one witness per member
#    of the sibling-dependency keyword set, directly and through a map-scope $ref.
# ---------------------------------------------------------------------------

# IERS Bulletin C72 (Leap_Second.dat, July 2026), copied independently of the
# production table: the 27 insertion days. DT-01 moved the 1997 insertion from
# June 30 to December 31 and every other check still passed.
IERS_C72_INSERTIONS = (
    "1972-06-30", "1972-12-31", "1973-12-31", "1974-12-31", "1975-12-31", "1976-12-31", "1977-12-31",
    "1978-12-31", "1979-12-31", "1981-06-30", "1982-06-30", "1983-06-30", "1985-06-30", "1987-12-31",
    "1989-12-31", "1990-12-31", "1992-06-30", "1993-06-30", "1994-06-30", "1995-12-31", "1997-06-30",
    "1998-12-31", "2005-12-31", "2008-12-31", "2012-06-30", "2015-06-30", "2016-12-31")


@check("datetime_unit_date_time_leap_table_independent_edition")
def _leap_independent(context):
    dt, _, _, _ = _mods()
    insertions = set(IERS_C72_INSERTIONS)
    candidates = ["%04d-%s" % (year, md) for year in range(1972, 2017) for md in ("06-30", "12-31")]
    return (tuple(dt._LEAP_DAYS) == IERS_C72_INSERTIONS and
            all(outcome(dt.date_time, day + "T23:59:60Z") == (("accept", day + "T23:59:60Z") if day in insertions
                                                              else ("refuse", "date_time_leap_second"))
                for day in candidates))


@check("datetime_unit_date_time_leap_second_june_with_offsets")
def _leap_june_offsets(context):
    """DT-03: June leap seconds written with an offset; a day count off by the month length cancels out only
    across December into January."""
    dt, _, _, _ = _mods()
    accept = ("1972-07-01T00:59:60+01:00", "2015-07-01T05:29:60+05:30", "2015-06-30T18:59:60-05:00",
              "1981-07-01T00:00:60+00:01")
    refuse = ("2015-07-01T00:59:60+02:00", "1972-07-01T00:59:60+00:30", "2015-06-30T23:59:60+01:00")
    return (all(outcome(dt.date_time, v) == ("accept", v) for v in accept) and
            all(outcome(dt.date_time, v) == ("refuse", "date_time_leap_second") for v in refuse))


@check("datetime_unit_scan_exclusion_referenced_under_path_free_id")
def _ex_referenced_path_free_id(context):
    """DT-09: the referencing file's $id is not its path, so only the file-path-relative join names b.json."""
    body = json.dumps({"examples": ["observed_at_utc"]})
    a = {"$schema": D202012, "$id": "/other/a.json", "type": "object", "properties": {"x": {"$ref": "b.json"}}}
    rows, errors = _exclusion_errors(context, [_exclusion("Plans/sub/b.json", body)],
                                     [("Plans/sub/b.json", body), ("Plans/sub/a.json", a)])
    return not rows and bool(_errors(errors, "scan_exclusions_invalid", "loadable_schema_exclusion_forbidden: Plans/sub/b.json"))


# DT-13: the Storage quote needs both storage_utc_z and CV-253; each alone is refused.
check("datetime_unit_validate_owner_profile_quote_without_cv253")(_validate_case(
    [STORAGE], _citation(2, quote="persisted_at_utc to the storage_utc_z profile"), ("owner_profile_quote_missing",),
    exact=True))
check("datetime_unit_validate_owner_profile_quote_without_profile")(_validate_case(
    [STORAGE], _citation(2, quote="CV-253 binds Storage-assigned observed_at_utc and persisted_at_utc"),
    ("owner_profile_quote_missing",), exact=True))


# DT-16, DT-17: a map-scope keyword that makes the map's acceptance depend on a sibling is a dependency, directly
# and through a map-scope $ref; the map then requires review and never earns automatic non-timestamp credit.
# One witness per member of the dependency keyword set of the value probe (applicators included).
_SIBLING_KIND = {"properties": {"kind": {"const": "x"}}, "additionalProperties": REF}
MAP_DEPENDENCIES = {
    "required": ["kind"], "dependentRequired": {"kind": ["other"]}, "dependentSchemas": {"kind": {"required": ["other"]}},
    "dependencies": {"kind": ["other"]}, "minProperties": 2, "maxProperties": 3,
    "unevaluatedProperties": REF, "const": {"kind": "x"}, "enum": [{"kind": "x"}],
    "allOf": [_SIBLING_KIND], "anyOf": [{"additionalProperties": REF}, _SIBLING_KIND],
    "oneOf": [{"additionalProperties": REF}, _SIBLING_KIND], "not": {"required": ["kind"]},
    "if": {"required": ["kind"]}, "then": {"required": ["other"]}, "else": {"required": ["other"]}}


def _map_dependency(keyword, through_ref):
    def run(context):
        value = {keyword: copy.deepcopy(MAP_DEPENDENCIES[keyword])}
        if through_ref:
            node = {**BASIC, "additionalProperties": REF, "$ref": "#/$defs/T41MapScope"}
            definitions = {"T41MapScope": {"type": "object", **value}}
        else:
            node, definitions = {**BASIC, "additionalProperties": REF, **value}, None
        evidence, _, errors, result = probe_map(context, node, definitions)
        return (keyword in [d["keyword"] for d in evidence["sibling_dependencies"]] and
                not evidence["singleton_probes_complete"] and not evidence["automatic_credit"] and
                result == "wildcard_review_required")
    return run


for _keyword in MAP_DEPENDENCIES:
    check("datetime_unit_map_dependency_%s_direct" % _keyword)(_map_dependency(_keyword, False))
    check("datetime_unit_map_dependency_%s_through_ref" % _keyword)(_map_dependency(_keyword, True))


@check("datetime_unit_map_one_of_requires_review")
def _map_one_of(context):
    """DT-16 and DT-17 as the review built them: a oneOf of two branches at map scope, directly and through a
    map-scope $ref, one branch fixing a sibling. The real validator accepts a timestamp beside kind y."""
    branches = [{"additionalProperties": {"type": "string"}},
                {"properties": {"kind": {"const": "x"}}, "additionalProperties": {"type": "string"}}]
    direct = {"type": "object", "propertyNames": {"pattern": "^[a-z_]+$"}, "oneOf": branches}
    through = {"type": "object", "propertyNames": {"pattern": "^[a-z_]+$"}, "$ref": "#/$defs/T41OneOf"}
    results = [probe_map(context, direct), probe_map(context, through, {"T41OneOf": {"type": "object", "oneOf": branches}})]
    return all("oneOf" in [d["keyword"] for d in ev["sibling_dependencies"]] and not ev["automatic_credit"] and
               result == "wildcard_review_required" for ev, _, _, result in results)


@check("datetime_unit_selection_verify_every_resource")
def _verify_every_resource(context):
    """DT-19: a classified target in a referenced resource, replaced after construction, is refused; verifying
    only the root resource let a +00:00 Storage timestamp through."""
    from referencing import Registry, Resource
    from referencing.jsonschema import DRAFT202012
    _, inv, _, _ = _mods()
    schema = {"$schema": D202012, "$id": "urn:pm:scratch:t41-resource",
              "$defs": {"Row": {"type": "object", "properties": {"persisted_at_utc": {"type": "string", "format": "date-time"}}}}}
    row = {"path": "Plans/scratch.json", "origin": "json", "pointer": "/$defs/Row", "resource_pointer": "",
           "fields": ["persisted_at_utc"], "profile": "storage_utc_z",
           "node_sha256": inv.digest(schema["$defs"]["Row"]), "resource_sha256": inv.digest(schema)}
    registry = Registry().with_resource(schema["$id"], Resource.from_contents(schema, default_specification=DRAFT202012))
    validator = _bound({"$schema": D202012, "$ref": schema["$id"] + "#/$defs/Row"}, registry,
                       _selection([(schema, {"/$defs/Row": row})]))
    bad = {"persisted_at_utc": "2026-01-01T00:00:00+00:00"}
    before = not validator.is_valid(bad)
    schema["$defs"]["Row"] = {}
    return before and _admission_reason(validator.is_valid, bad) == "datetime_schema_changed_after_admission"


@check("datetime_unit_date_time_leap_second_every_day_with_offsets")
def _leap_every_day_offsets(context):
    """T41 data points (_day_number's year arithmetic): every leap day of the independent edition, written in UTC and
    with offsets that carry it into the next day (and, for December, the next year) or keep it on the same day, is
    accepted; the day before and the day after at the same local times are refused. previous // 401 in place of
    previous // 400 moved a year boundary to 2005/2006 and refused 2006-01-01T00:59:60+01:00, which nothing else read."""
    import datetime as _datetime
    dt, _, _, _ = _mods()
    for leap in IERS_C72_INSERTIONS:
        day = _datetime.date.fromisoformat(leap)
        after, before = day + _datetime.timedelta(days=1), day - _datetime.timedelta(days=1)
        for value, accepted in ((f"{after}T00:59:60+01:00", True), (f"{after}T05:29:60+05:30", True),
                                (f"{leap}T22:59:60-01:00", True), (f"{leap}T23:59:60Z", True),
                                (f"{day}T00:59:60+01:00", False), (f"{after}T22:59:60-01:00", False),
                                (f"{before}T23:59:60Z", False)):
            if outcome(dt.date_time, value) != (("accept", value) if accepted else ("refuse", "date_time_leap_second")):
                return False
    return True


@check("datetime_unit_named_evidence_follows_every_keyword")
def _named_every_keyword(context):
    """T41 data points (_constraint_sources' reference and combinator keywords): a named field whose schema uses each
    of $ref, $dynamicRef, $recursiveRef, allOf, anyOf, oneOf, not, if, then and else cites each subschema, in order."""
    _, inv, _, _ = _mods()
    t = {"type": "string", "format": "date-time"}
    doc = {"$defs": {"t1": dict(t), "t2": dict(t), "t3": dict(t), "n": {"title": "N", "properties": {"observed_at_utc": {
        "$ref": "#/$defs/t1", "$dynamicRef": "#/$defs/t2", "$recursiveRef": "#/$defs/t3",
        "allOf": [{"type": "string"}], "anyOf": [{"minLength": 1}], "oneOf": [{"maxLength": 64}],
        "not": {"const": ""}, "if": {"minLength": 2}, "then": {"maxLength": 40}, "else": {"maxLength": 30}}}}}}
    root = _inventory_root(context, [], files=[("Plans/s.json", doc)])
    row = _scratch_row("Plans/s.json", "/$defs/n")
    classification, citations = inv.source_owner_evidence(row, json.loads(json.dumps(doc)), root)
    field = "/$defs/n/properties/observed_at_utc"
    return classification == "other_owner_observation" and [c["pointer"] for c in citations] == [
        field, "/$defs/t1", "/$defs/t2", "/$defs/t3", field + "/allOf/0", field + "/anyOf/0", field + "/oneOf/0",
        field + "/not", field + "/if", field + "/then", field + "/else"]


# T41 data points (the value probe's ANNOTATIONS and ASSERTIONS tables): each keyword, with an argument that leaves the
# value non-timestamp, on a definition the map's values reach, keeps the map's automatic non-timestamp credit. A keyword
# dropped from its table is an unknown keyword there, which routes the map to review. ($dynamicAnchor and
# $recursiveAnchor are in DYNAMIC, which earns no credit whatever the tables say.)
INERT_KEYWORDS = {
    "$schema": D202012, "$id": "urn:pm:scratch:t41-inert", "$anchor": "t41inert", "$comment": "t41",
    "$vocabulary": {"https://json-schema.org/draft/2020-12/vocab/core": True},
    "$defs": {"T41Unused": {"type": "string"}}, "definitions": {"T41Unused": {"type": "string"}},
    "title": "t", "description": "d", "default": "ref:a", "examples": ["ref:a"], "deprecated": False,
    "readOnly": False, "writeOnly": False, "type": "string", "const": "ref:a", "enum": ["ref:a", "ref:b"],
    "format": "email", "pattern": "^ref:", "minLength": 1, "maxLength": 64, "minimum": 0, "maximum": 10,
    "exclusiveMinimum": 0, "exclusiveMaximum": 10, "multipleOf": 1, "minItems": 0, "maxItems": 5, "uniqueItems": True,
    "minContains": 0, "maxContains": 5, "minProperties": 0, "maxProperties": 5, "required": [],
    "contentEncoding": "base64", "contentMediaType": "text/plain"}


def _inert_keyword(keyword):
    def run(context):
        _, _, probe, _ = _mods()
        if keyword not in (probe.ANNOTATIONS | probe.ASSERTIONS) - probe.DYNAMIC:
            return False
        evidence, _, _, result = probe_map(context, {**BASIC, "additionalProperties": {"$ref": "#/$defs/T41Inert"}},
                                           {"T41Inert": {**SAFE, keyword: copy.deepcopy(INERT_KEYWORDS[keyword])}})
        return evidence["automatic_credit"] and result == "wildcard_non_timestamp"
    return run


for _keyword in INERT_KEYWORDS:
    check("datetime_unit_value_keyword_inert_%s" % _keyword)(_inert_keyword(_keyword))


@check("datetime_unit_value_keyword_tables_covered")
def _inert_tables_covered(context):
    """Every ANNOTATIONS and ASSERTIONS keyword outside DYNAMIC has its inert check above, and no other."""
    _, _, probe, _ = _mods()
    return set(INERT_KEYWORDS) == (probe.ANNOTATIONS | probe.ASSERTIONS) - probe.DYNAMIC


# T41 data points of the inventory: the collections its refusal loops walk, read with two or more items where the
# second one decides (a walk cut to its first item passed the one-item cases), and the collections it builds.

@check("datetime_unit_scan_exclusion_every_entry_checked")
def _ex_every_entry(context):
    body = json.dumps({"note": "observed_at_utc"})
    good, bad = _exclusion("Plans/a.json", body), _exclusion("Plans/b.json", body, reason="   ")
    rows, errors = _exclusion_errors(context, [good, bad], [("Plans/a.json", body), ("Plans/b.json", body)])
    return not rows and bool(_errors(errors, "scan_exclusions_invalid", "invalid scan exclusion")) and len(errors) == 1


@check("datetime_unit_scan_stale_exclusions_every_one")
def _ex_stale_every(context):
    body = json.dumps({"note": "observed_at_utc"})
    entries = [_exclusion("Plans/gone1.json", body, citation="Plans/a.json"),
               _exclusion("Plans/gone2.json", body, citation="Plans/a.json")]
    rows, errors = _exclusion_errors(context, entries, [("Plans/a.json", "{}")])
    return sorted((e["error"], e.get("path")) for e in errors) == [("stale_scan_exclusion", "Plans/gone1.json"),
                                                                  ("stale_scan_exclusion", "Plans/gone2.json")]


@check("datetime_unit_scan_every_jsonl_line")
def _scan_jsonl(context):
    """Every line of a JSON Lines file is a document, named by its own line number."""
    root = context.scratch()
    write(root, "Plans/a.jsonl", json.dumps({"note": "x"}) + "\n" + json.dumps(DECLARING) + "\n")
    rows, errors = _scan(root)
    return not errors and [(r["path"], r["origin"], r["pointer"]) for r in rows] == [("Plans/a.jsonl", "jsonl:2", "")]


@check("datetime_unit_scan_every_pattern_property")
def _scan_patterns(context):
    """Each patternProperties entry is a declaration of its own: the second one is found too."""
    root = context.scratch()
    write(root, "Plans/a.json", {"$schema": D202012, "type": "object", "patternProperties": {
        "^x_": {"type": "string"}, "^observed_": {"type": "string", "format": "date-time"}}})
    rows, errors = _scan(root)
    return not errors and [(r["pointer"], r["fields"]) for r in rows] == [("", ["observed_at_utc"])]


@check("datetime_unit_scan_exclusion_referenced_by_nested_id_forbidden")
def _ex_nested_id(context):
    """A file whose nested $id another schema references is loadable, though it declares no $schema or root $id."""
    body = json.dumps({"$defs": {"x": {"$id": "urn:pm:scratch:t41-nested", "type": "string"}}, "note": "observed_at_utc"})
    files = [("Plans/a.json", body), ("Plans/ref.json", {"$schema": D202012, "$ref": "urn:pm:scratch:t41-nested"})]
    rows, errors = _exclusion_errors(context, [_exclusion("Plans/a.json", body)], files)
    return not rows and bool(_errors(errors, "scan_exclusions_invalid", "loadable_schema_exclusion_forbidden: Plans/a.json"))


@check("datetime_unit_scan_exclusion_markdown_schema_forbidden")
def _ex_markdown_schema(context):
    """A Markdown file whose JSON block declares $schema is a loadable schema: it cannot be excluded."""
    md = "```json\n" + json.dumps({"$schema": D202012, "examples": ["observed_at_utc"]}) + "\n```\n"
    rows, errors = _exclusion_errors(context, [_exclusion("Plans/a.md", md, origin="file")], [("Plans/a.md", md)])
    return not rows and bool(_errors(errors, "scan_exclusions_invalid", "loadable_schema_exclusion_forbidden: Plans/a.md"))


@check("datetime_unit_scan_exclusion_referenced_through_id_base_forbidden")
def _ex_id_base(context):
    """A reference resolved against the referrer's $id base (not its path) names a loadable file too."""
    body = json.dumps({"examples": ["observed_at_utc"]})
    a = {"$schema": D202012, "$id": "https://pm-inventory.invalid/Plans/sub/a.json", "type": "object",
         "properties": {"x": {"$ref": "b.json"}}}
    rows, errors = _exclusion_errors(context, [_exclusion("Plans/sub/b.json", body)],
                                     [("Plans/sub/b.json", body), ("Plans/a.json", a)])
    return not rows and bool(_errors(errors, "scan_exclusions_invalid", "loadable_schema_exclusion_forbidden: Plans/sub/b.json"))


@check("datetime_unit_gate_every_unclassified_node")
def _g_unclassified_every(context):
    root = _gate_root(context, [context.row(*NAMED)], files=[("Plans/new.json", DECLARING), ("Plans/new2.json", DECLARING)])
    result = _gate(root)
    return ([f["error"] for f in result["failures"]] == ["unclassified_schema_node"] * 2 and
            result["unclassified_nodes"] == 2)


@check("datetime_unit_gate_every_missing_node")
def _g_missing_every(context):
    body = json.dumps({"x": {"properties": {"observed_at_utc": {"type": "string"}}},
                       "y": {"properties": {"persisted_at_utc": {"type": "string"}}}})
    root = _inventory_root(context, [], files=[("Plans/data.json", body)])
    rows = _projected_rows(context, root, [_scratch_row("Plans/data.json", "/x", owner="Plans/data.json"),
                                           _scratch_row("Plans/data.json", "/y", owner="Plans/data.json")])
    exclusion = _exclusion("Plans/data.json", json.dumps(json.loads(body)))
    result = _gate(_gate_root(context, rows, files=[("Plans/data.json", body)], exclusions=[exclusion]))
    return [f["error"] for f in result["failures"]] == ["inventory_node_missing"] * 2


@check("datetime_unit_gate_every_changed_node")
def _g_changed_every(context):
    doc = {"$defs": {"title": "D", "a": {"properties": {"observed_at_utc": {"type": "string"}}},
                     "b": {"properties": {"persisted_at_utc": {"type": "string"}}}}}
    root = _inventory_root(context, [], files=[("Plans/s.json", doc)])
    rows = _projected_rows(context, root, [_scratch_row("Plans/s.json", "/$defs/a", owner="D", resource_pointer="/$defs"),
                                           _scratch_row("Plans/s.json", "/$defs/b", owner="D", resource_pointer="/$defs")])
    result = _gate(_gate_root(context, rows, files=[("Plans/s.json", doc)]))
    changed = {tuple(f["node"]) for f in result["failures"] if f["error"] == "inventory_node_changed"}
    return result["status"] == "fail" and len(changed) == 2


@check("datetime_unit_validate_owner_named_by_schema_identity")
def _v_owner_identity(context):
    """An owner named only by the node's schema_id const is its source owner."""
    doc = {"$defs": {"n": {"properties": {"schema_id": {"const": "pm.scratch.t41_owner.v1"},
                                          "observed_at_utc": {"type": "string"}}}}}
    root = _inventory_root(context, [], files=[("Plans/s.json", doc)])
    rows = _projected_rows(context, root, [_scratch_row("Plans/s.json", "/$defs/n", owner="pm.scratch.t41_owner.v1")])
    return not _validate(context, rows, root=root)


# A Storage row whose only quote naming both storage_utc_z and CV-253 is not in the owner text: the quote is refused,
# and it names the profile for nothing, so the profile quote is missing too.
check("datetime_unit_validate_owner_profile_quote_invalid_names_nothing")(_validate_case(
    [STORAGE], _citation(2, quote="storage_utc_z CV-253 t41-not-in-the-owner-text"),
    ("classification_citation_changed", "owner_profile_quote_missing"), exact=True))


@check("datetime_unit_validate_every_role_error_reported")
def _v_every_role_error(context):
    """A reviewed record with an empty role is changed evidence and needs review: both are reported."""
    _, inv, probe, _ = _mods()
    rows = [context.row(*REVIEWED)]
    root = _inventory_root(context, rows)
    roles = json.loads((root / probe.ROLES).read_text())
    for record in roles:
        if tuple(record["node"]) == inv.node_key(rows[0]):
            record["role"] = "  "
    write(root, probe.ROLES, roles)
    return {CHANGED, REVIEW} <= _codes(_validate(context, rows, root=root))


@check("datetime_unit_validate_conflicting_field_profile_every_field")
def _v_conflict_every(context):
    """A copied Storage resource under another profile conflicts on every field the node declares."""
    storage = context.row(*STORAGE)
    root = _inventory_root(context, [storage])
    write(root, "Plans/copy.schema.json", (root / STORAGE[0]).read_bytes())
    copy_row = dict(copy.deepcopy(storage), path="Plans/copy.schema.json", profile="owner_schema",
                    classification="other_owner_observation", owner=storage["resource_id"])
    errors = _validate(context, [storage, copy_row], root=root)
    return len(storage["fields"]) > 1 and sum(e["error"] == "conflicting_resource_field_profile"
                                              for e in errors) == len(storage["fields"])


# T41 data points of the value probe's fixed controls. The year sweep is a committed set of refusal controls; its
# documented forms are written here again, independently of the probe, and the two must agree value for value (a
# changed day, time or fraction formula changed which timestamps a deciding definition must refuse, and no check read
# the values). Each fixed non-timestamp control keeps a definition that accepts it alone from deciding the string.

def _independent_sweep():
    import calendar as _calendar
    zones = ("Z", "z", "+00:00", "-00:00", "+05:30", "-07:45", "+23:59", "-23:59")
    values = []
    for year in range(1970, 2101):
        forms = [(s, z) for s in ("T", "t") for z in zones]
        for i, (sep, zone) in enumerate(forms):
            n = (i + year) % 10
            values.append(f"{year:04d}-{1 + i % 12:02d}-{1 + (7 * i + year) % 28:02d}{sep}{(5 * i + year) % 24:02d}:"
                          f"{(7 * i + year) % 60:02d}:{(13 * i + year) % 60:02d}{('.' + '123456789'[:n]) if n else ''}{zone}")
        for zone in zones:
            values += [f"{year:04d}-01-01T00:00:00{zone}", f"{year:04d}-12-31T23:59:59{zone}"]
        values.append(f"{year:04d}-12-31T23:59:59.999999999Z")
        day = f"{year:04d}-02-{29 if _calendar.isleap(year) else 28}"
        values += [day + "T00:00:00Z", day + "T23:59:59Z", day + "t12:00:00.5+05:30"]
        values += [leap + "T23:59:60Z" for leap in IERS_C72_INSERTIONS if leap.startswith(f"{year:04d}-")]
    return tuple(dict.fromkeys(values))


@check("datetime_unit_year_sweep_independent_edition")
def _sweep_independent(context):
    _, _, probe, _ = _mods()
    return probe.year_sweep({}) == _independent_sweep()


# The fixed non-timestamp controls, copied independently of the probe (FIX11's sixteen).
CONTROLS_EDITION = ("", "a", "1", "x.y.z", "resource-id", "abc123", "2026", "2026-01-01", "12:00:00",
                    "2026-01-01T00:00:00", "2026-01-01 00:00:00Z", "deadbeef", "Plans/x.schema.json",
                    "https://example.invalid/a", "a" * 30, "0" * 30)


def _control_not_deciding(control):
    return _not_deciding({**BASIC, "additionalProperties": {"$ref": "#/$defs/T41OnlyControl"}}, "/$defs/T41OnlyControl",
                         {"T41OnlyControl": {"type": "string", "const": control}})


for _index, _control in enumerate(CONTROLS_EDITION):
    check("datetime_unit_deciding_excludes_control_%02d" % _index)(_control_not_deciding(_control))


@check("datetime_unit_controls_independent_edition")
def _controls_edition(context):
    _, _, probe, _ = _mods()
    return tuple(probe.NON_TIMESTAMP_CONTROLS) == CONTROLS_EDITION


# T41 data points (the value probe's DYNAMIC set): a $dynamicRef or $recursiveRef anywhere in the closure, even off
# the value path (here in a reachable value's $defs), makes the closure dynamic, so the map earns no automatic credit.
# Dropping either from DYNAMIC made that closure static and credited the map.
def _dynamic_off_path(keyword):
    def run(context):
        evidence, _, errors, result = probe_map(context, {**BASIC, "additionalProperties": {
            **REF, "$defs": {"T41Dynamic": {keyword: "#/$defs/SafeRef"}}}})
        return not evidence["automatic_credit"] and errors == (REVIEW,) and result == "wildcard_review_required"
    return run


check("datetime_unit_closure_dynamic_ref_off_path")(_dynamic_off_path("$dynamicRef"))
check("datetime_unit_closure_recursive_ref_off_path")(_dynamic_off_path("$recursiveRef"))


# T41 data points (the value probe's reference walks: discovery's visit and the value paths' constraint_paths each
# follow $ref, $dynamicRef and $recursiveRef): an observation role may cite a definition the map's values reach only
# through a $dynamicRef or a $recursiveRef; the record is accepted. A walk that skipped the keyword lost the citation
# from the sources or the value path, and refused the record.
def _observation_through(keyword):
    def run(context):
        _, role, errors, result = probe_map(context, {**BASIC, "additionalProperties": {keyword: "#/$defs/T41Observed"}},
                                            {"T41Observed": {"type": "string", "format": "date-time"}},
                                            cited="/$defs/T41Observed", classification="other_owner_observation")
        return role is not None and errors == () and result == "other_owner_observation"
    return run


check("datetime_unit_role_observation_cited_through_dynamic_ref")(_observation_through("$dynamicRef"))
check("datetime_unit_role_observation_cited_through_recursive_ref")(_observation_through("$recursiveRef"))


# ---------------------------------------------------------------------------
# L. The gate-bar freshness checks themselves catch what they must.
# ---------------------------------------------------------------------------

def _gate_bar():
    import pm_event_datetime_mutations as gate_bar
    return gate_bar


def _fresh_problems(context, change):
    gate_bar = _gate_bar()
    spec = gate_bar.load_spec(context.root)
    change(spec)
    by_name, _ = gate_bar.freshness(context.root, spec)
    return [p for problems in by_name.values() for p in problems]


@check("datetime_gate_bar_detects_new_site")
def _detect_new_site(context):
    gate_bar = _gate_bar()
    text = gate_bar._sources(context.root)["pm_event_datetime"][0]
    extra = text.replace("    return value\n\n\ndef format_checker",
                         "    if value == \"x\":\n        _refuse(\"date_time_extra\")\n    return value\n\n\ndef format_checker")
    keys = {p["key"] for p in gate_bar.mutation_points(extra, "pm_event_datetime")}
    committed = set(gate_bar.load_spec(context.root)["generated"]["points"])
    return keys - committed == {"site:datetime:date_time:date_time_extra#1"}


@check("datetime_gate_bar_detects_new_data_point")
def _detect_new_data_point(context):
    """T41: the data the guards read are mutation points too, regenerated from the AST like the sites. One more
    leap-table entry and one more module constant table are new points without a committed row, and nothing else."""
    gate_bar = _gate_bar()
    text = gate_bar._sources(context.root)["pm_event_datetime"][0]
    extra = text.replace('    "2015-06-30", "2016-12-31",\n)', '    "2015-06-30", "2016-12-31", "2035-06-30",\n)', 1)
    extra += '\n_T41_EXTRA = frozenset(("a", "b"))\n'
    keys = {p["key"] for p in gate_bar.mutation_points(extra, "pm_event_datetime")}
    committed = set(gate_bar.load_spec(context.root)["generated"]["points"])
    return keys - committed == {"data:table_entry:datetime:<module>:drop_entry _LEAP_DAYS '2035-06-30'#1",
                                "data:table_entry:datetime:<module>:drop_entry _T41_EXTRA 'a'#1",
                                "data:table_entry:datetime:<module>:drop_entry _T41_EXTRA 'b'#1"}


@check("datetime_gate_bar_detects_alias")
def _detect_alias(context):
    gate_bar = _gate_bar()
    text = gate_bar._sources(context.root)["pm_event_datetime_inventory"][0]
    aliased = [text + "\n_deny = DatetimeAdmissionError\n", text.replace("        def fail(reason, **detail):",
               "        add = errors.append\n        def fail(reason, **detail):"),
               text + "\nhandler = getattr(object, 'DatetimeAdmissionError', None)\n"]
    return (not gate_bar.refusal_alias_problems(text, "pm_event_datetime_inventory") and
            all(gate_bar.refusal_alias_problems(t, "pm_event_datetime_inventory") for t in aliased))


@check("datetime_gate_bar_detects_stale_point")
def _detect_stale_point(context):
    def change(spec):
        spec["generated"]["points"]["site:datetime:date_time:gone#1"] = {"survives": "x"}
    return any("stale committed mutation point" in p for p in _fresh_problems(context, change))


@check("datetime_gate_bar_detects_missing_point")
def _detect_missing_point(context):
    def change(spec):
        spec["generated"]["points"].pop("site:datetime:date_time:date_time_day#1")
    return any("new mutation point without a committed entry" in p for p in _fresh_problems(context, change))


@check("datetime_gate_bar_detects_statement_without_row")
def _detect_missing_row(context):
    def change(spec):
        spec["statements"] = [r for r in spec["statements"] if r["id"] != "guide:Shared calls:9.19"]
    return any(p.startswith("owner statement without a row: guide:Shared calls:9.19") for p in _fresh_problems(context, change))


@check("datetime_gate_bar_detects_stale_row")
def _detect_stale_row(context):
    def change(spec):
        row = next(r for r in spec["statements"] if r["id"] == "CV-1101:canonical_text:2.1")
        row["line"] += 1
    problems = _fresh_problems(context, change)
    return (any(p.startswith("stale statement row CV-1101:canonical_text:2.1") for p in problems) and
            any(p.startswith("owner statement without a row: CV-1101:canonical_text:2.1") for p in problems))


@check("datetime_gate_bar_detects_orphan_mutation")
def _detect_orphan(context):
    def change(spec):
        spec["mutations"][0]["rule"] = "no.such-rule"
    return any("names no known rule" in p for p in _fresh_problems(context, change))


@check("datetime_gate_bar_detects_unnamed_rule")
def _detect_unnamed_rule(context):
    def change(spec):
        for row in spec["statements"]:
            row["rules"] = [r for r in row.get("rules", []) if r != "probe.timestamp-only"]
            if "rules" in row and not row["rules"]:
                del row["rules"]
                row["no_mutation"] = "x"
    return any(p == "rule probe.timestamp-only is named by no statement row" for p in _fresh_problems(context, change))


@check("datetime_gate_bar_detects_owner_text_partition")
def _detect_partition(context):
    gate_bar = _gate_bar()
    owner = copy.deepcopy(gate_bar.load_spec(context.root)["owner_text"])
    owner["guide"]["blocks"].pop()
    return any("has no rows for it" in p for p in gate_bar.partition_problems(context.root, owner))


def _owner_pin_problems(context, path, old, new, after=""):
    """The date-time owner statements' problems on a scratch copy of the owner text with one edit (T41 pins): the
    first occurrence of old after the text after."""
    gate_bar = _gate_bar()
    owner = gate_bar.load_spec(context.root)["owner_text"]
    paths = sorted({u["path"] for u in owner["units"]} | {owner["guide"]["path"]})
    root = context.scratch(copies=paths)
    text = (root / path).read_text(encoding="utf-8")
    at = text.find(old, text.find(after))
    if at < 0:
        return ["edit text not found: " + old[:60]]
    (root / path).write_text(text[:at] + new + text[at + len(old):], encoding="utf-8")
    return gate_bar.owner_statements(root, owner)[1]


@check("datetime_gate_bar_detects_per_lane_sentence_edit")
def _detect_per_lane(context):
    """T41 (REVIEW-datetime-fix16-opus finding 9): the reviewer's rewrite of the per-lane CV-1101 sentence."""
    problems = _owner_pin_problems(context, "reports/event-authority-20261105/NUMRULE-ADOPTION.md",
                                   "Enforce CV-1101 with `datetime_validator`/`date_time` at this lane’s envelope and timestamp-source boundaries",
                                   "Enforce CV-1101 with a local regex at this lane’s envelope boundaries")
    return any(p.startswith("guide section 'Per-lane replacements' changed") for p in problems)


@check("datetime_gate_bar_detects_unselected_cv1101_field_edit")
def _detect_cv1101_unselected(context):
    """T41 (finding 9): an edit to CV-1101's validation_surfaces, outside the selected fields."""
    text = (context.root / "Plans/Contracts_V0.md").read_text(encoding="utf-8")
    start = text.index("### CV-1101 - ")
    line = next(l for l in text[start:].split("\n") if l.startswith("validation_surfaces:"))
    problems = _owner_pin_problems(context, "Plans/Contracts_V0.md", line, line + " # any regex accepted",
                                   after="### CV-1101 - ")
    return any("CV-1101: the unit section outside its selected fields changed" in p for p in problems)


@check("datetime_gate_bar_owner_pins_quiet_without_edit")
def _detect_pins_quiet(context):
    return not [p for p in _owner_pin_problems(context, "Plans/Contracts_V0.md", "### CV-1101 - ", "### CV-1101 - ")
                if "changed" in p]
