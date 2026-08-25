#!/usr/bin/env python3
"""Small typed-result verifier for the course-corrected R10 canary."""

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
RESULT_PREFIX = "PM_RESULT "


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def extract_typed_result(text: str, oracle: object, oracle_text: str, max_bytes: int) -> object:
    assert isinstance(text, str), "final assistant text must be a string"
    assert len(text.encode("utf-8")) <= max_bytes, "final assistant text ceiling"
    result_lines = [line for line in text.splitlines() if line.startswith(RESULT_PREFIX)]
    assert len(result_lines) == 1, "exactly one typed result line"
    nonempty_lines = [line for line in text.splitlines() if line.strip()]
    assert nonempty_lines and nonempty_lines[-1] == result_lines[0], "typed result must be terminal"
    assert result_lines[0] == RESULT_PREFIX + oracle_text, "exact typed result text"
    parsed = json.loads(result_lines[0][len(RESULT_PREFIX):])
    assert parsed == oracle, "exact typed result object"
    return parsed


def verify_run(run_name: str, matrix: dict) -> dict[str, dict]:
    result_path = ROOT / "evidence" / run_name / "results.json"
    result = load(result_path)
    expected_ids = [case["id"] for case in matrix["cases"]]
    rows = result.get("cases")
    assert isinstance(rows, list), f"{run_name}: cases must be a list"
    assert [row.get("id") for row in rows] == expected_ids, f"{run_name}: case roster/order"

    indexed = {}
    for case, row in zip(matrix["cases"], rows, strict=True):
        prescribed = matrix["prescribed_routes"][case["surface"]]
        requested_route = {
            "model": case["requested_runtime"]["model"],
            "thinking": case["requested_runtime"]["thinking"],
        }
        assert requested_route in prescribed, f"{case['id']}: prescribed route"
        prompt = (ROOT / case["prompt_file"]).read_bytes()
        oracle_path = ROOT / case["oracle_file"]
        oracle = load(oracle_path)
        oracle_text = oracle_path.read_text(encoding="utf-8").strip()
        context_start = prompt.index(b"Admitted context:\n") + len(b"Admitted context:\n")
        context_end = prompt.index(b"\n\n", context_start)
        admitted_context_bytes = context_end - context_start
        assert len(prompt) <= matrix["max_prompt_utf8_bytes"], f"{case['id']}: prompt ceiling"
        assert admitted_context_bytes <= matrix["max_admitted_context_utf8_bytes"], (
            f"{case['id']}: admitted-context ceiling"
        )
        prefix = b"Create a goal that " if case["surface"] == "codex_app" else b"/goal "
        assert prompt.startswith(prefix), f"{case['id']}: native prompt prefix"
        assert row.get("prompt_sha256") == sha256(prompt), f"{case['id']}: prompt hash"
        assert row.get("prompt_utf8_bytes") == len(prompt), f"{case['id']}: prompt bytes"
        assert row.get("admitted_context_utf8_bytes") == admitted_context_bytes, (
            f"{case['id']}: admitted-context bytes"
        )
        assert row.get("requested_runtime") == case["requested_runtime"], (
            f"{case['id']}: requested runtime"
        )
        assert row.get("external_prompt_count") == 1, f"{case['id']}: one prompt"
        assert row.get("goal_status") == "complete", f"{case['id']}: Goal terminal"
        goal_evidence = row.get("goal_evidence", {})
        assert goal_evidence.get("activation_observed") is True, f"{case['id']}: Goal activation"
        assert goal_evidence.get("terminal_observed") is True, f"{case['id']}: Goal terminal evidence"
        assert row.get("observed_non_goal_tool_calls") == 0, f"{case['id']}: non-Goal tools"
        assert row.get("filesystem_changes") == 0, f"{case['id']}: filesystem changes"
        final_text = row.get("final_assistant_text")
        typed_result = extract_typed_result(
            final_text,
            oracle,
            oracle_text,
            matrix["max_final_assistant_utf8_bytes"],
        )
        assert row.get("typed_result") == typed_result, f"{case['id']}: recorded typed result"
        effective = row.get("effective_runtime")
        assert effective, f"{case['id']}: effective runtime"
        for field in ("model", "thinking"):
            requested = case["requested_runtime"].get(field)
            if requested is not None:
                assert effective.get(field) == requested, f"{case['id']}: effective {field}"
        if case["surface"] == "omp_tui":
            assert effective.get("advisor_enabled") is False, f"{case['id']}: advisor disabled"
            assert effective.get("task_agent_advisor") == {"task": "off"}, (
                f"{case['id']}: task advisor disabled"
            )
            assert effective.get("memory_backend") == "off", f"{case['id']}: memory disabled"
            assert effective.get("autolearn_enabled") is False, f"{case['id']}: autolearn disabled"
            assert effective.get("mcp_project_config_enabled") is False, f"{case['id']}: MCP project config disabled"
            assert effective.get("approval_mode") == "yolo", f"{case['id']}: native Goal autoapproval"
            assert effective.get("tools_enabled") is False, f"{case['id']}: tools disabled"
            assert effective.get("skills_enabled") is False, f"{case['id']}: skills disabled"
            assert effective.get("rules_enabled") is False, f"{case['id']}: rules disabled"
        refs = row.get("evidence_refs")
        assert isinstance(refs, list) and refs, f"{case['id']}: evidence refs"
        run_dir = result_path.parent.resolve()
        for ref in refs:
            evidence_path = (run_dir / ref).resolve()
            assert evidence_path.parent == run_dir, f"{case['id']}: evidence path scope"
            assert evidence_path.is_file(), f"{case['id']}: missing evidence {ref}"
        indexed[case["id"]] = row
    return indexed


def main() -> int:
    if len(sys.argv) not in (2, 3):
        print("usage: verify.py RUN [RUN]", file=sys.stderr)
        return 2
    matrix = load(ROOT / "matrix.json")
    runs = [(name, verify_run(name, matrix)) for name in sys.argv[1:]]
    if len(runs) == 2:
        (_, first), (_, second) = runs
        for case in matrix["cases"]:
            case_id = case["id"]
            for field in ("prompt_sha256", "prompt_utf8_bytes", "requested_runtime", "effective_runtime"):
                assert first[case_id].get(field) == second[case_id].get(field), (
                    f"{case_id}: unchanged-repeat field {field}"
                )
    print(json.dumps({"status": "PASS", "runs": [name for name, _ in runs]}, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
