#!/usr/bin/env python3
"""Paired contract tests for the narrow owner-merge v2 validator change."""

from __future__ import annotations

import copy
import json

from test_owner_merge_validator import fixture, run_tests as run_v1_tests
from validate_owner_merge_batch_v2 import result_errors_v2


def main() -> None:
    tests = run_v1_tests()
    assignment, packet, receipt, result = fixture()

    exact_empty_packet = copy.deepcopy(packet)
    for member in exact_empty_packet["features"]:
        member["source_unit_refs"] = []
    exact_empty_result = copy.deepcopy(result)
    exact_empty_result["provisional_features"][0]["source_unit_refs"] = []
    tests["exact_empty_source_ref_union_passed"] = (
        result_errors_v2(exact_empty_result, assignment, exact_empty_packet, receipt) == []
    )

    omitted_nonempty_result = copy.deepcopy(result)
    omitted_nonempty_result["provisional_features"][0]["source_unit_refs"] = []
    tests["nonempty_source_ref_union_omission_rejected"] = bool(
        result_errors_v2(omitted_nonempty_result, assignment, packet, receipt)
    )

    report = {"status": "pass" if all(tests.values()) else "fail", "strict_tests": tests}
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
