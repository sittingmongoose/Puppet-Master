#!/usr/bin/env python3
"""Run the three repository-wide landing checks and report only what is new or on this branch.

The three checks are `pm-plans-verify.py run-gates`, `pm-plans-verify.py audit-governance` and
`pm-plan-migration.py validate --run-dir <the current run>`. On this repository they fail on
thousands of pre-existing findings that name no file a landing branch touched: stale governance
hashes and a stale plan-migration snapshot. Reading that list at every landing costs ten minutes
and tells the lander nothing.

This script runs the same three checks, turns every failure into a stable key, and reports two
sets only:

  new        a failure whose key is not in the recorded baseline, or a check whose failure count
             rose above the baseline count
  on-branch  a failure that names a path from `git diff --name-only <base>..HEAD`, whether or not
             it is new

It also compares each check's per-subcheck failure totals against the baseline, because the checks
print only 50 (run-gates) or 100 (audit-governance) failures per subcheck: everything above that cap
is never keyed, and the on-branch match runs over the sample, not over the whole failure set. A rise
in a truncated subcheck is therefore reported and stops the landing, since what was added cannot be
matched against the branch's paths.

It exits 0 when it has nothing to report.

A key is `check | subcheck | error kind | path | fingerprint`. The fingerprint is a short digest of
the failure's remaining fields after the parts that move on their own are removed: timestamps, hash
values, the absolute path of the checkout it ran in, and the measured `actual`/`expected` values.
What is left is what makes one failure distinct from another: which span, which unit, which field.
So a stale hash for one document keeps one key however often the document changes.

Baseline home: `reports/landing-checks/baseline.json`. Not `Plans/.evidence/`, because AGENTS.md
calls that a build-governance artifact, CLAUDE.md forbids hand-editing it, and AGENTS.md reserves
writing it to the designated Plans agent; a file that is refreshed on a schedule cannot live under
that rule. `reports/**` is the documented home for compact result bundles.

Deterministic: same tree in, same bytes out. No network. Nothing read outside the repository except
the checks' own inputs.

Exit codes:
  0  nothing to report
  1  nothing it reports stops the landing: governance staleness on files the branch edited, or
     failures that are new but name none of the branch's files (push, and report them)
  2  it reports something that does stop the landing: a failure on the branch's files that is not
     staleness, a bucket that grew whose error kind is not staleness, or a rise in a subcheck whose
     failures are truncated, where the on-branch match cannot see what was added
  3  the script could not run a check or could not read the baseline or the branch paths
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BASELINE = "reports/landing-checks/baseline.json"
BASELINE_SCHEMA_ID = "pm.landing_check.baseline.v1"
CURRENT_RUN_POINTER = "Plans/.plan_migration/current_run.json"
PLAN_UNITS_INDEX = "Plans/.plan_index/plan_units.jsonl"
# Files regenerated from every owner document. A branch that edits one document rewrites all of
# them, so their paths say nothing about what the branch decided and are kept out of the match.
DERIVED_PREFIXES = ("Plans/_shards/", "Plans/.plan_index/")

# Failure fields that carry a measured value rather than an identity. Their drift is exactly what
# the baseline absorbs, so the key keeps the field name and drops the number.
VALUE_KEYS = {"actual", "expected", "actual_count", "expected_count"}
# Failure fields that move on their own between two runs of the same tree.
VOLATILE_KEYS = {"generated_at_utc", "timestamp", "elapsed_seconds", "duration_seconds"}

HASH_RE = re.compile(r"\b[0-9a-f]{32,}\b")
TIME_RE = re.compile(r"\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?")
SPAN_ID_RE_CACHE: dict[str, re.Pattern[str]] = {}

# Error kinds that a canon edit is expected to produce until the designated Plans agent reseals.
# AGENTS.md already carves these out of a landing refusal; the script only names them.
STALENESS_ERRORS = {
    "stale_hash",
    "artifact_hash_stale",
    "stale_audit_status_index",
    "stale_batch_report_sha256_after",
    "pnc019_source_hash_stale",
    "buildability_gate_report_stale_or_not_canonical",
    "complete_final_summary_live_plan_unit_count_stale",
    "doc_count_mismatch",
    "inventory_doc_set_mismatch",
    "superseded_run_final_summary_missing",
}
STALENESS_ERROR_PREFIXES = ("current_snapshot_",)
STALENESS_DETAIL_MARKER = "is stale"

CHECKS = ("run-gates", "audit-governance", "plan-migration-validate")


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def canonical(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True)


# ---------------------------------------------------------------------------- running the checks


def current_run_dir(root: Path) -> str:
    pointer = root / CURRENT_RUN_POINTER
    doc = json.loads(pointer.read_text(encoding="utf-8"))
    run_path = doc.get("run_path")
    if not isinstance(run_path, str) or not run_path:
        raise ValueError(f"{CURRENT_RUN_POINTER} has no run_path")
    return run_path


def run_check(name: str, root: Path, run_dir: str, timeout_seconds: int) -> dict[str, Any]:
    """Invoke one check and return its JSON report. Raises RuntimeError when it cannot be read.

    `pm-plan-migration.py validate` prints its whole report. `run-gates` and `audit-governance`
    print a trimmed one that drops the per-subcheck failure totals, so they are asked for the full
    report in a scratch file that is deleted again; nothing is written inside the repository.
    """
    with tempfile.TemporaryDirectory(prefix="pm-landing-check-") as scratch:
        if name == "plan-migration-validate":
            argv = [sys.executable, "scripts/pm-plan-migration.py", "validate", "--run-dir", run_dir]
            report_file = None
        else:
            report_file = Path(scratch) / f"{name}.json"
            argv = [
                sys.executable,
                "scripts/pm-plans-verify.py",
                name,
                "--quiet-progress",
                "--subcheck-timeout-seconds",
                str(timeout_seconds),
                "--report",
                str(report_file),
            ]
        proc = subprocess.run(argv, cwd=root, capture_output=True, text=True)
        payload = report_file.read_text(encoding="utf-8") if report_file and report_file.exists() else proc.stdout
        try:
            report = json.loads(payload)
        except Exception as exc:  # noqa: BLE001 - a check that cannot be parsed stops the landing.
            raise RuntimeError(
                f"{name}: could not read the check's JSON output ({exc}); "
                f"returncode={proc.returncode}; stderr tail: {(proc.stderr or '')[-400:]}"
            ) from exc
    if not isinstance(report, dict):
        raise RuntimeError(f"{name}: the check's JSON output is not an object")
    return report


# ------------------------------------------------------------------------------- normalizing keys


def strip_root(text: str, root: Path) -> str:
    """Rewrite this checkout's absolute paths to repository-relative ones.

    Failure details quote tracebacks that name the checkout they ran in, so a baseline recorded in
    one worktree would never match a run in another without this.
    """
    return text.replace(str(root) + "/", "").replace(str(root), "")


def scrub(value: Any, root: Path) -> Any:
    if isinstance(value, str):
        text = strip_root(value, root)
        text = HASH_RE.sub("<hash>", text)
        text = TIME_RE.sub("<time>", text)
        return text
    if isinstance(value, list):
        return [scrub(item, root) for item in value]
    if isinstance(value, dict):
        out: dict[str, Any] = {}
        for key in sorted(value):
            if key in VOLATILE_KEYS or key.endswith("_at_utc"):
                continue
            if key in VALUE_KEYS:
                out[key] = type_tag(value[key])
                continue
            out[key] = scrub(value[key], root)
        return out
    return value


def type_tag(value: Any) -> str:
    if value is None:
        return "<null>"
    if isinstance(value, bool):
        return "<bool>"
    if isinstance(value, (int, float)):
        return "<number>"
    if isinstance(value, str):
        return "<string>"
    if isinstance(value, list):
        return "<list>"
    if isinstance(value, dict):
        return "<object>"
    return "<value>"


def normalize(check: str, subcheck: str, failure: Any, root: Path) -> dict[str, Any]:
    """Turn one raw failure into {key, check, subcheck, error, path, fields, stale}."""
    if not isinstance(failure, dict):
        raw: dict[str, Any] = {"error": str(failure)}
    else:
        raw = failure
    scrubbed = scrub(raw, root)
    error = str(scrubbed.get("error", "")) if not isinstance(scrubbed.get("error"), (dict, list)) else "<structured>"
    path = str(scrubbed.get("path", "")) if not isinstance(scrubbed.get("path"), (dict, list)) else ""
    rest = {k: v for k, v in scrubbed.items() if k not in {"error", "path"}}
    fingerprint = hashlib.sha256(canonical(rest).encode("utf-8")).hexdigest()[:12] if rest else "-"
    return {
        "key": f"{check}|{subcheck}|{error}|{path}|{fingerprint}",
        "check": check,
        "subcheck": subcheck,
        "error": error,
        "path": path,
        "fields": rest,
        "stale": is_staleness(error, scrubbed),
        # The unscrubbed failure, for the branch-path match only. Scrubbing replaces the measured
        # `actual`/`expected` with a type tag, and some failures name a document only inside those
        # lists, so matching against the scrubbed fields would miss them. Keys starting with an
        # underscore are dropped before anything is printed.
        "_raw": raw,
    }


def is_staleness(error: str, scrubbed: dict[str, Any]) -> bool:
    if error in STALENESS_ERRORS or error.startswith(STALENESS_ERROR_PREFIXES):
        return True
    detail = scrubbed.get("detail")
    return isinstance(detail, str) and STALENESS_DETAIL_MARKER in detail


def excused_by_kind(on_branch: list[dict[str, Any]]) -> dict[str, int]:
    """How many reported items each staleness error kind excuses.

    One prefix can carry thousands of them, so a new failure kind underneath it would otherwise
    arrive as a slightly larger number in one line. Counting by kind makes it show up by name.
    """
    counts: dict[str, int] = {}
    for item in on_branch:
        if item["stale"]:
            counts[item["error"]] = counts.get(item["error"], 0) + 1
    return dict(sorted(counts.items(), key=lambda pair: (-pair[1], pair[0])))


def public(item: dict[str, Any]) -> dict[str, Any]:
    """The item without the working fields that are not meant to be printed."""
    return {key: value for key, value in item.items() if not key.startswith("_")}


def bucket_of(item: dict[str, Any]) -> str:
    return f"{item['check']}|{item['subcheck']}|{item['error']}|{item['path']}"


def grown_subchecks(
    counts: dict[str, dict[str, dict[str, int]]],
    baseline_checks: dict[str, Any],
) -> list[dict[str, Any]]:
    """Subchecks reporting more failures than the baseline recorded.

    Each check reports a true total per subcheck but prints only the first 50 or 100 of them, so
    most of a large subcheck is never keyed and never matched against the branch's paths. Comparing
    the totals is the only way a failure added above the cap announces itself. When the subcheck is
    truncated the rise stops the landing, because nothing can say whether what was added names a
    file the branch touched.
    """
    rows = []
    for check in sorted(counts):
        recorded = (baseline_checks.get(check) or {}).get("subchecks") or {}
        for subcheck in sorted(counts[check]):
            now = counts[check][subcheck]
            was = int((recorded.get(subcheck) or {}).get("reported", 0))
            if now["reported"] <= was:
                continue
            rows.append({
                "check": check,
                "subcheck": subcheck,
                "baseline_reported": was,
                "reported": now["reported"],
                "sampled": now["sampled"],
                "truncated": now["sampled"] < now["reported"],
            })
    return rows


def partial_subchecks(
    counts: dict[str, dict[str, dict[str, int]]],
    baseline_checks: dict[str, Any],
) -> set[tuple[str, str]]:
    """Subchecks whose printed failures are only a sample, in this run or when the baseline was taken.

    Which rows land inside a 50- or 100-row sample can change without a single failure being added
    or removed, so a fingerprint appearing there for the first time means nothing. For these the
    total is the only sound comparison, and it is compared. Their rows are still read, because the
    branch match does not depend on the baseline.
    """
    out: set[tuple[str, str]] = set()
    for check in counts:
        for name, counted in counts[check].items():
            if counted["sampled"] < counted["reported"]:
                out.add((check, name))
    for check, entry in (baseline_checks or {}).items():
        for name, counted in ((entry or {}).get("subchecks") or {}).items():
            if int(counted.get("sampled", 0)) < int(counted.get("reported", 0)):
                out.add((check, name))
    return out


def bucket_subcheck(name: str) -> tuple[str, str]:
    check, subcheck, _rest = name.split("|", 2)
    return check, subcheck


def blocking_items(
    on_branch: list[dict[str, Any]],
    grown: list[dict[str, Any]],
    subcheck_growth: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """What stops a landing, by the rule in AGENTS.md.

    A failure on a file the branch touched that is not governance staleness; a bucket that grew whose
    error kind is not staleness; and a rise in a truncated subcheck, whose added failures nothing can
    match against the branch's paths. A failure that is new but names none of the branch's files does
    not stop the landing: it is reported and pushed, exactly as the shard-check rule reads.
    """
    return (
        [item for item in on_branch if not item["stale"]]
        + [row for row in grown if not row["stale"]]
        + [row for row in subcheck_growth if row["truncated"]]
    )


def exit_code(reported: list[Any], grown: list[Any], subcheck_growth: list[Any], blocking: list[Any]) -> int:
    if not reported and not grown and not subcheck_growth:
        return 0
    return 2 if blocking else 1


def grown_buckets(seen: dict[str, int], baseline: dict[str, int]) -> list[dict[str, Any]]:
    """Buckets that hold more failures than the baseline recorded.

    A bucket the baseline has never seen is left out: its failures are already named one by one in
    the new set, and reporting the bucket as well would say the same thing twice. This is the only
    way growth inside a bucket the baseline matches by count alone can be seen.
    """
    rows = []
    for name in sorted(seen):
        if name not in baseline or seen[name] <= baseline[name]:
            continue
        error = name.split("|")[2]
        rows.append({
            "bucket": name,
            "baseline_count": baseline[name],
            "count": seen[name],
            "stale": error in STALENESS_ERRORS or error.startswith(STALENESS_ERROR_PREFIXES),
        })
    return rows


# ------------------------------------------------------------------------------ reading a report


def extract(check: str, report: dict[str, Any], root: Path) -> tuple[list[dict[str, Any]], dict[str, dict[str, int]]]:
    """Return (normalized failures, {subcheck: {"reported": n, "sampled": m}}).

    `reported` is the check's own count of failures for that subcheck; `sampled` is how many it
    printed. run-gates prints at most 50 per subcheck and audit-governance at most 100, so a rise in
    `reported` is the only way to see growth that the sample hides.
    """
    items: list[dict[str, Any]] = []
    counts: dict[str, dict[str, int]] = {}
    if check == "plan-migration-validate":
        failures = report.get("failures") or []
        counts[""] = {"reported": len(failures), "sampled": len(failures)}
        items.extend(normalize(check, "", failure, root) for failure in failures)
        return items, counts

    for block in report.get("failures") or []:
        if not isinstance(block, dict):
            items.append(normalize(check, "", block, root))
            continue
        subcheck = str(block.get("check", ""))
        sampled = block.get("failures") or []
        counts[subcheck] = {"reported": reported_count(report, subcheck, len(sampled)), "sampled": len(sampled)}
        items.extend(normalize(check, subcheck, failure, root) for failure in sampled)
    return items, counts


def reported_count(report: dict[str, Any], subcheck: str, fallback: int) -> int:
    """run-gates keeps per-subcheck totals under `checks`; audit-governance keeps them at top level."""
    for holder in (report.get("checks") or {}, report):
        entry = holder.get(subcheck) if isinstance(holder, dict) else None
        if isinstance(entry, dict) and isinstance(entry.get("failures"), int):
            return int(entry["failures"])
    return fallback


# ------------------------------------------------------------------------------- branch path match


def branch_paths(root: Path, base: str) -> list[str]:
    proc = subprocess.run(
        ["git", "diff", "--name-only", f"{base}..HEAD"],
        cwd=root,
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"git diff --name-only {base}..HEAD failed: {(proc.stderr or '').strip()}")
    return sorted({line.strip() for line in proc.stdout.splitlines() if line.strip()})


def split_touched(paths: list[str]) -> tuple[list[str], list[str]]:
    """Separate the paths the branch decided from the ones regeneration rewrote.

    `Plans/_shards/**` and `Plans/.plan_index/**` are regenerated whole whenever any owner document
    changes, so every branch that edits canon "touches" the index row of every unit in the
    repository. Matching on those paths made a failure about a unit the branch never opened stop its
    landing. They are matched on unit identity instead, below.
    """
    derived = [path for path in paths if path.startswith(DERIVED_PREFIXES)]
    direct = [path for path in paths if not path.startswith(DERIVED_PREFIXES)]
    return direct, derived


def units_of_touched_docs(root: Path, paths: list[str]) -> dict[str, str]:
    """{plan_unit_id: owner document} for every unit owned by a document this branch changed.

    This is what replaces the derived paths: a failure recorded against a generated index belongs to
    the branch when the unit it names is one the branch's own documents own.
    """
    owners = {path for path in paths if path.startswith("Plans/") and path.endswith(".md")}
    index = root / PLAN_UNITS_INDEX
    if not owners or not index.is_file():
        return {}
    units: dict[str, str] = {}
    with index.open("r", encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            try:
                unit = json.loads(line)
            except Exception:  # noqa: BLE001 - a malformed index row is the index's problem, not ours.
                continue
            owner = unit.get("owner_doc")
            unit_id = unit.get("plan_unit_id")
            if owner in owners and isinstance(unit_id, str) and unit_id:
                units[unit_id] = owner
    return units


def path_tokens(paths: list[str]) -> list[tuple[str, str]]:
    """(path, span-id stem) pairs. Snapshot failures name a document only through its span ids,
    for example `assistant-chat-design-S0001` for `Plans/assistant-chat-design.md`."""
    out = []
    for path in paths:
        stem = Path(path).stem if path.endswith(".md") else ""
        out.append((path, stem))
    return out


def names_branch_path(
    item: dict[str, Any],
    tokens: list[tuple[str, str]],
    root: Path,
    units: dict[str, str] | None = None,
) -> list[str]:
    """Which of the branch's paths this failure names. Wide on purpose: reporting a failure that
    only mentions a branch path is safe, missing one is not. Reads the unscrubbed failure, so a
    document named only inside a measured `actual` or `expected` list still counts.

    A failure recorded against a generated index is matched on the unit it names instead of on the
    index's own path, which every canon edit rewrites."""
    text = strip_root(canonical(item["_raw"]), root)
    hits = []
    for path, stem in tokens:
        if contains_path(text, path):
            hits.append(path)
            continue
        if stem and mentions_span_stem(text, stem):
            hits.append(path)
    if units and item["path"].startswith(DERIVED_PREFIXES):
        owner = units.get(unit_named_by(item))
        if owner and owner not in hits:
            hits.append(owner)
    return hits


