#!/usr/bin/env python3
import argparse
import copy
import hashlib
import json
import os
import stat
import subprocess
import sys
import tempfile
from pathlib import Path


SCHEMA = "pw-r9-codex-native-goal-direct-raw-rollout-verifier-mutation-check-v1"
VERIFIER = {
    "bytes": 19075,
    "mode": "0644",
    "sha256": "ba9b2d16d989b4a93a60512003437ca23285c075796ab87272c783b3ffbaee1d",
}
MANIFEST = {
    "bytes": 3962,
    "mode": "0644",
    "sha256": "7c2f6251235824d49f40ee07d1882fe3707da5f4be6baf6185e4a3e90f68fcd3",
}
MUTATIONS = (
    ("M01", "fields:manifest"),
    ("M02", "reuse:task_path"),
    ("M03", "route-roster"),
    ("M04", "escape:subject"),
    ("M05", "identity:trace"),
    ("M06", "session-identity"),
    ("M07", "subject-before-active-or-read"),
    ("M08", "web-search"),
    ("M09", "semantic-tool-order"),
    ("M10", "complete-goal"),
    ("M11", "final-envelope"),
    ("M12", "trace-terminal-lf"),
    ("M13", "custom-tool-totality"),
    ("M14", "orphan-output"),
)


class Invalid(Exception):
    pass


