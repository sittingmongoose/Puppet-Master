#!/usr/bin/env python3
"""QA2 presentation/owner conformance; no native, browser or durability claim."""
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import runpy
import subprocess
import sys

import jsonschema

ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"


def read(name):
    return json.loads((PLANS / name).read_text())


def restore_stage(value):
    """Presentation oracle over owner-proven booleans, never a recovery engine."""
    if not value["pointed"]:
        return "source"
    if not value["reached"]:
        return "reach"
    unlocked = value["binding_matches"] and (value["accepted_kit"] or value["owner_unlocked"])
    return "unlock" if value["locked"] and not unlocked else "pick"


def check():
    failures = []
    fixtures = read("pm7_qa2_alignment.fixtures.json")
    build = read("pm7_build_contracts.fixtures.json")
    schema = read("pm7_build_contracts.schema.json")
    policy = build["qa2_presentation_policy"]

    def require(ok, message):
        if not ok:
            failures.append(message)

    jsonschema.Draft202012Validator.check_schema(schema)
    descriptor = {"$schema": schema["$schema"], "$defs": schema["$defs"],
                  "$ref": "#/$defs/QA2PresentationPolicy"}
    require(jsonschema.Draft202012Validator(descriptor).is_valid(policy), "QA2 descriptor differs")
    require(not any(row.get("$ref", "").endswith("QA2PresentationPolicy") for row in schema["oneOf"]),
            "Static QA2 descriptor was admitted as a native request")
    for case in fixtures["restore_cases"]:
        require(restore_stage(case["value"]) == case["expected"], "restore progression " + case["name"])
    bindings = read("pm7_control_bindings.json")["bindings"]
    require(len(bindings) == build["counts"]["pm7_bindings"], "Product control census differs")
    require(sum(bool(row.get("concept_sources")) for row in bindings) == 61,
            "QA2 family-source anchors differ")
    require(len(read("settings_inventory.json")["settings"]) == 1010, "QA2 invented a setting")
    require(len(read("glyph_catalog.json")["status_marks"]) == 22, "QA2 invented a status key")
    require(len(read("Wiring_Matrix.production.json")["entries"]) == 1269, "QA2 invented a production row")
    actor = read("glyph_catalog.json")["qa2_actor_presentation"]
    require(actor["you"]["silhouette"] == "person_alone" and not actor["you"]["marionette_cross"]
            and not actor["you"]["puppet_strings"] and actor["wand"]["glyph_id"] == "wand",
            "You/wand catalog drifted")

    command = ["node", str(ROOT / "scripts/pm7-qa2-source-probe.cjs")]
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, timeout=30)
    try:
        source = json.loads(result.stdout)
    except json.JSONDecodeError:
        source = {"status": "fail", "counts": {}, "failures": [result.stderr.strip() or result.stdout.strip()]}
    failures.extend("source helper: " + item for item in source["failures"])
    require(result.returncode == 0, "Isolated source probe exited " + str(result.returncode))
    return {"check": "pm7-qa2-alignment", "status": "fail" if failures else "pass",
            "claim_boundary": "static_contracts_and_isolated_source_helpers_only_no_native_or_rendering_proof",
            "counts": {"restore_cases": len(fixtures["restore_cases"]),
                       "source": source["counts"]},
            "source_probe_sha256": hashlib.sha256((ROOT / "scripts/pm7-qa2-source-probe.cjs").read_bytes()).hexdigest(),
            "failures": failures}


if __name__ == "__main__":
    report = check()
    print(json.dumps(report, indent=2))
    sys.exit(bool(report["failures"]))
