#!/usr/bin/env python3
"""Candidate-12 read-only run verifier facade.

Candidate-9 remains the semantic/run-verification baseline.  Candidate-12
rebinds bundle custody and requires the v2 completion observation, including
the pre-dispatch rendered-file identity, before unchanged receipt-v4 and
capture-v3 admission.
"""
from __future__ import annotations

import importlib.util
from pathlib import Path
import stat
import sys
from types import ModuleType
from typing import Any

sys.dont_write_bytecode = True

REPO = Path("/mnt/Cursor/PuppetMaster")
SUCCESSOR = REPO / "tests/agent_packet_restrictions/successor_20260813"
ROOT = SUCCESSOR / "model_retest_r8_candidate_v12"
BASE_PATH = SUCCESSOR / "model_retest_r8_candidate_v9/r8_run_verifier.py"
PROCESS_PATH = ROOT / "r8_process_controller.py"
CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-12"
CANDIDATE_FILES = (
    "README.md", "architecture_contract.json", "controller_contract.json",
    "counterfactual_holdouts.json", "deterministic_preflight_report.json",
    "independent_preseal_audit.json", "process_completion_contract.json",
    "r8_harness.py", "r8_process_controller.py", "r8_run_verifier.py",
    "r8_subject_task_driver.py", "revision_lineage.json", "verifier_contract.json",
)
GOAL_ADDENDUM_REL = (
    "tests/agent_packet_restrictions/successor_20260813/"
    "r8_goal_loop_buster_addendum_v1.json"
)
GOAL_ADDENDUM_PATH = REPO / GOAL_ADDENDUM_REL
GOAL_ADDENDUM_BINDING = {
    "path": GOAL_ADDENDUM_REL,
    "storage_sha256": "d3f901e724d785ba3d053a961a8559b6f5b5add7e7b660a9fbb503586ad822d0",
    "storage_bytes": 4468,
}
GOAL_ADDENDUM_KEYS = ("path", "storage_sha256", "storage_bytes")
AUDIT_KEYS = (
    "schema_id", "candidate_id", "audit_kind", "status", "launch_ready",
    "empirical_model_success", "qualification_achieved", "blockers",
    "residual_risks", "audit_scope", "goal_loop_buster_addendum",
    "audited_candidate_bundle", "historical_regression_reaudit",
    "runtime_dependency_closure_audit", "freeze_constructibility_audit",
    "loop_break_preconditions", "terminal_and_qualification_honesty",
    "nonclaims", "zero_call_attestation",
)
FREEZE_MANIFEST_KEYS = (
    "schema_id", "candidate_id", "identity_family", "claim_boundary",
    "candidate_root", "frozen_snapshot_descriptor_sha256", "preseal_terminal",
    "preseal_launch_ready", "goal_loop_buster_addendum",
    "audited_candidate_bundle", "independent_preseal_audit",
    "qualification_contract", "candidate_file_count", "candidate_files",
    "runtime_dependency_count", "runtime_dependencies",
)
RUN_CONTRACT_KEYS = (
    "schema_id", "candidate_id", "run_id", "routes",
    "dispatch_schedule_path", "dispatch_schedule_storage_sha256",
    "dispatch_schedule_storage_bytes", "candidate_freeze_manifest_path",
    "candidate_freeze_manifest_storage_sha256",
    "candidate_freeze_manifest_storage_bytes", "goal_loop_buster_addendum",
    "audited_candidate_bundle", "qualification_sequence", "predecessor_run_id",
)


def _module(path: Path, name: str) -> ModuleType:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"module import unavailable: {path.name}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


BASE = _module(BASE_PATH, "pw_r8_candidate_v9_run_verifier_for_v12")
PROCESS = _module(PROCESS_PATH, "pw_r8_candidate_v12_process_for_verifier")

