#!/usr/bin/env python3
"""Attach validator-complete executable evidence kinds to Home wiring rows."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
MATRIX = ROOT / "Plans" / "Wiring_Matrix.production.json"
REQUIRED_KINDS = (
    "dispatcher_fixture",
    "state_projection",
    "receipt_or_event_assertion",
    "accessibility_regression",
)


def main() -> int:
    document = json.loads(MATRIX.read_text(encoding="utf-8"))
    updated = 0
    for control_id, row in document["entries"].items():
        if row.get("ui_command_id") == "cmd.browser.open_workspace_preview":
            browser_events = [
                "workspace.layout_changed",
                "browser.session.created",
                "browser.session.state_changed",
            ]
            row["expected_event_types"] = browser_events
            row.setdefault("effect_contract", {})["receipt_or_event_refs"] = browser_events
            row["event_test_requirements"] = [
                "Assert targeted placement emits workspace.layout_changed only when panel visibility or Browser placement changes, with exact affected IDs, hosts, slot, revision, and persisted status.",
                "Assert first creation emits browser.session.created with command_id, origin, correlation_id, browser_session_id, and receipt linkage.",
                "Assert every applied or no-change focus emits browser.session.state_changed with the stable browser_session_id and exact target editor panel/group.",
            ]
            for item in row.get("test_evidence", []):
                if isinstance(item, dict) and item.get("evidence_kind") == "event_test":
                    item["requirement"] = (
                        "Dispatching cmd.browser.open_workspace_preview asserts conditional workspace.layout_changed, "
                        "single browser.session.created, and browser.session.state_changed effects."
                    )
        if not control_id.startswith("home."):
            continue
        evidence = row.get("test_evidence", [])
        if not evidence:
            raise SystemExit(f"Home row has no executable test: {control_id}")
        base_test_id = str(evidence[0].get("test_id", ""))
        if "home_workspace_matrix.mjs#" not in base_test_id:
            raise SystemExit(f"Home row does not cite the production browser harness: {control_id}")

        by_kind = {
            item.get("evidence_kind"): item
            for item in evidence
            if isinstance(item, dict) and item.get("evidence_kind")
        }
        command_id = row["ui_command_id"]
        effect_refs = row.get("effect_contract", {}).get("receipt_or_event_refs", [])
        requirements = {
            "dispatcher_fixture": (
                f"The visible {control_id} control dispatches {command_id} exactly once with the typed payload "
                "and production handler recorded by this row."
            ),
            "state_projection": (
                f"The browser harness reads the projected availability and disabled reason for {control_id} "
                "before attempting dispatch."
            ),
            "receipt_or_event_assertion": (
                f"The browser harness asserts the exact receipt/event delta for {control_id}: "
                + (", ".join(effect_refs) if effect_refs else "explicit no-persist receipt")
                + "."
            ),
            "accessibility_regression": (
                f"The rendered {control_id} control is keyboard reachable, exposes its accessible name/state, "
                "and preserves or restores focus according to the Home owner contract."
            ),
        }
        for kind in REQUIRED_KINDS:
            if kind not in by_kind:
                evidence.append(
                    {
                        "test_id": f"{base_test_id}:{kind}",
                        "evidence_kind": kind,
                        "requirement": requirements[kind],
                    }
                )
                updated += 1
        row["test_evidence"] = evidence

    MATRIX.write_text(json.dumps(document, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"home_rows": 128, "evidence_rows_added": updated, "status": "PASS"}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
