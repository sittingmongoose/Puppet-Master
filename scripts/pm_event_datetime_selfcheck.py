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


def _str_enum_member(text):
    """A stdlib StrEnum member equal to text: a string to JSON Schema, but not exactly a str."""
    import enum
    return enum.StrEnum("HostTimestamp", {"VALUE": text}).VALUE


# Sol max gate finding 1 (REAL): host string-like values JSON Schema treats as strings.
HOST_STRINGS = {"str_subclass": StrSub, "str_enum": _str_enum_member}


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
    # T71 (REVIEW-numrule-tb3-opus finding 4, DT03): an Arabic-Indic digit in every other numeric field; RFC 3339 DIGIT
    # is ASCII, and the predicate's [0-9] classes and re.ASCII protect each field, not only the year and the seconds
    ("unicode_digit_month", "2026-0\u0661-01T00:00:00Z", E, "date_time_syntax"),
    ("unicode_digit_day", "2026-01-0\u0661T00:00:00Z", E, "date_time_syntax"),
    ("unicode_digit_hour", "2026-01-01T\u0661\u0662:00:00Z", E, "date_time_syntax"),
    ("unicode_digit_minute", "2026-01-01T00:0\u0661:00Z", E, "date_time_syntax"),
    ("unicode_digit_second", "2026-01-01T00:00:0\u0661Z", E, "date_time_syntax"),
    ("unicode_digit_fraction", "2026-01-01T00:00:00.\u0661Z", E, "date_time_syntax"),
    ("unicode_digit_offset_hour", "2026-01-01T00:00:00+0\u0661:00", E, "date_time_syntax"),
    ("unicode_digit_offset_minute", "2026-01-01T00:00:00+01:0\u0661", E, "date_time_syntax"),
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


@check("datetime_unit_format_checker_str_subclass_runs_predicate")
def _fc_str_subclass(context):
    # Sol max gate finding 1 (REAL): a str subclass or StrEnum member is a string to JSON Schema, so the checker runs
    # the predicate on it, which refuses it (date_time_type) under every profile; it never passes as a non-string.
    from jsonschema import FormatError
    dt, _, _, m = _mods()
    reasons = []
    for profile in (E, S):
        checker = dt.format_checker(profile=profile)
        for make in HOST_STRINGS.values():
            for text in ("2026-01-01T00:00:00Z", "not-a-dateZ"):
                try:
                    checker.check(make(text), "date-time")
                except FormatError as error:
                    reasons.append(error.cause.reason if isinstance(error.cause, m.Refusal) else None)
                else:
                    reasons.append(None)
    return reasons == ["date_time_type"] * 8 and dt.format_checker().conforms("2026-01-01T00:00:00Z", "date-time")


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
    return dt._bind(base, schema, registry, selection, profile)


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


def _eventrecord_host_string(field, kind):
    """Sol max gate finding 1 (REAL): datetime_validator over the complete committed EventRecord schema refuses a host
    string-like value (HOST_STRINGS[kind]) at field, the malformed text and base_event's own valid text alike: every
    error is a format error at that field whose cause is date_time_type. The unchanged base_event stays valid, and the
    JSON round trip of the malformed value, a plain str, is still refused by its syntax."""
    def run(context):
        dt, _, _, m = _mods()
        schema = json.loads((context.root / "Plans/event_record.schema.json").read_text())
        event = json.loads((context.root / "Plans/seglog_frame_v2_wire_fixtures.json").read_text())["base_event"]
        validator = dt.datetime_validator(schema)

        def errors(instance):
            return sorted({(e.validator, tuple(e.absolute_path),
                            e.cause.reason if isinstance(e.cause, m.Refusal) else None)
                           for e in validator.iter_errors(instance)})
        if errors(event) != []:
            return False
        make = HOST_STRINGS[kind]
        for text in ("not-a-dateZ", event[field]):
            value = make(text)
            if type(value) is str or not isinstance(value, str) or value != text:
                return False
            if errors(dict(event, **{field: value})) != [("format", (field,), "date_time_type")]:
                return False
        plain = json.loads(json.dumps(dict(event, **{field: make("not-a-dateZ")})))
        return type(plain[field]) is str and errors(plain) == [("format", (field,), "date_time_syntax")]
    return run


for _field in ("occurred_at_utc", "observed_at_utc", "persisted_at_utc"):
    for _kind in HOST_STRINGS:
        check("datetime_validator_real_eventrecord_%s_%s_refused" % (_field, _kind), slow=True)(
            _eventrecord_host_string(_field, _kind))


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


@check("datetime_unit_date_time_precedence_leap_second_before_utc_z")
def _precedence_leap_utc(context):
    """T102 (TOOLBATCH4 pre-check B-DT12, owner-equivalent): a leap second that is also not UTC-Z, under storage_utc_z,
    refuses date_time_leap_second. CV-1101 names no precedence for two defects; the current one is pinned."""
    dt, _, _, _ = _mods()
    return outcome(dt.date_time, "2016-12-31T23:59:60+01:00", profile="storage_utc_z") == ("refuse", "date_time_leap_second")


@check("datetime_unit_date_time_precedence_profile_before_type")
def _precedence_profile_type(context):
    """T102 (B-DT13, owner-equivalent): a non-string value with an unknown profile refuses date_time_profile. CV-1101
    names no precedence between the two; the current one is pinned."""
    dt, _, _, _ = _mods()
    return outcome(dt.date_time, 1, profile="utc") == ("refuse", "date_time_profile")


@check("datetime_unit_selection_install_anonymous_after_its_wrapper")
def _sel_anonymous_after_wrapper(context):
    """T102 (TOOLBATCH4 pre-check B-DT11): a dictionary first seen inside a wrapper, later loaded as its own complete,
    anonymous resource (no $id, no $schema), is registered then: admit() gives its two Storage fields."""
    inner = _storage_schema()
    del inner["$id"], inner["$schema"]
    outer = {"$defs": {"inner": inner}}
    selection = _selection([(inner, {"": _storage_row(inner)})])
    selection.install(outer)
    selection.install(inner)
    return selection.admit(inner) == ("observed_at_utc", "persisted_at_utc")


@check("datetime_unit_selection_anonymous_after_its_wrapper_changed")
def _sel_anonymous_after_wrapper_changed(context):
    """T102 (B-DT11, the sibling): the same resource changed after admission is refused by verify_resources()."""
    inner = _storage_schema()
    del inner["$id"], inner["$schema"]
    outer = {"$defs": {"inner": inner}}
    selection = _selection([(inner, {"": _storage_row(inner)})])
    selection.install(outer)
    selection.install(inner)
    admitted = selection.admit(inner) == ("observed_at_utc", "persisted_at_utc")
    inner["properties"]["observed_at_utc"]["format"] = "date"
    return admitted and _admission_reason(selection.verify_resources) == "datetime_schema_changed_after_admission"


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
# T71 (regex family): a lineage patch is the whole before or after value of a change, never a node below it (the
# pointer test's fullmatch made match accepts /documents/0/changes/0/after/x)
check("datetime_unit_validate_lineage_pointer_below_patch")(_lineage(
    {"documents": [{"changes": [{"after": {"x": _PATCH}}]}]}, "/documents/0/changes/0/after/x"))


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
# T71 (REVIEW-numrule-tb3-opus finding 2, DT13, and the regex family): a patternProperties regex is unanchored, so a
# suffix pattern selects observed_at_utc and persisted_at_utc in the value probe too: it reaches its value's endpoints
# (_PositivePaths._map) and lies on each field's value path (wildcard_probe.constraint_paths). Either search made match
# selects nothing.
check("datetime_unit_authority_unanchored_pattern_value")(_authority(
    {**BASIC, "patternProperties": {"_at_utc$": REF}}, "/$defs/SafeRef", endpoint=True))


@check("datetime_unit_value_path_unanchored_pattern")
def _value_path_unanchored(context):
    evidence, _, _, _ = probe_map(context, {**BASIC, "patternProperties": {"_at_utc$": REF}})
    target = _target("/$defs/SafeRef")
    return all(any(p["field"] == field and p["path"][-1] == target for p in evidence["value_constraint_paths"])
               for field in ("observed_at_utc", "persisted_at_utc"))


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


def _ex_dot_segments(referrer_path, ref, target):
    """T102 (TOOLBATCH4 pre-check B-DT19, fail-open): a $ref whose target path holds dot segments the URL join does not
    resolve (%2E%2E/, ./, a doubled slash) still names its target, which an exclusion may not hide."""
    def run(context):
        body = json.dumps({"properties": {"observed_at_utc": {}}})
        files = [(target, body), (referrer_path, {"$schema": D202012, "$ref": ref})]
        rows, errors = _exclusion_errors(context, [_exclusion(target, body)], files)
        return not rows and bool(_errors(errors, "scan_exclusions_invalid", "loadable_schema_exclusion_forbidden: " + target))
    return run


check("datetime_unit_scan_exclusion_referenced_through_encoded_dot_dot")(_ex_dot_segments("Plans/a/ref.json", "%2E%2E/copy.json", "Plans/copy.json"))
check("datetime_unit_scan_exclusion_referenced_through_dot")(_ex_dot_segments("Plans/ref.json", "./copy.json", "Plans/copy.json"))
check("datetime_unit_scan_exclusion_referenced_through_doubled_slash")(_ex_dot_segments("Plans/ref.json", "sub//copy.json", "Plans/sub/copy.json"))


SPELLED = {"$schema": D202012, "type": "object", "properties": {"observed_at_utc": {"type": "string", "format": "date-time"}}}


@check("datetime_unit_scan_origin_spellings")
def _scan_origin_spellings(context):
    """T102 (TOOLBATCH4 pre-check B-DT15): the exact origin of each container kind, which keys inventory rows and
    exclusions: a fence (fence:N), indented code (code:N), inline code (code_inline:N:i), a fence in a list item, an
    HTML block (html:N, unreadable here), a JSONL line (jsonl:N) and a schema two serialized strings deep
    (json:string:/a:string:/b). A respelling ('code_block:N') passed the whole replay; only the committed code:11
    exclusions noticed it, under --scope all."""
    one = json.dumps(SPELLED)
    md = ("Prose.\n\n```json\n" + one + "\n```\n\nMore.\n\n    " + one + "\n\nInline `" + one + "` here.\n\n<div>\n" + one +
          "\n</div>\n\n- item\n\n  ```json\n  " + one + "\n  ```\n")
    root = context.scratch()
    write(root, "Plans/doc.md", md)
    write(root, "Plans/lines.jsonl", '{"a": 1}\n' + one + "\n")
    write(root, "Plans/nest.json", {"wrapper": json.dumps({"schema_json": one})})
    rows, errors = _scan(root)
    return (sorted((r["path"], r["origin"]) for r in rows) == [
                ("Plans/doc.md", "code:9"), ("Plans/doc.md", "code_inline:11:1"), ("Plans/doc.md", "fence:19"), ("Plans/doc.md", "fence:3"),
                ("Plans/lines.jsonl", "jsonl:2"), ("Plans/nest.json", "json:string:/wrapper:string:/schema_json")] and
            [(e.get("error"), e.get("path"), e.get("origin")) for e in errors] == [("unreadable_mentioning_container", "Plans/doc.md", "html:13")])


@check("datetime_unit_scan_exclusion_at_each_origin_used")
def _scan_exclusion_each_origin(context):
    """T102 (B-DT15): an exclusion at each container kind's exact origin is used, so the scan finds nothing and
    reports no stale exclusion: indented code (code:3), an HTML block (html:3) and inline code (code_inline:3:1)."""
    note = json.dumps({"note": "observed_at_utc"})
    md = "Prose.\n\n    " + note + "\n\nSee.\n"
    html = "Prose.\n\n<div>\n" + note + "\n</div>\n"
    inline = "Prose.\n\nInline `" + note + "` here.\n"
    entries = [_exclusion("Plans/a.md", note + "\n", origin="code:3"), _exclusion("Plans/b.md", "<div>\n" + note + "\n</div>\n", origin="html:3"),
               _exclusion("Plans/c.md", note, origin="code_inline:3:1")]
    rows, errors = _exclusion_errors(context, entries, [("Plans/a.md", md), ("Plans/b.md", html), ("Plans/c.md", inline)])
    return not rows and not errors


@check("datetime_unit_source_document_two_strings_deep")
def _source_two_strings(context):
    """T102 (TOOLBATCH4 pre-check B-DT20): a row two serialized strings deep is read back to its schema; a one-level split
    of the origin made every such row unreadable (inventory_source_unreadable)."""
    _, inv, _, _ = _mods()
    one = json.dumps(SPELLED)
    root = context.scratch()
    write(root, "Plans/nest.json", {"wrapper": json.dumps({"schema_json": one})})
    rows, errors = _scan(root)
    row = next((r for r in rows if r["origin"] == "json:string:/wrapper:string:/schema_json"), None)
    return row is not None and not errors and inv._source_document(root, row, {}) == SPELLED


@check("datetime_unit_scan_decode_two_byte_order_marks")
def _scan_two_boms(context):
    """T102 (TOOLBATCH4 pre-check B-DT18): a file whose UTF-8 text starts with a second U+FEFF after the BOM the codec
    consumes is read as its JSON; the choice is pinned here (decode_text strips every leading U+FEFF)."""
    _, inv, _, _ = _mods()
    data = b"\xef\xbb\xbf\xef\xbb\xbf" + json.dumps(SPELLED).encode()
    root = context.scratch()
    write(root, "Plans/bom.json", data)
    rows, errors = _scan(root)
    return (json.loads(inv.decode_text(data)) == SPELLED and not errors and
            [(r["path"], r["origin"]) for r in rows] == [("Plans/bom.json", "json")])


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


# T71 (REVIEW-numrule-tb3-opus finding 3, DT12): every declaration form the admission regression checks list
# (pm_event_datetime_admission_checks.regression_checks) is also a scan self-check: one $schema file declaring it, which
# the scan must find as one row naming exactly the fields it declares
SCAN_DECLARATION_FORMS = {
    "properties": ({"properties": {"observed_at_utc": {}}}, ["observed_at_utc"]),
    "patternProperties": ({"patternProperties": {"observed.*": {}}}, ["observed_at_utc"]),
    "required": ({"required": ["observed_at_utc"]}, ["observed_at_utc"]),
    "dependentRequired_key": ({"dependentRequired": {"observed_at_utc": ["x"]}}, ["observed_at_utc"]),
    "dependentRequired_value": ({"dependentRequired": {"x": ["persisted_at_utc"]}}, ["persisted_at_utc"]),
    "dependentSchemas": ({"dependentSchemas": {"observed_at_utc": {}}}, ["observed_at_utc"]),
    "propertyNames": ({"propertyNames": {"pattern": "^observed_at_utc$"}}, ["observed_at_utc"]),
    "const": ({"const": "observed_at_utc"}, ["observed_at_utc"]),
    "const_object": ({"const": {"observed_at_utc": "value"}}, ["observed_at_utc"]),
    "enum_object": ({"enum": [{"persisted_at_utc": "value"}]}, ["persisted_at_utc"]),
    "propertyNames_true": ({"propertyNames": True}, ["observed_at_utc", "persisted_at_utc"]),
    "enum": ({"enum": ["persisted_at_utc"]}, ["persisted_at_utc"]),
}


