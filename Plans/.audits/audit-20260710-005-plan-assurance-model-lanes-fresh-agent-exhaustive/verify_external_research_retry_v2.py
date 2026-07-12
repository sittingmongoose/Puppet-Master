#!/usr/bin/env python3
import hashlib
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
CONTROLLER = "019f5078-6501-7223-b52f-2251010bdc41"
MODEL = "gpt-5.6-luna"
EFFORT = "max"
ATTEMPT = "attempt-0002"
SPRINT = "sprint-wave-0001"
RETRY = Path(__file__).resolve().parent / "master" / "external_research" / SPRINT / "retry-attempt-0002"
OUTPUT = Path(__file__).resolve().parent / "external_research_v1"
OLD = Path(__file__).resolve().parent / "master" / "external_research" / SPRINT
POLICY_SHA = "5d08356b2877734aa4a6e964675fc32abae6f57d83ede5dc11f38e9cea4a7bb3"

OLD_PINS = {
    "failure_lineage": ("attempt-0001-failure-lineage.json", "adcfd5ac6bb79a6cfbd1f4f57f72c341d83b1373008f80e1f8dc4f43512d76f5"),
    "manifest": ("manifest.json", "f96c3f4074c772bb4e74f565465c0ecd5e12e26f8ed9b7fed1dac971c1394816"),
    "leaf_prompt": ("leaf_prompt.json", "8211ab8640b93312f7fcc10695cecfb607b721032c47450bc318955e4c1d72b8"),
    "result_schema": ("schema/external_research_result.schema.json", "63377ebb7304340375ddcbd896b612e50bfa17382b7f61ce1ca21da773464da5"),
}
NEW_PINS = {
    "schema": "1c43b12f87d2270bc30cd2afb11b56b23fd086dd2369a4c373c6d3a6c0d0bf67",
    "leaf_prompt": "c1de0bd86b0d5a11a4b3fca77b6bde2603d517c46bb9d33c3013e1fbaedfa1f4",
    "receipt_contract": "82fb07ee87f7692a7ee9f43b2e20e6e43771de829b823ee5056a3aadae358777",
    "manifest": "60799e4897738803765e13e2520c2aecc0f836e9aa8e61976eab0a33d85d0afc",
    "authority": "0573e393f643b50387589e4c975e8fd6087ca24c844a07a9db38373df894c3d2",
    "launch_seal": "4bc3ed733462bf3a9b086b92262763a755fab660ae97b148bc09a12148e59828",
    "packet_set": "36f7e8ed58f9e7a50512c19c9621cc0d4df82bb2020dddffa8a18c5335b98212",
    "intent_set": "c2cc6099e17eda8a38611280005cd5cfd7df81a1b3fc24456642b606d0b75735",
}
PACKET_PINS = {
    "ER-0001": "aaa1c79fe337f7f024d79492b194d23bb8cef7dd6491769bab02d0f2eb37b6f3",
    "ER-0002": "e15984e6b7f3286ca3dc0a75468bbc7b4f00f65f34fd71a36d7602a144c61a0b",
    "ER-0003": "88874ac8593957e9adb768d926365cd8e7f2fa707fa95c59fed7197faca8464c",
    "ER-0004": "aba9641286ad3c05a3ec51f295f26996c48e906551abe8f277141aa959fa530f",
    "ER-0005": "12467ca39122329e5719bb93ec4e0207576dd2e5eed80586baeabd013b8f7a8c",
    "ER-0006": "e4f2ffdff00f01da59f76aed11152461773d654b9451b482db45809b92f0fa23",
    "ER-0007": "487406a5a5eeff97cd3058c027697815f76530b0ea87ef4dcdc1df7c2c75c2d3",
    "ER-0008": "4276e76c57f3028df4f5a71f7d1df6764d6a34f4c74d32b92d6f8830206efc33",
}
INTENT_PINS = {
    "ER-0001": "2c20a4a511a198fda5fa90dca599a77055d0ace5ea45f8c9ec71bfa889e09534",
    "ER-0002": "33ad812ca20a48d85481ba9a76efc6264e8493baa8096c4878bda7fdcc104a8e",
    "ER-0003": "51cb4ac2ce71c3ce8eccc711411423075379b8f23203a14eaa748d24412ea83b",
    "ER-0004": "054b48c5adf0a8bc481a5a6c064a7d2ea9d0f911f263e7993c2a81cf33b15ecc",
    "ER-0005": "632ee4542b2eb3c9811abcd17c30f9e278c2cc083fdf4bf7681e46e3ec07c892",
    "ER-0006": "ad8a09c739160220883f1e455279220fbd4d4651f49d481d1eadfd33ad535fea",
    "ER-0007": "1c8094e5600e2ecddc2657960e48460c52b30b3212709aba67b408ed5b7bacfa",
    "ER-0008": "cae52c087a0081a4729611b20b400c1fdd278b56c1782012c79e3fda6af76757",
}
EXPECTED = {
    "ER-0001": {
        "topic": "Undo/revert/rewind separation and safe recovery UX",
        "feature_refs": ["OPF::A005OM-0006::PF-0169", "OPF::A005OM-0007::PF-0001", "OPF::A005OM-0007::PF-0002"],
        "owner_domains": ["recovery_state_and_concurrency"], "cross_cutting": False,
    },
    "ER-0002": {
        "topic": "Blocked outcome semantics and precedence among policy, approval, preflight, and execution failures",
        "feature_refs": ["OPF::A005OM-0010::PF-0043", "OPF::A005OM-0011::PF-0055"],
        "owner_domains": ["orchestration_runtime_execution"], "cross_cutting": False,
    },
    "ER-0003": {
        "topic": "Versioned file-revert operation contracts versus whole-turn or conversation rewind",
        "feature_refs": ["OPF::A005OM-0018::PF-0071", "OPF::A005OM-0019::PF-0066"],
        "owner_domains": ["source_control_workspace_code", "orchestration_runtime_execution"], "cross_cutting": False,
    },
    "ER-0004": {
        "topic": "Browser context sharing authority versus capture-chip revoke/send races",
        "feature_refs": ["OPF::A005OM-0021::PF-0035", "OPF::A005OM-0022::PF-0057"],
        "owner_domains": ["permissions_security_privacy"], "cross_cutting": False,
    },
    "ER-0005": {
        "topic": "Permission, security, and privacy lifecycle: consent, revocation, least privilege, race handling, audit, and recovery",
        "feature_refs": [], "owner_domains": ["permissions_security_privacy"], "cross_cutting": True,
    },
    "ER-0006": {
        "topic": "Tool and MCP trust: capability discovery, per-call approval, scoped credentials, revocation, provenance, and malicious-tool containment",
        "feature_refs": [], "owner_domains": ["tools_integrations_mcp"], "cross_cutting": True,
    },
    "ER-0007": {
        "topic": "Automated plan/spec completeness assurance: traceability, ambiguity detection, design-by-contract, hazard analysis, scenario coverage, and competitive planning systems",
        "feature_refs": [], "owner_domains": ["planning_specification_governance"], "cross_cutting": True,
    },
    "ER-0008": {
        "topic": "Agentic plan-to-code preflight and adversarial certification: executable acceptance criteria, simulation, negative-space review, evidence gates, human override, and regression traceability",
        "feature_refs": [], "owner_domains": ["orchestration_runtime_execution", "planning_specification_governance"], "cross_cutting": True,
    },
}
for _assignment_id, _assignment in EXPECTED.items():
    _assignment["assignment_id"] = _assignment_id

