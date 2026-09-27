#!/usr/bin/env python3
"""R1b: one verifier-stage assignment on a frozen R1 stage-1 package, then host assembly.

Both variants: same package, corpus, app/model/Max, caps (1800 s, 160 responses), delivery protocol and
negative-claim rules. Only the evidence-access paragraph and the host bundle (candidate) differ.
Usage: run_r1b.py --slot R1b-M-P1-control --package M-control --app muse --variant control
       run_r1b.py --schedule block1   (the predeclared outcome-independent first block, serial)
"""
import argparse
import hashlib
import json
import shutil
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
LAB = HERE.parent.parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(HERE.parent))
from run_arm import readonly, manifest, copy_native_logs  # noqa: E402  (R1 helpers, unchanged)
import assemble_delivery as asm  # noqa: E402
import build_evidence_bundle_v3 as bundle  # noqa: E402

SECONDS, RESPONSES = 1800, 160
BLOCK1 = [("R1b-M-P1-control", "M-control", "muse", "control"), ("R1b-M-P1-candidate", "M-control", "muse", "candidate"),
          ("R1b-Z-P1-candidate", "Z-candidate", "zcode", "candidate"), ("R1b-Z-P1-control", "Z-candidate", "zcode", "control")]
BLOCK2_CONDITIONAL = [("R1b-M-P2-candidate", "M-candidate", "muse", "candidate"), ("R1b-M-P2-control", "M-candidate", "muse", "control"),
                      ("R1b-Z-P2-control", "Z-control", "zcode", "control"), ("R1b-Z-P2-candidate", "Z-control", "zcode", "candidate")]


def utc(t=None):
    return datetime.fromtimestamp(t if t is not None else time.time(), timezone.utc).isoformat()


def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


def run_one(slot, package, app, variant):
    arm = LAB / "r1b/runs" / slot
    arm.mkdir(parents=True, exist_ok=False)
    t0 = time.time()
    src = LAB / "runs" / package / "frozen/stage1"
    ws = arm / "ws"
    ws.mkdir()
    shutil.copytree(LAB / "case_bundle", ws / "case")
    readonly(ws / "case")
    (ws / "stage1").mkdir()
    for f in ("observations.md", "draft.md"):
        shutil.copy2(src / f, ws / "stage1" / f)
    draft_text = (src / "draft.md").read_text(errors="replace")
    blocks = asm.segment(draft_text)
    (arm / "host").mkdir()
    (arm / "host/draft-blocks.json").write_text(json.dumps(blocks, indent=1, ensure_ascii=False) + "\n")
    (ws / "stage1/draft-blocks.md").write_text(asm.render_blocks_view(draft_text, blocks))
    bundle_summary = None
    if variant == "candidate":
        bundle_summary = bundle.build(LAB / "case_bundle", src / "observations.md", arm / "host/bundle")
        for f in ("evidence-bundle.md", "evidence-check.json"):
            shutil.copy2(arm / "host/bundle" / f, ws / "stage1" / f)
    readonly(ws / "stage1")
    (ws / "out").mkdir()
    prep_seconds = time.time() - t0
    prompt = LAB / f"r1b/prompts/verifier_{variant}.txt"
    t_goal = time.time()
    rc = subprocess.run([sys.executable, str(HERE / "run_goal_r1b.py"), "--app", app, "--workspace", str(ws),
                         "--prompt-file", str(prompt), "--out", str(arm / "native"), "--label", slot,
                         "--max-seconds", str(SECONDS), "--max-responses", str(RESPONSES)], timeout=SECONDS + 300).returncode
    goal_span = time.time() - t_goal
    rec = json.loads((arm / "native/receipt.json").read_text()) if (arm / "native/receipt.json").exists() else {}
    copy_native_logs(app, rec, arm / "native")
    frozen = arm / "frozen/verifier"
    shutil.copytree(ws / "out", frozen)
    readonly(frozen)
    t_asm = time.time()
    text, report = asm.assemble(draft_text, blocks,
                                (frozen / "decisions.md").read_text(errors="replace") if (frozen / "decisions.md").exists() else "",
                                (frozen / "additions.md").read_text(errors="replace") if (frozen / "additions.md").exists() else "",
                                slot)
    (arm / "frozen/delivered").mkdir()
    (arm / "frozen/delivered/delivered.md").write_text(text)
    (arm / "frozen/delivered/assembly-report.json").write_text(json.dumps(report, indent=1) + "\n")
    readonly(arm / "frozen/delivered")
    receipt = {"schema": "er6.r1b_receipt.v1", "slot": slot, "package": package, "app": app, "variant": variant,
               "start_utc": utc(t0), "end_utc": utc(), "host_prep_seconds": round(prep_seconds, 2),
               "goal_span_seconds": round(goal_span, 1), "assembly_seconds": round(time.time() - t_asm, 2),
               "active_span_seconds": round(time.time() - t0, 1), "rc": rc, "native_responses": rec.get("native_responses"),
               "stop_reason": rec.get("stop_reason"), "driver_error": rec.get("driver_error"),
               "model_id": rec.get("model_id"), "effort_effective": rec.get("effort_effective"),
               "prompt_sha256": sha(prompt), "package_draft_sha256": sha(src / "draft.md"),
               "package_observations_sha256": sha(src / "observations.md"), "blocks": len(blocks),
               "bundle_summary": bundle_summary, "assembly": {k: (len(v) if isinstance(v, list) else v) for k, v in report.items()},
               "frozen_verifier_manifest": manifest(frozen), "delivered_sha256": sha(arm / "frozen/delivered/delivered.md")}
    (arm / "arm-receipt.json").write_text(json.dumps(receipt, indent=1) + "\n")
    print(json.dumps({k: receipt[k] for k in ("slot", "active_span_seconds", "native_responses", "stop_reason", "assembly")}), flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--schedule", choices=["block1", "block2"])
    ap.add_argument("--slot")
    ap.add_argument("--package")
    ap.add_argument("--app", choices=["muse", "zcode"])
    ap.add_argument("--variant", choices=["control", "candidate"])
    a = ap.parse_args()
    if a.schedule:
        for slot, package, app, variant in (BLOCK1 if a.schedule == "block1" else BLOCK2_CONDITIONAL):
            if (LAB / "r1b/runs" / slot).exists():
                print(json.dumps({"slot": slot, "skipped": "exists"}), flush=True)
                continue
            print(json.dumps({"slot": slot, "dispatch_utc": utc()}), flush=True)
            try:
                run_one(slot, package, app, variant)
            except Exception as exc:  # a harness fault stops the block (predeclared stop rule)
                print(json.dumps({"slot": slot, "harness_fault": f"{type(exc).__name__}: {exc}", "block_stopped": True}), flush=True)
                break
        return
    run_one(a.slot, a.package, a.app, a.variant)


if __name__ == "__main__":
    main()
