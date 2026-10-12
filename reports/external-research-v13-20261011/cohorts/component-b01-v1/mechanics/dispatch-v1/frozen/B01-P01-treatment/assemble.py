#!/usr/bin/env python3
"""Deterministically assemble final.md from the frozen draft and amendments."""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
INPUT_DIR = ROOT / "inputs" / "B01-P01"
DRAFT = INPUT_DIR / "draft.md"
AMENDMENTS = ROOT / "amendments.json"
RESULTS = ROOT / "assembly-results.json"
FINAL = ROOT / "final.md"

def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))

input_map = read_json(ROOT / "input-map.json")
expected = next(
    item["sha256"] for item in input_map["inputs"]
    if Path(item["path"]).name == "draft.md"
)
draft_bytes = DRAFT.read_bytes()
draft_sha = sha256(draft_bytes)
if draft_sha != expected:
    raise SystemExit(f"draft hash mismatch: expected {expected}, got {draft_sha}")
draft = draft_bytes.decode("utf-8")

amendments_bytes = AMENDMENTS.read_bytes()
amendments = json.loads(amendments_bytes)
if amendments["base_sha256"] != draft_sha:
    raise SystemExit("amendments do not match the verified frozen draft")

ops = []
for item in amendments["replacements"]:
    mode = item["mode"]
    if mode == "replace_exact":
        anchor = item["source_text"]
        if draft.count(anchor) != 1:
            raise SystemExit(f"source text must occur exactly once: {item['id']}")
        start = draft.index(anchor)
        end = start + len(anchor)
        old = anchor
    elif mode == "insert_after":
        anchor = item["anchor_text"]
        if draft.count(anchor) != 1:
            raise SystemExit(f"insertion anchor must occur exactly once: {item['id']}")
        start = draft.index(anchor) + len(anchor)
        end = start
        old = ""
    else:
        raise SystemExit(f"unsupported operation mode: {mode}")
    ops.append({
        "id": item["id"],
        "mode": mode,
        "criticism": item["criticism"],
        "start": start,
        "end": end,
        "old": old,
        "new": item["text"],
        "anchor": anchor,
    })

ops.sort(key=lambda op: (op["start"], op["end"]))
for left, right in zip(ops, ops[1:]):
    if left["end"] > right["start"]:
        raise SystemExit("amendment intervals overlap")

# Record every retained source interval and its exact destination interval.
retained = []
cursor = 0
delta = 0
for op in ops:
    if cursor < op["start"]:
        segment = draft[cursor:op["start"]]
        retained.append({
            "source_char_range_half_open": [cursor, op["start"]],
            "final_char_range_half_open": [cursor + delta, op["start"] + delta],
            "sha256": sha256(segment.encode("utf-8")),
            "characters": len(segment),
        })
    delta += len(op["new"]) - (op["end"] - op["start"])
    cursor = op["end"]
if cursor < len(draft):
    segment = draft[cursor:]
    retained.append({
        "source_char_range_half_open": [cursor, len(draft)],
        "final_char_range_half_open": [cursor + delta, len(draft) + delta],
        "sha256": sha256(segment.encode("utf-8")),
        "characters": len(segment),
    })

final = draft
for op in reversed(ops):
    final = final[:op["start"]] + op["new"] + final[op["end"]:]

replacement_records = []
delta = 0
for op in ops:
    final_start = op["start"] + delta
    replacement_records.append({
        "id": op["id"],
        "mode": op["mode"],
        "criticism": op["criticism"],
        "source_char_range_half_open": [op["start"], op["end"]],
        "source_sha256": sha256(op["old"].encode("utf-8")),
        "final_char_range_half_open": [final_start, final_start + len(op["new"])],
        "replacement_sha256": sha256(op["new"].encode("utf-8")),
        "replacement_characters": len(op["new"]),
        "anchor": op["anchor"],
    })
    delta += len(op["new"]) - (op["end"] - op["start"])

final_bytes = final.encode("utf-8")
FINAL.write_bytes(final_bytes)
stdout_payload = {
    "status": "assembled",
    "final_file": "final.md",
    "final_sha256": sha256(final_bytes),
    "final_characters": len(final),
    "retained_intervals": len(retained),
    "replacements": len(ops),
}
results = {
    **stdout_payload,
    "assembly_command": "python3 -B assemble.py",
    "runtime": sys.version,
    "exit_code": 0,
    "stdout": json.dumps(stdout_payload, ensure_ascii=False, separators=(",", ":")),
    "stderr": "",
    "base_input": "inputs/B01-P01/draft.md",
    "base_sha256": draft_sha,
    "amendments_file": "amendments.json",
    "amendments_sha256": sha256(amendments_bytes),
    "assembly_script": "assemble.py",
    "assembly_script_sha256": sha256(Path(__file__).read_bytes()),
    "final_lines": final.count("\n"),
    "retained_text_intervals": retained,
    "replacements_detail": replacement_records,
}
RESULTS.write_text(json.dumps(results, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="")
print(json.dumps(stdout_payload, indent=2, ensure_ascii=False))
