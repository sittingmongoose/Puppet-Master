#!/usr/bin/env python3
"""Execute and account for the 93 PNC-019 S4o2 oracle cells.

This is an integration driver, not a new product validator. Every proof job
uses the existing checker and the unchanged gated Method B engine. A process
exit, an aggregate schema verdict, or another row's refusal earns no credit.
Raw outputs belong outside the repository. Nothing admits event families.
"""
from __future__ import annotations

import argparse
import collections
import gzip
import hashlib
import json
import subprocess
import sys
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = "reports/event-authority-20261114/PNC019-S4O2-cells.json"
LANES = ("DC", "DCW", "DF", "DG6A", "DG6B", "DM", "DMEM", "DO", "DR", "DS", "DS15", "DT")
GATED_GUARD_COMMIT = "004bdedd632d9463f3535190a6ed5772338cdce1"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_json(path):
    opener = gzip.open if path.suffix == ".gz" else open
    with opener(path, "rt", encoding="utf-8") as handle:
        return json.load(handle)


def manifest(root=ROOT):
    document = read_json(root / MANIFEST)
    rows = document["rows"]
    names = [r["event_type"] for r in rows]
    positions = [r["position"] for r in rows]
    if (len(rows) != 93 or names != sorted(set(names)) or positions != list(range(95, 188))
            or names[0] != "gate.failed" or names[-1] != "worktree.deleted"
            or set(r["lane"] for r in rows) != set(LANES)):
        raise ValueError("S4o2 assignment must contain exactly its 93 ordered families")
    for row in rows:
        source = root / row["baseline_grade_source"]
        if digest(source) != row["baseline_grade_sha256"]:
            raise ValueError("baseline grade changed: " + row["event_type"])
        if row["native_execution"] != "NOT_RUN":
            raise ValueError("native execution cannot be inferred from planning oracles")
    return document


def expected_refusal(outcome, target, code):
    """Exact engine outcome; crashes and another guard's refusal never match."""
    return (type(outcome) is dict and outcome.get("accepted") is False and "error" not in outcome
            and outcome.get("guard") == target and outcome.get("code") == code)


def mutation_credit(report, negative):
    """Independently check the engine's baseline/cut/restore evidence.

    Trust neither `proved` alone nor a nonzero process exit. The original and
    restored input must refuse at the declared row with its declared code; the
    cut input must accept, with the engine's causal trace check intact.
    """
    target, nid, code = negative["target"], negative["id"], negative["code"]
    originals = [x for x in report.get("negatives", []) if x.get("id") == nid]
    cuts = [x for x in report.get("rows", []) if x.get("id") == target]
    if (report.get("status") != "PASS" or len(originals) != 1 or len(cuts) != 1
            or not 1 <= len(report.get("inventory", [])) <= 8):
        return False
    row = cuts[0]
    results = [x for x in row.get("results", []) if x.get("case") == nid]
    restored = [x for x in row.get("restoration", []) if x.get("case") == nid]
    traces = [x for x in row.get("trace_checks", []) if x.get("case") == nid]
    return (row.get("proved") is True and row.get("complete") is True
            and expected_refusal(originals[0].get("outcome"), target, code)
            and len(results) == len(restored) == 1
            and results[0].get("outcome") == {"accepted": True}
            and expected_refusal(restored[0].get("outcome"), target, code)
            and len(traces) == 1 and traces[0].get("own") is True and not traces[0].get("reasons")
            and nid in row.get("own", []) and nid in row.get("flips", [])
            and not row.get("masked") and not row.get("unrelated_changes")
            and not report.get("failures"))


def available_gib():
    for line in Path("/proc/meminfo").read_text().splitlines():
        if line.startswith("MemAvailable:"):
            return int(line.split()[1]) / 1048576
    raise RuntimeError("cannot determine available memory")


def memory_floor():
    while available_gib() < 12:
        print("PAUSE: waiting for 12 GiB available", file=sys.stderr, flush=True)
        time.sleep(15)