def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def load_json(path):
    return json.loads(Path(path).read_text())

def type_ok(value, expected):
    if isinstance(expected, list):
        return any(type_ok(value, x) for x in expected)
    return {
        "object": isinstance(value, dict),
        "array": isinstance(value, list),
        "string": isinstance(value, str),
        "number": isinstance(value, (int, float)) and not isinstance(value, bool),
        "integer": isinstance(value, int) and not isinstance(value, bool),
        "boolean": isinstance(value, bool),
        "null": value is None,
    }.get(expected, True)

def schema_errors(value, schema, path="$"):
    errors = []
    if "const" in schema and value != schema["const"]:
        errors.append(f"{path}:const")
    if "enum" in schema and value not in schema["enum"]:
        errors.append(f"{path}:enum")
    if "type" in schema and not type_ok(value, schema["type"]):
        return errors + [f"{path}:type"]
    if isinstance(value, dict):
        for key in schema.get("required", []):
            if key not in value:
                errors.append(f"{path}.{key}:required")
        if schema.get("additionalProperties") is False:
            allowed = set(schema.get("properties", {}))
            for key in value:
                if key not in allowed:
                    errors.append(f"{path}.{key}:additional")
        for key, subschema in schema.get("properties", {}).items():
            if key in value:
                errors.extend(schema_errors(value[key], subschema, f"{path}.{key}"))
    elif isinstance(value, list):
        if len(value) < schema.get("minItems", 0):
            errors.append(f"{path}:minItems")
        if "maxItems" in schema and len(value) > schema["maxItems"]:
            errors.append(f"{path}:maxItems")
        if schema.get("uniqueItems"):
            normalized = [json.dumps(x, sort_keys=True, separators=(",", ":")) for x in value]
            if len(normalized) != len(set(normalized)):
                errors.append(f"{path}:uniqueItems")
        if "items" in schema:
            for index, item in enumerate(value):
                errors.extend(schema_errors(item, schema["items"], f"{path}[{index}]"))
    elif isinstance(value, str):
        if len(value) < schema.get("minLength", 0):
            errors.append(f"{path}:minLength")
        if "pattern" in schema and not re.search(schema["pattern"], value):
            errors.append(f"{path}:pattern")
    elif isinstance(value, (int, float)) and not isinstance(value, bool):
        if "minimum" in schema and value < schema["minimum"]:
            errors.append(f"{path}:minimum")
        if "maximum" in schema and value > schema["maximum"]:
            errors.append(f"{path}:maximum")
    return errors

