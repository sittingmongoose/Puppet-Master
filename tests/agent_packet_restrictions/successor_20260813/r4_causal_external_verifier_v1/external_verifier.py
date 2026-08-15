#!/usr/bin/env python3
"""Read-only external guard for the R4 causal candidate's self-hosting controls."""
from __future__ import annotations

import hashlib
import json
import os
import re
import stat
import sys
from pathlib import Path, PurePosixPath
from typing import Any

sys.dont_write_bytecode = True

REPO = Path("/mnt/Cursor/PuppetMaster")
CONTRACT_REL = "tests/agent_packet_restrictions/successor_20260813/r4_causal_external_verifier_v1/contract.json"
HEX64 = re.compile(r"[0-9a-f]{64}\Z")

CHECKPOINTS = [
    "immediately_before_every_r4_harness.py_process_invocation_including_preflight_source_render_reservation_receipt_score_transform_S80_wave_and_close_commands",
    "immediately_after_each_harness_process_returns_and_before_accepting_or_apply_patch_storing_its emitted_bytes",
    "immediately_before_every_subject_task_dispatch_or_create_thread",
    "immediately_before_every_wait_threads_or_equivalent_subject_wait",
    "immediately_before_every_read_thread_or_equivalent_subject_output_read",
    "immediately_before_accepting_capturing_scoring_or_storing_any_subject_response_bytes",
]

CONTROLS = [
    {"path": "protocol.json", "storage_sha256": "af75e6a2a6443314888c51d657279c0e2fdaed9d7fc2198146505996698c1de7", "storage_bytes": 117013},
    {"path": "r4_harness.py", "storage_sha256": "5405c4d50ef02372a8873bcc383f6b6b7e85d128a8e033b77a1cd301da5c1050", "storage_bytes": 264187},
    {"path": "schemas.json", "storage_sha256": "466abf2f0079bf989c9d6cc635e821ef9bdb4b8782fce3e321de4e5f5e042d67", "storage_bytes": 16029},
]

FORBIDDEN = [
    "tests/agent_packet_restrictions/successor_20260813/model_retest_r4_causal_v3/runs/cohort/controller_invalid",
    "tests/agent_packet_restrictions/successor_20260813/model_retest_r4_causal_v3/runs/cohort/controller_invalid_observations",
    "tests/agent_packet_restrictions/successor_20260813/model_retest_r4_causal_v3/runs/cohort/controller_invalid_close.json",
]

EXPECTED_CONTRACT: dict[str, Any] = {
    "schema_id": "pw-r4-external-verifier-contract-v1",
    "contract_id": "PW-R4-EXTERNAL-SELF-HOSTING-GUARD-20260814.1",
    "protocol_id": "PW-R4-CAUSAL-20260813.3",
    "repository_root": "/mnt/Cursor/PuppetMaster",
    "candidate_root": "tests/agent_packet_restrictions/successor_20260813/model_retest_r4_causal_v3",
    "launch_manifest_path": "tests/agent_packet_restrictions/successor_20260813/model_retest_r4_causal_v3/launch_manifest.json",
    "detached_custody_path": "tests/agent_packet_restrictions/successor_20260813/r4_causal_v3_launch_custody.json",
    "self_hosting_controls": CONTROLS,
    "checkpoints": CHECKPOINTS,
    "forbidden_counted_evidence_paths": FORBIDDEN,
    "commands": ["preseal-check", "checkpoint --checkpoint <exact-enum>"],
    "result_contract": {
        "pass_rc": 0,
        "abort_or_invalid_rc": 2,
        "control_evidence_abort_status": "ABORTED_EXTERNAL_CONTROL_EVIDENCE_NO_EMPIRICAL_CREDIT",
        "self_hosting_drift_abort_status": "ABORTED_EXTERNAL_SELF_HOSTING_DRIFT_NO_EMPIRICAL_CREDIT",
        "seal_invalid_status": "INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT",
        "verifier_invalid_status": "INVALID_EXTERNAL_VERIFIER_NO_EMPIRICAL_CREDIT",
    },
}


