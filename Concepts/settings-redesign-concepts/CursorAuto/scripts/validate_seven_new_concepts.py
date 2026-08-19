#!/usr/bin/env python3
"""CursorAuto validator: packet structural checks plus behavioral contracts.

The bakeoff packet tool remains a structural companion (out of this folder).
This script is the model-folder gate and is not structural-only.

Usage:
  python scripts/validate_seven_new_concepts.py
  python scripts/validate_seven_new_concepts.py --root P:/Concepts/settings-redesign-concepts/CursorAuto
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

PACKET_VALIDATORS = [
    Path(r"P:/Concepts/settings-redesign-concepts/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/tools/validate_seven_new_concepts.py"),
    Path(r"C:/Users/sitti/Downloads/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/tools/validate_seven_new_concepts.py"),
]


def run_json(cmd: list[str], cwd: Path | None = None) -> dict:
    proc = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    out = (proc.stdout or "").strip()
    err = (proc.stderr or "").strip()
    payload: dict
    try:
        payload = json.loads(out[out.find("{") :]) if "{" in out else {"raw": out}
    except Exception:
        payload = {"raw": out, "parse_error": True}
    payload["_returncode"] = proc.returncode
    if err:
        payload["_stderr"] = err[-2000:]
    return payload


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=None)
    args = parser.parse_args()
    here = Path(__file__).resolve().parent
    root = Path(args.root).resolve() if args.root else here.parent
    report = {"model_folder": str(root), "status": "pass", "failures": [], "checks": {}}

    packet = next((p for p in PACKET_VALIDATORS if p.is_file()), None)
    if packet:
        proc = subprocess.run([sys.executable, str(packet), str(root)], capture_output=True, text=True)
        packet_out = (proc.stdout or "") + (proc.stderr or "")
        packet_ok = proc.returncode == 0 and "fail" not in packet_out.lower().split("status")[-1][:40]
        # packet tool prints JSON with status
        try:
            packet_json = json.loads(packet_out[packet_out.find("{") :])
            packet_ok = packet_json.get("status") == "pass" and not packet_json.get("failures")
            report["checks"]["packet_structural"] = packet_json
        except Exception:
            report["checks"]["packet_structural"] = {"returncode": proc.returncode, "raw": packet_out[-1500:]}
        if not packet_ok:
            report["failures"].append({"kind": "packet_structural", "detail": "packet validator did not pass"})
    else:
        report["checks"]["packet_structural"] = {"skipped": True, "reason": "packet tool not on disk"}

    beh = run_json([sys.executable, str(here / "behavioral-validate.py"), "--root", str(root)])
    report["checks"]["behavioral"] = beh
    if beh.get("status") != "pass" or beh.get("_returncode") not in (0, None) and beh.get("status") != "pass":
        if beh.get("status") != "pass":
            report["failures"].append({"kind": "behavioral", "detail": beh.get("failures")})

    node_files = [root / "shared" / "v2" / "pmv2.js"]
    for stem in [
        "concept-05-directory-take-1",
        "concept-06-directory-take-2",
        "concept-07-compendium-workspace",
        "concept-08-directory-take-3",
        "concept-09-tome-tabs",
        "concept-10-command-suite",
        "concept-11-tabbed-organizer",
    ]:
        node_files.append(root / stem / f"{stem}.js")
    node_ok = True
    node_detail = []
    for f in node_files:
        proc = subprocess.run(["node", "--check", str(f)], capture_output=True, text=True)
        row = {"file": str(f), "ok": proc.returncode == 0, "stderr": (proc.stderr or "")[:300]}
        node_detail.append(row)
        if proc.returncode != 0:
            node_ok = False
            report["failures"].append({"kind": "node_check", "path": str(f), "detail": row["stderr"]})
    report["checks"]["node_check"] = {"ok": node_ok, "files": node_detail}

    live = root / "shared" / "v2" / "binary-locator-live.json"
    if not live.is_file():
        report["failures"].append({"kind": "binary_locator_live", "detail": "missing snapshot"})
    else:
        snap = json.loads(live.read_text(encoding="utf-8"))
        report["checks"]["binary_locator_live"] = snap.get("resolved")
        if snap.get("owner") != "BinaryLocator":
            report["failures"].append({"kind": "binary_locator_live", "detail": "owner is not BinaryLocator"})

    report["status"] = "pass" if not report["failures"] else "fail"
    print(json.dumps(report, indent=2))
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
