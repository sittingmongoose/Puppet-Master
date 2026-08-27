#!/usr/bin/env python3
import argparse
import copy
import hashlib
import json
import os
import stat
import sys
from pathlib import Path

ARCH_BYTES = 6111
ARCH_SHA256 = "c8a4d0a1e3e7fa767751dbfaa24bf251ac3c8ae07e748d5c8ffe7bcaba083f77"
EXPECTED_BINDINGS = {
    "churn_audit": ("r9_codex_native_goal_churn_audit_20260823t201440z_v1.json", 3396, "9044427af0194c310947b011506b87b6b7e371758e63a2e1e9532603d27929ff"),
    "frozen_corpus_failure": ("r9_codex_native_goal_frozen_packet_corpus_design_review_failure_receipt_v1.json", 2253, "f15f1e1d69fee0871f0ca29b01e229127ce71ee7cbd0b4e2a68c480aa97f3971"),
    "parent_parsed_real_atom": ("r9_codex_native_goal_parent_parsed_real_atom_001_mechanical_success_receipt_v1.json", 5162, "e6893a3a203a535d7ed3aafcdbeca15a3fc32123bc9c61237fbf66955aa00945"),
    "phase_capsule_loop_breaker": ("r9_codex_native_goal_plaintext_phase_capsule_verifier_v2_static_integration_loop_breaker_failure_receipt_v1.json", 3540, "347482962a1a6fad04bedc27611a2e47270d1cdd328ab2a6b803bdf8b58ec13f"),
    "skill_adapter_loop_breaker": ("r9_codex_native_goal_bootstrap_skill_adapter_static_integration_loop_breaker_failure_receipt_v1.json", 4721, "ceda2e0f973a964e223171434a90877c7b5ea710d6ca58f9bd757f8bd23ae59c"),
}


class Invalid(Exception):
    pass


class Counter:
    def __init__(self):
        self.value = 0

    def require(self, condition, mismatch):
        self.value += 1
        if not condition:
            raise Invalid(mismatch)


def _constant(value):
    raise Invalid("nonfinite-json:" + value)


def _pairs(items):
    value = {}
    for key, item in items:
        if key in value:
            raise Invalid("duplicate-key:" + key)
        value[key] = item
    return value


def parse_json(raw, name):
    try:
        return json.loads(raw.decode("utf-8"), object_pairs_hook=_pairs, parse_constant=_constant)
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid("json:" + name) from exc


def canonical(path, expected_bytes, expected_sha256, expected_mode=0o644):
    info = path.stat(follow_symlinks=False)
    if not stat.S_ISREG(info.st_mode):
        raise Invalid("regular:" + path.name)
    if stat.S_IMODE(info.st_mode) != expected_mode:
        raise Invalid("mode:" + path.name)
    raw = path.read_bytes()
    if len(raw) != expected_bytes:
        raise Invalid("bytes:" + path.name)
    if hashlib.sha256(raw).hexdigest() != expected_sha256:
        raise Invalid("sha256:" + path.name)
    if not raw.endswith(b"\n") or raw[:-1].find(b"\n") != -1 or b"\r" in raw:
        raise Invalid("framing:" + path.name)
    value = parse_json(raw, path.name)
    encoded = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode() + b"\n"
    if encoded != raw:
        raise Invalid("canonical:" + path.name)
    return value


def keys(counter, value, expected, name):
    counter.require(isinstance(value, dict) and set(value) == set(expected), "keys:" + name)


