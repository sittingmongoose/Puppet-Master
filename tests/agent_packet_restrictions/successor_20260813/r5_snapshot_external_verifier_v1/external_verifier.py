#!/usr/bin/env python3
"""External read-only guard for the frozen-fixture R5 disposable candidate."""
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
CONTRACT_REL = "tests/agent_packet_restrictions/successor_20260813/r5_snapshot_external_verifier_v1/contract.json"
CONTRACT_SHA = "f88fd49855d539d58d4350d889d6aed0d61c97f9d99c9c46169a6a8cf60b6177"
CONTRACT_BYTES = 4912
ID = "PW-R4-CAUSAL-20260813.3"
PROVENANCE_SHA = "56ddf926b4106bee4e774b91b17ed4fab5ca03a7e25154bc467955bb25274c0c"
PROVENANCE_BYTES = 9327
DESCRIPTOR_SHA = "28730f6ea44a5720cb8e473f8fb736353dfe5c412e21261eacc88d70ffe46392"
FIXTURE_BYTES = 4207711
FIXTURE_LINES = 82825
FIXTURE_BINDING_SHA = "fcb6d03057853bca431661433a68657ddf8407fbcf814e2a489d00cac1cc5a49"
FIXTURE_BINDING_BYTES = 4361
HEX64 = re.compile(r"[0-9a-f]{64}\Z")

CONTROLS = [
    {"path": "protocol.json", "storage_sha256": "50245a54d97791ff890e41fe410315f229f7bb476c5c3e05a83277ce250b66a6", "storage_bytes": 119446},
    {"path": "r4_harness.py", "storage_sha256": "29d330d4dbef05a9f4e26a3bd1958cd50734d46af0d830acda5071ce4347ec82", "storage_bytes": 279029},
    {"path": "schemas.json", "storage_sha256": "b499fd2f8fdc27a2fc567def769e6de2abeef1ca388bab9ba892a1b0a636f8b2", "storage_bytes": 16354},
]

IMMUTABLE = [
    "execution_contract.json", "fixture_binding_manifest.json", "integration_contract.json",
    "oracle_artifacts/S10A.json", "oracle_artifacts/S10B.json", "oracle_artifacts/S20A.json",
    "oracle_artifacts/S20B.json", "oracle_artifacts/S30A.json", "oracle_artifacts/S30B.json",
    "oracle_artifacts/S40A.json", "oracle_artifacts/S40B.json", "oracle_artifacts/S45A.json",
    "oracle_artifacts/S45B.json", "oracle_artifacts/S50.json", "oracle_artifacts/S55.json",
    "oracle_artifacts/S60C.json", "oracle_artifacts/S60K.json", "oracle_artifacts/S60P.json",
    "oracle_artifacts/S70.json", "oracle_artifacts/S80.json", "protocol.json", "r4_harness.py",
    "schemas.json", "scorer_key.json", "source_checks/launch.json", "source_custody.json",
    "specialist_packet_template.txt", "templates/S10A.txt", "templates/S10B.txt", "templates/S30A.txt",
    "templates/S30B.txt", "templates/S40A.txt", "templates/S40B.txt", "templates/S50.txt",
    "templates/S60C.txt", "templates/S60K.txt", "templates/S60P.txt", "templates/S70.txt",
    "templates/S90.txt", "topic_a_capsule.json", "topic_b_capsule.json",
]

