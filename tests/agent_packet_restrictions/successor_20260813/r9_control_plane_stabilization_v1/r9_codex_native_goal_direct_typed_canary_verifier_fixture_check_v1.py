#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


SCHEMA = "pw-r9-codex-native-goal-direct-typed-canary-verifier-fixture-check-v1"
MANIFEST_SCHEMA = "pw-r9-codex-native-goal-direct-typed-canary-verifier-manifest-v1"
ROUTES = (
    ("slot-alpha", "gpt-5.4-mini", "xhigh", "function_call_v1"),
    ("slot-bravo", "gpt-5.4-mini", "medium", "function_call_v1"),
    ("slot-charlie", "gpt-5.6-luna", "medium", "custom_exec_v1"),
)


class Invalid(Exception):
    pass


def sha(data):
    return hashlib.sha256(data).hexdigest()


def canonical(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode("utf-8")


def binding(path, root):
    data = path.read_bytes()
    return {
        "bytes": len(data),
        "mode": f"{path.stat().st_mode & 0o777:04o}",
        "path": path.relative_to(root).as_posix(),
        "sha256": sha(data),
    }


def invoke_materializer(materializer, arguments):
    process = subprocess.run(
        [sys.executable, "-B", str(materializer), *map(str, arguments)],
        env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
        capture_output=True,
        text=True,
    )
    if process.returncode != 0:
        raise Invalid(f"materializer:{process.stdout.strip()}:{process.stderr.strip()}")


def trace_bytes(goal, task, atom_relative, atom_data, result, encoding, thread_id):
    command = f"wc -c {atom_relative} && sha256sum {atom_relative} && sed -n '1,4096p' {atom_relative}"
    active = {
        "goal": {"threadId": thread_id, "objective": goal, "status": "active", "tokensUsed": 0, "timeUsedSeconds": 0, "createdAt": 1, "updatedAt": 1},
        "remainingTokens": None,
        "completionBudgetReport": None,
    }
    complete = {
        "goal": {"threadId": thread_id, "objective": goal, "status": "complete", "tokensUsed": 1, "timeUsedSeconds": 1, "createdAt": 1, "updatedAt": 2},
        "remainingTokens": None,
        "completionBudgetReport": "done",
    }
    rows = [{"type": "session_meta", "payload": {"id": thread_id, "source": {"subagent": {"thread_spawn": {"agent_path": task, "depth": 1}}}}}]

    def add(payload):
        rows.append({"type": "response_item", "payload": payload})

    output = f"{len(atom_data)} {atom_relative}\n{sha(atom_data)}  {atom_relative}\n{atom_data.decode('utf-8').rstrip()}\n"
    if encoding == "function_call_v1":
        add({"type": "function_call", "name": "create_goal", "call_id": "c1", "arguments": json.dumps({"objective": goal}, sort_keys=True, separators=(",", ":"))})
        add({"type": "function_call_output", "call_id": "c1", "output": json.dumps(active, separators=(",", ":"))})
        add({"type": "function_call", "name": "exec_command", "call_id": "c2", "arguments": json.dumps({"cmd": command}, sort_keys=True, separators=(",", ":"))})
        add({"type": "function_call_output", "call_id": "c2", "output": output})
        add({"type": "function_call", "name": "update_goal", "call_id": "c3", "arguments": '{"status":"complete"}'})
        add({"type": "function_call_output", "call_id": "c3", "output": json.dumps(complete, separators=(",", ":"))})
    else:
        add({"type": "custom_tool_call", "name": "exec", "call_id": "c1", "input": f"const r=await tools.create_goal({{objective:{json.dumps(goal)}}}); text(r);"})
        add({"type": "custom_tool_call_output", "call_id": "c1", "output": [{"type": "input_text", "text": json.dumps(active, sort_keys=True, separators=(",", ":"))}]})
        add({"type": "custom_tool_call", "name": "exec", "call_id": "c2", "input": f"const r=await tools.exec_command({{cmd:{json.dumps(command)}}}); text(r.output);"})
        add({"type": "custom_tool_call_output", "call_id": "c2", "output": [{"type": "input_text", "text": output}]})
        add({"type": "custom_tool_call", "name": "exec", "call_id": "c3", "input": 'const r=await tools.update_goal({status:"complete"}); text(r);'})
        add({"type": "custom_tool_call_output", "call_id": "c3", "output": [{"type": "input_text", "text": json.dumps(complete, sort_keys=True, separators=(",", ":"))}]})
    add({"type": "message", "role": "assistant", "phase": "final_answer", "content": [{"type": "output_text", "text": f"R|{result}|G|{thread_id}"}]})
    return b"".join(canonical(row) for row in rows)


def generate_fixture(base, root, materializer):
    for relative in ("run/atoms", "run/spawns", "run/results", "cells", "sessions/2026/08/23", "bindings"):
        (root / relative).mkdir(parents=True, exist_ok=True)
    for source, name in (
        (materializer, "materializer.py"),
        (base / "r9_codex_native_goal_executable_atom_plan_derivation_mechanical_validation_v1.json", "derivation.json"),
    ):
        shutil.copyfile(source, root / "bindings" / name)
        os.chmod(root / "bindings" / name, 0o644)
    plan = {"schema_id": "fixture-plan", "status": "PASS_PATH_NEUTRAL_CANARY_PLAN_INVENTORY_ZERO_CREDIT_NO_LAUNCH_AUTHORITY"}
    (root / "bindings/plan.json").write_bytes(canonical(plan))
    os.chmod(root / "bindings/plan.json", 0o644)
    cases = []
    ordinal = 0
    for route_index, (route, model, effort, encoding) in enumerate(ROUTES):
        source_cell = base / f"codex_native_goal_direct_canary_002_public_plan_v1/cells/cell-000/{route}.json"
        cell = root / f"cells/{route}.json"
        shutil.copyfile(source_cell, cell)
        os.chmod(cell, 0o644)
        records = []
        case_ids = {}
        for atom_index, atom_id in enumerate(("n00000", "n00001", "n00011")):
            ordinal += 1
            atom = root / f"run/atoms/{ordinal:05d}.json"
            spawn = root / f"run/spawns/{ordinal:05d}.txt"
            record = root / f"run/results/{ordinal:05d}.json"
            arguments = ["materialize", "--workspace-root", root, "--cell", cell, "--atom-id", atom_id]
            if atom_id == "n00011":
                for dependency in records:
                    arguments += ["--dependency-record", dependency]
            arguments += ["--output", atom, "--spawn-output", spawn]
            invoke_materializer(materializer, arguments)
            result = f"SIG_{route_index}_{atom_index}" if atom_index < 2 else f"RED_{route_index}"
            thread_id = f"{route_index + 1:08d}-{atom_index + 1:04d}-4000-8000-{ordinal:012d}"
            task = f"/root/r9_fixture_{route_index}_{atom_index}"
            trace = root / f"sessions/2026/08/23/rollout-fixture-{ordinal:02d}.jsonl"
            atom_value = json.loads(atom.read_text("utf-8"))
            trace_data = trace_bytes(atom_value["goal_objective"], task, atom.relative_to(root).as_posix(), atom.read_bytes(), result, encoding, thread_id)
            trace.write_bytes(trace_data)
            os.chmod(trace, 0o664)
            invoke_materializer(
                materializer,
                [
                    "record-result", "--workspace-root", root, "--cell", cell, "--atom-id", atom_id,
                    "--result", result, "--goal-thread-id", thread_id, "--task-path", task,
                    "--trace-relative", trace.relative_to(root / "sessions").as_posix(), "--trace-bytes", len(trace_data),
                    "--trace-sha256", sha(trace_data), "--output", record,
                ],
            )
            case_id = f"{route}-{atom_id}"
            dependency_cases = [case_ids[item] for item in (("n00000", "n00001") if atom_id == "n00011" else ())]
            cases.append(
                {
                    "atom": binding(atom, root),
                    "atom_id": atom_id,
                    "case_id": case_id,
                    "cell": binding(cell, root),
                    "dependency_case_ids": dependency_cases,
                    "final_envelope": f"R|{result}|G|{thread_id}",
                    "goal_objective": atom_value["goal_objective"],
                    "goal_thread_id": thread_id,
                    "ordinal": ordinal,
                    "physical_encoding": encoding,
                    "requested_model": model,
                    "requested_reasoning_effort": effort,
                    "result_record": binding(record, root),
                    "route": route,
                    "spawn_message": binding(spawn, root),
                    "task_path": task,
                    "trace": {"bytes": len(trace_data), "mode": "0664", "relative_path": trace.relative_to(root / "sessions").as_posix(), "sha256": sha(trace_data)},
                }
            )
            records.append(record)
            case_ids[atom_id] = case_id
    manifest = {
        "bindings": {
            "derivation_validation": binding(root / "bindings/derivation.json", root),
            "materializer": binding(root / "bindings/materializer.py", root),
            "plan_inventory": binding(root / "bindings/plan.json", root),
        },
        "cases": cases,
        "qualification": {"credit": 0, "current_streak": 0, "current_value": "0/2"},
        "run_id": "codex-native-goal-direct-canary-002",
        "run_root": "run",
        "schema_id": MANIFEST_SCHEMA,
    }
    manifest_path = root / "manifest.json"
    manifest_path.write_bytes(canonical(manifest))
    os.chmod(manifest_path, 0o644)
    return manifest_path


def run_verifier(verifier, root):
    return subprocess.run(
        [sys.executable, "-B", str(verifier), "--manifest", str(root / "manifest.json"), "--workspace-root", str(root), "--session-root", str(root / "sessions"), "--check"],
        env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
        capture_output=True,
        text=True,
    )


def rewrite_manifest(root, value):
    path = root / "manifest.json"
    path.write_bytes(canonical(value))
    os.chmod(path, 0o644)


def mutation_results(baseline_root, verifier):
    names = (
        "case-count", "goal-reuse", "task-reuse", "atom-path-reuse", "route-roster", "ordinal",
        "dependency-cases", "physical-encoding", "final-envelope", "spawn-identity", "trace-identity",
        "result-identity", "materializer-identity", "derivation-status", "plan-status", "run-extra-file",
    )
    results = []
    for name in names:
        mutant = Path(tempfile.mkdtemp(prefix=f"r9_typed_mutant_{name}_"))
        try:
            shutil.copytree(baseline_root, mutant, dirs_exist_ok=True)
            manifest_path = mutant / "manifest.json"
            manifest = json.loads(manifest_path.read_text("utf-8"))
            if name == "case-count":
                manifest["cases"] = manifest["cases"][:-1]
            elif name == "goal-reuse":
                manifest["cases"][1]["goal_thread_id"] = manifest["cases"][0]["goal_thread_id"]
            elif name == "task-reuse":
                manifest["cases"][1]["task_path"] = manifest["cases"][0]["task_path"]
            elif name == "atom-path-reuse":
                manifest["cases"][1]["atom"] = manifest["cases"][0]["atom"]
            elif name == "route-roster":
                manifest["cases"][0]["requested_model"] = "wrong"
            elif name == "ordinal":
                manifest["cases"][0]["ordinal"] = 2
            elif name == "dependency-cases":
                manifest["cases"][2]["dependency_case_ids"] = []
            elif name == "physical-encoding":
                manifest["cases"][0]["physical_encoding"] = "custom_exec_v1"
            elif name == "final-envelope":
                manifest["cases"][0]["final_envelope"] += "X"
            elif name == "spawn-identity":
                manifest["cases"][0]["spawn_message"]["sha256"] = "0" * 64
            elif name == "trace-identity":
                manifest["cases"][0]["trace"]["sha256"] = "0" * 64
            elif name == "result-identity":
                manifest["cases"][0]["result_record"]["sha256"] = "0" * 64
            elif name == "materializer-identity":
                manifest["bindings"]["materializer"]["sha256"] = "0" * 64
            elif name in {"derivation-status", "plan-status"}:
                key = "derivation_validation" if name == "derivation-status" else "plan_inventory"
                target = mutant / manifest["bindings"][key]["path"]
                value = json.loads(target.read_text("utf-8"))
                value["status"] = "FAIL"
                target.write_bytes(canonical(value))
                os.chmod(target, 0o644)
                manifest["bindings"][key] = binding(target, mutant)
            elif name == "run-extra-file":
                extra = mutant / "run/extra.json"
                extra.write_bytes(canonical({"extra": True}))
                os.chmod(extra, 0o644)
            rewrite_manifest(mutant, manifest)
            process = run_verifier(verifier, mutant)
            if process.returncode == 0:
                raise Invalid(f"mutation-accepted:{name}")
            value = json.loads(process.stdout)
            if value.get("status") != "FAIL_ZERO_CREDIT_NO_LAUNCH_AUTHORITY" or not value.get("first_mismatch"):
                raise Invalid(f"mutation-result:{name}")
            results.append({"first_mismatch": value["first_mismatch"], "mutation": name, "status": "REJECTED"})
        finally:
            shutil.rmtree(mutant)
    return results


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--base", required=True)
    parser.add_argument("--check", action="store_true")
    args, extra = parser.parse_known_args()
    root = None
    try:
        if extra or not args.check:
            raise Invalid("CLI")
        base = Path(args.base)
        if not base.is_absolute() or not base.is_dir():
            raise Invalid("base")
        materializer = base / "r9_codex_native_goal_direct_typed_atom_materializer_v1.py"
        verifier = base / "r9_codex_native_goal_direct_typed_canary_verifier_v1.py"
        root = Path(tempfile.mkdtemp(prefix="r9_typed_canary_fixture_"))
        manifest = generate_fixture(base, root, materializer)
        process = run_verifier(verifier, root)
        if process.returncode != 0:
            raise Invalid(f"verifier:{process.stdout.strip()}:{process.stderr.strip()}")
        verifier_result = json.loads(process.stdout)
        if verifier_result.get("status") != "PASS_ZERO_CREDIT_CANARY_MECHANICS_ONLY" or verifier_result.get("case_count") != 9:
            raise Invalid("verifier-result")
        mutations = mutation_results(root, verifier)
        result = {
            "case_count": 9,
            "check": "PASS",
            "first_mismatch": None,
            "mutation_count": len(mutations),
            "mutations": mutations,
            "physical_encodings": ["function_call_v1", "custom_exec_v1"],
            "qualification_credit": 0,
            "schema_id": SCHEMA,
            "status": "PASS_SYNTHETIC_FIXTURE_ZERO_CREDIT_NO_EMPIRICAL_AUTHORITY",
            "temp_cleaned": True,
            "workspace_writes": 0,
        }
        code = 0
    except (Invalid, OSError, ValueError, TypeError, KeyError, json.JSONDecodeError) as exc:
        result = {
            "case_count": 0,
            "check": "FAIL",
            "first_mismatch": str(exc),
            "mutation_count": 0,
            "qualification_credit": 0,
            "schema_id": SCHEMA,
            "status": "FAIL_ZERO_CREDIT_NO_EMPIRICAL_AUTHORITY",
            "temp_cleaned": True,
            "workspace_writes": 0,
        }
        code = 1
    finally:
        if root is not None and root.exists():
            shutil.rmtree(root)
    sys.stdout.buffer.write(canonical(result))
    return code


if __name__ == "__main__":
    raise SystemExit(main())
