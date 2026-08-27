#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import re
import stat
import sys
from pathlib import Path


ATOM_SCHEMA = "pw-r9-codex-native-goal-direct-typed-atom-v1"
CELL_SCHEMA = "pw-r9-codex-native-goal-atomic-cell-dag-v1"
NODE_SCHEMA = "pw-r9-codex-native-goal-atomic-node-v1"
RESULT_SCHEMA = "pw-r9-codex-native-goal-direct-typed-atom-result-v1"
SCHEMA = "pw-r9-codex-native-goal-direct-typed-atom-materializer-v1"
ATOM_MAX = 4096
SPAWN_MAX = 512
RESULT_HARD_MAX = 128
FINAL_HARD_MAX = 169
UUID_RE = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")
TASK_RE = re.compile(r"/root/[a-z0-9_]{1,120}")
TRACE_RE = re.compile(r"[0-9]{4}/[0-9]{2}/[0-9]{2}/rollout-[A-Za-z0-9_.:-]+\.jsonl")
ATOM_ID_RE = re.compile(r"n[0-9]{5}")
MATRIX_RE = re.compile(r"[a-z0-9][a-z0-9-]{0,62}")
STATIC_KEYS = {
    "acceptance_criterion", "atom_id", "atom_nonce", "atom_path", "attempt", "attempt_id",
    "control_bind", "dependencies", "dynamic", "goal_objective", "kind", "output_contract",
    "result_max_bytes", "result_validation", "route_code", "schema_id", "spawn_bootstrap",
    "subject_atom", "subject_payload", "task_name",
}
DYNAMIC_KEYS = {
    "acceptance_criterion", "atom_id", "atom_path", "attempt", "attempt_id", "dependencies",
    "dynamic", "goal_objective", "identity_derivation", "kind", "output_contract",
    "result_max_bytes", "result_validation", "route_code", "schema_id", "subject_template",
    "wire_message_max_bytes", "wire_messages",
}
CELL_KEYS = {
    "assembly_recipe", "cell", "cell_index", "compiler_family", "context_coverage",
    "context_identity", "control_manifest_projection_bytes", "control_manifest_sha256",
    "dependency_gate", "final_node_ids", "matrix_id", "model_requested", "nodes",
    "reasoning_effort_requested", "root_signal_node_id", "route", "route_code", "schema_id",
    "source_shape",
}


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


def parse_json(data, where, require_lf=True):
    try:
        value = json.loads(
            data.decode("utf-8"),
            object_pairs_hook=unique_object,
            parse_constant=lambda item: fail(f"nonfinite:{where}:{item}"),
        )
    except Invalid:
        raise
    except Exception as exc:
        fail(f"json:{where}:{type(exc).__name__}")
    expected = canonical(value) if require_lf else canonical_no_lf(value)
    if data != expected:
        fail(f"canonical:{where}")
    return value


def read_regular(path, where):
    if not path.is_absolute():
        fail(f"absolute:{where}")
    try:
        resolved = path.resolve(strict=True)
        info = path.lstat()
    except OSError as exc:
        fail(f"stat:{where}:{type(exc).__name__}")
    if resolved != path or not stat.S_ISREG(info.st_mode) or stat.S_IMODE(info.st_mode) != 0o644:
        fail(f"type-or-mode:{where}")
    flags = os.O_RDONLY
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags)
    try:
        opened = os.fstat(fd)
        if not stat.S_ISREG(opened.st_mode) or (opened.st_dev, opened.st_ino) != (info.st_dev, info.st_ino):
            fail(f"read-custody:{where}")
        chunks = []
        while True:
            chunk = os.read(fd, 1024 * 1024)
            if not chunk:
                break
            chunks.append(chunk)
    finally:
        os.close(fd)
    post = path.lstat()
    if (post.st_dev, post.st_ino, post.st_size, post.st_mtime_ns) != (info.st_dev, info.st_ino, info.st_size, info.st_mtime_ns):
        fail(f"read-drift:{where}")
    return b"".join(chunks)


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


