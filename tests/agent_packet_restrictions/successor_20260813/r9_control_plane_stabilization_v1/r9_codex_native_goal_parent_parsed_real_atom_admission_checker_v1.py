#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import stat
import sys
from pathlib import Path

SELECTION_BYTES = 3289
SELECTION_SHA256 = "ccc3a0387c801b650098209e62dd79e608111980cc7364a2201b045cd8531e5c"
SOURCE_BYTES = 101931
SOURCE_SHA256 = "c34ec8b9e2eba93560f3f5c8087b7e2e91cc467884d12000fdb83c6d338dfc7a"
SOURCE_RELATIVE = "codex_native_goal_direct_canary_002_public_plan_v1/cells/cell-005/slot-bravo.json"
OBJECTIVE = "sealed:v2:c005b00000;no-retry"
INITIAL = "First tool: create_goal objective exactly `sealed:v2:c005b00000;no-retry`. Before ACTIVE, do not read files or skills, run commands, or do work. After ACTIVE, run exactly `python3 -B delay.py` in `/mnt/Cursor/PuppetMaster/tests/r9_goal_delay/q9` with a 30000 ms yield. Do nothing else before READY. Then consume exactly two queued messages in order, follow them, call update_goal complete, and return your final response. No retry, reuse, delegation, or extra tool."
CONTROL = "WORK|v1|case=c005b00000|subject=6971ddf5d9c756ece47c2f038930f6b938076301b614a7248b9c71f17dee616b|criterion=extract_x_from_p|terminal=OUTCOME:<TOKEN>|token=^[A-Za-z0-9._:-]{1,48}$|ACK=BOUND"


class Invalid(Exception):
    pass


def fail(value):
    raise Invalid(value)


def require(value, mismatch):
    if not value:
        fail(mismatch)


def _constant(value):
    fail("nonfinite-json:" + value)


def _pairs(items):
    value = {}
    for key, item in items:
        if key in value:
            fail("duplicate-key:" + key)
        value[key] = item
    return value


def read_canonical(path, expected_bytes, expected_sha256, expected_mode=0o644):
    info = path.stat(follow_symlinks=False)
    require(stat.S_ISREG(info.st_mode), "not-regular:" + path.name)
    require(stat.S_IMODE(info.st_mode) == expected_mode, "mode:" + path.name)
    raw = path.read_bytes()
    require(len(raw) == expected_bytes, "bytes:" + path.name)
    require(hashlib.sha256(raw).hexdigest() == expected_sha256, "sha256:" + path.name)
    require(raw.endswith(b"\n") and raw[:-1].find(b"\n") == -1 and b"\r" not in raw, "framing:" + path.name)
    try:
        value = json.loads(raw.decode("utf-8"), object_pairs_hook=_pairs, parse_constant=_constant)
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid("parse:" + path.name) from exc
    encoded = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode() + b"\n"
    require(encoded == raw, "canonical:" + path.name)
    return value


