#!/usr/bin/env python3
"""Candidate-10 binding facade over the immutable candidate-9 subject driver.

The semantic driver implementation is reused byte-for-byte.  Only the
candidate-local harness/verifier paths and candidate identity are rebound.
"""
from __future__ import annotations

import importlib.util
from pathlib import Path
import sys

sys.dont_write_bytecode = True

REPO = Path("/mnt/Cursor/PuppetMaster")
SUCCESSOR = REPO / "tests/agent_packet_restrictions/successor_20260813"
ROOT = SUCCESSOR / "model_retest_r8_candidate_v10"
BASE_PATH = SUCCESSOR / "model_retest_r8_candidate_v9/r8_subject_task_driver.py"
CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-10"


def _load_base():
    spec = importlib.util.spec_from_file_location("pw_r8_candidate_v9_subject_driver_for_v10", BASE_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("candidate-v9 subject driver import unavailable")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    module.LANE = ROOT
    module.HARNESS = ROOT / "r8_harness.py"
    module.VERIFIER = ROOT / "r8_run_verifier.py"
    module.CANDIDATE_ID = CANDIDATE_ID
    return module


_BASE = _load_base()


def main() -> int:
    return _BASE.main()


if __name__ == "__main__":
    raise SystemExit(main())
