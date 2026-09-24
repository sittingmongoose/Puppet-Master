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

The two aggregates run the same validators. Where a run-gates subcheck prints only a sample and the
audit-governance copy of the same validator, run at the same version on the same inputs in the same
landing run, prints every failure with the same total, the audit-governance rows key the failures and
the run-gates copy is not judged: neither its rows nor its total (review L-07). Otherwise the
run-gates copy falls back to the truncated rule. The summary prints each such pairing and why, and
--json carries it as `validator_pairs`, so a replay shows which copy was judged.

A subcheck that prints only a sample is keyed from its export instead, where it has one (the exports
brief of 2026-09-24). Both aggregates re-invoke every subcheck as `pm-plans-verify.py <command> --report
<tmp> <arguments>`, count the rows of that report and print the first 50 or 100 of them, so the report the
same command line writes when this script runs it again is the complete list of what the subcheck counts:
its export. Read in pm-plans-verify.py and in every validator it calls, each command the aggregates run
writes a complete one except `validate-audit-closure`, which keeps only the first 200 of its validator's
errors (EXPORT_COMMANDS, NO_EXPORT_COMMANDS). When the export's total equals the printed total, and the
baseline holds that subcheck's rows in full, printed or recorded from an export, every row is keyed from
the export and the subcheck is not truncated: the kind rules judge every row, and a rise in its total
stops nothing by itself. Otherwise the truncated rule applies as before, and the summary says which case
and why: no complete export, a baseline that holds only a sample, an export whose total disagrees, or one
that timed out or could not be read. The run header lists the commands that write a complete export and
the subchecks keyed from one. --record-baseline keys from exports too and records their rows beside the
printed ones, which stay what a landing whose export falls back compares with.

Governance staleness is what AGENTS.md names: Spec Lock `stale_hash`, stale owner or artifact
evidence hashes (among them `event_authority_currentness_source_drift` and `_validator_drift`), stale
readiness rows and their growth counter, and the stale plan-migration snapshot. It never stops a
landing. The readiness validator's total is that growth counter: its rise is staleness, not a
truncated rise, when the rows it printed show stale readiness rows growing on the branch's own files
and nothing else new.

A failure that is not staleness, in a baseline bucket whose count on the branch has not risen, is
pre-existing, whether or not its content changed: it never stops a landing, and it is reported as
"pre-existing" or "improved" with the baseline's count and the branch's. That is rule 2, and it
counts against the baseline's commit, not against main, so it applies only while the baseline is
current: its commit is an ancestor of the base, the branch's rebase target, and no more than seven
days older than it by commit time. Otherwise rule 2 is off for the landing, such a failure is judged
as it was before rule 2, and the report's first lines say that the baseline is stale and must be
re-recorded before the next landing, never to make this one pass.

A subcheck that pm-plans-verify.py killed at --subcheck-timeout-seconds (600 by default here) has no
result. Its timeout row is an infrastructure result, printed on its own line with the subcheck, how
long it ran and the limit; it is never a new failure, growth or a blocker. The run it happened in was
not fully verified, so it lifts exit 0 to 1 and changes no other exit code. A baseline is never
recorded from a run that has one.

It exits 0 only when every subcheck finished and it has nothing to report.

A key is `check | subcheck | error kind | path | fingerprint`. The fingerprint is a short digest of
the failure's remaining fields after the parts that move on their own are removed: timestamps, hash
values, the absolute path of the checkout it ran in, and the measured `actual`/`expected` values.
What is left is what makes one failure distinct from another: which span, which unit, which field.
So a stale hash for one document keeps one key however often the document changes.

Baseline home: `reports/landing-checks/baseline.json`. Not `Plans/.evidence/`, because AGENTS.md
calls that a build-governance artifact, CLAUDE.md forbids hand-editing it, and AGENTS.md reserves
writing it to the designated Plans agent; a file that is refreshed on a schedule cannot live under
that rule. `reports/**` is the documented home for compact result bundles.

It refuses to run on a sparse worktree. The three checks read the whole tree, so everything outside
a sparse cone is reported as a missing file: a dry run on a worktree without `Concepts` and `tests`
produced three blocking items and 76 new failures that were all the absent cone. Run it in the
shared checkout at landing, or after `git sparse-checkout disable`; `--allow-sparse` runs it anyway
for a deliberate partial run.

Deterministic: same tree in, same bytes out. No network. Nothing read outside the repository except
the checks' own inputs.

The --json report keeps only the rows it reports, so a later replay cannot see the rest of a sampled
subcheck's printed rows. With --keep-check-reports DIR, a directory outside the repository, each
check's full report, every row it printed, is kept as DIR/<check>.json, so a landing can be
replayed exactly.

Exit codes:
  0  nothing to report, and every subcheck finished
  1  nothing it reports stops the landing: governance staleness on files the branch edited,
     pre-existing failures whose count has not risen against a current baseline, or failures that
     are new but name none of the branch's files (push, and report them); or a subcheck timed out,
     so the run was not fully verified (rerun it on its own before pushing)
  2  it reports something that does stop the landing: a failure on the branch's files that is
     neither staleness nor pre-existing, a bucket that grew whose error kind is not staleness, or a
     rise in a subcheck whose failures are truncated, where the on-branch match cannot see what was
     added, other than the readiness growth counter; a subcheck keyed from its export is not truncated
  3  the script could not run a check or could not read the baseline or the branch paths, or a
     subcheck timed out while recording a baseline
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
import re
import signal
import subprocess
import sys
import tempfile
import textwrap
import time
from collections import Counter
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
# AGENTS.md already carves these out of a landing refusal: Spec Lock `stale_hash`, stale owner or
# artifact evidence hashes, a stale readiness report, the stale plan-migration snapshot. The script
# only names them; reports/landing-checks/README.md lists them by that grouping.
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
    # The Event Authority currentness inventory stores a hash for every source it covers; an edited
    # source no longer matches it until the next currentness edition. A stale owner evidence hash.
    "event_authority_currentness_source_drift",
    # A readiness report whose recorded source hashes no longer match its sources: a stale report.
    "buildability_passed_with_stale_source_hashes",
    # The currentness receipt stores the hash of its validator, scripts/pm-event-authority-currentness.py.
    # A canon edit cannot move it, but an edit of that script does, and only a currentness edition,
    # which refreshes the gitignored receipt, clears it: a stale evidence hash of an edited file, like
    # the Spec Lock kinds of an edited validator script, reported with a reseal request.
    "event_authority_currentness_validator_drift",
}
STALENESS_ERROR_PREFIXES = ("current_snapshot_",)
# The readiness validator checks the Spec Lock hash of every file it certifies, one kind per family:
# event_record_, execution_unit_context_, non_executable_closure_ and storage_value_registry_ so far.
# An edited Spec-Locked file reads stale in each of them until the reseal, like `stale_hash` itself.
STALENESS_ERROR_SUFFIXES = ("_spec_lock_hash_stale",)
STALENESS_DETAIL_MARKER = "is stale"

# The readiness validator, as each aggregate names it. Its total is the growth counter of the stale
# readiness rows above: where the gitignored currentness audit inputs are present, as in the shared
# checkout, every inventoried source whose stored hash has drifted adds a source-drift row, so a
# canon edit can lift it past the print cap. See readiness_counter_is_staleness.
READINESS_SUBCHECKS = {
    ("run-gates", "validate_implementation_readiness"),
    ("audit-governance", "implementation_readiness"),
}

CHECKS = ("run-gates", "audit-governance", "plan-migration-validate")

# The exports brief of 2026-09-24: the commands whose report is a complete export of the rows the
# aggregates count. Read in scripts/pm-plans-verify.py at bc1d99c11e: both aggregates re-invoke every
# subcheck as `pm-plans-verify.py <command> --report <tmp> <arguments>` (`_run_subprocess_check`), take its
# total as len(failures) of that report (`compact_gate_report`) and print report["failures"][:50]
# (`cmd_run_gates`) or [:100] (`cmd_audit_governance`) of it. run-gates runs `verify_spec_lock` in-process,
# through `cmd_verify_spec_lock`, the function its `verify-spec-lock` command runs. The command's `main()`
# writes the whole report with --report. So running a subcheck's command line again writes every row the
# aggregate counted, and none of these commands, nor any validator they call, drops rows before it
# reports them. Two keep only 50 entries of a list nested inside one row (`gui_asset_policy_failed`,
# `audit_closure_reopened_rows_present`), which changes what that row says, never how many rows there
# are. A command that is not listed here, such as one added later, has no export until someone reads it.
EXPORT_COMMANDS = frozenset({
    "check-project-artifacts", "check-shards", "json-syntax", "lint-banned-phrases", "lint-contractrefs",
    "lint-path-refs", "validate-audit-status-index", "validate-auto-decisions", "validate-browser-event-admission",
    "validate-case-l-non-event-materialization", "validate-evidence", "validate-filesafe-security-policy",
    "validate-forge-backup-acceptance", "validate-github-project-integration", "validate-goal-runtime-event-fixtures",
    "validate-gui-asset-policy", "validate-implementation-readiness", "validate-new-contracts",
    "validate-plan-graph", "validate-plan-migration", "validate-plans-to-code-handoff-schema",
    "validate-pm7-gui-fixtures", "validate-prd-planning-runtime-contracts", "validate-project-output-fixtures",
    "validate-runtime-artifact-schemas", "validate-server-command-gap", "validate-testing-session-event-admission",
    "validate-touch-closure", "validate-ui-command-response", "validate-usage-contract-drift",
    "validate-usage-gui-fixtures", "validate-web-capability-contracts", "validate-wiring-matrix",
    "validate-working-notebook-contracts", "verify-spec-lock",
})
# Commands the aggregates run whose own report is not a complete list, and why.
NO_EXPORT_COMMANDS = {
    "validate-audit-closure": "cmd_validate_audit_closure keeps only the first 200 of pm-audit-closure.py's "
                              "errors, so its own report is a sample whenever there are more",
}
# pm-plans-verify.py marks an aggregate's child with this variable, so that a validator the child starts
# stays in the child's process group and dies with it when the aggregate's bound runs out. An export is
# run the same way.
AGGREGATE_CHILD_ENV = "PM_PLANS_VERIFY_AGGREGATE_CHILD"