CHECKPOINTS = [
    "immediately_before_every_r4_harness.py_process_invocation_including_preflight_source_render_reservation_receipt_score_transform_S80_wave_and_close_commands",
    "immediately_after_each_harness_process_returns_and_before_accepting_or_apply_patch_storing_its emitted_bytes",
    "immediately_before_every_subject_task_dispatch_or_create_thread",
    "immediately_before_every_wait_threads_or_equivalent_subject_wait",
    "immediately_before_every_read_thread_or_equivalent_subject_output_read",
    "immediately_before_accepting_capturing_scoring_or_storing_any_subject_response_bytes",
]


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def dump(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


class VerifyError(Exception):
    def __init__(self, status: str, failure_class: str, detail: str,
                 observations: list[dict[str, Any]] | None = None) -> None:
        super().__init__(detail)
        self.status = status; self.failure_class = failure_class; self.detail = detail
        self.observations = [] if observations is None else observations


def no_duplicates(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate key: {key}")
        result[key] = value
    return result


def parse(storage: bytes, label: str) -> dict[str, Any]:
    try:
        value = json.loads(storage.decode("utf-8"), object_pairs_hook=no_duplicates)
    except (UnicodeDecodeError, json.JSONDecodeError, ValueError) as exc:
        raise ValueError(f"{label}: invalid JSON: {exc}") from exc
    if not isinstance(value, dict):
        raise ValueError(f"{label}: top level is not an object")
    return value


def canonical(storage: bytes, label: str) -> tuple[bytes, dict[str, Any]]:
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n"):
        raise ValueError(f"{label}: storage is not payload plus exactly one LF")
    payload = storage[:-1]; value = parse(payload, label)
    if dump(value) != payload:
        raise ValueError(f"{label}: payload is not canonical minified JSON")
    return payload, value


def valid_rel(rel: Any) -> bool:
    return (isinstance(rel, str) and rel and "\\" not in rel and not PurePosixPath(rel).is_absolute() and
            PurePosixPath(rel).as_posix() == rel and all(part not in ("", ".", "..") for part in PurePosixPath(rel).parts))


def lexical(rel: str) -> Path:
    if not valid_rel(rel):
        raise VerifyError("INVALID_EXTERNAL_VERIFIER_NO_EMPIRICAL_CREDIT", "LEXICAL_PATH_INVALID", repr(rel))
    path = Path(os.path.abspath(os.fspath(REPO / rel)))
    if os.path.commonpath((os.fspath(REPO), os.fspath(path))) != os.fspath(REPO):
        raise VerifyError("INVALID_EXTERNAL_VERIFIER_NO_EMPIRICAL_CREDIT", "LEXICAL_PATH_ESCAPE", rel)
    return path


def observe(rel: str, read_storage: bool = False) -> tuple[dict[str, Any], bytes | None]:
    path = lexical(rel); cursor = REPO
    for part in path.relative_to(REPO).parts[:-1]:
        cursor /= part
        try:
            mode = cursor.lstat().st_mode
        except FileNotFoundError:
            return {"path": rel, "state": "ABSENT", "sha256": None, "bytes": None, "error": None}, None
        except OSError as exc:
            return {"path": rel, "state": "RESOLUTION_ERROR", "sha256": None, "bytes": None, "error": type(exc).__name__}, None
        if stat.S_ISLNK(mode) or not stat.S_ISDIR(mode):
            return {"path": rel, "state": "RESOLUTION_ERROR", "sha256": None, "bytes": None, "error": "UnsafeAncestor"}, None
    try:
        before = path.lstat()
    except FileNotFoundError:
        return {"path": rel, "state": "ABSENT", "sha256": None, "bytes": None, "error": None}, None
    except OSError as exc:
        return {"path": rel, "state": "RESOLUTION_ERROR", "sha256": None, "bytes": None, "error": type(exc).__name__}, None
    state = "SYMLINK" if stat.S_ISLNK(before.st_mode) else "REGULAR_NONLINK" if stat.S_ISREG(before.st_mode) else "DIRECTORY_NONLINK" if stat.S_ISDIR(before.st_mode) else "OTHER"
    row = {"path": rel, "state": state, "sha256": None, "bytes": None, "error": None}
    if not read_storage or state != "REGULAR_NONLINK":
        return row, None
    flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
    try:
        fd = os.open(path, flags)
        try:
            opened = os.fstat(fd)
            if (opened.st_dev, opened.st_ino, opened.st_mode) != (before.st_dev, before.st_ino, before.st_mode):
                raise OSError("identity changed before read")
            chunks = []
            while True:
                chunk = os.read(fd, 1024 * 1024)
                if not chunk: break
                chunks.append(chunk)
        finally:
            os.close(fd)
        after = path.lstat()
        if (after.st_dev, after.st_ino, after.st_mode, after.st_size, after.st_mtime_ns) != \
                (before.st_dev, before.st_ino, before.st_mode, before.st_size, before.st_mtime_ns):
            raise OSError("identity changed during read")
        data = b"".join(chunks)
    except OSError as exc:
        row.update(state="RESOLUTION_ERROR", error=type(exc).__name__)
        return row, None
    row.update(sha256=sha(data), bytes=len(data)); return row, data


def required(rel: str, status: str, failure_class: str) -> tuple[dict[str, Any], bytes]:
    row, storage = observe(rel, True)
    if row["state"] != "REGULAR_NONLINK" or storage is None:
        raise VerifyError(status, failure_class, f"required regular nonlink unavailable: {rel}", [row])
    return row, storage


def load_contract() -> dict[str, Any]:
    row, storage = required(CONTRACT_REL, "INVALID_EXTERNAL_VERIFIER_NO_EMPIRICAL_CREDIT", "CONTRACT_STORAGE_INVALID")
    if (row["sha256"], row["bytes"]) != (CONTRACT_SHA, CONTRACT_BYTES):
        raise VerifyError("INVALID_EXTERNAL_VERIFIER_NO_EMPIRICAL_CREDIT", "CONTRACT_IDENTITY_DRIFT", "contract storage differs")
    try:
        _, contract = canonical(storage, "external verifier contract")
    except ValueError as exc:
        raise VerifyError("INVALID_EXTERNAL_VERIFIER_NO_EMPIRICAL_CREDIT", "CONTRACT_JSON_INVALID", str(exc)) from exc
    fixed = {
        "schema_id": "pw-r5-snapshot-external-verifier-contract-v1",
        "contract_id": "PW-R5-SNAPSHOT-EXTERNAL-GUARD-20260814.1",
        "protocol_id": ID,
        "repository_root": "/mnt/Cursor/PuppetMaster",
        "candidate_root": "tests/agent_packet_restrictions/successor_20260813/model_retest_r5_snapshot_v1",
        "snapshot_root": "tests/agent_packet_restrictions/successor_20260813/frozen_plans_snapshot_20260814_v1",
        "provenance_manifest_path": "tests/agent_packet_restrictions/successor_20260813/frozen_plans_snapshot_20260814_v1/provenance_manifest.json",
        "fixture_root": "tests/agent_packet_restrictions/successor_20260813/frozen_plans_snapshot_20260814_v1/fixture",
        "fixture_binding_manifest_path": "tests/agent_packet_restrictions/successor_20260813/model_retest_r5_snapshot_v1/fixture_binding_manifest.json",
        "launch_manifest_path": "tests/agent_packet_restrictions/successor_20260813/model_retest_r5_snapshot_v1/launch_manifest.json",
        "detached_custody_path": "tests/agent_packet_restrictions/successor_20260813/r5_snapshot_v1_launch_custody.json",
    }
    if any(contract.get(key) != value for key, value in fixed.items()):
        raise VerifyError("INVALID_EXTERNAL_VERIFIER_NO_EMPIRICAL_CREDIT", "CONTRACT_VALUE_DRIFT", "fixed contract values differ")
    if (contract.get("self_hosting_controls") != CONTROLS or contract.get("immutable_paths") != IMMUTABLE or
            contract.get("checkpoints") != CHECKPOINTS or contract.get("live_plans_policy") != "NEVER_CONSULT_AFTER_SNAPSHOT_FREEZE"):
        raise VerifyError("INVALID_EXTERNAL_VERIFIER_NO_EMPIRICAL_CREDIT", "CONTRACT_VALUE_DRIFT", "contract registries differ")
    return contract


def check_forbidden(contract: dict[str, Any]) -> list[dict[str, Any]]:
    rows = [observe(rel)[0] for rel in contract["forbidden_counted_evidence_paths"]]
    present = [row for row in rows if row["state"] != "ABSENT"]
    if present:
        raise VerifyError("ABORTED_EXTERNAL_CONTROL_EVIDENCE_NO_EMPIRICAL_CREDIT",
                          "FORBIDDEN_INTERNAL_CONTROL_EVIDENCE_PRESENT",
                          "internal controller-invalid evidence is never counted evidence", present)
    return rows


def check_controls(contract: dict[str, Any]) -> list[dict[str, Any]]:
    rows = []
    for expected in CONTROLS:
        rel = f"{contract['candidate_root']}/{expected['path']}"
        row, storage = observe(rel, True); rows.append(row)
        if (row["state"] != "REGULAR_NONLINK" or storage is None or
                (row["sha256"], row["bytes"]) != (expected["storage_sha256"], expected["storage_bytes"])):
            raise VerifyError("ABORTED_EXTERNAL_SELF_HOSTING_DRIFT_NO_EMPIRICAL_CREDIT",
                              "SELF_HOSTING_CONTROL_DRIFT", expected["path"], [row])
    return rows


def snapshot_binding(contract: dict[str, Any]) -> dict[str, Any]:
    return {
        "provenance_manifest_path": contract["provenance_manifest_path"],
        "provenance_manifest_storage_sha256": PROVENANCE_SHA,
        "provenance_manifest_storage_bytes": PROVENANCE_BYTES,
        "aggregate_descriptor_sha256": DESCRIPTOR_SHA,
        "fixture_root": contract["fixture_root"],
        "fixture_status": "unfinished_throwaway_test_fixture",
    }


def validate_snapshot(contract: dict[str, Any]) -> dict[str, Any]:
    prov_row, prov_storage = required(contract["provenance_manifest_path"],
                                      "INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "PROVENANCE_INVALID")
    if (prov_row["sha256"], prov_row["bytes"]) != (PROVENANCE_SHA, PROVENANCE_BYTES):
        raise VerifyError("INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "PROVENANCE_DRIFT", "provenance storage differs", [prov_row])
    try: provenance = parse(prov_storage, "frozen provenance")
    except ValueError as exc: raise VerifyError("INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "PROVENANCE_JSON_INVALID", str(exc)) from exc
    if (provenance.get("schema_id"), provenance.get("status"), provenance.get("fixture_root_relative")) != \
            ("pm.prompt_complexity_frozen_fixture_provenance.v1", "FROZEN_TEST_FIXTURE", "fixture"):
        raise VerifyError("INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "PROVENANCE_IDENTITY_INVALID", "provenance identity differs")
    if provenance.get("totals") != {"files": 15, "bytes": FIXTURE_BYTES, "lines": FIXTURE_LINES}:
        raise VerifyError("INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "PROVENANCE_TOTALS_INVALID", "provenance totals differ")
    rows = provenance.get("files")
    if not isinstance(rows, list) or len(rows) != 15 or [r.get("original_path") for r in rows] != sorted(r.get("original_path") for r in rows):
        raise VerifyError("INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "PROVENANCE_ROWS_INVALID", "provenance rows differ")
    data_by_path: dict[str, bytes] = {}; descriptor = []; total_bytes = 0; total_lines = 0
    for item in rows:
        rel = item.get("original_path")
        if not valid_rel(rel) or item.get("snapshot_relative_path") != f"fixture/{rel}":
            raise VerifyError("INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "PROVENANCE_PATH_INVALID", repr(rel))
        source_rel = f"{contract['fixture_root']}/{rel}"
        source_row, data = required(source_rel, "INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "FROZEN_SOURCE_INVALID")
        lines = len(data.splitlines())
        if (source_row["sha256"], source_row["bytes"], lines) != (item.get("sha256"), item.get("bytes"), item.get("lines")):
            raise VerifyError("INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "FROZEN_SOURCE_DRIFT", rel, [source_row])
        descriptor.append(f"{rel}\t{source_row['sha256']}\t{source_row['bytes']}\t{lines}\n".encode())
        data_by_path[rel] = data; total_bytes += len(data); total_lines += lines
    descriptor_bytes = b"".join(descriptor)
    if (len(descriptor_bytes), sha(descriptor_bytes), total_bytes, total_lines) != (1778, DESCRIPTOR_SHA, FIXTURE_BYTES, FIXTURE_LINES):
        raise VerifyError("INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "SNAPSHOT_AGGREGATE_INVALID", "snapshot aggregate differs")
    bind_row, bind_storage = required(contract["fixture_binding_manifest_path"],
                                      "INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "FIXTURE_BINDING_INVALID")
    if (bind_row["sha256"], bind_row["bytes"]) != (FIXTURE_BINDING_SHA, FIXTURE_BINDING_BYTES):
        raise VerifyError("INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "FIXTURE_BINDING_DRIFT", "fixture binding storage differs", [bind_row])
    try: _, binding = canonical(bind_storage, "fixture binding")
    except ValueError as exc: raise VerifyError("INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "FIXTURE_BINDING_JSON_INVALID", str(exc)) from exc
    expected_snapshot = {"provenance_manifest_path": contract["provenance_manifest_path"],
                         "provenance_manifest_storage_sha256": PROVENANCE_SHA,
                         "provenance_manifest_storage_bytes": PROVENANCE_BYTES,
                         "fixture_root": contract["fixture_root"], "files": 15,
                         "aggregate_bytes": FIXTURE_BYTES, "aggregate_lines": FIXTURE_LINES,
                         "aggregate_descriptor_sha256": DESCRIPTOR_SHA}
    if (binding.get("schema_id"), binding.get("protocol_id"), binding.get("status"), binding.get("snapshot"),
            binding.get("live_plans_policy")) != ("pw-r5-frozen-fixture-binding-v1", ID,
            "FROZEN_UNFINISHED_THROWAWAY_TEST_FIXTURE", expected_snapshot, "NEVER_CONSULT_AFTER_SNAPSHOT_FREEZE"):
        raise VerifyError("INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "FIXTURE_BINDING_VALUE_INVALID", "fixture binding values differ")
    limits = binding.get("authority_limits", {})
    if any(limits.get(key) is not False for key in ("current_plans_authority", "product_authority", "production_authority", "release_authority", "production_readiness_claim")):
        raise VerifyError("INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "FIXTURE_AUTHORITY_INVALID", "fixture authority limit differs")
    bound = binding.get("bound_inputs")
    if not isinstance(bound, list) or len(bound) != 22 or [r.get("path") for r in bound] != sorted(r.get("path") for r in bound):
        raise VerifyError("INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "FIXTURE_INPUTS_INVALID", "fixture bound-input registry differs")
    candidate = contract["candidate_root"]
    for item in bound:
        rel = item.get("path"); row, data = required(f"{candidate}/{rel}",
            "INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "FIXTURE_INPUT_INVALID")
        if list(item) != ["path", "storage_sha256", "storage_bytes"] or \
                (row["sha256"], row["bytes"]) != (item.get("storage_sha256"), item.get("storage_bytes")):
            raise VerifyError("INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "FIXTURE_INPUT_DRIFT", str(rel), [row])
    _, custody_storage = required(f"{candidate}/source_custody.json",
                                  "INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "SOURCE_CUSTODY_INVALID")
    try: custody = parse(custody_storage, "snapshot source custody")
    except ValueError as exc: raise VerifyError("INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "SOURCE_CUSTODY_JSON_INVALID", str(exc)) from exc
    custody_rows = custody.get("corpus_files")
    expected_custody = [{"path": r["original_path"], "snapshot_relative_path": r["snapshot_relative_path"],
                         "bytes": r["bytes"], "lines": r["lines"], "sha256": r["sha256"], "authority": r["authority"]}
                        for r in rows]
    if (custody.get("schema_id"), custody.get("protocol_id"), custody_rows, custody.get("totals")) != \
            ("pm.hard_causal_snapshot_source_custody.v1", ID, expected_custody,
             {"files": 15, "bytes": FIXTURE_BYTES, "lines": FIXTURE_LINES}):
        raise VerifyError("INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "SOURCE_CUSTODY_VALUE_INVALID", "source custody differs from provenance")
    if custody.get("snapshot_binding", {}).get("provenance_manifest_storage_sha256") != PROVENANCE_SHA or \
            custody.get("source_read_boundary") != "Every experiment source read resolves beneath tests/agent_packet_restrictions/successor_20260813/frozen_plans_snapshot_20260814_v1/fixture; mutable live Plans are never consulted after snapshot freeze.":
        raise VerifyError("INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "SOURCE_CUSTODY_BOUNDARY_INVALID", "source custody snapshot boundary differs")
    direct = snapshot_binding(contract); source_rows = {r["path"]: r for r in custody_rows}
    for name in ("topic_a_capsule.json", "topic_b_capsule.json", "scorer_key.json", "integration_contract.json"):
        _, storage = required(f"{candidate}/{name}", "INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "DIRECT_BINDING_INPUT_INVALID")
        try: obj = parse(storage, name)
        except ValueError as exc: raise VerifyError("INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "DIRECT_BINDING_JSON_INVALID", str(exc)) from exc
        if obj.get("snapshot_binding") != direct:
            raise VerifyError("INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "DIRECT_SNAPSHOT_BINDING_INVALID", name)
        if name.startswith("topic_"):
            for record in obj.get("records", []):
                rel = record.get("path"); text = data_by_path[rel].decode("utf-8")
                start = record.get("start_line"); end = record.get("end_line"); excerpt = record.get("excerpt")
                if record.get("source_sha256") != source_rows[rel]["sha256"] or \
                        "".join(text.splitlines(keepends=True)[start - 1:end]) != excerpt or text.count(excerpt) != 1:
                    raise VerifyError("INVALID_EXTERNAL_FROZEN_SNAPSHOT_NO_EMPIRICAL_CREDIT", "CAPSULE_EXCERPT_INVALID", record.get("source_record_id"))
    return {"provenance_storage_sha256": PROVENANCE_SHA, "fixture_binding_storage_sha256": FIXTURE_BINDING_SHA,
            "files_checked": 15, "aggregate_bytes": total_bytes, "aggregate_lines": total_lines,
            "descriptor_sha256": sha(descriptor_bytes), "bound_inputs_checked": len(bound),
            "live_plans_consulted": False}


def validate_seal(contract: dict[str, Any]) -> dict[str, Any]:
    manifest_row, manifest_storage = required(contract["launch_manifest_path"], "INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "LAUNCH_MANIFEST_INVALID")
    detached_row, detached_storage = required(contract["detached_custody_path"], "INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "DETACHED_CUSTODY_INVALID")
    try:
        manifest_payload, manifest = canonical(manifest_storage, "launch manifest")
        _, detached = canonical(detached_storage, "detached custody")
    except ValueError as exc:
        raise VerifyError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "SEAL_JSON_INVALID", str(exc), [manifest_row, detached_row]) from exc
    keys = ["schema_id", "protocol_id", "launch_status", "immutable_files", "launch_source_receipt", "configs", "subject_visibility", "external_audit_status"]
    if (list(manifest) != keys or manifest.get("schema_id") != "pw-r4-launch-manifest-v3" or
            (manifest.get("protocol_id"), manifest.get("launch_status"), manifest.get("subject_visibility"), manifest.get("external_audit_status")) !=
            (ID, "FROZEN_NOT_LAUNCHED", "only_per_call_rendered_packet_plus_one_platform_codex_delegation_wrapper", "excluded")):
        raise VerifyError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "MANIFEST_IDENTITY_INVALID", "manifest identity differs")
    expected_configs = [{"slot": "slot-alpha", "model": "gpt-5.4-mini", "thinking": "xhigh"},
                        {"slot": "slot-bravo", "model": "gpt-5.4-mini", "thinking": "medium"},
                        {"slot": "slot-charlie", "model": "gpt-5.6-luna", "thinking": "medium"}]
    if manifest.get("configs") != expected_configs:
        raise VerifyError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "MANIFEST_ROUTES_INVALID", "manifest routes differ")
    files = manifest.get("immutable_files")
    if not isinstance(files, list) or len(files) != 41 or [r.get("path") for r in files] != IMMUTABLE:
        raise VerifyError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "MANIFEST_INVENTORY_INVALID", "manifest inventory differs")
    candidate = contract["candidate_root"]; by_path = {}
    for item in files:
        rel = item.get("path")
        if list(item) != ["path", "storage_bytes", "storage_sha256"] or not valid_rel(rel) or \
                not isinstance(item.get("storage_bytes"), int) or HEX64.fullmatch(str(item.get("storage_sha256"))) is None:
            raise VerifyError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "MANIFEST_ROW_INVALID", str(rel))
        row, data = required(f"{candidate}/{rel}", "INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "IMMUTABLE_INPUT_INVALID")
        if (row["sha256"], row["bytes"]) != (item["storage_sha256"], item["storage_bytes"]):
            raise VerifyError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "IMMUTABLE_INPUT_DRIFT", rel, [row])
        by_path[rel] = item
    for control in CONTROLS:
        if by_path.get(control["path"]) != {"path": control["path"], "storage_bytes": control["storage_bytes"], "storage_sha256": control["storage_sha256"]}:
            raise VerifyError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "MANIFEST_CONTROL_ROW_INVALID", control["path"])
    if by_path["fixture_binding_manifest.json"] != {"path": "fixture_binding_manifest.json", "storage_bytes": FIXTURE_BINDING_BYTES, "storage_sha256": FIXTURE_BINDING_SHA}:
        raise VerifyError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "MANIFEST_FIXTURE_BINDING_INVALID", "fixture binding row differs")
    launch_rel = f"{candidate}/source_checks/launch.json"; _, launch_storage = required(launch_rel, "INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "LAUNCH_SOURCE_RECEIPT_INVALID")
    try: launch_payload, launch = canonical(launch_storage, "launch source receipt")
    except ValueError as exc: raise VerifyError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "LAUNCH_SOURCE_RECEIPT_JSON_INVALID", str(exc)) from exc
    _, custody_storage = required(f"{candidate}/source_custody.json", "INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "SOURCE_CUSTODY_INVALID")
    expected_launch = {"schema_id": "pw-r4-source-check-receipt-v3", "protocol_id": ID, "phase": "launch",
                       "source_custody_sha256": sha(custody_storage), "files_checked": 15,
                       "aggregate_bytes": FIXTURE_BYTES, "descriptor_sha256": DESCRIPTOR_SHA,
                       "normalized_unique_contained": True, "status": "PASS"}
    if launch != expected_launch:
        raise VerifyError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "LAUNCH_SOURCE_RECEIPT_VALUE_INVALID", "launch source receipt differs")
    expected_binding = {"path": launch_rel, "payload_sha256": sha(launch_payload), "payload_bytes": len(launch_payload),
                        "storage_sha256": sha(launch_storage), "storage_bytes": len(launch_storage)}
    if manifest.get("launch_source_receipt") != expected_binding or by_path["source_checks/launch.json"] != \
            {"path": "source_checks/launch.json", "storage_bytes": len(launch_storage), "storage_sha256": sha(launch_storage)}:
        raise VerifyError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "MANIFEST_LAUNCH_BINDING_INVALID", "manifest launch-source binding differs")
    expected_detached = {"schema_id": "pw-r4-detached-launch-custody-v2", "protocol_id": ID,
                         "launch_manifest_path": "model_retest_r5_snapshot_v1/launch_manifest.json",
                         "launch_manifest_payload_sha256": sha(manifest_payload), "launch_manifest_payload_bytes": len(manifest_payload),
                         "launch_manifest_storage_sha256": sha(manifest_storage), "launch_manifest_storage_bytes": len(manifest_storage),
                         "status": "SEALED_NOT_LAUNCHED", "external_audit_status": "excluded"}
    if detached != expected_detached:
        raise VerifyError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "DETACHED_BINDING_INVALID", "detached custody differs")
    return {"launch_manifest_storage_sha256": manifest_row["sha256"], "launch_manifest_storage_bytes": manifest_row["bytes"],
            "detached_custody_storage_sha256": detached_row["sha256"], "detached_custody_storage_bytes": detached_row["bytes"],
            "immutable_inventory_count": len(files), "fixture_binding_row_exact": True}


def parse_command(argv: list[str]) -> tuple[str, str | None]:
    if argv == ["preseal-check"]: return "preseal-check", None
    if len(argv) == 3 and argv[:2] == ["checkpoint", "--checkpoint"] and argv[2] in CHECKPOINTS:
        return "checkpoint", argv[2]
    raise VerifyError("INVALID_EXTERNAL_VERIFIER_NO_EMPIRICAL_CREDIT", "INVOCATION_INVALID", "expected preseal-check or checkpoint --checkpoint <exact enum>")


def result(command: str | None, checkpoint: str | None, status: str, failure_class: str | None,
           detail: str | None, controls: list[dict[str, Any]] | None, snapshot: dict[str, Any] | None,
           forbidden: list[dict[str, Any]] | None, seal: dict[str, Any] | None,
           observations: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    return {"schema_id": "pw-r5-snapshot-external-verifier-result-v1", "contract_id": "PW-R5-SNAPSHOT-EXTERNAL-GUARD-20260814.1",
            "command": command, "checkpoint": checkpoint, "status": status, "failure_class": failure_class,
            "detail": detail, "empirical_credit": "NOT_GRANTED_BY_THIS_VERIFIER" if status == "PASS" else "ZERO",
            "controls": controls, "snapshot": snapshot, "forbidden_paths": forbidden, "seal": seal,
            "observations": [] if observations is None else observations}


def main(argv: list[str]) -> int:
    command = None; checkpoint = None
    try:
        command, checkpoint = parse_command(argv)
        contract = load_contract(); check_forbidden(contract)
        controls = check_controls(contract); forbidden = check_forbidden(contract)
        snapshot = validate_snapshot(contract); check_forbidden(contract)
        launch_state = observe(contract["launch_manifest_path"])[0]["state"]
        detached_state = observe(contract["detached_custody_path"])[0]["state"]
        if command == "preseal-check":
            if (launch_state == "ABSENT") != (detached_state == "ABSENT"):
                raise VerifyError("INVALID_EXTERNAL_SEAL_CUSTODY_NO_EMPIRICAL_CREDIT", "PARTIAL_SEAL", "launch manifest and detached custody differ in presence")
            seal = None if launch_state == "ABSENT" else validate_seal(contract)
        else:
            seal = validate_seal(contract)
        check_forbidden(contract)
        sys.stdout.buffer.write(dump(result(command, checkpoint, "PASS", None, None, controls, snapshot, forbidden, seal)) + b"\n")
        return 0
    except VerifyError as exc:
        sys.stdout.buffer.write(dump(result(command, checkpoint, exc.status, exc.failure_class, exc.detail,
                                            None, None, None, None, exc.observations)) + b"\n")
        return 2
    except Exception as exc:
        sys.stdout.buffer.write(dump(result(command, checkpoint, "INVALID_EXTERNAL_VERIFIER_NO_EMPIRICAL_CREDIT",
                                            "UNEXPECTED_VERIFIER_ERROR", type(exc).__name__, None, None, None, None)) + b"\n")
        return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