def validate(value, base, reopen_bindings):
    c = Counter()
    keys(c, value, ["authority", "bindings", "distinct_root", "freshness_and_failure", "next_gate", "objective", "packet_contract", "qualification", "reader_contract", "roster", "runtime_evidence", "schema_id", "status", "test_taker_lifecycle"], "root")
    c.require(value["schema_id"] == "pw-r9-codex-native-goal-post-active-exact-packet-reader-architecture-v1", "schema")
    c.require(value["status"] == "DESIGN_ONLY_DISTINCT_TRANSPORT_ROOT_ZERO_CREDIT_NO_EMPIRICAL_AUTHORITY", "status")
    c.require(value["authority"] == {"canary_launch": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0, "release": False, "single_transport_probe": False}, "authority")
    c.require("after that test-taker has activated its own native Codex Goal" in value["objective"], "objective-order")
    root = value["distinct_root"]
    c.require(root["family"] == "POST_GOAL_IMMUTABLE_EXACT_PACKET_READER", "family")
    c.require(all(root[name] is True for name in ["not_a_plaintext_phase_capsule_repair", "not_a_skill_or_bootstrap_adapter", "not_a_frozen_full_corpus", "not_a_parent_message_attestation"]), "family-exclusions")
    c.require("already-minted immutable atom packet" in root["scope"] and "separate later component" in root["scope"], "scope")
    expected_binding_values = {name: {"bytes": size, "mode": "0644", "path": path, "sha256": digest} for name, (path, size, digest) in EXPECTED_BINDINGS.items()}
    c.require(value["bindings"] == expected_binding_values, "bindings")
    if reopen_bindings:
        for name, (rel, size, digest) in EXPECTED_BINDINGS.items():
            target = base / rel
            info = target.stat(follow_symlinks=False)
            c.require(stat.S_ISREG(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o644, "binding-mode:" + name)
            raw = target.read_bytes()
            c.require(len(raw) == size and hashlib.sha256(raw).hexdigest() == digest, "binding-identity:" + name)
    packet = value["packet_contract"]
    c.require(packet["byte_recipe"] == "UTF8(control_line) || 0x0A || UTF8(subject_atom) || 0x0A", "packet-recipe")
    c.require(packet["canonicalization"] == "NONE; both source strings and the two LF separators are exact byte inputs", "packet-canonicalization")
    c.require(packet["mode"] == "0444" and packet["probe_max_bytes"] == 512 and packet["global_max_bytes"] == 1024, "packet-caps")
    c.require(packet["control_line"] == {"ascii_only": True, "max_bytes": 256, "required_fields": ["case", "subject", "criterion", "terminal", "token", "ACK"], "required_prefix": "WORK|v1|"}, "control-line")
    c.require(packet["subject_atom"] == {"exact_source_bytes": True, "max_bytes": 768, "must_be_single_line_finite_duplicate_key_rejecting_json": True}, "subject-line")
    c.require(packet["hash"] == {"algorithm": "SHA-256", "domain": "exact packet bytes including both LF bytes", "encoding": "lowercase hexadecimal with exactly 64 ASCII characters"}, "hash")
    reader = value["reader_contract"]
    c.require(reader["argv"] == ["python3", "-B", "read_packet.py"], "reader-argv")
    c.require(reader["environment"] == {"PYTHONDONTWRITEBYTECODE": "1"}, "reader-env")
    c.require(reader["filesystem_writes"] == reader["network_calls"] == reader["provider_calls"] == 0, "reader-zero-effects")
    c.require(reader["checks_before_stdout"] == ["lstat packet.txt without following links", "require regular file mode 0444 and current uid", "require exact expected byte count", "require exact lowercase SHA-256", "require exact two-LF framing and zero CR bytes", "require first line control grammar and second line closed JSON", "reopen and require identical bytes, inode, device, mode, uid, size, and mtime_ns"], "reader-checks")
    c.require(reader["exit"] == {"mismatch": "nonzero with no packet bytes on stdout", "success": "zero after one complete stdout write"}, "reader-exit")
    lifecycle = value["test_taker_lifecycle"]
    c.require(lifecycle["allowed_function_call_sequence"] == ["create_goal", "exec_command", "update_goal"], "call-sequence")
    c.require(lifecycle["initial_spawn"] == {"contains_scored_bytes": False, "max_bytes": 384, "requires_exact_opaque_goal_objective": True, "requires_first_tool_create_goal": True}, "initial-spawn")
    c.require(lifecycle["post_active_instruction"] == {"authority": "ROUTING_ONLY_NOT_SCORED_INPUT", "contains_control_or_subject_bytes": False, "max_bytes": 512, "requires_exact_argv_case_directory_packet_bytes_and_packet_sha256": True}, "post-active-instruction")
    c.require(lifecycle["subject_visibility"] == {"earliest_allowed_event": "successful exec_command function_call_output after ACTIVE Goal receipt", "no_subject_visible_before_active": True, "packet_stdout_must_equal_bound_packet_bytes": True}, "subject-visibility")
    c.require(lifecycle["terminal"] == {"final_first_line": "OUTCOME:<TOKEN>", "goal_complete_receipt_precedes_final": True, "parent_parser_ignores_suffix": True, "result_max_bytes": 128}, "terminal")
    evidence = value["runtime_evidence"]
    c.require(evidence["child_trace_is_primary"] is True, "trace-primary")
    c.require(evidence["must_rederive"] == ["fresh task identity and requested route", "create_goal is the first and sole pre-subject function call", "ACTIVE Goal objective and thread identity", "reader call occurs after ACTIVE", "reader argv, cwd, environment, return code, stdout, and stderr", "packet stdout exact bytes and SHA-256", "no skill, memory, filesystem-write, provider, model, network, retry, or extra tool call", "COMPLETE receipt for the same Goal before exact terminal outcome"], "rederive")
    c.require(evidence["must_not_claim"] == ["collaboration message plaintext was rederived", "full corpus minting is solved", "dynamic dependency packet minting is solved", "canary or matrix qualification"], "nonclaims")
    c.require(value["freshness_and_failure"] == {"attempt_count": 1, "best_of": 0, "on_any_uncertainty": "CONSUME THE TASK AND ATOM WITH ZERO CREDIT", "relaunch_count": 0, "replacement_count": 0, "resend_count": 0, "retry_count": 0, "session_reuse": False}, "freshness")
    c.require(value["roster"] == [{"model": "gpt-5.4-mini", "reasoning_effort": "xhigh", "slot": "slot-alpha"}, {"model": "gpt-5.4-mini", "reasoning_effort": "medium", "slot": "slot-bravo"}, {"model": "gpt-5.6-luna", "reasoning_effort": "medium", "slot": "slot-charlie"}], "roster")
    c.require(value["qualification"] == {"clean_full_matrix_streak": 0, "score": "0/2", "single_transport_probe_credit": 0, "two_consecutive_clean_full_matrices_required": True}, "qualification")
    gate = value["next_gate"]
    c.require(gate["canary_launch"] is False and "at most one zero-credit" in gate["after_mechanical_design_pass"], "next-gate")
    c.require("Separate progressive create-only journal design" in gate["dynamic_packet_mint"], "dynamic-boundary")
    c.require("separate create-only admission" in gate["before_any_live_probe"], "admission-boundary")
    return c.value


def mutation_self_test(value, base):
    mutations = [
        ("authority", lambda x: x["authority"].__setitem__("canary_launch", True)),
        ("qualification", lambda x: x["qualification"].__setitem__("score", "1/2")),
        ("family", lambda x: x["distinct_root"].__setitem__("not_a_skill_or_bootstrap_adapter", False)),
        ("recipe", lambda x: x["packet_contract"].__setitem__("byte_recipe", "AMBIGUOUS")),
        ("canonicalization", lambda x: x["packet_contract"].__setitem__("canonicalization", "RFC8785-LIKE")),
        ("hash", lambda x: x["packet_contract"]["hash"].__setitem__("algorithm", "SHA256-LIKE")),
        ("probe-cap", lambda x: x["packet_contract"].__setitem__("probe_max_bytes", 2048)),
        ("reader", lambda x: x["reader_contract"].__setitem__("argv", ["python3", "read_packet.py"])),
        ("write", lambda x: x["reader_contract"].__setitem__("filesystem_writes", 1)),
        ("first-tool", lambda x: x["test_taker_lifecycle"].__setitem__("allowed_function_call_sequence", ["exec_command", "create_goal", "update_goal"])),
        ("pre-goal", lambda x: x["test_taker_lifecycle"]["subject_visibility"].__setitem__("no_subject_visible_before_active", False)),
        ("message-authority", lambda x: x["test_taker_lifecycle"]["post_active_instruction"].__setitem__("authority", "SCORED_INPUT")),
        ("plaintext-claim", lambda x: x["runtime_evidence"].__setitem__("must_not_claim", [])),
        ("retry", lambda x: x["freshness_and_failure"].__setitem__("retry_count", 1)),
        ("roster", lambda x: x["roster"][2].__setitem__("model", "gpt-5.4-mini")),
        ("dynamic", lambda x: x["next_gate"].__setitem__("dynamic_packet_mint", "SOLVED")),
    ]
    for name, mutate in mutations:
        candidate = copy.deepcopy(value)
        mutate(candidate)
        try:
            validate(candidate, base, False)
        except Invalid:
            continue
        raise Invalid("mutation-accepted:" + name)
    return len(mutations)


def emit(status, mismatch, assertions=0, mutations=0):
    value = {"assertion_count": assertions, "first_mismatch": mismatch, "mutation_count": mutations, "schema_id": "pw-r9-codex-native-goal-post-active-exact-packet-reader-design-check-v1", "status": status, "workspace_writes": 0}
    sys.stdout.write(json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n")


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--architecture")
    parser.add_argument("--check", action="store_true")
    args, extras = parser.parse_known_args()
    if extras or not args.check or not args.architecture or not os.path.isabs(args.architecture):
        emit("FAIL", "CLI must be --architecture ABS --check")
        return 1
    try:
        path = Path(args.architecture)
        value = canonical(path, ARCH_BYTES, ARCH_SHA256)
        assertions = validate(value, path.parent, True)
        mutations = mutation_self_test(value, path.parent)
    except (Invalid, OSError, KeyError, IndexError, TypeError) as exc:
        emit("FAIL", str(exc))
        return 1
    emit("PASS_MECHANICAL_DESIGN_ZERO_CREDIT", None, assertions, mutations)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