# Failure kinds that say a subcheck did not finish, not that the tree is wrong. pm-plans-verify.py
# kills a subcheck at --subcheck-timeout-seconds and reports that as the subcheck's only failure:
# `subprocess_timeout` for the subchecks it runs as processes, `subcheck_timeout` for the one it runs
# in-process.
INFRASTRUCTURE_ERRORS = {"subprocess_timeout", "subcheck_timeout"}
# The bound handed to the aggregate checks. lint-contractrefs alone takes about 199 s in the shared
# checkout on the network mount, with 0 failures when run on its own at e44b9186fb; the old 180 s
# bound killed it in both aggregates at the terminal.workgroup_moved landing of 2026-09-24.
DEFAULT_SUBCHECK_TIMEOUT_SECONDS = 600

# Rule 2 applies only while the baseline is current: the commit it names is an ancestor of the base,
# the branch's rebase target, and no more than this many days older than it by committer time. The
# nightly refresh keeps it within a day; seven days cover a run of failed nights without turning every
# landing red. Against an older baseline, a failure main fixed after the baseline's commit, brought
# back by a branch on a file it edits, would read as pre-existing.
MAX_BASELINE_AGE_DAYS = 7


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def canonical(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True)


# ---------------------------------------------------------------------------- running the checks


def sparse_paths(root: Path) -> list[str]:
    """The cone a sparse worktree is limited to; empty when the tree is whole.

    `git sparse-checkout list` exits non-zero and says the worktree is not sparse when it is whole;
    on a sparse one it prints the directories that are actually on disk.
    """
    proc = subprocess.run(
        ["git", "sparse-checkout", "list"], cwd=root, capture_output=True, text=True
    )
    if proc.returncode != 0:
        return []
    return [line.strip() for line in proc.stdout.splitlines() if line.strip()]


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


def is_staleness_kind(error: str) -> bool:
    """Governance staleness by error kind alone, as a row or as a bucket that grew."""
    return (
        error in STALENESS_ERRORS
        or error.startswith(STALENESS_ERROR_PREFIXES)
        or error.endswith(STALENESS_ERROR_SUFFIXES)
    )


def is_staleness(error: str, scrubbed: dict[str, Any]) -> bool:
    if is_staleness_kind(error):
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


def split_infrastructure(items: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Rule 3: take out the rows that say a subcheck was killed at its time bound.

    Such a subcheck has no result: what it would have reported is unknown, neither zero nor one. Its
    row is an infrastructure result, printed on its own line with how long the subcheck ran, and is
    never a new failure, growth or a blocker. Returns (infrastructure results, the other items).
    """
    infrastructure = [infrastructure_row(item) for item in items if item["error"] in INFRASTRUCTURE_ERRORS]
    rest = [item for item in items if item["error"] not in INFRASTRUCTURE_ERRORS]
    return infrastructure, rest


def infrastructure_row(item: dict[str, Any]) -> dict[str, Any]:
    raw = item["_raw"] if isinstance(item["_raw"], dict) else {}
    bound = raw.get("timeout_seconds")
    known = isinstance(bound, (int, float)) and not isinstance(bound, bool)
    return {
        "check": item["check"],
        "subcheck": item["subcheck"],
        "error": item["error"],
        "command_id": raw.get("command_id"),
        # The subcheck is killed when its bound runs out, so the bound is how long it ran.
        "elapsed_seconds": bound if known else None,
    }


def describe_infrastructure(row: dict[str, Any]) -> str:
    """The timeout line: the subcheck, how long it ran and the limit (review L-08)."""
    command = f" ({row['command_id']})" if row.get("command_id") else ""
    limit = row.get("limit_seconds")
    at = f"at its limit of {limit} s" if limit is not None else "at its time limit"
    ran = (f"killed after {row['elapsed_seconds']} s, {at}" if row["elapsed_seconds"] is not None
           else f"killed {at}, after a time the check does not report")
    return (f"  [infrastructure] {row['check']}/{row['subcheck'] or '-'}  {row['error']}{command}  "
            f"{ran}; what it would report is unknown")


def public(item: dict[str, Any]) -> dict[str, Any]:
    """The item without the working fields that are not meant to be printed."""
    return {key: value for key, value in item.items() if not key.startswith("_")}


def bucket_of(item: dict[str, Any]) -> str:
    return f"{item['check']}|{item['subcheck']}|{item['error']}|{item['path']}"


def keyed_rows(counted: dict[str, Any]) -> int:
    """How many of a subcheck's failures are keyed: every one when its rows came from its export (its
    `exported` count, the exports brief), otherwise the ones it printed (`sampled`)."""
    return max(int(counted.get("sampled", 0) or 0), int(counted.get("exported", 0) or 0))


def grown_subchecks(
    counts: dict[str, dict[str, dict[str, int]]],
    baseline_checks: dict[str, Any],
) -> list[dict[str, Any]]:
    """Subchecks reporting more failures than the baseline recorded.

    Each check reports a true total per subcheck but prints only the first 50 or 100 of them, so
    most of a large subcheck is never keyed and never matched against the branch's paths. Comparing
    the totals is the only way a failure added above the cap announces itself. When the subcheck is
    truncated the rise stops the landing, because nothing can say whether what was added names a
    file the branch touched. A subcheck keyed from its export is not truncated: every row it counts
    was keyed and matched, so its rise is marked `keyed_from_export` and stops nothing by itself.
    """
    rows = []
    for check in sorted(counts):
        recorded = (baseline_checks.get(check) or {}).get("subchecks") or {}
        for subcheck in sorted(counts[check]):
            now = counts[check][subcheck]
            was = int((recorded.get(subcheck) or {}).get("reported", 0))
            if now["reported"] <= was:
                continue
            row = {
                "check": check,
                "subcheck": subcheck,
                "baseline_reported": was,
                "reported": now["reported"],
                "sampled": now["sampled"],
                "truncated": keyed_rows(now) < now["reported"],
            }
            if now.get("exported"):
                row["keyed_from_export"] = True
            rows.append(row)
    return rows


def partial_subchecks(
    counts: dict[str, dict[str, dict[str, int]]],
    baseline_checks: dict[str, Any],
) -> set[tuple[str, str]]:
    """Subchecks whose printed failures are only a sample, in this run or when the baseline was taken.

    Which rows land inside a 50- or 100-row sample can change without a single failure being added
    or removed, so a fingerprint appearing there for the first time means nothing. For these the
    total is the only sound comparison, and it is compared. Their rows are still read, because the
    branch match does not depend on the baseline. A subcheck keyed from its export, in this run or when
    the baseline was recorded, counts as printing every failure on that side (`keyed_rows`).
    """
    out: set[tuple[str, str]] = set()
    for check in counts:
        for name, counted in counts[check].items():
            if keyed_rows(counted) < counted["reported"]:
                out.add((check, name))
    for check, entry in (baseline_checks or {}).items():
        for name, counted in ((entry or {}).get("subchecks") or {}).items():
            if keyed_rows(counted) < int(counted.get("reported", 0)):
                out.add((check, name))
    return out


def bucket_subcheck(name: str) -> tuple[str, str]:
    check, subcheck, _rest = name.split("|", 2)
    return check, subcheck


def bucket_counts(items: list[dict[str, Any]]) -> dict[str, int]:
    """How many printed rows each bucket holds in this run, sampled subchecks included.

    In a subcheck that prints only a sample, this is the count inside the sample, and so is the
    baseline's count for it, because the baseline was built from the printed rows too.
    """
    counts: dict[str, int] = {}
    for item in items:
        name = bucket_of(item)
        counts[name] = counts.get(name, 0) + 1
    return counts


def bucket_rose(count: int, baseline_count: int | None) -> bool:
    """A bucket the baseline never saw, or one holding more rows than it recorded."""
    return baseline_count is None or count > baseline_count


def standing_of(count: int, baseline_count: int | None) -> str | None:
    """Rule 2: "pre-existing" or "improved" for a bucket the baseline holds whose count has not risen.

    A failure in such a bucket was on `main` before the branch, whatever its content says now: the
    self-test failure that listed seven failing checks on `main` and three on the branch is one row
    of one bucket both times, and only its fingerprint moved. None means the bucket is new or grew.
    """
    if bucket_rose(count, baseline_count):
        return None
    return "pre-existing" if count == baseline_count else "improved"


def readiness_counter_is_staleness(
    row: dict[str, Any],
    items: list[dict[str, Any]],
    run_counts: dict[str, int],
    baseline_counts: dict[str, int],
    on_branch_keys: set[str] | None = None,
) -> bool:
    """Whether a readiness subcheck's rise is the growth counter of stale readiness rows.

    The readiness validator prints 50 or 100 rows of a total that every canon edit can lift, so the
    rise itself cannot be matched row by row, and a rise in a truncated subcheck otherwise stops the
    landing. It counts as staleness when the rows it did print say so: at least one printed row is a
    staleness kind whose bucket is new or grew and that names a file the branch touched (its key is
    in `on_branch_keys`), so the stale growth is visible and is the branch's, and no printed row that
    is not staleness is new or in a grown bucket, so nothing else is visibly growing. Stale growth
    that names only files the branch did not touch, such as main's own drift, does not count. Rows
    above the print cap stay unseen either way; README.md says what that leaves open.
    """
    if (row["check"], row["subcheck"]) not in READINESS_SUBCHECKS:
        return False
    stale_growth = False
    for item in items:
        if (item["check"], item["subcheck"]) != (row["check"], row["subcheck"]):
            continue
        name = bucket_of(item)
        rose = bucket_rose(run_counts.get(name, 0), baseline_counts.get(name))
        if item["stale"]:
            stale_growth = stale_growth or (rose and (on_branch_keys is None or item["key"] in on_branch_keys))
        elif rose:
            return False
    return stale_growth


def blocking_items(
    on_branch: list[dict[str, Any]],
    grown: list[dict[str, Any]],
    subcheck_growth: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """What stops a landing, by the rule in AGENTS.md.

    A failure on a file the branch touched that is neither governance staleness nor pre-existing
    (`standing` on the item, rule 2); a bucket that grew whose error kind is not staleness; and a rise
    in a truncated subcheck, whose added failures nothing can match against the branch's paths,
    unless it is the readiness growth counter of stale readiness rows (`stale` on the row). A failure
    that is new but names none of the branch's files does not stop the landing: it is reported and
    pushed, exactly as the shard-check rule reads.
    """
    return (
        [item for item in on_branch if not item["stale"] and not item.get("standing")]
        + [row for row in grown if not row["stale"]]
        + [row for row in subcheck_growth if row["truncated"] and not row.get("stale")]
    )


def exit_code(
    reported: list[Any],
    grown: list[Any],
    subcheck_growth: list[Any],
    blocking: list[Any],
    infrastructure: list[Any] | tuple[Any, ...] = (),
) -> int:
    """0 only for a complete run with nothing to report (review L-08).

    A subcheck that timed out hides whatever it would have reported, so a run with one was not fully
    verified. Exit 1 means reported, nothing stops the landing, which is exactly that, so the timeout
    lifts 0 to 1. It never turns a 1 into a 2 or a 2 into a 1.
    """
    if not reported and not grown and not subcheck_growth and not infrastructure:
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
            "stale": is_staleness_kind(error),
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
    export_items: list[dict[str, Any]] | tuple[dict[str, Any], ...] = (),
) -> dict[str, Any]:
    """The baseline document. `items` are the rows the checks printed; `export_items` the complete rows
    of the subchecks keyed from their export (the exports brief), whose counts carry `exported`.

    `buckets` holds the printed rows of every subcheck, the exported ones included, because a landing
    whose export falls back compares its printed sample with the baseline's printed sample, as before.
    `export_buckets` holds the exported rows, which a landing keyed from its own export, or printing
    every failure, compares with instead.
    """
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
        "buckets": bucket_rows(items, max_fingerprints),
        "export_buckets": bucket_rows(list(export_items), max_fingerprints),
    }


def bucket_rows(items: list[dict[str, Any]], max_fingerprints: int) -> list[dict[str, Any]]:
    """The baseline's rows for these failures: one per bucket, with its count and fingerprints."""
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
    return rows