def direct_url_errors(url, path):
    errors = []
    if not isinstance(url, str) or not url.startswith("https://") or any(c.isspace() for c in url):
        errors.append(f"{path}:non_direct_url")
        return errors
    parsed = urlparse(url)
    if not parsed.netloc or parsed.fragment:
        errors.append(f"{path}:non_direct_url")
    lowered = url.lower()
    search_markers = ("google.com/search", "bing.com/search", "duckduckgo.com/?q", "search.yahoo", "/search?", "search-result")
    if any(marker in lowered for marker in search_markers):
        errors.append(f"{path}:search_result_url")
    return errors

def result_semantic_errors(result, schema):
    errors = []
    errors.extend(schema_errors(result, schema))
    if not isinstance(result, dict):
        return errors
    source_items = result.get("sources", [])
    source_urls = set()
    for index, source in enumerate(source_items):
        if isinstance(source, dict):
            url = source.get("url")
            errors.extend(direct_url_errors(url, f"$.sources[{index}].url"))
            if isinstance(url, str):
                if url in source_urls:
                    errors.append(f"$.sources[{index}].url:duplicate")
                source_urls.add(url)
            if source.get("access_date") != "2026-07-11":
                errors.append(f"$.sources[{index}].access_date")
    availability = result.get("source_availability")
    if availability == "available" and len(source_items) < 8:
        errors.append("$.sources:insufficient_without_unavailable_evidence")
    if availability in ("limited", "unavailable") and len(source_items) < 8 and not result.get("unavailable_evidence"):
        errors.append("$.unavailable_evidence:required_for_underfill")
    if len(source_items) > 12:
        errors.append("$.sources:too_many")
    if source_items and source_items[0].get("source_tier") not in ("official", "primary", "standard"):
        errors.append("$.sources:official_or_primary_not_first")
    for bucket in ("findings", "competitor_standard_patterns", "failure_modes", "implications", "novel_ideas", "unresolved_questions"):
        for index, item in enumerate(result.get(bucket, [])):
            if not isinstance(item, dict):
                continue
            for source_url in item.get("source_urls", []):
                if source_url not in source_urls:
                    errors.append(f"$.{bucket}[{index}].source_urls:unknown_source")
                errors.extend(direct_url_errors(source_url, f"$.{bucket}[{index}].source_urls"))
            if item.get("evidence_class") == "supported_claim" and not item.get("source_urls"):
                errors.append(f"$.{bucket}[{index}]:supported_claim_without_source")
    return errors

def expected_agent(index):
    return f"/root/a005_external_research_sprint_0001_attempt_{index + 2:04d}_terminal"

