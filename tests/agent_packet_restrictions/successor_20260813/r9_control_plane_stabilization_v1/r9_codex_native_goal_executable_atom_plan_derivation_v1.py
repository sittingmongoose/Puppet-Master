#!/usr/bin/env python3
import argparse
import hashlib
import importlib.util
import json
import os
import re
import stat
import sys
from pathlib import Path


sys.dont_write_bytecode = True

SCHEMA = "pw-r9-codex-native-goal-executable-atom-plan-derivation-v1"
ATOM_SCHEMA = "pw-r9-codex-native-goal-direct-typed-atom-v1"
COMPILER = {
    "bytes": 55381,
    "mode": "0644",
    "path": "r9_codex_native_goal_atomic_manifest_compiler_v1.py",
    "sha256": "bdae122be76f64dafeb244fdde0aac8986e600cbb9d6fe7a14c2b6828eaa4c9e",
}
DESIGN_FAILURE = {
    "bytes": 3968,
    "mode": "0644",
    "path": "r9_codex_native_goal_direct_file_dag_design_review_failure_receipt_v1.json",
    "sha256": "49292954483c15b713d818e90cf93cde1e8d9211cce0a8fbfa8a0ec6f95be0f5",
}
FROZEN_AUTHORITY = {
    "bytes": 3233,
    "mode": "0644",
    "path": "r9_codex_native_goal_direct_typed_atom_plan_implementation_authority_v1.json",
    "sha256": "99c7a4a69c43970b6d80ce5df3cf1f98bffe97f2886db2bff18991990c976a7e",
}
CHURN_AUDIT = {
    "bytes": 2179,
    "mode": "0644",
    "path": "r9_codex_native_goal_churn_audit_20260823t174251z_v1.json",
    "sha256": "720e47aa6bd3cc95d6137237880d366cc84d8c88b7cd1af47016be67b1fd570f",
}
PLAN_IDS = (
    "codex-native-goal-direct-canary-002",
    "codex-native-goal-direct-matrix-007",
    "codex-native-goal-direct-matrix-008",
)
ROSTER = (
    ("slot-alpha", "a", "gpt-5.4-mini", "xhigh"),
    ("slot-bravo", "b", "gpt-5.4-mini", "medium"),
    ("slot-charlie", "c", "gpt-5.6-luna", "medium"),
)
ATOM_MAX = 4096
SPAWN_MAX = 512
RESULT_HARD_MAX = 128
FINAL_HARD_MAX = 169


class Invalid(Exception):
    pass