def load_baseline(path: Path) -> dict[str, Any]:
    doc = json.loads(path.read_text(encoding="utf-8"))
    if doc.get("schema_id") != BASELINE_SCHEMA_ID:
        raise ValueError(f"{path} is not a {BASELINE_SCHEMA_ID} document")
    return doc


def baseline_index(
    doc: dict[str, Any],
    exported: set[tuple[str, str]] | frozenset[tuple[str, str]] = frozenset(),
) -> tuple[dict[str, set[str] | None], dict[str, int]]:
    """({bucket: fingerprints, or None for a count-only bucket}, {bucket: count}) of a baseline.

    A subcheck in `exported` is read from `export_buckets`, the complete rows the baseline recorded from
    its export, instead of from its printed sample in `buckets` (the exports brief).
    """
    known: dict[str, set[str] | None] = {}
    counts: dict[str, int] = {}
    for field in ("buckets", "export_buckets"):
        for row in doc.get(field) or []:
            if ((row["check"], row.get("subcheck", "")) in exported) != (field == "export_buckets"):
                continue
            name = f"{row['check']}|{row.get('subcheck', '')}|{row['error']}|{row.get('path', '')}"
            fingerprints = row.get("fingerprints")
            known[name] = set(fingerprints) if isinstance(fingerprints, list) else None
            counts[name] = int(row.get("count", 0))
    return known, counts


def git_out(root: Path, *args: str) -> str | None:
    """A git command's stdout, stripped, or None when the command fails."""
    proc = subprocess.run(["git", *args], cwd=root, capture_output=True, text=True)
    return proc.stdout.strip() if proc.returncode == 0 else None


def commit_of(root: Path, rev: str) -> str | None:
    return git_out(root, "rev-parse", "--verify", "--quiet", f"{rev}^{{commit}}")


def baseline_currency(
    root: Path,
    baseline_commit: Any,
    base: str,
    max_age_days: int = MAX_BASELINE_AGE_DAYS,
) -> dict[str, Any]:
    """Whether rule 2 may be applied at this landing: only against a current baseline (review L-05).

    Current means that the commit the baseline names is an ancestor of the base, the branch's rebase
    target, and at most `max_age_days` older than it by committer time. Rule 2 compares a bucket's
    count with the baseline's, not with main's, so a failure main fixed after the baseline's commit,
    and that a branch brings back on a file it edits, reads as pre-existing; the older the baseline,
    the more such regressions it would excuse. Returns what was found, `rule_two_applies`, and the
    reason in words.
    """
    found: dict[str, Any] = {
        "baseline_commit": baseline_commit if isinstance(baseline_commit, str) else None,
        "base": base,
        "base_commit": commit_of(root, base),
        "ancestor": None,
        "age_days": None,
        "max_age_days": max_age_days,
        "rule_two_applies": False,
    }
    if not isinstance(baseline_commit, str) or not baseline_commit.strip():
        found["reason"] = "the baseline names no commit"
        return found
    name = baseline_commit[:12]
    commit = commit_of(root, baseline_commit)
    if commit is None:
        found["reason"] = f"its commit {name} is not a commit this repository has"
        return found
    if found["base_commit"] is None:
        found["reason"] = f"the base {base} is not a commit this repository has"
        return found
    # `--base` is usually a name such as origin/main; say which commit it named.
    named = "" if found["base_commit"].startswith(base) else f" ({found['base_commit'][:12]})"
    where = f"the base {base}{named}"
    found["ancestor"] = subprocess.run(
        ["git", "merge-base", "--is-ancestor", commit, found["base_commit"]], cwd=root, capture_output=True
    ).returncode == 0
    times = [git_out(root, "show", "-s", "--format=%ct", rev) for rev in (commit, found["base_commit"])]
    seconds = int(times[1]) - int(times[0]) if all(t and t.isdigit() for t in times) else None
    if seconds is not None:
        found["age_days"] = round(seconds / 86400, 2)
    if not found["ancestor"]:
        found["reason"] = f"its commit {name} is not an ancestor of {where}"
    elif seconds is None:
        found["reason"] = f"the commit times of {name} and {where} could not be read"
    elif seconds > max_age_days * 86400:
        found["reason"] = (f"its commit {name} is {seconds / 86400:.2f} days older than {where}, more than "
                           f"the {max_age_days} rule 2 allows")
    else:
        found["rule_two_applies"] = True
        found["reason"] = (f"its commit {name} is an ancestor of {where} and {max(seconds, 0) / 86400:.2f} "
                           f"days older than it, within {max_age_days}")
    return found