# Candidate/run/dispatch custody bindings only.  Semantic packet, oracle,
# scorer, routes, response acceptance, receipt-v4, and capture-v3 stay in v9.
BASE.ROOT = ROOT
BASE.HARNESS = ROOT / "r8_harness.py"
BASE.CANDIDATE_ID = CANDIDATE_ID
BASE.FREEZE_MANIFEST_REL = (
    "tests/agent_packet_restrictions/successor_20260813/"
    "r8_candidate_v12_freeze_manifest.json"
)
BASE.FREEZE_MANIFEST = REPO / BASE.FREEZE_MANIFEST_REL
BASE.CANDIDATE_ROOT_REL = "model_retest_r8_candidate_v12"
BASE.CANDIDATE_REQUIRED_FILES = CANDIDATE_FILES
BASE.CANDIDATE_NON_AUDIT_FILES = tuple(
    name for name in CANDIDATE_FILES if name != "independent_preseal_audit.json"
)

_original_validate_audited_candidate_bundle = BASE.validate_audited_candidate_bundle


def _validate_audited_candidate_bundle(*args, **kwargs):
    try:
        return _original_validate_audited_candidate_bundle(*args, **kwargs)
    except BASE.Invalid as exc:
        raise BASE.Invalid(str(exc).replace("ten-file", "twelve-file")) from exc


BASE.validate_audited_candidate_bundle = _validate_audited_candidate_bundle


def _validate_goal_addendum_value(binding: Any, storage: bytes) -> dict[str, Any]:
    if not isinstance(binding, dict) or tuple(binding) != GOAL_ADDENDUM_KEYS:
        raise BASE.Invalid("goal loop-buster addendum binding keys/order mismatch")
    if binding != GOAL_ADDENDUM_BINDING:
        raise BASE.Invalid("goal loop-buster addendum binding mismatch")
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n") or b"\r" in storage:
        raise BASE.Invalid("goal loop-buster addendum storage framing invalid")
    raw = storage[:-1]
    value = BASE.strict_object(raw, "goal loop-buster addendum")
    if storage != BASE.dump(value) + b"\n":
        raise BASE.Invalid("goal loop-buster addendum is not canonical minified JSON plus one LF")
    if (BASE.sha(storage), len(storage)) != (
        GOAL_ADDENDUM_BINDING["storage_sha256"],
        GOAL_ADDENDUM_BINDING["storage_bytes"],
    ):
        raise BASE.Invalid("goal loop-buster addendum storage identity mismatch")
    if (
        value.get("schema_id"), value.get("identity_family"), value.get("status")
    ) != (
        "pw-r8-goal-loop-buster-addendum-v1",
        BASE.IDENTITY_FAMILY,
        "ACTIVE_BINDING_ACCEPTANCE_CRITERIA",
    ):
        raise BASE.Invalid("goal loop-buster addendum semantic identity mismatch")
    return dict(GOAL_ADDENDUM_BINDING)


def validate_goal_loop_buster_addendum(binding: Any) -> dict[str, Any]:
    return _validate_goal_addendum_value(
        binding, BASE.regular(GOAL_ADDENDUM_PATH, "goal loop-buster addendum")
    )


def _require_exact_binding(observed: Any, expected: Any, label: str) -> None:
    if observed != expected or not isinstance(observed, dict) or tuple(observed) != tuple(expected):
        raise BASE.Invalid(f"{label} mismatch")


