#!/usr/bin/env python3
"""Materialize the immutable v2 test harness's complete valid result fixture."""

from __future__ import annotations

import json
import runpy
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
BUNDLE_ROOT = HERE.parent
AUDIT_ROOT = BUNDLE_ROOT.parents[2]
WAVE_ROOT = AUDIT_ROOT / "master/external_research/universal-shadow-certification-wave-0001"
TEST_PATH = WAVE_ROOT / "validation/postrun-validator-v2/test_universal_shadow_certification_postrun_v2.py"
OUTPUT = BUNDLE_ROOT / "fixtures/known-good-result.json"


def main() -> None:
    sys.path.insert(0, str(TEST_PATH.parent))
    namespace = runpy.run_path(str(TEST_PATH))
    manifest = []
    with (WAVE_ROOT / "batch_manifest.jsonl").open(encoding="utf-8") as handle:
        for line in handle:
            if line.strip():
                manifest.append(json.loads(line))
    assignment = manifest[0]
    packet = json.loads((WAVE_ROOT / assignment["packet_ref"]).read_text(encoding="utf-8"))
    fixture = namespace["valid_result"](assignment, packet)
    OUTPUT.write_bytes((json.dumps(fixture, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode())
    print(json.dumps({"path": str(OUTPUT.resolve()), "assignment_id": fixture["assignment_id"], "feature_certifications": len(fixture["feature_certifications"])}, sort_keys=True))


if __name__ == "__main__":
    main()
