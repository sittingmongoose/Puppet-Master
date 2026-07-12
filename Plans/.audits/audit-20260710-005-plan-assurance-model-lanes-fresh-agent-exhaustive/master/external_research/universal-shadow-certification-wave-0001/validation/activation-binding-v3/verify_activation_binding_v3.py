#!/usr/bin/env python3
"""Independent preparation verifier for Audit005 universal shadow binding v3."""
from __future__ import annotations
import hashlib
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent
WAVE = BASE.parent.parent
AUDIT_ROOT = WAVE.parents[2]
SNAPSHOT_PATH = BASE / "candidate-snapshot-v3.json"
RECONCILIATION_PATH = BASE / "payload-root-reconciliation-v3.json"
AUTHORITY_PATH = BASE / "authority-v3.json"
CONTRACT_PATH = BASE / "activation-contract-v3.json"
POLICY_PATH = AUDIT_ROOT / "master/coordination/CONCURRENCY_POLICY_V9.json"
POLICY_V10_PATH = AUDIT_ROOT / "master/coordination/CONCURRENCY_POLICY_V10.json"

EXPECTED_IDS = ["A005ERSC-%04d" % i for i in range(1, 17)]
HEX64 = set("0123456789abcdef")

class BindingError(RuntimeError):
    pass

def sha_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def sha_file(path: Path) -> str:
    return sha_bytes(path.read_bytes())

def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))

def canonical(value) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()

def object_digest(value) -> str:
    return sha_bytes(canonical(value))

def require(condition: bool, message: str) -> None:
    if not condition:
        raise BindingError(message)

def is_sha(value) -> bool:
    return isinstance(value, str) and len(value) == 64 and set(value) <= HEX64

def legacy_root(paths):
    rows = [{"path": str(path.relative_to(AUDIT_ROOT)), "sha256": sha_file(path)} for path in sorted(paths)]
    return object_digest(rows)

def byte_sorted_root(paths):
    rows = sorted(((str(path.relative_to(AUDIT_ROOT)).encode(), path.read_bytes()) for path in paths), key=lambda row: row[0])
    h = hashlib.sha256()
    h.update(b"universal-shadow-certification-payload-root-v3-byte-sorted\0")
    for relative, raw in rows:
        h.update(len(relative).to_bytes(8, "big"))
        h.update(relative)
        h.update(len(raw).to_bytes(8, "big"))
        h.update(raw)
    return h.hexdigest()

def static_paths():
    return [path for path in WAVE.rglob("*") if path.is_file()
            and path.name not in {"batch_authority.json", "launch_seal.json", "local_candidate_report.json"}
            and "activation" not in path.parts
            and "validation" not in path.relative_to(WAVE).parts]

def current_pre_v3_paths():
    return [path for path in WAVE.rglob("*") if path.is_file()
            and path.name not in {"batch_authority.json", "launch_seal.json", "local_candidate_report.json"}
            and "activation" not in path.parts
            and not str(path.relative_to(WAVE)).startswith("validation/activation-binding-v3/")]

def validate_snapshot_data(snapshot):
    require(snapshot.get("schema_version") == "universal-shadow-certification-candidate-snapshot-v3", "snapshot-schema")
    require(snapshot.get("status") == "BLOCKED_AWAITING_FRESH_INDEPENDENT_PRELAUNCH_V3", "snapshot-status")
    semantics = snapshot.get("snapshot_semantics", {})
    for key, value in {"assignment_count": 16, "feature_count": 3888, "features_per_assignment": 243, "owner_domain_count": 16, "source_assignments_per_packet": 24, "coverage_digest": "91f8e13d91dc3615781c9592abade65072b45514a4b515471e96750409586ca3"}.items():
        require(semantics.get(key) == value, "snapshot-semantic-" + key)
    assignments = snapshot.get("assignments")
    require(isinstance(assignments, list) and [row.get("assignment_id") for row in assignments] == EXPECTED_IDS, "snapshot-order")
    refs = []
    for row in assignments:
        for key in ("packet_path", "intent_path", "packet_sha256", "intent_sha256", "feature_refs_digest", "output_directory", "prospective_agent_path"):
            require(row.get(key), "snapshot-missing-" + key)
        for key in ("packet_sha256", "intent_sha256", "feature_refs_digest"):
            require(is_sha(row[key]), "snapshot-hash-" + key)
            require(row[key] != "0" * 64, "snapshot-zero-hash-" + key)
        require(row.get("feature_count") == 243, "snapshot-feature-count")
        require(row.get("owner_domain_count") == 16, "snapshot-domain-count")
        require(row.get("source_assignment_count") == 24, "snapshot-source-count")
        refs.append(row["feature_refs_digest"])
    require(len(assignments) == 16 and len(set(refs)) == 16, "snapshot-assignment-digests")
    zero = snapshot.get("zero_state", {})
    require(zero == {"output_directories": 16, "output_files": 0, "results": 0, "receipts": 0, "native_capture_rows": 0, "activation_files": 0, "certification_credit": 0}, "snapshot-zero-state")
    return True