def load_cell(path):
    data = read_regular(path, "cell")
    cell = parse_json(data, "cell")
    if not isinstance(cell, dict) or set(cell) != CELL_KEYS or cell.get("schema_id") != CELL_SCHEMA:
        fail("cell-fields-or-schema")
    if not MATRIX_RE.fullmatch(cell.get("matrix_id", "")):
        fail("matrix-id")
    if cell.get("route") not in {"slot-alpha", "slot-bravo", "slot-charlie"}:
        fail("route")
    nodes = cell.get("nodes")
    if not isinstance(nodes, list) or not nodes:
        fail("nodes")
    by_id = {}
    previous = set()
    for node in nodes:
        expected = DYNAMIC_KEYS if node.get("dynamic") is True else STATIC_KEYS
        if not isinstance(node, dict) or set(node) != expected or node.get("schema_id") != NODE_SCHEMA:
            fail("node-fields-or-schema")
        atom_id = node.get("atom_id")
        if not isinstance(atom_id, str) or not ATOM_ID_RE.fullmatch(atom_id) or atom_id in by_id:
            fail("atom-id")
        dependencies = node.get("dependencies")
        if not isinstance(dependencies, list) or len(set(dependencies)) != len(dependencies):
            fail(f"dependencies:{atom_id}")
        if any(item not in previous for item in dependencies):
            fail(f"dependency-order:{atom_id}")
        if node.get("route_code") != cell.get("route_code") or node.get("attempt") != 0:
            fail(f"node-fixed:{atom_id}")
        by_id[atom_id] = node
        previous.add(atom_id)
    return cell, by_id


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
        "canonical_json_template", "dependency_result_max_bytes", "max_payload_bytes",
        "payload_sha256_at_admission",
    }:
        fail("subject-template")
    dependencies = node["dependencies"]
    if list(dependency_results) != dependencies:
        fail("dependency-result-order")
    if len(dependencies) == 1:
        replacements = {"${SUMMARY_RESULT}": dependency_results[dependencies[0]]}
    elif len(dependencies) == 2:
        replacements = {
            "${LEFT_RESULT}": dependency_results[dependencies[0]],
            "${RIGHT_RESULT}": dependency_results[dependencies[1]],
        }
    else:
        fail("dependency-fanin")
    seen = set()
    value = substitute(template["canonical_json_template"], replacements, seen)
    if seen != set(replacements):
        fail("template-placeholders")
    payload = canonical_no_lf(value)
    if len(payload) > template["max_payload_bytes"]:
        fail("payload-max")
    return payload


def build_atom(cell, node, dependency_results):
    if node["dynamic"]:
        payload = dynamic_payload(node, dependency_results)
    else:
        if dependency_results or node["dependencies"]:
            fail("static-dependencies")
        payload = text_field(node.get("subject_payload"), "subject-payload").encode("utf-8")
    dependencies = []
    for atom_id in node["dependencies"]:
        result = dependency_results[atom_id]
        encoded = result.encode("utf-8")
        dependencies.append({"atom_id": atom_id, "result_bytes": len(encoded), "result_sha256": sha256(encoded)})
    value = {
        "acceptance_criterion": text_field(node["acceptance_criterion"], "acceptance"),
        "atom_id": node["atom_id"],
        "attempt_id": node["attempt_id"],
        "dependencies": dependencies,
        "goal_objective": text_field(node["goal_objective"], "objective"),
        "kind": node["kind"],
        "output_contract": text_field(node["output_contract"], "output-contract"),
        "payload": payload.decode("utf-8"),
        "payload_sha256": sha256(payload),
        "route": cell["route"],
        "schema_id": ATOM_SCHEMA,
    }
    data = canonical(value)
    if len(data) > ATOM_MAX:
        fail(f"atom-limit:{len(data)}")
    return value, data


