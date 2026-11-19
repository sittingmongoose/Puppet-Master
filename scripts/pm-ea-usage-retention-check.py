#!/usr/bin/env python3
"""SP-594 registry companion regression: real rows, writer derivation and named refusals.

Read-only. This does not admit usage.event or certify the full Event Authority corpus.
"""
from __future__ import annotations

import argparse
import copy
import json
from pathlib import Path

import pm_ea_admission_rows as rows


def comparable(row: dict) -> dict:
    """The row's registry content, excluding the source list that records where it was derived."""
    return {key: value for key, value in row.items() if key != "source_refs"}


def check(registry: dict | None = None) -> dict:
    readiness = rows.load_module("usage_retention_readiness", "scripts/pm-implementation-readiness.py")
    writer = rows.load_module("usage_retention_writer", "scripts/pm-ea-admission-writer.py")
    schema = rows.load(rows.REGISTRY_SCHEMA)
    if registry is None:
        registry = rows.load("Plans/event_family_registry.json")
    checks = {}
    diagnostics = readiness.event_family_registry_data_failures(
        registry, schema, path_label="Plans/event_family_registry.json", include_residuals=False)
    checks["existing_registry_diagnostics_zero"] = diagnostics == []
    checks["every_existing_row_validates"] = all(not rows.schema_failures(row) for row in registry["families"])

    # Use the actual DT contract and grade. Normalization only selects their named fields;
    # SP-594, re-read by derive_row, supplies the event selector rather than source-row policies.
    facts_index, facts = rows.find_by_event(rows.load("Plans/dt_event_contracts.json")["families"], "usage.event")
    rows.SELF_GRADES.setdefault("DT", "reports/event-authority-20261104/DT-self-grade.json")
    grade = rows.grade_rows("DT")["usage.event"]
    contract = dict(
        owners=dict(payload=rows.unit_ref(facts["cv"]), storage=rows.unit_ref(facts["sp"])),
        retention={}, editions={"project": facts["payload_schema_ref"]}, edition_ids={},
        scope_policy=facts["scope_policy"], contract_ref=f"Plans/dt_event_contracts.json#/families/{facts_index}",
        prepared_row=None,
    )
    family = {"event_type": "usage.event", "lane": "DT"}
    row, provenance = rows.derive_row(family, grade, contract, readiness)
    checks["derived_usage_row_validates"] = not rows.schema_failures(row)
    refs = [row["retention_policy_ref"]] + [v["retention_policy_ref"] for v in row["payload_versions"]]
    checks["all_scope_refs_match_owner"] = all(
        ref == readiness.event_family_usage_retention_ref() and not readiness.event_family_setting_retention_failures(
            "usage.event", ref, path_label="usage-proof") for ref in refs)
    checks["decision_entry_retention_renders"] = "no policy ID" in writer.retention_label(refs[0])
    # Render the complete entry in memory, exercising both scope-edition labels too.
    ctx = dict(before=dict(revision=registry["registry_revision"], family_count=len(registry["families"]),
                           sha256=rows.canonical_sha256(registry)),
               after=dict(revision="2099-01-01.1", family_count=len(registry["families"]) + 1, sha256="0" * 64),
               row_sha256=rows.canonical_sha256(row), depth_path="proof/depth.json", depth_sha256="0" * 64,
               record_path="proof/admission.json")
    proof_source = dict(path=rows.SELF_GRADES["DT"], sha256=rows.sha256_file(rows.REPO / rows.SELF_GRADES["DT"]))
    entry = writer.decision_entry("DL-999999", dict(event_type="usage.event", registry_row=row, kind="cpu",
                                                  grade=proof_source, readiness=proof_source), ctx)
    checks["complete_decision_entry_renders_all_selectors"] = entry.count("no policy ID") == 3
    checks["fixed_policy_rendering_unchanged"] = writer.retention_label({
        "policy_id": "RP-RUNTIME-365D", "policy_version": "1.0.0"
    }) == "RP-RUNTIME-365D@1.0.0"

    # Two registry states are legitimate: usage.event is admitted (one registered row) or still
    # prepared (absent). The admitted row is bound and compared with the derivation; only the
    # prepared state is proved by an in-memory append, whose sole allowed diagnostic is the
    # kernel count checkpoint that admission separately approves. Never append a second family.
    registered = [f for f in registry["families"] if f["event_type"] == "usage.event"]
    checks["usage_event_registered_at_most_once"] = len(registered) <= 1
    appended_diagnostics: list[dict] = []
    if registered:
        candidate = registry
        usage_index = registry["families"].index(registered[0])
        checks["registered_usage_row_matches_derived"] = comparable(registered[0]) == comparable(row)
        checks["derived_row_registry_checks_pass"] = not rows.schema_failures(registered[0])
    else:
        candidate = copy.deepcopy(registry)
        candidate["families"].append(row)
        usage_index = len(candidate["families"]) - 1
        appended_diagnostics = readiness.event_family_registry_data_failures(
            candidate, schema, path_label="usage-proof", include_residuals=False)
        checks["derived_row_registry_checks_pass"] = all(
            f["error"] == "event_family_registry_kernel_row_count_mismatch" for f in appended_diagnostics)

    negatives = []
    good = readiness.event_family_usage_retention_ref()
    cases = {
        "wrong_setting_key": (dict(good, setting_key="ai.usage.wrong"), "setting_key_mismatch"),
        "missing_anchor": ({k: v for k, v in good.items() if k != "anchor"}, "anchor_missing"),
        "mutable_anchor": (dict(good, anchor_immutable=False), "anchor_not_immutable"),
        "new_policy_id": (dict(good, policy_id="RP-USAGE-NEW"), "policy_id_forbidden"),
    }
    for name, (ref, suffix) in cases.items():
        expected = "event_family_registry_setting_retention_" + suffix
        for location in ("top", "application", "project"):
            mutated = copy.deepcopy(candidate)
            target = mutated["families"][usage_index]
            if location == "top":
                target["retention_policy_ref"] = ref
            else:
                next(v for v in target["payload_versions"] if v["scope_kind"] == location)["retention_policy_ref"] = ref
            errors = readiness.event_family_registry_data_failures(
                mutated, schema, path_label="usage-negative", include_residuals=False)
            codes = sorted({e["error"] for e in errors})
            checks[name + "_" + location + "_refused"] = expected in codes and bool(rows.schema_failures(target))
            negatives.append(dict(case=name, location=location, expected=expected, actual=codes))
        bad_contract = copy.deepcopy(contract)
        bad_contract["retention"] = {"project": ref}
        try:
            rows.derive_row(family, grade, bad_contract, readiness)
            actual = "ACCEPTED"
        except rows.Gap as exc:
            actual = str(exc)
        checks[name + "_writer_refused"] = actual == expected
        negatives.append(dict(case=name, location="writer_derivation", expected=expected, actual=actual))

    # A fixed-policy object is valid in the unchanged union branch, but cannot replace
    # usage.event's setting. This exercises the consumer guard independently of JSON Schema.
    minted = {"registry_schema_id": "pm.storage_value_registry.v2", "policy_id": "RP-USAGE-NEW",
              "policy_version": "1.0.0"}
    codes = readiness.event_family_setting_retention_failures("usage.event", minted, path_label="fixed-substitution")
    checks["fixed_policy_substitution_refused"] = codes == [{
        "path": "fixed-substitution", "error": "event_family_registry_setting_retention_policy_id_forbidden"}]
    for field in ("history_policy_ref", "application_policy_ref"):
        bad_grade = copy.deepcopy(grade)
        bad_grade["retention_delta"] = {field: "RP-USAGE-NEW@1.0.0"}
        try:
            rows.derive_row(family, bad_grade, contract, readiness)
            actual = "ACCEPTED"
        except rows.Gap as exc:
            actual = str(exc)
        checks[field + "_refused"] = actual == "event_family_registry_setting_retention_policy_id_forbidden"

    return dict(status="pass" if all(checks.values()) else "fail", checks=checks,
                existing_registry_rows=len(registry["families"]), registered_usage_rows=len(registered),
                registry_diagnostics=diagnostics,
                appended_diagnostics=appended_diagnostics, usage_row=row, provenance=provenance,
                negatives=negatives)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    report = check()
    text = json.dumps(report, indent=2, sort_keys=True) + "\n"
    if args.output:
        args.output.write_text(text, encoding="utf-8")
    print(json.dumps({k: report[k] for k in ("status", "existing_registry_rows", "checks")}, indent=2))
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
