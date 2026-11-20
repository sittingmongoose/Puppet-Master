"""Standing cases for the migration-snapshot rule in pm_event_datetime_inventory.

Each case builds a miniature tree and drives inv.scan() or inv.check_inventory()
itself. A mentioning line of a plan-migration snapshot run is adjudicated only
when Plans/.plan_migration/current_run.json names its run. It is a fresh copy
when it is a row of its run's own span_map.jsonl for an owner-document span
whose exact bytes the working-tree owner still carries and whose mentioning code
containers the scan has itself covered there. Otherwise, when only the owner's
bytes differ, it is a history copy if those bytes are the owner's bytes in the
commit that last changed the run's span_map.jsonl and that file is unchanged
since. Every other line refuses with a named code; a line that declares either
field surfaces as its own unclassified schema node; and an exclusion that cites
or pins a run path refuses before the scan even starts.

A refusal is reported as (error, fresh_check). fresh_check names the fresh
check's own refusal when the history check ran after it, as it does for the
three original refusal cases about owner bytes: their trees have no git
repository, so the history check refuses them as unverifiable.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

import pm_event_datetime_inventory as inv

RUN = "pds-990101-selftest-snapshot"
PRED = "pds-990100-selftest-predecessor"
REASON = ("Existing instance, report, lineage or governance data; "
          "no schema declaration was found in this exact content.")
MARKER = "observed_at_utc is recorded by the owner"
FENCE = '{"note": "observed_at_utc is set by the producer"}'
DECLARING = '{"properties": {"observed_at_utc": {"type": "string"}}}'


def owner_doc(fence_body, heading="## Records"):
    return ("# Owner\n\n" + heading + "\n\n```json\n" + fence_body + "\n```\n").encode()


def span_row(run, doc, source_path="Plans/Owner.md", span_sha256=None, byte_end=None, marker=MARKER):
    start = doc.index(b"## Records")
    end = len(doc) if byte_end is None else byte_end
    return {"schema_id": "pm.plan_migration.span.v1", "run_id": run, "span_id": "Owner-S0002",
            "source_path": source_path, "byte_start": start, "byte_end": end,
            "sha256": span_sha256 or hashlib.sha256(doc[start:end]).hexdigest(),
            "preservation_markers": {"owner_consumer": [marker]}}


def write_run(root, run, rows):
    run_dir = root / "Plans" / ".plan_migration" / run
    run_dir.mkdir(parents=True, exist_ok=True)
    (run_dir / "span_map.jsonl").write_text("".join(json.dumps(row) + "\n" for row in rows))


def write_pointer(root, run_id, supersedes=()):
    pointer = {"schema_id": "pm.plan_migration.current_run_pointer.v1", "run_id": run_id,
               "supersedes_run_ids": list(supersedes)}
    (root / "Plans" / ".plan_migration" / "current_run.json").write_text(json.dumps(pointer, indent=2) + "\n")


def build_tree(fence_body, span_sha256=None, source_path="Plans/Owner.md", byte_end=None, listed=True):
    """One owner document with a mentioning fence, and one run with a span row."""
    root = Path(tempfile.mkdtemp(prefix="pm-dt-snapshot-selftest."))
    doc = owner_doc(fence_body)
    (root / "Plans").mkdir()
    (root / "Plans" / "Owner.md").write_bytes(doc)
    row = span_row(RUN, doc, source_path, span_sha256, byte_end)
    write_run(root, RUN, [row])
    if listed:
        write_pointer(root, RUN)
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


def git(root, *args):
    env = {k: v for k, v in os.environ.items() if not k.startswith("GIT_")}
    subprocess.run(["git", "-C", str(root), "-c", "user.name=snapshot-selftest",
                    "-c", "user.email=snapshot-selftest@example.invalid", "-c", "commit.gpgsign=false",
                    "-c", "core.hooksPath=/dev/null", "-c", "init.defaultBranch=main", *args],
                   env=env, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def commit(root, message, paths=("Plans", "scripts")):
    if not (root / ".git").exists():
        git(root, "init", "-q")
    git(root, "add", "--", *paths)
    git(root, "commit", "-q", "-m", message)


def snapshot_errors(root):
    rows, errors = inv.scan(root)
    return [e for e in errors if ".plan_migration/" in str(e.get("path", ""))], errors


def snapshot_result(root):
    """(snapshot refusals as sorted (error, fresh_check) pairs, every error, per-run counts)."""
    report = {}
    rows, errors = inv.scan(root, report)
    refusals = sorted((e.get("error"), e.get("fresh_check")) for e in errors
                      if ".plan_migration/" in str(e.get("path", "")))
    return refusals, errors, report.get("snapshot_copies", {})


def tally(fresh=0, history=0, refused=0):
    return {"fresh": fresh, "history": history, "refused": refused}


def case(name, expected, observed, ok):
    return {"case": name, "expected": expected, "observed": observed, "ok": ok}


def refusal_case(name, root, expected, counts):
    """A case expecting exactly these snapshot refusals and exactly these per-run counts."""
    refusals, _, copies = snapshot_result(root)
    expected = sorted(expected)
    observed = {"refusals": refusals, "snapshot_copies": copies}
    shutil.rmtree(root)
    return case(name, {"refusals": expected, "snapshot_copies": counts}, observed,
                refusals == expected and copies == counts)


def acceptance_case(name, root, counts):
    """A case expecting no snapshot refusal, no owner failure and exactly these per-run counts."""
    refusals, errors, copies = snapshot_result(root)
    owner = [e for e in errors if e.get("path") == "Plans/Owner.md"]
    observed = {"refusals": refusals, "owner_failures": owner, "snapshot_copies": copies}
    shutil.rmtree(root)
    return case(name, {"refusals": [], "owner_failures": [], "snapshot_copies": counts}, observed,
                not refusals and not owner and copies == counts)


def history_tree(fence_body=FENCE, extra_rows=lambda row: []):
    """A run made from the owner, committed, then the owner's span edited in a later commit.

    The heading edit keeps every line in place, so the fence's origin and pin are unchanged.
    """
    root, doc, row = build_tree(fence_body)
    write_run(root, RUN, [row, *extra_rows(row)])
    write_exclusions(root, [fence_exclusion(root, doc)])
    commit(root, "owner and its run")
    edited = owner_doc(fence_body, heading="## Records, revised")
    (root / "Plans" / "Owner.md").write_bytes(edited)
    commit(root, "edit the owner span")
    return root, doc, edited, row


def predecessor_tree(pred_row=None, edit_span_map=False):
    """A predecessor run made from owner v1, then owner v2 and a current run made from it."""
    root = Path(tempfile.mkdtemp(prefix="pm-dt-snapshot-selftest."))
    (root / "Plans").mkdir()
    (root / "scripts").mkdir()
    v1 = owner_doc(FENCE)
    (root / "Plans" / "Owner.md").write_bytes(v1)
    write_run(root, PRED, [pred_row or span_row(PRED, v1)])
    write_pointer(root, PRED)
    write_exclusions(root, [fence_exclusion(root, v1)])
    commit(root, "owner v1 and its run")
    v2 = owner_doc(FENCE, heading="## Records, revised")
    (root / "Plans" / "Owner.md").write_bytes(v2)
    write_run(root, RUN, [span_row(RUN, v2)])
    write_pointer(root, RUN, [PRED])
    commit(root, "owner v2 and the current run")
    if edit_span_map:
        # Still faithful to v1's bytes: only the edit itself can refuse it.
        write_run(root, PRED, [span_row(PRED, v1, marker=MARKER + ", edited later")])
    return root


def declaration_case():
    """A declaring line of a listed, history-faithful span map is an unclassified schema node.

    check_inventory runs over an inventory with no nodes; its schema validation is bypassed here
    because the inventory schema needs at least one reviewed node, and nothing else is changed.
    """
    root, doc, edited, row = history_tree(extra_rows=lambda row: [dict(
        row, span_id="Owner-S0003", schema={"properties": {"observed_at_utc": {"type": "string"}}})])
    (root / inv.INVENTORY).write_text(json.dumps({"nodes": []}) + "\n")
    validate = inv.validate_inventory
    inv.validate_inventory = lambda inventory, root=inv.ROOT: []
    try:
        result = inv.check_inventory(root)
    finally:
        inv.validate_inventory = validate
    span_map = inv.snapshot_span_map(RUN)
    nodes = [(f["node"]["path"], f["node"]["origin"], f["node"]["pointer"], f["node"]["fields"])
             for f in result["failures"] if f.get("error") == "unclassified_schema_node"]
    others = [f for f in result["failures"] if f.get("error") != "unclassified_schema_node"]
    expected = {"unclassified_nodes": [[span_map, "jsonl:2", "/schema", ["observed_at_utc"]]],
                "other_failures": [], "snapshot_copies": {RUN: tally(history=1)}}
    observed = {"unclassified_nodes": [list(n) for n in nodes], "other_failures": others,
                "snapshot_copies": result.get("snapshot_copies")}
    shutil.rmtree(root)
    return case("declaring_snapshot_line_is_unclassified_node", expected, observed,
                result["status"] == "fail" and observed == expected)


def run_cases():
    fence = FENCE
    declaring = DECLARING
    cases = []

    # Accepted: the owner fence's mention is excluded in the owner document.
    root, doc, _ = build_tree(fence)
    write_exclusions(root, [fence_exclusion(root, doc)])
    cases.append(acceptance_case("accept_span_over_excluded_owner_fence", root, {RUN: tally(fresh=1)}))

    # Accepted: the owner fence declares the field and is classified there.
    root, doc, _ = build_tree(declaring)
    write_exclusions(root, [])
    cases.append(acceptance_case("accept_span_over_classified_owner_fence", root, {RUN: tally(fresh=1)}))

    # Refused: the owner fence mentions the field and is covered nowhere.
    root, doc, _ = build_tree(fence)
    write_exclusions(root, [])
    cases.append(refusal_case("refuse_uncovered_owner_span", root,
                              [("snapshot_owner_span_uncovered", None)], {RUN: tally(refused=1)}))

    # Refused: a mentioning line of the run that is no span-map row.
    root, doc, _ = build_tree(fence)
    (root / "Plans" / ".plan_migration" / RUN / "batch_report.jsonl").write_text(
        '{"note": "observed_at_utc appears here too"}\n')
    write_exclusions(root, [fence_exclusion(root, doc)])
    cases.append(refusal_case("refuse_unmapped_snapshot_line", root,
                              [("snapshot_line_unmapped", None)], {RUN: tally(fresh=1, refused=1)}))

    # Refused: the owner document no longer carries the span's exact bytes (no git repository).
    root, doc, _ = build_tree(fence, span_sha256=hashlib.sha256(b"different bytes").hexdigest())
    write_exclusions(root, [fence_exclusion(root, doc)])
    cases.append(refusal_case("refuse_changed_owner_text", root,
                              [("snapshot_history_unverifiable", "snapshot_owner_text_changed")],
                              {RUN: tally(refused=1)}))

    # Refused: the span names an owner file that does not exist (no git repository).
    root, doc, _ = build_tree(fence, source_path="Plans/Absent.md")
    write_exclusions(root, [])
    cases.append(refusal_case("refuse_missing_owner_file", root,
                              [("snapshot_history_unverifiable", "snapshot_owner_range_missing")],
                              {RUN: tally(refused=1)}))

    # Refused: the span's byte range runs past the end of its owner document (no git repository).
    root, doc, _ = build_tree(fence, byte_end=10 ** 9)
    write_exclusions(root, [])
    cases.append(refusal_case("refuse_owner_range_past_eof", root,
                              [("snapshot_history_unverifiable", "snapshot_owner_range_missing")],
                              {RUN: tally(refused=1)}))

    # Refused before scanning: an exclusion may not cite a snapshot run path.
    root, doc, _ = build_tree(fence)
    write_exclusions(root, [dict(fence_exclusion(root, doc),
                                 citation=f"Plans/.plan_migration/{RUN}/span_map.jsonl#jsonl:1")])
    rows, errors = inv.scan(root)
    detail = json.dumps(errors)
    cases.append(case("refuse_ephemeral_exclusion_citation", "exclusion_purpose_citation_ephemeral",
                      errors[:1], "exclusion_purpose_citation_ephemeral" in detail))
    shutil.rmtree(root)

    # Refused: a faithful span row copied into another file of the run is no span-map row.
    root, doc, row = build_tree(fence)
    (root / "Plans" / ".plan_migration" / RUN / "coverage_map.jsonl").write_text(json.dumps(row) + "\n")
    write_exclusions(root, [fence_exclusion(root, doc)])
    snap, _ = snapshot_errors(root)
    observed = sorted({(e.get("path").rsplit("/", 1)[1], e.get("error")) for e in snap})
    cases.append(case("refuse_span_row_outside_span_map", [["coverage_map.jsonl", "snapshot_line_unmapped"]],
                      observed, observed == [("coverage_map.jsonl", "snapshot_line_unmapped")]))
    shutil.rmtree(root)

    # Refused: an owner named by a non-canonical spelling would find no coverage under that name.
    root, doc, _ = build_tree(fence, source_path="Plans/./Owner.md")
    write_exclusions(root, [])
    cases.append(refusal_case("refuse_noncanonical_owner_path", root,
                              [("snapshot_line_unmapped", None)], {RUN: tally(refused=1)}))

    # Refused: an unreadable mentioning owner container with no exclusion leaves the span uncovered.
    root, doc, _ = build_tree("observed_at_utc: set by the producer")
    write_exclusions(root, [])
    cases.append(refusal_case("refuse_unreadable_uncovered_owner_container", root,
                              [("snapshot_owner_span_uncovered", None)], {RUN: tally(refused=1)}))

    # Refused before scanning: an exclusion may not pin a line of a snapshot run.
    root, doc, _ = build_tree(fence)
    write_exclusions(root, [fence_exclusion(root, doc),
                            {"path": f"Plans/.plan_migration/{RUN}/span_map.jsonl", "origin": "jsonl:1",
                             "sha256": "0" * 64, "reason": REASON, "citation": "Plans/Owner.md"}])
    rows, errors = inv.scan(root)
    detail = json.dumps(errors)
    cases.append(case("refuse_exclusion_on_snapshot_path", "exclusion_path_ephemeral",
                      errors[:1], "exclusion_path_ephemeral" in detail))
    shutil.rmtree(root)

    # History accepted: the current run is stale against a later owner edit but faithful to its commit.
    root, _, _, _ = history_tree()
    cases.append(acceptance_case("accept_history_stale_current_run", root, {RUN: tally(history=1)}))

    # History accepted: a retained predecessor faithful to its commit, beside a fresh current run.
    cases.append(acceptance_case("accept_history_retained_predecessor", predecessor_tree(),
                                 {PRED: tally(history=1), RUN: tally(fresh=1)}))

    # Refused: a run current_run.json does not name, although it is fresh and committed.
    root, doc, _ = build_tree(fence)
    write_exclusions(root, [fence_exclusion(root, doc)])
    write_pointer(root, "pds-990101-another-run")
    commit(root, "a run outside the published lineage")
    cases.append(refusal_case("refuse_unlisted_run", root,
                              [("snapshot_run_unlisted", None)], {RUN: tally(refused=1)}))

    # Refused: a predecessor span whose bytes are not the owner's bytes in its commit.
    v1 = owner_doc(FENCE)
    bad = span_row(PRED, v1, span_sha256=hashlib.sha256(b"bytes the owner never held").hexdigest())
    cases.append(refusal_case("refuse_history_text_changed", predecessor_tree(pred_row=bad),
                              [("snapshot_history_text_changed", "snapshot_owner_text_changed")],
                              {PRED: tally(refused=1), RUN: tally(fresh=1)}))

    # Refused: a predecessor span_map.jsonl edited after its commit, though still faithful to it.
    cases.append(refusal_case("refuse_history_span_map_edited", predecessor_tree(edit_span_map=True),
                              [("snapshot_history_span_map_edited", "snapshot_owner_text_changed")],
                              {PRED: tally(refused=1), RUN: tally(fresh=1)}))

    # Refused: a stale run, faithful to the owner it was made from, with no git repository to show it.
    root, doc, _ = build_tree(fence)
    write_exclusions(root, [fence_exclusion(root, doc)])
    (root / "Plans" / "Owner.md").write_bytes(owner_doc(fence, heading="## Records, revised"))
    cases.append(refusal_case("refuse_history_no_git_repository", root,
                              [("snapshot_history_unverifiable", "snapshot_owner_text_changed")],
                              {RUN: tally(refused=1)}))

    # Refused: a stale run that no commit carries.
    root, doc, _ = build_tree(fence)
    write_exclusions(root, [fence_exclusion(root, doc)])
    commit(root, "the owner without its run", paths=("Plans/Owner.md", "scripts"))
    (root / "Plans" / "Owner.md").write_bytes(owner_doc(fence, heading="## Records, revised"))
    cases.append(refusal_case("refuse_history_uncommitted_run", root,
                              [("snapshot_history_unverifiable", "snapshot_owner_text_changed")],
                              {RUN: tally(refused=1)}))

    # Refused: the run's commit has no blob for the owner its span names.
    root, doc, _ = build_tree(fence)
    write_exclusions(root, [fence_exclusion(root, doc)])
    commit(root, "the run without its owner", paths=("Plans/.plan_migration", "scripts"))
    (root / "Plans" / "Owner.md").write_bytes(owner_doc(fence, heading="## Records, revised"))
    cases.append(refusal_case("refuse_history_owner_blob_missing", root,
                              [("snapshot_history_unverifiable", "snapshot_owner_text_changed")],
                              {RUN: tally(refused=1)}))

    # Fresh refused: current bytes over an uncovered owner span never fall back to history.
    root, doc, _ = build_tree(fence)
    write_exclusions(root, [])
    commit(root, "a committed run over an uncovered owner span")
    cases.append(refusal_case("refuse_fresh_uncovered_with_history_available", root,
                              [("snapshot_owner_span_uncovered", None)], {RUN: tally(refused=1)}))

    # Declaration: a declaring line inside a snapshot file surfaces as an unclassified node.
    cases.append(declaration_case())

    return cases


def main():
    cases = run_cases()
    print(json.dumps({"self_test": "snapshot_rule", "cases": cases,
                      "pass": all(c["ok"] for c in cases)}, indent=2))
    return int(not all(c["ok"] for c in cases))


if __name__ == "__main__":
    raise SystemExit(main())