def _declaration_form_check(form):
    declaration, fields = SCAN_DECLARATION_FORMS[form]
    def run(context):
        root = context.scratch()
        write(root, "Plans/a.json", {"$schema": D202012, **declaration})
        rows, errors = _scan(root)
        return not errors and [(r["pointer"], sorted(r["fields"])) for r in rows] == [("", fields)]
    run.__doc__ = "DT12: a $schema file declaring the field(s) by %s is one scan row with exactly them." % form
    return run


for _form in SCAN_DECLARATION_FORMS:
    check("datetime_unit_scan_declaration_form_" + _form)(_declaration_form_check(_form))


# T71 (REVIEW-numrule-tb3-opus finding 2, DT13): a patternProperties regex is unanchored in JSON Schema; a suffix or an
# infix pattern declares every field it matches anywhere, in the scan and in runtime admission (re.match found none)
UNANCHORED_PATTERNS = {
    "suffix": ("_at_utc$", ["observed_at_utc", "persisted_at_utc"]),
    "infix": ("at_utc", ["observed_at_utc", "persisted_at_utc"]),
    "lookbehind": ("(?<=observed)_at_utc", ["observed_at_utc"]),
}


def _unanchored_scan_check(name):
    pattern, fields = UNANCHORED_PATTERNS[name]
    def run(context):
        root = context.scratch()
        write(root, "Plans/a.json", {"$schema": D202012, "type": "object", "patternProperties": {pattern: {"type": "string"}}})
        rows, errors = _scan(root)
        return not errors and [(r["pointer"], sorted(r["fields"])) for r in rows] == [("", fields)]
    run.__doc__ = "DT13: patternProperties %r declares %s in the scan." % (pattern, fields)
    return run


def _unanchored_admission_check(name):
    pattern, _ = UNANCHORED_PATTERNS[name]
    def run(context):
        dt, _, _, _ = _mods()
        schema = {"$schema": D202012, "type": "object", "patternProperties": {pattern: {"type": "string"}}}
        return _admission_reason(lambda: dt.datetime_validator(schema).is_valid({})) == "datetime_schema_unclassified"
    run.__doc__ = "DT13: an unclassified patternProperties %r refuses admission (datetime_schema_unclassified)." % pattern
    return run


for _name in UNANCHORED_PATTERNS:
    check("datetime_unit_scan_unanchored_pattern_" + _name)(_unanchored_scan_check(_name))
    check("datetime_admission_unanchored_pattern_" + _name)(_unanchored_admission_check(_name))


@check("datetime_unit_scan_list_marker_needs_a_space")
def _list_marker_space(context):
    """T71 (regex family): a CommonMark list marker is followed by a space or a tab, so a line '-```' is paragraph text,
    not a list item holding a fence; the supplementary fence scan must not open a span there and swallow the real fence
    after it (_LIST_MARKER's [ \\t]+ widened to [ \\t]* refuses this clean file as an unreadable container)."""
    root = context.scratch()
    write(root, "Plans/a.md", "-```\nnot json\n\n```json\n" + json.dumps(DECLARING) + "\n```\n")
    rows, errors = _scan(root)
    return len(rows) == 1 and not errors

@check("datetime_unit_scan_supplementary_closer_has_no_info_string")
def _supplementary_closer(context):
    """T71 (regex family): a closing fence has nothing after its backticks but spaces (CommonMark), so inside a
    supplementary span a '```json' line is body, the span runs on to the real closer and, holding a field name it
    cannot read, refuses the file. The closer test's fullmatch made match closes the span early and accepts it."""
    root = context.scratch()
    write(root, "Plans/a.md", '<div>\n```json\n{"a": 1}\n```json\n</div>\n\n```json\n' + json.dumps(DECLARING) + "\n```\n")
    rows, errors = _scan(root)
    return len(rows) == 1 and [e.get("error") for e in errors] == ["unreadable_mentioning_container"]

# T71 (the regex and loop-member families of tool batch 4): _exclusion_schema_paths reads a file only when its bytes hold
# one of its tokens, so each token needs a referrer that holds that token and no other; otherwise dropping it from the
# fast path survives, because every earlier referrer also declared $schema.
EXCLUSION_REFERRERS = {
    "ref": json.dumps({"$ref": "a.json"}).encode(),
    "dynamic_ref": json.dumps({"$dynamicRef": "a.json"}).encode(),
    "recursive_ref": json.dumps({"$recursiveRef": "a.json"}).encode(),
    "escaped_ref": b'{"\\u0024ref": "a.json"}',
    "utf16_ref": json.dumps({"$ref": "a.json"}).encode("utf-16"),
}


def _ex_referrer_only(name):
    def run(context):
        body = json.dumps({"properties": {"observed_at_utc": {}}})
        files = [("Plans/a.json", body), ("Plans/ref.json", EXCLUSION_REFERRERS[name])]
        rows, errors = _exclusion_errors(context, [_exclusion("Plans/a.json", body)], files)
        return not rows and bool(_errors(errors, "scan_exclusions_invalid", "loadable_schema_exclusion_forbidden: Plans/a.json"))
    run.__doc__ = "A file referenced only by a referrer whose one token is " + name + " is loadable: it cannot be excluded."
    return run


for _name in EXCLUSION_REFERRERS:
    check("datetime_unit_scan_exclusion_referenced_by_" + _name + "_only_file_forbidden")(_ex_referrer_only(_name))


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


@check("datetime_gate_bar_detects_listed_survivor")
def _detect_listed_survivor(context):
    """Fix round 17: a hand-written declared survivor (V04) names its rule and is listed by none; listing it, or a
    generated declared survivor, is a problem, and so is a witnessed hand-written mutation its rule omits."""
    spec = _gate_bar().load_spec(context.root)
    survivor = next(m for m in spec["mutations"] if m.get("survives"))
    generated = next(k for k, e in spec["generated"]["points"].items() if e.get("survives"))

    def list_hand(spec):
        next(r for r in spec["rules"] if r["id"] == survivor["rule"])["mutations"].append(survivor["id"])

    def list_generated(spec):
        spec["rules"][0]["mutations"].append(generated)

    def omit_witnessed(spec):
        rule = next(r for r in spec["rules"] if r["id"] == "profile.legacy-output")
        rule["mutations"].remove("hw-fix17-B05-legacy-six-digit-fraction")

    quiet = not [p for p in _fresh_problems(context, lambda spec: None) if "survivor" in p]
    return (quiet and survivor["id"] == "hw-fix17-V04-automatic-empty-context-only" and
            any(p.endswith("lists the declared survivor %s; declared survivors are never listed" % survivor["id"])
                for p in _fresh_problems(context, list_hand)) and
            any(("lists the declared survivor %s;" % generated) in p for p in _fresh_problems(context, list_generated)) and
            "mutation hw-fix17-B05-legacy-six-digit-fraction names rule profile.legacy-output, which does not list it"
            in _fresh_problems(context, omit_witnessed))


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


# ---------------------------------------------------------------------------
# N. Fix round 17 (TOOL-ISSUES T161-T166): each blind survivor's whole class.
# ---------------------------------------------------------------------------

# N1. T161 (B05): every finite parameter domain the gate checks, for every profile, with cases generated from the
# owner profile table: every value of the domain and each boundary just outside it. CV-1101: the RFC 3339 grammar
# is the same under every profile; storage_utc_z, coordination_utc_z and legacy_normalization_output admit only a
# terminal uppercase Z; legacy_normalization_output admits exactly nine fractional digits. None: the profile adds
# no restriction to that parameter.
PROFILE_TABLE = {
    E: {"zones": None, "fraction_lengths": None},
    S: {"zones": ("Z",), "fraction_lengths": None},
    C: {"zones": ("Z",), "fraction_lengths": None},
    L: {"zones": ("Z",), "fraction_lengths": (9,)},
}
# IERS Bulletin C72 insertion days (CV-1101 pins the history through 2016-12-31), the test's own copy.
C72_LEAP_DAYS = frozenset((
    "1972-06-30", "1972-12-31", "1973-12-31", "1974-12-31", "1975-12-31", "1976-12-31", "1977-12-31", "1978-12-31",
    "1979-12-31", "1981-06-30", "1982-06-30", "1983-06-30", "1985-06-30", "1987-12-31", "1989-12-31", "1990-12-31",
    "1992-06-30", "1993-06-30", "1994-06-30", "1995-12-31", "1997-06-30", "1998-12-31", "2005-12-31", "2008-12-31",
    "2012-06-30", "2015-06-30", "2016-12-31"))
FRACTION_LENGTHS = (*range(0, 25), 30, 40)
ZONE_FORMS = ("Z", "z", "+00:00", "-00:00", "+05:30", "-07:45", "+23:59", "-23:59", "+01:00", "-12:00")
ZONE_OUTSIDE = ("", "ZZ", "Zz", "UTC", "GMT", "+0000", "+00", "+0:00", "+000:00", "+00:000", "+00:00:00", "00:00",
                "*00:00", "Z ", " Z", "+00:00Z", "z+00:00", "\u2212" + "05:00")
SEPARATOR_OUTSIDE = (" ", "_", "x", "", "TT", "Tt", "\t", "\n")
DAY_YEARS = (2026, 2024, 1900, 2000, 0, 2100)
_MONTH_DAYS = (31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31)


def _days_in(year, month):
    leap = year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)
    return 29 if month == 2 and leap else _MONTH_DAYS[month - 1]


def _stamp(date="2026-01-01", separator="T", time="00:00:00", fraction=".123456789", zone="Z"):
    # The base, 2026-01-01T00:00:00.123456789Z, is valid under every profile; each case changes one part.
    return date + separator + time + fraction + zone


def _zone_outcome(profile, zone):
    zones = PROFILE_TABLE[profile]["zones"]
    return None if zones is None or zone in zones else "date_time_utc_z"


def _fraction_outcome(profile, digits):
    lengths = PROFILE_TABLE[profile]["fraction_lengths"]
    return None if lengths is None or digits in lengths else "date_time_legacy_fraction"


def _two_digit_field(name, maximum, code, place):
    """(parameter, value, outcome) for a two-digit field: every value of its range, then the boundary above it,
    99, and one and three digits."""
    def cases(profile):
        out = [(n, place("%02d" % n), None) for n in range(0, maximum + 1)]
        out += [(n, place("%02d" % n), code) for n in (maximum + 1, 99)]
        out += [(text, place(text), "date_time_syntax") for text in ("0", "000")]
        return out
    return cases


def _domain_fraction_length(profile):
    digits = "1234567890" * 4
    out = [(n, _stamp(fraction="." + digits[:n] if n else ""), _fraction_outcome(profile, n)) for n in FRACTION_LENGTHS]
    return out + [(".", _stamp(fraction="."), "date_time_syntax"), (".1a", _stamp(fraction=".1a"), "date_time_syntax")]


def _domain_zone(profile):
    return ([(z, _stamp(zone=z), _zone_outcome(profile, z)) for z in ZONE_FORMS] +
            [(z, _stamp(zone=z), "date_time_syntax") for z in ZONE_OUTSIDE])


def _domain_offset_hour(profile):
    out = [(s + "%02d" % h, _stamp(zone="%s%02d:00" % (s, h)), _zone_outcome(profile, "%s%02d:00" % (s, h)))
           for s in "+-" for h in range(0, 24)]
    out += [(s + "%02d" % h, _stamp(zone="%s%02d:00" % (s, h)), "date_time_offset_hour") for s in "+-" for h in (24, 99)]
    return out + [(t, _stamp(zone="+" + t + ":00"), "date_time_syntax") for t in ("0", "000")]


def _domain_offset_minute(profile):
    out = [(s + "%02d" % m, _stamp(zone="%s00:%02d" % (s, m)), _zone_outcome(profile, "%s00:%02d" % (s, m)))
           for s in "+-" for m in range(0, 60)]
    out += [(s + "%02d" % m, _stamp(zone="%s00:%02d" % (s, m)), "date_time_offset_minute") for s in "+-" for m in (60, 99)]
    return out + [(t, _stamp(zone="+00:" + t), "date_time_syntax") for t in ("0", "000")]


def _domain_separator(profile):
    return ([(s, _stamp(separator=s), None) for s in ("T", "t")] +
            [(s, _stamp(separator=s), "date_time_syntax") for s in SEPARATOR_OUTSIDE])


def _domain_date_time_separators(profile):
    return ([("date " + s, "2026" + s + "01-01" + "T00:00:00.123456789Z", "date_time_syntax") for s in ("/", ".", "_", "")] +
            [("date2 " + s, "2026-01" + s + "01" + "T00:00:00.123456789Z", "date_time_syntax") for s in ("/", ".", "_", "")] +
            [("time " + s, _stamp(time="00" + s + "00:00"), "date_time_syntax") for s in ("-", ".", "_", "")] +
            [("time2 " + s, _stamp(time="00:00" + s + "00"), "date_time_syntax") for s in ("-", "_", "")])


def _domain_year(profile):
    out = [(y, _stamp(date="%04d-01-01" % y), None) for y in range(0, 10000)]
    return out + [(t, _stamp(date=t + "-01-01"), "date_time_syntax") for t in ("026", "12026", "+2026", "-2026")]


def _domain_month(profile):
    out = [(m, _stamp(date="2026-%02d-01" % m), None) for m in range(1, 13)]
    out += [(m, _stamp(date="2026-%02d-01" % m), "date_time_month") for m in (0, 13, 99)]
    return out + [(t, _stamp(date="2026-" + t + "-01"), "date_time_syntax") for t in ("1", "001")]


def _domain_day(profile):
    out = []
    for year in DAY_YEARS:
        for month in range(1, 13):
            last = _days_in(year, month)
            out += [((year, month, d), _stamp(date="%04d-%02d-%02d" % (year, month, d)), None) for d in range(1, last + 1)]
            out += [((year, month, d), _stamp(date="%04d-%02d-%02d" % (year, month, d)), "date_time_day")
                    for d in (0, last + 1)]
    return out + [(t, _stamp(date="2026-01-" + t), "date_time_syntax") for t in ("1", "001")]


