#!/usr/bin/env python3
"""Check current Goal Cancelled refusal examples through their original callers."""

import argparse
import hashlib
import json
from pathlib import Path
from time import monotonic

import pm_goal_dg_ca_oracles as cancelled
import pm_goal_dg5_methodb_stage7 as pilot

FAMILY = "goal.cancelled"
C1 = "scripts/pm_goal_dg_ca_c1.py"


def terminal_no_effect(directory, negative):
    world, route = cancelled.c1_until(cancelled.Suite(directory), "latch_and_reserve")
    world.root = world.storage.root
    if not negative:
        world.permissions.revoke(route.cancel_decision)
    return world, route.terminal, ("no_effect",), {}


CASES = {
    "terminal-no-effect": (C1, 722, "C1/terminal/no_effect_unpermitted", terminal_no_effect),
}


def main(cases=CASES, row=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("case", choices=cases)
    parser.add_argument("--worklist", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--leave-enabled", action="store_true")
    args = parser.parse_args()
    path, line, _, _ = cases[args.case]
    row = row or pilot.bridge.site_name(path, line)
    worklist = json.loads(args.worklist.read_bytes())
    current, = (item for item in worklist["rows"] if item["row"] == row)
    source = (pilot.ROOT / path).read_bytes()
    pilot.require(current["path"] == path and current["line"] == line and
                  hashlib.sha256(source).hexdigest() == current["source_sha256"] and
                  source.decode().splitlines()[line - 1].strip() == current["source"],
                  "current caller source differs from the worklist")
    start = monotonic()
    result = pilot.run(args.case, args.out, leave_enabled=args.leave_enabled, cases=cases, family=FAMILY, row=row)
    original = result["negative"]
    pilot.require(original["store_snapshot_sha256"] == original["store_after_sha256"],
                  "the refused complete call wrote to its store")
    pilot.write(args.out / "measurement.json", {"row": row, "kind": current["kind"],
                                                "prior_reason": current["current_reason"],
                                                "replay_seconds": round(monotonic() - start, 3)})


if __name__ == "__main__":
    main()
