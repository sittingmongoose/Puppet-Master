#!/usr/bin/env python3
"""Create-only Matrix011/012 runner for the minimal native `/goal` lane."""

from __future__ import annotations

import argparse
import concurrent.futures
import gzip
import importlib.util
import json
import os
import stat
import subprocess
import sys
import time
from collections import defaultdict
from pathlib import Path

SCHEMA = "pw-r9-native-goal-slash-matrix-runner-v1"
ADMISSION_SCHEMA = "pw-r9-native-goal-slash-matrix-admission-v1"
RUN_SCHEMA = "pw-r9-native-goal-slash-matrix-run-v1"
TASK_SCHEMA = "pw-r9-native-goal-slash-matrix-task-v1"
TERMINAL_SCHEMA = "pw-r9-native-goal-slash-matrix-terminal-v1"
ACCOUNTING_SCHEMA = "pw-r9-native-goal-slash-matrix-accounting-v1"
INVENTORY_SCHEMA = "pw-r9-native-goal-slash-matrix-inventory-v1"

REPO = Path("/mnt/Cursor/PuppetMaster")
BASE = REPO / "tests/r9g48"
HARNESS = BASE / "native_goal_slash_harness_v1.py"
MANIFEST = BASE / "native_goal_slash_matrix_pair_011_012_manifest_v1.json"
CANARY = BASE / "native_goal_slash_roster_canary_v1.json"
EVIDENCE = BASE / "evidence"
CODEX = Path("/home/sittingmongoose/.local/bin/codex")
CODEX_REAL = Path(
    "/home/sittingmongoose/.codex/packages/standalone/releases/"
    "0.148.0-x86_64-unknown-linux-musl/bin/codex"
)

HARNESS_ID = {
    "bytes": 44090,
    "mode": "0644",
    "path": "tests/r9g48/native_goal_slash_harness_v1.py",
    "sha256": "a0a898f2cd64b63db2a2dd75a5adc524a64477cf2445f085dd49bdec7a55558a",
}
MANIFEST_ID = {
    "bytes": 5416,
    "mode": "0644",
    "path": "tests/r9g48/native_goal_slash_matrix_pair_011_012_manifest_v1.json",
    "sha256": "b0821a4857b6b11effdde833b2b66dce167b2c33d63aefd4a6bc0f181fcf4bbd",
}
CANARY_ID = {
    "bytes": 3261,
    "mode": "0644",
    "path": "tests/r9g48/native_goal_slash_roster_canary_v1.json",
    "sha256": "3d28bb94e54fb2a62b15f537eec0b86c0c925696e853ee970fdf2c6261a2be9d",
}
RUNTIME_ID = {
    "bytes": 251271488,
    "mode": "0755",
    "path": str(CODEX_REAL),
    "sha256": "ac2cfed85fb647d61e0150b8548102b330e4799d9d81ad5d354de701edf6b074",
    "version": "codex-cli 0.148.0",
}
MATRICES = {
    "codex-native-slash-goal-matrix-011": 1,
    "codex-native-slash-goal-matrix-012": 2,
}
ADMISSIONS = {
    "codex-native-slash-goal-matrix-011": BASE / "native_goal_slash_matrix_011_admission_v1.json",
    "codex-native-slash-goal-matrix-012": BASE / "native_goal_slash_matrix_012_admission_v1.json",
}
PREDECESSOR_VERIFICATION = BASE / "native_goal_slash_matrix_011_verification_v1.json"
ROUTE_ORDER = ("slot-alpha", "slot-bravo", "slot-charlie")


class Invalid(Exception):
    pass


def fail(message: str) -> None:
    raise Invalid(message)


