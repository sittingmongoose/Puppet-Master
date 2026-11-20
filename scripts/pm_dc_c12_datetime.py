"""DC criterion-12 date-time corpus through the complete checker (PNC-019 C12-DC1; DC2 reuses it).

Every sample of the shared timestamp battery (scripts/pm_event_datetime_timestamp_battery.json) is placed at each
timestamp field a family owns, in that family's own valid probe, and the probe runs through the complete checker
(evaluate_probe) under its recorder. The expectation is composed only from the owner's schema pattern(s) at that
field (re.search, exactly as the schema row evaluates them) and the shared CV-1101 predicate
pm_event_datetime.date_time with the owner's profile:

- the owner pattern refuses the sample           -> the first refusal is the boundary's schema row;
- the pattern admits it, date_time refuses it    -> the first refusal is the field's date-time row;
- both admit it                                  -> neither of those two rows refuses (a later row may, for
                                                     example a join with an unchanged copy; it is recorded).

Fields: the payload family timestamp (PR03, STORAGE_UTC_Z) in both editions; EventRecord observed_at_utc and
persisted_at_utc (EV16, EV17, STORAGE_UTC_Z); the Collaborative Workflows owner-record created_at in a prepared
source (SO06, EVENT_RECORD), where the family's record carries one. occurred_at_utc is joined to the family
timestamp by EV13 and keeps its sweep part 2B witnesses (EV15); it is not part of this corpus run.
"""
import copy
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import pm_collaboration_events as dc  # noqa: E402
import pm_dc_c12_clauses as clauses  # noqa: E402
from pm_event_datetime import date_time, EVENT_RECORD, STORAGE_UTC_Z, Refusal  # noqa: E402

BATTERY = "scripts/pm_event_datetime_timestamp_battery.json"


# Lane supplement (not part of the shared battery): calendar and range defects that keep the RFC 3339 lexical form,
# so the owner patterns admit them and only the shared predicate can refuse them, plus one legitimate leap second.
CALENDAR_SUPPLEMENT = ["2026-02-29T00:00:00Z", "2026-02-30T00:00:00Z", "2026-13-01T00:00:00Z", "2026-01-00T00:00:00Z", "2026-01-01T24:00:00Z",
                       "2026-01-01T23:60:00Z", "2026-01-01T23:59:60Z", "2026-04-31T12:00:00Z", "2016-12-31T23:59:60Z", "2024-02-29T00:00:00Z",
                       "2026-01-01T24:00:00.000000000Z", "2026-06-30T23:59:60.5Z"]


def samples():
    battery = [s["value"] for s in json.loads((ROOT / BATTERY).read_text(encoding="utf-8"))["samples"]]
    return battery + [v for v in CALENDAR_SUPPLEMENT if v not in battery]


def shared_ok(value, profile):
    try:
        return date_time(value, profile=profile) == value
    except Refusal:
        return False


def patterns_at(uri, pointer, template):
    """Owner pattern groups at the field: one group per root edition branch (oneOf/i), each a conjunction."""
    groups = {}
    for s in clauses.inventory(uri, pointer):
        if s.template == template and s.keyword == "pattern" and all(c.startswith("oneOf/") for c in s.context[:1]) and len(s.context) <= 1:
            groups.setdefault(tuple(s.context), []).append(s.node["pattern"])
    return list(groups.values())


def check(probe, path, sample, schema_row, dt_row, pats, profile, coherent=None):
    mutated = copy.deepcopy(probe)
    node = mutated
    for k in path[:-1]:
        node = node[k]
    node[path[-1]] = sample
    for cpath in coherent or []:
        node = mutated
        for k in cpath[:-1]:
            node = node[k]
        node[cpath[-1]] = sample
    _, first, exc = clauses.route(mutated)
    # No owner pattern at the field: only the shared predicate decides (the schema has no lexical rule of its own there).
    pattern_ok = isinstance(sample, str) and (not pats or any(all(re.search(p, sample) for p in group) for group in pats))
    if not pattern_ok:
        expect = ("schema", schema_row)
    elif not shared_ok(sample, profile):
        expect = ("datetime", dt_row)
    else:
        expect = ("accepted_by_both", None)
    got = first[1] if first else None
    if expect[0] == "accepted_by_both":
        ok = exc is None and got not in (schema_row, dt_row)
    else:
        ok = exc is None and got == expect[1]
    return dict(sample=sample, expect=expect[0], expected_row=expect[1], first=list(first) if first else None, exception=exc, ok=ok)


def run(families):
    vals = samples()
    by = {}
    for p in clauses.all_probes():
        if p["expected"] is None:
            by.setdefault((clauses.family(p), p["domain"]), []).append(p)
    payload_uri = dc.load(dc.PAYLOAD_PATH)["$id"]
    er_uri = dc.load(dc.EVENT_RECORD_PATH)["$id"]
    src_uri = dc.load(dc.SOURCE_PATH)["$id"]
    out = []
    for et in families:
        ts = dc.FAMILY_TS[et]
        seen_editions = set()
        for p in by.get((et, "payload"), []):
            ed = dc.edition_of(p["value"])
            if ed in seen_editions or not p["case_id"].startswith("fixture:"):
                continue
            seen_editions.add(ed)
            pats = patterns_at(payload_uri, "#/$defs/" + dc.payload_def(et, ed), (ts,))
            for v in vals:
                out.append(dict(check(p, ("value", ts), v, "PS01_payload_schema", "PR03_family_timestamp", pats, STORAGE_UTC_Z),
                                family=et, field="payload." + ts, edition=ed, probe=p["case_id"]))
        env = [p for p in by.get((et, "envelope"), []) if not p["case_id"].startswith(("p2b:", "p2a:")) and "payload" in p["value"]
               and isinstance(p["value"]["payload"], dict)]
        for p in env[:2]:
            for field, row in (("observed_at_utc", "EV16_observed_at_format"), ("persisted_at_utc", "EV17_persisted_at_format")):
                pats = patterns_at(er_uri, "", (field,))
                for v in vals:
                    out.append(dict(check(p, ("value", field), v, "EV01_record_schema", row, pats, STORAGE_UTC_Z),
                                    family=et, field="event." + field, probe=p["case_id"]))
        src = [p for p in by.get((et, "source"), []) if "created_at" in p["value"]["owner_record"]]
        for p in src[:2]:
            pats = patterns_at(src_uri, "#/$defs/" + dc.TOKEN[et], ("owner_record", "created_at"))
            for v in vals:
                out.append(dict(check(p, ("value", "owner_record", "created_at"), v, "SO03_schema", "SO06_owner_times", pats, EVENT_RECORD),
                                family=et, field="source.owner_record.created_at", probe=p["case_id"]))
    bad = [r for r in out if not r["ok"]]
    return dict(status="pass" if not bad else "fail", runs=len(out), failures=bad[:50], failure_count=len(bad),
                by_expectation={k: sum(1 for r in out if r["expect"] == k) for k in ("schema", "datetime", "accepted_by_both")}, rows=out)
