"""Exercise C3/read_retained_success/d06_origin through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main

from copy import deepcopy

import pm_goal_dg_ca3_cases as workflow
from pm_goal_dg_ca3_route import SCOPE_PROOF
from pm_goal_dg_ca_oracles import Suite
from pm_goal_dg_ca_owners import row_sha


def fixture(directory, negative):
    world, route = workflow.until(Suite(directory), "terminal_succeeded")
    route.terminal_succeeded()
    world.root = world.storage.root
    if negative:
        proof_key = route.key(SCOPE_PROOF)
        progress_table, terminal_table = "goal_cancel_progress", "goal_cancel_terminal_audit"
        progress_key, terminal_key = route.progress_key(route.progress["progress_epoch"]), route.key(terminal_table)
        proof_cell = world.cell(SCOPE_PROOF, proof_key)
        progress_cell = world.cell(progress_table, progress_key)
        terminal_cell = world.cell(terminal_table, terminal_key)
        proof, progress, terminal = (deepcopy(cell["value"]) for cell in (proof_cell, progress_cell, terminal_cell))
        origin = proof["record"]["d06_origin"]
        original = origin["complete_value_sha256"]
        first = "1" if original[0] == "0" else "0"
        origin["complete_value_sha256"] = first + original[1:]
        progress["record"]["owner_settlement"]["original_scope_proof_sha256"] = row_sha(proof)
        terminal["record"]["terminal_progress_sha256"] = row_sha(progress)
        world.write([
            world.put(SCOPE_PROOF, proof_key, proof, expected=proof_cell["version"]),
            world.put(progress_table, progress_key, progress, expected=progress_cell["version"]),
            world.put(terminal_table, terminal_key, terminal, expected=terminal_cell["version"]),
        ])
    return world, route.read_retained_success, (), {}


if __name__ == "__main__":
    main({'c3-retained-d06-origin': ('scripts/pm_goal_dg_ca3_route.py', 1374, 'C3/read_retained_success/d06_origin', fixture)})
