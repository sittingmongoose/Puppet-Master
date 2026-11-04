#!/usr/bin/env python3
"""Static checker for the seven historical Goal reader fixtures (DL-045 depth, 2026-11-04).

Checks, for each of goal.child_status_changed, goal.degraded, goal.scheduled, goal.progressed,
goal.replanned, goal.stopped and goal.verification_decided:

* schema_cases validate (or fail) against the family's unchanged v2 payload schema as declared;
* reader_output_cases validate (or fail) against the family's own closed answer in
  Plans/goal_history_reader_outputs.schema.json, and a disclosed original_event carries a payload
  that is valid under the family's v2 payload schema;
* join_cases: the selector equals the disclosed EventRecord's project, event and sequence (and the
  payload goal_id where the selector has one);
* current_canon_cases follow SP-420 and the reader's own outcome rule: no verified_historical answer;
  an unresolved answer must name original_admission for SP-300..303 and is refused for
  SP-271/277/280, whose own rule returns unavailable;
* refusal_cases expect refused_before_dedupe with no effect.

No native reader, durability or runtime proof is claimed. Exit 0 when every case matches, 1 otherwise.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

try:
    import jsonschema
    from referencing import Registry, Resource
    from referencing.jsonschema import DRAFT202012
except ImportError as exc:  # pragma: no cover
    print(json.dumps({"status": "error", "reason": f"missing dependency: {exc}"}))
    sys.exit(2)

ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"
OUT_SCHEMA = PLANS / "goal_history_reader_outputs.schema.json"
ER_SCHEMA = PLANS / "event_record.schema.json"
CKPT_SCHEMA = PLANS / "event_record_index_checkpoint.schema.json"

# family key -> (event type, reader unit, outcome when original admission is unresolved)
FAMILIES = {
    "child_status": ("goal.child_status_changed", "SP-271", "unavailable"),
    "degraded": ("goal.degraded", "SP-277", "unavailable"),
    "scheduled": ("goal.scheduled", "SP-280", "unavailable"),
    "progressed": ("goal.progressed", "SP-300", "unresolved"),
    "replanned": ("goal.replanned", "SP-301", "unresolved"),
    "stopped": ("goal.stopped", "SP-302", "unresolved"),
    "verification_decided": ("goal.verification_decided", "SP-303", "unresolved"),
}
PAYLOAD_FILE = {
    "child_status": "goal_child_status_changed",
}


FORMAT_CHECKER = jsonschema.FormatChecker(formats=())


@FORMAT_CHECKER.checks("date-time")
def _utc_date_time(instance) -> bool:
    # Same UTC RFC 3339 rule as scripts/pm-plans-verify.py.
    if not isinstance(instance, str):
        return True
    return re.match(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$", instance) is not None


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def registry() -> Registry:
    resources = []
    for p in (OUT_SCHEMA, ER_SCHEMA, CKPT_SCHEMA):
        doc = load(p)
        resources.append((doc["$id"], Resource.from_contents(doc, default_specification=DRAFT202012)))
    return Registry().with_resources(resources)


def is_valid(validator, value) -> bool:
    return not list(validator.iter_errors(value))


def canon_admissible(outcome: str, answer: dict) -> bool:
    kind = answer.get("kind")
    if kind == "verified_historical":
        return False
    if kind == "unavailable":
        return True
    if kind == "unresolved_historical_validation":
        if outcome == "unavailable":
            return False
        return "original_admission" in answer.get("unresolved_obligations", [])
    return False


def joins_ok(answer: dict) -> bool:
    ev = answer.get("original_event")
    if ev is None:
        return True
    sel = answer["selector"]
    if sel.get("project_id") != ev.get("project_id"):
        return False
    if sel.get("event_id") != ev.get("event_id"):
        return False
    if sel.get("sequence_id") != ev.get("sequence_id"):
        return False
    if "goal_id" in sel and sel["goal_id"] != (ev.get("payload") or {}).get("goal_id"):
        return False
    return True


def main() -> int:
    reg = registry()
    out_doc = load(OUT_SCHEMA)
    failures: list[str] = []
    counts: dict[str, dict[str, int]] = {}
    for key, (event_type, unit, outcome) in FAMILIES.items():
        fx_path = PLANS / f"goal_{key}_history_contract_fixtures.json"
        fx = load(fx_path)
        c = counts.setdefault(event_type, {"schema": 0, "answer": 0, "join": 0, "canon": 0, "refusal": 0})
        if fx.get("event_type") != event_type:
            failures.append(f"{fx_path.name}: event_type {fx.get('event_type')!r} != {event_type!r}")
        payload_schema = load(PLANS / "event_payloads/goal_runtime" / f"{PAYLOAD_FILE.get(key, 'goal_' + key)}.schema.json")
        pv = jsonschema.Draft202012Validator(payload_schema, format_checker=FORMAT_CHECKER)
        def_name = f"goal_{key}_history_answer"
        if def_name not in out_doc["$defs"]:
            failures.append(f"{OUT_SCHEMA.name}: missing $defs/{def_name}")
            continue
        av = jsonschema.Draft202012Validator({"$ref": f"{out_doc['$id']}#/$defs/{def_name}"}, registry=reg)
        for case in fx.get("schema_cases", []):
            c["schema"] += 1
            if is_valid(pv, case["value"]) != case["valid"]:
                failures.append(f"{fx_path.name}: schema_case {case['id']} expected valid={case['valid']}")
        for case in fx.get("reader_output_cases", []):
            c["answer"] += 1
            ok = is_valid(av, case["answer"])
            ev = case["answer"].get("original_event")
            if ok and isinstance(ev, dict) and not is_valid(pv, ev.get("payload")):
                ok = False
            if ok != case["valid"]:
                failures.append(f"{fx_path.name}: reader_output_case {case['id']} expected valid={case['valid']}")
        for case in fx.get("join_cases", []):
            c["join"] += 1
            if not is_valid(av, case["answer"]):
                failures.append(f"{fx_path.name}: join_case {case['id']} is not shape-valid")
            if joins_ok(case["answer"]) != case["join_valid"]:
                failures.append(f"{fx_path.name}: join_case {case['id']} expected join_valid={case['join_valid']}")
        for case in fx.get("current_canon_cases", []):
            c["canon"] += 1
            if not is_valid(av, case["answer"]):
                failures.append(f"{fx_path.name}: current_canon_case {case['id']} is not shape-valid")
            if canon_admissible(outcome, case["answer"]) != case["current_canon_admissible"]:
                failures.append(f"{fx_path.name}: current_canon_case {case['id']} expected admissible={case['current_canon_admissible']} ({unit})")
        for case in fx.get("refusal_cases", []):
            c["refusal"] += 1
            if case.get("expected") != "refused_before_dedupe" or any(case.get("effects", {}).values()):
                failures.append(f"{fx_path.name}: refusal_case {case['id']} must be refused_before_dedupe with no effect")
        if not fx.get("reader_output_cases") or not fx.get("current_canon_cases"):
            failures.append(f"{fx_path.name}: reader_output_cases and current_canon_cases are required")
    result = {"status": "pass" if not failures else "fail", "families": counts, "failures": failures,
              "native_execution": "NOT_RUN"}
    print(json.dumps(result, indent=2))
    return 0 if not failures else 1


if __name__ == "__main__":
    sys.exit(main())