def _validate_audit(
    path: Path, binding: dict[str, Any], current_bundle: dict[str, Any],
) -> dict[str, Any]:
    data = BASE.regular(path, "independent preseal audit")
    if not data.endswith(b"\n") or data.endswith(b"\n\n") or b"\r" in data:
        raise BASE.Invalid("independent preseal audit storage framing invalid")
    audit = BASE.strict_object(data[:-1], "independent preseal audit", canonical=False)
    if tuple(audit) != AUDIT_KEYS:
        raise BASE.Invalid("independent preseal audit keys/order outside candidate-v12 audit-v2 contract")
    identity = (
        audit.get("schema_id"), audit.get("candidate_id"), audit.get("audit_kind"),
        audit.get("status"), audit.get("launch_ready"),
        audit.get("empirical_model_success"), audit.get("qualification_achieved"),
    )
    wanted = (
        "pw-r8-candidate-v12-independent-preseal-audit-v2", CANDIDATE_ID,
        "independent_adversarial_static_deterministic_preseal", "PRESEAL_PASS",
        True, False, False,
    )
    if identity != wanted or audit.get("blockers") != []:
        raise BASE.Invalid("independent preseal audit is not an exact candidate-v12 audit-v2 PASS")
    expected_scope_root = (
        "tests/agent_packet_restrictions/successor_20260813/"
        f"{BASE.CANDIDATE_ROOT_REL}"
    )
    expected_output = f"{expected_scope_root}/independent_preseal_audit.json"
    scope = audit.get("audit_scope")
    if (
        not isinstance(scope, dict)
        or scope.get("candidate_root") != expected_scope_root
        or scope.get("exact_current_candidate_bytes") is not True
        or scope.get("live_plans_read") is not False
        or scope.get("frozen_fixture_only") is not True
        or scope.get("subject_or_provider_calls_forbidden") is not True
        or scope.get("temporary_or_cache_writes_forbidden") is not True
        or scope.get("output_path") != expected_output
    ):
        raise BASE.Invalid("independent preseal audit scope mismatch")
    validate_goal_loop_buster_addendum(audit.get("goal_loop_buster_addendum"))
    BASE.validate_audited_candidate_bundle(
        audit.get("audited_candidate_bundle"), current_bundle,
        "independent preseal audit audited_candidate_bundle",
    )
    historical = audit.get("historical_regression_reaudit")
    if (
        not isinstance(historical, dict) or historical.get("status") != "PASS"
        or historical.get("counterfactual_passes") != 85
        or historical.get("counterfactual_cases") != 85
    ):
        raise BASE.Invalid("independent preseal audit historical regression result mismatch")
    closure = audit.get("runtime_dependency_closure_audit")
    if (
        not isinstance(closure, dict) or closure.get("status") != "PASS"
        or closure.get("runtime_dependency_count") != 73
        or closure.get("goal_acceptance_custody_rows") != 1
    ):
        raise BASE.Invalid("independent preseal audit runtime closure result mismatch")
    constructibility = audit.get("freeze_constructibility_audit")
    if not isinstance(constructibility, dict) or constructibility.get("status") != "PASS" or constructibility.get("redundant_runtime_dependency_closure_contract_required") is not False:
        raise BASE.Invalid("independent preseal audit freeze constructibility result mismatch")
    loop_break = audit.get("loop_break_preconditions")
    if not isinstance(loop_break, dict) or loop_break.get("status") != "LOOP_BREAK_PRECONDITIONS_MET" or loop_break.get("full_matrix_authorized") is not False:
        raise BASE.Invalid("independent preseal audit loop-break preconditions mismatch")
    honesty = audit.get("terminal_and_qualification_honesty")
    if not isinstance(honesty, dict) or honesty.get("status") != "PASS" or honesty.get("three_route_canary_required_before_full_matrix") is not True:
        raise BASE.Invalid("independent preseal audit terminal/qualification honesty mismatch")
    calls = audit.get("zero_call_attestation")
    zero_fields = (
        "subject_calls", "provider_calls", "network_calls", "live_plans_reads",
        "temporary_files_written", "cache_files_written", "candidate_files_modified",
    )
    if (
        not isinstance(calls, dict)
        or any(type(calls.get(key)) is not int or calls[key] != 0 for key in zero_fields)
        or calls.get("files_written") != [expected_output]
    ):
        raise BASE.Invalid("independent preseal audit zero-call/write attestation invalid")
    want = {
        "path": f"{BASE.CANDIDATE_ROOT_REL}/independent_preseal_audit.json",
        "storage_sha256": BASE.sha(data), "storage_bytes": len(data),
        "schema_id": audit["schema_id"], "status": "PRESEAL_PASS", "launch_ready": True,
    }
    if binding != want or tuple(binding) != (
        "path", "storage_sha256", "storage_bytes", "schema_id", "status", "launch_ready"
    ):
        raise BASE.Invalid("independent preseal audit binding mismatch")
    return want