def validate_name_inventory(actual, expected, label):
    actual = sorted(actual)
    expected = sorted(expected)
    errors = []
    for name in sorted(set(expected) - set(actual)):
        errors.append(f"{label}:missing:{name}")
    for name in sorted(set(actual) - set(expected)):
        errors.append(f"{label}:extra:{name}")
    if len(actual) != len(set(actual)):
        errors.append(f"{label}:duplicate")
    return errors

def validate_prelaunch_inventory(output_files, receipt_ids, result_ids):
    errors = []
    if output_files:
        errors.append("output_inventory:nonempty:" + ",".join(sorted(output_files)))
    if receipt_ids:
        errors.append("receipt_inventory:premature:" + ",".join(sorted(receipt_ids)))
    if result_ids:
        errors.append("result_inventory:premature:" + ",".join(sorted(result_ids)))
    return errors

def validate_packet(packet, assignment, index):
    errors = []
    aid = assignment["assignment_id"]
    packet_abs = str(RETRY / "packets" / f"{aid}.json")
    intent_abs = str(RETRY / "dispatch" / aid / ATTEMPT / "dispatch_intent.json")
    out_dir = str(OUTPUT / aid / "attempts" / ATTEMPT)
    checks = {
        "audit_id": AUDIT_ID, "sprint_id": SPRINT, "retry_namespace": "retry-attempt-0002",
        "assignment_id": aid, "attempt_id": ATTEMPT, "packet_id": f"ER2PKT-{index + 1:04d}",
        "topic": assignment["topic"], "owner_domains": assignment["owner_domains"],
        "feature_refs": assignment["feature_refs"], "broad_cross_cutting": assignment["cross_cutting"],
        "packet_path": packet_abs, "schema_path": str(RETRY / "schema" / "external_research_result_v2.schema.json"),
        "leaf_prompt_path": str(RETRY / "leaf_prompt.json"), "output_directory": out_dir,
        "output_path": str(Path(out_dir) / "result.json"), "dispatch_intent_path": intent_abs,
        "canonical_agent_path": expected_agent(index), "controller_thread_id": CONTROLLER,
        "model": MODEL, "reasoning_effort": EFFORT, "fresh_child": True, "fork_turns": "none",
        "descendants_forbidden": True, "followup_messages_forbidden": True, "retries_forbidden": True,
        "prevalidation_credit": 0, "research_credit": 0, "activation_granted": False,
    }
    for key, expected in checks.items():
        if packet.get(key) != expected:
            errors.append(f"{aid}:packet:{key}")
    if len(packet.get("research_questions", [])) < 3:
        errors.append(f"{aid}:packet:research_questions")
    if packet.get("broad_cross_cutting") and packet.get("feature_refs") != []:
        errors.append(f"{aid}:packet:cross_cutting_feature_refs_not_empty")
    if not packet.get("owner_domains"):
        errors.append(f"{aid}:packet:owner_domains")
    return errors

def validate_intent(intent, assignment, index, packet_sha):
    errors = []
    aid = assignment["assignment_id"]
    packet_abs = str(RETRY / "packets" / f"{aid}.json")
    out_dir = str(OUTPUT / aid / "attempts" / ATTEMPT)
    intent_abs = str(RETRY / "dispatch" / aid / ATTEMPT / "dispatch_intent.json")
    checks = {
        "audit_id": AUDIT_ID, "sprint_id": SPRINT, "retry_namespace": "retry-attempt-0002",
        "assignment_id": aid, "attempt_id": ATTEMPT, "packet_id": f"ER2PKT-{index + 1:04d}",
        "packet_path": packet_abs, "packet_sha256": packet_sha,
        "schema_path": str(RETRY / "schema" / "external_research_result_v2.schema.json"),
        "leaf_prompt_path": str(RETRY / "leaf_prompt.json"), "output_directory": out_dir,
        "output_path": str(Path(out_dir) / "result.json"), "receipt_path": str(Path(intent_abs).with_name("dispatch_receipt.json")),
        "controller_thread_id": CONTROLLER, "agent_path": expected_agent(index),
        "task_thread_id": None, "native_child_thread_id": None, "model": MODEL, "reasoning_effort": EFFORT,
        "fresh_child": True, "fork_turns": "none", "descendants_forbidden": True,
        "followup_messages_forbidden": True, "retries_forbidden": True, "prevalidation_credit": 0,
        "research_credit": 0, "activation_granted": False, "launch_state": "NOT_LAUNCHED",
        "status": "PREPARED_NOT_DISPATCHED", "direct_child": True, "identity_reuse_forbidden": True,
    }
    for key, expected in checks.items():
        if intent.get(key) != expected:
            errors.append(f"{aid}:intent:{key}")
    return errors

