#!/usr/bin/env python3
"""Check the current Goal started registry and handle input types."""

import argparse
import hashlib
import json
from pathlib import Path

import pm_goal_dg5_methodb_stage7 as pilot
from pm_goal_dg5_methodb_stage7_started_adapters import ADAPTERS, FAMILY, start_world


def absent_owner(directory, negative):
    world = start_world(directory)
    owner = world.owners["native"]
    owner_id = owner.owner_id
    if negative:
        owner_id = "TEST_ONLY:missing-owner"
        # A stale role entry helps the test isolate the separate lookup of
        # the owner. The original owner registry and its owners stay live.
        world.registry._roles[owner_id] = owner.role
    return world, world.registry.owner, (owner_id, owner.role), {}


CASES = {
    "absent-owner": (ADAPTERS, 329, "registry/unregistered_owner", absent_owner),
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("case", choices=CASES)
    parser.add_argument("--site-map", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--leave-enabled", action="store_true")
    args = parser.parse_args()
    path, line, _, _ = CASES[args.case]
    row = pilot.bridge.site_name(path, line)
    original = json.loads(args.site_map.read_bytes())
    current = next(entry for entry in original["rows"].values() if entry["current_row"] == row)
    actual_hash = hashlib.sha256((pilot.ROOT / path).read_bytes()).hexdigest()
    pilot.require(current["complete_caller_sites"] == [[path, line]] and
                  actual_hash == original["current_sha256"], "the confirmed current original source changed")
    result = pilot.run(args.case, args.out, leave_enabled=args.leave_enabled, cases=CASES, family=FAMILY)
    refused = result["negative"]
    pilot.require(refused["store_snapshot_sha256"] == refused["store_after_sha256"],
                  "the refused complete call wrote to its store")


if __name__ == "__main__":
    main()
