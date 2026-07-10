#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path


AUDIT = "Plans/.audits/audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
ROLE_CARD = f"{AUDIT}/runners/runner-12/validation/adversarial_role_card_v2.json"
SCHEMA = f"{AUDIT}/runners/runner-12/validation/reviewer_output_schema.json"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--assignment-id", required=True)
    args = parser.parse_args()
    capsule_ref = f"{AUDIT}/capsules/metadata/{args.assignment_id}.json"
    capsule = json.loads(Path(capsule_ref).read_text(encoding="utf-8"))
    ranges = [capsule["core_range"], *capsule.get("context_ranges", [])]
    ranges.sort(key=lambda item: item[0])
    range_text = ", ".join(f"{start}-{end}" for start, end in ranges)
    print(
        f"""You are the fresh read-only reviewer for exactly one audit-004 assignment. Do not spawn subagents, do not edit files, do not use web/network, and do not inspect prior audits, other capsules, other windows, other results, or canonical text outside the assigned ranges. Read and obey only these fixed inputs:
1. {ROLE_CARD}
2. {SCHEMA}
3. {capsule_ref}
4. {capsule['source_excerpt_ref']}
5. Canonical {capsule['document_path']} only at lines {range_text}.
Mechanically verify the capsule and excerpt hashes/bytes from the metadata and the canonical source hash without reading canonical prose outside the permitted ranges. Review only assignment {args.assignment_id} using the {capsule['role']} role and universal lens. For every evidence reference, derive 1-based line numbers from the canonical document, never from capsule/excerpt headers; re-read the exact canonical lines and ensure the quote occurs within them after whitespace normalization. Return one JSON object only matching the schema and role card. This agent is terminal immediately after its single result."""
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