def _domain_second(profile):
    out = _two_digit_field("second", 59, "date_time_second", lambda t: _stamp(time="00:00:" + t))(profile)
    # 60 is in range but is a real leap second only at a table instant; 2026-01-01T00:00:60 is not one.
    return [(n, v, "date_time_leap_second" if n == 60 else c) for n, v, c in out] + \
        [(61, _stamp(time="00:00:61"), "date_time_second")]


def _domain_leap_second(profile):
    out = []
    for year in range(1971, 2028):
        for month in range(1, 13):
            day = "%04d-%02d-%02d" % (year, month, _days_in(year, month))
            out.append((day, _stamp(date=day, time="23:59:60"), None if day in C72_LEAP_DAYS else "date_time_leap_second"))
    return out


PROFILE_DOMAINS = {
    "fraction_length": _domain_fraction_length,
    "zone": _domain_zone,
    "offset_hour": _domain_offset_hour,
    "offset_minute": _domain_offset_minute,
    "separator": _domain_separator,
    "date_time_separators": _domain_date_time_separators,
    "year": _domain_year,
    "month": _domain_month,
    "day": _domain_day,
    "hour": _two_digit_field("hour", 23, "date_time_hour", lambda t: _stamp(time=t + ":00:00")),
    "minute": _two_digit_field("minute", 59, "date_time_minute", lambda t: _stamp(time="00:" + t + ":00")),
    "second": _domain_second,
    "leap_second": _domain_leap_second,
}
# The domains the format checker and the bound validator see for each profile, too.
CHECKER_DOMAINS = ("fraction_length", "zone", "offset_hour", "offset_minute", "separator")


def _profile_domain_check(profile, domain):
    def run(context):
        dt, _, _, _ = _mods()
        cases = PROFILE_DOMAINS[domain](profile)
        for _, value, expected in cases:
            kind, result = outcome(dt.date_time, value, profile=profile)
            if (kind, result) != (("accept", value) if expected is None else ("refuse", expected)):
                return False
            if expected is None and result is not value:
                return False
        return bool(cases)
    return run


def _profile_checker_check(profile):
    def run(context):
        dt, _, _, _ = _mods()
        checker = dt.format_checker(profile=profile)
        validator = _bound({"format": "date-time"}, profile=profile)
        count = 0
        for domain in CHECKER_DOMAINS:
            for _, value, expected in PROFILE_DOMAINS[domain](profile):
                count += 1
                if checker.conforms(value, "date-time") != (expected is None):
                    return False
                if validator.is_valid(value) != (expected is None):
                    return False
        return count > 0
    return run


for _profile in PROFILE_TABLE:
    for _domain in PROFILE_DOMAINS:
        check("datetime_unit_profile_domain_%s_%s" % (_profile, _domain))(_profile_domain_check(_profile, _domain))
    check("datetime_unit_profile_domain_%s_checker_and_validator" % _profile)(_profile_checker_check(_profile))


@check("datetime_unit_profile_domain_table_complete")
def _profile_domain_complete(context):
    """The self-test fails when a gate profile has no table row, a profile or domain has no generated check or no
    case, or a value the table names (and each boundary just outside it) has no case."""
    dt, _, _, _ = _mods()
    if tuple(PROFILE_TABLE) != dt.PROFILES:
        return False
    for profile, row in PROFILE_TABLE.items():
        if set(row) != {"zones", "fraction_lengths"}:
            return False
        names = ["datetime_unit_profile_domain_%s_%s" % (profile, d) for d in PROFILE_DOMAINS]
        names.append("datetime_unit_profile_domain_%s_checker_and_validator" % profile)
        if any(name not in CHECKS for name in names):
            return False
        cases = {domain: PROFILE_DOMAINS[domain](profile) for domain in PROFILE_DOMAINS}
        if any(not c for c in cases.values()):
            return False
        lengths = {p for p, _, _ in cases["fraction_length"]}
        for n in row["fraction_lengths"] or ():
            if not {n - 1, n, n + 1} <= lengths:
                return False
        zones = {p for p, _, _ in cases["zone"]}
        if not set(row["zones"] or ()) <= zones:
            return False
    covered = {p for p, _, _ in PROFILE_DOMAINS["year"](E)}
    days = {p for p, _, _ in PROFILE_DOMAINS["day"](E)}
    leap = {p for p, _, e in PROFILE_DOMAINS["leap_second"](E) if e is None}
    return (set(range(0, 10000)) <= covered and set(range(0, 25)) <= {p for p, _, _ in PROFILE_DOMAINS["fraction_length"](E)}
            and all((y, m, d) in days for y in DAY_YEARS for m in range(1, 13) for d in range(0, _days_in(y, m) + 2))
            and leap == C72_LEAP_DAYS and len(dt._LEAP_DAYS) == len(C72_LEAP_DAYS))


@check("datetime_unit_profile_domain_dialects")
def _dialect_domain(context):
    """Every supported dialect URI, with and without its empty fragment, selects its class; each spelling just
    outside the domain refuses (datetime_dialect_unsupported)."""
    from jsonschema import Draft202012Validator, Draft201909Validator, Draft7Validator, Draft6Validator
    dt, _, _, _ = _mods()
    supported = {D202012: Draft202012Validator, D201909: Draft201909Validator,
                 "http://json-schema.org/draft-07/schema": Draft7Validator,
                 "http://json-schema.org/draft-06/schema": Draft6Validator}
    for uri, cls in supported.items():
        for spelling in (uri, uri + "#"):
            if dt._dialect_validator({"$schema": spelling}) is not cls:
                return False
    outside = ("http://json-schema.org/draft-04/schema#", "http://json-schema.org/draft-03/schema#",
               "https://json-schema.org/draft/next/schema", "http://json-schema.org/draft/2020-12/schema",
               "https://json-schema.org/draft-07/schema#", D202012 + "/", D202012.upper(), "", " " + D202012,
               D202012 + "#/", 4, None, [D202012], {"$id": D202012}, True)
    return all(_admission_reason(dt._dialect_validator, {"$schema": uri}) == "datetime_dialect_unsupported"
               for uri in outside)


@check("datetime_unit_profile_domain_inventory_classification", slow=True)
def _inventory_profile_domain(context):
    """Every inventory classification under both inventory profiles: classification_profile_conflict exactly when a
    Storage class and storage_utc_z disagree; a profile outside the inventory enum fails the inventory schema."""
    storage_classes = ("EventRecord", "event_record_index", "original_storage_fields", "Storage issued original fields")
    classes = (*storage_classes, "other_owner_observation", "source_lineage_schema_patch", "wildcard_non_timestamp",
               "wildcard_non_timestamp_role", "wildcard_review_required")
    for classification in classes:
        for profile in ("storage_utc_z", "owner_schema"):
            rows = [context.row(*(STORAGE if classification in storage_classes else NAMED))]
            rows[0].update(classification=classification, profile=profile)
            conflict = "classification_profile_conflict" in _codes(_validate(context, rows))
            expected = (classification in storage_classes) != (profile == "storage_utc_z") or (
                "CV-253" in rows[0]["owner"] and profile != "storage_utc_z")
            if conflict != expected:
                return False
    for profile in ("event_record", "coordination_utc_z", "STORAGE_UTC_Z", ""):
        rows = [context.row(*NAMED)]
        rows[0]["profile"] = profile
        if _codes(_validate(context, rows)) != {"inventory_schema"}:
            return False
    return True


# N2. T162 (B08): each keyword the gate composes on a selected Storage field refuses on its own. The selection's own
# field schemas are empty ({}), so the composed keyword is the only thing that can refuse; the plain validator over
# the same schema accepts every one of these values. Both composition hooks: iter_errors at the root, and descend
# at a referenced resource.
UNTYPED_STORAGE = {"$schema": D202012, "$id": "urn:pm:scratch:untyped-storage", "type": "object",
                   "properties": {"observed_at_utc": {}, "persisted_at_utc": {}}}
COMPOSED_ALONE = {
    "type": (123, 1.5, None, True, [], {}, ["2026-01-01T00:00:00Z"]),
    "format": ("not-a-dateZ", "2026-02-30T00:00:00Z", "2015-12-31T23:59:60Z", "2026-01-01 00:00:00Z",
               "2026-13-01T00:00:00Z"),
    "pattern": ("2026-01-01T00:00:00+00:00", "2026-01-01T00:00:00-00:00", "2026-01-01T00:00:00z",
                "2026-01-01T00:00:00+05:30"),
}
COMPOSED_GOOD = {"observed_at_utc": "2026-01-01T00:00:00.123456789123Z", "persisted_at_utc": "2016-12-31T23:59:60Z"}


def _untyped_validators():
    from referencing import Registry, Resource
    from referencing.jsonschema import DRAFT202012
    schema = copy.deepcopy(UNTYPED_STORAGE)
    selection = _selection([(schema, {"": _storage_row(schema)})])
    root = _bound(schema, selection=selection)
    registry = Registry().with_resource(schema["$id"], Resource.from_contents(schema, default_specification=DRAFT202012))
    wrapper = {"properties": {"event": {"$ref": schema["$id"]}}}
    referenced = _bound(wrapper, registry, _selection([(schema, {"": _storage_row(schema)})]))
    return schema, root, referenced


def _composed_alone_check(keyword, hook):
    def run(context):
        from jsonschema import Draft202012Validator
        dt, _, _, _ = _mods()
        schema, root, referenced = _untyped_validators()
        plain = Draft202012Validator(schema, format_checker=dt.format_checker())
        wrap = (lambda v: v) if hook == "root" else (lambda v: {"event": v})
        validator = root if hook == "root" else referenced
        if not validator.is_valid(wrap(COMPOSED_GOOD)):
            return False
        for field in ("observed_at_utc", "persisted_at_utc"):
            for value in COMPOSED_ALONE[keyword]:
                instance = dict(COMPOSED_GOOD, **{field: value})
                if not plain.is_valid(instance) or validator.is_valid(wrap(instance)):
                    return False
                if [e.validator for e in validator.iter_errors(wrap(instance))] != [keyword]:
                    return False
        return True
    return run


for _keyword in COMPOSED_ALONE:
    for _hook in ("root", "through_reference"):
        check("datetime_unit_composition_%s_alone_%s" % (_keyword, _hook))(_composed_alone_check(_keyword, _hook))


# N3. T163 and T164 (I03, I05): the inventory scan decodes closed. Names spelled only through escapes, declarations
# inside serialized arrays and serialized strings at every depth up to the bound; past the bound, an escaped
# container, a container key and an unreadable or byte-order-marked string container each refuse by name.
ESCAPED_NOTE = '{"description": "\\u006fbserved_at_utc"}'


def _scan_codes(rows, errors):
    return ([(r["origin"], r["pointer"], r["fields"]) for r in rows],
            sorted((e["error"], e.get("origin")) for e in errors))


@check("datetime_unit_scan_escaped_mention_fence_unclassified")
def _scan_escaped_fence(context):
    root = context.scratch()
    write(root, "Plans/escaped.md", "# Escaped\n\n```json\n" + ESCAPED_NOTE + "\n```\n")
    return _scan_codes(*_scan(root)) == ([], [("unclassified_mentioning_container", "fence:3")])


@check("datetime_unit_scan_escaped_mention_json_doubly_escaped")
def _scan_escaped_json(context):
    root = context.scratch()
    write(root, "Plans/escaped.json", '{"description": "\\\\u006fbserved_at_utc"}')
    return _scan_codes(*_scan(root)) == ([], [("unclassified_mentioning_container", "json")])


@check("datetime_unit_scan_escaped_mention_every_container")
def _scan_escaped_containers(context):
    """The same escaped-only mention, with no declaration, in each other container kind: a JSONL line, an indented
    code block, inline code, an HTML block, a JSON value escaped three times and a UTF-16 JSON file."""
    triple = json.dumps({"note": "\\\\\\u006fbserved_at_utc"})
    cases = (("Plans/a.jsonl", '{"x": 1}\n' + ESCAPED_NOTE + "\n", ("unclassified_mentioning_container", "jsonl:2")),
             ("Plans/b.md", "Text\n\n    " + ESCAPED_NOTE + "\n", ("unclassified_mentioning_container", "code:3")),
             ("Plans/c.md", "Text `" + ESCAPED_NOTE + "` here\n", ("unclassified_mentioning_container", "code_inline:1:1")),
             ("Plans/d.md", "<div>\n" + ESCAPED_NOTE + "\n</div>\n", ("unreadable_mentioning_container", "html:1")),
             ("Plans/e.json", triple, ("unclassified_mentioning_container", "json")),
             ("Plans/f.json", ESCAPED_NOTE.encode("utf-16"), ("unclassified_mentioning_container", "json")))
    for path, body, expected in cases:
        root = context.scratch()
        write(root, path, body)
        if _scan_codes(*_scan(root)) != ([], [expected]):
            return False
    return True


@check("datetime_unit_scan_serialized_list_declaration")
def _scan_serialized_list(context):
    root = context.scratch()
    hidden = [{"properties": {"persisted_at_utc": {"type": "string"}}}]
    write(root, "Plans/list.json", {"properties": {"observed_at_utc": {"type": "string"}},
                                    "examples": [json.dumps(hidden)]})
    return _scan_codes(*_scan(root)) == ([("json", "", ["observed_at_utc"]),
                                          ("json:string:/examples/0", "/0", ["persisted_at_utc"])], [])


@check("datetime_unit_scan_doubly_serialized_declaration")
def _scan_doubly_serialized(context):
    root = context.scratch()
    hidden = json.dumps(json.dumps({"properties": {"persisted_at_utc": {"type": "string"}}}))
    write(root, "Plans/double.json", {"properties": {"observed_at_utc": {"type": "string"}}, "x": hidden})
    rows, errors = _scan(root)
    return _scan_codes(rows, errors) == ([("json", "", ["observed_at_utc"]),
                                          ("json:string:/x:string:", "", ["persisted_at_utc"])], [])


def _nested(levels):
    value = {"properties": {"persisted_at_utc": {"type": "string"}}}
    for _ in range(levels):
        value = json.dumps(value)
    return value


@check("datetime_unit_scan_serialized_depth_bound")
def _scan_depth_bound(context):
    """A declaration SERIALIZED_DEPTH strings deep is found; one more string deep refuses (serialized_depth_exceeded)
    at the string past the bound, never silently."""
    _, inv, _, _ = _mods()
    depth = inv.SERIALIZED_DEPTH
    at_bound = context.scratch()
    write(at_bound, "Plans/deep.json", {"x": _nested(depth)})
    past = context.scratch()
    write(past, "Plans/deep.json", {"x": _nested(depth + 1)})
    origin = "json:string:/x" + ":string:" * (depth - 1)
    return (depth == 8 and _scan_codes(*_scan(at_bound)) == ([(origin, "", ["persisted_at_utc"])], []) and
            _scan_codes(*_scan(past)) == ([], [("serialized_depth_exceeded", origin + ":string:"),
                                               ("unclassified_mentioning_container", "json")]))


