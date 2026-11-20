#!/usr/bin/env python3
"""Exercise selected original Goal Cancelled checker rows from the current caller list."""

import argparse
from copy import deepcopy
import hashlib
import json
from pathlib import Path

import pm_goal_dg_ca_c4_cases as assignment
import pm_goal_dg_ca_oracles as cancelled
import pm_goal_dg5_methodb_stage7 as pilot

FAMILY = "goal.cancelled"
C1 = "scripts/pm_goal_dg_ca_c1.py"
ASSIGNMENT = "scripts/pm_goal_dg_ca_assignment.py"
STORAGE = "scripts/pm_goal_test_storage.py"


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


def storage_cas(directory, negative):
    world, _ = cancelled.c1_route(cancelled.Suite(directory))
    world.root = world.storage.root
    table, key = "TEST_ONLY:stage8", "one_cell"
    world.write([world.put(table, key, {"label": "first"})])
    version = world.cell(table, key)["version"]
    write = world.put(table, key, {"label": "second"}, expected=version + int(negative))
    return world, world.storage.transact, ([write],), {}



def append_template_value(directory, negative):
    world, route = assignment.until(cancelled.Suite(directory), "append_original")
    world.root = world.storage.root
    if negative:
        producer = dict(route.progress["producer_input"], correlation_id="TEST_ONLY:other-correlation")
        route.progress = dict(route.progress, producer_input=producer)
        assignment.coherent_progress(world, route)
    return world, route.append_original, (), {"lose_ack": True}



def replay_operation(directory, negative):
    world, route = cancelled.c1_route(cancelled.Suite(directory))
    route.run()
    world.root = world.storage.root
    accept = world.sir.accept
    if negative:
        def accept_with_altered_result(request):
            handle, result = accept(request)
            altered = deepcopy(result)
            altered["identity"]["operation_id"] = "TEST_ONLY:other-operation"
            return handle, altered

        world.sir.accept = accept_with_altered_result
    return world, route.replay, (deepcopy(route.request),), {}


def capture_retry(directory, negative):
    world, route = cancelled.c1_route(cancelled.Suite(directory))
    route.capture_source()
    world.root = world.storage.root
    if negative:
        table = "goal_cancel_source_audit"
        stored = world.storage.cells[table][route.key(table)]["value"]["record"]
        stored["request"]["return_route_ref"] = "TEST_ONLY:other-return-route"
    return world, route.capture_source, (), {}


def binding_pending(directory, negative):
    world, route = cancelled.c1_route(cancelled.Suite(directory))
    world.root = world.storage.root
    if negative:
        from pm_goal_dg_ca_c1 import row_sha

        binding = world.binding
        scope = route.scope
        read = binding.read_current(scope)
        control = read["control"]
        record = control["value"]["record"]
        operation = "TEST_ONLY:pending-binding-transfer"
        candidate = dict(read["revision"]["value"]["record"],
                         binding_revision=record["binding_revision"] + 1,
                         previous_revision=record["current_revision"],
                         original_goal_birth_or_binding_operation=operation)
        pending = dict(operation_id=operation, operation="binding_owner_transfer",
                       expected_control_sha256=row_sha(control["value"]),
                       expected_goal_body_sha256=row_sha(world.goal.body_cell(scope)["value"]),
                       expected_goal_control_sha256=row_sha(world.goal.control(scope)["value"]),
                       expected_stop_control_sha256=row_sha(world.host_stop.current(scope)["value"]),
                       expected_writer_domain=record["writer_domain"], candidate=candidate,
                       original_owner_ref=binding.owner_id, original_owner_epoch=binding.owner_epoch)
        key = binding.keys(scope)["control"]
        updated = binding.wrap("StorageBindingControl", key, dict(record, pending=pending))
        world.write([world.put(binding.CONTROL, key, updated, expected=control["version"])])
    return world, route.capture_source, (), {}


def progress_phase(directory, negative):
    world, route = cancelled.c1_until(cancelled.Suite(directory), "append_original")
    ready = deepcopy(route.progress)
    route.append_original(lose_ack=True)
    world.root = world.storage.root
    if negative:
        # Keep the original stored event but present the preceding progress phase.
        table = "goal_cancel_progress"
        epoch = route.progress["progress_epoch"]
        progress = dict(ready, progress_epoch=epoch)
        key = route.progress_key(epoch)
        head_key = route.key(table) + ":head"
        head = route._head(epoch, progress)
        world.write([
            world.put(table, key, route.wrap("StorageProgress", progress),
                      expected=world.cell(table, key)["version"]),
            world.put(table, head_key, route.wrap("StorageProgress", head),
                      expected=world.cell(table, head_key)["version"]),
        ])
        route.progress = progress
    return world, route.resolve_original, (), {}


def progress_custody(directory, negative):
    world, route = cancelled.c1_until(cancelled.Suite(directory), "latch_and_reserve")
    world.root = world.storage.root
    if negative:
        table = "goal_cancel_progress"
        key = route.key(table) + ":head"
        cell = world.cell(table, key)
        head = dict(cell["value"]["record"], snapshot_sha256="0" * 64)
        value = route.wrap("StorageProgress", head)
        world.write([world.put(table, key, value, expected=cell["version"])])
    return world, route.latch_and_reserve, (), {}


def source_custody(directory, negative):
    world, route = cancelled.c1_until(cancelled.Suite(directory), "latch_and_reserve")
    world.root = world.storage.root
    if negative:
        table = "goal_cancel_source_audit"
        key = route.key(table)
        cell = world.cell(table, key)
        source = dict(cell["value"]["record"], captured_at="2000-01-01T00:00:00.000Z")
        value = route.wrap("StorageSourceAudit", source)
        world.write([world.put(table, key, value, expected=cell["version"])])
    return world, route.latch_and_reserve, (), {}


CASES = {
    "source-custody": (C1, 436, "C1/latch_and_reserve/source_custody", source_custody),
    "progress-custody": (C1, 433, "C1/latch_and_reserve/progress_custody", progress_custody),
    "progress-phase": (C1, 431, "C1/resolve_original/phase", progress_phase),
    "binding-pending": (C1, 315, "C1/capture_source/binding_pending", binding_pending),
    "capture-retry": (C1, 292, "C1/capture_source/retry_conflict", capture_retry),
    "replay-operation": (C1, 819, "C1/replay/operation", replay_operation),
    "template-value": (ASSIGNMENT, 716, "C4A/append_reserved/template_producer", append_template_value),
    "audit-permission": (C1, 833, "C1/audit_read/audit_permission", audit_permission),
    "occurrence": (C1, 562, "C1/freeze_event/accepted_occurrence", occurrence),
    "storage-cas": (STORAGE, 1657, "tx/cas_version", storage_cas),
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
