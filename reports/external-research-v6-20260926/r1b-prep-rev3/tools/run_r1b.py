#!/usr/bin/env python3
"""R1b rev2: verifier-stage assignments on frozen R1 stage-1 packages, then host assembly.

Launch guard (B6): the schedule must be listed as authorized in r1b/r1b-policy.json, a local approval record
r1b/APPROVAL.json (written only on the user's explicit go) must name this schedule and the exact policy sha256,
and every frozen code/prompt/input hash in the policy must match before any inference.
Slot state (B5): each slot writes status.json at dispatch and a terminal record in `finally`. A relaunch skips only
slots with a terminal, schedule-continuing outcome; any other existing slot stops the schedule.
Outcomes (B4): goal_complete | cap_stop | incomplete_semantic continue the schedule; quota_stop | harness_failure
stop it. A malformed verifier carrier is a result of the arm (recorded by the assembler), not a harness failure.
The designated final has a neutral title; slot names stay in operational records (B8).
Usage: run_r1b.py --schedule block1
"""
import argparse
import hashlib
import json
import shutil
import subprocess
import sys
import time
import traceback
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
LAB = HERE.parent.parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(HERE.parent))
from run_arm import readonly, manifest, copy_native_logs  # noqa: E402  (R1 helpers, unchanged)
import assemble_delivery as asm  # noqa: E402
import build_evidence_bundle_v3 as bundle  # noqa: E402

POLICY = LAB / "r1b/r1b-policy.json"
APPROVAL = LAB / "r1b/APPROVAL.json"
RUNS = LAB / "r1b/runs"
SECONDS, RESPONSES = 1800, 160
CONTINUE = {"goal_complete", "cap_stop", "incomplete_semantic"}
STOP = {"quota_stop", "harness_failure"}


def utc(t=None):
    return datetime.fromtimestamp(t if t is not None else time.time(), timezone.utc).isoformat()


def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


class LaunchRefused(RuntimeError):
    pass


def preflight(schedule, policy_path=POLICY, approval_path=APPROVAL, lab=LAB):
    if not policy_path.exists():
        raise LaunchRefused("no frozen policy")
    policy = json.loads(policy_path.read_text())
    if schedule not in policy.get("authorized_schedules", []):
        raise LaunchRefused(f"schedule {schedule!r} is not authorized by the frozen policy")
    if not approval_path.exists():
        raise LaunchRefused("no approval record (r1b/APPROVAL.json); the user's explicit go is required")
    approval = json.loads(approval_path.read_text())
    if approval.get("schedule") != schedule or approval.get("policy_sha256") != sha(policy_path):
        raise LaunchRefused("approval record does not name this schedule and the exact frozen policy")
    bad = [f for f, h in policy.get("files_sha256", {}).items() if not (lab / f).exists() or sha(lab / f) != h]
    if bad:
        raise LaunchRefused(f"frozen hash mismatch or missing file: {bad[:5]}")
    if policy.get("case_manifest"):
        root = lab / policy["case_manifest"]["root"]
        if sha(root / "MANIFEST.sha256.json") != policy["case_manifest"]["manifest_sha256"]:
            raise LaunchRefused("case manifest differs from the frozen policy")
        listed = json.loads((root / "MANIFEST.sha256.json").read_text())
        drift = [f for f, h in listed.items() if not (root / f).exists() or sha(root / f) != h]
        present = {p.relative_to(root).as_posix() for p in root.rglob("*") if p.is_file() or p.is_symlink()}
        unlisted = sorted(present - set(listed) - CORPUS_METADATA_ALLOWLIST)
        if drift or unlisted:
            raise LaunchRefused(f"case corpus drift {drift[:5]} or unlisted candidate-readable files {unlisted[:5]}")
    return policy


CORPUS_METADATA_ALLOWLIST = {"MANIFEST.sha256.json"}