def proof_jobs(lane, families, out):
    """Existing complete-checker adapters, including retained read witnesses."""
    flags = [x for name in families for x in ("--family", name)]
    resource = ["--max-rss", "2048", "--pause-when-low", "12", "--resume-at", "13"]
    tools = {
        "DT": "pm-dt-guard-tables.py", "DMEM": "pm-memory-guard-tables.py",
        "DR": "pm-runtime-artifact-guard-tables.py", "DF": "pm-filesafe-guard-tables.py",
    }
    if lane in tools:
        yield lane, ["scripts/" + tools[lane], *flags, "--out", str(out / lane), *resource]
    elif lane == "DG6B":
        for name in families:
            yield name, ["scripts/pm-dg6b-guard-tables.py", "--family", name,
                         "--out", str(out / lane / name), *resource]
    elif lane == "DC":
        yield lane, ["scripts/pm-collab-guard-tables.py", "--out", str(out / lane), *resource]
    elif lane == "DS15":
        yield lane, ["scripts/pm-ds15-guard-tables.py", "--out", str(out / lane), "--flips", *resource]
    elif lane == "DS":
        # The coherent home-layout negatives also live in shared DS cohorts.
        # A prefix-filtered run drops them and cannot prove the whole tables.
        yield lane, ["scripts/pm-ds-guard-tables.py", "--out", str(out / lane), *resource]
    elif lane == "DG6A":
        yield lane, ["scripts/pm-dg6a-guard-tables.py", "--out", str(out / lane), "--max-rss", "2048"]
    elif lane == "DO":
        yield lane, ["scripts/pm-orchestrator-guard-proof.py", "run", "--out", str(out / lane)]
    elif lane == "DCW":
        directory = out / lane
        yield "DCW-collect", ["scripts/pm-dcw-guard-tables.py", "--collect", "--out", str(directory),
                              "--pause-when-low", "12", "--resume-at", "13"]
        yield lane, ["scripts/pm-dcw-guard-tables.py", "--from-collection", str(directory / "collection.pkl"),
                     "--out", str(directory), "--start", "0", "--count", "1000",
                     "--pause-when-low", "12", "--resume-at", "13"]
    elif lane == "DM":
        # The exact legacy Settings names have no current writer. The existing
        # complete checker exercises their retirement and successor boundary.
        yield lane, ["scripts/pm-small-owner-events.py"]
    else:
        raise ValueError("unknown lane: " + lane)


def source_snapshot(root):
    """Bind every checker/table and every input, including untracked lane files."""
    paths = [p for p in (root / "scripts").rglob("*.py")
             if p.name != "pm_pnc019_s4o2_schema_cells.py"]
    # The separately run schema-consumer experiment does not participate in
    # any legacy checker or Method B job; its own report pins its sources.
    paths += [p for p in (root / "Plans").rglob("*")
              if p.is_file() and not any(part.startswith(".") or part == "_shards"
                                        for part in p.relative_to(root / "Plans").parts)]
    paths += [root / MANIFEST]
    paths += [root / row["baseline_grade_source"] for row in manifest(root)["rows"]]
    return {str(p.relative_to(root)): digest(p) for p in sorted(paths)}


def run_jobs(lanes, out, root=ROOT):
    document = manifest(root)
    out = out.resolve()
    if out == root or root in out.parents:
        raise ValueError("raw oracle output must be outside the repository")
    out.mkdir(parents=True, exist_ok=True)
    sources = source_snapshot(root)
    (out / "sources.json").write_text(json.dumps(sources, indent=1, sort_keys=True) + "\n")
    records = []
    for lane in lanes:
        names = [r["event_type"] for r in document["rows"] if r["lane"] == lane]
        for label, arguments in proof_jobs(lane, names, out):
            memory_floor()
            command = [sys.executable, *arguments]
            print("START " + label, flush=True)
            started = time.monotonic()
            with (out / (label + ".stdout")).open("wb") as stdout, (out / (label + ".stderr")).open("wb") as stderr:
                result = subprocess.run(command, cwd=root, stdout=stdout, stderr=stderr)
            record = dict(label=label, lane=lane, command=command, exit_code=result.returncode,
                          seconds=round(time.monotonic() - started, 3))
            records.append(record)
            # Exit 1 may mean explicitly unproved rows. It is recorded, never
            # promoted to a pass. Other lanes still supply useful evidence.
            (out / "jobs.json").write_text(json.dumps(records, indent=2) + "\n")
            print("END " + json.dumps(record), flush=True)
            if result.returncode < 0 or result.returncode > 1:
                print("INFRASTRUCTURE/CLI FAILURE: " + label, file=sys.stderr, flush=True)
                if lane == "DCW" and label == "DCW-collect":
                    break
    if source_snapshot(root) != sources:
        raise ValueError("sources changed during the campaign; no current-head credit")
    return records


