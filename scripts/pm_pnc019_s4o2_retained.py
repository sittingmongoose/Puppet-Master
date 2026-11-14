#!/usr/bin/env python3
"""Panel retained-read oracles: exact refusals, sealed receipts, store snapshots.

The complete historical_panel_page consumer runs for both assigned families.
The unchanged gated engine separately proves its actual five custody rows.
No receipt is issued by a read, and no crash counts as an expected refusal.
"""
from __future__ import annotations

import argparse
import copy
import dataclasses
import hashlib
import importlib.util
import json
import sys
from pathlib import Path

import pm_dg6a_custody as custody
import pm_dg6a_table_history_custody as table
import pm_guard_isolation as g
from pm_pnc019_s4o2_oracles import ROOT, mutation_credit


def load(path):
    return json.loads((ROOT / path).read_text())


def data(value):
    if dataclasses.is_dataclass(value):
        return [type(value).__name__, data(dataclasses.asdict(value))]
    if type(value) is dict:
        return ["dict", [[key, data(child)] for key, child in sorted(value.items())]]
    if type(value) in (list, tuple):
        return [type(value).__name__, [data(child) for child in value]]
    if value is None or type(value) in (str, bool, int, float):
        return [type(value).__name__, value]
    raise TypeError("unsupported store-snapshot value: " + type(value).__name__)


def snapshot(value):
    return json.dumps(data(value), ensure_ascii=True, separators=(",", ":")).encode()


def sha(value):
    return hashlib.sha256(value).hexdigest()


def checker():
    spec = importlib.util.spec_from_file_location("pnc019_s4o2_panel_checker", ROOT / "scripts/pm-panel-event-contracts-check.py")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


CASES = (
    ("sealed_control", None, None),
    ("missing_receipt", "HC01_original_located", "original_unavailable"),
    ("ambiguous_receipts", "HC02_original_authentic", "original_authority"),
    ("receipt_for_another_original", "HC03_binding_exact", "original_binding"),
    ("uninstalled_recipe", "HC04_recipe_installed", "recipe_unsupported"),
    ("other_family_recipe", "HC05_original_verified", "original_verification"),
)


