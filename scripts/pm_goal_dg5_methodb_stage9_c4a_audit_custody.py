"""Exercise C4A/append_reserved/audit_custody through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main

import pm_goal_dg_ca_c4_cases as assignment
from pm_goal_dg_ca_oracles import Suite


def fixture(directory, negative):
    world, route = assignment.until(Suite(directory), "append_original")
    world.root = world.storage.root
    if negative:
        original = route.assignment_audit["complete_original_input_commitment"]
        changed = ("1" if original[0] == "0" else "0") + original[1:]
        # The expected cached copy differs. The originally issued audit is intact.
        route.assignment_audit = dict(route.assignment_audit, complete_original_input_commitment=changed)
    return world, route.append_original, (), {"lose_ack": True}


if __name__ == "__main__":
    main({'c4a-audit-custody': ('scripts/pm_goal_dg_ca_assignment.py', 701, 'C4A/append_reserved/audit_custody', fixture)})
