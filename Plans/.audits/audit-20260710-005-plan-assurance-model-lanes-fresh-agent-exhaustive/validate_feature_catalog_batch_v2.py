#!/usr/bin/env python3
"""Frozen-contract-aligned v2 validator layered over the hash-bound v1 validator.

V1 deliberately added three semantic restrictions that were stronger than the
published schema/prompt.  V2 preserves every other v1 check while accepting:
1. an atomless, explicitly unknown feature needed to preserve an otherwise
   unmapped raw family key;
2. same source/target/type relationship rows when their evidence or rationale
   differs; and
3. cross-cutting relationship evidence drawn from any atom in the assigned
   packet, rather than only atoms primarily cataloged under the two endpoints.
"""

from __future__ import annotations

import json
import re

import validate_feature_catalog_batch as v1


V1_RESULT_ERRORS = v1.result_errors


def result_errors_v2(result, assignment, packet, receipt, atom_by_id):
    errors = V1_RESULT_ERRORS(result, assignment, packet, receipt, atom_by_id)
    if not isinstance(result, dict):
        return errors
    features = result.get("features") if isinstance(result.get("features"), list) else []
    family_rows = result.get("family_key_assignments") if isinstance(result.get("family_key_assignments"), list) else []
    relationships = result.get("relationships") if isinstance(result.get("relationships"), list) else []
    assigned_atoms = set(assignment.get("atom_ids", []))
    mapped_feature_ids = {
        feature_id
        for row in family_rows if isinstance(row, dict)
        for feature_id in (row.get("feature_ids") if isinstance(row.get("feature_ids"), list) else [])
        if isinstance(feature_id, str)
    }
    relationship_rows_are_distinct = len({
        json.dumps(row, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
        for row in relationships if isinstance(row, dict)
    }) == len(relationships)
    retained: list[str] = []
    for error in errors:
        feature_match = re.fullmatch(r"feature:([0-9]+):(atom_ids|source_documents|source_unit_refs)", error)
        if feature_match:
            index = int(feature_match.group(1))
            if index < len(features):
                feature = features[index]
                atom_ids = feature.get("atom_ids") if isinstance(feature, dict) else None
                feature_id = feature.get("feature_id") if isinstance(feature, dict) else None
                if (
                    atom_ids == []
                    and feature_id in mapped_feature_ids
                    and feature.get("spec_state") == "unknown"
                    and isinstance(feature.get("research_questions"), list)
                    and len(feature["research_questions"]) > 0
                    and isinstance(feature.get("scenario_requirements"), list)
                    and len(feature["scenario_requirements"]) > 0
                ):
                    continue
        if error == "relationships:duplicates" and relationship_rows_are_distinct:
            continue
        relationship_match = re.fullmatch(r"relationship:([0-9]+):evidence_binding", error)
        if relationship_match:
            index = int(relationship_match.group(1))
            if index < len(relationships):
                evidence = relationships[index].get("evidence_atom_ids")
                if isinstance(evidence, list) and evidence and set(evidence) <= assigned_atoms:
                    continue
        retained.append(error)
    return sorted(set(retained))


def main() -> None:
    v1.result_errors = result_errors_v2
    v1.main()


if __name__ == "__main__":
    main()
