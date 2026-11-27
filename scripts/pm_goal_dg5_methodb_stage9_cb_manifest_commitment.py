"""Exercise M/read_result/manifest_commitment through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main
from pm_goal_dg5_methodb_stage9_cb_manifest_identity import change_first_part


def altered_commitment(part):
    original = part["whole_manifest_sha256"]
    first = "1" if original[0] == "0" else "0"
    return dict(part, whole_manifest_sha256=first + original[1:])


def fixture(directory, negative):
    return change_first_part(directory, negative, altered_commitment)


if __name__ == "__main__":
    main({'cb-manifest-commitment': ('scripts/pm_goal_dg_cb_migration.py', 844, 'M/read_result/manifest_commitment', fixture)})
