#!/usr/bin/env python3
"""Preregistered serial R1 schedule: M-control, M-candidate, Z-candidate, Z-control. No retries, no reorder."""
import json, subprocess, sys, time
from pathlib import Path
LAB = Path("/home/sittingmongoose/PM-Experiments/external-research-v6-20260926")
SCHEDULE = [("M-control", "muse", "control"), ("M-candidate", "muse", "candidate"),
            ("Z-candidate", "zcode", "candidate"), ("Z-control", "zcode", "control")]
only = set(sys.argv[1:])
for slot, app, variant in SCHEDULE:
    if only and slot not in only:
        continue
    if (LAB / "runs" / slot).exists():
        print(json.dumps({"slot": slot, "skipped": "already exists (no overwrite)"}), flush=True); continue
    if app == "muse":  # account gate from the latest observed Muse subscription window
        last = sorted(LAB.glob("runs/M-*/s*/receipt.json"), key=lambda p: p.stat().st_mtime) or [LAB / "dev/smoke/run-muse/receipt.json"]
        u = json.loads(last[-1].read_text()).get("usage_read_after", {}).get("usage", {})
        w, wk = u.get("window", {}).get("usedPercent"), u.get("weekly", {}).get("usedPercent")
        if (w is not None and w >= 90) or (wk is not None and wk >= 95):
            print(json.dumps({"slot": slot, "held": "muse usage gate", "window": w, "weekly": wk}), flush=True); break
    print(json.dumps({"slot": slot, "dispatch_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}), flush=True)
    subprocess.run([sys.executable, str(LAB / "tools/run_arm.py"), "--slot", slot, "--app", app, "--variant", variant])
print(json.dumps({"r1_schedule_done_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}), flush=True)