def stale_baseline_notice(currency: dict[str, Any]) -> list[str]:
    """The first lines of a report whose baseline is not current: rule 2 is off, and why."""
    return [
        "pm-landing-check: the baseline is stale, so rule 2 (pre-existing failures never block) is off "
        f"for this landing: {currency['reason']}.",
        "  A failure in a baseline bucket whose count has not risen is judged as it was before rule 2: "
        "on a file this branch touched it stops the landing, and one whose content changed is new.",
        "  Re-record the baseline before the next landing (--record-baseline in a full checkout at main, "
        "by the nightly runbook in reports/landing-checks/README.md), never to make this landing pass.",
    ]


# --------------------------------------------------------------------- validators both aggregates run


def listed_totals(check: str, report: dict[str, Any]) -> dict[str, int]:
    """Every subcheck an aggregate ran, passing ones too, with its reported total.

    run-gates keeps them under `checks`, audit-governance at its top level. The failure blocks name
    only the subcheck that failed, so a copy that passed is found here, with 0.
    """
    if check == "run-gates":
        holder = report.get("checks") if isinstance(report.get("checks"), dict) else {}
    elif check == "audit-governance":
        holder = report
    else:
        return {}
    return {
        name: int(entry["failures"])
        for name, entry in holder.items()
        if isinstance(entry, dict) and isinstance(entry.get("failures"), int) and not isinstance(entry.get("failures"), bool)
    }


def aggregate_subcheck_commands(
    root: Path,
    names: dict[str, set[str]],
    timeout_seconds: int,
) -> dict[tuple[str, str], str]:
    """What each aggregate subcheck runs, as scripts/pm-plans-verify.py itself decides it (review L-07).

    Both aggregates re-invoke a subcheck as `pm-plans-verify.py <command> --report <tmp> <arguments>`
    and take the command and the arguments from the subcheck's name with the script's own
    `_aggregate_subcheck_command_id` and `_aggregate_subcheck_cli_args`, read here from the checked
    tree. Two subchecks that map to the same command line run the same validator; `verify_spec_lock`,
    which run-gates runs in-process, calls the function its `verify-spec-lock` command runs. Raises
    when the script or those two functions cannot be read. Writes no bytecode and leaves sys.path as
    it found it.
    """
    return {key: " ".join(argv) for key, argv in aggregate_subcheck_argv(root, names, timeout_seconds).items()}


