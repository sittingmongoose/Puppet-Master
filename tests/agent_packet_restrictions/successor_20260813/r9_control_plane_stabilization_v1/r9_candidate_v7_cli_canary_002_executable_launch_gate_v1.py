#!/usr/bin/env python3
"""Fail-closed, single-use executable launch gate for Candidate V7 CLI Canary002."""

import argparse
import ctypes
import datetime as dt
import errno
import hashlib
import importlib.util
import json
import os
import pathlib
import signal
import stat
import subprocess
import sys
import time

sys.dont_write_bytecode = True

WORKSPACE = pathlib.Path("/mnt/Cursor/PuppetMaster")
BASE = WORKSPACE / "tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1"
RUN_ID = "candidate-v7-cli-canary-002"
RUN_KIND = "run-canary"
EVIDENCE_PARENT = BASE / "empirical_evidence_v1"
EVIDENCE_LEAF = EVIDENCE_PARENT / RUN_ID
CAPTURE_PARENT = BASE / "cli_transport_captures_v1"
CAPTURE_LEAF = CAPTURE_PARENT / RUN_ID
CONTROLLER = BASE / "candidate_v7_cli_transport_controller_v2.py"
LAUNCHER = BASE / "r9_candidate_v7_cli_canary_002_executable_launch_gate_v1.py"
REVIEW = BASE / "r9_candidate_v7_cli_canary_002_executable_launch_gate_v1_independent_xhigh_review_v1.json"
START_RECEIPT = CAPTURE_PARENT / "candidate-v7-cli-canary-002-executable-launch-gate-start-receipt.json"
CONTROLLER_STDOUT = CAPTURE_PARENT / "candidate-v7-cli-canary-002-executable-launch-gate-controller-stdout.bin"
CONTROLLER_STDERR = CAPTURE_PARENT / "candidate-v7-cli-canary-002-executable-launch-gate-controller-stderr.bin"
TERMINAL_RECEIPT = CAPTURE_PARENT / "candidate-v7-cli-canary-002-executable-launch-gate-terminal-receipt.json"
RUNTIME_PATHS = (START_RECEIPT, CONTROLLER_STDOUT, CONTROLLER_STDERR, TERMINAL_RECEIPT)
REVIEW_SCHEMA = "pw-r9-candidate-v7-cli-canary-002-executable-launch-gate-v1-independent-xhigh-review-v1"
CHECK_SCHEMA = "pw-r9-candidate-v7-cli-canary-002-executable-launch-gate-check-v1"
START_SCHEMA = "pw-r9-candidate-v7-cli-canary-002-executable-launch-gate-start-receipt-v1"
TERMINAL_SCHEMA = "pw-r9-candidate-v7-cli-canary-002-executable-launch-gate-terminal-receipt-v1"
ERROR_SCHEMA = "pw-r9-candidate-v7-cli-canary-002-executable-launch-gate-error-v1"
OUTER_TIMEOUT_SECONDS = 3000
CHECK_EXPECTED_GIT_SUBPROCESSES = 35
ARGV_TAIL = ("run", "--run-kind", RUN_KIND, "--run-id", RUN_ID,
             "--evidence-root", str(EVIDENCE_PARENT), "--capture-root", str(CAPTURE_LEAF))
OFFLINE_CHECK_KEYS = frozenset(("accounting", "causal_dependency_gates", "component_bootstrap",
    "component_equivalence", "deterministic_scores", "exact_inventory", "expected_interface",
    "global_freshness", "matrix_terminal", "path_terminals", "present_custody", "provider_bytes",
    "row_chains", "run_manifest", "schedule_and_stop_rules", "semantic_bundle",
    "shared_authorities", "stage_artifacts", "transport_captures"))
LOCAL_COUNTS = {"git_readonly_subprocesses": 0, "local_cli_introspection_processes": 0,
                "cli_version_processes": 0, "cli_help_processes": 0,
                "controller_popen_attempts": 0}
ASYNC_SIGNAL_LATCH = []
PR_SET_CHILD_SUBREAPER = 36
PR_GET_CHILD_SUBREAPER = 37
TERMINATION_SIGNALS = frozenset((signal.SIGINT, signal.SIGTERM, signal.SIGHUP, signal.SIGQUIT))
CONTROLLER_TERMINAL_KEYS = frozenset(("schema_id", "controller_revision", "status", "run_id",
    "run_kind", "evidence_root", "capture_root", "controller_error", "counts",
    "observed_activity_totals", "activity_observation_complete_rows",
    "activity_observation_incomplete_rows", "component_identity_before", "component_identity_after",
    "cli", "config_identity_before", "config_identity_after", "environment_identity_before",
    "environment_identity_after", "protected_run_state_before", "protected_run_state_after",
    "protected_canary_state_before", "protected_canary_state_after", "runner_process",
    "runner_result_is_sole_qualification_authority", "qualification_authority",
    "compatibility_label_disclosure", "transport_revision", "transport_nonclaims",
    "activity_subtype_policy", "capture_inventory_scope", "capture_inventory",
    "evidence_inventory_scope", "evidence_inventory"))
QUALIFICATION_KEYS = frozenset(("schema_id", "run_id", "run_sha256", "run_bytes", "status",
                                "matrix_status", "offline_verifier"))
OFFLINE_KEYS = frozenset(("schema_id", "valid", "run_id", "run_kind", "matrix_status", "error",
    "checks", "counts", "credit", "component", "custody", "shared_authorities", "calls",
    "authority", "residuals"))
QCOUNT_KEYS = frozenset(("accounting_bytes", "attempts", "best_of_count", "captured_raw_results",
    "captured_spawn_records", "completed_rows", "controller_aborted_rows", "evidence_runs_scanned",
    "globally_unique_identity_and_nonce_values", "ineligible_rows", "invalid_rows",
    "invalid_stage_artifacts", "missing_rows", "pass_rows", "planned_calls", "replacement_count",
    "retry_count", "spawn_failure_prefix_count", "stage_artifacts", "stopped_rows",
    "subject_fail_rows", "terminal_failure_prefix_count"))

BOUND = {
    "controller": ("tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/candidate_v7_cli_transport_controller_v2.py", "bcea5082028dc20c2b1f9eb1d205b413c049905850046bac5830137cfb2127d8", 74599),
    "controller_review": ("tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_candidate_v7_cli_transport_controller_v2_independent_xhigh_review_v1.json", "037f4be16db161cd17aab8640586d4720f0162471c523c38aae86157ce8226cd", 11746),
    "canary_001_failure": ("tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_candidate_v7_cli_canary_001_failure_receipt_v1.json", "64b3f7dc467a39b65edaa9c35e72394b5916e65db8c39c106b0b6e4cb6fe065d", 12329),
    "canary_001_progress": ("tests/agent_packet_restrictions/successor_20260813/r9_progress_assessment_candidate_v7_cli_canary_001_runtime_failure_v1.json", "847110b3326ab6f8d34be949d46f08286e99a2f4b0c7b3a38e7134a731cb3f72", 9214),
    "admission_v1": ("tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_candidate_v7_cli_canary_002_admission_v1.json", "8a5a18e1ec13ddaa04dc6f3f9caa9f16ff16003e263c771d522ef38487b255bc", 18044),
    "admission_v1_review": ("tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_candidate_v7_cli_canary_002_admission_independent_xhigh_review_v1.json", "75e87ddfb973ed381b12e62b51f4a20ec34ba71ebde673999d2917b7f9358b9d", 10816),
    "admission_v1_rejection": ("tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_candidate_v7_cli_canary_002_admission_v1_family_rejection_v1.json", "eb3fbb3238eaee1df7e2758e635e7413a0476ec4bd3e5b341f68d51ee25f442a", 12695),
    "admission_v2": ("tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_candidate_v7_cli_canary_002_admission_v2.json", "baa3e8fa97f0672f3b15e3523ea533ede2abb8e8b45986d1b77a40aeb0139608", 26181),
    "admission_v2_review": ("tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_candidate_v7_cli_canary_002_admission_v2_independent_xhigh_review_v1.json", "b78341e6bdabe1f1d0ab7600120680b02e040ad80274c9334d8aaea159563d58", 14110),
    "family_rejection": ("tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_candidate_v7_cli_admission_json_family_rejection_v1.json", "c9be6c1c4228c58fa5a59a888055243eea187effda5488539600079859cadac7", 13015),
    "semantic_bundle": ("tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/formal_candidate_v7/semantic_bundle.json", "11139c2b52a2fe900f2976a34f7712d8f05d5b2991ce8cc26d5cfc4e1ef871c2", 786546),
    "runner": ("tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/formal_candidate_v7/runner.py", "3d773914f3be5eac06d73f7a4e27c25bfea212aa1baa9c399e06200211199469", 59507),
    "evidence_recorder": ("tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/formal_candidate_v7/evidence_recorder.py", "7f8ca2d19750a65ac71b711f13ed4fb1205eab0711b945463561a5f3f35a9e52", 39866),
    "offline_verifier": ("tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/formal_candidate_v7/offline_verifier.py", "7cea3258b0928430b6064ae48c9a3b296ed024f196c972184b779f938279c569", 95000),
}


