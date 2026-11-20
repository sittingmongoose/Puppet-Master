"""Exercise C3/settle_owner/d06_preserved through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main

from copy import deepcopy

import pm_goal_dg_ca3_cases as workflow
from pm_goal_dg_ca3_native import k_hex, record_sha
from pm_goal_dg_ca_oracles import Suite


def fixture(directory, negative):
    world, route = workflow.until(Suite(directory), "settle_owner", run_status="failed")
    world.root = world.storage.root
    if negative:
        native = world.native.run
        run_id = route.wf_run["run_scope"]["goal_run_id"]
        pointer = world.value(native.POINTER, "run:" + k_hex(run_id))
        body_key, control_key = pointer["body_key"], pointer["control_key"]
        body_cell, control_cell = world.cell(native.BODY, body_key), world.cell(native.CONTROL, control_key)
        body, control = deepcopy(body_cell["value"]), deepcopy(control_cell["value"])
        body["record"]["status"] = "running"
        control["record"]["body_record_sha256"] = record_sha(body["record"])
        world.write([
            world.put(native.BODY, body_key, body, expected=body_cell["version"]),
            world.put(native.CONTROL, control_key, control, expected=control_cell["version"]),
        ])
    return world, route.settle_owner, (), {}


if __name__ == "__main__":
    main({'c3-settle-preserved': ('scripts/pm_goal_dg_ca3_route.py', 829, 'C3/settle_owner/d06_preserved', fixture)})
