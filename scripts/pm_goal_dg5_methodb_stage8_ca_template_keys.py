#!/usr/bin/env python3
"""Check both Goal Cancelled template comparisons on one original append."""

import argparse
import inspect
from pathlib import Path

import pm_goal_dg_ca_c4_cases as cases
import pm_goal_dg_ca_oracles as original
import pm_goal_test_owner_adapters as adapters
import pm_goal_dg5_methodb_stage7 as pilot
from pm_goal_dg5_methodb_stage7_dependencies import source, verdict
import pm_goal_guard_sweep as sweep
import pm_goal_guard_tables as tables

FAMILY = "goal.cancelled"
ASSIGNMENT = "scripts/pm_goal_dg_ca_assignment.py"
KEYS = pilot.bridge.site_name(ASSIGNMENT, 715)
VALUE = pilot.bridge.site_name(ASSIGNMENT, 716)
KEYS_MESSAGE = "C4A/append_reserved/template_keyset"
VALUE_MESSAGE = "C4A/append_reserved/template_producer"


def fixture(directory, negative):
    suite = original.Suite(directory)
    if negative:
        world, route = cases.until(suite, "admit_codec_domain")

        def add_template_member(audit):
            template = audit["exact_event_encoding_template"]
            pilot.require(template["term"] == "map", "the original event template is not a map")
            template["members"].append({"key": "test_extra", "value": {"term": "null"}})

        cases.substitute_audit(world, route, add_template_member)
        for step in cases.STEPS[cases.STEPS.index("admit_codec_domain"):cases.STEPS.index("append_original")]:
            getattr(route, step)()
    else:
        world, route = cases.until(suite, "append_original")
    world.root = world.storage.root
    return world, route.append_original, (), {"lose_ack": True}


def checked_sources():
    keys = source(ASSIGNMENT, 714, 715, 716)
    lines = keys["lines"]
    pilot.require(lines[715] == "require('C4A/append_reserved/template_keyset', set(expected_template) == set(producer))" and
                  lines[716] == "require('C4A/append_reserved/template_producer', same(expected_template, producer))" and
                  cases.AS.same is adapters.same and
                  "return a.keys() == b.keys() and all(same(a[k], b[k]) for k in a)" in inspect.getsource(adapters.same),
                  "the later check no longer implies the same keys for those two values")
    same_line = inspect.getsourcelines(adapters.same)[1]
    return [keys, source(pilot.ADAPTERS, same_line, same_line + 4, same_line + 5)]


PROOFS = {
    KEYS: dict(
        kind="template_value_requires_same_keys", families=[FAMILY], depends_on=[VALUE],
        sites=[(ASSIGNMENT, 714), (ASSIGNMENT, 715), (ASSIGNMENT, 716), (pilot.ADAPTERS, 83), (pilot.ADAPTERS, 88)],
        argument=("The two adjacent checks use the same two dictionaries. The later equality check requires identical "
                  "keys before comparing values. The original extra-template-member example refuses at the key check. "
                  "Disabling just that check exposes the later value check. Disabling just the value check preserves the "
                  "key refusal, disabling both allows the original append to complete, and restoring both repeats the original refusal."),
    ),
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--leave-enabled", action="store_true")
    args = parser.parse_args()
    args.out.mkdir(parents=True)
    bindings = checked_sources()
    tables.DISCOVERY = True
    collector = sweep.Collector()
    label = "goal.cancelled/stage8/template-keys"
    control = pilot.call(fixture(args.out / "valid", False), label + "/valid", collector, valid=True, family=FAMILY)
    verdict(control)
    site = (ASSIGNMENT, 715)
    invalid = fixture(args.out / "invalid", True)
    before = pilot.call(invalid, label, collector, valid=False, target=KEYS, family=FAMILY)
    trials = {
        name: pilot.call(invalid, label, sweep.Collector(judge=False), cut=cut, family=FAMILY)
        for name, cut in (
            ("keys_disabled", () if args.leave_enabled else (KEYS,)),
            ("value_disabled", (VALUE,)), ("both_disabled", (KEYS, VALUE)), ("restored", ())
        )
    }
    verdict(before, KEYS, KEYS_MESSAGE)
    verdict(trials["keys_disabled"], VALUE, VALUE_MESSAGE)
    verdict(trials["value_disabled"], KEYS, KEYS_MESSAGE)
    verdict(trials["both_disabled"])
    verdict(trials["restored"], KEYS, KEYS_MESSAGE)
    pilot.require(len({r["input_sha256"] for r in (before, *trials.values())}) == 1 and
                  before["store_snapshot_sha256"] == before["store_after_sha256"] and
                  trials["restored"]["store_after_sha256"] == before["store_after_sha256"],
                  "the original refused input or its store changed")
    pilot.require(collector.rows[KEYS]["sites"] == {site} and collector.rows[KEYS]["controls"],
                  "the original calls did not share the confirmed key check")
    ident = sweep.table_id([KEYS])
    table_path = pilot.ROOT / "scripts" / (pilot.PHASE + ident + ".py")
    output = args.out / "proof" / "tables"
    output.mkdir(parents=True)
    report = sweep.prove_table(collector, ident, [KEYS], sweep.table_records(collector),
                               output, module_name=table_path.stem)
    pilot.require(report["status"] == "PASS" and report["proved"] == [KEYS], report)
    pilot.save_proof(args.out, collector, KEYS, site, report, table_path, FAMILY)
    pilot.write(args.out / "calls.json", dict(row=KEYS, control=control, original=before,
                                             trials=trials, source=bindings, declaration=PROOFS[KEYS]))


if __name__ == "__main__":
    main()