def _runtime_dependencies_from_architecture() -> list[dict[str, Any]]:
    architecture = BASE.strict_object(
        BASE.regular(ROOT / "architecture_contract.json", "architecture contract"),
        "architecture contract", canonical=False,
    )
    if architecture.get("candidate_id") != CANDIDATE_ID:
        raise BASE.Invalid("architecture contract candidate mismatch")
    closure = architecture.get("runtime_dependency_closure")
    if not isinstance(closure, list) or len(closure) != 73:
        raise BASE.Invalid("architecture runtime dependency closure count mismatch")
    paths = [row.get("path") for row in closure if isinstance(row, dict)]
    if len(paths) != len(closure) or paths != sorted(paths) or len(paths) != len(set(paths)):
        raise BASE.Invalid("architecture runtime dependency closure is not exact sorted unique")
    expected: list[dict[str, Any]] = []
    goal_rows = 0
    for row in closure:
        if tuple(row) != ("path", "sha256", "bytes", "roles"):
            raise BASE.Invalid("architecture runtime dependency row keys/order invalid")
        if not isinstance(row.get("roles"), list) or not row["roles"] or any(not isinstance(role, str) or not role for role in row["roles"]):
            raise BASE.Invalid("architecture runtime dependency roles invalid")
        rel = row.get("path")
        if not isinstance(rel, str):
            raise BASE.Invalid("architecture runtime dependency path invalid")
        actual = BASE.file_row(
            BASE.checked_relative(SUCCESSOR, rel, "runtime dependency"), rel,
            f"runtime dependency {rel}",
        )
        if actual != {"path": rel, "sha256": row.get("sha256"), "bytes": row.get("bytes")}:
            raise BASE.Invalid(f"architecture runtime dependency drift: {rel}")
        if rel == "r8_goal_loop_buster_addendum_v1.json":
            goal_rows += 1
            if row["roles"] != ["goal_acceptance_custody"]:
                raise BASE.Invalid("goal addendum runtime dependency role mismatch")
            if actual != {
                "path": rel,
                "sha256": GOAL_ADDENDUM_BINDING["storage_sha256"],
                "bytes": GOAL_ADDENDUM_BINDING["storage_bytes"],
            }:
                raise BASE.Invalid("goal addendum runtime dependency identity mismatch")
    
        expected.append(actual)
    if goal_rows != 1:
        raise BASE.Invalid("runtime closure must contain exactly one goal acceptance custody row")
    return expected