def valid_result(node, result):
    if not isinstance(result, str):
        fail("result-type")
    data = result.encode("utf-8")
    if not 1 <= len(data) <= RESULT_HARD_MAX or "|" in result or "\r" in result or "\n" in result:
        fail("result-bytes")
    kind = node["kind"]
    if kind in {"EVIDENCE_SLICE_LABEL", "ENDPOINT_SLICE_LABEL", "PAIR_SIGNAL_REDUCER"}:
        maximum = node["result_max_bytes"]
        if len(data) > maximum or not re.fullmatch(r"[A-Za-z0-9._:-]+", result):
            fail("result-signal")
    elif kind == "FINAL_OPTION_SELECTOR":
        try:
            value = parse_json(data, "result-option", False)
        except Invalid:
            raise
        options = node["subject_template"]["canonical_json_template"].get("o")
        if not isinstance(value, dict) or set(value) != {"selected_choice"} or value["selected_choice"] not in options:
            fail("result-option")
    elif kind == "FINAL_EDGE_VERDICT":
        value = parse_json(data, "result-edge", False)
        if value not in ({"verdict": "supported"}, {"verdict": "unsupported"}):
            fail("result-edge")
    elif kind == "FINAL_TENSION_VERDICT":
        value = parse_json(data, "result-tension", False)
        if not isinstance(value, dict) or set(value) != {"preserve_boundary"} or not isinstance(value["preserve_boundary"], bool):
            fail("result-tension")
    elif kind == "FINAL_EDGE_VERDICT_PER_EDGE":
        if result not in {"S", "U"}:
            fail("result-per-edge")
    elif kind == "FINAL_SPECIALIST_CODE":
        if not re.fullmatch(r"[SU]:[A-Z0-9]", result):
            fail("result-specialist")
    else:
        fail("result-kind")
    return data


def read_result_record(path, cell, by_id):
    data = read_regular(path, "dependency-record")
    value = parse_json(data, "dependency-record")
    expected = {
        "atom_id", "final_envelope", "goal_thread_id", "matrix_id", "result_bytes", "result_sha256",
        "result_utf8", "route", "schema_id", "task_path", "trace",
    }
    if not isinstance(value, dict) or set(value) != expected or value.get("schema_id") != RESULT_SCHEMA:
        fail("dependency-record-fields")
    atom_id = value.get("atom_id")
    node = by_id.get(atom_id)
    if node is None or value.get("matrix_id") != cell["matrix_id"] or value.get("route") != cell["route"]:
        fail("dependency-record-owner")
    trace = value.get("trace")
    if (
        not UUID_RE.fullmatch(value.get("goal_thread_id", ""))
        or not TASK_RE.fullmatch(value.get("task_path", ""))
        or not isinstance(trace, dict)
        or set(trace) != {"bytes", "mode", "relative_path", "sha256"}
        or not isinstance(trace["bytes"], int)
        or trace["bytes"] < 1
        or trace["mode"] != "0664"
        or not TRACE_RE.fullmatch(trace["relative_path"])
        or not re.fullmatch(r"[0-9a-f]{64}", trace["sha256"])
    ):
        fail("dependency-provenance")
    result_data = valid_result(node, value.get("result_utf8"))
    if len(result_data) != value.get("result_bytes") or sha256(result_data) != value.get("result_sha256"):
        fail("dependency-result-identity")
    if value.get("final_envelope") != f"R|{value['result_utf8']}|G|{value.get('goal_thread_id')}":
        fail("dependency-envelope")
    return value


def spawn_message(goal, relative, atom_data):
    message = (
        f"G={goal}\nF={relative}\nB={len(atom_data)}\nH={sha256(atom_data)}\n"
        "First:create_goal(G);require ACTIVE. Then one exec: wc -c F && sha256sum F && "
        "sed -n '1,4096p' F. Require B/H;solve only JSON;update_goal complete;final "
        "R|RESULT|G|threadId. No other tool/read/retry."
    ).encode("utf-8")
    if len(message) > SPAWN_MAX:
        fail(f"spawn-limit:{len(message)}")
    return message


def ensure_parent(path, workspace, where):
    if not path.is_absolute():
        fail(f"absolute:{where}")
    resolved = path.resolve(strict=False)
    if resolved != path:
        fail(f"noncanonical:{where}")
    try:
        resolved.relative_to(workspace)
    except ValueError:
        fail(f"workspace-escape:{where}")
    parent = path.parent
    try:
        info = parent.lstat()
    except OSError as exc:
        fail(f"parent:{where}:{type(exc).__name__}")
    if not stat.S_ISDIR(info.st_mode) or stat.S_ISLNK(info.st_mode) or info.st_uid != os.getuid():
        fail(f"parent-custody:{where}")


