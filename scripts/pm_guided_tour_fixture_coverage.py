"""Controlled fixture-only owner-coverage double; never native issuer proof."""
from __future__ import annotations

import copy
from typing import Any


def tour_fixture_coverage_resolver(fixtures: dict[str, Any], case: dict[str, Any]):
    """Select an independent affected set by case metadata, not exchange contents."""
    registry = fixtures.get("owner_coverage_test_double")
    if not isinstance(registry, dict):
        return None
    cases = registry.get("cases", {})
    if not isinstance(cases, dict):
        return None
    selected = cases.get(case.get("name"), cases.get(case.get("base_valid"), registry.get("default")))
    if not isinstance(selected, dict):
        return None

    def resolve(project_id: str, tour_session_id: str, layout_set_ref: str) -> dict[str, Any] | None:
        if (project_id, tour_session_id, layout_set_ref) != (
            selected.get("project_id"), selected.get("tour_session_id"), selected.get("layout_set_ref")
        ):
            return None
        return copy.deepcopy(selected)

    return resolve
