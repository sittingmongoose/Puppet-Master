#!/usr/bin/env python3
"""DC criterion-12 closure checks (PNC-019 C12-DC1; DC2 runs the same entry point with --lane dc2).

Subcommands, each writing <out>/<name>.json(.gz) and printing a one-line summary:

  clauses   schema clause ledger per family boundary: inventory, single-defect witnesses through the complete checker,
            clause cut and restoration, covering proofs (scripts/pm_dc_c12_clauses.py)
  joins     distinct-copy witnesses for every equality join row (scripts/pm_dc_c12_joins.py), from the gated-tool
            collection (--collection) plus a leaf-mutation search over each family's own valid probes
  retained  sealed-store snapshots around every historical/checkpoint read and the missing/ambiguous/other-original
            receipt negatives (scripts/pm_dc_c12_retained.py)
  datetime  the shared timestamp battery at every family timestamp field through the complete checker
            (scripts/pm_dc_c12_datetime.py)

Exit 0 when the subcommand's own acceptance holds (stated in each summary), 1 otherwise. Run heavy subcommands under
systemd-run --user --scope -p MemoryMax=2G -p MemorySwapMax=0 with at least 12 GB available.
"""
import argparse
import gzip
import hashlib
import json
import pickle
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import pm_collaboration_events as dc  # noqa: E402
import pm_dc_c12_clauses as clauses  # noqa: E402

SOURCES = ("scripts/pm_collaboration_events.py", "scripts/pm_dc_c12_clauses.py", "scripts/pm_dc_c12_joins.py", "scripts/pm_dc_c12_retained.py",
           "scripts/pm_dc_c12_datetime.py", "scripts/pm-dc-c12-check.py", "scripts/pm_guard_isolation.py", "scripts/pm_event_numbers.py",
           "scripts/pm_event_datetime.py", "scripts/pm_event_datetime_timestamp_battery.json", "Plans/collaboration_event_payloads.schema.json",
           "Plans/collaboration_prepared_sources.schema.json", "Plans/collaborative_workflows_contracts.schema.json",
           "Plans/collaboration_projection_contracts.schema.json", "Plans/event_record.schema.json",
           "Plans/application_workflow_contracts.schema.json", "Plans/shared_integration_runtime.schema.json",
           "Plans/collaboration_event_contract_fixtures.json")


def pins():
    return {p: hashlib.sha256((ROOT / p).read_bytes()).hexdigest() for p in SOURCES}


def families(lane):
    return clauses.DC1_FAMILIES if lane == "dc1" else clauses.DC2_FAMILIES


def write(out, name, data):
    out.mkdir(parents=True, exist_ok=True)
    path = out / (name + ".json.gz")
    with gzip.open(path, "wt", encoding="utf-8") as h:
        json.dump(data, h, indent=1, sort_keys=True, default=str)
    return hashlib.sha256(path.read_bytes()).hexdigest()


def cmd_clauses(a):
    fams = a.family or families(a.lane)
    allslots = clauses.controls(families(a.lane))
    pool = clauses.donor_pool(allslots)
    summary = []
    for (fam, boundary), slot in sorted(allslots.items()):
        if fam not in fams and not (fam == "shared" and a.include_shared):
            continue
        if a.boundary and boundary not in a.boundary:
            continue
        t = time.monotonic()
        r = clauses.run_slot(fam, boundary, slot, pool=pool)
        r["seconds"] = round(time.monotonic() - t, 1)
        s = clauses.summarize(r)
        s["sha256"] = write(a.out / "clauses", fam + "--" + boundary.replace(":", "_"), r)
        summary.append(s)
        print(json.dumps({k: s[k] for k in ("family", "boundary", "clauses", "killed", "joint_kill", "control_detected", "implied", "open", "invalid")}), flush=True)
    data = dict(pins=pins(), slots=summary)
    write(a.out, "clauses-summary" + ("-" + "_".join(a.family) if a.family else ""), data)
    bad = [s for s in summary if s["baseline_failures"] or s["restoration_failures"] or s["control_route_failures"]]
    return 0 if not bad else 1


