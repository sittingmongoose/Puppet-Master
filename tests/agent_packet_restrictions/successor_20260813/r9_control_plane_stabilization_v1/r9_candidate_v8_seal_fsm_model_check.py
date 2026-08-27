#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import stat
import sys
from collections import deque


ROOT_KEYS = {"accounting", "artifact_order", "artifacts", "authority", "dsl", "fault_model", "invariants", "lineage", "operations", "publisher", "rules", "schema_id", "schema_version"}
ARTIFACT_KEYS = {"binds", "contains_forbidden_keys", "depends_on", "forbidden_keys", "id", "path", "role"}
RULE_KEYS = {"decisions", "guard", "priority", "rule_id"}
DECISION_KEYS = {"effects", "outcome", "subject_calls"}
OPERATIONS = ("ADMIT", "REOPEN", "RESUME")
OBSERVATIONS = ("AA", "S1", "SF2", "F1", "BAD")
GUARDS = ("ANY_BAD", "NO_BAD_INVALID_LAYOUT", "COMPLETE_EXACT", "CONTIGUOUS_CURRENT_SF2", "CONTIGUOUS_CURRENT_S1", "CONTIGUOUS_CURRENT_AA")
EFFECTS = {"CREATE_STAGE_O_EXCL_0444", "FAIL_CLOSED", "FSYNC_FINAL_PARENT", "FSYNC_SCRATCH_PARENT", "FSYNC_STAGE", "HARDLINK_STAGE_TO_FINAL_NO_FALLBACK", "NO_WRITE", "RETURN_COMPLETE", "RETURN_INCOMPLETE", "UNLINK_EXACT_STAGE", "WRITE_CANONICAL_EXACT"}
WRITE_EFFECTS = EFFECTS - {"FAIL_CLOSED", "NO_WRITE", "RETURN_COMPLETE", "RETURN_INCOMPLETE"}


class CheckError(Exception):
    pass


def fail(message):
    raise CheckError(message)


def pairs_no_duplicates(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            fail("duplicate key: " + key)
        result[key] = value
    return result


def reject_constant(value):
    fail("non-finite number: " + value)


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":"), sort_keys=True).encode("utf-8") + b"\n"


def exact_keys(value, allowed, required, where):
    if not isinstance(value, dict):
        fail(where + " must be an object")
    extra = set(value) - allowed
    missing = required - set(value)
    if extra or missing:
        fail(where + " keys extra=" + repr(sorted(extra)) + " missing=" + repr(sorted(missing)))


def string_list(value, where, unique=False):
    if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
        fail(where + " must be a string list")
    if unique and len(set(value)) != len(value):
        fail(where + " must be unique")
    return value


def classify(state):
    if "BAD" in state:
        return "ANY_BAD"
    prefix = 0
    while prefix < len(state) and state[prefix] == "F1":
        prefix += 1
    if prefix == len(state):
        return "COMPLETE_EXACT"
    tail = state[prefix:]
    if all(item == "AA" for item in tail[1:]):
        current = tail[0]
        if current == "AA":
            return "CONTIGUOUS_CURRENT_AA"
        if current == "S1":
            return "CONTIGUOUS_CURRENT_S1"
        if current == "SF2":
            return "CONTIGUOUS_CURRENT_SF2"
    return "NO_BAD_INVALID_LAYOUT"


def next_state(state, effects):
    guard = classify(state)
    result = list(state)
    if guard == "CONTIGUOUS_CURRENT_AA" and "FSYNC_STAGE" in effects:
        result[result.index("AA")] = "S1"
    elif guard == "CONTIGUOUS_CURRENT_S1" and "FSYNC_FINAL_PARENT" in effects:
        result[result.index("S1")] = "SF2"
    elif guard == "CONTIGUOUS_CURRENT_SF2" and "FSYNC_SCRATCH_PARENT" in effects:
        result[result.index("SF2")] = "F1"
    return tuple(result)


def check_dag(artifacts, order):
    by_id = {item["id"]: item for item in artifacts}
    if len(by_id) != len(artifacts) or list(by_id) != order:
        fail("artifact ids/order mismatch")
    seen = set()
    visiting = set()

    def visit(node):
        if node in visiting:
            fail("dependency cycle at " + node)
        if node in seen:
            return
        visiting.add(node)
        for dep in by_id[node]["depends_on"]:
            if dep not in by_id:
                fail("unknown dependency " + dep)
            visit(dep)
        visiting.remove(node)
        seen.add(node)

    for item in artifacts:
        visit(item["id"])
    positions = {item: index for index, item in enumerate(order)}
    for item in artifacts:
        if any(positions[dep] >= positions[item["id"]] for dep in item["depends_on"]):
            fail("dependency is not earlier than consumer")


