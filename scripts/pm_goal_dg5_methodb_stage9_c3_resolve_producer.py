"""Test the Workflow producer comparison and its preceding index publication."""

from contextlib import contextmanager
from copy import deepcopy

import pm_goal_dg5_methodb_stage7 as pilot
from pm_goal_dg5_methodb_stage9_ca_checkers import main
import pm_goal_dg_ca3_cases as workflow
from pm_goal_dg_ca3_index import CHECKPOINT, ROWS
from pm_goal_dg_ca_oracles import Suite
from pm_goal_dg_ca_owners import Refusal, uid

REFUSAL = "C3/resolve_original/stored_producer"
PROGRESS = "goal_cancel_progress"


def check_refused_changes(world, before, progress_keys):
    storage = world.storage
    after = storage._state()
    old, new = before["cells"], after["cells"]
    expected_receipts = {
        (CHECKPOINT, world.index.checkpoint_key()),
        *((ROWS, world.index.row_key(world.index.generation_id, sequence))
          for sequence, _, _ in world.index.retained()),
    }
    for key in progress_keys:
        pilot.require(old[PROGRESS][key] == new[PROGRESS][key],
                      "the refusal changed a selected progress cell")
    changed = {
        (table, key)
        for table in old.keys() | new.keys()
        for key in old.get(table, {}).keys() | new.get(table, {}).keys()
        if old.get(table, {}).get(key) != new.get(table, {}).get(key)
    }
    pilot.require(changed == expected_receipts, "the refusal changed cells outside the original index publication")
    counters = {"cell_generation", "commit_generation", "tx_counter"}
    pilot.require(all(after[key] == before[key] + 1 for key in counters),
                  "the index publication did not write exactly one transaction")
    pilot.require(all(after[key] == before[key] for key in before.keys() - counters - {"cells"}),
                  "the refusal changed non-index storage state")


def observe_refused_resolution(route, progress_keys):
    original = route.call
    world = route.world

    @contextmanager
    def observed_call(method, args=None):
        before = deepcopy(world.storage._state())
        try:
            with original(method, args) as slot:
                yield slot
        except Refusal as error:
            if str(error) == REFUSAL:
                check_refused_changes(world, before, progress_keys)
            raise

    route.call = observed_call


def fixture(directory, negative):
    world, route = workflow.until(Suite(directory), "append_original")
    route.append_original(lose_ack=True)
    world.root = world.storage.root
    if negative:
        progress = deepcopy(route.progress)
        progress["producer_input"]["correlation_id"] = uid("TEST_ONLY:stage9-correlation")
        key = route.progress_key(progress["progress_epoch"])
        head_key = route.key(PROGRESS) + ":head"
        world.write([
            world.put(PROGRESS, key, route.wrap("StorageProgress", progress), expected=world.cell(PROGRESS, key)["version"]),
            world.put(PROGRESS, head_key, route.wrap("StorageProgress", route._head(progress["progress_epoch"], progress)),
                      expected=world.cell(PROGRESS, head_key)["version"]),
        ])
        route.progress = progress
        observe_refused_resolution(route, (key, head_key))
    world.index.publish()
    return world, route.resolve_original, (), {}


def check_index_published(result):
    for mode in ("negative", "restored"):
        call = result[mode]
        pilot.require(call["store_snapshot_sha256"] != call["store_after_sha256"],
                      "the refused call did not publish the expected index update")


if __name__ == "__main__":
    main({"c3-resolve-producer": ("scripts/pm_goal_dg_ca3_route.py", 1159, REFUSAL, fixture)},
         check_refused_store=check_index_published)
