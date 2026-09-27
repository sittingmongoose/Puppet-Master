#!/usr/bin/env python3
"""Run one scored R1 arm: stage-1 investigator Goal -> freeze -> [candidate: host bundle] -> stage-2 verifier Goal -> freeze.

Each stage is a fresh native session in a fresh workspace that holds a byte copy of the frozen case
bundle (read-only) plus, for stage 2, a read-only copy of the frozen stage-1 outputs. No retries.
Arm caps: 3600 s whole-arm span, 480 native responses, 8 assignments (2 used by design).
"""
import argparse
import hashlib
import json
import os
import shutil
import stat
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

LAB = Path("/home/sittingmongoose/PM-Experiments/external-research-v6-20260926")
ARM_SECONDS = 3600
ARM_RESPONSES = 480
ASSIGN_SECONDS = 1800
ASSIGN_RESPONSES = 160


def utc(t=None):
    return datetime.fromtimestamp(t if t is not None else time.time(), timezone.utc).isoformat()


def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


def readonly(path):
    for root, dirs, files in os.walk(path):
        for f in files:
            p = Path(root) / f
            p.chmod(p.stat().st_mode & ~(stat.S_IWUSR | stat.S_IWGRP | stat.S_IWOTH))
    for root, dirs, files in os.walk(path, topdown=False):
        for d in dirs:
            p = Path(root) / d
            p.chmod(p.stat().st_mode & ~(stat.S_IWUSR | stat.S_IWGRP | stat.S_IWOTH))
    Path(path).chmod(Path(path).stat().st_mode & ~(stat.S_IWUSR | stat.S_IWGRP | stat.S_IWOTH))


def manifest(path):
    return {p.relative_to(path).as_posix(): {"sha256": sha(p), "bytes": p.stat().st_size}
            for p in sorted(Path(path).rglob("*")) if p.is_file()}


def workspace(dest, stage1_frozen=None, bundle_dir=None):
    dest.mkdir(parents=True)
    shutil.copytree(LAB / "case_bundle", dest / "case", copy_function=shutil.copy2)
    readonly(dest / "case")
    if stage1_frozen is not None:
        shutil.copytree(stage1_frozen, dest / "stage1", copy_function=shutil.copy2)
        (dest / "stage1").chmod(0o755)  # v2: copytree keeps the frozen dir's read-only mode
        if bundle_dir is not None:
            for f in ("evidence-bundle.md", "evidence-check.json"):
                if (bundle_dir / f).exists():
                    shutil.copy2(bundle_dir / f, dest / "stage1" / f)
        readonly(dest / "stage1")
    (dest / "out").mkdir()
    return dest


def run_stage(app, ws, prompt, out, label, seconds, responses):
    cmd = [sys.executable, str(LAB / "tools/run_goal.py"), "--app", app, "--workspace", str(ws),
           "--prompt-file", str(prompt), "--out", str(out), "--label", label,
           "--max-seconds", str(int(seconds)), "--max-responses", str(int(responses))]
    t0 = time.time()
    rc = subprocess.run(cmd, timeout=seconds + 300).returncode
    rec = json.loads((out / "receipt.json").read_text()) if (out / "receipt.json").exists() else {}
    return rc, rec, time.time() - t0


