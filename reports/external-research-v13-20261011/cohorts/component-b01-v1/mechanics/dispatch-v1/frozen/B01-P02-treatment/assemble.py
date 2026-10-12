#!/usr/bin/env python3
"""Deterministically assemble the B01-P02 final from the admitted draft and amendments."""
import hashlib
import json
import os
import re
import sys
import tempfile
from pathlib import Path

STAGE = Path("ER13_RUNTIME/mechanics/dispatch-v1/admitted/B01-P02-treatment")
DRAFT = STAGE / "inputs/B01-P02/draft.md"
AMENDMENTS = STAGE / "amendments.json"
FINAL = STAGE / "final.md"
RESULTS = STAGE / "assembly-results.json"
EXPECTED_DRAFT_SHA256 = "ecf0fd43dd4d9d3d63dfec2ae8042c4981e83ad3fb53a453c99be8cb28a9a7f3"

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def atomic_replace(path: Path, data: bytes):
    fd, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=STAGE)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(data)
        os.chmod(temp_name, 0o444)
        os.replace(temp_name, path)
    finally:
        if os.path.exists(temp_name):
            os.unlink(temp_name)

def line_offsets(text: str):
    lines = text.splitlines(keepends=True)
    offsets = []
    at = 0
    for line in lines:
        offsets.append(at)
        at += len(line)
    offsets.append(at)
    return lines, offsets

def section_paragraph_span(text: str, heading: str, wanted: int):
    lines, offsets = line_offsets(text)
    try:
        start_line = next(i for i, line in enumerate(lines) if line.rstrip("\r\n") == heading)
    except StopIteration:
        raise ValueError(f"missing section heading: {heading}")
    level = len(re.match(r"^(#+)", heading).group(1))
    end_line = len(lines)
    for i in range(start_line + 1, len(lines)):
        match = re.match(r"^(#+)\s", lines[i])
        if match and len(match.group(1)) <= level:
            end_line = i
            break
    blocks = []
    i = start_line + 1
    while i < end_line:
        if not lines[i].strip():
            i += 1
            continue
        first = i
        while i < end_line and lines[i].strip():
            i += 1
        blocks.append((offsets[first], offsets[i]))
    if wanted < 1 or wanted > len(blocks):
        raise ValueError(f"{heading} has {len(blocks)} paragraphs; requested {wanted}")
    return blocks[wanted - 1]