def dump(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


class VerificationError(Exception):
    def __init__(self, status: str, failure_class: str, detail: str,
                 observations: list[dict[str, Any]] | None = None) -> None:
        super().__init__(detail)
        self.status = status
        self.failure_class = failure_class
        self.detail = detail
        self.observations = [] if observations is None else observations


def lexical_path(rel: str) -> Path:
    if (not isinstance(rel, str) or not rel or "\\" in rel or PurePosixPath(rel).is_absolute() or
            PurePosixPath(rel).as_posix() != rel or any(part in ("", ".", "..") for part in PurePosixPath(rel).parts)):
        raise VerificationError("INVALID_EXTERNAL_VERIFIER_NO_EMPIRICAL_CREDIT", "LEXICAL_PATH_INVALID",
                                f"non-normalized repository-relative path: {rel!r}")
    path = Path(os.path.abspath(os.fspath(REPO / rel)))
    if os.path.commonpath((os.fspath(REPO), os.fspath(path))) != os.fspath(REPO):
        raise VerificationError("INVALID_EXTERNAL_VERIFIER_NO_EMPIRICAL_CREDIT", "LEXICAL_PATH_ESCAPE",
                                f"path escapes repository: {rel}")
    return path


def observation(rel: str, read_storage: bool = False) -> tuple[dict[str, Any], bytes | None]:
    path = lexical_path(rel)
    parts = path.relative_to(REPO).parts
    cursor = REPO
    for part in parts[:-1]:
        cursor /= part
        try:
            mode = cursor.lstat().st_mode
        except FileNotFoundError:
            return {"path": rel, "observed_state": "ABSENT", "lstat_mode": None,
                    "storage_sha256": None, "storage_bytes": None, "error_type": None}, None
        except OSError as exc:
            return {"path": rel, "observed_state": "RESOLUTION_ERROR", "lstat_mode": None,
                    "storage_sha256": None, "storage_bytes": None, "error_type": type(exc).__name__}, None
        if stat.S_ISLNK(mode):
            return {"path": rel, "observed_state": "RESOLUTION_ERROR", "lstat_mode": mode,
                    "storage_sha256": None, "storage_bytes": None, "error_type": "SymlinkAncestorError"}, None
        if not stat.S_ISDIR(mode):
            return {"path": rel, "observed_state": "RESOLUTION_ERROR", "lstat_mode": mode,
                    "storage_sha256": None, "storage_bytes": None, "error_type": "NotADirectoryError"}, None
    try:
        before = path.lstat()
    except FileNotFoundError:
        return {"path": rel, "observed_state": "ABSENT", "lstat_mode": None,
                "storage_sha256": None, "storage_bytes": None, "error_type": None}, None
    except OSError as exc:
        return {"path": rel, "observed_state": "RESOLUTION_ERROR", "lstat_mode": None,
                "storage_sha256": None, "storage_bytes": None, "error_type": type(exc).__name__}, None
    if stat.S_ISLNK(before.st_mode):
        state = "SYMLINK"
    elif stat.S_ISREG(before.st_mode):
        state = "REGULAR_NONLINK"
    elif stat.S_ISDIR(before.st_mode):
        state = "DIRECTORY_NONLINK"
    else:
        state = "OTHER"
    row = {"path": rel, "observed_state": state, "lstat_mode": before.st_mode,
           "storage_sha256": None, "storage_bytes": None, "error_type": None}
    if not read_storage or state != "REGULAR_NONLINK":
        return row, None
    flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
    try:
        fd = os.open(path, flags)
        try:
            opened = os.fstat(fd)
            if ((opened.st_dev, opened.st_ino, opened.st_mode) !=
                    (before.st_dev, before.st_ino, before.st_mode)):
                raise OSError("path identity changed before read")
            chunks: list[bytes] = []
            while True:
                chunk = os.read(fd, 1024 * 1024)
                if not chunk:
                    break
                chunks.append(chunk)
        finally:
            os.close(fd)
        after = path.lstat()
        if ((after.st_dev, after.st_ino, after.st_mode, after.st_size, after.st_mtime_ns) !=
                (before.st_dev, before.st_ino, before.st_mode, before.st_size, before.st_mtime_ns)):
            raise OSError("path identity changed during read")
        data = b"".join(chunks)
    except OSError as exc:
        row.update(observed_state="RESOLUTION_ERROR", storage_sha256=None, storage_bytes=None,
                   error_type=type(exc).__name__)
        return row, None
    row["storage_sha256"] = sha256(data)
    row["storage_bytes"] = len(data)
    return row, data


def duplicate_rejecting_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate key: {key}")
        result[key] = value
    return result


def canonical_object(storage: bytes, label: str) -> tuple[bytes, dict[str, Any]]:
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n"):
        raise ValueError(f"{label}: storage is not payload plus exactly one LF")
    payload = storage[:-1]
    try:
        value = json.loads(payload.decode("utf-8"), object_pairs_hook=duplicate_rejecting_object)
    except (UnicodeDecodeError, json.JSONDecodeError, ValueError) as exc:
        raise ValueError(f"{label}: invalid JSON: {exc}") from exc
    if not isinstance(value, dict) or dump(value) != payload:
        raise ValueError(f"{label}: payload is not a canonical minified object")
    return payload, value


def required_regular(rel: str, status: str, failure_class: str) -> tuple[dict[str, Any], bytes]:
    row, storage = observation(rel, read_storage=True)
    if row["observed_state"] != "REGULAR_NONLINK" or storage is None:
        raise VerificationError(status, failure_class, f"required regular nonlink unavailable: {rel}", [row])
    return row, storage


def validate_contract() -> None:
    _, storage = required_regular(CONTRACT_REL, "INVALID_EXTERNAL_VERIFIER_NO_EMPIRICAL_CREDIT",
                                  "CONTRACT_STORAGE_INVALID")
    try:
        _, value = canonical_object(storage, "external verifier contract")
    except ValueError as exc:
        raise VerificationError("INVALID_EXTERNAL_VERIFIER_NO_EMPIRICAL_CREDIT", "CONTRACT_JSON_INVALID",
                                str(exc)) from exc
    if value != EXPECTED_CONTRACT or list(value) != list(EXPECTED_CONTRACT) or storage != dump(EXPECTED_CONTRACT) + b"\n":
        raise VerificationError("INVALID_EXTERNAL_VERIFIER_NO_EMPIRICAL_CREDIT", "CONTRACT_SHAPE_OR_VALUE_DRIFT",
                                "contract bytes do not equal the verifier-hardcoded exact contract")


def check_forbidden() -> list[dict[str, Any]]:
    rows = [observation(rel)[0] for rel in FORBIDDEN]
    present = [row for row in rows if row["observed_state"] != "ABSENT"]
    if present:
        raise VerificationError("ABORTED_EXTERNAL_CONTROL_EVIDENCE_NO_EMPIRICAL_CREDIT",
                                "FORBIDDEN_INTERNAL_CONTROL_EVIDENCE_PRESENT",
                                "closed-world counted rule found controller-invalid evidence or a non-absent path kind",
                                present)
    return rows


def check_controls() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    root = EXPECTED_CONTRACT["candidate_root"]
    for expected in CONTROLS:
        rel = f"{root}/{expected['path']}"
        row, storage = observation(rel, read_storage=True)
        row["expected_storage_sha256"] = expected["storage_sha256"]
        row["expected_storage_bytes"] = expected["storage_bytes"]
        rows.append(row)
        if (row["observed_state"] != "REGULAR_NONLINK" or storage is None or
                (row["storage_sha256"], row["storage_bytes"]) !=
                (expected["storage_sha256"], expected["storage_bytes"])):
            raise VerificationError("ABORTED_EXTERNAL_SELF_HOSTING_DRIFT_NO_EMPIRICAL_CREDIT",
                                    "SELF_HOSTING_CONTROL_DRIFT", f"self-hosting control mismatch: {expected['path']}",
                                    [row])
    return rows


def valid_inventory_path(value: Any) -> bool:
    return (isinstance(value, str) and value and "\\" not in value and not PurePosixPath(value).is_absolute() and
            PurePosixPath(value).as_posix() == value and all(part not in ("", ".", "..") for part in PurePosixPath(value).parts))


def validate_seal() -> dict[str, Any]:
    manifest_rel = EXPECTED_CONTRACT["launch_manifest_path"]
    detached_rel = EXPECTED_CONTRACT["detached_custody_path"]
    manifest_row, manifest_storage = required_regular(
        manifest_rel, "INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "LAUNCH_MANIFEST_INVALID")
    detached_row, detached_storage = required_regular(
        detached_rel, "INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "DETACHED_CUSTODY_INVALID")
    try:
        manifest_payload, manifest = canonical_object(manifest_storage, "launch manifest")
        _, detached = canonical_object(detached_storage, "detached custody")
    except ValueError as exc:
        raise VerificationError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "SEAL_JSON_INVALID",
                                str(exc), [manifest_row, detached_row]) from exc
    manifest_keys = ["schema_id", "protocol_id", "launch_status", "immutable_files", "launch_source_receipt",
                     "configs", "subject_visibility", "external_audit_status"]
    if (list(manifest) != manifest_keys or manifest.get("schema_id") != "pw-r4-launch-manifest-v3" or
            (manifest.get("protocol_id"), manifest.get("launch_status"), manifest.get("subject_visibility"),
             manifest.get("external_audit_status")) !=
            ("PW-R4-CAUSAL-20260813.3", "FROZEN_NOT_LAUNCHED",
             "only_per_call_rendered_packet_plus_one_platform_codex_delegation_wrapper", "excluded")):
        raise VerificationError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "MANIFEST_IDENTITY_INVALID",
                                "launch manifest schema, key order, identity, or literals differ")
    configs = manifest.get("configs")
    expected_configs = [
        {"slot": "slot-alpha", "model": "gpt-5.4-mini", "thinking": "xhigh"},
        {"slot": "slot-bravo", "model": "gpt-5.4-mini", "thinking": "medium"},
        {"slot": "slot-charlie", "model": "gpt-5.6-luna", "thinking": "medium"},
    ]
    if configs != expected_configs or any(list(item) != ["slot", "model", "thinking"] for item in configs):
        raise VerificationError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "MANIFEST_ROUTES_INVALID",
                                "launch manifest route rows differ")
    files = manifest.get("immutable_files")
    if not isinstance(files, list) or len(files) != 40:
        raise VerificationError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "MANIFEST_INVENTORY_INVALID",
                                "launch manifest does not contain exactly 40 immutable rows")
    paths: list[str] = []
    by_path: dict[str, dict[str, Any]] = {}
    for item in files:
        if not isinstance(item, dict) or list(item) != ["path", "storage_bytes", "storage_sha256"]:
            raise VerificationError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "MANIFEST_ROW_SHAPE_INVALID",
                                    "immutable manifest row keys/order differ")
        rel = item.get("path"); size = item.get("storage_bytes"); digest = item.get("storage_sha256")
        if (not valid_inventory_path(rel) or not isinstance(size, int) or isinstance(size, bool) or size < 0 or
                not isinstance(digest, str) or HEX64.fullmatch(digest) is None):
            raise VerificationError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "MANIFEST_ROW_VALUE_INVALID",
                                    "immutable manifest row contains invalid path/hash/bytes")
        paths.append(rel); by_path[rel] = item
    if paths != sorted(paths) or len(paths) != len(set(paths)):
        raise VerificationError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "MANIFEST_INVENTORY_ORDER_INVALID",
                                "immutable manifest paths are not strictly sorted and unique")
    for expected in CONTROLS:
        if by_path.get(expected["path"]) != expected:
            raise VerificationError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "MANIFEST_SELF_HOST_ROW_INVALID",
                                    f"manifest row does not exactly pin {expected['path']}")
    binding = manifest.get("launch_source_receipt")
    binding_keys = ["path", "payload_sha256", "payload_bytes", "storage_sha256", "storage_bytes"]
    launch_item = by_path.get("source_checks/launch.json")
    expected_launch_path = f"{EXPECTED_CONTRACT['candidate_root']}/source_checks/launch.json"
    if (not isinstance(binding, dict) or list(binding) != binding_keys or binding.get("path") != expected_launch_path or
            not isinstance(binding.get("payload_sha256"), str) or HEX64.fullmatch(binding["payload_sha256"]) is None or
            not isinstance(binding.get("payload_bytes"), int) or isinstance(binding.get("payload_bytes"), bool) or
            binding["payload_bytes"] < 0 or launch_item is None or
            (binding.get("storage_sha256"), binding.get("storage_bytes")) !=
            (launch_item.get("storage_sha256"), launch_item.get("storage_bytes"))):
        raise VerificationError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "MANIFEST_LAUNCH_BINDING_INVALID",
                                "manifest nested launch binding is malformed or differs from its inventory row")
    detached_keys = ["schema_id", "protocol_id", "launch_manifest_path", "launch_manifest_payload_sha256",
                     "launch_manifest_payload_bytes", "launch_manifest_storage_sha256", "launch_manifest_storage_bytes",
                     "status", "external_audit_status"]
    expected_detached = {
        "schema_id": "pw-r4-detached-launch-custody-v2",
        "protocol_id": "PW-R4-CAUSAL-20260813.3",
        "launch_manifest_path": "model_retest_r4_causal_v3/launch_manifest.json",
        "launch_manifest_payload_sha256": sha256(manifest_payload),
        "launch_manifest_payload_bytes": len(manifest_payload),
        "launch_manifest_storage_sha256": sha256(manifest_storage),
        "launch_manifest_storage_bytes": len(manifest_storage),
        "status": "SEALED_NOT_LAUNCHED",
        "external_audit_status": "excluded",
    }
    if list(detached) != detached_keys or detached != expected_detached:
        raise VerificationError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "DETACHED_BINDING_INVALID",
                                "detached custody does not exactly bind manifest payload and storage")
    return {
        "launch_manifest_storage_sha256": manifest_row["storage_sha256"],
        "launch_manifest_storage_bytes": manifest_row["storage_bytes"],
        "detached_custody_storage_sha256": detached_row["storage_sha256"],
        "detached_custody_storage_bytes": detached_row["storage_bytes"],
        "immutable_inventory_count": len(files),
        "self_hosting_rows_exact": True,
    }


