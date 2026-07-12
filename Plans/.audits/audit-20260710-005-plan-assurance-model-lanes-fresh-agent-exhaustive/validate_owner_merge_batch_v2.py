#!/usr/bin/env python3
"""Published-schema-aligned v2 validator for the owner-domain merge wave.

V1 treated every provisional feature's source_unit_refs list as non-empty.
The frozen JSON Schema permits an empty duplicate-free list, and the frozen
packet/prompt require the output to equal the exact union of member refs.  One
catalog feature intentionally has no atoms and therefore has an empty source
unit-ref union.  V2 removes only that extra V1 restriction when the empty list
is the exact member union; all other V1 checks remain unchanged.
"""

from __future__ import annotations

import contextlib
import io
import json
import re

import validate_owner_merge_batch as v1


V1_RESULT_ERRORS = v1.result_errors


def result_errors_v2(result, assignment, packet, receipt):
    errors = V1_RESULT_ERRORS(result, assignment, packet, receipt)
    if not isinstance(result, dict) or not isinstance(packet, dict):
        return errors
    provisional = result.get("provisional_features")
    packet_features = packet.get("features")
    if not isinstance(provisional, list) or not isinstance(packet_features, list):
        return errors
    by_ref = {
        row.get("local_feature_ref"): row
        for row in packet_features
        if isinstance(row, dict) and isinstance(row.get("local_feature_ref"), str)
    }
    retained: list[str] = []
    for error in errors:
        match = re.fullmatch(r"provisional_feature:([0-9]+):source_unit_refs", error)
        if match:
            index = int(match.group(1))
            if index < len(provisional) and isinstance(provisional[index], dict):
                feature = provisional[index]
                refs = feature.get("local_feature_refs")
                output_refs = feature.get("source_unit_refs")
                if isinstance(refs, list) and refs and output_refs == []:
                    expected = sorted({
                        source_ref
                        for local_ref in refs
                        if local_ref in by_ref
                        for source_ref in by_ref[local_ref].get("source_unit_refs", [])
                    })
                    if expected == [] and all(local_ref in by_ref for local_ref in refs):
                        continue
        retained.append(error)
    return sorted(set(retained))


def main() -> None:
    v1.result_errors = result_errors_v2
    buffer = io.StringIO()
    with contextlib.redirect_stdout(buffer):
        v1.main()
    report = json.loads(buffer.getvalue())
    report["validator"] = "owner_merge_primary_v2"
    report["v2_contract_change"] = "accept exact empty source_unit_refs union permitted by frozen schema"
    print(json.dumps(report, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
