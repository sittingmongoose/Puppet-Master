#!/usr/bin/env python3
"""Static checker for Plans/goal_current_writer_oracle_fixtures.json (ATS-210, DL-045 depth, 2026-11-04).

Five current Goal writers: goal.updated, goal.cancelled, goal_run.started, goal_run.cancelled and
goal_run.certified. The checker validates payload cases against the registered v3 payload schemas,
recomputes the SP-421/SP-422 identity recipes, walks the SP-299 progress edges, applies the Storage
dedupe rule, checks the SP-310 late-assignment rule (only sequence_id is assigned late) and runs a
pure model of the SP-311, SP-312 and GRS-085 projector rule tables over abstract row sequences.
It proves owner-text consistency only; native execution stays NOT_RUN. Exit 0 on full agreement.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

try:
    import jsonschema
except ImportError as exc:  # pragma: no cover
    print(json.dumps({"status": "error", "reason": f"missing dependency: {exc}"}))
    sys.exit(2)

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "Plans/goal_current_writer_oracle_fixtures.json"
DOMAINS = {"goal.updated": "pm.goal.updated.command.v1", "goal.cancelled": "pm.goal.cancelled.command.v1"}
COMMANDS = {"goal.updated": "cmd.chat.goal.update", "goal.cancelled": "cmd.chat.goal.cancel"}
CURRENT_SCHEMA = {
    "goal.updated": "pm.goal_runtime_event.goal_updated.schema.v3",
    "goal.cancelled": "pm.goal_runtime_event.goal_cancelled.schema.v3",
}
S, C, CE = "goal_run.started", "goal_run.cancelled", "goal_run.certified"

FORMAT_CHECKER = jsonschema.FormatChecker(formats=())


@FORMAT_CHECKER.checks("date-time")
def _utc(instance) -> bool:
    if not isinstance(instance, str):
        return True
    return re.match(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$", instance) is not None


def jcs_strings(values: list[str]) -> bytes:
    # RFC 8785 for an array of strings: compact separators, literal UTF-8, standard JSON escapes.
    return json.dumps(values, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def recipe(family: str, inputs: dict) -> tuple[str, str]:
    order = ["storage_instance_id", "project_id", "thread_id", "command_id", "command_instance_id", "operation_id", "goal_id"]
    digest = hashlib.sha256(jcs_strings([DOMAINS[family], "project"] + [inputs[k] for k in order])).hexdigest()
    return f"{family}.v1:{digest}", f"{family}.command.v1:{digest}"


def walk(sequence: list[str], edges: list[list[str]]) -> bool:
    allowed = {tuple(e) for e in edges}
    if not sequence or sequence[0] != "source_admitted":
        return False
    return all((a, b) in allowed for a, b in zip(sequence, sequence[1:]))


def dedupe(case: dict) -> str:
    if not case["proof_available"]:
        return "dedupe_unavailable"
    if not case["existing"]:
        return "append_new"
    return "return_original_receipt" if case["same_digest"] else "idempotency_conflict"


def reduce_rows(rows: list[dict], mode: str) -> dict:
    supported = {"started": {S}, "cancelled": {S, C}, "certified": {S, C, CE}}[mode]
    row = None
    keys: dict[str, str] = {}
    for i, r in enumerate(rows):
        if not r.get("verified", False) or r.get("scope_mismatch"):
            return {"outcome": "halt_before", "index": i, "row": row}
        if r["run"] != "this":
            continue
        ev, key = r["event_type"], r["event_key"]
        if ev not in supported:
            return {"outcome": "halt_before", "index": i, "row": row}
        if key in keys.values() and keys.get(ev) == key:
            return {"outcome": "coverage_failure", "index": i, "row": row}
        if ev == S:
            if row is None:
                row, keys[S] = S, key
                continue
            if mode == "cancelled" and row == C:
                return {"outcome": "refused", "index": i, "row": row}
            if mode == "certified" and row in (C, CE):
                return {"outcome": "halt_before", "index": i, "row": row}
            return {"outcome": "custody_mismatch", "index": i, "row": row}
        if ev == C:
            if row in (C, CE):
                outcome = "refused" if mode == "cancelled" else "halt_before"
                return {"outcome": outcome, "index": i, "row": row}
            if mode == "certified" and row is None:
                return {"outcome": "halt_before", "index": i, "row": row}
            row, keys[C] = C, key
            continue
        if ev == CE:
            if row != S:
                return {"outcome": "halt_before", "index": i, "row": row}
            row, keys[CE] = CE, key
    return {"outcome": "advanced", "row": row}


def main() -> int:
    doc = json.loads(FIXTURES.read_text(encoding="utf-8"))
    failures: list[str] = []
    counts: dict[str, int] = {}

    def check(cond: bool, label: str) -> None:
        counts[label.split(":")[0]] = counts.get(label.split(":")[0], 0) + 1
        if not cond:
            failures.append(label)

    fams = doc["families"]
    for family in ("goal.updated", "goal.cancelled"):
        f = fams[family]
        schema = json.loads((ROOT / f["payload_schema"]).read_text(encoding="utf-8"))
        v = jsonschema.Draft202012Validator(schema, format_checker=FORMAT_CHECKER)
        for case in f["payload_cases"]:
            check((not list(v.iter_errors(case["value"]))) == case["valid"], f"{family} payload:{case['id']}")
        seen: dict[str, tuple] = {}
        for case in f["identity_cases"]:
            ev, key = recipe(family, case["inputs"])
            ok = case["inputs"]["command_id"] == COMMANDS[family] and case["event_id"] == ev and case["idempotency_key"] == key
            check(ok == case["valid"], f"{family} identity:{case['id']}")
            if ok:
                inp = tuple(sorted(case["inputs"].items()))
                prior = seen.get(ev)
                check(prior is None or prior == inp, f"{family} identity-collision:{case['id']}")
                seen[ev] = inp
        for case in f["replay_cases"]:
            check(dedupe(case) == case["expected"], f"{family} replay:{case['id']}")
    up = fams["goal.updated"]
    for case in up["progress_cases"]:
        check(walk(case["sequence"], up["progress_edges"]) == case["valid"], f"goal.updated progress:{case['id']}")
    for case in up["reader_cases"]:
        got = "observation" if case["payload_schema_id"] == CURRENT_SCHEMA["goal.updated"] else "unsupported_payload"
        check(got == case["expected"], f"goal.updated reader:{case['id']}")
    ca = fams["goal.cancelled"]
    for case in ca["payload_join_cases"]:
        n, p = case["normalized"], case["payload"]
        ok = (p["operation_id"] == n["operation_id"] == p["cancellation_id"]
              and p["command_instance_id"] == n["command_instance_id"] and p["goal_id"] == n["goal_id"])
        check(ok == case["valid"], f"goal.cancelled join:{case['id']}")
    for case in ca["late_assignment_cases"]:
        t, fin = case["template"], case["final"]
        ok = all(fin[k] == t[k] for k in t if k != "sequence_id") and isinstance(fin.get("sequence_id"), int)
        check(ok == case["valid"], f"goal.cancelled late:{case['id']}")
    for case in ca["inspection_cases"]:
        got = "observation" if case["payload_schema_id"] == CURRENT_SCHEMA["goal.cancelled"] else "unsupported_payload"
        check(got == case["expected"], f"goal.cancelled inspect:{case['id']}")
    for family, mode in ((S, "started"), (C, "cancelled"), (CE, "certified")):
        for case in fams[family]["reducer_cases"]:
            got = reduce_rows(case["rows"], mode)
            exp = case["expected"]
            same = got["outcome"] == exp["outcome"] and got.get("row") == exp.get("row") and got.get("index") == exp.get("index")
            check(same, f"{family} reducer:{case['id']} got {got}")
    result = {"status": "pass" if not failures else "fail", "case_counts": counts, "failures": failures,
              "native_execution": "NOT_RUN"}
    print(json.dumps(result, indent=2))
    return 0 if not failures else 1


if __name__ == "__main__":
    sys.exit(main())
