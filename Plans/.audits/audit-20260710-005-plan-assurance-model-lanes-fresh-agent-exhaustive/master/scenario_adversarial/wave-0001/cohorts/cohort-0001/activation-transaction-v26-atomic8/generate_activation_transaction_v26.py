#!/usr/bin/env python3
"""Generate the separately gated V26 scenario cohort-0001 atomic8 transaction once."""
from __future__ import annotations
import hashlib, json, pathlib, sys
from typing import Any

ROOT = pathlib.Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
WAVE = ROOT / "master/scenario_adversarial/wave-0001"
COHORT = WAVE / "cohorts/cohort-0001"
HERE = pathlib.Path(__file__).resolve().parent
AUTH = HERE / "authorizations"
IDS = [f"A005SA-{i:04d}" for i in range(1, 9)]
PINS = {
    "luna_scenario_gate": (WAVE / "launch-readiness-v16/validation/luna-independent-prelaunch-after-research-v22.json", "9c6a6b6be157c538061c508ed92569fd7dbfca67df41bbfe1e350467130464cb"),
    "research_checkpoint": (ROOT / "master/external_research/sprint-wave-0001/checkpoints/research-checkpoint-0001.json", "94475c6e25c0559df5cb568b855678fa1c096b1f553ad682ae444b17e4732a4d"),
    "readiness": (WAVE / "launch-readiness-v16/terminal-readiness-report.json", "131d91ee8679132f8b806cab517350393105b43f86cc87342ac6987c75f12c02"),
    "postrun_preparation": (WAVE / "postrun-validator-v1/terminal-preparation-report.json", "188b4ebce79cefef6463315ea12097bd1c17b974618363c2f448baba1075fa27"),
    "v25": (ROOT / "master/coordination/CONCURRENCY_POLICY_V25.json", "f2e0cd20f5612b8d6fa1d1946ee03f15b3f26138a38189a410926f4f69f0f63b"),
    "v26": (ROOT / "master/coordination/CONCURRENCY_POLICY_V26.json", "dc8b6856705325223b70822d31f28abe0ef32e6153f57d4fea924b4eaf0dba68"),
    "frozen_source": (ROOT / "master/coordination/CONCURRENT_CANONICAL_CHANGE_POLICY_V1.json", "b227f14a04aae9ddce62440002af2c76528a1433c4e440df613490865f9f444e"),
    "routing_v2": (ROOT / "master/coordination/MODEL_LANE_ROUTING_POLICY_V2.json", "9105752f30b42d482454e8df7782bda95992d94ae7b149977e280ac83df83544"),
}