def aggregate_subcheck_argv(
    root: Path,
    names: dict[str, set[str]],
    timeout_seconds: int,
) -> dict[tuple[str, str], list[str]]:
    """The command and the arguments each aggregate subcheck runs, as a list: what
    aggregate_subcheck_commands joins into one line, and what run_export runs (the exports brief).
    Read from the checked tree's scripts/pm-plans-verify.py with its own `_aggregate_subcheck_command_id`
    and `_aggregate_subcheck_cli_args`; raises when the script or those two functions cannot be read.
    """
    path = root / "scripts" / "pm-plans-verify.py"
    if not path.is_file():
        raise RuntimeError("scripts/pm-plans-verify.py is missing")
    spec = importlib.util.spec_from_file_location("pm_plans_verify_subcheck_commands", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("scripts/pm-plans-verify.py cannot be loaded")
    module = importlib.util.module_from_spec(spec)
    saved_path, saved_bytecode = list(sys.path), sys.dont_write_bytecode
    sys.dont_write_bytecode = True
    try:
        spec.loader.exec_module(module)
    finally:
        sys.path[:] = saved_path
        sys.dont_write_bytecode = saved_bytecode
    command_of = getattr(module, "_aggregate_subcheck_command_id")
    arguments_of = getattr(module, "_aggregate_subcheck_cli_args")
    # The aggregates give their subchecks neither a run directory nor a registry of their own.
    namespace = argparse.Namespace(subcheck_timeout_seconds=timeout_seconds)
    return {
        (check, name): [str(command_of(name)),
                        *(str(arg) for arg in arguments_of(name, namespace, timeout_seconds=timeout_seconds))]
        for check in sorted(names)
        for name in sorted(names[check])
    }


def tree_state(root: Path) -> dict[str, Any]:
    """HEAD and a digest of every file under scripts/, where the validators live (review L-07).

    Taken before the first aggregate and after the second: when neither moved, both aggregates ran
    the same validator code at the same commit.
    """
    scripts = root / "scripts"
    files = sorted(
        path for path in scripts.rglob("*") if path.is_file() and "__pycache__" not in path.parts
    ) if scripts.is_dir() else []
    digest = hashlib.sha256()
    for path in files:
        digest.update(path.relative_to(root).as_posix().encode("utf-8") + b"\0")
        try:
            digest.update(hashlib.sha256(path.read_bytes()).digest())
        except OSError:
            digest.update(b"<unreadable>")
    return {"head": git_out(root, "rev-parse", "HEAD"), "scripts_sha256": digest.hexdigest()}


def version_change(before: dict[str, Any] | None, after: dict[str, Any] | None) -> str | None:
    """Why the two aggregates may not have run the same validator version, or None."""
    if before is None or after is None:
        return "the validator version could not be compared between the two aggregate runs"
    if before["head"] != after["head"]:
        return (f"HEAD moved from {str(before['head'])[:12]} to {str(after['head'])[:12]} between the two "
                "aggregate runs")
    if before["scripts_sha256"] != after["scripts_sha256"]:
        return "a file under scripts/ changed between the two aggregate runs"
    return None


def row_tail(item: dict[str, Any]) -> str:
    """A failure's key without its check and subcheck: the same failure, printed by either aggregate."""
    return item["key"].split("|", 2)[2]


def pair_validators(
    counts: dict[str, dict[str, dict[str, int]]],
    listed: dict[str, dict[str, int]],
    baseline_checks: dict[str, Any],
    timed_out: set[tuple[str, str]],
    items: list[dict[str, Any]],
    commands: dict[tuple[str, str], str] | str,
    changed: str | None,
    keyed: set[tuple[str, str]] | frozenset[tuple[str, str]] = frozenset(),
) -> list[dict[str, Any]]:
    """Review L-07: which run-gates copies of a validator are judged by their audit-governance copy.

    One row for every run-gates subcheck whose printed failures are only a sample, in this run or
    when the baseline was recorded, since those are the copies the baseline cannot key in full. Such
    a copy is paired with the audit-governance subcheck that runs the same command, and judged by its
    rows, only when both ran the same validator at the same version in this run (`changed` is None),
    neither timed out, their totals agree, the audit-governance copy printed every failure now and at
    the baseline, and every row the run-gates copy printed is among its rows, which with the equal
    totals is the evidence that both saw the same inputs. Otherwise the row says why not, and the
    run-gates copy keeps the truncated rule. `commands` is what each subcheck runs, or why that could
    not be read. A run-gates copy in `keyed` has every failure keyed from an export, in this run and at
    the baseline or printed in full on the other side, so it is no sample and gets no row (the exports
    brief).
    """
    recorded = {check: ((baseline_checks.get(check) or {}).get("subchecks") or {})
                for check in ("run-gates", "audit-governance")}

    def now(check: str, name: str) -> dict[str, int]:
        counted = (counts.get(check) or {}).get(name)
        if counted:
            return {"reported": int(counted["reported"]), "sampled": int(counted["sampled"])}
        return {"reported": int((listed.get(check) or {}).get(name, 0)), "sampled": 0}

    def then(check: str, name: str) -> dict[str, int]:
        entry = recorded[check].get(name) or {}
        return {"baseline_reported": int(entry.get("reported", 0)), "baseline_sampled": int(entry.get("sampled", 0))}

    def rows_of(check: str, name: str) -> Counter:
        return Counter(row_tail(item) for item in items if (item["check"], item["subcheck"]) == (check, name))

    pairs = []
    for name in sorted(set(counts.get("run-gates") or {}) | set(recorded["run-gates"])):
        if ("run-gates", name) in keyed:
            continue
        own = {**now("run-gates", name), **then("run-gates", name)}
        if own["sampled"] >= own["reported"] and own["baseline_sampled"] >= own["baseline_reported"]:
            continue
        row: dict[str, Any] = {
            "run_gates": name, "audit_governance": None, "command": None, "paired": False,
            "judged": f"run-gates/{name}", "run_gates_counts": own, "audit_governance_counts": None,
        }
        pairs.append(row)
        if isinstance(commands, str):
            row["reason"] = f"what each subcheck runs could not be read from scripts/pm-plans-verify.py ({commands})"
            continue
        row["command"] = commands.get(("run-gates", name))
        twins = sorted(other for (check, other), line in commands.items()
                       if check == "audit-governance" and row["command"] is not None and line == row["command"])
        if len(twins) != 1:
            row["reason"] = ("no audit-governance subcheck runs the same command" if not twins else
                             f"more than one audit-governance subcheck runs the same command: {', '.join(twins)}")
            continue
        twin = twins[0]
        other = {**now("audit-governance", twin), **then("audit-governance", twin)}
        row["audit_governance"], row["audit_governance_counts"] = twin, other
        unmatched = 0
        if ("run-gates", name) in timed_out:
            row["reason"] = "the run-gates copy timed out"
        elif ("audit-governance", twin) in timed_out:
            row["reason"] = "the audit-governance copy timed out"
        elif changed:
            row["reason"] = changed
        elif own["reported"] != other["reported"]:
            row["reason"] = f"the totals disagree: run-gates {own['reported']}, audit-governance {other['reported']}"
        elif other["sampled"] < other["reported"]:
            row["reason"] = (f"the audit-governance copy prints {other['sampled']} of {other['reported']}, so its "
                             "rows do not key every failure")
        elif other["baseline_sampled"] < other["baseline_reported"]:
            row["reason"] = (f"the audit-governance copy printed {other['baseline_sampled']} of "
                             f"{other['baseline_reported']} when the baseline was recorded, so the baseline does "
                             "not key every failure either")
        else:
            missing = rows_of("run-gates", name)
            missing.subtract(rows_of("audit-governance", twin))
            unmatched = sum(count for count in missing.values() if count > 0)
            if unmatched:
                row["reason"] = (f"{unmatched} of the rows the run-gates copy printed "
                                 f"{'is' if unmatched == 1 else 'are'} not among the audit-governance copy's rows")
            else:
                row["paired"] = True
                row["judged"] = f"audit-governance/{twin}"
                row["reason"] = (f"the same command ({row['command']}) at the same version, totals "
                                 f"{own['reported']} = {other['reported']}, and every run-gates row is among the "
                                 f"audit-governance rows, which are all {other['reported']} of its failures "
                                 f"(all {other['baseline_reported']} at the baseline)")
    return pairs


def describe_pair(row: dict[str, Any]) -> str:
    counted = row["run_gates_counts"]
    own = f"{counted['sampled']} of {counted['reported']} printed"
    if counted["baseline_sampled"] < counted["baseline_reported"]:
        own += f", {counted['baseline_sampled']} of {counted['baseline_reported']} in the baseline"
    if row["paired"]:
        return (f"    [paired    ] run-gates/{row['run_gates']} ({own}) is judged by "
                f"audit-governance/{row['audit_governance']}: {row['reason']}")
    twin = f" and audit-governance/{row['audit_governance']}" if row["audit_governance"] else ""
    return (f"    [not paired] run-gates/{row['run_gates']}{twin} ({own}): {row['reason']}; the run-gates copy "
            "is judged on its own, by the truncated rule")


# ------------------------------------------------------------- subchecks keyed from their export


def run_export(root: Path, argv: list[str], timeout_seconds: int) -> dict[str, Any]:
    """Run one subcheck's command on its own and read the report it writes: its export (the exports brief).

    `argv` is the command and its arguments exactly as pm-plans-verify.py builds them for the aggregates
    (aggregate_subcheck_argv). It runs the way an aggregate runs it: `python3 scripts/pm-plans-verify.py
    <command> --report <file> <arguments>` from the root, in a process group of its own, marked as an
    aggregate's child so that a validator it starts stays in that group, and killed with the whole group
    when `timeout_seconds` runs out. The file is in a scratch directory outside the repository and is
    deleted again; like the aggregates, it reads the command's stdout when the file is empty. Returns
    {"report": the report or None, "timed_out": bool, "error": why it could not be read or None,
    "elapsed_seconds": how long it ran}.
    """
    started = time.monotonic()
    with tempfile.TemporaryDirectory(prefix="pm-landing-check-export-") as scratch:
        report_file = Path(scratch) / "export.json"
        command = [sys.executable, "scripts/pm-plans-verify.py", argv[0], "--report", str(report_file), *argv[1:]]
        env = dict(os.environ)
        env[AGGREGATE_CHILD_ENV] = "1"
        proc = subprocess.Popen(command, cwd=root, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
                                start_new_session=True, env=env)
        try:
            out, err = proc.communicate(timeout=timeout_seconds if timeout_seconds > 0 else None)
        except subprocess.TimeoutExpired:
            try:
                os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
            except OSError:
                try:
                    proc.kill()
                except OSError:
                    pass
            try:
                proc.communicate(timeout=5)
            except Exception:  # noqa: BLE001 - the group is killed; nothing more to read.
                pass
            return {"report": None, "timed_out": True, "error": None,
                    "elapsed_seconds": round(time.monotonic() - started, 1)}
        elapsed = round(time.monotonic() - started, 1)
        written = report_file.is_file() and report_file.stat().st_size > 0
        payload = report_file.read_text(encoding="utf-8") if written else out
    try:
        report = json.loads(payload)
    except Exception as exc:  # noqa: BLE001 - an unreadable export only means the truncated rule applies.
        return {"report": None, "timed_out": False, "elapsed_seconds": elapsed,
                "error": f"its report is not JSON ({exc}); returncode {proc.returncode}; "
                         f"stderr tail: {(err or '')[-300:].strip()}"}
    if not isinstance(report, dict) or not isinstance(report.get("failures"), list):
        return {"report": None, "timed_out": False, "elapsed_seconds": elapsed,
                "error": "its report holds no list of failures"}
    return {"report": report, "timed_out": False, "error": None, "elapsed_seconds": elapsed}


def keep_export(keep_dir: Path, name: str, argv: list[str], result: dict[str, Any]) -> None:
    """With --keep-check-reports, keep an export as DIR/exports/<name>.json beside the check reports, so a
    replay can feed it back: its command line, how the run ended and the report it wrote."""
    folder = keep_dir / "exports"
    folder.mkdir(parents=True, exist_ok=True)
    (folder / f"{name}.json").write_text(json.dumps({"argv": argv, **result}, indent=1, sort_keys=True) + "\n",
                                         encoding="utf-8")


def key_from_exports(
    root: Path,
    counts: dict[str, dict[str, dict[str, int]]],
    baseline_checks: dict[str, Any] | None,
    timed_out: set[tuple[str, str]],
    argv_map: dict[tuple[str, str], list[str]] | str,
    timeout_seconds: int,
    keep_dir: Path | None = None,
) -> tuple[dict[tuple[str, str], list[dict[str, Any]]], list[dict[str, Any]]]:
    """The exports brief: key each subcheck that prints only a sample from its complete export.

    One row for every run-gates or audit-governance subcheck whose printed failures are a sample in this
    run and that did not time out, saying whether it was keyed and why. It is keyed when its command
    writes a complete export (EXPORT_COMMANDS), the baseline holds its rows in full, printed or recorded
    from an export (`baseline_checks` is None when a baseline is being recorded), the export finished
    within `timeout_seconds` and could be read, and the export's total equals the printed total. One
    command line is run once, for every subcheck that runs it. Sets `exported` on the count of every
    keyed subcheck and returns ({(check, subcheck): the export's rows, normalized}, the rows).
    """
    rows: list[dict[str, Any]] = []
    planned: dict[tuple[str, ...], list[dict[str, Any]]] = {}
    for check in ("run-gates", "audit-governance"):
        for name in sorted(counts.get(check) or {}):
            counted = counts[check][name]
            if counted["sampled"] >= counted["reported"] or (check, name) in timed_out:
                continue
            row: dict[str, Any] = {
                "check": check, "subcheck": name, "command": None, "reported": counted["reported"],
                "sampled": counted["sampled"], "keyed": False, "case": "no_export", "reason": "", "exported": None,
            }
            rows.append(row)
            if isinstance(argv_map, str):
                row["reason"] = f"what it runs could not be read from scripts/pm-plans-verify.py ({argv_map})"
                continue
            argv = argv_map.get((check, name))
            if not argv:
                row["reason"] = "scripts/pm-plans-verify.py names no command for it"
                continue
            row["command"] = argv[0]
            if argv[0] not in EXPORT_COMMANDS:
                row["reason"] = (f"{argv[0]} writes no complete export: {NO_EXPORT_COMMANDS[argv[0]]}"
                                 if argv[0] in NO_EXPORT_COMMANDS else
                                 f"{argv[0]} is not among the commands read to write a complete export")
                continue
            if baseline_checks is not None:
                was = ((baseline_checks.get(check) or {}).get("subchecks") or {}).get(name) or {}
                if keyed_rows(was) < int(was.get("reported", 0)):
                    row["case"] = "baseline_sample"
                    row["reason"] = (f"the baseline printed {int(was.get('sampled', 0))} of its "
                                     f"{int(was.get('reported', 0))} and recorded no export, so it holds no complete "
                                     "rows to compare an export with")
                    continue
            planned.setdefault(tuple(argv), []).append(row)

    exported: dict[tuple[str, str], list[dict[str, Any]]] = {}
    commands = Counter(argv[0] for argv in planned)
    for argv in sorted(planned):
        result = run_export(root, list(argv), timeout_seconds)
        if keep_dir is not None:
            unique = commands[argv[0]] == 1
            keep_export(keep_dir, argv[0] if unique else f"{argv[0]}-{hashlib.sha256(' '.join(argv).encode()).hexdigest()[:8]}",
                        list(argv), result)
        report = result.get("report")
        failures = report.get("failures") if isinstance(report, dict) else None
        # The export's own subcheck killed at a bound: what it would have written is unknown.
        stalled = isinstance(failures, list) and any(
            isinstance(failure, dict) and failure.get("error") in INFRASTRUCTURE_ERRORS for failure in failures)
        for row in planned[argv]:
            row["elapsed_seconds"] = result.get("elapsed_seconds")
            if result.get("timed_out") or stalled:
                row["case"] = "export_timeout"
                row["reason"] = f"its export ({argv[0]}) did not finish within {timeout_seconds} s"
            elif not isinstance(failures, list):
                row["case"] = "export_unreadable"
                row["reason"] = f"its export ({argv[0]}) could not be read: {result.get('error')}"
            elif len(failures) != row["reported"]:
                row["case"], row["exported"] = "total_mismatch", len(failures)
                row["reason"] = (f"its export ({argv[0]}) holds {len(failures)} rows, but the printed total is "
                                 f"{row['reported']}")
            else:
                row["case"], row["exported"], row["keyed"] = "keyed", len(failures), True
                row["reason"] = f"its export ({argv[0]}) holds all {len(failures)} rows, the printed total"
                key = (row["check"], row["subcheck"])
                exported[key] = [normalize(row["check"], row["subcheck"], failure, root) for failure in failures]
                counts[row["check"]][row["subcheck"]]["exported"] = len(failures)
    return exported, rows


def replace_rows(
    items: list[dict[str, Any]],
    exported: dict[tuple[str, str], list[dict[str, Any]]],
) -> list[dict[str, Any]]:
    """`items` with the printed rows of every subcheck keyed from its export replaced, where they stood,
    by the export's rows."""
    out: list[dict[str, Any]] = []
    done: set[tuple[str, str]] = set()
    for item in items:
        key = (item["check"], item["subcheck"])
        if key not in exported:
            out.append(item)
        elif key not in done:
            out.extend(exported[key])
            done.add(key)
    for key in sorted(set(exported) - done):
        out.extend(exported[key])
    return out


def describe_export_commands(width: int = 150) -> list[str]:
    """The run header's list of the commands whose report is a complete export, and of those whose report
    is not (the exports brief)."""
    wrap = dict(width=width, subsequent_indent="      ", break_on_hyphens=False, break_long_words=False)
    lines = textwrap.wrap(
        f"  complete exports, read in scripts/pm-plans-verify.py: the report each of these {len(EXPORT_COMMANDS)} "
        "commands writes with --report holds every row it counts, so a subcheck that runs one and prints only a "
        "sample is keyed from it when its total equals the printed total: " + ", ".join(sorted(EXPORT_COMMANDS)),
        **wrap)
    for command, why in sorted(NO_EXPORT_COMMANDS.items()):
        lines += textwrap.wrap(f"    no complete export: {command}, because {why}", **wrap)
    return lines


def describe_export(row: dict[str, Any], fallback: str = "the truncated rule applies") -> str:
    """One line per subcheck that prints only a sample: keyed from its export, with what its rows are, or
    why not, and what follows from that (`fallback`)."""
    head = (f"    [{'keyed' if row['keyed'] else 'not keyed':<9}] {row['check']}/{row['subcheck']} "
            f"({row['sampled']} of {row['reported']} printed): {row['reason']}")
    if not row["keyed"]:
        return f"{head}; {fallback}"
    classes = row.get("classes") or {}
    return head + (": " + ", ".join(f"{count} {name}" for name, count in classes.items()) if classes else "")


# ---------------------------------------------------------------------------------------- output


def plural(count: int, word: str) -> str:
    return f"{count} {word}" + ("" if count == 1 else "s")


def item_tag(item: dict[str, Any], on_branch: bool) -> str:
    """What a reported failure is: staleness, pre-existing or improved (rule 2), blocking, or new."""
    if item["stale"]:
        return "staleness"
    if item.get("standing"):
        return item["standing"]
    return "blocking" if on_branch else "new"


def describe(item: dict[str, Any], tag: str, width: int = 150) -> str:
    """One line per failure. Only the trailing fields are cut to fit, never the identity or the
    baseline and branch counts that rule 2 reports."""
    where = item["path"] or "(no path)"
    counted = f"  {item['baseline_count']} -> {item['count']}" if item.get("standing") else ""
    head = f"  [{tag:<12}] {item['check']}/{item['subcheck'] or '-'}  {item['error']}  {where}{counted}"
    fields = canonical(item["fields"])
    room = width - len(head) - 2
    if len(fields) > room:
        fields = fields[: max(room - 3, 0)] + "..."
    return f"{head}  {fields}"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--root", default=str(ROOT), help="repository root (default: this checkout)")
    parser.add_argument("--base", default="origin/main", help="revision this branch is measured against")
    parser.add_argument("--baseline", default=DEFAULT_BASELINE, help=f"baseline file (default: {DEFAULT_BASELINE})")
    parser.add_argument("--record-baseline", action="store_true", help="run the three checks and write the baseline")
    parser.add_argument("--run-dir", default=None, help="plan-migration run directory (default: the current run)")
    parser.add_argument("--max-fingerprints", type=int, default=200, help="largest bucket the baseline enumerates")
    parser.add_argument("--subcheck-timeout-seconds", type=int, default=DEFAULT_SUBCHECK_TIMEOUT_SECONDS,
                        help="passed to the aggregate checks; a subcheck still running at this bound is "
                             f"killed and reported as an infrastructure result (default: "
                             f"{DEFAULT_SUBCHECK_TIMEOUT_SECONDS})")
    parser.add_argument("--json", action="store_true", help="print the machine-readable report instead of the summary")
    parser.add_argument("--allow-sparse", action="store_true",
                        help="run on a sparse worktree anyway; everything outside the cone reads as missing")
    parser.add_argument("--keep-check-reports", default=None, metavar="DIR",
                        help="also keep each check's full report, every row it printed, as DIR/<check>.json, "
                             "so the run can be replayed exactly; DIR must be outside the repository")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    baseline_path = Path(args.baseline)
    if not baseline_path.is_absolute():
        baseline_path = root / baseline_path

    sparse = sparse_paths(root)
    if sparse and not args.allow_sparse:
        print(f"pm-landing-check: this worktree is sparse, limited to: {', '.join(sparse)}", file=sys.stderr)
        print("pm-landing-check: the three checks read the whole tree, so every file outside that set "
              "reads as missing and is reported as a failure of yours. Run this in the shared checkout "
              "at landing, or here after `git sparse-checkout disable`. Pass --allow-sparse to run it "
              "on this tree anyway.", file=sys.stderr)
        return 3

    keep_dir: Path | None = None
    if args.keep_check_reports:
        keep_dir = Path(args.keep_check_reports).resolve()
        if keep_dir == root or root in keep_dir.parents:
            print("pm-landing-check: --keep-check-reports must name a directory outside the repository; "
                  "nothing is written inside it.", file=sys.stderr)
            return 3
        try:
            keep_dir.mkdir(parents=True, exist_ok=True)
        except OSError as exc:
            print(f"pm-landing-check: cannot create {keep_dir}: {exc}", file=sys.stderr)
            return 3

    try:
        run_dir = args.run_dir or current_run_dir(root)
    except Exception as exc:  # noqa: BLE001
        print(f"pm-landing-check: cannot resolve the plan-migration run: {exc}", file=sys.stderr)
        return 3

    # In compare mode the baseline and the branch paths are read before the checks run: they take
    # about ten minutes, and a missing baseline or an unknown base should say so at once.
    baseline: dict[str, Any] = {}
    touched: list[str] = []
    currency: dict[str, Any] = {}
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
        currency = baseline_currency(root, baseline.get("commit"), args.base)

    items: list[dict[str, Any]] = []
    counts: dict[str, dict[str, dict[str, int]]] = {}
    listed: dict[str, dict[str, int]] = {}
    statuses: dict[str, str] = {}
    # Review L-07: whether both aggregates ran the same validator code at the same commit.
    before = None if args.record_baseline else tree_state(root)
    after = None
    for check in CHECKS:
        try:
            report = run_check(check, root, run_dir, args.subcheck_timeout_seconds)
        except RuntimeError as exc:
            print(f"pm-landing-check: {exc}", file=sys.stderr)
            return 3
        if keep_dir is not None:
            (keep_dir / f"{check}.json").write_text(
                json.dumps(report, indent=1, sort_keys=True) + "\n", encoding="utf-8")
        statuses[check] = str(report.get("status", "unknown"))
        check_items, check_counts = extract(check, report, root)
        items.extend(check_items)
        counts[check] = check_counts
        listed[check] = listed_totals(check, report)
        if check == "audit-governance" and before is not None:
            after = tree_state(root)

    commit = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=root, capture_output=True, text=True
    ).stdout.strip()

    infrastructure, items = split_infrastructure(items)
    for row in infrastructure:
        row["limit_seconds"] = args.subcheck_timeout_seconds
    timed_out = {(row["check"], row["subcheck"]) for row in infrastructure}

    if args.record_baseline and infrastructure:
        # A baseline describes what each subcheck reports on main; a subcheck that was killed reported
        # nothing, and recording it as passing or as failing once would mislead every later landing.
        print("pm-landing-check: not recording a baseline: these subchecks did not finish, so what "
              "they report is unknown:", file=sys.stderr)
        for row in infrastructure:
            print(describe_infrastructure(row), file=sys.stderr)
        print(f"pm-landing-check: rerun with a --subcheck-timeout-seconds above "
              f"{args.subcheck_timeout_seconds}.", file=sys.stderr)
        return 3

    # The exports brief: a run-gates or audit-governance subcheck that prints only a sample is keyed from
    # the complete report its command writes, when that report's total equals the printed total and the
    # baseline holds its rows in full. A baseline is recorded from exports too, so that landings can be.
    sampled = {check: {name for name, counted in (counts.get(check) or {}).items()
                       if counted["sampled"] < counted["reported"]}
               for check in ("run-gates", "audit-governance")}
    argv_map: dict[tuple[str, str], list[str]] | str = {}
    if any(sampled.values()):
        try:
            argv_map = aggregate_subcheck_argv(root, sampled, args.subcheck_timeout_seconds)
        except Exception as exc:  # noqa: BLE001 - an unreadable map only means that nothing is keyed from an export.
            argv_map = f"{type(exc).__name__}: {exc}"
    exported, export_rows = key_from_exports(
        root, counts, None if args.record_baseline else (baseline.get("checks") or {}), timed_out, argv_map,
        args.subcheck_timeout_seconds, keep_dir)

    if args.record_baseline:
        untracked = untracked_check_inputs(root)
        doc = build_baseline(commit, run_dir, items, counts, statuses, args.max_fingerprints, untracked,
                             [item for key in sorted(exported) for item in exported[key]])
        baseline_path.parent.mkdir(parents=True, exist_ok=True)
        baseline_path.write_text(json.dumps(doc, indent=1, sort_keys=True) + "\n", encoding="utf-8")
        print(f"pm-landing-check: baseline written to {baseline_path.relative_to(root)} at commit {commit}")
        for check in CHECKS:
            entry = doc["checks"][check]
            print(f"  {check:24s} {entry['status']:5s} {entry['failure_total']:7d} failures "
                  f"in {plural(len(entry['subchecks']), 'check')}")
        print(f"  buckets: {len(doc['buckets'])}, "
              f"of which {sum(1 for row in doc['buckets'] if row['fingerprints'] is None)} matched by count only")
        for line in describe_export_commands():
            print(line)
        print(f"  export buckets: {len(doc['export_buckets'])}, the complete rows of "
              f"{plural(len(exported), 'subcheck')} keyed from their export")
        for row in export_rows:
            print(describe_export(row, "the baseline records only its printed sample, so landings keep the "
                                       "truncated rule for it"))
        if untracked:
            print("  recorded with these gitignored inputs present: " + ", ".join(sorted(untracked)))
        return 0

    keyed_now = set(exported)
    items = replace_rows(items, exported)
    baseline_checks = baseline.get("checks") or {}
    current_partial = {(check, name) for check in counts for name, counted in counts[check].items()
                       if keyed_rows(counted) < counted["reported"]}
    # A subcheck the baseline recorded from its export is compared with those complete rows wherever this
    # run keys every one of its failures too; where it is a sample now, the printed samples are compared,
    # as before, because the baseline keeps its printed rows as well.
    from_export = {
        (check, name)
        for check, entry in baseline_checks.items()
        for name, counted in ((entry or {}).get("subchecks") or {}).items()
        if int(counted.get("sampled", 0)) < int(counted.get("reported", 0)) <= int(counted.get("exported", 0) or 0)
    } - current_partial - timed_out
    known, baseline_counts = baseline_index(baseline, from_export)
    direct, derived = split_touched(touched)
    tokens = path_tokens(direct)
    units = units_of_touched_docs(root, direct)
    # A subcheck that timed out has no total to compare, so it is left out of every comparison.
    compared = {
        check: {name: counted for name, counted in counts[check].items() if (check, name) not in timed_out}
        for check in counts
    }
    # Review L-07: a run-gates copy judged by its complete audit-governance copy is taken out of the
    # judgement: its rows are the same failures the audit-governance rows list in full, and its total
    # is not used for growth. The baseline keeps both copies, for a landing where they do not pair.
    names = {
        check: set(listed.get(check) or {}) | set(counts.get(check) or {})
        | set(((baseline.get("checks") or {}).get(check) or {}).get("subchecks") or {})
        for check in ("run-gates", "audit-governance")
    }
    try:
        commands: dict[tuple[str, str], str] | str = aggregate_subcheck_commands(
            root, names, args.subcheck_timeout_seconds)
    except Exception as exc:  # noqa: BLE001 - an unreadable map only means that no copy is paired.
        commands = f"{type(exc).__name__}: {exc}"
    pairs = pair_validators(counts, listed, baseline.get("checks") or {}, timed_out, items, commands,
                            version_change(before, after), keyed_now | from_export)
    paired = {("run-gates", row["run_gates"]) for row in pairs if row["paired"]}
    items = [item for item in items if (item["check"], item["subcheck"]) not in paired]
    compared = {
        check: {name: counted for name, counted in compared[check].items() if (check, name) not in paired}
        for check in compared
    }
    partial = partial_subchecks(compared, baseline.get("checks") or {})

    run_counts = bucket_counts(items)
    rule_two = currency["rule_two_applies"]
    new_items: list[dict[str, Any]] = []
    on_branch: list[dict[str, Any]] = []
    pre_existing: list[dict[str, Any]] = []
    changed_on_branch = 0
    seen_buckets: dict[str, int] = {}
    for item in items:
        name = bucket_of(item)
        fresh = False
        if (item["check"], item["subcheck"]) not in partial:
            seen_buckets[name] = seen_buckets.get(name, 0) + 1
            fingerprints = known.get(name, set())
            fresh = fingerprints is not None and item["key"].rsplit("|", 1)[1] not in fingerprints
        # Rule 2: a failure that is not staleness, in a bucket the baseline holds whose count has not
        # risen, is pre-existing, content changed or not. It never blocks and is reported with both
        # counts whenever it would have been reported at all: on a branch file, or with new content.
        # Only against a current baseline; against a stale one every failure is judged as before.
        standing = (None if item["stale"] or not rule_two
                    else standing_of(run_counts[name], baseline_counts.get(name)))
        counted = (
            {"standing": standing, "baseline_count": baseline_counts[name], "count": run_counts[name]}
            if standing else {}
        )
        hits = names_branch_path(item, tokens, root, units)
        # What the row is, for the line of a subcheck keyed from its export.
        item["_class"] = ("staleness" if item["stale"] else standing if standing else "blocking" if hits
                          else "new" if fresh else "in a baseline bucket")
        if fresh and not standing:
            new_items.append(item)
        if standing and (fresh or hits):
            pre_existing.append({**public(item), **counted, "branch_paths": hits})
            # Same bucket count, different content, on a file the branch touched: the brief's rule
            # excuses it, but it may be one failure fixed and another added. Say so.
            changed_on_branch += 1 if (fresh and hits) else 0
        if hits:
            on_branch.append({**public(item), "branch_paths": hits, **counted})

    for row in export_rows:
        if row["keyed"]:
            tally = Counter(item["_class"] for item in items
                            if (item["check"], item["subcheck"]) == (row["check"], row["subcheck"]))
            row["classes"] = dict(sorted(tally.items(), key=lambda pair: (-pair[1], pair[0])))

    grown = grown_buckets(seen_buckets, baseline_counts)
    subcheck_growth = grown_subchecks(compared, baseline.get("checks") or {})
    for row in subcheck_growth:
        row["stale"] = readiness_counter_is_staleness(row, items, run_counts, baseline_counts,
                                                      {item["key"] for item in on_branch})
    resolved = sorted(
        name for name in set(baseline_counts) - set(seen_buckets)
        if bucket_subcheck(name) not in partial and bucket_subcheck(name) not in timed_out
        and bucket_subcheck(name) not in paired
    )

    reported_keys = (
        {item["key"] for item in new_items}
        | {item["key"] for item in on_branch}
        | {item["key"] for item in pre_existing}
    )
    reported = [item for item in items if item["key"] in reported_keys]
    blocking = blocking_items(on_branch, grown, subcheck_growth)

    if args.json:
        if not rule_two:
            # The report itself is the JSON below, whose `baseline_currency` says the same; this is
            # for the lander reading the terminal.
            for line in stale_baseline_notice(currency):
                print(line, file=sys.stderr)
        print(json.dumps(
            {
                "schema_id": "pm.landing_check.report.v1",
                "baseline_currency": currency,
                "branch_units": len(units),
                "derived_paths_excluded": derived,
                "subchecks_compared_by_total_only": sorted(f"{c}/{s}" for c, s in partial - paired),
                "validator_pairs": pairs,
                "exports": {
                    "complete_export_commands": sorted(EXPORT_COMMANDS),
                    "no_complete_export": dict(sorted(NO_EXPORT_COMMANDS.items())),
                    "subchecks": export_rows,
                    "compared_with_baseline_exports": sorted(f"{c}/{s}" for c, s in from_export - keyed_now),
                },
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
                "pre_existing": pre_existing,
                "grown_buckets": grown,
                "grown_subchecks": subcheck_growth,
                "excused_by_kind": excused_by_kind(on_branch),
                "resolved_buckets": resolved,
                "infrastructure": infrastructure,
                "subcheck_timeout_seconds": args.subcheck_timeout_seconds,
                "kept_check_reports": str(keep_dir) if keep_dir else None,
                "blocking": len(blocking),
            },
            indent=1,
            sort_keys=True,
        ))
    else:
        if not rule_two:
            for line in stale_baseline_notice(currency):
                print(line)
        print(f"pm-landing-check: baseline {baseline_path.relative_to(root)} recorded at "
              f"{str(baseline.get('commit'))[:12]}; this checkout is at {commit[:12]}")
        if rule_two:
            print(f"  the baseline is current, so rule 2 applies: {currency['reason']}")
        for check in CHECKS:
            total = sum(c["reported"] for c in counts[check].values())
            was = baseline.get("checks", {}).get(check, {}).get("failure_total", 0)
            infra = sum(1 for row in infrastructure if row["check"] == check)
            note = f", {plural(infra, 'infrastructure result')} among them" if infra else ""
            print(f"  {check:24s} {statuses[check]:5s} {total:7d} failures (baseline {was}){note}")
        print(f"  branch paths from git diff --name-only {args.base}..HEAD: {len(touched)}")
        if keep_dir is not None:
            print(f"  full check reports kept in {keep_dir}")
        for line in describe_export_commands():
            print(line)
        if export_rows:
            keyed_count = sum(1 for row in export_rows if row["keyed"])
            one = len(export_rows) == 1
            print(f"  {plural(len(export_rows), 'subcheck')} {'prints' if one else 'print'} only a sample of "
                  f"{'its' if one else 'their'} failures in this run; {keyed_count} of them "
                  f"{'is' if keyed_count == 1 else 'are'} keyed from the export of {'its' if one else 'their'} "
                  "command (the exports brief):")
            for row in export_rows:
                print(describe_export(row))
        if from_export - keyed_now:
            print("  compared with the complete rows the baseline recorded from their export, since they print every "
                  "failure now: " + ", ".join(sorted(f"{c}/{s}" for c, s in from_export - keyed_now)))
        truncated = [
            f"{check}/{name}" for check in CHECKS for name in sorted(counts[check])
            if keyed_rows(counts[check][name]) < counts[check][name]["reported"] and (check, name) not in paired
        ]
        if truncated:
            hidden = sum(
                counts[check][name]["reported"] - keyed_rows(counts[check][name])
                for check in CHECKS for name in counts[check] if (check, name) not in paired
            )
            print(f"  {len(truncated)} subchecks print only part of their failures: "
                  f"{hidden} failures are never keyed, and the on-branch match runs over the rest")
            print(f"  {len(partial - paired)} subchecks are compared by their total only, because which rows "
                  f"they print can change on its own")
        if pairs:
            judged = sum(1 for row in pairs if row["paired"])
            sample = "prints only a sample of its" if len(pairs) == 1 else "print only a sample of their"
            print(f"  {plural(len(pairs), 'run-gates subcheck')} {sample} failures, now or in the baseline; "
                  f"{judged} of them {'is' if judged == 1 else 'are'} judged by the audit-governance copy of "
                  "the same validator, which prints every failure (review L-07):")
            for row in pairs:
                print(describe_pair(row))
        if derived:
            print(f"  {len(derived)} regenerated files are matched on the units they name, "
                  f"not on their own paths ({len(units)} units owned by documents this branch changed)")
        print()
        on_branch_keys = {item["key"] for item in on_branch}
        print(f"New since the baseline: {len(new_items)}")
        for item in new_items[:40]:
            print(describe(item, item_tag(item, item["key"] in on_branch_keys)))
        if len(new_items) > 40:
            print(f"  ... {len(new_items) - 40} more")
        off = "" if rule_two else " (rule 2 is off: the baseline is stale, see the first lines)"
        print(f"Pre-existing, in a baseline bucket whose count has not risen (never blocks): {len(pre_existing)}{off}")
        if pre_existing:
            # Rule 2 counts against the baseline's commit, not main: a failure main fixed after that
            # commit and this branch brings back reads as pre-existing.
            print(f"  counted against the baseline recorded at {str(baseline.get('commit'))[:12]}, not against "
                  "main: a failure main fixed after that commit and this branch brings back reads as pre-existing")
        for item in pre_existing[:40]:
            where = f"  (names {', '.join(item['branch_paths'])})" if item["branch_paths"] else "  (content changed)"
            print(describe(item, item_tag(item, bool(item["branch_paths"]))) + where)
        if len(pre_existing) > 40:
            print(f"  ... {len(pre_existing) - 40} more")
        print(f"Checks whose failure count rose: {len(grown)}")
        for row in grown[:40]:
            print(f"  [{'staleness' if row['stale'] else 'blocking '}] {row['bucket']}  "
                  f"{row['baseline_count']} -> {row['count']}")
        print(f"Subchecks reporting more failures than the baseline: {len(subcheck_growth)}")
        for row in subcheck_growth[:40]:
            if row["stale"]:
                tag = "staleness"
                note = (" (the readiness growth counter: its printed rows show stale readiness rows "
                        "growing on this branch's files and nothing else new)")
            elif row["truncated"]:
                tag = "blocking "
                note = f" (only {row['sampled']} of {row['reported']} are printed, so what was added cannot be matched)"
            elif row.get("keyed_from_export"):
                tag = "keyed    "
                note = " (keyed from its export: every row is judged above, so the rise itself stops nothing)"
            else:
                tag = "off-branch"
                note = ""
            print(f"  [{tag}] {row['check']}/{row['subcheck'] or '-'}  "
                  f"{row['baseline_reported']} -> {row['reported']}{note}")
        print(f"Naming a path this branch touches: {len(on_branch)}")
        excused = excused_by_kind(on_branch)
        if excused:
            print(f"  of which excused as governance staleness, by kind ({sum(excused.values())} in total):")
            for kind, count in excused.items():
                print(f"      {count:7d}  {kind}")
        pre_on_branch = sum(1 for item in on_branch if item.get("standing"))
        if pre_on_branch:
            print(f"  of which pre-existing or improved, listed above: {pre_on_branch}")
        for item in on_branch[:40]:
            print(describe(item, item_tag(item, True)))
        if len(on_branch) > 40:
            print(f"  ... {len(on_branch) - 40} more")
        print(f"Infrastructure results, not failures of this tree (never new, growth or blocking): "
              f"{len(infrastructure)}")
        for row in infrastructure:
            print(describe_infrastructure(row))
        print(f"Gone since the baseline (nothing to do): {len(resolved)}")
        print()
        if not reported and not grown and not subcheck_growth:
            if infrastructure:
                print("Nothing reported by the subchecks that finished. This is not a clean result: the "
                      "subchecks named below did not finish, so the run was not fully verified and exits 1, "
                      "not 0.")
            else:
                print("Nothing to report. The three checks found only what the baseline already knew.")
        elif not blocking:
            advice = []
            if any(item["stale"] for item in on_branch):
                advice.append("governance staleness for what this branch edited, so ask the Plans agent for a reseal")
            if pre_existing and changed_on_branch:
                advice.append(f"pre-existing failures whose count has not risen, {changed_on_branch} of them "
                              "with changed content on files this branch touched, so compare those with the "
                              "baseline's rows: the same count can hide one failure fixed and another added")
            elif pre_existing:
                advice.append("pre-existing failures whose count has not risen, so nothing for this branch to fix")
            if any(item["key"] not in {other["key"] for other in on_branch} for item in new_items):
                advice.append("new but names no file this branch touched, so report it to Jared")
            if any(row["stale"] for row in subcheck_growth):
                advice.append("the readiness growth counter of stale readiness rows, so ask for a reseal")
            if any(not row["stale"] and not row.get("keyed_from_export") for row in subcheck_growth):
                advice.append("a subcheck that reports more than the baseline, with every failure still printed")
            if any(not row["stale"] and row.get("keyed_from_export") for row in subcheck_growth):
                advice.append("a subcheck that reports more than the baseline, with every failure keyed from its "
                              "export")
            print("Nothing reported stops the landing: it is " + "; and ".join(advice) + ".")
        else:
            print(f"{plural(len(blocking), 'item')} the baseline does not excuse. Fix them on this branch.")
        if infrastructure:
            ran = ", ".join(
                f"{row['check']}/{row['subcheck'] or '-'} "
                + (f"killed after {row['elapsed_seconds']} s" if row["elapsed_seconds"] is not None
                   else "killed at the limit")
                for row in infrastructure)
            print(f"{plural(len(infrastructure), 'subcheck')} did not finish within "
                  f"{args.subcheck_timeout_seconds} s, the limit ({ran}), so what they would report is "
                  "unknown and this run was not fully verified: it cannot exit 0, and it exits 1 unless "
                  "something above stops the landing. Rerun each on its own and judge what it reports by "
                  "the same rules before pushing main.")

    return exit_code(reported, grown, subcheck_growth, blocking, infrastructure)


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
