#!/usr/bin/env python3
"""Create small source-derived context capsules for validated windows."""

import json
from collections import defaultdict
from pathlib import Path


SCRIPT = Path(__file__).resolve()
AUDIT = SCRIPT.parent
REPO = SCRIPT.parents[3]
AUDIT_ID = "audit-20260709-002-plan-assurance-windowed-blind-exhaustive"


def load(path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def main():
    scope = {row["path"]: row for row in load(AUDIT / "doc_scope_manifest.jsonl") if row.get("record_type") == "document_scope"}
    windows = [row for row in load(AUDIT / "doc_window_manifest.jsonl") if row.get("record_type") == "document_window"]
    by_doc = defaultdict(list)
    for row in windows:
        by_doc[row["document_path"]].append(row)
    rows = [{"record_type":"audit_header","audit_id":AUDIT_ID,"status":"generated","capsule_count":len(windows)},
            {"record_type":"schema","row_type":"window_context_capsule","required_fields":["capsule_id","document_path","window_id","document_title","authority_role","core_range","context_ranges","heading_anchor_path","previous_window_id","next_window_id","source_hash","window_source_hash","required_roles","specialist_roles_recommended","review_protocol_ref","blindness_constraints"]}]
    for path_rel in sorted(by_doc):
        ordered = sorted(by_doc[path_rel], key=lambda row: row["core_line_start"])
        text = (REPO / path_rel).read_text(encoding="utf-8")
        title = next((line.strip() for line in text.splitlines() if line.strip()), path_rel)
        for index, window in enumerate(ordered):
            rows.append({
                "record_type":"window_context_capsule",
                "capsule_id":"CAP-" + window["window_id"],
                "document_path":path_rel,
                "window_id":window["window_id"],
                "document_title":title[:300],
                "scope_class":scope[path_rel]["scope_class"],
                "authority_role":scope[path_rel]["authority_role"],
                "core_range":[window["core_line_start"],window["core_line_end"]],
                "context_ranges":window["context_ranges"],
                "heading_anchor_path":window["heading_anchor_path"],
                "previous_window_id":ordered[index-1]["window_id"] if index else None,
                "next_window_id":ordered[index+1]["window_id"] if index+1 < len(ordered) else None,
                "source_hash":window["source_hash"],
                "window_source_hash":window["window_source_hash"],
                "token_estimate":window["token_estimate"],
                "required_roles":window["required_roles"],
                "specialist_roles_recommended":window["specialist_roles_recommended"],
                "semantic_block_ids":window["semantic_block_ids"],
                "plan_unit_ids":window["plan_unit_ids"],
                "contract_ids":window["contract_ids"],
                "review_protocol_ref":"Plans/.audits/audit-20260709-002-plan-assurance-windowed-blind-exhaustive/WINDOW_REVIEW_PROTOCOL.md",
                "blindness_constraints":["no_prior_audits","no_closure_registry","no_superseded_candidates","no_quarantined_reports","no_whole_document_read"],
                "capability_context":"derive_from_assigned_window_only",
            })
    output = "\n".join(json.dumps(row, sort_keys=True, separators=(",", ":")) for row in rows) + "\n"
    (AUDIT / "window_context_capsules.jsonl").write_text(output, encoding="utf-8")
    assert sum(1 for row in rows if row.get("record_type") == "window_context_capsule") == len(windows)
    print(json.dumps({"capsules":len(windows),"status":"generated"}))


if __name__ == "__main__":
    main()