def copy_native_logs(app, rec, dest):
    dest.mkdir(exist_ok=True)
    try:
        if app == "muse" and rec.get("session_log"):
            shutil.copy2(rec["session_log"], dest / "muse-session.jsonl")
        if app == "zcode" and rec.get("session_id"):
            src = Path.home() / ".zcode/cli/rollout" / f"model-io-{rec['session_id']}.jsonl"
            if src.exists():
                shutil.copy2(src, dest / "zcode-model-io.jsonl")
    except OSError as exc:
        (dest / "copy-error.txt").write_text(str(exc))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--slot", required=True)
    ap.add_argument("--app", choices=["muse", "zcode"], required=True)
    ap.add_argument("--variant", choices=["control", "candidate"], required=True)
    ap.add_argument("--resume-stage2", action="store_true",
                    help="v2: dispatch the never-dispatched stage 2 of an arm whose stage 1 froze before a host fault")
    a = ap.parse_args()
    arm = LAB / "runs" / a.slot
    if a.resume_stage2:
        return resume_stage2(a, arm)
    arm.mkdir(parents=True, exist_ok=False)
    t_arm = time.time()
    rec = {"schema": "er6.arm_receipt.v1", "slot": a.slot, "app": a.app, "variant": a.variant,
           "arm_start_utc": utc(t_arm), "caps": {"arm_seconds": ARM_SECONDS, "arm_responses": ARM_RESPONSES,
                                                "assignment_seconds": ASSIGN_SECONDS, "assignment_responses": ASSIGN_RESPONSES},
           "case_bundle_manifest_sha256": sha(LAB / "case_bundle/MANIFEST.sha256.json"), "stages": []}
    # ---- stage 1
    ws1 = workspace(arm / "ws1")
    rc1, r1, span1 = run_stage(a.app, ws1, LAB / "prompts/stage1_investigator.txt", arm / "s1",
                               f"{a.slot}/stage1", ASSIGN_SECONDS, ASSIGN_RESPONSES)
    copy_native_logs(a.app, r1, arm / "s1")
    frozen1 = arm / "frozen/stage1"
    shutil.copytree(ws1 / "out", frozen1)
    readonly(frozen1)
    rec["stages"].append({"stage": "stage1_investigator", "rc": rc1, "span_seconds": round(span1, 1),
                          "native_responses": r1.get("native_responses"), "stop_reason": r1.get("stop_reason"),
                          "driver_error": r1.get("driver_error"), "frozen_manifest": manifest(frozen1),
                          "frozen_utc": utc()})
    # ---- host treatment
    bundle_dir = None
    if a.variant == "candidate":
        bundle_dir = arm / "host-bundle"
        t_b = time.time()
        obs = frozen1 / "observations.md"
        if obs.exists():
            p = subprocess.run([sys.executable, str(LAB / "tools/build_evidence_bundle.py"), str(LAB / "case_bundle"),
                                str(obs), str(bundle_dir)], capture_output=True, text=True)
            rec["host_bundle"] = {"rc": p.returncode, "summary": p.stdout.strip(), "stderr": p.stderr[-2000:],
                                  "seconds": round(time.time() - t_b, 2)}
        else:
            bundle_dir.mkdir()
            (bundle_dir / "evidence-bundle.md").write_text("# Host-built evidence bundle\n\nstage1/observations.md was not "
                                                           "produced; no cited evidence could be collected.\n")
            rec["host_bundle"] = {"rc": None, "summary": "no observations.md", "seconds": round(time.time() - t_b, 2)}
        readonly(bundle_dir)
    # ---- stage 2
    used = time.time() - t_arm
    resp_used = int(r1.get("native_responses") or 0)
    s2_seconds = min(ASSIGN_SECONDS, ARM_SECONDS - used - 30)
    s2_responses = min(ASSIGN_RESPONSES, ARM_RESPONSES - resp_used)
    if s2_seconds < 120 or s2_responses < 5:
        rec["stages"].append({"stage": "stage2_verifier", "dispatched": False,
                              "reason": "arm budget exhausted before stage 2", "remaining_seconds": s2_seconds})
    else:
        ws2 = workspace(arm / "ws2", stage1_frozen=frozen1, bundle_dir=bundle_dir)
        prompt = LAB / f"prompts/stage2_verifier_{a.variant}.txt"
        rc2, r2, span2 = run_stage(a.app, ws2, prompt, arm / "s2", f"{a.slot}/stage2", s2_seconds, s2_responses)
        copy_native_logs(a.app, r2, arm / "s2")
        frozen2 = arm / "frozen/stage2"
        shutil.copytree(ws2 / "out", frozen2)
        readonly(frozen2)
        rec["stages"].append({"stage": "stage2_verifier", "dispatched": True, "rc": rc2, "span_seconds": round(span2, 1),
                              "caps": {"seconds": s2_seconds, "responses": s2_responses},
                              "native_responses": r2.get("native_responses"), "stop_reason": r2.get("stop_reason"),
                              "driver_error": r2.get("driver_error"), "frozen_manifest": manifest(frozen2),
                              "frozen_utc": utc()})
    t_end = time.time()
    final = arm / "frozen/stage2/delivered.md"
    rec.update({"arm_end_utc": utc(t_end), "arm_span_seconds": round(t_end - t_arm, 1),
                "arm_native_responses": sum(int(s.get("native_responses") or 0) for s in rec["stages"]),
                "designated_final": str(final) if final.exists() else None,
                "designated_final_sha256": sha(final) if final.exists() else None,
                "assignments_dispatched": sum(1 for s in rec["stages"] if s.get("dispatched", True))})
    (arm / "arm-receipt.json").write_text(json.dumps(rec, indent=1) + "\n")
    print(json.dumps({k: rec[k] for k in ("slot", "arm_span_seconds", "arm_native_responses", "designated_final")}))