def _validate_freeze_manifest(
    path_value: str | Path, expected_sha: str | None = None,
    expected_bytes: int | None = None,
) -> dict[str, Any]:
    supplied = Path(path_value)
    if str(supplied) == BASE.FREEZE_MANIFEST_REL:
        lexical = BASE.FREEZE_MANIFEST
    elif str(supplied) == str(BASE.FREEZE_MANIFEST):
        lexical = BASE.FREEZE_MANIFEST
    else:
        raise BASE.Invalid("candidate freeze manifest path is not the fixed external path")
    try:
        resolved = lexical.resolve(strict=True)
    except FileNotFoundError as exc:
        raise BASE.Invalid("external candidate freeze manifest missing") from exc
    if resolved != lexical:
        raise BASE.Invalid("external candidate freeze manifest path traverses a link")
    storage = BASE.regular(lexical, "external candidate freeze manifest")
    storage_sha, storage_bytes = BASE.sha(storage), len(storage)
    if expected_sha is not None and expected_sha != storage_sha:
        raise BASE.Invalid("run contract freeze manifest hash mismatch")
    if expected_bytes is not None and (type(expected_bytes) is not int or expected_bytes != storage_bytes):
        raise BASE.Invalid("run contract freeze manifest bytes mismatch")
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n") or b"\r" in storage:
        raise BASE.Invalid("freeze manifest storage framing invalid")
    manifest = BASE.strict_object(storage[:-1], "external candidate freeze manifest")
    if tuple(manifest) != FREEZE_MANIFEST_KEYS:
        raise BASE.Invalid("freeze manifest keys/order outside manifest-v6 contract")
    identity = (
        manifest.get("schema_id"), manifest.get("candidate_id"),
        manifest.get("identity_family"), manifest.get("claim_boundary"),
        manifest.get("candidate_root"), manifest.get("frozen_snapshot_descriptor_sha256"),
        manifest.get("preseal_terminal"), manifest.get("preseal_launch_ready"),
    )
    wanted = (
        "pw-r8-external-candidate-freeze-manifest-v6", CANDIDATE_ID,
        BASE.IDENTITY_FAMILY,
        "unfinished throwaway frozen-snapshot prompt-architecture experiment only",
        BASE.CANDIDATE_ROOT_REL, BASE.SNAPSHOT_DESCRIPTOR_SHA256, "PRESEAL_PASS", True,
    )
    if identity != wanted:
        raise BASE.Invalid("freeze manifest identity/status mismatch")
    addendum = validate_goal_loop_buster_addendum(manifest.get("goal_loop_buster_addendum"))
    if manifest.get("qualification_contract") != BASE.QUALIFICATION_CONTRACT or tuple(manifest["qualification_contract"]) != tuple(BASE.QUALIFICATION_CONTRACT):
        raise BASE.Invalid("freeze manifest qualification contract mismatch")
    root_stat = BASE.os.lstat(ROOT)
    if not stat.S_ISDIR(root_stat.st_mode) or ROOT.resolve() != ROOT:
        raise BASE.Invalid("candidate root is not an exact regular directory")
    actual_names = tuple(sorted(path.name for path in ROOT.iterdir()))
    if actual_names != CANDIDATE_FILES:
        raise BASE.Invalid("candidate directory closed-world file set mismatch")
    rows = manifest.get("candidate_files")
    if type(manifest.get("candidate_file_count")) is not int or manifest["candidate_file_count"] != len(CANDIDATE_FILES) or not isinstance(rows, list) or len(rows) != len(CANDIDATE_FILES):
        raise BASE.Invalid("freeze candidate inventory count mismatch")
    if any(not isinstance(row, dict) or tuple(row) != ("path", "sha256", "bytes") for row in rows) or [row["path"] for row in rows] != list(CANDIDATE_FILES):
        raise BASE.Invalid("freeze candidate inventory is not exact sorted closed world")
    actual_rows = [
        BASE.file_row(BASE.checked_relative(ROOT, name, "candidate file"), name, f"candidate file {name}")
        for name in CANDIDATE_FILES
    ]
    if rows != actual_rows:
        raise BASE.Invalid("freeze candidate inventory hash/bytes drift")
    current_bundle = BASE.audited_candidate_bundle_from_rows(
        [row for row in actual_rows if row["path"] != "independent_preseal_audit.json"]
    )
    manifest_bundle = BASE.validate_bound_record_bundle(manifest, current_bundle, "freeze manifest")
    audit_binding = manifest.get("independent_preseal_audit")
    if not isinstance(audit_binding, dict):
        raise BASE.Invalid("freeze independent audit binding missing")
    validated_audit = _validate_audit(ROOT / "independent_preseal_audit.json", audit_binding, current_bundle)
    expected_runtime = _runtime_dependencies_from_architecture()
    runtime = manifest.get("runtime_dependencies")
    if type(manifest.get("runtime_dependency_count")) is not int or manifest["runtime_dependency_count"] != len(expected_runtime) or not isinstance(runtime, list):
        raise BASE.Invalid("freeze runtime dependency count mismatch")
    if any(not isinstance(row, dict) or tuple(row) != ("path", "sha256", "bytes") for row in runtime) or runtime != expected_runtime:
        raise BASE.Invalid("freeze runtime dependency inventory mismatch")
    manifest_successor_rel = BASE.FREEZE_MANIFEST.relative_to(SUCCESSOR).as_posix()
    if any(row["path"] in (BASE.FREEZE_MANIFEST_REL, manifest_successor_rel) for row in [*rows, *runtime]):
        raise BASE.Invalid("freeze manifest must not inventory itself")
    candidate_bytes = BASE.dump(actual_rows)
    runtime_bytes = BASE.dump(expected_runtime)
    qualification_bytes = BASE.dump(BASE.QUALIFICATION_CONTRACT)
    return {
        "schema_id": "pw-r8-freeze-validation-v3", "candidate_id": CANDIDATE_ID,
        "status": "PASS", "manifest_path": BASE.FREEZE_MANIFEST_REL,
        "manifest_storage_sha256": storage_sha, "manifest_storage_bytes": storage_bytes,
        "goal_loop_buster_addendum": addendum,
        "audited_candidate_bundle": manifest_bundle,
        "frozen_snapshot_descriptor_sha256": BASE.SNAPSHOT_DESCRIPTOR_SHA256,
        "candidate_file_count": len(actual_rows),
        "candidate_inventory_sha256": BASE.sha(candidate_bytes),
        "candidate_inventory_bytes": len(candidate_bytes),
        "runtime_dependency_count": len(expected_runtime),
        "runtime_dependency_inventory_sha256": BASE.sha(runtime_bytes),
        "runtime_dependency_inventory_bytes": len(runtime_bytes),
        "independent_preseal_audit": validated_audit,
        "qualification_contract_sha256": BASE.sha(qualification_bytes),
        "qualification_contract_bytes": len(qualification_bytes),
        "manifest_excludes_itself": True, "candidate_directory_closed_world": True,
    }