def collect_identity_strings(value):
    found = set()
    if isinstance(value, dict):
        for key, item in value.items():
            if key in {"native_child_thread_id", "native_child_turn_id", "task_thread_id", "agent_path", "canonical_agent_path"} and isinstance(item, str):
                found.add(item)
            found.update(collect_identity_strings(item))
    elif isinstance(value, list):
        for item in value:
            found.update(collect_identity_strings(item))
    return found

def set_digest(mapping):
    rows = [{"assignment_id": key, "sha256": mapping[key]} for key in sorted(mapping)]
    return hashlib.sha256(json.dumps(rows, separators=(",", ":")).encode()).hexdigest()

def main():
    errors = []
    ids = [f"ER-{index:04d}" for index in range(1, 9)]
    expected_packet_files = [f"packets/{aid}.json" for aid in ids]
    expected_intent_files = [f"dispatch/{aid}/{ATTEMPT}/dispatch_intent.json" for aid in ids]
    expected_files = {
        "authority.json", "hashes.json", "launch_seal.json", "leaf_prompt.json", "manifest.json",
        "receipt_contract.json", "schema/external_research_result_v2.schema.json",
        *expected_packet_files, *expected_intent_files
    }
    if not RETRY.is_dir():
        errors.append("retry_namespace:missing")
        print(json.dumps({"checker": "external_research_retry_verifier_v2", "status": "fail", "errors": errors}, sort_keys=True))
        return 1
    actual_files = sorted(p.relative_to(RETRY).as_posix() for p in RETRY.rglob("*") if p.is_file())
    errors.extend(validate_name_inventory(actual_files, sorted(expected_files), "retry_files"))
    old_worktree_hashes = {}
    for name, (relative, expected) in OLD_PINS.items():
        path = OLD / relative
        if not path.is_file():
            errors.append(f"old_lineage:{name}:missing")
        elif sha256(path) != expected:
            old_worktree_hashes[name] = sha256(path)
            errors.append(f"old_lineage:{name}:hash_drift")
        else:
            old_worktree_hashes[name] = expected
    schema_path = RETRY / "schema" / "external_research_result_v2.schema.json"
    schema = load_json(schema_path) if schema_path.is_file() else {}
    manifest = load_json(RETRY / "manifest.json") if (RETRY / "manifest.json").is_file() else {}
    authority = load_json(RETRY / "authority.json") if (RETRY / "authority.json").is_file() else {}
    seal = load_json(RETRY / "launch_seal.json") if (RETRY / "launch_seal.json").is_file() else {}
    hashes = load_json(RETRY / "hashes.json") if (RETRY / "hashes.json").is_file() else {}
    leaf = load_json(RETRY / "leaf_prompt.json") if (RETRY / "leaf_prompt.json").is_file() else {}
    receipt_contract = load_json(RETRY / "receipt_contract.json") if (RETRY / "receipt_contract.json").is_file() else {}
    for key, expected in NEW_PINS.items():
        if key in {"packet_set", "intent_set"}:
            continue
        path = {
            "schema": schema_path, "leaf_prompt": RETRY / "leaf_prompt.json",
            "receipt_contract": RETRY / "receipt_contract.json", "manifest": RETRY / "manifest.json",
            "authority": RETRY / "authority.json", "launch_seal": RETRY / "launch_seal.json",
        }.get(key)
        if path is None or not path.is_file() or sha256(path) != expected:
            errors.append(f"new_control:{key}:hash_drift")
    actual_packet_hashes = {}
    actual_intent_hashes = {}
    for index, aid in enumerate(ids):
        packet_path = RETRY / "packets" / f"{aid}.json"
        intent_path = RETRY / "dispatch" / aid / ATTEMPT / "dispatch_intent.json"
        if not packet_path.is_file():
            errors.append(f"{aid}:packet:missing")
            continue
        packet = load_json(packet_path)
        assignment = EXPECTED[aid]
        errors.extend(validate_packet(packet, assignment, index))
        actual_packet_hashes[aid] = sha256(packet_path)
        if actual_packet_hashes[aid] != PACKET_PINS[aid]:
            errors.append(f"{aid}:packet:hash_drift")
        if not intent_path.is_file():
            errors.append(f"{aid}:intent:missing")
            continue
        intent = load_json(intent_path)
        actual_intent_hashes[aid] = sha256(intent_path)
        errors.extend(validate_intent(intent, assignment, index, actual_packet_hashes[aid]))
        if actual_intent_hashes[aid] != INTENT_PINS[aid]:
            errors.append(f"{aid}:intent:hash_drift")
        out_dir = OUTPUT / aid / "attempts" / ATTEMPT
        if not out_dir.is_dir():
            errors.append(f"{aid}:output_directory:missing")
        else:
            output_files = sorted(p.relative_to(out_dir).as_posix() for p in out_dir.rglob("*") if p.is_file())
            errors.extend(validate_prelaunch_inventory(output_files, [], []))
    errors.extend(validate_name_inventory(sorted(actual_packet_hashes), ids, "packet_assignments"))
    errors.extend(validate_name_inventory(sorted(actual_intent_hashes), ids, "intent_assignments"))
    if set(actual_packet_hashes) == set(ids) and set(actual_intent_hashes) == set(ids):
        if set_digest(actual_packet_hashes) != NEW_PINS["packet_set"]:
            errors.append("packet_set:hash_drift")
        if set_digest(actual_intent_hashes) != NEW_PINS["intent_set"]:
            errors.append("intent_set:hash_drift")
    old_lineage = load_json(OLD / OLD_PINS["failure_lineage"][0]) if (OLD / OLD_PINS["failure_lineage"][0]).is_file() else {}
    old_identities = collect_identity_strings(old_lineage)
    new_agents = [expected_agent(index) for index in range(8)]
    if len(set(new_agents)) != 8:
        errors.append("identity_set:duplicate")
    for agent in new_agents:
        if agent in old_identities:
            errors.append(f"identity_reuse:{agent}")
    manifest_assignments = {item.get("assignment_id"): item for item in manifest.get("assignments", [])} if isinstance(manifest, dict) else {}
    for index, aid in enumerate(ids):
        packet = load_json(RETRY / "packets" / f"{aid}.json") if (RETRY / "packets" / f"{aid}.json").is_file() else {}
        item = manifest_assignments.get(aid)
        if not item:
            errors.append(f"{aid}:manifest:missing")
            continue
        for key, expected in {
            "attempt_id": ATTEMPT, "topic": EXPECTED[aid]["topic"], "feature_refs": EXPECTED[aid]["feature_refs"],
            "owner_domains": EXPECTED[aid]["owner_domains"], "packet_sha256": actual_packet_hashes.get(aid),
            "dispatch_intent_sha256": actual_intent_hashes.get(aid), "canonical_agent_path": expected_agent(index),
            "task_thread_id": None,
        }.items():
            if item.get(key) != expected:
                errors.append(f"{aid}:manifest:{key}")
        if EXPECTED[aid]["cross_cutting"] and item.get("feature_refs") != []:
            errors.append(f"{aid}:manifest:cross_cutting_feature_refs")
    for key, expected in {
        "assignment_count": 8, "attempt_id": ATTEMPT, "controller_thread_id": CONTROLLER,
        "controller_model": MODEL, "controller_reasoning_effort": EFFORT,
        "status": "PREPARED_NOT_LAUNCHED",
    }.items():
        if manifest.get(key) != expected:
            errors.append(f"manifest:{key}")
    for key, expected in {
        "status": "PREPARED_NOT_ACTIVATED_ZERO_CREDIT", "assignment_count": 8,
        "controller_thread_id": CONTROLLER, "model": MODEL, "reasoning_effort": EFFORT,
        "manifest_sha256": NEW_PINS["manifest"], "concurrency_policy_v3_sha256": POLICY_SHA,
        "activation_granted": False, "coverage_credit": 0, "research_credit": 0,
        "prevalidation_credit": 0, "receipts_written": 0, "results_written": 0,
        "native_capture_written": 0,
    }.items():
        if authority.get(key) != expected:
            errors.append(f"authority:{key}")
    for key, expected in {
        "status": "SEALED_FOR_FUTURE_EXPLICIT_ACTIVATION_ONLY", "attempt_id": ATTEMPT,
        "controller_thread_id": CONTROLLER, "model": MODEL, "reasoning_effort": EFFORT,
        "authority_sha256": NEW_PINS["authority"], "manifest_sha256": NEW_PINS["manifest"],
        "packet_set_sha256": NEW_PINS["packet_set"], "dispatch_intent_set_sha256": NEW_PINS["intent_set"],
        "activation_granted": False, "coverage_credit": 0, "research_credit": 0,
        "prevalidation_credit": 0, "receipt_count": 0, "result_count": 0, "native_capture_count": 0,
    }.items():
        if seal.get(key) != expected:
            errors.append(f"launch_seal:{key}")
    if hashes.get("new_controls", {}).get("schema_sha256") != NEW_PINS["schema"]:
        errors.append("hashes:schema")
    if hashes.get("packets") != actual_packet_hashes:
        errors.append("hashes:packets")
    if hashes.get("dispatch_intents") != actual_intent_hashes:
        errors.append("hashes:dispatch_intents")
    if hashes.get("concurrency_policy_v3_sha256") != POLICY_SHA:
        errors.append("hashes:concurrency_policy")
    if leaf.get("attempt_id") != ATTEMPT or leaf.get("controller_thread_id") != CONTROLLER:
        errors.append("leaf_prompt:binding")
    if receipt_contract.get("attempt_id") != ATTEMPT or receipt_contract.get("current_receipt_count") != 0:
        errors.append("receipt_contract:binding")
    if any((RETRY / name).exists() for name in ("activation.json", "native_capture.json", "local-preactivation-v2.json")):
        errors.append("zero_launch:activation_or_capture_present")
    dispatch_receipts = sorted(p.relative_to(RETRY).as_posix() for p in RETRY.rglob("dispatch_receipt.json"))
    if dispatch_receipts:
        errors.append("zero_launch:receipts_present")
    result_files = sorted(p.relative_to(OUTPUT).as_posix() for p in OUTPUT.rglob("result.json")) if OUTPUT.exists() else []
    if result_files:
        errors.append("zero_launch:results_present")
    report = {
        "checker": "external_research_retry_verifier_v2",
        "status": "pass" if not errors else "fail",
        "errors": sorted(set(errors)),
        "audit_id": AUDIT_ID, "sprint_id": SPRINT, "attempt_id": ATTEMPT,
        "controller_thread_id": CONTROLLER, "model": MODEL, "reasoning_effort": EFFORT,
        "counts": {
            "assignments": len(ids), "packets": len(actual_packet_hashes), "dispatch_intents": len(actual_intent_hashes),
            "receipts": len(dispatch_receipts), "results": len(result_files),
            "empty_output_directories": sum(1 for aid in ids if (OUTPUT / aid / "attempts" / ATTEMPT).is_dir()),
            "canonical_agent_paths": len(set(new_agents)),
        },
        "old_attempt_0001": {
            "immutable_pins_match": not any(x.startswith("old_lineage:") for x in errors),
            "identity_reuse_forbidden": True,
            "observed_worktree_hashes": old_worktree_hashes,
            "native_children_terminated_blocked": 6, "native_children_unlaunched": 2,
        },
        "new_hashes": {"controls": NEW_PINS, "packets": actual_packet_hashes, "dispatch_intents": actual_intent_hashes},
        "zero_launch": {"activation_granted": False, "coverage_credit": 0, "research_credit": 0, "prevalidation_credit": 0, "receipts": 0, "results": 0, "native_capture": 0},
        "cross_cutting_empty_feature_refs_allowed": True,
        "universal_coexistence": {"separately_activated_assignments": 24, "exact_semantic_cap": 32, "concurrency_policy_v3_sha256": POLICY_SHA},
    }
    print(json.dumps(report, sort_keys=True, separators=(",", ":")))
    return 0 if not errors else 1

if __name__ == "__main__":
    sys.exit(main())