@check("datetime_unit_scan_source_document_at_depth_bound")
def _scan_depth_source(context):
    """_source_document reads the row SERIALIZED_DEPTH strings deep back to its node."""
    _, inv, _, _ = _mods()
    root = context.scratch()
    write(root, "Plans/deep.json", {"x": _nested(inv.SERIALIZED_DEPTH)})
    rows, errors = _scan(root)
    return (not errors and len(rows) == 1 and
            inv.at(inv._source_document(root, rows[0], {}), rows[0]["pointer"]) == {
                "properties": {"persisted_at_utc": {"type": "string"}}})


@check("datetime_unit_scan_escaped_string_container_refused")
def _scan_escaped_container(context):
    """A string that is a JSON container only once unescaped refuses (escaped_schema_string_container):
    \\u-escaped braces or brackets, a string literal with escaped quotes, and doubly escaped braces."""
    body = json.dumps({"properties": {"persisted_at_utc": {}}})
    values = (body.replace("{", "\\u007b"), "\\u005b" + body + "]", '\\"' + json.dumps(body)[1:-1] + '\\"',
              body.replace("{", "\\\\u007b"))
    for value in values:
        root = context.scratch()
        write(root, "Plans/a.json", {"properties": {"observed_at_utc": {}}, "x": value})
        if _scan_codes(*_scan(root)) != ([("json", "", ["observed_at_utc"])],
                                         [("escaped_schema_string_container", "json:string:/x")]):
            return False
    return True


@check("datetime_unit_scan_shaped_string_container_refused")
def _scan_shaped_container(context):
    """A string that starts like a JSON container after whitespace or byte order marks, and does not parse, refuses
    (unreadable_schema_string_container); prose that mentions a field is still skipped."""
    for value in ("\ufeff" + json.dumps({"properties": {"persisted_at_utc": {}}}), "\u00a0[{\"persisted_at_utc\": ",
                  '\n "persisted_at_utc', "\ufeff\ufeff{\"persisted_at_utc\": 1}",
                  json.dumps(json.dumps({"properties": {"persisted_at_utc": {}}}))[1:-1]):
        root = context.scratch()
        write(root, "Plans/a.json", {"properties": {"observed_at_utc": {}}, "x": value})
        if _scan_codes(*_scan(root)) != ([("json", "", ["observed_at_utc"])],
                                         [("unreadable_schema_string_container", "json:string:/x")]):
            return False
    root = context.scratch()
    write(root, "Plans/a.json", {"properties": {"observed_at_utc": {}}, "x": "the persisted_at_utc field, \"quoted\""})
    return _scan_codes(*_scan(root)) == ([("json", "", ["observed_at_utc"])], [])


@check("datetime_unit_scan_serialized_key_refused")
def _scan_serialized_key(context):
    """A key that is (or unescapes to) a JSON container has no pointer to address it: it refuses
    (serialized_key_container); an ordinary key naming a field does not."""
    body = json.dumps({"properties": {"persisted_at_utc": {}}})
    for key in (body, body.replace("{", "\\u007b"), " " + body):
        root = context.scratch()
        write(root, "Plans/a.json", {"properties": {"observed_at_utc": {}}, "m": {key: 1}})
        origin = "json:key:/m/" + key.replace("~", "~0").replace("/", "~1")
        if _scan_codes(*_scan(root)) != ([("json", "", ["observed_at_utc"])], [("serialized_key_container", origin)]):
            return False
    return True


@check("datetime_unit_scan_inline_code_escaped_brace")
def _scan_inline_escaped(context):
    """Inline code whose braces are spelled only through escapes is a code container too."""
    root = context.scratch()
    write(root, "Plans/a.md", "Text `\\u007b\"note\": \"observed_at_utc\"}` here\n")
    return _scan_codes(*_scan(root)) == ([], [("unreadable_mentioning_container", "code_inline:1:1")])


def _wrong_type_declaration(keyword, value):
    def run(context):
        root = context.scratch()
        write(root, "Plans/a.json", {"$defs": {"n": {keyword: value}}})
        rows, errors = _scan(root)
        return (not rows and [(e["error"], e.get("detail")) for e in errors] ==
                [("scan_read_failed", "unreadable field declaration keyword: " + keyword)])
    return run


WRONG_TYPE_DECLARATIONS = {
    "properties": ["observed_at_utc"], "dependentRequired": ["observed_at_utc"],
    "dependentSchemas": [{"observed_at_utc": {}}], "patternProperties": "^observed_at_utc$",
    "propertyNames": "observed_at_utc", "required": "observed_at_utc", "enum": "observed_at_utc",
}
for _keyword, _value in WRONG_TYPE_DECLARATIONS.items():
    check("datetime_unit_scan_wrong_type_declaration_%s" % _keyword)(_wrong_type_declaration(_keyword, _value))


@check("datetime_unit_scan_wrong_type_without_name_reads_nothing")
def _scan_wrong_type_quiet(context):
    """A declaring keyword of another type that names neither field (data such as "required": true) declares
    nothing and refuses nothing."""
    root = context.scratch()
    write(root, "Plans/a.json", {"properties": {"observed_at_utc": {}}, "$defs": {"n": {"required": True,
                                                                                         "enum": "x", "properties": 3}}})
    return _scan_codes(*_scan(root)) == ([("json", "", ["observed_at_utc"])], [])


@check("datetime_unit_admission_wrong_type_declaration_fails_closed")
def _admission_wrong_type(context):
    """Runtime admission reads declarations the same way: a wrong-typed keyword naming a field raises."""
    dt, inv, _, _ = _mods()
    try:
        _bound({"properties": {"x": {"required": "observed_at_utc"}}}).is_valid({"x": {}})
    except ValueError as error:
        return not isinstance(error, inv.DatetimeAdmissionError) and \
            str(error) == "unreadable field declaration keyword: required"
    return False


@check("datetime_unit_scan_json_layers")
def _scan_json_layers(context):
    """Every JSON escape decodes at every level, to the fixed point; text without escapes is one layer."""
    _, inv, _, _ = _mods()
    return (inv._json_layers("plain") == ["plain"] and
            inv._json_layers("\\\\u006f") == ["\\\\u006f", "\\u006f", "o"] and
            inv._json_layers('\\"\\/\\b\\f\\n\\r\\t') == ['\\"\\/\\b\\f\\n\\r\\t', '"/\b\f\n\r\t'] and
            inv._json_layers("\\x\\u00") == ["\\x\\u00"] and
            inv.mentions_field("\\\\\\\\u006fbserved_at_utc") and inv.schema_candidate("\\u0070atternProperties") and
            inv.schema_candidate("pattern\\\\u0050roperties") and not inv.mentions_field("observed\\_at_utc"))


# N4. T166: the bound validator's checker, registry, resolver and selection are fixed after construction, and so is
# the checker's own table. Every route raises the TypeError a format_checker argument to datetime_validator raises.
def _bound_timestamp():
    from referencing import Registry, Resource
    from referencing.jsonschema import DRAFT202012
    target = {"$id": "urn:pm:scratch:ts", "type": "string", "format": "date-time"}
    registry = Registry().with_resource(target["$id"], Resource.from_contents(target, default_specification=DRAFT202012))
    return _bound({"properties": {"t": {"$ref": target["$id"]}}}, registry)


def _type_error(build):
    try:
        build()
    except TypeError as error:
        return str(error)
    except Exception as error:  # noqa: BLE001
        return "exception:" + type(error).__name__
    return None


def _still_checks(validator):
    return (validator.is_valid({"t": "2026-01-01T00:00:00Z"}) and not validator.is_valid({"t": "not-a-dateZ"}) and
            not validator.is_valid({"t": "2026-02-30T00:00:00Z"}))


@check("datetime_unit_bound_construction_format_checker_type_error")
def _bound_construction(context):
    """The reference: datetime_validator itself refuses a format_checker, storage_selection or datetime_binding
    argument with TypeError."""
    from jsonschema import FormatChecker
    dt, _, _, _ = _mods()
    return all(_type_error(lambda k=k, v=v: dt.datetime_validator({}, **{k: v})) is not None for k, v in
               (("format_checker", None), ("format_checker", FormatChecker()), ("storage_selection", None),
                ("datetime_binding", None)))


def _evolve_refused(change, message):
    def run(context):
        validator = _bound_timestamp()
        return _type_error(lambda: change(validator)) == message and _still_checks(validator)
    return run


def _foreign_resolver():
    from referencing import Registry, Resource
    from referencing.jsonschema import DRAFT202012
    return Registry().with_resource("urn:pm:scratch:ts", Resource.from_contents(
        {}, default_specification=DRAFT202012)).resolver()


def _legacy_resolver():
    from jsonschema.validators import _RefResolver
    return _RefResolver.from_schema({})


def _stock_checker():
    from jsonschema import FormatChecker
    return FormatChecker()


EVOLVE_ROUTES = {
    "format_checker_none": (lambda v: v.evolve(format_checker=None), "format_checker"),
    "format_checker_stock": (lambda v: v.evolve(format_checker=_stock_checker()), "format_checker"),
    "format_checker_other_profile": (lambda v: v.evolve(format_checker=_mods()[0].format_checker(profile=S)),
                                     "format_checker"),
    "registry": (lambda v: v.evolve(registry=_foreign_resolver()._registry), "registry"),
    "resolver_legacy": (lambda v: v.evolve(resolver=_legacy_resolver()), "resolver"),
    "resolver_foreign": (lambda v: v.evolve(_resolver=_foreign_resolver()), "resolver"),
    "storage_selection": (lambda v: v.evolve(storage_selection=_selection()), "storage_selection"),
}
for _name, (_change, _field) in EVOLVE_ROUTES.items():
    check("datetime_unit_bound_evolve_%s_refused" % _name)(
        _evolve_refused(_change, "datetime_validator_fixed_" + _field))


@check("datetime_unit_bound_evolve_forged_binding_refused")
def _bound_forged(context):
    import types
    validator = _bound_timestamp()
    binding = validator.datetime_binding
    forged = types.SimpleNamespace(checker=binding.checker, registry=binding.registry, selection=binding.selection)
    return (_type_error(lambda: validator.evolve(datetime_binding=forged)) == "datetime_validator_binding_forged" and
            _type_error(lambda: validator.evolve(datetime_binding=tuple(binding))) == "datetime_validator_binding_forged")


@check("datetime_unit_bound_replace_copies_refused")
def _bound_replace(context):
    """attrs.evolve and copy.replace build a new instance without the bound evolve: construction still refuses."""
    import attrs
    validator = _bound_timestamp()
    message = "datetime_validator_fixed_format_checker"
    return (_type_error(lambda: attrs.evolve(validator, format_checker=None)) == message and
            _type_error(lambda: copy.replace(validator, format_checker=_stock_checker())) == message and
            _type_error(lambda: attrs.evolve(validator, registry=_foreign_resolver()._registry)) ==
            "datetime_validator_fixed_registry" and _still_checks(validator))


@check("datetime_unit_bound_evolve_schema_only_still_checks")
def _bound_evolve_control(context):
    """Control: an evolve that changes only the schema works and still checks timestamps, and so does jsonschema's
    own evolve through a reference (schema and _resolver)."""
    validator = _bound_timestamp()
    evolved = validator.evolve(schema={"properties": {"t": {"$ref": "urn:pm:scratch:ts"}}, "required": ["t"]})
    return (_still_checks(validator) and _still_checks(evolved) and not evolved.is_valid({}) and
            evolved.format_checker is validator.format_checker and
            evolved.datetime_binding is validator.datetime_binding)


def _setattr_refused(name, value):
    def run(context):
        validator = _bound_timestamp()
        return (_type_error(lambda: setattr(validator, name, value(validator))) == "datetime_validator_fixed: " + name and
                _still_checks(validator))
    return run


SETATTR_ROUTES = {
    "format_checker": lambda v: None,
    "_registry": lambda v: _foreign_resolver()._registry,
    "_resolver": lambda v: _foreign_resolver(),
    "_ref_resolver": lambda v: _legacy_resolver(),
    "storage_selection": lambda v: _selection(),
    "datetime_binding": lambda v: None,
}
for _name, _value in SETATTR_ROUTES.items():
    check("datetime_unit_bound_setattr_%s_refused" % _name.lstrip("_"))(_setattr_refused(_name, _value))


@check("datetime_unit_bound_deprecated_resolver_refused")
def _bound_deprecated_resolver(context):
    """Reading the deprecated .resolver property would install a legacy RefResolver: it raises instead."""
    import warnings
    validator = _bound_timestamp()
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", DeprecationWarning)
        message = _type_error(lambda: validator.resolver)
    return message == "datetime_validator_fixed: _ref_resolver" and validator._ref_resolver is None and \
        _still_checks(validator)


@check("datetime_unit_bound_other_attributes_assignable")
def _bound_other_attributes(context):
    """Control: only the fixed attributes are fixed; any other attribute assigns as before."""
    validator = _bound_timestamp()
    validator.note = 1
    return validator.note == 1 and _still_checks(validator)


@check("datetime_unit_format_checker_table_fixed")
def _checker_table_fixed(context):
    """The gate checker's table is read-only: checks(), item assignment, reassignment and deletion all raise
    TypeError, and the checker still runs the predicate."""
    dt, _, _, _ = _mods()
    checker = dt.format_checker()

    def replace_entry():
        checker.checkers["date-time"] = (lambda value: True, ())

    results = [_type_error(lambda: checker.checks("date-time")(lambda value: True)), _type_error(replace_entry),
               _type_error(lambda: setattr(checker, "checkers", {})),
               _type_error(lambda: delattr(checker, "checkers")),
               _type_error(lambda: setattr(checker, "_fixed", False))]
    return (results[2:] == ["datetime_format_checker_fixed: checkers", "datetime_format_checker_fixed: checkers",
                            "datetime_format_checker_fixed: _fixed"] and None not in results[:2] and
            not any(r.startswith("exception:") for r in results) and
            not checker.conforms("not-a-dateZ", "date-time") and checker.conforms("2026-01-01T00:00:00Z", "date-time"))


@check("datetime_unit_bound_fixed_routes_in_validator")
def _bound_fixed_in_validator(context):
    """A loosened table never reaches a validator: after every refused route the validator still refuses."""
    validator = _bound_timestamp()
    for attempt in (lambda: validator.format_checker.checkers.pop("date-time"),
                    lambda: delattr(validator.format_checker, "checkers"),
                    lambda: setattr(validator.format_checker, "checkers", {})):
        try:
            attempt()
        except (TypeError, AttributeError):
            pass
        else:
            return False
    return _still_checks(validator)