def _run_contract(execution_root: Path) -> dict[str, Any]:
    _, _, value = BASE.payload(execution_root / "run_contract.json", "run contract")
    if value.get("schema_id") != "pw-r8-run-contract-v6" or value.get("candidate_id") != CANDIDATE_ID:
        raise BASE.Invalid("run contract identity mismatch")
    if tuple(value) != RUN_CONTRACT_KEYS:
        raise BASE.Invalid("run contract keys/order outside run-contract-v6")
    run_id = value.get("run_id")
    if not isinstance(run_id, str) or not BASE.RUN_ID_RE.fullmatch(run_id):
        raise BASE.Invalid("run contract run_id invalid")
    routes = {slot: {"requested_model": BASE.ROUTES[slot][0], "requested_thinking": BASE.ROUTES[slot][1]} for slot in BASE.SLOTS}
    if value.get("routes") != routes:
        raise BASE.Invalid("run contract routes mismatch")
    schedule_path = value.get("dispatch_schedule_path")
    schedule_sha = value.get("dispatch_schedule_storage_sha256")
    schedule_bytes = value.get("dispatch_schedule_storage_bytes")
    if schedule_path != BASE.DISPATCH_SCHEDULE_REL or not isinstance(schedule_sha, str) or not BASE.re.fullmatch(r"[0-9a-f]{64}", schedule_sha) or type(schedule_bytes) is not int or schedule_bytes <= 0:
        raise BASE.Invalid("run contract dispatch schedule identity invalid")
    manifest_path = value.get("candidate_freeze_manifest_path")
    manifest_sha = value.get("candidate_freeze_manifest_storage_sha256")
    manifest_bytes = value.get("candidate_freeze_manifest_storage_bytes")
    if manifest_path != BASE.FREEZE_MANIFEST_REL or not isinstance(manifest_sha, str) or not BASE.re.fullmatch(r"[0-9a-f]{64}", manifest_sha) or type(manifest_bytes) is not int or manifest_bytes <= 0:
        raise BASE.Invalid("run contract candidate freeze manifest identity invalid")
    freeze = _validate_freeze_manifest(manifest_path, manifest_sha, manifest_bytes)
    _require_exact_binding(
        value.get("goal_loop_buster_addendum"), freeze["goal_loop_buster_addendum"],
        "run contract goal loop-buster addendum versus freeze manifest",
    )
    BASE.validate_bound_record_bundle(value, freeze["audited_candidate_bundle"], "run contract")
    sequence, predecessor = value.get("qualification_sequence"), value.get("predecessor_run_id")
    if type(sequence) is not int or sequence not in (1, 2):
        raise BASE.Invalid("run contract qualification sequence must be 1 or 2")
    if sequence == 1 and predecessor is not None:
        raise BASE.Invalid("qualification sequence 1 predecessor must be null")
    if sequence == 2 and (not isinstance(predecessor, str) or not BASE.RUN_ID_RE.fullmatch(predecessor) or predecessor == run_id):
        raise BASE.Invalid("qualification sequence 2 predecessor invalid")
    return value


BASE.validate_audit = _validate_audit
BASE.validate_freeze_manifest = _validate_freeze_manifest
BASE.run_contract = _run_contract


