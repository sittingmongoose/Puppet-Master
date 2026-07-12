#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
NS = ROOT / "master/cross_domain_seams/wave-0001"
V10_SHA = "0fbaad08800f3f5e8e122e7638e2537382d9c6f6be5fc93afcd307a3a42098f1"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def jsonl(path: Path):
    return [json.loads(x) for x in path.read_text().splitlines() if x.strip()]


def validate_independent_report(report: dict, report_path: Path, report_sha: str) -> list[str]:
    errors = []
    authority = json.loads((NS / "authority.json").read_text())
    seal = json.loads((NS / "launch_seal.json").read_text())
    manifest = jsonl(NS / "manifest.jsonl")
    expected = {
        "status": "pass",
        "gate_passed": True,
        "audit_id": authority["audit_id"],
        "wave_id": authority["wave_id"],
        "assignment_count": 8,
        "assignment_ids": [x["assignment_id"] for x in manifest],
        "agent_paths": [x["prospective_agent_path"] for x in manifest],
        "normalized_edge_count": 9365,
        "normalized_edge_digest": authority["normalized_edge_digest"],
        "feature_count": 2495,
        "feature_digest": authority["feature_digest"],
        "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh",
        "controller_thread_id": "019f4f5e-96c6-7893-8c94-ce2c1b760d6c",
        "concurrency_policy_v10_sha256": V10_SHA,
        "authority_sha256": sha(NS / "authority.json"),
        "launch_seal_sha256": sha(NS / "launch_seal.json"),
        "manifest_sha256": sha(NS / "manifest.jsonl"),
        "packet_registry_sha256": sha(NS / "packet_registry.jsonl"),
        "normalized_edge_ledger_sha256": sha(NS / "normalized_edge_ledger.jsonl"),
        "outputs_empty": 8,
        "receipts": 0, "results": 0, "native_capture_rows": 0, "activation_files": 0,
        "coverage_credit": 0, "research_credit": 0, "spec_credit": 0, "merge_credit": 0, "promotion_credit": 0,
    }
    if sha(report_path) != report_sha: errors.append("report_hash")
    for key, value in expected.items():
        if report.get(key) != value: errors.append(f"report:{key}")
    if report.get("errors") != []: errors.append("report_errors")
    return errors


def generate(report_path: Path, report_sha: str, output: Path) -> dict:
    if output.exists(): raise RuntimeError("activation output already exists")
    report = json.loads(report_path.read_text())
    errors = validate_independent_report(report, report_path, report_sha)
    if errors: raise RuntimeError(";".join(errors))
    from verify_prelaunch import verify
    pre = verify()
    if pre["status"] != "pass": raise RuntimeError("prelaunch zero-state failed:" + ";".join(pre["errors"]))
    template = json.loads((NS / "activation.template.json").read_text())
    activation = dict(template)
    activation.update({
        "status": "ACTIVE_FOR_EXACTLY_8_FRESH_SOL_XHIGH_LEAVES",
        "activation_granted": True,
        "independent_prelaunch_path": str(report_path),
        "independent_prelaunch_sha256": report_sha,
        "authority_sha256": sha(NS / "authority.json"),
        "launch_seal_sha256": sha(NS / "launch_seal.json"),
        "manifest_sha256": sha(NS / "manifest.jsonl"),
        "packet_registry_sha256": sha(NS / "packet_registry.jsonl"),
        "normalized_edge_ledger_sha256": sha(NS / "normalized_edge_ledger.jsonl"),
        "activation_transaction_id": "A005-CDS-WAVE-0001-V10-EXACT8",
    })
    raw = (json.dumps(activation, indent=2, sort_keys=True) + "\n").encode()
    output.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(output, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    with os.fdopen(fd, "wb") as f: f.write(raw)
    return activation


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--independent-report", required=True)
    ap.add_argument("--independent-report-sha256", required=True)
    ap.add_argument("--output", default=str(NS / "activation.v1.json"))
    args = ap.parse_args()
    activation = generate(Path(args.independent_report).resolve(), args.independent_report_sha256, Path(args.output).resolve())
    print(json.dumps({"status": "activated", "activation_sha256": sha(Path(args.output).resolve()), "assignment_count": len(activation["assignment_ids"])}, sort_keys=True))


if __name__ == "__main__": main()