def identity(text):
    raw = text.encode("utf-8")
    return {"bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()}


def check(selection_path):
    selection = read_canonical(selection_path, SELECTION_BYTES, SELECTION_SHA256)
    require(selection["schema_id"] == "pw-r9-codex-native-goal-parent-parsed-real-atom-selection-v1", "selection-schema")
    require(selection["authority"] == {
        "canary_launch": False,
        "matrix_launch": False,
        "qualification": False,
        "qualification_credit": 0,
        "real_atom_launch": False,
        "release": False,
    }, "selection-authority")
    require(selection["qualification"]["score"] == "0/2", "selection-score")
    require(selection["qualification"]["clean_full_matrix_streak"] == 0, "selection-streak")
    require(selection["preservation"]["omp_lane"] == "FROZEN_SEPARATE_OWNER", "omp-boundary")
    root = selection_path.parent
    source_path = root / SOURCE_RELATIVE
    source = read_canonical(source_path, SOURCE_BYTES, SOURCE_SHA256)
    require(source["cell_index"] == 5 and source["cell"] == "S10A_DECISION_A06", "source-cell")
    require(source["route"] == "slot-bravo", "source-route")
    require(source["model_requested"] == "gpt-5.4-mini", "source-model")
    require(source["reasoning_effort_requested"] == "medium", "source-effort")
    node = source["nodes"][0]
    require(node["atom_id"] == "n00000", "node-id")
    require(node["atom_nonce"] == "b8bd106509c6e4769ec5519acb673362feaa8bb17afe67de22d1c672cc43fa17", "node-nonce")
    require(node["attempt"] == 0 and node["attempt_id"] == "974c6bbe52eb7f93b5836ea0", "node-attempt")
    require(node["kind"] == "EVIDENCE_SLICE_LABEL", "node-kind")
    require(node["dynamic"] is False and node["dependencies"] == [], "node-standalone")
    subject = node["subject_atom"]["utf8"]
    require(identity(subject) == {"bytes": 279, "sha256": "6971ddf5d9c756ece47c2f038930f6b938076301b614a7248b9c71f17dee616b"}, "subject-identity")
    subject_value = json.loads(subject, object_pairs_hook=_pairs, parse_constant=_constant)
    payload = json.loads(subject_value["p"], object_pairs_hook=_pairs, parse_constant=_constant)
    require(payload == {"op": "label", "t": "evidence_record_ids", "x": "A-S04"}, "payload")
    require(subject_value["ph"] == hashlib.sha256(subject_value["p"].encode()).hexdigest(), "payload-hash")
    require(selection["expected_outcome"] == {
        "bytes": 5,
        "derivation": ["PARSE THE EXACT SUBJECT_ATOM JSON", "PARSE ITS p FIELD AS EXACT JSON", "RETURN THE x FIELD UNDER op=label"],
        "sha256": "8b228997101438ec22875cf7a31d4902823a82b0ff95f62ef8a5874fdba3ff43",
        "utf8": payload["x"],
    }, "expected-outcome")
    projection = selection["child_visible_projection"]
    require(projection["goal_objective"] == {"bytes": 29, "sha256": "5cd68601ae2f05651acd45c8c1da2885cf20f8d74ef6015896a9d687dd33eb1c", "utf8": OBJECTIVE}, "objective")
    require(projection["initial_spawn_message"] == identity(INITIAL), "initial")
    require(projection["control"] == {**identity(CONTROL), "utf8": CONTROL}, "control")
    require(projection["subject"] == identity(subject), "subject-projection")
    require(len(INITIAL.encode()) <= 512 and len(CONTROL.encode()) <= 256 and len(subject.encode()) <= 512, "byte-ceilings")
    freshness = selection["freshness"]
    require(freshness["atom_nonce_occurrences_before_selection"] == 1, "fresh-nonce")
    require(freshness["attempt_id_occurrences_before_selection"] == 1, "fresh-attempt")
    require(freshness["source_subject_sha256_occurrences_before_selection"] == 1, "fresh-subject")
    require(freshness["source_task_name_occurrences_before_selection"] == 1, "fresh-task")
    return 31


def emit(status, mismatch, assertions=0):
    value = {
        "assertion_count": assertions,
        "first_mismatch": mismatch,
        "schema_id": "pw-r9-codex-native-goal-parent-parsed-real-atom-admission-check-v1",
        "status": status,
        "workspace_writes": 0,
    }
    sys.stdout.write(json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n")


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--selection")
    parser.add_argument("--check", action="store_true")
    args, extras = parser.parse_known_args()
    if extras or not args.check or not args.selection or not os.path.isabs(args.selection):
        emit("FAIL", "CLI must be --selection ABS --check")
        return 1
    try:
        assertions = check(Path(args.selection))
    except (Invalid, OSError, KeyError, IndexError, TypeError) as exc:
        emit("FAIL", str(exc))
        return 1
    emit("PASS_MECHANICAL_ADMISSION_ZERO_CREDIT", None, assertions)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