def read_exact(path: Path, label: str, mode: int = 0o644) -> bytes:
    if not path.is_absolute():
        fail(f"absolute:{label}")
    try:
        before = path.lstat()
        resolved = path.resolve(strict=True)
    except OSError as exc:
        fail(f"stat:{label}:{type(exc).__name__}")
    if resolved != path or not stat.S_ISREG(before.st_mode):
        fail(f"type:{label}")
    if stat.S_IMODE(before.st_mode) != mode:
        fail(f"mode:{label}")
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        opened = os.fstat(fd)
        if (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino):
            fail(f"race:{label}")
        chunks = []
        while True:
            chunk = os.read(fd, 1024 * 1024)
            if not chunk:
                break
            chunks.append(chunk)
    finally:
        os.close(fd)
    after = path.lstat()
    if (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns) != (
        before.st_dev,
        before.st_ino,
        before.st_size,
        before.st_mtime_ns,
    ):
        fail(f"drift:{label}")
    return b"".join(chunks)


def bind(path: Path, identity: dict[str, object], label: str) -> bytes:
    raw = read_exact(path, label)
    if (
        len(raw) != identity["bytes"]
        or h.sha256(raw) != identity["sha256"]
        or identity["mode"] != "0644"
        or str(path.relative_to(REPO)) != identity["path"]
    ):
        fail(f"identity:{label}")
    return raw


def load_harness():
    raw = read_exact(HARNESS, "harness-bootstrap")
    if len(raw) != HARNESS_ID["bytes"]:
        fail("harness-bootstrap-bytes")
    import hashlib

    if hashlib.sha256(raw).hexdigest() != HARNESS_ID["sha256"]:
        fail("harness-bootstrap-sha256")
    spec = importlib.util.spec_from_file_location("r9_native_goal_harness_v1", HARNESS)
    if spec is None or spec.loader is None:
        fail("harness-import-spec")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


h = load_harness()
if getattr(h, "CODEX", None) != CODEX:
    fail("harness-codex-launcher")
h.CODEX = CODEX_REAL


def self_identity() -> dict[str, object]:
    path = Path(__file__).resolve(strict=True)
    raw = read_exact(path, "runner-self")
    return {
        "bytes": len(raw),
        "mode": "0644",
        "path": str(path.relative_to(REPO)),
        "sha256": h.sha256(raw),
    }


def closed_json(path: Path, label: str) -> dict[str, object]:
    value = h.parse_json(read_exact(path, label), label)
    if not isinstance(value, dict):
        fail(f"object:{label}")
    return value


def validate_fixed_inputs() -> dict[str, list[object]]:
    bind(HARNESS, HARNESS_ID, "harness")
    bind(MANIFEST, MANIFEST_ID, "manifest")
    bind(CANARY, CANARY_ID, "canary")
    runtime_raw = read_exact(CODEX_REAL, "codex-runtime", 0o755)
    if (
        len(runtime_raw) != RUNTIME_ID["bytes"]
        or h.sha256(runtime_raw) != RUNTIME_ID["sha256"]
        or RUNTIME_ID["mode"] != "0755"
        or str(CODEX_REAL) != RUNTIME_ID["path"]
    ):
        fail("codex-runtime-identity")
    try:
        if not CODEX.is_symlink() or CODEX.resolve(strict=True) != CODEX_REAL:
            fail("codex-launcher-target")
    except OSError as exc:
        fail(f"codex-launcher:{type(exc).__name__}")
    version = subprocess.run(
        [str(CODEX), "--version"],
        cwd=REPO,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=10,
        check=False,
    )
    if (
        version.returncode != 0
        or version.stderr
        or version.stdout != (RUNTIME_ID["version"] + "\n").encode("utf-8")
    ):
        fail("codex-runtime-version")
    manifest = h.load_manifest()
    if manifest.get("authority") != {
        "canary_launch": False,
        "matrix_011_launch": False,
        "matrix_012_launch": False,
        "qualification": False,
        "qualification_credit": 0,
        "release": False,
    }:
        fail("manifest-authority")
    canary = closed_json(CANARY, "canary-json")
    if (
        canary.get("status")
        != "PASS_ROSTER_CANARY_ONLY_ZERO_CREDIT_NO_MATRIX_AUTHORITY"
        or canary.get("qualification", {}).get("credit") != "0/2"
        or len(canary.get("routes", [])) != 3
    ):
        fail("canary-status")
    schedule = h.load_schedule()
    for wave in range(5204):
        aligned = [schedule[route][wave] for route in ROUTE_ORDER]
        projection = {
            (item.cell_index, item.cell, item.atom_id, item.node.get("kind"))
            for item in aligned
        }
        if len(projection) != 1:
            fail(f"wave-alignment:{wave}")
    return schedule


