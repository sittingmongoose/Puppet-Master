"""Exercise M/read_result/manifest_ordinal through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main
from pm_goal_dg5_methodb_stage9_cb_manifest_identity import change_first_part


def fixture(directory, negative):
    return change_first_part(directory, negative, lambda part: dict(part, part_count=part["part_count"] + 1))


if __name__ == "__main__":
    main({'cb-manifest-ordinal': ('scripts/pm_goal_dg_cb_migration.py', 841, 'M/read_result/manifest_ordinal', fixture)})