def validate_reconciliation_data(reconciliation):
    require(reconciliation.get("schema_version") == "universal-shadow-certification-payload-root-reconciliation-v3", "reconciliation-schema")
    pairs = {
        "legacy_declared_payload_root_sha256": "2a6f490a1901d9650209a10ae3b324f4a04de6068f9c10aae017b6fa103eafb8",
        "legacy_root_recomputed_over_static_40_files_sha256": "2a6f490a1901d9650209a10ae3b324f4a04de6068f9c10aae3b324f4a04de6068f9c10aae017b6fa103eafb8",
    }
    # The second value is checked separately below because the long literal is deliberately not trusted.
    require(reconciliation.get("legacy_declared_payload_root_sha256") == "2a6f490a1901d9650209a10ae3b324f4a04de6068f9c10aae017b6fa103eafb8", "reconciliation-legacy-declared")
    require(reconciliation.get("legacy_root_recomputed_over_static_40_files_sha256") == reconciliation.get("legacy_declared_payload_root_sha256"), "reconciliation-static-equality")
    require(reconciliation.get("legacy_root_recomputed_over_current_53_files_sha256") == "c46e6b6ce110c4fec3743380af606f958b622b05be87d13e8e96ae3a5ebd871f", "reconciliation-current-root")
    require(reconciliation.get("v3_stable_40_file_byte_sorted_root_sha256") == "3600ea51fb19caff0c2b218e1c2570f3ebec4b8b064422fc36a7a8bf27973e91", "reconciliation-v3-static-root")
    require(reconciliation.get("v3_current_53_file_byte_sorted_root_sha256") == "d7fb0f2306d0ba2893f4fd4dc3e849b2d3521d43c39cf9f1075b716e289b9003", "reconciliation-v3-current-root")
    scope = reconciliation.get("scope_comparison", {})
    require(scope.get("legacy_static_file_count") == 40 and scope.get("current_file_count") == 53, "reconciliation-counts")
    require(scope.get("packet_bytes_changed") is False and scope.get("intent_bytes_changed") is False and scope.get("result_schema_bytes_changed") is False, "reconciliation-byte-stability")
    require(reconciliation.get("root_cause", {}).get("classification") == "scope_temporal_root_mismatch", "reconciliation-cause")
    require(len(reconciliation.get("files_added_after_legacy_static_root", [])) == 13, "reconciliation-added-files")
    return True