def read_admission(path: Path, matrix_id: str) -> dict[str, object]:
    if path != ADMISSIONS[matrix_id]:
        fail("admission-path")
    value = closed_json(path, "admission")
    exact = {
        "authority",
        "bindings",
        "matrix_id",
        "mechanical_validation",
        "pair_position",
        "predecessor_verification",
        "qualification_credit",
        "runtime",
        "schema_id",
        "status",
        "verification_component",
    }
    if set(value) != exact or value.get("schema_id") != ADMISSION_SCHEMA:
        fail("admission-shape")
    if (
        value.get("authority") is not True
        or value.get("matrix_id") != matrix_id
        or value.get("pair_position") != MATRICES[matrix_id]
        or value.get("qualification_credit") != 0
        or value.get("runtime") != RUNTIME_ID
        or value.get("status") != "ADMIT_EXACT_MATRIX_ONCE"
    ):
        fail("admission-fixed")
    expected = {
        "canary": CANARY_ID,
        "harness": HARNESS_ID,
        "manifest": MANIFEST_ID,
        "runner": self_identity(),
    }
    if value.get("bindings") != expected:
        fail("admission-bindings")
    for field, relative in (
        ("mechanical_validation", "tests/r9g48/native_goal_slash_components_mechanical_validation_v2.json"),
        ("verification_component", "tests/r9g48/native_goal_slash_matrix_verifier_v1.py"),
    ):
        identity = value.get(field)
        if not isinstance(identity, dict) or set(identity) != {"bytes", "path", "sha256"} or identity.get("path") != relative:
            fail(f"admission-{field}-shape")
        source = read_exact((REPO / relative).resolve(strict=True), f"admission-{field}")
        if len(source) != identity["bytes"] or h.sha256(source) != identity["sha256"]:
            fail(f"admission-{field}-identity")
    predecessor = value.get("predecessor_verification")
    if MATRICES[matrix_id] == 1:
        if predecessor is not None:
            fail("admission-first-predecessor")
    else:
        if not isinstance(predecessor, dict) or set(predecessor) != {
            "bytes",
            "path",
            "sha256",
        }:
            fail("admission-second-predecessor")
        predecessor_path = REPO / predecessor["path"]
        if predecessor_path != PREDECESSOR_VERIFICATION:
            fail("predecessor-verification-path")
        raw = read_exact(predecessor_path.resolve(strict=True), "predecessor-verification")
        if len(raw) != predecessor["bytes"] or h.sha256(raw) != predecessor["sha256"]:
            fail("predecessor-verification-identity")
        receipt = h.parse_json(raw, "predecessor-verification")
        if (
            not isinstance(receipt, dict)
            or receipt.get("matrix_id") != "codex-native-slash-goal-matrix-011"
            or receipt.get("status") != "PASS_CLEAN_MATRIX_ZERO_QUALIFICATION_CREDIT"
            or receipt.get("clean") is not True
        ):
            fail("predecessor-verification-status")
    return value


def create_dir(path: Path) -> None:
    h.make_dir(path)


def write_json(path: Path, value: object) -> None:
    h.write_exact(path, h.canonical(value))


def atom_payload(spec, prior: dict[str, str]) -> tuple[object, bytes, str, str]:
    dependencies = spec.node["dependencies"]
    results = {atom_id: prior[atom_id] for atom_id in dependencies}
    payload = h.materialize_payload(spec.node, results)
    capsule = h.canonical_no_lf(h.build_capsule(spec.node, payload))
    return payload, capsule, h.sha256(capsule), spec.node["kind"]


