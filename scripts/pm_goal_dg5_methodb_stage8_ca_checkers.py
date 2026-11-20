#!/usr/bin/env python3
"""Exercise selected original Goal Cancelled checker rows from the current caller list."""

import argparse
import hashlib
import json
from pathlib import Path

import pm_goal_dg_ca_oracles as cancelled
import pm_goal_dg5_methodb_stage7 as pilot

FAMILY = "goal.cancelled"
C1 = "scripts/pm_goal_dg_ca_c1.py"


def audit_permission(directory, negative):
    world, route = cancelled.c1_route(cancelled.Suite(directory))
    route.run()
    world.root = world.storage.root
    return world, route.audit_read, ("terminal",), {"audit_permission": not negative}


def occurrence(directory, negative):
    world, route = cancelled.c1_until(cancelled.Suite(directory), "freeze_event")
    if negative:
        receipt = dict(route.progress["cancellation_receipt"], accepted_at="2000-01-01T00:00:00.000Z")
        route.progress = dict(route.progress, cancellation_receipt=receipt)
        head_key = route.key("goal_cancel_progress") + ":head"
        epoch = route.progress["progress_epoch"]
        progress = route.wrap("StorageProgress", route.progress)
        head = route.wrap("StorageProgress", route._head(epoch, route.progress))
        world.storage.cells["goal_cancel_progress"][route.progress_key(epoch)]["value"] = progress
        world.storage.cells["goal_cancel_progress"][head_key]["value"] = head
        stored = route.wrap("StorageCancellationReceipt", receipt)
        world.storage.cells["goal_cancel_receipt"][route.key("goal_cancel_receipt")]["value"] = stored
    world.root = world.storage.root
    return world, route.freeze_event, (), {}


CASES = {
    "audit-permission": (C1, 833, "C1/audit_read/audit_permission", audit_permission),
    "occurrence": (C1, 562, "C1/freeze_event/accepted_occurrence", occurrence),
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("case", choices=CASES)
    parser.add_argument("--source-list", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--leave-enabled", action="store_true")
    args = parser.parse_args()
    path, line, _, _ = CASES[args.case]
    row = pilot.bridge.site_name(path, line)
    ref = json.loads(args.source_list.read_bytes())["rows"]
    current = ref[row]
    actual_hash = hashlib.sha256((pilot.ROOT / path).read_bytes()).hexdigest()
    pilot.require(current["site"] == [path, line] and
                  actual_hash == current["current_sha256"], "the confirmed current original source changed")
    result = pilot.run(args.case, args.out, leave_enabled=args.leave_enabled, cases=CASES, family=FAMILY)
    original = result["negative"]
    pilot.require(original["store_snapshot_sha256"] == original["store_after_sha256"],
                  "the refused complete call wrote to its store")


if __name__ == "__main__":
    main()