def write_exact(path, data):
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    directory_flags = os.O_RDONLY
    if hasattr(os, "O_DIRECTORY"):
        directory_flags |= os.O_DIRECTORY
    if hasattr(os, "O_NOFOLLOW"):
        directory_flags |= os.O_NOFOLLOW
    parent_info = path.parent.lstat()
    dfd = os.open(path.parent, directory_flags)
    try:
        opened_parent = os.fstat(dfd)
        if (opened_parent.st_dev, opened_parent.st_ino) != (parent_info.st_dev, parent_info.st_ino):
            fail("parent-race")
        fd = os.open(path.name, flags, 0o644, dir_fd=dfd)
        try:
            offset = 0
            while offset < len(data):
                offset += os.write(fd, data[offset:])
            os.fsync(fd)
        finally:
            os.close(fd)
        os.chmod(path.name, 0o644, dir_fd=dfd, follow_symlinks=False)
        os.fsync(dfd)
    finally:
        os.close(dfd)
    reopened = read_regular(path, "written")
    if reopened != data:
        fail("write-reopen")


def do_check(cell_path):
    cell, by_id = load_cell(cell_path)
    maximum_atom = 0
    maximum_spawn = 0
    ready = []
    ordinal = 0
    for node in cell["nodes"]:
        ordinal += 1
        dependencies = {
            atom_id: "X" * by_id[atom_id]["result_max_bytes"] for atom_id in node["dependencies"]
        } if node["dynamic"] else {}
        _value, data = build_atom(cell, node, dependencies)
        relative = f"r9_codex_goal_runs/{cell['matrix_id']}/atoms/{ordinal:05d}.json"
        spawn = spawn_message(node["goal_objective"]["utf8"], relative, data)
        maximum_atom = max(maximum_atom, len(data))
        maximum_spawn = max(maximum_spawn, len(spawn))
        if node["dynamic"] and all(not by_id[item]["dynamic"] for item in node["dependencies"]):
            ready.append({"atom_id": node["atom_id"], "predecessor_atom_ids": node["dependencies"]})
    return {
        "atom_count": len(cell["nodes"]),
        "check": "PASS",
        "first_mismatch": None,
        "matrix_id": cell["matrix_id"],
        "max_atom_bytes": maximum_atom,
        "max_spawn_bytes": maximum_spawn,
        "qualification_credit": 0,
        "ready_dynamic_candidates": ready,
        "route": cell["route"],
        "schema_id": SCHEMA,
        "status": "PASS_DATA_ONLY_ZERO_CREDIT_NO_LAUNCH_AUTHORITY",
        "workspace_writes": 0,
    }


def do_materialize(args):
    workspace = Path(args.workspace_root).resolve(strict=True)
    cell, by_id = load_cell(Path(args.cell))
    node = by_id.get(args.atom_id)
    if node is None:
        fail("target-atom")
    records = [read_result_record(Path(path), cell, by_id) for path in args.dependency_record]
    if [item["atom_id"] for item in records] != node["dependencies"]:
        fail("dependency-record-order")
    dependencies = {item["atom_id"]: item["result_utf8"] for item in records}
    _value, atom_data = build_atom(cell, node, dependencies)
    atom_path = Path(args.output)
    spawn_path = Path(args.spawn_output)
    ensure_parent(atom_path, workspace, "atom-output")
    ensure_parent(spawn_path, workspace, "spawn-output")
    relative = atom_path.relative_to(workspace).as_posix()
    spawn_data = spawn_message(node["goal_objective"]["utf8"], relative, atom_data)
    write_exact(atom_path, atom_data)
    write_exact(spawn_path, spawn_data)
    return {
        "atom": {"bytes": len(atom_data), "mode": "0644", "path": relative, "sha256": sha256(atom_data)},
        "atom_id": node["atom_id"],
        "matrix_id": cell["matrix_id"],
        "qualification_credit": 0,
        "route": cell["route"],
        "schema_id": SCHEMA,
        "spawn_message": {"bytes": len(spawn_data), "mode": "0644", "path": spawn_path.relative_to(workspace).as_posix(), "sha256": sha256(spawn_data)},
        "status": "MATERIALIZED_CREATE_ONLY_ZERO_CREDIT_NO_LAUNCH_AUTHORITY",
        "workspace_writes": 2,
    }


