#!/usr/bin/env python3
"""Check the two Goal started adapter calls that require a stored value."""

import argparse
from pathlib import Path

import pm_goal_dg5_methodb_stage7 as pilot
from pm_goal_dg5_methodb_stage7_dependencies import source
from pm_goal_dg5_methodb_stage7_started_adapters import A, ADAPTERS, FAMILY, start_world
import pm_goal_dg5_sweep as dg5
import pm_goal_guard_sweep as sweep
import pm_goal_guard_tables as tables


def missing_original(directory, negative):
    world = start_world(directory)
    owner = world.owners["native"]
    value = {"fixture": "issued value"}
    original = "TEST_ONLY:present-original"
    owner.issue(None, value, ref=original)
    reference = "TEST_ONLY:unissued-original" if negative else original
    return world, owner.authenticate, (reference, value), {}


def missing_subject(directory, negative):
    world = start_world(directory)
    owner = A.ActivationOwner(A.OwnerRegistry(), owner_id="TEST_ONLY:stage8-activation")
    owner.birth("present", "ready")
    subject = "unborn" if negative else "present"
    return world, owner.transition, (subject, "ready", 0, "active"), {"cause_ref": "TEST_ONLY:cause"}


CASES = {
    "missing-original": (499, 503, "original/unissued", missing_original),
    "missing-subject": (569, 574, "activation/unborn_subject", missing_subject),
}


def run(name, output, leave_enabled):
    output.mkdir(parents=True)
    line, read, expected, fixture = CASES[name]
    row = pilot.bridge.site_name(ADAPTERS, line)
    dg5.install(prove=False)
    tables.DISCOVERY = True
    collector = sweep.Collector(judge=not leave_enabled)
    label = FAMILY + "/stage8/" + name
    before = pilot.call(fixture(output / "valid", False), label + "/valid", collector,
                        valid=True, family=FAMILY)
    invalid = fixture(output / "invalid", True)
    negative = pilot.call(invalid, label + "/invalid", collector, valid=False, target=row, family=FAMILY)
    restored = pilot.call(invalid, label + "/invalid", sweep.Collector(judge=False), family=FAMILY)
    replay = collector.ledger[-1]
    site = (ADAPTERS, line)
    pilot.require(not before["errors"] and collector.rows[row]["controls"] and
                  collector.rows[row]["sites"] == {site}, "the valid complete call did not reach the current location")
    pilot.require(negative["input_sha256"] == restored["input_sha256"] and
                  negative["errors"] == restored["errors"] == [row] and
                  negative["code"] == restored["code"] == expected, "the original refusal did not restore")
    pilot.require(negative["store_snapshot_sha256"] == negative["store_after_sha256"],
                  "the original refusal wrote to its store")
    exception = replay.get("cut_exception_site") or {}
    detail = exception.get("detail", "")
    pilot.require(replay.get("kill") == "CUT_EXCEPTION" and
                  replay.get("restoration_errors") == [row] and exception.get("exception") == "RuntimeError" and
                  detail.startswith(f"TypeError @ pm_goal_test_owner_adapters.py:{read}(") and
                  detail.endswith("'NoneType' object is not subscriptable"),
                  "the one-check test did not observe the required later read")
    ident = sweep.table_id([row])
    table_path = pilot.ROOT / "scripts" / (pilot.PHASE + ident + ".py")
    table = output / "proof" / "tables"
    table.mkdir(parents=True)
    report = sweep.prove_table(collector, ident, [row], sweep.table_records(collector),
                               table, module_name=table_path.stem)
    pilot.require(report["status"] == "PASS" and report["proved"] == [row], report)
    pilot.save_proof(output, collector, row, site, report, table_path, FAMILY)
    pilot.write(output / "calls.json", dict(row=row, control=before, negative=negative,
                single_check_disabled=exception, restored=restored, source=source(ADAPTERS, line - 1, line, read)))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("case", choices=CASES)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--leave-enabled", action="store_true")
    args = parser.parse_args()
    run(args.case, args.out, args.leave_enabled)


if __name__ == "__main__":
    main()
