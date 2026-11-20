"""Exercise resume/conflict through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main

from types import SimpleNamespace

from pm_goal_test_storage import TestOwnerStorage


def fixture(directory, negative):
    storage = TestOwnerStorage.create(directory / "storage")
    operation = "TEST_ONLY:stage9-reservation"
    request = {"label": "original request"}
    storage.reserve(operation, request)
    offered = {"label": "different request"} if negative else request
    world = SimpleNamespace(root=storage.root, storage=storage)
    return world, storage.resume, (operation, offered), {}


if __name__ == "__main__":
    main({'storage-resume': ('scripts/pm_goal_test_storage.py', 1286, 'resume/conflict', fixture)})
