#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import re
import stat
import sys
from pathlib import Path

EXPECTED_BYTES = 3986
EXPECTED_SHA256 = "ee899f61cd68fec3ed8c4cdbf65dd1f7800368b787d6b44f640559841f97ce9b"
EXPECTED_SCHEMA = "pw-r9-codex-native-goal-parent-parsed-terminal-record-architecture-v1"
ROOT_KEYS = {
    "architecture_id",
    "authority",
    "bindings",
    "bite_size",
    "child_visible_protocol",
    "distinction",
    "parent_parser",
    "qualification",
    "runtime_order",
    "schema_id",
    "status",
}
TOKEN = re.compile(r"[A-Z0-9_:-]{1,48}")


class Invalid(Exception):
    pass


def _constant(value):
    raise Invalid("nonfinite-json:" + value)


def _pairs(items):
    out = {}
    for key, value in items:
        if key in out:
            raise Invalid("duplicate-key:" + key)
        out[key] = value
    return out


def canonical_object(raw):
    if raw.startswith(b"\xef\xbb\xbf"):
        raise Invalid("bom")
    if not raw.endswith(b"\n") or raw[:-1].find(b"\n") != -1 or b"\r" in raw:
        raise Invalid("json-framing")
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise Invalid("json-utf8") from exc
    try:
        value = json.loads(text, object_pairs_hook=_pairs, parse_constant=_constant)
    except (json.JSONDecodeError, Invalid) as exc:
        raise Invalid("json-parse") from exc
    if not isinstance(value, dict):
        raise Invalid("json-root")
    encoded = json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
        allow_nan=False,
    ).encode("utf-8") + b"\n"
    if encoded != raw:
        raise Invalid("json-canonical")
    return value


def parse_terminal(raw):
    if not isinstance(raw, bytes) or not 9 <= len(raw) <= 512:
        raise Invalid("terminal-size")
    if b"\r" in raw or b"\x00" in raw:
        raise Invalid("terminal-forbidden-byte")
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise Invalid("terminal-utf8") from exc
    first, separator, suffix = text.partition("\n")
    if not first.startswith("OUTCOME:"):
        raise Invalid("terminal-prefix")
    token = first[len("OUTCOME:") :]
    if TOKEN.fullmatch(token) is None:
        raise Invalid("terminal-token")
    suffix_bytes = suffix.encode("utf-8") if separator else b""
    if len(suffix_bytes) > 448:
        raise Invalid("terminal-suffix-size")
    if "OUTCOME:" in suffix:
        raise Invalid("terminal-duplicate")
    return token


def require(condition, mismatch):
    if not condition:
        raise Invalid(mismatch)


def check_architecture(value):
    require(set(value) == ROOT_KEYS, "root-keys")
    require(value["schema_id"] == EXPECTED_SCHEMA, "schema-id")
    require(
        value["status"]
        == "DESIGN_ONLY_DISTINCT_PIVOT_PENDING_BOUNDED_STATIC_REVIEW_ZERO_CREDIT_NO_LAUNCH_AUTHORITY",
        "status",
    )
    authority = value["authority"]
    require(set(authority) == {
        "canary_launch",
        "matrix_launch",
        "qualification",
        "qualification_credit",
        "real_atom_capability_launch",
        "release",
        "single_harmless_probe",
    }, "authority-keys")
    require(authority == {
        "canary_launch": False,
        "matrix_launch": False,
        "qualification": False,
        "qualification_credit": 0,
        "real_atom_capability_launch": False,
        "release": False,
        "single_harmless_probe": False,
    }, "authority-values")
    bite = value["bite_size"]
    require(bite["control_message_utf8_bytes_max"] == 256, "control-ceiling")
    require(bite["initial_spawn_message_utf8_bytes_max"] == 512, "spawn-ceiling")
    require(bite["subject_message_utf8_bytes_max"] == 512, "subject-ceiling")
    require(bite["terminal_utf8_bytes_max"] == 512, "terminal-ceiling")
    child = value["child_visible_protocol"]
    require(child["first_tool"] == "CREATE_GOAL WITH EXACT PREBOUND OBJECTIVE", "first-tool")
    require(child["task_name_pattern"] == "^sealed_selector_[0-9]{3}$", "task-name")
    require(child["terminal_prefix"] == "OUTCOME:", "terminal-prefix-contract")
    require(child["terminal_token_pattern"] == "^[A-Z0-9_:-]{1,48}$", "token-contract")
    require(set(child["pre_active_forbidden"]) == {
        "FILE READ",
        "SECOND MODEL TASK",
        "SHELL OR CODE EXECUTION",
        "SKILL LOAD",
        "SUBJECT WORK",
    }, "pre-active-closure")
    distinction = value["distinction"]
    require(set(distinction["frozen_families_not_reused"]) == {
        "EXACT_FINAL_ONLY_RESULT_PRESENTATION",
        "GOAL_BOOTSTRAP_SKILL_ADAPTER",
        "NO_WRITE_CHILD_RESULT_RECEIPT",
    }, "frozen-family-closure")
    parent = value["parent_parser"]
    require(parent["no_child_result_tool"] is True, "child-result-tool")
    require(parent["qualification_effect"] == "ZERO", "parser-credit")
    required_failures = {
        "ANY RETRY RELAUNCH REPLACEMENT BEST_OF RESEND SUBSTITUTION OR REUSE",
        "ANY SKILL LOAD",
        "ANY TOOL BEFORE CREATE_GOAL",
        "GOAL THREAD OR STATUS MISMATCH",
        "MESSAGE BEFORE ACTIVE",
        "MESSAGE ORDER OR CARDINALITY MISMATCH",
        "MISSING OR DUPLICATE OUTCOME FIELD",
        "MISSING TERMINAL GOAL COMPLETION",
        "PARSER OR TRACE IDENTITY MISMATCH",
    }
    require(set(parent["fail_closed"]) == required_failures, "fail-closed-set")
    qualification = value["qualification"]
    require(qualification["score"] == "0/2", "score")
    require(qualification["clean_full_matrix_streak"] == 0, "streak")
    require(qualification["required_consecutive_clean_full_matrices"] == 2, "matrix-bar")
    order = value["runtime_order"]
    require(len(order) == 14 and len(set(order)) == 14, "runtime-order")
    require(order[1] == "CREATE_GOAL ACTIVE AS FIRST TOOL", "runtime-first-tool")
    require(order[-1] == "PARENT CLOSED PARSE AND TRACE CROSS_CHECK", "runtime-terminal")