def prepare_atom(matrix_id: str, wave: int, spec, prior: dict[str, str]) -> dict[str, object]:
    payload, capsule, capsule_sha, kind = atom_payload(spec, prior)
    identifier = h.execution_id(
        matrix_id,
        spec.route,
        wave,
        spec.cell_sha256,
        spec.atom_id,
        capsule,
    )
    objective = h.goal_objective(identifier, capsule)
    return {
        "capsule": capsule,
        "capsule_sha256": capsule_sha,
        "cell": spec.cell,
        "cell_index": spec.cell_index,
        "cell_sha256": spec.cell_sha256,
        "effort": spec.effort,
        "execution_id": identifier,
        "kind": kind,
        "model": spec.model,
        "node": spec.node,
        "objective": objective,
        "payload": payload,
        "route": spec.route,
        "route_code": spec.route_code,
        "spec": spec,
        "wave": wave,
        "atom_id": spec.atom_id,
    }


def launch_prepared(item: dict[str, object], timeout_seconds: int) -> dict[str, object]:
    try:
        result = h.launch_goal(
            item["objective"],
            item["model"],
            item["effort"],
            None,
            timeout_seconds,
        )
        return {"exception": None, "result": result}
    except Exception as exc:  # A consumed host failure; never relaunched.
        return {"exception": f"{type(exc).__name__}:{exc}", "result": None}


def archive_task(
    matrix_root: Path,
    item: dict[str, object],
    launched: dict[str, object],
) -> tuple[dict[str, object], str | None]:
    wave_dir = matrix_root / "tasks" / f"wave-{item['wave']:05d}"
    task_dir = wave_dir / item["route_code"]
    create_dir(task_dir)
    result = launched.get("result")
    first_mismatch = launched.get("exception")
    trace_identity = None
    tui_identity = None
    verification = None
    result_text = None
    if isinstance(result, dict):
        trace_raw = result.pop("trace_raw")
        tui_raw = result.pop("tui_raw")
        trace_gzip = gzip.compress(trace_raw, compresslevel=9, mtime=0)
        tui_gzip = gzip.compress(tui_raw, compresslevel=9, mtime=0)
        h.write_exact(task_dir / "rollout.jsonl.gz", trace_gzip)
        h.write_exact(task_dir / "tui.txt.gz", tui_gzip)
        trace_identity = {
            "bytes": len(trace_gzip),
            "raw_bytes": len(trace_raw),
            "raw_sha256": h.sha256(trace_raw),
            "sha256": h.sha256(trace_gzip),
        }
        tui_identity = {
            "bytes": len(tui_gzip),
            "raw_bytes": len(tui_raw),
            "raw_sha256": h.sha256(tui_raw),
            "sha256": h.sha256(tui_gzip),
        }
        verification = result
        if first_mismatch is None:
            first_mismatch = result.get("verification_error")
        result_text = result.get("result_utf8")
        if first_mismatch is None:
            try:
                h.validate_result(item["node"], result_text)
            except Exception as exc:
                first_mismatch = f"result-validation:{exc}"
    status = "PASS_ATOM_ZERO_CREDIT" if first_mismatch is None else "FAIL_ATOM_CONSUMED_ZERO_CREDIT"
    record = {
        "atom_id": item["atom_id"],
        "authority": False,
        "capsule": {
            "bytes": len(item["capsule"]),
            "sha256": item["capsule_sha256"],
            "utf8": item["capsule"].decode("utf-8"),
        },
        "cell": item["cell"],
        "cell_index": item["cell_index"],
        "cell_sha256": item["cell_sha256"],
        "execution_id": item["execution_id"],
        "first_mismatch": first_mismatch,
        "goal_command_bytes": len(("/goal " + item["objective"]).encode("utf-8")),
        "goal_objective": item["objective"],
        "goal_objective_sha256": h.sha256(item["objective"].encode("utf-8")),
        "kind": item["kind"],
        "matrix_id": matrix_root.name,
        "model_requested": item["model"],
        "qualification_credit": 0,
        "reasoning_effort_requested": item["effort"],
        "result": None
        if result_text is None
        else {
            "bytes": len(result_text.encode("utf-8")),
            "sha256": h.sha256(result_text.encode("utf-8")),
            "utf8": result_text,
        },
        "route": item["route"],
        "route_code": item["route_code"],
        "schema_id": TASK_SCHEMA,
        "status": status,
        "trace_copy": trace_identity,
        "tui_copy": tui_identity,
        "verification": verification,
        "wave": item["wave"],
    }
    write_json(task_dir / ("task.json" if first_mismatch is None else "failure.json"), record)
    return record, first_mismatch