def fail(message):
    raise Invalid(message)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def parse(data, where):
    def object_hook(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                fail(f"duplicate-key:{where}:{key}")
            result[key] = value
        return result

    try:
        return json.loads(
            data.decode("utf-8") if isinstance(data, bytes) else data,
            object_pairs_hook=object_hook,
            parse_constant=lambda value: fail(f"nonfinite:{where}:{value}"),
        )
    except Invalid:
        raise
    except Exception as exc:
        fail(f"json:{where}:{type(exc).__name__}")


def read_exact(path, identity, where):
    try:
        info = path.lstat()
    except OSError as exc:
        fail(f"stat:{where}:{type(exc).__name__}")
    if not stat.S_ISREG(info.st_mode):
        fail(f"nonregular:{where}")
    if f"{stat.S_IMODE(info.st_mode):04o}" != identity["mode"]:
        fail(f"mode:{where}")
    data = path.read_bytes()
    if len(data) != identity["bytes"] or digest(data) != identity["sha256"]:
        fail(f"identity:{where}")
    return data


def safe_relative(root, path, where):
    root = root.resolve()
    path = path.resolve()
    try:
        return path.relative_to(root)
    except ValueError:
        fail(f"outside:{where}")


def source_snapshot(paths):
    result = []
    for path in sorted(set(paths), key=lambda item: str(item)):
        info = path.lstat()
        if not stat.S_ISREG(info.st_mode):
            fail(f"snapshot-nonregular:{path.name}")
        data = path.read_bytes()
        result.append((str(path), stat.S_IMODE(info.st_mode), len(data), digest(data)))
    return result


def write_temp(root, path, data, mode):
    root = root.resolve()
    unresolved = path if path.is_absolute() else root / path
    parent = unresolved.parent.resolve()
    try:
        parent.relative_to(root)
    except ValueError:
        fail("temp-write-escape")
    parent.mkdir(parents=True, exist_ok=True)
    unresolved.write_bytes(data)
    os.chmod(unresolved, mode)


def trace_records(data, where):
    if not data.endswith(b"\n"):
        fail(f"source-trace-lf:{where}")
    records = []
    for number, line in enumerate(data.splitlines(), 1):
        if not line:
            fail(f"source-trace-empty:{where}:{number}")
        value = parse(line, f"{where}:{number}")
        if not isinstance(value, dict):
            fail(f"source-trace-object:{where}:{number}")
        records.append(value)
    return records


def encode_records(records):
    return ("\n".join(canonical(record) for record in records) + "\n").encode("utf-8")


def payload_index(records, predicate, where):
    matches = []
    for index, record in enumerate(records):
        payload = record.get("payload") if record.get("type") == "response_item" else None
        if isinstance(payload, dict) and predicate(payload):
            matches.append(index)
    if len(matches) != 1:
        fail(f"mutation-source:{where}:{len(matches)}")
    return matches[0]


def update_trace_binding(manifest, slot, data):
    case = next((item for item in manifest["cases"] if item["slot"] == slot), None)
    if case is None:
        fail(f"missing-slot:{slot}")
    case["trace"]["bytes"] = len(data)
    case["trace"]["sha256"] = digest(data)


def mutate(identifier, manifest, subjects, traces):
    alpha = next(item for item in manifest["cases"] if item["slot"] == "alpha")
    charlie = next(item for item in manifest["cases"] if item["slot"] == "charlie")
    alpha_path = alpha["trace"]["relative_path"]
    charlie_path = charlie["trace"]["relative_path"]
    if identifier == "M01":
        manifest["unexpected"] = False
        return
    if identifier == "M02":
        manifest["cases"][1]["task_path"] = manifest["cases"][0]["task_path"]
        return
    if identifier == "M03":
        alpha["requested_reasoning_effort"] = "medium"
        return
    if identifier == "M04":
        alpha["subject"]["path"] = "../escape.json"
        return
    if identifier == "M05":
        alpha["trace"]["sha256"] = "0" * 64
        return
    if identifier == "M12":
        traces[alpha_path] = traces[alpha_path][:-1]
        update_trace_binding(manifest, "alpha", traces[alpha_path])
        return
    if identifier == "M13":
        records = trace_records(traces[charlie_path], identifier)
        index = payload_index(records, lambda p: p.get("type") == "custom_tool_call" and "tools.create_goal(" in p.get("input", ""), identifier)
        records[index]["payload"]["input"] += " tools.get_goal({});"
        traces[charlie_path] = encode_records(records)
        update_trace_binding(manifest, "charlie", traces[charlie_path])
        return
    records = trace_records(traces[alpha_path], identifier)
    if identifier == "M06":
        matches = [record for record in records if record.get("type") == "session_meta"]
        if len(matches) != 1:
            fail("mutation-source:M06")
        matches[0]["payload"]["agent_path"] = "/root/mutated"
    elif identifier == "M07":
        create = payload_index(records, lambda p: p.get("type") == "function_call" and p.get("name") == "create_goal", identifier)
        subject_line = subjects[alpha["subject"]["path"]].decode("utf-8").rstrip("\n")
        records.insert(create, {"type": "response_item", "payload": {"content": [{"text": subject_line, "type": "input_text"}], "role": "user", "type": "message"}})
    elif identifier == "M08":
        final = payload_index(records, lambda p: p.get("type") == "message" and p.get("phase") == "final_answer", identifier)
        records.insert(final, {"type": "response_item", "payload": {"type": "web_search_call"}})
    elif identifier == "M09":
        update = payload_index(records, lambda p: p.get("type") == "function_call" and p.get("name") == "update_goal", identifier)
        records[update:update] = [
            {"type": "response_item", "payload": {"arguments": "{}", "call_id": "mut-extra", "name": "get_goal", "type": "function_call"}},
            {"type": "response_item", "payload": {"call_id": "mut-extra", "output": "{}", "type": "function_call_output"}},
        ]
    elif identifier == "M10":
        update = payload_index(records, lambda p: p.get("type") == "function_call" and p.get("name") == "update_goal", identifier)
        output = records[update + 1].get("payload", {})
        if output.get("type") != "function_call_output":
            fail("mutation-source:M10-output")
        receipt = parse(output.get("output", ""), identifier)
        receipt["goal"]["threadId"] = "00000000-0000-0000-0000-000000000000"
        output["output"] = canonical(receipt)
    elif identifier == "M11":
        final = payload_index(records, lambda p: p.get("type") == "message" and p.get("phase") == "final_answer", identifier)
        records[final]["payload"]["content"][0]["text"] = "R|WRONG|G|WRONG"
    elif identifier == "M14":
        final = payload_index(records, lambda p: p.get("type") == "message" and p.get("phase") == "final_answer", identifier)
        records.insert(final, {"type": "response_item", "payload": {"call_id": "orphan", "output": "{}", "type": "function_call_output"}})
    else:
        fail(f"unknown-mutation:{identifier}")
    traces[alpha_path] = encode_records(records)
    update_trace_binding(manifest, "alpha", traces[alpha_path])


def invoke(verifier, manifest, workspace, session_root):
    completed = subprocess.run(
        [
            sys.executable,
            "-B",
            str(verifier),
            "--manifest",
            str(manifest),
            "--workspace-root",
            str(workspace),
            "--session-root",
            str(session_root),
            "--check",
        ],
        cwd=str(workspace),
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if completed.stderr != b"":
        fail("verifier-stderr")
    if not completed.stdout.endswith(b"\n") or completed.stdout.count(b"\n") != 1:
        fail("verifier-stdout-framing")
    result = parse(completed.stdout, "verifier-stdout")
    if completed.stdout != (canonical(result) + "\n").encode("utf-8"):
        fail("verifier-stdout-canonical")
    return completed.returncode, result


def build_tree(temp_root, manifest_relative, manifest, dependencies, subjects, traces):
    workspace = temp_root / "workspace"
    session_root = temp_root / "sessions"
    manifest_path = workspace / manifest_relative
    for relative, (data, mode) in dependencies.items():
        write_temp(temp_root, manifest_path.parent / relative, data, mode)
    for relative, (data, mode) in subjects.items():
        write_temp(temp_root, workspace / relative, data, mode)
    for relative, (data, mode) in traces.items():
        write_temp(temp_root, session_root / relative, data, mode)
    manifest_data = (canonical(manifest) + "\n").encode("utf-8")
    write_temp(temp_root, manifest_path, manifest_data, 0o644)
    return workspace, session_root, manifest_path


def run(args):
    verifier = Path(args.verifier)
    manifest_path = Path(args.manifest)
    workspace_root = Path(args.workspace_root)
    session_root = Path(args.session_root)
    for path, where in ((verifier, "verifier"), (manifest_path, "manifest"), (workspace_root, "workspace"), (session_root, "sessions")):
        if not path.is_absolute():
            fail(f"absolute:{where}")
    verifier_data = read_exact(verifier, VERIFIER, "verifier")
    manifest_data = read_exact(manifest_path, MANIFEST, "manifest")
    manifest = parse(manifest_data, "manifest")
    if manifest_data != (canonical(manifest) + "\n").encode("utf-8"):
        fail("manifest-canonical")
    manifest_relative = safe_relative(workspace_root, manifest_path, "manifest")
    dependencies = {}
    watched = [verifier, manifest_path]
    for binding in manifest["bindings"].values():
        source = manifest_path.parent / binding["path"]
        data = read_exact(source, binding, "dependency")
        dependencies[binding["path"]] = (data, int(binding["mode"], 8))
        watched.append(source)
    subjects = {}
    traces = {}
    for case in manifest["cases"]:
        subject = case["subject"]
        subject_path = workspace_root / subject["path"]
        subjects[subject["path"]] = (read_exact(subject_path, subject, "subject"), int(subject["mode"], 8))
        watched.append(subject_path)
        trace = case["trace"]
        trace_path = session_root / trace["relative_path"]
        traces[trace["relative_path"]] = (read_exact(trace_path, {"bytes": trace["bytes"], "mode": trace["mode"], "sha256": trace["sha256"]}, "trace"), int(trace["mode"], 8))
        watched.append(trace_path)
    before = source_snapshot(watched)
    with tempfile.TemporaryDirectory(prefix="r9-direct-mutation-") as temp_name:
        temp_root = Path(temp_name)
        base_subjects = {key: value[0] for key, value in subjects.items()}
        base_traces = {key: value[0] for key, value in traces.items()}
        workspace, temp_sessions, temp_manifest = build_tree(temp_root, manifest_relative, copy.deepcopy(manifest), dependencies, subjects, traces)
        baseline_code, baseline = invoke(verifier, temp_manifest, workspace, temp_sessions)
        if baseline_code != 0 or baseline.get("status") != "PASS_ZERO_CREDIT" or baseline.get("qualification_credit") != 0 or baseline.get("workspace_writes") != 0:
            fail("baseline")
        mutation_results = []
        for identifier, expected in MUTATIONS:
            case_manifest = copy.deepcopy(manifest)
            case_subjects = dict(base_subjects)
            case_traces = dict(base_traces)
            mutate(identifier, case_manifest, case_subjects, case_traces)
            case_subject_pairs = {key: (data, subjects[key][1]) for key, data in case_subjects.items()}
            case_trace_pairs = {key: (data, traces[key][1]) for key, data in case_traces.items()}
            case_root = temp_root / identifier
            workspace, temp_sessions, temp_manifest = build_tree(case_root, manifest_relative, case_manifest, dependencies, case_subject_pairs, case_trace_pairs)
            code, result = invoke(verifier, temp_manifest, workspace, temp_sessions)
            observed = result.get("first_mismatch")
            if code != 1 or result.get("status") != "FAIL" or observed != expected or result.get("qualification_credit") != 0 or result.get("workspace_writes") != 0:
                fail(f"mutation:{identifier}:expected={expected}:observed={observed}:rc={code}")
            mutation_results.append({"first_mismatch": observed, "id": identifier, "status": "REJECTED"})
    after = source_snapshot(watched)
    if before != after:
        fail("workspace-drift")
    return {
        "baseline_status": "PASS_ZERO_CREDIT",
        "first_mismatch": None,
        "mutation_count": len(mutation_results),
        "mutations": mutation_results,
        "qualification_credit": 0,
        "schema_id": SCHEMA,
        "status": "PASS_ZERO_CREDIT",
        "workspace_writes": 0,
    }


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--verifier", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--workspace-root", required=True)
    parser.add_argument("--session-root", required=True)
    parser.add_argument("--check", action="store_true")
    args, extra = parser.parse_known_args()
    try:
        if extra or not args.check:
            fail("CLI")
        result = run(args)
        code = 0
    except (Invalid, OSError) as exc:
        result = {
            "baseline_status": "FAIL",
            "first_mismatch": str(exc),
            "mutation_count": 0,
            "mutations": [],
            "qualification_credit": 0,
            "schema_id": SCHEMA,
            "status": "FAIL",
            "workspace_writes": 0,
        }
        code = 1
    print(canonical(result))
    return code


if __name__ == "__main__":
    sys.exit(main())
