#!/usr/bin/env python3
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VERIFY = ROOT / "verify_external_research_retry_v2.py"

def main():
    completed = subprocess.run([sys.executable, str(VERIFY)], capture_output=True, text=True)
    try:
        verifier = json.loads(completed.stdout)
    except json.JSONDecodeError:
        print(json.dumps({"checker": "external_research_retry_preparation_v2", "status": "fail", "errors": ["verifier_output_invalid", completed.stdout[-500:]]}, sort_keys=True))
        return 1
    report = {
        "checker": "external_research_retry_preparation_v2",
        "status": "pass" if completed.returncode == 0 and verifier.get("status") == "pass" else "fail",
        "preparation_only": True,
        "launch_performed": False,
        "activation_granted": False,
        "coverage_credit": 0,
        "research_credit": 0,
        "verifier": verifier,
        "errors": [] if completed.returncode == 0 else verifier.get("errors", ["verifier_failed"]),
    }
    print(json.dumps(report, sort_keys=True, separators=(",", ":")))
    return 0 if report["status"] == "pass" else 1

if __name__ == "__main__":
    sys.exit(main())