class Invalid(RuntimeError):
    pass


def sha(data):
    return hashlib.sha256(data).hexdigest()


def canon(value):
    try:
        return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True,
                          separators=(",", ":")).encode("utf-8")
    except (TypeError, ValueError, UnicodeEncodeError) as exc:
        raise Invalid(f"noncanonical value: {exc}") from exc


def pairs(items):
    value = {}
    for key, item in items:
        if key in value:
            raise Invalid(f"duplicate JSON key: {key}")
        value[key] = item
    return value


def parse_canonical_line(data, label):
    if not data.endswith(b"\n") or data.endswith(b"\n\n") or b"\r" in data or b"\n" in data[:-1]:
        raise Invalid(f"{label}: expected exactly one canonical JSON line")
    try:
        value = json.loads(data[:-1].decode("utf-8"), object_pairs_hook=pairs,
                           parse_constant=lambda item: (_ for _ in ()).throw(Invalid(item)))
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid(f"{label}: invalid JSON: {exc}") from exc
    if not isinstance(value, dict) or canon(value) + b"\n" != data:
        raise Invalid(f"{label}: not a canonical sorted JSON object")
    return value


def utc_now():
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z")


def regular_bytes(path):
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        before = os.fstat(fd)
        if not stat.S_ISREG(before.st_mode):
            raise Invalid(f"not a regular non-symlink file: {path}")
        parts = []
        while True:
            part = os.read(fd, 65536)
            if not part:
                break
            parts.append(part)
        after = os.fstat(fd)
        if (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) != (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns):
            raise Invalid(f"file changed while read: {path}")
        return b"".join(parts), stat.S_IMODE(before.st_mode)
    finally:
        os.close(fd)


def fd_identity(fd, source_path):
    before = os.fstat(fd)
    if not stat.S_ISREG(before.st_mode):
        raise Invalid(f"fd source is not regular: {source_path}")
    os.lseek(fd, 0, os.SEEK_SET)
    parts = []
    while True:
        part = os.read(fd, 65536)
        if not part:
            break
        parts.append(part)
    os.lseek(fd, 0, os.SEEK_SET)
    after = os.fstat(fd)
    if (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) != (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns):
        raise Invalid(f"fd source changed while hashed: {source_path}")
    data = b"".join(parts)
    return {"source_path": str(source_path), "bytes": len(data), "sha256": sha(data),
            "fs_mode": f"{stat.S_IMODE(before.st_mode):04o}", "device": before.st_dev,
            "inode": before.st_ino, "mtime_ns": before.st_mtime_ns}


def path_identity(path):
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        return fd_identity(fd, path)
    finally:
        os.close(fd)


def running_source_identity():
    return path_identity(pathlib.Path(__file__).absolute())


def interpreter_identity():
    invoked = pathlib.Path(sys.executable).absolute()
    resolved = pathlib.Path(os.path.realpath(invoked))
    value = path_identity(resolved)
    value.update({"invoked_path": str(invoked), "resolved_path": str(resolved)})
    return value