def resume_stage2(a, arm):
    """v2 path after the v1 host fault: stage 1 frozen, bundle built, stage 2 never dispatched (no model call lost)."""
    frozen1 = arm / "frozen/stage1"
    assert frozen1.is_dir() and not (arm / "frozen/stage2").exists() and not (arm / "arm-receipt.json").exists()
    r1 = json.loads((arm / "s1/receipt.json").read_text())
    if not (arm / "s1/muse-session.jsonl").exists() and not (arm / "s1/zcode-model-io.jsonl").exists():
        copy_native_logs(a.app, r1, arm / "s1")
    bundle_dir = arm / "host-bundle" if a.variant == "candidate" else None
    if bundle_dir is not None and not bundle_dir.exists():
        subprocess.run([sys.executable, str(LAB / "tools/build_evidence_bundle.py"), str(LAB / "case_bundle"),
                        str(frozen1 / "observations.md"), str(bundle_dir)], check=True)
        readonly(bundle_dir)
    if (arm / "ws2").exists():
        (arm / "ws2").rename(arm / "ws2-v1-fault")
    s1_start = datetime.fromisoformat(r1["start_utc"]).timestamp()
    s1_end = datetime.fromisoformat(r1["receipt_written_utc"]).timestamp()
    t_dispatch = time.time()
    s1_active = s1_end - s1_start
    s1_resp = int(r1.get("native_responses") or 0)
    s2_seconds = min(ASSIGN_SECONDS, ARM_SECONDS - s1_active - 60)
    s2_responses = min(ASSIGN_RESPONSES, ARM_RESPONSES - s1_resp)
    ws2 = workspace(arm / "ws2", stage1_frozen=frozen1, bundle_dir=bundle_dir)
    rc2, r2, span2 = run_stage(a.app, ws2, LAB / f"prompts/stage2_verifier_{a.variant}.txt", arm / "s2",
                               f"{a.slot}/stage2", s2_seconds, s2_responses)
    copy_native_logs(a.app, r2, arm / "s2")
    frozen2 = arm / "frozen/stage2"
    shutil.copytree(ws2 / "out", frozen2)
    readonly(frozen2)
    final = frozen2 / "delivered.md"
    rec = {"schema": "er6.arm_receipt.v1", "slot": a.slot, "app": a.app, "variant": a.variant, "runner_version": "v2-resume-stage2",
           "arm_start_utc": r1["start_utc"], "arm_end_utc": utc(),
           "infra_fault": "v1 run_arm could not build the stage-2 workspace (read-only copy); stage 2 dispatched later by v2 with the same frozen inputs",
           "fault_wait_seconds": round(t_dispatch - s1_end, 1),
           "caps": {"arm_seconds": ARM_SECONDS, "arm_responses": ARM_RESPONSES},
           "stages": [{"stage": "stage1_investigator", "span_seconds": round(s1_active, 1), "native_responses": s1_resp,
                       "stop_reason": r1.get("stop_reason"), "frozen_manifest": manifest(frozen1)},
                      {"stage": "stage2_verifier", "dispatched": True, "dispatch_utc": utc(t_dispatch), "rc": rc2,
                       "span_seconds": round(span2, 1), "caps": {"seconds": s2_seconds, "responses": s2_responses},
                       "native_responses": r2.get("native_responses"), "stop_reason": r2.get("stop_reason"),
                       "driver_error": r2.get("driver_error"), "frozen_manifest": manifest(frozen2), "frozen_utc": utc()}],
           "host_bundle": {"reused_from_v1": bundle_dir is not None, "check": json.loads((bundle_dir / "evidence-check.json").read_text())["summary"] if bundle_dir else None},
           "arm_active_span_seconds": round(s1_active + span2, 1),
           "arm_span_seconds_including_fault_wait": round(time.time() - s1_start, 1),
           "arm_native_responses": s1_resp + int(r2.get("native_responses") or 0),
           "designated_final": str(final) if final.exists() else None,
           "designated_final_sha256": sha(final) if final.exists() else None, "assignments_dispatched": 2}
    (arm / "arm-receipt.json").write_text(json.dumps(rec, indent=1) + "\n")
    print(json.dumps({k: rec[k] for k in ("slot", "arm_active_span_seconds", "arm_native_responses", "designated_final")}))


if __name__ == "__main__":
    main()
