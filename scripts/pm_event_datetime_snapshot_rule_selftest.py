"""Standing cases for the migration-snapshot rule in pm_event_datetime_inventory.

Each case builds a miniature tree and drives inv.scan() itself. A mentioning
line of a plan-migration snapshot run is accepted only as its run's span-map
row of an owner-document span whose exact bytes the owner document still
carries and whose mentioning code containers the scan has itself covered
there; every other line refuses with a named code, and an exclusion that
cites a run path refuses as ephemeral before the scan even starts.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import shutil
import sys
import tempfile

import pm_event_datetime_inventory as inv

RUN = "pds-990101-selftest-snapshot"
REASON = ("Existing instance, report, lineage or governance data; "
          "no schema declaration was found in this exact content.")


def build_tree(fence_body, span_sha256=None, source_path="Plans/Owner.md", byte_end=None):
    """One owner document with a mentioning fence, and one run with a span row."""
    root = Path(tempfile.mkdtemp(prefix="pm-dt-snapshot-selftest."))
    doc = ("# Owner\n\n## Records\n\n```json\n" + fence_body + "\n```\n").encode()
    (root / "Plans").mkdir()
    (root / "Plans" / "Owner.md").write_bytes(doc)
    run_dir = root / "Plans" / ".plan_migration" / RUN
    run_dir.mkdir(parents=True)
    start = doc.index(b"## Records")
    end = len(doc) if byte_end is None else byte_end
    row = {"schema_id": "pm.plan_migration.span.v1", "run_id": RUN, "span_id": "Owner-S0002",
           "source_path": source_path, "byte_start": start, "byte_end": end,
           "sha256": span_sha256 or hashlib.sha256(doc[start:end]).hexdigest(),
           "preservation_markers": {"owner_consumer": ["observed_at_utc is recorded by the owner"]}}
    (run_dir / "span_map.jsonl").write_text(json.dumps(row) + "\n")
    (root / "scripts").mkdir()
    return root, doc, row


def write_exclusions(root, rows):
    (root / "scripts" / "pm_event_datetime_exclusions.json").write_text(json.dumps(rows, indent=2) + "\n")


def fence_exclusion(root, doc):
    """A committed exclusion pinning the owner fence, derived through the tool's own blocks."""
    text = inv.decode_text(doc)
    origin, body = next((o, b) for o, b in inv._markdown_blocks(text)
                        if inv.mentions_field(b))
    return {"path": "Plans/Owner.md", "origin": origin,
            "sha256": hashlib.sha256(body.encode()).hexdigest(),
            "reason": REASON, "citation": "Plans/Owner.md"}


def snapshot_errors(root):
    rows, errors = inv.scan(root)
    return [e for e in errors if ".plan_migration/" in str(e.get("path", ""))], errors


def case(name, expected, observed, ok):
    return {"case": name, "expected": expected, "observed": observed, "ok": ok}


def run_cases():
    fence = '{"note": "observed_at_utc is set by the producer"}'
    declaring = '{"properties": {"observed_at_utc": {"type": "string"}}}'
    cases = []

    # Accepted: the owner fence's mention is excluded in the owner document.
    root, doc, _ = build_tree(fence)
    write_exclusions(root, [fence_exclusion(root, doc)])
    snap, all_errors = snapshot_errors(root)
    cases.append(case("accept_span_over_excluded_owner_fence", "no snapshot refusal, no owner failure",
                      {"snapshot_failures": snap, "owner_failures":
                       [e for e in all_errors if e.get("path") == "Plans/Owner.md"]},
                      not snap and not [e for e in all_errors if e.get("path") == "Plans/Owner.md"]))
    shutil.rmtree(root)

    # Accepted: the owner fence declares the field and is classified there.
    root, doc, _ = build_tree(declaring)
    write_exclusions(root, [])
    snap, all_errors = snapshot_errors(root)
    cases.append(case("accept_span_over_classified_owner_fence", "no snapshot refusal, no owner failure",
                      {"snapshot_failures": snap, "owner_failures":
                       [e for e in all_errors if e.get("path") == "Plans/Owner.md"]},
                      not snap and not [e for e in all_errors if e.get("path") == "Plans/Owner.md"]))
    shutil.rmtree(root)

    # Refused: the owner fence mentions the field and is covered nowhere.
    root, doc, _ = build_tree(fence)
    write_exclusions(root, [])
    snap, all_errors = snapshot_errors(root)
    codes = {e.get("error") for e in snap}
    cases.append(case("refuse_uncovered_owner_span", "snapshot_owner_span_uncovered",
                      sorted(codes), "snapshot_owner_span_uncovered" in codes))
    shutil.rmtree(root)

    # Refused: a mentioning line of the run that is no span-map row.
    root, doc, _ = build_tree(fence)
    (root / "Plans" / ".plan_migration" / RUN / "batch_report.jsonl").write_text(
        '{"note": "observed_at_utc appears here too"}\n')
    write_exclusions(root, [fence_exclusion(root, doc)])
    snap, _ = snapshot_errors(root)
    codes = {e.get("error") for e in snap}
    cases.append(case("refuse_unmapped_snapshot_line", "snapshot_line_unmapped",
                      sorted(codes), "snapshot_line_unmapped" in codes))
    shutil.rmtree(root)

    # Refused: the owner document no longer carries the span's exact bytes.
    root, doc, _ = build_tree(fence, span_sha256=hashlib.sha256(b"different bytes").hexdigest())
    write_exclusions(root, [fence_exclusion(root, doc)])
    snap, _ = snapshot_errors(root)
    codes = {e.get("error") for e in snap}
    cases.append(case("refuse_changed_owner_text", "snapshot_owner_text_changed",
                      sorted(codes), "snapshot_owner_text_changed" in codes))
    shutil.rmtree(root)

    # Refused: the span names an owner file that does not exist.
    root, doc, _ = build_tree(fence, source_path="Plans/Absent.md")
    write_exclusions(root, [])
    snap, _ = snapshot_errors(root)
    codes = {e.get("error") for e in snap}
    cases.append(case("refuse_missing_owner_file", "snapshot_owner_range_missing",
                      sorted(codes), "snapshot_owner_range_missing" in codes))
    shutil.rmtree(root)

    # Refused: the span's byte range runs past the end of its owner document.
    root, doc, _ = build_tree(fence, byte_end=10 ** 9)
    write_exclusions(root, [])
    snap, _ = snapshot_errors(root)
    codes = {e.get("error") for e in snap}
    cases.append(case("refuse_owner_range_past_eof", "snapshot_owner_range_missing",
                      sorted(codes), "snapshot_owner_range_missing" in codes))
    shutil.rmtree(root)

    # Refused before scanning: an exclusion may not cite a snapshot run path.
    root, doc, _ = build_tree(fence)
    write_exclusions(root, [dict(fence_exclusion(root, doc),
                                 citation=f"Plans/.plan_migration/{RUN}/span_map.jsonl#jsonl:1")])
    rows, errors = inv.scan(root)
    detail = json.dumps(errors)
    cases.append(case("refuse_ephemeral_exclusion_citation", "exclusion_purpose_citation_ephemeral",
                      errors[:1], "exclusion_purpose_citation_ephemeral" in detail))
    shutil.rmtree(root)

    return cases


def main():
    cases = run_cases()
    print(json.dumps({"self_test": "snapshot_rule", "cases": cases,
                      "pass": all(c["ok"] for c in cases)}, indent=2))
    return int(not all(c["ok"] for c in cases))


if __name__ == "__main__":
    raise SystemExit(main())
