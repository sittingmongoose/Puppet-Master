#!/usr/bin/env python3
"""Check merge-2 explicit Git source citations and their distinct live editions (T263)."""
import argparse
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
spec = importlib.util.spec_from_file_location("editions_writer", ROOT / "scripts/pm-ea-admission-writer.py")
w = importlib.util.module_from_spec(spec)
spec.loader.exec_module(w)
FOLDER = "reports/event-authority-20261116/admission-merge-2"
RECEIVED = "dfea17a6c44205c69598882b0305b0cbeab1a3e8"


def check(item):
    source = item.get("source_citation", {})
    if not source.get("commit"):
        return []
    problems = w.source_citation_problems(source)
    received = item.get("received_source_citation")
    if received and received.get("commit") and w.source_citation_problems(received):
        problems.append("mixed received source belongs in the separate immutable input receipt")
    try:
        w.refresh_evidence(item)
    except w.Gap as exc:
        problems.append(str(exc))
    raw = (ROOT / item["path"]).read_bytes()
    lines = raw.decode().splitlines()
    digest = hashlib.sha256(raw).hexdigest()
    for key in ("sha256", "file_sha256"):
        if key in item and item[key] != digest:
            problems.append("current " + key + " differs")
    a, b = item["line_start"], item["line_end"]
    quote = item["quote"]
    if not 1 <= a <= b <= len(lines) or quote not in "\n".join(lines[a - 1:b]):
        problems.append("current line range does not contain its quotation")
    for key in ("line", "quote_line"):
        if key in item and (not 1 <= item[key] <= len(lines) or quote.splitlines()[0] not in lines[item[key] - 1]):
            problems.append("current " + key + " differs")
    if "excerpt_sha256" in item:
        excerpt = quote if item.get("excerpt_digest_convention", "whole_line") == "literal_quote" else "\n".join(lines[a - 1:b])
        if hashlib.sha256(excerpt.encode()).hexdigest() != item["excerpt_sha256"]:
            problems.append("current excerpt_sha256 differs")
    return problems


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--output", type=Path)
    p.add_argument("--self-test", action="store_true", help="replay the 50 real mixed pairs received at FIX3")
    args = p.parse_args()
    records, failures, controls = [], [], []
    for path in sorted((ROOT / FOLDER / "depth").glob("*.json")):
        doc = json.loads(path.read_text())
        name = doc["rows"][0]["event_type"]
        for criterion, cell in doc["rows"][0]["cells"].items():
            for ordinal, item in enumerate(cell.get("evidence", [])):
                if not item.get("source_citation", {}).get("commit"):
                    continue
                issues = check(item)
                record = dict(event_type=name, criterion=criterion, ordinal=ordinal,
                              current_path=item["path"], source_commit=item["source_citation"]["commit"],
                              current_hash=item["file_sha256"], source_hash=item["source_citation"]["file_sha256"],
                              current_range=[item["line_start"], item["line_end"]],
                              source_range=[item["source_citation"].get("line_start"), item["source_citation"].get("line_end")],
                              problems=issues)
                records.append(record)
                failures.extend(dict(event_type=name, ordinal=ordinal, problem=x) for x in issues)
        if args.self_test and any(x["event_type"] == name for x in records):
            original = json.loads(subprocess.check_output(["git", "-C", str(ROOT), "show", RECEIVED + ":" + str(path.relative_to(ROOT))]))
            original_items = original["rows"][0]["cells"]["positive_negative_oracles"]["evidence"]
            for item in original_items:
                if not item.get("source_citation", {}).get("commit"):
                    continue
                bad = w.source_citation_problems(item["source_citation"])
                refused = False
                try:
                    w.refresh_evidence(item, event_type=name, criterion="positive_negative_oracles")
                except w.Gap:
                    refused = True
                fixed = copy.deepcopy(item)
                fixed["source_citation"] = w.rederive_source_citation(item["source_citation"])
                fixed = w.refresh_evidence(fixed, event_type=name, criterion="positive_negative_oracles")
                restored = check(fixed)
                controls.append(dict(event_type=name, original_problems=bad,
                                     mixed_input_refused=refused, rederived_problems=restored))
                if not bad or not refused or restored:
                    failures.append(dict(event_type=name, problem="received mixed-pair regression failed"))
    if len(records) != 50 or len({x["event_type"] for x in records}) != 25:
        failures.append(dict(problem="expected exactly 50 explicit source/live pairs across 25 DO families"))
    if args.self_test and len(controls) != 50:
        failures.append(dict(problem="incomplete real-input regression coverage"))
    result = dict(schema_id="pm.ea.citation_editions.v1", pairs=records, controls=controls, failures=failures,
                  status="fail" if failures else "pass")
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(dict(status=result["status"], pairs=len(records), real_input_controls=len(controls), failures=len(failures))))
    return int(bool(failures))


if __name__ == "__main__":
    raise SystemExit(main())