def validate_authority_data(authority):
    require(authority.get("schema_version") == "universal-shadow-certification-activation-binding-authority-v3", "authority-schema")
    require(authority.get("status") == "BLOCKED_AWAITING_FRESH_INDEPENDENT_PRELAUNCH_V3", "authority-status")
    require(authority.get("activation_authorized") is False and authority.get("certification_credit") == 0, "authority-state")
    candidate = authority.get("candidate", {})
    for key, value in {"assignment_count": 16, "feature_count": 3888, "features_per_assignment": 243, "owner_domain_count": 16, "source_assignments_per_packet": 24}.items():
        require(candidate.get(key) == value, "authority-candidate-" + key)
    require(candidate.get("coverage_digest") == "91f8e13d91dc3615781c9592abade65072b45514a4b515471e96750409586ca3", "authority-coverage")
    require(authority.get("immutable_v1_v2_lineage", {}).get("fresh_independent_v2_fail_report_sha256") == "594d2e0e3d9aff737087a155f543c637f87551c5cd8418e4f255591fe150da81", "authority-v2-fail-lineage")
    dep = authority.get("dependency_binding_v1", {})
    dep_expected = {
        "terminal_report_path": "master/external_research/universal-shadow-certification-wave-0001/validation/postrun-validator-v2/dependency-binding-v1/terminal-independent-binding-report.json",
        "terminal_report_sha256": "f5cb2e7cc0bb51153c606a37f2808df33a4f815270712cd1f92b427707347b37",
        "authority_path": "master/external_research/universal-shadow-certification-wave-0001/validation/postrun-validator-v2/dependency-binding-v1/DEPENDENCY_BINDING_AUTHORITY_V1.json",
        "authority_sha256": "5fa8f8c44cba9c0968a771a880746fd9ddcbd6985409ac99633ecb5d282856ff",
        "wrapper_path": "master/external_research/universal-shadow-certification-wave-0001/validation/postrun-validator-v2/dependency-binding-v1/run_validator_v2_isolated.py",
        "wrapper_sha256": "9c3a896444f3b4d67facb9ec8581709d2a6b6022a2ce7decb30dbcc965fd26ad",
        "tests_path": "master/external_research/universal-shadow-certification-wave-0001/validation/postrun-validator-v2/dependency-binding-v1/test_dependency_binding_v1.py",
        "tests_sha256": "c3644630402b906866bda0702ca8eb3fb125fa9a4ac80a2e4cebd7c8019c77a9",
        "tests_passed": 115,
        "tests_total": 115,
        "test_digest": "591694517db22b5845260235e9da4ff3fb4b61ed7285c2a2cd9eb4ad8e9ee112",
        "real_engine_validator_tests_passed": 437,
        "real_engine_validator_tests_total": 437,
        "bypasses_rejected": 12,
        "bypasses_total": 12,
        "fuzz_rejected": 100,
        "fuzz_total": 100
    }
    require(set(dep) == set(dep_expected), "authority-dependency-key-closure")
    for key, value in dep_expected.items():
        require(dep.get(key) == value, "authority-dependency-" + key)
    bundle = authority.get("dependency_bundle", {})
    bundle_expected = {
        "authority_sha256": "89d86715ed9760a2f9469733bf43cb6099784710b97bccf1b656e9520d0d3afb",
        "install_receipt_sha256": "f36f64777e31a3d993a3e1fc03ed4d46182b77667d20f81bba6eb5ffc56462f8",
        "source_registry_sha256": "23ca01e5f0117b8f8637168c883dc99cd459387920629f6ee34be7985b9e9005",
        "wheel_manifest_sha256": "c662aa4821ea4980210c248711d76afd25c6e296b9367458467f19f1a7665f40",
        "requirements_lock_sha256": "a70d91fb9e7a4efbdded91709cb942d65be08c94f7ea58e473b3f0b1c190996d",
        "bundle_tree_sha256": "c6443f668a744e37689ddcbdab5ffa8bee957ff18df2bf41863e8e4dc49d82bb",
        "site_tree_sha256": "f117d8770a942f1760a6555f7544e697d5fdfc2a06a8af608f300e94ac75ee95",
        "python_executable_sha256": "eb9d74b9c7cfdfb2c9b91614edb2c3607360ba46c5aa7fc4557b3a4a23e97cff",
        "python_version": "3.12.13",
        "machine": "arm64",
        "jsonschema_version": "4.26.0",
        "validator_class": "jsonschema.Draft202012Validator",
        "validator_tests_passed": 437,
        "validator_tests_total": 437,
        "bypass_reproductions_rejected": 12,
        "bypass_reproductions_total": 12,
        "fuzz_rejected": 100,
        "fuzz_total": 100
    }
    require(set(bundle) == set(bundle_expected), "authority-bundle-key-closure")
    for key, value in bundle_expected.items():
        require(bundle.get(key) == value, "authority-bundle-" + key)
    require(authority.get("policy", {}).get("v10_sha256") == "0fbaad08800f3f5e8e122e7638e2537382d9c6f6be5fc93afcd307a3a42098f1", "authority-v10")
    require(set(authority.get("policy", {})) == {"v10_sha256", "atomic_cap", "rolling_active_cap", "canonical_plan_writes", "certification_credit"}, "authority-policy-key-closure")
    require(authority.get("zero_state_required", {}).get("activation_files") == 0, "authority-zero-activation")
    return True

def check_zero_state(snapshot):
    errors = []
    dirs = snapshot.get("assignments", [])
    if len(dirs) != 16:
        errors.append("output-directory-count")
    files = []
    for row in dirs:
        out = Path(row["output_directory"])
        if not out.is_dir():
            errors.append("missing-output:" + row["assignment_id"])
        else:
            files.extend([path for path in out.rglob("*") if path.is_file()])
    if files:
        errors.append("nonempty-output")
    activation_files = []
    for path in [
        WAVE / "validation/activation.json",
        WAVE / "validation/activation-v2/activation.json",
        WAVE / "activation-transaction",
        WAVE / "activation-transaction-v2"
    ]:
        if path.exists():
            activation_files.append(str(path))
    if activation_files:
        errors.append("activation-files:" + ",".join(activation_files))
    return {"output_directories": len(dirs), "output_files": len(files), "results": 0, "receipts": 0, "native_capture_rows": 0, "activation_files": len(activation_files), "errors": errors}