def sha(path: pathlib.Path) -> str: return hashlib.sha256(path.read_bytes()).hexdigest()
def canonical(value: Any) -> bytes: return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()
def load(path: pathlib.Path) -> Any: return json.loads(path.read_text())
def rows(path: pathlib.Path) -> list[dict[str, Any]]: return [json.loads(x) for x in path.read_text().splitlines() if x.strip()]
def write_once(path: pathlib.Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("xb") as handle: handle.write(canonical(value))

def main() -> None:
    errors: list[str] = []
    for name,(path,expected) in PINS.items():
        if not path.is_file() or sha(path) != expected: errors.append(f"pin:{name}")
    gate = load(PINS["luna_scenario_gate"][0])
    if gate.get("status") != "PASS" or gate.get("errors") != []: errors.append("gate:not_unqualified_pass")
    allowed = gate.get("next_action", {}).get("allowed_recommendation", {})
    if allowed.get("assignment_ids") != IDS or allowed.get("atomic_size") != 8 or allowed.get("cohort_id") != "cohort-0001": errors.append("gate:scope")
    manifest = rows(COHORT / "cohort_manifest.jsonl")
    if [r.get("assignment_id") for r in manifest] != IDS: errors.append("manifest:ids")
    bindings: list[dict[str, Any]] = []
    for aid in IDS:
        intent_path = WAVE / f"dispatch/{aid}/attempt-0001/dispatch_intent.json"
        intent = load(intent_path)
        packet = pathlib.Path(intent["packet_ref"])
        schema = pathlib.Path(intent["result_schema_ref"])
        output = pathlib.Path(intent["output_directory"])
        receipt = pathlib.Path(intent["receipt_ref"])
        if not packet.is_file() or sha(packet) != intent.get("packet_sha256"): errors.append(f"{aid}:packet")
        if not schema.is_file(): errors.append(f"{aid}:schema")
        if not output.is_dir() or any(output.iterdir()): errors.append(f"{aid}:output_not_empty")
        if receipt.exists(): errors.append(f"{aid}:receipt_exists")
        if intent.get("prospective_agent_path") != f"/root/a005_scenario_adversarial_{int(aid[-4:]):04d}_attempt_0001_terminal": errors.append(f"{aid}:path")
        bindings.append({
            "assignment_id": aid,
            "agent_path": intent["prospective_agent_path"],
            "intent_path": str(intent_path), "intent_sha256": sha(intent_path),
            "packet_path": str(packet), "packet_sha256": sha(packet),
            "result_schema_path": str(schema), "result_schema_sha256": sha(schema),
            "output_directory": str(output), "receipt_path": str(receipt),
        })
    if any(HERE.glob("activation_*.json")) or AUTH.exists(): errors.append("transaction:already_exists")
    if errors:
        print(json.dumps({"status":"fail_closed","errors":sorted(set(errors))},indent=2)); raise SystemExit(1)
    core = {
        "schema_version":"scenario-adversarial-activation-core-v26-atomic8",
        "audit_id":"audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive",
        "wave_id":"wave-0001", "cohort_id":"cohort-0001",
        "transaction_id":"SCENARIO-V26-COHORT-0001-ATOMIC8",
        "status":"ACTIVE_FOR_EXACTLY_8_FRESH_SOL_XHIGH_LEAVES", "activation_granted":True,
        "assignment_ids":IDS, "assignment_count":8, "feature_count":823,
        "model":"gpt-5.6-sol", "reasoning_effort":"xhigh",
        "controller_thread_id":"019f4f5e-96c6-7893-8c94-ce2c1b760d6c",
        "fork_turns":"none", "fresh_direct_leaves":True, "descendants_forbidden":True,
        "followups_forbidden":True, "retries_forbidden":True, "atomic16_forbidden":True,
        "candidate_credit_before_independent_postrun":0,
        "pins":{name:{"path":str(path),"sha256":expected} for name,(path,expected) in PINS.items()},
    }
    core_path = HERE / "activation_core.json"; write_once(core_path, core); core_sha = sha(core_path)
    auth_hashes: dict[str,str] = {}
    for binding in bindings:
        auth = {
            "schema_version":"scenario-adversarial-leaf-dispatch-authorization-v26",
            "transaction_id":core["transaction_id"], "cohort_id":"cohort-0001",
            "assignment_id":binding["assignment_id"], "activation_granted":True,
            "activation_core_path":str(core_path), "activation_core_sha256":core_sha,
            "model":"gpt-5.6-sol", "reasoning_effort":"xhigh", "fork_turns":"none",
            "fresh_child":True, "descendants_forbidden":True, "followups_forbidden":True,
            **binding,
        }
        path = AUTH / f"{binding['assignment_id']}.json"; write_once(path, auth); auth_hashes[binding["assignment_id"]] = sha(path)
    envelope = {
        "schema_version":"scenario-adversarial-activation-envelope-v26-atomic8",
        "transaction_id":core["transaction_id"], "status":"SEALED_ACTIVE",
        "cohort_id":"cohort-0001", "assignment_ids":IDS,
        "activation_core_path":str(core_path), "activation_core_sha256":core_sha,
        "authorization_sha256_by_assignment":auth_hashes,
        "atomic_size":8, "atomic16_forbidden":True, "candidate_credit":0,
    }
    envelope_path = HERE / "activation_envelope.json"; write_once(envelope_path, envelope)
    print(json.dumps({"status":"activated_atomic8","core_sha256":core_sha,"envelope_sha256":sha(envelope_path),"authorization_sha256_by_assignment":auth_hashes},indent=2,sort_keys=True))

if __name__ == "__main__": main()