def _validate_layout(root: Path, cells: tuple[str, ...]) -> None:
    root_names = {
        "run_contract.json", "dispatch_schedule.json", "ordered_schedule.json",
        "subject_call_accounting.json", "validation_report.json",
        "artifact_manifest.json", "matrix_terminal.json",
    }
    cell_set, stage_set = set(cells), set(BASE.STAGES)
    for path in root.rglob("*"):
        info = path.lstat()
        parts = path.relative_to(root).parts
        if stat.S_ISDIR(info.st_mode):
            allowed = (
                (
                    len(parts) == 1
                    and parts[0] in {
                        *BASE.SLOTS, "direct_appserver_receipts",
                        "invocation_completions", "controller_invalid", "path_terminals",
                    }
                )
                or (
                    len(parts) == 2
                    and (
                        (parts[0] in BASE.SLOTS and parts[1] in {"rendered", "captures", "scores", "artifacts"})
                        or (parts[0] == "controller_invalid" and parts[1] in BASE.SLOTS)
                    )
                )
                or (
                    len(parts) == 3 and parts[0] == "controller_invalid"
                    and parts[1] in BASE.SLOTS and parts[2] in cell_set
                )
            )
            if not allowed:
                raise BASE.Invalid(f"directory outside closed-world run layout: {path.relative_to(root)}")
            continue
        if not stat.S_ISREG(info.st_mode):
            raise BASE.Invalid(f"nonregular evidence entry: {path}")
        allowed = False
        if len(parts) == 1 and parts[0] in root_names:
            allowed = True
        elif (
            len(parts) == 2 and parts[0] in {"direct_appserver_receipts", "invocation_completions"}
            and any(parts[1] == f"{slot}_{cell}.json" for slot in BASE.SLOTS for cell in cells)
        ):
            allowed = True
        elif len(parts) == 2 and parts[0] == "path_terminals" and parts[1] in {f"{slot}.json" for slot in BASE.SLOTS}:
            allowed = True
        elif (
            len(parts) == 4 and parts[0] == "controller_invalid"
            and parts[1] in BASE.SLOTS and parts[2] in cell_set
            and BASE.re.fullmatch(r"attempt-[0-9]{4}\.json", parts[3])
        ):
            allowed = True
        elif len(parts) == 3 and parts[0] in BASE.SLOTS:
            if parts[1] in ("captures", "scores") and parts[2].endswith(".json") and parts[2][:-5] in cell_set:
                allowed = True
            elif parts[1] == "rendered" and parts[2].endswith(".txt") and parts[2][:-4] in cell_set:
                allowed = True
            elif parts[1] == "artifacts" and parts[2].endswith(".json") and parts[2][:-5] in stage_set:
                allowed = True
        if not allowed:
            raise BASE.Invalid(f"file outside closed-world run layout: {path.relative_to(root)}")


BASE.validate_layout = _validate_layout
_original_completed_receipt = BASE.completed_receipt


def _completed_receipt(root: Path, slot: str, cell: str):
    storage, receipt, binding = _original_completed_receipt(root, slot, cell)
    try:
        observation = PROCESS.validate_persisted_completion(
            root, slot, cell, receipt_storage=storage
        )
    except PROCESS.ProcessCompletionError as exc:
        raise BASE.Invalid(f"process completion admission failed: {exc}") from exc
    render = observation["pre_dispatch_render_observation"]
    binding = {**binding, "invocation_completion_observation": {
        "schema_id": observation["schema_id"],
        "status": observation["status"],
        "outer_exec_terminal_observed": observation["outer_exec_terminal_observed"],
        "outer_exec_exit_code": observation["outer_exec_exit_code"],
        "receipt_storage_sha256": observation["receipt_storage_sha256"],
        "receipt_storage_bytes": observation["receipt_storage_bytes"],
        "pre_dispatch_render_observation_schema_id": render["schema_id"],
        "pre_dispatch_render_storage_sha256": render["storage_sha256"],
        "pre_dispatch_render_storage_bytes": render["storage_bytes"],
        "cell_transaction_state": observation["cell_transaction_state"],
        "stop_disposition": observation["stop_disposition"],
    }}
    return storage, receipt, binding


BASE.completed_receipt = _completed_receipt
_original_validate_cell = BASE.validate_cell


def _validate_cell(root: Path, slot: str, cell: str) -> dict[str, Any]:
    result = _original_validate_cell(root, slot, cell)
    if result.get("score_persisted_and_reopened") is not True:
        raise BASE.Invalid(
            "current cell remains unsealed: persisted score must be reopened before validate-cell PASS"
        )
    return result