# ---------------------------------------------------------------------------
# P. Fix round 18 (Sol max gate r2, findings 1 and 2).
# P1. Every classified timestamp field of every committed Storage-classified node refuses an invalid string at that
#     field. The fields come from the node's classification (CV-253, CV-1101), never from a format annotation.
# P2. The validator's effective configuration is verified at every use against the pins fixed at construction.
# ---------------------------------------------------------------------------

NODE_CONTROLS = "scripts/pm_event_datetime_node_controls.json"
NODE_INVENTORY = "Plans/event_datetime_inventory.json"
NODE_INVALID = "not-a-time"
# One string per profile that the other profile judges differently: the strict Storage profile refuses a +00:00
# offset, and the broad EventRecord profile accepts lowercase t and an offset with a long fraction.
NODE_STORAGE_STRICT = "2026-01-01T00:00:00+00:00"
NODE_SOURCE_BROAD = "2026-01-01t00:00:00.123456789012345678901+05:30"


def _node_name(key):
    return "datetime_node_" + hashlib.sha256("\0".join(key).encode()).hexdigest()[:12]


def _node_fields(row):
    """The test's own copy of the owner table: a Storage-classified node's declared Storage fields take CV-253's
    strict profile, and an EventRecord node's source occurred_at_utc takes CV-1101's broad EventRecord profile."""
    fields = [(field, "storage") for field in row["fields"]] if row["profile"] == "storage_utc_z" else []
    if row["classification"] == "EventRecord":
        fields.append(("occurred_at_utc", "source"))
    return fields


def _node_rows(context):
    if "node_rows" not in context.cache:
        _, inv, _, _ = _mods()
        context.cache["node_rows"] = {inv.node_key(r): r for r in context.inventory()["nodes"]
                                      if r["profile"] == "storage_utc_z"}
    return context.cache["node_rows"]


def _node_controls(context):
    if "node_controls" not in context.cache:
        table = json.loads((context.root / NODE_CONTROLS).read_text())
        context.cache["node_controls"] = (table["objects"],
                                          {(n["path"], n["origin"], n["pointer"]): n["control"] for n in table["nodes"]},
                                          table["nodes"])
    return context.cache["node_controls"]


def _node_validator(context, row):
    """datetime_validator over a neutral reference to the node, its complete committed resource preloaded."""
    from referencing import Registry, Resource
    from referencing.jsonschema import DRAFT202012
    dt, inv, _, _ = _mods()
    cache = context.cache.setdefault("node_validators", {})
    document = inv._source_document(context.root, row, context.cache.setdefault("node_documents", {}))
    row = inv.bind_nested_resource(row, document)
    key = (row["path"], row["origin"], row["resource_pointer"], row["resource_sha256"])
    if key not in cache:
        resource = inv.at(document, row["resource_pointer"])
        uri = resource.get("$id") or "urn:pm:datetime-node:" + inv.digest(resource)
        registry = Registry().with_resource(uri, Resource.from_contents(resource, default_specification=DRAFT202012))
        cache[key] = (uri, dt.datetime_validator({"$ref": uri}, registry=registry))
    uri, validator = cache[key]
    return validator.evolve(schema={"$ref": uri + "#" + row["pointer"][len(row["resource_pointer"]):]})


def _leaves(error):
    yield error
    for child in error.context or ():
        yield from _leaves(child)


def _refused_at(validator, instance, field):
    """Every error and its context, when the instance is refused and every error lies at field; else None."""
    errors = list(validator.iter_errors(instance))
    if not errors or any(tuple(e.absolute_path) != (field,) for e in errors):
        return None
    return [leaf for error in errors for leaf in _leaves(error)]


def _node_check(key):
    """One committed node: its committed control is valid; each classified field set to an invalid string is
    refused at that field by the date-time predicate (date_time_syntax); a +00:00 offset is refused at a Storage
    field, and a lowercase, offset, long-fraction string stays valid at an EventRecord source field."""
    def run(context):
        _, _, _, m = _mods()
        row = _node_rows(context).get(key)
        objects, controls, _ = _node_controls(context)
        if row is None or key not in controls:
            return False
        control = copy.deepcopy(objects[controls[key]]["value"])
        validator = _node_validator(context, row)
        if list(validator.iter_errors(control)):
            return False
        for field, kind in _node_fields(row):
            if field not in control:
                return False
            refused = _refused_at(validator, dict(control, **{field: NODE_INVALID}), field)
            if refused is None or not any(isinstance(e.cause, m.Refusal) and e.cause.reason == "date_time_syntax"
                                          for e in refused):
                return False
            if kind == "storage" and _refused_at(validator, dict(control, **{field: NODE_STORAGE_STRICT}),
                                                 field) is None:
                return False
            if kind == "source" and not validator.is_valid(dict(control, **{field: NODE_SOURCE_BROAD})):
                return False
        return True
    return run


def _register_node_checks():
    """One check per Storage-classified node of the committed inventory, registered at import: a node added to the
    inventory gets a check at once, and it fails until the node has a committed control."""
    try:
        nodes = json.loads((ROOT / NODE_INVENTORY).read_text())["nodes"]
    except (OSError, ValueError, KeyError):
        return []
    keys = [(r["path"], r["origin"], r["pointer"]) for r in nodes if r.get("profile") == "storage_utc_z"]
    for key in keys:
        check(_node_name(key), slow=True)(_node_check(key))
    return keys


NODE_KEYS = _register_node_checks()


@check("datetime_node_controls_complete", slow=True)
def _node_controls_complete(context):
    """Every Storage-classified node of the inventory has exactly one committed control and a registered check, no
    control names another node, each object is keyed by its own digest and carries every classified field, and the
    reviewer's twelve source rows are among the checked nodes."""
    _, inv, _, _ = _mods()
    rows = _node_rows(context)
    objects, controls, entries = _node_controls(context)
    if len(entries) != len(controls) or set(controls) != set(rows) or set(NODE_KEYS) != set(rows):
        return False
    if any(inv.digest(item["value"]) != digest for digest, item in objects.items()):
        return False
    for key, row in rows.items():
        value = objects.get(controls[key], {}).get("value")
        if not isinstance(value, dict) or not _node_fields(row) or any(f not in value for f, _ in _node_fields(row)):
            return False
        if _node_name(key) not in CHECKS:
            return False
    unformatted = [k for k, r in rows.items() if r["classification"] == "EventRecord" and
                   _node_property(context, r, "occurred_at_utc") == {"type": "string"}]
    return len(unformatted) == 12 and all(k[0] == "Plans/restore_point_deleted_read_adapter.schema.json"
                                          for k in unformatted)


def _node_property(context, row, field):
    _, inv, _, _ = _mods()
    document = inv._source_document(context.root, row, context.cache.setdefault("node_documents", {}))
    return inv.at(document, row["pointer"]).get("properties", {}).get(field)


# The reviewer's row: Plans/restore_point_deleted_read_adapter.schema.json, the historical admission source event.
REVIEWER_SOURCE_ROW = ("Plans/restore_point_deleted_read_adapter.schema.json", "json",
                       "/properties/historical_admission/anyOf/0/properties/source_event")


@check("datetime_validator_real_source_row_refused", slow=True)
def _real_source_row(context):
    """The gate review's exact input: the committed restore_point.deleted pre-append fixture, with persisted_at_utc
    and sequence_id added, is valid at the source_event row, and each malformed occurred_at_utc the review listed is
    refused at that field; the original row alone (plain validator) accepts them, so the refusal is the composition's.
    Through evolve(schema=row) as well as through the neutral reference."""
    from jsonschema import Draft202012Validator
    dt, inv, _, m = _mods()
    schema = json.loads((context.root / REVIEWER_SOURCE_ROW[0]).read_text())
    row = inv.at(schema, REVIEWER_SOURCE_ROW[2])
    fixture = json.loads((context.root / "Plans/restore_point_deleted_contract_fixtures.json").read_text())
    event = copy.deepcopy(inv.at(fixture, "/value_shape_cases/0/value/frozen_append_input"))
    event.update(persisted_at_utc=event["observed_at_utc"], sequence_id=1)
    validators = (dt.datetime_validator(schema).evolve(schema=row),
                  _node_validator(context, _node_rows(context)[REVIEWER_SOURCE_ROW]))
    for validator in validators:
        if not validator.is_valid(event):
            return False
        for stamp in ("not-a-time", "2026-02-30T00:00:00Z", "2026-01-01 00:00:00Z", "2026-01-01T00:00:00Z\n"):
            bad = dict(event, occurred_at_utc=stamp)
            refused = _refused_at(validator, bad, "occurred_at_utc")
            if not Draft202012Validator(row).is_valid(bad) or refused is None or not any(
                    e.validator == "format" and isinstance(e.cause, m.Refusal) for e in refused):
                return False
        for stamp in ("2026-01-01T00:00:00+00:00", "2026-01-01t00:00:00.1234567890123456789z",
                      "2017-01-01T05:29:60+05:30", "0000-02-29T23:59:59Z"):
            if not validator.is_valid(dict(event, occurred_at_utc=stamp)):
                return False
    return True


# P1 units: the source composition over a synthetic EventRecord-classified node whose occurred_at_utc is untyped, so
# the composed type and the composed predicate are each the only thing that can refuse.
UNTYPED_SOURCE = {"$schema": D202012, "$id": "urn:pm:scratch:untyped-source", "type": "object",
                  "properties": {"occurred_at_utc": {}, "observed_at_utc": {"type": "string"}}}


def _source_row(schema, classification="EventRecord", pointer="", resource=None):
    _, inv, _, _ = _mods()
    return {"path": "Plans/scratch.json", "origin": "json", "pointer": pointer, "resource_pointer": "",
            "fields": ["observed_at_utc"], "profile": "storage_utc_z", "classification": classification,
            "node_sha256": inv.digest(inv.at(resource or schema, pointer)),
            "resource_sha256": inv.digest(resource or schema)}


def _source_bound(classification="EventRecord", profile="event_record", schema=None):
    schema = copy.deepcopy(schema or UNTYPED_SOURCE)
    return _bound(schema, selection=_selection([(schema, {"": _source_row(schema, classification)})]),
                  profile=profile)


def _source_errors(validator, value):
    _, _, _, m = _mods()
    return sorted({(e.validator, tuple(e.absolute_path), e.cause.reason if isinstance(e.cause, m.Refusal) else None)
                   for e in validator.iter_errors({"observed_at_utc": "2026-01-01T00:00:00Z", "occurred_at_utc": value})})


@check("datetime_unit_source_composition_type_alone")
def _source_type_alone(context):
    """A non-string occurred_at_utc is refused by the composed type alone; the original accepts it."""
    from jsonschema import Draft202012Validator
    validator = _source_bound()
    plain = Draft202012Validator(UNTYPED_SOURCE)
    return all(plain.is_valid({"occurred_at_utc": v}) and
               _source_errors(validator, v) == [("type", ("occurred_at_utc",), None)]
               for v in (5, 1.5, None, True, [], {}, ["2026-01-01T00:00:00Z"]))


@check("datetime_unit_source_composition_predicate_alone")
def _source_predicate_alone(context):
    """A malformed string is refused by the composed predicate alone, a format error at the field whose cause is the
    predicate's own refusal code; the original accepts it."""
    from jsonschema import Draft202012Validator
    validator = _source_bound()
    plain = Draft202012Validator(UNTYPED_SOURCE)
    cases = {"not-a-time": "date_time_syntax", "2026-02-30T00:00:00Z": "date_time_day",
             "2026-01-01 00:00:00Z": "date_time_syntax", "2026-01-01T00:00:00Z\n": "date_time_syntax",
             "2026-01-01T00:00:00": "date_time_syntax", "2015-12-31T23:59:60Z": "date_time_leap_second",
             "2026-01-01T00:00:00+24:00": "date_time_offset_hour"}
    return all(plain.is_valid({"occurred_at_utc": v}) and
               _source_errors(validator, v) == [("format", ("occurred_at_utc",), code)] for v, code in cases.items())


@check("datetime_unit_source_composition_host_string")
def _source_host_string(context):
    """Every value the validator treats as a string reaches the composed predicate: a str subclass or StrEnum member
    is refused (date_time_type), its valid text included."""
    validator = _source_bound()
    return all(_source_errors(validator, make(text)) == [("format", ("occurred_at_utc",), "date_time_type")]
               for make in HOST_STRINGS.values() for text in ("2026-01-01T00:00:00Z", "not-a-time"))


@check("datetime_unit_source_composition_broad_profile_exact")
def _source_broad_exact(context):
    """The source field takes the broad EventRecord profile, whatever profile the validator runs: lowercase, offsets,
    a long fraction and an offset leap second stay valid under the strict profiles too, while the Storage field of
    the same node stays strict."""
    for profile in (E, S, C, L):
        validator = _source_bound(profile=profile)
        for value in ("2026-01-01t00:00:00z", "2026-01-01T00:00:00+05:30", "2026-01-01T00:00:00-00:00",
                      "2026-01-01T00:00:00.1234567890123456789012345Z", "2017-01-01T05:29:60+05:30"):
            if [e for e in _source_errors(validator, value) if e[1] == ("occurred_at_utc",)] != []:
                return False
        if [e for e in _source_errors(validator, "not-a-time") if e[1] == ("occurred_at_utc",)] != \
                [("format", ("occurred_at_utc",), "date_time_syntax")]:
            return False
        if validator.is_valid({"observed_at_utc": "2026-01-01T00:00:00+00:00", "occurred_at_utc": "2026-01-01T00:00:00Z"}):
            return False
    return True


@check("datetime_unit_source_composition_classification_keyed")
def _source_classification_keyed(context):
    """Only an EventRecord node composes the source predicate: the same node classified otherwise does not, and a
    node with the original's own format still refuses (and does not double-count its refusal code)."""
    others = all(_source_errors(_source_bound(c), "not-a-time") == [] for c in
                 ("event_record_index", "original_storage_fields", "Storage issued original fields", None))
    schema = copy.deepcopy(UNTYPED_SOURCE)
    owner = dict(_source_row(schema, "other_owner_observation"), profile="owner_schema")
    owned = _bound(schema, selection=_selection([(schema, {"": owner})]))
    others = others and _source_errors(owned, "not-a-time") == [] and owned.is_valid(
        {"observed_at_utc": "2026-01-01T00:00:00+05:30", "occurred_at_utc": "not-a-time"})
    formatted = copy.deepcopy(UNTYPED_SOURCE)
    formatted["properties"]["occurred_at_utc"] = {"type": "string", "format": "date-time"}
    return (others and _source_errors(_source_bound(), "not-a-time") ==
            [("format", ("occurred_at_utc",), "date_time_syntax")] and
            _source_errors(_source_bound(schema=formatted), "not-a-time") ==
            [("format", ("occurred_at_utc",), "date_time_syntax")] and
            _source_errors(_source_bound(schema=formatted), "2026-01-01t00:00:00+05:30") == [])