def assemble_cell(recipe: dict[str, object], results: dict[str, str]) -> bytes:
    kind = recipe.get("kind")
    if kind == "MODEL_FINAL_CANONICAL_ONE_FIELD_JSON":
        raw = results[recipe["dynamic_node"]].encode("utf-8")
        value = h.parse_json(raw, "assembly-model-final", require_canonical=False)
        if (
            not isinstance(value, dict)
            or list(value) != [recipe["output_key"]]
            or value[recipe["output_key"]] not in recipe["allowed_values"]
            or raw != h.canonical_no_lf(value)
        ):
            fail("assembly-model-final")
        return raw
    if kind == "DETERMINISTIC_S50_ASSEMBLY_FROM_EIGHT_COMPACT_VERDICTS":
        fixed = recipe["fixed"]
        verdicts = []
        for edge in recipe["ordered_edge_items"]:
            code = results[edge["verdict_from_compact_node"]]
            if code not in {"S", "U"}:
                fail("assembly-s50-code")
            verdicts.append(
                {
                    "edge_id": edge["edge_id"],
                    "source_decision_ids": edge["source_decision_ids"],
                    "verdict": "supported" if code == "S" else "unsupported",
                }
            )
        value = {
            "protocol_id": fixed["protocol_id"],
            "stage": fixed["stage"],
            "topic_artifact_hashes": fixed["topic_artifact_hashes"],
            "checked_edge_ids": fixed["checked_edge_ids"],
            "edge_verdicts": verdicts,
            "claim_boundary": fixed["claim_boundary"],
            "external_audit_status": fixed["external_audit_status"],
            "forbidden_action_violations": fixed["forbidden_action_violations"],
        }
        return h.canonical_no_lf(value)
    if kind == "DETERMINISTIC_S60_ASSEMBLY_FROM_COMPACT_SPECIALIST_CODE":
        fixed = recipe["fixed"]
        code = results[recipe["compact_node"]]
        expected_class = {
            "provenance_gap": "P",
            "authority_conflation": "C",
            "counterfactual_failure": "K",
        }[fixed["classification"]]
        if code not in {f"S:{expected_class}", f"U:{expected_class}"}:
            fail("assembly-s60-code")
        value = {
            "protocol_id": fixed["protocol_id"],
            "stage": fixed["stage"],
            "role": fixed["role"],
            "candidate_edge_id": fixed["candidate_edge_id"],
            "candidate_lineage_sha256": fixed["candidate_lineage_sha256"],
            "integration_candidate_sha256": fixed["integration_candidate_sha256"],
            "verdict": "supported" if code.startswith("S:") else "unsupported",
            "classification": fixed["classification"],
            "source_record_ids": fixed["source_record_ids"],
            "claim_boundary": fixed["claim_boundary"],
            "external_audit_status": fixed["external_audit_status"],
            "forbidden_action_violations": fixed["forbidden_action_violations"],
        }
        return h.canonical_no_lf(value)
    fail("assembly-kind")


def recipes(schedule: dict[str, list[object]]) -> dict[tuple[str, int], dict[str, object]]:
    result = {}
    for route in ROUTE_ORDER:
        for spec in schedule[route]:
            key = (route, spec.cell_index)
            if key in result:
                continue
            cell = h.parse_json(h.read_regular(spec.cell_path, "recipe-cell"), "recipe-cell")
            result[key] = cell["assembly_recipe"]
    if len(result) != 291:
        fail("recipe-count")
    return result


def scan_inventory(root: Path) -> list[dict[str, object]]:
    rows = []
    for path in sorted(root.rglob("*")):
        relative = path.relative_to(root).as_posix()
        info = path.lstat()
        if stat.S_ISDIR(info.st_mode):
            if stat.S_IMODE(info.st_mode) != 0o755:
                fail(f"inventory-dir-mode:{relative}")
            continue
        if not stat.S_ISREG(info.st_mode) or stat.S_IMODE(info.st_mode) != 0o644:
            fail(f"inventory-type-mode:{relative}")
        if relative in {"matrix_inventory.json", "matrix_terminal.json", "matrix_accounting.json"}:
            continue
        raw = h.read_regular(path.resolve(strict=True), f"inventory:{relative}")
        rows.append({"bytes": len(raw), "path": relative, "sha256": h.sha256(raw)})
    return rows