BASE.validate_cell = _validate_cell
_original_adversarial = BASE.adversarial_in_memory_proofs


def _adversarial_in_memory_proofs() -> dict[str, Any]:
    result = _original_adversarial()
    process = PROCESS.process_completion_holdouts()
    rendered = PROCESS.predispatch_render_holdouts()
    stop = PROCESS.safe_boundary_holdouts()
    addendum_storage = BASE.regular(GOAL_ADDENDUM_PATH, "self-test goal loop-buster addendum")
    validate_goal_loop_buster_addendum(dict(GOAL_ADDENDUM_BINDING))
    custody_attacks: list[dict[str, Any]] = []

    def reject_addendum(name: str, binding: Any, storage: bytes = addendum_storage) -> None:
        try:
            _validate_goal_addendum_value(binding, storage)
        except BASE.Invalid as exc:
            custody_attacks.append({"attack": name, "result": "REJECT", "error": str(exc)})
        else:
            raise BASE.Invalid(f"self-test goal-addendum attack was accepted: {name}")

    reject_addendum("missing_binding", None)
    reject_addendum("wrong_path", {**GOAL_ADDENDUM_BINDING, "path": "wrong/addendum.json"})
    reject_addendum("wrong_hash", {**GOAL_ADDENDUM_BINDING, "storage_sha256": "0" * 64})
    reject_addendum("wrong_bytes", {**GOAL_ADDENDUM_BINDING, "storage_bytes": GOAL_ADDENDUM_BINDING["storage_bytes"] + 1})
    reject_addendum("wrong_storage", dict(GOAL_ADDENDUM_BINDING), addendum_storage[:-2] + b"x\n")
    reordered_binding = {
        "storage_sha256": GOAL_ADDENDUM_BINDING["storage_sha256"],
        "path": GOAL_ADDENDUM_BINDING["path"],
        "storage_bytes": GOAL_ADDENDUM_BINDING["storage_bytes"],
    }
    reject_addendum("binding_key_order", reordered_binding)
    mismatch = {**GOAL_ADDENDUM_BINDING, "storage_sha256": "f" * 64}
    cross_binding_attacks: list[dict[str, Any]] = []
    for name, observed, expected in (
        ("manifest_run_addendum_mismatch", mismatch, GOAL_ADDENDUM_BINDING),
        (
            "terminal_manifest_drift",
            {"path": BASE.FREEZE_MANIFEST_REL, "storage_sha256": "e" * 64, "storage_bytes": 1, "audited_candidate_bundle": {}},
            {"path": BASE.FREEZE_MANIFEST_REL, "storage_sha256": "d" * 64, "storage_bytes": 1, "audited_candidate_bundle": {}},
        ),
    ):
        try:
            _require_exact_binding(observed, expected, f"self-test {name}")
        except BASE.Invalid as exc:
            cross_binding_attacks.append({"attack": name, "result": "REJECT", "error": str(exc)})
        else:
            raise BASE.Invalid(f"self-test cross-binding attack was accepted: {name}")
    result.update({
        "schema_id": "pw-r8-candidate-v12-adversarial-in-memory-proofs-v1",
        "candidate_id": CANDIDATE_ID,
        "process_completion_proof_count": process["cases"],
        "process_completion_proofs": process["results"],
        "pre_dispatch_render_proof_count": rendered["cases"],
        "pre_dispatch_render_proofs": rendered["results"],
        "safe_boundary_proof_count": stop["cases"],
        "safe_boundary_proofs": stop["results"],
        "goal_addendum_positive_proof_count": 1,
        "goal_addendum_attack_proof_count": len(custody_attacks),
        "goal_addendum_attack_proofs": custody_attacks,
        "cross_binding_attack_proof_count": len(cross_binding_attacks),
        "cross_binding_attack_proofs": cross_binding_attacks,
        "controller_answer_cell_model_specific_logic": False,
    })
    return result


BASE.adversarial_in_memory_proofs = _adversarial_in_memory_proofs


def main() -> int:
    return BASE.main()


if __name__ == "__main__":
    raise SystemExit(main())