@check("datetime_unit_source_composition_absent_field")
def _source_absent(context):
    """The composition constrains a present field only; requiring it stays with the original."""
    return _source_bound().is_valid({"observed_at_utc": "2026-01-01T00:00:00Z"})


@check("datetime_unit_composition_error_path_nested")
def _composition_path_nested(context):
    """A composed error carries its fragment's own path when the classified node is reached inline under a property
    and an array item, and through a reference, for the source field and the Storage field alike."""
    from referencing import Registry, Resource
    from referencing.jsonschema import DRAFT202012
    _, inv, _, _ = _mods()
    node = {"type": "object", "properties": {"occurred_at_utc": {}, "observed_at_utc": {"type": "string"}}}
    wrapper = {"$schema": D202012, "$id": "urn:pm:scratch:nested-source", "type": "object",
               "properties": {"batch": {"type": "array", "items": {"properties": {"event": node}}}}}
    pointer = "/properties/batch/items/properties/event"
    inline = _bound(wrapper, selection=_selection([(wrapper, {pointer: _source_row(wrapper, pointer=pointer)})]))
    registry = Registry().with_resource(wrapper["$id"], Resource.from_contents(wrapper, default_specification=DRAFT202012))
    referenced = _bound({"properties": {"outer": {"$ref": wrapper["$id"]}}}, registry,
                        _selection([(wrapper, {pointer: _source_row(wrapper, pointer=pointer)})]))
    event = {"occurred_at_utc": "not-a-time", "observed_at_utc": "2026-01-01T00:00:00+00:00"}
    paths = sorted(tuple(e.absolute_path) for e in inline.iter_errors({"batch": [{"event": event}]}))
    through = sorted(tuple(e.absolute_path) for e in referenced.iter_errors({"outer": {"batch": [{"event": event}]}}))
    return (paths == [("batch", 0, "event", "observed_at_utc"), ("batch", 0, "event", "occurred_at_utc")] and
            through == [("outer",) + p for p in paths])


# P2. The configuration is verified at use. Each route below leaves construction alone or goes around it, and every
# one raises at the next use; each check also shows the untouched validator still validates.

def _use_reason(validator, instance=None):
    """The refusal code a use raises, or None when it validates."""
    _, inv, _, _ = _mods()
    instance = {"t": "not-a-dateZ"} if instance is None else instance
    try:
        validator.is_valid(instance)
    except inv.DatetimeAdmissionError as error:
        return error.reason
    except Exception as error:  # noqa: BLE001
        return "exception:" + type(error).__name__
    return None


def _use_refused(change, code, instance=None, *, fresh=_bound_timestamp):
    """A route: change() edits a fresh bound validator and returns the validator to use; the use must raise code.

    An instance that reaches no reference or property (a non-object, or {}) makes the entry check the only one that
    can refuse: a resolver's base URI is pushed onto the dynamic scope of every resolver derived from it, and the
    validator's own first steps are step-checked too, so those later checks would repeat the same code."""
    def run(context):
        validator = fresh()
        if not _still_checks(validator):
            return False
        try:
            target = change(validator)
        except Exception:  # noqa: BLE001 - a route that cannot be taken proves nothing
            return False
        return _use_reason(target, instance) == code
    return run


def _put(validator, name, value):
    """Assign around the bound __setattr__ (a slot or the instance dictionary), as object.__setattr__ does."""
    object.__setattr__(validator, name, value)
    return validator


def _resolver_with(validator, **registry_changes):
    import attrs
    resolver = validator._resolver
    return attrs.evolve(resolver, registry=attrs.evolve(resolver._registry, **registry_changes))


def _checker_clone(checker):
    """Another checker object of the gate's class, with the same table object: only its identity differs."""
    clone = type(checker).__new__(type(checker))
    object.__setattr__(clone, "checkers", checker.checkers)
    object.__setattr__(clone, "_fixed", True)
    return clone


def _other_uri_resource():
    from referencing import Resource
    from referencing.jsonschema import DRAFT202012
    return Resource({}, DRAFT202012)


USE_ROUTES = {
    # binding and marker
    "binding_plain_tuple": (lambda v: v.__dict__.__setitem__("datetime_binding", tuple(v.datetime_binding)) or v,
                            "datetime_validator_use_binding"),
    "binding_pins_not_pins": (lambda v: v.__dict__.__setitem__("datetime_binding", _mods()[0]._Binding(
        *v.datetime_binding[:3], pins=__import__("types").SimpleNamespace(**{
            k: getattr(v.datetime_binding.pins, k) for k in _mods()[0]._Pins.__slots__ if k != "__weakref__"}))) or v,
        "datetime_validator_use_binding"),
    "binding_pins_unissued": (lambda v: v.__dict__.__setitem__("datetime_binding", _mods()[0]._Binding(
        *v.datetime_binding[:3], pins=_mods()[0]._Pins.__new__(_mods()[0]._Pins))) or v,
        "datetime_validator_use_binding"),
    "binding_entry_checker": (lambda v: v.__dict__.__setitem__("datetime_binding", _mods()[0]._Binding(
        _mods()[0].format_checker(), *v.datetime_binding[1:])) or v, "datetime_validator_use_binding_entries"),
    "binding_entry_registry": (lambda v: v.__dict__.__setitem__("datetime_binding", _mods()[0]._Binding(
        v.datetime_binding[0], _foreign_resolver()._registry, *v.datetime_binding[2:])) or v,
        "datetime_validator_use_binding_entries"),
    "binding_entry_selection": (lambda v: v.__dict__.__setitem__("datetime_binding", _mods()[0]._Binding(
        *v.datetime_binding[:2], _selection(), v.datetime_binding[3])) or v, "datetime_validator_use_binding_entries"),
    "marker_deleted": (lambda v: object.__delattr__(v, "_datetime_fixed") or v, "datetime_validator_use_marker", 5),
    "marker_false": (lambda v: v.__dict__.__setitem__("_datetime_fixed", False) or v, "datetime_validator_use_marker"),
    # T189's exact route around the deletion guard: delete the marker, then reassign the checker normally.
    "t189_marker_then_checker": (lambda v: (object.__delattr__(v, "_datetime_fixed"), setattr(v, "format_checker", None),
                                            v)[2], "datetime_validator_use_marker"),
    # dialect and shadowing
    "dialect_subclass": (lambda v: _put(v, "__class__", type("Sub", (type(v),), {})), "datetime_validator_use_dialect"),
    "shadow_iter_errors": (lambda v: _put(v, "iter_errors", lambda *a, **k: iter(())), "datetime_validator_use_shadowed"),
    "shadow_type_checker": (lambda v: _put(v, "TYPE_CHECKER", type(v).TYPE_CHECKER), "datetime_validator_use_shadowed"),
    # checker
    "checker_object_setattr": (lambda v: _put(v, "format_checker", _stock_checker()),
                               "datetime_validator_use_format_checker"),
    "checker_other_profile": (lambda v: _put(v, "format_checker", _mods()[0].format_checker(profile=S)),
                              "datetime_validator_use_format_checker"),
    "checker_class_changed": (lambda v: _put(v.format_checker, "__class__", type(_stock_checker())) and v,
                              "datetime_validator_use_format_checker"),
    "checker_check_shadowed": (lambda v: _put(v.format_checker, "check", lambda *a: None) and v,
                               "datetime_validator_use_format_checker"),
    "checker_table_replaced": (lambda v: _put(v.format_checker, "checkers", __import__("types").MappingProxyType(
        dict(v.format_checker.checkers))) and v, "datetime_validator_use_format_checker"),
    "checker_table_entry_edited": (lambda v: __import__("gc").get_referents(v.format_checker.checkers)[0].__setitem__(
        "date-time", (lambda value: True, ())) or v, "datetime_validator_use_format_checker"),
    # resolver and registries
    "ref_resolver_installed": (lambda v: _put(v, "_ref_resolver", _legacy_resolver()), "datetime_validator_use_ref_resolver"),
    "registry_substituted": (lambda v: _put(v, "_registry", _foreign_resolver()._registry), "datetime_validator_use_registry"),
    "closed_registry_retrieval_edited": (lambda v: _put(v._registry, "_retrieve", lambda uri: None) and v,
                                         "datetime_validator_use_retrieval"),
    "resolver_not_a_resolver": (lambda v: _put(v, "_resolver", __import__("types").SimpleNamespace(**{
        "_registry": v._resolver._registry, "_base_uri": v._resolver._base_uri, "_previous": v._resolver._previous})),
        "datetime_validator_use_resolver"),
    "resolver_registry_type": (lambda v: _put(v, "_resolver", __import__("attrs").evolve(
        v._resolver, registry=__import__("types").SimpleNamespace(_retrieve=v._resolver._registry._retrieve))),
        "datetime_validator_use_registry_type"),
    "resolver_retrieval": (lambda v: _put(v, "_resolver", _resolver_with(v, retrieve=lambda uri: None)),
                           "datetime_validator_use_retrieval"),
    "resolver_uncrawled": (lambda v: _put(v, "_resolver", _resolver_with(
        v, uncrawled=v._resolver._registry._uncrawled.insert("urn:pm:scratch:ts"))), "datetime_validator_use_uncrawled"),
    "resolver_resource_removed": (lambda v: _put(v, "_resolver", _resolver_with(
        v, resources=v._resolver._registry._resources.remove("urn:pm:scratch:ts"))),
        "datetime_validator_use_resource_map"),
    "checker_clone_same_table": (lambda v: _put(v, "format_checker", _checker_clone(v.format_checker)),
                                 "datetime_validator_use_format_checker"),
    "resolver_resource_added": (lambda v: _put(v, "_resolver", _resolver_with(
        v, resources=v._resolver._registry._resources.insert("urn:pm:scratch:extra", _other_uri_resource()))),
        "datetime_validator_use_resource_map"),
    "resolver_base_unpinned": (lambda v: _put(v, "_resolver", __import__("attrs").evolve(
        v._resolver, base_uri="urn:pm:scratch:unpinned")), "datetime_resource_not_preloaded", {}),
    "resolver_scope_unpinned": (lambda v: _put(v, "_resolver", __import__("attrs").evolve(
        v._resolver, previous=v._resolver._previous.push_front("urn:pm:scratch:unpinned"))),
        "datetime_resource_not_preloaded"),
    # selection
    "selection_substituted": (lambda v: v.__dict__.__setitem__("storage_selection", _selection()) or v,
                              "datetime_validator_use_selection"),
    "selection_class_changed": (lambda v: _put(v.storage_selection, "__class__", type(
        "Sub", (type(v.storage_selection),), {})) and v, "datetime_validator_use_selection"),
    "selection_uri_pins_edited": (lambda v: v.storage_selection.uri_pins.__setitem__("urn:pm:scratch:extra", "0") or v,
                                  "datetime_validator_use_selection_pins"),
    "selection_resource_dropped": (lambda v: v.storage_selection.resources.popitem() and v,
                                   "datetime_validator_use_selection_resources"),
}


for _name, _route in USE_ROUTES.items():
    check("datetime_unit_use_%s_refused" % _name)(_use_refused(*_route))


def _anchored_bound():
    """A bound validator whose closed registry holds two resources with two anchors each, so the registry walks have
    items past their first."""
    from referencing import Registry, Resource
    from referencing.jsonschema import DRAFT202012
    first = {"$id": "urn:pm:scratch:a", "$defs": {"x": {"$anchor": "x", "type": "string", "format": "date-time"},
                                                    "y": {"$anchor": "y", "type": "string"}}}
    second = {"$id": "urn:pm:scratch:b", "$defs": {"p": {"$anchor": "p", "type": "string", "format": "date-time"},
                                                     "q": {"$anchor": "q"}}}
    registry = Registry().with_resources((s["$id"], Resource.from_contents(s, default_specification=DRAFT202012))
                                         for s in (first, second))
    return _bound({"properties": {"t": {"$ref": "urn:pm:scratch:a#x"}, "u": {"$ref": "urn:pm:scratch:b#p"}}}, registry)


def _each_entry_refused(entries, change, code):
    """change(validator, key) edits one entry; every entry, in turn, must be refused with code."""
    def run(context):
        count = len(entries(_anchored_bound()))
        if count < 2:
            return False
        for position in range(count):
            validator = _anchored_bound()
            if validator.is_valid({"t": "not-a-dateZ"}) or not validator.is_valid({"t": "2026-01-01T00:00:00Z"}):
                return False
            key = entries(validator)[position]
            if _use_reason(change(validator, key), {"t": "2026-01-01T00:00:00Z"}) != code:
                return False
        return True
    return run


def _swap_resource(validator, uri, make):
    resources = validator._resolver._registry._resources
    return _put(validator, "_resolver", _resolver_with(validator, resources=resources.insert(uri, make(resources[uri]))))


def _swap_anchor(validator, key, make):
    anchors = validator._resolver._registry._anchors
    return _put(validator, "_resolver", _resolver_with(validator, anchors=anchors.insert(key, make(anchors[key]))))


def _renamed_resource(validator, uri):
    resources = validator._resolver._registry._resources
    moved = resources.remove(uri).insert(uri + ":moved", resources[uri])
    return _put(validator, "_resolver", _resolver_with(validator, resources=moved))


def _anchor_kind(anchor):
    from referencing.jsonschema import DynamicAnchor
    from referencing import Anchor
    return (Anchor(name=anchor.name, resource=anchor.resource) if type(anchor) is not Anchor else
            DynamicAnchor(name=anchor.name, resource=anchor.resource))


