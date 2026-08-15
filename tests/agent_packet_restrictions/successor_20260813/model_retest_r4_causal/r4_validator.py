#!/usr/bin/env python3
"""Read-only validator/scorer for PW-R4-CAUSAL-20260813.1.

The controller creates test evidence with apply_patch. This program never writes.
"""
from __future__ import annotations
import argparse, hashlib, json, os, stat, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PROTOCOL = "PW-R4-CAUSAL-20260813.1"
SUBJECT_STAGES = ("S10A","S10B","S30A","S30B","S40A","S40B","S50","S60P","S60C","S60K","S70","S90")

def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def storage(path: Path) -> bytes:
    return path.read_bytes()

def oracle_payload(stage: str) -> bytes:
    data = storage(ROOT / "oracle_artifacts" / f"{stage}.json")
    if not data.endswith(b"\n") or data.endswith(b"\n\n"):
        raise ValueError(f"{stage}: oracle must have exactly one storage LF")
    return data[:-1]

def fail(message: str) -> None:
    raise ValueError(message)

def canonical_json(data: bytes, label: str):
    try:
        text = data.decode("utf-8")
        obj = json.loads(text)
    except Exception as exc:
        fail(f"{label}: invalid UTF-8/JSON: {exc}")
    canonical = json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode()
    if canonical != data:
        fail(f"{label}: not canonical minified JSON")
    return obj

def patch_choice(candidate: dict, index: int, observed: str, expected: str) -> dict:
    clone = json.loads(json.dumps(candidate))
    if clone["decisions"][index]["choice"] != observed:
        fail("test-before-replace precondition failed")
    clone["decisions"][index]["choice"] = expected
    return clone

def preflight() -> dict:
    protocol = json.loads(storage(ROOT / "protocol.json"))
    custody = json.loads(storage(ROOT / "source_custody.json"))
    schemas = json.loads(storage(ROOT / "schemas.json"))
    execution = json.loads(storage(ROOT / "execution_contract.json"))
    manifest = json.loads(storage(ROOT / "launch_manifest.json"))
    if {protocol["protocol_id"], custody["protocol_id"], schemas["protocol_id"], execution["protocol_id"], manifest["protocol_id"]} != {PROTOCOL}:
        fail("protocol ID mismatch")

    for key, filename in (("topic_a","topic_a_capsule.json"),("topic_b","topic_b_capsule.json")):
        data = storage(ROOT / filename)
        expected = custody["capsules"][key]
        if len(data) != expected["bytes"] or digest(data) != expected["sha256"]:
            fail(f"{filename}: custody mismatch")
        json.loads(data)

    checked = []
    for stage in SUBJECT_STAGES:
        payload = oracle_payload(stage)
        canonical_json(payload, stage)
        contract = schemas["stages"][stage]
        if len(payload) != contract["expected_bytes"] or digest(payload) != contract["expected_sha256"]:
            fail(f"{stage}: oracle contract mismatch")
        packet = storage(ROOT / "packets" / f"{stage}.txt")
        m = manifest["rendered_subject_packets"][stage]
        if len(packet) != m["bytes"] or digest(packet) != m["sha256"]:
            fail(f"{stage}: rendered packet mismatch")
        checked.append(stage)

    for entry in manifest["immutable_files"]:
        data = storage(ROOT / entry["path"])
        if len(data) != entry["bytes"] or digest(data) != entry["sha256"]:
            fail(f"immutable drift: {entry['path']}")

    o = {s: canonical_json(oracle_payload(s), s) for s in SUBJECT_STAGES}
    raw = {name: canonical_json(storage(ROOT/"oracle_artifacts"/f"{name}.json")[:-1], name)
           for name in ("S20A","S20B","S45A","S45B","S55","S80")}
    if patch_choice(raw["S20A"],15,"canonical_runtime_enforced","ledger_lineage_pending_compile") != raw["S45A"]:
        fail("S45A deterministic application mismatch")
    if patch_choice(raw["S20B"],14,"executed_fixture_pass","structural_contract_presence_not_test_pass") != raw["S45B"]:
        fail("S45B deterministic application mismatch")
    if raw["S55"]["cross_topic_edges"][:-1] != raw["S80"]["cross_topic_edges"] or raw["S55"]["cross_topic_edges"][-1]["id"] != "I-E99":
        fail("S55/S80 edge repair mismatch")
    if raw["S80"] != o["S50"]:
        fail("S80 must byte-semantically restore S50")
    if o["S70"]["patch"] != [{"op":"test","path":"/cross_topic_edges/6/id","value":"I-E99"},{"op":"remove","path":"/cross_topic_edges/6"}]:
        fail("S70 patch mismatch")
    return {"protocol_id":PROTOCOL,"status":"PASS","subject_stages_checked":checked,
            "immutable_files_checked":len(manifest["immutable_files"]),
            "rendered_packets_checked":len(manifest["rendered_subject_packets"]),
            "deterministic_transforms_checked":["S20A->S45A","S20B->S45B","S55->S80"]}