def fail(message):
    raise Invalid(message)


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def canonical_no_lf(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def canonical(value):
    return canonical_no_lf(value) + b"\n"


def unique_object(pairs):
    out = {}
    for key, value in pairs:
        if key in out:
            fail(f"duplicate-key:{key}")
        out[key] = value
    return out


def parse_json(data, where, require_canonical=True):
    try:
        text = data.decode("utf-8")
        value = json.loads(
            text,
            object_pairs_hook=unique_object,
            parse_constant=lambda item: fail(f"nonfinite:{where}:{item}"),
        )
    except Invalid:
        raise
    except Exception as exc:
        fail(f"json:{where}:{type(exc).__name__}")
    if require_canonical and data != canonical(value):
        fail(f"canonical:{where}")
    return value


def read_bound(base, binding, where):
    path = base / binding["path"]
    try:
        info = path.lstat()
    except OSError as exc:
        fail(f"stat:{where}:{type(exc).__name__}")
    if not stat.S_ISREG(info.st_mode) or stat.S_IMODE(info.st_mode) != int(binding["mode"], 8):
        fail(f"type-or-mode:{where}")
    data = path.read_bytes()
    if len(data) != binding["bytes"] or sha256(data) != binding["sha256"]:
        fail(f"identity:{where}")
    return path, data


def load_compiler(path):
    spec = importlib.util.spec_from_file_location("r9_frozen_atomic_compiler", path)
    if spec is None or spec.loader is None:
        fail("compiler-spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def text_field(value, where):
    if not isinstance(value, dict) or set(value) != {"bytes", "sha256", "utf8"}:
        fail(f"text-field:{where}")
    text = value["utf8"]
    if not isinstance(text, str):
        fail(f"text-type:{where}")
    data = text.encode("utf-8")
    if len(data) != value["bytes"] or sha256(data) != value["sha256"]:
        fail(f"text-identity:{where}")
    return text


def substitute(value, replacements, seen):
    if isinstance(value, dict):
        return {key: substitute(child, replacements, seen) for key, child in value.items()}
    if isinstance(value, list):
        return [substitute(child, replacements, seen) for child in value]
    if isinstance(value, str) and value in replacements:
        seen.add(value)
        return replacements[value]
    return value


def dynamic_payload(node, dependency_results):
    template = node.get("subject_template")
    if not isinstance(template, dict) or set(template) != {
        "canonical_json_template",
        "dependency_result_max_bytes",
        "max_payload_bytes",
        "payload_sha256_at_admission",
    }:
        fail(f"dynamic-template:{node.get('atom_id')}")
    dependencies = node.get("dependencies")
    if not isinstance(dependencies, list) or not dependencies:
        fail(f"dynamic-dependencies:{node.get('atom_id')}")
    if list(dependency_results) != dependencies:
        fail(f"dependency-order:{node.get('atom_id')}")
    if len(dependencies) == 1:
        replacements = {"${SUMMARY_RESULT}": dependency_results[dependencies[0]]}
    elif len(dependencies) == 2:
        replacements = {
            "${LEFT_RESULT}": dependency_results[dependencies[0]],
            "${RIGHT_RESULT}": dependency_results[dependencies[1]],
        }
    else:
        fail(f"dependency-fanin:{node.get('atom_id')}:{len(dependencies)}")
    seen = set()
    materialized = substitute(template["canonical_json_template"], replacements, seen)
    if seen != set(replacements):
        fail(f"template-placeholders:{node.get('atom_id')}")
    payload = canonical_no_lf(materialized)
    if len(payload) > template["max_payload_bytes"]:
        fail(f"template-max:{node.get('atom_id')}")
    return payload


def atom_bytes(cell, node, dependency_results):
    if node.get("dynamic"):
        payload = dynamic_payload(node, dependency_results)
    else:
        if dependency_results or node.get("dependencies") != []:
            fail(f"static-dependency:{node.get('atom_id')}")
        payload_field = node.get("subject_payload")
        payload_text = text_field(payload_field, f"payload:{node.get('atom_id')}")
        payload = payload_text.encode("utf-8")
    try:
        payload_text = payload.decode("utf-8")
    except UnicodeDecodeError:
        fail(f"payload-utf8:{node.get('atom_id')}")
    dependencies = []
    for atom_id in node.get("dependencies", []):
        result = dependency_results[atom_id]
        result_data = result.encode("utf-8")
        dependencies.append(
            {
                "atom_id": atom_id,
                "result_bytes": len(result_data),
                "result_sha256": sha256(result_data),
            }
        )
    value = {
        "acceptance_criterion": text_field(node.get("acceptance_criterion"), f"criterion:{node.get('atom_id')}"),
        "atom_id": node.get("atom_id"),
        "attempt_id": node.get("attempt_id"),
        "dependencies": dependencies,
        "goal_objective": text_field(node.get("goal_objective"), f"objective:{node.get('atom_id')}"),
        "kind": node.get("kind"),
        "output_contract": text_field(node.get("output_contract"), f"output:{node.get('atom_id')}"),
        "payload": payload_text,
        "payload_sha256": sha256(payload),
        "route": cell.get("route"),
        "schema_id": ATOM_SCHEMA,
    }
    if not all(isinstance(value[key], str) and value[key] for key in (
        "acceptance_criterion",
        "atom_id",
        "attempt_id",
        "goal_objective",
        "kind",
        "output_contract",
        "payload_sha256",
        "route",
        "schema_id",
    )):
        fail(f"atom-fields:{node.get('atom_id')}")
    return canonical(value)


def closed_result_max(node, encoded_atom):
    kind = node.get("kind")
    if kind in {"EVIDENCE_SLICE_LABEL", "ENDPOINT_SLICE_LABEL", "PAIR_SIGNAL_REDUCER"}:
        maximum = node.get("result_max_bytes")
    elif kind == "FINAL_OPTION_SELECTOR":
        atom = parse_json(encoded_atom, f"atom-result:{node.get('atom_id')}")
        payload = parse_json(atom["payload"].encode("utf-8"), f"option-payload:{node.get('atom_id')}", False)
        options = payload.get("o") if isinstance(payload, dict) else None
        if not isinstance(options, list) or not options or not all(isinstance(item, str) for item in options):
            fail(f"option-list:{node.get('atom_id')}")
        maximum = max(len(canonical_no_lf({"selected_choice": item})) for item in options)
    elif kind == "FINAL_EDGE_VERDICT":
        maximum = max(
            len(canonical_no_lf({"verdict": "supported"})),
            len(canonical_no_lf({"verdict": "unsupported"})),
        )
    elif kind == "FINAL_TENSION_VERDICT":
        maximum = max(
            len(canonical_no_lf({"preserve_boundary": True})),
            len(canonical_no_lf({"preserve_boundary": False})),
        )
    elif kind == "FINAL_EDGE_VERDICT_PER_EDGE":
        maximum = 1
    elif kind == "FINAL_SPECIALIST_CODE":
        maximum = 3
    else:
        fail(f"result-kind:{kind}")
    if not isinstance(maximum, int) or maximum < 1:
        fail(f"result-max:{node.get('atom_id')}")
    return maximum


def spawn_message(goal, relative, atom_data):
    message = (
        f"G={goal}\nF={relative}\nB={len(atom_data)}\nH={sha256(atom_data)}\n"
        "First:create_goal(G);require ACTIVE. Then one exec: wc -c F && sha256sum F && "
        "sed -n '1,4096p' F. Require B/H;solve only JSON;update_goal complete;final "
        "R|RESULT|G|threadId. No other tool/read/retry."
    )
    return message.encode("utf-8")


def maximum_dependency_results(node, by_id):
    out = {}
    for atom_id in node.get("dependencies", []):
        dependency = by_id.get(atom_id)
        if dependency is None:
            fail(f"missing-dependency:{node.get('atom_id')}:{atom_id}")
        maximum = dependency.get("result_max_bytes")
        if not isinstance(maximum, int) or not 1 <= maximum <= RESULT_HARD_MAX:
            fail(f"dependency-result-max:{atom_id}")
        out[atom_id] = "X" * maximum
    return out


def inspect_plan(compiler, base, matrix_id):
    public_files, scorer_files, capacity = compiler.make_outputs(base, matrix_id)
    expected_routes = [item[0] for item in ROSTER]
    atom_count = 0
    static_count = 0
    dynamic_count = 0
    max_atom = (0, None)
    max_spawn = (0, None)
    max_result = (0, None)
    attempt_ids = set()
    static_nonces = set()
    ready_candidates = {route: [] for route in expected_routes}
    ordinal = 0
    cell_projection = []
    for path, data in sorted(public_files.items()):
        if not path.startswith("cells/"):
            continue
        cell = parse_json(data, path)
        route = cell.get("route")
        if route not in ready_candidates:
            fail(f"route:{path}")
        nodes = cell.get("nodes")
        if not isinstance(nodes, list) or not nodes:
            fail(f"nodes:{path}")
        by_id = {}
        for node in nodes:
            atom_id = node.get("atom_id")
            if not isinstance(atom_id, str) or not atom_id or atom_id in by_id:
                fail(f"atom-id:{path}")
            by_id[atom_id] = node
        cell_projection.append({"bytes": len(data), "path": path, "sha256": sha256(data)})
        for node in nodes:
            atom_count += 1
            ordinal += 1
            dynamic = node.get("dynamic") is True
            static_count += int(not dynamic)
            dynamic_count += int(dynamic)
            aid = node.get("attempt_id")
            if not isinstance(aid, str) or aid in attempt_ids:
                fail(f"attempt-reuse:{aid}")
            attempt_ids.add(aid)
            if not dynamic:
                nonce = node.get("atom_nonce")
                if not isinstance(nonce, str) or nonce in static_nonces:
                    fail(f"static-nonce-reuse:{nonce}")
                static_nonces.add(nonce)
            dependency_results = maximum_dependency_results(node, by_id) if dynamic else {}
            encoded = atom_bytes(cell, node, dependency_results)
            if len(encoded) > max_atom[0]:
                max_atom = (len(encoded), f"{path}#{node['atom_id']}")
            relative = f"r9_codex_goal_runs/{matrix_id}/atoms/{ordinal:05d}.json"
            message = spawn_message(node["goal_objective"]["utf8"], relative, encoded)
            if len(message) > max_spawn[0]:
                max_spawn = (len(message), f"{path}#{node['atom_id']}")
            if len(encoded) > ATOM_MAX:
                fail(f"atom-byte-limit:{path}#{node['atom_id']}:{len(encoded)}")
            if len(message) > SPAWN_MAX:
                fail(f"spawn-byte-limit:{path}#{node['atom_id']}:{len(message)}")
            result_maximum = closed_result_max(node, encoded)
            if result_maximum > max_result[0]:
                max_result = (result_maximum, f"{path}#{node['atom_id']}")
            if result_maximum > RESULT_HARD_MAX or result_maximum + 41 > FINAL_HARD_MAX:
                fail(f"result-byte-limit:{path}#{node['atom_id']}")
            if dynamic and node.get("dependencies") and all(not by_id[item].get("dynamic") for item in node["dependencies"]):
                ready_candidates[route].append(
                    {
                        "cell_file": path,
                        "cell_index": cell.get("cell_index"),
                        "dynamic_atom_id": node["atom_id"],
                        "predecessor_atom_ids": list(node["dependencies"]),
                    }
                )
    if atom_count != capacity.get("exact_atom_count") or atom_count != 15612:
        fail(f"atom-count:{atom_count}")
    if static_count != 7803 or dynamic_count != 7809:
        fail(f"static-dynamic-count:{static_count}:{dynamic_count}")
    cases = []
    for route, route_code, model, effort in ROSTER:
        candidates = ready_candidates[route]
        if not candidates:
            fail(f"canary-candidate:{route}")
        candidate = candidates[0]
        candidate.update(
            {
                "model_requested": model,
                "reasoning_effort_requested": effort,
                "route": route,
                "route_code": route_code,
                "task_count": len(candidate["predecessor_atom_ids"]) + 1,
            }
        )
        cases.append(candidate)
    fanins = [len(item["predecessor_atom_ids"]) for item in cases]
    projection = canonical_no_lf(cell_projection)
    scorer_projection = canonical_no_lf(
        [{"bytes": len(data), "path": path, "sha256": sha256(data)} for path, data in sorted(scorer_files.items())]
    )
    report = {
        "attempt_id_count": len(attempt_ids),
        "canary_cases": cases,
        "canary_task_count": sum(item["task_count"] for item in cases),
        "cell_projection_bytes": len(projection),
        "cell_projection_sha256": sha256(projection),
        "dynamic_atom_count": dynamic_count,
        "max_atom_file_bytes": max_atom[0],
        "max_atom_file_owner": max_atom[1],
        "max_spawn_message_bytes": max_spawn[0],
        "max_spawn_message_owner": max_spawn[1],
        "max_valid_model_result_bytes": max_result[0],
        "max_valid_model_result_owner": max_result[1],
        "max_valid_result_envelope_bytes": max_result[0] + 41,
        "minimum_ready_dynamic_static_predecessor_count": min(fanins),
        "model_call_count": atom_count,
        "scorer_projection_bytes": len(scorer_projection),
        "scorer_projection_sha256": sha256(scorer_projection),
        "static_atom_count": static_count,
        "static_nonce_count": len(static_nonces),
    }
    return report, attempt_ids, static_nonces


def run(base):
    bound = {}
    compiler_path, compiler_data = read_bound(base, COMPILER, "compiler")
    bound["compiler"] = COMPILER
    for name, binding, expected_status in (
        ("design_review_failure", DESIGN_FAILURE, "FAIL_CONSUMED_DIRECT_FILE_DAG_V1_DESIGN_REVIEW_ZERO_AUTHORITY"),
        ("frozen_authority", FROZEN_AUTHORITY, "AUTHORIZED_IMPLEMENTATION_AND_MECHANICAL_VALIDATION_ONLY_ZERO_CREDIT_NO_LAUNCH"),
        ("churn_audit", CHURN_AUDIT, "CHURN_DETECTED_FAMILIES_FROZEN_PIVOT_ACTIVE_ZERO_CREDIT_NO_LAUNCH"),
    ):
        _path, data = read_bound(base, binding, name)
        value = parse_json(data, name)
        if value.get("status") != expected_status:
            fail(f"status:{name}")
        bound[name] = binding
    compiler = load_compiler(compiler_path)
    plans = {}
    global_attempt_ids = set()
    global_static_nonces = set()
    for matrix_id in PLAN_IDS:
        report, attempt_ids, static_nonces = inspect_plan(compiler, base, matrix_id)
        if global_attempt_ids.intersection(attempt_ids):
            fail(f"cross-plan-attempt-reuse:{matrix_id}")
        if global_static_nonces.intersection(static_nonces):
            fail(f"cross-plan-static-nonce-reuse:{matrix_id}")
        global_attempt_ids.update(attempt_ids)
        global_static_nonces.update(static_nonces)
        plans[matrix_id] = report
    counts = {value["model_call_count"] for value in plans.values()}
    fanins = {value["minimum_ready_dynamic_static_predecessor_count"] for value in plans.values()}
    canary_counts = {value["canary_task_count"] for value in plans.values()}
    if counts != {15612} or fanins != {2} or canary_counts != {9}:
        fail(f"cross-plan-invariant:{sorted(counts)}:{sorted(fanins)}:{sorted(canary_counts)}")
    if len(global_attempt_ids) != 3 * 15612 or len(global_static_nonces) != 3 * 7803:
        fail("cross-plan-attempt-count")
    return {
        "atom_file_limit": ATOM_MAX,
        "bindings": bound,
        "check": "PASS",
        "derived_smallest_honest_canary_task_count": 9,
        "final_envelope_hard_limit": FINAL_HARD_MAX,
        "first_mismatch": None,
        "plans": plans,
        "qualification_credit": 0,
        "schema_id": SCHEMA,
        "result_hard_limit": RESULT_HARD_MAX,
        "spawn_message_limit": SPAWN_MAX,
        "status": "PASS_EXECUTABLE_DERIVATION_ZERO_CREDIT_NO_LAUNCH_AUTHORITY",
        "workspace_writes": 0,
    }


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--base", required=True)
    parser.add_argument("--check", action="store_true")
    args, extra = parser.parse_known_args()
    result = None
    code = 1
    try:
        if extra or not args.check:
            fail("CLI")
        base = Path(args.base)
        if not base.is_absolute() or not base.is_dir():
            fail("base")
        result = run(base.resolve())
        code = 0
    except (Invalid, OSError, ValueError, TypeError) as exc:
        result = {
            "check": "FAIL",
            "first_mismatch": str(exc),
            "qualification_credit": 0,
            "schema_id": SCHEMA,
            "status": "FAIL_ZERO_CREDIT_NO_LAUNCH_AUTHORITY",
            "workspace_writes": 0,
        }
    sys.stdout.buffer.write(canonical(result))
    return code


if __name__ == "__main__":
    raise SystemExit(main())
