#!/usr/bin/env python3
import argparse
import copy
import hashlib
import json
import os
import stat
import sys
from pathlib import Path

ARCH_BYTES = 6440
ARCH_SHA256 = "a9837a821787083eee7abe549845764e070b52393d6244cb49051544631a4e4d"
SOURCES = {
    "consumed_packet_probe_failure": (8554, "33f65637c75f4ef6c6bbbe671dad1627692e75fd177b079b486b6c07f3026538", "r9_codex_native_goal_post_active_exact_packet_reader_probe_001_consumed_runtime_failure_receipt_v1.json"),
    "exact_roster_route_capability": (5467, "6603203c251ae12fd31564902ba5fb75cb6dca5f81e4afcdc7d250795295e4db", "r9_codex_native_goal_exact_roster_route_capability_mechanical_validation_v1.json"),
    "prior_autocontinuation_failure": (2607, "4e28aabd6b479498bf5049bc7cb7fe7120319ca1fe052f4b585a624c50da54f0", "r9_codex_native_goal_gated_staged_turn_capability_001_runtime_failure_receipt_v1.json"),
    "self_describing_envelope_loop_breaker": (3729, "a88626ce84e26e5df849ddac2bcfa5facff340dda390642a31c57f8de7ba051a", "r9_codex_native_goal_self_describing_atomic_mailbox_successor_design_review_003_loop_breaker_failure_receipt_v1.json"),
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
    result = {}
    for key, value in items:
        if key in result:
            raise Invalid("duplicate-key:" + key)
        result[key] = value
    return result


def parse(raw, name):
    try:
        return json.loads(raw.decode("utf-8"), object_pairs_hook=_pairs, parse_constant=_constant)
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid("json:" + name) from exc


def exact(path, size, digest, mode=0o644):
    before = path.stat(follow_symlinks=False)
    if not stat.S_ISREG(before.st_mode) or stat.S_IMODE(before.st_mode) != mode or before.st_uid != os.getuid():
        raise Invalid("custody:" + path.name)
    raw = path.read_bytes()
    after = path.stat(follow_symlinks=False)
    if (before.st_dev, before.st_ino, before.st_mode, before.st_uid, before.st_size, before.st_mtime_ns) != (after.st_dev, after.st_ino, after.st_mode, after.st_uid, after.st_size, after.st_mtime_ns):
        raise Invalid("read-drift:" + path.name)
    if len(raw) != size or hashlib.sha256(raw).hexdigest() != digest:
        raise Invalid("identity:" + path.name)
    return raw


def architecture(path, bind_identity=True):
    raw = exact(path, ARCH_BYTES, ARCH_SHA256) if bind_identity else path.read_bytes()
    if not raw.endswith(b"\n") or raw[:-1].find(b"\n") != -1 or b"\r" in raw:
        raise Invalid("architecture-framing")
    value = parse(raw, "architecture")
    if json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode() + b"\n" != raw:
        raise Invalid("architecture-canonical")
    return value


def semantic(value):
    c = Counter()
    c.require(set(value) == {"authority", "bindings", "capability_gate", "distinct_root", "failure_rules", "goal_objective", "initial_spawn", "qualification", "reader_and_packet", "roster", "runtime_evidence", "schema_id", "status"}, "top-keys")
    c.require(value["schema_id"] == "pw-r9-codex-native-goal-inline-goal-owned-packet-execution-architecture-v1", "schema")
    c.require(value["status"] == "DESIGN_ONLY_DISTINCT_NO_IDLE_GOAL_ROOT_ZERO_CREDIT_READY_FOR_CLOSED_MECHANICAL_CHECK", "status")
    c.require(value["authority"] == {"architecture_design": True, "canary_launch": False, "capability_implementation": False, "empirical_launch": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0, "release": False}, "authority")
    c.require(value["bindings"] == {name: {"bytes": size, "mode": "0644", "path": filename, "sha256": digest} for name, (size, digest, filename) in SOURCES.items()}, "bindings")
    root = value["distinct_root"]
    c.require(root["family"] == "GOAL_OWNED_NO_IDLE_INLINE_PACKET_EXECUTION", "family")
    c.require(all(root[name] is True for name in ["no_external_event_gate", "no_followup_task_or_send_message", "no_idle_active_boundary", "no_mailbox_or_wait_process", "no_parent_post_active_action", "no_self_describing_json_envelope", "no_skill_or_bootstrap_adapter"]), "distinct-negatives")
    c.require("task_complete or assistant final between ACTIVE and the command is a permanent failure" in root["structural_change"], "structural-change")
    objective = value["goal_objective"]
    c.require(objective == {"ascii_only": True, "contains_expected_answer": False, "contains_subject_bytes": False, "exact_pattern": "RUN|v1|cwd=<ABS_CASE_DIR>|cmd=PYTHONDONTWRITEBYTECODE=1 python3 -B <ENTRY_BASENAME>|then=<CONTROL_COMPLETE_OR_SOLVE_COMPLETE>", "max_utf8_bytes": 256, "purpose": "Native Goal-owned routing instruction only. It fixes one exact read-only entry command without carrying the subject or expected answer.", "single_line": True}, "objective")
    spawn = value["initial_spawn"]
    c.require(spawn["fork_turns"] == "none" and spawn["max_utf8_bytes"] == 512 and spawn["parent_message_count_for_entire_task"] == 1, "spawn-limits")
    c.require(spawn["contains_expected_answer"] is False and spawn["contains_subject_bytes"] is False, "spawn-no-subject")
    c.require(spawn["exact_requirements"] == ["name the exact Goal objective bytes", "require create_goal as the first tool call", "require ACTIVE status from that tool result", "forbid an assistant final or task_complete after ACTIVE", "require immediate exact exec_command in the same turn", "require exactly one update_goal complete after the derived result", "require exact terminal grammar"], "spawn-requirements")
    gate = value["capability_gate"]
    c.require(gate == {"before_any_subject_atom": "ONE FRESH ZERO_SUBJECT INLINE CONTROL PROBE MUST PROVE THE EXACT FIRST-TURN TOOL ORDER AND TERMINAL GOAL RECEIPT; FAILURE CONSUMES THAT PROBE AND FREEZES THIS FAMILY", "control_probe_stdout": "ONE PREBOUND ASCII TOKEN WITH NO SUBJECT OR EXPECTED-ANSWER MATERIAL", "credit": 0, "model": "gpt-5.4-mini", "reasoning_effort": "medium", "retry_relaunch_replacement_or_reuse": False}, "capability-gate")
    c.require(value["qualification"] == {"clean_full_matrix_streak": 0, "component_and_capability_credit": 0, "score": "0/2", "two_consecutive_clean_full_matrices_required": True}, "qualification")
    c.require(value["roster"] == [{"model": "gpt-5.4-mini", "reasoning_effort": "xhigh", "slot": "alpha"}, {"model": "gpt-5.4-mini", "reasoning_effort": "medium", "slot": "bravo"}, {"model": "gpt-5.6-luna", "reasoning_effort": "medium", "slot": "charlie"}], "roster")
    failures = value["failure_rules"]
    c.require(failures["before_active"] == ["any tool other than the one exact create_goal call", "any file, packet, skill, memory, provider, network, or subject access", "assistant final or task_complete"], "before-active")
    c.require(failures["after_active_before_exec"] == ["assistant final or task_complete", "Goal automatic continuation turn", "parent message or follow-up", "skill or memory read", "search, discovery, directory listing, or any tool other than the one exact exec_command"], "after-active")
    c.require("NO RETRY, RELAUNCH, REPLACEMENT, RESEND, SUBSTITUTION, BEST-OF, OR REUSE" in failures["consumption"], "consumption")
    evidence = value["runtime_evidence"]
    c.require(evidence["closed_child_trace_primary"] is True and evidence["exact_single_turn"] is True, "trace-primary")
    c.require(evidence["must_rederive"] == ["fresh task identity and exact literal route", "initial parent message is the sole parent message", "create_goal is the first function call", "ACTIVE receipt binds the exact objective and child thread", "no assistant final, task_complete, Goal continuation, parent event, or extra tool occurs before exec_command", "exec_command argv, cwd, environment, return code, stdout, and stderr", "control probe stdout identity or fresh packet identity", "update_goal complete binds the same objective and thread", "exact terminal response and one task_complete", "no retry, reuse, skill, memory, provider, network, write, search, or discovery call"], "rederive")
    c.require(len(evidence["nonclaims"]) == 4 and all(isinstance(item, str) and item for item in evidence["nonclaims"]), "nonclaims")
    c.require(value["reader_and_packet"]["subject_visibility"] == "Earliest allowed subject bytes are the successful exact exec_command output after the ACTIVE create_goal result in the same turn.", "subject-visibility")
    return c.value


def mutations(value):
    cases = []
    def add(label, path, replacement):
        item = copy.deepcopy(value)
        target = item
        for key in path[:-1]:
            target = target[key]
        target[path[-1]] = replacement
        cases.append((label, item))
    add("family", ["distinct_root", "family"], "ACTIVE_WAIT")
    add("idle", ["distinct_root", "no_idle_active_boundary"], False)
    add("parent-message", ["initial_spawn", "parent_message_count_for_entire_task"], 2)
    add("spawn-subject", ["initial_spawn", "contains_subject_bytes"], True)
    add("objective-subject", ["goal_objective", "contains_subject_bytes"], True)
    add("objective-limit", ["goal_objective", "max_utf8_bytes"], 512)
    add("capability-credit", ["capability_gate", "credit"], 1)
    add("route-alias", ["roster", 1, "model"], "gpt-5.4")
    add("qualification", ["qualification", "score"], "1/2")
    add("single-turn", ["runtime_evidence", "exact_single_turn"], False)
    add("canary", ["authority", "canary_launch"], True)
    add("retry", ["capability_gate", "retry_relaunch_replacement_or_reuse"], True)
    return cases


def check_sources(base, value):
    count = 0
    for name, (size, digest, filename) in SOURCES.items():
        exact(base / filename, size, digest)
        if value["bindings"][name] != {"bytes": size, "mode": "0644", "path": filename, "sha256": digest}:
            raise Invalid("binding-record:" + name)
        count += 1
    return count


def emit(status, mismatch, assertions=0, mutations_rejected=0):
    value = {"assertion_count": assertions, "first_mismatch": mismatch, "mutation_count": mutations_rejected, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-inline-goal-owned-packet-execution-design-check-v1", "status": status, "workspace_writes": 0}
    sys.stdout.write(json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n")


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--architecture")
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--mutation-self-test", action="store_true")
    args, extras = parser.parse_known_args()
    if extras or not args.architecture or not os.path.isabs(args.architecture) or args.check == args.mutation_self_test:
        emit("FAIL", "CLI must be --architecture ABS with exactly one of --check or --mutation-self-test")
        return 1
    try:
        path = Path(args.architecture)
        value = architecture(path)
        assertions = semantic(value)
        assertions += check_sources(path.parent, value)
        rejected = 0
        if args.mutation_self_test:
            for label, mutant in mutations(value):
                try:
                    semantic(mutant)
                except (Invalid, KeyError, IndexError, TypeError):
                    rejected += 1
                    continue
                raise Invalid("mutation-accepted:" + label)
            if rejected != 12:
                raise Invalid("mutation-count")
    except (Invalid, OSError, KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError) as exc:
        emit("FAIL", str(exc))
        return 1
    emit("PASS_MECHANICAL_DESIGN_ZERO_CREDIT", None, assertions, rejected)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
