#!/usr/bin/env python3
"""Test both original callers of each of three Goal Cancelled schema rows."""

import argparse
import gzip
import json
from pathlib import Path
import subprocess
import sys
import time

from pm_goal_dg5_methodb_goal_cancelled import CancelCheck, cancel_fixture, length_checks
from pm_goal_dg5_methodb_stage3 import proof_output, require, sha, test_rules, write

PREFIX = "pm_goal_dg5_methodb_stage8_phase_"
CENSUS_SHA256 = "f2be4c6344d9af1b1f377f2a2ef02c0613513cd91475dcb96d1fad9a8a9bc122"
MATRIX_REVISION = "34f212d3fb"
EXTRA_PROPERTY_ERROR = [
    [], ["additionalProperties"], "additionalProperties",
    "Additional properties are not allowed ('methodb_extra' was unexpected)", [],
]


def replay_site(args, reference, declaration, collector):
    import pm_goal_dg5_closure as closure
    from pm_goal_test_owner_adapters import RootBank

    row, root, site = (declaration[key] for key in ("row", "root", "site"))
    source_file, line = site
    source_file = args.source / source_file
    require(sha(source_file) == reference["source_sha256"] and
            source_file.read_text().splitlines()[line - 1].strip() == reference["site_source"],
            f"caller source changed at {site}")
    require(declaration["variant"] == reference["fixture"] and root == reference["root"] and
            reference["schema"] == {"$ref": declaration["reference"]},
            f"original test fixture or schema reference changed at {site}")
    rules = reference["rule_ids"]
    require(closure._clause_inventory_pin(sorted(rules)) == reference["rule_inventory"],
            f"the exact rule inventory changed at {site}")

    fixture = args.out / str(line) / "fixture"
    fixture.mkdir(parents=True)
    world, action = cancel_fixture(declaration["route"], fixture, variant=declaration["variant"])
    closure.patch_validator_classes(force=True)
    check = CancelCheck(row, site, RootBank, args.source, fixture, declaration, collector, args.leave_enabled)
    started = time.monotonic()
    plain, bank, accepted = check.prove(world, action)
    require(all((obs["root"], obs["registry_sha256"]) == (root, reference["registry_sha256"])
                for call in check.runs for obs in call["observations"]),
            f"the live caller reached a different schema at {site}")
    require(check.runs[1]["observations"][0]["errors"] == [EXTRA_PROPERTY_ERROR],
            f"the validation message changed at {site}")
    if declaration["variant"] == "publish":
        require(all(call["at_validator"] == check.runs[0]["at_validator"] for call in check.runs[:5]),
                "the original audit pack differed across calls")
    clauses, gaps = test_rules(plain, bank, accepted, root, rules, declaration["examples"],
                               args.leave_enabled, declaration.get("accepted_branches"))
    length_checks(plain, bank, root, declaration["examples"], clauses, gaps)
    require(not gaps and set(clauses) == set(rules), f"uncovered schema rules at {site}: {gaps}")
    result = dict(site=site, root=root, clauses=clauses, owner_calls=check.runs,
                  schema_resources=bank.pins, seconds=round(time.monotonic() - started, 3))
    write(fixture.parent / "result.json", result)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ("source", "matrix-source", "census", "examples", "out"):
        parser.add_argument(f"--{name}", type=Path, required=True)
    parser.add_argument("--leave-enabled", choices=("inventory", "rule", "row"))
    args = parser.parse_args()
    args.source = args.source.resolve()
    declarations = json.loads(args.examples.read_bytes())
    first, second = declarations
    require(sha(args.census) == CENSUS_SHA256, "the independent caller census changed")
    census = json.loads(gzip.decompress(args.census.read_bytes()))
    revision = subprocess.check_output(["git", "-C", args.source, "rev-parse", "HEAD"], text=True).strip()
    row, root, family = (first[key] for key in ("row", "root", "family"))
    references = census["rows"][row]
    expected_sites = sorted(tuple(entry["site"]) for entry in references)
    require(family == "goal.cancelled" and
            all(entry[key] == first[key] for entry in declarations for key in ("row", "root", "family")) and
            all(entry["source"] == revision for entry in declarations) and
            sorted((tuple(first["site"]), tuple(second["site"]))) == expected_sites and
            len(set(expected_sites)) == 2, "the two original caller locations or source changed")

    sys.path.insert(0, str(args.source / "scripts"))
    import pm_goal_guard_sweep as sweep
    import pm_goal_guard_tables as tables

    table = sweep.table_id([row])
    name = PREFIX + table + ".py"
    table_path = args.source / "scripts" / name
    expected = (Path(__file__).resolve().parent / name).read_text()
    require(expected == sweep.table_source(table, [row], {row: expected_sites}), "the checked-in row table changed")
    if table_path.exists():
        require(table_path.read_text() == expected, "the replay row table changed")
    else:
        table_path.write_text(expected)
    tables.PHASE_PREFIX = PREFIX
    tables._ROWS = {row: dict(table=table, phase=True)}
    collector = sweep.Collector()
    args.out.mkdir(parents=True)
    start = time.monotonic()
    references_by_site = {tuple(entry["site"]): entry for entry in references}
    evidence = [replay_site(args, references_by_site[tuple(declaration["site"])], declaration, collector)
                for declaration in declarations]
    sites = sorted(collector.rows[row]["sites"])
    require(sites == expected_sites, "the tests did not observe both original callers")
    for result in evidence:
        require(set(result["clauses"]) == set(evidence[0]["clauses"]), "callers tested different rule inventories")
    proof_output(args.source, args.out, first, collector, evidence[0]["clauses"], root, table_path, sites=sites)

    matrix_revision = subprocess.check_output(
        ["git", "-C", args.matrix_source, "rev-parse", "HEAD"], text=True).strip()
    require(matrix_revision.startswith(MATRIX_REVISION), "the independent coverage checker changed")
    matrix = args.out / "coverage-table.json"
    command = [sys.executable, "-B", args.matrix_source / "scripts/pm_goal_dg5_matrix.py",
               args.out / "proof", "--family", family, "--root-inventory", args.out / "inventory.json",
               "--closure", args.out / "closure.json"]
    subprocess.run([*command, "--out", matrix], check=True)
    result, = json.loads(matrix.read_bytes())["families"][family]["matrix"]
    require(result["row"] == row and result["status"] == "CLOSED" and
            result["kills"] == {"KILLED": 2} and result["control"]["family_accepted_calls"] == 4 and
            sorted((item["path"], item["line"]) for item in result["predicate"]["sites"]) == expected_sites,
            "the stock coverage checker did not accept the complete two-caller test")

    missing = args.out / "missing-rule-coverage.json"
    partial = json.loads((args.out / "closure.json").read_bytes())
    omitted = sorted(partial["roots"][root]["clauses"])[0]
    del partial["roots"][root]["clauses"][omitted]
    write(missing, partial)
    omitted_matrix = args.out / "missing-rule-table.json"
    subprocess.run([*command[:-2], "--closure", missing, "--out", omitted_matrix], check=True)
    omitted_row, = json.loads(omitted_matrix.read_bytes())["families"][family]["matrix"]
    require(omitted_row["status"] == "OPEN", "removing one rule did not reopen the row")
    write(args.out / "summary.json", dict(row=row, root=root, sites=sites, status="COVERED",
          rules=len(evidence[0]["clauses"]), seconds=round(time.monotonic() - start, 3),
          omitted_rule=omitted, matrix_source=matrix_revision, census_sha256=CENSUS_SHA256,
          examples_sha256=sha(args.examples), replay_checker_sha256=sha(Path(__file__))))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except ValueError as error:
        sys.exit(str(error))
