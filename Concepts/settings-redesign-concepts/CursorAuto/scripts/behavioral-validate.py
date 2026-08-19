#!/usr/bin/env python3
"""Behavioral checks for CursorAuto Settings concepts 05-11.

Static contracts plus live BinaryLocator snapshot identity. Complements
scripts/validate_seven_new_concepts.py and scripts/seven-new-concepts-qa.py.
"""
from __future__ import annotations

import argparse
import json
import re
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


def _root_from_args() -> Path:
    parser = argparse.ArgumentParser(description="Behavioral validation for CursorAuto 05-11")
    parser.add_argument("--root", default=None)
    args = parser.parse_args()
    if args.root:
        return Path(args.root).resolve()
    here = Path(__file__).resolve().parent
    sibling = here.parent
    if (sibling / "shared" / "v2" / "pmv2.js").is_file():
        return sibling
    hardcoded = Path(r"P:/Concepts/settings-redesign-concepts/CursorAuto")
    if (hardcoded / "shared" / "v2" / "pmv2.js").is_file():
        return hardcoded
    return sibling


def _check(name: str, ok: bool, detail: str, checks: list, failures: list) -> None:
    row = {"name": name, "ok": bool(ok), "detail": detail}
    checks.append(row)
    if not ok:
        failures.append(row)


def run(root: Path) -> dict:
    checks: list[dict] = []
    failures: list[dict] = []

    pmv2_path = root / "shared" / "v2" / "pmv2.js"
    pmv2 = pmv2_path.read_text(encoding="utf-8") if pmv2_path.is_file() else ""
    _check("pmv2_exists", pmv2_path.is_file() and bool(pmv2), str(pmv2_path), checks, failures)
    _check(
        "pmv2_project_store_localStorage",
        "localStorage" in pmv2 and "sessionStorage" not in pmv2,
        "localStorage project store; no sessionStorage",
        checks,
        failures,
    )
    _check(
        "pmv2_binaryLocatorClient",
        "function binaryLocatorClient" in pmv2 and "binaryLocator: true" in pmv2,
        "binaryLocatorClient + binaryLocator: true",
        checks,
        failures,
    )
    _check(
        "pmv2_runtimeResourceGovernorClient",
        "function runtimeResourceGovernorClient" in pmv2 and "new ResourceGovernor" not in pmv2,
        "RuntimeResourceGovernor client; no second ResourceGovernor",
        checks,
        failures,
    )
    _check(
        "pmv2_search_uncapped_default",
        "opts.limit) || 24" not in pmv2 and "search.lastResults = (limit && limit > 0)" in pmv2,
        "default search is uncapped; optional limit only",
        checks,
        failures,
    )
    _check(
        "pmv2_paintSearchDrop",
        "function paintSearchDrop" in pmv2,
        "virtualized search drop",
        checks,
        failures,
    )
    cli_wait = bool(
        re.search(r"function\s+confirmOfficialCli[\s\S]{0,1600}waiting_user", pmv2)
        or re.search(r"confirmOfficialCli[\s\S]{0,1600}waiting_user", pmv2)
    )
    _check("pmv2_confirmOfficialCli_waiting_user", cli_wait, "unknown owner stays waiting_user", checks, failures)

    live_path = root / "shared" / "v2" / "binary-locator-live.json"
    live = {}
    if live_path.is_file():
        live = json.loads(live_path.read_text(encoding="utf-8"))
    _check("binary_locator_live_exists", live_path.is_file(), str(live_path), checks, failures)
    _check(
        "binary_locator_owner",
        live.get("owner") == "BinaryLocator",
        str(live.get("owner")),
        checks,
        failures,
    )
    _check(
        "binary_locator_probe_order",
        live.get("probeOrder") == ["Override", "PATH", "CommonLocations", "Launchers"],
        str(live.get("probeOrder")),
        checks,
        failures,
    )

    qa_path = root / "scripts" / "seven-new-concepts-qa.py"
    qa = qa_path.read_text(encoding="utf-8") if qa_path.is_file() else ""
    _check("qa_exists", qa_path.is_file() and bool(qa), str(qa_path), checks, failures)
    _check("qa_search_uncapped", "searchUncapped" in qa or "broad > 24" in qa, "searchUncapped / broad > 24", checks, failures)
    _check("qa_localStorage", "localStorage" in qa and "sessionStorage" not in qa, "QA persists via localStorage", checks, failures)
    _check("qa_live_backend", "liveBackend" in qa, "copy liveBackend probe", checks, failures)
    _check("qa_search_route_exhaustive", "search_route_exhaustive" in qa, "search_route_exhaustive", checks, failures)
    _check("qa_nestedPopupOk", "nestedPopupOk" in qa, "nestedPopupOk", checks, failures)
    _check("qa_waiting_user", "waiting_user" in qa, "waiting_user", checks, failures)

    for stem in STEMS:
        js_path = root / stem / f"{stem}.js"
        html_path = root / f"{stem}.html"
        body = js_path.read_text(encoding="utf-8") if js_path.is_file() else ""
        html = html_path.read_text(encoding="utf-8") if html_path.is_file() else ""
        has_cli = ("confirmOfficialCli" in body) or ("confirm-official" in body)
        _check(f"{stem}_confirm_official", js_path.is_file() and has_cli, "confirm-official", checks, failures)
        _check(
            f"{stem}_search_drop",
            "data-search-drop" in body,
            "data-search-drop",
            checks,
            failures,
        )
        _check(
            f"{stem}_no_search_cap_24",
            "slice(0, 24)" not in body and "{ limit: 24 }" not in body,
            "no 24-hit search cap",
            checks,
            failures,
        )
        _check(
            f"{stem}_no_sessionStorage_copy",
            "sessionStorage" not in body and "Not live ResourceGovernor" not in body and "Not live BinaryLocator" not in body,
            "no sessionStorage leftover copy",
            checks,
            failures,
        )
        _check(
            f"{stem}_locator_script",
            "binary-locator-live.js" in html,
            "HTML loads live locator snapshot",
            checks,
            failures,
        )

    status = "pass" if not failures else "fail"
    return {"status": status, "checks": checks, "failures": failures}


def main() -> int:
    root = _root_from_args()
    report = run(root)
    print(json.dumps(report, indent=2))
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
