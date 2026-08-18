#!/usr/bin/env python3
"""Packet-side structural validator for the seven new Settings concepts.

Usage:
  python3 validate_seven_new_concepts.py /path/to/assigned-model-folder

This complements, not replaces, ConceptHub and browser/visual testing.
"""
from __future__ import annotations
import json
import re
import sys
from pathlib import Path

STEMS = [
    "concept-05-directory-take-1",
    "concept-06-directory-take-2",
    "concept-07-compendium-workspace",
    "concept-08-directory-take-3",
    "concept-09-tome-tabs",
    "concept-10-command-suite",
    "concept-11-tabbed-organizer",
]
EVIDENCE_FILES = [
    "impact-register.json",
    "manager-coverage.json",
    "candidate-command-delta.json",
    "candidate-wiring-delta.json",
    "candidate-dry-delta.json",
    "plan-owner-delta.md",
    "search-route-matrix.json",
    "manager-route-matrix.json",
    "test-evidence.json",
]
REPORTS = [
    "reference-review-report.json",
    "REFERENCE_REVIEW_2026-08-18.json",
    "SEVEN_NEW_CONCEPTS_TEST_REPORT.md",
    "SEVEN_NEW_CONCEPTS_FINDINGS.md",
    "SEVEN_NEW_CONCEPTS_IMPACT_REGISTER.json",
]
REQUIRED_MANAGERS = json.loads(
    (Path(__file__).resolve().parents[1] / "machine_readable" / "manager_coverage_required.json").read_text()
)["required_demonstrated"]


def fail(report: dict, kind: str, path: str, detail: str) -> None:
    report["failures"].append({"kind": kind, "path": path, "detail": detail})


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__.strip(), file=sys.stderr)
        return 2
    root = Path(sys.argv[1]).resolve()
    report = {"model_folder": str(root), "status": "pass", "failures": [], "checks": {}}
    if not root.is_dir():
        fail(report, "model_folder", str(root), "folder does not exist")
    hub_path = root / "concept-hub.json"
    hub_text = ""
    if not hub_path.exists():
        fail(report, "concept_hub", str(hub_path), "missing")
    else:
        try:
            hub = json.loads(hub_path.read_text())
            hub_text = json.dumps(hub)
        except Exception as exc:
            fail(report, "concept_hub", str(hub_path), f"invalid JSON: {exc}")

    for stem in STEMS:
        html = root / f"{stem}.html"
        evidence = root / stem
        if not html.exists():
            fail(report, "concept_page", str(html), "missing required concept page")
            continue
        text = html.read_text(errors="replace")
        if "data-concept-model" not in text:
            fail(report, "model_label", str(html), "missing data-concept-model")
        if re.search(r"<iframe\b", text, re.I):
            fail(report, "foreign_renderer", str(html), "iframe is forbidden")
        if re.search(r"(?:href|src)=[\"'][^\"']*concept-0[1-4]", text, re.I):
            fail(report, "cross_concept_route", str(html), "references a frozen concept page")
        if f"{stem}.html" not in hub_text:
            fail(report, "concept_hub", str(hub_path), f"missing entry for {stem}.html")
        if not evidence.is_dir():
            fail(report, "evidence_dir", str(evidence), "missing")
            continue
        for name in EVIDENCE_FILES:
            p = evidence / name
            if not p.exists():
                fail(report, "evidence_file", str(p), "missing")
        cov = evidence / "manager-coverage.json"
        if cov.exists():
            raw = cov.read_text(errors="replace")
            try:
                json.loads(raw)
            except Exception as exc:
                fail(report, "manager_coverage", str(cov), f"invalid JSON: {exc}")
            if "shared_grammar" in raw:
                fail(report, "manager_coverage", str(cov), "shared_grammar is forbidden")
            if re.search(r'"(?:status|classification)"\s*:\s*"missing"', raw):
                fail(report, "manager_coverage", str(cov), "contains missing coverage")
            for manager in REQUIRED_MANAGERS:
                if manager not in raw:
                    fail(report, "manager_coverage", str(cov), f"required manager not named: {manager}")

    for name in REPORTS:
        p = root / name
        if not p.exists():
            fail(report, "model_report", str(p), "missing")

    report["checks"] = {
        "new_concepts_expected": len(STEMS),
        "required_manager_names_per_concept": len(REQUIRED_MANAGERS),
        "required_evidence_files_per_concept": len(EVIDENCE_FILES),
        "model_reports_expected": len(REPORTS),
    }
    if report["failures"]:
        report["status"] = "fail"
    print(json.dumps(report, indent=2))
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