def do_record(args):
    workspace = Path(args.workspace_root).resolve(strict=True)
    cell, by_id = load_cell(Path(args.cell))
    node = by_id.get(args.atom_id)
    if node is None:
        fail("target-atom")
    if not UUID_RE.fullmatch(args.goal_thread_id) or not TASK_RE.fullmatch(args.task_path):
        fail("task-or-goal")
    if args.trace_bytes < 1 or not TRACE_RE.fullmatch(args.trace_relative) or not re.fullmatch(r"[0-9a-f]{64}", args.trace_sha256):
        fail("trace")
    result_data = valid_result(node, args.result)
    final = f"R|{args.result}|G|{args.goal_thread_id}"
    if len(final.encode("utf-8")) > FINAL_HARD_MAX:
        fail("final-envelope-limit")
    value = {
        "atom_id": node["atom_id"],
        "final_envelope": final,
        "goal_thread_id": args.goal_thread_id,
        "matrix_id": cell["matrix_id"],
        "result_bytes": len(result_data),
        "result_sha256": sha256(result_data),
        "result_utf8": args.result,
        "route": cell["route"],
        "schema_id": RESULT_SCHEMA,
        "task_path": args.task_path,
        "trace": {"bytes": args.trace_bytes, "mode": "0664", "relative_path": args.trace_relative, "sha256": args.trace_sha256},
    }
    data = canonical(value)
    output = Path(args.output)
    ensure_parent(output, workspace, "result-output")
    write_exact(output, data)
    return {
        "atom_id": node["atom_id"],
        "qualification_credit": 0,
        "result_record": {"bytes": len(data), "mode": "0644", "path": output.relative_to(workspace).as_posix(), "sha256": sha256(data)},
        "schema_id": SCHEMA,
        "status": "RESULT_RECORDED_CREATE_ONLY_ZERO_CREDIT_PENDING_INDEPENDENT_TRACE_VERIFICATION",
        "workspace_writes": 1,
    }


def parser():
    result = argparse.ArgumentParser(add_help=False)
    sub = result.add_subparsers(dest="command", required=True)
    check = sub.add_parser("check", add_help=False)
    check.add_argument("--cell", required=True)
    check.add_argument("--check", action="store_true")
    materialize = sub.add_parser("materialize", add_help=False)
    materialize.add_argument("--workspace-root", required=True)
    materialize.add_argument("--cell", required=True)
    materialize.add_argument("--atom-id", required=True)
    materialize.add_argument("--dependency-record", action="append", default=[])
    materialize.add_argument("--output", required=True)
    materialize.add_argument("--spawn-output", required=True)
    record = sub.add_parser("record-result", add_help=False)
    record.add_argument("--workspace-root", required=True)
    record.add_argument("--cell", required=True)
    record.add_argument("--atom-id", required=True)
    record.add_argument("--result", required=True)
    record.add_argument("--goal-thread-id", required=True)
    record.add_argument("--task-path", required=True)
    record.add_argument("--trace-relative", required=True)
    record.add_argument("--trace-bytes", required=True, type=int)
    record.add_argument("--trace-sha256", required=True)
    record.add_argument("--output", required=True)
    return result


def main():
    args, extra = parser().parse_known_args()
    try:
        if extra:
            fail("CLI")
        if args.command == "check":
            if not args.check:
                fail("CLI-check")
            output = do_check(Path(args.cell))
        elif args.command == "materialize":
            output = do_materialize(args)
        else:
            output = do_record(args)
        code = 0
    except (Invalid, OSError, ValueError, TypeError, KeyError) as exc:
        output = {
            "first_mismatch": str(exc),
            "qualification_credit": 0,
            "schema_id": SCHEMA,
            "status": "FAIL_ZERO_CREDIT_NO_LAUNCH_AUTHORITY",
            "workspace_writes": 0,
        }
        code = 1
    sys.stdout.buffer.write(canonical(output))
    return code


if __name__ == "__main__":
    raise SystemExit(main())