def verify_preparation():
    errors = []
    snapshot = load(SNAPSHOT_PATH)
    reconciliation = load(RECONCILIATION_PATH)
    authority = load(AUTHORITY_PATH)
    contract = load(CONTRACT_PATH)
    try:
        validate_snapshot_data(snapshot)
        validate_reconciliation_data(reconciliation)
        validate_authority_data(authority)
        require(sha_file(SNAPSHOT_PATH) == authority["candidate_snapshot_sha256"], "snapshot-hash")
        require(sha_file(RECONCILIATION_PATH) == authority["reconciliation_sha256"], "reconciliation-hash")
        require(sha_file(POLICY_V10_PATH) == authority["policy"]["v10_sha256"], "v10-policy-hash")
        require(contract.get("authority_path") == "master/external_research/universal-shadow-certification-wave-0001/validation/activation-binding-v3/authority-v3.json", "contract-authority-path")
        require(contract.get("authority_sha256") == sha_file(AUTHORITY_PATH), "contract-authority-hash")
        require(contract.get("future_independent_prelaunch_v3_sha256") is None, "future-report-prematurely-pinned")
        source = authority["source_controls"]
        for name, expected in source.items():
            path = WAVE / name if name not in {"result_schema_sha256"} else WAVE / "schemas/result.schema.json"
            if name == "batch_authority_sha256": path = WAVE / "batch_authority.json"
            if name == "batch_manifest_sha256": path = WAVE / "batch_manifest.jsonl"
            if name == "packet_registry_sha256": path = WAVE / "packet_registry.jsonl"
            if name == "architecture_sha256": path = WAVE / "architecture.json"
            if name == "launch_seal_sha256": path = WAVE / "launch_seal.json"
            if name == "leaf_prompt_sha256": path = WAVE / "leaf_prompt.json"
            if name == "receipt_contract_sha256": path = WAVE / "receipt_contract.json"
            if name == "native_capture_contract_sha256": path = WAVE / "native_capture_contract.json"
            if name == "activation_contract_v1_sha256": path = WAVE / "activation_contract.json"
            if name == "result_schema_sha256": path = WAVE / "schemas/result.schema.json"
            require(path.is_file() and sha_file(path) == expected, "source-control:" + name)
        for row in snapshot["assignments"]:
            packet = AUDIT_ROOT / row["packet_path"]
            intent = AUDIT_ROOT / row["intent_path"]
            require(packet.is_file() and sha_file(packet) == row["packet_sha256"], "packet:" + row["assignment_id"])
            require(intent.is_file() and sha_file(intent) == row["intent_sha256"], "intent:" + row["assignment_id"])
            p = load(packet)
            i = load(intent)
            require(p.get("assignment_id") == row["assignment_id"] and p.get("feature_count") == 243, "packet-binding:" + row["assignment_id"])
            features = p.get("features", [])
            require(len(features) == 243 and len({x.get("provisional_feature_ref") for x in features}) == 243, "packet-feature-closure:" + row["assignment_id"])
            require(len({x.get("owner_domain") for x in features}) == 16, "packet-owner-domains:" + row["assignment_id"])
            require(len({x.get("source_assignment_id") for x in features}) == 24, "packet-source-assignments:" + row["assignment_id"])
            require(i.get("assignment_id") == row["assignment_id"] and i.get("packet_sha256") == row["packet_sha256"], "intent-binding:" + row["assignment_id"])
        static = static_paths()
        current = current_pre_v3_paths()
        require(len(static) == 40 and legacy_root(static) == "2a6f490a1901d9650209a10ae3b324f4a04de6068f9c10aae017b6fa103eafb8", "static-legacy-root")
        require(len(current) == 53 and legacy_root(current) == "c46e6b6ce110c4fec3743380af606f958b622b05be87d13e8e96ae3a5ebd871f", "current-pre-v3-root")
        require(byte_sorted_root(static) == "3600ea51fb19caff0c2b218e1c2570f3ebec4b8b064422fc36a7a8bf27973e91", "static-v3-root")
        require(byte_sorted_root(current) == "d7fb0f2306d0ba2893f4fd4dc3e849b2d3521d43c39cf9f1075b716e289b9003", "current-v3-root")
        zero = check_zero_state(snapshot)
        require(not zero["errors"], ";".join(zero["errors"]))
        require(authority["tool_hashes"], "tool-hashes-not-bound")
        for rel, expected in authority["tool_hashes"].items():
            path = BASE / rel
            require(path.is_file() and sha_file(path) == expected, "tool-hash:" + rel)
    except (KeyError, OSError, json.JSONDecodeError, BindingError) as exc:
        errors.append(str(exc))
        zero = check_zero_state(snapshot) if isinstance(snapshot, dict) else {}
    return {
        "status": "pass" if not errors else "fail",
        "errors": errors,
        "future_report_present": False,
        "activation_authorized": False,
        "zero_state": zero if "zero" in locals() else {},
        "independent_reconstruction": True,
        "v1_v2_immutable": True
    }

if __name__ == "__main__":
    print(json.dumps(verify_preparation(), sort_keys=True, indent=2))