def main():
    refresh = sys.argv[1:] == ["--refresh"]
    if sys.argv[1:] not in ([], ["--refresh"]):
        raise ValueError("usage: assemble.py [--refresh]")
    draft_bytes = DRAFT.read_bytes()
    if sha(draft_bytes) != EXPECTED_DRAFT_SHA256:
        raise ValueError("draft SHA-256 differs from the admitted input map")
    draft = draft_bytes.decode("utf-8")
    am_bytes = AMENDMENTS.read_bytes()
    spec = json.loads(am_bytes)
    if spec["source"]["sha256"] != EXPECTED_DRAFT_SHA256:
        raise ValueError("amendment source hash does not match expected draft")

    prior_final_sha256 = None
    if FINAL.exists() or RESULTS.exists():
        if not refresh or not FINAL.exists() or not RESULTS.exists():
            raise FileExistsError("existing output pair requires --refresh and matching prior hashes")
        previous = json.loads(RESULTS.read_text())
        prior_final_sha256 = previous["assembly"]["final_sha256"]
        if sha(FINAL.read_bytes()) != prior_final_sha256 or previous["assembly"]["draft_sha256"] != sha(draft_bytes):
            raise ValueError("existing final/results do not match a prior assembly from this admitted draft")

    edits = []
    for op in spec["operations"]:
        if op["kind"] == "replace_exact":
            old = op["old_text"]
            if draft.count(old) != 1:
                raise ValueError(f"{op['id']}: expected one exact match, found {draft.count(old)}")
            start = draft.index(old)
            end = start + len(old)
        elif op["kind"] == "replace_paragraph":
            start, end = section_paragraph_span(draft, op["section"], op["paragraph_index"])
            old = draft[start:end]
            if not old.strip():
                raise ValueError(f"{op['id']}: selected paragraph is empty")
        else:
            raise ValueError(f"unsupported operation kind: {op['kind']}")
        new = op["new_text"]
        if not new.endswith("\n"):
            new += "\n"
        edits.append({
            "id": op["id"], "start": start, "end": end, "old": old, "new": new,
            "rationale": op.get("rationale", ""), "evidence": op.get("evidence", [])
        })
    edits.sort(key=lambda item: (item["start"], item["end"]))
    prior_end = 0
    for item in edits:
        if item["start"] < prior_end:
            raise ValueError(f"overlapping replacement at {item['id']}")
        prior_end = item["end"]

    chunks, retained, replacements = [], [], []
    cursor = 0
    for item in edits:
        if cursor < item["start"]:
            segment = draft[cursor:item["start"]]
            chunks.append(segment)
            retained.append({
                "source_char_interval": [cursor, item["start"]],
                "sha256_utf8": sha(segment.encode("utf-8")),
                "text": segment
            })
        chunks.append(item["new"])
        replacements.append({
            "id": item["id"],
            "source_char_interval": [item["start"], item["end"]],
            "removed_text": item["old"],
            "removed_sha256_utf8": sha(item["old"].encode("utf-8")),
            "replacement_text": item["new"],
            "replacement_sha256_utf8": sha(item["new"].encode("utf-8")),
            "rationale": item["rationale"],
            "evidence": item["evidence"]
        })
        cursor = item["end"]
    if cursor < len(draft):
        segment = draft[cursor:]
        chunks.append(segment)
        retained.append({
            "source_char_interval": [cursor, len(draft)],
            "sha256_utf8": sha(segment.encode("utf-8")),
            "text": segment
        })
    assembled = "".join(chunks)
    append_text = spec.get("append_text", "")
    assembled += append_text

    code_bytes = Path(__file__).read_bytes()
    stdout = f"assembled final.md sha256={sha(assembled.encode('utf-8'))} chars={len(assembled)} replacements={len(replacements)}\n"
    result = {
        "status": "complete",
        "interpretation": "Deterministic retention/replacement/append of the admitted draft; this verifies assembly provenance, not product truth or importer behavior.",
        "limits": [
            "No importer or application implementation was executed.",
            "Retained draft prose remains supported only to the extent identified in the review and source map.",
            "Proposed numeric resource defaults and supported text/media types remain explicit release decisions."
        ],
        "review_execution": {
            "requested_route": "Luna Max Standard",
            "returned_provider_model_tier": "unknown",
            "reason": "The saved create_goal response and get_goal observation contained a Goal thread ID/status/objective but no provider, model, or tier fields.",
            "native_goal_thread_id": "01a12d89-9723-7d13-a396-0562db3978ce",
            "status_at_observation": "active"
        },
        "assembly": {
            "command": f"python3 -B {Path(__file__)}" + (" --refresh" if refresh else ""),
            "previous_final_sha256": prior_final_sha256,
            "python_version": sys.version,
            "assembly_script_sha256": sha(code_bytes),
            "draft_path": str(DRAFT),
            "draft_sha256": sha(draft_bytes),
            "amendments_path": str(AMENDMENTS),
            "amendments_sha256": sha(am_bytes),
            "final_path": str(FINAL),
            "final_sha256": sha(assembled.encode("utf-8")),
            "final_characters": len(assembled),
            "final_utf8_bytes": len(assembled.encode("utf-8")),
            "stdout": stdout,
            "stderr": "",
            "returncode": 0
        },
        "retained_text_intervals": retained,
        "replacements": replacements,
        "append": {
            "source_char_offset": len("".join(chunks)),
            "text": append_text,
            "sha256_utf8": sha(append_text.encode("utf-8"))
        }
    }
    raw = (json.dumps(result, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    atomic_replace(FINAL, assembled.encode("utf-8"))
    atomic_replace(RESULTS, raw)
    sys.stdout.write(stdout)

if __name__ == "__main__":
    main()