def parser_self_test():
    valid = {
        b"OUTCOME:A": "A",
        b"OUTCOME:GOLD": "GOLD",
        b"OUTCOME:A_B-9:C": "A_B-9:C",
        b"OUTCOME:X\nusage text is presentation only": "X",
        ("OUTCOME:" + "Z" * 48 + "\n" + "u" * 448).encode(): "Z" * 48,
        "OUTCOME:OK\n\N{SNOWMAN}".encode(): "OK",
    }
    invalid = [
        b"",
        b"OUTCOME:",
        b"OUTCOME:lower",
        b"OUTCOME:" + b"A" * 49,
        b" OUTCOME:A",
        b"prose\nOUTCOME:A",
        b"OUTCOME:A\r\n",
        b"OUTCOME:A\x00",
        b"OUTCOME:A\nOUTCOME:B",
        b"OUTCOME:A\n" + b"u" * 449,
        b"OUTCOME:\xff",
    ]
    assertions = 0
    for raw, expected in valid.items():
        first = parse_terminal(raw)
        second = parse_terminal(raw)
        require(first == expected and second == first, "valid-parser-case")
        assertions += 2
    for raw in invalid:
        try:
            parse_terminal(raw)
        except Invalid:
            assertions += 1
        else:
            raise Invalid("invalid-parser-accepted")
    return assertions, len(valid), len(invalid)


def output(status, mismatch, assertions=0, valid=0, invalid=0):
    value = {
        "assertion_count": assertions,
        "first_mismatch": mismatch,
        "invalid_terminal_cases": invalid,
        "schema_id": "pw-r9-codex-native-goal-parent-parsed-terminal-record-check-v1",
        "status": status,
        "valid_terminal_cases": valid,
        "workspace_writes": 0,
    }
    sys.stdout.write(json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n")


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--architecture")
    parser.add_argument("--check", action="store_true")
    args, extras = parser.parse_known_args()
    if extras or not args.check or not args.architecture or not os.path.isabs(args.architecture):
        output("FAIL", "CLI must be --architecture ABS --check")
        return 1
    try:
        path = Path(args.architecture)
        info = path.stat(follow_symlinks=False)
        require(stat.S_ISREG(info.st_mode), "architecture-not-regular")
        require(stat.S_IMODE(info.st_mode) == 0o644, "architecture-mode")
        raw = path.read_bytes()
        require(len(raw) == EXPECTED_BYTES, "architecture-bytes")
        require(hashlib.sha256(raw).hexdigest() == EXPECTED_SHA256, "architecture-sha256")
        value = canonical_object(raw)
        check_architecture(value)
        assertions, valid, invalid = parser_self_test()
    except (Invalid, OSError) as exc:
        output("FAIL", str(exc))
        return 1
    output("PASS_MECHANICAL_ONLY_ZERO_CREDIT", None, assertions, valid, invalid)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
