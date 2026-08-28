#!/usr/bin/env python3
import copy, json, tempfile
from pathlib import Path

import controller as C
def require(value, message):
    if not value: raise RuntimeError(message)

SOURCE = Path("/tmp/pm-r10-storage-dev-20260828-runs/dev05/evidence/diagnostic_01/omp_mimo_v25_free_high/session.raw.jsonl")
ORACLE = C.P.load_json(C.V7 / "oracle.json")
CANON = json.dumps(ORACLE, separators=(",", ":"))


def session_with(first_text: str, final_text: str) -> tuple[Path, dict]:
    lines = [json.loads(line) for line in SOURCE.read_text().splitlines()]
    assistant_indexes = [i for i, item in enumerate(lines) if item.get("type") == "message" and item.get("message", {}).get("role") == "assistant"]
    require(len(assistant_indexes) == 2,"source assistant roster")
    for index, text in zip(assistant_indexes, (first_text, final_text), strict=True):
        lines[index]["message"]["content"] = [{"type": "text", "text": text}]
    lines[assistant_indexes[-1]]["message"]["content"].append({"type":"toolCall","id":"goal-call","name":"goal","arguments":{"op":"complete"}})
    target = Path(tempfile.mkdtemp(prefix="pm-r10-storage-dev-normalizer-")) / "session.jsonl"
    target.write_text("".join(json.dumps(item, separators=(",", ":")) + "\n" for item in lines))
    return target, {"assistant_message_count": 2, "final_text": final_text}


def accepted(separator: str, *, trailing: str = "ordinary final prose") -> dict:
    path, structural = session_with("prefix\nPM_RESULT" + separator + CANON + "\npost", trailing)
    try:
        return C.semantic_normalize(path, structural, oracle_path=C.V7 / "oracle.json", schema_path=C.V7 / "response.schema.json", max_text_block_utf8_bytes=8192)
    finally:
        path.unlink(); path.parent.rmdir()


def rejected(first_text: str) -> str:
    path, structural = session_with(first_text, "final prose")
    try:
        try:
            C.semantic_normalize(path, structural, oracle_path=C.V7 / "oracle.json", schema_path=C.V7 / "response.schema.json", max_text_block_utf8_bytes=8192)
        except Exception as exc:
            return f"{type(exc).__name__}: {exc}"
        raise RuntimeError("mutation accepted")
    finally:
        path.unlink(); path.parent.rmdir()


one = accepted(" ")
newline = accepted("\n", trailing="final assistant text after the Goal tool result remains benign")
pretty = json.dumps(ORACLE, indent=2)
path, structural = session_with("PM_RESULT\r\n" + pretty, "trailing final response")
try:
    pretty_result = C.semantic_normalize(path, structural, oracle_path=C.V7 / "oracle.json", schema_path=C.V7 / "response.schema.json", max_text_block_utf8_bytes=8192)
finally:
    path.unlink(); path.parent.rmdir()
sixty_four = accepted(" \t\r\n" * 16)
require(all(item["final_text"] == one["final_text"] for item in (newline, pretty_result, sixty_four)),"canonical equivalence")
require(newline["raw_last_assistant_text"].startswith("final assistant text"),"trailing assistant custody")
too_many = rejected("PM_RESULT" + " " * 65 + CANON)
none = rejected("PM_RESULT" + CANON)
conflict_value = dict(ORACLE); conflict_value["source_match"] = False
conflict = rejected("PM_RESULT " + CANON + "\nPM_RESULT " + json.dumps(conflict_value, separators=(",", ":")))
require("whitespace" in too_many.lower() and "whitespace" in none.lower() and ("conflict" in conflict.lower() or "differs" in conflict.lower()),"strict mutations")
C.DB.cleanup()
print(json.dumps({"status": "PASS_MUTABLE_DEV_SELFTEST", "checks": 9, "separator_bounds": [1, 64], "newline_before_raw_decode": True, "pretty_crlf": True, "trailing_final_assistant_text_benign": True, "strict_65": too_many, "strict_zero": none, "strict_conflict": conflict}, sort_keys=True))
