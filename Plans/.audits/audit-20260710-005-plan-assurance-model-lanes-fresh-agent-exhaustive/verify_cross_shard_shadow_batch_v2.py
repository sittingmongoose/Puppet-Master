#!/usr/bin/env python3
"""Lifecycle-aware preactivation verifier for the prepared shadow batch."""

from __future__ import annotations

import json
import subprocess

from cross_shard_shadow_common import LUNA_CONTROLLER, SHADOW_BATCH, SHADOW_ROOT, load_obj
from macro_v2_common import ROOT, sha


AUTHORITY_REF = "master/cross_shard_shadow/authorities/VALIDATOR_AUTHORITY_V2.json"


def main() -> None:
    authority_path = ROOT / AUTHORITY_REF
    authority = load_obj(authority_path)
    errors: list[str] = []
    if authority.get("status") != "ACTIVE_FOR_LIFECYCLE_AWARE_PREACTIVATION":
        errors.append("v2 authority status mismatch")
    for ref_key, sha_key in (
        ("v1_verifier_ref", "v1_verifier_sha256"),
        ("v1_activation_ref", "v1_activation_sha256"),
        ("v2_verifier_ref", "v2_verifier_sha256"),
        ("v2_activation_ref", "v2_activation_sha256"),
        ("luna_prelaunch_ref", "luna_prelaunch_sha256"),
        ("batch_authority_ref", "batch_authority_sha256"),
    ):
        path = ROOT / authority[ref_key]
        if not path.is_file() or sha(path.read_bytes()) != authority[sha_key]:
            errors.append(f"v2 bound artifact mismatch:{ref_key}")
    luna_path = ROOT / authority["luna_prelaunch_ref"]
    if luna_path.is_file():
        luna = load_obj(luna_path)
        if not (
            luna.get("status") == "pass"
            and luna.get("errors") == []
            and luna.get("controller_thread_id") == LUNA_CONTROLLER
            and luna.get("model") == "gpt-5.6-luna"
            and luna.get("reasoning_effort") == "max"
        ):
            errors.append("Luna prelaunch identity/status mismatch")
    else:
        errors.append("Luna prelaunch missing")

    process = subprocess.run(
        ["python3", "-B", authority["v1_verifier_ref"]],
        cwd=ROOT, capture_output=True, text=True, check=False,
    )
    try:
        v1 = json.loads(process.stdout)
    except Exception as exc:
        v1 = {"status": "unparseable", "errors": [f"{type(exc).__name__}:{exc}"]}
        errors.append("v1 verifier output unparseable")
    expected_v1_errors = ["forbidden prelaunch artifact exists"]
    if process.returncode == 0 or v1.get("status") != "fail" or v1.get("errors") != expected_v1_errors:
        errors.append("v1 did not fail solely on the documented lifecycle contradiction")

    validation = SHADOW_ROOT / "validation" / SHADOW_BATCH
    activation = validation / "activation.json"
    native = SHADOW_ROOT / "runtime" / SHADOW_BATCH / "native_capture.json"
    if activation.exists() or native.exists():
        errors.append("activation/native capture already exists")
    allowed_luna = validation / "luna-prelaunch.json"
    if allowed_luna != luna_path or not allowed_luna.is_file():
        errors.append("authorized Luna artifact path mismatch")

    report = dict(v1)
    report.update({
        "checker": "cross_shard_shadow_batch_preactivation_v2",
        "status": "pass" if not errors else "fail",
        "errors": sorted(set(errors)),
        "validator_authority_v2_ref": AUTHORITY_REF,
        "validator_authority_v2_sha256": sha(authority_path.read_bytes()),
        "luna_prelaunch_sha256": sha(luna_path.read_bytes()) if luna_path.is_file() else None,
        "v1_lifecycle_contradiction_reconciled": not errors,
        "allowed_pre_activation_artifact": allowed_luna.relative_to(ROOT).as_posix(),
    })
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