def parse_command(argv: list[str]) -> tuple[str, str | None]:
    if argv == ["preseal-check"]:
        return "preseal-check", None
    if len(argv) == 3 and argv[0] == "checkpoint" and argv[1] == "--checkpoint" and argv[2] in CHECKPOINTS:
        return "checkpoint", argv[2]
    raise VerificationError("INVALID_EXTERNAL_VERIFIER_NO_EMPIRICAL_CREDIT", "INVOCATION_INVALID",
                            "expected preseal-check or checkpoint --checkpoint <one exact enum>")


def success(command: str, checkpoint: str | None, controls: list[dict[str, Any]],
            forbidden: list[dict[str, Any]], seal: dict[str, Any] | None) -> dict[str, Any]:
    return {
        "schema_id": "pw-r4-external-verifier-result-v1",
        "contract_id": EXPECTED_CONTRACT["contract_id"],
        "command": command,
        "checkpoint": checkpoint,
        "status": "PASS",
        "failure_class": None,
        "empirical_credit": "NOT_GRANTED_BY_THIS_VERIFIER",
        "controls": controls,
        "forbidden_paths": forbidden,
        "seal": seal,
    }


def failure(command: str | None, checkpoint: str | None, exc: VerificationError) -> dict[str, Any]:
    return {
        "schema_id": "pw-r4-external-verifier-result-v1",
        "contract_id": EXPECTED_CONTRACT["contract_id"],
        "command": command,
        "checkpoint": checkpoint,
        "status": exc.status,
        "failure_class": exc.failure_class,
        "detail": exc.detail,
        "empirical_credit": "ZERO",
        "observations": exc.observations,
    }


def main(argv: list[str]) -> int:
    command: str | None = None; checkpoint: str | None = None
    try:
        command, checkpoint = parse_command(argv)
        check_forbidden()
        validate_contract()
        check_forbidden()
        if command == "preseal-check":
            controls = check_controls()
            forbidden = check_forbidden()
            result = success(command, checkpoint, controls, forbidden, None)
        else:
            seal = validate_seal()
            controls = check_controls()
            forbidden = check_forbidden()
            result = success(command, checkpoint, controls, forbidden, seal)
        sys.stdout.buffer.write(dump(result) + b"\n")
        return 0
    except VerificationError as exc:
        sys.stdout.buffer.write(dump(failure(command, checkpoint, exc)) + b"\n")
        return 2
    except Exception as exc:  # Fail closed without a traceback or candidate-derived output.
        wrapped = VerificationError("INVALID_EXTERNAL_VERIFIER_NO_EMPIRICAL_CREDIT", "UNEXPECTED_VERIFIER_ERROR",
                                    type(exc).__name__)
        sys.stdout.buffer.write(dump(failure(command, checkpoint, wrapped)) + b"\n")
        return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
