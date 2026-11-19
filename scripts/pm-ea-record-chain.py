#!/usr/bin/env python3
"""Check all merge-2 admission pins against current bytes and named Git editions.

Historical records are immutable witnesses. Their primary assessment/decision
pins are checked at the declared predecessor commit; a current maintenance pin
must never borrow the bytes of an intermediate working copy.
"""
from __future__ import annotations

import argparse
from functools import lru_cache
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import pm_ea_admission_mode as mode

FOLDER = "reports/event-authority-20261116/admission-merge-2"
RECORDS = "reports/event-authority-20260911/admission-records"
REGISTRY = "Plans/event_family_registry.json"
REVISION = None


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


@lru_cache(maxsize=64)
def git_bytes(commit, path):
    if not re.fullmatch(r"[0-9a-f]{40}", commit):
        raise ValueError("source_commit must be a full Git commit: " + str(commit))
    return subprocess.check_output(["git", "-C", str(ROOT), "show", commit + ":" + path])


def current(path):
    return git_bytes(REVISION, path) if REVISION else (ROOT / path).read_bytes()


def decision_bytes(raw, decision):
    marker = ("### " + decision + ":").encode()
    if raw.count(marker) != 1:
        raise ValueError("decision entry is missing or ambiguous: " + decision)
    start = raw.index(marker)
    body_start = raw.index(b"\n", start) + 1
    following = re.search(rb"(?m)^#{1,3} ", raw[body_start:])
    end = body_start + following.start() if following else len(raw)
    return raw[start:end]