def seal_matrix(
    root: Path,
    matrix_id: str,
    status: str,
    first_mismatch: str | None,
    completed_task_count: int,
    assembly_count: int,
) -> dict[str, object]:
    inventory = {
        "entries": scan_inventory(root),
        "matrix_id": matrix_id,
        "schema_id": INVENTORY_SCHEMA,
    }
    inventory_raw = h.canonical(inventory)
    h.write_exact(root / "matrix_inventory.json", inventory_raw)
    terminal = {
        "assembly_count": assembly_count,
        "authority": False,
        "completed_task_count": completed_task_count,
        "expected_task_count": 15612,
        "first_mismatch": first_mismatch,
        "inventory": {"bytes": len(inventory_raw), "sha256": h.sha256(inventory_raw)},
        "matrix_id": matrix_id,
        "qualification_credit": 0,
        "schema_id": TERMINAL_SCHEMA,
        "status": status,
    }
    terminal_raw = h.canonical(terminal)
    h.write_exact(root / "matrix_terminal.json", terminal_raw)
    accounting = {
        "assembly_count": assembly_count,
        "completed_task_count": completed_task_count,
        "files_before_accounting": len(inventory["entries"]) + 2,
        "matrix_id": matrix_id,
        "qualification_credit": 0,
        "relaunch_count": 0,
        "replacement_count": 0,
        "resend_count": 0,
        "retry_count": 0,
        "schema_id": ACCOUNTING_SCHEMA,
        "status": status,
        "terminal": {"bytes": len(terminal_raw), "sha256": h.sha256(terminal_raw)},
    }
    accounting_raw = h.canonical(accounting)
    h.write_exact(root / "matrix_accounting.json", accounting_raw)
    return {
        "accounting": {"bytes": len(accounting_raw), "sha256": h.sha256(accounting_raw)},
        "authority": False,
        "first_mismatch": first_mismatch,
        "matrix_id": matrix_id,
        "qualification_credit": 0,
        "schema_id": SCHEMA,
        "status": status,
    }