def summarize_proof(path):
    """Keep the tool's verdict, exact codes, complete cuts, and refusals apart."""
    report = read_json(path)
    if (type(report) is not dict or "negatives" not in report or "rows" not in report
            or "status" not in report or "inventory" not in report):
        return None
    rows = report["rows"]
    inventory = report["inventory"]
    if type(inventory) is dict:
        inventory = inventory.get("guards", [])
    return dict(path=str(path), sha256=digest(path), status=report["status"],
                inventory=inventory, rows=rows, baseline=report["negatives"],
                credited_mutations=[n["id"] for n in report["negatives"] if mutation_credit(report, n)],
                failures=report.get("failures", []),
                mutation_boundary="The phase named by this report; full-checker flips remain separate evidence.")


def summarize(out):
    proofs = []
    for path in sorted([*out.rglob("*.json"), *out.rglob("*.json.gz")]):
        if path.name in ("summary.json", "sources.json", "jobs.json", "oracle-summary.json"):
            continue
        proof = summarize_proof(path)
        if proof is not None:
            proofs.append(proof)
    summary = dict(proof_reports=len(proofs), proof_verdicts=dict(collections.Counter(p["status"] for p in proofs)),
                   rows=sum(len(p["rows"]) for p in proofs),
                   proved=sum(r.get("proved") is True for p in proofs for r in p["rows"]),
                   credited_mutations=sum(len(p["credited_mutations"]) for p in proofs),
                   own_flips=sum(len(r.get("flips", [])) for p in proofs for r in p["rows"]),
                   masked=sum(len(r.get("masked", [])) for p in proofs for r in p["rows"]),
                   unrelated_changes=sum(len(r.get("unrelated_changes", [])) for p in proofs for r in p["rows"]),
                   proof_files=[dict(path=p["path"], sha256=p["sha256"], status=p["status"], rows=len(p["rows"])) for p in proofs],
                   schema_keyword_credit="NONE from aggregate schema-status rows",
                   native_execution="NOT_RUN")
    (out / "oracle-summary.json").write_text(json.dumps(summary, indent=2) + "\n")
    return summary


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("check", "plan", "run", "summarize"))
    parser.add_argument("--lane", choices=LANES, action="append")
    parser.add_argument("--out", type=Path)
    args = parser.parse_args(argv)
    if args.action == "check":
        document = manifest()
        print(json.dumps(dict(status="pass", families=len(document["rows"]),
                              lanes=dict(collections.Counter(r["lane"] for r in document["rows"])),
                              native_execution="NOT_RUN"), indent=2))
        return 0
    if args.out is None:
        parser.error("--out is required for plan/run/summarize")
    if args.action == "summarize":
        print(json.dumps(summarize(args.out), indent=2))
        return 0
    lanes = args.lane or list(LANES)
    if len(set(lanes)) != len(lanes):
        parser.error("duplicate --lane")
    if args.action == "plan":
        document = manifest()
        for lane in lanes:
            names = [r["event_type"] for r in document["rows"] if r["lane"] == lane]
            for label, command in proof_jobs(lane, names, args.out.resolve()):
                print(json.dumps(dict(label=label, command=[sys.executable, *command])))
        return 0
    records = run_jobs(lanes, args.out)
    summarize(args.out)
    return int(any(r["exit_code"] != 0 for r in records))


if __name__ == "__main__":
    raise SystemExit(main())
