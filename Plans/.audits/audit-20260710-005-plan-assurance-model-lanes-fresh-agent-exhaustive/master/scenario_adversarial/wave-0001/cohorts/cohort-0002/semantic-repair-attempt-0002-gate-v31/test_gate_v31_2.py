#!/usr/bin/env python3
"""Reproducible post-seal rerun of the exact V31.1 348-case semantic suite."""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any

sys.dont_write_bytecode = True
import test_gate_v31_1 as legacy
import verify_gate_v31_1 as gate

HERE = Path(__file__).resolve().parent
REPORT = HERE / "validation/test-report-v31_2.json"
REVIEW = HERE / "validation/luna-prelaunch-review-v31_2.json"
CAPTURE = HERE / "validation/controller-parent-native-identity-capture-v31_2.json"

V31_2_PATHS = {
    HERE / "AUTHORITY_SUPPLEMENT_V31_2.json",
    HERE / "readiness-v31_2.json",
    HERE / "prepare_gate_v31_2.py",
    HERE / "verify_gate_v31_2.py",
    HERE / "test_gate_v31_2.py",
    HERE / "schema/luna_prelaunch_review_v31_2.schema.json",
    HERE / "schema/controller_parent_native_capture_v31_2.schema.json",
    REPORT,
    REVIEW,
    CAPTURE,
}

_original_expected_files = gate.expected_files


def expected_files_with_append_only_supersession(include_terminal: bool = True) -> set[Path]:
    """Accept sealed V31.1 terminal bytes and any extant V31.2 append-only bytes."""
    files = _original_expected_files(include_terminal)
    files.update({gate.READINESS, gate.TEST_REPORT})
    files.update(path for path in V31_2_PATHS if path.exists())
    return files


def write_report_v31_2(report: dict[str, Any]) -> None:
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    raw = (json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode("utf-8")
    descriptor = os.open(REPORT, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    try:
        view = memoryview(raw)
        while view:
            written = os.write(descriptor, view)
            view = view[written:]
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def main() -> None:
    gate.expected_files = expected_files_with_append_only_supersession
    legacy.write_report = write_report_v31_2
    legacy.__file__ = __file__
    legacy.main()


if __name__ == "__main__":
    main()