def unit_named_by(item: dict[str, Any]) -> str | None:
    raw = item["_raw"]
    unit = raw.get("plan_unit_id") if isinstance(raw, dict) else None
    return unit if isinstance(unit, str) else None


def contains_path(text: str, path: str) -> bool:
    start = 0
    while True:
        index = text.find(path, start)
        if index < 0:
            return False
        after = text[index + len(path) : index + len(path) + 1]
        if after not in {"/", "-", "_"} and not after.isalnum():
            return True
        start = index + 1


def mentions_span_stem(text: str, stem: str) -> bool:
    """A snapshot failure names a document only through its span ids: `<stem>-S0001` for
    `Plans/<stem>.md`. The quotes keep the id a whole JSON value, so `assistant-chat` does not
    match `assistant-chat-design-S0001`."""
    pattern = SPAN_ID_RE_CACHE.get(stem)
    if pattern is None:
        pattern = re.compile('"' + re.escape(stem) + r'-S\d+"')
        SPAN_ID_RE_CACHE[stem] = pattern
    return pattern.search(text) is not None


# -------------------------------------------------------------------------------------- baseline


def build_baseline(
    commit: str,
    run_dir: str,
    items: list[dict[str, Any]],
    counts: dict[str, dict[str, dict[str, int]]],
    statuses: dict[str, str],
    max_fingerprints: int,
    untracked_inputs: list[str],
) -> dict[str, Any]:
    buckets: dict[str, list[str]] = {}
    for item in items:
        buckets.setdefault(bucket_of(item), []).append(item["key"].rsplit("|", 1)[1])
    rows = []
    for name in sorted(buckets):
        check, subcheck, error, path = name.split("|", 3)
        fingerprints = sorted(set(buckets[name]))
        row: dict[str, Any] = {
            "check": check,
            "subcheck": subcheck,
            "error": error,
            "path": path,
            "count": len(buckets[name]),
        }
        # Big buckets are the mass residue. Storing every fingerprint would make a file that is
        # rewritten on a schedule megabytes long, so they are matched by count instead, and the
        # baseline says which ones those are.
        row["fingerprints"] = fingerprints if len(fingerprints) <= max_fingerprints else None
        rows.append(row)
    return {
        "schema_id": BASELINE_SCHEMA_ID,
        "recorded_at_utc": utc_now(),
        "commit": commit,
        "run_dir": run_dir,
        "max_fingerprints_per_bucket": max_fingerprints,
        "untracked_inputs": sorted(untracked_inputs),
        "checks": {
            check: {
                "status": statuses.get(check, "unknown"),
                "failure_total": sum(c["reported"] for c in counts.get(check, {}).values()),
                "subchecks": {name: counts[check][name] for name in sorted(counts.get(check, {}))},
            }
            for check in CHECKS
        },
        "buckets": rows,
    }