def run_readonly(argv, label):
    LOCAL_COUNTS["git_readonly_subprocesses"] += 1
    result = subprocess.run(argv, cwd=WORKSPACE, stdin=subprocess.DEVNULL,
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    if result.returncode:
        raise Invalid(f"{label}: rc={result.returncode}: {result.stderr.decode('utf-8', 'replace')}")
    return result.stdout


def git_identity(relpath, expected_sha=None, expected_bytes=None, running=None):
    mode_line = run_readonly(["git", "ls-tree", "HEAD", "--", relpath], f"git ls-tree {relpath}")
    fields = mode_line.decode("utf-8", "strict").rstrip("\n").split(None, 3)
    if len(fields) != 4 or fields[0] != "100644" or fields[1] != "blob" or fields[3] != relpath:
        raise Invalid(f"HEAD tracking/mode mismatch: {relpath}")
    head_data = run_readonly(["git", "show", f"HEAD:{relpath}"], f"git show {relpath}")
    if running is None:
        current, mode = regular_bytes(WORKSPACE / relpath)
        current_sha, current_bytes = sha(current), len(current)
    else:
        mode = int(running["fs_mode"], 8)
        current_sha, current_bytes = running["sha256"], running["bytes"]
        current = head_data if (current_sha, current_bytes) == (sha(head_data), len(head_data)) else b""
    if mode != 0o644 or current != head_data:
        raise Invalid(f"current bytes/mode differ from HEAD: {relpath}")
    got = {"path": relpath, "sha256": sha(current), "bytes": len(current),
           "mode": "100644", "git_blob_oid": fields[2]}
    if expected_sha is not None and (got["sha256"], got["bytes"]) != (expected_sha, expected_bytes):
        raise Invalid(f"frozen identity mismatch: {relpath}")
    return got


def git_gate():
    head = run_readonly(["git", "rev-parse", "HEAD"], "HEAD").decode().strip()
    origin = run_readonly(["git", "rev-parse", "origin/main"], "origin/main").decode().strip()
    if head != origin:
        raise Invalid("HEAD does not equal local origin/main")
    return {"head": head, "origin_main": origin, "head_equals_origin_main": True}


def review_projection(launcher_identity, interpreter):
    binding = lambda item: {"path": item[0], "sha256": item[1], "bytes": item[2], "mode": "100644"}
    interpreter_binding = {key: interpreter[key] for key in
        ("invoked_path", "resolved_path", "bytes", "sha256", "fs_mode")}
    return {"schema_id": REVIEW_SCHEMA, "verdict": "PASS_ZERO_EXPERIMENT_VALIDITY_BLOCKERS",
        "authority": {"canary_count": 1, "canary_launch": False, "matrix": False,
            "qualification": False, "qualification_credit": 0, "readiness": False,
            "release": False, "retry": False, "relaunch": False, "replacement": False,
            "best_of": False, "run_id": RUN_ID, "run_kind": RUN_KIND},
        "bindings": {"launcher": {key: launcher_identity[key] for key in ("path", "sha256", "bytes", "mode")},
            "interpreter": interpreter_binding,
            **{name: binding(item) for name, item in BOUND.items()}},
        "execution_contract": {"argv_tail": list(ARGV_TAIL), "controller_source_path": str(CONTROLLER),
            "evidence_parent": str(EVIDENCE_PARENT), "evidence_leaf": str(EVIDENCE_LEAF),
            "capture_parent": str(CAPTURE_PARENT), "capture_leaf": str(CAPTURE_LEAF),
            "interpreter_invoked_path": interpreter["invoked_path"],
            "interpreter_resolved_path": interpreter["resolved_path"], "python_flags": ["-B"],
            "timeout_flags_omitted": True, "fd_backed_interpreter_and_controller": True,
            "controller_popen_limit": 1, "outer_timeout_seconds": OUTER_TIMEOUT_SECONDS,
            "no_retry_relaunch_replacement_best_of": True,
            "linux_child_subreaper_required": True,
            "recursive_detached_descendant_cleanup_required": True,
            "any_residual_or_adopted_descendant_detection_fails_success": True},
        "check_accounting": {"git_readonly_subprocesses": CHECK_EXPECTED_GIT_SUBPROCESSES,
            "local_cli_introspection_processes": 2, "cli_version_processes": 1,
            "cli_help_processes": 1, "controller_popen_attempts": 0,
            "controller_processes": 0, "runner_processes": 0, "subject_processes": 0,
            "model_calls": 0, "provider_calls": 0, "workspace_writes": 0},
        "protected_gates": {"canary_001_exact": True, "matrix_005_exact": True,
            "matrix_006_absent": True, "matrix_007_absent": True, "matrix_008_absent": True,
            "capture_parent_exact_mode_0700": True, "capture_parent_sole_pre_run_child_canary_001": True,
            "new_leaves_absent": True, "process_quiescence_proc_scan": True,
            "head_equals_origin_main": True, "phase_continuity_required": True,
            "postflight_capture_parent_exact_child_inventory": True},
        "containment_scope": {"linux_subreaper_pidfd_procfs_descendants": True,
            "launcher_sigkill_or_crash_guarantee": False,
            "uninterruptible_d_state_guarantee": False,
            "outside_visible_pid_namespace_or_readable_procfs_guarantee": False,
            "non_descendant_external_service_guarantee": False,
            "cgroup_grade_containment": False},
        "canary_authority": "STATIC_REVIEW_PASS_BINDS_ONE_CANARY_SCOPE_BUT_GRANTS_NO_STANDALONE_LAUNCH_AUTHORITY__THE_TRACKED_EXECUTABLE_GATE_AND_ALL_LIVE_CHECKS_CONTROL_ITS_SOLE_POPEN"}


def review_gate(launcher_identity, interpreter):
    review_identity = git_identity(str(REVIEW.relative_to(WORKSPACE)))
    raw, _ = regular_bytes(REVIEW)
    review = parse_canonical_line(raw, "launcher review")
    if set(review) != set(review_projection(launcher_identity, interpreter)) | {"self_sha256"}:
        raise Invalid("launcher review top-level key set mismatch")
    projection = {key: value for key, value in review.items() if key != "self_sha256"}
    expected = review_projection(launcher_identity, interpreter)
    if projection != expected:
        raise Invalid("launcher review exact schema/value/binding mismatch")
    projection_bytes = canon(projection) + b"\n"
    if review["self_sha256"] != sha(projection_bytes):
        raise Invalid("launcher review self-hash mismatch")
    return {"identity": review_identity, "self_sha256": review["self_sha256"],
            "verdict": review["verdict"]}


def bound_gate():
    return {name: git_identity(*spec) for name, spec in BOUND.items()}


def scoped_drift_gate(paths):
    LOCAL_COUNTS["git_readonly_subprocesses"] += 1
    result = subprocess.run(["git", "diff", "--quiet", "HEAD", "--", *paths], cwd=WORKSPACE,
                            stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode != 0:
        raise Invalid(f"scoped tracked drift: rc={result.returncode}")
    return {"tracked_drift": False, "path_count": len(paths)}


def exact_directory(path, mode=None):
    info = path.lstat()
    if not stat.S_ISDIR(info.st_mode) or stat.S_ISLNK(info.st_mode):
        raise Invalid(f"not a non-symlink directory: {path}")
    if path.resolve(strict=True) != path:
        raise Invalid(f"directory does not resolve exactly: {path}")
    got_mode = stat.S_IMODE(info.st_mode)
    if mode is not None and got_mode != mode:
        raise Invalid(f"directory mode mismatch: {path}: {oct(got_mode)}")
    return {"path": str(path), "mode": got_mode, "device": info.st_dev, "inode": info.st_ino}


def minimal_execute_gate():
    capture = exact_directory(CAPTURE_PARENT, 0o700)
    evidence = exact_directory(EVIDENCE_PARENT)
    names = sorted(item.name for item in CAPTURE_PARENT.iterdir())
    if names != ["candidate-v7-cli-canary-001"]:
        raise Invalid(f"capture parent pre-run children mismatch: {names}")
    if EVIDENCE_LEAF.exists() or EVIDENCE_LEAF.is_symlink() or CAPTURE_LEAF.exists() or CAPTURE_LEAF.is_symlink():
        raise Invalid("new evidence/capture leaf is not absent")
    if any(path.exists() or path.is_symlink() for path in RUNTIME_PATHS):
        raise Invalid("fixed launcher runtime artifact already exists")
    return {"capture_parent": capture, "evidence_parent": evidence,
            "capture_children": names, "capture_leaf_absent": True, "evidence_leaf_absent": True,
            "runtime_paths_absent": True}


def roots_gate(phase):
    capture = exact_directory(CAPTURE_PARENT, 0o700)
    evidence = exact_directory(EVIDENCE_PARENT)
    names = sorted(item.name for item in CAPTURE_PARENT.iterdir())
    expected = ["candidate-v7-cli-canary-001"] if phase == "check" else [
        "candidate-v7-cli-canary-001", START_RECEIPT.name]
    if names != sorted(expected):
        raise Invalid(f"capture parent {phase} children mismatch: {names}")
    if EVIDENCE_LEAF.exists() or EVIDENCE_LEAF.is_symlink() or CAPTURE_LEAF.exists() or CAPTURE_LEAF.is_symlink():
        raise Invalid("new evidence/capture leaf is not absent")
    if phase == "check" and any(path.exists() or path.is_symlink() for path in RUNTIME_PATHS):
        raise Invalid("fixed launcher runtime artifact already exists")
    if phase == "boundary" and any(path.exists() or path.is_symlink() for path in RUNTIME_PATHS[1:]):
        raise Invalid("post-start launcher runtime artifact already exists")
    protected = list(getattr(load_controller(), "PROTECTED_RUN_ROOTS")) + list(getattr(load_controller(), "PROTECTED_CANARY_ROOTS"))
    for leaf in (EVIDENCE_LEAF, CAPTURE_LEAF):
        for item in protected:
            if leaf == item or leaf in item.parents or item in leaf.parents:
                raise Invalid(f"new leaf overlaps protected root: {leaf} / {item}")
    absent = {}
    for run_id in ("candidate-v7-matrix-007", "candidate-v7-matrix-008"):
        path = EVIDENCE_PARENT / run_id
        if path.exists() or path.is_symlink():
            raise Invalid(f"protected absent run root is present: {path}")
        absent[run_id] = {"present": False, "path": str(path)}
    return {"capture_parent": capture, "evidence_parent": evidence,
            "capture_children": names, "capture_leaf_absent": True, "evidence_leaf_absent": True,
            "protected_additional_absence": absent}


_CONTROLLER_MODULE = None


def load_controller():
    global _CONTROLLER_MODULE
    if _CONTROLLER_MODULE is None:
        spec = importlib.util.spec_from_file_location("candidate_v7_cli_transport_controller_v2_bound", CONTROLLER)
        if spec is None or spec.loader is None:
            raise Invalid("cannot construct controller import spec")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        _CONTROLLER_MODULE = module
    return _CONTROLLER_MODULE


def controller_baselines():
    ctl = load_controller()
    components = ctl.component_identity()
    cells, cell_order, instruction = ctl.load_bundle(components)
    environment = ctl.environment_identity()
    original_run = ctl.subprocess.run
    def counted_cli_run(argv, *args, **kwargs):
        values = [str(item) for item in argv]
        if values[-1:] == ["--version"]:
            LOCAL_COUNTS["local_cli_introspection_processes"] += 1
            LOCAL_COUNTS["cli_version_processes"] += 1
        elif values[-2:] == ["exec", "--help"]:
            LOCAL_COUNTS["local_cli_introspection_processes"] += 1
            LOCAL_COUNTS["cli_help_processes"] += 1
        else:
            raise Invalid(f"unexpected controller baseline subprocess: {values}")
        return original_run(argv, *args, **kwargs)
    ctl.subprocess.run = counted_cli_run
    try:
        cli = ctl.cli_identity()
    finally:
        ctl.subprocess.run = original_run
    config = ctl.assert_config_baseline(ctl.config_identity())
    protected = ctl.assert_protected_baseline(ctl.protected_run_state())
    protected_canary = ctl.assert_protected_canary_baseline(ctl.protected_canary_state())
    ast_check = ctl.ast_self_check()
    tests = ctl.self_tests()
    return {"component_identity": components, "environment_identity": environment,
            "cli_identity": cli, "config_identity": config, "protected_run_state": protected,
            "protected_canary_state": protected_canary,
            "semantic_bundle_validation": {"cell_count": len(cells),
                "cell_order_count": len(cell_order), "instruction_bytes": len(instruction)},
            "controller_ast_self_check": ast_check, "controller_self_tests": tests}


def process_quiescence():
    offenders = []
    own = os.getpid()
    for entry in pathlib.Path("/proc").iterdir():
        if not entry.name.isdigit() or int(entry.name) == own:
            continue
        try:
            raw = (entry / "cmdline").read_bytes()
        except (FileNotFoundError, ProcessLookupError, PermissionError, OSError):
            continue
        argv = [item.decode("utf-8", "replace") for item in raw.split(b"\0") if item]
        try:
            cwd = os.readlink(entry / "cwd")
        except OSError:
            cwd = None
        try:
            exe = os.readlink(entry / "exe")
        except OSError:
            exe = None
        try:
            session = os.getsid(int(entry.name))
        except (ProcessLookupError, PermissionError, OSError):
            session = None
        resolved_args = set()
        for item in argv:
            if item.startswith("/proc/self/fd/"):
                try:
                    resolved_args.add(os.path.realpath(f"/proc/{entry.name}/fd/{item.rsplit('/', 1)[1]}"))
                except OSError:
                    pass
            if item.startswith("/"):
                try:
                    resolved_args.add(os.path.realpath(item))
                except OSError:
                    pass
            elif cwd:
                resolved_args.add(os.path.realpath(os.path.join(cwd, item)))
        python_process = ((exe and pathlib.Path(exe).name.startswith("python"))
                          or (argv and pathlib.Path(argv[0]).name.startswith("python")))
        controller_run = python_process and (str(CONTROLLER) in resolved_args
            or CONTROLLER.name in [pathlib.Path(item).name for item in argv]) and "run" in argv
        candidate_dir = str(BASE / "formal_candidate_v7")
        runner_run = (cwd == candidate_dir and any(pathlib.Path(item).name == "runner.py" for item in argv)) or str(BASE / "formal_candidate_v7/runner.py") in resolved_args
        cli_subject = ((exe and pathlib.Path(exe).name == "codex") or any(pathlib.Path(item).name == "codex" for item in argv)) and "exec" in argv and "--ephemeral" in argv
        if controller_run or runner_run or cli_subject:
            offenders.append({"pid": int(entry.name), "argv": argv, "cwd": cwd,
                              "exe": exe, "session": session})
    if offenders:
        raise Invalid(f"controller/runner/subject process quiescence failed: {offenders}")
    return {"status": "PASS", "controller_run_processes": 0, "runner_processes": 0,
            "codex_exec_ephemeral_subject_processes": 0}


def count_snapshot():
    return dict(LOCAL_COUNTS)


def count_delta(before):
    return {key: LOCAL_COUNTS[key] - before[key] for key in LOCAL_COUNTS}


def observed_accounting(local_counts):
    return {**local_counts, "launcher_processes": 1, "controller_processes": 0,
            "runner_processes": 0, "subject_processes": 0, "model_calls": 0,
            "provider_calls": 0, "workspace_writes": 0, "retry_count": 0,
            "relaunch_count": 0, "replacement_count": 0, "best_of_count": 0,
            "observation_scope": "LAUNCHER_LOCAL_PROCESSES_AND_DIRECT_WRITES_ONLY"}


def preflight(running, phase="check"):
    before = count_snapshot()
    if pathlib.Path.cwd() != WORKSPACE:
        raise Invalid(f"cwd must be exact workspace: {pathlib.Path.cwd()}")
    git = git_gate()
    launcher = git_identity(str(LAUNCHER.relative_to(WORKSPACE)), running=running)
    interpreter = interpreter_identity()
    review = review_gate(launcher, interpreter)
    bound = bound_gate()
    scoped = scoped_drift_gate([launcher["path"], review["identity"]["path"]] + [item[0] for item in BOUND.values()])
    roots = roots_gate(phase)
    baselines = controller_baselines()
    processes = process_quiescence()
    local = count_delta(before)
    if local != {"git_readonly_subprocesses": CHECK_EXPECTED_GIT_SUBPROCESSES,
                 "local_cli_introspection_processes": 2, "cli_version_processes": 1,
                 "cli_help_processes": 1, "controller_popen_attempts": 0}:
        raise Invalid(f"preflight subprocess accounting mismatch: {local}")
    return {"status": "PASS", "phase": phase, "git": git, "launcher": launcher,
            "running_launcher_source": running, "interpreter": interpreter,
            "review": review, "bound": bound, "scoped_tracked_state": scoped,
            "roots": roots, "controller_baselines": baselines, "process_quiescence": processes,
            "call_accounting": observed_accounting(local),
            "authority": "OBSERVATION_ONLY__NO_QUALIFICATION_READINESS_OR_RELEASE_AUTHORITY"}


def fsync_dir(path):
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def write_exclusive(path, data, mode=0o600):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, mode)
    try:
        view = memoryview(data)
        while view:
            count = os.write(fd, view)
            if count <= 0:
                raise Invalid(f"short exclusive write: {path}")
            view = view[count:]
        os.fsync(fd)
    finally:
        os.close(fd)
    fsync_dir(path.parent)


def write_json(path, value):
    write_exclusive(path, canon(value) + b"\n")


def file_identity_if_regular(path):
    try:
        data, mode = regular_bytes(path)
        return {"present": True, "path": str(path), "bytes": len(data), "sha256": sha(data), "mode": mode}
    except FileNotFoundError:
        return {"present": False, "path": str(path)}


def safe_identity(path):
    try:
        return file_identity_if_regular(path)
    except (Exception, KeyboardInterrupt, SystemExit) as exc:
        return {"present": None, "path": str(path), "error": f"{type(exc).__name__}:{exc}"}


def safe_write_exclusive(path, data):
    try:
        write_exclusive(path, data)
        return {"status": "PASS", "identity": safe_identity(path)}
    except (Exception, KeyboardInterrupt, SystemExit) as exc:
        return {"status": "FAIL", "path": str(path), "error": f"{type(exc).__name__}:{exc}"}


def tree_identity(path):
    if not path.exists():
        return {"present": False, "path": str(path)}
    rows = []
    for item in sorted(path.rglob("*"), key=lambda value: value.relative_to(path).as_posix().encode()):
        info = item.lstat()
        rel = item.relative_to(path).as_posix()
        if stat.S_ISREG(info.st_mode) and not stat.S_ISLNK(info.st_mode):
            data, mode = regular_bytes(item)
            rows.append({"path": rel, "type": "file", "bytes": len(data), "sha256": sha(data), "mode": mode})
        elif stat.S_ISDIR(info.st_mode) and not stat.S_ISLNK(info.st_mode):
            rows.append({"path": rel, "type": "directory", "mode": stat.S_IMODE(info.st_mode)})
        else:
            rows.append({"path": rel, "type": "prohibited"})
    payload = canon(rows)
    return {"present": True, "path": str(path), "rows": rows,
            "projection_bytes": len(payload), "projection_sha256": sha(payload)}


def safe_tree_identity(path):
    try:
        return tree_identity(path)
    except (Exception, KeyboardInterrupt, SystemExit) as exc:
        return {"present": None, "path": str(path), "error": f"{type(exc).__name__}:{exc}"}


def open_execution_fds(boundary):
    interpreter_path = pathlib.Path(boundary["interpreter"]["resolved_path"])
    interpreter_fd = os.open(interpreter_path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        controller_fd = os.open(CONTROLLER, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    except Exception:
        os.close(interpreter_fd)
        raise
    interpreter = fd_identity(interpreter_fd, interpreter_path)
    controller = fd_identity(controller_fd, CONTROLLER)
    expected_interpreter = boundary["interpreter"]
    if any(interpreter[key] != expected_interpreter[key] for key in ("bytes", "sha256", "fs_mode", "device", "inode", "mtime_ns")):
        os.close(interpreter_fd)
        os.close(controller_fd)
        raise Invalid("interpreter fd identity differs from final-boundary path identity")
    expected_controller = boundary["bound"]["controller"]
    if (controller["bytes"], controller["sha256"], controller["fs_mode"]) != (
            expected_controller["bytes"], expected_controller["sha256"], "0644"):
        os.close(interpreter_fd)
        os.close(controller_fd)
        raise Invalid("controller fd identity differs from final-boundary tracked identity")
    executable = f"/proc/self/fd/{interpreter_fd}"
    controller_arg = f"/proc/self/fd/{controller_fd}"
    argv = [boundary["interpreter"]["invoked_path"], "-B", controller_arg, *ARGV_TAIL]
    return {"interpreter_fd": interpreter_fd, "controller_fd": controller_fd,
            "executable": executable, "argv": argv,
            "source_paths": {"interpreter": str(interpreter_path), "controller": str(CONTROLLER)},
            "fd_identities": {"interpreter": interpreter, "controller": controller},
            "argv_tail": list(ARGV_TAIL)}


def enable_subreaper():
    if sys.platform != "linux" or not pathlib.Path("/proc").is_dir():
        raise Invalid("Linux /proc subreaper containment is required")
    if not hasattr(os, "pidfd_open") or not hasattr(signal, "pidfd_send_signal"):
        raise Invalid("Linux pidfd APIs are required for race-safe descendant containment")
    libc = ctypes.CDLL(None, use_errno=True)
    if libc.prctl(PR_SET_CHILD_SUBREAPER, 1, 0, 0, 0) != 0:
        error = ctypes.get_errno()
        raise Invalid(f"PR_SET_CHILD_SUBREAPER failed: errno={error}")
    value = ctypes.c_int(0)
    if libc.prctl(PR_GET_CHILD_SUBREAPER, ctypes.byref(value), 0, 0, 0) != 0:
        error = ctypes.get_errno()
        raise Invalid(f"PR_GET_CHILD_SUBREAPER failed: errno={error}")
    if value.value != 1:
        raise Invalid(f"child subreaper verification failed: {value.value}")
    sigchld_handler = signal.getsignal(signal.SIGCHLD)
    current_mask = signal.pthread_sigmask(signal.SIG_BLOCK, set())
    if sigchld_handler == signal.SIG_IGN or signal.SIGCHLD in current_mask:
        raise Invalid("SIGCHLD semantics do not permit deterministic descendant reaping")
    return {"platform": sys.platform, "proc_root": "/proc", "set": True,
            "verified_value": value.value, "sigchld_handler": "SIG_DFL"
                if sigchld_handler == signal.SIG_DFL else repr(sigchld_handler),
            "sigchld_blocked": False}


def proc_table():
    table = {}
    for entry in pathlib.Path("/proc").iterdir():
        if not entry.name.isdigit():
            continue
        pid = int(entry.name)
        try:
            raw_stat = (entry / "stat").read_text(encoding="utf-8")
            tail = raw_stat[raw_stat.rfind(")") + 2:].split()
            state = tail[0]
            ppid, pgid, session, starttime = int(tail[1]), int(tail[2]), int(tail[3]), int(tail[19])
            cmdline = [item.decode("utf-8", "replace") for item in
                       (entry / "cmdline").read_bytes().split(b"\0") if item]
        except (FileNotFoundError, ProcessLookupError):
            continue
        except OSError as exc:
            if exc.errno in (errno.ENOENT, errno.ESRCH):
                continue
            raise Invalid(f"/proc visibility/read failure for pid {pid}: {exc}") from exc
        except (ValueError, IndexError) as exc:
            raise Invalid(f"/proc stat parse failure for pid {pid}: {exc}") from exc
        try:
            cwd = os.readlink(entry / "cwd")
        except OSError:
            cwd = None
        try:
            exe = os.readlink(entry / "exe")
        except OSError:
            exe = None
        table[pid] = {"pid": pid, "ppid": ppid, "pgid": pgid, "session": session,
                      "state": state,
                      "starttime": starttime, "cmdline": cmdline, "cwd": cwd, "exe": exe}
    return table


def descendant_inventory(excluded_pid=None):
    table = proc_table()
    selected = set()
    frontier = {os.getpid()}
    while frontier:
        parents = frontier
        frontier = {pid for pid, record in table.items()
                    if record["ppid"] in parents and pid not in selected}
        selected.update(frontier)
    if excluded_pid is not None:
        selected.discard(excluded_pid)
    for pid in selected:
        record = table[pid]
        if record["state"] != "Z" and (record["cwd"] is None or record["exe"] is None
                                          or not record["cmdline"]):
            raise Invalid(f"live descendant /proc visibility incomplete: {record}")
    return [table[pid] for pid in sorted(selected)]


def reap_known(records, excluded_pid=None):
    reaped = []
    for record in records:
        pid = record["pid"]
        if pid == excluded_pid:
            continue
        try:
            got, status_value = os.waitpid(pid, os.WNOHANG)
            if got == pid:
                reaped.append({"pid": pid, "status": status_value, "starttime": record["starttime"]})
        except (ChildProcessError, ProcessLookupError):
            pass
    return reaped


def bound_pidfd(record):
    if not hasattr(os, "pidfd_open") or not hasattr(signal, "pidfd_send_signal"):
        raise Invalid("pidfd_open and pidfd_send_signal are required for race-safe containment")
    try:
        fd = os.pidfd_open(record["pid"], 0)
    except ProcessLookupError:
        return None
    try:
        current = proc_table().get(record["pid"])
        if current is None:
            os.close(fd)
            return None
        if current["starttime"] != record["starttime"]:
            os.close(fd)
            raise Invalid(f"PID starttime changed before pidfd binding: {record['pid']}")
        return fd
    except Exception:
        try:
            os.close(fd)
        except OSError:
            pass
        raise


def pidfd_signal(records, signal_value, signal_name, evidence):
    for record in records:
        fd = bound_pidfd(record)
        if fd is None:
            continue
        try:
            signal.pidfd_send_signal(fd, signal_value, None, 0)
            evidence["signals"].append({"pid": record["pid"], "starttime": record["starttime"],
                                        "signal": signal_name, "pidfd_bound": True})
        except ProcessLookupError:
            pass
        finally:
            os.close(fd)


def cleanup_all_descendants(controller_pid, phase):
    evidence = {"phase": phase, "detected_ever": False, "inventories": [], "signals": [],
                "reaped": [], "bounded_rounds": 0, "residual": []}
    for signal_value, signal_name, rounds in ((signal.SIGSTOP, "SIGSTOP", 1),
                                               (signal.SIGTERM, "SIGTERM", 50),
                                               (signal.SIGCONT, "SIGCONT", 1),
                                               (signal.SIGKILL, "SIGKILL", 50)):
        for _ in range(rounds):
            records = descendant_inventory(excluded_pid=controller_pid)
            evidence["inventories"].append(records)
            evidence["bounded_rounds"] += 1
            if records:
                evidence["detected_ever"] = True
                pidfd_signal(records, signal_value, signal_name, evidence)
            evidence["reaped"].extend(reap_known(records, excluded_pid=controller_pid))
            if not records:
                break
            time.sleep(0.05)
        if not descendant_inventory(excluded_pid=controller_pid):
            break
    deadline = time.monotonic() + 2
    while time.monotonic() < deadline:
        records = descendant_inventory(excluded_pid=controller_pid)
        evidence["inventories"].append(records)
        evidence["bounded_rounds"] += 1
        evidence["reaped"].extend(reap_known(records, excluded_pid=controller_pid))
        if not records:
            break
        evidence["detected_ever"] = True
        time.sleep(0.05)
    evidence["residual"] = descendant_inventory(excluded_pid=controller_pid)
    evidence["clear"] = not evidence["residual"]
    return evidence


def block_termination_signals():
    previous = signal.pthread_sigmask(signal.SIG_BLOCK, TERMINATION_SIGNALS)
    current = signal.pthread_sigmask(signal.SIG_BLOCK, set())
    if not TERMINATION_SIGNALS <= current:
        raise Invalid("termination signal latch did not block the full required set")
    return previous, {"previous_mask": sorted(item.name for item in previous),
        "blocked": sorted(item.name for item in TERMINATION_SIGNALS), "verified": True}


def install_termination_latch_handlers():
    previous = {}
    def latch(signum, _frame):
        ASYNC_SIGNAL_LATCH.append({"signal": signal.Signals(signum).name,
                                   "observed_monotonic_ns": time.monotonic_ns()})
    for item in TERMINATION_SIGNALS:
        previous[item] = signal.getsignal(item)
        signal.signal(item, latch)
    return previous


def restore_signal_handlers(previous):
    for item, handler in previous.items():
        signal.signal(item, handler)


def drain_latched_signals():
    observed = []
    while True:
        info = signal.sigtimedwait(TERMINATION_SIGNALS, 0)
        if info is None:
            return observed
        observed.append({"signal": signal.Signals(info.si_signo).name, "pid": info.si_pid,
                         "uid": info.si_uid, "code": info.si_code})


def waitpid_empty():
    reaped = []
    while True:
        try:
            pid, status_value = os.waitpid(-1, os.WNOHANG)
        except ChildProcessError:
            return {"echild": True, "reaped": reaped}
        if pid == 0:
            return {"echild": False, "live_or_unreaped_child": True, "reaped": reaped}
        reaped.append({"pid": pid, "status": status_value})


def clear_residual_group(pgid):
    records = [record for record in proc_table().values() if record["pgid"] == pgid]
    return {"detected": bool(records), "clear": not records, "records": records,
            "signal_method": "NONE__PIDFD_DESCENDANT_CLEANUP_IS_SEPARATE"}


def kill_and_drain_bounded(process, controller_record, controller_pidfd=None):
    record = {"attempted": False, "sigterm": False, "sigkill": False,
              "process_reaped": False, "pipes_forced_closed": False, "residual": None}
    if process is None:
        record["process_reaped"] = True
        return b"", b"", record
    record["attempted"] = True
    controller_signals = []
    if controller_record is not None:
        pidfd_signal([controller_record], signal.SIGSTOP, "SIGSTOP", {"signals": controller_signals})
        pidfd_signal([controller_record], signal.SIGTERM, "SIGTERM", {"signals": controller_signals})
        pidfd_signal([controller_record], signal.SIGCONT, "SIGCONT", {"signals": controller_signals})
        record["sigterm"] = True
    elif controller_pidfd is not None:
        try:
            signal.pidfd_send_signal(controller_pidfd, signal.SIGKILL, None, 0)
            controller_signals.append({"pid": process.pid, "signal": "SIGKILL",
                                       "pidfd_bound": True, "starttime": None})
            record["sigkill"] = True
        except ProcessLookupError:
            pass
    record["controller_pidfd_signals"] = controller_signals
    record["detached_descendant_cleanup"] = cleanup_all_descendants(process.pid, "termination_immediate")
    try:
        stdout, stderr = process.communicate(timeout=10)
    except subprocess.TimeoutExpired as exc:
        if controller_record is not None:
            pidfd_signal([controller_record], signal.SIGKILL, "SIGKILL",
                         {"signals": controller_signals})
            record["sigkill"] = True
        try:
            stdout, stderr = process.communicate(timeout=10)
        except subprocess.TimeoutExpired as second:
            stdout = second.output or b""
            stderr = second.stderr or b""
            for pipe in (process.stdout, process.stderr):
                if pipe is not None:
                    try:
                        pipe.close()
                    except OSError:
                        pass
            record["pipes_forced_closed"] = True
            try:
                process.wait(timeout=2)
            except subprocess.TimeoutExpired:
                pass
    record["process_reaped"] = process.poll() is not None
    residual = clear_residual_group(process.pid)
    record["residual_group"] = residual
    record["residual"] = None if residual["clear"] else "PROCESS_GROUP_NOT_CLEAR"
    return stdout or b"", stderr or b"", record


def communicate_bounded(process, controller_record, controller_pidfd):
    try:
        stdout, stderr = process.communicate(timeout=OUTER_TIMEOUT_SECONDS)
        residual = clear_residual_group(process.pid)
        return stdout, stderr, {"timed_out": False, "interrupted": False,
            "attempted": False, "sigterm": False, "sigkill": False,
            "process_reaped": True, "pipes_forced_closed": False,
            "residual_group": residual, "residual": None if residual["clear"] else "PROCESS_GROUP_NOT_CLEAR"}
    except subprocess.TimeoutExpired:
        stdout, stderr, record = kill_and_drain_bounded(process, controller_record, controller_pidfd)
        record.update({"timed_out": True, "interrupted": False})
        return stdout, stderr, record
    except (KeyboardInterrupt, SystemExit):
        stdout, stderr, record = kill_and_drain_bounded(process, controller_record, controller_pidfd)
        record.update({"timed_out": False, "interrupted": True})
        return stdout, stderr, record


def parse_controller_result(stdout):
    try:
        value = parse_canonical_line(stdout, "controller stdout")
    except Exception as exc:
        return None, f"{type(exc).__name__}:{exc}"
    return value, None


def exact_controller_success(value):
    if not isinstance(value, dict):
        return False
    counts = value.get("counts")
    qualification = value.get("qualification_authority")
    offline = qualification.get("offline_verifier", {}) if isinstance(qualification, dict) else {}
    qcounts = offline.get("counts", {}) if isinstance(offline, dict) else {}
    expected_controller_counts = {"planned_rows": 3, "spawn_requests": 3,
        "cli_launch_attempts": 3, "cli_processes": 3, "activity_captures": 3,
        "emitted_events": 6, "valid_terminal_deliveries": 3,
        "typed_transport_failures": 0, "retry_count": 0, "relaunch_count": 0,
        "replacement_count": 0, "best_of_count": 0}
    expected_qcounts = {"attempts": 3, "captured_spawn_records": 3,
        "captured_raw_results": 3, "completed_rows": 3, "pass_rows": 3,
        "invalid_rows": 0, "ineligible_rows": 0, "missing_rows": 0,
        "subject_fail_rows": 0, "stopped_rows": 0, "controller_aborted_rows": 0,
        "spawn_failure_prefix_count": 0, "terminal_failure_prefix_count": 0,
        "retry_count": 0, "replacement_count": 0, "best_of_count": 0,
        "planned_calls": 3, "invalid_stage_artifacts": 0, "stage_artifacts": 0}
    activity = value.get("observed_activity_totals")
    expected_activity = {"tool_calls": 0, "file_accesses": 0, "browsing": 0,
        "network_accesses": 0, "delegations": 0, "memory_accesses": 0,
        "followup_turns": 0, "nonterminal_messages": [],
        "observation_basis": "ROOT_VISIBLE_COLLABORATION_DELIVERIES"}
    offline_checks = offline.get("checks") if isinstance(offline, dict) else None
    offline_credit = offline.get("credit") if isinstance(offline, dict) else None
    offline_calls = offline.get("calls") if isinstance(offline, dict) else None
    offline_authority = offline.get("authority") if isinstance(offline, dict) else None
    dynamic_qcounts_valid = (isinstance(qcounts, dict) and set(qcounts) == QCOUNT_KEYS
        and all(isinstance(qcounts.get(key), int) and not isinstance(qcounts.get(key), bool)
                and qcounts[key] > 0 for key in ("accounting_bytes", "evidence_runs_scanned",
                                                  "globally_unique_identity_and_nonce_values")))
    runner_process = value.get("runner_process")
    return (set(value) == CONTROLLER_TERMINAL_KEYS
            and value.get("schema_id") == "pw-r9-candidate-v7-cli-controller-terminal-v2"
            and value.get("controller_revision") == "USER_AUTHORIZED_CANDIDATE_V7_CODEX_CLI_CONTROLLER_V2"
            and value.get("transport_revision") == "USER_AUTHORIZED_CANDIDATE_V7_CODEX_CLI_EPHEMERAL_TRANSPORT_V2"
            and value.get("status") == "COMPLETE"
            and value.get("controller_error") is None
            and value.get("run_id") == RUN_ID and value.get("run_kind") == RUN_KIND
            and value.get("evidence_root") == str(EVIDENCE_PARENT)
            and value.get("capture_root") == str(CAPTURE_LEAF)
            and counts == expected_controller_counts
            and activity == expected_activity
            and value.get("activity_observation_complete_rows") == ["row-000", "row-001", "row-002"]
            and value.get("activity_observation_incomplete_rows") == []
            and value.get("component_identity_before") == value.get("component_identity_after")
            and value.get("config_identity_before") == value.get("config_identity_after")
            and value.get("environment_identity_before") == value.get("environment_identity_after")
            and value.get("protected_run_state_before") == value.get("protected_run_state_after")
            and value.get("protected_canary_state_before") == value.get("protected_canary_state_after")
            and value.get("runner_result_is_sole_qualification_authority") is True
            and isinstance(runner_process, dict)
            and set(runner_process) == {"argv", "cwd", "ended_utc", "pid", "returncode",
                "started_utc", "start_new_session", "process_group_id", "group_kill_sent",
                "residual_group", "stdin_closed", "environment_binding"}
            and runner_process.get("returncode") == 0
            and runner_process.get("start_new_session") is True
            and runner_process.get("stdin_closed") is True
            and runner_process.get("group_kill_sent") is False
            and runner_process.get("residual_group") == {"detected": False,
                "kill_sent": False, "clear": True}
            and runner_process.get("environment_binding") == {"PW_R9_EVIDENCE_ROOT": str(EVIDENCE_PARENT)}
            and isinstance(qualification, dict) and set(qualification) == QUALIFICATION_KEYS
            and qualification.get("schema_id") == "pw-r9-reopen-result-v4"
            and qualification.get("status") == "PASS"
            and qualification.get("matrix_status") == "PASS"
            and qualification.get("run_id") == RUN_ID
            and isinstance(qualification.get("run_sha256"), str)
            and len(qualification["run_sha256"]) == 64
            and all(character in "0123456789abcdef" for character in qualification["run_sha256"])
            and isinstance(qualification.get("run_bytes"), int)
            and not isinstance(qualification.get("run_bytes"), bool) and qualification["run_bytes"] > 0
            and isinstance(offline, dict) and set(offline) == OFFLINE_KEYS
            and offline.get("schema_id") == "pw-r9-offline-verifier-report-v4"
            and offline.get("run_id") == RUN_ID and offline.get("run_kind") == RUN_KIND
            and offline.get("matrix_status") == "PASS" and offline.get("valid") is True
            and isinstance(offline_checks, dict) and set(offline_checks) == OFFLINE_CHECK_KEYS
            and all(value is True for value in offline_checks.values())
            and dynamic_qcounts_valid
            and all(qcounts.get(key) == expected for key, expected in expected_qcounts.items())
            and offline_credit == {"controller_invalid_credit": 0,
                "qualification_clean_run_credit": 0, "synthetic_credit": 0}
            and offline_calls == {"collaboration": 0, "model": 0, "network": 0,
                                  "provider": 0, "subject": 0}
            and offline_authority == {"launch": False, "qualification_claim": False,
                                      "recursive": False}
            and offline.get("error") is None
            and isinstance(offline.get("component"), dict)
            and isinstance(offline.get("custody"), dict) and offline["custody"].get("status") == "PASS"
            and isinstance(offline.get("shared_authorities"), list)
            and len(offline["shared_authorities"]) == 3
            and offline.get("residuals") == ["No create-only/fsync history proof.",
                "Unexposed provider activity remains trusted.",
                "Paths locate blobs only; role/hash/bytes establish equivalence."])


def postflight(running, boundary):
    before = count_snapshot()
    git = git_gate()
    launcher = git_identity(str(LAUNCHER.relative_to(WORKSPACE)))
    interpreter = interpreter_identity()
    review = review_gate(launcher, interpreter)
    bound = bound_gate()
    scoped = scoped_drift_gate([launcher["path"], review["identity"]["path"]]
                               + [item[0] for item in BOUND.values()])
    baselines = controller_baselines()
    processes = process_quiescence()
    if any((EVIDENCE_PARENT / run_id).exists() or (EVIDENCE_PARENT / run_id).is_symlink()
           for run_id in ("candidate-v7-matrix-007", "candidate-v7-matrix-008")):
        raise Invalid("Matrix007/008 absence changed during execution")
    exact_directory(EVIDENCE_LEAF)
    exact_directory(CAPTURE_LEAF, 0o700)
    expected_parent_children = sorted(("candidate-v7-cli-canary-001", CAPTURE_LEAF.name,
        START_RECEIPT.name, CONTROLLER_STDOUT.name, CONTROLLER_STDERR.name))
    parent_children = sorted(item.name for item in CAPTURE_PARENT.iterdir())
    if parent_children != expected_parent_children:
        raise Invalid(f"postflight capture-parent child inventory mismatch: {parent_children}")
    for directory_name in ("candidate-v7-cli-canary-001", CAPTURE_LEAF.name):
        info = (CAPTURE_PARENT / directory_name).lstat()
        if not stat.S_ISDIR(info.st_mode) or stat.S_ISLNK(info.st_mode):
            raise Invalid(f"postflight parent directory child type mismatch: {directory_name}")
    for file_name in (START_RECEIPT.name, CONTROLLER_STDOUT.name, CONTROLLER_STDERR.name):
        info = (CAPTURE_PARENT / file_name).lstat()
        if not stat.S_ISREG(info.st_mode) or stat.S_ISLNK(info.st_mode):
            raise Invalid(f"postflight parent file child type mismatch: {file_name}")
    local = count_delta(before)
    expected_local = {"git_readonly_subprocesses": CHECK_EXPECTED_GIT_SUBPROCESSES,
        "local_cli_introspection_processes": 2, "cli_version_processes": 1,
        "cli_help_processes": 1, "controller_popen_attempts": 0}
    if local != expected_local:
        raise Invalid(f"postflight subprocess accounting mismatch: {local}")
    if git != boundary["git"] or launcher != boundary["launcher"] or review != boundary["review"]:
        raise Invalid("HEAD/launcher/review identity changed across controller execution")
    if bound != boundary["bound"] or baselines != boundary["controller_baselines"]:
        raise Invalid("bound lineage or controller baseline changed across execution")
    for key in ("invoked_path", "resolved_path", "bytes", "sha256", "fs_mode", "device", "inode", "mtime_ns"):
        if interpreter[key] != boundary["interpreter"][key]:
            raise Invalid("interpreter identity changed across controller execution")
    if (launcher["sha256"], launcher["bytes"], launcher["mode"]) != (
            running["sha256"], running["bytes"], "100644"):
        raise Invalid("postflight launcher path no longer equals running launcher source")
    return {"status": "PASS", "git": git, "launcher": launcher, "interpreter": interpreter,
            "review": review, "bound": bound, "scoped_tracked_state": scoped,
            "controller_baselines": baselines, "process_quiescence": processes,
            "capture_parent_children": parent_children,
            "local_call_accounting": observed_accounting(local),
            "evidence_tree": tree_identity(EVIDENCE_LEAF), "capture_tree": tree_identity(CAPTURE_LEAF)}


def do_check(running):
    result = preflight(running, "check")
    result["schema_id"] = CHECK_SCHEMA
    result["read_only"] = True
    result["workspace_writes"] = 0
    sys.stdout.buffer.write(canon(result) + b"\n")
    sys.stdout.buffer.flush()
    return 0


def do_execute(running):
    minimal = minimal_execute_gate()
    start = {"schema_id": START_SCHEMA, "started_utc": utc_now(), "run_id": RUN_ID,
             "run_kind": RUN_KIND, "cwd": str(WORKSPACE), "minimal_gate": minimal,
             "running_launcher_source": running,
             "argv_construction": {"interpreter_source": str(pathlib.Path(sys.executable).absolute()),
                "controller_source": str(CONTROLLER), "python_flags": ["-B"],
                "argv_tail": list(ARGV_TAIL), "fd_backed_execution_required": True},
             "environment_delta": {"PYTHONDONTWRITEBYTECODE": "1"},
             "start_new_session": True, "stdin": "DEVNULL", "stdout": "PIPE", "stderr": "PIPE",
             "launcher_local_call_accounting_before_full_preflight": {
                **observed_accounting(count_snapshot()), "workspace_writes": 1,
                "workspace_write_paths": [str(START_RECEIPT)]},
             "authorized_scope_observed": "EXACTLY_ONE_ZERO_CREDIT_CANARY_002_CONTROLLER_INVOCATION_ONLY",
             "authority": "OBSERVATION_ONLY__NO_LAUNCH_QUALIFICATION_READINESS_RELEASE_OR_COMPLETENESS_AUTHORITY"}
    start_write = safe_write_exclusive(START_RECEIPT, canon(start) + b"\n")
    if start_write["status"] != "PASS":
        early = {"schema_id": TERMINAL_SCHEMA, "ended_utc": utc_now(), "run_id": RUN_ID,
            "run_kind": RUN_KIND, "exact_success": False, "start_receipt_write": start_write,
            "launch_error": "START_RECEIPT_EXCLUSIVE_DURABILITY_FAILURE",
            "call_accounting": {**count_snapshot(), "launcher_processes": 1,
                "controller_popen_attempts": 0, "model_calls": None, "provider_calls": None},
            "authority": "OBSERVATION_ONLY__ZERO_QUALIFICATION_READINESS_RELEASE_OR_COMPLETENESS_AUTHORITY"}
        safe_write_exclusive(TERMINAL_RECEIPT, canon(early) + b"\n")
        return 2
    process = None
    execution = None
    stdout = b""
    stderr = b""
    rc = None
    launch_error = None
    interrupted = False
    termination = {"timed_out": False, "interrupted": False, "attempted": False,
        "sigterm": False, "sigkill": False, "process_reaped": False,
        "pipes_forced_closed": False, "residual": None}
    boundary = None
    subreaper = None
    descendant_baseline = None
    invocation_boundary_descendants = None
    final_descendant_cleanup = None
    controller_record = None
    controller_pidfd = None
    previous_signal_mask = None
    signal_latch = None
    previous_signal_handlers = None
    latched_signals = []
    final_waitpid = None
    postflight_descendant_cleanup = None
    postflight_waitpid = None
    env = os.environ.copy()
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    try:
        previous_signal_handlers = install_termination_latch_handlers()
        subreaper = enable_subreaper()
        descendant_baseline = descendant_inventory()
        if descendant_baseline:
            raise Invalid(f"launcher had live children at subreaper baseline: {descendant_baseline}")
        boundary = preflight(running, "boundary")
        previous_signal_mask, signal_latch = block_termination_signals()
        restore_signal_handlers(previous_signal_handlers)
        previous_signal_handlers = None
        if ASYNC_SIGNAL_LATCH:
            raise Invalid(f"termination signal latched before controller spawn: {ASYNC_SIGNAL_LATCH}")
        execution = open_execution_fds(boundary)
        invocation_boundary_descendants = descendant_inventory()
        if invocation_boundary_descendants:
            raise Invalid(f"launcher had live children at invocation boundary: {invocation_boundary_descendants}")
        LOCAL_COUNTS["controller_popen_attempts"] += 1
        process = subprocess.Popen(execution["argv"], executable=execution["executable"],
                                   pass_fds=(execution["interpreter_fd"], execution["controller_fd"]),
                                   preexec_fn=lambda: signal.pthread_sigmask(signal.SIG_SETMASK,
                                                                             previous_signal_mask),
                                   cwd=WORKSPACE, env=env, stdin=subprocess.DEVNULL,
                                   stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                   start_new_session=True)
        controller_pidfd = os.pidfd_open(process.pid, 0)
        controller_record = proc_table().get(process.pid)
        if controller_record is None or controller_record["ppid"] != os.getpid():
            raise Invalid("controller child identity unavailable immediately after Popen")
        os.close(execution["interpreter_fd"])
        os.close(execution["controller_fd"])
        execution["interpreter_fd_closed_in_parent"] = True
        execution["controller_fd_closed_in_parent"] = True
        stdout, stderr, termination = communicate_bounded(process, controller_record, controller_pidfd)
        interrupted = termination["interrupted"]
        if termination["timed_out"]:
            launch_error = f"TimeoutExpired:outer controller timeout {OUTER_TIMEOUT_SECONDS}s"
        if termination["residual"] is not None:
            launch_error = launch_error or f"ResidualProcessGroup:{termination['residual']}"
        rc = process.returncode
    except (KeyboardInterrupt, SystemExit) as exc:
        interrupted = True
        launch_error = f"{type(exc).__name__}:{exc}"
        stdout, stderr, termination = kill_and_drain_bounded(process, controller_record,
                                                             controller_pidfd)
        termination.update({"timed_out": False, "interrupted": True})
        rc = process.returncode if process is not None else None
    except Exception as exc:
        launch_error = f"{type(exc).__name__}:{exc}"
        if process is not None:
            stdout, stderr, termination = kill_and_drain_bounded(process, controller_record,
                                                                 controller_pidfd)
            termination.update({"timed_out": False, "interrupted": False})
            rc = process.returncode
    finally:
        if execution is not None:
            for key in ("interpreter_fd", "controller_fd"):
                try:
                    os.close(execution[key])
                except OSError:
                    pass
        if controller_pidfd is not None:
            try:
                os.close(controller_pidfd)
            except OSError:
                pass
    final_descendant_cleanup = cleanup_all_descendants(process.pid if process is not None else None,
                                                       "terminal_final")
    final_waitpid = waitpid_empty()
    latched_signals = list(ASYNC_SIGNAL_LATCH)
    if signal_latch is not None:
        latched_signals.extend(drain_latched_signals())
    if not final_descendant_cleanup["clear"]:
        launch_error = launch_error or "DESCENDANT_CONTAINMENT_NOT_CLEAR"
    if not final_waitpid["echild"]:
        launch_error = launch_error or "DESCENDANT_WAITPID_NOT_ECHILD"
    if latched_signals:
        launch_error = launch_error or "TERMINATION_SIGNAL_LATCHED"
    stdout_write = safe_write_exclusive(CONTROLLER_STDOUT, stdout)
    stderr_write = safe_write_exclusive(CONTROLLER_STDERR, stderr)
    parsed, parse_error = parse_controller_result(stdout)
    post_error = None
    post = {}
    try:
        if boundary is None:
            raise Invalid("no successful final-boundary preflight")
        post = postflight(running, boundary)
    except (Exception, KeyboardInterrupt, SystemExit) as exc:
        if isinstance(exc, (KeyboardInterrupt, SystemExit)):
            interrupted = True
        post_error = f"{type(exc).__name__}:{exc}"
        post = {"evidence_tree": safe_tree_identity(EVIDENCE_LEAF),
                "capture_tree": safe_tree_identity(CAPTURE_LEAF)}
    postflight_descendant_cleanup = cleanup_all_descendants(
        process.pid if process is not None else None, "postflight_terminal_final")
    postflight_waitpid = waitpid_empty()
    later_latched_signals = drain_latched_signals() if signal_latch is not None else []
    latched_signals.extend(later_latched_signals)
    if not postflight_descendant_cleanup["clear"]:
        post_error = post_error or "DESCENDANT_CONTAINMENT_NOT_CLEAR_AFTER_POSTFLIGHT"
    if not postflight_waitpid["echild"]:
        post_error = post_error or "DESCENDANT_WAITPID_NOT_ECHILD_AFTER_POSTFLIGHT"
    controller_receipt = safe_identity(CAPTURE_LEAF / "terminal_controller_receipt.json")
    receipt_matches = False
    if parsed is not None and controller_receipt.get("present"):
        try:
            receipt_raw, _ = regular_bytes(CAPTURE_LEAF / "terminal_controller_receipt.json")
            receipt_matches = receipt_raw == stdout
        except (Exception, KeyboardInterrupt, SystemExit):
            receipt_matches = False
    exact_success = (launch_error is None and not interrupted and rc == 0
                     and parse_error is None and exact_controller_success(parsed)
                     and receipt_matches and post_error is None
                     and stdout_write["status"] == "PASS" and stderr_write["status"] == "PASS"
                     and termination["process_reaped"] and termination["residual"] is None
                     and final_descendant_cleanup["clear"]
                     and not final_descendant_cleanup["detected_ever"]
                     and not termination.get("detached_descendant_cleanup", {}).get("detected_ever", False)
                     and not termination.get("residual_group", {}).get("detected", False)
                     and final_waitpid["echild"] and not latched_signals
                     and postflight_descendant_cleanup["clear"]
                     and not postflight_descendant_cleanup["detected_ever"]
                     and postflight_waitpid["echild"])
    controller_counts = parsed.get("counts", {}) if isinstance(parsed, dict) else {}
    terminal_accounting = {**count_snapshot(), "launcher_processes": 1,
        "launcher_observed_controller_process_started": process is not None,
        "controller_internal_runner_processes": None, "controller_internal_subject_processes": None,
        "model_calls": None, "provider_calls": None,
        "model_provider_attestation": "NOT_PLATFORM_ATTESTED_BY_LAUNCHER",
        "controller_reported_counts_non_authoritative_to_launcher_accounting": controller_counts,
        "workspace_write_attempts_including_this_terminal_receipt": 4,
        "durable_workspace_writes_before_this_terminal_receipt": 1
            + int(stdout_write["status"] == "PASS") + int(stderr_write["status"] == "PASS"),
        "retry_count": 0, "relaunch_count": 0, "replacement_count": 0, "best_of_count": 0}
    execution_receipt = None if execution is None else {key: value for key, value in execution.items()
                                                        if key not in {"interpreter_fd", "controller_fd"}}
    terminal = {"schema_id": TERMINAL_SCHEMA, "started_receipt": safe_identity(START_RECEIPT),
        "ended_utc": utc_now(), "run_id": RUN_ID, "run_kind": RUN_KIND,
        "execution": execution_receipt,
        "cwd": str(WORKSPACE), "environment_delta": {"PYTHONDONTWRITEBYTECODE": "1"},
        "controller_process_started": process is not None, "controller_pid": process.pid if process else None,
        "controller_returncode": rc, "start_new_session": True, "interrupted": interrupted,
        "bounded_termination": termination, "launch_error": launch_error,
        "descendant_containment": {"subreaper": subreaper, "baseline": descendant_baseline,
            "invocation_boundary": invocation_boundary_descendants,
            "terminal_cleanup": final_descendant_cleanup,
            "signal_latch": signal_latch, "latched_signals": latched_signals,
            "final_waitpid": final_waitpid,
            "postflight_terminal_cleanup": postflight_descendant_cleanup,
            "postflight_waitpid": postflight_waitpid,
            "residual_or_adopted_detected_ever": final_descendant_cleanup["detected_ever"]
                or termination.get("detached_descendant_cleanup", {}).get("detected_ever", False)
                or postflight_descendant_cleanup["detected_ever"],
            "scope_residuals": ["NO_GUARANTEE_UNDER_LAUNCHER_SIGKILL_OR_CRASH",
                "NO_GUARANTEE_FOR_UNINTERRUPTIBLE_D_STATE_TASKS",
                "NO_GUARANTEE_OUTSIDE_THE_VISIBLE_PID_NAMESPACE_OR_READABLE_PROCFS",
                "NO_CONTAINMENT_OF_WORK_EXTERNALIZED_TO_NON_DESCENDANT_SERVICES",
                "NOT_CGROUP_GRADE_CONTAINMENT"]},
        "controller_stdout_write": stdout_write, "controller_stderr_write": stderr_write,
        "controller_stdout": safe_identity(CONTROLLER_STDOUT),
        "controller_stderr": safe_identity(CONTROLLER_STDERR),
        "parsed_controller_result": parsed, "controller_result_parse_error": parse_error,
        "controller_terminal_receipt": controller_receipt,
        "controller_stdout_equals_terminal_receipt": receipt_matches,
        "invocation_boundary_preflight": boundary, "postflight": post, "postflight_error": post_error,
        "call_accounting": terminal_accounting,
        "exact_success": exact_success,
        "authority": "OBSERVATION_ONLY__ZERO_QUALIFICATION_READINESS_RELEASE_OR_COMPLETENESS_AUTHORITY"}
    terminal_write = safe_write_exclusive(TERMINAL_RECEIPT, canon(terminal) + b"\n")
    if terminal_write["status"] != "PASS":
        return 2
    return 0 if exact_success else 2


def parse_args(argv):
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=("check", "execute"))
    return parser.parse_args(argv)


def main(argv=None):
    running = running_source_identity()
    args = parse_args(sys.argv[1:] if argv is None else argv)
    try:
        return do_check(running) if args.command == "check" else do_execute(running)
    except Exception as exc:
        result = {"schema_id": ERROR_SCHEMA, "status": "FAIL_CLOSED", "command": args.command,
                  "error_type": type(exc).__name__, "error": str(exc),
                  "launcher_local_call_accounting": count_snapshot(),
                  "controller_processes": 0 if LOCAL_COUNTS["controller_popen_attempts"] == 0 else None,
                  "runner_processes": 0 if LOCAL_COUNTS["controller_popen_attempts"] == 0 else None,
                  "subject_processes": 0 if LOCAL_COUNTS["controller_popen_attempts"] == 0 else None,
                  "model_calls": 0 if LOCAL_COUNTS["controller_popen_attempts"] == 0 else None,
                  "provider_calls": 0 if LOCAL_COUNTS["controller_popen_attempts"] == 0 else None}
        sys.stdout.buffer.write(canon(result) + b"\n")
        sys.stdout.buffer.flush()
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