def load_contract(path):
    try:
        raw = open(path, "rb").read()
    except OSError as exc:
        fail("read failed: " + str(exc))
    try:
        value = json.loads(raw, object_pairs_hook=pairs_no_duplicates, parse_constant=reject_constant)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        fail("JSON parse failed: " + str(exc))
    if raw != canonical(value):
        fail("not exact recursively sorted minified canonical JSON plus one LF")
    if stat.S_IMODE(os.stat(path).st_mode) != 0o644:
        fail("FSM mode is not 0644")
    return raw, value


def validate(value):
    exact_keys(value, ROOT_KEYS, ROOT_KEYS, "root")
    if value["authority"] is not False:
        fail("authority must be false")
    if not isinstance(value["schema_id"], str) or not isinstance(value["schema_version"], str):
        fail("schema identity must be strings")
    order = string_list(value["artifact_order"], "artifact_order", True)
    artifacts = value["artifacts"]
    if not isinstance(artifacts, list) or not artifacts:
        fail("artifacts must be a nonempty list")
    paths = []
    for index, item in enumerate(artifacts):
        exact_keys(item, ARTIFACT_KEYS, {"depends_on", "id", "path", "role"}, "artifact")
        string_list(item["depends_on"], "depends_on", True)
        if not all(isinstance(item[key], str) and item[key] for key in ("id", "path", "role")):
            fail("artifact scalar invalid")
        if os.path.isabs(item["path"]) or ".." in item["path"].split("/") or item["path"].endswith("/"):
            fail("artifact path is not a safe relative lexical path")
        paths.append(item["path"])
        for optional in ("binds", "contains_forbidden_keys", "forbidden_keys"):
            if optional in item:
                string_list(item[optional], optional, True)
    if len(set(paths)) != len(paths):
        fail("artifact paths must be unique")
    check_dag(artifacts, order)

    dsl = value["dsl"]
    exact_keys(dsl, {"decision_keys", "effect_tokens", "guard_tokens", "observation_classes", "operation_tokens", "rule_keys"}, {"decision_keys", "effect_tokens", "guard_tokens", "observation_classes", "operation_tokens", "rule_keys"}, "dsl")
    if set(string_list(dsl["decision_keys"], "decision_keys", True)) != DECISION_KEYS:
        fail("decision key vocabulary mismatch")
    if set(string_list(dsl["effect_tokens"], "effect_tokens", True)) != EFFECTS:
        fail("effect vocabulary mismatch")
    if set(string_list(dsl["guard_tokens"], "guard_tokens", True)) != set(GUARDS):
        fail("guard vocabulary mismatch")
    if set(string_list(dsl["operation_tokens"], "operation_tokens", True)) != set(OPERATIONS):
        fail("operation vocabulary mismatch")
    if set(string_list(dsl["rule_keys"], "rule_keys", True)) != RULE_KEYS:
        fail("rule key vocabulary mismatch")
    if set(dsl["observation_classes"]) != set(OBSERVATIONS):
        fail("observation vocabulary mismatch")

    operations = value["operations"]
    if set(operations) != set(OPERATIONS):
        fail("operation table mismatch")
    for name, operation in operations.items():
        exact_keys(operation, {"lock", "publisher", "subject_calls"}, {"lock", "publisher", "subject_calls"}, "operation")
        if operation["lock"] != "PERSISTENT_FLOCK_EXACT" or operation["subject_calls"] != 0 or not isinstance(operation["publisher"], bool):
            fail("operation invariant failed: " + name)

    rules = value["rules"]
    if not isinstance(rules, list) or len(rules) != len(GUARDS):
        fail("rule cardinality mismatch")
    priorities = []
    table = {}
    for rule in rules:
        exact_keys(rule, RULE_KEYS, RULE_KEYS, "rule")
        if rule["guard"] not in GUARDS or rule["guard"] in table:
            fail("guard duplicate or unknown")
        priorities.append(rule["priority"])
        if not isinstance(rule["priority"], int) or isinstance(rule["priority"], bool):
            fail("priority must be integer")
        if set(rule["decisions"]) != set(OPERATIONS):
            fail("decision operation coverage mismatch")
        for operation, decision in rule["decisions"].items():
            exact_keys(decision, DECISION_KEYS, DECISION_KEYS, "decision")
            effects = string_list(decision["effects"], "effects", True)
            if not set(effects) <= EFFECTS or not isinstance(decision["outcome"], str) or decision["subject_calls"] != 0:
                fail("decision token or subject-call invariant failed")
            if operation == "REOPEN" and set(effects) & WRITE_EFFECTS:
                fail("REOPEN contains a write effect")
        table[rule["guard"]] = rule
    if priorities != list(range(len(rules))):
        fail("priorities must be ordered contiguous integers")
    if set(table) != set(GUARDS):
        fail("guards are not total")
    for state in __import__("itertools").product(OBSERVATIONS, repeat=min(len(order), 4)):
        matches = [guard for guard in GUARDS if guard == classify(state)]
        if len(matches) != 1:
            fail("guards are not exclusive and total")

    publisher = value["publisher"]
    exact_keys(publisher, {"canonical_bytes", "final_mode", "no_fallback", "steps"}, {"canonical_bytes", "final_mode", "no_fallback", "steps"}, "publisher")
    if publisher["canonical_bytes"] != "RFC8259_RECURSIVE_KEY_SORT_MINIFIED_ONE_LF" or publisher["final_mode"] != "0444" or publisher["no_fallback"] is not True:
        fail("publisher exactness invariant failed")
    expected_steps = {
        "create_stage": ["CREATE_STAGE_O_EXCL_0444", "WRITE_CANONICAL_EXACT", "FSYNC_STAGE"],
        "link_final": ["HARDLINK_STAGE_TO_FINAL_NO_FALLBACK", "FSYNC_FINAL_PARENT"],
        "remove_stage": ["UNLINK_EXACT_STAGE", "FSYNC_SCRATCH_PARENT"],
    }
    if publisher["steps"] != expected_steps:
        fail("publisher step sequence mismatch")

    invariants = value["invariants"]
    required_invariants = {"admission_prefix_ids", "conflicting_final", "existing_final_recovery", "extra_scratch", "future_artifact", "incomplete_prefix", "no_fallback_publish", "overwrite_final", "persistent_lock", "scratch_scope"}
    exact_keys(invariants, required_invariants, required_invariants, "invariants")
    if invariants["admission_prefix_ids"] != order[:2] or invariants["existing_final_recovery"] != ["F1_CURRENT_ADVANCES_PREFIX", "SF2_CURRENT_UNLINKS_STAGE"]:
        fail("admission or existing-final recovery invariant failed")
    if invariants["extra_scratch"] != "FAIL_CLOSED" or invariants["future_artifact"] != "FAIL_CLOSED" or invariants["conflicting_final"] != "FAIL_WITHOUT_OVERWRITE" or invariants["overwrite_final"] is not False:
        fail("fail-closure invariant failed")

    accounting = value["accounting"]
    accounting_keys = {"deterministic_bindings", "final_run_root_creation", "input_fields", "maximal_artifact_id", "post_accounting_artifacts", "post_accounting_cursor", "post_accounting_record"}
    exact_keys(accounting, accounting_keys, accounting_keys, "accounting")
    inputs = string_list(accounting["input_fields"], "accounting input_fields", True)
    if inputs != accounting["deterministic_bindings"] or accounting["maximal_artifact_id"] != order[-1] or accounting["post_accounting_artifacts"] != [] or accounting["post_accounting_cursor"] is not False or accounting["post_accounting_record"] is not False or accounting["final_run_root_creation"] is not True:
        fail("accounting maximality or deterministic binding failed")
    final_artifact = artifacts[-1]
    cursor3 = artifacts[-2]
    if final_artifact["role"] != "accounting" or cursor3["role"] != "cursor3" or final_artifact.get("binds") != inputs:
        fail("terminal accounting placement failed")
    forbidden = set(cursor3.get("forbidden_keys", []))
    if forbidden & set(cursor3.get("binds", [])) or cursor3.get("contains_forbidden_keys") != []:
        fail("cursor before accounting contains forbidden accounting identity")
    if not set(cursor3.get("binds", [])) < set(inputs) or "cursor003_identity" not in set(inputs) - set(cursor3.get("binds", [])):
        fail("acyclic cursor/accounting input relation failed")

    lineage = value["lineage"]
    exact_keys(lineage, {"semantic_dependency_on_prose_contracts", "supersedes_failures"}, {"semantic_dependency_on_prose_contracts", "supersedes_failures"}, "lineage")
    if lineage["semantic_dependency_on_prose_contracts"] is not False or not isinstance(lineage["supersedes_failures"], list):
        fail("lineage semantics invalid")
    for item in lineage["supersedes_failures"]:
        exact_keys(item, {"bytes", "mode", "sha256", "version"}, {"bytes", "mode", "sha256", "version"}, "lineage failure")
        if not isinstance(item["bytes"], int) or item["bytes"] <= 0 or item["mode"] != "0644" or not isinstance(item["sha256"], str) or len(item["sha256"]) != 64:
            fail("lineage identity invalid")
    return order, table