def copy_listed_corpus(root, dest):
    """R2-3: build the candidate corpus ONLY from manifest-listed files, then verify the copied inventory."""
    listed = json.loads((root / "MANIFEST.sha256.json").read_text())
    for rel, h in listed.items():
        src = root / rel
        if src.is_symlink() or not src.is_file() or sha(src) != h:
            raise LaunchRefused(f"listed corpus file missing, linked or changed: {rel}")
        (dest / rel).parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dest / rel)
    got = {p.relative_to(dest).as_posix(): sha(p) for p in dest.rglob("*") if p.is_file()}
    if got != listed:
        raise LaunchRefused("copied corpus inventory differs from the manifest")
    return len(got)


def classify(rc, rec):
    """Map one native assignment's receipt to a schedule outcome."""
    if not rec:
        return "harness_failure", "no receipt"
    stop = rec.get("stop_reason") or ""
    if rec.get("driver_error"):
        return "harness_failure", rec["driver_error"]
    if rc != 0:  # R2-2: an unexpected nonzero or signal exit dominates any success-shaped receipt
        return "harness_failure", f"runner exit {rc} (signal {-rc})" if isinstance(rc, int) and rc < 0 else f"runner exit {rc} with last stop {stop!r}"
    counts = rec.get("request_status_counts") or {}
    if counts.get("model_request_failed", 0) and not counts.get("model_request_completed", 0):
        return "quota_stop", "every zcode model request failed (transport or quota); no completed response"
    usage = ((rec.get("usage_read_after") or {}).get("usage") or {})
    w, wk = (usage.get("window") or {}).get("usedPercent"), (usage.get("weekly") or {}).get("usedPercent")
    if stop in ("goal_usage_limited",) or (w is not None and w >= 90) or (wk is not None and wk >= 95):
        return "quota_stop", f"usage limit or headroom gate (stop={stop}, window={w}, weekly={wk})"
    if stop == "goal_complete":
        return "goal_complete", stop
    if stop in ("cap_seconds", "cap_responses", "goal_budget_limited"):
        return "cap_stop", stop
    if stop in ("goal_blocked", "turn_completed_goal_not_complete_idle90s", "goal_active_idle90s", "goal_target_absent_idle"):
        return "incomplete_semantic", stop
    if stop == "goal_paused":
        return "harness_failure", "native Goal paused (needs attention) outside the declared caps"
    return "harness_failure", f"unrecognized stop reason {stop!r}"


def native_goal(app, ws, prompt, out, label):
    """The only paid boundary. Tests replace this function."""
    rc = subprocess.run([sys.executable, str(HERE / "run_goal_r1b.py"), "--app", app, "--workspace", str(ws),
                         "--prompt-file", str(prompt), "--out", str(out), "--label", label,
                         "--max-seconds", str(SECONDS), "--max-responses", str(RESPONSES)], timeout=SECONDS + 300).returncode
    rec = json.loads((out / "receipt.json").read_text()) if (out / "receipt.json").exists() else {}
    return rc, rec


def write_status(arm, **kw):
    (arm / "status.json").write_text(json.dumps({"updated_utc": utc(), **kw}, indent=1) + "\n")