def run(out):
    out.mkdir(parents=True, exist_ok=True)
    model = checker()
    results, controls, negatives = [], [], []
    # The first read in a newly composed process must also respect an empty
    # independent receipt store. This caught the old lazy-install false pass.
    startup = load("Plans/panel_event_contracts/panel_redocked.fixtures.json")["history"]["expected"]["event"]
    custody.SEALED.clear()
    before = snapshot(custody.SEALED)
    facts, resolved = custody.resolve(startup)
    after = snapshot(custody.SEALED)
    results.append(dict(id="panel.redocked/first_read_empty_store", family="panel.redocked",
                        expected_refusal=["original_unavailable"], actual_refusal=[] if resolved is not None else ["original_unavailable"],
                        passed=resolved is None and before == after, facts=facts,
                        store_before_sha256=sha(before), store_after_sha256=sha(after), store_unchanged=before == after,
                        boundary="first custody read, empty independent store"))
    negatives.append(g.Negative("panel.redocked/first_read_empty_store", facts, "HC01_original_located",
                                "original_unavailable", "panel.redocked/sealed_control",
                                "Empty independently held receipt store before the process's first retained read"))
    # Explicit writer-side fixture composition. Never performed by the reader.
    custody.SEALED.clear()
    for original in custody.committed_originals():
        custody._seal(custody.SEALED, original)
    issued = copy.deepcopy(custody.SEALED)
    (out / "sealed-store.json").write_bytes(snapshot(issued) + b"\n")
    for family in load("Plans/panel_event_contracts/manifest.json")["families"]:
        name, slug = family["event_type"], family["slug"]
        fixture = load("Plans/panel_event_contracts/" + slug + ".fixtures.json")
        payload = load(family["payload_schema"])
        historical = load("Plans/event_payloads/" + slug + ".schema.json")
        checkpoint = load("Plans/panel_event_contracts/" + family["checkpoint"] + ".schema.json")
        expected = copy.deepcopy(fixture["history"]["expected"])
        request = model.shared.history_request(fixture, expected["checkpoint"])
        if "case_checkpoint_ref" in fixture["history"]:
            for publication in (request["checkpoint"], expected["checkpoint"]):
                publication["index_read_token"]["checkpoint_ref"] = fixture["history"]["case_checkpoint_ref"]
        original = expected["event"]
        ref = original["event_ref"]
        raw = custody.record_bytes(original)
        fingerprint = sha(raw)
        control_id = name + "/sealed_control"
        for kind, row, code in CASES:
            custody.SEALED.clear()
            custody.SEALED.update(copy.deepcopy(issued))
            receipt = custody.SEALED[ref][fingerprint]
            if kind == "missing_receipt":
                # Deliberately remove every receipt. A read must not repopulate
                # this independently held store, including on its first call.
                custody.SEALED.clear()
            elif kind == "ambiguous_receipts":
                other = (receipt[0], custody.replaced_resource_recipe(original))
                custody.SEALED[ref][fingerprint] = [receipt, other]
            elif kind == "receipt_for_another_original":
                custody.SEALED[ref][fingerprint] = (
                    dataclasses.replace(receipt[0], owner_operation_id="foreign-owner-operation"), receipt[1])
            elif kind == "uninstalled_recipe":
                custody.SEALED[ref][fingerprint] = (receipt[0], custody.replaced_resource_recipe(original))
            elif kind == "other_family_recipe":
                custody.SEALED[ref][fingerprint] = (receipt[0], custody.foreign_recipe(name))
            before = snapshot(custody.SEALED)
            facts, resolved = custody.resolve(original)
            actual = []
            error = None
            try:
                model.historical_panel_page(copy.deepcopy(request), copy.deepcopy(expected), family,
                                            payload, historical, checkpoint)
            except model.shared.HistoryUnavailable as refusal:
                actual = refusal.guards
            except Exception as exc:
                error = type(exc).__name__ + ": " + str(exc)
            after = snapshot(custody.SEALED)
            unchanged = before == after and custody.record_bytes(original) == raw
            wanted = [] if row is None else [code]
            passed = error is None and actual == wanted and unchanged and ((resolved is not None) == (row is None))
            case_id = name + "/" + kind
            result = dict(id=case_id, family=name, expected_refusal=wanted, actual_refusal=actual,
                          expected_row=row, facts=facts, error=error, passed=passed,
                          store_before_sha256=sha(before), store_after_sha256=sha(after),
                          original_bytes_sha256=fingerprint, store_unchanged=unchanged,
                          boundary="complete historical_panel_page consumer")
            results.append(result)
            if row is None:
                controls.append(g.Control(control_id, facts, "retained_history"))
            else:
                negatives.append(g.Negative(case_id, facts, row, code, control_id,
                                             "One independently sealed receipt defect: " + kind))
    custody.SEALED.clear()
    custody.SEALED.update(issued)
    path = "scripts/pm_dg6a_table_history_custody.py"
    suite = g.Suite("PNC019 S4o2 Panel custody", table.case, controls, negatives, (path,), ROOT,
                    non_guards=[g.NonGuard(path, "case", "return", "return g.Case(table, check, context)",
                                          "Return the fresh execution object; no acceptance or refusal decision.")])
    proof = g.run(suite, memory=g.MemoryGate(max_rss=2048, pause_when_low=12, resume_at=13, poll=15))
    (out / "guard-proof.json").write_text(json.dumps(proof, indent=2) + "\n")
    credited = []
    for negative in proof["negatives"]:
        if mutation_credit(proof, negative):
            credited.append(negative["id"])
    sources = ["scripts/pm_dg6a_custody.py", "scripts/pm-panel-event-contracts-check.py",
               "scripts/pm-alert-event-contracts-check.py", path, "scripts/pm_guard_isolation.py",
               "scripts/pm_pnc019_s4o2_retained.py", "scripts/pm_pnc019_s4o2_oracles.py",
               "scripts/pm_dg6a_tables.py", "scripts/pm-dg6a-domain.py",
               "scripts/pm_event_numbers.py", "scripts/pm_event_datetime.py",
               "scripts/pm-implementation-readiness.py"]
    for family in load("Plans/panel_event_contracts/manifest.json")["families"]:
        sources.extend([family["payload_schema"], "Plans/event_payloads/" + family["slug"] + ".schema.json",
                        "Plans/panel_event_contracts/" + family["slug"] + ".fixtures.json",
                        "Plans/panel_event_contracts/" + family["checkpoint"] + ".schema.json"])
    report = dict(status="PASS" if all(r["passed"] for r in results) and proof["status"] == "PASS"
                  and len(credited) == len(negatives) else "FAIL",
                  cases=results, guard_status=proof["status"], credited_mutations=credited,
                  guard_rows=len(proof["inventory"]), native_execution="NOT_RUN",
                  source_sha256={p: sha((Path(custody.__file__) if p == "scripts/pm_dg6a_custody.py" else ROOT / p).read_bytes())
                                 for p in sources},
                  custody_origin=str(Path(custody.__file__).resolve()),
                  sealed_store_sha256=sha((out / "sealed-store.json").read_bytes()),
                  boundary="Complete read controls/refusals and store snapshots; Method B mutation credit covers the five actual custody rows.")
    (out / "receipt.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({k: v for k, v in report.items() if k not in ("cases", "source_sha256")}, indent=2))
    return int(report["status"] != "PASS")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()
    return run(args.out)


if __name__ == "__main__":
    raise SystemExit(main())