def model_check(order, table):
    initial = tuple("AA" for _ in order)
    queue = deque([initial])
    reachable = {initial}
    transitions = 0
    crash_edges = 0
    while queue:
        state = queue.popleft()
        guard = classify(state)
        if guard not in table:
            fail("reachable state has no rule")
        for operation in OPERATIONS:
            decision = table[guard]["decisions"][operation]
            target = next_state(state, decision["effects"])
            transitions += 1
            if operation == "REOPEN" and target != state:
                fail("REOPEN writes reachable durable state")
            if set(decision["effects"]) & WRITE_EFFECTS:
                crash_edges += 2
                for crash_target in (state, target):
                    if crash_target not in reachable:
                        reachable.add(crash_target)
                        queue.append(crash_target)
            elif target not in reachable:
                reachable.add(target)
                queue.append(target)
    complete = tuple("F1" for _ in order)
    if complete not in reachable:
        fail("complete state unreachable")
    for state in reachable:
        cursor = state
        limit = len(order) * 3 + 1
        for _ in range(limit):
            if cursor == complete:
                break
            guard = classify(cursor)
            decision = table[guard]["decisions"]["RESUME"]
            nxt = next_state(cursor, decision["effects"])
            if nxt == cursor:
                fail("resume does not converge from " + repr(state))
            cursor = nxt
        else:
            fail("resume convergence bound exceeded")
    for operation in OPERATIONS:
        decision = table["COMPLETE_EXACT"]["decisions"][operation]
        if next_state(complete, decision["effects"]) != complete or set(decision["effects"]) & WRITE_EFFECTS:
            fail("complete fixed point violated")
    bad_cases = [tuple(["BAD"] + ["AA"] * (len(order) - 1))]
    if len(order) > 1:
        bad_cases.append(tuple(["AA", "F1"] + ["AA"] * (len(order) - 2)))
        bad_cases.append(tuple(["F1", "AA", "S1"] + ["AA"] * (len(order) - 3)) if len(order) >= 3 else tuple(["AA", "F1"]))
    for state in bad_cases:
        guard = classify(state)
        for operation in OPERATIONS:
            decision = table[guard]["decisions"][operation]
            if "FAIL_CLOSED" not in decision["effects"] or set(decision["effects"]) & WRITE_EFFECTS:
                fail("corruption/future-artifact fail closure violated")
    properties = 14
    return {"crash_edges": crash_edges, "properties": properties, "reachable_states": len(reachable), "transitions": transitions}


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--fsm", required=True)
    parser.add_argument("--check", action="store_true")
    args, extras = parser.parse_known_args()
    if extras or not args.check:
        fail("CLI must be --fsm ABS --check")
    if not os.path.isabs(args.fsm):
        fail("--fsm must be absolute")
    before = os.stat(args.fsm)
    raw, value = load_contract(args.fsm)
    order, table = validate(value)
    counts = model_check(order, table)
    after = os.stat(args.fsm)
    if (before.st_size, before.st_mtime_ns, before.st_ino) != (after.st_size, after.st_mtime_ns, after.st_ino):
        fail("FSM changed during check")
    result = {"artifact_count": len(order), "check":"PASS", "crash_edges":counts["crash_edges"], "first_mismatch":None, "fsm_bytes":len(raw), "fsm_sha256":hashlib.sha256(raw).hexdigest(), "properties":counts["properties"], "reachable_states":counts["reachable_states"], "transitions":counts["transitions"], "workspace_writes":0}
    sys.stdout.buffer.write(canonical(result))


if __name__ == "__main__":
    try:
        main()
    except CheckError as exc:
        sys.stdout.buffer.write(canonical({"check":"FAIL", "first_mismatch":str(exc), "workspace_writes":0}))
        raise SystemExit(1)