def cmd_joins(a):
    import pm_dc_c12_joins as joins
    fams = set(a.family or families(a.lane))
    rows_by_phase = {}
    for p in sorted(x.stem[len("pm_collab_table_"):] for x in (ROOT / "scripts").glob("pm_collab_table_*.py")):
        for name, pred, _ in dc.table_rows(p):
            pairs = joins.equality_pairs(pred)
            if pairs:
                rows_by_phase.setdefault(p, {})[name] = pairs
    existing = joins.analyse(a.collection, fams)
    found, tried = joins.search(fams, rows_by_phase)
    sides = []
    for row in existing["rows"]:
        if not row["equality_pairs"]:
            continue
        for fam in sorted(row["families"]):
            if fam not in fams:
                continue
            have = set(row["families"][fam]["single_copy_fields"])
            for x, y in row["equality_pairs"]:
                for side in (x, y):
                    new = found.get((fam, row["phase"], row["row"], side), [])
                    sides.append(dict(family=fam, phase=row["phase"], row=row["row"], pair=[x, y], side=side, collection=side in have,
                                      search=[dict(probe=w["probe"], leaf=w["leaf"], variant=w["variant"], code=w["code"]) for w in new]))
    open_sides = [s for s in sides if not s["collection"] and not s["search"]]
    data = dict(pins=pins(), collection_inputs=existing["collection_inputs"], mutations_tried=tried, sides=sides, open=open_sides)
    sha = write(a.out, "joins" + ("-" + "_".join(sorted(fams)) if a.family else ""), data)
    with open(a.out / ("join-witnesses" + ("-" + "_".join(sorted(fams)) if a.family else "") + ".pkl"), "wb") as h:
        pickle.dump(found, h, protocol=5)
    print(json.dumps(dict(sides=len(sides), by_collection=sum(s["collection"] for s in sides),
                          by_search_only=sum(1 for s in sides if not s["collection"] and s["search"]), open=len(open_sides), sha256=sha)))
    return 0


def cmd_retained(a):
    import pm_dc_c12_retained as retained
    r = retained.run(set(a.family or families(a.lane)))
    sha = write(a.out, "retained", dict(pins=pins(), **r))
    print(json.dumps(dict(status=r["status"], reads=len(r["reads"]), receipt_negatives=len(r["receipt_negatives"]),
                          store_changed=sum(1 for x in r["reads"] + r["receipt_negatives"] if not x["store_unchanged"]),
                          seals=sum(x["seals"] for x in r["reads"] + r["receipt_negatives"]),
                          mismatches=sum(1 for x in r["reads"] + r["receipt_negatives"] if not x["matches"]), sha256=sha)))
    return 0 if r["status"] == "pass" else 1


def cmd_datetime(a):
    import pm_dc_c12_datetime as dtc
    r = dtc.run(a.family or families(a.lane))
    sha = write(a.out, "datetime", dict(pins=pins(), **r))
    print(json.dumps(dict(status=r["status"], runs=r["runs"], failures=r["failure_count"], by_expectation=r["by_expectation"], sha256=sha)))
    return 0 if r["status"] == "pass" else 1


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("command", choices=("clauses", "joins", "retained", "datetime"))
    ap.add_argument("--lane", choices=("dc1", "dc2"), default="dc1")
    ap.add_argument("--family", action="append")
    ap.add_argument("--boundary", action="append")
    ap.add_argument("--include-shared", action="store_true", help="clauses: also run the shared checkpoint boundary")
    ap.add_argument("--collection", type=Path, help="joins: the pickle written by pm-collab-guard-tables.py --save-collection")
    ap.add_argument("--out", type=Path, required=True)
    a = ap.parse_args(argv)
    return {"clauses": cmd_clauses, "joins": cmd_joins, "retained": cmd_retained, "datetime": cmd_datetime}[a.command](a)


if __name__ == "__main__":
    sys.exit(main())