def score(stage: str, capture: Path) -> dict:
    if stage not in SUBJECT_STAGES:
        fail("unknown subject stage")
    resolved = capture.resolve()
    runs = (ROOT/"runs").resolve()
    if runs not in resolved.parents:
        fail("capture must be beneath runs/")
    actual = storage(resolved)
    expected = oracle_payload(stage)
    valid_json = True
    try:
        canonical_json(actual, "capture")
    except Exception:
        valid_json = False
    return {"protocol_id":PROTOCOL,"stage":stage,"capture":str(resolved.relative_to(ROOT)),
            "actual_bytes":len(actual),"actual_sha256":digest(actual),
            "expected_bytes":len(expected),"expected_sha256":digest(expected),
            "valid_canonical_json":valid_json,"exact_match":actual==expected,
            "verdict":"PASS" if actual==expected and valid_json else "FAIL"}

def verify_sandbox(slot: str) -> dict:
    if not slot or any(c not in "abcdefghijklmnopqrstuvwxyz0123456789-" for c in slot):
        fail("invalid slot")
    root = ROOT/"sandboxes"/slot
    target = root/"repaired_integration.json"
    if root.is_symlink() or target.is_symlink():
        fail("symlink forbidden")
    if not root.is_dir():
        fail("sandbox directory missing")
    entries = list(root.iterdir())
    if entries != [target] and sorted(x.name for x in entries) != ["repaired_integration.json"]:
        fail("sandbox must contain exactly one target")
    mode = os.lstat(target).st_mode
    if not stat.S_ISREG(mode):
        fail("target is not a regular file")
    expected = oracle_payload("S50")
    actual = storage(target)
    if actual != expected:
        fail("target bytes mismatch")
    return {"protocol_id":PROTOCOL,"slot":slot,"status":"PASS","files":["repaired_integration.json"],
            "bytes":len(actual),"sha256":digest(actual),"symlink_count":0,"outside_sandbox_changes":"verified_by_controller_tree_diff"}

def main() -> int:
    p=argparse.ArgumentParser()
    sub=p.add_subparsers(dest="command",required=True)
    sub.add_parser("preflight")
    s=sub.add_parser("score");s.add_argument("--stage",required=True);s.add_argument("--capture",required=True)
    v=sub.add_parser("verify-sandbox");v.add_argument("--slot",required=True)
    args=p.parse_args()
    try:
        if args.command=="preflight": result=preflight()
        elif args.command=="score": result=score(args.stage,Path(args.capture))
        else: result=verify_sandbox(args.slot)
        print(json.dumps(result,separators=(",",":")))
        return 0 if result.get("status",result.get("verdict"))=="PASS" else 1
    except Exception as exc:
        print(json.dumps({"protocol_id":PROTOCOL,"status":"INVALID","error":str(exc)},separators=(",",":")))
        return 2

if __name__=="__main__":
    raise SystemExit(main())