def main():
    global REVISION
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--revision")
    p.add_argument("--output", type=Path)
    p.add_argument("--refresh", action="store_true", help="re-derive records after owners, assessments and decision entries are final")
    p.add_argument("--source-commit", help="full immutable predecessor edition for --refresh")
    args = p.parse_args()
    REVISION = args.revision
    if args.refresh and (REVISION or not args.source_commit):
        p.error("--refresh requires --source-commit and forbids --revision")
    ready = {r["event_type"]: r for name in ("readiness-list.json", "usage-readiness-list.json")
             for r in json.loads(current(FOLDER + "/" + name))["ready"]}
    assert len(ready) == 299
    registry = json.loads(current(REGISTRY))
    live = {r["event_type"]: r for r in registry["families"]}
    decisions = current("Plans/Decision_Log.md")
    receipt_path = "reports/event-authority-20260911/step-10-post-august-admission-receipt.json"
    history = mode._git_history(ROOT)
    assert history, "reachable Git registry history is required"
    findings, results, writes = [], [], {}
    for event, prepared in sorted(ready.items()):
        path = RECORDS + "/" + event + ".json"
        record = json.loads(current(path))
        pins = []
        def check(label, claimed, actual, edition):
            pins.append(dict(pin=label, claimed=claimed, actual=actual, edition=edition))
            if claimed != actual:
                findings.append(dict(event_type=event, lane=prepared["lane"], record=path,
                                     pin=label, claimed=claimed, actual=actual, edition=edition))
        depth_path = record["depth_assessment"]["path"]
        check("implementation_receipt", record["implementation_receipt_sha256"], sha(current(receipt_path)), REVISION or "working_tree")
        depth = current(depth_path)
        doc = json.loads(depth)
        if args.refresh:
            source = args.source_commit
            old_record_raw = git_bytes(source, path)
            old_record = json.loads(old_record_raw)
            old_depth = git_bytes(source, depth_path)
            header = doc["evidence_maintenance"]
            if header["source_commit"] != source or header["source_assessment_sha256"] != sha(old_depth):
                raise ValueError("assessment must be derived from the same Git predecessor before records: " + event)
            if any(record[k] != old_record[k] for k in ("decision_ref", "registry_before", "registry_after")):
                raise ValueError("record refresh cannot change admission authority/checkpoints: " + event)
            record["depth_assessment"]["sha256"] = sha(depth)
            record["decision_section_sha256"] = sha(decision_bytes(decisions, record["decision_ref"].split("#")[1]))
            record["evidence_maintenance"] = dict(
                authority="MERGE2-FIX4", source_commit=source,
                source_record_sha256=sha(old_record_raw), source_assessment_sha256=sha(old_depth),
                source_decision_section_sha256=sha(decision_bytes(git_bytes(source, "Plans/Decision_Log.md"), old_record["decision_ref"].split("#")[1])),
                original_registry_checkpoints_preserved=True)
            writes[path] = json.dumps(record, indent=1, ensure_ascii=False) + "\n"
        check("current_assessment", record["depth_assessment"]["sha256"], sha(depth), REVISION or "working_tree")
        decision = record["decision_ref"].split("#")[1]
        check("current_decision", record["decision_section_sha256"], sha(decision_bytes(decisions, decision)), REVISION or "working_tree")
        maintenance = record["evidence_maintenance"]
        source = maintenance["source_commit"]
        predecessor_raw = git_bytes(source, path)
        predecessor = json.loads(predecessor_raw)
        old_depth = git_bytes(source, depth_path)
        old_decisions = git_bytes(source, "Plans/Decision_Log.md")
        check("predecessor_implementation_receipt", predecessor["implementation_receipt_sha256"],
              sha(git_bytes(source, receipt_path)), source)
        correction_transition = False
        if record.get("postfix_correction"):
            from pm_ea_postfix_corrections import witness
            try:
                corrected, prior = witness(record, ROOT)
                correction_transition = source == corrected["source_commit"] and record["decision_ref"] == corrected["decision_ref"] and predecessor["decision_ref"] == prior["decision_ref"]
                check("postfix_application_witness", corrected["event_type"], event, corrected["application_commit"])
            except (ValueError, KeyError, OSError, subprocess.SubprocessError) as exc:
                check("postfix_application_witness", str(exc), None, "Git")
        if not correction_transition:
            check("shared_decision_ref", record["decision_ref"], predecessor["decision_ref"], source)
        check("shared_assessment_path", depth_path, predecessor["depth_assessment"]["path"], source)
        check("predecessor_record", maintenance["source_record_sha256"], sha(predecessor_raw), source)
        check("predecessor_assessment", maintenance["source_assessment_sha256"], sha(old_depth), source)
        check("assessment_predecessor", doc["evidence_maintenance"]["source_assessment_sha256"],
              sha(git_bytes(doc["evidence_maintenance"]["source_commit"], depth_path)),
              doc["evidence_maintenance"]["source_commit"])
        check("shared_predecessor_commit", doc["evidence_maintenance"]["source_commit"], source, source)
        check("predecessor_record_assessment", predecessor["depth_assessment"]["sha256"], sha(old_depth), source)
        old_decision = sha(decision_bytes(old_decisions, predecessor["decision_ref"].split("#")[1]))
        check("predecessor_record_decision", predecessor["decision_section_sha256"], old_decision, source)
        check("predecessor_decision", maintenance["source_decision_section_sha256"], old_decision, source)
        for side in ("registry_before", "registry_after"):
            check(side + "_preserved", record[side], predecessor[side], source)
            checkpoint = record[side]
            raw = history.get(checkpoint["sha256"])
            actual = (dict(revision=json.loads(raw)["registry_revision"], sha256=sha(raw),
                           family_count=len(json.loads(raw)["families"])) if raw else None)
            check(side + "_git", checkpoint, actual, "reachable Git registry blob")
        correction = record.get("registry_row_correction")
        row_digest = mode.canonical_sha256(live[event])
        check("current_registry_row", record["registry_row_sha256"], row_digest, REVISION or "working_tree")
        # The ordinary mode also validates the exact reviewed correction and
        # one-family before/after append semantics; it never blesses new rows.
        index = next(i for i, r in enumerate(registry["families"]) if r["event_type"] == event)
        problem = mode.registry_history_problem(record, registry, index, ROOT)
        check("append_checkpoint_semantics", problem, None, "Git / reviewed row correction")
        results.append(dict(event_type=event, lane=prepared["lane"], pins=pins))
    changed = []
    if args.refresh and not findings:
        for path, body in writes.items():
            if (ROOT / path).read_text() != body:
                (ROOT / path).write_text(body)
                changed.append(path)
    result = dict(schema_id="pm.ea.record_chain.v1", input_revision=REVISION or "working_tree",
                  script_sha256=sha(Path(__file__).read_bytes()), refreshed_candidates=len(writes), changed_records=changed,
                  families=len(ready), records=results, findings=findings,
                  by_lane={lane: sum(x["lane"] == lane for x in findings)
                           for lane in sorted({r["lane"] for r in ready.values()})})
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(dict(families=len(ready), findings=len(findings))))
    return int(bool(findings))


if __name__ == "__main__":
    raise SystemExit(main())