_RESOURCE_URIS = lambda v: sorted(v._resolver._registry._resources)
_ANCHOR_KEYS = lambda v: sorted(v._resolver._registry._anchors)
EACH_ROUTES = {
    "resource_contents": (_RESOURCE_URIS, lambda v, k: _swap_resource(
        v, k, lambda r: __import__("referencing").Resource(copy.deepcopy(r.contents), r._specification)),
        "datetime_validator_use_resource_map"),
    "resource_specification": (_RESOURCE_URIS, lambda v, k: _swap_resource(
        v, k, lambda r: __import__("referencing").Resource(r.contents, __import__("attrs").evolve(r._specification))),
        "datetime_validator_use_resource_map"),
    "resource_renamed": (_RESOURCE_URIS, _renamed_resource, "datetime_validator_use_resource_map"),
    "anchor_kind": (_ANCHOR_KEYS, lambda v, k: _swap_anchor(v, k, _anchor_kind), "datetime_validator_use_anchors"),
    "anchor_name": (_ANCHOR_KEYS, lambda v, k: _swap_anchor(v, k, lambda a: __import__("attrs").evolve(
        a, name=a.name + "-renamed")), "datetime_validator_use_anchors"),
    "anchor_resource": (_ANCHOR_KEYS, lambda v, k: _swap_anchor(v, k, lambda a: __import__("attrs").evolve(
        a, resource=__import__("referencing").Resource(copy.deepcopy(a.resource.contents), a.resource._specification))),
        "datetime_validator_use_anchors"),
    "anchor_rekeyed": (_ANCHOR_KEYS, lambda v, k: _put(v, "_resolver", _resolver_with(
        v, anchors=v._resolver._registry._anchors.remove(k).insert((k[0], k[1] + "-rekeyed"),
                                                                   v._resolver._registry._anchors[k]))),
        "datetime_validator_use_anchors"),
    "anchor_added": (lambda v: [None, None], lambda v, k: _put(v, "_resolver", _resolver_with(
        v, anchors=v._resolver._registry._anchors.insert(("urn:pm:scratch:a", "z"), next(iter(
            v._resolver._registry._anchors.values()))))), "datetime_validator_use_anchors"),
    "selection_resource_entry": (lambda v: list(v.storage_selection.resources),  # keys are this validator's ids
                                 lambda v, k: v.storage_selection.resources.__setitem__(
                                     k, _copied_pair(v.storage_selection.resources[k])) or v,
                                 "datetime_validator_use_selection_resources"),
}


def _copied_pair(entry):
    """An equal entry that is another object."""
    return entry[0], entry[1]
for _name, (_entries, _change, _code) in EACH_ROUTES.items():
    check("datetime_unit_use_each_%s_refused" % _name)(_each_entry_refused(_entries, _change, _code))


def _storage_bound():
    schema = _storage_schema()
    return schema, _bound(schema, selection=_selection([(schema, {"": _storage_row(schema)})]))


def _two_node_bound():
    """A bound validator whose selection admits two Storage nodes, for the walk over every node entry."""
    _, inv, _, _ = _mods()
    schema = {"$schema": D202012, "$id": "urn:pm:scratch:two-nodes", "type": "object",
              "properties": {"a": {"type": "object", "properties": {"observed_at_utc": {"type": "string"}}},
                             "b": {"type": "object", "properties": {"observed_at_utc": {"type": "string"},
                                                                     "persisted_at_utc": {"type": "string"}}}}}
    rows = {}
    for name in ("a", "b"):
        node = schema["properties"][name]
        rows["/properties/" + name] = dict(_storage_row(schema), pointer="/properties/" + name,
                                           fields=sorted(f for f in node["properties"]), node_sha256=inv.digest(node))
    return _bound(schema, selection=_selection([(schema, rows)]))


@check("datetime_unit_use_each_selection_node_entry_refused")
def _use_each_node_entry(context):
    """Each node entry of the selection, in turn, replaced by an equal entry that is another object, is refused."""
    keys = list(_two_node_bound().storage_selection.nodes)
    if len(keys) != 2:
        return False
    for position in range(len(keys)):
        validator = _two_node_bound()
        if validator.is_valid({"a": {"observed_at_utc": "2026-01-01T00:00:00+00:00"}}):
            return False
        nodes = validator.storage_selection.nodes
        key = list(nodes)[position]
        nodes[key] = _copied_pair(nodes[key])
        if _use_reason(validator, {"a": {"observed_at_utc": "2026-01-01T00:00:00Z"}}) != \
                "datetime_validator_use_selection_nodes":
            return False
    return True


@check("datetime_unit_use_selection_nodes_refused")
def _use_selection_nodes(context):
    """A node entry dropped, or a row whose profile, fields, digest or classification is edited in place, is refused at
    use: removing the Storage overlay that way cannot reach a validation."""
    for edit in (lambda row: row.__setitem__("profile", "owner_schema"), lambda row: row.__setitem__("fields", []),
                 lambda row: row.__setitem__("node_sha256", "0" * 64),
                 lambda row: row.__setitem__("classification", "EventRecord"), None):
        _, validator = _storage_bound()
        nodes = validator.storage_selection.nodes
        if edit is None:
            nodes.clear()
        else:
            edit(next(iter(nodes.values()))[1])
        if _use_reason(validator, {"observed_at_utc": "2026-01-01T00:00:00+00:00"}) != \
                "datetime_validator_use_selection_nodes":
            return False
    return True


@check("datetime_unit_use_class_tables_refused")
def _use_class_tables(context):
    """The bound class's keyword table and type checker are the dialect: editing either is refused at use, and
    restoring them restores validation."""
    validator = _bound_timestamp()
    cls = type(validator)
    saved_format, saved_checker = cls.VALIDATORS["format"], cls.TYPE_CHECKER
    try:
        del cls.VALIDATORS["format"]
        dropped = _use_reason(validator)
        cls.VALIDATORS["format"] = saved_format
        type.__setattr__(cls, "TYPE_CHECKER", saved_checker.redefine("string", lambda checker, instance: True))
        retyped = _use_reason(validator)
    finally:
        cls.VALIDATORS["format"] = saved_format
        type.__setattr__(cls, "TYPE_CHECKER", saved_checker)
    return (dropped == retyped == "datetime_validator_use_dialect" and _still_checks(validator))


@check("datetime_unit_use_assignment_shadow_refused")
def _use_assignment_shadow(context):
    """Ordinary assignment cannot shadow a method or class table either (TypeError), and an ordinary attribute
    still assigns; is_valid and validate use the class's own iter_errors, so a shadow put in the instance
    dictionary is refused at use rather than run."""
    _, inv, _, _ = _mods()
    validator = _bound_timestamp()
    names = ("iter_errors", "is_valid", "validate", "descend", "VALIDATORS", "TYPE_CHECKER", "evolve", "schema")
    if any(_type_error(lambda n=n: setattr(validator, n, None)) != "datetime_validator_fixed: " + n for n in names):
        return False
    validator.note = 1
    shadowed = _put(_bound_timestamp(), "iter_errors", lambda *a, **k: iter(()))
    try:
        shadowed.validate({"t": "not-a-dateZ"})
    except inv.DatetimeAdmissionError as error:
        validated = error.reason
    else:
        validated = None
    return validator.note == 1 and _still_checks(validator) and validated == "datetime_validator_use_shadowed"


# The test's own list of the attributes a bound validator never reassigns or deletes (T166, T189, fix round 18).
FIXED_NAMES = ("format_checker", "_registry", "_resolver", "_ref_resolver", "storage_selection", "datetime_binding",
               "_datetime_fixed")


@check("datetime_unit_validate_raises_first_error")
def _validate_raises(context):
    """validate raises the first error of the class's own iter_errors, and returns None for a valid instance."""
    from jsonschema import ValidationError
    validator = _bound_timestamp()
    try:
        validator.validate({"t": "not-a-dateZ"})
    except ValidationError as error:
        raised = (error.validator, tuple(error.absolute_path))
    else:
        raised = None
    return raised == ("format", ("t",)) and validator.validate({"t": "2026-01-01T00:00:00Z"}) is None


@check("datetime_unit_use_deletion_refused")
def _use_deletion(context):
    """T189: the marker and each fixed attribute cannot be deleted (TypeError), so the checker stays fixed after an
    attempt; an ordinary attribute still deletes."""
    _, inv, _, _ = _mods()
    validator = _bound_timestamp()
    validator.note = 1
    del validator.note
    if any(_type_error(lambda n=n: delattr(validator, n)) != "datetime_validator_fixed: " + n
           for n in FIXED_NAMES):
        return False
    return (_type_error(lambda: setattr(validator, "format_checker", None)) ==
            "datetime_validator_fixed: format_checker" and _still_checks(validator))


@check("datetime_unit_use_marker_assignment_refused")
def _use_marker_assignment(context):
    """The marker cannot be reassigned either."""
    validator = _bound_timestamp()
    return (_type_error(lambda: setattr(validator, "_datetime_fixed", False)) == "datetime_validator_fixed: _datetime_fixed"
            and _still_checks(validator))


@check("datetime_unit_use_copy_refused")
def _use_copy(context):
    """copy.copy builds an instance without the binding: its use is refused. deepcopy cannot copy the checker table."""
    validator = _bound_timestamp()
    return (_use_reason(copy.copy(validator)) == "datetime_validator_use_binding" and
            _type_error(lambda: copy.deepcopy(validator)) is not None and _still_checks(validator))


@check("datetime_unit_use_resumed_run_reverified")
def _use_resumed(context):
    """A run that yielded an error re-verifies before it resumes: a checker swapped while it was suspended raises at
    the next step, and a descend called directly meanwhile is its own entry point and is verified too."""
    _, inv, _, _ = _mods()
    validator = _bound_timestamp()
    run = validator.iter_errors({"t": "not-a-dateZ", "u": 1})
    first = next(run)
    saved = validator.format_checker
    _put(validator, "format_checker", _stock_checker())
    try:
        next(run)
    except inv.DatetimeAdmissionError as error:
        resumed = error.reason
    else:
        resumed = None
    direct = _admission_reason(lambda: list(validator.descend({"t": "not-a-dateZ"}, validator.schema)))
    _put(validator, "format_checker", saved)
    return (first.validator == "format" and resumed == direct == "datetime_validator_use_format_checker" and
            _still_checks(validator))


@check("datetime_unit_use_nested_step_verified")
def _use_nested_step(context):
    """Inside a verified run, an evolved validator that carries another checker, a legacy resolver, another registry,
    another selection, no marker, or an unverified class is refused at its first step."""
    dt, inv, _, _ = _mods()
    validator = _bound_timestamp()
    routes = [("format_checker", _stock_checker(), "datetime_validator_use_step"),
              ("_ref_resolver", _legacy_resolver(), "datetime_validator_use_step"),
              ("_registry", _foreign_resolver()._registry, "datetime_validator_use_step"),
              ("storage_selection", _selection(), "datetime_validator_use_step")]
    results = []
    for name, value, code in routes:
        clone = validator.evolve()
        _put(clone, name, value) if name != "storage_selection" else clone.__dict__.__setitem__(name, value)
        results.append(_nested_reason(validator, clone) == code)
    unmarked = validator.evolve()
    object.__delattr__(unmarked, "_datetime_fixed")
    results.append(_nested_reason(validator, unmarked) == "datetime_validator_use_marker")
    sub = _put(validator.evolve(), "__class__", type("Sub", (type(validator),), {}))
    results.append(_nested_reason(validator, sub) == "datetime_validator_use_dialect")
    rescoped = _put(validator.evolve(), "_resolver", __import__("attrs").evolve(
        validator._resolver, base_uri="urn:pm:scratch:unpinned"))
    results.append(_nested_reason(validator, rescoped) == "datetime_resource_not_preloaded")
    from referencing import Registry
    explicit = _nested_reason(validator, validator.evolve(), resolver=Registry().resolver("urn:pm:scratch:unpinned"))
    results.append(explicit == "datetime_resource_not_preloaded")
    rebuilt = _nested_reason(validator, validator.evolve(), resolver=__import__("attrs").evolve(
        validator._resolver, registry=__import__("attrs").evolve(validator._resolver._registry, retrieve=lambda u: None)))
    results.append(rebuilt == "datetime_validator_use_retrieval")
    results.append(_nested_reason(validator, validator.evolve()) is None)
    return all(results) and _still_checks(validator)


def _nested_reason(outer, inner, resolver=None):
    """The refusal code of inner.descend run as a step of a verified run of outer, or None."""
    dt, inv, _, _ = _mods()
    run = dt._verify_use(outer)
    runs = dt._runs()
    runs.append(run)
    try:
        list(inner.descend({"t": "2026-01-01T00:00:00Z"}, {"type": "object"}, resolver=resolver))
    except inv.DatetimeAdmissionError as error:
        return error.reason
    except Exception as error:  # noqa: BLE001
        return "exception:" + type(error).__name__
    finally:
        runs.pop()
    return None


@check("datetime_unit_use_pins_fixed")
def _use_pins_fixed(context):
    """The pins of a binding, and of each of its registries, cannot be assigned or deleted."""
    validator = _bound_timestamp()
    pins = validator.datetime_binding.pins
    return (_type_error(lambda: setattr(pins, "checker", None)) == "datetime_validator_pins_fixed: checker" and
            _type_error(lambda: delattr(pins, "checker")) == "datetime_validator_pins_fixed: checker" and
            _type_error(lambda: setattr(pins.closed, "retrieve", None)) == "datetime_validator_pins_fixed: retrieve" and
            _type_error(lambda: delattr(pins.combined, "resources")) == "datetime_validator_pins_fixed: resources" and
            _still_checks(validator))


@check("datetime_unit_use_forged_pins_refused_at_construction")
def _use_forged_pins(context):
    """A binding that pairs genuine pins with another checker, registry or selection, or that carries pins _bind
    never issued, is refused at construction (datetime_validator_binding_forged)."""
    dt, _, _, _ = _mods()
    validator = _bound_timestamp()
    checker, registry, selection, pins = validator.datetime_binding
    other = dt.format_checker()
    foreign = _foreign_resolver()._registry
    fresh = _selection()
    message = "datetime_validator_binding_forged"
    return (_type_error(lambda: validator.evolve(format_checker=other, datetime_binding=dt._Binding(
                other, registry, selection, pins))) == message and
            _type_error(lambda: validator.evolve(registry=foreign, datetime_binding=dt._Binding(
                checker, foreign, selection, pins))) == message and
            _type_error(lambda: validator.evolve(storage_selection=fresh, datetime_binding=dt._Binding(
                checker, registry, fresh, pins))) == message and
            _type_error(lambda: validator.evolve(datetime_binding=dt._Binding(checker, registry, selection))) == message and
            _type_error(lambda: validator.evolve(datetime_binding=dt._Binding(
                checker, registry, selection, dt._Pins.__new__(dt._Pins)))) == message and
            _still_checks(validator))


