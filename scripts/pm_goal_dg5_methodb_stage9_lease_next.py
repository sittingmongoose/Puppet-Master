"""Exercise the Assignment sequence reader and its original reservation caller."""

import argparse
from hashlib import sha256
import json
from pathlib import Path
from time import monotonic

import pm_goal_dg_ca_c4_cases as assignment
from pm_goal_dg_ca_oracles import Suite
import pm_goal_dg5_methodb_stage7 as pilot
from pm_goal_dg5_methodb_stage7_dependencies import verdict
import pm_goal_guard_sweep as sweep
import pm_goal_guard_tables as tables

FAMILY = "goal.cancelled"
ROW = "dg5/lease/next/number"
THROUGH = "dg5/lease/through/number"
SITE = ("scripts/pm_goal_dg_ca_assignment.py", 117)
EXPECTED = "lease/next/numrule/integer_range"
MAX_UINT64 = (1 << 64) - 1
LABEL = "goal.cancelled/stage9/lease-next"


def reservation_fixture(directory, previous):
    world, route = assignment.until(Suite(directory), "reserve_append_assignment")
    world.root = world.storage.root
    if previous is not None:
        world.storage.last_sequence = previous
    return world, route.reserve_append_assignment, (), {}


def run(args):
    path, line = SITE
    current, = (row for row in json.loads(args.worklist.read_bytes())["rows"] if row["row"] == ROW)
    source = (pilot.ROOT / path).read_bytes()
    pilot.require(current["path"] == path and current["line"] == line and
                  current["source_sha256"] == sha256(source).hexdigest() and
                  current["source"] == source.decode().splitlines()[line - 1].strip(),
                  "the exact Assignment sequence reader differs from the worklist")
    args.out.mkdir(parents=True)
    start = monotonic()
    tables.DISCOVERY = True
    valid, *_ = reservation_fixture(args.out / "valid-read", MAX_UINT64 - 1)
    invalid = reservation_fixture(args.out / "invalid-read", MAX_UINT64)
    world = invalid[0]
    reader = (world, world.storage.next_sequence, (), {})
    collector = sweep.Collector()
    control = pilot.call((valid, valid.storage.next_sequence, (), {}), LABEL + "/valid", collector,
                         valid=True, family=FAMILY)
    negative = pilot.call(reader, LABEL + "/invalid", collector, valid=False, target=ROW, family=FAMILY)
    disabled = pilot.call(reader, LABEL + "/invalid", sweep.Collector(judge=False),
                          cut=() if args.leave_enabled else (ROW,), family=FAMILY)
    restored = pilot.call(reader, LABEL + "/invalid", sweep.Collector(judge=False), family=FAMILY)
    verdict(control)
    verdict(negative, ROW, EXPECTED)
    verdict(restored, ROW, EXPECTED)
    pilot.require(not disabled["errors"] and disabled["code"] is None,
                  "disabling only the checker did not allow the input")
    pilot.require(len({call["input_sha256"] for call in (negative, disabled, restored)}) == 1 and
                  all(call["store_snapshot_sha256"] == call["store_after_sha256"]
                      for call in (control, negative, disabled, restored)),
                  "the input changed or the sequence reader wrote")
    pilot.require(collector.rows[ROW]["sites"] == {SITE} and collector.rows[ROW]["controls"] and
                  collector.ledger[-1]["kill"] == "KILLED", "the original sequence check did not replay")
    ident = sweep.table_id([ROW])
    table_path = pilot.ROOT / "scripts" / (pilot.PHASE + ident + ".py")
    out = args.out / "proof" / "tables"
    out.mkdir(parents=True)
    table = sweep.prove_table(collector, ident, [ROW], sweep.table_records(collector), out, module_name=table_path.stem)
    pilot.require(table["status"] == "PASS" and table["proved"] == [ROW], table)
    pilot.save_proof(args.out, collector, ROW, SITE, table, table_path, FAMILY)
    direct_seconds = monotonic() - start

    # At the same upper limit the reservation still checks the lease end.
    full_control = reservation_fixture(args.out / "valid-reserve", None)
    full = {
        "control": pilot.call(full_control, LABEL + "/reserve-valid", sweep.Collector(judge=False), family=FAMILY),
        "negative": pilot.call(invalid, LABEL + "/reserve-invalid", sweep.Collector(judge=False), family=FAMILY),
        "disabled": pilot.call(invalid, LABEL + "/reserve-invalid", sweep.Collector(judge=False), cut=(ROW,), family=FAMILY),
        "restored": pilot.call(invalid, LABEL + "/reserve-invalid", sweep.Collector(judge=False), family=FAMILY),
    }
    verdict(full["control"])
    verdict(full["negative"], ROW, EXPECTED)
    verdict(full["disabled"], THROUGH, "lease/through/numrule/integer_range")
    verdict(full["restored"], ROW, EXPECTED)
    pilot.require(len({full[k]["input_sha256"] for k in ("negative", "disabled", "restored")}) == 1,
                  "the reservation inputs changed across trials")
    pilot.write(args.out / "calls.json", dict(row=ROW, location=SITE, expected=EXPECTED, control=control, negative=negative,
                                             disabled=disabled, restored=restored, original_reservation=full))
    pilot.write(args.out / "measurement.json", dict(row=ROW, kind=current["kind"], prior_reason=current["current_reason"],
                                                   replay_seconds=round(direct_seconds, 3),
                                                   full_caller_seconds=round(monotonic() - start - direct_seconds, 3)))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("case", choices=("lease-next",))
    parser.add_argument("--worklist", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--leave-enabled", action="store_true")
    run(parser.parse_args())


if __name__ == "__main__":
    main()