def load_baseline(path: Path) -> dict[str, Any]:
    doc = json.loads(path.read_text(encoding="utf-8"))
    if doc.get("schema_id") != BASELINE_SCHEMA_ID:
        raise ValueError(f"{path} is not a {BASELINE_SCHEMA_ID} document")
    return doc


def baseline_index(doc: dict[str, Any]) -> tuple[dict[str, set[str] | None], dict[str, int]]:
    known: dict[str, set[str] | None] = {}
    counts: dict[str, int] = {}
    for row in doc.get("buckets") or []:
        name = f"{row['check']}|{row.get('subcheck', '')}|{row['error']}|{row.get('path', '')}"
        fingerprints = row.get("fingerprints")
        known[name] = set(fingerprints) if isinstance(fingerprints, list) else None
        counts[name] = int(row.get("count", 0))
    return known, counts


# ---------------------------------------------------------------------------------------- output


def plural(count: int, word: str) -> str:
    return f"{count} {word}" + ("" if count == 1 else "s")


def describe(item: dict[str, Any], width: int = 150) -> str:
    tag = "staleness" if item["stale"] else "blocking "
    where = item["path"] or "(no path)"
    fields = canonical(item["fields"])
    line = f"  [{tag}] {item['check']}/{item['subcheck'] or '-'}  {item['error']}  {where}  {fields}"
    return line if len(line) <= width else line[: width - 3] + "..."


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--root", default=str(ROOT), help="repository root (default: this checkout)")
    parser.add_argument("--base", default="origin/main", help="revision this branch is measured against")
    parser.add_argument("--baseline", default=DEFAULT_BASELINE, help=f"baseline file (default: {DEFAULT_BASELINE})")
    parser.add_argument("--record-baseline", action="store_true", help="run the three checks and write the baseline")
    parser.add_argument("--run-dir", default=None, help="plan-migration run directory (default: the current run)")
    parser.add_argument("--max-fingerprints", type=int, default=200, help="largest bucket the baseline enumerates")
    parser.add_argument("--subcheck-timeout-seconds", type=int, default=180, help="passed to the aggregate checks")
    parser.add_argument("--json", action="store_true", help="print the machine-readable report instead of the summary")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    baseline_path = Path(args.baseline)
    if not baseline_path.is_absolute():
        baseline_path = root / baseline_path

    try:
        run_dir = args.run_dir or current_run_dir(root)
    except Exception as exc:  # noqa: BLE001
        print(f"pm-landing-check: cannot resolve the plan-migration run: {exc}", file=sys.stderr)
        return 3

    # In compare mode the baseline and the branch paths are read before the checks run: they take
    # about ten minutes, and a missing baseline or an unknown base should say so at once.
    baseline: dict[str, Any] = {}
    touched: list[str] = []
    if not args.record_baseline:
        try:
            baseline = load_baseline(baseline_path)
        except Exception as exc:  # noqa: BLE001
            print(f"pm-landing-check: cannot read the baseline {args.baseline}: {exc}", file=sys.stderr)
            print("pm-landing-check: record one with --record-baseline in a full checkout at main.", file=sys.stderr)
            return 3
        try:
            touched = branch_paths(root, args.base)
        except RuntimeError as exc:
            print(f"pm-landing-check: {exc}", file=sys.stderr)
            return 3

    items: list[dict[str, Any]] = []
    counts: dict[str, dict[str, dict[str, int]]] = {}
    statuses: dict[str, str] = {}
    for check in CHECKS:
        try:
            report = run_check(check, root, run_dir, args.subcheck_timeout_seconds)
        except RuntimeError as exc:
            print(f"pm-landing-check: {exc}", file=sys.stderr)
            return 3
        statuses[check] = str(report.get("status", "unknown"))
        check_items, check_counts = extract(check, report, root)
        items.extend(check_items)
        counts[check] = check_counts

    commit = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=root, capture_output=True, text=True
    ).stdout.strip()

    if args.record_baseline:
        untracked = untracked_check_inputs(root)
        doc = build_baseline(commit, run_dir, items, counts, statuses, args.max_fingerprints, untracked)
        baseline_path.parent.mkdir(parents=True, exist_ok=True)
        baseline_path.write_text(json.dumps(doc, indent=1, sort_keys=True) + "\n", encoding="utf-8")
        print(f"pm-landing-check: baseline written to {baseline_path.relative_to(root)} at commit {commit}")
        for check in CHECKS:
            entry = doc["checks"][check]
            print(f"  {check:24s} {entry['status']:5s} {entry['failure_total']:7d} failures "
                  f"in {plural(len(entry['subchecks']), 'check')}")
        print(f"  buckets: {len(doc['buckets'])}, "
              f"of which {sum(1 for row in doc['buckets'] if row['fingerprints'] is None)} matched by count only")
        if untracked:
            print("  recorded with these gitignored inputs present: " + ", ".join(sorted(untracked)))
        return 0

    known, baseline_counts = baseline_index(baseline)
    direct, derived = split_touched(touched)
    tokens = path_tokens(direct)
    units = units_of_touched_docs(root, direct)
    partial = partial_subchecks(counts, baseline.get("checks") or {})

    new_items: list[dict[str, Any]] = []
    on_branch: list[dict[str, Any]] = []
    seen_buckets: dict[str, int] = {}
    for item in items:
        name = bucket_of(item)
        if (item["check"], item["subcheck"]) not in partial:
            seen_buckets[name] = seen_buckets.get(name, 0) + 1
            fingerprints = known.get(name, set())
            if fingerprints is not None and item["key"].rsplit("|", 1)[1] not in fingerprints:
                new_items.append(item)
        hits = names_branch_path(item, tokens, root, units)
        if hits:
            on_branch.append({**public(item), "branch_paths": hits})

    grown = grown_buckets(seen_buckets, baseline_counts)
    subcheck_growth = grown_subchecks(counts, baseline.get("checks") or {})
    resolved = sorted(
        name for name in set(baseline_counts) - set(seen_buckets)
        if bucket_subcheck(name) not in partial
    )

    reported_keys = {item["key"] for item in new_items} | {item["key"] for item in on_branch}
    reported = [item for item in items if item["key"] in reported_keys]
    blocking = blocking_items(on_branch, grown, subcheck_growth)

    if args.json:
        print(json.dumps(
            {
                "schema_id": "pm.landing_check.report.v1",
                "branch_units": len(units),
                "derived_paths_excluded": derived,
                "subchecks_compared_by_total_only": sorted(f"{c}/{s}" for c, s in partial),
                "generated_at_utc": utc_now(),
                "commit": commit,
                "base": args.base,
                "baseline_commit": baseline.get("commit"),
                "branch_paths": touched,
                "checks": {
                    check: {
                        "status": statuses[check],
                        "failure_total": sum(c["reported"] for c in counts[check].values()),
                        "baseline_failure_total": (baseline.get("checks", {}).get(check) or {}).get("failure_total", 0),
                        "subchecks": {name: counts[check][name] for name in sorted(counts[check])},
                    }
                    for check in CHECKS
                },
                "new": [public(item) for item in new_items],
                "on_branch": on_branch,
                "grown_buckets": grown,
                "grown_subchecks": subcheck_growth,
                "excused_by_kind": excused_by_kind(on_branch),
                "resolved_buckets": resolved,
                "blocking": len(blocking),
            },
            indent=1,
            sort_keys=True,
        ))
    else:
        print(f"pm-landing-check: baseline {baseline_path.relative_to(root)} recorded at "
              f"{str(baseline.get('commit'))[:12]}; this checkout is at {commit[:12]}")
        for check in CHECKS:
            total = sum(c["reported"] for c in counts[check].values())
            was = baseline.get("checks", {}).get(check, {}).get("failure_total", 0)
            print(f"  {check:24s} {statuses[check]:5s} {total:7d} failures (baseline {was})")
        print(f"  branch paths from git diff --name-only {args.base}..HEAD: {len(touched)}")
        truncated = [
            f"{check}/{name}" for check in CHECKS for name in sorted(counts[check])
            if counts[check][name]["sampled"] < counts[check][name]["reported"]
        ]
        if truncated:
            hidden = sum(
                counts[check][name]["reported"] - counts[check][name]["sampled"]
                for check in CHECKS for name in counts[check]
            )
            print(f"  {len(truncated)} subchecks print only part of their failures: "
                  f"{hidden} failures are never keyed, and the on-branch match runs over the rest")
            print(f"  {len(partial)} subchecks are compared by their total only, because which rows "
                  f"they print can change on its own")
        if derived:
            print(f"  {len(derived)} regenerated files are matched on the units they name, "
                  f"not on their own paths ({len(units)} units owned by documents this branch changed)")
        print()
        print(f"New since the baseline: {len(new_items)}")
        for item in new_items[:40]:
            print(describe(item))
        if len(new_items) > 40:
            print(f"  ... {len(new_items) - 40} more")
        print(f"Checks whose failure count rose: {len(grown)}")
        for row in grown[:40]:
            print(f"  [{'staleness' if row['stale'] else 'blocking '}] {row['bucket']}  "
                  f"{row['baseline_count']} -> {row['count']}")
        print(f"Subchecks reporting more failures than the baseline: {len(subcheck_growth)}")
        for row in subcheck_growth[:40]:
            tag = "blocking " if row["truncated"] else "off-branch"
            note = f" (only {row['sampled']} of {row['reported']} are printed, so what was added cannot be matched)" if row["truncated"] else ""
            print(f"  [{tag}] {row['check']}/{row['subcheck'] or '-'}  "
                  f"{row['baseline_reported']} -> {row['reported']}{note}")
        print(f"Naming a path this branch touches: {len(on_branch)}")
        excused = excused_by_kind(on_branch)
        if excused:
            print(f"  of which excused as governance staleness, by kind ({sum(excused.values())} in total):")
            for kind, count in excused.items():
                print(f"      {count:7d}  {kind}")
        for item in on_branch[:40]:
            print(describe(item))
        if len(on_branch) > 40:
            print(f"  ... {len(on_branch) - 40} more")
        print(f"Gone since the baseline (nothing to do): {len(resolved)}")
        print()
        if not reported and not grown and not subcheck_growth:
            print("Nothing to report. The three checks found only what the baseline already knew.")
        elif not blocking:
            advice = []
            if any(item["stale"] for item in on_branch):
                advice.append("governance staleness for what this branch edited, so ask the Plans agent for a reseal")
            if any(item["key"] not in {other["key"] for other in on_branch} for item in new_items):
                advice.append("new but names no file this branch touched, so report it to Jared")
            if subcheck_growth:
                advice.append("a subcheck that reports more than the baseline, with every failure still printed")
            print("Nothing reported stops the landing: it is " + "; and ".join(advice) + ".")
        else:
            print(f"{plural(len(blocking), 'item')} the baseline does not excuse. Fix them on this branch.")

    return exit_code(reported, grown, subcheck_growth, blocking)


def untracked_check_inputs(root: Path) -> list[str]:
    """Gitignored paths under tests/ that the checks read. Recorded so the baseline says what it
    depended on: these files exist only in the shared checkout, so a baseline taken without them
    is not the same baseline."""
    proc = subprocess.run(
        ["git", "status", "--porcelain", "--ignored=matching", "tests"],
        cwd=root,
        capture_output=True,
        text=True,
    )
    out = []
    for line in proc.stdout.splitlines():
        if not line.startswith("!! "):
            continue
        path = line[3:].strip()
        if "__pycache__" in path:
            continue
        out.append(path)
    return out


if __name__ == "__main__":
    raise SystemExit(main())
