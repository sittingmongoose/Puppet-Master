#!/usr/bin/env python3
"""Frozen, emit-only controller for PW-R4-CAUSAL-20260813.3.

The harness never creates, edits, or removes a file.  Commands either emit a
canonical JSON result or a READY_FOR_APPLY_PATCH envelope containing the exact
bytes and normalized destination that an external controller may write.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import stat
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
REPO = Path("/mnt/Cursor/PuppetMaster").resolve()
SNAPSHOT_ROOT = REPO / "tests/agent_packet_restrictions/successor_20260813/frozen_plans_snapshot_20260814_v1"
FIXTURE_ROOT = SNAPSHOT_ROOT / "fixture"
PROVENANCE_MANIFEST = SNAPSHOT_ROOT / "provenance_manifest.json"
PROVENANCE_MANIFEST_SHA256 = "56ddf926b4106bee4e774b91b17ed4fab5ca03a7e25154bc467955bb25274c0c"
PROVENANCE_MANIFEST_BYTES = 9327
SNAPSHOT_DESCRIPTOR_SHA256 = "28730f6ea44a5720cb8e473f8fb736353dfe5c412e21261eacc88d70ffe46392"
SNAPSHOT_AGGREGATE_BYTES = 4207711
SNAPSHOT_AGGREGATE_LINES = 82825
RUNS = ROOT / "runs"
SANDBOXES = ROOT / "sandboxes"
ID = "PW-R4-CAUSAL-20260813.3"
PROTOCOL_STORAGE_SHA256 = "50245a54d97791ff890e41fe410315f229f7bb476c5c3e05a83277ce250b66a6"
PROTOCOL_STORAGE_BYTES = 119446
SUBJECT = ("S10A", "S10B", "S30A", "S30B", "S40A", "S40B", "S50", "S60P", "S60C", "S60K", "S70", "S90")
DETERMINISTIC = ("S20A", "S20B", "S45A", "S45B", "S55", "S80")
ALL_CHAIN = ("S10A", "S10B", "S20A", "S20B", "S30A", "S30B", "S40A", "S40B", "S45A", "S45B", "S50", "S55", "S60P", "S60C", "S60K", "S70", "S80")
ORACLE_STORAGE_ORDER = ("S10A", "S10B", "S20A", "S20B", "S30A", "S30B", "S40A", "S40B",
                        "S45A", "S45B", "S50", "S55", "S60C", "S60K", "S60P", "S70", "S80")
RESULT_STAGES = ALL_CHAIN + ("S90",)
WAVE_REGISTRY = (
    ("W10", ("S10A", "S10B")),
    ("W20", ("S20A", "S20B")),
    ("W30", ("S30A", "S30B")),
    ("W40", ("S40A", "S40B")),
    ("W45", ("S45A", "S45B")),
    ("W50", ("S50",)),
    ("W55", ("S55",)),
    ("W60", ("S60P", "S60C", "S60K")),
    ("W70", ("S70",)),
    ("W80", ("S80",)),
    ("W90", ("S90",)),
)
STAGE_WAVE = {stage: wave for wave, stages in WAVE_REGISTRY for stage in stages}
WAVE_KIND = {
    "W10": "SUBJECT", "W20": "DETERMINISTIC", "W30": "SUBJECT", "W40": "SUBJECT",
    "W45": "DETERMINISTIC", "W50": "SUBJECT", "W55": "DETERMINISTIC", "W60": "SUBJECT",
    "W70": "SUBJECT", "W80": "DETERMINISTIC_AND_CONTROLLER_WRITE", "W90": "SUBJECT",
}
HEX64 = re.compile(r"[0-9a-f]{64}\Z")
CAUSAL_EDGES = (
    ("S10A", "S20A"), ("S10B", "S20B"), ("S20A", "S30A"), ("S20B", "S30B"),
    ("S30A", "S40A"), ("S30B", "S40B"), ("S40A", "S45A"), ("S40B", "S45B"),
    ("S45A", "S50"), ("S45B", "S50"), ("S50", "S55"),
    ("S55", "S60P"), ("S55", "S60C"), ("S55", "S60K"),
    ("S60P", "S70"), ("S60C", "S70"), ("S60K", "S70"),
    ("S70", "S80"), ("S80", "S90"),
)
ROUTES = {
    "slot-alpha": ("gpt-5.4-mini", "xhigh"),
    "slot-bravo": ("gpt-5.4-mini", "medium"),
    "slot-charlie": ("gpt-5.6-luna", "medium"),
}
IMMUTABLE_PATHS = (
    "execution_contract.json", "fixture_binding_manifest.json", "integration_contract.json", "oracle_artifacts/S10A.json",
    "oracle_artifacts/S10B.json", "oracle_artifacts/S20A.json", "oracle_artifacts/S20B.json",
    "oracle_artifacts/S30A.json", "oracle_artifacts/S30B.json", "oracle_artifacts/S40A.json",
    "oracle_artifacts/S40B.json", "oracle_artifacts/S45A.json", "oracle_artifacts/S45B.json",
    "oracle_artifacts/S50.json", "oracle_artifacts/S55.json", "oracle_artifacts/S60C.json",
    "oracle_artifacts/S60K.json", "oracle_artifacts/S60P.json", "oracle_artifacts/S70.json",
    "oracle_artifacts/S80.json", "protocol.json", "r4_harness.py", "schemas.json",
    "scorer_key.json", "source_checks/launch.json", "source_custody.json",
    "specialist_packet_template.txt", "templates/S10A.txt", "templates/S10B.txt",
    "templates/S30A.txt", "templates/S30B.txt", "templates/S40A.txt", "templates/S40B.txt",
    "templates/S50.txt", "templates/S60C.txt", "templates/S60K.txt", "templates/S60P.txt",
    "templates/S70.txt", "templates/S90.txt", "topic_a_capsule.json", "topic_b_capsule.json",
)
SELF_HOSTING_IMMUTABLE_PATHS = ("protocol.json", "r4_harness.py", "schemas.json")
INTERNAL_STATIC_INVENTORY_PATHS = tuple(
    rel for rel in IMMUTABLE_PATHS if rel not in SELF_HOSTING_IMMUTABLE_PATHS
)
EXTERNAL_SELF_HOSTING_CHECKPOINTS = (
    "immediately_before_every_r4_harness.py_process_invocation_including_preflight_source_render_reservation_receipt_score_transform_S80_wave_and_close_commands",
    "immediately_after_each_harness_process_returns_and_before_accepting_or_apply_patch_storing_its emitted_bytes",
    "immediately_before_every_subject_task_dispatch_or_create_thread",
    "immediately_before_every_wait_threads_or_equivalent_subject_wait",
    "immediately_before_every_read_thread_or_equivalent_subject_output_read",
    "immediately_before_accepting_capturing_scoring_or_storing_any_subject_response_bytes",
)
TOKEN = re.compile(rb"\{\{([A-Z][A-Z0-9_]*)\}\}")


class Invalid(Exception):
    """Control-plane, custody, filesystem, or harness invalidity."""


class SubjectFail(Exception):
    """A well-custodied subject payload that fails its exact contract."""


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def dump(obj: Any) -> bytes:
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def read(path: Path) -> bytes:
    try:
        return path.read_bytes()
    except OSError as exc:
        raise Invalid(f"cannot read {path}: {exc}") from exc


def duplicate_rejecting_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate key: {key}")
        result[key] = value
    return result


def load_json_bytes(data: bytes, label: str, canonical: bool = False, subject: bool = False) -> Any:
    try:
        obj = json.loads(data.decode("utf-8"), object_pairs_hook=duplicate_rejecting_object)
    except (UnicodeDecodeError, json.JSONDecodeError, ValueError) as exc:
        error = SubjectFail if subject else Invalid
        raise error(f"{label}: invalid UTF-8 JSON: {exc}") from exc
    if not isinstance(obj, dict):
        error = SubjectFail if subject else Invalid
        raise error(f"{label}: top level must be an object")
    if canonical and dump(obj) != data:
        error = SubjectFail if subject else Invalid
        raise error(f"{label}: payload is not canonical minified JSON")
    return obj


def load_control(name: str) -> dict[str, Any]:
    return load_json_bytes(read(ROOT / name), name)


def run_payload(path: Path, label: str) -> bytes:
    """Remove exactly one run-record storage LF; never otherwise normalize."""
    storage = read(path)
    if not storage.endswith(b"\n"):
        raise Invalid(f"{label}: source storage lacks terminal LF")
    return storage[:-1]


def normalized(path: Path, base: Path = REPO) -> str:
    absolute = Path(os.path.abspath(os.fspath(path)))
    try:
        return absolute.relative_to(base).as_posix()
    except ValueError as exc:
        raise Invalid(f"path outside {base}: {absolute}") from exc


def contained_existing(path: Path, boundary: Path) -> Path:
    lexical = Path(os.path.abspath(os.fspath(path)))
    try:
        resolved = lexical.resolve(strict=True)
        root = boundary.resolve(strict=True)
    except OSError as exc:
        raise Invalid(f"cannot resolve contained existing path {lexical}: {exc}") from exc
    if resolved != lexical:
        raise Invalid(f"path is or traverses a link: {lexical}")
    if resolved != root and root not in resolved.parents:
        raise Invalid(f"path escapes {root}: {resolved}")
    return resolved


def existing_ancestors_nonlinks(path: Path, boundary: Path) -> None:
    target = Path(os.path.abspath(os.fspath(path)))
    root = boundary.resolve(strict=True)
    if target != root and root not in target.parents:
        raise Invalid(f"target escapes boundary: {target}")
    cursor = target
    while not cursor.exists() and cursor != root:
        cursor = cursor.parent
    if not cursor.exists():
        raise Invalid(f"no existing ancestor under boundary for {target}")
    while True:
        mode = cursor.lstat().st_mode
        if stat.S_ISLNK(mode):
            raise Invalid(f"symlink ancestor forbidden: {cursor}")
        if cursor == root:
            break
        cursor = cursor.parent


def capture_bytes(path: Path, expected: Path, label: str) -> tuple[bytes, bytes]:
    actual = contained_existing(path, RUNS)
    if actual != Path(os.path.abspath(os.fspath(expected))):
        raise Invalid(f"{label}: normalized capture path mismatch")
    storage = read(actual)
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n"):
        raise Invalid(f"{label}: capture storage must add exactly one LF")
    payload = storage[:-1]
    if payload.endswith((b"\n", b"\r")) or b"\r" in payload:
        raise Invalid(f"{label}: capture payload line ending violation")
    return storage, payload


def capture_storage(path: Path, expected: Path, label: str, subject: bool = False) -> tuple[bytes, bytes, dict[str, Any]]:
    storage, payload = capture_bytes(path, expected, label)
    obj = load_json_bytes(payload, label, canonical=True, subject=subject)
    return storage, payload, obj


def stored_canonical(path: Path, expected: Path, label: str, boundary: Path = RUNS) -> tuple[bytes, bytes, dict[str, Any]]:
    actual = contained_existing(path, boundary)
    if actual != Path(os.path.abspath(os.fspath(expected))):
        raise Invalid(f"{label}: normalized path mismatch")
    storage = read(actual)
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n"):
        raise Invalid(f"{label}: storage must be canonical payload plus one LF")
    payload = storage[:-1]
    obj = load_json_bytes(payload, label, canonical=True)
    return storage, payload, obj


def slot_route(slot: str) -> tuple[str, str]:
    if slot not in ROUTES:
        raise Invalid(f"unapproved slot: {slot}")
    return ROUTES[slot]


def run_path(slot: str, kind: str, stage: str, suffix: str) -> Path:
    slot_route(slot)
    return RUNS / slot / kind / f"{stage}{suffix}"


def capture_path(slot: str, stage: str) -> Path:
    kind = "captures" if stage in SUBJECT else "artifacts"
    return run_path(slot, kind, stage, ".json")


def receipt_path(slot: str, stage: str) -> Path:
    return run_path(slot, "receipts", stage, ".json")


def metadata_path(slot: str, stage: str) -> Path:
    return run_path(slot, "platform", stage, ".json")


def creation_metadata_path(slot: str, stage: str) -> Path:
    return run_path(slot, "platform", stage, ".creation.json")


def reservation_path(slot: str, stage: str) -> Path:
    return run_path(slot, "attempts", stage, ".reservation.json")


def attempt_start_path(slot: str, stage: str) -> Path:
    return run_path(slot, "attempts", stage, ".start.json")


def subject_failure_path(slot: str, stage: str) -> Path:
    if stage not in SUBJECT:
        raise Invalid(f"{stage}: subject failure receipt only applies to subject stages")
    return run_path(slot, "subject_failures", stage, ".json")


def packet_path(slot: str, stage: str) -> Path:
    return run_path(slot, "packets", stage, ".txt")


def s80_controller_paths(slot: str) -> tuple[Path, ...]:
    return tuple(run_path(slot, "controller", name, ".json") for name in
                 ("S80_pre", "S80_global_pre", "S80_apply_patch_trace", "S80_write_receipt", "S80_global_guard"))


def stage_evidence_paths(slot: str, stage: str) -> tuple[Path, ...]:
    paths = [capture_path(slot, stage)]
    if stage in SUBJECT:
        paths.extend((packet_path(slot, stage), reservation_path(slot, stage), creation_metadata_path(slot, stage),
                      attempt_start_path(slot, stage), metadata_path(slot, stage), receipt_path(slot, stage),
                      subject_failure_path(slot, stage)))
    if stage == "S80":
        paths.extend(s80_controller_paths(slot))
    return tuple(paths)


def observed_stage_evidence_files() -> set[Path]:
    observed: set[Path] = set()
    stage_roots = ("packets", "attempts", "platform", "captures", "artifacts", "receipts",
                   "subject_failures", "controller")
    for slot in ROUTES:
        slot_root = RUNS / slot
        if slot_root.is_symlink():
            raise Invalid(f"{slot}: runtime root is a symlink")
        if slot_root.exists():
            root = contained_existing(slot_root, RUNS)
            if not root.is_dir():
                raise Invalid(f"{slot}: runtime root is not a directory")
            allowed_entries = set(stage_roots) | {"result_manifest.json"}
            for entry in root.iterdir():
                if entry.name not in allowed_entries or entry.is_symlink():
                    raise Invalid(f"{slot}: unrecognized or symlink runtime entry: {entry.name}")
                if entry.name == "result_manifest.json" and not entry.is_file():
                    raise Invalid(f"{slot}: result_manifest.json is not a regular file")
                if entry.name in stage_roots and not entry.is_dir():
                    raise Invalid(f"{slot}: stage evidence root is not a directory: {entry.name}")
        for name in stage_roots:
            base = RUNS / slot / name
            if base.is_symlink():
                raise Invalid(f"{slot}: stage evidence root is a symlink: {name}")
            if not base.exists():
                continue
            root = contained_existing(base, RUNS)
            if not root.is_dir():
                raise Invalid(f"{slot}: stage evidence root is not a directory: {name}")
            for path in root.rglob("*"):
                mode = path.lstat().st_mode
                if stat.S_ISDIR(mode):
                    raise Invalid(f"{slot}: unexpected nested stage evidence directory: {path}")
                if stat.S_ISLNK(mode) or not stat.S_ISREG(mode):
                    raise Invalid(f"{slot}: nonregular stage evidence entry: {path}")
                observed.add(path)
    return observed


def exact_completed_stage_evidence(completions: dict[tuple[str, str], dict[str, Any]]) -> set[Path]:
    expected: set[Path] = set()
    for (slot, stage), row in completions.items():
        status = row.get("status")
        if status == "INVALID":
            continue
        if stage in DETERMINISTIC:
            if status != "PASS":
                raise Invalid(f"{slot} {stage}: deterministic normal completion is not PASS")
            expected.add(capture_path(slot, stage))
            if stage == "S80":
                expected.update(s80_controller_paths(slot))
            continue
        expected.update((packet_path(slot, stage), reservation_path(slot, stage), creation_metadata_path(slot, stage)))
        failure_hash = row.get("subject_failure_receipt_sha256")
        if failure_hash is None:
            expected.update((attempt_start_path(slot, stage), metadata_path(slot, stage), capture_path(slot, stage),
                             receipt_path(slot, stage)))
        else:
            _, failure = validate_subject_failure_receipt(slot, stage, require_hex(failure_hash, f"{slot} {stage} failure"))
            expected.add(subject_failure_path(slot, stage))
            if failure.get("failure_kind") != "TASK_CREATION_ERROR":
                expected.update((attempt_start_path(slot, stage), metadata_path(slot, stage)))
    return expected


def validate_exact_normal_stage_evidence(completions: dict[tuple[str, str], dict[str, Any]]) -> None:
    observed = observed_stage_evidence_files()
    expected = exact_completed_stage_evidence(completions)
    if observed != expected:
        extras = sorted(normalized(path) for path in observed - expected)
        missing = sorted(normalized(path) for path in expected - observed)
        raise Invalid(f"normal stage evidence exact-set mismatch; extras={extras}; missing={missing}")


def validate_normal_cohort_structure() -> None:
    if lstat_kind(RUNS)[0] != "DIRECTORY_NONLINK":
        raise Invalid("normal runs root is not a regular nonlink directory")
    top = {entry.name for entry in RUNS.iterdir()}
    if top != {"cohort", *ROUTES} or any(entry.is_symlink() or not entry.is_dir() for entry in RUNS.iterdir()):
        raise Invalid("normal runs top level is not exactly cohort plus the three slot directories")
    cohort = RUNS / "cohort"
    if cohort.is_symlink():
        raise Invalid("normal cohort runtime root is a symlink")
    root = contained_existing(cohort, RUNS)
    allowed = {"waves", "cohort_wave_index.json"}
    for entry in root.iterdir():
        if entry.name not in allowed or entry.is_symlink():
            raise Invalid(f"normal cohort contains unrecognized or symlink entry: {entry.name}")
        if entry.name == "cohort_wave_index.json" and not entry.is_file():
            raise Invalid("normal cohort wave index is not a regular file")
        if entry.name != "cohort_wave_index.json" and not entry.is_dir():
            raise Invalid(f"normal cohort control root is not a directory: {entry.name}")
    if {entry.name for entry in root.iterdir()} != allowed:
        raise Invalid("normal cohort is not exactly waves plus cohort_wave_index.json before close")
    for slot in ROUTES:
        slot_root = RUNS / slot
        for entry in slot_root.iterdir():
            if entry.is_dir() and not any(entry.iterdir()):
                raise Invalid(f"{slot}: empty runtime evidence directory is forbidden: {entry.name}")


def arg_path(args: argparse.Namespace, stage: str, receipt: bool = False) -> Path:
    attr = stage.lower() + ("_receipt" if receipt else "")
    value = getattr(args, attr, None)
    if not value:
        raise Invalid(f"missing --{attr.replace('_', '-')}")
    return Path(value)


def canonical_slot_args(slot: str) -> argparse.Namespace:
    """Build the sole allowed durable artifact route for controller revalidation."""
    slot_route(slot)
    args = argparse.Namespace()
    for stage in RESULT_STAGES:
        setattr(args, stage.lower(), os.fspath(capture_path(slot, stage)))
        if stage in SUBJECT:
            setattr(args, stage.lower() + "_receipt", os.fspath(receipt_path(slot, stage)))
    args.write_receipt = os.fspath(run_path(slot, "controller", "S80_write_receipt", ".json"))
    args.pre_receipt = os.fspath(run_path(slot, "controller", "S80_pre", ".json"))
    args.apply_trace = os.fspath(run_path(slot, "controller", "S80_apply_patch_trace", ".json"))
    return args


def validate_stage_identity(stage: str, obj: dict[str, Any], subject: bool) -> None:
    if obj.get("protocol_id") != ID:
        error = SubjectFail if subject else Invalid
        raise error(f"{stage}: payload protocol mismatch")
    if obj.get("stage") != stage:
        kind = "subject" if subject else "deterministic"
        error = SubjectFail if subject else Invalid
        raise error(f"{stage}: {kind} payload stage mismatch")
    expected_keys = load_control("schemas.json").get("stage_top_level_keys", {}).get(stage)
    if expected_keys is None:
        raise Invalid(f"{stage}: no registered output schema")
    if list(obj) != expected_keys:
        error = SubjectFail if subject else Invalid
        raise error(f"{stage}: top-level key/order mismatch")


def require_exact(payload: bytes, obj: dict[str, Any], expected: dict[str, Any], label: str, subject: bool = True) -> None:
    if payload != dump(expected):
        error = SubjectFail if subject else Invalid
        raise error(f"{label}: payload differs from exact oracle")


def require_object_keys(value: Any, keys: list[str], label: str) -> dict[str, Any]:
    if not isinstance(value, dict) or list(value) != keys:
        raise Invalid(f"{label}: object type/keys/order mismatch")
    return value


def require_exact_control_receipt(obj: dict[str, Any], payload: bytes, expected: dict[str, Any], label: str) -> None:
    if list(obj) != list(expected) or obj != expected or payload != dump(expected):
        raise Invalid(f"{label}: altered, noncanonical, or stale")


def standard_receipt_binding(path: Path, payload: bytes | None = None) -> dict[str, Any]:
    storage = read(path)
    if payload is None:
        if not storage.endswith(b"\n") or storage.endswith(b"\n\n"):
            raise Invalid(f"{path.name}: standard receipt storage must add exactly one LF")
        payload = storage[:-1]
    if storage != payload + b"\n":
        raise Invalid(f"{path.name}: standard receipt payload/storage mismatch")
    return {"path": normalized(path), "payload_sha256": sha(payload), "payload_bytes": len(payload),
            "storage_sha256": sha(storage), "storage_bytes": len(storage)}


def validate_platform_metadata(path: Path, slot: str, stage: str, final_payload: bytes) -> dict[str, Any]:
    expected = metadata_path(slot, stage)
    _, _, meta = stored_canonical(path, expected, f"{stage} platform metadata")
    schema = load_control("schemas.json")["platform_task_metadata"]
    if list(meta) != schema["required_keys"] or meta.get("schema_id") != schema["schema_id"]:
        raise Invalid(f"{stage}: platform metadata schema/key order mismatch")
    request = require_object_keys(meta.get("controller_observed_request"), schema["controller_request_keys"],
                                  f"{stage} controller_observed_request")
    new_task = require_object_keys(meta.get("new_task_tool_result"), schema["new_task_result_keys"],
                                   f"{stage} new_task_tool_result")
    reopened = require_object_keys(meta.get("reopened_thread_observation"), schema["reopened_thread_keys"],
                                   f"{stage} reopened_thread_observation")
    model, thinking = slot_route(slot)
    fixed = (meta.get("protocol_id"), meta.get("slot"), meta.get("stage"),
             request.get("requested_model"), request.get("requested_thinking"))
    if fixed != (ID, slot, stage, model, thinking):
        raise Invalid(f"{stage}: metadata route/protocol/stage mismatch")
    if request.get("projectless") is not True or new_task.get("fresh_task") is not True:
        raise Invalid(f"{stage}: metadata does not record a fresh projectless task")
    for field in ("task_id", "thread_id", "host_id"):
        value = new_task.get(field)
        if not isinstance(value, str) or not value.strip() or len(value) > 256:
            raise Invalid(f"{stage}: invalid platform {field}")
        if reopened.get(field) != value:
            raise Invalid(f"{stage}: reopened thread {field} does not match new-task result")
    if reopened.get("final_output_sha256") != sha(final_payload) or reopened.get("final_output_bytes") != len(final_payload):
        raise Invalid(f"{stage}: platform final-output binding mismatch")
    for field in ("observed_tool_calls", "observed_delegations", "observed_user_input_requests"):
        value = reopened.get(field)
        if not isinstance(value, int) or isinstance(value, bool) or value < 0:
            raise Invalid(f"{stage}: invalid observed activity in {field}")
    return meta


def artifact(args: argparse.Namespace, slot: str, stage: str) -> tuple[bytes, dict[str, Any], dict[str, Any] | None]:
    path = arg_path(args, stage)
    storage, payload = capture_bytes(path, capture_path(slot, stage), stage)
    receipt = None
    if stage in SUBJECT:
        receipt, _ = validate_call_receipt(slot, stage, path, arg_path(args, stage, True), storage, payload)
        cap = receipt["capture"]
        expected = {
            "path": normalized(capture_path(slot, stage)),
            "payload_sha256": sha(payload),
            "payload_bytes": len(payload),
            "storage_sha256": sha(storage),
            "storage_bytes": len(storage),
            "storage_terminal_lf_bytes": 1,
        }
        if cap != expected:
            raise Invalid(f"{stage}: receipt capture binding mismatch")
    obj = load_json_bytes(payload, stage, canonical=True, subject=stage in SUBJECT)
    validate_stage_identity(stage, obj, stage in SUBJECT)
    return payload, obj, receipt


def validate_call_receipt(slot: str, stage: str, cap_path: Path, rec_path: Path, cap_storage: bytes, cap_payload: bytes, reconstruct: bool = True) -> tuple[dict[str, Any], bytes]:
    if subject_failure_path(slot, stage).exists():
        raise Invalid(f"{stage}: ordinary call receipt is mutually exclusive with subject failure receipt")
    if not cap_payload:
        raise Invalid(f"{stage}: zero-byte final output requires the exclusive subject failure receipt path")
    _, payload, rec = stored_canonical(rec_path, receipt_path(slot, stage), f"{stage} receipt")
    schema = load_control("schemas.json")
    if list(rec) != schema["call_receipt"]["required_keys"]:
        raise Invalid(f"{stage}: call receipt keys/order mismatch")
    model, thinking = slot_route(slot)
    fixed = (rec.get("schema_id"), rec.get("protocol_id"), rec.get("slot"), rec.get("stage"), rec.get("model"), rec.get("thinking"))
    if fixed != ("pw-r4-call-receipt-v3.1", ID, slot, stage, model, thinking):
        raise Invalid(f"{stage}: call receipt route/protocol/stage mismatch")
    dispatch_path = wave_event_path(STAGE_WAVE[stage], "dispatch")
    _, dispatch_payload, _ = stored_canonical(dispatch_path, dispatch_path, f"{stage} receipt dispatch")
    start_payload, start, reservation_payload = validate_attempt_start(slot, stage, sha(dispatch_payload))
    binding_keys = ["path", "payload_sha256", "payload_bytes", "storage_sha256", "storage_bytes"]
    reservation_binding = standard_receipt_binding(reservation_path(slot, stage), reservation_payload)
    start_binding = standard_receipt_binding(attempt_start_path(slot, stage), start_payload)
    creation_payload, creation = validate_creation_metadata(creation_metadata_path(slot, stage), slot, stage, True)
    creation_binding = standard_receipt_binding(creation_metadata_path(slot, stage), creation_payload)
    require_object_keys(rec.get("attempt_reservation"), binding_keys, f"{stage} reservation binding")
    require_object_keys(rec.get("attempt_start"), binding_keys, f"{stage} attempt-start binding")
    require_object_keys(rec.get("platform_creation_metadata"), binding_keys, f"{stage} creation metadata binding")
    if (rec.get("attempt_reservation") != reservation_binding or rec.get("attempt_start") != start_binding or
            rec.get("platform_creation_metadata") != creation_binding):
        raise Invalid(f"{stage}: call receipt attempt custody binding mismatch")
    if creation["controller_observed_request"]["rendered_packet_payload_sha256"] != start["rendered_packet_payload_sha256"]:
        raise Invalid(f"{stage}: call receipt creation/packet binding mismatch")
    metadata = validate_platform_metadata(metadata_path(slot, stage), slot, stage, cap_payload)
    new_task = metadata["new_task_tool_result"]
    if (rec.get("task_id"), rec.get("thread_id"), rec.get("host_id")) != (new_task["task_id"], new_task["thread_id"], new_task["host_id"]):
        raise Invalid(f"{stage}: receipt task/host binding mismatch")
    if (start["task_id"], start["thread_id"], start["host_id"]) != (new_task["task_id"], new_task["thread_id"], new_task["host_id"]):
        raise Invalid(f"{stage}: final platform metadata differs from attempt-start")
    metadata_storage = read(metadata_path(slot, stage)); metadata_payload = metadata_storage[:-1]
    metadata_binding = standard_receipt_binding(metadata_path(slot, stage), metadata_payload)
    if rec.get("platform_metadata") != metadata_binding:
        raise Invalid(f"{stage}: platform metadata receipt binding mismatch")
    platform_binding = require_object_keys(rec.get("platform_metadata"),
                                           ["path", "payload_sha256", "payload_bytes", "storage_sha256", "storage_bytes"],
                                           f"{stage} platform_metadata binding")
    rendered_binding = require_object_keys(rec.get("rendered_packet"),
                                           ["path", "payload_sha256", "payload_bytes", "storage_sha256", "storage_bytes"],
                                           f"{stage} rendered_packet binding")
    capture_binding = require_object_keys(rec.get("capture"),
                                          ["path", "payload_sha256", "payload_bytes", "storage_sha256", "storage_bytes", "storage_terminal_lf_bytes"],
                                          f"{stage} capture binding")
    if platform_binding != metadata_binding:
        raise Invalid(f"{stage}: platform metadata receipt binding mismatch")
    if capture_binding.get("path") != normalized(Path(cap_path)):
        raise Invalid(f"{stage}: receipt capture path mismatch")
    expected_packet = packet_path(slot, stage)
    packet_actual = contained_existing(expected_packet, RUNS)
    packet_storage = read(packet_actual)
    if not packet_storage.endswith(b"\n"):
        raise Invalid(f"{stage}: rendered packet storage lacks controller LF")
    packet_payload = packet_storage[:-1]
    packet_meta = {
        "path": normalized(expected_packet),
        "payload_sha256": sha(packet_payload),
        "payload_bytes": len(packet_payload),
        "storage_sha256": sha(packet_storage),
        "storage_bytes": len(packet_storage),
    }
    if rendered_binding != packet_meta:
        raise Invalid(f"{stage}: rendered packet receipt binding mismatch")
    if not isinstance(rec.get("input_bindings"), list):
        raise Invalid(f"{stage}: input_bindings must be a list")
    expected_capture = {"path": normalized(Path(cap_path)), "payload_sha256": sha(cap_payload),
                        "payload_bytes": len(cap_payload), "storage_sha256": sha(cap_storage),
                        "storage_bytes": len(cap_storage), "storage_terminal_lf_bytes": 1}
    if capture_binding != expected_capture:
        raise Invalid(f"{stage}: receipt final-output/capture mismatch")
    if reconstruct:
        for other in SUBJECT:
            if other == stage:
                continue
            sibling = receipt_path(slot, other)
            if not sibling.exists():
                continue
            _, sibling_payload, sibling_obj = stored_canonical(sibling, sibling, f"{other} receipt")
            if sibling_obj.get("protocol_id") != ID or sibling_obj.get("slot") != slot or sibling_obj.get("stage") != other:
                raise Invalid(f"{other}: sibling receipt identity mismatch")
            if sibling_obj.get("task_id") == rec["task_id"] or sibling_payload == payload:
                raise Invalid(f"{stage}: receipt/task replay with {other}")
    # Reconstruct the exact packet now.  This independently verifies both the
    # receipt's predecessor list and its packet hash against current captures.
    if not reconstruct or stage == "S90":
        # Avoid recursion: S90's full-chain validation happens in
        # validated_runtime_chain after all receipt identities are collected.
        pass
    else:
        needed = argparse.Namespace()
        for upstream in ALL_CHAIN:
            setattr(needed, upstream.lower(), os.fspath(capture_path(slot, upstream)))
            if upstream in SUBJECT:
                setattr(needed, upstream.lower() + "_receipt", os.fspath(receipt_path(slot, upstream)))
        needed.write_receipt = os.fspath(run_path(slot, "controller", "S80_write_receipt", ".json"))
        needed.pre_receipt = os.fspath(run_path(slot, "controller", "S80_pre", ".json"))
        needed.apply_trace = os.fspath(run_path(slot, "controller", "S80_apply_patch_trace", ".json"))
        rendered, bindings = render_packet(stage, needed, slot)
        if packet_payload != rendered or rec["input_bindings"] != bindings:
            raise Invalid(f"{stage}: receipt render/input binding reconstruction mismatch")
    return rec, payload


def substitute(original: bytes, values: dict[str, bytes], label: str) -> bytes:
    matches = list(TOKEN.finditer(original))
    names = [m.group(1).decode("ascii") for m in matches]
    if len(names) != len(set(names)):
        raise Invalid(f"{label}: duplicate original placeholder")
    missing = [name for name in names if name not in values]
    if missing:
        raise Invalid(f"{label}: unresolved original placeholders: {missing}")

    def replace(match: re.Match[bytes]) -> bytes:
        return values[match.group(1).decode("ascii")]

    # re.sub scans only `original`; replacement bytes are never rescanned.
    return TOKEN.sub(replace, original)


def base_values() -> tuple[dict[str, bytes], list[dict[str, Any]]]:
    values: dict[str, bytes] = {}
    bindings: list[dict[str, Any]] = []
    for lane in ("A", "B"):
        payload = read(ROOT / f"topic_{lane.lower()}_capsule.json")
        load_json_bytes(payload, f"topic {lane} capsule payload")
        values[f"TOPIC_{lane}_CAPSULE_RAW"] = payload
        values[f"TOPIC_{lane}_CAPSULE_SHA256"] = sha(payload).encode()
        values[f"TOPIC_{lane}_CAPSULE_BYTES"] = str(len(payload)).encode()
        bindings.append({"name": f"TOPIC_{lane}_CAPSULE", "payload_sha256": sha(payload), "payload_bytes": len(payload)})
    integration = read(ROOT / "integration_contract.json")
    values["INTEGRATION_CONTRACT_RAW"] = integration
    return values, bindings


def cap_values(args: argparse.Namespace, slot: str, stage: str) -> tuple[dict[str, bytes], dict[str, Any]]:
    payload, obj, _ = artifact(args, slot, stage)
    return {
        f"{stage}_RAW": payload,
        f"{stage}_SHA256": sha(payload).encode(),
        f"{stage}_BYTES": str(len(payload)).encode(),
    }, obj


def binding(stage: str, payload: bytes) -> dict[str, Any]:
    return {"name": stage, "payload_sha256": sha(payload), "payload_bytes": len(payload)}


def specialist_packet_from_payload(s55: bytes) -> tuple[bytes, list[dict[str, Any]]]:
    vals, bases = base_values()
    vals.update({"S55_RAW": s55, "S55_SHA256": sha(s55).encode(), "S55_BYTES": str(len(s55)).encode()})
    original = run_payload(ROOT / "specialist_packet_template.txt", "specialist template")
    return substitute(original, vals, "specialist template"), bases + [binding("S55", s55)]


def specialist_packet(args: argparse.Namespace, slot: str) -> tuple[bytes, list[dict[str, Any]]]:
    s55, _, _ = artifact(args, slot, "S55")
    return specialist_packet_from_payload(s55)


def render_packet(stage: str, args: argparse.Namespace, slot: str) -> tuple[bytes, list[dict[str, Any]]]:
    if stage not in SUBJECT:
        raise Invalid(f"render stage is not a subject stage: {stage}")
    vals, bases = base_values()
    bindings: list[dict[str, Any]] = []
    deps = {
        "S30A": ("S20A",), "S30B": ("S20B",),
        "S40A": ("S20A", "S30A"), "S40B": ("S20B", "S30B"),
        "S50": ("S45A", "S45B"), "S70": ("S55", "S60P", "S60C", "S60K"),
    }
    if stage == "S10A":
        bindings = [bases[0]]
    elif stage == "S10B":
        bindings = [bases[1]]
    elif stage.startswith("S60"):
        packet, bindings = specialist_packet(args, slot)
        vals.update({
            "SPECIALIST_PACKET_RAW": packet,
            "SPECIALIST_PACKET_SHA256": sha(packet).encode(),
            "SPECIALIST_PACKET_BYTES": str(len(packet)).encode(),
        })
    elif stage == "S90":
        chain, lineage, write_payload, _, pre_payload, trace_payload = validated_runtime_chain(args, slot)
        lineage_payload = dump(lineage)
        vals.update({
            "RUNTIME_LINEAGE_RAW": lineage_payload,
            "RUNTIME_LINEAGE_SHA256": sha(lineage_payload).encode(),
            "COMPLETE_RAW_ARTIFACT_CHAIN": chain,
            "S80_PRE_OBSERVATION_RAW": pre_payload,
            "S80_PRE_OBSERVATION_SHA256": sha(pre_payload).encode(),
            "S80_APPLY_PATCH_TRACE_RAW": trace_payload,
            "S80_APPLY_PATCH_TRACE_SHA256": sha(trace_payload).encode(),
            "WRITE_RECEIPT_RAW": write_payload,
            "WRITE_RECEIPT_SHA256": sha(write_payload).encode(),
        })
        bindings = lineage["artifacts"] + [
            {"name": "S80_PRE", "payload_sha256": lineage["s80_pre_observation_sha256"]},
            {"name": "S80_APPLY_TRACE", "payload_sha256": lineage["s80_apply_patch_trace_sha256"]},
            {"name": "S80_WRITE_RECEIPT", "payload_sha256": sha(write_payload), "payload_bytes": len(write_payload)},
        ]
    else:
        for dep in deps.get(stage, ()):
            dep_payload, _, _ = artifact(args, slot, dep)
            vals.update({f"{dep}_RAW": dep_payload, f"{dep}_SHA256": sha(dep_payload).encode(), f"{dep}_BYTES": str(len(dep_payload)).encode()})
            bindings.append(binding(dep, dep_payload))
    original = read(ROOT / "templates" / f"{stage}.txt")
    return substitute(original, vals, f"{stage} template"), bindings


def key() -> dict[str, Any]:
    obj = load_control("scorer_key.json")
    if obj.get("protocol_id") != ID:
        raise Invalid("scorer key protocol mismatch")
    return obj


def expected_s10(stage: str) -> dict[str, Any]:
    lane = stage[-1]
    topic_key = "topic_" + lane.lower()
    k = key()[topic_key]
    cap_payload = read(ROOT / f"{topic_key}_capsule.json")
    cap = load_json_bytes(cap_payload, f"{topic_key} capsule payload")
    decisions = [{"id": row[0], "choice": row[1], "authority": row[2], "source_record_ids": row[3]} for row in k["decisions"]]
    return {
        "protocol_id": ID, "stage": stage, "topic_id": cap["topic_id"],
        "source_capsule_sha256": sha(cap_payload), "source_capsule_bytes": len(cap_payload),
        "decisions": decisions, "supported_edge_ids": k["supported_edge_ids"],
        "selected_tension_ids": k["selected_tension_ids"], "claim_boundary": "bounded_source_synthesis_only",
        "external_audit_status": "excluded", "forbidden_action_violations": [],
    }


def expected_s20(stage: str, s10_payload: bytes, s10: dict[str, Any]) -> dict[str, Any]:
    lane = stage[-1]
    expected_base = expected_s10("S10" + lane)
    if s10 != expected_base:
        raise SubjectFail(f"S10{lane}: subject output differs from exact oracle")
    fault = key()["topic_faults"][lane]
    idx = fault["index"]
    if not isinstance(idx, int) or isinstance(idx, bool) or idx < 0 or idx >= len(s10["decisions"]):
        raise Invalid(f"{stage}: scorer fault index is out of bounds")
    if s10["decisions"][idx]["id"] != fault["decision_id"] or s10["decisions"][idx]["choice"] != fault["expected_choice"]:
        raise Invalid(f"{stage}: scorer fault decision binding mismatch")
    out = json.loads(json.dumps(s10))
    out["stage"] = stage
    ordered: dict[str, Any] = {}
    for name in ("protocol_id", "stage", "topic_id", "source_capsule_sha256", "source_capsule_bytes"):
        ordered[name] = out[name]
    ordered["base_artifact_sha256"] = sha(s10_payload)
    for name in ("decisions", "supported_edge_ids", "selected_tension_ids", "claim_boundary", "external_audit_status", "forbidden_action_violations"):
        ordered[name] = out[name]
    ordered["decisions"][idx]["choice"] = fault["injected_choice"]
    return ordered


def expected_s30(stage: str, candidate_payload: bytes, candidate: dict[str, Any]) -> dict[str, Any]:
    lane = stage[-1]
    fault = key()["topic_faults"][lane]
    idx = fault["index"]
    expected_ids = [row[0] for row in key()["topic_" + lane.lower()]["decisions"]]
    if candidate["decisions"][idx]["id"] != fault["decision_id"]:
        raise Invalid(f"{stage}: candidate decision identity drift")
    classification = "authority_overclaim" if lane == "A" else "evidence_strength_overclaim"
    finding_id = "F-" + fault["decision_id"]
    return {
        "protocol_id": ID, "stage": stage, "candidate_artifact_sha256": sha(candidate_payload),
        "checked_decision_ids": expected_ids,
        "findings": [{"finding_id": finding_id, "decision_id": fault["decision_id"], "classification": classification,
                      "observed_choice": fault["injected_choice"], "expected_choice": fault["expected_choice"],
                      "source_record_ids": candidate["decisions"][idx]["source_record_ids"]}],
        "clean_control_count": 17, "claim_boundary": "bounded_topic_audit_only",
        "external_audit_status": "excluded", "forbidden_action_violations": [],
    }


def expected_s40(stage: str, candidate_payload: bytes, candidate: dict[str, Any], audit_payload: bytes, audit: dict[str, Any]) -> dict[str, Any]:
    lane = stage[-1]
    expected_audit = expected_s30("S30" + lane, candidate_payload, candidate)
    if audit != expected_audit:
        raise SubjectFail(f"S30{lane}: subject audit differs from exact oracle")
    fault = key()["topic_faults"][lane]
    finding_id = "F-" + fault["decision_id"]
    unchanged = [row[0] for row in key()["topic_" + lane.lower()]["decisions"] if row[0] != fault["decision_id"]]
    return {
        "protocol_id": ID, "stage": stage, "candidate_artifact_sha256": sha(candidate_payload),
        "audit_artifact_sha256": sha(audit_payload), "patch": fault["expected_patch"],
        "addressed_finding_ids": [finding_id], "unchanged_decision_ids": unchanged,
        "claim_boundary": "bounded_repair_proposal_only", "external_audit_status": "excluded",
        "forbidden_action_violations": [],
    }


def exact_patch_apply(candidate: dict[str, Any], patch: list[dict[str, Any]], expected_patch: list[dict[str, Any]], label: str) -> dict[str, Any]:
    if patch != expected_patch or len(patch) != 2:
        raise SubjectFail(f"{label}: patch is not the exact required test/replace or test/remove pair")
    out = json.loads(json.dumps(candidate))
    test, mutate = patch
    match = re.fullmatch(r"/decisions/(0|[1-9][0-9]*)/choice", test.get("path", ""))
    if mutate.get("path") != test.get("path") or not match:
        raise SubjectFail(f"{label}: invalid decision patch paths")
    idx = int(match.group(1))
    if idx < 0 or idx >= len(out.get("decisions", [])):
        raise SubjectFail(f"{label}: decision index out of bounds")
    if test.get("op") != "test" or mutate.get("op") != "replace" or out["decisions"][idx]["choice"] != test.get("value"):
        raise SubjectFail(f"{label}: test-before-replace failed")
    out["decisions"][idx]["choice"] = mutate.get("value")
    return out


def expected_s45(stage: str, cp: bytes, candidate: dict[str, Any], ap: bytes, audit: dict[str, Any], pp: bytes, proposal: dict[str, Any]) -> dict[str, Any]:
    lane = stage[-1]
    expected_proposal = expected_s40("S40" + lane, cp, candidate, ap, audit)
    if proposal != expected_proposal:
        raise SubjectFail(f"S40{lane}: subject repair proposal differs from exact oracle")
    repaired = exact_patch_apply(candidate, proposal["patch"], key()["topic_faults"][lane]["expected_patch"], stage)
    repaired_payload = dump(repaired)
    return {
        "protocol_id": ID, "stage": stage, "candidate_artifact_sha256": sha(cp),
        "audit_artifact_sha256": sha(ap), "patch_artifact_sha256": sha(pp),
        "repaired_payload_sha256": sha(repaired_payload), "repaired_payload_bytes": len(repaired_payload),
        "repaired_payload": repaired, "closed_finding_ids": proposal["addressed_finding_ids"],
        "claim_boundary": "deterministic_topic_patch_application", "external_audit_status": "excluded",
    }


def expected_s50(a_payload: bytes, a: dict[str, Any], b_payload: bytes, b: dict[str, Any]) -> dict[str, Any]:
    if a.get("stage") != "S45A" or b.get("stage") != "S45B":
        raise Invalid("S50: repaired topic envelope stage mismatch")
    k = key()["integration"]
    contract = load_control("integration_contract.json")
    choices = {row[0]: row[1] for row in k["authority_matrix"]}
    authority = [{"id": q["id"], "label": q["label"], "value": choices[q["label"]]} for q in contract["authority_questions"]]
    by_id = {e[0] for e in k["cross_topic_edges"]}
    edges = [e for e in contract["cross_topic_edge_candidates"] if e["id"] in by_id]
    return {
        "protocol_id": ID, "stage": "S50", "topic_artifact_hashes": {"topic_a": sha(a_payload), "topic_b": sha(b_payload)},
        "authority_matrix": authority, "cross_topic_edges": edges,
        "unresolved_tension_ids": a["repaired_payload"]["selected_tension_ids"] + b["repaired_payload"]["selected_tension_ids"],
        "closed_topic_finding_ids": a["closed_finding_ids"] + b["closed_finding_ids"],
        "claim_boundary": "bounded_cross_topic_integration_only", "external_audit_status": "excluded",
        "forbidden_action_violations": [],
    }


def expected_s55(s50_payload: bytes, s50: dict[str, Any]) -> dict[str, Any]:
    out = json.loads(json.dumps(s50))
    out["stage"] = "S55"
    edge = key()["integration"]["injected_edge"]
    out["cross_topic_edges"].append({"id": edge[0], "from": edge[1], "to": edge[2], "type": edge[3], "statement": edge[4]})
    out["source_integration_sha256"] = sha(s50_payload)
    return out


def expected_s60(stage: str, args: argparse.Namespace, slot: str, s55_payload: bytes, s55: dict[str, Any], specialist_payload: bytes | None = None) -> dict[str, Any]:
    code = stage[-1]
    roles = {"P": ("provenance", "provenance_gap"), "C": ("constraint_authority", "authority_conflation"), "K": ("counterfactual_dependency", "counterfactual_failure")}
    role, classification = roles[code]
    packet = specialist_payload if specialist_payload is not None else specialist_packet(args, slot)[0]
    edge_ids = [edge["id"] for edge in s55["cross_topic_edges"]]
    return {
        "protocol_id": ID, "stage": stage, "role": role, "specialist_packet_sha256": sha(packet),
        "integration_candidate_sha256": sha(s55_payload), "checked_edge_ids": edge_ids,
        "findings": [{"finding_id": f"SP-{code}-I-E99", "edge_id": "I-E99", "classification": classification,
                      "verdict": "unsupported", "source_record_ids": ["A-S11", "B-S07"]}],
        "false_positive_edge_ids": [], "claim_boundary": "bounded_specialist_audit_only",
        "external_audit_status": "excluded", "forbidden_action_violations": [],
    }


def expected_s70(s55p: bytes, s55: dict[str, Any], specialists: list[tuple[str, bytes, dict[str, Any]]]) -> dict[str, Any]:
    expected_ids = ["SP-P-I-E99", "SP-C-I-E99", "SP-K-I-E99"]
    dispositions = []
    hashes: dict[str, str] = {}
    names = ("provenance", "constraint_authority", "counterfactual_dependency")
    for pos, (stage, payload, obj) in enumerate(specialists):
        if obj["findings"][0]["finding_id"] != expected_ids[pos]:
            raise SubjectFail(f"{stage}: specialist finding identity mismatch")
        hashes[names[pos]] = sha(payload)
        dispositions.append({"finding_id": expected_ids[pos], "action": "merge_to_edge_repair", "target_edge_id": "I-E99"})
    idx = next((i for i, edge in enumerate(s55["cross_topic_edges"]) if edge.get("id") == "I-E99"), -1)
    if idx < 0:
        raise Invalid("S70: I-E99 absent from deterministic candidate")
    patch = [{"op": "test", "path": f"/cross_topic_edges/{idx}/id", "value": "I-E99"},
             {"op": "remove", "path": f"/cross_topic_edges/{idx}"}]
    return {
        "protocol_id": ID, "stage": "S70", "integration_candidate_sha256": sha(s55p),
        "specialist_artifact_hashes": hashes, "dispositions": dispositions,
        "repair_target_edge_ids": ["I-E99"], "patch": patch,
        "claim_boundary": "bounded_reducer_repair_proposal_only", "external_audit_status": "excluded",
        "forbidden_action_violations": [],
    }


def expected_s80(s50: dict[str, Any], s55_payload: bytes, s55: dict[str, Any], s70_payload: bytes, s70: dict[str, Any]) -> dict[str, Any]:
    edge = key()["integration"]["injected_edge"]
    expected_idx = len(s50["cross_topic_edges"])
    exact = [{"op": "test", "path": f"/cross_topic_edges/{expected_idx}/id", "value": edge[0]},
             {"op": "remove", "path": f"/cross_topic_edges/{expected_idx}"}]
    if s70.get("patch") != exact:
        raise SubjectFail("S70: patch is not the exact bounded test/remove pair")
    if expected_idx < 0 or expected_idx >= len(s55.get("cross_topic_edges", [])):
        raise SubjectFail("S70: edge index out of bounds")
    if s55["cross_topic_edges"][expected_idx]["id"] != edge[0]:
        raise SubjectFail("S70: test-before-remove failed")
    out = json.loads(json.dumps(s55))
    out["cross_topic_edges"].pop(expected_idx)
    out["stage"] = "S80"
    out.pop("source_integration_sha256", None)
    out["source_candidate_sha256"] = sha(s55_payload)
    out["reducer_artifact_sha256"] = sha(s70_payload)
    compare = json.loads(json.dumps(out)); compare["stage"] = "S50"
    compare.pop("source_candidate_sha256"); compare.pop("reducer_artifact_sha256")
    if compare != s50:
        raise Invalid("S80: reducer does not restore actual S50 content")
    return out


def validated_s20(args: argparse.Namespace, slot: str, lane: str) -> tuple[bytes, dict[str, Any]]:
    s10p, s10, _ = artifact(args, slot, "S10" + lane)
    require_exact(s10p, s10, expected_s10("S10" + lane), "S10" + lane)
    s20p, s20, _ = artifact(args, slot, "S20" + lane)
    require_exact(s20p, s20, expected_s20("S20" + lane, s10p, s10), "S20" + lane, subject=False)
    return s20p, s20


def validated_s45(args: argparse.Namespace, slot: str, lane: str) -> tuple[bytes, dict[str, Any]]:
    cp, candidate = validated_s20(args, slot, lane)
    ap, audit, _ = artifact(args, slot, "S30" + lane)
    require_exact(ap, audit, expected_s30("S30" + lane, cp, candidate), "S30" + lane)
    pp, proposal, _ = artifact(args, slot, "S40" + lane)
    require_exact(pp, proposal, expected_s40("S40" + lane, cp, candidate, ap, audit), "S40" + lane)
    s45p, s45, _ = artifact(args, slot, "S45" + lane)
    require_exact(s45p, s45, expected_s45("S45" + lane, cp, candidate, ap, audit, pp, proposal), "S45" + lane, subject=False)
    return s45p, s45


def validated_s55(args: argparse.Namespace, slot: str) -> tuple[bytes, dict[str, Any], bytes, dict[str, Any]]:
    ap, a = validated_s45(args, slot, "A")
    bp, b = validated_s45(args, slot, "B")
    s50p, s50, _ = artifact(args, slot, "S50")
    require_exact(s50p, s50, expected_s50(ap, a, bp, b), "S50")
    s55p, s55, _ = artifact(args, slot, "S55")
    require_exact(s55p, s55, expected_s55(s50p, s50), "S55", subject=False)
    return s50p, s50, s55p, s55


def expected_subject(stage: str, args: argparse.Namespace, slot: str) -> dict[str, Any]:
    if stage.startswith("S10"):
        return expected_s10(stage)
    if stage.startswith("S30"):
        cp, candidate = validated_s20(args, slot, stage[-1])
        return expected_s30(stage, cp, candidate)
    if stage.startswith("S40"):
        lane = stage[-1]
        cp, candidate = validated_s20(args, slot, lane)
        ap, audit, _ = artifact(args, slot, "S30" + lane)
        require_exact(ap, audit, expected_s30("S30" + lane, cp, candidate), "S30" + lane)
        return expected_s40(stage, cp, candidate, ap, audit)
    if stage == "S50":
        ap, a = validated_s45(args, slot, "A"); bp, b = validated_s45(args, slot, "B")
        return expected_s50(ap, a, bp, b)
    if stage.startswith("S60"):
        _, _, p, obj = validated_s55(args, slot)
        return expected_s60(stage, args, slot, p, obj)
    if stage == "S70":
        _, _, s55p, s55 = validated_s55(args, slot)
        specs = []
        for name in ("S60P", "S60C", "S60K"):
            p, o, _ = artifact(args, slot, name)
            exp = expected_s60(name, args, slot, s55p, s55)
            if o != exp:
                raise SubjectFail(f"{name}: subject specialist output differs from exact oracle")
            specs.append((name, p, o))
        return expected_s70(s55p, s55, specs)
    if stage == "S90":
        return dynamic_expected_s90(args, slot)
    raise Invalid(f"no subject oracle for {stage}")


def require_subject(stage: str, args: argparse.Namespace, slot: str) -> tuple[bytes, dict[str, Any]]:
    payload, obj, _ = artifact(args, slot, stage)
    require_exact(payload, obj, expected_subject(stage, args, slot), stage)
    return payload, obj


def transform(stage: str, args: argparse.Namespace, slot: str) -> bytes:
    if stage.startswith("S20"):
        lane = stage[-1]
        s10p, s10 = require_subject("S10" + lane, args, slot)
        out = expected_s20(stage, s10p, s10)
    elif stage.startswith("S45"):
        lane = stage[-1]
        cp, candidate = validated_s20(args, slot, lane)
        ap, audit = require_subject("S30" + lane, args, slot)
        pp, proposal = require_subject("S40" + lane, args, slot)
        out = expected_s45(stage, cp, candidate, ap, audit, pp, proposal)
    elif stage == "S55":
        _, s50 = require_subject("S50", args, slot)
        s50p, _, _ = artifact(args, slot, "S50")
        out = expected_s55(s50p, s50)
    elif stage == "S80":
        _, s50, s55p, s55 = validated_s55(args, slot)
        s70p, s70 = require_subject("S70", args, slot)
        out = expected_s80(s50, s55p, s55, s70p, s70)
    else:
        raise Invalid(f"unknown transform stage: {stage}")
    return dump(out)


def direct_snapshot_binding() -> dict[str, Any]:
    return {
        "provenance_manifest_path": normalized(PROVENANCE_MANIFEST),
        "provenance_manifest_storage_sha256": PROVENANCE_MANIFEST_SHA256,
        "provenance_manifest_storage_bytes": PROVENANCE_MANIFEST_BYTES,
        "aggregate_descriptor_sha256": SNAPSHOT_DESCRIPTOR_SHA256,
        "fixture_root": normalized(FIXTURE_ROOT),
        "fixture_status": "unfinished_throwaway_test_fixture",
    }


def frozen_provenance() -> tuple[dict[str, Any], list[dict[str, Any]], dict[str, bytes]]:
    provenance_path = contained_existing(PROVENANCE_MANIFEST, SNAPSHOT_ROOT)
    storage = read(provenance_path)
    if (sha(storage), len(storage)) != (PROVENANCE_MANIFEST_SHA256, PROVENANCE_MANIFEST_BYTES):
        raise Invalid("frozen provenance manifest storage identity drift")
    manifest = load_json_bytes(storage, "frozen provenance manifest")
    if (manifest.get("schema_id"), manifest.get("status"), manifest.get("fixture_root_relative")) != \
            ("pm.prompt_complexity_frozen_fixture_provenance.v1", "FROZEN_TEST_FIXTURE", "fixture"):
        raise Invalid("frozen provenance manifest identity drift")
    if manifest.get("totals") != {"files": 15, "bytes": SNAPSHOT_AGGREGATE_BYTES, "lines": SNAPSHOT_AGGREGATE_LINES}:
        raise Invalid("frozen provenance totals drift")
    aggregate = manifest.get("aggregate_descriptor")
    if (not isinstance(aggregate, dict) or aggregate.get("descriptor_payload_bytes") != 1778 or
            aggregate.get("sha256") != SNAPSHOT_DESCRIPTOR_SHA256):
        raise Invalid("frozen provenance descriptor declaration drift")
    rows = manifest.get("files")
    if not isinstance(rows, list) or len(rows) != 15:
        raise Invalid("frozen provenance does not contain exactly 15 rows")
    paths = [row.get("original_path") for row in rows if isinstance(row, dict)]
    if len(paths) != 15 or paths != sorted(paths) or len(paths) != len(set(paths)):
        raise Invalid("frozen provenance path order/set drift")
    descriptor_parts: list[bytes] = []
    source_bytes: dict[str, bytes] = {}
    total_bytes = 0; total_lines = 0
    for row in rows:
        rel = row.get("original_path")
        snapshot_rel = row.get("snapshot_relative_path")
        if (not isinstance(rel, str) or Path(rel).is_absolute() or Path(rel).as_posix() != rel or
                any(part in ("", ".", "..") for part in Path(rel).parts) or
                snapshot_rel != f"fixture/{rel}"):
            raise Invalid(f"frozen provenance path invalid: {rel!r}")
        path = contained_existing(FIXTURE_ROOT / rel, FIXTURE_ROOT)
        if path.is_symlink() or not path.is_file():
            raise Invalid(f"frozen source is not a regular nonlink: {rel}")
        data = read(path); digest = sha(data); line_count = len(data.splitlines())
        if (digest, len(data), line_count) != (row.get("sha256"), row.get("bytes"), row.get("lines")):
            raise Invalid(f"frozen source differs from provenance: {rel}")
        descriptor_parts.append(f"{rel}\t{digest}\t{len(data)}\t{line_count}\n".encode("utf-8"))
        source_bytes[rel] = data; total_bytes += len(data); total_lines += line_count
    descriptor = b"".join(descriptor_parts)
    if (len(descriptor), sha(descriptor), total_bytes, total_lines) != \
            (1778, SNAPSHOT_DESCRIPTOR_SHA256, SNAPSHOT_AGGREGATE_BYTES, SNAPSHOT_AGGREGATE_LINES):
        raise Invalid("frozen source aggregate recomputation drift")
    return manifest, rows, source_bytes


def validate_capsule_excerpts(source_bytes: dict[str, bytes], source_rows: dict[str, dict[str, Any]]) -> None:
    common = direct_snapshot_binding()
    for lane, expected_count in (("a", 16), ("b", 20)):
        capsule = load_control(f"topic_{lane}_capsule.json")
        if (capsule.get("snapshot_binding") != common or capsule.get("corpus_total_files") != 15 or
                capsule.get("corpus_total_bytes") != SNAPSHOT_AGGREGATE_BYTES):
            raise Invalid(f"topic {lane} direct frozen snapshot binding drift")
        records = capsule.get("records")
        if not isinstance(records, list) or len(records) != expected_count:
            raise Invalid(f"topic {lane} source-record count drift")
        for record in records:
            if not isinstance(record, dict):
                raise Invalid(f"topic {lane} contains non-object source record")
            rel = record.get("path"); excerpt = record.get("excerpt")
            start = record.get("start_line"); end = record.get("end_line")
            if (rel not in source_rows or not isinstance(excerpt, str) or not isinstance(start, int) or
                    isinstance(start, bool) or not isinstance(end, int) or isinstance(end, bool) or
                    start < 1 or end < start or record.get("source_sha256") != source_rows[rel].get("sha256") or
                    record.get("authority") != source_rows[rel].get("authority")):
                raise Invalid(f"topic {lane} source record metadata drift: {record.get('source_record_id')}")
            try:
                text = source_bytes[rel].decode("utf-8")
            except UnicodeDecodeError as exc:
                raise Invalid(f"frozen source is not UTF-8: {rel}") from exc
            exact_span = "".join(text.splitlines(keepends=True)[start - 1:end])
            if exact_span != excerpt or text.count(excerpt) != 1:
                raise Invalid(f"topic {lane} excerpt span/uniqueness drift: {record.get('source_record_id')}")
    topic_a = load_control("topic_a_capsule.json")
    records_a = {row.get("source_record_id"): row for row in topic_a["records"]}
    if ((records_a["A-S09"]["start_line"], records_a["A-S09"]["end_line"]) != (772, 841) or
            (records_a["A-S11"]["start_line"], records_a["A-S11"]["end_line"]) != (415, 425)):
        raise Invalid("topic A corrected snapshot spans drift")
    a14_items = [row for row in topic_a.get("decision_items", []) if isinstance(row, dict) and row.get("id") == "A14"]
    if (len(a14_items) != 1 or a14_items[0].get("options") !=
            ["auto_and_read_only", "on_and_dispatch_authority", "off_and_read_only"]):
        raise Invalid("topic A A14 frozen snapshot options drift")
    scorer_a14 = [row for row in load_control("scorer_key.json").get("topic_a", {}).get("decisions", [])
                  if isinstance(row, list) and row and row[0] == "A14"]
    if len(scorer_a14) != 1 or scorer_a14[0] != \
            ["A14", "auto_and_read_only", "canonical_live_plan", ["A-S11"]]:
        raise Invalid("scorer A14 frozen snapshot answer drift")
    topic_b = load_control("topic_b_capsule.json")
    records_b = {row.get("source_record_id"): row for row in topic_b["records"]}
    if (records_b["B-S15"]["start_line"], records_b["B-S15"]["end_line"]) != (18, 65):
        raise Invalid("topic B corrected snapshot span drift")


def source_observation(phase: str) -> dict[str, Any]:
    custody_storage = read(ROOT / "source_custody.json")
    protocol = load_control("protocol.json")
    owner = protocol.get("launch_source_gate", {}).get("source_owner_constants", {})
    if (sha(custody_storage), len(custody_storage)) != \
            (owner.get("source_custody_storage_sha256"), owner.get("source_custody_storage_bytes")):
        raise Invalid("source custody storage differs from owner-fixed hash/bytes")
    custody = load_json_bytes(custody_storage, "source_custody.json")
    if (custody.get("schema_id"), custody.get("protocol_id")) != \
            ("pm.hard_causal_snapshot_source_custody.v1", ID):
        raise Invalid("snapshot source custody identity mismatch")
    manifest, provenance_rows, source_bytes = frozen_provenance()
    del manifest
    files = custody.get("corpus_files")
    if not isinstance(files, list) or len(files) != 15:
        raise Invalid("source custody must contain exactly 15 files")
    authority = owner.get("authority_by_path")
    if (not isinstance(authority, list) or
            [[item.get("path"), item.get("authority")] for item in files] != authority or
            custody.get("precedence") != owner.get("precedence_exact") or
            custody.get("source_read_boundary") != owner.get("source_read_boundary_exact") or
            custody.get("write_boundary") != owner.get("write_boundary_exact")):
        raise Invalid("source custody authority/precedence/boundary drift")
    if (owner.get("provenance_manifest_storage_sha256"), owner.get("provenance_manifest_storage_bytes"),
            owner.get("fixture_root_exact"), owner.get("aggregate_descriptor_sha256"),
            owner.get("aggregate_bytes"), owner.get("aggregate_lines")) != \
            (PROVENANCE_MANIFEST_SHA256, PROVENANCE_MANIFEST_BYTES, normalized(FIXTURE_ROOT),
             SNAPSHOT_DESCRIPTOR_SHA256, SNAPSHOT_AGGREGATE_BYTES, SNAPSHOT_AGGREGATE_LINES):
        raise Invalid("protocol frozen snapshot owner constants drift")
    snapshot_binding = custody.get("snapshot_binding")
    if (not isinstance(snapshot_binding, dict) or
            snapshot_binding.get("provenance_manifest_path") != normalized(PROVENANCE_MANIFEST) or
            snapshot_binding.get("provenance_manifest_storage_sha256") != PROVENANCE_MANIFEST_SHA256 or
            snapshot_binding.get("provenance_manifest_storage_bytes") != PROVENANCE_MANIFEST_BYTES or
            snapshot_binding.get("aggregate_descriptor_sha256") != SNAPSHOT_DESCRIPTOR_SHA256 or
            snapshot_binding.get("fixture_root") != normalized(FIXTURE_ROOT) or
            snapshot_binding.get("fixture_status") != "FROZEN_TEST_FIXTURE"):
        raise Invalid("source custody direct snapshot binding drift")
    limits = custody.get("authority_limits")
    if (not isinstance(limits, dict) or any(limits.get(name) is not False for name in
            ("current_plans_authority", "product_authority", "production_authority", "release_authority"))):
        raise Invalid("source custody throwaway authority limits drift")
    expected_rows = []
    for row in provenance_rows:
        expected_rows.append({
            "path": row["original_path"], "snapshot_relative_path": row["snapshot_relative_path"],
            "bytes": row["bytes"], "lines": row["lines"], "sha256": row["sha256"],
            "authority": row["authority"],
        })
    if files != expected_rows or any(list(row) != ["path", "snapshot_relative_path", "bytes", "lines", "sha256", "authority"] for row in files):
        raise Invalid("source custody rows differ from exact frozen provenance rows")
    if custody.get("totals") != {"files": 15, "bytes": SNAPSHOT_AGGREGATE_BYTES, "lines": SNAPSHOT_AGGREGATE_LINES}:
        raise Invalid("source custody totals drift")
    source_rows = {row["path"]: row for row in files}
    validate_capsule_excerpts(source_bytes, source_rows)
    expected_capsules: dict[str, dict[str, Any]] = {}
    for lane, record_count in (("a", 16), ("b", 20)):
        capsule_storage = read(ROOT / f"topic_{lane}_capsule.json")
        expected_capsules[f"topic_{lane}"] = {
            "bytes": len(capsule_storage), "sha256": sha(capsule_storage), "source_records": record_count,
        }
    if custody.get("capsules") != expected_capsules:
        raise Invalid("source custody capsule identities drift")
    common = direct_snapshot_binding()
    if load_control("scorer_key.json").get("snapshot_binding") != common or \
            load_control("integration_contract.json").get("snapshot_binding") != common:
        raise Invalid("scorer/integration direct frozen snapshot binding drift")
    schema = load_control("schemas.json")["source_check_receipt"]
    if (schema.get("expected_files"), schema.get("expected_aggregate_bytes"), schema.get("expected_total_lines"),
            schema.get("expected_descriptor_sha256"), schema.get("provenance_manifest_storage_sha256"),
            schema.get("provenance_manifest_storage_bytes")) != \
            (15, SNAPSHOT_AGGREGATE_BYTES, SNAPSHOT_AGGREGATE_LINES, SNAPSHOT_DESCRIPTOR_SHA256,
             PROVENANCE_MANIFEST_SHA256, PROVENANCE_MANIFEST_BYTES):
        raise Invalid("source receipt schema frozen snapshot constants drift")
    return {
        "schema_id": "pw-r4-source-check-receipt-v3", "protocol_id": ID, "phase": phase,
        "source_custody_sha256": sha(custody_storage), "files_checked": 15,
        "aggregate_bytes": SNAPSHOT_AGGREGATE_BYTES, "descriptor_sha256": SNAPSHOT_DESCRIPTOR_SHA256,
        "normalized_unique_contained": True, "status": "PASS",
    }


def source_check(args: argparse.Namespace) -> bytes:
    result = source_observation(args.phase)
    if args.phase == "close":
        if not args.launch_receipt:
            raise Invalid("close source check requires --launch-receipt")
        expected = ROOT / "source_checks" / "launch.json"
        launch_payload, launch = validate_source_receipt(Path(args.launch_receipt), "launch", expected)
        for field in ("source_custody_sha256", "files_checked", "aggregate_bytes", "descriptor_sha256"):
            if result[field] != launch.get(field):
                raise Invalid(f"close source check differs from launch: {field}")
        result["launch_receipt_sha256"] = sha(launch_payload)
    return dump(result)


def validate_source_receipt(path: Path, phase: str, expected: Path) -> tuple[bytes, dict[str, Any]]:
    _, payload, receipt = stored_canonical(path, expected, f"{phase} source receipt", ROOT)
    expected_observation = source_observation(phase)
    if phase == "launch":
        if list(receipt) != list(expected_observation) or receipt != expected_observation:
            raise Invalid("launch source receipt is not the current exact passing observation")
    else:
        for field in ("schema_id", "protocol_id", "phase", "source_custody_sha256", "files_checked",
                      "aggregate_bytes", "descriptor_sha256", "normalized_unique_contained", "status"):
            if receipt.get(field) != expected_observation.get(field):
                raise Invalid(f"close source receipt mismatch: {field}")
        if list(receipt) != list(expected_observation) + ["launch_receipt_sha256"]:
            raise Invalid("close source receipt keys/order mismatch")
    return payload, receipt


def s80_pre(slot: str) -> bytes:
    slot_route(slot)
    validated_prewrite_s80_artifact(slot)
    target = SANDBOXES / slot / "repaired_integration.json"
    existing_ancestors_nonlinks(target, ROOT)
    if (SANDBOXES / slot).exists() or (SANDBOXES / slot).is_symlink():
        raise Invalid(f"S80 slot prestate is not absent: {slot}")
    if SANDBOXES.exists() or SANDBOXES.is_symlink():
        sandboxes_root = contained_existing(SANDBOXES, ROOT)
        if sandboxes_root.is_symlink() or not sandboxes_root.is_dir():
            raise Invalid("sandboxes root must be a regular nonlink directory")
    for path in (run_path(slot, "controller", "S80_pre", ".json"),
                 run_path(slot, "controller", "S80_global_pre", ".json"),
                 run_path(slot, "controller", "S80_apply_patch_trace", ".json"),
                 run_path(slot, "controller", "S80_write_receipt", ".json"),
                 run_path(slot, "controller", "S80_global_guard", ".json")):
        if path.exists() or path.is_symlink():
            raise Invalid(f"{slot}: S80 pre custody is not pristine at {path.name}")
    return dump({
        "schema_id": "pw-r4-s80-pre-observation-v3.1", "protocol_id": ID, "slot": slot,
        "selected_slot_root": normalized(SANDBOXES / slot), "target_path": normalized(target),
        "selected_slot_root_prestate": "ABSENT", "selected_slot_target_prestate": "ABSENT",
        "selected_slot_tree_prestate": [], "resolved_containment": True, "existing_ancestors_nonlinks": True,
        "controller_global_guard_evidence_excluded": True,
    })


def sandbox_manifest(excluded_slot: str | None = None) -> list[dict[str, Any]]:
    if not SANDBOXES.exists():
        if SANDBOXES.is_symlink():
            raise Invalid("sandboxes root symlink forbidden")
        return []
    root = contained_existing(SANDBOXES, ROOT)
    if root.is_symlink() or not root.is_dir():
        raise Invalid("sandboxes root is not a regular nonlink directory")
    rows: list[dict[str, Any]] = []
    for path in sorted(root.rglob("*"), key=lambda item: item.relative_to(root).as_posix()):
        rel = path.relative_to(root).as_posix()
        if excluded_slot is not None and (rel == excluded_slot or rel.startswith(excluded_slot + "/")):
            continue
        mode = path.lstat().st_mode
        if stat.S_ISLNK(mode):
            raise Invalid(f"sandbox symlink forbidden: {rel}")
        if stat.S_ISDIR(mode):
            kind = "directory"
            data = b""
        elif stat.S_ISREG(mode):
            kind = "regular"
            data = read(path)
        else:
            raise Invalid(f"sandbox nonregular entry forbidden: {rel}")
        rows.append({"path": rel, "kind": kind, "storage_sha256": sha(data), "storage_bytes": len(data)})
    return rows


def validate_final_sandbox_manifest(final_manifest: list[dict[str, Any]], capture_storage_by_slot: dict[str, bytes]) -> None:
    expected_paths = []
    for slot in capture_storage_by_slot:
        slot_route(slot)
        expected_paths.extend([slot, f"{slot}/repaired_integration.json"])
    if [row["path"] for row in final_manifest] != sorted(expected_paths):
        raise Invalid("cohort close final sandbox tree is missing targets or contains unrelated entries")
    by_path = {row["path"]: row for row in final_manifest}
    for slot in capture_storage_by_slot:
        directory = by_path[slot]
        target = by_path[f"{slot}/repaired_integration.json"]
        if directory["kind"] != "directory" or target["kind"] != "regular":
            raise Invalid(f"{slot}: final sandbox entry kind mismatch")
        capture_storage_bytes = capture_storage_by_slot[slot]
        if target["storage_sha256"] != sha(capture_storage_bytes) or target["storage_bytes"] != len(capture_storage_bytes):
            raise Invalid(f"{slot}: final sandbox target differs from validated S80 capture")


def validate_s80_pre_observation(slot: str, require_selected_absent: bool) -> tuple[bytes, dict[str, Any]]:
    path = run_path(slot, "controller", "S80_pre", ".json")
    _, payload, pre = stored_canonical(path, path, f"{slot} S80 pre observation")
    schema = load_control("schemas.json")["s80_pre_observation"]
    target = SANDBOXES / slot / "repaired_integration.json"
    expected = {
        "schema_id": schema["schema_id"], "protocol_id": ID, "slot": slot,
        "selected_slot_root": normalized(SANDBOXES / slot), "target_path": normalized(target),
        "selected_slot_root_prestate": "ABSENT", "selected_slot_target_prestate": "ABSENT",
        "selected_slot_tree_prestate": [], "resolved_containment": True,
        "existing_ancestors_nonlinks": True, "controller_global_guard_evidence_excluded": True,
    }
    require_exact_control_receipt(pre, payload, expected, f"{slot} S80 pre observation")
    if require_selected_absent:
        existing_ancestors_nonlinks(target, ROOT)
        if (SANDBOXES / slot).exists() or (SANDBOXES / slot).is_symlink():
            raise Invalid(f"{slot}: selected S80 slot/target exists after its pre observation")
    return payload, pre


def validated_prewrite_s80_artifact(slot: str) -> bytes:
    path = capture_path(slot, "S80")
    _, payload = capture_bytes(path, path, f"{slot} prewrite S80 artifact")
    expected = transform("S80", canonical_slot_args(slot), slot)
    if payload != expected:
        raise Invalid(f"{slot}: prewrite S80 artifact differs from exact recomputation")
    return payload


def validate_s80_global_pre(slot: str) -> tuple[bytes, dict[str, Any], bytes, bytes]:
    path = run_path(slot, "controller", "S80_global_pre", ".json")
    _, payload, pre = stored_canonical(path, path, f"{slot} S80 global pre")
    schema = load_control("schemas.json")["s80_global_pre_observation"]
    if list(pre) != schema["required_keys"] or pre.get("schema_id") != schema["schema_id"]:
        raise Invalid(f"{slot}: S80 global pre schema/key order mismatch")
    s80_pre_payload, _ = validate_s80_pre_observation(slot, require_selected_absent=False)
    s80_payload = validated_prewrite_s80_artifact(slot)
    dispatch_path = wave_event_path("W80", "dispatch")
    _, dispatch_payload, _ = stored_canonical(dispatch_path, dispatch_path, f"{slot} W80 dispatch for global pre")
    manifest = pre.get("outside_selected_manifest")
    if (not isinstance(manifest, list) or
            any(not isinstance(row, dict) or list(row) != schema["manifest_entry_keys"] for row in manifest)):
        raise Invalid(f"{slot}: S80 global pre manifest shape mismatch")
    expected = {
        "schema_id": schema["schema_id"], "protocol_id": ID, "slot": slot,
        "dispatch_event_sha256": sha(dispatch_payload), "s80_pre_observation_sha256": sha(s80_pre_payload),
        "s80_payload_sha256": sha(s80_payload), "outside_selected_manifest": manifest,
        "outside_selected_descriptor_sha256": sha(dump(manifest)), "status": "PRE_WRITE_GUARD_RECORDED",
    }
    require_exact_control_receipt(pre, payload, expected, f"{slot} S80 global pre")
    return payload, pre, s80_pre_payload, s80_payload


def s80_global_pre(slot: str, dispatch_payload: bytes) -> bytes:
    slot_route(slot)
    target = SANDBOXES / slot / "repaired_integration.json"
    s80_pre_payload, _ = validate_s80_pre_observation(slot, require_selected_absent=True)
    s80_payload = validated_prewrite_s80_artifact(slot)
    for path in (run_path(slot, "controller", "S80_global_pre", ".json"),
                 run_path(slot, "controller", "S80_apply_patch_trace", ".json"),
                 run_path(slot, "controller", "S80_write_receipt", ".json"),
                 run_path(slot, "controller", "S80_global_guard", ".json")):
        if path.exists() or path.is_symlink():
            raise Invalid(f"{slot}: S80 global-pre order violation at {path.name}")
    if target.exists() or target.is_symlink():
        raise Invalid(f"{slot}: S80 global pre requires selected target absent")
    manifest = sandbox_manifest(excluded_slot=slot)
    result = {"schema_id": "pw-r4-s80-global-pre-observation-v2", "protocol_id": ID, "slot": slot,
              "dispatch_event_sha256": sha(dispatch_payload), "s80_pre_observation_sha256": sha(s80_pre_payload),
              "s80_payload_sha256": sha(s80_payload), "outside_selected_manifest": manifest,
              "outside_selected_descriptor_sha256": sha(dump(manifest)), "status": "PRE_WRITE_GUARD_RECORDED"}
    schema = load_control("schemas.json")["s80_global_pre_observation"]
    if list(result) != schema["required_keys"] or any(list(row) != schema["manifest_entry_keys"] for row in manifest):
        raise Invalid("internal S80 global-pre schema/key order drift")
    return dump(result)


def s80_global_post(slot: str, pre_path: Path, dispatch_payload: bytes) -> bytes:
    slot_route(slot)
    expected_path = run_path(slot, "controller", "S80_global_pre", ".json")
    if contained_existing(pre_path, RUNS) != Path(os.path.abspath(os.fspath(expected_path))):
        raise Invalid(f"{slot}: S80 global pre path mismatch")
    pre_payload, pre, s80_pre_payload, s80_payload = validate_s80_global_pre(slot)
    schema = load_control("schemas.json")
    pre_schema = schema["s80_global_pre_observation"]
    if sha(dispatch_payload) != pre.get("dispatch_event_sha256"):
        raise Invalid(f"{slot}: S80 global post current dispatch differs from global pre")
    manifest = pre.get("outside_selected_manifest")
    if not isinstance(manifest, list) or any(not isinstance(row, dict) or list(row) != pre_schema["manifest_entry_keys"] for row in manifest):
        raise Invalid(f"{slot}: S80 global pre manifest shape mismatch")
    if pre.get("protocol_id") != ID or pre.get("slot") != slot or pre.get("outside_selected_descriptor_sha256") != sha(dump(manifest)):
        raise Invalid(f"{slot}: S80 global pre identity/descriptor mismatch")
    guard_path = run_path(slot, "controller", "S80_global_guard", ".json")
    if guard_path.exists() or guard_path.is_symlink():
        raise Invalid(f"{slot}: S80 global post already exists")
    args = canonical_slot_args(slot)
    write_payload, write, receipt_pre_payload, trace_payload = validate_write_receipt(args, slot)
    if receipt_pre_payload != s80_pre_payload:
        raise Invalid(f"{slot}: S80 write receipt pre binding differs from global pre")
    trace_path = run_path(slot, "controller", "S80_apply_patch_trace", ".json")
    _, _, trace = stored_canonical(trace_path, trace_path, f"{slot} S80 apply trace for global post")
    if (write.get("dispatch_event_sha256"), write.get("global_pre_observation_sha256"),
        trace.get("global_pre_observation_sha256")) != (sha(dispatch_payload), sha(pre_payload), sha(pre_payload)):
        raise Invalid(f"{slot}: S80 global post predecessor chain mismatch")
    current = sandbox_manifest(excluded_slot=slot)
    require_outside_selected_unchanged(manifest, current, slot)
    result = {"schema_id": "pw-r4-s80-global-cross-slot-guard-v2", "protocol_id": ID, "slot": slot,
              "dispatch_event_sha256": sha(dispatch_payload), "s80_pre_observation_sha256": sha(s80_pre_payload),
              "global_pre_observation_sha256": sha(pre_payload), "apply_patch_trace_sha256": sha(trace_payload),
              "s80_write_receipt_sha256": sha(write_payload), "s80_payload_sha256": sha(s80_payload),
              "outside_selected_manifest": current,
              "outside_selected_descriptor_sha256": sha(dump(current)), "outside_selected_unchanged": True,
              "status": "PASS"}
    guard_schema = schema["s80_global_guard"]
    if list(result) != guard_schema["required_keys"] or any(list(row) != guard_schema["manifest_entry_keys"] for row in current):
        raise Invalid("internal S80 global guard schema/key order drift")
    return dump(result)


def require_outside_selected_unchanged(pre: list[dict[str, Any]], post: list[dict[str, Any]], slot: str) -> None:
    if post != pre:
        raise Invalid(f"{slot}: outside-selected sandbox mutation detected")


def exact_s80_write_receipt(args: argparse.Namespace, slot: str,
                            require_global_post_absent: bool = False) -> tuple[dict[str, Any], bytes, bytes]:
    slot_route(slot)
    target = SANDBOXES / slot / "repaired_integration.json"
    pre_expected = run_path(slot, "controller", "S80_pre", ".json")
    _, pre_payload, pre = stored_canonical(Path(args.pre_receipt), pre_expected, "S80 pre receipt")
    schema = load_control("schemas.json")
    if list(pre) != schema["s80_pre_observation"]["required_keys"] or pre.get("schema_id") != schema["s80_pre_observation"]["schema_id"]:
        raise Invalid("S80 pre observation schema/key order mismatch")
    expected_pre = {"protocol_id": ID, "slot": slot, "selected_slot_root": normalized(SANDBOXES / slot),
                    "target_path": normalized(target), "selected_slot_root_prestate": "ABSENT",
                    "selected_slot_target_prestate": "ABSENT", "selected_slot_tree_prestate": [],
                    "resolved_containment": True, "existing_ancestors_nonlinks": True,
                    "controller_global_guard_evidence_excluded": True}
    for field, value in expected_pre.items():
        if pre.get(field) != value:
            raise Invalid(f"S80 pre observation mismatch: {field}")
    global_pre_payload, global_pre, historical_pre_payload, _ = validate_s80_global_pre(slot)
    if historical_pre_payload != pre_payload:
        raise Invalid("S80 write receipt and global pre bind different selected pre observations")
    dispatch_path = wave_event_path("W80", "dispatch")
    _, dispatch_payload, _ = stored_canonical(dispatch_path, dispatch_path, f"{slot} W80 dispatch for write receipt")
    if global_pre.get("dispatch_event_sha256") != sha(dispatch_payload):
        raise Invalid("S80 global pre dispatch binding mismatch")
    guard_path = run_path(slot, "controller", "S80_global_guard", ".json")
    if require_global_post_absent and (guard_path.exists() or guard_path.is_symlink()):
        raise Invalid("S80 write receipt must be created before global post")
    existing_ancestors_nonlinks(target, ROOT)
    actual_target = contained_existing(target, SANDBOXES)
    if not actual_target.is_file() or actual_target.is_symlink():
        raise Invalid("S80 target is not a regular nonlink file")
    slot_dir = contained_existing(SANDBOXES / slot, SANDBOXES)
    if slot_dir.is_symlink() or not slot_dir.is_dir():
        raise Invalid("S80 slot is not a regular nonlink directory")
    entries = sorted(slot_dir.iterdir(), key=lambda p: p.name)
    if entries != [actual_target]:
        raise Invalid("S80 slot poststate contains unrelated entries")
    target_storage = read(actual_target)
    if not target_storage.endswith(b"\n") or target_storage.endswith(b"\n\n"):
        raise Invalid("S80 target storage must add exactly one LF")
    target_payload = target_storage[:-1]
    load_json_bytes(target_payload, "S80 target payload", canonical=True)
    s80_storage, s80_payload, s80 = capture_storage(arg_path(args, "S80"), capture_path(slot, "S80"), "S80")
    s50p, s50, s55p, s55 = validated_s55(args, slot)
    s70p, s70 = require_subject("S70", args, slot)
    expected_s80_payload = dump(expected_s80(s50, s55p, s55, s70p, s70))
    require_exact(s80_payload, s80, load_json_bytes(expected_s80_payload, "expected S80"), "S80", subject=False)
    if target_storage != s80_storage or target_payload != expected_s80_payload:
        raise Invalid("S80 target does not equal exact expected S80 payload/storage")
    bindings = {"s50_payload_sha256": sha(s50p), "s55_payload_sha256": sha(s55p),
                "s70_payload_sha256": sha(s70p)}
    trace_expected = run_path(slot, "controller", "S80_apply_patch_trace", ".json")
    _, trace_payload, trace = stored_canonical(Path(args.apply_trace), trace_expected, "S80 apply_patch trace")
    expected_trace = {
        "schema_id": "pw-r4-controller-apply-patch-trace-v2", "protocol_id": ID, "slot": slot,
        "method": "apply_patch", "operation": "add_file", "target_path": normalized(target),
        "dispatch_event_sha256": sha(dispatch_payload), "pre_observation_sha256": sha(pre_payload),
        "global_pre_observation_sha256": sha(global_pre_payload),
        "payload_sha256": sha(target_payload), "payload_bytes": len(target_payload),
        "storage_sha256": sha(target_storage), "storage_bytes": len(target_storage),
        "storage_terminal_lf_bytes": 1, "status": "APPLIED",
    }
    if list(trace) != schema["controller_apply_patch_trace"]["required_keys"] or trace != expected_trace:
        raise Invalid("S80 controller apply_patch trace mismatch")
    result = {
        "schema_id": "pw-r4-s80-write-receipt-v4", "protocol_id": ID, "slot": slot,
        "target_path": normalized(target), "dispatch_event_sha256": sha(dispatch_payload),
        "pre_observation_sha256": sha(pre_payload), "global_pre_observation_sha256": sha(global_pre_payload),
        "apply_patch_trace_sha256": sha(trace_payload), **bindings,
        "s80_payload_sha256": sha(s80_payload), "s80_payload_bytes": len(s80_payload),
        "target_storage_sha256": sha(target_storage), "target_storage_bytes": len(target_storage),
        "target_storage_terminal_lf_bytes": 1,
        "slot_post_entries": [{"path": normalized(actual_target), "kind": "regular", "storage_sha256": sha(target_storage), "storage_bytes": len(target_storage)}],
        "regular_target_diff_count": 1, "unrelated_changes": [],
        "resolved_containment_verified": True, "existing_ancestors_nonlinks_verified": True,
        "target_payload_equals_expected_s80": True, "status": "PASS",
    }
    if list(result) != schema["s80_write_receipt"]["required_keys"]:
        raise Invalid("internal S80 write receipt key/order drift")
    require_object_keys(result["slot_post_entries"][0], schema["s80_write_receipt"]["slot_post_entry_keys"],
                        "internal S80 slot post entry")
    return result, pre_payload, trace_payload


def validate_write_receipt(args: argparse.Namespace, slot: str) -> tuple[bytes, dict[str, Any], bytes, bytes]:
    expected_path = run_path(slot, "controller", "S80_write_receipt", ".json")
    _, payload, obj = stored_canonical(Path(args.write_receipt), expected_path, "S80 write receipt")
    expected, pre_payload, trace_payload = exact_s80_write_receipt(args, slot)
    require_exact_control_receipt(obj, payload, expected, "S80 write receipt against current poststate")
    return payload, obj, pre_payload, trace_payload


def s80_post(args: argparse.Namespace, slot: str) -> bytes:
    result, _, _ = exact_s80_write_receipt(args, slot, require_global_post_absent=True)
    return dump(result)


def snapshot_render(stage: str, by: dict[str, tuple[bytes, dict[str, Any], dict[str, Any] | None]]) -> tuple[bytes, list[dict[str, Any]]]:
    vals, bases = base_values()
    bindings: list[dict[str, Any]] = []
    deps = {"S30A": ("S20A",), "S30B": ("S20B",), "S40A": ("S20A", "S30A"),
            "S40B": ("S20B", "S30B"), "S50": ("S45A", "S45B"),
            "S70": ("S55", "S60P", "S60C", "S60K")}
    if stage == "S10A":
        bindings = [bases[0]]
    elif stage == "S10B":
        bindings = [bases[1]]
    elif stage.startswith("S60"):
        packet, bindings = specialist_packet_from_payload(by["S55"][0])
        vals.update({"SPECIALIST_PACKET_RAW": packet, "SPECIALIST_PACKET_SHA256": sha(packet).encode(),
                     "SPECIALIST_PACKET_BYTES": str(len(packet)).encode()})
    else:
        for dep in deps.get(stage, ()):
            payload = by[dep][0]
            vals.update({f"{dep}_RAW": payload, f"{dep}_SHA256": sha(payload).encode(),
                         f"{dep}_BYTES": str(len(payload)).encode()})
            bindings.append(binding(dep, payload))
    original = read(ROOT / "templates" / f"{stage}.txt")
    return substitute(original, vals, f"{stage} snapshot template"), bindings


def validated_runtime_chain(args: argparse.Namespace, slot: str) -> tuple[bytes, dict[str, Any], bytes, dict[str, tuple[bytes, dict[str, Any], dict[str, Any] | None]], bytes, bytes]:
    slot_route(slot)
    items: list[tuple[str, bytes, dict[str, Any], dict[str, Any] | None, bytes, bytes]] = []
    capture_paths: set[str] = set(); receipt_paths: set[str] = set()
    task_ids: set[str] = set(); thread_ids: set[str] = set()
    for stage in ALL_CHAIN:
        cap_arg = arg_path(args, stage)
        storage, payload = capture_bytes(cap_arg, capture_path(slot, stage), stage)
        rec = None
        if stage in SUBJECT:
            rec, rec_payload = validate_call_receipt(slot, stage, cap_arg, arg_path(args, stage, True), storage, payload, reconstruct=False)
        else:
            rec_payload = b""
        obj = load_json_bytes(payload, stage, canonical=True, subject=stage in SUBJECT)
        validate_stage_identity(stage, obj, stage in SUBJECT)
        path_norm = normalized(capture_path(slot, stage))
        if path_norm in capture_paths:
            raise Invalid(f"capture replay: {path_norm}")
        capture_paths.add(path_norm)
        if rec:
            rp = normalized(receipt_path(slot, stage))
            if rp in receipt_paths or rec["task_id"] in task_ids or rec["thread_id"] in thread_ids:
                raise Invalid(f"receipt/task/thread replay at {stage}")
            receipt_paths.add(rp); task_ids.add(rec["task_id"]); thread_ids.add(rec["thread_id"])
        items.append((stage, payload, obj, rec, storage, rec_payload))
    if len(receipt_paths) != 11:
        raise Invalid("S90 render requires exactly the eleven upstream subject receipts once")
    by = {stage: (payload, obj, rec) for stage, payload, obj, rec, _, _ in items}
    for stage in SUBJECT[:-1]:
        expected_packet, expected_bindings = snapshot_render(stage, by)
        stored_packet = read(packet_path(slot, stage))
        if not stored_packet.endswith(b"\n") or stored_packet[:-1] != expected_packet:
            raise Invalid(f"{stage}: packet drift against once-loaded predecessor snapshot")
        if by[stage][2] is None or by[stage][2].get("input_bindings") != expected_bindings:
            raise Invalid(f"{stage}: receipt input bindings drift against predecessor snapshot")
    for stage in ("S10A", "S10B"):
        require_exact(by[stage][0], by[stage][1], expected_s10(stage), stage)
    for lane in ("A", "B"):
        require_exact(by["S20"+lane][0], by["S20"+lane][1], expected_s20("S20"+lane, by["S10"+lane][0], by["S10"+lane][1]), "S20"+lane, subject=False)
        require_exact(by["S30"+lane][0], by["S30"+lane][1], expected_s30("S30"+lane, by["S20"+lane][0], by["S20"+lane][1]), "S30"+lane)
        require_exact(by["S40"+lane][0], by["S40"+lane][1], expected_s40("S40"+lane, by["S20"+lane][0], by["S20"+lane][1], by["S30"+lane][0], by["S30"+lane][1]), "S40"+lane)
        e45 = expected_s45("S45"+lane, by["S20"+lane][0], by["S20"+lane][1], by["S30"+lane][0], by["S30"+lane][1], by["S40"+lane][0], by["S40"+lane][1])
        require_exact(by["S45"+lane][0], by["S45"+lane][1], e45, "S45"+lane, subject=False)
    require_exact(by["S50"][0], by["S50"][1], expected_s50(by["S45A"][0], by["S45A"][1], by["S45B"][0], by["S45B"][1]), "S50")
    require_exact(by["S55"][0], by["S55"][1], expected_s55(by["S50"][0], by["S50"][1]), "S55", subject=False)
    specs = []
    specialist_payload = specialist_packet_from_payload(by["S55"][0])[0]
    for stage in ("S60P", "S60C", "S60K"):
        require_exact(by[stage][0], by[stage][1], expected_s60(stage, args, slot, by["S55"][0], by["S55"][1], specialist_payload), stage)
        specs.append((stage, by[stage][0], by[stage][1]))
    require_exact(by["S70"][0], by["S70"][1], expected_s70(by["S55"][0], by["S55"][1], specs), "S70")
    require_exact(by["S80"][0], by["S80"][1], expected_s80(by["S50"][1], by["S55"][0], by["S55"][1], by["S70"][0], by["S70"][1]), "S80", subject=False)
    write_payload, _, pre_payload, trace_payload = validate_write_receipt(args, slot)
    artifacts = []
    blocks = []
    for stage, payload, _, rec, storage, rec_payload in items:
        entry: dict[str, Any] = {"name": stage, "payload_sha256": sha(payload), "payload_bytes": len(payload),
                                 "storage_sha256": sha(storage), "storage_bytes": len(storage)}
        if rec is not None:
            entry["call_receipt_sha256"] = sha(rec_payload)
        artifacts.append(entry)
        blocks.append(b"ARTIFACT=" + stage.encode() + b" PAYLOAD_SHA256=" + sha(payload).encode() + b" PAYLOAD_BYTES=" + str(len(payload)).encode() +
                      b" STORAGE_SHA256=" + sha(storage).encode() + b" STORAGE_BYTES=" + str(len(storage)).encode() +
                      b"\nBEGIN_" + stage.encode() + b"_RAW\n" + payload + b"\nEND_" + stage.encode() + b"_RAW")
    blocks.append(b"ARTIFACT=S80_PRE PAYLOAD_SHA256=" + sha(pre_payload).encode() + b" PAYLOAD_BYTES=" + str(len(pre_payload)).encode() +
                  b"\nBEGIN_S80_PRE_RAW\n" + pre_payload + b"\nEND_S80_PRE_RAW")
    blocks.append(b"ARTIFACT=S80_APPLY_TRACE PAYLOAD_SHA256=" + sha(trace_payload).encode() + b" PAYLOAD_BYTES=" + str(len(trace_payload)).encode() +
                  b"\nBEGIN_S80_APPLY_TRACE_RAW\n" + trace_payload + b"\nEND_S80_APPLY_TRACE_RAW")
    edges = [list(edge) for edge in CAUSAL_EDGES]
    lineage = {"protocol_id": ID, "slot": slot, "artifacts": artifacts,
               "s80_pre_observation_sha256": sha(pre_payload), "s80_apply_patch_trace_sha256": sha(trace_payload),
               "write_receipt_sha256": sha(write_payload), "edges": edges}
    return b"\n".join(blocks), lineage, write_payload, by, pre_payload, trace_payload


def expected_s90_from_snapshot(lineage: dict[str, Any], write_payload: bytes,
                               by: dict[str, tuple[bytes, dict[str, Any], dict[str, Any] | None]]) -> dict[str, Any]:
    s80_payload, s80, _ = by["S80"]
    _, s60p, _ = by["S60P"]; _, s60c, _ = by["S60C"]; _, s60k, _ = by["S60K"]
    retained = [edge["id"] for edge in s80["cross_topic_edges"]]
    closed_specialist = [s60p["findings"][0]["finding_id"], s60c["findings"][0]["finding_id"], s60k["findings"][0]["finding_id"]]
    return {
        "protocol_id": ID, "stage": "S90", "runtime_lineage_sha256": sha(dump(lineage)),
        "final_artifact_sha256": sha(s80_payload), "write_receipt_sha256": sha(write_payload),
        "hash_chain_valid": True, "topic_decision_count": 36,
        "closed_topic_finding_ids": s80["closed_topic_finding_ids"],
        "closed_specialist_finding_ids": closed_specialist, "unsupported_edge_absent": "I-E99" not in retained,
        "retained_supported_edge_ids": retained, "write_containment_verified": True,
        "terminal": "bounded_causal_simulation_pass", "external_audit_status": "excluded",
        "nonclaims": ["full_corpus_completeness", "production_runtime_enforcement", "buildability", "release_readiness", "safety_certification", "permission_to_compile_plans", "external_audit"],
        "forbidden_action_violations": [],
    }


def dynamic_expected_s90(args: argparse.Namespace, slot: str) -> dict[str, Any]:
    _, lineage, write_payload, by, _, _ = validated_runtime_chain(args, slot)
    return expected_s90_from_snapshot(lineage, write_payload, by)


def make_call_receipt(args: argparse.Namespace, slot: str) -> bytes:
    stage = args.stage
    if receipt_path(slot, stage).exists() or receipt_path(slot, stage).is_symlink():
        raise Invalid(f"{stage}: call receipt already exists")
    if subject_failure_path(slot, stage).exists():
        raise Invalid(f"{stage}: subject failure receipt already exists")
    model, thinking = slot_route(slot)
    rendered, bindings = render_packet(stage, args, slot)
    expected_packet = packet_path(slot, stage)
    packet_actual = contained_existing(Path(args.rendered_packet), RUNS)
    if packet_actual != Path(os.path.abspath(os.fspath(expected_packet))):
        raise Invalid("rendered packet normalized path mismatch")
    packet_storage = read(packet_actual)
    if not packet_storage.endswith(b"\n") or packet_storage[:-1] != rendered:
        raise Invalid("stored rendered packet does not equal exact render payload plus controller LF")
    cap_storage, cap_payload = capture_bytes(Path(args.capture), capture_path(slot, stage), stage)
    if not cap_payload:
        raise Invalid(f"{stage}: zero-byte final output requires the exclusive subject failure receipt path")
    dispatch_payload = validate_current_dispatch(Path(args.wave_dispatch_receipt), slot, stage, args._launch_sha)
    start_payload, start, reservation_payload = validate_attempt_start(slot, stage, sha(dispatch_payload))
    creation_payload, creation = validate_creation_metadata(creation_metadata_path(slot, stage), slot, stage, True)
    metadata = validate_platform_metadata(Path(args.platform_metadata), slot, stage, cap_payload)
    if (start["task_id"], start["thread_id"], start["host_id"]) != tuple(metadata["new_task_tool_result"][field] for field in ("task_id", "thread_id", "host_id")):
        raise Invalid(f"{stage}: attempt-start differs from final task metadata")
    if creation["controller_observed_request"]["rendered_packet_payload_sha256"] != sha(rendered):
        raise Invalid(f"{stage}: platform creation metadata differs from rendered packet")
    metadata_storage = read(metadata_path(slot, stage)); metadata_payload = metadata_storage[:-1]
    result = {
        "schema_id": "pw-r4-call-receipt-v3.1", "protocol_id": ID, "slot": slot, "stage": stage,
        "model": model, "thinking": thinking, "task_id": metadata["new_task_tool_result"]["task_id"],
        "thread_id": metadata["new_task_tool_result"]["thread_id"], "host_id": metadata["new_task_tool_result"]["host_id"],
        "attempt_reservation": standard_receipt_binding(reservation_path(slot, stage), reservation_payload),
        "attempt_start": standard_receipt_binding(attempt_start_path(slot, stage), start_payload),
        "platform_creation_metadata": standard_receipt_binding(creation_metadata_path(slot, stage), creation_payload),
        "platform_metadata": standard_receipt_binding(metadata_path(slot, stage), metadata_payload),
        "rendered_packet": {"path": normalized(expected_packet), "payload_sha256": sha(rendered), "payload_bytes": len(rendered),
                            "storage_sha256": sha(packet_storage), "storage_bytes": len(packet_storage)},
        "capture": {"path": normalized(capture_path(slot, stage)), "payload_sha256": sha(cap_payload), "payload_bytes": len(cap_payload),
                    "storage_sha256": sha(cap_storage), "storage_bytes": len(cap_storage), "storage_terminal_lf_bytes": 1},
        "input_bindings": bindings,
    }
    return dump(result)


def make_subject_failure_receipt(args: argparse.Namespace, slot: str) -> bytes:
    if subject_failure_path(slot, args.stage).exists() or subject_failure_path(slot, args.stage).is_symlink():
        raise Invalid(f"{args.stage}: subject failure receipt already exists")
    platform_path = Path(args.platform_metadata) if args.platform_metadata else None
    return dump(failure_receipt_object(slot, args.stage, args.failure_kind,
                                       Path(args.platform_creation_metadata), platform_path, Path(args.rendered_packet)))


def score(stage: str, args: argparse.Namespace, slot: str) -> dict[str, Any]:
    if stage == "S90":
        cap_arg = arg_path(args, "S90")
        cap_storage, actual_payload = capture_bytes(cap_arg, capture_path(slot, "S90"), "S90")
        receipt, _ = validate_call_receipt(slot, "S90", cap_arg, arg_path(args, "S90", True),
                                           cap_storage, actual_payload, reconstruct=False)
        actual = load_json_bytes(actual_payload, "S90", canonical=True, subject=True)
        validate_stage_identity("S90", actual, True)
        chain, lineage, write_payload, by, pre_payload, trace_payload = validated_runtime_chain(args, slot)
        vals, _ = base_values()
        lineage_payload = dump(lineage)
        vals.update({"RUNTIME_LINEAGE_RAW": lineage_payload, "RUNTIME_LINEAGE_SHA256": sha(lineage_payload).encode(),
                     "COMPLETE_RAW_ARTIFACT_CHAIN": chain, "WRITE_RECEIPT_RAW": write_payload,
                     "WRITE_RECEIPT_SHA256": sha(write_payload).encode(),
                     "S80_PRE_OBSERVATION_RAW": pre_payload, "S80_PRE_OBSERVATION_SHA256": sha(pre_payload).encode(),
                     "S80_APPLY_PATCH_TRACE_RAW": trace_payload, "S80_APPLY_PATCH_TRACE_SHA256": sha(trace_payload).encode()})
        rendered = substitute(read(ROOT / "templates" / "S90.txt"), vals, "S90 template")
        bindings = lineage["artifacts"] + [{"name": "S80_PRE", "payload_sha256": lineage["s80_pre_observation_sha256"]},
                                           {"name": "S80_APPLY_TRACE", "payload_sha256": lineage["s80_apply_patch_trace_sha256"]},
                                           {"name": "S80_WRITE_RECEIPT", "payload_sha256": sha(write_payload), "payload_bytes": len(write_payload)}]
        packet_storage = read(packet_path(slot, stage))
        if not packet_storage.endswith(b"\n") or packet_storage[:-1] != rendered:
            raise Invalid("S90: stored packet differs from reconstructed render")
        if receipt is None or receipt.get("input_bindings") != bindings:
            raise Invalid("S90: call receipt input bindings mismatch")
        upstream_task_ids = {by[upstream][2].get("task_id") for upstream in SUBJECT[:-1] if by[upstream][2] is not None}
        upstream_thread_ids = {by[upstream][2].get("thread_id") for upstream in SUBJECT[:-1] if by[upstream][2] is not None}
        if receipt.get("task_id") in upstream_task_ids or receipt.get("thread_id") in upstream_thread_ids:
            raise Invalid("S90: task/thread replay")
        expected = expected_s90_from_snapshot(lineage, write_payload, by)
    else:
        actual_payload, actual, receipt = artifact(args, slot, stage)
        expected = expected_subject(stage, args, slot)
    expected_payload = dump(expected)
    if receipt is None:
        raise Invalid(f"{stage}: subject score lacks ordinary call receipt")
    _, _, scored_meta = stored_canonical(metadata_path(slot, stage), metadata_path(slot, stage), f"{stage} scored platform metadata")
    observed = scored_meta["reopened_thread_observation"]
    no_prohibited_activity = all(observed[field] == 0 for field in
                                 ("observed_tool_calls", "observed_delegations", "observed_user_input_requests"))
    exact = actual_payload == expected_payload and no_prohibited_activity
    return {"protocol_id": ID, "slot": slot, "stage": stage, "actual_payload_sha256": sha(actual_payload),
            "expected_payload_sha256": sha(expected_payload), "actual_payload_bytes": len(actual_payload),
            "expected_payload_bytes": len(expected_payload), "exact": exact, "verdict": "PASS" if exact else "FAIL"}


def expected_oracle_payloads() -> dict[str, bytes]:
    """Recompute every nonoperative S10-S80 baseline without reading an oracle file."""
    objects: dict[str, dict[str, Any]] = {}
    payloads: dict[str, bytes] = {}
    for lane in ("A", "B"):
        s10 = "S10" + lane; s20 = "S20" + lane; s30 = "S30" + lane
        s40 = "S40" + lane; s45 = "S45" + lane
        objects[s10] = expected_s10(s10); payloads[s10] = dump(objects[s10])
        objects[s20] = expected_s20(s20, payloads[s10], objects[s10]); payloads[s20] = dump(objects[s20])
        objects[s30] = expected_s30(s30, payloads[s20], objects[s20]); payloads[s30] = dump(objects[s30])
        objects[s40] = expected_s40(s40, payloads[s20], objects[s20], payloads[s30], objects[s30])
        payloads[s40] = dump(objects[s40])
        objects[s45] = expected_s45(s45, payloads[s20], objects[s20], payloads[s30], objects[s30],
                                    payloads[s40], objects[s40])
        payloads[s45] = dump(objects[s45])
    objects["S50"] = expected_s50(payloads["S45A"], objects["S45A"], payloads["S45B"], objects["S45B"])
    payloads["S50"] = dump(objects["S50"])
    objects["S55"] = expected_s55(payloads["S50"], objects["S50"]); payloads["S55"] = dump(objects["S55"])
    specialist_packet_payload, _ = specialist_packet_from_payload(payloads["S55"])
    for stage in ("S60C", "S60K", "S60P"):
        objects[stage] = expected_s60(stage, argparse.Namespace(), "slot-alpha", payloads["S55"], objects["S55"],
                                      specialist_payload=specialist_packet_payload)
        payloads[stage] = dump(objects[stage])
    specialists = [(stage, payloads[stage], objects[stage]) for stage in ("S60P", "S60C", "S60K")]
    objects["S70"] = expected_s70(payloads["S55"], objects["S55"], specialists); payloads["S70"] = dump(objects["S70"])
    objects["S80"] = expected_s80(objects["S50"], payloads["S55"], objects["S55"], payloads["S70"], objects["S70"])
    payloads["S80"] = dump(objects["S80"])
    if set(payloads) != set(ALL_CHAIN):
        raise Invalid("internal oracle recomputation registry drift")
    return {stage: payloads[stage] for stage in ORACLE_STORAGE_ORDER}


def validate_oracle_baselines() -> int:
    expected = expected_oracle_payloads()
    if tuple(expected) != ORACLE_STORAGE_ORDER:
        raise Invalid("internal oracle storage order is not the protocol-fixed C,K,P order")
    for stage in ORACLE_STORAGE_ORDER:
        payload = expected[stage]
        path = ROOT / "oracle_artifacts" / f"{stage}.json"
        storage = read(contained_existing(path, ROOT))
        if storage != payload + b"\n":
            raise Invalid(f"{stage}: sealed oracle baseline differs from deterministic recomputation")
        obj = load_json_bytes(payload, f"{stage} oracle baseline", canonical=True)
        validate_stage_identity(stage, obj, subject=False)
    return len(expected)


def validate_fixture_binding_manifest() -> dict[str, Any]:
    path = ROOT / "fixture_binding_manifest.json"
    storage, payload, binding = stored_canonical(path, path, "fixture binding manifest", ROOT)
    protocol = load_control("protocol.json")
    contract = protocol.get("sealed_preflight_gate", {}).get("fixture_binding_manifest_contract", {})
    if (sha(storage), len(storage)) != (contract.get("storage_sha256"), contract.get("storage_bytes")):
        raise Invalid("fixture binding manifest storage differs from protocol owner constants")
    expected_top = ["schema_id", "protocol_id", "status", "authority_limits", "snapshot",
                    "bound_inputs", "future_result_binding", "live_plans_policy"]
    if (list(binding) != expected_top or binding.get("schema_id") != "pw-r5-frozen-fixture-binding-v1" or
            binding.get("protocol_id") != ID or binding.get("status") != "FROZEN_UNFINISHED_THROWAWAY_TEST_FIXTURE"):
        raise Invalid("fixture binding manifest identity/key order drift")
    limits = binding.get("authority_limits")
    expected_limits = {
        "current_plans_authority": False, "product_authority": False, "production_authority": False,
        "release_authority": False, "production_readiness_claim": False,
    }
    if limits != expected_limits or list(limits) != list(expected_limits):
        raise Invalid("fixture binding authority limits drift")
    expected_snapshot = {
        "provenance_manifest_path": normalized(PROVENANCE_MANIFEST),
        "provenance_manifest_storage_sha256": PROVENANCE_MANIFEST_SHA256,
        "provenance_manifest_storage_bytes": PROVENANCE_MANIFEST_BYTES,
        "fixture_root": normalized(FIXTURE_ROOT), "files": 15,
        "aggregate_bytes": SNAPSHOT_AGGREGATE_BYTES, "aggregate_lines": SNAPSHOT_AGGREGATE_LINES,
        "aggregate_descriptor_sha256": SNAPSHOT_DESCRIPTOR_SHA256,
    }
    if binding.get("snapshot") != expected_snapshot or list(binding["snapshot"]) != list(expected_snapshot):
        raise Invalid("fixture binding snapshot identity drift")
    bound_paths = ["integration_contract.json"] + [f"oracle_artifacts/{stage}.json" for stage in ORACLE_STORAGE_ORDER]
    bound_paths += ["scorer_key.json", "source_custody.json", "topic_a_capsule.json", "topic_b_capsule.json"]
    if bound_paths != sorted(bound_paths):
        raise Invalid("internal fixture binding path registry is not sorted")
    rows = binding.get("bound_inputs")
    if not isinstance(rows, list) or len(rows) != len(bound_paths):
        raise Invalid("fixture binding bound-input count drift")
    for row, rel in zip(rows, bound_paths):
        if (not isinstance(row, dict) or list(row) != ["path", "storage_sha256", "storage_bytes"] or
                row.get("path") != rel):
            raise Invalid("fixture binding row path/shape/order drift")
        data = read(contained_existing(ROOT / rel, ROOT))
        if (row.get("storage_sha256"), row.get("storage_bytes")) != (sha(data), len(data)):
            raise Invalid(f"fixture binding input drift: {rel}")
    expected_future = {
        "required": True,
        "manifest_location": "external_to_mutable_candidate_directory_inside_successor_20260813",
        "rule": "Every terminal result and cohort terminal must be bound to this fixture-binding storage identity by an external final result-binding manifest before empirical credit.",
    }
    if binding.get("future_result_binding") != expected_future or \
            list(binding["future_result_binding"]) != list(expected_future):
        raise Invalid("fixture binding future-result rule drift")
    if binding.get("live_plans_policy") != "NEVER_CONSULT_AFTER_SNAPSHOT_FREEZE":
        raise Invalid("fixture binding live-Plans policy drift")
    return {"payload_sha256": sha(payload), "payload_bytes": len(payload),
            "storage_sha256": sha(storage), "storage_bytes": len(storage), "bound_inputs": len(rows)}


def sealed_preflight(require_sealed: bool) -> dict[str, Any]:
    launch = ROOT / "launch_manifest.json"
    detached = ROOT.parent / "r5_snapshot_v1_launch_custody.json"
    launch_present = launch.exists() or launch.is_symlink()
    detached_present = detached.exists() or detached.is_symlink()
    if not launch_present and not detached_present:
        if require_sealed:
            raise Invalid("sealed preflight required but launch custody is UNSEALED")
        return {"mode": "UNSEALED", "launch_manifest_identity_checked": False, "immutable_files_checked": 0}
    if launch_present != detached_present:
        raise Invalid("partial seal: launch manifest and detached custody must both exist")
    launch_storage, launch_payload, manifest = stored_canonical(launch, launch, "launch manifest", ROOT)
    detached_storage, detached_payload, detached_obj = stored_canonical(detached, detached, "detached custody", ROOT.parent)
    del detached_storage, detached_payload
    schemas = load_control("schemas.json")
    manifest_schema = schemas["launch_manifest"]
    detached_schema = schemas["detached_launch_custody"]
    if list(manifest) != manifest_schema["required_keys"] or manifest.get("schema_id") != manifest_schema["schema_id"]:
        raise Invalid("launch manifest schema/key order mismatch")
    if ((manifest.get("protocol_id"), manifest.get("launch_status"), manifest.get("subject_visibility"),
         manifest.get("external_audit_status")) !=
            (ID, "FROZEN_NOT_LAUNCHED", "only_per_call_rendered_packet_plus_one_platform_codex_delegation_wrapper",
             "excluded")):
        raise Invalid("launch manifest literal/identity mismatch")
    expected_configs = [{"slot": slot, "model": route[0], "thinking": route[1]} for slot, route in ROUTES.items()]
    configs = manifest.get("configs")
    if (not isinstance(configs, list) or configs != expected_configs or
            any(list(row) != manifest_schema["config_keys"] for row in configs)):
        raise Invalid("launch manifest configs differ from exact sealed routes")
    files = manifest.get("immutable_files")
    if not isinstance(files, list) or len(files) != len(IMMUTABLE_PATHS):
        raise Invalid("launch manifest immutable_files count mismatch")
    observed_paths: list[str] = []
    for item, expected_rel in zip(files, IMMUTABLE_PATHS):
        require_object_keys(item, manifest_schema["immutable_file_keys"], "launch manifest immutable item")
        rel = item.get("path")
        if (rel != expected_rel or not isinstance(rel, str) or "\\" in rel or Path(rel).is_absolute() or
                Path(rel).as_posix() != rel or any(part in ("", ".", "..") for part in Path(rel).parts)):
            raise Invalid(f"immutable inventory is not the exact sorted path list: {rel!r}")
        observed_paths.append(rel)
        immutable_path = contained_existing(ROOT / rel, ROOT)
        if immutable_path.is_symlink() or not immutable_path.is_file():
            raise Invalid(f"immutable input is not a regular nonlink file: {rel}")
        data = read(immutable_path)
        if len(data) != item.get("storage_bytes") or sha(data) != item.get("storage_sha256"):
            raise Invalid(f"immutable drift: {rel}")
    if observed_paths != sorted(observed_paths):
        raise Invalid("immutable inventory is not strictly path-sorted")
    if load_control("protocol.json").get("protocol_id") != ID:
        raise Invalid("sealed protocol.json protocol mismatch")
    launch_source = manifest.get("launch_source_receipt")
    if not isinstance(launch_source, dict) or list(launch_source) != manifest_schema["launch_source_receipt_keys"]:
        raise Invalid("launch manifest lacks exact launch_source_receipt binding")
    source_path = ROOT / "source_checks" / "launch.json"
    source_payload, _ = validate_source_receipt(source_path, "launch", source_path)
    source_storage = read(source_path)
    expected_source = {"path": normalized(source_path), "payload_sha256": sha(source_payload),
                       "payload_bytes": len(source_payload), "storage_sha256": sha(source_storage),
                       "storage_bytes": len(source_storage)}
    if launch_source != expected_source:
        raise Invalid("launch manifest source binding differs from exact frozen-fixture launch receipt")
    source_item = files[IMMUTABLE_PATHS.index("source_checks/launch.json")]
    if (source_item["storage_bytes"], source_item["storage_sha256"]) != (len(source_storage), sha(source_storage)):
        raise Invalid("immutable launch receipt row differs from exact frozen-fixture receipt")
    if list(detached_obj) != detached_schema["required_keys"] or detached_obj.get("schema_id") != detached_schema["schema_id"]:
        raise Invalid("detached custody schema/key order mismatch")
    expected_detached = {
        "schema_id": detached_schema["schema_id"], "protocol_id": ID,
        "launch_manifest_path": "model_retest_r5_snapshot_v1/launch_manifest.json",
        "launch_manifest_payload_sha256": sha(launch_payload), "launch_manifest_payload_bytes": len(launch_payload),
        "launch_manifest_storage_sha256": sha(launch_storage), "launch_manifest_storage_bytes": len(launch_storage),
        "status": "SEALED_NOT_LAUNCHED", "external_audit_status": "excluded",
    }
    if detached_obj != expected_detached:
        raise Invalid("detached custody differs from exact manifest payload/storage identity")
    return {"mode": "SEALED", "launch_manifest_identity_checked": True, "immutable_files_checked": len(files)}


def preflight(require_sealed: bool) -> dict[str, Any]:
    protocol_storage = read(ROOT / "protocol.json")
    if (sha(protocol_storage), len(protocol_storage)) != (PROTOCOL_STORAGE_SHA256, PROTOCOL_STORAGE_BYTES):
        raise Invalid("owner-final protocol.json storage hash/bytes drift")
    for name in ("schemas.json", "execution_contract.json", "scorer_key.json", "source_custody.json", "integration_contract.json"):
        if load_control(name).get("protocol_id") != ID:
            raise Invalid(f"{name}: protocol mismatch")
    schema = load_control("schemas.json")
    if schema.get("allowed_slots") != {slot: list(route) for slot, route in ROUTES.items()}:
        raise Invalid("schema routing drift")
    if schema.get("subject_stages") != list(SUBJECT) or schema.get("deterministic_stages") != list(DETERMINISTIC):
        raise Invalid("schema stage registry drift")
    protocol = load_control("protocol.json")
    ledger = protocol.get("cohort_wave_ledger")
    if not isinstance(ledger, dict):
        raise Invalid("protocol cohort wave ledger missing")
    expected_wave_registry = [[wave, WAVE_KIND[wave], list(stages)] for wave, stages in WAVE_REGISTRY]
    if ledger.get("wave_registry") != expected_wave_registry:
        raise Invalid("protocol/controller wave registry drift")
    alignments = (
        ("cohort_wave_dispatch_event", "dispatch_event", "required_keys", "exact_top_level_keys"),
        ("cohort_wave_completion_event", "completion_event", "required_keys", "exact_top_level_keys"),
        ("cohort_wave_ledger", "index", "required_keys", "exact_top_level_keys"),
    )
    for schema_name, protocol_name, schema_keys, protocol_keys in alignments:
        if (schema[schema_name]["schema_id"] != ledger[protocol_name]["schema_id"] or
                schema[schema_name][schema_keys] != ledger[protocol_name][protocol_keys]):
            raise Invalid(f"protocol/schema ledger drift: {schema_name}")
    item_alignments = (
        ("cohort_wave_dispatch_event", "dispatch_event", "dispatch_item_keys", "dispatch_item_exact_keys"),
        ("cohort_wave_completion_event", "completion_event", "completion_item_keys", "completion_item_exact_keys"),
        ("cohort_wave_ledger", "index", "wave_item_keys", "wave_item_exact_keys"),
    )
    for schema_name, protocol_name, schema_keys, protocol_keys in item_alignments:
        if schema[schema_name][schema_keys] != ledger[protocol_name][protocol_keys]:
            raise Invalid(f"protocol/schema ledger item drift: {schema_name}")
    if (schema["subject_failure_receipt"]["schema_id"] != protocol["subject_failure_receipt"]["schema_id"] or
            schema["subject_failure_receipt"]["required_keys"] != protocol["subject_failure_receipt"]["exact_top_level_keys"] or
            schema["controller_invalid_close"]["schema_id"] != protocol["controller_invalid_close"]["schema_id"] or
            schema["controller_invalid_close"]["required_keys"] != protocol["controller_invalid_close"]["exact_top_level_keys"]):
        raise Invalid("protocol/schema subject-failure or controller-invalid-close drift")
    gate_observation = protocol.get("failure_and_invalidation", {}).get("controller_gate_observation", {})
    if (schema["controller_gate_observation"]["schema_id"] != gate_observation.get("schema_id") or
            schema["controller_gate_observation"]["required_keys"] != gate_observation.get("exact_top_level_keys") or
            schema["controller_gate_observation"]["observation_item_keys"] != gate_observation.get("observation_item_exact_keys") or
            schema["controller_gate_observation"]["expected_states"] != gate_observation.get("expected_state_values") or
            schema["controller_gate_observation"]["observed_states"] != gate_observation.get("observed_state_values") or
            schema["controller_gate_observation"]["defect_kinds"] != gate_observation.get("defect_kind_values")):
        raise Invalid("protocol/schema controller gate observation drift")
    self_hosting = protocol.get("external_controller_self_hosting_fail_stop", {})
    if (len(IMMUTABLE_PATHS) != 41 or len(INTERNAL_STATIC_INVENTORY_PATHS) != 38 or
            tuple(self_hosting.get("sealed_controls", [])) != SELF_HOSTING_IMMUTABLE_PATHS or
            tuple(self_hosting.get("mandatory_checkpoints", [])) != EXTERNAL_SELF_HOSTING_CHECKPOINTS or
            "ABORTED_EXTERNAL_SELF_HOSTING_DRIFT_NO_EMPIRICAL_CREDIT" not in
            self_hosting.get("external_terminal", "") or
            schema["controller_gate_observation"].get("static_inventory_internal_count") != 38 or
            tuple(schema["controller_gate_observation"].get("static_inventory_excluded_self_hosting_paths", [])) !=
            SELF_HOSTING_IMMUTABLE_PATHS or
            schema["controller_gate_observation"].get("external_self_hosting_abort_status") !=
            "ABORTED_EXTERNAL_SELF_HOSTING_DRIFT_NO_EMPIRICAL_CREDIT"):
        raise Invalid("protocol/schema external self-hosting fail-stop drift")
    normative = gate_observation.get("normative_expectation_table")
    if (not isinstance(normative, list) or [row.get("gate_code") for row in normative] != list(GATE_TABLE) or
            any(set(row.get("waves", [])) != GATE_TABLE[row["gate_code"]][0] or
                set(row.get("invalid_classes", [])) != GATE_TABLE[row["gate_code"]][1] for row in normative)):
        raise Invalid("protocol/controller normative gate table drift")
    attempt = ledger.get("one_attempt_custody", {})
    call_attempt = ledger.get("ordinary_call_receipt_attempt_binding", {})
    if (schema["call_receipt"]["schema_id"] != call_attempt.get("schema_id") or
            schema["call_receipt"]["required_keys"] != call_attempt.get("exact_top_level_keys") or
            schema["subject_attempt_reservation"]["schema_id"] != attempt.get("reservation", {}).get("schema_id") or
            schema["subject_attempt_reservation"]["required_keys"] != attempt.get("reservation", {}).get("exact_top_level_keys") or
            schema["platform_creation_metadata"]["schema_id"] != attempt.get("platform_creation_metadata", {}).get("schema_id") or
            schema["platform_creation_metadata"]["required_keys"] != attempt.get("platform_creation_metadata", {}).get("exact_top_level_keys") or
            schema["subject_attempt_start"]["schema_id"] != attempt.get("attempt_start", {}).get("schema_id") or
            schema["subject_attempt_start"]["required_keys"] != attempt.get("attempt_start", {}).get("exact_top_level_keys")):
        raise Invalid("protocol/schema one-attempt custody drift")
    seal_contract = protocol.get("sealed_preflight_gate", {})
    launch_contract = seal_contract.get("launch_manifest_schema", {})
    detached_contract = seal_contract.get("detached_custody_schema", {})
    inventory_contract = seal_contract.get("immutable_inventory", {})
    if (schema["launch_manifest"]["schema_id"] != launch_contract.get("schema_id") or
            schema["launch_manifest"]["required_keys"] != launch_contract.get("exact_top_level_keys") or
            schema["launch_manifest"]["immutable_file_keys"] != launch_contract.get("immutable_file_exact_keys") or
            schema["launch_manifest"]["launch_source_receipt_keys"] != launch_contract.get("launch_source_receipt_exact_keys") or
            schema["launch_manifest"]["config_keys"] != launch_contract.get("config_exact_keys") or
            schema["detached_launch_custody"]["schema_id"] != detached_contract.get("schema_id") or
            schema["detached_launch_custody"]["required_keys"] != detached_contract.get("exact_top_level_keys") or
            inventory_contract.get("exact_paths") != list(IMMUTABLE_PATHS) or
            inventory_contract.get("exact_count") != len(IMMUTABLE_PATHS)):
        raise Invalid("protocol/schema/controller sealed inventory drift")
    source_contract = seal_contract.get("launch_source_receipt_contract", {})
    if (schema["source_check_receipt"]["schema_id"] != source_contract.get("schema_id") or
            schema["source_check_receipt"]["required_keys"] != source_contract.get("exact_top_level_keys")):
        raise Invalid("protocol/schema launch source receipt drift")
    s80_contract = protocol.get("S80_write_protocol", {})
    for schema_name, protocol_name in (("s80_global_pre_observation", "global_pre_schema"),
                                       ("controller_apply_patch_trace", "apply_trace_schema"),
                                       ("s80_write_receipt", "write_receipt_schema"),
                                       ("s80_global_guard", "global_post_schema")):
        owner = s80_contract.get(protocol_name, {})
        if (schema[schema_name]["schema_id"] != owner.get("schema_id") or
                schema[schema_name]["required_keys"] != owner.get("exact_top_level_keys")):
            raise Invalid(f"protocol/schema S80 causal custody drift: {schema_name}")
    # Verify every original template placeholder is unique and known, without
    # treating placeholder-looking bytes in inserted evidence as templates.
    known = {"TOPIC_A_CAPSULE_RAW", "TOPIC_A_CAPSULE_SHA256", "TOPIC_A_CAPSULE_BYTES", "TOPIC_B_CAPSULE_RAW", "TOPIC_B_CAPSULE_SHA256", "TOPIC_B_CAPSULE_BYTES", "INTEGRATION_CONTRACT_RAW", "SPECIALIST_PACKET_RAW", "SPECIALIST_PACKET_SHA256", "SPECIALIST_PACKET_BYTES", "RUNTIME_LINEAGE_RAW", "RUNTIME_LINEAGE_SHA256", "COMPLETE_RAW_ARTIFACT_CHAIN", "S80_PRE_OBSERVATION_RAW", "S80_PRE_OBSERVATION_SHA256", "S80_APPLY_PATCH_TRACE_RAW", "S80_APPLY_PATCH_TRACE_SHA256", "WRITE_RECEIPT_RAW", "WRITE_RECEIPT_SHA256"}
    known |= {f"{stage}_{suffix}" for stage in ALL_CHAIN for suffix in ("RAW", "SHA256", "BYTES")}
    for path in [ROOT / "specialist_packet_template.txt"] + [ROOT / "templates" / f"{stage}.txt" for stage in SUBJECT]:
        original = read(path)
        names = [m.group(1).decode() for m in TOKEN.finditer(original)]
        if len(names) != len(set(names)) or any(name not in known for name in names):
            raise Invalid(f"template placeholder contract drift: {path}")
    scorer_ids = [row[1] for row in key()["integration"]["specialist_findings"]]
    if scorer_ids != ["SP-P-I-E99", "SP-C-I-E99", "SP-K-I-E99"]:
        raise Invalid("scorer specialist IDs do not match authoritative templates")
    oracle_count = validate_oracle_baselines()
    fixture_binding = validate_fixture_binding_manifest()
    sources = source_observation("preflight")
    custody = load_control("source_custody.json")
    for lane in ("a", "b"):
        storage = read(ROOT / f"topic_{lane}_capsule.json")
        meta = custody["capsules"][f"topic_{lane}"]
        if len(storage) != meta["bytes"] or sha(storage) != meta["sha256"]:
            raise Invalid(f"topic {lane} capsule storage custody mismatch")
        if load_json_bytes(storage, f"topic {lane} capsule").get("protocol_id") != ID:
            raise Invalid(f"topic {lane} capsule payload protocol mismatch")
    seal = sealed_preflight(require_sealed)
    return {"protocol_id": ID, "status": "PASS", **seal, "sources_checked": sources["files_checked"],
            "source_aggregate_bytes": sources["aggregate_bytes"], "source_descriptor_sha256": sources["descriptor_sha256"],
            "templates_checked": len(SUBJECT) + 1, "oracles_recomputed": oracle_count,
            "fixture_binding_inputs_checked": fixture_binding["bound_inputs"],
            "harness_write_mode": "emit_only"}


def operational_gate(args: argparse.Namespace) -> str:
    assert_no_controller_invalid_latch()
    status = preflight(require_sealed=True)
    if status.get("mode") != "SEALED" or status.get("status") != "PASS":
        raise Invalid("operational command requires passing sealed preflight")
    supplied = getattr(args, "launch_source_receipt", None)
    if not supplied:
        raise Invalid("operational command requires --launch-source-receipt")
    expected = ROOT / "source_checks" / "launch.json"
    payload, _ = validate_source_receipt(Path(supplied), "launch", expected)
    manifest = load_json_bytes(read(ROOT / "launch_manifest.json"), "launch manifest")
    storage = read(expected)
    binding = {"path": normalized(expected), "payload_sha256": sha(payload), "payload_bytes": len(payload),
               "storage_sha256": sha(storage), "storage_bytes": len(storage)}
    if manifest.get("launch_source_receipt") != binding:
        raise Invalid("launch source receipt is not bound by sealed launch manifest")
    return sha(payload)


def validate_s80_global_guard(slot: str) -> tuple[bytes, bytes]:
    pre_path = run_path(slot, "controller", "S80_global_pre", ".json")
    guard_path = run_path(slot, "controller", "S80_global_guard", ".json")
    pre_payload, pre, s80_pre_payload, s80_payload = validate_s80_global_pre(slot)
    _, payload, guard = stored_canonical(guard_path, guard_path, f"{slot} S80 global guard")
    schema = load_control("schemas.json")
    pre_schema = schema["s80_global_pre_observation"]
    if list(pre) != pre_schema["required_keys"] or pre.get("schema_id") != pre_schema["schema_id"]:
        raise Invalid(f"{slot}: S80 global pre schema/key order mismatch")
    manifest = pre.get("outside_selected_manifest")
    if (not isinstance(manifest, list) or
            any(not isinstance(row, dict) or list(row) != pre_schema["manifest_entry_keys"] for row in manifest)):
        raise Invalid(f"{slot}: S80 global pre manifest shape mismatch")
    if (pre.get("protocol_id"), pre.get("slot"), pre.get("outside_selected_descriptor_sha256")) != (ID, slot, sha(dump(manifest))):
        raise Invalid(f"{slot}: S80 global pre identity/descriptor mismatch")
    args = canonical_slot_args(slot)
    write_payload, write, write_pre_payload, trace_payload = validate_write_receipt(args, slot)
    if write_pre_payload != s80_pre_payload:
        raise Invalid(f"{slot}: S80 guard selected pre differs from write receipt")
    dispatch_path = wave_event_path("W80", "dispatch")
    _, dispatch_payload, _ = stored_canonical(dispatch_path, dispatch_path, f"{slot} W80 dispatch for global guard")
    # This is deliberately an intrinsic historical check. Recomputing the
    # outside-selected tree here would incorrectly include later legitimate
    # writes by other slots; the final full-tree check handles current state.
    expected_obj = {
        "schema_id": "pw-r4-s80-global-cross-slot-guard-v2", "protocol_id": ID, "slot": slot,
        "dispatch_event_sha256": sha(dispatch_payload), "s80_pre_observation_sha256": sha(s80_pre_payload),
        "global_pre_observation_sha256": sha(pre_payload), "apply_patch_trace_sha256": sha(trace_payload),
        "s80_write_receipt_sha256": sha(write_payload), "s80_payload_sha256": sha(s80_payload),
        "outside_selected_manifest": manifest,
        "outside_selected_descriptor_sha256": sha(dump(manifest)), "outside_selected_unchanged": True,
        "status": "PASS",
    }
    if (write.get("dispatch_event_sha256"), write.get("global_pre_observation_sha256")) != \
            (sha(dispatch_payload), sha(pre_payload)):
        raise Invalid(f"{slot}: S80 guard predecessor chain mismatch")
    guard_schema = schema["s80_global_guard"]
    if list(expected_obj) != guard_schema["required_keys"]:
        raise Invalid("internal S80 global guard key/order drift")
    require_exact_control_receipt(guard, payload, expected_obj, f"{slot} S80 global guard")
    return pre_payload, payload


def require_hex(value: Any, label: str) -> str:
    if not isinstance(value, str) or HEX64.fullmatch(value) is None:
        raise Invalid(f"{label}: expected lowercase SHA-256")
    return value


def controller_invalid_path(wave_id: str) -> Path:
    return RUNS / "cohort" / "controller_invalid" / f"{wave_id}.json"


def controller_gate_observation_path(wave_id: str) -> Path:
    return RUNS / "cohort" / "controller_invalid_observations" / f"{wave_id}.json"


def lexical_repo_path(rel: str) -> Path:
    if (not isinstance(rel, str) or not rel or "\\" in rel or Path(rel).is_absolute() or
            Path(rel).as_posix() != rel or any(part in ("", ".", "..") for part in Path(rel).parts)):
        raise Invalid(f"invalid normalized repository-relative observation path: {rel!r}")
    path = Path(os.path.abspath(os.fspath(REPO / rel)))
    try:
        path.relative_to(REPO)
    except ValueError as exc:
        raise Invalid(f"observation path escapes repository: {rel}") from exc
    return path


GATE_TABLE = {
    "W00_SEAL_PAIR": ({"W00"}, {"SEAL_DRIFT", "CUSTODY", "FILESYSTEM"}),
    "W00_LAUNCH_RECEIPT": ({"W00"}, {"SEAL_DRIFT", "SOURCE_DRIFT", "CUSTODY", "FILESYSTEM"}),
    "STATIC_INVENTORY_ENTRY": (set(dict(WAVE_REGISTRY)) | {"W00", "W99"},
                               {"SEAL_DRIFT", "CUSTODY", "FILESYSTEM"}),
    "SOURCE_CUSTODY_FILE": ({"W00", "W99"}, {"SOURCE_DRIFT", "SEAL_DRIFT", "CUSTODY", "FILESYSTEM"}),
    "SOURCE_CORPUS_ENTRY": ({"W00", "W99"}, {"SOURCE_DRIFT", "CUSTODY", "FILESYSTEM"}),
    "RUNTIME_REQUIRED_ENTRY": (set(dict(WAVE_REGISTRY)) | {"W99"}, {"CONTROLLER", "CUSTODY", "ROUTE", "BINDING", "FILESYSTEM"}),
    "RUNTIME_FORBIDDEN_ENTRY": (set(dict(WAVE_REGISTRY)) | {"W00", "W99"}, {"CONTROLLER", "CUSTODY", "BINDING", "FILESYSTEM"}),
    "UNEXPECTED_RUNTIME_ENTRY": (set(dict(WAVE_REGISTRY)) | {"W00", "W99"}, {"CUSTODY", "FILESYSTEM"}),
    "SANDBOX_REQUIRED_ENTRY": ({"W80", "W99"}, {"CUSTODY", "BINDING", "FILESYSTEM"}),
    "SANDBOX_FORBIDDEN_ENTRY": ({"W00", "W80", "W99"}, {"CUSTODY", "BINDING", "FILESYSTEM"}),
    "W99_LAUNCH_RECEIPT": ({"W99"}, {"SOURCE_DRIFT", "SEAL_DRIFT", "CUSTODY", "BINDING", "FILESYSTEM"}),
    "W99_CLOSE_RECEIPT": ({"W99"}, {"SOURCE_DRIFT", "CUSTODY", "BINDING", "FILESYSTEM"}),
    "ANCESTOR_NONLINK": (set(dict(WAVE_REGISTRY)) | {"W00", "W99"}, {"CUSTODY", "FILESYSTEM"}),
}


def lstat_kind(path: Path) -> tuple[str, int | None, bytes | None, bytes | None, str | None]:
    """Observe one lexical path without following its final component."""
    lexical = Path(os.path.abspath(os.fspath(path)))
    try:
        parts = lexical.relative_to(REPO).parts
    except ValueError:
        parts = ()
    cursor = REPO
    for part in parts[:-1]:
        cursor /= part
        try:
            ancestor_mode = cursor.lstat().st_mode
        except FileNotFoundError:
            return "ABSENT", None, None, None, None
        except OSError as exc:
            return "RESOLUTION_ERROR", None, None, None, type(exc).__name__
        if stat.S_ISLNK(ancestor_mode):
            return "RESOLUTION_ERROR", None, None, None, "SymlinkAncestorError"
        if not stat.S_ISDIR(ancestor_mode):
            return "RESOLUTION_ERROR", None, None, None, "NotADirectoryError"
    try:
        st = lexical.lstat()
    except FileNotFoundError:
        return "ABSENT", None, None, None, None
    except OSError as exc:
        return "RESOLUTION_ERROR", None, None, None, type(exc).__name__
    mode = st.st_mode
    if stat.S_ISLNK(mode):
        try:
            return "SYMLINK", mode, os.fsencode(os.readlink(lexical)), None, None
        except OSError as exc:
            return "RESOLUTION_ERROR", None, None, None, type(exc).__name__
    if stat.S_ISREG(mode):
        try:
            return "REGULAR_NONLINK", mode, None, lexical.read_bytes(), None
        except OSError as exc:
            return "RESOLUTION_ERROR", None, None, None, type(exc).__name__
    if stat.S_ISDIR(mode):
        return "DIRECTORY_NONLINK", mode, None, None, None
    return "OTHER", mode, None, None, None


def canonical_observed_payload(storage: bytes | None) -> bytes | None:
    if storage is None or not storage.endswith(b"\n") or storage.endswith(b"\n\n"):
        return None
    payload = storage[:-1]
    try:
        load_json_bytes(payload, "observed canonical receipt payload", canonical=True)
    except Invalid:
        return None
    return payload


def defect_kind(expected: str, observed: str, payload: bytes | None, storage: bytes | None,
                expected_payload_sha: str | None, expected_payload_bytes: int | None,
                expected_storage_sha: str | None, expected_storage_bytes: int | None) -> str | None:
    if expected == "ABSENT":
        return None if observed == "ABSENT" else "UNEXPECTED_PRESENCE"
    if observed == "ABSENT": return "MISSING"
    if observed == "SYMLINK": return "SYMLINK"
    if observed == "RESOLUTION_ERROR": return "RESOLUTION_ERROR"
    if expected == "DIRECTORY_NONLINK":
        return None if observed == "DIRECTORY_NONLINK" else "NONREGULAR"
    if observed != "REGULAR_NONLINK": return "NONREGULAR"
    if expected == "REGULAR_NONLINK": return None
    if expected == "MATCH_BOUND_PAYLOAD":
        if payload is None or sha(payload) != expected_payload_sha or (expected_payload_bytes is not None and len(payload) != expected_payload_bytes):
            return "STORAGE_DRIFT"
        return None
    if expected == "MATCH_BOUND_STORAGE":
        if storage is None or sha(storage) != expected_storage_sha or len(storage) != expected_storage_bytes:
            return "STORAGE_DRIFT"
        return None
    raise Invalid(f"unknown expected observation state: {expected}")


def nofollow_observation(spec: tuple[str, str, str | None, int | None, str | None, int | None]) -> dict[str, Any]:
    rel, expected_state, expected_payload_sha, expected_payload_bytes, expected_storage_sha, expected_storage_bytes = spec
    observed_state, mode, link_data, storage, error_type = lstat_kind(lexical_repo_path(rel))
    payload = canonical_observed_payload(storage)
    defect = defect_kind(expected_state, observed_state, payload, storage, expected_payload_sha,
                         expected_payload_bytes, expected_storage_sha, expected_storage_bytes)
    return {
        "path": rel, "expected_state": expected_state,
        "expected_payload_sha256": expected_payload_sha, "expected_payload_bytes": expected_payload_bytes,
        "expected_storage_sha256": expected_storage_sha, "expected_storage_bytes": expected_storage_bytes,
        "observed_state": observed_state, "lstat_mode": mode,
        "symlink_target_sha256": None if link_data is None else sha(link_data),
        "symlink_target_bytes": None if link_data is None else len(link_data),
        "payload_sha256": None if payload is None else sha(payload),
        "payload_bytes": None if payload is None else len(payload),
        "storage_sha256": None if storage is None else sha(storage),
        "storage_bytes": None if storage is None else len(storage),
        "error_type": error_type, "defect_kind": defect,
    }


def observation_mismatch(row: dict[str, Any]) -> bool:
    return row.get("defect_kind") is not None


def intrinsic_manifest_binding() -> tuple[bytes, bytes, dict[str, Any], dict[str, dict[str, Any]]]:
    """Validate seal identity and every current immutable row."""
    launch = ROOT / "launch_manifest.json"; detached = ROOT.parent / "r5_snapshot_v1_launch_custody.json"
    if lstat_kind(launch)[0] != "REGULAR_NONLINK" or lstat_kind(detached)[0] != "REGULAR_NONLINK":
        raise Invalid("intrinsic seal binding requires regular nonlink manifest and detached custody")
    launch_storage = launch.read_bytes(); detached_storage = detached.read_bytes()
    if (not launch_storage.endswith(b"\n") or launch_storage.endswith(b"\n\n") or
            not detached_storage.endswith(b"\n") or detached_storage.endswith(b"\n\n")):
        raise Invalid("intrinsic seal storage is not canonical payload plus one LF")
    launch_payload = launch_storage[:-1]; detached_payload = detached_storage[:-1]
    manifest = load_json_bytes(launch_payload, "intrinsic launch manifest", canonical=True)
    custody = load_json_bytes(detached_payload, "intrinsic detached custody", canonical=True)
    schemas = load_control("schemas.json"); ms = schemas["launch_manifest"]; ds = schemas["detached_launch_custody"]
    if list(manifest) != ms["required_keys"] or manifest.get("schema_id") != ms["schema_id"]:
        raise Invalid("intrinsic launch manifest schema mismatch")
    if ((manifest.get("protocol_id"), manifest.get("launch_status"), manifest.get("subject_visibility"),
         manifest.get("external_audit_status")) !=
            (ID, "FROZEN_NOT_LAUNCHED", "only_per_call_rendered_packet_plus_one_platform_codex_delegation_wrapper", "excluded")):
        raise Invalid("intrinsic launch manifest literals mismatch")
    expected_configs = [{"slot": slot, "model": route[0], "thinking": route[1]} for slot, route in ROUTES.items()]
    if manifest.get("configs") != expected_configs or any(list(row) != ms["config_keys"] for row in manifest["configs"]):
        raise Invalid("intrinsic launch manifest configs mismatch")
    files = manifest.get("immutable_files")
    if not isinstance(files, list) or len(files) != len(IMMUTABLE_PATHS):
        raise Invalid("intrinsic launch manifest inventory count mismatch")
    rows: dict[str, dict[str, Any]] = {}
    for item, rel in zip(files, IMMUTABLE_PATHS):
        require_object_keys(item, ms["immutable_file_keys"], "intrinsic immutable item")
        if item.get("path") != rel:
            raise Invalid("intrinsic launch manifest inventory order/path mismatch")
        require_hex(item.get("storage_sha256"), f"intrinsic immutable row {rel}")
        if not isinstance(item.get("storage_bytes"), int) or isinstance(item.get("storage_bytes"), bool) or item["storage_bytes"] < 0:
            raise Invalid(f"intrinsic immutable row bytes invalid: {rel}")
        rows[rel] = item
        state, _, _, storage, _ = lstat_kind(ROOT / rel)
        if state != "REGULAR_NONLINK" or storage is None or (sha(storage), len(storage)) != (item["storage_sha256"], item["storage_bytes"]):
            raise Invalid(f"intrinsic immutable row drift: {rel}")
    binding = manifest.get("launch_source_receipt")
    if not isinstance(binding, dict) or list(binding) != ms["launch_source_receipt_keys"]:
        raise Invalid("intrinsic manifest launch-source binding shape mismatch")
    source_rel = normalized(ROOT / "source_checks" / "launch.json")
    if (binding.get("path") != source_rel or
            (binding.get("storage_sha256"), binding.get("storage_bytes")) !=
            (rows["source_checks/launch.json"]["storage_sha256"], rows["source_checks/launch.json"]["storage_bytes"])):
        raise Invalid("intrinsic manifest nested launch binding/inventory mismatch")
    require_hex(binding.get("payload_sha256"), "intrinsic launch payload hash")
    if not isinstance(binding.get("payload_bytes"), int) or isinstance(binding.get("payload_bytes"), bool) or binding["payload_bytes"] < 0:
        raise Invalid("intrinsic launch payload bytes invalid")
    expected_detached = {"schema_id": ds["schema_id"], "protocol_id": ID,
                         "launch_manifest_path": "model_retest_r5_snapshot_v1/launch_manifest.json",
                         "launch_manifest_payload_sha256": sha(launch_payload),
                         "launch_manifest_payload_bytes": len(launch_payload),
                         "launch_manifest_storage_sha256": sha(launch_storage),
                         "launch_manifest_storage_bytes": len(launch_storage),
                         "status": "SEALED_NOT_LAUNCHED", "external_audit_status": "excluded"}
    if list(custody) != ds["required_keys"] or custody != expected_detached:
        raise Invalid("intrinsic detached custody mismatch")
    return launch_payload, launch_storage, manifest, rows


def intrinsic_manifest_binding_allowing(allowed_mismatch: str) -> tuple[bytes, bytes, dict[str, Any], dict[str, dict[str, Any]]]:
    """Validate sealed custody while replacing one current-row equality with its observation target."""
    prefix = normalized(ROOT) + "/"
    if (not isinstance(allowed_mismatch, str) or not allowed_mismatch.startswith(prefix) or
            allowed_mismatch[len(prefix):] not in INTERNAL_STATIC_INVENTORY_PATHS):
        raise Invalid("manifest mismatch exception is not an internally terminalizable sealed inventory member")
    launch = ROOT / "launch_manifest.json"
    detached = ROOT.parent / "r5_snapshot_v1_launch_custody.json"
    if lstat_kind(launch)[0] != "REGULAR_NONLINK" or lstat_kind(detached)[0] != "REGULAR_NONLINK":
        raise Invalid("immutable observation lacks a regular sealed manifest/detached binding")
    launch_storage = launch.read_bytes(); detached_storage = detached.read_bytes()
    if (not launch_storage.endswith(b"\n") or launch_storage.endswith(b"\n\n") or
            not detached_storage.endswith(b"\n") or detached_storage.endswith(b"\n\n")):
        raise Invalid("immutable-observation manifest custody is not canonical storage plus one LF")
    launch_payload = launch_storage[:-1]; detached_payload = detached_storage[:-1]
    manifest = load_json_bytes(launch_payload, "immutable-observation launch manifest", canonical=True)
    custody = load_json_bytes(detached_payload, "immutable-observation detached custody", canonical=True)
    manifest_keys = ["schema_id", "protocol_id", "launch_status", "immutable_files", "launch_source_receipt",
                     "configs", "subject_visibility", "external_audit_status"]
    item_keys = ["path", "storage_bytes", "storage_sha256"]
    source_keys = ["path", "payload_sha256", "payload_bytes", "storage_sha256", "storage_bytes"]
    config_keys = ["slot", "model", "thinking"]
    if (list(manifest) != manifest_keys or manifest.get("schema_id") != "pw-r4-launch-manifest-v3" or
            (manifest.get("protocol_id"), manifest.get("launch_status"), manifest.get("subject_visibility"),
             manifest.get("external_audit_status")) !=
            (ID, "FROZEN_NOT_LAUNCHED", "only_per_call_rendered_packet_plus_one_platform_codex_delegation_wrapper",
             "excluded")):
        raise Invalid("immutable-observation launch manifest identity/schema mismatch")
    expected_configs = [{"slot": slot, "model": route[0], "thinking": route[1]} for slot, route in ROUTES.items()]
    if manifest.get("configs") != expected_configs or any(list(row) != config_keys for row in manifest["configs"]):
        raise Invalid("immutable-observation launch manifest route mismatch")
    files = manifest.get("immutable_files")
    if not isinstance(files, list) or len(files) != len(IMMUTABLE_PATHS):
        raise Invalid("immutable-observation launch manifest inventory count mismatch")
    rows: dict[str, dict[str, Any]] = {}
    for item, rel in zip(files, IMMUTABLE_PATHS):
        require_object_keys(item, item_keys, f"immutable-observation manifest row {rel}")
        if item.get("path") != rel:
            raise Invalid("immutable-observation manifest inventory order/path mismatch")
        require_hex(item.get("storage_sha256"), f"immutable-observation row {rel}")
        size = item.get("storage_bytes")
        if not isinstance(size, int) or isinstance(size, bool) or size < 0:
            raise Invalid(f"immutable-observation row bytes invalid: {rel}")
        rows[rel] = item
        repo_rel = normalized(ROOT / rel)
        if repo_rel == allowed_mismatch:
            continue
        state, _, _, storage, _ = lstat_kind(ROOT / rel)
        if (state != "REGULAR_NONLINK" or storage is None or
                (sha(storage), len(storage)) != (item["storage_sha256"], item["storage_bytes"])):
            raise Invalid(f"a second immutable inventory row differs from sealed custody: {rel}")
    binding = manifest.get("launch_source_receipt")
    source_row = rows["source_checks/launch.json"]
    if (not isinstance(binding, dict) or list(binding) != source_keys or
            binding.get("path") != normalized(ROOT / "source_checks" / "launch.json") or
            (binding.get("storage_sha256"), binding.get("storage_bytes")) !=
            (source_row["storage_sha256"], source_row["storage_bytes"])):
        raise Invalid("immutable-observation manifest launch-source binding mismatch")
    require_hex(binding.get("payload_sha256"), "immutable-observation launch-source payload")
    if (not isinstance(binding.get("payload_bytes"), int) or isinstance(binding.get("payload_bytes"), bool) or
            binding["payload_bytes"] < 0):
        raise Invalid("immutable-observation launch-source payload bytes invalid")
    detached_keys = ["schema_id", "protocol_id", "launch_manifest_path", "launch_manifest_payload_sha256",
                     "launch_manifest_payload_bytes", "launch_manifest_storage_sha256", "launch_manifest_storage_bytes",
                     "status", "external_audit_status"]
    expected_detached = {
        "schema_id": "pw-r4-detached-launch-custody-v2", "protocol_id": ID,
        "launch_manifest_path": "model_retest_r5_snapshot_v1/launch_manifest.json",
        "launch_manifest_payload_sha256": sha(launch_payload), "launch_manifest_payload_bytes": len(launch_payload),
        "launch_manifest_storage_sha256": sha(launch_storage), "launch_manifest_storage_bytes": len(launch_storage),
        "status": "SEALED_NOT_LAUNCHED", "external_audit_status": "excluded",
    }
    if list(custody) != detached_keys or custody != expected_detached:
        raise Invalid("immutable-observation detached custody mismatch")
    return launch_payload, launch_storage, manifest, rows


def source_custody_row(snapshot_repo_rel: str) -> tuple[str, int]:
    custody_path = ROOT / "source_custody.json"
    if lstat_kind(custody_path)[0] != "REGULAR_NONLINK":
        raise Invalid("owner-fixed source custody is not a regular nonlink")
    storage = read(custody_path)
    owner = load_control("protocol.json")["launch_source_gate"]["source_owner_constants"]
    if (sha(storage), len(storage)) != (owner["source_custody_storage_sha256"], owner["source_custody_storage_bytes"]):
        raise Invalid("owner-fixed source custody is not current")
    custody = load_json_bytes(storage, "owner-fixed source custody")
    rows = {normalized(FIXTURE_ROOT / row["path"]): row
            for row in custody.get("corpus_files", []) if isinstance(row, dict) and isinstance(row.get("path"), str)}
    if snapshot_repo_rel not in rows:
        raise Invalid("source corpus observation path is outside the owner-fixed 15-row domain")
    size = rows[snapshot_repo_rel].get("bytes")
    if not isinstance(size, int) or isinstance(size, bool) or size < 0:
        raise Invalid(f"source custody {snapshot_repo_rel}: invalid byte count")
    return require_hex(rows[snapshot_repo_rel].get("sha256"), f"source custody {snapshot_repo_rel}"), size


def gate_expectations(wave_id: str, invalid_class: str, gate_code: str,
                      selector: str | None) -> list[tuple[str, str, str | None, int | None, str | None, int | None]]:
    if gate_code not in GATE_TABLE:
        raise Invalid("unknown controller gate code")
    waves, classes = GATE_TABLE[gate_code]
    if wave_id not in waves or invalid_class not in classes:
        raise Invalid("controller gate code is not admitted for this wave/class")
    fixed_launch = normalized(ROOT / "source_checks" / "launch.json")
    spec: list[tuple[str, str, str | None, int | None, str | None, int | None]]
    if gate_code == "W00_SEAL_PAIR":
        if selector is not None: raise Invalid("W00_SEAL_PAIR has a fixed two-path domain")
        spec = [(normalized(ROOT / "launch_manifest.json"), "REGULAR_NONLINK", None, None, None, None),
                (normalized(ROOT.parent / "r5_snapshot_v1_launch_custody.json"), "REGULAR_NONLINK", None, None, None, None)]
    elif gate_code in ("W00_LAUNCH_RECEIPT", "W99_LAUNCH_RECEIPT"):
        if selector is not None: raise Invalid(f"{gate_code} has a fixed path domain")
        try:
            _, _, manifest, _ = intrinsic_manifest_binding_allowing(fixed_launch)
            binding = manifest["launch_source_receipt"]
            spec = [(fixed_launch, "MATCH_BOUND_STORAGE", None, None,
                     binding["storage_sha256"], binding["storage_bytes"])]
        except Invalid:
            if gate_code == "W00_LAUNCH_RECEIPT": raise
            recovered = recover_historical_launch_hash()
            if recovered is None:
                spec = [(fixed_launch, "REGULAR_NONLINK", None, None, None, None)]
            else:
                spec = [(fixed_launch, "MATCH_BOUND_PAYLOAD", recovered, None, None, None)]
    elif gate_code == "STATIC_INVENTORY_ENTRY":
        if selector is None: raise Invalid("STATIC_INVENTORY_ENTRY requires --path")
        lexical_repo_path(selector)
        prefix = normalized(ROOT) + "/"
        if not selector.startswith(prefix) or selector[len(prefix):] not in IMMUTABLE_PATHS:
            raise Invalid("static inventory selector is not an exact immutable member")
        if selector[len(prefix):] in SELF_HOSTING_IMMUTABLE_PATHS:
            raise Invalid("self-hosting control drift is external-abort-only and cannot create an internal observation")
        _, _, manifest, rows = intrinsic_manifest_binding_allowing(selector)
        if wave_id != "W00":
            launch_sha = require_hex(manifest["launch_source_receipt"]["payload_sha256"],
                                     "static inventory historical launch hash")
            recovered = recover_historical_launch_hash(allowed_static_mismatch=selector)
            if recovered != launch_sha or static_inventory_invalid_wave(launch_sha) != wave_id:
                raise Invalid("static inventory observation wave is not the exact current runtime frontier")
        row = rows[selector[len(prefix):]]
        spec = [(selector, "MATCH_BOUND_STORAGE", None, None, row["storage_sha256"], row["storage_bytes"])]
    elif gate_code == "SOURCE_CUSTODY_FILE":
        if selector is not None: raise Invalid("SOURCE_CUSTODY_FILE has a fixed path domain")
        owner = load_control("protocol.json")["launch_source_gate"]["source_owner_constants"]
        spec = [(normalized(ROOT / "source_custody.json"), "MATCH_BOUND_STORAGE", None, None,
                 owner["source_custody_storage_sha256"], owner["source_custody_storage_bytes"])]
    elif gate_code == "SOURCE_CORPUS_ENTRY":
        if selector is None: raise Invalid("SOURCE_CORPUS_ENTRY requires --path")
        lexical_repo_path(selector)
        expected_sha, expected_bytes = source_custody_row(selector)
        spec = [(selector, "MATCH_BOUND_STORAGE", None, None, expected_sha, expected_bytes)]
    elif gate_code in ("RUNTIME_REQUIRED_ENTRY", "RUNTIME_FORBIDDEN_ENTRY"):
        if selector is None: raise Invalid(f"{gate_code} requires --path")
        expected = admitted_runtime_observation_state(wave_id, selector, gate_code == "RUNTIME_REQUIRED_ENTRY")
        spec = [(selector, expected[0], None, None, expected[1], expected[2])]
    elif gate_code == "UNEXPECTED_RUNTIME_ENTRY":
        if selector is None or not unexpected_runtime_selector(selector):
            raise Invalid("unexpected runtime selector is not an unclassified runs/sandboxes descendant")
        spec = [(selector, "ABSENT", None, None, None, None)]
    elif gate_code in ("SANDBOX_REQUIRED_ENTRY", "SANDBOX_FORBIDDEN_ENTRY"):
        if selector is None: raise Invalid(f"{gate_code} requires --path")
        spec = [sandbox_observation_spec(wave_id, selector, gate_code == "SANDBOX_REQUIRED_ENTRY")]
    elif gate_code == "W99_CLOSE_RECEIPT":
        if selector is not None: raise Invalid("W99_CLOSE_RECEIPT has a fixed path domain")
        spec = [(normalized(ROOT / "source_checks" / "close.json"), "REGULAR_NONLINK", None, None, None, None)]
    else:
        if selector is None or not admitted_ancestor_selector(selector):
            raise Invalid("ANCESTOR_NONLINK selector is not a protocol-admitted lexical ancestor")
        spec = [(selector, "DIRECTORY_NONLINK", None, None, None, None)]
    return sorted(spec, key=lambda row: row[0])


def controller_gate_observation(args: argparse.Namespace) -> bytes:
    output = controller_gate_observation_path(args.wave_id)
    if output.exists() or output.is_symlink():
        raise Invalid("controller gate observation is create-once")
    specs = gate_expectations(args.wave_id, args.invalid_class, args.gate_code, args.path)
    observations = [nofollow_observation(spec) for spec in specs]
    if not any(observation_mismatch(row) for row in observations):
        raise Invalid("controller gate observation contains no normative invalid state")
    if (args.gate_code == "STATIC_INVENTORY_ENTRY" and args.wave_id != "W00" and
            (len(observations) != 1 or observations[0]["observed_state"] != "REGULAR_NONLINK" or
             observations[0]["defect_kind"] != "STORAGE_DRIFT")):
        raise Invalid("post-launch static inventory route requires one regular storage-drifted row")
    contract = load_control("schemas.json")["controller_gate_observation"]
    result = {"schema_id": contract["schema_id"], "protocol_id": ID, "wave_id": args.wave_id,
              "invalid_class": args.invalid_class, "gate_code": args.gate_code,
              "observations": observations, "status": "INVALID_STATE_OBSERVED"}
    if list(result) != contract["required_keys"] or any(list(row) != contract["observation_item_keys"] for row in observations):
        raise Invalid("internal controller gate observation schema/key order drift")
    return dump(result)


def validate_controller_gate_observation(wave_id: str, path: Path,
                                         invalid_class: str) -> tuple[bytes, dict[str, Any]]:
    expected_path = controller_gate_observation_path(wave_id)
    _, payload, obj = stored_canonical(path, expected_path, f"{wave_id} controller gate observation")
    schema = load_control("schemas.json")["controller_gate_observation"]
    if (list(obj) != schema["required_keys"] or obj.get("schema_id") != schema["schema_id"] or
            (obj.get("protocol_id"), obj.get("wave_id"), obj.get("invalid_class"), obj.get("status")) !=
            (ID, wave_id, invalid_class, "INVALID_STATE_OBSERVED")):
        raise Invalid(f"{wave_id}: controller gate observation identity/schema mismatch")
    rows = obj.get("observations")
    if not isinstance(rows, list) or not rows or any(not isinstance(row, dict) or list(row) != schema["observation_item_keys"] for row in rows):
        raise Invalid(f"{wave_id}: controller gate observation row shape mismatch")
    selector = None if obj.get("gate_code") in {"W00_SEAL_PAIR", "W00_LAUNCH_RECEIPT", "SOURCE_CUSTODY_FILE",
                                                 "W99_LAUNCH_RECEIPT", "W99_CLOSE_RECEIPT"} else rows[0].get("path")
    specs = gate_expectations(wave_id, invalid_class, obj.get("gate_code"), selector)
    recomputed = [nofollow_observation(spec) for spec in specs]
    if rows != recomputed or not any(observation_mismatch(row) for row in rows):
        raise Invalid(f"{wave_id}: controller gate observation is nonnormative, stale, or no longer invalid")
    if (obj.get("gate_code") == "STATIC_INVENTORY_ENTRY" and wave_id != "W00" and
            (len(rows) != 1 or rows[0]["observed_state"] != "REGULAR_NONLINK" or
             rows[0]["defect_kind"] != "STORAGE_DRIFT")):
        raise Invalid(f"{wave_id}: post-launch static observation is not exact regular storage drift")
    return payload, obj


def validate_controller_invalid_receipt(wave_id: str, expected_sha: str) -> tuple[bytes, dict[str, Any]]:
    path = controller_invalid_path(wave_id)
    _, payload, receipt = stored_canonical(path, path, f"{wave_id} controller-invalid receipt")
    schema = load_control("schemas.json")["controller_invalid_receipt"]
    if list(receipt) != schema["required_keys"] or receipt.get("schema_id") != schema["schema_id"]:
        raise Invalid(f"{wave_id}: controller-invalid receipt schema/key order mismatch")
    if sha(payload) != expected_sha or receipt.get("protocol_id") != ID or receipt.get("wave_id") != wave_id:
        raise Invalid(f"{wave_id}: controller-invalid receipt identity/hash mismatch")
    if receipt.get("invalid_class") not in schema["allowed_invalid_classes"] or receipt.get("status") != "COHORT_INVALID":
        raise Invalid(f"{wave_id}: controller-invalid class/status mismatch")
    slot = receipt.get("slot"); stage = receipt.get("stage")
    if wave_id in STAGE_WAVE.values():
        if (slot is None) != (stage is None):
            raise Invalid(f"{wave_id}: controller-invalid runtime slot/stage must both be null or both be non-null")
        if slot is not None and (slot not in ROUTES or stage not in RESULT_STAGES or STAGE_WAVE[stage] != wave_id):
            raise Invalid(f"{wave_id}: controller-invalid runtime slot/stage mismatch")
    elif wave_id not in ("W00", "W99") or slot is not None or stage is not None:
        raise Invalid(f"{wave_id}: controller-invalid gate identity mismatch")
    paths = receipt.get("evidence_paths"); hashes = receipt.get("evidence_payload_sha256s")
    if (not isinstance(paths, list) or not paths or not isinstance(hashes, list) or len(paths) != len(hashes) or
            any(not isinstance(item, str) for item in paths) or paths != sorted(paths) or len(paths) != len(set(paths))):
        raise Invalid(f"{wave_id}: controller-invalid evidence list mismatch")
    gate_rel = normalized(controller_gate_observation_path(wave_id))
    observation_root_rel = normalized(RUNS / "cohort" / "controller_invalid_observations") + "/"
    standard_dirs, standard_files = standard_runtime_paths()
    seal_or_source = {normalized(ROOT / item) for item in IMMUTABLE_PATHS} | {
        normalized(ROOT / "launch_manifest.json"), normalized(ROOT.parent / "r5_snapshot_v1_launch_custody.json"),
        normalized(ROOT / "source_checks" / "close.json")}
    seal_or_source.update(row[0] for row in load_control("protocol.json")["launch_source_gate"]["source_owner_constants"]["authority_by_path"])
    for rel, expected in zip(paths, hashes):
        require_hex(expected, f"{wave_id} evidence hash")
        if Path(rel).is_absolute() or Path(rel).as_posix() != rel or ".." in Path(rel).parts:
            raise Invalid(f"{wave_id}: invalid evidence path {rel!r}")
        if rel != gate_rel and rel not in standard_dirs and rel not in standard_files and rel not in seal_or_source:
            raise Invalid(f"{wave_id}: controller-invalid evidence path is outside every protocol domain: {rel}")
        evidence = contained_existing(REPO / rel, REPO)
        if evidence.is_symlink() or not evidence.is_file():
            raise Invalid(f"{wave_id}: evidence is not a regular nonlink file")
        storage = read(evidence)
        candidate = storage[:-1] if storage.endswith(b"\n") and not storage.endswith(b"\n\n") else storage
        if sha(candidate) != expected:
            raise Invalid(f"{wave_id}: controller-invalid evidence hash mismatch for {rel}")
        if rel == gate_rel:
            observation_payload, _ = validate_controller_gate_observation(wave_id, evidence, receipt["invalid_class"])
            if sha(observation_payload) != expected:
                raise Invalid(f"{wave_id}: gate observation evidence payload hash mismatch")
        elif rel.startswith(observation_root_rel):
            raise Invalid(f"{wave_id}: controller-invalid receipt binds a different wave's gate observation")
    return payload, receipt


def subject_evidence_verdict(stage: str, slot: str) -> tuple[str, bytes, bytes, dict[str, Any]]:
    args = canonical_slot_args(slot)
    cap = capture_path(slot, stage); rec_path = receipt_path(slot, stage)
    storage, payload = capture_bytes(cap, cap, f"{slot} {stage} wave artifact")
    rec, rec_payload = validate_call_receipt(slot, stage, cap, rec_path, storage, payload, reconstruct=False)
    try:
        verdict = score(stage, args, slot)["verdict"]
    except SubjectFail:
        verdict = "FAIL"
    if verdict not in ("PASS", "FAIL"):
        raise Invalid(f"{slot} {stage}: scorer returned invalid verdict")
    return verdict, payload, rec_payload, rec


def validate_failure_metadata(path: Path, slot: str, stage: str) -> tuple[bytes, dict[str, Any]]:
    expected = metadata_path(slot, stage)
    _, payload, meta = stored_canonical(path, expected, f"{stage} failure platform metadata")
    schema = load_control("schemas.json")["platform_task_metadata"]
    if list(meta) != schema["required_keys"] or meta.get("schema_id") != schema["schema_id"]:
        raise Invalid(f"{stage}: failure platform metadata schema/key order mismatch")
    request = require_object_keys(meta.get("controller_observed_request"), schema["controller_request_keys"], f"{stage} failure request")
    new_task = require_object_keys(meta.get("new_task_tool_result"), schema["new_task_result_keys"], f"{stage} failure new task")
    reopened = require_object_keys(meta.get("reopened_thread_observation"), schema["reopened_thread_keys"], f"{stage} failure reopened task")
    model, thinking = slot_route(slot)
    if ((meta.get("protocol_id"), meta.get("slot"), meta.get("stage"), request.get("requested_model"),
         request.get("requested_thinking"), request.get("projectless"), new_task.get("fresh_task")) !=
            (ID, slot, stage, model, thinking, True, True)):
        raise Invalid(f"{stage}: failure metadata route/request mismatch")
    for field in ("task_id", "thread_id", "host_id"):
        value = new_task.get(field)
        if not isinstance(value, str) or not value.strip() or reopened.get(field) != value:
            raise Invalid(f"{stage}: failure metadata {field} mismatch")
    output_hash = reopened.get("final_output_sha256"); output_bytes = reopened.get("final_output_bytes")
    if output_hash is not None: require_hex(output_hash, f"{stage} observed final output")
    if not isinstance(output_bytes, int) or isinstance(output_bytes, bool) or output_bytes < 0:
        raise Invalid(f"{stage}: failure metadata final output bytes invalid")
    if (output_hash is None) != (output_bytes == 0):
        raise Invalid(f"{stage}: final output hash/byte count must be exact null-zero or hex-positive pairing")
    for field in ("observed_tool_calls", "observed_delegations", "observed_user_input_requests"):
        value = reopened.get(field)
        if not isinstance(value, int) or isinstance(value, bool) or value < 0:
            raise Invalid(f"{stage}: failure metadata {field} invalid")
    return payload, meta


def failure_receipt_object(slot: str, stage: str, failure_kind: str, creation_path: Path,
                           platform_path: Path | None, rendered_path: Path) -> dict[str, Any]:
    if stage not in SUBJECT:
        raise Invalid(f"{stage}: failure receipt only applies to a subject stage")
    schema = load_control("schemas.json")["subject_failure_receipt"]
    if failure_kind not in schema["failure_kinds"]:
        raise Invalid(f"{stage}: invalid subject failure kind")
    packet_payload = exact_packet_payload(slot, stage, rendered_path)
    if capture_path(slot, stage).exists() or receipt_path(slot, stage).exists():
        raise Invalid(f"{stage}: subject failure receipt is mutually exclusive with capture/call receipt")
    dispatch_path = wave_event_path(STAGE_WAVE[stage], "dispatch")
    _, dispatch_payload, _ = stored_canonical(dispatch_path, dispatch_path, f"{stage} failure dispatch")
    reservation_payload, reservation = validate_reservation(slot, stage, sha(dispatch_payload))
    creation_payload, creation = validate_creation_metadata(creation_path, slot, stage,
                                                             failure_kind != "TASK_CREATION_ERROR")
    if creation["controller_observed_request"]["rendered_packet_payload_sha256"] != reservation["rendered_packet_payload_sha256"]:
        raise Invalid(f"{stage}: failure creation metadata packet mismatch")
    task_id: str | None; thread_id: str | None; host_id: str | None
    start_payload: bytes | None = None; metadata_payload: bytes | None = None
    start_binding: dict[str, Any] | None = None; metadata_binding: dict[str, Any] | None = None
    if failure_kind == "TASK_CREATION_ERROR":
        if attempt_start_path(slot, stage).exists() or attempt_start_path(slot, stage).is_symlink():
            raise Invalid(f"{stage}: task creation error cannot have attempt-start")
        if platform_path is not None or metadata_path(slot, stage).exists() or metadata_path(slot, stage).is_symlink():
            raise Invalid(f"{stage}: task creation error cannot have post-task metadata")
        task_id = thread_id = host_id = None
        tools = delegations = inputs = 0
    else:
        if platform_path is None:
            raise Invalid(f"{stage}: created-task failure requires post-task platform metadata")
        start_payload, start, _ = validate_attempt_start(slot, stage, sha(dispatch_payload))
        metadata_payload, meta = validate_failure_metadata(platform_path, slot, stage)
        task = creation["platform_creation_observation"]
        new_task = meta["new_task_tool_result"]; reopened = meta["reopened_thread_observation"]
        task_id, thread_id, host_id = task["task_id"], task["thread_id"], task["host_id"]
        if (task_id, thread_id, host_id) != (start["task_id"], start["thread_id"], start["host_id"]) or \
                (task_id, thread_id, host_id) != (new_task["task_id"], new_task["thread_id"], new_task["host_id"]):
            raise Invalid(f"{stage}: failure task identity differs across creation/start/final metadata")
        if reopened["final_output_sha256"] is not None or reopened["final_output_bytes"] != 0:
            raise Invalid(f"{stage}: nonempty final output must use capture and ordinary call receipt")
        tools = reopened["observed_tool_calls"]; delegations = reopened["observed_delegations"]
        inputs = reopened["observed_user_input_requests"]
        start_binding = standard_receipt_binding(attempt_start_path(slot, stage), start_payload)
        metadata_binding = standard_receipt_binding(metadata_path(slot, stage), metadata_payload)
    if failure_kind == "TOOL_ACTIVITY_NO_FINAL" and tools <= 0:
        raise Invalid(f"{stage}: TOOL_ACTIVITY_NO_FINAL lacks observed tool activity")
    if failure_kind == "DELEGATION_NO_FINAL" and (tools != 0 or delegations <= 0):
        raise Invalid(f"{stage}: DELEGATION_NO_FINAL precedence/evidence mismatch")
    if failure_kind == "USER_INPUT_REQUEST_NO_FINAL" and (tools != 0 or delegations != 0 or inputs <= 0):
        raise Invalid(f"{stage}: USER_INPUT_REQUEST_NO_FINAL precedence/evidence mismatch")
    if failure_kind in ("TIMEOUT", "TASK_ERROR", "EMPTY_FINAL_OUTPUT", "NO_FINAL_OUTPUT") and (tools or delegations or inputs):
        raise Invalid(f"{stage}: no-output failure kind loses to prohibited-activity precedence")
    model, thinking = slot_route(slot)
    result = {
        "schema_id": schema["schema_id"], "protocol_id": ID, "slot": slot, "wave_id": STAGE_WAVE[stage], "stage": stage,
        "dispatch_event_sha256": sha(dispatch_payload), "task_id": task_id, "thread_id": thread_id, "host_id": host_id,
        "attempt_reservation": standard_receipt_binding(reservation_path(slot, stage), reservation_payload),
        "attempt_start": start_binding,
        "platform_creation_metadata": standard_receipt_binding(creation_metadata_path(slot, stage), creation_payload),
        "platform_metadata": metadata_binding,
        "controller_requested_model": model, "controller_requested_thinking": thinking,
        "rendered_packet_payload_sha256": sha(packet_payload), "failure_kind": failure_kind,
        "observed_final_output_sha256": None, "observed_final_output_bytes": 0,
        "observed_tool_calls": tools, "observed_delegations": delegations, "observed_user_input_requests": inputs,
        "status": "SUBJECT_FAIL",
    }
    if list(result) != schema["required_keys"]:
        raise Invalid("internal subject failure receipt key/order drift")
    return result


def validate_subject_failure_receipt(slot: str, stage: str, expected_sha: str) -> tuple[bytes, dict[str, Any]]:
    path = subject_failure_path(slot, stage)
    _, payload, receipt = stored_canonical(path, path, f"{stage} subject failure receipt")
    if sha(payload) != expected_sha:
        raise Invalid(f"{stage}: subject failure receipt hash mismatch")
    platform_path = None if receipt.get("failure_kind") == "TASK_CREATION_ERROR" else metadata_path(slot, stage)
    expected = failure_receipt_object(slot, stage, receipt.get("failure_kind"), creation_metadata_path(slot, stage),
                                      platform_path, packet_path(slot, stage))
    require_exact_control_receipt(receipt, payload, expected, f"{stage} subject failure receipt")
    return payload, receipt


def deterministic_evidence(stage: str, slot: str) -> bytes:
    args = canonical_slot_args(slot)
    cap = capture_path(slot, stage)
    _, payload = capture_bytes(cap, cap, f"{slot} {stage} wave artifact")
    expected = transform(stage, args, slot)
    if payload != expected:
        raise Invalid(f"{slot} {stage}: deterministic artifact differs from exact recomputation")
    if stage == "S80":
        validate_write_receipt(args, slot)
        validate_s80_global_guard(slot)
    return payload


def wave_event_path(wave_id: str, event: str) -> Path:
    return RUNS / "cohort" / "waves" / f"{wave_id}.{event}.json"


def assert_no_controller_invalid_latch() -> None:
    root = RUNS / "cohort" / "controller_invalid"
    if root.is_symlink():
        raise Invalid("controller-invalid latch directory is a symlink")
    if not root.exists():
        return
    actual = contained_existing(root, RUNS)
    if not actual.is_dir():
        raise Invalid("controller-invalid latch path is not a regular nonlink directory")
    entries = list(actual.iterdir())
    if entries:
        raise Invalid("controller-invalid latch is set; no runtime-cell action is permitted")


def validate_current_dispatch(path: Path, slot: str, stage: str, launch_sha: str) -> bytes:
    """Admit one cell from its create-once dispatch without needing its completion/index."""
    assert_no_controller_invalid_latch()
    slot_route(slot)
    if stage not in STAGE_WAVE:
        raise Invalid(f"{stage}: no runtime wave")
    current_wave = STAGE_WAVE[stage]
    expected_path = wave_event_path(current_wave, "dispatch")
    schemas = load_control("schemas.json")
    dispatch_schema = schemas["cohort_wave_dispatch_event"]
    completion_schema = schemas["cohort_wave_completion_event"]
    active = list(ROUTES); prior_completion_sha: str | None = None
    prior_tasks: set[str] = set(); prior_threads: set[str] = set(); prior_hosts: set[str] = set()
    current_payload = b""
    for wave_id, stages in WAVE_REGISTRY:
        dispatch_path = wave_event_path(wave_id, "dispatch")
        supplied = path if wave_id == current_wave else dispatch_path
        _, dispatch_payload, dispatch = stored_canonical(supplied, dispatch_path, f"{wave_id} dispatch admission")
        if (list(dispatch) != dispatch_schema["required_keys"] or dispatch.get("schema_id") != dispatch_schema["schema_id"] or
                (dispatch.get("protocol_id"), dispatch.get("wave_id"), dispatch.get("kind"),
                 dispatch.get("prior_completion_event_sha256"), dispatch.get("launch_source_receipt_sha256"), dispatch.get("status")) !=
                (ID, wave_id, WAVE_KIND[wave_id], prior_completion_sha, launch_sha, "DISPATCH_RECORDED")):
            raise Invalid(f"{wave_id}: intrinsic dispatch identity/chain mismatch")
        expected_cells = [(active_slot, active_stage) for active_slot in active for active_stage in stages]
        dispatch_set = dispatch.get("dispatch_set")
        if not isinstance(dispatch_set, list) or not dispatch_set or len(dispatch_set) != len(expected_cells):
            raise Invalid(f"{wave_id}: dispatch set is not the exact active-cell cross-product")
        for row, cell in zip(dispatch_set, expected_cells):
            require_object_keys(row, dispatch_schema["dispatch_item_keys"], f"{wave_id} dispatch item")
            if (row.get("slot"), row.get("stage")) != cell or row.get("task_id") is not None or row.get("thread_id") is not None:
                raise Invalid(f"{wave_id}: dispatch item order/identity/pre-task-null mismatch")
        if wave_id == current_wave:
            if (slot, stage) not in expected_cells:
                raise Invalid(f"{slot} {stage}: cell is not admitted by current dispatch")
            current_payload = dispatch_payload
            break
        completion_path = wave_event_path(wave_id, "completion")
        _, completion_payload, completion = stored_canonical(completion_path, completion_path, f"{wave_id} prior completion")
        if (list(completion) != completion_schema["required_keys"] or completion.get("schema_id") != completion_schema["schema_id"] or
                (completion.get("protocol_id"), completion.get("wave_id"), completion.get("kind"), completion.get("dispatch_event_sha256")) !=
                (ID, wave_id, WAVE_KIND[wave_id], sha(dispatch_payload))):
            raise Invalid(f"{wave_id}: prior completion identity/dispatch mismatch")
        rows = completion.get("completion_set")
        if not isinstance(rows, list) or len(rows) != len(dispatch_set):
            raise Invalid(f"{wave_id}: prior dispatch/completion bijection mismatch")
        failed: set[str] = set(); invalid = False
        for dispatched, row in zip(dispatch_set, rows):
            require_object_keys(row, completion_schema["completion_item_keys"], f"{wave_id} prior completion item")
            if (row.get("slot"), row.get("stage")) != (dispatched["slot"], dispatched["stage"]):
                raise Invalid(f"{wave_id}: prior completion order/identity mismatch")
            prior_slot = row["slot"]; prior_stage = row["stage"]; status = row.get("status")
            if status in ("PASS", "FAIL") and prior_stage in SUBJECT:
                failure_hash = row.get("subject_failure_receipt_sha256")
                if failure_hash is not None:
                    if status != "FAIL" or row.get("artifact_payload_sha256") is not None or row.get("call_receipt_sha256") is not None:
                        raise Invalid(f"{wave_id}: prior subject failure receipt exclusivity mismatch")
                    _, failure = validate_subject_failure_receipt(prior_slot, prior_stage,
                                                                  require_hex(failure_hash, f"{wave_id} prior subject failure"))
                    if (row.get("task_id"), row.get("thread_id")) != (failure["task_id"], failure["thread_id"]):
                        raise Invalid(f"{wave_id}: prior subject failure identity mismatch")
                    failure_start_sha = None if failure["attempt_start"] is None else failure["attempt_start"]["payload_sha256"]
                    if row.get("attempt_start_receipt_sha256") != failure_start_sha:
                        raise Invalid(f"{wave_id}: prior subject failure attempt-start mismatch")
                    if failure["task_id"] is not None:
                        claim_global_identity(failure["task_id"], failure["thread_id"], failure["host_id"],
                                              prior_tasks, prior_threads, prior_hosts, wave_id)
                else:
                    verdict, artifact_payload, receipt_payload, receipt = subject_evidence_verdict(prior_stage, prior_slot)
                    if (status, row.get("artifact_payload_sha256"), row.get("call_receipt_sha256"),
                        row.get("task_id"), row.get("thread_id"), row.get("attempt_start_receipt_sha256")) != \
                            (verdict, sha(artifact_payload), sha(receipt_payload), receipt["task_id"], receipt["thread_id"],
                             receipt["attempt_start"]["payload_sha256"]):
                        raise Invalid(f"{wave_id}: prior subject completion differs from exact evidence")
                    claim_global_identity(receipt["task_id"], receipt["thread_id"], receipt["host_id"],
                                          prior_tasks, prior_threads, prior_hosts, wave_id)
                if row.get("controller_invalid_receipt_sha256") is not None:
                    raise Invalid(f"{wave_id}: prior subject completion claims INVALID")
                if status == "FAIL": failed.add(prior_slot)
            elif status == "PASS" and prior_stage in DETERMINISTIC:
                artifact_payload = deterministic_evidence(prior_stage, prior_slot)
                if (row.get("artifact_payload_sha256") != sha(artifact_payload) or
                        any(row.get(field) is not None for field in ("call_receipt_sha256", "task_id", "thread_id",
                                                                   "attempt_start_receipt_sha256", "subject_failure_receipt_sha256",
                                                                   "controller_invalid_receipt_sha256"))):
                    raise Invalid(f"{wave_id}: prior deterministic completion differs from exact evidence")
            elif status == "INVALID":
                invalid = True
            else:
                raise Invalid(f"{wave_id}: prior completion status invalid")
        derived = "INVALID" if invalid else "SUBJECT_FAIL" if failed else "PASS"
        if completion.get("status") != derived or invalid:
            raise Invalid(f"{wave_id}: prior cohort INVALID or derived status mismatch")
        active = [active_slot for active_slot in active if active_slot not in failed]
        prior_completion_sha = sha(completion_payload)
    if not current_payload:
        raise Invalid(f"{slot} {stage}: current dispatch was not reached")
    return current_payload


def assert_subject_cell_pristine(slot: str, stage: str) -> None:
    paths = (reservation_path(slot, stage), attempt_start_path(slot, stage), capture_path(slot, stage),
             receipt_path(slot, stage), subject_failure_path(slot, stage), creation_metadata_path(slot, stage),
             metadata_path(slot, stage))
    for path in paths:
        if path.exists() or path.is_symlink():
            raise Invalid(f"{slot} {stage}: pre-call custody already exists at {path.name}")
    completion = wave_event_path(STAGE_WAVE[stage], "completion")
    if completion.exists() or completion.is_symlink():
        raise Invalid(f"{slot} {stage}: wave completion already exists before reservation")


def assert_subject_render_pristine(slot: str, stage: str) -> None:
    for path in (packet_path(slot, stage), reservation_path(slot, stage), creation_metadata_path(slot, stage),
                 attempt_start_path(slot, stage), metadata_path(slot, stage), capture_path(slot, stage),
                 receipt_path(slot, stage), subject_failure_path(slot, stage)):
        if path.exists() or path.is_symlink():
            raise Invalid(f"{slot} {stage}: pre-render custody already exists at {path.name}")
    completion = wave_event_path(STAGE_WAVE[stage], "completion")
    if completion.exists() or completion.is_symlink():
        raise Invalid(f"{slot} {stage}: wave completion already exists before render")


def validate_creation_metadata(path: Path, slot: str, stage: str, require_ids: bool) -> tuple[bytes, dict[str, Any]]:
    expected = creation_metadata_path(slot, stage)
    _, payload, meta = stored_canonical(path, expected, f"{stage} platform creation metadata")
    schema = load_control("schemas.json")["platform_creation_metadata"]
    if list(meta) != schema["required_keys"] or meta.get("schema_id") != schema["schema_id"]:
        raise Invalid(f"{stage}: platform creation metadata schema/key order mismatch")
    request = require_object_keys(meta.get("controller_observed_request"), schema["controller_request_keys"], f"{stage} creation request")
    result = require_object_keys(meta.get("platform_creation_observation"), schema["creation_observation_keys"], f"{stage} creation observation")
    model, thinking = slot_route(slot)
    if ((meta.get("protocol_id"), meta.get("slot"), meta.get("stage"), request.get("requested_model"),
         request.get("requested_thinking"), request.get("projectless")) != (ID, slot, stage, model, thinking, True)):
        raise Invalid(f"{stage}: platform creation metadata route mismatch")
    require_hex(request.get("rendered_packet_payload_sha256"), f"{stage} creation packet hash")
    if require_ids:
        if result.get("result") != "CREATED" or result.get("error_type") is not None or result.get("error_message") is not None:
            raise Invalid(f"{stage}: attempt start requires a fresh created task")
        for field in ("task_id", "thread_id", "host_id"):
            value = result.get(field)
            if not isinstance(value, str) or not value.strip() or len(value) > 256:
                raise Invalid(f"{stage}: creation metadata {field} invalid")
    else:
        if (result.get("result") != "ERROR" or any(result.get(field) is not None for field in ("task_id", "thread_id", "host_id")) or
                not isinstance(result.get("error_type"), str) or not result["error_type"].strip() or
                not isinstance(result.get("error_message"), str) or not result["error_message"].strip()):
            raise Invalid(f"{stage}: TASK_CREATION_ERROR metadata must have no returned identities")
    return payload, meta


def exact_packet_payload(slot: str, stage: str, supplied: Path) -> bytes:
    expected = packet_path(slot, stage)
    actual = contained_existing(supplied, RUNS)
    if actual != Path(os.path.abspath(os.fspath(expected))):
        raise Invalid(f"{stage}: rendered packet normalized path mismatch")
    storage = read(actual)
    if not storage.endswith(b"\n"):
        raise Invalid(f"{stage}: rendered packet lacks controller LF")
    rendered, _ = render_packet(stage, canonical_slot_args(slot), slot)
    if storage[:-1] != rendered:
        raise Invalid(f"{stage}: rendered packet differs from exact render")
    return rendered


def make_attempt_reservation(args: argparse.Namespace, slot: str) -> bytes:
    stage = args.stage
    if stage not in SUBJECT: raise Invalid(f"{stage}: reservation applies only to subject stages")
    assert_subject_cell_pristine(slot, stage)
    dispatch_payload = validate_current_dispatch(Path(args.wave_dispatch_receipt), slot, stage, args._launch_sha)
    packet = exact_packet_payload(slot, stage, Path(args.rendered_packet))
    schema = load_control("schemas.json")["subject_attempt_reservation"]
    result = {"schema_id": schema["schema_id"], "protocol_id": ID, "slot": slot, "wave_id": STAGE_WAVE[stage],
              "stage": stage, "dispatch_event_sha256": sha(dispatch_payload), "rendered_packet_payload_sha256": sha(packet),
              "task_id": None, "thread_id": None, "host_id": None, "status": "RESERVED"}
    if list(result) != schema["required_keys"]: raise Invalid("internal reservation key/order drift")
    return dump(result)


def validate_reservation(slot: str, stage: str, expected_dispatch_sha: str) -> tuple[bytes, dict[str, Any]]:
    path = reservation_path(slot, stage)
    _, payload, obj = stored_canonical(path, path, f"{stage} attempt reservation")
    schema = load_control("schemas.json")["subject_attempt_reservation"]
    if list(obj) != schema["required_keys"] or obj.get("schema_id") != schema["schema_id"]:
        raise Invalid(f"{stage}: attempt reservation schema/key order mismatch")
    packet = exact_packet_payload(slot, stage, packet_path(slot, stage))
    expected = {"schema_id": schema["schema_id"], "protocol_id": ID, "slot": slot, "wave_id": STAGE_WAVE[stage],
                "stage": stage, "dispatch_event_sha256": expected_dispatch_sha, "rendered_packet_payload_sha256": sha(packet),
                "task_id": None, "thread_id": None, "host_id": None, "status": "RESERVED"}
    require_exact_control_receipt(obj, payload, expected, f"{stage} attempt reservation")
    return payload, obj


def make_attempt_start(args: argparse.Namespace, slot: str) -> bytes:
    stage = args.stage
    if attempt_start_path(slot, stage).exists() or attempt_start_path(slot, stage).is_symlink():
        raise Invalid(f"{stage}: attempt-start already exists")
    for path in (capture_path(slot, stage), receipt_path(slot, stage), subject_failure_path(slot, stage)):
        if path.exists() or path.is_symlink(): raise Invalid(f"{stage}: result evidence exists before attempt-start")
    if wave_event_path(STAGE_WAVE[stage], "completion").exists(): raise Invalid(f"{stage}: completion exists before attempt-start")
    dispatch_payload = validate_current_dispatch(Path(args.wave_dispatch_receipt), slot, stage, args._launch_sha)
    reservation_payload, reservation = validate_reservation(slot, stage, sha(dispatch_payload))
    creation_payload, creation = validate_creation_metadata(Path(args.platform_creation_metadata), slot, stage, True)
    task = creation["platform_creation_observation"]
    if creation["controller_observed_request"]["rendered_packet_payload_sha256"] != reservation["rendered_packet_payload_sha256"]:
        raise Invalid(f"{stage}: creation metadata packet hash differs from reservation")
    schema = load_control("schemas.json")["subject_attempt_start"]
    result = {"schema_id": schema["schema_id"], "protocol_id": ID, "slot": slot, "wave_id": STAGE_WAVE[stage], "stage": stage,
              "dispatch_event_sha256": sha(dispatch_payload), "reservation_payload_sha256": sha(reservation_payload),
              "rendered_packet_payload_sha256": reservation["rendered_packet_payload_sha256"],
              "task_id": task["task_id"], "thread_id": task["thread_id"], "host_id": task["host_id"],
              "platform_creation_metadata_payload_sha256": sha(creation_payload), "status": "ATTEMPT_STARTED"}
    if list(result) != schema["required_keys"]: raise Invalid("internal attempt-start key/order drift")
    return dump(result)


def validate_attempt_start(slot: str, stage: str, expected_dispatch_sha: str) -> tuple[bytes, dict[str, Any], bytes]:
    reservation_payload, reservation = validate_reservation(slot, stage, expected_dispatch_sha)
    path = attempt_start_path(slot, stage)
    _, payload, obj = stored_canonical(path, path, f"{stage} attempt start")
    schema = load_control("schemas.json")["subject_attempt_start"]
    creation_payload, creation = validate_creation_metadata(creation_metadata_path(slot, stage), slot, stage, True)
    task = creation["platform_creation_observation"]
    if creation["controller_observed_request"]["rendered_packet_payload_sha256"] != reservation["rendered_packet_payload_sha256"]:
        raise Invalid(f"{stage}: attempt-start creation packet binding mismatch")
    expected = {"schema_id": schema["schema_id"], "protocol_id": ID, "slot": slot, "wave_id": STAGE_WAVE[stage], "stage": stage,
                "dispatch_event_sha256": expected_dispatch_sha, "reservation_payload_sha256": sha(reservation_payload),
                "rendered_packet_payload_sha256": reservation["rendered_packet_payload_sha256"],
                "task_id": task["task_id"], "thread_id": task["thread_id"], "host_id": task["host_id"],
                "platform_creation_metadata_payload_sha256": sha(creation_payload), "status": "ATTEMPT_STARTED"}
    if list(obj) != schema["required_keys"] or obj.get("schema_id") != schema["schema_id"]:
        raise Invalid(f"{stage}: attempt-start schema/key order mismatch")
    require_exact_control_receipt(obj, payload, expected, f"{stage} attempt start")
    return payload, obj, reservation_payload


def claim_global_identity(task_id: str, thread_id: str, host_id: str, task_ids: set[str], thread_ids: set[str],
                          host_ids: set[str], label: str) -> None:
    if (not all(isinstance(value, str) and value.strip() for value in (task_id, thread_id, host_id)) or
            task_id in task_ids or thread_id in thread_ids):
        raise Invalid(f"{label}: empty task/thread/host identity or global cross-slot task/thread replay")
    task_ids.add(task_id); thread_ids.add(thread_id); host_ids.add(host_id)


def validate_wave_ledger(wave_index: Path, launch_sha: str, index_override: dict[str, Any] | None = None,
                         allow_incomplete: bool = False, allowed_unindexed: set[Path] | None = None) -> dict[str, Any]:
    expected_index = RUNS / "cohort" / "cohort_wave_index.json"
    if index_override is None:
        _, index_payload, index = stored_canonical(wave_index, expected_index, "cohort wave index")
    else:
        index = index_override
        index_payload = dump(index)
    allowed_unindexed = allowed_unindexed or set()
    schemas = load_control("schemas.json")
    index_schema = schemas["cohort_wave_ledger"]
    if list(index) != index_schema["required_keys"] or index.get("schema_id") != index_schema["schema_id"]:
        raise Invalid("cohort wave index schema/key order mismatch")
    if index.get("protocol_id") != ID or index.get("launch_source_receipt_sha256") != launch_sha:
        raise Invalid("cohort wave index identity/launch binding mismatch")
    waves = index.get("waves")
    if not isinstance(waves, list):
        raise Invalid("cohort wave index waves must be an array")
    order = [wave for wave, _ in WAVE_REGISTRY]
    if len(waves) > len(order):
        raise Invalid("cohort wave index contains excess waves")
    active = list(ROUTES); stopped_fail: set[str] = set(); completions: dict[tuple[str, str], dict[str, Any]] = {}
    global_tasks: set[str] = set(); global_threads: set[str] = set(); global_hosts: set[str] = set()
    expected_reservations: set[Path] = set(); expected_starts: set[Path] = set()
    invalid_sha: str | None = None; prior_completion_sha: str | None = None
    dispatch_schema = schemas["cohort_wave_dispatch_event"]
    completion_schema = schemas["cohort_wave_completion_event"]
    reached_paths: set[Path] = set()
    for position, item in enumerate(waves):
        require_object_keys(item, index_schema["wave_item_keys"], f"wave index item {position}")
        wave_id = order[position]
        if item.get("wave_id") != wave_id:
            raise Invalid("cohort wave index is not a contiguous ordered prefix")
        stages = dict(WAVE_REGISTRY)[wave_id]; kind = WAVE_KIND[wave_id]
        dispatch_path = wave_event_path(wave_id, "dispatch"); completion_path = wave_event_path(wave_id, "completion")
        reached_paths.update((dispatch_path, completion_path))
        _, dispatch_payload, dispatch = stored_canonical(dispatch_path, dispatch_path, f"{wave_id} dispatch")
        _, completion_payload, completion = stored_canonical(completion_path, completion_path, f"{wave_id} completion")
        if sha(dispatch_payload) != item.get("dispatch_event_sha256") or sha(completion_payload) != item.get("completion_event_sha256"):
            raise Invalid(f"{wave_id}: index event hash mismatch")
        if (list(dispatch) != dispatch_schema["required_keys"] or dispatch.get("schema_id") != dispatch_schema["schema_id"] or
                (dispatch.get("protocol_id"), dispatch.get("wave_id"), dispatch.get("kind"), dispatch.get("prior_completion_event_sha256"),
                 dispatch.get("launch_source_receipt_sha256"), dispatch.get("status")) !=
                (ID, wave_id, kind, prior_completion_sha, launch_sha, "DISPATCH_RECORDED")):
            raise Invalid(f"{wave_id}: dispatch event identity/chain mismatch")
        expected_cells = [(slot, stage) for slot in active for stage in stages]
        dispatch_set = dispatch.get("dispatch_set")
        if not isinstance(dispatch_set, list) or len(dispatch_set) != len(expected_cells) or not dispatch_set:
            raise Invalid(f"{wave_id}: dispatch set does not equal active cohort cross-product")
        for row, (slot, stage) in zip(dispatch_set, expected_cells):
            require_object_keys(row, dispatch_schema["dispatch_item_keys"], f"{wave_id} dispatch item")
            if (row.get("slot"), row.get("stage"), row.get("task_id"), row.get("thread_id")) != (slot, stage, None, None):
                raise Invalid(f"{wave_id}: dispatch item identity/order/pre-task-null mismatch")
        if (list(completion) != completion_schema["required_keys"] or completion.get("schema_id") != completion_schema["schema_id"] or
                (completion.get("protocol_id"), completion.get("wave_id"), completion.get("kind"), completion.get("dispatch_event_sha256")) !=
                (ID, wave_id, kind, sha(dispatch_payload))):
            raise Invalid(f"{wave_id}: completion event identity/dispatch binding mismatch")
        completion_set = completion.get("completion_set")
        if not isinstance(completion_set, list) or len(completion_set) != len(dispatch_set):
            raise Invalid(f"{wave_id}: dispatch/completion bijection mismatch")
        wave_failed: set[str] = set(); wave_invalids: set[str] = set()
        for dispatch_row, row in zip(dispatch_set, completion_set):
            require_object_keys(row, completion_schema["completion_item_keys"], f"{wave_id} completion item")
            slot = dispatch_row["slot"]; stage = dispatch_row["stage"]
            if (row.get("slot"), row.get("stage")) != (slot, stage) or (slot, stage) in completions:
                raise Invalid(f"{wave_id}: completion identity/retry mismatch")
            status = row.get("status")
            if stage in SUBJECT and status != "INVALID":
                validate_reservation(slot, stage, sha(dispatch_payload))
                expected_reservations.add(reservation_path(slot, stage))
            if status in ("PASS", "FAIL") and stage in SUBJECT:
                failure_hash = row.get("subject_failure_receipt_sha256")
                if failure_hash is not None:
                    if status != "FAIL" or row.get("artifact_payload_sha256") is not None or row.get("call_receipt_sha256") is not None:
                        raise Invalid(f"{wave_id} {slot} {stage}: subject failure receipt exclusivity mismatch")
                    failure_hash = require_hex(failure_hash, f"{wave_id} subject failure receipt")
                    _, failure = validate_subject_failure_receipt(slot, stage, failure_hash)
                    if (row.get("task_id"), row.get("thread_id")) != (failure["task_id"], failure["thread_id"]):
                        raise Invalid(f"{wave_id} {slot} {stage}: subject failure task/thread mismatch")
                    failure_start_sha = None if failure["attempt_start"] is None else failure["attempt_start"]["payload_sha256"]
                    if row.get("attempt_start_receipt_sha256") != failure_start_sha:
                        raise Invalid(f"{wave_id} {slot} {stage}: subject failure attempt-start mismatch")
                    if failure_start_sha is not None:
                        expected_starts.add(attempt_start_path(slot, stage))
                    if row.get("controller_invalid_receipt_sha256") is not None:
                        raise Invalid(f"{wave_id} {slot} {stage}: subject failure claims invalid receipt")
                    if failure["task_id"] is not None:
                        claim_global_identity(failure["task_id"], failure["thread_id"], failure["host_id"],
                                              global_tasks, global_threads, global_hosts, wave_id)
                    wave_failed.add(slot)
                else:
                    verdict, artifact_payload, rec_payload, rec = subject_evidence_verdict(stage, slot)
                    if status != verdict or row.get("artifact_payload_sha256") != sha(artifact_payload) or row.get("call_receipt_sha256") != sha(rec_payload):
                        raise Invalid(f"{wave_id} {slot} {stage}: completion disagrees with exact subject score")
                    if (row.get("task_id"), row.get("thread_id")) != (rec["task_id"], rec["thread_id"]):
                        raise Invalid(f"{wave_id} {slot} {stage}: completion task/thread mismatch")
                    if row.get("attempt_start_receipt_sha256") != rec["attempt_start"]["payload_sha256"]:
                        raise Invalid(f"{wave_id} {slot} {stage}: completion attempt-start mismatch")
                    expected_starts.add(attempt_start_path(slot, stage))
                    if row.get("controller_invalid_receipt_sha256") is not None:
                        raise Invalid(f"{wave_id} {slot} {stage}: subject result claims invalid receipt")
                    claim_global_identity(rec["task_id"], rec["thread_id"], rec["host_id"],
                                          global_tasks, global_threads, global_hosts, wave_id)
                    if status == "FAIL": wave_failed.add(slot)
            elif status == "PASS" and stage in DETERMINISTIC:
                artifact_payload = deterministic_evidence(stage, slot)
                if (row.get("artifact_payload_sha256") != sha(artifact_payload) or row.get("call_receipt_sha256") is not None or
                        row.get("task_id") is not None or row.get("thread_id") is not None or
                        row.get("attempt_start_receipt_sha256") is not None or row.get("subject_failure_receipt_sha256") is not None or
                        row.get("controller_invalid_receipt_sha256") is not None):
                    raise Invalid(f"{wave_id} {slot} {stage}: deterministic completion binding mismatch")
            elif status == "INVALID":
                invalid_hash = require_hex(row.get("controller_invalid_receipt_sha256"), f"{wave_id} invalid receipt hash")
                if any(row.get(field) is not None for field in ("artifact_payload_sha256", "call_receipt_sha256", "task_id", "thread_id",
                                                                "attempt_start_receipt_sha256", "subject_failure_receipt_sha256")):
                    raise Invalid(f"{wave_id} {slot} {stage}: INVALID trusts runtime evidence")
                _, invalid_receipt = validate_controller_invalid_receipt(wave_id, invalid_hash)
                receipt_cell = (invalid_receipt.get("slot"), invalid_receipt.get("stage"))
                if receipt_cell != (None, None) and receipt_cell != (slot, stage):
                    raise Invalid(f"{wave_id} {slot} {stage}: invalid receipt cell binding mismatch")
                wave_invalids.add(invalid_hash)
                start_path = attempt_start_path(slot, stage)
                if stage in SUBJECT and (start_path.exists() or start_path.is_symlink()):
                    validate_attempt_start(slot, stage, sha(dispatch_payload))
                    expected_starts.add(start_path)
            else:
                raise Invalid(f"{wave_id} {slot} {stage}: invalid completion status/type")
            completions[(slot, stage)] = row
        expected_wave_status = "INVALID" if wave_invalids else "SUBJECT_FAIL" if wave_failed else "PASS"
        if completion.get("status") != expected_wave_status or item.get("status") != expected_wave_status:
            raise Invalid(f"{wave_id}: derived wave status mismatch")
        if len(wave_invalids) > 1:
            raise Invalid(f"{wave_id}: multiple controller-invalid receipts")
        prior_completion_sha = sha(completion_payload)
        if wave_invalids:
            invalid_sha = next(iter(wave_invalids))
            if position != len(waves) - 1:
                raise Invalid(f"{wave_id}: later wave exists after cohort INVALID")
            active = []
        else:
            stopped_fail.update(wave_failed)
            active = [slot for slot in active if slot not in wave_failed]
            if not active and position != len(waves) - 1:
                raise Invalid(f"{wave_id}: later wave exists after all slots stopped")
    if waves:
        if not allow_incomplete and active and invalid_sha is None and len(waves) != len(order):
            raise Invalid("cohort wave index ends while active configurations remain")
    elif not allow_incomplete:
        raise Invalid("normal cohort wave index cannot be empty; W00 has no index")
    if allow_incomplete:
        return {"index_payload": index_payload, "index_sha256": sha(index_payload), "completions": completions,
                "stopped_fail": stopped_fail, "invalid_sha256": invalid_sha,
                "reached_s80": {slot for slot in ROUTES if completions.get((slot, "S80"), {}).get("status") == "PASS"},
                "task_ids": global_tasks, "thread_ids": global_threads, "host_ids": global_hosts}
    wave_root = RUNS / "cohort" / "waves"
    if wave_root.is_symlink():
        raise Invalid("cohort wave directory symlink forbidden")
    if wave_root.exists():
        root = contained_existing(wave_root, RUNS)
        for path in root.iterdir():
            if path.is_symlink() or not path.is_file() or (path not in reached_paths and path not in allowed_unindexed):
                raise Invalid(f"unindexed, nonregular, or symlink wave event: {path.name}")
    invalid_root = RUNS / "cohort" / "controller_invalid"
    if invalid_root.is_symlink():
        raise Invalid("controller-invalid directory symlink forbidden")
    if invalid_root.exists():
        root = contained_existing(invalid_root, RUNS)
        invalid_files = list(root.iterdir())
        if any(path.is_symlink() or not path.is_file() for path in invalid_files) or len(invalid_files) > 1:
            raise Invalid("controller-invalid custody must contain at most one regular receipt")
        if invalid_files:
            _, ipayload, invalid_obj = stored_canonical(invalid_files[0], invalid_files[0], "cohort controller-invalid receipt")
            observed = sha(ipayload)
            if invalid_sha is not None and observed != invalid_sha:
                raise Invalid("controller-invalid receipt differs from runtime invalid binding")
            invalid_sha = observed
            validate_controller_invalid_receipt(invalid_obj.get("wave_id"), observed)
    observed_reservations: set[Path] = set(); observed_starts: set[Path] = set()
    for slot in ROUTES:
        attempt_root = RUNS / slot / "attempts"
        if attempt_root.is_symlink():
            raise Invalid(f"{slot}: attempts directory symlink forbidden")
        if not attempt_root.exists():
            continue
        root = contained_existing(attempt_root, RUNS)
        for path in root.iterdir():
            if path.is_symlink() or not path.is_file():
                raise Invalid(f"{slot}: attempt custody entry is not a regular nonlink file")
            if path.name.endswith(".reservation.json"):
                observed_reservations.add(path)
            elif path.name.endswith(".start.json"):
                observed_starts.add(path)
            else:
                raise Invalid(f"{slot}: unrecognized attempt custody file {path.name}")
    allowed_reservations = {path for path in allowed_unindexed if path.name.endswith(".reservation.json")}
    allowed_starts = {path for path in allowed_unindexed if path.name.endswith(".start.json")}
    if ((observed_reservations - allowed_reservations) != expected_reservations or
            (observed_starts - allowed_starts) != expected_starts):
        raise Invalid("attempt reservation/start enumeration differs from reached subject cells")
    if not allow_incomplete and invalid_sha is None:
        validate_exact_normal_stage_evidence(completions)
        validate_normal_cohort_structure()
    return {"index_payload": index_payload, "index_sha256": sha(index_payload), "completions": completions,
            "stopped_fail": stopped_fail, "invalid_sha256": invalid_sha,
            "reached_s80": {slot for slot in ROUTES if completions.get((slot, "S80"), {}).get("status") == "PASS"},
            "task_ids": global_tasks, "thread_ids": global_threads, "host_ids": global_hosts}


def validate_result_manifest(slot: str, launch_sha: str, wave: dict[str, Any]) -> tuple[bytes, dict[str, Any]]:
    path = RUNS / slot / "result_manifest.json"
    _, payload, manifest = stored_canonical(path, path, f"{slot} result manifest")
    schema = load_control("schemas.json")["result_manifest"]
    if list(manifest) != schema["required_keys"] or manifest.get("schema_id") != schema["schema_id"]:
        raise Invalid(f"{slot}: result manifest schema/key order mismatch")
    model, thinking = slot_route(slot)
    if (manifest.get("protocol_id"), manifest.get("slot"), manifest.get("model"), manifest.get("thinking"),
        manifest.get("launch_source_receipt_sha256"), manifest.get("cohort_wave_ledger_sha256"),
        manifest.get("controller_invalid_receipt_sha256")) != (ID, slot, model, thinking, launch_sha,
                                                                wave["index_sha256"], None):
        raise Invalid(f"{slot}: result manifest identity/launch binding mismatch")
    rows = manifest.get("stage_results")
    if not isinstance(rows, list) or len(rows) != len(RESULT_STAGES):
        raise Invalid(f"{slot}: result manifest must account for every stage")
    seen_fail = False
    for index, row in enumerate(rows):
        require_object_keys(row, schema["stage_result_keys"], f"{slot} result row {index}")
        stage = RESULT_STAGES[index]
        if row.get("stage") != stage or row.get("status") not in ("PASS", "FAIL", "INVALID", "SKIPPED_AFTER_SUBJECT_FAIL", "SKIPPED_AFTER_COHORT_INVALID"):
            raise Invalid(f"{slot}: result row order/status mismatch at {stage}")
        completion = wave["completions"].get((slot, stage))
        if completion is not None:
            for field in ("status", "artifact_payload_sha256", "call_receipt_sha256", "subject_failure_receipt_sha256", "controller_invalid_receipt_sha256"):
                if row.get(field) != completion.get(field):
                    raise Invalid(f"{slot}: result row differs from validated wave completion at {stage}")
            if row["status"] == "FAIL": seen_fail = True
        else:
            expected_skip = "SKIPPED_AFTER_COHORT_INVALID" if wave["invalid_sha256"] else "SKIPPED_AFTER_SUBJECT_FAIL"
            if row["status"] != expected_skip or any(row.get(field) is not None for field in
                    ("artifact_payload_sha256", "call_receipt_sha256", "subject_failure_receipt_sha256", "controller_invalid_receipt_sha256")):
                raise Invalid(f"{slot}: invalid undispatched disposition at {stage}")
            for evidence_path in stage_evidence_paths(slot, stage):
                if evidence_path.exists() or evidence_path.is_symlink():
                    raise Invalid(f"{slot}: evidence exists for undispatched stage {stage}: {evidence_path.name}")
            if stage == "S80" and ((SANDBOXES / slot).exists() or (SANDBOXES / slot).is_symlink()):
                raise Invalid(f"{slot}: sandbox exists for undispatched S80")
    terminal = manifest.get("terminal_status")
    if wave["invalid_sha256"] is not None:
        raise Invalid("normal result manifest path forbidden for cohort INVALID")
    expected_terminal = "FIRST_ATTEMPT_FAIL" if slot in wave["stopped_fail"] else "FIRST_ATTEMPT_PASS"
    if terminal != expected_terminal or (terminal == "FIRST_ATTEMPT_FAIL" and not seen_fail):
        raise Invalid(f"{slot}: terminal status differs from validated wave evidence")
    reached_s80 = any(row["stage"] == "S80" and row["status"] == "PASS" for row in rows)
    if reached_s80:
        pre_payload, guard_payload = validate_s80_global_guard(slot)
        if manifest.get("s80_global_pre_sha256") != sha(pre_payload) or manifest.get("s80_global_guard_sha256") != sha(guard_payload):
            raise Invalid(f"{slot}: result manifest S80 global guard binding mismatch")
    elif manifest.get("s80_global_pre_sha256") is not None or manifest.get("s80_global_guard_sha256") is not None:
        raise Invalid(f"{slot}: result manifest claims S80 global guard before reaching S80")
    return payload, manifest


def cohort_close(args: argparse.Namespace, launch_sha: str) -> bytes:
    if (RUNS / "cohort" / "controller_invalid_close.json").exists() or (RUNS / "cohort" / "controller_invalid_close.json").is_symlink():
        raise Invalid("normal cohort close cannot coexist with controller-invalid-close")
    invalid_root = RUNS / "cohort" / "controller_invalid"
    if invalid_root.exists() and any(invalid_root.iterdir()):
        raise Invalid("normal cohort close forbidden after any controller-invalid receipt")
    observation_root = RUNS / "cohort" / "controller_invalid_observations"
    if observation_root.exists() and any(observation_root.iterdir()):
        raise Invalid("normal cohort close forbidden after any controller gate observation")
    if (RUNS / "cohort" / "cohort_close.json").exists() or (RUNS / "cohort" / "cohort_close.json").is_symlink():
        raise Invalid("normal cohort close is create-once")
    close_expected = ROOT / "source_checks" / "close.json"
    close_payload, close_receipt = validate_source_receipt(Path(args.close_source_receipt), "close", close_expected)
    if close_receipt.get("launch_receipt_sha256") != launch_sha:
        raise Invalid("close source receipt is not bound to the sealed launch receipt")
    wave = validate_wave_ledger(Path(args.wave_index), launch_sha)
    results = []
    statuses = []
    for slot in ROUTES:
        payload, manifest = validate_result_manifest(slot, launch_sha, wave)
        statuses.append(manifest["terminal_status"])
        results.append({"slot": slot, "result_manifest_sha256": sha(payload), "terminal_status": manifest["terminal_status"]})
    final_manifest = sandbox_manifest()
    captures: dict[str, bytes] = {}
    for slot in wave["reached_s80"]:
        cap = capture_path(slot, "S80")
        capture_storage_bytes, _ = capture_bytes(cap, cap, f"{slot} final S80 capture")
        target_storage = read(contained_existing(SANDBOXES / slot / "repaired_integration.json", SANDBOXES))
        if target_storage != capture_storage_bytes:
            raise Invalid(f"{slot}: final sandbox target differs from validated S80 capture")
        captures[slot] = capture_storage_bytes
    validate_final_sandbox_manifest(final_manifest, captures)
    terminal = ("INVALID" if wave["invalid_sha256"] is not None else
                "VALID_COMPLETE_WITH_ONE_OR_MORE_FIRST_ATTEMPT_FAIL" if "FIRST_ATTEMPT_FAIL" in statuses else
                "VALID_COMPLETE_WITH_ALL_PASS")
    result = {"schema_id": "pw-r4-cohort-close-v1", "protocol_id": ID,
              "launch_source_receipt_sha256": launch_sha, "close_source_receipt_sha256": sha(close_payload),
              "cohort_wave_ledger_sha256": wave["index_sha256"],
              "controller_invalid_receipt_sha256": wave["invalid_sha256"],
              "config_results": results, "terminal_status": terminal,
              "claim_boundary": "bounded_causal_simulation_cohort_only", "external_audit_status": "excluded"}
    schema = load_control("schemas.json")["cohort_close"]
    if list(result) != schema["required_keys"] or any(list(row) != schema["config_result_keys"] for row in results):
        raise Invalid("internal cohort-close schema/key order drift")
    return dump(result)


def standard_runtime_paths() -> tuple[set[str], set[str]]:
    directories = {normalized(RUNS), normalized(SANDBOXES), normalized(RUNS / "cohort"),
                   normalized(RUNS / "cohort" / "waves"), normalized(RUNS / "cohort" / "controller_invalid"),
                   normalized(RUNS / "cohort" / "controller_invalid_observations")}
    files = {normalized(RUNS / "cohort" / name) for name in
             ("cohort_wave_index.json", "cohort_close.json", "controller_invalid_close.json")}
    wave_ids = [wave for wave, _ in WAVE_REGISTRY]
    for wave in wave_ids:
        files.update({normalized(wave_event_path(wave, "dispatch")), normalized(wave_event_path(wave, "completion"))})
    for wave in ["W00", *wave_ids, "W99"]:
        files.update({normalized(controller_invalid_path(wave)), normalized(controller_gate_observation_path(wave))})
    for slot in ROUTES:
        directories.add(normalized(RUNS / slot)); directories.add(normalized(SANDBOXES / slot))
        for name in ("packets", "platform", "attempts", "captures", "artifacts", "receipts", "subject_failures", "controller"):
            directories.add(normalized(RUNS / slot / name))
        files.add(normalized(RUNS / slot / "result_manifest.json"))
        files.add(normalized(SANDBOXES / slot / "repaired_integration.json"))
        for stage in RESULT_STAGES:
            files.update(normalized(path) for path in stage_evidence_paths(slot, stage))
    return directories, files


def unexpected_runtime_selector(rel: str) -> bool:
    lexical_repo_path(rel)
    runs_prefix = normalized(RUNS) + "/"; sandbox_prefix = normalized(SANDBOXES) + "/"
    directories, files = standard_runtime_paths()
    return (rel.startswith(runs_prefix) or rel.startswith(sandbox_prefix)) and rel not in directories and rel not in files


def admitted_ancestor_selector(rel: str) -> bool:
    lexical_repo_path(rel)
    directories, files = standard_runtime_paths()
    static = {normalized(ROOT), normalized(ROOT.parent), normalized(ROOT / "source_checks"),
              normalized(ROOT / "oracle_artifacts"), normalized(ROOT / "templates")}
    candidate_paths = files | {normalized(ROOT / item) for item in IMMUTABLE_PATHS} | {
        normalized(ROOT / "launch_manifest.json"), normalized(ROOT.parent / "r5_snapshot_v1_launch_custody.json")}
    return rel in directories | static and any(path.startswith(rel.rstrip("/") + "/") for path in candidate_paths)


def runtime_path_wave(rel: str) -> str | None:
    for wave, stages in WAVE_REGISTRY:
        if rel in {normalized(wave_event_path(wave, "dispatch")), normalized(wave_event_path(wave, "completion"))}:
            return wave
        for slot in ROUTES:
            if any(rel == normalized(path) for stage in stages for path in stage_evidence_paths(slot, stage)):
                return wave
    return None


def runtime_path_cell(rel: str) -> tuple[str, str] | None:
    for slot in ROUTES:
        for stage in RESULT_STAGES:
            if any(rel == normalized(path) for path in stage_evidence_paths(slot, stage)):
                return slot, stage
    return None


def semantic_prefix_before(wave_id: str, launch_sha: str) -> tuple[dict[str, Any], dict[str, Any]]:
    schema = load_control("schemas.json")["cohort_wave_ledger"]
    items: list[dict[str, Any]] = []
    state: dict[str, Any] = {"completions": {}, "stopped_fail": set(), "reached_s80": set()}
    for current, _ in WAVE_REGISTRY:
        if current == wave_id: break
        dispatch = wave_event_path(current, "dispatch"); completion = wave_event_path(current, "completion")
        _, dispatch_payload, _ = stored_canonical(dispatch, dispatch, f"{current} predecessor dispatch")
        _, completion_payload, completion_obj = stored_canonical(completion, completion, f"{current} predecessor completion")
        candidate = items + [{"wave_id": current, "dispatch_event_sha256": sha(dispatch_payload),
                              "completion_event_sha256": sha(completion_payload), "status": completion_obj.get("status")}]
        synthetic = {"schema_id": schema["schema_id"], "protocol_id": ID,
                     "launch_source_receipt_sha256": launch_sha, "waves": candidate}
        state = validate_wave_ledger(RUNS / "cohort" / "cohort_wave_index.json", launch_sha,
                                     index_override=synthetic, allow_incomplete=True)
        if state.get("invalid_sha256") is not None:
            raise Invalid("runtime gate has a predecessor cohort INVALID")
        items = candidate
    return {"schema_id": schema["schema_id"], "protocol_id": ID,
            "launch_source_receipt_sha256": launch_sha, "waves": items}, state


def intrinsically_valid_w10_dispatch() -> tuple[bytes, str] | None:
    path = wave_event_path("W10", "dispatch")
    if lstat_kind(path)[0] != "REGULAR_NONLINK": return None
    storage = path.read_bytes()
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n"): return None
    payload = storage[:-1]
    try:
        obj = load_json_bytes(payload, "intrinsic W10 dispatch", canonical=True)
        schema = load_control("schemas.json")["cohort_wave_dispatch_event"]
        launch_sha = require_hex(obj.get("launch_source_receipt_sha256"), "intrinsic W10 launch binding")
        if (list(obj) != schema["required_keys"] or obj.get("schema_id") != schema["schema_id"] or
                (obj.get("protocol_id"), obj.get("wave_id"), obj.get("kind"),
                 obj.get("prior_completion_event_sha256"), obj.get("status")) !=
                (ID, "W10", WAVE_KIND["W10"], None, "DISPATCH_RECORDED")):
            return None
        expected = [(slot, stage) for slot in ROUTES for stage in dict(WAVE_REGISTRY)["W10"]]
        rows = obj.get("dispatch_set")
        if not isinstance(rows, list) or len(rows) != len(expected): return None
        for row, cell in zip(rows, expected):
            if (not isinstance(row, dict) or list(row) != schema["dispatch_item_keys"] or
                    (row.get("slot"), row.get("stage"), row.get("task_id"), row.get("thread_id")) != (*cell, None, None)):
                return None
        return payload, launch_sha
    except (Invalid, KeyError, TypeError, ValueError):
        return None


def intrinsic_launch_receipt_hash() -> str | None:
    path = ROOT / "source_checks" / "launch.json"
    if lstat_kind(path)[0] != "REGULAR_NONLINK": return None
    storage = path.read_bytes()
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n"): return None
    payload = storage[:-1]
    try:
        obj = load_json_bytes(payload, "intrinsic historical launch receipt", canonical=True)
        schema = load_control("schemas.json")["source_check_receipt"]
        custody_storage = read(ROOT / "source_custody.json")
        owner = load_control("protocol.json")["launch_source_gate"]["source_owner_constants"]
        if (sha(custody_storage), len(custody_storage)) != (owner["source_custody_storage_sha256"], owner["source_custody_storage_bytes"]):
            return None
        expected = {"schema_id": schema["schema_id"], "protocol_id": ID, "phase": "launch",
                    "source_custody_sha256": sha(custody_storage), "files_checked": 15,
                    "aggregate_bytes": schema["expected_aggregate_bytes"],
                    "descriptor_sha256": schema["expected_descriptor_sha256"],
                    "normalized_unique_contained": True, "status": "PASS"}
        return sha(payload) if list(obj) == schema["required_keys"] and obj == expected else None
    except (Invalid, KeyError, TypeError, ValueError):
        return None


def recover_historical_launch_hash(allowed_static_mismatch: str | None = None) -> str | None:
    candidates: list[str] = []
    direct = intrinsic_launch_receipt_hash()
    if direct is not None: candidates.append(direct)
    try:
        if allowed_static_mismatch is None:
            _, _, manifest, _ = intrinsic_manifest_binding()
        else:
            _, _, manifest, _ = intrinsic_manifest_binding_allowing(allowed_static_mismatch)
        candidates.append(require_hex(manifest["launch_source_receipt"]["payload_sha256"], "manifest historical launch hash"))
    except (Invalid, KeyError, TypeError, ValueError):
        pass
    w10 = intrinsically_valid_w10_dispatch()
    if w10 is not None: candidates.append(w10[1])
    if len(set(candidates)) > 1:
        raise Invalid("historical launch hash candidates disagree")
    return candidates[0] if candidates else None


def static_inventory_invalid_wave(launch_sha: str) -> str:
    """Derive the sole wave allowed to record a post-launch immutable observation."""
    prefix, state = maximal_wave_prefix(launch_sha)
    if state.get("invalid_sha256") is not None:
        raise Invalid("static inventory observation follows an existing cohort INVALID")
    order = [wave for wave, _ in WAVE_REGISTRY]
    reached = [item["wave_id"] for item in prefix.get("waves", [])]
    if len(reached) == len(order):
        return "W99"
    return order[len(reached)]


def intrinsic_frontier_dispatch(wave_id: str, launch_sha: str | None,
                                prefix: dict[str, Any], state: dict[str, Any]) -> tuple[bytes, dict[str, Any], set[tuple[str, str]]] | None:
    if wave_id not in dict(WAVE_REGISTRY) or launch_sha is None: return None
    order = [wave for wave, _ in WAVE_REGISTRY]
    reached = [item["wave_id"] for item in prefix.get("waves", [])]
    if wave_id in reached:
        position = reached.index(wave_id)
        prior = None if position == 0 else prefix["waves"][position - 1]["completion_event_sha256"]
        stopped: set[str] = set()
        if position:
            prior_prefix = {**prefix, "waves": prefix["waves"][:position]}
            prior_state = validate_wave_ledger(RUNS / "cohort" / "cohort_wave_index.json", launch_sha,
                                               index_override=prior_prefix, allow_incomplete=True)
            stopped = prior_state["stopped_fail"]
    else:
        if len(reached) >= len(order) or order[len(reached)] != wave_id: return None
        prior = None if not reached else prefix["waves"][-1]["completion_event_sha256"]
        stopped = state.get("stopped_fail", set())
    path = wave_event_path(wave_id, "dispatch")
    if lstat_kind(path)[0] != "REGULAR_NONLINK": return None
    storage = path.read_bytes()
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n"): return None
    payload = storage[:-1]
    try:
        obj = load_json_bytes(payload, f"{wave_id} intrinsic frontier dispatch", canonical=True)
        schema = load_control("schemas.json")["cohort_wave_dispatch_event"]
        if (list(obj) != schema["required_keys"] or obj.get("schema_id") != schema["schema_id"] or
                (obj.get("protocol_id"), obj.get("wave_id"), obj.get("kind"), obj.get("prior_completion_event_sha256"),
                 obj.get("launch_source_receipt_sha256"), obj.get("status")) !=
                (ID, wave_id, WAVE_KIND[wave_id], prior, launch_sha, "DISPATCH_RECORDED")):
            return None
        active = [slot for slot in ROUTES if slot not in stopped]
        expected = [(slot, stage) for slot in active for stage in dict(WAVE_REGISTRY)[wave_id]]
        rows = obj.get("dispatch_set")
        if not expected or not isinstance(rows, list) or len(rows) != len(expected): return None
        for row, cell in zip(rows, expected):
            if (not isinstance(row, dict) or list(row) != schema["dispatch_item_keys"] or
                    (row.get("slot"), row.get("stage"), row.get("task_id"), row.get("thread_id")) != (*cell, None, None)):
                return None
        return payload, obj, set(expected)
    except (Invalid, KeyError, TypeError, ValueError):
        return None


def runtime_context() -> tuple[str | None, dict[str, Any], dict[str, Any]]:
    launch_sha = recover_historical_launch_hash()
    if launch_sha is None:
        empty = {"schema_id": load_control("schemas.json")["cohort_wave_ledger"]["schema_id"],
                 "protocol_id": ID, "launch_source_receipt_sha256": None, "waves": []}
        return None, empty, {"completions": {}, "stopped_fail": set(), "reached_s80": set()}
    prefix, state = maximal_wave_prefix(launch_sha)
    return launch_sha, prefix, state


def admitted_runtime_observation_state(wave_id: str, rel: str, required: bool) -> tuple[str, str | None, int | None]:
    lexical_repo_path(rel); directories, files = standard_runtime_paths()
    if rel not in directories and rel not in files:
        raise Invalid("runtime gate selector is not an exact standard runtime path")
    path_wave = runtime_path_wave(rel); cell = runtime_path_cell(rel)
    order = [wave for wave, _ in WAVE_REGISTRY]
    if wave_id == "W00":
        if required: raise Invalid("W00 has no required runtime cell/event entry")
        protected = {normalized(controller_invalid_path("W00")), normalized(controller_gate_observation_path("W00")),
                     normalized(RUNS / "cohort" / "controller_invalid_close.json"), normalized(RUNS), normalized(RUNS / "cohort"),
                     normalized(RUNS / "cohort" / "controller_invalid"), normalized(RUNS / "cohort" / "controller_invalid_observations")}
        if rel in protected: raise Invalid("selected W00 path is part of the invalid terminal, not forbidden runtime activity")
    elif wave_id != "W99":
        frontier_pos = order.index(wave_id)
        if path_wave is not None and order.index(path_wave) > frontier_pos:
            if required: raise Invalid("required runtime selector is chronologically later than the invalid frontier")
        elif path_wave is not None and order.index(path_wave) < frontier_pos:
            if not required: raise Invalid("forbidden runtime selector belongs to a trustworthy predecessor wave")
        if cell is not None:
            launch_sha = recover_historical_launch_hash()
            if launch_sha is None:
                if required: raise Invalid("required runtime cell lacks a recoverable historical launch binding")
                return "ABSENT", None, None
            prefix, state = semantic_prefix_before(wave_id, launch_sha)
            admitted: set[tuple[str, str]]
            if STAGE_WAVE[cell[1]] == wave_id:
                frontier = intrinsic_frontier_dispatch(wave_id, launch_sha, prefix, state)
                admitted = set() if frontier is None else frontier[2]
            else:
                admitted = set(state.get("completions", {}))
            if required and cell not in admitted:
                raise Invalid("required runtime cell is absent from the exact active-slot dispatch/prefix")
            if not required and cell in admitted:
                raise Invalid("forbidden runtime cell is admitted by the exact active-slot dispatch/prefix")
    else:
        launch_sha, prefix, state = runtime_context()
        reached = [item["wave_id"] for item in prefix.get("waves", [])]
        if (launch_sha is None or state.get("invalid_sha256") is not None or
                (len(reached) != len(order) and len(state.get("stopped_fail", set())) != len(ROUTES))):
            raise Invalid("W99 runtime gate lacks a complete or all-stopped trustworthy runtime state")
        sandbox_root = normalized(SANDBOXES)
        if rel == sandbox_root or rel.startswith(sandbox_root + "/"):
            raise Invalid("W99 sandbox state requires the exact SANDBOX gate contract")
        if cell is not None:
            admitted = set(state.get("completions", {}))
            if required and cell not in admitted:
                raise Invalid("W99 required runtime cell is stopped or undispatched")
            if not required and cell in admitted:
                raise Invalid("W99 forbidden runtime cell is part of the trustworthy prefix")
        elif path_wave is not None:
            reached_set = set(reached)
            if required and path_wave not in reached_set:
                raise Invalid("W99 required wave event is outside the trustworthy prefix")
            if not required and path_wave in reached_set:
                raise Invalid("W99 forbidden wave event is inside the trustworthy prefix")
        elif rel in directories:
            prefix_files = {
                normalized(wave_event_path(item["wave_id"], event))
                for item in prefix.get("waves", [])
                for event in ("dispatch", "completion")
            }
            prefix_files.update(
                normalized(path) for path in exact_completed_stage_evidence(state.get("completions", {}))
            )
            directory_prefix = rel.rstrip("/") + "/"
            admitted = any(path.startswith(directory_prefix) for path in prefix_files)
            if required and not admitted:
                raise Invalid("W99 required runtime directory has no trustworthy-prefix evidence")
            if not required and admitted:
                raise Invalid("W99 forbidden runtime directory contains trustworthy-prefix evidence")
    if required and rel in {normalized(RUNS / slot / "result_manifest.json") for slot in ROUTES} | {
            normalized(RUNS / "cohort" / "cohort_close.json")}:
        raise Invalid("normal terminal file is never required in INVALID mode")
    if not required:
        return "ABSENT", None, None
    return ("DIRECTORY_NONLINK", None, None) if rel in directories else ("REGULAR_NONLINK", None, None)


def sandbox_observation_spec(wave_id: str, rel: str, required: bool) -> tuple[str, str, str | None, int | None, str | None, int | None]:
    lexical_repo_path(rel)
    reached: set[str] = set()
    if required:
        launch_sha, _, state = runtime_context()
        reached = state.get("reached_s80", set()) if launch_sha is not None else set()
    for slot in ROUTES:
        directory = normalized(SANDBOXES / slot); target = normalized(SANDBOXES / slot / "repaired_integration.json")
        if rel not in (directory, target): continue
        if required:
            if slot not in reached: raise Invalid("sandbox required selector lacks a fully validated PASS S80")
            if rel == directory: return rel, "DIRECTORY_NONLINK", None, None, None, None
            storage = read(capture_path(slot, "S80"))
            return rel, "MATCH_BOUND_STORAGE", None, None, sha(storage), len(storage)
        return rel, "ABSENT", None, None, None, None
    raise Invalid("sandbox selector is not an exact slot directory or repaired target")


def maximal_wave_prefix(launch_sha: str) -> tuple[dict[str, Any], dict[str, Any]]:
    """Recompute the maximal fully trustworthy event prefix without trusting an index."""
    schema = load_control("schemas.json")["cohort_wave_ledger"]
    items: list[dict[str, Any]] = []
    wave: dict[str, Any] | None = None
    for wave_id, _ in WAVE_REGISTRY:
        dispatch = wave_event_path(wave_id, "dispatch"); completion = wave_event_path(wave_id, "completion")
        if not dispatch.exists() or not completion.exists() or dispatch.is_symlink() or completion.is_symlink():
            break
        try:
            _, dispatch_payload, _ = stored_canonical(dispatch, dispatch, f"{wave_id} maximal-prefix dispatch")
            _, completion_payload, completion_obj = stored_canonical(completion, completion, f"{wave_id} maximal-prefix completion")
            status = completion_obj.get("status")
            if status not in ("PASS", "SUBJECT_FAIL", "INVALID"):
                break
        except (Invalid, OSError, ValueError, TypeError):
            break
        candidate = items + [{"wave_id": wave_id, "dispatch_event_sha256": sha(dispatch_payload),
                              "completion_event_sha256": sha(completion_payload), "status": status}]
        synthetic = {"schema_id": schema["schema_id"], "protocol_id": ID,
                     "launch_source_receipt_sha256": launch_sha, "waves": candidate}
        try:
            candidate_wave = validate_wave_ledger(RUNS / "cohort" / "cohort_wave_index.json", launch_sha,
                                                  index_override=synthetic, allow_incomplete=True)
        except (Invalid, OSError, ValueError, TypeError, KeyError, IndexError):
            break
        items = candidate
        wave = candidate_wave
        if status == "INVALID":
            break
    synthetic = {"schema_id": schema["schema_id"], "protocol_id": ID,
                 "launch_source_receipt_sha256": launch_sha, "waves": items}
    if wave is None:
        wave = validate_wave_ledger(RUNS / "cohort" / "cohort_wave_index.json", launch_sha,
                                    index_override=synthetic, allow_incomplete=True)
    return synthetic, wave


def recursive_lstat_tree(root: Path) -> dict[str, str]:
    observed: dict[str, str] = {}
    state, _, _, _, _ = lstat_kind(root)
    if state == "ABSENT": return observed
    observed[normalized(root)] = state
    if state != "DIRECTORY_NONLINK": return observed
    stack = [root]
    while stack:
        directory = stack.pop()
        try:
            entries = sorted(os.scandir(directory), key=lambda entry: entry.name)
        except OSError as exc:
            raise Invalid(f"cannot enumerate runtime directory without following links: {directory}: {exc}") from exc
        for entry in entries:
            path = Path(entry.path); state, _, _, _, _ = lstat_kind(path); observed[normalized(path)] = state
            if state == "DIRECTORY_NONLINK": stack.append(path)
    return observed


def prefix_cells(prefix: dict[str, Any]) -> set[tuple[str, str]]:
    cells: set[tuple[str, str]] = set()
    for item in prefix.get("waves", []):
        path = wave_event_path(item["wave_id"], "dispatch")
        _, _, dispatch = stored_canonical(path, path, f"{item['wave_id']} trusted-prefix dispatch")
        cells.update((row["slot"], row["stage"]) for row in dispatch["dispatch_set"])
    return cells


def invalid_observation_targets(observation: dict[str, Any] | None) -> set[str]:
    if observation is None: return set()
    return {row["path"] for row in observation["observations"] if row.get("defect_kind") is not None}


def validate_frontier_cell_shape(slot: str, stage: str, observation_defects: set[str],
                                 receipt_evidence: set[str], dispatch_payload: bytes | None) -> set[str]:
    present = {normalized(path) for path in stage_evidence_paths(slot, stage)
               if lstat_kind(path)[0] != "ABSENT"}
    failed_regular: set[str] = set()
    if not present: return failed_regular
    def check(rel: str, operation: Any) -> None:
        try:
            operation()
        except (Invalid, SubjectFail, OSError, ValueError, TypeError, KeyError, IndexError):
            if rel not in receipt_evidence:
                raise
            failed_regular.add(rel)
    if stage in DETERMINISTIC:
        artifact_rel = normalized(capture_path(slot, stage))
        if artifact_rel in present and artifact_rel not in observation_defects:
            operation = (lambda: validated_prewrite_s80_artifact(slot)) if stage == "S80" else (lambda: deterministic_evidence(stage, slot))
            check(artifact_rel, operation)
        if stage == "S80":
            controller = s80_controller_paths(slot)
            target = SANDBOXES / slot / "repaired_integration.json"; target_rel = normalized(target)
            order = [normalized(capture_path(slot, "S80")), normalized(controller[0]), normalized(controller[1]),
                     target_rel, normalized(controller[2]), normalized(controller[3]), normalized(controller[4])]
            causal_present = set(present)
            if lstat_kind(target)[0] != "ABSENT":
                causal_present.add(target_rel)
            highest = max((index for index, rel in enumerate(order) if rel in causal_present), default=-1)
            for rel in order[:highest]:
                if rel not in causal_present and rel not in observation_defects:
                    offending = order[highest]
                    if offending in observation_defects:
                        continue
                    if offending in receipt_evidence:
                        failed_regular.add(offending)
                    else:
                        raise Invalid(f"{slot} S80: later custody exists without predecessor {rel}")
            args = canonical_slot_args(slot)
            checks = (
                (controller[0], lambda: validate_s80_pre_observation(slot, require_selected_absent=False)),
                (controller[1], lambda: validate_s80_global_pre(slot)),
                (controller[2], lambda: exact_s80_write_receipt(args, slot)),
                (controller[3], lambda: validate_write_receipt(args, slot)),
                (controller[4], lambda: validate_s80_global_guard(slot)),
            )
            for path, operation in checks:
                rel = normalized(path)
                if rel in present and rel not in observation_defects:
                    check(rel, operation)
            if lstat_kind(target)[0] != "ABSENT" and target_rel not in observation_defects:
                def validate_partial_target() -> None:
                    if lstat_kind(target)[0] != "REGULAR_NONLINK":
                        raise Invalid(f"{slot}: S80 frontier target is not a regular nonlink")
                    capture_storage, _ = capture_bytes(capture_path(slot, "S80"), capture_path(slot, "S80"),
                                                       f"{slot} S80 frontier target capture")
                    if target.read_bytes() != capture_storage:
                        raise Invalid(f"{slot}: S80 frontier target differs from exact capture storage")
                check(target_rel, validate_partial_target)
        return failed_regular
    packet = normalized(packet_path(slot, stage)); reservation = normalized(reservation_path(slot, stage))
    creation = normalized(creation_metadata_path(slot, stage)); start = normalized(attempt_start_path(slot, stage))
    metadata = normalized(metadata_path(slot, stage)); capture = normalized(capture_path(slot, stage))
    receipt = normalized(receipt_path(slot, stage)); failure = normalized(subject_failure_path(slot, stage))
    if receipt in present and failure in present:
        raise Invalid(f"{slot} {stage}: ordinary and failure receipts coexist")
    linear = [packet, reservation, creation, start, metadata, capture, receipt]
    observed_linear = [index for index, rel in enumerate(linear) if rel in present]
    if observed_linear:
        for rel in linear[:max(observed_linear)]:
            if rel not in present and rel not in observation_defects:
                raise Invalid(f"{slot} {stage}: later frontier evidence exists without predecessor {rel}")
    if packet in present and packet not in observation_defects:
        check(packet, lambda: exact_packet_payload(slot, stage, packet_path(slot, stage)))
    if reservation in present and reservation not in observation_defects:
        if dispatch_payload is None: raise Invalid(f"{slot} {stage}: reservation exists without intrinsic dispatch")
        check(reservation, lambda: validate_reservation(slot, stage, sha(dispatch_payload)))
    if creation in present and creation not in observation_defects:
        def validate_creation() -> None:
            _, _, obj = stored_canonical(creation_metadata_path(slot, stage), creation_metadata_path(slot, stage),
                                         f"{slot} {stage} frontier creation metadata")
            result = obj.get("platform_creation_observation", {}).get("result")
            validate_creation_metadata(creation_metadata_path(slot, stage), slot, stage, result == "CREATED")
        check(creation, validate_creation)
    if start in present and start not in observation_defects:
        if dispatch_payload is None: raise Invalid(f"{slot} {stage}: attempt start exists without intrinsic dispatch")
        check(start, lambda: validate_attempt_start(slot, stage, sha(dispatch_payload)))
    if capture in present and capture not in observation_defects:
        def validate_frontier_capture() -> None:
            _, payload = capture_bytes(capture_path(slot, stage), capture_path(slot, stage),
                                       f"{slot} {stage} frontier capture")
            if not payload:
                raise Invalid(f"{slot} {stage}: zero-byte ordinary frontier capture requires failure receipt")
        check(capture, validate_frontier_capture)
    if metadata in present and metadata not in observation_defects:
        def validate_metadata() -> None:
            if capture in present:
                _, payload = capture_bytes(capture_path(slot, stage), capture_path(slot, stage),
                                           f"{slot} {stage} frontier metadata capture")
                validate_platform_metadata(metadata_path(slot, stage), slot, stage, payload)
            else:
                validate_failure_metadata(metadata_path(slot, stage), slot, stage)
        check(metadata, validate_metadata)
    if receipt in present and receipt not in observation_defects:
        def validate_ordinary() -> None:
            storage, payload = capture_bytes(capture_path(slot, stage), capture_path(slot, stage),
                                             f"{slot} {stage} frontier capture")
            validate_call_receipt(slot, stage, capture_path(slot, stage), receipt_path(slot, stage),
                                  storage, payload, reconstruct=False)
        check(receipt, validate_ordinary)
    if failure in present and failure not in observation_defects:
        def validate_failure() -> None:
            _, payload, _ = stored_canonical(subject_failure_path(slot, stage), subject_failure_path(slot, stage),
                                             f"{slot} {stage} frontier failure receipt")
            validate_subject_failure_receipt(slot, stage, sha(payload))
        check(failure, validate_failure)
    return failed_regular


def validate_invalid_runtime_shape(prefix: dict[str, Any], state: dict[str, Any], frontier_wave: str | None,
                                   frontier_dispatch: tuple[bytes, dict[str, Any], set[tuple[str, str]]] | None,
                                   invalid_receipt: dict[str, Any], observation: dict[str, Any] | None,
                                   output_present: bool = False) -> None:
    observed = {**recursive_lstat_tree(RUNS), **recursive_lstat_tree(SANDBOXES)}
    defect_paths = invalid_observation_targets(observation)
    evidence = set(invalid_receipt["evidence_paths"])
    allowed_files = {normalized(controller_invalid_path(invalid_receipt["wave_id"]))}
    if observation is not None: allowed_files.add(normalized(controller_gate_observation_path(invalid_receipt["wave_id"])))
    if output_present: allowed_files.add(normalized(RUNS / "cohort" / "controller_invalid_close.json"))
    for item in prefix.get("waves", []):
        allowed_files.update({normalized(wave_event_path(item["wave_id"], "dispatch")),
                              normalized(wave_event_path(item["wave_id"], "completion"))})
    allowed_files.update(normalized(path) for path in exact_completed_stage_evidence(state.get("completions", {})))
    frontier_cells: set[tuple[str, str]] = set()
    if frontier_wave is not None:
        dispatch_path = wave_event_path(frontier_wave, "dispatch")
        if lstat_kind(dispatch_path)[0] != "ABSENT":
            dispatch_rel = normalized(dispatch_path)
            if frontier_dispatch is None and dispatch_rel not in evidence and dispatch_rel not in defect_paths:
                raise Invalid("non-intrinsic frontier dispatch is not exact receipt-bound defective evidence")
            allowed_files.add(dispatch_rel)
        completion_path = wave_event_path(frontier_wave, "completion")
        if frontier_dispatch is not None and lstat_kind(completion_path)[0] != "ABSENT":
            allowed_files.add(normalized(completion_path))
    if frontier_dispatch is not None:
        frontier_cells = frontier_dispatch[2]
        for slot, stage in frontier_cells:
            for path in stage_evidence_paths(slot, stage):
                if lstat_kind(path)[0] != "ABSENT": allowed_files.add(normalized(path))
            if stage == "S80":
                target = SANDBOXES / slot / "repaired_integration.json"
                if lstat_kind(target)[0] != "ABSENT": allowed_files.add(normalized(target))
    index = RUNS / "cohort" / "cohort_wave_index.json"
    if invalid_receipt["wave_id"] != "W00" and lstat_kind(index)[0] != "ABSENT":
        allowed_files.add(normalized(index))
    for slot in state.get("reached_s80", set()):
        allowed_files.add(normalized(SANDBOXES / slot / "repaired_integration.json"))
    allowed_files.update(defect_paths)
    directories, standard_files = standard_runtime_paths()
    for rel, observed_state in observed.items():
        if rel in directories:
            if observed_state != "DIRECTORY_NONLINK" and rel not in defect_paths:
                raise Invalid(f"invalid runtime standard directory state without matching observation: {rel}")
            continue
        if rel not in standard_files:
            if rel not in defect_paths or not unexpected_runtime_selector(rel):
                raise Invalid(f"unclassified runtime entry after INVALID: {rel}")
            prefix_rel = rel.rstrip("/") + "/"
            if any(other.startswith(prefix_rel) for other in observed if other != rel):
                raise Invalid(f"observation-bound unexpected runtime entry has descendants: {rel}")
            continue
        if rel not in allowed_files:
            raise Invalid(f"later, undispatched, or terminally forbidden runtime evidence exists: {rel}")
        if observed_state != "REGULAR_NONLINK" and rel not in defect_paths:
            raise Invalid(f"runtime standard file is nonregular without exact observation: {rel}")
    present_dirs = {rel for rel, kind in observed.items() if kind == "DIRECTORY_NONLINK"}
    unexpected_defect_directories = {
        rel for rel in present_dirs if rel in defect_paths and unexpected_runtime_selector(rel)
    }
    structural = {normalized(RUNS), normalized(RUNS / "cohort"), normalized(RUNS / "cohort" / "controller_invalid")}
    if invalid_receipt["wave_id"] == "W00":
        w00_directories = set(structural)
        if observation is not None:
            w00_directories.add(normalized(RUNS / "cohort" / "controller_invalid_observations"))
        extras = present_dirs - w00_directories - unexpected_defect_directories
        if extras:
            raise Invalid(f"W00 contains forbidden runtime directories: {sorted(extras)}")
    for directory in present_dirs - structural - unexpected_defect_directories:
        prefix_rel = directory.rstrip("/") + "/"
        if not any(path.startswith(prefix_rel) for path in observed if path != directory):
            raise Invalid(f"empty runtime evidence directory is forbidden: {directory}")
    reached = prefix_cells(prefix)
    terminal_invalid_frontier = bool(prefix.get("waves") and frontier_wave == prefix["waves"][-1]["wave_id"] and
                                     prefix["waves"][-1]["status"] == "INVALID")
    failed_regular: set[str] = set()
    dispatch_payload = None if frontier_dispatch is None else frontier_dispatch[0]
    for slot, stage in frontier_cells:
        if (slot, stage) not in reached or terminal_invalid_frontier:
            failed_regular.update(validate_frontier_cell_shape(slot, stage, defect_paths, evidence, dispatch_payload))
    receipt_cell = (invalid_receipt.get("slot"), invalid_receipt.get("stage"))
    if receipt_cell != (None, None):
        selected_paths = {normalized(path) for path in stage_evidence_paths(receipt_cell[0], receipt_cell[1])}
        if receipt_cell[1] == "S80":
            selected_paths.add(normalized(SANDBOXES / receipt_cell[0] / "repaired_integration.json"))
        if not (failed_regular & evidence) and not (defect_paths & selected_paths):
            raise Invalid("cell-scoped controller-invalid receipt binds no semantically defective cell object")
    for slot in ROUTES:
        result = normalized(RUNS / slot / "result_manifest.json")
        if result in observed: raise Invalid(f"{slot}: normal result manifest exists after cohort INVALID")
    if normalized(RUNS / "cohort" / "cohort_close.json") in observed:
        raise Invalid("normal cohort close exists after cohort INVALID")


def validate_invalid_frontier_binding(wave_id: str, frontier_wave: str | None,
                                      frontier_dispatch: tuple[bytes, dict[str, Any], set[tuple[str, str]]] | None,
                                      receipt: dict[str, Any], observation: dict[str, Any] | None) -> None:
    cell = (receipt.get("slot"), receipt.get("stage"))
    if wave_id in dict(WAVE_REGISTRY):
        if wave_id != frontier_wave:
            raise Invalid("runtime controller-invalid receipt does not name the maximal-prefix frontier")
        if frontier_dispatch is None:
            if cell != (None, None):
                raise Invalid("malformed/missing frontier dispatch grants zero cells")
        elif cell != (None, None) and cell not in frontier_dispatch[2]:
            raise Invalid("controller-invalid receipt names a cell outside the exact frontier dispatch")
    elif cell != (None, None):
        raise Invalid("W00/W99 controller-invalid receipt must have null slot/stage")
    gate_rel = normalized(controller_gate_observation_path(wave_id))
    regular = set(receipt["evidence_paths"]) - {gate_rel}
    targets = invalid_observation_targets(observation)
    if observation is not None and gate_rel not in receipt["evidence_paths"]:
        raise Invalid("mandatory controller gate observation is not receipt-bound")
    if observation is None and not regular:
        raise Invalid("controller-invalid receipt binds neither an exact defective object nor an observation")
    if wave_id == "W00":
        if observation is not None:
            return
        demonstrably_defective: set[str] = set()
        protocol_rel = normalized(ROOT / "protocol.json")
        if protocol_rel in regular:
            storage = read(ROOT / "protocol.json")
            if (sha(storage), len(storage)) != (PROTOCOL_STORAGE_SHA256, PROTOCOL_STORAGE_BYTES):
                demonstrably_defective.add(protocol_rel)
        if demonstrably_defective:
            return
        custody_rel = normalized(ROOT / "source_custody.json")
        if custody_rel in regular:
            owner = load_control("protocol.json")["launch_source_gate"]["source_owner_constants"]
            storage = read(ROOT / "source_custody.json")
            if (sha(storage), len(storage)) != (owner["source_custody_storage_sha256"], owner["source_custody_storage_bytes"]):
                demonstrably_defective.add(custody_rel)
        if demonstrably_defective:
            return
        source_rows = {normalized(FIXTURE_ROOT / row["path"]): row
                       for row in load_control("source_custody.json").get("corpus_files", [])
                       if isinstance(row, dict) and isinstance(row.get("path"), str)}
        for rel in regular & set(source_rows):
            storage = read(REPO / rel); row = source_rows[rel]
            if (sha(storage), len(storage)) != (row.get("sha256"), row.get("bytes")):
                demonstrably_defective.add(rel)
        launch_rel = normalized(ROOT / "source_checks" / "launch.json")
        if launch_rel in regular and intrinsic_launch_receipt_hash() is None:
            demonstrably_defective.add(launch_rel)
        seal_pair = {normalized(ROOT / "launch_manifest.json"), normalized(ROOT.parent / "r5_snapshot_v1_launch_custody.json")}
        if regular & seal_pair:
            try: intrinsic_manifest_binding()
            except Invalid: demonstrably_defective.update(regular & seal_pair)
        if not demonstrably_defective:
            raise Invalid("W00 receipt does not bind a demonstrably defective exact seal/source object")
        return
    if observation is not None and observation.get("gate_code") == "STATIC_INVENTORY_ENTRY":
        if cell != (None, None) or regular:
            raise Invalid("static inventory drift requires a wave-level observation-only receipt")
        if len(targets) != 1 or next(iter(targets)) not in {
                normalized(ROOT / rel) for rel in INTERNAL_STATIC_INVENTORY_PATHS}:
            raise Invalid("static inventory observation does not bind exactly one internal 38-path member")
        return
    if observation is not None and wave_id in dict(WAVE_REGISTRY):
        if frontier_wave is None:
            raise Invalid("runtime controller observation has no exact invalid frontier")
        if frontier_dispatch is None:
            relevant_targets = {normalized(wave_event_path(frontier_wave, "dispatch"))}
        elif cell != (None, None):
            relevant_targets = {normalized(path) for path in stage_evidence_paths(cell[0], cell[1])}
            if cell[1] == "S80":
                relevant_targets.add(normalized(SANDBOXES / cell[0] / "repaired_integration.json"))
        else:
            relevant_targets = {normalized(wave_event_path(frontier_wave, "dispatch")),
                                normalized(wave_event_path(frontier_wave, "completion")),
                                normalized(RUNS / "cohort" / "cohort_wave_index.json")}
        def target_relevant(target: str) -> bool:
            return target in relevant_targets or any(path.startswith(target.rstrip("/") + "/") for path in relevant_targets)
        if not targets or any(not target_relevant(target) for target in targets):
            raise Invalid("controller observation target is outside the exact frontier event/cell")
        return
    if observation is not None and wave_id == "W99":
        return
    candidate_wave = frontier_wave
    relevant = {normalized(RUNS / "cohort" / "cohort_wave_index.json"),
                normalized(ROOT / "source_checks" / "launch.json"), normalized(ROOT / "source_checks" / "close.json")}
    if candidate_wave is not None:
        relevant.update({normalized(wave_event_path(candidate_wave, "dispatch")),
                         normalized(wave_event_path(candidate_wave, "completion"))})
    if cell != (None, None):
        relevant.update(normalized(path) for path in stage_evidence_paths(cell[0], cell[1]))
        if cell[1] == "S80":
            relevant.add(normalized(SANDBOXES / cell[0] / "repaired_integration.json"))
    regular_frontier = regular & relevant
    if frontier_dispatch is not None:
        regular_frontier.discard(normalized(wave_event_path(frontier_wave or "W10", "dispatch")))
    if not regular_frontier and not (targets & relevant):
        raise Invalid("controller-invalid receipt does not bind the exact invalid frontier object")


def w99_close_observation_hash(launch_sha: str | None, receipt: dict[str, Any],
                               observation: dict[str, Any] | None,
                               observation_payload: bytes | None) -> tuple[str | None, bool]:
    path = ROOT / "source_checks" / "close.json"; rel = normalized(path); state = lstat_kind(path)[0]
    if state != "REGULAR_NONLINK":
        if observation is not None and observation.get("gate_code") == "W99_CLOSE_RECEIPT" and rel in invalid_observation_targets(observation):
            return sha(observation_payload or b""), True
        return None, False
    storage = path.read_bytes()
    intrinsic_payload: bytes | None = None
    intrinsic_valid = False
    if storage.endswith(b"\n") and not storage.endswith(b"\n\n"):
        candidate = storage[:-1]
        try:
            obj = load_json_bytes(candidate, "intrinsic W99 close receipt", canonical=True)
            schema = load_control("schemas.json")["source_check_receipt"]
            owner = load_control("protocol.json")["launch_source_gate"]["source_owner_constants"]
            expected = {"schema_id": schema["schema_id"], "protocol_id": ID, "phase": "close",
                        "source_custody_sha256": owner["source_custody_storage_sha256"], "files_checked": 15,
                        "aggregate_bytes": schema["expected_aggregate_bytes"],
                        "descriptor_sha256": schema["expected_descriptor_sha256"],
                        "normalized_unique_contained": True, "status": "PASS",
                        "launch_receipt_sha256": launch_sha}
            intrinsic_valid = launch_sha is not None and list(obj) == schema["required_keys"] + ["launch_receipt_sha256"] and obj == expected
            intrinsic_payload = candidate
        except (Invalid, KeyError, TypeError, ValueError):
            pass
    if intrinsic_valid:
        return sha(intrinsic_payload or b""), False
    else:
        if rel not in receipt["evidence_paths"]:
            raise Invalid("semantically invalid regular W99 close receipt is not exact receipt-bound evidence")
        if storage.endswith(b"\n") and not storage.endswith(b"\n\n"):
            payload = storage[:-1]
            try: load_json_bytes(payload, "defective W99 close payload", canonical=True)
            except Invalid: return None, True
            return sha(payload), True
        return None, True


def controller_invalid_close(args: argparse.Namespace) -> bytes:
    output_path = RUNS / "cohort" / "controller_invalid_close.json"
    if lstat_kind(output_path)[0] != "ABSENT":
        raise Invalid("controller-invalid-close is create-once")
    normal_paths = [RUNS / "cohort" / "cohort_close.json"] + [RUNS / slot / "result_manifest.json" for slot in ROUTES]
    if any(lstat_kind(path)[0] != "ABSENT" for path in normal_paths):
        raise Invalid("controller-invalid-close cannot coexist with normal terminal artifacts")
    supplied = Path(args.controller_invalid_receipt)
    _, supplied_payload, preliminary = stored_canonical(supplied, supplied, "controller-invalid-close receipt", ROOT)
    wave_id = preliminary.get("wave_id")
    if wave_id not in {"W00", "W99", *dict(WAVE_REGISTRY)}:
        raise Invalid("controller-invalid-close receipt is not W00, W99, or a runtime wave")
    detected_gate = "W00" if wave_id == "W00" else "W99"
    expected_path = controller_invalid_path(wave_id)
    if contained_existing(supplied, RUNS) != Path(os.path.abspath(os.fspath(expected_path))):
        raise Invalid("controller-invalid-close receipt path mismatch")
    invalid_payload, invalid_receipt = validate_controller_invalid_receipt(wave_id, sha(supplied_payload))
    invalid_root = RUNS / "cohort" / "controller_invalid"
    if lstat_kind(invalid_root)[0] != "DIRECTORY_NONLINK":
        raise Invalid("controller-invalid custody root is not a regular nonlink directory")
    invalid_entries = sorted(invalid_root.iterdir(), key=lambda path: path.name)
    if invalid_entries != [expected_path] or lstat_kind(expected_path)[0] != "REGULAR_NONLINK":
        raise Invalid("controller-invalid close requires exactly one matching regular receipt")
    observation: dict[str, Any] | None = None; observation_payload: bytes | None = None
    observation_root = RUNS / "cohort" / "controller_invalid_observations"
    observation_state = lstat_kind(observation_root)[0]
    if observation_state not in ("ABSENT", "DIRECTORY_NONLINK"):
        raise Invalid("controller gate observation root is not a regular nonlink directory")
    if observation_state == "DIRECTORY_NONLINK":
        entries = sorted(observation_root.iterdir(), key=lambda path: path.name)
        expected_observation = controller_gate_observation_path(wave_id)
        if entries != [expected_observation] or lstat_kind(expected_observation)[0] != "REGULAR_NONLINK":
            raise Invalid("controller gate observation custody must contain exactly the selected regular file")
        observation_payload, observation = validate_controller_gate_observation(wave_id, expected_observation,
                                                                                invalid_receipt["invalid_class"])
    schema = load_control("schemas.json")
    allowed_manifest_mismatch: str | None = None
    if observation is not None and observation.get("gate_code") in {"STATIC_INVENTORY_ENTRY", "W99_LAUNCH_RECEIPT",
                                                                    "W00_LAUNCH_RECEIPT"}:
        targets = invalid_observation_targets(observation)
        if len(targets) == 1:
            allowed_manifest_mismatch = next(iter(targets))
    launch_sha = recover_historical_launch_hash(allowed_static_mismatch=allowed_manifest_mismatch)
    close_sha: str | None = None; close_defective = False; regular_defective = False
    close_path = ROOT / "source_checks" / "close.json"
    if wave_id in dict(WAVE_REGISTRY) and lstat_kind(close_path)[0] != "ABSENT":
        raise Invalid("runtime-wave INVALID has post-invalid close-source evidence")
    if wave_id == "W99":
        close_sha, close_defective = w99_close_observation_hash(launch_sha, invalid_receipt, observation, observation_payload)
        regular_defective = close_defective
    index_sha: str | None = None
    if wave_id == "W00":
        prefix = {"schema_id": schema["cohort_wave_ledger"]["schema_id"], "protocol_id": ID,
                  "launch_source_receipt_sha256": launch_sha, "waves": []}
        state = {"completions": {}, "stopped_fail": set(), "reached_s80": set()}
        frontier_wave = None; frontier_dispatch = None
        validate_invalid_frontier_binding(wave_id, frontier_wave, frontier_dispatch, invalid_receipt, observation)
        validate_invalid_runtime_shape(prefix, state, frontier_wave, frontier_dispatch, invalid_receipt, observation)
    else:
        if launch_sha is None:
            prefix = {"schema_id": schema["cohort_wave_ledger"]["schema_id"], "protocol_id": ID,
                      "launch_source_receipt_sha256": None, "waves": []}
            state = {"completions": {}, "stopped_fail": set(), "reached_s80": set()}
        else:
            prefix, state = maximal_wave_prefix(launch_sha)
        order = [wave for wave, _ in WAVE_REGISTRY]; reached = [item["wave_id"] for item in prefix["waves"]]
        if wave_id == "W99" and len(reached) != len(order) and len(state.get("stopped_fail", set())) != len(ROUTES):
            raise Invalid("W99 close invalidity is premature while runtime configurations remain active")
        if reached and prefix["waves"][-1]["status"] == "INVALID": frontier_wave = reached[-1]
        else: frontier_wave = order[len(reached)] if len(reached) < len(order) else None
        frontier_dispatch = intrinsic_frontier_dispatch(frontier_wave, launch_sha, prefix, state) if frontier_wave else None
        evidence_set = set(invalid_receipt["evidence_paths"])
        if frontier_wave is not None:
            dispatch_rel = normalized(wave_event_path(frontier_wave, "dispatch"))
            completion_rel = normalized(wave_event_path(frontier_wave, "completion"))
            if frontier_dispatch is None and dispatch_rel in evidence_set:
                regular_defective = True
            if completion_rel in evidence_set and frontier_wave not in reached:
                regular_defective = True
        launch_rel = normalized(ROOT / "source_checks" / "launch.json")
        if launch_rel in evidence_set and intrinsic_launch_receipt_hash() is None:
            regular_defective = True
        if (reached and prefix["waves"][-1]["status"] == "INVALID" and observation is None and
                (invalid_receipt.get("slot"), invalid_receipt.get("stage")) == (None, None)):
            raise Invalid("fully valid wave-level INVALID completion lacks a normative defect observation")
        validate_invalid_frontier_binding(wave_id, frontier_wave, frontier_dispatch, invalid_receipt, observation)
        index_path = RUNS / "cohort" / "cohort_wave_index.json"; index_state = lstat_kind(index_path)[0]
        if index_state == "REGULAR_NONLINK":
            try:
                trusted = validate_wave_ledger(index_path, launch_sha or "", allow_incomplete=True)
                _, _, index_obj = stored_canonical(index_path, index_path, "trusted invalid-close wave index")
                if index_obj.get("waves") != prefix["waves"]: raise Invalid("index differs from maximal trustworthy prefix")
            except (Invalid, OSError, ValueError, TypeError):
                if normalized(index_path) not in invalid_receipt["evidence_paths"]:
                    raise Invalid("untrusted wave index is not exact receipt-bound defective evidence")
                regular_defective = True
            else:
                index_sha = trusted["index_sha256"]
                state = trusted
        elif index_state != "ABSENT" and normalized(index_path) not in invalid_observation_targets(observation):
            raise Invalid("nonregular optional wave index lacks exact normative observation")
        validate_invalid_runtime_shape(prefix, state, frontier_wave, frontier_dispatch, invalid_receipt, observation)
        if observation is None and (invalid_receipt.get("slot"), invalid_receipt.get("stage")) == (None, None) and not regular_defective:
            raise Invalid("wave-level controller-invalid receipt binds no demonstrated semantic defect")
        defect_targets = invalid_observation_targets(observation)
        for slot in state.get("reached_s80", set()):
            cap = capture_path(slot, "S80"); target = SANDBOXES / slot / "repaired_integration.json"
            cap_storage, _ = capture_bytes(cap, cap, f"{slot} invalid-close S80 capture")
            if normalized(target) in defect_targets: continue
            if lstat_kind(target)[0] != "REGULAR_NONLINK" or target.read_bytes() != cap_storage:
                raise Invalid(f"{slot}: invalid-close sandbox target differs from trustworthy S80 capture")
    results = [{"slot": slot, "terminal_status": "INVALID"} for slot in ROUTES]
    result = {"schema_id": schema["controller_invalid_close"]["schema_id"], "protocol_id": ID,
              "detected_gate": detected_gate, "controller_invalid_receipt_sha256": sha(invalid_payload),
              "launch_source_receipt_sha256": launch_sha, "close_source_observation_sha256": close_sha,
              "cohort_wave_ledger_sha256": index_sha, "config_results": results, "terminal_status": "INVALID",
              "claim_boundary": "bounded_causal_simulation_invalid_no_comparison", "external_audit_status": "excluded"}
    close_schema = schema["controller_invalid_close"]
    if list(result) != close_schema["required_keys"] or any(list(row) != close_schema["config_result_keys"] for row in results):
        raise Invalid("internal controller-invalid-close schema/key order drift")
    return dump(result)


def ready(payload: bytes, output: Path) -> dict[str, Any]:
    return {"status": "READY_FOR_APPLY_PATCH", "protocol_id": ID, "output_path": normalized(output),
            "payload_encoding": "UTF-8", "payload_sha256": sha(payload), "payload_bytes": len(payload),
            "storage_sha256": sha(payload + b"\n"), "storage_bytes": len(payload) + 1,
            "storage_terminal_lf_bytes": 1, "payload": payload.decode("utf-8")}


def add_artifact_args(parser: argparse.ArgumentParser) -> None:
    for stage in ALL_CHAIN:
        parser.add_argument("--" + stage.lower(), dest=stage.lower())
        if stage in SUBJECT:
            parser.add_argument("--" + stage.lower() + "-receipt", dest=stage.lower() + "_receipt")
    parser.add_argument("--write-receipt")
    parser.add_argument("--pre-receipt")
    parser.add_argument("--apply-trace")


def add_launch_gate(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--launch-source-receipt", required=True)


def add_dispatch_gate(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--wave-dispatch-receipt", required=True)


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=__doc__)
    sub = p.add_subparsers(dest="command", required=True)
    pf = sub.add_parser("preflight"); pf.add_argument("--require-sealed", action="store_true")
    sc = sub.add_parser("source-check"); sc.add_argument("--phase", choices=("launch", "close"), required=True); sc.add_argument("--launch-receipt")
    r = sub.add_parser("render"); r.add_argument("--slot", required=True); r.add_argument("--stage", choices=SUBJECT, required=True); add_artifact_args(r); add_launch_gate(r); add_dispatch_gate(r)
    ar = sub.add_parser("make-attempt-reservation"); ar.add_argument("--slot", required=True); ar.add_argument("--stage", choices=SUBJECT, required=True)
    ar.add_argument("--rendered-packet", required=True); add_launch_gate(ar); add_dispatch_gate(ar)
    ast = sub.add_parser("make-attempt-start"); ast.add_argument("--slot", required=True); ast.add_argument("--stage", choices=SUBJECT, required=True)
    ast.add_argument("--platform-creation-metadata", required=True); add_launch_gate(ast); add_dispatch_gate(ast)
    mr = sub.add_parser("make-call-receipt"); mr.add_argument("--slot", required=True); mr.add_argument("--stage", choices=SUBJECT, required=True)
    mr.add_argument("--platform-metadata", required=True); mr.add_argument("--rendered-packet", required=True); mr.add_argument("--capture", required=True); add_artifact_args(mr); add_launch_gate(mr); add_dispatch_gate(mr)
    sf = sub.add_parser("make-subject-failure-receipt"); sf.add_argument("--slot", required=True); sf.add_argument("--stage", choices=SUBJECT, required=True)
    sf.add_argument("--failure-kind", choices=load_control("schemas.json")["subject_failure_receipt"]["failure_kinds"], required=True)
    sf.add_argument("--platform-creation-metadata", required=True); sf.add_argument("--platform-metadata")
    sf.add_argument("--rendered-packet", required=True); add_launch_gate(sf); add_dispatch_gate(sf)
    ss = sub.add_parser("score-static"); ss.add_argument("--slot", required=True); ss.add_argument("--stage", choices=SUBJECT[:-1], required=True); add_artifact_args(ss); add_launch_gate(ss); add_dispatch_gate(ss)
    tr = sub.add_parser("transform"); tr.add_argument("--slot", required=True); tr.add_argument("--stage", choices=DETERMINISTIC, required=True); add_artifact_args(tr); add_launch_gate(tr); add_dispatch_gate(tr)
    pre = sub.add_parser("s80-pre"); pre.add_argument("--slot", required=True); add_launch_gate(pre); add_dispatch_gate(pre)
    gp = sub.add_parser("s80-global-pre"); gp.add_argument("--slot", required=True); add_launch_gate(gp); add_dispatch_gate(gp)
    gpost = sub.add_parser("s80-global-post"); gpost.add_argument("--slot", required=True); gpost.add_argument("--global-pre", required=True); add_launch_gate(gpost); add_dispatch_gate(gpost)
    post = sub.add_parser("s80-post"); post.add_argument("--slot", required=True); add_artifact_args(post)
    post._option_string_actions["--pre-receipt"].required = True
    post._option_string_actions["--apply-trace"].required = True
    add_launch_gate(post); add_dispatch_gate(post)
    ex = sub.add_parser("expected-s90"); ex.add_argument("--slot", required=True); add_artifact_args(ex); add_launch_gate(ex); add_dispatch_gate(ex)
    s9 = sub.add_parser("score-s90"); s9.add_argument("--slot", required=True); add_artifact_args(s9)
    s9.add_argument("--s90", required=True); s9.add_argument("--s90-receipt", required=True); add_launch_gate(s9); add_dispatch_gate(s9)
    wc = sub.add_parser("wave-check"); wc.add_argument("--wave-index", required=True); add_launch_gate(wc)
    cc = sub.add_parser("cohort-close"); cc.add_argument("--close-source-receipt", required=True); cc.add_argument("--wave-index", required=True); add_launch_gate(cc)
    cgo = sub.add_parser("controller-gate-observation"); cgo.add_argument("--wave-id", required=True)
    cgo.add_argument("--invalid-class", required=True); cgo.add_argument("--gate-code", required=True)
    cgo.add_argument("--path")
    cic = sub.add_parser("controller-invalid-close"); cic.add_argument("--controller-invalid-receipt", required=True)
    return p


def main() -> int:
    args = parser().parse_args()
    try:
        command = args.command
        launch_sha = None
        operational = {"render", "make-attempt-reservation", "make-attempt-start", "make-call-receipt", "make-subject-failure-receipt", "score-static", "transform", "s80-pre", "s80-global-pre", "s80-global-post", "s80-post", "expected-s90", "score-s90", "wave-check", "cohort-close"}
        if command in operational:
            launch_sha = operational_gate(args)
            args._launch_sha = launch_sha
        cell_commands = {"render", "make-attempt-reservation", "make-attempt-start", "make-call-receipt", "make-subject-failure-receipt", "score-static", "transform",
                         "s80-pre", "s80-global-pre", "s80-global-post", "s80-post", "expected-s90", "score-s90"}
        if command in cell_commands:
            dispatch_stage = args.stage if command in {"render", "make-attempt-reservation", "make-attempt-start", "make-call-receipt", "make-subject-failure-receipt", "score-static", "transform"} else "S80" if command.startswith("s80-") else "S90"
            args._dispatch_payload = validate_current_dispatch(Path(args.wave_dispatch_receipt), args.slot,
                                                                dispatch_stage, launch_sha or "")
        if command == "preflight":
            out: Any = preflight(args.require_sealed)
        elif command == "source-check":
            payload = source_check(args); out = ready(payload, ROOT / "source_checks" / f"{args.phase}.json")
        elif command == "render":
            assert_subject_render_pristine(args.slot, args.stage)
            packet, _ = render_packet(args.stage, args, args.slot); out = ready(packet, packet_path(args.slot, args.stage))
        elif command == "make-attempt-reservation":
            payload = make_attempt_reservation(args, args.slot); out = ready(payload, reservation_path(args.slot, args.stage))
        elif command == "make-attempt-start":
            payload = make_attempt_start(args, args.slot); out = ready(payload, attempt_start_path(args.slot, args.stage))
        elif command == "make-call-receipt":
            payload = make_call_receipt(args, args.slot); out = ready(payload, receipt_path(args.slot, args.stage))
        elif command == "make-subject-failure-receipt":
            payload = make_subject_failure_receipt(args, args.slot); out = ready(payload, subject_failure_path(args.slot, args.stage))
        elif command == "score-static":
            out = score(args.stage, args, args.slot)
        elif command == "transform":
            payload = transform(args.stage, args, args.slot); out = ready(payload, capture_path(args.slot, args.stage))
        elif command == "s80-pre":
            payload = s80_pre(args.slot); out = ready(payload, run_path(args.slot, "controller", "S80_pre", ".json"))
        elif command == "s80-global-pre":
            payload = s80_global_pre(args.slot, args._dispatch_payload); out = ready(payload, run_path(args.slot, "controller", "S80_global_pre", ".json"))
        elif command == "s80-global-post":
            payload = s80_global_post(args.slot, Path(args.global_pre), args._dispatch_payload); out = ready(payload, run_path(args.slot, "controller", "S80_global_guard", ".json"))
        elif command == "s80-post":
            payload = s80_post(args, args.slot); out = ready(payload, run_path(args.slot, "controller", "S80_write_receipt", ".json"))
        elif command == "expected-s90":
            out = dynamic_expected_s90(args, args.slot)
        elif command == "score-s90":
            out = score("S90", args, args.slot)
        elif command == "wave-check":
            wave = validate_wave_ledger(Path(args.wave_index), launch_sha or "")
            out = {"protocol_id": ID, "status": "PASS", "cohort_wave_ledger_sha256": wave["index_sha256"],
                   "reached_waves": len(load_json_bytes(wave["index_payload"], "wave index")["waves"]),
                   "globally_unique_task_ids": len(wave["task_ids"]),
                   "globally_unique_thread_ids": len(wave["thread_ids"]),
                   "controller_invalid_receipt_sha256": wave["invalid_sha256"]}
        elif command == "cohort-close":
            payload = cohort_close(args, launch_sha or ""); out = ready(payload, RUNS / "cohort" / "cohort_close.json")
        elif command == "controller-gate-observation":
            payload = controller_gate_observation(args); out = ready(payload, controller_gate_observation_path(args.wave_id))
        elif command == "controller-invalid-close":
            payload = controller_invalid_close(args); out = ready(payload, RUNS / "cohort" / "controller_invalid_close.json")
        else:
            raise Invalid(f"unknown command: {command}")
        sys.stdout.buffer.write(dump(out) + b"\n")
        if isinstance(out, dict) and out.get("verdict") == "FAIL":
            return 1
        return 0
    except SubjectFail as exc:
        sys.stdout.buffer.write(dump({"protocol_id": ID, "status": "FAIL", "failure_class": "subject_invalid", "error": str(exc)}) + b"\n")
        return 1
    except (Invalid, AttributeError, KeyError, IndexError, TypeError, ValueError) as exc:
        sys.stdout.buffer.write(dump({"protocol_id": ID, "status": "INVALID", "failure_class": "harness_or_custody", "error": str(exc)}) + b"\n")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