def run_matrix(
    matrix_id: str,
    output_root: Path,
    admission_path: Path,
    timeout_seconds: int,
) -> dict[str, object]:
    if matrix_id not in MATRICES or timeout_seconds != 180:
        fail("run-arguments")
    expected_root = EVIDENCE / matrix_id
    if output_root != expected_root or output_root.exists():
        fail("run-output-root")
    schedule = validate_fixed_inputs()
    admission = read_admission(admission_path, matrix_id)
    if not EVIDENCE.exists():
        create_dir(EVIDENCE)
    create_dir(output_root)
    create_dir(output_root / "tasks")
    run_record = {
        "admission": {
            "bytes": admission_path.stat().st_size,
            "path": str(admission_path.relative_to(REPO)),
            "sha256": h.sha256(read_exact(admission_path, "admission-final")),
        },
        "authority": False,
        "bindings": {
            "canary": CANARY_ID,
            "harness": HARNESS_ID,
            "manifest": MANIFEST_ID,
            "runner": self_identity(),
        },
        "matrix_id": matrix_id,
        "pair_position": MATRICES[matrix_id],
        "qualification_credit": 0,
        "route_order": list(ROUTE_ORDER),
        "runtime": RUNTIME_ID,
        "schema_id": RUN_SCHEMA,
        "status": "RUNNING_UNSCORED_ZERO_CREDIT",
        "subject_task_count": 15612,
        "wave_count": 5204,
    }
    write_json(output_root / "run.json", run_record)
    state: dict[tuple[str, int], dict[str, str]] = defaultdict(dict)
    completed = 0
    first_mismatch = None
    next_progress = time.monotonic() + 1800
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        for wave in range(5204):
            wave_dir = output_root / "tasks" / f"wave-{wave:05d}"
            create_dir(wave_dir)
            prepared = []
            for route in ROUTE_ORDER:
                spec = schedule[route][wave]
                prepared.append(
                    prepare_atom(matrix_id, wave, spec, state[(route, spec.cell_index)])
                )
            futures = {
                item["route"]: pool.submit(launch_prepared, item, timeout_seconds)
                for item in prepared
            }
            for item in prepared:
                record, mismatch = archive_task(
                    output_root, item, futures[item["route"]].result()
                )
                completed += 1
                if mismatch is None:
                    state[(item["route"], item["cell_index"])][item["atom_id"]] = record[
                        "result"
                    ]["utf8"]
                elif first_mismatch is None:
                    first_mismatch = f"wave-{wave:05d}:{item['route']}:{mismatch}"
            if first_mismatch is not None:
                return seal_matrix(
                    output_root,
                    matrix_id,
                    "FAILED_CONSUMED_ZERO_CREDIT_NO_RETRY",
                    first_mismatch,
                    completed,
                    0,
                )
            if time.monotonic() >= next_progress:
                print(
                    f"PROGRESS matrix={matrix_id} completed={completed}/15612 "
                    f"wave={wave + 1}/5204 qualification=0/2",
                    file=sys.stderr,
                    flush=True,
                )
                next_progress = time.monotonic() + 1800
    assembled = []
    for (route, cell_index), recipe in sorted(recipes(schedule).items()):
        raw = assemble_cell(recipe, state[(route, cell_index)])
        assembled.append(
            {
                "bytes": len(raw),
                "cell_index": cell_index,
                "route": route,
                "sha256": h.sha256(raw),
                "utf8": raw.decode("utf-8"),
            }
        )
    write_json(
        output_root / "assembly_results.json",
        {
            "matrix_id": matrix_id,
            "qualification_credit": 0,
            "rows": assembled,
            "schema_id": "pw-r9-native-goal-slash-assembly-results-v1",
            "status": "UNSCORED",
        },
    )
    return seal_matrix(
        output_root,
        matrix_id,
        "EXECUTION_COMPLETE_UNSCORED_ZERO_CREDIT",
        None,
        completed,
        len(assembled),
    )


def check_static() -> dict[str, object]:
    schedule = validate_fixed_inputs()
    maximum = h.check_static()
    return {
        "authority": False,
        "first_mismatch": None,
        "harness_static_status": maximum["status"],
        "matrix_launch": False,
        "qualification_credit": 0,
        "route_atom_counts": {route: len(schedule[route]) for route in ROUTE_ORDER},
        "runner": self_identity(),
        "schema_id": SCHEMA,
        "status": "PASS_STATIC_RUNNER_ZERO_CREDIT_NO_LAUNCH_AUTHORITY",
        "subject_task_count": 15612,
        "workspace_writes": 0,
    }


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(add_help=False)
    sub = result.add_subparsers(dest="command", required=True)
    check = sub.add_parser("check", add_help=False)
    check.add_argument("--check", action="store_true")
    run = sub.add_parser("run-matrix", add_help=False)
    run.add_argument("--matrix-id", required=True)
    run.add_argument("--output-root", required=True)
    run.add_argument("--admission", required=True)
    run.add_argument("--timeout-seconds", type=int, default=180)
    return result


def main() -> int:
    try:
        args, extra = parser().parse_known_args()
        if extra:
            fail("CLI-extra")
        if args.command == "check":
            if not args.check:
                fail("CLI-check")
            output = check_static()
        else:
            output = run_matrix(
                args.matrix_id,
                Path(args.output_root),
                Path(args.admission).resolve(strict=True),
                args.timeout_seconds,
            )
        code = 0 if output.get("first_mismatch") is None else 1
    except (Invalid, OSError, ValueError, TypeError, KeyError, subprocess.SubprocessError) as exc:
        output = {
            "authority": False,
            "first_mismatch": str(exc),
            "qualification_credit": 0,
            "schema_id": SCHEMA,
            "status": "FAIL_ZERO_CREDIT_NO_LAUNCH_OR_QUALIFICATION_AUTHORITY",
        }
        code = 1
    sys.stdout.buffer.write(h.canonical(output))
    return code


if __name__ == "__main__":
    raise SystemExit(main())
