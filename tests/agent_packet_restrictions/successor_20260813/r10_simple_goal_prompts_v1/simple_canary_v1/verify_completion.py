#!/usr/bin/env python3
"""Verify one or two required-route completion passes."""

from __future__ import annotations

import json
import sys

import verify as shared


def main() -> int:
    if len(sys.argv) not in (2, 3):
        print("usage: verify_completion.py PASS [PASS]", file=sys.stderr)
        return 2
    matrix = shared.load(shared.ROOT / "completion_matrix.json")
    runs = [(name, shared.verify_run(name, matrix)) for name in sys.argv[1:]]
    if len(runs) == 2:
        (_, first), (_, second) = runs
        for case in matrix["cases"]:
            case_id = case["id"]
            for field in (
                "prompt_sha256",
                "prompt_utf8_bytes",
                "requested_runtime",
                "effective_runtime",
            ):
                assert first[case_id].get(field) == second[case_id].get(field), (
                    f"{case_id}: unchanged-repeat field {field}"
                )
    print(
        json.dumps(
            {"status": "PASS", "passes": [name for name, _ in runs]},
            separators=(",", ":"),
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