def run_one(slot, package, app, variant, runs=RUNS, lab=LAB):
    arm = runs / slot
    arm.mkdir(parents=True, exist_ok=False)
    write_status(arm, state="dispatched", slot=slot)
    t0 = time.time()
    outcome, detail, receipt = "harness_failure", "host exception before completion", {}
    try:
        src = lab / "runs" / package / "frozen/stage1"
        ws = arm / "ws"
        ws.mkdir()
        (ws / "case").mkdir()
        copy_listed_corpus(lab / "case_bundle", ws / "case")
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
            bundle_summary = bundle.build(lab / "case_bundle", src / "observations.md", arm / "host/bundle")
            for f in ("evidence-bundle.md", "evidence-check.json"):
                shutil.copy2(arm / "host/bundle" / f, ws / "stage1" / f)
        readonly(ws / "stage1")
        (ws / "out").mkdir()
        prep = time.time() - t0
        prompt = lab / f"r1b/prompts/verifier_{variant}.txt"
        t_goal = time.time()
        rc, rec = native_goal(app, ws, prompt, arm / "native", slot)
        goal_span = time.time() - t_goal
        outcome, detail = classify(rc, rec)
        copy_native_logs(app, rec, arm / "native")
        frozen = arm / "frozen/verifier"
        shutil.copytree(ws / "out", frozen)
        readonly(frozen)
        t_asm = time.time()
        text, report = asm.assemble(draft_text, blocks,
                                    (frozen / "decisions.md").read_text(errors="replace") if (frozen / "decisions.md").exists() else "",
                                    (frozen / "additions.md").read_text(errors="replace") if (frozen / "additions.md").exists() else "")
        (arm / "frozen/delivered").mkdir()
        (arm / "frozen/delivered/delivered.md").write_text(text)
        (arm / "frozen/delivered/assembly-report.json").write_text(json.dumps(report, indent=1) + "\n")
        readonly(arm / "frozen/delivered")
        receipt = {"schema": "er6.r1b_receipt.v3", "process_exit": rc, "last_native_stop": rec.get("stop_reason"), "slot": slot, "package": package, "app": app, "variant": variant,
                   "host_prep_seconds": round(prep, 2), "goal_span_seconds": round(goal_span, 1),
                   "assembly_seconds": round(time.time() - t_asm, 2), "rc": rc, "native_responses": rec.get("native_responses"),
                   "stop_reason": rec.get("stop_reason"), "driver_error": rec.get("driver_error"),
                   "model_id": rec.get("model_id"), "effort_effective": rec.get("effort_effective"),
                   "prompt_sha256": sha(prompt), "package_draft_sha256": sha(src / "draft.md"),
                   "package_observations_sha256": sha(src / "observations.md"), "blocks": len(blocks),
                   "bundle_summary": bundle_summary, "assembly": report, "carrier_complete": report["complete"],
                   "frozen_verifier_manifest": manifest(frozen), "delivered_sha256": sha(arm / "frozen/delivered/delivered.md")}
    except Exception as exc:  # host fault: preserve what exists, stop the schedule
        detail = f"{type(exc).__name__}: {exc}"
        (arm / "host-exception.txt").write_text(traceback.format_exc())
        outcome = "harness_failure"
    finally:
        receipt.update({"slot": slot, "outcome": outcome, "outcome_detail": detail, "start_utc": utc(t0), "end_utc": utc(),
                        "active_span_seconds": round(time.time() - t0, 1)})
        (arm / "arm-receipt.json").write_text(json.dumps(receipt, indent=1, default=str) + "\n")
        write_status(arm, state="terminal", slot=slot, outcome=outcome, detail=detail, stop_schedule=outcome in STOP)
    print(json.dumps({"slot": slot, "outcome": outcome, "detail": detail}), flush=True)
    return outcome


def slot_state(arm):
    st = arm / "status.json"
    if not st.exists():
        return "unknown"
    s = json.loads(st.read_text())
    if s.get("state") != "terminal":
        return "not_terminal"
    return "done" if s.get("outcome") in CONTINUE else "stopped"


def run_schedule(schedule, runs=RUNS, runner=None, **pf):
    policy = preflight(schedule, **pf)
    runner = runner or run_one
    for slot, package, app, variant in policy["schedules"][schedule]:
        arm = runs / slot
        if arm.exists():
            st = slot_state(arm)
            if st == "done":
                print(json.dumps({"slot": slot, "skipped": "terminal outcome already recorded"}), flush=True)
                continue
            print(json.dumps({"slot": slot, "schedule_stopped": f"existing slot is {st}; manual disposition required"}), flush=True)
            return "stopped"
        print(json.dumps({"slot": slot, "dispatch_utc": utc()}), flush=True)
        outcome = runner(slot, package, app, variant)
        if outcome in STOP:
            print(json.dumps({"slot": slot, "schedule_stopped": outcome}), flush=True)
            return "stopped"
    return "completed"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--schedule", required=True)
    a = ap.parse_args()
    try:
        print(json.dumps({"schedule": a.schedule, "result": run_schedule(a.schedule)}))
    except LaunchRefused as exc:
        print(json.dumps({"schedule": a.schedule, "launch_refused": str(exc)}))
        return 3
    return 0


if __name__ == "__main__":
    sys.exit(main())