@check("datetime_unit_use_resolver_map_refused_at_construction")
def _use_resolver_map_construction(context):
    """A resolver over another registry object that reads a different resource map is refused at construction, for
    each kind of difference; a crawled copy of the same map is accepted and validates normally."""
    import attrs
    validator = _bound_timestamp()
    registry = validator._resolver._registry
    variants = {
        "datetime_validator_use_uncrawled": registry.with_resource("urn:pm:scratch:ts", _other_uri_resource()),
        "datetime_validator_use_resource_map": attrs.evolve(registry, resources=registry._resources.insert(
            "urn:pm:scratch:ts", _other_uri_resource())),
        "datetime_validator_use_anchors": attrs.evolve(registry, anchors=registry._anchors.remove(
            next(iter(registry._anchors)))),
    }
    for code, changed in variants.items():
        if _type_error(lambda c=changed: validator.evolve(_resolver=attrs.evolve(validator._resolver, registry=c))) != \
                "datetime_validator_fixed_resolver: " + code:
            return False
    crawled = validator.evolve(_resolver=attrs.evolve(validator._resolver, registry=registry.crawl()))
    return crawled._resolver._registry is not registry and _still_checks(crawled) and _still_checks(validator)


EVENT_RECORD_PATH = "Plans/event_record.schema.json"


def _committed_eventrecord(context):
    """datetime_validator over a neutral reference to the committed EventRecord schema, preloaded, and the committed
    receipt fixture's base_original_event: the gate review's finding 2 setup."""
    from referencing import Registry, Resource
    dt, _, _, _ = _mods()
    schema = json.loads((context.root / EVENT_RECORD_PATH).read_text())
    fixture = json.loads((context.root / "Plans/event_append_receipt_full_value_fixtures.json").read_text())
    validator = dt.datetime_validator({"$ref": schema["$id"]},
                                      registry=Registry().with_resource(schema["$id"], Resource.from_contents(schema)))
    return schema, validator, fixture["base_original_event"]


@check("datetime_validator_real_eventrecord_resolver_map_refused", slow=True)
def _real_resolver_map(context):
    """The gate review's finding 2 input, unchanged: a resolver whose registry maps the pinned EventRecord URI to an
    empty schema, keeping the bound retrieval callback, passed through evolve(_resolver=...), is refused at
    construction; installed around construction it is refused at use; and the intact validator still accepts the
    committed event and refuses observed_at_utc="not-a-time"."""
    import attrs
    from referencing import Resource
    from referencing.jsonschema import DRAFT202012
    _, inv, _, _ = _mods()
    schema, validator, event = _committed_eventrecord(context)
    bad = dict(copy.deepcopy(event), observed_at_utc="not-a-time")
    replacement = validator._registry.with_resource(schema["$id"], Resource({}, DRAFT202012))
    resolver = attrs.evolve(validator._resolver, registry=replacement)
    constructed = _type_error(lambda: validator.evolve(_resolver=resolver))
    around = _put(validator.evolve(), "_resolver", resolver)
    return (validator.is_valid(event) and not validator.is_valid(bad) and
            resolver._registry._retrieve is validator._registry._retrieve and
            constructed is not None and constructed.startswith("datetime_validator_fixed_resolver: ") and
            _use_reason(around, bad) is not None and _use_reason(around, bad).startswith("datetime_validator_use_") and
            validator.is_valid(event) and not validator.is_valid(bad))


@check("datetime_validator_real_eventrecord_preloaded_controls", slow=True)
def _real_preloaded_controls(context):
    """Controls on the committed EventRecord: an ordinarily preloaded resource map validates normally (the committed
    event valid, each malformed timestamp field refused), and an evolve that changes only the schema still validates
    and still checks timestamps, through the same pins."""
    schema, validator, event = _committed_eventrecord(context)
    evolved = validator.evolve(schema={"$ref": schema["$id"]})
    for candidate in (validator, evolved):
        if not candidate.is_valid(event):
            return False
        for field in ("occurred_at_utc", "observed_at_utc", "persisted_at_utc"):
            if candidate.is_valid(dict(event, **{field: "not-a-time"})):
                return False
        if candidate.is_valid(dict(event, observed_at_utc="2026-01-01T00:00:00+00:00")):
            return False
        if not candidate.is_valid(dict(event, occurred_at_utc="2026-01-01t00:00:00+05:30")):
            return False
    return evolved.datetime_binding is validator.datetime_binding and evolved.format_checker is validator.format_checker


@check("datetime_validator_real_eventrecord_in_place_edits_refused", slow=True)
def _real_in_place(context):
    """In-place edits of the committed EventRecord configuration after construction are refused at use: the bound
    registry's resource replaced, its schema's date-time definition loosened, the selection's row for the root
    downgraded to owner_schema, and the selection's URI pins edited. Each validator is fresh; nothing committed is
    written."""
    import attrs
    from referencing import Resource
    from referencing.jsonschema import DRAFT202012
    _, inv, _, _ = _mods()
    results = []
    schema, validator, event = _committed_eventrecord(context)
    registry = validator._registry
    object.__setattr__(registry, "_resources", registry._resources.insert(schema["$id"], Resource({}, DRAFT202012)))
    results.append(_use_reason(validator, event) == "datetime_validator_use_resource_map")
    schema, validator, event = _committed_eventrecord(context)
    validator._registry.contents(schema["$id"])["$defs"]["date_time_string"].pop("format")
    results.append(_use_reason(validator, dict(event, occurred_at_utc="not-a-time")) ==
                   "datetime_schema_changed_after_admission")
    schema, validator, event = _committed_eventrecord(context)
    node, row = next(entry for entry in validator.storage_selection.nodes.values() if entry[1]["pointer"] == "")
    saved = row["profile"]
    try:
        row["profile"] = "owner_schema"
        results.append(_use_reason(validator, dict(event, observed_at_utc="2026-01-01T00:00:00+00:00")) ==
                       "datetime_validator_use_selection_nodes")
    finally:
        row["profile"] = saved
    schema, validator, event = _committed_eventrecord(context)
    validator.storage_selection.uri_pins.pop(schema["$id"])
    results.append(_use_reason(validator, event) == "datetime_validator_use_selection_pins")
    return all(results)


# STOP-T198: independently selected frozen recipes sharing a historical URI.
NESTED_FIXTURE = "scripts/pm_event_datetime_nested_resources.json"
NESTED_PATH = "Plans/dch_retained_recipes.json"
NESTED_SUFFIX = "/schemas/Plans~1event_record.schema.json"


@contextlib.contextmanager
def _nested_fixture(context):
    """Small scratch container of authentic INT2 schema values, never edited in place.

    The source container is 1.6 MB. Keep only the three EventRecord resources
    here, retaining each structural fingerprint and both real node controls.
    The scratch inventory pins this smaller container, with the same reviewed
    classifications and citations as the source; no committed Plans are written.
    """
    _, inv, _, _ = _mods()
    fixture = json.loads((context.root / NESTED_FIXTURE).read_text())
    assert all(inv.digest(value) == fingerprint for fingerprint, value in fixture["resources"].items())
    document = {"recipes": {name: {"schemas": {"Plans/event_record.schema.json":
                copy.deepcopy(fixture["resources"][fingerprint])}} for name, fingerprint in fixture["recipes"].items()}}
    rows = copy.deepcopy(fixture["rows"])
    for row in rows:
        row["resource_sha256"] = inv.digest(document)
    # Preserve the current schema's known URI pin as well: on 58c2816ff3 the
    # strict frozen edition collides with that known URI before any control.
    current = [r for r in context.inventory()["nodes"] if r["path"] == EVENT_RECORD_PATH]
    quote = next(c["quote"] for c in rows[0]["citation"] if "quote" in c)
    root = _gate_root(context, current + rows, files=[(NESTED_PATH, document), ("Plans/Contracts_V0.md", quote)])
    local = Context(root)
    local.cache["node_controls"] = (fixture["objects"],
        {(r["path"], r["origin"], r["pointer"]): r["control"] for r in fixture["controls"]}, fixture["controls"])
    saved, validate = inv.ROOT, inv.validate_inventory
    inv.resource_selections.cache_clear()
    try:
        inv.ROOT = root
        # validate_inventory's default root is bound at import, so route the
        # scratch selection through that same validator with an explicit root.
        inv.validate_inventory = lambda inventory, root=root: validate(inventory, root)
        yield local, rows, document, fixture
    finally:
        inv.ROOT, inv.validate_inventory = saved, validate
        inv.resource_selections.cache_clear()
        local.close()


def _nested_recipe(recipe):
    def run(context):
        _, inv, _, _ = _mods()
        with _nested_fixture(context) as (local, rows, document, fixture):
            pointer = "/recipes/" + recipe + NESTED_SUFFIX
            selected = [r for r in rows if r["pointer"] == pointer or r["pointer"].startswith(pointer + "/")]
            original = copy.deepcopy(document)
            for row in selected:
                if not _node_check(inv.node_key(row))(local):
                    return False
                validator = _node_validator(local, row)
                resource = inv.at(document, pointer)
                if validator.storage_selection.uri_pins.get(resource["$id"]) != fixture["recipes"][recipe]:
                    return False
            return len(selected) == 2 and document == original
    return run


for _recipe in ("raw-v1", "normalized-v2", "strict-v3"):
    check("datetime_nested_recipe_" + _recipe.replace("-", "_"))(_nested_recipe(_recipe))


@check("datetime_nested_scanner_selection_binding_agree")
def _nested_agree(context):
    _, inv, _, _ = _mods()
    with _nested_fixture(context) as (local, rows, document, fixture):
        scanned, errors = inv.scan(local.root)
        actual = {inv.node_key(row): row for row in scanned if row["path"] == NESTED_PATH}
        selections = inv.resource_selections()
        for row in rows:
            pointer = "/".join(row["pointer"].split("/")[:5])
            bound = actual[inv.node_key(row)]
            resource = inv.at(document, pointer)
            relative = row["pointer"][len(pointer):]
            if (bound["resource_pointer"] != pointer or bound["resource_sha256"] != inv.digest(resource) or
                    bound["resource_id"] != resource["$id"] or
                    selections[inv.digest(resource)][relative]["node_sha256"] != row["node_sha256"]):
                return False
        return not errors and len(actual) == 6 and inv.check_inventory(local.root)["status"] == "pass"


@check("datetime_nested_same_uri_without_binding_refused")
def _nested_unbound(context):
    from referencing import Registry, Resource
    from referencing.jsonschema import DRAFT202012
    dt, inv, _, _ = _mods()
    with _nested_fixture(context) as (local, rows, document, fixture):
        registry = Registry().with_resource("urn:pm:unbound-recipes", Resource(document, DRAFT202012))
        reason = _admission_reason(dt.datetime_validator, {"$ref": "urn:pm:unbound-recipes"}, registry=registry)
        return reason in ("datetime_resource_fingerprint_unclassified: " +
                         fixture["resources"][fixture["recipes"]["strict-v3"]]["$id"],
                         "datetime_resource_uri_conflict: " +
                         fixture["resources"][fixture["recipes"]["strict-v3"]]["$id"])


@check("datetime_nested_substituted_fingerprint_refused")
def _nested_substituted(context):
    dt, inv, _, _ = _mods()
    with _nested_fixture(context) as (local, rows, document, fixture):
        schema = copy.deepcopy(fixture["resources"][fixture["recipes"]["raw-v1"]])
        schema["title"] = "substituted unknown bytes"
        return _admission_reason(dt.datetime_validator, schema) == \
            "datetime_resource_fingerprint_unclassified: " + schema["$id"]


@check("datetime_nested_wrong_pointer_refused")
def _nested_wrong_pointer(context):
    with _nested_fixture(context) as (local, rows, document, fixture):
        row = next(r for r in rows if r["pointer"] == "/recipes/raw-v1" + NESTED_SUFFIX)
        # raw-v1 and normalized-v2 have identical bytes. A wrong binding must
        # still refuse: content equivalence cannot authorize another pointer.
        wrong = dict(row, resource_pointer="/recipes/normalized-v2" + NESTED_SUFFIX)
        return _admission_reason(_node_validator, local, wrong) == "datetime_resource_pointer_mismatch"


@check("datetime_nested_missing_pointer_refused")
def _nested_missing_pointer(context):
    with _nested_fixture(context) as (local, rows, document, fixture):
        wrong = dict(rows[0], resource_pointer="/recipes/missing" + NESTED_SUFFIX)
        return _admission_reason(_node_validator, local, wrong) == "datetime_resource_pointer_mismatch"


@check("datetime_nested_recipe_replaced_after_cache_refused")
def _nested_replaced_cached(context):
    _, inv, _, _ = _mods()
    with _nested_fixture(context) as (local, rows, document, fixture):
        row = next(r for r in rows if r["pointer"] == "/recipes/strict-v3" + NESTED_SUFFIX)
        _node_validator(local, row)
        loaded = inv._source_document(local.root, row, local.cache["node_documents"])
        loaded["recipes"]["strict-v3"]["schemas"]["Plans/event_record.schema.json"] = \
            copy.deepcopy(fixture["resources"][fixture["recipes"]["raw-v1"]])
        return _admission_reason(_node_validator, local, row) == "datetime_resource_binding_changed"


def _nested_bad_pin(field, value):
    def run(context):
        with _nested_fixture(context) as (local, rows, document, fixture):
            row = dict(rows[0], **{field: value})
            return _admission_reason(_node_validator, local, row) == "datetime_resource_binding_changed"
    return run


for _field, _value in (("resource_sha256", "0" * 64), ("node_sha256", "0" * 64), ("resource_id", "urn:wrong")):
    check("datetime_nested_changed_" + _field + "_refused")(_nested_bad_pin(_field, _value))


@check("datetime_nested_resource_pointer_boundaries")
def _nested_pointer_boundaries(context):
    _, inv, _, _ = _mods()
    prefix = "/recipes/raw-v1" + NESTED_SUFFIX
    return (inv.nested_resource_pointer(NESTED_PATH, prefix) == prefix and
            inv.nested_resource_pointer(NESTED_PATH, prefix + "/$defs/child\nname") == prefix and
            inv.nested_resource_pointer(NESTED_PATH, "/recipes/raw-v1/schemas") == "" and
            inv.nested_resource_pointer(NESTED_PATH, "/recipes/raw-v1/schemas/") == "" and
            inv.nested_resource_pointer(NESTED_PATH, "/recipes//schemas/schema") == "" and
            inv.nested_resource_pointer(NESTED_PATH, "/recipes/raw-v1/metadata/schema") == "" and
            inv.nested_resource_pointer("Plans/other.json", prefix) == "" and
            inv.nested_resource_pointer("Plans/storage_value_registry.json", "/families/x/schema/$defs/a") ==
            "/families/x/schema")


@check("datetime_nested_already_bound_resource")
def _nested_already_bound(context):
    _, inv, _, _ = _mods()
    with _nested_fixture(context) as (local, rows, document, fixture):
        pointer = "/recipes/raw-v1" + NESTED_SUFFIX
        resource = inv.at(document, pointer)
        row = dict(rows[0], resource_pointer=pointer, resource_id=resource["$id"], resource_sha256=inv.digest(resource))
        return inv.bind_nested_resource(row, document) == row
